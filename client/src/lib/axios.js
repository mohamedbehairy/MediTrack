import axios from "axios";
import useAuthStore from "../store/useAuthStore";

// Configure Axios instance for backend calls
export const api = axios.create({
  // baseURL: 'http://localhost:5002/api',
  baseURL: "https://unroasted-hulk-designing.ngrok-free.dev/",
});

// Request Interceptor: Attach JWT Token if user is logged in
api.interceptors.request.use(
  (config) => {
    const token = useAuthStore.getState().token;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

// Response Interceptor: Handle 401 Unauthorized (Expired Tokens)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      useAuthStore.getState().logout();
      window.location.href = "/login";
    }
    return Promise.reject(error);
  },
);
