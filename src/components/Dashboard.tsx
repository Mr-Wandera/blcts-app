import React, { useState, useEffect } from 'react';
import { LayoutDashboard, Building2, Users, Package, TrendingUp, DollarSign, Wrench, FileText, ChevronRight, ArrowRight, Activity, Clock, CircleCheck as CheckCircle2, TriangleAlert as AlertTriangle, FolderOpen, Layers, Calculator, ChartBar as BarChart3, MapPin, Shield, ClipboardList, Zap, Plus } from 'lucide-react';
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer,
} from 'recharts';
import type { User, Project, MaintenanceTask } from '../types';
import { fetchTasks } from '../lib/supabase';
import { fmtKSh } from '../lib/format';
import { Badge } from './ui/Badge';

interface Props {
  user: User;
  projects: Project[];
  onNavigate: (tab: string) => void;
}

// ─── Shared primitives ────────────────────────────────────────────────────────

interface KpiProps {
  label: string;
  value: string | number;
  icon: React.ReactNode;
  trend?: string;
  trendUp?: boolean;
  sub?: string;
  color?: string;
}

function Kpi({ label, value, icon, trend, trendUp, sub, color = 'emerald' }: KpiProps) {
  const colorMap: Record<string, string> = {
    emerald: 'bg-emerald-100 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400',
    blue: 'bg-blue-100 text-blue-600 dark:bg-blue-950/40 dark:text-blue-400',
    violet: 'bg-violet-100 text-violet-600 dark:bg-violet-950/40 dark:text-violet-400',
    amber: 'bg-amber-100 text-amber-600 dark:bg-amber-950/40 dark:text-amber-400',
    rose: 'bg-rose-100 text-rose-600 dark:bg-rose-950/40 dark:text-rose-400',
    slate: 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400',
  };
  return (
    <div className="group bg-white dark:bg-[#0f1629] border border-slate-200 dark:border-white/8 rounded-2xl p-5 hover:border-slate-300 dark:hover:border-white/14 hover:shadow-md transition-all">
      <div className="flex items-start justify-between mb-4">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform ${colorMap[color] ?? colorMap.emerald}`}>
          {icon}
        </div>
        {trend && (
          <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
            trendUp ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400' : 'bg-rose-100 text-rose-700 dark:bg-rose-950/40 dark:text-rose-400'
          }`}>{trend}</span>
        )}
      </div>
      <div className="text-2xl font-black text-slate-900 dark:text-white tabular-nums leading-none mb-1">
        {value}
      </div>
      <div className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide">{label}</div>
      {sub && <div className="text-[11px] text-slate-400 dark:text-slate-500 mt-0.5">{sub}</div>}
    </div>
  );
}

function SectionCard({ title, icon, children, action, onAction }: {
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
  action?: string;
  onAction?: () => void;
}) {
  return (
    <div className="bg-white dark:bg-[#0f1629] border border-slate-200 dark:border-white/8 rounded-2xl overflow-hidden">
      <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 dark:border-white/6">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-slate-100 dark:bg-white/6 flex items-center justify-center">
            <span className="text-slate-500 dark:text-slate-400">{icon}</span>
          </div>
          <h2 className="text-sm font-bold text-slate-800 dark:text-slate-100">{title}</h2>
        </div>
        {action && onAction && (
          <button onClick={onAction} className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300 flex items-center gap-1 transition-colors">
            {action} <ChevronRight className="w-3.5 h-3.5" />
          </button>
        )}
      </div>
      <div>{children}</div>
    </div>
  );
}

// ─── Admin Dashboard ──────────────────────────────────────────────────────────

