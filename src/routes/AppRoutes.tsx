import { lazy, Suspense } from 'react';
import { Route, Routes } from 'react-router-dom';
import AppSpinner from '../components/AppSpinner/AppSpinner';

// ── Eagerly-loaded (tiny; part of the initial shell) ──────────────────────────
import PrivateRoute from '../components/PrivateRoute/PrivateRoute';

// ── Landing-page sections (loaded with the shell) ─────────────────────────────
import Hero       from '../components/Hero/Hero';
import Stats      from '../components/Stats/Stats';
import HowItWorks from '../components/HowItWorks/HowItWorks';
import HomeExtras from '../components/HomeExtras/HomeExtras';

// ── Lazy-loaded page bundles (each becomes a separate JS chunk) ───────────────
const AuthPage               = lazy(() => import('../pages/Auth/AuthPage'));
const SearchBloodPage        = lazy(() => import('../pages/SearchBlood/SearchBloodPage'));
const RequestPage            = lazy(() => import('../pages/Request/RequestPage'));
const DonorRegistrationPage  = lazy(() => import('../pages/DonorRegistration/DonorRegistrationPage'));
const AboutPage              = lazy(() => import('../pages/About/AboutPage'));
const DashboardPage          = lazy(() => import('../pages/Dashboard/DashboardPage'));
const ForgotPasswordPage     = lazy(() => import('../pages/ForgotPassword/ForgotPasswordPage'));
const ResetPasswordPage      = lazy(() => import('../pages/ResetPassword/ResetPasswordPage'));
const NotFoundPage           = lazy(() => import('../pages/NotFound/NotFoundPage'));
const TermsPage              = lazy(() => import('../pages/Legal/TermsPage'));
const PrivacyPage            = lazy(() => import('../pages/Legal/PrivacyPage'));
const DonorProfilePage       = lazy(() => import('../pages/DonorProfile/DonorProfilePage'));
const ContactPage            = lazy(() => import('../pages/Contact/ContactPage'));
const FaqPage                = lazy(() => import('../pages/Faq/FaqPage'));
const EligibilityPage        = lazy(() => import('../pages/Eligibility/EligibilityPage'));
const CompatibilityPage      = lazy(() => import('../pages/Compatibility/CompatibilityPage'));

// ── Loading fallback ───────────────────────────────────────────────────────────
const PageLoader = () => (
  <div style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
    <AppSpinner label="Loading page…" />
  </div>
);

const LandingPage = () => (
  <>
    <Hero />
    <Stats />
    <HowItWorks />
    <HomeExtras />
  </>
);

const AppRoutes = () => {
  return (
    <Suspense fallback={<PageLoader />}>
      <Routes>
        {/* ── Public ────────────────────────────────── */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/auth" element={<AuthPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/reset-password"  element={<ResetPasswordPage />}  />
        <Route path="/search"  element={<SearchBloodPage />} />
        <Route path="/request" element={<RequestPage />} />
        <Route path="/about"   element={<AboutPage />} />
        <Route path="/donor/:slug" element={<DonorProfilePage />} />
        <Route path="/terms"   element={<TermsPage />} />
        <Route path="/privacy" element={<PrivacyPage />} />
        <Route path="/contact" element={<ContactPage />} />
        <Route path="/faq" element={<FaqPage />} />
        <Route path="/eligibility" element={<EligibilityPage />} />
        <Route path="/compatibility" element={<CompatibilityPage />} />

        {/* ── Protected ─────────────────────────────── */}
        <Route
          path="/donate"
          element={
            <PrivateRoute>
              <DonorRegistrationPage />
            </PrivateRoute>
          }
        />
        <Route
          path="/dashboard"
          element={
            <PrivateRoute>
              <DashboardPage />
            </PrivateRoute>
          }
        />

        {/* ── 404 Catch-all ─────────────────────────── */}
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </Suspense>
  );
};

export default AppRoutes;
