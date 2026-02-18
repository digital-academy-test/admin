// src/Store/cbtStore.js - ENHANCED WITH ADMIN FEATURES
import axios from "axios";
import { create } from "zustand";

const API_URL = import.meta.env.VITE_API_URL;

// Create axios instance with default config
const api = axios.create({
  baseURL: API_URL,
});

// Add request interceptor to include staff token for admin routes
api.interceptors.request.use((config) => {
  const staffToken = localStorage.getItem('staffToken');
  if (staffToken) {
    config.headers.Authorization = `Bearer ${staffToken}`;
  }
  return config;
});

export const useCbtStore = create((set, get) => ({
  // ==================== STATE ====================
  // Exams
  exams: [],
  selectedExam: null,
  examYears: [],
  examSubjects: [],
  
  // Questions
  questions: [],
  selectedQuestion: null,
  questionCount: 0,
  
  // Subjects & Topics (Legacy)
  examStructure: [],
  examData: [],
  
  // Attempts & Analytics
  attempts: [],
  userAttempts: [],
  attemptSummary: null,

  // UI State
  loading: false,
  error: null,
  message: null,

  // ==================== BACKWARD COMPATIBILITY ====================
  get examData() {
    return get().examStructure;
  },

  // ==================== EXAM MANAGEMENT ====================
  
  /**
   * Create a new exam
   */
  createExam: async (examData) => {
    set({ loading: true, error: null, message: null });
    try {
      const res = await api.post('/cbt/exams', examData);
      
      set((state) => ({
        exams: [...state.exams, res.data.exam],
        message: res.data.message || "✅ Exam created successfully",
        loading: false,
        error: null,
      }));
      
      return res.data.exam;
    } catch (err) {
      console.error("Error creating exam:", err);
      const errorMsg = err.response?.data?.message || "❌ Failed to create exam";
      set({ error: errorMsg, loading: false });
      throw err;
    }
  },

  /**
   * 🆕 ENHANCED: Get all exams with admin mode
   * @param {Object} filters - { category, isActive, admin }
   */
  getExams: async (filters = {}) => {
    set({ loading: true, error: null });
    try {
      const params = new URLSearchParams(filters).toString();
      const res = await api.get(`/cbt/exams?${params}`);
      
      set({ 
        exams: res.data.exams, 
        loading: false,
        error: null 
      });
      
      return res.data.exams;
    } catch (err) {
      console.error("Error fetching exams:", err);
      set({ 
        error: err.response?.data?.message || "Failed to load exams", 
        loading: false 
      });
      throw err;
    }
  },

  /**
   * 🆕 NEW: Get all exams for admin (includes hidden subjects)
   */
  getExamsForAdmin: async (filters = {}) => {
    return await get().getExams({ ...filters, admin: true });
  },

  /**
   * Get single exam by ID
   */
  getExamById: async (examId, isAdmin = false) => {
    set({ loading: true, error: null });
    try {
      const adminParam = isAdmin ? '?admin=true' : '';
      const res = await api.get(`/cbt/exams/${examId}${adminParam}`);
      
      set({ 
        selectedExam: res.data.exam, 
        loading: false,
        error: null 
      });
      
      return res.data.exam;
    } catch (err) {
      console.error("Error fetching exam:", err);
      set({ 
        error: err.response?.data?.message || "Failed to load exam", 
        loading: false 
      });
      throw err;
    }
  },

  /**
   * Update exam
   */
  updateExam: async (examId, updateData) => {
    set({ loading: true, error: null, message: null });
    try {
      const res = await api.put(`/cbt/exams/${examId}`, updateData);
      
      set((state) => ({
        exams: state.exams.map(exam => 
          exam._id === examId ? res.data.exam : exam
        ),
        selectedExam: res.data.exam,
        message: res.data.message || "✅ Exam updated successfully",
        loading: false,
        error: null,
      }));
      
      return res.data.exam;
    } catch (err) {
      console.error("Error updating exam:", err);
      const errorMsg = err.response?.data?.message || "❌ Failed to update exam";
      set({ error: errorMsg, loading: false });
      throw err;
    }
  },

  /**
   * Delete exam
   */
  deleteExam: async (examId, permanent = false) => {
    set({ loading: true, error: null, message: null });
    try {
      await api.delete(`/cbt/exams/${examId}?permanent=${permanent}`);
      
      set((state) => ({
        exams: state.exams.filter(exam => exam._id !== examId),
        message: "✅ Exam deleted successfully",
        loading: false,
        error: null,
      }));
    } catch (err) {
      console.error("Error deleting exam:", err);
      const errorMsg = err.response?.data?.message || "❌ Failed to delete exam";
      set({ error: errorMsg, loading: false });
      throw err;
    }
  },

  /**
   * Add year to exam
   */
  addYearToExam: async (examId, yearData) => {
    set({ loading: true, error: null, message: null });
    try {
      const res = await api.post(`/cbt/exams/${examId}/years`, yearData);
      
      set((state) => ({
        exams: state.exams.map(exam => 
          exam._id === examId ? res.data.exam : exam
        ),
        selectedExam: res.data.exam,
        message: res.data.message || "✅ Year added successfully",
        loading: false,
        error: null,
      }));
      
      return res.data.exam;
    } catch (err) {
      console.error("Error adding year:", err);
      const errorMsg = err.response?.data?.message || "❌ Failed to add year";
      set({ error: errorMsg, loading: false });
      throw err;
    }
  },

  /**
   * Add subject to exam year
   */
  addSubjectToYear: async (examId, year, subjectData) => {
    set({ loading: true, error: null, message: null });
    try {
      const res = await api.post(
        `/cbt/exams/${examId}/years/${year}/subjects`, 
        subjectData
      );
      
      set((state) => ({
        exams: state.exams.map(exam => 
          exam._id === examId ? res.data.exam : exam
        ),
        selectedExam: res.data.exam,
        message: res.data.message || "✅ Subject added successfully",
        loading: false,
        error: null,
      }));
      
      return res.data.exam;
    } catch (err) {
      console.error("Error adding subject:", err);
      const errorMsg = err.response?.data?.message || "❌ Failed to add subject";
      set({ error: errorMsg, loading: false });
      throw err;
    }
  },

  /**
   * 🆕 ENHANCED: Get years for an exam (with admin mode)
   */
  getExamYears: async (examId, isAdmin = false) => {
    set({ loading: true, error: null });
    try {
      const adminParam = isAdmin ? '?admin=true' : '';
      const res = await api.get(`/cbt/exams/${examId}/years${adminParam}`);
      
      set({ 
        examYears: res.data.years, 
        loading: false,
        error: null 
      });
      
      return res.data.years;
    } catch (err) {
      console.error("Error fetching exam years:", err);
      set({ 
        error: err.response?.data?.message || "Failed to load years", 
        loading: false 
      });
      throw err;
    }
  },

  /**
   * 🆕 ENHANCED: Get subjects for exam year (with admin mode)
   */
  getYearSubjects: async (examId, year, isAdmin = false) => {
    set({ loading: true, error: null });
    try {
      const adminParam = isAdmin ? '?admin=true' : '';
      const res = await api.get(`/cbt/exams/${examId}/years/${year}/subjects${adminParam}`);
      
      set({ 
        examSubjects: res.data.subjects, 
        loading: false,
        error: null 
      });
      
      return res.data.subjects;
    } catch (err) {
      console.error("Error fetching subjects:", err);
      set({ 
        error: err.response?.data?.message || "Failed to load subjects", 
        loading: false 
      });
      throw err;
    }
  },

  // ==================== 🆕 NEW: VISIBILITY MANAGEMENT ====================

  /**
   * Toggle subject visibility
   * @param {String} examId 
   * @param {Number} year 
   * @param {String} subject 
   * @param {Boolean} isVisible 
   */
  toggleSubjectVisibility: async (examId, year, subject, isVisible) => {
    set({ loading: true, error: null, message: null });
    try {
      const res = await api.put(
        `/cbt/exams/${examId}/years/${year}/subjects/${subject}/visibility`,
        { isVisible }
      );
      
      set((state) => ({
        exams: state.exams.map(exam => 
          exam._id === examId ? res.data.exam : exam
        ),
        selectedExam: res.data.exam,
        message: res.data.message || `✅ Subject visibility updated`,
        loading: false,
        error: null,
      }));
      
      return res.data.exam;
    } catch (err) {
      console.error("Error toggling visibility:", err);
      const errorMsg = err.response?.data?.message || "❌ Failed to update visibility";
      set({ error: errorMsg, loading: false });
      throw err;
    }
  },

  /**
   * Bulk update subject visibilities
   * @param {String} examId 
   * @param {Array} updates - [{ year, subject, isVisible }]
   */
  bulkUpdateVisibility: async (examId, updates) => {
    set({ loading: true, error: null, message: null });
    try {
      const res = await api.post(
        `/cbt/exams/${examId}/bulk-visibility`,
        { updates }
      );
      
      set((state) => ({
        exams: state.exams.map(exam => 
          exam._id === examId ? res.data.exam : exam
        ),
        message: res.data.message || "✅ Bulk visibility update completed",
        loading: false,
        error: null,
      }));
      
      return res.data.results;
    } catch (err) {
      console.error("Error bulk updating visibility:", err);
      const errorMsg = err.response?.data?.message || "❌ Failed to bulk update visibility";
      set({ error: errorMsg, loading: false });
      throw err;
    }
  },

  /**
   * Sync question counts for an exam
   * @param {String} examId 
   */
  syncQuestionCounts: async (examId) => {
    set({ loading: true, error: null, message: null });
    try {
      const res = await api.post(`/cbt/exams/${examId}/sync-counts`);
      
      set((state) => ({
        exams: state.exams.map(exam => 
          exam._id === examId ? res.data.exam : exam
        ),
        message: res.data.message || "✅ Question counts synced",
        loading: false,
        error: null,
      }));
      
      return res.data.updates;
    } catch (err) {
      console.error("Error syncing counts:", err);
      const errorMsg = err.response?.data?.message || "❌ Failed to sync counts";
      set({ error: errorMsg, loading: false });
      throw err;
    }
  },

  // ==================== QUESTION MANAGEMENT ====================

  /**
   * Add single question with image support
   */
  addQuestion: async (formData) => {
    set({ loading: true, error: null, message: null });
    try {
      const res = await api.post('/cbt/questions', formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      set((state) => ({
        questions: [...state.questions, res.data.question],
        message: res.data.message || "✅ Question added successfully",
        loading: false,
        error: null,
      }));

      return res.data.question;
    } catch (err) {
      console.error("Error adding question:", err);
      const errorMsg = err.response?.data?.message || "❌ Failed to add question";
      set({ error: errorMsg, loading: false });
      throw err;
    }
  },

  /**
   * Add bulk questions
   */
  addBulkQuestions: async (questionsData) => {
    set({ loading: true, error: null, message: null });
    try {
      const res = await api.post('/cbt/questions/bulk', questionsData);

      set({
        message: res.data.message || "✅ Bulk questions added successfully",
        loading: false,
        error: null,
      });

      return res.data;
    } catch (err) {
      console.error("Error adding bulk questions:", err);
      const errorMsg = err.response?.data?.message || "❌ Failed to add bulk questions";
      set({ error: errorMsg, loading: false });
      throw err;
    }
  },

  /**
   * Get questions with filters
   */
  getQuestions: async (filters = {}) => {
    set({ loading: true, error: null });
   
    try {
      const params = new URLSearchParams(filters).toString();
      const res = await api.get(`/cbt/questions?${params}`);

      set({ 
        questions: res.data.questions, 
        questionCount: res.data.count,
        loading: false,
        error: null 
      });

      return res.data;
    } catch (err) {
      console.error("Error fetching questions:", err);
      set({ 
        error: err.response?.data?.message || "Error fetching questions", 
        loading: false 
      });
      throw err;
    }
  },

  /**
   * Get single question by ID
   */
  getQuestionById: async (questionId) => {
    set({ loading: true, error: null });
    try {
      const res = await api.get(`/cbt/questions/${questionId}`);

      set({ 
        selectedQuestion: res.data.question, 
        loading: false,
        error: null 
      });

      return res.data.question;
    } catch (err) {
      console.error("Error fetching question:", err);
      set({ 
        error: err.response?.data?.message || "Failed to load question", 
        loading: false 
      });
      throw err;
    }
  },

  /**
   * Update question
   */
  updateQuestion: async (questionId, formData) => {
    set({ loading: true, error: null, message: null });
    try {
      const res = await api.put(`/cbt/questions/${questionId}`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      set((state) => ({
        questions: state.questions.map(q => 
          q._id === questionId ? res.data.question : q
        ),
        selectedQuestion: res.data.question,
        message: res.data.message || "✅ Question updated successfully",
        loading: false,
        error: null,
      }));

      return res.data.question;
    } catch (err) {
      console.error("Error updating question:", err);
      const errorMsg = err.response?.data?.message || "❌ Failed to update question";
      set({ error: errorMsg, loading: false });
      throw err;
    }
  },

  /**
   * Delete question
   */
  deleteQuestion: async (questionId) => {
    set({ loading: true, error: null, message: null });
    try {
      const res = await api.delete(`/cbt/questions/${questionId}`);

      set((state) => ({
        questions: state.questions.filter(q => q._id !== questionId),
        message: res.data.message || "✅ Question deleted successfully",
        loading: false,
        error: null,
      }));
    } catch (err) {
      console.error("Error deleting question:", err);
      const errorMsg = err.response?.data?.message || "❌ Failed to delete question";
      set({ error: errorMsg, loading: false });
      throw err;
    }
  },

  // ==================== LEGACY SUPPORT ====================

  addSubject: async (level, name) => {
    set({ loading: true, error: null, message: null });
    try {
      const res = await api.post('/cbt/addsubject', { level, name });

      set({
        message: res.data.message || "✅ Subject added successfully",
        error: null,
        loading: false,
      });

      await get().getExamStructure();
    } catch (err) {
      console.error("Error adding subject:", err);
      const errorMsg = err.response?.data?.message || "❌ Failed to add subject";
      set({ error: errorMsg, loading: false });
      throw err;
    }
  },

  getExamStructure: async () => {
    set({ loading: true, error: null });
    try {
      const res = await api.get('/cbt/getsubject');
      
      set({
        examStructure: res.data.subjects,
        error: null,
        loading: false,
      });

      return res.data.subjects;
    } catch (err) {
      console.error("Error getting exam structure:", err);
      set({
        error: err.response?.data?.message || "❌ Failed to get exam structure",
        loading: false,
      });
      throw err;
    }
  },

  getSubject: async () => {
    return await get().getExamStructure();
  },
// ============================================================
// UPDATED addTopic function for cbtStore.jsx
// Replace the existing addTopic function (around line 594-616)
// ============================================================

addTopic: async (level, subjectName, topics) => {
  set({ loading: true, error: null, message: null });
  try {
    // ✅ FIXED: Send data in the format backend expects
    const res = await api.post('/cbt/addtopic', {
      level,        // Level NAME (e.g., "SS1")
      subjectName,  // Subject NAME (e.g., "Mathematics")
      topics,       // Array of topic objects (e.g., [{ name: "Algebra" }])
    });

    set({
      message: res.data.message || "✅ Topic added successfully",
      error: null,
      loading: false,
    });

    // Reload exam structure to show the new topic
    await get().getExamStructure();
    
    return res.data;
  } catch (err) {
    console.error("Error adding topic:", err);
    const errorMsg = err.response?.data?.message || "❌ Failed to add topic";
    set({ error: errorMsg, loading: false });
    throw err;
  }
},

  // ==================== ATTEMPTS & ANALYTICS ====================

  getAllAttempts: async () => {
    set({ loading: true, error: null });
    try {
      const res = await api.get('/cbt/attempts');
      
      set({ 
        attempts: res.data.attempts, 
        loading: false,
        error: null 
      });

      return res.data.attempts;
    } catch (err) {
      console.error("Error fetching attempts:", err);
      set({ 
        error: err.response?.data?.message || "Failed to load attempts", 
        loading: false 
      });
      throw err;
    }
  },

  getUserAttempts: async (userId) => {
    set({ loading: true, error: null });
    try {
      const res = await api.get(`/cbt/attempts/user/${userId}`);
      
      set({ 
        userAttempts: res.data.attempts, 
        loading: false,
        error: null 
      });

      return res.data.attempts;
    } catch (err) {
      console.error("Error fetching user attempts:", err);
      set({ 
        error: err.response?.data?.message || "Failed to load attempts", 
        loading: false 
      });
      throw err;
    }
  },

  getAttemptSummary: async (userId) => {
    set({ loading: true, error: null });
    try {
      const res = await api.get(`/cbt/attempts/summary/${userId}`);
      
      set({ 
        attemptSummary: res.data.summary, 
        loading: false,
        error: null 
      });

      return res.data.summary;
    } catch (err) {
      console.error("Error fetching summary:", err);
      set({ 
        error: err.response?.data?.message || "Failed to load summary", 
        loading: false 
      });
      throw err;
    }
  },
  // ============================================================================
// ADD THESE FUNCTIONS TO YOUR cbtStore.jsx
// ADD THEM AFTER LINE 295 (after getYearSubjects function)
// BEFORE THE VISIBILITY CONTROL SECTION
// ============================================================================

  // ==================== 🆕 VISIBILITY CONTROL ====================

  /**
   * Toggle year visibility (show/hide entire year from students)
   */
  toggleYearVisibility: async (examId, year, isAvailable) => {
    set({ loading: true, error: null, message: null });
    try {
      const res = await api.put(
        `/cbt/exams/${examId}/years/${year}/visibility`,
        { isAvailable }
      );
      
      set((state) => ({
        exams: state.exams.map(exam => 
          exam._id === examId ? res.data.data : exam
        ),
        selectedExam: res.data.data,
        message: res.data.message || `✅ Year ${year} ${isAvailable ? 'shown' : 'hidden'}`,
        loading: false,
        error: null,
      }));
      
      return res.data.data;
    } catch (err) {
      console.error("Error toggling year visibility:", err);
      const errorMsg = err.response?.data?.message || "❌ Failed to update year visibility";
      set({ error: errorMsg, loading: false });
      throw err;
    }
  },

  /**
   * Toggle subject visibility (show/hide specific subject from students)
   */
  toggleSubjectVisibility: async (examId, year, subject, isVisible) => {
    set({ loading: true, error: null, message: null });
    try {
      const res = await api.put(
        `/cbt/exams/${examId}/years/${year}/subjects/${encodeURIComponent(subject)}/visibility`,
        { isVisible }
      );
      
      set((state) => ({
        exams: state.exams.map(exam => 
          exam._id === examId ? res.data.data : exam
        ),
        selectedExam: res.data.data,
        message: res.data.message || `✅ ${subject} ${isVisible ? 'shown' : 'hidden'}`,
        loading: false,
        error: null,
      }));
      
      return res.data.data;
    } catch (err) {
      console.error("Error toggling subject visibility:", err);
      const errorMsg = err.response?.data?.message || "❌ Failed to update subject visibility";
      set({ error: errorMsg, loading: false });
      throw err;
    }
  },

  /**
   * Bulk update visibility for multiple subjects
   */
  bulkUpdateVisibility: async (examId, updates) => {
    set({ loading: true, error: null, message: null });
    try {
      const res = await api.post(
        `/cbt/exams/${examId}/bulk-visibility`,
        { updates }
      );
      
      set((state) => ({
        exams: state.exams.map(exam => 
          exam._id === examId ? res.data.data : exam
        ),
        selectedExam: res.data.data,
        message: res.data.message || `✅ Updated ${updates.length} subjects`,
        loading: false,
        error: null,
      }));
      
      return res.data.results;
    } catch (err) {
      console.error("Error bulk updating visibility:", err);
      const errorMsg = err.response?.data?.message || "❌ Failed to bulk update visibility";
      set({ error: errorMsg, loading: false });
      throw err;
    }
  },

  /**
   * Sync question counts for all subjects in an exam
   */
  syncQuestionCounts: async (examId) => {
    set({ loading: true, error: null, message: null });
    try {
      const res = await api.post(`/cbt/exams/${examId}/sync-counts`);
      
      // Refresh the exams list to get updated counts
      await get().getExamsForAdmin();
      
      set({
        message: res.data.message || "✅ Question counts synchronized",
        loading: false,
        error: null,
      });
      
      return res.data.updates;
    } catch (err) {
      console.error("Error syncing counts:", err);
      const errorMsg = err.response?.data?.message || "❌ Failed to sync question counts";
      set({ error: errorMsg, loading: false });
      throw err;
    }
  },

// ============================================================================
// END OF NEW FUNCTIONS
// ============================================================================
  

  // ==================== UTILITY METHODS ====================

  clearError: () => set({ error: null }),
  clearMessage: () => set({ message: null }),

  reset: () => set({
    exams: [],
    selectedExam: null,
    examYears: [],
    examSubjects: [],
    questions: [],
    selectedQuestion: null,
    questionCount: 0,
    examStructure: [],
    attempts: [],
    userAttempts: [],
    attemptSummary: null,
    loading: false,
    error: null,
    message: null,
  }),
}));