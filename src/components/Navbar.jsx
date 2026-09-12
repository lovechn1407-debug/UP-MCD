import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { logout } from '../services/auth';
import ProfileModal from './ProfileModal';
import { Menu, User, LogOut, ChevronDown, ShieldCheck, MapPin, Building2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function Navbar({ siteTitle, siteLogo, onMenuToggle }) {
  const { userData } = useAuth();
  const [showProfile, setShowProfile] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);

  const handleLogout = async () => {
    await logout();
    window.location.href = '/';
  };

  const getRoleBadgeColor = (role) => {
    switch (role) {
      case 'master': return 'bg-amber-100 text-amber-800 border-amber-300';
      case 'admin': return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'worker': return 'bg-emerald-100 text-emerald-800 border-emerald-300';
      default: return 'bg-indigo-100 text-indigo-800 border-indigo-300';
    }
  };

  return (
    <>
      {/* Top Tri-color Civic Accent Bar */}
      <div className="h-1.5 w-full flex">
        <div className="h-full w-1/3 bg-amber-500" />
        <div className="h-full w-1/3 bg-slate-100" />
        <div className="h-full w-1/3 bg-emerald-600" />
      </div>

      <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-slate-200/80 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          
          {/* Left section: menu button & title */}
          <div className="flex items-center gap-3 sm:gap-4">
            <button
              onClick={onMenuToggle}
              className="p-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 focus:outline-none transition-colors"
              aria-label="Toggle Navigation"
            >
              <Menu className="w-5 h-5 sm:w-6 sm:h-6" />
            </button>

            <div className="flex items-center gap-3">
              {siteLogo ? (
                <img src={siteLogo} alt="Logo" className="w-9 h-9 object-contain rounded-lg" />
              ) : (
                <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-blue-500/20">
                  <Building2 className="w-5 h-5" />
                </div>
              )}
              <div>
                <h1 className="text-base sm:text-lg font-bold tracking-tight text-slate-900 leading-tight">
                  {siteTitle || 'UP Municipal Civic Desk'}
                </h1>
                <p className="text-xs font-medium text-slate-500 hidden sm:block">
                  Government of Uttar Pradesh • Civic Grievance Portal
                </p>
              </div>
            </div>
          </div>

          {/* Right section: user profile dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowDropdown(!showDropdown)}
              className="flex items-center gap-2.5 p-1.5 sm:px-3 sm:py-2 rounded-xl hover:bg-slate-100/80 border border-slate-200/60 transition-all text-left"
            >
              <div className="relative">
                {userData?.profilePic ? (
                  <img
                    src={userData.profilePic}
                    alt="Avatar"
                    className="w-8 h-8 sm:w-9 sm:h-9 rounded-full object-cover border border-slate-300"
                  />
                ) : (
                  <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-slate-200 flex items-center justify-center text-slate-600 font-semibold text-sm">
                    {userData?.name ? userData.name.charAt(0).toUpperCase() : <User className="w-4 h-4" />}
                  </div>
                )}
                <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-500 border-2 border-white" />
              </div>

              <div className="hidden sm:flex flex-col">
                <span className="text-sm font-semibold text-slate-800 leading-none">
                  {userData?.name || 'User'}
                </span>
                <div className="flex items-center gap-1 mt-1">
                  <span className={`px-1.5 py-0.5 text-[10px] font-bold rounded-md uppercase border ${getRoleBadgeColor(userData?.role)}`}>
                    {userData?.role || 'Citizen'}
                  </span>
                  {userData?.districtId && (
                    <span className="text-[11px] text-slate-500 flex items-center gap-0.5">
                      <MapPin className="w-3 h-3 text-slate-400" />
                      {userData.districtId}
                    </span>
                  )}
                </div>
              </div>

              <ChevronDown className="w-4 h-4 text-slate-400" />
            </button>

            {/* Dropdown Menu */}
            <AnimatePresence>
              {showDropdown && (
                <motion.div
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.95 }}
                  transition={{ duration: 0.15 }}
                  className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border border-slate-200 py-2 z-50 overflow-hidden"
                >
                  <div className="px-4 py-2 border-b border-slate-100 sm:hidden">
                    <p className="text-sm font-semibold text-slate-900">{userData?.name || 'User'}</p>
                    <p className="text-xs text-slate-500 uppercase">{userData?.role || 'Citizen'}</p>
                  </div>

                  <button
                    onClick={() => { setShowProfile(true); setShowDropdown(false); }}
                    className="w-full px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50 flex items-center gap-2.5 transition-colors"
                  >
                    <User className="w-4 h-4 text-slate-500" />
                    My Profile
                  </button>

                  <div className="my-1 border-t border-slate-100" />

                  <button
                    onClick={handleLogout}
                    className="w-full px-4 py-2.5 text-sm font-medium text-rose-600 hover:bg-rose-50 flex items-center gap-2.5 transition-colors"
                  >
                    <LogOut className="w-4 h-4 text-rose-500" />
                    Sign Out
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </header>

      {showProfile && <ProfileModal onClose={() => setShowProfile(false)} />}
    </>
  );
}
