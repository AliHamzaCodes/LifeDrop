import { useEffect, useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faPenToSquare,
  faDroplet,
  faLocationDot,
  faEnvelope,
  faPhone,
  faRightFromBracket,
  faKey,
  faShieldHalved,
  faHeart,
  faCheck,
  faCalendarCheck,
  faCircleCheck,
  faAward,
  faBell,
  faMoon,
  faSun,
} from '@fortawesome/free-solid-svg-icons';
import './MyProfile.scss';
import AppSpinner from '../AppSpinner/AppSpinner';
import api from '../../utils/api';
import { fetchProfileData, fetchDonations } from '../../api/services';
import { useAuth } from '../../context/AuthContext';
import { getInitials } from '../../utils/avatar';
import { PAKISTAN_CITIES, isValidPakistanPhone } from '../../constants/pakistan';

const EditableField = ({ label, value, type = 'text', id, onSave, listId, options }) => {
  const [editing, setEditing] = useState(false);
  const [val, setVal] = useState(value);
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    onSave?.(val);
    setEditing(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const startEdit = () => {
    setVal(value);
    setEditing(true);
  };

  return (
    <div className="profile-field">
      <label className="profile-field__label" htmlFor={id}>{label}</label>
      {editing ? (
        <div className="profile-field__edit-row">
          <input
            id={id}
            type={type}
            className="profile-field__input"
            value={val}
            list={listId}
            onChange={(e) => setVal(e.target.value)}
            autoFocus
          />
          {options && (
            <datalist id={listId}>
              {options.map((opt) => <option key={opt} value={opt} />)}
            </datalist>
          )}
          <button className="profile-field__save-btn" type="button" onClick={handleSave} id={`${id}-save`}>
            <FontAwesomeIcon icon={faCheck} /> Save
          </button>
        </div>
      ) : (
        <div className="profile-field__view-row">
          <span className="profile-field__value">{val || 'Not set'}</span>
          <button
            className="profile-field__edit-btn"
            type="button"
            onClick={startEdit}
            id={`${id}-edit`}
            aria-label={`Edit ${label}`}
          >
            <FontAwesomeIcon icon={faPenToSquare} />
          </button>
          {saved && <span className="profile-field__saved-tag"><FontAwesomeIcon icon={faCircleCheck} /> Saved</span>}
        </div>
      )}
    </div>
  );
};

const DonationTimeline = ({ timelineEvents }) => (
  <div className="profile-timeline">
    <div className="profile-timeline__header">
      <h3 className="profile-timeline__title">
        <FontAwesomeIcon icon={faCalendarCheck} className="profile-timeline__title-icon" />
        Donation History
      </h3>
      <span className="profile-timeline__count">{timelineEvents.length} Total</span>
    </div>
    {timelineEvents.length === 0 ? (
      <p className="profile-timeline__meta">No donations recorded for this account yet.</p>
    ) : (
      <ol className="profile-timeline__list" aria-label="Donation history timeline">
        {timelineEvents.map((ev, idx) => (
          <li className="profile-timeline__item" key={ev.id} id={ev.id}>
            <div className="profile-timeline__dot" aria-hidden="true">
              <FontAwesomeIcon icon={faDroplet} />
            </div>
            {idx < timelineEvents.length - 1 && <div className="profile-timeline__line" aria-hidden="true" />}
            <div className="profile-timeline__content">
              <div className="profile-timeline__top">
                <p className="profile-timeline__hospital">{ev.hospital}</p>
                <span className="profile-timeline__badge">{ev.badge}</span>
              </div>
              <p className="profile-timeline__meta">
                <FontAwesomeIcon icon={faCalendarCheck} />
                {ev.date} &bull; {ev.units} donated
              </p>
            </div>
          </li>
        ))}
      </ol>
    )}
  </div>
);

const Achievements = ({ achievements }) => (
  <div className="profile-achievements">
    <h3 className="profile-achievements__title">
      <FontAwesomeIcon icon={faAward} className="profile-achievements__title-icon" />
      Achievements
    </h3>
    <div className="profile-achievements__grid">
      {achievements.map((a) => (
        <div
          key={a.id}
          id={a.id}
          className={`profile-achievements__item${a.earned ? '' : ' profile-achievements__item--locked'}`}
          title={a.earned ? `Earned: ${a.desc}` : `Locked – ${a.desc}`}
        >
          <span className="profile-achievements__icon" aria-hidden="true">
            <FontAwesomeIcon icon={a.icon} />
          </span>
          <p className="profile-achievements__label">{a.label}</p>
          <p className="profile-achievements__desc">{a.desc}</p>
          {a.earned && <span className="profile-achievements__check" aria-label="Earned"><FontAwesomeIcon icon={faCircleCheck} /></span>}
        </div>
      ))}
    </div>
  </div>
);

const NotificationSettings = ({ notifPrefs }) => {
  const [prefs, setPrefs] = useState(
    notifPrefs.reduce((acc, p) => ({ ...acc, [p.id]: p.default }), {})
  );

  return (
    <div className="profile-notif">
      <h3 className="profile-notif__title">
        <FontAwesomeIcon icon={faBell} className="profile-notif__title-icon" />
        Notification Preferences
      </h3>
      <p className="profile-notif__desc" style={{ padding: '0 1.25rem', fontSize: '0.8rem', color: '#5c5c6a' }}>
        Saved in this browser only. No emails are sent in the demo.
      </p>
      <div className="profile-notif__list">
        {notifPrefs.map((pref) => (
          <div className="profile-notif__item" key={pref.id}>
            <span className="profile-notif__pref-icon" aria-hidden="true">
              <FontAwesomeIcon icon={pref.icon} />
            </span>
            <div className="profile-notif__text">
              <p className="profile-notif__label">{pref.label}</p>
              <p className="profile-notif__desc">{pref.desc}</p>
            </div>
            <label className="profile-toggle" htmlFor={pref.id} aria-label={`Toggle ${pref.label}`}>
              <input
                type="checkbox"
                id={pref.id}
                className="profile-toggle__input"
                checked={prefs[pref.id]}
                onChange={() => setPrefs((prev) => ({ ...prev, [pref.id]: !prev[pref.id] }))}
              />
              <span className="profile-toggle__track">
                <span className="profile-toggle__thumb" aria-hidden="true">
                  <FontAwesomeIcon icon={prefs[pref.id] ? faSun : faMoon} />
                </span>
              </span>
            </label>
          </div>
        ))}
      </div>
    </div>
  );
};

const daysUntilEligible = (donations) => {
  const GAP_DAYS = 84;
  const dated = donations
    .map((d) => d.rawDate)
    .filter(Boolean)
    .sort()
    .reverse();
  if (!dated.length) return 0;
  const last = new Date(dated[0]);
  const next = new Date(last);
  next.setDate(next.getDate() + GAP_DAYS);
  const diff = Math.ceil((next - new Date()) / (1000 * 60 * 60 * 24));
  return Math.max(0, diff);
};

const MyProfile = ({ onLogout }) => {
  const { currentUser, updateCurrentUser, changePassword } = useAuth();

  const fullName = currentUser?.fullName ?? 'Unknown User';
  const email = currentUser?.email ?? 'No email on file';
  const bloodGroup = currentUser?.bloodGroup ?? 'N/A';
  const initials = getInitials(fullName);

  const [editingProfile, setEditingProfile] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [pwForm, setPwForm] = useState({ current: '', next: '', confirm: '' });
  const [pwErrors, setPwErrors] = useState<any>({});
  const [pwStatus, setPwStatus] = useState('');
  const [profileData, setProfileData] = useState<any>(null);
  const [donations, setDonations] = useState<any[]>([]);
  const [qrCode, setQrCode] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      const [data, history] = await Promise.all([
        fetchProfileData(),
        fetchDonations(currentUser?.id),
      ]);
      setProfileData(data);
      setDonations(history);
      const donorLookup = currentUser?.fullName || currentUser?.id;
      if (donorLookup) {
        api.get(`donors/${donorLookup}/qr_code/`)
          .then(res => setQrCode(res.data.qr_code_base64))
          .catch(console.error);
      }
      setLoading(false);
    };
    load();
  }, [currentUser?.id]);

  if (loading || !profileData) {
    return (
      <section className="my-profile" aria-labelledby="my-profile-title">
        <AppSpinner label="Loading profile..." />
      </section>
    );
  }

  const nextDonationDays = daysUntilEligible(donations);
  const timelineEvents = donations.map((d) => ({
    id: d.id,
    hospital: d.location,
    badge: d.type,
    date: d.date,
    units: d.volume,
  }));
  const donationCount = donations.length || currentUser?.donationsMade || 0;
  const lives = donationCount * 3;
  const joinedLabel = currentUser?.createdAt
    ? new Date(currentUser.createdAt).toLocaleDateString('en-PK', { month: 'long', year: 'numeric' })
    : 'This year';

  const handlePasswordSave = async () => {
    const next = {};
    if (!pwForm.current) next.current = 'Enter your current password.';
    if (pwForm.next.length < 8) next.next = 'New password must be at least 8 characters.';
    if (pwForm.next !== pwForm.confirm) next.confirm = 'Passwords do not match.';
    if (Object.keys(next).length) { setPwErrors(next); return; }
    const res = await changePassword({ currentPassword: pwForm.current, newPassword: pwForm.next });
    if (!res.ok) {
      setPwErrors({ current: res.error });
      return;
    }
    setPwStatus('Password updated in this demo (stored in your browser).');
    setPwForm({ current: '', next: '', confirm: '' });
    setTimeout(() => {
      setShowPasswordModal(false);
      setPwStatus('');
    }, 1200);
  };

  return (
    <section className="my-profile" aria-labelledby="my-profile-title">
      <div className="my-profile__heading">
        <div>
          <h1 className="my-profile__title" id="my-profile-title">My Profile</h1>
          <p className="my-profile__subtitle">Manage your personal information and donation settings.</p>
        </div>
      </div>

      <div className="my-profile__hero-row">
        <div className="profile-hero-card">
          <div className="profile-hero-card__avatar-wrap">
            <div className="profile-hero-card__avatar-fallback" aria-hidden="true">{initials}</div>
          </div>

          <div className="profile-hero-card__info">
            <div className="profile-hero-card__name-row">
              <h2 className="profile-hero-card__name">{fullName}</h2>
              <button
                className="profile-hero-card__edit-btn"
                type="button"
                id="profile-edit-btn"
                onClick={() => setEditingProfile(!editingProfile)}
                aria-pressed={editingProfile}
              >
                <FontAwesomeIcon icon={faPenToSquare} />
                {editingProfile ? 'Done' : 'Edit Profile'}
              </button>
            </div>

            <div className="profile-hero-card__meta-row">
              <span className="profile-hero-card__verified-badge">
                <FontAwesomeIcon icon={faShieldHalved} />
                {currentUser?.role === 'admin' ? 'Administrator' : 'Registered user'}
              </span>
              <span className="profile-hero-card__joined">Joined {joinedLabel}</span>
            </div>

            <p className="profile-hero-card__bio">
              Profile photo upload will arrive with the backend. Your initials are shown until then.
            </p>
          </div>
        </div>

        <div className="profile-blood-card" id="profile-blood-group-card">
          <p className="profile-blood-card__label">
            <FontAwesomeIcon icon={faDroplet} className="profile-blood-card__label-icon" />
            BLOOD GROUP
          </p>
          <div className="profile-blood-card__group" aria-label={`Blood group ${bloodGroup}`}>{bloodGroup || '—'}</div>
          <p className="profile-blood-card__eligibility">
            {nextDonationDays === 0 ? (
              <strong className="profile-blood-card__days">Eligible to donate</strong>
            ) : (
              <>Eligible again in <strong className="profile-blood-card__days">{nextDonationDays} days</strong></>
            )}
          </p>
          <div className="profile-blood-card__countdown-bar" aria-hidden="true">
            <div
              className="profile-blood-card__countdown-fill"
              style={{ width: `${((84 - nextDonationDays) / 84) * 100}%` }}
            />
          </div>
          <p className="profile-blood-card__countdown-hint" style={{marginBottom: '16px'}}>About 12 weeks between whole-blood donations</p>
          
          {qrCode && (
            <div style={{ textAlign: 'center', marginTop: '16px', borderTop: '1px solid #eee', paddingTop: '16px' }}>
              <p style={{ fontWeight: 600, color: '#333', fontSize: '0.9rem', marginBottom: '8px' }}>Your Health Card QR</p>
              <img src={qrCode} alt="Health Card QR Code" style={{ width: '120px', height: '120px', border: '2px solid #e2e8f0', borderRadius: '8px' }} />
            </div>
          )}
        </div>
      </div>

      <div className="my-profile__mid-row">
        <div className="profile-contact-card">
          <h3 className="profile-contact-card__title">Contact Details</h3>

          {editingProfile ? (
            <div className="profile-contact-card__fields">
              <EditableField
                id="field-location"
                label="City"
                value={currentUser?.city || ''}
                listId="profile-cities"
                options={PAKISTAN_CITIES}
                onSave={(city) => updateCurrentUser({ city })}
              />
              <EditableField id="field-email" label="Email Address" value={email} type="email" onSave={(nextEmail) => updateCurrentUser({ email: nextEmail })} />
              <EditableField
                id="field-phone"
                label="Phone Number"
                value={currentUser?.phone || ''}
                type="tel"
                onSave={(phone) => {
                  if (phone && !isValidPakistanPhone(phone)) return;
                  updateCurrentUser({ phone });
                }}
              />
            </div>
          ) : (
            <div className="profile-contact-card__items">
              <div className="profile-contact-item" id="contact-location">
                <span className="profile-contact-item__icon profile-contact-item__icon--location" aria-hidden="true">
                  <FontAwesomeIcon icon={faLocationDot} />
                </span>
                <div>
                  <p className="profile-contact-item__primary">City</p>
                  <p className="profile-contact-item__value">{currentUser?.city || 'Not set'}</p>
                </div>
              </div>

              <div className="profile-contact-item" id="contact-email">
                <span className="profile-contact-item__icon profile-contact-item__icon--email" aria-hidden="true">
                  <FontAwesomeIcon icon={faEnvelope} />
                </span>
                <div>
                  <p className="profile-contact-item__primary">Email Address</p>
                  <p className="profile-contact-item__value">{email}</p>
                </div>
              </div>

              <div className="profile-contact-item" id="contact-phone">
                <span className="profile-contact-item__icon profile-contact-item__icon--phone" aria-hidden="true">
                  <FontAwesomeIcon icon={faPhone} />
                </span>
                <div>
                  <p className="profile-contact-item__primary">Phone Number</p>
                  <p className="profile-contact-item__value">{currentUser?.phone || 'Not set'}</p>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="profile-impact-card" id="profile-lifetime-impact">
          <div className="profile-impact-card__header">
            <span className="profile-impact-card__icon" aria-hidden="true">
              <FontAwesomeIcon icon={faHeart} />
            </span>
            <div>
              <h3 className="profile-impact-card__title">Lifetime Impact</h3>
              <p className="profile-impact-card__subtitle">From your recorded donations in this demo</p>
            </div>
          </div>

          <div className="profile-impact-card__stats">
            <div className="profile-impact-stat" id="impact-total-donations">
              <span className="profile-impact-stat__value">{donationCount}</span>
              <span className="profile-impact-stat__label">TOTAL DONATIONS</span>
            </div>
            <div className="profile-impact-divider" aria-hidden="true" />
            <div className="profile-impact-stat" id="impact-lives-saved">
              <span className="profile-impact-stat__value">{lives}</span>
              <span className="profile-impact-stat__label">POTENTIAL LIVES HELPED</span>
            </div>
          </div>
        </div>
      </div>

      <div className="my-profile__tracker-row">
        <Achievements achievements={profileData.achievements} />
      </div>

      <div className="my-profile__bottom-row">
        <DonationTimeline timelineEvents={timelineEvents} />
        <NotificationSettings notifPrefs={profileData.notifPrefs} />
      </div>

      <div className="profile-security-card" id="profile-account-security">
        <div className="profile-security-card__left">
          <span className="profile-security-card__icon" aria-hidden="true">
            <FontAwesomeIcon icon={faShieldHalved} />
          </span>
          <div>
            <p className="profile-security-card__title">Account Security</p>
            <p className="profile-security-card__desc">Change your demo password or sign out of this browser session.</p>
          </div>
        </div>
        <div className="profile-security-card__actions">
          <button
            className="profile-security-card__btn profile-security-card__btn--outline"
            type="button"
            id="profile-change-password"
            onClick={() => setShowPasswordModal(true)}
          >
            <FontAwesomeIcon icon={faKey} />
            Change Password
          </button>
          <button
            className="profile-security-card__btn profile-security-card__btn--danger"
            type="button"
            id="profile-logout"
            onClick={onLogout}
          >
            <FontAwesomeIcon icon={faRightFromBracket} />
            Logout
          </button>
        </div>
      </div>

      {showPasswordModal && (
        <div
          className="profile-modal-overlay"
          role="dialog"
          aria-modal="true"
          aria-labelledby="modal-title"
          onClick={(e) => e.target === e.currentTarget && setShowPasswordModal(false)}
        >
          <div className="profile-modal">
            <h3 className="profile-modal__title" id="modal-title">
              <FontAwesomeIcon icon={faKey} /> Change Password
            </h3>
            <p className="profile-modal__hint">Passwords in this demo are stored in your browser, not on a server.</p>
            <div className="profile-modal__fields">
              <div className="profile-field">
                <label className="profile-field__label" htmlFor="modal-current-pw">Current Password</label>
                <input
                  id="modal-current-pw"
                  type="password"
                  className="profile-field__input"
                  value={pwForm.current}
                  onChange={(e) => { setPwForm((p) => ({ ...p, current: e.target.value })); setPwErrors((p) => ({ ...p, current: '' })); }}
                />
                {pwErrors.current && <span className="profile-field__error" role="alert">{pwErrors.current}</span>}
              </div>
              <div className="profile-field">
                <label className="profile-field__label" htmlFor="modal-new-pw">New Password</label>
                <input
                  id="modal-new-pw"
                  type="password"
                  className="profile-field__input"
                  value={pwForm.next}
                  onChange={(e) => { setPwForm((p) => ({ ...p, next: e.target.value })); setPwErrors((p) => ({ ...p, next: '' })); }}
                />
                {pwErrors.next && <span className="profile-field__error" role="alert">{pwErrors.next}</span>}
              </div>
              <div className="profile-field">
                <label className="profile-field__label" htmlFor="modal-confirm-pw">Confirm New Password</label>
                <input
                  id="modal-confirm-pw"
                  type="password"
                  className="profile-field__input"
                  value={pwForm.confirm}
                  onChange={(e) => { setPwForm((p) => ({ ...p, confirm: e.target.value })); setPwErrors((p) => ({ ...p, confirm: '' })); }}
                />
                {pwErrors.confirm && <span className="profile-field__error" role="alert">{pwErrors.confirm}</span>}
              </div>
            </div>
            {pwStatus && <p role="status">{pwStatus}</p>}
            <div className="profile-modal__actions">
              <button
                className="profile-security-card__btn profile-security-card__btn--outline"
                type="button"
                id="modal-cancel"
                onClick={() => setShowPasswordModal(false)}
              >
                Cancel
              </button>
              <button
                className="profile-security-card__btn profile-security-card__btn--primary"
                type="button"
                id="modal-save-password"
                onClick={handlePasswordSave}
              >
                <FontAwesomeIcon icon={faCheck} /> Update Password
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};

export default MyProfile;

