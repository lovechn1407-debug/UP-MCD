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
    const c = await getComplaints({ clientId: userData.id });
    // Auto-resolve check
    for (const complaint of c) {
      if (complaint.status === 'finalized_by_worker' && shouldAutoResolve(complaint.workerFinalizedAt)) {
        await autoResolve(complaint.id, complaint.districtId);
      }
    }
    setComplaints(await getComplaints({ clientId: userData.id }));
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
      <div className="panel-section">
        <button className="btn btn--ghost" onClick={() => setSelected(null)}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12,19 5,12 12,5"/></svg>
          Back
        </button>
        <div className="complaint-detail">
          <div className="complaint-detail__header">
            <h2>{selected.complaintNumber}</h2>
            <StatusBadge status={selected.status} />
          </div>
          <div className="complaint-detail__grid">
            <div><strong>Type:</strong> {selected.type}</div>
            <div><strong>Filed:</strong> {formatDateTime(selected.createdAt)}</div>
            <div><strong>Address:</strong> {selected.address}</div>
            <div><strong>District:</strong> {selected.districtId?.replace(/_/g, ' ')}</div>
          </div>
          <p className="complaint-detail__desc">{selected.description}</p>
          {selected.photos?.length > 0 && (
            <div className="complaint-detail__photos">
              {selected.photos.map((p, i) => <a key={i} href={p} target="_blank" rel="noreferrer"><img src={p} alt="" /></a>)}
            </div>
          )}

          {selected.assignedWorkerName && (
            <div className="worker-info-card">
              <h4>Assigned Worker</h4>
              <p><strong>{selected.assignedWorkerName}</strong></p>
              <a href={`tel:${selected.assignedWorkerPhone}`}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72"/>
                </svg>
                {selected.assignedWorkerPhone}
              </a>
            </div>
          )}

          {/* Resolution buttons */}
          {isFinalized && (
            <div className="resolution-actions">
              <h3>Worker has finalized the work. Is the issue resolved?</h3>
              {selected.workerRemark && <p className="worker-remark"><strong>Worker's Remark:</strong> {selected.workerRemark}</p>}
              {selected.workerPhotos?.length > 0 && (
                <div className="complaint-detail__photos">
                  {selected.workerPhotos.map((p, i) => <a key={i} href={p} target="_blank" rel="noreferrer"><img src={p} alt="" /></a>)}
                </div>
              )}
              <div className="resolution-buttons">
                <button className="btn btn--success btn--lg" onClick={handleResolve} disabled={processing}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="20,6 9,17 4,12"/></svg>
                  Complaint Resolved
                </button>
                <button className="btn btn--danger btn--lg" onClick={() => setShowDecline(true)} disabled={processing}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                  Not Resolved
                </button>
              </div>

              {showDecline && (
                <div className="action-card" style={{ marginTop: '1rem', borderLeft: '4px solid #DC2626' }}>
                  <h4>Why is the issue not resolved?</h4>
                  <div className="form-group">
                    <label>Your Remark</label>
                    <textarea className="input textarea" value={declineRemark} onChange={e => setDeclineRemark(e.target.value)} rows={3} placeholder="Explain why the issue persists..." />
                  </div>
                  <ImageUploader onUpload={(urls) => setDeclinePhoto(urls[0] || '')} multiple={false} label="Upload a current photo of the place" />
                  <button className="btn btn--danger" onClick={handleDecline} disabled={processing} style={{ marginTop: '1rem' }}>
                    {processing ? 'Submitting...' : 'Submit Decline'}
                  </button>
                </div>
              )}
            </div>
          )}

          <h3>Activity Timeline</h3>
          <ChatThread thread={thread} />
        </div>
      </div>
    );
  }

  return (
    <div className="panel-section">
      <div className="panel-section__header"><h2>My Complaints</h2></div>
      {loading ? (
        <div className="loading-skeleton">{[1,2,3].map(i => <div key={i} className="skeleton-card" />)}</div>
      ) : complaints.length === 0 ? (
        <div className="empty-state">
          <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="#CBD5E1" strokeWidth="1"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14,2 14,8 20,8"/></svg>
          <p>You haven't filed any complaints yet</p>
        </div>
      ) : (
        <div className="complaints-grid">
          {complaints.map(c => <ComplaintCard key={c.id} complaint={c} onClick={() => openDetail(c)} />)}
        </div>
      )}
    </div>
  );
}
