// src/Store/blogStore.js - UPDATED with Comments
import axios from "axios";
import { create } from "zustand";

const API_URL = import.meta.env.VITE_API_URL;

export const useBlogStore = create((set) => ({
  blogs: [],
  currentBlog: null,
  loading: false,
  error: null,
  message: null,

  // ==================== BLOG CRUD ====================
  
  /**
   * Create new blog
   */
  Postblog: async (data) => {
    set({ loading: true, error: null, message: null });
    try {
      const res = await axios.post(`${API_URL}/blog/create`, data, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      set({
        message: res.data.message || "✅ Blog created successfully",
        error: null,
        loading: false,
      });
      return res.data;
    } catch (err) {
      console.error("Error creating blog:", err);
      set({
        error: err.response?.data?.message || "❌ Failed to create blog",
        loading: false,
      });
      throw err;
    }
  },

  /**
   * Get all blogs
   */
  getBlog: async (params = {}) => {
    set({ loading: true, error: null });
    try {
      const queryString = new URLSearchParams(params).toString();
      const res = await axios.get(`${API_URL}/blog/get_all${queryString ? `?${queryString}` : ''}`);
      set({
        blogs: res.data.blogs || res.data,
        loading: false,
        error: null,
      });
      return res.data;
    } catch (err) {
      console.error("Error getting blogs:", err);
      set({
        error: err.response?.data?.message || "❌ Failed to get blogs",
        loading: false,
      });
      throw err;
    }
  },

  /**
   * Get single blog by ID
   */
  getBlogById: async (id) => {
    set({ loading: true, error: null });
    try {
      const res = await axios.get(`${API_URL}/blog/get_blog/${id}`);
      set({
        currentBlog: res.data.blog,
        loading: false,
        error: null,
      });
      return res.data;
    } catch (err) {
      console.error("Error getting blog:", err);
      set({
        error: err.response?.data?.message || "❌ Failed to get blog",
        loading: false,
      });
      throw err;
    }
  },

  /**
   * Update blog
   */
  updateBlog: async (id, data) => {
    set({ loading: true, error: null, message: null });
    try {
      const res = await axios.put(`${API_URL}/blog/update/${id}`, data, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      set({
        message: res.data.message || "✅ Blog updated successfully",
        error: null,
        loading: false,
      });
      return res.data;
    } catch (err) {
      console.error("Error updating blog:", err);
      set({
        error: err.response?.data?.message || "❌ Failed to update blog",
        loading: false,
      });
      throw err;
    }
  },

  /**
   * Delete blog
   */
  deleteBlog: async (id) => {
    set({ loading: true, error: null, message: null });
    try {
      const res = await axios.delete(`${API_URL}/blog/delete/${id}`);
      set({
        message: res.data.message || "✅ Blog deleted successfully",
        error: null,
        loading: false,
      });
      return res.data;
    } catch (err) {
      console.error("Error deleting blog:", err);
      set({
        error: err.response?.data?.message || "❌ Failed to delete blog",
        loading: false,
      });
      throw err;
    }
  },

  // ==================== COMMENTS ====================

  /**
   * Add comment to blog
   */
  addComment: async (blogId, commentData) => {
    set({ loading: true, error: null });
    try {
      const res = await axios.post(`${API_URL}/blog/${blogId}/comment`, commentData);
      set({
        message: "✅ Comment added successfully",
        error: null,
        loading: false,
      });
      return res.data;
    } catch (err) {
      console.error("Error adding comment:", err);
      set({
        error: err.response?.data?.message || "❌ Failed to add comment",
        loading: false,
      });
      throw err;
    }
  },

  /**
   * Update comment
   */
  updateComment: async (blogId, commentId, comment) => {
    set({ loading: true, error: null });
    try {
      const res = await axios.put(`${API_URL}/blog/${blogId}/comment/${commentId}`, { comment });
      set({
        message: "✅ Comment updated successfully",
        error: null,
        loading: false,
      });
      return res.data;
    } catch (err) {
      console.error("Error updating comment:", err);
      set({
        error: err.response?.data?.message || "❌ Failed to update comment",
        loading: false,
      });
      throw err;
    }
  },

  /**
   * Delete comment
   */
  deleteComment: async (blogId, commentId) => {
    set({ loading: true, error: null });
    try {
      const res = await axios.delete(`${API_URL}/blog/${blogId}/comment/${commentId}`);
      set({
        message: "✅ Comment deleted successfully",
        error: null,
        loading: false,
      });
      return res.data;
    } catch (err) {
      console.error("Error deleting comment:", err);
      set({
        error: err.response?.data?.message || "❌ Failed to delete comment",
        loading: false,
      });
      throw err;
    }
  },

  /**
   * Like/Unlike comment
   */
  likeComment: async (blogId, commentId) => {
    try {
      const res = await axios.post(`${API_URL}/blog/${blogId}/comment/${commentId}/like`);
      return res.data;
    } catch (err) {
      console.error("Error liking comment:", err);
      set({ error: err.response?.data?.message || "❌ Failed to like comment" });
      throw err;
    }
  },

  /**
   * Add reply to comment
   */
  addReply: async (blogId, commentId, replyData) => {
    set({ loading: true, error: null });
    try {
      const res = await axios.post(`${API_URL}/blog/${blogId}/comment/${commentId}/reply`, replyData);
      set({
        message: "✅ Reply added successfully",
        error: null,
        loading: false,
      });
      return res.data;
    } catch (err) {
      console.error("Error adding reply:", err);
      set({
        error: err.response?.data?.message || "❌ Failed to add reply",
        loading: false,
      });
      throw err;
    }
  },

  /**
   * Like/Unlike blog
   */
  likeBlog: async (blogId) => {
    try {
      const res = await axios.post(`${API_URL}/blog/${blogId}/like`);
      return res.data;
    } catch (err) {
      console.error("Error liking blog:", err);
      set({ error: err.response?.data?.message || "❌ Failed to like blog" });
      throw err;
    }
  },

  // ==================== UTILITIES ====================

  /**
   * Clear messages
   */
  clearMessages: () => {
    set({ message: null, error: null });
  },

  /**
   * Clear current blog
   */
  clearCurrentBlog: () => {
    set({ currentBlog: null });
  },
}));