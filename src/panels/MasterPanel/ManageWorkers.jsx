import React, { useState, useEffect } from 'react';
import { getUsersByRole, getDistricts, createUser } from '../../services/firestore';
import { createAuthAccount } from '../../services/auth';
import { generateWorkerId, generateWorkerPassword, makeEmailFromId } from '../../utils/helpers';
import { useToast } from '../../components/Toast';
import { Wrench, Plus, CheckCircle2, Loader2, MapPin, Phone } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function ManageWorkersMaster() {
  const [workers, setWorkers] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [admins, setAdmins] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [districtId, setDistrictId] = useState('');
  const [creating, setCreating] = useState(false);
  const [createdCreds, setCreatedCreds] = useState(null);
  const [loading, setLoading] = useState(true);
  const toast = useToast();

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    const [w, d, a] = await Promise.all([getUsersByRole('worker'), getDistricts(), getUsersByRole('admin')]);
    setWorkers(w); setDistricts(d); setAdmins(a);
    setLoading(false);
  };

  const handleCreate = async () => {
    if (!name || !phone || !districtId) { toast.error('Name, phone, and district required'); return; }
    setCreating(true);
    try {
      const userId = generateWorkerId(name, phone);
      const password = generateWorkerPassword(phone);
      const authEmail = makeEmailFromId(userId);
      const uid = await createAuthAccount(userId, password);
      const finalUid = uid || `worker_${Date.now()}`;
      const admin = admins.find(a => a.districtId === districtId);

      await createUser(finalUid, {
        uid: finalUid, role: 'worker', userId, name,
        email: authEmail, phone, address,
        profilePic: '', districtId,
        divisionId: admin?.divisionId || '',
        adminId: admin?.id || '', password
      });

      setCreatedCreds({ userId, password });
      toast.success('Worker account created!');
      setName(''); setPhone(''); setAddress(''); setDistrictId('');
      setShowForm(false);
      loadData();
    } catch (err) { toast.error(err.message); }
    setCreating(false);
  };

  return (
    <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600 shadow-sm">
            <Wrench className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-900">Manage All Municipal Workers</h2>
            <p className="text-xs text-slate-500">System-wide directory of field workers across UP districts</p>
          </div>
        </div>

        <button
          onClick={() => setShowForm(!showForm)}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md shadow-blue-500/20 transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>{showForm ? 'Close Form' : 'Register New Worker'}</span>
        </button>
      </div>

      {/* Form Drawer */}
      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-4 overflow-hidden"
          >
            <h3 className="text-sm font-bold text-slate-900">Register Field Worker</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">Worker Name</label>
                <input
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:border-blue-500 focus:bg-white"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder="e.g. Ramesh Kumar"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">Mobile Number (Password)</label>
                <input
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:border-blue-500 focus:bg-white"
                  value={phone}
                  onChange={e => setPhone(e.target.value)}
                  placeholder="10-digit mobile number"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">District</label>
                <select
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:border-blue-500 focus:bg-white"
                  value={districtId}
                  onChange={e => setDistrictId(e.target.value)}
                >
                  <option value="">Select District</option>
                  {districts.map(d => <option key={d.id} value={d.id}>{d.nameEnglish}</option>)}
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">Area / Ward Address</label>
                <input
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:border-blue-500 focus:bg-white"
                  value={address}
                  onChange={e => setAddress(e.target.value)}
                  placeholder="e.g. Zone 4, Gomti Nagar"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={handleCreate}
                disabled={creating}
                className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-sm transition-all disabled:opacity-50"
              >
                {creating ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Plus className="w-3.5 h-3.5" />}
                {creating ? 'Creating...' : 'Register Worker'}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Creds Modal Popup */}
      {createdCreds && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
          <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-2xl max-w-md w-full space-y-4">
            <div className="flex items-center gap-3 text-emerald-600">
              <CheckCircle2 className="w-8 h-8 shrink-0" />
              <div>
                <h3 className="text-lg font-bold text-slate-900">Worker Registered!</h3>
                <p className="text-xs text-slate-500">Provide login credentials to the worker</p>
              </div>
            </div>

            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-2 font-mono text-sm">
              <div className="flex justify-between border-b border-slate-200 pb-2">
                <span className="text-slate-500 text-xs">User ID:</span>
                <strong className="text-blue-700 font-bold">{createdCreds.userId}</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 text-xs">Password:</span>
                <strong className="text-slate-900 font-bold">{createdCreds.password}</strong>
              </div>
            </div>

            <button
              onClick={() => setCreatedCreds(null)}
              className="w-full py-2.5 rounded-xl bg-blue-600 text-white font-bold text-xs hover:bg-blue-700 transition-all"
            >
              Done & Close
            </button>
          </div>
        </div>
      )}

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs text-slate-700">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50/70 text-slate-500 font-semibold uppercase tracking-wider">
              <th className="py-3 px-4">Worker Name</th>
              <th className="py-3 px-4">User ID</th>
              <th className="py-3 px-4">Password</th>
              <th className="py-3 px-4">Phone</th>
              <th className="py-3 px-4">District</th>
              <th className="py-3 px-4">Ward Address</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {loading ? (
              <tr><td colSpan="6" className="py-8 text-center text-slate-400">Loading field workers...</td></tr>
            ) : workers.length === 0 ? (
              <tr><td colSpan="6" className="py-8 text-center text-slate-400">No field workers registered yet</td></tr>
            ) : workers.map(w => (
              <tr key={w.id} className="hover:bg-slate-50/80 transition-colors">
                <td className="py-3.5 px-4 font-bold text-slate-900">{w.name}</td>
                <td className="py-3.5 px-4"><code className="bg-slate-100 px-2 py-0.5 rounded border text-blue-700 font-bold">{w.userId}</code></td>
                <td className="py-3.5 px-4"><code className="bg-slate-100 px-2 py-0.5 rounded border text-slate-700 font-semibold">{w.password}</code></td>
                <td className="py-3.5 px-4 text-slate-600">{w.phone}</td>
                <td className="py-3.5 px-4 font-semibold text-slate-800">{w.districtId}</td>
                <td className="py-3.5 px-4 text-slate-500">{w.address || '—'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
