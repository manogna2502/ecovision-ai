import axios from "axios";

// Set VITE_API_URL in your deployment platform's env vars once deployed.
// Falls back to localhost for local development.
export const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

export const api = axios.create({
  baseURL: API_URL,
  timeout: 30000, // model inference + cold-start on free-tier hosting can be slow
});

export async function getStats() {
  const { data } = await api.get("/api/stats");
  return data;
}

export async function getDetections(limit = 50) {
  const { data } = await api.get("/api/detections", { params: { limit } });
  return data;
}

export async function detectWaste(file) {
  const formData = new FormData();
  formData.append("file", file);
  const { data } = await api.post("/api/detect", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return data;
}

export async function checkHealth() {
  const { data } = await api.get("/api/health");
  return data;
}
