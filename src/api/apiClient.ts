/**
 * src/api/apiClient.js
 * ─────────────────────────────────────────────────────────────────────────────
 * Axios HTTP client — ready to connect to the real backend.
 *
 * Configuration:
 *   Set VITE_API_BASE_URL in your .env file:
 *     VITE_API_BASE_URL=https://api.lifestream.app/v1
 *
 * Current state:
 *   The app still uses apiSimulator.js for all calls.
 *   When the backend is ready, replace `simulateApi(...)` in each service
 *   file with `apiClient.get(...)`, `apiClient.post(...)`, etc.
 *
 * ─── How to switch a service ─────────────────────────────────────────────────
 * BEFORE (mock):
 *   export const fetchDonors = () => simulateApi(donorsData);
 *
 * AFTER (real backend):
 *   export const fetchDonors = () => apiClient.get('/donors').then(r => r.data);
 * ─────────────────────────────────────────────────────────────────────────────
 */

import axios from 'axios';

// ── Create instance ────────────────────────────────────────────────────────────
const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:3001/api/v1',
  timeout: 15_000,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
});

// ── Request Interceptor ────────────────────────────────────────────────────────
// Automatically attaches the JWT auth token to every outbound request.
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ── Response Interceptor ───────────────────────────────────────────────────────
// Normalises error messages and handles session expiry (401).
apiClient.interceptors.response.use(
  // Pass successful responses straight through
  (response) => response,

  (error) => {
    const status = error?.response?.status;

    if (status === 401) {
      // Session expired — clear local credentials and redirect to login
      localStorage.removeItem('authToken');
      localStorage.removeItem('currentUser');
      window.location.href = '/auth?session=expired';
    }

    if (status === 403) {
      console.warn('[apiClient] 403 Forbidden — insufficient permissions.');
    }

    if (status >= 500) {
      console.error('[apiClient] Server error:', error?.response?.data);
    }

    // Normalize the error so all callers get a consistent shape
    const normalizedError = new Error(
      error?.response?.data?.message ??
        error?.message ??
        'An unexpected error occurred.'
    );
    normalizedError.status = status;
    normalizedError.data = error?.response?.data;
    return Promise.reject(normalizedError);
  }
);

export default apiClient;
