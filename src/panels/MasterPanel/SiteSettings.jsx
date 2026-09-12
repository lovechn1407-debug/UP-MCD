import React, { useState, useEffect } from 'react';
import { getSettings, updateSettings } from '../../services/firestore';
import { uploadToImgbb } from '../../services/imgbb';
import { seedDatabase } from '../../services/seedData';
import { useToast } from '../../components/Toast';

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
    <div className="panel-section">
      <h2>Site Settings</h2>
      <div className="form-card">
        <div className="form-group">
          <label>Site Title</label>
          <input className="input" value={title} onChange={e => setTitle(e.target.value)} placeholder="UP Municipal Civic Desk" />
        </div>
        <div className="form-group">
          <label>Header Marquee Text</label>
          <textarea className="input textarea" value={marquee} onChange={e => setMarquee(e.target.value)} rows={3} placeholder="Scrolling text shown on client pages..." />
        </div>
        <div className="form-group">
          <label>Site Logo</label>
          <div className="logo-upload">
            {logo && <img src={logo} alt="Logo" className="logo-preview" />}
            <label className="btn btn--outline btn--sm">
              Upload Logo
              <input type="file" accept="image/*" onChange={handleLogoUpload} style={{ display: 'none' }} />
            </label>
          </div>
        </div>
        <button className="btn btn--primary" onClick={handleSave} disabled={saving}>
          {saving ? 'Saving...' : 'Save Settings'}
        </button>
      </div>

      <div className="form-card" style={{ marginTop: '2rem', borderLeft: '4px solid #F59E0B' }}>
        <h3>Database Seeding</h3>
        <p style={{ color: '#64748B', marginBottom: '1rem' }}>Seed all 18 divisions, 75 districts, and admin accounts. Only runs once.</p>
        <button className="btn btn--warning" onClick={handleSeed} disabled={seeding}>
          {seeding ? 'Seeding... (this may take a minute)' : 'Seed Database'}
        </button>
        {seedResult?.credentials?.length > 0 && (
          <div style={{ marginTop: '1rem', maxHeight: '300px', overflow: 'auto' }}>
            <table className="data-table">
              <thead><tr><th>Role</th><th>District</th><th>User ID</th><th>Password</th></tr></thead>
              <tbody>
                {seedResult.credentials.map((c, i) => (
                  <tr key={i}><td>{c.role}</td><td>{c.district || '—'}</td><td><code>{c.userId}</code></td><td><code>{c.password}</code></td></tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
