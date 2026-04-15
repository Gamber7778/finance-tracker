'use client';

import { useState } from 'react';
import { PiggyBank, Eye, EyeOff, LogIn } from 'lucide-react';
import { useAuth } from '@/lib/authContext';

export default function LoginScreen() {
  const { login } = useAuth();
  const [loginName, setLoginName] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!loginName.trim()) {
      setError('Введіть логін');
      return;
    }
    if (!password) {
      setError('Введіть пароль');
      return;
    }

    const success = login(loginName.trim(), password);
    if (!success) {
      setError('Невірний логін або пароль');
    }
  };

  return (
    <div className="min-h-screen bg-zinc-950 flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <div className="flex flex-col items-center mb-8">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-500/10 mb-4">
            <PiggyBank size={28} className="text-emerald-400" />
          </div>
          <h1 className="text-2xl font-bold text-white">FinTracker</h1>
          <p className="text-sm text-zinc-500 mt-1">Особисті фінанси</p>
        </div>

        <div className="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-6">
          <h2 className="text-lg font-semibold text-white mb-5 text-center">Вхід</h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm text-zinc-400 mb-1.5">Логін</label>
              <input
                type="text"
                value={loginName}
                onChange={(e) => { setLoginName(e.target.value); setError(''); }}
                placeholder="Логін"
                className="w-full rounded-xl border border-zinc-700 bg-zinc-800/50 px-4 py-2.5 text-sm text-white placeholder-zinc-600 focus:border-emerald-500 focus:outline-none transition-colors"
                autoFocus
              />
            </div>

            <div>
              <label className="block text-sm text-zinc-400 mb-1.5">Пароль</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => { setPassword(e.target.value); setError(''); }}
                  placeholder="Пароль"
                  className="w-full rounded-xl border border-zinc-700 bg-zinc-800/50 px-4 py-2.5 pr-10 text-sm text-white placeholder-zinc-600 focus:border-emerald-500 focus:outline-none transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300 transition-colors"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {error && (
              <p className="text-xs text-red-400 bg-red-500/10 rounded-lg px-3 py-2">{error}</p>
            )}

            <button
              type="submit"
              className="w-full flex items-center justify-center gap-2 rounded-xl bg-emerald-500 py-3 text-sm font-semibold text-black hover:bg-emerald-400 transition-colors"
            >
              <LogIn size={16} /> Увійти
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
