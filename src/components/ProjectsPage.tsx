import React, { useState } from 'react';
import { Plus, MapPin, Building2, Layers, Calculator, FileText, FolderOpen, X, CircleCheck as CheckCircle2, Clock, MoveVertical as MoreVertical, Search } from 'lucide-react';
import type { User, Project, BuildingType, ConstructionStandard } from '../types';
import { Badge } from './ui/Badge';

const KENYA_COUNTIES = [
  'Nairobi', 'Mombasa', 'Kisumu', 'Nakuru', 'Eldoret',
  'Busia', 'Thika', 'Meru', 'Nyeri', 'Machakos',
];

const BUILDING_TYPES: BuildingType[] = [
  'Residential', 'Maisonette', 'Apartment', 'Commercial',
  'Office', 'Mixed-Use', 'Warehouse', 'School', 'Hospital', 'Industrial',
];

const STANDARDS: ConstructionStandard[] = ['Economy', 'Standard', 'Premium', 'Luxury'];

interface Props {
  projects: Project[];
  currentUser: User;
  onProjectsChange: (projects: Project[]) => void;
  onSelectProject: (projectId: string) => void;
  onUploadBlueprint: (projectId: string) => void;
  onViewEstimate: (projectId: string) => void;
}

type ProjectStatus = 'Planning' | 'Under Construction' | 'Active' | 'Archived';

interface FormState {
  name: string;
  location: string;
  county: string;
  buildingType: BuildingType;
  constructionStandard: ConstructionStandard;
  floorAreaPerFloor: string;
  floors: string;
  status: ProjectStatus;
}

const defaultForm: FormState = {
  name: '',
  location: '',
  county: KENYA_COUNTIES[0],
  buildingType: BUILDING_TYPES[0],
  constructionStandard: STANDARDS[1],
  floorAreaPerFloor: '',
  floors: '1',
  status: 'Planning',
};

const inputCls = 'w-full rounded-xl border border-slate-200 dark:border-white/12 bg-slate-50 dark:bg-white/4 px-3.5 py-2.5 text-sm text-slate-800 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition';
const labelCls = 'block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-1.5';

const STATUS_COLORS: Record<ProjectStatus, { badge: 'amber' | 'blue' | 'green' | 'slate'; dot: string }> = {
  Planning: { badge: 'amber', dot: 'bg-amber-500' },
  'Under Construction': { badge: 'blue', dot: 'bg-blue-500' },
  Active: { badge: 'green', dot: 'bg-emerald-500' },
  Archived: { badge: 'slate', dot: 'bg-slate-400' },
};

const STANDARD_COLORS: Record<ConstructionStandard, string> = {
  Economy: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300',
  Standard: 'bg-blue-100 text-blue-700 dark:bg-blue-950/40 dark:text-blue-400',
  Premium: 'bg-violet-100 text-violet-700 dark:bg-violet-950/40 dark:text-violet-400',
  Luxury: 'bg-amber-100 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400',
};

