'use client';

import React, { useState, useEffect } from 'react';
import { getPublicDashboardOverview } from '@/lib/api';
import type { DashboardOverview } from '@/types';

export default function SystemMetrics() {
  const [stats, setStats] = useState<DashboardOverview | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadStats() {
      try {
        const data = await getPublicDashboardOverview();
        setStats(data);
      } catch (err) {
        console.error("Failed to load public dashboard stats", err);
        setError("Failed to load stats");
      } finally {
        setLoading(false);
      }
    }
    loadStats();
  }, []);

  const totalReports = stats?.total_reports ?? 0;
  const highPriority = stats ? (stats.critical + stats.high) : 0;
  const resolved = stats?.resolved ?? 0;
  const resolutionSpeed = stats?.average_resolution_time_hours != null 
    ? `${stats.average_resolution_time_hours}h` 
    : '—';

  return (
    <section className="bg-white dark:bg-slate-900 border-b border-gray-100 dark:border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 lg:py-12">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-8 text-sm text-slate-500 dark:text-slate-400 dark:text-slate-400">
          <span className="font-semibold text-slate-900 dark:text-white tracking-widest text-xs uppercase">CURRENT SYSTEM STATUS</span>
          <span className="text-[10px] sm:text-xs font-mono bg-indigo-50/80 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-400 px-2.5 py-1.5 rounded flex items-center gap-2 border border-indigo-100/50 dark:border-indigo-800/50">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500"></span>
            </span>
            LIVE SYSTEM DATA
          </span>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 lg:gap-12">
          
          <div className="flex flex-col border-l-[3px] border-indigo-200 dark:border-indigo-700 pl-5 py-1">
            <span className="text-4xl lg:text-5xl font-light text-slate-900 dark:text-white tracking-tight">
              {loading ? <span className="animate-pulse bg-slate-200 dark:bg-slate-800 h-10 w-20 block rounded"></span> : totalReports}
            </span>
            <span className="text-xs font-bold text-slate-700 dark:text-slate-300 mt-3 uppercase tracking-wider">Total Reports</span>
            <span className="text-xs text-slate-500 dark:text-slate-400 mt-1">All civic reports</span>
          </div>

          <div className="flex flex-col border-l-[3px] border-orange-200 dark:border-orange-700 pl-5 py-1">
            <span className="text-4xl lg:text-5xl font-light text-slate-900 dark:text-white tracking-tight">
              {loading ? <span className="animate-pulse bg-slate-200 dark:bg-slate-800 h-10 w-20 block rounded"></span> : highPriority}
            </span>
            <span className="text-xs font-bold text-slate-700 dark:text-slate-300 mt-3 uppercase tracking-wider">High Priority</span>
            <span className="text-xs text-slate-500 dark:text-slate-400 mt-1">Reports requiring attention</span>
          </div>

          <div className="flex flex-col border-l-[3px] border-emerald-200 dark:border-emerald-700 pl-5 py-1">
            <span className="text-4xl lg:text-5xl font-light text-slate-900 dark:text-white tracking-tight">
              {loading ? <span className="animate-pulse bg-slate-200 dark:bg-slate-800 h-10 w-20 block rounded"></span> : resolved}
            </span>
            <span className="text-xs font-bold text-slate-700 dark:text-slate-300 mt-3 uppercase tracking-wider">Resolved</span>
            <span className="text-xs text-slate-500 dark:text-slate-400 mt-1">Successfully resolved</span>
          </div>

          <div className="flex flex-col border-l-[3px] border-cyan-200 dark:border-cyan-700 pl-5 py-1">
            <span className="text-4xl lg:text-5xl font-light text-slate-900 dark:text-white tracking-tight">
              {loading ? <span className="animate-pulse bg-slate-200 dark:bg-slate-800 h-10 w-20 block rounded"></span> : resolutionSpeed}
            </span>
            <span className="text-xs font-bold text-slate-700 dark:text-slate-300 mt-3 uppercase tracking-wider">Avg. Resolution</span>
            <span className="text-xs text-slate-500 dark:text-slate-400 mt-1">Average time to resolve</span>
          </div>

        </div>
      </div>
    </section>
  );
}
