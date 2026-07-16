import { useState, useRef } from 'react';
import type { Project, BlueprintAnalysisResult, DetectedRoom, BuildingType, ConstructionStandard } from '../types';
import { Upload, FileImage, ArrowLeft, ArrowRight, Cpu, CircleCheck as CheckCircle2, CircleAlert as AlertCircle, X } from 'lucide-react';
import { useToast } from './ui/Toast';

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

const BUILDING_TYPES: BuildingType[] = ['Residential', 'Maisonette', 'Apartment', 'Commercial', 'Office', 'Mixed-Use', 'Warehouse', 'School', 'Hospital', 'Industrial'];
const CONSTRUCTION_STANDARDS: ConstructionStandard[] = ['Economy', 'Standard', 'Premium', 'Luxury'];
const COUNTIES = ['Nairobi', 'Mombasa', 'Kisumu', 'Nakuru', 'Kiambu', 'Machakos', 'Kajiado', 'Uasin Gishu', 'Nyeri', 'Meru'];

const inputBase = 'w-full px-3.5 py-2.5 rounded-xl border bg-white dark:bg-[#0f1629] text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition';
const labelBase = 'block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-1.5';

export default function BlueprintUpload({ project, onConfirm, onBack }: Props) {
  const [step, setStep] = useState<'upload' | 'analyzing' | 'review'>('upload');
  const [fileName, setFileName] = useState('');
  const [dragOver, setDragOver] = useState(false);
  const [analysis, setAnalysis] = useState<BlueprintAnalysisResult | null>(null);
  const [editable, setEditable] = useState({
    floorAreaPerFloor: 0,
    floors: 1,
    buildingType: 'Residential' as BuildingType,
    constructionStandard: 'Standard' as ConstructionStandard,
    county: 'Nairobi',
  });
  const fileRef = useRef<HTMLInputElement>(null);
  const { show } = useToast();

  function handleFile(file: File) {
    if (!file) return;
    setFileName(file.name);
    show(`File "${file.name}" uploaded`, 'success');
    runAnalysis();
  }

  function runAnalysis() {
    setStep('analyzing');
    setTimeout(() => {
      // Simulated AI analysis result
      const rooms: DetectedRoom[] = [
        { label: 'Bedroom', count: 4, areaSqm: 14 },
        { label: 'Bathroom', count: 2, areaSqm: 5 },
        { label: 'Kitchen', count: 1, areaSqm: 12 },
        { label: 'Living Room', count: 1, areaSqm: 25 },
        { label: 'Dining Room', count: 1, areaSqm: 15 },
        { label: 'Store', count: 1, areaSqm: 4 },
      ];
      const totalArea = rooms.reduce((sum, r) => sum + r.areaSqm * r.count, 0);
      const result: BlueprintAnalysisResult = {
        floorAreaPerFloor: Math.round(totalArea * 1.15),
        floors: 3,
        buildingType: 'Residential',
        constructionStandard: 'Standard',
        county: project.county || 'Nairobi',
        confidence: 87,
        detectedRooms: rooms,
        notes: 'AI analysis complete. Building parameters extracted from blueprint. Room layout detected with high confidence.',
      };
      setAnalysis(result);
      setEditable({
        floorAreaPerFloor: result.floorAreaPerFloor,
        floors: result.floors,
        buildingType: result.buildingType as BuildingType,
        constructionStandard: result.constructionStandard as ConstructionStandard,
        county: result.county,
      });
      setStep('review');
      show('AI analysis complete', 'success');
    }, 2500);
  }

  function handleConfirm() {
    onConfirm({
      floorAreaPerFloor: editable.floorAreaPerFloor,
      floors: editable.floors,
      buildingType: editable.buildingType,
      constructionStandard: editable.constructionStandard,
      county: editable.county,
      blueprintAnalysis: analysis!,
    });
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <button onClick={onBack} className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition">
          <ArrowLeft className="w-4 h-4" />
          Back to Projects
        </button>
      </div>

      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Blueprint Analysis</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Upload a blueprint for AI-powered extraction of building parameters.</p>
      </div>

      {/* Step indicator */}
      <div className="flex items-center gap-2">
        {['Upload', 'AI Analysis', 'Review'].map((label, i) => {
          const stepNum = i + 1;
          const currentStep = step === 'upload' ? 1 : step === 'analyzing' ? 2 : 3;
          const isActive = stepNum === currentStep;
          const isDone = stepNum < currentStep;
          return (
            <div key={label} className="flex items-center gap-2 flex-1">
              <div className={`flex items-center gap-2 ${isActive ? 'text-emerald-600 dark:text-emerald-400' : isDone ? 'text-emerald-500' : 'text-slate-400'}`}>
                <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${isActive ? 'bg-emerald-600 text-white' : isDone ? 'bg-emerald-100 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400' : 'bg-slate-100 text-slate-400 dark:bg-white/5'}`}>
                  {isDone ? <CheckCircle2 className="w-4 h-4" /> : stepNum}
                </div>
                <span className="text-xs font-semibold hidden sm:inline">{label}</span>
              </div>
              {i < 2 && <div className={`flex-1 h-0.5 rounded ${isDone ? 'bg-emerald-300 dark:bg-emerald-800' : 'bg-slate-200 dark:bg-white/8'}`} />}
            </div>
          );
        })}
      </div>

      {/* Upload step */}
      {step === 'upload' && (
        <div
          onDragOver={e => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={e => { e.preventDefault(); setDragOver(false); const file = e.dataTransfer.files[0]; if (file) handleFile(file); }}
          className={`rounded-2xl border-2 border-dashed p-12 text-center transition ${dragOver ? 'border-emerald-400 bg-emerald-50/50 dark:bg-emerald-950/10' : 'border-slate-300 dark:border-white/10'}`}
        >
          <input ref={fileRef} type="file" accept="image/*,.pdf" className="hidden" onChange={e => { const f = e.target.files?.[0]; if (f) handleFile(f); }} />
          <div className="w-16 h-16 rounded-2xl bg-emerald-50 dark:bg-emerald-950/30 flex items-center justify-center mx-auto mb-4">
            <Upload className="w-8 h-8 text-emerald-600 dark:text-emerald-400" />
          </div>
          <p className="text-sm font-semibold text-slate-700 dark:text-slate-200 mb-1">Drop your blueprint here</p>
          <p className="text-xs text-slate-400 mb-4">Supports PNG, JPG, PDF — up to 10MB</p>
          <button onClick={() => fileRef.current?.click()} className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold px-5 py-2.5 rounded-xl transition shadow-sm">
            <FileImage className="w-4 h-4" />
            Choose File
          </button>
          {fileName && (
            <div className="mt-4 inline-flex items-center gap-2 text-xs text-emerald-600 dark:text-emerald-400 font-medium">
              <CheckCircle2 className="w-4 h-4" />
              {fileName}
            </div>
          )}
        </div>
      )}

      {/* Analyzing step */}
      {step === 'analyzing' && (
        <div className="rounded-2xl border border-slate-200 dark:border-white/8 bg-white dark:bg-[#0f1629] p-12 text-center">
          <div className="w-16 h-16 rounded-2xl bg-violet-50 dark:bg-violet-950/30 flex items-center justify-center mx-auto mb-4">
            <Cpu className="w-8 h-8 text-violet-600 dark:text-violet-400 animate-pulse" />
          </div>
          <p className="text-sm font-semibold text-slate-700 dark:text-slate-200 mb-1">AI Analysis in Progress</p>
          <p className="text-xs text-slate-400 mb-4">Gemini is extracting building parameters from your blueprint…</p>
          <div className="flex items-center justify-center gap-2">
            {[0, 1, 2].map(i => (
              <div key={i} className="w-2 h-2 rounded-full bg-violet-400 animate-bounce" style={{ animationDelay: `${i * 150}ms` }} />
            ))}
          </div>
        </div>
      )}

      {/* Review step */}
      {step === 'review' && analysis && (
        <div className="space-y-6">
          {/* AI confidence */}
          <div className="rounded-2xl border border-violet-200 dark:border-violet-800/40 bg-violet-50/50 dark:bg-violet-950/20 p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-violet-100 dark:bg-violet-950/40 flex items-center justify-center flex-shrink-0">
              <Cpu className="w-5 h-5 text-violet-600 dark:text-violet-400" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-semibold text-violet-700 dark:text-violet-300">AI Analysis Complete — {analysis.confidence}% confidence</p>
              <p className="text-xs text-violet-600/70 dark:text-violet-400/70 mt-0.5">{analysis.notes}</p>
            </div>
          </div>

          {/* Detected rooms */}
          <div className="rounded-2xl border border-slate-200 dark:border-white/8 bg-white dark:bg-[#0f1629] overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-100 dark:border-white/8">
              <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100">Detected Rooms</h3>
            </div>
            <div className="divide-y divide-slate-100 dark:divide-white/6">
              {analysis.detectedRooms.map((r, i) => (
                <div key={i} className="flex items-center justify-between px-5 py-3">
                  <span className="text-sm text-slate-700 dark:text-slate-300">{r.label}</span>
                  <div className="flex items-center gap-4 text-xs text-slate-500 dark:text-slate-400">
                    <span>{r.count} unit{r.count > 1 ? 's' : ''}</span>
                    <span>{r.areaSqm} m² each</span>
                    <span className="font-semibold text-slate-700 dark:text-slate-200">{(r.areaSqm * r.count).toLocaleString()} m²</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Editable parameters */}
          <div className="rounded-2xl border border-slate-200 dark:border-white/8 bg-white dark:bg-[#0f1629] p-6">
            <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100 mb-4">Review & Edit Parameters</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <label className={labelBase}>Floor Area per Floor (m²)</label>
                <input type="number" min="0" value={editable.floorAreaPerFloor} onChange={e => setEditable(p => ({ ...p, floorAreaPerFloor: Number(e.target.value) }))} className={inputBase} />
              </div>
              <div>
                <label className={labelBase}>Number of Floors</label>
                <input type="number" min="1" value={editable.floors} onChange={e => setEditable(p => ({ ...p, floors: Number(e.target.value) }))} className={inputBase} />
              </div>
              <div>
                <label className={labelBase}>County</label>
                <select value={editable.county} onChange={e => setEditable(p => ({ ...p, county: e.target.value }))} className={inputBase + ' appearance-none cursor-pointer'} style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%2394a3b8' stroke-width='2'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 12px center', paddingRight: '36px' }}>
                  {COUNTIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label className={labelBase}>Building Type</label>
                <select value={editable.buildingType} onChange={e => setEditable(p => ({ ...p, buildingType: e.target.value as BuildingType }))} className={inputBase + ' appearance-none cursor-pointer'} style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%2394a3b8' stroke-width='2'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 12px center', paddingRight: '36px' }}>
                  {BUILDING_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
              <div>
                <label className={labelBase}>Construction Standard</label>
                <select value={editable.constructionStandard} onChange={e => setEditable(p => ({ ...p, constructionStandard: e.target.value as ConstructionStandard }))} className={inputBase + ' appearance-none cursor-pointer'} style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%2394a3b8' stroke-width='2'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 12px center', paddingRight: '36px' }}>
                  {CONSTRUCTION_STANDARDS.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <button onClick={() => setStep('upload')} className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl border border-slate-200 dark:border-white/10 text-slate-600 dark:text-slate-300 text-sm font-semibold hover:bg-slate-50 dark:hover:bg-white/5 transition">
              <X className="w-4 h-4" />
              Re-upload
            </button>
            <button onClick={handleConfirm} className="flex-1 inline-flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold px-5 py-2.5 rounded-xl transition shadow-sm hover:shadow-md">
              Confirm & Proceed to Cost Estimation
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
