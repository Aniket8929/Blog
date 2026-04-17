import { Navbar } from './Navbar';
import { Outlet } from 'react-router-dom';

export function MainLayout() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        <Outlet />
      </main>

      <footer className="border-t border-border bg-card py-8 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
                <span className="font-bold text-text-primary text-sm">BF</span>
              </div>
              <span className="font-bold text-text-primary">BlogFlow</span>
            </div>
            <p className="text-sm text-text-muted">
              Built with modern web technologies. A SaaS-level blog platform.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

export function AdminLayout() {
  return <Outlet />;
}