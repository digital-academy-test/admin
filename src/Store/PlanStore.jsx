import { create } from "zustand";

const API_URL = import.meta.env.VITE_API_URL; // Base API

export const usePlanStore = create((set, get) => ({
  plans: [],
  loading: false,
  error: null,

  // Fetch all plans
  fetchPlans: async () => {
    set({ loading: true, error: null });
    try {
      const res = await fetch(`${API_URL}/plans`);
      const data = await res.json();

      if (!res.ok) throw new Error(data.message || "Failed to fetch plans");

      set({ plans: data.data, loading: false });
    } catch (err) {
      set({ error: err.message, loading: false });
    }
  },

  // Create a new plan
  createPlan: async (planData) => {
    set({ loading: true, error: null });
    try {
      const res = await fetch(`${API_URL}/plans`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(planData),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message);

      // Add new plan to list
      set({ plans: [data.data, ...get().plans], loading: false });

      return data.data;
    } catch (err) {
      set({ error: err.message, loading: false });
      return null;
    }
  },

  // Update a plan
  updatePlan: async (id, planData) => {
    set({ loading: true, error: null });

    try {
      const res = await fetch(`${API_URL}/plans/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(planData),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message);

      // Update local state
      set({
        plans: get().plans.map((p) => (p._id === id ? data.data : p)),
        loading: false,
      });

      return data.data;
    } catch (err) {
      set({ error: err.message, loading: false });
      return null;
    }
  },

  // Delete a plan
  deletePlan: async (id) => {
    set({ loading: true, error: null });

    try {
      const res = await fetch(`${API_URL}/plans/${id}`, {
        method: "DELETE",
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message);

      // Remove from state
      set({
        plans: get().plans.filter((p) => p._id !== id),
        loading: false,
      });

      return true;
    } catch (err) {
      set({ error: err.message, loading: false });
      return false;
    }
  },
}));
