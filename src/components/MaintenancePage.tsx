import { useState, useEffect } from 'react';
import type { User, MaintenanceTask, MaintenanceCategory, MaintenancePriority, MaintenanceStatus } from '../types';
import { Plus, Search, Wrench, Calendar, DollarSign, User as UserIcon, Trash2, X, CircleCheck as CheckCircle2, Loader as Loader2, ClipboardList, ArrowRight } from 'lucide-react';
import { useToast } from './ui/Toast';

interface Props {
  projectId: string;
  projectName: string;
  currentUser: User;
}

const inputBase = 'w-full px-3.5 py-2.5 rounded-xl border bg-white dark:bg-[#0f1629] text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition';
const labelBase = 'block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-1.5';

const CATEGORIES: MaintenanceCategory[] = ['Preventive', 'Corrective', 'Predictive', 'Emergency', 'Inspection'];
const PRIORITIES: MaintenancePriority[] = ['Low', 'Medium', 'High', 'Critical'];
const STATUSES: MaintenanceStatus[] = ['Pending', 'Assigned', 'In-Progress', 'Completed', 'Verified', 'Overdue'];

const STATUS_COLORS: Record<MaintenanceStatus, string> = {
  Pending: 'bg-slate-100 text-slate-600 dark:bg-white/5 dark:text-slate-400',
  Assigned: 'bg-blue-100 text-blue-700 dark:bg-blue-950/40 dark:text-blue-400',
  'In-Progress': 'bg-amber-100 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400',
  Completed: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400',
  Verified: 'bg-teal-100 text-teal-700 dark:bg-teal-950/40 dark:text-teal-400',
  Overdue: 'bg-rose-100 text-rose-700 dark:bg-rose-950/40 dark:text-rose-400',
};

const PRIORITY_COLORS: Record<MaintenancePriority, string> = {
  Low: 'text-slate-500 dark:text-slate-400',
  Medium: 'text-blue-600 dark:text-blue-400',
  High: 'text-amber-600 dark:text-amber-400',
  Critical: 'text-rose-600 dark:text-rose-400',
};

const selectStyle = {
  backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%2394a3b8' stroke-width='2'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E")`,
  backgroundRepeat: 'no-repeat',
  backgroundPosition: 'right 12px center',
  paddingRight: '36px',
  appearance: 'none' as const,
};

function formatKsh(n: number): string {
  return 'KSh ' + Math.round(n).toLocaleString('en-KE');
}

