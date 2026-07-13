import React, { useState, useEffect, useRef } from 'react';
import { DollarSign, MapPin, RefreshCw, Pencil, Check, X, Loader as Loader2, ChevronLeft, Package, Hammer, Cog, Info, CircleAlert as AlertCircle } from 'lucide-react';
import { MaterialRow, RegionalPricingRow } from '../types';
import { fetchMaterials, fetchRegionalPricing, updateMaterialPrice, invalidateCache } from '../lib/supabase';
import { fmtKSh } from '../lib/format';
import { Badge } from './ui/Badge';

interface Props {
  onBack: () => void;
  initialTab?: 'materials' | 'regional';
}

type PriceCategory = 'material' | 'labour' | 'service';

// ─── Helpers ──────────────────────────────────────────────────────────────────

const CATEGORY_TABS: { key: PriceCategory; label: string; icon: React.ReactNode }[] = [
  { key: 'material', label: 'Materials', icon: <Package className="w-4 h-4" /> },
  { key: 'labour', label: 'Labour', icon: <Hammer className="w-4 h-4" /> },
  { key: 'service', label: 'Services', icon: <Cog className="w-4 h-4" /> },
];

// ─── Inline Edit Cell ─────────────────────────────────────────────────────────

interface EditCellProps {
  id: string;
  currentPrice: number;
  onSave: (id: string, price: number) => Promise<void>;
}

