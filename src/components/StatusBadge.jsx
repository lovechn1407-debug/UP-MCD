import React from 'react';
import { STATUS_LABELS } from '../utils/constants';
import { Clock, UserCheck, RefreshCw, CheckCircle2, XCircle } from 'lucide-react';

export default function StatusBadge({ status }) {
  const label = STATUS_LABELS[status] || status;

  const getBadgeStyle = (st) => {
    switch (st) {
      case 'pending':
        return {
          bg: 'bg-amber-50 text-amber-700 border-amber-200/80',
          icon: <Clock className="w-3.5 h-3.5 text-amber-500" />
        };
      case 'worker_assigned':
        return {
          bg: 'bg-blue-50 text-blue-700 border-blue-200/80',
          icon: <UserCheck className="w-3.5 h-3.5 text-blue-500" />
        };
      case 'in_progress':
        return {
          bg: 'bg-indigo-50 text-indigo-700 border-indigo-200/80',
          icon: <RefreshCw className="w-3.5 h-3.5 text-indigo-500 animate-spin" />
        };
      case 'resolved':
        return {
          bg: 'bg-emerald-50 text-emerald-700 border-emerald-200/80',
          icon: <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
        };
      case 'rejected':
        return {
          bg: 'bg-rose-50 text-rose-700 border-rose-200/80',
          icon: <XCircle className="w-3.5 h-3.5 text-rose-500" />
        };
      default:
        return {
          bg: 'bg-slate-100 text-slate-700 border-slate-200',
          icon: <Clock className="w-3.5 h-3.5 text-slate-400" />
        };
    }
  };

  const style = getBadgeStyle(status);

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${style.bg} transition-all`}
    >
      {style.icon}
      <span>{label}</span>
    </span>
  );
}
