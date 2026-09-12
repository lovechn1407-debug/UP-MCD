import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { getComplaints } from '../../services/firestore';

export default function WorkerDashboard() {
  const { userData } = useAuth();
  const [stats, setStats] = useState({ total: 0, active: 0, completed: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (userData) loadStats();
  }, [userData]);

  const loadStats = async () => {
    const complaints = await getComplaints({ assignedWorkerId: userData.id });
    setStats({
      total: complaints.length,
      active: complaints.filter(c => ['worker_assigned', 'in_progress', 'resolution_declined'].includes(c.status)).length,
      completed: complaints.filter(c => ['finalized_by_worker', 'resolved'].includes(c.status)).length
    });
    setLoading(false);
  };

  return (
    <div className="dashboard">
      <div className="dashboard__header">
        <h1>Worker Dashboard</h1>
        <p>Welcome, <strong>{userData?.name}</strong></p>
      </div>
      <div className="stats-grid stats-grid--3">
        <div className="stat-card" style={{ '--card-color': '#2563EB' }}>
          <div className="stat-card__icon" style={{ background: '#EFF6FF', color: '#2563EB' }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/></svg>
          </div>
          <div className="stat-card__info">
            <span className="stat-card__value" style={{ color: '#2563EB' }}>{loading ? '—' : stats.total}</span>
            <span className="stat-card__label">Total Assigned</span>
          </div>
        </div>
        <div className="stat-card" style={{ '--card-color': '#F59E0B' }}>
          <div className="stat-card__icon" style={{ background: '#FFFBEB', color: '#F59E0B' }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><polyline points="12,6 12,12 16,14"/></svg>
          </div>
          <div className="stat-card__info">
            <span className="stat-card__value" style={{ color: '#F59E0B' }}>{loading ? '—' : stats.active}</span>
            <span className="stat-card__label">Active Tasks</span>
          </div>
        </div>
        <div className="stat-card" style={{ '--card-color': '#10B981' }}>
          <div className="stat-card__icon" style={{ background: '#ECFDF5', color: '#10B981' }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22,4 12,14.01 9,11.01"/></svg>
          </div>
          <div className="stat-card__info">
            <span className="stat-card__value" style={{ color: '#10B981' }}>{loading ? '—' : stats.completed}</span>
            <span className="stat-card__label">Completed</span>
          </div>
        </div>
      </div>
    </div>
  );
}
