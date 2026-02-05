// src/pages/admin/ManageYearsAndSubjects.jsx - FIXED VERSION
// Fixed: Removed nested button issue that was breaking the accordion
import React, { useState, useEffect } from "react";
import { useCbtStore } from "../Store/cbtStore";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import {
  FaBook,
  FaCalendar,
  FaPlus,
  FaEye,
  FaEyeSlash,
  FaSync,
  FaCheckCircle,
  FaTimesCircle,
  FaExclamationTriangle,
  FaChartBar
} from "react-icons/fa";

const ManageYearsAndSubjects = () => {
  const {
    exams,
    getExamsForAdmin,
    toggleSubjectVisibility,
    bulkUpdateVisibility,
    syncQuestionCounts,
    loading
  } = useCbtStore();

  const navigate = useNavigate();
  const [selectedExam, setSelectedExam] = useState(null);
  const [selectedYear, setSelectedYear] = useState(null);
  const [selectedSubjects, setSelectedSubjects] = useState([]);
  const [syncing, setSyncing] = useState(false);

  useEffect(() => {
    loadExamsForAdmin();
  }, []);

  const loadExamsForAdmin = async () => {
    try {
      await getExamsForAdmin();
    } catch (error) {
      toast.error("Failed to load exams");
    }
  };

  const handleToggleVisibility = async (examId, year, subjectName, currentVisibility) => {
    try {
      await toggleSubjectVisibility(examId, year, subjectName, !currentVisibility);
      toast.success(
        `${subjectName} is now ${!currentVisibility ? 'visible' : 'hidden'} to students`
      );
      await loadExamsForAdmin();
    } catch (error) {
      toast.error("Failed to update visibility");
    }
  };

  const handleBulkShow = async () => {
    if (selectedSubjects.length === 0) {
      toast.error("Please select subjects first");
      return;
    }

    try {
      const updates = selectedSubjects.map(key => {
        const [examId, year, subject] = key.split('|');
        return { year: parseInt(year), subject, isVisible: true };
      });

      await bulkUpdateVisibility(selectedExam._id, updates);
      toast.success(`Made ${updates.length} subjects visible`);
      setSelectedSubjects([]);
      await loadExamsForAdmin();
    } catch (error) {
      toast.error("Failed to bulk update");
    }
  };

  const handleBulkHide = async () => {
    if (selectedSubjects.length === 0) {
      toast.error("Please select subjects first");
      return;
    }

    try {
      const updates = selectedSubjects.map(key => {
        const [examId, year, subject] = key.split('|');
        return { year: parseInt(year), subject, isVisible: false };
      });

      await bulkUpdateVisibility(selectedExam._id, updates);
      toast.success(`Hid ${updates.length} subjects from students`);
      setSelectedSubjects([]);
      await loadExamsForAdmin();
    } catch (error) {
      toast.error("Failed to bulk update");
    }
  };

  const handleSyncCounts = async (examId, examName) => {
    setSyncing(true);
    try {
      const updates = await syncQuestionCounts(examId);
      toast.success(`Synced ${updates.length} subjects for ${examName}`);
      await loadExamsForAdmin();
    } catch (error) {
      toast.error("Failed to sync counts");
    } finally {
      setSyncing(false);
    }
  };

  const toggleSubjectSelection = (examId, year, subject) => {
    const key = `${examId}|${year}|${subject}`;
    setSelectedSubjects(prev =>
      prev.includes(key)
        ? prev.filter(k => k !== key)
        : [...prev, key]
    );
  };

  const isSubjectSelected = (examId, year, subject) => {
    const key = `${examId}|${year}|${subject}`;
    return selectedSubjects.includes(key);
  };

  const getSubjectStatus = (subject, minimumQuestions = 15) => {
    const count = subject.questionCount || 0;
    const isVisible = subject.isVisible !== false;
    const meetsMinimum = count >= minimumQuestions;

    if (isVisible && meetsMinimum) {
      return {
        icon: <FaCheckCircle className="text-success" />,
        text: "Live",
        color: "success",
        badge: "bg-success"
      };
    } else if (!isVisible && meetsMinimum) {
      return {
        icon: <FaEyeSlash className="text-info" />,
        text: "Hidden (Ready)",
        color: "info",
        badge: "bg-info"
      };
    } else if (isVisible && !meetsMinimum) {
      return {
        icon: <FaExclamationTriangle className="text-warning" />,
        text: `Need ${minimumQuestions - count} more`,
        color: "warning",
        badge: "bg-warning"
      };
    } else {
      return {
        icon: <FaTimesCircle className="text-secondary" />,
        text: "Hidden & Incomplete",
        color: "secondary",
        badge: "bg-secondary"
      };
    }
  };

  if (loading && exams.length === 0) {
    return (
      <div className="text-center py-5">
        <div className="spinner-border text-primary" />
        <p className="mt-2">Loading exams...</p>
      </div>
    );
  }

  return (
    <div className="container mt-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h3>
          <FaChartBar className="me-2" />
          Manage Years & Subjects
        </h3>
        <button
          className="btn btn-primary"
          onClick={() => navigate('/manage_exam')}
        >
          Back to Exams
        </button>
      </div>

      {/* Bulk Actions */}
      {selectedSubjects.length > 0 && (
        <div className="alert alert-info d-flex justify-content-between align-items-center">
          <span>{selectedSubjects.length} subjects selected</span>
          <div className="btn-group">
            <button className="btn btn-sm btn-success" onClick={handleBulkShow}>
              <FaEye className="me-1" /> Show to Students
            </button>
            <button className="btn btn-sm btn-secondary" onClick={handleBulkHide}>
              <FaEyeSlash className="me-1" /> Hide from Students
            </button>
            <button
              className="btn btn-sm btn-outline-secondary"
              onClick={() => setSelectedSubjects([])}
            >
              Clear Selection
            </button>
          </div>
        </div>
      )}

      {/* Exams List */}
      {exams.length === 0 ? (
        <div className="card text-center py-5">
          <div className="card-body">
            <FaBook size={60} className="text-muted mb-3" />
            <h5>No Exams Found</h5>
            <p className="text-muted">Create an exam first</p>
            <button
              className="btn btn-primary"
              onClick={() => navigate('/add_exam')}
            >
              Create Exam
            </button>
          </div>
        </div>
      ) : (
        <div className="accordion" id="examsAccordion">
          {exams.map((exam) => (
            <div key={exam._id} className="accordion-item mb-3">
              <h2 className="accordion-header">
                {/* 🔧 FIXED: Removed nested button - now uses div with cursor pointer */}
                <div className="d-flex align-items-center">
                  <button
                    className="accordion-button collapsed flex-grow-1"
                    type="button"
                    data-bs-toggle="collapse"
                    data-bs-target={`#exam-${exam._id}`}
                    onClick={() => setSelectedExam(exam)}
                  >
                    <div>
                      <strong>{exam.displayName}</strong>
                      <small className="text-muted ms-3">
                        {exam.years?.length || 0} years | 
                        Minimum {exam.minimumQuestionsPerSubject || 15} questions per subject
                      </small>
                    </div>
                  </button>
                  {/* 🔧 FIXED: Sync button now outside accordion button */}
                  <button
                    className="btn btn-sm btn-outline-primary me-2"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleSyncCounts(exam._id, exam.displayName);
                    }}
                    disabled={syncing}
                    style={{ flexShrink: 0 }}
                  >
                    <FaSync className={syncing ? "fa-spin" : ""} /> Sync
                  </button>
                </div>
              </h2>
              <div
                id={`exam-${exam._id}`}
                className="accordion-collapse collapse"
                data-bs-parent="#examsAccordion"
              >
                <div className="accordion-body">
                  {!exam.years || exam.years.length === 0 ? (
                    <div className="text-center py-4">
                      <p className="text-muted">No years added yet</p>
                      <button
                        className="btn btn-sm btn-primary"
                        onClick={() => navigate('/add_year', { state: { exam } })}
                      >
                        <FaPlus /> Add Year
                      </button>
                    </div>
                  ) : (
                    exam.years.map((yearObj) => (
                      <div key={yearObj.year} className="card mb-3">
                        <div className="card-header d-flex justify-content-between align-items-center bg-light">
                          <h6 className="mb-0">
                            <FaCalendar className="me-2" />
                            Year {yearObj.year}
                            <span className="badge bg-secondary ms-2">
                              {yearObj.subjects?.length || 0} subjects
                            </span>
                          </h6>
                          <button
                            className="btn btn-sm btn-outline-primary"
                            onClick={() => navigate('/add_year', { 
                              state: { exam, year: yearObj.year } 
                            })}
                          >
                            <FaPlus /> Add Subjects
                          </button>
                        </div>
                        <div className="card-body">
                          {!yearObj.subjects || yearObj.subjects.length === 0 ? (
                            <p className="text-muted mb-0">No subjects yet</p>
                          ) : (
                            <div className="table-responsive">
                              <table className="table table-hover">
                                <thead>
                                  <tr>
                                    <th width="50">
                                      <input
                                        type="checkbox"
                                        className="form-check-input"
                                        onChange={(e) => {
                                          if (e.target.checked) {
                                            const keys = yearObj.subjects.map(s => 
                                              `${exam._id}|${yearObj.year}|${s.name}`
                                            );
                                            setSelectedSubjects(prev => [...new Set([...prev, ...keys])]);
                                          } else {
                                            setSelectedSubjects(prev => 
                                              prev.filter(k => !k.startsWith(`${exam._id}|${yearObj.year}|`))
                                            );
                                          }
                                        }}
                                      />
                                    </th>
                                    <th>Subject</th>
                                    <th>Questions</th>
                                    <th>Status</th>
                                    <th>Visibility</th>
                                    <th>Actions</th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {yearObj.subjects.map((subject, idx) => {
                                    const status = getSubjectStatus(
                                      subject,
                                      exam.minimumQuestionsPerSubject || 15
                                    );
                                    const subjectName = subject.name || subject;

                                    return (
                                      <tr key={idx}>
                                        <td>
                                          <input
                                            type="checkbox"
                                            className="form-check-input"
                                            checked={isSubjectSelected(exam._id, yearObj.year, subjectName)}
                                            onChange={() => toggleSubjectSelection(
                                              exam._id,
                                              yearObj.year,
                                              subjectName
                                            )}
                                          />
                                        </td>
                                        <td>
                                          <strong>{subjectName}</strong>
                                        </td>
                                        <td>
                                          <span className={`badge ${status.badge}`}>
                                            {subject.questionCount || 0} questions
                                          </span>
                                        </td>
                                        <td>
                                          {status.icon}
                                          <small className="ms-2">{status.text}</small>
                                        </td>
                                        <td>
                                          {subject.isVisible !== false ? (
                                            <span className="badge bg-success">
                                              <FaEye /> Visible
                                            </span>
                                          ) : (
                                            <span className="badge bg-secondary">
                                              <FaEyeSlash /> Hidden
                                            </span>
                                          )}
                                        </td>
                                        <td>
                                          <div className="btn-group btn-group-sm">
                                            <button
                                              className={`btn btn-sm ${
                                                subject.isVisible !== false
                                                  ? 'btn-outline-secondary'
                                                  : 'btn-outline-success'
                                              }`}
                                              onClick={() =>
                                                handleToggleVisibility(
                                                  exam._id,
                                                  yearObj.year,
                                                  subjectName,
                                                  subject.isVisible !== false
                                                )
                                              }
                                              title={
                                                subject.isVisible !== false
                                                  ? 'Hide from students'
                                                  : 'Show to students'
                                              }
                                            >
                                              {subject.isVisible !== false ? (
                                                <>
                                                  <FaEyeSlash /> Hide
                                                </>
                                              ) : (
                                                <>
                                                  <FaEye /> Show
                                                </>
                                              )}
                                            </button>
                                            <button
                                              className="btn btn-sm btn-outline-primary"
                                              onClick={() =>
                                                navigate('/manage_question', {
                                                  state: {
                                                    examId: exam._id,
                                                    examName: exam.name,
                                                    year: yearObj.year,
                                                    subject: subjectName
                                                  }
                                                })
                                              }
                                            >
                                              Questions
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
                    ))
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
              <strong>Live:</strong> Visible to students
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

export default ManageYearsAndSubjects;