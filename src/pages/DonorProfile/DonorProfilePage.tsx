import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import AppSpinner from '../../components/AppSpinner/AppSpinner';
import { fetchDonorBySlug } from '../../api/services';
import usePageTitle from '../../hooks/usePageTitle';
import { getAvatarColor } from '../../utils/avatar';
import { formatKm } from '../../constants/pakistan';
import { getCooldownDaysLeft } from '../../utils/status';
import { DONOR_STATUS } from '../../utils/status';
import './DonorProfilePage.scss';

const InfoItem = ({ icon, label, value }) => (
  <div className="donor-profile__info-item">
    <div className="donor-profile__info-item-icon" aria-hidden="true">{icon}</div>
    <div className="donor-profile__info-item-text">
      <p>{label}</p>
      <p>{value}</p>
    </div>
  </div>
);

const BloodSvg = () => (
  <svg viewBox="0 0 24 24" aria-hidden="true">
    <path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z"/>
  </svg>
);

const LocationSvg = () => (
  <svg viewBox="0 0 24 24" aria-hidden="true">
    <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 1.12 2.5 2.5 2.5-1.12 2.5-2.5 2.5z"/>
  </svg>
);

const CalSvg = () => (
  <svg viewBox="0 0 24 24" aria-hidden="true">
    <path d="M20 3h-1V1h-2v2H7V1H5v2H4c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 18H4V8h16v13z"/>
  </svg>
);

const PhoneSvg = () => (
  <svg viewBox="0 0 24 24" aria-hidden="true">
    <path d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z"/>
  </svg>
);

