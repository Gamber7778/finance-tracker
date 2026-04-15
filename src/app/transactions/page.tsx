'use client';

import { useState, useMemo } from 'react';
import {
  Plus, ArrowUpRight, ArrowDownRight, Search, Trash2, Edit3, X, Check,
} from 'lucide-react';
import { useFinance } from '@/lib/context';
import { formatCurrency, formatDate, getCurrentMonth, getMonthOptions, cn } from '@/lib/utils';
import AddTransactionModal from '@/components/AddTransactionModal';
import DynamicIcon from '@/components/DynamicIcon';
import { TransactionType } from '@/lib/types';

export default function TransactionsPage() {
  const { state, isLoaded, deleteTransaction } = useFinance();
  const [showAddModal, setShowAddModal] = useState(false);
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState<'all' | TransactionType>('all');
  const [filterMonth, setFilterMonth] = useState(getCurrentMonth());
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const monthOptions = getMonthOptions();

  const filtered = useMemo(() => {
    return state.transactions.filter(t => {
      const cat = state.categories.find(c => c.id === t.categoryId);
      const matchesSearch = !search ||
        (cat?.name || '').toLowerCase().includes(search.toLowerCase()) ||
        t.description.toLowerCase().includes(search.toLowerCase());
      const matchesType = filterType === 'all' || t.type === filterType;
      const matchesMonth = t.date.startsWith(filterMonth);
      return matchesSearch && matchesType && matchesMonth;
    });
  }, [state.transactions, state.categories, search, filterType, filterMonth]);

  const totalIncome = filtered.filter(t => t.type === 'income').reduce((a, t) => a + t.amount, 0);
  const totalExpense = filtered.filter(t => t.type === 'expense').reduce((a, t) => a + t.amount, 0);

  if (!isLoaded) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-emerald-500 border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-white">Транзакції</h1>
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 rounded-xl bg-emerald-500 px-4 py-2.5 text-sm font-semibold text-black hover:bg-emerald-400 transition-colors"
        >
          <Plus size={16} />
          Додати
        </button>
      </div>

      {/* Filters */}
      <div className="flex gap-3 items-center flex-wrap">
        <div className="relative flex-1 min-w-[200px]">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Пошук..."
            className="w-full rounded-xl border border-zinc-700 bg-zinc-800/50 pl-10 pr-4 py-2.5 text-sm text-white placeholder-zinc-600 focus:border-emerald-500 focus:outline-none transition-colors"
          />
        </div>

        <select
          value={filterMonth}
          onChange={(e) => setFilterMonth(e.target.value)}
          className="rounded-xl border border-zinc-700 bg-zinc-800/50 px-4 py-2.5 text-sm text-white focus:border-emerald-500 focus:outline-none transition-colors appearance-none cursor-pointer"
        >
          {monthOptions.map(o => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </select>

        <div className="flex gap-1 p-1 rounded-xl bg-zinc-800/50 border border-zinc-700">
          {(['all', 'expense', 'income'] as const).map(t => (
            <button
              key={t}
              onClick={() => setFilterType(t)}
              className={cn(
                'px-3 py-1.5 rounded-lg text-xs font-medium transition-all',
                filterType === t
                  ? t === 'expense' ? 'bg-red-500/20 text-red-400'
                    : t === 'income' ? 'bg-emerald-500/20 text-emerald-400'
                    : 'bg-zinc-700 text-white'
                  : 'text-zinc-400 hover:text-zinc-200'
              )}
            >
              {t === 'all' ? 'Усі' : t === 'expense' ? 'Витрати' : 'Доходи'}
            </button>
          ))}
        </div>
      </div>

      {/* Summary */}
      <div className="flex gap-4">
        <div className="flex items-center gap-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20 px-4 py-2">
          <ArrowUpRight size={14} className="text-emerald-400" />
          <span className="text-sm text-emerald-400 font-medium">+{formatCurrency(totalIncome)}</span>
        </div>
        <div className="flex items-center gap-2 rounded-xl bg-red-500/10 border border-red-500/20 px-4 py-2">
          <ArrowDownRight size={14} className="text-red-400" />
          <span className="text-sm text-red-400 font-medium">-{formatCurrency(totalExpense)}</span>
        </div>
        <div className="flex items-center gap-2 rounded-xl bg-zinc-800/50 border border-zinc-700 px-4 py-2">
          <span className="text-sm text-zinc-400">{filtered.length} транзакцій</span>
        </div>
      </div>

      {/* Transactions List */}
      <div className="space-y-2">
        {filtered.length > 0 ? (
          filtered.map((t) => {
            const cat = state.categories.find(c => c.id === t.categoryId);
            return (
              <div
                key={t.id}
                className="flex items-center gap-4 rounded-xl border border-zinc-800 bg-zinc-900/50 px-4 py-3 group hover:border-zinc-700 transition-colors"
              >
                <div
                  className="flex h-10 w-10 items-center justify-center rounded-xl flex-shrink-0"
                  style={{ backgroundColor: (cat?.color || '#6b7280') + '20' }}
                >
                  <DynamicIcon name={cat?.icon || 'MoreHorizontal'} size={18} className="text-zinc-300" />
                </div>

                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-zinc-200">{cat?.name || 'Невідома'}</p>
                  {t.description && (
                    <p className="text-xs text-zinc-500 truncate">{t.description}</p>
                  )}
                </div>

                <p className="text-xs text-zinc-500 flex-shrink-0">{formatDate(t.date)}</p>

                <p className={cn(
                  'text-sm font-semibold flex items-center gap-1 flex-shrink-0 min-w-[100px] justify-end',
                  t.type === 'income' ? 'text-emerald-400' : 'text-red-400'
                )}>
                  {t.type === 'income' ? '+' : '-'}{formatCurrency(t.amount)}
                </p>

                <div className="flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                  {deleteConfirm === t.id ? (
                    <div className="flex gap-1">
                      <button
                        onClick={() => { deleteTransaction(t.id); setDeleteConfirm(null); }}
                        className="rounded-lg p-1.5 text-red-400 hover:bg-red-500/20 transition-colors"
                      >
                        <Check size={14} />
                      </button>
                      <button
                        onClick={() => setDeleteConfirm(null)}
                        className="rounded-lg p-1.5 text-zinc-400 hover:bg-zinc-800 transition-colors"
                      >
                        <X size={14} />
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => setDeleteConfirm(t.id)}
                      className="rounded-lg p-1.5 text-zinc-600 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                    >
                      <Trash2 size={14} />
                    </button>
                  )}
                </div>
              </div>
            );
          })
        ) : (
          <div className="flex flex-col items-center justify-center py-20 text-zinc-600">
            <p className="text-sm">Немає транзакцій за цей період</p>
            <button
              onClick={() => setShowAddModal(true)}
              className="mt-2 text-xs text-emerald-500 hover:text-emerald-400"
            >
              Додати транзакцію
            </button>
          </div>
        )}
      </div>

      <AddTransactionModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
      />
    </div>
  );
}
