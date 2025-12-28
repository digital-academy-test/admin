// src/Component/AddSectionForm.jsx - COMPLETE & ERROR-FREE
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useCourseStore } from "../Store/courseStore";
import toast from "react-hot-toast";

const AddSectionForm = ({ courseId }) => {
  const navigate = useNavigate();
  const { addSection, loading, error, message } = useCourseStore();

  const [contentType, setContentType] = useState("video");
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    objective: "",
    order: 0,
    content_title: "",
    duration_minutes: "",
    duration_text: "",
    is_preview: false,
  });

  const [file, setFile] = useState(null);
  const [quizQuestions, setQuizQuestions] = useState([
    {
      question: "",
      options: ["", "", "", ""],
      correct_answer: "",
      explanation: "",
    },
  ]);
  const [textContent, setTextContent] = useState("");

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
    }
  };

  const handleAddQuestion = () => {
    setQuizQuestions([
      ...quizQuestions,
      {
        question: "",
        options: ["", "", "", ""],
        correct_answer: "",
        explanation: "",
      },
    ]);
  };

  const handleRemoveQuestion = (index) => {
    const updated = quizQuestions.filter((_, i) => i !== index);
    setQuizQuestions(updated);
  };

  const handleQuestionChange = (index, field, value) => {
    const updated = [...quizQuestions];
    updated[index][field] = value;
    setQuizQuestions(updated);
  };

  const handleOptionChange = (qIndex, oIndex, value) => {
    const updated = [...quizQuestions];
    updated[qIndex].options[oIndex] = value;
    setQuizQuestions(updated);
  };

  const validateForm = () => {
    if (!formData.title.trim()) {
      toast.error("Section title is required");
      return false;
    }

    if (contentType === "video" || contentType === "pdf") {
      if (!file) {
        toast.error(`Please upload a ${contentType} file`);
        return false;
      }
    }

    if (contentType === "quiz") {
      if (quizQuestions.length === 0) {
        toast.error("Add at least one quiz question");
        return false;
      }

      for (let i = 0; i < quizQuestions.length; i++) {
        const q = quizQuestions[i];
        if (!q.question.trim()) {
          toast.error(`Question ${i + 1}: Question text is required`);
          return false;
        }
        if (q.options.some((opt) => !opt.trim())) {
          toast.error(`Question ${i + 1}: All options must be filled`);
          return false;
        }
        if (!q.correct_answer.trim()) {
          toast.error(`Question ${i + 1}: Correct answer is required`);
          return false;
        }
      }
    }

    if (contentType === "text") {
      if (!textContent.trim()) {
        toast.error("Text content is required");
        return false;
      }
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    try {
      const data = new FormData();
      data.append("courseId", courseId);
      data.append("title", formData.title);
      data.append("description", formData.description);
      data.append("objective", formData.objective);
      data.append("order", formData.order);
      data.append("contentType", contentType);
      data.append("content_title", formData.content_title || formData.title);

      if (contentType === "video" || contentType === "pdf") {
        data.append("file", file);
        data.append("duration_minutes", formData.duration_minutes || 0);
        data.append("duration_text", formData.duration_text || "");
        data.append("is_preview", formData.is_preview);
      } else if (contentType === "quiz") {
        data.append("quiz", JSON.stringify(quizQuestions));
      } else if (contentType === "text") {
        data.append("text_content", textContent);
      }

      await addSection(data);
      toast.success("✅ Section added successfully!");
      navigate(`/course/${courseId}/stats`);
    } catch (error) {
      toast.error(error.message || "Failed to add section");
    }
  };

  return (
    <div className="container py-4">
      <div className="card shadow-sm border-0 rounded-3">
        <div className="card-body p-4">
          <h4 className="fw-bold mb-4">
            <i className="bi bi-plus-circle me-2 text-primary"></i>
            Add New Section
          </h4>

          {message && (
            <div className="alert alert-success alert-dismissible fade show">
              <i className="bi bi-check-circle me-2"></i>
              {message}
              <button
                type="button"
                className="btn-close"
                onClick={() => useCourseStore.getState().clearMessage()}
              ></button>
            </div>
          )}

          {error && (
            <div className="alert alert-danger alert-dismissible fade show">
              <i className="bi bi-exclamation-triangle me-2"></i>
              {error}
              <button
                type="button"
                className="btn-close"
                onClick={() => useCourseStore.getState().clearError()}
              ></button>
            </div>
          )}

          <form onSubmit={handleSubmit}>
            {/* Section Details */}
            <div className="card mb-4">
              <div className="card-header bg-light">
                <h5 className="mb-0">
                  <i className="bi bi-info-circle me-2"></i>
                  Section Details
                </h5>
              </div>
              <div className="card-body">
                <div className="row g-3">
                  <div className="col-md-8">
                    <label className="form-label fw-semibold">
                      Section Title <span className="text-danger">*</span>
                    </label>
                    <input
                      type="text"
                      name="title"
                      value={formData.title}
                      onChange={handleChange}
                      className="form-control"
                      placeholder="e.g., Introduction to React Hooks"
                      required
                    />
                  </div>

                  <div className="col-md-4">
                    <label className="form-label fw-semibold">Order</label>
                    <input
                      type="number"
                      name="order"
                      value={formData.order}
                      onChange={handleChange}
                      className="form-control"
                      min="0"
                    />
                  </div>

                  <div className="col-12">
                    <label className="form-label fw-semibold">Description</label>
                    <textarea
                      name="description"
                      value={formData.description}
                      onChange={handleChange}
                      rows="3"
                      className="form-control"
                      placeholder="Brief description of what this section covers..."
                    ></textarea>
                  </div>

                  <div className="col-12">
                    <label className="form-label fw-semibold">Learning Objective</label>
                    <input
                      type="text"
                      name="objective"
                      value={formData.objective}
                      onChange={handleChange}
                      className="form-control"
                      placeholder="What will students learn in this section?"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Content Type Selection */}
            <div className="card mb-4">
              <div className="card-header bg-light">
                <h5 className="mb-0">
                  <i className="bi bi-file-earmark me-2"></i>
                  Content Type
                </h5>
              </div>
              <div className="card-body">
                <div className="row g-3 mb-3">
                  {["video", "pdf", "quiz", "text"].map((type) => (
                    <div className="col-6 col-md-3" key={type}>
                      <button
                        type="button"
                        onClick={() => setContentType(type)}
                        className={`btn w-100 ${
                          contentType === type
                            ? "btn-primary"
                            : "btn-outline-secondary"
                        }`}
                      >
                        <i
                          className={`bi bi-${
                            type === "video"
                              ? "play-circle"
                              : type === "pdf"
                              ? "file-pdf"
                              : type === "quiz"
                              ? "question-circle"
                              : "file-text"
                          } me-2`}
                        ></i>
                        {type.charAt(0).toUpperCase() + type.slice(1)}
                      </button>
                    </div>
                  ))}
                </div>

                {/* Video/PDF Upload */}
                {(contentType === "video" || contentType === "pdf") && (
                  <div>
                    <div className="mb-3">
                      <label className="form-label fw-semibold">
                        Upload {contentType.toUpperCase()}{" "}
                        <span className="text-danger">*</span>
                      </label>
                      <input
                        type="file"
                        accept={
                          contentType === "video"
                            ? "video/*"
                            : "application/pdf"
                        }
                        onChange={handleFileChange}
                        className="form-control"
                        required
                      />
                      {file && (
                        <div className="alert alert-success mt-2">
                          <i className="bi bi-check-circle me-2"></i>
                          Selected: {file.name} (
                          {(file.size / (1024 * 1024)).toFixed(2)} MB)
                        </div>
                      )}
                    </div>

                    {contentType === "video" && (
                      <div className="row g-3">
                        <div className="col-md-6">
                          <label className="form-label fw-semibold">
                            Duration (minutes)
                          </label>
                          <input
                            type="number"
                            name="duration_minutes"
                            value={formData.duration_minutes}
                            onChange={handleChange}
                            className="form-control"
                            min="0"
                            placeholder="e.g., 15"
                          />
                        </div>
                        <div className="col-md-6">
                          <label className="form-label fw-semibold">
                            Duration Text
                          </label>
                          <input
                            type="text"
                            name="duration_text"
                            value={formData.duration_text}
                            onChange={handleChange}
                            className="form-control"
                            placeholder="e.g., 15:30"
                          />
                        </div>
                      </div>
                    )}

                    <div className="form-check mt-3">
                      <input
                        type="checkbox"
                        name="is_preview"
                        checked={formData.is_preview}
                        onChange={handleChange}
                        className="form-check-input"
                        id="previewCheck"
                      />
                      <label className="form-check-label" htmlFor="previewCheck">
                        Allow preview (visible to non-enrolled users)
                      </label>
                    </div>
                  </div>
                )}

                {/* Quiz Builder */}
                {contentType === "quiz" && (
                  <div>
                    <div className="d-flex justify-content-between align-items-center mb-3">
                      <h6 className="mb-0">Quiz Questions</h6>
                      <button
                        type="button"
                        onClick={handleAddQuestion}
                        className="btn btn-sm btn-success"
                      >
                        <i className="bi bi-plus me-1"></i>
                        Add Question
                      </button>
                    </div>

                    {quizQuestions.map((q, qIndex) => (
                      <div key={qIndex} className="card mb-3">
                        <div className="card-body">
                          <div className="d-flex justify-content-between align-items-center mb-3">
                            <h6 className="fw-semibold mb-0">
                              Question {qIndex + 1}
                            </h6>
                            {quizQuestions.length > 1 && (
                              <button
                                type="button"
                                onClick={() => handleRemoveQuestion(qIndex)}
                                className="btn btn-sm btn-danger"
                              >
                                <i className="bi bi-trash"></i>
                              </button>
                            )}
                          </div>

                          {/* Question Text */}
                          <div className="mb-3">
                            <label className="form-label">
                              Question <span className="text-danger">*</span>
                            </label>
                            <input
                              type="text"
                              value={q.question}
                              onChange={(e) =>
                                handleQuestionChange(
                                  qIndex,
                                  "question",
                                  e.target.value
                                )
                              }
                              className="form-control"
                              placeholder="Enter question"
                              required
                            />
                          </div>

                          {/* Options */}
                          <label className="form-label">
                            Options <span className="text-danger">*</span>
                          </label>
                          <div className="row g-2 mb-3">
                            {q.options.map((opt, oIndex) => (
                              <div className="col-md-6" key={oIndex}>
                                <div className="input-group">
                                  <span className="input-group-text">
                                    {String.fromCharCode(65 + oIndex)}
                                  </span>
                                  <input
                                    type="text"
                                    value={opt}
                                    onChange={(e) =>
                                      handleOptionChange(
                                        qIndex,
                                        oIndex,
                                        e.target.value
                                      )
                                    }
                                    className="form-control"
                                    placeholder={`Option ${
                                      String.fromCharCode(65 + oIndex)
                                    }`}
                                    required
                                  />
                                </div>
                              </div>
                            ))}
                          </div>

                          {/* Correct Answer */}
                          <div className="mb-3">
                            <label className="form-label">
                              Correct Answer{" "}
                              <span className="text-danger">*</span>
                            </label>
                            <input
                              type="text"
                              value={q.correct_answer}
                              onChange={(e) =>
                                handleQuestionChange(
                                  qIndex,
                                  "correct_answer",
                                  e.target.value
                                )
                              }
                              className="form-control"
                              placeholder="Enter the correct answer exactly"
                              required
                            />
                            <div className="form-text">
                              Must match one of the options above
                            </div>
                          </div>

                          {/* Explanation */}
                          <div>
                            <label className="form-label">
                              Explanation (optional)
                            </label>
                            <textarea
                              value={q.explanation}
                              onChange={(e) =>
                                handleQuestionChange(
                                  qIndex,
                                  "explanation",
                                  e.target.value
                                )
                              }
                              rows="2"
                              className="form-control"
                              placeholder="Explain why this is the correct answer"
                            ></textarea>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Text Content */}
                {contentType === "text" && (
                  <div>
                    <label className="form-label fw-semibold">
                      Text Content <span className="text-danger">*</span>
                    </label>
                    <textarea
                      value={textContent}
                      onChange={(e) => setTextContent(e.target.value)}
                      rows="10"
                      className="form-control"
                      placeholder="Enter the reading material or text content..."
                      required
                    ></textarea>
                  </div>
                )}
              </div>
            </div>

            {/* Submit Buttons */}
            <div className="d-flex gap-3 justify-content-end">
              <button
                type="button"
                onClick={() => navigate(`/instructor/course/${courseId}`)}
                className="btn btn-outline-secondary px-4"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="btn text-white px-4"
                style={{ backgroundColor: "#0C6F89" }}
              >
                {loading ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2"></span>
                    Adding...
                  </>
                ) : (
                  <>
                    <i className="bi bi-check-circle me-2"></i>
                    Add Section
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AddSectionForm;