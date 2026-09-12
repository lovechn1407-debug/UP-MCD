import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { getComplaints, getThread, workerFinalize, updateComplaint } from '../../services/firestore';
import ComplaintCard from '../../components/ComplaintCard';
import ChatThread from '../../components/ChatThread';
import StatusBadge from '../../components/StatusBadge';
import ImageUploader from '../../components/ImageUploader';
import { useToast } from '../../components/Toast';
import { formatDateTime } from '../../utils/helpers';
import { CheckSquare, ArrowLeft, PlayCircle, CheckCircle2, AlertTriangle, Loader2 } from 'lucide-react';

export default function AssignedTasks() {
  const { userData } = useAuth();
  const toast = useToast();
  const [tasks, setTasks] = useState([]);
  const [selected, setSelected] = useState(null);
  const [thread, setThread] = useState([]);
  const [loading, setLoading] = useState(true);

  // Finalize form
  const [remark, setRemark] = useState('');
  const [photos, setPhotos] = useState([]);
  const [finalizing, setFinalizing] = useState(false);

  useEffect(() => { if (userData) loadTasks(); }, [userData]);

  const loadTasks = async () => {
    const c = await getComplaints({ assignedWorkerId: userData.id });
    setTasks(c);
    setLoading(false);
  };

  const openDetail = async (task) => {
    setSelected(task);
    setThread(await getThread(task.id));
    setRemark('');
    setPhotos([]);
  };

  const handleFinalize = async () => {
    if (!remark) { toast.error('Please add a remark'); return; }
    setFinalizing(true);
    try {
      await workerFinalize(selected.id, remark, photos, userData.name);
      toast.success('Task finalized!');
      setSelected(null);
      loadTasks();
    } catch (err) { toast.error(err.message); }
    setFinalizing(false);
  };

  const handleStartWork = async (task) => {
    await updateComplaint(task.id, { status: 'in_progress' });
    toast.info('Status updated to In Progress');
    loadTasks();
  };

  if (selected) {
    const canFinalize = ['worker_assigned', 'in_progress', 'resolution_declined'].includes(selected.status);

    return (
      <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-6">
        <button
          onClick={() => setSelected(null)}
          className="inline-flex items-center gap-2 text-xs font-bold text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 px-3.5 py-2 rounded-xl transition-all"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Assigned Tasks</span>
        </button>

        <div className="border-b border-slate-100 pb-4 flex flex-wrap items-center justify-between gap-3">
          <div>
            <span className="text-xs font-bold text-slate-400 font-mono">#{selected.complaintNumber}</span>
            <h2 className="text-xl font-extrabold text-slate-900 mt-0.5">{selected.type}</h2>
          </div>
          <StatusBadge status={selected.status} />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 bg-slate-50 p-4 rounded-2xl border border-slate-200/80 text-xs">
          <div><span className="text-slate-400 font-semibold block">Citizen Name:</span> <strong className="text-slate-900">{selected.clientName}</strong></div>
          <div><span className="text-slate-400 font-semibold block">Filed Date:</span> <strong className="text-slate-900">{formatDateTime(selected.createdAt)}</strong></div>
          <div className="sm:col-span-3"><span className="text-slate-400 font-semibold block">Location Address:</span> <strong className="text-slate-900">{selected.address}</strong></div>
        </div>

        <div className="space-y-2">
          <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">Issue Description</h3>
          <p className="text-sm text-slate-700 leading-relaxed bg-slate-50 p-4 rounded-2xl border border-slate-200">
            {selected.description}
          </p>
        </div>

        {selected.photos?.length > 0 && (
          <div className="space-y-2">
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">Citizen Proof Photos</h3>
            <div className="flex flex-wrap gap-3">
              {selected.photos.map((p, i) => (
                <a key={i} href={p} target="_blank" rel="noreferrer" className="w-24 h-24 rounded-2xl overflow-hidden border border-slate-200 block group relative">
                  <img src={p} alt="" className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                </a>
              ))}
            </div>
          </div>
        )}

        {selected.status === 'worker_assigned' && (
          <button
            onClick={() => handleStartWork(selected)}
            className="inline-flex items-center gap-2 px-5 py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md transition-all"
          >
            <PlayCircle className="w-4 h-4" />
            <span>Mark Work Status as "In Progress"</span>
          </button>
        )}

        {canFinalize && (
          <div className="p-5 rounded-2xl bg-emerald-50/60 border border-emerald-200 space-y-4">
            <h3 className="text-sm font-bold text-emerald-950 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              Complete & Finalize Task
            </h3>
            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">Worker Notes / Completion Remark</label>
              <textarea
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:border-emerald-500 bg-white"
                value={remark}
                onChange={e => setRemark(e.target.value)}
                rows={2}
                placeholder="Describe resolution work completed on site..."
              />
            </div>
            <ImageUploader onUpload={setPhotos} label="Upload Resolution Proof Photos" />
            <button
              onClick={handleFinalize}
              disabled={finalizing}
              className="inline-flex items-center gap-2 px-5 py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md transition-all disabled:opacity-50"
            >
              {finalizing ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
              {finalizing ? 'Finalizing...' : 'Submit Resolution Proof'}
            </button>
          </div>
        )}

        {selected.status === 'resolution_declined' && selected.clientDeclineRemark && (
          <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs space-y-2">
            <h3 className="font-bold flex items-center gap-1.5 text-rose-700">
              <AlertTriangle className="w-4 h-4" />
              Resolution Declined by Citizen
            </h3>
            <p className="leading-relaxed">{selected.clientDeclineRemark}</p>
            {selected.clientDeclinePhoto && (
              <img src={selected.clientDeclinePhoto} alt="Decline photo" className="w-32 h-32 rounded-xl object-cover border border-rose-300" />
            )}
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
      <div>
        <h2 className="text-xl font-bold text-slate-900">My Assigned Tasks</h2>
        <p className="text-xs text-slate-500">Field work queue assigned by District Administration</p>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12 text-slate-400 gap-2">
          <Loader2 className="w-5 h-5 animate-spin" />
          <span className="text-sm font-medium">Loading assigned tasks...</span>
        </div>
      ) : tasks.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-3xl p-12 text-center text-slate-400 space-y-2">
          <CheckSquare className="w-10 h-10 mx-auto stroke-[1.5]" />
          <p className="text-sm font-medium text-slate-600">No tasks assigned to you right now</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {tasks.map(t => <ComplaintCard key={t.id} complaint={t} onClick={() => openDetail(t)} />)}
        </div>
      )}
    </div>
  );
}
