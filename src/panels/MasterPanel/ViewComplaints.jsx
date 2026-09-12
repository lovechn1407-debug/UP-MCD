import React, { useState, useEffect } from 'react';
import { getComplaints, getThread } from '../../services/firestore';
import ComplaintCard from '../../components/ComplaintCard';
import ChatThread from '../../components/ChatThread';
import StatusBadge from '../../components/StatusBadge';
import { formatDateTime } from '../../utils/helpers';
import { FileText, ArrowLeft, Search, Filter, Loader2, ExternalLink } from 'lucide-react';

export default function ViewComplaints() {
  const [complaints, setComplaints] = useState([]);
  const [selected, setSelected] = useState(null);
  const [thread, setThread] = useState([]);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => { loadComplaints(); }, []);

  const loadComplaints = async () => {
    setComplaints(await getComplaints());
    setLoading(false);
  };

  const openDetail = async (complaint) => {
    setSelected(complaint);
    setThread(await getThread(complaint.id));
  };

  const filtered = complaints.filter(c => {
    const matchSearch = !search || c.complaintNumber?.includes(search) || c.type?.toLowerCase().includes(search.toLowerCase()) || c.clientName?.toLowerCase().includes(search.toLowerCase());
    const matchStatus = !statusFilter || c.status === statusFilter;
    return matchSearch && matchStatus;
  });

  if (selected) {
    return (
      <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-6">
        <button
          onClick={() => setSelected(null)}
          className="inline-flex items-center gap-2 text-xs font-bold text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 px-3.5 py-2 rounded-xl transition-all"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to All Complaints</span>
        </button>

        <div className="border-b border-slate-100 pb-4 flex flex-wrap items-center justify-between gap-3">
          <div>
            <span className="text-xs font-bold text-slate-400 font-mono">#{selected.complaintNumber}</span>
            <h2 className="text-xl font-extrabold text-slate-900 mt-0.5">{selected.type}</h2>
          </div>
          <StatusBadge status={selected.status} />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 bg-slate-50 p-4 rounded-2xl border border-slate-200/80 text-xs">
          <div><span className="text-slate-400 font-semibold block">Citizen:</span> <strong className="text-slate-900">{selected.clientName}</strong></div>
          <div><span className="text-slate-400 font-semibold block">District:</span> <strong className="text-slate-900">{selected.districtId}</strong></div>
          <div><span className="text-slate-400 font-semibold block">Filed Date:</span> <strong className="text-slate-900">{formatDateTime(selected.createdAt)}</strong></div>
          <div><span className="text-slate-400 font-semibold block">Phone:</span> <strong className="text-slate-900">{selected.mobileNumber || selected.clientPhone}</strong></div>
          <div className="sm:col-span-2"><span className="text-slate-400 font-semibold block">Address:</span> <strong className="text-slate-900">{selected.address}</strong></div>
        </div>

        <div className="space-y-2">
          <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">Description</h3>
          <p className="text-sm text-slate-700 leading-relaxed bg-slate-50 p-4 rounded-2xl border border-slate-200">
            {selected.description}
          </p>
        </div>

        {selected.photos?.length > 0 && (
          <div className="space-y-2">
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">Attached Proof Photos</h3>
            <div className="flex flex-wrap gap-3">
              {selected.photos.map((p, i) => (
                <a key={i} href={p} target="_blank" rel="noreferrer" className="w-24 h-24 rounded-2xl overflow-hidden border border-slate-200 block group relative">
                  <img src={p} alt={`Photo ${i+1}`} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                </a>
              ))}
            </div>
          </div>
        )}

        <div className="space-y-4 pt-4 border-t border-slate-100">
          <h3 className="text-sm font-bold text-slate-900">Activity Timeline & Communication</h3>
          <ChatThread thread={thread} />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-600 shadow-sm">
            <FileText className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-900">All System Complaints</h2>
            <p className="text-xs text-slate-500">Master feed of all complaints filed across UP</p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="relative min-w-[200px]">
            <input
              placeholder="Search ID, type..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 rounded-xl bg-white border border-slate-200 text-xs font-medium text-slate-800 focus:outline-none focus:border-blue-500"
            />
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          </div>

          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
            className="px-3 py-2 rounded-xl bg-white border border-slate-200 text-xs font-semibold text-slate-700 focus:outline-none focus:border-blue-500"
          >
            <option value="">All Statuses</option>
            <option value="pending">Pending</option>
            <option value="worker_assigned">Worker Assigned</option>
            <option value="in_progress">In Progress</option>
            <option value="resolved">Resolved</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12 text-slate-400 gap-2">
          <Loader2 className="w-5 h-5 animate-spin" />
          <span className="text-sm font-medium">Loading complaints...</span>
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-3xl p-12 text-center text-slate-400 space-y-2">
          <FileText className="w-10 h-10 mx-auto stroke-[1.5]" />
          <p className="text-sm font-medium text-slate-600">No matching complaints found</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map(c => <ComplaintCard key={c.id} complaint={c} onClick={() => openDetail(c)} />)}
        </div>
      )}
    </div>
  );
}
