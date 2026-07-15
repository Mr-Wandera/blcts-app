import { useState, type ReactNode } from 'react';
import {
  LayoutDashboard, Building2, Users, Package, Map, Settings,
  Calculator, FileText, Wrench, Layers, LogOut, Menu, X,
  Moon, Sun, ChevronRight, Bell, Search, Activity,
} from 'lucide-react';
import type { User, UserRole } from '../types';
import { Badge } from './ui/Badge';

interface NavItem {
  id: string;
  label: string;
  icon: React.ElementType;
  roles: UserRole[] | 'all';
  separator?: boolean;
}

const NAV_ITEMS: NavItem[] = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, roles: 'all' },
  { id: 'projects', label: 'Projects', icon: Building2, roles: 'all' },
  { id: 'users', label: 'Users', icon: Users, roles: ['Administrator'] },
  { id: 'prices', label: 'Material Prices', icon: Package, roles: ['Administrator'] },
  { id: 'regions', label: 'Regional Pricing', icon: Map, roles: ['Administrator'] },
  { id: 'system', label: 'System', icon: Settings, roles: ['Administrator'] },
  { id: 'blueprint', label: 'Blueprint Analysis', icon: Layers, roles: ['Building Owner'] },
  { id: 'estimation', label: 'Cost Estimation', icon: Calculator, roles: ['Building Owner'] },
  { id: 'maintenance', label: 'Maintenance', icon: Wrench, roles: ['Facility Manager'] },
  { id: 'reports', label: 'Reports', icon: FileText, roles: 'all', separator: true },
];

const ROLE_BADGE_COLOR: Record<UserRole, 'purple' | 'blue' | 'green'> = {
  Administrator: 'purple',
  'Building Owner': 'blue',
  'Facility Manager': 'green',
};

const ROLE_ACCENT: Record<UserRole, { dot: string; glow: string }> = {
  Administrator: { dot: 'bg-violet-500', glow: 'shadow-violet-500/20' },
  'Building Owner': { dot: 'bg-blue-500', glow: 'shadow-blue-500/20' },
  'Facility Manager': { dot: 'bg-emerald-500', glow: 'shadow-emerald-500/20' },
};

interface Props {
  user: User;
  activeTab: string;
  onTabChange: (tab: string) => void;
  onLogout: () => void;
  children: ReactNode;
  isDark: boolean;
  onToggleDark: () => void;
  pageTitle?: string;
}

