// src/api/auth.api.js
import { request, USE_MOCKS } from './client';
import { mockApi } from './mocks/mockApi';

export async function login(email, password) {
  if (USE_MOCKS) {
    return mockApi.login(email, password);
  }
  return request('/auth/login', { method: 'POST', body: { email, password } });
}