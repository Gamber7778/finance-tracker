export type TransactionType = 'income' | 'expense' | 'transfer' | 'adjustment';

export type AccountType = 'checking' | 'savings' | 'cash';

export interface Account {
  id: string;
  name: string;
  type: AccountType;
  icon: string;
  color: string;
  balance: number;
  includeInSpending: boolean;
  createdAt?: string;
}

export interface Category {
  id: string;
  name: string;
  icon: string;
  type: 'income' | 'expense';
  color: string;
}

export interface Transaction {
  id: string;
  amount: number;
  type: TransactionType;
  categoryId: string | null;
  description: string;
  tags: string[];
  date: string;
  createdAt: string;
  accountId: string | null;
  toAccountId: string | null;
}

export interface Budget {
  id: string;
  categoryId: string;
  amount: number;
  period: 'monthly' | 'weekly';
}

export interface Goal {
  id: string;
  name: string;
  targetAmount: number;
  currentAmount: number;
  deadline: string;
  icon: string;
  color: string;
}

export interface FinanceState {
  transactions: Transaction[];
  categories: Category[];
  budgets: Budget[];
  goals: Goal[];
  accounts: Account[];
  currency: string;
}
