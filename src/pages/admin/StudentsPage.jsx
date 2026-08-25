// src/pages/admin/StudentsPage.jsx
import { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { getStudents, createStudent, updateStudent, deleteStudent } from '../../api/students.api';

export default function StudentsPage() {
  const { token } = useAuth();

  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // formulaire de création
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newName, setNewName] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [creating, setCreating] = useState(false);
  const [createdPassword, setCreatedPassword] = useState(null);

  // édition en ligne
  const [editingId, setEditingId] = useState(null);
  const [editName, setEditName] = useState('');
  const [editEmail, setEditEmail] = useState('');

  // mot de passe temporaire affiché après un reset
  const [resetPasswordInfo, setResetPasswordInfo] = useState(null);

  useEffect(() => {
    loadStudents();
  }, []);

  async function loadStudents() {
    setLoading(true);
    setError(null);
    try {
      const data = await getStudents(token);
      setStudents(data);
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
      const created = await createStudent({ name: newName, email: newEmail }, token);
      setStudents((prev) => [...prev, created]);
      setCreatedPassword(created.initialPassword ?? null);
      setNewName('');
      setNewEmail('');
      setShowCreateForm(false);
    } catch (err) {
      setError(err.message);
    } finally {
      setCreating(false);
    }
  }

  function startEdit(student) {
    setEditingId(student.id);
    setEditName(student.name);
    setEditEmail(student.email);
    setError(null);
  }

  function cancelEdit() {
    setEditingId(null);
  }

  async function handleSaveEdit(id) {
    setError(null);
    try {
      const updated = await updateStudent(id, { name: editName, email: editEmail }, token);
      setStudents((prev) => prev.map((s) => (s.id === id ? updated : s)));
      setEditingId(null);
    } catch (err) {
      setError(err.message);
    }
  }

  async function handleResetPassword(id) {
    setError(null);
    try {
      const result = await updateStudent(id, { resetPassword: true }, token);
      setResetPasswordInfo({ id, password: result.initialPassword });
    } catch (err) {
      setError(err.message);
    }
  }

  async function handleDeactivate(id) {
    if (!confirm('Désactiver cet étudiant ? Il ne pourra plus se connecter.')) return;
    setError(null);
    try {
      const updated = await deleteStudent(id, token);
      setStudents((prev) => prev.map((s) => (s.id === id ? updated : s)));
    } catch (err) {
      setError(err.message);
    }
  }

  if (loading) return <p>Chargement des étudiants...</p>;

  return (
    <div className="students-page">
      <h1>Gestion des étudiants</h1>

      {error && <p className="error-message">{error}</p>}

      {createdPassword && (
        <div className="info-banner">
          Étudiant créé. Mot de passe initial : <strong>{createdPassword}</strong>
          <button onClick={() => setCreatedPassword(null)}>Fermer</button>
        </div>
      )}

      {resetPasswordInfo && (
        <div className="info-banner">
          Nouveau mot de passe pour l'étudiant #{resetPasswordInfo.id} :{' '}
          <strong>{resetPasswordInfo.password}</strong>
          <button onClick={() => setResetPasswordInfo(null)}>Fermer</button>
        </div>
      )}

      {!showCreateForm ? (
        <button onClick={() => setShowCreateForm(true)}>+ Nouvel étudiant</button>
      ) : (
        <form onSubmit={handleCreate} className="create-student-form">
          <input
            type="text"
            placeholder="Nom complet"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            required
          />
          <input
            type="email"
            placeholder="Email"
            value={newEmail}
            onChange={(e) => setNewEmail(e.target.value)}
            required
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
            <th>Nom</th>
            <th>Email</th>
            <th>Statut</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {students.map((student) => (
            <tr key={student.id}>
              {editingId === student.id ? (
                <>
                  <td>
                    <input value={editName} onChange={(e) => setEditName(e.target.value)} />
                  </td>
                  <td>
                    <input value={editEmail} onChange={(e) => setEditEmail(e.target.value)} />
                  </td>
                  <td>{student.isActive ? 'Actif' : 'Désactivé'}</td>
                  <td>
                    <button onClick={() => handleSaveEdit(student.id)}>Enregistrer</button>
                    <button onClick={cancelEdit}>Annuler</button>
                  </td>
                </>
              ) : (
                <>
                  <td>{student.name}</td>
                  <td>{student.email}</td>
                  <td>{student.isActive ? 'Actif' : 'Désactivé'}</td>
                  <td>
                    <button onClick={() => startEdit(student)}>Modifier</button>
                    <button onClick={() => handleResetPassword(student.id)}>
                      Réinitialiser mdp
                    </button>
                    {student.isActive && (
                      <button onClick={() => handleDeactivate(student.id)}>Désactiver</button>
                    )}
                  </td>
                </>
              )}
            </tr>
          ))}
        </tbody>
      </table>

      {students.length === 0 && <p>Aucun étudiant pour le moment.</p>}
    </div>
  );
}