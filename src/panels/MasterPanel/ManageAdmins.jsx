import React, { useState, useEffect } from 'react';
import { getUsersByRole, getDistricts } from '../../services/firestore';
import { createAuthAccount } from '../../services/auth';
import { createUser } from '../../services/firestore';
import { generateAdminId, generateAdminPassword, makeEmailFromId } from '../../utils/helpers';
import { useToast } from '../../components/Toast';

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
      toast.success('Admin created!');
      setName(''); setPhone(''); setDistrictId(''); setEmail('');
      loadData();
    } catch (err) {
      toast.error('Failed: ' + err.message);
    }
    setCreating(false);
  };

  return (
    <div className="panel-section">
      <div className="panel-section__header">
        <h2>Manage Admins</h2>
        <button className="btn btn--primary" onClick={() => setShowForm(!showForm)}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
          Create Admin
        </button>
      </div>

      {showForm && (
        <div className="form-card">
          <div className="form-row">
            <div className="form-group"><label>Name</label><input className="input" value={name} onChange={e => setName(e.target.value)} placeholder="Representative name" /></div>
            <div className="form-group"><label>Phone</label><input className="input" value={phone} onChange={e => setPhone(e.target.value)} placeholder="Phone number" /></div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>District</label>
              <select className="input" value={districtId} onChange={e => setDistrictId(e.target.value)}>
                <option value="">Select District</option>
                {districts.map(d => <option key={d.id} value={d.id}>{d.nameEnglish} ({d.nameHindi})</option>)}
              </select>
            </div>
            <div className="form-group"><label>Email</label><input className="input" value={email} onChange={e => setEmail(e.target.value)} placeholder="Optional email" /></div>
          </div>
          <button className="btn btn--primary" onClick={handleCreate} disabled={creating}>{creating ? 'Creating...' : 'Create Admin'}</button>
        </div>
      )}

      {createdCreds && (
        <div className="creds-modal">
          <div className="creds-card">
            <h3>Admin Created Successfully!</h3>
            <div className="creds-item"><span>User ID:</span><strong>{createdCreds.userId}</strong></div>
            <div className="creds-item"><span>Password:</span><strong>{createdCreds.password}</strong></div>
            <p className="creds-warning">Please save these credentials. The password cannot be recovered.</p>
            <button className="btn btn--primary" onClick={() => setCreatedCreds(null)}>Close</button>
          </div>
        </div>
      )}

      <div className="data-table-wrap">
        <table className="data-table">
          <thead><tr><th>Name</th><th>User ID</th><th>District</th><th>Phone</th></tr></thead>
          <tbody>
            {loading ? (
              <tr><td colSpan="4" className="text-center">Loading...</td></tr>
            ) : admins.length === 0 ? (
              <tr><td colSpan="4" className="text-center">No admins yet</td></tr>
            ) : admins.map(a => (
              <tr key={a.id}><td>{a.name}</td><td><code>{a.userId}</code></td><td>{a.districtId}</td><td>{a.phone}</td></tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
