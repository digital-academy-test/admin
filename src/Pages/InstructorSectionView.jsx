// src/pages/Instructor/InstructorSectionView.jsx
import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useCourseStore } from "../Store/courseStore";
import toast from "react-hot-toast";

const InstructorSectionView = () => {
  const { courseId, sectionId } = useParams();
  const navigate = useNavigate();
  
  const {
    course,
    sections,
    getCourseById,
    updateSection,
    deleteSection,
    getUnansweredQuestions,
    answerQuestion,
    loading,
  } = useCourseStore();

  const [section, setSection] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [activeTab, setActiveTab] = useState("overview");
  const [editMode, setEditMode] = useState(false);
  const [editData, setEditData] = useState({
    title: "",
    description: "",
    objective: "",
  });
  const [answerText, setAnswerText] = useState("");
  const [selectedQuestion, setSelectedQuestion] = useState(null);

  // Load section data
  useEffect(() => {
    if (courseId && sectionId) {
      loadSectionData();
      loadQuestions();
    }
  }, [courseId, sectionId]);

  const loadSectionData = async () => {
    try {
      await getCourseById(courseId);
    } catch (error) {
      console.error("Failed to load course:", error);
      toast.error("Failed to load section");
    }
  };

  const loadQuestions = async () => {
    try {
      const result = await getUnansweredQuestions(courseId);
      // Filter questions for this section
      const sectionQuestions = result.filter(q => q.section_id === sectionId);
      setQuestions(sectionQuestions);
    } catch (error) {
      console.error("Failed to load questions:", error);
    }
  };

  // Find current section
  useEffect(() => {
    if (sections && sections.length > 0) {
      const currentSection = sections.find(s => s._id === sectionId);
      if (currentSection) {
        setSection(currentSection);
        setEditData({
          title: currentSection.title || "",
          description: currentSection.description || "",
          objective: currentSection.objective || "",
        });
      }
    }
  }, [sections, sectionId]);

  // Handlers
  const handleEditToggle = () => {
    setEditMode(!editMode);
    if (!editMode && section) {
      setEditData({
        title: section.title,
        description: section.description,
        objective: section.objective,
      });
    }
  };

  const handleSaveEdit = async () => {
    try {
      await updateSection(sectionId, editData);
      toast.success("✅ Section updated successfully");
      setEditMode(false);
      loadSectionData();
    } catch (error) {
      toast.error("Failed to update section");
    }
  };

  const handleDelete = async () => {
    if (window.confirm(`Are you sure you want to delete "${section.title}"? This will delete all content in this section.`)) {
      try {
        await deleteSection(sectionId);
        toast.success("✅ Section deleted successfully");
        navigate(`/course/${courseId}`);
      } catch (error) {
        toast.error("Failed to delete section");
      }
    }
  };

  const handleAnswerQuestion = async (questionId) => {
    if (!answerText.trim()) {
      toast.error("Please enter an answer");
      return;
    }

    try {
      await answerQuestion(questionId, {
        answer: answerText,
        answeredBy: "instructor", // You can get this from authStore
      });
      toast.success("✅ Question answered successfully");
      setAnswerText("");
      setSelectedQuestion(null);
      loadQuestions();
    } catch (error) {
      toast.error("Failed to answer question");
    }
  };

  const handleAddContent = () => {
    navigate(`/add_section/${courseId}?editSection=${sectionId}`);
  };

  if (loading && !section) {
    return (
      <div className="container py-5 text-center">
        <div className="spinner-border text-primary" style={{ width: "3rem", height: "3rem" }}>
          <span className="visually-hidden">Loading...</span>
        </div>
        <p className="mt-3 text-muted">Loading section...</p>
      </div>
    );
  }

  if (!section) {
    return (
      <div className="container py-5">
        <div className="alert alert-warning">
          <i className="bi bi-exclamation-triangle me-2"></i>
          Section not found
        </div>
        <button onClick={() => navigate(`/course/${courseId}`)} className="btn btn-primary">
          <i className="bi bi-arrow-left me-2"></i>Back to Course
        </button>
      </div>
    );
  }

  return (
    <div className="container-fluid py-4" style={{ backgroundColor: "#f8f9fa", minHeight: "100vh" }}>
      {/* Header */}
      <div className="card border-0 shadow-sm mb-4">
        <div className="card-body p-4">
          <div className="d-flex justify-content-between align-items-start mb-3">
            <button
              onClick={() => navigate(`/course/${courseId}`)}
              className="btn btn-outline-secondary btn-sm"
            >
              <i className="bi bi-arrow-left me-1"></i>Back to Course
            </button>
            <div className="d-flex gap-2">
              <button
                onClick={handleEditToggle}
                className="btn btn-outline-primary btn-sm"
              >
                <i className={`bi ${editMode ? "bi-x" : "bi-pencil"} me-1`}></i>
                {editMode ? "Cancel" : "Edit"}
              </button>
              <button
                onClick={handleAddContent}
                className="btn btn-primary btn-sm"
              >
                <i className="bi bi-plus-circle me-1"></i>Add Content
              </button>
              <button
                onClick={handleDelete}
                className="btn btn-outline-danger btn-sm"
              >
                <i className="bi bi-trash me-1"></i>Delete
              </button>
            </div>
          </div>

          {editMode ? (
            // Edit Mode
            <div>
              <div className="mb-3">
                <label className="form-label fw-semibold">Section Title</label>
                <input
                  type="text"
                  className="form-control"
                  value={editData.title}
                  onChange={(e) => setEditData({ ...editData, title: e.target.value })}
                />
              </div>
              <div className="mb-3">
                <label className="form-label fw-semibold">Description</label>
                <textarea
                  className="form-control"
                  rows="3"
                  value={editData.description}
                  onChange={(e) => setEditData({ ...editData, description: e.target.value })}
                />
              </div>
              <div className="mb-3">
                <label className="form-label fw-semibold">Learning Objective</label>
                <textarea
                  className="form-control"
                  rows="2"
                  value={editData.objective}
                  onChange={(e) => setEditData({ ...editData, objective: e.target.value })}
                />
              </div>
              <button onClick={handleSaveEdit} className="btn btn-success">
                <i className="bi bi-check-circle me-1"></i>Save Changes
              </button>
            </div>
          ) : (
            // View Mode
            <div>
              <h2 className="fw-bold mb-2">{section.title}</h2>
              <p className="text-muted mb-3">{section.description}</p>
              {section.objective && (
                <div className="alert alert-info mb-0">
                  <i className="bi bi-lightbulb me-2"></i>
                  <strong>Learning Objective:</strong> {section.objective}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Stats Cards */}
      <div className="row g-3 mb-4">
        <div className="col-md-3">
          <div className="card border-0 shadow-sm h-100">
            <div className="card-body text-center">
              <i className="bi bi-folder fs-1 text-primary mb-2"></i>
              <h3 className="fw-bold mb-0">{section.contents?.length || 0}</h3>
              <p className="text-muted mb-0 small">Total Content Items</p>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card border-0 shadow-sm h-100">
            <div className="card-body text-center">
              <i className="bi bi-play-circle fs-1 text-success mb-2"></i>
              <h3 className="fw-bold mb-0">
                {section.contents?.filter(c => c.type === "video").length || 0}
              </h3>
              <p className="text-muted mb-0 small">Videos</p>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card border-0 shadow-sm h-100">
            <div className="card-body text-center">
              <i className="bi bi-file-pdf fs-1 text-danger mb-2"></i>
              <h3 className="fw-bold mb-0">
                {section.contents?.filter(c => c.type === "pdf").length || 0}
              </h3>
              <p className="text-muted mb-0 small">PDFs</p>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card border-0 shadow-sm h-100">
            <div className="card-body text-center">
              <i className="bi bi-question-square fs-1 text-warning mb-2"></i>
              <h3 className="fw-bold mb-0">
                {section.contents?.filter(c => c.type === "quiz").length || 0}
              </h3>
              <p className="text-muted mb-0 small">Quizzes</p>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <ul className="nav nav-tabs mb-4">
        <li className="nav-item">
          <button
            className={`nav-link ${activeTab === "overview" ? "active" : ""}`}
            onClick={() => setActiveTab("overview")}
          >
            <i className="bi bi-eye me-2"></i>Overview
          </button>
        </li>
        <li className="nav-item">
          <button
            className={`nav-link ${activeTab === "content" ? "active" : ""}`}
            onClick={() => setActiveTab("content")}
          >
            <i className="bi bi-folder me-2"></i>Content ({section.contents?.length || 0})
          </button>
        </li>
        <li className="nav-item">
          <button
            className={`nav-link ${activeTab === "questions" ? "active" : ""}`}
            onClick={() => setActiveTab("questions")}
          >
            <i className="bi bi-question-circle me-2"></i>Q&A ({questions.length})
          </button>
        </li>
      </ul>

      {/* Tab Content */}
      <div className="tab-content">
        {/* Overview Tab */}
        {activeTab === "overview" && (
          <div className="card border-0 shadow-sm">
            <div className="card-body p-4">
              <h5 className="fw-bold mb-4">Section Overview</h5>
              
              <div className="row g-4">
                <div className="col-md-6">
                  <div className="border-start border-primary border-4 ps-3 mb-4">
                    <h6 className="text-muted mb-1">Order</h6>
                    <p className="fw-semibold mb-0">Section #{section.order}</p>
                  </div>

                  <div className="border-start border-success border-4 ps-3 mb-4">
                    <h6 className="text-muted mb-1">Created</h6>
                    <p className="fw-semibold mb-0">
                      {new Date(section.created_at).toLocaleDateString()}
                    </p>
                  </div>

                  <div className="border-start border-info border-4 ps-3">
                    <h6 className="text-muted mb-1">Last Updated</h6>
                    <p className="fw-semibold mb-0">
                      {new Date(section.updated_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>

                <div className="col-md-6">
                  <h6 className="fw-semibold mb-3">Content Breakdown</h6>
                  <div className="list-group">
                    <div className="list-group-item d-flex justify-content-between align-items-center">
                      <span>
                        <i className="bi bi-play-circle text-success me-2"></i>Videos
                      </span>
                      <span className="badge bg-success rounded-pill">
                        {section.contents?.filter(c => c.type === "video").length || 0}
                      </span>
                    </div>
                    <div className="list-group-item d-flex justify-content-between align-items-center">
                      <span>
                        <i className="bi bi-file-pdf text-danger me-2"></i>PDF Documents
                      </span>
                      <span className="badge bg-danger rounded-pill">
                        {section.contents?.filter(c => c.type === "pdf").length || 0}
                      </span>
                    </div>
                    <div className="list-group-item d-flex justify-content-between align-items-center">
                      <span>
                        <i className="bi bi-question-square text-warning me-2"></i>Quizzes
                      </span>
                      <span className="badge bg-warning rounded-pill">
                        {section.contents?.filter(c => c.type === "quiz").length || 0}
                      </span>
                    </div>
                    <div className="list-group-item d-flex justify-content-between align-items-center">
                      <span>
                        <i className="bi bi-file-text text-info me-2"></i>Text Content
                      </span>
                      <span className="badge bg-info rounded-pill">
                        {section.contents?.filter(c => c.type === "text").length || 0}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Content Tab */}
        {activeTab === "content" && (
          <div className="card border-0 shadow-sm">
            <div className="card-body p-4">
              <div className="d-flex justify-content-between align-items-center mb-4">
                <h5 className="fw-bold mb-0">Section Content</h5>
                <button onClick={handleAddContent} className="btn btn-primary btn-sm">
                  <i className="bi bi-plus-circle me-1"></i>Add Content
                </button>
              </div>

              {section.contents && section.contents.length > 0 ? (
                <div className="list-group">
                  {section.contents.map((content, idx) => (
                    <div key={idx} className="list-group-item">
                      <div className="d-flex justify-content-between align-items-start">
                        <div className="flex-grow-1">
                          <div className="d-flex align-items-center mb-2">
                            {content.type === "video" && (
                              <span className="badge bg-success me-2">
                                <i className="bi bi-play-circle me-1"></i>Video
                              </span>
                            )}
                            {content.type === "pdf" && (
                              <span className="badge bg-danger me-2">
                                <i className="bi bi-file-pdf me-1"></i>PDF
                              </span>
                            )}
                            {content.type === "quiz" && (
                              <span className="badge bg-warning me-2">
                                <i className="bi bi-question-square me-1"></i>Quiz
                              </span>
                            )}
                            {content.type === "text" && (
                              <span className="badge bg-info me-2">
                                <i className="bi bi-file-text me-1"></i>Text
                              </span>
                            )}
                            <h6 className="mb-0">{content.title}</h6>
                          </div>

                          {content.type === "video" && (
                            <div className="text-muted small">
                              <i className="bi bi-clock me-1"></i>
                              Duration: {content.duration} min
                              {content.preview_enabled && (
                                <span className="badge bg-primary ms-2">Preview Available</span>
                              )}
                            </div>
                          )}

                          {content.type === "quiz" && content.quiz && (
                            <div className="text-muted small">
                              <i className="bi bi-list-check me-1"></i>
                              {content.quiz.questions?.length || 0} questions
                            </div>
                          )}
                        </div>

                        <div className="d-flex gap-2">
                          <button
                            className="btn btn-sm btn-outline-primary"
                            title="Edit Content"
                          >
                            <i className="bi bi-pencil"></i>
                          </button>
                          <button
                            className="btn btn-sm btn-outline-danger"
                            title="Delete Content"
                          >
                            <i className="bi bi-trash"></i>
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-5">
                  <i className="bi bi-inbox fs-1 text-muted mb-3 d-block"></i>
                  <p className="text-muted mb-3">No content yet. Add your first content item!</p>
                  <button onClick={handleAddContent} className="btn btn-primary">
                    <i className="bi bi-plus-circle me-1"></i>Add Content
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Q&A Tab */}
        {activeTab === "questions" && (
          <div className="card border-0 shadow-sm">
            <div className="card-body p-4">
              <h5 className="fw-bold mb-4">
                Unanswered Questions 
                {questions.length > 0 && (
                  <span className="badge bg-warning ms-2">{questions.length}</span>
                )}
              </h5>

              {questions.length > 0 ? (
                <div className="accordion" id="questionsAccordion">
                  {questions.map((question, idx) => (
                    <div key={question._id} className="accordion-item mb-3">
                      <h2 className="accordion-header">
                        <button
                          className="accordion-button collapsed"
                          type="button"
                          data-bs-toggle="collapse"
                          data-bs-target={`#question${idx}`}
                        >
                          <div className="w-100">
                            <div className="d-flex justify-content-between align-items-start">
                              <div className="flex-grow-1">
                                <h6 className="mb-1">{question.question}</h6>
                                <small className="text-muted">
                                  By {question.userName} • {new Date(question.created_at).toLocaleDateString()}
                                </small>
                              </div>
                              <span className="badge bg-warning ms-2">Unanswered</span>
                            </div>
                          </div>
                        </button>
                      </h2>
                      <div
                        id={`question${idx}`}
                        className="accordion-collapse collapse"
                        data-bs-parent="#questionsAccordion"
                      >
                        <div className="accordion-body">
                          <div className="mb-3">
                            <strong>Question:</strong>
                            <div
                              className="mt-2 p-3 bg-light rounded"
                              dangerouslySetInnerHTML={{ __html: question.questionHtml || question.question }}
                            />
                          </div>

                          {question.videoTimestamp && (
                            <div className="mb-3">
                              <small className="text-muted">
                                <i className="bi bi-clock me-1"></i>
                                Asked at: {question.videoTimestamp}
                              </small>
                            </div>
                          )}

                          <div className="border-top pt-3">
                            <label className="form-label fw-semibold">Your Answer</label>
                            <textarea
                              className="form-control mb-2"
                              rows="4"
                              placeholder="Type your answer here..."
                              value={selectedQuestion === question._id ? answerText : ""}
                              onChange={(e) => {
                                setAnswerText(e.target.value);
                                setSelectedQuestion(question._id);
                              }}
                            />
                            <button
                              onClick={() => handleAnswerQuestion(question._id)}
                              className="btn btn-primary"
                              disabled={loading}
                            >
                              <i className="bi bi-send me-1"></i>
                              Submit Answer
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-5">
                  <i className="bi bi-check-circle fs-1 text-success mb-3 d-block"></i>
                  <p className="text-muted">All questions have been answered! 🎉</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default InstructorSectionView;