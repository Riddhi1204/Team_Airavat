import PublicPageLayout from '@/components/ui/PublicPageLayout';

export default function Page() {
  return (
    <PublicPageLayout title="About NASMR">
      
            <p className="text-xl font-semibold text-indigo-700 mb-6">
              Turning Citizen Voices into Smarter Development Decisions.
            </p>
            <p className="text-lg text-slate-600 mb-6">
              The National AI System for Municipal & Regional Development (NASMR) bridges the gap between citizens and local authorities. 
            </p>
            <p className="text-lg text-slate-600 mb-6">
              Traditionally, municipal feedback is fragmented, delayed, and difficult to quantify. NASMR connects citizen feedback directly with municipal and regional development planning by leveraging modern AI to process, translate, and prioritize reports in real-time.
            </p>
            <p className="text-lg text-slate-600">
              Our mission is to build inclusive, data-driven civic development that responds to the actual needs of the community.
            </p>
        
    </PublicPageLayout>
  );
}
