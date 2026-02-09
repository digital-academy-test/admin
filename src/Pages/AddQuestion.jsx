// src/pages/admin/AddQuestion.jsx - FIXED VERSION
import React, { useState, useEffect } from "react";
import toast from "react-hot-toast";
import { FaImage, FaPlus, FaTrash, FaBook } from "react-icons/fa";
import { useCbtStore } from "../Store/cbtStore";
import RichTextEditor from '../Component/RichTextEditor';

const AddQuestion = () => {
  const { 
    exams, 
    getExamsForAdmin, 
    examStructure, 
    getExamStructure, 
    addQuestion, 
    loading 
  } = useCbtStore();


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

  const [questionImage, setQuestionImage] = useState(null);
  const [questionImagePreview, setQuestionImagePreview] = useState(null);
  
  // Options can be text or images
  const [options, setOptions] = useState([
    { type: 'text', content: '', label: 'A', file: null, preview: null },
    { type: 'text', content: '', label: 'B', file: null, preview: null },
    { type: 'text', content: '', label: 'C', file: null, preview: null },
    { type: 'text', content: '', label: 'D', file: null, preview: null }
  ]);

  // Comprehension group data
  const [groupData, setGroupData] = useState({
    title: "",
    passage: "",
    passageImage: null,
    passageImagePreview: null,
    startNumber: 1,
    endNumber: 5,
  });

  const [selectedExam, setSelectedExam] = useState(null);
  const [availableYears, setAvailableYears] = useState([]);
  const [availableSubjects, setAvailableSubjects] = useState([]);
  const [availableLevels, setAvailableLevels] = useState([]);
  const [availableTopics, setAvailableTopics] = useState([]);

  useEffect(() => {
    getExamsForAdmin();
    getExamStructure();
  }, []);

  // Update years when exam changes
  useEffect(() => {
    if (formData.examId) {
      const exam = exams.find(e => e._id === formData.examId);
      setSelectedExam(exam);
      setAvailableYears(exam?.years || []);
    }
  }, [formData.examId, exams]);

  // Update subjects when year changes
  useEffect(() => {
    if (formData.year && selectedExam) {
      const yearData = selectedExam.years.find(y => y.year === parseInt(formData.year));
      setAvailableSubjects(yearData?.subjects || []);
    }
  }, [formData.year, selectedExam]);

  // Update levels from exam structure
  useEffect(() => {
    setAvailableLevels(examStructure || []);
  }, [examStructure]);

  // Update topics when level/subject changes
  useEffect(() => {
    if (formData.level && formData.subject) {
      const level = examStructure.find(l => l._id === formData.level);
      const subject = level?.subjects.find(s => s._id === formData.subject);
      setAvailableTopics(subject?.topics || []);
    }
  }, [formData.level, formData.subject, examStructure]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleQuestionImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setQuestionImage(file);
      setQuestionImagePreview(URL.createObjectURL(file));
    }
  };

  const handleOptionTypeChange = (index, type) => {
    const newOptions = [...options];
    newOptions[index] = {
      ...newOptions[index],
      type,
      content: '',
      file: null,
      preview: null
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
      setOptions(newOptions);
    }
  };

  const handlePassageImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setGroupData(prev => ({
        ...prev,
        passageImage: file,
        passageImagePreview: URL.createObjectURL(file)
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validation
    if (!formData.question || formData.question.trim() === '' || formData.question === '<p></p>') {
      toast.error("Please enter a question");
      return;
    }

    if (!formData.examId) {
      toast.error("Please select an exam");
      return;
    }

    if (!formData.year) {
      toast.error("Please enter a year");
      return;
    }

    if (!formData.level || !formData.subject || !formData.topic) {
      toast.error("Please select level, subject, and topic");
      return;
    }

    // Check if all text options are filled
    const hasEmptyTextOptions = options.some(opt => 
      opt.type === 'text' && (!opt.content || opt.content.trim() === '')
    );
    
    if (hasEmptyTextOptions) {
      toast.error("Please fill all text options");
      return;
    }

    // Check if all image options have files
    const hasEmptyImageOptions = options.some(opt => 
      opt.type === 'image' && !opt.file
    );
    
    if (hasEmptyImageOptions) {
      toast.error("Please upload all option images");
      return;
    }

    if (!formData.answer) {
      toast.error("Please select the correct answer");
      return;
    }

    try {
      const formDataToSend = new FormData();
      
      // Basic question data - MAKE SURE QUESTION IS NOT EMPTY
      const questionText = formData.question.trim();
      if (!questionText || questionText === '<p></p>') {
        toast.error("Question cannot be empty");
        return;
      }
      
      formDataToSend.append('question', questionText);
      formDataToSend.append('examId', formData.examId);
      formDataToSend.append('examName', formData.examName);
      formDataToSend.append('year', parseInt(formData.year));
      formDataToSend.append('answer', formData.answer.toUpperCase());
      formDataToSend.append('difficulty', formData.difficulty);
      formDataToSend.append('points', parseInt(formData.points));
      formDataToSend.append('explanation', formData.explanation || '');
      formDataToSend.append('isGrouped', formData.isGrouped ? 'true' : 'false');
      
      // Get names instead of IDs
      const level = examStructure.find(l => l._id === formData.level);
      const subject = level?.subjects.find(s => s._id === formData.subject);
      const topic = subject?.topics.find(t => t._id === formData.topic);
      
      if (!level || !subject || !topic) {
        toast.error("Invalid level, subject, or topic selection");
        return;
      }
      
      formDataToSend.append('level', level.level);
      formDataToSend.append('subject', subject.name);
      formDataToSend.append('topic', topic.name);

      // Question image
      if (questionImage) {
        formDataToSend.append('questionImage', questionImage);
      }

      // Options - prepare data
      const optionsData = options.map(opt => ({
        type: opt.type,
        content: opt.type === 'text' ? opt.content : '',
        label: opt.label
      }));
      formDataToSend.append('options', JSON.stringify(optionsData));

      // Option images
      options.forEach((opt, index) => {
        if (opt.type === 'image' && opt.file) {
          formDataToSend.append(`option_${index}`, opt.file);
        }
      });

      // Group data (comprehension)
      if (formData.isGrouped) {
        const groupDataToSend = {
          title: groupData.title || '',
          passage: groupData.passage || '',
          startNumber: parseInt(groupData.startNumber) || 1,
          endNumber: parseInt(groupData.endNumber) || 5
        };
        formDataToSend.append('group', JSON.stringify(groupDataToSend));

        if (groupData.passageImage) {
          formDataToSend.append('passageImage', groupData.passageImage);
        }
      }

      // Debug: Log what we're sending
      console.log('Sending FormData:');
      for (let [key, value] of formDataToSend.entries()) {
        if (value instanceof File) {
          console.log(key, ':', 'File -', value.name);
        } else {
          console.log(key, ':', value);
        }
      }

      await addQuestion(formDataToSend);
      toast.success("✅ Question added successfully!");
      
      // Reset form
      resetForm();
    } catch (error) {
      console.error('Submit error:', error);
      const errorMsg = error.response?.data?.message || error.message || "Failed to add question";
      toast.error(errorMsg);
    }
  };

  const resetForm = () => {
    setFormData({
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
    setQuestionImage(null);
    setQuestionImagePreview(null);
    setOptions([
      { type: 'text', content: '', label: 'A', file: null, preview: null },
      { type: 'text', content: '', label: 'B', file: null, preview: null },
      { type: 'text', content: '', label: 'C', file: null, preview: null },
      { type: 'text', content: '', label: 'D', file: null, preview: null }
    ]);
    setGroupData({
      title: "",
      passage: "",
      passageImage: null,
      passageImagePreview: null,
      startNumber: 1,
      endNumber: 5,
    });
  };

  return (
    <div className="container mt-4" style={{ maxWidth: "900px" }}>
      <div className="card shadow-lg border-0 rounded-4">
        <div className="card-header text-white py-3" style={{ background: "#15253a" }}>
          <h4 className="mb-0 d-flex align-items-center gap-2">
            <FaBook />
            Add New Question
          </h4>
        </div>

        <div className="card-body p-4">
          <form onSubmit={handleSubmit}>
            {/* Exam Selection */}
            <div className="row mb-3">
              <div className="col-md-6">
                <label className="form-label fw-bold">Select Exam <span className="text-danger">*</span></label>
                <select
                  name="examId"
                  className="form-select"
                  value={formData.examId}
                  onChange={(e) => {
                    const exam = exams.find(ex => ex._id === e.target.value);
                    setFormData(prev => ({
                      ...prev,
                      examId: e.target.value,
                      examName: exam?.name || ''
                    }));
                  }}
                  required
                >
                  <option value="">-- Select Exam --</option>
                  {exams.map(exam => (
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
                  {availableYears.map(yearData => (
                    <option key={yearData.year} value={yearData.year}>
                      {yearData.year}
                    </option>
                  ))}
                </select>
              </div>


            </div>

            {/* Level, Subject, Topic */}
            <div className="row mb-3">
              <div className="col-md-4">
                <label className="form-label fw-bold">Level <span className="text-danger">*</span></label>
                <select
                  name="level"
                  className="form-select"
                  value={formData.level}
                  onChange={handleChange}
                  required
                >
                  <option value="">-- Select Level --</option>
                  {availableLevels.map(level => (
                    <option key={level._id} value={level._id}>
                      {level.level}
                    </option>
                  ))}
                </select>
              </div>

              <div className="col-md-4">
                <label className="form-label fw-bold">Subject <span className="text-danger">*</span></label>
                <select
                  name="subject"
                  className="form-select"
                  value={formData.subject}
                  onChange={handleChange}
                  disabled={!formData.level}
                  required
                >
                  <option value="">-- Select Subject --</option>
                  {availableLevels
                    .find(l => l._id === formData.level)
                    ?.subjects.map(subj => (
                      <option key={subj._id} value={subj._id}>
                        {subj.name}
                      </option>
                    ))}
                </select>
              </div>

              <div className="col-md-4">
                <label className="form-label fw-bold">Topic <span className="text-danger">*</span></label>
                <select
                  name="topic"
                  className="form-select"
                  value={formData.topic}
                  onChange={handleChange}
                  disabled={!formData.subject}
                  required
                >
                  <option value="">-- Select Topic --</option>
                  {availableTopics.map(topic => (
                    <option key={topic._id} value={topic._id}>
                      {topic.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Comprehension Toggle */}
            <div className="mb-3">
              <div className="form-check">
                <input
                  type="checkbox"
                  className="form-check-input"
                  name="isGrouped"
                  id="isGrouped"
                  checked={formData.isGrouped}
                  onChange={handleChange}
                />
                <label className="form-check-label fw-bold" htmlFor="isGrouped">
                  This is part of a comprehension passage
                </label>
              </div>
            </div>

            {/* Comprehension Passage (if grouped) */}
            {formData.isGrouped && (
              <div className="card mb-4 border-info">
                <div className="card-header bg-info bg-opacity-10">
                  <h6 className="mb-0 fw-bold">Comprehension Passage</h6>
                </div>
                <div className="card-body">
                  <div className="mb-3">
                    <label className="form-label fw-bold">Passage Title</label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="e.g., Read the passage below and answer questions 1-5"
                      value={groupData.title}
                      onChange={(e) => setGroupData(prev => ({ ...prev, title: e.target.value }))}
                    />
                  </div>

                  <div className="mb-3">
                    <label className="form-label fw-bold">Passage Text</label>
                    <RichTextEditor
                      value={groupData.passage}
                      onChange={(content) => setGroupData(prev => ({ ...prev, passage: content }))}
                      placeholder="Enter passage text..."
                      height="200px"
                    />
                  </div>

                  <div className="mb-3">
                    <label className="form-label fw-bold">
                      <FaImage className="me-2" />
                      Passage Image (optional)
                    </label>
                    <input
                      type="file"
                      className="form-control"
                      accept="image/*"
                      onChange={handlePassageImageChange}
                    />
                    {groupData.passageImagePreview && (
                      <img
                        src={groupData.passageImagePreview}
                        alt="Passage"
                        className="img-fluid mt-2 rounded"
                        style={{ maxHeight: '200px' }}
                      />
                    )}
                  </div>

                  <div className="row">
                    <div className="col-md-6">
                      <label className="form-label fw-bold">Question Range Start</label>
                      <input
                        type="number"
                        className="form-control"
                        value={groupData.startNumber}
                        onChange={(e) => setGroupData(prev => ({ ...prev, startNumber: parseInt(e.target.value) || 1 }))}
                        min="1"
                      />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label fw-bold">Question Range End</label>
                      <input
                        type="number"
                        className="form-control"
                        value={groupData.endNumber}
                        onChange={(e) => setGroupData(prev => ({ ...prev, endNumber: parseInt(e.target.value) || 5 }))}
                        min="1"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Question Text */}
            <div className="mb-3">
              <label className="form-label fw-bold">Question <span className="text-danger">*</span></label>
              <RichTextEditor
                value={formData.question}
                onChange={(content) => {
                  console.log('Question content changed:', content); // Debug
                  setFormData(prev => ({ ...prev, question: content }));
                }}
                placeholder="Enter your question..."
                height="150px"
              />
              <small className="text-muted">Use the toolbar to format your question (bold, italic, superscript, etc.)</small>
            </div>

            {/* Question Image */}
            <div className="mb-3">
              <label className="form-label fw-bold">
                <FaImage className="me-2" />
                Question Image (optional)
              </label>
              <input
                type="file"
                className="form-control"
                accept="image/*"
                onChange={handleQuestionImageChange}
              />
              {questionImagePreview && (
                <img
                  src={questionImagePreview}
                  alt="Question"
                  className="img-fluid mt-2 rounded"
                  style={{ maxHeight: '200px' }}
                />
              )}
            </div>

            {/* Options */}
            <div className="mb-4">
              <label className="form-label fw-bold">Options <span className="text-danger">*</span></label>
              {options.map((option, index) => (
                <div key={index} className="card mb-2">
                  <div className="card-body">
                    <div className="d-flex justify-content-between align-items-center mb-2">
                      <span className="fw-bold">Option {option.label}</span>
                      <div className="btn-group btn-group-sm">
                        <button
                          type="button"
                          className={`btn ${option.type === 'text' ? 'btn-primary' : 'btn-outline-primary'}`}
                          onClick={() => handleOptionTypeChange(index, 'text')}
                        >
                          Text
                        </button>
                        <button
                          type="button"
                          className={`btn ${option.type === 'image' ? 'btn-primary' : 'btn-outline-primary'}`}
                          onClick={() => handleOptionTypeChange(index, 'image')}
                        >
                          Image
                        </button>
                      </div>
                    </div>

                    {option.type === 'text' ? (
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
                        <input
                          type="file"
                          className="form-control"
                          accept="image/*"
                          onChange={(e) => handleOptionImageChange(index, e)}
                        />
                        {option.preview && (
                          <img
                            src={option.preview}
                            alt={`Option ${option.label}`}
                            className="img-fluid mt-2 rounded"
                            style={{ maxHeight: '150px' }}
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
                <label className="form-label fw-bold">Correct Answer <span className="text-danger">*</span></label>
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
                onChange={(content) => setFormData(prev => ({ ...prev, explanation: content }))}
                placeholder="Enter explanation (optional)..."
                height="100px"
              />
            </div>

            {/* Buttons */}
            <div className="d-grid gap-2 d-md-flex justify-content-md-end">
              <button
                type="button"
                className="btn btn-secondary"
                onClick={resetForm}
              >
                Clear Form
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
                    Adding...
                  </>
                ) : (
                  <>
                    <FaPlus className="me-2" />
                    Add Question
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

export default AddQuestion;