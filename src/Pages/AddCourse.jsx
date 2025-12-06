import React, { useState } from "react";
import FileUploader from "../Component/FileUploader";
import { useCoursestore } from "../Store/courseStore";

const AddCourse = () => {
  const { addCourse, error, loading, message } = useCoursestore();
  const classes = ['Primary', 'Junior Secondary', 'Senior Secondary']
  const [formData, setFormData] = useState({
    course_title: "",
    course_id: "",
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
  const [introVideo, setIntroVideo] = useState(null);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const data = new FormData();
      Object.keys(formData).forEach((key) => data.append(key, formData[key]));
      if (thumbnail) data.append("course_thumbnail", thumbnail);
      if (introVideo) data.append("intro_video", introVideo);

      await addCourse(data);

      // Reset form after successful save
      setFormData({
        course_title: "",
        course_id: "",
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
      setThumbnail(null);
      setIntroVideo(null);
    } catch (err) {
      console.error(err);
      alert("Error adding course.");
    }
  };

  return (
    <div className="container py-4">
      <div className="card shadow-sm border-0 rounded-3">
        <div className="card-body">
          <h4 className="fw-bold mb-4">
            <i className="bi bi-book me-2 text-primary"></i>Add New Course
          </h4>

          {message && <div className="alert alert-info">{message}</div>}
          {error && <div className="alert alert-danger">{error}</div>}

          <form onSubmit={handleSubmit}>
            <div className="row g-3">
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

              <div className="col-md-6">
                <label className="form-label">Course Length (e.g. 10 hours)</label>
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

              <div className="col-md-6">
                <label className="form-label">Level</label>
                <select
                  className="form-select"
                  name="level"
                  value={formData.level}
                  onChange={handleChange}
                >
                  <option value="">Select Level</option>
                  {classes.map((exam, index) => (
                  <option key={index} value={exam}>
                    {exam}
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

              <div className="col-md-12">
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

              {/* Additional Text Inputs */}
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

              <div className="col-md-6 d-flex align-items-center">
                <div className="form-check mt-4">
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

              {/* Uploaders */}
              <div className="col-md-6">
                <FileUploader
                  label="Course Thumbnail"
                  name="course_thumbnail"
                  accept="image/*"
                  onFileSelect={(file) => setThumbnail(file)}
                />
              </div>

              <div className="col-md-6">
                <FileUploader
                  label="Intro Video"
                  name="intro_video"
                  accept="video/*"
                  onFileSelect={(file) => setIntroVideo(file)}
                />
              </div>
            </div>

            <div className="mt-4 text-end">
              <button
                type="submit"
                className="btn text-white"
                style={{ backgroundColor: "#15253a" }}
                disabled={loading}
              >
                {loading ? "Saving..." : "Save Course"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AddCourse;
