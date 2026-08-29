import api from '../utils/api';
import { REQUEST_STATUS } from '../utils/status';

/** Fetch the current user's blood requests (Active Requests dashboard tab) or all if admin */
export const fetchRequests = async (userId, page = 1) => {
  try {
    const res = await api.get(`requests/?page=${page}`);
    const results = res.data.results || res.data;
    const all = results.map(r => ({
      id: r.id,
      bloodGroup: r.required_blood_group,
      hospital: r.hospital_name,
      patient: r.patient_name,
      neededBy: r.created_at ? new Date(new Date(r.created_at).getTime() + 2 * 24 * 60 * 60 * 1000).toLocaleDateString() : 'Soon', // Mock neededBy
      units: r.units_needed,
      unitsFulfilled: r.units_fulfilled,
      component: 'Whole Blood',
      status: r.status,
      urgency: r.urgency,
      distance: r.distance || '',
      time: r.created_at ? new Date(r.created_at).toLocaleDateString() : 'Recently',
      note: r.urgency || 'Standard',
      location: r.city || r.location || '—',
      contactNumber: r.patient_phone || '—',
      email: r.patient_email || '—',
      userId: r.patient,
      createdAt: r.created_at,
      acceptedDonors: r.accepted_donor_details || [],
      acceptedDonorsRaw: r.accepted_donors || [],
    }));

    if (userId) {
      const uidStr = String(userId);
      const filtered = all.filter(r => String(r.userId) === uidStr || (r.acceptedDonorsRaw && r.acceptedDonorsRaw.some(id => String(id) === uidStr)));
      return { results: filtered, count: res.data.count, next: res.data.next, previous: res.data.previous };
    }
    return { results: all, count: res.data.count, next: res.data.next, previous: res.data.previous };
  } catch (error) {
    console.error("Failed to fetch requests", error);
    return { results: [], count: 0, next: null, previous: null };
  }
};

/** Accept a blood request */
export const acceptRequest = async (requestId: number) => {
  try {
    const res = await api.post(`requests/${requestId}/accept/`);
    return { ok: true, data: res.data };
  } catch (error: any) {
    console.error("Failed to accept request", error);
    return { ok: false, error: error.response?.data?.error || 'Failed to accept' };
  }
};

export const cancelAcceptRequest = async (requestId: number) => {
  try {
    const res = await api.post(`requests/${requestId}/cancel_accept/`);
    return { ok: true, data: res.data };
  } catch (error: any) {
    console.error("Failed to cancel accept", error);
    return { ok: false, error: error.response?.data?.error || 'Failed to cancel' };
  }
};

export const fulfillRequest = async (requestId: number, donorId: number) => {
  try {
    const res = await api.post(`requests/${requestId}/fulfill/`, { donor_id: donorId });
    return { ok: true, data: res.data };
  } catch (error: any) {
    console.error("Failed to fulfill request", error);
    return { ok: false, error: error.response?.data?.error || 'Failed to fulfill' };
  }
};
