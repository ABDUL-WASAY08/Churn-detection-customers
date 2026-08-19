import axios from 'axios';

const FASTAPI_URL = process.env.FASTAPI_URL || 'http://127.0.0.1:8000';

export const trainModelController = async (req, res) => {
  try {
    const data_url = req.body.data_url || req.body.data_Url || req.body.dataUrl;

    if (!data_url) {
      return res.status(400).json({
        success: false,
        message: "data_url is required in the request body."
      });
    }

    console.log("📥 Forwarding Dataset URL to FastAPI:", data_url);

    const response = await axios.post(`${FASTAPI_URL}/train`, {
      data_url: data_url
    });

    return res.status(200).json({
      success: true,
      message: "Training triggered on FastAPI ML Engine!",
      data: response.data
    });
  } catch (error) {
    console.error("❌ FastAPI Connection Error:", error.message);
    return res.status(502).json({
      success: false,
      message: "Unable to connect with Python FastAPI Microservice."
    });
  }
};

// 2. Real-time Status & Accuracy Data Fetch Karna
export const getStatusController = async (req, res) => {
  try {
    const response = await axios.get(`${FASTAPI_URL}/status`);
    return res.status(200).json({
      success: true,
      data: response.data
    });
  } catch (error) {
    return res.status(502).json({
      success: false,
      message: "Failed to fetch status from FastAPI."
    });
  }
};

// 3. Decision Tree JSON Na lane ke liye
export const getTreeController = async (req, res) => {
  try {
    const response = await axios.get(`${FASTAPI_URL}/tree`);
    return res.status(200).json({
      success: true,
      data: response.data
    });
  } catch (error) {
    return res.status(502).json({
      success: false,
      message: "Failed to fetch tree from FastAPI."
    });
  }
};
export default { trainModelController, getStatusController, getTreeController }