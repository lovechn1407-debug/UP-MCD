import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { getComplaints, getSettings, autoResolve } from '../../services/firestore';
import { shouldAutoResolve, formatDate, getStatusBadge } from '../../utils/helpers';

export default function ClientDashboard({ onNavigate }) {
  const { userData } = useAuth();
  const [stats, setStats] = useState({ total: 0, resolved: 0, pending: 0, inProgress: 0 });
  const [recentComplaints, setRecentComplaints] = useState([]);
  const [marquee, setMarquee] = useState('');
  const [siteTitle, setSiteTitle] = useState('');
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
      setSiteTitle(settings.siteTitle || 'UP Municipal Civic Desk');
    }

    // Auto-resolve check for worker-finalized items
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
    <div className="client-dashboard">
      {marquee && (
        <div className="marquee-bar">
          <div className="marquee-content">
            <span>📢 {marquee}</span>
            <span>📢 {marquee}</span>
          </div>
        </div>
      )}

      {/* TOP HEADER & ACTION BUTTONS BAR */}
      <div className="client-hero">
        <div className="client-hero__content">
          <div className="client-hero__badge">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/>
              <circle cx="12" cy="10" r="3"/>
            </svg>
            Citizen Civic Portal • UP Municipal
          </div>
          <h1>Welcome, {userData?.name || 'Valued Citizen'}</h1>
          <p>Report issues, track live resolution status, and contribute to a cleaner, safer city.</p>
        </div>

        {/* TOP BUTTONS - PROMINENTLY PLACED AT THE TOP */}
        <div className="client-hero__actions">
          <button className="btn btn--hero-primary" onClick={() => onNavigate('newComplaint')}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <circle cx="12" cy="12" r="10"/>
              <line x1="12" y1="8" x2="12" y2="16"/>
              <line x1="8" y1="12" x2="16" y2="12"/>
            </svg>
            <span>File New Complaint</span>
          </button>

          <button className="btn btn--hero-secondary" onClick={() => onNavigate('myComplaints')}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
              <polyline points="14 2 14 8 20 8"/>
              <line x1="16" y1="13" x2="8" y2="13"/>
              <line x1="16" y1="17" x2="8" y2="17"/>
            </svg>
            <span>My Complaints ({loading ? '...' : stats.total})</span>
          </button>

          <button className="btn btn--hero-accent" onClick={() => onNavigate('leaderboard')}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"/>
              <path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"/>
              <path d="M4 22h16"/>
              <path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22"/>
              <path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22"/>
              <path d="M18 2H6v7a6 6 0 0 0 12 0V2Z"/>
            </svg>
            <span>Honor Leaderboard</span>
          </button>
        </div>
      </div>

      {/* 2 CARDS IN A ROW LAYOUT */}
      <div className="client-dashboard__section">
        <div className="section-title-wrap">
          <h2>Overview & Impact</h2>
          <span className="section-subtitle">Real-time status of your submitted grievances</span>
        </div>

        <div className="stats-grid stats-grid--2">
          {/* Card 1: Total Complaints */}
          <div 
            className="stat-card stat-card--client" 
            style={{ '--card-accent': '#1B4D8E', '--card-bg-gradient': 'linear-gradient(135deg, rgba(27,77,142,0.08) 0%, rgba(27,77,142,0.02) 100%)' }}
            onClick={() => onNavigate('myComplaints')}
          >
            <div className="stat-card__icon-box" style={{ background: '#EBF2FA', color: '#1B4D8E' }}>
              <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                <polyline points="14 2 14 8 20 8"/>
                <line x1="16" y1="13" x2="8" y2="13"/>
                <line x1="16" y1="17" x2="8" y2="17"/>
              </svg>
            </div>
            <div className="stat-card__content">
              <div className="stat-card__value-row">
                <span className="stat-card__value" style={{ color: '#1B4D8E' }}>{loading ? '—' : stats.total}</span>
                <span className="stat-card__badge stat-card__badge--blue">Total Filed</span>
              </div>
              <span className="stat-card__title">Total Complaints</span>
              <p className="stat-card__desc">Total civic issues submitted by your account</p>
            </div>
            <div className="stat-card__arrow">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="9 18 15 12 9 6"/></svg>
            </div>
          </div>

          {/* Card 2: Resolved */}
          <div 
            className="stat-card stat-card--client" 
            style={{ '--card-accent': '#16A34A', '--card-bg-gradient': 'linear-gradient(135deg, rgba(22,163,74,0.08) 0%, rgba(22,163,74,0.02) 100%)' }}
            onClick={() => onNavigate('myComplaints')}
          >
            <div className="stat-card__icon-box" style={{ background: '#DCFCE7', color: '#16A34A' }}>
              <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
                <polyline points="22 4 12 14.01 9 11.01"/>
              </svg>
            </div>
            <div className="stat-card__content">
              <div className="stat-card__value-row">
                <span className="stat-card__value" style={{ color: '#16A34A' }}>{loading ? '—' : stats.resolved}</span>
                <span className="stat-card__badge stat-card__badge--green">
                  {stats.total > 0 ? `${Math.round((stats.resolved / stats.total) * 100)}% Fixed` : '100% Rate'}
                </span>
              </div>
              <span className="stat-card__title">Resolved Issues</span>
              <p className="stat-card__desc">Grievances successfully verified and closed</p>
            </div>
            <div className="stat-card__arrow">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="9 18 15 12 9 6"/></svg>
            </div>
          </div>

          {/* Card 3: Pending / In Progress */}
          <div 
            className="stat-card stat-card--client" 
            style={{ '--card-accent': '#F59E0B', '--card-bg-gradient': 'linear-gradient(135deg, rgba(245,158,11,0.08) 0%, rgba(245,158,11,0.02) 100%)' }}
            onClick={() => onNavigate('myComplaints')}
          >
            <div className="stat-card__icon-box" style={{ background: '#FEF3C7', color: '#D97706' }}>
              <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10"/>
                <polyline points="12 6 12 12 16 14"/>
              </svg>
            </div>
            <div className="stat-card__content">
              <div className="stat-card__value-row">
                <span className="stat-card__value" style={{ color: '#D97706' }}>{loading ? '—' : stats.pending + stats.inProgress}</span>
                <span className="stat-card__badge stat-card__badge--amber">
                  {stats.inProgress > 0 ? `${stats.inProgress} Active` : 'Action Required'}
                </span>
              </div>
              <span className="stat-card__title">Pending & In Progress</span>
              <p className="stat-card__desc">Under municipal worker inspection or resolution</p>
            </div>
            <div className="stat-card__arrow">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="9 18 15 12 9 6"/></svg>
            </div>
          </div>

          {/* Card 4: Honor & Citizen Rank */}
          <div 
            className="stat-card stat-card--client" 
            style={{ '--card-accent': '#8B5CF6', '--card-bg-gradient': 'linear-gradient(135deg, rgba(139,92,246,0.08) 0%, rgba(139,92,246,0.02) 100%)' }}
            onClick={() => onNavigate('leaderboard')}
          >
            <div className="stat-card__icon-box" style={{ background: '#F3E8FF', color: '#8B5CF6' }}>
              <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
              </svg>
            </div>
            <div className="stat-card__content">
              <div className="stat-card__value-row">
                <span className="stat-card__value" style={{ color: '#8B5CF6' }}>
                  {stats.resolved >= 5 ? 'Master Citizen' : stats.resolved >= 2 ? 'Active Contributor' : 'Civic Hero'}
                </span>
                <span className="stat-card__badge stat-card__badge--purple">Honor Rank</span>
              </div>
              <span className="stat-card__title">District Standings</span>
              <p className="stat-card__desc">Click to view top performing municipal wards</p>
            </div>
            <div className="stat-card__arrow">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="9 18 15 12 9 6"/></svg>
            </div>
          </div>
        </div>
      </div>

      {/* RECENT ACTIVITY SECTION */}
      <div className="client-dashboard__section" style={{ marginTop: '2rem' }}>
        <div className="section-title-wrap" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h2>Recent Complaints</h2>
            <span className="section-subtitle">Quick overview of your latest reported issues</span>
          </div>
          {recentComplaints.length > 0 && (
            <button className="btn btn--outline btn--sm" onClick={() => onNavigate('myComplaints')}>
              View All Complaints ({stats.total})
            </button>
          )}
        </div>

        {loading ? (
          <div className="loading-skeleton">
            <div className="skeleton-card"></div>
            <div className="skeleton-card"></div>
          </div>
        ) : recentComplaints.length === 0 ? (
          <div className="empty-state-card">
            <div className="empty-state-card__icon">📋</div>
            <h3>No Complaints Filed Yet</h3>
            <p>Spotted a civic issue like damaged roads, streetlights, or waste management? File a report now!</p>
            <button className="btn btn--primary" style={{ marginTop: '1rem' }} onClick={() => onNavigate('newComplaint')}>
              + File First Complaint
            </button>
          </div>
        ) : (
          <div className="recent-complaints-list">
            {recentComplaints.map((c) => {
              const badge = getStatusBadge(c.status);
              return (
                <div key={c.id} className="recent-complaint-item" onClick={() => onNavigate('myComplaints')}>
                  <div className="recent-complaint-item__left">
                    <div className="recent-complaint-item__code">#{c.complaintNumber || c.id.slice(0, 8)}</div>
                    <div className="recent-complaint-item__type">{c.type}</div>
                    <div className="recent-complaint-item__desc">{c.description}</div>
                    <div className="recent-complaint-item__date">Submitted on {formatDate(c.createdAt)}</div>
                  </div>
                  <div className="recent-complaint-item__right">
                    <span className="status-badge" style={{ background: badge.bg, color: badge.color }}>
                      <span className="status-badge__pulse" style={{ background: badge.color }}></span>
                      {badge.label}
                    </span>
                    <button className="btn btn--ghost btn--sm">
                      Details →
                    </button>
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

