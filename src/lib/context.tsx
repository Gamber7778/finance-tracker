'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { FinanceState, Transaction, Category, Budget, Goal, TransactionType } from './types';
import * as store from './store';

interface FinanceContextType {
  state: FinanceState;
  isLoaded: boolean;
  addTransaction: (data: Omit<Transaction, 'id' | 'createdAt'>) => void;
  updateTransaction: (id: string, data: Partial<Omit<Transaction, 'id' | 'createdAt'>>) => void;
  deleteTransaction: (id: string) => void;
  addCategory: (data: Omit<Category, 'id'>) => void;
  updateCategory: (id: string, data: Partial<Omit<Category, 'id'>>) => void;
  deleteCategory: (id: string) => void;
  addBudget: (data: Omit<Budget, 'id'>) => void;
  updateBudget: (id: string, data: Partial<Omit<Budget, 'id'>>) => void;
  deleteBudget: (id: string) => void;
  addGoal: (data: Omit<Goal, 'id'>) => void;
  updateGoal: (id: string, data: Partial<Omit<Goal, 'id'>>) => void;
  deleteGoal: (id: string) => void;
  getBalance: () => number;
  getTotalIncome: (month?: string) => number;
  getTotalExpenses: (month?: string) => number;
  getSpendingByCategory: (type: TransactionType, month?: string) => ReturnType<typeof store.getSpendingByCategory>;
  getBudgetStatus: (budgetId: string, month?: string) => ReturnType<typeof store.getBudgetStatus>;
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
    setState(store.loadState());
    setIsLoaded(true);
  }, []);

  const budgetAlerts = React.useMemo(() => {
    if (!isLoaded) return [];
    return state.budgets
      .map(b => {
        const status = store.getBudgetStatus(state, b.id);
        const cat = state.categories.find(c => c.id === b.categoryId);
        return { ...status, categoryName: cat?.name || 'Невідома' };
      })
      .filter(s => s.isOver);
  }, [state, isLoaded]);

  const value: FinanceContextType = {
    state,
    isLoaded,
    addTransaction: useCallback((data) => setState(prev => store.addTransaction(prev, data)), []),
    updateTransaction: useCallback((id, data) => setState(prev => store.updateTransaction(prev, id, data)), []),
    deleteTransaction: useCallback((id) => setState(prev => store.deleteTransaction(prev, id)), []),
    addCategory: useCallback((data) => setState(prev => store.addCategory(prev, data)), []),
    updateCategory: useCallback((id, data) => setState(prev => store.updateCategory(prev, id, data)), []),
    deleteCategory: useCallback((id) => setState(prev => store.deleteCategory(prev, id)), []),
    addBudget: useCallback((data) => setState(prev => store.addBudget(prev, data)), []),
    updateBudget: useCallback((id, data) => setState(prev => store.updateBudget(prev, id, data)), []),
    deleteBudget: useCallback((id) => setState(prev => store.deleteBudget(prev, id)), []),
    addGoal: useCallback((data) => setState(prev => store.addGoal(prev, data)), []),
    updateGoal: useCallback((id, data) => setState(prev => store.updateGoal(prev, id, data)), []),
    deleteGoal: useCallback((id) => setState(prev => store.deleteGoal(prev, id)), []),
    getBalance: useCallback(() => store.getBalance(state), [state]),
    getTotalIncome: useCallback((month?: string) => store.getTotalIncome(state, month), [state]),
    getTotalExpenses: useCallback((month?: string) => store.getTotalExpenses(state, month), [state]),
    getSpendingByCategory: useCallback((type: TransactionType, month?: string) => store.getSpendingByCategory(state, type, month), [state]),
    getBudgetStatus: useCallback((budgetId: string, month?: string) => store.getBudgetStatus(state, budgetId, month), [state]),
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
