// src/context/AuthContext.jsx
import { createContext, useContext, useState } from 'react';
import { login as loginApi } from '../api/auth.api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('exam-hub-user');
    return saved ? JSON.parse(saved) : null;
  });
  const [token, setToken] = useState(() => localStorage.getItem('exam-hub-token'));

  async function login(email, password) {
    const data = await loginApi(email, password);
    setUser(data.user);
    setToken(data.token);
    localStorage.setItem('exam-hub-user', JSON.stringify(data.user));
    localStorage.setItem('exam-hub-token', data.token);
    return data.user;
  }

  function logout() {
    setUser(null);
    setToken(null);
    localStorage.removeItem('exam-hub-user');
    localStorage.removeItem('exam-hub-token');
  }

  return (
    <AuthContext.Provider value={{ user, token, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}