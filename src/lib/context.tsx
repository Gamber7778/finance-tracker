'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { FinanceState, Transaction, Category, Budget, Goal, Account } from './types';
import { useToast } from './toast';

async function api<T>(url: string, opts?: RequestInit): Promise<T> {
  const res = await fetch(url, {
    headers: { 'Content-Type': 'application/json' },
    ...opts,
  });
  if (!res.ok) {
    const text = await res.text().catch(() => 'Unknown error');
    throw new Error(`${res.status}: ${text}`);
  }
  return res.json();
}

function filterByMonth(transactions: Transaction[], month?: string): Transaction[] {
  if (!month) {
    const now = new Date();
    month = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  }
  return transactions.filter(t => {
    const d = new Date(t.date);
    const m = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    return m === month;
  });
}

type SpendingType = 'income' | 'expense';

interface FinanceContextType {
  state: FinanceState;
  isLoaded: boolean;
  loadError: string | null;
  retryLoad: () => void;
  addTransaction: (data: Omit<Transaction, 'id' | 'createdAt'>) => Promise<void>;
  updateTransaction: (id: string, data: Partial<Omit<Transaction, 'id' | 'createdAt'>>) => Promise<void>;
  deleteTransaction: (id: string) => Promise<void>;
  addCategory: (data: Omit<Category, 'id'>) => Promise<void>;
  updateCategory: (id: string, data: Partial<Omit<Category, 'id'>>) => Promise<void>;
  deleteCategory: (id: string) => Promise<void>;
  addBudget: (data: Omit<Budget, 'id'>) => Promise<void>;
  updateBudget: (id: string, data: Partial<Omit<Budget, 'id'>>) => Promise<void>;
  deleteBudget: (id: string) => Promise<void>;
  addGoal: (data: Omit<Goal, 'id'>) => Promise<void>;
  updateGoal: (id: string, data: Partial<Omit<Goal, 'id'>>) => Promise<void>;
  deleteGoal: (id: string) => Promise<void>;
  addAccount: (data: Omit<Account, 'id'>) => Promise<void>;
  updateAccount: (id: string, data: Partial<Omit<Account, 'id'>>) => Promise<void>;
  deleteAccount: (id: string) => Promise<void>;
  getBalance: () => number;
  getTotalIncome: (month?: string) => number;
  getTotalExpenses: (month?: string) => number;
  getSpendingByCategory: (type: SpendingType, month?: string) => { categoryId: string; categoryName: string; total: number; color: string }[];
  getBudgetStatus: (budgetId: string, month?: string) => { spent: number; limit: number; percentage: number; isOver: boolean };
  budgetAlerts: { categoryName: string; spent: number; limit: number }[];
}

const FinanceContext = createContext<FinanceContextType | null>(null);

