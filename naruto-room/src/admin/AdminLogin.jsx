import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAdminAuth } from './AdminAuthContext';
import { Lock, Mail, ArrowRight, ShieldCheck, Eye, EyeOff } from 'lucide-react';

export default function AdminLogin() {
  const [email, setEmail] = useState('ashutoshkadam607@gmail.com');
  const [password, setPassword] = useState('ShinobiHokage2026!');
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
    <div className="admin-login-wrapper">
      <div className="admin-login-card">
        <div className="admin-login-header">
          <div className="admin-crest-badge">
            <span className="crest-kanji">忍</span>
          </div>
          <h1>Shinobi Admin</h1>
          <p>Hidden Leaf Portfolio Content Management System</p>
        </div>

        {errorMsg && (
          <div className="admin-alert error">
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="admin-form">
          <div className="form-group">
            <label htmlFor="email">Admin Email</label>
            <div className="input-with-icon">
              <Mail className="input-icon" size={18} />
              <input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@example.com"
                disabled={submitting}
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="password">Secret Password</label>
            <div className="input-with-icon">
              <Lock className="input-icon" size={18} />
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                disabled={submitting}
              />
              <button
                type="button"
                className="password-toggle-btn"
                onClick={() => setShowPassword(!showPassword)}
                tabIndex={-1}
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <button type="submit" className="admin-primary-btn w-full" disabled={submitting}>
            {submitting ? (
              <span>Authenticating...</span>
            ) : (
              <>
                <span>Enter Hokage Command</span>
                <ArrowRight size={18} />
              </>
            )}
          </button>
        </form>

        <div className="admin-login-footer">
          <a href="/" className="back-to-village-link">
            ← Return to Konoha Village
          </a>
          <span className="security-note">
            <ShieldCheck size={14} /> Secured with JWT & bcrypt
          </span>
        </div>
      </div>
    </div>
  );
}

