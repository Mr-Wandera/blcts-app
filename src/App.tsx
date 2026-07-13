import { useState, useEffect } from 'react';
import type { User, Project, BlueprintAnalysisResult } from './types';
import { AuthScreen } from './components/AuthScreen';
import { Layout } from './components/Layout';
import Dashboard from './components/Dashboard';
import ProjectsPage from './components/ProjectsPage';
import BlueprintUpload from './components/BlueprintUpload';
import CostEstimationPage from './components/CostEstimationPage';
import MaintenancePage from './components/MaintenancePage';
import PricingAdminPage from './components/PricingAdminPage';
import ReportsPage from './components/ReportsPage';
import LandingPageNew from './components/LandingPageNew';

type Tab =
  | 'dashboard' | 'projects' | 'blueprint' | 'estimation'
  | 'maintenance' | 'prices' | 'regions' | 'reports'
  | 'users' | 'system';

const TAB_TITLES: Record<Tab, string> = {
  dashboard: 'Dashboard',
  projects: 'Projects',
  blueprint: 'Blueprint Analysis',
  estimation: 'Cost Estimation',
  maintenance: 'Maintenance',
  prices: 'Material Prices',
  regions: 'Regional Pricing',
  reports: 'Reports',
  users: 'User Management',
  system: 'System Settings',
};

