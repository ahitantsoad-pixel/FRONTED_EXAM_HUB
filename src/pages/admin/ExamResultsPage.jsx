// src/pages/admin/ExamResultsPage.jsx
import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { getExamResults } from '../../api/exams.api';

export default function ExamResultsPage() {
  const { id } = useParams();
  const examId = Number(id);
  const { token } = useAuth();

  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadResults();
  }, [examId]);

  async function loadResults() {
    setLoading(true);
    setError(null);
    try {
      const data = await getExamResults(examId, token);
      setResults(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  function formatDate(isoString) {
    return new Date(isoString).toLocaleString('fr-FR', {
      dateStyle: 'short',
      timeStyle: 'short',
    });
  }

  if (loading) return <p>Chargement des résultats...</p>;

  if (error) {
    return (
      <div className="exam-results-page">
        <Link to="/admin/exams">&larr; Retour aux examens</Link>
        <p className="error-message">{error}</p>
      </div>
    );
  }

  if (!results) return null;

  return (
    <div className="exam-results-page">
      <Link to="/admin/exams">&larr; Retour aux examens</Link>
      <h1>Résultats — {results.examTitle}</h1>

      <div className="results-summary">
        <div className="summary-card">
          <span className="summary-label">Nombre de tentatives</span>
          <span className="summary-value">{results.results.length}</span>
        </div>
        <div className="summary-card">
          <span className="summary-label">Moyenne</span>
          <span className="summary-value">
            {results.average} / {results.totalPoints}
          </span>
        </div>
        <div className="summary-card">
          <span className="summary-label">Total des points</span>
          <span className="summary-value">{results.totalPoints}</span>
        </div>
      </div>

      {results.results.length === 0 ? (
        <p>Aucun étudiant n'a encore passé cet examen.</p>
      ) : (
        <table>
          <thead>
            <tr>
              <th>Étudiant</th>
              <th>Note</th>
              <th>Tentatives</th>
              <th>Soumis le</th>
            </tr>
          </thead>
          <tbody>
            {results.results.map((r) => (
              <tr key={r.attemptId}>
                <td>{r.studentName}</td>
                <td>
                  {r.score} / {results.totalPoints}
                </td>
                <td>{r.attemptsCount}</td>
                <td>{formatDate(r.submittedAt)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}