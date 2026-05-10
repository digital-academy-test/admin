// src/Pages/ReviewCourse.jsx
import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useCourseAdminStore } from "../Store/courseAdminStore";
import {
  ArrowLeft, CheckCircle, XCircle, BookOpen, Video, FileText,
  HelpCircle, Users, Star, Clock, ChevronDown, Globe, Plus, Trash2, Eye,
} from "lucide-react";
import toast from "react-hot-toast";

const BRAND = "#0C6F89";
const DARK  = "#084d63";

const STATUS_STYLE = {
  draft:          { bg: "#f3f4f6", color: "#6b7280", label: "Draft"          },
  pending_review: { bg: "#fef3c7", color: "#b45309", label: "Pending Review" },
  approved:       { bg: "#dcfce7", color: "#15803d", label: "Approved"       },
  published:      { bg: "#dbeafe", color: "#1d4ed8", label: "Published"      },
  rejected:       { bg: "#fee2e2", color: "#dc2626", label: "Rejected"       },
  unpublished:    { bg: "#f3f4f6", color: "#6b7280", label: "Unpublished"    },
};

const LESSON_ICONS = { video: Video, pdf: FileText, quiz: HelpCircle };

function SectionAccordion({ section, courseId, onDeleteLesson, onDeleteSection }) {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const Icon = ({ type }) => {
    const I = LESSON_ICONS[type] || BookOpen;
    return <I size={14} color="#9ca3af" />;
  };

  return (
    <div style={{ border: "1px solid #e5e7eb", borderRadius: 10, overflow: "hidden", marginBottom: 8 }}>
      <button onClick={() => setOpen(v => !v)}
        style={{ width: "100%", display: "flex", alignItems: "center", justifyContent: "space-between",
          padding: "13px 16px", background: open ? "#f0f9fb" : "#f8fafc", border: "none", cursor: "pointer" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <ChevronDown size={15} color={BRAND} style={{ transform: open ? "rotate(180deg)" : "none", transition: "0.2s" }} />
          <span style={{ fontFamily: "'Montserrat', sans-serif", fontSize: 14, fontWeight: 700, color: "#1a1a1a" }}>
            {section.title}
          </span>
          <span style={{ fontSize: 11, color: "#9ca3af" }}>{section.lessons?.length || 0} lessons</span>
        </div>
        <button onClick={e => { e.stopPropagation(); onDeleteSection(section._id); }}
          style={{ padding: "4px 8px", borderRadius: 6, border: "none", background: "#fee2e2", color: "#dc2626", cursor: "pointer", fontSize: 11 }}>
          <Trash2 size={12} />
        </button>
      </button>
      {open && (
        <div style={{ padding: "8px 16px 12px" }}>
          {section.lessons?.length === 0 && (
            <p style={{ fontSize: 12, color: "#9ca3af", margin: "8px 0" }}>No lessons yet.</p>
          )}
          {section.lessons?.map((lesson) => (
            <div key={lesson._id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between",
              padding: "9px 12px", borderRadius: 8, background: "#f8fafc", marginBottom: 6 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <Icon type={lesson.type} />
                <span style={{ fontSize: 13, color: "#374151" }}>{lesson.title}</span>
                <span style={{ fontSize: 10, fontWeight: 700, padding: "2px 7px", borderRadius: 20,
                  background: "#e8f4f8", color: BRAND, textTransform: "uppercase" }}>{lesson.type}</span>
                {lesson.isFreePreview && (
                  <span style={{ fontSize: 10, fontWeight: 700, padding: "2px 7px", borderRadius: 20,
                    background: "#dcfce7", color: "#15803d" }}>Preview</span>
                )}
                {lesson.type === "video" && lesson.videoDuration > 0 && (
                  <span style={{ fontSize: 11, color: "#9ca3af", display: "flex", alignItems: "center", gap: 3 }}>
                    <Clock size={10} /> {Math.round(lesson.videoDuration / 60)}m
                  </span>
                )}
              </div>
              <button onClick={() => onDeleteLesson(section._id, lesson._id)}
                style={{ padding: "4px 8px", borderRadius: 6, border: "none", background: "#fee2e2",
                  color: "#dc2626", cursor: "pointer" }}>
                <Trash2 size={12} />
              </button>
            </div>
          ))}
          <button
            onClick={() => navigate(`/add_lesson/${courseId}/${section._id}`)}
            style={{ marginTop: 6, display: "flex", alignItems: "center", gap: 5,
              padding: "7px 12px", borderRadius: 8, border: `1.5px dashed ${BRAND}`,
              background: "transparent", color: BRAND, fontSize: 12, fontWeight: 600, cursor: "pointer" }}>
            <Plus size={13} /> Add Lesson
          </button>
        </div>
      )}
    </div>
  );
}

export default function ReviewCourse() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { course, loading, getCourseById, reviewCourse, deleteLesson, deleteSection } = useCourseAdminStore();
  const [note, setNote] = useState("");
  const [showNoteFor, setShowNoteFor] = useState(null); // "approve" | "reject"
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => { getCourseById(id); }, [id]);

  const handleAction = async (action) => {
    setActionLoading(true);
    try {
      await reviewCourse(id, action, note);
      toast.success(`Course ${action}d successfully`);
      setShowNoteFor(null);
      setNote("");
      getCourseById(id);
    } catch (e) {
      toast.error(e.message);
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteLesson = async (sectionId, lessonId) => {
    if (!confirm("Delete this lesson?")) return;
    try {
      await deleteLesson(id, sectionId, lessonId);
      toast.success("Lesson deleted");
      getCourseById(id);
    } catch (e) { toast.error(e.message); }
  };

  const handleDeleteSection = async (sectionId) => {
    if (!confirm("Delete this section and all its lessons?")) return;
    try {
      await deleteSection(id, sectionId);
      toast.success("Section deleted");
      getCourseById(id);
    } catch (e) { toast.error(e.message); }
  };

  if (loading || !course) return (
    <div style={{ padding: 60, textAlign: "center", color: "#9ca3af", fontFamily: "'Poppins', sans-serif" }}>
      <div style={{ width: 36, height: 36, borderRadius: "50%", border: `3px solid ${BRAND}`,
        borderTopColor: "transparent", animation: "spin 0.8s linear infinite", margin: "0 auto 12px" }} />
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
      <p>Loading course…</p>
    </div>
  );

  const status = STATUS_STYLE[course.approvalStatus] || STATUS_STYLE.draft;
  const avgRating = course.ratingCount > 0 ? (course.totalRating / course.ratingCount).toFixed(1) : null;

  return (
    <div style={{ fontFamily: "'Poppins', sans-serif", padding: 24, maxWidth: 1100, margin: "0 auto" }}>

      {/* Back + Header */}
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 24 }}>
        <button onClick={() => navigate("/manage_courses")}
          style={{ display: "flex", alignItems: "center", gap: 5, padding: "8px 14px",
            borderRadius: 9, border: "1.5px solid #e5e7eb", background: "#fff",
            fontSize: 13, cursor: "pointer", color: "#374151" }}>
          <ArrowLeft size={14} /> Back
        </button>
        <div>
          <h1 style={{ fontFamily: "'Montserrat', sans-serif", fontSize: 20, fontWeight: 800, margin: 0, color: "#1a1a1a" }}>
            Course Review
          </h1>
        </div>
        <span style={{ marginLeft: "auto", fontSize: 12, fontWeight: 700, padding: "4px 12px",
          borderRadius: 20, background: status.bg, color: status.color }}>
          {status.label}
        </span>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 320px", gap: 24, alignItems: "flex-start" }}>

        {/* ── Left: Course Info + Curriculum ── */}
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>

          {/* Course overview card */}
          <div style={{ background: "#fff", border: "1px solid #e5e7eb", borderRadius: 14, overflow: "hidden" }}>
            {course.thumbnail && (
              <img src={course.thumbnail} alt={course.title}
                style={{ width: "100%", height: 200, objectFit: "cover" }} />
            )}
            <div style={{ padding: "20px 22px" }}>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 10 }}>
                <span style={{ fontSize: 11, fontWeight: 700, padding: "3px 9px", borderRadius: 20,
                  background: course.courseType === "stem" ? "#e8f4f8" : "#edf7f0",
                  color: course.courseType === "stem" ? BRAND : "#0A7431", textTransform: "uppercase" }}>
                  {course.courseType}
                </span>
                <span style={{ fontSize: 11, fontWeight: 600, padding: "3px 9px", borderRadius: 20,
                  background: "#f3f4f6", color: "#6b7280" }}>{course.category}</span>
                <span style={{ fontSize: 11, fontWeight: 600, padding: "3px 9px", borderRadius: 20,
                  background: "#f3f4f6", color: "#6b7280" }}>{course.level}</span>
              </div>

              <h2 style={{ fontFamily: "'Montserrat', sans-serif", fontSize: 18, fontWeight: 800,
                color: "#1a1a1a", margin: "0 0 8px" }}>{course.title}</h2>
              {course.subtitle && <p style={{ margin: "0 0 10px", fontSize: 14, color: "#6b7280" }}>{course.subtitle}</p>}
              <p style={{ margin: "0 0 16px", fontSize: 13, color: "#374151", lineHeight: 1.7 }}>{course.description}</p>

              {/* Stats */}
              <div style={{ display: "flex", gap: 20, flexWrap: "wrap", padding: "12px 0", borderTop: "1px solid #f3f4f6" }}>
                {[
                  { icon: Users,   val: course.totalStudents || 0,    label: "Students" },
                  { icon: BookOpen, val: course.totalLessons || 0,    label: "Lessons"  },
                  { icon: Clock,   val: `${Math.round((course.totalDuration||0)/60)}m`, label: "Duration" },
                  ...(avgRating ? [{ icon: Star, val: avgRating, label: `(${course.ratingCount} reviews)` }] : []),
                ].map(({ icon: Icon, val, label }) => (
                  <span key={label} style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 12, color: "#374151" }}>
                    <Icon size={14} color={BRAND} /> <strong>{val}</strong> {label}
                  </span>
                ))}
                {course.isFree ? (
                  <span style={{ fontSize: 12, fontWeight: 700, color: "#15803d" }}>Free</span>
                ) : (
                  <span style={{ fontSize: 13, fontWeight: 700, color: BRAND }}>₦{course.price?.toLocaleString()}</span>
                )}
              </div>

              {/* Instructor */}
              {course.instructor && (
                <div style={{ marginTop: 12, padding: "12px", background: "#f8fafc", borderRadius: 10 }}>
                  <p style={{ margin: "0 0 3px", fontSize: 11, color: "#9ca3af", textTransform: "uppercase", fontWeight: 700 }}>Instructor</p>
                  <p style={{ margin: 0, fontSize: 13, fontWeight: 600, color: "#1a1a1a" }}>
                    {course.instructor.displayName}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* What you'll learn */}
          {course.whatYouWillLearn?.length > 0 && (
            <div style={{ background: "#fff", border: "1px solid #e5e7eb", borderRadius: 14, padding: "18px 20px" }}>
              <h3 style={{ fontFamily: "'Montserrat', sans-serif", fontSize: 15, fontWeight: 700, margin: "0 0 12px" }}>
                What Students Will Learn
              </h3>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px,1fr))", gap: 8 }}>
                {course.whatYouWillLearn.map((item, i) => (
                  <div key={i} style={{ display: "flex", gap: 8, alignItems: "flex-start" }}>
                    <CheckCircle size={14} color={BRAND} style={{ flexShrink: 0, marginTop: 2 }} />
                    <span style={{ fontSize: 13, color: "#374151" }}>{item}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Curriculum */}
          <div style={{ background: "#fff", border: "1px solid #e5e7eb", borderRadius: 14, padding: "18px 20px" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
              <h3 style={{ fontFamily: "'Montserrat', sans-serif", fontSize: 15, fontWeight: 700, margin: 0 }}>
                Curriculum ({course.sections?.length || 0} sections)
              </h3>
              <button onClick={() => navigate(`/add_section_to_course/${id}`)}
                style={{ display: "flex", alignItems: "center", gap: 5, padding: "7px 14px",
                  borderRadius: 8, border: `1.5px solid ${BRAND}`, background: "transparent",
                  color: BRAND, fontSize: 12, fontWeight: 700, cursor: "pointer" }}>
                <Plus size={13} /> Add Section
              </button>
            </div>
            {course.sections?.length === 0 ? (
              <p style={{ fontSize: 13, color: "#9ca3af" }}>No sections yet.</p>
            ) : (
              course.sections.map((section) => (
                <SectionAccordion
                  key={section._id}
                  section={section}
                  courseId={id}
                  onDeleteLesson={handleDeleteLesson}
                  onDeleteSection={handleDeleteSection}
                />
              ))
            )}
          </div>
        </div>

        {/* ── Right: Action panel ── */}
        <div style={{ position: "sticky", top: 90, display: "flex", flexDirection: "column", gap: 16 }}>

          {/* Admin review note */}
          {course.reviewNote && (
            <div style={{ padding: "14px 16px", background: "#fef3c7", border: "1px solid #fde68a", borderRadius: 12 }}>
              <p style={{ margin: "0 0 4px", fontSize: 11, fontWeight: 700, color: "#92400e", textTransform: "uppercase" }}>Admin Note</p>
              <p style={{ margin: 0, fontSize: 13, color: "#92400e" }}>{course.reviewNote}</p>
            </div>
          )}

          {/* Submitted date */}
          {course.submittedForReviewAt && (
            <div style={{ padding: "12px 14px", background: "#f8fafc", border: "1px solid #e5e7eb", borderRadius: 10 }}>
              <p style={{ margin: "0 0 3px", fontSize: 11, color: "#9ca3af", fontWeight: 700, textTransform: "uppercase" }}>Submitted for Review</p>
              <p style={{ margin: 0, fontSize: 13, color: "#374151" }}>
                {new Date(course.submittedForReviewAt).toLocaleDateString("en-NG", { day: "numeric", month: "short", year: "numeric" })}
              </p>
            </div>
          )}

          {/* Action card */}
          <div style={{ background: "#fff", border: "1px solid #e5e7eb", borderRadius: 14, padding: "20px" }}>
            <h3 style={{ fontFamily: "'Montserrat', sans-serif", fontSize: 14, fontWeight: 700, margin: "0 0 16px" }}>
              Review Decision
            </h3>

            {/* Note input */}
            {showNoteFor && (
              <div style={{ marginBottom: 14 }}>
                <label style={{ fontSize: 12, fontWeight: 600, color: "#374151", display: "block", marginBottom: 6 }}>
                  {showNoteFor === "reject" ? "Reason for rejection (required)" : "Note for instructor (optional)"}
                </label>
                <textarea
                  value={note}
                  onChange={e => setNote(e.target.value)}
                  rows={3}
                  placeholder="Write a note…"
                  style={{ width: "100%", padding: "9px 12px", border: "1.5px solid #e5e7eb",
                    borderRadius: 8, fontSize: 13, resize: "vertical", outline: "none", boxSizing: "border-box" }}
                />
              </div>
            )}

            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {/* Approve */}
              {["pending_review", "rejected", "unpublished"].includes(course.approvalStatus) && (
                <button
                  onClick={() => showNoteFor === "approve" ? handleAction("approve") : setShowNoteFor("approve")}
                  disabled={actionLoading}
                  style={{ width: "100%", display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                    padding: "12px", borderRadius: 10, border: "none",
                    background: "linear-gradient(135deg, #0A7431, #37B44A)",
                    color: "#fff", fontFamily: "'Montserrat', sans-serif", fontSize: 14, fontWeight: 700, cursor: "pointer" }}>
                  <CheckCircle size={15} /> {showNoteFor === "approve" ? "Confirm Approve" : "Approve & Publish"}
                </button>
              )}

              {/* Reject */}
              {["pending_review", "approved", "published"].includes(course.approvalStatus) && (
                <button
                  onClick={() => showNoteFor === "reject" ? (note ? handleAction("reject") : toast.error("Please provide a reason")) : setShowNoteFor("reject")}
                  disabled={actionLoading}
                  style={{ width: "100%", display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                    padding: "12px", borderRadius: 10, border: "none",
                    background: "#fee2e2", color: "#dc2626",
                    fontFamily: "'Montserrat', sans-serif", fontSize: 14, fontWeight: 700, cursor: "pointer" }}>
                  <XCircle size={15} /> {showNoteFor === "reject" ? "Confirm Reject" : "Reject"}
                </button>
              )}

              {/* Unpublish */}
              {course.approvalStatus === "published" && (
                <button
                  onClick={() => handleAction("unpublish")}
                  disabled={actionLoading}
                  style={{ width: "100%", padding: "12px", borderRadius: 10, border: "1.5px solid #e5e7eb",
                    background: "#fff", color: "#6b7280", fontFamily: "'Montserrat', sans-serif",
                    fontSize: 13, fontWeight: 600, cursor: "pointer" }}>
                  Unpublish
                </button>
              )}

              {showNoteFor && (
                <button onClick={() => { setShowNoteFor(null); setNote(""); }}
                  style={{ padding: "8px", border: "none", background: "transparent", color: "#9ca3af",
                    fontSize: 12, cursor: "pointer" }}>
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
