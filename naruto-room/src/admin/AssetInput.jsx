import React, { useState } from 'react';
import { apiRequest } from './api';
export default function AssetInput({ label, document = false, onUpload }) {
  const [status, setStatus] = useState('');
  const [busy, setBusy] = useState(false);
  async function select(e) {
    const file = e.target.files[0];
    if (!file) return;
    e.target.value = '';
    setBusy(true);
    setStatus('Uploading…');
    const data = new FormData();
    data.append('file', file);
    try {
      const res = await apiRequest('/upload/' + (document ? 'document' : 'image'), {
        method: 'POST',
        body: data,
      });
      onUpload(res.data.url);
      setStatus('Uploaded. Save to apply.');
    } catch (err) {
      setStatus(err.message);
    } finally {
      setBusy(false);
    }
  }
  return (
    <label className="cms-file">
      {label}
      <input
        type="file"
        disabled={busy}
        accept={document ? 'application/pdf' : 'image/jpeg,image/png,image/webp,image/gif,image/avif'}
        onChange={select}
      />
      <small role="status">{status}</small>
    </label>
  );
}
