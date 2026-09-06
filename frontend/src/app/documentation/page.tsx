import PublicPageLayout from '@/components/ui/PublicPageLayout';

export default function Page() {
  return (
    <PublicPageLayout title="Documentation">
      
            <h2 className="text-2xl font-bold text-slate-900 mb-4">For Citizens</h2>
            <div className="bg-slate-50 border border-slate-200 rounded-lg p-6 mb-8">
              <h3 className="text-lg font-semibold text-slate-900 mb-2">How to Report an Issue</h3>
              <p className="text-slate-600 mb-2">Navigate to the Report page, allow location access, describe your issue, and optionally upload a photo. You will receive a unique tracking ID.</p>
              <h3 className="text-lg font-semibold text-slate-900 mb-2 mt-4">Tracking Your Issue</h3>
              <p className="text-slate-600">Enter your tracking ID on the Track Request page to see real-time status updates.</p>
            </div>
            
            <h2 className="text-2xl font-bold text-slate-900 mb-4">For Authorities</h2>
            <div className="bg-slate-50 border border-slate-200 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-slate-900 mb-2">Using the Dashboard</h3>
              <p className="text-slate-600 mb-2">Log into the Admin Dashboard to view prioritized queues, geographic hotspots, and analytics.</p>
              <h3 className="text-lg font-semibold text-slate-900 mb-2 mt-4">Prioritization</h3>
              <p className="text-slate-600">Issues are automatically scored (0-10) based on severity. You can manually override these scores based on operational constraints.</p>
            </div>
        
    </PublicPageLayout>
  );
}
