import { Building2, ArrowRight, CircleCheck as CheckCircle2, TrendingUp, Shield, Layers, DollarSign, Wrench, FileText, Moon, Sun } from 'lucide-react';

interface Props {
  isDark: boolean;
  onToggleDark: () => void;
  onLogin: () => void;
  onGetStarted: () => void;
}

export default function LandingPageNew({ isDark, onToggleDark, onLogin, onGetStarted }: Props) {
  const features = [
    { icon: Layers, title: 'AI Blueprint Analysis', desc: 'Upload architectural blueprints and let Gemini AI extract building parameters automatically — floor area, room counts, construction standard.' },
    { icon: DollarSign, title: 'BOQ Cost Estimation', desc: 'Generate detailed Bill of Quantities aligned to Kenya NCA and BORAQS quantity survey standards with regional pricing.' },
    { icon: TrendingUp, title: 'Lifecycle Cost Forecasting', desc: 'Project 30-year maintenance, energy, and operational costs with inflation-adjusted net present value calculations.' },
    { icon: Wrench, title: 'Maintenance Management', desc: 'Schedule preventive and corrective maintenance tasks, assign to facility managers, and track costs in real-time.' },
    { icon: FileText, title: 'Professional Reports', desc: 'Export comprehensive project reports with cost breakdowns, lifecycle charts, and maintenance schedules.' },
    { icon: Shield, title: 'Role-Based Access', desc: 'Secure multi-role platform for Administrators, Building Owners, and Facility Managers with granular permissions.' },
  ];

  const stats = [
    { value: '44', label: 'Material Items' },
    { value: '10', label: 'Counties Priced' },
    { value: '30', label: 'Year Forecast' },
    { value: '3', label: 'User Roles' },
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
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-24 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-100 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 text-xs font-semibold mb-6 animate-fade-in">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            AI-Powered Building Cost Intelligence
          </div>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight mb-6 max-w-3xl mx-auto leading-[1.1]">
            Building Lifecycle
            <span className="block text-emerald-600 dark:text-emerald-400">Cost Tracking System</span>
          </h1>
          <p className="text-lg text-slate-500 dark:text-slate-400 max-w-2xl mx-auto mb-10 leading-relaxed">
            From blueprint to lifecycle — estimate construction costs, forecast 30-year
            operational expenses, and manage maintenance across Kenyan counties.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <button
              onClick={onGetStarted}
              className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold px-6 py-3.5 rounded-xl transition shadow-lg shadow-emerald-600/25 hover:-translate-y-px"
            >
              Start Free Trial
              <ArrowRight className="w-4 h-4" />
            </button>
            <button
              onClick={onLogin}
              className="inline-flex items-center gap-2 border border-slate-300 dark:border-white/10 hover:border-slate-400 dark:hover:border-white/20 text-slate-700 dark:text-slate-300 font-semibold px-6 py-3.5 rounded-xl transition"
            >
              Sign In
            </button>
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
          <h2 className="text-3xl font-black tracking-tight mb-3">Everything you need to manage building costs</h2>
          <p className="text-slate-500 dark:text-slate-400 max-w-2xl mx-auto">
            A complete platform covering the entire building lifecycle — from initial cost estimation to long-term maintenance planning.
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
          <h2 className="text-3xl font-black tracking-tight mb-3">A simple, powerful workflow</h2>
          <p className="text-slate-500 dark:text-slate-400">From blueprint upload to lifecycle report in five steps.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          {[
            { step: '01', title: 'Create Project', desc: 'Define building name, location, and type' },
            { step: '02', title: 'Upload Blueprint', desc: 'AI extracts floor area and room data' },
            { step: '03', title: 'Cost Estimation', desc: 'Generate BOQ with regional pricing' },
            { step: '04', title: 'Lifecycle Analysis', desc: 'Forecast 30-year operational costs' },
            { step: '05', title: 'Reports', desc: 'Export professional cost reports' },
          ].map(s => (
            <div key={s.step} className="relative rounded-2xl border border-slate-200 dark:border-white/8 bg-white dark:bg-[#0f1629] p-5">
              <span className="text-xs font-black text-emerald-600 dark:text-emerald-400 tabular-nums">{s.step}</span>
              <h3 className="text-sm font-bold mt-2 mb-1">{s.title}</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">{s.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="rounded-3xl bg-gradient-to-br from-emerald-600 to-emerald-800 p-10 sm:p-16 text-center text-white relative overflow-hidden">
          <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.08)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.08)_1px,transparent_1px)] bg-[size:32px_32px]" />
          <div className="relative">
            <h2 className="text-3xl font-black mb-4">Ready to get started?</h2>
            <p className="text-emerald-100 max-w-xl mx-auto mb-8">
              Join the platform transforming how building costs are tracked and managed across Kenya.
            </p>
            <button
              onClick={onGetStarted}
              className="inline-flex items-center gap-2 bg-white text-emerald-700 font-bold px-6 py-3.5 rounded-xl hover:bg-emerald-50 transition shadow-lg hover:-translate-y-px"
            >
              Get Started Now
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-200 dark:border-white/8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-emerald-500 to-emerald-700 flex items-center justify-center">
              <Building2 className="w-4 h-4 text-white" />
            </div>
            <span className="text-sm font-bold">BLCTS</span>
            <span className="text-xs text-slate-400 ml-2">v2.0.0 — Presentation Build</span>
          </div>
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
            Final Year Project — Building Lifecycle Cost Tracking
          </div>
        </div>
      </footer>
    </div>
  );
}
