import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faHospital, faPhone, faLocationDot, faMagnifyingGlass, 
  faCheckCircle, faDroplet, faHandHoldingDroplet 
} from '@fortawesome/free-solid-svg-icons';
import { faWhatsapp } from '@fortawesome/free-brands-svg-icons';
import { fetchHospitals, Hospital } from '../../services/hospital.service';
import { getWhatsAppUrl } from '../../utils/whatsapp';
import AppSpinner from '../../components/AppSpinner/AppSpinner';
import EmptyState from '../../components/EmptyState/EmptyState';
import './HospitalsPage.scss';

const CITIES = ['All', 'Lahore', 'Karachi', 'Islamabad', 'Rawalpindi', 'Multan'];

const getStockClass = (units: number) => {
  if (units > 10) return 'hospitals-page__stock-pill--adequate';
  if (units >= 3) return 'hospitals-page__stock-pill--moderate';
  return 'hospitals-page__stock-pill--critical';
};

const HospitalsPage: React.FC = () => {
  const navigate = useNavigate();
  const [hospitals, setHospitals] = useState<Hospital[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCity, setSelectedCity] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const loadHospitals = async () => {
      setLoading(true);
      try {
        const data = await fetchHospitals({ city: selectedCity, search: searchQuery });
        setHospitals(data);
      } catch (err) {
        console.error('Error fetching hospitals:', err);
      } finally {
        setLoading(false);
      }
    };
    loadHospitals();
  }, [selectedCity, searchQuery]);

  return (
    <div className="hospitals-page animate-fade-in">
      <div className="container">
        {/* Header Hero */}
        <div className="hospitals-page__hero">
          <div className="hospitals-page__badge">
            <FontAwesomeIcon icon={faHospital} />
            Verified Medical Blood Banks
          </div>
          <h1 className="hospitals-page__title text-gradient">
            Find Hospitals & Blood Banks
          </h1>
          <p className="hospitals-page__subtitle">
            Connect directly with verified hospital blood banks across Pakistan, check real-time blood group availability, or submit an emergency patient request.
          </p>
        </div>

        {/* Filter Controls */}
        <div className="hospitals-page__controls">
          <div className="hospitals-page__search-bar">
            <FontAwesomeIcon icon={faMagnifyingGlass} />
            <input
              type="text"
              placeholder="Search by hospital name or area..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div className="hospitals-page__cities">
            {CITIES.map((city) => (
              <button
                key={city}
                type="button"
                className={`hospitals-page__city-btn ${selectedCity === city ? 'hospitals-page__city-btn--active' : ''}`}
                onClick={() => setSelectedCity(city)}
              >
                {city}
              </button>
            ))}
          </div>
        </div>

        {/* Content State */}
        {loading ? (
          <div style={{ padding: '60px 0', display: 'flex', justifyContent: 'center' }}>
            <AppSpinner label="Loading verified blood banks..." />
          </div>
        ) : hospitals.length === 0 ? (
          <EmptyState
            title="No Hospitals Found"
            message={`No registered hospital blood banks found matching "${searchQuery}" in ${selectedCity}.`}
            actionLabel="Reset Search"
            onAction={() => {
              setSelectedCity('All');
              setSearchQuery('');
            }}
          />
        ) : (
          <div className="hospitals-page__grid">
            {hospitals.map((hospital) => {
              const waText = `Assalam-o-Alaikum, I am inquiring about blood availability at ${hospital.hospital_name || hospital.username} on LifeDrop.`;
              const waUrl = getWhatsAppUrl(hospital.phone_number, waText);

              return (
                <div key={hospital.id} className="hospitals-page__card">
                  {/* Card Header */}
                  <div className="hospitals-page__card-header">
                    <div>
                      <h3 className="hospitals-page__hospital-name">
                        {hospital.hospital_name || hospital.username}
                      </h3>
                      <div className="hospitals-page__location" style={{ marginTop: '6px' }}>
                        <FontAwesomeIcon icon={faLocationDot} />
                        <span>{hospital.address || `${hospital.city}, Pakistan`}</span>
                      </div>
                    </div>
                    {hospital.is_verified && (
                      <span className="hospitals-page__badge-verified">
                        <FontAwesomeIcon icon={faCheckCircle} />
                        Verified
                      </span>
                    )}
                  </div>

                  {/* Helpline Box */}
                  <div className="hospitals-page__helpline-row">
                    <div className="hospitals-page__helpline-text">
                      <span>Emergency Helpline</span>
                      <strong>{hospital.helpline || hospital.phone_number || 'Available 24/7'}</strong>
                    </div>
                    {hospital.license_number && (
                      <span style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 600 }}>
                        Reg: {hospital.license_number}
                      </span>
                    )}
                  </div>

                  {/* Blood Bank Live Stock */}
                  <div className="hospitals-page__inventory-section">
                    <div className="hospitals-page__inventory-title">
                      <span>Live Blood Stock</span>
                      <span style={{ fontSize: '0.7rem', color: '#94a3b8' }}>8 Groups</span>
                    </div>

                    <div className="hospitals-page__stock-grid">
                      {hospital.inventory && hospital.inventory.length > 0 ? (
                        hospital.inventory.map((item) => (
                          <div
                            key={item.blood_group}
                            className={`hospitals-page__stock-pill ${getStockClass(item.units_available)}`}
                          >
                            <span className="group-label">{item.blood_group}</span>
                            <span className="units-val">{item.units_available} units</span>
                          </div>
                        ))
                      ) : (
                        <div style={{ gridColumn: 'span 4', textAlign: 'center', fontSize: '0.8rem', color: '#94a3b8', padding: '6px 0' }}>
                          Inventory updating with blood bank...
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Action CTAs */}
                  <div className="hospitals-page__actions">
                    <a
                      href={`tel:${hospital.helpline || hospital.phone_number}`}
                      className="hospitals-page__btn-call"
                      title="Call Hospital Helpline"
                    >
                      <FontAwesomeIcon icon={faPhone} />
                      Call
                    </a>

                    <a
                      href={waUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="hospitals-page__btn-whatsapp"
                      title="Chat with Blood Bank on WhatsApp"
                    >
                      <FontAwesomeIcon icon={faWhatsapp} />
                      WhatsApp
                    </a>

                    <button
                      type="button"
                      className="hospitals-page__btn-request"
                      onClick={() => navigate('/request', { 
                        state: { 
                          hospitalName: hospital.hospital_name || hospital.username,
                          city: hospital.city 
                        } 
                      })}
                    >
                      <FontAwesomeIcon icon={faHandHoldingDroplet} />
                      Request Blood at This Hospital
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default HospitalsPage;
