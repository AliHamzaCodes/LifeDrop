import api from '../utils/api';

/** Fetch all registered donors (Search Blood page) */
export const fetchDonors = async (page = 1) => {
  try {
    const res = await api.get(`donors/?page=${page}`);
    const results = res.data.results || res.data;
    const mapped = results.map(d => ({
      id: d.id,
      name: d.name,
      bloodGroup: d.blood_group,
      city: d.city,
      phone: d.phone_number,
      latitude: d.latitude,
      longitude: d.longitude,
      km: d.distance || 0,
      avatarUrl: d.avatar,
      avatar: (d.name || 'XX').split('_').map(w => w[0]).join('').toUpperCase().slice(0, 2),
      status: 'verified',
      donations: d.donations_made || 0,
      lastDonated: d.last_donation_date ? new Date(d.last_donation_date).toLocaleDateString() : 'Never',
    }));
    return { results: mapped, count: res.data.count ?? mapped.length, next: res.data.next ?? null, previous: res.data.previous ?? null };
  } catch (error) {
    console.error("Failed to fetch donors", error);
    return { results: [], count: 0, next: null, previous: null };
  }
};

/** Fetch a single donor by slug (username) */
export const fetchDonorBySlug = async (slug) => {
  try {
    const res = await api.get(`donors/${slug}/`);
    const d = res.data;
    return {
      id: d.id,
      name: d.name,
      bloodGroup: d.blood_group,
      city: d.city,
      phone: d.phone_number,
      km: d.distance || 0,
      avatarUrl: d.avatar,
      avatar: (d.name || 'XX').split('_').map(w => w[0]).join('').toUpperCase().slice(0, 2),
      status: 'verified',
      donations: d.donations_made || 0,
      lastDonated: d.last_donation_date ? new Date(d.last_donation_date).toLocaleDateString() : 'Never',
      canContact: true,
    };
  } catch (error) {
    console.error(`Failed to fetch donor ${slug}`, error);
    return null;
  }
};
