import React, { useState, useEffect } from "react";
import { useCbtStore } from "../Store/cbtStore";

function AddQuestion() {
  const { examData, getSubject, addQuestion, loading, error } = useCbtStore();

  const [form, setForm] = useState({
    question: "",
    image: null,
    options: ["", "", "", ""],
    ans: "",
    year: "",
    exam: "", // ✅ Added exam
    level: "",
    subject: "",
    topic: "",
    difficulty: "medium",
  });

  const [availableSubjects, setAvailableSubjects] = useState([]);
  const [availableTopics, setAvailableTopics] = useState([]);
  const [message, setMessage] = useState("");

  // Fetch data
  useEffect(() => {
    getSubject();
  }, [getSubject]);

  // Handle cascading dropdowns
  useEffect(() => {
    if (form.level) {
      const lvl = examData.find((l) => l._id === form.level);
      setAvailableSubjects(lvl ? lvl.subjects : []);
      setForm((f) => ({ ...f, subject: "", topic: "" }));
      setAvailableTopics([]);
    }
  }, [form.level, examData]);

  useEffect(() => {
    if (form.subject) {
      const subj = availableSubjects.find((s) => s._id === form.subject);
      setAvailableTopics(subj ? subj.topics : []);
      setForm((f) => ({ ...f, topic: "" }));
    } else {
      setAvailableTopics([]);
    }
  }, [form.subject, availableSubjects]);

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (name === "image") {
      
      setForm((f) => ({ ...f, image: files[0] }));
    } else {
      setForm((f) => ({ ...f, [name]: value }));
    }
    console.log(form);
  };

  const handleOptionChange = (index, value) => {
    const newOptions = [...form.options];
    newOptions[index] = value;
    setForm((f) => ({ ...f, options: newOptions }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const formData = new FormData();
      Object.entries(form).forEach(([key, value]) => {
        if (key === "options") {
          value.forEach((opt, idx) => formData.append(`options[${idx}]`, opt));
        } else if (value) {
          formData.append(key, value);
        }
      });

      const res = await addQuestion(formData);
      setMessage(res.message);
      setForm({
        question: "",
        image: null,
        options: ["", "", "", ""],
        ans: "",
        year: "",
        exam: "", // reset exam
        level: "",
        subject: "",
        topic: "",
        difficulty: "medium",
      });
    } catch (err) {
      setMessage(error || "Failed to add question.");
    }
  };

  return (
    <div className="container mt-5">
      <div className="row justify-content-center">
        <div style={{ maxWidth: "650px" }}>
          <div className="card shadow-sm border-0">
            <div className="card-body">
              <h4 className="mb-4" style={{ color: "#15253a" }}>
                Add New Question
              </h4>

              {message && <div className="alert alert-info">{message}</div>}

              <form onSubmit={handleSubmit}>
                {/* Question */}
                <div className="mb-3">
                  <label className="form-label">Question</label>
                  <textarea
                    name="question"
                    className="form-control"
                    value={form.question}
                    onChange={handleChange}
                    rows={3}
                    required
                  />
                </div>

                {/* Image */}
                <div className="mb-3">
                  <label className="form-label">Image (optional)</label>
                  <input
                    type="file"
                    name="image"
                    className="form-control"
                    onChange={handleChange}
                  />
                </div>

                {/* Options */}
                <div className="mb-3">
                  <label className="form-label">Options (4 required)</label>
                  {form.options.map((opt, idx) => (
                    <input
                      key={idx}
                      type="text"
                      className="form-control mb-2"
                      placeholder={`Option ${idx + 1}`}
                      value={opt}
                      onChange={(e) => handleOptionChange(idx, e.target.value)}
                      required
                    />
                  ))}
                </div>

                {/* Answer */}
                <div className="mb-3">
                  <label className="form-label">Answer</label>
                  <select
                    name="ans"
                    className="form-select"
                    value={form.ans}
                    onChange={handleChange}
                    required
                  >
                    <option value="">-- Pick correct answer --</option>
                    {form.options.map(
                      (opt, idx) =>
                        opt && (
                          <option key={idx} value={opt}>
                            {opt}
                          </option>
                        )
                    )}
                  </select>
                </div>

                {/* Year */}
                <div className="mb-3">
                  <label className="form-label">Year</label>
                  <input
                    type="number"
                    name="year"
                    className="form-control"
                    value={form.year}
                    onChange={handleChange}
                    required
                  />
                </div>

                {/* Exam - ✅ New Field */}
                <div className="mb-3">
                  <label className="form-label">Exam</label>
                  <select
                    name="exam"
                    className="form-select"
                    value={form.exam}
                    onChange={handleChange}
                    required
                  >
                      <option value="">-- Select Exam --</option>
                    <option value="waec">WAEC</option>
                      <option value="neco">NECO</option>
                      <option value="jamb">JAMB </option>
                      <option value="postutme">Post-UTME</option>
                      <option value="junior waec">Junior WAEC</option>
                      <option value="junior neco">Junior NECO</option>
                      <option value="common entrance">Common Entrance</option>

                  </select>
                </div>

                {/* Level */}
                <div className="mb-3">
                  <label className="form-label">Level</label>
                  <select
                    name="level"
                    className="form-select"
                    value={form.level}
                    onChange={handleChange}
                    required
                  >
                    <option value="">-- Select Level --</option>
                    {examData.map((lvl) => (
                      <option key={lvl._id} value={lvl._id}>
                        {lvl.level}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Subject */}
                <div className="mb-3">
                  <label className="form-label">Subject</label>
                  <select
                    name="subject"
                    className="form-select"
                    value={form.subject}
                    onChange={handleChange}
                    disabled={!form.level}
                    required
                  >
                    <option value="">-- Select Subject --</option>
                    {availableSubjects.map((subj) => (
                      <option key={subj._id} value={subj._id}>
                        {subj.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Topic */}
                <div className="mb-3">
                  <label className="form-label">Topic</label>
                  <select
                    name="topic"
                    className="form-select"
                    value={form.topic}
                    onChange={handleChange}
                    disabled={!form.subject}
                    required
                  >
                    <option value="">-- Select Topic --</option>
                    {availableTopics.map((t) => (
                      <option key={t._id} value={t._id}>
                        {t.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Difficulty */}
                <div className="mb-3">
                  <label className="form-label">Difficulty</label>
                  <select
                    name="difficulty"
                    className="form-select"
                    value={form.difficulty}
                    onChange={handleChange}
                  >
                    <option value="easy">Easy</option>
                    <option value="medium">Medium</option>
                    <option value="hard">Hard</option>
                  </select>
                </div>

                <div className="d-grid">
                  <button
                    type="submit"
                    className="btn text-white"
                    style={{ backgroundColor: "#15253a" }}
                    disabled={loading}
                  >
                    {loading ? "Saving..." : "Add Question"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AddQuestion;