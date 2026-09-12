import React, { useState } from 'react';
import { loginWithCredentials, loginWithGoogle } from '../services/auth';
import { getUserByLoginId, createUser } from '../services/firestore';
import { useToast } from '../components/Toast';
import { User, ShieldCheck, Wrench, KeyRound, Lock, Building2, AlertCircle, ArrowRight, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';

export default function LoginPanel() {
  const [activeTab, setActiveTab] = useState('client');
  const [userId, setUserId] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const toast = useToast();

  const tabs = [
    { id: 'client', label: 'Citizen Portal', icon: <User className="w-4 h-4" /> },
    { id: 'admin', label: 'District Admin', icon: <ShieldCheck className="w-4 h-4" /> },
    { id: 'worker', label: 'Field Worker', icon: <Wrench className="w-4 h-4" /> },
    { id: 'master', label: 'Master Admin', icon: <KeyRound className="w-4 h-4" /> }
  ];

  const handleCredentialLogin = async (role) => {
    const trimmedId = userId.trim();
    if (!trimmedId || !password) {
      setError('Please enter User ID and Password');
      return;
    }
    setLoading(true);
    setError('');
    try {
      let userDoc = null;

      // Master Admin fallback logic for instant login
      if (role === 'master' && (trimmedId.toUpperCase() === 'UP_MCD' || trimmedId.toUpperCase() === 'MASTER') && password === '12345678') {
        userDoc = {
          role: 'master',
          userId: 'UP_MCD',
          name: 'Master Admin',
          email: 'up_mcd@up-mcd.app',
          password: '12345678'
        };
      } else {
        userDoc = await getUserByLoginId(trimmedId, role);
      }

      if (!userDoc) {
        setError('Invalid User ID. Account not found.');
        return;
      }

      if (userDoc.password && userDoc.password !== password) {
        setError('Invalid password.');
        return;
      }

      // Login via Firebase Auth
      const firebaseUser = await loginWithCredentials(userDoc.userId || trimmedId, password);

      // Save user doc under Firebase UID so AuthContext instantly resolves role
      if (firebaseUser && firebaseUser.uid) {
        await createUser(firebaseUser.uid, {
          ...userDoc,
          uid: firebaseUser.uid
        }).catch(() => {});
      }

      toast.success('Login successful!');
    } catch (err) {
      console.error('Login error:', err);
      setError('Login failed: ' + (err.message || 'Check connection or credentials'));
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setLoading(true);
    setError('');
    try {
      await loginWithGoogle();
      toast.success('Welcome!');
    } catch (err) {
      setError('Google sign-in failed: ' + (err.message || 'Unknown error'));
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-between relative overflow-hidden">
      {/* Top Tri-color Accent */}
      <div className="h-2 w-full flex">
        <div className="h-full w-1/3 bg-amber-500" />
        <div className="h-full w-1/3 bg-slate-100" />
        <div className="h-full w-1/3 bg-emerald-600" />
      </div>

      {/* Background Soft Mesh Gradients */}
      <div className="absolute -top-32 -left-32 w-96 h-96 rounded-full bg-blue-400/10 blur-3xl pointer-events-none" />
      <div className="absolute top-1/2 -right-32 w-96 h-96 rounded-full bg-indigo-400/10 blur-3xl pointer-events-none" />

      <main className="flex-1 flex items-center justify-center p-4 sm:p-6 md:p-8 z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="max-w-md w-full bg-white border border-slate-200/90 rounded-3xl shadow-xl p-6 sm:p-8 space-y-6"
        >
          {/* Header Branding */}
          <div className="text-center space-y-2">
            <div className="w-14 h-14 mx-auto rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-lg shadow-blue-500/25">
              <Building2 className="w-8 h-8" />
            </div>
            <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
              UP Municipal Civic Desk
            </h1>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Government of Uttar Pradesh • Single Sign-On Portal
            </p>
          </div>

          {/* Role Tabs */}
          <div className="grid grid-cols-2 gap-1.5 p-1.5 bg-slate-100 rounded-2xl border border-slate-200/70">
            {tabs.map((tab) => {
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => {
                    setActiveTab(tab.id);
                    setError('');
                    setUserId('');
                    setPassword('');
                  }}
                  className={`flex items-center justify-center gap-1.5 py-2 px-2.5 rounded-xl font-bold text-xs transition-all ${
                    isActive
                      ? 'bg-white text-blue-700 shadow-sm border border-slate-200'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {tab.icon}
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>

          {/* Form Content */}
          <div className="space-y-4">
            {activeTab === 'client' ? (
              <div className="space-y-4 text-center py-2">
                <p className="text-xs text-slate-600 leading-relaxed px-2">
                  Sign in instantly with your Google account to file civic complaints, upload photo evidence, and track SLA resolution progress.
                </p>

                <button
                  onClick={handleGoogleLogin}
                  disabled={loading}
                  className="w-full flex items-center justify-center gap-3 py-3 px-4 rounded-xl bg-white border border-slate-300 hover:bg-slate-50 text-slate-800 font-semibold text-sm shadow-sm transition-all hover:border-slate-400 disabled:opacity-50"
                >
                  <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                  </svg>
                  <span>{loading ? 'Signing in...' : 'Sign in with Google'}</span>
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    User ID / Login ID
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      placeholder={`Enter ${activeTab} User ID`}
                      value={userId}
                      onChange={(e) => setUserId(e.target.value)}
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
                    />
                    <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Password
                  </label>
                  <div className="relative">
                    <input
                      type="password"
                      placeholder="Enter password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleCredentialLogin(activeTab)}
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
                    />
                    <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                  </div>
                </div>

                <button
                  onClick={() => handleCredentialLogin(activeTab)}
                  disabled={loading}
                  className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm shadow-md shadow-blue-500/25 transition-all disabled:opacity-50"
                >
                  {loading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <>
                      <span>Sign In to Dashboard</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>
            )}

            {error && (
              <motion.div
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center gap-2 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium"
              >
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </motion.div>
            )}
          </div>
        </motion.div>
      </main>

      {/* Footer Branding */}
      <footer className="py-4 text-center text-xs text-slate-400 border-t border-slate-200/60 bg-white/60 backdrop-blur-xs">
        &copy; {new Date().getFullYear()} UP Municipal Civic Desk • Department of Urban Development
      </footer>
    </div>
  );
}
