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
    { label: 'Total Complaints', value: stats.total, color: '#1B4D8E' },
    { label: 'Pending', value: stats.pending, color: '#F59E0B' },
    { label: 'In Progress', value: stats.inProgress, color: '#8B5CF6' },
    { label: 'Resolved', value: stats.resolved, color: '#16A34A' },
    { label: 'Overdue', value: stats.overdue, color: '#DC2626' },
    { label: 'Workers', value: stats.workers, color: '#059669' }
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
