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
import CreatePost from './Pages/CreatePost';
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
import ManageYearsAndSubjects from "./Pages/ManageYearsAndSubjects";
import VisibilityControl from "./Pages/VisibilityControl";

function Layout() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  useIdleLogout(10 * 60 * 1000);

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
            {/* ============================================ */}
            {/*    HOME & PROFILE (No specific feature)     */}
            {/* ============================================ */}
            <Route 
              path="/home" 
              element={
                <ProtectedRoute>
                  <Home />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/profile" 
              element={
                <ProtectedRoute>
                  <StaffProfile />
                </ProtectedRoute>
              } 
            />

            {/* ============================================ */}
            {/*           ROLE MANAGEMENT                   */}
            {/* ============================================ */}
            <Route 
              path="/add_role" 
              element={
                <ProtectedRoute requiredFeature="Add Role">
                  <AddRole />
                </ProtectedRoute>
              } 
            />

            {/* ============================================ */}
            {/*           STAFF MANAGEMENT                  */}
            {/* ============================================ */}
            <Route 
              path="/add_staff" 
              element={
                <ProtectedRoute requiredFeature="Add Staff">
                  <AddStaff />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/staff" 
              element={
                <ProtectedRoute requiredFeature="Staff Management">
                  <StaffManagement />
                </ProtectedRoute>
              } 
            />

            {/* ============================================ */}
            {/*           CBT MANAGEMENT                    */}
            {/* ============================================ */}
            <Route 
              path="/add_subject" 
              element={
                <ProtectedRoute requiredFeature="Add Subject">
                  <AddSubject />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/add_topic" 
              element={
                <ProtectedRoute requiredFeature="Add Topic">
                  <AddTopic />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/add_question" 
              element={
                <ProtectedRoute requiredFeature="Add Question">
                  <AddQuestion />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/questions" 
              element={
                <ProtectedRoute requiredFeature="Questions Management">
                  <Question />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/manage_question" 
              element={
                <ProtectedRoute requiredFeature="Questions Management">
                  <ManageQuestion />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/add_exam" 
              element={
                <ProtectedRoute requiredFeature="Create Exam">
                  <CreateExam />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/add_year" 
              element={
                <ProtectedRoute requiredFeature="Add Year">
                  <AddYear />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/manage_exam" 
              element={
                <ProtectedRoute requiredFeature="Manage Exams">
                  <ManageExams />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/edit_exam/:examId" 
              element={
                <ProtectedRoute requiredFeature="Manage Exams">
                  <EditExam />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/manage_years_subjects" 
              element={
                <ProtectedRoute requiredFeature="Manage Years and Subjects">
                  <ManageYearsAndSubjects />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/visibility_control" 
              element={
                <ProtectedRoute requiredFeature="Visibility Control">
                  <VisibilityControl />
                </ProtectedRoute>
              } 
            />

            {/* ============================================ */}
            {/*           COURSE MANAGEMENT                 */}
            {/* ============================================ */}
            <Route 
              path="/start_course" 
              element={
                <ProtectedRoute requiredFeature="Start Course">
                  <AddCourse />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/courses" 
              element={
                <ProtectedRoute requiredFeature="Courses">
                  <Courses />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/add_section/:id" 
              element={
                <ProtectedRoute requiredFeature="Start Course">
                  <AddSection />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/edit_course/:id" 
              element={
                <ProtectedRoute requiredFeature="Courses">
                  <EditCourse />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/course/:courseId/section/:sectionId" 
              element={
                <ProtectedRoute requiredFeature="Courses">
                  <InstructorSectionView />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/course/:id/stats" 
              element={
                <ProtectedRoute requiredFeature="Courses">
                  <InstructorCourseView />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/interests" 
              element={
                <ProtectedRoute requiredFeature="Manage interests">
                  <ManageInterests />
                </ProtectedRoute>
              } 
            />

            {/* ============================================ */}
            {/*           BLOG MANAGEMENT                   */}
            {/* ============================================ */}
            <Route 
              path="/create_blog" 
              element={
                <ProtectedRoute requiredFeature="Add  Blog post">
                  <CreatePost />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/manage_post" 
              element={
                <ProtectedRoute requiredFeature="Blog Posts">
                  <ManageBlogs />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/blog/:id" 
              element={
                <ProtectedRoute requiredFeature="Blog Posts">
                  <BlogDetail />
                </ProtectedRoute>
              } 
            />

            {/* ============================================ */}
            {/*           PLAN MANAGEMENT                   */}
            {/* ============================================ */}
            <Route 
              path="/plans" 
              element={
                <ProtectedRoute requiredFeature="Plans">
                  <PlansAdmin />
                </ProtectedRoute>
              } 
            />

            {/* ============================================ */}
            {/*           FALLBACK ROUTE                    */}
            {/* ============================================ */}
            <Route 
              path="*" 
              element={
                <ProtectedRoute>
                  <Home />
                </ProtectedRoute>
              } 
            />
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
        <Route path="/" element={<Login />} />
        <Route path="/*" element={<Layout />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;