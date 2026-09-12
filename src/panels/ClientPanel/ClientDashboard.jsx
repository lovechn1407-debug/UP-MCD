import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { getComplaints, getSettings, autoResolve } from '../../services/firestore';
import { shouldAutoResolve } from '../../utils/helpers';
import {
  PlusCircle,
  FileText,
  Trophy,
  CheckCircle2,
  Clock,
  Sparkles,
  Megaphone,
  ArrowRight,
  ShieldCheck
} from 'lucide-react';
import { motion } from 'framer-motion';

export default function ClientDashboard({ onNavigate }) {
  const { userData } = useAuth();
  const [stats, setStats] = useState({ total: 0, resolved: 0, pending: 0 });
  const [marquee, setMarquee] = useState('');
  const [siteTitle, setSiteTitle] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => { loadData(); }, [userData]);

  const loadData = async () => {
    const [settings, complaints] = await Promise.all([
      getSettings(),
      userData ? getComplaints({ clientId: userData.id || userData.uid }) : Promise.resolve([])
    ]);

    if (settings) {
      setMarquee(settings.marqueeText || '');
      setSiteTitle(settings.siteTitle || 'UP Municipal Civic Desk');
    }

    // Auto-resolve check
    for (const c of complaints) {
      if (c.status === 'finalized_by_worker' && shouldAutoResolve(c.workerFinalizedAt)) {
        await autoResolve(c.id, c.districtId);
      }
    }

    const freshComplaints = userData ? await getComplaints({ clientId: userData.id || userData.uid }) : [];
    setStats({
      total: freshComplaints.length,
      resolved: freshComplaints.filter(c => c.status === 'resolved').length,
      pending: freshComplaints.filter(c => c.status !== 'resolved').length
    });
    setLoading(false);
  };

  return (
    <div className="space-y-6">
      {/* Marquee Announcement Bar */}
      {marquee && (
        <div className="bg-amber-500 text-slate-950 px-4 py-2.5 rounded-2xl shadow-xs flex items-center gap-3 font-semibold text-xs overflow-hidden border border-amber-400">
          <Megaphone className="w-4 h-4 shrink-0 animate-bounce" />
          <div className="overflow-hidden whitespace-nowrap w-full">
            <div className="inline-block animate-marquee">{marquee}</div>
          </div>
        </div>
      )}

      {/* Hero Welcome Banner */}
      <div className="bg-gradient-to-r from-blue-700 via-indigo-700 to-blue-900 rounded-3xl p-6 sm:p-8 text-white shadow-lg relative overflow-hidden flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div className="space-y-2 z-10">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/15 text-blue-100 text-xs font-semibold backdrop-blur-md border border-white/20">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Uttar Pradesh Citizen Grievance Desk</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Welcome, {userData?.name || 'Citizen'}!
          </h1>
          <p className="text-xs sm:text-sm text-blue-100 max-w-xl leading-relaxed">
            Report municipal issues (potholes, garbage, streetlights, water supply) directly to your District Administration with guaranteed SLA deadlines.
          </p>
        </div>

        <button
          onClick={() => onNavigate('newComplaint')}
          className="z-10 inline-flex items-center gap-2.5 px-6 py-3.5 rounded-2xl bg-white text-blue-700 hover:bg-blue-50 font-extrabold text-sm shadow-xl hover:shadow-2xl transition-all shrink-0 self-start sm:self-center"
        >
          <PlusCircle className="w-5 h-5 text-blue-600" />
          <span>Report New Issue</span>
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <motion.div
          whileHover={{ y: -2 }}
          onClick={() => onNavigate('myComplaints')}
          className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs flex items-center gap-4 cursor-pointer group"
        >
          <div className="w-12 h-12 rounded-2xl bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-600 group-hover:scale-105 transition-transform">
            <FileText className="w-6 h-6" />
          </div>
          <div>
            <span className="text-2xl font-extrabold text-slate-900">{loading ? '—' : stats.total}</span>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">My Total Complaints</p>
          </div>
        </motion.div>

        <motion.div
          whileHover={{ y: -2 }}
          onClick={() => onNavigate('myComplaints')}
          className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs flex items-center gap-4 cursor-pointer group"
        >
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600 group-hover:scale-105 transition-transform">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div>
            <span className="text-2xl font-extrabold text-slate-900">{loading ? '—' : stats.resolved}</span>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Resolved Issues</p>
          </div>
        </motion.div>

        <motion.div
          whileHover={{ y: -2 }}
          onClick={() => onNavigate('myComplaints')}
          className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs flex items-center gap-4 cursor-pointer group"
        >
          <div className="w-12 h-12 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-600 group-hover:scale-105 transition-transform">
            <Clock className="w-6 h-6" />
          </div>
          <div>
            <span className="text-2xl font-extrabold text-slate-900">{loading ? '—' : stats.pending}</span>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">In Progress / Pending</p>
          </div>
        </motion.div>
      </div>

      {/* Quick Action Navigation Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <motion.div
          whileHover={{ y: -2 }}
          onClick={() => onNavigate('myComplaints')}
          className="p-6 rounded-3xl bg-white border border-slate-200 hover:border-blue-300 shadow-sm cursor-pointer space-y-3 group"
        >
          <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-600">
            <FileText className="w-5 h-5" />
          </div>
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
              Track My Complaints
            </h3>
            <ArrowRight className="w-5 h-5 text-slate-400 group-hover:text-blue-600 transition-colors" />
          </div>
          <p className="text-xs text-slate-500 leading-relaxed">
            View live status, assigned field worker details, chat timeline, and resolution proof photos for your filed issues.
          </p>
        </motion.div>

        <motion.div
          whileHover={{ y: -2 }}
          onClick={() => onNavigate('leaderboard')}
          className="p-6 rounded-3xl bg-white border border-slate-200 hover:border-amber-300 shadow-sm cursor-pointer space-y-3 group"
        >
          <div className="w-10 h-10 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-600">
            <Trophy className="w-5 h-5" />
          </div>
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-slate-900 group-hover:text-amber-600 transition-colors">
              District Honor Leaderboard
            </h3>
            <ArrowRight className="w-5 h-5 text-slate-400 group-hover:text-amber-600 transition-colors" />
          </div>
          <p className="text-xs text-slate-500 leading-relaxed">
            See how your district ranks across Uttar Pradesh in solving municipal issues and meeting SLA deadlines.
          </p>
        </motion.div>
      </div>
    </div>
  );
}
