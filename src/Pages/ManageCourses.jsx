// src/Pages/ManageCourses.jsx
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useCourseAdminStore } from "../Store/courseAdminStore";
import {
  Search, Plus, Eye, CheckCircle, XCircle, BookOpen,
  Filter, RefreshCw, Users, Star, Edit2, Trash2, X,
} from "lucide-react";
import toast from "react-hot-toast";

const STATUS_STYLE = {
  draft:          { bg: "#f3f4f6", color: "#6b7280",  label: "Draft"          },
  pending_review: { bg: "#fef3c7", color: "#b45309",  label: "Pending Review" },
  approved:       { bg: "#dcfce7", color: "#15803d",  label: "Approved"       },
  published:      { bg: "#dbeafe", color: "#1d4ed8",  label: "Published"      },
  rejected:       { bg: "#fee2e2", color: "#dc2626",  label: "Rejected"       },
  unpublished:    { bg: "#f3f4f6", color: "#6b7280",  label: "Unpublished"    },
};

const TYPE_STYLE = {
  stem:    { bg: "#e8f4f8", color: "#0C6F89" },
  general: { bg: "#edf7f0", color: "#0A7431" },
};

const BRAND = "#0C6F89";

function StatusBadge({ status }) {
  const s = STATUS_STYLE[status] || STATUS_STYLE.draft;
  return (
    <span style={{ fontSize: 11, fontWeight: 700, padding: "3px 10px", borderRadius: 20,
      background: s.bg, color: s.color, textTransform: "uppercase", letterSpacing: "0.05em" }}>
      {s.label}
    </span>
  );
}

