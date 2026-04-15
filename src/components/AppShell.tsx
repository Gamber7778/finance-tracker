'use client';

import { useAuth } from '@/lib/authContext';
import LoginScreen from './LoginScreen';
import Sidebar from './Sidebar';

export default function AppShell({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-emerald-500 border-t-transparent" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <LoginScreen />;
  }

  return (
    <>
      <Sidebar />
      <main className="lg:ml-64 min-h-screen p-4 pb-24 lg:p-8 lg:pb-8">
        {children}
      </main>
    </>
  );
}
