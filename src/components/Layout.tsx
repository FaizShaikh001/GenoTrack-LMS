import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Activity, LayoutDashboard, List, PlusCircle, AlertTriangle } from 'lucide-react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: (string | undefined | null | false)[]) {
  return twMerge(clsx(inputs));
}

export default function Layout({ children }: { children: React.ReactNode }) {
  const location = useLocation();

  const navItems = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { name: 'Samples', path: '/samples', icon: List },
    { name: 'Add Sample', path: '/add-sample', icon: PlusCircle },
    { name: 'Alerts', path: '/alerts', icon: AlertTriangle },
  ];

  return (
    <div className="min-h-screen bg-zinc-50 flex">
      {/* Sidebar */}
      <aside className="w-64 bg-zinc-900 text-zinc-300 flex flex-col">
        <div className="h-16 flex items-center px-6 border-b border-zinc-800">
          <Activity className="w-6 h-6 text-emerald-500 mr-3" />
          <span className="text-lg font-semibold text-white">GenoTrack LIMS</span>
        </div>
        <nav className="flex-1 py-6 px-3 space-y-1">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            const Icon = item.icon;
            return (
              <Link
                key={item.name}
                to={item.path}
                className={cn(
                  'flex items-center px-3 py-2.5 rounded-lg text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-zinc-800 text-white'
                    : 'hover:bg-zinc-800/50 hover:text-white'
                )}
              >
                <Icon className={cn('w-5 h-5 mr-3', isActive ? 'text-emerald-500' : 'text-zinc-400')} />
                {item.name}
              </Link>
            );
          })}
        </nav>
        <div className="p-4 border-t border-zinc-800 text-xs text-zinc-500">
          System Status: <span className="text-emerald-500 font-medium">Online</span>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <header className="h-16 bg-white border-b border-zinc-200 flex items-center justify-between px-8">
          <h1 className="text-xl font-semibold text-zinc-900">
            {navItems.find(i => i.path === location.pathname)?.name || 'LIMS'}
          </h1>
          <div className="flex items-center space-x-4">
            <div className="w-8 h-8 bg-zinc-200 rounded-full flex items-center justify-center text-sm font-medium text-zinc-600">
              JD
            </div>
          </div>
        </header>
        <div className="flex-1 overflow-auto p-8">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </div>
      </main>
    </div>
  );
}
