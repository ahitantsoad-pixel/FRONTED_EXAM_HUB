import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { getMyExams } from '../../api/attempts.api';

export default function AvailableExamsPage() {
  const { token } = useAuth();

  const [exams, setExams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadExams();
  }, []);

  async function loadExams() {
    setLoading(true);
    setError(null);
    try {
      const data = await getMyExams(token);
      setExams(data);
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

  if (loading) return <p>Chargement des examens...</p>;

  return (
    <div className="available-exams-page">
      <h1>Examens disponibles</h1>

      {error && <p className="error-message">{error}</p>}

      {exams.length === 0 ? (
        <p>Aucun examen disponible pour le moment.</p>
      ) : (
        <ul className="exams-list">
          {exams.map((exam) => (
            <li key={exam.id} className="exam-card">
              <div>
                <h2>{exam.title}</h2>
                <p>{exam.description}</p>
                <p className="exam-window">
                  Disponible jusqu'au {formatDate(exam.endsAt)}
                </p>
              </div>
              <Link to={`/student/exams/${exam.id}`}>
                <button>Passer l'examen</button>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
