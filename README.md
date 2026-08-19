<div align="center">

# 🔥 Churn Detection Model

### 🧠 ML-Powered Customer Churn Prediction Platform

![Learning Purpose](https://img.shields.io/badge/Purpose-Learning-brightgreen)
![FastAPI](https://img.shields.io/badge/ML-FastAPI-009688)
![Express](https://img.shields.io/badge/API-Express-000000)
![React](https://img.shields.io/badge/UI-React-61DAFB)
![Docker](https://img.shields.io/badge/Infra-Docker-2496ED)

_Built to learn Microservices Architecture, ML integration & full-stack deployment_

</div>

---

## 📖 Description

**Churn Detection Model** is a full-stack microservices application that trains a **Random Forest** classifier on customer data and **visualizes the decision tree** that drives churn predictions.

Paste a raw CSV URL (e.g. a Telco Churn dataset), and the platform will:

- 🔄 Train a machine learning model in the background
- 📊 Show **live training status** with accuracy & row counts
- 🌳 Render an **SVG decision tree** visualization of the first tree in the forest

The whole system runs as **3 isolated microservices** orchestrated with Docker Compose.

---

## 🏗️ Architecture

```
┌────────────────────┐      /api       ┌────────────────────┐    HTTP    ┌────────────────────┐
│   React Frontend    │ ──────────────▶ │    Express         │ ─────────▶ │   FastAPI ML        │
│   (Vite + nginx)    │                 │    Gateway :5000    │            │   Engine :8000      │
│        :80          │                 └────────────────────┘            │   Random Forest     │
└────────────────────┘                                                   └────────────────────┘
```

| Service | Technology | Port |
|---------|------------|------|
| 🐳 FastAPI ML Engine | Python, scikit-learn, pandas | `8000` |
| 🚪 Express Gateway | Node.js, axios | `5000` |
| 🎨 React Frontend | React 19, Vite, Tailwind, Zustand | `80` |

---

## ✨ Features

- 🐍 **ML Engine (FastAPI)** — Trains a `RandomForestClassifier` on the fly from any CSV URL
- ⚡ **Async Training** — Model training runs as a background task so the API stays responsive
- 📡 **Live Status API** — Poll `/status` for real-time accuracy, progress & row counts
- 🌲 **Tree Visualization** — `/tree` exports the first decision tree as JSON and the React app renders it as interactive SVG (depth capped at 6 for readability)
- 🚪 **Express API Gateway** — Single entry point that proxies requests to the ML microservice
- 📊 **Live Stats Dashboard** — Accuracy bar, total rows & decision tree readiness cards
- ✅ **Health Check** — Frontend shows backend online/offline status from `/api/health`
- 🍃 **Zustand State** — Clean global state management for training data & API responses
- 🐳 **One-Command Docker** — 3 services wired together via a private Docker network
- 🎨 **Modern UI** — Splash screen, animated logo & Tailwind CSS styling

---

## 🚀 Clone & Start the Project

### Prerequisites

- [Docker](https://www.docker.com/products/docker-desktop) (recommended)
- [Node.js](https://nodejs.org) ≥ 18 (for local dev)
- [Python](https://www.python.org) ≥ 3.10 (for local dev)

### Option 1 — Docker Compose (Fastest)

```bash
# 1. Clone the repository
clone from the link 
cd churn-detection-model

# 2. Start all 3 services
docker compose up --build
```

Then open **http://localhost** 🎉

### Option 2 — Run Locally (Dev Mode)

**Terminal 1: FastAPI ML Engine**
```bash
cd churn-detection-model
pip install -r requirements.txt
uvicorn train_model:app --reload --port 8000
```

**Terminal 2: Express Gateway**
```bash
cd backend
npm install
npm run dev
```

**Terminal 3: React Frontend**
```bash
cd frontend
npm install
npm run dev
```

Then open **http://localhost:5173** (Vite dev server proxies `/api` to the Express gateway).

### 🧪 How to Use

1. Open the app → click **Start**
2. Paste a raw CSV dataset URL into the form

   > e.g. `https://raw.githubusercontent.com/IBM/telco-customer-churn-on-icp4d/master/data/Telco-Customer-Churn.csv`

3. Click **Start Training**
4. Watch the live status — when training completes, the decision tree appears below

---

## 🧗 Challenges

- 🔀 **Multi-service orchestration** — Connecting FastAPI, Express & React over a shared Docker network with proper CORS setup
- ⏳ **Async training flow** — Training happens in the background, so the frontend polls a `/status` endpoint instead of blocking on a request
- 🌳 **Tree visualization at scale** — Large Random Forest trees are unreadable as SVG; capped export depth at 6 and color-coded every node by churn probability
- 📦 **Real-time state sync** — Syncing training progress, accuracy & tree data between backend and UI with Zustand
- 📄 **Dynamic CSV input** — The model assumes standard column names (`tenure`, `MonthlyCharges`, `TotalCharges`, `Churn`), so arbitrary datasets need preprocessing
- 🗂️ **Container builds** — Nailing down nginx SPA fallback + `/api` reverse proxy inside the frontend container

---

## 📁 Project Structure

```
churn-detection-model/
├── train_model.py            # FastAPI ML engine (training + endpoints)
├── requirements.txt          # Python dependencies
├── Dockerfile                # FastAPI image
├── docker-compose.yml        # 3-service orchestrator
├── backend/                  # Express API gateway
│   ├── app.js                # Server entry
│   └── src/
│       ├── route/Route.js    # /health /train /status /tree
│       └── controller/       # Gateway logic
└── frontend/                 # React + Vite UI
    ├── nginx.conf            # SPA fallback + /api proxy
    └── src/
        ├── Screen/           # Splash & Main screens
        ├── Components/       # InputForm, StatusCard, Tree, Navbar
        ├── Services/axios.js # Axios instance
        └── zustand/          # Global state
```

---

## 📡 API Reference

| Method | Endpoint    | Description                          |
|--------|-------------|--------------------------------------|
| `GET`  | `/api/health` | Health check for the gateway       |
| `POST` | `/api/train` | Start model training (`{ "data_url": "..." }`) |
| `GET`  | `/api/status` | Live training status & accuracy     |
| `GET`  | `/api/tree` | First decision tree of the forest (JSON) |

---

## 📚 Learning Purpose

> ⚠️ This project was built **for learning & demonstration purposes only** — to explore microservices architecture, ML deployment, and full-stack containerization. It is not production-ready and should not be used with real customer data without proper security review.

---

