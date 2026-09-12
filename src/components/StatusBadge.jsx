import React from 'react';
import { STATUS_LABELS, STATUS_COLORS } from '../utils/constants';

export default function StatusBadge({ status }) {
  const label = STATUS_LABELS[status] || status;
  const color = STATUS_COLORS[status] || '#64748B';
  const isActive = status === 'in_progress' || status === 'worker_assigned';

  return (
    <span
      className={`status-badge ${isActive ? 'status-badge--active' : ''}`}
      style={{
        '--badge-color': color,
        backgroundColor: `${color}14`,
        color: color,
        border: `1px solid ${color}30`
      }}
    >
      {isActive && <span className="status-badge__pulse" style={{ backgroundColor: color }} />}
      {label}
    </span>
  );
}
