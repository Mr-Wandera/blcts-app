import React, { useState, useEffect, useRef } from 'react';
import { Plus, Search, ListFilter as Filter, Wrench, Calendar, DollarSign, User as UserIcon, Trash2, CreditCard as Edit3, ChevronDown, X, TriangleAlert as AlertTriangle, CircleCheck as CheckCircle2, Clock, Loader as Loader2, ClipboardList, ArrowRight } from 'lucide-react';
import { User, MaintenanceTask, MaintenanceStatus, MaintenancePriority, MaintenanceCategory } from '../types';
import { fetchTasks, upsertTask, deleteTask } from '../lib/supabase';
import { fmtKSh, fmtDate } from '../lib/format';
import { Badge } from './ui/Badge';
import { StepBar } from './ui/StepBar';

interface Props {
  projectId: string;
  projectName: string;
  currentUser: User;
}

// ─── Constants ────────────────────────────────────────────────────────────────

const WORKFLOW_STEP_LABELS = [
  'Create Task',
  'Pending',
  'Assigned',
  'In Progress',
  'Completed',
  'Verified',
  'Cost Recorded',
  'Lifecycle Updated',
];

const STATUS_OPTIONS: MaintenanceStatus[] = [
  'Pending',
  'Assigned',
  'In-Progress',
  'Completed',
  'Verified',
];

const CATEGORY_OPTIONS: MaintenanceCategory[] = [
  'Preventive',
  'Corrective',
  'Emergency',
  'Inspection',
];

const PRIORITY_OPTIONS: MaintenancePriority[] = ['Low', 'Medium', 'High', 'Critical'];

const inputCls =
  'w-full rounded-xl border border-slate-200 dark:border-white/12 bg-slate-50 dark:bg-white/4 ' +
  'px-3.5 py-2.5 text-sm text-slate-800 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 ' +
  'focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition disabled:opacity-50 disabled:cursor-not-allowed';

const labelCls = 'block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-1.5';

// ─── Badge helpers ────────────────────────────────────────────────────────────

function statusColor(s: MaintenanceStatus): 'amber' | 'blue' | 'green' | 'purple' | 'slate' {
  const map: Partial<Record<MaintenanceStatus, 'amber' | 'blue' | 'green' | 'purple' | 'slate'>> = {
    Pending: 'amber',
    Assigned: 'blue',
    'In-Progress': 'blue',
    Completed: 'green',
    Verified: 'purple',
    Overdue: 'amber',
  };
  return map[s] ?? 'slate';
}

function priorityColor(p: MaintenancePriority): 'green' | 'amber' | 'red' | 'purple' {
  const map: Record<MaintenancePriority, 'green' | 'amber' | 'red' | 'purple'> = {
    Low: 'green',
    Medium: 'amber',
    High: 'red',
    Critical: 'purple',
  };
  return map[p] ?? 'amber';
}

// ─── Workflow status → step index mapping ─────────────────────────────────────

function statusToStepIndex(status: MaintenanceStatus): number {
  const map: Partial<Record<MaintenanceStatus, number>> = {
    Pending: 1, Assigned: 2, 'In-Progress': 3, Completed: 4, Verified: 5, Overdue: 1,
  };
  return map[status] ?? 1;
}

// ─── Create Task Modal ────────────────────────────────────────────────────────

interface TaskForm {
  title: string;
  component: string;
  description: string;
  category: MaintenanceCategory;
  priority: MaintenancePriority;
  assignedTo: string;
  targetDate: string;
  estimatedCost: string;
  notes: string;
}

const defaultForm: TaskForm = {
  title: '',
  component: '',
  description: '',
  category: 'Preventive',
  priority: 'Medium',
  assignedTo: '',
  targetDate: new Date(Date.now() + 7 * 86400000).toISOString().slice(0, 10),
  estimatedCost: '',
  notes: '',
};

interface CreateModalProps {
  open: boolean;
  onClose: () => void;
  onSave: (form: TaskForm) => Promise<void>;
  saving: boolean;
}

