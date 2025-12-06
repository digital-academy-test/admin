import axios from "axios";
import { create } from "zustand";

const API_URL = import.meta.env.VITE_API_URL;

export const useCoursestore = create((set) => ({
  course: {},
    courses:[],
  loading: false,
  error: null,
  message: null,
  addCourse: async (courseData) => {
    set({ loading: true, error: null });

    try {
      const res = await axios.post(`${API_URL}/course/add`, courseData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
        set({     message: res.data.message,
        error: null,
        loading: false,})
    } catch (err) {
      console.error("Error Add Course:", err);
      set({ error: "Failed to add course", loading: false });
    }
    },
    getAllCourses: async () => {
      set({ loading: true, error: null });

      try {
        const res = await axios.get(`${API_URL}/course`);
        console.log("Fetched courses:", res.data);
        set({ courses: res.data.courses, loading: false, error: null });
      } catch (err) {
        console.error("Error fetching courses:", err);
        set({ error: "Failed to fetch courses", loading: false });
      }
    },
    addcoursesection: async (sectionData) => {
      set({ loading: true, error: null });  
      try {
        if(sectionData.contentType === "quiz"){
          console.log("Section Data (Quiz):", sectionData);
          const res = await axios.post(`${API_URL}/course/section/add`, sectionData);
          set({     message: res.data.message,
          error: null,  
          loading: false,})
          return;
        }else{
           const res = await axios.post(`${API_URL}/course/section/add`, sectionData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
          set({     message: res.data.message,
          error: null,
          loading: false,})
        }
      } catch (err) {
        console.error("Error Add Course Section:", err);
        set({ error: "Failed to add course section", loading: false });
      }
      },
    addcoursesection: async (sectionData) => {
        set({ loading: true, error: null, message: "" });
        try {
          let res;
          if (sectionData.contentType === "quiz") {
            res = await axios.post(`${API_URL}/course/section/add`, sectionData);
          } else {
            res = await axios.post(`${API_URL}/course/section/add`, sectionData, {
              headers: { "Content-Type": "multipart/form-data" },
            });
          }

          set({
            message: res.message || "Section added successfully!",
            loading: false,
            error: null,
          });
        } catch (err) {
          console.error("Error Add Course Section:", err);
          set({ error: "Failed to add course section", loading: false });
        }
      },
    updateCourse: async (id, data)=>{
       set({ loading: true, error: null, message: "" });
        try {
          let res =  await axios.put(
          `${API_URL}/course/update/${id}`,
          data
        );
          

          set({
            message: res.message || "Section added successfully!",
            loading: false,
            error: null,
          });
        } catch (err) {
          console.error("Error Add Course Section:", err);
          set({ error: "Failed to add course section", loading: false });
        }
    },
      // ✅ Fetch recommended courses
  fetchCourseDetail: async (courseId) => {
    set({ loading: true, error: null });
    
    try {
      const res = await axios.get(`${API_URL}/course/${courseId}/full`);
      console.log(res.data)
    
      set({ course: res.data.course, loading: false });
    } catch (err) {
      console.error("Course not found:", err);
      set({ error: "Failed to load course details", loading: false });
    }
  },
  deleteCourse: async (id) => {
        set({ loading: true, error: null, message: null });
        try {
            const res = await axios.delete(`${API_URL}/course/delete/${id}`);
            set({
                message: res.data.message || "✅ course deleted successfully",
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
    


  
}));

