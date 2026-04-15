'use client';

import { useState, useMemo } from 'react';
import {
  TrendingUp, TrendingDown, Wallet, Plus, ArrowUpRight,
  ArrowDownRight, ChevronRight,
} from 'lucide-react';
import Link from 'next/link';
import {
  PieChart, Pie, Cell, ResponsiveContainer, Tooltip,
} from 'recharts';
import { useFinance } from '@/lib/context';
import { formatCurrency, formatDateShort, getCurrentMonth, getMonthName, cn } from '@/lib/utils';
import AddTransactionModal from '@/components/AddTransactionModal';
import DynamicIcon from '@/components/DynamicIcon';

export default function Dashboard() {
  const {
    state, isLoaded, getBalance, getTotalIncome, getTotalExpenses,
    getSpendingByCategory, getBudgetStatus,
  } = useFinance();
  const [showAddModal, setShowAddModal] = useState(false);
  const month = getCurrentMonth();

  const balance = useMemo(() => getBalance(), [getBalance]);
  const income = useMemo(() => getTotalIncome(month), [getTotalIncome, month]);
  const expenses = useMemo(() => getTotalExpenses(month), [getTotalExpenses, month]);
  const spending = useMemo(() => getSpendingByCategory('expense', month), [getSpendingByCategory, month]);

  const recentTransactions = useMemo(() => {
    return state.transactions.slice(0, 5);
  }, [state.transactions]);

  const overBudgets = useMemo(() => {
    return state.budgets
      .map(b => {
        const status = getBudgetStatus(b.id, month);
        const cat = state.categories.find(c => c.id === b.categoryId);
        return { ...status, categoryName: cat?.name || '', budget: b };
      })
      .filter(s => s.isOver);
  }, [state.budgets, state.categories, getBudgetStatus, month]);

  if (!isLoaded) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-emerald-500 border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="space-y-4 lg:space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl lg:text-2xl font-bold text-white">Дашборд</h1>
          <p className="text-sm text-zinc-500 mt-0.5 capitalize">{getMonthName(month)}</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 rounded-xl bg-emerald-500 px-3 py-2 lg:px-4 lg:py-2.5 text-sm font-semibold text-black hover:bg-emerald-400 transition-colors"
        >
          <Plus size={16} />
          <span className="hidden sm:inline">Додати транзакцію</span>
          <span className="sm:hidden">Додати</span>
        </button>
      </div>

      {/* Balance Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 lg:gap-4">
        <div className="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-4 lg:p-5">
          <div className="flex items-center gap-3 mb-2 lg:mb-3">
            <div className="flex h-9 w-9 lg:h-10 lg:w-10 items-center justify-center rounded-xl bg-emerald-500/10">
              <Wallet size={18} className="text-emerald-400" />
            </div>
            <span className="text-sm text-zinc-400">Загальний баланс</span>
          </div>
          <p className={cn(
            'text-2xl lg:text-3xl font-bold',
            balance >= 0 ? 'text-white' : 'text-red-400'
          )}>
            {formatCurrency(balance)}
          </p>
        </div>

        <div className="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-4 lg:p-5">
          <div className="flex items-center gap-3 mb-2 lg:mb-3">
            <div className="flex h-9 w-9 lg:h-10 lg:w-10 items-center justify-center rounded-xl bg-emerald-500/10">
              <TrendingUp size={18} className="text-emerald-400" />
            </div>
            <span className="text-sm text-zinc-400">Доходи за місяць</span>
          </div>
          <p className="text-2xl lg:text-3xl font-bold text-emerald-400">
            +{formatCurrency(income)}
          </p>
        </div>

        <div className="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-4 lg:p-5">
          <div className="flex items-center gap-3 mb-2 lg:mb-3">
            <div className="flex h-9 w-9 lg:h-10 lg:w-10 items-center justify-center rounded-xl bg-red-500/10">
              <TrendingDown size={18} className="text-red-400" />
            </div>
            <span className="text-sm text-zinc-400">Витрати за місяць</span>
          </div>
          <p className="text-2xl lg:text-3xl font-bold text-red-400">
            -{formatCurrency(expenses)}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 lg:gap-4">
        {/* Spending Breakdown */}
        <div className="lg:col-span-1 rounded-2xl border border-zinc-800 bg-zinc-900/50 p-4 lg:p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-semibold text-white">Куди йдуть гроші</h2>
            <Link href="/statistics" className="text-xs text-zinc-500 hover:text-emerald-400 transition-colors flex items-center gap-1">
              Детальніше <ChevronRight size={12} />
            </Link>
          </div>
          {spending.length > 0 ? (
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="w-36 h-36 flex-shrink-0 mx-auto sm:mx-0">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={spending}
                      dataKey="total"
                      nameKey="categoryName"
                      cx="50%"
                      cy="50%"
                      innerRadius={35}
                      outerRadius={65}
                      paddingAngle={2}
                      strokeWidth={0}
                    >
                      {spending.map((entry, i) => (
                        <Cell key={i} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(value) => formatCurrency(Number(value))}
                      contentStyle={{
                        backgroundColor: '#18181b',
                        border: '1px solid #27272a',
                        borderRadius: '12px',
                        fontSize: '12px',
                      }}
                      itemStyle={{ color: '#fafafa' }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="flex-1 space-y-2 overflow-y-auto max-h-36">
                {spending.map((item) => (
                  <div key={item.categoryId} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div
                        className="h-2.5 w-2.5 rounded-full flex-shrink-0"
                        style={{ backgroundColor: item.color }}
                      />
                      <span className="text-xs text-zinc-400">{item.categoryName}</span>
                    </div>
                    <span className="text-xs font-medium text-zinc-300">
                      {formatCurrency(item.total)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-36 text-zinc-600">
              <p className="text-sm">Немає витрат цього місяця</p>
            </div>
          )}
        </div>

        {/* Recent Transactions */}
        <div className="lg:col-span-2 rounded-2xl border border-zinc-800 bg-zinc-900/50 p-4 lg:p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-semibold text-white">Останні транзакції</h2>
            <Link href="/transactions" className="text-xs text-zinc-500 hover:text-emerald-400 transition-colors flex items-center gap-1">
              Усі <ChevronRight size={12} />
            </Link>
          </div>
          {recentTransactions.length > 0 ? (
            <div className="space-y-2">
              {recentTransactions.map((t) => {
                const cat = state.categories.find(c => c.id === t.categoryId);
                return (
                  <div key={t.id} className="flex items-center gap-3 rounded-xl bg-zinc-800/30 px-3 py-2.5">
                    <div
                      className="flex h-9 w-9 items-center justify-center rounded-lg flex-shrink-0"
                      style={{ backgroundColor: (cat?.color || '#6b7280') + '20' }}
                    >
                      <DynamicIcon
                        name={cat?.icon || 'MoreHorizontal'}
                        size={16}
                        className="text-zinc-300"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-zinc-200 truncate">
                        {cat?.name || 'Невідома'}
                      </p>
                      {t.description && (
                        <p className="text-[11px] text-zinc-500 truncate">{t.description}</p>
                      )}
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className={cn(
                        'text-sm font-semibold flex items-center gap-1 justify-end',
                        t.type === 'income' ? 'text-emerald-400' : 'text-red-400'
                      )}>
                        {t.type === 'income' ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
                        {formatCurrency(t.amount)}
                      </p>
                      <p className="text-[11px] text-zinc-600">{formatDateShort(t.date)}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-36 text-zinc-600">
              <p className="text-sm">Ще немає транзакцій</p>
              <button
                onClick={() => setShowAddModal(true)}
                className="mt-2 text-xs text-emerald-500 hover:text-emerald-400"
              >
                Додати першу транзакцію
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Budget Alerts */}
      {overBudgets.length > 0 && (
        <div className="rounded-2xl border border-red-500/20 bg-red-500/5 p-4 lg:p-5">
          <h2 className="text-base font-semibold text-red-400 mb-3">Перевищення бюджету</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {overBudgets.map((item, i) => (
              <div key={i} className="rounded-xl bg-red-500/10 border border-red-500/20 p-3">
                <p className="text-sm font-medium text-red-300">{item.categoryName}</p>
                <p className="text-lg font-bold text-red-400 mt-1">
                  {formatCurrency(item.spent)} <span className="text-xs font-normal text-red-400/60">/ {formatCurrency(item.limit)}</span>
                </p>
                <div className="mt-2 h-1.5 rounded-full bg-red-500/20">
                  <div className="h-full rounded-full bg-red-500" style={{ width: '100%' }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <AddTransactionModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
      />
    </div>
  );
}
