import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { getComplaints, getSettings, autoResolve } from '../../services/firestore';
import { shouldAutoResolve } from '../../utils/helpers';
import ComplaintCard from '../../components/ComplaintCard';

export default function ClientDashboard({ onNavigate }) {
  const { userData } = useAuth();
  const [stats, setStats] = useState({ total: 0, resolved: 0, pending: 0 });
  const [recentComplaints, setRecentComplaints] = useState([]);
  const [marquee, setMarquee] = useState('');
  const [siteTitle, setSiteTitle] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => { if (userData) loadData(); }, [userData]);

  const loadData = async () => {
    const [settings, complaints] = await Promise.all([
      getSettings(),
      userData ? getComplaints({ clientId: userData.id }) : Promise.resolve([])
    ]);

    if (settings) {
      setMarquee(settings.marqueeText || '');
      setSiteTitle(settings.siteTitle || 'UP Municipal Civic Desk');
    }

    // Auto-resolve check
    for (const c of complaints) {
      if (c.status === 'finalized_by_worker' && shouldAutoResolve(c.workerFinalizedAt)) {
        await autoResolve(c.id, c.districtId);
      }
    }

    const freshComplaints = userData ? await getComplaints({ clientId: userData.id }) : [];
    setStats({
      total: freshComplaints.length,
      resolved: freshComplaints.filter(c => c.status === 'resolved').length,
      pending: freshComplaints.filter(c => c.status !== 'resolved').length
    });
    setRecentComplaints(freshComplaints.slice(0, 4));
    setLoading(false);
  };

  return (
    <div className="dashboard">
      {marquee && (
        <div className="marquee-bar">
          <div className="marquee-content">
            <span>{marquee}</span>
            <span>{marquee}</span>
          </div>
        </div>
      )}

      {/* Top Header Toolbar */}
      <div className="dashboard__topbar">
        <div className="dashboard__header">
          <h1>Welcome, {userData?.name || 'Citizen'}</h1>
          <p>Report and track municipal civic issues in your district.</p>
        </div>

        <div className="dashboard__actions">
          <button className="btn btn--primary btn--lg btn--full" onClick={() => onNavigate('newComplaint')}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
            </svg>
            File New Complaint
          </button>

          <div className="dashboard__actions-secondary">
            <button className="btn btn--outline btn--full" onClick={() => onNavigate('myComplaints')}>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14,2 14,8 20,8"/>
              </svg>
              My Complaints
            </button>
            <button className="btn btn--outline btn--full" onClick={() => onNavigate('leaderboard')}>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M18 2H6v7a6 6 0 0 0 12 0V2Z"/><path d="M4 22h16"/>
              </svg>
              Leaderboard
            </button>
          </div>
        </div>
      </div>

      {/* 2-Column Responsive Metric Grid (1 top + 2 bottom on mobile) */}
      <div className="stats-grid stats-grid--3">
        <div className="stat-card" style={{ '--card-color': '#1E40AF' }} onClick={() => onNavigate('myComplaints')}>
          <div className="stat-card__icon" style={{ backgroundColor: '#EFF6FF', color: '#1E40AF' }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14,2 14,8 20,8"/>
            </svg>
          </div>
          <div className="stat-card__info">
            <span className="stat-card__value" style={{ color: '#1E40AF' }}>{loading ? '—' : stats.total}</span>
            <span className="stat-card__label">Total Filed</span>
          </div>
        </div>

        <div className="stat-card" style={{ '--card-color': '#16A34A' }} onClick={() => onNavigate('myComplaints')}>
          <div className="stat-card__icon" style={{ backgroundColor: '#F0FDF4', color: '#16A34A' }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22,4 12,14.01 9,11.01"/>
            </svg>
          </div>
          <div className="stat-card__info">
            <span className="stat-card__value" style={{ color: '#16A34A' }}>{loading ? '—' : stats.resolved}</span>
            <span className="stat-card__label">Resolved Issues</span>
          </div>
        </div>

        <div className="stat-card" style={{ '--card-color': '#D97706' }} onClick={() => onNavigate('myComplaints')}>
          <div className="stat-card__icon" style={{ backgroundColor: '#FFFBEB', color: '#D97706' }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <circle cx="12" cy="12" r="10"/><polyline points="12,6 12,12 16,14"/>
            </svg>
          </div>
          <div className="stat-card__info">
            <span className="stat-card__value" style={{ color: '#D97706' }}>{loading ? '—' : stats.pending}</span>
            <span className="stat-card__label">Pending Action</span>
          </div>
        </div>
      </div>

      {/* Quick Overview Section */}
      <div className="dashboard-section">
        <div className="dashboard-section__header">
          <h3>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 8v4l3 3"/><circle cx="12" cy="12" r="10"/>
            </svg>
            Recent Complaints Overview
          </h3>
          {recentComplaints.length > 0 && (
            <button className="btn btn--ghost btn--sm" onClick={() => onNavigate('myComplaints')}>
              View All ({stats.total}) &rarr;
            </button>
          )}
        </div>

        {loading ? (
          <div className="loading-skeleton"><div className="skeleton-card" /></div>
        ) : recentComplaints.length === 0 ? (
          <div className="empty-state">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#94A3B8" strokeWidth="1.5">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14,2 14,8 20,8"/>
            </svg>
            <p style={{ marginTop: '0.5rem' }}>No complaints filed yet. Click "File New Complaint" above to report a civic issue.</p>
          </div>
        ) : (
          <div className="complaints-grid">
            {recentComplaints.map(c => (
              <ComplaintCard key={c.id} complaint={c} onClick={() => onNavigate('myComplaints')} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
