// src/pages/Admin/ManageCourses.jsx - FINAL FIX
import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { FaEdit, FaTrash, FaEye, FaPlus, FaCheck, FaTimes, FaChartBar } from "react-icons/fa";
import { useCourseStore } from "../Store/courseStore";

const ManageCourses = () => {
  const navigate = useNavigate();
  const { courses, loading, getAllCourses, deleteCourse, togglePublishCourse } = useCourseStore();
  
  const [filters, setFilters] = useState({
    search: "",
    category: "",
    level: "",
    is_published: "",
  });

  // ✅ Load ALL courses on mount (without filters)
  useEffect(() => {
    console.log("📥 Loading ALL courses on mount...");
    loadAllCourses();
  }, []);

  // ✅ Debug: Log courses when they change
  useEffect(() => {
    console.log("📊 Courses updated:", courses);
    console.log("📊 Total courses:", courses?.length || 0);
  }, [courses]);

  // ✅ Load all courses without filters
  const loadAllCourses = async () => {
    try {
      console.log("🔄 Fetching ALL courses (no filters)");
      await getAllCourses({});  // ✅ Pass empty object, not filters state
    } catch (error) {
      console.error("❌ Error loading courses:", error);
      toast.error("Failed to load courses");
    }
  };

  // ✅ Load courses WITH filters (when user clicks "Apply Filters")
  const loadCourses = async () => {
    try {
      console.log("🔄 Fetching courses with filters:", filters);
      
      // ✅ Only send non-empty filters
      const activeFilters = {};
      if (filters.search) activeFilters.search = filters.search;
      if (filters.category) activeFilters.category = filters.category;
      if (filters.level) activeFilters.level = filters.level;
      if (filters.is_published) activeFilters.is_published = filters.is_published;
      
      console.log("🔍 Active filters:", activeFilters);
      await getAllCourses(activeFilters);
    } catch (error) {
      console.error("❌ Error loading courses:", error);
      toast.error("Failed to load courses");
    }
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters({ ...filters, [name]: value });
  };

  const handleSearch = () => {
    console.log("🔍 Applying filters:", filters);
    loadCourses();
  };

  // ✅ Clear filters and reload all
  const handleClearFilters = () => {
    setFilters({
      search: "",
      category: "",
      level: "",
      is_published: "",
    });
    loadAllCourses();
    toast.success("Filters cleared");
  };

  const handleDelete = async (id, title) => {
    if (window.confirm(`Are you sure you want to delete "${title}"? This will delete all sections, enrollments, and related data.`)) {
      try {
        await deleteCourse(id);
        toast.success("✅ Course deleted successfully");
        loadAllCourses(); // Reload all courses after delete
      } catch (error) {
        console.error("❌ Delete error:", error);
        toast.error("Failed to delete course");
      }
    }
  };

  const handleTogglePublish = async (id, currentStatus) => {
    try {
      await togglePublishCourse(id, !currentStatus);
      toast.success(currentStatus ? "✅ Course unpublished" : "✅ Course published");
      loadAllCourses(); // Reload all courses after toggle
    } catch (error) {
      console.error("❌ Toggle publish error:", error);
      toast.error("Failed to update course status");
    }
  };

  // ✅ Loading state
  if (loading && (!courses || courses.length === 0)) {
    return (
      <div className="container py-5">
        <div className="text-center">
          <div className="spinner-border text-primary" style={{ width: "3rem", height: "3rem" }}>
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="mt-3 text-muted">Loading courses...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container-fluid py-4" style={{ backgroundColor: "#f8f9fa", minHeight: "100vh" }}>
      <div className="container">
        {/* Header */}
        <div className="d-flex justify-content-between align-items-center mb-4">
          <div>
            <h2 className="fw-bold mb-2" style={{ color: "#014925" }}>Manage Courses</h2>
            <p className="text-muted mb-0">View, edit, and manage all courses</p>
          </div>
          <Link
            to="/add-course"
            className="btn text-white d-flex align-items-center gap-2"
            style={{ backgroundColor: "#0C6F89" }}
          >
            <FaPlus /> Create New Course
          </Link>
        </div>

        {/* Filters */}
        <div className="card border-0 shadow-sm mb-4">
          <div className="card-body">
            <div className="row g-3">
              {/* Search */}
              <div className="col-md-6">
                <input
                  type="text"
                  name="search"
                  value={filters.search}
                  onChange={handleFilterChange}
                  placeholder="Search courses..."
                  className="form-control"
                />
              </div>

              {/* Category */}
              <div className="col-md-3">
                <select
                  name="category"
                  value={filters.category}
                  onChange={handleFilterChange}
                  className="form-select"
                >
                  <option value="">All Categories</option>
                  <option value="Programming">Programming</option>
                  <option value="Design">Design</option>
                  <option value="Business">Business</option>
                  <option value="Marketing">Marketing</option>
                  <option value="Personal Development">Personal Development</option>
                  <option value="Photography">Photography</option>
                  <option value="Music">Music</option>
                  <option value="Health & Fitness">Health & Fitness</option>
                </select>
              </div>

              {/* Status */}
              <div className="col-md-3">
                <select
                  name="is_published"
                  value={filters.is_published}
                  onChange={handleFilterChange}
                  className="form-select"
                >
                  <option value="">All Status (Published + Draft)</option>
                  <option value="true">Published Only</option>
                  <option value="false">Draft Only</option>
                </select>
              </div>
            </div>

            <div className="d-flex gap-2 mt-3">
              <button
                onClick={handleSearch}
                className="btn text-white"
                style={{ backgroundColor: "#0C6F89" }}
              >
                <i className="bi bi-funnel me-2"></i>
                Apply Filters
              </button>
              <button
                onClick={handleClearFilters}
                className="btn btn-outline-secondary"
              >
                <i className="bi bi-x-circle me-2"></i>
                Clear Filters
              </button>
            </div>
          </div>
        </div>

        {/* Courses Table */}
        <div className="card border-0 shadow-sm">
          <div className="card-body p-0">
            {!courses || courses.length === 0 ? (
              <div className="text-center py-5">
                <i className="bi bi-inbox fs-1 text-muted mb-3 d-block"></i>
                <p className="text-muted mb-3">
                  {loading ? "Loading courses..." : "No courses found"}
                </p>
                <Link
                  to="/add-course"
                  className="btn text-white"
                  style={{ backgroundColor: "#0C6F89" }}
                >
                  <FaPlus className="me-2" /> Create Your First Course
                </Link>
              </div>
            ) : (
              <div className="table-responsive">
                <table className="table table-hover mb-0">
                  <thead className="table-light">
                    <tr>
                      <th className="px-4 py-3">Course</th>
                      <th className="px-4 py-3">Category</th>
                      <th className="px-4 py-3">Price</th>
                      <th className="px-4 py-3">Enrolled</th>
                      <th className="px-4 py-3">Status</th>
                      <th className="px-4 py-3">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {courses.map((course) => (
                      <tr key={course._id}>
                        {/* Course Info */}
                        <td className="px-4 py-3">
                          <div className="d-flex align-items-center gap-3">
                            {course.course_thumbnail ? (
                              <img
                                src={course.course_thumbnail}
                                alt={course.course_title}
                                className="rounded"
                                style={{ width: "64px", height: "64px", objectFit: "cover" }}
                              />
                            ) : (
                              <div 
                                className="rounded d-flex align-items-center justify-content-center bg-secondary"
                                style={{ width: "64px", height: "64px" }}
                              >
                                <i className="bi bi-image text-white fs-3"></i>
                              </div>
                            )}
                            <div>
                              <div className="fw-semibold">{course.course_title}</div>
                              <div className="text-muted small">by {course.instructor}</div>
                            </div>
                          </div>
                        </td>

                        {/* Category */}
                        <td className="px-4 py-3">
                          <span className="badge bg-primary">{course.category}</span>
                        </td>

                        {/* Price */}
                        <td className="px-4 py-3">
                          {course.is_free ? (
                            <span className="text-success fw-semibold">FREE</span>
                          ) : (
                            <div>
                              <div className="fw-semibold">${course.original_price}</div>
                              {course.discount_price && (
                                <div className="text-muted small text-decoration-line-through">
                                  ${course.discount_price}
                                </div>
                              )}
                            </div>
                          )}
                        </td>

                        {/* Enrolled */}
                        <td className="px-4 py-3">
                          <div className="fw-semibold">{course.enrollment_count || 0}</div>
                          <div className="text-muted small">students</div>
                        </td>

                        {/* Status */}
                        <td className="px-4 py-3">
                          <button
                            onClick={() => handleTogglePublish(course._id, course.is_published)}
                            className={`btn btn-sm ${
                              course.is_published
                                ? "btn-success"
                                : "btn-secondary"
                            }`}
                          >
                            {course.is_published ? (
                              <>
                                <FaCheck className="me-1" /> Published
                              </>
                            ) : (
                              <>
                                <FaTimes className="me-1" /> Draft
                              </>
                            )}
                          </button>
                        </td>

                        {/* Actions */}
                        <td className="px-4 py-3">
                          <div className="d-flex gap-2">
                            {/* View Stats */}
                            <button
                              onClick={() => navigate(`/course/${course._id}/stats`)}
                              className="btn btn-sm btn-outline-primary"
                              title="View Statistics"
                            >
                              <FaChartBar />
                            </button>

                            {/* View/Manage */}
                            <button
                              onClick={() => navigate(`/add_section/${course._id}`)}
                              className="btn btn-sm btn-outline-success"
                              title="add section to Course"
                            >
                              <FaEye />
                            </button>

                            {/* Edit */}
                            <button
                              onClick={() => navigate(`/edit_course/${course._id}`)}
                              className="btn btn-sm btn-outline-info"
                              title="Edit Course"
                            >
                              <FaEdit />
                            </button>

                            {/* Delete */}
                            <button
                              onClick={() => handleDelete(course._id, course.course_title)}
                              className="btn btn-sm btn-outline-danger"
                              title="Delete Course"
                            >
                              <FaTrash />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* Summary Stats */}
        {courses && courses.length > 0 && (
          <div className="row g-3 mt-4">
            <div className="col-md-3">
              <div className="card border-0 shadow-sm">
                <div className="card-body text-center">
                  <div className="text-muted small">Total Courses</div>
                  <div className="fs-3 fw-bold" style={{ color: "#014925" }}>
                    {courses.length}
                  </div>
                </div>
              </div>
            </div>
            <div className="col-md-3">
              <div className="card border-0 shadow-sm">
                <div className="card-body text-center">
                  <div className="text-muted small">Published</div>
                  <div className="fs-3 fw-bold text-success">
                    {courses.filter((c) => c.is_published).length}
                  </div>
                </div>
              </div>
            </div>
            <div className="col-md-3">
              <div className="card border-0 shadow-sm">
                <div className="card-body text-center">
                  <div className="text-muted small">Draft</div>
                  <div className="fs-3 fw-bold text-secondary">
                    {courses.filter((c) => !c.is_published).length}
                  </div>
                </div>
              </div>
            </div>
            <div className="col-md-3">
              <div className="card border-0 shadow-sm">
                <div className="card-body text-center">
                  <div className="text-muted small">Total Enrollments</div>
                  <div className="fs-3 fw-bold" style={{ color: "#0C6F89" }}>
                    {courses.reduce((sum, c) => sum + (c.enrollment_count || 0), 0)}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ManageCourses;