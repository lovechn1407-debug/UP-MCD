import React, { useState, useEffect } from 'react';
import { getDistricts, getDivisions, createDivision, createDistrict } from '../../services/firestore';
import { useToast } from '../../components/Toast';

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
      toast.success('District added!');
      setShowForm(false);
      loadData();
    } catch (err) { toast.error(err.message); }
  };

  return (
    <div className="panel-section">
      <div className="panel-section__header">
        <h2>Manage Districts</h2>
        <button className="btn btn--primary" onClick={() => setShowForm(!showForm)}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
          Add District
        </button>
      </div>

      {showForm && (
        <div className="form-card">
          <div className="form-group">
            <label>Division</label>
            <select className="input" value={divisionId} onChange={e => setDivisionId(e.target.value)}>
              <option value="">Select or create new</option>
              {divisions.map(d => <option key={d.id} value={d.id}>{d.nameEnglish}</option>)}
            </select>
          </div>
          {!divisionId && <div className="form-group"><label>New Division Name</label><input className="input" value={newDivision} onChange={e => setNewDivision(e.target.value)} /></div>}
          <div className="form-row">
            <div className="form-group"><label>District (English)</label><input className="input" value={distNameEn} onChange={e => setDistNameEn(e.target.value)} /></div>
            <div className="form-group"><label>District (Hindi)</label><input className="input" value={distNameHi} onChange={e => setDistNameHi(e.target.value)} /></div>
          </div>
          <div className="form-row">
            <div className="form-group"><label>Representative</label><input className="input" value={repName} onChange={e => setRepName(e.target.value)} /></div>
            <div className="form-group"><label>Phone</label><input className="input" value={phone} onChange={e => setPhone(e.target.value)} /></div>
          </div>
          <div className="form-group"><label>Email</label><input className="input" value={email} onChange={e => setEmail(e.target.value)} /></div>
          <button className="btn btn--primary" onClick={handleCreate}>Add District</button>
        </div>
      )}

      <div className="data-table-wrap">
        <table className="data-table">
          <thead><tr><th>District</th><th>Hindi</th><th>Representative</th><th>Phone</th><th>Division</th></tr></thead>
          <tbody>
            {loading ? <tr><td colSpan="5" className="text-center">Loading...</td></tr> :
              districts.map(d => (
                <tr key={d.id}><td>{d.nameEnglish}</td><td>{d.nameHindi}</td><td>{d.representativeName}</td><td>{d.phone}</td><td>{d.divisionId}</td></tr>
              ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
