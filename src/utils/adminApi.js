// src/utils/adminApi.js
// Axios instance that always attaches the staff Bearer token.
// Mirror of the pattern already used in staffStore.jsx (localStorage "staffToken").

import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL;

const adminApi = axios.create({
  baseURL: API_URL,
  headers: { "Content-Type": "application/json" },
});

adminApi.interceptors.request.use((config) => {
  const token = localStorage.getItem("staffToken");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

adminApi.interceptors.response.use(
  (res) => res,
  (error) => {
    if (error.response?.status === 401) {
      const hadToken = !!localStorage.getItem("staffToken");
      if (hadToken) {
        localStorage.removeItem("staffToken");
        localStorage.removeItem("staffUser");
        localStorage.removeItem("isStaffAuthenticated");
        if (!window.location.pathname.includes("/login") && !window.location.pathname === "/") {
          window.location.href = "/";
        }
      }
    }
    return Promise.reject(error);
  }
);

export default adminApi;
