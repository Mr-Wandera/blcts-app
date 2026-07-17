import { useState, useMemo, useEffect } from 'react';
import type { Project, BOQItem, CostEstimate, LifecycleAnalysis, LifecycleCost } from '../types';
import { ArrowLeft, Calculator, TrendingUp, DollarSign, FileText, Download, RefreshCw, Building2, Layers } from 'lucide-react';
import { useToast } from './ui/Toast';
import { getRegionalMultiplier } from '../lib/pricing';

interface Props {
  project: Project;
  onGoToBlueprint: () => void;
  onProjectUpdate: (p: Project) => void;
}

const COUNTY_MULTIPLIERS: Record<string, number> = {
  Nairobi: 1.15, Mombasa: 1.12, Kisumu: 0.95, Nakuru: 0.98, Kiambu: 1.05,
  Machakos: 0.92, Kajiado: 0.88, 'Uasin Gishu': 0.90, Nyeri: 0.93, Meru: 0.91,
};

const STANDARD_MULTIPLIERS: Record<string, number> = {
  Economy: 0.85, Standard: 1.0, Premium: 1.35, Luxury: 1.75,
};

const MATERIAL_PRICES: Record<string, { unit: string; rate: number }> = {
  'Foundation Excavation': { unit: 'm³', rate: 850 },
  'Foundation Concrete (1:3:6)': { unit: 'm³', rate: 12500 },
  'Wall Construction (Stone)': { unit: 'm²', rate: 3200 },
  'Wall Construction (Block)': { unit: 'm²', rate: 1800 },
  'Reinforcement Steel': { unit: 'kg', rate: 120 },
  'Roofing Structure': { unit: 'm²', rate: 2200 },
  'Roofing Sheets (IT4)': { unit: 'm²', rate: 850 },
  'Floor Screed': { unit: 'm²', rate: 650 },
  'Floor Tiles': { unit: 'm²', rate: 1450 },
  'Wall Plastering': { unit: 'm²', rate: 450 },
  'Wall Painting': { unit: 'm²', rate: 350 },
  'Ceiling Board': { unit: 'm²', rate: 780 },
  'Doors (Panel)': { unit: 'no', rate: 8500 },
  'Windows (Aluminum)': { unit: 'no', rate: 12500 },
  'Electrical Installation': { unit: 'point', rate: 3500 },
  'Plumbing Installation': { unit: 'point', rate: 4200 },
  'Bathroom Fittings': { unit: 'set', rate: 28000 },
  'Kitchen Fittings': { unit: 'set', rate: 45000 },
  'Drainage System': { unit: 'm', rate: 1800 },
  'Perimeter Wall': { unit: 'm', rate: 3500 },
  'Gate (Steel)': { unit: 'no', rate: 45000 },
  'Paving Blocks': { unit: 'm²', rate: 950 },
  'Landscaping': { unit: 'm²', rate: 650 },
  'Water Tank': { unit: 'no', rate: 35000 },
  'Septic Tank': { unit: 'no', rate: 85000 },
  'Borehole': { unit: 'no', rate: 450000 },
  'Solar Installation': { unit: 'system', rate: 180000 },
  'CCTV Installation': { unit: 'set', rate: 75000 },
  'Alarm System': { unit: 'set', rate: 45000 },
  'Fire Safety System': { unit: 'set', rate: 120000 },
  'Elevator Installation': { unit: 'no', rate: 2500000 },
  'Generator (Backup)': { unit: 'no', rate: 350000 },
  'Water Pump': { unit: 'no', rate: 45000 },
  'HVAC System': { unit: 'set', rate: 420000 },
  'Cabinetry (Wardrobes)': { unit: 'set', rate: 38000 },
  'Cabinetry (Kitchen)': { unit: 'set', rate: 65000 },
  'Glass Partitioning': { unit: 'm²', rate: 4500 },
  'Aluminum Cladding': { unit: 'm²', rate: 3200 },
  'Waterproofing': { unit: 'm²', rate: 850 },
  'Termite Treatment': { unit: 'm²', rate: 120 },
  'Fencing Chain Link': { unit: 'm', rate: 1200 },
  'Lighting Fixtures': { unit: 'no', rate: 2500 },
  'Intercom System': { unit: 'set', rate: 35000 },
  'Burglar Proofing': { unit: 'no', rate: 8500 },
};

