// src/pages/admin/ExamsPage.jsx
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { getExams, createExam, updateExam, deleteExam } from '../../api/exams.api';
import { getCourses } from '../../api/courses.api';

export default function ExamsPage() {
  const { token } = useAuth();

  const [exams, setExams] = useState([]);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // formulaire de création
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newCourseId, setNewCourseId] = useState('');
  const [newTitle, setNewTitle] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [newStartsAt, setNewStartsAt] = useState('');
  const [newEndsAt, setNewEndsAt] = useState('');
  const [creating, setCreating] = useState(false);

  // édition en ligne
  const [editingId, setEditingId] = useState(null);
  const [editTitle, setEditTitle] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [editStartsAt, setEditStartsAt] = useState('');
  const [editEndsAt, setEditEndsAt] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    setLoading(true);
    setError(null);
    try {
      const [examsData, coursesData] = await Promise.all([getExams(token), getCourses(token)]);
      setExams(examsData);
      setCourses(coursesData);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  function courseName(courseId) {
    return courses.find((c) => c.id === courseId)?.name ?? '—';
  }

  async function handleCreate(e) {
    e.preventDefault();
    setError(null);
    setCreating(true);
    try {
      const created = await createExam(
        {
          courseId: Number(newCourseId),
          title: newTitle,
          description: newDescription,
          startsAt: new Date(newStartsAt).toISOString(),
          endsAt: new Date(newEndsAt).toISOString(),
        },
        token
      );
      setExams((prev) => [...prev, created]);
      setNewCourseId('');
      setNewTitle('');
      setNewDescription('');
      setNewStartsAt('');
      setNewEndsAt('');
      setShowCreateForm(false);
    } catch (err) {
      setError(err.message);
    } finally {
      setCreating(false);
    }
  }

  function toLocalInputValue(isoString) {
    // convertit une date ISO en valeur compatible avec <input type="datetime-local">
    const d = new Date(isoString);
    const pad = (n) => String(n).padStart(2, '0');
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
  }

  function startEdit(exam) {
    setEditingId(exam.id);
    setEditTitle(exam.title);
    setEditDescription(exam.description);
    setEditStartsAt(toLocalInputValue(exam.startsAt));
    setEditEndsAt(toLocalInputValue(exam.endsAt));
    setError(null);
  }

  function cancelEdit() {
    setEditingId(null);
  }

  async function handleSaveEdit(id) {
    setError(null);
    try {
      const updated = await updateExam(
        id,
        {
          title: editTitle,
          description: editDescription,
          startsAt: new Date(editStartsAt).toISOString(),
          endsAt: new Date(editEndsAt).toISOString(),
        },
        token
      );
      setExams((prev) => prev.map((e) => (e.id === id ? updated : e)));
      setEditingId(null);
    } catch (err) {
      setError(err.message);
    }
  }

  async function handleDelete(id) {
    if (!confirm('Supprimer cet examen ?')) return;
    setError(null);
    try {
      await deleteExam(id, token);
      setExams((prev) => prev.filter((e) => e.id !== id));
    } catch (err) {
      // RG-09 : le serveur refuse (409) si l'examen a des tentatives
      setError(err.message);
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
    <div className="exams-page">
      <h1>Gestion des examens</h1>

      {error && <p className="error-message">{error}</p>}

      {!showCreateForm ? (
        <button onClick={() => setShowCreateForm(true)} disabled={courses.length === 0}>
          + Nouvel examen
        </button>
      ) : (
        <form onSubmit={handleCreate} className="create-exam-form">
          <select value={newCourseId} onChange={(e) => setNewCourseId(e.target.value)} required>
            <option value="">-- Choisir un cours --</option>
            {courses.map((c) => (
              <option key={c.id} value={c.id}>
                {c.code} — {c.name}
              </option>
            ))}
          </select>
          <input
            type="text"
            placeholder="Titre de l'examen"
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            required
          />
          <textarea
            placeholder="Description"
            value={newDescription}
            onChange={(e) => setNewDescription(e.target.value)}
          />
          <label>
            Début de la fenêtre
            <input
              type="datetime-local"
              value={newStartsAt}
              onChange={(e) => setNewStartsAt(e.target.value)}
              required
            />
          </label>
          <label>
            Fin de la fenêtre
            <input
              type="datetime-local"
              value={newEndsAt}
              onChange={(e) => setNewEndsAt(e.target.value)}
              required
            />
          </label>
          <button type="submit" disabled={creating}>
            {creating ? 'Création...' : 'Créer'}
          </button>
          <button type="button" onClick={() => setShowCreateForm(false)}>
            Annuler
          </button>
        </form>
      )}

      {courses.length === 0 && (
        <p className="info-banner">Créez d'abord un cours avant de pouvoir ajouter un examen.</p>
      )}

      <table>
        <thead>
          <tr>
            <th>Cours</th>
            <th>Titre</th>
            <th>Fenêtre</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {exams.map((exam) => (
            <tr key={exam.id}>
              {editingId === exam.id ? (
                <>
                  <td>{courseName(exam.courseId)}</td>
                  <td>
                    <input value={editTitle} onChange={(e) => setEditTitle(e.target.value)} />
                    <textarea
                      value={editDescription}
                      onChange={(e) => setEditDescription(e.target.value)}
                    />
                  </td>
                  <td>
                    <input
                      type="datetime-local"
                      value={editStartsAt}
                      onChange={(e) => setEditStartsAt(e.target.value)}
                    />
                    <input
                      type="datetime-local"
                      value={editEndsAt}
                      onChange={(e) => setEditEndsAt(e.target.value)}
                    />
                  </td>
                  <td>
                    <button onClick={() => handleSaveEdit(exam.id)}>Enregistrer</button>
                    <button onClick={cancelEdit}>Annuler</button>
                  </td>
                </>
              ) : (
                <>
                  <td>{exam.courseName ?? courseName(exam.courseId)}</td>
                  <td>
                    <strong>{exam.title}</strong>
                    <p>{exam.description}</p>
                  </td>
                  <td>
                    {formatDate(exam.startsAt)} → {formatDate(exam.endsAt)}
                  </td>
                  <td>
                    <Link to={`/admin/exams/${exam.id}/questions`}>Questions</Link>
                    <Link to={`/admin/exams/${exam.id}/results`}>Résultats</Link>
                    <button onClick={() => startEdit(exam)}>Modifier</button>
                    <button onClick={() => handleDelete(exam.id)}>Supprimer</button>
                  </td>
                </>
              )}
            </tr>
          ))}
        </tbody>
      </table>

      {exams.length === 0 && <p>Aucun examen pour le moment.</p>}
    </div>
  );
}