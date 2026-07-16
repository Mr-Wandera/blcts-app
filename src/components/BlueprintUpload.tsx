import React, { useState, useRef, useCallback } from 'react';
import { Upload, FileCheck, TriangleAlert as AlertTriangle, CircleCheck as CheckCircle2, X, ArrowLeft, Loader as Loader2, Eye, FileText, Cpu, Layers, ChevronRight, Info, Building2, MapPin, RotateCcw, Pencil } from 'lucide-react';
import { analyzeBlueprint } from '../lib/gemini';
import { StepBar } from './ui/StepBar';
import { Input, Select } from './ui/Input';
import type { Project, BlueprintAnalysisResult, BuildingType, ConstructionStandard } from '../types';

interface Props {
  project: Project;
  onConfirm: (result: {
    floorAreaPerFloor: number;
    floors: number;
    buildingType: string;
    constructionStandard: string;
    county: string;
    blueprintAnalysis: BlueprintAnalysisResult;
  }) => void;
  onBack: () => void;
}

type Stage = 'idle' | 'file-selected' | 'analyzing' | 'complete' | 'error' | 'manual';

const KENYA_COUNTIES = ['Nairobi', 'Mombasa', 'Kisumu', 'Nakuru', 'Eldoret', 'Busia', 'Thika', 'Meru', 'Nyeri', 'Machakos'];
const BUILDING_TYPES = ['Residential', 'Maisonette', 'Apartment', 'Commercial', 'Office', 'Mixed-Use', 'Warehouse', 'School', 'Hospital', 'Industrial'];
const STANDARDS = ['Economy', 'Standard', 'Premium', 'Luxury'];

const STEP_LABELS = [
  'Upload File', 'Validate', 'Read File', 'AI Analysis', 'Extract GFA',
  'Building Type', 'Finish Standard', 'Regional Prices', 'Labour Rates',
  'QS Calculations', 'BOQ', 'Construction Cost', 'Lifecycle Cost', 'Report', 'Complete',
];

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function buildStepStatuses(stage: Stage, analysisStep: number): Array<'completed' | 'active' | 'pending'> {
  if (stage === 'idle') return STEP_LABELS.map((_, i) => (i === 0 ? 'active' : 'pending'));
  if (stage === 'file-selected') return STEP_LABELS.map((_, i) => i <= 1 ? 'completed' : i === 2 ? 'active' : 'pending');
  if (stage === 'analyzing') {
    return STEP_LABELS.map((_, i) => {
      if (i < analysisStep) return 'completed';
      if (i === analysisStep) return 'active';
      return 'pending';
    });
  }
  if (stage === 'complete') return STEP_LABELS.map(() => 'completed');
  if (stage === 'error') return STEP_LABELS.map((_, i) => {
    if (i < analysisStep) return 'completed';
    if (i === analysisStep) return 'active';
    return 'pending';
  });
  if (stage === 'manual') return STEP_LABELS.map((_, i) => (i === 0 ? 'completed' : 'pending'));
  return STEP_LABELS.map(() => 'pending');
}

function getCurrentStepLabel(stage: Stage, analysisStep: number): string {
  if (stage === 'idle') return STEP_LABELS[0];
  if (stage === 'file-selected') return STEP_LABELS[2];
  if (stage === 'analyzing') return STEP_LABELS[Math.min(analysisStep, 13)];
  if (stage === 'complete') return STEP_LABELS[14];
  if (stage === 'error') return STEP_LABELS[Math.min(analysisStep, 13)];
  if (stage === 'manual') return STEP_LABELS[1];
  return STEP_LABELS[0];
}


