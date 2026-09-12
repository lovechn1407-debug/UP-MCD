import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from './Toast';
import { updateUser } from '../services/firestore';
import { changePassword } from '../services/auth';
import { uploadToImgbb } from '../services/imgbb';
import { X, Camera, User, Phone, MapPin, Lock, Save, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

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
      toast.success('Profile updated successfully!');
      onClose();
    } catch (err) {
      toast.error('Failed to update profile: ' + err.message);
    }
    setSaving(false);
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop Overlay */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs"
        />

        {/* Dialog Content */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          className="relative bg-white border border-slate-200 rounded-3xl shadow-2xl max-w-lg w-full overflow-hidden z-10"
        >
          {/* Modal Header */}
          <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <User className="w-5 h-5 text-blue-600" />
              Account Settings
            </h2>
            <button
              onClick={onClose}
              className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Modal Body */}
          <div className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
            {/* Avatar Section */}
            <div className="flex items-center gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-200/70">
              <div className="relative w-16 h-16 rounded-full overflow-hidden border-2 border-white shadow-sm bg-slate-200 shrink-0">
                {userData?.profilePic ? (
                  <img src={userData.profilePic} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-slate-400">
                    <User className="w-8 h-8" />
                  </div>
                )}
              </div>
              <div>
                <label className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white border border-slate-200 hover:bg-slate-100 text-xs font-semibold text-slate-700 cursor-pointer shadow-xs transition-all">
                  {uploading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Camera className="w-3.5 h-3.5 text-blue-600" />}
                  {uploading ? 'Uploading...' : 'Change Photo'}
                  <input type="file" accept="image/*" onChange={handlePhotoUpload} className="hidden" />
                </label>
                <p className="text-[11px] text-slate-400 mt-1">JPG, PNG max 5MB</p>
              </div>
            </div>

            {/* Readonly Fields */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-1">
                  User ID
                </label>
                <input
                  type="text"
                  value={userData?.userId || ''}
                  disabled
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-100 border border-slate-200 text-xs font-mono font-medium text-slate-600"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-1">
                  Role
                </label>
                <input
                  type="text"
                  value={userData?.role?.toUpperCase() || ''}
                  disabled
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-100 border border-slate-200 text-xs font-semibold text-blue-700 uppercase"
                />
              </div>
            </div>

            {/* Editable Name */}
            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">Full Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 text-sm text-slate-800"
              />
            </div>

            {/* Phone */}
            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">Phone Number</label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 text-sm text-slate-800"
              />
            </div>

            {/* Address */}
            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">Address / Ward</label>
              <textarea
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                rows={2}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 text-sm text-slate-800 resize-none"
              />
            </div>

            {/* New Password (for non-clients) */}
            {userData?.role !== 'client' && (
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">
                  New Password (leave blank to keep current)
                </label>
                <div className="relative">
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Enter new password"
                    className="w-full pl-9 pr-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 text-sm text-slate-800"
                  />
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                </div>
              </div>
            )}
          </div>

          {/* Modal Footer */}
          <div className="px-6 py-4 border-t border-slate-100 flex items-center justify-end gap-2.5 bg-slate-50/50">
            <button
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-100 font-semibold text-xs transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs shadow-md shadow-blue-500/20 transition-all disabled:opacity-50"
            >
              {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
