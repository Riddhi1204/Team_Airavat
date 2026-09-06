import PublicPageLayout from '@/components/ui/PublicPageLayout';

export default function Page() {
  return (
    <PublicPageLayout title="Privacy Policy">
      
            <h2 className="text-2xl font-bold text-slate-900 mb-4">Information Collection</h2>
            <p className="text-slate-600 mb-6">We collect location data, media (photos/audio), and descriptive text provided voluntarily when submitting a report.</p>
            
            <h2 className="text-2xl font-bold text-slate-900 mb-4">How We Use Your Data</h2>
            <p className="text-slate-600 mb-6">Data is used strictly to identify, categorize, and resolve civic issues. We do not sell data to third parties.</p>
            
            <h2 className="text-2xl font-bold text-slate-900 mb-4">Retention & Security</h2>
            <p className="text-slate-600 mb-6">Reports are securely stored and retained only as long as necessary for municipal record-keeping. Media files are scrubbed of excessive metadata.</p>
        
    </PublicPageLayout>
  );
}
