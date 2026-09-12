import React, { createContext, useContext, useState, useEffect } from 'react';
import { auth } from '../firebase/config';
import { onAuthStateChanged } from 'firebase/auth';
import { getUser, findUserByEmail, createUser } from '../services/firestore';

const AuthContext = createContext(null);

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      if (!user) {
        setUserData(null);
        setLoading(false);
        return;
      }

      const emailLower = (user.email || '').toLowerCase();

      // Fast-path 1: Master Admin (Instant 0ms resolution)
      if (emailLower.startsWith('up_mcd')) {
        const masterObj = {
          uid: user.uid,
          role: 'master',
          userId: 'UP_MCD',
          name: 'Master Admin',
          email: user.email,
          address: 'Lucknow, UP'
        };
        setUserData(masterObj);
        setLoading(false);
        createUser(user.uid, masterObj).catch(() => {});
        return;
      }

      // Fast-path 2: Google Sign-in Client (Instant 0ms resolution)
      if (user.providerData && user.providerData.some(p => p.providerId === 'google.com')) {
        const clientObj = {
          uid: user.uid,
          role: 'client',
          userId: user.email,
          name: user.displayName || 'Citizen',
          email: user.email,
          profilePic: user.photoURL || ''
        };
        setUserData(clientObj);
        setLoading(false);
        createUser(user.uid, clientObj).catch(() => {});
        return;
      }

      // For Admin or Worker, query Firestore doc
      try {
        let data = await getUser(user.uid);
        if (!data && user.email) {
          data = await findUserByEmail(user.email);
        }
        setUserData(data);
      } catch (err) {
        console.warn('AuthContext user fetch error:', err);
      } finally {
        setLoading(false);
      }
    });
    return unsub;
  }, []);

  const refreshUserData = async () => {
    if (currentUser) {
      const data = await getUser(currentUser.uid);
      if (data) setUserData(data);
    }
  };

  const value = {
    currentUser,
    userData,
    loading,
    refreshUserData,
    isAuthenticated: !!currentUser,
    role: userData?.role || null
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}
