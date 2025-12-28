import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";

import { useCourseStore } from "../Store/courseStore";

const EditCourse = () => {
  const { updateCourse, error, loading, message,  getCourseById,course } = useCourseStore();
  const { id } = useParams();
  const navigate = useNavigate();

  const classes = ["Beginner", "Intermediate", "Advanced"];

  const [formData, setFormData] = useState({
    course_title: "",
    instructor: "",
    short_description: "",
    description: "",
    original_price: "",
    discount_price: "",
    is_free: false,
    course_length: "",
    language: "",
    subtitles: "",
    level: "",
    requirements: "",
    learning_outcomes: "",
    category: "",
    subcategory: "",
    tags: "",
  });

  const [thumbnail, setThumbnail] = useState(null);
  const [thumbnailPreview, setThumbnailPreview] = useState(null);
  const [introVideo, setIntroVideo] = useState(null);
  const [introVideoPreview, setIntroVideoPreview] = useState(null);

  // ✅ Fetch existing course details
useEffect(() => {
  getCourseById(id);
}, [id]);

useEffect(() => {
  if (course && Object.keys(course).length > 0) {
    setFormData({
      course_title: course.course_title || "",
      instructor: course.instructor || "",
      short_description: course.short_description || "",
      description: course.description || "",
      original_price: course.original_price || "",
      discount_price: course.discount_price || "",
      is_free: course.is_free || false,
      course_length: course.course_length || "",
      language: course.language || "",
      subtitles: course.subtitles ? course.subtitles.join(", ") : "",
      level: course.level || "",
      requirements: course.requirements ? course.requirements.join(", ") : "",
      learning_outcomes: course.learning_outcomes
        ? course.learning_outcomes.join(", ")
        : "",
      category: course.category || "",
      subcategory: course.subcategory || "",
      tags: course.tags ? course.tags.join(", ") : "",
    });

    if (course.course_thumbnail) setThumbnailPreview(course.course_thumbnail);
    if (course.intro_video) setIntroVideoPreview(course.intro_video);
  }
}, [course]);


  

  // ✅ Handle text & checkbox inputs
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  // ✅ Handle file input + preview
  const handleThumbnailChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setThumbnail(file);
      setThumbnailPreview(URL.createObjectURL(file));
    }
  };

  const handleVideoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setIntroVideo(file);
      setIntroVideoPreview(URL.createObjectURL(file));
    }
  };

  // ✅ Submit update
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const data = new FormData();
      Object.keys(formData).forEach((key) => data.append(key, formData[key]));
      if (thumbnail) data.append("course_thumbnail", thumbnail);
      if (introVideo) data.append("intro_video", introVideo);

      if (updateCourse) {
        await updateCourse(id, data);
      } 
      alert("Course updated successfully!");
      navigate("/courses");
    } catch (err) {
      console.error(err);
      alert("Error updating course.");
    }
  };

  return (
    <div className="container py-4">
      <div className="card shadow-sm border-0 rounded-3">
        <div className="card-body">
          <h4 className="fw-bold mb-4">
            <i className="bi bi-pencil-square me-2 text-primary"></i>Edit Course
          </h4>

          {message && <div className="alert alert-info">{message}</div>}
          {error && <div className="alert alert-danger">{error}</div>}

          <form onSubmit={handleSubmit}>
            <div className="row g-3">
              {/* Course Title */}
              <div className="col-md-6">
                <label className="form-label">Course Title</label>
                <input
                  type="text"
                  className="form-control"
                  name="course_title"
                  value={formData.course_title}
                  onChange={handleChange}
                  required
                />
              </div>

              {/* Instructor */}
              <div className="col-md-6">
                <label className="form-label">Instructor</label>
                <input
                  type="text"
                  className="form-control"
                  name="instructor"
                  value={formData.instructor}
                  onChange={handleChange}
                  required
                />
              </div>

              {/* Price Fields */}
              <div className="col-md-6">
                <label className="form-label">Original Price</label>
                <input
                  type="number"
                  className="form-control"
                  name="original_price"
                  value={formData.original_price}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="col-md-6">
                <label className="form-label">Discount Price</label>
                <input
                  type="number"
                  className="form-control"
                  name="discount_price"
                  value={formData.discount_price}
                  onChange={handleChange}
                />
              </div>

              {/* Basic Info */}
              <div className="col-md-6">
                <label className="form-label">Course Length</label>
                <input
                  type="text"
                  className="form-control"
                  name="course_length"
                  value={formData.course_length}
                  onChange={handleChange}
                />
              </div>

              <div className="col-md-6">
                <label className="form-label">Language</label>
                <input
                  type="text"
                  className="form-control"
                  name="language"
                  value={formData.language}
                  onChange={handleChange}
                />
              </div>

              {/* Level & Category */}
              <div className="col-md-6">
                <label className="form-label">Level</label>
                <select
                  className="form-select"
                  name="level"
                  value={formData.level}
                  onChange={handleChange}
                >
                  <option value="">Select Level</option>
                  {classes.map((lvl, index) => (
                    <option key={index} value={lvl}>
                      {lvl}
                    </option>
                  ))}
                </select>
              </div>

              <div className="col-md-6">
                <label className="form-label">Category</label>
                <input
                  type="text"
                  className="form-control"
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                />
              </div>

              <div className="col-md-6">
                <label className="form-label">Subcategory</label>
                <input
                  type="text"
                  className="form-control"
                  name="subcategory"
                  value={formData.subcategory}
                  onChange={handleChange}
                />
              </div>

              {/* Text Areas */}
              <div className="col-md-12">
                <label className="form-label">Short Description</label>
                <textarea
                  className="form-control"
                  name="short_description"
                  rows="2"
                  value={formData.short_description}
                  onChange={handleChange}
                ></textarea>
              </div>

              <div className="col-md-12">
                <label className="form-label">Full Description</label>
                <textarea
                  className="form-control"
                  name="description"
                  rows="4"
                  value={formData.description}
                  onChange={handleChange}
                ></textarea>
              </div>

              {/* New Inputs */}
              <div className="col-md-6">
                <label className="form-label">Subtitles (comma-separated)</label>
                <input
                  type="text"
                  className="form-control"
                  name="subtitles"
                  value={formData.subtitles}
                  onChange={handleChange}
                  placeholder="e.g. English, French"
                />
              </div>

              <div className="col-md-6">
                <label className="form-label">Requirements (comma-separated)</label>
                <input
                  type="text"
                  className="form-control"
                  name="requirements"
                  value={formData.requirements}
                  onChange={handleChange}
                />
              </div>

              <div className="col-md-6">
                <label className="form-label">Learning Outcomes (comma-separated)</label>
                <input
                  type="text"
                  className="form-control"
                  name="learning_outcomes"
                  value={formData.learning_outcomes}
                  onChange={handleChange}
                />
              </div>

              <div className="col-md-6">
                <label className="form-label">Tags (comma-separated)</label>
                <input
                  type="text"
                  className="form-control"
                  name="tags"
                  value={formData.tags}
                  onChange={handleChange}
                />
              </div>

              {/* Uploads + Previews */}
              <div className="col-md-6">
                <label className="form-label">Change Course Thumbnail</label>
                <input
                  type="file"
                  accept="image/*"
                  className="form-control"
                  onChange={handleThumbnailChange}
                />
                {thumbnailPreview && (
                  <div className="mt-3 text-center">
                    <img
                      src={thumbnailPreview}
                      alt="Thumbnail Preview"
                      className="img-fluid rounded shadow-sm"
                      style={{ maxHeight: "200px" }}
                    />
                  </div>
                )}
              </div>

              <div className="col-md-6">
                <label className="form-label">Change Intro Video</label>
                <input
                  type="file"
                  accept="video/*"
                  className="form-control"
                  onChange={handleVideoChange}
                />
                {introVideoPreview && (
                  <div className="mt-3 text-center">
                    <video
                      src={introVideoPreview}
                      controls
                      className="rounded shadow-sm"
                      style={{ maxHeight: "250px", width: "100%" }}
                    />
                  </div>
                )}
              </div>

              {/* Free toggle */}
              <div className="col-md-12 d-flex align-items-center">
                <div className="form-check mt-3">
                  <input
                    className="form-check-input"
                    type="checkbox"
                    name="is_free"
                    checked={formData.is_free}
                    onChange={handleChange}
                  />
                  <label className="form-check-label">Free Course</label>
                </div>
              </div>
            </div>

            <div className="mt-4 text-end">
              <button
                type="submit"
                className="btn text-white"
                style={{ backgroundColor: "#15253a" }}
                disabled={loading}
              >
                {loading ? "Updating..." : "Update Course"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default EditCourse;
