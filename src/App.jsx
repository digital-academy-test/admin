// src/App.jsx
import "bootstrap/dist/css/bootstrap.min.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import React, { useState } from "react";
import { Toaster } from "react-hot-toast";

// ── Layout ────────────────────────────────────────────────────────────────────
import Header  from "./Component/Header";
import Sidebar from "./Component/Sidebar";
import Login   from "./Pages/login";
import ProtectedRoute  from "./Component/ProtectedRoute";
import { useIdleLogout } from "./hooks/useIdleLogout";

// ── Existing pages ────────────────────────────────────────────────────────────
import Home                   from "./Pages/Home";
import AddRole                from "./Pages/AddRole";
import AddStaff               from "./Pages/AddStaff";
import AddSubject             from "./Pages/AddSubject";
import AddTopic               from "./Pages/AddTopic";
import AddQuestion            from "./Pages/AddQuestion";
import AddCourse              from "./Pages/AddCourse";
import AddSection             from "./Pages/Addsection";
import Courses                from "./Pages/Course";
import ManageInterests        from "./Pages/ManageInterests";
import Question               from "./Pages/Question";
import ManageQuestion         from "./Pages/ManageQuestion";
import CreatePost             from "./Pages/CreatePost";
import ManageBlogs            from "./Pages/ManageBlogs";
import EditCourse             from "./Pages/EditCourse";
import InstructorCourseView   from "./Pages/InstructorCourseView";
import InstructorSectionView  from "./Pages/InstructorSectionView";
import PlansAdmin             from "./Pages/PlansAdmin";
import StaffManagement        from "./Pages/Staffmanagement";
import StaffProfile           from "./Pages/profile";
import CreateExam             from "./Pages/CreateExam";
import AddYear                from "./Pages/Addyear";
import ManageExams            from "./Pages/ManageExams";
import EditExam               from "./Pages/EditExam";
import BlogDetail             from "./Pages/BlogDetail";
import ManageYearsAndSubjects from "./Pages/ManageYearsAndSubjects";
import VisibilityControl      from "./Pages/VisibilityControl";
import EditQuestion           from "./Pages/EditQuestion";

// ── NEW pages ─────────────────────────────────────────────────────────────────
import AddSectionToCourse from "./Pages/AddSectionToCourse";
import ManageCourses     from "./Pages/ManageCourses";
import ReviewCourse      from "./Pages/ReviewCourse";
import CreateStemCourse  from "./Pages/CreateStemCourse";
import ManageInstructors from "./Pages/ManageInstructors";
import ReviewInstructor  from "./Pages/ReviewInstructor";

// ── Constants ─────────────────────────────────────────────────────────────────
const HEADER_H  = 56;  // px — matches Bootstrap py-2 nav (~56px)
const SIDEBAR_W = 260; // px — desktop sidebar width

// ─────────────────────────────────────────────────────────────────────────────

