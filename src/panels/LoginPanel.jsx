import React, { useState } from 'react';
import { loginWithCredentials, loginWithGoogle, createAuthAccount } from '../services/auth';
import { getUserByLoginId, findUserByEmail, createUser } from '../services/firestore';
import { useToast } from '../components/Toast';

export default function LoginPanel() {
  const [activeTab, setActiveTab] = useState('client');
  const [userId, setUserId] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const toast = useToast();

  const tabs = [
    { id: 'client', label: 'Citizen', icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg> },
    { id: 'admin', label: 'Admin (DM)', icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg> },
    { id: 'worker', label: 'Worker', icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/></svg> },
    { id: 'master', label: 'Master', icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9"/></svg> }
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
      // Check Firestore for user record
      let userDoc = await getUserByLoginId(trimmedId, role);

      // Auto-bootstrap Master account if database has not been seeded yet
      if (!userDoc && role === 'master' && (trimmedId.toUpperCase() === 'UP_MCD' || trimmedId.toUpperCase() === 'MASTER') && password === '12345678') {
        const masterEmail = 'up_mcd@up-mcd.gov.in';
        let masterUid = 'master_default_uid';
        try {
          masterUid = await createAuthAccount('UP_MCD', '12345678') || 'master_default_uid';
        } catch (e) {}

        const masterData = {
          uid: masterUid,
          role: 'master',
          userId: 'UP_MCD',
          name: 'Master Admin',
          email: masterEmail,
          phone: '1800-180-0000',
          address: 'Lucknow, UP',
          password: '12345678'
        };
        await createUser(masterUid, masterData);
        userDoc = masterData;
      }

      if (!userDoc) {
        setError('Invalid User ID. Account not found.');
        setLoading(false);
        return;
      }

      if (userDoc.password !== password) {
        setError('Invalid password.');
        setLoading(false);
        return;
      }

      // Login via Firebase Auth
      await loginWithCredentials(userDoc.userId || trimmedId, password);
      toast.success('Login successful!');
    } catch (err) {
      console.error(err);
      setError('Login failed: ' + (err.message || 'Unknown error'));
    }
    setLoading(false);
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
    <div className="login-page">
      <div className="login-page__flag">
        <div className="flag-stripe__saffron" />
        <div className="flag-stripe__white" />
        <div className="flag-stripe__green" />
      </div>

      <div className="login-container">
        <div className="login-card">
          <div className="login-card__header">
            <div className="login-card__emblem">
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#1B4D8E" strokeWidth="1.5">
                <path d="M3 21h18"/><path d="M5 21V7l8-4v18"/><path d="M19 21V11l-6-4"/>
                <path d="M9 9h1"/><path d="M9 13h1"/><path d="M9 17h1"/>
              </svg>
            </div>
            <h1>UP Municipal Civic Desk</h1>
            <p>Government of Uttar Pradesh</p>
          </div>

          <div className="login-tabs">
            {tabs.map(tab => (
              <button
                key={tab.id}
                className={`login-tab ${activeTab === tab.id ? 'login-tab--active' : ''}`}
                onClick={() => { setActiveTab(tab.id); setError(''); setUserId(''); setPassword(''); }}
              >
                {tab.icon}
                <span>{tab.label}</span>
              </button>
            ))}
          </div>

          <div className="login-form">
            {activeTab === 'client' ? (
              <div className="login-form__google">
                <p className="login-form__info">Sign in with your Google account to file and track civic complaints in your district.</p>
                <button className="btn btn--google" onClick={handleGoogleLogin} disabled={loading}>
                  <svg width="20" height="20" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                  </svg>
                  {loading ? 'Signing in...' : 'Sign in with Google'}
                </button>
              </div>
            ) : (
              <>
                <div className="form-group">
                  <label htmlFor="login-userid">User ID</label>
                  <div className="input-icon">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#94A3B8" strokeWidth="2">
                      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
                    </svg>
                    <input
                      id="login-userid"
                      type="text"
                      className="input"
                      placeholder="Enter your User ID"
                      value={userId}
                      onChange={e => setUserId(e.target.value)}
                    />
                  </div>
                </div>
                <div className="form-group">
                  <label htmlFor="login-password">Password</label>
                  <div className="input-icon">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#94A3B8" strokeWidth="2">
                      <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                    </svg>
                    <input
                      id="login-password"
                      type="password"
                      className="input"
                      placeholder="Enter your password"
                      value={password}
                      onChange={e => setPassword(e.target.value)}
                      onKeyDown={e => e.key === 'Enter' && handleCredentialLogin(activeTab)}
                    />
                  </div>
                </div>
                <button
                  className="btn btn--primary btn--full"
                  onClick={() => handleCredentialLogin(activeTab)}
                  disabled={loading}
                >
                  {loading ? 'Signing in...' : 'Sign In'}
                </button>
              </>
            )}

            {error && (
              <div className="login-error">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/>
                </svg>
                {error}
              </div>
            )}
          </div>
        </div>

        <p className="login-footer">
          &copy; {new Date().getFullYear()} UP Municipal Civic Desk. All rights reserved.
        </p>
      </div>
    </div>
  );
}
