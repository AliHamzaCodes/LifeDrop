import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faClock,
  faDroplet,
  faGear,
  faShieldHalved,
  faTableColumns,
  faCircleQuestion,
  faRightFromBracket,
  faPlus,
  faBars,
  faXmark,
  faHospital,
} from '@fortawesome/free-solid-svg-icons';
import './DashboardSidebar.scss';
import { useAuth } from '../../context/AuthContext';
import { getCooldownDaysLeft } from '../../utils/status';
import { getMediaUrl } from '../../utils/api';

const allTabs = [
  { id: 'dashboard',        label: 'Dashboard',        icon: faTableColumns, adminOnly: false },
  { id: 'donation-history', label: 'Donation History', icon: faClock,        adminOnly: false },
  { id: 'active-requests',  label: 'Active Requests',  icon: faDroplet,      adminOnly: false },
  { id: 'admin-panel',      label: 'Admin Panel',      icon: faShieldHalved, adminOnly: true  },
  { id: 'hospital-panel',   label: 'Hospital Panel',   icon: faHospital,     adminOnly: false },
  { id: 'settings',         label: 'Settings',         icon: faGear,         adminOnly: false },
];

const SidebarContent = ({ activeTab, onSelect, isMobile = false, ctaRef, currentUser, onNewRequest }) => {
  const navigate = useNavigate();
  const initials = currentUser?.fullName
    ? currentUser.fullName.split(' ').map((w) => w[0]).join('').slice(0, 2).toUpperCase()
    : '?';
  const displayName = currentUser?.fullName ?? 'Guest';
  const role        = currentUser?.role ?? 'donor';
  const isAdmin     = role === 'admin';
  const isHospital  = role === 'HOSPITAL';
  const tabs        = allTabs.filter((t) => {
    if (t.id === 'hospital-panel' && !isHospital && !isAdmin) return false;
    return !t.adminOnly || isAdmin;
  });

  const cooldownDays = currentUser?.profile?.last_donation_date ? getCooldownDaysLeft(currentUser.profile.last_donation_date) : 0;

  return (
    <>
      <div className="dashboard-sidebar__profile">
        {currentUser?.avatar ? (
          <img src={getMediaUrl(currentUser.avatar)} alt="Avatar" className="dashboard-sidebar__avatar-fallback" style={{ objectFit: 'cover', padding: 0 }} />
        ) : (
          <div className="dashboard-sidebar__avatar-fallback" aria-hidden="true">{initials}</div>
        )}
        <div>
          <p className="dashboard-sidebar__welcome">Welcome back,</p>
          <p className="dashboard-sidebar__name">
            {displayName}
            {currentUser?.is_verified && (
              <FontAwesomeIcon icon={faCircleCheck} style={{ color: '#3b82f6', marginLeft: '6px', fontSize: '0.85rem' }} title="Verified User" />
            )}
          </p>
          {cooldownDays > 0 && (
            <span style={{ display: 'inline-block', marginTop: '4px', padding: '2px 8px', background: '#fef3c7', color: '#d97706', fontSize: '0.7rem', fontWeight: 600, borderRadius: '12px', border: '1px solid #fde68a' }}>
              Resting ({cooldownDays} days left)
            </span>
          )}
        </div>
      </div>

      <button
        className="dashboard-sidebar__cta"
        id={isMobile ? 'mobile-new-request' : 'dashboard-new-request'}
        type="button"
        onClick={onNewRequest}
        ref={isMobile ? ctaRef : null}
      >
        <FontAwesomeIcon icon={faPlus} />
        New Request
      </button>

      <nav className="dashboard-sidebar__nav" aria-label="Main navigation">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            type="button"
            className={`dashboard-sidebar__tab${activeTab === tab.id ? ' dashboard-sidebar__tab--active' : ''}`}
            onClick={() => onSelect(tab.id)}
            aria-current={activeTab === tab.id ? 'page' : undefined}
          >
            <span className="dashboard-sidebar__tab-icon" aria-hidden="true">
              <FontAwesomeIcon icon={tab.icon} />
            </span>
            <span>{tab.label}</span>
          </button>
        ))}
      </nav>

      <div className="dashboard-sidebar__footer">
        <button
          type="button"
          className="dashboard-sidebar__footer-link"
          onClick={() => navigate('/')}
          id={isMobile ? 'mobile-sidebar-home' : 'sidebar-home'}
        >
          <span className="dashboard-sidebar__footer-icon" aria-hidden="true">
            <svg width="1em" height="1em" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ display: 'inline-block', verticalAlign: 'middle', marginRight: '4px' }}>
              <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
              <polyline points="9 22 9 12 15 12 15 22"></polyline>
            </svg>
          </span>
          Back to Home
        </button>
        <button
          type="button"
          className="dashboard-sidebar__footer-link"
          onClick={() => onSelect('help-center')}
          id={isMobile ? 'mobile-sidebar-help' : 'sidebar-help'}
        >
          <span className="dashboard-sidebar__footer-icon" aria-hidden="true">
            <FontAwesomeIcon icon={faCircleQuestion} />
          </span>
          Help Center
        </button>
        <button
          type="button"
          className="dashboard-sidebar__footer-link dashboard-sidebar__footer-link--muted"
          onClick={() => onSelect('logout')}
          id={isMobile ? 'mobile-sidebar-logout' : 'sidebar-logout'}
        >
          <span className="dashboard-sidebar__footer-icon" aria-hidden="true">
            <FontAwesomeIcon icon={faRightFromBracket} />
          </span>
          Logout
        </button>
      </div>
    </>
  );
};

