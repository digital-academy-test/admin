// src/Store/cbtStore.js
import axios from "axios";
import { create } from "zustand";

const API_URL = import.meta.env.VITE_API_URL;

export const useBlogStore = create((set) => ({
    blogs: [],
    loading: false,
  error: null,
  message: null,
  Postblog: async (data) => {
    set({ loading: true, error: null, message: null });
    try{
          const res = await axios.post(`${API_URL}/blog/create`, data, {
                headers: { "Content-Type": "multipart/form-data" },
            });
            set({
                message: res.data.message || "✅ Blog created successfully",
                error: null,
                loading: false,
              });

    }catch(err){
        console.error("Error creating blog:", err);
        set({
            error: err.response?.data?.message || "❌ Failed to create blog",
            loading: false,
          });
    }  
    },
    getBlog: async () => {
        set({ loading: true, error: null });    
        try {
            const res = await axios.get(`${API_URL}/blog/get_all`);
            set({
                blogs: res.data, 
                
                loading: false,
              });
        } catch (err) { 
            console.error("Error getting blogs:", err);
            set({
                error: err.response?.data?.message || "❌ Failed to get blogs",
                loading: false,
              });
        }
    },
    deleteBlog: async (id) => {
        set({ loading: true, error: null, message: null });
        try {
            const res = await axios.delete(`${API_URL}/blog/delete/${id}`);
            set({
                message: res.data.message || "✅ Blog deleted successfully",
                error: null,
                loading: false,
              });
        }
            catch (err) {
            console.error("Error deleting blog:", err);
            set({
                error: err.response?.data?.message || "❌ Failed to delete blog",
                loading: false,
              });
        }
    },
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
        } catch (err) {
            console.error("Error updating blog:", err);
            set({
                error: err.response?.data?.message || "❌ Failed to update blog",
                loading: false,
              });
        }
    },
 

}));