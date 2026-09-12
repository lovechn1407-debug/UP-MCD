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
  const [previewImage, setPreviewImage] = useState(null);

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
        {/* Lightbox Modal */}
        {previewImage && (
          <div className="lightbox-modal" onClick={() => setPreviewImage(null)}>
            <button className="lightbox-modal__close" onClick={() => setPreviewImage(null)}>&times;</button>
            <img src={previewImage} alt="Enlarged view" onClick={e => e.stopPropagation()} />
          </div>
        )}

        <button className="btn btn--ghost" onClick={() => setSelected(null)}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12,19 5,12 12,5"/></svg>
          Back to Complaints
        </button>

        <div className="complaint-detail">
          {/* Topbar Header */}
          <div className="complaint-detail__topbar">
            <div className="complaint-detail__code-wrap">
              <span className="complaint-detail__code">{selected.complaintNumber}</span>
              <StatusBadge status={selected.status} />
            </div>
            <span className="form-hint">Ref ID: {selected.id}</span>
          </div>

          {/* 4-Column Metric Info Grid */}
          <div className="complaint-detail__info-grid">
            <div className="info-chip">
              <div className="info-chip__icon">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"/><line x1="4" y1="22" x2="4" y2="15"/>
                </svg>
              </div>
              <div className="info-chip__text">
                <span className="info-chip__label">Category</span>
                <span className="info-chip__value">{selected.type}</span>
              </div>
            </div>

            <div className="info-chip">
              <div className="info-chip__icon">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
                </svg>
              </div>
              <div className="info-chip__text">
                <span className="info-chip__label">Date Filed</span>
                <span className="info-chip__value">{formatDateTime(selected.createdAt)}</span>
              </div>
            </div>

            <div className="info-chip">
              <div className="info-chip__icon">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/>
                </svg>
              </div>
              <div className="info-chip__text">
                <span className="info-chip__label">Location Address</span>
                <span className="info-chip__value" title={selected.address}>{selected.address}</span>
              </div>
            </div>

            <div className="info-chip">
              <div className="info-chip__icon">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M3 21h18"/><path d="M5 21V7l8-4v18"/><path d="M19 21V11l-6-4"/>
                </svg>
              </div>
              <div className="info-chip__text">
                <span className="info-chip__label">District</span>
                <span className="info-chip__value" style={{ textTransform: 'capitalize' }}>{selected.districtId?.replace(/_/g, ' ')}</span>
              </div>
            </div>
          </div>

          {/* Problem Statement Block */}
          <div className="complaint-detail__desc-box">
            <div className="complaint-detail__desc-title">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14,2 14,8 20,8"/>
              </svg>
              Problem Description
            </div>
            <p className="complaint-detail__desc-text">{selected.description}</p>
          </div>

          {/* Citizen Uploaded Photos */}
          {selected.photos?.length > 0 && (
            <div className="complaint-detail__media-section">
              <span className="complaint-detail__media-title">Attached Photos ({selected.photos.length})</span>
              <div className="complaint-detail__photos">
                {selected.photos.map((p, i) => (
                  <div key={i} className="complaint-detail__photo-thumb" onClick={() => setPreviewImage(p)}>
                    <img src={p} alt={`Attached ${i + 1}`} />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Assigned Worker Profile Card */}
          {selected.assignedWorkerName && (
            <div className="worker-card">
              <div className="worker-card__info">
                <div className="worker-card__avatar">
                  {selected.assignedWorkerName.charAt(0).toUpperCase()}
                </div>
                <div className="worker-card__details">
                  <h4>Assigned Municipal Worker</h4>
                  <p>{selected.assignedWorkerName}</p>
                </div>
              </div>

              {selected.assignedWorkerPhone && (
                <a className="worker-card__call-btn" href={`tel:${selected.assignedWorkerPhone}`}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72"/>
                  </svg>
                  Call {selected.assignedWorkerPhone}
                </a>
              )}
            </div>
          )}

          {/* Resolution Finalization Card */}
          {isFinalized && (
            <div className="resolution-hero">
              <div className="resolution-hero__header">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22,4 12,14.01 9,11.01"/>
                </svg>
                <h3>Worker has completed the work. Is the issue resolved?</h3>
              </div>

              {selected.workerRemark && (
                <div className="resolution-hero__remark">
                  <p><strong>Worker's Remark:</strong> {selected.workerRemark}</p>
                </div>
              )}

              {selected.workerPhotos?.length > 0 && (
                <div className="complaint-detail__media-section">
                  <span className="complaint-detail__media-title">Worker Completion Photos ({selected.workerPhotos.length})</span>
                  <div className="complaint-detail__photos">
                    {selected.workerPhotos.map((p, i) => (
                      <div key={i} className="complaint-detail__photo-thumb" onClick={() => setPreviewImage(p)}>
                        <img src={p} alt={`Proof ${i + 1}`} />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="resolution-hero__actions">
                <button className="btn btn--success btn--lg" onClick={handleResolve} disabled={processing}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20,6 9,17 4,12"/></svg>
                  Confirm & Mark Resolved
                </button>
                <button className="btn btn--danger btn--lg" onClick={() => setShowDecline(true)} disabled={processing}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                  Decline Resolution
                </button>
              </div>

              {showDecline && (
                <div className="action-card" style={{ borderLeft: '4px solid var(--danger)', marginTop: '0.5rem' }}>
                  <h4 style={{ color: 'var(--danger)', marginBottom: '0.75rem' }}>Why is the issue persistent?</h4>
                  <div className="form-group">
                    <label>Your Remark</label>
                    <textarea className="input textarea" value={declineRemark} onChange={e => setDeclineRemark(e.target.value)} rows={3} placeholder="Explain why the issue persists..." />
                  </div>
                  <ImageUploader onUpload={(urls) => setDeclinePhoto(urls[0] || '')} multiple={false} label="Upload current photo proof" />
                  <button className="btn btn--danger" onClick={handleDecline} disabled={processing} style={{ marginTop: '1rem' }}>
                    {processing ? 'Submitting...' : 'Submit Decline'}
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Activity Timeline */}
          <div style={{ marginTop: '0.5rem' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: '800', marginBottom: '0.5rem' }}>Activity Timeline</h3>
            <ChatThread thread={thread} />
          </div>
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
