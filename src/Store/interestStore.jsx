import axios from "axios";
import { create } from "zustand";

const API_URL = import.meta.env.VITE_API_URL;

export const useInterestStore = create((set) => ({
  savedInterests: [],
  loading: false,
  error: null,
  message: null,    
    // ✅ Fetch all interests
    fetchInterests: async () => {
        set({ loading: true, error: null });
        try {
            const res = await axios.get(`${API_URL}/interests/get`);
            set({
                savedInterests: res.data || [],
                error: null,
                loading: false,
            });
        } catch (err) {
            console.error("Error fetching interests:", err);
            set({
                error: err.response?.data?.message || "❌ Failed to fetch interests",
                loading: false,
            });
        }
    },
    // ✅ Add new interests
    addInterests: async (interests) => {
        set({ loading: true, error: null, message: null });
        try {
            const res = await axios.post(`${API_URL}/interests/add`, { interests });
            set({
                message: res.data.message || "✅ Interests added successfully",
                error: null,
                loading: false,
            });
            // Refresh the interests list
            await useInterestStore.getState().fetchInterests();
        } catch (err) {
            console.error("Error adding interests:", err);
            set({
                error: err.response?.data?.message || "❌ Failed to add interests",
                loading: false,
            });
        }
    },
    // ✅ Delete an interest by ID
    deleteInterest: async (id) => {
        set({ loading: true, error: null, message: null });
        try {
            await axios.delete(`${API_URL}/interests/delete/${id}`);
            set({
                message: "✅ Interest deleted successfully",
                error: null,
                loading: false,
            });
            // Refresh the interests list
            await useInterestStore.getState().fetchInterests();
        } catch (err) {
            console.error("Error deleting interest:", err);
            set({
                error: err.response?.data?.message || "❌ Failed to delete interest",
                loading: false,
            });
        }
    },
    // ✅ Update an interest by ID
    updateInterest: async (id, name) => {
        set({ loading: true, error: null, message: null });
        try {
            const res = await axios.put(`${API_URL}/interests/update/${id}`, { name });
            set({
                message: res.data.message || "✅ Interest updated successfully",
                error: null,
                loading: false,
            });
            // Refresh the interests list
            await useInterestStore.getState().fetchInterests();
        } catch (err) {
            console.error("Error updating interest:", err);
            set({
                error: err.response?.data?.message || "❌ Failed to update interest",
                loading: false,
            });
        }
    },
}));