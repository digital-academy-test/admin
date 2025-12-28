// src/pages/admin/EditExam.jsx
import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useCbtStore } from "../Store/cbtStore";
import toast from "react-hot-toast";
import { FaGraduationCap, FaClock, FaPercent, FaBook, FaSave, FaArrowLeft } from "react-icons/fa";

const EditExam = () => {
  const { examId } = useParams();
  const navigate = useNavigate();
  const { getExamById, updateExam, loading } = useCbtStore();

  const [formData, setFormData] = useState({
    name: "",
    displayName: "",
    category: "",
    defaultTimePerQuestion: 90,
    defaultTotalTime: 120,
    passingPercentage: 50,
    description: "",
    instructions: "",
    isActive: true,
  });

  const [initialData, setInitialData] = useState(null);

  const categories = [
    { value: "secondary", label: "Secondary School" },
    { value: "primary", label: "Primary School" },
    { value: "entrance", label: "Entrance Exam" },
    { value: "post-utme", label: "Post-UTME" },
  ];

  useEffect(() => {
    loadExam();
  }, [examId]);

  const loadExam = async () => {
    try {
      const exam = await getExamById(examId);
      const data = {
        name: exam.name || "",
        displayName: exam.displayName || "",
        category: exam.category || "",
        defaultTimePerQuestion: exam.defaultTimePerQuestion || 90,
        defaultTotalTime: exam.defaultTotalTime || 120,
        passingPercentage: exam.passingPercentage || 50,
        description: exam.description || "",
        instructions: exam.instructions || "",
        isActive: exam.isActive !== undefined ? exam.isActive : true,
      };
      setFormData(data);
      setInitialData(data);
    } catch (error) {
      console.error("Error loading exam:", error);
      toast.error("Failed to load exam details");
      navigate('/manage_exams');
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const hasChanges = () => {
    if (!initialData) return false;
    return JSON.stringify(formData) !== JSON.stringify(initialData);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!hasChanges()) {
      toast.info("No changes detected");
      return;
    }

    try {
      const updateData = {
        ...formData,
        defaultTimePerQuestion: parseInt(formData.defaultTimePerQuestion),
        defaultTotalTime: parseInt(formData.defaultTotalTime),
        passingPercentage: parseInt(formData.passingPercentage),
      };

      await updateExam(examId, updateData);
      toast.success("✅ Exam updated successfully!");
      navigate('/manage_exams');
    } catch (error) {
      console.error("Error updating exam:", error);
      toast.error(error.response?.data?.message || "Failed to update exam");
    }
  };

  const handleCancel = () => {
    if (hasChanges()) {
      if (window.confirm("You have unsaved changes. Are you sure you want to leave?")) {
        navigate('/manage_exams');
      }
    } else {
      navigate('/manage_exams');
    }
  };

  if (loading && !formData.name) {
    return (
      <div className="container mt-5 text-center">
        <div className="spinner-border text-primary" style={{ width: "3rem", height: "3rem" }} />
        <p className="mt-3">Loading exam details...</p>
      </div>
    );
  }

  return (
    <div className="container mt-5" style={{ maxWidth: "800px" }}>
      <div className="card shadow-lg border-0 rounded-4">
        <div className="card-header text-white py-4" style={{ background: "#15253a" }}>
          <div className="d-flex justify-content-between align-items-center">
            <h3 className="mb-0 d-flex align-items-center gap-2">
              <FaGraduationCap />
              Edit Exam
            </h3>
            <button
              className="btn btn-outline-light btn-sm"
              onClick={handleCancel}
            >
              <FaArrowLeft className="me-2" />
              Back
            </button>
          </div>
        </div>
        
        <div className="card-body p-4">
          <form onSubmit={handleSubmit}>
            {/* Exam Name - Read Only */}
            <div className="row mb-4">
              <div className="col-md-6">
                <label className="form-label fw-bold">
                  <FaBook className="me-2" />
                  Exam Code (Cannot be changed)
                </label>
                <input
                  type="text"
                  className="form-control bg-light"
                  value={formData.name.toUpperCase()}
                  disabled
                />
                <small className="text-muted">
                  The exam code cannot be changed after creation
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
              <div className="progress mt-2" style={{ height: "25px" }}>
                <div 
                  className="progress-bar" 
                  role="progressbar" 
                  style={{ width: `${formData.passingPercentage}%` }}
                >
                  {formData.passingPercentage}%
                </div>
              </div>
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

            {/* Active Status */}
            <div className="mb-4">
              <div className="form-check form-switch">
                <input
                  type="checkbox"
                  className="form-check-input"
                  id="isActive"
                  name="isActive"
                  checked={formData.isActive}
                  onChange={handleChange}
                  style={{ width: "50px", height: "25px" }}
                />
                <label className="form-check-label fw-bold ms-2" htmlFor="isActive">
                  {formData.isActive ? (
                    <span className="text-success">✓ Exam is Active</span>
                  ) : (
                    <span className="text-danger">✗ Exam is Inactive</span>
                  )}
                </label>
              </div>
              <small className="text-muted">
                {formData.isActive 
                  ? "Students can see and take this exam" 
                  : "This exam is hidden from students"}
              </small>
            </div>

            {/* Change Indicator */}
            {hasChanges() && (
              <div className="alert alert-warning mb-4">
                <strong>⚠️ Unsaved Changes</strong>
                <p className="mb-0">You have made changes to this exam. Click "Save Changes" to update.</p>
              </div>
            )}

            {/* Submit Buttons */}
            <div className="d-grid gap-2 d-md-flex justify-content-md-end">
              <button
                type="button"
                className="btn btn-outline-secondary"
                onClick={handleCancel}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn text-white"
                style={{ background: "#15253a" }}
                disabled={loading || !hasChanges()}
              >
                {loading ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2" />
                    Saving...
                  </>
                ) : (
                  <>
                    <FaSave className="me-2" />
                    Save Changes
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Info Card */}
      <div className="card mt-4 border-info">
        <div className="card-body">
          <h6 className="fw-bold mb-3">📝 Edit Guidelines:</h6>
          <ul className="mb-0">
            <li>The exam code cannot be changed after creation</li>
            <li>Changing time settings won't affect existing questions</li>
            <li>Deactivating an exam hides it from students</li>
            <li>Changes are saved immediately when you click "Save Changes"</li>
            <li>Years and subjects can be managed separately</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default EditExam;