// InstructorCourseView.jsx - UPDATED FOR NEW BACKEND
import React, { useEffect, useMemo, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useCourseStore } from "../Store/courseStore";
import { Star, ChevronDown, ThumbsUp, ThumbsDown, Reply } from "lucide-react";

const PAGE_SIZE = 6;

const InstructorCourseView = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { 
    course, 
    sections,
    getCourseWithSections, 
    getCourseStats,
    getCourseStudents,
    loading 
  } = useCourseStore();

  const [stats, setStats] = useState(null);
  const [students, setStudents] = useState([]);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [page, setPage] = useState(1);

  // Fetch course data
  useEffect(() => {
    if (id) {
      getCourseWithSections(id);
      loadStats();
      loadStudents();
    }
  }, [id]);

  const loadStats = async () => {
    try {
      const statsData = await getCourseStats(id);
      setStats(statsData);
    } catch (error) {
      console.error("Failed to load stats:", error);
    }
  };

  const loadStudents = async () => {
    try {
      const result = await getCourseStudents(id, "", 1, 100);
      setStudents(result.students || []);
    } catch (error) {
      console.error("Failed to load students:", error);
    }
  };

  // Filter students
  const filteredStudents = useMemo(() => {
    const lowerSearch = search.trim().toLowerCase();
    return students
      .filter((s) => {
        if (filterStatus === "active" && s.completed) return false;
        if (filterStatus === "completed" && !s.completed) return false;
        if (!lowerSearch) return true;
        return s.name?.toLowerCase().includes(lowerSearch) || 
               s.email?.toLowerCase().includes(lowerSearch);
      })
      .sort((a, b) => (a.name > b.name ? 1 : -1));
  }, [students, search, filterStatus]);

  const totalPages = Math.max(1, Math.ceil(filteredStudents.length / PAGE_SIZE));
  const studentsPaged = filteredStudents.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  // Handlers
  const handleSectionClick = (sectionId) => {
    navigate(`/course/${id}/section/${sectionId}`);
  };

  const handleAddSection = () => {
    navigate(`/add_section/${id}`);
  };

  if (loading && !course) {
    return (
      <div className="container py-5 text-center">
        <div className="spinner-border text-primary" style={{ width: "3rem", height: "3rem" }}>
          <span className="visually-hidden">Loading...</span>
        </div>
        <p className="mt-3 text-muted">Loading course details...</p>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="container py-5">
        <div className="alert alert-warning">
          <i className="bi bi-exclamation-triangle me-2"></i>
          Course not found
        </div>
      </div>
    );
  }

  return (
    <div className="container-fluid py-4" style={{ backgroundColor: "#f8f9fa" }}>
      {/* Header */}
      <div className="card border-0 shadow-sm mb-4">
        <div className="card-body p-4">
          <div className="row align-items-center">
            <div className="col-md-8">
              <h2 className="fw-bold mb-2">{course.course_title}</h2>
              <p className="text-muted mb-3">{course.short_description}</p>
              <div className="d-flex gap-3 flex-wrap">
                <span className="badge bg-primary px-3 py-2">
                  <i className="bi bi-tag me-1"></i>{course.category}
                </span>
                <span className="badge bg-info px-3 py-2">
                  <i className="bi bi-speedometer me-1"></i>{course.level}
                </span>
                <span className="badge bg-success px-3 py-2">
                  <i className="bi bi-clock me-1"></i>{course.course_length}
                </span>
                <span className="badge bg-warning text-dark px-3 py-2">
                  <i className="bi bi-star-fill me-1"></i>
                  {course.average_rating?.toFixed(1) || "0.0"} ({course.total_ratings || 0} ratings)
                </span>
              </div>
            </div>
            <div className="col-md-4 text-md-end mt-3 mt-md-0">
              <button
                onClick={() => navigate(`/edit_course/${id}`)}
                className="btn btn-outline-primary me-2"
              >
                <i className="bi bi-pencil me-1"></i>Edit Course
              </button>
              <button
                onClick={handleAddSection}
                className="btn text-white"
                style={{ backgroundColor: "#0C6F89" }}
              >
                <i className="bi bi-plus-circle me-1"></i>Add Section
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="row g-3 mb-4">
          <div className="col-md-3">
            <div className="card border-0 shadow-sm h-100">
              <div className="card-body text-center">
                <i className="bi bi-collection fs-1 text-primary mb-2"></i>
                <h3 className="fw-bold mb-0">{stats.sections_count || 0}</h3>
                <p className="text-muted mb-0">Sections</p>
              </div>
            </div>
          </div>
          <div className="col-md-3">
            <div className="card border-0 shadow-sm h-100">
              <div className="card-body text-center">
                <i className="bi bi-people fs-1 text-success mb-2"></i>
                <h3 className="fw-bold mb-0">{stats.total_enrollments || 0}</h3>
                <p className="text-muted mb-0">Students Enrolled</p>
              </div>
            </div>
          </div>
          <div className="col-md-3">
            <div className="card border-0 shadow-sm h-100">
              <div className="card-body text-center">
                <i className="bi bi-question-circle fs-1 text-warning mb-2"></i>
                <h3 className="fw-bold mb-0">{stats.total_questions || 0}</h3>
                <p className="text-muted mb-0">Questions Asked</p>
              </div>
            </div>
          </div>
          <div className="col-md-3">
            <div className="card border-0 shadow-sm h-100">
              <div className="card-body text-center">
                <i className="bi bi-award fs-1 text-info mb-2"></i>
                <h3 className="fw-bold mb-0">{stats.certificates_issued || 0}</h3>
                <p className="text-muted mb-0">Certificates Issued</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tabs */}
      <ul className="nav nav-tabs mb-4" role="tablist">
        <li className="nav-item">
          <button className="nav-link active" data-bs-toggle="tab" data-bs-target="#sections">
            <i className="bi bi-list-ul me-2"></i>Sections
          </button>
        </li>
        <li className="nav-item">
          <button className="nav-link" data-bs-toggle="tab" data-bs-target="#students">
            <i className="bi bi-people me-2"></i>Students
          </button>
        </li>
        <li className="nav-item">
          <button className="nav-link" data-bs-toggle="tab" data-bs-target="#reviews">
            <i className="bi bi-star me-2"></i>Reviews
          </button>
        </li>
      </ul>

      <div className="tab-content">
        {/* Sections Tab */}
        <div className="tab-pane fade show active" id="sections">
          <div className="card border-0 shadow-sm">
            <div className="card-body p-4">
              <div className="d-flex justify-content-between align-items-center mb-4">
                <h4 className="fw-bold mb-0">Course Sections</h4>
                <button onClick={handleAddSection} className="btn btn-sm btn-primary">
                  <i className="bi bi-plus me-1"></i>Add Section
                </button>
              </div>

              {sections && sections.length > 0 ? (
                <div className="list-group">
                  {sections.map((section, idx) => (
                    <div
                      key={section._id}
                      className="list-group-item list-group-item-action cursor-pointer"
                      onClick={() => handleSectionClick(section._id)}
                    >
                      <div className="d-flex justify-content-between align-items-center">
                        <div className="flex-grow-1">
                          <h6 className="fw-semibold mb-1">
                            {idx + 1}. {section.title}
                          </h6>
                          <p className="text-muted mb-2 small">{section.description}</p>
                          <div className="d-flex gap-3 small">
                            <span>
                              <i className="bi bi-play-circle me-1"></i>
                              {section.contents?.filter(c => c.type === "video").length || 0} videos
                            </span>
                            <span>
                              <i className="bi bi-file-pdf me-1"></i>
                              {section.contents?.filter(c => c.type === "pdf").length || 0} PDFs
                            </span>
                            <span>
                              <i className="bi bi-question-square me-1"></i>
                              {section.contents?.filter(c => c.type === "quiz").length || 0} quizzes
                            </span>
                          </div>
                        </div>
                        <i className="bi bi-chevron-right text-muted"></i>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-5">
                  <i className="bi bi-inbox fs-1 text-muted mb-3 d-block"></i>
                  <p className="text-muted">No sections yet. Add your first section!</p>
                  <button onClick={handleAddSection} className="btn btn-primary mt-2">
                    <i className="bi bi-plus-circle me-1"></i>Add First Section
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Students Tab */}
        <div className="tab-pane fade" id="students">
          <div className="card border-0 shadow-sm">
            <div className="card-body p-4">
              <div className="row mb-4">
                <div className="col-md-6">
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Search students..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                  />
                </div>
                <div className="col-md-3">
                  <select
                    className="form-select"
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                  >
                    <option value="all">All Students</option>
                    <option value="active">Active</option>
                    <option value="completed">Completed</option>
                  </select>
                </div>
              </div>

              {studentsPaged.length > 0 ? (
                <div className="table-responsive">
                  <table className="table table-hover">
                    <thead className="table-light">
                      <tr>
                        <th>Name</th>
                        <th>Email</th>
                        <th>Enrolled</th>
                        <th>Progress</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {studentsPaged.map((student) => (
                        <tr key={student.user_id}>
                          <td className="fw-semibold">{student.name}</td>
                          <td className="text-muted">{student.email}</td>
                          <td>{new Date(student.enrolled_on).toLocaleDateString()}</td>
                          <td>
                            <div className="progress" style={{ height: "8px" }}>
                              <div
                                className="progress-bar"
                                style={{ width: `${student.overall_progress}%` }}
                              ></div>
                            </div>
                            <small className="text-muted">{student.overall_progress}%</small>
                          </td>
                          <td>
                            <span className={`badge ${student.completed ? "bg-success" : "bg-primary"}`}>
                              {student.completed ? "Completed" : "Active"}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-5">
                  <i className="bi bi-people fs-1 text-muted mb-3 d-block"></i>
                  <p className="text-muted">No students enrolled yet</p>
                </div>
              )}

              {/* Pagination */}
              {totalPages > 1 && (
                <nav className="mt-4">
                  <ul className="pagination justify-content-center">
                    <li className={`page-item ${page === 1 ? "disabled" : ""}`}>
                      <button className="page-link" onClick={() => setPage(page - 1)}>
                        Previous
                      </button>
                    </li>
                    {[...Array(totalPages)].map((_, i) => (
                      <li key={i} className={`page-item ${page === i + 1 ? "active" : ""}`}>
                        <button className="page-link" onClick={() => setPage(i + 1)}>
                          {i + 1}
                        </button>
                      </li>
                    ))}
                    <li className={`page-item ${page === totalPages ? "disabled" : ""}`}>
                      <button className="page-link" onClick={() => setPage(page + 1)}>
                        Next
                      </button>
                    </li>
                  </ul>
                </nav>
              )}
            </div>
          </div>
        </div>

        {/* Reviews Tab */}
        <div className="tab-pane fade" id="reviews">
          <div className="card border-0 shadow-sm">
            <div className="card-body p-4">
              <h4 className="fw-bold mb-4">Student Reviews</h4>
              {course.reviews && course.reviews.length > 0 ? (
                <div>
                  {course.reviews.map((review, idx) => (
                    <div key={idx} className="border-bottom pb-3 mb-3">
                      <div className="d-flex justify-content-between">
                        <div>
                          <h6 className="fw-semibold mb-1">{review.user_name}</h6>
                          <div className="text-warning mb-2">
                            {"⭐".repeat(review.rating)}
                          </div>
                        </div>
                        <small className="text-muted">
                          {new Date(review.created_at).toLocaleDateString()}
                        </small>
                      </div>
                      <p className="text-muted mb-0">{review.comment}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-5">
                  <i className="bi bi-star fs-1 text-muted mb-3 d-block"></i>
                  <p className="text-muted">No reviews yet</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InstructorCourseView;