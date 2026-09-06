/**
 * CivicPulse API Client
 * Centralized API communication layer.
 * All backend calls go through this module.
 */

import type {
  Category,
  ReportCreatePayload,
  ReportCreateResponse,
  ReportPublic,
  ReportDetailAdmin,
  ReportListItem,
  PaginatedResponse,
  MapMarker,
  DashboardOverview,
  DashboardStatistics,
  PriorityReport,
  LoginPayload,
  TokenResponse,
  AuthUser,
  ReverseGeocodeResponse,
  TranscriptionResponse,
  TranslationResponse,
  ReportFilters,
  MapFilters,
  MediaItem,
} from '@/types';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
const API_V1 = `${API_BASE}/api/v1`;

// ---------- Helpers ----------

class ApiError extends Error {
  status: number;
  code: string;
  constructor(message: string, status: number, code: string = 'UNKNOWN_ERROR') {
    super(message);
    this.status = status;
    this.code = code;
    this.name = 'ApiError';
  }
}

async function handleResponse<T>(res: Response): Promise<T> {
  if (!res.ok) {
    let code = 'UNKNOWN_ERROR';
    let message = `Request failed with status ${res.status}`;
    try {
      const body = await res.json();
      if (body.error) {
        code = body.error.code || code;
        message = body.error.message || message;
      }
    } catch {
      // ignore parse errors
    }
    throw new ApiError(message, res.status, code);
  }
  if (res.status === 204) return undefined as T;
  return res.json();
}

function authHeaders(token: string): HeadersInit {
  return {
    Authorization: `Bearer ${token}`,
    'Content-Type': 'application/json',
  };
}

function buildQuery(params: Record<string, unknown>): string {
  const searchParams = new URLSearchParams();
  Object.entries(params).forEach(([key, val]) => {
    if (val !== undefined && val !== null && val !== '') {
      searchParams.append(key, String(val));
    }
  });
  const qs = searchParams.toString();
  return qs ? `?${qs}` : '';
}

// ============================================================
// PUBLIC ENDPOINTS
// ============================================================

/** Health check */
export async function healthCheck(): Promise<{ status: string; database: string }> {
  const res = await fetch(`${API_BASE}/health`);
  return handleResponse(res);
}

/** Get all active categories */
export async function getCategories(): Promise<Category[]> {
  const res = await fetch(`${API_V1}/categories`);
  return handleResponse(res);
}

