import React, { useState, useEffect } from 'react';
import { Clock, AlertTriangle, CheckCircle } from 'lucide-react';

export const CountdownTimer = ({ targetDate, status, workerFinalisedAt, autoResolved }) => {
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0, expired: false });
  const [autoResolveLeft, setAutoResolveLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0, expired: false });

  // Main Deadline Timer
  useEffect(() => {
    if (!targetDate) return;

    const calculateTimer = () => {
      const targetTime = new Date(targetDate).getTime();
      const now = Date.now();
      const diff = targetTime - now;

      if (diff <= 0) {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0, expired: true });
      } else {
        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
        const minutes = Math.floor((diff / 1000 / 60) % 60);
        const seconds = Math.floor((diff / 1000) % 60);
        setTimeLeft({ days, hours, minutes, seconds, expired: false });
      }
    };

    calculateTimer();
    const interval = setInterval(calculateTimer, 1000);
    return () => clearInterval(interval);
  }, [targetDate]);

  // 5-Day Auto-Resolve Timer
  useEffect(() => {
    if (status !== 'Worker Finalised' || !workerFinalisedAt) return;

    const FIVE_DAYS_MS = 5 * 24 * 60 * 60 * 1000;
    const calculateAutoTimer = () => {
      const finalizedTime = new Date(workerFinalisedAt).getTime();
      const targetAutoTime = finalizedTime + FIVE_DAYS_MS;
      const now = Date.now();
      const diff = targetAutoTime - now;

      if (diff <= 0) {
        setAutoResolveLeft({ days: 0, hours: 0, minutes: 0, seconds: 0, expired: true });
      } else {
        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
        const minutes = Math.floor((diff / 1000 / 60) % 60);
        const seconds = Math.floor((diff / 1000) % 60);
        setAutoResolveLeft({ days, hours, minutes, seconds, expired: false });
      }
    };

    calculateAutoTimer();
    const interval = setInterval(calculateAutoTimer, 1000);
    return () => clearInterval(interval);
  }, [status, workerFinalisedAt]);

  if (status === 'Resolved') {
    return (
      <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-lg text-xs font-semibold">
        <CheckCircle className="w-4 h-4 text-emerald-600" />
        {autoResolved ? "Auto-Resolved (5-Day Window Expired)" : "Resolution Completed"}
      </div>
    );
  }

  // Active 5-Day Auto Resolve Window Warning
  if (status === 'Worker Finalised' && workerFinalisedAt) {
    return (
      <div className="bg-amber-50 border border-amber-200 rounded-xl p-2.5 space-y-1">
        <div className="flex items-center justify-between text-xs font-bold text-amber-900">
          <span className="flex items-center gap-1">
            <Clock className="w-3.5 h-3.5 text-amber-600 animate-spin" style={{ animationDuration: '4s' }} />
            5-Day Client Approval Countdown:
          </span>
          <span className="font-mono text-amber-700 bg-white px-2 py-0.5 rounded border border-amber-300">
            {autoResolveLeft.expired ? "Auto-Resolving Now..." : `${autoResolveLeft.days}d ${autoResolveLeft.hours}h ${autoResolveLeft.minutes}m ${autoResolveLeft.seconds}s`}
          </span>
        </div>
        <p className="text-[11px] text-amber-700">
          If client does not click "Complaint Resolved" or "Not Resolved", this ticket will automatically mark as resolved when timer hits 0.
        </p>
      </div>
    );
  }

  if (!targetDate) {
    return (
      <div className="inline-flex items-center gap-1 text-xs text-slate-500 bg-slate-100 px-2.5 py-1 rounded-lg">
        <Clock className="w-3.5 h-3.5" />
        Awaiting Admin Resolution Time Allocation
      </div>
    );
  }

  return (
    <div className={`p-2.5 rounded-xl border flex items-center justify-between text-xs transition-all ${
      timeLeft.expired 
        ? 'bg-red-50 border-red-200 text-red-900' 
        : 'bg-blue-50 border-blue-200 text-blue-900'
    }`}>
      <div className="flex items-center gap-1.5 font-medium">
        {timeLeft.expired ? (
          <AlertTriangle className="w-4 h-4 text-red-600" />
        ) : (
          <Clock className="w-4 h-4 text-blue-600 pulse-timer" />
        )}
        <span>{timeLeft.expired ? "Deadline Exceeded:" : "Expected Target Deadline:"}</span>
      </div>

      <div className="font-mono font-bold text-sm bg-white px-2.5 py-0.5 rounded shadow-sm border border-slate-200">
        {timeLeft.expired ? (
          <span className="text-red-600">Overdue</span>
        ) : (
          <span className="text-blue-900">
            {timeLeft.days}d {timeLeft.hours}h {timeLeft.minutes}m {timeLeft.seconds}s
          </span>
        )}
      </div>
    </div>
  );
};
