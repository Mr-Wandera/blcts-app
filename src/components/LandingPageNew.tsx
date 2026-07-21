import {
  Building2, ArrowRight, Moon, Sun,
  Layers, DollarSign, TrendingUp, Wrench, FileText, Shield, MapPin,
  Upload, ScanLine, Calculator, BarChart3, FileBarChart, Target,
  Clock, BadgeCheck, Database, GraduationCap, Github,
} from 'lucide-react';

interface Props {
  isDark: boolean;
  onToggleDark: () => void;
  onLogin: () => void;
  onGetStarted: () => void;
}

export default function LandingPageNew({ isDark, onToggleDark, onLogin, onGetStarted }: Props) {
  const features = [
    { icon: ScanLine,    title: 'AI Blueprint Analysis',     desc: 'Upload architectural drawings and let Google Gemini 2.5 Flash extract floor area, room counts, building type, and structural observations automatically.' },
    { icon: Layers,      title: 'Gross Floor Area Calculation', desc: 'Derive GFA mathematically from AI-extracted floor area and storey count — no manual input, no invented values.' },
    { icon: FileText,    title: 'BOQ Generation',             desc: 'Generate a 21-line Bill of Quantities aligned to Standard Method of Measurement, with per-component quantities and unit rates.' },
    { icon: MapPin,      title: 'Regional Pricing',           desc: 'County-based cost-per-square-metre rates for 10 Kenyan counties, with municipal adjustment factors for towns like Thika.' },
    { icon: TrendingUp,  title: 'Lifecycle Cost Analysis',    desc: 'Forecast 30-year operational expenditure — maintenance, utilities, insurance, inspections — with 6% annual inflation adjustment.' },
    { icon: FileBarChart, title: 'PDF Reports',              desc: 'Export professional cost statements and BOQ breakdowns via print-optimised layouts suitable for submission.' },
    { icon: Shield,      title: 'Secure Authentication',     desc: 'Supabase email/password authentication with Row Level Security and role-based access for Administrators, Building Owners, and Facility Managers.' },
  ];

  const workflow = [
    { icon: Upload,       title: 'Upload Blueprint',       desc: 'Select an architectural drawing in JPEG, PNG, WebP, or PDF format.' },
    { icon: ScanLine,     title: 'AI Analysis',            desc: 'Gemini 2.5 Flash analyses the drawing and identifies building parameters.' },
    { icon: Calculator,   title: 'Extract Measurements',  desc: 'Floor area, storey count, room counts, and building type are extracted from the drawing.' },
    { icon: Layers,       title: 'Calculate GFA',         desc: 'Gross Floor Area is computed from extracted area and storey count.' },
    { icon: FileText,     title: 'Generate BOQ',          desc: 'A 21-line Bill of Quantities is produced with SMM-based quantities.' },
    { icon: MapPin,       title: 'Apply Regional Pricing', desc: 'County-specific rates are applied to determine cost per square metre.' },
    { icon: TrendingUp,   title: 'Lifecycle Cost Analysis', desc: '30-year operational expenditure is projected with inflation adjustment.' },
    { icon: FileBarChart, title: 'Generate Report',       desc: 'Export or print a professional cost statement for the project.' },
  ];

  const benefits = [
    { icon: Clock,        title: 'Faster Estimation',      desc: 'Reduce manual quantity surveying from hours to minutes through AI-assisted blueprint analysis.' },
    { icon: BadgeCheck,   title: 'Accurate Costing',       desc: 'Eliminate transcription errors with a deterministic calculation pipeline from extraction to BOQ.' },
    { icon: MapPin,       title: 'County-Based Pricing',   desc: 'Reflect real regional material, labour, and transport cost variations across 10 Kenyan counties.' },
    { icon: Target,       title: 'Better Decision Making', desc: 'Compare construction and lifecycle costs across building types, standards, and counties.' },
    { icon: FileBarChart, title: 'Professional Reporting', desc: 'Produce submission-ready cost statements with full BOQ and lifecycle breakdowns.' },
    { icon: TrendingUp,   title: 'Lifecycle Planning',     desc: 'Understand total cost of ownership, not just construction cost, over a 30-year horizon.' },
  ];

  const stats = [
    { value: '10',  label: 'Counties Priced' },
    { value: '44',   label: 'Material Items' },
    { value: '30',   label: 'Year Forecast' },
    { value: '21',   label: 'BOQ Components' },
  ];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0a0f1e] text-slate-900 dark:text-white">
      {/* Nav */}
      <nav className="sticky top-0 z-50 backdrop-blur-xl bg-white/80 dark:bg-[#0a0f1e]/80 border-b border-slate-200 dark:border-white/8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-700 flex items-center justify-center shadow-lg shadow-emerald-600/20">
              <Building2 className="w-5 h-5 text-white" />
            </div>
            <span className="text-lg font-black tracking-tight">BLCTS</span>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={onToggleDark}
              className="w-9 h-9 rounded-xl border border-slate-200 dark:border-white/10 flex items-center justify-center text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/5 transition"
              aria-label="Toggle dark mode"
            >
              {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>
            <button
              onClick={onLogin}
              className="text-sm font-semibold text-slate-700 dark:text-slate-300 hover:text-emerald-600 dark:hover:text-emerald-400 transition px-3 py-2"
            >
              Sign In
            </button>
            <button
              onClick={onGetStarted}
              className="inline-flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold px-4 py-2.5 rounded-xl transition shadow-sm hover:shadow-md"
            >
              Get Started
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute inset-0 bg-[linear-gradient(rgba(16,185,129,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(16,185,129,0.03)_1px,transparent_1px)] bg-[size:48px_48px]" />
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-emerald-500/8 rounded-full blur-[140px]" />
        </div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-24">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="text-center lg:text-left">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-100 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 text-xs font-semibold mb-6 animate-fade-in">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                AI-Assisted Engineering Cost Analysis
              </div>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight mb-6 leading-[1.1]">
                Building Lifecycle
                <span className="block text-emerald-600 dark:text-emerald-400">Cost Tracking System</span>
              </h1>
              <p className="text-lg text-slate-500 dark:text-slate-400 max-w-xl mx-auto lg:mx-0 mb-10 leading-relaxed">
                BLCTS assists engineers, quantity surveyors, project managers, and students in
                analysing building lifecycle costs using AI-assisted blueprint analysis and
                cost estimation across Kenyan counties.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-3">
                <button
                  onClick={onGetStarted}
                  className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold px-8 py-3.5 rounded-xl transition shadow-lg shadow-emerald-600/25 hover:-translate-y-px w-full sm:w-auto justify-center"
                >
                  Get Started
                  <ArrowRight className="w-4 h-4" />
                </button>
                <button
                  onClick={onLogin}
                  className="inline-flex items-center gap-2 border border-slate-300 dark:border-white/10 hover:border-slate-400 dark:hover:border-white/20 text-slate-700 dark:text-slate-300 font-semibold px-6 py-3.5 rounded-xl transition w-full sm:w-auto justify-center"
                >
                  Sign In
                </button>
              </div>
            </div>

            {/* Illustration */}
            <div className="hidden lg:block">
              <div className="relative rounded-2xl border border-slate-200 dark:border-white/8 bg-white dark:bg-[#0f1629] p-8 shadow-xl">
                <div className="absolute inset-0 rounded-2xl bg-[linear-gradient(rgba(16,185,129,0.04)_1px,transparent_1px),linear-gradient(90deg,rgba(16,185,129,0.04)_1px,transparent_1px)] bg-[size:24px_24px]" />
                <div className="relative space-y-4">
                  <div className="flex items-center gap-3 pb-3 border-b border-slate-200 dark:border-white/8">
                    <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 flex items-center justify-center">
                      <ScanLine className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                    </div>
                    <div>
                      <p className="text-sm font-bold">Blueprint Analysis</p>
                      <p className="text-xs text-slate-500 dark:text-slate-400">Gemini 2.5 Flash</p>
                    </div>
                  </div>
                  {[
                    { label: 'Estimated Floor Area', value: '240 m²' },
                    { label: 'Storeys', value: '1' },
                    { label: 'Building Type', value: 'Residential' },
                    { label: 'Confidence', value: '1.00' },
                  ].map(row => (
                    <div key={row.label} className="flex items-center justify-between text-sm">
                      <span className="text-slate-500 dark:text-slate-400">{row.label}</span>
                      <span className="font-semibold tabular-nums">{row.value}</span>
                    </div>
                  ))}
                  <div className="pt-3 border-t border-slate-200 dark:border-white/8">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-slate-500 dark:text-slate-400">Total Project Cost</span>
                      <span className="font-black text-emerald-600 dark:text-emerald-400 tabular-nums">KSh 16.6M</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-16 max-w-3xl mx-auto">
            {stats.map(s => (
              <div key={s.label} className="text-center">
                <p className="text-3xl font-black text-emerald-600 dark:text-emerald-400 tabular-nums">{s.value}</p>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 uppercase tracking-wide">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center mb-14">
          <h2 className="text-3xl font-black tracking-tight mb-3">Platform Capabilities</h2>
          <p className="text-slate-500 dark:text-slate-400 max-w-2xl mx-auto">
            A complete engineering toolset covering the entire building lifecycle — from AI-assisted
            blueprint analysis to 30-year cost forecasting.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map(f => (
            <div
              key={f.title}
              className="group rounded-2xl border border-slate-200 dark:border-white/8 bg-white dark:bg-[#0f1629] p-6 hover:border-emerald-300 dark:hover:border-emerald-800/50 hover:shadow-lg transition-all"
            >
              <div className="w-12 h-12 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <f.icon className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
              </div>
              <h3 className="text-base font-bold mb-2">{f.title}</h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Workflow */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center mb-14">
          <h2 className="text-3xl font-black tracking-tight mb-3">Analysis Workflow</h2>
          <p className="text-slate-500 dark:text-slate-400">From blueprint upload to lifecycle report in eight steps.</p>
        </div>
        <div className="space-y-3">
          {workflow.map((s, i) => (
            <div key={s.title}>
              <div className="flex items-center gap-4 rounded-2xl border border-slate-200 dark:border-white/8 bg-white dark:bg-[#0f1629] p-4 sm:p-5 max-w-3xl mx-auto">
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 flex items-center justify-center flex-shrink-0">
                  <s.icon className="w-5 h-5 sm:w-6 sm:h-6 text-emerald-600 dark:text-emerald-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-black text-emerald-600 dark:text-emerald-400 tabular-nums">
                      {String(i + 1).padStart(2, '0')}
                    </span>
                    <h3 className="text-sm sm:text-base font-bold">{s.title}</h3>
                  </div>
                  <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">{s.desc}</p>
                </div>
              </div>
              {i < workflow.length - 1 && (
                <div className="flex justify-center py-1">
                  <ArrowRight className="w-4 h-4 text-slate-300 dark:text-slate-600 rotate-90" />
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* Benefits */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center mb-14">
          <h2 className="text-3xl font-black tracking-tight mb-3">Engineering Benefits</h2>
          <p className="text-slate-500 dark:text-slate-400 max-w-2xl mx-auto">
            Practical advantages for quantity surveyors, project managers, and students working with
            construction cost data.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {benefits.map(b => (
            <div
              key={b.title}
              className="rounded-2xl border border-slate-200 dark:border-white/8 bg-white dark:bg-[#0f1629] p-6"
            >
              <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 flex items-center justify-center mb-4">
                <b.icon className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
              </div>
              <h3 className="text-sm font-bold mb-2">{b.title}</h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">{b.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* About BLCTS */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="rounded-3xl border border-slate-200 dark:border-white/8 bg-white dark:bg-[#0f1629] p-8 sm:p-12">
          <div className="grid lg:grid-cols-3 gap-8">
            <div>
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-700 flex items-center justify-center mb-4 shadow-lg shadow-emerald-600/20">
                <Building2 className="w-6 h-6 text-white" />
              </div>
              <h2 className="text-2xl font-black tracking-tight mb-2">About BLCTS</h2>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Building Lifecycle Cost Tracking System — a professional engineering platform for
                AI-assisted construction cost estimation and lifecycle planning.
              </p>
            </div>
            <div className="space-y-6 lg:col-span-2">
              <div>
                <h3 className="text-sm font-bold mb-1.5 flex items-center gap-2">
                  <Target className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  Problem Addressed
                </h3>
                <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
                  Construction cost estimation in Kenya relies on manual quantity surveying, which is
                  time-consuming, error-prone, and lacks regional pricing accuracy. Existing tools do
                  not address the full building lifecycle from construction through 30-year operational
                  costs.
                </p>
              </div>
              <div>
                <h3 className="text-sm font-bold mb-1.5 flex items-center gap-2">
                  <BadgeCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  Objectives
                </h3>
                <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
                  To develop a web-based system that uses AI-assisted blueprint analysis to extract
                  building parameters, generate Bills of Quantities with county-specific pricing, and
                  forecast long-term lifecycle costs — providing a single platform for construction
                  cost intelligence.
                </p>
              </div>
              <div>
                <h3 className="text-sm font-bold mb-1.5 flex items-center gap-2">
                  <GraduationCap className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  Intended Users
                </h3>
                <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
                  Quantity surveyors and construction cost consultants who need rapid BOQ generation;
                  building owners evaluating project feasibility; facility managers planning
                  maintenance budgets; and students learning construction cost estimation practices.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-200 dark:border-white/8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-emerald-500 to-emerald-700 flex items-center justify-center">
                <Building2 className="w-4 h-4 text-white" />
              </div>
              <span className="text-sm font-bold">BLCTS</span>
              <span className="text-xs text-slate-400 ml-2">v2.0.0</span>
            </div>
            <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-4 text-xs text-slate-400">
              <span className="flex items-center gap-1.5">
                <Database className="w-3.5 h-3.5" />
                Supabase + Gemini AI
              </span>
            </div>
          </div>
          <div className="mt-4 pt-4 border-t border-slate-100 dark:border-white/5 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-slate-400">
            <p>Building Lifecycle Cost Tracking System</p>
            <a
              href="https://github.com"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 hover:text-emerald-600 dark:hover:text-emerald-400 transition"
            >
              <Github className="w-3.5 h-3.5" />
              GitHub Repository
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