export function FinanceProvider({ children }: { children: React.ReactNode }) {
  const { showToast } = useToast();
  const [state, setState] = useState<FinanceState>({
    transactions: [],
    categories: [],
    budgets: [],
    goals: [],
    accounts: [],
    currency: '€',
  });
  const [isLoaded, setIsLoaded] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);

  const loadData = useCallback(() => {
    setIsLoaded(false);
    setLoadError(null);

    Promise.all([
      api<Transaction[]>('/api/transactions'),
      api<Category[]>('/api/categories'),
      api<Budget[]>('/api/budgets'),
      api<Goal[]>('/api/goals'),
      api<Account[]>('/api/accounts'),
    ]).then(([transactions, categories, budgets, goals, accounts]) => {
      setState({
        transactions,
        categories,
        budgets,
        goals,
        accounts,
        currency: '€',
      });
      setIsLoaded(true);
      setLoadError(null);
    }).catch((err) => {
      console.error('Failed to load data:', err);
      setLoadError('Не вдалось завантажити дані. Перевірте підключення до бази даних.');
      setIsLoaded(true);
    });
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // --- Transactions ---
  const addTransaction = useCallback(async (data: Omit<Transaction, 'id' | 'createdAt'>) => {
    try {
      const t = await api<Transaction>('/api/transactions', {
        method: 'POST',
        body: JSON.stringify(data),
      });
      setState(prev => {
        const newAccounts = [...prev.accounts];
        if (data.accountId) {
          const idx = newAccounts.findIndex(a => a.id === data.accountId);
          if (idx !== -1) {
            if (data.type === 'income' || data.type === 'adjustment') {
              newAccounts[idx] = { ...newAccounts[idx], balance: newAccounts[idx].balance + data.amount };
            } else if (data.type === 'expense') {
              newAccounts[idx] = { ...newAccounts[idx], balance: newAccounts[idx].balance - data.amount };
            } else if (data.type === 'transfer') {
              newAccounts[idx] = { ...newAccounts[idx], balance: newAccounts[idx].balance - data.amount };
              if (data.toAccountId) {
                const toIdx = newAccounts.findIndex(a => a.id === data.toAccountId);
                if (toIdx !== -1) {
                  newAccounts[toIdx] = { ...newAccounts[toIdx], balance: newAccounts[toIdx].balance + data.amount };
                }
              }
            }
          }
        }
        return { ...prev, transactions: [t, ...prev.transactions], accounts: newAccounts };
      });
      const labels: Record<string, string> = {
        income: 'Дохід додано',
        expense: 'Витрату додано',
        transfer: 'Переказ виконано',
        adjustment: 'Коригування додано',
      };
      showToast(labels[data.type] || 'Транзакцію додано', 'success');
    } catch (e) {
      console.error('addTransaction error:', e);
      showToast('Помилка при додаванні транзакції', 'error');
    }
  }, [showToast]);

  const updateTransaction = useCallback(async (id: string, data: Partial<Omit<Transaction, 'id' | 'createdAt'>>) => {
    try {
      const t = await api<Transaction>(`/api/transactions/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      });
      setState(prev => ({
        ...prev,
        transactions: prev.transactions.map(x => x.id === id ? t : x),
      }));
      showToast('Транзакцію оновлено', 'success');
    } catch (e) {
      console.error('updateTransaction error:', e);
      showToast('Помилка при оновленні транзакції', 'error');
    }
  }, [showToast]);

  const deleteTransaction = useCallback(async (id: string) => {
    try {
      const existing = state.transactions.find(t => t.id === id);
      await api(`/api/transactions/${id}`, { method: 'DELETE' });
      setState(prev => {
        const newAccounts = [...prev.accounts];
        if (existing?.accountId) {
          const idx = newAccounts.findIndex(a => a.id === existing.accountId);
          if (idx !== -1) {
            if (existing.type === 'income' || existing.type === 'adjustment') {
              newAccounts[idx] = { ...newAccounts[idx], balance: newAccounts[idx].balance - existing.amount };
            } else if (existing.type === 'expense') {
              newAccounts[idx] = { ...newAccounts[idx], balance: newAccounts[idx].balance + existing.amount };
            } else if (existing.type === 'transfer') {
              newAccounts[idx] = { ...newAccounts[idx], balance: newAccounts[idx].balance + existing.amount };
              if (existing.toAccountId) {
                const toIdx = newAccounts.findIndex(a => a.id === existing.toAccountId);
                if (toIdx !== -1) {
                  newAccounts[toIdx] = { ...newAccounts[toIdx], balance: newAccounts[toIdx].balance - existing.amount };
                }
              }
            }
          }
        }
        return {
          ...prev,
          transactions: prev.transactions.filter(x => x.id !== id),
          accounts: newAccounts,
        };
      });
      showToast('Транзакцію видалено', 'success');
    } catch (e) {
      console.error('deleteTransaction error:', e);
      showToast('Помилка при видаленні транзакції', 'error');
    }
  }, [showToast, state.transactions]);

  // --- Categories ---
  const addCategory = useCallback(async (data: Omit<Category, 'id'>) => {
    try {
      const c = await api<Category>('/api/categories', {
        method: 'POST',
        body: JSON.stringify(data),
      });
      setState(prev => ({ ...prev, categories: [...prev.categories, c] }));
      showToast('Категорію додано', 'success');
    } catch (e) {
      console.error('addCategory error:', e);
      showToast('Помилка при додаванні категорії', 'error');
    }
  }, [showToast]);

  const updateCategory = useCallback(async (id: string, data: Partial<Omit<Category, 'id'>>) => {
    try {
      const c = await api<Category>(`/api/categories/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      });
      setState(prev => ({
        ...prev,
        categories: prev.categories.map(x => x.id === id ? c : x),
      }));
      showToast('Категорію оновлено', 'success');
    } catch (e) {
      console.error('updateCategory error:', e);
      showToast('Помилка при оновленні категорії', 'error');
    }
  }, [showToast]);

  const deleteCategory = useCallback(async (id: string) => {
    try {
      await api(`/api/categories/${id}`, { method: 'DELETE' });
      setState(prev => ({
        ...prev,
        categories: prev.categories.filter(x => x.id !== id),
        transactions: prev.transactions.filter(x => x.categoryId !== id),
        budgets: prev.budgets.filter(x => x.categoryId !== id),
      }));
      showToast('Категорію видалено', 'success');
    } catch (e) {
      console.error('deleteCategory error:', e);
      showToast('Помилка при видаленні категорії', 'error');
    }
  }, [showToast]);

  // --- Budgets ---
  const addBudget = useCallback(async (data: Omit<Budget, 'id'>) => {
    try {
      const b = await api<Budget>('/api/budgets', {
        method: 'POST',
        body: JSON.stringify(data),
      });
      setState(prev => {
        const exists = prev.budgets.find(x => x.categoryId === b.categoryId);
        if (exists) {
          return { ...prev, budgets: prev.budgets.map(x => x.categoryId === b.categoryId ? b : x) };
        }
        return { ...prev, budgets: [...prev.budgets, b] };
      });
      showToast('Бюджет створено', 'success');
    } catch (e) {
      console.error('addBudget error:', e);
      showToast('Помилка при створенні бюджету', 'error');
    }
  }, [showToast]);

  const updateBudget = useCallback(async (id: string, data: Partial<Omit<Budget, 'id'>>) => {
    try {
      const b = await api<Budget>(`/api/budgets/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      });
      setState(prev => ({
        ...prev,
        budgets: prev.budgets.map(x => x.id === id ? b : x),
      }));
      showToast('Бюджет оновлено', 'success');
    } catch (e) {
      console.error('updateBudget error:', e);
      showToast('Помилка при оновленні бюджету', 'error');
    }
  }, [showToast]);

  const deleteBudget = useCallback(async (id: string) => {
    try {
      await api(`/api/budgets/${id}`, { method: 'DELETE' });
      setState(prev => ({
        ...prev,
        budgets: prev.budgets.filter(x => x.id !== id),
      }));
      showToast('Бюджет видалено', 'success');
    } catch (e) {
      console.error('deleteBudget error:', e);
      showToast('Помилка при видаленні бюджету', 'error');
    }
  }, [showToast]);

  // --- Goals ---
  const addGoal = useCallback(async (data: Omit<Goal, 'id'>) => {
    try {
      const g = await api<Goal>('/api/goals', {
        method: 'POST',
        body: JSON.stringify(data),
      });
      setState(prev => ({ ...prev, goals: [...prev.goals, g] }));
      showToast('Ціль створено', 'success');
    } catch (e) {
      console.error('addGoal error:', e);
      showToast('Помилка при створенні цілі', 'error');
    }
  }, [showToast]);

  const updateGoal = useCallback(async (id: string, data: Partial<Omit<Goal, 'id'>>) => {
    try {
      const g = await api<Goal>(`/api/goals/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      });
      setState(prev => ({
        ...prev,
        goals: prev.goals.map(x => x.id === id ? g : x),
      }));
      showToast('Прогрес оновлено', 'success');
    } catch (e) {
      console.error('updateGoal error:', e);
      showToast('Помилка при оновленні цілі', 'error');
    }
  }, [showToast]);

  const deleteGoal = useCallback(async (id: string) => {
    try {
      await api(`/api/goals/${id}`, { method: 'DELETE' });
      setState(prev => ({
        ...prev,
        goals: prev.goals.filter(x => x.id !== id),
      }));
      showToast('Ціль видалено', 'success');
    } catch (e) {
      console.error('deleteGoal error:', e);
      showToast('Помилка при видаленні цілі', 'error');
    }
  }, [showToast]);

  // --- Accounts ---
  const addAccount = useCallback(async (data: Omit<Account, 'id'>) => {
    try {
      const a = await api<Account>('/api/accounts', {
        method: 'POST',
        body: JSON.stringify(data),
      });
      setState(prev => ({ ...prev, accounts: [...prev.accounts, a] }));
      showToast('Рахунок створено', 'success');
    } catch (e) {
      console.error('addAccount error:', e);
      showToast('Помилка при створенні рахунку', 'error');
    }
  }, [showToast]);

  const updateAccount = useCallback(async (id: string, data: Partial<Omit<Account, 'id'>>) => {
    try {
      const a = await api<Account>(`/api/accounts/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      });
      setState(prev => ({
        ...prev,
        accounts: prev.accounts.map(x => x.id === id ? a : x),
      }));
      showToast('Рахунок оновлено', 'success');
    } catch (e) {
      console.error('updateAccount error:', e);
      showToast('Помилка при оновленні рахунку', 'error');
    }
  }, [showToast]);

  const deleteAccount = useCallback(async (id: string) => {
    try {
      await api(`/api/accounts/${id}`, { method: 'DELETE' });
      setState(prev => ({
        ...prev,
        accounts: prev.accounts.filter(x => x.id !== id),
      }));
      showToast('Рахунок видалено', 'success');
    } catch (e) {
      console.error('deleteAccount error:', e);
      showToast('Помилка при видаленні рахунку', 'error');
    }
  }, [showToast]);

  // --- Computed ---
  const getBalance = useCallback(() => {
    return state.accounts.reduce((acc, a) => acc + a.balance, 0);
  }, [state.accounts]);

  const getTotalIncome = useCallback((month?: string) => {
    return filterByMonth(state.transactions, month)
      .filter(t => t.type === 'income')
      .reduce((acc, t) => acc + t.amount, 0);
  }, [state.transactions]);

  const getTotalExpenses = useCallback((month?: string) => {
    return filterByMonth(state.transactions, month)
      .filter(t => t.type === 'expense')
      .reduce((acc, t) => acc + t.amount, 0);
  }, [state.transactions]);

  const getSpendingByCategory = useCallback((type: SpendingType, month?: string) => {
    const filtered = filterByMonth(state.transactions, month).filter(t => t.type === type);
    const map = new Map<string, number>();
    for (const t of filtered) {
      if (t.categoryId) {
        map.set(t.categoryId, (map.get(t.categoryId) || 0) + t.amount);
      }
    }
    return Array.from(map.entries())
      .map(([categoryId, total]) => {
        const cat = state.categories.find(c => c.id === categoryId);
        return {
          categoryId,
          categoryName: cat?.name || 'Невідома',
          total,
          color: cat?.color || '#6b7280',
        };
      })
      .sort((a, b) => b.total - a.total);
  }, [state.transactions, state.categories]);

  const getBudgetStatus = useCallback((budgetId: string, month?: string) => {
    const budget = state.budgets.find(b => b.id === budgetId);
    if (!budget) return { spent: 0, limit: 0, percentage: 0, isOver: false };

    const spent = filterByMonth(state.transactions, month)
      .filter(t => t.categoryId === budget.categoryId && t.type === 'expense')
      .reduce((acc, t) => acc + t.amount, 0);

    const percentage = budget.amount > 0 ? (spent / budget.amount) * 100 : 0;

    return {
      spent,
      limit: budget.amount,
      percentage: Math.min(percentage, 100),
      isOver: spent > budget.amount,
    };
  }, [state.transactions, state.budgets]);

  const budgetAlerts = React.useMemo(() => {
    if (!isLoaded) return [];
    return state.budgets
      .map(b => {
        const status = getBudgetStatus(b.id);
        const cat = state.categories.find(c => c.id === b.categoryId);
        return { ...status, categoryName: cat?.name || 'Невідома' };
      })
      .filter(s => s.isOver);
  }, [state, isLoaded, getBudgetStatus]);

  const value: FinanceContextType = {
    state,
    isLoaded,
    loadError,
    retryLoad: loadData,
    addTransaction,
    updateTransaction,
    deleteTransaction,
    addCategory,
    updateCategory,
    deleteCategory,
    addBudget,
    updateBudget,
    deleteBudget,
    addGoal,
    updateGoal,
    deleteGoal,
    addAccount,
    updateAccount,
    deleteAccount,
    getBalance,
    getTotalIncome,
    getTotalExpenses,
    getSpendingByCategory,
    getBudgetStatus,
    budgetAlerts,
  };

  return (
    <FinanceContext.Provider value={value}>
      {children}
    </FinanceContext.Provider>
  );
}

export function useFinance(): FinanceContextType {
  const context = useContext(FinanceContext);
  if (!context) throw new Error('useFinance must be used within FinanceProvider');
  return context;
}