function AdminDashboard({ projects, onNavigate }: { projects: Project[]; onNavigate: (t: string) => void }) {
  const activeProjects = projects.filter(p => p.status !== 'Archived').length;

  const systemHealth = [
    { label: 'Supabase DB', status: 'Operational', color: 'emerald' },
    { label: 'Material Prices', status: '44 items', color: 'emerald' },
    { label: 'Regional Pricing', status: '10 counties', color: 'emerald' },
    { label: 'BOQ Engine', status: 'v2.0 Ready', color: 'emerald' },
    { label: 'Gemini AI', status: 'Configured', color: 'blue' },
    { label: 'Lifecycle Model', status: '30yr Active', color: 'emerald' },
  ];

  const activityLog = [
    { action: 'Material price database accessed', user: 'Administrator', time: '2 min ago', type: 'info' },
    { action: 'Regional pricing reviewed — Nairobi', user: 'Administrator', time: '1 hr ago', type: 'success' },
    { action: 'System configuration updated', user: 'Administrator', time: '3 hr ago', type: 'warning' },
    { action: 'New BOQ estimate saved', user: 'Building Owner', time: '5 hr ago', type: 'success' },
    { action: 'Maintenance task created', user: 'Facility Manager', time: '1 day ago', type: 'info' },
  ];

  const pricingData = [
    { county: 'Nairobi', base: 38000 }, { county: 'Mombasa', base: 35000 },
    { county: 'Kisumu', base: 30000 }, { county: 'Nakuru', base: 28000 },
    { county: 'Eldoret', base: 27000 }, { county: 'Thika', base: 29000 },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between flex-wrap gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Shield className="w-4 h-4 text-violet-600 dark:text-violet-400" />
            <span className="text-xs font-bold uppercase tracking-widest text-violet-600 dark:text-violet-400">Administrator</span>
          </div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white">System Dashboard</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">Platform health, pricing management, and system analytics</p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <button onClick={() => onNavigate('prices')} className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl border border-slate-300 dark:border-white/12 bg-white dark:bg-white/4 text-sm font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-white/8 transition">
            <Package className="w-4 h-4" /> Manage Prices
          </button>
          <button onClick={() => onNavigate('users')} className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-violet-600 hover:bg-violet-500 text-white text-sm font-semibold transition shadow-md shadow-violet-600/20">
            <Users className="w-4 h-4" /> Manage Users
          </button>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Kpi label="Total Projects" value={projects.length} icon={<FolderOpen className="w-5 h-5" />} color="blue" sub="All registered" />
        <Kpi label="Active Projects" value={activeProjects} icon={<Activity className="w-5 h-5" />} color="emerald" trend="+2 this week" trendUp />
        <Kpi label="System Users" value={3} icon={<Users className="w-5 h-5" />} color="violet" sub="3 roles active" />
        <Kpi label="Price Records" value={44} icon={<Package className="w-5 h-5" />} color="amber" sub="Live from Supabase" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* County pricing chart */}
        <div className="lg:col-span-2">
          <SectionCard title="Base Cost per m² by County (Standard)" icon={<BarChart3 className="w-3.5 h-3.5" />} action="Edit Prices" onAction={() => onNavigate('regions')}>
            <div className="p-4">
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={pricingData} barSize={28}>
                  <CartesianGrid strokeDasharray="3 3" stroke="currentColor" className="text-slate-100 dark:text-white/6" vertical={false} />
                  <XAxis dataKey="county" tick={{ fontSize: 11, fill: 'currentColor' }} className="text-slate-500 dark:text-slate-400" axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 10, fill: 'currentColor' }} className="text-slate-400" axisLine={false} tickLine={false} tickFormatter={v => `${(v/1000).toFixed(0)}K`} />
                  <Tooltip
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    formatter={(v: any) => fmtKSh(v as number)}
                    contentStyle={{ background: 'var(--tw-gradient-stops, #0f1629)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 12, fontSize: 12 }}
                  />
                  <Bar dataKey="base" fill="#10b981" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </SectionCard>
        </div>

        {/* System health */}
        <SectionCard title="System Health" icon={<Activity className="w-3.5 h-3.5" />}>
          <div className="p-3 space-y-1.5">
            {systemHealth.map((item, i) => (
              <div key={i} className="flex items-center justify-between px-3 py-2.5 rounded-xl hover:bg-slate-50 dark:hover:bg-white/4 transition-colors">
                <span className="text-sm text-slate-700 dark:text-slate-300 font-medium">{item.label}</span>
                <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${
                  item.color === 'emerald' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400' : 'bg-blue-100 text-blue-700 dark:bg-blue-950/40 dark:text-blue-400'
                }`}>{item.status}</span>
              </div>
            ))}
          </div>
        </SectionCard>
      </div>

      {/* Admin quick actions */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: 'Material Prices', sub: '44 items', icon: Package, tab: 'prices', color: 'blue' },
          { label: 'Regional Pricing', sub: '10 counties', icon: MapPin, tab: 'regions', color: 'emerald' },
          { label: 'User Management', sub: '3 accounts', icon: Users, tab: 'users', color: 'violet' },
          { label: 'System Settings', sub: 'Platform config', icon: Shield, tab: 'system', color: 'amber' },
        ].map(action => {
          const Icon = action.icon;
          const colorMap: Record<string, string> = {
            blue: 'bg-blue-600 hover:bg-blue-500 shadow-blue-600/20',
            emerald: 'bg-emerald-600 hover:bg-emerald-500 shadow-emerald-600/20',
            violet: 'bg-violet-600 hover:bg-violet-500 shadow-violet-600/20',
            amber: 'bg-amber-600 hover:bg-amber-500 shadow-amber-600/20',
          };
          return (
            <button key={action.tab} onClick={() => onNavigate(action.tab)}
              className={`flex flex-col items-start gap-3 p-4 rounded-2xl text-white shadow-lg transition-all hover:-translate-y-0.5 ${colorMap[action.color]}`}>
              <Icon className="w-5 h-5" />
              <div>
                <p className="text-sm font-bold">{action.label}</p>
                <p className="text-xs opacity-75">{action.sub}</p>
              </div>
            </button>
          );
        })}
      </div>

      {/* Activity log */}
      <SectionCard title="Activity Log" icon={<Clock className="w-3.5 h-3.5" />}>
        <div className="divide-y divide-slate-100 dark:divide-white/6">
          {activityLog.map((log, i) => (
            <div key={i} className="flex items-start gap-3 px-5 py-3.5 hover:bg-slate-50/50 dark:hover:bg-white/3 transition-colors">
              <div className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${
                log.type === 'success' ? 'bg-emerald-500' : log.type === 'warning' ? 'bg-amber-500' : 'bg-blue-500'
              }`} />
              <div className="flex-1 min-w-0">
                <p className="text-sm text-slate-700 dark:text-slate-300">{log.action}</p>
                <p className="text-xs text-slate-400 mt-0.5">{log.user} · {log.time}</p>
              </div>
            </div>
          ))}
        </div>
      </SectionCard>
    </div>
  );
}

