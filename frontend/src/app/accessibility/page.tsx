import PublicPageLayout from '@/components/ui/PublicPageLayout';

export default function Page() {
  return (
    <PublicPageLayout title="Accessibility Statement">
      
            <p className="text-lg text-slate-600 mb-6">
              NASMR is committed to ensuring digital accessibility for people with disabilities. We are continually improving the user experience for everyone.
            </p>
            <h2 className="text-2xl font-bold text-slate-900 mt-8 mb-4">Conformance</h2>
            <p className="text-slate-600 mb-4">We aim to adhere to modern accessibility guidelines, ensuring appropriate contrast, screen-reader compatibility, and keyboard navigability across the platform.</p>
            <h2 className="text-2xl font-bold text-slate-900 mt-8 mb-4">Feedback</h2>
            <p className="text-slate-600 mb-4">If you encounter accessibility barriers on NASMR, please contact our support team so we can address the issue promptly.</p>
        
    </PublicPageLayout>
  );
}
