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
}, (error) => {
  console.error('Request interceptor error:', error);
  return Promise.reject(error);
});

api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err?.response?.status === 401) {
      if (typeof window !== "undefined") {
        console.warn('Authentication error: Unauthorized. Clearing auth data and redirecting to login.');
        
        localStorage.removeItem("authToken");
        localStorage.removeItem("userData");
        
     
        window.location.href = "/login";
      }
    }
    
    if (err?.response?.status === 403) {
      console.warn('Permission denied');
    }
    
    return Promise.reject(err);
  }
);

export default api;