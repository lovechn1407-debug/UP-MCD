import React, { useState, useEffect } from 'react';
import { getUsersByRole, getDistricts, createUser } from '../../services/firestore';
import { createAuthAccount } from '../../services/auth';
import { generateWorkerId, generateWorkerPassword, makeEmailFromId } from '../../utils/helpers';
import { useToast } from '../../components/Toast';

export default function ManageWorkers() {
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
      toast.success('Worker created!');
      setName(''); setPhone(''); setAddress(''); setDistrictId('');
      loadData();
    } catch (err) { toast.error(err.message); }
    setCreating(false);
  };

  return (
    <div className="panel-section">
      <div className="panel-section__header">
        <h2>Manage Workers</h2>
        <button className="btn btn--primary" onClick={() => setShowForm(!showForm)}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
          Create Worker
        </button>
      </div>

      {showForm && (
        <div className="form-card">
          <div className="form-row">
            <div className="form-group"><label>Name</label><input className="input" value={name} onChange={e => setName(e.target.value)} /></div>
            <div className="form-group"><label>Mobile</label><input className="input" value={phone} onChange={e => setPhone(e.target.value)} placeholder="10-digit mobile" /></div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>District</label>
              <select className="input" value={districtId} onChange={e => setDistrictId(e.target.value)}>
                <option value="">Select District</option>
                {districts.map(d => <option key={d.id} value={d.id}>{d.nameEnglish}</option>)}
              </select>
            </div>
            <div className="form-group"><label>Address</label><input className="input" value={address} onChange={e => setAddress(e.target.value)} /></div>
          </div>
          <button className="btn btn--primary" onClick={handleCreate} disabled={creating}>{creating ? 'Creating...' : 'Create Worker'}</button>
        </div>
      )}

      {createdCreds && (
        <div className="creds-modal">
          <div className="creds-card">
            <h3>Worker Created!</h3>
            <div className="creds-item"><span>User ID:</span><strong>{createdCreds.userId}</strong></div>
            <div className="creds-item"><span>Password:</span><strong>{createdCreds.password}</strong></div>
            <p className="creds-warning">Share these with the worker. Password = mobile number.</p>
            <button className="btn btn--primary" onClick={() => setCreatedCreds(null)}>Close</button>
          </div>
        </div>
      )}

      <div className="data-table-wrap">
        <table className="data-table">
          <thead><tr><th>Name</th><th>User ID</th><th>Password</th><th>Phone</th><th>District</th><th>Address</th></tr></thead>
          <tbody>
            {loading ? <tr><td colSpan="6" className="text-center">Loading...</td></tr> :
              workers.length === 0 ? <tr><td colSpan="6" className="text-center">No workers yet</td></tr> :
              workers.map(w => (
                <tr key={w.id}><td>{w.name}</td><td><code>{w.userId}</code></td><td><code>{w.password}</code></td><td>{w.phone}</td><td>{w.districtId}</td><td>{w.address}</td></tr>
              ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
