import React, { useState, useEffect } from 'react';
import { useAppData } from '../../context/AppDataContext';
import { useAuth } from '../../context/AuthContext';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faPlus,
  faMinus,
  faHospital,
  faDroplet,
  faTriangleExclamation,
  faBoxesStacked,
  faCheck,
  faArrowRotateRight,
  faUsers,
  faBullhorn,
  faPhone,
  faLocationDot,
  faClock,
  faPaperPlane,
  faBedPulse
} from '@fortawesome/free-solid-svg-icons';
import { faWhatsapp } from '@fortawesome/free-brands-svg-icons';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import api from '../../utils/api';
import { getWhatsAppUrl } from '../../utils/whatsapp';
import { 
  fetchCommunityDonors, 
  requestExternalDonors, 
  updateHospitalStock 
} from '../../services/hospital.service';
import AppSpinner from '../AppSpinner/AppSpinner';

const ALL_BLOOD_GROUPS = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
const CITIES = ['All', 'Lahore', 'Karachi', 'Islamabad', 'Rawalpindi', 'Multan'];

interface InventoryItem {
  id?: number;
  blood_group: string;
  units_available: number;
  last_updated?: string;
}

const HospitalPanel: React.FC = () => {
  const { requests, refreshData } = useAppData();
  const { currentUser } = useAuth();
  
  // Navigation Tabs: 'inventory' | 'request-donors' | 'community-donors'
  const [activeTab, setActiveTab] = useState<'inventory' | 'request-donors' | 'community-donors'>('inventory');

  // Inventory State
  const [inventory, setInventory] = useState<Record<string, number>>({
    'A+': 0, 'A-': 0, 'B+': 0, 'B-': 0, 'AB+': 0, 'AB-': 0, 'O+': 0, 'O-': 0
  });
  const [loadingInventory, setLoadingInventory] = useState(true);
  const [alert, setAlert] = useState<any>(null);

  // External Request Form State
  const [reqForm, setReqForm] = useState({
    patient_ref: '',
    blood_group: 'O+',
    units_needed: 2,
    urgency: 'CRITICAL',
    notes: '',
  });
  const [submittingReq, setSubmittingReq] = useState(false);

  // Community Donors State
  const [communityDonors, setCommunityDonors] = useState<any[]>([]);
  const [loadingDonors, setLoadingDonors] = useState(false);
  const [donorFilterGroup, setDonorFilterGroup] = useState('');
  const [donorFilterCity, setDonorFilterCity] = useState('All');

  const loadInventory = async () => {
    try {
      setLoadingInventory(true);
      const res = await api.get('inventory/');
      const data: InventoryItem[] = res.data.results || res.data;
      const map: Record<string, number> = {
        'A+': 0, 'A-': 0, 'B+': 0, 'B-': 0, 'AB+': 0, 'AB-': 0, 'O+': 0, 'O-': 0
      };
      data.forEach((item) => {
        if (item.blood_group) {
          map[item.blood_group] = item.units_available;
        }
      });
      setInventory(map);
    } catch (err) {
      console.error('Failed to load inventory', err);
    } finally {
      setLoadingInventory(false);
    }
  };

  const loadCommunityDonors = async () => {
    try {
      setLoadingDonors(true);
      const data = await fetchCommunityDonors({
        blood_group: donorFilterGroup || undefined,
        city: donorFilterCity !== 'All' ? donorFilterCity : undefined,
      });
      setCommunityDonors(data);
    } catch (err) {
      console.error('Failed to load community donors', err);
    } finally {
      setLoadingDonors(false);
    }
  };

  useEffect(() => {
    api.get('analytics/predict_shortage/').then(res => {
      setAlert(res.data);
    }).catch(console.error);

    loadInventory();
  }, []);

  useEffect(() => {
    if (activeTab === 'community-donors') {
      loadCommunityDonors();
    }
  }, [activeTab, donorFilterGroup, donorFilterCity]);

  const handleStockChange = async (group: string, delta: number) => {
    const currentUnits = inventory[group] || 0;
    const newUnits = Math.max(0, currentUnits + delta);
    
    // Optimistic update
    setInventory(prev => ({ ...prev, [group]: newUnits }));

    try {
      await updateHospitalStock(group, newUnits);
      toast.success(`${group} stock updated to ${newUnits} units`, { id: `stock-${group}`, duration: 1500 });
    } catch (e) {
      console.error(e);
      toast.error(`Could not update stock for ${group}`);
      setInventory(prev => ({ ...prev, [group]: currentUnits }));
    }
  };

  const handleBroadcastRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reqForm.blood_group) {
      toast.error('Please select blood group');
      return;
    }

    setSubmittingReq(true);
    try {
      await requestExternalDonors({
        blood_group: reqForm.blood_group,
        units_needed: Number(reqForm.units_needed),
        urgency: reqForm.urgency,
        patient_ref: reqForm.patient_ref,
        notes: reqForm.notes,
      });
      toast.success('Emergency broadcast created! External donors have been alerted.', { duration: 4000 });
      setReqForm({
        patient_ref: '',
        blood_group: 'O+',
        units_needed: 2,
        urgency: 'CRITICAL',
        notes: '',
      });
      refreshData?.();
    } catch (err: any) {
      console.error('Broadcast request error:', err);
      toast.error(err.response?.data?.error || 'Failed to broadcast emergency request');
    } finally {
      setSubmittingReq(false);
    }
  };

  // Hospital's own requests
  const myHospitalRequests = requests.filter(
    (r) => r.hospital_name === currentUser?.fullName || r.hospital === currentUser?.fullName || r.userId === currentUser?.id
  );

  const criticalGroups = Object.entries(inventory).filter(([_, units]) => units < 3).map(([bg]) => bg);

  return (
    <section className="hospital-panel">
      {/* Predictive Shortage Warning */}
      {alert && (
        <div style={{
          background: '#fffbeb',
          borderLeft: '4px solid #f59e0b',
          padding: '16px 20px',
          marginBottom: '20px',
          borderRadius: '10px',
          display: 'flex',
          gap: '14px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.04)'
        }}>
          <FontAwesomeIcon icon={faTriangleExclamation} style={{ color: '#f59e0b', fontSize: '1.6rem', marginTop: '2px' }} />
          <div>
            <h4 style={{ margin: '0 0 4px 0', color: '#b45309', fontWeight: 700, fontSize: '1rem' }}>
              ML Predictive Blood Shortage Alert: {alert.city}
            </h4>
            <p style={{ margin: 0, fontSize: '0.875rem', color: '#92400e', lineHeight: 1.5 }}>
              <strong>Predicted Shortage:</strong> {alert.predicted_shortage} <br />
              {alert.reasoning} <strong>(Model Confidence: {alert.confidence})</strong>
            </p>
          </div>
        </div>
      )}

      {/* Hospital Command Center Header */}
      <div className="admin-panel__header" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px', marginBottom: '24px' }}>
        <div className="admin-panel__header-text">
          <div className="admin-panel__title-row" style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <span style={{ background: '#e0f2fe', color: '#0284c7', width: '44px', height: '44px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <FontAwesomeIcon icon={faHospital} style={{ fontSize: '1.3rem' }} />
            </span>
            <div>
              <h1 style={{ margin: 0, fontSize: '1.75rem', fontWeight: 800, color: '#0f172a' }}>
                {currentUser?.hospitalName || currentUser?.fullName || 'Hospital Blood Bank Command Center'}
              </h1>
              <p style={{ margin: '4px 0 0', color: '#64748b', fontSize: '0.9rem' }}>
                {currentUser?.address ? `${currentUser.address} • ` : ''}Manage Blood Bank Reserves, Request External Donors, and Summon Community Volunteers.
              </p>
            </div>
          </div>
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button 
            onClick={loadInventory} 
            className="btn btn-secondary" 
            title="Refresh Inventory" 
            style={{ padding: '9px 16px', borderRadius: '10px', border: '1px solid #cbd5e1', background: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 600 }}
          >
            <FontAwesomeIcon icon={faArrowRotateRight} />
            Refresh
          </button>
        </div>
      </div>

      {/* Tab Navigation Controls */}
      <div style={{
        display: 'flex',
        gap: '10px',
        borderBottom: '2px solid #e2e8f0',
        marginBottom: '24px',
        overflowX: 'auto',
        paddingBottom: '4px'
      }}>
        <button
          type="button"
          onClick={() => setActiveTab('inventory')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '12px 20px',
            borderRadius: '10px 10px 0 0',
            border: 'none',
            fontWeight: 700,
            fontSize: '0.95rem',
            cursor: 'pointer',
            background: activeTab === 'inventory' ? '#dc2626' : 'transparent',
            color: activeTab === 'inventory' ? '#ffffff' : '#475569',
            borderBottom: activeTab === 'inventory' ? '3px solid #b91c1c' : 'none',
            transition: 'all 0.2s ease'
          }}
        >
          <FontAwesomeIcon icon={faBoxesStacked} />
          Blood Bank Inventory
          {criticalGroups.length > 0 && (
            <span style={{ background: '#fee2e2', color: '#b91c1c', fontSize: '0.75rem', padding: '2px 6px', borderRadius: '999px', fontWeight: 800 }}>
              {criticalGroups.length} Low
            </span>
          )}
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('request-donors')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '12px 20px',
            borderRadius: '10px 10px 0 0',
            border: 'none',
            fontWeight: 700,
            fontSize: '0.95rem',
            cursor: 'pointer',
            background: activeTab === 'request-donors' ? '#dc2626' : 'transparent',
            color: activeTab === 'request-donors' ? '#ffffff' : '#475569',
            borderBottom: activeTab === 'request-donors' ? '3px solid #b91c1c' : 'none',
            transition: 'all 0.2s ease'
          }}
        >
          <FontAwesomeIcon icon={faBullhorn} />
          Emergency Patient Request (External Donors)
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('community-donors')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '12px 20px',
            borderRadius: '10px 10px 0 0',
            border: 'none',
            fontWeight: 700,
            fontSize: '0.95rem',
            cursor: 'pointer',
            background: activeTab === 'community-donors' ? '#dc2626' : 'transparent',
            color: activeTab === 'community-donors' ? '#ffffff' : '#475569',
            borderBottom: activeTab === 'community-donors' ? '3px solid #b91c1c' : 'none',
            transition: 'all 0.2s ease'
          }}
        >
          <FontAwesomeIcon icon={faUsers} />
          Community Donors Directory
        </button>
      </div>

      {/* TAB 1: BLOOD BANK INVENTORY */}
      {activeTab === 'inventory' && (
        <div className="animate-fade-in">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h2 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#1e293b', display: 'flex', alignItems: 'center', gap: '8px', margin: 0 }}>
              <FontAwesomeIcon icon={faBoxesStacked} style={{ color: '#0284c7' }} />
              Live Blood Units Available in Storage
            </h2>
            {criticalGroups.length > 0 && (
              <span style={{ fontSize: '0.85rem', background: '#fee2e2', color: '#b91c1c', padding: '6px 14px', borderRadius: '12px', fontWeight: 700 }}>
                ⚠️ Critical Shortage in: {criticalGroups.join(', ')}
              </span>
            )}
          </div>

          {loadingInventory ? (
            <div style={{ padding: '60px 0', textAlign: 'center' }}>
              <AppSpinner label="Loading Blood Inventory..." />
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(230px, 1fr))', gap: '16px' }}>
              {ALL_BLOOD_GROUPS.map((bg) => {
                const units = inventory[bg] || 0;
                const isCritical = units < 3;
                const isModerate = units >= 3 && units <= 8;
                const statusColor = isCritical ? '#dc2626' : isModerate ? '#d97706' : '#16a34a';
                const statusBg = isCritical ? '#fef2f2' : isModerate ? '#fffbeb' : '#f0fdf4';
                const statusLabel = isCritical ? 'Critical Low' : isModerate ? 'Moderate' : 'Safe Level';

                return (
                  <div
                    key={bg}
                    style={{
                      background: '#fff',
                      borderRadius: '14px',
                      border: `1.5px solid ${isCritical ? '#fca5a5' : '#e2e8f0'}`,
                      padding: '18px',
                      boxShadow: isCritical ? '0 6px 16px rgba(220, 38, 38, 0.08)' : '0 2px 8px rgba(0,0,0,0.03)',
                      transition: 'all 0.2s ease',
                      position: 'relative'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <div style={{
                        width: '46px', height: '46px', borderRadius: '10px',
                        background: statusBg, color: statusColor,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontWeight: 800, fontSize: '1.25rem'
                      }}>
                        {bg}
                      </div>
                      <span style={{
                        fontSize: '0.75rem',
                        fontWeight: 700,
                        color: statusColor,
                        background: statusBg,
                        padding: '4px 8px',
                        borderRadius: '6px'
                      }}>
                        {statusLabel}
                      </span>
                    </div>

                    <div style={{ margin: '16px 0 12px' }}>
                      <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px' }}>
                        <span style={{ fontSize: '2rem', fontWeight: 800, color: '#0f172a' }}>{units}</span>
                        <span style={{ fontSize: '0.85rem', color: '#64748b' }}>units in stock</span>
                      </div>
                      <div style={{ width: '100%', height: '6px', background: '#f1f5f9', borderRadius: '999px', marginTop: '8px', overflow: 'hidden' }}>
                        <div style={{
                          width: `${Math.min(100, (units / 20) * 100)}%`,
                          height: '100%',
                          background: statusColor,
                          borderRadius: '999px'
                        }} />
                      </div>
                    </div>

                    <div style={{ display: 'flex', gap: '8px', borderTop: '1px solid #f1f5f9', paddingTop: '12px' }}>
                      <button
                        onClick={() => handleStockChange(bg, -1)}
                        disabled={units <= 0}
                        style={{
                          flex: 1,
                          padding: '7px 0',
                          border: '1px solid #e2e8f0',
                          borderRadius: '8px',
                          background: '#f8fafc',
                          color: '#334155',
                          fontWeight: 700,
                          cursor: units <= 0 ? 'not-allowed' : 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '6px',
                          fontSize: '0.85rem'
                        }}
                        title="Deduct 1 unit (transfused)"
                      >
                        <FontAwesomeIcon icon={faMinus} /> 1 Unit
                      </button>

                      <button
                        onClick={() => handleStockChange(bg, 1)}
                        style={{
                          flex: 1,
                          padding: '7px 0',
                          border: 'none',
                          borderRadius: '8px',
                          background: '#0284c7',
                          color: '#fff',
                          fontWeight: 700,
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '6px',
                          fontSize: '0.85rem'
                        }}
                        title="Add 1 unit (received)"
                      >
                        <FontAwesomeIcon icon={faPlus} /> 1 Unit
                      </button>
                    </div>

                    {isCritical && (
                      <button
                        type="button"
                        onClick={() => {
                          setReqForm(prev => ({ ...prev, blood_group: bg }));
                          setActiveTab('request-donors');
                        }}
                        style={{
                          width: '100%',
                          marginTop: '10px',
                          padding: '6px 0',
                          background: '#fee2e2',
                          color: '#b91c1c',
                          border: '1px solid #fca5a5',
                          borderRadius: '6px',
                          fontSize: '0.78rem',
                          fontWeight: 700,
                          cursor: 'pointer'
                        }}
                      >
                        🚨 Request Donors for {bg}
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* TAB 2: REQUEST EXTERNAL DONORS */}
      {activeTab === 'request-donors' && (
        <div className="animate-fade-in" style={{ display: 'grid', gridTemplateColumns: 'minmax(320px, 460px) 1fr', gap: '24px' }}>
          {/* Emergency Request Form */}
          <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '16px', padding: '24px', boxShadow: '0 4px 16px rgba(0,0,0,0.04)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
              <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: '#fee2e2', color: '#dc2626', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <FontAwesomeIcon icon={faBedPulse} style={{ fontSize: '1.2rem' }} />
              </div>
              <div>
                <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 800, color: '#0f172a' }}>
                  Patient Emergency Blood Need
                </h3>
                <p style={{ margin: 0, fontSize: '0.82rem', color: '#64748b' }}>
                  Hospital stock depleted? Request verified community donors immediately.
                </p>
              </div>
            </div>

            <form onSubmit={handleBroadcastRequest}>
              <div style={{ marginBottom: '14px' }}>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                  Patient Name or MR Number
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Patient MR-88219 (Ward 4B)"
                  value={reqForm.patient_ref}
                  onChange={(e) => setReqForm({ ...reqForm, patient_ref: e.target.value })}
                  style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.95rem' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '14px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                    Required Blood Group
                  </label>
                  <select
                    value={reqForm.blood_group}
                    onChange={(e) => setReqForm({ ...reqForm, blood_group: e.target.value })}
                    style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.95rem', fontWeight: 700 }}
                  >
                    {ALL_BLOOD_GROUPS.map((bg) => (
                      <option key={bg} value={bg}>{bg}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                    Units Needed
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="10"
                    required
                    value={reqForm.units_needed}
                    onChange={(e) => setReqForm({ ...reqForm, units_needed: Number(e.target.value) })}
                    style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.95rem', fontWeight: 700 }}
                  />
                </div>
              </div>

              <div style={{ marginBottom: '14px' }}>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                  Urgency Level
                </label>
                <select
                  value={reqForm.urgency}
                  onChange={(e) => setReqForm({ ...reqForm, urgency: e.target.value })}
                  style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.95rem', fontWeight: 700, color: reqForm.urgency === 'CRITICAL' ? '#dc2626' : '#d97706' }}
                >
                  <option value="CRITICAL">🚨 CRITICAL (Within 2 Hours)</option>
                  <option value="HIGH">⚡ HIGH (Today)</option>
                  <option value="ROUTINE">📅 ROUTINE (Within 48 Hours)</option>
                </select>
              </div>

              <div style={{ marginBottom: '18px' }}>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                  Clinical Notes / Attendant Contact Info
                </label>
                <textarea
                  rows={3}
                  placeholder="e.g. ICU Bed 12. Attendant phone: 0300-1122334. Contact Blood Bank Counter."
                  value={reqForm.notes}
                  onChange={(e) => setReqForm({ ...reqForm, notes: e.target.value })}
                  style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.9rem' }}
                />
              </div>

              <button
                type="submit"
                disabled={submittingReq}
                style={{
                  width: '100%',
                  padding: '12px 18px',
                  borderRadius: '10px',
                  background: '#dc2626',
                  color: '#ffffff',
                  fontWeight: 800,
                  fontSize: '0.95rem',
                  border: 'none',
                  cursor: submittingReq ? 'not-allowed' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  boxShadow: '0 4px 12px rgba(220, 38, 38, 0.25)'
                }}
              >
                <FontAwesomeIcon icon={faPaperPlane} />
                {submittingReq ? 'Broadcasting Emergency...' : 'Broadcast Request to External Donors'}
              </button>
            </form>
          </div>

          {/* Active Hospital Requests List */}
          <div>
            <h3 style={{ margin: '0 0 16px', fontSize: '1.2rem', fontWeight: 800, color: '#0f172a' }}>
              Your Hospital's Active External Requests ({myHospitalRequests.length})
            </h3>

            {myHospitalRequests.length === 0 ? (
              <div style={{ background: '#f8fafc', borderRadius: '12px', border: '1px dashed #cbd5e1', padding: '40px 20px', textAlign: 'center' }}>
                <FontAwesomeIcon icon={faBullhorn} style={{ fontSize: '2rem', color: '#94a3b8', marginBottom: '12px' }} />
                <h4 style={{ margin: '0 0 6px', color: '#475569' }}>No Active External Broadcasts</h4>
                <p style={{ margin: 0, fontSize: '0.85rem', color: '#64748b' }}>
                  When your blood bank faces a shortage for an admitted patient, broadcast an emergency request using the form on the left.
                </p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                {myHospitalRequests.map((req) => (
                  <div
                    key={req.id}
                    style={{
                      background: '#ffffff',
                      border: '1px solid #e2e8f0',
                      borderRadius: '12px',
                      padding: '18px',
                      boxShadow: '0 2px 8px rgba(0,0,0,0.03)',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      flexWrap: 'wrap',
                      gap: '12px'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                      <div style={{
                        width: '44px', height: '44px', borderRadius: '10px',
                        background: '#fee2e2', color: '#dc2626',
                        fontWeight: 800, fontSize: '1.2rem',
                        display: 'flex', alignItems: 'center', justifyContent: 'center'
                      }}>
                        {req.blood || req.required_blood_group}
                      </div>
                      <div>
                        <h4 style={{ margin: 0, fontSize: '1rem', fontWeight: 800, color: '#0f172a' }}>
                          Patient: {req.patient || req.hospital || 'Admitted Patient'}
                        </h4>
                        <p style={{ margin: '3px 0 0', fontSize: '0.82rem', color: '#64748b' }}>
                          {req.units || req.units_needed} Unit(s) needed • Status: <strong style={{ color: '#0284c7' }}>{req.status}</strong>
                        </p>
                      </div>
                    </div>

                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button
                        type="button"
                        onClick={() => {
                          setDonorFilterGroup(req.blood || req.required_blood_group);
                          setActiveTab('community-donors');
                        }}
                        style={{
                          padding: '8px 14px',
                          borderRadius: '8px',
                          background: '#f1f5f9',
                          border: '1px solid #cbd5e1',
                          color: '#0f172a',
                          fontWeight: 700,
                          fontSize: '0.82rem',
                          cursor: 'pointer'
                        }}
                      >
                        <FontAwesomeIcon icon={faUsers} style={{ marginRight: '6px' }} />
                        Summon Matching Donors
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 3: COMMUNITY DONORS DIRECTORY */}
      {activeTab === 'community-donors' && (
        <div className="animate-fade-in">
          {/* Filter Bar */}
          <div style={{
            background: '#ffffff',
            border: '1px solid #e2e8f0',
            borderRadius: '12px',
            padding: '16px',
            marginBottom: '20px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '12px'
          }}>
            <div>
              <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 800, color: '#0f172a' }}>
                Contact Registered Community Donors
              </h3>
              <p style={{ margin: '2px 0 0', fontSize: '0.85rem', color: '#64748b' }}>
                Filter donors by blood group and city to directly call or WhatsApp them to hospital.
              </p>
            </div>

            <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
              <select
                value={donorFilterGroup}
                onChange={(e) => setDonorFilterGroup(e.target.value)}
                style={{ padding: '8px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontWeight: 700 }}
              >
                <option value="">All Blood Groups</option>
                {ALL_BLOOD_GROUPS.map((bg) => (
                  <option key={bg} value={bg}>{bg}</option>
                ))}
              </select>

              <select
                value={donorFilterCity}
                onChange={(e) => setDonorFilterCity(e.target.value)}
                style={{ padding: '8px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontWeight: 600 }}
              >
                {CITIES.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
          </div>

          {loadingDonors ? (
            <div style={{ padding: '60px 0', textAlign: 'center' }}>
              <AppSpinner label="Searching verified community donors..." />
            </div>
          ) : communityDonors.length === 0 ? (
            <div style={{ background: '#f8fafc', borderRadius: '12px', padding: '40px 20px', textAlign: 'center' }}>
              <h4 style={{ color: '#475569' }}>No Donors Found</h4>
              <p style={{ color: '#64748b', fontSize: '0.85rem' }}>Try clearing filters to view all donors across Pakistan.</p>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '16px' }}>
              {communityDonors.map((donor) => {
                const hospitalName = currentUser?.hospitalName || currentUser?.fullName || 'Hospital Blood Bank';
                const waText = `Assalam-o-Alaikum ${donor.name || 'Donor'}, This is an urgent call from ${hospitalName}. We have an admitted patient needing ${donor.blood_group} blood immediately. Can you please come to donate?`;
                const waUrl = getWhatsAppUrl(donor.phone_number, waText);

                return (
                  <div
                    key={donor.id}
                    style={{
                      background: '#ffffff',
                      border: '1px solid #e2e8f0',
                      borderRadius: '14px',
                      padding: '18px',
                      boxShadow: '0 2px 8px rgba(0,0,0,0.03)',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '12px'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <div>
                        <h4 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 800, color: '#0f172a' }}>
                          {donor.name || 'Community Donor'}
                        </h4>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '0.82rem', color: '#64748b', marginTop: '4px' }}>
                          <FontAwesomeIcon icon={faLocationDot} style={{ color: '#dc2626' }} />
                          <span>{donor.city || 'Pakistan'}</span>
                        </div>
                      </div>
                      <div style={{
                        width: '38px', height: '38px', borderRadius: '8px',
                        background: '#fee2e2', color: '#dc2626',
                        fontWeight: 800, fontSize: '1rem',
                        display: 'flex', alignItems: 'center', justifyContent: 'center'
                      }}>
                        {donor.blood_group}
                      </div>
                    </div>

                    <div style={{ fontSize: '0.82rem', color: '#64748b', background: '#f8fafc', padding: '8px 12px', borderRadius: '8px' }}>
                      <span>Donations Made: <strong>{donor.donations_made || 0}</strong></span> • 
                      <span> Last: <strong>{donor.last_donation_date || 'Never'}</strong></span>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginTop: 'auto' }}>
                      <a
                        href={`tel:${donor.phone_number}`}
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '6px',
                          padding: '9px 12px',
                          borderRadius: '8px',
                          background: '#f1f5f9',
                          color: '#0f172a',
                          fontWeight: 700,
                          fontSize: '0.85rem',
                          textDecoration: 'none'
                        }}
                      >
                        <FontAwesomeIcon icon={faPhone} />
                        Call
                      </a>

                      <a
                        href={waUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '6px',
                          padding: '9px 12px',
                          borderRadius: '8px',
                          background: '#25d366',
                          color: '#ffffff',
                          fontWeight: 700,
                          fontSize: '0.85rem',
                          textDecoration: 'none'
                        }}
                      >
                        <FontAwesomeIcon icon={faWhatsapp} />
                        WhatsApp
                      </a>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </section>
  );
};

export default HospitalPanel;
