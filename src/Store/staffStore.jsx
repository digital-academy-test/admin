import { create } from "zustand";
import { persist } from "zustand/middleware";
import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL;

export const useStaffstore = create(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,
      loading: false,
      error: null,
      message: null,

      addStaff: async (formData) => {
        set({ loading: true, error: null, message: null });
        try {
          const res = await axios.post(`${API_URL}/staff/addstaff`, formData, {
            withCredentials: true,
          });
          set({
            message: res.data.message || "Staff added successfully",
            error: null,
            loading: false,
          });
        } catch (err) {
          set({
            error: err.response?.data?.message || "Failed to add staff",
            loading: false,
          });
        }
      },

      staffLogin: async (credentials) => {
        set({ loading: true, error: null, message: null });
        try {
          const res = await axios.post(`${API_URL}/staff/login`, credentials, {
            withCredentials: true,
          });

          set({
            user: res.data.staff,
            isAuthenticated: true,
            message: res.data.message || "Login successful",
            error: null,
            loading: false,
          });

          return true;
        } catch (err) {
          set({
            error: err.response?.data?.message || "Server Error",
            loading: false,
          });
          return false;
        }
      },

      logout: () => {
        set({
          user: null,
          isAuthenticated: false,
          message: null,
          error: null,
        });
      },
    }),
    {
      name: "staff-auth-storage", // key in localStorage
    }
  )
);
