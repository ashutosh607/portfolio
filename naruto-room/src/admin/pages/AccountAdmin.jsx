import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiRequest } from '../api';
export default function AccountAdmin() {
  const [message, setMessage] = useState(''),
    [busy, setBusy] = useState(false);
  const navigate = useNavigate();
  async function submit(e) {
    e.preventDefault();
    const form = e.currentTarget;
    setBusy(true);
    setMessage('');
    try {
      await apiRequest('/auth/change-password', {
        method: 'PUT',
        body: JSON.stringify(Object.fromEntries(new FormData(form))),
      });
      window.dispatchEvent(new Event('cms-session-ended'));
      navigate('/admin/login', { replace: true });
    } catch (err) {
      setMessage(err.message);
    } finally {
      setBusy(false);
    }
  }
  return (
    <div className="admin-page">
      <h1 className="page-title">Account settings</h1>
      <form className="admin-card admin-form" onSubmit={submit}>
        <h2>Change password</h2>
        <p>Your sessions end after a password change.</p>
        <label>
          Current password
          <input type="password" autoComplete="current-password" name="currentPassword" required />
        </label>
        <label>
          New password
          <input
            type="password"
            autoComplete="new-password"
            minLength={12}
            maxLength={120}
            name="newPassword"
            required
          />
        </label>
        <button className="admin-primary-btn" disabled={busy}>
          Change password
        </button>
        <p role="alert">{message}</p>
      </form>
    </div>
  );
}
