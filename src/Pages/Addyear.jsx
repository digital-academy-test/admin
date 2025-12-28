// src/pages/admin/AddYear.jsx
import React, { useState, useEffect } from "react";
import { useCbtStore } from "../Store/cbtStore";
import toast from "react-hot-toast";
import { FaCalendar, FaPlus, FaTrash, FaBook } from "react-icons/fa";

const AddYear = () => {
  const {
    exams,
    getExams,
    addYearToExam,
    loading,
    getExamStructure,
    examStructure,
  } = useCbtStore();

  const [formData, setFormData] = useState({
    examId: "",
    year: "",
    subjects: [{ name: "", timeAllocation: 120 }], // Default 120 minutes
  });

  useEffect(() => {
    getExams();
    getExamStructure();
  }, []);

  // Update levels from exam structure
  useEffect(() => {
    setAvailableLevels(examStructure || []);
  }, [examStructure]);

  // Update topics when level/subject changes
  useEffect(() => {
    if (formData.level && formData.subject) {
      const level = examStructure.find((l) => l._id === formData.level);
      const subject = level?.subjects.find((s) => s._id === formData.subject);
      setAvailableTopics(subject?.topics || []);
    }
  }, [formData.level, formData.subject, examStructure]);
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };
  const [selectedExam, setSelectedExam] = useState(null);
  const [availableYears, setAvailableYears] = useState([]);
  const [availableSubjects, setAvailableSubjects] = useState([]);
  const [availableLevels, setAvailableLevels] = useState([]);
  const [availableTopics, setAvailableTopics] = useState([]);

  const handleSubjectChange = (index, field, value) => {
    const newSubjects = [...formData.subjects];
    newSubjects[index][field] = value;
    setFormData((prev) => ({ ...prev, subjects: newSubjects }));
  };

  const addSubjectField = () => {
    setFormData((prev) => ({
      ...prev,
      subjects: [...prev.subjects, { name: "", timeAllocation: 120 }],
    }));
  };

  const removeSubjectField = (index) => {
    if (formData.subjects.length > 1) {
      const newSubjects = formData.subjects.filter((_, i) => i !== index);
      setFormData((prev) => ({ ...prev, subjects: newSubjects }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validation
    if (!formData.examId) {
      toast.error("Please select an exam");
      return;
    }

    if (!formData.year) {
      toast.error("Please enter a year");
      return;
    }

    // Check if subjects are filled
    const hasEmptySubjects = formData.subjects.some(
      (subj) => !subj.name || !subj.name.trim()
    );

    if (hasEmptySubjects) {
      toast.error("Please fill all subject names");
      return;
    }

    try {
      const yearData = {
        year: parseInt(formData.year),
        subjects: formData.subjects.map((subj) => ({
          name: subj.name.trim(),
          timeAllocation: parseInt(subj.timeAllocation) || 120,
        })),
      };

      await addYearToExam(formData.examId, yearData);
      toast.success("✅ Year and subjects added successfully!");

      // Reset form
      setFormData({
        examId: "",
        year: "",
        subjects: [{ name: "", timeAllocation: 120 }],
      });
    } catch (error) {
      console.error("Error adding year:", error);
      toast.error(error.response?.data?.message || "Failed to add year");
    }
  };

  return (
    <div className="container mt-4" style={{ maxWidth: "800px" }}>
      <div className="card shadow-lg border-0 rounded-4">
        <div
          className="card-header text-white py-3"
          style={{ background: "#15253a" }}
        >
          <h4 className="mb-0 d-flex align-items-center gap-2">
            <FaCalendar />
            Add Year to Exam
          </h4>
        </div>

        <div className="card-body p-4">
          <form onSubmit={handleSubmit}>
            {/* Select Exam */}
            <div className="mb-4">
              <label className="form-label fw-bold">
                Select Exam <span className="text-danger">*</span>
              </label>
              <select
                name="examId"
                className="form-select"
                value={formData.examId}
                onChange={handleChange}
                required
              >
                <option value="">-- Select Exam --</option>
                {exams.map((exam) => (
                  <option key={exam._id} value={exam._id}>
                    {exam.displayName} ({exam.name})
                  </option>
                ))}
              </select>
              <small className="text-muted">
                Choose which exam to add this year to
              </small>
            </div>

            {/* Year */}
            <div className="mb-4">
              <label className="form-label fw-bold">
                Year <span className="text-danger">*</span>
              </label>
              <input
                type="number"
                name="year"
                className="form-control"
                value={formData.year}
                onChange={handleChange}
                placeholder="e.g., 2023"
                min="1990"
                max="2030"
                required
              />
              <small className="text-muted">
                Enter the exam year (e.g., 2020, 2021, 2022)
              </small>
            </div>

            {/* Subjects */}
            <div className="mb-4">
              <div className="d-flex justify-content-between align-items-center mb-3">
                <label className="form-label fw-bold mb-0">
                  Subjects <span className="text-danger">*</span>
                </label>
                <button
                  type="button"
                  className="btn btn-sm btn-outline-primary"
                  onClick={addSubjectField}
                >
                  <FaPlus className="me-1" />
                  Add Subject
                </button>
              </div>

              {formData.subjects.map((subject, index) => (
                <div key={index} className="card mb-2">
                  <div className="card-body">
                    <div className="row mb-3">
                      <div className="col-md-4">
                        <label className="form-label fw-bold">
                          Level <span className="text-danger">*</span>
                        </label>
                        <select
                          name="level"
                          className="form-select"
                          value={formData.level}
                          onChange={handleChange}
                          required
                        >
                          <option value="">-- Select Level --</option>
                          {availableLevels.map((level) => (
                            <option key={level._id} value={level._id}>
                              {level.level}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div className="col-md-4">
                       <label className="form-label">Subject Name</label>
                        <select
                          name="subject"
                          className="form-select"
                          value={subject.name}
                          onChange={(e) =>
                            handleSubjectChange(index, "name", e.target.value)
                          }
                          disabled={!formData.level}
                          required
                        >
                          <option value="">-- Select Subject --</option>
                          {availableLevels
                            .find((l) => l._id === formData.level)
                            ?.subjects.map((subj) => (
                              <option key={subj._id} value={subj.name}>
                                {subj.name}
                              </option>
                            ))}
                        </select>
                      </div>

                      <div className="col-md-4">
                        <label className="form-label">Time (minutes)</label>
                        <input
                          type="number"
                          className="form-control"
                          placeholder="120"
                          value={subject.timeAllocation}
                          onChange={(e) =>
                            handleSubjectChange(
                              index,
                              "timeAllocation",
                              e.target.value
                            )
                          }
                          min="30"
                          max="300"
                        />
                      </div>
                    </div>
                    <div className="row align-items-end">
                      <div className="col-md-6">
                        <label className="form-label">Subject Name</label>
                        <input
                          type="text"
                          className="form-control"
                          placeholder="e.g., Mathematics"
                          value={subject.name}
                          onChange={(e) =>
                            handleSubjectChange(index, "name", e.target.value)
                          }
                          required
                        />
                      </div>

                      <div className="col-md-2">
                        {formData.subjects.length > 1 && (
                          <button
                            type="button"
                            className="btn btn-outline-danger w-100"
                            onClick={() => removeSubjectField(index)}
                          >
                            <FaTrash />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}

              <small className="text-muted">
                Add all subjects available for this year. You can add more
                subjects later.
              </small>
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
                    Adding Year...
                  </>
                ) : (
                  <>
                    <FaPlus className="me-2" />
                    Add Year with Subjects
                  </>
                )}
              </button>
            </div>
          </form>

          {/* Info Card */}
          <div className="card mt-4 border-info">
            <div className="card-body">
              <h6 className="fw-bold mb-3">💡 Quick Tips:</h6>
              <ul className="mb-0">
                <li>Select the exam first (e.g., WAEC, JAMB, NECO)</li>
                <li>Enter the year (e.g., 2020, 2021, 2022)</li>
                <li>Add all subjects for that year at once</li>
                <li>You can add more subjects later if needed</li>
                <li>Default time is 120 minutes per subject</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddYear;
