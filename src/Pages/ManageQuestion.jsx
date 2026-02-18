// src/pages/admin/ManageQuestions.jsx - ENHANCED FOR ADMIN
// This version allows admins to see and manage ALL questions,
// including those from years/subjects that are hidden or incomplete

import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useCbtStore } from "../Store/cbtStore";
import toast from "react-hot-toast";
import { 
  FaEdit, 
  FaTrash, 
  FaArrowLeft, 
  FaFilter,
  FaSync,
  FaCheckCircle,
  FaTimesCircle,
  FaEye,
  FaEyeSlash
} from "react-icons/fa";

const ManageQuestions = () => {
  const { state } = useLocation();
  const navigate = useNavigate();
  
  const { 
    getExamsForAdmin,
    getQuestions, 
    updateQuestion, 
    deleteQuestion,
    syncQuestionCounts,
    loading 
  } = useCbtStore();

  // State
  const [exams, setExams] = useState([]);
  const [selectedExam, setSelectedExam] = useState(null);
  const [selectedYear, setSelectedYear] = useState(null);
  const [selectedSubject, setSelectedSubject] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [questionCount, setQuestionCount] = useState(0);
  const [editingQuestion, setEditingQuestion] = useState(null);

  // Load initial data
  useEffect(() => {
    loadExamsForAdmin();
  }, []);

  // Auto-select if coming from navigation
  useEffect(() => {
    if (state?.examId && state?.year && state?.subject && exams.length > 0) {
      const exam = exams.find(e => e._id === state.examId);
      if (exam) {
        setSelectedExam(exam);
        setSelectedYear(state.year);
        setSelectedSubject(state.subject);
      }
    }
  }, [state, exams]);

  // Load questions when filters change
  useEffect(() => {
    if (selectedExam && selectedYear && selectedSubject) {
      fetchQuestions();
    }
  }, [selectedExam, selectedYear, selectedSubject]);

  const loadExamsForAdmin = async () => {
    try {
      const examsData = await getExamsForAdmin();
      setExams(examsData || []);
    } catch (error) {
      toast.error("Failed to load exams");
    }
  };

  const fetchQuestions = async () => {
    if (!selectedExam || !selectedYear || !selectedSubject) return;

    try {
      const filters = {
        examName: selectedExam.name,
        year: selectedYear,
        subject: selectedSubject
      };
      
      const result = await getQuestions(filters);
      setQuestions(result.questions || []);
      setQuestionCount(result.count || 0);
    } catch (err) {
      console.error("Error fetching questions:", err);
      toast.error("Failed to load questions");
    }
  };

  const handleDelete = async (questionId) => {
    if (!window.confirm("Are you sure you want to delete this question?")) {
      return;
    }

    try {
      await deleteQuestion(questionId);
      toast.success("✅ Question deleted successfully");
      await fetchQuestions();
      
      // Sync counts after deletion
      if (selectedExam?._id) {
        await syncQuestionCounts(selectedExam._id);
      }
    } catch (error) {
      toast.error("Failed to delete question");
    }
  };

  const handleSyncCounts = async () => {
    if (!selectedExam) return;

    try {
      await syncQuestionCounts(selectedExam._id);
      toast.success("✅ Question counts synced");
      await loadExamsForAdmin();
    } catch (error) {
      toast.error("Failed to sync counts");
    }
  };

  const getYearsForSelectedExam = () => {
    if (!selectedExam || !selectedExam.years) return [];
    return selectedExam.years.map(y => y.year).sort((a, b) => b - a);
  };

  const getSubjectsForSelectedYear = () => {
    if (!selectedExam || !selectedYear) return [];
    
    const yearObj = selectedExam.years?.find(y => y.year === parseInt(selectedYear));
    if (!yearObj || !yearObj.subjects) return [];
    
    return yearObj.subjects.map(s => ({
      name: s.name || s,
      questionCount: s.questionCount || 0,
      isVisible: s.isVisible !== false
    }));
  };

  const getSubjectInfo = () => {
    if (!selectedExam || !selectedYear || !selectedSubject) return null;

    const yearObj = selectedExam.years?.find(y => y.year === parseInt(selectedYear));
    if (!yearObj) return null;

    const subject = yearObj.subjects?.find(s => 
      (s.name || s) === selectedSubject
    );

    if (!subject) return null;

    const count = subject.questionCount || 0;
    const isVisible = subject.isVisible !== false;
    const minQuestions = selectedExam.minimumQuestionsPerSubject || 15;
    const meetsMinimum = count >= minQuestions;

    return {
      questionCount: count,
      isVisible,
      minQuestions,
      meetsMinimum,
      status: isVisible && meetsMinimum ? 'live' :
              !isVisible && meetsMinimum ? 'hidden-ready' :
              isVisible && !meetsMinimum ? 'incomplete' :
              'hidden-incomplete'
    };
  };

  const subjectInfo = getSubjectInfo();

  return (
    <div className="container mt-4">
      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <button 
            className="btn btn-sm btn-outline-secondary mb-2"
            onClick={() => navigate(-1)}
          >
            <FaArrowLeft /> Back
          </button>
          <h3>Manage Questions</h3>
        </div>
        <div className="btn-group">
          <button
            className="btn btn-primary"
            onClick={handleSyncCounts}
            disabled={!selectedExam || loading}
          >
            <FaSync className={loading ? "fa-spin" : ""} /> Sync Counts
          </button>
          <button
            className="btn btn-success"
            onClick={() => navigate('/add_question', {
              state: {
                examId: selectedExam?._id,
                examName: selectedExam?.name,
                year: selectedYear,
                subject: selectedSubject
              }
            })}
            disabled={!selectedExam || !selectedYear || !selectedSubject}
          >
            Add Question
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="card mb-4">
        <div className="card-header bg-light">
          <FaFilter className="me-2" />
          <strong>Filters</strong>
          <small className="text-muted ms-2">
            (Shows ALL exams, years, and subjects - including hidden ones)
          </small>
        </div>
        <div className="card-body">
          <div className="row g-3">
            {/* Exam Selection */}
            <div className="col-md-4">
              <label className="form-label">Exam</label>
              <select
                className="form-select"
                value={selectedExam?._id || ''}
                onChange={(e) => {
                  const exam = exams.find(ex => ex._id === e.target.value);
                  setSelectedExam(exam || null);
                  setSelectedYear(null);
                  setSelectedSubject(null);
                }}
              >
                <option value="">Select Exam</option>
                {exams.map(exam => (
                  <option key={exam._id} value={exam._id}>
                    {exam.displayName} ({exam.name})
                  </option>
                ))}
              </select>
            </div>

            {/* Year Selection */}
            <div className="col-md-4">
              <label className="form-label">Year</label>
              <select
                className="form-select"
                value={selectedYear || ''}
                onChange={(e) => {
                  setSelectedYear(e.target.value ? parseInt(e.target.value) : null);
                  setSelectedSubject(null);
                }}
                disabled={!selectedExam}
              >
                <option value="">Select Year</option>
                {getYearsForSelectedExam().map(year => (
                  <option key={year} value={year}>
                    {year}
                  </option>
                ))}
              </select>
              {selectedExam && getYearsForSelectedExam().length === 0 && (
                <small className="text-danger">No years added yet</small>
              )}
            </div>

            {/* Subject Selection */}
            <div className="col-md-4">
              <label className="form-label">Subject</label>
              <select
                className="form-select"
                value={selectedSubject || ''}
                onChange={(e) => setSelectedSubject(e.target.value || null)}
                disabled={!selectedYear}
              >
                <option value="">Select Subject</option>
                {getSubjectsForSelectedYear().map((subject, idx) => (
                  <option key={idx} value={subject.name}>
                    {subject.name} ({subject.questionCount} Qs)
                    {!subject.isVisible && ' 🔒'}
                  </option>
                ))}
              </select>
              {selectedYear && getSubjectsForSelectedYear().length === 0 && (
                <small className="text-danger">No subjects added yet</small>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Subject Info Card */}
      {subjectInfo && (
        <div className={`alert ${
          subjectInfo.status === 'live' ? 'alert-success' :
          subjectInfo.status === 'hidden-ready' ? 'alert-info' :
          subjectInfo.status === 'incomplete' ? 'alert-warning' :
          'alert-secondary'
        }`}>
          <div className="d-flex justify-content-between align-items-center">
            <div>
              <strong>{selectedSubject}</strong>
              <span className="ms-3">
                {subjectInfo.isVisible ? (
                  <>
                    <FaEye className="me-1" /> Visible to Students
                  </>
                ) : (
                  <>
                    <FaEyeSlash className="me-1" /> Hidden from Students
                  </>
                )}
              </span>
              <span className="ms-3">
                {questionCount} / {subjectInfo.minQuestions} questions
                {subjectInfo.meetsMinimum ? (
                  <FaCheckCircle className="text-success ms-1" />
                ) : (
                  <FaTimesCircle className="text-danger ms-1" />
                )}
              </span>
            </div>
            <div>
              {subjectInfo.status === 'live' && (
                <span className="badge bg-success">✓ Live</span>
              )}
              {subjectInfo.status === 'hidden-ready' && (
                <span className="badge bg-info">🔒 Hidden (Ready to Publish)</span>
              )}
              {subjectInfo.status === 'incomplete' && (
                <span className="badge bg-warning">
                  ⚠ Need {subjectInfo.minQuestions - questionCount} more questions
                </span>
              )}
              {subjectInfo.status === 'hidden-incomplete' && (
                <span className="badge bg-secondary">🔒 Hidden & Incomplete</span>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Questions List */}
      {loading ? (
        <div className="text-center py-5">
          <div className="spinner-border text-primary" />
          <p className="mt-2">Loading questions...</p>
        </div>
      ) : !selectedExam || !selectedYear || !selectedSubject ? (
        <div className="card text-center py-5">
          <div className="card-body">
            <FaFilter size={60} className="text-muted mb-3" />
            <h5>Select Exam, Year, and Subject</h5>
            <p className="text-muted">Choose filters above to view questions</p>
          </div>
        </div>
      ) : questions.length === 0 ? (
        <div className="card text-center py-5">
          <div className="card-body">
            <h5>No Questions Found</h5>
            <p className="text-muted">
              This subject doesn't have any questions yet
            </p>
            <button
              className="btn btn-primary"
              onClick={() => navigate('/add_question', {
                state: {
                  examId: selectedExam._id,
                  examName: selectedExam.name,
                  year: selectedYear,
                  subject: selectedSubject
                }
              })}
            >
              Add First Question
            </button>
          </div>
        </div>
      ) : (
        <div className="card">
          <div className="card-header bg-light d-flex justify-content-between align-items-center">
            <span>
              <strong>{questionCount} Questions</strong>
            </span>
            <span className="text-muted">
              {selectedExam.displayName} • {selectedYear} • {selectedSubject}
            </span>
          </div>
          <div className="card-body">
            <div className="table-responsive">
              <table className="table table-hover">
                <thead>
                  <tr>
                    <th width="50">#</th>
                    <th>Question</th>
                    <th width="100">Difficulty</th>
                    <th width="100">Topic</th>
                    <th width="150">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {questions.map((q, index) => (
                    <tr key={q._id}>
                      <td>{index + 1}</td>
                      <td>
                        <div 
                          dangerouslySetInnerHTML={{ 
                            __html: q.question.substring(0, 100) + (q.question.length > 100 ? '...' : '')
                          }} 
                        />
                        {q.questionImage && (
                          <span className="badge bg-info ms-2">Has Image</span>
                        )}
                      </td>
                      <td>
                        <span className={`badge ${
                          q.difficulty === 'easy' ? 'bg-success' :
                          q.difficulty === 'hard' ? 'bg-danger' :
                          'bg-warning'
                        }`}>
                          {q.difficulty}
                        </span>
                      </td>
                      <td>
                        <small className="text-muted">{q.topic || '-'}</small>
                      </td>
                      <td>
                        <div className="btn-group btn-group-sm">
                          <button
                            className="btn btn-outline-primary"
                            onClick={() => navigate(`/edit_question/${q._id}`, { 
                              state: { question: q, examId: selectedExam._id, examName: selectedExam.name, year: selectedYear, subject: selectedSubject }
                            })}
                          >
                            <FaEdit /> Edit
                          </button>
                          <button
                            className="btn btn-outline-danger"
                            onClick={() => handleDelete(q._id)}
                          >
                            <FaTrash /> Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Info Alert */}
      <div className="alert alert-info mt-4">
        <strong>ℹ️ Admin Mode:</strong> You can see and edit ALL questions, including those from hidden or incomplete subjects.
        Questions are automatically counted when you add or delete them.
      </div>
    </div>
  );
};

export default ManageQuestions;