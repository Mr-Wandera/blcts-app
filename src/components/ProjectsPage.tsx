import { useState } from 'react';
import type { Project, User, BuildingType, ConstructionStandard } from '../types';
import { Building2, MapPin, Plus, FileImage, Calculator, Trash2, X, Layers, Calendar } from 'lucide-react';
import { useToast } from './ui/Toast';

interface Props {
  projects: Project[];
  currentUser: User;
  onProjectsChange: (projects: Project[]) => void;
  onSelectProject: (id: string) => void;
  onUploadBlueprint: (id: string) => void;
  onViewEstimate: (id: string) => void;
}

const BUILDING_TYPES: BuildingType[] = ['Residential', 'Maisonette', 'Apartment', 'Commercial', 'Office', 'Mixed-Use', 'Warehouse', 'School', 'Hospital', 'Industrial'];
const CONSTRUCTION_STANDARDS: ConstructionStandard[] = ['Economy', 'Standard', 'Premium', 'Luxury'];
const COUNTIES = ['Nairobi', 'Mombasa', 'Kisumu', 'Nakuru', 'Kiambu', 'Machakos', 'Kajiado', 'Uasin Gishu', 'Nyeri', 'Meru'];

const inputBase = 'w-full px-3.5 py-2.5 rounded-xl border bg-white dark:bg-[#0f1629] text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition';
const labelBase = 'block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-1.5';

