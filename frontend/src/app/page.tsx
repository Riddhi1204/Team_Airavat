"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import SystemMetrics from '@/components/ui/SystemMetrics';
import ThemeToggle from '@/components/ThemeToggle';
import Footer from '@/components/ui/Footer';


import {
  Shield,
  MapPin,
  FileText,
  BarChart3,
  ArrowRight,
  Megaphone,
  CheckCircle2,
  Clock,
  Users,
  Menu,
  X,
  Globe,
  Activity,
  Cpu,
  Network
} from 'lucide-react';

export default function HomePage() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="min-h-screen">
      {/* Navigation */}
      <nav 
        className={`fixed top-0 w-full z-50 transition-all duration-300 ${
          isScrolled 
            ? 'bg-white dark:bg-slate-900/95 backdrop-blur-md shadow-sm border-b border-slate-200 dark:border-slate-800 py-3' 
            : 'bg-white dark:bg-slate-900/80 backdrop-blur-sm border-b border-slate-100 dark:border-slate-800 py-4 lg:py-5'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            
            {/* 1. Left Brand Zone */}
            <div className="flex-shrink-0 flex items-center gap-3 lg:w-1/4">
              <div className="w-10 h-10 bg-indigo-950 rounded-xl flex items-center justify-center shadow-inner border border-indigo-900/50">
                <Network className="h-5 w-5 text-cyan-400" />
              </div>
              <div className="flex flex-col">
                <span className="text-xl font-bold text-slate-900 dark:text-slate-100 tracking-tight leading-none">NASMR</span>
                <span className="text-[9px] sm:text-[10px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-[0.2em] hidden sm:block mt-1">
                  National AI System<br className="hidden lg:block xl:hidden" /> for Municipal & Regional Development
                </span>
              </div>
            </div>

            {/* 2. Center Navigation Zone */}
            <div className="hidden lg:flex flex-1 justify-center">
              <div className="flex items-center gap-2">
                <Link href="/" className="relative px-3 py-2 text-sm font-medium text-indigo-700 transition-colors">
                  Home
                  <span className="absolute bottom-0 left-3 right-3 h-[2px] bg-indigo-600 rounded-t-full"></span>
                </Link>
                <Link href="/report" className="px-4 py-1.5 text-sm font-semibold text-indigo-700 bg-indigo-50/80 rounded-full hover:bg-indigo-100 transition-all border border-indigo-100/50 shadow-sm">
                  Report an Issue
                </Link>
                <Link href="/track" className="px-3 py-2 text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:text-slate-100 transition-colors rounded-md hover:bg-slate-50 dark:bg-slate-950">
                  Track Request
                </Link>
                <span className="px-3 py-2 text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:text-slate-100 transition-colors rounded-md hover:bg-slate-50 dark:bg-slate-950 cursor-pointer">
                  Recommendations
                </span>
                <span className="px-3 py-2 text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:text-slate-100 transition-colors rounded-md hover:bg-slate-50 dark:bg-slate-950 cursor-pointer">
                  Methodology
                </span>
              </div>
            </div>
            
            {/* 3. Right Utility Zone */}
            <div className="hidden lg:flex items-center justify-end gap-5 flex-shrink-0 lg:w-1/4">
              <button className="group flex items-center gap-1.5 text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:text-slate-100 transition-colors px-2 py-1.5 rounded-md hover:bg-slate-50 dark:bg-slate-950">
                <Globe className="h-4 w-4 text-slate-400 group-hover:text-slate-500 dark:text-slate-400 transition-colors" />
                <span>English</span>
                <svg className="w-3.5 h-3.5 text-slate-400 group-hover:text-slate-600 dark:text-slate-300 transition-colors mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              
              <ThemeToggle />
              
              <div className="w-px h-5 bg-slate-200 dark:bg-slate-700"></div>
              
              <Link
                href="/admin/login"
                className="text-sm font-medium text-slate-500 dark:text-slate-400 hover:text-indigo-600 transition-colors"
              >
                Admin Login
              </Link>
            </div>

            {/* Mobile menu button */}
            <div className="flex lg:hidden items-center gap-3">
              <button className="flex items-center gap-1 text-sm font-medium text-slate-600 dark:text-slate-300 px-2 py-1 rounded hover:bg-slate-50 dark:bg-slate-950">
                <Globe className="h-4 w-4" />
                <span className="text-xs">EN ▾</span>
              </button>
              <ThemeToggle />
              <button 
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:text-slate-100 p-1.5 rounded-md hover:bg-slate-50 dark:bg-slate-950 transition-colors"
              >
                {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile menu panel */}
        {mobileMenuOpen && (
          <div className="lg:hidden absolute top-full left-0 w-full bg-white dark:bg-slate-900/95 backdrop-blur-xl border-b border-slate-200 dark:border-slate-800 shadow-2xl py-4 px-4 flex flex-col gap-1.5">
            <Link href="/" className="px-4 py-3 text-base font-semibold text-indigo-700 bg-indigo-50/50 rounded-xl">Home</Link>
            <Link href="/report" className="px-4 py-3 text-base font-medium text-slate-700 hover:bg-slate-50 dark:bg-slate-950 rounded-xl">Report an Issue</Link>
            <Link href="/track" className="px-4 py-3 text-base font-medium text-slate-700 hover:bg-slate-50 dark:bg-slate-950 rounded-xl">Track Request</Link>
            <span className="px-4 py-3 text-base font-medium text-slate-700 hover:bg-slate-50 dark:bg-slate-950 rounded-xl cursor-pointer">Recommendations</span>
            <span className="px-4 py-3 text-base font-medium text-slate-700 hover:bg-slate-50 dark:bg-slate-950 rounded-xl cursor-pointer">Methodology</span>
            
            <div className="h-px w-full bg-slate-100 my-3"></div>
            
            <button className="flex items-center justify-between px-4 py-3 text-base font-medium text-slate-700 hover:bg-slate-50 dark:bg-slate-950 rounded-xl">
              <div className="flex items-center gap-2">
                <Globe className="h-5 w-5 text-slate-400" />
                Language
              </div>
              <span className="text-sm text-slate-500 dark:text-slate-400 font-normal bg-slate-100 px-2 py-0.5 rounded-md">English ▾</span>
            </button>
            <Link href="/admin/login" className="px-4 py-3 text-base font-medium text-slate-500 dark:text-slate-400 hover:text-indigo-600 hover:bg-slate-50 dark:bg-slate-950 rounded-xl mt-1">Admin Login</Link>
          </div>
        )}
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-16 lg:pt-40 lg:pb-24 bg-gradient-to-br from-indigo-950 via-slate-900 to-indigo-900 text-white overflow-hidden relative">
        <div className="absolute inset-0 opacity-10 pointer-events-none" style={{backgroundImage: "url('data:image/svg+xml,%3Csvg width=\'40\' height=\'40\' viewBox=\'0 0 40 40\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cpath d=\'M0 0h40v40H0V0zm20 20h20v20H20V20zM0 20h20v20H0V20z\' fill=\'%23ffffff\' fill-opacity=\'0.4\' fill-rule=\'evenodd\'/%3E%3C/svg%3E')"}}></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-8 items-center">
            {/* Left side text */}
            <div className="max-w-2xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 border border-indigo-400/30 text-cyan-300 text-xs font-semibold uppercase tracking-wider mb-6">
                <Activity className="h-3.5 w-3.5" />
                <span>Active Intelligence Grid</span>
              </div>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold leading-tight mb-6 tracking-tight text-white">
                Turning <span className="text-cyan-400 border-b-2 border-cyan-400/30">Citizen Voices</span> into Smarter <span className="text-indigo-400">Development</span> <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-cyan-300">Decisions.</span>
              </h1>
              <p className="text-lg sm:text-xl text-slate-300 mb-8 leading-relaxed max-w-xl font-light">
                NASMR uses multilingual AI and civic intelligence to transform citizen feedback into actionable insights for better infrastructure and development planning.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 mb-8">
                <Link
                  href="/report"
                  className="inline-flex items-center justify-center px-8 py-4 text-base font-bold text-indigo-950 bg-cyan-400 rounded-lg hover:bg-cyan-300 transition-all shadow-lg shadow-cyan-400/20 hover:shadow-cyan-400/40 hover:-translate-y-0.5"
                >
                  <Megaphone className="h-5 w-5 mr-2" />
                  Report an Issue <ArrowRight className="h-5 w-5 ml-2" />
                </Link>
              </div>
              <div className="flex items-center gap-3 text-sm text-slate-400 font-medium">
                <div className="h-px w-8 bg-slate-600"></div>
                From individual feedback to collective development intelligence.
              </div>
            </div>

            {/* Right side visualization */}
            <div className="relative h-[400px] lg:h-[500px] w-full rounded-2xl border border-indigo-500/20 bg-slate-900/50 backdrop-blur-sm p-6 overflow-hidden flex flex-col shadow-2xl">
              {/* Map grid background */}
              <div className="absolute inset-0 opacity-20 pointer-events-none" 
                   style={{backgroundImage: 'linear-gradient(rgba(99,102,241,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(99,102,241,0.5) 1px, transparent 1px)', backgroundSize: '40px 40px'}}>
              </div>
              
              <div className="relative z-10 flex items-center justify-between border-b border-indigo-500/30 pb-4 mb-6">
                <div className="text-sm font-semibold tracking-wider text-slate-300 flex items-center gap-2">
                  <Network className="h-4 w-4 text-cyan-400" />
                  CIVIC INTELLIGENCE
                </div>
                <div className="flex items-center gap-2 text-xs font-mono text-cyan-400 bg-cyan-400/10 px-2 py-1 rounded">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-500"></span>
                  </span>
                  ACTIVE PIPELINE
                </div>
              </div>

              <div className="relative flex-1 flex flex-col justify-center gap-6">
                {/* Node graph visualization (css based) */}
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-60">
                  <svg className="w-full h-full text-indigo-500/40" viewBox="0 0 400 200">
                    <path d="M 50 100 Q 150 50 200 100 T 350 100" fill="none" stroke="currentColor" strokeWidth="2" strokeDasharray="5,5" className="animate-[dash_20s_linear_infinite]" />
                    <path d="M 100 150 Q 200 180 250 100" fill="none" stroke="currentColor" strokeWidth="1" />
                    <circle cx="50" cy="100" r="4" fill="#22d3ee" />
                    <circle cx="100" cy="150" r="4" fill="#22d3ee" />
                    <circle cx="200" cy="100" r="6" fill="#818cf8" className="animate-pulse" />
                    <circle cx="250" cy="100" r="4" fill="#22d3ee" />
                    <circle cx="350" cy="100" r="8" fill="#38bdf8" />
                  </svg>
                </div>

                <div className="grid grid-cols-3 gap-2 sm:gap-4 w-full max-w-md mx-auto relative z-10">
                  <div className="bg-slate-800/80 border border-slate-700 p-3 rounded-lg flex flex-col items-center text-center shadow-lg transform hover:-translate-y-1 transition-transform">
                    <Users className="h-5 w-5 text-cyan-400 mb-2" />
                    <span className="text-[9px] sm:text-[10px] text-slate-400 uppercase font-semibold">Citizen Signals</span>
                    <span className="text-sm sm:text-lg font-bold text-white mt-1">12,842</span>
                  </div>
                  <div className="bg-indigo-900/80 border border-indigo-700 p-3 rounded-lg flex flex-col items-center text-center shadow-lg transform hover:-translate-y-1 transition-transform relative">
                    <Cpu className="h-5 w-5 text-indigo-400 mb-2" />
                    <span className="text-[9px] sm:text-[10px] text-indigo-300 uppercase font-semibold">AI Processing</span>
                    <div className="w-full h-1 bg-indigo-950 rounded-full mt-2 overflow-hidden">
                      <div className="h-full bg-indigo-500 w-2/3 animate-pulse"></div>
                    </div>
                  </div>
                  <div className="bg-slate-800/80 border border-slate-700 p-3 rounded-lg flex flex-col items-center text-center shadow-lg transform hover:-translate-y-1 transition-transform">
                    <Activity className="h-5 w-5 text-blue-400 mb-2" />
                    <span className="text-[9px] sm:text-[10px] text-slate-400 uppercase font-semibold">Priority Signals</span>
                    <span className="text-sm sm:text-lg font-bold text-white mt-1">8.4K</span>
                  </div>
                </div>

                <div className="bg-slate-800/90 border border-slate-700 p-4 rounded-xl max-w-xs mx-auto w-full relative z-10 mt-4 shadow-xl hidden sm:block">
                  <div className="flex justify-between items-center mb-3">
                    <span className="text-xs text-slate-400 font-medium">Demand Clusters</span>
                    <span className="text-sm font-bold text-cyan-400">146 Detected</span>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-red-400"></div>
                      <div className="flex-1 h-2 bg-slate-700 rounded-full overflow-hidden"><div className="h-full bg-red-400 w-3/4"></div></div>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-orange-400"></div>
                      <div className="flex-1 h-2 bg-slate-700 rounded-full overflow-hidden"><div className="h-full bg-orange-400 w-1/2"></div></div>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-blue-400"></div>
                      <div className="flex-1 h-2 bg-slate-700 rounded-full overflow-hidden"><div className="h-full bg-blue-400 w-1/3"></div></div>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="relative z-10 mt-auto pt-4 border-t border-indigo-500/30 text-center text-[10px] sm:text-xs text-slate-400 font-mono">
                Citizen Voices → AI Processing → Development Priorities
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Hero Statistics */}
      <SystemMetrics />

      {/* How It Works */}
      <section className="py-16 lg:py-24 bg-white dark:bg-slate-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-4">How It Works</h2>
            <p className="text-slate-600 dark:text-slate-300 max-w-2xl mx-auto">
              Reporting a civic issue takes less than 2 minutes. Your report is automatically
              analyzed, prioritized, and forwarded to the responsible authority.
            </p>
          </div>
          <div className="grid md:grid-cols-4 gap-8">
            {[
              {
                icon: <FileText className="h-8 w-8" />,
                title: 'Describe',
                desc: 'Write or speak your issue description. Multi-language support with automatic translation.',
              },
              {
                icon: <MapPin className="h-8 w-8" />,
                title: 'Locate',
                desc: 'Share your GPS location. We automatically identify your area and nearby infrastructure.',
              },
              {
                icon: <BarChart3 className="h-8 w-8" />,
                title: 'Analyze',
                desc: 'AI analyzes severity. Priority is calculated based on population, infrastructure, and context.',
              },
              {
                icon: <CheckCircle2 className="h-8 w-8" />,
                title: 'Resolve',
                desc: 'Authorities review, assign, and resolve. Track your report status in real time.',
              },
            ].map((step, i) => (
              <div key={i} className="text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 border border-transparent dark:border-indigo-800/50 mb-4">
                  {step.icon}
                </div>
                <div className="text-sm font-semibold text-indigo-600 dark:text-indigo-400 mb-1">Step {i + 1}</div>
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">{step.title}</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-slate-50 dark:bg-slate-900/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid sm:grid-cols-3 gap-8 text-center">
            <div>
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-blue-100 text-indigo-600 dark:text-indigo-400 mb-3">
                <Clock className="h-6 w-6" />
              </div>
              <div className="text-3xl font-bold text-slate-900 dark:text-white">24/7</div>
              <div className="text-sm text-slate-500 dark:text-slate-400 mt-1">Reporting Available</div>
            </div>
            <div>
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-green-100 dark:bg-emerald-900/30 text-green-600 dark:text-emerald-400 border border-transparent dark:border-emerald-800/50 mb-3">
                <BarChart3 className="h-6 w-6" />
              </div>
              <div className="text-3xl font-bold text-slate-900 dark:text-white">AI-Powered</div>
              <div className="text-sm text-slate-500 dark:text-slate-400 mt-1">Smart Priority Scoring</div>
            </div>
            <div>
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 border border-transparent dark:border-purple-800/50 mb-3">
                <Users className="h-6 w-6" />
              </div>
              <div className="text-3xl font-bold text-slate-900 dark:text-white">Community</div>
              <div className="text-sm text-slate-500 dark:text-slate-400 mt-1">Citizen-Driven Platform</div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-white dark:bg-slate-900">
        <div className="max-w-3xl mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-4">See a Problem? Report It.</h2>
          <p className="text-slate-600 dark:text-slate-300 mb-8">
            Every report matters. Help make your neighborhood safer and better maintained.
          </p>
          <Link href="/report" className="inline-flex items-center justify-center font-medium rounded-lg text-base px-8 py-3 bg-indigo-600 hover:bg-indigo-700 text-white dark:bg-indigo-500 dark:hover:bg-indigo-400 dark:shadow-[0_0_15px_rgba(99,102,241,0.4)] transition-all">
            Submit a Report <ArrowRight className="h-5 w-5 ml-2 inline" />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <Footer />
    </div>
  );
}
