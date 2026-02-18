// src/pages/admin/EditQuestion.jsx
import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { FaImage, FaSave, FaArrowLeft, FaBook, FaSpinner } from "react-icons/fa";
import { useCbtStore } from "../Store/cbtStore";
import RichTextEditor from "../Component/RichTextEditor";

const EditQuestion = () => {
  const { id } = useParams(); // question ID from URL e.g. /edit_question/:id
  const navigate = useNavigate();

  const {
    exams,
    getExamsForAdmin,
    examStructure,
    getExamStructure,
    getQuestionById,
    updateQuestion,
    loading,
  } = useCbtStore();

  const [pageLoading, setPageLoading] = useState(true);

  const [formData, setFormData] = useState({
    question: "",
    examId: "",
    examName: "",
    year: "",
    subject: "",
    topic: "",
    level: "",
    answer: "",
    difficulty: "medium",
    points: 1,
    explanation: "",
    isGrouped: false,
  });

  // Question image
  const [questionImage, setQuestionImage] = useState(null); // new file to upload
  const [questionImagePreview, setQuestionImagePreview] = useState(null); // preview (new or existing)
  const [existingQuestionImage, setExistingQuestionImage] = useState(null); // existing S3 URL

  // Options
  const [options, setOptions] = useState([
    { type: "text", content: "", label: "A", file: null, preview: null },
    { type: "text", content: "", label: "B", file: null, preview: null },
    { type: "text", content: "", label: "C", file: null, preview: null },
    { type: "text", content: "", label: "D", file: null, preview: null },
  ]);

  // Comprehension group
  const [groupData, setGroupData] = useState({
    title: "",
    passage: "",
    passageImage: null,
    passageImagePreview: null,
    existingPassageImage: null,
    startNumber: 1,
    endNumber: 5,
  });

  const [selectedExam, setSelectedExam] = useState(null);
  const [availableYears, setAvailableYears] = useState([]);

  // ==================== Load Question Data ====================
  useEffect(() => {
    const loadData = async () => {
      try {
        setPageLoading(true);
        // Load exams, structure, and question in parallel
        await Promise.all([getExamsForAdmin(), getExamStructure()]);
        const question = await getQuestionById(id);
        populateForm(question);
      } catch (error) {
        toast.error("Failed to load question");
        navigate(-1);
      } finally {
        setPageLoading(false);
      }
    };
    loadData();
  }, [id]);

  // ==================== Populate Form From Question ====================
  const populateForm = (question) => {
    setFormData({
      question: question.question || "",
      examId: question.exam?._id || question.exam || "",
      examName: question.examName || "",
      year: question.year?.toString() || "",
      subject: question.subject || "",
      topic: question.topic || "",
      level: question.level || "",
      answer: question.answer || "",
      difficulty: question.difficulty || "medium",
      points: question.points || 1,
      explanation: question.explanation || "",
      isGrouped: question.isGrouped || false,
    });

    // Existing question image
    if (question.questionImage) {
      setExistingQuestionImage(question.questionImage);
      setQuestionImagePreview(question.questionImage);
    }

    // Populate options
    if (question.options && question.options.length === 4) {
      setOptions(
        question.options.map((opt) => ({
          type: opt.type || "text",
          content: opt.type === "text" ? opt.content : "",
          label: opt.label,
          file: null,
          preview: opt.type === "image" ? opt.content : null, // existing S3 URL as preview
          existingUrl: opt.type === "image" ? opt.content : null,
        }))
      );
    }

    // Populate group data
    if (question.group) {
      setGroupData({
        title: question.group.title || "",
        passage: question.group.passage || "",
        passageImage: null,
        passageImagePreview: question.group.passageImage || null,
        existingPassageImage: question.group.passageImage || null,
        startNumber: question.group.startNumber || 1,
        endNumber: question.group.endNumber || 5,
      });
    }
  };

  // Update years when exam changes
  useEffect(() => {
    if (formData.examId && exams.length > 0) {
      const exam = exams.find((e) => e._id === formData.examId);
      setSelectedExam(exam);
      setAvailableYears(exam?.years || []);
    }
  }, [formData.examId, exams]);

  // ==================== Handlers ====================
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleQuestionImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setQuestionImage(file);
      setQuestionImagePreview(URL.createObjectURL(file));
    }
  };

  const removeQuestionImage = () => {
    setQuestionImage(null);
    setQuestionImagePreview(null);
    setExistingQuestionImage(null);
  };

  const handleOptionTypeChange = (index, type) => {
    const newOptions = [...options];
    newOptions[index] = {
      ...newOptions[index],
      type,
      content: "",
      file: null,
      preview: null,
      existingUrl: null,
    };
    setOptions(newOptions);
  };

  const handleOptionContentChange = (index, content) => {
    const newOptions = [...options];
    newOptions[index].content = content;
    setOptions(newOptions);
  };

  const handleOptionImageChange = (index, e) => {
    const file = e.target.files[0];
    if (file) {
      const newOptions = [...options];
      newOptions[index].file = file;
      newOptions[index].preview = URL.createObjectURL(file);
      newOptions[index].existingUrl = null; // replacing existing
      setOptions(newOptions);
    }
  };

  const handlePassageImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setGroupData((prev) => ({
        ...prev,
        passageImage: file,
        passageImagePreview: URL.createObjectURL(file),
        existingPassageImage: null,
      }));
    }
  };

  // ==================== Submit ====================
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validation
    if (!formData.question || formData.question.trim() === "" || formData.question === "<p></p>") {
      toast.error("Please enter a question");
      return;
    }

    if (!formData.answer) {
      toast.error("Please select the correct answer");
      return;
    }

    const hasEmptyTextOptions = options.some(
      (opt) => opt.type === "text" && (!opt.content || opt.content.trim() === "")
    );
    if (hasEmptyTextOptions) {
      toast.error("Please fill all text options");
      return;
    }

    const hasEmptyImageOptions = options.some(
      (opt) => opt.type === "image" && !opt.file && !opt.existingUrl
    );
    if (hasEmptyImageOptions) {
      toast.error("Please upload all option images");
      return;
    }

    try {
      const formDataToSend = new FormData();

      formDataToSend.append("question", formData.question.trim());
      formDataToSend.append("examId", formData.examId);
      formDataToSend.append("examName", formData.examName);
      formDataToSend.append("year", parseInt(formData.year));
      formDataToSend.append("answer", formData.answer.toUpperCase());
      formDataToSend.append("difficulty", formData.difficulty);
      formDataToSend.append("points", parseInt(formData.points));
      formDataToSend.append("explanation", formData.explanation || "");
      formDataToSend.append("isGrouped", formData.isGrouped ? "true" : "false");
      formDataToSend.append("level", formData.level);
      formDataToSend.append("subject", formData.subject);
      formDataToSend.append("topic", formData.topic);

      // Question image
      if (questionImage) {
        // New image uploaded
        formDataToSend.append("questionImage", questionImage);
      } else if (existingQuestionImage) {
        // Keep existing
        formDataToSend.append("existingQuestionImage", existingQuestionImage);
      }
      // If neither, image was removed (don't send anything - controller will clear it)

      // Options
      const optionsData = options.map((opt) => ({
        type: opt.type,
        content: opt.type === "text" ? opt.content : opt.existingUrl || "",
        label: opt.label,
      }));
      formDataToSend.append("options", JSON.stringify(optionsData));

      // Option images (new files only)
      options.forEach((opt, index) => {
        if (opt.type === "image" && opt.file) {
          formDataToSend.append(`option_${index}`, opt.file);
        }
      });

      // Group data
      if (formData.isGrouped) {
        const groupDataToSend = {
          title: groupData.title || "",
          passage: groupData.passage || "",
          startNumber: parseInt(groupData.startNumber) || 1,
          endNumber: parseInt(groupData.endNumber) || 5,
          existingPassageImage: groupData.existingPassageImage || null,
        };
        formDataToSend.append("group", JSON.stringify(groupDataToSend));

        if (groupData.passageImage) {
          formDataToSend.append("passageImage", groupData.passageImage);
        }
      }

      await updateQuestion(id, formDataToSend);
      toast.success("✅ Question updated successfully!");
      navigate(-1);
    } catch (error) {
      const errorMsg =
        error.response?.data?.message || error.message || "Failed to update question";
      toast.error(errorMsg);
    }
  };

  // ==================== Render ====================
  if (pageLoading) {
    return (
      <div
        className="d-flex justify-content-center align-items-center"
        style={{ minHeight: "60vh" }}
      >
        <div className="text-center">
          <FaSpinner className="fa-spin mb-3" size={40} style={{ color: "#15253a" }} />
          <p className="text-muted">Loading question...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mt-4" style={{ maxWidth: "900px" }}>
      <div className="card shadow-lg border-0 rounded-4">
        {/* Header */}
        <div
          className="card-header text-white py-3 d-flex align-items-center gap-2"
          style={{ background: "#15253a" }}
        >
          <button
            type="button"
            className="btn btn-sm btn-outline-light me-2"
            onClick={() => navigate(-1)}
          >
            <FaArrowLeft />
          </button>
          <FaBook />
          <h4 className="mb-0">Edit Question</h4>
        </div>

        <div className="card-body p-4">
          <form onSubmit={handleSubmit}>
            {/* Exam Selection */}
            <div className="row mb-3">
              <div className="col-md-6">
                <label className="form-label fw-bold">
                  Select Exam <span className="text-danger">*</span>
                </label>
                <select
                  name="examId"
                  className="form-select"
                  value={formData.examId}
                  onChange={(e) => {
                    const exam = exams.find((ex) => ex._id === e.target.value);
                    setFormData((prev) => ({
                      ...prev,
                      examId: e.target.value,
                      examName: exam?.name || "",
                      year: "",
                    }));
                  }}
                  required
                >
                  <option value="">-- Select Exam --</option>
                  {exams.map((exam) => (
                    <option key={exam._id} value={exam._id}>
                      {exam.displayName}
                    </option>
                  ))}
                </select>
              </div>

              <div className="col-md-6">
                <label className="form-label fw-bold">Year</label>
                <select
                  name="year"
                  className="form-select"
                  value={formData.year}
                  onChange={handleChange}
                  disabled={!formData.examId}
                  required
                >
                  <option value="">-- Select Year --</option>
                  {availableYears.map((yearData) => (
                    <option key={yearData.year} value={yearData.year}>
                      {yearData.year}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Level, Subject, Topic - Plain text inputs (pre-filled from question) */}
            <div className="row mb-3">
              <div className="col-md-4">
                <label className="form-label fw-bold">
                  Level <span className="text-danger">*</span>
                </label>
                <input
                  type="text"
                  name="level"
                  className="form-control"
                  value={formData.level}
                  onChange={handleChange}
                  placeholder="e.g. SS1"
                  required
                />
              </div>
              <div className="col-md-4">
                <label className="form-label fw-bold">
                  Subject <span className="text-danger">*</span>
                </label>
                <input
                  type="text"
                  name="subject"
                  className="form-control"
                  value={formData.subject}
                  onChange={handleChange}
                  placeholder="e.g. Mathematics"
                  required
                />
              </div>
              <div className="col-md-4">
                <label className="form-label fw-bold">
                  Topic <span className="text-danger">*</span>
                </label>
                <input
                  type="text"
                  name="topic"
                  className="form-control"
                  value={formData.topic}
                  onChange={handleChange}
                  placeholder="e.g. Algebra"
                  required
                />
              </div>
            </div>

            {/* Comprehension Group Toggle */}
            <div className="mb-3 form-check">
              <input
                type="checkbox"
                className="form-check-input"
                id="isGrouped"
                name="isGrouped"
                checked={formData.isGrouped}
                onChange={handleChange}
              />
              <label className="form-check-label fw-bold" htmlFor="isGrouped">
                Comprehension / Grouped Question
              </label>
            </div>

            {/* Group / Comprehension Data */}
            {formData.isGrouped && (
              <div className="card mb-3 border-warning">
                <div className="card-body">
                  <h6 className="fw-bold text-warning mb-3">Comprehension Details</h6>

                  <div className="mb-3">
                    <label className="form-label fw-bold">Group Title</label>
                    <input
                      type="text"
                      className="form-control"
                      value={groupData.title}
                      onChange={(e) =>
                        setGroupData((prev) => ({ ...prev, title: e.target.value }))
                      }
                      placeholder="e.g. Read the passage and answer questions 1-5"
                    />
                  </div>

                  <div className="mb-3">
                    <label className="form-label fw-bold">Passage Text</label>
                    <textarea
                      className="form-control"
                      rows={5}
                      value={groupData.passage}
                      onChange={(e) =>
                        setGroupData((prev) => ({ ...prev, passage: e.target.value }))
                      }
                      placeholder="Enter comprehension passage..."
                    />
                  </div>

                  <div className="mb-3">
                    <label className="form-label fw-bold">Passage Image (optional)</label>
                    <input
                      type="file"
                      className="form-control"
                      accept="image/*"
                      onChange={handlePassageImageChange}
                    />
                    {groupData.passageImagePreview && (
                      <div className="mt-2 position-relative d-inline-block">
                        <img
                          src={groupData.passageImagePreview}
                          alt="Passage"
                          className="img-fluid rounded"
                          style={{ maxHeight: "200px" }}
                        />
                        {groupData.existingPassageImage && (
                          <span className="badge bg-info ms-2">Current image</span>
                        )}
                      </div>
                    )}
                  </div>

                  <div className="row">
                    <div className="col-md-6">
                      <label className="form-label fw-bold">Question Range Start</label>
                      <input
                        type="number"
                        className="form-control"
                        value={groupData.startNumber}
                        onChange={(e) =>
                          setGroupData((prev) => ({
                            ...prev,
                            startNumber: parseInt(e.target.value) || 1,
                          }))
                        }
                        min="1"
                      />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label fw-bold">Question Range End</label>
                      <input
                        type="number"
                        className="form-control"
                        value={groupData.endNumber}
                        onChange={(e) =>
                          setGroupData((prev) => ({
                            ...prev,
                            endNumber: parseInt(e.target.value) || 5,
                          }))
                        }
                        min="1"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Question Text */}
            <div className="mb-3">
              <label className="form-label fw-bold">
                Question <span className="text-danger">*</span>
              </label>
              <RichTextEditor
                value={formData.question}
                onChange={(content) =>
                  setFormData((prev) => ({ ...prev, question: content }))
                }
                placeholder="Enter your question..."
                height="150px"
              />
              <small className="text-muted">
                Use the toolbar to format your question (bold, italic, superscript, etc.)
              </small>
            </div>

            {/* Question Image */}
            <div className="mb-3">
              <label className="form-label fw-bold">
                <FaImage className="me-2" />
                Question Image (optional)
              </label>

              {/* Show existing image info */}
              {existingQuestionImage && !questionImage && (
                <div className="mb-2 p-2 bg-light rounded d-flex align-items-center gap-2">
                  <img
                    src={existingQuestionImage}
                    alt="Current"
                    className="rounded"
                    style={{ height: "60px", objectFit: "cover" }}
                  />
                  <div>
                    <span className="badge bg-secondary me-2">Current image</span>
                    <button
                      type="button"
                      className="btn btn-sm btn-outline-danger"
                      onClick={removeQuestionImage}
                    >
                      Remove
                    </button>
                  </div>
                </div>
              )}

              <input
                type="file"
                className="form-control"
                accept="image/*"
                onChange={handleQuestionImageChange}
              />
              <small className="text-muted">
                {existingQuestionImage
                  ? "Upload a new image to replace the current one"
                  : "Upload an image for this question (optional)"}
              </small>

              {questionImage && questionImagePreview && (
                <div className="mt-2">
                  <img
                    src={questionImagePreview}
                    alt="Question preview"
                    className="img-fluid rounded"
                    style={{ maxHeight: "200px" }}
                  />
                  <span className="badge bg-success ms-2">New image selected</span>
                </div>
              )}
            </div>

            {/* Options */}
            <div className="mb-4">
              <label className="form-label fw-bold">
                Options <span className="text-danger">*</span>
              </label>
              {options.map((option, index) => (
                <div key={index} className="card mb-2">
                  <div className="card-body">
                    <div className="d-flex justify-content-between align-items-center mb-2">
                      <span className="fw-bold">Option {option.label}</span>
                      <div className="btn-group btn-group-sm">
                        <button
                          type="button"
                          className={`btn ${
                            option.type === "text" ? "btn-primary" : "btn-outline-primary"
                          }`}
                          onClick={() => handleOptionTypeChange(index, "text")}
                        >
                          Text
                        </button>
                        <button
                          type="button"
                          className={`btn ${
                            option.type === "image" ? "btn-primary" : "btn-outline-primary"
                          }`}
                          onClick={() => handleOptionTypeChange(index, "image")}
                        >
                          Image
                        </button>
                      </div>
                    </div>

                    {option.type === "text" ? (
                      <input
                        type="text"
                        className="form-control"
                        placeholder={`Enter option ${option.label}`}
                        value={option.content}
                        onChange={(e) => handleOptionContentChange(index, e.target.value)}
                        required
                      />
                    ) : (
                      <>
                        {/* Show existing image */}
                        {option.existingUrl && !option.file && (
                          <div className="mb-2 p-2 bg-light rounded d-flex align-items-center gap-2">
                            <img
                              src={option.existingUrl}
                              alt={`Option ${option.label}`}
                              className="rounded"
                              style={{ height: "50px", objectFit: "cover" }}
                            />
                            <span className="badge bg-secondary">Current image</span>
                          </div>
                        )}

                        <input
                          type="file"
                          className="form-control"
                          accept="image/*"
                          onChange={(e) => handleOptionImageChange(index, e)}
                        />
                        <small className="text-muted">
                          {option.existingUrl
                            ? "Upload new image to replace"
                            : "Upload option image"}
                        </small>

                        {option.preview && option.file && (
                          <img
                            src={option.preview}
                            alt={`Option ${option.label} preview`}
                            className="img-fluid mt-2 rounded"
                            style={{ maxHeight: "150px" }}
                          />
                        )}
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Answer, Difficulty, Points */}
            <div className="row mb-3">
              <div className="col-md-4">
                <label className="form-label fw-bold">
                  Correct Answer <span className="text-danger">*</span>
                </label>
                <select
                  name="answer"
                  className="form-select"
                  value={formData.answer}
                  onChange={handleChange}
                  required
                >
                  <option value="">-- Select Answer --</option>
                  <option value="A">A</option>
                  <option value="B">B</option>
                  <option value="C">C</option>
                  <option value="D">D</option>
                </select>
              </div>

              <div className="col-md-4">
                <label className="form-label fw-bold">Difficulty</label>
                <select
                  name="difficulty"
                  className="form-select"
                  value={formData.difficulty}
                  onChange={handleChange}
                >
                  <option value="easy">Easy</option>
                  <option value="medium">Medium</option>
                  <option value="hard">Hard</option>
                </select>
              </div>

              <div className="col-md-4">
                <label className="form-label fw-bold">Points</label>
                <input
                  type="number"
                  name="points"
                  className="form-control"
                  value={formData.points}
                  onChange={handleChange}
                  min="1"
                  max="10"
                />
              </div>
            </div>

            {/* Explanation */}
            <div className="mb-4">
              <label className="form-label fw-bold">Explanation (optional)</label>
              <RichTextEditor
                value={formData.explanation}
                onChange={(content) =>
                  setFormData((prev) => ({ ...prev, explanation: content }))
                }
                placeholder="Enter explanation (optional)..."
                height="100px"
              />
            </div>

            {/* Buttons */}
            <div className="d-grid gap-2 d-md-flex justify-content-md-end">
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => navigate(-1)}
              >
                <FaArrowLeft className="me-2" />
                Cancel
              </button>
              <button
                type="submit"
                className="btn text-white"
                style={{ background: "#15253a" }}
                disabled={loading}
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
    </div>
  );
};

export default EditQuestion;
