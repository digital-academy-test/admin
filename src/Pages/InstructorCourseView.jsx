// InstructorCourseView.jsx
import React, { useEffect, useMemo, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useCoursestore } from "../Store/courseStore"; // keep your original store hook
import { Star, ChevronDown, ThumbsUp, ThumbsDown, Reply } from "lucide-react";

/**
 * InstructorCourseView
 * - Uses Bootstrap classes for layout & components
 * - Expects fetchCourseDetail(id) to populate `course` in the store
 *
 * NOTE:
 * - Replace the dummy `studentsData` with actual data when ready.
 * - The "section click" navigates to `/instructor/course/:id/section/:sectionId` (adjust if you use a different route)
 */

const PAGE_SIZE = 6;

const InstructorCourseView = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { course: storeCourse, fetchCourseDetail } = useCoursestore();

  // Local copy so component re-renders predictably
  const [course, setCourse] = useState(null);

  // Students dummy data (replace with real load later)
  const [studentsData] = useState(() => {
    // create 28 dummy students with varied statuses
    const statuses = ["active", "errored", "expired", "complete"];
    return Array.from({ length: 28 }).map((_, i) => ({
      id: `stu-${i + 1}`,
      name: `Student ${i + 1}`,
      email: `student${i + 1}@example.com`,
      enrolledAt: new Date(Date.now() - (i + 1) * 86400000).toISOString(), // days ago
      status: statuses[i % statuses.length],
      progress: Math.floor(Math.random() * 101),
    }));
  });

  // UI state for students table
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("all"); // all, active, errored, expired, complete
  const [page, setPage] = useState(1);

  // fetch on mount or id change
  useEffect(() => {
    if (id) fetchCourseDetail(id);
  }, [id, fetchCourseDetail]);

  // sync store course into local state
  useEffect(() => {
    if (storeCourse && storeCourse.course) {
      setCourse(storeCourse);
    }
  }, [storeCourse]);

  // Derived stats
  const stats = useMemo(() => {
    if (!course) return { sections: 0, reviews: 0, totalQuestions: 0, unansweredQuestions: 0, students: studentsData.length };

    const sectionsCount = Array.isArray(course.sections) ? course.sections.length : 0;
    const reviewsCount = Array.isArray(course.course.reviews) ? course.course.reviews.length : 0;
    const totalQuestions = (course.sections || []).reduce((sum, s) => sum + ((s.questions && s.questions.length) || 0), 0);
    // since questions in your sample have no answer field, treat all questions as unanswered
    const unanswered = (course.sections || []).reduce((sum, s) => sum + ((s.questions && s.questions.length) || 0), 0);

    return {
      sections: sectionsCount,
      reviews: reviewsCount,
      totalQuestions,
      unansweredQuestions: unanswered,
      students: studentsData.length,
    };
  }, [course, studentsData]);

  // Students list filtered + searched
  const filteredStudents = useMemo(() => {
    const lowerSearch = search.trim().toLowerCase();
    return studentsData
      .filter((s) => {
        if (filterStatus !== "all" && s.status !== filterStatus) return false;
        if (!lowerSearch) return true;
        return s.name.toLowerCase().includes(lowerSearch) || s.email.toLowerCase().includes(lowerSearch);
      })
      .sort((a, b) => (a.name > b.name ? 1 : -1));
  }, [studentsData, search, filterStatus]);

  const totalPages = Math.max(1, Math.ceil(filteredStudents.length / PAGE_SIZE));
  useEffect(() => {
    if (page > totalPages) setPage(1);
  }, [totalPages, page]);

  const studentsPaged = filteredStudents.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  // rating and stars from course.course
  const rating = course && course.course ? Number(course.course.average_rating || 0) : 0;
  const totalRatings = course && course.course ? Number(course.course.total_ratings || 0) : 0;

  // Handlers
  function onSectionClick(sectionId) {
    // navigate to section page — adjust route if your app differs
    navigate(`/instructor/course/${id}/section/${sectionId}`);
  }

  return (
    <div className="container py-4">
      {/* Course header */}
      <div className="row mb-3 align-items-center">
        <div className="col-md-2">
          <img
            src={course?.course?.course_thumbnail || "/placeholder-course.png"}
            alt="course thumbnail"
            className="img-fluid rounded"
            style={{ maxHeight: 110, objectFit: "cover" }}
          />
        </div>
        <div className="col-md-7">
          <h3 className="mb-1">{course?.course?.course_title || "Loading course..."}</h3>
          <div className="d-flex align-items-center gap-2">
            <img
              src={course?.course?.instructor_img}
              alt="instructor"
              style={{ width: 36, height: 36, objectFit: "cover" }}
              className="rounded-circle me-2"
            />
            <div>
              <div className="small text-muted">Instructor</div>
              <div className="fw-semibold">{course?.course?.instructor || "-"}</div>
            </div>
          </div>
          <p className="mt-2 text-muted small">{course?.course?.short_description}</p>
        </div>

        <div className="col-md-3 text-md-end mt-3 mt-md-0">
          <div className="d-inline-block text-center">
            <div className="fs-4 fw-semibold">{rating.toFixed(1)}</div>
            <div className="text-muted small">{totalRatings} ratings</div>
            <div className="mt-1">
              <button className="btn btn-sm btn-outline-primary">Edit course</button>
            </div>
          </div>
        </div>
      </div>

      {/* Stats cards */}
      <div className="row g-3 mb-4">
        <div className="col-6 col-md-3">
          <div className="card shadow-sm">
            <div className="card-body">
              <div className="small text-muted">Sections</div>
              <div className="h5 mb-0">{stats.sections}</div>
            </div>
          </div>
        </div>

        <div className="col-6 col-md-3">
          <div className="card shadow-sm">
            <div className="card-body">
              <div className="small text-muted">Reviews</div>
              <div className="h5 mb-0">{stats.reviews}</div>
            </div>
          </div>
        </div>

        <div className="col-6 col-md-3">
          <div className="card shadow-sm">
            <div className="card-body">
              <div className="small text-muted">Questions (total)</div>
              <div className="h5 mb-0">{stats.totalQuestions}</div>
            </div>
          </div>
        </div>

        <div className="col-6 col-md-3">
          <div className="card shadow-sm">
            <div className="card-body">
              <div className="small text-muted">Unanswered Questions</div>
              <div className="h5 mb-0">{stats.unansweredQuestions}</div>
            </div>
          </div>
        </div>

        <div className="col-12 col-md-3 mt-2">
          <div className="card shadow-sm">
            <div className="card-body">
              <div className="small text-muted">Students (demo)</div>
              <div className="h5 mb-0">{stats.students}</div>
            </div>
          </div>
        </div>
      </div>

      <div className="row g-4">
        {/* Left column: Sections + description */}
        <div className="col-lg-7">
          <div className="card mb-3 shadow-sm">
            <div className="card-body">
              <h5 className="card-title">Course Details</h5>
              <p className="text-muted small">{course?.course?.description}</p>

              <div className="mt-3">
                <h6 className="mb-2">Learning Outcomes</h6>
                <ul>
                  {(course?.course?.learning_outcomes || []).map((lo, idx) => (
                    <li key={idx} className="small text-muted">{lo}</li>
                  ))}
                </ul>
              </div>

              <div className="mt-3">
                <h6 className="mb-2">Requirements</h6>
                <ul>
                  {(course?.course?.requirements || []).map((req, idx) => (
                    <li key={idx} className="small text-muted">{req}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          {/* Sections list */}
          <div className="card mb-3 shadow-sm">
            <div className="card-body">
              <h5 className="card-title">Sections ({stats.sections})</h5>

              <div className="list-group">
                {(course?.sections || []).map((section) => (
                  <button
                    key={section._id}
                    type="button"
                    className="list-group-item list-group-item-action d-flex justify-content-between align-items-start"
                    onClick={() => onSectionClick(section._id)}
                  >
                    <div>
                      <div className="fw-semibold">{section.title || "Untitled section"}</div>
                      <div className="small text-muted">{section.description}</div>
                    </div>
                    <div className="small text-muted">{(section.contents || []).length} items</div>
                  </button>
                ))}
                {(!course || (course.sections && course.sections.length === 0)) && (
                  <div className="small text-muted mt-2">No sections yet.</div>
                )}
              </div>
            </div>
          </div>

          {/* Reviews list (small) */}
          <div className="card mb-3 shadow-sm">
            <div className="card-body">
              <h5 className="card-title">Reviews & Rating</h5>

              <div className="d-flex align-items-center mb-3">
                <div className="fs-3 fw-bold me-3">{rating.toFixed(1)}</div>
                <div>
                  <div className="small text-muted">{totalRatings} ratings</div>
                  <div className="d-flex gap-1 mt-1">
                    {/* show 5 stars (filled up to rating) */}
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star key={i} size={18} className={i < Math.round(rating) ? "text-warning" : "text-muted"} />
                    ))}
                  </div>
                </div>
              </div>

              <div>
                {(course?.course?.reviews || []).length === 0 && <div className="small text-muted">No reviews yet.</div>}
                {(course?.course?.reviews || []).map((rev, idx) => (
                  <div key={idx} className="border-bottom pb-2 mb-2">
                    <div className="d-flex align-items-center">
                      <div className="rounded-circle bg-secondary me-2" style={{ width: 36, height: 36 }} />
                      <div>
                        <div className="fw-semibold small">{rev.reviewerName || "Anonymous"}</div>
                        <div className="small text-muted">{new Date(rev.createdAt || Date.now()).toLocaleDateString()}</div>
                      </div>
                    </div>
                    <p className="mb-1 small text-muted">{rev.comment || rev.text || ""}</p>

                    <div className="d-flex gap-2 small text-muted">
                      <button className="btn btn-sm btn-outline-light"><ThumbsUp size={14} /> Yes</button>
                      <button className="btn btn-sm btn-outline-light"><ThumbsDown size={14} /> No</button>
                      <button className="btn btn-sm btn-outline-light"><Reply size={14} /> Reply</button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Right column: Students table & filters */}
        <div className="col-lg-5">
          <div className="card mb-3 shadow-sm">
            <div className="card-body">
              <h5 className="card-title">Enrolled Students</h5>

              <div className="d-flex gap-2 mb-3">
                <input
                  type="text"
                  className="form-control form-control-sm"
                  placeholder="Search students (name or email)"
                  value={search}
                  onChange={(e) => {
                    setSearch(e.target.value);
                    setPage(1);
                  }}
                />
                <select
                  className="form-select form-select-sm"
                  value={filterStatus}
                  onChange={(e) => {
                    setFilterStatus(e.target.value);
                    setPage(1);
                  }}
                  style={{ maxWidth: 140 }}
                >
                  <option value="all">All</option>
                  <option value="active">Active</option>
                  <option value="errored">Errored</option>
                  <option value="expired">Expired</option>
                  <option value="complete">Complete</option>
                </select>
              </div>

              <div className="table-responsive" style={{ maxHeight: 340 }}>
                <table className="table table-sm table-hover mb-0">
                  <thead className="table-light" style={{ position: "sticky", top: 0 }}>
                    <tr>
                      <th>Name</th>
                      <th className="text-end">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {studentsPaged.length === 0 && (
                      <tr>
                        <td colSpan={2} className="small text-muted">No students match your filters.</td>
                      </tr>
                    )}
                    {studentsPaged.map((s) => (
                      <tr key={s.id}>
                        <td>
                          <div className="fw-semibold small">{s.name}</div>
                          <div className="small text-muted">{s.email}</div>
                        </td>
                        <td className="text-end small">
                          <span className={`badge bg-${s.status === "active" ? "success" : s.status === "complete" ? "primary" : s.status === "errored" ? "danger" : "secondary"}`}>
                            {s.status}
                          </span>
                          <div className="small text-muted mt-1">{s.progress}%</div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* pagination */}
              <div className="d-flex justify-content-between align-items-center mt-3">
                <div className="small text-muted">
                  Showing {(page - 1) * PAGE_SIZE + 1} - {Math.min(page * PAGE_SIZE, filteredStudents.length)} of {filteredStudents.length}
                </div>
                <div>
                  <nav>
                    <ul className="pagination pagination-sm mb-0">
                      <li className={`page-item ${page === 1 ? "disabled" : ""}`}>
                        <button className="page-link" onClick={() => setPage((p) => Math.max(1, p - 1))}>Prev</button>
                      </li>

                      {Array.from({ length: totalPages }).map((_, i) => {
                        const pg = i + 1;
                        // show up to first 5 pages in controls, with ellipsis if many
                        if (totalPages > 7) {
                          // smart trimming
                          if (pg > 2 && pg < totalPages - 1 && Math.abs(pg - page) > 2) {
                            // skip rendering middle distant pages
                            return null;
                          }
                        }
                        return (
                          <li key={pg} className={`page-item ${pg === page ? "active" : ""}`}>
                            <button className="page-link" onClick={() => setPage(pg)}>{pg}</button>
                          </li>
                        );
                      })}

                      <li className={`page-item ${page === totalPages ? "disabled" : ""}`}>
                        <button className="page-link" onClick={() => setPage((p) => Math.min(totalPages, p + 1))}>Next</button>
                      </li>
                    </ul>
                  </nav>
                </div>
              </div>
            </div>
          </div>

          {/* Small quick stats or actions */}
          <div className="card shadow-sm">
            <div className="card-body">
              <h6 className="card-title">Quick Actions</h6>
              <div className="d-grid gap-2">
                <button className="btn btn-outline-primary btn-sm">Export students (CSV)</button>
                <button className="btn btn-outline-secondary btn-sm">Message all students</button>
                <button className="btn btn-outline-danger btn-sm">Unpublish course</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InstructorCourseView;