export function Layout({ user, activeTab, onTabChange, onLogout, children, isDark, onToggleDark, pageTitle }: Props) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const visibleItems = NAV_ITEMS.filter(
    item => item.roles === 'all' || item.roles.includes(user.role)
  );

  const currentTitle = pageTitle ?? activeTab;
  const accent = ROLE_ACCENT[user.role];

  const sidebarContent = (
    <div className="flex flex-col h-full">
      {/* Brand */}
      <div className="flex items-center gap-3 px-5 pt-6 pb-5 border-b border-slate-100 dark:border-white/6">
        <div className="relative flex-shrink-0">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-700 flex items-center justify-center shadow-lg shadow-emerald-600/25">
            <Building2 className="w-[18px] h-[18px] text-white" strokeWidth={2} />
          </div>
          <div className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-400 border-2 border-white dark:border-[#0f1629] animate-pulse" />
        </div>
        <div className="min-w-0">
          <p className="text-[15px] font-black tracking-tight text-slate-900 dark:text-white leading-none">BLCTS</p>
          <p className="text-[9px] font-medium tracking-widest uppercase text-slate-400 dark:text-slate-500 mt-0.5">Cost Intelligence</p>
        </div>
      </div>

      {/* User card */}
      <div className="mx-3 mt-3 rounded-xl border border-slate-100 dark:border-white/6 bg-slate-50 dark:bg-white/4 p-3">
        <div className="flex items-center gap-3">
          <div className={`relative w-9 h-9 rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600 text-white font-bold text-sm flex items-center justify-center flex-shrink-0 shadow-md ${accent.glow}`}>
            {user.name.charAt(0).toUpperCase()}
            <div className={`absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full ${accent.dot} border-2 border-white dark:border-[#0f1629]`} />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold text-slate-800 dark:text-slate-100 truncate leading-tight">{user.name}</p>
            {user.organization && (
              <p className="text-[10px] text-slate-400 dark:text-slate-500 truncate mt-0.5">{user.organization}</p>
            )}
          </div>
        </div>
        <div className="mt-2.5">
          <Badge label={user.role} color={ROLE_BADGE_COLOR[user.role]} />
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto px-3 py-3 space-y-0.5">
        {visibleItems.map(item => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <div key={item.id}>
              {item.separator && (
                <div className="my-2 border-t border-slate-100 dark:border-white/6" />
              )}
              <button
                onClick={() => { onTabChange(item.id); setSidebarOpen(false); }}
                className={`
                  w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all
                  ${isActive
                    ? 'bg-gradient-to-r from-emerald-600 to-emerald-700 text-white shadow-md shadow-emerald-600/25'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/6 hover:text-slate-900 dark:hover:text-slate-100'
                  }
                `}
              >
                <Icon className="w-4 h-4 flex-shrink-0" strokeWidth={isActive ? 2.5 : 1.75} />
                <span className="truncate">{item.label}</span>
                {isActive && <ChevronRight className="w-3.5 h-3.5 ml-auto flex-shrink-0 opacity-70" />}
              </button>
            </div>
          );
        })}
      </nav>

      {/* Bottom actions */}
      <div className="px-3 pb-4 pt-2 border-t border-slate-100 dark:border-white/6 space-y-0.5">
        <button
          onClick={onLogout}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-slate-500 dark:text-slate-400 hover:bg-red-50 dark:hover:bg-red-950/20 hover:text-red-600 dark:hover:text-red-400 transition-all group"
        >
          <LogOut className="w-4 h-4 flex-shrink-0 group-hover:rotate-12 transition-transform" strokeWidth={1.75} />
          <span>Sign Out</span>
        </button>
      </div>
    </div>
  );

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50 dark:bg-[#0a0f1e] text-slate-900 dark:text-slate-100">

      {/* Desktop sidebar */}
      <aside className="hidden lg:flex lg:flex-col w-64 flex-shrink-0 bg-white dark:bg-[#0f1629] border-r border-slate-100 dark:border-white/6 shadow-sm z-20">
        {sidebarContent}
      </aside>

      {/* Mobile overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 lg:hidden" onClick={() => setSidebarOpen(false)}>
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" />
        </div>
      )}

      {/* Mobile sidebar */}
      <aside className={`
        fixed inset-y-0 left-0 z-50 w-72 flex flex-col
        bg-white dark:bg-[#0f1629] border-r border-slate-100 dark:border-white/6 shadow-2xl
        transform transition-transform duration-300 ease-in-out lg:hidden
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <button
          onClick={() => setSidebarOpen(false)}
          className="absolute top-3 right-3 p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-white/8 transition"
        >
          <X className="w-4 h-4" />
        </button>
        {sidebarContent}
      </aside>

      {/* Main content */}
      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">

        {/* Top bar */}
        <header className="flex items-center gap-3 px-4 sm:px-6 py-3 bg-white dark:bg-[#0f1629] border-b border-slate-100 dark:border-white/6 shadow-sm z-10 flex-shrink-0">
          <button
            onClick={() => setSidebarOpen(true)}
            className="lg:hidden flex items-center justify-center w-8 h-8 rounded-lg text-slate-500 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-white/8 transition flex-shrink-0"
          >
            <Menu className="w-5 h-5" />
          </button>

          {/* Breadcrumb */}
          <div className="flex items-center gap-1.5 min-w-0 flex-1">
            <span className="text-xs font-semibold text-slate-400 dark:text-slate-500 hidden sm:inline tracking-wide">BLCTS</span>
            <ChevronRight className="w-3.5 h-3.5 text-slate-300 dark:text-slate-700 hidden sm:block flex-shrink-0" />
            <span className="text-sm font-bold text-slate-800 dark:text-slate-100 truncate">{currentTitle}</span>
          </div>

          {/* Right section */}
          <div className="flex items-center gap-1.5 flex-shrink-0">
            {/* Search hint (desktop) */}
            <button className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/4 text-slate-400 dark:text-slate-500 text-xs hover:border-slate-300 dark:hover:border-white/20 transition">
              <Search className="w-3.5 h-3.5" />
              <span className="hidden md:block">Quick search…</span>
              <kbd className="hidden lg:block text-[10px] bg-white dark:bg-white/8 border border-slate-200 dark:border-white/10 px-1.5 py-0.5 rounded font-mono">⌘K</kbd>
            </button>

            {/* Status indicator */}
            <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/50">
              <Activity className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
              <span className="text-[10px] font-bold text-emerald-700 dark:text-emerald-400 uppercase tracking-wide">Live</span>
            </div>

            {/* Dark mode */}
            <button
              onClick={onToggleDark}
              className="flex items-center justify-center w-8 h-8 rounded-lg text-slate-500 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-white/8 transition"
            >
              {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>

            {/* Notification bell */}
            <button className="relative flex items-center justify-center w-8 h-8 rounded-lg text-slate-500 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-white/8 transition">
              <Bell className="w-4 h-4" />
              <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-emerald-500 border-2 border-white dark:border-[#0f1629]" />
            </button>

            {/* Avatar */}
            <div className="flex items-center gap-2 pl-2 border-l border-slate-100 dark:border-white/8">
              <div className={`flex items-center justify-center w-7 h-7 rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600 text-white font-bold text-xs flex-shrink-0 shadow-md ${accent.glow}`}>
                {user.name.charAt(0).toUpperCase()}
              </div>
              <span className="hidden sm:block text-xs font-semibold text-slate-600 dark:text-slate-400 max-w-[100px] truncate">{user.name}</span>
            </div>
          </div>
        </header>

        {/* Page */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
