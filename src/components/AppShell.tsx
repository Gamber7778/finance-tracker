'use client';

import { useAuth } from '@/lib/authContext';
import LoginScreen from './LoginScreen';
import Sidebar from './Sidebar';

export default function AppShell({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="fixed inset-0 bg-zinc-950 flex items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-emerald-500 border-t-transparent" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <LoginScreen />;
  }

  return (
    <div className="fixed inset-0 flex flex-col lg:flex-row">
      <Sidebar />

      {/* Main content area */}
      <main className="flex-1 overflow-y-auto overflow-x-hidden pt-[var(--sat)] pb-[calc(60px+var(--sab))] lg:pb-0 lg:ml-64">
        <div className="p-4 lg:p-8">
          {children}
        </div>
      </main>
    </div>
  );
}
