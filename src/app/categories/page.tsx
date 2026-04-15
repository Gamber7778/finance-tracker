'use client';

import { useState } from 'react';
import { Plus, Trash2, Edit3, Check, X } from 'lucide-react';
import { useFinance } from '@/lib/context';
import { TransactionType } from '@/lib/types';
import { ICON_OPTIONS, COLOR_OPTIONS } from '@/lib/defaults';
import Modal from '@/components/Modal';
import DynamicIcon from '@/components/DynamicIcon';
import { cn } from '@/lib/utils';

export default function CategoriesPage() {
  const { state, isLoaded, addCategory, updateCategory, deleteCategory } = useFinance();
  const [activeTab, setActiveTab] = useState<TransactionType>('expense');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  const [newName, setNewName] = useState('');
  const [newIcon, setNewIcon] = useState('ShoppingCart');
  const [newColor, setNewColor] = useState('#3b82f6');

  const categories = state.categories.filter(c => c.type === activeTab);

  const handleAdd = () => {
    if (!newName.trim()) return;
    addCategory({ name: newName.trim(), icon: newIcon, type: activeTab, color: newColor });
    setNewName('');
    setNewIcon('ShoppingCart');
    setNewColor('#3b82f6');
    setShowAddModal(false);
  };

  const handleStartEdit = (id: string) => {
    const cat = state.categories.find(c => c.id === id);
    if (!cat) return;
    setEditingId(id);
    setNewName(cat.name);
    setNewIcon(cat.icon);
    setNewColor(cat.color);
  };

  const handleSaveEdit = () => {
    if (!editingId || !newName.trim()) return;
    updateCategory(editingId, { name: newName.trim(), icon: newIcon, color: newColor });
    setEditingId(null);
    setNewName('');
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
        <h1 className="text-xl lg:text-2xl font-bold text-white">Категорії</h1>
        <button
          onClick={() => { setShowAddModal(true); setEditingId(null); setNewName(''); }}
          className="flex items-center gap-2 rounded-xl bg-emerald-500 px-3 py-2 lg:px-4 lg:py-2.5 text-sm font-semibold text-black hover:bg-emerald-400 transition-colors"
        >
          <Plus size={16} />
          <span className="hidden sm:inline">Нова категорія</span>
          <span className="sm:hidden">Додати</span>
        </button>
      </div>

      <div className="flex gap-2 p-1 rounded-xl bg-zinc-800/50 border border-zinc-700 w-fit">
        <button
          onClick={() => setActiveTab('expense')}
          className={cn(
            'px-3 lg:px-4 py-2 rounded-lg text-sm font-medium transition-all',
            activeTab === 'expense' ? 'bg-red-500/20 text-red-400' : 'text-zinc-400 hover:text-zinc-200'
          )}
        >
          Витрати ({state.categories.filter(c => c.type === 'expense').length})
        </button>
        <button
          onClick={() => setActiveTab('income')}
          className={cn(
            'px-3 lg:px-4 py-2 rounded-lg text-sm font-medium transition-all',
            activeTab === 'income' ? 'bg-emerald-500/20 text-emerald-400' : 'text-zinc-400 hover:text-zinc-200'
          )}
        >
          Доходи ({state.categories.filter(c => c.type === 'income').length})
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {categories.map(cat => (
          <div
            key={cat.id}
            className="flex items-center gap-3 rounded-xl border border-zinc-800 bg-zinc-900/50 p-3 lg:p-4 group hover:border-zinc-700 transition-colors"
          >
            <div
              className="flex h-10 w-10 lg:h-11 lg:w-11 items-center justify-center rounded-xl flex-shrink-0"
              style={{ backgroundColor: cat.color + '20' }}
            >
              <DynamicIcon name={cat.icon} size={18} className="text-zinc-200" />
            </div>

            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-zinc-200">{cat.name}</p>
              <p className="text-xs text-zinc-500">
                {state.transactions.filter(t => t.categoryId === cat.id).length} транзакцій
              </p>
            </div>

            <div className="flex gap-1 lg:opacity-0 lg:group-hover:opacity-100 transition-opacity">
              <button
                onClick={() => handleStartEdit(cat.id)}
                className="rounded-lg p-1.5 text-zinc-500 hover:text-zinc-200 hover:bg-zinc-800 transition-colors"
              >
                <Edit3 size={14} />
              </button>
              {deleteConfirm === cat.id ? (
                <div className="flex gap-1">
                  <button
                    onClick={() => { deleteCategory(cat.id); setDeleteConfirm(null); }}
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
                  onClick={() => setDeleteConfirm(cat.id)}
                  className="rounded-lg p-1.5 text-zinc-500 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                >
                  <Trash2 size={14} />
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Add / Edit Modal */}
      <Modal
        isOpen={showAddModal || editingId !== null}
        onClose={() => { setShowAddModal(false); setEditingId(null); }}
        title={editingId ? 'Редагувати категорію' : 'Нова категорія'}
      >
        <div className="space-y-5">
          <div>
            <label className="block text-sm text-zinc-400 mb-1.5">Назва</label>
            <input
              type="text"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder="Назва категорії"
              className="w-full rounded-xl border border-zinc-700 bg-zinc-800/50 px-4 py-2.5 text-sm text-white placeholder-zinc-600 focus:border-emerald-500 focus:outline-none transition-colors"
              autoFocus
            />
          </div>

          <div>
            <label className="block text-sm text-zinc-400 mb-2">Іконка</label>
            <div className="grid grid-cols-7 sm:grid-cols-9 gap-1.5 max-h-32 overflow-y-auto">
              {ICON_OPTIONS.map(icon => (
                <button
                  key={icon}
                  type="button"
                  onClick={() => setNewIcon(icon)}
                  className={cn(
                    'flex h-9 w-9 items-center justify-center rounded-lg transition-all',
                    newIcon === icon
                      ? 'bg-emerald-500/20 ring-1 ring-emerald-500'
                      : 'bg-zinc-800/50 hover:bg-zinc-700/50'
                  )}
                >
                  <DynamicIcon name={icon} size={16} className="text-zinc-300" />
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm text-zinc-400 mb-2">Колір</label>
            <div className="flex gap-2 flex-wrap">
              {COLOR_OPTIONS.map(color => (
                <button
                  key={color}
                  type="button"
                  onClick={() => setNewColor(color)}
                  className={cn(
                    'h-8 w-8 rounded-lg transition-all',
                    newColor === color ? 'ring-2 ring-white ring-offset-2 ring-offset-zinc-900' : ''
                  )}
                  style={{ backgroundColor: color }}
                />
              ))}
            </div>
          </div>

          <button
            onClick={editingId ? handleSaveEdit : handleAdd}
            disabled={!newName.trim()}
            className="w-full rounded-xl bg-emerald-500 py-3 text-sm font-semibold text-black hover:bg-emerald-400 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            {editingId ? 'Зберегти' : 'Додати категорію'}
          </button>
        </div>
      </Modal>
    </div>
  );
}
