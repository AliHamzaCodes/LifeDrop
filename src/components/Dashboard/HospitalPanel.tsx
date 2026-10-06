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
  faArrowRotateRight
} from '@fortawesome/free-solid-svg-icons';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import api from '../../utils/api';

const ALL_BLOOD_GROUPS = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

interface InventoryItem {
  id?: number;
  blood_group: string;
  units_available: number;
  last_updated?: string;
}

const HospitalPanel = () => {
  const { requests } = useAppData();
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [alert, setAlert] = useState<any>(null);
  const [inventory, setInventory] = useState<Record<string, number>>({
    'A+': 0, 'A-': 0, 'B+': 0, 'B-': 0, 'AB+': 0, 'AB-': 0, 'O+': 0, 'O-': 0
  });
  const [loadingInventory, setLoadingInventory] = useState(true);
  const [updatingGroup, setUpdatingGroup] = useState<string | null>(null);

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

  useEffect(() => {
    // Feature 4: Predictive Analytics API
    api.get('analytics/predict_shortage/').then(res => {
      setAlert(res.data);
    }).catch(console.error);

    loadInventory();
  }, []);

  const handleStockChange = async (group: string, delta: number) => {
    const currentUnits = inventory[group] || 0;
    const newUnits = Math.max(0, currentUnits + delta);
    
    // Optimistic update
    setInventory(prev => ({ ...prev, [group]: newUnits }));
    setUpdatingGroup(group);

    try {
      await api.post('inventory/set_stock/', {
        blood_group: group,
        units: newUnits,
      });
      toast.success(`${group} stock updated to ${newUnits} units`, { id: `stock-${group}`, duration: 1500 });
    } catch (e) {
      console.error(e);
      toast.error(`Could not update stock for ${group}`);
      // Revert
      setInventory(prev => ({ ...prev, [group]: currentUnits }));
    } finally {
      setUpdatingGroup(null);
    }
  };

  // Filter requests made by this hospital
  const myRequests = requests.filter(r => r.hospital_name === currentUser?.fullName || r.userId === currentUser?.id);

  // Critical stock groups (< 3 units)
  const criticalGroups = Object.entries(inventory).filter(([_, units]) => units < 3).map(([bg]) => bg);

  return (
    <section className="hospital-panel">
      {/* ML Predictive Shortage Warning */}
      {alert && (
        <div style={{
          background: '#fffbeb',
          borderLeft: '4px solid #f59e0b',
          padding: '16px 20px',
          marginBottom: '24px',
          borderRadius: '8px',
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

      {/* Header */}
      <div className="admin-panel__header" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
        <div className="admin-panel__header-text">
          <div className="admin-panel__title-row" style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <span className="admin-panel__shield-icon" aria-hidden="true" style={{ background: '#e0f2fe', color: '#0284c7', width: '42px', height: '42px', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <FontAwesomeIcon icon={faHospital} style={{ fontSize: '1.2rem' }} />
            </span>
            <h1 className="admin-panel__title" id="hospital-panel-title" style={{ margin: 0, fontSize: '1.75rem', fontWeight: 800 }}>
              Hospital Blood Bank Command Center
            </h1>
          </div>
          <p className="admin-panel__subtitle" style={{ margin: '6px 0 0 0', color: '#64748b' }}>
            Live blood bank reserve management, unit availability & emergency fulfillment.
          </p>
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button onClick={loadInventory} className="btn btn-secondary" title="Refresh Inventory" style={{ padding: '8px 14px', borderRadius: '8px', border: '1px solid #cbd5e1', background: '#fff', cursor: 'pointer' }}>
            <FontAwesomeIcon icon={faArrowRotateRight} />
          </button>
          <Link to="/request" className="btn btn-primary" style={{ padding: '10px 18px', borderRadius: '8px', background: '#dc2626', color: '#fff', textDecoration: 'none', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
            <FontAwesomeIcon icon={faPlus} />
            Post Blood Request
          </Link>
        </div>
      </div>

      {/* Feature: Blood Inventory Stock Grid */}
      <div style={{ marginTop: '28px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#1e293b', display: 'flex', alignItems: 'center', gap: '8px', margin: 0 }}>
            <FontAwesomeIcon icon={faBoxesStacked} style={{ color: '#0284c7' }} />
            Blood Reserves Inventory (In-Stock Units)
          </h2>
          {criticalGroups.length > 0 && (
            <span style={{ fontSize: '0.8rem', background: '#fee2e2', color: '#b91c1c', padding: '4px 10px', borderRadius: '12px', fontWeight: 600 }}>
              ⚠️ {criticalGroups.length} Critical Groups Below Safe Level
            </span>
          )}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '16px' }}>
          {ALL_BLOOD_GROUPS.map((bg) => {
            const units = inventory[bg] || 0;
            const isCritical = units < 3;
            const isModerate = units >= 3 && units <= 8;
            const statusColor = isCritical ? '#dc2626' : isModerate ? '#d97706' : '#16a34a';
            const statusBg = isCritical ? '#fef2f2' : isModerate ? '#fffbeb' : '#f0fdf4';
            const statusLabel = isCritical ? 'Critical Low' : isModerate ? 'Moderate' : 'Good Reserve';

            return (
              <div
                key={bg}
                style={{
                  background: '#fff',
                  borderRadius: '12px',
                  border: `1.5px solid ${isCritical ? '#fca5a5' : '#e2e8f0'}`,
                  padding: '16px',
                  boxShadow: isCritical ? '0 4px 12px rgba(220, 38, 38, 0.08)' : '0 2px 6px rgba(0,0,0,0.03)',
                  transition: 'all 0.2s ease',
                  position: 'relative'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div style={{
                    width: '42px', height: '42px', borderRadius: '8px',
                    background: statusBg, color: statusColor,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontWeight: 800, fontSize: '1.2rem'
                  }}>
                    {bg}
                  </div>
                  <span style={{
                    fontSize: '0.72rem',
                    fontWeight: 700,
                    color: statusColor,
                    background: statusBg,
                    padding: '3px 8px',
                    borderRadius: '10px'
                  }}>
                    {statusLabel}
                  </span>
                </div>

                <div style={{ margin: '14px 0 10px 0' }}>
                  <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#0f172a' }}>
                    {units} <span style={{ fontSize: '0.85rem', fontWeight: 500, color: '#64748b' }}>bags</span>
                  </div>
                  {/* Progress meter */}
                  <div style={{ width: '100%', height: '6px', background: '#f1f5f9', borderRadius: '4px', overflow: 'hidden', marginTop: '6px' }}>
                    <div style={{
                      width: `${Math.min(100, (units / 20) * 100)}%`,
                      height: '100%',
                      background: statusColor,
                      transition: 'width 0.3s ease'
                    }} />
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '8px', marginTop: '12px' }}>
                  <button
                    onClick={() => handleStockChange(bg, -1)}
                    disabled={units <= 0 || updatingGroup === bg}
                    style={{
                      flex: 1, padding: '6px', borderRadius: '6px',
                      border: '1px solid #cbd5e1', background: '#f8fafc',
                      cursor: units <= 0 ? 'not-allowed' : 'pointer',
                      color: '#475569', fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center'
                    }}
                    title="Decrease 1 Unit"
                  >
                    <FontAwesomeIcon icon={faMinus} />
                  </button>
                  <button
                    onClick={() => handleStockChange(bg, 1)}
                    disabled={updatingGroup === bg}
                    style={{
                      flex: 1, padding: '6px', borderRadius: '6px',
                      border: '1px solid #cbd5e1', background: '#f8fafc',
                      cursor: 'pointer',
                      color: '#475569', fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center'
                    }}
                    title="Increase 1 Unit"
                  >
                    <FontAwesomeIcon icon={faPlus} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Hospital Active Blood Requests Section */}
      <div className="admin-table-section" style={{ marginTop: '36px', background: '#fff', borderRadius: '12px', border: '1px solid #e2e8f0', overflow: 'hidden' }}>
        <div style={{ padding: '18px 22px', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2 style={{ margin: 0, fontSize: '1.2rem', color: '#1e293b', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px' }}>
            <FontAwesomeIcon icon={faDroplet} style={{ color: '#dc2626' }} />
            Hospital Active Patient Requests
          </h2>
          <span style={{ fontSize: '0.85rem', color: '#64748b' }}>
            Total: {myRequests.length} requests
          </span>
        </div>
        <div className="admin-table-wrapper" style={{ overflowX: 'auto' }}>
          <table className="admin-table" style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: '#f8fafc', textAlign: 'left', borderBottom: '1px solid #e2e8f0' }}>
                <th style={{ padding: '12px 18px', color: '#64748b', fontSize: '0.85rem' }}>Request ID</th>
                <th style={{ padding: '12px 18px', color: '#64748b', fontSize: '0.85rem' }}>Blood Group</th>
                <th style={{ padding: '12px 18px', color: '#64748b', fontSize: '0.85rem' }}>Units Needed</th>
                <th style={{ padding: '12px 18px', color: '#64748b', fontSize: '0.85rem' }}>Urgency Level</th>
                <th style={{ padding: '12px 18px', color: '#64748b', fontSize: '0.85rem' }}>Status</th>
              </tr>
            </thead>
            <tbody>
              {myRequests.length === 0 ? (
                <tr>
                  <td colSpan={5} style={{ padding: '32px', textAlign: 'center', color: '#94a3b8' }}>
                    No patient requests found for this hospital. Click <strong>Post Blood Request</strong> above to issue a call for donors.
                  </td>
                </tr>
              ) : (
                myRequests.map((req) => (
                  <tr key={req.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                    <td style={{ padding: '14px 18px', fontWeight: 600, color: '#334155' }}>#{req.id}</td>
                    <td style={{ padding: '14px 18px' }}>
                      <span style={{ background: '#fee2e2', color: '#dc2626', padding: '3px 8px', borderRadius: '6px', fontWeight: 800 }}>
                        {req.required_blood_group || req.bloodGroup}
                      </span>
                    </td>
                    <td style={{ padding: '14px 18px', fontWeight: 600 }}>{req.units_needed || req.units} Units</td>
                    <td style={{ padding: '14px 18px' }}>
                      <span className={`urgency-glowing-badge urgency-glowing-badge--${String(req.urgency).toLowerCase()}`} style={{ fontSize: '0.75rem', fontWeight: 700 }}>
                        {String(req.urgency).toUpperCase()}
                      </span>
                    </td>
                    <td style={{ padding: '14px 18px' }}>
                      <span style={{
                        padding: '4px 10px',
                        borderRadius: '12px',
                        fontSize: '0.75rem',
                        fontWeight: 600,
                        background: req.status === 'FULFILLED' ? '#dcfce7' : req.status === 'PENDING' ? '#fef3c7' : '#f1f5f9',
                        color: req.status === 'FULFILLED' ? '#166534' : req.status === 'PENDING' ? '#92400e' : '#475569'
                      }}>
                        {req.status}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
};

export default HospitalPanel;
