import { useState, useEffect, useRef } from 'react';
import { Building2, ArrowRight, ChevronRight, ChartBar as BarChart3, Cpu, FileText, MapPin, Wrench, Shield, Moon, Sun, CircleCheck as CheckCircle2, TrendingUp, DollarSign, TriangleAlert as AlertTriangle, Clock, Layers, Play, Menu, X, Zap, Database, Globe, Lock, ChevronDown, Activity } from 'lucide-react';

interface Props {
  isDark: boolean;
  onToggleDark: () => void;
  onLogin: () => void;
  onGetStarted: () => void;
}

function useCountUp(target: number, duration = 1800, start = false) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    if (!start) return;
    let startTime: number | null = null;
    const step = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setCount(Math.floor(eased * target));
      if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [target, duration, start]);
  return count;
}

export default function LandingPageNew({ isDark, onToggleDark, onLogin, onGetStarted }: Props) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [heroVisible, setHeroVisible] = useState(false);
  const [statsVisible, setStatsVisible] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const statsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', isDark);
    const t = setTimeout(() => setHeroVisible(true), 100);
    return () => clearTimeout(t);
  }, [isDark]);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setStatsVisible(true); },
      { threshold: 0.3 }
    );
    if (statsRef.current) observer.observe(statsRef.current);
    return () => observer.disconnect();
  }, []);

  const c1 = useCountUp(44, 1600, statsVisible);
  const c2 = useCountUp(12, 1400, statsVisible);
  const c3 = useCountUp(30, 1200, statsVisible);
  const c4 = useCountUp(99, 2000, statsVisible);

  const workflow = [
    { n: '01', title: 'Register Project', desc: 'Define building type, county, standard, and floor parameters.', icon: Building2 },
    { n: '02', title: 'Upload Blueprint', desc: 'Upload architectural drawings — PDF, PNG, or JPEG accepted.', icon: Layers },
    { n: '03', title: 'AI Extraction', desc: 'Gemini AI extracts floor area, building type, and observations.', icon: Cpu },
    { n: '04', title: 'Generate BOQ', desc: 'QS engine produces 14-section Bill of Quantities from Supabase pricing.', icon: BarChart3 },
    { n: '05', title: 'Lifecycle Cost', desc: '30-year TCO with inflation-adjusted OPEX, maintenance, replacements.', icon: TrendingUp },
    { n: '06', title: 'Export Report', desc: 'Download full engineering report as CSV. Print-ready for stakeholders.', icon: FileText },
  ];

  const features = [
    { icon: Cpu, title: 'AI Blueprint Analysis', desc: 'Gemini 2.5 Flash extracts GFA, building type, and confidence from architectural drawings. Honest fallback when extraction is uncertain.', tag: 'AI-Powered' },
    { icon: BarChart3, title: 'Transparent BOQ Engine', desc: '14-section Bill of Quantities with itemized quantities, units, rates, and amounts. No black-box calculations.', tag: 'QS Standard' },
    { icon: DollarSign, title: 'Total Cost of Ownership', desc: 'Construction cost + 30-year lifecycle costs including maintenance, utilities, inspections, and replacement cycles.', tag: 'Lifecycle' },
    { icon: MapPin, title: 'Regional Price Intelligence', desc: '12 Kenyan counties with material, labour, and service multipliers. Live Supabase pricing updated by administrators.', tag: 'Kenya-Specific' },
    { icon: Wrench, title: 'Maintenance Workflow', desc: 'Full 8-stage maintenance lifecycle: Create → Assign → In-Progress → Complete → Verify → Cost Record → Lifecycle Update.', tag: 'Operations' },
    { icon: Shield, title: 'Role-Based Access', desc: 'Administrator manages pricing and users. Building Owner runs estimates. Facility Manager handles maintenance tasks.', tag: 'RBAC' },
    { icon: Database, title: 'Supabase Backend', desc: 'All data persisted in PostgreSQL with Row Level Security. Material prices, BOQ estimates, and maintenance tasks all live.', tag: 'Real Data' },
    { icon: Globe, title: 'Engineering Reports', desc: 'Export full BOQ with project details, cost breakdown, lifecycle analysis, AI observations, and recommendations.', tag: 'Reports' },
  ];

  const roles = [
    {
      role: 'Administrator',
      color: 'from-violet-600 to-violet-800',
      border: 'border-violet-200 dark:border-violet-800/60',
      bg: 'bg-violet-50 dark:bg-violet-950/20',
      tag: 'bg-violet-100 text-violet-700 dark:bg-violet-900/40 dark:text-violet-300',
      icon: Shield,
      creds: { email: 'admin@blcts.ke', pass: 'admin123' },
      features: ['Manage all users and roles', 'Edit material & labour prices', 'Configure county multipliers', 'View all projects & reports', 'System settings & audit logs'],
    },
    {
      role: 'Building Owner',
      color: 'from-blue-600 to-blue-800',
      border: 'border-blue-200 dark:border-blue-800/60',
      bg: 'bg-blue-50 dark:bg-blue-950/20',
      tag: 'bg-blue-100 text-emerald-700 dark:bg-blue-900/40 dark:text-blue-300',
      icon: Building2,
      creds: { email: 'owner@blcts.ke', pass: 'owner123' },
      features: ['Register building projects', 'Upload architectural blueprints', 'Run AI blueprint analysis', 'Generate BOQ estimates', 'View lifecycle cost reports'],
    },
    {
      role: 'Facility Manager',
      color: 'from-emerald-600 to-emerald-800',
      border: 'border-emerald-200 dark:border-emerald-800/60',
      bg: 'bg-emerald-50 dark:bg-emerald-950/20',
      tag: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300',
      icon: Wrench,
      creds: { email: 'fm@blcts.ke', pass: 'fm123' },
      features: ['Create & assign maintenance tasks', 'Manage work orders', 'Record actual maintenance costs', 'Generate maintenance reports', 'Update lifecycle cost data'],
    },
  ];

  const problems = [
    { icon: AlertTriangle, title: 'First-Cost Bias', desc: 'Developers choose cheapest initial construction, ignoring operational costs that run 3–5× higher over 30 years.' },
    { icon: Clock, title: 'Opaque Estimates', desc: 'Traditional BOQ processes lack transparency. Assumptions are hidden, making it impossible to verify or challenge figures.' },
    { icon: Activity, title: 'No Lifecycle Planning', desc: 'Without lifecycle cost models, buildings become financial liabilities. Maintenance backlogs compound over decades.' },
  ];

  return (
    <div className="min-h-screen bg-white dark:bg-[#0a0f1e] text-slate-900 dark:text-slate-100 antialiased">

      {/* ── NAVBAR ─────────────────────────────────────────────────────────── */}
      <nav className={`fixed top-0 inset-x-0 z-50 transition-all duration-300 ${
        scrolled
          ? 'bg-white/95 dark:bg-[#0a0f1e]/95 backdrop-blur-xl border-b border-slate-200/80 dark:border-white/8 shadow-sm'
          : 'bg-transparent'
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          {/* Brand */}
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-500 to-emerald-700 flex items-center justify-center shadow-md shadow-emerald-500/30">
                <Building2 className="w-4.5 h-4.5 text-white" style={{ width: 18, height: 18 }} strokeWidth={2} />
              </div>
              <div className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-400 border-2 border-white dark:border-[#0a0f1e] animate-pulse" />
            </div>
            <div className="flex flex-col leading-none">
              <span className="text-[15px] font-black tracking-tight text-slate-900 dark:text-white">BLCTS</span>
              <span className="text-[9px] font-medium text-slate-400 dark:text-slate-500 tracking-widest uppercase hidden sm:block">Cost Intelligence</span>
            </div>
          </div>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-6">
            {['Features', 'Workflow', 'Roles'].map(item => (
              <a key={item} href={`#${item.toLowerCase()}`}
                className="text-sm font-medium text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors"
              >{item}</a>
            ))}
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2">
            <button onClick={onToggleDark}
              className="p-2 rounded-lg text-slate-500 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-white/8 transition">
              {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>
            <button onClick={onLogin}
              className="hidden sm:block text-sm font-semibold text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white px-3 py-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-white/8 transition">
              Sign In
            </button>
            <button onClick={onGetStarted}
              className="inline-flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-semibold px-4 py-2 rounded-lg shadow-md shadow-emerald-600/30 transition-all hover:shadow-emerald-500/40 hover:-translate-y-px active:translate-y-0">
              Get Started <ArrowRight className="w-3.5 h-3.5" />
            </button>
            <button onClick={() => setMobileOpen(v => !v)} className="md:hidden p-2 rounded-lg text-slate-500 hover:bg-slate-100 dark:hover:bg-white/8 transition">
              {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {mobileOpen && (
          <div className="md:hidden border-t border-slate-200 dark:border-white/8 bg-white dark:bg-[#0a0f1e] px-4 py-4 space-y-1">
            {['Features', 'Workflow', 'Roles'].map(item => (
              <a key={item} href={`#${item.toLowerCase()}`} onClick={() => setMobileOpen(false)}
                className="block px-3 py-2.5 rounded-lg text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/8 transition">
                {item}
              </a>
            ))}
            <div className="pt-2 border-t border-slate-200 dark:border-white/8 flex gap-2">
              <button onClick={onLogin} className="flex-1 py-2.5 rounded-lg border border-slate-300 dark:border-white/10 text-sm font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-white/5 transition">Sign In</button>
              <button onClick={onGetStarted} className="flex-1 py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-semibold transition">Get Started</button>
            </div>
          </div>
        )}
      </nav>

      {/* ── HERO ───────────────────────────────────────────────────────────── */}
      <section className="relative min-h-screen flex flex-col items-center justify-center px-4 sm:px-6 pt-16 pb-20 overflow-hidden">
        {/* Background */}
        <div className="absolute inset-0 pointer-events-none">
          {/* Grid */}
          <div className="absolute inset-0 bg-[linear-gradient(rgba(16,185,129,0.04)_1px,transparent_1px),linear-gradient(90deg,rgba(16,185,129,0.04)_1px,transparent_1px)] bg-[size:48px_48px] dark:bg-[linear-gradient(rgba(16,185,129,0.06)_1px,transparent_1px),linear-gradient(90deg,rgba(16,185,129,0.06)_1px,transparent_1px)]" />
          {/* Glows */}
          <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-emerald-500/6 dark:bg-emerald-500/10 rounded-full blur-[120px]" />
          <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[300px] bg-blue-500/5 dark:bg-blue-500/8 rounded-full blur-[100px]" />
        </div>

        <div className={`relative z-10 max-w-5xl mx-auto text-center transition-all duration-700 ${heroVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}>
          {/* Tag */}
          <div className="inline-flex items-center gap-2 rounded-full border border-emerald-200 dark:border-emerald-800/60 bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400 text-xs font-semibold px-3.5 py-1.5 mb-8">
            <Zap className="w-3.5 h-3.5 fill-emerald-500 text-emerald-500" />
            AI-Powered Construction Cost Intelligence
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
          </div>

          {/* Headline */}
          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-black tracking-tight leading-[0.95] mb-6">
            <span className="text-slate-900 dark:text-white">Building Lifecycle</span>
            <br />
            <span className="bg-gradient-to-r from-emerald-500 via-emerald-400 to-teal-400 bg-clip-text text-transparent">
              Cost Intelligence
            </span>
          </h1>

          <p className={`text-lg sm:text-xl text-slate-600 dark:text-slate-400 max-w-2xl mx-auto leading-relaxed mb-10 transition-all duration-700 delay-150 ${heroVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
            From blueprint to 30-year Total Cost of Ownership — transparent BOQ generation,
            AI-assisted analysis, and regional pricing for Kenyan construction professionals.
          </p>

          {/* CTAs */}
          <div className={`flex flex-col sm:flex-row items-center justify-center gap-4 mb-16 transition-all duration-700 delay-300 ${heroVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
            <button onClick={onGetStarted}
              className="group w-full sm:w-auto inline-flex items-center justify-center gap-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-base px-8 py-4 rounded-xl shadow-xl shadow-emerald-600/25 transition-all hover:-translate-y-0.5 hover:shadow-emerald-500/35">
              Start Free Demo
              <ArrowRight className="w-4.5 h-4.5 group-hover:translate-x-0.5 transition-transform" style={{ width: 18, height: 18 }} />
            </button>
            <button onClick={onLogin}
              className="group w-full sm:w-auto inline-flex items-center justify-center gap-2.5 border-2 border-slate-200 dark:border-white/12 bg-white dark:bg-white/5 hover:bg-slate-50 dark:hover:bg-white/8 text-slate-700 dark:text-slate-200 font-bold text-base px-8 py-4 rounded-xl transition-all hover:-translate-y-0.5">
              <Play className="w-4 h-4 fill-current" />
              Sign In
            </button>
          </div>

          {/* Floating metrics */}
          <div ref={statsRef} className={`grid grid-cols-2 sm:grid-cols-4 gap-4 max-w-3xl mx-auto transition-all duration-700 delay-500 ${heroVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
            {[
              { value: c1, suffix: '', label: 'Materials in DB', sub: 'Live Supabase pricing' },
              { value: c2, suffix: '', label: 'Counties Covered', sub: 'Regional multipliers' },
              { value: c3, suffix: 'yr', label: 'Lifecycle Model', sub: 'Inflation-adjusted TCO' },
              { value: c4, suffix: '%', label: 'Transparent Calcs', sub: 'No hidden formulas' },
            ].map((s, i) => (
              <div key={i} className="group relative bg-white dark:bg-white/4 border border-slate-200 dark:border-white/8 rounded-2xl p-4 text-center hover:border-emerald-300 dark:hover:border-emerald-700/50 transition-all hover:-translate-y-0.5 hover:shadow-md">
                <div className="text-3xl font-black tabular-nums text-emerald-600 dark:text-emerald-400">
                  {s.value}{s.suffix}
                </div>
                <div className="text-xs font-bold text-slate-700 dark:text-slate-200 mt-1">{s.label}</div>
                <div className="text-[10px] text-slate-400 dark:text-slate-500 mt-0.5">{s.sub}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Scroll hint */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1 text-slate-400 dark:text-slate-600 animate-bounce">
          <ChevronDown className="w-5 h-5" />
        </div>
      </section>

      {/* ── PROBLEM ────────────────────────────────────────────────────────── */}
      <section className="py-24 px-4 sm:px-6 bg-slate-50 dark:bg-white/2 border-y border-slate-200 dark:border-white/6">
        <div className="max-w-6xl mx-auto">
          <div className="max-w-2xl mb-14">
            <p className="text-xs font-bold uppercase tracking-widest text-rose-600 dark:text-rose-400 mb-3">The Problem</p>
            <h2 className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white mb-4">
              First-Cost Bias Costs Kenya Billions
            </h2>
            <p className="text-slate-500 dark:text-slate-400 leading-relaxed">
              Construction decisions are made on initial cost alone. Lifecycle expenses — maintenance,
              utilities, replacements — are never modelled. BLCTS changes that.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {problems.map((p, i) => {
              const Icon = p.icon;
              return (
                <div key={i} className="bg-white dark:bg-white/4 border border-slate-200 dark:border-white/8 rounded-2xl p-6 hover:border-rose-200 dark:hover:border-rose-800/50 hover:shadow-md transition-all group">
                  <div className="w-10 h-10 rounded-xl bg-rose-100 dark:bg-rose-950/40 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                    <Icon className="w-5 h-5 text-rose-600 dark:text-rose-400" />
                  </div>
                  <h3 className="font-bold text-slate-800 dark:text-slate-100 mb-2">{p.title}</h3>
                  <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">{p.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── WORKFLOW ───────────────────────────────────────────────────────── */}
      <section id="workflow" className="py-24 px-4 sm:px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-14">
            <p className="text-xs font-bold uppercase tracking-widest text-emerald-600 dark:text-emerald-400 mb-3">How It Works</p>
            <h2 className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white mb-4">
              Blueprint to TCO in 6 Steps
            </h2>
            <p className="text-slate-500 dark:text-slate-400 max-w-xl mx-auto">
              The complete cost engineering workflow — visible at every step, honest about every assumption.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {workflow.map((step, i) => {
              const Icon = step.icon;
              return (
                <div key={i} className="group relative bg-white dark:bg-white/4 border border-slate-200 dark:border-white/8 rounded-2xl p-6 hover:border-emerald-300 dark:hover:border-emerald-700/50 hover:shadow-lg transition-all hover:-translate-y-0.5">
                  {/* Step number bg */}
                  <div className="absolute top-4 right-5 text-4xl font-black text-slate-100 dark:text-white/4 select-none font-mono">{step.n}</div>

                  <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-950/40 group-hover:bg-emerald-600 flex items-center justify-center mb-4 transition-colors">
                    <Icon className="w-5 h-5 text-emerald-600 dark:text-emerald-400 group-hover:text-white transition-colors" />
                  </div>
                  <h3 className="font-bold text-slate-800 dark:text-slate-100 mb-2">{step.title}</h3>
                  <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">{step.desc}</p>

                  {i < workflow.length - 1 && (
                    <div className="hidden lg:block absolute -right-3 top-1/2 -translate-y-1/2 z-10">
                      <ChevronRight className="w-5 h-5 text-slate-300 dark:text-white/20" />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── FEATURES ───────────────────────────────────────────────────────── */}
      <section id="features" className="py-24 px-4 sm:px-6 bg-slate-50 dark:bg-white/2 border-y border-slate-200 dark:border-white/6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-14">
            <p className="text-xs font-bold uppercase tracking-widest text-emerald-600 dark:text-blue-400 mb-3">Platform Capabilities</p>
            <h2 className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white mb-4">
              Everything a QS Professional Needs
            </h2>
            <p className="text-slate-500 dark:text-slate-400 max-w-xl mx-auto">
              Built to NCA/BORAQS standards with transparent calculations and real Kenyan market data.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {features.map((f, i) => {
              const Icon = f.icon;
              return (
                <div key={i} className="group bg-white dark:bg-white/4 border border-slate-200 dark:border-white/8 rounded-2xl p-5 hover:border-blue-300 dark:hover:border-blue-700/50 hover:shadow-md transition-all hover:-translate-y-0.5">
                  <div className="flex items-start justify-between mb-3">
                    <div className="w-9 h-9 rounded-lg bg-blue-100 dark:bg-blue-950/40 flex items-center justify-center group-hover:scale-110 transition-transform">
                      <Icon className="w-4.5 h-4.5 text-emerald-600 dark:text-blue-400" style={{ width: 18, height: 18 }} />
                    </div>
                    <span className="text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-slate-100 dark:bg-white/6 text-slate-500 dark:text-slate-400">{f.tag}</span>
                  </div>
                  <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100 mb-1.5">{f.title}</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">{f.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── ROLES ──────────────────────────────────────────────────────────── */}
      <section id="roles" className="py-24 px-4 sm:px-6">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <p className="text-xs font-bold uppercase tracking-widest text-violet-600 dark:text-violet-400 mb-3">Access Control</p>
            <h2 className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white mb-4">
              Three Roles, One Platform
            </h2>
            <p className="text-slate-500 dark:text-slate-400 max-w-xl mx-auto">
              Each role has a dedicated dashboard, workflow, and feature set. No shared interfaces.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {roles.map((r) => {
              const Icon = r.icon;
              return (
                <div key={r.role} className={`relative rounded-2xl border ${r.border} ${r.bg} p-6 overflow-hidden`}>
                  {/* Gradient top bar */}
                  <div className={`absolute top-0 inset-x-0 h-1 bg-gradient-to-r ${r.color}`} />

                  <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${r.color} flex items-center justify-center mb-4 shadow-md`}>
                    <Icon className="w-5 h-5 text-white" />
                  </div>

                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-bold text-slate-800 dark:text-slate-100">{r.role}</h3>
                  </div>

                  {/* Credentials */}
                  <div className="bg-white/60 dark:bg-black/20 rounded-lg p-2.5 mb-4 font-mono text-xs border border-black/5 dark:border-white/8">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500 dark:text-slate-400">{r.creds.email}</span>
                      <Lock className="w-3 h-3 text-slate-400" />
                    </div>
                    <div className="text-slate-400 dark:text-slate-500 mt-0.5">{r.creds.pass}</div>
                  </div>

                  <ul className="space-y-1.5">
                    {r.features.map((feat, i) => (
                      <li key={i} className="flex items-start gap-2 text-xs text-slate-600 dark:text-slate-300">
                        <CheckCircle2 className="w-3.5 h-3.5 flex-shrink-0 mt-0.5 text-emerald-500" />
                        {feat}
                      </li>
                    ))}
                  </ul>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── TECH STACK ─────────────────────────────────────────────────────── */}
      <section className="py-16 px-4 sm:px-6 bg-slate-50 dark:bg-white/2 border-y border-slate-200 dark:border-white/6">
        <div className="max-w-4xl mx-auto text-center">
          <p className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-8">Built With</p>
          <div className="flex flex-wrap items-center justify-center gap-8">
            {[
              { name: 'React 19', color: 'text-blue-500' },
              { name: 'TypeScript', color: 'text-emerald-600' },
              { name: 'Tailwind CSS', color: 'text-teal-600' },
              { name: 'Supabase', color: 'text-emerald-600' },
              { name: 'Gemini AI', color: 'text-violet-600' },
              { name: 'Recharts', color: 'text-orange-500' },
              { name: 'Vite', color: 'text-amber-500' },
              { name: 'Lucide Icons', color: 'text-slate-500' },
            ].map(t => (
              <div key={t.name} className="flex items-center gap-1.5">
                <div className={`w-1.5 h-1.5 rounded-full bg-current ${t.color}`} />
                <span className={`text-sm font-semibold ${t.color}`}>{t.name}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ────────────────────────────────────────────────────────────── */}
      <section className="py-24 px-4 sm:px-6 relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute inset-0 bg-gradient-to-br from-emerald-600 via-emerald-700 to-teal-700" />
          <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.04)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.04)_1px,transparent_1px)] bg-[size:40px_40px]" />
          <div className="absolute top-0 right-0 w-96 h-96 bg-white/5 rounded-full blur-3xl" />
        </div>
        <div className="relative max-w-3xl mx-auto text-center">
          <h2 className="text-3xl sm:text-4xl font-black text-white mb-4">
            Ready to Model Your Building's True Cost?
          </h2>
          <p className="text-emerald-100 mb-10 leading-relaxed max-w-xl mx-auto">
            Upload a blueprint, enter project parameters, and get a complete Bill of Quantities
            with 30-year lifecycle projections — in minutes.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <button onClick={onGetStarted}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-white hover:bg-emerald-50 text-emerald-700 font-bold text-base px-8 py-4 rounded-xl shadow-xl transition-all hover:-translate-y-0.5">
              Start Free Demo <ArrowRight className="w-4 h-4" />
            </button>
            <button onClick={onLogin}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 border-2 border-white/30 text-white font-bold text-base px-8 py-4 rounded-xl hover:bg-white/10 transition-all hover:-translate-y-0.5">
              Sign In to Platform
            </button>
          </div>
        </div>
      </section>

      {/* ── FOOTER ─────────────────────────────────────────────────────────── */}
      <footer className="py-12 px-4 sm:px-6 border-t border-slate-200 dark:border-white/8 bg-white dark:bg-[#0a0f1e]">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col sm:flex-row items-start justify-between gap-8">
            <div className="max-w-xs">
              <div className="flex items-center gap-2.5 mb-3">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-500 to-emerald-700 flex items-center justify-center">
                  <Building2 className="w-4 h-4 text-white" strokeWidth={2} />
                </div>
                <span className="text-base font-black text-slate-900 dark:text-white">BLCTS</span>
              </div>
              <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
                Building Lifecycle Cost Tracking System. AI-powered construction cost intelligence for Kenyan professionals.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-8 text-sm">
              <div>
                <p className="font-bold text-slate-800 dark:text-slate-200 mb-3">Platform</p>
                <div className="space-y-2 text-slate-500 dark:text-slate-400">
                  <p>Blueprint Analysis</p>
                  <p>Cost Estimation</p>
                  <p>BOQ Generation</p>
                  <p>Lifecycle Costing</p>
                </div>
              </div>
              <div>
                <p className="font-bold text-slate-800 dark:text-slate-200 mb-3">Roles</p>
                <div className="space-y-2 text-slate-500 dark:text-slate-400">
                  <p>Administrator</p>
                  <p>Building Owner</p>
                  <p>Facility Manager</p>
                </div>
              </div>
            </div>
          </div>
          <div className="mt-10 pt-6 border-t border-slate-200 dark:border-white/6 flex flex-col sm:flex-row items-center justify-between gap-3">
            <p className="text-xs text-slate-400">© 2026 BLCTS — Building Lifecycle Cost Tracking System</p>
            <p className="text-xs text-slate-400">AI-Powered Construction Cost Intelligence · Kenya</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
