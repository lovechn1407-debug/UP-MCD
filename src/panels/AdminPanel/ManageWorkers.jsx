import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { getWorkersByAdmin, createUser } from '../../services/firestore';
import { createAuthAccount } from '../../services/auth';
import { generateWorkerId, generateWorkerPassword, makeEmailFromId } from '../../utils/helpers';
import { useToast } from '../../components/Toast';

export default function AdminManageWorkers() {
  const { userData } = useAuth();
  const toast = useToast();
  const [workers, setWorkers] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [creating, setCreating] = useState(false);
  const [createdCreds, setCreatedCreds] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => { if (userData?.districtId) loadWorkers(); }, [userData]);

  const loadWorkers = async () => {
    setWorkers(await getWorkersByAdmin(userData.districtId));
    setLoading(false);
  };

  const handleCreate = async () => {
    if (!name || !phone) { toast.error('Name and phone required'); return; }
    setCreating(true);
    try {
      const userId = generateWorkerId(name, phone);
      const password = generateWorkerPassword(phone);
      const authEmail = makeEmailFromId(userId);
      const uid = await createAuthAccount(userId, password);
      const finalUid = uid || `worker_${Date.now()}`;

      await createUser(finalUid, {
        uid: finalUid, role: 'worker', userId, name,
        email: authEmail, phone, address, profilePic: '',
        districtId: userData.districtId, divisionId: userData.divisionId || '',
        adminId: userData.id, password
      });

      setCreatedCreds({ userId, password });
      toast.success('Worker created!');
      setName(''); setPhone(''); setAddress('');
      loadWorkers();
    } catch (err) { toast.error(err.message); }
    setCreating(false);
  };

  return (
    <div className="panel-section">
      <div className="panel-section__header">
        <h2>My Workers</h2>
        <button className="btn btn--primary" onClick={() => setShowForm(!showForm)}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
          Add Worker
        </button>
      </div>

      {showForm && (
        <div className="form-card">
          <div className="form-row">
            <div className="form-group"><label>Name</label><input className="input" value={name} onChange={e => setName(e.target.value)} /></div>
            <div className="form-group"><label>Mobile</label><input className="input" value={phone} onChange={e => setPhone(e.target.value)} /></div>
          </div>
          <div className="form-group"><label>Address</label><input className="input" value={address} onChange={e => setAddress(e.target.value)} /></div>
          <button className="btn btn--primary" onClick={handleCreate} disabled={creating}>{creating ? 'Creating...' : 'Create Worker'}</button>
        </div>
      )}

      {createdCreds && (
        <div className="creds-modal"><div className="creds-card">
          <h3>Worker Created!</h3>
          <div className="creds-item"><span>User ID:</span><strong>{createdCreds.userId}</strong></div>
          <div className="creds-item"><span>Password:</span><strong>{createdCreds.password}</strong></div>
          <button className="btn btn--primary" onClick={() => setCreatedCreds(null)}>Close</button>
        </div></div>
      )}

      <div className="data-table-wrap">
        <table className="data-table">
          <thead><tr><th>Name</th><th>User ID</th><th>Phone</th><th>Address</th></tr></thead>
          <tbody>
            {loading ? <tr><td colSpan="4">Loading...</td></tr> :
              workers.length === 0 ? <tr><td colSpan="4" className="text-center">No workers added yet</td></tr> :
              workers.map(w => <tr key={w.id}><td>{w.name}</td><td><code>{w.userId}</code></td><td>{w.phone}</td><td>{w.address}</td></tr>)}
          </tbody>
        </table>
      </div>
    </div>
  );
}
