import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { getComplaints, getSettings, autoResolve } from '../../services/firestore';
import { shouldAutoResolve, formatDate, getStatusBadge } from '../../utils/helpers';

export default function ClientDashboard({ onNavigate }) {
  const { userData } = useAuth();
  const [stats, setStats] = useState({ total: 0, resolved: 0, pending: 0, inProgress: 0 });
  const [recentComplaints, setRecentComplaints] = useState([]);
  const [marquee, setMarquee] = useState('');
  const [siteTitle, setSiteTitle] = useState('UP Municipal Civic Desk');
  const [loading, setLoading] = useState(true);

  useEffect(() => { loadData(); }, [userData]);

  const loadData = async () => {
    setLoading(true);
    const userId = userData?.id || userData?.uid;
    const [settings, complaints] = await Promise.all([
      getSettings(),
      userId ? getComplaints({ clientId: userId }) : Promise.resolve([])
    ]);

    if (settings) {
      setMarquee(settings.marqueeText || '');
      if (settings.siteTitle) setSiteTitle(settings.siteTitle);
    }

    if (complaints && complaints.length > 0) {
      for (const c of complaints) {
        if (c.status === 'finalized_by_worker' && shouldAutoResolve(c.workerFinalizedAt)) {
          await autoResolve(c.id, c.districtId);
        }
      }
    }

    const freshComplaints = userId ? await getComplaints({ clientId: userId }) : [];
    
    setStats({
      total: freshComplaints.length,
      resolved: freshComplaints.filter(c => c.status === 'resolved').length,
      pending: freshComplaints.filter(c => c.status === 'registered' || c.status === 'assigned').length,
      inProgress: freshComplaints.filter(c => c.status === 'in_progress' || c.status === 'finalized_by_worker').length
    });

    setRecentComplaints(freshComplaints.slice(0, 5));
    setLoading(false);
  };

  return (
    <div className="client-dashboard-page">
      {marquee && (
        <div className="marquee-bar">
          <div className="marquee-content">
            <span>📢 {marquee}</span>
            <span>📢 {marquee}</span>
          </div>
        </div>
      )}

      {/* OFFICIAL CIVIC PORTAL HEADER */}
      <div className="client-page-header">
        <div className="client-page-header__left">
          <div className="client-page-header__tag">
            <span className="civic-dot"></span>
            Uttar Pradesh Municipal Corporation • Citizen Portal
          </div>
          <h1 className="client-page-header__title">{siteTitle}</h1>
          <p className="client-page-header__user">
            Citizen Account: <strong>{userData?.name || 'Registered User'}</strong> ({userData?.email || 'Active'})
          </p>
        </div>
      </div>

      {/* TOP BUTTONS TOOLBAR - STRICT HORIZONTAL ALIGNMENT */}
      <div className="client-top-toolbar">
        <button className="toolbar-btn toolbar-btn--primary" onClick={() => onNavigate('newComplaint')}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <line x1="12" y1="5" x2="12" y2="19"/>
            <line x1="5" y1="12" x2="19" y2="12"/>
          </svg>
          <span>File New Complaint</span>
        </button>

        <button className="toolbar-btn toolbar-btn--secondary" onClick={() => onNavigate('myComplaints')}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
            <polyline points="14 2 14 8 20 8"/>
            <line x1="16" y1="13" x2="8" y2="13"/>
            <line x1="16" y1="17" x2="8" y2="17"/>
          </svg>
          <span>My Complaints ({loading ? '...' : stats.total})</span>
        </button>

        <button className="toolbar-btn toolbar-btn--secondary" onClick={() => onNavigate('leaderboard')}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"/>
            <path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"/>
            <path d="M4 22h16"/>
            <path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22"/>
            <path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22"/>
            <path d="M18 2H6v7a6 6 0 0 0 12 0V2Z"/>
          </svg>
          <span>Honor Leaderboard</span>
        </button>

        <button className="toolbar-btn toolbar-btn--ghost" onClick={loadData} title="Refresh Dashboard Data">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M21.5 2v6h-6M2.5 22v-6h6"/>
            <path d="M2 11.5a10 10 0 0 1 18.8-4.3L21.5 8M2.5 16l1.2 1.8a10 10 0 0 0 18.8-4.3"/>
          </svg>
          <span>Refresh</span>
        </button>
      </div>

      {/* 2 CARDS PER ROW GRID */}
      <div className="client-grid-2col">
        {/* Card 1: Total Complaints */}
        <div className="client-card client-card--navy" onClick={() => onNavigate('myComplaints')}>
          <div className="client-card__top">
            <div className="client-card__icon client-card__icon--navy">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                <polyline points="14 2 14 8 20 8"/>
              </svg>
            </div>
            <div className="client-card__stat-wrap">
              <span className="client-card__number">{loading ? '—' : stats.total}</span>
              <span className="client-card__tag client-card__tag--navy">Total Filed</span>
            </div>
          </div>
          <div className="client-card__bottom">
            <div className="client-card__title">Total Grievances Submitted</div>
            <div className="client-card__sub">Click to view complete complaint history</div>
          </div>
        </div>

        {/* Card 2: Resolved Complaints */}
        <div className="client-card client-card--green" onClick={() => onNavigate('myComplaints')}>
          <div className="client-card__top">
            <div className="client-card__icon client-card__icon--green">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
                <polyline points="22 4 12 14.01 9 11.01"/>
              </svg>
            </div>
            <div className="client-card__stat-wrap">
              <span className="client-card__number text-success">{loading ? '—' : stats.resolved}</span>
              <span className="client-card__tag client-card__tag--green">
                {stats.total > 0 ? `${Math.round((stats.resolved / stats.total) * 100)}% Resolved` : '100% Resolved'}
              </span>
            </div>
          </div>
          <div className="client-card__bottom">
            <div className="client-card__title">Resolved Issues</div>
            <div className="client-card__sub">Successfully addressed & verified by municipal workers</div>
          </div>
        </div>

        {/* Card 3: Pending & In Progress */}
        <div className="client-card client-card--amber" onClick={() => onNavigate('myComplaints')}>
          <div className="client-card__top">
            <div className="client-card__icon client-card__icon--amber">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10"/>
                <polyline points="12 6 12 12 16 14"/>
              </svg>
            </div>
            <div className="client-card__stat-wrap">
              <span className="client-card__number text-warning">{loading ? '—' : stats.pending + stats.inProgress}</span>
              <span className="client-card__tag client-card__tag--amber">
                {stats.inProgress > 0 ? `${stats.inProgress} In Progress` : 'Pending Action'}
              </span>
            </div>
          </div>
          <div className="client-card__bottom">
            <div className="client-card__title">Pending & Active Issues</div>
            <div className="client-card__sub">Currently undergoing municipal inspection and repair</div>
          </div>
        </div>

        {/* Card 4: Leaderboard & Honor Status */}
        <div className="client-card client-card--purple" onClick={() => onNavigate('leaderboard')}>
          <div className="client-card__top">
            <div className="client-card__icon client-card__icon--purple">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
              </svg>
            </div>
            <div className="client-card__stat-wrap">
              <span className="client-card__number" style={{ color: '#7C3AED', fontSize: '1.4rem' }}>
                {stats.resolved >= 5 ? 'Master Citizen' : stats.resolved >= 2 ? 'Active Contributor' : 'Civic Hero'}
              </span>
              <span className="client-card__tag client-card__tag--purple">District Standing</span>
            </div>
          </div>
          <div className="client-card__bottom">
            <div className="client-card__title">Honor Leaderboard</div>
            <div className="client-card__sub">Click to view top performing municipal districts</div>
          </div>
        </div>
      </div>

      {/* RECENT COMPLAINTS TABLE */}
      <div className="client-section">
        <div className="client-section__header">
          <div>
            <h2 className="client-section__title">My Recent Complaints</h2>
            <p className="client-section__sub">Track the real-time status of your recently reported civic issues</p>
          </div>
          {recentComplaints.length > 0 && (
            <button className="btn btn--outline btn--sm" onClick={() => onNavigate('myComplaints')}>
              View All ({stats.total}) →
            </button>
          )}
        </div>

        {loading ? (
          <div className="loading-skeleton">
            <div className="skeleton-row"></div>
            <div className="skeleton-row"></div>
          </div>
        ) : recentComplaints.length === 0 ? (
          <div className="empty-state-box">
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" style={{ color: '#94A3B8' }}>
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
              <polyline points="14 2 14 8 20 8"/>
            </svg>
            <h3>No Complaints Registered</h3>
            <p>You haven't filed any civic grievances yet. Click below to file a new report.</p>
            <button className="toolbar-btn toolbar-btn--primary" style={{ marginTop: '0.75rem' }} onClick={() => onNavigate('newComplaint')}>
              + File First Complaint
            </button>
          </div>
        ) : (
          <div className="data-table-wrap">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Complaint ID</th>
                  <th>Category / Type</th>
                  <th>Description</th>
                  <th>Submitted On</th>
                  <th>Status</th>
                  <th className="text-center">Action</th>
                </tr>
              </thead>
              <tbody>
                {recentComplaints.map((c) => {
                  const badge = getStatusBadge(c.status);
                  return (
                    <tr key={c.id} onClick={() => onNavigate('myComplaints')} style={{ cursor: 'pointer' }}>
                      <td>
                        <strong style={{ fontFamily: 'monospace', color: 'var(--primary)' }}>
                          #{c.complaintNumber || c.id.slice(0, 8)}
                        </strong>
                      </td>
                      <td><strong>{c.type}</strong></td>
                      <td style={{ maxWidth: '300px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {c.description}
                      </td>
                      <td style={{ color: 'var(--text-secondary)' }}>{formatDate(c.createdAt)}</td>
                      <td>
                        <span className="status-badge" style={{ background: badge.bg, color: badge.color }}>
                          <span className="status-badge__pulse" style={{ background: badge.color }}></span>
                          {badge.label}
                        </span>
                      </td>
                      <td className="text-center">
                        <button className="btn btn--ghost btn--sm">View →</button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

