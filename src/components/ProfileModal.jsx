import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { User, Key, Phone, MapPin, X, Check, ShieldCheck } from 'lucide-react';

export const ProfileModal = ({ isOpen, onClose }) => {
  const { currentUser, updateUserProfile } = useAuth();

  const [name, setName] = useState(currentUser?.name || '');
  const [phone, setPhone] = useState(currentUser?.phone || '');
  const [address, setAddress] = useState(currentUser?.address || '');
  const [password, setPassword] = useState('');
  const [savedSuccess, setSavedSuccess] = useState(false);

  if (!isOpen || !currentUser) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    updateUserProfile({
      name,
      phone,
      address,
      ...(password ? { customPass: password } : {})
    });
    setSavedSuccess(true);
    setTimeout(() => {
      setSavedSuccess(false);
      onClose();
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 relative animate-in fade-in zoom-in-95 duration-200">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-all"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 rounded-xl bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-700">
            <User className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-slate-900">Account Profile & Settings</h3>
            <p className="text-xs text-slate-500">Update personal details, credentials, and contact info</p>
          </div>
        </div>

        {/* Role Identity Card */}
        <div className="bg-slate-50 rounded-xl p-3 border border-slate-200 mb-5 flex items-center justify-between text-xs">
          <div>
            <span className="text-slate-500 font-medium">Account Role: </span>
            <span className="font-bold uppercase text-blue-900">{currentUser.role}</span>
          </div>
          <div>
            <span className="text-slate-500 font-medium">Login ID: </span>
            <span className="font-mono bg-white px-2 py-0.5 rounded border border-slate-200 font-semibold text-slate-800">
              {currentUser.loginId || currentUser.email || currentUser.uid}
            </span>
          </div>
        </div>

        {savedSuccess ? (
          <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl p-4 text-center my-4 flex items-center justify-center gap-2 font-semibold">
            <Check className="w-5 h-5 text-emerald-600" />
            Profile details updated successfully!
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Full Name */}
            <div>
              <label className="label-title flex items-center gap-1.5">
                <User className="w-4 h-4 text-slate-500" />
                Full Name
              </label>
              <input
                type="text"
                className="input-field"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>

            {/* Mobile Phone */}
            <div>
              <label className="label-title flex items-center gap-1.5">
                <Phone className="w-4 h-4 text-slate-500" />
                Mobile Contact Number
              </label>
              <input
                type="tel"
                className="input-field"
                placeholder="+91 9876543210"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />
            </div>

            {/* Address */}
            <div>
              <label className="label-title flex items-center gap-1.5">
                <MapPin className="w-4 h-4 text-slate-500" />
                Residential / Office Address
              </label>
              <textarea
                className="input-field min-h-[80px]"
                placeholder="Enter complete street address, locality, city..."
                value={address}
                onChange={(e) => setAddress(e.target.value)}
              />
            </div>

            {/* Optional Password Update */}
            <div>
              <label className="label-title flex items-center gap-1.5">
                <Key className="w-4 h-4 text-slate-500" />
                Change Password (Optional)
              </label>
              <input
                type="password"
                className="input-field"
                placeholder="Leave blank to keep existing password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200">
              <button
                type="button"
                onClick={onClose}
                className="btn-secondary"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn-primary"
              >
                <ShieldCheck className="w-4 h-4" />
                Save Profile Changes
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
