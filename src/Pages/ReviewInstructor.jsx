// src/Pages/ReviewInstructor.jsx
import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useInstructorAdminStore } from "../Store/instructorAdminStore";
import {
  ArrowLeft, CheckCircle, XCircle, Shield, BookOpen,
  Mail, Globe, Linkedin, Twitter, Youtube, FileText, Star, Users,
} from "lucide-react";
import toast from "react-hot-toast";

const BRAND = "#0C6F89";

const STATUS_STYLE = {
  pending:      { bg: "#f3f4f6", color: "#6b7280", label: "Pending"       },
  under_review: { bg: "#fef3c7", color: "#b45309", label: "Under Review"  },
  verified:     { bg: "#dcfce7", color: "#15803d", label: "Verified"      },
  rejected:     { bg: "#fee2e2", color: "#dc2626", label: "Rejected"      },
  suspended:    { bg: "#fce7f3", color: "#9d174d", label: "Suspended"     },
};

export default function ReviewInstructor() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { instructor, loading, getInstructorById, reviewInstructor } = useInstructorAdminStore();
  const [note, setNote] = useState("");
  const [showNoteFor, setShowNoteFor] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => { getInstructorById(id); }, [id]);

  const handleAction = async (action) => {
    if (action === "reject" && !note.trim()) {
      toast.error("Please provide a reason for rejection");
      return;
    }
    setActionLoading(true);
    try {
      await reviewInstructor(id, action, note);
      toast.success(`Instructor ${action}d successfully`);
      setShowNoteFor(null);
      setNote("");
      getInstructorById(id);
    } catch (e) {
      toast.error(e.message);
    } finally {
      setActionLoading(false);
    }
  };

  if (loading || !instructor) return (
    <div style={{ padding: 60, textAlign: "center", color: "#9ca3af", fontFamily: "'Poppins', sans-serif" }}>
      <div style={{ width: 36, height: 36, borderRadius: "50%", border: `3px solid ${BRAND}`,
        borderTopColor: "transparent", animation: "spin 0.8s linear infinite", margin: "0 auto 12px" }} />
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
      <p>Loading instructor profile…</p>
    </div>
  );

  const status = STATUS_STYLE[instructor.verificationStatus] || STATUS_STYLE.pending;
  const initials = (instructor.user?.name || instructor.displayName || "I")
    .split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase();

  return (
    <div style={{ fontFamily: "'Poppins', sans-serif", padding: 24, maxWidth: 1000, margin: "0 auto" }}>

      {/* Back */}
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 24 }}>
        <button onClick={() => navigate("/manage_instructors")}
          style={{ display: "flex", alignItems: "center", gap: 5, padding: "8px 14px",
            borderRadius: 9, border: "1.5px solid #e5e7eb", background: "#fff",
            fontSize: 13, cursor: "pointer", color: "#374151" }}>
          <ArrowLeft size={14} /> Back
        </button>
        <h1 style={{ fontFamily: "'Montserrat', sans-serif", fontSize: 20, fontWeight: 800, margin: 0 }}>
          Instructor Application
        </h1>
        <span style={{ marginLeft: "auto", fontSize: 12, fontWeight: 700, padding: "4px 14px",
          borderRadius: 20, background: status.bg, color: status.color }}>
          {status.label}
        </span>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 300px", gap: 24, alignItems: "flex-start" }}>

        {/* ── Left: Profile ── */}
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>

          {/* Profile header */}
          <div style={{ background: "#fff", border: "1px solid #e5e7eb", borderRadius: 14, padding: "24px" }}>
            <div style={{ display: "flex", gap: 18, alignItems: "flex-start" }}>
              {instructor.profilePic || instructor.user?.profilePic ? (
                <img src={instructor.profilePic || instructor.user?.profilePic} alt=""
                  style={{ width: 80, height: 80, borderRadius: "50%", objectFit: "cover", flexShrink: 0 }} />
              ) : (
                <div style={{ width: 80, height: 80, borderRadius: "50%", background: "#e8f4f8",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontFamily: "'Montserrat', sans-serif", fontSize: 26, fontWeight: 800, color: BRAND, flexShrink: 0 }}>
                  {initials}
                </div>
              )}
              <div style={{ flex: 1 }}>
                <h2 style={{ fontFamily: "'Montserrat', sans-serif", fontSize: 18, fontWeight: 800,
                  color: "#1a1a1a", margin: "0 0 4px" }}>
                  {instructor.displayName}
                </h2>
                {instructor.headline && (
                  <p style={{ margin: "0 0 8px", fontSize: 14, color: "#6b7280" }}>{instructor.headline}</p>
                )}
                <div style={{ display: "flex", gap: 12, flexWrap: "wrap", fontSize: 12, color: "#9ca3af" }}>
                  <span style={{ display: "flex", alignItems: "center", gap: 4 }}>
                    <Mail size={12} /> {instructor.user?.email}
                  </span>
                  {instructor.website && (
                    <span style={{ display: "flex", alignItems: "center", gap: 4 }}>
                      <Globe size={12} />
                      <a href={instructor.website} target="_blank" rel="noreferrer"
                        style={{ color: BRAND }}>{instructor.website}</a>
                    </span>
                  )}
                </div>
                {/* Social links */}
                {instructor.socialLinks && Object.entries(instructor.socialLinks).some(([, v]) => v) && (
                  <div style={{ display: "flex", gap: 10, marginTop: 10 }}>
                    {instructor.socialLinks.linkedin && (
                      <a href={instructor.socialLinks.linkedin} target="_blank" rel="noreferrer"
                        style={{ color: BRAND }}><Linkedin size={16} /></a>
                    )}
                    {instructor.socialLinks.twitter && (
                      <a href={instructor.socialLinks.twitter} target="_blank" rel="noreferrer"
                        style={{ color: BRAND }}><Twitter size={16} /></a>
                    )}
                    {instructor.socialLinks.youtube && (
                      <a href={instructor.socialLinks.youtube} target="_blank" rel="noreferrer"
                        style={{ color: BRAND }}><Youtube size={16} /></a>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Bio */}
          <div style={{ background: "#fff", border: "1px solid #e5e7eb", borderRadius: 14, padding: "20px 22px" }}>
            <h3 style={{ fontFamily: "'Montserrat', sans-serif", fontSize: 14, fontWeight: 700, margin: "0 0 10px" }}>Bio</h3>
            <p style={{ margin: 0, fontSize: 14, color: "#374151", lineHeight: 1.7 }}>{instructor.bio}</p>
          </div>

          {/* Qualifications + Expertise */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
            {instructor.qualifications && (
              <div style={{ background: "#fff", border: "1px solid #e5e7eb", borderRadius: 14, padding: "18px 20px" }}>
                <h3 style={{ fontFamily: "'Montserrat', sans-serif", fontSize: 14, fontWeight: 700, margin: "0 0 8px" }}>
                  Qualifications
                </h3>
                <p style={{ margin: 0, fontSize: 13, color: "#374151", lineHeight: 1.6 }}>{instructor.qualifications}</p>
              </div>
            )}
            {instructor.expertise?.length > 0 && (
              <div style={{ background: "#fff", border: "1px solid #e5e7eb", borderRadius: 14, padding: "18px 20px" }}>
                <h3 style={{ fontFamily: "'Montserrat', sans-serif", fontSize: 14, fontWeight: 700, margin: "0 0 10px" }}>
                  Areas of Expertise
                </h3>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                  {instructor.expertise.map(e => (
                    <span key={e} style={{ fontSize: 11, fontWeight: 700, padding: "4px 10px",
                      borderRadius: 20, background: "#e8f4f8", color: BRAND }}>{e}</span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Verification documents */}
          {instructor.verificationDocuments?.length > 0 && (
            <div style={{ background: "#fff", border: "1px solid #e5e7eb", borderRadius: 14, padding: "20px 22px" }}>
              <h3 style={{ fontFamily: "'Montserrat', sans-serif", fontSize: 14, fontWeight: 700, margin: "0 0 14px" }}>
                Verification Documents
              </h3>
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {instructor.verificationDocuments.map((url, i) => (
                  <a key={i} href={url} target="_blank" rel="noreferrer"
                    style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 14px",
                      borderRadius: 9, border: "1px solid #e5e7eb", background: "#f8fafc",
                      textDecoration: "none", color: "#374151", fontSize: 13, fontWeight: 500 }}>
                    <FileText size={16} color={BRAND} />
                    Document {i + 1}
                    <span style={{ marginLeft: "auto", fontSize: 11, color: BRAND }}>View →</span>
                  </a>
                ))}
              </div>
            </div>
          )}

          {/* Review history */}
          {instructor.reviewNote && (
            <div style={{ padding: "14px 16px", background: instructor.verificationStatus === "rejected" ? "#fef2f2" : "#fef3c7",
              border: `1px solid ${instructor.verificationStatus === "rejected" ? "#fecaca" : "#fde68a"}`,
              borderRadius: 12 }}>
              <p style={{ margin: "0 0 4px", fontSize: 11, fontWeight: 700,
                color: instructor.verificationStatus === "rejected" ? "#dc2626" : "#92400e",
                textTransform: "uppercase" }}>
                Previous Review Note
              </p>
              <p style={{ margin: 0, fontSize: 13,
                color: instructor.verificationStatus === "rejected" ? "#dc2626" : "#92400e" }}>
                {instructor.reviewNote}
              </p>
              {instructor.reviewedAt && (
                <p style={{ margin: "4px 0 0", fontSize: 11, color: "#9ca3af" }}>
                  Reviewed on {new Date(instructor.reviewedAt).toLocaleDateString("en-NG")}
                </p>
              )}
            </div>
          )}
        </div>

        {/* ── Right: Action panel ── */}
        <div style={{ position: "sticky", top: 90 }}>

          {/* Application meta */}
          <div style={{ background: "#fff", border: "1px solid #e5e7eb", borderRadius: 14, padding: "18px 18px", marginBottom: 14 }}>
            <h3 style={{ fontFamily: "'Montserrat', sans-serif", fontSize: 13, fontWeight: 700, margin: "0 0 14px" }}>
              Application Details
            </h3>
            {[
              { label: "Applied",         val: new Date(instructor.createdAt).toLocaleDateString("en-NG", { day: "numeric", month: "short", year: "numeric" }) },
              { label: "Total Courses",   val: instructor.totalCourses || 0   },
              { label: "Total Students",  val: instructor.totalStudents || 0  },
              { label: "Avg Rating",      val: instructor.ratingCount > 0 ? (instructor.totalRating / instructor.ratingCount).toFixed(1) + " ★" : "—" },
              { label: "Documents",       val: `${instructor.verificationDocuments?.length || 0} uploaded` },
            ].map(({ label, val }) => (
              <div key={label} style={{ display: "flex", justifyContent: "space-between", marginBottom: 10 }}>
                <span style={{ fontSize: 12, color: "#9ca3af" }}>{label}</span>
                <span style={{ fontSize: 12, fontWeight: 700, color: "#1a1a1a" }}>{val}</span>
              </div>
            ))}
          </div>

          {/* Actions */}
          <div style={{ background: "#fff", border: "1px solid #e5e7eb", borderRadius: 14, padding: "18px 18px" }}>
            <h3 style={{ fontFamily: "'Montserrat', sans-serif", fontSize: 13, fontWeight: 700, margin: "0 0 14px" }}>
              Decision
            </h3>

            {showNoteFor && (
              <div style={{ marginBottom: 14 }}>
                <label style={{ fontSize: 12, fontWeight: 600, display: "block", marginBottom: 6, color: "#374151" }}>
                  {showNoteFor === "reject" ? "Reason for rejection *" : "Note (optional)"}
                </label>
                <textarea value={note} onChange={e => setNote(e.target.value)} rows={3}
                  placeholder="Write a note to the applicant…"
                  style={{ width: "100%", padding: "9px 12px", border: "1.5px solid #e5e7eb",
                    borderRadius: 8, fontSize: 13, resize: "vertical", outline: "none", boxSizing: "border-box" }} />
              </div>
            )}

            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {/* Approve */}
              {["pending", "under_review", "rejected"].includes(instructor.verificationStatus) && (
                <button
                  onClick={() => showNoteFor === "approve" ? handleAction("approve") : setShowNoteFor("approve")}
                  disabled={actionLoading}
                  style={{ width: "100%", display: "flex", alignItems: "center", justifyContent: "center", gap: 7,
                    padding: "12px", borderRadius: 10, border: "none",
                    background: "linear-gradient(135deg, #0A7431, #37B44A)",
                    color: "#fff", fontFamily: "'Montserrat', sans-serif", fontSize: 14, fontWeight: 700, cursor: "pointer" }}>
                  <CheckCircle size={15} /> {showNoteFor === "approve" ? "Confirm Approval" : "Approve Instructor"}
                </button>
              )}

              {/* Reject */}
              {["pending", "under_review", "verified"].includes(instructor.verificationStatus) && (
                <button
                  onClick={() => showNoteFor === "reject" ? handleAction("reject") : setShowNoteFor("reject")}
                  disabled={actionLoading}
                  style={{ width: "100%", display: "flex", alignItems: "center", justifyContent: "center", gap: 7,
                    padding: "12px", borderRadius: 10, border: "none",
                    background: "#fee2e2", color: "#dc2626",
                    fontFamily: "'Montserrat', sans-serif", fontSize: 14, fontWeight: 700, cursor: "pointer" }}>
                  <XCircle size={15} /> {showNoteFor === "reject" ? "Confirm Rejection" : "Reject Application"}
                </button>
              )}

              {/* Suspend */}
              {instructor.verificationStatus === "verified" && (
                <button
                  onClick={() => showNoteFor === "suspend" ? handleAction("suspend") : setShowNoteFor("suspend")}
                  disabled={actionLoading}
                  style={{ width: "100%", display: "flex", alignItems: "center", justifyContent: "center", gap: 7,
                    padding: "12px", borderRadius: 10, border: "none",
                    background: "#fce7f3", color: "#9d174d",
                    fontFamily: "'Montserrat', sans-serif", fontSize: 14, fontWeight: 700, cursor: "pointer" }}>
                  <Shield size={15} /> {showNoteFor === "suspend" ? "Confirm Suspend" : "Suspend Instructor"}
                </button>
              )}

              {showNoteFor && (
                <button onClick={() => { setShowNoteFor(null); setNote(""); }}
                  style={{ padding: "8px", border: "none", background: "transparent", color: "#9ca3af", fontSize: 12, cursor: "pointer" }}>
                  Cancel
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