// ─── Building Owner Dashboard ─────────────────────────────────────────────────

function OwnerDashboard({ user, projects, onNavigate }: Props) {
  const myProjects = projects.filter(p => p.ownerId === user.id);
  const withBlueprint = myProjects.filter(p => p.blueprintAnalysis).length;
  const withEstimate = myProjects.filter(p => p.latestBoqId).length;
  const pendingBlueprint = myProjects.filter(p => !p.blueprintAnalysis).length;

  const workflowSteps = [
    { id: 'projects', label: 'Register Project', icon: Building2, done: myProjects.length > 0, desc: 'Create your first project' },
    { id: 'blueprint', label: 'Upload Blueprint', icon: Layers, done: withBlueprint > 0, desc: 'Upload architectural drawings' },
    { id: 'estimation', label: 'Cost Estimation', icon: Calculator, done: withEstimate > 0, desc: 'Generate BOQ estimate' },
    { id: 'reports', label: 'View Reports', icon: FileText, done: withEstimate > 0, desc: 'Review & export reports' },
  ];

  const currentStep = workflowSteps.findIndex(s => !s.done);
  const nextStep = workflowSteps[currentStep === -1 ? workflowSteps.length - 1 : currentStep];

  const lifecycleData = myProjects.length > 0
    ? [
        { year: 'Y5', capex: 100, opex: 18 },
        { year: 'Y10', capex: 0, opex: 38 },
        { year: 'Y15', capex: 0, opex: 62 },
        { year: 'Y20', capex: 0, opex: 92 },
        { year: 'Y25', capex: 0, opex: 128 },
        { year: 'Y30', capex: 0, opex: 172 },
      ]
    : [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between flex-wrap gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Building2 className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            <span className="text-xs font-bold uppercase tracking-widest text-blue-600 dark:text-blue-400">Building Owner</span>
          </div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white">
            Welcome back, {user.name.split(' ')[0]}
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">Your construction cost intelligence platform</p>
        </div>
        <button onClick={() => onNavigate('projects')}
          className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white text-sm font-semibold px-4 py-2.5 rounded-xl shadow-md shadow-blue-600/20 transition-all hover:-translate-y-0.5">
          <Plus className="w-4 h-4" /> New Project
        </button>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Kpi label="Projects" value={myProjects.length} icon={<FolderOpen className="w-5 h-5" />} color="blue" sub="Registered" />
        <Kpi label="Blueprints" value={withBlueprint} icon={<Layers className="w-5 h-5" />} color="emerald" sub="Uploaded & analysed" />
        <Kpi label="Estimates" value={withEstimate} icon={<Calculator className="w-5 h-5" />} color="violet" sub="BOQ complete" />
        <Kpi label="Pending" value={pendingBlueprint} icon={<Clock className="w-5 h-5" />} color="amber" sub="Awaiting blueprint" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Project Workflow */}
        <div className="lg:col-span-2">
          <SectionCard title="Project Workflow" icon={<Zap className="w-3.5 h-3.5" />}>
            <div className="p-5">
              <div className="flex items-start gap-0 relative">
                {workflowSteps.map((step, i) => {
                  const Icon = step.icon;
                  const isActive = i === currentStep || (currentStep === -1 && i === workflowSteps.length - 1);
                  return (
                    <div key={step.id} className="flex-1 flex flex-col items-center relative">
                      {/* Connector */}
                      {i < workflowSteps.length - 1 && (
                        <div className={`absolute top-4 left-1/2 right-[-50%] h-0.5 z-0 ${step.done ? 'bg-emerald-500' : 'bg-slate-200 dark:bg-white/10'}`} />
                      )}
                      {/* Circle */}
                      <button
                        onClick={() => onNavigate(step.id)}
                        className={`relative z-10 w-8 h-8 rounded-full flex items-center justify-center mb-3 transition-all cursor-pointer ${
                          step.done
                            ? 'bg-emerald-500 shadow-md shadow-emerald-500/30 hover:bg-emerald-400'
                            : isActive
                            ? 'bg-blue-600 shadow-md shadow-blue-600/30 hover:bg-blue-500 ring-4 ring-blue-500/20'
                            : 'bg-slate-100 dark:bg-white/6 text-slate-400 dark:text-slate-500 hover:bg-slate-200 dark:hover:bg-white/10'
                        }`}
                        title={`Go to: ${step.label}`}
                      >
                        {step.done
                          ? <CheckCircle2 className="w-4 h-4 text-white" />
                          : <Icon className={`w-4 h-4 ${isActive ? 'text-white' : ''}`} />
                        }
                      </button>
                      <p className={`text-xs font-semibold text-center leading-tight ${
                        step.done ? 'text-emerald-600 dark:text-emerald-400' : isActive ? 'text-blue-600 dark:text-blue-400' : 'text-slate-400 dark:text-slate-500'
                      }`}>{step.label}</p>
                    </div>
                  );
                })}
              </div>

              {nextStep && (
                <div className="mt-5 flex items-center justify-between bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800/50 rounded-xl px-4 py-3">
                  <div>
                    <p className="text-xs font-semibold text-blue-700 dark:text-blue-400 uppercase tracking-wide">Next Step</p>
                    <p className="text-sm font-bold text-blue-800 dark:text-blue-300 mt-0.5">{nextStep.label}</p>
                    <p className="text-xs text-blue-600/70 dark:text-blue-400/70">{nextStep.desc}</p>
                  </div>
                  <button onClick={() => onNavigate(nextStep.id)}
                    className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold px-3 py-2 rounded-lg transition">
                    Start <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}
            </div>
          </SectionCard>
        </div>

        {/* Quick actions */}
        <div className="flex flex-col gap-4">
          <SectionCard title="Quick Actions" icon={<Zap className="w-3.5 h-3.5" />}>
            <div className="p-3 space-y-1.5">
              {[
                { label: 'New Project', icon: Plus, tab: 'projects', color: 'blue' },
                { label: 'Upload Blueprint', icon: Layers, tab: 'blueprint', color: 'violet' },
                { label: 'Cost Estimation', icon: Calculator, tab: 'estimation', color: 'emerald' },
                { label: 'View Reports', icon: FileText, tab: 'reports', color: 'amber' },
              ].map(a => {
                const Icon = a.icon;
                return (
                  <button key={a.tab} onClick={() => onNavigate(a.tab)}
                    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/6 hover:text-slate-900 dark:hover:text-white transition-all group">
                    <div className="w-7 h-7 rounded-lg bg-slate-100 dark:bg-white/6 group-hover:bg-blue-100 dark:group-hover:bg-blue-950/40 flex items-center justify-center transition-colors">
                      <Icon className="w-3.5 h-3.5" />
                    </div>
                    {a.label}
                    <ChevronRight className="w-3.5 h-3.5 ml-auto opacity-0 group-hover:opacity-100 transition-opacity" />
                  </button>
                );
              })}
            </div>
          </SectionCard>
        </div>
      </div>

      {/* Projects list */}
      {myProjects.length > 0 ? (
        <SectionCard title="My Projects" icon={<Building2 className="w-3.5 h-3.5" />} action="View All" onAction={() => onNavigate('projects')}>
          <div className="divide-y divide-slate-100 dark:divide-white/6">
            {myProjects.slice(0, 4).map(project => {
              const gfa = project.floorAreaPerFloor * project.floors;
              return (
                <div key={project.id} className="flex items-center gap-4 px-5 py-3.5 hover:bg-slate-50/50 dark:hover:bg-white/3 transition-colors">
                  <div className="w-9 h-9 rounded-xl bg-blue-100 dark:bg-blue-950/30 flex items-center justify-center flex-shrink-0">
                    <Building2 className="w-4.5 h-4.5 text-blue-600 dark:text-blue-400" style={{ width: 18, height: 18 }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-slate-800 dark:text-slate-100 truncate">{project.name}</p>
                    <p className="text-xs text-slate-400 mt-0.5">{project.county} · {project.buildingType} · {gfa.toLocaleString()}m²</p>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    {project.blueprintAnalysis
                      ? <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400">Blueprint ✓</span>
                      : <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-amber-100 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400">No Blueprint</span>
                    }
                    <button onClick={() => onNavigate(project.blueprintAnalysis ? 'estimation' : 'blueprint')}
                      className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-white/8 transition-colors text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </SectionCard>
      ) : (
        <div className="rounded-2xl border-2 border-dashed border-slate-200 dark:border-white/10 bg-white dark:bg-[#0f1629] p-12 text-center">
          <div className="w-16 h-16 rounded-2xl bg-blue-100 dark:bg-blue-950/30 flex items-center justify-center mx-auto mb-4">
            <Building2 className="w-8 h-8 text-blue-500" />
          </div>
          <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100 mb-2">No projects yet</h3>
          <p className="text-sm text-slate-500 dark:text-slate-400 mb-6 max-w-sm mx-auto">Register your first building project to begin the cost estimation workflow.</p>
          <button onClick={() => onNavigate('projects')}
            className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white text-sm font-semibold px-5 py-2.5 rounded-xl shadow-md shadow-blue-600/20 transition">
            <Plus className="w-4 h-4" /> Create First Project
          </button>
        </div>
      )}

      {/* Lifecycle chart (show if estimates exist) */}
      {withEstimate > 0 && lifecycleData.length > 0 && (
        <SectionCard title="Lifecycle Cost Projection (30 Years)" icon={<TrendingUp className="w-3.5 h-3.5" />}>
          <div className="p-4">
            <p className="text-xs text-slate-400 mb-3">Relative cost index — actual values from your BOQ estimates</p>
            <ResponsiveContainer width="100%" height={200}>
              <AreaChart data={lifecycleData}>
                <defs>
                  <linearGradient id="opex-grad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#3b82f6" stopOpacity={0.3} />
                    <stop offset="100%" stopColor="#3b82f6" stopOpacity={0.02} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="currentColor" className="text-slate-100 dark:text-white/6" />
                <XAxis dataKey="year" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 10 }} axisLine={false} tickLine={false} tickFormatter={v => `${v}×`} />
                <Tooltip contentStyle={{ background: '#0f1629', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 10, fontSize: 12 }} />
                <Area type="monotone" dataKey="opex" stroke="#3b82f6" fill="url(#opex-grad)" strokeWidth={2} name="Cumulative OPEX" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </SectionCard>
      )}
    </div>
  );
}

// ─── Facility Manager Dashboard ───────────────────────────────────────────────

function FMDashboard({ user, projects, onNavigate }: Props) {
  const [tasks, setTasks] = useState<MaintenanceTask[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTasks()
      .then(setTasks)
      .catch(() => setTasks([]))
      .finally(() => setLoading(false));
  }, []);

  const pending = tasks.filter(t => t.status === 'Pending').length;
  const inProgress = tasks.filter(t => t.status === 'In-Progress' || t.status === 'Assigned').length;
  const completed = tasks.filter(t => t.status === 'Completed' || t.status === 'Verified').length;
  const critical = tasks.filter(t => t.priority === 'Critical').length;

  const assignedProjects = projects.slice(0, 3);

  const maintenanceWorkflow = [
    { label: 'Create Task', done: tasks.length > 0 },
    { label: 'Assign', done: tasks.some(t => t.status !== 'Pending') },
    { label: 'In Progress', done: tasks.some(t => t.status === 'In-Progress') },
    { label: 'Complete', done: tasks.some(t => t.status === 'Completed') },
    { label: 'Verify', done: tasks.some(t => t.status === 'Verified') },
    { label: 'Cost Record', done: tasks.some(t => (t.actualCost ?? 0) > 0) },
  ];

  const taskBreakdown = [
    { status: 'Pending', count: pending, color: '#f59e0b' },
    { status: 'In Progress', count: inProgress, color: '#3b82f6' },
    { status: 'Completed', count: completed, color: '#10b981' },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between flex-wrap gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Wrench className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <span className="text-xs font-bold uppercase tracking-widest text-emerald-600 dark:text-emerald-400">Facility Manager</span>
          </div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white">
            Maintenance Dashboard
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            Welcome back, {user.name.split(' ')[0]} — {projects.length > 0 ? `${projects.length} properties assigned` : 'Select a project to get started'}
          </p>
        </div>
        <button onClick={() => onNavigate('maintenance')}
          className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-semibold px-4 py-2.5 rounded-xl shadow-md shadow-emerald-600/20 transition-all hover:-translate-y-0.5">
          <Plus className="w-4 h-4" /> New Task
        </button>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Kpi label="Total Tasks" value={loading ? '…' : tasks.length} icon={<ClipboardList className="w-5 h-5" />} color="slate" sub="All time" />
        <Kpi label="Pending" value={loading ? '…' : pending} icon={<Clock className="w-5 h-5" />} color="amber" sub="Awaiting action" />
        <Kpi label="In Progress" value={loading ? '…' : inProgress} icon={<Activity className="w-5 h-5" />} color="blue" sub="Active work orders" />
        <Kpi label="Critical" value={loading ? '…' : critical} icon={<AlertTriangle className="w-5 h-5" />} color="rose" sub="High priority" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Maintenance Workflow */}
        <div className="lg:col-span-2">
          <SectionCard title="Maintenance Lifecycle" icon={<Activity className="w-3.5 h-3.5" />}>
            <div className="p-5">
              <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
                {maintenanceWorkflow.map((step, i) => (
                  <div key={i} className="flex flex-col items-center gap-2">
                    <div className={`w-10 h-10 rounded-full border-2 flex items-center justify-center text-sm font-bold transition-all ${
                      step.done
                        ? 'bg-emerald-500 border-emerald-500 text-white shadow-md shadow-emerald-500/30'
                        : 'border-slate-200 dark:border-white/12 text-slate-400 dark:text-slate-500 bg-white dark:bg-white/4'
                    }`}>
                      {step.done ? <CheckCircle2 className="w-5 h-5" /> : <span className="text-sm">{i + 1}</span>}
                    </div>
                    <p className={`text-[10px] font-semibold text-center leading-tight ${
                      step.done ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-400 dark:text-slate-500'
                    }`}>{step.label}</p>
                  </div>
                ))}
              </div>

              {tasks.length === 0 && !loading && (
                <div className="mt-5 text-center">
                  <p className="text-sm text-slate-500 dark:text-slate-400 mb-3">No maintenance tasks yet. Create your first task to get started.</p>
                  <button onClick={() => onNavigate('maintenance')}
                    className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-semibold px-4 py-2 rounded-xl transition">
                    <Plus className="w-4 h-4" /> Create First Task
                  </button>
                </div>
              )}
            </div>
          </SectionCard>
        </div>

        {/* Task breakdown */}
        <SectionCard title="Task Breakdown" icon={<BarChart3 className="w-3.5 h-3.5" />}>
          <div className="p-4">
            {loading ? (
              <div className="flex items-center justify-center h-32">
                <div className="w-6 h-6 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
              </div>
            ) : tasks.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-32 text-center">
                <ClipboardList className="w-8 h-8 text-slate-300 dark:text-slate-600 mb-2" />
                <p className="text-sm text-slate-400">No tasks yet</p>
              </div>
            ) : (
              <div className="space-y-3">
                {taskBreakdown.map(item => (
                  <div key={item.status}>
                    <div className="flex items-center justify-between text-xs mb-1.5">
                      <span className="font-medium text-slate-600 dark:text-slate-400">{item.status}</span>
                      <span className="font-bold text-slate-700 dark:text-slate-300">{item.count}</span>
                    </div>
                    <div className="h-2 rounded-full bg-slate-100 dark:bg-white/6 overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-700"
                        style={{ width: tasks.length > 0 ? `${(item.count / tasks.length) * 100}%` : '0%', backgroundColor: item.color }}
                      />
                    </div>
                  </div>
                ))}
                <div className="pt-2 border-t border-slate-100 dark:border-white/6">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-400">Completed</span>
                    <span className="font-bold text-emerald-600 dark:text-emerald-400">{completed} / {tasks.length}</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </SectionCard>
      </div>

      {/* Recent tasks */}
      {tasks.length > 0 && (
        <SectionCard title="Recent Tasks" icon={<ClipboardList className="w-3.5 h-3.5" />} action="View All" onAction={() => onNavigate('maintenance')}>
          <div className="divide-y divide-slate-100 dark:divide-white/6">
            {tasks.slice(0, 5).map(task => (
              <div key={task.id} className="flex items-center gap-3 px-5 py-3.5 hover:bg-slate-50/50 dark:hover:bg-white/3 transition-colors">
                <div className={`w-2 h-2 rounded-full flex-shrink-0 ${
                  task.priority === 'Critical' ? 'bg-rose-500' : task.priority === 'High' ? 'bg-amber-500' : 'bg-blue-400'
                }`} />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-slate-800 dark:text-slate-100 truncate">{task.title}</p>
                  <p className="text-xs text-slate-400 mt-0.5">{task.category} · {task.priority}</p>
                </div>
                <Badge
                  label={task.status}
                  color={task.status === 'Completed' || task.status === 'Verified' ? 'green' : task.status === 'In-Progress' ? 'blue' : 'amber'}
                />
              </div>
            ))}
          </div>
        </SectionCard>
      )}

      {/* Assigned properties */}
      {assignedProjects.length > 0 && (
        <SectionCard title="Assigned Properties" icon={<Building2 className="w-3.5 h-3.5" />} action="View All" onAction={() => onNavigate('projects')}>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-4">
            {assignedProjects.map(project => (
              <div key={project.id} className="rounded-xl border border-slate-200 dark:border-white/8 bg-slate-50 dark:bg-white/4 p-4 hover:border-emerald-300 dark:hover:border-emerald-700/50 hover:shadow-sm transition-all">
                <div className="flex items-center gap-2 mb-2">
                  <Building2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  <p className="text-sm font-semibold text-slate-800 dark:text-slate-100 truncate">{project.name}</p>
                </div>
                <p className="text-xs text-slate-400">{project.county} · {project.buildingType}</p>
                <button onClick={() => onNavigate('maintenance')}
                  className="mt-3 text-xs text-emerald-600 dark:text-emerald-400 font-semibold hover:underline flex items-center gap-1">
                  Manage <ChevronRight className="w-3 h-3" />
                </button>
              </div>
            ))}
          </div>
        </SectionCard>
      )}
    </div>
  );
}

// ─── Main router ──────────────────────────────────────────────────────────────

export default function Dashboard({ user, projects, onNavigate }: Props) {
  if (user.role === 'Administrator') return <AdminDashboard projects={projects} onNavigate={onNavigate} />;
  if (user.role === 'Building Owner') return <OwnerDashboard user={user} projects={projects} onNavigate={onNavigate} />;
  return <FMDashboard user={user} projects={projects} onNavigate={onNavigate} />;
}
