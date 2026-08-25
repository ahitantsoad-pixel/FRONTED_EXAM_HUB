// src/api/exams.api.js
import { request, USE_MOCKS } from './client';
import { mockApi } from './mocks/mockApi';

export async function getExams(token, courseId) {
  if (USE_MOCKS) return mockApi.getExams(courseId);
  const query = courseId ? `?courseId=${courseId}` : '';
  return request(`/exams${query}`, { token });
}

export async function getExam(id, token) {
  if (USE_MOCKS) return mockApi.getExam(id);
  return request(`/exams/${id}`, { token });
}

export async function createExam(data, token) {
  if (USE_MOCKS) return mockApi.createExam(data);
  return request('/exams', { method: 'POST', body: data, token });
}

export async function updateExam(id, data, token) {
  if (USE_MOCKS) return mockApi.updateExam(id, data);
  return request(`/exams/${id}`, { method: 'PUT', body: data, token });
}

// -> 409 si l'examen a des tentatives (RG-09)
export async function deleteExam(id, token) {
  if (USE_MOCKS) return mockApi.deleteExam(id);
  return request(`/exams/${id}`, { method: 'DELETE', token });
}

// liste des étudiants + notes + moyenne + nb tentatives pour un examen
export async function getExamResults(examId, token) {
  if (USE_MOCKS) return mockApi.getExamResults(examId);
  return request(`/exams/${examId}/results`, { token });
}