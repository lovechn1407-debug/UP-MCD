import React, { useState, useEffect } from 'react';
import { getUsersByRole } from '../../services/firestore';
import { formatDate } from '../../utils/helpers';
import { Users, Search, Loader2, Mail, Phone, Calendar } from 'lucide-react';

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
    <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-sky-50 border border-sky-200 flex items-center justify-center text-sky-600 shadow-sm">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-900">Registered Citizens</h2>
            <p className="text-xs text-slate-500">Master user list of all citizens using Google auth</p>
          </div>
        </div>

        <div className="relative min-w-[240px]">
          <input
            type="text"
            placeholder="Search citizens..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-medium text-slate-800 focus:outline-none focus:border-blue-500 focus:bg-white transition-all"
          />
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs text-slate-700">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50/70 text-slate-500 font-semibold uppercase tracking-wider">
              <th className="py-3 px-4">Citizen Name</th>
              <th className="py-3 px-4">Email</th>
              <th className="py-3 px-4">Phone</th>
              <th className="py-3 px-4">Joined Date</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {loading ? (
              <tr><td colSpan="4" className="py-8 text-center text-slate-400">Loading citizens...</td></tr>
            ) : filtered.length === 0 ? (
              <tr><td colSpan="4" className="py-8 text-center text-slate-400">No citizens registered yet</td></tr>
            ) : filtered.map(c => (
              <tr key={c.id} className="hover:bg-slate-50/80 transition-colors">
                <td className="py-3.5 px-4 font-bold text-slate-900">{c.name}</td>
                <td className="py-3.5 px-4 text-slate-600 flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  {c.email}
                </td>
                <td className="py-3.5 px-4 text-slate-600">{c.phone || '—'}</td>
                <td className="py-3.5 px-4 text-slate-400">{formatDate(c.createdAt)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
