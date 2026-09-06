import React from 'react';
import Link from 'next/link';
import { Network, ArrowLeft } from 'lucide-react';
import Footer from '@/components/ui/Footer';
import ThemeToggle from '@/components/ThemeToggle';

export default function PublicPageLayout({ children, title }: { children: React.ReactNode, title?: string }) {
  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950">
      <header className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 sticky top-0 z-40 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center gap-2 group">
              <div className="w-8 h-8 bg-indigo-950 rounded-lg flex items-center justify-center border border-indigo-900/50 group-hover:bg-indigo-900 transition-colors">
                <Network className="h-4 w-4 text-cyan-400" />
              </div>
              <span className="text-lg font-bold text-slate-900 dark:text-slate-100 tracking-tight leading-none">NASMR</span>
            </Link>
            
            <div className="flex items-center gap-4 text-sm font-medium">
              <Link href="/report" className="text-indigo-600 hover:text-indigo-700 transition-colors hidden sm:block">Report an Issue</Link>
              <Link href="/" className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 transition-colors">
                <ArrowLeft className="h-4 w-4" />
                <span>Back to Home</span>
              </Link>
              <div className="w-px h-5 bg-slate-200 dark:bg-slate-700 mx-1 hidden sm:block"></div>
              <ThemeToggle />
            </div>
          </div>
        </div>
      </header>
      
      <main className="flex-grow">
        {title && (
          <div className="bg-slate-900 text-white py-12 lg:py-16">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
              <h1 className="text-3xl lg:text-4xl font-bold tracking-tight">{title}</h1>
            </div>
          </div>
        )}
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
          <div className="prose prose-slate dark:prose-invert prose-indigo max-w-none">
            {children}
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
}
