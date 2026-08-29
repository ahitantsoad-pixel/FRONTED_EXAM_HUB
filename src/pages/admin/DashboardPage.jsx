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

  if (loading) return <div className="loading-state">Chargement du tableau de bord...</div>;

  const activePercentage = counts.students > 0 ? Math.round((counts.activeStudents / counts.students) * 100) : 0;

  return (
    <div className="dashboard-page">
      {/* En-tête avec statut du système */}
      <div className="dashboard-banner">
        <div>
          <h1>Tableau de bord</h1>
          <p className="welcome">Bienvenue, {user?.name || 'Patrick'} 👋</p>
        </div>
        <div className="system-status">
          <span className="status-dot"></span> Système opérationnel
        </div>
      </div>

      {error && <p className="error-message">{error}</p>}

      {/* Cartes de statistiques avec indicateurs visuels */}
      <div className="dashboard-counters">
        <div className="counter-card card-blue">
          <div className="card-top">
            <span className="card-tag">Étudiants</span>
            <span className="badge-active">{counts.activeStudents} actifs</span>
          </div>
          <span className="counter-value">{counts.students}</span>
          <div className="progress-bar-bg">
            <div className="progress-bar-fill" style={{ width: `${activePercentage}%` }}></div>
          </div>
        </div>

        <div className="counter-card card-purple">
          <div className="card-top">
            <span className="card-tag">Catalogue</span>
          </div>
          <span className="counter-value">{counts.courses}</span>
          <span className="counter-label">Cours publiés</span>
        </div>

        <div className="counter-card card-green">
          <div className="card-top">
            <span className="card-tag">Évaluations</span>
          </div>
          <span className="counter-value">{counts.exams}</span>
          <span className="counter-label">Examens configurés</span>
        </div>
      </div>

      {/* Grille à 2 colonnes pour combler l'espace */}
      <div className="dashboard-grid">
        {/* Colonne Accès Rapides */}
        <div className="dashboard-quick-links">
          <h2>Accès rapides</h2>
          <ul>
            <li>
              <Link to="/admin/students">
                <span>Gérer les étudiants</span>
                <small>Consulter la liste et les comptes</small>
              </Link>
            </li>
            <li>
              <Link to="/admin/courses">
                <span>Gérer les cours</span>
                <small>Ajouter ou modifier des matières</small>
              </Link>
            </li>
            <li>
              <Link to="/admin/exams">
                <span>Gérer les examens</span>
                <small>Planifier les épreuves et sessions</small>
              </Link>
            </li>
          </ul>
        </div>

        {/* Colonne Activités récentes / Résumé */}
        <div className="dashboard-activity">
          <h2>Vue d'ensemble</h2>
          <div className="activity-card">
            <div className="activity-item">
              <span className="activity-icon blue">🎓</span>
              <div>
                <strong>Taux d'activité</strong>
                <p>{activePercentage}% des étudiants inscrits sont actuellement actifs.</p>
              </div>
            </div>
            <div className="activity-item">
              <span className="activity-icon green">📝</span>
              <div>
                <strong>Examens prêts</strong>
                <p>{counts.exams} examen(s) disponible(s) pour la session en cours.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}