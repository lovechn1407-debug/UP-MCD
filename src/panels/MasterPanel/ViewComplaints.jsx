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
        <button className="btn btn--ghost" onClick={() => setSelected(null)}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12,19 5,12 12,5"/></svg>
          Back to list
        </button>
        <div className="complaint-detail">
          <div className="complaint-detail__header">
            <h2>{selected.complaintNumber}</h2>
            <StatusBadge status={selected.status} />
          </div>
          <div className="complaint-detail__grid">
            <div><strong>Type:</strong> {selected.type}</div>
            <div><strong>Client:</strong> {selected.clientName}</div>
            <div><strong>District:</strong> {selected.districtId}</div>
            <div><strong>Filed:</strong> {formatDateTime(selected.createdAt)}</div>
            <div><strong>Address:</strong> {selected.address}</div>
            <div><strong>Phone:</strong> {selected.mobileNumber || selected.clientPhone}</div>
          </div>
          <p className="complaint-detail__desc">{selected.description}</p>
          {selected.photos?.length > 0 && (
            <div className="complaint-detail__photos">
              {selected.photos.map((p, i) => <a key={i} href={p} target="_blank" rel="noreferrer"><img src={p} alt={`Photo ${i+1}`} /></a>)}
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
      <div className="panel-section__header">
        <h2>All Complaints</h2>
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
