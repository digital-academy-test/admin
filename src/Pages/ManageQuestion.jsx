// src/pages/ManageQuestions.jsx
import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { useCbtStore } from "../Store/cbtStore";

const ManageQuestions = () => {
  const { state } = useLocation();
  const { exam, year, subject } = state || {};

  const { getQuestion, updateQuestion, deleteQuestion } = useCbtStore();
  const [questions, setQuestions] = useState([]);
  const [editingQuestion, setEditingQuestion] = useState(null);
  const [formData, setFormData] = useState({
    question: "",
    options: ["", "", "", ""],
    ans: "",
    difficulty: "medium",
    topic: "",
    image: null, // image file or URL
  });
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      if (!exam || !year || !subject) return;
      setLoading(true);
      try {
        const res = await getQuestion(exam, year, subject);
        if (res && Array.isArray(res.questions)) {
          setQuestions(res.questions);
        }
      } catch (err) {
        console.error("Error fetching questions:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [exam, year, subject, getQuestion]);

  const handleEdit = (question) => {
    setEditingQuestion(question._id);
    setFormData({
      question: question.question,
      options: question.options,
      ans: question.ans.trim(),
      difficulty: question.difficulty,
      topic: question.topic,
      image: question.image || null,
    });
    setPreview(question.image || null);
  };

  const handleSave = async () => {
    try {
      const form = new FormData();
      Object.entries(formData).forEach(([key, value]) => {
        if (key === "options") {
          form.append(key, JSON.stringify(value));
        } else {
          form.append(key, value);
        }
      });

      await updateQuestion(editingQuestion, form, true); // make sure backend supports FormData
      setQuestions((prev) =>
        prev.map((q) =>
          q._id === editingQuestion ? { ...q, ...formData } : q
        )
      );
      setEditingQuestion(null);
      alert("✅ Question updated successfully!");
    } catch (err) {
      console.error("Error updating question:", err);
      alert("❌ Failed to update question.");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this question?")) return;
    try {
      await deleteQuestion(id);
      setQuestions((prev) => prev.filter((q) => q._id !== id));
      alert("🗑️ Question deleted successfully!");
    } catch (err) {
      console.error("Error deleting question:", err);
      alert("❌ Failed to delete question.");
    }
  };
console.log("Rendering questions:", questions)
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleOptionChange = (index, value) => {
    const newOptions = [...formData.options];
    newOptions[index] = value;
    setFormData((prev) => ({ ...prev, options: newOptions }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData((prev) => ({ ...prev, image: file }));
      setPreview(URL.createObjectURL(file));
    }
  };

  if (loading)
    return <p className="text-center py-4">Loading questions...</p>;

  return (
    <div className="container mt-4">
      <div className="card shadow-sm p-4 rounded-4">
        <h4 className="mb-3">
          Manage Questions – {exam?.toUpperCase()} {year} ({subject})
        </h4>

        {questions.length === 0 ? (
          <p className="text-center text-muted">No questions found.</p>
        ) : (
          <div className="list-group">
            {
            questions.map((q, idx) => (
              <div
                key={q._id}
                className="list-group-item mb-3 p-3 border rounded-3 shadow-sm"
              >
                {editingQuestion === q._id ? (
                  <div
                    className="  position-fixed top-0 start-0 w-100 h-100 d-flex justify-content-center align-items-center"
                    style={{ background: "#00000070", zIndex: 2000,overflowY:"auto" }}
                  >
                    <div className="card p-4 shadow-lg" style={{ maxWidth: "600px", width: "90%" }}>
                      <h5 className="mb-3 text-center">Edit Question</h5>

                      <label className="form-label">Question</label>
                      <textarea
                        name="question"
                        value={formData.question}
                        onChange={handleChange}
                        className="mb-3 form-control"
                      />

                      {preview && (
                        <div className="text-center mb-3">
                          <img
                            src={preview}
                            alt="Question preview"
                            className="img-fluid rounded"
                            style={{ maxHeight: "200px" }}
                          />
                        </div>
                      )}

                      <label className="form-label">Change Image</label>
                      <input
                        type="file"
                        accept="image/*"
                        className="form-control mb-3"
                        onChange={handleImageChange}
                      />

                      <label className="form-label">Options</label>
                      {formData.options.map((opt, i) => (
                        <input
                          key={i}
                          value={opt}
                          onChange={(e) => handleOptionChange(i, e.target.value)}
                          placeholder={`Option ${i + 1}`}
                          className="mb-2 form-control"
                        />
                      ))}

                      <label className="form-label">Correct Answer</label>
                      <input
                        name="ans"
                        value={formData.ans}
                        onChange={handleChange}
                        placeholder="Correct Answer"
                        className="mb-2 form-control"
                      />

                      <label className="form-label">Topic</label>
                      <input
                        name="topic"
                        value={formData.topic}
                        onChange={handleChange}
                        placeholder="Topic"
                        className="mb-2 form-control"
                      />

                      <label className="form-label">Difficulty</label>
                      <select
                        name="difficulty"
                        value={formData.difficulty}
                        onChange={handleChange}
                        className="mb-3 form-select"
                      >
                        <option value="easy">Easy</option>
                        <option value="medium">Medium</option>
                        <option value="hard">Hard</option>
                      </select>

                      <div className="d-flex justify-content-center gap-3">
                        <button onClick={handleSave} className="btn btn-success px-4">
                          Save
                        </button>
                        <button
                          onClick={() => setEditingQuestion(null)}
                          className="btn btn-secondary px-4"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <>
                    <p>
                      <strong>Q{idx + 1}:</strong> {q.question}
                    </p>
                    {q.image && (
                      <div className="text-center mb-2">
                        <img
                          src={q.image}
                          alt="question"
                          className="img-fluid rounded"
                          style={{ maxHeight: "200px" }}
                        />
                      </div>
                    )}
                    <ul className="list-unstyled">
                      {q.options.map((opt, i) => (
                        <li
                          key={i}
                          className={`p-1 ${
                            opt.trim() === q.ans.trim()
                              ? "text-success fw-bold"
                              : ""
                          }`}
                        >
                          {String.fromCharCode(65 + i)}. {opt}
                        </li>
                      ))}
                    </ul>
                    <p className="text-muted small">
                      <strong>Topic:</strong> {q.topic} |{" "}
                      <strong>Difficulty:</strong> {q.difficulty}
                    </p>
                    <div className="d-flex gap-2">
                      <button
                        onClick={() => handleEdit(q)}
                        className="btn btn-outline-primary btn-sm"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(q._id)}
                        className="btn btn-outline-danger btn-sm"
                      >
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
  );
};

export default ManageQuestions;
