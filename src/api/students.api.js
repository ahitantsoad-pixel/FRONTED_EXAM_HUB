// src/api/students.api.js
import { request, USE_MOCKS } from './client';
import { mockApi } from './mocks/mockApi';

export async function getStudents(token) {
  if (USE_MOCKS) return mockApi.getStudents();
  return request('/students', { token });
}

export async function createStudent(data, token) {
  if (USE_MOCKS) return mockApi.createStudent(data);
  return request('/students', { method: 'POST', body: data, token });
}

// data: { name?, email? } — modification d'identité uniquement
export async function updateStudent(id, data, token) {
  if (USE_MOCKS) return mockApi.updateStudent(id, data);
  return request(`/students/${id}`, { method: 'PUT', body: data, token });
}

// route d'extension dédiée : reset = action avec effet de bord (génère un mdp),
// pas une simple mise à jour de champ (cf exam-hub-api-contract.md)
export async function resetStudentPassword(id, token) {
  if (USE_MOCKS) return mockApi.resetStudentPassword(id);
  return request(`/students/${id}/reset-password`, { method: 'POST', token });
}

// DELETE = désactivation (RG-10), pas une suppression physique
export async function deleteStudent(id, token) {
  if (USE_MOCKS) return mockApi.deleteStudent(id);
  return request(`/students/${id}`, { method: 'DELETE', token });
}