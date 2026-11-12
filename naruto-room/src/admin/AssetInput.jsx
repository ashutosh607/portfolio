import React, { useState } from 'react';
import { apiRequest } from './api';

const IMAGE_MIME = new Set([
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/webp',
  'image/gif',
  'image/avif',
]);

function isPdfFile(file) {
  return (
    file.type === 'application/pdf' ||
    file.type === 'application/x-pdf' ||
    file.name?.toLowerCase().endsWith('.pdf')
  );
}

function isImageFile(file) {
  return IMAGE_MIME.has(file.type) || /\.(jpe?g|png|webp|gif|avif)$/i.test(file.name || '');
}

function isValidUrlInput(raw) {
  return /^https?:\/\/[^\s$.?#].[^\s]*$/i.test(raw) || raw.startsWith('/');
}

/**
 * Unified media/document asset uploader supporting file picker, clipboard Ctrl+V (files & URLs),
 * drag-and-drop, and direct URL pasting without bubbling file-dialog cancel events.
 */
export default function AssetInput({ label, document = false, acceptBoth = false, onUpload }) {
  const [status, setStatus] = useState('');
  const [isError, setIsError] = useState(false);
  const [busy, setBusy] = useState(false);
  const [urlInput, setUrlInput] = useState('');

  async function uploadFile(file, sourceLabel = 'Uploaded') {
    if (!file || busy) return;
    const pdf = isPdfFile(file);
    const img = isImageFile(file);

    if (acceptBoth && !pdf && !img) {
      setIsError(true);
      setStatus('Select or paste a PDF or image file (JPG, PNG, WEBP, GIF, AVIF).');
      return;
    }
    if (!acceptBoth && document && !pdf) {
      setIsError(true);
      setStatus('Only PDF files are allowed here.');
      return;
    }
    if (!acceptBoth && !document && !img) {
      setIsError(true);
      setStatus('Only image files (JPG, PNG, WEBP, GIF, AVIF) are allowed here.');
      return;
    }

    setBusy(true);
    setIsError(false);
    setStatus('Uploading…');
    const data = new FormData();
    data.append('file', file, file.name || (pdf ? 'pasted-document.pdf' : 'pasted-screenshot.png'));

    try {
      const res = await apiRequest('/upload/' + (pdf ? 'document' : 'image'), {
        method: 'POST',
        body: data,
      });
      onUpload(res.data.url);
      setIsError(false);
      setStatus(`${sourceLabel}. Save to apply.`);
    } catch (err) {
      setIsError(true);
      setStatus(err.message || 'Upload failed.');
    } finally {
      setBusy(false);
    }
  }

  function applyUrl(rawValue, sourceLabel = 'URL added') {
    const clean = String(rawValue || '').trim();
    if (!clean) return false;
    if (!isValidUrlInput(clean)) {
      setIsError(true);
      setStatus('Enter or paste a valid https:// URL or /path.');
      return false;
    }
    onUpload(clean);
    setUrlInput('');
    setIsError(false);
    setStatus(`${sourceLabel}. Save to apply.`);
    return true;
  }

  function select(e) {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    uploadFile(file, 'Uploaded');
  }

  function handlePaste(e) {
    if (busy) return;
    const files = Array.from(e.clipboardData?.files || []);
    const itemFiles = Array.from(e.clipboardData?.items || [])
      .filter((item) => item.kind === 'file')
      .map((item) => item.getAsFile())
      .filter(Boolean);
    const pastedFile = files[0] || itemFiles[0];

    if (pastedFile) {
      e.preventDefault();
      e.stopPropagation();
      uploadFile(pastedFile, 'Pasted & uploaded');
      return;
    }

    const pastedText = e.clipboardData?.getData('text')?.trim();
    if (pastedText && isValidUrlInput(pastedText)) {
      e.preventDefault();
      e.stopPropagation();
      applyUrl(pastedText, 'URL pasted');
    }
  }

  function handleDrop(e) {
    e.preventDefault();
    e.stopPropagation();
    const file = e.dataTransfer?.files?.[0];
    if (file) {
      uploadFile(file, 'Dropped & uploaded');
      return;
    }
    const text = e.dataTransfer?.getData('text/uri-list') || e.dataTransfer?.getData('text/plain');
    if (text && isValidUrlInput(text.trim())) {
      applyUrl(text.trim(), 'URL dropped');
    }
  }

  const acceptAttr = acceptBoth
    ? 'application/pdf,.pdf,image/jpeg,image/png,image/webp,image/gif,image/avif'
    : document
      ? 'application/pdf,.pdf'
      : 'image/jpeg,image/png,image/webp,image/gif,image/avif';

  const pastePlaceholder = acceptBoth
    ? 'Paste URL or press Ctrl+V with a PDF/screenshot...'
    : document
      ? 'Paste PDF URL or press Ctrl+V with a PDF...'
      : 'Paste image URL or press Ctrl+V with a screenshot...';

  return (
    <div
      className="cms-asset-input"
      onDragOver={(e) => e.preventDefault()}
      onDrop={handleDrop}
      onPaste={handlePaste}
    >
      <label className="cms-file">
        <span>{label}</span>
        <input
          type="file"
          disabled={busy}
          accept={acceptAttr}
          onChange={select}
          onCancel={(e) => e.stopPropagation()}
        />
      </label>
      <div className="cms-asset-paste-row">
        <input
          type="text"
          disabled={busy}
          value={urlInput}
          placeholder={pastePlaceholder}
          aria-label={`${label} URL or clipboard paste`}
          onChange={(e) => setUrlInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              e.stopPropagation();
              applyUrl(urlInput);
            }
          }}
        />
        <button
          type="button"
          disabled={busy || !urlInput.trim()}
          onClick={() => applyUrl(urlInput)}
        >
          Add URL
        </button>
      </div>
      {status && (
        <small role={isError ? 'alert' : 'status'} className={isError ? 'cms-status-error' : ''}>
          {status}
        </small>
      )}
    </div>
  );
}