function Layout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  useIdleLogout(10 * 60 * 1000);

  return (
    <div style={{ minHeight: "100vh", background: "#f0f4f8" }}>
      <Toaster position="top-right" />

      {/* ── Fixed Header ── */}
      <Header onToggleSidebar={() => setSidebarOpen(v => !v)} />

      {/* ── Below header ── */}
      <div style={{ display: "flex", paddingTop: HEADER_H }}>

        {/* ── Desktop Sidebar (always visible, fixed left) ── */}
        <aside style={{
          position:   "fixed",
          top:        HEADER_H,
          left:       0,
          width:      SIDEBAR_W,
          height:     `calc(100vh - ${HEADER_H}px)`,
          overflowY:  "auto",
          zIndex:     200,
          background: "#fff",
          borderRight:"1px solid #e5e7eb",
          // hidden on mobile
          display:    "none",
        }} className="admin-sidebar-desktop">
          <Sidebar />
        </aside>

        {/* ── Mobile Sidebar drawer (slides in from left) ── */}
        <aside style={{
          position:   "fixed",
          top:        HEADER_H,
          left:       sidebarOpen ? 0 : -SIDEBAR_W,
          width:      SIDEBAR_W,
          height:     `calc(100vh - ${HEADER_H}px)`,
          overflowY:  "auto",
          zIndex:     500,
          background: "#fff",
          borderRight:"1px solid #e5e7eb",
          transition: "left 0.25s ease",
          // only for mobile
          display:    "none",
        }} className="admin-sidebar-mobile">
          <Sidebar />
        </aside>

        {/* ── Mobile backdrop ── */}
        {sidebarOpen && (
          <div
            onClick={() => setSidebarOpen(false)}
            style={{
              position: "fixed", inset: 0,
              background: "rgba(0,0,0,0.4)",
              zIndex: 499,
            }}
            className="admin-sidebar-backdrop"
          />
        )}

        {/* ── Main content ── */}
        <main style={{
          flex:       1,
          minWidth:   0,
          // on desktop, push content right of the sidebar
          marginLeft: 0,
          minHeight:  `calc(100vh - ${HEADER_H}px)`,
          overflowX:  "hidden",
        }} className="admin-main-content">
          <Routes>

            {/* ── Home & Profile ─────────────────────────────────────── */}
            <Route path="/home"    element={<ProtectedRoute><Home /></ProtectedRoute>} />
            <Route path="/profile" element={<ProtectedRoute><StaffProfile /></ProtectedRoute>} />

            {/* ── Role Management ────────────────────────────────────── */}
            <Route path="/add_role" element={
              <ProtectedRoute requiredFeature="Add Role"><AddRole /></ProtectedRoute>
            } />

            {/* ── Staff Management ───────────────────────────────────── */}
            <Route path="/add_staff" element={
              <ProtectedRoute requiredFeature="Add Staff"><AddStaff /></ProtectedRoute>
            } />
            <Route path="/staff" element={
              <ProtectedRoute requiredFeature="Staff Management"><StaffManagement /></ProtectedRoute>
            } />

            {/* ── CBT Management ─────────────────────────────────────── */}
            <Route path="/add_subject" element={
              <ProtectedRoute requiredFeature="Add Subject"><AddSubject /></ProtectedRoute>
            } />
            <Route path="/add_topic" element={
              <ProtectedRoute requiredFeature="Add Topic"><AddTopic /></ProtectedRoute>
            } />
            <Route path="/add_question" element={
              <ProtectedRoute requiredFeature="Add Question"><AddQuestion /></ProtectedRoute>
            } />
            <Route path="/questions" element={
              <ProtectedRoute requiredFeature="Questions Management"><Question /></ProtectedRoute>
            } />
            <Route path="/manage_question" element={
              <ProtectedRoute requiredFeature="Questions Management"><ManageQuestion /></ProtectedRoute>
            } />
            <Route path="/edit_question/:id" element={
              <ProtectedRoute requiredFeature="Questions Management"><EditQuestion /></ProtectedRoute>
            } />
            <Route path="/add_exam" element={
              <ProtectedRoute requiredFeature="Create Exam"><CreateExam /></ProtectedRoute>
            } />
            <Route path="/add_year" element={
              <ProtectedRoute requiredFeature="Add Year"><AddYear /></ProtectedRoute>
            } />
            <Route path="/manage_exam" element={
              <ProtectedRoute requiredFeature="Manage Exams"><ManageExams /></ProtectedRoute>
            } />
            <Route path="/edit_exam/:examId" element={
              <ProtectedRoute requiredFeature="Manage Exams"><EditExam /></ProtectedRoute>
            } />
            <Route path="/manage_years_subjects" element={
              <ProtectedRoute requiredFeature="Manage Years and Subjects"><VisibilityControl /></ProtectedRoute>
            } />
            <Route path="/visibility_control" element={
              <ProtectedRoute requiredFeature="Manage Years and Subjects"><ManageYearsAndSubjects /></ProtectedRoute>
            } />

            {/* ── Course Management (NEW) ─────────────────────────────── */}
            <Route path="/manage_courses" element={
              <ProtectedRoute requiredFeature="Courses"><ManageCourses /></ProtectedRoute>
            } />
            <Route path="/review_course/:id" element={
              <ProtectedRoute requiredFeature="Courses"><ReviewCourse /></ProtectedRoute>
            } />
            <Route path="/add_section_to_course/:id" element={
              <ProtectedRoute requiredFeature="Courses"><AddSectionToCourse /></ProtectedRoute>
            } />
            <Route path="/create_stem_course" element={
              <ProtectedRoute requiredFeature="Start Course"><CreateStemCourse /></ProtectedRoute>
            } />

            {/* Existing course routes (kept for backward compat) */}
            <Route path="/start_course" element={
              <ProtectedRoute requiredFeature="Start Course"><AddCourse /></ProtectedRoute>
            } />
            <Route path="/courses" element={
              <ProtectedRoute requiredFeature="Courses"><Courses /></ProtectedRoute>
            } />
            <Route path="/add_section/:id" element={
              <ProtectedRoute requiredFeature="Start Course"><AddSection /></ProtectedRoute>
            } />
            <Route path="/edit_course/:id" element={
              <ProtectedRoute requiredFeature="Courses"><EditCourse /></ProtectedRoute>
            } />
            <Route path="/course/:courseId/section/:sectionId" element={
              <ProtectedRoute requiredFeature="Courses"><InstructorSectionView /></ProtectedRoute>
            } />
            <Route path="/course/:id/stats" element={
              <ProtectedRoute requiredFeature="Courses"><InstructorCourseView /></ProtectedRoute>
            } />
            <Route path="/interests" element={
              <ProtectedRoute requiredFeature="Manage interests"><ManageInterests /></ProtectedRoute>
            } />

            {/* ── Instructor Management (NEW) ─────────────────────────── */}
            <Route path="/manage_instructors" element={
              <ProtectedRoute requiredFeature="Courses"><ManageInstructors /></ProtectedRoute>
            } />
            <Route path="/review_instructor/:id" element={
              <ProtectedRoute requiredFeature="Courses"><ReviewInstructor /></ProtectedRoute>
            } />

            {/* ── Blog Management ─────────────────────────────────────── */}
            <Route path="/create_blog" element={
              <ProtectedRoute requiredFeature="Add Blog post"><CreatePost /></ProtectedRoute>
            } />
            <Route path="/manage_post" element={
              <ProtectedRoute requiredFeature="Blog Posts"><ManageBlogs /></ProtectedRoute>
            } />
            <Route path="/blog/:id" element={
              <ProtectedRoute requiredFeature="Blog Posts"><BlogDetail /></ProtectedRoute>
            } />

            {/* ── Plans ───────────────────────────────────────────────── */}
            <Route path="/plans" element={
              <ProtectedRoute requiredFeature="Plans"><PlansAdmin /></ProtectedRoute>
            } />

            {/* ── Fallback ─────────────────────────────────────────────── */}
            <Route path="*" element={<ProtectedRoute><Home /></ProtectedRoute>} />

          </Routes>
        </main>
      </div>
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/"  element={<Login />} />
        <Route path="/*" element={<Layout />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;