import React, { useState, useEffect, useCallback } from 'react';
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Legend,
} from 'recharts';
import { Building2, MapPin, Layers, TrendingUp, DollarSign, Calculator, FileText, Download, ChevronDown, ChevronUp, TriangleAlert as AlertTriangle, CircleCheck as CheckCircle2, RefreshCw, Printer, FileSpreadsheet, Info, Loader as Loader2, ChartBar as BarChart2, Clock, Shield, Wrench, Zap } from 'lucide-react';
import { calculateBOQ } from '../lib/boq';
import { fetchRegionalPricing, saveBOQ, fetchBOQHistory } from '../lib/supabase';
import { fmtKSh, fmtKShFull, fmtPct } from '../lib/format';
import { StepBar } from './ui/StepBar';
import { Badge } from './ui/Badge';
import { Input, Select } from './ui/Input';
import type {
  Project, BOQEstimate, RegionalPricingRow, BuildingType, ConstructionStandard,
} from '../types';

// ─── Constants ────────────────────────────────────────────────────────────────

const KENYA_COUNTIES = [
  'Nairobi', 'Mombasa', 'Kisumu', 'Nakuru', 'Eldoret',
  'Busia', 'Thika', 'Meru', 'Nyeri', 'Machakos',
];
const BUILDING_TYPES: BuildingType[] = [
  'Residential', 'Maisonette', 'Apartment', 'Commercial', 'Office',
  'Mixed-Use', 'Warehouse', 'School', 'Hospital', 'Industrial',
];
const STANDARDS: ConstructionStandard[] = ['Economy', 'Standard', 'Premium', 'Luxury'];

const WORKFLOW_STEPS = [
  'Project Details', 'Upload Blueprint', 'Blueprint Analysis',
  'Gross Floor Area', 'Building Type', 'Construction Standard',
  'Regional Pricing', 'Material Prices', 'Labour Rates',
  'QS Calculations', 'Generate BOQ', 'Construction Cost',
  'Lifecycle Cost', 'Engineering Report', 'Download',
];

const CALC_MESSAGES = [
  'Loading regional pricing data…',
  'Applying material cost indices…',
  'Computing labour rates…',
  'Running QS calculations…',
  'Generating BOQ line items…',
  'Computing construction cost…',
  'Modelling lifecycle costs…',
  'Building engineering report…',
  'Finalising estimate…',
];

// ─── Props ────────────────────────────────────────────────────────────────────

