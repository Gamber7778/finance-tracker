'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard, ArrowLeftRight, Tag, PiggyBank, Target,
  BarChart3, AlertTriangle, LogOut, User, Menu, X,
} from 'lucide-react';
import { useFinance } from '@/lib/context';
import { useAuth } from '@/lib/authContext';
import { cn } from '@/lib/utils';
import { useState, useEffect } from 'react';

const navigation = [
  { name: 'Дашборд', href: '/', icon: LayoutDashboard },
  { name: 'Транзакції', href: '/transactions', icon: ArrowLeftRight },
  { name: 'Категорії', href: '/categories', icon: Tag },
  { name: 'Бюджети', href: '/budgets', icon: PiggyBank },
  { name: 'Цілі', href: '/goals', icon: Target },
  { name: 'Статистика', href: '/statistics', icon: BarChart3 },
];

const bottomNav = [
  { name: 'Головна', href: '/', icon: LayoutDashboard },
  { name: 'Транзакції', href: '/transactions', icon: ArrowLeftRight },
  { name: 'Бюджети', href: '/budgets', icon: PiggyBank },
  { name: 'Статистика', href: '/statistics', icon: BarChart3 },
  { name: 'Більше', href: '#menu', icon: Menu },
];

export default function Sidebar() {
  const pathname = usePathname();
  const { budgetAlerts } = useFinance();
  const { username, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [mobileMenuOpen]);

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex fixed left-0 top-0 z-30 h-screen w-64 flex-col border-r border-zinc-800 bg-zinc-950">
        <div className="flex h-16 items-center gap-3 px-6 border-b border-zinc-800">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-500/10">
            <PiggyBank size={20} className="text-emerald-400" />
          </div>
          <div>
            <h1 className="text-base font-semibold text-white">FinTracker</h1>
            <p className="text-[11px] text-zinc-500">Особисті фінанси</p>
          </div>
        </div>

        <nav className="flex-1 space-y-1 px-3 py-4">
          {navigation.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  'flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-150',
                  isActive
                    ? 'bg-emerald-500/10 text-emerald-400'
                    : 'text-zinc-400 hover:bg-zinc-800/50 hover:text-zinc-200'
                )}
              >
                <item.icon size={18} />
                {item.name}
                {item.name === 'Бюджети' && budgetAlerts.length > 0 && (
                  <span className="ml-auto flex h-5 w-5 items-center justify-center rounded-full bg-red-500/20 text-[10px] text-red-400">
                    {budgetAlerts.length}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        {budgetAlerts.length > 0 && (
          <div className="mx-3 mb-4 rounded-xl border border-red-500/20 bg-red-500/5 p-3">
            <div className="flex items-center gap-2 text-red-400 mb-2">
              <AlertTriangle size={14} />
              <span className="text-xs font-medium">Перевищення бюджету</span>
            </div>
            {budgetAlerts.slice(0, 3).map((alert, i) => (
              <p key={i} className="text-[11px] text-red-300/70 leading-relaxed">
                {alert.categoryName}: €{alert.spent.toFixed(0)} / €{alert.limit.toFixed(0)}
              </p>
            ))}
          </div>
        )}

        <div className="border-t border-zinc-800 px-3 py-3">
          <div className="flex items-center gap-3 rounded-xl px-3 py-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-zinc-800">
              <User size={14} className="text-zinc-400" />
            </div>
            <span className="flex-1 text-sm text-zinc-300 truncate">{username}</span>
            <button
              onClick={logout}
              className="rounded-lg p-1.5 text-zinc-500 hover:text-red-400 hover:bg-red-500/10 transition-colors"
              title="Вийти"
            >
              <LogOut size={14} />
            </button>
          </div>
        </div>
      </aside>

      {/* Mobile Bottom Navigation */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40 border-t border-zinc-800 bg-zinc-950/95 backdrop-blur-lg safe-bottom">
        <div className="flex items-center justify-around px-2 py-1.5">
          {bottomNav.map((item) => {
            const isMenu = item.href === '#menu';
            const isActive = !isMenu && pathname === item.href;

            if (isMenu) {
              return (
                <button
                  key={item.name}
                  onClick={() => setMobileMenuOpen(true)}
                  className="flex flex-col items-center gap-0.5 px-2 py-1.5 text-zinc-500"
                >
                  <item.icon size={20} />
                  <span className="text-[10px]">{item.name}</span>
                </button>
              );
            }

            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  'flex flex-col items-center gap-0.5 px-2 py-1.5 transition-colors relative',
                  isActive ? 'text-emerald-400' : 'text-zinc-500'
                )}
              >
                <item.icon size={20} />
                <span className="text-[10px]">{item.name}</span>
                {item.name === 'Бюджети' && budgetAlerts.length > 0 && (
                  <span className="absolute -top-0.5 right-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[8px] text-white font-bold">
                    {budgetAlerts.length}
                  </span>
                )}
              </Link>
            );
          })}
        </div>
      </nav>

      {/* Mobile Slide-out Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden fixed inset-0 z-50">
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setMobileMenuOpen(false)}
          />
          <div className="absolute right-0 top-0 bottom-0 w-72 bg-zinc-950 border-l border-zinc-800 flex flex-col animate-slide-in">
            <div className="flex items-center justify-between px-5 py-4 border-b border-zinc-800">
              <div className="flex items-center gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-zinc-800">
                  <User size={14} className="text-zinc-400" />
                </div>
                <span className="text-sm text-zinc-300">{username}</span>
              </div>
              <button
                onClick={() => setMobileMenuOpen(false)}
                className="rounded-lg p-1.5 text-zinc-400"
              >
                <X size={20} />
              </button>
            </div>

            <nav className="flex-1 space-y-1 px-3 py-4">
              {navigation.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={cn(
                      'flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-all',
                      isActive
                        ? 'bg-emerald-500/10 text-emerald-400'
                        : 'text-zinc-400 active:bg-zinc-800/50'
                    )}
                  >
                    <item.icon size={18} />
                    {item.name}
                  </Link>
                );
              })}
            </nav>

            <div className="border-t border-zinc-800 px-3 py-3">
              <button
                onClick={() => { logout(); setMobileMenuOpen(false); }}
                className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-red-400 w-full active:bg-red-500/10"
              >
                <LogOut size={18} />
                Вийти
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
