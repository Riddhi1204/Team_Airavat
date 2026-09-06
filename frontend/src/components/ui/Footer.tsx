'use client';

import Link from 'next/link';
import { Network, Globe, Users, Mail } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-slate-950 text-slate-400 py-16 border-t border-slate-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-12 lg:gap-8 mb-16">
          
          {/* Column 1 - Brand / About */}
          <div className="lg:col-span-4 flex flex-col">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-indigo-950/80 rounded-xl flex items-center justify-center border border-indigo-900/50">
                <Network className="h-5 w-5 text-cyan-400" />
              </div>
              <div className="flex flex-col">
                <span className="text-xl font-bold text-white tracking-tight leading-none">NASMR</span>
                <span className="text-[9px] font-semibold text-slate-500 uppercase tracking-[0.2em] mt-1">
                  National AI System for<br />Municipal & Regional Development
                </span>
              </div>
            </div>
            <p className="text-sm font-medium text-slate-300 mb-4 leading-relaxed">
              Turning Citizen Voices into Smarter Development Decisions.
            </p>
            <p className="text-sm text-slate-500 mb-8 leading-relaxed pr-4">
              An AI-powered civic intelligence platform designed to transform citizen feedback into actionable development insights.
            </p>
            <div className="flex items-center gap-4 text-slate-500">
              <div className="p-2 rounded-lg hover:bg-slate-900 hover:text-cyan-400 transition-colors cursor-pointer border border-transparent hover:border-slate-800">
                <Globe className="h-5 w-5" />
              </div>
              <div className="p-2 rounded-lg hover:bg-slate-900 hover:text-cyan-400 transition-colors cursor-pointer border border-transparent hover:border-slate-800">
                <Users className="h-5 w-5" />
              </div>
              <Link href="/contact" className="p-2 rounded-lg hover:bg-slate-900 hover:text-cyan-400 transition-colors cursor-pointer border border-transparent hover:border-slate-800">
                <Mail className="h-5 w-5" />
              </Link>
            </div>
          </div>

          {/* Column 2 - Product */}
          <div className="lg:col-span-2">
            <h3 className="text-xs font-bold text-white uppercase tracking-widest mb-6">Product</h3>
            <ul className="space-y-4 text-sm">
              <li><Link href="/" className="hover:text-cyan-400 transition-colors">Home</Link></li>
              <li><Link href="/report" className="hover:text-cyan-400 transition-colors">Report an Issue</Link></li>
              <li><Link href="/track" className="hover:text-cyan-400 transition-colors">Track Request</Link></li>
              <li><Link href="/admin/login" className="hover:text-cyan-400 transition-colors">Admin Dashboard</Link></li>
            </ul>
          </div>

          {/* Column 3 - Platform */}
          <div className="lg:col-span-2">
            <h3 className="text-xs font-bold text-white uppercase tracking-widest mb-6">Platform</h3>
            <ul className="space-y-4 text-sm">
              <li><Link href="/how-it-works" className="hover:text-cyan-400 transition-colors">How It Works</Link></li>
              <li><Link href="/methodology" className="hover:text-cyan-400 transition-colors">Methodology</Link></li>
              <li><Link href="/responsible-ai" className="hover:text-cyan-400 transition-colors">Responsible AI</Link></li>
              <li><Link href="/about" className="hover:text-cyan-400 transition-colors">About NASMR</Link></li>
            </ul>
          </div>

          {/* Column 4 - Resources */}
          <div className="lg:col-span-2">
            <h3 className="text-xs font-bold text-white uppercase tracking-widest mb-6">Resources</h3>
            <ul className="space-y-4 text-sm">
              <li><Link href="/documentation" className="hover:text-cyan-400 transition-colors">Documentation</Link></li>
              <li><Link href="/policymaker-guide" className="hover:text-cyan-400 transition-colors">Policymaker Guide</Link></li>
              <li><Link href="/faq" className="hover:text-cyan-400 transition-colors">FAQ</Link></li>
              <li><Link href="/contact" className="hover:text-cyan-400 transition-colors">Contact</Link></li>
            </ul>
          </div>

          {/* Column 5 - Legal */}
          <div className="lg:col-span-2">
            <h3 className="text-xs font-bold text-white uppercase tracking-widest mb-6">Legal</h3>
            <ul className="space-y-4 text-sm">
              <li><Link href="/privacy" className="hover:text-cyan-400 transition-colors">Privacy Policy</Link></li>
              <li><Link href="/terms" className="hover:text-cyan-400 transition-colors">Terms of Use</Link></li>
              <li><Link href="/cookies" className="hover:text-cyan-400 transition-colors">Cookie Policy</Link></li>
              <li><Link href="/accessibility" className="hover:text-cyan-400 transition-colors">Accessibility</Link></li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-slate-900 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-sm text-slate-500">
            &copy; {new Date().getFullYear()} NASMR. All rights reserved.
          </p>
          <p className="text-sm text-slate-500 font-medium">
            Built for inclusive, data-driven civic development.
          </p>
        </div>
      </div>
    </footer>
  );
}
