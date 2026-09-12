import React from 'react';
import StatusBadge from './StatusBadge';
import CountdownTimer from './CountdownTimer';
import { formatDate, truncate } from '../utils/helpers';
import { Calendar, MapPin, Wrench, Phone, ArrowRight, Tag } from 'lucide-react';
import { motion } from 'framer-motion';

export default function ComplaintCard({ complaint, onClick }) {
  return (
    <motion.div
      whileHover={{ y: -3, transition: { duration: 0.15 } }}
      onClick={onClick}
      className="bg-white border border-slate-200/90 hover:border-blue-300 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all cursor-pointer flex flex-col justify-between gap-4 group"
    >
      <div>
        {/* Header: Complaint ID & Status */}
        <div className="flex items-center justify-between gap-2 mb-3">
          <span className="font-mono text-xs font-bold text-slate-500 bg-slate-100 px-2.5 py-1 rounded-lg border border-slate-200">
            #{complaint.complaintNumber || 'MCD-0000'}
          </span>
          <StatusBadge status={complaint.status} />
        </div>

        {/* Issue Type */}
        <h3 className="text-base font-bold text-slate-900 group-hover:text-blue-600 transition-colors flex items-center gap-2">
          <Tag className="w-4 h-4 text-blue-500 shrink-0" />
          <span>{complaint.type}</span>
        </h3>

        {/* Description */}
        <p className="text-sm text-slate-600 mt-2 line-clamp-2 leading-relaxed">
          {truncate(complaint.description, 110)}
        </p>
      </div>

      {/* Meta Info & Worker */}
      <div className="pt-3 border-t border-slate-100 flex flex-col gap-2.5">
        <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-slate-500">
          <span className="flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5 text-slate-400" />
            {formatDate(complaint.createdAt)}
          </span>
          <span className="flex items-center gap-1.5 max-w-[180px] truncate">
            <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <span className="truncate">{complaint.address || 'No address specified'}</span>
          </span>
        </div>

        {/* Assigned Worker Pill */}
        {complaint.assignedWorkerName && (
          <div className="flex items-center justify-between gap-2 bg-slate-50 px-3 py-2 rounded-xl border border-slate-200/80 text-xs">
            <div className="flex items-center gap-2 text-slate-700 font-medium">
              <Wrench className="w-3.5 h-3.5 text-blue-600 shrink-0" />
              <span className="truncate">{complaint.assignedWorkerName}</span>
            </div>
            {complaint.assignedWorkerPhone && (
              <a
                href={`tel:${complaint.assignedWorkerPhone}`}
                onClick={(e) => e.stopPropagation()}
                className="flex items-center gap-1 text-blue-600 hover:text-blue-700 font-semibold hover:underline"
              >
                <Phone className="w-3 h-3" />
                <span>Call</span>
              </a>
            )}
          </div>
        )}

        {/* SLA Timer */}
        {complaint.expectedResolutionDate && complaint.status !== 'resolved' && (
          <div className="mt-1">
            <CountdownTimer expectedDate={complaint.expectedResolutionDate} />
          </div>
        )}
      </div>
    </motion.div>
  );
}
