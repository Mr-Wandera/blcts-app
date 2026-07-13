import React, { useState, useEffect } from 'react';
import { LayoutDashboard, FolderOpen, Users, Wrench, TriangleAlert as AlertTriangle, DollarSign, MapPin, FileText, Settings, ChevronRight, CircleCheck as CheckCircle2, Circle, Clock, TrendingUp, Building2, ClipboardList, ChartBar as BarChart3, ShieldCheck, ArrowRight, Activity } from 'lucide-react';
import { User, Project, MaintenanceTask } from '../types';
import { fetchTasks } from '../lib/supabase';
import { fmtKSh } from '../lib/format';
import { Badge } from './ui/Badge';
import { StepBar } from './ui/StepBar';

interface Props {
  user: User;
  projects: Project[];
  onNavigate: (tab: string) => void;
}

// ─── Shared KPI Card ─────────────────────────────────────────────────────────

interface KpiCardProps {
  label: string;
  value: string | number;
  icon: React.ReactNode;
  color: 'blue' | 'green' | 'amber' | 'red' | 'purple' | 'slate';
  sub?: string;
}

function KpiCard({ label, value, icon, color, sub }: KpiCardProps) {
  const bg: Record<string, string> = {
    blue: 'bg-blue-50 dark:bg-blue-950/30',
    green: 'bg-emerald-50 dark:bg-emerald-950/30',
    amber: 'bg-amber-50 dark:bg-amber-950/30',
    red: 'bg-red-50 dark:bg-red-950/30',
    purple: 'bg-violet-50 dark:bg-violet-950/30',
    slate: 'bg-slate-50 dark:bg-slate-800/50',
  };
  const iconBg: Record<string, string> = {
    blue: 'bg-blue-100 text-blue-600 dark:bg-blue-900/40 dark:text-blue-400',
    green: 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/40 dark:text-emerald-400',
    amber: 'bg-amber-100 text-amber-600 dark:bg-amber-900/40 dark:text-amber-400',
    red: 'bg-red-100 text-red-600 dark:bg-red-900/40 dark:text-red-400',
    purple: 'bg-violet-100 text-violet-600 dark:bg-violet-900/40 dark:text-violet-400',
    slate: 'bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-400',
  };
  const valueColor: Record<string, string> = {
    blue: 'text-blue-700 dark:text-blue-300',
    green: 'text-emerald-700 dark:text-emerald-300',
    amber: 'text-amber-700 dark:text-amber-300',
    red: 'text-red-700 dark:text-red-300',
    purple: 'text-violet-700 dark:text-violet-300',
    slate: 'text-slate-700 dark:text-slate-300',
  };

  return (
    <div className={`rounded-xl border border-slate-200 dark:border-slate-700/50 p-5 ${bg[color]} flex items-start gap-4`}>
      <div className={`flex-shrink-0 w-10 h-10 rounded-lg flex items-center justify-center ${iconBg[color]}`}>
        {icon}
      </div>
      <div className="min-w-0">
        <p className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wide">{label}</p>
        <p className={`text-2xl font-bold tabular-nums mt-0.5 ${valueColor[color]}`}>{value}</p>
        {sub && <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{sub}</p>}
      </div>
    </div>
  );
}

// ─── Quick Action Card ────────────────────────────────────────────────────────

interface ActionCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  onClick: () => void;
  color: 'blue' | 'green' | 'amber' | 'purple';
}

