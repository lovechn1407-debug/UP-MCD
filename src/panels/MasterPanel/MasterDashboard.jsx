import React, { useState, useEffect } from 'react';
import { getDashboardStats } from '../../services/firestore';

export default function MasterDashboard({ onNavigate }) {
  const [stats, setStats] = useState({ districts: 0, admins: 0, workers: 0, clients: 0, complaints: 0, resolved: 0, pending: 0, inProgress: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      const data = await getDashboardStats();
      setStats(data);
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  };

  const cards = [
    { label: 'Total Districts', value: stats.districts, icon: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 21h18"/><path d="M5 21V7l8-4v18"/><path d="M19 21V11l-6-4"/></svg>, color: '#1B4D8E', action: 'districts' },
    { label: 'Total Admins', value: stats.admins, icon: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>, color: '#7C3AED', action: 'admins' },
    { label: 'Total Workers', value: stats.workers, icon: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/></svg>, color: '#059669', action: 'workers' },
    { label: 'Registered Clients', value: stats.clients, icon: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>, color: '#0EA5E9', action: 'clients' },
    { label: 'Total Complaints', value: stats.complaints, icon: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14,2 14,8 20,8"/></svg>, color: '#F59E0B', action: 'complaints' },
    { label: 'Resolved', value: stats.resolved, icon: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22,4 12,14.01 9,11.01"/></svg>, color: '#16A34A', action: 'complaints' },
    { label: 'Pending', value: stats.pending, icon: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><polyline points="12,6 12,12 16,14"/></svg>, color: '#EAB308', action: 'complaints' },
    { label: 'In Progress', value: stats.inProgress, icon: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="23,6 13.5,15.5 8.5,10.5 1,18"/><polyline points="17,6 23,6 23,12"/></svg>, color: '#8B5CF6', action: 'complaints' }
  ];

  return (
    <div className="dashboard">
      <div className="dashboard__header">
        <h1>Master Dashboard</h1>
        <p>Overview of the UP Municipal Civic Desk system</p>
      </div>
      <div className="stats-grid">
        {cards.map((card, i) => (
          <div key={i} className="stat-card" onClick={() => onNavigate(card.action)} style={{ '--card-color': card.color }}>
            <div className="stat-card__icon" style={{ backgroundColor: `${card.color}14`, color: card.color }}>
              {card.icon}
            </div>
            <div className="stat-card__info">
              <span className="stat-card__value">{loading ? '—' : card.value}</span>
              <span className="stat-card__label">{card.label}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
