import { db } from '../firebase/config';
import {
  collection, doc, getDoc, getDocs, setDoc, addDoc, updateDoc, deleteDoc,
  query, where, orderBy, limit, startAfter, serverTimestamp, Timestamp,
  onSnapshot, increment, writeBatch
} from 'firebase/firestore';

// ============ SETTINGS ============
export async function getSettings() {
  const snap = await getDoc(doc(db, 'settings', 'site'));
  return snap.exists() ? snap.data() : null;
}

export async function updateSettings(data) {
  await setDoc(doc(db, 'settings', 'site'), { ...data, updatedAt: serverTimestamp() }, { merge: true });
}

// ============ USERS ============
export async function createUser(uid, userData) {
  await setDoc(doc(db, 'users', uid), {
    ...userData,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp()
  });
}

export async function getUser(uid) {
  const snap = await getDoc(doc(db, 'users', uid));
  return snap.exists() ? { id: snap.id, ...snap.data() } : null;
}

export async function getUserByLoginId(userId, role) {
  const q = query(collection(db, 'users'), where('userId', '==', userId), where('role', '==', role));
  const snap = await getDocs(q);
  if (snap.empty) return null;
  const d = snap.docs[0];
  return { id: d.id, ...d.data() };
}

export async function getUsersByRole(role) {
  const q = query(collection(db, 'users'), where('role', '==', role), orderBy('createdAt', 'desc'));
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
}

export async function getWorkersByAdmin(adminDistrictId) {
  const q = query(collection(db, 'users'), where('role', '==', 'worker'), where('districtId', '==', adminDistrictId));
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
}

export async function updateUser(uid, data) {
  await updateDoc(doc(db, 'users', uid), { ...data, updatedAt: serverTimestamp() });
}

export async function findUserByEmail(email) {
  const q = query(collection(db, 'users'), where('email', '==', email));
  const snap = await getDocs(q);
  if (snap.empty) return null;
  const d = snap.docs[0];
  return { id: d.id, ...d.data() };
}

// ============ DIVISIONS ============
export async function createDivision(id, data) {
  await setDoc(doc(db, 'divisions', id), data);
}

export async function getDivisions() {
  const snap = await getDocs(collection(db, 'divisions'));
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
}

// ============ DISTRICTS ============
export async function createDistrict(id, data) {
  await setDoc(doc(db, 'districts', id), data);
}

export async function getDistricts() {
  const snap = await getDocs(collection(db, 'districts'));
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
}

export async function getDistrictsByDivision(divisionId) {
  const q = query(collection(db, 'districts'), where('divisionId', '==', divisionId));
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
}

export async function updateDistrict(id, data) {
  await updateDoc(doc(db, 'districts', id), data);
}

export async function getDistrictById(id) {
  const snap = await getDoc(doc(db, 'districts', id));
  return snap.exists() ? { id: snap.id, ...snap.data() } : null;
}

// ============ COMPLAINTS ============
export async function createComplaint(data) {
  // Get next complaint number
  const countDoc = await getDoc(doc(db, 'settings', 'counters'));
  let nextNum = 1;
  if (countDoc.exists() && countDoc.data().complaintCount) {
    nextNum = countDoc.data().complaintCount + 1;
  }
  await setDoc(doc(db, 'settings', 'counters'), { complaintCount: nextNum }, { merge: true });

  const year = new Date().getFullYear();
  const complaintNumber = `UP-MCD-${year}-${String(nextNum).padStart(5, '0')}`;

  const ref = await addDoc(collection(db, 'complaints'), {
    ...data,
    complaintNumber,
    status: 'new',
    assignedWorkerId: null,
    assignedWorkerName: null,
    assignedWorkerPhone: null,
    expectedResolutionDate: null,
    adminReply: null,
    workerRemark: null,
    workerPhotos: null,
    workerFinalizedAt: null,
    clientResolutionResponse: null,
    clientDeclineRemark: null,
    clientDeclinePhoto: null,
    autoResolved: false,
    resolvedAt: null,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp()
  });

  // Add to thread
  await addThreadEntry(ref.id, {
    authorRole: 'client',
    authorName: data.clientName,
    message: `New complaint filed: ${data.type}`,
    images: data.photos || [],
    type: 'complaint_filed'
  });

  // Update district counts
  if (data.districtId) {
    await updateDoc(doc(db, 'districts', data.districtId), {
      totalIssues: increment(1)
    }).catch(() => {});
  }

  return { id: ref.id, complaintNumber };
}

export async function getComplaints(filters = {}) {
  let q = collection(db, 'complaints');
  const constraints = [orderBy('createdAt', 'desc')];

  if (filters.districtId) {
    constraints.unshift(where('districtId', '==', filters.districtId));
  }
  if (filters.clientId) {
    constraints.unshift(where('clientId', '==', filters.clientId));
  }
  if (filters.assignedWorkerId) {
    constraints.unshift(where('assignedWorkerId', '==', filters.assignedWorkerId));
  }
  if (filters.status) {
    constraints.unshift(where('status', '==', filters.status));
  }

  q = query(q, ...constraints);
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
}

