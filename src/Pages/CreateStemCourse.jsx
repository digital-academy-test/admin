// src/Pages/CreateStemCourse.jsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useCourseAdminStore } from "../Store/courseAdminStore";
import { ArrowLeft, Upload, Plus, X } from "lucide-react";
import toast from "react-hot-toast";

const BRAND = "#0C6F89";

const STEM_CATEGORIES = [
  "Mathematics", "Physics", "Chemistry", "Biology", "English Language",
  "Literature", "Geography", "Economics", "Government", "Civic Education",
  "Computer Science", "Further Mathematics", "Agricultural Science",
];

function TagInput({ tags, setTags, placeholder }) {
  const [input, setInput] = useState("");
  const add = () => {
    const v = input.trim();
    if (v && !tags.includes(v)) setTags([...tags, v]);
    setInput("");
  };
  return (
    <div style={{ display: "flex", flexWrap: "wrap", gap: 6, padding: "8px 12px",
      border: "1.5px solid #e5e7eb", borderRadius: 10, background: "#fff", minHeight: 44, alignItems: "center" }}>
      {tags.map((t) => (
        <span key={t} style={{ display: "flex", alignItems: "center", gap: 4, padding: "3px 10px",
          borderRadius: 20, background: "#e8f4f8", color: BRAND, fontSize: 12, fontWeight: 600 }}>
          {t}
          <button type='button' onClick={() => setTags(tags.filter(x => x !== t))}
            style={{ background: "none", border: "none", cursor: "pointer", padding: 0, color: BRAND }}>
            <X size={11} />
          </button>
        </span>
      ))}
      <input
        value={input}
        onChange={e => setInput(e.target.value)}
        onKeyDown={e => { if (e.key === "Enter") { e.preventDefault(); add(); } }}
        placeholder={tags.length === 0 ? placeholder : ""}
        style={{ border: "none", outline: "none", fontSize: 13, flex: 1, minWidth: 80 }}
      />
    </div>
  );
}

function ListInput({ items, setItems, placeholder }) {
  const [input, setInput] = useState("");
  const add = () => {
    const v = input.trim();
    if (v) setItems([...items, v]);
    setInput("");
  };
  return (
    <div>
      {items.map((item, i) => (
        <div key={i} style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
          <div style={{ width: 6, height: 6, borderRadius: "50%", background: BRAND, flexShrink: 0 }} />
          <span style={{ flex: 1, fontSize: 13, color: "#374151" }}>{item}</span>
          <button type='button' onClick={() => setItems(items.filter((_, j) => j !== i))}
            style={{ background: "none", border: "none", cursor: "pointer", color: "#9ca3af" }}>
            <X size={13} />
          </button>
        </div>
      ))}
      <div style={{ display: "flex", gap: 8, marginTop: 6 }}>
        <input value={input} onChange={e => setInput(e.target.value)}
          onKeyDown={e => { if (e.key === "Enter") { e.preventDefault(); add(); } }}
          placeholder={placeholder}
          style={{ flex: 1, padding: "8px 12px", border: "1.5px solid #e5e7eb", borderRadius: 8,
            fontSize: 13, outline: "none" }} />
        <button type='button' onClick={add} style={{ padding: "8px 14px", borderRadius: 8, border: "none",
          background: BRAND, color: "#fff", fontSize: 12, fontWeight: 700, cursor: "pointer" }}>
          <Plus size={14} />
        </button>
      </div>
    </div>
  );
}