function formatKsh(n: number): string {
  return 'KSh ' + Math.round(n).toLocaleString('en-KE');
}

export default function CostEstimationPage({ project, onGoToBlueprint }: Props) {
  const [activeView, setActiveView] = useState<'boq' | 'lifecycle'>('boq');
  const [generating, setGenerating] = useState(false);
  const [estimate, setEstimate] = useState<CostEstimate | null>(null);
  const [lifecycle, setLifecycle] = useState<LifecycleAnalysis | null>(null);
  const [dynamicMultiplier, setDynamicMultiplier] = useState<number | null>(null);
  const { show } = useToast();

  useEffect(() => {
    let active = true;
    getRegionalMultiplier(project.county).then(m => { if (active) setDynamicMultiplier(m); });
    return () => { active = false; };
  }, [project.county]);

  const totalArea = project.floorAreaPerFloor * project.floors;
  const needsBlueprint = !project.blueprintAnalysis || totalArea === 0;

  const countyMultiplier = dynamicMultiplier ?? COUNTY_MULTIPLIERS[project.county] ?? 1.0;
  const standardMultiplier = STANDARD_MULTIPLIERS[project.constructionStandard] ?? 1.0;

  const boqItems = useMemo<BOQItem[]>(() => {
    if (totalArea === 0) return [];
    const items: BOQItem[] = [];
    const area = project.floorAreaPerFloor;
    const floors = project.floors;
    const total = totalArea;

    const entries = Object.entries(MATERIAL_PRICES);
    entries.forEach(([name, info], i) => {
      let qty = 0;
      if (name.includes('Foundation')) qty = total * 0.08;
      else if (name.includes('Wall')) qty = total * 0.35;
      else if (name.includes('Roof')) qty = area * 1.1;
      else if (name.includes('Floor') || name.includes('Screed') || name.includes('Tiles')) qty = total;
      else if (name.includes('Plaster') || name.includes('Paint')) qty = total * 0.8;
      else if (name.includes('Ceiling')) qty = total;
      else if (name.includes('Door')) qty = floors * 4;
      else if (name.includes('Window')) qty = floors * 6;
      else if (name.includes('Electrical')) qty = floors * 25;
      else if (name.includes('Plumbing')) qty = floors * 12;
      else if (name.includes('Bathroom')) qty = floors * 2;
      else if (name.includes('Kitchen')) qty = 1;
      else if (name.includes('Drainage')) qty = floors * 15;
      else if (name.includes('Perimeter') || name.includes('Fencing')) qty = 80;
      else if (name.includes('Gate')) qty = 1;
      else if (name.includes('Paving') || name.includes('Landscaping')) qty = 50;
      else if (name.includes('Water Tank')) qty = 1;
      else if (name.includes('Septic')) qty = 1;
      else if (name.includes('Borehole')) qty = 0;
      else if (name.includes('Solar')) qty = 1;
      else if (name.includes('CCTV') || name.includes('Alarm') || name.includes('Fire')) qty = 1;
      else if (name.includes('Elevator')) qty = floors > 3 ? 1 : 0;
      else if (name.includes('Generator')) qty = 1;
      else if (name.includes('Pump')) qty = 1;
      else if (name.includes('HVAC')) qty = total > 500 ? 1 : 0;
      else if (name.includes('Cabinetry') || name.includes('Wardrobe')) qty = floors * 4;
      else if (name.includes('Glass') || name.includes('Cladding')) qty = total * 0.05;
      else if (name.includes('Waterproof')) qty = area * 0.5;
      else if (name.includes('Termite')) qty = total;
      else if (name.includes('Lighting')) qty = floors * 20;
      else if (name.includes('Intercom')) qty = 1;
      else if (name.includes('Burglar')) qty = floors * 4;

      if (qty <= 0) return;
      const rate = info.rate * countyMultiplier * standardMultiplier;
      items.push({
        id: `boq-${i}`,
        category: name.includes('Foundation') ? 'Substructure' :
          name.includes('Wall') || name.includes('Plaster') || name.includes('Paint') ? 'Superstructure' :
          name.includes('Roof') || name.includes('Ceiling') ? 'Roofing' :
          name.includes('Door') || name.includes('Window') || name.includes('Glass') || name.includes('Cladding') ? 'Openings' :
          name.includes('Electrical') || name.includes('Plumbing') || name.includes('Drainage') || name.includes('Bathroom') || name.includes('Kitchen') || name.includes('Pump') || name.includes('Water') || name.includes('Septic') || name.includes('Borehole') || name.includes('Solar') ? 'Services' :
          name.includes('CCTV') || name.includes('Alarm') || name.includes('Fire') || name.includes('Intercom') || name.includes('Burglar') || name.includes('Lighting') ? 'Security & Safety' :
          name.includes('Elevator') || name.includes('HVAC') || name.includes('Generator') ? 'MEP Systems' :
          name.includes('Cabinetry') ? 'Fit-out' :
          name.includes('Perimeter') || name.includes('Gate') || name.includes('Fencing') || name.includes('Paving') || name.includes('Landscaping') ? 'External Works' :
          name.includes('Waterproof') || name.includes('Termite') ? 'Treatment' :
          'Finishes',
        description: name,
        unit: info.unit,
        quantity: Math.round(qty * 10) / 10,
        unitRate: Math.round(rate),
        totalCost: Math.round(qty * rate),
      });
    });
    return items;
  }, [totalArea, project.floorAreaPerFloor, project.floors, countyMultiplier, standardMultiplier]);

  function handleGenerate() {
    if (needsBlueprint) { show('Please upload a blueprint first', 'error'); return; }
    setGenerating(true);
    setTimeout(() => {
      const totalConstruction = boqItems.reduce((sum, i) => sum + i.totalCost, 0);
      const contingency = totalConstruction * 0.075;
      const grandTotal = totalConstruction + contingency;
      setEstimate({
        totalConstructionCost: totalConstruction,
        costPerSqm: Math.round(totalConstruction / totalArea),
        boqItems,
        regionalMultiplier: countyMultiplier,
        standardMultiplier: standardMultiplier,
        contingency,
        grandTotal,
      });

      // Lifecycle
      const years = 30;
      const inflation = 0.06;
      const annualCosts: LifecycleCost[] = [];
      let cumulative = 0;
      for (let y = 1; y <= years; y++) {
        const factor = Math.pow(1 + inflation, y - 1);
        const maintenance = Math.round(totalConstruction * 0.02 * factor);
        const energy = Math.round(totalArea * 1200 * factor);
        const cleaning = Math.round(totalArea * 450 * factor);
        const security = Math.round(180000 * factor);
        const total = maintenance + energy + cleaning + security;
        cumulative += total;
        annualCosts.push({ year: y, maintenance, energy, cleaning, security, total, cumulative });
      }
      const totalLifecycle = annualCosts.reduce((s, c) => s + c.total, 0);
      const npv = annualCosts.reduce((s, c) => s + c.total / Math.pow(1 + 0.08, c.year), 0);
      setLifecycle({ years, inflationRate: inflation, annualCosts, totalLifecycleCost: totalLifecycle, netPresentValue: Math.round(npv) });
      setGenerating(false);
      show('Cost estimation generated successfully', 'success');
    }, 1500);
  }

  if (needsBlueprint) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <button onClick={onGoToBlueprint} className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition">
            <ArrowLeft className="w-4 h-4" /> Back
          </button>
        </div>
        <div className="rounded-2xl border border-dashed border-slate-300 dark:border-white/10 p-12 text-center">
          <div className="w-14 h-14 rounded-2xl bg-slate-100 dark:bg-white/5 flex items-center justify-center mx-auto mb-4">
            <Calculator className="w-7 h-7 text-slate-300 dark:text-slate-600" />
          </div>
          <p className="text-sm font-semibold text-slate-600 dark:text-slate-300 mb-1">Blueprint analysis required</p>
          <p className="text-xs text-slate-400 mb-4">Upload and analyze a blueprint to generate cost estimates.</p>
          <button onClick={onGoToBlueprint} className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold px-4 py-2.5 rounded-xl transition shadow-sm">
            <FileText className="w-4 h-4" /> Go to Blueprint Upload
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-3">
          <button onClick={onGoToBlueprint} className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition">
            <ArrowLeft className="w-4 h-4" /> Back
          </button>
        </div>
        <button onClick={handleGenerate} disabled={generating} className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-600/50 text-white text-sm font-semibold px-4 py-2.5 rounded-xl transition shadow-sm disabled:cursor-not-allowed">
          {generating ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Calculator className="w-4 h-4" />}
          {generating ? 'Generating…' : estimate ? 'Regenerate Estimate' : 'Generate Estimate'}
        </button>
      </div>

      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Cost Estimation</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">BOQ generation and 30-year lifecycle cost forecast for {project.name}.</p>
      </div>

      {/* Project summary */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Building Type', value: project.buildingType, icon: Building2 },
          { label: 'Total Floor Area', value: `${totalArea.toLocaleString()} m²`, icon: Layers },
          { label: 'County Multiplier', value: `×${countyMultiplier}`, icon: DollarSign },
          { label: 'Standard Multiplier', value: `×${standardMultiplier}`, icon: TrendingUp },
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

      {/* View toggle */}
      <div className="inline-flex rounded-xl border border-slate-200 dark:border-white/8 p-1 bg-white dark:bg-[#0f1629]">
        <button onClick={() => setActiveView('boq')} className={`px-4 py-2 rounded-lg text-sm font-semibold transition ${activeView === 'boq' ? 'bg-emerald-600 text-white' : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'}`}>
          Bill of Quantities
        </button>
        <button onClick={() => setActiveView('lifecycle')} className={`px-4 py-2 rounded-lg text-sm font-semibold transition ${activeView === 'lifecycle' ? 'bg-emerald-600 text-white' : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'}`}>
          Lifecycle Forecast
        </button>
      </div>

      {!estimate ? (
        <div className="rounded-2xl border border-dashed border-slate-300 dark:border-white/10 p-12 text-center">
          <div className="w-14 h-14 rounded-2xl bg-emerald-50 dark:bg-emerald-950/30 flex items-center justify-center mx-auto mb-4">
            <Calculator className="w-7 h-7 text-emerald-600 dark:text-emerald-400" />
          </div>
          <p className="text-sm font-semibold text-slate-600 dark:text-slate-300 mb-1">No estimate generated yet</p>
          <p className="text-xs text-slate-400 mb-4">Click "Generate Estimate" to create the BOQ and lifecycle forecast.</p>
        </div>
      ) : activeView === 'boq' ? (
        <BOQView estimate={estimate} />
      ) : (
        <LifecycleView lifecycle={lifecycle!} estimate={estimate} />
      )}
    </div>
  );
}

