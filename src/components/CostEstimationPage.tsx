// src/components/CostEstimationPage.tsx
import React, { useState, useEffect, useCallback } from 'react';
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts';
import {
  Building2, MapPin, Layers, TrendingUp, DollarSign, Calculator,
  FileText, Download, ChevronDown, ChevronUp, TriangleAlert as AlertTriangle,
  CircleCheck as CheckCircle2, Printer, FileSpreadsheet, Info, Loader as Loader2,
  BarChart2, Clock, Shield, Wrench, Zap
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

interface Props {
  project: Project;
  onGoToBlueprint: () => void;
  onProjectUpdate: (p: Project) => void;
}

export default function CostEstimationPage({ project, onGoToBlueprint, onProjectUpdate }: Props) {
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
      .then((rows) => setHistory(rows))
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
            <Badge label={project.status ?? 'Planning'} color={project.status === 'Active' ? 'green' : 'amber'} />
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
    <div className="rounded-xl border p-4 bg-emerald-50 border-emerald-200">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <CheckCircle2 className="w-5 h-5 text-emerald-500 flex-shrink-0" />
          <div>
            <p className="text-sm font-semibold text-emerald-800">
              Gemini 2.5 Flash drawing analysis active
            </p>
            {conf !== null && (
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
              { label: 'Extracted Roof Type', value: analysis.roofType ?? null },
              { label: 'Total Internal Rooms', value: analysis.roomCount != null ? String(analysis.roomCount) : null },
              { label: 'Bedrooms / Bathrooms', value: `BR: ${analysis.bedrooms ?? '—'} / BA: ${analysis.bathrooms ?? '—'}` },
              { label: 'Drawing Sheet Scale', value: analysis.drawingScale ?? null },
            ].map(({ label, value }) => (
              <div key={label} className="bg-white dark:bg-white/10 rounded-xl p-2.5 border">
                <p className="text-[10px] font-semibold text-slate-500 uppercase">{label}</p>
                <p className="text-xs mt-0.5 font-bold text-slate-800 dark:text-slate-200">{value ?? 'Not decipherable'}</p>
              </div>
            ))}
          </div>
          {analysis.observations.length > 0 && (
            <ul className="space-y-1">
              {analysis.observations.map((o, i) => (
                <li key={i} className="text-xs text-slate-600 dark:text-slate-300 flex items-start gap-2">
                  <Info className="w-3 h-3 mt-0.5 flex-shrink-0 text-emerald-500" /> {o}
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}

// ─── Results Section ───────────────────────────────────────────────────────────

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
          </button>
        ))}
      </div>
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

      <div className="bg-white dark:bg-[#0f1629] rounded-2xl border p-5">
        <h4 className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase mb-3">Project Parameter Matrix</h4>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-sm">
          <div><span className="text-slate-500">Project:</span> <span className="font-semibold text-slate-800 dark:text-white">{project.name}</span></div>
          <div><span className="text-slate-500">County:</span> <span className="font-semibold text-slate-800 dark:text-white">{estimate.county}</span></div>
          <div><span className="text-slate-500">Building Type:</span> <span className="font-semibold text-slate-800 dark:text-white">{estimate.buildingType}</span></div>
          <div><span className="text-slate-500">Standard:</span> <span className="font-semibold text-slate-800 dark:text-white">{estimate.constructionStandard}</span></div>
          <div><span className="text-slate-500">GFA:</span> <span className="font-semibold text-slate-800 dark:text-white">{estimate.gfa.toLocaleString()} m²</span></div>
          <div><span className="text-slate-500">Floors:</span> <span className="font-semibold text-slate-800 dark:text-white">{estimate.floors}</span></div>
        </div>
      </div>
    </div>
  );
}

// ─── History Section ───────────────────────────────────────────────────────────

function HistorySection({ history, loading }: { history: BOQEstimate[]; loading: boolean }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="bg-white dark:bg-[#0f1629] rounded-2xl border shadow-sm overflow-hidden">
      <button onClick={() => setExpanded((v) => !v)} className="w-full flex items-center justify-between px-5 py-4 hover:bg-slate-50 transition-colors">
        <div className="flex items-center gap-2">
          <Clock className="w-4 h-4 text-slate-500" />
          <span className="text-sm font-bold text-slate-700 dark:text-white">Logged Historical Calculation Indexes Archive</span>
          {!loading && <span className="text-xs text-slate-400">({history.length} operations records logged)</span>}
        </div>
        {expanded ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
      </button>
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
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
