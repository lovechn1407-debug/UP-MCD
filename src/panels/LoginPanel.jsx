import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useApp } from '../context/AppContext';
import { ShieldAlert, Building2, User, LogIn, Lock, CheckCircle2, AlertCircle, HardHat } from 'lucide-react';

export const LoginPanel = () => {
  const { loginWithGoogle, loginWithCredentials } = useAuth();
  const { districts, workers } = useApp();

  const [activeTab, setActiveTab] = useState('client'); // 'client', 'admin_worker', 'master'
  const [loginId, setLoginId] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [loading, setLoading] = useState(false);

  const handleGoogleLogin = async () => {
    setLoading(true);
    setErrorMsg('');
    const res = await loginWithGoogle();
    setLoading(false);
    if (!res.success) {
      setErrorMsg(res.error || "Google login failed. Please try again.");
    }
  };

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

  const fillDemo = (id, pass) => {
    setLoginId(id);
    setPassword(pass);
    setErrorMsg('');
  };

  return (
    <div className="login-wrapper">
      <div className="login-card">
        {/* Header */}
        <div className="login-header">
          <div className="login-logo">
            <Building2 style={{ width: '36px', height: '36px' }} />
          </div>
          <span className="login-tag">Government of Uttar Pradesh</span>
          <h2 className="login-title">UP Municipal Civic Complaint Portal</h2>
          <p className="login-subtitle">Integrated Portal for Citizens, District Magistrates, and Field Officers</p>
        </div>

        {/* Role Tabs */}
        <div className="tab-group">
          <button
            type="button"
            onClick={() => { setActiveTab('client'); setErrorMsg(''); }}
            className={`tab-btn ${activeTab === 'client' ? 'active' : ''}`}
          >
            <User style={{ width: '16px', height: '16px', color: '#10b981' }} />
            Client Panel
          </button>

          <button
            type="button"
            onClick={() => { setActiveTab('admin_worker'); setErrorMsg(''); }}
            className={`tab-btn ${activeTab === 'admin_worker' ? 'active' : ''}`}
          >
            <Building2 style={{ width: '16px', height: '16px', color: '#2563eb' }} />
            Admin / Worker
          </button>

          <button
            type="button"
            onClick={() => { setActiveTab('master'); setErrorMsg(''); }}
            className={`tab-btn ${activeTab === 'master' ? 'active' : ''}`}
          >
            <ShieldAlert style={{ width: '16px', height: '16px', color: '#9333ea' }} />
            Master Panel
          </button>
        </div>

        {/* Error Alert */}
        {errorMsg && (
          <div style={{ background: '#fee2e2', border: '1px solid #fca5a5', color: '#991b1b', padding: '0.75rem', borderRadius: '10px', fontSize: '0.825rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <AlertCircle style={{ width: '18px', height: '18px', flexShrink: 0 }} />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* CLIENT TAB: Gmail Google Login */}
        {activeTab === 'client' && (
          <div style={{ textAlign: 'center' }}>
            <div style={{ background: '#ecfdf5', border: '1px solid #a7f3d0', color: '#065f46', padding: '1rem', borderRadius: '12px', fontSize: '0.825rem', marginBottom: '1.5rem', textAlign: 'left' }}>
              <div style={{ fontWeight: 800, display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.25rem' }}>
                <CheckCircle2 style={{ width: '16px', height: '16px', color: '#059669' }} />
                Citizen / Public Access Portal
              </div>
              Report municipal civic issues in your district, attach location maps, and track resolution progress with guaranteed deadlines.
            </div>

            <button
              type="button"
              onClick={handleGoogleLogin}
              disabled={loading}
              className="btn-google"
            >
              <svg style={{ width: '20px', height: '20px' }} viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
              </svg>
              {loading ? "Authenticating with Google..." : "Login with Gmail Account"}
            </button>
          </div>
        )}

        {/* ADMIN / WORKER TAB */}
        {activeTab === 'admin_worker' && (
          <form onSubmit={handleCredentialsLogin}>
            <div style={{ background: '#eff6ff', border: '1px solid #bfdbfe', color: '#1e40af', padding: '0.85rem', borderRadius: '12px', fontSize: '0.825rem', marginBottom: '1.25rem' }}>
              <div style={{ fontWeight: 800, display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.2rem' }}>
                <Building2 style={{ width: '16px', height: '16px' }} />
                District Magistrate & Field Officers Portal
              </div>
              Authorized accounts are generated by District Administration. Self-registration is restricted.
            </div>

            <div className="form-group">
              <label className="form-label">User ID / Official Email</label>
              <input
                type="text"
                className="form-control"
                placeholder="e.g. lucknow_visak1 or ramesh3210"
                value={loginId}
                onChange={(e) => setLoginId(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Password</label>
              <input
                type="password"
                className="form-control"
                placeholder="Enter password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            <button type="submit" disabled={loading} className="btn-primary" style={{ marginTop: '0.5rem' }}>
              <LogIn style={{ width: '18px', height: '18px' }} />
              {loading ? "Authenticating..." : "Login to Official Panel"}
            </button>

            <div style={{ marginTop: '1.25rem', paddingTop: '1rem', borderTop: '1px solid #e2e8f0' }}>
              <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#64748b', textTransform: 'uppercase', display: 'block', marginBottom: '0.5rem' }}>
                Quick Demo Accounts:
              </span>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
                <button
                  type="button"
                  onClick={() => fillDemo("lucknow_visak1", "Welcome@54321")}
                  style={{ background: '#f1f5f9', border: '1px solid #cbd5e1', padding: '0.35rem 0.6rem', borderRadius: '6px', fontSize: '0.75rem', fontFamily: 'monospace', fontWeight: 600, cursor: 'pointer' }}
                >
                  DM Lucknow (lucknow_visak1)
                </button>
                <button
                  type="button"
                  onClick={() => fillDemo("ramesh3210", "9876543210")}
                  style={{ background: '#f1f5f9', border: '1px solid #cbd5e1', padding: '0.35rem 0.6rem', borderRadius: '6px', fontSize: '0.75rem', fontFamily: 'monospace', fontWeight: 600, cursor: 'pointer' }}
                >
                  Worker Lucknow (ramesh3210)
                </button>
              </div>
            </div>
          </form>
        )}

        {/* MASTER TAB */}
        {activeTab === 'master' && (
          <form onSubmit={handleCredentialsLogin}>
            <div style={{ background: '#faf5ff', border: '1px solid #e9d5ff', color: '#6b21a8', padding: '0.85rem', borderRadius: '12px', fontSize: '0.825rem', marginBottom: '1.25rem' }}>
              <div style={{ fontWeight: 800, display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.2rem' }}>
                <ShieldAlert style={{ width: '16px', height: '16px' }} />
                State Master Control Panel
              </div>
              Restricted state administrator panel to manage districts, DMs, workers, site settings, and issue oversight.
            </div>

            <div className="form-group">
              <label className="form-label">Master User ID</label>
              <input
                type="text"
                className="form-control"
                style={{ fontFamily: 'monospace', fontWeight: 'bold' }}
                placeholder="UP_MCD"
                value={loginId}
                onChange={(e) => setLoginId(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Master Password</label>
              <input
                type="password"
                className="form-control"
                style={{ fontFamily: 'monospace' }}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary"
              style={{ background: 'linear-gradient(135deg, #6b21a8 0%, #3b82f6 100%)', marginTop: '0.5rem' }}
            >
              <ShieldAlert style={{ width: '18px', height: '18px' }} />
              {loading ? "Authenticating Master..." : "Login Master Panel"}
            </button>

            <div style={{ textAlign: 'center', marginTop: '0.75rem' }}>
              <button
                type="button"
                onClick={() => fillDemo("UP_MCD", "12345678")}
                style={{ background: 'none', border: 'none', color: '#6b21a8', fontSize: '0.8rem', fontFamily: 'monospace', fontWeight: 700, cursor: 'pointer', textDecoration: 'underline' }}
              >
                Auto-fill Master Credentials (UP_MCD / 12345678)
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
