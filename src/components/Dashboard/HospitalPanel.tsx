import React, { useState, useEffect } from 'react';
import { useAppData } from '../../context/AppDataContext';
import { useAuth } from '../../context/AuthContext';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus, faHospital, faDroplet, faTriangleExclamation } from '@fortawesome/free-solid-svg-icons';
import { Link } from 'react-router-dom';
import api from '../../utils/api';

const HospitalPanel = () => {
  const { requests } = useAppData();
  const { currentUser } = useAuth();
  const [alert, setAlert] = useState(null);

  useEffect(() => {
    // Feature 4: Predictive Analytics API
    api.get('analytics/predict_shortage/').then(res => {
      setAlert(res.data);
    }).catch(console.error);
  }, []);

  // Filter requests made by this hospital
  const myRequests = requests.filter(r => r.hospital_name === currentUser?.fullName || r.userId === currentUser?.id);

  return (
    <section className="hospital-panel">
      {alert && (
        <div style={{ background: '#fffbeb', borderLeft: '4px solid #f59e0b', padding: '16px', marginBottom: '24px', borderRadius: '4px', display: 'flex', gap: '12px' }}>
          <FontAwesomeIcon icon={faTriangleExclamation} style={{ color: '#f59e0b', fontSize: '1.5rem' }} />
          <div>
            <h4 style={{ margin: '0 0 4px 0', color: '#b45309' }}>ML Predictive Shortage Alert: {alert.city}</h4>
            <p style={{ margin: 0, fontSize: '0.875rem', color: '#92400e' }}>
              <strong>Predicted Shortage:</strong> {alert.predicted_shortage} <br />
              {alert.reasoning} (Confidence: {alert.confidence})
            </p>
          </div>
        </div>
      )}

      <div className="admin-panel__header">
        <div className="admin-panel__header-text">
          <div className="admin-panel__title-row">
            <span className="admin-panel__shield-icon" aria-hidden="true" style={{ background: 'var(--blue-light)', color: 'var(--blue)' }}>
              <FontAwesomeIcon icon={faHospital} />
            </span>
            <h1 className="admin-panel__title" id="hospital-panel-title">
              Hospital Dashboard
            </h1>
          </div>
          <p className="admin-panel__subtitle">
            Manage your hospital's blood requests and incoming donations.
          </p>
        </div>
        <div style={{ marginLeft: 'auto' }}>
          <Link to="/request" className="btn btn-primary">
            <FontAwesomeIcon icon={faPlus} style={{ marginRight: '8px' }} />
            New Request
          </Link>
        </div>
      </div>

      <div className="admin-table-section" style={{ marginTop: '32px' }}>
        <h2 style={{ padding: '20px', margin: 0, borderBottom: '1px solid var(--border)', fontSize: '1.25rem', color: 'var(--text-dark)' }}>
          <FontAwesomeIcon icon={faDroplet} style={{ color: 'var(--danger)', marginRight: '8px' }} />
          Our Active Requests
        </h2>
        <div className="admin-table-wrapper">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Request ID</th>
                <th>Blood Group</th>
                <th>Units</th>
                <th>Urgency</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {myRequests.length === 0 ? (
                <tr>
                  <td colSpan={5} className="admin-table__empty">No requests found. Create a new request.</td>
                </tr>
              ) : (
                myRequests.map((req) => (
                  <tr key={req.id}>
                    <td className="admin-table__id">#{req.id}</td>
                    <td><strong style={{ color: 'var(--danger)' }}>{req.required_blood_group || req.bloodGroup}</strong></td>
                    <td>{req.units_needed || req.units}</td>
                    <td>
                      <span className={`urgency-glowing-badge urgency-glowing-badge--${String(req.urgency).toLowerCase()}`}>
                        {String(req.urgency).toUpperCase()}
                      </span>
                    </td>
                    <td>
                      <span className="admin-badge admin-badge--standard">{req.status}</span>
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
