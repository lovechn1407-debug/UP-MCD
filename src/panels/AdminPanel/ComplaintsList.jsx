import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { getComplaints, getThread, adminReplyToComplaint, assignWorker, getWorkersByAdmin } from '../../services/firestore';
import ComplaintCard from '../../components/ComplaintCard';
import ChatThread from '../../components/ChatThread';
import StatusBadge from '../../components/StatusBadge';
import { useToast } from '../../components/Toast';
import { formatDateTime } from '../../utils/helpers';
import { MAX_RESOLUTION_DAYS } from '../../utils/constants';

export default function ComplaintsList() {
  const { userData } = useAuth();
  const toast = useToast();
  const [complaints, setComplaints] = useState([]);
  const [selected, setSelected] = useState(null);
  const [thread, setThread] = useState([]);
  const [workers, setWorkers] = useState([]);
  const [statusFilter, setStatusFilter] = useState('');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  // Reply form
  const [replyText, setReplyText] = useState('');
  const [expectedDays, setExpectedDays] = useState(7);
  const [replying, setReplying] = useState(false);

  // Assign form
  const [selectedWorkerId, setSelectedWorkerId] = useState('');
  const [assigning, setAssigning] = useState(false);

  useEffect(() => {
    if (userData?.districtId) loadData();
  }, [userData]);

  const loadData = async () => {
    const [c, w] = await Promise.all([
      getComplaints({ districtId: userData.districtId }),
      getWorkersByAdmin(userData.districtId)
    ]);
    setComplaints(c);
    setWorkers(w);
    setLoading(false);
  };

  const openDetail = async (complaint) => {
    setSelected(complaint);
    setThread(await getThread(complaint.id));
    setReplyText('');
    setSelectedWorkerId('');
  };

  const handleReply = async () => {
    if (!replyText) { toast.error('Enter a reply message'); return; }
    setReplying(true);
    try {
      await adminReplyToComplaint(selected.id, replyText, expectedDays, userData.name);
      toast.success('Reply sent!');
      openDetail({ ...selected, status: 'admin_replied' });
      loadData();
    } catch (err) { toast.error(err.message); }
    setReplying(false);
  };

  const handleAssign = async () => {
    if (!selectedWorkerId) { toast.error('Select a worker'); return; }
    setAssigning(true);
    try {
      const worker = workers.find(w => w.id === selectedWorkerId);
      await assignWorker(selected.id, worker, userData.name);
      toast.success('Worker assigned!');
      openDetail({ ...selected, status: 'worker_assigned' });
      loadData();
    } catch (err) { toast.error(err.message); }
    setAssigning(false);
  };

  const filtered = complaints.filter(c => {
    const matchSearch = !search || c.complaintNumber?.includes(search) || c.type?.toLowerCase().includes(search.toLowerCase());
    const matchStatus = !statusFilter || c.status === statusFilter;
    return matchSearch && matchStatus;
  });

  if (selected) {
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
            <div><strong>Client:</strong> {selected.clientName}</div>
            <div><strong>Filed:</strong> {formatDateTime(selected.createdAt)}</div>
            <div><strong>Address:</strong> {selected.address}</div>
            <div><strong>Phone:</strong> {selected.mobileNumber || selected.clientPhone}</div>
          </div>
          <p className="complaint-detail__desc">{selected.description}</p>
          {selected.photos?.length > 0 && (
            <div className="complaint-detail__photos">
              {selected.photos.map((p, i) => <a key={i} href={p} target="_blank" rel="noreferrer"><img src={p} alt="" /></a>)}
            </div>
          )}

          {/* Reply Section */}
          {['new', 'resolution_declined'].includes(selected.status) && (
            <div className="action-card">
              <h3>Reply to Complaint</h3>
              <div className="form-group">
                <label>Your Reply</label>
                <textarea className="input textarea" value={replyText} onChange={e => setReplyText(e.target.value)} rows={3} placeholder="Type your response..." />
              </div>
              <div className="form-group">
                <label>Expected Resolution (days)</label>
                <select className="input" value={expectedDays} onChange={e => setExpectedDays(Number(e.target.value))}>
                  {Array.from({ length: MAX_RESOLUTION_DAYS }, (_, i) => i + 1).map(d => (
                    <option key={d} value={d}>{d} day{d > 1 ? 's' : ''}</option>
                  ))}
                </select>
              </div>
              <button className="btn btn--primary" onClick={handleReply} disabled={replying}>
                {replying ? 'Sending...' : 'Send Reply'}
              </button>
            </div>
          )}

          {/* Assign Worker Section */}
          {['admin_replied', 'resolution_declined'].includes(selected.status) && (
            <div className="action-card">
              <h3>Assign Worker</h3>
              <div className="form-group">
                <label>Select Worker</label>
                <select className="input" value={selectedWorkerId} onChange={e => setSelectedWorkerId(e.target.value)}>
                  <option value="">Choose a worker...</option>
                  {workers.map(w => <option key={w.id} value={w.id}>{w.name} ({w.phone})</option>)}
                </select>
              </div>
              <button className="btn btn--primary" onClick={handleAssign} disabled={assigning}>
                {assigning ? 'Assigning...' : 'Assign Worker'}
              </button>
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
        <h2>District Complaints</h2>
        <div className="panel-section__filters">
          <div className="search-box">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
            <input placeholder="Search..." value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          <select className="input input--sm" value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
            <option value="">All</option>
            <option value="new">New</option>
            <option value="admin_replied">Replied</option>
            <option value="worker_assigned">Assigned</option>
            <option value="finalized_by_worker">Finalized</option>
            <option value="resolved">Resolved</option>
            <option value="resolution_declined">Declined</option>
          </select>
        </div>
      </div>
      {loading ? (
        <div className="loading-skeleton">{[1,2,3].map(i => <div key={i} className="skeleton-card" />)}</div>
      ) : (
        <div className="complaints-grid">
          {filtered.map(c => <ComplaintCard key={c.id} complaint={c} onClick={() => openDetail(c)} />)}
          {filtered.length === 0 && <div className="empty-state"><p>No complaints found</p></div>}
        </div>
      )}
    </div>
  );
}