export default function BlueprintUpload({ project, onConfirm, onBack }: Props) {
  const [stage, setStage] = useState<Stage>('idle');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<BlueprintAnalysisResult | null>(null);
  const [errorMsg, setErrorMsg] = useState('');
  const [validationError, setValidationError] = useState('');
  const [analysisStep, setAnalysisStep] = useState(0);

  const [manualFloorArea, setManualFloorArea] = useState(String(project.floorAreaPerFloor ?? ''));
  const [manualFloors, setManualFloors] = useState(String(project.floors ?? ''));
  const [manualBuildingType, setManualBuildingType] = useState<string>(project.buildingType ?? 'Residential');
  const [manualStandard, setManualStandard] = useState<string>(project.constructionStandard ?? 'Standard');
  const [manualCounty, setManualCounty] = useState(project.county ?? 'Nairobi');

  const fileInputRef = useRef<HTMLInputElement>(null);

  const ALLOWED_TYPES = ['application/pdf', 'image/png', 'image/jpeg', 'image/jpg'];
  const ALLOWED_EXTS = ['.pdf', '.png', '.jpg', '.jpeg'];
  const MAX_SIZE = 15 * 1024 * 1024;

  const validateFile = (file: File): string | null => {
    const ext = '.' + file.name.split('.').pop()?.toLowerCase();
    if (!ALLOWED_TYPES.includes(file.type) && !ALLOWED_EXTS.includes(ext)) {
      return 'Unsupported file type. Upload a PDF, PNG, or JPEG.';
    }
    if (file.size > MAX_SIZE) return `File too large (${formatFileSize(file.size)}). Maximum size is 15 MB.`;
    return null;
  };

  const handleFileSelect = useCallback((file: File) => {
    const err = validateFile(file);
    if (err) { setValidationError(err); return; }
    setValidationError('');
    setSelectedFile(file);
    setAnalysisResult(null);
    setErrorMsg('');
    setStage('file-selected');
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => { e.preventDefault(); setDragOver(true); }, []);
  const handleDragLeave = useCallback(() => setDragOver(false), []);
  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault(); setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFileSelect(file);
  }, [handleFileSelect]);

  const handleAnalyze = useCallback(async () => {
    if (!selectedFile) return;
    setStage('analyzing');
    setAnalysisStep(0);
    setErrorMsg('');
    try {
      const reader = new FileReader();
      const base64data = await new Promise<string>((resolve, reject) => {
        reader.onload = () => {
          const result = reader.result as string;
          resolve(result.split(',')[1] ?? '');
        };
        reader.onerror = reject;
        reader.readAsDataURL(selectedFile);
      });

      let preStep = 0;
      await new Promise<void>((resolve) => {
        const preInterval = setInterval(() => {
          preStep += 1;
          setAnalysisStep(preStep);
          if (preStep >= 3) { clearInterval(preInterval); resolve(); }
        }, 300);
      });

      const result = await analyzeBlueprint(base64data, selectedFile.type, selectedFile.name);
      let postStep = 4;
      await new Promise<void>((resolve) => {
        const postInterval = setInterval(() => {
          setAnalysisStep(postStep);
          postStep += 1;
          if (postStep > 13) { clearInterval(postInterval); resolve(); }
        }, 100);
      });

      setAnalysisResult(result);
      setStage('complete');
      setManualFloorArea(result.estimatedFloorArea != null ? String(result.estimatedFloorArea) : String(project.floorAreaPerFloor ?? ''));
      setManualFloors(result.floors != null ? String(result.floors) : String(project.floors ?? ''));
      setManualBuildingType(result.buildingType ?? project.buildingType ?? 'Residential');
      setManualStandard(project.constructionStandard ?? 'Standard');
      setManualCounty(project.county ?? 'Nairobi');
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : 'An unexpected error occurred during analysis.');
      setStage('error');
    }
  }, [selectedFile, project]);

  const handleSkipToManual = useCallback(() => {
    setManualFloorArea(String(project.floorAreaPerFloor ?? ''));
    setManualFloors(String(project.floors ?? ''));
    setManualBuildingType(project.buildingType ?? 'Residential');
    setManualStandard(project.constructionStandard ?? 'Standard');
    setManualCounty(project.county ?? 'Nairobi');
    setStage('manual');
  }, [project]);

  const handleConfirm = useCallback(() => {
    const fa = parseFloat(manualFloorArea);
    const fl = parseInt(manualFloors, 10);
    if (!fa || fa <= 0 || !fl || fl <= 0) return;
    onConfirm({
      floorAreaPerFloor: fa,
      floors: fl,
      buildingType: manualBuildingType,
      constructionStandard: manualStandard,
      county: manualCounty,
      blueprintAnalysis: analysisResult ?? {
        estimatedFloorArea: fa,
        floors: fl,
        buildingType: manualBuildingType,
        confidence: null,
        observations: ['Parameters entered manually — no AI analysis performed.'],
        isFallback: true,
      },
    });
  }, [manualFloorArea, manualFloors, manualBuildingType, manualStandard, manualCounty, analysisResult, onConfirm]);

  const stepStatuses = buildStepStatuses(stage, analysisStep);
  const currentStepLabel = getCurrentStepLabel(stage, analysisStep);
  const showUploadZone = stage === 'idle' || stage === 'file-selected';
  const showAnalyzeButton = stage === 'file-selected';
  const showLoading = stage === 'analyzing';
  const showResults = stage === 'complete' || stage === 'manual';
  const showError = stage === 'error';

  const confidence = analysisResult?.confidence ?? 0;
  const confidenceColor = confidence > 0.8 ? 'text-emerald-500' : confidence > 0.6 ? 'text-amber-500' : 'text-rose-500';
  const confidenceBg = confidence > 0.8 ? 'bg-emerald-500' : confidence > 0.6 ? 'bg-amber-500' : 'bg-rose-500';
  const progressPct = Math.round((analysisStep / 14) * 100);

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button onClick={onBack}
          className="flex items-center gap-1.5 text-sm font-medium text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-100 transition-colors">
          <ArrowLeft className="w-4 h-4" /> Back
        </button>
        <div className="h-5 w-px bg-slate-200 dark:bg-white/12" />
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-blue-100 dark:bg-blue-950/40 flex items-center justify-center">
            <Layers className="w-4 h-4 text-emerald-600 dark:text-blue-400" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-slate-900 dark:text-white leading-tight">Blueprint Analysis</h1>
            <p className="text-xs text-slate-400 dark:text-slate-500">{project.name} · {project.county}</p>
          </div>
        </div>
      </div>

      {/* Step progress */}
      <div className="bg-white dark:bg-[#0f1629] rounded-2xl border border-slate-200 dark:border-white/8 p-4 shadow-sm">
        <StepBar steps={STEP_LABELS.map((label, i) => ({ label, status: stepStatuses[i] }))} compact={true} />
        <p className="text-xs font-semibold text-slate-400 dark:text-slate-500 mt-2.5 text-center uppercase tracking-widest">
          {currentStepLabel}
        </p>
      </div>

      <div className="max-w-3xl mx-auto space-y-5">

        {/* ── Upload Zone ──────────────────────────────────────────────── */}
        {showUploadZone && (
          <div>
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf,.png,.jpg,.jpeg"
              className="hidden"
              onChange={e => { const f = e.target.files?.[0]; if (f) handleFileSelect(f); }}
            />
            <div
              role="button"
              tabIndex={0}
              onClick={() => fileInputRef.current?.click()}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onKeyDown={e => e.key === 'Enter' && fileInputRef.current?.click()}
              className={`relative overflow-hidden rounded-2xl border-2 border-dashed cursor-pointer transition-all duration-200 ${
                dragOver
                  ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/20 scale-[1.01]'
                  : stage === 'file-selected'
                  ? 'border-emerald-400 bg-emerald-50/50 dark:bg-emerald-950/10'
                  : 'border-slate-300 dark:border-white/12 bg-white dark:bg-[#0f1629] hover:border-emerald-400 dark:hover:border-emerald-700/60 hover:bg-emerald-50/30 dark:hover:bg-emerald-950/10'
              }`}
            >
              {/* Background grid pattern */}
              <div className="absolute inset-0 bg-[linear-gradient(rgba(16,185,129,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(16,185,129,0.03)_1px,transparent_1px)] bg-[size:20px_20px] pointer-events-none" />

              <div className="relative flex flex-col items-center justify-center p-12 text-center">
                <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-4 transition-all ${
                  stage === 'file-selected' ? 'bg-emerald-100 dark:bg-emerald-950/40' : 'bg-slate-100 dark:bg-white/6'
                }`}>
                  {stage === 'file-selected'
                    ? <FileCheck className="w-8 h-8 text-emerald-600 dark:text-emerald-400" />
                    : <Upload className="w-8 h-8 text-slate-500 dark:text-slate-400" />
                  }
                </div>

                {stage === 'file-selected' && selectedFile ? (
                  <div>
                    <p className="text-base font-bold text-emerald-700 dark:text-emerald-400 mb-1">{selectedFile.name}</p>
                    <p className="text-sm text-slate-500 dark:text-slate-400">{formatFileSize(selectedFile.size)} · Click to change</p>
                    <div className="flex items-center justify-center gap-1.5 mt-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                      <span className="text-sm text-emerald-600 dark:text-emerald-400 font-medium">File validated — ready to analyse</span>
                    </div>
                  </div>
                ) : (
                  <div>
                    <p className="text-base font-semibold text-slate-700 dark:text-slate-200 mb-1">
                      {dragOver ? 'Drop your blueprint here' : 'Drag & drop or click to upload'}
                    </p>
                    <p className="text-sm text-slate-400 dark:text-slate-500 mb-3">
                      Architectural PDF, PNG, or JPEG · Maximum 15 MB
                    </p>
                    <div className="inline-flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-semibold px-5 py-2 rounded-xl transition shadow-md shadow-emerald-600/20">
                      <Upload className="w-4 h-4" /> Choose File
                    </div>
                  </div>
                )}
              </div>
            </div>

            {validationError && (
              <div className="mt-3 flex items-start gap-2.5 bg-rose-50 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-800/50 rounded-xl px-4 py-3">
                <AlertTriangle className="w-4 h-4 text-rose-500 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-rose-700 dark:text-rose-400">{validationError}</p>
              </div>
            )}
          </div>
        )}

        {/* ── Analyze Button ────────────────────────────────────────────── */}
        {showAnalyzeButton && (
          <div className="flex flex-col gap-3">
            <button onClick={handleAnalyze}
              className="w-full flex items-center justify-center gap-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-4 px-6 rounded-2xl text-base transition-all shadow-lg shadow-emerald-600/25 hover:-translate-y-px">
              <Cpu className="w-5 h-5" />
              Analyse with AI (Gemini 2.5 Flash)
            </button>
            <button onClick={handleSkipToManual}
              className="w-full flex items-center justify-center gap-2 text-sm font-medium text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 py-2.5 rounded-xl border border-dashed border-slate-200 dark:border-white/10 hover:border-slate-300 dark:hover:border-white/20 transition">
              <Pencil className="w-3.5 h-3.5" /> Skip AI — Enter Parameters Manually
            </button>
          </div>
        )}

        {/* ── Loading State ─────────────────────────────────────────────── */}
        {showLoading && (
          <div className="bg-white dark:bg-[#0f1629] rounded-2xl border border-slate-200 dark:border-white/8 p-10 flex flex-col items-center gap-5 shadow-sm">
            <div className="relative">
              <div className="w-20 h-20 rounded-2xl bg-blue-100 dark:bg-blue-950/40 flex items-center justify-center">
                <Cpu className="w-10 h-10 text-emerald-600 dark:text-blue-400" />
              </div>
              <div className="absolute inset-0 rounded-2xl border-4 border-emerald-500/30 animate-ping" />
            </div>
            <div className="text-center">
              <p className="text-lg font-bold text-slate-800 dark:text-slate-100">{currentStepLabel}</p>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Gemini AI is analysing your blueprint…</p>
            </div>
            <div className="w-full max-w-sm">
              <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
                <span>Analysis progress</span>
                <span className="font-bold tabular-nums">{progressPct}%</span>
              </div>
              <div className="h-2 rounded-full bg-slate-100 dark:bg-white/8 overflow-hidden">
                <div className="h-full rounded-full bg-gradient-to-r from-blue-500 to-emerald-500 transition-all duration-300" style={{ width: `${progressPct}%` }} />
              </div>
            </div>
          </div>
        )}

        {/* ── Error State ───────────────────────────────────────────────── */}
        {showError && (
          <div className="bg-rose-50 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-800/50 rounded-2xl p-6">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-xl bg-rose-100 dark:bg-rose-950/40 flex items-center justify-center flex-shrink-0">
                <AlertTriangle className="w-5 h-5 text-rose-600 dark:text-rose-400" />
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-rose-800 dark:text-rose-300 mb-1">Analysis Failed</h3>
                <p className="text-sm text-rose-700 dark:text-rose-400 mb-4">{errorMsg || 'An unexpected error occurred.'}</p>
                <div className="flex gap-3">
                  <button onClick={() => setStage('file-selected')}
                    className="flex items-center gap-2 bg-rose-600 hover:bg-rose-500 text-white text-sm font-semibold px-4 py-2 rounded-xl transition">
                    <RotateCcw className="w-3.5 h-3.5" /> Retry
                  </button>
                  <button onClick={handleSkipToManual}
                    className="flex items-center gap-2 border border-rose-300 dark:border-rose-700 text-rose-700 dark:text-rose-400 text-sm font-semibold px-4 py-2 rounded-xl hover:bg-rose-100 dark:hover:bg-rose-950/30 transition">
                    <Pencil className="w-3.5 h-3.5" /> Enter Manually
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ── Results & Confirmation ────────────────────────────────────── */}
        {showResults && (
          <div className="space-y-5">
            {/* AI Observations */}
            {analysisResult && !analysisResult.isFallback && (
              <div className="bg-white dark:bg-[#0f1629] rounded-2xl border border-slate-200 dark:border-white/8 overflow-hidden shadow-sm">
                <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 dark:border-white/6">
                  <div className="flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-lg bg-blue-100 dark:bg-blue-950/40 flex items-center justify-center">
                      <Cpu className="w-3.5 h-3.5 text-emerald-600 dark:text-blue-400" />
                    </div>
                    <span className="text-sm font-bold text-slate-800 dark:text-slate-100">AI Analysis Results</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-slate-400 dark:text-slate-500">Confidence</span>
                    <span className={`text-sm font-black tabular-nums ${confidenceColor}`}>
                      {analysisResult.confidence != null ? `${Math.round(analysisResult.confidence * 100)}%` : 'N/A'}
                    </span>
                    <div className="w-16 h-1.5 rounded-full bg-slate-100 dark:bg-white/8 overflow-hidden">
                      <div className={`h-full rounded-full ${confidenceBg} transition-all duration-500`}
                        style={{ width: `${(analysisResult.confidence ?? 0) * 100}%` }} />
                    </div>
                  </div>
                </div>

                {/* Extracted data grid */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-px bg-slate-100 dark:bg-white/6">
                  {[
                    { label: 'Floor Area', value: analysisResult.estimatedFloorArea != null ? `${analysisResult.estimatedFloorArea} m²/floor` : 'Not determined' },
                    { label: 'Floors', value: analysisResult.floors != null ? String(analysisResult.floors) : 'Not determined' },
                    { label: 'Building Type', value: analysisResult.buildingType ?? 'Not determined' },
                    { label: 'Drawing Scale', value: analysisResult.drawingScale ?? 'Not detected' },
                  ].map(d => (
                    <div key={d.label} className="bg-white dark:bg-[#0f1629] px-4 py-3">
                      <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500">{d.label}</p>
                      <p className={`text-sm font-bold mt-0.5 ${d.value === 'Not determined' || d.value === 'Not detected' ? 'text-slate-400 dark:text-slate-500 italic' : 'text-slate-800 dark:text-slate-100'}`}>
                        {d.value}
                      </p>
                    </div>
                  ))}
                </div>

                {/* Observations */}
                {analysisResult.observations.length > 0 && (
                  <div className="p-4 space-y-2">
                    <p className="text-xs font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500 mb-2">AI Observations</p>
                    {analysisResult.observations.map((obs, i) => (
                      <div key={i} className="flex items-start gap-2.5 text-sm">
                        <Info className="w-3.5 h-3.5 text-blue-500 flex-shrink-0 mt-0.5" />
                        <span className="text-slate-600 dark:text-slate-400">{obs}</span>
                      </div>
                    ))}
                  </div>
                )}

                {analysisResult.isFallback && (
                  <div className="mx-4 mb-4 flex items-start gap-2.5 bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800/50 rounded-xl px-3.5 py-3">
                    <AlertTriangle className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
                    <p className="text-sm text-amber-700 dark:text-amber-400">AI extraction unavailable. Please confirm parameters manually below.</p>
                  </div>
                )}
              </div>
            )}

            {/* Manual fallback notice */}
            {stage === 'manual' && (
              <div className="flex items-start gap-3 bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800/50 rounded-2xl px-4 py-3.5">
                <Pencil className="w-4 h-4 text-blue-500 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-emerald-700 dark:text-blue-400">
                  Manual entry mode. The parameters below will be used for cost estimation.
                </p>
              </div>
            )}

            {/* Confirmation form */}
            <div className="bg-white dark:bg-[#0f1629] rounded-2xl border border-slate-200 dark:border-white/8 overflow-hidden shadow-sm">
              <div className="flex items-center gap-2.5 px-5 py-4 border-b border-slate-100 dark:border-white/6">
                <div className="w-7 h-7 rounded-lg bg-emerald-100 dark:bg-emerald-950/40 flex items-center justify-center">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                </div>
                <span className="text-sm font-bold text-slate-800 dark:text-slate-100">Confirm Parameters for Cost Estimation</span>
              </div>

              <div className="p-5 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <Input
                    label="Floor Area per Floor (m²) *"
                    type="number"
                    min={1}
                    value={manualFloorArea}
                    onChange={e => setManualFloorArea(e.target.value)}
                    placeholder="e.g. 250"
                  />
                  <Input
                    label="Number of Floors *"
                    type="number"
                    min={1}
                    value={manualFloors}
                    onChange={e => setManualFloors(e.target.value)}
                    placeholder="e.g. 3"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <Select
                    label="Building Type"
                    value={manualBuildingType}
                    onChange={e => setManualBuildingType(e.target.value)}
                  >
                    {BUILDING_TYPES.map(t => <option key={t}>{t}</option>)}
                  </Select>
                  <Select
                    label="Construction Standard"
                    value={manualStandard}
                    onChange={e => setManualStandard(e.target.value)}
                  >
                    {STANDARDS.map(s => <option key={s}>{s}</option>)}
                  </Select>
                </div>

                <Select
                  label="County"
                  value={manualCounty}
                  onChange={e => setManualCounty(e.target.value)}
                >
                  {KENYA_COUNTIES.map(c => <option key={c}>{c}</option>)}
                </Select>

                {/* GFA summary */}
                {manualFloorArea && manualFloors && (
                  <div className="flex items-center gap-3 bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800/50 rounded-xl px-4 py-3">
                    <Building2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 flex-shrink-0" />
                    <div className="flex-1">
                      <p className="text-sm text-emerald-700 dark:text-emerald-400">
                        Total GFA: <strong>{(parseFloat(manualFloorArea) * parseInt(manualFloors)).toLocaleString()} m²</strong>
                        {' '}· {manualBuildingType} · {manualStandard} · {manualCounty}
                      </p>
                    </div>
                  </div>
                )}

                <button
                  onClick={handleConfirm}
                  disabled={!manualFloorArea || !manualFloors || parseFloat(manualFloorArea) <= 0}
                  className="w-full flex items-center justify-center gap-2.5 bg-emerald-600 hover:bg-emerald-500 disabled:bg-emerald-600/40 disabled:cursor-not-allowed text-white font-bold py-4 rounded-2xl text-base transition-all shadow-lg shadow-emerald-600/20 hover:-translate-y-px"
                >
                  <ChevronRight className="w-5 h-5" />
                  Proceed to Cost Estimation
                </button>
              </div>
            </div>

            {/* File info strip */}
            {selectedFile && (
              <div className="flex items-center gap-3 bg-slate-50 dark:bg-white/4 border border-slate-200 dark:border-white/8 rounded-xl px-4 py-3">
                <FileText className="w-4 h-4 text-slate-400 flex-shrink-0" />
                <p className="text-xs text-slate-500 dark:text-slate-400 flex-1 truncate">
                  <span className="font-medium text-slate-700 dark:text-slate-300">{selectedFile.name}</span>
                  {' · '}{formatFileSize(selectedFile.size)}
                </p>
                <button onClick={() => { setStage('idle'); setSelectedFile(null); setAnalysisResult(null); }}
                  className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-200 dark:hover:bg-white/10 transition">
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
