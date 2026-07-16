import type { User, Project } from '../types';
import { FolderOpen, FileImage, Calculator, Wrench, FileText, TrendingUp, Building2, MapPin, ArrowRight } from 'lucide-react';

interface Props {
  user: User;
  projects: Project[];
  onNavigate: (tab: string) => void;
}

export default function Dashboard({ user, projects, onNavigate }: Props) {
  const totalProjects = projects.length;
  const analyzedProjects = projects.filter(p => p.blueprintAnalysis).length;
  const estimatedProjects = projects.filter(p => p.floorAreaPerFloor > 0).length;
  const totalArea = projects.reduce((sum, p) => sum + (p.floorAreaPerFloor * p.floors || 0), 0);

  const stats = [
    { label: 'Total Projects', value: totalProjects, icon: FolderOpen, color: 'text-blue-600 dark:text-blue-400', bg: 'bg-blue-50 dark:bg-blue-950/30' },
    { label: 'Blueprints Analyzed', value: analyzedProjects, icon: FileImage, color: 'text-violet-600 dark:text-violet-400', bg: 'bg-violet-50 dark:bg-violet-950/30' },
    { label: 'Cost Estimates', value: estimatedProjects, icon: Calculator, color: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-50 dark:bg-emerald-950/30' },
    { label: 'Total Floor Area (m²)', value: totalArea.toLocaleString(), icon: TrendingUp, color: 'text-amber-600 dark:text-amber-400', bg: 'bg-amber-50 dark:bg-amber-950/30' },
  ];

  const quickActions = [
    { label: 'Create Project', icon: FolderOpen, tab: 'projects', roles: ['Administrator', 'Building Owner'] },
    { label: 'Upload Blueprint', icon: FileImage, tab: 'blueprint', roles: ['Administrator', 'Building Owner'] },
    { label: 'Cost Estimation', icon: Calculator, tab: 'estimation', roles: ['Administrator', 'Building Owner'] },
    { label: 'Maintenance', icon: Wrench, tab: 'maintenance', roles: ['Administrator', 'Facility Manager'] },
    { label: 'View Reports', icon: FileText, tab: 'reports', roles: ['Administrator', 'Building Owner', 'Facility Manager'] },
  ].filter(a => a.roles.includes(user.role));

  return (
    <div className="space-y-6">
      {/* Welcome */}
      <div className="rounded-2xl bg-gradient-to-br from-emerald-600 to-emerald-800 p-6 sm:p-8 text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.08)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.08)_1px,transparent_1px)] bg-[size:32px_32px]" />
        <div className="relative">
          <h2 className="text-2xl font-black mb-1">Welcome back, {user.name}</h2>
          <p className="text-emerald-100 text-sm">
            {user.role} · {user.organization || 'BLCTS Platform'}
          </p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map(s => (
          <div key={s.label} className="rounded-2xl border border-slate-200 dark:border-white/8 bg-white dark:bg-[#0f1629] p-5">
            <div className={`w-10 h-10 rounded-xl ${s.bg} flex items-center justify-center mb-3`}>
              <s.icon className={`w-5 h-5 ${s.color}`} />
            </div>
            <p className="text-2xl font-black text-slate-900 dark:text-white tabular-nums">{s.value}</p>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Quick actions */}
      <div>
        <h3 className="text-sm font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-3">Quick Actions</h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          {quickActions.map(a => (
            <button
              key={a.label}
              onClick={() => onNavigate(a.tab)}
              className="group rounded-2xl border border-slate-200 dark:border-white/8 bg-white dark:bg-[#0f1629] p-4 text-left hover:border-emerald-300 dark:hover:border-emerald-800/50 hover:shadow-md transition-all"
            >
              <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                <a.icon className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
              </div>
              <p className="text-sm font-semibold text-slate-800 dark:text-slate-100">{a.label}</p>
              <div className="flex items-center gap-1 text-xs text-emerald-600 dark:text-emerald-400 mt-1 opacity-0 group-hover:opacity-100 transition">
                Open <ArrowRight className="w-3 h-3" />
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Recent projects */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide">Recent Projects</h3>
          <button onClick={() => onNavigate('projects')} className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:underline">
            View all
          </button>
        </div>
        {projects.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-300 dark:border-white/10 p-12 text-center">
            <div className="w-14 h-14 rounded-2xl bg-slate-100 dark:bg-white/5 flex items-center justify-center mx-auto mb-4">
              <Building2 className="w-7 h-7 text-slate-300 dark:text-slate-600" />
            </div>
            <p className="text-sm font-semibold text-slate-600 dark:text-slate-300 mb-1">No projects yet</p>
            <p className="text-xs text-slate-400 mb-4">Create your first project to get started</p>
            <button
              onClick={() => onNavigate('projects')}
              className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold px-4 py-2.5 rounded-xl transition shadow-sm"
            >
              <FolderOpen className="w-4 h-4" />
              Create Project
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {projects.slice(0, 6).map(p => (
              <div key={p.id} className="rounded-2xl border border-slate-200 dark:border-white/8 bg-white dark:bg-[#0f1629] p-5 hover:shadow-md transition">
                <div className="flex items-start justify-between mb-3">
                  <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950/30 flex items-center justify-center">
                    <Building2 className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                  </div>
                  {p.blueprintAnalysis ? (
                    <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400">
                      Analyzed
                    </span>
                  ) : (
                    <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-500 dark:bg-white/5 dark:text-slate-400">
                      Pending
                    </span>
                  )}
                </div>
                <p className="text-sm font-bold text-slate-800 dark:text-slate-100 truncate">{p.name}</p>
                <div className="flex items-center gap-1 text-xs text-slate-400 mt-1">
                  <MapPin className="w-3 h-3" />
                  {p.county || p.location || 'Location TBD'}
                </div>
                <div className="flex items-center gap-3 mt-3 text-xs text-slate-500 dark:text-slate-400">
                  <span>{p.buildingType}</span>
                  <span>·</span>
                  <span>{p.floors} floors</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
