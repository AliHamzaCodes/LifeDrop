import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import './RequestPage.scss';
import usePageTitle from '../../hooks/usePageTitle';
import { useAppData } from '../../context/AppDataContext';
import { useAuth } from '../../context/AuthContext';
import { BLOOD_GROUPS, BLOOD_COMPONENTS } from '../../constants/blood';
import { PAKISTAN_CITIES, isValidPakistanPhone } from '../../constants/pakistan';
import { fetchHospitals, createBloodExchange, Hospital } from '../../services/hospital.service';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faDroplet,
  faArrowsRotate,
  faHospital,
  faPhone,
  faLocationDot,
  faCheck,
  faMagnifyingGlass,
  faBullhorn,
  faShieldHalved,
  faClock
} from '@fortawesome/free-solid-svg-icons';
import toast from 'react-hot-toast';

const URGENCY_OPTIONS = [
  { id: 'routine', label: 'Routine', detail: 'Within 48–72 hours' },
  { id: 'urgent', label: 'Urgent', detail: 'Within 12–24 hours' },
  { id: 'critical', label: 'Critical', detail: 'Immediate requirement' },
];

const RequestPage = () => {
  usePageTitle('Request Blood & Exchange');
  const locationState = useLocation().state as any;
  const { addRequest } = useAppData();
  const { currentUser, isLoggedIn } = useAuth();

  // Mode: 'standard' (Direct Blood Request) vs 'exchange' (Mutual Blood Exchange)
  const [requestMode, setRequestMode] = useState<'standard' | 'exchange'>(
    locationState?.mode === 'exchange' ? 'exchange' : 'standard'
  );

  // Verified Hospitals List
  const [hospitalsList, setHospitalsList] = useState<Hospital[]>([]);

  useEffect(() => {
    fetchHospitals().then(data => setHospitalsList(data)).catch(console.error);
  }, []);

  // Standard Request Form
  const [selectedGroup, setSelectedGroup] = useState('A+');
  const [urgency, setUrgency] = useState('critical');
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [formData, setFormData] = useState({
    hospitalName: locationState?.hospitalName || '',
    location: locationState?.city || 'Lahore',
    patientName: '',
    contactNumber: currentUser?.phone || '',
    email: currentUser?.email || '',
    units: '1',
    neededBy: '',
    component: 'Whole Blood',
    note: '',
  });

  // Exchange Request Form
  const [exchangeForm, setExchangeForm] = useState({
    hospitalId: locationState?.hospitalId || '',
    hospitalName: locationState?.hospitalName || '',
    patientName: '',
    attendantName: '',
    contactNumber: currentUser?.phone || '',
    requiredGroup: 'B+',
    offeredGroup: 'A+',
    units: 1,
    urgency: 'CRITICAL',
    notes: '',
  });

  const [errors, setErrors] = useState<any>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [submittedData, setSubmittedData] = useState<any>(null);

  const handleStandardChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: '' }));
  };

  const handleExchangeChange = (e) => {
    const { name, value } = e.target;
    setExchangeForm((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: '' }));
  };

  const validateStandard = () => {
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

  const validateExchange = () => {
    const e: any = {};
    if (!exchangeForm.hospitalName && !exchangeForm.hospitalId) e.hospital = 'Please select a hospital blood bank.';
    if (!exchangeForm.patientName.trim()) e.patientName = 'Patient name is required.';
    if (!exchangeForm.attendantName.trim()) e.attendantName = 'Attendant / Donor name is required.';
    if (!exchangeForm.contactNumber.trim()) e.contactNumber = 'Contact number is required.';
    else if (!isValidPakistanPhone(exchangeForm.contactNumber)) e.contactNumber = 'Use a Pakistani mobile number, e.g. 0300-1234567.';
    if (exchangeForm.requiredGroup === exchangeForm.offeredGroup) {
      e.offeredGroup = 'Exchange blood group should be different from required blood group.';
    }
    return e;
  };

  const handleStandardSubmit = async (e) => {
    e.preventDefault();
    const errs = validateStandard();
    if (Object.keys(errs).length) { setErrors(errs); return; }

    setIsSubmitting(true);
    try {
      const urgencyLabel = urgency.charAt(0).toUpperCase() + urgency.slice(1);
      const newRequest = await addRequest({
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

      setSubmittedData({
        type: 'standard',
        id: newRequest?.id ? `REQ-${newRequest.id}` : `REQ-${Date.now().toString().slice(-4)}`,
        bloodGroup: selectedGroup,
        units: formData.units,
        patient: formData.patientName,
        hospital: formData.hospitalName,
        city: formData.location,
        urgency: urgencyLabel,
        phone: formData.contactNumber,
      });
      setSubmitted(true);
      toast.success('Blood request broadcasted to donors!');
    } catch (err) {
      console.error(err);
      toast.error('Failed to submit request');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleExchangeSubmit = async (e) => {
    e.preventDefault();
    const errs = validateExchange();
    if (Object.keys(errs).length) { setErrors(errs); return; }

    setIsSubmitting(true);
    try {
      // Find selected hospital user ID
      const chosenHospital = hospitalsList.find(
        h => String(h.id) === String(exchangeForm.hospitalId) || h.hospital_name === exchangeForm.hospitalName
      ) || hospitalsList[0];

      const res = await createBloodExchange({
        hospital: chosenHospital ? chosenHospital.user_id || chosenHospital.id : 1,
        patient_name: exchangeForm.patientName,
        attendant_name: exchangeForm.attendantName,
        contact_number: exchangeForm.contactNumber,
        required_blood_group: exchangeForm.requiredGroup,
        offered_blood_group: exchangeForm.offeredGroup,
        units: Number(exchangeForm.units),
        urgency: exchangeForm.urgency,
        notes: exchangeForm.notes || 'Emergency mutual blood exchange requested online',
      });

      setSubmittedData({
        type: 'exchange',
        id: `EXC-${res.id || Date.now().toString().slice(-4)}`,
        requiredGroup: exchangeForm.requiredGroup,
        offeredGroup: exchangeForm.offeredGroup,
        units: exchangeForm.units,
        patient: exchangeForm.patientName,
        attendant: exchangeForm.attendantName,
        hospital: chosenHospital?.hospital_name || exchangeForm.hospitalName || 'Hospital Blood Bank',
        city: chosenHospital?.city || 'Pakistan',
        urgency: exchangeForm.urgency,
        phone: exchangeForm.contactNumber,
      });
      setSubmitted(true);
      toast.success('Blood Exchange reservation submitted to Hospital!');
    } catch (err: any) {
      console.error(err);
      toast.error(err.response?.data?.error || 'Failed to submit exchange request');
    } finally {
      setIsSubmitting(false);
    }
  };

  // -------------------------------------------------------------
  // POST-REQUEST SUCCESS & TRACKING HUB
  // -------------------------------------------------------------
  if (submitted && submittedData) {
    const isExchange = submittedData.type === 'exchange';

    return (
      <div className="request-page" id="request-page-success">
        <section className="request-page__hero">
          <div className="container">
            <div className="post-request-hub">
              {/* Glowing Top Radar Beacon */}
              <div className="post-beacon-row">
                <span className="pulse-dot"></span>
                <span>
                  {isExchange
                    ? '🔄 BLOOD REPLACEMENT PROGRAM (خون کا تبادلہ) RESERVED'
                    : '🚨 EMERGENCY REQUEST BROADCASTED ACROSS PAKISTAN'}
                </span>
              </div>

              {/* Main Information Card */}
              <div className="post-main-card">
                <div className="card-top-row">
                  <div>
                    <span className="req-id-tag">Request ID: {submittedData.id}</span>
                    <h2 style={{ margin: '8px 0 0', fontSize: '1.6rem', fontWeight: 900, color: '#0f172a' }}>
                      {isExchange ? 'Blood Exchange Active' : 'Blood Request Dispatched'}
                    </h2>
                  </div>

                  <div className="blood-badge-large">
                    <FontAwesomeIcon icon={faDroplet} />
                    <span>
                      {isExchange
                        ? `${submittedData.offeredGroup} ➔ ${submittedData.requiredGroup}`
                        : `${submittedData.bloodGroup} (${submittedData.units} Unit)`}
                    </span>
                  </div>
                </div>

                {/* Details Grid */}
                <div className="details-grid">
                  <div className="detail-box">
                    <span>Patient Name</span>
                    <strong>{submittedData.patient}</strong>
                  </div>

                  <div className="detail-box">
                    <span>Hospital Blood Bank</span>
                    <strong>{submittedData.hospital}</strong>
                  </div>

                  <div className="detail-box">
                    <span>City & Location</span>
                    <strong>{submittedData.city}</strong>
                  </div>

                  <div className="detail-box">
                    <span>Urgency Level</span>
                    <strong style={{ color: '#dc2626' }}>{submittedData.urgency}</strong>
                  </div>

                  {isExchange && (
                    <div className="detail-box" style={{ gridColumn: 'span 2', background: '#fef2f2', border: '1px solid #fecaca' }}>
                      <span style={{ color: '#991b1b' }}>Mutual Replacement Donor</span>
                      <strong style={{ color: '#7f1d1d' }}>
                        {submittedData.attendant} will donate 1 Unit of {submittedData.offeredGroup} in exchange for 1 Unit of {submittedData.requiredGroup}.
                      </strong>
                    </div>
                  )}
                </div>

                {/* Live 3-Step Progress Pipeline */}
                <div className="live-pipeline">
                  <h4>Live Status Pipeline</h4>
                  <div className="pipeline-steps">
                    <div className="step-item">
                      <div className="step-icon step-icon--done">
                        <FontAwesomeIcon icon={faCheck} />
                      </div>
                      <div className="step-text">
                        <strong>Request Verified</strong>
                        <span>Details verified in system</span>
                      </div>
                    </div>

                    <div className="step-item">
                      <div className="step-icon step-icon--active">
                        <FontAwesomeIcon icon={faBullhorn} />
                      </div>
                      <div className="step-text">
                        <strong>{isExchange ? 'Hospital Counter Alerted' : 'Donors & Blood Banks Notified'}</strong>
                        <span>Fast medical response</span>
                      </div>
                    </div>

                    <div className="step-item">
                      <div className="step-icon step-icon--waiting">
                        <FontAwesomeIcon icon={faShieldHalved} />
                      </div>
                      <div className="step-text">
                        <strong>{isExchange ? 'Blood Swap & Release' : 'Donation Handover'}</strong>
                        <span>Immediate patient care</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* If standard request, recommend Blood Exchange */}
                {!isExchange && (
                  <div className="exchange-tip-box">
                    <div className="tip-content">
                      <h5>Need blood even faster? Try Blood Exchange (خون کا تبادلہ)</h5>
                      <p>
                        Agar mareez ko foran khoon chahiye to family attendant kisi aur blood group (e.g. A+ ya O+) ka khoon de kar hospital se {submittedData.bloodGroup} foran le sakta hai.
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setSubmitted(false);
                        setRequestMode('exchange');
                        setExchangeForm(prev => ({
                          ...prev,
                          patientName: submittedData.patient,
                          hospitalName: submittedData.hospital,
                          requiredGroup: submittedData.bloodGroup,
                          contactNumber: submittedData.phone
                        }));
                      }}
                      className="btn-tip-exchange"
                    >
                      <FontAwesomeIcon icon={faArrowsRotate} /> Open Blood Exchange
                    </button>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="post-actions-row">
                <Link
                  to={`/search?group=${encodeURIComponent(isExchange ? submittedData.requiredGroup : submittedData.bloodGroup)}`}
                  className="btn-search-donors"
                >
                  <FontAwesomeIcon icon={faMagnifyingGlass} /> Call Matching Donors Directly
                </Link>

                <Link to="/hospitals" className="btn-view-hospitals">
                  <FontAwesomeIcon icon={faHospital} /> Check Hospital Blood Banks
                </Link>

                {isLoggedIn && (
                  <Link to="/dashboard" className="btn-view-hospitals">
                    Track in Dashboard
                  </Link>
                )}

                <button
                  type="button"
                  onClick={() => {
                    setSubmitted(false);
                    setSubmittedData(null);
                  }}
                  className="btn-reset-req"
                >
                  Submit Another Request
                </button>
              </div>
            </div>
          </div>
        </section>
      </div>
    );
  }

  // -------------------------------------------------------------
  // FORM VIEW (STANDARD OR EXCHANGE)
  // -------------------------------------------------------------
  return (
    <div className="request-page" id="request-page">
      <section className="request-page__hero" aria-labelledby="request-heading">
        <div className="container">
          <h1 className="request-page__title" id="request-heading">
            {requestMode === 'exchange' ? 'Mutual Blood Exchange (خون کا تبادلہ)' : 'Submit Blood Request'}
          </h1>
          <p className="request-page__subtitle">
            {requestMode === 'exchange'
              ? 'Exchange an available blood group for the group your patient urgently needs at verified Pakistani hospitals.'
              : 'Directly connect with voluntary verified blood donors and hospital reserves in real time.'}
          </p>
        </div>
      </section>

      <section className="request-page__form" aria-label="Blood request form">
        <div className="container">
          {/* Mode Switcher Tabs */}
          <div className="request-mode-tabs">
            <button
              type="button"
              onClick={() => { setRequestMode('standard'); setErrors({}); }}
              className={`mode-tab-btn ${requestMode === 'standard' ? 'mode-tab-btn--active' : ''}`}
            >
              <FontAwesomeIcon icon={faDroplet} />
              <span>Standard Blood Request</span>
            </button>

            <button
              type="button"
              onClick={() => { setRequestMode('exchange'); setErrors({}); }}
              className={`mode-tab-btn ${requestMode === 'exchange' ? 'mode-tab-btn--active' : ''}`}
            >
              <FontAwesomeIcon icon={faArrowsRotate} />
              <span>Mutual Blood Exchange (خون کا تبادلہ)</span>
              <span className="badge-pill">Fastest</span>
            </button>
          </div>

          {/* ======================================================== */}
          {/* FORM 1: MUTUAL BLOOD EXCHANGE FORM                        */}
          {/* ======================================================== */}
          {requestMode === 'exchange' ? (
            <form className="request-card" onSubmit={handleExchangeSubmit}>
              {/* Visual Explanation Banner */}
              <div className="request-exchange-box">
                <div className="exchange-header-tag">
                  <FontAwesomeIcon icon={faShieldHalved} />
                  How Blood Exchange Works (خون کا تبادلہ کیسے کام کرتا ہے)
                </div>
                <p>
                  Jab mareez ko B+ ya koi doosra khoon foran chahiye ho aur available na ho, to koi rishtedar apna khoon (maslan A+ ya O+) hospital blood bank ko de kar badlay mein foran zaroori blood group le sakta hai.
                </p>

                <div className="exchange-columns">
                  <div>
                    <label style={{ display: 'block', fontWeight: 800, fontSize: '0.85rem', color: '#166534', marginBottom: '6px' }}>
                      Attendant Donates (آپ کون سا خون دیں گے) *
                    </label>
                    <select
                      name="offeredGroup"
                      value={exchangeForm.offeredGroup}
                      onChange={handleExchangeChange}
                      style={{ width: '100%', padding: '12px', borderRadius: '12px', border: '2px solid #86efac', fontWeight: 800, fontSize: '1rem', background: '#fff' }}
                    >
                      {BLOOD_GROUPS.map(bg => (
                        <option key={bg} value={bg}>{bg}</option>
                      ))}
                    </select>
                    {errors.offeredGroup && <span className="field-error" style={{ color: '#dc2626', fontSize: '0.78rem' }}>{errors.offeredGroup}</span>}
                  </div>

                  <div className="exchange-arrow">
                    <FontAwesomeIcon icon={faArrowsRotate} />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontWeight: 800, fontSize: '0.85rem', color: '#991b1b', marginBottom: '6px' }}>
                      Patient Needs (ہسپتال سے کون سا گروپ چاہیے) *
                    </label>
                    <select
                      name="requiredGroup"
                      value={exchangeForm.requiredGroup}
                      onChange={handleExchangeChange}
                      style={{ width: '100%', padding: '12px', borderRadius: '12px', border: '2px solid #fca5a5', fontWeight: 800, fontSize: '1rem', background: '#fff' }}
                    >
                      {BLOOD_GROUPS.map(bg => (
                        <option key={bg} value={bg}>{bg}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* Hospital Selection */}
              <div className="form-group" style={{ marginBottom: '20px' }}>
                <label style={{ fontWeight: 700, fontSize: '0.88rem', display: 'block', marginBottom: '8px' }}>
                  Select Hospital Blood Bank *
                </label>
                <select
                  name="hospitalId"
                  value={exchangeForm.hospitalId}
                  onChange={(e) => {
                    const sel = hospitalsList.find(h => String(h.id) === e.target.value);
                    setExchangeForm(prev => ({
                      ...prev,
                      hospitalId: e.target.value,
                      hospitalName: sel?.hospital_name || ''
                    }));
                  }}
                  style={{ width: '100%', padding: '12px 14px', borderRadius: '12px', border: '1.5px solid #cbd5e1', fontSize: '0.95rem' }}
                >
                  <option value="">-- Choose Hospital Blood Bank --</option>
                  {hospitalsList.map(h => (
                    <option key={h.id} value={h.id}>
                      {h.hospital_name || h.username} ({h.city})
                    </option>
                  ))}
                </select>
                {errors.hospital && <span className="field-error" style={{ color: '#dc2626', fontSize: '0.78rem' }}>{errors.hospital}</span>}
              </div>

              {/* Patient & Attendant Details */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
                <div className="form-group">
                  <label style={{ fontWeight: 700, fontSize: '0.88rem', display: 'block', marginBottom: '8px' }}>
                    Patient Full Name *
                  </label>
                  <input
                    type="text"
                    name="patientName"
                    placeholder="e.g. Asad Ullah"
                    value={exchangeForm.patientName}
                    onChange={handleExchangeChange}
                    style={{ width: '100%', padding: '12px 14px', borderRadius: '12px', border: '1.5px solid #cbd5e1' }}
                  />
                  {errors.patientName && <span className="field-error" style={{ color: '#dc2626', fontSize: '0.78rem' }}>{errors.patientName}</span>}
                </div>

                <div className="form-group">
                  <label style={{ fontWeight: 700, fontSize: '0.88rem', display: 'block', marginBottom: '8px' }}>
                    Attendant / Donor Name *
                  </label>
                  <input
                    type="text"
                    name="attendantName"
                    placeholder="e.g. Tariq Mehmood (Brother)"
                    value={exchangeForm.attendantName}
                    onChange={handleExchangeChange}
                    style={{ width: '100%', padding: '12px 14px', borderRadius: '12px', border: '1.5px solid #cbd5e1' }}
                  />
                  {errors.attendantName && <span className="field-error" style={{ color: '#dc2626', fontSize: '0.78rem' }}>{errors.attendantName}</span>}
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '20px', marginBottom: '20px' }}>
                <div className="form-group">
                  <label style={{ fontWeight: 700, fontSize: '0.88rem', display: 'block', marginBottom: '8px' }}>
                    Contact Phone Number *
                  </label>
                  <input
                    type="text"
                    name="contactNumber"
                    placeholder="0300-1234567"
                    value={exchangeForm.contactNumber}
                    onChange={handleExchangeChange}
                    style={{ width: '100%', padding: '12px 14px', borderRadius: '12px', border: '1.5px solid #cbd5e1' }}
                  />
                  {errors.contactNumber && <span className="field-error" style={{ color: '#dc2626', fontSize: '0.78rem' }}>{errors.contactNumber}</span>}
                </div>

                <div className="form-group">
                  <label style={{ fontWeight: 700, fontSize: '0.88rem', display: 'block', marginBottom: '8px' }}>
                    Units to Exchange
                  </label>
                  <input
                    type="number"
                    name="units"
                    min="1"
                    max="5"
                    value={exchangeForm.units}
                    onChange={handleExchangeChange}
                    style={{ width: '100%', padding: '12px 14px', borderRadius: '12px', border: '1.5px solid #cbd5e1' }}
                  />
                </div>

                <div className="form-group">
                  <label style={{ fontWeight: 700, fontSize: '0.88rem', display: 'block', marginBottom: '8px' }}>
                    Urgency
                  </label>
                  <select
                    name="urgency"
                    value={exchangeForm.urgency}
                    onChange={handleExchangeChange}
                    style={{ width: '100%', padding: '12px 14px', borderRadius: '12px', border: '1.5px solid #cbd5e1' }}
                  >
                    <option value="CRITICAL">Critical (Immediate)</option>
                    <option value="HIGH">High (Today)</option>
                    <option value="ROUTINE">Routine</option>
                  </select>
                </div>
              </div>

              <div className="form-group" style={{ marginBottom: '24px' }}>
                <label style={{ fontWeight: 700, fontSize: '0.88rem', display: 'block', marginBottom: '8px' }}>
                  Clinical Notes / Ward Details
                </label>
                <textarea
                  name="notes"
                  rows={2}
                  placeholder="e.g. Operation theatre ward, patient undergoing surgery..."
                  value={exchangeForm.notes}
                  onChange={handleExchangeChange}
                  style={{ width: '100%', padding: '12px 14px', borderRadius: '12px', border: '1.5px solid #cbd5e1' }}
                />
              </div>

              <div className="request-footer">
                <p className="request-footer__note">
                  Hospital blood banks test and verify replacement donations on counter before releasing units.
                </p>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="request-footer__submit"
                >
                  <FontAwesomeIcon icon={faArrowsRotate} />
                  {isSubmitting ? 'Submitting Exchange...' : 'Submit Blood Exchange (خون کا تبادلہ)'}
                </button>
              </div>
            </form>
          ) : (
            /* ======================================================== */
            /* FORM 2: STANDARD DIRECT BLOOD REQUEST                    */
            /* ======================================================== */
            <form className="request-card" onSubmit={handleStandardSubmit}>
              <div className="request-section">
                <div className="request-section__header">
                  <h2 className="request-section__title">Required Blood Group</h2>
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

              {/* Urgency */}
              <div className="request-section" style={{ marginTop: '24px' }}>
                <div className="request-section__header">
                  <h2 className="request-section__title">Urgency Level</h2>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '14px' }}>
                  {URGENCY_OPTIONS.map((opt) => (
                    <div
                      key={opt.id}
                      onClick={() => setUrgency(opt.id)}
                      style={{
                        padding: '14px 18px',
                        borderRadius: '14px',
                        border: '1.5px solid',
                        borderColor: urgency === opt.id ? '#dc2626' : '#e2e8f0',
                        background: urgency === opt.id ? '#fef2f2' : '#ffffff',
                        cursor: 'pointer',
                        transition: 'all 0.2s'
                      }}
                    >
                      <strong style={{ display: 'block', color: urgency === opt.id ? '#dc2626' : '#0f172a' }}>
                        {opt.label}
                      </strong>
                      <span style={{ fontSize: '0.78rem', color: '#64748b' }}>{opt.detail}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Fields */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginTop: '24px' }}>
                <div>
                  <label style={{ display: 'block', fontWeight: 700, fontSize: '0.85rem', marginBottom: '8px' }}>
                    Hospital Name *
                  </label>
                  <input
                    type="text"
                    name="hospitalName"
                    placeholder="e.g. Shaukat Khanum, Mayo Hospital..."
                    value={formData.hospitalName}
                    onChange={handleStandardChange}
                    style={{ width: '100%', padding: '12px 14px', borderRadius: '12px', border: '1.5px solid #cbd5e1' }}
                  />
                  {errors.hospitalName && <span style={{ color: '#dc2626', fontSize: '0.78rem' }}>{errors.hospitalName}</span>}
                </div>

                <div>
                  <label style={{ display: 'block', fontWeight: 700, fontSize: '0.85rem', marginBottom: '8px' }}>
                    City *
                  </label>
                  <select
                    name="location"
                    value={formData.location}
                    onChange={handleStandardChange}
                    style={{ width: '100%', padding: '12px 14px', borderRadius: '12px', border: '1.5px solid #cbd5e1' }}
                  >
                    {PAKISTAN_CITIES.map(c => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                  {errors.location && <span style={{ color: '#dc2626', fontSize: '0.78rem' }}>{errors.location}</span>}
                </div>

                <div>
                  <label style={{ display: 'block', fontWeight: 700, fontSize: '0.85rem', marginBottom: '8px' }}>
                    Patient Full Name *
                  </label>
                  <input
                    type="text"
                    name="patientName"
                    placeholder="e.g. Hamza Ali"
                    value={formData.patientName}
                    onChange={handleStandardChange}
                    style={{ width: '100%', padding: '12px 14px', borderRadius: '12px', border: '1.5px solid #cbd5e1' }}
                  />
                  {errors.patientName && <span style={{ color: '#dc2626', fontSize: '0.78rem' }}>{errors.patientName}</span>}
                </div>

                <div>
                  <label style={{ display: 'block', fontWeight: 700, fontSize: '0.85rem', marginBottom: '8px' }}>
                    Contact Phone Number *
                  </label>
                  <input
                    type="text"
                    name="contactNumber"
                    placeholder="0300-1234567"
                    value={formData.contactNumber}
                    onChange={handleStandardChange}
                    style={{ width: '100%', padding: '12px 14px', borderRadius: '12px', border: '1.5px solid #cbd5e1' }}
                  />
                  {errors.contactNumber && <span style={{ color: '#dc2626', fontSize: '0.78rem' }}>{errors.contactNumber}</span>}
                </div>

                <div>
                  <label style={{ display: 'block', fontWeight: 700, fontSize: '0.85rem', marginBottom: '8px' }}>
                    Units Needed (1–10) *
                  </label>
                  <input
                    type="number"
                    name="units"
                    min="1"
                    max="10"
                    value={formData.units}
                    onChange={handleStandardChange}
                    style={{ width: '100%', padding: '12px 14px', borderRadius: '12px', border: '1.5px solid #cbd5e1' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontWeight: 700, fontSize: '0.85rem', marginBottom: '8px' }}>
                    Needed By Date *
                  </label>
                  <input
                    type="date"
                    name="neededBy"
                    value={formData.neededBy}
                    onChange={handleStandardChange}
                    style={{ width: '100%', padding: '12px 14px', borderRadius: '12px', border: '1.5px solid #cbd5e1' }}
                  />
                  {errors.neededBy && <span style={{ color: '#dc2626', fontSize: '0.78rem' }}>{errors.neededBy}</span>}
                </div>
              </div>

              <div style={{ marginTop: '20px' }}>
                <label style={{ display: 'block', fontWeight: 700, fontSize: '0.85rem', marginBottom: '8px' }}>
                  Additional Notes
                </label>
                <textarea
                  name="note"
                  rows={2}
                  placeholder="Doctor's notes, ward number, or instructions..."
                  value={formData.note}
                  onChange={handleStandardChange}
                  style={{ width: '100%', padding: '12px 14px', borderRadius: '12px', border: '1.5px solid #cbd5e1' }}
                />
              </div>

              <div style={{ marginTop: '20px' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '0.85rem', color: '#475569' }}>
                  <input
                    type="checkbox"
                    checked={acceptedTerms}
                    onChange={(e) => {
                      setAcceptedTerms(e.target.checked);
                      if (e.target.checked) setErrors((prev) => ({ ...prev, terms: '' }));
                    }}
                  />
                  <span>I agree to the Terms of Service & Privacy Policy for emergency blood coordination.</span>
                </label>
                {errors.terms && <span style={{ color: '#dc2626', fontSize: '0.78rem', display: 'block', marginTop: '4px' }}>{errors.terms}</span>}
              </div>

              <div className="request-footer">
                <p className="request-footer__note">
                  All requests are broadcasted in real time to nearby verified donors in Pakistan.
                </p>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="request-footer__submit"
                >
                  <FontAwesomeIcon icon={faDroplet} />
                  {isSubmitting ? 'Broadcasting...' : 'Broadcast Blood Request'}
                </button>
              </div>
            </form>
          )}
        </div>
      </section>
    </div>
  );
};

export default RequestPage;
