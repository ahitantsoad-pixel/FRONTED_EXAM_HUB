import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { getMyResults } from '../../api/attempts.api';

export default function MyResultsPage() {
  const { token } = useAuth();

  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadResults();
  }, []);

  async function loadResults() {
    setLoading(true);
    setError(null);
    try {
      const data = await getMyResults(token);
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

  if (loading) return <p>Chargement de vos résultats...</p>;

  return (
    <div className="my-results-page">
      <h1>Mes résultats</h1>

      {error && <p className="error-message">{error}</p>}

      {results.length === 0 ? (
        <p>Vous n'avez encore passé aucun examen.</p>
      ) : (
        <table>
          <thead>
            <tr>
              <th>Cours</th>
              <th>Examen</th>
              <th>Note</th>
              <th>Soumis le</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {results.map((r) => (
              <tr key={r.attemptId}>
                <td>{r.courseName}</td>
                <td>{r.examTitle}</td>
                <td>
                  {r.score} / {r.totalPoints}
                </td>
                <td>{formatDate(r.submittedAt)}</td>
                <td>
                  <Link
                    to={`/student/exams/${r.examId}/result`}
                    state={{ attemptId: r.attemptId }}
                  >
                    Voir la correction
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
