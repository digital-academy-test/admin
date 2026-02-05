// src/pages/admin/VisibilityControl.jsx - NEW SIMPLE PAGE
import React, { useState, useEffect } from "react";
import { useCbtStore } from "../Store/cbtStore";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import {
  FaEye,
  FaEyeSlash,
  FaSync,
  FaArrowLeft,
  FaCheckCircle,
  FaTimesCircle,
  FaExclamationTriangle
} from "react-icons/fa";

const VisibilityControl = () => {
  const {
    exams,
    getExamsForAdmin,
    toggleYearVisibility,
    toggleSubjectVisibility,
    syncQuestionCounts,
    loading
  } = useCbtStore();

  const navigate = useNavigate();
  const [selectedExam, setSelectedExam] = useState(null);
  const [syncing, setSyncing] = useState(false);

  useEffect(() => {
    loadExams();
  }, []);

  const loadExams = async () => {
    try {
      await getExamsForAdmin();
    } catch (error) {
      toast.error("Failed to load exams");
    }
  };

  const handleToggleYear = async (examId, year, currentStatus) => {
    try {
      await toggleYearVisibility(examId, year, !currentStatus);
      toast.success(`Year ${year} is now ${!currentStatus ? 'available' : 'unavailable'}`);
      await loadExams();
    } catch (error) {
      toast.error("Failed to toggle year");
    }
  };

  const handleToggleSubject = async (examId, year, subject, currentStatus) => {
    try {
      await toggleSubjectVisibility(examId, year, subject, !currentStatus);
      toast.success(`${subject} is now ${!currentStatus ? 'visible' : 'hidden'}`);
      await loadExams();
    } catch (error) {
      toast.error("Failed to toggle subject");
    }
  };

  const handleSync = async (examId) => {
    setSyncing(true);
    try {
      await syncQuestionCounts(examId);
      toast.success("Question counts synced!");
      await loadExams();
    } catch (error) {
      toast.error("Failed to sync counts");
    } finally {
      setSyncing(false);
    }
  };

  const getSubjectStatus = (subject, minQuestions = 15) => {
    const count = subject.questionCount || 0;
    const isVisible = subject.isVisible !== false;
    const meetsMin = count >= minQuestions;

    if (isVisible && meetsMin) return { icon: <FaCheckCircle className="text-success" />, text: "Live", color: "success" };
    if (!isVisible && meetsMin) return { icon: <FaEyeSlash className="text-info" />, text: "Hidden (Ready)", color: "info" };
    if (isVisible && !meetsMin) return { icon: <FaExclamationTriangle className="text-warning" />, text: `Need ${minQuestions - count} more`, color: "warning" };
    return { icon: <FaTimesCircle className="text-secondary" />, text: "Hidden & Incomplete", color: "secondary" };
  };

  if (loading && exams.length === 0) {
    return (
      <div className="text-center py-5">
        <div className="spinner-border text-primary" />
        <p className="mt-2">Loading...</p>
      </div>
    );
  }

  // If no exam selected, show exam list
  if (!selectedExam) {
    return (
      <div className="container mt-4">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h3>Visibility Control</h3>
          <button className="btn btn-secondary" onClick={() => navigate('/manage_exam')}>
            <FaArrowLeft className="me-2" />
            Back to Exams
          </button>
        </div>

        <div className="alert alert-info">
          <strong>ℹ️ What is this?</strong><br />
          Control which years and subjects students can see in their exam selection.
        </div>

        {exams.length === 0 ? (
          <div className="card text-center py-5">
            <div className="card-body">
              <h5>No Exams Found</h5>
              <p className="text-muted">Create an exam first</p>
            </div>
          </div>
        ) : (
          <div className="row">
            {exams.map((exam) => (
              <div key={exam._id} className="col-md-6 col-lg-4 mb-4">
                <div 
                  className="card h-100 shadow-sm"
                  style={{ cursor: 'pointer' }}
                  onClick={() => setSelectedExam(exam)}
                >
                  <div className="card-body">
                    <h5 className="card-title">{exam.displayName}</h5>
                    <p className="text-muted mb-3">{exam.name.toUpperCase()}</p>
                    
                    <div className="mb-2">
                      <small className="text-muted">Years:</small>
                      <strong className="ms-2">{exam.years?.length || 0}</strong>
                    </div>
                    
                    <div className="mb-2">
                      <small className="text-muted">Min Questions:</small>
                      <strong className="ms-2">{exam.minimumQuestionsPerSubject || 15}</strong>
                    </div>

                    <button 
                      className="btn btn-primary w-100 mt-3"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedExam(exam);
                      }}
                    >
                      Manage Visibility →
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  // If exam is selected, show years and subjects
  return (
    <div className="container-fluid mt-4">
      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <button 
            className="btn btn-sm btn-outline-secondary mb-2"
            onClick={() => setSelectedExam(null)}
          >
            <FaArrowLeft /> Back to Exam List
          </button>
          <h3>{selectedExam.displayName} - Visibility Control</h3>
        </div>
        <button
          className="btn btn-primary"
          onClick={() => handleSync(selectedExam._id)}
          disabled={syncing}
        >
          <FaSync className={syncing ? "fa-spin" : ""} />
          {syncing ? " Syncing..." : " Sync Question Counts"}
        </button>
      </div>

      {/* Info Alert */}
      <div className="alert alert-warning mb-4">
        <strong>💡 How it works:</strong>
        <ul className="mb-0 mt-2">
          <li><strong>Year Toggle:</strong> ON = Students can see this year | OFF = Year is hidden</li>
          <li><strong>Subject Toggle:</strong> ON = Students can see this subject | OFF = Subject is hidden</li>
          <li><strong>Minimum Questions:</strong> Subjects need {selectedExam.minimumQuestionsPerSubject || 15} questions to be visible to students</li>
        </ul>
      </div>

      {/* Years and Subjects */}
      {!selectedExam.years || selectedExam.years.length === 0 ? (
        <div className="card text-center py-5">
          <div className="card-body">
            <h5>No Years Added Yet</h5>
            <p className="text-muted">Add a year first</p>
            <button
              className="btn btn-primary"
              onClick={() => navigate('/add_year', { state: { exam: selectedExam } })}
            >
              Add Year
            </button>
          </div>
        </div>
      ) : (
        <div className="row">
          {selectedExam.years.map((yearObj) => (
            <div key={yearObj.year} className="col-12 mb-4">
              <div className="card">
                {/* Year Header */}
                <div className="card-header bg-primary text-white d-flex justify-content-between align-items-center">
                  <div>
                    <h5 className="mb-0">
                      Year {yearObj.year}
                      <span className="badge bg-light text-dark ms-3">
                        {yearObj.subjects?.length || 0} subjects
                      </span>
                    </h5>
                  </div>
                  
                  {/* Year Visibility Toggle */}
                  <div className="d-flex align-items-center gap-3">
                    <div className="form-check form-switch">
                      <input
                        className="form-check-input"
                        type="checkbox"
                        id={`year-${yearObj.year}`}
                        checked={yearObj.isAvailable !== false}
                        onChange={() => handleToggleYear(
                          selectedExam._id,
                          yearObj.year,
                          yearObj.isAvailable !== false
                        )}
                        style={{ width: '50px', height: '25px', cursor: 'pointer' }}
                      />
                      <label 
                        className="form-check-label" 
                        htmlFor={`year-${yearObj.year}`}
                        style={{ cursor: 'pointer', fontWeight: 'bold' }}
                      >
                        {yearObj.isAvailable !== false ? (
                          <span>
                            <FaEye /> Year Available
                          </span>
                        ) : (
                          <span>
                            <FaEyeSlash /> Year Hidden
                          </span>
                        )}
                      </label>
                    </div>
                  </div>
                </div>

                {/* Subjects Table */}
                <div className="card-body">
                  {!yearObj.subjects || yearObj.subjects.length === 0 ? (
                    <p className="text-muted text-center py-3">
                      No subjects added for this year yet
                    </p>
                  ) : (
                    <div className="table-responsive">
                      <table className="table table-hover">
                        <thead>
                          <tr>
                            <th style={{ width: '30%' }}>Subject</th>
                            <th style={{ width: '15%' }}>Questions</th>
                            <th style={{ width: '20%' }}>Status</th>
                            <th style={{ width: '35%' }}>Visibility Control</th>
                          </tr>
                        </thead>
                        <tbody>
                          {yearObj.subjects.map((subject, idx) => {
                            const status = getSubjectStatus(
                              subject,
                              selectedExam.minimumQuestionsPerSubject || 15
                            );
                            const subjectName = subject.name || subject;

                            return (
                              <tr key={idx}>
                                <td>
                                  <strong style={{ fontSize: '16px' }}>{subjectName}</strong>
                                </td>
                                <td>
                                  <span className={`badge bg-${status.color}`}>
                                    {subject.questionCount || 0} questions
                                  </span>
                                </td>
                                <td>
                                  <div className="d-flex align-items-center">
                                    {status.icon}
                                    <small className="ms-2">{status.text}</small>
                                  </div>
                                </td>
                                <td>
                                  {/* Subject Visibility Toggle */}
                                  <div className="d-flex align-items-center gap-3">
                                    <div className="form-check form-switch">
                                      <input
                                        className="form-check-input"
                                        type="checkbox"
                                        id={`subject-${yearObj.year}-${idx}`}
                                        checked={subject.isVisible !== false}
                                        onChange={() => handleToggleSubject(
                                          selectedExam._id,
                                          yearObj.year,
                                          subjectName,
                                          subject.isVisible !== false
                                        )}
                                        style={{ width: '50px', height: '25px', cursor: 'pointer' }}
                                      />
                                      <label 
                                        className="form-check-label" 
                                        htmlFor={`subject-${yearObj.year}-${idx}`}
                                        style={{ cursor: 'pointer', fontWeight: 'bold' }}
                                      >
                                        {subject.isVisible !== false ? (
                                          <span className="text-success">
                                            <FaEye /> Visible
                                          </span>
                                        ) : (
                                          <span className="text-secondary">
                                            <FaEyeSlash /> Hidden
                                          </span>
                                        )}
                                      </label>
                                    </div>
                                    
                                    <button
                                      className="btn btn-sm btn-outline-primary"
                                      onClick={() => navigate('/manage_question', {
                                        state: {
                                          examId: selectedExam._id,
                                          examName: selectedExam.name,
                                          year: yearObj.year,
                                          subject: subjectName
                                        }
                                      })}
                                    >
                                      Manage Questions
                                    </button>
                                  </div>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Legend */}
      <div className="card mt-4">
        <div className="card-header">
          <h6 className="mb-0">Status Legend</h6>
        </div>
        <div className="card-body">
          <div className="row">
            <div className="col-md-3">
              <FaCheckCircle className="text-success me-2" />
              <strong>Live:</strong> Visible and ready
            </div>
            <div className="col-md-3">
              <FaEyeSlash className="text-info me-2" />
              <strong>Hidden (Ready):</strong> Has enough questions but hidden
            </div>
            <div className="col-md-3">
              <FaExclamationTriangle className="text-warning me-2" />
              <strong>Incomplete:</strong> Needs more questions
            </div>
            <div className="col-md-3">
              <FaTimesCircle className="text-secondary me-2" />
              <strong>Hidden & Incomplete:</strong> Hidden and needs questions
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VisibilityControl;
