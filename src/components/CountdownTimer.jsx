import React, { useState, useEffect } from 'react';
import { Timer, AlertCircle } from 'lucide-react';

export default function CountdownTimer({ expectedDate }) {
  const [timeLeft, setTimeLeft] = useState(null);

  useEffect(() => {
    if (!expectedDate) return;
    const update = () => {
      const target = expectedDate.toDate ? expectedDate.toDate() : new Date(expectedDate);
      const now = new Date();
      const diff = target - now;
      if (diff <= 0) {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, overdue: true });
        return;
      }
      const days = Math.floor(diff / 86400000);
      const hours = Math.floor((diff % 86400000) / 3600000);
      const minutes = Math.floor((diff % 3600000) / 60000);
      setTimeLeft({ days, hours, minutes, overdue: false });
    };
    update();
    const interval = setInterval(update, 60000);
    return () => clearInterval(interval);
  }, [expectedDate]);

  if (!timeLeft || !expectedDate) return null;

  const isUrgent = !timeLeft.overdue && timeLeft.days <= 2;

  let bgClasses = 'bg-slate-100 text-slate-700 border-slate-200';
  if (timeLeft.overdue) {
    bgClasses = 'bg-rose-50 text-rose-700 border-rose-200 animate-pulse';
  } else if (isUrgent) {
    bgClasses = 'bg-amber-50 text-amber-700 border-amber-200';
  }

  return (
    <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${bgClasses}`}>
      {timeLeft.overdue ? <AlertCircle className="w-3.5 h-3.5 text-rose-500 shrink-0" /> : <Timer className="w-3.5 h-3.5 text-slate-500 shrink-0" />}
      {timeLeft.overdue ? (
        <span>SLA Overdue</span>
      ) : (
        <span>{timeLeft.days}d {timeLeft.hours}h {timeLeft.minutes}m SLA remaining</span>
      )}
    </div>
  );
}
