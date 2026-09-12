import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useApp } from '../context/AppContext';
import { uploadMultipleImagesToImgBB, uploadImageToImgBB } from '../services/imgbb';
import { COMPLAINT_TYPES } from '../services/seedData';
import { MapPicker } from '../components/MapPicker';
import { CountdownTimer } from '../components/CountdownTimer';
import { ChatModal } from '../components/ChatModal';
import { 
  User, Plus, FileText, UploadCloud, CheckCircle2, XCircle, MapPin, 
  Phone, Clock, HardHat, MessageSquare, AlertTriangle, ShieldCheck, Image as ImageIcon, X 
} from 'lucide-react';
import confetti from 'canvas-confetti';

export const ClientPanel = () => {
  const { currentUser } = useAuth();
  const { complaints, districts, createComplaint, clientResolveComplaint, clientDeclineResolution } = useApp();

  // Filter complaints filed by this client
  const myComplaints = complaints.filter(
    c => c.clientEmail?.toLowerCase() === currentUser?.email?.toLowerCase() ||
         c.clientName?.toLowerCase() === currentUser?.name?.toLowerCase() ||
         (currentUser?.uid && c.clientUid === currentUser.uid)
  );

  // New Complaint Modal & Form state
  const [showNewModal, setShowNewModal] = useState(false);
  const [complaintType, setComplaintType] = useState(COMPLAINT_TYPES[0]);
  const [description, setDescription] = useState('');
  const [district, setDistrict] = useState(districts[0]?.name || 'Lucknow');
  const [address, setAddress] = useState(currentUser?.address || '');
  const [phone, setPhone] = useState(currentUser?.phone || '');
  const [lat, setLat] = useState(26.8467);
  const [lng, setLng] = useState(80.9462);

  // Multi-photo upload state
  const [photoFiles, setPhotoFiles] = useState([]);
  const [photoPreviews, setPhotoPreviews] = useState([]);
  const [submitting, setSubmitting] = useState(false);

  // Resolution Decline Modal State
  const [declineComplaint, setDeclineComplaint] = useState(null);
  const [rejectionRemark, setRejectionRemark] = useState('');
  const [rejectionFile, setRejectionFile] = useState(null);
  const [rejectionPreview, setRejectionPreview] = useState(null);

  // Active Chat Modal State
  const [chatComplaint, setChatComplaint] = useState(null);

  // Handle multi-photo file selection
  const handlePhotosChange = (e) => {
    const files = Array.from(e.target.files);
    if (!files.length) return;

    setPhotoFiles(prev => [...prev, ...files]);
    const previews = files.map(f => URL.createObjectURL(f));
    setPhotoPreviews(prev => [...prev, ...previews]);
  };

  const removePhoto = (index) => {
    setPhotoFiles(prev => prev.filter((_, i) => i !== index));
    setPhotoPreviews(prev => prev.filter((_, i) => i !== index));
  };

  // Submit New Complaint
  const handleSubmitComplaint = async (e) => {
    e.preventDefault();
    if (!description || !address || !phone) return;

    setSubmitting(true);

    // Upload multi-photos to ImgBB
    let uploadedUrls = [];
    if (photoFiles.length > 0) {
      uploadedUrls = await uploadMultipleImagesToImgBB(photoFiles);
    } else {
      // Default sample photo
      uploadedUrls = ["https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?auto=format&fit=crop&w=600&q=80"];
    }

    createComplaint({
      clientUid: currentUser.uid,
      clientName: currentUser.name,
      clientEmail: currentUser.email || `${currentUser.name.toLowerCase().replace(/\s+/g, '')}@gmail.com`,
      clientPhone: phone,
      district,
      complaintType,
      description,
      address,
      lat,
      lng,
      photos: uploadedUrls
    });

    setSubmitting(false);
    setShowNewModal(false);
    // Reset
    setDescription('');
    setPhotoFiles([]);
    setPhotoPreviews([]);

    // Celebrate creation
    confetti({ particleCount: 80, spread: 60, origin: { y: 0.6 } });
  };

  // Client Clicks "Complaint Resolved"
  const handleResolveClick = (complaintId) => {
    clientResolveComplaint(complaintId);
    confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
  };

  // Client Clicks "Not Resolved" Decline
  const handleDeclineSubmit = async (e) => {
    e.preventDefault();
    if (!declineComplaint || !rejectionRemark || !rejectionFile) return;

    setSubmitting(true);
    const rejectionPhotoUrl = await uploadImageToImgBB(rejectionFile);

    clientDeclineResolution(declineComplaint.id, rejectionRemark, rejectionPhotoUrl);

    setSubmitting(false);
    setDeclineComplaint(null);
    setRejectionRemark('');
    setRejectionFile(null);
    setRejectionPreview(null);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-emerald-900 via-teal-900 to-slate-900 rounded-2xl p-6 sm:p-8 text-white shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-emerald-600/30 border border-emerald-400/30 flex items-center justify-center text-emerald-300">
            <User className="w-8 h-8" />
          </div>
          <div>
            <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 text-xs font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider">
              Citizen Public Portal
            </span>
            <h2 className="text-2xl font-extrabold text-white mt-1">
              Welcome, {currentUser?.name}
            </h2>
            <p className="text-slate-300 text-xs sm:text-sm">
              Gmail Auth: <span className="font-semibold text-emerald-300">{currentUser?.email}</span>
            </p>
          </div>
        </div>

        <button
          onClick={() => setShowNewModal(true)}
          className="btn-saffron text-sm shadow-md"
        >
          <Plus className="w-4 h-4" />
          File New Civic Complaint
        </button>
      </div>

      {/* Complaints Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-xl font-extrabold text-slate-900 flex items-center gap-2">
            Your Filed Complaints & Live Resolution Tracker
            <span className="text-xs bg-emerald-100 text-emerald-800 font-bold px-2.5 py-0.5 rounded-full">
              {myComplaints.length} Complaints
            </span>
          </h3>
        </div>

        {myComplaints.length === 0 ? (
          <div className="bg-white rounded-2xl p-12 text-center border border-slate-200 text-slate-500 shadow-sm">
            <FileText className="w-12 h-12 text-blue-500 mx-auto mb-3" />
            <h4 className="text-lg font-bold text-slate-800">No Complaints Filed Yet</h4>
            <p className="text-xs text-slate-500 mb-4">You have not submitted any civic complaints in Uttar Pradesh yet.</p>
            <button onClick={() => setShowNewModal(true)} className="btn-primary mx-auto">
              <Plus className="w-4 h-4" />
              File First Complaint Now
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {myComplaints.map(cmp => (
              <div
                key={cmp.id}
                className={`bg-white rounded-2xl p-5 border shadow-sm space-y-4 ${
                  cmp.status === 'Resolved'
                    ? 'border-emerald-300 bg-emerald-50/10'
                    : cmp.status === 'Worker Finalised'
                    ? 'border-amber-300 bg-amber-50/20 ring-2 ring-amber-200'
                    : cmp.status === 'Resolve Declined'
                    ? 'border-red-300 bg-red-50/10'
                    : 'border-slate-200'
                }`}
              >
                {/* ID & Status */}
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <span className="font-mono text-xs font-bold text-slate-500 block">
                      Ticket #{cmp.id} • District: {cmp.district}
                    </span>
                    <h4 className="font-extrabold text-slate-900 text-base mt-0.5">
                      {cmp.complaintType}
                    </h4>
                  </div>
                  <span className={`badge ${
                    cmp.status === 'Resolved' ? 'badge-resolved' :
                    cmp.status === 'Resolve Declined' ? 'badge-declined' :
                    cmp.status === 'Worker Finalised' ? 'badge-worker' :
                    'badge-pending'
                  }`}>
                    {cmp.status}
                  </span>
                </div>

                {/* Description & Address */}
                <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 text-xs space-y-1">
                  <p className="text-slate-800">{cmp.description}</p>
                  <div className="flex items-center gap-1 text-slate-600 font-semibold pt-1">
                    <MapPin className="w-3.5 h-3.5 text-red-500 shrink-0" />
                    <span>{cmp.address}</span>
                  </div>
                </div>

                {/* Photos */}
                {cmp.photos && cmp.photos.length > 0 && (
                  <div className="flex items-center gap-2 overflow-x-auto pb-1">
                    {cmp.photos.map((url, i) => (
                      <img key={i} src={url} alt="Photo" className="w-20 h-20 object-cover rounded-lg border border-slate-200 shrink-0" />
                    ))}
                  </div>
                )}

                {/* Countdown Timer */}
                <CountdownTimer
                  targetDate={cmp.expectedDate}
                  status={cmp.status}
                  workerFinalisedAt={cmp.workerFinalisedAt}
                  autoResolved={cmp.autoResolved}
                />

                {/* Assigned Worker Information Card */}
                {cmp.workerName ? (
                  <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-xs space-y-1 text-amber-900">
                    <div className="flex items-center justify-between">
                      <span className="font-extrabold flex items-center gap-1.5 text-amber-900">
                        <HardHat className="w-4 h-4 text-amber-600" />
                        Assigned Field Officer Details:
                      </span>
                      <span className="font-mono text-xs font-bold text-amber-800 bg-white px-2 py-0.5 rounded border border-amber-300">
                        📞 {cmp.workerPhone}
                      </span>
                    </div>
                    <p className="font-semibold text-slate-800">
                      Officer Name: <span className="text-amber-900 font-extrabold">{cmp.workerName}</span>
                    </p>
                  </div>
                ) : (
                  <div className="bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs text-slate-500 text-center">
                    ⏳ Awaiting District Admin to assign field officer...
                  </div>
                )}

                {/* Worker Completion Remarks & Proof if Finalised */}
                {cmp.workerRemark && (
                  <div className="bg-blue-50 border border-blue-200 rounded-xl p-3 text-xs text-blue-900 space-y-1.5">
                    <span className="font-extrabold text-blue-900 block">Worker Completion Submission:</span>
                    <p className="text-slate-800 font-medium">"{cmp.workerRemark}"</p>
                    {cmp.workerPhotos && cmp.workerPhotos.length > 0 && (
                      <div className="flex items-center gap-2 overflow-x-auto pt-1">
                        {cmp.workerPhotos.map((url, i) => (
                          <img key={i} src={url} alt="Proof" className="w-16 h-16 object-cover rounded-lg border border-blue-300" />
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* Client Resolution Action Buttons (Shown after Worker Finalised) */}
                {cmp.status === 'Worker Finalised' && (
                  <div className="bg-amber-100/60 border border-amber-300 rounded-xl p-3 space-y-2">
                    <span className="text-xs font-extrabold text-amber-900 block text-center">
                      Worker marked task as finalized! Please verify work on site:
                    </span>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleResolveClick(cmp.id)}
                        className="btn-green text-xs py-2 flex-1 justify-center shadow-md"
                      >
                        <CheckCircle2 className="w-4 h-4" />
                        Complaint Resolved
                      </button>

                      <button
                        onClick={() => setDeclineComplaint(cmp)}
                        className="btn-red text-xs py-2 flex-1 justify-center shadow-md"
                      >
                        <XCircle className="w-4 h-4" />
                        Not Resolved
                      </button>
                    </div>
                  </div>
                )}

                {/* Locked Status Banner if Resolved */}
                {cmp.status === 'Resolved' && (
                  <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3 text-xs text-emerald-900 flex items-center justify-between font-bold">
                    <span className="flex items-center gap-1.5">
                      <ShieldCheck className="w-4 h-4 text-emerald-600" />
                      Status Locked: Resolved & Closed
                    </span>
                    <span className="text-[11px] text-emerald-700 font-mono">Permanent</span>
                  </div>
                )}

                {/* Chat Button */}
                <div className="pt-2 border-t border-slate-100 flex items-center justify-end">
                  <button
                    onClick={() => setChatComplaint(cmp)}
                    className="btn-secondary py-1.5 text-xs"
                  >
                    <MessageSquare className="w-4 h-4 text-blue-600" />
                    Chat with Admin & Worker
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal: File New Complaint */}
      {showNewModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl border border-slate-200 relative my-8 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                <FileText className="w-6 h-6 text-emerald-600" />
                Submit New Civic Issue Complaint
              </h3>
              <button
                onClick={() => setShowNewModal(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmitComplaint} className="space-y-4">
              {/* Complaint Type & District */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="label-title">Complaint Category Issue Type</label>
                  <select
                    className="input-field"
                    value={complaintType}
                    onChange={(e) => setComplaintType(e.target.value)}
                  >
                    {COMPLAINT_TYPES.map((type, idx) => (
                      <option key={idx} value={type}>{type}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="label-title">Target UP District</label>
                  <select
                    className="input-field"
                    value={district}
                    onChange={(e) => setDistrict(e.target.value)}
                  >
                    {districts.map(d => (
                      <option key={d.id} value={d.name}>{d.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="label-title">Detailed Description of Problem</label>
                <textarea
                  className="input-field min-h-[90px]"
                  placeholder="Describe the issue clearly (e.g. Broken water pipeline leaking near main market)..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  required
                />
              </div>

              {/* Mobile Phone */}
              <div>
                <label className="label-title">Contact Mobile Number</label>
                <input
                  type="tel"
                  className="input-field"
                  placeholder="Enter 10-digit mobile number for status updates"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  required
                />
              </div>

              {/* Map & Address Picker */}
              <MapPicker
                lat={lat}
                lng={lng}
                onLocationSelect={(newLat, newLng) => {
                  setLat(newLat);
                  setLng(newLng);
                }}
                address={address}
                onAddressChange={setAddress}
              />

              {/* Multi-photo upload */}
              <div>
                <label className="label-title flex items-center justify-between">
                  <span>Add Issue Photos (Multi-Photo Supported via ImgBB)</span>
                  <span className="text-xs text-slate-500 font-normal">More than 1 photo allowed</span>
                </label>

                <div className="border-2 border-dashed border-slate-300 rounded-xl p-4 text-center hover:border-emerald-500 transition-all cursor-pointer relative bg-slate-50">
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handlePhotosChange}
                    className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                  />
                  <UploadCloud className="w-8 h-8 text-emerald-600 mx-auto mb-1" />
                  <p className="text-xs font-semibold text-slate-700">Click or drag photos to attach issue evidence</p>
                </div>

                {/* Previews */}
                {photoPreviews.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-3">
                    {photoPreviews.map((url, index) => (
                      <div key={index} className="relative w-16 h-16 rounded-lg overflow-hidden border border-slate-300">
                        <img src={url} alt="Preview" className="w-full h-full object-cover" />
                        <button
                          type="button"
                          onClick={() => removePhoto(index)}
                          className="absolute top-0.5 right-0.5 bg-red-600 text-white rounded-full p-0.5"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Submit Buttons */}
              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setShowNewModal(false)}
                  className="btn-secondary"
                  disabled={submitting}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="btn-saffron"
                >
                  <Plus className="w-4 h-4" />
                  {submitting ? "Uploading Photos & Filing Ticket..." : "Submit Complaint Ticket"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Client Not Resolved Decline Proof Submission */}
      {declineComplaint && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 relative space-y-4">
            <h3 className="text-xl font-bold text-red-900 flex items-center gap-2">
              <AlertTriangle className="w-6 h-6 text-red-600" />
              Decline Resolution & Submit Proof Photo
            </h3>
            <p className="text-xs text-slate-500">
              Please take/upload a current picture of the location showing unfulfilled work and enter your remarks for ticket <span className="font-mono font-bold text-slate-900">#{declineComplaint.id}</span>
            </p>

            <form onSubmit={handleDeclineSubmit} className="space-y-4">
              <div>
                <label className="label-title">Rejection Remark / Why is issue unfulfilled?</label>
                <textarea
                  className="input-field min-h-[90px]"
                  placeholder="Explain why work is incomplete or unsatisfactory..."
                  value={rejectionRemark}
                  onChange={(e) => setRejectionRemark(e.target.value)}
                  required
                />
              </div>

              <div>
                <label className="label-title">Upload Photo Proof of Location (Mandatory)</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    if (e.target.files[0]) {
                      setRejectionFile(e.target.files[0]);
                      setRejectionPreview(URL.createObjectURL(e.target.files[0]));
                    }
                  }}
                  className="input-field py-2"
                  required
                />

                {rejectionPreview && (
                  <div className="mt-2 w-full h-36 rounded-lg overflow-hidden border border-slate-300">
                    <img src={rejectionPreview} alt="Rejection Proof" className="w-full h-full object-cover" />
                  </div>
                )}
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setDeclineComplaint(null)}
                  className="btn-secondary"
                  disabled={submitting}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="btn-red"
                >
                  <XCircle className="w-4 h-4" />
                  {submitting ? "Uploading Rejection Proof..." : "Submit Rejection to Admin & Worker"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Chat Modal */}
      {chatComplaint && (
        <ChatModal
          complaint={chatComplaint}
          isOpen={!!chatComplaint}
          onClose={() => setChatComplaint(null)}
        />
      )}
    </div>
  );
};
