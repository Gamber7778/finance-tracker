'use client';

import { useState, useEffect } from 'react';
import { useFinance } from '@/lib/context';
import { TransactionType } from '@/lib/types';
import Modal from './Modal';
import DynamicIcon from './DynamicIcon';
import { cn } from '@/lib/utils';
import { ArrowRight } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  defaultType?: TransactionType;
}

const TYPE_TABS: { value: TransactionType; label: string; activeClass: string }[] = [
  { value: 'expense', label: 'Витрата', activeClass: 'bg-red-500/20 text-red-400' },
  { value: 'income', label: 'Дохід', activeClass: 'bg-emerald-500/20 text-emerald-400' },
  { value: 'transfer', label: 'Переказ', activeClass: 'bg-blue-500/20 text-blue-400' },
  { value: 'adjustment', label: 'Корекція', activeClass: 'bg-amber-500/20 text-amber-400' },
];

export default function AddTransactionModal({ isOpen, onClose, defaultType = 'expense' }: Props) {
  const { state, addTransaction } = useFinance();
  const [type, setType] = useState<TransactionType>(defaultType);
  const [amount, setAmount] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [accountId, setAccountId] = useState('');
  const [toAccountId, setToAccountId] = useState('');

  useEffect(() => {
    if (isOpen) {
      setType(defaultType);
      setAmount('');
      setCategoryId('');
      setDescription('');
      setDate(new Date().toISOString().split('T')[0]);
      setAccountId(state.accounts[0]?.id || '');
      setToAccountId('');
    }
  }, [isOpen, defaultType, state.accounts]);

  const categories = state.categories.filter(c =>
    type === 'expense' ? c.type === 'expense' : c.type === 'income'
  );

  const needsCategory = type === 'income' || type === 'expense';
  const needsToAccount = type === 'transfer';

  const canSubmit = () => {
    if (!amount || parseFloat(amount) <= 0) return false;
    if (!accountId) return false;
    if (needsCategory && !categoryId) return false;
    if (needsToAccount && !toAccountId) return false;
    if (needsToAccount && accountId === toAccountId) return false;
    return true;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit()) return;

    addTransaction({
      amount: parseFloat(amount),
      type,
      categoryId: needsCategory ? categoryId : null,
      description,
      date: new Date(date).toISOString(),
      accountId,
      toAccountId: needsToAccount ? toAccountId : null,
    });

    onClose();
  };

  const handleTypeChange = (newType: TransactionType) => {
    setType(newType);
    setCategoryId('');
    setToAccountId('');
  };

  const submitLabels: Record<TransactionType, string> = {
    expense: 'Додати витрату',
    income: 'Додати дохід',
    transfer: 'Переказати',
    adjustment: 'Додати корекцію',
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Нова транзакція">
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Type Tabs */}
        <div className="grid grid-cols-4 gap-1 p-1 rounded-xl bg-zinc-800/50">
          {TYPE_TABS.map(tab => (
            <button
              key={tab.value}
              type="button"
              onClick={() => handleTypeChange(tab.value)}
              className={cn(
                'py-2 rounded-lg text-xs font-medium transition-all',
                type === tab.value
                  ? tab.activeClass
                  : 'text-zinc-500 hover:text-zinc-300'
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Amount */}
        <div>
          <label className="block text-sm text-zinc-400 mb-1.5">Сума (€)</label>
          <input
            type="number"
            step="0.01"
            min="0"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="0.00"
            className="w-full rounded-xl border border-zinc-700 bg-zinc-800/50 px-4 py-3 text-2xl font-semibold text-white placeholder-zinc-600 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500/50 transition-colors"
            required
            autoFocus
          />
        </div>

        {/* Account selector */}
        <div>
          <label className="block text-sm text-zinc-400 mb-2">
            {type === 'transfer' ? 'З рахунку' : 'Рахунок'}
          </label>
          {state.accounts.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-28 overflow-y-auto">
              {state.accounts.map(acc => (
                <button
                  key={acc.id}
                  type="button"
                  onClick={() => setAccountId(acc.id)}
                  className={cn(
                    'flex items-center gap-2 rounded-xl border p-2.5 transition-all text-left',
                    accountId === acc.id
                      ? 'border-emerald-500/50 bg-emerald-500/10'
                      : 'border-zinc-700/50 bg-zinc-800/30 hover:border-zinc-600'
                  )}
                >
                  <div
                    className="flex h-7 w-7 items-center justify-center rounded-lg flex-shrink-0"
                    style={{ backgroundColor: acc.color + '20' }}
                  >
                    <DynamicIcon name={acc.icon} size={14} className="text-zinc-300" />
                  </div>
                  <span className="text-[11px] text-zinc-300 truncate">{acc.name}</span>
                </button>
              ))}
            </div>
          ) : (
            <p className="text-xs text-zinc-600 py-2">Спочатку створіть рахунок</p>
          )}
        </div>

        {/* To Account (for transfers) */}
        {needsToAccount && (
          <div>
            <div className="flex items-center gap-2 mb-2">
              <ArrowRight size={14} className="text-blue-400" />
              <label className="text-sm text-zinc-400">На рахунок</label>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-28 overflow-y-auto">
              {state.accounts
                .filter(acc => acc.id !== accountId)
                .map(acc => (
                  <button
                    key={acc.id}
                    type="button"
                    onClick={() => setToAccountId(acc.id)}
                    className={cn(
                      'flex items-center gap-2 rounded-xl border p-2.5 transition-all text-left',
                      toAccountId === acc.id
                        ? 'border-blue-500/50 bg-blue-500/10'
                        : 'border-zinc-700/50 bg-zinc-800/30 hover:border-zinc-600'
                    )}
                  >
                    <div
                      className="flex h-7 w-7 items-center justify-center rounded-lg flex-shrink-0"
                      style={{ backgroundColor: acc.color + '20' }}
                    >
                      <DynamicIcon name={acc.icon} size={14} className="text-zinc-300" />
                    </div>
                    <span className="text-[11px] text-zinc-300 truncate">{acc.name}</span>
                  </button>
                ))}
            </div>
          </div>
        )}

        {/* Category (for income/expense) */}
        {needsCategory && (
          <div>
            <label className="block text-sm text-zinc-400 mb-2">Категорія</label>
            <div className="grid grid-cols-3 gap-2 max-h-36 lg:max-h-48 overflow-y-auto">
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setCategoryId(cat.id)}
                  className={cn(
                    'flex flex-col items-center gap-1.5 rounded-xl border p-3 transition-all text-center',
                    categoryId === cat.id
                      ? 'border-emerald-500/50 bg-emerald-500/10'
                      : 'border-zinc-700/50 bg-zinc-800/30 hover:border-zinc-600'
                  )}
                >
                  <div
                    className="flex h-8 w-8 items-center justify-center rounded-lg"
                    style={{ backgroundColor: cat.color + '20' }}
                  >
                    <DynamicIcon name={cat.icon} size={16} className="text-zinc-300" />
                  </div>
                  <span className="text-[11px] text-zinc-300 leading-tight">{cat.name}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Description */}
        <div>
          <label className="block text-sm text-zinc-400 mb-1.5">Опис</label>
          <input
            type="text"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Коментар (необов'язково)"
            className="w-full rounded-xl border border-zinc-700 bg-zinc-800/50 px-4 py-2.5 text-sm text-white placeholder-zinc-600 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500/50 transition-colors"
          />
        </div>

        {/* Date */}
        <div>
          <label className="block text-sm text-zinc-400 mb-1.5">Дата</label>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="w-full rounded-xl border border-zinc-700 bg-zinc-800/50 px-4 py-2.5 text-sm text-white focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500/50 transition-colors [color-scheme:dark]"
          />
        </div>

        <button
          type="submit"
          disabled={!canSubmit()}
          className="w-full rounded-xl bg-emerald-500 py-3 text-sm font-semibold text-black hover:bg-emerald-400 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          {submitLabels[type]}
        </button>
      </form>
    </Modal>
  );
}
