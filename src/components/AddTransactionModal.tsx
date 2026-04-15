'use client';

import { useState } from 'react';
import { useFinance } from '@/lib/context';
import { TransactionType } from '@/lib/types';
import Modal from './Modal';
import DynamicIcon from './DynamicIcon';
import { cn } from '@/lib/utils';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  defaultType?: TransactionType;
}

export default function AddTransactionModal({ isOpen, onClose, defaultType = 'expense' }: Props) {
  const { state, addTransaction } = useFinance();
  const [type, setType] = useState<TransactionType>(defaultType);
  const [amount, setAmount] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);

  const categories = state.categories.filter(c => c.type === type);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || !categoryId) return;

    addTransaction({
      amount: parseFloat(amount),
      type,
      categoryId,
      description,
      date: new Date(date).toISOString(),
    });

    setAmount('');
    setCategoryId('');
    setDescription('');
    setDate(new Date().toISOString().split('T')[0]);
    onClose();
  };

  const handleTypeChange = (newType: TransactionType) => {
    setType(newType);
    setCategoryId('');
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Нова транзакція">
      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="flex gap-2 p-1 rounded-xl bg-zinc-800/50">
          <button
            type="button"
            onClick={() => handleTypeChange('expense')}
            className={cn(
              'flex-1 py-2 rounded-lg text-sm font-medium transition-all',
              type === 'expense'
                ? 'bg-red-500/20 text-red-400'
                : 'text-zinc-400 hover:text-zinc-200'
            )}
          >
            Витрата
          </button>
          <button
            type="button"
            onClick={() => handleTypeChange('income')}
            className={cn(
              'flex-1 py-2 rounded-lg text-sm font-medium transition-all',
              type === 'income'
                ? 'bg-emerald-500/20 text-emerald-400'
                : 'text-zinc-400 hover:text-zinc-200'
            )}
          >
            Дохід
          </button>
        </div>

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

        <div>
          <label className="block text-sm text-zinc-400 mb-2">Категорія</label>
          <div className="grid grid-cols-3 gap-2 max-h-48 overflow-y-auto">
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
          disabled={!amount || !categoryId}
          className="w-full rounded-xl bg-emerald-500 py-3 text-sm font-semibold text-black hover:bg-emerald-400 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          {type === 'expense' ? 'Додати витрату' : 'Додати дохід'}
        </button>
      </form>
    </Modal>
  );
}