function BOQView({ estimate }: { estimate: CostEstimate }) {
  const categories = [...new Set(estimate.boqItems.map(i => i.category))];
  return (
    <div className="space-y-6">
      {/* Summary cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="rounded-2xl border border-slate-200 dark:border-white/8 bg-white dark:bg-[#0f1629] p-4">
          <p className="text-xs text-slate-500 dark:text-slate-400">Construction Cost</p>
          <p className="text-xl font-black text-slate-900 dark:text-white mt-1">{formatKsh(estimate.totalConstructionCost)}</p>
        </div>
        <div className="rounded-2xl border border-slate-200 dark:border-white/8 bg-white dark:bg-[#0f1629] p-4">
          <p className="text-xs text-slate-500 dark:text-slate-400">Cost per m²</p>
          <p className="text-xl font-black text-slate-900 dark:text-white mt-1">{formatKsh(estimate.costPerSqm)}</p>
        </div>
        <div className="rounded-2xl border border-slate-200 dark:border-white/8 bg-white dark:bg-[#0f1629] p-4">
          <p className="text-xs text-slate-500 dark:text-slate-400">Contingency (7.5%)</p>
          <p className="text-xl font-black text-slate-900 dark:text-white mt-1">{formatKsh(estimate.contingency)}</p>
        </div>
        <div className="rounded-2xl border border-emerald-200 dark:border-emerald-800/40 bg-emerald-50/50 dark:bg-emerald-950/20 p-4">
          <p className="text-xs text-emerald-600 dark:text-emerald-400">Grand Total</p>
          <p className="text-xl font-black text-emerald-700 dark:text-emerald-300 mt-1">{formatKsh(estimate.grandTotal)}</p>
        </div>
      </div>

      {/* BOQ table */}
      <div className="rounded-2xl border border-slate-200 dark:border-white/8 bg-white dark:bg-[#0f1629] overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-100 dark:border-white/8 flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100">Bill of Quantities</h3>
          <span className="text-xs text-slate-400">{estimate.boqItems.length} items</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 dark:bg-white/3">
              <tr>
                <th className="text-left px-5 py-3 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide">Description</th>
                <th className="text-right px-3 py-3 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide">Qty</th>
                <th className="text-left px-3 py-3 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide">Unit</th>
                <th className="text-right px-3 py-3 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide">Rate</th>
                <th className="text-right px-5 py-3 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide">Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-white/6">
              {categories.map(cat => (
                <>
                  <tr key={cat} className="bg-slate-50/50 dark:bg-white/3">
                    <td colSpan={5} className="px-5 py-2 text-xs font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wide">{cat}</td>
                  </tr>
                  {estimate.boqItems.filter(i => i.category === cat).map(item => (
                    <tr key={item.id} className="hover:bg-slate-50 dark:hover:bg-white/3 transition">
                      <td className="px-5 py-2.5 text-slate-700 dark:text-slate-300">{item.description}</td>
                      <td className="px-3 py-2.5 text-right tabular-nums text-slate-600 dark:text-slate-400">{item.quantity.toLocaleString()}</td>
                      <td className="px-3 py-2.5 text-slate-500 dark:text-slate-400">{item.unit}</td>
                      <td className="px-3 py-2.5 text-right tabular-nums text-slate-600 dark:text-slate-400">{formatKsh(item.unitRate)}</td>
                      <td className="px-5 py-2.5 text-right tabular-nums font-semibold text-slate-800 dark:text-slate-100">{formatKsh(item.totalCost)}</td>
                    </tr>
                  ))}
                </>
              ))}
            </tbody>
            <tfoot>
              <tr className="border-t-2 border-slate-200 dark:border-white/10 bg-emerald-50/50 dark:bg-emerald-950/20">
                <td colSpan={4} className="px-5 py-3 text-sm font-bold text-slate-700 dark:text-slate-200 text-right">Grand Total:</td>
                <td className="px-5 py-3 text-right text-base font-black text-emerald-700 dark:text-emerald-300">{formatKsh(estimate.grandTotal)}</td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    </div>
  );
}

