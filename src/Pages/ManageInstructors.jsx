// src/Pages/ManageInstructors.jsx
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useInstructorAdminStore } from "../Store/instructorAdminStore";
import {
  Search, Eye, CheckCircle, XCircle, RefreshCw,
  UserCheck, UserX, Clock, Shield,
} from "lucide-react";
import toast from "react-hot-toast";

const STATUS_STYLE = {
  pending:       { bg: "#f3f4f6", color: "#6b7280",  label: "Pending",        icon: Clock       },
  under_review:  { bg: "#fef3c7", color: "#b45309",  label: "Under Review",   icon: Eye         },
  verified:      { bg: "#dcfce7", color: "#15803d",  label: "Verified",       icon: UserCheck   },
  rejected:      { bg: "#fee2e2", color: "#dc2626",  label: "Rejected",       icon: UserX       },
  suspended:     { bg: "#fce7f3", color: "#9d174d",  label: "Suspended",      icon: Shield      },
};

function StatusBadge({ status }) {
  const s = STATUS_STYLE[status] || STATUS_STYLE.pending;
  const Icon = s.icon;
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 5, fontSize: 11, fontWeight: 700,
      padding: "3px 10px", borderRadius: 20, background: s.bg, color: s.color,
      textTransform: "uppercase", letterSpacing: "0.04em" }}>
      <Icon size={11} /> {s.label}
    </span>
  );
}

function Avatar({ src, initials, size = 38 }) {
  if (src) return <img src={src} alt="" style={{ width: size, height: size, borderRadius: "50%", objectFit: "cover" }} />;
  return (
    <div style={{ width: size, height: size, borderRadius: "50%", background: "#e8f4f8",
      display: "flex", alignItems: "center", justifyContent: "center",
      fontFamily: "'Montserrat', sans-serif", fontSize: size * 0.32, fontWeight: 700, color: "#0C6F89" }}>
      {initials}
    </div>
  );
}

