import { useEffect, useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faUser,
  faCalendarAlt,
  faDroplet,
  faClock,
  faCircleCheck,
  faCircleXmark,
  faLocationCrosshairs,
  faLocationDot,
} from '@fortawesome/free-solid-svg-icons';
import './ActiveRequests.scss';
import AppSpinner from '../AppSpinner/AppSpinner';
import { filters, statusConfig } from '../../data/requests.data';
import { fetchRequests, cancelAcceptRequest, fulfillRequest, acceptRequest } from '../../api/services';
import CountdownTimer from '../CountdownTimer/CountdownTimer';
import { Link } from 'react-router-dom';
import EmptyState from '../EmptyState/EmptyState';
import { requestBloodGroup, normalizeRequestStatus } from '../../utils/status';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';
import api from '../../utils/api';

// ── iconKey → FontAwesome icon resolver ───────────────────────────────────────
// Keeps data files free of icon-library imports. Add new keys here as needed.
const STATUS_ICONS = {
  clock:       faClock,
  circleCheck: faCircleCheck,
  circleXmark: faCircleXmark,
};



// ── Blood type color modifier ─────────────────────────────────────────────────
const bloodModifier = (type) => {
  if (type.startsWith('O'))  return 'salmon';
  if (type.startsWith('A-')) return 'teal';
  if (type.startsWith('AB')) return 'blush';
  if (type.startsWith('B'))  return 'blue';
  return 'default';
};

