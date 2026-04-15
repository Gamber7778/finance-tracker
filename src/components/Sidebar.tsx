'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard, ArrowLeftRight, Tag, PiggyBank, Target,
  BarChart3, AlertTriangle, LogOut, User,
} from 'lucide-react';
import { useFinance } from '@/lib/context';
import { useAuth } from '@/lib/authContext';
import { cn } from '@/lib/utils';

const navigation = [
  { name: 'Дашборд', href: '/', icon: LayoutDashboard },
  { name: 'Транзакції', href: '/transactions', icon: ArrowLeftRight },
  { name: 'Категорії', href: '/categories', icon: Tag },
  { name: 'Бюджети', href: '/budgets', icon: PiggyBank },
  { name: 'Цілі', href: '/goals', icon: Target },
  { name: 'Статистика', href: '/statistics', icon: BarChart3 },
];

export default function Sidebar() {
  const pathname = usePathname();
  const { budgetAlerts } = useFinance();
  const { username, logout } = useAuth();

  return (
    <aside className="fixed left-0 top-0 z-30 flex h-screen w-64 flex-col border-r border-zinc-800 bg-zinc-950">
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

      {/* User section */}
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
  );
}