export default function ManageInstructors() {
  const navigate = useNavigate();
  const { instructors, loading, pagination, getAllInstructors, reviewInstructor } = useInstructorAdminStore();

  const [statusFilter, setStatusFilter] = useState("");
  const [search, setSearch] = useState("");

  const fetch = (status = statusFilter) => {
    const params = {};
    if (status) params.status = status;
    getAllInstructors(params);
  };

  useEffect(() => { fetch(); }, []);

  const handleQuickAction = async (id, action) => {
    if (!confirm(`${action === "approve" ? "Approve" : action === "reject" ? "Reject" : "Suspend"} this instructor?`)) return;
    try {
      await reviewInstructor(id, action);
      toast.success(`Instructor ${action}d successfully`);
    } catch (e) {
      toast.error(e.message);
    }
  };

  const filtered = search
    ? instructors.filter(i =>
        i.displayName?.toLowerCase().includes(search.toLowerCase()) ||
        i.user?.email?.toLowerCase().includes(search.toLowerCase()) ||
        i.user?.name?.toLowerCase().includes(search.toLowerCase())
      )
    : instructors;

  const counts = {
    all:          instructors.length,
    pending:      instructors.filter(i => i.verificationStatus === "pending").length,
    under_review: instructors.filter(i => i.verificationStatus === "under_review").length,
    verified:     instructors.filter(i => i.verificationStatus === "verified").length,
    rejected:     instructors.filter(i => i.verificationStatus === "rejected").length,
  };

  return (
    <div style={{ fontFamily: "'Poppins', sans-serif", padding: 24 }}>

      {/* Header */}
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontFamily: "'Montserrat', sans-serif", fontSize: 22, fontWeight: 800, color: "#1a1a1a", margin: "0 0 4px" }}>
          Instructor Management
        </h1>
        <p style={{ margin: 0, fontSize: 13, color: "#6b7280" }}>
          Review, verify and manage instructor applications
        </p>
      </div>

      {/* Stat pills */}
      <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginBottom: 20 }}>
        {[
          { key: "",             label: "All",          val: pagination.total || instructors.length },
          { key: "under_review", label: "Under Review", val: counts.under_review },
          { key: "pending",      label: "Pending",      val: counts.pending      },
          { key: "verified",     label: "Verified",     val: counts.verified     },
          { key: "rejected",     label: "Rejected",     val: counts.rejected     },
        ].map(({ key, label, val }) => (
          <button key={key} onClick={() => { setStatusFilter(key); fetch(key); }}
            style={{
              padding: "8px 16px", borderRadius: 20, border: "1.5px solid",
              cursor: "pointer", fontSize: 12, fontWeight: 700,
              borderColor: statusFilter === key ? "#0C6F89" : "#e5e7eb",
              background: statusFilter === key ? "#0C6F89" : "#fff",
              color: statusFilter === key ? "#fff" : "#374151",
              transition: "all 0.15s",
            }}>
            {label} <span style={{ opacity: 0.8 }}>({val})</span>
          </button>
        ))}
      </div>

      {/* Search + refresh */}
      <div style={{ background: "#fff", border: "1px solid #e5e7eb", borderRadius: 12, padding: "12px 16px",
        marginBottom: 20, display: "flex", gap: 12, alignItems: "center" }}>
        <div style={{ position: "relative", flex: 1 }}>
          <Search size={14} style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "#9ca3af" }} />
          <input type="text" placeholder="Search by name or email…" value={search}
            onChange={e => setSearch(e.target.value)}
            style={{ width: "100%", padding: "8px 12px 8px 36px", border: "1.5px solid #e5e7eb",
              borderRadius: 8, fontSize: 13, outline: "none", boxSizing: "border-box" }} />
        </div>
        <button onClick={() => fetch()} style={{ display: "flex", alignItems: "center", gap: 5,
          padding: "8px 14px", borderRadius: 8, border: "1.5px solid #e5e7eb", background: "#fff",
          fontSize: 13, cursor: "pointer", color: "#6b7280" }}>
          <RefreshCw size={13} /> Refresh
        </button>
      </div>

      {/* List */}
      {loading ? (
        <div style={{ padding: 60, textAlign: "center", color: "#9ca3af" }}>
          <RefreshCw size={28} style={{ animation: "spin 1s linear infinite", marginBottom: 8 }} />
          <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
          <p style={{ margin: 0 }}>Loading instructors…</p>
        </div>
      ) : filtered.length === 0 ? (
        <div style={{ padding: 60, textAlign: "center", color: "#9ca3af", background: "#fff",
          border: "1px solid #e5e7eb", borderRadius: 12 }}>
          <UserCheck size={36} style={{ marginBottom: 8, opacity: 0.4 }} />
          <p style={{ margin: 0 }}>No instructor applications found</p>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {filtered.map(instructor => {
            const initials = (instructor.user?.name || instructor.displayName || "I")
              .split(" ").map(w => w[0]).join("").slice(0,2).toUpperCase();

            return (
              <div key={instructor._id}
                style={{ background: "#fff", border: "1px solid #e5e7eb", borderRadius: 14,
                  padding: "18px 20px", display: "flex", alignItems: "center", gap: 16, flexWrap: "wrap",
                  transition: "box-shadow 0.2s" }}
                onMouseEnter={e => e.currentTarget.style.boxShadow = "0 4px 18px rgba(12,111,137,0.09)"}
                onMouseLeave={e => e.currentTarget.style.boxShadow = "none"}
              >
                {/* Avatar */}
                <Avatar src={instructor.profilePic || instructor.user?.profilePic} initials={initials} size={46} />

                {/* Info */}
                <div style={{ flex: 1, minWidth: 180 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                    <h4 style={{ fontFamily: "'Montserrat', sans-serif", fontSize: 14, fontWeight: 700,
                      color: "#1a1a1a", margin: 0 }}>
                      {instructor.displayName || instructor.user?.name}
                    </h4>
                    <StatusBadge status={instructor.verificationStatus} />
                  </div>
                  <p style={{ margin: "3px 0 0", fontSize: 12, color: "#6b7280" }}>
                    {instructor.user?.email}
                  </p>
                  {instructor.headline && (
                    <p style={{ margin: "3px 0 0", fontSize: 12, color: "#9ca3af" }}>{instructor.headline}</p>
                  )}
                  {instructor.expertise?.length > 0 && (
                    <div style={{ display: "flex", gap: 5, flexWrap: "wrap", marginTop: 6 }}>
                      {instructor.expertise.slice(0, 3).map(e => (
                        <span key={e} style={{ fontSize: 10, fontWeight: 700, padding: "2px 8px",
                          borderRadius: 20, background: "#e8f4f8", color: "#0C6F89" }}>{e}</span>
                      ))}
                    </div>
                  )}
                  <p style={{ margin: "6px 0 0", fontSize: 11, color: "#d1d5db" }}>
                    Applied {new Date(instructor.createdAt).toLocaleDateString("en-NG", { day: "numeric", month: "short", year: "numeric" })}
                  </p>
                </div>

                {/* Stats */}
                <div style={{ display: "flex", gap: 20, flexShrink: 0 }}>
                  <div style={{ textAlign: "center" }}>
                    <p style={{ margin: 0, fontFamily: "'Montserrat', sans-serif", fontSize: 18, fontWeight: 800, color: "#0C6F89" }}>
                      {instructor.totalCourses || 0}
                    </p>
                    <p style={{ margin: 0, fontSize: 10, color: "#9ca3af" }}>Courses</p>
                  </div>
                  <div style={{ textAlign: "center" }}>
                    <p style={{ margin: 0, fontFamily: "'Montserrat', sans-serif", fontSize: 18, fontWeight: 800, color: "#0C6F89" }}>
                      {instructor.totalStudents || 0}
                    </p>
                    <p style={{ margin: 0, fontSize: 10, color: "#9ca3af" }}>Students</p>
                  </div>
                </div>

                {/* Actions */}
                <div style={{ display: "flex", gap: 8, flexShrink: 0, flexWrap: "wrap" }}>
                  <button onClick={() => navigate(`/review_instructor/${instructor._id}`)}
                    style={{ display: "flex", alignItems: "center", gap: 5, padding: "8px 14px",
                      borderRadius: 8, border: "1.5px solid #e5e7eb", background: "#fff",
                      fontSize: 12, fontWeight: 600, cursor: "pointer", color: "#0C6F89" }}>
                    <Eye size={13} /> View
                  </button>

                  {["pending", "under_review", "rejected"].includes(instructor.verificationStatus) && (
                    <button onClick={() => handleQuickAction(instructor._id, "approve")}
                      style={{ display: "flex", alignItems: "center", gap: 5, padding: "8px 14px",
                        borderRadius: 8, border: "none", background: "#dcfce7",
                        fontSize: 12, fontWeight: 700, cursor: "pointer", color: "#15803d" }}>
                      <CheckCircle size={13} /> Approve
                    </button>
                  )}

                  {["pending", "under_review", "verified"].includes(instructor.verificationStatus) && (
                    <button onClick={() => handleQuickAction(instructor._id, "reject")}
                      style={{ display: "flex", alignItems: "center", gap: 5, padding: "8px 14px",
                        borderRadius: 8, border: "none", background: "#fee2e2",
                        fontSize: 12, fontWeight: 700, cursor: "pointer", color: "#dc2626" }}>
                      <XCircle size={13} /> Reject
                    </button>
                  )}

                  {instructor.verificationStatus === "verified" && (
                    <button onClick={() => handleQuickAction(instructor._id, "suspend")}
                      style={{ padding: "8px 14px", borderRadius: 8, border: "1.5px solid #fce7f3",
                        background: "#fce7f3", fontSize: 12, fontWeight: 700, cursor: "pointer", color: "#9d174d" }}>
                      Suspend
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
