import React, { useState, useEffect } from 'react';
import { getUsersByRole } from '../../services/firestore';
import { formatDate } from '../../utils/helpers';

export default function ViewClients() {
  const [clients, setClients] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => { loadClients(); }, []);
  const loadClients = async () => { setClients(await getUsersByRole('client')); setLoading(false); };

  const filtered = clients.filter(c =>
    c.name?.toLowerCase().includes(search.toLowerCase()) ||
    c.email?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="panel-section">
      <div className="panel-section__header">
        <h2>Registered Clients</h2>
        <div className="search-box">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
          <input type="text" placeholder="Search clients..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>
      </div>
      <div className="data-table-wrap">
        <table className="data-table">
          <thead><tr><th>Name</th><th>Email</th><th>Phone</th><th>Registered</th></tr></thead>
          <tbody>
            {loading ? <tr><td colSpan="4" className="text-center">Loading...</td></tr> :
              filtered.length === 0 ? <tr><td colSpan="4" className="text-center">No clients found</td></tr> :
              filtered.map(c => (
                <tr key={c.id}><td>{c.name}</td><td>{c.email}</td><td>{c.phone || '—'}</td><td>{formatDate(c.createdAt)}</td></tr>
              ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
