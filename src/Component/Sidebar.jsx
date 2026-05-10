// src/Component/Sidebar.jsx
import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { useStaffstore } from "../Store/staffStore";
import {
  LayoutDashboard, ChevronDown, ChevronRight,
  ShieldCheck, Users, PenLine, BookOpen, FileText,
  Newspaper, CreditCard, Settings, LogOut,
  GraduationCap, UserCheck, Plus, List,
  ClipboardList, FlaskConical, Eye, Tag,
} from "lucide-react";

const BRAND = "#0C6F89";
const DARK  = "#084d63";

const NAV = [
  {
    title: "Overview",
    items: [
      { label: "Dashboard", path: "/home", icon: LayoutDashboard },
    ],
  },
  {
    title: "Role & Staff",
    items: [
      { label: "Add Role",         path: "/add_role",  icon: ShieldCheck },
      { label: "Add Staff",        path: "/add_staff", icon: Plus        },
      { label: "Staff Management", path: "/staff",     icon: Users       },
    ],
  },
  {
    title: "CBT Management",
    items: [
      { label: "Add Subject",            path: "/add_subject",          icon: Tag           },
      { label: "Add Topic",              path: "/add_topic",            icon: Tag           },
      { label: "Add Question",           path: "/add_question",         icon: Plus          },
      { label: "Questions",              path: "/questions",            icon: ClipboardList },
      { label: "Create Exam",            path: "/add_exam",             icon: PenLine       },
      { label: "Add Year",               path: "/add_year",             icon: Plus          },
      { label: "Manage Exams",           path: "/manage_exam",          icon: List          },
      { label: "Years & Subjects",       path: "/manage_years_subjects", icon: Settings     },
      { label: "Visibility Control",     path: "/visibility_control",   icon: Eye           },
    ],
  },
  {
    title: "Course Management",
    items: [
      { label: "All Courses",       path: "/manage_courses",      icon: BookOpen      },
      { label: "Create STEM Course",path: "/create_stem_course",  icon: FlaskConical  },
      { label: "Manage Interests",  path: "/interests",           icon: Tag           },
    ],
  },
  {
    title: "Instructor Management",
    items: [
      { label: "All Instructors",  path: "/manage_instructors", icon: UserCheck     },
    ],
  },
  {
    title: "Blog Management",
    items: [
      { label: "Create Post",  path: "/create_blog",  icon: Plus      },
      { label: "Manage Posts", path: "/manage_post",  icon: Newspaper },
    ],
  },
  {
    title: "Plans",
    items: [
      { label: "Manage Plans", path: "/plans", icon: CreditCard },
    ],
  },
];

