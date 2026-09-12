import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { getComplaints, getWorkersByAdmin } from '../../services/firestore';
import {
  Building2,
  FileText,
  Clock,
  RefreshCw,
  CheckCircle2,
  AlertTriangle,
  Wrench,
  MapPin,
  ArrowRight,
  ShieldCheck
} from 'lucide-react';
import { motion } from 'framer-motion';

export default function AdminDashboard({ onNavigate }) {
  const { userData } = useAuth();
  const [stats, setStats] = useState({ total: 0, pending: 0, inProgress: 0, resolved: 0, overdue: 0, workers: 0 });
  const [recent, setRecent] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (userData?.districtId) loadStats();
  }, [userData]);

  const loadStats = async () => {
    const [complaints, workers] = await Promise.all([
      getComplaints({ districtId: userData.districtId }),
      getWorkersByAdmin(userData.districtId)
    ]);
    const now = new Date();
    setStats({
      total: complaints.length,
      pending: complaints.filter(c => c.status === 'new' || c.status === 'resolution_declined').length,
      inProgress: complaints.filter(c => ['admin_replied', 'worker_assigned', 'in_progress'].includes(c.status)).length,
      resolved: complaints.filter(c => c.status === 'resolved').length,
      overdue: complaints.filter(c => {
        if (!c.expectedResolutionDate || c.status === 'resolved') return false;
        const exp = c.expectedResolutionDate.toDate ? c.expectedResolutionDate.toDate() : new Date(c.expectedResolutionDate);
        return exp < now;
      }).length,
      workers: workers.length
    });
    setRecent(complaints.slice(0, 5));
    setLoading(false);
  };

  const cards = [
    { label: 'Total Complaints', value: stats.total, icon: <FileText className="w-5 h-5 text-blue-600" />, bg: 'bg-blue-50 border-blue-200' },
    { label: 'Pending Action', value: stats.pending, icon: <Clock className="w-5 h-5 text-amber-600" />, bg: 'bg-amber-50 border-amber-200' },
    { label: 'In Progress', value: stats.inProgress, icon: <RefreshCw className="w-5 h-5 text-indigo-600" />, bg: 'bg-indigo-50 border-indigo-200' },
    { label: 'Resolved SLA', value: stats.resolved, icon: <CheckCircle2 className="w-5 h-5 text-emerald-600" />, bg: 'bg-emerald-50 border-emerald-200' },
    { label: 'SLA Overdue', value: stats.overdue, icon: <AlertTriangle className="w-5 h-5 text-rose-600" />, bg: 'bg-rose-50 border-rose-200' },
    { label: 'Active Workers', value: stats.workers, icon: <Wrench className="w-5 h-5 text-sky-600" />, bg: 'bg-sky-50 border-sky-200' }
  ];

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-blue-700 to-indigo-800 rounded-3xl p-6 sm:p-8 text-white shadow-lg flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/15 text-blue-100 text-xs font-semibold backdrop-blur-md border border-white/20">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>District DM Command Portal</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            District Administration Dashboard
          </h1>
          <div className="flex items-center gap-2 text-sm text-blue-100 font-medium">
            <MapPin className="w-4 h-4 text-blue-300" />
            <span>District: <strong className="text-white capitalize">{userData?.districtId?.replace(/_/g, ' ') || 'Assigned District'}</strong></span>
          </div>
        </div>

        <button
          onClick={() => onNavigate('complaints')}
          className="inline-flex items-center gap-2 px-5 py-3 rounded-2xl bg-white text-blue-700 hover:bg-blue-50 font-bold text-xs shadow-md transition-all self-start sm:self-center"
        >
          <span>View All Complaints</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>

      {/* SLA Alert Banner if overdue > 0 */}
      {stats.overdue > 0 && (
        <div className="flex items-center gap-3 p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 font-medium text-xs shadow-xs">
          <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0" />
          <span>
            Attention DM: You have <strong>{stats.overdue} overdue complaint(s)</strong> exceeding SLA resolution deadline. Please assign workers immediately.
          </span>
        </div>
      )}

      {/* Metrics Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
        {cards.map((c, i) => (
          <motion.div
            key={i}
            whileHover={{ y: -2 }}
            className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs space-y-3"
          >
            <div className={`w-9 h-9 rounded-xl border flex items-center justify-center ${c.bg}`}>
              {c.icon}
            </div>
            <div>
              <span className="text-2xl font-extrabold text-slate-900">{loading ? '—' : c.value}</span>
              <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mt-0.5">{c.label}</p>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
