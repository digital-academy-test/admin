import React, { useState, useEffect } from "react";
import toast from "react-hot-toast";
import { FaBook, FaPlus } from "react-icons/fa";
import { useCbtStore } from "../Store/cbtStore";

const AddTopic = () => {
  const { examStructure, getExamStructure, addTopic, error, loading, message } = useCbtStore();

  const [levelId, setLevelId] = useState("");
  const [subjectId, setSubjectId] = useState("");
  const [topicName, setTopicName] = useState("");
  const [availableSubjects, setAvailableSubjects] = useState([]);

  // Load exam structure once on mount
  useEffect(() => {
    getExamStructure();
  }, []);

  // Update subjects when level changes
  useEffect(() => {
    if (levelId) {
      const selectedLevel = examStructure.find((lvl) => lvl._id === levelId);
      setAvailableSubjects(selectedLevel?.subjects || []);
      setSubjectId(""); // Reset subject when level changes
    } else {
      setAvailableSubjects([]);
      setSubjectId("");
    }
  }, [levelId, examStructure]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!levelId || !subjectId || !topicName) {
      toast.error("Please fill all fields");
      return;
    }

    try {
      // ✅ FIXED: Find the level and subject objects to get their NAMES
      const selectedLevel = examStructure.find((lvl) => lvl._id === levelId);
      const selectedSubject = selectedLevel?.subjects.find((subj) => subj._id === subjectId);

      if (!selectedLevel || !selectedSubject) {
        toast.error("Invalid level or subject selection");
        return;
      }

      // ✅ Backend expects: level (name), subjectName (name), topics (array)
      const payload = {
        level: selectedLevel.level, // Send level NAME (e.g., "SS1")
        subjectName: selectedSubject.name, // Send subject NAME (e.g., "Mathematics")
        topics: [{ name: topicName }] // Send topics as array of objects
      };

      console.log("Sending to backend:", payload); // Debug

      await addTopic(payload.level, payload.subjectName, payload.topics);
      toast.success("✅ Topic added successfully!");
      
      // Reset form
      setTopicName("");
      // Reload structure to see the new topic
      await getExamStructure();
    } catch (error) {
      console.error("Submit error:", error);
      toast.error(error.response?.data?.message || "Failed to add topic");
    }
  };

  return (
    <div className="container mt-5" style={{ maxWidth: "600px" }}>
      <div className="card shadow-lg border-0 rounded-4">
        <div className="card-header text-white py-3" style={{ background: "#15253a" }}>
          <h4 className="mb-0 d-flex align-items-center gap-2">
            <FaBook />
            Add Topic
          </h4>
        </div>

        <div className="card-body p-4">
          <form onSubmit={handleSubmit}>
            {/* Level Dropdown */}
            <div className="mb-3">
              <label className="form-label fw-bold">
                Select Level <span className="text-danger">*</span>
              </label>
              <select
                className="form-select"
                value={levelId}
                onChange={(e) => setLevelId(e.target.value)}
                required
              >
                <option value="">-- Choose Level --</option>
                {examStructure.map((lvl) => (
                  <option key={lvl._id} value={lvl._id}>
                    {lvl.level}
                  </option>
                ))}
              </select>
              <small className="text-muted">
                {examStructure.length > 0 
                  ? `Showing ${examStructure.length} level(s)`
                  : "Loading levels..."}
              </small>
            </div>

            {/* Subject Dropdown */}
            <div className="mb-3">
              <label className="form-label fw-bold">
                Select Subject <span className="text-danger">*</span>
              </label>
              <select
                className="form-select"
                value={subjectId}
                onChange={(e) => setSubjectId(e.target.value)}
                required
                disabled={!levelId}
              >
                <option value="">-- Choose Subject --</option>
                {availableSubjects.map((subj) => (
                  <option key={subj._id} value={subj._id}>
                    {subj.name}
                  </option>
                ))}
              </select>
              {!levelId && (
                <small className="text-muted">Select a level first</small>
              )}
              {levelId && availableSubjects.length === 0 && (
                <small className="text-warning">No subjects found for this level</small>
              )}
              {levelId && availableSubjects.length > 0 && (
                <small className="text-muted">
                  Showing {availableSubjects.length} subject(s)
                </small>
              )}
            </div>

            {/* Topic Input */}
            <div className="mb-3">
              <label className="form-label fw-bold">
                Topic Name <span className="text-danger">*</span>
              </label>
              <input
                type="text"
                className="form-control"
                placeholder="e.g. Algebra, Fractions, etc."
                value={topicName}
                onChange={(e) => setTopicName(e.target.value)}
                required
              />
            </div>

            {/* Submit Button */}
            <div className="d-grid">
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
                    Add Topic
                  </>
                )}
              </button>
            </div>
          </form>

          {/* Debug Info */}
          {process.env.NODE_ENV === 'development' && (
            <div className="mt-3 p-2 bg-light rounded small">
              <strong>Debug Info:</strong>
              <div>Levels loaded: {examStructure.length}</div>
              <div>Subjects available: {availableSubjects.length}</div>
              <div>Selected level ID: {levelId || 'none'}</div>
              <div>Selected subject ID: {subjectId || 'none'}</div>
              {levelId && (
                <div>
                  Level name: {examStructure.find(l => l._id === levelId)?.level || 'not found'}
                </div>
              )}
              {subjectId && (
                <div>
                  Subject name: {availableSubjects.find(s => s._id === subjectId)?.name || 'not found'}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AddTopic;