function NavItem({ item, active }) {
  const Icon = item.icon;
  return (
    <Link
      to={item.path}
      style={{
        display: "flex", alignItems: "center", gap: 10,
        padding: "9px 12px", borderRadius: 10,
        textDecoration: "none",
        background: active ? BRAND : "transparent",
        color: active ? "#fff" : "#4b5563",
        fontFamily: "'Poppins', sans-serif",
        fontSize: 13, fontWeight: active ? 600 : 400,
        transition: "all 0.15s",
        marginBottom: 2,
      }}
      onMouseEnter={e => { if (!active) { e.currentTarget.style.background = "#e8f4f8"; e.currentTarget.style.color = BRAND; } }}
      onMouseLeave={e => { if (!active) { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "#4b5563"; } }}
    >
      <div style={{
        width: 30, height: 30, borderRadius: 8, flexShrink: 0,
        display: "flex", alignItems: "center", justifyContent: "center",
        background: active ? "rgba(255,255,255,0.2)" : "#f3f4f6",
        transition: "background 0.15s",
      }}>
        <Icon size={15} color={active ? "#fff" : BRAND} strokeWidth={1.8} />
      </div>
      <span style={{ flex: 1, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
        {item.label}
      </span>
      {active && <ChevronRight size={13} color="rgba(255,255,255,0.7)" />}
    </Link>
  );
}

function NavSection({ section, currentPath }) {
  const hasActive = section.items.some(i => currentPath === i.path);
  const [open, setOpen] = useState(hasActive || section.title === "Overview");

  return (
    <div style={{ marginBottom: 4 }}>
      {section.title !== "Overview" && (
        <button
          onClick={() => setOpen(v => !v)}
          style={{
            width: "100%", display: "flex", alignItems: "center", justifyContent: "space-between",
            padding: "7px 12px", background: "transparent", border: "none",
            cursor: "pointer", borderRadius: 8,
          }}
        >
          <span style={{ fontSize: 10, fontWeight: 700, color: "#9ca3af",
            textTransform: "uppercase", letterSpacing: "0.09em" }}>
            {section.title}
          </span>
          <ChevronDown size={13} color="#9ca3af"
            style={{ transform: open ? "rotate(180deg)" : "none", transition: "0.2s" }} />
        </button>
      )}
      {open && (
        <div style={{ marginTop: 2 }}>
          {section.items.map(item => (
            <NavItem key={item.path} item={item} active={currentPath === item.path} />
          ))}
        </div>
      )}
    </div>
  );
}

export default function Sidebar() {
  const location  = useLocation();
  const { logout, user } = useStaffstore();

  const initials = (user?.fullName || "A")
    .split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase();

  return (
    <aside style={{
      width: "100%", height: "100%",
      background: "#fff",
      borderRight: "1px solid #e5e7eb",
      display: "flex", flexDirection: "column",
      fontFamily: "'Poppins', sans-serif",
      overflowY: "auto",
    }}>
      {/* User chip */}
      <div style={{ padding: "16px 14px", borderBottom: "1px solid #f3f4f6" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 12px",
          background: "#f8fafc", borderRadius: 12 }}>
          {user?.profilePic ? (
            <img src={user.profilePic} alt="" style={{ width: 34, height: 34, borderRadius: "50%", objectFit: "cover" }} />
          ) : (
            <div style={{ width: 34, height: 34, borderRadius: "50%",
              background: `linear-gradient(135deg, ${DARK}, ${BRAND})`,
              display: "flex", alignItems: "center", justifyContent: "center",
              fontFamily: "'Montserrat', sans-serif", fontSize: 12, fontWeight: 700, color: "#fff" }}>
              {initials}
            </div>
          )}
          <div style={{ flex: 1, minWidth: 0 }}>
            <p style={{ margin: 0, fontSize: 12, fontWeight: 700, color: "#1a1a1a",
              whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
              {user?.fullName || "Admin"}
            </p>
            <p style={{ margin: 0, fontSize: 10, color: "#9ca3af" }}>
              {user?.jobTitle || "Staff"}
            </p>
          </div>
          <Link to="/profile" style={{ padding: 5, borderRadius: 6, background: "#e8f4f8", display: "flex" }}>
            <Settings size={13} color={BRAND} />
          </Link>
        </div>
      </div>

      {/* Navigation */}
      <nav style={{ flex: 1, padding: "12px 10px", overflowY: "auto" }}>
        {NAV.map(section => (
          <NavSection key={section.title} section={section} currentPath={location.pathname} />
        ))}
      </nav>

      {/* Logout */}
      <div style={{ padding: "12px 10px", borderTop: "1px solid #f3f4f6" }}>
        <button
          onClick={logout}
          style={{
            width: "100%", display: "flex", alignItems: "center", gap: 10,
            padding: "10px 12px", borderRadius: 10, border: "none",
            background: "transparent", cursor: "pointer",
            fontFamily: "'Poppins', sans-serif", fontSize: 13, color: "#ef4444",
            transition: "background 0.15s",
          }}
          onMouseEnter={e => e.currentTarget.style.background = "#fef2f2"}
          onMouseLeave={e => e.currentTarget.style.background = "transparent"}
        >
          <div style={{ width: 30, height: 30, borderRadius: 8, background: "#fef2f2",
            display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
            <LogOut size={15} color="#ef4444" />
          </div>
          Logout
        </button>
      </div>
    </aside>
  );
}
