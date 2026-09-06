import PublicPageLayout from '@/components/ui/PublicPageLayout';

export default function Page() {
  return (
    <PublicPageLayout title="Terms of Use">
      
            <h2 className="text-2xl font-bold text-slate-900 mb-4">Acceptable Use</h2>
            <p className="text-slate-600 mb-6">NASMR is provided for reporting legitimate civic and municipal issues. Users must not submit false reports, abusive content, or inappropriate media.</p>
            
            <h2 className="text-2xl font-bold text-slate-900 mb-4">Service Limitations</h2>
            <p className="text-slate-600 mb-6">This platform is NOT for emergencies. For life-threatening emergencies or active crimes, contact emergency services directly.</p>
            
            <h2 className="text-2xl font-bold text-slate-900 mb-4">Reporting Responsibilities</h2>
            <p className="text-slate-600 mb-6">By submitting a report, you grant municipal authorities the right to use the provided information and media for resolution and analytical purposes.</p>
        
    </PublicPageLayout>
  );
}
