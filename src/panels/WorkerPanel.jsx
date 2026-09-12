import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useApp } from '../context/AppContext';
import { uploadMultipleImagesToImgBB } from '../services/imgbb';
import { CountdownTimer } from '../components/CountdownTimer';
import { ChatModal } from '../components/ChatModal';
import { 
  HardHat, CheckCircle2, Clock, UploadCloud, AlertTriangle, MapPin, 
  MessageSquare, Check, Image as ImageIcon, X 
} from 'lucide-react';

export const WorkerPanel = () => {
  const { currentUser } = useAuth();
  const { complaints, workerFinaliseWork } = useApp();

  const workerId = currentUser?.uid;
  const workerLoginId = currentUser?.loginId;

  // Filter complaints assigned to this worker
  const assignedComplaints = complaints.filter(
    c => c.workerId === workerId || 
         c.workerName?.toLowerCase() === currentUser?.name?.toLowerCase() ||
         (workerLoginId && c.workerId?.toLowerCase() === workerLoginId.toLowerCase())
  );

  // Active Complaint for Finalise Action Modal
  const [selectedComplaint, setSelectedComplaint] = useState(null);
  const [selectedComplaintForChat, setSelectedComplaintForChat] = useState(null);

  // Completion Form State
  const [remark, setRemark] = useState('');
  const [photosFiles, setPhotosFiles] = useState([]);
  const [photoPreviews, setPhotoPreviews] = useState([]);
  const [uploading, setUploading] = useState(false);

  // Handle Photo Selection
  const handlePhotoSelect = (e) => {
    const files = Array.from(e.target.files);
    if (!files.length) return;

    setPhotosFiles(prev => [...prev, ...files]);

    // Create local object URL previews
    const newPreviews = files.map(file => URL.createObjectURL(file));
    setPhotoPreviews(prev => [...prev, ...newPreviews]);
  };

  const removePhoto = (index) => {
    setPhotosFiles(prev => prev.filter((_, i) => i !== index));
    setPhotoPreviews(prev => prev.filter((_, i) => i !== index));
  };

  // Submit Finalise Work
  const handleFinaliseSubmit = async (e) => {
    e.preventDefault();
    if (!selectedComplaint) return;

    setUploading(true);

    // Upload work proof photos to ImgBB
    let uploadedUrls = [];
    if (photosFiles.length > 0) {
      uploadedUrls = await uploadMultipleImagesToImgBB(photosFiles);
    } else {
      // Fallback sample completion image if none attached
      uploadedUrls = ["https://images.unsplash.com/photo-1584467735871-8e85353a8413?auto=format&fit=crop&w=600&q=80"];
    }

    workerFinaliseWork(selectedComplaint.id, remark || "Work completed on site as per standards.", uploadedUrls);

    setUploading(false);
    setSelectedComplaint(null);
    setRemark('');
    setPhotosFiles([]);
    setPhotoPreviews([]);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-amber-900 via-orange-900 to-slate-900 rounded-2xl p-6 sm:p-8 text-white shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-amber-600/30 border border-amber-400/30 flex items-center justify-center text-amber-300">
            <HardHat className="w-8 h-8" />
          </div>
          <div>
            <span className="bg-amber-500/20 text-amber-300 border border-amber-400/30 text-xs font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider">
              Field Officer Execution Panel
            </span>
            <h2 className="text-2xl font-extrabold text-white mt-1">
              Field Worker: {currentUser?.name}
            </h2>
            <p className="text-slate-300 text-xs sm:text-sm">
              Assigned District: <span className="font-semibold text-amber-300">{currentUser?.district}</span> • Phone: {currentUser?.phone}
            </p>
          </div>
        </div>

        <div className="bg-white/10 backdrop-blur-md px-5 py-2.5 rounded-xl border border-white/10 text-center">
          <span className="text-xs text-slate-300 font-semibold block">Assigned Tickets</span>
          <span className="text-2xl font-black text-amber-400">{assignedComplaints.length}</span>
        </div>
      </div>

      {/* Complaints Grid */}
      <div className="space-y-4">
        <h3 className="text-xl font-extrabold text-slate-900 flex items-center gap-2">
          Your Assigned Field Tasks
        </h3>

        {assignedComplaints.length === 0 ? (
          <div className="bg-white rounded-2xl p-12 text-center border border-slate-200 text-slate-500 shadow-sm">
            <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto mb-3" />
            <h4 className="text-lg font-bold text-slate-800">No Pending Field Tasks!</h4>
            <p className="text-xs text-slate-500">You have no active complaints assigned in your queue.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {assignedComplaints.map(cmp => (
              <div
                key={cmp.id}
                className={`bg-white rounded-2xl p-5 border shadow-sm space-y-4 ${
                  cmp.status === 'Resolve Declined'
                    ? 'border-red-300 ring-2 ring-red-100'
                    : cmp.status === 'Worker Finalised'
                    ? 'border-amber-300 bg-amber-50/20'
                    : 'border-slate-200'
                }`}
              >
                {/* Ticket ID & Badge */}
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <span className="font-mono text-xs font-bold text-slate-500 block">
                      Ticket #{cmp.id}
                    </span>
                    <h4 className="font-extrabold text-slate-900 text-base mt-0.5">
                      {cmp.complaintType}
                    </h4>
                  </div>
                  <span className={`badge ${
                    cmp.status === 'Resolved' ? 'badge-resolved' :
                    cmp.status === 'Resolve Declined' ? 'badge-declined' :
                    cmp.status === 'Worker Finalised' ? 'badge-worker' :
                    'badge-progress'
                  }`}>
                    {cmp.status}
                  </span>
                </div>

                {/* Resolve Declined Banner for Worker */}
                {cmp.status === 'Resolve Declined' && (
                  <div className="bg-red-50 border border-red-200 rounded-xl p-3 text-red-900 text-xs space-y-1">
                    <div className="font-extrabold flex items-center gap-1 text-red-700">
                      <AlertTriangle className="w-4 h-4 text-red-600" />
                      Client Re-opened / Resolution Declined!
                    </div>
                    <p><span className="font-semibold">Client Remark:</span> "{cmp.rejectionReason}"</p>
                    {cmp.rejectionPhoto && (
                      <div className="mt-2">
                        <span className="text-[11px] font-bold text-red-800 block mb-1">Client Rejection Photo Proof:</span>
                        <img src={cmp.rejectionPhoto} alt="Rejection Proof" className="w-full h-32 object-cover rounded-lg border border-red-200" />
                      </div>
                    )}
                  </div>
                )}

                {/* Location & Details */}
                <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 text-xs space-y-1">
                  <p className="text-slate-800 font-medium">{cmp.description}</p>
                  <div className="flex items-center gap-1 text-slate-600 font-semibold pt-1">
                    <MapPin className="w-3.5 h-3.5 text-red-500 shrink-0" />
                    <span>{cmp.address}</span>
                  </div>
                </div>

                {/* Timer */}
                <CountdownTimer
                  targetDate={cmp.expectedDate}
                  status={cmp.status}
                  workerFinalisedAt={cmp.workerFinalisedAt}
                  autoResolved={cmp.autoResolved}
                />

                {/* Worker Remark & Photos if Finalised */}
                {cmp.workerRemark && (
                  <div className="bg-emerald-50/80 border border-emerald-200 rounded-xl p-3 text-xs text-emerald-900 space-y-1.5">
                    <span className="font-extrabold block text-emerald-800">Your Submitted Work Proof:</span>
                    <p className="text-slate-800">{cmp.workerRemark}</p>
                    {cmp.workerPhotos && cmp.workerPhotos.length > 0 && (
                      <div className="flex items-center gap-2 overflow-x-auto pt-1">
                        {cmp.workerPhotos.map((url, i) => (
                          <img key={i} src={url} alt="Proof" className="w-16 h-16 object-cover rounded-lg border border-emerald-300" />
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* Buttons */}
                <div className="flex items-center gap-2 pt-2 border-t border-slate-100">
                  {cmp.status !== 'Resolved' && (
                    <button
                      onClick={() => {
                        setSelectedComplaint(cmp);
                        setRemark(cmp.workerRemark || '');
                      }}
                      className="btn-saffron py-2 text-xs flex-1 justify-center"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      {cmp.status === 'Worker Finalised' ? 'Update Completion Proof' : 'Upload Work Proof & Finalise'}
                    </button>
                  )}

                  <button
                    onClick={() => setSelectedComplaintForChat(cmp)}
                    className="btn-secondary py-2 text-xs"
                  >
                    <MessageSquare className="w-4 h-4 text-blue-600" />
                    Chat
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal: Worker Finalise Work */}
      {selectedComplaint && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 relative space-y-4">
            <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2">
              <HardHat className="w-6 h-6 text-amber-600" />
              Finalise Task Completion
            </h3>
            <p className="text-xs text-slate-500">
              Upload photos of completed work and submit completion remarks for ticket <span className="font-mono font-bold text-blue-900">#{selectedComplaint.id}</span>
            </p>

            <form onSubmit={handleFinaliseSubmit} className="space-y-4">
              {/* Remark */}
              <div>
                <label className="label-title">Work Completion Remarks</label>
                <textarea
                  className="input-field min-h-[90px]"
                  placeholder="Describe resolution details (e.g., Pothole filled and sealed, garbage cleared)..."
                  value={remark}
                  onChange={(e) => setRemark(e.target.value)}
                  required
                />
              </div>

              {/* Photo Upload via ImgBB */}
              <div>
                <label className="label-title flex items-center justify-between">
                  <span>Upload Site Photos (Hosted on ImgBB)</span>
                  <span className="text-xs text-slate-500 font-normal">Multiple photos allowed</span>
                </label>

                <div className="border-2 border-dashed border-slate-300 rounded-xl p-4 text-center hover:border-amber-500 transition-all cursor-pointer relative bg-slate-50">
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handlePhotoSelect}
                    className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                  />
                  <UploadCloud className="w-8 h-8 text-amber-600 mx-auto mb-1" />
                  <p className="text-xs font-semibold text-slate-700">Click or drag photos to upload completion proof</p>
                  <p className="text-[11px] text-slate-400">JPG, PNG, WEBP files supported</p>
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

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setSelectedComplaint(null)}
                  className="btn-secondary"
                  disabled={uploading}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={uploading}
                  className="btn-green"
                >
                  <Check className="w-4 h-4" />
                  {uploading ? "Uploading Images to ImgBB..." : "Click Finalised from Worker Side"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Chat Modal */}
      {selectedComplaintForChat && (
        <ChatModal
          complaint={selectedComplaintForChat}
          isOpen={!!selectedComplaintForChat}
          onClose={() => setSelectedComplaintForChat(null)}
        />
      )}
    </div>
  );
};
