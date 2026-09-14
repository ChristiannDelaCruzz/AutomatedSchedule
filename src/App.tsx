// src/App.tsx
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';
import { EnrollmentProvider } from './context/EnrollmentContext';
import { ToastContainer } from './components/ui/Toast/ToastContainer';
import { DashboardLayout } from './layouts/DashboardLayout';
import { ProtectedRoute } from './components/layout/ProtectedRoute';
import { RoleRoute } from './components/layout/RoleRoute';
import { Sections } from './pages/Admin/Sections';
import { SentEmails } from './pages/Admin/SentEmails';

// ============================================
// PUBLIC PAGES
// ============================================
import { Login } from './pages/Login/Login';
import { EnrollmentForm } from './pages/Enrollment/EnrollmentForm';
import ApplicationStatus from './pages/Enrollment/ApplicationStatus';
import { TestDepartments } from './pages/TestDepartments';

// ============================================
// DASHBOARD (smart router by role)
// ============================================
import { Dashboard } from './pages/Dashboard';

// ============================================
// ADMIN PAGES
// ============================================
import { EnrollmentReview } from './pages/Admin/EnrollmentReview';

// ============================================
// PLACEHOLDER PAGES (create these later)
// ============================================
// These are lazy-loaded placeholders for routes that will be built
import { PlaceholderPage } from './pages/Placeholder/PlaceholderPage';

