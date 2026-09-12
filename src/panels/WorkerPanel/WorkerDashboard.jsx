import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { getComplaints } from '../../services/firestore';
import { Wrench, CheckSquare, Clock, CheckCircle2, User, MapPin } from 'lucide-react';
import { motion } from 'framer-motion';

export default function WorkerDashboard() {
  const { userData } = useAuth();
  const [stats, setStats] = useState({ total: 0, active: 0, completed: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (userData) loadStats();
  }, [userData]);

  const loadStats = async () => {
    const complaints = await getComplaints({ assignedWorkerId: userData.id });
    setStats({
      total: complaints.length,
      active: complaints.filter(c => ['worker_assigned', 'in_progress', 'resolution_declined'].includes(c.status)).length,
      completed: complaints.filter(c => ['finalized_by_worker', 'resolved'].includes(c.status)).length
    });
    setLoading(false);
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-emerald-700 to-teal-800 rounded-3xl p-6 sm:p-8 text-white shadow-lg space-y-2">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/15 text-emerald-100 text-xs font-semibold backdrop-blur-md border border-white/20">
          <Wrench className="w-3.5 h-3.5" />
          <span>Field Staff Task Force</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
          Welcome, {userData?.name || 'Worker'}
        </h1>
        <p className="text-xs text-emerald-100 font-medium">
          District: <strong className="text-white capitalize">{userData?.districtId?.replace(/_/g, ' ') || 'UP Municipal'}</strong> • Mobile: {userData?.phone}
        </p>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <motion.div whileHover={{ y: -2 }} className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-600">
            <CheckSquare className="w-6 h-6" />
          </div>
          <div>
            <span className="text-2xl font-extrabold text-slate-900">{loading ? '—' : stats.total}</span>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total Assigned</p>
          </div>
        </motion.div>

        <motion.div whileHover={{ y: -2 }} className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-600">
            <Clock className="w-6 h-6" />
          </div>
          <div>
            <span className="text-2xl font-extrabold text-slate-900">{loading ? '—' : stats.active}</span>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Active Pending Jobs</p>
          </div>
        </motion.div>

        <motion.div whileHover={{ y: -2 }} className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div>
            <span className="text-2xl font-extrabold text-slate-900">{loading ? '—' : stats.completed}</span>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Completed Tasks</p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