function CreateModal({ open, onClose, onSave, saving }: CreateModalProps) {
  const [form, setForm] = useState<TaskForm>(defaultForm);
  const [errors, setErrors] = useState<Partial<Record<keyof TaskForm, string>>>({});
  const titleRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) {
      setForm(defaultForm);
      setErrors({});
      setTimeout(() => titleRef.current?.focus(), 50);
    }
  }, [open]);

  function set(key: keyof TaskForm, value: string) {
    setForm((f) => ({ ...f, [key]: value }));
    setErrors((e) => ({ ...e, [key]: undefined }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const errs: typeof errors = {};
    if (!form.title.trim()) errs.title = 'Title is required';
    if (!form.component.trim()) errs.component = 'Component is required';
    if (!form.targetDate) errs.targetDate = 'Target date is required';
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }
    await onSave(form);
  }

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-slate-900/70 backdrop-blur-sm dark:bg-black/70" onClick={onClose} />
      <div className="relative w-full max-w-2xl bg-white dark:bg-[#0f1629] rounded-2xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-white/8">
          <div className="flex items-center gap-2">
            <Wrench className="w-5 h-5 text-amber-500" />
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">Create Maintenance Task</h2>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit}>
          <div className="px-6 py-5 max-h-[70vh] overflow-y-auto space-y-5">
            {/* Title + Component */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className={labelCls}>Task Title <span className="text-red-500">*</span></label>
                <input
                  ref={titleRef}
                  className={inputCls}
                  value={form.title}
                  onChange={(e) => set('title', e.target.value)}
                  placeholder="e.g. Replace AC filter unit 3"
                />
                {errors.title && <p className="text-xs text-red-500 mt-1">{errors.title}</p>}
              </div>
              <div>
                <label className={labelCls}>Component / Asset <span className="text-red-500">*</span></label>
                <input
                  className={inputCls}
                  value={form.component}
                  onChange={(e) => set('component', e.target.value)}
                  placeholder="e.g. HVAC System — Floor 2"
                />
                {errors.component && <p className="text-xs text-red-500 mt-1">{errors.component}</p>}
              </div>
            </div>

            {/* Description */}
            <div>
              <label className={labelCls}>Description</label>
              <textarea
                className={inputCls + ' resize-none'}
                rows={3}
                value={form.description}
                onChange={(e) => set('description', e.target.value)}
                placeholder="Describe the task in detail..."
              />
            </div>

            {/* Category + Priority */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={labelCls}>Category</label>
                <select className={inputCls} value={form.category} onChange={(e) => set('category', e.target.value as MaintenanceCategory)}>
                  {CATEGORY_OPTIONS.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label className={labelCls}>Priority</label>
                <select className={inputCls} value={form.priority} onChange={(e) => set('priority', e.target.value as MaintenancePriority)}>
                  {PRIORITY_OPTIONS.map((p) => <option key={p} value={p}>{p}</option>)}
                </select>
              </div>
            </div>

            {/* Assigned To + Target Date */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={labelCls}>Assigned To</label>
                <input
                  className={inputCls}
                  value={form.assignedTo}
                  onChange={(e) => set('assignedTo', e.target.value)}
                  placeholder="Technician name or team"
                />
              </div>
              <div>
                <label className={labelCls}>Target Date <span className="text-red-500">*</span></label>
                <input
                  type="date"
                  className={inputCls}
                  value={form.targetDate}
                  onChange={(e) => set('targetDate', e.target.value)}
                />
                {errors.targetDate && <p className="text-xs text-red-500 mt-1">{errors.targetDate}</p>}
              </div>
            </div>

            {/* Estimated Cost */}
            <div>
              <label className={labelCls}>Estimated Cost (KSh)</label>
              <input
                type="number"
                min="0"
                step="500"
                className={inputCls}
                value={form.estimatedCost}
                onChange={(e) => set('estimatedCost', e.target.value)}
                placeholder="0"
              />
            </div>

            {/* Notes */}
            <div>
              <label className={labelCls}>Notes</label>
              <textarea
                className={inputCls + ' resize-none'}
                rows={2}
                value={form.notes}
                onChange={(e) => set('notes', e.target.value)}
                placeholder="Any additional notes or special instructions..."
              />
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-slate-200 dark:border-white/8 bg-slate-50 dark:bg-[#0f1629]">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-white/6 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="inline-flex items-center gap-2 px-5 py-2 rounded-xl text-sm font-semibold bg-amber-500 hover:bg-amber-600 text-white transition-colors disabled:opacity-60"
            >
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
              {saving ? 'Creating…' : 'Create Task'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ─── Status Dropdown (inline) ─────────────────────────────────────────────────

interface StatusDropdownProps {
  current: MaintenanceStatus;
  onChange: (s: MaintenanceStatus) => void;
}

function StatusDropdown({ current, onChange }: StatusDropdownProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener('mousedown', onClickOutside);
    return () => document.removeEventListener('mousedown', onClickOutside);
  }, []);

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        className="inline-flex items-center gap-1 text-xs font-medium text-slate-600 dark:text-slate-300 hover:text-emerald-600 dark:hover:text-blue-400 transition-colors"
      >
        <Badge label={current} color={statusColor(current)} />
        <ChevronDown className="w-3 h-3 opacity-60" />
      </button>
      {open && (
        <div className="absolute top-full left-0 mt-1 z-30 w-36 rounded-lg border border-slate-200 dark:border-white/8 bg-white dark:bg-[#0f1629] shadow-xl overflow-hidden">
          {STATUS_OPTIONS.map((s) => (
            <button
              key={s}
              onClick={() => { onChange(s); setOpen(false); }}
              className={`w-full text-left px-3 py-2 text-xs hover:bg-slate-50 dark:hover:bg-white/3 dark:hover:bg-white/6 transition-colors ${s === current ? 'font-bold text-emerald-600 dark:text-blue-400' : 'text-slate-700 dark:text-slate-300'}`}
            >
              {s}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Task Card ────────────────────────────────────────────────────────────────

interface TaskCardProps {
  task: MaintenanceTask;
  onStatusChange: (id: string, status: MaintenanceStatus) => void;
  onDelete: (id: string) => void;
  onEdit: (task: MaintenanceTask) => void;
}

function TaskCard({ task, onStatusChange, onDelete, onEdit }: TaskCardProps) {
  return (
    <div className="bg-white dark:bg-[#0f1629] rounded-xl border border-slate-200 dark:border-white/8 p-4 hover:shadow-md transition-shadow group">
      {/* Top row */}
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <span className="text-[10px] font-mono text-slate-400 dark:text-slate-500 dark:text-slate-400">{task.workOrderNumber}</span>
            <Badge label={task.priority} color={priorityColor(task.priority)} />
          </div>
          <h3 className="font-semibold text-slate-800 dark:text-slate-100 text-sm leading-snug">{task.title}</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{task.component}</p>
        </div>
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
          <button
            onClick={() => onEdit(task)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-emerald-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/30 transition-colors"
            title="Edit task"
          >
            <Edit3 className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => onDelete(task.id)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors"
            title="Delete task"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Category tag */}
      <div className="mb-3">
        <Badge label={task.category} color="slate" />
      </div>

      {/* Metadata grid */}
      <div className="grid grid-cols-2 gap-y-2 gap-x-4 text-xs mb-3">
        {task.assignedTo && (
          <div className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400">
            <UserIcon className="w-3.5 h-3.5 flex-shrink-0" />
            <span className="truncate">{task.assignedTo}</span>
          </div>
        )}
        <div className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400">
          <Calendar className="w-3.5 h-3.5 flex-shrink-0" />
          <span>{task.targetDate ? fmtDate(task.targetDate) : '—'}</span>
        </div>
        <div className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400">
          <DollarSign className="w-3.5 h-3.5 flex-shrink-0" />
          <span>Est: {task.estimatedCost > 0 ? fmtKSh(task.estimatedCost) : '—'}</span>
        </div>
        {task.actualCost > 0 && (
          <div className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 font-medium">
            <CheckCircle2 className="w-3.5 h-3.5 flex-shrink-0" />
            <span>Actual: {fmtKSh(task.actualCost)}</span>
          </div>
        )}
      </div>

      {/* Status control */}
      <div className="pt-3 border-t border-slate-100 dark:border-white/8 flex items-center justify-between">
        <StatusDropdown current={task.status} onChange={(s) => onStatusChange(task.id, s)} />
        <span className="text-[10px] text-slate-400">{fmtDate(task.updatedAt ?? task.createdAt ?? '')}</span>
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function MaintenancePage({ projectId, projectName, currentUser }: Props) {
  const [tasks, setTasks] = useState<MaintenanceTask[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editingTask, setEditingTask] = useState<MaintenanceTask | null>(null);

  // Filters
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState<MaintenanceStatus | 'All'>('All');
  const [filterCategory, setFilterCategory] = useState<MaintenanceCategory | 'All'>('All');
  const [filterPriority, setFilterPriority] = useState<MaintenancePriority | 'All'>('All');

  // Load tasks on mount
  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    fetchTasks(projectId).then((data) => {
      if (!cancelled) { setTasks(data); setLoading(false); }
    });
    return () => { cancelled = true; };
  }, [projectId]);

  // ─── Derived workflow counts ────────────────────────────────────────────────
  const stepCounts = STATUS_OPTIONS.reduce<Record<string, number>>((acc, s) => {
    acc[s] = tasks.filter((t) => t.status === s).length;
    return acc;
  }, {});

  const workflowSteps = WORKFLOW_STEP_LABELS.map((label, i) => {
    // Steps 0=Create Task, 1=Pending, 2=Assigned, 3=In Progress, 4=Completed, 5=Verified, 6=Cost Recorded, 7=Lifecycle Updated
    const statusKey = STATUS_OPTIONS[i - 1]; // offset by 1 because step 0 is "Create Task"
    const count = statusKey ? stepCounts[statusKey] ?? 0 : 0;
    const labelWithCount = count > 0 ? `${label} (${count})` : label;
    return { label: labelWithCount, status: 'pending' as const };
  });

  // ─── Filtered tasks ─────────────────────────────────────────────────────────
  const filtered = tasks.filter((t) => {
    const matchSearch =
      !search.trim() ||
      t.title.toLowerCase().includes(search.toLowerCase()) ||
      t.component.toLowerCase().includes(search.toLowerCase()) ||
      t.workOrderNumber.toLowerCase().includes(search.toLowerCase());
    const matchStatus = filterStatus === 'All' || t.status === filterStatus;
    const matchCategory = filterCategory === 'All' || t.category === filterCategory;
    const matchPriority = filterPriority === 'All' || t.priority === filterPriority;
    return matchSearch && matchStatus && matchCategory && matchPriority;
  });

  // ─── Handlers ───────────────────────────────────────────────────────────────

  async function handleCreate(form: TaskForm) {
    setSaving(true);
    const id = crypto.randomUUID();
    const now = new Date().toISOString();
    const newTask: MaintenanceTask = {
      id,
      projectId,
      title: form.title.trim(),
      component: form.component.trim(),
      description: form.description.trim(),
      category: form.category,
      priority: form.priority,
      status: 'Pending',
      assignedTo: form.assignedTo.trim(),
      estimatedCost: form.estimatedCost ? parseFloat(form.estimatedCost) : 0,
      actualCost: 0,
      targetDate: form.targetDate,
      notes: form.notes.trim(),
      workOrderNumber: `WO-${Date.now().toString().slice(-6)}`,
      createdAt: now,
      updatedAt: now,
    };
    const ok = await upsertTask({ ...newTask });
    if (ok) {
      setTasks((prev) => [newTask, ...prev]);
      setShowModal(false);
    }
    setSaving(false);
  }

  async function handleStatusChange(id: string, status: MaintenanceStatus) {
    const task = tasks.find((t) => t.id === id);
    if (!task) return;
    const updated = { ...task, status, updatedAt: new Date().toISOString() };
    setTasks((prev) => prev.map((t) => (t.id === id ? updated : t)));
    await upsertTask({ ...updated });
  }

  async function handleDelete(id: string) {
    if (!window.confirm('Delete this maintenance task? This cannot be undone.')) return;
    const ok = await deleteTask(id);
    if (ok) setTasks((prev) => prev.filter((t) => t.id !== id));
  }

  function handleEdit(task: MaintenanceTask) {
    // In a full implementation this would open an edit modal; for now navigate
    setEditingTask(task);
    setShowModal(true);
  }

  // ─── Render ─────────────────────────────────────────────────────────────────

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between flex-wrap gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Wrench className="w-5 h-5 text-amber-500" />
            <span className="text-xs font-semibold uppercase tracking-widest text-amber-600 dark:text-amber-400">Maintenance</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Maintenance Management</h1>
          {projectName && (
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">{projectName}</p>
          )}
        </div>
        <button
          onClick={() => { setEditingTask(null); setShowModal(true); }}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-sm font-semibold shadow-sm transition-colors"
        >
          <Plus className="w-4 h-4" />
          Create Task
        </button>
      </div>

      {/* Workflow StepBar — always visible */}
      <div className="rounded-xl border border-amber-200 dark:border-amber-800/60 bg-amber-50/50 dark:bg-amber-950/20 px-5 py-4">
        <div className="flex items-center gap-2 mb-3">
          <ClipboardList className="w-4 h-4 text-amber-600 dark:text-amber-400" />
          <p className="text-xs font-semibold text-amber-700 dark:text-amber-300 uppercase tracking-wider">8-Stage Maintenance Workflow</p>
        </div>
        <StepBar steps={workflowSteps} compact />
      </div>

      {/* Filter Bar */}
      <div className="flex flex-wrap gap-3 items-center">
        <div className="relative flex-1 min-w-[180px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
          <input
            className="w-full rounded-lg border border-slate-300 dark:border-white/12 dark:border-white/12 bg-white dark:bg-[#0f1629] pl-9 pr-3 py-2 text-sm text-slate-800 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition"
            placeholder="Search tasks…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400">
          <Filter className="w-4 h-4" />
        </div>

        {/* Status filter */}
        <select
          className="rounded-lg border border-slate-300 dark:border-white/12 dark:border-white/12 bg-white dark:bg-[#0f1629] px-3 py-2 text-sm text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition"
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value as MaintenanceStatus | 'All')}
        >
          <option value="All">All Statuses</option>
          {STATUS_OPTIONS.map((s) => <option key={s} value={s}>{s}</option>)}
        </select>

        {/* Category filter */}
        <select
          className="rounded-lg border border-slate-300 dark:border-white/12 dark:border-white/12 bg-white dark:bg-[#0f1629] px-3 py-2 text-sm text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition"
          value={filterCategory}
          onChange={(e) => setFilterCategory(e.target.value as MaintenanceCategory | 'All')}
        >
          <option value="All">All Categories</option>
          {CATEGORY_OPTIONS.map((c) => <option key={c} value={c}>{c}</option>)}
        </select>

        {/* Priority filter */}
        <select
          className="rounded-lg border border-slate-300 dark:border-white/12 dark:border-white/12 bg-white dark:bg-[#0f1629] px-3 py-2 text-sm text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition"
          value={filterPriority}
          onChange={(e) => setFilterPriority(e.target.value as MaintenancePriority | 'All')}
        >
          <option value="All">All Priorities</option>
          {PRIORITY_OPTIONS.map((p) => <option key={p} value={p}>{p}</option>)}
        </select>

        {/* Result count */}
        <span className="text-xs text-slate-400 ml-auto">
          {filtered.length} of {tasks.length} task{tasks.length !== 1 ? 's' : ''}
        </span>
      </div>

      {/* Content */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-24 gap-3">
          <Loader2 className="w-8 h-8 animate-spin text-amber-500" />
          <p className="text-sm text-slate-500 dark:text-slate-400">Loading maintenance tasks…</p>
        </div>
      ) : tasks.length === 0 ? (
        // Empty state
        <div className="rounded-xl border-2 border-dashed border-slate-200 dark:border-white/8 bg-white dark:bg-[#0f1629] px-8 py-16 text-center">
          <div className="w-16 h-16 rounded-2xl bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center mx-auto mb-4">
            <Wrench className="w-8 h-8 text-amber-500" />
          </div>
          <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-100 mb-2">No maintenance tasks yet</h3>
          <p className="text-sm text-slate-500 dark:text-slate-400 max-w-sm mx-auto mb-6">
            Create your first work order to start tracking maintenance activities for <strong>{projectName}</strong>.
          </p>
          <button
            onClick={() => { setEditingTask(null); setShowModal(true); }}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-sm font-semibold shadow transition-colors"
          >
            <Plus className="w-4 h-4" />
            Create First Task
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      ) : filtered.length === 0 ? (
        <div className="rounded-xl border border-slate-200 dark:border-white/8 bg-white dark:bg-[#0f1629] px-8 py-12 text-center">
          <AlertTriangle className="w-10 h-10 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
          <p className="text-sm font-medium text-slate-500 dark:text-slate-400">No tasks match your filters.</p>
          <button
            onClick={() => { setSearch(''); setFilterStatus('All'); setFilterCategory('All'); setFilterPriority('All'); }}
            className="mt-3 text-xs font-semibold text-emerald-600 dark:text-blue-400 hover:underline"
          >
            Clear all filters
          </button>
        </div>
      ) : (
        <>
          {/* Priority alert for critical tasks */}
          {filtered.some((t) => t.priority === 'Critical' && t.status !== 'Completed' && t.status !== 'Verified') && (
            <div className="flex items-start gap-3 rounded-xl border border-red-200 dark:border-red-900/50 bg-red-50 dark:bg-red-950/20 px-4 py-3">
              <AlertTriangle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-semibold text-red-700 dark:text-red-400">Critical tasks require immediate attention</p>
                <p className="text-xs text-red-600 dark:text-red-500 mt-0.5">
                  {filtered.filter((t) => t.priority === 'Critical' && t.status !== 'Completed' && t.status !== 'Verified').length} critical task(s) are still open.
                </p>
              </div>
            </div>
          )}

          {/* Task grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map((task) => (
              <TaskCard
                key={task.id}
                task={task}
                onStatusChange={handleStatusChange}
                onDelete={handleDelete}
                onEdit={handleEdit}
              />
            ))}
          </div>
        </>
      )}

      {/* Summary strip */}
      {tasks.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
          {STATUS_OPTIONS.map((s) => (
            <button
              key={s}
              onClick={() => setFilterStatus(s === filterStatus ? 'All' : s)}
              className={`rounded-xl border p-3 text-center transition-all ${
                filterStatus === s
                  ? 'border-blue-400 dark:border-emerald-600 bg-blue-50 dark:bg-blue-950/30'
                  : 'border-slate-200 dark:border-white/8 bg-white dark:bg-[#0f1629] hover:border-slate-300 dark:hover:border-slate-600'
              }`}
            >
              <p className="text-xl font-bold text-slate-800 dark:text-slate-100 tabular-nums">{stepCounts[s] ?? 0}</p>
              <p className="text-[10px] text-slate-500 dark:text-slate-400 font-medium mt-0.5">{s}</p>
            </button>
          ))}
        </div>
      )}

      {/* Create Task Modal */}
      <CreateModal
        open={showModal}
        onClose={() => { setShowModal(false); setEditingTask(null); }}
        onSave={handleCreate}
        saving={saving}
      />
    </div>
  );
}
