import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faDroplet,
  faHeart,
  faLocationDot,
  faMagnifyingGlass,
  faClock,
  faInbox,
} from '@fortawesome/free-solid-svg-icons';
import './DashboardOverview.scss';
import AppSpinner from '../AppSpinner/AppSpinner';
import { fetchDashboardData, acceptRequest } from '../../api/services';
import { useAuth } from '../../context/AuthContext';
import EmptyState from '../EmptyState/EmptyState';
import toast from 'react-hot-toast';


const DashboardOverview = ({ onTabChange }) => {
  const { currentUser } = useAuth();
  const rawFirstName = currentUser?.fullName?.split(' ')[0] ?? 'there';
  const firstName = rawFirstName.charAt(0).toUpperCase() + rawFirstName.slice(1).toLowerCase();
  const navigate = useNavigate();
  const [searchValue, setSearchValue] = useState('');

  const [activeRequests, setActiveRequests] = useState<any[]>([]);
  const [nearbyDonors, setNearbyDonors] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const handleAccept = async (reqId) => {
    if (window.confirm("Are you sure you want to accept this request and pledge to donate blood?")) {
      const res = await acceptRequest(reqId);
      if (res.ok) {
        toast.success("Thank you! You have accepted the request. The patient has been notified.");
        setActiveRequests(prev => prev.filter(r => r.id !== reqId));
      } else {
        toast.error(res.error || "Failed to accept the request.");
      }
    }
  };

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      const data = await fetchDashboardData();
      // Filter out fully pledged ones on the frontend for now, or just show them
      // Let's show them but indicate if they are fully pledged
      setActiveRequests(data.activeRequests);
      setNearbyDonors(data.nearbyDonors);
      setLoading(false);
    };
    load();
  }, []);

  if (loading) {
    return (
      <section className="dashboard-overview" aria-label="Dashboard overview">
        <AppSpinner label="Loading dashboard..." />
      </section>
    );
  }

  return (
    <section className="dashboard-overview" aria-label="Dashboard overview">

      {/* ── Header ── */}
      <header className="dashboard-overview__header">
        <div className="dashboard-overview__heading-group">
          <h1 className="dashboard-overview__title">Hello, {firstName} 👋</h1>
          <p className="dashboard-overview__subtitle">
            Your local blood network is active today. Every drop counts.
          </p>
          {currentUser?.role === 'DONOR' && currentUser?.badge && currentUser.badge !== 'NONE' && (
            <div style={{ marginTop: '12px', display: 'flex', gap: '8px', alignItems: 'center' }}>
              <span style={{
                background: currentUser.badge === 'GOLD' ? '#ffd700' : currentUser.badge === 'SILVER' ? '#c0c0c0' : '#cd7f32',
                color: '#333',
                padding: '4px 12px', borderRadius: '16px', fontSize: '0.85rem', fontWeight: 600
              }}>
                🏆 {currentUser.badge} DONOR
              </span>
              <span style={{ fontSize: '0.85rem', color: '#666' }}>
                {currentUser.donationsMade || 0} Donations Made
              </span>
            </div>
          )}
        </div>
        <form
          className="dashboard-overview__search"
          onSubmit={(e) => {
            e.preventDefault();
            const q = searchValue.trim();
            navigate(q ? `/search?q=${encodeURIComponent(q)}` : '/search');
          }}
        >
          <label htmlFor="dashboard-search" className="visually-hidden">Search donors</label>
          <FontAwesomeIcon
            icon={faMagnifyingGlass}
            className="dashboard-overview__search-icon"
            aria-hidden="true"
          />
          <input
            id="dashboard-search"
            type="search"
            placeholder="Search blood type, location..."
            aria-label="Search donors"
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
          />
        </form>
      </header>

      {/* ── Action Cards ── */}
      <div className="dashboard-overview__actions">

        {/* Request Blood */}
        <article className="dashboard-overview__card dashboard-overview__card--primary" id="card-request-blood">
          <div className="dashboard-overview__card-header">
            <span className="dashboard-overview__card-icon" aria-hidden="true">
              <FontAwesomeIcon icon={faDroplet} />
            </span>
            <span className="urgency-glowing-badge urgency-glowing-badge--critical">
              <span className="pulse-dot"></span> Urgent Need
            </span>
          </div>
          <h2 className="dashboard-overview__card-title">Request Blood</h2>
          <p className="dashboard-overview__card-desc">
            Initiate an emergency or scheduled blood request for a patient in need.
          </p>
          <button 
            className="dashboard-overview__card-cta dashboard-overview__card-cta--primary" 
            type="button"
            onClick={() => navigate('/request')}
          >
            Start Request
          </button>
        </article>

        {/* Become a Donor */}
        <article className="dashboard-overview__card dashboard-overview__card--secondary" id="card-become-donor">
          <div className="dashboard-overview__card-header">
            <span className="dashboard-overview__card-icon dashboard-overview__card-icon--heart" aria-hidden="true">
              <FontAwesomeIcon icon={faHeart} />
            </span>
          </div>
          <h2 className="dashboard-overview__card-title">Become a Donor</h2>
          <p className="dashboard-overview__card-desc">
            Register as a donor so hospitals can reach you when a matching patient needs blood.
          </p>
          <button 
            className="dashboard-overview__card-cta dashboard-overview__card-cta--outline" 
            type="button"
            onClick={() => navigate('/donate')}
          >
            Complete donor profile
          </button>
        </article>

      </div>

      {/* ── Bottom Grid ── */}
      <div className="dashboard-overview__bottom">

        {/* Active Requests */}
        <section className="dashboard-overview__requests" aria-label="Active blood requests">
          <div className="dashboard-overview__section-header">
            <h2>Active Blood Requests</h2>
            <button 
              type="button" 
              className="dashboard-overview__link" 
              id="btn-view-all-requests"
              onClick={() => onTabChange?.('active-requests')}
            >
              View All
            </button>
          </div>
          <div className="dashboard-overview__request-list">
            {activeRequests.length === 0 ? (
                <EmptyState
                  title="No active requests"
                  message="When hospitals or patients submit urgent needs, they will appear here."
                  actionLabel="Submit a request"
                  actionTo="/request"
                  icon={<FontAwesomeIcon icon={faInbox} size="2x" style={{ color: '#cbd5e1', marginBottom: '8px' }} />}
                />
            ) : activeRequests.map((req) => (
              <article key={req.id} className="dashboard-request" aria-label={`Request from ${req.hospital}`}>
                <div className="dashboard-request__badge">
                  <span className="dashboard-request__group">{req.blood}</span>
                  <span className="dashboard-request__label">Type</span>
                </div>
                <div className="dashboard-request__info">
                  <div className="dashboard-request__meta">
                    <span className={`dashboard-request__urgency dashboard-request__urgency--${req.urgency.toLowerCase()}`}>
                      {req.urgency}
                    </span>
                    <span className="dashboard-request__time">
                      <FontAwesomeIcon icon={faClock} aria-hidden="true" />
                      {req.time}
                    </span>
                  </div>
                  <p className="dashboard-request__hospital">{req.hospital}</p>
                  <p className="dashboard-request__details">
                    <FontAwesomeIcon icon={faLocationDot} aria-hidden="true" />
                    {req.location} &bull; {req.note}
                  </p>
                  
                  {/* Progress Indicator for Multi-Unit */}
                  {req.units > 1 && (
                    <div style={{ marginTop: '8px', fontSize: '0.8rem', color: '#666' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                        <span>Pledges</span>
                        <span>{req.unitsFulfilled + (req.acceptedDonors?.length || 0)} / {req.units} Units</span>
                      </div>
                      <div style={{ height: '6px', background: '#e2e8f0', borderRadius: '4px', overflow: 'hidden' }}>
                        <div style={{ 
                          height: '100%', 
                          background: '#ef4444', 
                          width: `${Math.min(100, ((req.unitsFulfilled + (req.acceptedDonors?.length || 0)) / req.units) * 100)}%` 
                        }}></div>
                      </div>
                    </div>
                  )}

                </div>
                <div style={{ display: 'flex', gap: '8px', flexDirection: 'column' }}>
                  <button 
                    className="dashboard-request__cta" 
                    type="button" 
                    aria-label={`View ${req.hospital} request`}
                    onClick={() => onTabChange?.('active-requests')}
                  >
                    View
                  </button>
                  <a
                    href={`https://api.whatsapp.com/send?text=${encodeURIComponent(`URGENT: ${req.blood} Blood needed at ${req.hospital}. Click here to donate: http://localhost:5173/dashboard`)}`}
                    target="_blank"
                    rel="noreferrer"
                    className="dashboard-request__cta"
                    style={{ background: '#25D366', color: 'white', border: 'none', textDecoration: 'none', textAlign: 'center', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '4px' }}
                  >
                    <svg viewBox="0 0 24 24" width="12" height="12" fill="currentColor">
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                    </svg>
                    Share
                  </a>
                  {currentUser?.role === 'DONOR' && req.userId !== currentUser.id && (
                    <button 
                      className="dashboard-request__cta" 
                      style={{ 
                        background: (req.acceptedDonors?.includes(currentUser.id) || (req.unitsFulfilled + (req.acceptedDonors?.length || 0) >= req.units)) ? '#cbd5e1' : '#22c55e', 
                        color: 'white', 
                        borderColor: (req.acceptedDonors?.includes(currentUser.id) || (req.unitsFulfilled + (req.acceptedDonors?.length || 0) >= req.units)) ? '#cbd5e1' : '#22c55e',
                        cursor: (req.acceptedDonors?.includes(currentUser.id) || (req.unitsFulfilled + (req.acceptedDonors?.length || 0) >= req.units)) ? 'not-allowed' : 'pointer'
                      }}
                      type="button" 
                      onClick={() => handleAccept(req.id)}
                      disabled={req.acceptedDonors?.includes(currentUser.id) || (req.unitsFulfilled + (req.acceptedDonors?.length || 0) >= req.units)}
                    >
                      {req.acceptedDonors?.includes(currentUser.id) ? 'Pledged' : (req.unitsFulfilled + (req.acceptedDonors?.length || 0) >= req.units) ? 'Full' : 'Accept'}
                    </button>
                  )}
                </div>
              </article>
            ))}
          </div>
        </section>

        {/* Nearby Donors */}
        <section className="dashboard-overview__donors" aria-label="Nearby donors">
          <div className="dashboard-overview__section-header">
            <h2>Nearby Donors</h2>
          </div>
          <div className="dashboard-overview__donor-list">
            {nearbyDonors.map((donor) => (
              <button
                key={donor.id}
                type="button"
                className="dashboard-donor"
                onClick={() => navigate(`/donor/${donor.name}`)}
              >
                <div className="dashboard-donor__avatar" aria-hidden="true">
                  {donor.initials}
                </div>
                <div className="dashboard-donor__info">
                  <p className="dashboard-donor__name">{donor.name ? donor.name.charAt(0).toUpperCase() + donor.name.slice(1).toLowerCase() : ''}</p>
                  <p className="dashboard-donor__distance">{donor.distance}</p>
                </div>
                <span className="dashboard-donor__group">{donor.blood}</span>
              </button>
            ))}
          </div>
          <button
            className="dashboard-overview__map-btn"
            type="button"
            id="btn-view-map"
            onClick={() => navigate('/search')}
          >
            Find donors nearby
          </button>
        </section>

      </div>
    </section>
  );
};

export default DashboardOverview;

