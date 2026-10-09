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
  faBedPulse,
  faArrowsRotate,
  faHandHoldingDroplet,
  faShieldHalved,
  faXmark
} from '@fortawesome/free-solid-svg-icons';
import { faWhatsapp } from '@fortawesome/free-brands-svg-icons';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import api from '../../utils/api';
import { getWhatsAppUrl } from '../../utils/whatsapp';
import { 
  fetchCommunityDonors, 
  requestExternalDonors, 
  updateHospitalStock,
  fetchBloodExchanges,
  completeBloodExchange,
  approveBloodExchange,
  rejectBloodExchange,
  createBloodExchange,
  BloodExchangeItem
} from '../../services/hospital.service';
import AppSpinner from '../AppSpinner/AppSpinner';
import './HospitalPanel.scss';

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
  
  // Navigation Tabs: 'inventory' | 'blood-exchange' | 'request-donors' | 'community-donors'
  const [activeTab, setActiveTab] = useState<'inventory' | 'blood-exchange' | 'request-donors' | 'community-donors'>('inventory');

  // Inventory State
  const [inventory, setInventory] = useState<Record<string, number>>({
    'A+': 0, 'A-': 0, 'B+': 0, 'B-': 0, 'AB+': 0, 'AB-': 0, 'O+': 0, 'O-': 0
  });
  const [loadingInventory, setLoadingInventory] = useState(true);
  const [alert, setAlert] = useState<any>(null);

  // Blood Exchanges State
  const [exchanges, setExchanges] = useState<BloodExchangeItem[]>([]);
  const [loadingExchanges, setLoadingExchanges] = useState(false);
  const [exchangeFilter, setExchangeFilter] = useState<'ALL' | 'PENDING' | 'APPROVED' | 'COMPLETED'>('ALL');
  const [showWalkinModal, setShowWalkinModal] = useState(false);
  const [walkinForm, setWalkinForm] = useState({
    patient_name: '',
    attendant_name: '',
    contact_number: '',
    required_blood_group: 'B+',
    offered_blood_group: 'A+',
    units: 1,
    urgency: 'CRITICAL',
    notes: 'Walk-in emergency counter exchange',
  });
  const [submittingWalkin, setSubmittingWalkin] = useState(false);

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

  const loadExchanges = async () => {
    try {
      setLoadingExchanges(true);
      const data = await fetchBloodExchanges();
      setExchanges(data);
    } catch (err) {
      console.error('Failed to load blood exchanges', err);
    } finally {
      setLoadingExchanges(false);
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
    loadExchanges();
  }, []);

  useEffect(() => {
    if (activeTab === 'community-donors') {
      loadCommunityDonors();
    } else if (activeTab === 'blood-exchange') {
      loadExchanges();
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

  const handleCompleteExchange = async (item: BloodExchangeItem) => {
    try {
      const res = await completeBloodExchange(item.id);
      toast.success(
        `Blood Exchange Complete! Received ${item.units} unit of ${item.offered_blood_group}, released ${item.units} unit of ${item.required_blood_group}.`,
        { duration: 5000, icon: '🔄' }
      );
      // Reload both exchanges and inventory
      await loadInventory();
      await loadExchanges();
    } catch (err: any) {
      console.error('Failed to complete exchange:', err);
      toast.error(err.response?.data?.error || 'Could not complete blood exchange');
    }
  };

  const handleApproveExchange = async (id: number) => {
    try {
      await approveBloodExchange(id);
      toast.success('Blood exchange approved! Ready for replacement donation at counter.');
      await loadExchanges();
    } catch (err) {
      toast.error('Could not approve exchange');
    }
  };

  const handleRejectExchange = async (id: number) => {
    try {
      await rejectBloodExchange(id);
      toast.error('Blood exchange rejected');
      await loadExchanges();
    } catch (err) {
      toast.error('Could not reject exchange');
    }
  };

  const handleCreateWalkinExchange = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser?.id) {
      toast.error('User authentication error');
      return;
    }
    setSubmittingWalkin(true);
    try {
      await createBloodExchange({
        hospital: currentUser.id,
        patient_name: walkinForm.patient_name,
        attendant_name: walkinForm.attendant_name,
        contact_number: walkinForm.contact_number,
        required_blood_group: walkinForm.required_blood_group,
        offered_blood_group: walkinForm.offered_blood_group,
        units: Number(walkinForm.units),
        urgency: walkinForm.urgency,
        notes: walkinForm.notes,
      });
      toast.success('Walk-in blood exchange logged successfully!');
      setShowWalkinModal(false);
      setWalkinForm({
        patient_name: '',
        attendant_name: '',
        contact_number: '',
        required_blood_group: 'B+',
        offered_blood_group: 'A+',
        units: 1,
        urgency: 'CRITICAL',
        notes: '',
      });
      await loadExchanges();
    } catch (err: any) {
      console.error('Failed to create walkin exchange', err);
      toast.error(err.response?.data?.error || 'Failed to submit exchange');
    } finally {
      setSubmittingWalkin(false);
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

  const totalUnitsInStock = Object.values(inventory).reduce((a, b) => a + b, 0);
  const criticalGroups = Object.entries(inventory).filter(([_, units]) => units < 3).map(([bg]) => bg);
  const pendingExchangesCount = exchanges.filter(x => x.status === 'PENDING').length;

  const filteredExchanges = exchanges.filter(item => {
    if (exchangeFilter === 'ALL') return true;
    return item.status === exchangeFilter;
  });

  return (
    <section className="hospital-panel">
      {/* Predictive Shortage Warning */}
      {alert && (
        <div className="hospital-panel__alert-box">
          <FontAwesomeIcon icon={faTriangleExclamation} className="alert-icon" />
          <div>
            <h4>ML Predictive Blood Shortage Alert: {alert.city}</h4>
            <p>
              <strong>Predicted Shortage:</strong> {alert.predicted_shortage} <br />
              {alert.reasoning} <strong>(Model Confidence: {alert.confidence})</strong>
            </p>
          </div>
        </div>
      )}

      {/* Hospital Command Center Header */}
      <div className="hospital-panel__header">
        <div className="hospital-panel__header-brand">
          <div className="hospital-panel__header-icon">
            <FontAwesomeIcon icon={faHospital} />
          </div>
          <div>
            <h1>
              {currentUser?.hospitalName || currentUser?.fullName || 'Hospital Blood Bank Command Center'}
            </h1>
            <p>
              {currentUser?.address ? `${currentUser.address} • ` : ''}Manage Live Blood Reserves, Mutual Blood Exchanges (خون کا تبادلہ), and External Donor Broadcasts.
            </p>
          </div>
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button 
            onClick={() => { loadInventory(); loadExchanges(); }} 
            className="btn btn-secondary" 
            title="Refresh All" 
            style={{ padding: '9px 18px', borderRadius: '12px', border: '1.5px solid #cbd5e1', background: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 700 }}
          >
            <FontAwesomeIcon icon={faArrowRotateRight} />
            Refresh Data
          </button>
        </div>
      </div>

      {/* Quick Metrics KPI Row */}
      <div className="hospital-panel__stats-row">
        <div className="hospital-panel__stat-box">
          <div className="stat-ico stat-ico--red">
            <FontAwesomeIcon icon={faBoxesStacked} />
          </div>
          <div className="stat-meta">
            <h3>{totalUnitsInStock}</h3>
            <span>Total Units in Stock</span>
          </div>
        </div>

        <div className="hospital-panel__stat-box">
          <div className="stat-ico stat-ico--amber">
            <FontAwesomeIcon icon={faTriangleExclamation} />
          </div>
          <div className="stat-meta">
            <h3>{criticalGroups.length}</h3>
            <span>Critical Groups (&lt;3 Units)</span>
          </div>
        </div>

        <div className="hospital-panel__stat-box">
          <div className="stat-ico stat-ico--purple">
            <FontAwesomeIcon icon={faArrowsRotate} />
          </div>
          <div className="stat-meta">
            <h3>{pendingExchangesCount}</h3>
            <span>Pending Blood Exchanges</span>
          </div>
        </div>

        <div className="hospital-panel__stat-box">
          <div className="stat-ico stat-ico--green">
            <FontAwesomeIcon icon={faBullhorn} />
          </div>
          <div className="stat-meta">
            <h3>{myHospitalRequests.length}</h3>
            <span>Active External Broadcasts</span>
          </div>
        </div>
      </div>

      {/* Modern Navigation Tabs */}
      <div className="hospital-panel__nav-tabs">
        <button
          type="button"
          onClick={() => setActiveTab('inventory')}
          className={`hospital-panel__tab-btn ${activeTab === 'inventory' ? 'hospital-panel__tab-btn--active' : ''}`}
        >
          <FontAwesomeIcon icon={faDroplet} />
          <span>Live Blood Bank Reserves</span>
          <span className="tab-badge">{totalUnitsInStock} Units</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('blood-exchange')}
          className={`hospital-panel__tab-btn ${activeTab === 'blood-exchange' ? 'hospital-panel__tab-btn--active' : ''}`}
        >
          <FontAwesomeIcon icon={faArrowsRotate} />
          <span>Blood Exchange Desk (خون کا تبادلہ)</span>
          {pendingExchangesCount > 0 ? (
            <span className="tab-badge tab-badge--alert">{pendingExchangesCount} Pending</span>
          ) : (
            <span className="tab-badge">{exchanges.length} Total</span>
          )}
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('request-donors')}
          className={`hospital-panel__tab-btn ${activeTab === 'request-donors' ? 'hospital-panel__tab-btn--active' : ''}`}
        >
          <FontAwesomeIcon icon={faBullhorn} />
          <span>Broadcast Donor Call</span>
          {myHospitalRequests.length > 0 && (
            <span className="tab-badge">{myHospitalRequests.length}</span>
          )}
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('community-donors')}
          className={`hospital-panel__tab-btn ${activeTab === 'community-donors' ? 'hospital-panel__tab-btn--active' : ''}`}
        >
          <FontAwesomeIcon icon={faUsers} />
          <span>Community Donors Directory</span>
        </button>
      </div>

      {/* TAB 1: INVENTORY MANAGER */}
      {activeTab === 'inventory' && (
        <div>
          {loadingInventory ? (
            <div style={{ padding: '60px 0', textAlign: 'center' }}>
              <AppSpinner label="Loading blood bank inventory..." />
            </div>
          ) : (
            <div className="hospital-panel__inventory-grid">
              {ALL_BLOOD_GROUPS.map((group) => {
                const units = inventory[group] || 0;
                const isCritical = units < 3;

                return (
                  <div
                    key={group}
                    className={`hospital-panel__group-card ${isCritical ? 'hospital-panel__group-card--critical' : ''}`}
                  >
                    <div className="card-top">
                      <div className="bg-badge">
                        <FontAwesomeIcon icon={faDroplet} />
                        <span>{group}</span>
                      </div>
                      <span className={`stock-status-pill ${isCritical ? 'stock-status-pill--critical' : 'stock-status-pill--ok'}`}>
                        {isCritical ? '⚠️ Low Stock' : '✓ Stocked'}
                      </span>
                    </div>

                    <div className="units-display">
                      <div className="units-num">{units}</div>
                      <div className="units-lbl">Units Available</div>
                    </div>

                    <div className="controls-row">
                      <button
                        type="button"
                        onClick={() => handleStockChange(group, -1)}
                        className="btn-decrement"
                        title="Deduct 1 Unit"
                      >
                        <FontAwesomeIcon icon={faMinus} /> 1 Unit
                      </button>
                      <button
                        type="button"
                        onClick={() => handleStockChange(group, 1)}
                        className="btn-increment"
                        title="Add 1 Unit"
                      >
                        <FontAwesomeIcon icon={faPlus} /> 1 Unit
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* TAB 2: BLOOD EXCHANGE DESK */}
      {activeTab === 'blood-exchange' && (
        <div className="hospital-panel__exchange-desk">
          {/* Top Banner Explaining the Feature */}
          <div className="hospital-panel__exchange-banner">
            <div className="banner-text">
              <span className="badge-tag">
                <FontAwesomeIcon icon={faShieldHalved} />
                MUTUAL REPLACEMENT PROGRAM (خون کا تبادلہ)
              </span>
              <h2>Instant Blood Replacement Desk</h2>
              <p>
                When an emergency patient urgently needs blood (e.g. <strong>B+</strong>), a family member or attendant can donate any replacement unit (e.g. <strong>A+</strong> or <strong>O+</strong>). The blood bank verifies the replacement donation and immediately releases the required unit to save the patient's life without delays.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setShowWalkinModal(true)}
              className="btn-new-exchange"
            >
              <FontAwesomeIcon icon={faPlus} /> Record Walk-In Exchange
            </button>
          </div>

          {/* Filter Pills */}
          <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
            <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#475569' }}>Filter by Status:</span>
            {(['ALL', 'PENDING', 'APPROVED', 'COMPLETED'] as const).map(st => (
              <button
                key={st}
                type="button"
                onClick={() => setExchangeFilter(st)}
                style={{
                  padding: '6px 14px',
                  borderRadius: '999px',
                  fontSize: '0.82rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  border: '1.5px solid',
                  borderColor: exchangeFilter === st ? '#dc2626' : '#e2e8f0',
                  background: exchangeFilter === st ? '#dc2626' : '#ffffff',
                  color: exchangeFilter === st ? '#ffffff' : '#475569',
                  transition: 'all 0.2s'
                }}
              >
                {st}
              </button>
            ))}
          </div>

          {/* Exchange Requests List */}
          {loadingExchanges ? (
            <div style={{ padding: '40px 0', textAlign: 'center' }}>
              <AppSpinner label="Loading blood exchange requests..." />
            </div>
          ) : filteredExchanges.length === 0 ? (
            <div style={{
              background: '#ffffff',
              borderRadius: '16px',
              border: '1px dashed #cbd5e1',
              padding: '50px 20px',
              textAlign: 'center'
            }}>
              <FontAwesomeIcon icon={faArrowsRotate} style={{ fontSize: '2.5rem', color: '#cbd5e1', marginBottom: '14px' }} />
              <h3 style={{ margin: '0 0 6px', color: '#0f172a' }}>No Blood Exchange Requests Found</h3>
              <p style={{ margin: 0, color: '#64748b', fontSize: '0.9rem' }}>
                Patients or attendants can request an exchange online, or you can record a walk-in exchange.
              </p>
            </div>
          ) : (
            <div className="hospital-panel__exchange-grid">
              {filteredExchanges.map((item) => {
                const waUrl = getWhatsAppUrl(
                  item.contact_number,
                  `Assalam-o-Alaikum, this is ${currentUser?.hospitalName || 'the Hospital Blood Bank'} regarding your Blood Exchange Request for Patient ${item.patient_name} (${item.offered_blood_group} for ${item.required_blood_group}).`
                );

                return (
                  <div key={item.id} className="hospital-panel__exchange-card">
                    <div className="card-header-row">
                      <div>
                        <h3>Patient: {item.patient_name}</h3>
                        <span style={{ fontSize: '0.78rem', color: '#64748b' }}>
                          Attendant / Donor: <strong>{item.attendant_name}</strong>
                        </span>
                      </div>
                      <span className={`status-pill status-pill--${item.status}`}>
                        {item.status}
                      </span>
                    </div>

                    {/* Swap Visual */}
                    <div className="exchange-swap-visual">
                      <div className="swap-unit">
                        <span className="label">Attendant Donates</span>
                        <div className="blood-pill blood-pill--offered">
                          🩸 {item.offered_blood_group} ({item.units} unit)
                        </div>
                      </div>

                      <div className="swap-arrow">
                        <FontAwesomeIcon icon={faArrowsRotate} />
                      </div>

                      <div className="swap-unit">
                        <span className="label">Hospital Issues</span>
                        <div className="blood-pill blood-pill--required">
                          🩸 {item.required_blood_group} ({item.units} unit)
                        </div>
                      </div>
                    </div>

                    {/* Meta info */}
                    <div className="exchange-meta">
                      <div className="meta-line">
                        <FontAwesomeIcon icon={faClock} style={{ color: '#94a3b8' }} />
                        <span>Urgency: <strong style={{ color: item.urgency === 'CRITICAL' ? '#dc2626' : '#d97706' }}>{item.urgency}</strong></span>
                      </div>
                      {item.notes && (
                        <div className="meta-line">
                          <span>Notes: <em>{item.notes}</em></span>
                        </div>
                      )}
                      <div className="meta-line">
                        <span>Contact: <strong>{item.contact_number}</strong></span>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="exchange-actions">
                      {item.status !== 'COMPLETED' && item.status !== 'REJECTED' && (
                        <button
                          type="button"
                          onClick={() => handleCompleteExchange(item)}
                          className="btn-complete-swap"
                          title="Verify replacement donation & automatically adjust blood bank units"
                        >
                          <FontAwesomeIcon icon={faCheck} /> Complete & Swap Stock
                        </button>
                      )}

                      {item.status === 'PENDING' && (
                        <button
                          type="button"
                          onClick={() => handleApproveExchange(item.id)}
                          className="btn-approve"
                        >
                          Approve
                        </button>
                      )}

                      {item.status === 'PENDING' && (
                        <button
                          type="button"
                          onClick={() => handleRejectExchange(item.id)}
                          className="btn-reject"
                        >
                          Reject
                        </button>
                      )}

                      <a href={`tel:${item.contact_number}`} className="btn-phone">
                        <FontAwesomeIcon icon={faPhone} /> Call
                      </a>

                      <a href={waUrl} target="_blank" rel="noopener noreferrer" className="btn-wa">
                        <FontAwesomeIcon icon={faWhatsapp} /> WhatsApp
                      </a>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* TAB 3: BROADCAST DONOR CALL */}
      {activeTab === 'request-donors' && (
        <div style={{ background: '#ffffff', border: '1px solid rgba(220, 38, 38, 0.12)', borderRadius: '20px', padding: '28px', boxShadow: '0 4px 20px rgba(0,0,0,0.03)' }}>
          <h2 style={{ margin: '0 0 8px', fontSize: '1.4rem', fontWeight: 800, color: '#0f172a' }}>
            Broadcast Emergency Blood Call to Community
          </h2>
          <p style={{ color: '#64748b', fontSize: '0.9rem', marginBottom: '24px' }}>
            If your blood bank is low on a critical blood group, broadcast an alert to verified donors registered in your city.
          </p>

          <form onSubmit={handleBroadcastRequest} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
            <div>
              <label style={{ display: 'block', fontWeight: 700, fontSize: '0.85rem', marginBottom: '8px', color: '#334155' }}>
                Required Blood Group *
              </label>
              <select
                value={reqForm.blood_group}
                onChange={(e) => setReqForm({ ...reqForm, blood_group: e.target.value })}
                style={{ width: '100%', padding: '12px 14px', borderRadius: '12px', border: '1.5px solid #cbd5e1', fontSize: '0.95rem' }}
              >
                {ALL_BLOOD_GROUPS.map(bg => (
                  <option key={bg} value={bg}>{bg}</option>
                ))}
              </select>
            </div>

            <div>
              <label style={{ display: 'block', fontWeight: 700, fontSize: '0.85rem', marginBottom: '8px', color: '#334155' }}>
                Units Needed *
              </label>
              <input
                type="number"
                min="1"
                max="20"
                value={reqForm.units_needed}
                onChange={(e) => setReqForm({ ...reqForm, units_needed: Number(e.target.value) })}
                style={{ width: '100%', padding: '12px 14px', borderRadius: '12px', border: '1.5px solid #cbd5e1', fontSize: '0.95rem' }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontWeight: 700, fontSize: '0.85rem', marginBottom: '8px', color: '#334155' }}>
                Urgency Level *
              </label>
              <select
                value={reqForm.urgency}
                onChange={(e) => setReqForm({ ...reqForm, urgency: e.target.value })}
                style={{ width: '100%', padding: '12px 14px', borderRadius: '12px', border: '1.5px solid #cbd5e1', fontSize: '0.95rem' }}
              >
                <option value="CRITICAL">Critical (Immediate / 2 Hours)</option>
                <option value="HIGH">High (Today)</option>
                <option value="ROUTINE">Routine (Next 48 Hours)</option>
              </select>
            </div>

            <div>
              <label style={{ display: 'block', fontWeight: 700, fontSize: '0.85rem', marginBottom: '8px', color: '#334155' }}>
                Patient Reference / Bed No
              </label>
              <input
                type="text"
                placeholder="e.g. ICU Bed #4 or Patient Ref #902"
                value={reqForm.patient_ref}
                onChange={(e) => setReqForm({ ...reqForm, patient_ref: e.target.value })}
                style={{ width: '100%', padding: '12px 14px', borderRadius: '12px', border: '1.5px solid #cbd5e1', fontSize: '0.95rem' }}
              />
            </div>

            <div style={{ gridColumn: 'span 2' }}>
              <label style={{ display: 'block', fontWeight: 700, fontSize: '0.85rem', marginBottom: '8px', color: '#334155' }}>
                Clinical Instructions / Notes
              </label>
              <textarea
                rows={3}
                placeholder="Any special cross-match instructions, attendant contact, or patient condition..."
                value={reqForm.notes}
                onChange={(e) => setReqForm({ ...reqForm, notes: e.target.value })}
                style={{ width: '100%', padding: '12px 14px', borderRadius: '12px', border: '1.5px solid #cbd5e1', fontSize: '0.95rem' }}
              />
            </div>

            <div style={{ gridColumn: 'span 2', display: 'flex', justifyContent: 'flex-end' }}>
              <button
                type="submit"
                disabled={submittingReq}
                className="btn btn-primary"
                style={{ padding: '12px 28px', borderRadius: '12px', fontWeight: 800 }}
              >
                <FontAwesomeIcon icon={faPaperPlane} />
                {submittingReq ? 'Broadcasting Alert...' : 'Broadcast Emergency Call'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* TAB 4: COMMUNITY DONORS DIRECTORY */}
      {activeTab === 'community-donors' && (
        <div style={{ background: '#ffffff', border: '1px solid rgba(220, 38, 38, 0.12)', borderRadius: '20px', padding: '24px', boxShadow: '0 4px 20px rgba(0,0,0,0.03)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '14px', marginBottom: '20px' }}>
            <div>
              <h2 style={{ margin: 0, fontSize: '1.35rem', fontWeight: 800, color: '#0f172a' }}>
                Verified Community Donors
              </h2>
              <p style={{ margin: '4px 0 0', color: '#64748b', fontSize: '0.85rem' }}>
                Contact verified local donors directly via phone or WhatsApp for urgent blood requirements.
              </p>
            </div>

            {/* Filter controls */}
            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
              <select
                value={donorFilterGroup}
                onChange={(e) => setDonorFilterGroup(e.target.value)}
                style={{ padding: '8px 12px', borderRadius: '10px', border: '1.5px solid #cbd5e1', fontSize: '0.85rem' }}
              >
                <option value="">All Blood Groups</option>
                {ALL_BLOOD_GROUPS.map(bg => (
                  <option key={bg} value={bg}>{bg}</option>
                ))}
              </select>

              <select
                value={donorFilterCity}
                onChange={(e) => setDonorFilterCity(e.target.value)}
                style={{ padding: '8px 12px', borderRadius: '10px', border: '1.5px solid #cbd5e1', fontSize: '0.85rem' }}
              >
                {CITIES.map(c => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
          </div>

          {loadingDonors ? (
            <div style={{ padding: '40px 0', textAlign: 'center' }}>
              <AppSpinner label="Searching verified donors..." />
            </div>
          ) : communityDonors.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px 0', color: '#64748b' }}>
              No donors found matching selected filters.
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '16px' }}>
              {communityDonors.map((d: any) => {
                const waUrl = getWhatsAppUrl(
                  d.phone_number,
                  `Assalam-o-Alaikum ${d.name}, this is ${currentUser?.hospitalName || 'Hospital Blood Bank'}. We urgently require blood group ${d.blood_group} for an emergency patient. Can you please donate?`
                );

                return (
                  <div
                    key={d.id}
                    style={{
                      border: '1px solid rgba(220, 38, 38, 0.12)',
                      borderRadius: '14px',
                      padding: '16px',
                      background: '#fff',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '10px'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <strong>{d.name}</strong>
                      <span style={{ background: '#dc2626', color: '#fff', padding: '3px 10px', borderRadius: '999px', fontWeight: 800, fontSize: '0.8rem' }}>
                        {d.blood_group}
                      </span>
                    </div>

                    <div style={{ fontSize: '0.8rem', color: '#64748b' }}>
                      <FontAwesomeIcon icon={faLocationDot} style={{ color: '#dc2626', marginRight: '6px' }} />
                      {d.city || 'Pakistan'} &bull; {d.donations_made || 0} donations
                    </div>

                    <div style={{ display: 'flex', gap: '8px', marginTop: 'auto', paddingTop: '8px' }}>
                      <a
                        href={`tel:${d.phone_number}`}
                        style={{
                          flex: 1,
                          textAlign: 'center',
                          padding: '7px',
                          borderRadius: '8px',
                          background: '#fef2f2',
                          color: '#dc2626',
                          fontWeight: 700,
                          fontSize: '0.8rem',
                          textDecoration: 'none'
                        }}
                      >
                        <FontAwesomeIcon icon={faPhone} /> Call
                      </a>
                      <a
                        href={waUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{
                          flex: 1,
                          textAlign: 'center',
                          padding: '7px',
                          borderRadius: '8px',
                          background: '#25d366',
                          color: '#fff',
                          fontWeight: 700,
                          fontSize: '0.8rem',
                          textDecoration: 'none'
                        }}
                      >
                        <FontAwesomeIcon icon={faWhatsapp} /> WhatsApp
                      </a>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* WALK-IN EXCHANGE MODAL */}
      {showWalkinModal && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0,0,0,0.6)',
          backdropFilter: 'blur(4px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: '20px'
        }}>
          <div style={{
            background: '#ffffff',
            borderRadius: '20px',
            maxWidth: '560px',
            width: '100%',
            padding: '28px',
            boxShadow: '0 20px 50px rgba(0,0,0,0.25)',
            maxHeight: '90vh',
            overflowY: 'auto'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <div>
                <h2 style={{ margin: 0, fontSize: '1.4rem', fontWeight: 800, color: '#0f172a' }}>
                  Record Walk-In Blood Exchange
                </h2>
                <span style={{ fontSize: '0.82rem', color: '#64748b' }}>
                  Mutual Replacement Donation at Counter (خون کا تبادلہ)
                </span>
              </div>
              <button
                type="button"
                onClick={() => setShowWalkinModal(false)}
                style={{ background: 'none', border: 'none', fontSize: '1.3rem', cursor: 'pointer', color: '#64748b' }}
              >
                <FontAwesomeIcon icon={faXmark} />
              </button>
            </div>

            <form onSubmit={handleCreateWalkinExchange} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: '6px', color: '#334155' }}>
                  Patient Full Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Asad Ullah"
                  value={walkinForm.patient_name}
                  onChange={(e) => setWalkinForm({ ...walkinForm, patient_name: e.target.value })}
                  style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', border: '1.5px solid #cbd5e1' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: '6px', color: '#334155' }}>
                    Attendant / Donor Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Tariq Mehmood (Brother)"
                    value={walkinForm.attendant_name}
                    onChange={(e) => setWalkinForm({ ...walkinForm, attendant_name: e.target.value })}
                    style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', border: '1.5px solid #cbd5e1' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: '6px', color: '#334155' }}>
                    Contact Mobile Number *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="0300-1234567"
                    value={walkinForm.contact_number}
                    onChange={(e) => setWalkinForm({ ...walkinForm, contact_number: e.target.value })}
                    style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', border: '1.5px solid #cbd5e1' }}
                  />
                </div>
              </div>

              {/* Blood Swap Selectors */}
              <div style={{
                background: '#fef2f2',
                border: '1.5px dashed rgba(220, 38, 38, 0.3)',
                borderRadius: '14px',
                padding: '16px',
                display: 'grid',
                gridTemplateColumns: '1fr auto 1fr',
                alignItems: 'center',
                gap: '12px'
              }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#166534', marginBottom: '6px' }}>
                    Attendant Donates (Offered)
                  </label>
                  <select
                    value={walkinForm.offered_blood_group}
                    onChange={(e) => setWalkinForm({ ...walkinForm, offered_blood_group: e.target.value })}
                    style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1.5px solid #86efac', fontWeight: 800 }}
                  >
                    {ALL_BLOOD_GROUPS.map(bg => (
                      <option key={bg} value={bg}>{bg}</option>
                    ))}
                  </select>
                </div>

                <div style={{ textAlign: 'center', fontSize: '1.2rem', color: '#dc2626' }}>
                  <FontAwesomeIcon icon={faArrowsRotate} />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#991b1b', marginBottom: '6px' }}>
                    Hospital Issues (Required)
                  </label>
                  <select
                    value={walkinForm.required_blood_group}
                    onChange={(e) => setWalkinForm({ ...walkinForm, required_blood_group: e.target.value })}
                    style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1.5px solid #fca5a5', fontWeight: 800 }}
                  >
                    {ALL_BLOOD_GROUPS.map(bg => (
                      <option key={bg} value={bg}>{bg}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: '6px', color: '#334155' }}>
                    Units to Exchange
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="5"
                    value={walkinForm.units}
                    onChange={(e) => setWalkinForm({ ...walkinForm, units: Number(e.target.value) })}
                    style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', border: '1.5px solid #cbd5e1' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: '6px', color: '#334155' }}>
                    Urgency
                  </label>
                  <select
                    value={walkinForm.urgency}
                    onChange={(e) => setWalkinForm({ ...walkinForm, urgency: e.target.value })}
                    style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', border: '1.5px solid #cbd5e1' }}
                  >
                    <option value="CRITICAL">Critical (Immediate)</option>
                    <option value="HIGH">High</option>
                    <option value="ROUTINE">Routine</option>
                  </select>
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: '6px', color: '#334155' }}>
                  Desk Notes / Ward Ref
                </label>
                <input
                  type="text"
                  placeholder="e.g. Operation Theatre Bed #2"
                  value={walkinForm.notes}
                  onChange={(e) => setWalkinForm({ ...walkinForm, notes: e.target.value })}
                  style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', border: '1.5px solid #cbd5e1' }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px' }}>
                <button
                  type="button"
                  onClick={() => setShowWalkinModal(false)}
                  style={{ padding: '10px 20px', borderRadius: '10px', border: '1px solid #cbd5e1', background: '#fff', cursor: 'pointer', fontWeight: 600 }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingWalkin}
                  className="btn btn-primary"
                  style={{ padding: '10px 24px', borderRadius: '10px', fontWeight: 800 }}
                >
                  {submittingWalkin ? 'Recording...' : 'Record Exchange'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </section>
  );
};

export default HospitalPanel;
