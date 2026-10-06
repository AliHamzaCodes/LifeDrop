import { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faCalendarDays,
  faLocationDot,
  faClock,
  faBuildingColumns,
  faHandHoldingHeart,
  faPlus,
  faCheckCircle,
  faXmark,
  faShieldHeart,
  faUsers
} from '@fortawesome/free-solid-svg-icons';
import toast from 'react-hot-toast';
import api from '../../utils/api';
import usePageTitle from '../../hooks/usePageTitle';
import AppSpinner from '../../components/AppSpinner/AppSpinner';
import { useAuth } from '../../context/AuthContext';
import './CampaignsPage.scss';

interface Campaign {
  id: number;
  organizer_name: string;
  title: string;
  description: string;
  city: string;
  latitude?: number;
  longitude?: number;
  event_date: string;
  start_time: string;
  end_time: string;
  created_at: string;
}

const CITIES = ['All Cities', 'Lahore', 'Karachi', 'Islamabad', 'Rawalpindi', 'Multan', 'Bahawalpur'];

const CampaignsPage = () => {
  usePageTitle('Blood Camps & Drives — LifeDrop');
  const { isLoggedIn, currentUser } = useAuth();
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCity, setSelectedCity] = useState('All Cities');
  const [registeredCampIds, setRegisteredCampIds] = useState<number[]>(() => {
    try {
      const stored = localStorage.getItem('ls_registered_camps');
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  // Modal for creating campaign
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newCamp, setNewCamp] = useState({
    title: '',
    description: '',
    city: 'Lahore',
    event_date: '',
    start_time: '09:00',
    end_time: '17:00'
  });
  const [submittingCamp, setSubmittingCamp] = useState(false);

  const fetchCampaigns = async () => {
    try {
      setLoading(true);
      const res = await api.get('campaigns/');
      setCampaigns(res.data.results || res.data);
    } catch (err) {
      console.error('Failed to load campaigns', err);
      toast.error('Could not load blood campaigns.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCampaigns();
  }, []);

  const handleRegisterVolunteer = (camp: Campaign) => {
    if (registeredCampIds.includes(camp.id)) {
      toast('You are already registered for this camp!', { icon: 'ℹ️' });
      return;
    }
    const updated = [...registeredCampIds, camp.id];
    setRegisteredCampIds(updated);
    localStorage.setItem('ls_registered_camps', JSON.stringify(updated));
    toast.success(`Registered for ${camp.title}! Our team will send SMS confirmation.`, { duration: 3500 });
  };

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCamp.title.trim() || !newCamp.event_date) {
      toast.error('Please fill out all required fields.');
      return;
    }
    try {
      setSubmittingCamp(true);
      const res = await api.post('campaigns/', newCamp);
      setCampaigns(prev => [res.data, ...prev]);
      setShowCreateModal(false);
      setNewCamp({
        title: '',
        description: '',
        city: 'Lahore',
        event_date: '',
        start_time: '09:00',
        end_time: '17:00'
      });
      toast.success('Blood Donation Drive published successfully!');
    } catch (err) {
      console.error(err);
      toast.error('Failed to publish blood drive. Please ensure you are logged in.');
    } finally {
      setSubmittingCamp(false);
    }
  };

  const filtered = campaigns.filter(c => {
    if (selectedCity === 'All Cities') return true;
    return c.city.toLowerCase() === selectedCity.toLowerCase();
  });

  return (
    <div className="campaigns-page">
      {/* Hero Header */}
      <section className="campaigns-hero">
        <div className="container">
          <div className="campaigns-hero__badge">
            <FontAwesomeIcon icon={faShieldHeart} /> Community Drives & NGO Camps
          </div>
          <h1 className="campaigns-hero__title">
            Blood Donation Camps in <span className="text-gradient">Pakistan</span>
          </h1>
          <p className="campaigns-hero__subtitle">
            Find upcoming volunteer blood donation drives organized by hospitals, red crescent societies, and university NGOs across Pakistani cities.
          </p>
          <div className="campaigns-hero__actions">
            <button
              onClick={() => setShowCreateModal(true)}
              className="btn btn-primary"
              id="host-camp-btn"
            >
              <FontAwesomeIcon icon={faPlus} style={{ marginRight: '8px' }} />
              Host / Post a Blood Drive
            </button>
          </div>
        </div>
      </section>

      {/* Main Content Area */}
      <section className="campaigns-body">
        <div className="container">
          {/* City Filter Pills */}
          <div className="campaigns-filters">
            {CITIES.map(city => (
              <button
                key={city}
                className={`campaign-filter-btn ${selectedCity === city ? 'active' : ''}`}
                onClick={() => setSelectedCity(city)}
              >
                {city}
              </button>
            ))}
          </div>

          {/* Cards Grid */}
          {loading ? (
            <div style={{ padding: '60px 0', textAlign: 'center' }}>
              <AppSpinner label="Loading upcoming blood drives…" />
            </div>
          ) : filtered.length === 0 ? (
            <div className="campaigns-empty">
              <FontAwesomeIcon icon={faCalendarDays} style={{ fontSize: '3rem', color: '#cbd5e1' }} />
              <h3>No Upcoming Camps in {selectedCity}</h3>
              <p>Be the first organizer or hospital to schedule a donation camp in this area.</p>
              <button onClick={() => setShowCreateModal(true)} className="btn btn-secondary">
                Schedule a Camp
              </button>
            </div>
          ) : (
            <div className="campaigns-grid">
              {filtered.map(camp => {
                const isRegistered = registeredCampIds.includes(camp.id);
                const eventDateFormatted = new Date(camp.event_date).toLocaleDateString('en-PK', {
                  weekday: 'short',
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric'
                });

                return (
                  <article key={camp.id} className="campaign-card">
                    <div className="campaign-card__header">
                      <span className="campaign-card__city-badge">
                        <FontAwesomeIcon icon={faLocationDot} style={{ marginRight: '5px' }} />
                        {camp.city}
                      </span>
                      <span className="campaign-card__org-badge">
                        <FontAwesomeIcon icon={faBuildingColumns} style={{ marginRight: '5px' }} />
                        {camp.organizer_name}
                      </span>
                    </div>

                    <h2 className="campaign-card__title">{camp.title}</h2>
                    <p className="campaign-card__desc">{camp.description}</p>

                    <div className="campaign-card__meta">
                      <div className="campaign-card__meta-item">
                        <FontAwesomeIcon icon={faCalendarDays} style={{ color: '#dc2626' }} />
                        <span>{eventDateFormatted}</span>
                      </div>
                      <div className="campaign-card__meta-item">
                        <FontAwesomeIcon icon={faClock} style={{ color: '#2563eb' }} />
                        <span>{camp.start_time.slice(0, 5)} — {camp.end_time.slice(0, 5)}</span>
                      </div>
                    </div>

                    <div className="campaign-card__perks">
                      <span>✓ Free Screening</span>
                      <span>✓ LifeSaver Certificate</span>
                      <span>✓ Refreshments</span>
                    </div>

                    <div className="campaign-card__actions">
                      <button
                        onClick={() => handleRegisterVolunteer(camp)}
                        className={`btn ${isRegistered ? 'btn-registered' : 'btn-primary'} w-full`}
                        id={`register-camp-${camp.id}`}
                      >
                        {isRegistered ? (
                          <>
                            <FontAwesomeIcon icon={faCheckCircle} style={{ marginRight: '6px' }} />
                            Registered Volunteer
                          </>
                        ) : (
                          <>
                            <FontAwesomeIcon icon={faHandHoldingHeart} style={{ marginRight: '6px' }} />
                            Register to Donate
                          </>
                        )}
                      </button>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </div>
      </section>

      {/* Modal: Host / Post a Blood Drive */}
      {showCreateModal && (
        <div className="modal-backdrop">
          <div className="modal-content">
            <div className="modal-header">
              <h2>Post a Blood Donation Drive</h2>
              <button onClick={() => setShowCreateModal(false)} className="close-btn" aria-label="Close modal">
                <FontAwesomeIcon icon={faXmark} />
              </button>
            </div>
            <form onSubmit={handleCreateSubmit} className="modal-form">
              <div className="form-group">
                <label>Drive Title *</label>
                <input
                  type="text"
                  placeholder="e.g. University Annual Blood Drive"
                  value={newCamp.title}
                  onChange={e => setNewCamp({ ...newCamp, title: e.target.value })}
                  required
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>City *</label>
                  <select
                    value={newCamp.city}
                    onChange={e => setNewCamp({ ...newCamp, city: e.target.value })}
                  >
                    {CITIES.filter(c => c !== 'All Cities').map(c => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label>Event Date *</label>
                  <input
                    type="date"
                    value={newCamp.event_date}
                    onChange={e => setNewCamp({ ...newCamp, event_date: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Start Time</label>
                  <input
                    type="time"
                    value={newCamp.start_time}
                    onChange={e => setNewCamp({ ...newCamp, start_time: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label>End Time</label>
                  <input
                    type="time"
                    value={newCamp.end_time}
                    onChange={e => setNewCamp({ ...newCamp, end_time: e.target.value })}
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Description & Venue Details</label>
                <textarea
                  rows={3}
                  placeholder="Describe location, free medical tests offered, and organizer information..."
                  value={newCamp.description}
                  onChange={e => setNewCamp({ ...newCamp, description: e.target.value })}
                />
              </div>

              <div className="modal-actions">
                <button type="button" onClick={() => setShowCreateModal(false)} className="btn btn-secondary">
                  Cancel
                </button>
                <button type="submit" disabled={submittingCamp} className="btn btn-primary">
                  {submittingCamp ? 'Publishing…' : 'Publish Drive'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default CampaignsPage;
