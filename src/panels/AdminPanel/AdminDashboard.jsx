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
    { label: 'Total Complaints', value: stats.total, color: '#2563EB', icon: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14,2 14,8 20,8"/></svg> },
    { label: 'Pending', value: stats.pending, color: '#F59E0B', icon: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><polyline points="12,6 12,12 16,14"/></svg> },
    { label: 'In Progress', value: stats.inProgress, color: '#8B5CF6', icon: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="23,6 13.5,15.5 8.5,10.5 1,18"/><polyline points="17,6 23,6 23,12"/></svg> },
    { label: 'Resolved', value: stats.resolved, color: '#10B981', icon: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22,4 12,14.01 9,11.01"/></svg> },
    { label: 'Overdue', value: stats.overdue, color: '#EF4444', icon: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg> },
    { label: 'Workers', value: stats.workers, color: '#06B6D4', icon: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/></svg> }
  ];

  return (
    <div className="dashboard">
      <div className="dashboard__header">
        <h1>Admin Dashboard</h1>
        <p>District: <strong>{userData?.districtId?.replace(/_/g, ' ')}</strong></p>
      </div>
      <div className="stats-grid stats-grid--3">
        {cards.map((c, i) => (
          <div key={i} className="stat-card" style={{ '--card-color': c.color }}>
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
