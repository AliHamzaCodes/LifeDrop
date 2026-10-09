import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import DashboardSidebar from '../../components/Dashboard/DashboardSidebar';
import DashboardOverview from '../../components/Dashboard/DashboardOverview';
import DonationHistory from '../../components/Dashboard/DonationHistory';
import ActiveRequests from '../../components/Dashboard/ActiveRequests';
import AdminPanel from '../../components/Dashboard/AdminPanel';
import HospitalPanel from '../../components/Dashboard/HospitalPanel';
import MyProfile from '../../components/Dashboard/MyProfile';
import HelpCenter from '../../components/Dashboard/HelpCenter';
import LogoutModal from '../../components/Dashboard/LogoutModal';
import usePageTitle from '../../hooks/usePageTitle';
import './DashboardPage.scss';
import { useAuth } from '../../context/AuthContext';

const TAB_TITLES = {
  'dashboard':        'Dashboard',
  'donation-history': 'Donation History',
  'active-requests':  'Active Requests',
  'admin-panel':      'Admin Panel',
  'hospital-panel':   'Hospital Panel',
  'settings':         'My Profile',
  'help-center':      'Help Center',
};

const DashboardPage = () => {
  const [params, setParams] = useSearchParams();
  const { currentUser } = useAuth();
  
  // Default to hospital-panel if user is a hospital
  const initialTab = TAB_TITLES[(params.get('tab') || '') as keyof typeof TAB_TITLES] 
    ? params.get('tab') || ''
    : (currentUser?.role === 'HOSPITAL' ? 'hospital-panel' : 'dashboard');
    
  const [activeTab, setActiveTab] = useState(initialTab);
  const [showLogout, setShowLogout] = useState(false);
  usePageTitle(TAB_TITLES[activeTab as keyof typeof TAB_TITLES] ?? 'Dashboard');

  const handleTabChange = (tab) => {
    if (tab === 'logout') {
      setShowLogout(true);
    } else {
      setActiveTab(tab);
      setParams(tab === 'dashboard' ? {} : { tab }, { replace: true });
    }
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <DashboardOverview onTabChange={handleTabChange} />;
      case 'hospital-panel':
        return <HospitalPanel />;
      case 'donation-history':
        return <DonationHistory />;
      case 'active-requests':
        return <ActiveRequests />;
      case 'admin-panel':
        return <AdminPanel />;
      case 'settings':
        return <MyProfile onLogout={() => setShowLogout(true)} />;
      case 'help-center':
        return <HelpCenter />;
      default:
        return <DashboardOverview onTabChange={handleTabChange} />;
    }
  };

  return (
    <div className="dashboard-page" id="dashboard-page">
      <div className="dashboard-layout">
        <DashboardSidebar activeTab={activeTab} onTabChange={handleTabChange} />
        <div className="dashboard-main" aria-live="polite">
          {renderContent()}
        </div>
      </div>

      {showLogout && (
        <LogoutModal onStay={() => setShowLogout(false)} />
      )}
    </div>
  );
};

export default DashboardPage;
