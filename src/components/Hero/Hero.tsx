import { Link } from 'react-router-dom';
import { useAppData } from '../../context/AppDataContext';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHeartPulse, faArrowRight, faBell, faUserShield, faDroplet, faBolt, faLocationDot } from '@fortawesome/free-solid-svg-icons';
import './Hero.scss';

const Hero = () => {
  const { getStats } = useAppData();
  const pending = getStats().activeRequests;

  const bloodGroups = ['O+', 'O-', 'A+', 'A-', 'B+', 'B-', 'AB+', 'AB-'];
  const topCities = ['Lahore', 'Karachi', 'Islamabad', 'Rawalpindi', 'Multan'];

  return (
    <section className="hero">
      <div className="hero-background">
        <div className="blob blob-1"></div>
        <div className="blob blob-2"></div>
        <div className="blob blob-3"></div>
      </div>

      {/* Live Emergency Ticker */}
      <div className="hero-ticker-wrap">
        <div className="container">
          <div className="hero-ticker">
            <div className="ticker-badge">
              <span className="ticker-pulse"></span>
              <FontAwesomeIcon icon={faBolt} />
              <span>LIVE ALERTS</span>
            </div>
            <div className="ticker-scroll">
              <span className="ticker-item">
                🚨 <strong>Lahore:</strong> O+ Needed Urgently at Shaukat Khanum
              </span>
              <span className="ticker-sep">•</span>
              <span className="ticker-item">
                🩸 <strong>Karachi:</strong> B- Needed at Aga Khan Hospital
              </span>
              <span className="ticker-sep">•</span>
              <span className="ticker-item">
                🚨 <strong>Rawalpindi:</strong> A+ Needed at Holy Family Hospital
              </span>
              <span className="ticker-sep">•</span>
              <span className="ticker-item">
                🟢 <strong>Verified:</strong> 100% Free Blood Donation Network in Pakistan
              </span>
            </div>
          </div>
        </div>
      </div>
      
      <div className="container hero-container">
        <div className="hero-content">
          <div className="hero-text">
            <div className="hero-badge">
              <span className="badge-pulse"></span>
              <FontAwesomeIcon icon={faBell} />
              {pending > 0
                ? `${pending} urgent blood request${pending === 1 ? '' : 's'} active today`
                : 'Verified Donors Active Across Pakistan'}
            </div>

            <h1 className="hero-title">
              Your blood can bring <br/>
              <span className="text-gradient">a smile to someone's face.</span>
            </h1>

            <p className="hero-subtitle">
              LifeDrop directly connects patients with voluntary verified blood donors and hospital blood banks in real time. Fast, secure, and 100% free.
            </p>

            <div className="hero-cta">
              <Link to="/auth" className="btn btn-primary">
                Become a Donor <FontAwesomeIcon icon={faArrowRight} />
              </Link>
              <Link to="/search" className="btn btn-outline">
                Find Donors
              </Link>
              <Link to="/hospitals" className="btn btn-subtle">
                <FontAwesomeIcon icon={faLocationDot} /> Hospital Blood Banks
              </Link>
            </div>

            {/* Quick Interactive Blood Finder */}
            <div className="hero-quick-search">
              <div className="quick-header">
                <FontAwesomeIcon icon={faDroplet} className="quick-icon" />
                <span>Instant Filter by Blood Group:</span>
              </div>
              <div className="quick-pills">
                {bloodGroups.map((bg) => (
                  <Link
                    key={bg}
                    to={`/search?group=${encodeURIComponent(bg)}`}
                    className="quick-pill"
                    title={`Find ${bg} donors`}
                  >
                    <span className="quick-drop">🩸</span>
                    <strong>{bg}</strong>
                  </Link>
                ))}
              </div>
              <div className="quick-cities">
                <span className="cities-label">Major Cities:</span>
                {topCities.map((city) => (
                  <Link
                    key={city}
                    to={`/search?query=${encodeURIComponent(city)}`}
                    className="city-tag"
                  >
                    {city}
                  </Link>
                ))}
              </div>
            </div>
          </div>

          <div className="hero-visuals">
            <div className="hero-image-wrap">
              <img 
                src="https://images.unsplash.com/photo-1579684385127-1ef15d508118?q=80&w=2000&auto=format&fit=crop" 
                alt="Medical professional caring for a blood donor" 
                loading="eager"
              />
              
              {/* Floating Stat Card 1 */}
              <div className="hero-floating-card">
                <div className="icon-box">
                  <FontAwesomeIcon icon={faUserShield} />
                </div>
                <div className="card-text">
                  <strong>500+</strong>
                  <span>Lives Saved in Pakistan</span>
                </div>
              </div>

              {/* Floating Stat Card 2 */}
              <div className="hero-floating-card-right">
                <div className="icon-box-small">
                  <FontAwesomeIcon icon={faHeartPulse} />
                </div>
                <div className="card-text-small">
                  <strong>100% Free</strong>
                  <span>Verified Medical Care</span>
                </div>
              </div>

              {/* Floating Donor Avatars Card 3 */}
              <div className="hero-floating-card-bottom">
                <div className="avatar-stack">
                  <span className="mini-avatar av-1">AK</span>
                  <span className="mini-avatar av-2">FN</span>
                  <span className="mini-avatar av-3">TY</span>
                  <span className="mini-avatar av-more">+10</span>
                </div>
                <div className="avatar-info">
                  <strong>Ready to Donate</strong>
                  <span className="online-badge">🟢 Instant WhatsApp & Call</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
