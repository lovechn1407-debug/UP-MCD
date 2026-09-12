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

  // Decline form state
  const [showDecline, setShowDecline] = useState(false);
  const [declineRemark, setDeclineRemark] = useState('');
  const [declinePhoto, setDeclinePhoto] = useState('');
  const [processing, setProcessing] = useState(false);

  useEffect(() => { if (userData) loadComplaints(); }, [userData]);

  const loadComplaints = async () => {
    const c = await getComplaints({ clientId: userData.id });
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
        {/* Top Header Bar */}
        <div className="dashboard__topbar">
          <button className="btn btn--outline btn--sm" onClick={() => setSelected(null)}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12,19 5,12 12,5"/></svg>
            &larr; Back to Complaints
          </button>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)', fontWeight: 600 }}>ID: {selected.complaintNumber}</span>
            <StatusBadge status={selected.status} />
          </div>
        </div>

        {/* 2-Column Productive CRM Grid */}
        <div className="complaint-layout-grid">
          {/* Main Left Area */}
          <div className="complaint-main-panel">
            <div className="detail-card">
              <div className="detail-card__header">
                <div className="detail-card__title">
                  <h2>{selected.complaintNumber}</h2>
                  <p>{selected.type}</p>
                </div>
                <StatusBadge status={selected.status} />
              </div>

              {/* Metadata Grid */}
              <div className="detail-meta-grid">
                <div className="detail-meta-item">
                  <label>Category</label>
                  <span>{selected.type}</span>
                </div>
                <div className="detail-meta-item">
                  <label>Date Filed</label>
                  <span>{formatDateTime(selected.createdAt)}</span>
                </div>
                <div className="detail-meta-item">
                  <label>District</label>
                  <span>{selected.districtId?.replace(/_/g, ' ').toUpperCase()}</span>
                </div>
                <div className="detail-meta-item">
                  <label>Address / Location</label>
                  <span>{selected.address || 'Location provided'}</span>
                </div>
              </div>

              {/* Description */}
              <div className="detail-description">
                <h4>Issue Details & Description</h4>
                <div className="detail-description-box">
                  {selected.description}
                </div>
              </div>

              {/* Attached Photos */}
              {selected.photos?.length > 0 && (
                <div className="detail-photos-gallery">
                  <h4>Attached Evidence Photos ({selected.photos.length})</h4>
                  <div className="photos-grid">
                    {selected.photos.map((p, i) => (
                      <a key={i} href={p} target="_blank" rel="noreferrer">
                        <img src={p} alt={`Evidence ${i+1}`} className="photo-thumb" />
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Conversation & Activity Log */}
            <div className="detail-card">
              <div className="dashboard-section__header">
                <h3>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
                  </svg>
                  Activity & Communication Timeline
                </h3>
              </div>
              <ChatThread thread={thread} />
            </div>
          </div>

          {/* Right Sidebar Area */}
          <div className="complaint-sidebar-panel">
            {/* Worker Info Card */}
            {selected.assignedWorkerName ? (
              <div className="sidebar-card">
                <h4>Assigned Municipal Worker</h4>
                <div className="worker-sidebar-info">
                  <div className="worker-sidebar-name">{selected.assignedWorkerName}</div>
                  {selected.assignedWorkerPhone && (
                    <a href={`tel:${selected.assignedWorkerPhone}`} className="btn btn--outline btn--sm btn--full" style={{ marginTop: '0.5rem' }}>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72"/>
                      </svg>
                      Call {selected.assignedWorkerPhone}
                    </a>
                  )}
                </div>
              </div>
            ) : (
              <div className="sidebar-card">
                <h4>Assignment Status</h4>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Awaiting worker assignment by district administration.</p>
              </div>
            )}

            {/* Finalization / Resolution Actions Card */}
            {isFinalized && (
              <div className="resolution-sidebar-box">
                <h4>Worker Finalized Resolution</h4>
                <p style={{ fontSize: '0.82rem', color: '#78350F' }}>The assigned worker has completed work. Please verify and confirm resolution.</p>

                {selected.workerRemark && (
                  <div style={{ background: '#FFFFFF', padding: '10px', borderRadius: '4px', border: '1px solid #FDE68A', fontSize: '0.85rem' }}>
                    <strong>Worker's Note:</strong> {selected.workerRemark}
                  </div>
                )}

                {selected.workerPhotos?.length > 0 && (
                  <div className="detail-photos-gallery">
                    <span style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', color: '#92400E' }}>Completion Photos:</span>
                    <div className="photos-grid">
                      {selected.workerPhotos.map((p, i) => (
                        <a key={i} href={p} target="_blank" rel="noreferrer">
                          <img src={p} alt={`Resolved Work ${i+1}`} className="photo-thumb" style={{ width: '70px', height: '70px' }} />
                        </a>
                      ))}
                    </div>
                  </div>
                )}

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginTop: '0.5rem' }}>
                  <button className="btn btn--success btn--full" onClick={handleResolve} disabled={processing}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20,6 9,17 4,12"/></svg>
                    Confirm Issue Resolved
                  </button>
                  <button className="btn btn--danger btn--full" onClick={() => setShowDecline(!showDecline)} disabled={processing}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                    Issue Not Resolved
                  </button>
                </div>

                {showDecline && (
                  <div style={{ marginTop: '0.75rem', background: '#FFFFFF', padding: '1rem', borderRadius: '6px', border: '1px solid #FECACA' }}>
                    <h5 style={{ fontSize: '0.85rem', color: '#B91C1C', marginBottom: '0.5rem' }}>Specify Persistent Issue</h5>
                    <div className="form-group">
                      <label>Remarks</label>
                      <textarea className="input textarea" value={declineRemark} onChange={e => setDeclineRemark(e.target.value)} rows={3} placeholder="Describe what remains incomplete..." />
                    </div>
                    <ImageUploader onUpload={(urls) => setDeclinePhoto(urls[0] || '')} multiple={false} label="Upload Current Photo" />
                    <button className="btn btn--danger btn--full" onClick={handleDecline} disabled={processing} style={{ marginTop: '0.75rem' }}>
                      {processing ? 'Submitting...' : 'Submit Decline Notification'}
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="panel-section">
      <div className="panel-section__header">
        <h2>My Filed Complaints</h2>
        <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Total: <strong>{complaints.length}</strong></div>
      </div>
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
