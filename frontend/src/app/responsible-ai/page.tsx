import PublicPageLayout from '@/components/ui/PublicPageLayout';

export default function Page() {
  return (
    <PublicPageLayout title="Responsible AI">
      
            <p className="text-lg text-slate-600 mb-6">
              NASMR is committed to ethical, transparent, and accountable AI integration in civic infrastructure.
            </p>
            <ul className="space-y-6 mt-6">
              <li>
                <h3 className="text-xl font-semibold text-slate-900 mb-2">Human Oversight</h3>
                <p className="text-slate-600">AI is used for triage and insight generation. Human authorities retain full control over resource allocation and final decisions.</p>
              </li>
              <li>
                <h3 className="text-xl font-semibold text-slate-900 mb-2">Transparency & Fairness</h3>
                <p className="text-slate-600">We continuously audit our models to ensure equitable prioritization across all districts, regardless of demographic factors.</p>
              </li>
              <li>
                <h3 className="text-xl font-semibold text-slate-900 mb-2">Data Minimization & Privacy</h3>
                <p className="text-slate-600">We only collect data strictly necessary for issue resolution. AI models do not train on personally identifiable information.</p>
              </li>
            </ul>
        
    </PublicPageLayout>
  );
}
