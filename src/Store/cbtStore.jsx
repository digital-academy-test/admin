// src/Store/cbtStore.js
import axios from "axios";
import { create } from "zustand";

const API_URL = import.meta.env.VITE_API_URL;

export const useCbtStore = create((set) => ({
    exams: [],
  question: [],
  count: null,
  examData: [],
  loading: false,
  error: null,
  message: null,

  // ✅ Add a new subject
  addSubject: async (level, name) => {
    set({ loading: true, error: null, message: null });
    try {
      const res = await axios.post(`${API_URL}/cbt/addsubject`, {
        level, // ✅ match backend schema
        name,
      });

      set({
        message: res.data.message || "✅ Subject added successfully",
        error: null,
        loading: false,
      });
    } catch (err) {
      console.error("Error adding subject:", err);
      set({
        error: err.response?.data?.message || "❌ Failed to add subject",
        loading: false,
      });
    }
  },

  // ✅ Get all levels + subjects
  getSubject: async () => {
    set({ loading: true, error: null });
    try {
      const res = await axios.get(`${API_URL}/cbt/getsubject`);
      set({
        examData: res.data.subjects, // levels with subjects
        error: null,
        loading: false,
      });
    } catch (err) {
      console.error("Error getting subject:", err);
      set({
        error: err.response?.data?.message || "❌ Failed to get subject",
        loading: false,
      });
    }
  },

  // ✅ Add a new topic
addTopic: async (levelId, subjectId, topicName) => {
  set({ loading: true, error: null, message: null });
  try {
    const res = await axios.post(`${API_URL}/cbt/addtopic`, {
      levelId,
      subjectId,
      topicName,
    });
 

    set({
      message: res.data.message || "✅ Topic added successfully",
      error: null,
      loading: false,
    });


    // Optional: refresh subjects after adding topic
    await useCbtStore.getState().getSubject();
  } catch (err) {
    console.error("Error adding topic:", err);
    set({
      error: err.response?.data?.message || "❌ Failed to add topic",
      loading: false,
    });
  }
},

 addQuestion: async (formData) => {
  set({ loading: true, error: null, message: null });

  try {
    const res = await axios.post(`${API_URL}/cbt/addquestion`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });

    set({
      message: res.data.message || "✅ Question added successfully",
      loading: false,
      error: null,
    });

    return res.data; // ✅ return so component can use it
  } catch (err) {
    console.error("Error adding question:", err);
    set({
      error: err.response?.data?.message || "❌ Failed to add question",
      loading: false,
    });
    throw err;
  }
},

  // Get all available exams
  getExams: async () => {
    set({ loading: true, error: null });
    try {
      const res = await axios.get(`${API_URL}/cbt/exams`);
      console.log(res.data.exams);
      set({ exams: res.data.exams, loading: false });
    } catch (err) {
      console.error("Failed to fetch exams:", err);
      set({ error: "Failed to load exams", loading: false });
    }
  },

  // Get questions by exam, year, and subject
getQuestion: async (exam, year, subject) => {
  set({ isLoading: true, error: null });
  try {
    const response = await axios.get(`${API_URL}/cbt/questions?exam=${exam}&year=${year}&subject=${subject}`);
    
    const { questions, count } = response.data;

    set({ question: questions, count, isLoading: false });

    return response.data; // ✅ RETURN the data so component can use it
  } catch (error) {
    set({ error: error.response?.data?.message || "Error fetching questions", isLoading: false });
    throw error;
  }
},
// ✅ Update question
updateQuestion: async (id, data) => {
  try {
    const res = await axios.put(`${API_URL}/cbt/updatequestion/${id}`, data);
    return res.data;
  } catch (err) {
    console.error("Error updating question:", err);
    throw err;
  }
},

// ✅ Delete question
deleteQuestion: async (id) => {
  try {
    const res = await axios.delete(`${API_URL}/cbt/deletequestion/${id}`);
    return res.data;
  } catch (err) {
    console.error("Error deleting question:", err);
    throw err;
  }
},


}));
