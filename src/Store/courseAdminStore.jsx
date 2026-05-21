// src/Store/courseAdminStore.jsx
import { create } from "zustand";
import adminApi from "../utils/adminApi";

export const useCourseAdminStore = create((set, get) => ({
  courses:    [],
  course:     null,
  loading:    false,
  error:      null,
  message:    null,
  pagination: { total: 0, page: 1 },

  // ── List all courses (admin) ───────────────────────────────────────────────
  getAllCourses: async (params = {}) => {
    set({ loading: true, error: null });
    try {
      const query = new URLSearchParams(params).toString();
      const res = await adminApi.get(`/courses/admin/all?${query}`);
      set({
        courses:    res.data.courses || [],
        pagination: { total: res.data.total || 0, page: res.data.page || 1 },
        loading:    false,
      });
      return res.data;
    } catch (err) {
      set({ error: err.response?.data?.message || "Failed to load courses", loading: false });
      throw err;
    }
  },

  // ── Get single course by ID ────────────────────────────────────────────────
  getCourseById: async (id) => {
    set({ loading: true, error: null, course: null });
    try {
      const res = await adminApi.get(`/courses/admin/${id}`);
      set({ course: res.data.course, loading: false });
      return res.data.course;
    } catch (err) {
      set({ error: err.response?.data?.message || "Failed to load course", loading: false });
      throw err;
    }
  },

  // ── Approve / Reject / Unpublish a course ─────────────────────────────────
  reviewCourse: async (id, action, note = "") => {
    set({ loading: true, error: null, message: null });
    try {
      const res = await adminApi.put(`/courses/admin/${id}/review`, { action, note });
      set({ message: res.data.message, loading: false });
      set((state) => ({
        courses: state.courses.map((c) =>
          c._id === id ? { ...c, approvalStatus: res.data.course.approvalStatus } : c
        ),
      }));
      return res.data;
    } catch (err) {
      set({ error: err.response?.data?.message || "Action failed", loading: false });
      throw err;
    }
  },

  // ── Delete a course ────────────────────────────────────────────────────────
  // DELETE /courses/admin/:id
  deleteCourse: async (id) => {
    set({ loading: true, error: null, message: null });
    try {
      const res = await adminApi.delete(`/courses/admin/${id}`);
      set({ message: res.data.message, loading: false });
      // Remove from local list immediately
      set((state) => ({
        courses: state.courses.filter((c) => c._id !== id),
      }));
      return res.data;
    } catch (err) {
      set({ error: err.response?.data?.message || "Delete failed", loading: false });
      throw err;
    }
  },

  // ── Create STEM course ─────────────────────────────────────────────────────
  createStemCourse: async (formData) => {
    set({ loading: true, error: null, message: null });
    try {
      const res = await adminApi.post("/courses/admin/stem", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      set({ message: res.data.message, loading: false });
      return res.data.course;
    } catch (err) {
      set({ error: err.response?.data?.message || "Failed to create course", loading: false });
      throw err;
    }
  },

  // ── Update a STEM course (or any course details) ───────────────────────────
  // PUT /courses/admin/:id  — same multipart/form-data as create
  updateCourse: async (id, formData) => {
    set({ loading: true, error: null, message: null });
    try {
      const res = await adminApi.put(`/courses/admin/${id}`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      set({ message: res.data.message, loading: false });
      // Refresh local list entry
      set((state) => ({
        courses: state.courses.map((c) =>
          c._id === id ? { ...c, ...res.data.course } : c
        ),
        course: state.course?._id === id ? res.data.course : state.course,
      }));
      return res.data.course;
    } catch (err) {
      set({ error: err.response?.data?.message || "Update failed", loading: false });
      throw err;
    }
  },

  // ── Add section to a course ────────────────────────────────────────────────
  addSection: async (courseId, data) => {
    set({ loading: true, error: null });
    try {
      const res = await adminApi.post(`/courses/admin/${courseId}/sections`, data);
      set({ message: res.data.message, loading: false });
      return res.data.section;
    } catch (err) {
      set({ error: err.response?.data?.message || "Failed to add section", loading: false });
      throw err;
    }
  },

  // ── Add lesson to a section ────────────────────────────────────────────────
  addLesson: async (courseId, sectionId, formData) => {
    set({ loading: true, error: null });
    try {
      const res = await adminApi.post(
        `/courses/admin/${courseId}/sections/${sectionId}/lessons`,
        formData,
        { headers: { "Content-Type": "multipart/form-data" } }
      );
      set({ message: res.data.message, loading: false });
      return res.data.lesson;
    } catch (err) {
      set({ error: err.response?.data?.message || "Failed to add lesson", loading: false });
      throw err;
    }
  },

  // ── Delete lesson ─────────────────────────────────────────────────────────
  deleteLesson: async (courseId, sectionId, lessonId) => {
    set({ loading: true, error: null });
    try {
      const res = await adminApi.delete(
        `/courses/admin/${courseId}/sections/${sectionId}/lessons/${lessonId}`
      );
      set({ message: res.data.message, loading: false });
      return res.data;
    } catch (err) {
      set({ error: err.response?.data?.message || "Failed to delete lesson", loading: false });
      throw err;
    }
  },

  // ── Delete section ────────────────────────────────────────────────────────
  deleteSection: async (courseId, sectionId) => {
    set({ loading: true, error: null });
    try {
      const res = await adminApi.delete(`/courses/admin/${courseId}/sections/${sectionId}`);
      set({ message: res.data.message, loading: false });
      return res.data;
    } catch (err) {
      set({ error: err.response?.data?.message || "Failed to delete section", loading: false });
      throw err;
    }
  },

  clearError:   () => set({ error: null }),
  clearMessage: () => set({ message: null }),
}));