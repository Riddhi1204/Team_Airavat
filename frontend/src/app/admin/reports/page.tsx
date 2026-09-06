'use client';

import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import {
  Search,
  Filter,
  X,
  ChevronDown,
  MapPin,
  Eye,
} from 'lucide-react';
import { getToken } from '@/lib/auth';
import { getAdminReports, getCategories } from '@/lib/api';
import type { ReportListItem, Category, ReportFilters } from '@/types';
import { REPORT_STATUSES, PRIORITY_LEVELS } from '@/types';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import ErrorState from '@/components/ui/ErrorState';
import EmptyState from '@/components/ui/EmptyState';
import StatusBadge from '@/components/ui/StatusBadge';
import PriorityBadge from '@/components/ui/PriorityBadge';
import Pagination from '@/components/ui/Pagination';
import { timeAgo, truncate, getSeverityColor } from '@/lib/utils';

export default function AdminReportsPage() {
  const [reports, setReports] = useState<ReportListItem[]>([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [showFilters, setShowFilters] = useState(false);

  // Filters
  const [filters, setFilters] = useState<ReportFilters>({
    page: 1,
    page_size: 20,
  });
  const [searchInput, setSearchInput] = useState('');

  useEffect(() => {
    getCategories().then(setCategories).catch(() => {});
  }, []);

  const loadReports = useCallback(async () => {
    const token = getToken();
    if (!token) return;
    setLoading(true);
    setError(null);
    try {
      const res = await getAdminReports(token, filters);
      setReports(res.items);
      setTotal(res.total);
      setTotalPages(res.total_pages);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to load reports');
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    loadReports();
  }, [loadReports]);

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    setFilters((f) => ({ ...f, search: searchInput || undefined, page: 1 }));
  }

  function updateFilter(key: keyof ReportFilters, value: string | number | undefined) {
    setFilters((f) => ({ ...f, [key]: value || undefined, page: 1 }));
  }

  function clearFilters() {
    setFilters({ page: 1, page_size: 20 });
    setSearchInput('');
  }

  const activeFilterCount = Object.entries(filters).filter(
    ([k, v]) => !['page', 'page_size'].includes(k) && v !== undefined
  ).length;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Reports</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">{total} total reports</p>
        </div>
      </div>

      {/* Search and Filter Bar */}
      <div className="card mb-6">
        <div className="p-4 flex flex-col sm:flex-row gap-3">
          <form onSubmit={handleSearch} className="flex-1 flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 dark:text-slate-500" />
              <input
                type="text"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                placeholder="Search reports by description or reference..."
                className="block w-full px-3 py-2 text-sm border border-slate-300 dark:border-slate-700 rounded-lg shadow-sm dark:shadow-none placeholder:text-slate-400 dark:placeholder:text-slate-500 bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 focus:border-indigo-500 disabled:opacity-50 pl-10"
              />
            </div>
            <button type="submit" className="btn-primary">Search</button>
          </form>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`btn-secondary relative ${showFilters ? 'bg-indigo-50 dark:bg-indigo-900/30 border-blue-300' : ''}`}
          >
            <Filter className="h-4 w-4 mr-1" />
            Filters
            {activeFilterCount > 0 && (
              <span className="ml-1.5 inline-flex items-center justify-center h-5 w-5 text-xs font-bold bg-blue-600 text-white rounded-full">
                {activeFilterCount}
              </span>
            )}
          </button>
        </div>

        {/* Filter Panel */}
        {showFilters && (
          <div className="px-4 pb-4 border-t pt-4">
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
              <div>
                <label className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-1 block">Status</label>
                <select
                  value={filters.status || ''}
                  onChange={(e) => updateFilter('status', e.target.value)}
                  className="block w-full px-3 py-2 text-sm border border-slate-300 dark:border-slate-700 rounded-lg shadow-sm dark:shadow-none bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 focus:border-indigo-500 disabled:opacity-50 text-sm"
                >
                  <option value="">All Statuses</option>
                  {REPORT_STATUSES.map((s) => (
                    <option key={s} value={s}>{s.replace(/_/g, ' ')}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-1 block">Category</label>
                <select
                  value={filters.category_name || ''}
                  onChange={(e) => updateFilter('category_name', e.target.value)}
                  className="block w-full px-3 py-2 text-sm border border-slate-300 dark:border-slate-700 rounded-lg shadow-sm dark:shadow-none bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 focus:border-indigo-500 disabled:opacity-50 text-sm"
                >
                  <option value="">All Categories</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.name}>{c.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-1 block">Priority</label>
                <select
                  value={filters.priority_level || ''}
                  onChange={(e) => updateFilter('priority_level', e.target.value)}
                  className="block w-full px-3 py-2 text-sm border border-slate-300 dark:border-slate-700 rounded-lg shadow-sm dark:shadow-none bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 focus:border-indigo-500 disabled:opacity-50 text-sm"
                >
                  <option value="">All Priorities</option>
                  {PRIORITY_LEVELS.map((p) => (
                    <option key={p} value={p}>{p}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-1 block">District</label>
                <input
                  type="text"
                  value={filters.district || ''}
                  onChange={(e) => updateFilter('district', e.target.value)}
                  placeholder="Filter by district"
                  className="block w-full px-3 py-2 text-sm border border-slate-300 dark:border-slate-700 rounded-lg shadow-sm dark:shadow-none placeholder:text-slate-400 dark:placeholder:text-slate-500 bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 focus:border-indigo-500 disabled:opacity-50 text-sm"
                />
              </div>

              <div>
                <label className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-1 block">Min Severity</label>
                <select
                  value={filters.min_severity || ''}
                  onChange={(e) => updateFilter('min_severity', e.target.value ? parseInt(e.target.value) : undefined)}
                  className="block w-full px-3 py-2 text-sm border border-slate-300 dark:border-slate-700 rounded-lg shadow-sm dark:shadow-none bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 focus:border-indigo-500 disabled:opacity-50 text-sm"
                >
                  <option value="">Any</option>
                  {[1,2,3,4,5,6,7,8,9,10].map((n) => (
                    <option key={n} value={n}>{n}+</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-1 block">Start Date</label>
                <input
                  type="date"
                  value={filters.start_date || ''}
                  onChange={(e) => updateFilter('start_date', e.target.value)}
                  className="block w-full px-3 py-2 text-sm border border-slate-300 dark:border-slate-700 rounded-lg shadow-sm dark:shadow-none placeholder:text-slate-400 dark:placeholder:text-slate-500 bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 focus:border-indigo-500 disabled:opacity-50 text-sm"
                />
              </div>

              <div>
                <label className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-1 block">End Date</label>
                <input
                  type="date"
                  value={filters.end_date || ''}
                  onChange={(e) => updateFilter('end_date', e.target.value)}
                  className="block w-full px-3 py-2 text-sm border border-slate-300 dark:border-slate-700 rounded-lg shadow-sm dark:shadow-none placeholder:text-slate-400 dark:placeholder:text-slate-500 bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 focus:border-indigo-500 disabled:opacity-50 text-sm"
                />
              </div>

              <div className="flex items-end">
                <button onClick={clearFilters} className="btn-secondary text-sm w-full">
                  <X className="h-3.5 w-3.5 mr-1" /> Clear All
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Reports Table */}
      {loading ? (
        <LoadingSpinner size="lg" className="py-20" />
      ) : error ? (
        <ErrorState message={error} onRetry={loadReports} />
      ) : reports.length === 0 ? (
        <EmptyState
          title="No reports found"
          message={activeFilterCount > 0 ? 'Try adjusting your filters.' : 'No reports have been submitted yet.'}
          action={
            activeFilterCount > 0 ? (
              <button onClick={clearFilters} className="btn-secondary text-sm">Clear Filters</button>
            ) : undefined
          }
        />
      ) : (
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-800/50 border-b">
                  <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Report</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Category</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Status</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Priority</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Location</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Submitted</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                {reports.map((r) => (
                  <tr key={r.id} className="hover:bg-slate-50 dark:bg-slate-800/50 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex flex-col">
                        <span className="text-xs font-mono text-slate-400 dark:text-slate-500">{r.public_reference}</span>
                        <span className="text-sm text-slate-900 dark:text-slate-100 truncate max-w-[250px]">
                          {truncate(r.english_description, 60)}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-sm text-slate-700 dark:text-slate-300">{r.category}</span>
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge status={r.status} />
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <PriorityBadge level={r.priority_level} />
                        {r.priority_score !== null && (
                          <span className={`text-xs font-medium ${getSeverityColor(r.severity)}`}>
                            {r.priority_score.toFixed(1)}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1 text-sm text-slate-600 dark:text-slate-400">
                        <MapPin className="h-3.5 w-3.5" />
                        {r.locality || r.district || 'Unknown'}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-sm text-slate-500 dark:text-slate-400">{timeAgo(r.created_at)}</span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <Link
                        href={`/admin/reports/${r.id}`}
                        className="inline-flex items-center gap-1 text-sm text-indigo-600 dark:text-indigo-400 hover:text-blue-800 font-medium"
                      >
                        <Eye className="h-3.5 w-3.5" />
                        View
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="px-4 py-3 border-t bg-slate-50 dark:bg-slate-800/50">
            <Pagination
              page={filters.page || 1}
              totalPages={totalPages}
              onPageChange={(p) => setFilters((f) => ({ ...f, page: p }))}
            />
          </div>
        </div>
      )}
    </div>
  );
}
