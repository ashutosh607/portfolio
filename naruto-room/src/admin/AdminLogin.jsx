import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAdminAuth } from './AdminAuthContext';
import { Eye, EyeOff } from 'lucide-react';

function KonohaLeafIcon({ className = '', style = {} }) {
  return (
    <svg
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      style={style}
    >
      <path
        d="M 38 72 L 28 82 L 32 68 C 22 56 24 38 38 26 C 56 12 78 24 82 44 C 85 64 70 82 50 82 C 34 82 24 70 25 56 C 26 42 37 34 49 35 C 60 36 67 44 66 53 C 65 61 58 66 51 66 C 44 65 41 60 43 55 C 44 50 49 48 52 50"
        stroke="currentColor"
        strokeWidth="6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export default function AdminLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const { login } = useAdminAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSubmitting(true);

    try {
      await login(email, password);
      navigate('/admin');
    } catch (err) {
      setErrorMsg(err.message || 'Invalid shinobi admin credentials.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="same-admin-login-screen">
      {/* Ambient background glows */}
      <div className="login-ambient-glow glow-top-left" />
      <div className="login-ambient-glow glow-bottom-right" />

      {/* Large faint Konoha leaf watermark on the right */}
      <div className="login-watermark-wrapper" aria-hidden="true">
        <KonohaLeafIcon className="login-watermark-svg" />
      </div>

      {/* Silhouette of Konoha rooftops on bottom-left */}
      <div className="login-village-silhouette" aria-hidden="true">
        <svg viewBox="0 0 500 240" fill="currentColor">
          {/* Pagoda watchtower and roofs */}
          <path d="M 60 80 L 100 80 L 105 60 L 55 60 Z" />
          <path d="M 70 60 L 90 60 L 80 40 Z" />
          <rect x="62" y="80" width="36" height="50" />
          <path d="M 40 130 L 120 130 L 130 110 L 30 110 Z" />
          <rect x="45" y="130" width="70" height="90" />
          <path d="M 110 160 L 220 160 L 230 140 L 100 140 Z" />
          <rect x="115" y="160" width="100" height="80" />
          <path d="M 210 180 L 320 180 L 330 160 L 200 160 Z" />
          <rect x="215" y="180" width="105" height="60" />
          <rect x="0" y="210" width="500" height="30" />
          {/* Glowing windows */}
          <rect x="68" y="90" width="6" height="8" fill="#f59e0b" opacity="0.85" />
          <rect x="86" y="90" width="6" height="8" fill="#f59e0b" opacity="0.85" />
          <rect x="52" y="145" width="8" height="10" fill="#f59e0b" opacity="0.7" />
          <rect x="74" y="145" width="8" height="10" fill="#f59e0b" opacity="0.7" />
          <rect x="96" y="145" width="8" height="10" fill="#f59e0b" opacity="0.7" />
          <rect x="140" y="175" width="7" height="9" fill="#f59e0b" opacity="0.6" />
          <rect x="170" y="175" width="7" height="9" fill="#f59e0b" opacity="0.6" />
          <rect x="245" y="195" width="7" height="8" fill="#f59e0b" opacity="0.5" />
        </svg>
      </div>

      {/* Main Login Card */}
      <div className="same-login-card">
        {/* Top Konoha Leaf Icon */}
        <div className="same-card-emblem">
          <KonohaLeafIcon className="same-leaf-icon" />
        </div>

        {/* Shinobi CMS divider */}
        <div className="same-cms-divider">
          <span className="same-divider-line" />
          <span className="same-divider-text">Shinobi CMS</span>
          <span className="same-divider-line" />
        </div>

        {/* Heading & Subtitle */}
        <h1 className="same-login-title">Welcome back</h1>
        <p className="same-login-subtitle">Sign in to manage your portfolio.</p>

        {errorMsg && (
          <div className="same-login-alert">
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="same-login-form">
          <div className="same-form-group">
            <label htmlFor="same-email" className="same-form-label">
              Email address
            </label>
            <input
              id="same-email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your admin email"
              disabled={submitting}
              className="same-form-input"
              autoComplete="email"
            />
          </div>

          <div className="same-form-group">
            <label htmlFor="same-password" className="same-form-label">
              Password
            </label>
            <div className="same-input-container">
              <input
                id="same-password"
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                disabled={submitting}
                className="same-form-input same-password-input"
                autoComplete="current-password"
              />
              <button
                type="button"
                className="same-eye-toggle-btn"
                onClick={() => setShowPassword(!showPassword)}
                tabIndex={-1}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            className="same-signin-btn"
            disabled={submitting}
          >
            {submitting ? 'Signing in...' : 'Sign in'}
          </button>
        </form>

        {/* Back Link */}
        <div className="same-login-footer">
          <a href="/" className="same-back-link">
            ← Back to portfolio
          </a>
        </div>
      </div>
    </div>
  );
}
