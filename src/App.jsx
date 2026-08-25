// src/App.jsx
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './routes/ProtectedRoute';
import RoleRoute from './routes/RoleRoute';

import LoginPage from './pages/LoginPage';

import DashboardPage from './pages/admin/DashboardPage';
import StudentsPage from './pages/admin/StudentsPage';
import CoursesPage from './pages/admin/CoursesPage';
import ExamsPage from './pages/admin/ExamsPage';
import ExamQuestionsPage from './pages/admin/ExamQuestionsPage';
import ExamResultsPage from './pages/admin/ExamResultsPage';

import AvailableExamsPage from './pages/student/AvailableExamsPage';
import TakeExamPage from './pages/student/TakeExamPage';
import ExamResultPage from './pages/student/ExamResultPage';
import MyResultsPage from './pages/student/MyResultsPage';

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* Publique */}
          <Route path="/login" element={<LoginPage />} />

          {/* Toutes les routes ci-dessous nécessitent d'être connecté */}
          <Route element={<ProtectedRoute />}>
            {/* Espace admin */}
            <Route element={<RoleRoute role="admin" />}>
              <Route path="/admin" element={<DashboardPage />} />
              <Route path="/admin/students" element={<StudentsPage />} />
              <Route path="/admin/courses" element={<CoursesPage />} />
              <Route path="/admin/exams" element={<ExamsPage />} />
              <Route path="/admin/exams/:id/questions" element={<ExamQuestionsPage />} />
              <Route path="/admin/exams/:id/results" element={<ExamResultsPage />} />
            </Route>

            {/* Espace étudiant */}
            <Route element={<RoleRoute role="student" />}>
              <Route path="/student" element={<AvailableExamsPage />} />
              <Route path="/student/exams/:id" element={<TakeExamPage />} />
              <Route path="/student/exams/:id/result" element={<ExamResultPage />} />
              <Route path="/student/results" element={<MyResultsPage />} />
            </Route>
          </Route>

          {/* Route inconnue -> redirige vers login */}
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}