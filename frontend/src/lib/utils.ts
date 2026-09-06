import { clsx, type ClassValue } from 'clsx';

/** Merge class names */
export function cn(...inputs: ClassValue[]) {
  return clsx(inputs);
}

/** Format date to readable string */
export function formatDate(dateStr: string): string {
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

/** Format datetime to readable string */
export function formatDateTime(dateStr: string): string {
  const d = new Date(dateStr);
  return d.toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

/** Format relative time */
export function timeAgo(dateStr: string): string {
  const now = new Date();
  const d = new Date(dateStr);
  const seconds = Math.floor((now.getTime() - d.getTime()) / 1000);
  if (seconds < 60) return 'just now';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return formatDate(dateStr);
}

/** Get status color */
export function getStatusColor(status: string): string {
  const colors: Record<string, string> = {
    SUBMITTED: 'bg-blue-100 text-blue-800',
    VERIFIED: 'bg-indigo-100 text-indigo-800',
    PRIORITIZED: 'bg-purple-100 text-purple-800',
    ASSIGNED: 'bg-yellow-100 text-yellow-800',
    IN_PROGRESS: 'bg-orange-100 text-orange-800',
    RESOLVED: 'bg-green-100 text-green-800',
    CLOSED: 'bg-gray-100 text-gray-800',
    REJECTED: 'bg-red-100 text-red-800',
    DUPLICATE: 'bg-gray-200 text-gray-600',
  };
  return colors[status] || 'bg-gray-100 text-gray-800';
}

/** Get priority color */
export function getPriorityColor(level: string | null): string {
  if (!level) return 'bg-gray-100 text-gray-600';
  const colors: Record<string, string> = {
    CRITICAL: 'bg-red-600 text-white',
    HIGH: 'bg-orange-500 text-white',
    MEDIUM: 'bg-yellow-400 text-gray-900',
    LOW: 'bg-blue-100 text-blue-800',
    INFORMATIONAL: 'bg-gray-100 text-gray-600',
  };
  return colors[level] || 'bg-gray-100 text-gray-600';
}

/** Get severity color */
export function getSeverityColor(severity: number): string {
  if (severity >= 8) return 'text-red-700 dark:text-red-400';
  if (severity >= 6) return 'text-orange-700 dark:text-orange-400';
  if (severity >= 4) return 'text-yellow-700 dark:text-yellow-400';
  return 'text-green-700 dark:text-emerald-400';
}

/** Get priority badge bg for map markers */
export function getPriorityMarkerColor(level: string | null): string {
  if (!level) return '#6b7280';
  const colors: Record<string, string> = {
    CRITICAL: '#dc2626',
    HIGH: '#f97316',
    MEDIUM: '#eab308',
    LOW: '#3b82f6',
    INFORMATIONAL: '#6b7280',
  };
  return colors[level] || '#6b7280';
}

/** Truncate text */
export function truncate(text: string, maxLen: number): string {
  if (text.length <= maxLen) return text;
  return text.slice(0, maxLen).trimEnd() + '…';
}

/** Build the media URL from the backend file path */
export function mediaUrl(filePath: string): string {
  const base = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
  if (filePath.startsWith('http')) return filePath;
  if (filePath.startsWith('/')) return `${base}${filePath}`;
  return `${base}/${filePath}`;
}

/** Category icon mapping */
export function getCategoryIcon(category: string): string {
  const icons: Record<string, string> = {
    'Road Damage': '🛣️',
    'Pothole': '🕳️',
    'Flooding': '🌊',
    'Garbage': '🗑️',
    'Broken Streetlight': '💡',
    'Water Leakage': '💧',
    'Blocked Drain': '🚧',
    'Fallen Tree': '🌳',
    'Traffic Obstruction': '🚗',
    'Fire/Smoke': '🔥',
    'Public Infrastructure Damage': '🏗️',
    'Other': '📋',
  };
  return icons[category] || '📋';
}
