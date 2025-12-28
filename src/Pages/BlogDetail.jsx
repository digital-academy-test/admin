// src/pages/admin/BlogDetail.jsx - Admin view with comment moderation
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useBlogStore } from '../Store/blogStore';
import toast from 'react-hot-toast';
import { FaEye, FaHeart, FaComment, FaTrash, FaReply, FaEdit } from 'react-icons/fa';
import 'bootstrap/dist/css/bootstrap.min.css';

const BlogDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { currentBlog, getBlogById, deleteComment, addReply, loading } = useBlogStore();
  
  const [replyingTo, setReplyingTo] = useState(null);
  const [replyText, setReplyText] = useState('');
  const [adminName, setAdminName] = useState('Admin'); // Get from auth context

  useEffect(() => {
    if (id) {
      getBlogById(id);
    }
  }, [id]);

  const handleDeleteComment = async (commentId) => {
    if (!window.confirm('Are you sure you want to delete this comment?')) return;

    try {
      await deleteComment(id, commentId);
      toast.success('✅ Comment deleted');
      getBlogById(id); // Refresh
    } catch (error) {
      toast.error('❌ Failed to delete comment');
    }
  };

  const handleReply = async (commentId) => {
    if (!replyText.trim()) {
      toast.error('Reply cannot be empty');
      return;
    }

    try {
      await addReply(id, commentId, {
        comment: replyText,
        userName: adminName,
        isAnonymous: false,
      });
      
      toast.success('✅ Reply added');
      setReplyingTo(null);
      setReplyText('');
      getBlogById(id); // Refresh
    } catch (error) {
      toast.error('❌ Failed to add reply');
    }
  };

  if (loading || !currentBlog) {
    return (
      <div className="container mt-5 text-center">
        <div className="spinner-border text-primary" style={{ width: "3rem", height: "3rem" }}>
          <span className="visually-hidden">Loading...</span>
        </div>
        <h3 className="mt-3">Loading blog...</h3>
      </div>
    );
  }

  return (
    <div className="container mt-5 mb-5">
      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <button 
          className="btn btn-outline-secondary"
          onClick={() => navigate('/manage_post')}
        >
          ← Back to Manage Blogs
        </button>
        <h2>📰 Blog Details & Comments</h2>
      </div>

      {/* Blog Content */}
      <div className="card shadow-sm mb-4">
        {currentBlog.image && (
          <img
            src={currentBlog.image}
            alt={currentBlog.title}
            className="card-img-top"
            style={{ maxHeight: '400px', objectFit: 'cover' }}
          />
        )}
        
        <div className="card-body">
          <div className="d-flex justify-content-between align-items-start mb-3">
            <h1 className="card-title">{currentBlog.title}</h1>
            <span className={`badge ${currentBlog.status === 'published' ? 'bg-success' : 'bg-warning'} fs-6`}>
              {currentBlog.status}
            </span>
          </div>

          <div className="d-flex gap-4 mb-3 text-muted">
            <span><FaEye /> {currentBlog.views || 0} views</span>
            <span><FaComment /> {currentBlog.commentsCount || 0} comments</span>
            <span><FaHeart /> {currentBlog.likes?.length || 0} likes</span>
          </div>

          <div className="mb-3">
            <span className="badge bg-primary me-2">{currentBlog.category}</span>
            {currentBlog.tags && currentBlog.tags.map((tag, idx) => (
              <span key={idx} className="badge bg-secondary me-1">#{tag}</span>
            ))}
          </div>

          <p className="text-muted">
            By {currentBlog.authorName || currentBlog.author} • {new Date(currentBlog.createdAt).toLocaleDateString()}
          </p>

          <hr />

          {currentBlog.excerpt && (
            <div className="alert alert-info">
              <strong>Excerpt:</strong> {currentBlog.excerpt}
            </div>
          )}

          <div 
            className="blog-content"
            dangerouslySetInnerHTML={{ __html: currentBlog.content }}
          />
        </div>
      </div>

      {/* Comments Section */}
      <div className="card shadow-sm">
        <div className="card-header bg-primary text-white">
          <h3 className="mb-0">
            💬 Comments Management ({currentBlog.comments?.length || 0})
          </h3>
          {!currentBlog.commentsEnabled && (
            <small className="text-warning">⚠️ Comments are disabled for this blog</small>
          )}
        </div>

        <div className="card-body">
          {currentBlog.comments && currentBlog.comments.length > 0 ? (
            <div className="list-group">
              {currentBlog.comments.map((comment) => (
                <div key={comment._id} className="list-group-item mb-3">
                  {/* Comment Header */}
                  <div className="d-flex justify-content-between align-items-start mb-2">
                    <div className="d-flex align-items-center gap-2">
                      <div 
                        className="rounded-circle bg-gradient d-flex align-items-center justify-center text-white fw-bold"
                        style={{
                          width: '40px',
                          height: '40px',
                          background: comment.isAnonymous 
                            ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' 
                            : 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)'
                        }}
                      >
                        {comment.isAnonymous ? '?' : comment.userName.charAt(0).toUpperCase()}
                      </div>
                      
                      <div>
                        <strong>{comment.isAnonymous ? 'Anonymous' : comment.userName}</strong>
                        {comment.isAnonymous && (
                          <span className="badge bg-secondary ms-2">Anonymous</span>
                        )}
                        <br />
                        <small className="text-muted">
                          {new Date(comment.createdAt).toLocaleString()}
                          {comment.isEdited && <span className="ms-2 text-info">(Edited)</span>}
                        </small>
                      </div>
                    </div>

                    <div className="d-flex gap-2">
                      <span className="badge bg-light text-dark">
                        <FaHeart className="text-danger" /> {comment.likes?.length || 0}
                      </span>
                      <button
                        className="btn btn-sm btn-outline-primary"
                        onClick={() => setReplyingTo(comment._id)}
                      >
                        <FaReply /> Reply
                      </button>
                      <button
                        className="btn btn-sm btn-outline-danger"
                        onClick={() => handleDeleteComment(comment._id)}
                      >
                        <FaTrash />
                      </button>
                    </div>
                  </div>

                  {/* Comment Text */}
                  <p className="mb-2 ms-5">{comment.comment}</p>

                  {/* Reply Form */}
                  {replyingTo === comment._id && (
                    <div className="ms-5 mt-3 p-3 bg-light rounded">
                      <h6>Reply as Admin:</h6>
                      <textarea
                        className="form-control mb-2"
                        rows="3"
                        value={replyText}
                        onChange={(e) => setReplyText(e.target.value)}
                        placeholder="Write your reply..."
                      />
                      <div className="d-flex gap-2">
                        <button
                          className="btn btn-sm btn-primary"
                          onClick={() => handleReply(comment._id)}
                        >
                          Send Reply
                        </button>
                        <button
                          className="btn btn-sm btn-secondary"
                          onClick={() => {
                            setReplyingTo(null);
                            setReplyText('');
                          }}
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Replies */}
                  {comment.replies && comment.replies.length > 0 && (
                    <div className="ms-5 mt-3">
                      <h6 className="text-muted">Replies ({comment.replies.length})</h6>
                      {comment.replies.map((reply, idx) => (
                        <div key={idx} className="p-3 mb-2 bg-light rounded">
                          <div className="d-flex align-items-center gap-2 mb-2">
                            <div 
                              className="rounded-circle bg-success d-flex align-items-center justify-center text-white fw-bold"
                              style={{ width: '30px', height: '30px' }}
                            >
                              {reply.isAnonymous ? '?' : reply.userName.charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <strong className="small">
                                {reply.isAnonymous ? 'Anonymous' : reply.userName}
                              </strong>
                              <br />
                              <small className="text-muted">
                                {new Date(reply.createdAt).toLocaleString()}
                              </small>
                            </div>
                          </div>
                          <p className="small mb-0 ms-4">{reply.comment}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-5 text-muted">
              <FaComment size={50} className="mb-3 opacity-25" />
              <p>No comments yet</p>
            </div>
          )}
        </div>
      </div>

      <style jsx>{`
        .blog-content {
          line-height: 1.8;
        }
        .blog-content img {
          max-width: 100%;
          height: auto;
          border-radius: 8px;
          margin: 1rem 0;
        }
        .blog-content h2 {
          margin-top: 2rem;
          margin-bottom: 1rem;
        }
        .blog-content p {
          margin-bottom: 1rem;
        }
        .blog-content ul, .blog-content ol {
          margin-bottom: 1rem;
          padding-left: 2rem;
        }
      `}</style>
    </div>
  );
};

export default BlogDetail;