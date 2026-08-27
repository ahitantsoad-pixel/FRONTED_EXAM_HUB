import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { getMyExam, submitExam } from '../../api/attempts.api';

export default function TakeExamPage() {
  const { id } = useParams();
  const examId = Number(id);
  const { token } = useAuth();
  const navigate = useNavigate();

  const [exam, setExam] = useState(null);
  const [answers, setAnswers] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  useEffect(() => {
    loadExam();
  }, [examId]);

  async function loadExam() {
    setLoading(true);
    setError(null);
    try {
      const data = await getMyExam(examId, token);
      setExam(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  function selectAnswer(questionId, choiceId) {
    setAnswers((prev) => ({ ...prev, [questionId]: choiceId }));
  }

  const answeredCount = Object.keys(answers).length;
  const totalQuestions = exam?.questions?.length ?? 0;

  function requestSubmit(e) {
    e.preventDefault();
    setShowConfirm(true);
  }

  async function confirmSubmit() {
    setSubmitting(true);
    setError(null);
    try {
      const payload = exam.questions.map((q) => ({
        questionId: q.id,
        choiceId: answers[q.id] ?? null, 
      }));
      const result = await submitExam(examId, payload, token);
      navigate(`/student/exams/${examId}/result`, { state: { result }, replace: true });
    } catch (err) {
      setError(err.message);
      setShowConfirm(false);
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) return <p>Chargement de l'examen...</p>;

  if (error && !exam) {
    return (
      <div className="take-exam-page">
        <Link to="/student">&larr; Retour aux examens</Link>
        <p className="error-message">{error}</p>
      </div>
    );
  }

  if (!exam) return null;

  return (
    <div className="take-exam-page">
      <h1>{exam.title}</h1>
      <p>{exam.description}</p>

      {error && <p className="error-message">{error}</p>}

      <form onSubmit={requestSubmit}>
        {exam.questions.map((question, index) => (
          <fieldset key={question.id} className="question-block">
            <legend>
              Question {index + 1} ({question.points} pt{question.points > 1 ? 's' : ''})
            </legend>
            <p>{question.text}</p>
            {question.choices.map((choice) => (
              <label key={choice.id} className="choice-option">
                <input
                  type="radio"
                  name={`question-${question.id}`}
                  checked={answers[question.id] === choice.id}
                  onChange={() => selectAnswer(question.id, choice.id)}
                />
                {choice.text}
              </label>
            ))}
          </fieldset>
        ))}

        <p className="progress-note">
          {answeredCount} / {totalQuestions} question(s) répondue(s)
        </p>

        <button type="submit">Soumettre l'examen</button>
      </form>

      {showConfirm && (
        <div className="confirm-overlay">
          <div className="confirm-box">
            <p>
              Confirmer la soumission ? Vous avez répondu à {answeredCount} sur{' '}
              {totalQuestions} question(s). Cette action est définitive, vous ne pourrez plus
              repasser cet examen.
            </p>
            <button onClick={confirmSubmit} disabled={submitting}>
              {submitting ? 'Envoi...' : 'Confirmer'}
            </button>
            <button onClick={() => setShowConfirm(false)} disabled={submitting}>
              Annuler
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
