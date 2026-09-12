import React, { useState, useEffect } from 'react';
import { getComplaints, getThread } from '../../services/firestore';
import ComplaintCard from '../../components/ComplaintCard';
import ChatThread from '../../components/ChatThread';
import StatusBadge from '../../components/StatusBadge';
import { formatDateTime } from '../../utils/helpers';

export default function ViewComplaints() {
  const [complaints, setComplaints] = useState([]);
  const [selected, setSelected] = useState(null);
  const [thread, setThread] = useState([]);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => { loadComplaints(); }, []);

  const loadComplaints = async () => {
    setComplaints(await getComplaints());
    setLoading(false);
  };

  const openDetail = async (complaint) => {
    setSelected(complaint);
    setThread(await getThread(complaint.id));
  };

  const filtered = complaints.filter(c => {
    const matchSearch = !search || c.complaintNumber?.includes(search) || c.type?.toLowerCase().includes(search.toLowerCase()) || c.clientName?.toLowerCase().includes(search.toLowerCase());
    const matchStatus = !statusFilter || c.status === statusFilter;
    return matchSearch && matchStatus;
  });

  if (selected) {
    return (
      <div className="panel-section">
        <div className="dashboard__topbar">
          <button className="btn btn--outline btn--sm" onClick={() => setSelected(null)}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12,19 5,12 12,5"/></svg>
            &larr; Back to Complaints List
          </button>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)', fontWeight: 600 }}>ID: {selected.complaintNumber}</span>
            <StatusBadge status={selected.status} />
          </div>
        </div>

        <div className="complaint-layout-grid">
          <div className="complaint-main-panel">
            <div className="detail-card">
              <div className="detail-card__header">
                <div className="detail-card__title">
                  <h2>{selected.complaintNumber}</h2>
                  <p>{selected.type}</p>
                </div>
                <StatusBadge status={selected.status} />
              </div>

              <div className="detail-meta-grid">
                <div className="detail-meta-item">
                  <label>Type / Category</label>
                  <span>{selected.type}</span>
                </div>
                <div className="detail-meta-item">
                  <label>Complainant Name</label>
                  <span>{selected.clientName || 'Citizen'}</span>
                </div>
                <div className="detail-meta-item">
                  <label>District</label>
                  <span>{selected.districtId?.replace(/_/g, ' ').toUpperCase()}</span>
                </div>
                <div className="detail-meta-item">
                  <label>Date Filed</label>
                  <span>{formatDateTime(selected.createdAt)}</span>
                </div>
                <div className="detail-meta-item">
                  <label>Contact Phone</label>
                  <span>{selected.mobileNumber || selected.clientPhone || 'N/A'}</span>
                </div>
                <div className="detail-meta-item">
                  <label>Address</label>
                  <span>{selected.address || 'N/A'}</span>
                </div>
              </div>

              <div className="detail-description">
                <h4>Description</h4>
                <div className="detail-description-box">{selected.description}</div>
              </div>

              {selected.photos?.length > 0 && (
                <div className="detail-photos-gallery">
                  <h4>Evidence Photos</h4>
                  <div className="photos-grid">
                    {selected.photos.map((p, i) => (
                      <a key={i} href={p} target="_blank" rel="noreferrer">
                        <img src={p} alt={`Photo ${i+1}`} className="photo-thumb" />
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="detail-card">
              <div className="dashboard-section__header">
                <h3>Activity Log</h3>
              </div>
              <ChatThread thread={thread} />
            </div>
          </div>

          <div className="complaint-sidebar-panel">
            <div className="sidebar-card">
              <h4>Assigned Worker</h4>
              {selected.assignedWorkerName ? (
                <div>
                  <strong>{selected.assignedWorkerName}</strong>
                  {selected.assignedWorkerPhone && (
                    <div style={{ marginTop: '0.25rem', fontSize: '0.85rem', color: 'var(--primary)' }}>
                      Phone: {selected.assignedWorkerPhone}
                    </div>
                  )}
                </div>
              ) : (
                <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>No worker assigned yet.</span>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="panel-section">
      <div className="panel-section__header">
        <h2>All System Complaints</h2>
        <div className="panel-section__filters">
          <div className="search-box">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
            <input placeholder="Search..." value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          <select className="input input--sm" value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
            <option value="">All Status</option>
            <option value="new">New</option>
            <option value="admin_replied">Admin Replied</option>
            <option value="worker_assigned">Worker Assigned</option>
            <option value="in_progress">In Progress</option>
            <option value="finalized_by_worker">Finalized</option>
            <option value="resolved">Resolved</option>
            <option value="resolution_declined">Declined</option>
          </select>
        </div>
      </div>
      {loading ? (
        <div className="loading-skeleton">{[1,2,3].map(i => <div key={i} className="skeleton-card" />)}</div>
      ) : filtered.length === 0 ? (
        <div className="empty-state">
          <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="#CBD5E1" strokeWidth="1"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14,2 14,8 20,8"/></svg>
          <p>No complaints found</p>
        </div>
      ) : (
        <div className="complaints-grid">
          {filtered.map(c => <ComplaintCard key={c.id} complaint={c} onClick={() => openDetail(c)} />)}
        </div>
      )}
    </div>
  );
}
