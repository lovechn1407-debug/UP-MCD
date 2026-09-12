import React, { useState, useEffect } from 'react';
import { getDashboardStats } from '../../services/firestore';
import {
  Building2,
  ShieldCheck,
  Wrench,
  Users,
  FileText,
  CheckCircle2,
  Clock,
  RefreshCw,
  ArrowUpRight,
  Sparkles
} from 'lucide-react';
import { motion } from 'framer-motion';

export default function MasterDashboard({ onNavigate }) {
  const [stats, setStats] = useState({
    districts: 0,
    admins: 0,
    workers: 0,
    clients: 0,
    complaints: 0,
    resolved: 0,
    pending: 0,
    inProgress: 0
  });
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
    {
      label: 'Total Districts',
      value: stats.districts,
      icon: <Building2 className="w-6 h-6 text-blue-600" />,
      bg: 'bg-blue-50 border-blue-100',
      action: 'districts',
      desc: 'UP Municipal Councils'
    },
    {
      label: 'District Admins',
      value: stats.admins,
      icon: <ShieldCheck className="w-6 h-6 text-purple-600" />,
      bg: 'bg-purple-50 border-purple-100',
      action: 'admins',
      desc: 'Assigned DMs & Officers'
    },
    {
      label: 'Field Workers',
      value: stats.workers,
      icon: <Wrench className="w-6 h-6 text-emerald-600" />,
      bg: 'bg-emerald-50 border-emerald-100',
      action: 'workers',
      desc: 'Active Municipal Staff'
    },
    {
      label: 'Registered Citizens',
      value: stats.clients,
      icon: <Users className="w-6 h-6 text-sky-600" />,
      bg: 'bg-sky-50 border-sky-100',
      action: 'clients',
      desc: 'Verified Mobile Accounts'
    },
    {
      label: 'Total Complaints',
      value: stats.complaints,
      icon: <FileText className="w-6 h-6 text-amber-600" />,
      bg: 'bg-amber-50 border-amber-100',
      action: 'complaints',
      desc: 'Filed Across UP'
    },
    {
      label: 'Resolved',
      value: stats.resolved,
      icon: <CheckCircle2 className="w-6 h-6 text-emerald-600" />,
      bg: 'bg-emerald-50 border-emerald-100',
      action: 'complaints',
      desc: 'Successfully Solved'
    },
    {
      label: 'Pending SLA',
      value: stats.pending,
      icon: <Clock className="w-6 h-6 text-rose-600" />,
      bg: 'bg-rose-50 border-rose-100',
      action: 'complaints',
      desc: 'Awaiting Action'
    },
    {
      label: 'In Progress',
      value: stats.inProgress,
      icon: <RefreshCw className="w-6 h-6 text-indigo-600" />,
      bg: 'bg-indigo-50 border-indigo-100',
      action: 'complaints',
      desc: 'Work Underway'
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-blue-700 via-indigo-700 to-blue-900 rounded-3xl p-6 sm:p-8 text-white shadow-lg relative overflow-hidden">
        <div className="absolute right-0 top-0 w-96 h-96 bg-white/10 rounded-full blur-2xl pointer-events-none" />
        <div className="relative z-10 space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/15 text-blue-100 text-xs font-semibold backdrop-blur-md border border-white/20">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Master Command Center</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">Master Admin Dashboard</h1>
          <p className="text-sm text-blue-100 max-w-2xl">
            Real-time state overview of Uttar Pradesh municipal operations, administrative staff, district performance, and complaint analytics.
          </p>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {cards.map((card, i) => (
          <motion.div
            key={i}
            whileHover={{ y: -3, transition: { duration: 0.15 } }}
            onClick={() => onNavigate(card.action)}
            className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-xs hover:shadow-md transition-all cursor-pointer group flex flex-col justify-between"
          >
            <div className="flex items-center justify-between">
              <div className={`p-3 rounded-2xl border ${card.bg}`}>
                {card.icon}
              </div>
              <ArrowUpRight className="w-4 h-4 text-slate-400 group-hover:text-blue-600 transition-colors" />
            </div>

            <div className="mt-4">
              <span className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                {loading ? '—' : card.value}
              </span>
              <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider mt-1">
                {card.label}
              </h3>
              <p className="text-[11px] text-slate-400 mt-0.5">{card.desc}</p>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
