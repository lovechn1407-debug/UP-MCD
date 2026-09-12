import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { getComplaints, getWorkersByAdmin } from '../../services/firestore';

export default function AdminDashboard({ onNavigate }) {
  const { userData } = useAuth();
  const [stats, setStats] = useState({ total: 0, pending: 0, inProgress: 0, resolved: 0, overdue: 0, workers: 0 });
  const [recent, setRecent] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (userData?.districtId) loadStats();
  }, [userData]);

  const loadStats = async () => {
    const [complaints, workers] = await Promise.all([
      getComplaints({ districtId: userData.districtId }),
      getWorkersByAdmin(userData.districtId)
    ]);
    const now = new Date();
    setStats({
      total: complaints.length,
      pending: complaints.filter(c => c.status === 'new' || c.status === 'resolution_declined').length,
      inProgress: complaints.filter(c => ['admin_replied', 'worker_assigned', 'in_progress'].includes(c.status)).length,
      resolved: complaints.filter(c => c.status === 'resolved').length,
      overdue: complaints.filter(c => {
        if (!c.expectedResolutionDate || c.status === 'resolved') return false;
        const exp = c.expectedResolutionDate.toDate ? c.expectedResolutionDate.toDate() : new Date(c.expectedResolutionDate);
        return exp < now;
      }).length,
      workers: workers.length
    });
    setRecent(complaints.slice(0, 5));
    setLoading(false);
  };

  const cards = [
    { label: 'Total Complaints', value: stats.total, color: '#1B4D8E', action: 'complaints', icon: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14,2 14,8 20,8"/></svg> },
    { label: 'Pending', value: stats.pending, color: '#D97706', action: 'complaints', icon: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><polyline points="12,6 12,12 16,14"/></svg> },
    { label: 'In Progress', value: stats.inProgress, color: '#8B5CF6', action: 'complaints', icon: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="23,6 13.5,15.5 8.5,10.5 1,18"/><polyline points="17,6 23,6 23,12"/></svg> },
    { label: 'Resolved', value: stats.resolved, color: '#16A34A', action: 'complaints', icon: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22,4 12,14.01 9,11.01"/></svg> },
    { label: 'Overdue', value: stats.overdue, color: '#DC2626', action: 'complaints', icon: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg> },
    { label: 'Workers', value: stats.workers, color: '#059669', action: 'workers', icon: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg> }
  ];

  return (
    <div className="dashboard">
      <div className="dashboard__header">
        <h1>Admin Dashboard</h1>
        <p>District: <strong style={{ textTransform: 'capitalize' }}>{userData?.districtId?.replace(/_/g, ' ')}</strong></p>
      </div>

      <div className="quick-actions-grid">
        <div className="quick-action-card quick-action-card--primary" onClick={() => onNavigate('complaints')}>
          <div className="quick-action-card__icon-badge">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14,2 14,8 20,8"/>
            </svg>
          </div>
          <div className="quick-action-card__content">
            <span className="quick-action-card__title">Manage Complaints</span>
            <span className="quick-action-card__subtitle">Assign workers & reply</span>
          </div>
          <svg className="quick-action-card__arrow" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="9 18 15 12 9 6"/>
          </svg>
        </div>

        <div className="quick-action-card quick-action-card--secondary" onClick={() => onNavigate('workers')}>
          <div className="quick-action-card__icon-badge">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="8.5" cy="7" r="4"/><line x1="20" y1="8" x2="20" y2="14"/><line x1="17" y1="11" x2="23" y2="11"/>
            </svg>
          </div>
          <div className="quick-action-card__content">
            <span className="quick-action-card__title">Manage Workers</span>
            <span className="quick-action-card__subtitle">Create & view municipal workforce</span>
          </div>
          <svg className="quick-action-card__arrow" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="9 18 15 12 9 6"/>
          </svg>
        </div>
      </div>

      <div className="stats-grid stats-grid--3">
        {cards.map((c, i) => (
          <div key={i} className="stat-card" onClick={() => onNavigate(c.action)} style={{ '--card-color': c.color }}>
            <div className="stat-card__icon" style={{ backgroundColor: `${c.color}14`, color: c.color }}>
              {c.icon}
            </div>
            <div className="stat-card__info">
              <span className="stat-card__value" style={{ color: c.color }}>{loading ? '—' : c.value}</span>
              <span className="stat-card__label">{c.label}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
