// src/pages/admin/DashboardPage.jsx
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { getStudents } from '../../api/students.api';
import { getCourses } from '../../api/courses.api';
import { getExams } from '../../api/exams.api';

export default function DashboardPage() {
  const { token, user } = useAuth();

  const [counts, setCounts] = useState({ students: 0, activeStudents: 0, courses: 0, exams: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadCounts();
  }, []);

  async function loadCounts() {
    setLoading(true);
    setError(null);
    try {
      const [students, courses, exams] = await Promise.all([
        getStudents(token),
        getCourses(token),
        getExams(token),
      ]);
      setCounts({
        students: students.length,
        activeStudents: students.filter((s) => s.isActive).length,
        courses: courses.length,
        exams: exams.length,
      });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  if (loading) return <p>Chargement du tableau de bord...</p>;

  return (
    <div className="dashboard-page">
      <h1>Tableau de bord</h1>
      <p>Bienvenue, {user?.name}.</p>

      {error && <p className="error-message">{error}</p>}

      <div className="dashboard-counters">
        <div className="counter-card">
          <span className="counter-value">{counts.students}</span>
          <span className="counter-label">Étudiants ({counts.activeStudents} actifs)</span>
        </div>
        <div className="counter-card">
          <span className="counter-value">{counts.courses}</span>
          <span className="counter-label">Cours</span>
        </div>
        <div className="counter-card">
          <span className="counter-value">{counts.exams}</span>
          <span className="counter-label">Examens</span>
        </div>
      </div>

      <div className="dashboard-quick-links">
        <h2>Accès rapides</h2>
        <ul>
          <li>
            <Link to="/admin/students">Gérer les étudiants</Link>
          </li>
          <li>
            <Link to="/admin/courses">Gérer les cours</Link>
          </li>
          <li>
            <Link to="/admin/exams">Gérer les examens</Link>
          </li>
        </ul>
      </div>
    </div>
  );
}