export default function MaintenancePage({ projectId, projectName, currentUser }: Props) {
  const [tasks, setTasks] = useState<MaintenanceTask[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState<MaintenanceStatus | 'all'>('all');
  const [form, setForm] = useState({
    title: '',
    description: '',
    category: 'Preventive' as MaintenanceCategory,
    priority: 'Medium' as MaintenancePriority,
    assignedTo: '',
    dueDate: '',
    estimatedCost: 0,
  });
  const { show } = useToast();

  useEffect(() => {
    const key = `blcts_maintenance_${projectId}`;
    try {
      const stored = JSON.parse(localStorage.getItem(key) || '[]');
      setTasks(stored);
    } catch {
      setTasks([]);
    }
    setLoading(false);
    // eslint-disable-next-line react-hooks/set-state-in-effect
  }, [projectId]);

  function saveTasks(updated: MaintenanceTask[]) {
    setTasks(updated);
    localStorage.setItem(`blcts_maintenance_${projectId}`, JSON.stringify(updated));
  }

  function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!form.title.trim()) { show('Task title is required', 'error'); return; }
    const task: MaintenanceTask = {
      id: `task-${Date.now()}`,
      projectId,
      title: form.title.trim(),
      description: form.description.trim(),
      category: form.category,
      priority: form.priority,
      status: 'Pending',
      assignedTo: form.assignedTo.trim() || 'Unassigned',
      dueDate: form.dueDate || new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0],
      estimatedCost: form.estimatedCost,
      createdAt: new Date().toISOString(),
    };
    saveTasks([task, ...tasks]);
    setForm({ title: '', description: '', category: 'Preventive', priority: 'Medium', assignedTo: '', dueDate: '', estimatedCost: 0 });
    setShowCreate(false);
    show('Maintenance task created', 'success');
  }

  function handleStatusChange(id: string, status: MaintenanceStatus) {
    const updated = tasks.map(t => t.id === id ? { ...t, status, completedAt: status === 'Completed' || status === 'Verified' ? new Date().toISOString() : t.completedAt } : t);
    saveTasks(updated);
    show(`Task status updated to ${status}`, 'success');
  }

  function handleDelete(id: string) {
    saveTasks(tasks.filter(t => t.id !== id));
    show('Task deleted', 'success');
  }

  const filtered = tasks.filter(t => {
    if (filterStatus !== 'all' && t.status !== filterStatus) return false;
    if (search && !t.title.toLowerCase().includes(search.toLowerCase()) && !t.description.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const stats = {
    total: tasks.length,
    pending: tasks.filter(t => t.status === 'Pending').length,
    inProgress: tasks.filter(t => t.status === 'In-Progress' || t.status === 'Assigned').length,
    completed: tasks.filter(t => t.status === 'Completed' || t.status === 'Verified').length,
    totalCost: tasks.reduce((s, t) => s + (t.estimatedCost || 0), 0),
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 className="w-8 h-8 text-emerald-600 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Maintenance Management</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Track and manage maintenance tasks for {projectName}.</p>
        </div>
        <button onClick={() => setShowCreate(true)} className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold px-4 py-2.5 rounded-xl transition shadow-sm hover:shadow-md">
          <Plus className="w-4 h-4" /> New Task
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        {[
          { label: 'Total Tasks', value: stats.total, color: 'text-slate-900 dark:text-white' },
          { label: 'Pending', value: stats.pending, color: 'text-slate-500 dark:text-slate-400' },
          { label: 'In Progress', value: stats.inProgress, color: 'text-amber-600 dark:text-amber-400' },
          { label: 'Completed', value: stats.completed, color: 'text-emerald-600 dark:text-emerald-400' },
          { label: 'Total Cost', value: formatKsh(stats.totalCost), color: 'text-emerald-600 dark:text-emerald-400' },
        ].map(s => (
          <div key={s.label} className="rounded-2xl border border-slate-200 dark:border-white/8 bg-white dark:bg-[#0f1629] p-4">
            <p className="text-xs text-slate-500 dark:text-slate-400">{s.label}</p>
            <p className={`text-lg font-black mt-1 ${s.color}`}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder="Search tasks…" className={inputBase + ' pl-10'} />
        </div>
        <select value={filterStatus} onChange={e => setFilterStatus(e.target.value as MaintenanceStatus | 'all')} className={inputBase + ' cursor-pointer sm:w-48'} style={selectStyle}>
          <option value="all">All Statuses</option>
          {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
        </select>
      </div>

      {/* Task list */}
      {filtered.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-300 dark:border-white/10 p-12 text-center">
          <div className="w-14 h-14 rounded-2xl bg-slate-100 dark:bg-white/5 flex items-center justify-center mx-auto mb-4">
            <ClipboardList className="w-7 h-7 text-slate-300 dark:text-slate-600" />
          </div>
          <p className="text-sm font-semibold text-slate-600 dark:text-slate-300 mb-1">{tasks.length === 0 ? 'No maintenance tasks yet' : 'No tasks match your filters'}</p>
          <p className="text-xs text-slate-400 mb-4">{tasks.length === 0 ? 'Create your first maintenance task to get started.' : 'Try adjusting your search or filter.'}</p>
          {tasks.length === 0 && (
            <button onClick={() => setShowCreate(true)} className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold px-4 py-2.5 rounded-xl transition shadow-sm">
              <Plus className="w-4 h-4" /> Create Task
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {filtered.map(task => (
            <div key={task.id} className="rounded-2xl border border-slate-200 dark:border-white/8 bg-white dark:bg-[#0f1629] p-5 group hover:shadow-md transition">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className="w-9 h-9 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 flex items-center justify-center">
                    <Wrench className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-800 dark:text-slate-100">{task.title}</p>
                    <p className="text-xs text-slate-400">{task.category}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${STATUS_COLORS[task.status]}`}>{task.status}</span>
                  <button onClick={() => handleDelete(task.id)} className="opacity-0 group-hover:opacity-100 text-slate-400 hover:text-rose-500 transition p-1">
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
              {task.description && <p className="text-xs text-slate-500 dark:text-slate-400 mb-3 leading-relaxed">{task.description}</p>}
              <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 dark:text-slate-400">
                <span className={`font-bold ${PRIORITY_COLORS[task.priority]}`}>{task.priority}</span>
                <span className="flex items-center gap-1"><UserIcon className="w-3 h-3" />{task.assignedTo}</span>
                <span className="flex items-center gap-1"><Calendar className="w-3 h-3" />{task.dueDate}</span>
                {task.estimatedCost > 0 && <span className="flex items-center gap-1"><DollarSign className="w-3 h-3" />{formatKsh(task.estimatedCost)}</span>}
              </div>
              <div className="mt-3 flex items-center gap-2">
                <select value={task.status} onChange={e => handleStatusChange(task.id, e.target.value as MaintenanceStatus)} className={inputBase + ' cursor-pointer text-xs py-1.5 flex-1'} style={selectStyle}>
                  {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create modal */}
      {showCreate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm" onClick={() => setShowCreate(false)}>
          <div className="w-full max-w-lg bg-white dark:bg-[#0f1629] rounded-2xl shadow-2xl border border-slate-200 dark:border-white/10 animate-scale-in max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-white/8 sticky top-0 bg-white dark:bg-[#0f1629] rounded-t-2xl">
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">Create Maintenance Task</h2>
              <button onClick={() => setShowCreate(false)} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleCreate} className="p-6 space-y-4">
              <div>
                <label className={labelBase}>Task Title</label>
                <input type="text" required value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} placeholder="e.g. HVAC quarterly service" className={inputBase} />
              </div>
              <div>
                <label className={labelBase}>Description</label>
                <textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} placeholder="Task details…" rows={3} className={inputBase + ' resize-none'} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={labelBase}>Category</label>
                  <select value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value as MaintenanceCategory }))} className={inputBase + ' cursor-pointer'} style={selectStyle}>
                    {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label className={labelBase}>Priority</label>
                  <select value={form.priority} onChange={e => setForm(f => ({ ...f, priority: e.target.value as MaintenancePriority }))} className={inputBase + ' cursor-pointer'} style={selectStyle}>
                    {PRIORITIES.map(p => <option key={p} value={p}>{p}</option>)}
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={labelBase}>Assigned To</label>
                  <input type="text" value={form.assignedTo} onChange={e => setForm(f => ({ ...f, assignedTo: e.target.value }))} placeholder="e.g. John M." className={inputBase} />
                </div>
                <div>
                  <label className={labelBase}>Due Date</label>
                  <input type="date" value={form.dueDate} onChange={e => setForm(f => ({ ...f, dueDate: e.target.value }))} className={inputBase} />
                </div>
              </div>
              <div>
                <label className={labelBase}>Estimated Cost (KSh)</label>
                <input type="number" min="0" value={form.estimatedCost || ''} onChange={e => setForm(f => ({ ...f, estimatedCost: Number(e.target.value) }))} placeholder="0" className={inputBase} />
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowCreate(false)} className="flex-1 py-2.5 rounded-xl border border-slate-200 dark:border-white/10 text-slate-600 dark:text-slate-300 text-sm font-semibold hover:bg-slate-50 dark:hover:bg-white/5 transition">
                  Cancel
                </button>
                <button type="submit" className="flex-1 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold transition shadow-sm">
                  Create Task
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
