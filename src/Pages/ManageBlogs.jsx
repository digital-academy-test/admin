// src/pages/admin/ManageBlogs.jsx - UPDATED with RichTextEditor
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import { useBlogStore } from "../Store/blogStore";
import RichTextEditor from '../Component/RichTextEditor';
import toast from 'react-hot-toast';
import { FaEdit, FaTrash, FaEye, FaComment, FaHeart } from 'react-icons/fa';

const ManageBlogs = () => {
  const navigate = useNavigate();
  const [editingBlog, setEditingBlog] = useState(null);
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

  const { blogs, getBlog, loading, error, deleteBlog, updateBlog, clearMessages } = useBlogStore();

  useEffect(() => {
    getBlog();
  }, []);

  // Delete blog
  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this blog?")) return;
    
    try {
      await deleteBlog(id);
      toast.success("✅ Blog deleted successfully");
      await getBlog();
    } catch (error) {
      toast.error("❌ Failed to delete blog");
    }
  };

  // Start editing
  const handleEdit = (blog) => {
    setEditingBlog(blog._id);
    setFormData({
      title: blog.title,
      content: blog.content,
      excerpt: blog.excerpt || "",
      category: blog.category,
      author: blog.author,
      authorName: blog.authorName || blog.author,
      tags: blog.tags ? blog.tags.join(', ') : "",
      status: blog.status || "published",
      commentsEnabled: blog.commentsEnabled !== false,
    });
    setImagePreview(blog.image || null);
    setImage(null);
  };

  // Handle input changes
  const handleChange = (e) => {
    const { name, value, files, type, checked } = e.target;
    
    if (type === 'checkbox') {
      setFormData({ ...formData, [name]: checked });
    } else if (files) {
      const file = files[0];
      setImage(file);
      setImagePreview(URL.createObjectURL(file));
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  // Handle content change from RichTextEditor
  const handleContentChange = (content) => {
    setFormData({ ...formData, content: content });
  };

  // Submit edited blog
  const handleUpdate = async (e) => {
    e.preventDefault();

    const form = new FormData();
    form.append("title", formData.title);
    form.append("content", formData.content);
    form.append("excerpt", formData.excerpt);
    form.append("category", formData.category);
    form.append("author", formData.author);
    form.append("authorName", formData.authorName);
    form.append("tags", formData.tags);
    form.append("status", formData.status);
    form.append("commentsEnabled", formData.commentsEnabled);
    
    if (image) {
      form.append("image", image);
    }

    try {
      await updateBlog(editingBlog, form);
      toast.success("✅ Blog updated successfully");
      setEditingBlog(null);
      await getBlog();
    } catch (error) {
      toast.error("❌ Failed to update blog");
    }
  };

  if (loading && !blogs.length) {
    return (
      <div className="container mt-5 text-center">
        <div className="spinner-border text-primary" style={{ width: "3rem", height: "3rem" }}>
          <span className="visually-hidden">Loading...</span>
        </div>
        <h3 className="mt-3">Loading blogs...</h3>
      </div>
    );
  }

  return (
    <div className="container mt-5 mb-5">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>📰 Manage Blogs</h2>
        <button 
          className="btn btn-primary"
          onClick={() => navigate('/create_blog')}
        >
          ➕ Create New Blog
        </button>
      </div>

      {error && (
        <div className="alert alert-danger alert-dismissible fade show" role="alert">
          {error}
          <button type="button" className="btn-close" onClick={clearMessages}></button>
        </div>
      )}

      {/* Blog List */}
      {blogs && blogs.length > 0 ? (
        <div className="row">
          {blogs.map((blog) => (
            <div key={blog._id} className="col-md-6 col-lg-4 mb-4">
              <div className="card shadow-sm h-100 hover-shadow">
                {blog.image && (
                  <img
                    src={blog.image}
                    className="card-img-top"
                    alt={blog.title}
                    style={{ height: "200px", objectFit: "cover" }}
                  />
                )}
                <div className="card-body d-flex flex-column">
                  <div className="d-flex justify-content-between align-items-start mb-2">
                    <h5 className="card-title mb-0">{blog.title}</h5>
                    <span className={`badge ${blog.status === 'published' ? 'bg-success' : 'bg-warning'}`}>
                      {blog.status}
                    </span>
                  </div>
                  
                  <p className="card-text text-muted small text-truncate" style={{ maxHeight: "60px" }}>
                    {blog.excerpt || blog.content.replace(/<[^>]*>/g, '').substring(0, 100)}...
                  </p>
                  
                  <div className="mb-2">
                    <span className="badge bg-primary me-1">{blog.category}</span>
                    {blog.tags && blog.tags.slice(0, 2).map((tag, idx) => (
                      <span key={idx} className="badge bg-secondary me-1">#{tag}</span>
                    ))}
                  </div>

                  <div className="d-flex gap-3 text-muted small mb-3">
                    <span title="Views">
                      <FaEye /> {blog.views || 0}
                    </span>
                    <span title="Comments">
                      <FaComment /> {blog.commentsCount || 0}
                    </span>
                    <span title="Likes">
                      <FaHeart /> {blog.likes?.length || 0}
                    </span>
                  </div>

                  <p className="text-muted small">
                    ✍️ {blog.authorName || blog.author}
                  </p>
                  <p className="text-muted small">
                    📅 {new Date(blog.createdAt).toLocaleDateString()}
                  </p>

                  <div className="mt-auto d-flex gap-2">
                    <button
                      className="btn btn-sm btn-outline-primary flex-grow-1"
                      onClick={() => navigate(`/blog/${blog._id}`)}
                      title="View Details & Comments"
                    >
                      <FaEye /> View
                    </button>
                    <button
                      className="btn btn-sm btn-outline-warning"
                      onClick={() => handleEdit(blog)}
                      title="Edit Blog"
                    >
                      <FaEdit />
                    </button>
                    <button
                      className="btn btn-sm btn-outline-danger"
                      onClick={() => handleDelete(blog._id)}
                      title="Delete Blog"
                    >
                      <FaTrash />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-5">
          <h3 className="text-muted">No blogs yet</h3>
          <p>Create your first blog post to get started!</p>
          <button 
            className="btn btn-primary"
            onClick={() => navigate('/admin/create-blog')}
          >
            ➕ Create New Blog
          </button>
        </div>
      )}

      {/* Edit Modal */}
      {editingBlog && (
        <div className="modal show d-block" tabIndex="-1" role="dialog" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-xl modal-dialog-scrollable">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">✏️ Edit Blog</h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setEditingBlog(null)}
                ></button>
              </div>
              <div className="modal-body">
                <form onSubmit={handleUpdate} encType="multipart/form-data">
                  {/* Title */}
                  <div className="mb-3">
                    <label className="form-label">Title <span className="text-danger">*</span></label>
                    <input
                      type="text"
                      name="title"
                      value={formData.title}
                      onChange={handleChange}
                      className="form-control"
                      required
                    />
                  </div>

                  {/* Content - RichTextEditor */}
                  <div className="mb-3">
                    <label className="form-label">Content <span className="text-danger">*</span></label>
                    <RichTextEditor
                      value={formData.content}
                      onChange={handleContentChange}
                      placeholder="Write your blog content..."
                      height="350px"
                    />
                  </div>

                  {/* Excerpt */}
                  <div className="mb-3">
                    <label className="form-label">Excerpt</label>
                    <textarea
                      name="excerpt"
                      value={formData.excerpt}
                      onChange={handleChange}
                      className="form-control"
                      rows="2"
                      placeholder="Short summary"
                    />
                  </div>

                  {/* Category & Tags */}
                  <div className="row">
                    <div className="col-md-6 mb-3">
                      <label className="form-label">Category <span className="text-danger">*</span></label>
                      <input
                        type="text"
                        name="category"
                        value={formData.category}
                        onChange={handleChange}
                        className="form-control"
                        required
                      />
                    </div>

                    <div className="col-md-6 mb-3">
                      <label className="form-label">Tags (comma-separated)</label>
                      <input
                        type="text"
                        name="tags"
                        value={formData.tags}
                        onChange={handleChange}
                        className="form-control"
                        placeholder="AI, Tutorial, News"
                      />
                    </div>
                  </div>

                  {/* Author Info */}
                  <div className="row">
                    <div className="col-md-6 mb-3">
                      <label className="form-label">Author ID</label>
                      <input
                        type="text"
                        name="author"
                        value={formData.author}
                        onChange={handleChange}
                        className="form-control"
                      />
                    </div>

                    <div className="col-md-6 mb-3">
                      <label className="form-label">Author Name</label>
                      <input
                        type="text"
                        name="authorName"
                        value={formData.authorName}
                        onChange={handleChange}
                        className="form-control"
                      />
                    </div>
                  </div>

                  {/* Image */}
                  <div className="mb-3">
                    <label className="form-label">Update Image (optional)</label>
                    <input
                      type="file"
                      name="image"
                      onChange={handleChange}
                      className="form-control"
                      accept="image/*"
                    />
                    {imagePreview && (
                      <div className="mt-2">
                        <img
                          src={imagePreview}
                          alt="Preview"
                          className="img-thumbnail"
                          style={{ maxWidth: '200px', maxHeight: '150px' }}
                        />
                      </div>
                    )}
                  </div>

                  {/* Status & Comments */}
                  <div className="row">
                    <div className="col-md-6 mb-3">
                      <label className="form-label">Status</label>
                      <select
                        name="status"
                        value={formData.status}
                        onChange={handleChange}
                        className="form-select"
                      >
                        <option value="published">Published</option>
                        <option value="draft">Draft</option>
                      </select>
                    </div>

                    <div className="col-md-6 mb-3">
                      <label className="form-label">Comments</label>
                      <div className="form-check form-switch mt-2">
                        <input
                          className="form-check-input"
                          type="checkbox"
                          name="commentsEnabled"
                          checked={formData.commentsEnabled}
                          onChange={handleChange}
                        />
                        <label className="form-check-label">
                          {formData.commentsEnabled ? 'Enabled' : 'Disabled'}
                        </label>
                      </div>
                    </div>
                  </div>

                  {/* Submit */}
                  <div className="d-flex gap-2">
                    <button type="submit" className="btn btn-success flex-grow-1" disabled={loading}>
                      {loading ? (
                        <>
                          <span className="spinner-border spinner-border-sm me-2"></span>
                          Saving...
                        </>
                      ) : (
                        <>💾 Save Changes</>
                      )}
                    </button>
                    <button
                      type="button"
                      className="btn btn-secondary"
                      onClick={() => setEditingBlog(null)}
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        .hover-shadow {
          transition: all 0.3s ease;
        }
        .hover-shadow:hover {
          transform: translateY(-5px);
          box-shadow: 0 8px 16px rgba(0,0,0,0.2) !important;
        }
      `}</style>
    </div>
  );
};

export default ManageBlogs;