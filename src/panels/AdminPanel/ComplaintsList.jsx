import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { getComplaints, getThread, adminReplyToComplaint, assignWorker, getWorkersByAdmin } from '../../services/firestore';
import ComplaintCard from '../../components/ComplaintCard';
import ChatThread from '../../components/ChatThread';
import StatusBadge from '../../components/StatusBadge';
import { useToast } from '../../components/Toast';
import { formatDateTime } from '../../utils/helpers';
import { MAX_RESOLUTION_DAYS } from '../../utils/constants';
import { FileText, ArrowLeft, Search, MessageSquare, UserCheck, Send, Loader2, ExternalLink } from 'lucide-react';

export default function ComplaintsList() {
  const { userData } = useAuth();
  const toast = useToast();
  const [complaints, setComplaints] = useState([]);
  const [selected, setSelected] = useState(null);
  const [thread, setThread] = useState([]);
  const [workers, setWorkers] = useState([]);
  const [statusFilter, setStatusFilter] = useState('');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  // Reply form
  const [replyText, setReplyText] = useState('');
  const [expectedDays, setExpectedDays] = useState(7);
  const [replying, setReplying] = useState(false);

  // Assign form
  const [selectedWorkerId, setSelectedWorkerId] = useState('');
  const [assigning, setAssigning] = useState(false);

  useEffect(() => {
    if (userData?.districtId) loadData();
  }, [userData]);

  const loadData = async () => {
    const [c, w] = await Promise.all([
      getComplaints({ districtId: userData.districtId }),
      getWorkersByAdmin(userData.districtId)
    ]);
    setComplaints(c);
    setWorkers(w);
    setLoading(false);
  };

  const openDetail = async (complaint) => {
    setSelected(complaint);
    setThread(await getThread(complaint.id));
    setReplyText('');
    setSelectedWorkerId('');
  };

  const handleReply = async () => {
    if (!replyText) { toast.error('Enter a reply message'); return; }
    setReplying(true);
    try {
      await adminReplyToComplaint(selected.id, replyText, expectedDays, userData.name);
      toast.success('Reply sent successfully!');
      openDetail({ ...selected, status: 'admin_replied' });
      loadData();
    } catch (err) { toast.error(err.message); }
    setReplying(false);
  };

  const handleAssign = async () => {
    if (!selectedWorkerId) { toast.error('Select a worker'); return; }
    setAssigning(true);
    try {
      const worker = workers.find(w => w.id === selectedWorkerId);
      await assignWorker(selected.id, worker, userData.name);
      toast.success('Field worker assigned!');
      openDetail({ ...selected, status: 'worker_assigned' });
      loadData();
    } catch (err) { toast.error(err.message); }
    setAssigning(false);
  };

  const filtered = complaints.filter(c => {
    const matchSearch = !search || c.complaintNumber?.includes(search) || c.type?.toLowerCase().includes(search.toLowerCase());
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
          <span>Back to Complaints List</span>
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
          <div><span className="text-slate-400 font-semibold block">Filed Date:</span> <strong className="text-slate-900">{formatDateTime(selected.createdAt)}</strong></div>
          <div><span className="text-slate-400 font-semibold block">Phone:</span> <strong className="text-slate-900">{selected.mobileNumber || selected.clientPhone}</strong></div>
          <div className="sm:col-span-3"><span className="text-slate-400 font-semibold block">Address:</span> <strong className="text-slate-900">{selected.address}</strong></div>
        </div>

        <div className="space-y-2">
          <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">Complaint Details</h3>
          <p className="text-sm text-slate-700 leading-relaxed bg-slate-50 p-4 rounded-2xl border border-slate-200">
            {selected.description}
          </p>
        </div>

        {selected.photos?.length > 0 && (
          <div className="space-y-2">
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">Proof Photos</h3>
            <div className="flex flex-wrap gap-3">
              {selected.photos.map((p, i) => (
                <a key={i} href={p} target="_blank" rel="noreferrer" className="w-24 h-24 rounded-2xl overflow-hidden border border-slate-200 block group relative">
                  <img src={p} alt="" className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                </a>
              ))}
            </div>
          </div>
        )}

        {/* Reply Section */}
        {['new', 'resolution_declined'].includes(selected.status) && (
          <div className="p-5 rounded-2xl bg-blue-50/60 border border-blue-200 space-y-3">
            <h3 className="text-sm font-bold text-blue-950 flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-blue-600" />
              Official Admin Response & SLA Commitment
            </h3>
            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">Reply Message to Citizen</label>
              <textarea
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:border-blue-500 bg-white"
                value={replyText}
                onChange={e => setReplyText(e.target.value)}
                rows={2}
                placeholder="Write resolution acknowledgment or instructions..."
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">Guaranteed SLA Resolution Days</label>
              <select
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:border-blue-500 bg-white"
                value={expectedDays}
                onChange={e => setExpectedDays(Number(e.target.value))}
              >
                {Array.from({ length: MAX_RESOLUTION_DAYS }, (_, i) => i + 1).map(d => (
                  <option key={d} value={d}>{d} day{d > 1 ? 's' : ''} deadline</option>
                ))}
              </select>
            </div>
            <button
              onClick={handleReply}
              disabled={replying}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-sm transition-all disabled:opacity-50"
            >
              {replying ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
              {replying ? 'Sending...' : 'Send Official Response'}
            </button>
          </div>
        )}

        {/* Assign Worker Section */}
        {['admin_replied', 'resolution_declined', 'new'].includes(selected.status) && (
          <div className="p-5 rounded-2xl bg-emerald-50/60 border border-emerald-200 space-y-3">
            <h3 className="text-sm font-bold text-emerald-950 flex items-center gap-2">
              <UserCheck className="w-4 h-4 text-emerald-600" />
              Assign Field Worker
            </h3>
            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">Select Field Worker</label>
              <select
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:border-emerald-500 bg-white"
                value={selectedWorkerId}
                onChange={e => setSelectedWorkerId(e.target.value)}
              >
                <option value="">Choose a registered worker...</option>
                {workers.map(w => <option key={w.id} value={w.id}>{w.name} ({w.phone})</option>)}
              </select>
            </div>
            <button
              onClick={handleAssign}
              disabled={assigning}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-sm transition-all disabled:opacity-50"
            >
              {assigning ? <Loader2 className="w-4 h-4 animate-spin" /> : <UserCheck className="w-4 h-4" />}
              {assigning ? 'Assigning...' : 'Assign Worker to Complaint'}
            </button>
          </div>
        )}

        <div className="space-y-4 pt-4 border-t border-slate-100">
          <h3 className="text-sm font-bold text-slate-900">Activity Timeline & Case Logs</h3>
          <ChatThread thread={thread} />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900">District Complaints Queue</h2>
          <p className="text-xs text-slate-500">Review & assign municipal complaints for {userData?.districtId}</p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="relative min-w-[200px]">
            <input
              placeholder="Search ID, issue..."
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
            <option value="new">New</option>
            <option value="admin_replied">Replied</option>
            <option value="worker_assigned">Assigned</option>
            <option value="in_progress">In Progress</option>
            <option value="resolved">Resolved</option>
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
          <p className="text-sm font-medium text-slate-600">No matching district complaints</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map(c => <ComplaintCard key={c.id} complaint={c} onClick={() => openDetail(c)} />)}
        </div>
      )}
    </div>
  );
}
