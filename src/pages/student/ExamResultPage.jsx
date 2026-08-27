import { useEffect, useState } from 'react';
import { useParams, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { getMyResultDetail } from '../../api/attempts.api';

export default function ExamResultPage() {
  const { id } = useParams();
  const examId = Number(id);
  const location = useLocation();
  const { token } = useAuth();

  const [result, setResult] = useState(location.state?.result ?? null);
  const [loading, setLoading] = useState(!location.state?.result);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (result) return;
    loadFromHistory();
  }, []);

  async function loadFromHistory() {
      const attemptId = location.state?.attemptId;
    if (!attemptId) {
      setError("Impossible d'afficher ce résultat directement. Consultez l'historique.");
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const data = await getMyResultDetail(attemptId, token);
      setResult(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  if (loading) return <p>Chargement du résultat...</p>;

  if (error) {
    return (
      <div className="exam-result-page">
        <Link to="/student/results">&larr; Voir mes résultats</Link>
        <p className="error-message">{error}</p>
      </div>
    );
  }

  if (!result) return null;

  return (
    <div className="exam-result-page">
      <h1>Résultat — {result.examTitle}</h1>

      <div className="result-score">
        <span className="score-value">
          {result.score} / {result.totalPoints}
        </span>
        <span className="score-label">points obtenus</span>
      </div>

      <h2>Correction détaillée</h2>
      <ul className="correction-list">
        {result.answers.map((answer) => (
          <li
            key={answer.questionId}
            className={answer.isCorrect ? 'correction-correct' : 'correction-incorrect'}
          >
            <p className="correction-question">{answer.questionText}</p>
            <ul>
              {answer.choices.map((choice) => {
                const isYourChoice = choice.id === answer.choiceId;
                const isTheCorrectChoice = choice.id === answer.correctChoiceId;
                let className = '';
                if (isTheCorrectChoice) className = 'choice-correct';
                if (isYourChoice && !isTheCorrectChoice) className = 'choice-wrong';
                return (
                  <li key={choice.id} className={className}>
                    {choice.text}
                    {isYourChoice && ' (votre réponse)'}
                    {isTheCorrectChoice && ' ✓'}
                  </li>
                );
              })}
            </ul>
            <p className="correction-points">
              {answer.isCorrect ? `+${answer.points} pt(s)` : '0 pt'}
            </p>
          </li>
        ))}
      </ul>

      <Link to="/student/results">Voir tous mes résultats</Link>
    </div>
  );
}
