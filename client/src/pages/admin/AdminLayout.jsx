import { Link, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { cn } from '@/lib/utils';
import {
  LayoutDashboard, Users, FileText, Settings, PenSquare, ArrowLeft
} from 'lucide-react';

const navItems = [
  { label: 'Dashboard', path: '/admin', icon: LayoutDashboard },
  { label: 'Blogs', path: '/admin/blogs', icon: FileText },
  { label: 'Users', path: '/admin/users', icon: Users },
];

export function AdminLayout() {
  const location = useLocation();
  const { user } = useAuth();

  if (!user || user.role !== 'admin') {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <h2 className="text-xl font-bold text-text-primary mb-2">Access Denied</h2>
          <p className="text-text-secondary mb-4">You need admin privileges to access this page.</p>
          <Link to="/" className="text-accent hover:underline">Go back home</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-[calc(100vh-120px)]">
      <aside className="w-64 flex-shrink-0 pr-6">
        <nav className="sticky space-y-1">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={cn(
                  'flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-primary/10 text-text-primary'
                    : 'text-text-secondary hover:bg-gray-100'
                )}
              >
                <item.icon className="w-5 h-5" />
                {item.label}
              </Link>
            );
          })}
        </nav>
      </aside>

      <main className="flex-1">
        <Outlet />
      </main>
    </div>
  );
}