function ActionCard({ icon, title, description, onClick, color }: ActionCardProps) {
  const ring: Record<string, string> = {
    blue: 'hover:border-blue-300 dark:hover:border-blue-700',
    green: 'hover:border-emerald-300 dark:hover:border-emerald-700',
    amber: 'hover:border-amber-300 dark:hover:border-amber-700',
    purple: 'hover:border-violet-300 dark:hover:border-violet-700',
  };
  const iconStyles: Record<string, string> = {
    blue: 'bg-blue-100 text-blue-600 dark:bg-blue-900/40 dark:text-blue-400',
    green: 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/40 dark:text-emerald-400',
    amber: 'bg-amber-100 text-amber-600 dark:bg-amber-900/40 dark:text-amber-400',
    purple: 'bg-violet-100 text-violet-600 dark:bg-violet-900/40 dark:text-violet-400',
  };
  return (
    <button
      onClick={onClick}
      className={`group w-full text-left rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/60 p-5 transition-all hover:shadow-md ${ring[color]} focus:outline-none focus:ring-2 focus:ring-blue-500`}
    >
      <div className={`w-10 h-10 rounded-lg flex items-center justify-center mb-3 ${iconStyles[color]}`}>
        {icon}
      </div>
      <p className="font-semibold text-slate-800 dark:text-slate-100 text-sm">{title}</p>
      <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">{description}</p>
      <div className="mt-3 flex items-center text-xs font-medium text-blue-600 dark:text-blue-400 opacity-0 group-hover:opacity-100 transition-opacity">
        Open <ChevronRight className="w-3.5 h-3.5 ml-0.5" />
      </div>
    </button>
  );
}

// ─── Administrator Dashboard ──────────────────────────────────────────────────

