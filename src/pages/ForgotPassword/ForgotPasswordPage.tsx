import { useState } from 'react';
import { Link } from 'react-router-dom';
import './ForgotPasswordPage.scss';
import usePageTitle from '../../hooks/usePageTitle';

const ForgotPasswordPage = () => {
  usePageTitle('Forgot Password');

  const [email, setEmail]           = useState('');
  const [error, setError]           = useState('');
  const [submitted, setSubmitted]   = useState(false);
  const [isLoading, setIsLoading]   = useState(false);
  const [resendCount, setResendCount] = useState(0);

  const validateEmail = (val) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateEmail(email)) {
      setError('Please enter a valid email address.');
      return;
    }
    setError('');
    setIsLoading(true);
    // Simulate sending reset email (replace with real API call when backend is ready)
    await new Promise((res) => setTimeout(res, 1200));
    setIsLoading(false);
    setSubmitted(true);
  };

  const handleResend = async () => {
    setResendCount((n) => n + 1);
    await new Promise((res) => setTimeout(res, 800));
  };

  if (submitted) {
    return (
      <div className="forgot-pw" id="forgot-password-page">
        <div className="forgot-pw__card" id="forgot-pw-success-card">
          <Link to="/auth" className="forgot-pw__back" id="back-to-login-from-success">
            <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z"/></svg>
            Back to Login
          </Link>

          <div className="forgot-pw__success">
            <span className="forgot-pw__success-icon" role="img" aria-label="Email sent">📬</span>
            <h2>Check your inbox!</h2>
            <p>
              No email is sent in this frontend demo. Continue with the mock reset
              for <strong>{email}</strong> to try the next screen.
            </p>
            <Link
              to="/reset-password?token=demo"
              className="forgot-pw__submit"
              id="continue-demo-reset"
              style={{ textDecoration: 'none' }}
            >
              Continue demo reset
            </Link>
            <Link
              to="/auth?mode=login"
              className="forgot-pw__submit"
              id="back-to-login-btn"
              style={{ textDecoration: 'none', marginTop: '0.75rem' }}
            >
              Back to Login
            </Link>
          </div>

          <div className="forgot-pw__resend">
            Didn't receive it?{' '}
            <button
              type="button"
              id="resend-email-btn"
              onClick={handleResend}
            >
              {resendCount > 0 ? 'Email resent ✓' : 'Resend email'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="forgot-pw" id="forgot-password-page">
      <div className="forgot-pw__card" id="forgot-pw-card">
        {/* Back link */}
        <Link to="/auth" className="forgot-pw__back" id="back-to-login-link">
          <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z"/></svg>
          Back to Login
        </Link>

        {/* Step indicator */}
        <div className="forgot-pw__steps" aria-label="Progress: Step 1 of 2">
          <div className="forgot-pw__step forgot-pw__step--active">
            <span className="forgot-pw__step-dot">1</span>
            <span>Verify Email</span>
          </div>
          <div className="forgot-pw__step-line" aria-hidden="true" />
          <div className="forgot-pw__step">
            <span className="forgot-pw__step-dot">2</span>
            <span>Reset Password</span>
          </div>
        </div>

        {/* Icon */}
        <div className="forgot-pw__icon-wrap" aria-hidden="true">
          <svg viewBox="0 0 24 24">
            <path d="M20 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"/>
          </svg>
        </div>

        <h1 className="forgot-pw__title">Forgot your password?</h1>
        <p className="forgot-pw__subtitle">
          Frontend demo only — we cannot send email. Enter any valid address to continue to a mock reset screen.
        </p>

        <form className="forgot-pw__form" onSubmit={handleSubmit}  id="forgot-pw-form">
          <div className={`forgot-pw__field ${error ? 'forgot-pw__field--error' : ''}`}>
            <label htmlFor="forgot-email" className="forgot-pw__label">Email Address</label>
            <div className="forgot-pw__input-wrap">
              <svg className="forgot-pw__input-icon" viewBox="0 0 24 24" aria-hidden="true">
                <path d="M20 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"/>
              </svg>
              <input
                id="forgot-email"
                type="email"
                className="forgot-pw__input"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => { setEmail(e.target.value); setError(''); }}
                autoComplete="email"
                autoFocus
              />
            </div>
            {error && <span className="forgot-pw__error-msg" role="alert">{error}</span>}
          </div>

          <button
            type="submit"
            className="forgot-pw__submit"
            id="forgot-pw-submit"
            disabled={isLoading}
          >
            {isLoading ? (
              'Sending...'
            ) : (
              <>
                Send Reset Link
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true">
                  <path d="M5 12h14M12 5l7 7-7 7"/>
                </svg>
              </>
            )}
          </button>
        </form>

        <div className="forgot-pw__resend" style={{ marginTop: '1.5rem' }}>
          Remember your password?{' '}
          <Link to="/auth" id="go-to-login-link" style={{ color: 'inherit', fontWeight: 600, fontSize: 'inherit' }}>
            Log in here
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;
