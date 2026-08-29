import { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faDroplet,
  faRightFromBracket,
  faShieldHalved,
  faHeart,
} from '@fortawesome/free-solid-svg-icons';
import './LogoutModal.scss';

const LogoutModal = ({ onStay }) => {
  const navigate = useNavigate();
  const { logout } = useAuth();

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = ''; };
  }, []);

  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape') onStay(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onStay]);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div
      className="logout-overlay"
      role="dialog"
      aria-modal="true"
      aria-labelledby="logout-title"
      aria-describedby="logout-desc"
      onClick={(e) => e.target === e.currentTarget && onStay()}
    >
      <header className="logout-topbar">
        <Link to="/" className="logout-topbar__brand" aria-label="LifeStream home">
          <FontAwesomeIcon icon={faDroplet} className="logout-topbar__logo-icon" />
          Life<strong>Stream</strong>
        </Link>
      </header>

      <div className="logout-card" role="document">
        <div className="logout-card__icon-wrap" aria-hidden="true">
          <FontAwesomeIcon icon={faHeart} className="logout-card__icon" />
          <span className="logout-card__icon-drop" aria-hidden="true">
            <FontAwesomeIcon icon={faDroplet} />
          </span>
        </div>

        <h1 className="logout-card__title" id="logout-title">
          Log out of LifeStream?
        </h1>

        <p className="logout-card__desc" id="logout-desc">
          You will need to sign in again to manage donations or blood requests.
        </p>

        <div className="logout-card__actions">
          <button
            className="logout-btn logout-btn--confirm"
            type="button"
            id="btn-confirm-logout"
            onClick={handleLogout}
            autoFocus
          >
            <FontAwesomeIcon icon={faRightFromBracket} />
            Log Out
          </button>

          <button
            className="logout-btn logout-btn--stay"
            type="button"
            id="btn-stay-logged-in"
            onClick={onStay}
          >
            <FontAwesomeIcon icon={faShieldHalved} />
            Stay Logged In
          </button>
        </div>
      </div>

      <footer className="logout-footer">
        <nav className="logout-footer__links" aria-label="Legal links">
          <Link to="/privacy" className="logout-footer__link">Privacy Policy</Link>
          <Link to="/terms" className="logout-footer__link">Terms of Service</Link>
          <Link to="/contact" className="logout-footer__link">Contact</Link>
        </nav>
        <p className="logout-footer__copy">
          © {new Date().getFullYear()} LifeStream. Every drop counts.
        </p>
      </footer>
    </div>
  );
};

export default LogoutModal;
