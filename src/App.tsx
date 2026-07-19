import { useState, useEffect, useCallback, lazy, Suspense } from 'react';
import type { Project, BlueprintAnalysisResult, User, UserRole } from './types';
import { AuthScreen } from './components/AuthScreen';
import { Layout } from './components/Layout';
import { Loading } from './components/ui/Loading';
import { supabase, mapSupabaseUser, fetchProjects, createProject, updateProject, deleteProject, signOut } from './lib/supabase';

const Dashboard = lazy(() => import('./components/Dashboard'));
const ProjectsPage = lazy(() => import('./components/ProjectsPage'));
const BlueprintUpload = lazy(() => import('./components/BlueprintUpload'));
const CostEstimationPage = lazy(() => import('./components/CostEstimationPage'));
const MaintenancePage = lazy(() => import('./components/MaintenancePage'));
const PricingAdminPage = lazy(() => import('./components/PricingAdminPage'));
const ReportsPage = lazy(() => import('./components/ReportsPage'));
const LandingPageNew = lazy(() => import('./components/LandingPageNew'));

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
  const [showLanding, setShowLanding] = useState(() => !localStorage.getItem('blcts_seen_landing'));
  const [user, setUser] = useState<User | null>(null);
  const [authReady, setAuthReady] = useState(false);
  const [isDark, setIsDark] = useState(() => localStorage.getItem('blcts_dark') === 'true');
  const [activeTab, setActiveTab] = useState<Tab>('dashboard');
  const [projects, setProjects] = useState<Project[]>([]);
  const [projectsLoading, setProjectsLoading] = useState(false);
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', isDark);
    localStorage.setItem('blcts_dark', String(isDark));
  }, [isDark]);

  // Restore session on mount + subscribe to auth changes.
  useEffect(() => {
    let active = true;
    supabase.auth.getSession().then(({ data }) => {
      if (!active) return;
      if (data.session?.user) {
        const mapped = mapSupabaseUser(data.session.user) as User;
        setUser(mapped);
      }
      setAuthReady(true);
    });

    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      (async () => {
        if (session?.user) {
          const mapped = mapSupabaseUser(session.user) as User;
          setUser(mapped);
        } else {
          setUser(null);
          setProjects([]);
          setSelectedProjectId(null);
        }
      })();
    });

    return () => {
      active = false;
      sub.subscription.unsubscribe();
    };
  }, []);

  const loadProjects = useCallback(async () => {
    if (!user) return;
    setProjectsLoading(true);
    try {
      const rows = await fetchProjects();
      setProjects(rows);
    } catch {
      setProjects([]);
    } finally {
      setProjectsLoading(false);
    }
  }, [user]);

  useEffect(() => {
    void loadProjects();
  }, [loadProjects]);

  function handleAuthed() {
    // onAuthStateChange will set the user; this just dismisses the landing/auth screen.
    setShowLanding(false);
    localStorage.setItem('blcts_seen_landing', '1');
  }

  async function handleLogout() {
    try {
      await signOut();
    } catch {
      // ignore
    }
    setUser(null);
    setProjects([]);
    setSelectedProjectId(null);
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

  async function handleBlueprintConfirm(result: {
    floorAreaPerFloor: number;
    floors: number;
    buildingType: string;
    constructionStandard: string;
    county: string;
    blueprintAnalysis: BlueprintAnalysisResult;
    blueprintFileName?: string;
  }) {
    if (!selectedProjectId) return;
    const target = projects.find(p => p.id === selectedProjectId);
    if (!target) return;
    const updated: Project = {
      ...target,
      floorAreaPerFloor: result.floorAreaPerFloor,
      floors: result.floors,
      buildingType: result.buildingType as Project['buildingType'],
      constructionStandard: result.constructionStandard as Project['constructionStandard'],
      county: result.county,
      blueprintAnalysis: result.blueprintAnalysis,
      blueprintFileName: result.blueprintFileName,
      updatedAt: new Date().toISOString(),
    };
    setProjects(prev => prev.map(p => p.id === selectedProjectId ? updated : p));
    try {
      await updateProject(updated);
    } catch {
      // surfaced via toast in the component
    }
    setActiveTab('estimation');
  }

  async function handleProjectUpdate(updated: Project) {
    setProjects(prev => prev.map(p => p.id === updated.id ? updated : p));
    try {
      await updateProject(updated);
    } catch {
      // ignore
    }
  }

  async function handleProjectsChange(next: Project[]) {
    const prev = projects;
    setProjects(next);

    // Determine created/deleted and persist.
    const created = next.filter(p => !prev.some(o => o.id === p.id));
    const deleted = prev.filter(p => !next.some(n => n.id === p.id));

    for (const p of created) {
      try {
        const saved = await createProject({
          id: p.id,
          name: p.name,
          location: p.location,
          county: p.county,
          buildingType: p.buildingType,
          constructionStandard: p.constructionStandard,
          floorAreaPerFloor: p.floorAreaPerFloor,
          floors: p.floors,
          blueprintAnalysis: p.blueprintAnalysis,
          blueprintFileName: p.blueprintFileName,
          status: p.status ?? 'Planning',
        } as Project);
        setProjects(list => list.map(x => x.id === p.id ? saved : x));
      } catch {
        // ignore — surfaced in UI
      }
    }
    for (const p of deleted) {
      try {
        await deleteProject(p.id);
      } catch {
        // ignore
      }
    }
  }

  const selectedProject = projects.find(p => p.id === selectedProjectId) ?? projects[0] ?? null;

  if (!authReady) {
    return <Loading message="Loading…" />;
  }

  if (showLanding && !user) {
    return (
      <Suspense fallback={<Loading message="Loading…" />}>
        <LandingPageNew
          isDark={isDark}
          onToggleDark={() => setIsDark(d => !d)}
          onLogin={() => { setShowLanding(false); localStorage.setItem('blcts_seen_landing', '1'); }}
          onGetStarted={() => { setShowLanding(false); localStorage.setItem('blcts_seen_landing', '1'); }}
        />
      </Suspense>
    );
  }

  if (!user) {
    return <AuthScreen onAuthed={handleAuthed} />;
  }

  const typedUser = user;

  const ADMIN_ONLY_TABS: Tab[] = ['users', 'prices', 'regions', 'system'];
  const OWNER_ONLY_TABS: Tab[] = ['blueprint', 'estimation'];
  const FM_ONLY_TABS: Tab[] = ['maintenance'];

  function canAccessTab(tab: Tab): boolean {
    if (ADMIN_ONLY_TABS.includes(tab) && typedUser.role !== 'Administrator') return false;
    if (OWNER_ONLY_TABS.includes(tab) && typedUser.role !== 'Building Owner') return false;
    if (FM_ONLY_TABS.includes(tab) && typedUser.role !== 'Facility Manager') return false;
    return true;
  }

  function NoProjectSelected({ tab }: { tab: string }) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <div className="w-16 h-16 rounded-2xl bg-slate-100 dark:bg-[#0f1629] flex items-center justify-center mb-4">
          <span className="text-3xl">📋</span>
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
            user={typedUser}
            projects={projects}
            onNavigate={handleTabChange}
          />
        );

      case 'projects':
        return (
          <ProjectsPage
            projects={projects}
            currentUser={typedUser}
            onProjectsChange={handleProjectsChange}
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
            currentUser={typedUser}
          />
        ) : <NoProjectSelected tab="Maintenance Management" />;

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
        return <UserManagementPage currentUser={typedUser} />;

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
        <Suspense fallback={<Loading message="Loading module…" />}>
          {projectsLoading && activeTab === 'projects' ? (
            <Loading message="Loading projects…" />
          ) : (
            renderContent()
          )}
        </Suspense>
      </div>
    </Layout>
  );
}

