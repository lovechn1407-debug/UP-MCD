import { auth } from '../firebase/config';
import {
  signInWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  signOut,
  updatePassword,
  updateEmail
} from 'firebase/auth';
import { FIREBASE_API_KEY } from '../utils/constants';
import { makeEmailFromId } from '../utils/helpers';

const googleProvider = new GoogleAuthProvider();

// Create Firebase Auth account via REST API (doesn't affect current session)
export async function createAuthAccount(userId, password) {
  const email = makeEmailFromId(userId);
  const response = await fetch(
    `https://identitytoolkit.googleapis.com/v1/accounts:signUp?key=${FIREBASE_API_KEY}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email,
        password,
        returnSecureToken: false
      })
    }
  );
  const data = await response.json();
  if (data.error) {
    // If account already exists, that's fine
    if (data.error.message === 'EMAIL_EXISTS') {
      return null;
    }
    throw new Error(data.error.message);
  }
  return data.localId;
}

export async function loginWithCredentials(userId, password) {
  const email = makeEmailFromId(userId);
  try {
    const result = await signInWithEmailAndPassword(auth, email, password);
    return result.user;
  } catch (error) {
    console.warn('signInWithEmailAndPassword error code:', error.code, error.message);
    // If user doesn't exist in Auth yet, create and retry
    try {
      await createAuthAccount(userId, password);
      const result = await signInWithEmailAndPassword(auth, email, password);
      return result.user;
    } catch (createErr) {
      console.error('Failed to create & sign in auth account:', createErr);
      throw error;
    }
  }
}

export async function loginWithGoogle() {
  const result = await signInWithPopup(auth, googleProvider);
  return result.user;
}

export async function logout() {
  await signOut(auth);
}

export async function changePassword(newPassword) {
  if (auth.currentUser) {
    await updatePassword(auth.currentUser, newPassword);
  }
}

export function getCurrentUser() {
  return auth.currentUser;
}
