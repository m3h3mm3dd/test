import axios from "axios";

export const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000",
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true,
});

api.interceptors.request.use((config) => {
  const token = typeof window !== "undefined"
    ? localStorage.getItem("authToken")
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
      if (typeof window !== "undefined") {
        localStorage.removeItem("authToken");
        localStorage.removeItem("taskup_onboarded");
        window.location.href = "/login";
      }
    }
    return Promise.reject(err);
  }
);

export default api;
