// src/pages/admin/CoursesPage.jsx
import { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { getCourses, createCourse, updateCourse, deleteCourse } from '../../api/courses.api';

export default function CoursesPage() {
  const { token } = useAuth();

  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // formulaire de création
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newCode, setNewCode] = useState('');
  const [newName, setNewName] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [creating, setCreating] = useState(false);

  // édition en ligne
  const [editingId, setEditingId] = useState(null);
  const [editCode, setEditCode] = useState('');
  const [editName, setEditName] = useState('');
  const [editDescription, setEditDescription] = useState('');

  useEffect(() => {
    loadCourses();
  }, []);

  async function loadCourses() {
    setLoading(true);
    setError(null);
    try {
      const data = await getCourses(token);
      setCourses(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleCreate(e) {
    e.preventDefault();
    setError(null);
    setCreating(true);
    try {
      const created = await createCourse(
        { code: newCode, name: newName, description: newDescription },
        token
      );
      setCourses((prev) => [...prev, created]);
      setNewCode('');
      setNewName('');
      setNewDescription('');
      setShowCreateForm(false);
    } catch (err) {
      setError(err.message);
    } finally {
      setCreating(false);
    }
  }

  function startEdit(course) {
    setEditingId(course.id);
    setEditCode(course.code);
    setEditName(course.name);
    setEditDescription(course.description);
    setError(null);
  }

  function cancelEdit() {
    setEditingId(null);
  }

  async function handleSaveEdit(id) {
    setError(null);
    try {
      const updated = await updateCourse(
        id,
        { code: editCode, name: editName, description: editDescription },
        token
      );
      setCourses((prev) => prev.map((c) => (c.id === id ? updated : c)));
      setEditingId(null);
    } catch (err) {
      setError(err.message);
    }
  }

  async function handleDelete(id) {
    if (!confirm('Supprimer ce cours ?')) return;
    setError(null);
    try {
      await deleteCourse(id, token);
      setCourses((prev) => prev.filter((c) => c.id !== id));
    } catch (err) {
      // RG-09 : le serveur refuse (409) si le cours a des examens
      setError(err.message);
    }
  }

  if (loading) return <p>Chargement des cours...</p>;

  return (
    <div className="courses-page">
      <h1>Gestion des cours</h1>

      {error && <p className="error-message">{error}</p>}

      {!showCreateForm ? (
        <button onClick={() => setShowCreateForm(true)}>+ Nouveau cours</button>
      ) : (
        <form onSubmit={handleCreate} className="create-course-form">
          <input
            type="text"
            placeholder="Code (ex. PROG2)"
            value={newCode}
            onChange={(e) => setNewCode(e.target.value)}
            required
          />
          <input
            type="text"
            placeholder="Nom du cours"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            required
          />
          <textarea
            placeholder="Description"
            value={newDescription}
            onChange={(e) => setNewDescription(e.target.value)}
          />
          <button type="submit" disabled={creating}>
            {creating ? 'Création...' : 'Créer'}
          </button>
          <button type="button" onClick={() => setShowCreateForm(false)}>
            Annuler
          </button>
        </form>
      )}

      <table>
        <thead>
          <tr>
            <th>Code</th>
            <th>Nom</th>
            <th>Description</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {courses.map((course) => (
            <tr key={course.id}>
              {editingId === course.id ? (
                <>
                  <td>
                    <input value={editCode} onChange={(e) => setEditCode(e.target.value)} />
                  </td>
                  <td>
                    <input value={editName} onChange={(e) => setEditName(e.target.value)} />
                  </td>
                  <td>
                    <input
                      value={editDescription}
                      onChange={(e) => setEditDescription(e.target.value)}
                    />
                  </td>
                  <td>
                    <button onClick={() => handleSaveEdit(course.id)}>Enregistrer</button>
                    <button onClick={cancelEdit}>Annuler</button>
                  </td>
                </>
              ) : (
                <>
                  <td>{course.code}</td>
                  <td>{course.name}</td>
                  <td>{course.description}</td>
                  <td>
                    <button onClick={() => startEdit(course)}>Modifier</button>
                    <button onClick={() => handleDelete(course.id)}>Supprimer</button>
                  </td>
                </>
              )}
            </tr>
          ))}
        </tbody>
      </table>

      {courses.length === 0 && <p>Aucun cours pour le moment.</p>}
    </div>
  );
}