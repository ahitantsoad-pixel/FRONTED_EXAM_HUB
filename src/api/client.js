// src/api/client.js
import { ApiError } from './mocks/mockApi';

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';
const USE_MOCKS = import.meta.env.VITE_USE_MOCKS === 'true';

export { ApiError, USE_MOCKS };

/**
 * Appel réseau réel vers le backend.
 * path : ex. "/students", "/exams/10/questions"
 * token : le JWT courant (depuis AuthContext), optionnel pour les routes publiques
 */
export async function request(path, { method = 'GET', body, token } = {}) {
  const res = await fetch(`${BASE_URL}${path}`, {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    throw new ApiError(res.status, data.message || 'Erreur inconnue du serveur.');
  }
  return data;
}