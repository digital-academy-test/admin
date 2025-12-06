import React, { useState } from "react";
import axios from "axios";
import { useCoursestore } from "../Store/courseStore";

function AddSectionForm({ courseId }) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [contentType, setContentType] = useState("video");
  const [file, setFile] = useState(null);
  const [quiz, setQuiz] = useState([
    { question: "", options: ["", ""], correct_answer: "" },
  ]);
  console.log("Course ID in AddSectionForm:", courseId);
 

  const { addcoursesection, message, loading, error } = useCoursestore();


  // --- Quiz handlers ---
  const handleQuizChange = (qIndex, field, value) => {
    const updated = [...quiz];
    updated[qIndex][field] = value;
    setQuiz(updated);
  };

  const handleOptionChange = (qIndex, oIndex, value) => {
    const updated = [...quiz];
    updated[qIndex].options[oIndex] = value;
    setQuiz(updated);
  };

  const addOption = (qIndex) => {
    const updated = [...quiz];
    updated[qIndex].options.push("");
    setQuiz(updated);
  };

  const addQuestion = () => {
    setQuiz([...quiz, { question: "", options: ["", ""], correct_answer: "" }]);
  };

  const removeQuestion = (qIndex) => {
    setQuiz(quiz.filter((_, i) => i !== qIndex));
  };

  // --- Submit handler ---
  const handleSubmit = async (e) => {
    e.preventDefault();
 

    try {
      let response;

      if (contentType === "quiz") {
       /* response = await axios.post("/section/add", {
          courseId,
          title,
          description,
          contentType,
          quiz,
        });*/
        response = await addcoursesection({ courseId, title, description, contentType, quiz });
      } else {
        const formData = new FormData();
        formData.append("courseId", courseId);
        formData.append("title", title);
        formData.append("description", description);
        formData.append("file", file);
        formData.append("contentType", contentType);

        response = await addcoursesection( formData );
      }

     
      setTitle("");
      setDescription("");
      setFile(null);
      setQuiz([{ question: "", options: ["", ""], correct_answer: "" }]);
    } catch (error) {
      console.error(error);
      
    } finally {
      
    }
  };

  return (
    
      <div className="card shadow-sm border-0 rounded-4" style={{ maxWidth: "600px", margin: "0 auto" }}>
        <div className="card-body p-4">
          <h3 className="text-center mb-4  fw-bold">
            Add New Course Section
          </h3>
          {error && <strong className="text-danger">{error}</strong>}
        {message && <strong className="text-success">{message}</strong>}

          <form onSubmit={handleSubmit}>
            {/* Title */}
            <div className="mb-3">
              <label className="form-label fw-semibold">Section Title</label>
              <input
                type="text"
                className="form-control"
                placeholder="e.g. Introduction to Python"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
            </div>

            {/* Description */}
            <div className="mb-3">
              <label className="form-label fw-semibold">Description</label>
              <textarea
                className="form-control"
                rows="3"
                placeholder="Briefly describe this section..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              ></textarea>
            </div>

            {/* Content Type */}
            <div className="mb-3">
              <label className="form-label fw-semibold">Content Type</label>
              <select
                className="form-select"
                value={contentType}
                onChange={(e) => setContentType(e.target.value)}
              >
                <option value="video">Video</option>
                <option value="pdf">PDF</option>
                <option value="quiz">Quiz</option>
              </select>
            </div>

            {/* File Upload (Video or PDF) */}
            {(contentType === "video" || contentType === "pdf") && (
              <div className="mb-3">
                <label className="form-label fw-semibold">
                  Upload {contentType.toUpperCase()}
                </label>
                <input
                  type="file"
                  accept={contentType === "video" ? "video/*" : "application/pdf"}
                  className="form-control"
                  onChange={(e) => setFile(e.target.files[0])}
                  required
                />
              </div>
            )}

            {/* Quiz Section */}
            {contentType === "quiz" && (
              <div className="mb-4">
                <h5 className="fw-bold text-secondary mb-3">Quiz Questions</h5>

                {quiz.map((q, qIndex) => (
                  <div key={qIndex} className="border rounded-3 p-3 mb-3 bg-light">
                    <div className="d-flex justify-content-between align-items-center mb-2">
                      <strong>Question {qIndex + 1}</strong>
                      {quiz.length > 1 && (
                        <button
                          type="button"
                          className="btn btn-sm btn-outline-danger"
                          onClick={() => removeQuestion(qIndex)}
                        >
                          Remove
                        </button>
                      )}
                    </div>

                    <input
                      type="text"
                      className="form-control mb-3"
                      placeholder="Enter question"
                      value={q.question}
                      onChange={(e) =>
                        handleQuizChange(qIndex, "question", e.target.value)
                      }
                      required
                    />

                    <label className="fw-semibold">Options</label>
                    {q.options.map((opt, oIndex) => (
                      <input
                        key={oIndex}
                        type="text"
                        className="form-control mb-2"
                        placeholder={`Option ${oIndex + 1}`}
                        value={opt}
                        onChange={(e) =>
                          handleOptionChange(qIndex, oIndex, e.target.value)
                        }
                        required
                      />
                    ))}

                    <button
                      type="button"
                      className="btn btn-sm btn-outline-primary mb-3"
                      onClick={() => addOption(qIndex)}
                    >
                      + Add Option
                    </button>

                    <label className="fw-semibold">Correct Answer</label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="Enter correct answer"
                      value={q.correct_answer}
                      onChange={(e) =>
                        handleQuizChange(qIndex, "correct_answer", e.target.value)
                      }
                      required
                    />
                  </div>
                ))}

                <button
                  type="button"
                  className="btn btn-outline-secondary"
                  onClick={addQuestion}
                >
                  + Add Another Question
                </button>
              </div>
            )}

            {/* Submit Button */}
            <div className="text-center">
              <button
                type="submit"
                className="btn btn-primary w-100 py-2 fw-semibold"
                disabled={loading}
              >
                {loading ? "Saving..." : "Save Section"}
              </button>
            </div>

            {message && (
              <p className="mt-3 text-center fw-semibold text-info">{message}</p>
            )}
          </form>
        </div>
      </div>
  
  );
}

export default AddSectionForm;
