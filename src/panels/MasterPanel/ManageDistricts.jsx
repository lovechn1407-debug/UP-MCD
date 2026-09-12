import React, { useState, useEffect } from 'react';
import { getDistricts, getDivisions, createDivision, createDistrict } from '../../services/firestore';
import { useToast } from '../../components/Toast';
import { Building2, Plus, MapPin, Phone, Mail, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function ManageDistricts() {
  const [divisions, setDivisions] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [divisionId, setDivisionId] = useState('');
  const [newDivision, setNewDivision] = useState('');
  const [distNameEn, setDistNameEn] = useState('');
  const [distNameHi, setDistNameHi] = useState('');
  const [repName, setRepName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const toast = useToast();

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    const [divs, dists] = await Promise.all([getDivisions(), getDistricts()]);
    setDivisions(divs);
    setDistricts(dists);
    setLoading(false);
  };

  const handleCreate = async () => {
    if (!distNameEn || !repName) { toast.error('District name and representative required'); return; }
    setCreating(true);
    try {
      let divId = divisionId;
      if (newDivision && !divisionId) {
        divId = newDivision.toLowerCase().replace(/\s+/g, '_');
        await createDivision(divId, { nameHindi: '', nameEnglish: newDivision, commissionerName: '', commissionerPhone: '', commissionerEmail: '' });
      }
      const distId = distNameEn.toLowerCase().replace(/\s+/g, '_');
      await createDistrict(distId, {
        divisionId: divId, nameHindi: distNameHi, nameEnglish: distNameEn,
        representativeName: repName, phone, email, adminUserId: '',
        honorScore: 0, totalIssues: 0, resolvedIssues: 0, unfulfilledIssues: 0
      });
      toast.success('District added successfully!');
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
          <div className="w-12 h-12 rounded-2xl bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-600 shadow-sm">
            <Building2 className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-900">Manage UP Districts</h2>
            <p className="text-xs text-slate-500">Configure Uttar Pradesh Municipal Corporations & Divisions</p>
          </div>
        </div>

        <button
          onClick={() => setShowForm(!showForm)}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md shadow-blue-500/20 transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>{showForm ? 'Close Form' : 'Add New District'}</span>
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
            <h3 className="text-sm font-bold text-slate-900">Add District Configuration</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">Division</label>
                <select
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:border-blue-500 focus:bg-white"
                  value={divisionId}
                  onChange={e => setDivisionId(e.target.value)}
                >
                  <option value="">Select Existing Division</option>
                  {divisions.map(d => <option key={d.id} value={d.id}>{d.nameEnglish}</option>)}
                </select>
              </div>

              {!divisionId && (
                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">Or Create New Division</label>
                  <input
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:border-blue-500 focus:bg-white"
                    value={newDivision}
                    onChange={e => setNewDivision(e.target.value)}
                    placeholder="e.g. Lucknow Division"
                  />
                </div>
              )}

              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">District Name (English)</label>
                <input
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:border-blue-500 focus:bg-white"
                  value={distNameEn}
                  onChange={e => setDistNameEn(e.target.value)}
                  placeholder="e.g. Lucknow"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">District Name (Hindi)</label>
                <input
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:border-blue-500 focus:bg-white"
                  value={distNameHi}
                  onChange={e => setDistNameHi(e.target.value)}
                  placeholder="e.g. लखनऊ"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">Representative Name</label>
                <input
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:border-blue-500 focus:bg-white"
                  value={repName}
                  onChange={e => setRepName(e.target.value)}
                  placeholder="DM / Mayor Name"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">Phone</label>
                <input
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:border-blue-500 focus:bg-white"
                  value={phone}
                  onChange={e => setPhone(e.target.value)}
                  placeholder="Contact phone"
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
                {creating ? 'Adding...' : 'Save District'}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs text-slate-700">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50/70 text-slate-500 font-semibold uppercase tracking-wider">
              <th className="py-3 px-4">District (En)</th>
              <th className="py-3 px-4">Hindi</th>
              <th className="py-3 px-4">Representative</th>
              <th className="py-3 px-4">Phone</th>
              <th className="py-3 px-4">Division</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {loading ? (
              <tr><td colSpan="5" className="py-8 text-center text-slate-400">Loading districts...</td></tr>
            ) : districts.map(d => (
              <tr key={d.id} className="hover:bg-slate-50/80 transition-colors">
                <td className="py-3.5 px-4 font-bold text-slate-900 flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-blue-600" />
                  {d.nameEnglish}
                </td>
                <td className="py-3.5 px-4 font-medium text-slate-600">{d.nameHindi || '—'}</td>
                <td className="py-3.5 px-4 font-semibold text-slate-800">{d.representativeName || '—'}</td>
                <td className="py-3.5 px-4 text-slate-600">{d.phone || '—'}</td>
                <td className="py-3.5 px-4 font-mono text-slate-500 uppercase">{d.divisionId || '—'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
