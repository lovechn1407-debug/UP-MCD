import { auth } from '../firebase/config';
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  signOut,
  updatePassword,
  updateEmail
} from 'firebase/auth';
import { makeEmailFromId } from '../utils/helpers';

const googleProvider = new GoogleAuthProvider();

export async function createAuthAccount(userId, password) {
  const email = makeEmailFromId(userId);
  try {
    const result = await createUserWithEmailAndPassword(auth, email, password);
    return result.user.uid;
  } catch (err) {
    if (err.code === 'auth/email-already-in-use') {
      return null;
    }
    console.warn('createAuthAccount warning:', err);
    return null;
  }
}

export async function loginWithCredentials(userId, password) {
  const email = makeEmailFromId(userId);
  try {
    const result = await signInWithEmailAndPassword(auth, email, password);
    return result.user;
  } catch (error) {
    console.warn('signInWithEmailAndPassword failed, attempting createUserWithEmailAndPassword:', error.code, error.message);
    try {
      const result = await createUserWithEmailAndPassword(auth, email, password);
      return result.user;
    } catch (createErr) {
      console.warn('createUserWithEmailAndPassword error:', createErr.code, createErr.message);
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