const DashboardSidebar = ({ activeTab, onTabChange }) => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const drawerRef = useRef(null);
  const firstFocusableRef = useRef(null);

  const handleSelect = (id) => {
    onTabChange(id);
    setDrawerOpen(false);
  };

  const handleNewRequest = () => {
    setDrawerOpen(false);
    navigate('/request');
  };

  useEffect(() => {
    if (drawerOpen) {
      document.body.style.overflow = 'hidden';
      const id = setTimeout(() => firstFocusableRef.current?.focus(), 50);
      return () => {
        clearTimeout(id);
        document.body.style.overflow = '';
      };
    }
    document.body.style.overflow = '';
  }, [drawerOpen]);

  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') setDrawerOpen(false); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  return (
    <>
      <aside className="dashboard-sidebar dashboard-sidebar--desktop" aria-label="Dashboard navigation">
        <SidebarContent activeTab={activeTab} onSelect={handleSelect} currentUser={currentUser} onNewRequest={handleNewRequest} />
      </aside>

      <header className="db-topbar" role="banner">
        <div className="db-topbar__brand">
          <span className="db-topbar__logo-icon" aria-hidden="true">
            <FontAwesomeIcon icon={faDroplet} />
          </span>
          <span className="db-topbar__brand-name">
            Life<strong>Stream</strong>
          </span>
        </div>

        <span className="db-topbar__page-label" aria-live="polite">
          {allTabs.find((t) => t.id === activeTab)?.label ?? 'Dashboard'}
        </span>

        <button
          className="db-topbar__menu-btn"
          type="button"
          aria-label="Open navigation menu"
          aria-expanded={drawerOpen}
          aria-controls="db-drawer"
          id="db-menu-toggle"
          onClick={() => setDrawerOpen(true)}
        >
          <FontAwesomeIcon icon={faBars} />
        </button>
      </header>

      <div
        className={`db-backdrop${drawerOpen ? ' db-backdrop--visible' : ''}`}
        aria-hidden="true"
        onClick={() => setDrawerOpen(false)}
      />

      <aside
        id="db-drawer"
        className={`db-drawer${drawerOpen ? ' db-drawer--open' : ''}`}
        aria-label="Navigation drawer"
        aria-hidden={!drawerOpen}
        ref={drawerRef}
        role="dialog"
        aria-modal="true"
      >
        <div className="db-drawer__header">
          <div className="db-drawer__brand">
            <span className="db-drawer__logo-icon" aria-hidden="true">
              <FontAwesomeIcon icon={faDroplet} />
            </span>
            <span className="db-drawer__brand-name">
              Life<strong>Stream</strong>
            </span>
          </div>
          <button
            className="db-drawer__close-btn"
            type="button"
            aria-label="Close navigation menu"
            id="db-drawer-close"
            onClick={() => setDrawerOpen(false)}
          >
            <FontAwesomeIcon icon={faXmark} />
          </button>
        </div>

        <div className="db-drawer__body">
          <SidebarContent
            activeTab={activeTab}
            onSelect={handleSelect}
            isMobile
            ctaRef={firstFocusableRef}
            currentUser={currentUser}
            onNewRequest={handleNewRequest}
          />
        </div>
      </aside>
    </>
  );
};

export default DashboardSidebar;
