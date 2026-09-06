import PublicPageLayout from '@/components/ui/PublicPageLayout';

export default function Page() {
  return (
    <PublicPageLayout title="Cookie Policy">
      
            <p className="text-lg text-slate-600 mb-6">
              NASMR uses minimal cookies and local storage to ensure platform functionality.
            </p>
            <h2 className="text-2xl font-bold text-slate-900 mt-8 mb-4">Essential Cookies</h2>
            <p className="text-slate-600 mb-4">We use strictly necessary cookies to maintain secure sessions for administrative logins and protect against cross-site request forgery.</p>
            
            <h2 className="text-2xl font-bold text-slate-900 mt-8 mb-4">Local Storage</h2>
            <p className="text-slate-600 mb-4">We may temporarily store your recent report tracking IDs in your browser&apos;s local storage so you can easily check their status upon returning to the site.</p>
        
    </PublicPageLayout>
  );
}
