import api from '../utils/api';

/** Fetch summary data shown on the Dashboard Overview widget */
export const fetchDashboardData = async () => {
  try {
    const [reqRes, donorRes] = await Promise.all([
      api.get('requests/'),
      api.get('donors/')
    ]);

    const reqResults = reqRes.data.results || reqRes.data;
    const donorResults = donorRes.data.results || donorRes.data;

    /* Active (pending) requests for dashboard overview */
    const activeRequests = reqResults
      .filter((r) => r.status === 'PENDING')
      .slice(0, 5)
      .map((r) => ({
        id:       r.id,
        blood:    r.required_blood_group,
        urgency:  r.urgency || 'ROUTINE',
        hospital: r.hospital_name || 'Hospital',
        distance: r.distance || '', 
        location: r.city || r.location || '—',
        time:     r.created_at ? new Date(r.created_at).toLocaleDateString() : 'Recently',
        note:     r.urgency || 'Standard',
        userId:   r.patient,
        units: r.units_needed,
        unitsFulfilled: r.units_fulfilled,
        acceptedDonors: r.accepted_donors || [],
      }));

    /* Nearby donors */
    const nearbyDonors = donorResults.slice(0, 5).map((d) => ({
      id:       d.id,
      name:     d.name,
      distance: d.city, // We'll show city for now since we don't have km calc on frontend yet
      blood:    d.blood_group,
      initials: (d.name || 'XX').split('_').map(w => w[0]).join('').toUpperCase().slice(0, 2),
    }));

    return { activeRequests, nearbyDonors };
  } catch (error) {
    console.error("Failed to fetch dashboard data:", error);
    return { activeRequests: [], nearbyDonors: [] };
  }
};
