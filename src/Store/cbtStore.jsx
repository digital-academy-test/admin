// src/Store/cbtStore.js
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
  examStructure: [], // Levels with subjects and topics
  examData: [], // Alias for backward compatibility
  
  // Attempts & Analytics
  attempts: [],
  userAttempts: [],
  attemptSummary: null,

  // UI State
  loading: false,
  error: null,
  message: null,

  // ==================== BACKWARD COMPATIBILITY ====================
  // Computed property for old components
  get examData() {
    return get().examStructure;
  },

  // ==================== EXAM MANAGEMENT ====================
  
  /**
   * Create a new exam
   * @param {Object} examData - { name, displayName, category, defaultTimePerQuestion, defaultTotalTime, passingPercentage, instructions }
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
   * Get all exams
   * @param {Object} filters - { category, isActive }
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
   * Get single exam by ID
   */
  getExamById: async (examId) => {
    set({ loading: true, error: null });
    try {
      const res = await api.get(`/cbt/exams/${examId}`);
      
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
   * @param {String} examId
   * @param {Boolean} permanent - If true, hard delete; if false, soft delete
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
   * @param {String} examId
   * @param {Object} yearData - { year, subjects: [{ name, timeAllocation }] }
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
   * @param {String} examId
   * @param {Number} year
   * @param {Object} subjectData - { name, timeAllocation }
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
   * Get years for an exam
   */
  getExamYears: async (examId) => {
    set({ loading: true, error: null });
    try {
      const res = await api.get(`/cbt/exams/${examId}/years`);
      
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
   * Get subjects for exam year
   */
  getYearSubjects: async (examId, year) => {
    set({ loading: true, error: null });
    try {
      const res = await api.get(`/cbt/exams/${examId}/years/${year}/subjects`);
      
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

  // ==================== QUESTION MANAGEMENT ====================

  /**
   * Add single question with image support
   * @param {FormData} formData - Must include all question fields and images
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
   * Add multiple questions (bulk upload)
   * @param {Object} bulkData - { questions: [], examId, examName, year, subject }
   */
  addBulkQuestions: async (bulkData) => {
    set({ loading: true, error: null, message: null });
    try {
      const res = await api.post('/cbt/questions/bulk', bulkData);

      set({
        message: res.data.message || "✅ Questions added successfully",
        loading: false,
        error: null,
      });

      return res.data;
    } catch (err) {
      console.error("Error adding bulk questions:", err);
      const errorMsg = err.response?.data?.message || "❌ Failed to add questions";
      set({ error: errorMsg, loading: false });
      throw err;
    }
  },

  /**
   * Get questions with filters
   * @param {Object} filters - { examId, examName, year, subject, topic, difficulty, shuffle }
   */
  getQuestions: async (filters = {}) => {
    set({ loading: true, error: null });
   
    try {
      const params = new URLSearchParams(filters).toString();
       console.log(`/cbt/questions?${params}`);
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

  // ==================== LEGACY SUPPORT (BACKWARD COMPATIBILITY) ====================

  /**
   * Add subject (legacy)
   */
  addSubject: async (level, name) => {
    set({ loading: true, error: null, message: null });
    try {
      const res = await api.post('/cbt/addsubject', { level, name });

      set({
        message: res.data.message || "✅ Subject added successfully",
        error: null,
        loading: false,
      });

      // Refresh exam structure
      await get().getExamStructure();
    } catch (err) {
      console.error("Error adding subject:", err);
      const errorMsg = err.response?.data?.message || "❌ Failed to add subject";
      set({ error: errorMsg, loading: false });
      throw err;
    }
  },

  /**
   * Get exam structure (legacy - levels, subjects, topics)
   * Also serves as the main method for getSubject
   */
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

  /**
   * Alias for backward compatibility - calls getExamStructure
   */
  getSubject: async () => {
    return await get().getExamStructure();
  },

  /**
   * Add topic (legacy)
   */
  addTopic: async (levelId, subjectId, topicName) => {
    set({ loading: true, error: null, message: null });
    try {
      const res = await api.post('/cbt/addtopic', {
        levelId,
        subjectId,
        topicName,
      });

      set({
        message: res.data.message || "✅ Topic added successfully",
        error: null,
        loading: false,
      });

      // Refresh exam structure
      await get().getExamStructure();
    } catch (err) {
      console.error("Error adding topic:", err);
      const errorMsg = err.response?.data?.message || "❌ Failed to add topic";
      set({ error: errorMsg, loading: false });
      throw err;
    }
  },

  // ==================== ATTEMPTS & ANALYTICS ====================

  /**
   * Get all attempts (admin)
   */
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

  /**
   * Get user attempts
   */
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

  /**
   * Get attempt summary/analytics
   */
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

  // ==================== UTILITY METHODS ====================

  /**
   * Clear error message
   */
  clearError: () => set({ error: null }),

  /**
   * Clear success message
   */
  clearMessage: () => set({ message: null }),

  /**
   * Reset store to initial state
   */
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