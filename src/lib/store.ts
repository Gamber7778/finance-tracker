import { v4 as uuidv4 } from 'uuid';
import { FinanceState, Transaction, Category, Budget, Goal, TransactionType } from './types';
import { DEFAULT_EXPENSE_CATEGORIES, DEFAULT_INCOME_CATEGORIES } from './defaults';

const STORAGE_KEY = 'finance_tracker_data';

function getInitialState(): FinanceState {
  const categories: Category[] = [
    ...DEFAULT_EXPENSE_CATEGORIES.map(c => ({ ...c, id: uuidv4() })),
    ...DEFAULT_INCOME_CATEGORIES.map(c => ({ ...c, id: uuidv4() })),
  ];

  return {
    transactions: [],
    categories,
    budgets: [],
    goals: [],
    currency: '€',
  };
}

export function loadState(): FinanceState {
  if (typeof window === 'undefined') return getInitialState();

  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      const initial = getInitialState();
      saveState(initial);
      return initial;
    }
    return JSON.parse(raw);
  } catch {
    const initial = getInitialState();
    saveState(initial);
    return initial;
  }
}

export function saveState(state: FinanceState): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

export function addTransaction(
  state: FinanceState,
  data: Omit<Transaction, 'id' | 'createdAt'>
): FinanceState {
  const transaction: Transaction = {
    ...data,
    id: uuidv4(),
    createdAt: new Date().toISOString(),
  };
  const newState = { ...state, transactions: [transaction, ...state.transactions] };
  saveState(newState);
  return newState;
}

export function updateTransaction(
  state: FinanceState,
  id: string,
  data: Partial<Omit<Transaction, 'id' | 'createdAt'>>
): FinanceState {
  const newState = {
    ...state,
    transactions: state.transactions.map(t =>
      t.id === id ? { ...t, ...data } : t
    ),
  };
  saveState(newState);
  return newState;
}

export function deleteTransaction(state: FinanceState, id: string): FinanceState {
  const newState = {
    ...state,
    transactions: state.transactions.filter(t => t.id !== id),
  };
  saveState(newState);
  return newState;
}

export function addCategory(
  state: FinanceState,
  data: Omit<Category, 'id'>
): FinanceState {
  const category: Category = { ...data, id: uuidv4() };
  const newState = { ...state, categories: [...state.categories, category] };
  saveState(newState);
  return newState;
}

export function updateCategory(
  state: FinanceState,
  id: string,
  data: Partial<Omit<Category, 'id'>>
): FinanceState {
  const newState = {
    ...state,
    categories: state.categories.map(c =>
      c.id === id ? { ...c, ...data } : c
    ),
  };
  saveState(newState);
  return newState;
}

export function deleteCategory(state: FinanceState, id: string): FinanceState {
  const newState = {
    ...state,
    categories: state.categories.filter(c => c.id !== id),
    transactions: state.transactions.filter(t => t.categoryId !== id),
    budgets: state.budgets.filter(b => b.categoryId !== id),
  };
  saveState(newState);
  return newState;
}

export function addBudget(
  state: FinanceState,
  data: Omit<Budget, 'id'>
): FinanceState {
  const existing = state.budgets.find(b => b.categoryId === data.categoryId);
  if (existing) {
    return updateBudget(state, existing.id, data);
  }
  const budget: Budget = { ...data, id: uuidv4() };
  const newState = { ...state, budgets: [...state.budgets, budget] };
  saveState(newState);
  return newState;
}

export function updateBudget(
  state: FinanceState,
  id: string,
  data: Partial<Omit<Budget, 'id'>>
): FinanceState {
  const newState = {
    ...state,
    budgets: state.budgets.map(b =>
      b.id === id ? { ...b, ...data } : b
    ),
  };
  saveState(newState);
  return newState;
}

export function deleteBudget(state: FinanceState, id: string): FinanceState {
  const newState = {
    ...state,
    budgets: state.budgets.filter(b => b.id !== id),
  };
  saveState(newState);
  return newState;
}

export function addGoal(
  state: FinanceState,
  data: Omit<Goal, 'id'>
): FinanceState {
  const goal: Goal = { ...data, id: uuidv4() };
  const newState = { ...state, goals: [...state.goals, goal] };
  saveState(newState);
  return newState;
}

export function updateGoal(
  state: FinanceState,
  id: string,
  data: Partial<Omit<Goal, 'id'>>
): FinanceState {
  const newState = {
    ...state,
    goals: state.goals.map(g =>
      g.id === id ? { ...g, ...data } : g
    ),
  };
  saveState(newState);
  return newState;
}

export function deleteGoal(state: FinanceState, id: string): FinanceState {
  const newState = {
    ...state,
    goals: state.goals.filter(g => g.id !== id),
  };
  saveState(newState);
  return newState;
}

export function getBalance(state: FinanceState): number {
  return state.transactions.reduce((acc, t) => {
    return t.type === 'income' ? acc + t.amount : acc - t.amount;
  }, 0);
}

export function getTotalIncome(state: FinanceState, month?: string): number {
  return filterByMonth(state.transactions, month)
    .filter(t => t.type === 'income')
    .reduce((acc, t) => acc + t.amount, 0);
}

export function getTotalExpenses(state: FinanceState, month?: string): number {
  return filterByMonth(state.transactions, month)
    .filter(t => t.type === 'expense')
    .reduce((acc, t) => acc + t.amount, 0);
}

export function getSpendingByCategory(
  state: FinanceState,
  type: TransactionType,
  month?: string
): { categoryId: string; categoryName: string; total: number; color: string }[] {
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
}

export function getBudgetStatus(
  state: FinanceState,
  budgetId: string,
  month?: string
): { spent: number; limit: number; percentage: number; isOver: boolean } {
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
}

function filterByMonth(transactions: Transaction[], month?: string): Transaction[] {
  if (!month) {
    const now = new Date();
    month = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  }
  return transactions.filter(t => t.date.startsWith(month!));
}
