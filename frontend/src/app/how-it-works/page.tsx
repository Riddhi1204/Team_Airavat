import PublicPageLayout from '@/components/ui/PublicPageLayout';

export default function Page() {
  return (
    <PublicPageLayout title="How It Works">
      
            <p className="text-lg text-slate-600 mb-8 leading-relaxed">
              NASMR turns citizen feedback into actionable development insights through a transparent, AI-assisted workflow.
            </p>
            <div className="space-y-8">
              <div className="flex gap-4">
                <div className="flex-shrink-0 w-8 h-8 bg-indigo-100 text-indigo-700 rounded-full flex items-center justify-center font-bold">1</div>
                <div>
                  <h3 className="text-xl font-semibold text-slate-900 mb-2">Citizen Submits Issue</h3>
                  <p className="text-slate-600">Citizens report local issues using voice or text in their preferred language. Location context is automatically captured.</p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="flex-shrink-0 w-8 h-8 bg-indigo-100 text-indigo-700 rounded-full flex items-center justify-center font-bold">2</div>
                <div>
                  <h3 className="text-xl font-semibold text-slate-900 mb-2">AI Analyzes & Categorizes</h3>
                  <p className="text-slate-600">Our models translate reports to a common language, extract key details, and automatically categorize the issue.</p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="flex-shrink-0 w-8 h-8 bg-indigo-100 text-indigo-700 rounded-full flex items-center justify-center font-bold">3</div>
                <div>
                  <h3 className="text-xl font-semibold text-slate-900 mb-2">Priority Calculation</h3>
                  <p className="text-slate-600">A priority score is generated based on severity, historical data, and community impact to help authorities focus on what matters most.</p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="flex-shrink-0 w-8 h-8 bg-indigo-100 text-indigo-700 rounded-full flex items-center justify-center font-bold">4</div>
                <div>
                  <h3 className="text-xl font-semibold text-slate-900 mb-2">Authority Resolution</h3>
                  <p className="text-slate-600">Issues are routed to the relevant municipal or regional department. Authorities work on the issue and update its status.</p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="flex-shrink-0 w-8 h-8 bg-indigo-100 text-indigo-700 rounded-full flex items-center justify-center font-bold">5</div>
                <div>
                  <h3 className="text-xl font-semibold text-slate-900 mb-2">Citizen Tracking</h3>
                  <p className="text-slate-600">Citizens can track the progress of their request at any time until it is fully resolved.</p>
                </div>
              </div>
            </div>
        
    </PublicPageLayout>
  );
}
