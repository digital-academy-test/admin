// src/pages/admin/CreateBlog.jsx - UPDATED with RichTextEditor
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import { useBlogStore } from "../Store/blogStore";
import RichTextEditor from '../Component/RichTextEditor';
import toast from 'react-hot-toast';

const CreateBlog = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: "",
    content: "",
    excerpt: "",
    category: "",
    author: "",
    authorName: "",
    tags: "",
    status: "published",
    commentsEnabled: true,
  });

  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);

  const { Postblog, message, loading, error, clearMessages } = useBlogStore();

  // Handle text fields
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Handle rich text content
  const handleContentChange = (content) => {
    console.log('Content changed:', content);
    setFormData({ ...formData, content: content });
  };

  // Handle image file
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImage(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validation
    if (!formData.title || !formData.content || !formData.category || !formData.author) {
      toast.error("Please fill in all required fields");
      return;
    }

    try {
      const data = new FormData();
      data.append("title", formData.title);
      data.append("content", formData.content); // HTML from RichTextEditor
      data.append("excerpt", formData.excerpt);
      data.append("category", formData.category);
      data.append("author", formData.author);
      data.append("authorName", formData.authorName || formData.author);
      data.append("tags", formData.tags);
      data.append("status", formData.status);
      data.append("commentsEnabled", formData.commentsEnabled);
      
      if (image) {
        data.append("image", image);
      }

      await Postblog(data);
      
      toast.success("✅ Blog created successfully!");
      
      // Reset form
      setFormData({
        title: "",
        content: "",
        excerpt: "",
        category: "",
        author: "",
        authorName: "",
        tags: "",
        status: "published",
        commentsEnabled: true,
      });
      setImage(null);
      setImagePreview(null);

      // Navigate to manage blogs after 1 second
      setTimeout(() => {
        navigate('/admin/manage-blogs');
      }, 1000);
    } catch (error) {
      console.error("Error creating blog:", error);
      toast.error(error.response?.data?.message || "❌ Failed to create blog");
    }
  };

  return (
    <div className="container mt-5 mb-5">
      {message && toast.success(message)}
      {error && toast.error(error)}

      <form onSubmit={handleSubmit} className="p-4 border rounded bg-light shadow card">
        <h3 className="mb-4 text-center">📝 Create New Blog</h3>

        {/* Title */}
        <div className="mb-3">
          <label className="form-label">
            Title <span className="text-danger">*</span>
          </label>
          <input
            type="text"
            className="form-control"
            name="title"
            value={formData.title}
            onChange={handleChange}
            placeholder="Enter blog title"
            required
          />
        </div>

        {/* Content - RichTextEditor */}
        <div className="mb-3">
          <label className="form-label">
            Content <span className="text-danger">*</span>
          </label>
          <RichTextEditor
            value={formData.content}
            onChange={handleContentChange}
            placeholder="Write your blog content here..."
            height="400px"
          />
        </div>

        {/* Excerpt */}
        <div className="mb-3">
          <label className="form-label">Excerpt (Short Summary)</label>
          <textarea
            className="form-control"
            name="excerpt"
            value={formData.excerpt}
            onChange={handleChange}
            placeholder="Brief description of your blog post"
            rows="3"
          />
          <small className="text-muted">This will be shown in blog previews</small>
        </div>

        {/* Category & Tags */}
        <div className="row">
          <div className="col-md-6 mb-3">
            <label className="form-label">
              Category <span className="text-danger">*</span>
            </label>
            <input
              type="text"
              className="form-control"
              name="category"
              value={formData.category}
              onChange={handleChange}
              placeholder="e.g., Technology, Education"
              required
            />
          </div>

          <div className="col-md-6 mb-3">
            <label className="form-label">Tags (comma-separated)</label>
            <input
              type="text"
              className="form-control"
              name="tags"
              value={formData.tags}
              onChange={handleChange}
              placeholder="e.g., AI, Tutorial, News"
            />
          </div>
        </div>

        {/* Author Info */}
        <div className="row">
          <div className="col-md-6 mb-3">
            <label className="form-label">
              Author ID <span className="text-danger">*</span>
            </label>
            <input
              type="text"
              className="form-control"
              name="author"
              value={formData.author}
              onChange={handleChange}
              placeholder="Your staff/admin ID"
              required
            />
          </div>

          <div className="col-md-6 mb-3">
            <label className="form-label">Author Name</label>
            <input
              type="text"
              className="form-control"
              name="authorName"
              value={formData.authorName}
              onChange={handleChange}
              placeholder="Your display name"
            />
          </div>
        </div>

        {/* Image Upload */}
        <div className="mb-3">
          <label className="form-label">Featured Image</label>
          <input
            type="file"
            className="form-control"
            name="image"
            onChange={handleImageChange}
            accept="image/*"
          />
          {imagePreview && (
            <div className="mt-3">
              <img
                src={imagePreview}
                alt="Preview"
                className="img-thumbnail"
                style={{ maxWidth: '300px', maxHeight: '200px' }}
              />
            </div>
          )}
        </div>

        {/* Status & Comments */}
        <div className="row">
          <div className="col-md-6 mb-3">
            <label className="form-label">Status</label>
            <select
              className="form-select"
              name="status"
              value={formData.status}
              onChange={handleChange}
            >
              <option value="published">Published</option>
              <option value="draft">Draft</option>
            </select>
          </div>

          <div className="col-md-6 mb-3">
            <label className="form-label">Enable Comments</label>
            <div className="form-check form-switch mt-2">
              <input
                className="form-check-input"
                type="checkbox"
                name="commentsEnabled"
                checked={formData.commentsEnabled}
                onChange={(e) => setFormData({ ...formData, commentsEnabled: e.target.checked })}
              />
              <label className="form-check-label">
                {formData.commentsEnabled ? 'Comments Enabled' : 'Comments Disabled'}
              </label>
            </div>
          </div>
        </div>

        {/* Submit Buttons */}
        <div className="d-flex gap-2">
          <button 
            type="submit" 
            className="btn btn-success flex-grow-1"
            disabled={loading}
          >
            {loading ? (
              <>
                <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                Publishing...
              </>
            ) : (
              <>📤 Publish Blog</>
            )}
          </button>
          
          <button
            type="button"
            className="btn btn-secondary"
            onClick={() => navigate('/admin/manage-blogs')}
            disabled={loading}
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreateBlog;