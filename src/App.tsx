import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import Navbar from './components/Navbar/Navbar';
import Footer from './components/Footer/Footer';
import AppRoutes from './routes/AppRoutes';
import usePageTitle from './hooks/usePageTitle';
import './styles/global.scss';

const PAGE_TITLES: Record<string, string> = {
  '/':              'LifeDrop — Blood Donation Network',
  '/search':        'Find a Donor',
  '/request':       'Request Blood',
  '/about':         'About Us',
  '/terms':         'Terms of Service',
  '/privacy':       'Privacy Policy',
  '/contact':       'Contact Us',
  '/faq':           'FAQ',
  '/eligibility':   'Donation Eligibility',
  '/compatibility': 'Blood Compatibility',
  '/campaigns':     'Blood Donation Camps & Drives',
};

const HIDE_NAV_PREFIXES = [
  '/auth',
  '/donate',
  '/dashboard',
  '/forgot-password',
  '/reset-password',
];

function App() {
  const location = useLocation();
  const pathname = location.pathname;

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  useEffect(() => {
    const handleInvalid = (e: any) => {
      e.preventDefault();
      const target = e.target;
      if (target && typeof target.reportValidity === 'function') {
        const msg = target.validationMessage || 'Please fill out this field correctly.';
        import('react-hot-toast').then(({ default: toast }) => {
          toast.error(msg, { id: 'validation-error' });
        });
      }
    };
    document.addEventListener('invalid', handleInvalid, true);
    return () => {
      document.removeEventListener('invalid', handleInvalid, true);
    };
  }, []);

  usePageTitle(PAGE_TITLES[pathname] ?? null);

  const hideNavFooter = HIDE_NAV_PREFIXES.some((prefix) => pathname.startsWith(prefix));

  const routes = <AppRoutes />;

  if (hideNavFooter) {
    return (
      <>
        {routes}
        <Toaster position="top-right" toastOptions={{ duration: 2000 }} />
      </>
    );
  }

  return (
    <>
      <a href="#main-content" className="skip-link">Skip to main content</a>
      <Navbar />
      <main id="main-content">
        {routes}
      </main>
      <Footer />
      <Toaster position="top-right" toastOptions={{ duration: 2000 }} />
    </>
  );
}

export default App;
