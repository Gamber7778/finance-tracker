'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { FinanceState, Transaction, Category, Budget, Goal, TransactionType } from './types';

async function api<T>(url: string, opts?: RequestInit): Promise<T> {
  const res = await fetch(url, {
    headers: { 'Content-Type': 'application/json' },
    ...opts,
  });
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

interface FinanceContextType {
  state: FinanceState;
  isLoaded: boolean;
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
  getBalance: () => number;
  getTotalIncome: (month?: string) => number;
  getTotalExpenses: (month?: string) => number;
  getSpendingByCategory: (type: TransactionType, month?: string) => { categoryId: string; categoryName: string; total: number; color: string }[];
  getBudgetStatus: (budgetId: string, month?: string) => { spent: number; limit: number; percentage: number; isOver: boolean };
  budgetAlerts: { categoryName: string; spent: number; limit: number }[];
}

const FinanceContext = createContext<FinanceContextType | null>(null);

export function FinanceProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<FinanceState>({
    transactions: [],
    categories: [],
    budgets: [],
    goals: [],
    currency: '€',
  });
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    Promise.all([
      api<Transaction[]>('/api/transactions'),
      api<Category[]>('/api/categories'),
      api<Budget[]>('/api/budgets'),
      api<Goal[]>('/api/goals'),
    ]).then(([transactions, categories, budgets, goals]) => {
      setState({
        transactions: transactions.map(t => ({ ...t, date: t.date, createdAt: t.createdAt })),
        categories,
        budgets,
        goals: goals.map(g => ({ ...g, deadline: g.deadline })),
        currency: '€',
      });
      setIsLoaded(true);
    });
  }, []);

  // --- Transactions ---
  const addTransaction = useCallback(async (data: Omit<Transaction, 'id' | 'createdAt'>) => {
    const t = await api<Transaction>('/api/transactions', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    setState(prev => ({ ...prev, transactions: [t, ...prev.transactions] }));
  }, []);

  const updateTransaction = useCallback(async (id: string, data: Partial<Omit<Transaction, 'id' | 'createdAt'>>) => {
    const t = await api<Transaction>(`/api/transactions/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
    setState(prev => ({
      ...prev,
      transactions: prev.transactions.map(x => x.id === id ? t : x),
    }));
  }, []);

  const deleteTransaction = useCallback(async (id: string) => {
    await api(`/api/transactions/${id}`, { method: 'DELETE' });
    setState(prev => ({
      ...prev,
      transactions: prev.transactions.filter(x => x.id !== id),
    }));
  }, []);

  // --- Categories ---
  const addCategory = useCallback(async (data: Omit<Category, 'id'>) => {
    const c = await api<Category>('/api/categories', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    setState(prev => ({ ...prev, categories: [...prev.categories, c] }));
  }, []);

  const updateCategory = useCallback(async (id: string, data: Partial<Omit<Category, 'id'>>) => {
    const c = await api<Category>(`/api/categories/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
    setState(prev => ({
      ...prev,
      categories: prev.categories.map(x => x.id === id ? c : x),
    }));
  }, []);

  const deleteCategory = useCallback(async (id: string) => {
    await api(`/api/categories/${id}`, { method: 'DELETE' });
    setState(prev => ({
      ...prev,
      categories: prev.categories.filter(x => x.id !== id),
      transactions: prev.transactions.filter(x => x.categoryId !== id),
      budgets: prev.budgets.filter(x => x.categoryId !== id),
    }));
  }, []);

  // --- Budgets ---
  const addBudget = useCallback(async (data: Omit<Budget, 'id'>) => {
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
  }, []);

  const updateBudget = useCallback(async (id: string, data: Partial<Omit<Budget, 'id'>>) => {
    const b = await api<Budget>(`/api/budgets/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
    setState(prev => ({
      ...prev,
      budgets: prev.budgets.map(x => x.id === id ? b : x),
    }));
  }, []);

  const deleteBudget = useCallback(async (id: string) => {
    await api(`/api/budgets/${id}`, { method: 'DELETE' });
    setState(prev => ({
      ...prev,
      budgets: prev.budgets.filter(x => x.id !== id),
    }));
  }, []);

  // --- Goals ---
  const addGoal = useCallback(async (data: Omit<Goal, 'id'>) => {
    const g = await api<Goal>('/api/goals', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    setState(prev => ({ ...prev, goals: [...prev.goals, g] }));
  }, []);

  const updateGoal = useCallback(async (id: string, data: Partial<Omit<Goal, 'id'>>) => {
    const g = await api<Goal>(`/api/goals/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
    setState(prev => ({
      ...prev,
      goals: prev.goals.map(x => x.id === id ? g : x),
    }));
  }, []);

  const deleteGoal = useCallback(async (id: string) => {
    await api(`/api/goals/${id}`, { method: 'DELETE' });
    setState(prev => ({
      ...prev,
      goals: prev.goals.filter(x => x.id !== id),
    }));
  }, []);

  // --- Computed ---
  const getBalance = useCallback(() => {
    return state.transactions.reduce((acc, t) =>
      t.type === 'income' ? acc + t.amount : acc - t.amount, 0
    );
  }, [state.transactions]);

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

  const getSpendingByCategory = useCallback((type: TransactionType, month?: string) => {
    const filtered = filterByMonth(state.transactions, month).filter(t => t.type === type);
    const map = new Map<string, number>();
    for (const t of filtered) {
      map.set(t.categoryId, (map.get(t.categoryId) || 0) + t.amount);
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
