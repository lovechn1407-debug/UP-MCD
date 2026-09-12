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

      {/* Top Quick Actions Cards */}
      <div className="quick-actions-grid">
        <div className="quick-action-card quick-action-card--primary" onClick={() => onNavigate('newComplaint')}>
          <div className="quick-action-card__icon-badge">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="16"/><line x1="8" y1="12" x2="16" y2="12"/>
            </svg>
          </div>
          <div className="quick-action-card__content">
            <span className="quick-action-card__title">File New Complaint</span>
            <span className="quick-action-card__subtitle">Report a new issue in your district</span>
          </div>
          <svg className="quick-action-card__arrow" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="9 18 15 12 9 6"/>
          </svg>
        </div>

        <div className="quick-action-card quick-action-card--secondary" onClick={() => onNavigate('myComplaints')}>
          <div className="quick-action-card__icon-badge">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14,2 14,8 20,8"/>
            </svg>
          </div>
          <div className="quick-action-card__content">
            <span className="quick-action-card__title">My Complaints</span>
            <span className="quick-action-card__subtitle">View status & updates</span>
          </div>
          <svg className="quick-action-card__arrow" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="9 18 15 12 9 6"/>
          </svg>
        </div>

        <div className="quick-action-card quick-action-card--accent" onClick={() => onNavigate('leaderboard')}>
          <div className="quick-action-card__icon-badge">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"/><path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"/>
              <path d="M4 22h16"/><path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22"/>
              <path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22"/>
              <path d="M18 2H6v7a6 6 0 0 0 12 0V2Z"/>
            </svg>
          </div>
          <div className="quick-action-card__content">
            <span className="quick-action-card__title">Honor Leaderboard</span>
            <span className="quick-action-card__subtitle">District performance ranks</span>
          </div>
          <svg className="quick-action-card__arrow" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="9 18 15 12 9 6"/>
          </svg>
        </div>
      </div>

      {/* Stats Grid (2-column on mobile) */}
      <div className="stats-grid stats-grid--3">
        <div className="stat-card" onClick={() => onNavigate('myComplaints')} style={{ '--card-color': '#1B4D8E' }}>
          <div className="stat-card__icon" style={{ backgroundColor: '#EBF2FA', color: '#1B4D8E' }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14,2 14,8 20,8"/>
            </svg>
          </div>
          <div className="stat-card__info">
            <span className="stat-card__value" style={{ color: '#1B4D8E' }}>{loading ? '—' : stats.total}</span>
            <span className="stat-card__label">My Complaints</span>
          </div>
        </div>

        <div className="stat-card" onClick={() => onNavigate('myComplaints')} style={{ '--card-color': '#16A34A' }}>
          <div className="stat-card__icon" style={{ backgroundColor: '#DCFCE7', color: '#16A34A' }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22,4 12,14.01 9,11.01"/>
            </svg>
          </div>
          <div className="stat-card__info">
            <span className="stat-card__value" style={{ color: '#16A34A' }}>{loading ? '—' : stats.resolved}</span>
            <span className="stat-card__label">Resolved</span>
          </div>
        </div>

        <div className="stat-card" onClick={() => onNavigate('myComplaints')} style={{ '--card-color': '#F59E0B' }}>
          <div className="stat-card__icon" style={{ backgroundColor: '#FEF3C7', color: '#D97706' }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10"/><polyline points="12,6 12,12 16,14"/>
            </svg>
          </div>
          <div className="stat-card__info">
            <span className="stat-card__value" style={{ color: '#D97706' }}>{loading ? '—' : stats.pending}</span>
            <span className="stat-card__label">Pending</span>
          </div>
        </div>
      </div>
    </div>
  );
}
