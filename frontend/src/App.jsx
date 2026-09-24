import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';

// Pages
import { LandingPage } from './pages/LandingPage';
import { CourseCatalog } from './pages/CourseCatalog';
import { CourseDetail } from './pages/CourseDetail';
import { Login } from './pages/Login';
import { Register } from './pages/Register';
import { VerifyCertificate } from './pages/VerifyCertificate';
import { Profile } from './pages/Profile';

// Student
import { StudentDashboard } from './pages/student/StudentDashboard';
import { MyLearning } from './pages/student/MyLearning';
import { LearningRoom } from './pages/student/LearningRoom';
import { CertificatesPage } from './pages/student/CertificatesPage';

// Instructor
import { InstructorDashboard } from './pages/instructor/InstructorDashboard';
import { MyCourses } from './pages/instructor/MyCourses';
import { CreateEditCourse } from './pages/instructor/CreateEditCourse';
import { GradeSubmissions } from './pages/instructor/GradeSubmissions';

// Admin
import { AdminDashboard } from './pages/admin/AdminDashboard';
import { UserManagement } from './pages/admin/UserManagement';
import { CategoryManagement } from './pages/admin/CategoryManagement';

// Protected Route Guard
const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, loading, isAuthenticated } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950">
        <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    if (user.role === 'instructor') return <Navigate to="/instructor/dashboard" replace />;
    if (user.role === 'admin') return <Navigate to="/admin/dashboard" replace />;
    return <Navigate to="/student/dashboard" replace />;
  }

  return children;
};

// Layout wrapper to hide Navbar/Footer on distraction-free /learn/:id route
const Layout = ({ children }) => {
  const location = useLocation();
  const isLearnRoom = location.pathname.startsWith('/learn/');

  return (
    <div className="min-h-screen flex flex-col bg-slate-950 text-slate-100 selection:bg-indigo-500 selection:text-white">
      {!isLearnRoom && <Navbar />}
      <main className="flex-1">{children}</main>
      {!isLearnRoom && <Footer />}
    </div>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Layout>
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<LandingPage />} />
            <Route path="/courses" element={<CourseCatalog />} />
            <Route path="/courses/:id" element={<CourseDetail />} />
            <Route path="/verify" element={<VerifyCertificate />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />

            {/* Student Protected Routes */}
            <Route
              path="/student/dashboard"
              element={
                <ProtectedRoute allowedRoles={['student', 'admin']}>
                  <StudentDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/student/my-learning"
              element={
                <ProtectedRoute allowedRoles={['student', 'admin']}>
                  <MyLearning />
                </ProtectedRoute>
              }
            />
            <Route
              path="/student/certificates"
              element={
                <ProtectedRoute allowedRoles={['student', 'admin']}>
                  <CertificatesPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/learn/:courseId"
              element={
                <ProtectedRoute>
                  <LearningRoom />
                </ProtectedRoute>
              }
            />

            {/* Instructor Protected Routes */}
            <Route
              path="/instructor/dashboard"
              element={
                <ProtectedRoute allowedRoles={['instructor', 'admin']}>
                  <InstructorDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/instructor/courses"
              element={
                <ProtectedRoute allowedRoles={['instructor', 'admin']}>
                  <MyCourses />
                </ProtectedRoute>
              }
            />
            <Route
              path="/instructor/courses/new"
              element={
                <ProtectedRoute allowedRoles={['instructor', 'admin']}>
                  <CreateEditCourse />
                </ProtectedRoute>
              }
            />
            <Route
              path="/instructor/courses/edit/:id"
              element={
                <ProtectedRoute allowedRoles={['instructor', 'admin']}>
                  <CreateEditCourse />
                </ProtectedRoute>
              }
            />
            <Route
              path="/instructor/grading"
              element={
                <ProtectedRoute allowedRoles={['instructor', 'admin']}>
                  <GradeSubmissions />
                </ProtectedRoute>
              }
            />

            {/* Admin Protected Routes */}
            <Route
              path="/admin/dashboard"
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <AdminDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/users"
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <UserManagement />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/categories"
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <CategoryManagement />
                </ProtectedRoute>
              }
            />

            {/* Common Authenticated Profile */}
            <Route
              path="/profile"
              element={
                <ProtectedRoute>
                  <Profile />
                </ProtectedRoute>
              }
            />

            {/* Fallback */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Layout>
      </BrowserRouter>
    </AuthProvider>
  );
}
