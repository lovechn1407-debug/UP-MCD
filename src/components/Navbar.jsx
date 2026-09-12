import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { logout } from '../services/auth';
import ProfileModal from './ProfileModal';

export default function Navbar({ siteTitle, siteLogo, onMenuToggle }) {
  const { userData } = useAuth();
  const [showProfile, setShowProfile] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);

  const handleLogout = async () => {
    await logout();
    window.location.href = '/';
  };

  return (
    <>
      <div className="flag-stripe">
        <div className="flag-stripe__saffron" />
        <div className="flag-stripe__white" />
        <div className="flag-stripe__green" />
      </div>
      <nav className="navbar">
        <div className="navbar__left">
          <button className="navbar__menu-btn" onClick={onMenuToggle}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/>
            </svg>
          </button>
          <div className="navbar__brand">
            {siteLogo && <img src={siteLogo} alt="Logo" className="navbar__logo" />}
            <div>
              <h1 className="navbar__title">{siteTitle || 'UP Municipal Civic Desk'}</h1>
              <span className="navbar__subtitle">Government of Uttar Pradesh</span>
            </div>
          </div>
        </div>
        <div className="navbar__right">
          <div className="navbar__user" onClick={() => setShowDropdown(!showDropdown)}>
            <div className="navbar__avatar">
              {userData?.profilePic ? (
                <img src={userData.profilePic} alt="Avatar" />
              ) : (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
                </svg>
              )}
            </div>
            <div className="navbar__user-info">
              <span className="navbar__user-name">{userData?.name || 'User'}</span>
              <span className="navbar__user-role">{userData?.role?.toUpperCase()}</span>
            </div>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="6,9 12,15 18,9"/>
            </svg>
          </div>
          {showDropdown && (
            <div className="navbar__dropdown">
              <button onClick={() => { setShowProfile(true); setShowDropdown(false); }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
                </svg>
                Profile
              </button>
              <button onClick={handleLogout}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16,17 21,12 16,7"/><line x1="21" y1="12" x2="9" y2="12"/>
                </svg>
                Logout
              </button>
            </div>
          )}
        </div>
      </nav>
      {showProfile && <ProfileModal onClose={() => setShowProfile(false)} />}
    </>
  );
}
