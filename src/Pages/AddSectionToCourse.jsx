// src/Pages/AddSectionToCourse.jsx
import React, { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useCourseAdminStore } from "../Store/courseAdminStore";
import toast from "react-hot-toast";
import {
  ArrowLeft, Plus, Trash2, ChevronDown, GripVertical,
  Video, FileText, HelpCircle, Upload, X, Check,
  Eye, EyeOff, Download, Clock, Pencil, Save,
  PlayCircle, BookOpen, CheckCircle,
} from "lucide-react";

const BRAND  = "#0C6F89";
const DARK   = "#084d63";

// ─── Helpers ──────────────────────────────────────────────────────────────────

const LESSON_ICONS = {
  video: { icon: Video,       color: "#0C6F89", bg: "#e8f4f8", label: "Video"  },
  pdf:   { icon: FileText,    color: "#b45309", bg: "#fef3c7", label: "PDF"    },
  quiz:  { icon: HelpCircle,  color: "#7c3aed", bg: "#ede9fe", label: "Quiz"   },
};

function fmtDuration(secs) {
  if (!secs) return "";
  const m = Math.floor(secs / 60), s = secs % 60;
  return `${m}:${String(s).padStart(2, "0")}`;
}

// ─── Add Lesson Modal ─────────────────────────────────────────────────────────

