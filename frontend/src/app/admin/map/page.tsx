'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import { Filter, X, MapPin, Eye, RefreshCw } from 'lucide-react';
import { getMapReports, getCategories } from '@/lib/api';
import type { MapMarker, MapFilters, Category } from '@/types';
import { REPORT_STATUSES, PRIORITY_LEVELS } from '@/types';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import StatusBadge from '@/components/ui/StatusBadge';
import PriorityBadge from '@/components/ui/PriorityBadge';
import { timeAgo, truncate } from '@/lib/utils';

// Dynamic import to avoid SSR issues with Leaflet
const ReportMap = dynamic(() => import('@/components/map/ReportMap'), {
  ssr: false,
  loading: () => <div className="w-full h-full bg-slate-100 dark:bg-slate-800 animate-pulse flex items-center justify-center"><LoadingSpinner /></div>,
});

export default function AdminMapPage() {
  const [markers, setMarkers] = useState<MapMarker[]>([]);
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedMarker, setSelectedMarker] = useState<MapMarker | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<MapFilters>({});
  const boundsRef = useRef<{ min_lat: number; max_lat: number; min_lng: number; max_lng: number } | null>(null);

  useEffect(() => {
    getCategories().then(setCategories).catch(() => {});
  }, []);

  const loadMarkers = useCallback(async () => {
    setLoading(true);
    try {
      const allFilters: MapFilters = {
        ...filters,
        ...(boundsRef.current || {}),
        limit: 1000,
      };
      const data = await getMapReports(allFilters);
      setMarkers(data);
    } catch {
      // Failed to load markers
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    loadMarkers();
  }, [loadMarkers]);

  function handleBoundsChange(bounds: { min_lat: number; max_lat: number; min_lng: number; max_lng: number }) {
    boundsRef.current = bounds;
    // Debounce - load on significant changes
    loadMarkers();
  }

  function updateFilter(key: keyof MapFilters, value: string | number | undefined) {
    setFilters((f) => ({ ...f, [key]: value || undefined }));
  }

  function clearFilters() {
    setFilters({});
  }

  return (
    <div className="h-[calc(100vh-120px)] flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Map View</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">{markers.length} reports on map</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={loadMarkers} className="btn-secondary text-sm">
            <RefreshCw className="h-4 w-4 mr-1" /> Refresh
          </button>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`btn-secondary text-sm ${showFilters ? 'bg-indigo-50 dark:bg-indigo-900/30 border-blue-300' : ''}`}
          >
            <Filter className="h-4 w-4 mr-1" /> Filters
          </button>
        </div>
      </div>

      {/* Filters */}
      {showFilters && (
        <div className="card p-4 mb-4">
          <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-3">
            <div>
              <label className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-1 block">Status</label>
              <select
                value={filters.status || ''}
                onChange={(e) => updateFilter('status', e.target.value)}
                className="block w-full px-3 py-2 text-sm border border-slate-300 dark:border-slate-700 rounded-lg shadow-sm dark:shadow-none bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 focus:border-indigo-500 disabled:opacity-50 text-sm"
              >
                <option value="">All</option>
                {REPORT_STATUSES.map((s) => (
                  <option key={s} value={s}>{s.replace(/_/g, ' ')}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-1 block">Category</label>
              <select
                value={filters.category || ''}
                onChange={(e) => updateFilter('category', e.target.value)}
                className="block w-full px-3 py-2 text-sm border border-slate-300 dark:border-slate-700 rounded-lg shadow-sm dark:shadow-none bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 focus:border-indigo-500 disabled:opacity-50 text-sm"
              >
                <option value="">All</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.name}>{c.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-1 block">Priority</label>
              <select
                value={filters.priority || ''}
                onChange={(e) => updateFilter('priority', e.target.value)}
                className="block w-full px-3 py-2 text-sm border border-slate-300 dark:border-slate-700 rounded-lg shadow-sm dark:shadow-none bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 focus:border-indigo-500 disabled:opacity-50 text-sm"
              >
                <option value="">All</option>
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
                className="block w-full px-3 py-2 text-sm border border-slate-300 dark:border-slate-700 rounded-lg shadow-sm dark:shadow-none placeholder:text-slate-400 dark:placeholder:text-slate-500 bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 focus:border-indigo-500 disabled:opacity-50 text-sm"
                placeholder="Filter district"
              />
            </div>
            <div className="flex items-end">
              <button onClick={clearFilters} className="btn-secondary text-sm w-full">
                <X className="h-3.5 w-3.5 mr-1" /> Clear
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Map + Selected Report */}
      <div className="flex-1 flex gap-4 min-h-0">
        <div className="flex-1 card overflow-hidden">
          <ReportMap
            markers={markers}
            onMarkerClick={setSelectedMarker}
            selectedId={selectedMarker?.id}
          />
        </div>

        {/* Selected Report Panel */}
        {selectedMarker && (
          <div className="w-80 card p-5 overflow-y-auto shrink-0 hidden lg:block">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-slate-900 dark:text-slate-100">{selectedMarker.public_reference}</h3>
              <button
                onClick={() => setSelectedMarker(null)}
                className="p-1 hover:bg-slate-100 dark:bg-slate-800 rounded"
              >
                <X className="h-4 w-4 text-slate-400 dark:text-slate-500" />
              </button>
            </div>
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <StatusBadge status={selectedMarker.status} />
                <PriorityBadge level={selectedMarker.priority_level} />
              </div>
              <div className="text-sm">
                <p className="text-slate-500 dark:text-slate-400">Category</p>
                <p className="font-medium text-slate-900 dark:text-slate-100">{selectedMarker.category}</p>
              </div>
              <div className="text-sm">
                <p className="text-slate-500 dark:text-slate-400">Severity</p>
                <p className="font-medium text-slate-900 dark:text-slate-100">{selectedMarker.severity}/10</p>
              </div>
              {selectedMarker.priority_score !== null && (
                <div className="text-sm">
                  <p className="text-slate-500 dark:text-slate-400">Priority Score</p>
                  <p className="font-medium text-slate-900 dark:text-slate-100">{selectedMarker.priority_score.toFixed(1)}</p>
                </div>
              )}
              <div className="text-sm">
                <p className="text-slate-500 dark:text-slate-400">Coordinates</p>
                <p className="font-mono text-xs text-slate-700 dark:text-slate-300">
                  {selectedMarker.latitude.toFixed(6)}, {selectedMarker.longitude.toFixed(6)}
                </p>
              </div>
              <div className="text-sm">
                <p className="text-slate-500 dark:text-slate-400">Submitted</p>
                <p className="text-slate-700 dark:text-slate-300">{timeAgo(selectedMarker.created_at)}</p>
              </div>
              <Link
                href={`/admin/reports/${selectedMarker.id}`}
                className="btn-primary w-full text-sm mt-4"
              >
                <Eye className="h-4 w-4 mr-1" /> View Full Report
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
