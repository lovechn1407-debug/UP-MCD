import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { createComplaint, getDistricts } from '../../services/firestore';
import { COMPLAINT_TYPES } from '../../utils/constants';
import ImageUploader from '../../components/ImageUploader';
import MapPicker from '../../components/MapPicker';
import { useToast } from '../../components/Toast';
import { useEffect } from 'react';

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
        // Try to match district
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
        clientId: userData.id,
        clientName: userData.name,
        clientEmail: userData.email,
        clientPhone: mobile,
        districtId,
        type: finalType,
        description,
        photos,
        address,
        location: location || { lat: 0, lng: 0 },
        mobileNumber: mobile
      });
      toast.success(`Complaint filed! ID: ${result.complaintNumber}`);
      if (onBack) onBack();
    } catch (err) {
      toast.error('Failed to file complaint: ' + err.message);
    }
    setSubmitting(false);
  };

  const canNext = () => {
    if (step === 1) return type && (type !== 'Other' || customType);
    if (step === 2) return description.length >= 20;
    if (step === 3) return photos.length > 0;
    if (step === 4) return address && location;
    return true;
  };

  return (
    <div className="panel-section">
      <button className="btn btn--ghost" onClick={onBack}>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12,19 5,12 12,5"/></svg>
        Back
      </button>

      <div className="new-complaint">
        <h2>File New Complaint</h2>

        {/* Progress Steps */}
        <div className="steps-indicator">
          {['Type', 'Details', 'Photos', 'Location', 'Review'].map((s, i) => (
            <div key={i} className={`step ${step > i + 1 ? 'step--done' : ''} ${step === i + 1 ? 'step--active' : ''}`}>
              <div className="step__dot">{step > i + 1 ? '✓' : i + 1}</div>
              <span>{s}</span>
            </div>
          ))}
        </div>

        {/* Step 1: Type */}
        {step === 1 && (
          <div className="form-card">
            <h3>What type of issue are you reporting?</h3>
            <div className="complaint-types-grid">
              {COMPLAINT_TYPES.map(t => (
                <button
                  key={t}
                  className={`type-btn ${type === t ? 'type-btn--selected' : ''}`}
                  onClick={() => setType(t)}
                >
                  {t}
                </button>
              ))}
            </div>
            {type === 'Other' && (
              <div className="form-group" style={{ marginTop: '1rem' }}>
                <input className="input" value={customType} onChange={e => setCustomType(e.target.value)} placeholder="Describe the issue type" />
              </div>
            )}
          </div>
        )}

        {/* Step 2: Description */}
        {step === 2 && (
          <div className="form-card">
            <h3>Describe the issue in detail</h3>
            <div className="form-group">
              <textarea
                className="input textarea"
                value={description}
                onChange={e => setDescription(e.target.value)}
                rows={6}
                placeholder="Provide a detailed description of the civic issue (minimum 20 characters)..."
              />
              <span className="form-hint">{description.length}/20 characters minimum</span>
            </div>
          </div>
        )}

        {/* Step 3: Photos */}
        {step === 3 && (
          <div className="form-card">
            <h3>Upload photos of the issue</h3>
            <ImageUploader onUpload={setPhotos} label="Add complaint photos" />
          </div>
        )}

        {/* Step 4: Location */}
        {step === 4 && (
          <div className="form-card">
            <h3>Provide the location</h3>
            <div className="form-group">
              <label>Address</label>
              <textarea className="input textarea" value={address} onChange={e => setAddress(e.target.value)} rows={2} placeholder="Full address of the issue" />
            </div>
            <div className="form-group">
              <label>Mobile Number</label>
              <input className="input" value={mobile} onChange={e => setMobile(e.target.value)} placeholder="Your mobile number" />
            </div>
            <div className="form-group">
              <label>District</label>
              <select className="input" value={districtId} onChange={e => setDistrictId(e.target.value)}>
                <option value="">Auto-detect or select...</option>
                {districts.map(d => <option key={d.id} value={d.id}>{d.nameEnglish} ({d.nameHindi})</option>)}
              </select>
            </div>
            <div className="form-group">
              <label>Pin Location on Map</label>
              <MapPicker onLocationSelect={setLocation} />
            </div>
          </div>
        )}

        {/* Step 5: Review */}
        {step === 5 && (
          <div className="form-card">
            <h3>Review Your Complaint</h3>
            <div className="review-grid">
              <div><strong>Type:</strong> {type === 'Other' ? customType : type}</div>
              <div><strong>Description:</strong> {description}</div>
              <div><strong>Photos:</strong> {photos.length} uploaded</div>
              <div><strong>Address:</strong> {address}</div>
              <div><strong>Mobile:</strong> {mobile}</div>
              <div><strong>District:</strong> {districts.find(d => d.id === districtId)?.nameEnglish || districtId}</div>
              <div><strong>Location:</strong> {location ? `${location.lat.toFixed(4)}, ${location.lng.toFixed(4)}` : 'Not set'}</div>
            </div>
            {photos.length > 0 && (
              <div className="review-photos">
                {photos.map((p, i) => <img key={i} src={p} alt="" />)}
              </div>
            )}
          </div>
        )}

        {/* Navigation */}
        <div className="step-nav">
          {step > 1 && <button className="btn btn--ghost" onClick={() => setStep(step - 1)}>Previous</button>}
          <div style={{ flex: 1 }} />
          {step < 5 && (
            <button className="btn btn--primary" onClick={() => setStep(step + 1)} disabled={!canNext()}>
              Next
            </button>
          )}
          {step === 5 && (
            <button className="btn btn--success" onClick={handleSubmit} disabled={submitting}>
              {submitting ? 'Submitting...' : 'Submit Complaint'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