// ── Review modal ──────────────────────────────────────────────────────────────
function ReviewModal({ course, onClose, onConfirm }) {
  const [action, setAction] = useState(
    course.approvalStatus === "published" ? "unpublish" : "approve"
  );
  const [note,   setNote]   = useState(course.reviewNote || "");
  const [saving, setSaving] = useState(false);

  const ACTIONS = [
    { val: "approve",   label: "Approve & Publish", bg: "#dcfce7", color: "#15803d", border: "#86efac" },
    { val: "reject",    label: "Reject",             bg: "#fee2e2", color: "#dc2626", border: "#fca5a5" },
    { val: "unpublish", label: "Unpublish",          bg: "#fef3c7", color: "#b45309", border: "#fde68a" },
  ];

  const handleConfirm = async () => {
    if (action !== "approve" && !note.trim()) {
      toast.error("Please add a note explaining the reason."); return;
    }
    setSaving(true);
    try { await onConfirm(course._id, action, note); onClose(); }
    catch (e) { toast.error(e.response?.data?.message || "Action failed"); setSaving(false); }
  };

  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 999,
      display: "flex", alignItems: "center", justifyContent: "center" }}>
      {/* Backdrop */}
      <div onClick={onClose}
        style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.45)" }} />

      {/* Modal */}
      <div style={{ position: "relative", zIndex: 1, background: "#fff", borderRadius: 16,
        width: "min(480px, 94vw)", padding: 28,
        boxShadow: "0 24px 60px rgba(0,0,0,0.18)", fontFamily: "'Poppins', sans-serif" }}>

        {/* Header */}
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 20 }}>
          <div>
            <h3 style={{ fontFamily: "'Montserrat', sans-serif", fontSize: 16,
              fontWeight: 800, margin: "0 0 4px", color: "#1a1a1a" }}>Review Course</h3>
            <p style={{ margin: 0, fontSize: 13, color: "#6b7280",
              maxWidth: 340, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
              {course.title}
            </p>
          </div>
          <button type="button" onClick={onClose}
            style={{ background: "#f3f4f6", border: "none", borderRadius: 8,
              width: 30, height: 30, display: "flex", alignItems: "center",
              justifyContent: "center", cursor: "pointer", flexShrink: 0 }}>
            <X size={14} color="#6b7280" />
          </button>
        </div>

        {/* Action selector */}
        <label style={{ display: "block", fontSize: 11, fontWeight: 700, color: "#6b7280",
          marginBottom: 8, textTransform: "uppercase", letterSpacing: "0.07em" }}>
          Action
        </label>
        <div style={{ display: "flex", gap: 8, marginBottom: 18 }}>
          {ACTIONS.map((a) => (
            <button key={a.val} type="button" onClick={() => setAction(a.val)} style={{
              flex: 1, padding: "10px 6px", borderRadius: 10, cursor: "pointer",
              border: `2px solid ${action === a.val ? a.border : "#e5e7eb"}`,
              background: action === a.val ? a.bg : "#fff",
              color: action === a.val ? a.color : "#9ca3af",
              fontSize: 11, fontWeight: 700, transition: "all 0.15s",
            }}>{a.label}</button>
          ))}
        </div>

        {/* Note */}
        <div style={{ marginBottom: 22 }}>
          <label style={{ display: "block", fontSize: 11, fontWeight: 700, color: "#6b7280",
            marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.07em" }}>
            Note to instructor
            {action !== "approve" && <span style={{ color: "#ef4444" }}> *</span>}
          </label>
          <textarea
            value={note} onChange={(e) => setNote(e.target.value)} rows={3}
            placeholder={action === "approve"
              ? "Optional — e.g. Great course content, well structured!"
              : "Required — explain clearly why the course was rejected or unpublished."}
            style={{ width: "100%", padding: "10px 14px", border: "1.5px solid #e5e7eb",
              borderRadius: 10, fontSize: 13, outline: "none", resize: "vertical",
              fontFamily: "'Poppins', sans-serif", boxSizing: "border-box", color: "#374151",
              lineHeight: 1.6 }}
          />
          {action !== "approve" && !note.trim() && (
            <p style={{ margin: "5px 0 0", fontSize: 11, color: "#dc2626" }}>
              A note is required when rejecting or unpublishing.
            </p>
          )}
        </div>

        {/* Footer buttons */}
        <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
          <button type="button" onClick={onClose}
            style={{ padding: "10px 20px", borderRadius: 9, border: "1.5px solid #e5e7eb",
              background: "#fff", fontSize: 13, fontWeight: 600,
              cursor: "pointer", color: "#6b7280", fontFamily: "'Poppins', sans-serif" }}>
            Cancel
          </button>
          <button type="button" onClick={handleConfirm}
            disabled={saving || (action !== "approve" && !note.trim())}
            style={{
              padding: "10px 22px", borderRadius: 9, border: "none",
              background: action === "approve" ? "#15803d"
                : action === "reject" ? "#dc2626" : "#b45309",
              color: "#fff", fontSize: 13, fontWeight: 700, fontFamily: "'Montserrat', sans-serif",
              cursor: (saving || (action !== "approve" && !note.trim()))
                ? "not-allowed" : "pointer",
              opacity: (saving || (action !== "approve" && !note.trim())) ? 0.6 : 1,
              transition: "opacity 0.15s",
            }}>
            {saving
              ? "Saving…"
              : `Confirm ${action.charAt(0).toUpperCase() + action.slice(1)}`}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Delete confirm modal ──────────────────────────────────────────────────────
function DeleteModal({ course, onClose, onConfirm }) {
  const [deleting, setDeleting] = useState(false);
  const handleDelete = async () => {
    setDeleting(true);
    try { await onConfirm(course._id); onClose(); }
    catch (e) { toast.error(e.response?.data?.message || "Delete failed"); setDeleting(false); }
  };
  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 999,
      display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div onClick={onClose}
        style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.45)" }} />
      <div style={{ position: "relative", zIndex: 1, background: "#fff", borderRadius: 16,
        width: "min(420px, 94vw)", padding: 28,
        boxShadow: "0 24px 60px rgba(0,0,0,0.18)", fontFamily: "'Poppins', sans-serif" }}>
        <div style={{ textAlign: "center", marginBottom: 20 }}>
          <div style={{ width: 52, height: 52, borderRadius: "50%", background: "#fee2e2",
            display: "flex", alignItems: "center", justifyContent: "center",
            margin: "0 auto 14px" }}>
            <Trash2 size={22} color="#dc2626" />
          </div>
          <h3 style={{ fontFamily: "'Montserrat', sans-serif", fontSize: 16,
            fontWeight: 800, margin: "0 0 6px", color: "#1a1a1a" }}>Delete Course?</h3>
          <p style={{ margin: 0, fontSize: 13, color: "#6b7280", lineHeight: 1.6 }}>
            <strong>"{course.title}"</strong> will be permanently deleted along with all its
            sections, lessons, and enrollment data. This cannot be undone.
          </p>
        </div>
        <div style={{ display: "flex", gap: 10 }}>
          <button type="button" onClick={onClose}
            style={{ flex: 1, padding: "11px", borderRadius: 9, border: "1.5px solid #e5e7eb",
              background: "#fff", fontSize: 14, fontWeight: 600,
              cursor: "pointer", color: "#6b7280", fontFamily: "'Poppins', sans-serif" }}>
            Cancel
          </button>
          <button type="button" onClick={handleDelete} disabled={deleting}
            style={{ flex: 1, padding: "11px", borderRadius: 9, border: "none",
              background: deleting ? "#9ca3af" : "#dc2626", color: "#fff",
              fontSize: 14, fontWeight: 700, cursor: deleting ? "not-allowed" : "pointer",
              fontFamily: "'Montserrat', sans-serif" }}>
            {deleting ? "Deleting…" : "Yes, Delete"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────
export default function ManageCourses() {
  const navigate = useNavigate();
  const { courses, loading, getAllCourses, reviewCourse, deleteCourse, pagination } =
    useCourseAdminStore();

  const [filters,      setFilters]      = useState({ status: "", courseType: "", page: 1 });
  const [search,       setSearch]       = useState("");
  const [reviewTarget, setReviewTarget] = useState(null); // course being reviewed
  const [deleteTarget, setDeleteTarget] = useState(null); // course being deleted

  const fetch = (overrides = {}) => {
    const params = { ...filters, ...overrides };
    if (params.status     === "") delete params.status;
    if (params.courseType === "") delete params.courseType;
    getAllCourses(params);
  };

  useEffect(() => { fetch(); }, []);

  const handleFilter = (key, val) => {
    const updated = { ...filters, [key]: val, page: 1 };
    setFilters(updated);
    fetch(updated);
  };

  // Called by ReviewModal on confirm
  const handleReview = async (id, action, note) => {
    await reviewCourse(id, action, note);
    toast.success(`Course ${action}d successfully.`);
    fetch();
  };

  // Called by DeleteModal on confirm
  const handleDelete = async (id) => {
    await deleteCourse(id);
    toast.success("Course deleted.");
    // Store already removes it from local list, no need to re-fetch
  };

  const filtered = search
    ? courses.filter((c) => c.title?.toLowerCase().includes(search.toLowerCase()))
    : courses;

  return (
    <div style={{ fontFamily: "'Poppins', sans-serif", padding: "24px" }}>

      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between",
        marginBottom: 24, flexWrap: "wrap", gap: 12 }}>
        <div>
          <h1 style={{ fontFamily: "'Montserrat', sans-serif", fontSize: 22,
            fontWeight: 800, color: "#1a1a1a", margin: 0 }}>
            Course Management
          </h1>
          <p style={{ margin: 0, fontSize: 13, color: "#6b7280" }}>
            Review, approve and manage all courses on the platform
          </p>
        </div>
        <button onClick={() => navigate("/create_stem_course")} style={{
          display: "flex", alignItems: "center", gap: 7, padding: "10px 20px",
          borderRadius: 10, background: BRAND, color: "#fff",
          border: "none", fontSize: 13, fontWeight: 700, cursor: "pointer",
        }}>
          <Plus size={15} /> Create STEM Course
        </button>
      </div>

      {/* Filters */}
      <div style={{ background: "#fff", border: "1px solid #e5e7eb", borderRadius: 12,
        padding: "14px 18px", marginBottom: 20, display: "flex",
        alignItems: "center", gap: 12, flexWrap: "wrap" }}>
        <div style={{ position: "relative", flex: 1, minWidth: 200 }}>
          <Search size={14} style={{ position: "absolute", left: 12, top: "50%",
            transform: "translateY(-50%)", color: "#9ca3af" }} />
          <input type="text" placeholder="Search courses…" value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ width: "100%", padding: "8px 12px 8px 36px",
              border: "1.5px solid #e5e7eb", borderRadius: 8,
              fontSize: 13, outline: "none", boxSizing: "border-box" }} />
        </div>

        <select value={filters.status} onChange={(e) => handleFilter("status", e.target.value)}
          style={{ padding: "8px 12px", border: "1.5px solid #e5e7eb",
            borderRadius: 8, fontSize: 13, outline: "none", cursor: "pointer" }}>
          <option value="">All Status</option>
          {Object.entries(STATUS_STYLE).map(([k, v]) => (
            <option key={k} value={k}>{v.label}</option>
          ))}
        </select>

        <select value={filters.courseType} onChange={(e) => handleFilter("courseType", e.target.value)}
          style={{ padding: "8px 12px", border: "1.5px solid #e5e7eb",
            borderRadius: 8, fontSize: 13, outline: "none", cursor: "pointer" }}>
          <option value="">All Types</option>
          <option value="stem">STEM</option>
          <option value="general">General</option>
        </select>

        <button onClick={() => fetch()} style={{
          display: "flex", alignItems: "center", gap: 5, padding: "8px 14px",
          borderRadius: 8, border: "1.5px solid #e5e7eb", background: "#fff",
          fontSize: 13, cursor: "pointer", color: "#6b7280" }}>
          <RefreshCw size={13} /> Refresh
        </button>
      </div>

      {/* Stats row */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(150px, 1fr))",
        gap: 12, marginBottom: 20 }}>
        {[
          { label: "Total Courses",  value: pagination.total,                                                        color: BRAND      },
          { label: "Pending Review", value: courses.filter(c => c.approvalStatus === "pending_review").length,        color: "#b45309"  },
          { label: "Published",      value: courses.filter(c => c.approvalStatus === "published").length,             color: "#15803d"  },
          { label: "Rejected",       value: courses.filter(c => c.approvalStatus === "rejected").length,              color: "#dc2626"  },
        ].map((s) => (
          <div key={s.label} style={{ background: "#fff", border: "1px solid #e5e7eb",
            borderRadius: 10, padding: "14px 16px", textAlign: "center" }}>
            <p style={{ margin: 0, fontFamily: "'Montserrat', sans-serif",
              fontSize: 24, fontWeight: 800, color: s.color }}>{s.value}</p>
            <p style={{ margin: 0, fontSize: 11, color: "#9ca3af" }}>{s.label}</p>
          </div>
        ))}
      </div>

      {/* Table */}
      <div style={{ background: "#fff", border: "1px solid #e5e7eb",
        borderRadius: 12, overflow: "hidden" }}>
        {loading ? (
          <div style={{ padding: "60px", textAlign: "center", color: "#9ca3af" }}>
            <RefreshCw size={28} style={{ animation: "spin 1s linear infinite", marginBottom: 8 }} />
            <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
            <p style={{ margin: 0 }}>Loading courses…</p>
          </div>
        ) : filtered.length === 0 ? (
          <div style={{ padding: "60px", textAlign: "center", color: "#9ca3af" }}>
            <BookOpen size={36} style={{ marginBottom: 8, opacity: 0.4 }} />
            <p style={{ margin: 0 }}>No courses found</p>
          </div>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ background: "#f8fafc", borderBottom: "1px solid #e5e7eb" }}>
                  {["Course", "Type", "Instructor", "Status", "Students", "Rating", "Actions"].map((h) => (
                    <th key={h} style={{ padding: "12px 16px", textAlign: "left", fontSize: 11,
                      fontWeight: 700, color: "#6b7280", textTransform: "uppercase",
                      letterSpacing: "0.06em", whiteSpace: "nowrap" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((course, i) => (
                  <tr key={course._id}
                    style={{ borderBottom: "1px solid #f3f4f6",
                      background: i % 2 === 0 ? "#fff" : "#fafafa" }}
                    onMouseEnter={(e) => e.currentTarget.style.background = "#f0f9fb"}
                    onMouseLeave={(e) => e.currentTarget.style.background = i % 2 === 0 ? "#fff" : "#fafafa"}>

                    {/* Course */}
                    <td style={{ padding: "14px 16px", maxWidth: 260 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        {course.thumbnail ? (
                          <img src={course.thumbnail} alt=""
                            style={{ width: 44, height: 32, borderRadius: 6,
                              objectFit: "cover", flexShrink: 0 }} />
                        ) : (
                          <div style={{ width: 44, height: 32, borderRadius: 6,
                            background: "#e8f4f8", display: "flex", alignItems: "center",
                            justifyContent: "center", flexShrink: 0 }}>
                            <BookOpen size={14} color={BRAND} />
                          </div>
                        )}
                        <div style={{ minWidth: 0 }}>
                          <p style={{ margin: 0, fontSize: 13, fontWeight: 600, color: "#1a1a1a",
                            whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                            {course.title}
                          </p>
                          <p style={{ margin: 0, fontSize: 11, color: "#9ca3af" }}>{course.category}</p>
                        </div>
                      </div>
                    </td>

                    {/* Type */}
                    <td style={{ padding: "14px 16px" }}>
                      <span style={{ fontSize: 11, fontWeight: 700, padding: "2px 8px",
                        borderRadius: 20,
                        background: TYPE_STYLE[course.courseType]?.bg || "#f3f4f6",
                        color:      TYPE_STYLE[course.courseType]?.color || "#6b7280",
                        textTransform: "uppercase" }}>
                        {course.courseType}
                      </span>
                    </td>

                    {/* Instructor */}
                    <td style={{ padding: "14px 16px", fontSize: 13, color: "#374151" }}>
                      {course.instructor?.displayName || course.createdByStaff?.fullName || "Admin"}
                    </td>

                    {/* Status */}
                    <td style={{ padding: "14px 16px" }}>
                      <StatusBadge status={course.approvalStatus} />
                      {course.approvalStatus === "rejected" && course.reviewNote && (
                        <p style={{ margin: "3px 0 0", fontSize: 10, color: "#dc2626",
                          maxWidth: 130, overflow: "hidden", textOverflow: "ellipsis",
                          whiteSpace: "nowrap" }}>{course.reviewNote}</p>
                      )}
                    </td>

                    {/* Students */}
                    <td style={{ padding: "14px 16px", fontSize: 13, color: "#374151" }}>
                      <span style={{ display: "flex", alignItems: "center", gap: 4 }}>
                        <Users size={13} color="#9ca3af" /> {course.totalStudents || 0}
                      </span>
                    </td>

                    {/* Rating */}
                    <td style={{ padding: "14px 16px", fontSize: 13, color: "#374151" }}>
                      <span style={{ display: "flex", alignItems: "center", gap: 4 }}>
                        <Star size={12} color="#f59e0b" fill="#f59e0b" />
                        {course.ratingCount > 0
                          ? (course.totalRating / course.ratingCount).toFixed(1) : "—"}
                      </span>
                    </td>

                    {/* Actions */}
                    <td style={{ padding: "14px 16px" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 6, flexWrap: "nowrap" }}>

                        {/* View / manage content */}
                        <button onClick={() => navigate(`/review_course/${course._id}`)}
                          title="View full details"
                          style={{ display: "flex", alignItems: "center", gap: 4,
                            padding: "6px 10px", borderRadius: 7,
                            border: "1.5px solid #e5e7eb", background: "#fff",
                            fontSize: 12, fontWeight: 600, cursor: "pointer", color: BRAND }}>
                          <Eye size={12} /> View
                        </button>

                        {/* Edit course details */}
                        <button
                          onClick={() => navigate(
                            course.courseType === "stem"
                              ? `/edit_stem_course/${course._id}`
                              : `/edit_course/${course._id}`
                          )}
                          title="Edit course details"
                          style={{ padding: "6px 8px", borderRadius: 7, border: "none",
                            background: "#e8f4f8", color: BRAND, cursor: "pointer",
                            display: "flex", alignItems: "center" }}>
                          <Edit2 size={13} />
                        </button>

                        {/* Approve quick-action for pending */}
                        {course.approvalStatus === "pending_review" && (
                          <>
                            <button onClick={() => setReviewTarget(course)}
                              title="Review this course"
                              style={{ padding: "6px 10px", borderRadius: 7, border: "none",
                                background: "#fef3c7", color: "#b45309",
                                fontSize: 11, fontWeight: 700, cursor: "pointer" }}>
                              Review
                            </button>
                          </>
                        )}

                        {/* Approve shortcut on approved/rejected */}
                        {["approved", "rejected"].includes(course.approvalStatus) && (
                          <button onClick={() => setReviewTarget(course)}
                            title="Change status"
                            style={{ padding: "6px 8px", borderRadius: 7, border: "none",
                              background: "#dcfce7", color: "#15803d", cursor: "pointer",
                              display: "flex", alignItems: "center" }}>
                            <CheckCircle size={13} />
                          </button>
                        )}

                        {/* Unpublish published */}
                        {course.approvalStatus === "published" && (
                          <button onClick={() => setReviewTarget(course)}
                            title="Unpublish course"
                            style={{ padding: "6px 10px", borderRadius: 7, border: "none",
                              background: "#fef3c7", color: "#b45309",
                              fontSize: 11, fontWeight: 600, cursor: "pointer" }}>
                            Unpublish
                          </button>
                        )}

                        {/* Delete */}
                        <button onClick={() => setDeleteTarget(course)}
                          title="Delete course"
                          style={{ padding: "6px 8px", borderRadius: 7, border: "none",
                            background: "#fee2e2", color: "#dc2626", cursor: "pointer",
                            display: "flex", alignItems: "center" }}>
                          <Trash2 size={13} />
                        </button>

                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Review modal */}
      {reviewTarget && (
        <ReviewModal
          course={reviewTarget}
          onClose={() => setReviewTarget(null)}
          onConfirm={handleReview}
        />
      )}

      {/* Delete modal */}
      {deleteTarget && (
        <DeleteModal
          course={deleteTarget}
          onClose={() => setDeleteTarget(null)}
          onConfirm={handleDelete}
        />
      )}
    </div>
  );
}
