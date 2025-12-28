// src/pages/admin/ManageExams.jsx
import React, { useState, useEffect } from "react";
import { useCbtStore } from "../Store/cbtStore";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { 
  FaBook, 
  FaCalendar, 
  FaEdit, 
  FaTrash, 
  FaPlus,
  FaEye,
  FaClock,
  FaCheckCircle,
  FaTimesCircle
} from "react-icons/fa";

const ManageExams = () => {
  const { exams, getExams, deleteExam, updateExam, loading } = useCbtStore();
  const navigate = useNavigate();
  const [selectedExam, setSelectedExam] = useState(null);

  useEffect(() => {
    getExams();
  }, []);

  const handleDelete = async (examId, examName) => {
    if (window.confirm(`Are you sure you want to delete ${examName}?`)) {
      try {
        await deleteExam(examId);
        toast.success("✅ Exam deleted successfully");
      } catch (error) {
        toast.error("Failed to delete exam");
      }
    }
  };

  const toggleExamStatus = async (exam) => {
    try {
      await updateExam(exam._id, { isActive: !exam.isActive });
      toast.success(`Exam ${exam.isActive ? 'deactivated' : 'activated'}`);
    } catch (error) {
      toast.error("Failed to update exam status");
    }
  };

  const viewExamDetails = (exam) => {
    setSelectedExam(exam);
  };

  return (
    <div className="container mt-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h3>
          <FaBook className="me-2" />
          Manage Exams
        </h3>
        <button
          className="btn text-white"
          style={{ background: "#15253a" }}
          onClick={() => navigate('/create_exam')}
        >
          <FaPlus className="me-2" />
          Create New Exam
        </button>
      </div>

      {loading ? (
        <div className="text-center py-5">
          <div className="spinner-border text-primary" />
          <p className="mt-2">Loading exams...</p>
        </div>
      ) : exams.length === 0 ? (
        <div className="card text-center py-5">
          <div className="card-body">
            <FaBook size={60} className="text-muted mb-3" />
            <h5>No Exams Created Yet</h5>
            <p className="text-muted">Create your first exam to get started</p>
            <button
              className="btn btn-primary"
              onClick={() => navigate('/create_exam')}
            >
              Create Exam
            </button>
          </div>
        </div>
      ) : (
        <div className="row">
          {exams.map((exam) => (
            <div key={exam._id} className="col-md-6 col-lg-4 mb-4">
              <div className="card h-100 shadow-sm hover-shadow">
                <div 
                  className="card-header text-white d-flex justify-content-between align-items-center"
                  style={{ background: "#15253a" }}
                >
                  <h5 className="mb-0">{exam.displayName}</h5>
                  {exam.isActive ? (
                    <FaCheckCircle className="text-success" title="Active" />
                  ) : (
                    <FaTimesCircle className="text-danger" title="Inactive" />
                  )}
                </div>

                <div className="card-body">
                  <div className="mb-2">
                    <small className="text-muted">Code:</small>
                    <strong className="ms-2">{exam.name.toUpperCase()}</strong>
                  </div>

                  <div className="mb-2">
                    <small className="text-muted">Category:</small>
                    <span className="ms-2 badge bg-secondary">
                      {exam.category}
                    </span>
                  </div>

                  <div className="mb-2">
                    <FaClock className="text-muted me-2" />
                    <small>
                      {exam.defaultTotalTime} mins total | {exam.defaultTimePerQuestion}s per question
                    </small>
                  </div>

                  <div className="mb-2">
                    <small className="text-muted">Passing Score:</small>
                    <strong className="ms-2">{exam.passingPercentage}%</strong>
                  </div>

                  <div className="mb-3">
                    <small className="text-muted">Total Questions:</small>
                    <strong className="ms-2">{exam.totalQuestions || 0}</strong>
                  </div>

                  {/* Years */}
                  <div className="mb-3">
                    <small className="text-muted d-block mb-1">Years:</small>
                    <div className="d-flex flex-wrap gap-1">
                      {exam.years && exam.years.length > 0 ? (
                        exam.years.map((yearData) => (
                          <span 
                            key={yearData.year} 
                            className="badge bg-info"
                            title={`${yearData.subjects.length} subjects`}
                          >
                            {yearData.year} ({yearData.subjects.length})
                          </span>
                        ))
                      ) : (
                        <small className="text-danger">No years added yet</small>
                      )}
                    </div>
                  </div>

                  {/* Description */}
                  {exam.description && (
                    <p className="text-muted small mb-3">
                      {exam.description.substring(0, 100)}
                      {exam.description.length > 100 && '...'}
                    </p>
                  )}
                </div>

                <div className="card-footer bg-transparent border-top-0">
                  <div className="btn-group w-100" role="group">
                    <button
                      className="btn btn-sm btn-outline-primary"
                      onClick={() => viewExamDetails(exam)}
                      title="View Details"
                    >
                      <FaEye />
                    </button>
                    <button
                      className="btn btn-sm btn-outline-success"
                      onClick={() => navigate('/add_year', { state: { exam } })}
                      title="Add Year"
                    >
                      <FaCalendar />
                    </button>
                    <button
                      className="btn btn-sm btn-outline-warning"
                      onClick={() => navigate(`/edit_exam/${exam._id}`)}
                      title="Edit"
                    >
                      <FaEdit />
                    </button>
                    <button
                      className={`btn btn-sm ${exam.isActive ? 'btn-outline-secondary' : 'btn-outline-success'}`}
                      onClick={() => toggleExamStatus(exam)}
                      title={exam.isActive ? 'Deactivate' : 'Activate'}
                    >
                      {exam.isActive ? 'OFF' : 'ON'}
                    </button>
                    <button
                      className="btn btn-sm btn-outline-danger"
                      onClick={() => handleDelete(exam._id, exam.displayName)}
                      title="Delete"
                    >
                      <FaTrash />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Exam Details Modal */}
      {selectedExam && (
        <div 
          className="modal fade show d-block" 
          style={{ background: "rgba(0,0,0,0.5)" }}
          onClick={() => setSelectedExam(null)}
        >
          <div 
            className="modal-dialog modal-lg modal-dialog-centered"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-content">
              <div className="modal-header" style={{ background: "#15253a", color: "white" }}>
                <h5 className="modal-title">{selectedExam.displayName} - Details</h5>
                <button 
                  type="button" 
                  className="btn-close btn-close-white"
                  onClick={() => setSelectedExam(null)}
                />
              </div>
              <div className="modal-body">
                <div className="row mb-3">
                  <div className="col-md-6">
                    <strong>Code:</strong> {selectedExam.name.toUpperCase()}
                  </div>
                  <div className="col-md-6">
                    <strong>Category:</strong> {selectedExam.category}
                  </div>
                </div>

                <div className="row mb-3">
                  <div className="col-md-6">
                    <strong>Total Time:</strong> {selectedExam.defaultTotalTime} minutes
                  </div>
                  <div className="col-md-6">
                    <strong>Time Per Question:</strong> {selectedExam.defaultTimePerQuestion} seconds
                  </div>
                </div>

                <div className="row mb-3">
                  <div className="col-md-6">
                    <strong>Passing Score:</strong> {selectedExam.passingPercentage}%
                  </div>
                  <div className="col-md-6">
                    <strong>Status:</strong> 
                    <span className={`badge ms-2 ${selectedExam.isActive ? 'bg-success' : 'bg-danger'}`}>
                      {selectedExam.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                </div>

                {selectedExam.description && (
                  <div className="mb-3">
                    <strong>Description:</strong>
                    <p className="mt-2">{selectedExam.description}</p>
                  </div>
                )}

                {selectedExam.instructions && (
                  <div className="mb-3">
                    <strong>Instructions:</strong>
                    <p className="mt-2 text-muted">{selectedExam.instructions}</p>
                  </div>
                )}

                {/* Years and Subjects */}
                <div className="mb-3">
                  <strong>Years and Subjects:</strong>
                  {selectedExam.years && selectedExam.years.length > 0 ? (
                    <div className="mt-2">
                      {selectedExam.years.map((yearData) => (
                        <div key={yearData.year} className="card mb-2">
                          <div className="card-body">
                            <h6 className="mb-2">
                              <FaCalendar className="me-2" />
                              Year {yearData.year}
                            </h6>
                            <div className="d-flex flex-wrap gap-2">
                              {yearData.subjects.map((subject, idx) => (
                                <span key={idx} className="badge bg-info">
                                  {subject.name || subject} 
                                  {subject.questionCount > 0 && ` (${subject.questionCount} questions)`}
                                </span>
                              ))}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-muted mt-2">No years added yet</p>
                  )}
                </div>

                <div className="row">
                  <div className="col-md-6">
                    <strong>Total Questions:</strong> {selectedExam.totalQuestions || 0}
                  </div>
                  <div className="col-md-6">
                    <strong>Created:</strong> {new Date(selectedExam.createdAt).toLocaleDateString()}
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <button 
                  className="btn btn-secondary"
                  onClick={() => setSelectedExam(null)}
                >
                  Close
                </button>
                <button 
                  className="btn text-white"
                  style={{ background: "#15253a" }}
                  onClick={() => {
                    setSelectedExam(null);
                    navigate('/add_year', { state: { exam: selectedExam } });
                  }}
                >
                  <FaPlus className="me-2" />
                  Add Year
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageExams;