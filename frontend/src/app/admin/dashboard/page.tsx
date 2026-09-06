'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  AlertTriangle,
  Clock,
  CheckCircle2,
  FileText,
  ArrowUpRight,
  TrendingUp,
  Shield,
  Activity,
} from 'lucide-react';
import { getToken } from '@/lib/auth';
import { getDashboardOverview, getDashboardStatistics, getDashboardPriority } from '@/lib/api';
import type { DashboardOverview, DashboardStatistics, PriorityReport } from '@/types';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import ErrorState from '@/components/ui/ErrorState';
import StatusBadge from '@/components/ui/StatusBadge';
import PriorityBadge from '@/components/ui/PriorityBadge';
import { formatDate, timeAgo, truncate, getSeverityColor } from '@/lib/utils';

export default function DashboardPage() {
  const [overview, setOverview] = useState<DashboardOverview | null>(null);
  const [stats, setStats] = useState<DashboardStatistics | null>(null);
  const [priorityReports, setPriorityReports] = useState<PriorityReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function loadData() {
    const token = getToken();
    if (!token) return;
    setLoading(true);
    setError(null);
    try {
      const [ov, st, pr] = await Promise.all([
        getDashboardOverview(token),
        getDashboardStatistics(token),
        getDashboardPriority(token, 10),
      ]);
      setOverview(ov);
      setStats(st);
      setPriorityReports(pr);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to load dashboard');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  if (loading) return <LoadingSpinner size="lg" className="py-20" />;
  if (error) return <ErrorState message={error} onRetry={loadData} />;
  if (!overview) return null;

  const statCards = [
    {
      label: 'Total Reports',
      value: overview.total_reports,
      icon: FileText,
      color: 'bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400',
      iconBg: 'bg-indigo-100 dark:bg-indigo-900/40',
    },
    {
      label: 'Pending',
      value: overview.pending,
      icon: Clock,
      color: 'bg-yellow-50 text-yellow-600',
      iconBg: 'bg-yellow-100',
    },
    {
      label: 'Resolved',
      value: overview.resolved,
      icon: CheckCircle2,
      color: 'bg-green-50 text-green-600',
      iconBg: 'bg-green-100',
    },
    {
      label: 'Critical',
      value: overview.critical,
      icon: AlertTriangle,
      color: 'bg-red-50 text-red-600',
      iconBg: 'bg-red-100',
    },
    {
      label: 'High Priority',
      value: overview.high,
      icon: TrendingUp,
      color: 'bg-orange-50 text-orange-600',
      iconBg: 'bg-orange-100',
    },
    {
      label: 'Avg. Resolution',
      value: overview.average_resolution_time_hours
        ? `${overview.average_resolution_time_hours}h`
        : 'N/A',
      icon: Activity,
      color: 'bg-purple-50 text-purple-600',
      iconBg: 'bg-purple-100',
    },
  ];

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Operations Dashboard</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Real-time civic issue monitoring and management</p>
        </div>
        <Link href="/admin/reports" className="btn-primary text-sm">
          View All Reports <ArrowUpRight className="h-4 w-4 ml-1" />
        </Link>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 mb-8">
        {statCards.map((card) => (
          <div key={card.label} className="card p-4">
            <div className="flex items-center justify-between mb-3">
              <div className={`p-2 rounded-lg ${card.iconBg}`}>
                <card.icon className={`h-4 w-4 ${card.color.split(' ')[1]}`} />
              </div>
            </div>
            <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">{card.value}</p>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{card.label}</p>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Priority Queue */}
        <div className="lg:col-span-2">
          <div className="card">
            <div className="px-5 py-4 border-b flex items-center justify-between">
              <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">Priority Queue</h2>
              <span className="text-xs text-slate-500 dark:text-slate-400">{priorityReports.length} highest priority</span>
            </div>
            <div className="divide-y">
              {priorityReports.length === 0 ? (
                <div className="px-5 py-8 text-center text-sm text-slate-500 dark:text-slate-400">
                  No pending reports
                </div>
              ) : (
                priorityReports.map((r) => (
                  <Link
                    key={r.id}
                    href={`/admin/reports/${r.id}`}
                    className="flex items-center gap-4 px-5 py-3.5 hover:bg-slate-50 dark:bg-slate-800/50 transition-colors"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs font-mono text-slate-400 dark:text-slate-500">{r.public_reference}</span>
                        <StatusBadge status={r.status} />
                        <PriorityBadge level={r.priority_level} />
                      </div>
                      <p className="text-sm font-medium text-slate-900 dark:text-slate-100 truncate">
                        {r.category}: {truncate(r.english_description, 80)}
                      </p>
                      <div className="flex items-center gap-3 mt-1 text-xs text-slate-500 dark:text-slate-400">
                        {r.locality && <span>{r.locality}</span>}
                        <span>{timeAgo(r.created_at)}</span>
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <div className={`text-lg font-bold ${getSeverityColor(r.severity)}`}>
                        {r.priority_score?.toFixed(1) ?? '-'}
                      </div>
                      <div className="text-xs text-slate-400 dark:text-slate-500">score</div>
                    </div>
                  </Link>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Distribution Cards */}
        <div className="space-y-6">
          {/* Status Distribution */}
          {stats && stats.status_distribution.length > 0 && (
            <div className="card">
              <div className="px-5 py-4 border-b">
                <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">Status Distribution</h3>
              </div>
              <div className="px-5 py-3 space-y-2">
                {stats.status_distribution.map((s) => (
                  <div key={s.name} className="flex items-center justify-between text-sm">
                    <span className="text-slate-600 dark:text-slate-400">{s.name.replace(/_/g, ' ')}</span>
                    <span className="font-medium text-slate-900 dark:text-slate-100">{s.count}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Category Distribution */}
          {stats && stats.category_distribution.length > 0 && (
            <div className="card">
              <div className="px-5 py-4 border-b">
                <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">Top Categories</h3>
              </div>
              <div className="px-5 py-3 space-y-2">
                {stats.category_distribution.slice(0, 6).map((c) => (
                  <div key={c.name} className="flex items-center justify-between text-sm">
                    <span className="text-slate-600 dark:text-slate-400">{c.name}</span>
                    <span className="font-medium text-slate-900 dark:text-slate-100">{c.count}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Priority Distribution */}
          {stats && stats.priority_distribution.length > 0 && (
            <div className="card">
              <div className="px-5 py-4 border-b">
                <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">Priority Breakdown</h3>
              </div>
              <div className="px-5 py-3 space-y-2">
                {stats.priority_distribution.map((p) => (
                  <div key={p.name} className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <PriorityBadge level={p.name} />
                    </div>
                    <span className="font-medium text-slate-900 dark:text-slate-100">{p.count}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
