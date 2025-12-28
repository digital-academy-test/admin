// src/pages/Admin/AddCourse.jsx - FIXED with created_by from authStore
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { useCourseStore } from "../Store/courseStore";
import {useStaffstore } from "../Store/staffStore"; // ✅ Import authStore

const AddCourse = () => {
  const navigate = useNavigate();
  const { createCourse, loading, message, error } = useCourseStore();
  const { user } = useStaffstore(); // ✅ Get logged-in user
console.log("🧑‍💼 Logged-in user in AddCourse:", user );
  const [formData, setFormData] = useState({
    course_title: "",
    instructor: "",
    instructor_bio: "",
    short_description: "",
    description: "",
    original_price: "",
    discount_price: "",
    is_free: false,
    course_length: "",
    language: "English",
    subtitles: "",
    level: "Beginner",
    requirements: "",
    learning_outcomes: "",
    target_audience: "",
    category: "Programming",
    subcategory: "",
    tags: "",
    has_certificate: true,
    certificate_completion_percentage: 90,
    qa_enabled: true,
  });

  const [courseThumbnail, setCourseThumbnail] = useState(null);
  const [introVideo, setIntroVideo] = useState(null);
  const [thumbnailPreview, setThumbnailPreview] = useState(null);
  const [videoPreview, setVideoPreview] = useState(null);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  const handleThumbnailChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setCourseThumbnail(file);
      setThumbnailPreview(URL.createObjectURL(file));
    }
  };

  const handleVideoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setIntroVideo(file);
      setVideoPreview(file.name);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // ✅ CRITICAL: Check if user is logged in
    if (!user || !user.id) {
      toast.error("⚠️ You must be logged in to create a course");
      navigate("/");
      return;
    }

    // Validation
    if (!formData.course_title.trim()) {
      toast.error("Course title is required");
      return;
    }

    if (!formData.is_free && !formData.original_price) {
      toast.error("Price is required for paid courses");
      return;
    }

    // Create FormData
    const data = new FormData();
    
    // ✅ CRITICAL: Add created_by FIRST
    data.append("created_by", user.id);
    
    // Add all form fields
    Object.keys(formData).forEach((key) => {
      data.append(key, formData[key]);
    });

    // Add files
    if (courseThumbnail) {
      data.append("course_thumbnail", courseThumbnail);
    }
    if (introVideo) {
      data.append("intro_video", introVideo);
    }

    // ✅ DEBUG: Log to verify created_by is included
    console.log("📤 Creating course with user ID:", user.id);
    console.log("📤 User email:", user.email);

    try {
      const course = await createCourse(data);
      toast.success("✅ Course created successfully!");
      navigate(`/instructor/course/${course.id}`);
    } catch (error) {
      console.error("❌ Create course error:", error);
      toast.error(error.message || "Failed to create course");
    }
  };

  // ✅ CHECK: Show warning if not logged in
  if (!user) {
    return (
      <div className="container py-5">
        <div className="alert alert-warning">
          <i className="bi bi-exclamation-triangle me-2"></i>
          You must be logged in to create courses.
          <button 
            onClick={() => navigate("/login")} 
            className="btn btn-primary ms-3"
          >
            Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container py-4">
      <div className="card shadow-sm border-0 rounded-3">
        <div className="card-body p-4 p-md-5">
          <div className="d-flex justify-content-between align-items-center mb-4">
            <div>
              <h3 className="fw-bold mb-2">
                <i className="bi bi-plus-circle me-2" style={{ color: "#0C6F89" }}></i>
                Create New Course
              </h3>
              <p className="text-muted mb-0">
                Creating as: <strong>{user.email || user.name}</strong>
              </p>
            </div>
          </div>

          {message && (
            <div className="alert alert-success alert-dismissible fade show" role="alert">
              <i className="bi bi-check-circle me-2"></i>{message}
              <button type="button" className="btn-close" data-bs-dismiss="alert"></button>
            </div>
          )}
          {error && (
            <div className="alert alert-danger alert-dismissible fade show" role="alert">
              <i className="bi bi-exclamation-triangle me-2"></i>{error}
              <button type="button" className="btn-close" data-bs-dismiss="alert"></button>
            </div>
          )}

          <form onSubmit={handleSubmit}>
            {/* Basic Information */}
            <div className="card mb-4">
              <div className="card-header bg-light">
                <h5 className="mb-0">
                  <i className="bi bi-info-circle me-2"></i>Basic Information
                </h5>
              </div>
              <div className="card-body">
                <div className="row g-3">
                  {/* Course Title */}
                  <div className="col-md-6">
                    <label className="form-label fw-semibold">
                      Course Title <span className="text-danger">*</span>
                    </label>
                    <input
                      type="text"
                      name="course_title"
                      value={formData.course_title}
                      onChange={handleChange}
                      className="form-control"
                      placeholder="e.g., Complete React Mastery 2025"
                      required
                    />
                  </div>

                  {/* Instructor */}
                  <div className="col-md-6">
                    <label className="form-label fw-semibold">
                      Instructor Name <span className="text-danger">*</span>
                    </label>
                    <input
                      type="text"
                      name="instructor"
                      value={formData.instructor}
                      onChange={handleChange}
                      className="form-control"
                      placeholder="John Doe"
                      required
                    />
                  </div>

                  {/* Instructor Bio */}
                  <div className="col-12">
                    <label className="form-label fw-semibold">Instructor Bio</label>
                    <textarea
                      name="instructor_bio"
                      value={formData.instructor_bio}
                      onChange={handleChange}
                      rows="3"
                      className="form-control"
                      placeholder="Brief bio about the instructor..."
                    />
                  </div>

                  {/* Short Description */}
                  <div className="col-12">
                    <label className="form-label fw-semibold">
                      Short Description <span className="text-danger">*</span>
                    </label>
                    <input
                      type="text"
                      name="short_description"
                      value={formData.short_description}
                      onChange={handleChange}
                      maxLength="150"
                      className="form-control"
                      placeholder="One-line description (max 150 characters)"
                      required
                    />
                    <div className="form-text">
                      {formData.short_description.length}/150 characters
                    </div>
                  </div>

                  {/* Full Description */}
                  <div className="col-12">
                    <label className="form-label fw-semibold">
                      Full Description <span className="text-danger">*</span>
                    </label>
                    <textarea
                      name="description"
                      value={formData.description}
                      onChange={handleChange}
                      rows="6"
                      className="form-control"
                      placeholder="Detailed course description..."
                      required
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Media Upload */}
            <div className="card mb-4">
              <div className="card-header bg-light">
                <h5 className="mb-0">
                  <i className="bi bi-image me-2"></i>Media
                </h5>
              </div>
              <div className="card-body">
                <div className="row g-3">
                  {/* Course Thumbnail */}
                  <div className="col-md-6">
                    <label className="form-label fw-semibold">Course Thumbnail</label>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleThumbnailChange}
                      className="form-control"
                    />
                    {thumbnailPreview && (
                      <div className="mt-3 text-center">
                        <img
                          src={thumbnailPreview}
                          alt="Preview"
                          className="img-fluid rounded shadow-sm"
                          style={{ maxHeight: "200px" }}
                        />
                      </div>
                    )}
                  </div>

                  {/* Intro Video */}
                  <div className="col-md-6">
                    <label className="form-label fw-semibold">Intro Video</label>
                    <input
                      type="file"
                      accept="video/*"
                      onChange={handleVideoChange}
                      className="form-control"
                    />
                    {videoPreview && (
                      <div className="alert alert-success mt-3">
                        <i className="bi bi-check-circle me-2"></i>
                        Video selected: {videoPreview}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Pricing */}
            <div className="card mb-4">
              <div className="card-header bg-light">
                <h5 className="mb-0">
                  <i className="bi bi-currency-dollar me-2"></i>Pricing
                </h5>
              </div>
              <div className="card-body">
                <div className="form-check mb-3">
                  <input
                    type="checkbox"
                    name="is_free"
                    checked={formData.is_free}
                    onChange={handleChange}
                    className="form-check-input"
                    id="isFreeCheck"
                  />
                  <label className="form-check-label fw-semibold" htmlFor="isFreeCheck">
                    This is a free course
                  </label>
                </div>

                {!formData.is_free && (
                  <div className="row g-3">
                    <div className="col-md-6">
                      <label className="form-label fw-semibold">
                        Original Price ($) <span className="text-danger">*</span>
                      </label>
                      <input
                        type="number"
                        name="original_price"
                        value={formData.original_price}
                        onChange={handleChange}
                        min="0"
                        step="0.01"
                        className="form-control"
                        placeholder="99.99"
                        required={!formData.is_free}
                      />
                    </div>

                    <div className="col-md-6">
                      <label className="form-label fw-semibold">Discount Price ($)</label>
                      <input
                        type="number"
                        name="discount_price"
                        value={formData.discount_price}
                        onChange={handleChange}
                        min="0"
                        step="0.01"
                        className="form-control"
                        placeholder="79.99"
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Course Details */}
            <div className="card mb-4">
              <div className="card-header bg-light">
                <h5 className="mb-0">
                  <i className="bi bi-list-check me-2"></i>Course Details
                </h5>
              </div>
              <div className="card-body">
                <div className="row g-3">
                  {/* Category */}
                  <div className="col-md-6">
                    <label className="form-label fw-semibold">
                      Category <span className="text-danger">*</span>
                    </label>
                    <select
                      name="category"
                      value={formData.category}
                      onChange={handleChange}
                      className="form-select"
                      required
                    >
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

                  {/* Subcategory */}
                  <div className="col-md-6">
                    <label className="form-label fw-semibold">Subcategory</label>
                    <input
                      type="text"
                      name="subcategory"
                      value={formData.subcategory}
                      onChange={handleChange}
                      className="form-control"
                      placeholder="e.g., Web Development"
                    />
                  </div>

                  {/* Level */}
                  <div className="col-md-6">
                    <label className="form-label fw-semibold">
                      Level <span className="text-danger">*</span>
                    </label>
                    <select
                      name="level"
                      value={formData.level}
                      onChange={handleChange}
                      className="form-select"
                      required
                    >
                      <option value="Beginner">Beginner</option>
                      <option value="Intermediate">Intermediate</option>
                      <option value="Advanced">Advanced</option>
                      <option value="All Levels">All Levels</option>
                    </select>
                  </div>

                  {/* Course Length */}
                  <div className="col-md-6">
                    <label className="form-label fw-semibold">Course Length</label>
                    <input
                      type="text"
                      name="course_length"
                      value={formData.course_length}
                      onChange={handleChange}
                      className="form-control"
                      placeholder="e.g., 40 hours"
                    />
                  </div>

                  {/* Language */}
                  <div className="col-md-6">
                    <label className="form-label fw-semibold">Language</label>
                    <input
                      type="text"
                      name="language"
                      value={formData.language}
                      onChange={handleChange}
                      className="form-control"
                    />
                  </div>

                  {/* Subtitles */}
                  <div className="col-md-6">
                    <label className="form-label fw-semibold">
                      Subtitles (comma-separated)
                    </label>
                    <input
                      type="text"
                      name="subtitles"
                      value={formData.subtitles}
                      onChange={handleChange}
                      className="form-control"
                      placeholder="English, Spanish, French"
                    />
                  </div>

                  {/* Tags */}
                  <div className="col-12">
                    <label className="form-label fw-semibold">Tags (comma-separated)</label>
                    <input
                      type="text"
                      name="tags"
                      value={formData.tags}
                      onChange={handleChange}
                      className="form-control"
                      placeholder="React, JavaScript, Web Development"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Learning Information */}
            <div className="card mb-4">
              <div className="card-header bg-light">
                <h5 className="mb-0">
                  <i className="bi bi-book me-2"></i>Learning Information
                </h5>
              </div>
              <div className="card-body">
                <div className="row g-3">
                  {/* Requirements */}
                  <div className="col-12">
                    <label className="form-label fw-semibold">
                      Requirements (comma-separated)
                    </label>
                    <textarea
                      name="requirements"
                      value={formData.requirements}
                      onChange={handleChange}
                      rows="3"
                      className="form-control"
                      placeholder="Basic JavaScript, Computer with internet"
                    />
                  </div>

                  {/* Learning Outcomes */}
                  <div className="col-12">
                    <label className="form-label fw-semibold">
                      Learning Outcomes (comma-separated)
                    </label>
                    <textarea
                      name="learning_outcomes"
                      value={formData.learning_outcomes}
                      onChange={handleChange}
                      rows="3"
                      className="form-control"
                      placeholder="Build React applications, Understand hooks, Deploy to production"
                    />
                  </div>

                  {/* Target Audience */}
                  <div className="col-12">
                    <label className="form-label fw-semibold">
                      Target Audience (comma-separated)
                    </label>
                    <textarea
                      name="target_audience"
                      value={formData.target_audience}
                      onChange={handleChange}
                      rows="3"
                      className="form-control"
                      placeholder="Web developers, Students, Career changers"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Settings */}
            <div className="card mb-4">
              <div className="card-header bg-light">
                <h5 className="mb-0">
                  <i className="bi bi-gear me-2"></i>Settings
                </h5>
              </div>
              <div className="card-body">
                {/* Certificate */}
                <div className="mb-3">
                  <div className="form-check">
                    <input
                      type="checkbox"
                      name="has_certificate"
                      checked={formData.has_certificate}
                      onChange={handleChange}
                      className="form-check-input"
                      id="certificateCheck"
                    />
                    <label className="form-check-label fw-semibold" htmlFor="certificateCheck">
                      Enable certificate on completion
                    </label>
                  </div>

                  {formData.has_certificate && (
                    <div className="ms-4 mt-2">
                      <label className="form-label">Completion Percentage Required (%)</label>
                      <input
                        type="number"
                        name="certificate_completion_percentage"
                        value={formData.certificate_completion_percentage}
                        onChange={handleChange}
                        min="0"
                        max="100"
                        className="form-control"
                        style={{ maxWidth: "150px" }}
                      />
                    </div>
                  )}
                </div>

                {/* Q&A */}
                <div className="form-check">
                  <input
                    type="checkbox"
                    name="qa_enabled"
                    checked={formData.qa_enabled}
                    onChange={handleChange}
                    className="form-check-input"
                    id="qaCheck"
                  />
                  <label className="form-check-label fw-semibold" htmlFor="qaCheck">
                    Enable Q&A for students
                  </label>
                </div>
              </div>
            </div>

            {/* Submit Buttons */}
            <div className="d-flex gap-3 justify-content-end">
              <button
                type="button"
                onClick={() => navigate("/courses")}
                className="btn btn-outline-secondary px-4"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="btn text-white px-4"
                style={{ backgroundColor: "#0C6F89" }}
              >
                {loading ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2"></span>
                    Creating...
                  </>
                ) : (
                  <>
                    <i className="bi bi-check-circle me-2"></i>
                    Create Course
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AddCourse;