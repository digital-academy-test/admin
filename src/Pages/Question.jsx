// src/pages/Question.jsx - UPDATED FOR ADMIN
import React, { useEffect, useState } from "react";
import { useCbtStore } from "../Store/cbtStore";
import { useNavigate } from "react-router-dom";
import { FaBook, FaCalendar, FaCheckSquare, FaEye, FaEyeSlash } from "react-icons/fa";

function Question() {
  // 🆕 UPDATED: Use getExamsForAdmin to see all exams including hidden subjects
  const { exams, getExamsForAdmin, loading } = useCbtStore();
  const [selectedExam, setSelectedExam] = useState(null);
  const [selectedYear, setSelectedYear] = useState("");
  const [subjects, setSubjects] = useState([]);
  const [selectedSubjects, setSelectedSubjects] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    // 🆕 UPDATED: Load exams in admin mode
    getExamsForAdmin();
  }, []);

  const handleExamChange = (e) => {
    const examId = e.target.value;
    const exam = exams.find((ex) => ex._id === examId);
    
    setSelectedExam(exam);
    setSelectedYear("");
    setSubjects([]);
    setSelectedSubjects([]);
  };

  const handleYearChange = (e) => {
    const year = parseInt(e.target.value);
    setSelectedYear(year);
    setSelectedSubjects([]);

    if (selectedExam) {
      const yearObj = selectedExam.years?.find((y) => y.year === year);
      // 🆕 UPDATED: Extract subject data including visibility info
      const subjectData = yearObj?.subjects.map(s => ({
        name: typeof s === 'string' ? s : s.name,
        questionCount: s.questionCount || 0,
        isVisible: s.isVisible !== false
      })) || [];
      setSubjects(subjectData);
    }
  };

  const handleSubjectToggle = (subjectName) => {
    setSelectedSubjects((prev) =>
      prev.includes(subjectName)
        ? prev.filter((s) => s !== subjectName)
        : [...prev, subjectName]
    );
  };

  const handleManage = () => {
    if (selectedSubjects.length === 0) {
      alert("Please select at least one subject.");
      return;
    }

    // Navigate to ManageQuestions page
    navigate("/manage_question", {
      state: {
        examId: selectedExam._id,
        examName: selectedExam.name,
        year: selectedYear,
        subject: selectedSubjects[0],
        duration: selectedExam.defaultTotalTime,
      },
    });
  };

  return (
    <div className="d-flex justify-content-center mt-4">
      <div
        className="card shadow-lg border-0 rounded-4"
        style={{ maxWidth: "700px", width: "100%" }}
      >
        <div 
          className="card-header text-white py-3"
          style={{ background: "#15253a" }}
        >
          <h4 className="mb-0 d-flex align-items-center gap-2">
            <FaBook />
            Manage Questions
          </h4>
        </div>

        <div className="card-body p-4">
          {/* 🆕 UPDATED: Added admin notice */}
          <div className="alert alert-info mb-4">
            <strong>ℹ️ Admin Mode:</strong> You can see all exams, years, and subjects - including hidden ones.
          </div>

          {loading ? (
            <div className="text-center py-4">
              <div className="spinner-border text-primary" />
              <p className="mt-2">Loading exams...</p>
            </div>
          ) : (
            <form>
              {/* Select Exam */}
              <div className="mb-4">
                <label className="form-label fw-bold">
                  <FaBook className="me-2" />
                  Select Exam
                </label>
                <select
                  value={selectedExam?._id || ""}
                  onChange={handleExamChange}
                  className="form-select form-select-lg"
                  required
                >
                  <option value="">-- Select Exam --</option>
                  {exams.map((exam) => (
                    <option key={exam._id} value={exam._id}>
                      {exam.displayName} ({exam.name.toUpperCase()})
                    </option>
                  ))}
                </select>
                {exams.length === 0 && (
                  <small className="text-danger">
                    No exams available. Please create an exam first.
                  </small>
                )}
              </div>

              {/* Select Year */}
              {selectedExam && (
                <div className="mb-4">
                  <label className="form-label fw-bold">
                    <FaCalendar className="me-2" />
                    Select Year
                  </label>
                  <select
                    value={selectedYear}
                    onChange={handleYearChange}
                    className="form-select form-select-lg"
                    required
                  >
                    <option value="">-- Select Year --</option>
                    {selectedExam.years?.map((yearObj) => (
                      <option key={yearObj.year} value={yearObj.year}>
                        {yearObj.year} ({yearObj.subjects?.length || 0} subjects)
                        {/* 🆕 UPDATED: Show if year is unavailable */}
                        {yearObj.isAvailable === false && ' 🔒'}
                      </option>
                    ))}
                  </select>
                  {selectedExam.years?.length === 0 && (
                    <small className="text-danger">
                      No years available for this exam. Please add a year first.
                    </small>
                  )}
                </div>
              )}

              {/* Select Subjects */}
              {subjects.length > 0 && (
                <div className="mb-4">
                  <label className="form-label fw-bold">
                    <FaCheckSquare className="me-2" />
                    Select Subject(s)
                  </label>
                  <div className="card">
                    <div className="card-body">
                      {subjects.map((subject, idx) => (
                        <div key={idx} className="form-check mb-2">
                          <input
                            type="checkbox"
                            className="form-check-input"
                            id={`subject-${idx}`}
                            value={subject.name}
                            checked={selectedSubjects.includes(subject.name)}
                            onChange={() => handleSubjectToggle(subject.name)}
                          />
                          <label 
                            className="form-check-label d-flex align-items-center justify-content-between w-100" 
                            htmlFor={`subject-${idx}`}
                          >
                            <span>
                              {subject.name}
                              {/* 🆕 UPDATED: Show visibility status */}
                              {!subject.isVisible && (
                                <span className="badge bg-secondary ms-2">
                                  <FaEyeSlash /> Hidden
                                </span>
                              )}
                            </span>
                            <small className="text-muted">
                              {subject.questionCount} questions
                            </small>
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Exam Info */}
              {selectedExam && selectedYear && (
                <div className="card mb-4 bg-light">
                  <div className="card-body">
                    <h6 className="fw-bold mb-3">Exam Details:</h6>
                    <div className="row">
                      <div className="col-md-6 mb-2">
                        <small className="text-muted">Duration:</small>
                        <br />
                        <strong>{selectedExam.defaultTotalTime} minutes</strong>
                      </div>
                      <div className="col-md-6 mb-2">
                        <small className="text-muted">Time per question:</small>
                        <br />
                        <strong>{selectedExam.defaultTimePerQuestion} seconds</strong>
                      </div>
                      <div className="col-md-6 mb-2">
                        <small className="text-muted">Passing score:</small>
                        <br />
                        <strong>{selectedExam.passingPercentage}%</strong>
                      </div>
                      <div className="col-md-6 mb-2">
                        <small className="text-muted">Total questions:</small>
                        <br />
                        <strong>{selectedExam.totalQuestions || 0}</strong>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Submit Button */}
              {subjects.length > 0 && (
                <div className="d-grid">
                  <button
                    type="button"
                    disabled={selectedSubjects.length === 0}
                    onClick={handleManage}
                    className="btn btn-lg text-white"
                    style={{ background: "#15253a" }}
                  >
                    <FaEye className="me-2" />
                    View / Manage Questions
                    {selectedSubjects.length > 0 && 
                      ` (${selectedSubjects.length} subject${selectedSubjects.length > 1 ? 's' : ''})`
                    }
                  </button>
                </div>
              )}
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

export default Question;