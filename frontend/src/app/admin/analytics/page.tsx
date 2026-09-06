'use client';

import { useEffect, useState } from 'react';
import {
  BarChart3,
  PieChart,
  TrendingUp,
  MapPin,
  Calendar,
} from 'lucide-react';
import { getToken } from '@/lib/auth';
import { getDashboardOverview, getDashboardStatistics } from '@/lib/api';
import type { DashboardOverview, DashboardStatistics } from '@/types';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import ErrorState from '@/components/ui/ErrorState';
import PriorityBadge from '@/components/ui/PriorityBadge';

export default function AnalyticsPage() {
  const [overview, setOverview] = useState<DashboardOverview | null>(null);
  const [stats, setStats] = useState<DashboardStatistics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dateRange, setDateRange] = useState<{ start?: string; end?: string }>({});

  async function loadData() {
    const token = getToken();
    if (!token) return;
    setLoading(true);
    setError(null);
    try {
      const [ov, st] = await Promise.all([
        getDashboardOverview(token),
        getDashboardStatistics(token, dateRange.start, dateRange.end),
      ]);
      setOverview(ov);
      setStats(st);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to load analytics');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dateRange]);

  if (loading) return <LoadingSpinner size="lg" className="py-20" />;
  if (error) return <ErrorState message={error} onRetry={loadData} />;
  if (!overview || !stats) return null;

  const maxCatCount = Math.max(...stats.category_distribution.map((c) => c.count), 1);
  const maxTimelineCount = Math.max(...stats.reports_over_time.map((r) => r.count), 1);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Analytics</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Statistical overview and trend analysis</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-slate-400 dark:text-slate-500" />
            <input
              type="date"
              value={dateRange.start || ''}
              onChange={(e) => setDateRange((r) => ({ ...r, start: e.target.value }))}
              className="block w-full px-3 py-2 text-sm border border-slate-300 dark:border-slate-700 rounded-lg shadow-sm dark:shadow-none placeholder:text-slate-400 dark:placeholder:text-slate-500 bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 focus:border-indigo-500 disabled:opacity-50 text-sm w-36"
            />
            <span className="text-slate-400 dark:text-slate-500">to</span>
            <input
              type="date"
              value={dateRange.end || ''}
              onChange={(e) => setDateRange((r) => ({ ...r, end: e.target.value }))}
              className="block w-full px-3 py-2 text-sm border border-slate-300 dark:border-slate-700 rounded-lg shadow-sm dark:shadow-none placeholder:text-slate-400 dark:placeholder:text-slate-500 bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 focus:border-indigo-500 disabled:opacity-50 text-sm w-36"
            />
          </div>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="card p-4">
          <p className="text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wider">Total Reports</p>
          <p className="text-3xl font-bold text-slate-900 dark:text-slate-100 mt-1">{overview.total_reports}</p>
        </div>
        <div className="card p-4">
          <p className="text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wider">Pending</p>
          <p className="text-3xl font-bold text-yellow-600 mt-1">{overview.pending}</p>
        </div>
        <div className="card p-4">
          <p className="text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wider">Resolved</p>
          <p className="text-3xl font-bold text-green-600 mt-1">{overview.resolved}</p>
        </div>
        <div className="card p-4">
          <p className="text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wider">Avg. Resolution</p>
          <p className="text-3xl font-bold text-purple-600 mt-1">
            {overview.average_resolution_time_hours ? `${overview.average_resolution_time_hours}h` : 'N/A'}
          </p>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Reports Over Time */}
        {stats.reports_over_time.length > 0 && (
          <div className="card p-5">
            <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100 mb-4 flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
              Reports Over Time
            </h3>
            <div className="space-y-1">
              {stats.reports_over_time.slice(-14).map((r) => (
                <div key={r.date} className="flex items-center gap-3">
                  <span className="text-xs text-slate-500 dark:text-slate-400 w-20 shrink-0">{r.date.slice(5)}</span>
                  <div className="flex-1 bg-slate-100 dark:bg-slate-800 rounded-full h-4">
                    <div
                      className="bg-indigo-50 dark:bg-indigo-900/300 h-4 rounded-full transition-all"
                      style={{ width: `${(r.count / maxTimelineCount) * 100}%` }}
                    />
                  </div>
                  <span className="text-xs font-medium text-slate-700 dark:text-slate-300 w-8 text-right">{r.count}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Category Distribution */}
        {stats.category_distribution.length > 0 && (
          <div className="card p-5">
            <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100 mb-4 flex items-center gap-2">
              <PieChart className="h-4 w-4 text-purple-600" />
              Category Distribution
            </h3>
            <div className="space-y-2">
              {stats.category_distribution.map((c) => (
                <div key={c.name} className="flex items-center gap-3">
                  <span className="text-sm text-slate-700 dark:text-slate-300 w-40 shrink-0 truncate">{c.name}</span>
                  <div className="flex-1 bg-slate-100 dark:bg-slate-800 rounded-full h-4">
                    <div
                      className="bg-purple-500 h-4 rounded-full transition-all"
                      style={{ width: `${(c.count / maxCatCount) * 100}%` }}
                    />
                  </div>
                  <span className="text-xs font-medium text-slate-700 dark:text-slate-300 w-8 text-right">{c.count}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Status Distribution */}
        {stats.status_distribution.length > 0 && (
          <div className="card p-5">
            <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100 mb-4 flex items-center gap-2">
              <BarChart3 className="h-4 w-4 text-green-600" />
              Status Distribution
            </h3>
            <div className="space-y-3">
              {stats.status_distribution.map((s) => {
                const pct = overview.total_reports > 0 ? ((s.count / overview.total_reports) * 100).toFixed(1) : '0';
                return (
                  <div key={s.name} className="flex items-center justify-between">
                    <span className="text-sm text-slate-700 dark:text-slate-300">{s.name.replace(/_/g, ' ')}</span>
                    <div className="flex items-center gap-3">
                      <span className="text-xs text-slate-400 dark:text-slate-500">{pct}%</span>
                      <span className="text-sm font-medium text-slate-900 dark:text-slate-100 w-10 text-right">{s.count}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Priority Distribution */}
        {stats.priority_distribution.length > 0 && (
          <div className="card p-5">
            <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100 mb-4 flex items-center gap-2">
              <BarChart3 className="h-4 w-4 text-orange-600" />
              Priority Distribution
            </h3>
            <div className="space-y-3">
              {stats.priority_distribution.map((p) => (
                <div key={p.name} className="flex items-center justify-between">
                  <PriorityBadge level={p.name} />
                  <span className="text-sm font-medium text-slate-900 dark:text-slate-100">{p.count}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* District Distribution */}
        {stats.district_distribution.length > 0 && (
          <div className="card p-5 lg:col-span-2">
            <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100 mb-4 flex items-center gap-2">
              <MapPin className="h-4 w-4 text-red-600" />
              Top Districts
            </h3>
            <div className="grid sm:grid-cols-2 gap-3">
              {stats.district_distribution.map((d) => (
                <div key={d.name} className="flex items-center justify-between bg-slate-50 dark:bg-slate-800/50 rounded-lg px-4 py-3">
                  <span className="text-sm text-slate-700 dark:text-slate-300">{d.name}</span>
                  <span className="text-sm font-bold text-slate-900 dark:text-slate-100">{d.count}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
