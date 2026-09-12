import React, { useState, useRef } from 'react';
import { uploadToImgbb } from '../services/imgbb';
import { Image as ImageIcon, UploadCloud, X, CheckCircle2, Loader2 } from 'lucide-react';

export default function ImageUploader({ onUpload, multiple = true, label = 'Upload Proof Photos' }) {
  const [previews, setPreviews] = useState([]);
  const [uploading, setUploading] = useState(false);
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
    setUploading(false);
    if (onUpload) onUpload(urls);
  };

  return (
    <div className="space-y-3">
      {/* Dropzone */}
      <div
        onClick={() => fileRef.current?.click()}
        className="p-6 rounded-2xl bg-slate-50 hover:bg-slate-100/80 border-2 border-dashed border-slate-200 hover:border-blue-400 transition-all cursor-pointer flex flex-col items-center justify-center text-center space-y-1.5"
      >
        <UploadCloud className="w-8 h-8 text-blue-600 mb-1" />
        <span className="text-xs font-bold text-slate-800">{label}</span>
        <span className="text-[11px] text-slate-400">Click or drag photos here (Max 5MB per file)</span>
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          multiple={multiple}
          onChange={handleFiles}
          className="hidden"
        />
      </div>

      {/* Previews */}
      {previews.length > 0 && (
        <div className="flex flex-wrap gap-2.5">
          {previews.map((p, i) => (
            <div key={i} className="relative w-20 h-20 rounded-xl overflow-hidden border border-slate-200 bg-white group">
              <img src={p.preview} alt={`Preview ${i + 1}`} className="w-full h-full object-cover" />
              {p.uploaded ? (
                <div className="absolute inset-0 bg-emerald-600/60 backdrop-blur-2xs flex items-center justify-center text-white">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => removePreview(i)}
                  className="absolute top-1 right-1 p-1 rounded-full bg-slate-900/60 text-white hover:bg-slate-900 transition-colors"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Upload trigger button */}
      {previews.length > 0 && previews.some(p => !p.uploaded) && (
        <button
          type="button"
          onClick={uploadAll}
          disabled={uploading}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-xs transition-all disabled:opacity-50"
        >
          {uploading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <UploadCloud className="w-3.5 h-3.5" />}
          {uploading ? 'Uploading...' : `Upload ${previews.filter(p => !p.uploaded).length} Photo(s)`}
        </button>
      )}
    </div>
  );
}
