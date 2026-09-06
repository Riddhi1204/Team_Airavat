'use client';

import { useEffect, useState, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft,
  MapPin,
  Clock,
  Tag,
  AlertTriangle,
  Brain,
  BarChart3,
  Users,
  Building2,
  CloudRain,
  History,
  UserCheck,
  Send,
  RefreshCw,
  Loader2,
  Copy,
  CheckCircle2,
  ImageIcon,
} from 'lucide-react';
import { getToken } from '@/lib/auth';
import {
  getAdminReportDetail,
  updateReportStatus,
  assignReport,
  recalculatePriority,
  runAIAnalysis,
} from '@/lib/api';
import type { ReportDetailAdmin } from '@/types';
import { REPORT_STATUSES } from '@/types';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import ErrorState from '@/components/ui/ErrorState';
import StatusBadge from '@/components/ui/StatusBadge';
import PriorityBadge from '@/components/ui/PriorityBadge';
import Modal from '@/components/ui/Modal';
import {
  formatDateTime,
  timeAgo,
  getSeverityColor,
  mediaUrl,
} from '@/lib/utils';

export default function ReportDetailPage() {
  const params = useParams();
  const router = useRouter();
  const reportId = Number(params.id);

  const [report, setReport] = useState<ReportDetailAdmin | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Status update
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [newStatus, setNewStatus] = useState('');
  const [statusNote, setStatusNote] = useState('');
  const [updatingStatus, setUpdatingStatus] = useState(false);

  // Assignment
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [assignDept, setAssignDept] = useState('');
  const [assignTo, setAssignTo] = useState('');
  const [assignNote, setAssignNote] = useState('');
  const [assigning, setAssigning] = useState(false);

  // Actions
  const [recalculating, setRecalculating] = useState(false);
  const [runningAI, setRunningAI] = useState(false);

  // Image modal
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  const loadReport = useCallback(async () => {
    const token = getToken();
    if (!token || !reportId) return;
    setLoading(true);
    setError(null);
    try {
      const data = await getAdminReportDetail(token, reportId);
      setReport(data);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to load report');
    } finally {
      setLoading(false);
    }
  }, [reportId]);

  useEffect(() => {
    loadReport();
  }, [loadReport]);

  async function handleStatusUpdate() {
    const token = getToken();
    if (!token || !report || !newStatus) return;
    setUpdatingStatus(true);
    try {
      await updateReportStatus(token, report.id, newStatus, statusNote || undefined);
      setShowStatusModal(false);
      setNewStatus('');
      setStatusNote('');
      loadReport();
    } catch {
      // Error handling
    } finally {
      setUpdatingStatus(false);
    }
  }

  async function handleAssign() {
    const token = getToken();
    if (!token || !report || !assignDept || !assignTo) return;
    setAssigning(true);
    try {
      await assignReport(token, report.id, assignDept, assignTo, assignNote || undefined);
      setShowAssignModal(false);
      setAssignDept('');
      setAssignTo('');
      setAssignNote('');
      loadReport();
    } catch {
      // Error handling
    } finally {
      setAssigning(false);
    }
  }

  async function handleRecalculate() {
    const token = getToken();
    if (!token || !report) return;
    setRecalculating(true);
    try {
      await recalculatePriority(token, report.id);
      loadReport();
    } catch {
      // Error
    } finally {
      setRecalculating(false);
    }
  }

  async function handleRunAI() {
    const token = getToken();
    if (!token || !report) return;
    setRunningAI(true);
    try {
      await runAIAnalysis(token, report.id);
      loadReport();
    } catch {
      // Error
    } finally {
      setRunningAI(false);
    }
  }

  if (loading) return <LoadingSpinner size="lg" className="py-20" />;
  if (error) return <ErrorState message={error} onRetry={loadReport} />;
  if (!report) return null;

  const ps = report.priority_score;
  const ai = report.ai_analysis;
  const ctx = report.context_data;

  return (
    <div>
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => router.back()} className="p-2 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700">
          <ArrowLeft className="h-5 w-5" />
        </button>
        <div className="flex-1">
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="text-xl font-bold text-slate-900 dark:text-slate-100">{report.public_reference}</h1>
            <StatusBadge status={report.status} />
            <PriorityBadge level={ps?.priority_level || null} />
            {report.is_duplicate && (
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-800">Duplicate</span>
            )}
          </div>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">{report.category} • Submitted {timeAgo(report.created_at)}</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => setShowStatusModal(true)} className="btn-primary text-sm">
            Update Status
          </button>
          <button onClick={() => setShowAssignModal(true)} className="btn-secondary text-sm">
            <UserCheck className="h-4 w-4 mr-1" /> Assign
          </button>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Description */}
          <div className="card p-5">
            <h3 className="text-sm font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-3">Description</h3>
            <p className="text-slate-900 dark:text-slate-100 leading-relaxed">{report.english_description}</p>
            {report.original_language !== 'en' && report.original_description !== report.english_description && (
              <div className="mt-4 bg-slate-50 dark:bg-slate-800/50 rounded-lg p-3">
                <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">
                  Original ({report.original_language.toUpperCase()})
                </p>
                <p className="text-sm text-slate-700 dark:text-slate-300">{report.original_description}</p>
              </div>
            )}
          </div>

          {/* Media */}
          {report.media.length > 0 && (
            <div className="card p-5">
              <h3 className="text-sm font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-3">
                <ImageIcon className="h-4 w-4 inline mr-1" />
                Evidence Photos ({report.media.length})
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {report.media.map((m) => (
                  <button
                    key={m.id}
                    onClick={() => setSelectedImage(mediaUrl(m.file_path))}
                    className="relative group"
                  >
                    <img
                      src={mediaUrl(m.file_path)}
                      alt={m.original_filename}
                      className="rounded-lg object-cover h-36 w-full border hover:opacity-90 transition-opacity"
                    />
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* AI Analysis */}
          {ai && (
            <div className="card p-5">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  <Brain className="h-4 w-4 inline mr-1" />
                  AI Analysis
                </h3>
                <button
                  onClick={handleRunAI}
                  disabled={runningAI}
                  className="text-xs text-indigo-600 dark:text-indigo-400 hover:text-blue-800 font-medium"
                >
                  {runningAI ? <Loader2 className="h-3 w-3 animate-spin inline" /> : <RefreshCw className="h-3 w-3 inline mr-1" />}
                  Re-analyze
                </button>
              </div>
              <div className="grid sm:grid-cols-3 gap-4 mb-4">
                <div className="bg-slate-50 dark:bg-slate-800/50 rounded-lg p-3">
                  <p className="text-xs text-slate-500 dark:text-slate-400">Detected Category</p>
                  <p className="font-medium text-slate-900 dark:text-slate-100">{ai.detected_category || 'N/A'}</p>
                </div>
                <div className="bg-slate-50 dark:bg-slate-800/50 rounded-lg p-3">
                  <p className="text-xs text-slate-500 dark:text-slate-400">Severity</p>
                  <p className={`font-medium ${getSeverityColor(ai.detected_severity || 5)}`}>
                    {ai.detected_severity ?? 'N/A'}/10
                  </p>
                </div>
                <div className="bg-slate-50 dark:bg-slate-800/50 rounded-lg p-3">
                  <p className="text-xs text-slate-500 dark:text-slate-400">Confidence</p>
                  <p className="font-medium text-slate-900 dark:text-slate-100">
                    {ai.confidence ? `${(ai.confidence * 100).toFixed(0)}%` : 'N/A'}
                  </p>
                </div>
              </div>
              {ai.risk_indicators.length > 0 && (
                <div className="mb-3">
                  <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">Risk Indicators</p>
                  <div className="flex flex-wrap gap-1.5">
                    {ai.risk_indicators.map((r, i) => (
                      <span key={i} className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-50 text-red-700">{r}</span>
                    ))}
                  </div>
                </div>
              )}
              {ai.reasoning_summary && (
                <div>
                  <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">Reasoning</p>
                  <p className="text-sm text-slate-700 dark:text-slate-300">{ai.reasoning_summary}</p>
                </div>
              )}
              <p className="text-xs text-slate-400 dark:text-slate-500 mt-3">Model: {ai.model_name}</p>
            </div>
          )}

          {/* Priority Score Breakdown */}
          {ps && (
            <div className="card p-5">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  <BarChart3 className="h-4 w-4 inline mr-1" />
                  Priority Score Breakdown
                </h3>
                <button
                  onClick={handleRecalculate}
                  disabled={recalculating}
                  className="text-xs text-indigo-600 dark:text-indigo-400 hover:text-blue-800 font-medium"
                >
                  {recalculating ? <Loader2 className="h-3 w-3 animate-spin inline" /> : <RefreshCw className="h-3 w-3 inline mr-1" />}
                  Recalculate
                </button>
              </div>
              <div className="flex items-center gap-4 mb-4">
                <div className="text-3xl font-bold text-slate-900 dark:text-slate-100">{ps.final_score.toFixed(1)}</div>
                <PriorityBadge level={ps.priority_level} />
              </div>
              <div className="space-y-2 mb-4">
                {[
                  { label: 'Severity', value: ps.severity_score, weight: '35%', color: 'bg-red-500' },
                  { label: 'Population', value: ps.population_score, weight: '25%', color: 'bg-indigo-50 dark:bg-indigo-900/300' },
                  { label: 'Infrastructure', value: ps.infrastructure_score, weight: '15%', color: 'bg-purple-500' },
                  { label: 'Weather', value: ps.weather_score, weight: '10%', color: 'bg-cyan-500' },
                  { label: 'Duration', value: ps.duration_score, weight: '10%', color: 'bg-amber-500' },
                  { label: 'Recurrence', value: ps.recurrence_score, weight: '5%', color: 'bg-green-500' },
                ].map((item) => (
                  <div key={item.label} className="flex items-center gap-3">
                    <span className="text-xs text-slate-500 dark:text-slate-400 w-24">{item.label} ({item.weight})</span>
                    <div className="flex-1 bg-slate-100 dark:bg-slate-800 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full ${item.color}`}
                        style={{ width: `${item.value}%` }}
                      />
                    </div>
                    <span className="text-xs font-medium text-slate-700 dark:text-slate-300 w-10 text-right">
                      {item.value.toFixed(0)}
                    </span>
                  </div>
                ))}
              </div>
              {ps.explanation && (
                <div className="bg-indigo-50 dark:bg-indigo-900/30 rounded-lg p-3">
                  <p className="text-sm text-blue-800">{ps.explanation}</p>
                </div>
              )}
            </div>
          )}

          {/* Status History */}
          {report.status_history.length > 0 && (
            <div className="card p-5">
              <h3 className="text-sm font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-3">
                <History className="h-4 w-4 inline mr-1" />
                Status History
              </h3>
              <div className="space-y-3">
                {report.status_history.map((h) => (
                  <div key={h.id} className="flex items-start gap-3">
                    <div className="mt-1.5 w-2 h-2 rounded-full bg-indigo-50 dark:bg-indigo-900/300 shrink-0" />
                    <div className="flex-1">
                      <div className="flex items-center gap-2 text-sm">
                        {h.old_status && (
                          <>
                            <StatusBadge status={h.old_status} />
                            <span className="text-slate-400 dark:text-slate-500">→</span>
                          </>
                        )}
                        <StatusBadge status={h.new_status} />
                      </div>
                      <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                        {h.changed_by} • {formatDateTime(h.created_at)}
                      </div>
                      {h.note && <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">{h.note}</p>}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Location Info */}
          <div className="card p-5">
            <h3 className="text-sm font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-3">
              <MapPin className="h-4 w-4 inline mr-1" />
              Location
            </h3>
            <div className="space-y-2 text-sm">
              {report.address && (
                <p className="text-slate-900 dark:text-slate-100">{report.address}</p>
              )}
              {report.locality && (
                <div className="flex justify-between">
                  <span className="text-slate-500 dark:text-slate-400">Locality</span>
                  <span className="text-slate-900 dark:text-slate-100">{report.locality}</span>
                </div>
              )}
              {report.district && (
                <div className="flex justify-between">
                  <span className="text-slate-500 dark:text-slate-400">District</span>
                  <span className="text-slate-900 dark:text-slate-100">{report.district}</span>
                </div>
              )}
              {report.state && (
                <div className="flex justify-between">
                  <span className="text-slate-500 dark:text-slate-400">State</span>
                  <span className="text-slate-900 dark:text-slate-100">{report.state}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-slate-500 dark:text-slate-400">Coordinates</span>
                <span className="text-slate-900 dark:text-slate-100 font-mono text-xs">
                  {report.latitude.toFixed(6)}, {report.longitude.toFixed(6)}
                </span>
              </div>
            </div>
          </div>

          {/* Report Details */}
          <div className="card p-5">
            <h3 className="text-sm font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-3">
              <Tag className="h-4 w-4 inline mr-1" />
              Details
            </h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-slate-500 dark:text-slate-400">ID</span>
                <span className="text-slate-900 dark:text-slate-100">#{report.id}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 dark:text-slate-400">Reference</span>
                <span className="text-slate-900 dark:text-slate-100 font-mono">{report.public_reference}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 dark:text-slate-400">Severity</span>
                <span className={`font-medium ${getSeverityColor(report.severity)}`}>
                  {report.severity}/10
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 dark:text-slate-400">Language</span>
                <span className="text-slate-900 dark:text-slate-100">{report.original_language.toUpperCase()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 dark:text-slate-400">Created</span>
                <span className="text-slate-900 dark:text-slate-100">{formatDateTime(report.created_at)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 dark:text-slate-400">Updated</span>
                <span className="text-slate-900 dark:text-slate-100">{formatDateTime(report.updated_at)}</span>
              </div>
              {report.resolved_at && (
                <div className="flex justify-between">
                  <span className="text-slate-500 dark:text-slate-400">Resolved</span>
                  <span className="text-slate-900 dark:text-slate-100">{formatDateTime(report.resolved_at)}</span>
                </div>
              )}
            </div>
          </div>

          {/* Context Data: Population */}
          {ctx && ctx.population_available && (
            <div className="card p-5">
              <h3 className="text-sm font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-3">
                <Users className="h-4 w-4 inline mr-1" />
                Population Impact
              </h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-slate-500 dark:text-slate-400">Estimated Population</span>
                  <span className="font-medium text-slate-900 dark:text-slate-100">
                    {ctx.estimated_population?.toLocaleString() ?? 'N/A'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500 dark:text-slate-400">Radius</span>
                  <span className="text-slate-900 dark:text-slate-100">{ctx.population_radius_meters}m</span>
                </div>
                {ctx.population_source && (
                  <div className="flex justify-between">
                    <span className="text-slate-500 dark:text-slate-400">Source</span>
                    <span className="text-slate-900 dark:text-slate-100">{ctx.population_source}</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Context Data: Infrastructure */}
          {ctx && ctx.infrastructure_available && ctx.nearby_infrastructure.length > 0 && (
            <div className="card p-5">
              <h3 className="text-sm font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-3">
                <Building2 className="h-4 w-4 inline mr-1" />
                Nearby Infrastructure
              </h3>
              <div className="space-y-2">
                {ctx.nearby_infrastructure.map((inf, i) => (
                  <div key={i} className="flex justify-between text-sm">
                    <span className="text-slate-700 dark:text-slate-300">
                      {inf.name || inf.type}
                    </span>
                    <span className="text-slate-500 dark:text-slate-400">
                      {inf.distance_meters < 1000
                        ? `${Math.round(inf.distance_meters)}m`
                        : `${(inf.distance_meters / 1000).toFixed(1)}km`}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Context Data: Weather */}
          {ctx && ctx.weather_available && (
            <div className="card p-5">
              <h3 className="text-sm font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-3">
                <CloudRain className="h-4 w-4 inline mr-1" />
                Weather Context
              </h3>
              <div className="space-y-2 text-sm">
                {ctx.weather_condition && (
                  <div className="flex justify-between">
                    <span className="text-slate-500 dark:text-slate-400">Condition</span>
                    <span className="text-slate-900 dark:text-slate-100">{ctx.weather_condition}</span>
                  </div>
                )}
                {ctx.temperature_celsius !== null && (
                  <div className="flex justify-between">
                    <span className="text-slate-500 dark:text-slate-400">Temperature</span>
                    <span className="text-slate-900 dark:text-slate-100">{ctx.temperature_celsius}°C</span>
                  </div>
                )}
                {ctx.precipitation_mm !== null && (
                  <div className="flex justify-between">
                    <span className="text-slate-500 dark:text-slate-400">Precipitation</span>
                    <span className="text-slate-900 dark:text-slate-100">{ctx.precipitation_mm}mm</span>
                  </div>
                )}
                {ctx.wind_speed_kmh !== null && (
                  <div className="flex justify-between">
                    <span className="text-slate-500 dark:text-slate-400">Wind</span>
                    <span className="text-slate-900 dark:text-slate-100">{ctx.wind_speed_kmh} km/h</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Assignments */}
          {report.assignments.length > 0 && (
            <div className="card p-5">
              <h3 className="text-sm font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-3">
                <UserCheck className="h-4 w-4 inline mr-1" />
                Assignments
              </h3>
              <div className="space-y-3">
                {report.assignments.map((a) => (
                  <div key={a.id} className="bg-slate-50 dark:bg-slate-800/50 rounded-lg p-3 text-sm">
                    <p className="font-medium text-slate-900 dark:text-slate-100">{a.assigned_to}</p>
                    <p className="text-slate-500 dark:text-slate-400">{a.department}</p>
                    <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">{formatDateTime(a.assigned_at)}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Status Update Modal */}
      <Modal
        isOpen={showStatusModal}
        onClose={() => setShowStatusModal(false)}
        title="Update Report Status"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">New Status</label>
            <select
              value={newStatus}
              onChange={(e) => setNewStatus(e.target.value)}
              className="block w-full px-3 py-2 text-sm border border-slate-300 dark:border-slate-700 rounded-lg shadow-sm dark:shadow-none bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 focus:border-indigo-500 disabled:opacity-50"
            >
              <option value="">Select status...</option>
              {REPORT_STATUSES.map((s) => (
                <option key={s} value={s}>{s.replace(/_/g, ' ')}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Note (optional)</label>
            <textarea
              value={statusNote}
              onChange={(e) => setStatusNote(e.target.value)}
              rows={3}
              className="block w-full px-3 py-2 text-sm border border-slate-300 dark:border-slate-700 rounded-lg shadow-sm dark:shadow-none placeholder:text-slate-400 dark:placeholder:text-slate-500 bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 focus:border-indigo-500 disabled:opacity-50 resize-none"
              placeholder="Add a note about this status change..."
            />
          </div>
          <div className="flex justify-end gap-3">
            <button onClick={() => setShowStatusModal(false)} className="btn-secondary">Cancel</button>
            <button
              onClick={handleStatusUpdate}
              disabled={!newStatus || updatingStatus}
              className="btn-primary"
            >
              {updatingStatus ? <Loader2 className="h-4 w-4 mr-1 animate-spin" /> : <Send className="h-4 w-4 mr-1" />}
              Update Status
            </button>
          </div>
        </div>
      </Modal>

      {/* Assign Modal */}
      <Modal
        isOpen={showAssignModal}
        onClose={() => setShowAssignModal(false)}
        title="Assign Report"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Department</label>
            <input
              value={assignDept}
              onChange={(e) => setAssignDept(e.target.value)}
              className="block w-full px-3 py-2 text-sm border border-slate-300 dark:border-slate-700 rounded-lg shadow-sm dark:shadow-none placeholder:text-slate-400 dark:placeholder:text-slate-500 bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 focus:border-indigo-500 disabled:opacity-50"
              placeholder="e.g., Public Works Department"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Assign To</label>
            <input
              value={assignTo}
              onChange={(e) => setAssignTo(e.target.value)}
              className="block w-full px-3 py-2 text-sm border border-slate-300 dark:border-slate-700 rounded-lg shadow-sm dark:shadow-none placeholder:text-slate-400 dark:placeholder:text-slate-500 bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 focus:border-indigo-500 disabled:opacity-50"
              placeholder="e.g., Engineer Ramesh"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Note (optional)</label>
            <textarea
              value={assignNote}
              onChange={(e) => setAssignNote(e.target.value)}
              rows={2}
              className="block w-full px-3 py-2 text-sm border border-slate-300 dark:border-slate-700 rounded-lg shadow-sm dark:shadow-none placeholder:text-slate-400 dark:placeholder:text-slate-500 bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 focus:border-indigo-500 disabled:opacity-50 resize-none"
              placeholder="Assignment notes..."
            />
          </div>
          <div className="flex justify-end gap-3">
            <button onClick={() => setShowAssignModal(false)} className="btn-secondary">Cancel</button>
            <button
              onClick={handleAssign}
              disabled={!assignDept || !assignTo || assigning}
              className="btn-primary"
            >
              {assigning ? <Loader2 className="h-4 w-4 mr-1 animate-spin" /> : <UserCheck className="h-4 w-4 mr-1" />}
              Assign
            </button>
          </div>
        </div>
      </Modal>

      {/* Image Modal */}
      <Modal
        isOpen={!!selectedImage}
        onClose={() => setSelectedImage(null)}
        size="xl"
      >
        {selectedImage && (
          <img src={selectedImage} alt="Evidence" className="w-full rounded-lg" />
        )}
      </Modal>
    </div>
  );
}
