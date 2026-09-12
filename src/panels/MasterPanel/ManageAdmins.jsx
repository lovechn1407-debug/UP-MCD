import React, { useState, useEffect } from 'react';
import { getUsersByRole, getDistricts, createUser } from '../../services/firestore';
import { createAuthAccount } from '../../services/auth';
import { generateAdminId, generateAdminPassword, makeEmailFromId } from '../../utils/helpers';
import { useToast } from '../../components/Toast';
import { ShieldCheck, Plus, User, Phone, MapPin, Key, Loader2, CheckCircle2, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function ManageAdmins() {
  const [admins, setAdmins] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [districtId, setDistrictId] = useState('');
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [createdCreds, setCreatedCreds] = useState(null);
  const toast = useToast();

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    const [a, d] = await Promise.all([getUsersByRole('admin'), getDistricts()]);
    setAdmins(a);
    setDistricts(d);
    setLoading(false);
  };

  const handleCreate = async () => {
    if (!name || !districtId) { toast.error('Name and District are required'); return; }
    setCreating(true);
    try {
      const dist = districts.find(d => d.id === districtId);
      const userId = generateAdminId(dist.nameEnglish, name);
      const password = generateAdminPassword();
      const authEmail = makeEmailFromId(userId);

      const uid = await createAuthAccount(userId, password);
      const finalUid = uid || `admin_${districtId}_${Date.now()}`;

      await createUser(finalUid, {
        uid: finalUid, role: 'admin', userId, name,
        email: authEmail, phone, address: `${dist.nameEnglish}, UP`,
        profilePic: '', districtId, divisionId: dist.divisionId || '',
        adminId: '', password
      });

      setCreatedCreds({ userId, password });
      toast.success('District Admin account created!');
      setName(''); setPhone(''); setDistrictId(''); setEmail('');
      setShowForm(false);
      loadData();
    } catch (err) {
      toast.error('Failed to create admin: ' + err.message);
    }
    setCreating(false);
  };

  return (
    <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-purple-50 border border-purple-200 flex items-center justify-center text-purple-600 shadow-sm">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-900">Manage District Admins</h2>
            <p className="text-xs text-slate-500">Create & manage District Magistrates / MCD Officers</p>
          </div>
        </div>

        <button
          onClick={() => setShowForm(!showForm)}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md shadow-blue-500/20 transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>{showForm ? 'Close Form' : 'Create New Admin'}</span>
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
            <h3 className="text-sm font-bold text-slate-900">New Admin Account Details</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">Representative Name</label>
                <input
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:border-blue-500 focus:bg-white"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder="e.g. Rajesh Kumar"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">District</label>
                <select
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:border-blue-500 focus:bg-white"
                  value={districtId}
                  onChange={e => setDistrictId(e.target.value)}
                >
                  <option value="">Select UP District</option>
                  {districts.map(d => (
                    <option key={d.id} value={d.id}>{d.nameEnglish} ({d.nameHindi})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">Phone Number</label>
                <input
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:border-blue-500 focus:bg-white"
                  value={phone}
                  onChange={e => setPhone(e.target.value)}
                  placeholder="Official mobile number"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">Email (Optional)</label>
                <input
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:border-blue-500 focus:bg-white"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="Official gov email"
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
                {creating ? 'Creating Account...' : 'Confirm & Create Admin'}
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
                <h3 className="text-lg font-bold text-slate-900">Admin Account Created!</h3>
                <p className="text-xs text-slate-500">Save credentials below for the new admin</p>
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

      {/* Data Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs text-slate-700">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50/70 text-slate-500 font-semibold uppercase tracking-wider">
              <th className="py-3 px-4">Admin Name</th>
              <th className="py-3 px-4">User ID</th>
              <th className="py-3 px-4">Password</th>
              <th className="py-3 px-4">District</th>
              <th className="py-3 px-4">Phone</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {loading ? (
              <tr><td colSpan="5" className="py-8 text-center text-slate-400">Loading admins...</td></tr>
            ) : admins.length === 0 ? (
              <tr><td colSpan="5" className="py-8 text-center text-slate-400">No district admins registered yet</td></tr>
            ) : admins.map(a => (
              <tr key={a.id} className="hover:bg-slate-50/80 transition-colors">
                <td className="py-3.5 px-4 font-bold text-slate-900">{a.name}</td>
                <td className="py-3.5 px-4"><code className="bg-slate-100 px-2 py-0.5 rounded border text-blue-700 font-bold">{a.userId}</code></td>
                <td className="py-3.5 px-4"><code className="bg-slate-100 px-2 py-0.5 rounded border text-slate-700 font-semibold">{a.password}</code></td>
                <td className="py-3.5 px-4 font-semibold text-slate-800">{a.districtId}</td>
                <td className="py-3.5 px-4 text-slate-600">{a.phone || '—'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
