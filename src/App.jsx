import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import AuthPage from './pages/AuthPage';
import ActivateAccount from './pages/ActivateAccount';
import AdminDashboard from './pages/Admin/AdminDashboard';
import Teachers from './pages/Admin/Teachers';
import Parents from './pages/Admin/Parents';
import AcademicYearManagement from './pages/Admin/AcademicYearManagement';
import AdminSettings from './pages/Admin/Settings';
import TeacherDashboard from './pages/Teacher/TeacherDashboard';
import MyClasses from './pages/Teacher/MyClasses';
import ClassDetails from './pages/Teacher/ClassDetails';
import Behaviors from './pages/Teacher/Behaviors';
import Assessments from './pages/Teacher/Assessments';
import TeacherAnnouncementsMeetings from './pages/Teacher/TeacherAnnouncementsMeetings';
import Attendance from './pages/Teacher/Attendance';
import TeacherMessages from './pages/Teacher/TeacherMessages';
import TeacherSettings from './pages/Teacher/Settings';
import ParentDashboard from './pages/Parent/ParentDashboard';
import ChildDetails from './pages/Parent/ChildDetails';
import ParentMessages from './pages/Parent/ParentMessages';
import ParentAnnouncementsMeetings from './pages/Parent/ParentAnnouncementsMeetings';
import AcademicPerformance from './pages/Parent/AcademicPerformance';
import BehaviorHistory from './pages/Parent/BehaviorHistory';
import AttendanceRecords from './pages/Parent/AttendanceRecords';
import ParentSettings from './pages/Parent/Settings';
import AdminMessages from './pages/Admin/AdminMessages';
import AdminAnnouncementMeeting from './pages/Admin/AdminAnnouncementMeeting';
import { ROLES } from './utils/roleGuard';
import './App.css';

function App() {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          {/* Public Routes */}
          <Route path="/login" element={<AuthPage />} />
          <Route path="/activate" element={<ActivateAccount />} />
          <Route path="/" element={<Navigate to="/login" replace />} />
          
          {/* Admin Routes - Protected */}
          <Route
            path="/admin"
            element={
              <ProtectedRoute allowedRoles={[ROLES.ADMIN]}>
                <AdminDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/teachers"
            element={
              <ProtectedRoute allowedRoles={[ROLES.ADMIN]}>
                <Teachers />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/parents"
            element={
              <ProtectedRoute allowedRoles={[ROLES.ADMIN]}>
                <Parents />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/academic-years"
            element={
              <ProtectedRoute allowedRoles={[ROLES.ADMIN]}>
                <AcademicYearManagement />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/settings"
            element={
              <ProtectedRoute allowedRoles={[ROLES.ADMIN]}>
                <AdminSettings />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/messages"
            element={
              <ProtectedRoute allowedRoles={[ROLES.ADMIN]}>
                <AdminMessages />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/announcements-meetings"
            element={
              <ProtectedRoute allowedRoles={[ROLES.ADMIN]}>
                <AdminAnnouncementMeeting />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/*"
            element={
              <ProtectedRoute allowedRoles={[ROLES.ADMIN]}>
                <AdminDashboard />
              </ProtectedRoute>
            }
          />
          
          {/* Teacher Routes - Protected */}
          <Route
            path="/teacher"
            element={
              <ProtectedRoute allowedRoles={[ROLES.TEACHER]}>
                <TeacherDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/teacher/classes"
            element={
              <ProtectedRoute allowedRoles={[ROLES.TEACHER]}>
                <MyClasses />
              </ProtectedRoute>
            }
          />
          <Route
            path="/teacher/classes/:classId"
            element={
              <ProtectedRoute allowedRoles={[ROLES.TEACHER]}>
                <ClassDetails />
              </ProtectedRoute>
            }
          />
          <Route
            path="/teacher/behaviors"
            element={
              <ProtectedRoute allowedRoles={[ROLES.TEACHER]}>
                <Behaviors />
              </ProtectedRoute>
            }
          />
          <Route
            path="/teacher/assessments"
            element={
              <ProtectedRoute allowedRoles={[ROLES.TEACHER]}>
                <Assessments />
              </ProtectedRoute>
            }
          />
          <Route
            path="/teacher/attendance"
            element={
              <ProtectedRoute allowedRoles={[ROLES.TEACHER]}>
                <Attendance />
              </ProtectedRoute>
            }
          />
          <Route
            path="/teacher/messages"
            element={
              <ProtectedRoute allowedRoles={[ROLES.TEACHER]}>
                <TeacherMessages />
              </ProtectedRoute>
            }
          />
          <Route
            path="/teacher/settings"
            element={
              <ProtectedRoute allowedRoles={[ROLES.TEACHER]}>
                <TeacherSettings />
              </ProtectedRoute>
            }
          />
          <Route
            path="/teacher/announcements-meetings"
            element={
              <ProtectedRoute allowedRoles={[ROLES.TEACHER]}>
                <TeacherAnnouncementsMeetings />
              </ProtectedRoute>
            }
          />
          <Route
            path="/teacher/*"
            element={
              <ProtectedRoute allowedRoles={[ROLES.TEACHER]}>
                <TeacherDashboard />
              </ProtectedRoute>
            }
          />
          
          {/* Parent Routes - Protected */}
          <Route
            path="/parent/dashboard"
            element={
              <ProtectedRoute allowedRoles={[ROLES.PARENT]}>
                <ParentDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/parent/child/:childId"
            element={
              <ProtectedRoute allowedRoles={[ROLES.PARENT]}>
                <ChildDetails />
              </ProtectedRoute>
            }
          />
          <Route
            path="/parent/messages"
            element={
              <ProtectedRoute allowedRoles={[ROLES.PARENT]}>
                <ParentMessages />
              </ProtectedRoute>
            }
          />
          <Route
            path="/parent/performance"
            element={
              <ProtectedRoute allowedRoles={[ROLES.PARENT]}>
                <AcademicPerformance />
              </ProtectedRoute>
            }
          />
          <Route
            path="/parent/behaviors"
            element={
              <ProtectedRoute allowedRoles={[ROLES.PARENT]}>
                <BehaviorHistory />
              </ProtectedRoute>
            }
          />
          <Route
            path="/parent/attendance"
            element={
              <ProtectedRoute allowedRoles={[ROLES.PARENT]}>
                <AttendanceRecords />
              </ProtectedRoute>
            }
          />
          <Route
            path="/parent/settings"
            element={
              <ProtectedRoute allowedRoles={[ROLES.PARENT]}>
                <ParentSettings />
              </ProtectedRoute>
            }
          />
          <Route
            path="/parent/announcements-meetings"
            element={
              <ProtectedRoute allowedRoles={[ROLES.PARENT]}>
                <ParentAnnouncementsMeetings />
              </ProtectedRoute>
            }
          />
          <Route
            path="/parent"
            element={<Navigate to="/parent/dashboard" replace />}
          />
          
          {/* Fallback */}
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;
