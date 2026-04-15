import 'dotenv/config';
import { PrismaClient } from '../src/generated/prisma/client';

const prisma = new PrismaClient();

const EXPENSE_CATEGORIES = [
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

const INCOME_CATEGORIES = [
  { name: 'Зарплата', icon: 'Banknote', type: 'income', color: '#22c55e' },
  { name: 'Фріланс', icon: 'Laptop', type: 'income', color: '#3b82f6' },
  { name: 'Інвестиції', icon: 'TrendingUp', type: 'income', color: '#8b5cf6' },
  { name: 'Подарунки', icon: 'Gift', type: 'income', color: '#ec4899' },
  { name: 'Інші доходи', icon: 'Plus', type: 'income', color: '#6b7280' },
];

async function main() {
  const count = await prisma.category.count();
  if (count > 0) {
    console.log(`Database already has ${count} categories, skipping seed.`);
    return;
  }

  const all = [...EXPENSE_CATEGORIES, ...INCOME_CATEGORIES];

  for (const cat of all) {
    await prisma.category.create({ data: cat });
  }

  console.log(`Seeded ${all.length} default categories.`);
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
