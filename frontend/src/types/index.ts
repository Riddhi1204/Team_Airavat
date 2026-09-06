// ============================================================
// CivicPulse Frontend Types
// Mirrors the backend Pydantic schemas exactly
// ============================================================

// ---------- Categories ----------
export interface Category {
  id: number;
  name: string;
  description: string | null;
  is_active: boolean;
  created_at: string;
}

// ---------- Media ----------
export interface MediaItem {
  id: number;
  report_id: number;
  file_path: string;
  original_filename: string;
  mime_type: string;
  file_size: number;
  created_at: string;
}

// ---------- Report Creation ----------
export interface ReportCreatePayload {
  category: string;
  category_id?: number;
  original_description: string;
  english_description?: string;
  original_language: string;
  latitude: number;
  longitude: number;
  address?: string;
  locality?: string;
  district?: string;
  state?: string;
  country?: string;
}

export interface ReportCreateResponse {
  id: number;
  public_reference: string;
  status: string;
  created_at: string;
}

// ---------- Public Report ----------
export interface ReportPublic {
  id: number;
  public_reference: string;
  category: string;
  english_description: string;
  status: string;
  latitude: number;
  longitude: number;
  address: string | null;
  locality: string | null;
  district: string | null;
  created_at: string;
  media: MediaItem[];
}

// ---------- AI Analysis ----------
export interface AIAnalysis {
  id: number;
  report_id: number;
  detected_category: string | null;
  detected_severity: number | null;
  confidence: number | null;
  risk_indicators: string[];
  reasoning_summary: string | null;
  model_name: string;
  created_at: string;
}

// ---------- Priority Score ----------
export interface PriorityScore {
  id: number;
  report_id: number;
  severity_score: number;
  population_score: number;
  infrastructure_score: number;
  weather_score: number;
  duration_score: number;
  recurrence_score: number;
  final_score: number;
  priority_level: string;
  scoring_version: string;
  explanation: string;
  created_at: string;
}

// ---------- Status History ----------
export interface StatusHistoryItem {
  id: number;
  report_id: number;
  old_status: string | null;
  new_status: string;
  changed_by: string;
  note: string | null;
  created_at: string;
}

// ---------- Assignment ----------
export interface Assignment {
  id: number;
  report_id: number;
  department: string;
  assigned_to: string;
  assigned_at: string;
  completed_at: string | null;
}

// ---------- Context Data ----------
export interface ReportContext {
  estimated_population: number | null;
  population_radius_meters: number;
  population_source: string | null;
  population_available: boolean;
  nearby_infrastructure: InfrastructureItem[];
  infrastructure_available: boolean;
  weather_condition: string | null;
  temperature_celsius: number | null;
  precipitation_mm: number | null;
  wind_speed_kmh: number | null;
  weather_available: boolean;
}

export interface InfrastructureItem {
  name: string;
  type: string;
  distance_meters: number;
}

// ---------- Admin Report Detail ----------
export interface ReportDetailAdmin {
  id: number;
  public_reference: string;
  category: string;
  category_id: number;
  original_description: string;
  english_description: string;
  original_language: string;
  status: string;
  severity: number;
  latitude: number;
  longitude: number;
  address: string | null;
  locality: string | null;
  district: string | null;
  state: string | null;
  country: string | null;
  is_duplicate: boolean;
  duplicate_of_id: number | null;
  created_at: string;
  updated_at: string;
  resolved_at: string | null;
  media: MediaItem[];
  ai_analysis: AIAnalysis | null;
  priority_score: PriorityScore | null;
  status_history: StatusHistoryItem[];
  assignments: Assignment[];
  context_data: ReportContext | null;
}

// ---------- Admin Report List Item ----------
export interface ReportListItem {
  id: number;
  public_reference: string;
  category: string;
  category_id: number;
  original_description: string;
  english_description: string;
  original_language: string;
  status: string;
  severity: number;
  latitude: number;
  longitude: number;
  address: string | null;
  locality: string | null;
  district: string | null;
  state: string | null;
  country: string | null;
  is_duplicate: boolean;
  duplicate_of_id: number | null;
  created_at: string;
  updated_at: string;
  resolved_at: string | null;
  priority_score: number | null;
  priority_level: string | null;
  media_count: number;
}

// ---------- Paginated Response ----------
export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  page_size: number;
  total_pages: number;
}

// ---------- Map Marker ----------
export interface MapMarker {
  id: number;
  public_reference: string;
  latitude: number;
  longitude: number;
  category: string;
  status: string;
  priority_score: number | null;
  priority_level: string | null;
  severity: number;
  created_at: string;
}

// ---------- Dashboard ----------
export interface DashboardOverview {
  total_reports: number;
  pending: number;
  resolved: number;
  critical: number;
  high: number;
  medium: number;
  low: number;
  informational: number;
  average_resolution_time_hours: number | null;
}

export interface GroupCount {
  name: string;
  count: number;
}

export interface DashboardStatistics {
  reports_over_time: { date: string; count: number }[];
  category_distribution: GroupCount[];
  status_distribution: GroupCount[];
  priority_distribution: GroupCount[];
  district_distribution: GroupCount[];
}

export interface PriorityReport {
  id: number;
  public_reference: string;
  category: string;
  english_description: string;
  status: string;
  severity: number;
  priority_score: number | null;
  priority_level: string | null;
  explanation: string | null;
  locality: string | null;
  district: string | null;
  latitude: number;
  longitude: number;
  created_at: string;
}

// ---------- Auth ----------
export interface LoginPayload {
  email: string;
  password: string;
}

export interface AuthUser {
  id: number;
  email: string;
  full_name: string;
  role: string;
  is_active: boolean;
  created_at: string;
}

export interface TokenResponse {
  access_token: string;
  token_type: string;
  user: AuthUser;
}

// ---------- Location ----------
export interface ReverseGeocodeResponse {
  address: string;
  locality: string | null;
  district: string | null;
  state: string | null;
  country: string | null;
}

// ---------- Processing ----------
export interface TranscriptionResponse {
  text: string;
  detected_language: string | null;
  confidence: number | null;
}

export interface TranslationResponse {
  translated_text: string;
  source_language: string;
  target_language: string;
}

// ---------- Report Statuses ----------
export const REPORT_STATUSES = [
  'SUBMITTED', 'VERIFIED', 'PRIORITIZED', 'ASSIGNED',
  'IN_PROGRESS', 'RESOLVED', 'CLOSED', 'REJECTED', 'DUPLICATE'
] as const;

export type ReportStatus = typeof REPORT_STATUSES[number];

export const PRIORITY_LEVELS = [
  'CRITICAL', 'HIGH', 'MEDIUM', 'LOW', 'INFORMATIONAL'
] as const;

export type PriorityLevel = typeof PRIORITY_LEVELS[number];

// ---------- Filter params ----------
export interface ReportFilters {
  status?: string;
  category_id?: number;
  category_name?: string;
  priority_level?: string;
  min_severity?: number;
  max_severity?: number;
  district?: string;
  search?: string;
  is_duplicate?: boolean;
  start_date?: string;
  end_date?: string;
  page?: number;
  page_size?: number;
}

export interface MapFilters {
  status?: string;
  category?: string;
  priority?: string;
  severity?: number;
  district?: string;
  start_date?: string;
  end_date?: string;
  min_lat?: number;
  max_lat?: number;
  min_lng?: number;
  max_lng?: number;
  limit?: number;
}
