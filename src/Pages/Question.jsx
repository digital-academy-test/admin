// src/pages/Question.jsx
import React, { useEffect, useState } from "react";
import { useCbtStore } from "../Store/cbtStore";
import { useNavigate } from "react-router-dom";

function Question() {
  const { exams, getExams } = useCbtStore();
  const [selectedExam, setSelectedExam] = useState("");
  const [selectedYear, setSelectedYear] = useState("");
  const [subjects, setSubjects] = useState([]);
  const [selectedSubjects, setSelectedSubjects] = useState([]);
  const [duration, setDuration] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    getExams();
  }, [getExams]);

  const handleExamChange = (e) => {
    const examName = e.target.value;
    setSelectedExam(examName);
    setSelectedYear("");
    setSubjects([]);
    setSelectedSubjects([]);

    const exam = exams.find(
      (ex) => ex.name?.toLowerCase() === examName.toLowerCase()
    );
    if (exam) {
      setDuration(exam.time || "N/A");
    }
  };

  const handleYearChange = (e) => {
    const year = parseInt(e.target.value);
    setSelectedYear(year);
    setSelectedSubjects([]);

    const exam = exams.find(
      (ex) => ex.name?.toLowerCase() === selectedExam.toLowerCase()
    );
    if (exam) {
      const yearObj = exam.years?.find((y) => y.year === year);
      setSubjects(yearObj?.subjects || []);
    }
  };

  const handleSubjectToggle = (subject) => {
    setSelectedSubjects((prev) =>
      prev.includes(subject)
        ? prev.filter((s) => s !== subject)
        : [...prev, subject]
    );
  };

  const handleManage = () => {
    if (selectedSubjects.length === 0) {
      alert("Select at least one subject.");
      return;
    }

    // ✅ Open ManageQuestion page for the first selected subject
    navigate("/manage_question", {
      state: {
        exam: selectedExam,
        year: selectedYear,
        subject: selectedSubjects[0],
        duration,
      },
    });
  };

  return (
    <div className="d-flex justify-content-center mt-4">
      <div
        className="card shadow-sm p-4"
        style={{ maxWidth: "600px", width: "100%", borderRadius: "12px" }}
      >
        <h4 className="mb-4">Manage Questions</h4>

        <form>
          <div className="form-group mt-2">
            <label>Select Exam</label>
            <select
              value={selectedExam}
              onChange={handleExamChange}
              className="form-control"
            >
              <option value="">-- Select Exam --</option>
              {exams.map((exam, idx) => (
                <option key={idx} value={exam.name}>
                  {exam.name?.toUpperCase()}
                </option>
              ))}
            </select>
          </div>

          {selectedExam && (
            <div className="form-group mt-2">
              <label>Select Year</label>
              <select
                value={selectedYear}
                onChange={handleYearChange}
                className="form-control"
              >
                <option value="">-- Select Year --</option>
                {exams
                  .find(
                    (ex) =>
                      ex.name?.toLowerCase() === selectedExam.toLowerCase()
                  )
                  ?.years?.map((yearObj, idx) => (
                    <option key={idx} value={yearObj.year}>
                      {yearObj.year}
                    </option>
                  ))}
              </select>
            </div>
          )}

          {subjects.length > 0 && (
            <div className="mt-3">
              <h5>Pick Subject(s):</h5>
              {subjects.map((subj, idx) => (
                <div key={idx}>
                  <label>
                    <input
                      type="checkbox"
                      value={subj}
                      checked={selectedSubjects.includes(subj)}
                      onChange={() => handleSubjectToggle(subj)}
                    />{" "}
                    {subj}
                  </label>
                </div>
              ))}

              <p className="mt-2">
                <strong>Duration:</strong> {duration} mins
              </p>

              <div className="btn-container">
                <button
                  type="button"
                  disabled={selectedSubjects.length === 0}
                  onClick={handleManage}
                  className="mt-3 px-4 py-2 bg-[#15253a] text-white rounded hover:bg-[#0f1d2d]"
                >
                  View / Manage Questions
                </button>
              </div>
            </div>
          )}
        </form>
      </div>
    </div>
  );
}

export default Question;