function AddLessonModal({ courseId, sectionId, onClose, onSaved }) {
  const { addLesson, loading } = useCourseAdminStore();
  const [type, setType]               = useState("video");
  const [title, setTitle]             = useState("");
  const [description, setDescription] = useState("");
  const [isFreePreview, setFreePreview] = useState(false);
  const [isDownloadable, setDownloadable] = useState(true);
  const [videoFile, setVideoFile]     = useState(null);
  const [pdfFile, setPdfFile]         = useState(null);
  const [videoDuration, setVideoDuration] = useState(0);
  const [passingScore, setPassingScore] = useState(50);
  const [timeLimitMins, setTimeLimitMins] = useState(0);
  const [questions, setQuestions]     = useState([
    { question: "", options: [
        { label: "A", text: "" },
        { label: "B", text: "" },
        { label: "C", text: "" },
        { label: "D", text: "" },
      ], correctAnswer: "A", explanation: "", points: 1 }
  ]);

  const videoRef = useRef(null);

  // Auto-detect video duration
  const handleVideoFile = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setVideoFile(file);
    const url = URL.createObjectURL(file);
    const vid = document.createElement("video");
    vid.src = url;
    vid.onloadedmetadata = () => {
      setVideoDuration(Math.round(vid.duration));
      URL.revokeObjectURL(url);
    };
  };

  const addQuestion = () => setQuestions(q => [...q, {
    question: "", options: [
      { label: "A", text: "" }, { label: "B", text: "" },
      { label: "C", text: "" }, { label: "D", text: "" },
    ], correctAnswer: "A", explanation: "", points: 1
  }]);

  const removeQuestion = (i) => setQuestions(q => q.filter((_, j) => j !== i));

  const updateQuestion = (i, key, val) => setQuestions(q =>
    q.map((item, j) => j === i ? { ...item, [key]: val } : item)
  );

  const updateOption = (qi, label, val) => setQuestions(q =>
    q.map((item, j) => j === qi ? {
      ...item,
      options: item.options.map(o => o.label === label ? { ...o, text: val } : o)
    } : item)
  );

  const handleSubmit = async () => {
    if (!title.trim()) { toast.error("Lesson title is required"); return; }
    if (type === "video" && !videoFile) { toast.error("Please upload a video file"); return; }
    if (type === "pdf"   && !pdfFile)   { toast.error("Please upload a PDF file");   return; }
    if (type === "quiz"  && questions.some(q => !q.question.trim())) {
      toast.error("All quiz questions must have text"); return;
    }

    const fd = new FormData();
    fd.append("title",         title);
    fd.append("type",          type);
    fd.append("description",   description);
    fd.append("isFreePreview", isFreePreview);

    if (type === "video") {
      fd.append("video",         videoFile);
      fd.append("videoDuration", videoDuration);
    }
    if (type === "pdf") {
      fd.append("pdf",           pdfFile);
      fd.append("isDownloadable", isDownloadable);
    }
    if (type === "quiz") {
      fd.append("questions",     JSON.stringify(questions));
      fd.append("passingScore",  passingScore);
      fd.append("timeLimitMins", timeLimitMins);
    }

    try {
      await addLesson(courseId, sectionId, fd);
      toast.success("Lesson added successfully");
      onSaved();
      onClose();
    } catch (e) {
      toast.error(e.message || "Failed to add lesson");
    }
  };

  const inputCls = {
    width: "100%", padding: "9px 12px", border: "1.5px solid #e5e7eb",
    borderRadius: 8, fontSize: 13, outline: "none", boxSizing: "border-box",
    fontFamily: "'Poppins', sans-serif",
  };

  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 999, display: "flex", alignItems: "center", justifyContent: "center" }}>
      {/* Backdrop */}
      <div onClick={onClose} style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.5)" }} />

      {/* Modal */}
      <div style={{
        position: "relative", zIndex: 1, background: "#fff", borderRadius: 16,
        width: "min(680px, 95vw)", maxHeight: "90vh", overflowY: "auto",
        boxShadow: "0 24px 60px rgba(0,0,0,0.2)",
      }}>
        {/* Header */}
        <div style={{ padding: "20px 24px 16px", borderBottom: "1px solid #f3f4f6",
          display: "flex", alignItems: "center", justifyContent: "space-between",
          position: "sticky", top: 0, background: "#fff", zIndex: 2 }}>
          <h2 style={{ fontFamily: "'Montserrat', sans-serif", fontSize: 16, fontWeight: 800, margin: 0 }}>
            Add New Lesson
          </h2>
          <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", padding: 4 }}>
            <X size={18} color="#6b7280" />
          </button>
        </div>

        <div style={{ padding: "20px 24px" }}>

          {/* Lesson type selector */}
          <div style={{ marginBottom: 20 }}>
            <label style={{ fontSize: 12, fontWeight: 700, color: "#374151", display: "block",
              marginBottom: 8, textTransform: "uppercase", letterSpacing: "0.06em" }}>
              Content Type
            </label>
            <div style={{ display: "flex", gap: 10 }}>
              {Object.entries(LESSON_ICONS).map(([t, { icon: Icon, color, bg, label }]) => (
                <button key={t} onClick={() => setType(t)} style={{
                  flex: 1, display: "flex", flexDirection: "column", alignItems: "center",
                  gap: 6, padding: "12px 8px", borderRadius: 10,
                  border: `2px solid ${type === t ? color : "#e5e7eb"}`,
                  background: type === t ? bg : "#fff",
                  cursor: "pointer", transition: "all 0.15s",
                }}>
                  <Icon size={20} color={type === t ? color : "#9ca3af"} />
                  <span style={{ fontSize: 12, fontWeight: 700,
                    color: type === t ? color : "#9ca3af" }}>{label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Title */}
          <div style={{ marginBottom: 14 }}>
            <label style={{ fontSize: 12, fontWeight: 700, color: "#374151", display: "block",
              marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.06em" }}>
              Lesson Title *
            </label>
            <input value={title} onChange={e => setTitle(e.target.value)}
              placeholder={`e.g. ${type === "video" ? "Introduction to Newton's Laws" : type === "pdf" ? "Chapter 1 Study Notes" : "Practice Quiz: Forces"}`}
              style={inputCls} />
          </div>

          {/* Description */}
          <div style={{ marginBottom: 14 }}>
            <label style={{ fontSize: 12, fontWeight: 700, color: "#374151", display: "block",
              marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.06em" }}>
              Description (optional)
            </label>
            <textarea value={description} onChange={e => setDescription(e.target.value)}
              rows={2} placeholder="Brief description of this lesson…"
              style={{ ...inputCls, resize: "vertical" }} />
          </div>

          {/* Free preview toggle */}
          <div style={{ marginBottom: 20, display: "flex", alignItems: "center", gap: 10 }}>
            <button onClick={() => setFreePreview(v => !v)} style={{
              width: 40, height: 22, borderRadius: 11, border: "none", cursor: "pointer",
              background: isFreePreview ? BRAND : "#d1d5db",
              position: "relative", transition: "background 0.2s", flexShrink: 0,
            }}>
              <div style={{
                width: 16, height: 16, borderRadius: "50%", background: "#fff",
                position: "absolute", top: 3,
                left: isFreePreview ? 21 : 3, transition: "left 0.2s",
              }} />
            </button>
            <div>
              <p style={{ margin: 0, fontSize: 13, fontWeight: 600, color: "#374151" }}>Free Preview</p>
              <p style={{ margin: 0, fontSize: 11, color: "#9ca3af" }}>Students can view this without enrolling</p>
            </div>
          </div>

          {/* ── VIDEO ── */}
          {type === "video" && (
            <div style={{ marginBottom: 16 }}>
              <label style={{ fontSize: 12, fontWeight: 700, color: "#374151", display: "block",
                marginBottom: 8, textTransform: "uppercase", letterSpacing: "0.06em" }}>
                Video File *
              </label>
              <label style={{
                display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
                border: "2px dashed #e5e7eb", borderRadius: 10, padding: "20px 16px",
                cursor: "pointer", background: videoFile ? "#f0f9fb" : "#fafafa",
                transition: "all 0.2s",
              }}>
                <input type="file" accept="video/*" onChange={handleVideoFile} style={{ display: "none" }} />
                {videoFile ? (
                  <div style={{ textAlign: "center" }}>
                    <PlayCircle size={28} color={BRAND} style={{ marginBottom: 6 }} />
                    <p style={{ margin: "0 0 3px", fontSize: 13, fontWeight: 600, color: "#1a1a1a" }}>{videoFile.name}</p>
                    <p style={{ margin: 0, fontSize: 11, color: "#9ca3af" }}>
                      {(videoFile.size / 1024 / 1024).toFixed(1)} MB
                      {videoDuration > 0 && ` · ${fmtDuration(videoDuration)}`}
                    </p>
                  </div>
                ) : (
                  <>
                    <Upload size={24} color="#9ca3af" style={{ marginBottom: 8 }} />
                    <p style={{ margin: 0, fontSize: 13, color: "#9ca3af" }}>Click to upload video</p>
                    <p style={{ margin: "4px 0 0", fontSize: 11, color: "#d1d5db" }}>MP4, MOV, AVI — max 2GB</p>
                  </>
                )}
              </label>
            </div>
          )}

          {/* ── PDF ── */}
          {type === "pdf" && (
            <div style={{ marginBottom: 16 }}>
              <label style={{ fontSize: 12, fontWeight: 700, color: "#374151", display: "block",
                marginBottom: 8, textTransform: "uppercase", letterSpacing: "0.06em" }}>
                PDF File *
              </label>
              <label style={{
                display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
                border: "2px dashed #e5e7eb", borderRadius: 10, padding: "20px 16px",
                cursor: "pointer", background: pdfFile ? "#fffbeb" : "#fafafa",
              }}>
                <input type="file" accept=".pdf" onChange={e => setPdfFile(e.target.files?.[0])} style={{ display: "none" }} />
                {pdfFile ? (
                  <div style={{ textAlign: "center" }}>
                    <FileText size={28} color="#b45309" style={{ marginBottom: 6 }} />
                    <p style={{ margin: "0 0 3px", fontSize: 13, fontWeight: 600, color: "#1a1a1a" }}>{pdfFile.name}</p>
                    <p style={{ margin: 0, fontSize: 11, color: "#9ca3af" }}>{(pdfFile.size / 1024).toFixed(0)} KB</p>
                  </div>
                ) : (
                  <>
                    <Upload size={24} color="#9ca3af" style={{ marginBottom: 8 }} />
                    <p style={{ margin: 0, fontSize: 13, color: "#9ca3af" }}>Click to upload PDF</p>
                  </>
                )}
              </label>
              {/* Downloadable toggle */}
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginTop: 12 }}>
                <button onClick={() => setDownloadable(v => !v)} style={{
                  width: 40, height: 22, borderRadius: 11, border: "none", cursor: "pointer",
                  background: isDownloadable ? BRAND : "#d1d5db",
                  position: "relative", transition: "background 0.2s", flexShrink: 0,
                }}>
                  <div style={{
                    width: 16, height: 16, borderRadius: "50%", background: "#fff",
                    position: "absolute", top: 3,
                    left: isDownloadable ? 21 : 3, transition: "left 0.2s",
                  }} />
                </button>
                <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <Download size={14} color={isDownloadable ? BRAND : "#9ca3af"} />
                  <span style={{ fontSize: 13, fontWeight: 600, color: "#374151" }}>
                    Downloadable
                  </span>
                  <span style={{ fontSize: 11, color: "#9ca3af" }}>
                    — students can download this PDF
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* ── QUIZ ── */}
          {type === "quiz" && (
            <div style={{ marginBottom: 16 }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 16 }}>
                <div>
                  <label style={{ fontSize: 12, fontWeight: 700, color: "#374151", display: "block", marginBottom: 6 }}>
                    Passing Score (%)
                  </label>
                  <input type="number" value={passingScore} onChange={e => setPassingScore(e.target.value)}
                    min={0} max={100} style={inputCls} />
                </div>
                <div>
                  <label style={{ fontSize: 12, fontWeight: 700, color: "#374151", display: "block", marginBottom: 6 }}>
                    Time Limit (mins, 0 = no limit)
                  </label>
                  <input type="number" value={timeLimitMins} onChange={e => setTimeLimitMins(e.target.value)}
                    min={0} style={inputCls} />
                </div>
              </div>

              {/* Questions */}
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
                <label style={{ fontSize: 12, fontWeight: 700, color: "#374151",
                  textTransform: "uppercase", letterSpacing: "0.06em" }}>
                  Questions ({questions.length})
                </label>
                <button onClick={addQuestion} style={{
                  display: "flex", alignItems: "center", gap: 5, padding: "6px 12px",
                  borderRadius: 7, border: "none", background: BRAND, color: "#fff",
                  fontSize: 12, fontWeight: 700, cursor: "pointer",
                }}>
                  <Plus size={13} /> Add Question
                </button>
              </div>

              {questions.map((q, qi) => (
                <div key={qi} style={{ background: "#f8fafc", border: "1px solid #e5e7eb",
                  borderRadius: 10, padding: "14px 16px", marginBottom: 10 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
                    <span style={{ fontSize: 11, fontWeight: 700, color: BRAND,
                      background: "#e8f4f8", padding: "2px 8px", borderRadius: 20 }}>
                      Q{qi + 1}
                    </span>
                    <input value={q.question} onChange={e => updateQuestion(qi, "question", e.target.value)}
                      placeholder="Enter question text…"
                      style={{ ...inputCls, flex: 1 }} />
                    {questions.length > 1 && (
                      <button onClick={() => removeQuestion(qi)} style={{
                        background: "#fee2e2", border: "none", borderRadius: 6,
                        padding: "6px 8px", cursor: "pointer", flexShrink: 0,
                      }}>
                        <Trash2 size={13} color="#dc2626" />
                      </button>
                    )}
                  </div>

                  {/* Options */}
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 10 }}>
                    {q.options.map(opt => (
                      <div key={opt.label} style={{ display: "flex", alignItems: "center", gap: 6 }}>
                        <button onClick={() => updateQuestion(qi, "correctAnswer", opt.label)} style={{
                          width: 26, height: 26, borderRadius: "50%", flexShrink: 0,
                          border: `2px solid ${q.correctAnswer === opt.label ? BRAND : "#d1d5db"}`,
                          background: q.correctAnswer === opt.label ? BRAND : "#fff",
                          cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
                          fontSize: 11, fontWeight: 700,
                          color: q.correctAnswer === opt.label ? "#fff" : "#9ca3af",
                        }}>
                          {opt.label}
                        </button>
                        <input value={opt.text} onChange={e => updateOption(qi, opt.label, e.target.value)}
                          placeholder={`Option ${opt.label}`}
                          style={{ ...inputCls, flex: 1 }} />
                      </div>
                    ))}
                  </div>

                  <input value={q.explanation} onChange={e => updateQuestion(qi, "explanation", e.target.value)}
                    placeholder="Explanation (shown after answering) — optional"
                    style={{ ...inputCls, fontSize: 12 }} />
                </div>
              ))}
            </div>
          )}

          {/* Footer buttons */}
          <div style={{ display: "flex", gap: 10, justifyContent: "flex-end",
            paddingTop: 16, borderTop: "1px solid #f3f4f6" }}>
            <button onClick={onClose} style={{
              padding: "10px 20px", borderRadius: 9, border: "1.5px solid #e5e7eb",
              background: "#fff", fontSize: 13, fontWeight: 600, cursor: "pointer", color: "#6b7280",
            }}>
              Cancel
            </button>
            <button onClick={handleSubmit} disabled={loading} style={{
              display: "flex", alignItems: "center", gap: 7, padding: "10px 22px",
              borderRadius: 9, border: "none",
              background: loading ? "#9ca3af" : `linear-gradient(135deg, ${DARK}, ${BRAND})`,
              color: "#fff", fontFamily: "'Montserrat', sans-serif",
              fontSize: 13, fontWeight: 700, cursor: loading ? "not-allowed" : "pointer",
            }}>
              {loading ? "Saving…" : <><Check size={14} /> Add Lesson</>}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Lesson Row ───────────────────────────────────────────────────────────────

function LessonRow({ lesson, courseId, sectionId, onDeleted, onRefresh }) {
  const { deleteLesson } = useCourseAdminStore();
  const [deleting, setDeleting] = useState(false);
  const meta = LESSON_ICONS[lesson.type] || LESSON_ICONS.video;
  const Icon = meta.icon;

  const handleDelete = async () => {
    if (!confirm(`Delete "${lesson.title}"?`)) return;
    setDeleting(true);
    try {
      await deleteLesson(courseId, sectionId, lesson._id);
      toast.success("Lesson deleted");
      onDeleted();
    } catch (e) {
      toast.error(e.message);
      setDeleting(false);
    }
  };

  return (
    <div style={{
      display: "flex", alignItems: "center", gap: 10,
      padding: "10px 14px", borderRadius: 9,
      background: "#fff", border: "1px solid #f3f4f6",
      marginBottom: 6, transition: "border-color 0.2s",
    }}
      onMouseEnter={e => e.currentTarget.style.borderColor = "#e5e7eb"}
      onMouseLeave={e => e.currentTarget.style.borderColor = "#f3f4f6"}
    >
      {/* Drag handle */}
      <GripVertical size={14} color="#d1d5db" style={{ flexShrink: 0, cursor: "grab" }} />

      {/* Type icon */}
      <div style={{ width: 30, height: 30, borderRadius: 7, background: meta.bg,
        display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
        <Icon size={14} color={meta.color} />
      </div>

      {/* Title + meta */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{ margin: 0, fontSize: 13, fontWeight: 600, color: "#1a1a1a",
          whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
          {lesson.title}
        </p>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 2 }}>
          <span style={{ fontSize: 10, fontWeight: 700, padding: "1px 7px", borderRadius: 20,
            background: meta.bg, color: meta.color, textTransform: "uppercase" }}>
            {meta.label}
          </span>
          {lesson.isFreePreview && (
            <span style={{ fontSize: 10, fontWeight: 700, padding: "1px 7px", borderRadius: 20,
              background: "#dcfce7", color: "#15803d" }}>
              Free Preview
            </span>
          )}
          {lesson.type === "pdf" && lesson.isDownloadable && (
            <span style={{ fontSize: 10, fontWeight: 700, padding: "1px 7px", borderRadius: 20,
              background: "#fef3c7", color: "#b45309", display: "flex", alignItems: "center", gap: 3 }}>
              <Download size={9} /> Downloadable
            </span>
          )}
          {lesson.type === "video" && lesson.videoDuration > 0 && (
            <span style={{ fontSize: 10, color: "#9ca3af", display: "flex", alignItems: "center", gap: 3 }}>
              <Clock size={9} /> {fmtDuration(lesson.videoDuration)}
            </span>
          )}
          {lesson.type === "quiz" && lesson.questions?.length > 0 && (
            <span style={{ fontSize: 10, color: "#9ca3af" }}>
              {lesson.questions.length} question{lesson.questions.length !== 1 ? "s" : ""}
            </span>
          )}
        </div>
      </div>

      {/* Delete */}
      <button onClick={handleDelete} disabled={deleting} style={{
        padding: "6px 8px", borderRadius: 7, border: "none",
        background: "#fee2e2", color: "#dc2626", cursor: "pointer", flexShrink: 0,
      }}>
        <Trash2 size={13} />
      </button>
    </div>
  );
}

// ─── Section Card ─────────────────────────────────────────────────────────────

function SectionCard({ section, courseId, onRefresh, index }) {
  const { deleteSection } = useCourseAdminStore();
  const [open, setOpen]               = useState(true);
  const [showAddLesson, setShowAdd]   = useState(false);
  const [editingTitle, setEditTitle]  = useState(false);
  const [titleVal, setTitleVal]       = useState(section.title);

  const totalDuration = section.lessons
    .filter(l => l.type === "video")
    .reduce((acc, l) => acc + (l.videoDuration || 0), 0);

  const handleDeleteSection = async () => {
    if (!confirm(`Delete section "${section.title}" and all its lessons?`)) return;
    try {
      await deleteSection(courseId, section._id);
      toast.success("Section deleted");
      onRefresh();
    } catch (e) { toast.error(e.message); }
  };

  return (
    <div style={{
      background: "#fff", border: "1.5px solid #e5e7eb", borderRadius: 14,
      overflow: "hidden", marginBottom: 14,
    }}>
      {/* Section header */}
      <div style={{
        display: "flex", alignItems: "center", gap: 10,
        padding: "14px 18px", background: "#f8fafc",
        borderBottom: open ? "1px solid #e5e7eb" : "none",
      }}>
        <GripVertical size={16} color="#d1d5db" style={{ cursor: "grab", flexShrink: 0 }} />

        {/* Section number badge */}
        <div style={{ width: 28, height: 28, borderRadius: 7, background: "#e8f4f8",
          display: "flex", alignItems: "center", justifyContent: "center",
          fontFamily: "'Montserrat', sans-serif", fontSize: 12, fontWeight: 800, color: BRAND, flexShrink: 0 }}>
          {index + 1}
        </div>

        {/* Editable title */}
        {editingTitle ? (
          <input value={titleVal} onChange={e => setTitleVal(e.target.value)}
            autoFocus
            onBlur={() => setEditTitle(false)}
            onKeyDown={e => { if (e.key === "Enter") setEditTitle(false); }}
            style={{ flex: 1, padding: "5px 10px", border: "1.5px solid #0C6F89",
              borderRadius: 7, fontSize: 14, fontWeight: 700, outline: "none",
              fontFamily: "'Montserrat', sans-serif" }} />
        ) : (
          <div style={{ flex: 1, display: "flex", alignItems: "center", gap: 8, minWidth: 0 }}>
            <span style={{ fontFamily: "'Montserrat', sans-serif", fontSize: 14, fontWeight: 700,
              color: "#1a1a1a", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
              {section.title}
            </span>
            <button onClick={() => setEditTitle(true)} style={{
              background: "none", border: "none", cursor: "pointer", padding: 2, flexShrink: 0 }}>
              <Pencil size={12} color="#9ca3af" />
            </button>
          </div>
        )}

        {/* Meta */}
        <div style={{ display: "flex", alignItems: "center", gap: 10, flexShrink: 0 }}>
          <span style={{ fontSize: 11, color: "#9ca3af" }}>
            {section.lessons.length} lesson{section.lessons.length !== 1 ? "s" : ""}
            {totalDuration > 0 && ` · ${fmtDuration(totalDuration)}`}
          </span>

          {/* Collapse toggle */}
          <button onClick={() => setOpen(v => !v)} style={{
            background: "none", border: "none", cursor: "pointer", padding: 4 }}>
            <ChevronDown size={16} color="#6b7280"
              style={{ transform: open ? "rotate(180deg)" : "none", transition: "0.2s" }} />
          </button>

          {/* Delete section */}
          <button onClick={handleDeleteSection} style={{
            padding: "5px 7px", borderRadius: 6, border: "none",
            background: "#fee2e2", color: "#dc2626", cursor: "pointer" }}>
            <Trash2 size={13} />
          </button>
        </div>
      </div>

      {/* Lessons */}
      {open && (
        <div style={{ padding: "12px 18px 14px" }}>
          {section.lessons.length === 0 ? (
            <p style={{ fontSize: 13, color: "#9ca3af", margin: "0 0 10px", textAlign: "center",
              padding: "16px 0", borderRadius: 8, background: "#f8fafc", border: "1px dashed #e5e7eb" }}>
              No lessons yet — add your first content below.
            </p>
          ) : (
            section.lessons
              .slice()
              .sort((a, b) => a.order - b.order)
              .map(lesson => (
                <LessonRow
                  key={lesson._id}
                  lesson={lesson}
                  courseId={courseId}
                  sectionId={section._id}
                  onDeleted={onRefresh}
                  onRefresh={onRefresh}
                />
              ))
          )}

          {/* Add lesson button */}
          <button
            onClick={() => setShowAdd(true)}
            style={{
              width: "100%", display: "flex", alignItems: "center", justifyContent: "center",
              gap: 7, padding: "9px 16px", borderRadius: 9,
              border: `1.5px dashed ${BRAND}`, background: "transparent",
              color: BRAND, fontSize: 13, fontWeight: 700, cursor: "pointer",
              transition: "background 0.15s",
            }}
            onMouseEnter={e => e.currentTarget.style.background = "#e8f4f8"}
            onMouseLeave={e => e.currentTarget.style.background = "transparent"}
          >
            <Plus size={14} /> Add Lesson
          </button>
        </div>
      )}

      {/* Add lesson modal */}
      {showAddLesson && (
        <AddLessonModal
          courseId={courseId}
          sectionId={section._id}
          onClose={() => setShowAdd(false)}
          onSaved={onRefresh}
        />
      )}
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function AddSectionToCourse() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { course, loading, getCourseById, addSection } = useCourseAdminStore();

  const [newSectionTitle, setNewSectionTitle] = useState("");
  const [addingSection, setAddingSection]     = useState(false);
  const [showSectionInput, setShowSectionInput] = useState(false);

  const refresh = () => getCourseById(id);

  useEffect(() => { refresh(); }, [id]);

  const handleAddSection = async () => {
    if (!newSectionTitle.trim()) { toast.error("Section title is required"); return; }
    setAddingSection(true);
    try {
      await addSection(id, { title: newSectionTitle });
      toast.success("Section added");
      setNewSectionTitle("");
      setShowSectionInput(false);
      refresh();
    } catch (e) {
      toast.error(e.message || "Failed to add section");
    } finally {
      setAddingSection(false);
    }
  };

  if (loading && !course) return (
    <div style={{ padding: 60, textAlign: "center", color: "#9ca3af", fontFamily: "'Poppins', sans-serif" }}>
      <div style={{ width: 36, height: 36, borderRadius: "50%", border: `3px solid ${BRAND}`,
        borderTopColor: "transparent", animation: "spin 0.8s linear infinite", margin: "0 auto 12px" }} />
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
      <p>Loading curriculum…</p>
    </div>
  );

  const sections = course?.sections || [];
  const totalLessons  = sections.reduce((a, s) => a + s.lessons.length, 0);
  const totalVideos   = sections.reduce((a, s) => a + s.lessons.filter(l => l.type === "video").length, 0);
  const totalPDFs     = sections.reduce((a, s) => a + s.lessons.filter(l => l.type === "pdf").length, 0);
  const totalQuizzes  = sections.reduce((a, s) => a + s.lessons.filter(l => l.type === "quiz").length, 0);
  const totalDuration = sections.reduce((a, s) =>
    a + s.lessons.filter(l => l.type === "video").reduce((b, l) => b + (l.videoDuration || 0), 0), 0);

  return (
    <div style={{ fontFamily: "'Poppins', sans-serif", padding: 24, maxWidth: 900, margin: "0 auto" }}>

      {/* Back + header */}
      <div style={{ display: "flex", alignItems: "flex-start", gap: 14, marginBottom: 28 }}>
        <button onClick={() => navigate(`/review_course/${id}`)}
          style={{ display: "flex", alignItems: "center", gap: 5, padding: "9px 14px",
            borderRadius: 9, border: "1.5px solid #e5e7eb", background: "#fff",
            fontSize: 13, cursor: "pointer", color: "#374151", flexShrink: 0, marginTop: 2 }}>
          <ArrowLeft size={14} /> Back
        </button>
        <div style={{ flex: 1 }}>
          <h1 style={{ fontFamily: "'Montserrat', sans-serif", fontSize: 20, fontWeight: 800,
            color: "#1a1a1a", margin: "0 0 4px" }}>
            Course Curriculum
          </h1>
          {course && (
            <p style={{ margin: 0, fontSize: 13, color: "#6b7280" }}>
              <strong style={{ color: "#1a1a1a" }}>{course.title}</strong>
              {" "}·{" "}
              <span style={{ textTransform: "capitalize", color: course.courseType === "stem" ? BRAND : "#0A7431",
                fontWeight: 600 }}>{course.courseType}</span>
            </p>
          )}
        </div>
      </div>

      {/* Stats */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(130px, 1fr))",
        gap: 12, marginBottom: 24 }}>
        {[
          { icon: BookOpen,    val: sections.length, label: "Sections",  color: BRAND   },
          { icon: PlayCircle,  val: totalVideos,     label: "Videos",    color: BRAND   },
          { icon: FileText,    val: totalPDFs,       label: "PDFs",      color: "#b45309" },
          { icon: HelpCircle,  val: totalQuizzes,    label: "Quizzes",   color: "#7c3aed" },
          { icon: Clock,       val: totalDuration > 0 ? fmtDuration(totalDuration) : "0:00",
                                                     label: "Duration",  color: "#6b7280" },
        ].map(({ icon: Icon, val, label, color }) => (
          <div key={label} style={{ background: "#fff", border: "1px solid #e5e7eb",
            borderRadius: 10, padding: "12px 14px", textAlign: "center" }}>
            <Icon size={18} color={color} style={{ marginBottom: 4 }} />
            <p style={{ margin: 0, fontFamily: "'Montserrat', sans-serif", fontSize: 18,
              fontWeight: 800, color: "#1a1a1a" }}>{val}</p>
            <p style={{ margin: 0, fontSize: 10, color: "#9ca3af" }}>{label}</p>
          </div>
        ))}
      </div>

      {/* Section list */}
      {sections.length === 0 ? (
        <div style={{ textAlign: "center", padding: "40px 24px", background: "#fff",
          border: "1.5px dashed #e5e7eb", borderRadius: 14, marginBottom: 16 }}>
          <BookOpen size={36} color="#e5e7eb" style={{ marginBottom: 12 }} />
          <p style={{ fontFamily: "'Montserrat', sans-serif", fontSize: 15, fontWeight: 700,
            color: "#1a1a1a", margin: "0 0 6px" }}>
            No sections yet
          </p>
          <p style={{ fontSize: 13, color: "#9ca3af", margin: 0 }}>
            Add your first section to start building the curriculum.
          </p>
        </div>
      ) : (
        sections
          .slice()
          .sort((a, b) => a.order - b.order)
          .map((section, i) => (
            <SectionCard
              key={section._id}
              section={section}
              courseId={id}
              index={i}
              onRefresh={refresh}
            />
          ))
      )}

      {/* Add section */}
      {showSectionInput ? (
        <div style={{ background: "#fff", border: `1.5px solid ${BRAND}`, borderRadius: 14,
          padding: "16px 18px", display: "flex", gap: 10, alignItems: "center" }}>
          <BookOpen size={18} color={BRAND} style={{ flexShrink: 0 }} />
          <input
            autoFocus
            value={newSectionTitle}
            onChange={e => setNewSectionTitle(e.target.value)}
            onKeyDown={e => { if (e.key === "Enter") handleAddSection(); if (e.key === "Escape") { setShowSectionInput(false); setNewSectionTitle(""); } }}
            placeholder="New section title — press Enter to save"
            style={{ flex: 1, padding: "9px 12px", border: "1.5px solid #e5e7eb",
              borderRadius: 8, fontSize: 14, fontWeight: 600, outline: "none",
              fontFamily: "'Montserrat', sans-serif" }}
          />
          <button onClick={handleAddSection} disabled={addingSection} style={{
            display: "flex", alignItems: "center", gap: 5, padding: "9px 16px",
            borderRadius: 8, border: "none", background: BRAND, color: "#fff",
            fontSize: 13, fontWeight: 700, cursor: "pointer", flexShrink: 0,
          }}>
            <Check size={14} /> {addingSection ? "Saving…" : "Add"}
          </button>
          <button onClick={() => { setShowSectionInput(false); setNewSectionTitle(""); }} style={{
            padding: "9px 10px", borderRadius: 8, border: "1.5px solid #e5e7eb",
            background: "#fff", cursor: "pointer", flexShrink: 0,
          }}>
            <X size={14} color="#6b7280" />
          </button>
        </div>
      ) : (
        <button
          onClick={() => setShowSectionInput(true)}
          style={{
            width: "100%", display: "flex", alignItems: "center", justifyContent: "center",
            gap: 8, padding: "14px", borderRadius: 12,
            border: `2px dashed ${BRAND}`, background: "transparent",
            color: BRAND, fontFamily: "'Montserrat', sans-serif",
            fontSize: 14, fontWeight: 700, cursor: "pointer",
            transition: "background 0.15s",
          }}
          onMouseEnter={e => e.currentTarget.style.background = "#e8f4f8"}
          onMouseLeave={e => e.currentTarget.style.background = "transparent"}
        >
          <Plus size={16} /> Add New Section
        </button>
      )}
    </div>
  );
}
