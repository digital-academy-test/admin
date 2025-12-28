// src/pages/ManageQuestions.jsx
import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useCbtStore } from "../Store/cbtStore";
import toast from "react-hot-toast";
import RichTextEditor from '../Component/RichTextEditor';
import { 
  FaEdit, 
  FaTrash, 
  FaArrowLeft, 
  FaImage, 
  FaCheckCircle,
  FaTimesCircle 
} from "react-icons/fa";

const ManageQuestions = () => {
  const { state } = useLocation();
  const navigate = useNavigate();
  const { examId, examName, year, subject, duration } = state || {};

  const { getQuestions, updateQuestion, deleteQuestion, loading } = useCbtStore();
  const [questions, setQuestions] = useState([]);
  const [editingQuestion, setEditingQuestion] = useState(null);
  const [formData, setFormData] = useState({
    question: "",
    options: [
      { type: 'text', content: '', label: 'A' },
      { type: 'text', content: '', label: 'B' },
      { type: 'text', content: '', label: 'C' },
      { type: 'text', content: '', label: 'D' }
    ],
    answer: "",
    difficulty: "medium",
    topic: "",
    explanation: "",
  });
  const [questionImage, setQuestionImage] = useState(null);
  const [questionImagePreview, setQuestionImagePreview] = useState(null);

  useEffect(() => {
    if (!examName || !year || !subject) {
      toast.error("Missing exam information");
      navigate(-1);
      return;
    }
    fetchQuestions();
  }, [examName, year, subject]);

  const fetchQuestions = async () => {
    try {
      const filters = {
        examName: examName,
        year: year,
        subject: subject      };
      const result = await getQuestions(filters);
      setQuestions(result.questions || []);
    } catch (err) {
      console.error("Error fetching questions:", err);
      toast.error("Failed to load questions");
    }
  };

  const handleEdit = (question) => {
    setEditingQuestion(question._id);
    
    // Parse options based on the new structure
    const parsedOptions = question.options.map((opt, index) => {
      if (typeof opt === 'object' && opt.type) {
        return opt;
      }
      // Legacy format - plain text options
      return {
        type: 'text',
        content: opt,
        label: String.fromCharCode(65 + index)
      };
    });

    setFormData({
      question: question.question || "",
      options: parsedOptions,
      answer: question.answer || question.ans || "",
      difficulty: question.difficulty || "medium",
      topic: question.topic || "",
      explanation: question.explanation || "",
    });
    
    setQuestionImagePreview(question.questionImage || null);
  };

  const handleSave = async () => {
    try {
      // Validation
      if (!formData.question || formData.question.trim() === '') {
        toast.error("Question cannot be empty");
        return;
      }

      const hasEmptyOptions = formData.options.some(opt => 
        opt.type === 'text' && (!opt.content || opt.content.trim() === '')
      );
      
      if (hasEmptyOptions) {
        toast.error("All options must be filled");
        return;
      }

      if (!formData.answer) {
        toast.error("Please select the correct answer");
        return;
      }

      const formDataToSend = new FormData();
      
      formDataToSend.append('question', formData.question.trim());
      formDataToSend.append('answer', formData.answer.toUpperCase());
      formDataToSend.append('difficulty', formData.difficulty);
      formDataToSend.append('topic', formData.topic || '');
      formDataToSend.append('explanation', formData.explanation || '');

      // Options
      const optionsData = formData.options.map(opt => ({
        type: opt.type,
        content: opt.type === 'text' ? opt.content : '',
        label: opt.label
      }));
      formDataToSend.append('options', JSON.stringify(optionsData));

      // Question image (if new image selected)
      if (questionImage) {
        formDataToSend.append('questionImage', questionImage);
      }

      await updateQuestion(editingQuestion, formDataToSend);
      
      // Refresh questions list
      await fetchQuestions();
      
      setEditingQuestion(null);
      setQuestionImage(null);
      setQuestionImagePreview(null);
      toast.success("✅ Question updated successfully!");
    } catch (err) {
      console.error("Error updating question:", err);
      toast.error(err.response?.data?.message || "Failed to update question");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this question?")) return;
    
    try {
      await deleteQuestion(id);
      setQuestions((prev) => prev.filter((q) => q._id !== id));
      toast.success("🗑️ Question deleted successfully!");
    } catch (err) {
      console.error("Error deleting question:", err);
      toast.error("Failed to delete question");
    }
  };

  const handleOptionChange = (index, value) => {
    const newOptions = [...formData.options];
    newOptions[index].content = value;
    setFormData((prev) => ({ ...prev, options: newOptions }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setQuestionImage(file);
      setQuestionImagePreview(URL.createObjectURL(file));
    }
  };

  if (loading) {
    return (
      <div className="container mt-4 text-center">
        <div className="spinner-border text-primary" />
        <p className="mt-2">Loading questions...</p>
      </div>
    );
  }

  return (
    <div className="container mt-4" style={{ maxWidth: "900px" }}>
      <div className="card shadow-lg border-0 rounded-4">
        <div 
          className="card-header text-white py-3"
          style={{ background: "#15253a" }}
        >
          <div className="d-flex justify-content-between align-items-center">
            <h4 className="mb-0">
              Manage Questions
            </h4>
            <button
              className="btn btn-outline-light btn-sm"
              onClick={() => navigate(-1)}
            >
              <FaArrowLeft className="me-2" />
              Back
            </button>
          </div>
          <div className="mt-2">
            <small>
              {examName?.toUpperCase()} | Year {year} | {subject}
            </small>
          </div>
        </div>

        <div className="card-body p-4">
          {/* Stats */}
          <div className="row mb-4">
            <div className="col-md-3">
              <div className="card bg-primary bg-opacity-10 border-primary">
                <div className="card-body text-center">
                  <h3 className="mb-0">{questions.length}</h3>
                  <small>Total Questions</small>
                </div>
              </div>
            </div>
            <div className="col-md-3">
              <div className="card bg-success bg-opacity-10 border-success">
                <div className="card-body text-center">
                  <h3 className="mb-0">{questions.filter(q => q.difficulty === 'easy').length}</h3>
                  <small>Easy</small>
                </div>
              </div>
            </div>
            <div className="col-md-3">
              <div className="card bg-warning bg-opacity-10 border-warning">
                <div className="card-body text-center">
                  <h3 className="mb-0">{questions.filter(q => q.difficulty === 'medium').length}</h3>
                  <small>Medium</small>
                </div>
              </div>
            </div>
            <div className="col-md-3">
              <div className="card bg-danger bg-opacity-10 border-danger">
                <div className="card-body text-center">
                  <h3 className="mb-0">{questions.filter(q => q.difficulty === 'hard').length}</h3>
                  <small>Hard</small>
                </div>
              </div>
            </div>
          </div>

          {/* Questions List */}
          {questions.length === 0 ? (
            <div className="text-center py-5">
              <p className="text-muted">No questions found for this subject.</p>
              <button 
                className="btn btn-primary"
                onClick={() => navigate('/add_question')}
              >
                Add First Question
              </button>
            </div>
          ) : (
            <div className="list-group">
              {questions.map((q, idx) => (
                <div
                  key={q._id}
                  className="list-group-item mb-3 p-3 border rounded-3 shadow-sm"
                >
                  {editingQuestion === q._id ? (
                    /* Edit Modal */
                    <div
                      className="position-fixed top-0 start-0 w-100 h-100 d-flex justify-content-center align-items-center"
                      style={{ background: "rgba(0,0,0,0.7)", zIndex: 2000, overflowY: "auto" }}
                    >
                      <div 
                        className="card p-4 shadow-lg my-4" 
                        style={{ maxWidth: "700px", width: "90%", maxHeight: "90vh", overflowY: "auto" }}
                      >
                        <h5 className="mb-3 text-center">Edit Question</h5>

                        {/* Question */}
                        <div className="mb-3">
                          <label className="form-label fw-bold">Question</label>
                          <RichTextEditor
                            value={formData.question}
                            onChange={(content) => setFormData(prev => ({ ...prev, question: content }))}
                            height="150px"
                          />
                        </div>

                        {/* Question Image */}
                        <div className="mb-3">
                          <label className="form-label fw-bold">
                            <FaImage className="me-2" />
                            Question Image
                          </label>
                          {questionImagePreview && (
                            <div className="text-center mb-2">
                              <img
                                src={questionImagePreview}
                                alt="Question"
                                className="img-fluid rounded"
                                style={{ maxHeight: "200px" }}
                              />
                            </div>
                          )}
                          <input
                            type="file"
                            accept="image/*"
                            className="form-control"
                            onChange={handleImageChange}
                          />
                        </div>

                        {/* Options */}
                        <div className="mb-3">
                          <label className="form-label fw-bold">Options</label>
                          {formData.options.map((opt, i) => (
                            <div key={i} className="mb-2">
                              <label className="form-label">{opt.label}.</label>
                              {opt.type === 'text' ? (
                                <input
                                  value={opt.content}
                                  onChange={(e) => handleOptionChange(i, e.target.value)}
                                  placeholder={`Option ${opt.label}`}
                                  className="form-control"
                                />
                              ) : (
                                <div className="text-muted">Image option (cannot edit here)</div>
                              )}
                            </div>
                          ))}
                        </div>

                        {/* Correct Answer */}
                        <div className="mb-3">
                          <label className="form-label fw-bold">Correct Answer</label>
                          <select
                            name="answer"
                            value={formData.answer}
                            onChange={(e) => setFormData(prev => ({ ...prev, answer: e.target.value }))}
                            className="form-select"
                          >
                            <option value="">-- Select Answer --</option>
                            <option value="A">A</option>
                            <option value="B">B</option>
                            <option value="C">C</option>
                            <option value="D">D</option>
                          </select>
                        </div>

                        {/* Topic */}
                        <div className="mb-3">
                          <label className="form-label fw-bold">Topic</label>
                          <input
                            name="topic"
                            value={formData.topic}
                            onChange={(e) => setFormData(prev => ({ ...prev, topic: e.target.value }))}
                            placeholder="Topic"
                            className="form-control"
                          />
                        </div>

                        {/* Difficulty */}
                        <div className="mb-3">
                          <label className="form-label fw-bold">Difficulty</label>
                          <select
                            name="difficulty"
                            value={formData.difficulty}
                            onChange={(e) => setFormData(prev => ({ ...prev, difficulty: e.target.value }))}
                            className="form-select"
                          >
                            <option value="easy">Easy</option>
                            <option value="medium">Medium</option>
                            <option value="hard">Hard</option>
                          </select>
                        </div>

                        {/* Explanation */}
                        <div className="mb-3">
                          <label className="form-label fw-bold">Explanation</label>
                          <RichTextEditor
                            value={formData.explanation}
                            onChange={(content) => setFormData(prev => ({ ...prev, explanation: content }))}
                            height="100px"
                          />
                        </div>

                        {/* Buttons */}
                        <div className="d-flex justify-content-center gap-3">
                          <button 
                            onClick={handleSave} 
                            className="btn btn-success px-4"
                            disabled={loading}
                          >
                            {loading ? 'Saving...' : 'Save'}
                          </button>
                          <button
                            onClick={() => {
                              setEditingQuestion(null);
                              setQuestionImage(null);
                              setQuestionImagePreview(null);
                            }}
                            className="btn btn-secondary px-4"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    </div>
                  ) : (
                    /* Display Question */
                    <>
                      <div className="d-flex justify-content-between align-items-start mb-2">
                        <div className="flex-grow-1">
                          <p className="mb-2">
                            <strong>Q{idx + 1}:</strong> 
                            <span dangerouslySetInnerHTML={{ __html: q.question }} />
                          </p>
                        </div>
                        <span className={`badge ${
                          q.difficulty === 'easy' ? 'bg-success' :
                          q.difficulty === 'medium' ? 'bg-warning' :
                          'bg-danger'
                        }`}>
                          {q.difficulty}
                        </span>
                      </div>

                      {q.questionImage && (
                        <div className="text-center mb-3">
                          <img
                            src={q.questionImage}
                            alt="question"
                            className="img-fluid rounded"
                            style={{ maxHeight: "200px" }}
                          />
                        </div>
                      )}

                      <ul className="list-unstyled mb-2">
                        {q.options.map((opt, i) => {
                          const optionContent = typeof opt === 'object' ? opt.content : opt;
                          const isCorrect = (typeof opt === 'object' ? opt.label : String.fromCharCode(65 + i)) === q.answer?.toUpperCase();
                          
                          return (
                            <li
                              key={i}
                              className={`p-2 mb-1 rounded ${isCorrect ? 'bg-success bg-opacity-10 text-success fw-bold' : ''}`}
                            >
                              {isCorrect && <FaCheckCircle className="me-2" />}
                              {String.fromCharCode(65 + i)}. {optionContent}
                            </li>
                          );
                        })}
                      </ul>

                      {q.topic && (
                        <p className="text-muted small mb-2">
                          <strong>Topic:</strong> {q.topic}
                        </p>
                      )}

                      {q.explanation && (
                        <div className="alert alert-info small mb-2">
                          <strong>Explanation:</strong>
                          <div dangerouslySetInnerHTML={{ __html: q.explanation }} />
                        </div>
                      )}

                      <div className="d-flex gap-2 mt-3">
                        <button
                          onClick={() => handleEdit(q)}
                          className="btn btn-outline-primary btn-sm"
                        >
                          <FaEdit className="me-1" />
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(q._id)}
                          className="btn btn-outline-danger btn-sm"
                        >
                          <FaTrash className="me-1" />
                          Delete
                        </button>
                      </div>
                    </>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ManageQuestions;