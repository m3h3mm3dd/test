
import axios from "axios";

export const api = axios.create({
  baseURL: "http://localhost:8000",
  headers: {
    "Content-Type": "application/json",
  },
});

// 🔐 Inject token into every request
api.interceptors.request.use((config) => {
  const token = typeof window !== "undefined"
    ? localStorage.getItem("taskup_token")
    : null;

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err?.response?.status === 401) {
      localStorage.removeItem("taskup_token");
      localStorage.removeItem("taskup_onboarded");
      window.location.href = "/auth/login";
    }
    return Promise.reject(err);
  }
);