/** Submit a new public report */
export async function createReport(payload: ReportCreatePayload): Promise<ReportCreateResponse> {
  const res = await fetch(`${API_V1}/reports`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  return handleResponse(res);
}

/** Get public report by ID or public reference */
export async function getPublicReport(idOrRef: string): Promise<ReportPublic> {
  const res = await fetch(`${API_V1}/reports/${encodeURIComponent(idOrRef)}`);
  return handleResponse(res);
}

/** Upload media to a report */
export async function uploadReportMedia(reportId: number, file: File): Promise<MediaItem> {
  const formData = new FormData();
  formData.append('file', file);
  const res = await fetch(`${API_V1}/reports/${reportId}/media`, {
    method: 'POST',
    body: formData,
  });
  return handleResponse(res);
}

// ============================================================
// PROCESSING ENDPOINTS
// ============================================================

/** Transcribe audio to text */
export async function transcribeAudio(audioFile: File): Promise<TranscriptionResponse> {
  const formData = new FormData();
  formData.append('audio', audioFile);
  const res = await fetch(`${API_V1}/processing/transcribe`, {
    method: 'POST',
    body: formData,
  });
  return handleResponse(res);
}

/** Translate text to English */
export async function translateText(
  text: string,
  sourceLanguage?: string,
  targetLanguage: string = 'en'
): Promise<TranslationResponse> {
  const res = await fetch(`${API_V1}/processing/translate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text, source_language: sourceLanguage, target_language: targetLanguage }),
  });
  return handleResponse(res);
}

// ============================================================
// LOCATION ENDPOINTS
// ============================================================

/** Reverse geocode coordinates */
export async function reverseGeocode(latitude: number, longitude: number): Promise<ReverseGeocodeResponse> {
  const res = await fetch(`${API_V1}/location/reverse-geocode`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ latitude, longitude }),
  });
  return handleResponse(res);
}

// ============================================================
// MAP ENDPOINTS (Public)
// ============================================================

/** Get map report markers */
export async function getMapReports(filters: MapFilters = {}): Promise<MapMarker[]> {
  const qs = buildQuery(filters as Record<string, unknown>);
  const res = await fetch(`${API_V1}/map/reports${qs}`);
  return handleResponse(res);
}

// ============================================================
// AUTH ENDPOINTS
// ============================================================

/** Admin login */
export async function login(payload: LoginPayload): Promise<TokenResponse> {
  const res = await fetch(`${API_V1}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  return handleResponse(res);
}

/** Get current user profile */
export async function getCurrentUser(token: string): Promise<AuthUser> {
  const res = await fetch(`${API_V1}/auth/me`, {
    headers: authHeaders(token),
  });
  return handleResponse(res);
}

// ============================================================
// ADMIN ENDPOINTS
// ============================================================

/** List admin reports with filters */
export async function getAdminReports(
  token: string,
  filters: ReportFilters = {}
): Promise<PaginatedResponse<ReportListItem>> {
  const qs = buildQuery(filters as Record<string, unknown>);
  const res = await fetch(`${API_V1}/admin/reports${qs}`, {
    headers: authHeaders(token),
  });
  return handleResponse(res);
}

/** Get admin report detail */
export async function getAdminReportDetail(
  token: string,
  id: number
): Promise<ReportDetailAdmin> {
  const res = await fetch(`${API_V1}/admin/reports/${id}`, {
    headers: authHeaders(token),
  });
  return handleResponse(res);
}

/** Update report status */
export async function updateReportStatus(
  token: string,
  id: number,
  status: string,
  note?: string
): Promise<{ id: number; public_reference: string; status: string; message: string }> {
  const res = await fetch(`${API_V1}/admin/reports/${id}/status`, {
    method: 'PATCH',
    headers: authHeaders(token),
    body: JSON.stringify({ status, note }),
  });
  return handleResponse(res);
}

/** Assign a report */
export async function assignReport(
  token: string,
  id: number,
  department: string,
  assignedTo: string,
  note?: string
) {
  const res = await fetch(`${API_V1}/admin/reports/${id}/assign`, {
    method: 'POST',
    headers: authHeaders(token),
    body: JSON.stringify({ department, assigned_to: assignedTo, note }),
  });
  return handleResponse(res);
}

/** Recalculate priority */
export async function recalculatePriority(token: string, id: number) {
  const res = await fetch(`${API_V1}/admin/reports/${id}/recalculate-priority`, {
    method: 'POST',
    headers: authHeaders(token),
  });
  return handleResponse(res);
}

/** Run AI analysis */
export async function runAIAnalysis(token: string, id: number) {
  const res = await fetch(`${API_V1}/admin/reports/${id}/run-ai`, {
    method: 'POST',
    headers: authHeaders(token),
  });
  return handleResponse(res);
}

// ============================================================
// DASHBOARD ENDPOINTS
// ============================================================

/** Dashboard overview KPIs */
export async function getDashboardOverview(token: string): Promise<DashboardOverview> {
  const res = await fetch(`${API_V1}/dashboard/overview`, {
    headers: authHeaders(token),
  });
  return handleResponse(res);
}

/** Dashboard statistics */
export async function getDashboardStatistics(
  token: string,
  startDate?: string,
  endDate?: string
): Promise<DashboardStatistics> {
  const qs = buildQuery({ start_date: startDate, end_date: endDate });
  const res = await fetch(`${API_V1}/dashboard/statistics${qs}`, {
    headers: authHeaders(token),
  });
  return handleResponse(res);
}

/** Get highest priority reports */
export async function getDashboardPriority(
  token: string,
  limit: number = 10
): Promise<PriorityReport[]> {
  const qs = buildQuery({ limit });
  const res = await fetch(`${API_V1}/dashboard/priority${qs}`, {
    headers: authHeaders(token),
  });
  return handleResponse(res);
}

// Export the error class
export { ApiError };

export async function getPublicDashboardOverview(): Promise<DashboardOverview> {
  const res = await fetch(`${API_V1}/dashboard/public-overview`, {
    next: { revalidate: 60 } // optional Next.js cache revalidation
  });
  return handleResponse(res);
}
