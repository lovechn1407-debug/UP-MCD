import { db } from '../firebase/config';
import {
  collection, doc, getDoc, getDocs, setDoc, addDoc, updateDoc, deleteDoc,
  query, where, serverTimestamp, Timestamp,
  onSnapshot, increment, writeBatch
} from 'firebase/firestore';

// Helper to safely sort array by date desc
function sortByDateDesc(arr, field = 'createdAt') {
  return [...arr].sort((a, b) => {
    const tA = a[field]?.seconds || (a[field] ? new Date(a[field]).getTime() / 1000 : 0);
    const tB = b[field]?.seconds || (b[field] ? new Date(b[field]).getTime() / 1000 : 0);
    return tB - tA;
  });
}

// Helper to safely sort array by date asc
function sortByDateAsc(arr, field = 'timestamp') {
  return [...arr].sort((a, b) => {
    const tA = a[field]?.seconds || (a[field] ? new Date(a[field]).getTime() / 1000 : 0);
    const tB = b[field]?.seconds || (b[field] ? new Date(b[field]).getTime() / 1000 : 0);
    return tA - tB;
  });
}

// ============ SETTINGS ============
export async function getSettings() {
  try {
    const snap = await getDoc(doc(db, 'settings', 'site'));
    return snap.exists() ? snap.data() : null;
  } catch (err) {
    console.warn('Firestore getSettings error:', err);
    return null;
  }
}

export async function updateSettings(data) {
  try {
    await setDoc(doc(db, 'settings', 'site'), { ...data, updatedAt: serverTimestamp() }, { merge: true });
  } catch (err) {
    console.warn('Firestore updateSettings error:', err);
  }
}

// ============ USERS ============
export async function createUser(uid, userData) {
  try {
    await setDoc(doc(db, 'users', uid), {
      ...userData,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    }, { merge: true });
  } catch (err) {
    console.warn('Firestore createUser error:', err);
  }
}

export async function getUser(uid) {
  try {
    const snap = await getDoc(doc(db, 'users', uid));
    return snap.exists() ? { id: snap.id, ...snap.data() } : null;
  } catch (err) {
    console.warn('Firestore getUser error:', err);
    return null;
  }
}

export async function getUserByLoginId(userId, role) {
  try {
    const q = query(collection(db, 'users'), where('role', '==', role));
    const snap = await getDocs(q);
    if (snap.empty) return null;
    const match = snap.docs.find(d => {
      const u = d.data();
      return u.userId && u.userId.trim().toLowerCase() === userId.trim().toLowerCase();
    });
    return match ? { id: match.id, ...match.data() } : null;
  } catch (err) {
    console.warn('Firestore getUserByLoginId error:', err);
    return null;
  }
}

export async function getUsersByRole(role) {
  try {
    const q = query(collection(db, 'users'), where('role', '==', role));
    const snap = await getDocs(q);
    const docs = snap.docs.map(d => ({ id: d.id, ...d.data() }));
    return sortByDateDesc(docs, 'createdAt');
  } catch (err) {
    console.warn('Firestore getUsersByRole error:', err);
    return [];
  }
}

export async function getWorkersByAdmin(adminDistrictId) {
  try {
    const q = query(collection(db, 'users'), where('role', '==', 'worker'), where('districtId', '==', adminDistrictId));
    const snap = await getDocs(q);
    return snap.docs.map(d => ({ id: d.id, ...d.data() }));
  } catch (err) {
    console.warn('Firestore getWorkersByAdmin error:', err);
    return [];
  }
}

export async function updateUser(uid, data) {
  try {
    await updateDoc(doc(db, 'users', uid), { ...data, updatedAt: serverTimestamp() });
  } catch (err) {
    console.warn('Firestore updateUser error:', err);
  }
}

export async function findUserByEmail(email) {
  try {
    const q = query(collection(db, 'users'), where('email', '==', email));
    const snap = await getDocs(q);
    if (snap.empty) return null;
    const d = snap.docs[0];
    return { id: d.id, ...d.data() };
  } catch (err) {
    console.warn('Firestore findUserByEmail error:', err);
    return null;
  }
}

// ============ DIVISIONS ============
export async function createDivision(id, data) {
  try {
    await setDoc(doc(db, 'divisions', id), data);
  } catch (err) {
    console.warn('Firestore createDivision error:', err);
  }
}

export async function getDivisions() {
  try {
    const snap = await getDocs(collection(db, 'divisions'));
    return snap.docs.map(d => ({ id: d.id, ...d.data() }));
  } catch (err) {
    console.warn('Firestore getDivisions error:', err);
    return [];
  }
}

// ============ DISTRICTS ============
export async function createDistrict(id, data) {
  try {
    await setDoc(doc(db, 'districts', id), data);
  } catch (err) {
    console.warn('Firestore createDistrict error:', err);
  }
}

export async function getDistricts() {
  try {
    const snap = await getDocs(collection(db, 'districts'));
    return snap.docs.map(d => ({ id: d.id, ...d.data() }));
  } catch (err) {
    console.warn('Firestore getDistricts error:', err);
    return [];
  }
}

export async function getDistrictsByDivision(divisionId) {
  try {
    const q = query(collection(db, 'districts'), where('divisionId', '==', divisionId));
    const snap = await getDocs(q);
    return snap.docs.map(d => ({ id: d.id, ...d.data() }));
  } catch (err) {
    console.warn('Firestore getDistrictsByDivision error:', err);
    return [];
  }
}

