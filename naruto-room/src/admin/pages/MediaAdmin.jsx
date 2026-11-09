import React, { useState } from 'react';
import { apiRequest } from '../api';
import { UploadCloud, Check, Copy, AlertCircle, FileText, Image as ImageIcon } from 'lucide-react';

export default function MediaAdmin() {
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploadType, setUploadType] = useState('image'); // 'image' or 'document'
  const [uploading, setUploading] = useState(false);
  const [uploadedAsset, setUploadedAsset] = useState(null);
  const [message, setMessage] = useState({ text: '', type: '' });
  const [copied, setCopied] = useState(false);

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!selectedFile) {
      setMessage({ text: 'Please select a file to upload.', type: 'error' });
      return;
    }

    setUploading(true);
    setMessage({ text: '', type: '' });
    setUploadedAsset(null);

    try {
      const formData = new FormData();
      formData.append('file', selectedFile);

      const endpoint = uploadType === 'image' ? '/upload/image' : '/upload/document';
      const res = await apiRequest(endpoint, {
        method: 'POST',
        body: formData,
      });

      if (res.success && res.data) {
        setUploadedAsset(res.data);
        setMessage({ text: res.message || 'File uploaded to Cloudinary!', type: 'success' });
      }
    } catch (err) {
      setMessage({ text: err.message, type: 'error' });
    } finally {
      setUploading(false);
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="admin-page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Cloudinary Media & Assets</h1>
          <p className="page-subtitle">Upload project screenshots and resume PDFs directly to Cloudinary with automatic WebP optimization.</p>
        </div>
      </div>

      {message.text && (
        <div className={`admin-alert ${message.type}`}>
          {message.type === 'error' ? <AlertCircle size={16} /> : <Check size={16} />}
          <span>{message.text}</span>
        </div>
      )}

      <div className="media-admin-grid">
        {/* Upload Form Card */}
        <div className="admin-card">
          <div className="card-header">
            <h3>Upload New File</h3>
          </div>

          <form onSubmit={handleUpload}>
            <div className="form-group">
              <label>Asset Category</label>
              <div className="radio-group">
                <label className="radio-option">
                  <input
                    type="radio"
                    name="uploadType"
                    value="image"
                    checked={uploadType === 'image'}
                    onChange={() => setUploadType('image')}
                  />
                  <ImageIcon size={16} />
                  <span>Image (WebP Auto-Convert)</span>
                </label>

                <label className="radio-option">
                  <input
                    type="radio"
                    name="uploadType"
                    value="document"
                    checked={uploadType === 'document'}
                    onChange={() => setUploadType('document')}
                  />
                  <FileText size={16} />
                  <span>Resume PDF</span>
                </label>
              </div>
            </div>

            <div className="upload-dropzone">
              <input
                type="file"
                id="fileUploadInput"
                accept={uploadType === 'image' ? 'image/*' : '.pdf'}
                onChange={(e) => setSelectedFile(e.target.files[0])}
              />
              <label htmlFor="fileUploadInput" className="dropzone-label">
                <UploadCloud size={36} className="upload-icon" />
                <span>
                  {selectedFile ? selectedFile.name : 'Click or drag file here to upload'}
                </span>
                <span className="dropzone-hint">
                  {uploadType === 'image'
                    ? 'JPG, PNG, WEBP, AVIF (Max 10MB)'
                    : 'PDF documents only (Max 15MB)'}
                </span>
              </label>
            </div>

            <button
              type="submit"
              disabled={uploading || !selectedFile}
              className="admin-primary-btn w-full mt-4"
            >
              {uploading ? 'Streaming to Cloudinary...' : 'Upload to Cloudinary'}
            </button>
          </form>
        </div>

        {/* Upload Result Card */}
        <div className="admin-card">
          <div className="card-header">
            <h3>Uploaded Asset Details</h3>
          </div>

          {uploadedAsset ? (
            <div className="uploaded-asset-details">
              {uploadedAsset.format === 'webp' || uploadType === 'image' ? (
                <div className="preview-image-box">
                  <img src={uploadedAsset.url} alt="Uploaded Asset" />
                </div>
              ) : (
                <div className="preview-doc-box">
                  <FileText size={48} />
                  <span>{uploadedAsset.originalName || 'Resume.pdf'}</span>
                </div>
              )}

              <div className="asset-meta-rows">
                <div className="meta-row">
                  <span className="meta-label">Public ID:</span>
                  <span className="meta-val">{uploadedAsset.publicId}</span>
                </div>
                {uploadedAsset.width && (
                  <div className="meta-row">
                    <span className="meta-label">Dimensions:</span>
                    <span className="meta-val">{uploadedAsset.width} × {uploadedAsset.height} px</span>
                  </div>
                )}
                <div className="meta-row">
                  <span className="meta-label">Size:</span>
                  <span className="meta-val">{(uploadedAsset.bytes / 1024).toFixed(1)} KB</span>
                </div>
              </div>

              <div className="copy-url-group">
                <input type="text" readOnly value={uploadedAsset.url} />
                <button
                  type="button"
                  onClick={() => copyToClipboard(uploadedAsset.url)}
                  className="admin-secondary-btn"
                >
                  {copied ? <Check size={16} /> : <Copy size={16} />}
                  <span>{copied ? 'Copied!' : 'Copy URL'}</span>
                </button>
              </div>
              <p className="copy-hint">
                👉 Paste this URL into your Project form or Resume PDF path to use it immediately.
              </p>
            </div>
          ) : (
            <div className="empty-asset-box">
              <UploadCloud size={40} className="empty-icon" />
              <p>No file uploaded in this session.</p>
              <span className="sub">Select a file on the left to upload directly to your Cloudinary cloud.</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

