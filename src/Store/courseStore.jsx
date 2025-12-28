// src/Store/courseStore.jsx - WITH AUTHENTICATION
import axios from "axios";
import { create } from "zustand";

const API_URL = import.meta.env.VITE_API_URL;

// ✅ Configure axios to send credentials (cookies/tokens)
axios.defaults.withCredentials = true;

export const useCourseStore = create((set, get) => ({
  // State
  course: null,
  courses: [],
  sections: [],
  courseStats: null,
  courseStudents: [],
  unansweredQuestions: [],
  loading: false,
  error: null,
  message: null,

  // ==================== ADMIN - COURSE MANAGEMENT ====================

  /**
   * Create new course
   */
  createCourse: async (courseData) => {
    set({ loading: true, error: null, message: null });
    try {
      const res = await axios.post(`${API_URL}/course/create`, courseData, {
        headers: { "Content-Type": "multipart/form-data" },
        withCredentials: true, // ✅ Send auth cookies
      });
      
      set({
        message: res.data.message || "✅ Course created successfully",
        error: null,
        loading: false,
      });
      
      return res.data.course;
    } catch (err) {
      console.error("❌ Error creating course:", err);
      const errorMsg = err.response?.data?.message || err.message || "Failed to create course";
      set({
        error: errorMsg,
        loading: false,
      });
      throw new Error(errorMsg);
    }
  },

  /**
   * Get all courses with filters
   */
  getAllCourses: async (filters = {}) => {
    set({ loading: true, error: null });
    try {
      const params = new URLSearchParams(filters).toString();
      const res = await axios.get(
        `${API_URL}/course/all${params ? `?${params}` : ""}`,
        { withCredentials: true } // ✅ Send auth cookies
      );
      
      set({
        courses: res.data.courses || [],
        loading: false,
        error: null,
      });
      
      return res.data;
    } catch (err) {
      console.error("❌ Error:", err);
      set({
        error: err.response?.data?.message || "Failed to fetch courses",
        loading: false,
        courses: [],
      });
      throw err;
    }
  },

  /**
   * Get course by ID (preview mode)
   */
  getCourseById: async (id) => {
    set({ loading: true, error: null });
    try {
      const res = await axios.get(`${API_URL}/course/${id}`, {
        withCredentials: true, // ✅ Send auth cookies
      });
      
      set({
        course: res.data.course,
        sections: res.data.course?.sections || [],
        loading: false,
        error: null,
      });
      
      return res.data.course;
    } catch (err) {
      console.error("❌ Error fetching course:", err);
      set({
        error: err.response?.data?.message || "Failed to load course",
        loading: false,
      });
      throw err;
    }
  },

  /**
   * Get course with full sections (enrolled/admin view)
   */
  getCourseWithSections: async (id) => {
      set({ loading: true, error: null });
  try {
     const token = localStorage.getItem("staffToken");
     console.log("Using token:", token);
    const res = await axios.get(`${API_URL}/course/${id}/admin/full`, {
          headers: { Authorization: `Bearer ${token}` },
            withCredentials: true,
    });
    
    set({
      course: res.data.course,
      sections: res.data.sections || [],
      loading: false,
      error: null,
    });
    
    return res.data.course;
  } catch (err) {
    console.error("❌ Error fetching course:", err);
    set({
      error: err.response?.data?.message || "Failed to load course",
      loading: false,
    });
    throw err;
  }
  },

  /**
   * Update course
   */
  updateCourse: async (id, courseData) => {
    set({ loading: true, error: null, message: null });
    try {
      const res = await axios.put(`${API_URL}/course/update/${id}`, courseData, {
        headers: { "Content-Type": "multipart/form-data" },
        withCredentials: true, // ✅ Send auth cookies
      });
      
      set({
        message: res.data.message || "✅ Course updated successfully",
        course: res.data.course,
        error: null,
        loading: false,
      });
      
      return res.data.course;
    } catch (err) {
      console.error("❌ Error updating course:", err);
      const errorMsg = err.response?.data?.message || "Failed to update course";
      set({
        error: errorMsg,
        loading: false,
      });
      throw new Error(errorMsg);
    }
  },

  /**
   * Delete course
   */
  deleteCourse: async (id) => {
    set({ loading: true, error: null, message: null });
    try {
      const res = await axios.delete(`${API_URL}/course/delete/${id}`, {
        withCredentials: true, // ✅ Send auth cookies
      });
      
      set({
        message: res.data.message || "✅ Course deleted successfully",
        error: null,
        loading: false,
      });
      
      const currentCourses = get().courses;
      set({ courses: currentCourses.filter(c => c._id !== id) });
    } catch (err) {
      console.error("❌ Error deleting course:", err);
      const errorMsg = err.response?.data?.message || "Failed to delete course";
      set({
        error: errorMsg,
        loading: false,
      });
      throw new Error(errorMsg);
    }
  },

  /**
   * Publish/Unpublish course
   */
  togglePublishCourse: async (id, isPublished) => {
    set({ loading: true, error: null, message: null });
    try {
      const res = await axios.put(`${API_URL}/course/${id}/publish`, 
        { is_published: isPublished },
        { withCredentials: true } // ✅ Send auth cookies
      );
      
      set({
        message: res.data.message || `✅ Course ${isPublished ? 'published' : 'unpublished'}`,
        error: null,
        loading: false,
      });
      
      const currentCourses = get().courses;
      set({
        courses: currentCourses.map(c => 
          c._id === id ? { ...c, is_published: isPublished } : c
        )
      });
      
      return res.data.course;
    } catch (err) {
      console.error("❌ Error toggling publish:", err);
      const errorMsg = err.response?.data?.message || "Failed to update course status";
      set({
        error: errorMsg,
        loading: false,
      });
      throw new Error(errorMsg);
    }
  },

  /**
   * Get course statistics (admin)
   */
  getCourseStats: async (id) => {
    set({ loading: true, error: null });
    try {
      const res = await axios.get(`${API_URL}/course/${id}/stats`, {
        withCredentials: true, // ✅ Send auth cookies
      });
      
      set({
        courseStats: res.data.stats,
        loading: false,
        error: null,
      });
      
      return res.data.stats;
    } catch (err) {
      console.error("❌ Error fetching course stats:", err);
      set({
        error: err.response?.data?.message || "Failed to load statistics",
        loading: false,
      });
      throw err;
    }
  },

  /**
   * Get enrolled students (admin)
   */
  getCourseStudents: async (id, status = "", page = 1, limit = 20) => {
    set({ loading: true, error: null });
    try {
      const res = await axios.get(
        `${API_URL}/course/${id}/students?status=${status}&page=${page}&limit=${limit}`,
        { withCredentials: true } // ✅ Send auth cookies
      );
      
      set({
        courseStudents: res.data.students || [],
        loading: false,
        error: null,
      });
      
      return res.data;
    } catch (err) {
      console.error("❌ Error fetching students:", err);
      set({
        error: err.response?.data?.message || "Failed to load students",
        loading: false,
      });
      throw err;
    }
  },

  // ==================== ADMIN - SECTION MANAGEMENT ====================

  /**
   * Add section with content
   */
  addSection: async (sectionData) => {
    set({ loading: true, error: null, message: null });
    try {
      const contentType = sectionData.get ? sectionData.get("contentType") : sectionData.contentType;
      
      let res;
      if (contentType === "quiz") {
        const jsonData = {};
        if (sectionData.get) {
          for (let [key, value] of sectionData.entries()) {
            if (key === "quiz") {
              jsonData[key] = JSON.parse(value);
            } else {
              jsonData[key] = value;
            }
          }
        } else {
          Object.assign(jsonData, sectionData);
        }
        
        res = await axios.post(`${API_URL}/course/section/add`, jsonData, {
          headers: { "Content-Type": "application/json" },
          withCredentials: true, // ✅ Send auth cookies
        });
      } else {
        res = await axios.post(`${API_URL}/course/section/add`, sectionData, {
          headers: { "Content-Type": "multipart/form-data" },
          withCredentials: true, // ✅ Send auth cookies
        });
      }

      set({
        message: res.data.message || "✅ Section added successfully",
        loading: false,
        error: null,
      });
      
      return res.data.section;
    } catch (err) {
      console.error("❌ Error adding section:", err);
      const errorMsg = err.response?.data?.message || "Failed to add section";
      set({
        error: errorMsg,
        loading: false,
      });
      throw new Error(errorMsg);
    }
  },

  /**
   * Update section
   */
  updateSection: async (id, data) => {
    set({ loading: true, error: null, message: null });
    try {
      const res = await axios.put(`${API_URL}/course/section/${id}`, data, {
        withCredentials: true, // ✅ Send auth cookies
      });
      
      set({
        message: res.data.message || "✅ Section updated successfully",
        loading: false,
        error: null,
      });
      
      return res.data.section;
    } catch (err) {
      console.error("❌ Error updating section:", err);
      const errorMsg = err.response?.data?.message || "Failed to update section";
      set({
        error: errorMsg,
        loading: false,
      });
      throw new Error(errorMsg);
    }
  },

  /**
   * Delete section
   */
  deleteSection: async (id) => {
    set({ loading: true, error: null, message: null });
    try {
      const res = await axios.delete(`${API_URL}/course/section/${id}`, {
        withCredentials: true, // ✅ Send auth cookies
      });
      
      set({
        message: res.data.message || "✅ Section deleted successfully",
        loading: false,
        error: null,
      });
      
      const currentSections = get().sections;
      set({ sections: currentSections.filter(s => s._id !== id) });
    } catch (err) {
      console.error("❌ Error deleting section:", err);
      const errorMsg = err.response?.data?.message || "Failed to delete section";
      set({
        error: errorMsg,
        loading: false,
      });
      throw new Error(errorMsg);
    }
  },

  /**
   * Reorder sections
   */
  reorderSections: async (courseId, sectionOrders) => {
    set({ loading: true, error: null, message: null });
    try {
      const res = await axios.put(`${API_URL}/course/${courseId}/sections/reorder`, 
        { sectionOrders },
        { withCredentials: true } // ✅ Send auth cookies
      );
      
      set({
        message: "✅ Sections reordered successfully",
        sections: res.data.sections,
        loading: false,
        error: null,
      });
      
      return res.data.sections;
    } catch (err) {
      console.error("❌ Error reordering sections:", err);
      const errorMsg = err.response?.data?.message || "Failed to reorder sections";
      set({
        error: errorMsg,
        loading: false,
      });
      throw new Error(errorMsg);
    }
  },

  // ==================== ADMIN - Q&A MANAGEMENT ====================

  /**
   * Get unanswered questions (admin/instructor)
   */
  getUnansweredQuestions: async (courseId) => {
    set({ loading: true, error: null });
    try {
      const res = await axios.get(`${API_URL}/course/${courseId}/questions/unanswered`, {
        withCredentials: true, // ✅ Send auth cookies
      });
      
      set({
        unansweredQuestions: res.data.questions || [],
        loading: false,
        error: null,
      });
      
      return res.data.questions;
    } catch (err) {
      console.error("❌ Error fetching questions:", err);
      set({
        error: err.response?.data?.message || "Failed to load questions",
        loading: false,
      });
      throw err;
    }
  },

  /**
   * Answer question (instructor)
   */
  answerQuestion: async (questionId, answerData) => {
    set({ loading: true, error: null, message: null });
    try {
      const res = await axios.post(
        `${API_URL}/course/question/${questionId}/answer`,
        answerData,
        { withCredentials: true } // ✅ Send auth cookies
      );
      
      set({
        message: res.data.message || "✅ Question answered successfully",
        loading: false,
        error: null,
      });
    } catch (err) {
      console.error("❌ Error answering question:", err);
      const errorMsg = err.response?.data?.message || "Failed to answer question";
      set({
        error: errorMsg,
        loading: false,
      });
      throw new Error(errorMsg);
    }
  },

  // ==================== CLEAR FUNCTIONS ====================

  clearError: () => set({ error: null }),
  clearMessage: () => set({ message: null }),
  clearCourse: () => set({ course: null, sections: [] }),
  resetStore: () => set({
    course: null,
    courses: [],
    sections: [],
    courseStats: null,
    courseStudents: [],
    unansweredQuestions: [],
    loading: false,
    error: null,
    message: null,
  }),
}));