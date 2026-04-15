import { Category } from './types';

export const DEFAULT_EXPENSE_CATEGORIES: Omit<Category, 'id'>[] = [
  { name: 'Оренда житла', icon: 'Home', type: 'expense', color: '#ef4444' },
  { name: 'Продукти', icon: 'ShoppingCart', type: 'expense', color: '#f97316' },
  { name: 'Кафе / їжа', icon: 'Coffee', type: 'expense', color: '#eab308' },
  { name: 'Спортзал', icon: 'Dumbbell', type: 'expense', color: '#22c55e' },
  { name: 'Протеїн / добавки', icon: 'Pill', type: 'expense', color: '#14b8a6' },
  { name: 'Транспорт', icon: 'Bus', type: 'expense', color: '#3b82f6' },
  { name: 'Підписки', icon: 'CreditCard', type: 'expense', color: '#8b5cf6' },
  { name: 'Побутові покупки', icon: 'ShoppingBag', type: 'expense', color: '#ec4899' },
  { name: 'Одяг', icon: 'Shirt', type: 'expense', color: '#f43f5e' },
  { name: 'Інші витрати', icon: 'MoreHorizontal', type: 'expense', color: '#6b7280' },
];

export const DEFAULT_INCOME_CATEGORIES: Omit<Category, 'id'>[] = [
  { name: 'Зарплата', icon: 'Banknote', type: 'income', color: '#22c55e' },
  { name: 'Фріланс', icon: 'Laptop', type: 'income', color: '#3b82f6' },
  { name: 'Інвестиції', icon: 'TrendingUp', type: 'income', color: '#8b5cf6' },
  { name: 'Подарунки', icon: 'Gift', type: 'income', color: '#ec4899' },
  { name: 'Інші доходи', icon: 'Plus', type: 'income', color: '#6b7280' },
];

export const ICON_OPTIONS = [
  'Home', 'ShoppingCart', 'Coffee', 'Dumbbell', 'Pill', 'Bus',
  'CreditCard', 'ShoppingBag', 'Shirt', 'MoreHorizontal', 'Banknote',
  'Laptop', 'TrendingUp', 'Gift', 'Plus', 'Heart', 'Star', 'Zap',
  'Music', 'Book', 'Camera', 'Phone', 'Wifi', 'Globe', 'Briefcase',
  'GraduationCap', 'Plane', 'Car', 'Bike', 'Utensils', 'Wine',
  'Gamepad2', 'Tv', 'Dog', 'Baby', 'Stethoscope',
];

export const COLOR_OPTIONS = [
  '#ef4444', '#f97316', '#eab308', '#22c55e', '#14b8a6',
  '#3b82f6', '#6366f1', '#8b5cf6', '#ec4899', '#f43f5e',
  '#6b7280', '#84cc16', '#06b6d4', '#a855f7', '#fb923c',
];
