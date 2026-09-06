import PublicPageLayout from '@/components/ui/PublicPageLayout';

export default function Page() {
  return (
    <PublicPageLayout title="Frequently Asked Questions">
      
            <div className="space-y-6">
              <div>
                <h3 className="text-xl font-semibold text-slate-900 mb-2">What is NASMR?</h3>
                <p className="text-slate-600">NASMR is a civic intelligence platform that uses AI to process and prioritize citizen reports for municipal authorities.</p>
              </div>
              <div>
                <h3 className="text-xl font-semibold text-slate-900 mb-2">How do I report a civic issue?</h3>
                <p className="text-slate-600">Click &quot;Report an Issue&quot; in the navigation bar. You can describe the problem via text or voice in your preferred language.</p>
              </div>
              <div>
                <h3 className="text-xl font-semibold text-slate-900 mb-2">Can I track my report?</h3>
                <p className="text-slate-600">Yes. Upon submission, you will receive a tracking code. Use the &quot;Track Request&quot; page to check its status.</p>
              </div>
              <div>
                <h3 className="text-xl font-semibold text-slate-900 mb-2">Does AI make the final decision?</h3>
                <p className="text-slate-600">No. AI is used solely for initial triage, translation, and recommendation. Human authorities review and make all final decisions.</p>
              </div>
            </div>
        
    </PublicPageLayout>
  );
}
