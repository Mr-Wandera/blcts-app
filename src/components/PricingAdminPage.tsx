import { useState, useEffect } from 'react';
import { ArrowLeft, DollarSign, MapPin, Search, Plus, CreditCard as Edit3, Save, X, TrendingUp } from 'lucide-react';
import { useToast } from './ui/Toast';
import { fetchMaterials, fetchRegions, updateMaterialPrice, updateRegionMultiplier, FALLBACK_MATERIALS, FALLBACK_REGIONS } from '../lib/pricing';
import type { MaterialPrice, RegionalPrice } from '../types';

interface Props {
  onBack: () => void;
  initialTab?: 'materials' | 'regional';
}

const inputBase = 'w-full px-3.5 py-2.5 rounded-xl border bg-white dark:bg-[#0f1629] text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition';
const labelBase = 'block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-1.5';

const selectStyle = {
  backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%2394a3b8' stroke-width='2'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E")`,
  backgroundRepeat: 'no-repeat',
  backgroundPosition: 'right 12px center',
  paddingRight: '36px',
  appearance: 'none',
};



function formatKsh(n: number): string {
  return 'KSh ' + Math.round(n).toLocaleString('en-KE');
}

export default function PricingAdminPage({ onBack, initialTab = 'materials' }: Props) {
  const [tab, setTab] = useState<'materials' | 'regional'>(initialTab);
  const [materials, setMaterials] = useState<MaterialPrice[]>(() => {
    try { return JSON.parse(localStorage.getItem('blcts_materials') || 'null') || FALLBACK_MATERIALS; } catch { return FALLBACK_MATERIALS; }
  });
  const [regions, setRegions] = useState<RegionalPrice[]>(() => {
    try { return JSON.parse(localStorage.getItem('blcts_regions') || 'null') || FALLBACK_REGIONS; } catch { return FALLBACK_REGIONS; }
  });
  const [search, setSearch] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState(0);
  const [editMultiplier, setEditMultiplier] = useState(0);
  const [loading, setLoading] = useState(true);
  const { show } = useToast();

  useEffect(() => {
    let active = true;
    (async () => {
      const [m, r] = await Promise.all([fetchMaterials(), fetchRegions()]);
      if (!active) return;
      setMaterials(m);
      setRegions(r);
      localStorage.setItem('blcts_materials', JSON.stringify(m));
      localStorage.setItem('blcts_regions', JSON.stringify(r));
      setLoading(false);
    })();
    return () => { active = false; };
  }, []);

  function saveMaterials() {
    localStorage.setItem('blcts_materials', JSON.stringify(materials));
  }
  function saveRegions() {
    localStorage.setItem('blcts_regions', JSON.stringify(regions));
  }

  function handleEditMaterial(id: string, currentPrice: number) {
    setEditingId(id);
    setEditValue(currentPrice);
  }

  function handleSaveMaterial(id: string) {
    setMaterials(prev => prev.map(m => m.id === id ? { ...m, basePrice: editValue } : m));
    setEditingId(null);
    saveMaterials();
    updateMaterialPrice(id, editValue);
    show('Material price updated', 'success');
  }

  function handleEditRegion(id: string, currentMultiplier: number) {
    setEditingId(id);
    setEditMultiplier(currentMultiplier);
  }

  function handleSaveRegion(id: string) {
    setRegions(prev => prev.map(r => r.id === id ? { ...r, multiplier: editMultiplier } : r));
    setEditingId(null);
    saveRegions();
    updateRegionMultiplier(id, editMultiplier);
    show('Regional multiplier updated', 'success');
  }

  const filteredMaterials = materials.filter(m =>
    m.name.toLowerCase().includes(search.toLowerCase()) ||
    m.category.toLowerCase().includes(search.toLowerCase())
  );

  const materialCategories = [...new Set(filteredMaterials.map(m => m.category))];

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <button onClick={onBack} className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition">
          <ArrowLeft className="w-4 h-4" /> Back to Dashboard
        </button>
      </div>

      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Pricing Administration</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Manage material base prices and regional cost multipliers.</p>
      </div>

      {/* Tab toggle */}
      <div className="inline-flex rounded-xl border border-slate-200 dark:border-white/8 p-1 bg-white dark:bg-[#0f1629]">
        <button onClick={() => setTab('materials')} className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition ${tab === 'materials' ? 'bg-emerald-600 text-white' : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'}`}>
          <DollarSign className="w-4 h-4" /> Material Prices
        </button>
        <button onClick={() => setTab('regional')} className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition ${tab === 'regional' ? 'bg-emerald-600 text-white' : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'}`}>
          <MapPin className="w-4 h-4" /> Regional Pricing
        </button>
      </div>

      {tab === 'materials' ? (
        <>
          {/* Stats */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { label: 'Total Materials', value: materials.length, icon: DollarSign },
              { label: 'Categories', value: materialCategories.length, icon: Plus },
              { label: 'Avg Price', value: formatKsh(materials.reduce((s, m) => s + m.basePrice, 0) / materials.length), icon: TrendingUp },
              { label: 'Highest Price', value: formatKsh(Math.max(...materials.map(m => m.basePrice))), icon: DollarSign },
            ].map(s => (
              <div key={s.label} className="rounded-2xl border border-slate-200 dark:border-white/8 bg-white dark:bg-[#0f1629] p-4">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-8 h-8 rounded-lg bg-emerald-50 dark:bg-emerald-950/30 flex items-center justify-center">
                    <s.icon className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400">{s.label}</p>
                </div>
                <p className="text-lg font-bold text-slate-900 dark:text-white">{s.value}</p>
              </div>
            ))}
          </div>

          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder="Search materials…" className={inputBase + ' pl-10'} />
          </div>

          {/* Materials table */}
          <div className="rounded-2xl border border-slate-200 dark:border-white/8 bg-white dark:bg-[#0f1629] overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-slate-50 dark:bg-white/3">
                  <tr>
                    <th className="text-left px-5 py-3 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">Material</th>
                    <th className="text-left px-3 py-3 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">Category</th>
                    <th className="text-left px-3 py-3 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">Unit</th>
                    <th className="text-right px-5 py-3 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">Base Price</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-white/6">
                  {filteredMaterials.map(m => (
                    <tr key={m.id} className="hover:bg-slate-50 dark:hover:bg-white/3 transition">
                      <td className="px-5 py-2.5 text-slate-700 dark:text-slate-300 font-medium">{m.name}</td>
                      <td className="px-3 py-2.5 text-slate-500 dark:text-slate-400">{m.category}</td>
                      <td className="px-3 py-2.5 text-slate-500 dark:text-slate-400">{m.unit}</td>
                      <td className="px-5 py-2.5 text-right">
                        {editingId === m.id ? (
                          <div className="flex items-center justify-end gap-1.5">
                            <input type="number" value={editValue} onChange={e => setEditValue(Number(e.target.value))} className="w-28 px-2 py-1 rounded-lg border border-slate-200 dark:border-white/10 bg-white dark:bg-[#0f1629] text-slate-900 dark:text-white text-sm text-right" autoFocus />
                            <button onClick={() => handleSaveMaterial(m.id)} className="text-emerald-600 hover:text-emerald-700 p-1"><Save className="w-4 h-4" /></button>
                            <button onClick={() => setEditingId(null)} className="text-slate-400 hover:text-slate-600 p-1"><X className="w-4 h-4" /></button>
                          </div>
                        ) : (
                          <div className="flex items-center justify-end gap-2 group">
                            <span className="tabular-nums font-semibold text-slate-800 dark:text-slate-100">{formatKsh(m.basePrice)}</span>
                            <button onClick={() => handleEditMaterial(m.id, m.basePrice)} className="opacity-0 group-hover:opacity-100 text-slate-400 hover:text-emerald-600 transition p-1">
                              <Edit3 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      ) : (
        <>
          {/* Regional pricing */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {regions.map(r => (
              <div key={r.id} className="rounded-2xl border border-slate-200 dark:border-white/8 bg-white dark:bg-[#0f1629] p-5">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div className="w-9 h-9 rounded-xl bg-blue-50 dark:bg-blue-950/30 flex items-center justify-center">
                      <MapPin className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                    </div>
                    <p className="text-sm font-bold text-slate-800 dark:text-slate-100">{r.county}</p>
                  </div>
                  {editingId === r.id ? (
                    <div className="flex items-center gap-1">
                      <button onClick={() => handleSaveRegion(r.id)} className="text-emerald-600 hover:text-emerald-700 p-1"><Save className="w-4 h-4" /></button>
                      <button onClick={() => setEditingId(null)} className="text-slate-400 hover:text-slate-600 p-1"><X className="w-4 h-4" /></button>
                    </div>
                  ) : (
                    <button onClick={() => handleEditRegion(r.id, r.multiplier)} className="opacity-0 hover:opacity-100 text-slate-400 hover:text-emerald-600 transition p-1 group-hover:opacity-100">
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
                {editingId === r.id ? (
                  <div>
                    <label className={labelBase}>Multiplier</label>
                    <input type="number" step="0.01" min="0.5" max="2" value={editMultiplier} onChange={e => setEditMultiplier(Number(e.target.value))} className={inputBase} autoFocus />
                  </div>
                ) : (
                  <div>
                    <p className="text-2xl font-black text-slate-900 dark:text-white">×{r.multiplier.toFixed(2)}</p>
                    <p className="text-xs text-slate-400 mt-1">
                      {r.multiplier > 1 ? `${((r.multiplier - 1) * 100).toFixed(0)}% above base` : r.multiplier < 1 ? `${((1 - r.multiplier) * 100).toFixed(0)}% below base` : 'Base rate'}
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
