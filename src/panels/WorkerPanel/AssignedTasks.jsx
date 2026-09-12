import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { getComplaints, getThread, workerFinalize, updateComplaint } from '../../services/firestore';
import ComplaintCard from '../../components/ComplaintCard';
import ChatThread from '../../components/ChatThread';
import StatusBadge from '../../components/StatusBadge';
import ImageUploader from '../../components/ImageUploader';
import { useToast } from '../../components/Toast';
import { formatDateTime } from '../../utils/helpers';

export default function AssignedTasks() {
  const { userData } = useAuth();
  const toast = useToast();
  const [tasks, setTasks] = useState([]);
  const [selected, setSelected] = useState(null);
  const [thread, setThread] = useState([]);
  const [loading, setLoading] = useState(true);

  // Finalize form
  const [remark, setRemark] = useState('');
  const [photos, setPhotos] = useState([]);
  const [finalizing, setFinalizing] = useState(false);

  useEffect(() => { if (userData) loadTasks(); }, [userData]);

  const loadTasks = async () => {
    const c = await getComplaints({ assignedWorkerId: userData.id });
    setTasks(c);
    setLoading(false);
  };

  const openDetail = async (task) => {
    setSelected(task);
    setThread(await getThread(task.id));
    setRemark('');
    setPhotos([]);
  };

  const handleFinalize = async () => {
    if (!remark) { toast.error('Please add a remark'); return; }
    setFinalizing(true);
    try {
      await workerFinalize(selected.id, remark, photos, userData.name);
      toast.success('Task finalized!');
      setSelected(null);
      loadTasks();
    } catch (err) { toast.error(err.message); }
    setFinalizing(false);
  };

  const handleStartWork = async (task) => {
    await updateComplaint(task.id, { status: 'in_progress' });
    toast.info('Status updated to In Progress');
    loadTasks();
  };

  if (selected) {
    const canFinalize = ['worker_assigned', 'in_progress', 'resolution_declined'].includes(selected.status);

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
            <div><strong>Address:</strong> {selected.address}</div>
            <div><strong>Filed:</strong> {formatDateTime(selected.createdAt)}</div>
          </div>
          <p className="complaint-detail__desc">{selected.description}</p>
          {selected.photos?.length > 0 && (
            <div className="complaint-detail__photos">
              {selected.photos.map((p, i) => <a key={i} href={p} target="_blank" rel="noreferrer"><img src={p} alt="" /></a>)}
            </div>
          )}

          {selected.status === 'worker_assigned' && (
            <button className="btn btn--primary" onClick={() => handleStartWork(selected)} style={{ marginBottom: '1rem' }}>
              Mark as In Progress
            </button>
          )}

          {canFinalize && (
            <div className="action-card">
              <h3>Finalize Work</h3>
              <div className="form-group">
                <label>Remark / Notes</label>
                <textarea className="input textarea" value={remark} onChange={e => setRemark(e.target.value)} rows={3} placeholder="Describe the work done..." />
              </div>
              <ImageUploader onUpload={setPhotos} label="Upload Resolution Photos" />
              <button className="btn btn--success" onClick={handleFinalize} disabled={finalizing} style={{ marginTop: '1rem' }}>
                {finalizing ? 'Finalizing...' : 'Finalize from My Side'}
              </button>
            </div>
          )}

          {selected.status === 'resolution_declined' && selected.clientDeclineRemark && (
            <div className="action-card" style={{ borderLeft: '4px solid #DC2626' }}>
              <h3 style={{ color: '#DC2626' }}>Resolution Declined by Client</h3>
              <p>{selected.clientDeclineRemark}</p>
              {selected.clientDeclinePhoto && <img src={selected.clientDeclinePhoto} alt="Decline photo" style={{ maxWidth: '200px', borderRadius: '8px' }} />}
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
        <h2>Assigned Tasks</h2>
      </div>
      {loading ? (
        <div className="loading-skeleton">{[1,2,3].map(i => <div key={i} className="skeleton-card" />)}</div>
      ) : tasks.length === 0 ? (
        <div className="empty-state">
          <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="#CBD5E1" strokeWidth="1"><path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/></svg>
          <p>No tasks assigned yet</p>
        </div>
      ) : (
        <div className="complaints-grid">
          {tasks.map(t => <ComplaintCard key={t.id} complaint={t} onClick={() => openDetail(t)} />)}
        </div>
      )}
    </div>
  );
}
