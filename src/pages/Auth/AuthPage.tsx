import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import usePageTitle from '../../hooks/usePageTitle';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faDroplet, faEye, faEyeSlash, faArrowRight } from '@fortawesome/free-solid-svg-icons';
import './AuthPage.scss';

import { BLOOD_GROUPS } from '../../constants/blood';

const getStrength = (pw: string) => {
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

const RegisterForm = ({ onSwitch, onSuccess }: any) => {
  const { register } = useAuth();
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    bloodGroup: '',
    city: '',
    phone: '',
  });
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const strength = getStrength(formData.password);

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (strength.score < 2) {
      setError('Please choose a stronger password.');
      setLoading(false);
      return;
    }

    try {
      const res = await register(formData);
      if (res.ok) {
        onSuccess();
      } else {
        setError(res.error || 'Registration failed');
      }
    } catch (err: any) {
      setError(err.message || 'Network error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form className="auth-form animate-fade-in" onSubmit={handleSubmit} >
      <h2 className="form-title text-gradient">Join LifeDrop</h2>
      <p className="form-subtitle">Create an account to donate or request blood.</p>

      {error && <div className="auth-alert error">{error}</div>}

      <div className="form-grid">
        <div className="form-group">
          <label>Full Name</label>
          <input
            type="text"
            required
            placeholder="John Doe"
            value={formData.fullName}
            onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
          />
        </div>
        <div className="form-group">
          <label>Email Address</label>
          <input
            type="email"
            required
            placeholder="john@example.com"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          />
        </div>
      </div>

      <div className="form-group pw-group">
        <label>Password</label>
        <div className="input-wrapper">
          <input
            type={showPw ? 'text' : 'password'}
            required
            placeholder="Min 8 characters"
            value={formData.password}
            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
          />
          <button type="button" className="pw-toggle" onClick={() => setShowPw(!showPw)}>
            <FontAwesomeIcon icon={showPw ? faEyeSlash : faEye} />
          </button>
        </div>
        {formData.password && (
          <div className="pw-strength">
            <div className="strength-bar-bg">
              <div 
                className="strength-bar-fill" 
                style={{ width: `${(strength.score / 4) * 100}%`, backgroundColor: strength.color }}
              ></div>
            </div>
            <span style={{ color: strength.color }}>{strength.label}</span>
          </div>
        )}
      </div>

      <div className="form-grid">
        <div className="form-group">
          <label>Blood Group</label>
          <select 
            required 
            value={formData.bloodGroup} 
            onChange={(e) => setFormData({ ...formData, bloodGroup: e.target.value })}
          >
            <option value="">Select</option>
            {BLOOD_GROUPS.map((g) => <option key={g} value={g}>{g}</option>)}
          </select>
        </div>
        <div className="form-group">
          <label>City</label>
          <input
            type="text"
            required
            placeholder="Lahore"
            value={formData.city}
            onChange={(e) => setFormData({ ...formData, city: e.target.value })}
          />
        </div>
      </div>
      
      <div className="form-group">
        <label>Phone Number (Optional)</label>
        <input
          type="tel"
          placeholder="0300-1234567"
          value={formData.phone}
          onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
        />
      </div>

      <button type="submit" className="btn btn-primary btn-block" disabled={loading}>
        {loading ? 'Creating account...' : 'Sign Up'}
      </button>

      <p className="auth-switch">
        Already have an account? <button type="button" onClick={onSwitch}>Log in</button>
      </p>
    </form>
  );
};

const LoginForm = ({ onSwitch, onSuccess }: any) => {
  const { login } = useAuth();
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await login(formData.email, formData.password);
      if (res.ok) {
        onSuccess();
      } else {
        setError(res.error || 'Invalid credentials');
      }
    } catch (err: any) {
      setError(err.message || 'Network error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form className="auth-form animate-fade-in" onSubmit={handleSubmit} >
      <h2 className="form-title text-gradient">Welcome Back</h2>
      <p className="form-subtitle">Log in to manage your donations or requests.</p>

      {error && <div className="auth-alert error">{error}</div>}

      <div className="form-group">
        <label>Email or Username</label>
        <input
          type="text"
          required
          placeholder="Email or Username"
          value={formData.email}
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
        />
      </div>

      <div className="form-group pw-group">
        <label>Password</label>
        <div className="input-wrapper">
          <input
            type={showPw ? 'text' : 'password'}
            required
            placeholder="Enter password"
            value={formData.password}
            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
          />
          <button type="button" className="pw-toggle" onClick={() => setShowPw(!showPw)}>
            <FontAwesomeIcon icon={showPw ? faEyeSlash : faEye} />
          </button>
        </div>
        <div className="pw-help">
          <Link to="/forgot-password">Forgot password?</Link>
        </div>
      </div>

      <button type="submit" className="btn btn-primary btn-block" disabled={loading}>
        {loading ? 'Logging in...' : 'Log In'}
      </button>

      <p className="auth-switch">
        Don't have an account? <button type="button" onClick={onSwitch}>Sign up</button>
      </p>
    </form>
  );
};

const AuthPage = () => {
  usePageTitle('Authentication | LifeDrop');
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const isRegister = searchParams.get('mode') === 'register';
  
  const [isLoginView, setIsLoginView] = useState(!isRegister);

  const handleSuccess = () => {
    const returnUrl = searchParams.get('returnUrl');
    navigate(returnUrl || '/dashboard', { replace: true });
  };

  return (
    <div className="auth-page">
      <div className="auth-background">
        <div className="blob blob-1"></div>
        <div className="blob blob-2"></div>
      </div>
      
      <div className="container">
        <Link to="/" className="auth-home-link">
          <FontAwesomeIcon icon={faDroplet} /> LifeDrop
        </Link>
        
        <div className="auth-container glass-panel">
          {isLoginView ? (
            <LoginForm 
              onSwitch={() => setIsLoginView(false)} 
              onSuccess={handleSuccess} 
            />
          ) : (
            <RegisterForm 
              onSwitch={() => setIsLoginView(true)} 
              onSuccess={handleSuccess} 
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default AuthPage;
