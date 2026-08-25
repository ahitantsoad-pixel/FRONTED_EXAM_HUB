// src/pages/admin/ExamQuestionsPage.jsx
import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { getExam } from '../../api/exams.api';
import { getQuestions, createQuestion, updateQuestion, deleteQuestion } from '../../api/questions.api';

const EMPTY_CHOICE = () => ({ text: '', correct: false });

export default function ExamQuestionsPage() {
  const { id } = useParams();
  const examId = Number(id);
  const { token } = useAuth();

  const [exam, setExam] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // l'examen est verrouillé dès qu'il a au moins une tentative (RG-08)
  // on le déduit ici d'une tentative de suppression qui échouerait, mais plus simple :
  // le mock ne renvoie pas ce flag directement, donc on se base sur une 403 lors d'une action.
  // Pour une UX plus claire, on tente une opération neutre : si le back exposait un champ
  // "locked" sur l'examen, on l'utiliserait directement ici.
  const [locked, setLocked] = useState(false);

  // formulaire de création
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newText, setNewText] = useState('');
  const [newPoints, setNewPoints] = useState(1);
  const [newChoices, setNewChoices] = useState([EMPTY_CHOICE(), EMPTY_CHOICE()]);
  const [creating, setCreating] = useState(false);

  // édition
  const [editingId, setEditingId] = useState(null);
  const [editText, setEditText] = useState('');
  const [editPoints, setEditPoints] = useState(1);
  const [editChoices, setEditChoices] = useState([]);

  useEffect(() => {
    loadData();
  }, [examId]);

  async function loadData() {
    setLoading(true);
    setError(null);
    try {
      const [examData, questionsData] = await Promise.all([
        getExam(examId, token),
        getQuestions(examId, token),
      ]);
      setExam(examData);
      setQuestions(questionsData);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  function updateNewChoiceText(index, text) {
    setNewChoices((prev) => prev.map((c, i) => (i === index ? { ...c, text } : c)));
  }

  function setNewCorrectChoice(index) {
    setNewChoices((prev) => prev.map((c, i) => ({ ...c, correct: i === index })));
  }

  function addNewChoice() {
    if (newChoices.length >= 6) return;
    setNewChoices((prev) => [...prev, EMPTY_CHOICE()]);
  }

  function removeNewChoice(index) {
    if (newChoices.length <= 2) return;
    setNewChoices((prev) => prev.filter((_, i) => i !== index));
  }

  async function handleCreate(e) {
    e.preventDefault();
    setError(null);

    // validation locale avant envoi (RG-04) — le serveur revalide de toute façon
    if (newChoices.length < 2 || newChoices.length > 6) {
      setError('Une question doit avoir entre 2 et 6 choix.');
      return;
    }
    if (newChoices.filter((c) => c.correct).length !== 1) {
      setError('Sélectionnez exactement un choix correct.');
      return;
    }
    if (newChoices.some((c) => !c.text.trim())) {
      setError('Tous les choix doivent avoir un texte.');
      return;
    }

    setCreating(true);
    try {
      const created = await createQuestion(
        examId,
        { text: newText, points: Number(newPoints), choices: newChoices },
        token
      );
      setQuestions((prev) => [...prev, created]);
      setNewText('');
      setNewPoints(1);
      setNewChoices([EMPTY_CHOICE(), EMPTY_CHOICE()]);
      setShowCreateForm(false);
    } catch (err) {
      setError(err.message);
      if (err.status === 403) setLocked(true);
    } finally {
      setCreating(false);
    }
  }

  function startEdit(question) {
    setEditingId(question.id);
    setEditText(question.text);
    setEditPoints(question.points);
    setEditChoices(question.choices.map((c) => ({ text: c.text, correct: c.correct })));
    setError(null);
  }

  function cancelEdit() {
    setEditingId(null);
  }

  function updateEditChoiceText(index, text) {
    setEditChoices((prev) => prev.map((c, i) => (i === index ? { ...c, text } : c)));
  }

  function setEditCorrectChoice(index) {
    setEditChoices((prev) => prev.map((c, i) => ({ ...c, correct: i === index })));
  }

  async function handleSaveEdit(id) {
    setError(null);
    if (editChoices.filter((c) => c.correct).length !== 1) {
      setError('Sélectionnez exactement un choix correct.');
      return;
    }
    try {
      const updated = await updateQuestion(
        id,
        { text: editText, points: Number(editPoints), choices: editChoices },
        token
      );
      setQuestions((prev) => prev.map((q) => (q.id === id ? updated : q)));
      setEditingId(null);
    } catch (err) {
      setError(err.message);
      if (err.status === 403) setLocked(true);
    }
  }

  async function handleDelete(id) {
    if (!confirm('Supprimer cette question ?')) return;
    setError(null);
    try {
      await deleteQuestion(id, token);
      setQuestions((prev) => prev.filter((q) => q.id !== id));
    } catch (err) {
      setError(err.message);
      if (err.status === 403) setLocked(true);
    }
  }

  if (loading) return <p>Chargement des questions...</p>;
  if (!exam) return <p>Examen introuvable.</p>;

  return (
    <div className="exam-questions-page">
      <Link to="/admin/exams">&larr; Retour aux examens</Link>
      <h1>Questions — {exam.title}</h1>

      {locked && (
        <div className="warning-banner">
          🔒 Cet examen a déjà des tentatives : les questions et choix ne sont plus modifiables
          ni supprimables (RG-08).
        </div>
      )}

      {error && <p className="error-message">{error}</p>}

      {!showCreateForm ? (
        <button onClick={() => setShowCreateForm(true)} disabled={locked}>
          + Nouvelle question
        </button>
      ) : (
        <form onSubmit={handleCreate} className="create-question-form">
          <textarea
            placeholder="Énoncé de la question"
            value={newText}
            onChange={(e) => setNewText(e.target.value)}
            required
          />
          <label>
            Points
            <input
              type="number"
              min="1"
              value={newPoints}
              onChange={(e) => setNewPoints(e.target.value)}
              required
            />
          </label>

          <p>Choix (entre 2 et 6, cochez le bon) :</p>
          {newChoices.map((choice, index) => (
            <div key={index} className="choice-row">
              <input
                type="radio"
                name="new-correct-choice"
                checked={choice.correct}
                onChange={() => setNewCorrectChoice(index)}
              />
              <input
                type="text"
                placeholder={`Choix ${index + 1}`}
                value={choice.text}
                onChange={(e) => updateNewChoiceText(index, e.target.value)}
                required
              />
              {newChoices.length > 2 && (
                <button type="button" onClick={() => removeNewChoice(index)}>
                  Retirer
                </button>
              )}
            </div>
          ))}
          {newChoices.length < 6 && (
            <button type="button" onClick={addNewChoice}>
              + Ajouter un choix
            </button>
          )}

          <div>
            <button type="submit" disabled={creating}>
              {creating ? 'Création...' : 'Créer la question'}
            </button>
            <button type="button" onClick={() => setShowCreateForm(false)}>
              Annuler
            </button>
          </div>
        </form>
      )}

      <ul className="questions-list">
        {questions.map((question) => (
          <li key={question.id}>
            {editingId === question.id ? (
              <div className="edit-question-form">
                <textarea value={editText} onChange={(e) => setEditText(e.target.value)} />
                <label>
                  Points
                  <input
                    type="number"
                    min="1"
                    value={editPoints}
                    onChange={(e) => setEditPoints(e.target.value)}
                  />
                </label>
                {editChoices.map((choice, index) => (
                  <div key={index} className="choice-row">
                    <input
                      type="radio"
                      name="edit-correct-choice"
                      checked={choice.correct}
                      onChange={() => setEditCorrectChoice(index)}
                    />
                    <input
                      type="text"
                      value={choice.text}
                      onChange={(e) => updateEditChoiceText(index, e.target.value)}
                    />
                  </div>
                ))}
                <button onClick={() => handleSaveEdit(question.id)}>Enregistrer</button>
                <button onClick={cancelEdit}>Annuler</button>
              </div>
            ) : (
              <div>
                <strong>{question.text}</strong> — {question.points} pt(s)
                <ul>
                  {question.choices.map((c) => (
                    <li key={c.id} style={{ fontWeight: c.correct ? 'bold' : 'normal' }}>
                      {c.text} {c.correct && '✓'}
                    </li>
                  ))}
                </ul>
                <button onClick={() => startEdit(question)} disabled={locked}>
                  Modifier
                </button>
                <button onClick={() => handleDelete(question.id)} disabled={locked}>
                  Supprimer
                </button>
              </div>
            )}
          </li>
        ))}
      </ul>

      {questions.length === 0 && <p>Aucune question pour le moment.</p>}
    </div>
  );
}