const DonorProfilePage = () => {
  const { slug } = useParams();
  const [donor, setDonor] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  usePageTitle(donor ? `${donor.name} — Donor Profile` : 'Donor Profile');

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError('');
      try {
        const data = await fetchDonorBySlug(slug);
        setDonor(data);
      } catch {
        setError('Could not load this donor. Please try again.');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [slug]);

  if (loading) {
    return (
      <div className="donor-profile">
        <div className="donor-profile__hero" />
        <div className="donor-profile__loading">
          <AppSpinner label="Loading donor profile..." />
        </div>
      </div>
    );
  }

  if (error || !donor) {
    return (
      <div className="donor-profile" id="donor-profile-page">
        <div className="donor-profile__hero">
          <Link to="/search" className="donor-profile__back-link" id="back-to-search-from-404">
            <svg viewBox="0 0 24 24" fill="currentColor"><path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z"/></svg>
            Back to Search
          </Link>
        </div>
        <div className="donor-profile__not-found">
          <h2>{error ? 'Something went wrong' : 'Donor not found'}</h2>
          <p>{error || "This donor profile doesn't exist or may have been removed."}</p>
          <Link to="/search" className="not-found__btn-primary" id="search-again-btn">
            Find another donor
          </Link>
        </div>
      </div>
    );
  }

  const isVerified = donor.status === DONOR_STATUS.verified;
  const canContact = Boolean(isVerified && donor.canContact && donor.phone);
  const avatarColor = getAvatarColor(donor.id);
  const distance = formatKm(donor.km ?? donor.miles);

  return (
    <div className="donor-profile" id={`donor-profile-${donor.id}`}>
      <div className="donor-profile__hero">
        <Link to="/search" className="donor-profile__back-link" id="back-to-search-btn">
          <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
            <path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z"/>
          </svg>
          Back to Search
        </Link>
      </div>

      <div className="donor-profile__card" id="donor-profile-card">
        <div className="donor-profile__header">
          <div
            className="donor-profile__avatar"
            style={{ background: avatarColor, overflow: 'hidden' }}
            aria-label={`${donor.name}'s avatar`}
          >
            {donor.avatarUrl ? (
              <img src={`http://localhost:8000${donor.avatarUrl}`} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            ) : (
              donor.avatar
            )}
            {isVerified && (
              <span className="donor-profile__avatar-status" aria-label="Verified donor" />
            )}
          </div>

          <div className="donor-profile__name-group">
            <h1 className="donor-profile__name">{donor.name}</h1>
            {isVerified ? (
              <span className="donor-profile__verified">
                <svg viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 14.5l-4-4 1.41-1.41L10 13.67l6.59-6.59L18 8.5l-8 8z"/></svg>
                Verified Donor
              </span>
            ) : (
              <span className="donor-profile__pending">Pending verification</span>
            )}
            
            {getCooldownDaysLeft(donor.lastDonated) > 0 && (
              <span style={{ display: 'inline-flex', alignItems: 'center', marginLeft: '12px', padding: '4px 10px', background: '#fef3c7', color: '#d97706', fontSize: '0.8rem', fontWeight: 600, borderRadius: '12px', border: '1px solid #fde68a' }}>
                Resting ({getCooldownDaysLeft(donor.lastDonated)} days left)
              </span>
            )}

            <div className="donor-profile__tags">
              <span className="donor-profile__tag">
                <LocationSvg />{donor.city} · {distance}
              </span>
              <span className="donor-profile__tag">
                <CalSvg />Joined {donor.joined || 'Recently'}
              </span>
              <span className="donor-profile__tag">
                Last donated: {donor.lastDonated || 'Not recorded'}
              </span>
            </div>
          </div>

          <div className="donor-profile__blood-badge" aria-label={`Blood group ${donor.bloodGroup}`}>
            <span className="donor-profile__blood-badge-label">Blood</span>
            <span className="donor-profile__blood-badge-group">{donor.bloodGroup}</span>
          </div>
        </div>

        <div className="donor-profile__stats" role="list" aria-label="Donation statistics">
          <div className="donor-profile__stat" role="listitem">
            <span className="donor-profile__stat-value">{donor.donations ?? 0}</span>
            <span className="donor-profile__stat-label">Total Donations</span>
          </div>
          <div className="donor-profile__stat" role="listitem">
            <span className="donor-profile__stat-value">{donor.lives ?? 0}</span>
            <span className="donor-profile__stat-label">Lives Impacted</span>
          </div>
          <div className="donor-profile__stat" role="listitem">
            <span className="donor-profile__stat-value">{donor.streak ?? 0}×</span>
            <span className="donor-profile__stat-label">Donation Streak</span>
          </div>
        </div>

        <div className="donor-profile__info-grid">
          <InfoItem icon={<BloodSvg />} label="Blood Group" value={donor.bloodGroup} />
          <InfoItem icon={<LocationSvg />} label="Location" value={donor.city} />
          <InfoItem icon={<CalSvg />} label="Last Donation" value={donor.lastDonated || 'Not recorded'} />
          <InfoItem icon={<CalSvg />} label="Member Since" value={donor.joined || 'Recently'} />
          {canContact && <InfoItem icon={<PhoneSvg />} label="Contact" value={donor.phone} />}
          <InfoItem
            icon={isVerified
              ? <svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 14.5l-4-4 1.41-1.41L10 13.67l6.59-6.59L18 8.5l-8 8z"/></svg>
              : <svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/></svg>
            }
            label="Status"
            value={isVerified ? 'Verified' : 'Pending verification'}
          />
        </div>

        <div className="donor-profile__actions">
          {canContact ? (
            <a
              href={`tel:${donor.phone}`}
              className="donor-profile__btn-primary"
              id={`call-donor-${donor.id}`}
            >
              <PhoneSvg />
              Call Donor
            </a>
          ) : (
            <button
              className="donor-profile__btn-primary"
              type="button"
              disabled
              title="Contact is available after the donor is verified"
            >
              Contact unavailable
            </button>
          )}
          <Link to="/search" className="donor-profile__btn-secondary" id="find-another-donor-btn">
            Find Another Donor
          </Link>
        </div>
      </div>
    </div>
  );
};

export default DonorProfilePage;
