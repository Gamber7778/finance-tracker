'use client';

import { useState, useMemo } from 'react';
import { Plus, Trash2, AlertTriangle, Check, X } from 'lucide-react';
import { useFinance } from '@/lib/context';
import { formatCurrency, getCurrentMonth, getMonthName, cn } from '@/lib/utils';
import Modal from '@/components/Modal';
import DynamicIcon from '@/components/DynamicIcon';

export default function BudgetsPage() {
  const { state, isLoaded, addBudget, deleteBudget, getBudgetStatus } = useFinance();
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedCategoryId, setSelectedCategoryId] = useState('');
  const [budgetAmount, setBudgetAmount] = useState('');
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const month = getCurrentMonth();

  const expenseCategories = state.categories.filter(c => c.type === 'expense');
  const availableCategories = expenseCategories.filter(
    c => !state.budgets.some(b => b.categoryId === c.id)
  );

  const budgetData = useMemo(() => {
    return state.budgets.map(b => {
      const status = getBudgetStatus(b.id, month);
      const cat = state.categories.find(c => c.id === b.categoryId);
      return { ...b, ...status, category: cat };
    });
  }, [state.budgets, state.categories, getBudgetStatus, month]);

  const totalBudget = budgetData.reduce((a, b) => a + b.limit, 0);
  const totalSpent = budgetData.reduce((a, b) => a + b.spent, 0);

  const handleAdd = () => {
    if (!selectedCategoryId || !budgetAmount) return;
    addBudget({
      categoryId: selectedCategoryId,
      amount: parseFloat(budgetAmount),
      period: 'monthly',
    });
    setSelectedCategoryId('');
    setBudgetAmount('');
    setShowAddModal(false);
  };

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
        <div>
          <h1 className="text-2xl font-bold text-white">Бюджети</h1>
          <p className="text-sm text-zinc-500 mt-0.5 capitalize">{getMonthName(month)}</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          disabled={availableCategories.length === 0}
          className="flex items-center gap-2 rounded-xl bg-emerald-500 px-4 py-2.5 text-sm font-semibold text-black hover:bg-emerald-400 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          <Plus size={16} />
          Новий бюджет
        </button>
      </div>

      {/* Summary */}
      {budgetData.length > 0 && (
        <div className="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-5">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm text-zinc-400">Загальний бюджет</span>
            <span className={cn(
              'text-sm font-medium',
              totalSpent > totalBudget ? 'text-red-400' : 'text-zinc-300'
            )}>
              {formatCurrency(totalSpent)} / {formatCurrency(totalBudget)}
            </span>
          </div>
          <div className="h-3 rounded-full bg-zinc-800">
            <div
              className={cn(
                'h-full rounded-full transition-all duration-500',
                totalSpent > totalBudget ? 'bg-red-500' : totalSpent > totalBudget * 0.8 ? 'bg-yellow-500' : 'bg-emerald-500'
              )}
              style={{ width: `${Math.min((totalSpent / totalBudget) * 100, 100)}%` }}
            />
          </div>
        </div>
      )}

      {/* Budget List */}
      <div className="space-y-3">
        {budgetData.length > 0 ? (
          budgetData.map((item) => (
            <div
              key={item.id}
              className={cn(
                'rounded-2xl border p-5 group transition-colors',
                item.isOver
                  ? 'border-red-500/30 bg-red-500/5'
                  : 'border-zinc-800 bg-zinc-900/50'
              )}
            >
              <div className="flex items-center gap-4 mb-3">
                <div
                  className="flex h-11 w-11 items-center justify-center rounded-xl flex-shrink-0"
                  style={{ backgroundColor: (item.category?.color || '#6b7280') + '20' }}
                >
                  <DynamicIcon name={item.category?.icon || 'MoreHorizontal'} size={20} className="text-zinc-200" />
                </div>

                <div className="flex-1">
                  <p className="text-sm font-medium text-zinc-200">{item.category?.name}</p>
                  <p className="text-xs text-zinc-500">Щомісячний бюджет</p>
                </div>

                <div className="text-right">
                  <p className={cn(
                    'text-lg font-bold',
                    item.isOver ? 'text-red-400' : 'text-white'
                  )}>
                    {formatCurrency(item.spent)}
                  </p>
                  <p className="text-xs text-zinc-500">з {formatCurrency(item.limit)}</p>
                </div>

                {item.isOver && (
                  <AlertTriangle size={18} className="text-red-400 flex-shrink-0" />
                )}

                <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                  {deleteConfirm === item.id ? (
                    <div className="flex gap-1">
                      <button
                        onClick={() => { deleteBudget(item.id); setDeleteConfirm(null); }}
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
                      onClick={() => setDeleteConfirm(item.id)}
                      className="rounded-lg p-1.5 text-zinc-600 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                    >
                      <Trash2 size={14} />
                    </button>
                  )}
                </div>
              </div>

              <div className="h-2 rounded-full bg-zinc-800">
                <div
                  className={cn(
                    'h-full rounded-full transition-all duration-500',
                    item.isOver ? 'bg-red-500' : item.percentage > 80 ? 'bg-yellow-500' : 'bg-emerald-500'
                  )}
                  style={{ width: `${item.percentage}%` }}
                />
              </div>

              <div className="flex justify-between mt-2">
                <span className="text-[11px] text-zinc-500">
                  {item.percentage.toFixed(0)}% використано
                </span>
                <span className="text-[11px] text-zinc-500">
                  Залишок: {formatCurrency(Math.max(item.limit - item.spent, 0))}
                </span>
              </div>
            </div>
          ))
        ) : (
          <div className="flex flex-col items-center justify-center py-20 text-zinc-600">
            <p className="text-sm">Ще немає бюджетів</p>
            <p className="text-xs text-zinc-700 mt-1">Встановіть ліміти витрат по категоріях</p>
            <button
              onClick={() => setShowAddModal(true)}
              className="mt-3 text-xs text-emerald-500 hover:text-emerald-400"
            >
              Створити бюджет
            </button>
          </div>
        )}
      </div>

      {/* Add Budget Modal */}
      <Modal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        title="Новий бюджет"
      >
        <div className="space-y-5">
          <div>
            <label className="block text-sm text-zinc-400 mb-2">Категорія</label>
            <div className="grid grid-cols-3 gap-2 max-h-48 overflow-y-auto">
              {availableCategories.map(cat => (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setSelectedCategoryId(cat.id)}
                  className={cn(
                    'flex flex-col items-center gap-1.5 rounded-xl border p-3 transition-all',
                    selectedCategoryId === cat.id
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
                  <span className="text-[11px] text-zinc-300 leading-tight text-center">{cat.name}</span>
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm text-zinc-400 mb-1.5">Місячний ліміт (€)</label>
            <input
              type="number"
              step="1"
              min="0"
              value={budgetAmount}
              onChange={(e) => setBudgetAmount(e.target.value)}
              placeholder="0"
              className="w-full rounded-xl border border-zinc-700 bg-zinc-800/50 px-4 py-3 text-2xl font-semibold text-white placeholder-zinc-600 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500/50 transition-colors"
            />
          </div>

          <button
            onClick={handleAdd}
            disabled={!selectedCategoryId || !budgetAmount}
            className="w-full rounded-xl bg-emerald-500 py-3 text-sm font-semibold text-black hover:bg-emerald-400 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            Створити бюджет
          </button>
        </div>
      </Modal>
    </div>
  );
}
