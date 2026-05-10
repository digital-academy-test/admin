// src/Store/instructorAdminStore.jsx
import { create } from "zustand";
import adminApi from "../utils/adminApi";

export const useInstructorAdminStore = create((set) => ({
  instructors: [],
  instructor:  null,
  courses:     [],   // courses belonging to the viewed instructor
  loading:     false,
  error:       null,
  message:     null,
  pagination:  { total: 0, page: 1 },

  // ── List all instructors ───────────────────────────────────────────────────
  getAllInstructors: async (params = {}) => {
    set({ loading: true, error: null });
    try {
      const query = new URLSearchParams(params).toString();
      const res = await adminApi.get(`/admin/instructors?${query}`);
      set({
        instructors: res.data.instructors || [],
        pagination:  { total: res.data.total || 0, page: res.data.page || 1 },
        loading:     false,
      });
      return res.data;
    } catch (err) {
      set({ error: err.response?.data?.message || "Failed to load instructors", loading: false });
      throw err;
    }
  },

  // ── Get single instructor (admin — works for ANY verification status) ───────
  // Previously called /instructor/:id/public which only returns verified instructors
  // Now calls /admin/instructors/:id which has no status restriction
  getInstructorById: async (id) => {
    set({ loading: true, error: null, instructor: null, courses: [] });
    try {
      const res = await adminApi.get(`/admin/instructors/${id}`);
      set({
        instructor: res.data.instructor,
        courses:    res.data.courses || [],
        loading:    false,
      });
      return res.data;
    } catch (err) {
      set({ error: err.response?.data?.message || "Failed to load instructor", loading: false });
      throw err;
    }
  },

  // ── Approve / Reject / Suspend ─────────────────────────────────────────────
  reviewInstructor: async (id, action, note = "") => {
    set({ loading: true, error: null, message: null });
    try {
      const res = await adminApi.put(`/admin/instructors/${id}/verify`, { action, note });
      set({ message: res.data.message, loading: false });
      // Update in local list
      set((state) => ({
        instructors: state.instructors.map((i) =>
          i._id === id
            ? { ...i, verificationStatus: res.data.instructor.verificationStatus }
            : i
        ),
        // Update the currently viewed instructor if it's the same one
        instructor: state.instructor?._id === id
          ? { ...state.instructor, verificationStatus: res.data.instructor.verificationStatus }
          : state.instructor,
      }));
      return res.data;
    } catch (err) {
      set({ error: err.response?.data?.message || "Action failed", loading: false });
      throw err;
    }
  },

  clearError:   () => set({ error: null }),
  clearMessage: () => set({ message: null }),
}));