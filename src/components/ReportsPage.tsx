import React, { useState, useEffect } from 'react';
import { FileText, Download, Printer, ChartBar as BarChart3, Building2, DollarSign, TrendingUp, Calendar, MapPin, Loader as Loader2, CircleAlert as AlertCircle, ArrowRight, Table, ChevronDown, ChevronUp, Layers } from 'lucide-react';
import { Project, BOQEstimate } from '../types';
import { fetchBOQHistory } from '../lib/supabase';
import { fmtKSh, fmtKShFull, fmtDate, fmtPct } from '../lib/format';
import { Badge } from './ui/Badge';

interface Props {
  project: Project;
  onGoToEstimation: () => void;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function Section({ title, icon, children }: { title: string; icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-slate-200 dark:border-white/8 bg-white dark:bg-[#0f1629] overflow-hidden">
      <div className="px-5 py-4 border-b border-slate-100 dark:border-white/8 flex items-center gap-2">
        <span className="text-slate-500 dark:text-slate-400">{icon}</span>
        <h2 className="font-semibold text-slate-800 dark:text-slate-100 text-sm">{title}</h2>
      </div>
      <div className="p-5">{children}</div>
    </div>
  );
}

interface SummaryRowProps {
  label: string;
  value: string;
  bold?: boolean;
  highlight?: boolean;
  indent?: boolean;
}

function SummaryRow({ label, value, bold, highlight, indent }: SummaryRowProps) {
  return (
    <div className={`flex items-center justify-between py-2 border-b border-slate-100 dark:border-white/6 last:border-0 ${highlight ? 'bg-blue-50 dark:bg-blue-950/20 -mx-5 px-5 rounded' : ''}`}>
      <span className={`text-sm ${indent ? 'pl-4 text-slate-500 dark:text-slate-400' : ''} ${bold ? 'font-semibold text-slate-800 dark:text-slate-100' : 'text-slate-600 dark:text-slate-300'}`}>
        {label}
      </span>
      <span className={`text-sm tabular-nums ${bold ? 'font-bold text-slate-900 dark:text-white' : 'text-slate-700 dark:text-slate-200'} ${highlight ? 'text-emerald-700 dark:text-blue-300' : ''}`}>
        {value}
      </span>
    </div>
  );
}

// ─── CSV Export ───────────────────────────────────────────────────────────────

function downloadCSV(estimate: BOQEstimate) {
  const rows: string[][] = [
    ['BLCTS BOQ Report'],
    ['Project:', estimate.projectName],
    ['County:', estimate.county],
    ['Building Type:', estimate.buildingType],
    ['Standard:', estimate.constructionStandard],
    ['GFA:', `${estimate.gfa.toLocaleString()} m²`],
    ['Floors:', estimate.floors.toString()],
    ['Generated:', fmtDate(estimate.createdAt)],
    [],
    ['Section', 'Quantity', 'Unit', 'Unit Rate (KSh)', 'Amount (KSh)', 'Source'],
    ...estimate.lineItems.map((li) => [
      li.section,
      li.quantity.toFixed(2),
      li.unit,
      li.unitRate.toFixed(2),
      li.amount.toFixed(2),
      li.source,
    ]),
    [],
    ['COST SUMMARY'],
    ['Construction Cost', fmtKShFull(estimate.constructionCost)],
    ['External Works', fmtKShFull(estimate.externalWorks)],
    ['Preliminaries', fmtKShFull(estimate.preliminaries)],
    ...estimate.professionalFees.map((f) => [f.name, fmtKShFull(f.amount)]),
    ['Statutory Costs', fmtKShFull(estimate.statutoryCosts)],
    ['Subtotal', fmtKShFull(estimate.subtotal)],
    ['Contingency (5%)', fmtKShFull(estimate.contingency)],
    ['VAT (16%)', fmtKShFull(estimate.vatAmount)],
    ['TOTAL PROJECT COST', fmtKShFull(estimate.totalProjectCost)],
    [],
    ['LIFECYCLE SUMMARY'],
    ['Annual OPEX', fmtKShFull(estimate.annualOpex)],
    ['Lifecycle Period', `${estimate.lifecycleYears} years`],
    ['Total Lifecycle Cost', fmtKShFull(estimate.totalLifecycleCost)],
    ['Total Cost of Ownership', fmtKShFull(estimate.tco)],
  ];

  const csv = rows.map((r) => r.map((cell) => `"${cell}"`).join(',')).join('\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `BOQ_${estimate.projectName.replace(/\s+/g, '_')}_${estimate.createdAt.slice(0, 10)}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

// ─── BOQ Table ────────────────────────────────────────────────────────────────

function BOQTable({ estimate, showAll }: { estimate: BOQEstimate; showAll: boolean }) {
  const rows = showAll ? estimate.lineItems : estimate.lineItems.slice(0, 8);

  if (rows.length === 0) {
    return <p className="text-sm text-slate-400 text-center py-6">No BOQ line items in this estimate.</p>;
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[640px]">
        <thead>
          <tr className="border-b border-slate-200 dark:border-white/8 bg-slate-50 dark:bg-[#0f1629]">
            <th className="text-left py-3 px-4 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide">Section</th>
            <th className="text-right py-3 px-4 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide">Qty</th>
            <th className="text-left py-3 px-4 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide">Unit</th>
            <th className="text-right py-3 px-4 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide">Rate (KSh)</th>
            <th className="text-right py-3 px-4 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide">Amount (KSh)</th>
            <th className="text-center py-3 px-4 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide">Source</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100 dark:divide-slate-700/40">
          {rows.map((li, i) => (
            <tr key={i} className="hover:bg-slate-50 dark:hover:bg-white/3 transition-colors">
              <td className="py-2.5 px-4 text-sm text-slate-800 dark:text-slate-100">{li.section}</td>
              <td className="py-2.5 px-4 text-sm text-right tabular-nums text-slate-600 dark:text-slate-300">{li.quantity.toFixed(2)}</td>
              <td className="py-2.5 px-4 text-xs text-slate-500 dark:text-slate-400">{li.unit}</td>
              <td className="py-2.5 px-4 text-sm text-right tabular-nums text-slate-700 dark:text-slate-200">{li.unitRate.toLocaleString()}</td>
              <td className="py-2.5 px-4 text-sm text-right tabular-nums font-medium text-slate-800 dark:text-slate-100">{li.amount.toLocaleString()}</td>
              <td className="py-2.5 px-4 text-center">
                <Badge
                  label={li.source}
                  color={li.source === 'measured' ? 'green' : 'amber'}
                />
              </td>
            </tr>
          ))}
        </tbody>
        {!showAll && estimate.lineItems.length > 8 && (
          <tfoot>
            <tr>
              <td colSpan={6} className="py-2 px-4 text-xs text-slate-400 text-center bg-slate-50 dark:bg-[#0f1629]">
                Showing 8 of {estimate.lineItems.length} line items. Export CSV or print for full list.
              </td>
            </tr>
          </tfoot>
        )}
      </table>
    </div>
  );
}

// ─── Report content (printable) ───────────────────────────────────────────────

function ReportContent({ estimate, project }: { estimate: BOQEstimate; project: Project }) {
  const [showAllBOQ, setShowAllBOQ] = useState(false);

  return (
    <div id="blcts-report-print" className="space-y-6">
      {/* Project Information */}
      <Section title="Project Information" icon={<Building2 className="w-4 h-4" />}>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-x-8 gap-y-3">
          {[
            { label: 'Project Name', value: estimate.projectName },
            { label: 'County', value: estimate.county },
            { label: 'Building Type', value: estimate.buildingType },
            { label: 'Construction Standard', value: estimate.constructionStandard },
            { label: 'Gross Floor Area', value: `${estimate.gfa.toLocaleString()} m²` },
            { label: 'Number of Floors', value: estimate.floors.toString() },
            { label: 'Cost per m²', value: fmtKSh(estimate.costPerSqm) },
            { label: 'Report Generated', value: fmtDate(estimate.createdAt) },
            {
              label: 'AI Confidence',
              value: estimate.aiConfidence != null ? `${(estimate.aiConfidence * 100).toFixed(0)}%` : 'N/A',
            },
          ].map((item) => (
            <div key={item.label}>
              <p className="text-[10px] text-slate-400 uppercase tracking-wide font-semibold mb-0.5">{item.label}</p>
              <p className="text-sm font-medium text-slate-800 dark:text-slate-100">{item.value}</p>
            </div>
          ))}
        </div>
      </Section>

      {/* Construction Cost Summary */}
      <Section title="Construction Cost Summary" icon={<DollarSign className="w-4 h-4" />}>
        <div className="max-w-lg">
          <SummaryRow label="Construction Cost" value={fmtKShFull(estimate.constructionCost)} />
          <SummaryRow label="External Works" value={fmtKShFull(estimate.externalWorks)} indent />
          <SummaryRow label="Preliminaries" value={fmtKShFull(estimate.preliminaries)} indent />
          {estimate.professionalFees.map((f) => (
            <SummaryRow key={f.name} label={`${f.name} (${fmtPct(f.rate)})`} value={fmtKShFull(f.amount)} indent />
          ))}
          <SummaryRow label="Statutory Costs" value={fmtKShFull(estimate.statutoryCosts)} indent />
          <SummaryRow label="Subtotal" value={fmtKShFull(estimate.subtotal)} bold />
          <SummaryRow label="Contingency (5%)" value={fmtKShFull(estimate.contingency)} indent />
          <SummaryRow label="VAT (16%)" value={fmtKShFull(estimate.vatAmount)} indent />
          <div className="mt-3 pt-3 border-t-2 border-blue-300 dark:border-blue-700 flex items-center justify-between">
            <span className="text-base font-bold text-slate-900 dark:text-white">Total Project Cost</span>
            <span className="text-xl font-black text-emerald-700 dark:text-blue-300 tabular-nums">{fmtKShFull(estimate.totalProjectCost)}</span>
          </div>
        </div>
      </Section>

      {/* BOQ Summary Table */}
      <div className="rounded-xl border border-slate-200 dark:border-white/8 bg-white dark:bg-[#0f1629] overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-100 dark:border-white/8 flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-2">
            <Table className="w-4 h-4 text-slate-500 dark:text-slate-400" />
            <h2 className="font-semibold text-slate-800 dark:text-slate-100 text-sm">
              Bill of Quantities (BOQ)
            </h2>
            <span className="text-xs text-slate-400">— {estimate.lineItems.length} line items</span>
          </div>
          <button
            onClick={() => setShowAllBOQ((v) => !v)}
            className="inline-flex items-center gap-1.5 text-xs font-medium text-emerald-600 dark:text-blue-400 hover:underline"
          >
            {showAllBOQ ? (
              <><ChevronUp className="w-3.5 h-3.5" /> Show fewer</>
            ) : (
              <><ChevronDown className="w-3.5 h-3.5" /> Show all {estimate.lineItems.length} rows</>
            )}
          </button>
        </div>
        <BOQTable estimate={estimate} showAll={showAllBOQ} />
      </div>

      {/* Lifecycle Cost Summary */}
      <Section title="Lifecycle Cost Summary" icon={<TrendingUp className="w-4 h-4" />}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="max-w-sm">
            <SummaryRow label="Construction Cost" value={fmtKShFull(estimate.constructionCost)} />
            <SummaryRow label="Annual OPEX" value={fmtKShFull(estimate.annualOpex)} />
            <SummaryRow label="Lifecycle Period" value={`${estimate.lifecycleYears} years`} />
            <SummaryRow label="Total Lifecycle Cost" value={fmtKSh(estimate.totalLifecycleCost)} bold />
            <div className="mt-3 pt-3 border-t-2 border-emerald-300 dark:border-emerald-700 flex items-center justify-between">
              <span className="text-sm font-bold text-slate-900 dark:text-white">Total Cost of Ownership</span>
              <span className="text-lg font-black text-emerald-700 dark:text-emerald-300 tabular-nums">{fmtKSh(estimate.tco)}</span>
            </div>
          </div>

          {/* Yearly projection preview */}
          {estimate.yearlyProjection && estimate.yearlyProjection.length > 0 && (
            <div>
              <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-3">10-Year Projection Preview</p>
              <div className="space-y-1.5">
                {estimate.yearlyProjection.slice(0, 5).map((y) => (
                  <div key={y.year} className="flex items-center gap-3">
                    <span className="text-xs font-mono text-slate-400 w-12">Yr {y.year}</span>
                    <div className="flex-1 h-4 rounded-full bg-slate-100 dark:bg-slate-700 overflow-hidden">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-emerald-400 to-emerald-600"
                        style={{
                          width: `${Math.min(100, (y.cumulative / estimate.tco) * 100)}%`,
                        }}
                      />
                    </div>
                    <span className="text-xs text-slate-600 dark:text-slate-300 tabular-nums w-24 text-right">{fmtKSh(y.cumulative)}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Blueprint observations */}
        {estimate.blueprintObservations && estimate.blueprintObservations.length > 0 && (
          <div className="mt-5 pt-5 border-t border-slate-100 dark:border-white/8">
            <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-2">Blueprint AI Observations</p>
            <ul className="space-y-1">
              {estimate.blueprintObservations.slice(0, 5).map((obs, i) => (
                <li key={i} className="flex items-start gap-2 text-xs text-slate-600 dark:text-slate-300">
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-400 dark:bg-blue-500 mt-1.5 flex-shrink-0" />
                  {obs}
                </li>
              ))}
            </ul>
          </div>
        )}
      </Section>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function ReportsPage({ project, onGoToEstimation }: Props) {
  const [estimates, setEstimates] = useState<BOQEstimate[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    fetchBOQHistory(project.id).then((data) => {
      if (!cancelled) {
        setEstimates(data);
        if (data.length > 0) setSelectedId(data[0].id);
        setLoading(false);
      }
    });
    return () => { cancelled = true; };
  }, [project.id]);

  const currentEstimate = estimates.find((e) => e.id === selectedId) ?? estimates[0] ?? null;

  // ─── Render ─────────────────────────────────────────────────────────────────

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between flex-wrap gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <FileText className="w-5 h-5 text-emerald-600 dark:text-blue-400" />
            <span className="text-xs font-semibold uppercase tracking-widest text-emerald-600 dark:text-blue-400">Reports</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Reports & Downloads</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            <MapPin className="inline w-3.5 h-3.5 mr-1 align-middle" />
            {project.name} · {project.county}
          </p>
        </div>

        {currentEstimate && (
          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={() => downloadCSV(currentEstimate)}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-slate-300 dark:border-white/12 bg-white dark:bg-[#0f1629] text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-white/3 dark:hover:bg-white/6 transition-colors"
            >
              <Download className="w-4 h-4" />
              Export CSV
            </button>
            <button
              onClick={() => window.print()}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-semibold shadow-md shadow-emerald-600/20 transition-colors"
            >
              <Printer className="w-4 h-4" />
              Print Report
            </button>
          </div>
        )}
      </div>

      {/* Loading */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-24 gap-3">
          <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
          <p className="text-sm text-slate-500 dark:text-slate-400">Loading reports…</p>
        </div>
      ) : estimates.length === 0 ? (
        // Empty state
        <div className="rounded-xl border-2 border-dashed border-slate-200 dark:border-white/8 bg-white dark:bg-[#0f1629] px-8 py-16 text-center">
          <div className="w-16 h-16 rounded-2xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center mx-auto mb-4">
            <BarChart3 className="w-8 h-8 text-blue-500" />
          </div>
          <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-100 mb-2">No estimates generated yet</h3>
          <p className="text-sm text-slate-500 dark:text-slate-400 max-w-md mx-auto mb-6">
            Run a cost estimation for <strong>{project.name}</strong> first. The BOQ engine will generate a full breakdown of construction and lifecycle costs.
          </p>
          <button
            onClick={onGoToEstimation}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-semibold shadow-md shadow-emerald-600/20 transition-colors"
          >
            <DollarSign className="w-4 h-4" />
            Go to Cost Estimation
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      ) : (
        <>
          {/* Estimate selector (if multiple) */}
          {estimates.length > 1 && (
            <div className="flex items-center gap-3 flex-wrap">
              <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide">Estimate History:</span>
              <div className="flex gap-2 flex-wrap">
                {estimates.map((est) => (
                  <button
                    key={est.id}
                    onClick={() => setSelectedId(est.id)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                      selectedId === est.id
                        ? 'bg-emerald-600 text-white'
                        : 'bg-white dark:bg-[#0f1629] border border-slate-300 dark:border-white/12 text-slate-600 dark:text-slate-300 hover:border-blue-400 dark:hover:border-emerald-600'
                    }`}
                  >
                    <Calendar className="inline w-3 h-3 mr-1 align-middle" />
                    {fmtDate(est.createdAt)}
                    <span className="ml-1.5 opacity-70">{fmtKSh(est.totalProjectCost)}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Estimate headline */}
          {currentEstimate && (
            <div className="rounded-xl bg-gradient-to-r from-blue-600 to-blue-700 dark:from-blue-700 dark:to-blue-800 p-5 text-white shadow-lg">
              <div className="flex items-start justify-between flex-wrap gap-4">
                <div>
                  <div className="flex items-center gap-2 mb-1 opacity-80">
                    <Layers className="w-4 h-4" />
                    <span className="text-xs font-semibold uppercase tracking-wider">Current Report · {fmtDate(currentEstimate.createdAt)}</span>
                  </div>
                  <h2 className="text-xl font-black">{currentEstimate.projectName}</h2>
                  <p className="text-sm mt-0.5 opacity-80">{currentEstimate.buildingType} · {currentEstimate.constructionStandard} · {currentEstimate.county}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs font-semibold opacity-70 uppercase tracking-wide">Total Project Cost</p>
                  <p className="text-3xl font-black tabular-nums">{fmtKSh(currentEstimate.totalProjectCost)}</p>
                  <p className="text-xs mt-0.5 opacity-70">{currentEstimate.gfa.toLocaleString()} m² · {currentEstimate.floors} floors · {fmtKSh(currentEstimate.costPerSqm)}/m²</p>
                </div>
              </div>
              <div className="mt-4 pt-4 border-t border-white/20 grid grid-cols-2 sm:grid-cols-4 gap-4">
                {[
                  { label: 'Construction Cost', value: fmtKSh(currentEstimate.constructionCost) },
                  { label: 'Annual OPEX', value: fmtKSh(currentEstimate.annualOpex) },
                  { label: 'Lifecycle Cost', value: fmtKSh(currentEstimate.totalLifecycleCost) },
                  { label: 'Total Cost of Ownership', value: fmtKSh(currentEstimate.tco) },
                ].map((item) => (
                  <div key={item.label}>
                    <p className="text-[10px] opacity-70 font-semibold uppercase tracking-wide">{item.label}</p>
                    <p className="text-sm font-bold mt-0.5">{item.value}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Report sections */}
          {currentEstimate && (
            <>
              <ReportContent estimate={currentEstimate} project={project} />

              {/* Download Full Report */}
              <div className="flex items-center justify-center gap-4 py-4">
                <button
                  onClick={() => downloadCSV(currentEstimate)}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl border border-slate-300 dark:border-white/12 bg-white dark:bg-[#0f1629] text-sm font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-white/3 dark:hover:bg-white/6 shadow-sm transition-colors"
                >
                  <Download className="w-4 h-4" />
                  Export Full CSV
                </button>
                <button
                  onClick={() => window.print()}
                  className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-semibold shadow-md shadow-emerald-600/20 transition-colors"
                >
                  <Printer className="w-4 h-4" />
                  Download Full Report (Print)
                </button>
              </div>
            </>
          )}
        </>
      )}
    </div>
  );
}
