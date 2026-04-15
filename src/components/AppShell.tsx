'use client';

import { useAuth } from '@/lib/authContext';
import { useFinance } from '@/lib/context';
import LoginScreen from './LoginScreen';
import Sidebar from './Sidebar';
import { AlertTriangle, RefreshCw } from 'lucide-react';

export default function AppShell({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading: authLoading } = useAuth();

  if (authLoading) {
    return (
      <div className="fixed inset-0 bg-zinc-950 flex items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-emerald-500 border-t-transparent" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <LoginScreen />;
  }

  return <AuthenticatedShell>{children}</AuthenticatedShell>;
}

function AuthenticatedShell({ children }: { children: React.ReactNode }) {
  const { isLoaded, loadError, retryLoad } = useFinance();

  return (
    <div className="fixed inset-0 flex flex-col lg:flex-row">
      <Sidebar />

      <main className="flex-1 overflow-y-auto overflow-x-hidden pt-[var(--sat)] pb-[calc(60px+var(--sab))] lg:pb-0 lg:ml-64">
        {/* Connection error banner */}
        {loadError && (
          <div className="mx-4 mt-4 lg:mx-8 lg:mt-8 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 flex items-center gap-3">
            <AlertTriangle size={18} className="text-red-400 flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-sm text-red-300 font-medium">Помилка підключення</p>
              <p className="text-xs text-red-400/70 mt-0.5">{loadError}</p>
            </div>
            <button
              onClick={retryLoad}
              className="flex items-center gap-1.5 rounded-lg bg-red-500/20 px-3 py-1.5 text-xs text-red-300 hover:bg-red-500/30 active:bg-red-500/40 transition-colors flex-shrink-0"
            >
              <RefreshCw size={12} />
              Повторити
            </button>
          </div>
        )}

        {!isLoaded ? (
          <div className="flex items-center justify-center h-[60vh]">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-emerald-500 border-t-transparent" />
          </div>
        ) : (
          <div className="p-4 lg:p-8">
            {children}
          </div>
        )}
      </main>
    </div>
  );
}
