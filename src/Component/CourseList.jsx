import React, { useEffect, useState } from "react";
import CourseCard from "./CourseCard";
import { useCourseStore } from "../Store/courseStore";
import { FiSearch } from "react-icons/fi";
import axios from "axios";

function CourseList() {
  const { courses, getAllCourses, loading, error,deleteCourse } = useCourseStore();
  const [searchTerm, setSearchTerm] = useState("");
  const [courseList, setCourseList] = useState([]);

  useEffect(() => {
    const fetchCourses = async () => {
      await getAllCourses();
    };
    fetchCourses();
  }, [getAllCourses]);

  // Sync local list with store
  useEffect(() => {
    setCourseList(courses);
  }, [courses]);

  // ✅ Handle course deletion
  const handleDelete = async (id) => {
    const confirmDelete = window.confirm("Are you sure you want to delete this course?");
    if (!confirmDelete) return;

    try {
      deleteCourse(id);
      setCourseList((prev) => prev.filter((course) => course._id !== id));
      alert("Course deleted successfully!");
    } catch (error) {
      console.error("Delete error:", error);
      alert("Failed to delete course. Please try again.");
    }
  };

  // ✅ Filter courses based on search term
  const filteredCourses = courseList.filter(
    (course) =>
      course.course_title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      course.short_description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="container py-5">
      <div className="d-flex flex-column flex-md-row align-items-md-center justify-content-between mb-4">
        <h2 className="fw-bold mb-3 mb-md-0">Course Management</h2>

        {/* Search Bar */}
        <div className="input-group w-100 w-md-50" style={{ maxWidth: "350px" }}>
          <span className="input-group-text bg-white border-end-0">
            <FiSearch className="text-muted" />
          </span>
          <input
            type="text"
            className="form-control border-start-0"
            placeholder="Search courses..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {loading ? (
        <div className="text-center my-5">
          <div className="spinner-border text-primary"></div>
        </div>
      ) : error ? (
        <p className="text-danger text-center">{error}</p>
      ) : filteredCourses.length === 0 ? (
        <p className="text-center text-muted">No matching courses found.</p>
      ) : (
        <div className="row">
          {filteredCourses.map((course) => (
            <CourseCard key={course._id} course={course} onDelete={handleDelete} />
          ))}
        </div>
      )}
    </div>
  );
}

export default CourseList;
