// src/components/layout/Sidebar.jsx
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const adminLinks = [
  { to: '/admin', label: 'Tableau de bord', end: true },
  { to: '/admin/students', label: 'Étudiants' },
  { to: '/admin/courses', label: 'Cours' },
  { to: '/admin/exams', label: 'Examens' },
];

const studentLinks = [
  { to: '/student', label: 'Examens disponibles', end: true },
  { to: '/student/results', label: 'Mes résultats' },
];

export default function Sidebar() {
  const { user } = useAuth();
  const links = user?.role === 'admin' ? adminLinks : studentLinks;

  return (
    <nav className="sidebar">
      <ul>
        {links.map((link) => (
          <li key={link.to}>
            <NavLink to={link.to} end={link.end}>
              {link.label}
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  );
}