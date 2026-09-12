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
          // Try to get user data from Firestore
          let data = await getUser(user.uid);
          if (!data) {
            // Check if it's a Google sign-in client
            data = await findUserByEmail(user.email);
            if (!data && user.providerData.some(p => p.providerId === 'google.com')) {
              // Create new client user
              await createUser(user.uid, {
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
              });
              data = await getUser(user.uid);
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
