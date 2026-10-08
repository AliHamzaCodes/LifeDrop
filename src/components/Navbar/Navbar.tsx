import { useState, useEffect } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faDroplet,
  faHouse,
  faMagnifyingGlass,
  faHandHoldingDroplet,
  faCircleInfo,
  faBars,
  faXmark,
  faCalendarDays,
  faHospital
} from '@fortawesome/free-solid-svg-icons';
import { useAuth } from '../../context/AuthContext';
import './Navbar.scss';

const NAV_LINKS = [
  { to: '/', label: 'Home', icon: faHouse, end: true },
  { to: '/search', label: 'Search Blood', icon: faMagnifyingGlass },
  { to: '/hospitals', label: 'Hospitals', icon: faHospital },
  { to: '/request', label: 'Requests', icon: faHandHoldingDroplet },
  { to: '/campaigns', label: 'Blood Camps', icon: faCalendarDays },
  { to: '/about', label: 'About Us', icon: faCircleInfo },
];

const Navbar = () => {
  const navigate = useNavigate();
  const { isLoggedIn, logout } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <header className={`navbar ${scrolled ? 'scrolled glass-panel' : ''}`}>
      <div className="container navbar-container">
        <Link to="/" className="navbar-logo" onClick={() => setMenuOpen(false)}>
          <div className="logo-icon">
            <FontAwesomeIcon icon={faDroplet} />
          </div>
          <span className="logo-text text-gradient">LifeDrop</span>
        </Link>

        <nav className={`navbar-links ${menuOpen ? 'open' : ''}`}>
          {NAV_LINKS.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.end}
              className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
              onClick={() => setMenuOpen(false)}
            >
              <span>{link.label}</span>
            </NavLink>
          ))}
          
          {/* Mobile Actions Only */}
          <div className="nav-actions-mobile">
            {isLoggedIn ? (
              <>
                <Link to="/dashboard" className="btn btn-outline" onClick={() => setMenuOpen(false)}>Dashboard</Link>
                <button className="btn btn-primary" onClick={() => { logout(); setMenuOpen(false); }}>Logout</button>
              </>
            ) : (
              <>
                <Link to="/auth" className="btn btn-outline" onClick={() => setMenuOpen(false)}>Log In</Link>
                <Link to="/donate" className="btn btn-primary" onClick={() => setMenuOpen(false)}>Donate Now</Link>
              </>
            )}
          </div>
        </nav>

        {/* Desktop Actions Only */}
        <div className="navbar-actions">
          {isLoggedIn ? (
            <>
              <Link to="/dashboard" className="btn btn-outline">Dashboard</Link>
              <button className="btn btn-primary" onClick={logout}>Logout</button>
            </>
          ) : (
            <>
              <Link to="/auth" className="btn btn-outline">Log In</Link>
              <Link to="/donate" className="btn btn-primary">Donate Now</Link>
            </>
          )}
        </div>

        <button 
          className="mobile-menu-btn"
          aria-label="Toggle menu"
          onClick={() => setMenuOpen(!menuOpen)}
        >
          <FontAwesomeIcon icon={menuOpen ? faXmark : faBars} />
        </button>
      </div>
    </header>
  );
};

export default Navbar;
