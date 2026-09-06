import PublicPageLayout from '@/components/ui/PublicPageLayout';

export default function Page() {
  return (
    <PublicPageLayout title="Policymaker Guide">
      
            <p className="text-lg text-slate-600 mb-6">
              NASMR provides municipal and regional decision makers with actionable, aggregated data for infrastructure planning.
            </p>
            <h2 className="text-2xl font-bold text-slate-900 mt-8 mb-4">Data-Informed Decisions</h2>
            <ul className="list-disc pl-6 space-y-3 text-slate-600">
              <li><strong>Identify Recurring Issues:</strong> Spot systemic infrastructure failures before they become critical.</li>
              <li><strong>Understand Priority Areas:</strong> Ensure resources are allocated equitably across districts based on objective severity metrics.</li>
              <li><strong>Identify Development Hotspots:</strong> Use the geographic analytics dashboard to find clusters of rapid deterioration or high demand.</li>
              <li><strong>Monitor Resolution Progress:</strong> Track departmental efficiency and average resolution times.</li>
            </ul>
        
    </PublicPageLayout>
  );
}
