export function generateRandomInt(digits = 5) {
  const min = Math.pow(10, digits - 1);
  const max = Math.pow(10, digits) - 1;
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

export function generateAdminId(districtEnglish, representativeName) {
  const district = districtEnglish.toLowerCase().replace(/\s+/g, '');
  const nameParts = representativeName.trim().split(/\s+/);
  let prefix = '';
  if (nameParts.length >= 2) {
    prefix = nameParts[0].toLowerCase() + nameParts[1].charAt(0).toLowerCase();
  } else {
    prefix = nameParts[0].toLowerCase();
  }
  // Remove special chars like "Dr.", "II" etc
  prefix = prefix.replace(/[^a-z]/gi, '').toLowerCase();
  return `${district}_${prefix}`;
}

export function generateAdminPassword() {
  return `Welcome@${generateRandomInt(5)}`;
}

export function generateWorkerId(workerName, mobile) {
  const name = workerName.toLowerCase().replace(/\s+/g, '');
  const last4 = mobile.slice(-4);
  return `${name}_${last4}`;
}

export function generateWorkerPassword(mobile) {
  return mobile;
}

export function formatComplaintNumber(index) {
  const year = new Date().getFullYear();
  const num = String(index).padStart(5, '0');
  return `UP-MCD-${year}-${num}`;
}

export function formatDate(timestamp) {
  if (!timestamp) return '—';
  const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
  return date.toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  });
}

export function formatDateTime(timestamp) {
  if (!timestamp) return '—';
  const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
  return date.toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}

export function timeAgo(timestamp) {
  if (!timestamp) return '';
  const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
  const now = new Date();
  const diff = now - date;
  const mins = Math.floor(diff / 60000);
  const hrs = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);
  if (mins < 1) return 'Just now';
  if (mins < 60) return `${mins}m ago`;
  if (hrs < 24) return `${hrs}h ago`;
  if (days < 7) return `${days}d ago`;
  return formatDate(timestamp);
}

export function getDaysRemaining(expectedDate) {
  if (!expectedDate) return null;
  const target = expectedDate.toDate ? expectedDate.toDate() : new Date(expectedDate);
  const now = new Date();
  const diff = target - now;
  return Math.ceil(diff / 86400000);
}

export function getDaysSince(timestamp) {
  if (!timestamp) return 0;
  const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
  const now = new Date();
  return Math.floor((now - date) / 86400000);
}

export function shouldAutoResolve(workerFinalizedAt) {
  if (!workerFinalizedAt) return false;
  return getDaysSince(workerFinalizedAt) >= 5;
}

export function calculateHonorScore(resolved, total) {
  if (total === 0) return 0;
  return Math.round((resolved / total) * 100);
}

export function truncate(str, len = 80) {
  if (!str) return '';
  return str.length > len ? str.slice(0, len) + '...' : str;
}

export function makeEmailFromId(userId) {
  return `${userId.toLowerCase().replace(/\s+/g, '_')}@up-mcd.app`;
}

export function getStatusBadge(status) {
  switch (status) {
    case 'registered':
      return { label: 'Registered', bg: '#FEF3C7', color: '#D97706' };
    case 'assigned':
      return { label: 'Assigned', bg: '#E0F2FE', color: '#0284C7' };
    case 'in_progress':
      return { label: 'In Progress', bg: '#F3E8FF', color: '#8B5CF6' };
    case 'finalized_by_worker':
      return { label: 'Worker Finalized', bg: '#FEF9C3', color: '#CA8A04' };
    case 'resolved':
      return { label: 'Resolved', bg: '#DCFCE7', color: '#16A34A' };
    case 'reopened':
      return { label: 'Reopened', bg: '#FEE2E2', color: '#DC2626' };
    default:
      return { label: status || 'Pending', bg: '#F1F5F9', color: '#64748B' };
  }
}