export default function ProjectsPage({
  projects,
  currentUser,
  onProjectsChange,
  onSelectProject,
  onUploadBlueprint,
  onViewEstimate,
}: Props) {
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState<FormState>(defaultForm);
  const [search, setSearch] = useState('');
  const [openMenu, setOpenMenu] = useState<string | null>(null);

  const myProjects = currentUser.role === 'Administrator'
    ? projects
    : projects.filter(p => p.ownerId === currentUser.id);

  const filtered = myProjects.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.county.toLowerCase().includes(search.toLowerCase()) ||
    p.buildingType.toLowerCase().includes(search.toLowerCase())
  );

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name.trim() || !form.floorAreaPerFloor || !form.floors) return;
    const newProject: Project = {
      id: crypto.randomUUID(),
      name: form.name.trim(),
      location: form.location.trim(),
      county: form.county,
      buildingType: form.buildingType,
      constructionStandard: form.constructionStandard,
      floorAreaPerFloor: Number(form.floorAreaPerFloor),
      floors: Number(form.floors),
      status: form.status,
      ownerId: currentUser.id,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    onProjectsChange([...projects, newProject]);
    setForm(defaultForm);
    setShowModal(false);
  }

  function handleDelete(id: string) {
    if (!confirm('Delete this project? This cannot be undone.')) return;
    onProjectsChange(projects.filter(p => p.id !== id));
    setOpenMenu(null);
  }

  const gfa = (p: Project) => p.floorAreaPerFloor * p.floors;

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-start justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white">Projects</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            {myProjects.length} project{myProjects.length !== 1 ? 's' : ''} registered
          </p>
        </div>
        {currentUser.role !== 'Facility Manager' && (
          <button
            onClick={() => setShowModal(true)}
            className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-semibold px-4 py-2.5 rounded-xl shadow-md shadow-emerald-600/20 transition-all hover:-translate-y-px"
          >
            <Plus className="w-4 h-4" /> New Project
          </button>
        )}
      </div>

      {/* Search + stats */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search projects by name, county, or type…"
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-white/12 bg-white dark:bg-white/4 text-sm text-slate-800 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition"
          />
        </div>
        <div className="flex gap-2">
          {[
            { label: 'Total', value: myProjects.length, color: 'text-slate-700 dark:text-slate-300' },
            { label: 'With Blueprint', value: myProjects.filter(p => p.blueprintAnalysis).length, color: 'text-emerald-600 dark:text-emerald-400' },
            { label: 'With Estimate', value: myProjects.filter(p => p.latestBoqId).length, color: 'text-blue-600 dark:text-blue-400' },
          ].map(s => (
            <div key={s.label} className="hidden sm:flex flex-col items-center px-4 py-2 rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-white/4 min-w-[70px]">
              <span className={`text-lg font-black tabular-nums ${s.color}`}>{s.value}</span>
              <span className="text-[10px] text-slate-400 dark:text-slate-500 font-semibold uppercase tracking-wide">{s.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Projects grid */}
      {filtered.length === 0 ? (
        <div className="rounded-2xl border-2 border-dashed border-slate-200 dark:border-white/10 bg-white dark:bg-[#0f1629] p-16 text-center">
          <div className="w-16 h-16 rounded-2xl bg-slate-100 dark:bg-white/6 flex items-center justify-center mx-auto mb-4">
            <FolderOpen className="w-8 h-8 text-slate-400 dark:text-slate-500" />
          </div>
          <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100 mb-2">
            {search ? 'No matching projects' : 'No projects yet'}
          </h3>
          <p className="text-sm text-slate-500 dark:text-slate-400 mb-6 max-w-sm mx-auto">
            {search
              ? `No projects match "${search}". Try a different search.`
              : 'Register your first building project to begin the cost estimation workflow.'}
          </p>
          {!search && currentUser.role !== 'Facility Manager' && (
            <button
              onClick={() => setShowModal(true)}
              className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-semibold px-5 py-2.5 rounded-xl shadow-md shadow-emerald-600/20 transition"
            >
              <Plus className="w-4 h-4" /> Create First Project
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map(project => {
            const statusInfo = STATUS_COLORS[project.status as ProjectStatus] ?? { badge: 'slate', dot: 'bg-slate-400' };
            const projectGfa = gfa(project);
            const hasBp = !!project.blueprintAnalysis;
            const hasEst = !!project.latestBoqId;

            return (
              <div
                key={project.id}
                className="group relative bg-white dark:bg-[#0f1629] border border-slate-200 dark:border-white/8 rounded-2xl overflow-hidden hover:border-slate-300 dark:hover:border-white/16 hover:shadow-lg dark:hover:shadow-black/30 transition-all hover:-translate-y-0.5"
              >
                {/* Top color bar */}
                <div className={`h-1 w-full ${
                  project.status === 'Active' ? 'bg-gradient-to-r from-emerald-500 to-emerald-600' :
                  project.status === 'Under Construction' ? 'bg-gradient-to-r from-blue-500 to-blue-600' :
                  project.status === 'Planning' ? 'bg-gradient-to-r from-amber-500 to-amber-600' :
                  'bg-slate-200 dark:bg-white/10'
                }`} />

                <div className="p-5">
                  {/* Header row */}
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-slate-100 to-slate-200 dark:from-white/8 dark:to-white/4 flex items-center justify-center flex-shrink-0">
                        <Building2 className="w-5 h-5 text-slate-600 dark:text-slate-300" />
                      </div>
                      <div className="min-w-0">
                        <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100 truncate leading-tight">{project.name}</h3>
                        <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5 flex items-center gap-1">
                          <MapPin className="w-3 h-3 flex-shrink-0" />
                          {project.county}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <Badge label={project.status} color={statusInfo.badge} />
                      <div className="relative">
                        <button
                          onClick={() => setOpenMenu(openMenu === project.id ? null : project.id)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-white/8 transition opacity-0 group-hover:opacity-100"
                        >
                          <MoreVertical className="w-4 h-4" />
                        </button>
                        {openMenu === project.id && (
                          <div className="absolute right-0 top-8 z-20 bg-white dark:bg-[#1a2235] border border-slate-200 dark:border-white/12 rounded-xl shadow-xl py-1 w-40 animate-fade-in">
                            <button
                              onClick={() => { onSelectProject(project.id); setOpenMenu(null); }}
                              className="w-full text-left px-3.5 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-white/6 transition"
                            >Select</button>
                            <button
                              onClick={() => { handleDelete(project.id); }}
                              className="w-full text-left px-3.5 py-2 text-sm text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/20 transition"
                            >Delete</button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Details */}
                  <div className="grid grid-cols-2 gap-2 mb-4">
                    {[
                      { label: 'Type', value: project.buildingType },
                      { label: 'Standard', value: project.constructionStandard, className: STANDARD_COLORS[project.constructionStandard] },
                      { label: 'GFA', value: `${projectGfa.toLocaleString()} m²` },
                      { label: 'Floors', value: `${project.floors} floor${project.floors !== 1 ? 's' : ''}` },
                    ].map(d => (
                      <div key={d.label} className="bg-slate-50 dark:bg-white/3 rounded-lg px-2.5 py-2">
                        <p className="text-[9px] font-bold uppercase tracking-wide text-slate-400 dark:text-slate-500">{d.label}</p>
                        <p className={`text-xs font-semibold mt-0.5 truncate ${d.className ?? 'text-slate-700 dark:text-slate-300'}`}>{d.value}</p>
                      </div>
                    ))}
                  </div>

                  {/* Progress indicators */}
                  <div className="flex items-center gap-2 mb-4">
                    {[
                      { icon: CheckCircle2, label: 'Blueprint', done: hasBp },
                      { icon: Calculator, label: 'Estimate', done: hasEst },
                      { icon: FileText, label: 'Report', done: hasEst },
                    ].map(step => {
                      const Icon = step.icon;
                      return (
                        <div key={step.label} className={`flex items-center gap-1 text-xs px-2 py-1 rounded-full ${
                          step.done
                            ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400'
                            : 'bg-slate-100 text-slate-400 dark:bg-white/4 dark:text-slate-500'
                        }`}>
                          <Icon className="w-3 h-3" />
                          <span className="font-medium hidden sm:inline">{step.label}</span>
                        </div>
                      );
                    })}
                    {!hasBp && (
                      <span className="text-[10px] text-amber-600 dark:text-amber-400 font-semibold flex items-center gap-1">
                        <Clock className="w-3 h-3" /> Blueprint needed
                      </span>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2">
                    <button
                      onClick={() => { onSelectProject(project.id); onUploadBlueprint(project.id); }}
                      className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-white/4 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-white/8 hover:border-slate-300 dark:hover:border-white/16 transition"
                    >
                      <Layers className="w-3.5 h-3.5" />
                      {hasBp ? 'Re-analyse' : 'Upload Blueprint'}
                    </button>
                    <button
                      onClick={() => { onSelectProject(project.id); onViewEstimate(project.id); }}
                      className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-sm shadow-emerald-600/20 transition"
                    >
                      <Calculator className="w-3.5 h-3.5" />
                      {hasEst ? 'View Estimate' : 'Estimate Cost'}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ── Create Project Modal ─────────────────────────────────────────── */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Overlay */}
          <div className="absolute inset-0 bg-slate-900/70 backdrop-blur-sm" onClick={() => setShowModal(false)} />

          <div className="relative z-10 w-full max-w-xl bg-white dark:bg-[#0f1629] rounded-2xl shadow-2xl border border-slate-200 dark:border-white/12 animate-slide-up max-h-[90vh] overflow-y-auto">
            {/* Modal header */}
            <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100 dark:border-white/8">
              <div>
                <h2 className="text-lg font-bold text-slate-900 dark:text-white">Register New Project</h2>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">Enter building details to begin the cost estimation workflow</p>
              </div>
              <button
                onClick={() => setShowModal(false)}
                className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-white/8 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {/* Name */}
              <div>
                <label className={labelCls}>Project Name *</label>
                <input required className={inputCls} placeholder="e.g. Westlands Office Complex" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
              </div>

              {/* Location + County */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={labelCls}>Location / Address</label>
                  <input className={inputCls} placeholder="Street / area" value={form.location} onChange={e => setForm(f => ({ ...f, location: e.target.value }))} />
                </div>
                <div>
                  <label className={labelCls}>County *</label>
                  <select required className={inputCls} value={form.county} onChange={e => setForm(f => ({ ...f, county: e.target.value }))}>
                    {KENYA_COUNTIES.map(c => <option key={c}>{c}</option>)}
                  </select>
                </div>
              </div>

              {/* Building Type + Standard */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={labelCls}>Building Type *</label>
                  <select required className={inputCls} value={form.buildingType} onChange={e => setForm(f => ({ ...f, buildingType: e.target.value as BuildingType }))}>
                    {BUILDING_TYPES.map(t => <option key={t}>{t}</option>)}
                  </select>
                </div>
                <div>
                  <label className={labelCls}>Construction Standard *</label>
                  <select required className={inputCls} value={form.constructionStandard} onChange={e => setForm(f => ({ ...f, constructionStandard: e.target.value as ConstructionStandard }))}>
                    {STANDARDS.map(s => <option key={s}>{s}</option>)}
                  </select>
                </div>
              </div>

              {/* GFA + Floors */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={labelCls}>Floor Area per Floor (m²) *</label>
                  <input required type="number" min="10" max="50000" className={inputCls} placeholder="e.g. 250" value={form.floorAreaPerFloor} onChange={e => setForm(f => ({ ...f, floorAreaPerFloor: e.target.value }))} />
                </div>
                <div>
                  <label className={labelCls}>Number of Floors *</label>
                  <input required type="number" min="1" max="100" className={inputCls} placeholder="1" value={form.floors} onChange={e => setForm(f => ({ ...f, floors: e.target.value }))} />
                </div>
              </div>

              {/* Status */}
              <div>
                <label className={labelCls}>Project Status</label>
                <select className={inputCls} value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value as ProjectStatus }))}>
                  {(['Planning', 'Under Construction', 'Active', 'Archived'] as ProjectStatus[]).map(s => <option key={s}>{s}</option>)}
                </select>
              </div>

              {/* GFA preview */}
              {form.floorAreaPerFloor && form.floors && (
                <div className="flex items-center gap-2 bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800/50 rounded-xl px-4 py-3">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 flex-shrink-0" />
                  <p className="text-sm text-emerald-700 dark:text-emerald-400">
                    Total GFA: <strong>{(Number(form.floorAreaPerFloor) * Number(form.floors)).toLocaleString()} m²</strong>
                    {' '}· {form.buildingType} · {form.county}
                  </p>
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowModal(false)}
                  className="flex-1 py-2.5 rounded-xl border border-slate-200 dark:border-white/12 text-sm font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-white/6 transition">
                  Cancel
                </button>
                <button type="submit"
                  disabled={!form.name.trim() || !form.floorAreaPerFloor}
                  className="flex-1 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:bg-emerald-600/40 disabled:cursor-not-allowed text-white text-sm font-semibold shadow-md shadow-emerald-600/20 transition">
                  Create Project
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Close menus on outside click */}
      {openMenu && (
        <div className="fixed inset-0 z-10" onClick={() => setOpenMenu(null)} />
      )}
    </div>
  );
}
