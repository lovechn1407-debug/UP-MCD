import React from 'react';
import { useAuth } from '../context/AuthContext';
import { useApp } from '../context/AppContext';
import { ShieldAlert, User, LogOut, Award, Settings, Building2, HardHat, FileText, Megaphone } from 'lucide-react';

export const Navbar = ({ onOpenProfile, activeTab, setActiveTab }) => {
  const { currentUser, logout } = useAuth();
  const { siteSettings } = useApp();

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-slate-200 shadow-sm">
      {/* Top Client Header Marquee Banner */}
      {siteSettings.headerMarquee && (
        <div className="marquee-container flex items-center">
          <div className="marquee-content flex items-center gap-2">
            <Megaphone className="w-4 h-4 text-amber-300 inline" />
            <span>{siteSettings.headerMarquee}</span>
          </div>
        </div>
      )}

      {/* Navigation Main Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex flex-wrap items-center justify-between gap-4">
        {/* Brand Logo & Title */}
        <div className="flex items-center gap-3 cursor-pointer" onClick={() => setActiveTab && setActiveTab('dashboard')}>
          <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-blue-900 via-blue-700 to-indigo-800 p-0.5 shadow-md flex items-center justify-center overflow-hidden">
            {siteSettings.siteImage ? (
              <img src={siteSettings.siteImage} alt="UP Logo" className="w-full h-full object-cover rounded-lg" />
            ) : (
              <Building2 className="w-7 h-7 text-amber-400" />
            )}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="bg-amber-100 text-amber-800 text-[10px] font-extrabold px-2 py-0.5 rounded uppercase tracking-wider border border-amber-200">
                Govt. of Uttar Pradesh
              </span>
              <span className="bg-blue-100 text-blue-800 text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider">
                UP-MCD
              </span>
            </div>
            <h1 className="text-lg sm:text-xl font-extrabold text-slate-900 leading-tight">
              {siteSettings.siteTitle || "UP Municipal Civic Complaint Portal"}
            </h1>
          </div>
        </div>

        {/* Role & User Action Bar */}
        <div className="flex items-center gap-3">
          {currentUser && (
            <>
              {/* Navigation Tabs if present */}
              {setActiveTab && (
                <div className="hidden md:flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200 text-sm font-medium">
                  <button
                    onClick={() => setActiveTab('dashboard')}
                    className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-all ${
                      activeTab === 'dashboard' ? 'bg-white text-blue-900 shadow-sm font-semibold' : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    <FileText className="w-4 h-4" />
                    Dashboard
                  </button>
                  <button
                    onClick={() => setActiveTab('leaderboard')}
                    className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-all ${
                      activeTab === 'leaderboard' ? 'bg-white text-blue-900 shadow-sm font-semibold' : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    <Award className="w-4 h-4 text-amber-500" />
                    Honor Leaderboard
                  </button>
                </div>
              )}

              {/* Role Badge */}
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200 text-xs">
                {currentUser.role === 'master' && (
                  <span className="flex items-center gap-1 font-bold text-purple-700">
                    <ShieldAlert className="w-4 h-4 text-purple-600" />
                    Master Panel
                  </span>
                )}
                {currentUser.role === 'admin' && (
                  <span className="flex items-center gap-1 font-bold text-blue-700">
                    <Building2 className="w-4 h-4 text-blue-600" />
                    DM Admin ({currentUser.district})
                  </span>
                )}
                {currentUser.role === 'worker' && (
                  <span className="flex items-center gap-1 font-bold text-amber-700">
                    <HardHat className="w-4 h-4 text-amber-600" />
                    Field Worker ({currentUser.district})
                  </span>
                )}
                {currentUser.role === 'client' && (
                  <span className="flex items-center gap-1 font-bold text-emerald-700">
                    <User className="w-4 h-4 text-emerald-600" />
                    Client Panel
                  </span>
                )}
              </div>

              {/* Profile Button */}
              <button
                onClick={onOpenProfile}
                className="btn-secondary text-xs sm:text-sm py-1.5 px-3"
                title="Account Profile & Settings"
              >
                <User className="w-4 h-4 text-slate-600" />
                <span className="hidden sm:inline font-semibold">{currentUser.name.split(' ')[0]}</span>
              </button>

              {/* Logout Button */}
              <button
                onClick={logout}
                className="p-2 rounded-xl text-slate-500 hover:text-red-600 hover:bg-red-50 border border-transparent hover:border-red-200 transition-all"
                title="Logout Account"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </>
          )}
        </div>
      </div>
    </header>
  );
};
