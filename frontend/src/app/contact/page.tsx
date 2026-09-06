import PublicPageLayout from '@/components/ui/PublicPageLayout';

export default function Page() {
  return (
    <PublicPageLayout title="Contact Us">
      
            <p className="text-lg text-slate-600 mb-8">
              For administrative inquiries, technical support, or partnership opportunities.
            </p>
            <div className="bg-white border border-slate-200 shadow-sm rounded-xl p-8 max-w-lg">
              <div className="mb-6">
                <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-2">Email</h3>
                <p className="text-lg text-slate-900 font-medium">[Official NASMR contact email]</p>
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-2">Phone</h3>
                <p className="text-lg text-slate-900 font-medium">[Official NASMR contact number]</p>
              </div>
              <div className="mt-8 pt-8 border-t border-slate-100">
                <p className="text-sm text-slate-500">
                  Note: Do not use this contact information to report civic issues. Please use the <a href="/report" className="text-indigo-600 hover:underline">Report an Issue</a> page.
                </p>
              </div>
            </div>
        
    </PublicPageLayout>
  );
}
