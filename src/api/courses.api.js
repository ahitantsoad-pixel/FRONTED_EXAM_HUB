// src/api/courses.api.js
import { request, USE_MOCKS } from './client';
import { mockApi } from './mocks/mockApi';

export async function getCourses(token) {
  if (USE_MOCKS) return mockApi.getCourses();
  return request('/courses', { token });
}

export async function createCourse(data, token) {
  if (USE_MOCKS) return mockApi.createCourse(data);
  return request('/courses', { method: 'POST', body: data, token });
}

export async function updateCourse(id, data, token) {
  if (USE_MOCKS) return mockApi.updateCourse(id, data);
  return request(`/courses/${id}`, { method: 'PUT', body: data, token });
}

// -> 409 si le cours a des examens (RG-09)
export async function deleteCourse(id, token) {
  if (USE_MOCKS) return mockApi.deleteCourse(id);
  return request(`/courses/${id}`, { method: 'DELETE', token });
}