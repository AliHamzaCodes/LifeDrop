import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api from '../utils/api';

const STORAGE_KEY = 'ls_user';
const TOKEN_KEY   = 'access_token';

const AuthContext = createContext<any>(null);

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  });

  const isLoggedIn = Boolean(currentUser);

  useEffect(() => {
    if (currentUser) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(currentUser));
    } else {
      localStorage.removeItem(STORAGE_KEY);
      localStorage.removeItem(TOKEN_KEY);
    }
  }, [currentUser]);

  const mapBackendUser = (userData) => ({
    id: userData.id,
    fullName: userData.profile?.hospital_name || userData.username,
    username: userData.username,
    email: userData.email,
    bloodGroup: userData.profile?.blood_group,
    role: userData.role,
    phone: userData.profile?.phone_number,
    city: userData.profile?.city,
    badge: userData.profile?.badge,
    donationsMade: userData.profile?.donations_made,
    lastDonationDate: userData.profile?.last_donation_date,
    avatar: userData.profile?.avatar,
    hospitalName: userData.profile?.hospital_name,
    address: userData.profile?.address,
    helpline: userData.profile?.helpline,
    licenseNumber: userData.profile?.license_number,
  });

  const login = useCallback(async (emailOrUsername, password) => {
    try {
      const res = await api.post('auth/token/', { username: emailOrUsername, password });
      
      const { access, refresh } = res.data;
      localStorage.setItem(TOKEN_KEY, access);
      
      const userRes = await api.get('users/me/');
      const mappedUser = mapBackendUser(userRes.data);
      
      setCurrentUser(mappedUser);
      return { ok: true, user: mappedUser };
    } catch (err: any) {
      console.error("Login Error:", err.response?.data || err.message);
      return { ok: false, error: err.response?.data?.detail || 'Invalid credentials or server error.' };
    }
  }, []);

  const register = useCallback(async ({ 
    fullName, email, password, bloodGroup, phone, city, 
    role = 'DONOR', hospitalName = '', address = '', helpline = '', licenseNumber = '' 
  }: any) => {
    try {
      const username = email.split('@')[0].replace(/[^a-zA-Z0-9_]/g, '_');
      const payload = {
        username,
        email,
        password,
        role: role === 'HOSPITAL' || email.toLowerCase() === 'admin@lifestream.com' ? 'HOSPITAL' : 'DONOR',
        profile: {
          blood_group: bloodGroup || '',
          phone_number: phone || '',
          city: city || '',
          hospital_name: hospitalName || (role === 'HOSPITAL' ? fullName : ''),
          address: address || '',
          helpline: helpline || phone || '',
          license_number: licenseNumber || ''
        }
      };
      
      await api.post('users/', payload);
      return await login(email, password);
    } catch (err: any) {
      console.error("Registration Error:", err.response?.data || err.message);
      return { ok: false, error: err.response?.data?.detail || 'Registration failed. Email/Username might already exist.' };
    }
  }, [login]);

  const logout = useCallback(() => {
    setCurrentUser(null);
  }, []);

  const updateCurrentUser = useCallback(async (updates) => {
    setCurrentUser(prev => ({ ...prev, ...updates }));
  }, []);

  const changePassword = useCallback(async ({ currentPassword, newPassword }) => {
    return { ok: false, error: 'Password change via API not implemented yet.' };
  }, []);

  const value = { isLoggedIn, currentUser, login, register, logout, updateCurrentUser, changePassword };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>');
  return ctx;
};

export default AuthContext;
