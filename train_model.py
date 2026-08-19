import os
import joblib
import pandas as pd
from fastapi import FastAPI, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import train_test_split
from sklearn.tree import _tree

app = FastAPI()

# Enable CORS for Express / React
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# Global status tracker
training_status = {
    "status": "idle",
    "accuracy": None,
    "totalRows": 0
}

# Global trained model + feature list (for /tree endpoint)
trained_model = None
feature_names = []

TREE_EXPORT_MAX_DEPTH = 6

class TrainRequest(BaseModel):
    data_url: str

# Aap ka updated ML logic function
def train_model_from_url(data_url: str):
    global training_status, trained_model, feature_names
    try:
        training_status["status"] = "processing"
        
        df = pd.read_csv(data_url)
        
        # ⚠️ FIX 1: Save filled values back to column
        df["TotalCharges"] = pd.to_numeric(df["TotalCharges"], errors="coerce")
        df["TotalCharges"] = df["TotalCharges"].fillna(df["TotalCharges"].median())
        
        df["Churn"] = df["Churn"].map({"Yes": 1, "No": 0})
        
        features = ["tenure", "MonthlyCharges", "TotalCharges"]
        X = df[features]
        y = df["Churn"]
        
        X_train, X_test, y_train, y_test = train_test_split(
            X, y, test_size=0.2, random_state=30
        )
        
        model = RandomForestClassifier(n_estimators=100, random_state=42)
        model.fit(X_train, y_train)
        
        accuracy = model.score(X_test, y_test)
        
        model_filename = "real_churn_model.joblib"
        joblib.dump(
            {
                "model": model,
                "features": features,
                "accuracy": round(accuracy * 100, 2),
                "totalRows": len(df),
            },
            model_filename,
        )
        
        # Keep reference in memory so /tree can read it
        trained_model = model
        feature_names = features
        
        # Update global state for FastAPI response
        training_status["status"] = "completed"
        training_status["accuracy"] = round(accuracy * 100, 2)
        training_status["totalRows"] = len(df)
        
    except Exception as e:
        training_status["status"] = f"failed: {str(e)}"

# Load a previously saved model so /tree works after a restart
def load_saved_model():
    global trained_model, feature_names
    if not os.path.exists("real_churn_model.joblib"):
        return
    try:
        payload = joblib.load("real_churn_model.joblib")
        if isinstance(payload, dict):
            trained_model = payload["model"]
            feature_names = payload["features"]
            training_status["accuracy"] = payload.get("accuracy")
            training_status["totalRows"] = payload.get("totalRows", 0)
        else:
            # Backwards-compatible with old single-model files
            trained_model = payload
            feature_names = ["tenure", "MonthlyCharges", "TotalCharges"]
        training_status["status"] = training_status["status"] or "completed"
    except Exception as e:
        training_status["status"] = f"failed loading saved model: {str(e)}"


load_saved_model()

# Convert one tree of the RandomForest into a JSON-safe dict
def export_tree_node(tree_obj, node, feature_names, depth):
    node_data = {
        "samples": int(tree_obj.n_node_samples[node]),
        "value": tree_obj.value[node].tolist(),
    }
    if tree_obj.feature[node] == _tree.TREE_UNDEFINED:
        # Leaf node
        node_data["leaf"] = True
        return node_data
    if depth >= TREE_EXPORT_MAX_DEPTH:
        # Truncate to keep the visualisation readable
        node_data["leaf"] = True
        node_data["truncated"] = True
        return node_data
    node_data.update({
        "feature": feature_names[tree_obj.feature[node]],
        "threshold": round(float(tree_obj.threshold[node]), 3),
        "impurity": round(float(tree_obj.impurity[node]), 4),
        "left": export_tree_node(tree_obj, tree_obj.children_left[node], feature_names, depth + 1),
        "right": export_tree_node(tree_obj, tree_obj.children_right[node], feature_names, depth + 1),
    })
    return node_data

# FastAPI Endpoints for Express Gateway
@app.post("/train")
def start_training(request: TrainRequest, background_tasks: BackgroundTasks):
    background_tasks.add_task(train_model_from_url, request.data_url)
    return {"message": "Training started successfully"}

@app.get("/status")
def get_status():
    return training_status

@app.get("/tree")
def get_tree():
    if trained_model is None:
        return {"error": "No trained model available. Run /train first."}
    first_tree = trained_model.estimators_[0].tree_
    return {
        "tree": export_tree_node(first_tree, 0, feature_names, 0),
        "maxDepthShown": TREE_EXPORT_MAX_DEPTH,
        "nEstimators": len(trained_model.estimators_)
    }