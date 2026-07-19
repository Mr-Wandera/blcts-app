<<<<<<< HEAD
import { useState, useMemo, useEffect } from 'react';
import type { Project, BOQItem, CostEstimate, LifecycleAnalysis, LifecycleCost } from '../types';
import { ArrowLeft, Calculator, TrendingUp, DollarSign, FileText, Download, RefreshCw, Building2, Layers } from 'lucide-react';
import { useToast } from './ui/Toast';
import { getRegionalMultiplier } from '../lib/pricing';
=======
// src/components/CostEstimationPage.tsx
import React, { useState, useEffect, useCallback } from 'react';
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts';
import { 
  Building2, MapPin, Layers, TrendingUp, DollarSign, Calculator, 
  FileText, Download, ChevronDown, ChevronUp, TriangleAlert as AlertTriangle, 
  CircleCheck as CheckCircle2, Printer, FileSpreadsheet, Info, Loader as Loader2, 
  ChartBar as BarChart2, Clock, Shield, Wrench, Zap 
} from 'lucide-react';
import { calculateBOQ } from '../utils/boqEngine';
import { fetchRegionalPricing, saveBOQ, fetchBOQHistory } from '../lib/supabase';
import { fmtKSh, fmtKShFull, fmtPct } from '../lib/format';
import { StepBar } from './ui/StepBar';
import { Badge } from './ui/Badge';
import type { Project, BOQEstimate, RegionalPricingRow, BuildingType, ConstructionStandard } from '../types';

const KENYA_COUNTIES = ['Nairobi', 'Mombasa', 'Kisumu', 'Nakuru', 'Eldoret', 'Busia', 'Kiambu', 'Meru', 'Nyeri', 'Machakos'];
const KIAMBU_TOWNS = ['General', 'Thika', 'Ruiru', 'Limuru', 'Kiambu Town'];
const BUILDING_TYPES: BuildingType[] = ['Residential', 'Maisonette', 'Apartment', 'Commercial', 'Office', 'Mixed-Use', 'Warehouse', 'School', 'Hospital', 'Industrial'];
const STANDARDS: ConstructionStandard[] = ['Economy', 'Standard', 'Premium', 'Luxury'];

const WORKFLOW_STEPS = [
  'Project Specifications', 'Blueprint Uploaded', 'Gemini AI Ingestion',
  'SMM Quantity Sizing', 'CAPEX Formulations', 'Lifecycle OPEX Model',
];
>>>>>>> e15734d (chore(core): stabilize SMM estimation pipeline and resolve type contracts)

interface Props {
  project: Project;
  onGoToBlueprint: () => void;
  onProjectUpdate: (p: Project) => void;
}

