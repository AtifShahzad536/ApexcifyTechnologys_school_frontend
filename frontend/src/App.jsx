import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Register from './pages/Register';
import Login from './pages/Login';

import Layout from './components/Layout';
import { Toaster } from 'react-hot-toast';
import AdminDashboard from './pages/Admin/AdminDashboard';
import Classes from './pages/Admin/Classes';
import Students from './pages/Admin/Students';
import Teachers from './pages/Admin/Teachers';
import Subjects from './pages/Admin/Subjects';
import Approvals from './pages/Admin/Approvals';
import ManageUsers from './pages/Admin/ManageUsers';
import TeacherDashboard from './pages/Teacher/TeacherDashboard';
import MyClasses from './pages/Teacher/MyClasses';
import MarkAttendance from './pages/Teacher/MarkAttendance';
import AddGrades from './pages/Teacher/AddGrades';
import TeacherAssignments from './pages/Teacher/Assignments';
import StudentDashboard from './pages/Student/StudentDashboard';
import MyGrades from './pages/Student/MyGrades';
import MyAttendance from './pages/Student/MyAttendance';
import MyResults from './pages/Student/MyResults';
import MySubjects from './pages/Student/MySubjects';
import StudentAssignments from './pages/Student/Assignments';
import ParentDashboard from './pages/Parent/ParentDashboard';
import MyChildren from './pages/Parent/MyChildren';
import ChildDetails from './pages/Parent/ChildDetails';
import AllGrades from './pages/Parent/AllGrades';
import AllAttendance from './pages/Parent/AllAttendance';
import AllAssignments from './pages/Parent/AllAssignments';
import AdminAttendanceReports from './pages/Admin/AttendanceReports';
import TeacherAttendanceReports from './pages/Teacher/AttendanceReports';
import GenerateReports from './pages/Teacher/GenerateReports';
import Materials from './pages/Teacher/Materials';
import StudyMaterials from './pages/Student/StudyMaterials';
import SchoolCalendar from './pages/Admin/SchoolCalendar';
import MyTimetable from './pages/Student/MyTimetable';
import LeaveApplication from './pages/Common/LeaveApplication';
import LeaveRequests from './pages/Admin/LeaveRequests';
import CreateExam from './pages/Teacher/CreateExam';
import StudentExams from './pages/Student/StudentExams';
import TakeExam from './pages/Student/TakeExam';
import ManageFees from './pages/Admin/ManageFees';
import FeePayment from './pages/Parent/FeePayment';
import ViewReports from './pages/Parent/ViewReports';
import PaymentSuccess from './pages/Parent/PaymentSuccess';
import LiveClass from './pages/LiveClass';
import LiveClassesDashboard from './pages/Common/LiveClassesDashboard';
import ScheduleMeeting from './pages/Admin/ScheduleMeeting';

function App() {
  return (
    <Router>
      <Toaster position="top-right" toastOptions={{ duration: 3000 }} />
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Protected Dashboard Routes */}
        <Route element={<Layout />}>
          <Route path="/admin/dashboard" element={<AdminDashboard />} />
          <Route path="/admin/approvals" element={<Approvals />} />
          <Route path="/admin/manage-users" element={<ManageUsers />} />
          <Route path="/admin/classes" element={<Classes />} />
          <Route path="/admin/students" element={<Students />} />
          <Route path="/admin/teachers" element={<Teachers />} />
          <Route path="/admin/subjects" element={<Subjects />} />
          <Route path="/admin/reports/attendance" element={<AdminAttendanceReports />} />
          <Route path="/admin/calendar" element={<SchoolCalendar />} />
          <Route path="/admin/leaves" element={<LeaveRequests />} />
          <Route path="/admin/reports/attendance" element={<AdminAttendanceReports />} />
          <Route path="/admin/calendar" element={<SchoolCalendar />} />
          <Route path="/admin/schedule-meeting" element={<ScheduleMeeting />} />
          <Route path="/admin/leaves" element={<LeaveRequests />} />
          <Route path="/admin/fees" element={<ManageFees />} />
          <Route path="/teacher/dashboard" element={<TeacherDashboard />} />
          <Route path="/teacher/classes" element={<MyClasses />} />
          <Route path="/teacher/assignments" element={<TeacherAssignments />} />
          <Route path="/teacher/attendance" element={<MarkAttendance />} />
          <Route path="/teacher/grades" element={<AddGrades />} />
          <Route path="/teacher/reports/attendance" element={<TeacherAttendanceReports />} />
          <Route path="/teacher/reports/generate" element={<GenerateReports />} />
          <Route path="/teacher/materials" element={<Materials />} />
          <Route path="/teacher/leave" element={<LeaveApplication />} />
          <Route path="/teacher/exams/create" element={<CreateExam />} />
          <Route path="/student/dashboard" element={<StudentDashboard />} />
          <Route path="/student/subjects" element={<MySubjects />} />
          <Route path="/student/assignments" element={<StudentAssignments />} />
          <Route path="/student/materials" element={<StudyMaterials />} />
          <Route path="/student/timetable" element={<MyTimetable />} />
          <Route path="/student/exams" element={<StudentExams />} />
          <Route path="/student/exams/:id/take" element={<TakeExam />} />
          <Route path="/student/leave" element={<LeaveApplication />} />
          <Route path="/student/grades" element={<MyGrades />} />
          <Route path="/student/attendance" element={<MyAttendance />} />
          <Route path="/student/results" element={<MyResults />} />
          <Route path="/parent/dashboard" element={<ParentDashboard />} />
          <Route path="/parent/children" element={<MyChildren />} />
          <Route path="/parent/children/:id" element={<ChildDetails />} />
          <Route path="/parent/grades" element={<AllGrades />} />
          <Route path="/parent/attendance" element={<AllAttendance />} />
          <Route path="/parent/assignments" element={<AllAssignments />} />
          <Route path="/parent/fees" element={<FeePayment />} />
          <Route path="/parent/reports" element={<ViewReports />} />
          <Route path="/payment/success" element={<PaymentSuccess />} />
          <Route path="/live-class/:roomId" element={<LiveClass />} />
          <Route path="/admin/live-classes" element={<LiveClassesDashboard />} />
          <Route path="/teacher/live-classes" element={<LiveClassesDashboard />} />
          <Route path="/student/live-classes" element={<LiveClassesDashboard />} />
          <Route path="/parent/live-classes" element={<LiveClassesDashboard />} />
        </Route>

        <Route path="/" element={<Navigate to="/login" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
