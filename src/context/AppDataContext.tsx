import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api from '../utils/api';

const AppDataContext = createContext<any>(null);

export const AppDataProvider = ({ children }) => {
  const [users, setUsers] = useState<any[]>([]);
  const [donors, setDonors] = useState<any[]>([]);
  const [requests, setRequests] = useState<any[]>([]);
  const [donations, setDonations] = useState<any[]>([]);

  // Fetch initial data from Django API
  useEffect(() => {
    const fetchData = async () => {
      try {
        const reqsRes = await api.get('requests/');
        setRequests(reqsRes.data);
        const donsRes = await api.get('donors/');
        setDonors(donsRes.data);
      } catch (err) {
        console.error('API fetch error', err);
      }
    };
    fetchData();
  }, []);

  const getStats = useCallback(() => {
    return {
      totalUsers: users.length,
      totalDonors: donors.length,
      pendingDonors: 0,
      activeRequests: requests.filter((r) => r.status === 'PENDING').length,
      totalLitres: 12.5, // Dummy calculation for now
      totalDonations: donations.length,
    };
  }, [users, donors, requests, donations]);

  const addRequest = useCallback(async (requestData) => {
    const payload = {
      hospital_name: requestData.hospital || 'Unknown',
      required_blood_group: requestData.bloodGroup || 'O+',
      city: requestData.location || 'Karachi',
      urgency: requestData.urgency?.toUpperCase() || 'ROUTINE',
      units_needed: parseInt(requestData.units) || 1,
    };
    try {
      const res = await api.post('requests/', payload);
      setRequests((prev) => [res.data, ...prev]);
      return res.data;
    } catch(e) {
      console.error(e);
      return null;
    }
  }, []);

  const updateRequest = useCallback(async (id, updates) => {
    const res = await api.patch(`requests/${id}/`, updates);
    setRequests((prev) => prev.map((r) => (r.id === id ? res.data : r)));
  }, []);

  const deleteRequest = useCallback(async (id) => {
    await api.delete(`requests/${id}/`);
    setRequests((prev) => prev.filter((r) => r.id !== id));
    return { ok: true };
  }, []);

  const getDonorById = useCallback((id) => donors.find(d => String(d.id) === String(id)), [donors]);

  const value = {
    users, donors, requests, donations,
    getStats,
    addRequest, updateRequest, deleteRequest,
    getDonorById,
  };

  return (
    <AppDataContext.Provider value={value}>
      {children}
    </AppDataContext.Provider>
  );
};

export const useAppData = () => {
  const ctx = useContext(AppDataContext);
  if (!ctx) throw new Error('useAppData must be used inside <AppDataProvider>');
  return ctx;
};

export default AppDataContext;
