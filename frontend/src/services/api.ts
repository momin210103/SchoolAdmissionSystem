import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use((config) => {
  const studentId = localStorage.getItem("studentId");

  if (studentId) {
    config.headers["X-Student-Id"] = studentId;
  }

  return config;
});

export default api;
