import React from 'react';
import StatusBadge from './StatusBadge';
import CountdownTimer from './CountdownTimer';
import { formatDate, truncate } from '../utils/helpers';

export default function ComplaintCard({ complaint, onClick }) {
  return (
    <div className="complaint-card" onClick={onClick}>
      <div className="complaint-card__header">
        <span className="complaint-card__number">{complaint.complaintNumber || 'N/A'}</span>
        <StatusBadge status={complaint.status} />
      </div>
      <h3 className="complaint-card__type">{complaint.type}</h3>
      <p className="complaint-card__desc">{truncate(complaint.description, 100)}</p>
      <div className="complaint-card__meta">
        <span className="complaint-card__meta-item">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
          </svg>
          {formatDate(complaint.createdAt)}
        </span>
        <span className="complaint-card__meta-item">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/>
          </svg>
          {truncate(complaint.address, 30) || 'No address'}
        </span>
      </div>
      {complaint.assignedWorkerName && (
        <div className="complaint-card__worker">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/>
          </svg>
          <span>{complaint.assignedWorkerName}</span>
          {complaint.assignedWorkerPhone && (
            <a href={`tel:${complaint.assignedWorkerPhone}`} className="complaint-card__phone" onClick={e => e.stopPropagation()}>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.362 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.338 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/>
              </svg>
              {complaint.assignedWorkerPhone}
            </a>
          )}
        </div>
      )}
      {complaint.expectedResolutionDate && complaint.status !== 'resolved' && (
        <CountdownTimer expectedDate={complaint.expectedResolutionDate} />
      )}
    </div>
  );
}