export async function getComplaintById(id) {
  const snap = await getDoc(doc(db, 'complaints', id));
  return snap.exists() ? { id: snap.id, ...snap.data() } : null;
}

export async function updateComplaint(id, data) {
  await updateDoc(doc(db, 'complaints', id), { ...data, updatedAt: serverTimestamp() });
}

// Admin reply
export async function adminReplyToComplaint(complaintId, reply, expectedDays, adminName) {
  const expectedDate = new Date();
  expectedDate.setDate(expectedDate.getDate() + expectedDays);

  await updateComplaint(complaintId, {
    adminReply: reply,
    expectedResolutionDate: Timestamp.fromDate(expectedDate),
    status: 'admin_replied'
  });

  await addThreadEntry(complaintId, {
    authorRole: 'admin',
    authorName: adminName,
    message: `${reply}\n\nExpected resolution: ${expectedDays} days`,
    images: [],
    type: 'admin_reply'
  });
}

// Assign worker
export async function assignWorker(complaintId, worker, adminName) {
  await updateComplaint(complaintId, {
    assignedWorkerId: worker.id,
    assignedWorkerName: worker.name,
    assignedWorkerPhone: worker.phone,
    status: 'worker_assigned'
  });

  await addThreadEntry(complaintId, {
    authorRole: 'system',
    authorName: 'System',
    message: `Worker assigned: ${worker.name} (${worker.phone})`,
    images: [],
    type: 'worker_assigned'
  });
}

// Worker finalize
export async function workerFinalize(complaintId, remark, photos, workerName) {
  await updateComplaint(complaintId, {
    workerRemark: remark,
    workerPhotos: photos,
    workerFinalizedAt: serverTimestamp(),
    status: 'finalized_by_worker'
  });

  await addThreadEntry(complaintId, {
    authorRole: 'worker',
    authorName: workerName,
    message: `Work finalized: ${remark}`,
    images: photos,
    type: 'worker_finalized'
  });
}

// Client resolve
export async function clientResolve(complaintId, clientName, districtId) {
  await updateComplaint(complaintId, {
    clientResolutionResponse: 'resolved',
    status: 'resolved',
    resolvedAt: serverTimestamp()
  });

  await addThreadEntry(complaintId, {
    authorRole: 'client',
    authorName: clientName,
    message: 'Issue marked as resolved by client.',
    images: [],
    type: 'client_resolved'
  });

  if (districtId) {
    await updateDoc(doc(db, 'districts', districtId), {
      resolvedIssues: increment(1)
    }).catch(() => {});
  }
}

// Client decline
export async function clientDecline(complaintId, remark, photo, clientName) {
  await updateComplaint(complaintId, {
    clientResolutionResponse: 'not_resolved',
    clientDeclineRemark: remark,
    clientDeclinePhoto: photo,
    status: 'resolution_declined',
    workerFinalizedAt: null
  });

  await addThreadEntry(complaintId, {
    authorRole: 'client',
    authorName: clientName,
    message: `Resolution declined: ${remark}`,
    images: photo ? [photo] : [],
    type: 'client_declined'
  });
}

// Auto resolve
export async function autoResolve(complaintId, districtId) {
  await updateComplaint(complaintId, {
    status: 'resolved',
    autoResolved: true,
    resolvedAt: serverTimestamp(),
    clientResolutionResponse: 'resolved'
  });

  await addThreadEntry(complaintId, {
    authorRole: 'system',
    authorName: 'System',
    message: 'Complaint auto-resolved after 5 days of no response.',
    images: [],
    type: 'auto_resolved'
  });

  if (districtId) {
    await updateDoc(doc(db, 'districts', districtId), {
      resolvedIssues: increment(1)
    }).catch(() => {});
  }
}

// ============ THREAD ============
export async function addThreadEntry(complaintId, data) {
  await addDoc(collection(db, 'complaints', complaintId, 'thread'), {
    ...data,
    timestamp: serverTimestamp()
  });
}

export async function getThread(complaintId) {
  const q = query(
    collection(db, 'complaints', complaintId, 'thread'),
    orderBy('timestamp', 'asc')
  );
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
}

// ============ REAL-TIME LISTENERS ============
export function onComplaintsSnapshot(filters, callback) {
  let q = collection(db, 'complaints');
  const constraints = [orderBy('createdAt', 'desc')];

  if (filters.districtId) {
    constraints.unshift(where('districtId', '==', filters.districtId));
  }
  if (filters.clientId) {
    constraints.unshift(where('clientId', '==', filters.clientId));
  }

  q = query(q, ...constraints);
  return onSnapshot(q, (snap) => {
    const data = snap.docs.map(d => ({ id: d.id, ...d.data() }));
    callback(data);
  });
}