export async function updateDistrict(id, data) {
  try {
    await updateDoc(doc(db, 'districts', id), data);
  } catch (err) {
    console.warn('Firestore updateDistrict error:', err);
  }
}

export async function getDistrictById(id) {
  try {
    const snap = await getDoc(doc(db, 'districts', id));
    return snap.exists() ? { id: snap.id, ...snap.data() } : null;
  } catch (err) {
    console.warn('Firestore getDistrictById error:', err);
    return null;
  }
}

// ============ COMPLAINTS ============
export async function createComplaint(data) {
  try {
    let nextNum = 1;
    try {
      const countDoc = await getDoc(doc(db, 'settings', 'counters'));
      if (countDoc.exists() && countDoc.data().complaintCount) {
        nextNum = countDoc.data().complaintCount + 1;
      }
    } catch (e) {}

    await setDoc(doc(db, 'settings', 'counters'), { complaintCount: nextNum }, { merge: true }).catch(() => {});

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
  } catch (err) {
    console.error('Firestore createComplaint error:', err);
    throw err;
  }
}

export async function getComplaints(filters = {}) {
  try {
    let q = collection(db, 'complaints');
    const constraints = [];

    if (filters.districtId) {
      constraints.push(where('districtId', '==', filters.districtId));
    }
    if (filters.clientId) {
      constraints.push(where('clientId', '==', filters.clientId));
    }
    if (filters.assignedWorkerId) {
      constraints.push(where('assignedWorkerId', '==', filters.assignedWorkerId));
    }
    if (filters.status) {
      constraints.push(where('status', '==', filters.status));
    }

    if (constraints.length > 0) {
      q = query(q, ...constraints);
    }
    
    const snap = await getDocs(q);
    const docs = snap.docs.map(d => ({ id: d.id, ...d.data() }));
    return sortByDateDesc(docs, 'createdAt');
  } catch (err) {
    console.warn('Firestore getComplaints error:', err);
    return [];
  }
}

export async function getComplaintById(id) {
  try {
    const snap = await getDoc(doc(db, 'complaints', id));
    return snap.exists() ? { id: snap.id, ...snap.data() } : null;
  } catch (err) {
    console.warn('Firestore getComplaintById error:', err);
    return null;
  }
}

export async function updateComplaint(id, data) {
  try {
    await updateDoc(doc(db, 'complaints', id), { ...data, updatedAt: serverTimestamp() });
  } catch (err) {
    console.warn('Firestore updateComplaint error:', err);
  }
}

// Admin reply
export async function adminReplyToComplaint(complaintId, reply, expectedDays, adminName) {
  try {
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
  } catch (err) {
    console.warn('Firestore adminReplyToComplaint error:', err);
  }
}

// Assign worker
export async function assignWorker(complaintId, worker, adminName) {
  try {
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
  } catch (err) {
    console.warn('Firestore assignWorker error:', err);
  }
}

// Worker finalize
export async function workerFinalize(complaintId, remark, photos, workerName) {
  try {
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
  } catch (err) {
    console.warn('Firestore workerFinalize error:', err);
  }
}

// Client resolve
export async function clientResolve(complaintId, clientName, districtId) {
  try {
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
  } catch (err) {
    console.warn('Firestore clientResolve error:', err);
  }
}

// Client decline
export async function clientDecline(complaintId, remark, photo, clientName) {
  try {
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
  } catch (err) {
    console.warn('Firestore clientDecline error:', err);
  }
}

// Auto resolve
export async function autoResolve(complaintId, districtId) {
  try {
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
  } catch (err) {
    console.warn('Firestore autoResolve error:', err);
  }
}

// ============ THREAD ============
export async function addThreadEntry(complaintId, data) {
  try {
    await addDoc(collection(db, 'complaints', complaintId, 'thread'), {
      ...data,
      timestamp: serverTimestamp()
    });
  } catch (err) {
    console.warn('Firestore addThreadEntry error:', err);
  }
}

export async function getThread(complaintId) {
  try {
    const q = collection(db, 'complaints', complaintId, 'thread');
    const snap = await getDocs(q);
    const docs = snap.docs.map(d => ({ id: d.id, ...d.data() }));
    return sortByDateAsc(docs, 'timestamp');
  } catch (err) {
    console.warn('Firestore getThread error:', err);
    return [];
  }
}

// ============ REAL-TIME LISTENERS ============
export function onComplaintsSnapshot(filters, callback) {
  try {
    let q = collection(db, 'complaints');
    const constraints = [];

    if (filters.districtId) {
      constraints.push(where('districtId', '==', filters.districtId));
    }
    if (filters.clientId) {
      constraints.push(where('clientId', '==', filters.clientId));
    }

    if (constraints.length > 0) {
      q = query(q, ...constraints);
    }
    return onSnapshot(
      q,
      (snap) => {
        const docs = snap.docs.map(d => ({ id: d.id, ...d.data() }));
        callback(sortByDateDesc(docs, 'createdAt'));
      },
      (error) => {
        console.warn('Firestore snapshot listener connection offline or interrupted:', error);
      }
    );
  } catch (err) {
    console.warn('Firestore onComplaintsSnapshot error:', err);
    return () => {};
  }
}
