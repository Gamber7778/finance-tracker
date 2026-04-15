'use client';

import { useState, useMemo } from 'react';
import {
  BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from 'recharts';
import { useFinance } from '@/lib/context';
import { formatCurrency, getCurrentMonth, getMonthOptions, cn } from '@/lib/utils';
import DynamicIcon from '@/components/DynamicIcon';

function getDaysInMonth(monthStr: string): number {
  const [y, m] = monthStr.split('-').map(Number);
  return new Date(y, m, 0).getDate();
}

export default function StatisticsPage() {
  const { state, isLoaded, getSpendingByCategory, getTotalIncome, getTotalExpenses } = useFinance();
  const [selectedMonth, setSelectedMonth] = useState(getCurrentMonth());
  const monthOptions = getMonthOptions();

  const expensesByCategory = useMemo(
    () => getSpendingByCategory('expense', selectedMonth),
    [getSpendingByCategory, selectedMonth]
  );

  const incomeByCategory = useMemo(
    () => getSpendingByCategory('income', selectedMonth),
    [getSpendingByCategory, selectedMonth]
  );

  const monthlyTrend = useMemo(() => {
    const months: { month: string; label: string; income: number; expenses: number }[] = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date();
      d.setMonth(d.getMonth() - i);
      const m = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      const label = d.toLocaleDateString('uk-UA', { month: 'short' });
      months.push({
        month: m,
        label,
        income: getTotalIncome(m),
        expenses: getTotalExpenses(m),
      });
    }
    return months;
  }, [getTotalIncome, getTotalExpenses]);

  const dailyData = useMemo(() => {
    const expDays: Record<string, number> = {};
    const incDays: Record<string, number> = {};

    state.transactions
      .filter(t => t.date.startsWith(selectedMonth))
      .forEach(t => {
        const day = new Date(t.date).getDate().toString();
        if (t.type === 'expense') {
          expDays[day] = (expDays[day] || 0) + t.amount;
        } else {
          incDays[day] = (incDays[day] || 0) + t.amount;
        }
      });

    const daysInMonth = getDaysInMonth(selectedMonth);

    return Array.from({ length: daysInMonth }, (_, i) => ({
      day: (i + 1).toString(),
      expenses: expDays[(i + 1).toString()] || 0,
      income: incDays[(i + 1).toString()] || 0,
    }));
  }, [state.transactions, selectedMonth]);

  const totalExpenses = useMemo(() => getTotalExpenses(selectedMonth), [getTotalExpenses, selectedMonth]);
  const totalIncome = useMemo(() => getTotalIncome(selectedMonth), [getTotalIncome, selectedMonth]);

  const daysInMonth = getDaysInMonth(selectedMonth);
  const avgExpensePerDay = totalExpenses / daysInMonth;
  const avgIncomePerDay = totalIncome / daysInMonth;

  const topExpenses = useMemo(() => {
    return state.transactions
      .filter(t => t.type === 'expense' && t.date.startsWith(selectedMonth))
      .sort((a, b) => b.amount - a.amount)
      .slice(0, 5);
  }, [state.transactions, selectedMonth]);

  const topIncomes = useMemo(() => {
    return state.transactions
      .filter(t => t.type === 'income' && t.date.startsWith(selectedMonth))
      .sort((a, b) => b.amount - a.amount)
      .slice(0, 5);
  }, [state.transactions, selectedMonth]);

  if (!isLoaded) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-emerald-500 border-t-transparent" />
      </div>
    );
  }

  const tooltipStyle = {
    backgroundColor: '#18181b',
    border: '1px solid #27272a',
    borderRadius: '12px',
    fontSize: '12px',
  };

  return (
    <div className="space-y-4 lg:space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl lg:text-2xl font-bold text-white">Статистика</h1>
        <select
          value={selectedMonth}
          onChange={(e) => setSelectedMonth(e.target.value)}
          className="rounded-xl border border-zinc-700 bg-zinc-800/50 px-3 lg:px-4 py-2 lg:py-2.5 text-sm text-white focus:border-emerald-500 focus:outline-none transition-colors appearance-none cursor-pointer"
        >
          {monthOptions.map(o => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </select>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 lg:gap-4">
        <div className="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-3 lg:p-4">
          <p className="text-[11px] lg:text-xs text-zinc-500">Доходи</p>
          <p className="text-lg lg:text-xl font-bold text-emerald-400 mt-1">+{formatCurrency(totalIncome)}</p>
        </div>
        <div className="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-3 lg:p-4">
          <p className="text-[11px] lg:text-xs text-zinc-500">Витрати</p>
          <p className="text-lg lg:text-xl font-bold text-red-400 mt-1">-{formatCurrency(totalExpenses)}</p>
        </div>
        <div className="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-3 lg:p-4">
          <p className="text-[11px] lg:text-xs text-zinc-500">Різниця</p>
          <p className={cn(
            'text-lg lg:text-xl font-bold mt-1',
            totalIncome - totalExpenses >= 0 ? 'text-emerald-400' : 'text-red-400'
          )}>
            {formatCurrency(totalIncome - totalExpenses)}
          </p>
        </div>
        <div className="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-3 lg:p-4">
          <p className="text-[11px] lg:text-xs text-zinc-500">Сер. витрата / день</p>
          <p className="text-lg lg:text-xl font-bold text-red-400 mt-1">
            {formatCurrency(avgExpensePerDay)}
          </p>
          <p className="text-[10px] text-zinc-600 mt-0.5">{daysInMonth} днів</p>
        </div>
        <div className="col-span-2 lg:col-span-1 rounded-2xl border border-zinc-800 bg-zinc-900/50 p-3 lg:p-4">
          <p className="text-[11px] lg:text-xs text-zinc-500">Сер. дохід / день</p>
          <p className="text-lg lg:text-xl font-bold text-emerald-400 mt-1">
            {formatCurrency(avgIncomePerDay)}
          </p>
          <p className="text-[10px] text-zinc-600 mt-0.5">{daysInMonth} днів</p>
        </div>
      </div>

      {/* Monthly Trend */}
      <div className="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-4 lg:p-5">
        <h2 className="text-sm lg:text-base font-semibold text-white mb-4">Тренд за 6 місяців</h2>
        <div className="h-48 lg:h-56">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={monthlyTrend}>
              <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
              <XAxis dataKey="label" tick={{ fontSize: 11, fill: '#71717a' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 10, fill: '#71717a' }} axisLine={false} tickLine={false} width={45} />
              <Tooltip
                formatter={(value) => formatCurrency(Number(value))}
                contentStyle={tooltipStyle}
                itemStyle={{ color: '#fafafa' }}
              />
              <Legend
                wrapperStyle={{ fontSize: '11px', color: '#a1a1aa' }}
              />
              <Bar dataKey="income" name="Доходи" fill="#22c55e" radius={[4, 4, 0, 0]} />
              <Bar dataKey="expenses" name="Витрати" fill="#ef4444" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Expenses & Income by Category */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 lg:gap-4">
        {/* Expense Breakdown Pie */}
        <div className="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-4 lg:p-5">
          <h2 className="text-sm lg:text-base font-semibold text-white mb-4">Витрати по категоріях</h2>
          {expensesByCategory.length > 0 ? (
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="w-36 h-36 lg:w-44 lg:h-44 flex-shrink-0 mx-auto sm:mx-0">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={expensesByCategory}
                      dataKey="total"
                      nameKey="categoryName"
                      cx="50%"
                      cy="50%"
                      innerRadius={35}
                      outerRadius={65}
                      paddingAngle={2}
                      strokeWidth={0}
                    >
                      {expensesByCategory.map((entry, i) => (
                        <Cell key={i} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(value) => formatCurrency(Number(value))}
                      contentStyle={tooltipStyle}
                      itemStyle={{ color: '#fafafa' }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="flex-1 space-y-2 overflow-y-auto max-h-44">
                {expensesByCategory.map((item) => {
                  const pct = totalExpenses > 0 ? ((item.total / totalExpenses) * 100).toFixed(1) : '0';
                  return (
                    <div key={item.categoryId} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="h-2.5 w-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: item.color }} />
                        <span className="text-xs text-zinc-400">{item.categoryName}</span>
                      </div>
                      <div className="flex items-center gap-2 lg:gap-3">
                        <span className="text-[11px] text-zinc-500">{pct}%</span>
                        <span className="text-xs font-medium text-zinc-300">{formatCurrency(item.total)}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-center h-36 lg:h-44 text-zinc-600 text-sm">
              Немає даних
            </div>
          )}
        </div>

        {/* Income Breakdown Pie */}
        <div className="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-4 lg:p-5">
          <h2 className="text-sm lg:text-base font-semibold text-white mb-4">Доходи по категоріях</h2>
          {incomeByCategory.length > 0 ? (
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="w-36 h-36 lg:w-44 lg:h-44 flex-shrink-0 mx-auto sm:mx-0">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={incomeByCategory}
                      dataKey="total"
                      nameKey="categoryName"
                      cx="50%"
                      cy="50%"
                      innerRadius={35}
                      outerRadius={65}
                      paddingAngle={2}
                      strokeWidth={0}
                    >
                      {incomeByCategory.map((entry, i) => (
                        <Cell key={i} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(value) => formatCurrency(Number(value))}
                      contentStyle={tooltipStyle}
                      itemStyle={{ color: '#fafafa' }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="flex-1 space-y-2 overflow-y-auto max-h-44">
                {incomeByCategory.map((item) => {
                  const pct = totalIncome > 0 ? ((item.total / totalIncome) * 100).toFixed(1) : '0';
                  return (
                    <div key={item.categoryId} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="h-2.5 w-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: item.color }} />
                        <span className="text-xs text-zinc-400">{item.categoryName}</span>
                      </div>
                      <div className="flex items-center gap-2 lg:gap-3">
                        <span className="text-[11px] text-zinc-500">{pct}%</span>
                        <span className="text-xs font-medium text-zinc-300">{formatCurrency(item.total)}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-center h-36 lg:h-44 text-zinc-600 text-sm">
              Немає даних
            </div>
          )}
        </div>
      </div>

      {/* Daily Income & Expenses combined chart */}
      <div className="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-4 lg:p-5">
        <h2 className="text-sm lg:text-base font-semibold text-white mb-4">Доходи та витрати по днях</h2>
        <div className="h-48 lg:h-56 -ml-2">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={dailyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
              <XAxis
                dataKey="day"
                tick={{ fontSize: 9, fill: '#71717a' }}
                axisLine={false}
                tickLine={false}
                interval={2}
              />
              <YAxis tick={{ fontSize: 10, fill: '#71717a' }} axisLine={false} tickLine={false} width={40} />
              <Tooltip
                formatter={(value) => formatCurrency(Number(value))}
                contentStyle={tooltipStyle}
                itemStyle={{ color: '#fafafa' }}
                labelFormatter={(label) => `День ${label}`}
              />
              <Legend wrapperStyle={{ fontSize: '11px', color: '#a1a1aa' }} />
              <Bar dataKey="income" name="Доходи" fill="#22c55e" radius={[2, 2, 0, 0]} />
              <Bar dataKey="expenses" name="Витрати" fill="#ef4444" radius={[2, 2, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Top Expenses & Top Incomes */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 lg:gap-4">
        <div className="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-4 lg:p-5">
          <h2 className="text-sm lg:text-base font-semibold text-white mb-4">Найбільші витрати</h2>
          {topExpenses.length > 0 ? (
            <div className="space-y-2">
              {topExpenses.map((t, i) => {
                const cat = state.categories.find(c => c.id === t.categoryId);
                return (
                  <div key={t.id} className="flex items-center gap-3 rounded-xl bg-zinc-800/30 px-3 py-2.5">
                    <span className="text-xs text-zinc-600 w-4">{i + 1}</span>
                    <div
                      className="flex h-8 w-8 items-center justify-center rounded-lg flex-shrink-0"
                      style={{ backgroundColor: (cat?.color || '#6b7280') + '20' }}
                    >
                      <DynamicIcon name={cat?.icon || 'MoreHorizontal'} size={14} className="text-zinc-300" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-zinc-300">{cat?.name}</p>
                      {t.description && (
                        <p className="text-[10px] text-zinc-500 truncate">{t.description}</p>
                      )}
                    </div>
                    <p className="text-sm font-semibold text-red-400 flex-shrink-0">-{formatCurrency(t.amount)}</p>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="flex items-center justify-center h-32 text-zinc-600 text-sm">
              Немає даних
            </div>
          )}
        </div>

        <div className="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-4 lg:p-5">
          <h2 className="text-sm lg:text-base font-semibold text-white mb-4">Найбільші доходи</h2>
          {topIncomes.length > 0 ? (
            <div className="space-y-2">
              {topIncomes.map((t, i) => {
                const cat = state.categories.find(c => c.id === t.categoryId);
                return (
                  <div key={t.id} className="flex items-center gap-3 rounded-xl bg-zinc-800/30 px-3 py-2.5">
                    <span className="text-xs text-zinc-600 w-4">{i + 1}</span>
                    <div
                      className="flex h-8 w-8 items-center justify-center rounded-lg flex-shrink-0"
                      style={{ backgroundColor: (cat?.color || '#6b7280') + '20' }}
                    >
                      <DynamicIcon name={cat?.icon || 'MoreHorizontal'} size={14} className="text-zinc-300" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-zinc-300">{cat?.name}</p>
                      {t.description && (
                        <p className="text-[10px] text-zinc-500 truncate">{t.description}</p>
                      )}
                    </div>
                    <p className="text-sm font-semibold text-emerald-400 flex-shrink-0">+{formatCurrency(t.amount)}</p>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="flex items-center justify-center h-32 text-zinc-600 text-sm">
              Немає даних
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
