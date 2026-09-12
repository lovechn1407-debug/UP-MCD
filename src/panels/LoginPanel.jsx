import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useApp } from '../context/AppContext';
import { ShieldAlert, Building2, HardHat, User, LogIn, Lock, CheckCircle2, AlertCircle, ArrowRight } from 'lucide-react';

export const LoginPanel = () => {
  const { loginWithGoogle, loginWithCredentials } = useAuth();
  const { districts, workers } = useApp();

  const [activeTab, setActiveTab] = useState('client'); // 'client', 'admin_worker', 'master'
  const [loginId, setLoginId] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [loading, setLoading] = useState(false);

  // Google Login Handler for Client
  const handleGoogleLogin = async () => {
    setLoading(true);
    setErrorMsg('');
    const res = await loginWithGoogle();
    setLoading(false);
    if (!res.success) {
      setErrorMsg(res.error || "Google login failed. Please try again.");
    }
  };

  // Custom Credentials Login Handler for Master, Admin, and Worker
  const handleCredentialsLogin = (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (!loginId || !password) {
      setErrorMsg("Please enter both User ID / Email and Password.");
      return;
    }

    setLoading(true);
    const res = loginWithCredentials(loginId, password, districts, workers);
    setLoading(false);

    if (!res.success) {
      setErrorMsg(res.error);
    }
  };

  // Quick Demo Auto-fill Helper
  const fillDemo = (id, pass) => {
    setLoginId(id);
    setPassword(pass);
    setErrorMsg('');
  };

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Background Graphic Ornaments */}
      <div className="absolute -top-32 -left-32 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center relative z-10">
        {/* Emblem & Logo Header */}
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-blue-900 via-blue-700 to-indigo-800 p-1 shadow-lg mx-auto mb-3 flex items-center justify-center">
          <Building2 className="w-9 h-9 text-amber-400" />
        </div>
        <span className="bg-amber-100 text-amber-800 text-[11px] font-extrabold px-3 py-1 rounded-full uppercase tracking-wider border border-amber-300">
          Government of Uttar Pradesh
        </span>
        <h2 className="mt-2 text-2xl sm:text-3xl font-extrabold text-slate-900">
          UP Municipal Civic Complaint Portal
        </h2>
        <p className="mt-1 text-xs sm:text-sm text-slate-600">
          Integrated Portal for Citizens, District Magistrates, and Field Officers
        </p>
      </div>

      <div className="mt-6 sm:mx-auto sm:w-full sm:max-w-xl relative z-10 px-4">
        <div className="bg-white py-8 px-6 sm:px-10 shadow-xl rounded-2xl border border-slate-200">
          {/* Role Tabs */}
          <div className="grid grid-cols-3 gap-2 p-1.5 bg-slate-100 rounded-xl mb-6 text-xs sm:text-sm font-semibold">
            <button
              type="button"
              onClick={() => { setActiveTab('client'); setErrorMsg(''); }}
              className={`py-2.5 px-3 rounded-lg flex items-center justify-center gap-1.5 transition-all ${
                activeTab === 'client' ? 'bg-white text-blue-900 shadow-md font-extrabold' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <User className="w-4 h-4 text-emerald-600" />
              Client Panel
            </button>

            <button
              type="button"
              onClick={() => { setActiveTab('admin_worker'); setErrorMsg(''); }}
              className={`py-2.5 px-3 rounded-lg flex items-center justify-center gap-1.5 transition-all ${
                activeTab === 'admin_worker' ? 'bg-white text-blue-900 shadow-md font-extrabold' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Building2 className="w-4 h-4 text-blue-600" />
              Admin / Worker
            </button>

            <button
              type="button"
              onClick={() => { setActiveTab('master'); setErrorMsg(''); }}
              className={`py-2.5 px-3 rounded-lg flex items-center justify-center gap-1.5 transition-all ${
                activeTab === 'master' ? 'bg-white text-purple-900 shadow-md font-extrabold' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <ShieldAlert className="w-4 h-4 text-purple-600" />
              Master Panel
            </button>
          </div>

          {/* Error Alert */}
          {errorMsg && (
            <div className="mb-5 bg-red-50 border border-red-200 text-red-800 rounded-xl p-3.5 text-xs flex items-center gap-2 font-medium">
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
              {errorMsg}
            </div>
          )}

          {/* CLIENT TAB: Gmail Google Login */}
          {activeTab === 'client' && (
            <div className="space-y-6 text-center">
              <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 text-emerald-900 text-xs sm:text-sm">
                <p className="font-bold flex items-center justify-center gap-1.5 mb-1">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  Citizen / Public Access Portal
                </p>
                Report municipal civic issues in your district, attach location maps, and track resolution progress with guaranteed deadlines.
              </div>

              <button
                type="button"
                onClick={handleGoogleLogin}
                disabled={loading}
                className="w-full btn-saffron justify-center py-3.5 text-base shadow-lg hover:shadow-xl transition-all"
              >
                <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
                </svg>
                {loading ? "Authenticating with Google..." : "Login with Gmail Account"}
              </button>
            </div>
          )}

          {/* ADMIN / WORKER TAB: Generated ID & Password */}
          {activeTab === 'admin_worker' && (
            <form onSubmit={handleCredentialsLogin} className="space-y-4">
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-3.5 text-blue-900 text-xs">
                <p className="font-bold flex items-center gap-1 mb-1">
                  <Building2 className="w-4 h-4 text-blue-700" />
                  District Magistrate & Field Officers Portal
                </p>
                Authorized accounts are generated by District Administration. Self-registration is restricted.
              </div>

              <div>
                <label className="label-title">User ID / Official Email</label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    className="input-field pl-9"
                    placeholder="e.g. lucknow_visak1 or ramesh3210"
                    value={loginId}
                    onChange={(e) => setLoginId(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div>
                <label className="label-title">Password</label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="password"
                    className="input-field pl-9"
                    placeholder="Enter password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full btn-primary justify-center py-3 text-base shadow-md"
              >
                <LogIn className="w-5 h-5" />
                {loading ? "Authenticating..." : "Login to Official Panel"}
              </button>

              {/* Quick Demo Pre-fill Chips */}
              <div className="pt-3 border-t border-slate-200">
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-2">
                  Quick Demo Pre-fills:
                </span>
                <div className="flex flex-wrap gap-1.5 text-xs">
                  <button
                    type="button"
                    onClick={() => fillDemo("lucknow_visak1", "Welcome@54321")}
                    className="bg-slate-100 hover:bg-slate-200 text-slate-800 px-2.5 py-1 rounded-lg border border-slate-300 font-mono text-[11px]"
                  >
                    DM Lucknow (lucknow_visak1)
                  </button>
                  <button
                    type="button"
                    onClick={() => fillDemo("ramesh3210", "9876543210")}
                    className="bg-slate-100 hover:bg-slate-200 text-slate-800 px-2.5 py-1 rounded-lg border border-slate-300 font-mono text-[11px]"
                  >
                    Worker Lucknow (ramesh3210)
                  </button>
                </div>
              </div>
            </form>
          )}

          {/* MASTER TAB: UP_MCD Master Admin */}
          {activeTab === 'master' && (
            <form onSubmit={handleCredentialsLogin} className="space-y-4">
              <div className="bg-purple-50 border border-purple-200 rounded-xl p-3.5 text-purple-900 text-xs">
                <p className="font-bold flex items-center gap-1 mb-1">
                  <ShieldAlert className="w-4 h-4 text-purple-700" />
                  State Master Control Panel
                </p>
                Restricted state administrator panel to manage districts, DMs, workers, site settings, and issue oversight.
              </div>

              <div>
                <label className="label-title">Master User ID</label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    className="input-field pl-9 font-mono font-bold"
                    placeholder="UP_MCD"
                    value={loginId}
                    onChange={(e) => setLoginId(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div>
                <label className="label-title">Master Password</label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="password"
                    className="input-field pl-9 font-mono"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-purple-700 to-indigo-800 text-white font-bold py-3 rounded-xl hover:from-purple-800 hover:to-indigo-900 shadow-md flex items-center justify-center gap-2"
              >
                <ShieldAlert className="w-5 h-5" />
                {loading ? "Authenticating Master..." : "Login Master Panel"}
              </button>

              <div className="pt-2 text-center">
                <button
                  type="button"
                  onClick={() => fillDemo("UP_MCD", "12345678")}
                  className="text-xs text-purple-700 hover:underline font-mono font-semibold"
                >
                  Auto-fill Master Credentials (UP_MCD / 12345678)
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
