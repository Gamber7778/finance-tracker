'use client';

import { useState } from 'react';
import { Plus, Trash2, Check, X, Wallet, PiggyBank, Banknote, Edit2 } from 'lucide-react';
import { useFinance } from '@/lib/context';
import { formatCurrency, cn } from '@/lib/utils';
import { ICON_OPTIONS, COLOR_OPTIONS } from '@/lib/defaults';
import { AccountType } from '@/lib/types';
import Modal from '@/components/Modal';
import DynamicIcon from '@/components/DynamicIcon';

const ACCOUNT_TYPE_OPTIONS: { value: AccountType; label: string; icon: React.ReactNode }[] = [
  { value: 'checking', label: 'Основний', icon: <Wallet size={16} /> },
  { value: 'savings', label: 'Накопичення', icon: <PiggyBank size={16} /> },
  { value: 'cash', label: 'Готівка', icon: <Banknote size={16} /> },
];

export default function AccountsPage() {
  const { state, isLoaded, addAccount, updateAccount, deleteAccount } = useFinance();
  const [showAddModal, setShowAddModal] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  const [name, setName] = useState('');
  const [accountType, setAccountType] = useState<AccountType>('checking');
  const [icon, setIcon] = useState('Wallet');
  const [color, setColor] = useState('#3b82f6');
  const [balance, setBalance] = useState('');
  const [includeInSpending, setIncludeInSpending] = useState(true);

  const resetForm = () => {
    setName('');
    setAccountType('checking');
    setIcon('Wallet');
    setColor('#3b82f6');
    setBalance('');
    setIncludeInSpending(true);
    setEditId(null);
  };

  const handleAdd = () => {
    if (!name) return;
    addAccount({
      name,
      type: accountType,
      icon,
      color,
      balance: parseFloat(balance || '0'),
      includeInSpending,
    });
    resetForm();
    setShowAddModal(false);
  };

  const handleEdit = (acc: typeof state.accounts[0]) => {
    setEditId(acc.id);
    setName(acc.name);
    setAccountType(acc.type);
    setIcon(acc.icon);
    setColor(acc.color);
    setBalance(acc.balance.toString());
    setIncludeInSpending(acc.includeInSpending);
    setShowAddModal(true);
  };

  const handleUpdate = () => {
    if (!editId || !name) return;
    updateAccount(editId, {
      name,
      type: accountType,
      icon,
      color,
      includeInSpending,
    });
    resetForm();
    setShowAddModal(false);
  };

  const totalBalance = state.accounts.reduce((a, acc) => a + acc.balance, 0);
  const spendingBalance = state.accounts.filter(a => a.includeInSpending).reduce((a, acc) => a + acc.balance, 0);
  const savingsBalance = state.accounts.filter(a => !a.includeInSpending).reduce((a, acc) => a + acc.balance, 0);

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
        <h1 className="text-xl lg:text-2xl font-bold text-white">Рахунки</h1>
        <button
          onClick={() => { resetForm(); setShowAddModal(true); }}
          className="flex items-center gap-2 rounded-xl bg-emerald-500 px-3 py-2 lg:px-4 lg:py-2.5 text-sm font-semibold text-black hover:bg-emerald-400 transition-colors"
        >
          <Plus size={16} />
          <span className="hidden sm:inline">Новий рахунок</span>
          <span className="sm:hidden">Додати</span>
        </button>
      </div>

      {/* Totals */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-4">
          <p className="text-xs text-zinc-500">Загальний баланс</p>
          <p className={cn('text-2xl font-bold mt-1', totalBalance >= 0 ? 'text-white' : 'text-red-400')}>
            {formatCurrency(totalBalance)}
          </p>
        </div>
        <div className="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-4">
          <p className="text-xs text-zinc-500">Доступні кошти</p>
          <p className="text-2xl font-bold text-emerald-400 mt-1">{formatCurrency(spendingBalance)}</p>
        </div>
        <div className="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-4">
          <p className="text-xs text-zinc-500">Накопичення</p>
          <p className="text-2xl font-bold text-blue-400 mt-1">{formatCurrency(savingsBalance)}</p>
        </div>
      </div>

      {/* Account Cards */}
      <div className="space-y-3">
        {state.accounts.length > 0 ? (
          state.accounts.map(acc => (
            <div
              key={acc.id}
              className="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-4 lg:p-5 group hover:border-zinc-700 transition-colors"
            >
              <div className="flex items-center gap-3 lg:gap-4">
                <div
                  className="flex h-11 w-11 lg:h-12 lg:w-12 items-center justify-center rounded-xl flex-shrink-0"
                  style={{ backgroundColor: acc.color + '20' }}
                >
                  <DynamicIcon name={acc.icon} size={22} className="text-zinc-200" />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm lg:text-base font-semibold text-white">{acc.name}</h3>
                    {!acc.includeInSpending && (
                      <span className="rounded-full bg-blue-500/15 px-2 py-0.5 text-[10px] text-blue-400 font-medium">
                        Накопичення
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-zinc-500 mt-0.5">
                    {ACCOUNT_TYPE_OPTIONS.find(o => o.value === acc.type)?.label || acc.type}
                  </p>
                </div>

                <div className="text-right flex-shrink-0">
                  <p className={cn(
                    'text-lg lg:text-xl font-bold',
                    acc.balance >= 0 ? 'text-white' : 'text-red-400'
                  )}>
                    {formatCurrency(acc.balance)}
                  </p>
                </div>

                <div className="flex gap-1 flex-shrink-0 lg:opacity-0 lg:group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => handleEdit(acc)}
                    className="rounded-lg p-1.5 text-zinc-500 hover:text-emerald-400 hover:bg-emerald-500/10 transition-colors"
                  >
                    <Edit2 size={14} />
                  </button>
                  {deleteConfirm === acc.id ? (
                    <div className="flex gap-1">
                      <button
                        onClick={() => { deleteAccount(acc.id); setDeleteConfirm(null); }}
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
                      onClick={() => setDeleteConfirm(acc.id)}
                      className="rounded-lg p-1.5 text-zinc-600 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                    >
                      <Trash2 size={14} />
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="flex flex-col items-center justify-center py-20 text-zinc-600">
            <Wallet size={40} className="mb-3 text-zinc-700" />
            <p className="text-sm">Ще немає рахунків</p>
            <p className="text-xs text-zinc-700 mt-1">Додайте свій перший рахунок</p>
            <button
              onClick={() => setShowAddModal(true)}
              className="mt-3 text-xs text-emerald-500 hover:text-emerald-400"
            >
              Створити рахунок
            </button>
          </div>
        )}
      </div>

      {/* Add / Edit Account Modal */}
      <Modal
        isOpen={showAddModal}
        onClose={() => { setShowAddModal(false); resetForm(); }}
        title={editId ? 'Редагувати рахунок' : 'Новий рахунок'}
      >
        <div className="space-y-5">
          <div>
            <label className="block text-sm text-zinc-400 mb-1.5">Назва</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="ING, Cash, Savings..."
              className="w-full rounded-xl border border-zinc-700 bg-zinc-800/50 px-4 py-2.5 text-sm text-white placeholder-zinc-600 focus:border-emerald-500 focus:outline-none transition-colors"
              autoFocus
            />
          </div>

          <div>
            <label className="block text-sm text-zinc-400 mb-2">Тип рахунку</label>
            <div className="grid grid-cols-3 gap-2">
              {ACCOUNT_TYPE_OPTIONS.map(opt => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setAccountType(opt.value)}
                  className={cn(
                    'flex flex-col items-center gap-1.5 rounded-xl border p-3 transition-all',
                    accountType === opt.value
                      ? 'border-emerald-500/50 bg-emerald-500/10 text-emerald-400'
                      : 'border-zinc-700/50 bg-zinc-800/30 text-zinc-400 hover:border-zinc-600'
                  )}
                >
                  {opt.icon}
                  <span className="text-[11px]">{opt.label}</span>
                </button>
              ))}
            </div>
          </div>

          {!editId && (
            <div>
              <label className="block text-sm text-zinc-400 mb-1.5">Початковий баланс (€)</label>
              <input
                type="number"
                step="0.01"
                value={balance}
                onChange={(e) => setBalance(e.target.value)}
                placeholder="0.00"
                className="w-full rounded-xl border border-zinc-700 bg-zinc-800/50 px-4 py-2.5 text-sm text-white placeholder-zinc-600 focus:border-emerald-500 focus:outline-none transition-colors"
              />
            </div>
          )}

          <div className="flex items-center justify-between rounded-xl border border-zinc-700/50 bg-zinc-800/30 px-4 py-3">
            <div>
              <p className="text-sm text-zinc-300">Рахувати у витратах</p>
              <p className="text-[11px] text-zinc-600 mt-0.5">Вимкніть для рахунку накопичень</p>
            </div>
            <button
              type="button"
              onClick={() => setIncludeInSpending(!includeInSpending)}
              className={cn(
                'relative h-6 w-11 rounded-full transition-colors flex-shrink-0',
                includeInSpending ? 'bg-emerald-500' : 'bg-zinc-700'
              )}
            >
              <span className={cn(
                'absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-white transition-transform',
                includeInSpending ? 'translate-x-5' : 'translate-x-0'
              )} />
            </button>
          </div>

          <div>
            <label className="block text-sm text-zinc-400 mb-2">Іконка</label>
            <div className="grid grid-cols-7 sm:grid-cols-9 gap-1.5 max-h-24 overflow-y-auto">
              {['Wallet', 'PiggyBank', 'Banknote', 'CreditCard', 'Landmark', 'Building2', ...ICON_OPTIONS.slice(0, 12)].map(ic => (
                <button
                  key={ic}
                  type="button"
                  onClick={() => setIcon(ic)}
                  className={cn(
                    'flex h-9 w-9 items-center justify-center rounded-lg transition-all',
                    icon === ic
                      ? 'bg-emerald-500/20 ring-1 ring-emerald-500'
                      : 'bg-zinc-800/50 hover:bg-zinc-700/50'
                  )}
                >
                  <DynamicIcon name={ic} size={16} className="text-zinc-300" />
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm text-zinc-400 mb-2">Колір</label>
            <div className="flex gap-2 flex-wrap">
              {COLOR_OPTIONS.map(c => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setColor(c)}
                  className={cn(
                    'h-7 w-7 rounded-lg transition-all',
                    color === c ? 'ring-2 ring-white ring-offset-2 ring-offset-zinc-900' : ''
                  )}
                  style={{ backgroundColor: c }}
                />
              ))}
            </div>
          </div>

          <button
            onClick={editId ? handleUpdate : handleAdd}
            disabled={!name}
            className="w-full rounded-xl bg-emerald-500 py-3 text-sm font-semibold text-black hover:bg-emerald-400 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            {editId ? 'Зберегти' : 'Створити рахунок'}
          </button>
        </div>
      </Modal>
    </div>
  );
}
