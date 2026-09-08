import React, { useState, useRef } from 'react';
import { 
  UploadCloud, Image as ImageIcon, Trash2, RefreshCw, 
  FolderOpen, AlertCircle, Check, ExternalLink, Loader2 
} from 'lucide-react';
import api from '../../services/api';
import MediaSelectorModal from '../../pages/admin/MediaSelectorModal';
import { getFullMediaUrl } from '../../utils/mediaUrl';

export { getFullMediaUrl };

/**
 * MediaImageUploader - A modern drag-and-drop image upload and media selector component.
 * 
 * Props:
 * - label: string (e.g. "Department Image", "Course Thumbnail")
 * - value: string (current image URL)
 * - onChange: (url: string) => void
 * - module: string (e.g. "departments", "courses", "course_modules", "units", "events", "news")
 * - helpText: string (optional guidance)
 * - required: boolean
 * - height: number | string (preview height, default: 140)
 */
const MediaImageUploader = ({
  label = 'Image',
  value = '',
  onChange,
  module = 'general',
  helpText = '',
  required = false,
  height = 140
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState(null);
  const [showMediaModal, setShowMediaModal] = useState(false);
  const [showManualInput, setShowManualInput] = useState(false);
  const fileInputRef = useRef(null);

  const handleUploadFile = async (file) => {
    if (!file) return;

    // Validate image format
    if (!file.type.startsWith('image/')) {
      setError('Please upload a valid image file (PNG, JPG, JPEG, WEBP, SVG).');
      return;
    }

    // Validate size (max 20MB)
    if (file.size > 20 * 1024 * 1024) {
      setError('Image file size exceeds 20MB limit.');
      return;
    }

    setError(null);
    setUploading(true);
    setUploadProgress(10);

    const formData = new FormData();
    formData.append('file', file);
    formData.append('module', module);

    try {
      setUploadProgress(45);
      const res = await api.post(`/media/upload?module=${encodeURIComponent(module)}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        onUploadProgress: (progressEvent) => {
          if (progressEvent.total) {
            const percent = Math.round((progressEvent.loaded * 90) / progressEvent.total);
            setUploadProgress(percent);
          }
        }
      });

      if (res.data?.success && res.data.data?.url) {
        setUploadProgress(100);
        onChange(res.data.data.url);
      } else {
        throw new Error(res.data?.error || 'Failed to upload image');
      }
    } catch (err) {
      console.error('Image upload failed:', err);
      setError(err.response?.data?.error || err.message || 'Image upload failed. Please try again.');
    } finally {
      setUploading(false);
      setUploadProgress(0);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isDragging) setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    // Only deactivate if left the container itself
    if (e.currentTarget.contains(e.relatedTarget)) return;
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    if (e.dataTransfer?.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      handleUploadFile(file);
    }
  };

  const handleMediaSelect = (mediaItem) => {
    if (mediaItem?.url) {
      onChange(mediaItem.url);
      setError(null);
    }
  };

  const fullDisplayUrl = getFullMediaUrl(value);

  return (
    <div className="media-image-uploader-wrapper" style={{ marginBottom: '1rem' }}>
      {/* Label and Actions */}
      <div className="flex items-center justify-between" style={{ marginBottom: '0.4rem' }}>
        <label className="form-label" style={{ marginBottom: 0, fontWeight: 700, fontSize: '0.85rem' }}>
          {label} {required && <span style={{ color: 'var(--danger, #ef4444)' }}>*</span>}
        </label>
        <div className="flex items-center gap-2">
          {value && (
            <button
              type="button"
              onClick={() => setShowManualInput(!showManualInput)}
              style={{
                fontSize: '0.72rem',
                color: 'var(--text-muted)',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                textDecoration: 'underline'
              }}
            >
              {showManualInput ? 'Hide URL' : 'View URL'}
            </button>
          )}
        </div>
      </div>

      {/* Hidden File Input */}
      <input
        type="file"
        ref={fileInputRef}
        accept="image/*"
        style={{ display: 'none' }}
        onChange={(e) => {
          if (e.target.files?.[0]) {
            handleUploadFile(e.target.files[0]);
          }
        }}
      />

      {/* Uploading Overlay / Progress */}
      {uploading && (
        <div
          style={{
            border: '2px dashed var(--primary, #3b82f6)',
            borderRadius: '12px',
            background: 'rgba(59, 130, 246, 0.08)',
            padding: '2rem 1rem',
            textAlign: 'center',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.75rem',
            minHeight: height
          }}
        >
          <Loader2 size={32} className="animate-spin" style={{ color: 'var(--primary, #3b82f6)' }} />
          <div>
            <div style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--text-main)' }}>
              Uploading image...
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
              Optimizing and storing asset
            </div>
          </div>
          <div
            style={{
              width: '180px',
              height: '6px',
              background: 'var(--border, #334155)',
              borderRadius: '999px',
              overflow: 'hidden'
            }}
          >
            <div
              style={{
                width: `${uploadProgress}%`,
                height: '100%',
                background: 'var(--primary, #3b82f6)',
                transition: 'width 0.2s ease'
              }}
            />
          </div>
        </div>
      )}

      {/* View 1: Active Image Preview Card */}
      {!uploading && value && (
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          style={{
            border: isDragging
              ? '2px dashed var(--primary, #3b82f6)'
              : '1px solid var(--border, #334155)',
            background: isDragging
              ? 'rgba(59, 130, 246, 0.08)'
              : 'var(--bg-app, #0f172a)',
            borderRadius: '12px',
            overflow: 'hidden',
            transition: 'all 0.2s ease',
            position: 'relative'
          }}
        >
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '130px 1fr',
              gap: '1rem',
              padding: '0.75rem',
              alignItems: 'center'
            }}
          >
            {/* Image Thumbnail */}
            <div
              style={{
                height: typeof height === 'number' ? Math.min(height, 100) : 100,
                borderRadius: '8px',
                overflow: 'hidden',
                background: '#0b1120',
                border: '1px solid rgba(255,255,255,0.06)',
                position: 'relative',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <img
                src={fullDisplayUrl}
                alt="Selected asset"
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover'
                }}
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.style.display = 'none';
                  e.target.parentElement.innerHTML = '<div style="font-size: 0.7rem; color: #ef4444; padding: 4px; text-align: center;">Failed to load preview</div>';
                }}
              />
            </div>

            {/* Content & Action Buttons */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.45rem', minWidth: 0 }}>
              <div className="flex items-center gap-1.5">
                <span
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.25rem',
                    fontSize: '0.7rem',
                    fontWeight: 700,
                    color: '#10b981',
                    background: 'rgba(16, 185, 129, 0.12)',
                    padding: '0.15rem 0.45rem',
                    borderRadius: '4px'
                  }}
                >
                  <Check size={11} /> Image Selected
                </span>
                <span
                  style={{
                    fontSize: '0.72rem',
                    color: 'var(--text-muted)',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis'
                  }}
                  title={value}
                >
                  {value.split('/').pop() || 'image'}
                </span>
              </div>

              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem', marginTop: '0.2rem' }}>
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="btn btn-secondary btn-sm"
                  style={{
                    fontSize: '0.75rem',
                    padding: '0.3rem 0.65rem',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.35rem'
                  }}
                >
                  <UploadCloud size={13} />
                  <span>Upload New</span>
                </button>

                <button
                  type="button"
                  onClick={() => setShowMediaModal(true)}
                  className="btn btn-secondary btn-sm"
                  style={{
                    fontSize: '0.75rem',
                    padding: '0.3rem 0.65rem',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.35rem'
                  }}
                >
                  <FolderOpen size={13} />
                  <span>Media Library</span>
                </button>

                <button
                  type="button"
                  onClick={() => onChange('')}
                  className="btn btn-sm"
                  style={{
                    fontSize: '0.75rem',
                    padding: '0.3rem 0.65rem',
                    background: 'rgba(239, 68, 68, 0.1)',
                    color: '#ef4444',
                    border: '1px solid rgba(239, 68, 68, 0.2)',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.35rem'
                  }}
                >
                  <Trash2 size={13} />
                  <span>Remove</span>
                </button>
              </div>

              <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                Tip: Drag & drop a new image here anytime to replace
              </div>
            </div>
          </div>
        </div>
      )}

      {/* View 2: Drag and Drop Zone (When no image is selected) */}
      {!uploading && !value && (
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          style={{
            border: isDragging
              ? '2px dashed var(--primary, #3b82f6)'
              : '2px dashed var(--border, #334155)',
            background: isDragging
              ? 'rgba(59, 130, 246, 0.08)'
              : 'var(--bg-app, #0f172a)',
            borderRadius: '12px',
            padding: '1.5rem 1rem',
            textAlign: 'center',
            cursor: 'pointer',
            transition: 'all 0.2s ease',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.65rem',
            minHeight: height
          }}
          onClick={(e) => {
            // Only trigger if click wasn't on button
            if (e.target.tagName !== 'BUTTON' && !e.target.closest('button')) {
              fileInputRef.current?.click();
            }
          }}
        >
          <div
            style={{
              width: 46,
              height: 46,
              borderRadius: '50%',
              background: isDragging ? 'var(--primary, #3b82f6)' : 'rgba(59, 130, 246, 0.1)',
              color: isDragging ? '#ffffff' : 'var(--primary, #3b82f6)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'all 0.2s ease'
            }}
          >
            <UploadCloud size={24} />
          </div>

          <div>
            <div style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--text-main)' }}>
              Drag & Drop your image here, or{' '}
              <span style={{ color: 'var(--primary, #3b82f6)', textDecoration: 'underline' }}>browse</span>
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
              PNG, JPG, WEBP, or SVG (up to 20MB)
            </div>
          </div>

          <div
            className="flex items-center gap-2"
            style={{ marginTop: '0.25rem' }}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="btn btn-primary btn-sm"
              style={{
                fontSize: '0.78rem',
                padding: '0.4rem 0.9rem',
                fontWeight: 600,
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.35rem'
              }}
            >
              <UploadCloud size={14} />
              <span>Upload New File</span>
            </button>

            <button
              type="button"
              onClick={() => setShowMediaModal(true)}
              className="btn btn-secondary btn-sm"
              style={{
                fontSize: '0.78rem',
                padding: '0.4rem 0.9rem',
                fontWeight: 600,
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.35rem'
              }}
            >
              <FolderOpen size={14} />
              <span>Choose from Media</span>
            </button>
          </div>
        </div>
      )}

      {/* Manual Input Toggle (for fallback or external URL pasting) */}
      {showManualInput && (
        <div style={{ marginTop: '0.5rem', animation: 'fadeIn 0.2s ease' }}>
          <div className="flex gap-2 items-center">
            <input
              type="text"
              className="form-input"
              value={value}
              onChange={(e) => onChange(e.target.value)}
              placeholder="Paste raw image URL or relative path..."
              style={{ fontSize: '0.8rem', padding: '0.4rem 0.65rem' }}
            />
            {value && (
              <a
                href={fullDisplayUrl}
                target="_blank"
                rel="noreferrer"
                className="btn btn-secondary btn-sm"
                style={{ padding: '0.4rem 0.6rem', flexShrink: 0 }}
                title="Open image in new tab"
              >
                <ExternalLink size={13} />
              </a>
            )}
          </div>
        </div>
      )}

      {/* Error message */}
      {error && (
        <div
          style={{
            marginTop: '0.5rem',
            padding: '0.4rem 0.65rem',
            borderRadius: '6px',
            background: 'rgba(239, 68, 68, 0.1)',
            border: '1px solid rgba(239, 68, 68, 0.2)',
            color: '#ef4444',
            fontSize: '0.75rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.35rem'
          }}
        >
          <AlertCircle size={14} style={{ flexShrink: 0 }} />
          <span>{error}</span>
        </div>
      )}

      {/* Help text */}
      {helpText && !error && (
        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.35rem' }}>
          {helpText}
        </div>
      )}

      {/* Media Selector Modal */}
      <MediaSelectorModal
        isOpen={showMediaModal}
        onClose={() => setShowMediaModal(false)}
        onSelect={handleMediaSelect}
        title={`Select Image for ${label}`}
      />
    </div>
  );
};

export default MediaImageUploader;