function AdminDashboard({ user, projects, onNavigate }: Props) {
  const activeProjects = projects.filter((p) => p.status === 'Active').length;

  const workflow = [
    { title: 'Configure Material Prices', desc: 'Set per-unit prices for materials, labour, and services.', tab: 'prices', icon: <DollarSign className="w-4 h-4" /> },
    { title: 'Manage Regional Pricing', desc: 'Define county-level multipliers and base costs.', tab: 'regions', icon: <MapPin className="w-4 h-4" /> },
    { title: 'Register Buildings', desc: 'Add projects and assign facility managers.', tab: 'projects', icon: <Building2 className="w-4 h-4" /> },
    { title: 'Review Reports', desc: 'Inspect BOQ reports and cost summaries.', tab: 'reports', icon: <BarChart3 className="w-4 h-4" /> },
  ];

  const recentActivity = [
    { time: '2 hours ago', text: 'Material price database updated — Nairobi region', type: 'price' },
    { time: '5 hours ago', text: 'New project registered: Karen Residential Block', type: 'project' },
    { time: 'Yesterday', text: 'BOQ report generated for Mombasa Commercial Centre', type: 'report' },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-start justify-between flex-wrap gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <ShieldCheck className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            <span className="text-xs font-semibold uppercase tracking-widest text-blue-600 dark:text-blue-400">Administrator</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Administrator Dashboard</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">Welcome back, <span className="font-medium text-slate-700 dark:text-slate-300">{user.name}</span></p>
        </div>
      </div>

      {/* KPI Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard label="Total Projects" value={projects.length} icon={<FolderOpen className="w-5 h-5" />} color="blue" sub="All registered" />
        <KpiCard label="Total Users" value={3} icon={<Users className="w-5 h-5" />} color="purple" sub="Active accounts" />
        <KpiCard label="Active Maintenance" value={activeProjects} icon={<Wrench className="w-5 h-5" />} color="green" sub="Live projects" />
        <KpiCard label="Alerts" value={0} icon={<AlertTriangle className="w-5 h-5" />} color="amber" sub="No pending alerts" />
      </div>

      {/* Workflow Checklist */}
      <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/60 overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-100 dark:border-slate-700 flex items-center gap-2">
          <ClipboardList className="w-4 h-4 text-slate-500 dark:text-slate-400" />
          <h2 className="font-semibold text-slate-800 dark:text-slate-100 text-sm">Admin Setup Checklist</h2>
          <span className="ml-auto text-xs text-slate-400">Next steps to configure the system</span>
        </div>
        <div className="divide-y divide-slate-100 dark:divide-slate-700/50">
          {workflow.map((step, i) => (
            <button
              key={step.tab}
              onClick={() => onNavigate(step.tab)}
              className="w-full text-left flex items-center gap-4 px-5 py-4 hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors group"
            >
              <div className="w-7 h-7 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 flex items-center justify-center text-xs font-bold flex-shrink-0">
                {i + 1}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-slate-800 dark:text-slate-100">{step.title}</p>
                <p className="text-xs text-slate-500 dark:text-slate-400 truncate">{step.desc}</p>
              </div>
              <div className="flex items-center gap-2">
                {step.icon}
                <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors" />
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Quick Action Cards */}
      <div>
        <h2 className="text-sm font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wide mb-3">Quick Actions</h2>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <ActionCard
            icon={<Users className="w-5 h-5" />}
            title="Manage Users"
            description="Add, edit, or deactivate user accounts and role assignments."
            onClick={() => onNavigate('users')}
            color="purple"
          />
          <ActionCard
            icon={<DollarSign className="w-5 h-5" />}
            title="Material Prices"
            description="Update per-unit costs for construction materials and labour."
            onClick={() => onNavigate('prices')}
            color="blue"
          />
          <ActionCard
            icon={<MapPin className="w-5 h-5" />}
            title="Regional Pricing"
            description="Configure county multipliers and base cost rates."
            onClick={() => onNavigate('regions')}
            color="green"
          />
          <ActionCard
            icon={<Settings className="w-5 h-5" />}
            title="System Settings"
            description="Configure application-wide settings and preferences."
            onClick={() => onNavigate('system')}
            color="amber"
          />
        </div>
      </div>

      {/* Recent Activity */}
      <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/60 overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-100 dark:border-slate-700 flex items-center gap-2">
          <Activity className="w-4 h-4 text-slate-500 dark:text-slate-400" />
          <h2 className="font-semibold text-slate-800 dark:text-slate-100 text-sm">Recent Activity</h2>
        </div>
        <div className="divide-y divide-slate-100 dark:divide-slate-700/50">
          {recentActivity.map((item, i) => (
            <div key={i} className="flex items-start gap-3 px-5 py-3.5">
              <div className="w-2 h-2 rounded-full bg-blue-400 dark:bg-blue-500 mt-1.5 flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-sm text-slate-700 dark:text-slate-300">{item.text}</p>
                <p className="text-xs text-slate-400 mt-0.5">{item.time}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Building Owner Dashboard ─────────────────────────────────────────────────

function determineProjectStep(project: Project): number {
  // Returns 1-indexed current step (1=Register, 2=Blueprint, 3=Estimate, 4=Review BOQ, 5=Monitor, 6=Reports)
  if (!project) return 1;
  if (project.latestBoqId) return 5; // has estimate → Monitor / Reports
  if (project.blueprintAnalysis) return 3; // blueprint analysed → Estimate
  if (project.blueprintUrl) return 2; // blueprint uploaded → Get Estimate
  return 1; // just registered
}

const OWNER_STEPS = [
  { title: 'Register Project', desc: 'Add your building details to the system.', tab: 'projects' },
  { title: 'Upload Blueprint', desc: 'Upload architectural drawings for AI analysis.', tab: 'projects' },
  { title: 'Get Cost Estimate', desc: 'Run the BOQ engine to generate cost breakdown.', tab: 'estimation' },
  { title: 'Review BOQ', desc: 'Inspect the Bill of Quantities line items.', tab: 'estimation' },
  { title: 'Monitor Lifecycle', desc: 'Track maintenance and operational costs.', tab: 'maintenance' },
  { title: 'Download Reports', desc: 'Export full project cost reports.', tab: 'reports' },
];

function OwnerDashboard({ user, projects, onNavigate }: Props) {
  const myProjects = projects.filter((p) => p.ownerId === user.id || true); // show all in demo
  const withBlueprint = myProjects.filter((p) => p.blueprintUrl).length;
  const withEstimate = myProjects.filter((p) => p.latestBoqId).length;
  const pending = myProjects.filter((p) => !p.latestBoqId).length;

  // Determine overall workflow position from all projects
  const maxStep = myProjects.length > 0
    ? Math.max(...myProjects.map(determineProjectStep))
    : 0;

  const workflowSteps = OWNER_STEPS.map((s, i) => {
    const stepNum = i + 1;
    if (stepNum < maxStep) return { label: s.title, status: 'completed' as const };
    if (stepNum === maxStep) return { label: s.title, status: 'active' as const };
    return { label: s.title, status: 'pending' as const };
  });

  const projectStageLabel = (p: Project) => {
    const step = determineProjectStep(p);
    return OWNER_STEPS[step - 1]?.title ?? 'Unknown';
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 mb-1">
          <Building2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
          <span className="text-xs font-semibold uppercase tracking-widest text-emerald-600 dark:text-emerald-400">Building Owner</span>
        </div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">My Portfolio</h1>
        <p className="text-slate-500 dark:text-slate-400 mt-1">Welcome back, <span className="font-medium text-slate-700 dark:text-slate-300">{user.name}</span></p>
      </div>

      {/* KPI Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard label="Projects" value={myProjects.length} icon={<FolderOpen className="w-5 h-5" />} color="blue" sub="Registered" />
        <KpiCard label="Blueprints Uploaded" value={withBlueprint} icon={<FileText className="w-5 h-5" />} color="green" sub="Drawings on file" />
        <KpiCard label="Estimates Generated" value={withEstimate} icon={<DollarSign className="w-5 h-5" />} color="purple" sub="BOQ complete" />
        <KpiCard label="Pending Reviews" value={pending} icon={<Clock className="w-5 h-5" />} color="amber" sub="Awaiting action" />
      </div>

      {/* Workflow Journey */}
      <div className="rounded-xl border-2 border-blue-200 dark:border-blue-800/60 bg-blue-50/50 dark:bg-blue-950/20 overflow-hidden">
        <div className="px-5 py-4 border-b border-blue-200 dark:border-blue-800/60 flex items-center gap-2">
          <TrendingUp className="w-4 h-4 text-blue-600 dark:text-blue-400" />
          <h2 className="font-semibold text-blue-800 dark:text-blue-300 text-sm">Your Project Journey</h2>
          <span className="ml-auto text-xs text-blue-500 dark:text-blue-400">Follow these steps to complete your project</span>
        </div>
        <div className="px-5 py-5">
          <StepBar steps={workflowSteps} />
        </div>
        {/* Step detail cards */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-0 border-t border-blue-200 dark:border-blue-800/60 divide-x divide-blue-200 dark:divide-blue-800/60">
          {OWNER_STEPS.map((step, i) => {
            const stepNum = i + 1;
            const isDone = stepNum < maxStep;
            const isActive = stepNum === maxStep;
            return (
              <div key={i} className={`p-4 flex flex-col gap-2 ${isActive ? 'bg-blue-100/80 dark:bg-blue-900/30' : ''}`}>
                <div className="flex items-center gap-1.5">
                  {isDone ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                  ) : isActive ? (
                    <Circle className="w-4 h-4 text-blue-600 fill-blue-600 flex-shrink-0" />
                  ) : (
                    <div className="w-4 h-4 rounded-full border-2 border-slate-300 dark:border-slate-600 flex-shrink-0" />
                  )}
                  <span className={`text-[10px] font-bold uppercase tracking-wider ${isDone ? 'text-emerald-600 dark:text-emerald-400' : isActive ? 'text-blue-700 dark:text-blue-300' : 'text-slate-400 dark:text-slate-500'}`}>
                    Step {stepNum}
                  </span>
                </div>
                <p className={`text-xs font-semibold leading-tight ${isDone ? 'text-emerald-700 dark:text-emerald-400' : isActive ? 'text-blue-800 dark:text-blue-200' : 'text-slate-500 dark:text-slate-400'}`}>
                  {step.title}
                </p>
                <p className="text-[10px] text-slate-500 dark:text-slate-400 leading-snug hidden lg:block">{step.desc}</p>
                {(isActive || !isDone) && (
                  <button
                    onClick={() => onNavigate(step.tab)}
                    className={`mt-auto inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-1 rounded-md transition-colors ${
                      isActive
                        ? 'bg-blue-600 text-white hover:bg-blue-700'
                        : 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-300 dark:hover:bg-slate-600'
                    }`}
                  >
                    Go <ArrowRight className="w-3 h-3" />
                  </button>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Project Summary List */}
      <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/60 overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-100 dark:border-slate-700 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FolderOpen className="w-4 h-4 text-slate-500 dark:text-slate-400" />
            <h2 className="font-semibold text-slate-800 dark:text-slate-100 text-sm">Project Summary</h2>
          </div>
          <button
            onClick={() => onNavigate('projects')}
            className="text-xs font-medium text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-0.5"
          >
            View all <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
        {myProjects.length === 0 ? (
          <div className="px-5 py-10 text-center">
            <Building2 className="w-10 h-10 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
            <p className="text-sm font-medium text-slate-500 dark:text-slate-400">No projects yet</p>
            <button
              onClick={() => onNavigate('projects')}
              className="mt-3 inline-flex items-center gap-1.5 text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline"
            >
              Register your first building <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        ) : (
          <div className="divide-y divide-slate-100 dark:divide-slate-700/50">
            {myProjects.slice(0, 6).map((p) => (
              <div key={p.id} className="flex items-center gap-4 px-5 py-3.5 hover:bg-slate-50 dark:hover:bg-slate-700/20 transition-colors">
                <div className="w-8 h-8 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center flex-shrink-0">
                  <Building2 className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-slate-800 dark:text-slate-100 truncate">{p.name}</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">{p.location}, {p.county} · {p.buildingType}</p>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <Badge
                    label={projectStageLabel(p)}
                    color={p.latestBoqId ? 'green' : p.blueprintUrl ? 'blue' : 'amber'}
                  />
                </div>
                <button
                  onClick={() => onNavigate('projects')}
                  className="ml-1 text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Facility Manager Dashboard ───────────────────────────────────────────────

const MAINTENANCE_WORKFLOW_STEPS = [
  'Create Task',
  'Pending',
  'Assigned',
  'In Progress',
  'Completed',
  'Verified',
  'Cost Recorded',
  'Lifecycle Updated',
];

function FacilityManagerDashboard({ user, projects, onNavigate }: Props) {
  const [tasks, setTasks] = useState<MaintenanceTask[]>([]);
  const [tasksLoading, setTasksLoading] = useState(true);

  useEffect(() => {
    setTasksLoading(true);
    fetchTasks()
      .then(setTasks)
      .catch(() => setTasks([]))
      .finally(() => setTasksLoading(false));
  }, []);

  const totalTasks = tasks.length;
  const pending = tasks.filter(t => t.status === 'Pending').length;
  const inProgress = tasks.filter(t => t.status === 'In-Progress').length;
  const completed = tasks.filter(t => t.status === 'Completed' || t.status === 'Verified').length;

  const workflowSteps = MAINTENANCE_WORKFLOW_STEPS.map((label, i) => ({
    label,
    status: (i === 0 ? 'active' : 'pending') as 'completed' | 'active' | 'pending',
  }));

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 mb-1">
          <Wrench className="w-5 h-5 text-amber-600 dark:text-amber-400" />
          <span className="text-xs font-semibold uppercase tracking-widest text-amber-600 dark:text-amber-400">Facility Manager</span>
        </div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Maintenance Dashboard</h1>
        <p className="text-slate-500 dark:text-slate-400 mt-1">Welcome back, <span className="font-medium text-slate-700 dark:text-slate-300">{user.name}</span></p>
      </div>

      {/* KPI Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard label="Total Tasks" value={tasksLoading ? '…' : totalTasks} icon={<ClipboardList className="w-5 h-5" />} color="blue" sub="All time" />
        <KpiCard label="Pending" value={tasksLoading ? '…' : pending} icon={<Clock className="w-5 h-5" />} color="amber" sub="Awaiting assignment" />
        <KpiCard label="In Progress" value={tasksLoading ? '…' : inProgress} icon={<Activity className="w-5 h-5" />} color="blue" sub="Active work orders" />
        <KpiCard label="Completed" value={tasksLoading ? '…' : completed} icon={<CheckCircle2 className="w-5 h-5" />} color="green" sub="Verified & closed" />
      </div>

      {/* Maintenance Workflow */}
      <div className="rounded-xl border-2 border-amber-200 dark:border-amber-800/60 bg-amber-50/50 dark:bg-amber-950/20 overflow-hidden">
        <div className="px-5 py-4 border-b border-amber-200 dark:border-amber-800/60 flex items-center gap-2">
          <Wrench className="w-4 h-4 text-amber-600 dark:text-amber-400" />
          <h2 className="font-semibold text-amber-800 dark:text-amber-300 text-sm">Maintenance Workflow</h2>
          <span className="ml-auto text-xs text-amber-500 dark:text-amber-400">8-stage task lifecycle</span>
        </div>
        <div className="px-5 py-5">
          <StepBar steps={workflowSteps} compact />
        </div>
        <div className="px-5 pb-4">
          <p className="text-xs text-amber-700 dark:text-amber-400">
            Each maintenance task follows this workflow from creation through verified closure and lifecycle cost recording.
          </p>
        </div>
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="text-sm font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wide mb-3">Quick Actions</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <ActionCard
            icon={<ClipboardList className="w-5 h-5" />}
            title="Create Task"
            description="Log a new maintenance work order for any building component."
            onClick={() => onNavigate('maintenance')}
            color="amber"
          />
          <ActionCard
            icon={<Building2 className="w-5 h-5" />}
            title="View Assets"
            description="Browse building components and their maintenance histories."
            onClick={() => onNavigate('maintenance')}
            color="blue"
          />
          <ActionCard
            icon={<BarChart3 className="w-5 h-5" />}
            title="Generate Report"
            description="Export maintenance cost reports and lifecycle summaries."
            onClick={() => onNavigate('reports')}
            color="green"
          />
        </div>
      </div>

      {/* Pending Tasks */}
      <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/60 overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-100 dark:border-slate-700 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-slate-500 dark:text-slate-400" />
            <h2 className="font-semibold text-slate-800 dark:text-slate-100 text-sm">Pending Tasks</h2>
          </div>
          <button
            onClick={() => onNavigate('maintenance')}
            className="text-xs font-medium text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-0.5"
          >
            View all <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
        <div className="px-5 py-12 text-center">
          <ClipboardList className="w-10 h-10 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
          <p className="text-sm font-medium text-slate-500 dark:text-slate-400">No tasks yet — create your first task</p>
          <button
            onClick={() => onNavigate('maintenance')}
            className="mt-3 inline-flex items-center gap-1.5 text-xs font-semibold text-amber-600 dark:text-amber-400 hover:underline"
          >
            Create maintenance task <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Projects overview */}
      {projects.length > 0 && (
        <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/60 overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-100 dark:border-slate-700">
            <h2 className="font-semibold text-slate-800 dark:text-slate-100 text-sm">Assigned Buildings</h2>
          </div>
          <div className="divide-y divide-slate-100 dark:divide-slate-700/50">
            {projects.slice(0, 4).map((p) => (
              <div key={p.id} className="flex items-center gap-4 px-5 py-3.5">
                <div className="w-8 h-8 rounded-lg bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center flex-shrink-0">
                  <Building2 className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-slate-800 dark:text-slate-100 truncate">{p.name}</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">{p.location}, {p.county}</p>
                </div>
                <Badge
                  label={p.status}
                  color={p.status === 'Active' ? 'green' : p.status === 'Under Construction' ? 'blue' : 'slate'}
                />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Root Dashboard ───────────────────────────────────────────────────────────

export default function Dashboard({ user, projects, onNavigate }: Props) {
  if (user.role === 'Administrator') {
    return <AdminDashboard user={user} projects={projects} onNavigate={onNavigate} />;
  }
  if (user.role === 'Building Owner') {
    return <OwnerDashboard user={user} projects={projects} onNavigate={onNavigate} />;
  }
  return <FacilityManagerDashboard user={user} projects={projects} onNavigate={onNavigate} />;
}
