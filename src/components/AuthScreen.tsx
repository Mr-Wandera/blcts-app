import { useState } from 'react';
import { Building2, Eye, EyeOff, LogIn, Shield, Lock } from 'lucide-react';
import type { User } from '../types';

const DEMO_ACCOUNTS: (User & { password: string })[] = [
  { id: 'demo-admin-001', name: 'Admin User', email: 'admin@blcts.ke', password: 'admin123', role: 'Administrator', organization: 'BLCTS HQ' },
  { id: 'demo-owner-001', name: 'James Kariuki', email: 'owner@blcts.ke', password: 'owner123', role: 'Building Owner', organization: 'Nairobi Properties Ltd' },
  { id: 'demo-fm-001', name: 'Grace Wanjiku', email: 'fm@blcts.ke', password: 'fm123', role: 'Facility Manager', organization: 'FM Services Kenya' },
];

const ROLE_STYLES: Record<string, { border: string; badge: string; dot: string }> = {
  Administrator: {
    border: 'border-violet-200 dark:border-violet-800/50 hover:border-violet-300 dark:hover:border-violet-700',
    badge: 'bg-violet-100 text-violet-700 dark:bg-violet-950/40 dark:text-violet-300',
    dot: 'bg-violet-500',
  },
  'Building Owner': {
    border: 'border-blue-200 dark:border-blue-800/50 hover:border-blue-300 dark:hover:border-blue-700',
    badge: 'bg-blue-100 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300',
    dot: 'bg-blue-500',
  },
  'Facility Manager': {
    border: 'border-emerald-200 dark:border-emerald-800/50 hover:border-emerald-300 dark:hover:border-emerald-700',
    badge: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300',
    dot: 'bg-emerald-500',
  },
};

interface Props {
  onLogin: (user: User) => void;
}

export function AuthScreen({ onLogin }: Props) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    setTimeout(() => {
      const match = DEMO_ACCOUNTS.find(
        a => a.email.toLowerCase() === email.trim().toLowerCase() && a.password === password
      );
      if (!match) {
        setError('Invalid email or password.');
        setLoading(false);
        return;
      }
      const user: User = { id: match.id, name: match.name, email: match.email, role: match.role, organization: match.organization };
      localStorage.setItem('blcts_user', JSON.stringify(user));
      onLogin(user);
      setLoading(false);
    }, 400);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0a0f1e] p-4 relative overflow-hidden">
      {/* Background elements */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute inset-0 bg-[linear-gradient(rgba(16,185,129,0.04)_1px,transparent_1px),linear-gradient(90deg,rgba(16,185,129,0.04)_1px,transparent_1px)] bg-[size:48px_48px]" />
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-emerald-500/6 rounded-full blur-[120px]" />
        <div className="absolute bottom-1/4 right-1/4 w-[300px] h-[200px] bg-blue-500/5 rounded-full blur-[80px]" />
      </div>

      <div className="relative w-full max-w-md animate-fade-in">
        {/* Brand */}
        <div className="flex flex-col items-center mb-8">
          <div className="relative mb-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-500 to-emerald-700 flex items-center justify-center shadow-xl shadow-emerald-600/30">
              <Building2 className="w-7 h-7 text-white" strokeWidth={2} />
            </div>
            <div className="absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full bg-emerald-400 border-2 border-[#0a0f1e] animate-pulse" />
          </div>
          <h1 className="text-2xl font-black text-white tracking-tight">BLCTS</h1>
          <p className="text-xs text-slate-500 tracking-widest uppercase mt-1">Building Lifecycle Cost Intelligence</p>
        </div>

        {/* Form card */}
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl p-8">
          <div className="mb-6">
            <h2 className="text-lg font-bold text-white mb-1">Sign in to your account</h2>
            <p className="text-sm text-slate-400">Use your credentials or select a demo account below</p>
          </div>

          <form onSubmit={handleSubmit} noValidate className="space-y-4">
            {/* Email */}
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wide mb-1.5">
                Email address
              </label>
              <input
                id="email" type="email" autoComplete="email" required
                value={email}
                onChange={e => { setEmail(e.target.value); setError(''); }}
                placeholder="you@example.com"
                className="w-full px-3.5 py-2.5 rounded-xl border border-white/12 bg-white/6 text-white placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition"
              />
            </div>

            {/* Password */}
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wide mb-1.5">
                Password
              </label>
              <div className="relative">
                <input
                  id="password" type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password" required
                  value={password}
                  onChange={e => { setPassword(e.target.value); setError(''); }}
                  placeholder="••••••••"
                  className="w-full px-3.5 py-2.5 pr-10 rounded-xl border border-white/12 bg-white/6 text-white placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition"
                />
                <button type="button" onClick={() => setShowPassword(p => !p)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition"
                  tabIndex={-1}>
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Error */}
            {error && (
              <div className="flex items-start gap-2 text-sm text-rose-400 bg-rose-950/30 border border-rose-800/50 rounded-xl px-3.5 py-2.5">
                <span className="mt-0.5 flex-shrink-0">⚠</span>
                <span>{error}</span>
              </div>
            )}

            {/* Submit */}
            <button type="submit"
              disabled={loading || !email || !password}
              className="flex items-center justify-center gap-2 w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:bg-emerald-600/40 disabled:cursor-not-allowed text-white font-bold text-sm transition-all shadow-lg shadow-emerald-600/25 hover:-translate-y-px"
            >
              {loading
                ? <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                : <LogIn className="w-4 h-4" />}
              {loading ? 'Signing in…' : 'Sign In'}
            </button>
          </form>
        </div>

        {/* Demo accounts */}
        <div className="mt-6">
          <p className="text-center text-xs font-bold text-slate-500 uppercase tracking-widest mb-3">
            Demo Accounts — Click to autofill
          </p>
          <div className="grid grid-cols-3 gap-2.5">
            {DEMO_ACCOUNTS.map(account => {
              const styles = ROLE_STYLES[account.role];
              return (
                <button key={account.id} type="button"
                  onClick={() => { setEmail(account.email); setPassword(account.password); setError(''); }}
                  className={`group relative flex flex-col items-start gap-2 p-3 rounded-xl bg-white/4 border ${styles.border} transition-all hover:bg-white/6 text-left`}
                >
                  <div className={`absolute top-2 right-2 w-2 h-2 rounded-full ${styles.dot}`} />
                  <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider ${styles.badge}`}>
                    {account.role === 'Administrator' ? 'Admin' : account.role === 'Building Owner' ? 'Owner' : 'FM'}
                  </span>
                  <div className="w-full">
                    <p className="text-[10px] font-semibold text-slate-300 truncate group-hover:text-white transition">{account.email}</p>
                    <p className="text-[9px] text-slate-500 font-mono mt-0.5 tracking-wide">{account.password}</p>
                  </div>
                </button>
              );
            })}
          </div>

          <div className="mt-5 flex items-center gap-2 justify-center">
            <Lock className="w-3 h-3 text-slate-600" />
            <p className="text-[10px] text-slate-600 text-center">
              New accounts are created by the Administrator · Admin registration is disabled
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