function App() {
  return (
    <AuthProvider>
      <ToastProvider>
        <EnrollmentProvider>
          <BrowserRouter>
            <Routes>
              {/* ============================================ */}
              {/* PUBLIC ROUTES                                */}
              {/* ============================================ */}
              <Route path="/login" element={<Login />} />
              <Route path="/enrollment" element={<EnrollmentForm />} />
              <Route path="/enrollment/status" element={<ApplicationStatus />} />
              <Route path="/test-departments" element={<TestDepartments />} />

              {/* ============================================ */}
              {/* PROTECTED ROUTES (all authenticated users)  */}
              {/* ============================================ */}
              <Route
                element={
                  <ProtectedRoute>
                    <DashboardLayout />
                  </ProtectedRoute>
                }
              >
                {/* Dashboard - auto-routes by role */}
                <Route path="/dashboard" element={<Dashboard />} />

                {/* ============================================ */}
                {/* ACADEMIC MANAGEMENT (admin/superadmin)       */}
                {/* ============================================ */}
                <Route
                  path="/admin/programs"
                  element={
                    <RoleRoute allowedRoles={['superadmin', 'admin']}>
                      <PlaceholderPage title="Programs" />
                    </RoleRoute>
                  }
                />
                <Route
                  path="/admin/sections"
                  element={
                    <RoleRoute allowedRoles={['superadmin', 'admin']}>
                      <Sections />
                    </RoleRoute>
                  }
                />
                <Route
                  path="/admin/subjects"
                  element={
                    <RoleRoute allowedRoles={['superadmin', 'admin']}>
                      <PlaceholderPage title="Subjects / Courses" />
                    </RoleRoute>
                  }
                />
                <Route
                  path="/admin/semester-courses"
                  element={
                    <RoleRoute allowedRoles={['superadmin', 'admin']}>
                      <PlaceholderPage title="Semester Courses" />
                    </RoleRoute>
                  }
                />
                <Route
                  path="/admin/professor-assignment"
                  element={
                    <RoleRoute allowedRoles={['superadmin', 'admin']}>
                      <PlaceholderPage title="Professor Assignment" />
                    </RoleRoute>
                  }
                />
                <Route
                  path="/admin/professor-availability"
                  element={
                    <RoleRoute allowedRoles={['superadmin', 'admin']}>
                      <PlaceholderPage title="Professor Availability" />
                    </RoleRoute>
                  }
                />
                <Route
                  path="/admin/rooms"
                  element={
                    <RoleRoute allowedRoles={['superadmin', 'admin']}>
                      <PlaceholderPage title="Rooms" />
                    </RoleRoute>
                  }
                />

                <Route
                  path="/admin/sent-emails"
                  element={
                    <RoleRoute allowedRoles={['superadmin', 'admin', 'staff']}>
                      <SentEmails />
                    </RoleRoute>
                  }
                />

                {/* ============================================ */}
                {/* SCHEDULING                                   */}
                {/* ============================================ */}
                <Route
                  path="/scheduling/generator"
                  element={
                    <RoleRoute allowedRoles={['superadmin', 'admin']}>
                      <PlaceholderPage title="Automatic Schedule Generator" />
                    </RoleRoute>
                  }
                />
                <Route
                  path="/scheduling/class"
                  element={
                    <RoleRoute allowedRoles={['superadmin', 'admin', 'staff']}>
                      <PlaceholderPage title="Class Schedule" />
                    </RoleRoute>
                  }
                />
                <Route
                  path="/scheduling/professor"
                  element={
                    <RoleRoute allowedRoles={['superadmin', 'admin', 'staff']}>
                      <PlaceholderPage title="Professor Schedule" />
                    </RoleRoute>
                  }
                />
                <Route
                  path="/scheduling/room"
                  element={
                    <RoleRoute allowedRoles={['superadmin', 'admin', 'staff']}>
                      <PlaceholderPage title="Room Schedule" />
                    </RoleRoute>
                  }
                />
                <Route
                  path="/scheduling/exam"
                  element={
                    <RoleRoute allowedRoles={['superadmin', 'admin']}>
                      <PlaceholderPage title="Exam Schedule" />
                    </RoleRoute>
                  }
                />
                <Route
                  path="/scheduling/event"
                  element={
                    <RoleRoute allowedRoles={['superadmin', 'admin']}>
                      <PlaceholderPage title="Event Schedule" />
                    </RoleRoute>
                  }
                />
                <Route
                  path="/scheduling/conflicts"
                  element={
                    <RoleRoute allowedRoles={['superadmin', 'admin']}>
                      <PlaceholderPage title="Conflicts" />
                    </RoleRoute>
                  }
                />

                {/* ============================================ */}
                {/* ENROLLMENT                                   */}
                {/* ============================================ */}
                <Route
                  path="/admin/enrollments"
                  element={
                    <RoleRoute allowedRoles={['superadmin', 'admin', 'staff']}>
                      <EnrollmentReview />
                    </RoleRoute>
                  }
                />
                <Route
                  path="/admin/enrolled-students"
                  element={
                    <RoleRoute allowedRoles={['superadmin', 'admin', 'staff']}>
                      <PlaceholderPage title="Enrolled Students" />
                    </RoleRoute>
                  }
                />
                <Route
                  path="/admin/section-capacity"
                  element={
                    <RoleRoute allowedRoles={['superadmin', 'admin', 'staff']}>
                      <PlaceholderPage title="Section Capacity" />
                    </RoleRoute>
                  }
                />

                {/* ============================================ */}
                {/* USERS (superadmin/admin)                     */}
                {/* ============================================ */}
                <Route
                  path="/users/students"
                  element={
                    <RoleRoute allowedRoles={['superadmin', 'admin', 'staff']}>
                      <PlaceholderPage title="Students" />
                    </RoleRoute>
                  }
                />
                <Route
                  path="/users/professors"
                  element={
                    <RoleRoute allowedRoles={['superadmin', 'admin', 'staff']}>
                      <PlaceholderPage title="Professors" />
                    </RoleRoute>
                  }
                />
                <Route
                  path="/users/staff"
                  element={
                    <RoleRoute allowedRoles={['superadmin', 'admin']}>
                      <PlaceholderPage title="Staff" />
                    </RoleRoute>
                  }
                />
                <Route
                  path="/users/admins"
                  element={
                    <RoleRoute allowedRoles={['superadmin']}>
                      <PlaceholderPage title="Admins" />
                    </RoleRoute>
                  }
                />

                {/* ============================================ */}
                {/* PROFESSOR ROUTES                             */}
                {/* ============================================ */}
                <Route
                  path="/professor/schedule"
                  element={
                    <RoleRoute allowedRoles={['professor']}>
                      <PlaceholderPage title="My Schedule" />
                    </RoleRoute>
                  }
                />
                <Route
                  path="/professor/sections"
                  element={
                    <RoleRoute allowedRoles={['professor']}>
                      <PlaceholderPage title="My Sections" />
                    </RoleRoute>
                  }
                />
                <Route
                  path="/professor/students"
                  element={
                    <RoleRoute allowedRoles={['professor']}>
                      <PlaceholderPage title="My Students" />
                    </RoleRoute>
                  }
                />
                <Route
                  path="/professor/subjects"
                  element={
                    <RoleRoute allowedRoles={['professor']}>
                      <PlaceholderPage title="Assigned Subjects" />
                    </RoleRoute>
                  }
                />
                <Route
                  path="/professor/change-request"
                  element={
                    <RoleRoute allowedRoles={['professor']}>
                      <PlaceholderPage title="Request Schedule Change" />
                    </RoleRoute>
                  }
                />
                <Route
                  path="/professor/availability"
                  element={
                    <RoleRoute allowedRoles={['professor']}>
                      <PlaceholderPage title="My Availability" />
                    </RoleRoute>
                  }
                />
                <Route
                  path="/professor/exams"
                  element={
                    <RoleRoute allowedRoles={['professor']}>
                      <PlaceholderPage title="My Exams" />
                    </RoleRoute>
                  }
                />

                {/* ============================================ */}
                {/* STUDENT ROUTES                               */}
                {/* ============================================ */}
                <Route
                  path="/student/schedule"
                  element={
                    <RoleRoute allowedRoles={['student']}>
                      <PlaceholderPage title="My Schedule" />
                    </RoleRoute>
                  }
                />
                <Route
                  path="/student/subjects"
                  element={
                    <RoleRoute allowedRoles={['student']}>
                      <PlaceholderPage title="Enrolled Subjects" />
                    </RoleRoute>
                  }
                />
                <Route
                  path="/student/section"
                  element={
                    <RoleRoute allowedRoles={['student']}>
                      <PlaceholderPage title="My Section" />
                    </RoleRoute>
                  }
                />
                <Route
                  path="/student/exams"
                  element={
                    <RoleRoute allowedRoles={['student']}>
                      <PlaceholderPage title="Exam Schedule" />
                    </RoleRoute>
                  }
                />
                <Route
                  path="/student/enrollment"
                  element={
                    <RoleRoute allowedRoles={['student']}>
                      <PlaceholderPage title="My Application" />
                    </RoleRoute>
                  }
                />

                {/* ============================================ */}
                {/* COMMUNICATION (all authenticated)            */}
                {/* ============================================ */}
                <Route
                  path="/communication/announcements"
                  element={<PlaceholderPage title="Announcements" />}
                />
                <Route
                  path="/communication/notifications"
                  element={<PlaceholderPage title="Notifications" />}
                />
                <Route
                  path="/communication/messages"
                  element={
                    <RoleRoute allowedRoles={['superadmin', 'admin', 'staff']}>
                      <PlaceholderPage title="Messages" />
                    </RoleRoute>
                  }
                />

                {/* ============================================ */}
                {/* SYSTEM (superadmin only)                     */}
                {/* ============================================ */}
                <Route
                  path="/system/audit"
                  element={
                    <RoleRoute allowedRoles={['superadmin']}>
                      <PlaceholderPage title="Audit Trail" />
                    </RoleRoute>
                  }
                />
                <Route
                  path="/system/settings"
                  element={
                    <RoleRoute allowedRoles={['superadmin']}>
                      <PlaceholderPage title="Settings" />
                    </RoleRoute>
                  }
                />

                {/* ============================================ */}
                {/* PROFILE & SETTINGS (all authenticated)       */}
                {/* ============================================ */}
                <Route path="/profile" element={<PlaceholderPage title="My Profile" />} />
                <Route path="/settings" element={<PlaceholderPage title="Account Settings" />} />
                <Route path="/help" element={<PlaceholderPage title="Help & Support" />} />
              </Route>

              {/* ============================================ */}
              {/* REDIRECTS                                    */}
              {/* ============================================ */}
              <Route path="/" element={<Navigate to="/dashboard" replace />} />
              <Route path="*" element={<Navigate to="/dashboard" replace />} />
            </Routes>
          </BrowserRouter>
          <ToastContainer />
        </EnrollmentProvider>
      </ToastProvider>
    </AuthProvider>
  );
}

export default App;