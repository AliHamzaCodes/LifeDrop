import { useState } from 'react';
import { Link } from 'react-router-dom';
import './RequestPage.scss';
import usePageTitle from '../../hooks/usePageTitle';
import { useAppData } from '../../context/AppDataContext';
import { useAuth } from '../../context/AuthContext';
import { BLOOD_GROUPS, BLOOD_COMPONENTS } from '../../constants/blood';
import { PAKISTAN_CITIES, isValidPakistanPhone } from '../../constants/pakistan';

const URGENCY_OPTIONS = [
  { id: 'routine', label: 'Routine', detail: 'Within 48–72 hours' },
  { id: 'urgent', label: 'Urgent', detail: 'Within 12–24 hours' },
  { id: 'critical', label: 'Critical', detail: 'Immediate requirement' },
];

const RequestPage = () => {
  usePageTitle('Request Blood');
  const { addRequest } = useAppData();
  const { currentUser, isLoggedIn } = useAuth();
  const [selectedGroup, setSelectedGroup] = useState('A+');
  const [urgency, setUrgency] = useState('critical');
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [formData, setFormData] = useState({
    hospitalName: '',
    location: '',
    patientName: '',
    contactNumber: currentUser?.phone || '',
    email: currentUser?.email || '',
    units: '1',
    neededBy: '',
    component: 'Whole Blood',
    note: '',
  });
  const [errors, setErrors] = useState<any>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [submittedId, setSubmittedId] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: '' }));
  };

  const validate = () => {
    const e: any = {};
    if (!formData.hospitalName.trim()) e.hospitalName = 'Hospital name is required.';
    if (!formData.location.trim()) e.location = 'City is required.';
    if (!formData.patientName.trim()) e.patientName = 'Patient name is required.';
    if (!formData.contactNumber.trim()) e.contactNumber = 'Contact number is required.';
    else if (!isValidPakistanPhone(formData.contactNumber)) e.contactNumber = 'Use a Pakistani mobile number, e.g. 0300-1234567.';
    if (!isLoggedIn && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      e.email = 'Email is required so we can follow up.';
    }
    const units = Number(formData.units);
    if (!units || units < 1 || units > 10) e.units = 'Enter 1–10 units.';
    if (!formData.neededBy) e.neededBy = 'Needed-by date is required.';
    if (!acceptedTerms) e.terms = 'Please accept the Terms and Privacy Policy.';
    return e;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }

    setIsSubmitting(true);
    await new Promise((resolve) => setTimeout(resolve, 700));

    const urgencyLabel = urgency.charAt(0).toUpperCase() + urgency.slice(1);
    const newRequest = addRequest({
      bloodGroup: selectedGroup,
      hospital: formData.hospitalName,
      patient: formData.patientName,
      location: formData.location,
      contactNumber: formData.contactNumber,
      email: formData.email || currentUser?.email,
      units: Number(formData.units),
      component: formData.component,
      urgency: urgencyLabel,
      note: formData.note || urgencyLabel,
      neededBy: new Date(formData.neededBy).toLocaleDateString('en-PK', {
        day: 'numeric', month: 'short', year: 'numeric',
      }),
      userId: currentUser?.id ?? null,
    });

    setIsSubmitting(false);
    setSubmittedId(newRequest.id);
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <div className="request-page" id="request-page-success">
        <section className="request-page__hero">
          <div className="container request-page__success">
            <h1 className="request-page__title">Request submitted</h1>
            <p className="request-page__subtitle">
              Your blood request is now active. Compatible donors can be found on the search page.
            </p>
            {submittedId && (
              <p>Request ID: <strong>{submittedId}</strong></p>
            )}
            <div className="request-page__success-actions">
              {isLoggedIn ? (
                <Link to="/dashboard" className="request-footer__submit">Track in Dashboard</Link>
              ) : (
                <Link to="/auth?mode=register" className="request-footer__submit">Create an account to track this request</Link>
              )}
              <Link to="/search" className="request-group-btn">Find compatible donors</Link>
              <button
                type="button"
                className="request-group-btn"
                onClick={() => {
                  setSubmitted(false);
                  setSubmittedId('');
                  setFormData((prev) => ({ ...prev, hospitalName: '', patientName: '', note: '' }));
                }}
              >
                Submit another request
              </button>
            </div>
          </div>
        </section>
      </div>
    );
  }

  return (
    <div className="request-page" id="request-page">
      <section className="request-page__hero" aria-labelledby="request-heading">
        <div className="container">
          <h1 className="request-page__title" id="request-heading">Submit Blood Request</h1>
          <p className="request-page__subtitle">
            Provide accurate hospital and patient details so we can match compatible donors in Pakistan.
          </p>
        </div>
      </section>

      <section className="request-page__form" aria-label="Blood request form">
        <div className="container">
          <form className="request-card" onSubmit={handleSubmit} >
            <div className="request-section">
              <div className="request-section__header">
                <h2 className="request-section__title">Required blood group</h2>
              </div>
              <div className="request-groups" role="group" aria-label="Select blood group">
                {BLOOD_GROUPS.map((group) => (
                  <button
                    key={group}
                    type="button"
                    className={`request-group-btn ${selectedGroup === group ? 'request-group-btn--active' : ''}`}
                    aria-pressed={selectedGroup === group}
                    onClick={() => setSelectedGroup(group)}
                  >
                    {group}
                  </button>
                ))}
              </div>
            </div>

            <div className="request-divider" aria-hidden="true" />

            <div className="request-section">
              <div className="request-section__header">
                <h2 className="request-section__title">Urgency</h2>
              </div>
              <div className="urgency-grid" role="group" aria-label="Select urgency">
                {URGENCY_OPTIONS.map((option) => (
                  <button
                    key={option.id}
                    type="button"
                    className={`urgency-card ${urgency === option.id ? 'urgency-card--active' : ''}`}
                    aria-pressed={urgency === option.id}
                    onClick={() => setUrgency(option.id)}
                  >
                    <div className="urgency-card__text">
                      <span className="urgency-card__label">{option.label}</span>
                      <span className="urgency-card__detail">{option.detail}</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            <div className="request-divider" aria-hidden="true" />

            <div className="request-section">
              <div className="request-section__header">
                <h2 className="request-section__title">Hospital and patient details</h2>
              </div>

              <div className="request-field">
                <label className="request-field__label" htmlFor="hospital-name">Hospital / clinic name</label>
                <div className={`request-field__input ${errors.hospitalName ? 'error' : ''}`}>
                  <input
                    id="hospital-name"
                    name="hospitalName"
                    value={formData.hospitalName}
                    onChange={handleChange}
                    type="text"
                    placeholder="e.g. Mayo Hospital, Lahore"
                    aria-invalid={Boolean(errors.hospitalName)}
                    aria-describedby={errors.hospitalName ? 'hospital-name-error' : undefined}
                  />
                </div>
                {errors.hospitalName && <span className="request-field__error" id="hospital-name-error" role="alert">{errors.hospitalName}</span>}
              </div>

              <div className="request-field">
                <label className="request-field__label" htmlFor="hospital-location">City</label>
                <div className={`request-field__input ${errors.location ? 'error' : ''}`}>
                  <input
                    id="hospital-location"
                    name="location"
                    list="pk-cities"
                    value={formData.location}
                    onChange={handleChange}
                    type="text"
                    placeholder="Lahore, Karachi, Islamabad…"
                    aria-invalid={Boolean(errors.location)}
                    aria-describedby={errors.location ? 'hospital-location-error' : undefined}
                  />
                </div>
                <datalist id="pk-cities">
                  {PAKISTAN_CITIES.map((city) => <option key={city} value={city} />)}
                </datalist>
                {errors.location && <span className="request-field__error" id="hospital-location-error" role="alert">{errors.location}</span>}
              </div>

              <div className="request-grid">
                <div className="request-field">
                  <label className="request-field__label" htmlFor="patient-name">Patient name</label>
                  <div className={`request-field__input ${errors.patientName ? 'error' : ''}`}>
                    <input id="patient-name" name="patientName" value={formData.patientName} onChange={handleChange} type="text" placeholder="Full name" aria-invalid={Boolean(errors.patientName)} />
                  </div>
                  {errors.patientName && <span className="request-field__error" role="alert">{errors.patientName}</span>}
                </div>
                <div className="request-field">
                  <label className="request-field__label" htmlFor="contact-number">Contact number</label>
                  <div className={`request-field__input ${errors.contactNumber ? 'error' : ''}`}>
                    <input id="contact-number" name="contactNumber" value={formData.contactNumber} onChange={handleChange} type="tel" placeholder="0300-1234567" aria-invalid={Boolean(errors.contactNumber)} />
                  </div>
                  {errors.contactNumber && <span className="request-field__error" role="alert">{errors.contactNumber}</span>}
                </div>
              </div>

              {!isLoggedIn && (
                <div className="request-field">
                  <label className="request-field__label" htmlFor="request-email">Email (required for guests)</label>
                  <div className={`request-field__input ${errors.email ? 'error' : ''}`}>
                    <input id="request-email" name="email" value={formData.email} onChange={handleChange} type="email" placeholder="you@example.com" aria-invalid={Boolean(errors.email)} />
                  </div>
                  {errors.email && <span className="request-field__error" role="alert">{errors.email}</span>}
                  <p className="request-field__error" style={{ color: '#5c5c6a', fontWeight: 400 }}>
                    <Link to="/auth?mode=login&redirect=%2Frequest">Log in</Link> to track this request in your dashboard.
                  </p>
                </div>
              )}

              <div className="request-grid">
                <div className="request-field">
                  <label className="request-field__label" htmlFor="request-units">Units needed</label>
                  <div className={`request-field__input ${errors.units ? 'error' : ''}`}>
                    <input id="request-units" name="units" type="number" min="1" max="10" value={formData.units} onChange={handleChange} />
                  </div>
                  {errors.units && <span className="request-field__error" role="alert">{errors.units}</span>}
                </div>
                <div className="request-field">
                  <label className="request-field__label" htmlFor="needed-by">Needed by</label>
                  <div className={`request-field__input ${errors.neededBy ? 'error' : ''}`}>
                    <input id="needed-by" name="neededBy" type="date" value={formData.neededBy} onChange={handleChange} />
                  </div>
                  {errors.neededBy && <span className="request-field__error" role="alert">{errors.neededBy}</span>}
                </div>
              </div>

              <div className="request-field">
                <label className="request-field__label" htmlFor="component">Blood component</label>
                <div className="request-field__input">
                  <select id="component" name="component" value={formData.component} onChange={handleChange}>
                    {BLOOD_COMPONENTS.map((c) => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
              </div>

              <div className="request-field">
                <label className="request-field__label" htmlFor="request-note">Notes (optional)</label>
                <div className="request-field__input">
                  <textarea id="request-note" name="note" rows={2} value={formData.note} onChange={handleChange} placeholder="Surgery, accident, paediatric case…" />
                </div>
              </div>
            </div>

            <div className="request-footer">
              <label className="request-footer__note">
                <input
                  type="checkbox"
                  checked={acceptedTerms}
                  onChange={(e) => { setAcceptedTerms(e.target.checked); setErrors((prev) => ({ ...prev, terms: '' })); }}
                />{' '}
                I agree to the <Link to="/terms">Terms of Service</Link> and <Link to="/privacy">Privacy Policy</Link>.
                {errors.terms && <span className="request-field__error" role="alert">{errors.terms}</span>}
              </label>
              <button className="request-footer__submit" type="submit" disabled={isSubmitting}>
                {isSubmitting ? 'Submitting…' : 'Submit Request'}
              </button>
            </div>
          </form>
        </div>
      </section>
    </div>
  );
};

export default RequestPage;

