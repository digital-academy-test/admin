import "bootstrap/dist/css/bootstrap.min.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import React, { useState } from "react";

import Home from "./Pages/Home";
import Header from "./Component/Header";
import Login from "./Pages/login";
import Sidebar from "./Component/Sidebar";
import AddRole from "./Pages/AddRole";
import AddStaff from "./Pages/AddStaff";
import AddSubject from "./Pages/AddSubject";
import AddTopic from "./Pages/AddTopic";
import AddQuestion from "./Pages/AddQuestion";
import AddCourse from "./Pages/AddCourse";
import ProtectedRoute from "./Component/ProtectedRoute";
import { useIdleLogout } from "./hooks/useIdleLogout";
import AddSection from "./Pages/Addsection";
import Courses from "./Pages/Course";
import ManageInterests from "./Pages/ManageInterests";
import Question from "./Pages/Question";
import ManageQuestion from "./Pages/ManageQuestion";
import CreatePost from './Pages/CreatePost'
import ManageBlogs from "./Pages/ManageBlogs";
import EditCourse from "./Pages/EditCourse";
import InstructorCourseView from "./Pages/InstructorCourseView";
import PlansAdmin from "./Pages/PlansAdmin";
import { Toaster } from "react-hot-toast";
import StaffManagement from "./Pages/Staffmanagement";
import StaffProfile from "./Pages/profile";
import CreateExam from "./Pages/CreateExam";
import AddYear from "./Pages/Addyear";
import ManageExams from "./Pages/ManageExams";
import EditExam from "./Pages/EditExam";
import BlogDetail from "./Pages/BlogDetail";
import InstructorSectionView from "./Pages/InstructorSectionView";

function Layout() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  useIdleLogout(10 * 60 * 1000); // ✅ Always safe now

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);
  const closeSidebar = () => setIsSidebarOpen(false);

  return (
    <>
    <Toaster position="top-right" />
      <Header onToggleSidebar={toggleSidebar} />
      <main className="main-container">
        <div className={`sidebar-drawer Side-menu-container ${isSidebarOpen ? "open" : ""}`}>
          <Sidebar />
        </div>

        {isSidebarOpen && (
          <div className="sidebar-backdrop" onClick={closeSidebar}></div>
        )}

        <section className="Main-content-container">
          <Routes>
            <Route path="/home" element={<ProtectedRoute><Home /></ProtectedRoute>} />
            <Route path="/add_role" element={<ProtectedRoute><AddRole /></ProtectedRoute>} />
            <Route path="/add_staff" element={<ProtectedRoute><AddStaff /></ProtectedRoute>} />
            <Route path="/add_question" element={<ProtectedRoute><AddQuestion /></ProtectedRoute>} />
             <Route path="/questions" element={<ProtectedRoute><Question /></ProtectedRoute>} />
             <Route path="/add_year" element={<ProtectedRoute><AddYear/></ProtectedRoute>} />
             <Route path="/manage_exam" element={<ProtectedRoute><ManageExams/></ProtectedRoute>} />
              <Route path="/edit_exam/:examId" element={<ProtectedRoute><EditExam/></ProtectedRoute>} />

             <Route path="/manage_question" element={<ProtectedRoute><ManageQuestion/></ProtectedRoute>} />
              <Route path="/add_exam" element={<ProtectedRoute><CreateExam/></ProtectedRoute>} />
            <Route path="/add_subject" element={<ProtectedRoute><AddSubject /></ProtectedRoute>} />
             <Route path="/staff" element={<ProtectedRoute><StaffManagement/></ProtectedRoute>} />
             <Route path="/profile" element={<ProtectedRoute><StaffProfile/></ProtectedRoute>} />
            <Route path="/add_topic" element={<ProtectedRoute><AddTopic /></ProtectedRoute>} />
            <Route path="/start_course" element={<ProtectedRoute><AddCourse /></ProtectedRoute>} />
            <Route path="/interests" element={<ProtectedRoute><ManageInterests /></ProtectedRoute>} />
            <Route path="/courses" element={<ProtectedRoute><Courses/></ProtectedRoute>} />
            <Route path="/create_blog" element={<ProtectedRoute><CreatePost/></ProtectedRoute>} />
            <Route path="/blog/:id" element={<ProtectedRoute><BlogDetail/></ProtectedRoute>} />
             <Route path="/plans" element={<ProtectedRoute><PlansAdmin/></ProtectedRoute>} />
             <Route path="/manage_post" element={<ProtectedRoute><ManageBlogs/></ProtectedRoute>} />
            <Route path="/add_section/:id" element={<ProtectedRoute><AddSection /></ProtectedRoute>} />
            <Route path="/edit_course/:id" element={<ProtectedRoute><EditCourse /></ProtectedRoute>} />
            <Route path="/course/:courseId/section/:sectionId" element={<ProtectedRoute><InstructorSectionView /></ProtectedRoute>} />
            <Route path="/course/:id/stats" element={<ProtectedRoute><InstructorCourseView /></ProtectedRoute>} />
            <Route path="*" element={<ProtectedRoute><Home /></ProtectedRoute>} />
          </Routes>
        </section>
      </main>
    </>
  );
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* 👇 Put login here instead of conditional rendering */}
        <Route path="/" element={<Login />} />
        <Route path="/*" element={<Layout />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
