// src/api/questions.api.js
import { request, USE_MOCKS } from './client';
import { mockApi } from './mocks/mockApi';

// vue admin : questions avec l'info "correct" (RG-07 ne s'applique pas ici, c'est côté admin)
export async function getQuestions(examId, token) {
  if (USE_MOCKS) return mockApi.getQuestions(examId);
  return request(`/exams/${examId}/questions`, { token });
}

// data: { text, points, choices: [{ text, correct }] } — entre 2 et 6 choix, exactement 1 correct (RG-04)
export async function createQuestion(examId, data, token) {
  if (USE_MOCKS) return mockApi.createQuestion(examId, data);
  return request(`/exams/${examId}/questions`, { method: 'POST', body: data, token });
}

// -> 403 si l'examen a déjà des tentatives (RG-08, verrouillage)
export async function updateQuestion(id, data, token) {
  if (USE_MOCKS) return mockApi.updateQuestion(id, data);
  return request(`/questions/${id}`, { method: 'PUT', body: data, token });
}

// -> 403 si l'examen a déjà des tentatives (RG-08, verrouillage)
export async function deleteQuestion(id, token) {
  if (USE_MOCKS) return mockApi.deleteQuestion(id);
  return request(`/questions/${id}`, { method: 'DELETE', token });
}