export default function ProjectsPage({ projects, currentUser, onProjectsChange, onSelectProject, onUploadBlueprint, onViewEstimate }: Props) {
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState({
    name: '',
    location: '',
    county: 'Nairobi',
    buildingType: 'Residential' as BuildingType,
    constructionStandard: 'Standard' as ConstructionStandard,
    floorAreaPerFloor: 0,
    floors: 1,
  });
  const { show } = useToast();

  const canCreate = currentUser.role === 'Administrator' || currentUser.role === 'Building Owner';

  function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name.trim()) { show('Project name is required', 'error'); return; }
    const project: Project = {
      id: `proj-${Date.now()}`,
      name: form.name.trim(),
      location: form.location.trim(),
      county: form.county,
      buildingType: form.buildingType,
      constructionStandard: form.constructionStandard,
      floorAreaPerFloor: form.floorAreaPerFloor,
      floors: form.floors,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    onProjectsChange([...projects, project]);
    setForm({ name: '', location: '', county: 'Nairobi', buildingType: 'Residential', constructionStandard: 'Standard', floorAreaPerFloor: 0, floors: 1 });
    setShowCreate(false);
    show('Project created successfully', 'success');
  }

  function handleDelete(id: string) {
    onProjectsChange(projects.filter(p => p.id !== id));
    show('Project deleted', 'success');
  }

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Projects</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Manage your building projects and track their lifecycle costs.</p>
        </div>
        {canCreate && (
          <button
            onClick={() => setShowCreate(true)}
            className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold px-4 py-2.5 rounded-xl transition shadow-sm hover:shadow-md"
          >
            <Plus className="w-4 h-4" />
            New Project
          </button>
        )}
      </div>

      {projects.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-300 dark:border-white/10 p-12 text-center">
          <div className="w-14 h-14 rounded-2xl bg-slate-100 dark:bg-white/5 flex items-center justify-center mx-auto mb-4">
            <Building2 className="w-7 h-7 text-slate-300 dark:text-slate-600" />
          </div>
          <p className="text-sm font-semibold text-slate-600 dark:text-slate-300 mb-1">No projects yet</p>
          <p className="text-xs text-slate-400 mb-4">
            {canCreate ? 'Create your first project to begin tracking costs.' : 'Projects will appear here once created.'}
          </p>
          {canCreate && (
            <button onClick={() => setShowCreate(true)} className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold px-4 py-2.5 rounded-xl transition shadow-sm">
              <Plus className="w-4 h-4" />
              Create Project
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {projects.map(p => (
            <div key={p.id} className="rounded-2xl border border-slate-200 dark:border-white/8 bg-white dark:bg-[#0f1629] p-5 hover:shadow-md transition group">
              <div className="flex items-start justify-between mb-3">
                <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950/30 flex items-center justify-center">
                  <Building2 className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                </div>
                <div className="flex items-center gap-1.5">
                  {p.blueprintAnalysis ? (
                    <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400">Analyzed</span>
                  ) : (
                    <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-500 dark:bg-white/5 dark:text-slate-400">Pending</span>
                  )}
                  {canCreate && (
                    <button onClick={() => handleDelete(p.id)} className="opacity-0 group-hover:opacity-100 text-slate-400 hover:text-rose-500 transition p-1">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
              <p className="text-sm font-bold text-slate-800 dark:text-slate-100 truncate">{p.name}</p>
              <div className="flex items-center gap-1 text-xs text-slate-400 mt-1">
                <MapPin className="w-3 h-3" />
                {p.county || p.location || 'Location TBD'}
              </div>
              <div className="flex items-center gap-3 mt-3 text-xs text-slate-500 dark:text-slate-400">
                <span className="flex items-center gap-1"><Layers className="w-3 h-3" />{p.buildingType}</span>
                <span>·</span>
                <span>{p.floors} floors</span>
                {p.floorAreaPerFloor > 0 && <><span>·</span><span>{(p.floorAreaPerFloor * p.floors).toLocaleString()} m²</span></>}
              </div>
              <div className="flex items-center gap-1.5 text-xs text-slate-400 mt-2">
                <Calendar className="w-3 h-3" />
                {new Date(p.createdAt).toLocaleDateString()}
              </div>
              <div className="flex gap-2 mt-4">
                {canCreate && (
                  <button onClick={() => onUploadBlueprint(p.id)} className="flex-1 inline-flex items-center justify-center gap-1.5 text-xs font-semibold text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-white/10 rounded-lg px-3 py-2 hover:bg-slate-50 dark:hover:bg-white/5 transition">
                    <FileImage className="w-3.5 h-3.5" />
                    Blueprint
                  </button>
                )}
                <button onClick={() => onViewEstimate(p.id)} className="flex-1 inline-flex items-center justify-center gap-1.5 text-xs font-semibold text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/50 rounded-lg px-3 py-2 hover:bg-emerald-50 dark:hover:bg-emerald-950/20 transition">
                  <Calculator className="w-3.5 h-3.5" />
                  Estimate
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create modal */}
      {showCreate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm" onClick={() => setShowCreate(false)}>
          <div className="w-full max-w-lg bg-white dark:bg-[#0f1629] rounded-2xl shadow-2xl border border-slate-200 dark:border-white/10 animate-scale-in" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-white/8">
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">Create New Project</h2>
              <button onClick={() => setShowCreate(false)} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleCreate} className="p-6 space-y-4">
              <div>
                <label className={labelBase}>Project Name</label>
                <input type="text" required value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="e.g. Westlands Office Tower" className={inputBase} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={labelBase}>Location</label>
                  <input type="text" value={form.location} onChange={e => setForm(f => ({ ...f, location: e.target.value }))} placeholder="e.g. Westlands" className={inputBase} />
                </div>
                <div>
                  <label className={labelBase}>County</label>
                  <select value={form.county} onChange={e => setForm(f => ({ ...f, county: e.target.value }))} className={inputBase + ' appearance-none cursor-pointer'} style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%2394a3b8' stroke-width='2'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 12px center', paddingRight: '36px' }}>
                    {COUNTIES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={labelBase}>Building Type</label>
                  <select value={form.buildingType} onChange={e => setForm(f => ({ ...f, buildingType: e.target.value as BuildingType }))} className={inputBase + ' appearance-none cursor-pointer'} style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%2394a3b8' stroke-width='2'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 12px center', paddingRight: '36px' }}>
                    {BUILDING_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
                <div>
                  <label className={labelBase}>Construction Standard</label>
                  <select value={form.constructionStandard} onChange={e => setForm(f => ({ ...f, constructionStandard: e.target.value as ConstructionStandard }))} className={inputBase + ' appearance-none cursor-pointer'} style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%2394a3b8' stroke-width='2'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 12px center', paddingRight: '36px' }}>
                    {CONSTRUCTION_STANDARDS.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={labelBase}>Floor Area per Floor (m²)</label>
                  <input type="number" min="0" value={form.floorAreaPerFloor || ''} onChange={e => setForm(f => ({ ...f, floorAreaPerFloor: Number(e.target.value) }))} placeholder="0" className={inputBase} />
                </div>
                <div>
                  <label className={labelBase}>Number of Floors</label>
                  <input type="number" min="1" value={form.floors} onChange={e => setForm(f => ({ ...f, floors: Number(e.target.value) }))} className={inputBase} />
                </div>
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowCreate(false)} className="flex-1 py-2.5 rounded-xl border border-slate-200 dark:border-white/10 text-slate-600 dark:text-slate-300 text-sm font-semibold hover:bg-slate-50 dark:hover:bg-white/5 transition">
                  Cancel
                </button>
                <button type="submit" className="flex-1 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold transition shadow-sm">
                  Create Project
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
