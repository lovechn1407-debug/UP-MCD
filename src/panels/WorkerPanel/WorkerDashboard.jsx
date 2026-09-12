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
        <div className="stat-card" style={{ '--card-color': '#1B4D8E' }}>
          <div className="stat-card__icon" style={{ backgroundColor: '#EBF2FA', color: '#1B4D8E' }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14,2 14,8 20,8"/>
            </svg>
          </div>
          <div className="stat-card__info">
            <span className="stat-card__value" style={{ color: '#1B4D8E' }}>{loading ? '—' : stats.total}</span>
            <span className="stat-card__label">Total Assigned</span>
          </div>
        </div>

        <div className="stat-card" style={{ '--card-color': '#D97706' }}>
          <div className="stat-card__icon" style={{ backgroundColor: '#FEF3C7', color: '#D97706' }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10"/><polyline points="12,6 12,12 16,14"/>
            </svg>
          </div>
          <div className="stat-card__info">
            <span className="stat-card__value" style={{ color: '#D97706' }}>{loading ? '—' : stats.active}</span>
            <span className="stat-card__label">Active Tasks</span>
          </div>
        </div>

        <div className="stat-card" style={{ '--card-color': '#16A34A' }}>
          <div className="stat-card__icon" style={{ backgroundColor: '#DCFCE7', color: '#16A34A' }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22,4 12,14.01 9,11.01"/>
            </svg>
          </div>
          <div className="stat-card__info">
            <span className="stat-card__value" style={{ color: '#16A34A' }}>{loading ? '—' : stats.completed}</span>
            <span className="stat-card__label">Completed</span>
          </div>
        </div>
      </div>
    </div>
  );
}
