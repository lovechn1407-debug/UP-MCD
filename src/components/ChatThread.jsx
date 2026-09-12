import React from 'react';
import { formatDateTime } from '../utils/helpers';

export default function ChatThread({ thread = [] }) {
  if (!thread.length) {
    return (
      <div className="chat-thread__empty">
        <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#94A3B8" strokeWidth="1.5">
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
        </svg>
        <p>No activity yet</p>
      </div>
    );
  }

  const roleColors = {
    client: '#6366F1',
    admin: '#1B4D8E',
    worker: '#059669',
    system: '#64748B'
  };

  const roleIcons = {
    client: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
      </svg>
    ),
    admin: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
      </svg>
    ),
    worker: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/>
      </svg>
    ),
    system: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
      </svg>
    )
  };

  return (
    <div className="chat-thread">
      {thread.map((entry, index) => (
        <div key={entry.id || index} className="chat-thread__entry" style={{ '--role-color': roleColors[entry.authorRole] || '#64748B' }}>
          <div className="chat-thread__line" />
          <div className="chat-thread__dot" style={{ backgroundColor: roleColors[entry.authorRole] }} />
          <div className="chat-thread__content">
            <div className="chat-thread__header">
              <span className="chat-thread__role" style={{ color: roleColors[entry.authorRole] }}>
                {roleIcons[entry.authorRole]}
                {entry.authorName}
              </span>
              <span className="chat-thread__time">{formatDateTime(entry.timestamp)}</span>
            </div>
            <p className="chat-thread__message">{entry.message}</p>
            {entry.images && entry.images.length > 0 && (
              <div className="chat-thread__images">
                {entry.images.map((img, i) => (
                  <a key={i} href={img} target="_blank" rel="noopener noreferrer">
                    <img src={img} alt={`Attachment ${i + 1}`} />
                  </a>
                ))}
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
