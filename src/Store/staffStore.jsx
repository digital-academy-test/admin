import { create } from "zustand";
import { persist } from "zustand/middleware";
import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL;

axios.defaults.withCredentials = true;

export const useStaffstore = create(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,
      loading: false,
      error: null,
      message: null,
      staff: [],

      // ==================== Staff Management ====================
      
      // Add new staff member
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
          return res.data;
        } catch (err) {
          const errorMsg = err.response?.data?.message || "Failed to add staff";
          set({
            error: errorMsg,
            loading: false,
          });
          throw new Error(errorMsg);
        }
      },

      // Get all staff members
      getAllStaff: async () => {
        set({ loading: true, error: null });
        try {
          const res = await axios.get(`${API_URL}/staff/all`, {
            withCredentials: true,
          });
          set({
            staff: res.data.data || [],
            loading: false,
          });
          return res.data.data;
        } catch (err) {
          console.log(err);
          const errorMsg = err.response?.data?.message || "Failed to fetch staff";
          set({
            error: errorMsg,
            loading: false,
          });
          throw new Error(errorMsg);
        }
      },

      // Get single staff by ID
      getStaffById: async (staffId) => {
        set({ loading: true, error: null });
        try {
          const res = await axios.get(`${API_URL}/staff/${staffId}`, {
            withCredentials: true,
          });
          set({ loading: false });
          return res.data.data;
        } catch (err) {
          const errorMsg = err.response?.data?.message || "Failed to fetch staff details";
          set({
            error: errorMsg,
            loading: false,
          });
          throw new Error(errorMsg);
        }
      },

      // Update staff member
      updateStaff: async (staffId, updateData) => {
        set({ loading: true, error: null, message: null });
        try {
          const res = await axios.put(`${API_URL}/staff/${staffId}`, updateData, {
            withCredentials: true,
          });
          set({
            message: res.data.message || "Staff updated successfully",
            loading: false,
          });
          return res.data.data;
        } catch (err) {
          const errorMsg = err.response?.data?.message || "Failed to update staff";
          set({
            error: errorMsg,
            loading: false,
          });
          throw new Error(errorMsg);
        }
      },

      // Delete staff member
      deleteStaff: async (staffId) => {
        set({ loading: true, error: null, message: null });
        try {
          const res = await axios.delete(`${API_URL}/staff/${staffId}`, {
            withCredentials: true,
          });
          set({
            message: res.data.message || "Staff deleted successfully",
            loading: false,
          });
          return res.data;
        } catch (err) {
          const errorMsg = err.response?.data?.message || "Failed to delete staff";
          set({
            error: errorMsg,
            loading: false,
          });
          throw new Error(errorMsg);
        }
      },

      // ==================== Authentication ====================

      // Staff login
      staffLogin: async (credentials) => {
        set({ loading: true, error: null, message: null });
        try {
          const res = await axios.post(`${API_URL}/staff/login`, credentials, {
            withCredentials: true,
          });

          // Store user and token in localStorage
          localStorage.setItem("staffUser", JSON.stringify(res.data.staff));
          localStorage.setItem("staffToken", res.data.token);
          localStorage.setItem("isStaffAuthenticated", "true");

          set({
            user: res.data.staff,
            isAuthenticated: true,
            message: res.data.message || "Login successful",
            error: null,
            loading: false,
          });

          return res.data;
        } catch (err) {
          const errorMsg = err.response?.data?.message || "Invalid credentials";
          set({
            error: errorMsg,
            loading: false,
          });
          throw new Error(errorMsg);
        }
      },

      // Check authentication status
      checkStaffAuth: async () => {
        set({ loading: true, error: null });
        try {
          const token = localStorage.getItem("staffToken");
          if (!token) {
            set({ 
              isAuthenticated: false, 
              user: null,
              loading: false 
            });
            return false;
          }

          const res = await axios.get(`${API_URL}/staff/check-auth`, {
            headers: { Authorization: `Bearer ${token}` },
            withCredentials: true,
          });

          set({
            user: res.data.staff,
            isAuthenticated: true,
            loading: false,
          });

          return true;
        } catch (err) {
          // Clear invalid auth
          localStorage.removeItem("staffUser");
          localStorage.removeItem("staffToken");
          localStorage.removeItem("isStaffAuthenticated");
          
          set({
            user: null,
            isAuthenticated: false,
            loading: false,
          });
          return false;
        }
      },

      // Staff logout
      logout: async () => {
        set({ loading: true });
        try {
          await axios.post(`${API_URL}/staff/logout`, {}, {
            withCredentials: true,
          });
        } catch (err) {
          console.error("Logout error:", err);
        } finally {
          // Clear all stored data
          localStorage.removeItem("staffUser");
          localStorage.removeItem("staffToken");
          localStorage.removeItem("isStaffAuthenticated");

          set({
            user: null,
            isAuthenticated: false,
            message: null,
            error: null,
            loading: false,
          });
        }
      },

      // Change staff password
      changePassword: async (passwordData) => {
        set({ loading: true, error: null, message: null });
        try {
          const res = await axios.post(`${API_URL}/staff/change-password`, passwordData, {
            withCredentials: true,
          });
          set({
            message: res.data.message || "Password changed successfully",
            loading: false,
          });
          return res.data;
        } catch (err) {
          const errorMsg = err.response?.data?.message || "Failed to change password";
          set({
            error: errorMsg,
            loading: false,
          });
          throw new Error(errorMsg);
        }
      },

      // Update staff profile
      updateProfile: async (profileData) => {
        set({ loading: true, error: null, message: null });
        console.log("Updating profile with data:", profileData);
        try {
          const res = await axios.put(`${API_URL}/staff/profile`, profileData, {
            withCredentials: true,
            headers: { "Content-Type": "multipart/form-data" },
          });
          console.log("Profile update response:", res.data);

          // Update stored user
          localStorage.setItem("staffUser", JSON.stringify(res.data.data));

          set({
            user: res.data.data,
            message: res.data.message || "Profile updated successfully",
            loading: false,
          });
          return res.data.data;
        } catch (err) {
          const errorMsg = err.response?.data?.message || "Failed to update profile";
          set({
            error: errorMsg,
            loading: false,
          });
          throw new Error(errorMsg);
        }
      },

      // Clear error
      clearError: () => set({ error: null }),

      // Clear message
      clearMessage: () => set({ message: null }),
    }),
    {
      name: "staff-auth-storage",
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);