import React, { useState } from 'react';
import { CirclePlus as PlusCircle, MapPin, Building2, Layers, Upload, Eye, FolderOpen, X, FileCheck } from 'lucide-react';
import { User, Project, BuildingType, ConstructionStandard } from '../types';
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

const STATUS_BADGE_COLORS: Record<ProjectStatus, string> = {
  Planning: 'bg-amber-100 text-amber-700',
  'Under Construction': 'bg-blue-100 text-blue-700',
  Active: 'bg-green-100 text-green-700',
  Archived: 'bg-slate-100 text-slate-600',
};

const inputClass =
  'w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-800 ' +
  'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ' +
  'placeholder:text-slate-400 transition';

const labelClass = 'block text-sm font-medium text-slate-700 mb-1';

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

  function openModal() {
    setForm(defaultForm);
    setShowModal(true);
  }

  function closeModal() {
    setShowModal(false);
  }

  function handleChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const newProject: Project = {
      id: crypto.randomUUID(),
      name: form.name,
      location: form.location,
      county: form.county,
      buildingType: form.buildingType as BuildingType,
      constructionStandard: form.constructionStandard as ConstructionStandard,
      floorAreaPerFloor: Number(form.floorAreaPerFloor),
      floors: Number(form.floors),
      status: form.status,
      ownerId: currentUser.id,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    onProjectsChange([...projects, newProject]);
    closeModal();
  }

  const gfa = (project: Project) => project.floorAreaPerFloor * project.floors;

  const statusBadgeClass = (status: string) =>
    `inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${
      STATUS_BADGE_COLORS[status as ProjectStatus] ?? 'bg-slate-100 text-slate-600'
    }`;

  return (
    <div className="min-h-full bg-white dark:bg-transparent p-0">
        {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-bold text-slate-800 dark:text-white">My Projects</h1>
          <span className="inline-flex items-center justify-center rounded-full bg-slate-200 text-slate-700 text-sm font-semibold px-3 py-0.5 min-w-[2rem]">
            {projects.length}
          </span>
        </div>
        <button
          onClick={openModal}
          className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white text-sm font-semibold px-4 py-2.5 shadow-sm transition-colors"
        >
          <PlusCircle className="w-4 h-4" />
          New Project
        </button>
      </div>

      {/* Empty state */}
      {projects.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <FolderOpen className="w-16 h-16 text-slate-300 mb-4" strokeWidth={1.5} />
          <h2 className="text-xl font-semibold text-slate-700 mb-2">No projects yet</h2>
          <p className="text-slate-500 mb-6 text-sm">Create your first project to get started</p>
          <button
            onClick={openModal}
            className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold px-4 py-2.5 shadow-sm transition-colors"
          >
            <PlusCircle className="w-4 h-4" />
            New Project
          </button>
        </div>
      ) : (
        /* Project cards grid */
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {projects.map((project) => (
            <div
              key={project.id}
              className="bg-white dark:bg-slate-800/60 rounded-xl shadow border border-slate-200 dark:border-slate-700 hover:shadow-md transition-shadow overflow-hidden"
            >
              {/* Top section */}
              <div className="px-5 pt-5 pb-3">
                <div className="flex items-start justify-between gap-2 mb-1">
                  <h3 className="font-bold text-slate-800 dark:text-slate-100 text-base leading-snug">
                    {project.name}
                  </h3>
                </div>
                <div className="flex items-center gap-1 text-slate-500 text-sm mb-0.5">
                  <MapPin className="w-3.5 h-3.5 flex-shrink-0" />
                  <span>{project.location}</span>
                </div>
                <div className="flex items-center gap-1 text-slate-500 text-sm">
                  <Building2 className="w-3.5 h-3.5 flex-shrink-0" />
                  <span>{project.county} County</span>
                </div>
              </div>

              {/* Badges row */}
              <div className="px-5 py-2 flex flex-wrap gap-2 border-t border-slate-100">
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-100 text-blue-700">
                  {project.buildingType}
                </span>
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-purple-100 text-purple-700">
                  {project.constructionStandard}
                </span>
                <span className={statusBadgeClass(project.status)}>
                  {project.status}
                </span>
              </div>

              {/* GFA row */}
              <div className="px-5 py-2 flex items-center gap-4 border-t border-slate-100 text-sm text-slate-600">
                <div className="flex items-center gap-1">
                  <Layers className="w-4 h-4 text-slate-400" />
                  <span className="font-medium">GFA:</span>
                  <span>{gfa(project).toLocaleString()} m²</span>
                </div>
                <div className="text-slate-400">·</div>
                <div>
                  <span className="font-medium">Floors:</span>{' '}
                  <span>{project.floors}</span>
                </div>
              </div>

              {/* Blueprint status */}
              <div className="px-5 py-2 border-t border-slate-100">
                {(project as any).blueprintFileName ? (
                  <div className="flex items-center gap-1.5 text-green-600 text-sm">
                    <FileCheck className="w-4 h-4 flex-shrink-0" />
                    <span className="truncate font-medium">{(project as any).blueprintFileName}</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-1.5 text-slate-400 text-sm">
                    <Upload className="w-4 h-4 flex-shrink-0" />
                    <span>No blueprint</span>
                  </div>
                )}
              </div>

              {/* Actions row */}
              <div className="px-5 py-3 border-t border-slate-100 flex gap-2">
                <button
                  onClick={() => {
                    onSelectProject(project.id);
                    onUploadBlueprint(project.id);
                  }}
                  className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-lg border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold px-3 py-2 transition-colors"
                >
                  <Upload className="w-3.5 h-3.5" />
                  Upload Blueprint
                </button>
                <button
                  onClick={() => {
                    onSelectProject(project.id);
                    onViewEstimate(project.id);
                  }}
                  className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold px-3 py-2 transition-colors"
                >
                  <Eye className="w-3.5 h-3.5" />
                  View Estimate
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* New Project Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-lg w-full mx-4 overflow-y-auto max-h-[90vh]">
            {/* Modal header */}
            <div className="flex items-center justify-between px-6 py-5 border-b border-slate-200">
              <h2 className="text-lg font-bold text-slate-800">Create New Project</h2>
              <button
                onClick={closeModal}
                className="rounded-lg p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
                aria-label="Close"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal form */}
            <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">
              {/* Project Name */}
              <div>
                <label htmlFor="name" className={labelClass}>
                  Project Name <span className="text-red-500">*</span>
                </label>
                <input
                  id="name"
                  name="name"
                  type="text"
                  required
                  value={form.name}
                  onChange={handleChange}
                  placeholder="e.g. Westlands Commercial Complex"
                  className={inputClass}
                />
              </div>

              {/* Location */}
              <div>
                <label htmlFor="location" className={labelClass}>
                  Location <span className="text-red-500">*</span>
                </label>
                <input
                  id="location"
                  name="location"
                  type="text"
                  required
                  value={form.location}
                  onChange={handleChange}
                  placeholder="e.g. Westlands, Nairobi"
                  className={inputClass}
                />
              </div>

              {/* County */}
              <div>
                <label htmlFor="county" className={labelClass}>County</label>
                <select
                  id="county"
                  name="county"
                  value={form.county}
                  onChange={handleChange}
                  className={inputClass}
                >
                  {KENYA_COUNTIES.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>

              {/* Building Type */}
              <div>
                <label htmlFor="buildingType" className={labelClass}>Building Type</label>
                <select
                  id="buildingType"
                  name="buildingType"
                  value={form.buildingType}
                  onChange={handleChange}
                  className={inputClass}
                >
                  {BUILDING_TYPES.map((t) => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
              </div>

              {/* Construction Standard */}
              <div>
                <label htmlFor="constructionStandard" className={labelClass}>
                  Construction Standard
                </label>
                <select
                  id="constructionStandard"
                  name="constructionStandard"
                  value={form.constructionStandard}
                  onChange={handleChange}
                  className={inputClass}
                >
                  {STANDARDS.map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>

              {/* Floor Area Per Floor & Number of Floors — side by side */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="floorAreaPerFloor" className={labelClass}>
                    Floor Area Per Floor (m²) <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="floorAreaPerFloor"
                    name="floorAreaPerFloor"
                    type="number"
                    required
                    min={10}
                    value={form.floorAreaPerFloor}
                    onChange={handleChange}
                    placeholder="e.g. 250"
                    className={inputClass}
                  />
                </div>
                <div>
                  <label htmlFor="floors" className={labelClass}>
                    Number of Floors
                  </label>
                  <input
                    id="floors"
                    name="floors"
                    type="number"
                    required
                    min={1}
                    max={50}
                    value={form.floors}
                    onChange={handleChange}
                    className={inputClass}
                  />
                </div>
              </div>

              {/* Status */}
              <div>
                <label htmlFor="status" className={labelClass}>Status</label>
                <select
                  id="status"
                  name="status"
                  value={form.status}
                  onChange={handleChange}
                  className={inputClass}
                >
                  {(['Planning', 'Under Construction', 'Active', 'Archived'] as ProjectStatus[]).map(
                    (s) => (
                      <option key={s} value={s}>{s}</option>
                    )
                  )}
                </select>
              </div>

              {/* Footer buttons */}
              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={closeModal}
                  className="rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 text-sm font-semibold px-4 py-2.5 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white text-sm font-semibold px-5 py-2.5 shadow-sm transition-colors"
                >
                  <PlusCircle className="w-4 h-4" />
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
