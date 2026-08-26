// src/components/layout/Navbar.jsx
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate('/login', { replace: true });
  }

  return (
    <header className="navbar">
      <span className="navbar-title">Exam Hub</span>
      {user && (
        <div className="navbar-user">
          <span>{user.name} ({user.role === 'admin' ? 'Admin' : 'Étudiant'})</span>
          <button onClick={handleLogout}>Déconnexion</button>
        </div>
      )}
    </header>
  );
}