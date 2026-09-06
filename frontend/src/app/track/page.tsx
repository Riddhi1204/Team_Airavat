'use client';

import { useState } from 'react';
import Link from 'next/link';
import ThemeToggle from '@/components/ThemeToggle';
import { Search, ArrowLeft, MapPin, Clock, Tag, Network, CheckCircle2, ChevronRight, Activity, AlertCircle } from 'lucide-react';
import { getPublicReport } from '@/lib/api';
import type { ReportPublic } from '@/types';
import { formatDateTime, getStatusColor, mediaUrl } from '@/lib/utils';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import Footer from '@/components/ui/Footer';
import StatusBadge from '@/components/ui/StatusBadge';

export default function TrackReportPage() {
  const [query, setQuery] = useState('');
  const [report, setReport] = useState<ReportPublic | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searched, setSearched] = useState(false);

  async function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    if (!query.trim()) return;
    setLoading(true);
    setError(null);
    setReport(null);
    setSearched(true);
    try {
      const result = await getPublicReport(query.trim());
      setReport(result);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Report not found';
      setError(msg);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col">
      {/* Navigation Header */}
      <header className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 sticky top-0 z-40 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center gap-3 group">
              <div className="w-10 h-10 bg-indigo-950 rounded-xl flex items-center justify-center border border-indigo-900/50 group-hover:bg-indigo-900 transition-colors">
                <Network className="h-5 w-5 text-cyan-400" />
              </div>
              <div className="flex flex-col">
                <span className="text-xl font-bold text-slate-900 dark:text-slate-100 tracking-tight leading-none">NASMR</span>
                <span className="text-[10px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-[0.2em] hidden sm:block mt-1">
                  National AI System for Municipal & Regional Development
                </span>
              </div>
            </Link>
            
            <div className="flex items-center gap-4 text-sm font-medium">
              <Link href="/report" className="text-indigo-600 hover:text-indigo-700 transition-colors hidden sm:block font-bold">Report an Issue</Link>
              <div className="w-px h-5 bg-slate-200 dark:bg-slate-700 mx-1 hidden sm:block"></div>
              <ThemeToggle />
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-grow max-w-5xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-10 lg:py-16">
        <Link href="/" className="inline-flex items-center text-sm font-semibold text-slate-500 dark:text-slate-400 hover:text-indigo-600 mb-8 transition-colors">
          <ArrowLeft className="h-4 w-4 mr-1.5" /> Back to Home
        </Link>

        <div className="mb-10">
          <h1 className="text-3xl lg:text-4xl font-bold text-slate-900 dark:text-slate-100 tracking-tight mb-3">Track Your Report</h1>
          <p className="text-lg text-slate-600 dark:text-slate-300 max-w-2xl">
            Enter your report ID or public reference to check its current status and progress within the NASMR network.
          </p>
        </div>

        {/* Search Card */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 p-6 sm:p-10 mb-12">
          <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100 mb-2">Check Report Status</h2>
          <p className="text-slate-500 dark:text-slate-400 mb-6">Use your unique public reference number (e.g. CP-ABC12345) to see the latest progress.</p>
          
          <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-slate-400" />
              </div>
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Enter Report ID or Reference (e.g. CP-ABC12345)"
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl pl-11 pr-4 py-4 text-slate-900 dark:text-slate-100 text-lg focus:ring-indigo-500 focus:border-indigo-500 transition-colors font-mono tracking-wide"
                required
              />
            </div>
            <button 
              type="submit" 
              disabled={loading} 
              className="bg-indigo-600 text-white font-bold text-lg px-8 py-4 rounded-xl hover:bg-indigo-700 transition-colors shadow-md flex items-center justify-center disabled:opacity-70 disabled:cursor-not-allowed whitespace-nowrap"
            >
              {loading ? 'Searching...' : 'Search'}
            </button>
          </form>
        </div>

        {loading && (
          <div className="flex justify-center py-12">
            <LoadingSpinner size="lg" />
          </div>
        )}

        {error && searched && (
          <div className="bg-red-50 border border-red-200 rounded-2xl p-8 text-center max-w-2xl mx-auto mb-12">
            <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <p className="text-xl font-bold text-red-700 mb-2">Report Not Found</p>
            <p className="text-red-600">Please check your ID or reference number and try again.</p>
          </div>
        )}

        {report && (
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden mb-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Report Header */}
            <div className="bg-slate-900 p-6 sm:p-8 flex flex-col md:flex-row md:items-start justify-between gap-4">
              <div>
                <span className="inline-block px-3 py-1 bg-slate-800 text-slate-300 text-xs font-bold uppercase tracking-widest rounded-md mb-3 border border-slate-700">
                  {report.public_reference}
                </span>
                <h2 className="text-2xl font-bold text-white">{report.category}</h2>
                <div className="flex items-center gap-4 mt-3 text-slate-400 text-sm">
                  <span className="flex items-center gap-1.5"><Clock className="w-4 h-4" /> {formatDateTime(report.created_at)}</span>
                </div>
              </div>
              <div className="flex-shrink-0">
                <StatusBadge status={report.status} />
              </div>
            </div>

            {/* Timeline */}
            <div className="px-6 sm:px-8 py-8 border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/50">
              <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-6">Resolution Progress</p>
              
              {(() => {
                const s = (report.status || '').toUpperCase();
                
                // Terminal alternative states
                if (s === 'REJECTED') {
                  return (
                    <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800/50 rounded-xl p-5 flex items-center gap-4">
                      <div className="w-10 h-10 bg-red-100 dark:bg-red-900/50 text-red-600 dark:text-red-400 flex items-center justify-center rounded-full flex-shrink-0">
                        <AlertCircle className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="text-red-800 dark:text-red-300 font-bold">Report Rejected</p>
                        <p className="text-red-600 dark:text-red-400 text-sm mt-1">This report was reviewed but could not be processed further.</p>
                      </div>
                    </div>
                  );
                }
                
                if (s === 'DUPLICATE') {
                  return (
                    <div className="bg-slate-100 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl p-5 flex items-center gap-4">
                      <div className="w-10 h-10 bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300 flex items-center justify-center rounded-full flex-shrink-0">
                        <Activity className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="text-slate-800 dark:text-slate-200 font-bold">Duplicate Report</p>
                        <p className="text-slate-600 dark:text-slate-400 text-sm mt-1">This issue has already been reported and is being tracked in another ticket.</p>
                      </div>
                    </div>
                  );
                }

                // Normal progression
                const isResolved = s === 'RESOLVED' || s === 'CLOSED';
                const isInProgress = s === 'IN_PROGRESS' || isResolved;
                const isAssigned = s === 'ASSIGNED' || isInProgress;
                const isSubmitted = true; // Always submitted if it exists
                
                let progressWidth = '25%';
                if (isResolved) progressWidth = '100%';
                else if (isInProgress) progressWidth = '75%';
                else if (isAssigned) progressWidth = '50%';

                return (
                  <div className="relative">
                    <div className="overflow-hidden h-2 mb-4 text-xs flex rounded-full bg-slate-200 dark:bg-slate-800">
                      <div 
                        style={{ width: progressWidth }} 
                        className={`shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center transition-all duration-1000 ${
                          isResolved ? 'bg-emerald-500' : 'bg-indigo-500'
                        }`}
                      ></div>
                    </div>
                    <div className="flex justify-between text-xs font-medium text-slate-500 dark:text-slate-400">
                      <span className="text-indigo-700 dark:text-indigo-400 font-bold">Submitted</span>
                      <span className={isAssigned ? 'text-indigo-700 dark:text-indigo-400 font-bold' : ''}>Assigned</span>
                      <span className={isInProgress ? 'text-indigo-700 dark:text-indigo-400 font-bold' : ''}>In Progress</span>
                      <span className={isResolved ? 'text-emerald-600 dark:text-emerald-400 font-bold' : ''}>Resolved</span>
                    </div>
                  </div>
                );
              })()}
            </div>

            {/* Details */}
            <div className="p-6 sm:p-8">
              <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-4">Issue Description</p>
              <p className="text-slate-800 text-lg leading-relaxed mb-8 bg-slate-50 dark:bg-slate-950 p-5 rounded-xl border border-slate-100">
                {report.english_description}
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {report.address && (
                  <div>
                    <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-2">Location</p>
                    <div className="flex items-start gap-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4">
                      <div className="bg-indigo-100 p-2 rounded-lg text-indigo-600">
                        <MapPin className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="font-medium text-slate-900 dark:text-slate-100">{report.address}</p>
                        {report.locality && <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 uppercase tracking-wide">{report.locality}</p>}
                      </div>
                    </div>
                  </div>
                )}
                
                <div>
                  <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-2">Issue Details</p>
                  <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 space-y-3">
                    <div className="flex items-center gap-3">
                      <Tag className="h-5 w-5 text-slate-400" />
                      <span className="text-sm font-medium text-slate-700">Category: <span className="text-slate-900 dark:text-slate-100 font-bold">{report.category}</span></span>
                    </div>
                    {/* Add more fields here if report object has them, e.g., assigned_to */}
                  </div>
                </div>
              </div>
            </div>

            {/* Media */}
            {report.media && report.media.length > 0 && (
              <div className="p-6 sm:p-8 border-t border-slate-100 bg-slate-50 dark:bg-slate-950">
                <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-4">Attached Visual Evidence</p>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                  {report.media.map((m) => (
                    <div key={m.id} className="relative aspect-video rounded-xl overflow-hidden border border-slate-200 dark:border-slate-800 shadow-sm">
                      <img
                        src={mediaUrl(m.file_path)}
                        alt={m.original_filename}
                        className="object-cover h-full w-full hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Info Section (Only show when not searching/loaded or specifically if requested) */}
        {!report && !loading && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-16 border-t border-slate-200 dark:border-slate-800 pt-16">
            <div>
              <div className="w-10 h-10 bg-indigo-100 text-indigo-600 rounded-xl flex items-center justify-center mb-4">
                <Activity className="h-5 w-5" />
              </div>
              <h3 className="font-bold text-slate-900 dark:text-slate-100 mb-2">1. Report Status</h3>
              <p className="text-sm text-slate-600 dark:text-slate-300">See whether your report is prioritized, assigned, in progress, or resolved.</p>
            </div>
            <div>
              <div className="w-10 h-10 bg-indigo-100 text-indigo-600 rounded-xl flex items-center justify-center mb-4">
                <ChevronRight className="h-5 w-5" />
              </div>
              <h3 className="font-bold text-slate-900 dark:text-slate-100 mb-2">2. Current Progress</h3>
              <p className="text-sm text-slate-600 dark:text-slate-300">Understand exactly what stage your infrastructure report is currently in.</p>
            </div>
            <div>
              <div className="w-10 h-10 bg-indigo-100 text-indigo-600 rounded-xl flex items-center justify-center mb-4">
                <MapPin className="h-5 w-5" />
              </div>
              <h3 className="font-bold text-slate-900 dark:text-slate-100 mb-2">3. Responsible Authority</h3>
              <p className="text-sm text-slate-600 dark:text-slate-300">See which authority or municipal department is handling the issue when available.</p>
            </div>
            <div>
              <div className="w-10 h-10 bg-indigo-100 text-indigo-600 rounded-xl flex items-center justify-center mb-4">
                <CheckCircle2 className="h-5 w-5" />
              </div>
              <h3 className="font-bold text-slate-900 dark:text-slate-100 mb-2">4. Resolution Updates</h3>
              <p className="text-sm text-slate-600 dark:text-slate-300">Follow updates as the civic issue moves toward full resolution.</p>
            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
