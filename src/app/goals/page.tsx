'use client';

import { useState } from 'react';
import { Plus, Trash2, Target, Check, X, Minus } from 'lucide-react';
import { useFinance } from '@/lib/context';
import { formatCurrency, daysUntil, formatDate, cn } from '@/lib/utils';
import { ICON_OPTIONS, COLOR_OPTIONS } from '@/lib/defaults';
import Modal from '@/components/Modal';
import DynamicIcon from '@/components/DynamicIcon';

export default function GoalsPage() {
  const { state, isLoaded, addGoal, updateGoal, deleteGoal } = useFinance();
  const [showAddModal, setShowAddModal] = useState(false);
  const [showAddFundsModal, setShowAddFundsModal] = useState<string | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  const [name, setName] = useState('');
  const [targetAmount, setTargetAmount] = useState('');
  const [currentAmount, setCurrentAmount] = useState('');
  const [deadline, setDeadline] = useState('');
  const [icon, setIcon] = useState('Target');
  const [color, setColor] = useState('#3b82f6');
  const [fundsToAdd, setFundsToAdd] = useState('');

  const handleAdd = () => {
    if (!name || !targetAmount) return;
    addGoal({
      name,
      targetAmount: parseFloat(targetAmount),
      currentAmount: parseFloat(currentAmount || '0'),
      deadline: deadline || new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
      icon,
      color,
    });
    resetForm();
    setShowAddModal(false);
  };

  const handleAddFunds = (goalId: string) => {
    if (!fundsToAdd) return;
    const goal = state.goals.find(g => g.id === goalId);
    if (!goal) return;
    updateGoal(goalId, {
      currentAmount: goal.currentAmount + parseFloat(fundsToAdd),
    });
    setFundsToAdd('');
    setShowAddFundsModal(null);
  };

  const handleWithdraw = (goalId: string) => {
    if (!fundsToAdd) return;
    const goal = state.goals.find(g => g.id === goalId);
    if (!goal) return;
    updateGoal(goalId, {
      currentAmount: Math.max(0, goal.currentAmount - parseFloat(fundsToAdd)),
    });
    setFundsToAdd('');
    setShowAddFundsModal(null);
  };

  const resetForm = () => {
    setName('');
    setTargetAmount('');
    setCurrentAmount('');
    setDeadline('');
    setIcon('Target');
    setColor('#3b82f6');
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
        <h1 className="text-2xl font-bold text-white">Фінансові цілі</h1>
        <button
          onClick={() => { setShowAddModal(true); resetForm(); }}
          className="flex items-center gap-2 rounded-xl bg-emerald-500 px-4 py-2.5 text-sm font-semibold text-black hover:bg-emerald-400 transition-colors"
        >
          <Plus size={16} />
          Нова ціль
        </button>
      </div>

      <div className="space-y-4">
        {state.goals.length > 0 ? (
          state.goals.map(goal => {
            const percentage = goal.targetAmount > 0
              ? Math.min((goal.currentAmount / goal.targetAmount) * 100, 100)
              : 0;
            const isCompleted = goal.currentAmount >= goal.targetAmount;
            const days = daysUntil(goal.deadline);

            return (
              <div
                key={goal.id}
                className={cn(
                  'rounded-2xl border p-6 group transition-colors',
                  isCompleted
                    ? 'border-emerald-500/30 bg-emerald-500/5'
                    : 'border-zinc-800 bg-zinc-900/50'
                )}
              >
                <div className="flex items-start gap-4 mb-4">
                  <div
                    className="flex h-12 w-12 items-center justify-center rounded-xl flex-shrink-0"
                    style={{ backgroundColor: goal.color + '20' }}
                  >
                    <DynamicIcon name={goal.icon} size={22} className="text-zinc-200" />
                  </div>

                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="text-base font-semibold text-white">{goal.name}</h3>
                      {isCompleted && (
                        <span className="flex items-center gap-1 rounded-full bg-emerald-500/20 px-2 py-0.5 text-[10px] font-medium text-emerald-400">
                          <Check size={10} /> Досягнуто
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-zinc-500 mt-0.5">
                      {days > 0 ? `${days} днів залишилось` : days === 0 ? 'Сьогодні дедлайн' : `Прострочено на ${Math.abs(days)} днів`}
                      {' · '}До {formatDate(goal.deadline)}
                    </p>
                  </div>

                  <div className="text-right">
                    <p className="text-xl font-bold text-white">
                      {formatCurrency(goal.currentAmount)}
                    </p>
                    <p className="text-xs text-zinc-500">
                      з {formatCurrency(goal.targetAmount)}
                    </p>
                  </div>

                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => { setShowAddFundsModal(goal.id); setFundsToAdd(''); }}
                      className="rounded-lg p-1.5 text-zinc-500 hover:text-emerald-400 hover:bg-emerald-500/10 transition-colors"
                      title="Поповнити"
                    >
                      <Plus size={14} />
                    </button>
                    {deleteConfirm === goal.id ? (
                      <div className="flex gap-1">
                        <button
                          onClick={() => { deleteGoal(goal.id); setDeleteConfirm(null); }}
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
                        onClick={() => setDeleteConfirm(goal.id)}
                        className="rounded-lg p-1.5 text-zinc-500 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                      >
                        <Trash2 size={14} />
                      </button>
                    )}
                  </div>
                </div>

                <div className="h-3 rounded-full bg-zinc-800">
                  <div
                    className={cn(
                      'h-full rounded-full transition-all duration-700',
                      isCompleted ? 'bg-emerald-500' : 'bg-blue-500'
                    )}
                    style={{ width: `${percentage}%`, backgroundColor: isCompleted ? undefined : goal.color }}
                  />
                </div>
                <p className="text-[11px] text-zinc-500 mt-1.5 text-right">
                  {percentage.toFixed(1)}%
                </p>
              </div>
            );
          })
        ) : (
          <div className="flex flex-col items-center justify-center py-20 text-zinc-600">
            <Target size={40} className="mb-3 text-zinc-700" />
            <p className="text-sm">Ще немає фінансових цілей</p>
            <p className="text-xs text-zinc-700 mt-1">Поставте ціль і відслідковуйте прогрес</p>
            <button
              onClick={() => setShowAddModal(true)}
              className="mt-3 text-xs text-emerald-500 hover:text-emerald-400"
            >
              Створити ціль
            </button>
          </div>
        )}
      </div>

      {/* Add Goal Modal */}
      <Modal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        title="Нова фінансова ціль"
      >
        <div className="space-y-5">
          <div>
            <label className="block text-sm text-zinc-400 mb-1.5">Назва цілі</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Наприклад: Відпустка"
              className="w-full rounded-xl border border-zinc-700 bg-zinc-800/50 px-4 py-2.5 text-sm text-white placeholder-zinc-600 focus:border-emerald-500 focus:outline-none transition-colors"
              autoFocus
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm text-zinc-400 mb-1.5">Ціль (€)</label>
              <input
                type="number"
                step="1"
                min="0"
                value={targetAmount}
                onChange={(e) => setTargetAmount(e.target.value)}
                placeholder="5000"
                className="w-full rounded-xl border border-zinc-700 bg-zinc-800/50 px-4 py-2.5 text-sm text-white placeholder-zinc-600 focus:border-emerald-500 focus:outline-none transition-colors"
              />
            </div>
            <div>
              <label className="block text-sm text-zinc-400 mb-1.5">Вже накопичено (€)</label>
              <input
                type="number"
                step="1"
                min="0"
                value={currentAmount}
                onChange={(e) => setCurrentAmount(e.target.value)}
                placeholder="0"
                className="w-full rounded-xl border border-zinc-700 bg-zinc-800/50 px-4 py-2.5 text-sm text-white placeholder-zinc-600 focus:border-emerald-500 focus:outline-none transition-colors"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm text-zinc-400 mb-1.5">Дедлайн</label>
            <input
              type="date"
              value={deadline}
              onChange={(e) => setDeadline(e.target.value)}
              className="w-full rounded-xl border border-zinc-700 bg-zinc-800/50 px-4 py-2.5 text-sm text-white focus:border-emerald-500 focus:outline-none transition-colors [color-scheme:dark]"
            />
          </div>

          <div>
            <label className="block text-sm text-zinc-400 mb-2">Іконка</label>
            <div className="grid grid-cols-9 gap-1.5 max-h-24 overflow-y-auto">
              {ICON_OPTIONS.slice(0, 18).map(ic => (
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
            onClick={handleAdd}
            disabled={!name || !targetAmount}
            className="w-full rounded-xl bg-emerald-500 py-3 text-sm font-semibold text-black hover:bg-emerald-400 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            Створити ціль
          </button>
        </div>
      </Modal>

      {/* Add Funds Modal */}
      <Modal
        isOpen={showAddFundsModal !== null}
        onClose={() => setShowAddFundsModal(null)}
        title="Оновити прогрес"
        maxWidth="max-w-sm"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm text-zinc-400 mb-1.5">Сума (€)</label>
            <input
              type="number"
              step="0.01"
              min="0"
              value={fundsToAdd}
              onChange={(e) => setFundsToAdd(e.target.value)}
              placeholder="0"
              className="w-full rounded-xl border border-zinc-700 bg-zinc-800/50 px-4 py-3 text-2xl font-semibold text-white placeholder-zinc-600 focus:border-emerald-500 focus:outline-none transition-colors"
              autoFocus
            />
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => showAddFundsModal && handleAddFunds(showAddFundsModal)}
              disabled={!fundsToAdd}
              className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-emerald-500 py-3 text-sm font-semibold text-black hover:bg-emerald-400 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              <Plus size={16} /> Додати
            </button>
            <button
              onClick={() => showAddFundsModal && handleWithdraw(showAddFundsModal)}
              disabled={!fundsToAdd}
              className="flex-1 flex items-center justify-center gap-2 rounded-xl border border-zinc-700 bg-zinc-800/50 py-3 text-sm font-semibold text-zinc-300 hover:bg-zinc-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              <Minus size={16} /> Зняти
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