interface Props {
  project: Project;
  onGoToBlueprint: () => void;
  onProjectUpdate: (updated: Project) => void;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function statusBadgeColor(
  status: Project['status'],
): 'amber' | 'blue' | 'green' | 'slate' {
  if (status === 'Planning') return 'amber';
  if (status === 'Under Construction') return 'blue';
  if (status === 'Active') return 'green';
  return 'slate';
}

function confidenceColor(c: number): string {
  if (c >= 0.8) return 'bg-emerald-500';
  if (c >= 0.6) return 'bg-amber-400';
  return 'bg-red-400';
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function CostEstimationPage({ project, onGoToBlueprint, onProjectUpdate }: Props) {
  // ── Parameters state ──
  const [county, setCounty] = useState(project.county);
  const [buildingType, setBuildingType] = useState<string>(project.buildingType);
  const [standard, setStandard] = useState<string>(project.constructionStandard);
  const [overrideGFA, setOverrideGFA] = useState(false);
  const [customFloorArea, setCustomFloorArea] = useState(String(project.floorAreaPerFloor));
  const [customFloors, setCustomFloors] = useState(String(project.floors));

  // ── Estimation state ──
  const [estimate, setEstimate] = useState<BOQEstimate | null>(null);
  const [running, setRunning] = useState(false);
  const [calcStep, setCalcStep] = useState(0);
  const [runError, setRunError] = useState('');

  // ── UI state ──
  const [activeTab, setActiveTab] = useState<'summary' | 'boq' | 'lifecycle' | 'report'>('summary');
  const [history, setHistory] = useState<BOQEstimate[]>([]);
  const [historyLoading, setHistoryLoading] = useState(false);

  // ── Derived values ──
  const effectiveFloorArea = overrideGFA ? Number(customFloorArea) || project.floorAreaPerFloor : project.floorAreaPerFloor;
  const effectiveFloors = overrideGFA ? Number(customFloors) || project.floors : project.floors;
  const gfa = effectiveFloorArea * effectiveFloors;

  // ── Load history on mount ──
  useEffect(() => {
    setHistoryLoading(true);
    fetchBOQHistory(project.id)
      .then((rows) => setHistory(rows as BOQEstimate[]))
      .catch(() => setHistory([]))
      .finally(() => setHistoryLoading(false));
  }, [project.id]);

  // ── Workflow step computation ──
  const buildWorkflowSteps = useCallback(() => {
    const hasBlueprint = Boolean(project.blueprintFileName);
    const hasAnalysis = Boolean(project.blueprintAnalysis);
    const hasEstimate = Boolean(estimate);
    const stepsCompleted = [
      true,                  // 0  Project Details
      hasBlueprint,          // 1  Upload Blueprint
      hasAnalysis,           // 2  Blueprint Analysis
      hasEstimate,           // 3  Gross Floor Area
      hasEstimate,           // 4  Building Type
      hasEstimate,           // 5  Construction Standard
      hasEstimate,           // 6  Regional Pricing
      hasEstimate,           // 7  Material Prices
      hasEstimate,           // 8  Labour Rates
      hasEstimate,           // 9  QS Calculations
      hasEstimate,           // 10 Generate BOQ
      hasEstimate,           // 11 Construction Cost
      hasEstimate,           // 12 Lifecycle Cost
      hasEstimate,           // 13 Engineering Report
      false,                 // 14 Download
    ];
    return WORKFLOW_STEPS.map((label, i) => {
      if (running && i <= calcStep + 5) return { label, status: 'completed' as const };
      if (running && i === calcStep + 6) return { label, status: 'active' as const };
      if (stepsCompleted[i]) return { label, status: 'completed' as const };
      if (!stepsCompleted[i] && (i === 0 || stepsCompleted[i - 1])) return { label, status: 'active' as const };
      return { label, status: 'pending' as const };
    });
  }, [project, estimate, running, calcStep]);

  // ── Run estimate ──
  const handleRunEstimate = async () => {
    setRunError('');
    setRunning(true);
    setCalcStep(0);
    setActiveTab('summary');

    try {
      // Animate calc steps
      for (let i = 0; i < CALC_MESSAGES.length; i++) {
        setCalcStep(i);
        await new Promise((r) => setTimeout(r, 350));
      }

      const pricing: RegionalPricingRow[] = await fetchRegionalPricing();
      const analysis = project.blueprintAnalysis;

      const result = calculateBOQ(
        buildingType,
        effectiveFloors,
        effectiveFloorArea,
        standard,
        county,
        pricing,
        analysis?.observations ?? [],
        analysis?.confidence ?? null,
        project.id,
        project.name,
        30,
      );

      // Save to DB (fire and forget)
      saveBOQ(result).catch(console.error);

      setEstimate(result);
      setRunning(false);
    } catch (err: unknown) {
      setRunError(err instanceof Error ? err.message : 'Failed to generate estimate. Please try again.');
      setRunning(false);
    }
  };

  // ── Export BOQ as CSV ──
  const handleExportCSV = () => {
    if (!estimate) return;
    const header = 'Section,Qty,Unit,Rate (KSh),Amount (KSh),Source\n';
    const rows = estimate.lineItems
      .map((li) => `"${li.section}",${li.quantity},${li.unit},${li.unitRate},${li.amount},${li.source}`)
      .join('\n');
    const blob = new Blob([header + rows], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `BOQ_${project.name.replace(/\s+/g, '_')}_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <div className="space-y-6 animate-fade-in">
      {/* ── Workflow StepBar ── */}
      <div className="bg-white dark:bg-[#0f1629] rounded-2xl border border-slate-200 dark:border-white/8 shadow-sm p-4">
        <StepBar steps={buildWorkflowSteps()} compact={true} />
      </div>

        {/* ── Project Banner ── */}
        <div className="bg-white dark:bg-[#0f1629] rounded-2xl border border-slate-200 dark:border-white/8 shadow-sm p-5">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <h1 className="text-xl font-bold text-slate-800 dark:text-white">{project.name}</h1>
              <div className="flex flex-wrap items-center gap-3 mt-1.5 text-sm text-slate-500 dark:text-slate-400">
                <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5" />{project.location}</span>
                <span className="flex items-center gap-1"><Building2 className="w-3.5 h-3.5" />{project.county}</span>
                <span className="flex items-center gap-1"><Layers className="w-3.5 h-3.5" />GFA: {gfa.toLocaleString()} m²</span>
              </div>
            </div>
            <div className="flex flex-wrap gap-2 items-center">
              <Badge label={project.buildingType} color="blue" />
              <Badge label={project.constructionStandard} color="purple" />
              <Badge label={project.status} color={statusBadgeColor(project.status)} />
              {project.blueprintFileName
                ? <span className="flex items-center gap-1 text-xs text-emerald-600 font-medium"><CheckCircle2 className="w-3.5 h-3.5" />{project.blueprintFileName}</span>
                : <span className="flex items-center gap-1 text-xs text-slate-400"><AlertTriangle className="w-3.5 h-3.5" />No blueprint</span>}
            </div>
          </div>
        </div>

        {/* ── Blueprint Analysis Banner ── */}
        {project.blueprintAnalysis ? (
          <BlueprintAnalysisBanner analysis={project.blueprintAnalysis} />
        ) : (
          <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800/50 rounded-2xl p-4 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <AlertTriangle className="w-5 h-5 text-amber-500 flex-shrink-0" />
              <div>
                <p className="text-sm font-semibold text-amber-800 dark:text-amber-400">No blueprint uploaded</p>
                <p className="text-xs text-amber-600 mt-0.5">Upload a blueprint for AI-assisted analysis. You can still run a manual estimate below.</p>
              </div>
            </div>
            <button
              onClick={onGoToBlueprint}
              className="flex-shrink-0 px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white text-sm font-semibold rounded-xl transition-colors"
            >
              Upload Blueprint
            </button>
          </div>
        )}

        {/* ── Parameters Panel ── */}
        <ParametersPanel
          county={county} setCounty={setCounty}
          buildingType={buildingType} setBuildingType={setBuildingType}
          standard={standard} setStandard={setStandard}
          overrideGFA={overrideGFA} setOverrideGFA={setOverrideGFA}
          customFloorArea={customFloorArea} setCustomFloorArea={setCustomFloorArea}
          customFloors={customFloors} setCustomFloors={setCustomFloors}
          effectiveFloorArea={effectiveFloorArea}
          effectiveFloors={effectiveFloors}
          gfa={gfa}
          running={running}
          calcStep={calcStep}
          runError={runError}
          onRun={handleRunEstimate}
        />

        {/* ── Results ── */}
        {estimate && !running && (
          <ResultsSection
            estimate={estimate}
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            project={project}
            onExportCSV={handleExportCSV}
          />
        )}

        {/* ── History ── */}
        <HistorySection history={history} loading={historyLoading} />
    </div>
  );
}

// ─── Blueprint Analysis Banner ────────────────────────────────────────────────

function BlueprintAnalysisBanner({ analysis }: { analysis: NonNullable<Project['blueprintAnalysis']> }) {
  const [expanded, setExpanded] = useState(false);
  const conf = analysis.confidence;
  const isFallback = analysis.isFallback;

  return (
    <div className={`rounded-xl border p-4 ${isFallback ? 'bg-amber-50 dark:bg-amber-950/20 border-amber-200 dark:border-amber-800/50' : 'bg-emerald-50 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-800/50'}`}>
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          {isFallback
            ? <AlertTriangle className="w-5 h-5 text-amber-500 flex-shrink-0" />
            : <CheckCircle2 className="w-5 h-5 text-emerald-500 flex-shrink-0" />}
          <div>
            <p className={`text-sm font-semibold ${isFallback ? 'text-amber-800 dark:text-amber-400' : 'text-emerald-800 dark:text-emerald-400'}`}>
              {isFallback ? 'AI analysis unavailable — using manual values' : 'Blueprint analyzed successfully'}
            </p>
            {conf !== null && !isFallback && (
              <div className="flex items-center gap-2 mt-1">
                <div className="w-32 h-1.5 bg-emerald-200 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all ${confidenceColor(conf)}`}
                    style={{ width: `${Math.round(conf * 100)}%` }}
                  />
                </div>
                <span className="text-xs text-emerald-700 font-medium">{Math.round(conf * 100)}% confidence</span>
              </div>
            )}
          </div>
        </div>
        <button
          onClick={() => setExpanded((v) => !v)}
          className={`text-xs font-medium flex items-center gap-1 ${isFallback ? 'text-amber-600 hover:text-amber-800 dark:text-amber-400 dark:hover:text-amber-300' : 'text-emerald-600 hover:text-emerald-800 dark:text-emerald-400 dark:hover:text-emerald-300'}`}
        >
          {expanded ? 'Hide' : 'Details'}
          {expanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
        </button>
      </div>

      {expanded && (
        <div className="mt-4 space-y-4">
          {analysis.observations.length > 0 && (
            <div>
              <p className="text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-2">Observations</p>
              <ul className="space-y-1">
                {analysis.observations.map((obs, i) => (
                  <li key={i} className="text-xs text-slate-600 dark:text-slate-400 flex items-start gap-2">
                    <span className="w-1 h-1 rounded-full bg-slate-400 mt-1.5 flex-shrink-0" />
                    {obs}
                  </li>
                ))}
              </ul>
            </div>
          )}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { label: 'Floor Area', value: analysis.estimatedFloorArea != null ? `${analysis.estimatedFloorArea} m²` : null },
              { label: 'Floors', value: analysis.floors != null ? String(analysis.floors) : null },
              { label: 'Building Type', value: analysis.buildingType },
              { label: 'Roof Type', value: analysis.roofType },
              { label: 'Rooms', value: analysis.roomCount != null ? String(analysis.roomCount) : null },
              { label: 'Bedrooms', value: analysis.bedrooms != null ? String(analysis.bedrooms) : null },
              { label: 'Bathrooms', value: analysis.bathrooms != null ? String(analysis.bathrooms) : null },
              { label: 'Scale', value: analysis.drawingScale },
            ].map(({ label, value }) => (
              <div key={label} className="bg-white/60 dark:bg-white/10 rounded-xl p-2.5 border border-white/20">
                <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">{label}</p>
                <p className={`text-xs mt-0.5 font-medium ${value ? 'text-slate-800 dark:text-white' : 'text-slate-400 italic'}`}>
                  {value ?? 'Unable to determine'}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Parameters Panel ─────────────────────────────────────────────────────────

interface ParamPanelProps {
  county: string; setCounty: (v: string) => void;
  buildingType: string; setBuildingType: (v: string) => void;
  standard: string; setStandard: (v: string) => void;
  overrideGFA: boolean; setOverrideGFA: (v: boolean) => void;
  customFloorArea: string; setCustomFloorArea: (v: string) => void;
  customFloors: string; setCustomFloors: (v: string) => void;
  effectiveFloorArea: number; effectiveFloors: number; gfa: number;
  running: boolean; calcStep: number; runError: string;
  onRun: () => void;
}

function ParametersPanel(p: ParamPanelProps) {


  return (
    <div className="bg-white dark:bg-[#0f1629] rounded-2xl border border-slate-200 dark:border-white/8 shadow-sm p-5">
      <div className="flex items-center gap-2 mb-4">
        <Calculator className="w-5 h-5 text-emerald-600" />
        <h2 className="text-base font-bold text-slate-800 dark:text-white">Estimation Parameters</h2>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
        <Select label="County" value={p.county} onChange={(e) => p.setCounty(e.target.value)} disabled={p.running}>
          {KENYA_COUNTIES.map((c) => <option key={c}>{c}</option>)}
        </Select>
        <Select label="Building Type" value={p.buildingType} onChange={(e) => p.setBuildingType(e.target.value)} disabled={p.running}>
          {BUILDING_TYPES.map((t) => <option key={t}>{t}</option>)}
        </Select>
        <Select label="Construction Standard" value={p.standard} onChange={(e) => p.setStandard(e.target.value)} disabled={p.running}>
          {STANDARDS.map((s) => <option key={s}>{s}</option>)}
        </Select>
      </div>

      {/* GFA Section */}
      <div className="bg-slate-50 dark:bg-white/4 rounded-xl p-4 mb-4 border border-slate-200 dark:border-white/8">
        <div className="flex items-center justify-between mb-3">
          <div>
            <p className="text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider">Gross Floor Area</p>
            <p className="text-2xl font-bold text-slate-800 dark:text-white mt-0.5">
              {p.gfa.toLocaleString()} <span className="text-sm font-normal text-slate-500">m²</span>
            </p>
            <p className="text-xs text-slate-500 mt-0.5">
              {p.effectiveFloorArea.toLocaleString()} m²/floor × {p.effectiveFloors} floor{p.effectiveFloors !== 1 ? 's' : ''}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <label className="flex items-center gap-2 cursor-pointer text-sm text-slate-600 dark:text-slate-400">
              <input
                type="checkbox"
                checked={p.overrideGFA}
                onChange={(e) => p.setOverrideGFA(e.target.checked)}
                disabled={p.running}
                className="w-4 h-4 rounded text-emerald-600 border-slate-300 focus:ring-emerald-500"
              />
              Override GFA
            </label>
          </div>
        </div>
        {p.overrideGFA && (
          <div className="grid grid-cols-2 gap-3 pt-3 border-t border-slate-200 dark:border-white/6">
            <Input
              label="Floor Area Per Floor (m²)"
              type="number"
              min={10}
              value={p.customFloorArea}
              onChange={(e) => p.setCustomFloorArea(e.target.value)}
              disabled={p.running}
            />
            <Input
              label="Number of Floors"
              type="number"
              min={1}
              max={50}
              value={p.customFloors}
              onChange={(e) => p.setCustomFloors(e.target.value)}
              disabled={p.running}
            />
          </div>
        )}
      </div>

      {/* Run button / loading */}
      {p.running ? (
        <div className="space-y-3">
          <div className="flex items-center gap-3 text-sm text-slate-600 dark:text-slate-400">
            <Loader2 className="w-4 h-4 animate-spin text-emerald-600 flex-shrink-0" />
            <span className="font-medium">{CALC_MESSAGES[p.calcStep] ?? 'Finalising…'}</span>
          </div>
          <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-blue-500 to-blue-600 rounded-full transition-all duration-300"
              style={{ width: `${Math.round(((p.calcStep + 1) / CALC_MESSAGES.length) * 100)}%` }}
            />
          </div>
          <p className="text-xs text-slate-400">Step {p.calcStep + 1} of {CALC_MESSAGES.length}</p>
        </div>
      ) : (
        <button
          onClick={p.onRun}
          className="w-full sm:w-auto px-8 py-3 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-bold rounded-xl text-sm transition-colors flex items-center gap-2 shadow-sm shadow-emerald-200"
        >
          <TrendingUp className="w-4 h-4" />
          Run QS Estimate
        </button>
      )}

      {p.runError && (
        <div className="mt-3 flex items-center gap-2 text-sm text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-800/50 rounded-xl px-4 py-3">
          <AlertTriangle className="w-4 h-4 flex-shrink-0" />
          {p.runError}
        </div>
      )}
    </div>
  );
}

// ─── Results Section ──────────────────────────────────────────────────────────

interface ResultsSectionProps {
  estimate: BOQEstimate;
  activeTab: 'summary' | 'boq' | 'lifecycle' | 'report';
  setActiveTab: (t: 'summary' | 'boq' | 'lifecycle' | 'report') => void;
  project: Project;
  onExportCSV: () => void;
}

function ResultsSection({ estimate, activeTab, setActiveTab, project, onExportCSV }: ResultsSectionProps) {
  const tabs: { key: typeof activeTab; label: string; icon: React.ReactNode }[] = [
    { key: 'summary', label: 'Summary', icon: <BarChart2 className="w-4 h-4" /> },
    { key: 'boq', label: 'Bill of Quantities', icon: <FileText className="w-4 h-4" /> },
    { key: 'lifecycle', label: 'Lifecycle Cost', icon: <TrendingUp className="w-4 h-4" /> },
    { key: 'report', label: 'Report', icon: <FileSpreadsheet className="w-4 h-4" /> },
  ];

  return (
    <div className="bg-white dark:bg-[#0f1629] rounded-2xl border border-slate-200 dark:border-white/8 shadow-sm overflow-hidden">
      {/* Tab bar */}
      <div className="border-b border-slate-200 dark:border-white/8 flex overflow-x-auto bg-slate-50 dark:bg-white/3">
        {tabs.map((t) => (
          <button
            key={t.key}
            onClick={() => setActiveTab(t.key)}
            className={`flex items-center gap-2 px-5 py-3.5 text-sm font-semibold whitespace-nowrap border-b-2 transition-colors ${
              activeTab === t.key
                ? 'border-emerald-600 text-emerald-700 dark:text-emerald-400 bg-emerald-50/50 dark:bg-emerald-950/10'
                : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:text-slate-300 dark:hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-white/4'
            }`}
          >
            {t.icon}
            {t.label}
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
    {
      label: 'Gross Floor Area',
      value: `${estimate.gfa.toLocaleString()} m²`,
      sub: `${estimate.floors} floor${estimate.floors !== 1 ? 's' : ''}`,
      icon: <Layers className="w-5 h-5 text-blue-500 dark:text-blue-400" />,
      bg: 'bg-blue-50 dark:bg-blue-950/30',
    },
    {
      label: 'Cost per m²',
      value: fmtKSh(estimate.costPerSqm),
      sub: `${estimate.constructionStandard} standard`,
      icon: <DollarSign className="w-5 h-5 text-purple-500 dark:text-purple-400" />,
      bg: 'bg-purple-50 dark:bg-purple-950/30',
    },
    {
      label: 'Total Project Cost',
      value: fmtKSh(estimate.totalProjectCost),
      sub: 'inc. VAT, fees & contingency',
      icon: <Building2 className="w-5 h-5 text-emerald-500 dark:text-emerald-400" />,
      bg: 'bg-emerald-50 dark:bg-emerald-950/30',
    },
    {
      label: `${estimate.lifecycleYears}-Year TCO`,
      value: fmtKSh(estimate.tco),
      sub: `+ KSh ${fmtKSh(estimate.annualOpex)}/yr OPEX`,
      icon: <Clock className="w-5 h-5 text-amber-500 dark:text-amber-400" />,
      bg: 'bg-amber-50 dark:bg-amber-950/30',
    },
  ];

  const profFeeTotal = estimate.professionalFees.reduce((s, f) => s + f.amount, 0);
  const totalPct = estimate.totalProjectCost > 0 ? estimate.constructionCost / estimate.totalProjectCost : 0;

  const breakdownRows: { label: string; amount: number; pct?: number; formula?: string; bold?: boolean; highlight?: boolean; indent?: boolean }[] = [
    {
      label: 'Construction Cost',
      amount: estimate.constructionCost,
      formula: `${estimate.gfa.toLocaleString()} m² × ${fmtKSh(estimate.costPerSqm)}/m²`,
      pct: estimate.constructionCost / estimate.totalProjectCost,
    },
    {
      label: 'External Works',
      amount: estimate.externalWorks,
      formula: `5% of construction`,
      pct: estimate.externalWorks / estimate.totalProjectCost,
      indent: true,
    },
    {
      label: 'Preliminaries',
      amount: estimate.preliminaries,
      formula: `8% of construction`,
      pct: estimate.preliminaries / estimate.totalProjectCost,
      indent: true,
    },
    ...estimate.professionalFees.map((f) => ({
      label: f.name,
      amount: f.amount,
      formula: `${fmtPct(f.rate)} of construction`,
      pct: f.amount / estimate.totalProjectCost,
      indent: true,
    })),
    {
      label: 'Statutory Costs',
      amount: estimate.statutoryCosts,
      formula: '2% of construction',
      pct: estimate.statutoryCosts / estimate.totalProjectCost,
      indent: true,
    },
    {
      label: 'Subtotal',
      amount: estimate.subtotal,
      bold: true,
    },
    {
      label: 'Contingency',
      amount: estimate.contingency,
      formula: '5% of subtotal',
      indent: true,
    },
    {
      label: 'VAT',
      amount: estimate.vatAmount,
      formula: '16% of subtotal',
      indent: true,
    },
    {
      label: 'TOTAL PROJECT COST',
      amount: estimate.totalProjectCost,
      bold: true,
      highlight: true,
    },
    {
      label: `${estimate.lifecycleYears}-Year Lifecycle Cost`,
      amount: estimate.totalLifecycleCost,
      formula: `${fmtKSh(estimate.annualOpex)}/yr × ${estimate.lifecycleYears} yrs (inflation-adj.)`,
    },
    {
      label: 'TOTAL COST OF OWNERSHIP (TCO)',
      amount: estimate.tco,
      bold: true,
      highlight: true,
    },
  ];

  return (
    <div className="space-y-6">
      {/* KPI cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {kpis.map((k) => (
          <div key={k.label} className={`${k.bg} rounded-xl p-4 border border-white`}>
            <div className="flex items-center gap-2 mb-2">{k.icon}<p className="text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider">{k.label}</p></div>
            <p className="text-xl font-bold text-slate-800 dark:text-white leading-tight">{k.value}</p>
            <p className="text-xs text-slate-500 mt-0.5">{k.sub}</p>
          </div>
        ))}
      </div>

      {/* Cost breakdown table */}
      <div>
        <h3 className="text-sm font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wide mb-3">Transparent Cost Breakdown</h3>
        <div className="overflow-x-auto rounded-xl border border-slate-200">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                <th className="text-left py-2.5 px-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Cost Item</th>
                <th className="text-left py-2.5 px-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Basis / Formula</th>
                <th className="text-right py-2.5 px-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">% of Total</th>
                <th className="text-right py-2.5 px-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Amount (KSh)</th>
              </tr>
            </thead>
            <tbody>
              {breakdownRows.map((row, i) => (
                <tr
                  key={i}
                  className={`border-b border-slate-100 dark:border-white/6 ${
                    row.highlight
                      ? 'bg-blue-50 dark:bg-blue-950/30'
                      : row.bold
                      ? 'bg-slate-50'
                      : 'hover:bg-slate-50/50 dark:hover:bg-white/3'
                  }`}
                >
                  <td className={`py-2.5 px-4 ${row.indent ? 'pl-8' : ''} ${row.bold ? 'font-bold text-slate-800 dark:text-white' : 'text-slate-700 dark:text-slate-300'} ${row.highlight ? 'text-emerald-800 dark:text-emerald-400 font-bold' : ''}`}>
                    {row.label}
                  </td>
                  <td className="py-2.5 px-4 text-xs text-slate-400 italic">{row.formula ?? ''}</td>
                  <td className="py-2.5 px-4 text-right text-xs text-slate-500">
                    {row.pct != null ? fmtPct(row.pct) : ''}
                  </td>
                  <td className={`py-2.5 px-4 text-right font-mono ${row.bold ? 'font-bold text-slate-800 dark:text-white' : 'text-slate-700 dark:text-slate-300'} ${row.highlight ? 'text-emerald-800 dark:text-emerald-400 font-bold text-base' : ''}`}>
                    {fmtKShFull(row.amount)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// ─── BOQ Tab ──────────────────────────────────────────────────────────────────

function BOQTab({ estimate, onExportCSV }: { estimate: BOQEstimate; onExportCSV: () => void }) {
  const subtotal = estimate.lineItems.reduce((s, li) => s + li.amount, 0);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wide">Bill of Quantities</h3>
          <p className="text-xs text-slate-500 mt-0.5">{estimate.lineItems.length} sections · {estimate.buildingType} · {estimate.constructionStandard}</p>
        </div>
        <button
          onClick={onExportCSV}
          className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-white/4 hover:bg-slate-50 dark:hover:bg-white/8 border border-slate-200 dark:border-white/12 rounded-xl text-sm font-semibold text-slate-700 dark:text-slate-300 transition-colors"
        >
          <Download className="w-4 h-4" />
          Export CSV
        </button>
      </div>

      <div className="overflow-x-auto rounded-xl border border-slate-200">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200">
              <th className="text-left py-3 px-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Section</th>
              <th className="text-right py-3 px-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Qty</th>
              <th className="text-left py-3 px-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Unit</th>
              <th className="text-right py-3 px-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Rate (KSh)</th>
              <th className="text-right py-3 px-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Amount (KSh)</th>
              <th className="text-right py-3 px-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">%</th>
              <th className="text-center py-3 px-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Basis</th>
            </tr>
          </thead>
          <tbody>
            {estimate.lineItems.map((li, i) => (
              <tr key={i} className="border-b border-slate-100 dark:border-white/6 dark:border-white/6 hover:bg-slate-50/60 dark:hover:bg-white/3 transition-colors">
                <td className="py-3 px-4 font-medium text-slate-700 dark:text-slate-300">{li.section}</td>
                <td className="py-3 px-4 text-right text-slate-600 dark:text-slate-400 font-mono">{li.quantity.toLocaleString()}</td>
                <td className="py-3 px-4 text-slate-500">{li.unit}</td>
                <td className="py-3 px-4 text-right font-mono text-slate-600 dark:text-slate-400">{fmtKShFull(li.unitRate)}</td>
                <td className="py-3 px-4 text-right font-mono font-semibold text-slate-800 dark:text-white dark:text-slate-100">{fmtKShFull(li.amount)}</td>
                <td className="py-3 px-4 text-right text-xs text-slate-400">
                  {subtotal > 0 ? fmtPct(li.amount / subtotal) : '—'}
                </td>
                <td className="py-3 px-4 text-center">
                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider bg-slate-100 text-slate-500 border border-slate-200">
                    {li.source}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr className="bg-slate-50 border-t-2 border-slate-300">
              <td colSpan={4} className="py-3 px-4 font-bold text-slate-800 dark:text-white dark:text-slate-100">SUBTOTAL</td>
              <td className="py-3 px-4 text-right font-bold text-slate-800 dark:text-white dark:text-slate-100 font-mono">{fmtKShFull(subtotal)}</td>
              <td className="py-3 px-4 text-right text-slate-500">100%</td>
              <td />
            </tr>
          </tfoot>
        </table>
      </div>
      <p className="text-xs text-slate-400 flex items-center gap-1.5"><Info className="w-3.5 h-3.5" />All rates are KSh inclusive of supply and fix. Rates sourced from regional pricing database for {estimate.county} county.</p>
    </div>
  );
}

// ─── Lifecycle Tab ────────────────────────────────────────────────────────────

function LifecycleTab({ estimate }: { estimate: BOQEstimate }) {
  const opexBreakdown = [
    { label: 'Maintenance & Repairs', pct: 0.45, icon: <Wrench className="w-4 h-4 text-blue-500 dark:text-blue-400" />, bg: 'bg-blue-50 dark:bg-blue-950/30' },
    { label: 'Utilities & Energy', pct: 0.30, icon: <Zap className="w-4 h-4 text-amber-500 dark:text-amber-400" />, bg: 'bg-amber-50 dark:bg-amber-950/30' },
    { label: 'Insurance & Security', pct: 0.15, icon: <Shield className="w-4 h-4 text-emerald-500 dark:text-emerald-400" />, bg: 'bg-emerald-50 dark:bg-emerald-950/30' },
    { label: 'Inspections & Compliance', pct: 0.10, icon: <CheckCircle2 className="w-4 h-4 text-purple-500 dark:text-purple-400" />, bg: 'bg-purple-50 dark:bg-purple-950/30' },
  ];

  const chartData = estimate.yearlyProjection.map((y) => ({
    year: `Yr ${y.year}`,
    OPEX: Math.round(y.opex / 1000),
    Cumulative: Math.round(y.cumulative / 1000),
  }));

  const tcoRows = [
    { label: 'Total Construction Cost', amount: estimate.totalProjectCost },
    { label: `${estimate.lifecycleYears}-Year OPEX (inflation-adjusted)`, amount: estimate.totalLifecycleCost },
    { label: 'TOTAL COST OF OWNERSHIP', amount: estimate.tco, highlight: true },
    { label: 'Average Annual TCO', amount: estimate.tco / estimate.lifecycleYears },
    { label: 'TCO per m²', amount: estimate.tco / estimate.gfa },
  ];

  return (
    <div className="space-y-6">
      {/* OPEX breakdown cards */}
      <div>
        <h3 className="text-sm font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wide mb-3">Annual OPEX Breakdown</h3>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {opexBreakdown.map((item) => (
            <div key={item.label} className={`${item.bg} rounded-xl p-4 border border-white`}>
              <div className="flex items-center gap-2 mb-2">{item.icon}</div>
              <p className="text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">{item.label}</p>
              <p className="text-lg font-bold text-slate-800 dark:text-white dark:text-slate-100">{fmtKSh(estimate.annualOpex * item.pct)}</p>
              <p className="text-xs text-slate-500">per year ({Math.round(item.pct * 100)}%)</p>
            </div>
          ))}
        </div>
      </div>

      {/* Area chart - Cumulative Cost */}
      <div>
        <h3 className="text-sm font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wide mb-3">Cumulative Lifecycle Cost (KSh '000)</h3>
        <div className="bg-slate-50 rounded-xl border border-slate-200 p-4 h-64">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
              <defs>
                <linearGradient id="colorCumulative" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.05} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="currentColor" className="text-slate-100 dark:text-white/6" />
              <XAxis dataKey="year" tick={{ fontSize: 10 }} interval={4} />
              <YAxis tick={{ fontSize: 10 }} tickFormatter={(v) => `${(v / 1000).toFixed(0)}M`} />
              <Tooltip
                contentStyle={{ fontSize: 12, borderRadius: 8, border: '1px solid #e2e8f0' }}
                formatter={(v: unknown) => [`KSh ${((v as number) * 1000).toLocaleString()}`, 'Cumulative']}
              />
              <Area type="monotone" dataKey="Cumulative" stroke="#3b82f6" strokeWidth={2} fill="url(#colorCumulative)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Bar chart - Annual OPEX */}
      <div>
        <h3 className="text-sm font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wide mb-3">Annual OPEX with Inflation (KSh '000)</h3>
        <div className="bg-slate-50 rounded-xl border border-slate-200 p-4 h-56">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="currentColor" className="text-slate-100 dark:text-white/6" />
              <XAxis dataKey="year" tick={{ fontSize: 10 }} interval={4} />
              <YAxis tick={{ fontSize: 10 }} />
              <Tooltip
                contentStyle={{ fontSize: 12, borderRadius: 8, border: '1px solid #e2e8f0' }}
                formatter={(v: unknown) => [`KSh ${((v as number) * 1000).toLocaleString()}`, 'Annual OPEX']}
              />
              <Bar dataKey="OPEX" fill="#10b981" radius={[3, 3, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* TCO Summary table */}
      <div>
        <h3 className="text-sm font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wide mb-3">TCO Summary</h3>
        <div className="overflow-x-auto rounded-xl border border-slate-200">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                <th className="text-left py-2.5 px-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Item</th>
                <th className="text-right py-2.5 px-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Amount (KSh)</th>
              </tr>
            </thead>
            <tbody>
              {tcoRows.map((row, i) => (
                <tr key={i} className={`border-b border-slate-100 dark:border-white/6 dark:border-white/6 ${row.highlight ? 'bg-blue-50 dark:bg-blue-950/30' : 'hover:bg-slate-50/50 dark:hover:bg-white/3'}`}>
                  <td className={`py-2.5 px-4 ${row.highlight ? 'font-bold text-emerald-800 dark:text-emerald-400' : 'text-slate-700 dark:text-slate-300'}`}>{row.label}</td>
                  <td className={`py-2.5 px-4 text-right font-mono ${row.highlight ? 'font-bold text-emerald-800 dark:text-emerald-400 text-base' : 'text-slate-700 dark:text-slate-300'}`}>{fmtKShFull(row.amount)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// ─── Report Tab ───────────────────────────────────────────────────────────────

function ReportTab({ estimate, project }: { estimate: BOQEstimate; project: Project }) {
  const handlePrint = () => window.print();

  const assumptions = [
    'Rates based on Nairobi/regional BORAQS and NCA published schedules.',
    'Material costs indexed to current market prices as at date of estimate.',
    'Labour rates include statutory deductions (NSSF, NHIF, PAYE) and accommodation.',
    'Structural engineering assumes standard soil bearing capacity; geotechnical investigation may alter foundation costs.',
    'MEP installation assumes standard building complexity for the building type.',
    'Lifecycle costs assume 2.5% annual inflation rate.',
    'Professional fees calculated as percentage of construction cost per BORAQS guidelines.',
    'External works allow for standard site access, boundary wall, and basic landscaping.',
  ];

  const limitations = [
    'This estimate is indicative only and should not be used as a contract sum.',
    'Site-specific conditions (soil type, access, topography) may significantly affect costs.',
    'Market volatility in construction materials can cause actual costs to vary ±15–25%.',
    'Specialist or unique architectural features are not accounted for in base rates.',
    'Regulatory changes or NCA fee revisions may affect statutory costs.',
    'This BOQ has not been verified by a registered Quantity Surveyor.',
  ];

  const params = [
    { label: 'Project Name', value: estimate.projectName },
    { label: 'County', value: estimate.county },
    { label: 'Building Type', value: estimate.buildingType },
    { label: 'Construction Standard', value: estimate.constructionStandard },
    { label: 'Gross Floor Area', value: `${estimate.gfa.toLocaleString()} m²` },
    { label: 'Number of Floors', value: String(estimate.floors) },
    { label: 'Cost per m²', value: fmtKShFull(estimate.costPerSqm) },
    { label: 'Lifecycle Period', value: `${estimate.lifecycleYears} years` },
    { label: 'Estimate Date', value: new Date(estimate.createdAt).toLocaleDateString('en-KE', { day: 'numeric', month: 'long', year: 'numeric' }) },
  ];

  const conf = estimate.aiConfidence;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wide">Engineering Cost Report</h3>
          <p className="text-xs text-slate-500 mt-0.5">Generated on {new Date(estimate.createdAt).toLocaleDateString('en-KE')}</p>
        </div>
        <button
          onClick={handlePrint}
          className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-white/4 hover:bg-slate-50 dark:hover:bg-white/8 border border-slate-200 dark:border-white/12 rounded-xl text-sm font-semibold text-slate-700 dark:text-slate-300 transition-colors"
        >
          <Printer className="w-4 h-4" />
          Print Report
        </button>
      </div>

      {/* Detected parameters */}
      <div className="bg-slate-50 rounded-xl border border-slate-200 p-5">
        <h4 className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-3">Project Parameters</h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {params.map((p) => (
            <div key={p.label}>
              <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">{p.label}</p>
              <p className="text-sm font-semibold text-slate-800 dark:text-white mt-0.5">{p.value}</p>
            </div>
          ))}
        </div>
      </div>

      {/* AI Confidence */}
      {conf !== null && (
        <div className="bg-white dark:bg-[#0f1629] rounded-2xl border border-slate-200 dark:border-white/8 p-5">
          <h4 className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-3">Blueprint AI Confidence</h4>
          <div className="flex items-center gap-4">
            <div className="flex-1 h-3 bg-slate-200 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all ${confidenceColor(conf)}`}
                style={{ width: `${Math.round(conf * 100)}%` }}
              />
            </div>
            <span className="text-sm font-bold text-slate-700 dark:text-slate-300 w-12 text-right">{Math.round(conf * 100)}%</span>
          </div>
          <p className="text-xs text-slate-400 mt-2">
            {conf >= 0.8 ? 'High confidence — extracted values closely match a real blueprint.'
              : conf >= 0.6 ? 'Medium confidence — some values may need manual verification.'
              : 'Low confidence — manual verification strongly recommended.'}
          </p>
        </div>
      )}

      {/* Observations */}
      {estimate.blueprintObservations.length > 0 && (
        <div className="bg-white dark:bg-[#0f1629] rounded-2xl border border-slate-200 dark:border-white/8 p-5">
          <h4 className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-3">Blueprint Observations</h4>
          <ul className="space-y-2">
            {estimate.blueprintObservations.map((obs, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-slate-600 dark:text-slate-400">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0 mt-0.5" />
                {obs}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Assumptions */}
      <div className="bg-white dark:bg-[#0f1629] rounded-2xl border border-slate-200 dark:border-white/8 p-5">
        <h4 className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-3">Assumptions</h4>
        <ul className="space-y-2">
          {assumptions.map((a, i) => (
            <li key={i} className="flex items-start gap-2 text-sm text-slate-600 dark:text-slate-400">
              <span className="w-5 h-5 rounded-full bg-blue-100 text-emerald-700 text-[10px] font-bold flex items-center justify-center flex-shrink-0 mt-0.5">{i + 1}</span>
              {a}
            </li>
          ))}
        </ul>
      </div>

      {/* Limitations */}
      <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800/50 rounded-xl p-5">
        <div className="flex items-center gap-2 mb-3">
          <AlertTriangle className="w-4 h-4 text-amber-500" />
          <h4 className="text-xs font-bold text-amber-700 dark:text-amber-400 uppercase tracking-wider">Limitations & Disclaimers</h4>
        </div>
        <ul className="space-y-2">
          {limitations.map((l, i) => (
            <li key={i} className="flex items-start gap-2 text-sm text-amber-800 dark:text-amber-400">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400 mt-2 flex-shrink-0" />
              {l}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

// ─── History Section ──────────────────────────────────────────────────────────

function HistorySection({ history, loading }: { history: BOQEstimate[]; loading: boolean }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="bg-white dark:bg-[#0f1629] rounded-2xl border border-slate-200 dark:border-white/8 shadow-sm overflow-hidden">
      <button
        onClick={() => setExpanded((v) => !v)}
        className="w-full flex items-center justify-between px-5 py-4 hover:bg-slate-50 dark:hover:bg-white/3 transition-colors"
      >
        <div className="flex items-center gap-2">
          <Clock className="w-4 h-4 text-slate-500" />
          <span className="text-sm font-bold text-slate-700 dark:text-slate-300">Estimate History</span>
          {!loading && <span className="text-xs text-slate-400">({history.length} saved)</span>}
        </div>
        {expanded ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
      </button>

      {expanded && (
        <div className="border-t border-slate-200">
          {loading ? (
            <div className="flex items-center justify-center gap-2 py-8 text-slate-400 text-sm">
              <Loader2 className="w-4 h-4 animate-spin" />
              Loading history…
            </div>
          ) : history.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-sm text-slate-400">No saved estimates yet</p>
              <p className="text-xs text-slate-300 mt-1">Run an estimate to see it here</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200">
                    <th className="text-left py-2.5 px-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Date</th>
                    <th className="text-left py-2.5 px-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Standard</th>
                    <th className="text-right py-2.5 px-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">GFA (m²)</th>
                    <th className="text-right py-2.5 px-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Cost/m²</th>
                    <th className="text-right py-2.5 px-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Cost</th>
                    <th className="text-right py-2.5 px-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">TCO</th>
                  </tr>
                </thead>
                <tbody>
                  {history.map((h) => (
                    <tr key={h.id} className="border-b border-slate-100 dark:border-white/6 dark:border-white/6 hover:bg-slate-50/60 dark:hover:bg-white/3 transition-colors">
                      <td className="py-2.5 px-4 text-slate-600 dark:text-slate-400 whitespace-nowrap">
                        {new Date(h.createdAt).toLocaleDateString('en-KE', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </td>
                      <td className="py-2.5 px-4">
                        <Badge
                          label={h.constructionStandard}
                          color={h.constructionStandard === 'Economy' ? 'slate' : h.constructionStandard === 'Standard' ? 'blue' : h.constructionStandard === 'Premium' ? 'purple' : 'amber'}
                        />
                      </td>
                      <td className="py-2.5 px-4 text-right font-mono text-slate-600 dark:text-slate-400">{h.gfa.toLocaleString()}</td>
                      <td className="py-2.5 px-4 text-right font-mono text-slate-600 dark:text-slate-400">{fmtKSh(h.costPerSqm)}</td>
                      <td className="py-2.5 px-4 text-right font-mono font-semibold text-slate-800 dark:text-white dark:text-slate-100">{fmtKSh(h.totalProjectCost)}</td>
                      <td className="py-2.5 px-4 text-right font-mono text-emerald-700 font-semibold">{fmtKSh(h.tco)}</td>
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
