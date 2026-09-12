import React, { useState, useEffect } from 'react';
import { getDaysRemaining } from '../utils/helpers';

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

  return (
    <div className={`countdown ${timeLeft.overdue ? 'countdown--overdue' : ''} ${isUrgent ? 'countdown--urgent' : ''}`}>
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <circle cx="12" cy="12" r="10"/><polyline points="12,6 12,12 16,14"/>
      </svg>
      {timeLeft.overdue ? (
        <span>Overdue</span>
      ) : (
        <span>{timeLeft.days}d {timeLeft.hours}h {timeLeft.minutes}m remaining</span>
      )}
    </div>
  );
}
