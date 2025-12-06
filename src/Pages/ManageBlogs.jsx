import React, { useEffect, useState } from "react";
import axios from "axios";
import "bootstrap/dist/css/bootstrap.min.css";
import { useBlogStore } from "../Store/blogStore";

const ManageBlogs = () => {
  
  const [editingBlog, setEditingBlog] = useState(null);
  const [formData, setFormData] = useState({
    title: "",
    content: "",
    category: "",
    author: "",
    image: null,
  });
  const [message, setMessage] = useState("");
  const {blogs,getBlog,loading,error,deleteBlog ,updateBlog}= useBlogStore();



  // Load blogs


  useEffect(() => {
    getBlog();
  }, []);

  // Delete blog
  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this blog?")) return;
    await deleteBlog(id);
    await getBlog();
  };

  // Start editing
  const handleEdit = (blog) => {
    setEditingBlog(blog._id);
    setFormData({
      title: blog.title,
      content: blog.content,
      category: blog.category,
      author: blog.author,
      image: null, // user may upload new image
    });
  };

  // Handle input changes
  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (files) {
      setFormData({ ...formData, [name]: files[0] });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  // Submit edited blog
  const handleUpdate = async (e) => {
    e.preventDefault();
    const form = new FormData();
    form.append("title", formData.title);
    form.append("content", formData.content);
    form.append("category", formData.category);
    form.append("author", formData.author);
    if (formData.image) {
      form.append("image", formData.image);
    }
    await updateBlog(editingBlog, form);
    setEditingBlog(null);
    await getBlog();

   
  };
  if(loading){
    return <div className="container mt-5 text-center"><h3>Loading blogs...</h3></div>;
  }

  return (
    <div className="container mt-5">
      <h4 className="mb-4 text-center">📰 Manage Blogs</h4>
      {message && <div className="alert alert-info text-center">{message}</div>}
      {error && <div className="alert alert-danger text-center">{error}</div>}

      {/* Blog List */}
      <div className="row">
        {blogs.map((blog) => (
          <div key={blog._id} className="col-md-4 mb-4">
            <div className="card shadow-sm h-100">
              {blog.image && (
                <img
                  src={blog.image}
                  className="card-img-top"
                  alt={blog.title}
                  style={{ height: "200px", objectFit: "cover" }}
                />
              )}
              <div className="card-body">
                <h5 className="card-title">{blog.title}</h5>
                <p className="card-text text-truncate">{blog.content}</p>
                <p>
                  <span className="badge bg-success">{blog.category}</span>
                </p>
                <p className="text-muted small">✍️ {blog.author}</p>
                <div className="d-flex justify-content-between">
                  <button
                    className="btn btn-outline-primary btn-sm"
                    onClick={() => handleEdit(blog)}
                  >
                    Edit
                  </button>
                  <button
                    className="btn btn-outline-danger btn-sm"
                    onClick={() => handleDelete(blog._id)}
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Edit Modal Form */}
      {editingBlog && (
        <div className="modal show d-block" tabIndex="-1" role="dialog">
          <div className="modal-dialog modal-lg">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Edit Blog</h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setEditingBlog(null)}
                ></button>
              </div>
              <div className="modal-body">
                <form onSubmit={handleUpdate} encType="multipart/form-data">
                  <div className="mb-3">
                    <label className="form-label">Title</label>
                    <input
                      type="text"
                      name="title"
                      value={formData.title}
                      onChange={handleChange}
                      className="form-control"
                      required
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Category</label>
                    <input
                      type="text"
                      name="category"
                      value={formData.category}
                      onChange={handleChange}
                      className="form-control"
                      required
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Author</label>
                    <input
                      type="text"
                      name="author"
                      value={formData.author}
                      onChange={handleChange}
                      className="form-control"
                      required
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">New Image (optional)</label>
                    <input
                      type="file"
                      name="image"
                      onChange={handleChange}
                      className="form-control"
                      accept="image/*"
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Content</label>
                    <textarea
                      name="content"
                      value={formData.content}
                      onChange={handleChange}
                      className="form-control"
                      rows="5"
                      required
                    ></textarea>
                  </div>
                  <button type="submit" className="btn btn-success w-100">
                    💾 Save Changes
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageBlogs;
