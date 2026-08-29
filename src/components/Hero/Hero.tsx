import { Link } from 'react-router-dom';
import { useAppData } from '../../context/AppDataContext';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHeartPulse, faArrowRight, faBell, faUserShield } from '@fortawesome/free-solid-svg-icons';
import './Hero.scss';

const Hero = () => {
  const { getStats } = useAppData();
  const pending = getStats().activeRequests;

  return (
    <section className="hero">
      <div className="hero-background">
        <div className="blob blob-1"></div>
        <div className="blob blob-2"></div>
        <div className="blob blob-3"></div>
      </div>
      
      <div className="container hero-container">
        <div className="hero-content">
          <div className="hero-text">
            <div className="hero-badge">
              <span className="badge-pulse"></span>
              <FontAwesomeIcon icon={faBell} />
              {pending > 0
                ? `${pending} pending blood request${pending === 1 ? '' : 's'} today`
                : 'Verified donors ready to help'}
            </div>
            <h1 className="hero-title">
              Your blood can bring <br/>
              <span className="text-gradient">a smile to someone's face.</span>
            </h1>
            <p className="hero-subtitle">
              LifeDrop connects voluntary blood donors with those in urgent need across Pakistan. Join our mission to ensure no one suffers from a lack of blood.
            </p>
            <div className="hero-cta">
              <Link to="/auth" className="btn btn-primary">
                Become a Donor <FontAwesomeIcon icon={faArrowRight} />
              </Link>
              <Link to="/search" className="btn btn-outline">
                Find Blood
              </Link>
            </div>
          </div>

          <div className="hero-visuals">
            <div className="hero-image-wrap">
              <img 
                src="https://images.unsplash.com/photo-1579684385127-1ef15d508118?q=80&w=2000&auto=format&fit=crop" 
                alt="Medical professional caring for a blood donor" 
                loading="eager"
              />
              <div className="hero-floating-card">
                <div className="icon-box">
                  <FontAwesomeIcon icon={faUserShield} />
                </div>
                <div className="card-text">
                  <strong>500+</strong>
                  <span>Lives Saved</span>
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
