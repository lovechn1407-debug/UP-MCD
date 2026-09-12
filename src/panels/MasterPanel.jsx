import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Leaderboard } from '../components/Leaderboard';
import { ChatModal } from '../components/ChatModal';
import { 
  ShieldAlert, Building2, UserPlus, HardHat, Settings, Megaphone, 
  MessageSquare, FileText, Search, Check, Plus, Edit3, Image, Award, Eye
} from 'lucide-react';

export const MasterPanel = () => {
  const { 
    siteSettings, 
    updateSiteSettings, 
    districts, 
    addDistrict, 
    workers, 
    addWorker, 
    complaints 
  } = useApp();

  const [activeSubTab, setActiveSubTab] = useState('settings'); // 'settings', 'districts_admins', 'workers', 'complaints_chats', 'leaderboard'
  const [selectedComplaintForChat, setSelectedComplaintForChat] = useState(null);

  // Form States
  // 1. Site Settings Form
  const [siteTitle, setSiteTitle] = useState(siteSettings.siteTitle);
  const [siteImage, setSiteImage] = useState(siteSettings.siteImage);
  const [headerMarquee, setHeaderMarquee] = useState(siteSettings.headerMarquee);
  const [settingsSaved, setSettingsSaved] = useState(false);

  // 2. New District & Admin Form
  const [newDistName, setNewDistName] = useState('');
  const [newDistDivision, setNewDistDivision] = useState('Lucknow Division');
  const [newRepName, setNewRepName] = useState('');
  const [newRepPhone, setNewRepPhone] = useState('');
  const [newRepEmail, setNewRepEmail] = useState('');
  const [districtAddedMsg, setDistrictAddedMsg] = useState('');

  // 3. New Worker Form
  const [newWorkerName, setNewWorkerName] = useState('');
  const [newWorkerPhone, setNewWorkerPhone] = useState('');
  const [newWorkerDist, setNewWorkerDist] = useState(districts[0]?.name || 'Lucknow');
  const [workerAddedMsg, setWorkerAddedMsg] = useState('');

  // Search Filter
  const [searchQuery, setSearchQuery] = useState('');

  // Save Site Settings
  const handleSaveSettings = (e) => {
    e.preventDefault();
    updateSiteSettings({
      siteTitle,
      siteImage,
      headerMarquee
    });
    setSettingsSaved(true);
    setTimeout(() => setSettingsSaved(false), 2000);
  };

  // Add District & Admin Handler
  const handleAddDistrict = (e) => {
    e.preventDefault();
    if (!newDistName || !newRepName || !newRepPhone) return;

    const cleanDist = newDistName.trim();
    const cleanRep = newRepName.trim();
    const prefix = cleanRep.split(' ')[0].toLowerCase().replace(/[^a-z0-9]/g, '');

    // Check duplicate count
    const existingMatches = districts.filter(d => d.name.toLowerCase() === cleanDist.toLowerCase());
    const numSuffix = existingMatches.length + 1;

    const generatedAdminId = `${cleanDist.toLowerCase().replace(/\s+/g, '')}_${prefix}${numSuffix}`;
    const generatedAdminPass = `Welcome@${Math.floor(10000 + Math.random() * 90000)}`;

    addDistrict({
      name: cleanDist,
      division: newDistDivision,
      representative: cleanRep,
      phone: newRepPhone,
      email: newRepEmail || `dm${cleanDist.substring(0, 3).toLowerCase()}@nic.in`,
      adminId: generatedAdminId,
      adminPass: generatedAdminPass
    });

    setDistrictAddedMsg(`Created District "${cleanDist}"! Admin ID: ${generatedAdminId} | Pass: ${generatedAdminPass}`);
    setNewDistName('');
    setNewRepName('');
    setNewRepPhone('');
    setNewRepEmail('');
  };

  // Add Worker Handler
  const handleAddWorker = (e) => {
    e.preventDefault();
    if (!newWorkerName || !newWorkerPhone) return;

    const cleanName = newWorkerName.trim();
    const cleanPhone = newWorkerPhone.trim();
    const last4 = cleanPhone.slice(-4);
    const workerId = `${cleanName.split(' ')[0].toLowerCase().replace(/[^a-z0-9]/g, '')}${last4}`;
    const workerPass = cleanPhone;

    addWorker({
      name: cleanName,
      phone: cleanPhone,
      district: newWorkerDist,
      workerId: workerId,
      pass: workerPass
    });

    setWorkerAddedMsg(`Created Worker "${cleanName}"! Worker ID: ${workerId} | Pass: ${workerPass}`);
    setNewWorkerName('');
    setNewWorkerPhone('');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Master Top Bar */}
      <div className="bg-gradient-to-r from-purple-900 via-indigo-900 to-slate-900 rounded-2xl p-6 sm:p-8 text-white shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-purple-600/30 border border-purple-400/30 flex items-center justify-center text-purple-300">
            <ShieldAlert className="w-8 h-8" />
          </div>
          <div>
            <span className="bg-purple-500/20 text-purple-300 border border-purple-400/30 text-xs font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider">
              State Level Supervision
            </span>
            <h2 className="text-2xl font-extrabold text-white mt-1">Master Control Panel</h2>
            <p className="text-slate-300 text-xs sm:text-sm">
              Manage District Admins, Field Officers, Portal Branding, Header Marquee & Complaint Audit Logs
            </p>
          </div>
        </div>

        {/* Quick Stats Chips */}
        <div className="flex items-center gap-3">
          <div className="bg-white/10 backdrop-blur-md px-4 py-2 rounded-xl border border-white/10 text-center">
            <span className="text-[11px] text-slate-300 font-semibold block">Total Districts</span>
            <span className="text-lg font-black text-amber-400">{districts.length}</span>
          </div>
          <div className="bg-white/10 backdrop-blur-md px-4 py-2 rounded-xl border border-white/10 text-center">
            <span className="text-[11px] text-slate-300 font-semibold block">Total Field Workers</span>
            <span className="text-lg font-black text-emerald-400">{workers.length}</span>
          </div>
          <div className="bg-white/10 backdrop-blur-md px-4 py-2 rounded-xl border border-white/10 text-center">
            <span className="text-[11px] text-slate-300 font-semibold block">Total Complaints</span>
            <span className="text-lg font-black text-blue-400">{complaints.length}</span>
          </div>
        </div>
      </div>

      {/* Sub Navigation Bar */}
      <div className="flex flex-wrap items-center gap-2 p-1.5 bg-white rounded-2xl border border-slate-200 shadow-sm text-xs sm:text-sm font-semibold">
        <button
          onClick={() => setActiveSubTab('settings')}
          className={`py-2 px-4 rounded-xl flex items-center gap-2 transition-all ${
            activeSubTab === 'settings' ? 'bg-purple-900 text-white shadow-sm font-extrabold' : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Settings className="w-4 h-4" />
          Site Settings & Marquee
        </button>

        <button
          onClick={() => setActiveSubTab('districts_admins')}
          className={`py-2 px-4 rounded-xl flex items-center gap-2 transition-all ${
            activeSubTab === 'districts_admins' ? 'bg-purple-900 text-white shadow-sm font-extrabold' : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Building2 className="w-4 h-4" />
          Districts & Admins ({districts.length})
        </button>

        <button
          onClick={() => setActiveSubTab('workers')}
          className={`py-2 px-4 rounded-xl flex items-center gap-2 transition-all ${
            activeSubTab === 'workers' ? 'bg-purple-900 text-white shadow-sm font-extrabold' : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <HardHat className="w-4 h-4" />
          Field Workers ({workers.length})
        </button>

        <button
          onClick={() => setActiveSubTab('complaints_chats')}
          className={`py-2 px-4 rounded-xl flex items-center gap-2 transition-all ${
            activeSubTab === 'complaints_chats' ? 'bg-purple-900 text-white shadow-sm font-extrabold' : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <FileText className="w-4 h-4" />
          Users & Issue Chats ({complaints.length})
        </button>

        <button
          onClick={() => setActiveSubTab('leaderboard')}
          className={`py-2 px-4 rounded-xl flex items-center gap-2 transition-all ${
            activeSubTab === 'leaderboard' ? 'bg-purple-900 text-white shadow-sm font-extrabold' : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Award className="w-4 h-4 text-amber-400" />
          Honor Leaderboard
        </button>
      </div>

      {/* 1. SITE SETTINGS & MARQUEE TAB */}
      {activeSubTab === 'settings' && (
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm max-w-3xl space-y-6">
          <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
            <Settings className="w-6 h-6 text-purple-700" />
            <div>
              <h3 className="text-lg font-bold text-slate-900">Portal Branding & Client Marquee</h3>
              <p className="text-xs text-slate-500">Edit website title, logo/banner image URL, and public client notice marquee</p>
            </div>
          </div>

          {settingsSaved && (
            <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl p-3.5 text-xs flex items-center gap-2 font-bold">
              <Check className="w-4 h-4 text-emerald-600" />
              Site settings and marquee banner updated successfully!
            </div>
          )}

          <form onSubmit={handleSaveSettings} className="space-y-4">
            <div>
              <label className="label-title flex items-center gap-1.5">
                <Edit3 className="w-4 h-4 text-slate-500" />
                Portal Website Title
              </label>
              <input
                type="text"
                className="input-field"
                value={siteTitle}
                onChange={(e) => setSiteTitle(e.target.value)}
                required
              />
            </div>

            <div>
              <label className="label-title flex items-center gap-1.5">
                <Image className="w-4 h-4 text-slate-500" />
                Portal Logo / Header Image URL
              </label>
              <input
                type="url"
                className="input-field"
                value={siteImage}
                onChange={(e) => setSiteImage(e.target.value)}
                placeholder="https://..."
              />
            </div>

            <div>
              <label className="label-title flex items-center gap-1.5">
                <Megaphone className="w-4 h-4 text-amber-600" />
                Header Marquee Announcement Text (Shown on Client Page)
              </label>
              <textarea
                className="input-field min-h-[90px]"
                value={headerMarquee}
                onChange={(e) => setHeaderMarquee(e.target.value)}
                placeholder="Type scrolling marquee alert for public clients..."
              />
            </div>

            <button type="submit" className="btn-primary">
              <Check className="w-4 h-4" />
              Update Site Branding & Marquee
            </button>
          </form>
        </div>
      )}

      {/* 2. DISTRICTS & ADMINS TAB */}
      {activeSubTab === 'districts_admins' && (
        <div className="space-y-6">
          {/* Add New District & Admin Card */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
            <div className="flex items-center gap-2 mb-4">
              <UserPlus className="w-5 h-5 text-purple-700" />
              <h3 className="text-lg font-bold text-slate-900">Add New District & Representative Admin</h3>
            </div>

            {districtAddedMsg && (
              <div className="mb-4 bg-emerald-50 border border-emerald-200 text-emerald-900 rounded-xl p-3.5 text-xs font-bold font-mono">
                {districtAddedMsg}
              </div>
            )}

            <form onSubmit={handleAddDistrict} className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              <div>
                <label className="label-title">District Name</label>
                <input
                  type="text"
                  className="input-field"
                  placeholder="e.g. Kanpur Dehat"
                  value={newDistName}
                  onChange={(e) => setNewDistName(e.target.value)}
                  required
                />
              </div>

              <div>
                <label className="label-title">Division</label>
                <input
                  type="text"
                  className="input-field"
                  placeholder="e.g. Kanpur Division"
                  value={newDistDivision}
                  onChange={(e) => setNewDistDivision(e.target.value)}
                />
              </div>

              <div>
                <label className="label-title">DM Representative Name</label>
                <input
                  type="text"
                  className="input-field"
                  placeholder="e.g. Rajesh Kumar"
                  value={newRepName}
                  onChange={(e) => setNewRepName(e.target.value)}
                  required
                />
              </div>

              <div>
                <label className="label-title">Representative Mobile</label>
                <input
                  type="tel"
                  className="input-field"
                  placeholder="9454417xxx"
                  value={newRepPhone}
                  onChange={(e) => setNewRepPhone(e.target.value)}
                  required
                />
              </div>

              <div>
                <label className="label-title">Official Email</label>
                <input
                  type="email"
                  className="input-field"
                  placeholder="dmxxx@nic.in"
                  value={newRepEmail}
                  onChange={(e) => setNewRepEmail(e.target.value)}
                />
              </div>

              <div className="flex items-end">
                <button type="submit" className="btn-primary w-full justify-center">
                  <Plus className="w-4 h-4" />
                  Create Admin Account
                </button>
              </div>
            </form>
          </div>

          {/* Registered Districts & Admins List */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
              <h3 className="font-bold text-slate-900 text-sm">Registered District Administration Accounts ({districts.length})</h3>
              <div className="relative w-64">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  className="input-field py-1 pl-8 text-xs"
                  placeholder="Search district or DM..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-slate-100/70 border-b border-slate-200 text-slate-600 font-bold uppercase">
                    <th className="py-3 px-4">District</th>
                    <th className="py-3 px-4">DM Representative</th>
                    <th className="py-3 px-4">Generated Admin ID</th>
                    <th className="py-3 px-4">Password</th>
                    <th className="py-3 px-4">Contact Phone</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {districts
                    .filter(d => d.name.toLowerCase().includes(searchQuery.toLowerCase()) || d.representative.toLowerCase().includes(searchQuery.toLowerCase()))
                    .map(dist => (
                      <tr key={dist.id} className="hover:bg-slate-50">
                        <td className="py-3 px-4 font-bold text-slate-900">{dist.name}</td>
                        <td className="py-3 px-4 font-semibold text-blue-900">{dist.representative}</td>
                        <td className="py-3 px-4 font-mono font-bold text-purple-700 bg-purple-50 px-2 py-0.5 rounded border border-purple-200 inline-block my-1">
                          {dist.adminId}
                        </td>
                        <td className="py-3 px-4 font-mono text-slate-700">{dist.adminPass}</td>
                        <td className="py-3 px-4 text-slate-600">{dist.phone}</td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* 3. FIELD WORKERS TAB */}
      {activeSubTab === 'workers' && (
        <div className="space-y-6">
          {/* Add New Worker Card */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
            <div className="flex items-center gap-2 mb-4">
              <HardHat className="w-5 h-5 text-amber-600" />
              <h3 className="text-lg font-bold text-slate-900">Create New Field Worker Account</h3>
            </div>

            {workerAddedMsg && (
              <div className="mb-4 bg-emerald-50 border border-emerald-200 text-emerald-900 rounded-xl p-3.5 text-xs font-bold font-mono">
                {workerAddedMsg}
              </div>
            )}

            <form onSubmit={handleAddWorker} className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <label className="label-title">Worker Name</label>
                <input
                  type="text"
                  className="input-field"
                  placeholder="e.g. Ramesh Sharma"
                  value={newWorkerName}
                  onChange={(e) => setNewWorkerName(e.target.value)}
                  required
                />
              </div>

              <div>
                <label className="label-title">Mobile Phone Number</label>
                <input
                  type="tel"
                  className="input-field"
                  placeholder="9876543210"
                  value={newWorkerPhone}
                  onChange={(e) => setNewWorkerPhone(e.target.value)}
                  required
                />
              </div>

              <div>
                <label className="label-title">Assigned District</label>
                <select
                  className="input-field"
                  value={newWorkerDist}
                  onChange={(e) => setNewWorkerDist(e.target.value)}
                >
                  {districts.map(d => (
                    <option key={d.id} value={d.name}>{d.name}</option>
                  ))}
                </select>
              </div>

              <div className="flex items-end">
                <button type="submit" className="btn-saffron w-full justify-center">
                  <Plus className="w-4 h-4" />
                  Create Worker Credentials
                </button>
              </div>
            </form>
          </div>

          {/* Registered Workers Table */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-4 bg-slate-50 border-b border-slate-200 font-bold text-slate-900 text-sm">
              Registered Field Officers & Workers ({workers.length})
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-slate-100/70 border-b border-slate-200 text-slate-600 font-bold uppercase">
                    <th className="py-3 px-4">Worker Name</th>
                    <th className="py-3 px-4">Assigned District</th>
                    <th className="py-3 px-4">Generated Worker ID</th>
                    <th className="py-3 px-4">Password</th>
                    <th className="py-3 px-4">Mobile Number</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {workers.map(w => (
                    <tr key={w.id} className="hover:bg-slate-50">
                      <td className="py-3 px-4 font-bold text-slate-900">{w.name}</td>
                      <td className="py-3 px-4 font-semibold text-blue-800">{w.district}</td>
                      <td className="py-3 px-4 font-mono font-bold text-amber-800 bg-amber-50 px-2 py-0.5 rounded border border-amber-200 inline-block my-1">
                        {w.workerId}
                      </td>
                      <td className="py-3 px-4 font-mono text-slate-700">{w.pass}</td>
                      <td className="py-3 px-4 text-slate-600">{w.phone}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* 4. USERS, ISSUES & CHATS TAB */}
      {activeSubTab === 'complaints_chats' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div>
              <h3 className="text-lg font-bold text-slate-900">Registered Citizen Complaints & Issue Chats</h3>
              <p className="text-xs text-slate-500">Inspect complaints filed across all UP districts, check resolution status, and view discussion chats</p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-extrabold uppercase">
                  <th className="py-3 px-4">Ticket ID</th>
                  <th className="py-3 px-4">Citizen Client</th>
                  <th className="py-3 px-4">District</th>
                  <th className="py-3 px-4">Complaint Type</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Assigned Worker</th>
                  <th className="py-3 px-4 text-center">Chat Thread</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {complaints.map(cmp => (
                  <tr key={cmp.id} className="hover:bg-slate-50">
                    <td className="py-3 px-4 font-mono font-bold text-blue-900">{cmp.id}</td>
                    <td className="py-3 px-4">
                      <div className="font-bold text-slate-900">{cmp.clientName}</div>
                      <div className="text-[11px] text-slate-500">{cmp.clientPhone || cmp.clientEmail}</div>
                    </td>
                    <td className="py-3 px-4 font-semibold text-slate-800">{cmp.district}</td>
                    <td className="py-3 px-4 font-medium text-slate-700">{cmp.complaintType}</td>
                    <td className="py-3 px-4">
                      <span className={`badge ${
                        cmp.status === 'Resolved' ? 'badge-resolved' :
                        cmp.status === 'Resolve Declined' ? 'badge-declined' :
                        cmp.status === 'Worker Finalised' ? 'badge-worker' :
                        'badge-pending'
                      }`}>
                        {cmp.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-slate-700">
                      {cmp.workerName ? `${cmp.workerName} (${cmp.workerPhone})` : 'Unassigned'}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <button
                        onClick={() => setSelectedComplaintForChat(cmp)}
                        className="btn-secondary py-1 px-3 text-xs"
                      >
                        <MessageSquare className="w-3.5 h-3.5 text-blue-600" />
                        View Chat
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 5. HONOR LEADERBOARD TAB */}
      {activeSubTab === 'leaderboard' && (
        <Leaderboard />
      )}

      {/* Chat Modal for Master Audit */}
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
