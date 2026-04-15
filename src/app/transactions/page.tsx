'use client';

import { useState, useMemo } from 'react';
import {
  Plus, ArrowUpRight, ArrowDownRight, ArrowLeftRight, Settings2,
  Search, Trash2, Check, X,
} from 'lucide-react';
import { useFinance } from '@/lib/context';
import { formatCurrency, formatDate, formatDateShort, getCurrentMonth, getMonthOptions, cn } from '@/lib/utils';
import AddTransactionModal from '@/components/AddTransactionModal';
import DynamicIcon from '@/components/DynamicIcon';
import { TransactionType } from '@/lib/types';

const TYPE_FILTERS: { value: 'all' | TransactionType; label: string }[] = [
  { value: 'all', label: 'Усі' },
  { value: 'expense', label: 'Витрати' },
  { value: 'income', label: 'Доходи' },
  { value: 'transfer', label: 'Перекази' },
  { value: 'adjustment', label: 'Корекції' },
];

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
      const acc = state.accounts.find(a => a.id === t.accountId);
      const toAcc = state.accounts.find(a => a.id === t.toAccountId);
      const searchLower = search.toLowerCase();
      const matchesSearch = !search ||
        (cat?.name || '').toLowerCase().includes(searchLower) ||
        t.description.toLowerCase().includes(searchLower) ||
        (acc?.name || '').toLowerCase().includes(searchLower) ||
        (toAcc?.name || '').toLowerCase().includes(searchLower);
      const matchesType = filterType === 'all' || t.type === filterType;
      const matchesMonth = t.date.startsWith(filterMonth);
      return matchesSearch && matchesType && matchesMonth;
    });
  }, [state.transactions, state.categories, state.accounts, search, filterType, filterMonth]);

  const totalIncome = filtered.filter(t => t.type === 'income').reduce((a, t) => a + t.amount, 0);
  const totalExpense = filtered.filter(t => t.type === 'expense').reduce((a, t) => a + t.amount, 0);

  const typeIcon = (type: string) => {
    switch (type) {
      case 'income': return <ArrowUpRight size={14} />;
      case 'expense': return <ArrowDownRight size={14} />;
      case 'transfer': return <ArrowLeftRight size={14} />;
      case 'adjustment': return <Settings2 size={14} />;
      default: return null;
    }
  };

  const typeColor = (type: string) => {
    switch (type) {
      case 'income': return 'text-emerald-400';
      case 'expense': return 'text-red-400';
      case 'transfer': return 'text-blue-400';
      case 'adjustment': return 'text-amber-400';
      default: return 'text-zinc-400';
    }
  };

  const typeActiveClass = (type: string) => {
    switch (type) {
      case 'expense': return 'bg-red-500/20 text-red-400';
      case 'income': return 'bg-emerald-500/20 text-emerald-400';
      case 'transfer': return 'bg-blue-500/20 text-blue-400';
      case 'adjustment': return 'bg-amber-500/20 text-amber-400';
      default: return 'bg-zinc-700 text-white';
    }
  };

  const getTransactionLabel = (t: typeof state.transactions[0]) => {
    if (t.type === 'transfer') {
      const from = state.accounts.find(a => a.id === t.accountId);
      const to = state.accounts.find(a => a.id === t.toAccountId);
      return `${from?.name || '?'} → ${to?.name || '?'}`;
    }
    if (t.type === 'adjustment') {
      const acc = state.accounts.find(a => a.id === t.accountId);
      return `Корекція · ${acc?.name || '?'}`;
    }
    const cat = state.categories.find(c => c.id === t.categoryId);
    return cat?.name || 'Невідома';
  };

  const getTransactionIcon = (t: typeof state.transactions[0]) => {
    if (t.type === 'transfer') return 'ArrowLeftRight';
    if (t.type === 'adjustment') return 'Settings2';
    const cat = state.categories.find(c => c.id === t.categoryId);
    return cat?.icon || 'MoreHorizontal';
  };

  const getTransactionColor = (t: typeof state.transactions[0]) => {
    if (t.type === 'transfer') return '#3b82f6';
    if (t.type === 'adjustment') return '#f59e0b';
    const cat = state.categories.find(c => c.id === t.categoryId);
    return cat?.color || '#6b7280';
  };

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
        <h1 className="text-xl lg:text-2xl font-bold text-white">Транзакції</h1>
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 rounded-xl bg-emerald-500 px-3 py-2 lg:px-4 lg:py-2.5 text-sm font-semibold text-black hover:bg-emerald-400 transition-colors"
        >
          <Plus size={16} />
          Додати
        </button>
      </div>

      {/* Filters */}
      <div className="space-y-3 lg:space-y-0 lg:flex lg:gap-3 lg:items-center lg:flex-wrap">
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

        <div className="flex gap-2">
          <select
            value={filterMonth}
            onChange={(e) => setFilterMonth(e.target.value)}
            className="flex-1 lg:flex-none rounded-xl border border-zinc-700 bg-zinc-800/50 px-3 lg:px-4 py-2.5 text-sm text-white focus:border-emerald-500 focus:outline-none transition-colors appearance-none cursor-pointer"
          >
            {monthOptions.map(o => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Type filter pills */}
      <div className="flex gap-1 p-1 rounded-xl bg-zinc-800/50 border border-zinc-700 overflow-x-auto">
        {TYPE_FILTERS.map(f => (
          <button
            key={f.value}
            onClick={() => setFilterType(f.value)}
            className={cn(
              'px-2.5 lg:px-3 py-1.5 rounded-lg text-xs font-medium transition-all whitespace-nowrap',
              filterType === f.value
                ? typeActiveClass(f.value)
                : 'text-zinc-400 hover:text-zinc-200'
            )}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Summary */}
      <div className="flex gap-2 lg:gap-4 flex-wrap">
        <div className="flex items-center gap-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20 px-3 lg:px-4 py-2">
          <ArrowUpRight size={14} className="text-emerald-400" />
          <span className="text-xs lg:text-sm text-emerald-400 font-medium">+{formatCurrency(totalIncome)}</span>
        </div>
        <div className="flex items-center gap-2 rounded-xl bg-red-500/10 border border-red-500/20 px-3 lg:px-4 py-2">
          <ArrowDownRight size={14} className="text-red-400" />
          <span className="text-xs lg:text-sm text-red-400 font-medium">-{formatCurrency(totalExpense)}</span>
        </div>
        <div className="flex items-center gap-2 rounded-xl bg-zinc-800/50 border border-zinc-700 px-3 lg:px-4 py-2">
          <span className="text-xs lg:text-sm text-zinc-400">{filtered.length} транзакцій</span>
        </div>
      </div>

      {/* Transactions List */}
      <div className="space-y-2">
        {filtered.length > 0 ? (
          filtered.map((t) => {
            const iconName = getTransactionIcon(t);
            const color = getTransactionColor(t);
            const label = getTransactionLabel(t);
            const acc = state.accounts.find(a => a.id === t.accountId);

            return (
              <div
                key={t.id}
                className="flex items-center gap-3 lg:gap-4 rounded-xl border border-zinc-800 bg-zinc-900/50 px-3 lg:px-4 py-3 group hover:border-zinc-700 transition-colors"
              >
                <div
                  className="flex h-9 w-9 lg:h-10 lg:w-10 items-center justify-center rounded-xl flex-shrink-0"
                  style={{ backgroundColor: color + '20' }}
                >
                  <DynamicIcon name={iconName} size={16} className="text-zinc-300" />
                </div>

                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-zinc-200 truncate">{label}</p>
                  <div className="flex items-center gap-1.5">
                    {t.description && (
                      <p className="text-xs text-zinc-500 truncate">{t.description}</p>
                    )}
                    {acc && (
                      <span className="text-[10px] text-zinc-600 flex-shrink-0">
                        {t.description ? '·' : ''} {acc.name}
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-zinc-600 lg:hidden">{formatDateShort(t.date)}</p>
                </div>

                <p className="text-xs text-zinc-500 flex-shrink-0 hidden lg:block">{formatDate(t.date)}</p>

                <p className={cn(
                  'text-sm font-semibold flex items-center gap-1 flex-shrink-0 justify-end',
                  typeColor(t.type)
                )}>
                  {typeIcon(t.type)}
                  {t.type === 'expense' ? '-' : t.type === 'transfer' ? '' : '+'}{formatCurrency(t.amount)}
                </p>

                <div className="flex-shrink-0 lg:opacity-0 lg:group-hover:opacity-100 transition-opacity">
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
