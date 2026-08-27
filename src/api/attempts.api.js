// src/api/attempts.api.js
import { request, USE_MOCKS } from './client';
import { mockApi } from './mocks/mockApi';

// examens disponibles : fenêtre ouverte + pas encore passés par l'étudiant connecté
export async function getMyExams(token) {
  if (USE_MOCKS) return mockApi.getMyExams();
  return request('/my/exams', { token });
}

// questions SANS l'info "correct" (RG-07) ; -> 403 hors fenêtre, 409 si déjà passé
export async function getMyExam(id, token) {
  if (USE_MOCKS) return mockApi.getMyExam(id);
  return request(`/my/exams/${id}`, { token });
}

// answers: [{ questionId, choiceId }] — soumission partielle autorisée (RG-05)
// -> renvoie immédiatement la note + correction complète (RG-12)
// -> 409 si déjà tenté (RG-02), 403 si hors fenêtre (RG-03)
export async function submitExam(id, answers, token) {
  if (USE_MOCKS) return mockApi.submitExam(id, { answers });
  return request(`/my/exams/${id}/submit`, { method: 'POST', body: { answers }, token });
}

// historique des résultats de l'étudiant connecté
export async function getMyResults(token) {
  if (USE_MOCKS) return mockApi.getMyResults();
  return request('/my/results', { token });
}

// route d'extension : détail complet d'une tentative passée (correction), pour revoir
// un ancien résultat depuis l'historique (cf exam-hub-api-contract.md)
export async function getMyResultDetail(attemptId, token) {
  if (USE_MOCKS) return mockApi.getMyResultDetail(attemptId);
  return request(`/my/results/${attemptId}`, { token });
}