/**
 * src/services/donation.service.js
 * ─────────────────────────────────────────────────────────────────────────────
 * Reads donation records from localStorage (ls_donations) — populated by AppDataContext.
 * Swap for real API calls when backend is ready.
 */

import api from '../utils/api';

/** Fetch the current user's donation history records */
export const fetchDonations = async (userId) => {
  try {
    const res = await api.get('donations/');
    const all = res.data.map(d => ({
      id: d.id,
      date: new Date(d.date_donated).toLocaleDateString(),
      hospital: d.hospital_name || 'N/A',
      location: d.city || '—',
      type: d.urgency || 'ROUTINE',
      volume: `${d.units || 1} Unit(s)`,
      component: 'Whole Blood',
      status: 'completed',
      userId: d.donor,
    }));
    if (userId) return all.filter((d) => d.userId === userId);
    return all;
  } catch (error) {
    console.error("Failed to fetch donations", error);
    return [];
  }
};