function LifecycleView({ lifecycle, estimate }: { lifecycle: LifecycleAnalysis; estimate: CostEstimate }) {
  const chartData = lifecycle.annualCosts.map(c => ({
    year: `Y${c.year}`,
    maintenance: c.maintenance,
    energy: c.energy,
    cleaning: c.cleaning,
    security: c.security,
  }));

  return (
    <div className="space-y-6">
      {/* Summary */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="rounded-2xl border border-slate-200 dark:border-white/8 bg-white dark:bg-[#0f1629] p-4">
          <p className="text-xs text-slate-500 dark:text-slate-400">Forecast Period</p>
          <p className="text-xl font-black text-slate-900 dark:text-white mt-1">{lifecycle.years} years</p>
        </div>
        <div className="rounded-2xl border border-slate-200 dark:border-white/8 bg-white dark:bg-[#0f1629] p-4">
          <p className="text-xs text-slate-500 dark:text-slate-400">Inflation Rate</p>
          <p className="text-xl font-black text-slate-900 dark:text-white mt-1">{(lifecycle.inflationRate * 100).toFixed(0)}%</p>
        </div>
        <div className="rounded-2xl border border-slate-200 dark:border-white/8 bg-white dark:bg-[#0f1629] p-4">
          <p className="text-xs text-slate-500 dark:text-slate-400">Total Lifecycle Cost</p>
          <p className="text-xl font-black text-slate-900 dark:text-white mt-1">{formatKsh(lifecycle.totalLifecycleCost)}</p>
        </div>
        <div className="rounded-2xl border border-emerald-200 dark:border-emerald-800/40 bg-emerald-50/50 dark:bg-emerald-950/20 p-4">
          <p className="text-xs text-emerald-600 dark:text-emerald-400">Net Present Value</p>
          <p className="text-xl font-black text-emerald-700 dark:text-emerald-300 mt-1">{formatKsh(lifecycle.netPresentValue)}</p>
        </div>
      </div>

      {/* Cost comparison */}
      <div className="rounded-2xl border border-slate-200 dark:border-white/8 bg-white dark:bg-[#0f1629] p-5">
        <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100 mb-4">Construction vs Lifecycle Cost</h3>
        <div className="space-y-3">
          <div>
            <div className="flex justify-between text-xs mb-1">
              <span className="text-slate-500 dark:text-slate-400">Construction Cost</span>
              <span className="font-semibold text-slate-700 dark:text-slate-200">{formatKsh(estimate.grandTotal)}</span>
            </div>
            <div className="h-3 rounded-full bg-slate-100 dark:bg-white/5 overflow-hidden">
              <div className="h-full rounded-full bg-blue-500" style={{ width: `${(estimate.grandTotal / lifecycle.totalLifecycleCost) * 100}%` }} />
            </div>
          </div>
          <div>
            <div className="flex justify-between text-xs mb-1">
              <span className="text-slate-500 dark:text-slate-400">30-Year Lifecycle Cost</span>
              <span className="font-semibold text-slate-700 dark:text-slate-200">{formatKsh(lifecycle.totalLifecycleCost)}</span>
            </div>
            <div className="h-3 rounded-full bg-slate-100 dark:bg-white/5 overflow-hidden">
              <div className="h-full rounded-full bg-emerald-500" style={{ width: '100%' }} />
            </div>
          </div>
        </div>
      </div>

      {/* Annual cost table */}
      <div className="rounded-2xl border border-slate-200 dark:border-white/8 bg-white dark:bg-[#0f1629] overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-100 dark:border-white/8">
          <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100">Annual Cost Breakdown</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 dark:bg-white/3">
              <tr>
                <th className="text-left px-5 py-3 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">Year</th>
                <th className="text-right px-3 py-3 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">Maintenance</th>
                <th className="text-right px-3 py-3 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">Energy</th>
                <th className="text-right px-3 py-3 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">Cleaning</th>
                <th className="text-right px-3 py-3 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">Security</th>
                <th className="text-right px-5 py-3 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-white/6">
              {lifecycle.annualCosts.map(c => (
                <tr key={c.year} className="hover:bg-slate-50 dark:hover:bg-white/3 transition">
                  <td className="px-5 py-2.5 font-semibold text-slate-700 dark:text-slate-200">Year {c.year}</td>
                  <td className="px-3 py-2.5 text-right tabular-nums text-slate-600 dark:text-slate-400">{formatKsh(c.maintenance)}</td>
                  <td className="px-3 py-2.5 text-right tabular-nums text-slate-600 dark:text-slate-400">{formatKsh(c.energy)}</td>
                  <td className="px-3 py-2.5 text-right tabular-nums text-slate-600 dark:text-slate-400">{formatKsh(c.cleaning)}</td>
                  <td className="px-3 py-2.5 text-right tabular-nums text-slate-600 dark:text-slate-400">{formatKsh(c.security)}</td>
                  <td className="px-5 py-2.5 text-right tabular-nums font-semibold text-slate-800 dark:text-slate-100">{formatKsh(c.total)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
