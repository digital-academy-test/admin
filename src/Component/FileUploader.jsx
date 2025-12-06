// components/FileUploader.jsx
import React, { useState, useRef } from "react";
import "bootstrap/dist/css/bootstrap.min.css";

const FileUploader = ({ label, name, accept, onFileSelect }) => {
  const [preview, setPreview] = useState(null);
  const [fileName, setFileName] = useState("");
  const fileInputRef = useRef();

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setFileName(file.name);
    onFileSelect(file);

    if (file.type.startsWith("image/")) {
      const reader = new FileReader();
      reader.onloadend = () => setPreview(reader.result);
      reader.readAsDataURL(file);
    } else if (file.type.startsWith("video/")) {
      setPreview(URL.createObjectURL(file));
    } else {
      setPreview(null);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) {
      setFileName(file.name);
      onFileSelect(file);
      if (file.type.startsWith("image/")) {
        const reader = new FileReader();
        reader.onloadend = () => setPreview(reader.result);
        reader.readAsDataURL(file);
      } else if (file.type.startsWith("video/")) {
        setPreview(URL.createObjectURL(file));
      }
    }
  };

  const handleDragOver = (e) => e.preventDefault();

  return (
    <div className="mb-3">
      <label className="form-label fw-bold">{label}</label>
      <div
        className="border border-secondary rounded p-4 text-center bg-light"
        style={{ cursor: "pointer", position: "relative" }}
        onClick={() => fileInputRef.current.click()}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
      >
        {preview ? (
          fileName.endsWith(".mp4") ? (
            <video
              src={preview}
              controls
              className="rounded"
              style={{ width: "100%", maxHeight: "200px" }}
            />
          ) : (
            <img
              src={preview}
              alt="Preview"
              className="img-fluid rounded"
              style={{ maxHeight: "200px" }}
            />
          )
        ) : (
          <div>
            <i className="bi bi-cloud-arrow-up fs-1 text-primary"></i>
            <p className="mt-2 text-muted">
              Click or drag to upload <br />
              <small className="text-secondary">({accept})</small>
            </p>
          </div>
        )}
      </div>
      <input
        type="file"
        name={name}
        accept={accept}
        ref={fileInputRef}
        className="d-none"
        onChange={handleFileChange}
      />
    </div>
  );
};

export default FileUploader;
