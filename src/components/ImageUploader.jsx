import React, { useState, useRef } from 'react';
import { uploadToImgbb } from '../services/imgbb';

export default function ImageUploader({ onUpload, multiple = true, label = 'Upload Photos' }) {
  const [previews, setPreviews] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [uploadedUrls, setUploadedUrls] = useState([]);
  const fileRef = useRef();

  const handleFiles = (e) => {
    const files = Array.from(e.target.files);
    const newPreviews = files.map(f => ({
      file: f,
      preview: URL.createObjectURL(f),
      uploaded: false,
      url: null
    }));
    setPreviews(prev => [...prev, ...newPreviews]);
  };

  const removePreview = (index) => {
    setPreviews(prev => prev.filter((_, i) => i !== index));
  };

  const uploadAll = async () => {
    setUploading(true);
    const urls = [];
    const updated = [...previews];
    for (let i = 0; i < updated.length; i++) {
      if (!updated[i].uploaded) {
        try {
          const url = await uploadToImgbb(updated[i].file);
          updated[i].uploaded = true;
          updated[i].url = url;
          urls.push(url);
        } catch (err) {
          console.error('Upload failed for file', i, err);
        }
      } else if (updated[i].url) {
        urls.push(updated[i].url);
      }
    }
    setPreviews(updated);
    setUploadedUrls(urls);
    setUploading(false);
    if (onUpload) onUpload(urls);
  };

  return (
    <div className="image-uploader">
      <div
        className="image-uploader__dropzone"
        onClick={() => fileRef.current?.click()}
      >
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/>
          <path d="M21 15l-5-5L5 21"/>
        </svg>
        <span>{label}</span>
        <span className="image-uploader__hint">Click or drag photos here</span>
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          multiple={multiple}
          onChange={handleFiles}
          style={{ display: 'none' }}
        />
      </div>

      {previews.length > 0 && (
        <div className="image-uploader__previews">
          {previews.map((p, i) => (
            <div key={i} className={`image-uploader__preview ${p.uploaded ? 'uploaded' : ''}`}>
              <img src={p.preview} alt={`Preview ${i + 1}`} />
              {p.uploaded && (
                <div className="image-uploader__check">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3">
                    <polyline points="20,6 9,17 4,12"/>
                  </svg>
                </div>
              )}
              {!p.uploaded && (
                <button className="image-uploader__remove" onClick={() => removePreview(i)}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                  </svg>
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      {previews.length > 0 && previews.some(p => !p.uploaded) && (
        <button className="btn btn--primary" onClick={uploadAll} disabled={uploading}>
          {uploading ? 'Uploading...' : `Upload ${previews.filter(p => !p.uploaded).length} Photo(s)`}
        </button>
      )}
    </div>
  );
}
