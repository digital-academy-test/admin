// src/pages/admin/CreateExam.jsx
import React, { useState } from "react";

import toast from "react-hot-toast";
import { FaGraduationCap, FaClock, FaPercent, FaBook } from "react-icons/fa";
import { useCbtStore } from "../Store/cbtStore";

const CreateExam = () => {
  const { createExam, loading } = useCbtStore();
  
  const [formData, setFormData] = useState({
    name: "",
    displayName: "",
    category: "",
    defaultTimePerQuestion: 90,
    defaultTotalTime: 120,
    passingPercentage: 50,
    description: "",
    instructions: "Read each question carefully and select the best answer. You cannot go back once you move to the next question.",
  });

  const categories = [
    { value: "secondary", label: "Secondary School" },
    { value: "primary", label: "Primary School" },
    { value: "entrance", label: "Entrance Exam" },
    { value: "post-utme", label: "Post-UTME" },
  ];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const examData = {
        ...formData,
        name: formData.name.toLowerCase().trim(),
        defaultTimePerQuestion: parseInt(formData.defaultTimePerQuestion),
        defaultTotalTime: parseInt(formData.defaultTotalTime),
        passingPercentage: parseInt(formData.passingPercentage),
      };

      await createExam(examData);
      toast.success("✅ Exam created successfully!");
      
      // Reset form
      setFormData({
        name: "",
        displayName: "",
        category: "",
        defaultTimePerQuestion: 90,
        defaultTotalTime: 120,
        passingPercentage: 50,
        description: "",
        instructions: "Read each question carefully and select the best answer.",
      });
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to create exam");
    }
  };

  return (
    <div className="container mt-5" style={{ maxWidth: "800px" }}>
      <div className="card shadow-lg border-0 rounded-4">
        <div className="card-header text-white py-4" style={{ background: "#15253a" }}>
          <h3 className="mb-0 d-flex align-items-center gap-2">
            <FaGraduationCap />
            Create New Exam
          </h3>
        </div>
        
        <div className="card-body p-4">
          <form onSubmit={handleSubmit}>
            {/* Exam Name */}
            <div className="row mb-4">
              <div className="col-md-6">
                <label className="form-label fw-bold">
                  <FaBook className="me-2" />
                  Exam Name (Short Code)
                </label>
                <input
                  type="text"
                  name="name"
                  className="form-control"
                  placeholder="e.g., waec, jamb, neco"
                  value={formData.name}
                  onChange={handleChange}
                  required
                />
                <small className="text-muted">
                  Lowercase, no spaces (e.g., waec, junior-waec)
                </small>
              </div>
              
              <div className="col-md-6">
                <label className="form-label fw-bold">Display Name</label>
                <input
                  type="text"
                  name="displayName"
                  className="form-control"
                  placeholder="e.g., WAEC, JAMB, NECO"
                  value={formData.displayName}
                  onChange={handleChange}
                  required
                />
                <small className="text-muted">
                  How it appears to students
                </small>
              </div>
            </div>

            {/* Category */}
            <div className="mb-4">
              <label className="form-label fw-bold">Category</label>
              <select
                name="category"
                className="form-select"
                value={formData.category}
                onChange={handleChange}
                required
              >
                <option value="">-- Select Category --</option>
                {categories.map(cat => (
                  <option key={cat.value} value={cat.value}>
                    {cat.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Description */}
            <div className="mb-4">
              <label className="form-label fw-bold">Description</label>
              <textarea
                name="description"
                className="form-control"
                rows="3"
                placeholder="Brief description of this exam..."
                value={formData.description}
                onChange={handleChange}
              />
            </div>

            {/* Time Settings */}
            <div className="row mb-4">
              <div className="col-md-6">
                <label className="form-label fw-bold">
                  <FaClock className="me-2" />
                  Time Per Question (seconds)
                </label>
                <input
                  type="number"
                  name="defaultTimePerQuestion"
                  className="form-control"
                  value={formData.defaultTimePerQuestion}
                  onChange={handleChange}
                  min="30"
                  max="300"
                  required
                />
                <small className="text-muted">
                  Recommended: 60-90 seconds
                </small>
              </div>
              
              <div className="col-md-6">
                <label className="form-label fw-bold">
                  <FaClock className="me-2" />
                  Total Time (minutes)
                </label>
                <input
                  type="number"
                  name="defaultTotalTime"
                  className="form-control"
                  value={formData.defaultTotalTime}
                  onChange={handleChange}
                  min="30"
                  max="300"
                  required
                />
                <small className="text-muted">
                  Typical: 90-180 minutes
                </small>
              </div>
            </div>

            {/* Passing Percentage */}
            <div className="mb-4">
              <label className="form-label fw-bold">
                <FaPercent className="me-2" />
                Passing Percentage
              </label>
              <input
                type="number"
                name="passingPercentage"
                className="form-control"
                value={formData.passingPercentage}
                onChange={handleChange}
                min="0"
                max="100"
                required
              />
              <small className="text-muted">
                Minimum score to pass (typically 40-60%)
              </small>
            </div>

            {/* Instructions */}
            <div className="mb-4">
              <label className="form-label fw-bold">Exam Instructions</label>
              <textarea
                name="instructions"
                className="form-control"
                rows="4"
                placeholder="Instructions for students taking this exam..."
                value={formData.instructions}
                onChange={handleChange}
              />
            </div>

            {/* Submit Button */}
            <div className="d-grid gap-2">
              <button
                type="submit"
                className="btn btn-lg text-white"
                style={{ background: "#15253a" }}
                disabled={loading}
              >
                {loading ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2" />
                    Creating Exam...
                  </>
                ) : (
                  "Create Exam"
                )}
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Info Card */}
      <div className="card mt-4 border-info">
        <div className="card-body">
          <h6 className="fw-bold mb-3">📝 Next Steps After Creating Exam:</h6>
          <ol className="mb-0">
            <li>Add years to this exam (e.g., 2020, 2021, 2022)</li>
            <li>Add subjects for each year (e.g., Mathematics, English)</li>
            <li>Upload questions for each subject</li>
          </ol>
        </div>
      </div>
    </div>
  );
};

export default CreateExam;