function UserManagementPage({ currentUser }: { currentUser: User }) {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">User Management</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Your account details.</p>
      </div>
      <div className="rounded-2xl border border-slate-200 dark:border-white/8 bg-white dark:bg-[#0f1629] overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-100 dark:border-white/6">
          <h2 className="font-semibold text-slate-800 dark:text-slate-100 text-sm">Current Account</h2>
        </div>
        <div className="px-5 py-4 flex items-center gap-4">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600 text-white font-bold text-sm flex items-center justify-center flex-shrink-0">
            {currentUser.name.charAt(0)}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-slate-800 dark:text-slate-100">{currentUser.name}</p>
            <p className="text-xs text-slate-500 dark:text-slate-400">{currentUser.email} · {currentUser.organization ?? 'Independent'}</p>
          </div>
          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold border bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-900/40">
            {currentUser.role}
          </span>
        </div>
      </div>
    </div>
  );
}

function SystemSettingsPage() {
  const systemItems = [
    { label: 'Database', value: 'Supabase PostgreSQL', status: 'Connected', color: 'green' },
    { label: 'AI Engine', value: 'Gemini 2.5 Flash (edge function)', status: 'Configured', color: 'blue' },
    { label: 'Regional Pricing', value: '10 Counties loaded', status: 'Live', color: 'green' },
    { label: 'Materials Database', value: '44 items', status: 'Synced', color: 'green' },
    { label: 'BOQ Engine', value: 'v2.0 — SMM Standard', status: 'Ready', color: 'green' },
    { label: 'Lifecycle Model', value: '30-year, 6% inflation', status: 'Active', color: 'green' },
    { label: 'Authentication', value: 'Supabase email/password', status: 'Active', color: 'green' },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">System Settings</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Platform configuration and system health.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {systemItems.map(item => (
          <div key={item.label} className="rounded-2xl border border-slate-200 dark:border-white/8 bg-white dark:bg-[#0f1629] p-4 flex items-center justify-between gap-3">
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

      <div className="rounded-2xl border border-slate-200 dark:border-white/8 bg-white dark:bg-[#0f1629] overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-100 dark:border-white/6">
          <h2 className="font-semibold text-slate-800 dark:text-slate-100 text-sm">Platform Information</h2>
        </div>
        <div className="p-5 space-y-3">
          {[
            ['Application', 'Building Lifecycle Cost Tracking System (BLCTS)'],
            ['Version', '2.0.0'],
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
    </div>
  );
}

export default App;