// ── Component ─────────────────────────────────────────────────────────────────
const ActiveRequests = () => {
  const [activeFilter, setActiveFilter] = useState('All');
  const [requests, setRequests]   = useState<any[]>([]);
  const [loading, setLoading]     = useState(true);
  const [selectedId, setSelectedId] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [sharingLocationId, setSharingLocationId] = useState<number | null>(null);
  const ITEMS_PER_PAGE = 5;
  const { currentUser } = useAuth();

  const handleActionClick = (req) => {
    setSelectedId((id) => (id === req.id ? null : req.id));
  };

  const load = async () => {
    setLoading(true);
    const data = await fetchRequests(currentUser?.id);
    setRequests(data.results || data);
    setLoading(false);
  };

  const handleCancel = async (reqId) => {
    if (window.confirm("Are you sure you want to cancel your pledge?")) {
      const res = await cancelAcceptRequest(reqId);
      if (res.ok) {
        toast.success("Pledge cancelled.");
        load();
      } else {
        toast.error(res.error);
      }
    }
  };

  const handleFulfill = async (reqId, donorId) => {
    if (window.confirm("Confirm that this donor has provided the blood? This will complete their pledge.")) {
      const res = await fulfillRequest(reqId, donorId);
      if (res.ok) {
        toast.success("Donation verified! The donor's account has been updated.");
        load();
      } else {
        toast.error(res.error);
      }
    }
  };

  const handleShareLocation = (reqId: number) => {
    if (!navigator.geolocation) {
      toast.error('Geolocation is not supported by your browser.');
      return;
    }
    toast.loading('Acquiring GPS location...', { id: 'gps-loc' });
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude, longitude } = pos.coords;
        try {
          await api.post(`requests/${reqId}/update_location/`, { latitude, longitude });
          toast.success('Live GPS coordinates shared with hospital / patient!', { id: 'gps-loc' });
          setSharingLocationId(reqId);
          load();
        } catch (e) {
          toast.error('Failed to update location on server.', { id: 'gps-loc' });
        }
      },
      (err) => {
        toast.error('Could not get GPS coordinates: ' + err.message, { id: 'gps-loc' });
      },
      { enableHighAccuracy: true }
    );
  };

  const handleRSVP = async (reqId) => {
    if (window.confirm("Are you sure you want to pledge to donate for this request?")) {
      const res = await acceptRequest(reqId);
      if (res.ok) {
        toast.success("Thank you for pledging! The request has been updated.");
        load();
      } else {
        toast.error(res.error || "Could not accept request.");
      }
    }
  };

  useEffect(() => {
    load();
  }, [currentUser?.id]);

  const filtered =
    activeFilter === 'All'
      ? requests
      : requests.filter((r) => r.status === activeFilter);

  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);
  const paginated = filtered.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

  // Reset page when filter changes
  useEffect(() => {
    setCurrentPage(1);
  }, [activeFilter]);

  if (loading) {
    return (
      <section className="active-requests" aria-label="Request Status">
        <AppSpinner label="Loading requests..." />
      </section>
    );
  }

  return (
    <section className="active-requests" aria-label="Request Status">

      {/* ── Header ── */}
      <div className="ar-header">
        <div className="ar-header__text">
          <h2 className="ar-header__title">Request Status</h2>
          <p className="ar-header__subtitle">
            Track the progress of your submitted blood requests.
          </p>
        </div>

        {/* Filter Tabs */}
        <div className="ar-filters" role="tablist" aria-label="Filter requests">
          {filters.map((f) => (
            <button
              key={f}
              role="tab"
              type="button"
              id={`filter-${f.toLowerCase()}`}
              className={`ar-filters__btn${activeFilter === f ? ' ar-filters__btn--active' : ''}`}
              aria-selected={activeFilter === f}
              onClick={() => setActiveFilter(f)}
            >
              {f}
              {/* count pill */}
              <span className="ar-filters__count">
                {f === 'All'
                  ? requests.length
                  : requests.filter((r) => r.status === f).length}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* ── Request List ── */}
      <div className="ar-list" role="tabpanel">
        {filtered.length === 0 ? (
          <EmptyState
            title={activeFilter === 'All' ? 'No requests yet' : `No ${activeFilter.toLowerCase()} requests`}
            message={activeFilter === 'All' ? 'Submit a blood request to track it here.' : 'Try another filter.'}
            actionLabel="Submit a request"
            actionTo="/request"
          />
        ) : (
          paginated.map((req, idx) => {
            const blood = requestBloodGroup(req);
            const cfg = statusConfig[normalizeRequestStatus(req.status)] || statusConfig.Pending;
            return (
              <article
                key={req.id}
                className="ar-card"
                style={{ animationDelay: `${idx * 0.06}s` }}
                aria-label={`Request for ${req.hospital}`}
              >
                <div className={`ar-card__blood ar-card__blood--${bloodModifier(blood)}`}>
                  {blood}
                </div>

                {/* Info */}
                <div className="ar-card__info">
                  <p className="ar-card__hospital">
                    {req.hospital}
                    {req.is_patient_verified && (
                      <FontAwesomeIcon icon={faCircleCheck} style={{ color: '#3b82f6', marginLeft: '6px' }} title="Verified Hospital" />
                    )}
                  </p>
                  <div className="ar-card__meta">
                    <span>
                      <FontAwesomeIcon icon={faUser} aria-hidden="true" />
                      Patient: {req.patient}
                    </span>
                    <span>
                      <FontAwesomeIcon icon={faCalendarAlt} aria-hidden="true" />
                      Needed by: {req.neededBy}
                    </span>
                    <span>
                      <FontAwesomeIcon icon={faDroplet} aria-hidden="true" />
                      {req.units} Unit{req.units !== 1 ? 's' : ''} Needed
                    </span>
                  </div>
                  
                  {/* Units Progress Bar */}
                  <div style={{ marginTop: '12px', width: '100%' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: '#4a5568', marginBottom: '4px' }}>
                      <span>{req.unitsFulfilled || 0} / {req.units} Units Arranged</span>
                    </div>
                    <div style={{ width: '100%', height: '6px', background: '#e5e7eb', borderRadius: '4px', overflow: 'hidden' }}>
                      <div style={{ height: '100%', background: '#ef4444', width: `${Math.min(((req.unitsFulfilled || 0) / req.units) * 100, 100)}%` }}></div>
                    </div>
                  </div>
                </div>

                {/* Status + action */}
                <div className="ar-card__status-wrap" style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
                  <span className={`ar-badge ar-badge--${cfg.modifier}`}>
                    <FontAwesomeIcon icon={STATUS_ICONS[cfg.iconKey]} aria-hidden="true" />
                    {cfg.label}
                  </span>
                  <a
                    href={`https://api.whatsapp.com/send?text=${encodeURIComponent(`URGENT: ${blood} Blood needed at ${req.hospital} (${req.location}). Patient Name: ${req.patient}. Click here to donate: http://localhost:5173/dashboard`)}`}
                    target="_blank"
                    rel="noreferrer"
                    className="ar-card__action"
                    style={{ background: '#25D366', color: 'white', border: 'none', display: 'inline-flex', alignItems: 'center', gap: '6px', textDecoration: 'none' }}
                  >
                    <svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor">
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                    </svg>
                    Share
                  </a>
                  <button
                    type="button"
                    className={`ar-card__action ar-card__action--${cfg.modifier}`}
                    id={`action-${req.id}`}
                    aria-label={`${cfg.action} for ${req.hospital}`}
                    onClick={() => handleActionClick(req)}
                  >
                    {selectedId === req.id ? 'Hide details' : 'View details'}
                  </button>
                  {currentUser?.role === 'DONOR' && cfg.label !== 'Fulfilled' && (
                    <button
                      type="button"
                      className="ar-card__action"
                      style={{ background: '#ef4444', color: 'white', border: 'none', marginLeft: 'auto' }}
                      onClick={() => handleRSVP(req.id)}
                    >
                      I will donate
                    </button>
                  )}
                </div>

                {/* VISIBLE ACTION AREA: Accepted by Donors */}
                {req.acceptedDonors && req.acceptedDonors.length > 0 && (
                  <div style={{ marginTop: '12px', padding: '12px', background: '#dcfce7', borderRadius: '6px', border: '1px solid #86efac' }}>
                    <h4 style={{ margin: '0 0 8px 0', color: '#166534', display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ display: 'inline-block', width: '8px', height: '8px', borderRadius: '50%', background: '#22c55e' }}></span>
                      Accepted by Donors
                    </h4>
                    <ul style={{ margin: 0, paddingLeft: '20px', fontSize: '0.85rem', color: '#14532d' }}>
                      {req.acceptedDonors.map((donor) => (
                        <li key={donor.id} style={{ marginBottom: '8px' }}>
                          <strong>{donor.name}</strong> - <a href={`tel:${donor.phone}`} style={{ color: '#16a34a', textDecoration: 'underline' }}>{donor.phone}</a>
                          {String(currentUser?.id) === String(req.userId) && (
                            <button
                              type="button"
                              onClick={() => handleFulfill(req.id, donor.id)}
                              style={{ marginLeft: '12px', padding: '4px 12px', fontSize: '0.8rem', fontWeight: 'bold', background: '#16a34a', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', boxShadow: '0 2px 4px rgba(22, 163, 74, 0.3)' }}
                            >
                              ✓ Mark as Received
                            </button>
                          )}
                          {String(currentUser?.id) === String(donor.id) && (
                            <>
                              <button
                                type="button"
                                onClick={() => handleShareLocation(req.id)}
                                style={{ marginLeft: '8px', padding: '4px 12px', fontSize: '0.8rem', fontWeight: 'bold', background: '#0284c7', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', boxShadow: '0 2px 4px rgba(2, 132, 199, 0.3)' }}
                                title="Share live GPS location with hospital"
                              >
                                <FontAwesomeIcon icon={faLocationCrosshairs} style={{ marginRight: '4px' }} />
                                Share GPS Location
                              </button>
                              <button
                                type="button"
                                onClick={() => handleCancel(req.id)}
                                style={{ marginLeft: '8px', padding: '4px 12px', fontSize: '0.8rem', fontWeight: 'bold', background: '#ef4444', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', boxShadow: '0 2px 4px rgba(239, 68, 68, 0.3)' }}
                              >
                                ✕ Cancel Pledge
                              </button>
                            </>
                          )}
                          {(req.tracking_active || sharingLocationId === req.id) && (
                            <span style={{ marginLeft: '8px', padding: '2px 8px', background: '#e0f2fe', color: '#0369a1', borderRadius: '10px', fontSize: '0.72rem', fontWeight: 700 }}>
                              🛰️ Live GPS Active
                            </span>
                          )}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {selectedId === req.id && (
                  <div className="ar-card__details">
                    <p>ID: {req.id}</p>
                    <p>Urgency: {req.urgency}</p>
                    {(req.urgency === 'CRITICAL' || req.urgency === 'ROUTINE') && (
                      <p>
                        <CountdownTimer 
                          expirationDate={new Date(new Date(req.createdAt).getTime() + (req.urgency === 'CRITICAL' ? 48 : 7 * 24) * 60 * 60 * 1000)}
                        />
                      </p>
                    )}
                    <p>Component: {req.component || 'Whole Blood'}</p>
                    <p>City: {req.location || '—'}</p>
                    <p>Contact: {req.contactNumber || '—'}</p>
                    {req.note && <p>Note: {req.note}</p>}
                    {/* Accepted Donors UI moved outside */}
                    {/* Feature 6: Live Donor Tracking */}
                    {req.tracking_active && (
                      <div style={{ marginTop: '12px', padding: '12px', background: '#e0f2fe', borderRadius: '6px', border: '1px solid #7dd3fc' }}>
                        <h4 style={{ margin: '0 0 8px 0', color: '#0369a1', display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span style={{ display: 'inline-block', width: '8px', height: '8px', borderRadius: '50%', background: '#0284c7', animation: 'pulse 2s infinite' }}></span>
                          Live Donor Tracking Active
                        </h4>
                        <p style={{ margin: 0, fontSize: '0.85rem', color: '#075985' }}>
                          Donor is en route! Location: ({req.donor_lat}, {req.donor_lng})
                        </p>
                      </div>
                    )}
                    
                    <p style={{ marginTop: '12px' }}>
                      Need compatible donors? <Link to={`/search?q=${encodeURIComponent(blood)}`}>Search {blood}</Link>
                    </p>
                  </div>
                )}
              </article>
            );
          })
        )}
      </div>

      {/* Summary */}
      <p className="ar-summary">
        Showing <strong>{filtered.length}</strong> of <strong>{requests.length}</strong> requests
      </p>
      
      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '16px', marginTop: '24px' }}>
          <button
            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            style={{ padding: '8px 16px', borderRadius: '8px', border: '1px solid #d1d5db', background: currentPage === 1 ? '#f3f4f6' : 'white', cursor: currentPage === 1 ? 'not-allowed' : 'pointer' }}
          >
            Previous
          </button>
          <span style={{ fontSize: '0.9rem', color: '#4b5563' }}>Page {currentPage} of {totalPages}</span>
          <button
            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
            style={{ padding: '8px 16px', borderRadius: '8px', border: '1px solid #d1d5db', background: currentPage === totalPages ? '#f3f4f6' : 'white', cursor: currentPage === totalPages ? 'not-allowed' : 'pointer' }}
          >
            Next
          </button>
        </div>
      )}
    </section>
  );
};

export default ActiveRequests;