function App() {
  const [showLanding, setShowLanding] = useState(() => !localStorage.getItem('blcts_user'));
  const [user, setUser] = useState<User | null>(() => {
    try { return JSON.parse(localStorage.getItem('blcts_user') || 'null'); } catch { return null; }
  });
  const [isDark, setIsDark] = useState(() => localStorage.getItem('blcts_dark') === 'true');
  const [activeTab, setActiveTab] = useState<Tab>('dashboard');
  const [projects, setProjects] = useState<Project[]>(() => {
    try { return JSON.parse(localStorage.getItem('blcts_projects') || '[]'); } catch { return []; }
  });
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);

  useEffect(() => {
    localStorage.setItem('blcts_projects', JSON.stringify(projects));
  }, [projects]);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', isDark);
    localStorage.setItem('blcts_dark', String(isDark));
  }, [isDark]);

  function handleLogin(u: User) {
    setUser(u);
    setShowLanding(false);
    localStorage.setItem('blcts_user', JSON.stringify(u));
    setActiveTab('dashboard');
  }

  function handleLogout() {
    setUser(null);
    localStorage.removeItem('blcts_user');
    setShowLanding(true);
    setActiveTab('dashboard');
  }

  function handleTabChange(tab: string) {
    setActiveTab(tab as Tab);
  }

  function handleUploadBlueprint(projectId: string) {
    setSelectedProjectId(projectId);
    setActiveTab('blueprint');
  }

  function handleViewEstimate(projectId: string) {
    setSelectedProjectId(projectId);
    setActiveTab('estimation');
  }

  function handleBlueprintConfirm(result: {
    floorAreaPerFloor: number;
    floors: number;
    buildingType: string;
    constructionStandard: string;
    county: string;
    blueprintAnalysis: BlueprintAnalysisResult;
  }) {
    if (!selectedProjectId) return;
    setProjects(prev => prev.map(p => p.id === selectedProjectId ? {
      ...p,
      floorAreaPerFloor: result.floorAreaPerFloor,
      floors: result.floors,
      buildingType: result.buildingType as Project['buildingType'],
      constructionStandard: result.constructionStandard as Project['constructionStandard'],
      county: result.county,
      blueprintAnalysis: result.blueprintAnalysis,
      updatedAt: new Date().toISOString(),
    } : p));
    setActiveTab('estimation');
  }

  function handleProjectUpdate(updated: Project) {
    setProjects(prev => prev.map(p => p.id === updated.id ? updated : p));
  }

  // Always pick the explicitly selected project first, fallback to first project
  const selectedProject = projects.find(p => p.id === selectedProjectId) ?? projects[0] ?? null;

  // ── Landing page ───────────────────────────────────────────────────────────
  if (showLanding) {
    return (
      <LandingPageNew
        isDark={isDark}
        onToggleDark={() => setIsDark(d => !d)}
        onLogin={() => setShowLanding(false)}
        onGetStarted={() => setShowLanding(false)}
      />
    );
  }

  // ── Auth screen ────────────────────────────────────────────────────────────
  if (!user) {
    return <AuthScreen onLogin={handleLogin} />;
  }

  // ── Enforce role-based tab access ──────────────────────────────────────────
  const ADMIN_ONLY_TABS: Tab[] = ['users', 'prices', 'regions', 'system'];
  const OWNER_ONLY_TABS: Tab[] = ['blueprint', 'estimation'];
  const FM_ONLY_TABS: Tab[] = ['maintenance'];

  function canAccessTab(tab: Tab): boolean {
    if (ADMIN_ONLY_TABS.includes(tab) && user!.role !== 'Administrator') return false;
    if (OWNER_ONLY_TABS.includes(tab) && user!.role !== 'Building Owner') return false;
    if (FM_ONLY_TABS.includes(tab) && user!.role !== 'Facility Manager') return false;
    return true;
  }

  // ── No-project fallback ────────────────────────────────────────────────────
  function NoProjectSelected({ tab }: { tab: string }) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <div className="w-16 h-16 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center mb-4">
          <span className="text-3xl">🏗️</span>
        </div>
        <h2 className="text-lg font-semibold text-slate-700 dark:text-slate-200 mb-2">No project selected</h2>
        <p className="text-sm text-slate-500 dark:text-slate-400 mb-6 max-w-xs">
          {projects.length === 0
            ? 'Create your first project to access ' + tab + '.'
            : 'Select a project from the Projects page to continue.'}
        </p>
        <button
          onClick={() => setActiveTab('projects')}
          className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold px-5 py-2.5 rounded-xl transition shadow-sm"
        >
          {projects.length === 0 ? 'Create a Project' : 'Go to Projects'}
        </button>
      </div>
    );
  }

  function renderContent() {
    // Block unauthorized tab access
    if (!canAccessTab(activeTab)) {
      return (
        <div className="p-8 text-center">
          <p className="text-slate-500 dark:text-slate-400">You do not have access to this section.</p>
        </div>
      );
    }

    switch (activeTab) {
      case 'dashboard':
        return (
          <Dashboard
            user={user!}
            projects={projects}
            onNavigate={handleTabChange}
          />
        );

      case 'projects':
        return (
          <ProjectsPage
            projects={projects}
            currentUser={user!}
            onProjectsChange={setProjects}
            onSelectProject={setSelectedProjectId}
            onUploadBlueprint={handleUploadBlueprint}
            onViewEstimate={handleViewEstimate}
          />
        );

      case 'blueprint':
        return selectedProject ? (
          <BlueprintUpload
            project={selectedProject}
            onConfirm={handleBlueprintConfirm}
            onBack={() => setActiveTab('projects')}
          />
        ) : <NoProjectSelected tab="Blueprint Analysis" />;

      case 'estimation':
        return selectedProject ? (
          <CostEstimationPage
            project={selectedProject}
            onGoToBlueprint={() => setActiveTab('blueprint')}
            onProjectUpdate={handleProjectUpdate}
          />
        ) : <NoProjectSelected tab="Cost Estimation" />;

      case 'maintenance':
        return selectedProject ? (
          <MaintenancePage
            projectId={selectedProject.id}
            projectName={selectedProject.name}
            currentUser={user!}
          />
        ) : <NoProjectSelected tab="Maintenance Management" />;

      // Both prices and regions render PricingAdminPage (it has both tabs internally)
      case 'prices':
      case 'regions':
        return (
          <PricingAdminPage
            onBack={() => setActiveTab('dashboard')}
            initialTab={activeTab === 'regions' ? 'regional' : 'materials'}
          />
        );

      case 'reports':
        return selectedProject ? (
          <ReportsPage
            project={selectedProject}
            onGoToEstimation={() => setActiveTab('estimation')}
          />
        ) : <NoProjectSelected tab="Reports" />;

      case 'users':
        return <UserManagementPage />;

      case 'system':
        return <SystemSettingsPage />;

      default:
        return null;
    }
  }

  return (
    <Layout
      user={user}
      activeTab={activeTab}
      onTabChange={handleTabChange}
      onLogout={handleLogout}
      isDark={isDark}
      onToggleDark={() => setIsDark(d => !d)}
      pageTitle={TAB_TITLES[activeTab] || activeTab}
    >
      <div className="animate-fade-in">
        {renderContent()}
      </div>
    </Layout>
  );
}

// ─── User Management Page ─────────────────────────────────────────────────────

