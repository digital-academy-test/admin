import React, { useState } from "react";
import axios from "axios";
import "bootstrap/dist/css/bootstrap.min.css";
import { useBlogStore } from "../Store/blogStore";

const CreateBlog = () => {
  const [formData, setFormData] = useState({
    title: "",
    content: "",
    category: "",
    author: "",
  });

  const [image, setImage] = useState(null);

  const {  Postblog,message,loading,error}= useBlogStore();

  // handle text fields
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // handle image file
  const handleImageChange = (e) => {
    setImage(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const data = new FormData();
      data.append("title", formData.title);
      data.append("content", formData.content);
      data.append("category", formData.category);
      data.append("author", formData.author);
      if (image) data.append("image", image);

      await Postblog(data);
      //  

      setMessage(res.data.message);
      setFormData({ title: "", content: "", category: "", author: "" });
      setImage(null);
    } catch (error) {
      console.error(error);
      setMessage("Error creating blog");
    }
  };

  return (
    <div className="container mt-5">
      
      {message && <div className="alert alert-info">{message}</div>}
      {error && <div className="alert alert-danger">{error}</div>}

      <form onSubmit={handleSubmit} className="p-4 border rounded bg-light shadow card">
        <h3 className="mb-3"> Create New Blog</h3>
        <div className="mb-3">
          <label className="form-label">Title</label>
          <input
            type="text"
            className="form-control"
            name="title"
            value={formData.title}
            onChange={handleChange}
            placeholder="Enter blog title"
          />
        </div>

        <div className="mb-3">
          <label className="form-label">Category</label>
          <input
            type="text"
            className="form-control"
            name="category"
            value={formData.category}
            onChange={handleChange}
            placeholder="Enter blog category"
          />
        </div>

        <div className="mb-3">
          <label className="form-label">Author</label>
          <input
            type="text"
            className="form-control"
            name="author"
            value={formData.author}
            onChange={handleChange}
            placeholder="Author name"
          />
        </div>

        <div className="mb-3">
          <label className="form-label">Image</label>
          <input
            type="file"
            className="form-control"
            name="image"
            onChange={handleImageChange}
          />
        </div>

        <div className="mb-3">
          <label className="form-label">Content</label>
          <textarea
            className="form-control"
            rows="5"
            name="content"
            value={formData.content}
            onChange={handleChange}
            placeholder="Write your blog content..."
          ></textarea>
        </div>

        <button type="submit" className="btn btn-success w-100">

          {
            loading ? "Publishing..." : "Publish Blog"
            }
         
        </button>
      </form>
    </div>
  );
};

export default CreateBlog;
