import React, { useState, useEffect } from "react";
import axios from "axios";
import { useInterestStore } from "../Store/interestStore";

function ManageInterests() {
  const [inputValue, setInputValue] = useState("");
  const [localInterests, setLocalInterests] = useState([]);
  
  const [editMode, setEditMode] = useState(null);
  const [editValue, setEditValue] = useState("");
  const { fetchInterests,updateInterest,deleteInterest, addInterests,savedInterests,loading,error,message } = useInterestStore();

  // Fetch saved interests from backend
  useEffect(() => {
    fetchInterests();
  }, []);

  const addLocalInterest = () => {
    if (inputValue.trim() && !localInterests.includes(inputValue.trim())) {
      setLocalInterests([...localInterests, inputValue.trim()]);
      setInputValue("");
    }
  };

  const removeLocalInterest = (interest) => {
    setLocalInterests(localInterests.filter((i) => i !== interest));
  };

  const handleSave = async () => {
    if (localInterests.length === 0) return;
    await addInterests(localInterests);
    setLocalInterests([]);
    setInputValue("");
    await fetchInterests();
  };

  const handleDelete = async (id) => {
    await deleteInterest(id);
    await fetchInterests();

  };

  const startEdit = (id, currentName) => {
    setEditMode(id);
    setEditValue(currentName);
  };

  const cancelEdit = () => {
    setEditMode(null);
    setEditValue("");
  };

  const handleUpdate = async (id) => {
    if (editValue.trim() === "") return;
    await updateInterest(id, editValue.trim());
    setEditMode(null);
    setEditValue("");
    await fetchInterests();
  };

  return (
    <div className="container mt-5" >
      <div className="card shadow-sm p-4" style={{ maxWidth: "600px", margin: "0 auto" }}>
        <h3 className="text-center mb-4 ">Manage Interests</h3>

        {/* Add Interests Section */}
        <div className="input-group mb-3">
          <input
            type="text"
            className="form-control"
            placeholder="Enter an interest"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
          />
          <button className="btn " onClick={addLocalInterest}>
            Add
          </button>
        </div>

        {/* Display Unsaved Interests */}
        {localInterests.length > 0 && (
          <div className="mb-3">
            <div className="d-flex flex-wrap gap-2">
              {localInterests.map((interest, index) => (
                <span
                  key={index}
                  className="badge bg-secondary p-2 d-flex align-items-center"
                >
                  {interest}
                  <button
                    type="button"
                    className="btn-close btn-close-white ms-2"
                    onClick={() => removeLocalInterest(interest)}
                    aria-label="Remove"
                    style={{ fontSize: "0.6rem" }}
                  ></button>
                </span>
              ))}
            </div>
            <button
              className="btn btn-primary mt-3"
              onClick={handleSave}
            >
              Save All Interests
            </button>
          </div>
        )}

        {/* Saved Interests Section */}
        {savedInterests.length > 0 ? (
          <>
            <h5 className="mt-4 mb-3 text-secondary border-bottom pb-2">
              Saved Interests
            </h5>
            <ul className="list-group">
              {savedInterests.map((i) => (
                <li
                  key={i._id}
                  className="list-group-item d-flex justify-content-between align-items-center"
                >
                  {editMode === i._id ? (
                    <div className="w-100 d-flex align-items-center gap-2">
                      <input
                        type="text"
                        className="form-control"
                        value={editValue}
                        onChange={(e) => setEditValue(e.target.value)}
                      />
                      <button
                        className="btn btn-success btn-sm"
                        onClick={() => handleUpdate(i._id)}
                      >
                        Save
                      </button>
                      <button
                        className="btn btn-secondary btn-sm"
                        onClick={cancelEdit}
                      >
                        Cancel
                      </button>
                    </div>
                  ) : (
                    <>
                      <span>{i.name}</span>
                      <div>
                        <button
                          className="btn btn-warning btn-sm me-2"
                          onClick={() => startEdit(i._id, i.name)}
                        >
                          Edit
                        </button>
                        <button
                          className="btn btn-danger btn-sm"
                          onClick={() => handleDelete(i._id)}
                        >
                          Delete
                        </button>
                      </div>
                    </>
                  )}
                </li>
              ))}
            </ul>
          </>
        ) : (
          <p className="text-muted text-center mt-3">
            No saved interests yet.
          </p>
        )}
      </div>
    </div>
  );
}

export default ManageInterests;
