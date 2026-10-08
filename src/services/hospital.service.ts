import api from '../utils/api';

export interface HospitalInventoryItem {
  blood_group: string;
  units_available: number;
  last_updated?: string;
}

export interface Hospital {
  id: number;
  user_id: number;
  username: string;
  email: string;
  hospital_name: string;
  city: string;
  address: string;
  phone_number: string;
  helpline: string;
  license_number: string;
  latitude?: number;
  longitude?: number;
  avatar?: string;
  is_verified: boolean;
  inventory: HospitalInventoryItem[];
}

export const fetchHospitals = async (params: { city?: string; search?: string } = {}) => {
  try {
    let url = 'hospitals/';
    const query = new URLSearchParams();
    if (params.city && params.city !== 'All') query.append('city', params.city);
    if (params.search) query.append('search', params.search);
    
    const queryString = query.toString();
    if (queryString) url += `?${queryString}`;

    const res = await api.get(url);
    const data = res.data;
    return (data.results || data) as Hospital[];
  } catch (error) {
    console.error('Failed to fetch hospitals:', error);
    return [];
  }
};

export const fetchMyHospitalInventory = async (): Promise<HospitalInventoryItem[]> => {
  try {
    const res = await api.get('hospitals/my_inventory/');
    return res.data;
  } catch (error) {
    console.error('Failed to fetch hospital inventory:', error);
    return [];
  }
};

export const updateHospitalStock = async (blood_group: string, units: number) => {
  const res = await api.post('inventory/set_stock/', { blood_group, units });
  return res.data;
};

export const requestExternalDonors = async (payload: {
  blood_group: string;
  units_needed: number;
  urgency: string;
  patient_ref?: string;
  notes?: string;
}) => {
  const res = await api.post('hospitals/request_external_donors/', payload);
  return res.data;
};

export const fetchCommunityDonors = async (params: { blood_group?: string; city?: string } = {}) => {
  try {
    let url = 'hospitals/community_donors/';
    const query = new URLSearchParams();
    if (params.blood_group) query.append('blood_group', params.blood_group);
    if (params.city && params.city !== 'All') query.append('city', params.city);
    
    const queryString = query.toString();
    if (queryString) url += `?${queryString}`;

    const res = await api.get(url);
    const data = res.data;
    return (data.results || data);
  } catch (error) {
    console.error('Failed to fetch community donors for hospital:', error);
    return [];
  }
};
