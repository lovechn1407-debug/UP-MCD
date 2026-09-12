import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { createComplaint, getDistricts } from '../../services/firestore';
import { COMPLAINT_TYPES } from '../../utils/constants';
import ImageUploader from '../../components/ImageUploader';
import MapPicker from '../../components/MapPicker';
import { useToast } from '../../components/Toast';
import { ArrowLeft, Check, ChevronRight, ChevronLeft, Send, Loader2, FileText, Tag, MapPin } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function NewComplaint({ onBack }) {
  const { userData } = useAuth();
  const toast = useToast();
  const [step, setStep] = useState(1);
  const [districts, setDistricts] = useState([]);

  // Form state
  const [type, setType] = useState('');
  const [customType, setCustomType] = useState('');
  const [description, setDescription] = useState('');
  const [photos, setPhotos] = useState([]);
  const [address, setAddress] = useState('');
  const [mobile, setMobile] = useState(userData?.phone || '');
  const [location, setLocation] = useState(null);
  const [districtId, setDistrictId] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    getDistricts().then(setDistricts);
  }, []);

  // Auto-detect district from location
  useEffect(() => {
    if (location) {
      detectDistrict(location.lat, location.lng);
    }
  }, [location]);

  const detectDistrict = async (lat, lng) => {
    try {
      const res = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json&addressdetails=1`);
      const data = await res.json();
      const addr = data.address;
      const districtName = addr.state_district || addr.county || addr.city || '';
      if (districtName && addr.state?.includes('Uttar Pradesh')) {
        setAddress(data.display_name || '');
        const match = districts.find(d =>
          d.nameEnglish?.toLowerCase().includes(districtName.toLowerCase()) ||
          districtName.toLowerCase().includes(d.nameEnglish?.toLowerCase())
        );
        if (match) {
          setDistrictId(match.id);
          toast.info(`District auto-detected: ${match.nameEnglish}`);
        }
      }
    } catch (e) {
      console.error('District detection error', e);
    }
  };

  const handleSubmit = async () => {
    if (!districtId) { toast.error('Please select a district'); return; }
    setSubmitting(true);
    try {
      const finalType = type === 'Other' ? customType || 'Other' : type;
      const result = await createComplaint({
        clientId: userData.id || userData.uid || 'unknown',
        clientName: userData.name || 'Citizen',
        clientEmail: userData.email || '',
        clientPhone: mobile || '',
        districtId,
        type: finalType || 'Other',
        description: description || '',
        photos: photos || [],
        address,
        location: location || { lat: 0, lng: 0 },
        mobileNumber: mobile
      });
      toast.success(`Complaint filed! Tracking ID: #${result.complaintNumber}`);
      if (onBack) onBack();
    } catch (err) {
      toast.error('Failed to file complaint: ' + err.message);
    }
    setSubmitting(false);
  };

  const canNext = () => {
    if (step === 1) return type && (type !== 'Other' || customType);
    if (step === 2) return description.length >= 20;
    if (step === 3) return true; // Photos optional
    if (step === 4) return address && districtId;
    return true;
  };

  const stepLabels = ['Issue Type', 'Description', 'Photos', 'Location', 'Review'];

  return (
    <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-6 max-w-3xl mx-auto">
      {/* Back button */}
      <button
        onClick={onBack}
        className="inline-flex items-center gap-2 text-xs font-bold text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 px-3.5 py-2 rounded-xl transition-all"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Dashboard</span>
      </button>

      <div className="space-y-1">
        <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">Report Civic Issue</h2>
        <p className="text-xs text-slate-500">File a official complaint with your District Municipal Corporation</p>
      </div>

      {/* Step Indicator */}
      <div className="flex items-center justify-between gap-2 border-y border-slate-100 py-4 overflow-x-auto">
        {stepLabels.map((s, i) => {
          const isDone = step > i + 1;
          const isActive = step === i + 1;
          return (
            <div key={i} className="flex items-center gap-2 shrink-0">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs transition-all ${
                isDone
                  ? 'bg-emerald-500 text-white'
                  : isActive
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
                  : 'bg-slate-100 text-slate-400'
              }`}>
                {isDone ? <Check className="w-4 h-4" /> : i + 1}
              </div>
              <span className={`text-xs font-semibold hidden sm:inline ${isActive ? 'text-slate-900' : 'text-slate-400'}`}>
                {s}
              </span>
              {i < stepLabels.length - 1 && <div className="w-6 h-0.5 bg-slate-100 hidden sm:block" />}
            </div>
          );
        })}
      </div>

      {/* Step Content */}
      <div className="py-2">
        {step === 1 && (
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-slate-900">Select Issue Category</h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {COMPLAINT_TYPES.map(t => {
                const isSelected = type === t;
                return (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setType(t)}
                    className={`p-4 rounded-2xl border text-left font-bold text-xs transition-all ${
                      isSelected
                        ? 'bg-blue-50 border-blue-500 text-blue-700 shadow-sm'
                        : 'bg-slate-50 border-slate-200 text-slate-700 hover:border-slate-300'
                    }`}
                  >
                    <Tag className={`w-4 h-4 mb-2 ${isSelected ? 'text-blue-600' : 'text-slate-400'}`} />
                    <span>{t}</span>
                  </button>
                );
              })}
            </div>

            {type === 'Other' && (
              <div className="mt-3">
                <label className="text-xs font-semibold text-slate-700 block mb-1">Custom Category Name</label>
                <input
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:border-blue-500"
                  value={customType}
                  onChange={e => setCustomType(e.target.value)}
                  placeholder="Specify issue category..."
                />
              </div>
            )}
          </div>
        )}

        {step === 2 && (
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-slate-900">Provide Detailed Description</h3>
            <div>
              <textarea
                className="w-full px-4 py-3 rounded-2xl border border-slate-200 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 resize-none"
                value={description}
                onChange={e => setDescription(e.target.value)}
                rows={6}
                placeholder="Describe the issue in detail (location landmarks, safety concerns, duration of problem)..."
              />
              <div className="flex justify-between items-center text-[11px] text-slate-400 mt-1">
                <span>Min 20 characters required</span>
                <span className={description.length >= 20 ? 'text-emerald-600 font-bold' : ''}>
                  {description.length}/20
                </span>
              </div>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-slate-900">Upload Photo Evidence (Optional)</h3>
            <ImageUploader onUpload={setPhotos} label="Attach clear photos of the civic issue" />
          </div>
        )}

        {step === 4 && (
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-slate-900">Location & Contact Info</h3>
            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">Address / Landmark</label>
              <textarea
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:border-blue-500 resize-none"
                value={address}
                onChange={e => setAddress(e.target.value)}
                rows={2}
                placeholder="Complete street address, ward number or landmark"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">Contact Mobile Number</label>
                <input
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:border-blue-500"
                  value={mobile}
                  onChange={e => setMobile(e.target.value)}
                  placeholder="10-digit mobile"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">Select UP District</label>
                <select
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:border-blue-500"
                  value={districtId}
                  onChange={e => setDistrictId(e.target.value)}
                >
                  <option value="">Select District</option>
                  {districts.map(d => (
                    <option key={d.id} value={d.id}>{d.nameEnglish} ({d.nameHindi})</option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <MapPicker onLocationSelect={setLocation} />
            </div>
          </div>
        )}

        {step === 5 && (
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-slate-900">Review & Submit Complaint</h3>
            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-2 text-xs">
              <div><span className="text-slate-400 font-semibold block">Category:</span> <strong className="text-slate-900">{type === 'Other' ? customType : type}</strong></div>
              <div><span className="text-slate-400 font-semibold block">Description:</span> <p className="text-slate-700 leading-relaxed mt-0.5">{description}</p></div>
              <div><span className="text-slate-400 font-semibold block">Address:</span> <strong className="text-slate-900">{address}</strong></div>
              <div><span className="text-slate-400 font-semibold block">Mobile:</span> <strong className="text-slate-900">{mobile}</strong></div>
              <div><span className="text-slate-400 font-semibold block">District:</span> <strong className="text-slate-900">{districts.find(d => d.id === districtId)?.nameEnglish || districtId}</strong></div>
              <div><span className="text-slate-400 font-semibold block">Photos:</span> <strong className="text-slate-900">{photos.length} photo(s) attached</strong></div>
            </div>

            {photos.length > 0 && (
              <div className="flex gap-2">
                {photos.map((p, i) => (
                  <img key={i} src={p} alt="" className="w-16 h-16 rounded-xl object-cover border border-slate-200" />
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Wizard Footer Navigation Buttons */}
      <div className="flex items-center justify-between pt-4 border-t border-slate-100">
        {step > 1 ? (
          <button
            onClick={() => setStep(step - 1)}
            className="inline-flex items-center gap-1 px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-bold text-xs hover:bg-slate-100 transition-all"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>Previous</span>
          </button>
        ) : <div />}

        {step < 5 ? (
          <button
            onClick={() => setStep(step + 1)}
            disabled={!canNext()}
            className="inline-flex items-center gap-1 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md transition-all disabled:opacity-50"
          >
            <span>Next</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        ) : (
          <button
            onClick={handleSubmit}
            disabled={submitting}
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md transition-all disabled:opacity-50"
          >
            {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
            {submitting ? 'Submitting...' : 'Submit Official Complaint'}
          </button>
        )}
      </div>
    </div>
  );
}
