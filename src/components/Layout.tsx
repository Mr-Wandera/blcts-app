import { type ReactNode } from 'react';
import type { User } from '../types';
import { Building2, LogOut, Moon, Sun, LayoutDashboard, FolderOpen, FileImage, Calculator, Wrench, DollarSign, MapPin, FileText, Users, Settings } from 'lucide-react';

interface NavItem {
  id: string;
  label: string;
  icon: typeof LayoutDashboard;
  roles: string[];
}

const NAV_ITEMS: NavItem[] = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, roles: ['Administrator', 'Building Owner', 'Facility Manager'] },
  { id: 'projects', label: 'Projects', icon: FolderOpen, roles: ['Administrator', 'Building Owner', 'Facility Manager'] },
  { id: 'blueprint', label: 'Blueprint Analysis', icon: FileImage, roles: ['Administrator', 'Building Owner'] },
  { id: 'estimation', label: 'Cost Estimation', icon: Calculator, roles: ['Administrator', 'Building Owner'] },
  { id: 'maintenance', label: 'Maintenance', icon: Wrench, roles: ['Administrator', 'Facility Manager'] },
  { id: 'reports', label: 'Reports', icon: FileText, roles: ['Administrator', 'Building Owner', 'Facility Manager'] },
  { id: 'prices', label: 'Material Prices', icon: DollarSign, roles: ['Administrator'] },
  { id: 'regions', label: 'Regional Pricing', icon: MapPin, roles: ['Administrator'] },
  { id: 'users', label: 'User Management', icon: Users, roles: ['Administrator'] },
  { id: 'system', label: 'System Settings', icon: Settings, roles: ['Administrator'] },
];

const ROLE_COLORS: Record<string, string> = {
  Administrator: 'bg-violet-100 text-violet-700 dark:bg-violet-950/40 dark:text-violet-300',
  'Building Owner': 'bg-blue-100 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300',
  'Facility Manager': 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300',
};

interface Props {
  user: User | null;
  activeTab: string;
  onTabChange: (tab: string) => void;
  onLogout: () => void;
  isDark: boolean;
  onToggleDark: () => void;
  pageTitle: string;
  children: ReactNode;
}

export function Layout({ user, activeTab, onTabChange, onLogout, isDark, onToggleDark, pageTitle, children }: Props) {
  if (!user) return null;
  const visibleItems = NAV_ITEMS.filter(item => item.roles.includes(user.role));

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0a0f1e] flex">
      {/* Sidebar */}
      <aside className="w-64 flex-shrink-0 border-r border-slate-200 dark:border-white/8 bg-white dark:bg-[#0d1424] flex flex-col fixed lg:sticky top-0 h-screen z-40 transition-transform -translate-x-full lg:translate-x-0">
        {/* Logo */}
        <div className="h-16 flex items-center gap-3 px-5 border-b border-slate-200 dark:border-white/8 flex-shrink-0">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-700 flex items-center justify-center shadow-lg shadow-emerald-600/20">
            <Building2 className="w-5 h-5 text-white" />
          </div>
          <div>
            <p className="text-sm font-black text-slate-900 dark:text-white tracking-tight">BLCTS</p>
            <p className="text-[10px] text-slate-400 uppercase tracking-wider">Cost Intelligence</p>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-0.5">
          {visibleItems.map(item => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onTabChange(item.id)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400 shadow-sm'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/5 hover:text-slate-900 dark:hover:text-slate-200'
                }`}
              >
                <item.icon className={`w-4 h-4 flex-shrink-0 ${isActive ? 'text-emerald-600 dark:text-emerald-400' : ''}`} />
                <span className="truncate">{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* User */}
        <div className="p-3 border-t border-slate-200 dark:border-white/8 flex-shrink-0">
          <div className="flex items-center gap-3 px-2 py-2 mb-2">
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600 text-white font-bold text-sm flex items-center justify-center flex-shrink-0">
              {user.name.charAt(0)}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold text-slate-800 dark:text-slate-200 truncate">{user.name}</p>
              <span className={`inline-block text-[10px] font-bold px-1.5 py-0.5 rounded-full ${ROLE_COLORS[user.role]}`}>
                {user.role}
              </span>
            </div>
          </div>
          <div className="flex gap-1.5">
            <button
              onClick={onToggleDark}
              className="flex-1 flex items-center justify-center gap-1.5 px-2 py-2 rounded-lg text-xs font-medium text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/5 transition"
            >
              {isDark ? <Sun className="w-3.5 h-3.5" /> : <Moon className="w-3.5 h-3.5" />}
              {isDark ? 'Light' : 'Dark'}
            </button>
            <button
              onClick={onLogout}
              className="flex-1 flex items-center justify-center gap-1.5 px-2 py-2 rounded-lg text-xs font-medium text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition"
            >
              <LogOut className="w-3.5 h-3.5" />
              Logout
            </button>
          </div>
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 lg:ml-0 min-w-0">
        {/* Top bar */}
        <header className="h-16 border-b border-slate-200 dark:border-white/8 bg-white/80 dark:bg-[#0d1424]/80 backdrop-blur-xl sticky top-0 z-30 flex items-center justify-between px-4 sm:px-6">
          <div>
            <h1 className="text-lg font-bold text-slate-900 dark:text-white">{pageTitle}</h1>
            <p className="text-xs text-slate-400 hidden sm:block">BLCTS — Building Lifecycle Cost Tracking System</p>
          </div>
          <div className="flex items-center gap-3">
            <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${ROLE_COLORS[user.role]}`}>
              {user.role}
            </span>
          </div>
        </header>

        {/* Content */}
        <main className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
