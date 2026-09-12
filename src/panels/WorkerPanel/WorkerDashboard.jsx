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
          <div className="stat-card__info">
            <span className="stat-card__value" style={{ color: '#1B4D8E' }}>{loading ? '—' : stats.total}</span>
            <span className="stat-card__label">Total Assigned</span>
          </div>
        </div>
        <div className="stat-card" style={{ '--card-color': '#F59E0B' }}>
          <div className="stat-card__info">
            <span className="stat-card__value" style={{ color: '#F59E0B' }}>{loading ? '—' : stats.active}</span>
            <span className="stat-card__label">Active Tasks</span>
          </div>
        </div>
        <div className="stat-card" style={{ '--card-color': '#16A34A' }}>
          <div className="stat-card__info">
            <span className="stat-card__value" style={{ color: '#16A34A' }}>{loading ? '—' : stats.completed}</span>
            <span className="stat-card__label">Completed</span>
          </div>
        </div>
      </div>
    </div>
  );
}
