import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { getComplaints, getThread, clientResolve, clientDecline, autoResolve } from '../../services/firestore';
import { shouldAutoResolve } from '../../utils/helpers';
import ComplaintCard from '../../components/ComplaintCard';
import ChatThread from '../../components/ChatThread';
import StatusBadge from '../../components/StatusBadge';
import ImageUploader from '../../components/ImageUploader';
import { useToast } from '../../components/Toast';
import { formatDateTime } from '../../utils/helpers';
import { FileText, ArrowLeft, CheckCircle2, XCircle, Phone, Wrench, Loader2, ExternalLink } from 'lucide-react';

export default function MyComplaints() {
  const { userData } = useAuth();
  const toast = useToast();
  const [complaints, setComplaints] = useState([]);
  const [selected, setSelected] = useState(null);
  const [thread, setThread] = useState([]);
  const [loading, setLoading] = useState(true);

  // Decline form
  const [showDecline, setShowDecline] = useState(false);
  const [declineRemark, setDeclineRemark] = useState('');
  const [declinePhoto, setDeclinePhoto] = useState('');
  const [processing, setProcessing] = useState(false);

  useEffect(() => { if (userData) loadComplaints(); }, [userData]);

  const loadComplaints = async () => {
    const c = await getComplaints({ clientId: userData.id || userData.uid });
    for (const complaint of c) {
      if (complaint.status === 'finalized_by_worker' && shouldAutoResolve(complaint.workerFinalizedAt)) {
        await autoResolve(complaint.id, complaint.districtId);
      }
    }
    setComplaints(await getComplaints({ clientId: userData.id || userData.uid }));
    setLoading(false);
  };

  const openDetail = async (complaint) => {
    setSelected(complaint);
    setThread(await getThread(complaint.id));
    setShowDecline(false);
  };

  const handleResolve = async () => {
    if (!confirm('Mark this complaint as resolved? This action cannot be undone.')) return;
    setProcessing(true);
    try {
      await clientResolve(selected.id, userData.name, selected.districtId);
      toast.success('Complaint marked as resolved!');
      setSelected(null);
      loadComplaints();
    } catch (err) { toast.error(err.message); }
    setProcessing(false);
  };

  const handleDecline = async () => {
    if (!declineRemark) { toast.error('Please add a remark'); return; }
    if (!declinePhoto) { toast.error('Please upload a photo'); return; }
    setProcessing(true);
    try {
      await clientDecline(selected.id, declineRemark, declinePhoto, userData.name);
      toast.success('Resolution declined. Admin and worker have been notified.');
      setSelected(null);
      loadComplaints();
    } catch (err) { toast.error(err.message); }
    setProcessing(false);
  };

  if (selected) {
    const isFinalized = selected.status === 'finalized_by_worker';

    return (
      <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-6">
        <button
          onClick={() => setSelected(null)}
          className="inline-flex items-center gap-2 text-xs font-bold text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 px-3.5 py-2 rounded-xl transition-all"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to My Complaints List</span>
        </button>

        <div className="border-b border-slate-100 pb-4 flex flex-wrap items-center justify-between gap-3">
          <div>
            <span className="text-xs font-bold text-slate-400 font-mono">#{selected.complaintNumber}</span>
            <h2 className="text-xl font-extrabold text-slate-900 mt-0.5">{selected.type}</h2>
          </div>
          <StatusBadge status={selected.status} />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 bg-slate-50 p-4 rounded-2xl border border-slate-200/80 text-xs">
          <div><span className="text-slate-400 font-semibold block">Filed Date:</span> <strong className="text-slate-900">{formatDateTime(selected.createdAt)}</strong></div>
          <div><span className="text-slate-400 font-semibold block">District:</span> <strong className="text-slate-900 capitalize">{selected.districtId?.replace(/_/g, ' ')}</strong></div>
          <div className="sm:col-span-3"><span className="text-slate-400 font-semibold block">Address:</span> <strong className="text-slate-900">{selected.address}</strong></div>
        </div>

        <div className="space-y-2">
          <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">Complaint Details</h3>
          <p className="text-sm text-slate-700 leading-relaxed bg-slate-50 p-4 rounded-2xl border border-slate-200">
            {selected.description}
          </p>
        </div>

        {selected.photos?.length > 0 && (
          <div className="space-y-2">
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">My Uploaded Photos</h3>
            <div className="flex flex-wrap gap-3">
              {selected.photos.map((p, i) => (
                <a key={i} href={p} target="_blank" rel="noreferrer" className="w-24 h-24 rounded-2xl overflow-hidden border border-slate-200 block group relative">
                  <img src={p} alt="" className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                </a>
              ))}
            </div>
          </div>
        )}

        {selected.assignedWorkerName && (
          <div className="p-4 rounded-2xl bg-blue-50/70 border border-blue-200 flex items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center text-blue-700 font-bold">
                <Wrench className="w-5 h-5" />
              </div>
              <div>
                <p className="text-slate-500 text-[11px]">Assigned Municipal Worker</p>
                <strong className="text-slate-900 text-sm font-bold block">{selected.assignedWorkerName}</strong>
              </div>
            </div>
            {selected.assignedWorkerPhone && (
              <a
                href={`tel:${selected.assignedWorkerPhone}`}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-sm transition-all"
              >
                <Phone className="w-3.5 h-3.5" />
                <span>Call Worker</span>
              </a>
            )}
          </div>
        )}

        {/* Resolution Actions */}
        {isFinalized && (
          <div className="p-5 rounded-2xl bg-amber-50/80 border border-amber-200 space-y-4">
            <div className="space-y-1">
              <h3 className="text-sm font-bold text-amber-950">Field Worker has submitted resolution!</h3>
              <p className="text-xs text-slate-600">Please inspect the work site and confirm if your issue is resolved.</p>
            </div>

            {selected.workerRemark && (
              <div className="p-3 rounded-xl bg-white border border-amber-200 text-xs text-slate-700">
                <strong className="text-slate-900">Worker's Notes:</strong> {selected.workerRemark}
              </div>
            )}

            {selected.workerPhotos?.length > 0 && (
              <div className="flex gap-2">
                {selected.workerPhotos.map((p, i) => (
                  <a key={i} href={p} target="_blank" rel="noreferrer" className="w-20 h-20 rounded-xl overflow-hidden border border-amber-200 block">
                    <img src={p} alt="" className="w-full h-full object-cover" />
                  </a>
                ))}
              </div>
            )}

            <div className="flex flex-wrap items-center gap-3 pt-2">
              <button
                onClick={handleResolve}
                disabled={processing}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md transition-all disabled:opacity-50"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Confirm Issue Resolved</span>
              </button>

              <button
                onClick={() => setShowDecline(!showDecline)}
                disabled={processing}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow-md transition-all disabled:opacity-50"
              >
                <XCircle className="w-4 h-4" />
                <span>Not Resolved (Decline)</span>
              </button>
            </div>

            {showDecline && (
              <div className="p-4 rounded-xl bg-white border border-rose-200 space-y-3 mt-3">
                <h4 className="text-xs font-bold text-rose-900">Explain why the issue is not resolved</h4>
                <textarea
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:border-rose-500 resize-none"
                  value={declineRemark}
                  onChange={e => setDeclineRemark(e.target.value)}
                  rows={2}
                  placeholder="Describe what work is remaining..."
                />
                <ImageUploader onUpload={(urls) => setDeclinePhoto(urls[0] || '')} multiple={false} label="Upload photo showing remaining issue" />
                <button
                  onClick={handleDecline}
                  disabled={processing}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow-sm transition-all disabled:opacity-50"
                >
                  {processing ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <XCircle className="w-3.5 h-3.5" />}
                  {processing ? 'Submitting...' : 'Submit Rejection Feedback'}
                </button>
              </div>
            )}
          </div>
        )}

        <div className="space-y-4 pt-4 border-t border-slate-100">
          <h3 className="text-sm font-bold text-slate-900">Activity Timeline & Official Responses</h3>
          <ChatThread thread={thread} />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-slate-900">My Complaints</h2>
        <p className="text-xs text-slate-500">Track resolution progress and field worker updates for your filed grievances</p>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12 text-slate-400 gap-2">
          <Loader2 className="w-5 h-5 animate-spin" />
          <span className="text-sm font-medium">Loading your complaints...</span>
        </div>
      ) : complaints.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-3xl p-12 text-center text-slate-400 space-y-2">
          <FileText className="w-10 h-10 mx-auto stroke-[1.5]" />
          <p className="text-sm font-medium text-slate-600">You haven't filed any complaints yet</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {complaints.map(c => <ComplaintCard key={c.id} complaint={c} onClick={() => openDetail(c)} />)}
        </div>
      )}
    </div>
  );
}
