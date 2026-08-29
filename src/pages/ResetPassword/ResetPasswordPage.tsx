import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import '../ForgotPassword/ForgotPasswordPage.scss';
import usePageTitle from '../../hooks/usePageTitle';

/* ── Password strength checker ── */
const getStrength = (pw) => {
  if (!pw) return { score: 0, label: '', color: '' };
  let score = 0;
  if (pw.length >= 8) score++;
  if (/[A-Z]/.test(pw)) score++;
  if (/[0-9]/.test(pw)) score++;
  if (/[^A-Za-z0-9]/.test(pw)) score++;

  const levels = [
    { score: 0, label: '', color: '' },
    { score: 1, label: 'Weak', color: '#e74c3c' },
    { score: 2, label: 'Fair', color: '#f39c12' },
    { score: 3, label: 'Good', color: '#3498db' },
    { score: 4, label: 'Strong', color: '#27ae60' },
  ];
  return levels[score];
};

const ResetPasswordPage = () => {
  usePageTitle('Reset Password');
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const token = params.get('token');

  const [formData, setFormData] = useState({ password: '', confirm: '' });
  const [showPw, setShowPw]     = useState({ password: false, confirm: false });
  const [errors, setErrors]     = useState<any>({});
  const [isLoading, setIsLoading] = useState(false);
  const [done, setDone]         = useState(false);

  const strength = getStrength(formData.password);

  const validate = () => {
    const e: any = {};
    if (formData.password.length < 8)
      e.password = 'Password must be at least 8 characters.';
    if (formData.password !== formData.confirm)
      e.confirm = 'Passwords do not match.';
    return e;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: '' }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }

    setIsLoading(true);
    // Simulate API call (replace with real backend call)
    await new Promise((res) => setTimeout(res, 1200));
    setIsLoading(false);
    setDone(true);
  };

  if (!token) {
    return (
      <div className="forgot-pw" id="reset-password-page">
        <div className="forgot-pw__card">
          <h1 className="forgot-pw__title">Reset link required</h1>
          <p className="forgot-pw__subtitle">
            This demo does not send email. Start from Forgot Password, or open the mock link with a token.
          </p>
          <Link to="/forgot-password" className="forgot-pw__submit" style={{ textDecoration: 'none' }}>
            Go to Forgot Password
          </Link>
        </div>
      </div>
    );
  }

  if (done) {
    return (
      <div className="forgot-pw" id="reset-password-page">
        <div className="forgot-pw__card" id="reset-pw-success-card">
          <div className="forgot-pw__success">
            <span className="forgot-pw__success-icon" role="img" aria-label="Success">🎉</span>
            <h2>Password Updated!</h2>
            <p>Your password has been reset successfully. You can now log in with your new password.</p>
            <button
              type="button"
              className="forgot-pw__submit"
              id="go-to-login-after-reset"
              onClick={() => navigate('/auth')}
            >
              Go to Login
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="forgot-pw" id="reset-password-page">
      <div className="forgot-pw__card" id="reset-pw-card">
        {/* Back link */}
        <Link to="/forgot-password" className="forgot-pw__back" id="back-to-forgot-link">
          <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z"/></svg>
          Back
        </Link>

        {/* Step indicator */}
        <div className="forgot-pw__steps" aria-label="Progress: Step 2 of 2">
          <div className="forgot-pw__step forgot-pw__step--done">
            <span className="forgot-pw__step-dot">✓</span>
            <span>Email Verified</span>
          </div>
          <div className="forgot-pw__step-line" aria-hidden="true" />
          <div className="forgot-pw__step forgot-pw__step--active">
            <span className="forgot-pw__step-dot">2</span>
            <span>Reset Password</span>
          </div>
        </div>

        {/* Icon */}
        <div className="forgot-pw__icon-wrap" aria-hidden="true">
          <svg viewBox="0 0 24 24">
            <path d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zm-6 9c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm3.1-9H8.9V6c0-1.71 1.39-3.1 3.1-3.1 1.71 0 3.1 1.39 3.1 3.1v2z"/>
          </svg>
        </div>

        <h1 className="forgot-pw__title">Set a new password</h1>
        <p className="forgot-pw__subtitle">
          Demo reset (token present). Choose a password of at least 8 characters. This does not update a real account unless you are already signed in.
        </p>

        <form className="forgot-pw__form" onSubmit={handleSubmit}  id="reset-pw-form">

          {/* New password */}
          <div className={`forgot-pw__field ${errors.password ? 'forgot-pw__field--error' : ''}`}>
            <label htmlFor="reset-password" className="forgot-pw__label">New Password</label>
            <div className="forgot-pw__input-wrap">
              <svg className="forgot-pw__input-icon" viewBox="0 0 24 24" aria-hidden="true">
                <path d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zm-6 9c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm3.1-9H8.9V6c0-1.71 1.39-3.1 3.1-3.1 1.71 0 3.1 1.39 3.1 3.1v2z"/>
              </svg>
              <input
                id="reset-password"
                name="password"
                type={showPw.password ? 'text' : 'password'}
                className="forgot-pw__input"
                placeholder="Min. 8 characters"
                value={formData.password}
                onChange={handleChange}
                autoComplete="new-password"
                autoFocus
              />
              <button
                type="button"
                className="forgot-pw__toggle-pw"
                id="toggle-new-pw"
                aria-label={showPw.password ? 'Hide password' : 'Show password'}
                onClick={() => setShowPw((s) => ({ ...s, password: !s.password }))}
              >
                <svg viewBox="0 0 24 24" fill="currentColor">
                  {showPw.password
                    ? <path d="M12 7c2.76 0 5 2.24 5 5 0 .65-.13 1.26-.36 1.83l2.92 2.92c1.51-1.26 2.7-2.89 3.43-4.75-1.73-4.39-6-7.5-11-7.5-1.4 0-2.74.25-3.98.7l2.16 2.16C10.74 7.13 11.35 7 12 7zM2 4.27l2.28 2.28.46.46C3.08 8.3 1.78 10.02 1 12c1.73 4.39 6 7.5 11 7.5 1.55 0 3.03-.3 4.38-.84l.42.42L19.73 22 21 20.73 3.27 3 2 4.27zM7.53 9.8l1.55 1.55c-.05.21-.08.43-.08.65 0 1.66 1.34 3 3 3 .22 0 .44-.03.65-.08l1.55 1.55c-.67.33-1.41.53-2.2.53-2.76 0-5-2.24-5-5 0-.79.2-1.53.53-2.2zm4.31-.78l3.15 3.15.02-.16c0-1.66-1.34-3-3-3l-.17.01z"/>
                    : <path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z"/>
                  }
                </svg>
              </button>
            </div>

            {/* Strength bar */}
            {formData.password && (
              <div className="forgot-pw__strength">
                <div className="forgot-pw__strength-bar">
                  <div
                    className="forgot-pw__strength-fill"
                    style={{
                      width: `${(strength.score / 4) * 100}%`,
                      background: strength.color,
                    }}
                  />
                </div>
                <span className="forgot-pw__strength-label" style={{ color: strength.color }}>
                  {strength.label}
                </span>
              </div>
            )}

            {errors.password && <span className="forgot-pw__error-msg" role="alert">{errors.password}</span>}
          </div>

          {/* Confirm password */}
          <div className={`forgot-pw__field ${errors.confirm ? 'forgot-pw__field--error' : ''}`}>
            <label htmlFor="reset-confirm" className="forgot-pw__label">Confirm New Password</label>
            <div className="forgot-pw__input-wrap">
              <svg className="forgot-pw__input-icon" viewBox="0 0 24 24" aria-hidden="true">
                <path d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zm-6 9c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm3.1-9H8.9V6c0-1.71 1.39-3.1 3.1-3.1 1.71 0 3.1 1.39 3.1 3.1v2z"/>
              </svg>
              <input
                id="reset-confirm"
                name="confirm"
                type={showPw.confirm ? 'text' : 'password'}
                className="forgot-pw__input"
                placeholder="Repeat new password"
                value={formData.confirm}
                onChange={handleChange}
                autoComplete="new-password"
              />
              <button
                type="button"
                className="forgot-pw__toggle-pw"
                id="toggle-confirm-pw"
                aria-label={showPw.confirm ? 'Hide password' : 'Show password'}
                onClick={() => setShowPw((s) => ({ ...s, confirm: !s.confirm }))}
              >
                <svg viewBox="0 0 24 24" fill="currentColor">
                  {showPw.confirm
                    ? <path d="M12 7c2.76 0 5 2.24 5 5 0 .65-.13 1.26-.36 1.83l2.92 2.92c1.51-1.26 2.7-2.89 3.43-4.75-1.73-4.39-6-7.5-11-7.5-1.4 0-2.74.25-3.98.7l2.16 2.16C10.74 7.13 11.35 7 12 7zM2 4.27l2.28 2.28.46.46C3.08 8.3 1.78 10.02 1 12c1.73 4.39 6 7.5 11 7.5 1.55 0 3.03-.3 4.38-.84l.42.42L19.73 22 21 20.73 3.27 3 2 4.27zM7.53 9.8l1.55 1.55c-.05.21-.08.43-.08.65 0 1.66 1.34 3 3 3 .22 0 .44-.03.65-.08l1.55 1.55c-.67.33-1.41.53-2.2.53-2.76 0-5-2.24-5-5 0-.79.2-1.53.53-2.2zm4.31-.78l3.15 3.15.02-.16c0-1.66-1.34-3-3-3l-.17.01z"/>
                    : <path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z"/>
                  }
                </svg>
              </button>
            </div>
            {errors.confirm && <span className="forgot-pw__error-msg" role="alert">{errors.confirm}</span>}
          </div>

          <button
            type="submit"
            className="forgot-pw__submit"
            id="reset-pw-submit"
            disabled={isLoading}
          >
            {isLoading ? 'Updating...' : 'Update Password'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ResetPasswordPage;

