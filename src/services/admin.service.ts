/**
 * src/services/admin.service.js
 * ─────────────────────────────────────────────────────────────────────────────
 * Reads all admin data from localStorage — populated by AppDataContext.
 * Swap for real API calls when backend is ready.
 */

import api from '../utils/api';

/** Fetch all blood requests for admin review */
export const fetchAdminRequests = async () => {
  try {
    const res = await api.get('requests/');
    return res.data;
  } catch (err) {
    console.error(err);
    return [];
  }
};

/** Fetch all registered donors for admin management */
export const fetchAdminDonors = async () => {
  try {
    const res = await api.get('donors/');
    return res.data;
  } catch (err) {
    console.error(err);
    return [];
  }
};

/** Fetch all registered users for admin management */
export const fetchAdminUsers = async () => {
  try {
    const res = await api.get('users/');
    return res.data;
  } catch (err) {
    console.error(err);
    return [];
  }
};
