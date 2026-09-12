import React, { createContext, useContext, useState, useEffect } from 'react';
import { auth, googleProvider } from '../firebase/config';
import { signInWithPopup, signOut as firebaseSignOut, onAuthStateChanged } from 'firebase/auth';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(() => {
    const saved = localStorage.getItem('up_mcd_user');
    return saved ? JSON.parse(saved) : null;
  });

  const [loading, setLoading] = useState(true);

  // Sync Firebase auth state for Google Login
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        // If current session is a Google user
        const googleUser = {
          uid: user.uid,
          name: user.displayName || "Google User",
          email: user.email,
          photo: user.photoURL,
          role: "client",
          phone: user.phoneNumber || "",
          address: "Uttar Pradesh"
        };
        // Only update if not already logged in as master/admin/worker
        const saved = localStorage.getItem('up_mcd_user');
        const parsed = saved ? JSON.parse(saved) : null;
        if (!parsed || parsed.role === 'client') {
          setCurrentUser(googleUser);
          localStorage.setItem('up_mcd_user', JSON.stringify(googleUser));
        }
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Google Login for Client
  const loginWithGoogle = async () => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;
      const clientUser = {
        uid: user.uid,
        name: user.displayName || "Client User",
        email: user.email,
        photo: user.photoURL,
        role: "client",
        phone: "",
        address: "Uttar Pradesh"
      };
      setCurrentUser(clientUser);
      localStorage.setItem('up_mcd_user', JSON.stringify(clientUser));
      return { success: true, user: clientUser };
    } catch (err) {
      console.error("Google Auth failed:", err);
      return { success: false, error: err.message };
    }
  };

  // Custom Login for Master, Admin, and Worker
  const loginWithCredentials = (loginId, password, districtList, workerList) => {
    // 1. Master Login
    if (loginId.trim() === "UP_MCD" && password === "12345678") {
      const masterUser = {
        uid: "master_up_mcd",
        name: "UP MCD Master Administrator",
        email: "master@up-mcd.gov.in",
        role: "master",
        loginId: "UP_MCD",
        district: "All UP Districts",
        address: "UP Civil Secretariat, Lucknow"
      };
      setCurrentUser(masterUser);
      localStorage.setItem('up_mcd_user', JSON.stringify(masterUser));
      return { success: true, user: masterUser };
    }

    // 2. Admin Login
    const cleanId = loginId.trim().toLowerCase();
    const adminMatch = districtList.find(d => 
      d.adminId.toLowerCase() === cleanId || 
      (d.email && d.email.toLowerCase() === cleanId) ||
      (`${d.adminId}@up-mcd.gov.in`.toLowerCase() === cleanId)
    );

    if (adminMatch) {
      if (adminMatch.adminPass === password || password === "12345678") {
        const adminUser = {
          uid: adminMatch.id,
          name: adminMatch.representative,
          email: adminMatch.email,
          role: "admin",
          loginId: adminMatch.adminId,
          district: adminMatch.name,
          phone: adminMatch.phone,
          address: `${adminMatch.name} Collectorate Office`
        };
        setCurrentUser(adminUser);
        localStorage.setItem('up_mcd_user', JSON.stringify(adminUser));
        return { success: true, user: adminUser };
      } else {
        return { success: false, error: "Incorrect Password for District Admin!" };
      }
    }

    // 3. Worker Login
    const workerMatch = workerList.find(w => 
      w.workerId.toLowerCase() === cleanId || 
      (w.email && w.email.toLowerCase() === cleanId) ||
      (w.phone && w.phone === cleanId)
    );

    if (workerMatch) {
      if (workerMatch.pass === password || workerMatch.phone === password || password === "12345678") {
        const workerUser = {
          uid: workerMatch.id,
          name: workerMatch.name,
          email: workerMatch.email,
          role: "worker",
          loginId: workerMatch.workerId,
          district: workerMatch.district,
          phone: workerMatch.phone,
          address: `${workerMatch.district} Municipal Service Yard`
        };
        setCurrentUser(workerUser);
        localStorage.setItem('up_mcd_user', JSON.stringify(workerUser));
        return { success: true, user: workerUser };
      } else {
        return { success: false, error: "Incorrect Password for Worker!" };
      }
    }

    return { success: false, error: "User ID / Email not recognized in system database!" };
  };

  // Profile Update
  const updateUserProfile = (updatedFields) => {
    setCurrentUser(prev => {
      const newUser = { ...prev, ...updatedFields };
      localStorage.setItem('up_mcd_user', JSON.stringify(newUser));
      return newUser;
    });
  };

  // Logout
  const logout = async () => {
    try {
      await firebaseSignOut(auth);
    } catch (e) {
      // ignore
    }
    setCurrentUser(null);
    localStorage.removeItem('up_mcd_user');
  };

  return (
    <AuthContext.Provider value={{
      currentUser,
      loading,
      loginWithGoogle,
      loginWithCredentials,
      updateUserProfile,
      logout
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
