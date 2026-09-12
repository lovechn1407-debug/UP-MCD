import { initializeApp } from 'firebase/app';
import { getAuth, setPersistence, browserSessionPersistence } from 'firebase/auth';
import { initializeFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyBZTA1_4QtW6z0Nz-fKZxp5GgfznqWzpO8",
  authDomain: "up-mcd.firebaseapp.com",
  projectId: "up-mcd",
  storageBucket: "up-mcd.firebasestorage.app",
  messagingSenderId: "527074271574",
  appId: "1:527074271574:web:631ac342d41ee6934ef6f7",
  measurementId: "G-9QS0RTM0PP"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
setPersistence(auth, browserSessionPersistence).catch(console.error);
export const db = initializeFirestore(app, {
  experimentalAutoDetectLongPolling: true
});
export default app;
