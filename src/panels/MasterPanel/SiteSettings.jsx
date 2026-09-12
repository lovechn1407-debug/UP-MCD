import React, { useState, useEffect } from 'react';
import { getSettings, updateSettings } from '../../services/firestore';
import { uploadToImgbb } from '../../services/imgbb';
import { seedDatabase } from '../../services/seedData';
import { useToast } from '../../components/Toast';
import { Settings, Database, Save, Upload, Loader2, Sparkles, CheckCircle2 } from 'lucide-react';

export default function SiteSettings() {
  const [title, setTitle] = useState('');
  const [marquee, setMarquee] = useState('');
  const [logo, setLogo] = useState('');
  const [saving, setSaving] = useState(false);
  const [seeding, setSeeding] = useState(false);
  const [seedResult, setSeedResult] = useState(null);
  const toast = useToast();

  useEffect(() => { loadSettings(); }, []);

  const loadSettings = async () => {
    const s = await getSettings();
    if (s) {
      setTitle(s.siteTitle || '');
      setMarquee(s.marqueeText || '');
      setLogo(s.siteLogo || '');
    }
  };

  const handleSave = async () => {
    setSaving(true);
    await updateSettings({ siteTitle: title, marqueeText: marquee, siteLogo: logo });
    toast.success('Settings saved!');
    setSaving(false);
  };

  const handleLogoUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    try {
      const url = await uploadToImgbb(file);
      setLogo(url);
      toast.success('Logo uploaded!');
    } catch (err) { toast.error('Upload failed'); }
  };

  const handleSeed = async () => {
    if (!confirm('This will seed ALL division, district, and admin data. Continue?')) return;
    setSeeding(true);
    const result = await seedDatabase(true);
    setSeedResult(result);
    setSeeding(false);
    if (result.success) toast.success(result.message);
    else toast.error(result.message);
  };

  return (
    <div className="space-y-6">
      {/* Site Customization */}
      <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-6">
        <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
          <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-600">
            <Settings className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-900">Portal Branding & Settings</h2>
            <p className="text-xs text-slate-500">Configure global website title, marquee banner & emblem</p>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <label className="text-xs font-semibold text-slate-700 block mb-1">Site Title</label>
            <input
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:border-blue-500"
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="UP Municipal Civic Desk"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-700 block mb-1">Header Marquee Announcement</label>
            <textarea
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:border-blue-500 resize-none"
              value={marquee}
              onChange={e => setMarquee(e.target.value)}
              rows={2}
              placeholder="Notice banner scrolling text across citizen portal..."
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-700 block mb-1">Custom Logo / Emblem</label>
            <div className="flex items-center gap-4 p-3 rounded-2xl bg-slate-50 border border-slate-200">
              {logo && <img src={logo} alt="Logo" className="w-12 h-12 object-contain rounded-lg border bg-white p-1" />}
              <label className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white border border-slate-200 hover:bg-slate-100 text-xs font-semibold text-slate-700 cursor-pointer shadow-xs">
                <Upload className="w-4 h-4 text-blue-600" />
                Upload New Logo
                <input type="file" accept="image/*" onChange={handleLogoUpload} className="hidden" />
              </label>
            </div>
          </div>
        </div>

        <div className="flex justify-end pt-2 border-t border-slate-100">
          <button
            onClick={handleSave}
            disabled={saving}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md shadow-blue-500/20 transition-all disabled:opacity-50"
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            {saving ? 'Saving...' : 'Save Settings'}
          </button>
        </div>
      </div>

      {/* Database Seeding Card */}
      <div className="bg-white border border-amber-200 rounded-3xl p-6 shadow-sm space-y-4">
        <div className="flex items-center gap-3 border-b border-amber-100 pb-4">
          <div className="w-10 h-10 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-600">
            <Database className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-900">Database Seeding Engine</h3>
            <p className="text-xs text-slate-500">Seed initial 18 Divisions, 75 Districts & 75 District Admin accounts in Firestore</p>
          </div>
        </div>

        <p className="text-xs text-slate-600 leading-relaxed">
          Running seed will automatically generate official DM login accounts and district profiles for all 75 Uttar Pradesh districts.
        </p>

        <button
          onClick={handleSeed}
          disabled={seeding}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs shadow-md shadow-amber-500/20 transition-all disabled:opacity-50"
        >
          {seeding ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
          {seeding ? 'Seeding Database... (please wait)' : 'Seed All 75 Districts & Admins'}
        </button>

        {seedResult?.credentials?.length > 0 && (
          <div className="mt-4 border border-slate-200 rounded-2xl overflow-hidden max-h-72 overflow-y-auto">
            <table className="w-full text-left text-xs text-slate-700">
              <thead className="bg-slate-50 text-slate-500 font-semibold sticky top-0 border-b border-slate-200">
                <tr>
                  <th className="py-2.5 px-3">Role</th>
                  <th className="py-2.5 px-3">District</th>
                  <th className="py-2.5 px-3">User ID</th>
                  <th className="py-2.5 px-3">Password</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {seedResult.credentials.map((c, i) => (
                  <tr key={i} className="hover:bg-slate-50">
                    <td className="py-2 px-3 font-semibold text-slate-800">{c.role}</td>
                    <td className="py-2 px-3">{c.district || '—'}</td>
                    <td className="py-2 px-3"><code className="text-blue-700 font-bold">{c.userId}</code></td>
                    <td className="py-2 px-3"><code>{c.password}</code></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
