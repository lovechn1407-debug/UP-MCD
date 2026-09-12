import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from './Toast';
import { updateUser } from '../services/firestore';
import { changePassword } from '../services/auth';
import { uploadToImgbb } from '../services/imgbb';

export default function ProfileModal({ onClose }) {
  const { userData, refreshUserData } = useAuth();
  const toast = useToast();
  const [name, setName] = useState(userData?.name || '');
  const [phone, setPhone] = useState(userData?.phone || '');
  const [address, setAddress] = useState(userData?.address || '');
  const [newPassword, setNewPassword] = useState('');
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);

  const handlePhotoUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true);
    try {
      const url = await uploadToImgbb(file);
      await updateUser(userData.id, { profilePic: url });
      await refreshUserData();
      toast.success('Profile photo updated!');
    } catch (err) {
      toast.error('Failed to upload photo');
    }
    setUploading(false);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await updateUser(userData.id, { name, phone, address });
      if (newPassword && userData.role !== 'client') {
        await changePassword(newPassword);
        await updateUser(userData.id, { password: newPassword });
      }
      await refreshUserData();
      toast.success('Profile updated!');
      onClose();
    } catch (err) {
      toast.error('Failed to update profile: ' + err.message);
    }
    setSaving(false);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <div className="modal__header">
          <h2>Profile Settings</h2>
          <button className="modal__close" onClick={onClose}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>

        <div className="modal__body">
          <div className="profile-photo-section">
            <div className="profile-photo">
              {userData?.profilePic ? (
                <img src={userData.profilePic} alt="Profile" />
              ) : (
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#94A3B8" strokeWidth="1.5">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
                </svg>
              )}
            </div>
            <label className="btn btn--outline btn--sm">
              {uploading ? 'Uploading...' : 'Change Photo'}
              <input type="file" accept="image/*" onChange={handlePhotoUpload} style={{ display: 'none' }} />
            </label>
          </div>

          <div className="form-group">
            <label>User ID</label>
            <input type="text" value={userData?.userId || ''} disabled className="input" />
          </div>
          <div className="form-group">
            <label>Role</label>
            <input type="text" value={userData?.role?.toUpperCase() || ''} disabled className="input" />
          </div>
          <div className="form-group">
            <label>Name</label>
            <input type="text" value={name} onChange={e => setName(e.target.value)} className="input" />
          </div>
          <div className="form-group">
            <label>Phone</label>
            <input type="tel" value={phone} onChange={e => setPhone(e.target.value)} className="input" />
          </div>
          <div className="form-group">
            <label>Address</label>
            <textarea value={address} onChange={e => setAddress(e.target.value)} className="input textarea" rows={3} />
          </div>
          {userData?.role !== 'client' && (
            <div className="form-group">
              <label>New Password (leave blank to keep current)</label>
              <input type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)} className="input" placeholder="Enter new password" />
            </div>
          )}
        </div>

        <div className="modal__footer">
          <button className="btn btn--ghost" onClick={onClose}>Cancel</button>
          <button className="btn btn--primary" onClick={handleSave} disabled={saving}>
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </div>
    </div>
  );
}
