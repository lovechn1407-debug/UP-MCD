import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { getComplaints, getSettings, autoResolve } from '../../services/firestore';
import { shouldAutoResolve, formatDate, getStatusBadge } from '../../utils/helpers';

export default function ClientDashboard({ onNavigate }) {
  const { userData } = useAuth();
  const [stats, setStats] = useState({ total: 0, resolved: 0, pending: 0, inProgress: 0 });
  const [recentComplaints, setRecentComplaints] = useState([]);
  const [marquee, setMarquee] = useState('');
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

    setRecentComplaints(freshComplaints.slice(0, 4));
    setLoading(false);
  };

  return (
    <div className="simple-dashboard">
      {marquee && (
        <div className="marquee-bar">
          <div className="marquee-content">
            <span>📢 {marquee}</span>
            <span>📢 {marquee}</span>
          </div>
        </div>
      )}

      {/* TOP BUTTONS BAR */}
      <div className="simple-top-bar">
        <button className="simple-btn simple-btn--primary" onClick={() => onNavigate('newComplaint')}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10"/>
            <line x1="12" y1="8" x2="12" y2="16"/>
            <line x1="8" y1="12" x2="16" y2="12"/>
          </svg>
          File New Complaint
        </button>

        <button className="simple-btn simple-btn--outline" onClick={() => onNavigate('myComplaints')}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
            <polyline points="14 2 14 8 20 8"/>
          </svg>
          My Complaints ({loading ? '...' : stats.total})
        </button>

        <button className="simple-btn simple-btn--outline" onClick={() => onNavigate('leaderboard')}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"/>
            <path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"/>
            <path d="M4 22h16"/>
            <path d="M18 2H6v7a6 6 0 0 0 12 0V2Z"/>
          </svg>
          Honor Leaderboard
        </button>
      </div>

      {/* DASHBOARD TITLE */}
      <div className="simple-header">
        <h1>Citizen Dashboard</h1>
        <p>Track your reported civic issues and resolution updates</p>
      </div>

      {/* 2 CARDS IN A ROW GRID */}
      <div className="simple-grid-2">
        <div className="simple-card" onClick={() => onNavigate('myComplaints')}>
          <div className="simple-card__header">
            <span className="simple-card__title">Total Complaints</span>
            <div className="simple-card__icon icon-blue">📋</div>
          </div>
          <div className="simple-card__value">{loading ? '—' : stats.total}</div>
          <span className="simple-card__sub">All filed grievances</span>
        </div>

        <div className="simple-card" onClick={() => onNavigate('myComplaints')}>
          <div className="simple-card__header">
            <span className="simple-card__title">Resolved Issues</span>
            <div className="simple-card__icon icon-green">✅</div>
          </div>
          <div className="simple-card__value text-success">{loading ? '—' : stats.resolved}</div>
          <span className="simple-card__sub">Completed & verified</span>
        </div>

        <div className="simple-card" onClick={() => onNavigate('myComplaints')}>
          <div className="simple-card__header">
            <span className="simple-card__title">Pending / In Progress</span>
            <div className="simple-card__icon icon-amber">⏳</div>
          </div>
          <div className="simple-card__value text-warning">{loading ? '—' : stats.pending + stats.inProgress}</div>
          <span className="simple-card__sub">Currently active</span>
        </div>

        <div className="simple-card" onClick={() => onNavigate('leaderboard')}>
          <div className="simple-card__header">
            <span className="simple-card__title">Leaderboard Standing</span>
            <div className="simple-card__icon icon-purple">🏆</div>
          </div>
          <div className="simple-card__value text-purple" style={{ fontSize: '1.4rem' }}>
            {stats.resolved >= 5 ? 'Master Citizen' : stats.resolved >= 2 ? 'Active Contributor' : 'Civic Hero'}
          </div>
          <span className="simple-card__sub">District Honor rank</span>
        </div>
      </div>

      {/* RECENT COMPLAINTS */}
      <div className="simple-section">
        <div className="simple-section__header">
          <h3>Recent Complaints</h3>
          {recentComplaints.length > 0 && (
            <button className="simple-link" onClick={() => onNavigate('myComplaints')}>
              View All ({stats.total}) →
            </button>
          )}
        </div>

        {loading ? (
          <div className="loading-skeleton">
            <div className="skeleton-row"></div>
          </div>
        ) : recentComplaints.length === 0 ? (
          <div className="simple-empty">
            <p>No complaints filed yet.</p>
            <button className="simple-btn simple-btn--primary" onClick={() => onNavigate('newComplaint')}>
              File Complaint
            </button>
          </div>
        ) : (
          <div className="simple-complaints-list">
            {recentComplaints.map((c) => {
              const badge = getStatusBadge(c.status);
              return (
                <div key={c.id} className="simple-complaint-item" onClick={() => onNavigate('myComplaints')}>
                  <div className="simple-complaint-item__info">
                    <div className="simple-complaint-item__code">#{c.complaintNumber || c.id.slice(0, 8)}</div>
                    <div className="simple-complaint-item__type">{c.type}</div>
                    <div className="simple-complaint-item__desc">{c.description}</div>
                  </div>
                  <div className="simple-complaint-item__meta">
                    <span className="status-badge" style={{ background: badge.bg, color: badge.color }}>
                      {badge.label}
                    </span>
                    <span className="simple-complaint-item__date">{formatDate(c.createdAt)}</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