function EditCell({ id, currentPrice, onSave }: EditCellProps) {
  const [editing, setEditing] = useState(false);
  const [value, setValue] = useState(currentPrice.toString());
  const [saving, setSaving] = useState(false);
  const [flash, setFlash] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  function startEdit() {
    setValue(currentPrice.toString());
    setEditing(true);
    setTimeout(() => inputRef.current?.select(), 30);
  }

  function cancel() {
    setEditing(false);
    setValue(currentPrice.toString());
  }

  async function save() {
    const num = parseFloat(value);
    if (isNaN(num) || num < 0) { cancel(); return; }
    if (num === currentPrice) { setEditing(false); return; }
    setSaving(true);
    await onSave(id, num);
    setSaving(false);
    setEditing(false);
    setFlash(true);
    setTimeout(() => setFlash(false), 1500);
  }

  function handleKey(e: React.KeyboardEvent) {
    if (e.key === 'Enter') save();
    if (e.key === 'Escape') cancel();
  }

  if (editing) {
    return (
      <div className="flex items-center gap-1.5">
        <div className="relative">
          <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-xs text-slate-400 pointer-events-none">KSh</span>
          <input
            ref={inputRef}
            type="number"
            min="0"
            step="100"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onKeyDown={handleKey}
            className="w-32 pl-9 pr-2 py-1.5 rounded-lg border-2 border-blue-500 bg-white dark:bg-slate-800 text-sm font-medium text-slate-800 dark:text-slate-100 focus:outline-none tabular-nums"
          />
        </div>
        <button
          onClick={save}
          disabled={saving}
          className="p-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-white transition-colors disabled:opacity-60"
          title="Save (Enter)"
        >
          {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
        </button>
        <button
          onClick={cancel}
          className="p-1.5 rounded-lg bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 text-slate-600 dark:text-slate-300 transition-colors"
          title="Cancel (Escape)"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <span className={`text-sm font-semibold tabular-nums ${flash ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-800 dark:text-slate-100'} transition-colors`}>
        {fmtKSh(currentPrice)}
      </span>
      <button
        onClick={startEdit}
        className="opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-blue-50 dark:hover:bg-blue-950/30 text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition-all"
        title="Edit price"
      >
        <Pencil className="w-3.5 h-3.5" />
      </button>
    </div>
  );
}

// ─── Materials Table ──────────────────────────────────────────────────────────

interface MaterialsTableProps {
  rows: MaterialRow[];
  onPriceUpdate: (id: string, price: number) => Promise<void>;
}

function MaterialsTable({ rows, onPriceUpdate }: MaterialsTableProps) {
  if (rows.length === 0) {
    return (
      <div className="py-16 text-center text-slate-400 dark:text-slate-500 dark:text-slate-400">
        <Package className="w-10 h-10 mx-auto mb-3 opacity-40" />
        <p className="text-sm">No items in this category</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[600px]">
        <thead>
          <tr className="border-b border-slate-200 dark:border-slate-700">
            <th className="text-left py-3 px-4 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide">Item</th>
            <th className="text-left py-3 px-4 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide">Code</th>
            <th className="text-left py-3 px-4 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide">Unit</th>
            <th className="text-left py-3 px-4 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide">County</th>
            <th className="text-left py-3 px-4 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide">Current Price</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100 dark:divide-slate-700/50">
          {rows.map((row) => (
            <tr key={row.id} className="group hover:bg-slate-50 dark:hover:bg-white/3 dark:hover:bg-slate-700/20 transition-colors">
              <td className="py-3 px-4">
                <span className="text-sm font-medium text-slate-800 dark:text-slate-100">{row.name}</span>
                {row.notes && (
                  <p className="text-[10px] text-slate-400 mt-0.5">{row.notes}</p>
                )}
              </td>
              <td className="py-3 px-4">
                <span className="text-xs font-mono text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded">{row.item_id}</span>
              </td>
              <td className="py-3 px-4">
                <span className="text-xs text-slate-600 dark:text-slate-300">{row.unit}</span>
              </td>
              <td className="py-3 px-4">
                <Badge label={row.county} color="slate" />
              </td>
              <td className="py-3 px-4">
                <EditCell
                  id={row.id}
                  currentPrice={row.unit_price}
                  onSave={onPriceUpdate}
                />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ─── Regional Pricing Panel ───────────────────────────────────────────────────

function RegionalPanel({ rows }: { rows: RegionalPricingRow[] }) {
  if (rows.length === 0) return null;

  return (
    <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/60 overflow-hidden">
      <div className="px-5 py-4 border-b border-slate-100 dark:border-slate-700 flex items-center gap-2">
        <MapPin className="w-4 h-4 text-slate-500 dark:text-slate-400" />
        <h2 className="font-semibold text-slate-800 dark:text-slate-100 text-sm">Regional Pricing Reference</h2>
        <div className="ml-auto flex items-center gap-1.5 text-xs text-slate-400">
          <Info className="w-3.5 h-3.5" />
          Read-only. Edit in Supabase Regional Pricing table.
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[900px]">
          <thead>
            <tr className="border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80">
              <th className="text-left py-3 px-4 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide">County</th>
              <th className="text-right py-3 px-4 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide">Material ×</th>
              <th className="text-right py-3 px-4 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide">Labour ×</th>
              <th className="text-right py-3 px-4 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide">Service ×</th>
              <th className="text-right py-3 px-4 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide">Inflation ×</th>
              <th className="text-right py-3 px-4 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide">Standard Base/m²</th>
              <th className="text-right py-3 px-4 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide">Premium Base/m²</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-700/50">
            {rows.map((row) => (
              <tr key={row.id} className="hover:bg-slate-50 dark:hover:bg-white/3 dark:hover:bg-slate-700/20 transition-colors">
                <td className="py-3 px-4">
                  <div className="flex items-center gap-2">
                    <MapPin className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                    <span className="text-sm font-medium text-slate-800 dark:text-slate-100">{row.county}</span>
                  </div>
                </td>
                <td className="py-3 px-4 text-right">
                  <MultiplierBadge value={row.material_multiplier} />
                </td>
                <td className="py-3 px-4 text-right">
                  <MultiplierBadge value={row.labour_multiplier} />
                </td>
                <td className="py-3 px-4 text-right">
                  <MultiplierBadge value={row.service_multiplier} />
                </td>
                <td className="py-3 px-4 text-right">
                  <span className="text-xs font-mono text-slate-600 dark:text-slate-300">{row.inflation_factor.toFixed(2)}×</span>
                </td>
                <td className="py-3 px-4 text-right">
                  <span className="text-sm font-semibold text-slate-700 dark:text-slate-200 tabular-nums">
                    {fmtKSh(row.base_cost_per_sqm_standard)}
                  </span>
                </td>
                <td className="py-3 px-4 text-right">
                  <span className="text-sm font-semibold text-violet-700 dark:text-violet-300 tabular-nums">
                    {fmtKSh(row.base_cost_per_sqm_premium)}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function MultiplierBadge({ value }: { value: number }) {
  const color = value > 1.1 ? 'text-amber-600 dark:text-amber-400' : value < 0.95 ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-600 dark:text-slate-300';
  return <span className={`text-xs font-mono font-semibold ${color}`}>{value.toFixed(2)}×</span>;
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function PricingAdminPage({ onBack, initialTab }: Props) {
  const [materials, setMaterials] = useState<MaterialRow[]>([]);
  const [pricing, setPricing] = useState<RegionalPricingRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState<PriceCategory>('material');
  const [mainTab, setMainTab] = useState<'materials' | 'regional'>(initialTab ?? 'materials');
  const [toast, setToast] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function load(force = false) {
    if (force) { invalidateCache(); setRefreshing(true); }
    else setLoading(true);
    setError(null);
    try {
      const [mats, regs] = await Promise.all([fetchMaterials(), fetchRegionalPricing()]);
      setMaterials(mats);
      setPricing(regs);
    } catch (e) {
      setError('Failed to load pricing data. Check your Supabase connection.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }

  useEffect(() => { load(); }, []);

  async function handlePriceUpdate(id: string, price: number) {
    const ok = await updateMaterialPrice(id, price);
    if (ok) {
      setMaterials((prev) =>
        prev.map((m) => (m.id === id ? { ...m, unit_price: price } : m))
      );
      showToast('Price updated successfully');
    } else {
      showToast('Failed to update price — try again');
    }
  }

  function showToast(msg: string) {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  }

  const tabRows = materials.filter((m) => m.category === activeTab);

  const countByCategory = (cat: PriceCategory) => materials.filter((m) => m.category === cat).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between flex-wrap gap-4">
        <div>
          <button
            onClick={onBack}
            className="inline-flex items-center gap-1.5 text-sm text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 mb-3 transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
            Back
          </button>
          <div className="flex items-center gap-2 mb-1">
            <DollarSign className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            <span className="text-xs font-semibold uppercase tracking-widest text-blue-600 dark:text-blue-400">Admin</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Pricing Administration</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 max-w-2xl">
            Prices stored in Supabase. Changes affect future BOQ estimates immediately.
            Click the <Pencil className="inline w-3 h-3 mx-0.5 align-middle" /> icon on any row to edit inline.
          </p>
        </div>
        <button
          onClick={() => load(true)}
          disabled={refreshing}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-slate-300 dark:border-white/12 dark:border-slate-600 bg-white dark:bg-slate-800 text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-white/3 dark:hover:bg-slate-700 transition-colors disabled:opacity-60"
        >
          <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
          {refreshing ? 'Refreshing…' : 'Refresh Prices'}
        </button>
      </div>

      {/* Main Tab Switch */}
      {!loading && !error && (
        <div className="flex gap-2">
          <button
            onClick={() => setMainTab('materials')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold border transition-colors ${
              mainTab === 'materials'
                ? 'bg-blue-600 text-white border-blue-600'
                : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-300 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-white/3 dark:hover:bg-slate-700'
            }`}
          >
            <Package className="w-4 h-4" />
            Material &amp; Labour Prices
          </button>
          <button
            onClick={() => setMainTab('regional')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold border transition-colors ${
              mainTab === 'regional'
                ? 'bg-emerald-600 text-white border-emerald-600'
                : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-300 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-white/3 dark:hover:bg-slate-700'
            }`}
          >
            <MapPin className="w-4 h-4" />
            Regional Pricing
          </button>
        </div>
      )}

      {/* Error state */}
      {error && (
        <div className="flex items-start gap-3 rounded-xl border border-red-200 dark:border-red-900/50 bg-red-50 dark:bg-red-950/20 px-4 py-3">
          <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-red-700 dark:text-red-400">{error}</p>
        </div>
      )}

      {/* Loading */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-24 gap-3">
          <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
          <p className="text-sm text-slate-500 dark:text-slate-400">Loading price database…</p>
        </div>
      ) : (
        <>
          {/* Category Tabs + Table — shown when mainTab = materials */}
          {mainTab === 'materials' && (
          <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/60 overflow-hidden">
            {/* Tab bar */}
            <div className="flex border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80">
              {CATEGORY_TABS.map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className={`flex items-center gap-2 px-5 py-3.5 text-sm font-medium transition-colors border-b-2 ${
                    activeTab === tab.key
                      ? 'border-blue-600 text-blue-700 dark:text-blue-400 bg-white dark:bg-slate-800'
                      : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300'
                  }`}
                >
                  {tab.icon}
                  {tab.label}
                  <span className={`ml-1 text-xs rounded-full px-1.5 py-0.5 font-semibold ${
                    activeTab === tab.key
                      ? 'bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-400'
                      : 'bg-slate-200 dark:bg-slate-700 text-slate-500 dark:text-slate-400'
                  }`}>
                    {countByCategory(tab.key)}
                  </span>
                </button>
              ))}
            </div>

            {/* Instruction hint */}
            <div className="px-4 py-2.5 bg-blue-50/50 dark:bg-blue-950/10 border-b border-blue-100 dark:border-blue-900/30 flex items-center gap-2">
              <Info className="w-3.5 h-3.5 text-blue-500 flex-shrink-0" />
              <p className="text-xs text-blue-700 dark:text-blue-400">
                Hover over a row, then click <Pencil className="inline w-3 h-3 mx-0.5 align-middle" /> to edit. Press <kbd className="bg-blue-100 dark:bg-blue-900 px-1 rounded text-[10px]">Enter</kbd> to save or <kbd className="bg-blue-100 dark:bg-blue-900 px-1 rounded text-[10px]">Esc</kbd> to cancel.
              </p>
            </div>

            {/* Table */}
            <MaterialsTable rows={tabRows} onPriceUpdate={handlePriceUpdate} />

            {/* Footer */}
            <div className="px-4 py-3 border-t border-slate-100 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 flex items-center justify-between">
              <p className="text-xs text-slate-400">
                {tabRows.length} {activeTab} item{tabRows.length !== 1 ? 's' : ''} · Prices in KSh per unit
              </p>
              <p className="text-xs text-slate-400">Last refreshed: {new Date().toLocaleTimeString('en-KE', { hour: '2-digit', minute: '2-digit' })}</p>
            </div>
          </div>
          )}

          {/* Regional Pricing Panel — shown when mainTab = regional */}
          {mainTab === 'regional' && <RegionalPanel rows={pricing} />}
        </>
      )}

      {/* Toast */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2.5 rounded-xl bg-slate-900 dark:bg-slate-700 text-white px-4 py-3 shadow-xl text-sm font-medium animate-fade-in">
          <Check className="w-4 h-4 text-emerald-400" />
          {toast}
        </div>
      )}
    </div>
  );
}
