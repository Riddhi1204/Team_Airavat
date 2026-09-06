import PublicPageLayout from '@/components/ui/PublicPageLayout';

export default function Page() {
  return (
    <PublicPageLayout title="Methodology">
      
            <p className="text-lg text-slate-600 mb-6">
              Our methodology ensures that citizen voices are accurately translated into structured data for municipal decision-makers.
            </p>
            <h2 className="text-2xl font-bold text-slate-900 mt-8 mb-4">Data Collection & Categorization</h2>
            <p className="text-slate-600 mb-4">
              We collect unstructured data (text, voice, images) and use AI to extract structured features. This includes automatically tagging categories such as infrastructure, sanitation, or public safety.
            </p>
            <h2 className="text-2xl font-bold text-slate-900 mt-8 mb-4">Priority Assessment</h2>
            <p className="text-slate-600 mb-4">
              Priority is not determined by who complains the loudest. Our algorithms assess the severity of the issue, potential hazards, and spatial clustering (development hotspots) to recommend a priority score.
            </p>
            <h2 className="text-2xl font-bold text-slate-900 mt-8 mb-4">Human-in-the-Loop</h2>
            <p className="text-slate-600 mb-4">
              AI supports decisions rather than replacing responsible authorities. All AI-generated priorities and categories serve as recommendations. Final operational decisions are made by human administrators and policymakers.
            </p>
        
    </PublicPageLayout>
  );
}
