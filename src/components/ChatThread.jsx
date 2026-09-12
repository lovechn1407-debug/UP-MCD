import React from 'react';
import { formatDateTime } from '../utils/helpers';
import { MessageSquare, User, ShieldCheck, Wrench, Info, ExternalLink } from 'lucide-react';

export default function ChatThread({ thread = [] }) {
  if (!thread.length) {
    return (
      <div className="flex flex-col items-center justify-center p-8 bg-slate-50 border border-dashed border-slate-200 rounded-2xl text-slate-400 text-center">
        <MessageSquare className="w-8 h-8 mb-2 stroke-[1.5]" />
        <p className="text-sm font-medium text-slate-500">No activity or updates yet</p>
      </div>
    );
  }

  const getRoleStyle = (role) => {
    switch (role) {
      case 'admin':
        return {
          bg: 'bg-blue-50 text-blue-700 border-blue-200',
          icon: <ShieldCheck className="w-3.5 h-3.5 text-blue-600" />,
          label: 'Admin'
        };
      case 'worker':
        return {
          bg: 'bg-emerald-50 text-emerald-700 border-emerald-200',
          icon: <Wrench className="w-3.5 h-3.5 text-emerald-600" />,
          label: 'Field Worker'
        };
      case 'client':
        return {
          bg: 'bg-indigo-50 text-indigo-700 border-indigo-200',
          icon: <User className="w-3.5 h-3.5 text-indigo-600" />,
          label: 'Citizen'
        };
      default:
        return {
          bg: 'bg-slate-100 text-slate-700 border-slate-200',
          icon: <Info className="w-3.5 h-3.5 text-slate-500" />,
          label: 'System'
        };
    }
  };

  return (
    <div className="space-y-4 relative before:absolute before:inset-0 before:left-4 before:w-0.5 before:bg-slate-200/80 before:z-0">
      {thread.map((entry, index) => {
        const style = getRoleStyle(entry.authorRole);
        return (
          <div key={entry.id || index} className="relative z-10 flex items-start gap-4">
            <div className={`w-8 h-8 rounded-full border shadow-xs flex items-center justify-center shrink-0 ${style.bg}`}>
              {style.icon}
            </div>

            <div className="flex-1 bg-white border border-slate-200/90 rounded-2xl p-4 shadow-xs">
              <div className="flex items-center justify-between gap-2 mb-2 pb-2 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-sm text-slate-900">{entry.authorName}</span>
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${style.bg}`}>
                    {style.label}
                  </span>
                </div>
                <span className="text-xs text-slate-400 font-medium">
                  {formatDateTime(entry.timestamp)}
                </span>
              </div>

              <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-line">
                {entry.message}
              </p>

              {entry.images && entry.images.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-2 pt-2 border-t border-slate-100">
                  {entry.images.map((img, i) => (
                    <a
                      key={i}
                      href={img}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group relative rounded-xl overflow-hidden border border-slate-200 block w-20 h-20 bg-slate-100"
                    >
                      <img src={img} alt={`Proof ${i + 1}`} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                      <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity text-white">
                        <ExternalLink className="w-4 h-4" />
                      </div>
                    </a>
                  ))}
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