<<<<<<< HEAD
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
=======
export default function CostEstimationPage({ project, onGoToBlueprint, onProjectUpdate }: Props) {
  // Normalize and correct initial geographic hierarchy states
  const [county, setCounty] = useState(project.county === 'Thika' ? 'Kiambu' : project.county);
  const [town, setTown] = useState(project.county === 'Thika' ? 'Thika' : 'General');
  const [buildingType, setBuildingType] = useState<string>(project.buildingType);
  const [standard, setStandard] = useState<string>(project.constructionStandard);
  const [overrideGFA, setOverrideGFA] = useState(false);
  const [customFloorArea, setCustomFloorArea] = useState(String(project.floorAreaPerFloor));
  const [customFloors, setCustomFloors] = useState(String(project.floors));

  const [estimate, setEstimate] = useState<BOQEstimate | null>(null);
  const [running, setRunning] = useState(false);
  const [currentOpMessage, setCurrentOpMessage] = useState('');
  const [runError, setRunError] = useState('');
  const [activeTab, setActiveTab] = useState<'summary' | 'boq' | 'lifecycle' | 'report'>('summary');
  const [history, setHistory] = useState<BOQEstimate[]>([]);
  const [historyLoading, setHistoryLoading] = useState(false);

  const effectiveFloorArea = overrideGFA ? Number(customFloorArea) || 0 : project.floorAreaPerFloor;
  const effectiveFloors = overrideGFA ? Number(customFloors) || 0 : project.floors;
  const gfa = effectiveFloorArea * effectiveFloors;

  const loadHistory = useCallback(() => {
    setHistoryLoading(true);
    fetchBOQHistory(project.id)
      .then((rows) => setHistory(rows as BOQEstimate[]))
      .catch(() => setHistory([]))
      .finally(() => setHistoryLoading(false));
  }, [project.id]);

  useEffect(() => {
    loadHistory();
  }, [loadHistory]);

  const buildWorkflowSteps = useCallback(() => {
    const hasBlueprint = Boolean(project.blueprintFileName);
    const hasAnalysis = Boolean(project.blueprintAnalysis);
    const hasEstimate = Boolean(estimate);
    
    const stepsCompleted = [true, hasBlueprint, hasAnalysis, hasEstimate, hasEstimate, hasEstimate];

    return WORKFLOW_STEPS.map((label, i) => {
      if (running && i === 3) return { label, status: 'active' as const };
      if (stepsCompleted[i]) return { label, status: 'completed' as const };
      return { label, status: 'pending' as const };
    });
  }, [project, estimate, running]);

  const handleRunEstimate = async () => {
    setRunError('');
    setRunning(true);
    setActiveTab('summary');

    try {
      setCurrentOpMessage('Querying active regional price indexes from Supabase storage...');
      const pricing: RegionalPricingRow[] = await fetchRegionalPricing();
      
      setCurrentOpMessage('Executing Standard Method of Measurement (SMM) quantitative algorithms...');
      const analysis = project.blueprintAnalysis;

      const result = calculateBOQ(
        buildingType, effectiveFloors, effectiveFloorArea, standard, county,
        pricing, analysis?.observations ?? [], analysis?.confidence ?? null,
        project.id, project.name, 30, town
      );

      if (result.gfa <= 0) {
        throw new Error('Calculation Interrupted: Evaluated Gross Floor Area resolved to zero.');
      }

      setCurrentOpMessage('Serializing quantitative and life cycle cost records to database layers...');
      await saveBOQ(result);
      
      setEstimate(result);
      loadHistory();
    } catch (err: unknown) {
      setRunError(err instanceof Error ? err.message : 'Database transaction anomaly encountered.');
    } finally {
      setRunning(false);
    }
  };

  const handleExportCSV = () => {
    if (!estimate) return;
    const header = 'Section,Quantity,Unit,Rate (KSh),Amount (KSh)\n';
    const rows = estimate.lineItems.map((li) => `"${li.section}",${li.quantity},${li.unit},${li.unitRate},${li.amount}`).join('\n');
    const blob = new Blob([header + rows], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `BOQ_${project.name.replace(/\s+/g, '_')}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="bg-white dark:bg-[#0f1629] rounded-2xl border border-slate-200 dark:border-white/8 shadow-sm p-4">
        <StepBar steps={buildWorkflowSteps()} compact={true} />
      </div>

      <div className="bg-white dark:bg-[#0f1629] rounded-2xl border border-slate-200 dark:border-white/8 shadow-sm p-5">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="text-xl font-bold text-slate-800 dark:text-white">{project.name}</h1>
            <div className="flex flex-wrap items-center gap-3 mt-1.5 text-sm text-slate-500 dark:text-slate-400">
              <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5" />{project.location}</span>
              <span className="flex items-center gap-1"><Building2 className="w-3.5 h-3.5" />{county} {town !== 'General' && `(${town})`}</span>
              <span className="flex items-center gap-1"><Layers className="w-3.5 h-3.5" />Gross Area Footprint: {gfa.toLocaleString()} m²</span>
            </div>
          </div>
          <div className="flex flex-wrap gap-2 items-center">
            <Badge label={buildingType} color="blue" />
            <Badge label={standard} color="purple" />
            <Badge label={project.status} color={project.status === 'Active' ? 'green' : 'amber'} />
          </div>
        </div>
      </div>

      {project.blueprintAnalysis ? (
        <BlueprintAnalysisBanner analysis={project.blueprintAnalysis} />
      ) : (
        <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800/50 rounded-2xl p-4 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-500 flex-shrink-0" />
            <div>
              <p className="text-sm font-semibold text-amber-800">No blueprint specifications available</p>
              <p className="text-xs text-amber-600 mt-0.5">Please upload architectural layouts to activate the automatic geometric estimation chain.</p>
            </div>
          </div>
          <button onClick={onGoToBlueprint} className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white text-sm font-semibold rounded-xl transition-colors">
            Upload Layout Sheet
          </button>
        </div>
      )}

      <div className="bg-white dark:bg-[#0f1629] rounded-2xl border border-slate-200 dark:border-white/8 shadow-sm p-5">
        <div className="flex items-center gap-2 mb-4">
          <Calculator className="w-5 h-5 text-emerald-600" />
          <h2 className="text-base font-bold text-slate-800 dark:text-white">Execution Parameters Configuration</h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">Target County</label>
            <select className="w-full rounded-xl border border-slate-200 dark:border-white/12 bg-slate-50 dark:bg-white/4 px-3.5 py-2.5 text-sm" value={county} onChange={(e) => { setCounty(e.target.value); setTown('General'); }} disabled={running}>
              {KENYA_COUNTIES.map((c) => <option key={c}>{c}</option>)}
            </select>
          </div>
          {county === 'Kiambu' && (
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Town / Municipality Sub-tier</label>
              <select className="w-full rounded-xl border border-slate-200 dark:border-white/12 bg-slate-50 dark:bg-white/4 px-3.5 py-2.5 text-sm" value={town} onChange={(e) => setTown(e.target.value)} disabled={running}>
                {KIAMBU_TOWNS.map((t) => <option key={t}>{t}</option>)}
              </select>
            </div>
          )}
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">Building Type Classification</label>
            <select className="w-full rounded-xl border border-slate-200 dark:border-white/12 bg-slate-50 dark:bg-white/4 px-3.5 py-2.5 text-sm" value={buildingType} onChange={(e) => setBuildingType(e.target.value)} disabled={running}>
              {BUILDING_TYPES.map((t) => <option key={t}>{t}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">Specification Level Standard</label>
            <select className="w-full rounded-xl border border-slate-200 dark:border-white/12 bg-slate-50 dark:bg-white/4 px-3.5 py-2.5 text-sm" value={standard} onChange={(e) => setStandard(e.target.value)} disabled={running}>
              {STANDARDS.map((s) => <option key={s}>{s}</option>)}
            </select>
          </div>
        </div>

        <div className="bg-slate-50 dark:bg-white/4 rounded-xl p-4 mb-4 border border-slate-200 dark:border-white/8">
          <div className="flex items-center justify-between mb-3">
            <div>
              <p className="text-xs font-semibold text-slate-600 uppercase tracking-wider">Gross Floor Area (GFA)</p>
              <p className="text-2xl font-bold text-slate-800 dark:text-white mt-0.5">
                {gfa.toLocaleString()} <span className="text-sm font-normal text-slate-500">m²</span>
              </p>
              <p className="text-xs text-slate-500 mt-0.5">
                {effectiveFloorArea.toLocaleString()} m²/floor × {effectiveFloors} floor level{effectiveFloors !== 1 ? 's' : ''}
              </p>
            </div>
            <label className="flex items-center gap-2 cursor-pointer text-sm text-slate-600 dark:text-slate-300">
              <input type="checkbox" checked={overrideGFA} onChange={(e) => setOverrideGFA(e.target.checked)} disabled={running} className="w-4 h-4 rounded text-emerald-600 border-slate-300" />
              Override Quantitative Inputs
            </label>
          </div>
          {overrideGFA && (
            <div className="grid grid-cols-2 gap-3 pt-3 border-t border-slate-200 dark:border-white/10">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Area per Floor Slab Plate (m²)</label>
                <input type="number" min={0} className="w-full rounded-xl border p-2 text-sm" value={customFloorArea} onChange={(e) => setCustomFloorArea(e.target.value)} disabled={running} />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Building Storey Levels Count</label>
                <input type="number" min={0} className="w-full rounded-xl border p-2 text-sm" value={customFloors} onChange={(e) => setCustomFloors(e.target.value)} disabled={running} />
              </div>
            </div>
          )}
        </div>

        {running ? (
          <div className="flex items-center gap-3 text-sm text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-white/5 rounded-xl p-3 border">
            <Loader2 className="w-4 h-4 animate-spin text-emerald-600" />
            <span className="font-mono text-xs text-emerald-700 dark:text-emerald-400">{currentOpMessage}</span>
          </div>
        ) : (
          <button onClick={handleRunEstimate} className="px-8 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-sm transition-colors flex items-center gap-2 shadow-sm">
            <TrendingUp className="w-4 h-4" /> Run SMM Life Cycle Engine
          </button>
        )}

        {runError && (
          <div className="mt-3 flex items-center gap-2 text-sm text-rose-600 bg-rose-50 border border-rose-200 rounded-xl px-4 py-3">
            <AlertTriangle className="w-4 h-4 flex-shrink-0" /> {runError}
          </div>
        )}
      </div>

      {estimate && !running && (
        <ResultsSection estimate={estimate} activeTab={activeTab} setActiveTab={setActiveTab} project={project} onExportCSV={handleExportCSV} />
      )}

      <HistorySection history={history} loading={historyLoading} />
    </div>
  );
}

// ─── Blueprint Analysis Banner ────────────────────────────────────────────────

function BlueprintAnalysisBanner({ analysis }: { analysis: NonNullable<Project['blueprintAnalysis']> }) {
  const [expanded, setExpanded] = useState(false);
  const conf = analysis.confidence;

  return (
    <div className={`rounded-xl border p-4 ${analysis.isFallback ? 'bg-amber-50 border-amber-200' : 'bg-emerald-50 border-emerald-200'}`}>
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          {analysis.isFallback ? <AlertTriangle className="w-5 h-5 text-amber-500 flex-shrink-0" /> : <CheckCircle2 className="w-5 h-5 text-emerald-500 flex-shrink-0" />}
          <div>
            <p className={`text-sm font-semibold ${analysis.isFallback ? 'text-amber-800' : 'text-emerald-800'}`}>
              {analysis.isFallback ? 'Manual entry tracking engine active' : 'Gemini 2.5 Flash drawing analysis active'}
            </p>
            {conf !== null && !analysis.isFallback && (
              <div className="flex items-center gap-2 mt-1">
                <span className="text-xs text-emerald-700 font-medium">Audit certainty index: {Math.round(conf * 100)}%</span>
              </div>
            )}
          </div>
        </div>
        <button onClick={() => setExpanded((v) => !v)} className="text-xs font-semibold flex items-center gap-1 text-emerald-600">
          {expanded ? 'Hide Core Extraction' : 'View AI Extraction'} {expanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
        </button>
      </div>

      {expanded && (
        <div className="mt-4 space-y-4">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { label: 'Area Per Floor', value: analysis.estimatedFloorArea != null ? `${analysis.estimatedFloorArea} m²` : null },
              { label: 'Storeys Level Count', value: analysis.floors != null ? String(analysis.floors) : null },
              { label: 'Extracted Class', value: analysis.buildingType },
              { label: 'Extracted Roof Type', value: analysis.roofType },
              { label: 'Total Internal Rooms', value: analysis.roomCount != null ? String(analysis.roomCount) : null },
              { label: 'Bedrooms / Bathrooms', value: `BR: ${analysis.bedrooms ?? '—'} / BA: ${analysis.bathrooms ?? '—'}` },
              { label: 'Drawing Sheet Scale', value: analysis.drawingScale },
            ].map(({ label, value }) => (
              <div key={label} className="bg-white dark:bg-white/10 rounded-xl p-2.5 border">
                <p className="text-[10px] font-semibold text-slate-500 uppercase">{label}</p>
                <p className="text-xs mt-0.5 font-bold text-slate-800 dark:text-slate-200">{value ?? 'Not decipherable'}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Results Section (Type Specs Explicitly Integrated Inline) ───────────────────

function ResultsSection({ estimate, activeTab, setActiveTab, project, onExportCSV }: {
  estimate: BOQEstimate;
  activeTab: 'summary' | 'boq' | 'lifecycle' | 'report';
  setActiveTab: (t: 'summary' | 'boq' | 'lifecycle' | 'report') => void;
  project: Project;
  onExportCSV: () => void;
}) {
  const tabs: { key: typeof activeTab; label: string; icon: React.ReactNode }[] = [
    { key: 'summary', label: 'Financial Matrix Summary', icon: <BarChart2 className="w-4 h-4" /> },
    { key: 'boq', label: 'Itemized Bill of Quantities', icon: <FileText className="w-4 h-4" /> },
    { key: 'lifecycle', label: '30-Year Lifecycle OPEX Model', icon: <TrendingUp className="w-4 h-4" /> },
    { key: 'report', label: 'Executive Engineering Statement', icon: <FileSpreadsheet className="w-4 h-4" /> },
  ];

  return (
    <div className="bg-white dark:bg-[#0f1629] rounded-2xl border border-slate-200 dark:border-white/8 shadow-sm overflow-hidden">
      <div className="border-b border-slate-200 dark:border-white/8 flex overflow-x-auto bg-slate-50 dark:bg-white/3">
        {tabs.map((t) => (
          <button key={t.key} onClick={() => setActiveTab(t.key)} className={`flex items-center gap-2 px-5 py-3.5 text-sm font-semibold border-b-2 transition-colors ${activeTab === t.key ? 'border-emerald-600 text-emerald-700 bg-emerald-50/50' : 'border-transparent text-slate-500'}`}>
            {t.icon} {t.label}
>>>>>>> e15734d (chore(core): stabilize SMM estimation pipeline and resolve type contracts)
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
<<<<<<< HEAD
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
=======
      <div className="p-5">
        {activeTab === 'summary' && <SummaryTab estimate={estimate} />}
        {activeTab === 'boq' && <BOQTab estimate={estimate} onExportCSV={onExportCSV} />}
        {activeTab === 'lifecycle' && <LifecycleTab estimate={estimate} />}
        {activeTab === 'report' && <ReportTab estimate={estimate} project={project} />}
      </div>
    </div>
  );
}

// ─── Summary Tab ──────────────────────────────────────────────────────────────

function SummaryTab({ estimate }: { estimate: BOQEstimate }) {
  const kpis = [
    { label: 'Gross Floor Area', value: `${estimate.gfa.toLocaleString()} m²`, sub: `${estimate.floors} levels layout`, icon: <Layers className="w-5 h-5 text-blue-500" />, bg: 'bg-blue-50 dark:bg-blue-950/20' },
    { label: 'Cost Index Base', value: fmtKSh(estimate.costPerSqm), sub: `${estimate.constructionStandard} metrics standard`, icon: <DollarSign className="w-5 h-5 text-purple-500" />, bg: 'bg-purple-50 dark:bg-purple-950/20' },
    { label: 'Total Investment CAPEX', value: fmtKSh(estimate.totalProjectCost), sub: 'inc. Professional Fees & VAT', icon: <Building2 className="w-5 h-5 text-emerald-500" />, bg: 'bg-emerald-50 dark:bg-emerald-950/20' },
    { label: '30-Year TCO Portfolio', value: fmtKSh(estimate.tco), sub: `+ ${fmtKSh(estimate.annualOpex)}/yr base OPEX`, icon: <Clock className="w-5 h-5 text-amber-500" />, bg: 'bg-amber-50 dark:bg-amber-950/20' },
  ];

  const breakdownRows = [
    { label: 'Baseline Construction Structures Cost', amount: estimate.constructionCost, formula: `${estimate.gfa.toLocaleString()} m² × ${fmtKSh(estimate.costPerSqm)}/m²` },
    { label: 'External Civil Infrastructure & Main Reticulation', amount: estimate.externalWorks, formula: '10% of base rate cost factor', indent: true },
    { label: 'Preliminaries & General Insurance Provisions', amount: estimate.preliminaries, formula: '10% of base rate cost factor', indent: true },
    ...estimate.professionalFees.map((f) => ({ label: `${f.name} Statutory Fees Balance`, amount: f.amount, formula: `${fmtPct(f.rate)} professional scale value`, indent: true })),
    { label: 'Statutory Levies (National Construction Authority / NEMA)', amount: estimate.statutoryCosts, formula: '2% baseline markup factor', indent: true },
    { label: 'Subtotal Base Project Evaluation Sum', amount: estimate.subtotal, bold: true },
    { label: 'Unforeseen Project Contingency Financial Buffer', amount: estimate.contingency, formula: '7.5% of cumulative subtotal value', indent: true },
    { label: 'Kenya Revenue Authority Statutory Corporate VAT', amount: estimate.vatAmount, formula: '16% standard national collection rate', indent: true },
    { label: 'TOTAL CAPEX CAPITAL INVESTMENT REQUIREMENT', amount: estimate.totalProjectCost, bold: true, highlight: true },
    { label: '30-Year Inflation-Adjusted Operating Expenditure Accumulations', amount: estimate.totalLifecycleCost, formula: 'Compounded annually at 6.0% central bank baseline trend line' },
    { label: 'TOTAL PORTFOLIO COST OF OWNERSHIP (TCO MATRICES)', amount: estimate.tco, bold: true, highlight: true },
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {kpis.map((k) => (
          <div key={k.label} className={`${k.bg} rounded-xl p-4 border`}>
            <div className="flex items-center gap-2 mb-2">{k.icon}<p className="text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider">{k.label}</p></div>
            <p className="text-xl font-bold text-slate-800 dark:text-white">{k.value}</p>
            <p className="text-xs text-slate-400">{k.sub}</p>
          </div>
        ))}
      </div>
      <div className="overflow-x-auto rounded-xl border">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-slate-50 dark:bg-white/5 border-b">
              <th className="text-left py-2.5 px-4 text-xs font-semibold text-slate-500 uppercase">Financial Evaluation Vector</th>
              <th className="text-left py-2.5 px-4 text-xs font-semibold text-slate-500 uppercase">Regulatory Matrix Basis</th>
              <th className="text-right py-2.5 px-4 text-xs font-semibold text-slate-500 uppercase">Amount (KSh)</th>
            </tr>
          </thead>
          <tbody>
            {breakdownRows.map((row, i) => (
              <tr key={i} className={`border-b ${row.highlight ? 'bg-blue-50/40 dark:bg-blue-950/20 font-bold' : row.bold ? 'bg-slate-50 dark:bg-white/5 font-bold' : ''}`}>
                <td className={`py-2.5 px-4 ${row.indent ? 'pl-8' : ''}`}>{row.label}</td>
                <td className="py-2.5 px-4 text-xs text-slate-400 italic">{row.formula ?? ''}</td>
                <td className="py-2.5 px-4 text-right font-mono">{fmtKShFull(row.amount)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ─── BOQ Tab ──────────────────────────────────────────────────────────────────

function BOQTab({ estimate, onExportCSV }: { estimate: BOQEstimate; onExportCSV: () => void }) {
  const derivedSubtotal = estimate.lineItems.reduce((s, li) => s + li.amount, 0);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-bold text-slate-700 dark:text-slate-300 uppercase">Bill of Quantities (SMM Regional Calibration Layout)</h3>
          <p className="text-xs text-slate-500">{estimate.lineItems.length} active construction sections derived dynamically from plan geometry</p>
        </div>
        <button onClick={onExportCSV} className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-white/5 border rounded-xl text-sm font-semibold text-slate-700 dark:text-slate-200">
          <Download className="w-4 h-4" /> Export Structured CSV
        </button>
      </div>
      <div className="overflow-x-auto rounded-xl border">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-slate-50 dark:bg-white/5 border-b">
              <th className="text-left py-3 px-4 text-xs font-semibold text-slate-500 uppercase">Structural Item Node Section</th>
              <th className="text-right py-3 px-4 text-xs font-semibold text-slate-500 uppercase">Calculated Qty</th>
              <th className="text-left py-3 px-4 text-xs font-semibold text-slate-500 uppercase">Unit</th>
              <th className="text-right py-3 px-4 text-xs font-semibold text-slate-500 uppercase">Unit Rate (KSh)</th>
              <th className="text-right py-3 px-4 text-xs font-semibold text-slate-500 uppercase">Gross Amount (KSh)</th>
            </tr>
          </thead>
          <tbody>
            {estimate.lineItems.map((li, i) => (
              <tr key={i} className="border-b hover:bg-slate-50/50 transition-colors">
                <td className="py-3 px-4 font-medium text-slate-700 dark:text-slate-300">{li.section}</td>
                <td className="py-3 px-4 text-right font-mono text-slate-600 dark:text-slate-400">{li.quantity.toLocaleString()}</td>
                <td className="py-3 px-4 text-slate-500">{li.unit}</td>
                <td className="py-3 px-4 text-right font-mono text-slate-600 dark:text-slate-400">{fmtKShFull(li.unitRate)}</td>
                <td className="py-3 px-4 text-right font-mono font-bold text-slate-800 dark:text-white">{fmtKShFull(li.amount)}</td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr className="bg-slate-50 dark:bg-white/5 border-t-2">
              <td colSpan={4} className="py-3 px-4 font-bold text-slate-800 dark:text-white">BASE STRUCTURAL ESTIMATION TOTAL SUM</td>
              <td className="py-3 px-4 text-right font-bold font-mono text-base text-slate-800 dark:text-white">{fmtKShFull(derivedSubtotal)}</td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
}

// ─── Lifecycle Tab ────────────────────────────────────────────────────────────

function LifecycleTab({ estimate }: { estimate: BOQEstimate }) {
  const chartData = estimate.yearlyProjection.map((y) => ({
    year: `Yr ${y.year}`,
    OPEX: Math.round(y.opex / 1000),
    Cumulative: Math.round(y.cumulative / 1000),
  }));

  return (
    <div className="space-y-6">
      <div className="bg-slate-50 dark:bg-white/3 rounded-xl border p-4 h-64">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData}>
            <defs>
              <linearGradient id="colorCumulative" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.05} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="currentColor" className="text-slate-200 dark:text-white/5" />
            <XAxis dataKey="year" tick={{ fontSize: 10, fill: 'currentColor' }} className="text-slate-400" interval={4} />
            <YAxis tick={{ fontSize: 10, fill: 'currentColor' }} className="text-slate-400" tickFormatter={(v) => `${(v / 1000).toFixed(0)}M`} />
            <Tooltip contentStyle={{ background: '#0f1629', borderRadius: 8, fontSize: 12 }} formatter={(v: unknown) => [`KSh ${((v as number) * 1000).toLocaleString()}`, 'Cumulative Portfolio Volume']} />
            <Area type="monotone" dataKey="Cumulative" stroke="#3b82f6" strokeWidth={2} fill="url(#colorCumulative)" />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <div className="bg-slate-50 dark:bg-white/3 rounded-xl border p-4 h-56">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="currentColor" className="text-slate-200 dark:text-white/5" />
            <XAxis dataKey="year" tick={{ fontSize: 10, fill: 'currentColor' }} className="text-slate-400" interval={4} />
            <YAxis tick={{ fontSize: 10, fill: 'currentColor' }} className="text-slate-400" />
            <Tooltip contentStyle={{ background: '#0f1629', borderRadius: 8, fontSize: 12 }} formatter={(v: unknown) => [`KSh ${((v as number) * 1000).toLocaleString()}`, 'Annualized Operational Volume']} />
            <Bar dataKey="OPEX" fill="#10b981" radius={[3, 3, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

// ─── Report Tab ───────────────────────────────────────────────────────────────

function ReportTab({ estimate, project }: { estimate: BOQEstimate; project: Project }) {
  const handlePrint = () => window.print();

  const assumptions = [
    'Pricing base metrics are calibrated against regional construction cost indices matching architectural plan specifications.',
    'Material variance profiles track actively documented local procurement indices from regional distribution points.',
    'Labor allocations include statutory framework offsets including standard regulatory index parameters.',
    'Slab sizing assumes clear normal structural foundation layouts complying with East African regulation specifications.',
    'Lifecycle forecasting maps a steady baseline index target coefficient tracking at a 6.0% central bank target threshold.',
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-bold text-slate-700 dark:text-slate-300 uppercase">Executive Project Engineering Cost Statement</h3>
          <p className="text-xs text-slate-500">Compiled under automated system authorization tag: {new Date(estimate.createdAt).toLocaleDateString('en-KE')}</p>
        </div>
        <button onClick={handlePrint} className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-white/5 border rounded-xl text-sm font-semibold text-slate-700 dark:text-slate-200">
          <Printer className="w-4 h-4" /> Print Engineering Statement
        </button>
      </div>

      <div className="bg-white dark:bg-[#0f1629] rounded-2xl border p-5">
        <h4 className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase mb-3">Core Baseline Analytical Assumptions</h4>
        <ul className="space-y-2">
          {assumptions.map((a, i) => (
            <li key={i} className="flex items-start gap-2 text-sm text-slate-600 dark:text-slate-400">
              <span className="w-5 h-5 rounded-full bg-blue-100 dark:bg-blue-950 text-emerald-700 dark:text-emerald-400 text-[10px] font-bold flex items-center justify-center flex-shrink-0 mt-0.5">{i + 1}</span>
              {a}
            </li>
          ))}
        </ul>
      </div>
>>>>>>> e15734d (chore(core): stabilize SMM estimation pipeline and resolve type contracts)
    </div>
  );
}

function BOQView({ estimate }: { estimate: CostEstimate }) {
  const categories = [...new Set(estimate.boqItems.map(i => i.category))];
  return (
<<<<<<< HEAD
    <div className="space-y-6">
      {/* Summary cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="rounded-2xl border border-slate-200 dark:border-white/8 bg-white dark:bg-[#0f1629] p-4">
          <p className="text-xs text-slate-500 dark:text-slate-400">Construction Cost</p>
          <p className="text-xl font-black text-slate-900 dark:text-white mt-1">{formatKsh(estimate.totalConstructionCost)}</p>
=======
    <div className="bg-white dark:bg-[#0f1629] rounded-2xl border shadow-sm overflow-hidden">
      <button onClick={() => setExpanded((v) => !v)} className="w-full flex items-center justify-between px-5 py-4 hover:bg-slate-50 transition-colors">
        <div className="flex items-center gap-2">
          <Clock className="w-4 h-4 text-slate-500" />
          <span className="text-sm font-bold text-slate-700 dark:text-white">Logged Historical Calculation Indexes Archive</span>
          {!loading && <span className="text-xs text-slate-400">({history.length} operations records logged)</span>}
>>>>>>> e15734d (chore(core): stabilize SMM estimation pipeline and resolve type contracts)
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

<<<<<<< HEAD
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
=======
      {expanded && (
        <div className="border-t">
          {loading ? (
            <div className="text-center py-8 text-slate-400 text-sm flex items-center justify-center gap-2">
              <Loader2 className="w-4 h-4 animate-spin text-emerald-600" /> Querying structural database tables records...
            </div>
          ) : history.length === 0 ? (
            <div className="text-center py-8 text-slate-400 text-sm">No historical financial estimate logs exist for this asset node.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-slate-50 dark:bg-white/5 border-b border-slate-200 dark:border-white/10">
                    <th className="text-left py-2.5 px-4 text-xs font-semibold text-slate-500 uppercase">Compilation Date</th>
                    <th className="text-left py-2.5 px-4 text-xs font-semibold text-slate-500 uppercase">Standard</th>
                    <th className="text-right py-2.5 px-4 text-xs font-semibold text-slate-500 uppercase">GFA (m²)</th>
                    <th className="text-right py-2.5 px-4 text-xs font-semibold text-slate-500 uppercase">Total CAPEX Sum</th>
                    <th className="text-right py-2.5 px-4 text-xs font-semibold text-slate-500 uppercase">TCO Valuation</th>
                  </tr>
                </thead>
                <tbody>
                  {history.map((h) => (
                    <tr key={h.id} className="border-b hover:bg-slate-50/50 transition-colors">
                      <td className="py-2.5 px-4 text-slate-600 dark:text-slate-400">{new Date(h.createdAt).toLocaleDateString('en-KE')}</td>
                      <td className="py-2.5 px-4"><Badge label={h.constructionStandard} color="purple" /></td>
                      <td className="py-2.5 px-4 text-right font-mono">{h.gfa.toLocaleString()}</td>
                      <td className="py-2.5 px-4 text-right font-mono font-bold text-slate-800 dark:text-white">{fmtKSh(h.totalProjectCost)}</td>
                      <td className="py-2.5 px-4 text-right font-mono text-emerald-600 dark:text-emerald-400 font-bold">{fmtKSh(h.tco)}</td>
>>>>>>> e15734d (chore(core): stabilize SMM estimation pipeline and resolve type contracts)
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