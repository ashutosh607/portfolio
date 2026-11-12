import React, { useEffect, useRef, useState } from 'react';
import {
  extractClipboardFile,
  isImageAssetFile,
  isPdfAssetFile,
  uploadAssetToServer,
} from './assetUploadHelpers';

function isValidUrlInput(raw) {
  return /^https?:\/\/[^\s$.?#].[^\s]*$/i.test(raw) || raw.startsWith('/');
}

/**
 * Unified media/document asset uploader supporting file picker, clipboard Ctrl+V (files & URLs),
 * one-click clipboard read, drag-and-drop, and direct URL pasting.
 */
export default function AssetInput({ label, document = false, acceptBoth = false, onUpload }) {
  const [status, setStatus] = useState('');
  const [isError, setIsError] = useState(false);
  const [busy, setBusy] = useState(false);
  const [urlInput, setUrlInput] = useState('');
  const fileInputRef = useRef(null);
  const pasteInputRef = useRef(null);

  useEffect(() => {
    const input = fileInputRef.current;
    if (!input) return undefined;
    const stopCancel = (e) => e.stopPropagation();
    input.addEventListener('cancel', stopCancel);
    return () => input.removeEventListener('cancel', stopCancel);
  }, []);

  async function uploadFile(file, sourceLabel = 'Uploaded') {
    if (!file || busy) return;
    const pdf = isPdfAssetFile(file);
    const img = isImageAssetFile(file);

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
    try {
      const url = await uploadAssetToServer(file);
      onUpload(url);
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
    const pastedFile = extractClipboardFile(e.clipboardData);

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

  async function handleClipboardButton() {
    if (busy) return;
    try {
      if (navigator.clipboard?.read) {
        const items = await navigator.clipboard.read();
        for (const item of items) {
          const mediaType = item.types.find((t) => IMAGE_MIME.has(t) || t === 'application/pdf');
          if (mediaType) {
            const blob = await item.getType(mediaType);
            const ext = mediaType === 'application/pdf' ? 'pdf' : mediaType.split('/')[1] || 'png';
            const file = new File([blob], `clipboard-${Date.now()}.${ext}`, { type: mediaType });
            await uploadFile(file, 'Clipboard pasted & uploaded');
            return;
          }
        }
      }
      if (navigator.clipboard?.readText) {
        const text = (await navigator.clipboard.readText())?.trim();
        if (text && isValidUrlInput(text)) {
          applyUrl(text, 'Clipboard URL pasted');
          return;
        }
      }
      setIsError(false);
      setStatus('Click the box below and press Ctrl+V to paste a snapshot or URL.');
      pasteInputRef.current?.focus();
    } catch {
      setIsError(false);
      setStatus('Click the box below and press Ctrl+V to paste a snapshot or URL.');
      pasteInputRef.current?.focus();
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
          ref={fileInputRef}
          type="file"
          disabled={busy}
          accept={acceptAttr}
          onChange={select}
          onCancel={(e) => e.stopPropagation()}
        />
      </label>
      <div className="cms-asset-paste-row">
        <input
          ref={pasteInputRef}
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
          disabled={busy}
          onClick={handleClipboardButton}
          title="Paste screenshot, PDF, or URL from clipboard"
        >
          Paste Clipboard
        </button>
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
