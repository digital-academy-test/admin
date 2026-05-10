// src/Pages/ManageCourses.jsx
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useCourseAdminStore } from "../Store/courseAdminStore";
import {
  Search, Plus, Eye, CheckCircle, XCircle, BookOpen,
  Filter, RefreshCw, ChevronRight, Clock, Users, Star,
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

function StatusBadge({ status }) {
  const s = STATUS_STYLE[status] || STATUS_STYLE.draft;
  return (
    <span style={{ fontSize: 11, fontWeight: 700, padding: "3px 10px", borderRadius: 20,
      background: s.bg, color: s.color, textTransform: "uppercase", letterSpacing: "0.05em" }}>
      {s.label}
    </span>
  );
}

export default function ManageCourses() {
  const navigate = useNavigate();
  const { courses, loading, getAllCourses, reviewCourse, pagination } = useCourseAdminStore();

  const [filters, setFilters] = useState({ status: "", courseType: "", page: 1 });
  const [search, setSearch] = useState("");

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

  const handleQuickAction = async (id, action) => {
    try {
      await reviewCourse(id, action);
      toast.success(`Course ${action}d successfully`);
      fetch();
    } catch (e) {
      toast.error(e.message);
    }
  };

  const filtered = search
    ? courses.filter((c) => c.title?.toLowerCase().includes(search.toLowerCase()))
    : courses;

  return (
    <div style={{ fontFamily: "'Poppins', sans-serif", padding: "24px" }}>

      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24, flexWrap: "wrap", gap: 12 }}>
        <div>
          <h1 style={{ fontFamily: "'Montserrat', sans-serif", fontSize: 22, fontWeight: 800, color: "#1a1a1a", margin: 0 }}>
            Course Management
          </h1>
          <p style={{ margin: 0, fontSize: 13, color: "#6b7280" }}>
            Review, approve and manage all courses on the platform
          </p>
        </div>
        <button
          onClick={() => navigate("/create_stem_course")}
          style={{ display: "flex", alignItems: "center", gap: 7, padding: "10px 20px", borderRadius: 10,
            background: "#0C6F89", color: "#fff", border: "none", fontSize: 13, fontWeight: 700, cursor: "pointer" }}
        >
          <Plus size={15} /> Create STEM Course
        </button>
      </div>

      {/* Filters */}
      <div style={{ background: "#fff", border: "1px solid #e5e7eb", borderRadius: 12, padding: "14px 18px",
        marginBottom: 20, display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
        {/* Search */}
        <div style={{ position: "relative", flex: 1, minWidth: 200 }}>
          <Search size={14} style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "#9ca3af" }} />
          <input
            type="text"
            placeholder="Search courses…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ width: "100%", padding: "8px 12px 8px 36px", border: "1.5px solid #e5e7eb",
              borderRadius: 8, fontSize: 13, outline: "none", boxSizing: "border-box" }}
          />
        </div>

        {/* Status filter */}
        <select value={filters.status} onChange={(e) => handleFilter("status", e.target.value)}
          style={{ padding: "8px 12px", border: "1.5px solid #e5e7eb", borderRadius: 8, fontSize: 13, outline: "none", cursor: "pointer" }}>
          <option value="">All Status</option>
          {Object.entries(STATUS_STYLE).map(([k, v]) => (
            <option key={k} value={k}>{v.label}</option>
          ))}
        </select>

        {/* Type filter */}
        <select value={filters.courseType} onChange={(e) => handleFilter("courseType", e.target.value)}
          style={{ padding: "8px 12px", border: "1.5px solid #e5e7eb", borderRadius: 8, fontSize: 13, outline: "none", cursor: "pointer" }}>
          <option value="">All Types</option>
          <option value="stem">STEM</option>
          <option value="general">General</option>
        </select>

        <button onClick={() => fetch()} style={{ display: "flex", alignItems: "center", gap: 5,
          padding: "8px 14px", borderRadius: 8, border: "1.5px solid #e5e7eb", background: "#fff",
          fontSize: 13, cursor: "pointer", color: "#6b7280" }}>
          <RefreshCw size={13} /> Refresh
        </button>
      </div>

      {/* Stats row */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(150px, 1fr))", gap: 12, marginBottom: 20 }}>
        {[
          { label: "Total Courses", value: pagination.total, color: "#0C6F89" },
          { label: "Pending Review", value: courses.filter(c => c.approvalStatus === "pending_review").length, color: "#b45309" },
          { label: "Published", value: courses.filter(c => c.approvalStatus === "published").length, color: "#15803d" },
          { label: "Rejected", value: courses.filter(c => c.approvalStatus === "rejected").length, color: "#dc2626" },
        ].map(s => (
          <div key={s.label} style={{ background: "#fff", border: "1px solid #e5e7eb", borderRadius: 10,
            padding: "14px 16px", textAlign: "center" }}>
            <p style={{ margin: 0, fontFamily: "'Montserrat', sans-serif", fontSize: 24, fontWeight: 800, color: s.color }}>{s.value}</p>
            <p style={{ margin: 0, fontSize: 11, color: "#9ca3af" }}>{s.label}</p>
          </div>
        ))}
      </div>

      {/* Table */}
      <div style={{ background: "#fff", border: "1px solid #e5e7eb", borderRadius: 12, overflow: "hidden" }}>
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
                  {["Course", "Type", "Instructor", "Status", "Students", "Rating", "Actions"].map(h => (
                    <th key={h} style={{ padding: "12px 16px", textAlign: "left", fontSize: 11,
                      fontWeight: 700, color: "#6b7280", textTransform: "uppercase", letterSpacing: "0.06em",
                      whiteSpace: "nowrap" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((course, i) => (
                  <tr key={course._id} style={{ borderBottom: "1px solid #f3f4f6",
                    background: i % 2 === 0 ? "#fff" : "#fafafa" }}
                    onMouseEnter={e => e.currentTarget.style.background = "#f0f9fb"}
                    onMouseLeave={e => e.currentTarget.style.background = i % 2 === 0 ? "#fff" : "#fafafa"}
                  >
                    {/* Course */}
                    <td style={{ padding: "14px 16px", maxWidth: 260 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        {course.thumbnail ? (
                          <img src={course.thumbnail} alt="" style={{ width: 44, height: 32, borderRadius: 6, objectFit: "cover", flexShrink: 0 }} />
                        ) : (
                          <div style={{ width: 44, height: 32, borderRadius: 6, background: "#e8f4f8", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                            <BookOpen size={14} color="#0C6F89" />
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
                      <span style={{ fontSize: 11, fontWeight: 700, padding: "2px 8px", borderRadius: 20,
                        background: TYPE_STYLE[course.courseType]?.bg || "#f3f4f6",
                        color: TYPE_STYLE[course.courseType]?.color || "#6b7280",
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
                        {course.ratingCount > 0 ? (course.totalRating / course.ratingCount).toFixed(1) : "—"}
                      </span>
                    </td>

                    {/* Actions */}
                    <td style={{ padding: "14px 16px" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                        <button onClick={() => navigate(`/review_course/${course._id}`)}
                          style={{ display: "flex", alignItems: "center", gap: 4, padding: "6px 11px",
                            borderRadius: 7, border: "1.5px solid #e5e7eb", background: "#fff",
                            fontSize: 12, fontWeight: 600, cursor: "pointer", color: "#0C6F89" }}>
                          <Eye size={12} /> View
                        </button>

                        {course.approvalStatus === "pending_review" && (
                          <>
                            <button onClick={() => handleQuickAction(course._id, "approve")}
                              style={{ padding: "6px 10px", borderRadius: 7, border: "none",
                                background: "#dcfce7", color: "#15803d", fontSize: 12, fontWeight: 700, cursor: "pointer" }}>
                              <CheckCircle size={13} />
                            </button>
                            <button onClick={() => handleQuickAction(course._id, "reject")}
                              style={{ padding: "6px 10px", borderRadius: 7, border: "none",
                                background: "#fee2e2", color: "#dc2626", fontSize: 12, fontWeight: 700, cursor: "pointer" }}>
                              <XCircle size={13} />
                            </button>
                          </>
                        )}
                        {course.approvalStatus === "published" && (
                          <button onClick={() => handleQuickAction(course._id, "unpublish")}
                            style={{ padding: "6px 10px", borderRadius: 7, border: "none",
                              background: "#fef3c7", color: "#b45309", fontSize: 12, fontWeight: 600, cursor: "pointer" }}>
                            Unpublish
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
