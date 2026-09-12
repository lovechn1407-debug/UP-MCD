import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useApp } from '../context/AppContext';
import { CountdownTimer } from '../components/CountdownTimer';
import { ChatModal } from '../components/ChatModal';
import { 
  Building2, HardHat, Clock, CheckCircle, AlertTriangle, User, Phone, 
  MapPin, MessageSquare, Plus, Check, Calendar, ArrowRight, ShieldAlert 
} from 'lucide-react';

export const AdminPanel = () => {
  const { currentUser } = useAuth();
  const { complaints, workers, addWorker, adminRespondAndAssign } = useApp();

  const districtName = currentUser?.district || "Lucknow";

  // Filter complaints for this District
  const districtComplaints = complaints.filter(
    c => c.district.toLowerCase() === districtName.toLowerCase()
  );

  // Available workers for this district
  const districtWorkers = workers.filter(
    w => w.district.toLowerCase() === districtName.toLowerCase()
  );

  // Active Selected Complaint for Modal / Action
  const [selectedComplaint, setSelectedComplaint] = useState(null);
  const [selectedComplaintForChat, setSelectedComplaintForChat] = useState(null);

  // Admin Reply Form state
  const [expectedDays, setExpectedDays] = useState(7);
  const [adminReplyText, setAdminReplyText] = useState('');
  const [assignedWorkerId, setAssignedWorkerId] = useState(districtWorkers[0]?.id || '');

  // Add Worker Form state
  const [showAddWorkerModal, setShowAddWorkerModal] = useState(false);
  const [wName, setWName] = useState('');
  const [wPhone, setWPhone] = useState('');
  const [wAddedMsg, setWAddedMsg] = useState('');

  // Handle Response & Worker Assignment
  const handleAssignSubmit = (e) => {
    e.preventDefault();
    if (!selectedComplaint) return;

    adminRespondAndAssign(
      selectedComplaint.id,
      expectedDays,
      adminReplyText || `District DM office has reviewed your ticket and assigned a field officer. Target completion set to ${expectedDays} days.`,
      assignedWorkerId
    );

    setSelectedComplaint(null);
    setAdminReplyText('');
  };

  // Handle Adding New Worker under this Admin
  const handleAddWorkerSubmit = (e) => {
    e.preventDefault();
    if (!wName || !wPhone) return;

    const cleanPhone = wPhone.trim();
    const last4 = cleanPhone.slice(-4);
    const workerId = `${wName.split(' ')[0].toLowerCase().replace(/[^a-z0-9]/g, '')}${last4}`;

    addWorker({
      name: wName.trim(),
      phone: cleanPhone,
      district: districtName,
      workerId: workerId,
      pass: cleanPhone
    });

    setWAddedMsg(`Worker created! ID: ${workerId} | Pass: ${cleanPhone}`);
    setWName('');
    setWPhone('');
    setTimeout(() => {
      setWAddedMsg('');
      setShowAddWorkerModal(false);
    }, 2000);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 rounded-2xl p-6 sm:p-8 text-white shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-blue-600/30 border border-blue-400/30 flex items-center justify-center text-blue-300">
            <Building2 className="w-8 h-8" />
          </div>
          <div>
            <span className="bg-blue-500/20 text-blue-300 border border-blue-400/30 text-xs font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider">
              District Administration Panel
            </span>
            <h2 className="text-2xl font-extrabold text-white mt-1">
              District Collectorate Portal ({districtName})
            </h2>
            <p className="text-slate-300 text-xs sm:text-sm">
              District Magistrate: <span className="font-semibold text-amber-300">{currentUser?.name}</span> • Phone: {currentUser?.phone}
            </p>
          </div>
        </div>

        <button
          onClick={() => setShowAddWorkerModal(true)}
          className="btn-saffron text-sm shadow-md"
        >
          <Plus className="w-4 h-4" />
          Add District Field Worker
        </button>
      </div>

      {/* Complaints List Container */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-xl font-extrabold text-slate-900 flex items-center gap-2">
            Complaints Registered in {districtName}
            <span className="text-xs bg-blue-100 text-blue-800 font-bold px-2.5 py-0.5 rounded-full">
              {districtComplaints.length} Total
            </span>
          </h3>
        </div>

        {districtComplaints.length === 0 ? (
          <div className="bg-white rounded-2xl p-12 text-center border border-slate-200 text-slate-500 shadow-sm">
            <CheckCircle className="w-12 h-12 text-emerald-500 mx-auto mb-3" />
            <h4 className="text-lg font-bold text-slate-800">No Complaints Pending!</h4>
            <p className="text-xs text-slate-500">All civic issue complaints in {districtName} district are up to date.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {districtComplaints.map((cmp) => (
              <div
                key={cmp.id}
                className={`bg-white rounded-2xl p-5 border shadow-sm transition-all space-y-4 ${
                  cmp.status === 'Resolve Declined'
                    ? 'border-red-300 ring-2 ring-red-100'
                    : cmp.status === 'Worker Finalised'
                    ? 'border-amber-300 bg-amber-50/20'
                    : 'border-slate-200'
                }`}
              >
                {/* Header Badge & ID */}
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <span className="font-mono text-xs font-bold text-slate-500 block">
                      Ticket #{cmp.id}
                    </span>
                    <h4 className="font-extrabold text-slate-900 text-base mt-0.5">
                      {cmp.complaintType}
                    </h4>
                  </div>
                  <span className={`badge ${
                    cmp.status === 'Resolved' ? 'badge-resolved' :
                    cmp.status === 'Resolve Declined' ? 'badge-declined' :
                    cmp.status === 'Worker Finalised' ? 'badge-worker' :
                    'badge-pending'
                  }`}>
                    {cmp.status}
                  </span>
                </div>

                {/* Resolve Declined Alert Banner */}
                {cmp.status === 'Resolve Declined' && (
                  <div className="bg-red-50 border border-red-200 rounded-xl p-3 text-red-900 text-xs space-y-1">
                    <div className="font-extrabold flex items-center gap-1 text-red-700">
                      <AlertTriangle className="w-4 h-4 text-red-600" />
                      Client Rejected Resolution!
                    </div>
                    <p><span className="font-semibold">Reason:</span> "{cmp.rejectionReason}"</p>
                    {cmp.rejectionPhoto && (
                      <div className="mt-2">
                        <span className="text-[11px] font-bold text-red-800 block mb-1">Client Rejection Proof Photo:</span>
                        <img src={cmp.rejectionPhoto} alt="Rejection Proof" className="w-full h-32 object-cover rounded-lg border border-red-200" />
                      </div>
                    )}
                  </div>
                )}

                {/* Complaint Description */}
                <p className="text-xs text-slate-700 bg-slate-50 p-3 rounded-xl border border-slate-200">
                  {cmp.description}
                </p>

                {/* Complaint Photos */}
                {cmp.photos && cmp.photos.length > 0 && (
                  <div className="flex items-center gap-2 overflow-x-auto pb-1">
                    {cmp.photos.map((url, idx) => (
                      <img
                        key={idx}
                        src={url}
                        alt="Issue"
                        className="w-20 h-20 object-cover rounded-lg border border-slate-200 shrink-0"
                      />
                    ))}
                  </div>
                )}

                {/* Citizen Details */}
                <div className="text-xs text-slate-600 space-y-1 pt-1 border-t border-slate-100">
                  <div className="flex items-center gap-1.5 font-semibold text-slate-800">
                    <User className="w-3.5 h-3.5 text-slate-400" />
                    Client: {cmp.clientName} ({cmp.clientPhone || cmp.clientEmail})
                  </div>
                  <div className="flex items-center gap-1.5 text-slate-600">
                    <MapPin className="w-3.5 h-3.5 text-red-500 shrink-0" />
                    <span className="truncate">{cmp.address}</span>
                  </div>
                </div>

                {/* Countdown Timer */}
                <CountdownTimer
                  targetDate={cmp.expectedDate}
                  status={cmp.status}
                  workerFinalisedAt={cmp.workerFinalisedAt}
                  autoResolved={cmp.autoResolved}
                />

                {/* Assigned Worker Info */}
                {cmp.workerName && (
                  <div className="bg-amber-50/80 border border-amber-200 rounded-xl p-2.5 text-xs flex items-center justify-between text-amber-900">
                    <div className="flex items-center gap-2">
                      <HardHat className="w-4 h-4 text-amber-600" />
                      <div>
                        <span className="text-[11px] text-amber-700 block font-medium">Assigned Field Worker</span>
                        <span className="font-bold">{cmp.workerName}</span>
                      </div>
                    </div>
                    <span className="font-mono text-xs font-semibold bg-white px-2 py-0.5 rounded border border-amber-300">
                      📞 {cmp.workerPhone}
                    </span>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex items-center gap-2 pt-2 border-t border-slate-100">
                  <button
                    onClick={() => {
                      setSelectedComplaint(cmp);
                      setAdminReplyText(cmp.adminReply || '');
                    }}
                    className="btn-primary py-2 text-xs flex-1 justify-center"
                  >
                    <Clock className="w-4 h-4" />
                    {cmp.workerId ? "Re-assign Worker & Time" : "Reply & Assign Worker"}
                  </button>

                  <button
                    onClick={() => setSelectedComplaintForChat(cmp)}
                    className="btn-secondary py-2 text-xs"
                  >
                    <MessageSquare className="w-4 h-4 text-blue-600" />
                    Chat
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal: Admin Reply & Assign Worker */}
      {selectedComplaint && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 relative space-y-4">
            <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2">
              <Building2 className="w-6 h-6 text-blue-700" />
              Respond & Assign Worker
            </h3>
            <p className="text-xs text-slate-500">
              Set expected resolution duration (Max 20 Days) and select an available field officer for ticket <span className="font-mono font-bold text-blue-900">#{selectedComplaint.id}</span>
            </p>

            <form onSubmit={handleAssignSubmit} className="space-y-4">
              {/* Expected Completion Days (MAX 20 DAYS Limit!) */}
              <div>
                <label className="label-title flex items-center justify-between">
                  <span>Expected Resolution Time (Days)</span>
                  <span className="text-xs text-amber-700 font-extrabold bg-amber-100 px-2 py-0.5 rounded border border-amber-300">
                    Max 20 Days Limit
                  </span>
                </label>
                <input
                  type="number"
                  min="1"
                  max="20"
                  className="input-field font-bold text-blue-900"
                  value={expectedDays}
                  onChange={(e) => {
                    const val = Math.min(parseInt(e.target.value, 10) || 1, 20);
                    setExpectedDays(val);
                  }}
                  required
                />
              </div>

              {/* Select Available Worker */}
              <div>
                <label className="label-title">Assign Available District Worker</label>
                <select
                  className="input-field"
                  value={assignedWorkerId}
                  onChange={(e) => setAssignedWorkerId(e.target.value)}
                  required
                >
                  {districtWorkers.length === 0 ? (
                    <option value="">No workers added yet. Please add a worker first.</option>
                  ) : (
                    districtWorkers.map(w => (
                      <option key={w.id} value={w.id}>
                        👷 {w.name} ({w.phone}) - ID: {w.workerId}
                      </option>
                    ))
                  )}
                </select>
              </div>

              {/* Admin Official Remark */}
              <div>
                <label className="label-title">Official Admin Instructions / Reply to Client</label>
                <textarea
                  className="input-field min-h-[90px]"
                  placeholder="Type official instructions for client and worker..."
                  value={adminReplyText}
                  onChange={(e) => setAdminReplyText(e.target.value)}
                />
              </div>

              {/* Buttons */}
              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setSelectedComplaint(null)}
                  className="btn-secondary"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-primary"
                >
                  <Check className="w-4 h-4" />
                  Confirm Assignment & Notify Client
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Add New Worker */}
      {showAddWorkerModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 relative space-y-4">
            <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2">
              <HardHat className="w-6 h-6 text-amber-600" />
              Add New Worker for {districtName}
            </h3>

            {wAddedMsg && (
              <div className="bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs font-mono font-bold p-3 rounded-xl">
                {wAddedMsg}
              </div>
            )}

            <form onSubmit={handleAddWorkerSubmit} className="space-y-4">
              <div>
                <label className="label-title">Worker Full Name</label>
                <input
                  type="text"
                  className="input-field"
                  placeholder="e.g. Ramesh Sharma"
                  value={wName}
                  onChange={(e) => setWName(e.target.value)}
                  required
                />
              </div>

              <div>
                <label className="label-title">Mobile Contact Number</label>
                <input
                  type="tel"
                  className="input-field"
                  placeholder="9876543210"
                  value={wPhone}
                  onChange={(e) => setWPhone(e.target.value)}
                  required
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setShowAddWorkerModal(false)}
                  className="btn-secondary"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-saffron"
                >
                  <Plus className="w-4 h-4" />
                  Create Worker Account
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Chat Modal */}
      {selectedComplaintForChat && (
        <ChatModal
          complaint={selectedComplaintForChat}
          isOpen={!!selectedComplaintForChat}
          onClose={() => setSelectedComplaintForChat(null)}
        />
      )}
    </div>
  );
};