export default function CreateStemCourse() {
  const navigate = useNavigate();
  const { createStemCourse, loading } = useCourseAdminStore();

  const [form, setForm] = useState({
    title: "", subtitle: "", description: "", category: "",
    level: "Beginner", language: "English", price: "", isFree: false,
  });
  const [thumbnail, setThumbnail]         = useState(null);
  const [thumbnailPreview, setThumbnailPreview] = useState(null);
  const [tags, setTags]                   = useState([]);
  const [whatYouWillLearn, setWhatYouWillLearn] = useState([]);
  const [requirements, setRequirements]   = useState([]);

  const set = (key, val) => setForm(f => ({ ...f, [key]: val }));

  const handleThumbnail = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setThumbnail(file);
    setThumbnailPreview(URL.createObjectURL(file));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title || !form.description || !form.category) {
      toast.error("Title, description and category are required.");
      return;
    }
    const fd = new FormData();
    Object.entries(form).forEach(([k, v]) => fd.append(k, v));
    tags.forEach(t => fd.append("tags[]", t));
    whatYouWillLearn.forEach(w => fd.append("whatYouWillLearn[]", w));
    requirements.forEach(r => fd.append("requirements[]", r));
    if (thumbnail) fd.append("thumbnail", thumbnail);

    try {
      const course = await createStemCourse(fd);
      toast.success("STEM course created and published!");
      navigate(`/review_course/${course._id}`);
    } catch (e) {
      toast.error(e.message);
    }
  };

  const inputStyle = {
    width: "100%", padding: "10px 14px", border: "1.5px solid #e5e7eb",
    borderRadius: 10, fontSize: 14, outline: "none", boxSizing: "border-box",
    fontFamily: "'Poppins', sans-serif",
  };
  const labelStyle = {
    display: "block", fontSize: 12, fontWeight: 700, color: "#374151",
    marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.06em",
  };

  return (
    <div style={{ fontFamily: "'Poppins', sans-serif", padding: 24, maxWidth: 820, margin: "0 auto" }}>

      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 28 }}>
        <button type='button' onClick={() => navigate("/manage_courses")}
          style={{ display: "flex", alignItems: "center", gap: 5, padding: "8px 14px",
            borderRadius: 9, border: "1.5px solid #e5e7eb", background: "#fff", fontSize: 13, cursor: "pointer", color: "#374151" }}>
          <ArrowLeft size={14} /> Back
        </button>
        <div>
          <h1 style={{ fontFamily: "'Montserrat', sans-serif", fontSize: 20, fontWeight: 800, margin: 0 }}>
            Create STEM Course
          </h1>
          <p style={{ margin: 0, fontSize: 12, color: "#6b7280" }}>
            STEM courses are published immediately upon creation.
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 24 }}>

        {/* Basic Info */}
        <div style={{ background: "#fff", border: "1px solid #e5e7eb", borderRadius: 14, padding: "24px" }}>
          <h3 style={{ fontFamily: "'Montserrat', sans-serif", fontSize: 15, fontWeight: 800, margin: "0 0 20px", color: "#1a1a1a" }}>
            Course Information
          </h3>
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <div>
              <label style={labelStyle}>Title *</label>
              <input value={form.title} onChange={e => set("title", e.target.value)} style={inputStyle}
                placeholder="e.g. JAMB Physics: Complete Preparation" required />
            </div>
            <div>
              <label style={labelStyle}>Subtitle</label>
              <input value={form.subtitle} onChange={e => set("subtitle", e.target.value)} style={inputStyle}
                placeholder="A short tagline for the course" />
            </div>
            <div>
              <label style={labelStyle}>Description *</label>
              <textarea value={form.description} onChange={e => set("description", e.target.value)}
                rows={4} required
                style={{ ...inputStyle, resize: "vertical" }}
                placeholder="Describe what students will learn, who it's for, etc." />
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 14 }}>
              <div>
                <label style={labelStyle}>Category *</label>
                <select value={form.category} onChange={e => set("category", e.target.value)}
                  required style={inputStyle}>
                  <option value="">Select category</option>
                  {STEM_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label style={labelStyle}>Level</label>
                <select value={form.level} onChange={e => set("level", e.target.value)} style={inputStyle}>
                  {["Beginner", "Intermediate", "Advanced"].map(l => <option key={l}>{l}</option>)}
                </select>
              </div>
              <div>
                <label style={labelStyle}>Language</label>
                <input value={form.language} onChange={e => set("language", e.target.value)} style={inputStyle} />
              </div>
            </div>
          </div>
        </div>

        {/* Thumbnail */}
        <div style={{ background: "#fff", border: "1px solid #e5e7eb", borderRadius: 14, padding: "24px" }}>
          <h3 style={{ fontFamily: "'Montserrat', sans-serif", fontSize: 15, fontWeight: 800, margin: "0 0 16px" }}>
            Course Thumbnail
          </h3>
          <label style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
            border: "2px dashed #e5e7eb", borderRadius: 12, padding: "24px", cursor: "pointer",
            background: thumbnailPreview ? "#f0f9fb" : "#fafafa", minHeight: 160, position: "relative" }}>
            <input type="file" accept="image/*" onChange={handleThumbnail} style={{ display: "none" }} />
            {thumbnailPreview ? (
              <img src={thumbnailPreview} alt="preview" style={{ maxHeight: 200, borderRadius: 8, objectFit: "contain" }} />
            ) : (
              <>
                <Upload size={28} color="#9ca3af" style={{ marginBottom: 8 }} />
                <p style={{ margin: 0, fontSize: 13, color: "#9ca3af" }}>Click to upload thumbnail (PNG, JPG)</p>
                <p style={{ margin: "4px 0 0", fontSize: 11, color: "#d1d5db" }}>Recommended: 1280×720px</p>
              </>
            )}
          </label>
        </div>

        {/* Pricing */}
        <div style={{ background: "#fff", border: "1px solid #e5e7eb", borderRadius: 14, padding: "24px" }}>
          <h3 style={{ fontFamily: "'Montserrat', sans-serif", fontSize: 15, fontWeight: 800, margin: "0 0 16px" }}>
            Pricing
          </h3>
          <label style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14, cursor: "pointer" }}>
            <input type="checkbox" checked={form.isFree} onChange={e => set("isFree", e.target.checked)}
              style={{ width: 16, height: 16, accentColor: BRAND }} />
            <span style={{ fontSize: 14, fontWeight: 600, color: "#374151" }}>This course is free</span>
          </label>
          {!form.isFree && (
            <div>
              <label style={labelStyle}>Price (₦)</label>
              <input type="number" value={form.price} onChange={e => set("price", e.target.value)}
                style={{ ...inputStyle, maxWidth: 240 }} placeholder="e.g. 5000" min={0} />
            </div>
          )}
        </div>

        {/* What students will learn */}
        <div style={{ background: "#fff", border: "1px solid #e5e7eb", borderRadius: 14, padding: "24px" }}>
          <h3 style={{ fontFamily: "'Montserrat', sans-serif", fontSize: 15, fontWeight: 800, margin: "0 0 6px" }}>
            What Students Will Learn
          </h3>
          <p style={{ margin: "0 0 14px", fontSize: 12, color: "#9ca3af" }}>
            Add learning outcomes. Press Enter or click + to add each item.
          </p>
          <ListInput items={whatYouWillLearn} setItems={setWhatYouWillLearn}
            placeholder="e.g. Solve Newton's Laws problems" />
        </div>

        {/* Requirements */}
        <div style={{ background: "#fff", border: "1px solid #e5e7eb", borderRadius: 14, padding: "24px" }}>
          <h3 style={{ fontFamily: "'Montserrat', sans-serif", fontSize: 15, fontWeight: 800, margin: "0 0 6px" }}>
            Requirements
          </h3>
          <p style={{ margin: "0 0 14px", fontSize: 12, color: "#9ca3af" }}>Prerequisites students need.</p>
          <ListInput items={requirements} setItems={setRequirements}
            placeholder="e.g. SS1 Mathematics knowledge" />
        </div>

        {/* Tags */}
        <div style={{ background: "#fff", border: "1px solid #e5e7eb", borderRadius: 14, padding: "24px" }}>
          <h3 style={{ fontFamily: "'Montserrat', sans-serif", fontSize: 15, fontWeight: 800, margin: "0 0 6px" }}>
            Tags
          </h3>
          <p style={{ margin: "0 0 14px", fontSize: 12, color: "#9ca3af" }}>
            Add tags to help students find this course. Press Enter to add.
          </p>
          <TagInput tags={tags} setTags={setTags} placeholder="e.g. JAMB, Physics, WAEC…" />
        </div>

        {/* Submit */}
        <div style={{ display: "flex", gap: 12, justifyContent: "flex-end" }}>
          <button type="button" onClick={() => navigate("/manage_courses")}
            style={{ padding: "12px 24px", borderRadius: 10, border: "1.5px solid #e5e7eb",
              background: "#fff", fontSize: 14, fontWeight: 600, cursor: "pointer", color: "#6b7280" }}>
            Cancel
          </button>
          <button type="submit" disabled={loading}
            style={{ padding: "12px 32px", borderRadius: 10, border: "none",
              background: loading ? "#9ca3af" : `linear-gradient(135deg, #084d63, ${BRAND})`,
              color: "#fff", fontFamily: "'Montserrat', sans-serif", fontSize: 14, fontWeight: 700,
              cursor: loading ? "not-allowed" : "pointer",
              boxShadow: loading ? "none" : "0 4px 16px rgba(12,111,137,0.3)" }}>
            {loading ? "Creating…" : "Create & Publish STEM Course"}
          </button>
        </div>
      </form>
    </div>
  );
}
