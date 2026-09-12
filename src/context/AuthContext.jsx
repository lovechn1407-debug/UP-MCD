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
      try {
        setCurrentUser(user);
        if (user) {
          // 1. Try to get user data from Firestore by UID
          let data = await getUser(user.uid);

          if (!data && user.email) {
            // 2. Try to find by email
            data = await findUserByEmail(user.email);
          }

          if (!data && user.email) {
            const emailLower = user.email.toLowerCase();
            // 3. Fallback for Master Admin email
            if (emailLower.startsWith('up_mcd')) {
              data = {
                uid: user.uid,
                role: 'master',
                userId: 'UP_MCD',
                name: 'Master Admin',
                email: user.email,
                address: 'Lucknow, UP'
              };
              await createUser(user.uid, data).catch(() => {});
            } else if (user.providerData.some(p => p.providerId === 'google.com')) {
              // 4. Google Sign-In Citizen Client
              data = {
                uid: user.uid,
                role: 'client',
                userId: user.email,
                name: user.displayName || 'Citizen',
                email: user.email,
                phone: '',
                address: '',
                profilePic: user.photoURL || '',
                districtId: '',
                divisionId: '',
                adminId: ''
              };
              await createUser(user.uid, data).catch(() => {});
            }
          }

          setUserData(data);
        } else {
          setUserData(null);
        }
      } catch (err) {
        console.warn('AuthContext listener error:', err);
      } finally {
        setLoading(false);
      }
    });
    return unsub;
  }, []);

  const refreshUserData = async () => {
    if (currentUser) {
      const data = await getUser(currentUser.uid);
      setUserData(data);
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
