import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { getComplaints, getSettings, autoResolve } from '../../services/firestore';
import { shouldAutoResolve } from '../../utils/helpers';

export default function ClientDashboard({ onNavigate }) {
  const { userData } = useAuth();
  const [stats, setStats] = useState({ total: 0, resolved: 0, pending: 0 });
  const [marquee, setMarquee] = useState('');
  const [siteTitle, setSiteTitle] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => { loadData(); }, [userData]);

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

      <div className="dashboard__header">
        <h1>Welcome to {siteTitle}</h1>
        <p>Hello, <strong>{userData?.name}</strong>! Report and track civic issues in your district.</p>
      </div>

      <div className="stats-grid stats-grid--3">
        <div className="stat-card" style={{ '--card-color': '#2563EB' }}>
          <div className="stat-card__icon" style={{ background: '#EFF6FF', color: '#2563EB' }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14,2 14,8 20,8"/>
            </svg>
          </div>
          <div className="stat-card__info">
            <span className="stat-card__value" style={{ color: '#2563EB' }}>{loading ? '—' : stats.total}</span>
            <span className="stat-card__label">My Complaints</span>
          </div>
        </div>
        <div className="stat-card" style={{ '--card-color': '#10B981' }}>
          <div className="stat-card__icon" style={{ background: '#ECFDF5', color: '#10B981' }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22,4 12,14.01 9,11.01"/>
            </svg>
          </div>
          <div className="stat-card__info">
            <span className="stat-card__value" style={{ color: '#10B981' }}>{loading ? '—' : stats.resolved}</span>
            <span className="stat-card__label">Resolved</span>
          </div>
        </div>
        <div className="stat-card" style={{ '--card-color': '#F59E0B' }}>
          <div className="stat-card__icon" style={{ background: '#FFFBEB', color: '#F59E0B' }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10"/><polyline points="12,6 12,12 16,14"/>
            </svg>
          </div>
          <div className="stat-card__info">
            <span className="stat-card__value" style={{ color: '#F59E0B' }}>{loading ? '—' : stats.pending}</span>
            <span className="stat-card__label">Pending</span>
          </div>
        </div>
      </div>

      <div className="dashboard__actions">
        <button className="btn btn--primary btn--lg" onClick={() => onNavigate('newComplaint')}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="16"/><line x1="8" y1="12" x2="16" y2="12"/>
          </svg>
          File New Complaint
        </button>
        <button className="btn btn--outline btn--lg" onClick={() => onNavigate('myComplaints')}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14,2 14,8 20,8"/>
          </svg>
          My Complaints
        </button>
        <button className="btn btn--outline btn--lg" onClick={() => onNavigate('leaderboard')}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M18 2H6v7a6 6 0 0 0 12 0V2Z"/><path d="M4 22h16"/>
          </svg>
          Honor Leaderboard
        </button>
      </div>
    </div>
  );
}