function UserManagementPage() {
  const DEMO_USERS = [
    { id: 'demo-admin-001', name: 'Admin User', email: 'admin@blcts.ke', role: 'Administrator', organization: 'BLCTS HQ', status: 'Active' },
    { id: 'demo-owner-001', name: 'James Kariuki', email: 'owner@blcts.ke', role: 'Building Owner', organization: 'Nairobi Properties Ltd', status: 'Active' },
    { id: 'demo-fm-001', name: 'Grace Wanjiku', email: 'fm@blcts.ke', role: 'Facility Manager', organization: 'FM Services Kenya', status: 'Active' },
  ];

  const roleColors: Record<string, string> = {
    Administrator: 'bg-violet-50 text-violet-700 border-violet-200 dark:bg-violet-950/40 dark:text-violet-300 dark:border-violet-900/40',
    'Building Owner': 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/40 dark:text-blue-300 dark:border-blue-900/40',
    'Facility Manager': 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-900/40',
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">User Management</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Manage system users and role-based access permissions.</p>
        </div>
        <button
          disabled
          className="inline-flex items-center gap-2 bg-emerald-600/50 text-white text-sm font-semibold px-4 py-2.5 rounded-xl cursor-not-allowed opacity-60"
          title="User creation is managed by the administrator"
        >
          + Invite User
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Total Users', value: DEMO_USERS.length, color: 'text-blue-600 dark:text-blue-400' },
          { label: 'Active Now', value: DEMO_USERS.length, color: 'text-emerald-600 dark:text-emerald-400' },
          { label: 'Roles Defined', value: 3, color: 'text-violet-600 dark:text-violet-400' },
        ].map(s => (
          <div key={s.label} className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/60 p-4 text-center">
            <p className={`text-2xl font-bold tabular-nums ${s.color}`}>{s.value}</p>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

      {/* User Table */}
      <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/60 overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-100 dark:border-slate-700">
          <h2 className="font-semibold text-slate-800 dark:text-slate-100 text-sm">System Accounts</h2>
        </div>
        <div className="divide-y divide-slate-100 dark:divide-slate-700/50">
          {DEMO_USERS.map(u => (
            <div key={u.id} className="flex items-center gap-4 px-5 py-4 hover:bg-slate-50 dark:hover:bg-slate-700/20 transition-colors">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600 text-white font-bold text-sm flex items-center justify-center flex-shrink-0">
                {u.name.charAt(0)}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-slate-800 dark:text-slate-100">{u.name}</p>
                <p className="text-xs text-slate-500 dark:text-slate-400">{u.email} · {u.organization}</p>
              </div>
              <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold border ${roleColors[u.role]}`}>
                {u.role}
              </span>
              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400">
                {u.status}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Role Permissions */}
      <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/60 overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-100 dark:border-slate-700">
          <h2 className="font-semibold text-slate-800 dark:text-slate-100 text-sm">Role Permissions Matrix</h2>
        </div>
        <div className="p-5 overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-700">
                <th className="text-left pb-2 text-slate-500 dark:text-slate-400 font-medium">Permission</th>
                <th className="text-center pb-2 text-violet-600 dark:text-violet-400 font-semibold">Admin</th>
                <th className="text-center pb-2 text-blue-600 dark:text-blue-400 font-semibold">Owner</th>
                <th className="text-center pb-2 text-emerald-600 dark:text-emerald-400 font-semibold">FM</th>
              </tr>
            </thead>
            <tbody>
              {[
                ['Manage Users', true, false, false],
                ['Configure Material Prices', true, false, false],
                ['Set Regional Pricing', true, false, false],
                ['System Settings', true, false, false],
                ['Create Projects', true, true, false],
                ['Upload Blueprints', false, true, false],
                ['Run Cost Estimation', false, true, false],
                ['View BOQ & Reports', true, true, true],
                ['Create Maintenance Tasks', false, false, true],
                ['Manage Work Orders', false, false, true],
                ['Record Actual Costs', false, false, true],
              ].map(([label, admin, owner, fm]) => (
                <tr key={String(label)} className="border-b border-slate-100 dark:border-slate-700/50 last:border-0">
                  <td className="py-2 text-slate-700 dark:text-slate-300">{String(label)}</td>
                  <td className="py-2 text-center">{admin ? '✅' : '—'}</td>
                  <td className="py-2 text-center">{owner ? '✅' : '—'}</td>
                  <td className="py-2 text-center">{fm ? '✅' : '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="rounded-xl border border-blue-200 dark:border-blue-800/60 bg-blue-50/50 dark:bg-blue-950/20 p-4">
        <p className="text-sm text-blue-700 dark:text-blue-300 font-medium">
          Demo Mode: Users log in via the login screen. Each role has a different dashboard and feature set.
          Use the demo accounts: admin@blcts.ke, owner@blcts.ke, fm@blcts.ke
        </p>
      </div>
    </div>
  );
}

// ─── System Settings Page ─────────────────────────────────────────────────────

function SystemSettingsPage() {
  const systemItems = [
    { label: 'Database', value: 'Supabase PostgreSQL', status: 'Connected', color: 'green' },
    { label: 'AI Engine', value: 'Gemini 2.5 Flash', status: 'Configured', color: 'blue' },
    { label: 'Regional Pricing', value: '10 Counties loaded', status: 'Live', color: 'green' },
    { label: 'Materials Database', value: '44 items', status: 'Synced', color: 'green' },
    { label: 'BOQ Engine', value: 'v2.0 — QS Standard', status: 'Ready', color: 'green' },
    { label: 'Lifecycle Model', value: '30-year, 6% inflation', status: 'Active', color: 'green' },
    { label: 'BOQ Estimates', value: 'Persisted to Supabase', status: 'Active', color: 'green' },
    { label: 'Maintenance Tasks', value: 'Persisted to Supabase', status: 'Active', color: 'green' },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">System Settings</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Platform configuration, integrations, and system health.</p>
      </div>

      {/* Health Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {systemItems.map(item => (
          <div key={item.label} className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/60 p-4 flex items-center justify-between gap-3">
            <div className="min-w-0">
              <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide">{item.label}</p>
              <p className="text-sm font-medium text-slate-800 dark:text-slate-100 mt-0.5 truncate">{item.value}</p>
            </div>
            <span className={`flex-shrink-0 text-xs font-bold px-2.5 py-1 rounded-full ${
              item.color === 'green' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400' :
              item.color === 'blue' ? 'bg-blue-100 text-blue-700 dark:bg-blue-950/40 dark:text-blue-400' :
              'bg-amber-100 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400'
            }`}>{item.status}</span>
          </div>
        ))}
      </div>

      {/* Platform Info */}
      <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/60 overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-100 dark:border-slate-700">
          <h2 className="font-semibold text-slate-800 dark:text-slate-100 text-sm">Platform Information</h2>
        </div>
        <div className="p-5 space-y-3">
          {[
            ['Application', 'Building Lifecycle Cost Tracking System (BLCTS)'],
            ['Version', '2.0.0 — Presentation Build'],
            ['Frontend', 'React 19 + TypeScript + Vite + Tailwind CSS 4'],
            ['Backend', 'Supabase (PostgreSQL + Row Level Security)'],
            ['AI Integration', 'Google Gemini 2.5 Flash — Blueprint Analysis'],
            ['BOQ Standard', 'Kenya NCA / BORAQS Quantity Survey Standard'],
            ['Lifecycle Model', 'Discounted cost-over-time with 6% annual inflation'],
            ['Currency', 'Kenya Shilling (KSh)'],
          ].map(([k, v]) => (
            <div key={k} className="flex gap-4 text-sm">
              <span className="w-36 flex-shrink-0 text-slate-500 dark:text-slate-400 font-medium">{k}</span>
              <span className="text-slate-800 dark:text-slate-100">{v}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Audit Log */}
      <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/60 overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-100 dark:border-slate-700">
          <h2 className="font-semibold text-slate-800 dark:text-slate-100 text-sm">Recent Audit Events</h2>
        </div>
        <div className="divide-y divide-slate-100 dark:divide-slate-700/50">
          {[
            { time: new Date().toLocaleString(), action: 'Session started', user: 'Administrator', type: 'auth' },
            { time: new Date(Date.now() - 3600000).toLocaleString(), action: 'Material price database viewed', user: 'Administrator', type: 'data' },
            { time: new Date(Date.now() - 7200000).toLocaleString(), action: 'Regional pricing updated — Nairobi', user: 'Administrator', type: 'update' },
          ].map((log, i) => (
            <div key={i} className="flex items-center gap-3 px-5 py-3">
              <div className={`w-2 h-2 rounded-full flex-shrink-0 ${log.type === 'auth' ? 'bg-blue-400' : log.type === 'update' ? 'bg-amber-400' : 'bg-emerald-400'}`} />
              <div className="flex-1 min-w-0">
                <p className="text-sm text-slate-700 dark:text-slate-300">{log.action}</p>
                <p className="text-xs text-slate-400 mt-0.5">{log.user} · {log.time}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default App;
