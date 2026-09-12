export const ROLES = {
  MASTER: 'master',
  ADMIN: 'admin',
  WORKER: 'worker',
  CLIENT: 'client'
};

export const COMPLAINT_STATUS = {
  NEW: 'new',
  ADMIN_REPLIED: 'admin_replied',
  WORKER_ASSIGNED: 'worker_assigned',
  IN_PROGRESS: 'in_progress',
  FINALIZED_BY_WORKER: 'finalized_by_worker',
  RESOLVED: 'resolved',
  RESOLUTION_DECLINED: 'resolution_declined'
};

export const STATUS_LABELS = {
  new: 'New',
  admin_replied: 'Admin Replied',
  worker_assigned: 'Worker Assigned',
  in_progress: 'In Progress',
  finalized_by_worker: 'Finalized by Worker',
  resolved: 'Resolved',
  resolution_declined: 'Resolution Declined'
};

export const STATUS_COLORS = {
  new: '#6366F1',
  admin_replied: '#2563EB',
  worker_assigned: '#8B5CF6',
  in_progress: '#F59E0B',
  finalized_by_worker: '#06B6D4',
  resolved: '#10B981',
  resolution_declined: '#EF4444'
};

export const COMPLAINT_TYPES = [
  'Road Damage / Potholes',
  'Street Light Not Working',
  'Water Supply Issue',
  'Drainage / Sewage Blockage',
  'Garbage Collection',
  'Illegal Encroachment',
  'Broken Footpath / Sidewalk',
  'Public Toilet Maintenance',
  'Park / Garden Maintenance',
  'Stray Animal Menace',
  'Noise Pollution',
  'Air Pollution',
  'Water Pollution',
  'Illegal Construction',
  'Traffic Signal Malfunction',
  'Bus Stop Maintenance',
  'Public Building Repair',
  'Electricity Issue',
  'Mosquito / Pest Control',
  'Tree Falling / Dangerous Trees',
  'Open Manhole',
  'Waterlogging / Flooding',
  'Public Property Vandalism',
  'Unauthorized Parking',
  'Other'
];

export const THREAD_TYPES = {
  COMPLAINT_FILED: 'complaint_filed',
  ADMIN_REPLY: 'admin_reply',
  WORKER_ASSIGNED: 'worker_assigned',
  WORKER_UPDATE: 'worker_update',
  WORKER_FINALIZED: 'worker_finalized',
  CLIENT_RESOLVED: 'client_resolved',
  CLIENT_DECLINED: 'client_declined',
  AUTO_RESOLVED: 'auto_resolved'
};

export const MAX_RESOLUTION_DAYS = 20;
export const AUTO_RESOLVE_DAYS = 5;
export const IMGBB_API_KEY = '83e3f88941efd1059a89f016ff302d9e';
export const FIREBASE_API_KEY = 'AIzaSyBZTA1_4QtW6z0Nz-fKZxp5GgfznqWzpO8';

export const MASTER_CREDENTIALS = {
  userId: 'UP_MCD',
  password: '12345678'
};
