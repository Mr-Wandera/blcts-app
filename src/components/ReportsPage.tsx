// src/components/ReportsPage.tsx
import React, { useState, useEffect } from 'react';
import {
  FileText, Download, Printer, BarChart3, Building2, DollarSign,
  TrendingUp, Calendar, MapPin, Loader as Loader2, Table, ChevronDown, ChevronUp, Layers, Shield
} from 'lucide-react';
import type { Project, BOQEstimate } from '../types';
import { fetchBOQHistory } from '../lib/supabase';
import { fmtKSh, fmtKShFull, fmtDate, fmtPct } from '../lib/format';
import { Badge } from './ui/Badge';

interface Props {
  project: Project;
  onGoToEstimation: () => void;
}

function downloadCSV(estimate: BOQEstimate) {
  const rows: string[][] = [
    ['BLCTS PORTFOLIO EXECUTIVE ENGINEERING COST STATEMENT'],
    ['Project Title Token', estimate.projectName],
    ['Zoning County Key', estimate.county],
    ['Structural Classification', estimate.buildingType],
    ['Specification Level Standard', estimate.constructionStandard],
    ['Gross Floor Area (GFA)', `${estimate.gfa.toLocaleString()} m²`],
    ['Storeys Level Count', estimate.floors.toString()],
    ['Calibrated Unit Base Rate', `${estimate.costPerSqm} KSh/m²`],
    ['Compilation Logged Timestamp', fmtDate(estimate.createdAt)],
    [],
    ['STANDARD METHOD OF MEASUREMENT (SMM) ITEM BREAKDOWN'],
    ['Item Description Section', 'Calculated Quantity', 'Unit Metric', 'Unit Rate (KSh)', 'Gross Amount (KSh)'],
    ...estimate.lineItems.map((li) => [
      li.section,
      li.quantity.toFixed(1),
      li.unit,
      li.unitRate.toString(),
      li.amount.toString(),
    ]),
  ];

  const csvContent = rows.map((r) => r.map((cell) => `"${cell.replace(/"/g, '""')}"`).join(',')).join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const anchorElement = document.createElement('a');
  anchorElement.href = url;
  anchorElement.download = `BLCTS_QS_REPORT_${estimate.projectName.replace(/\s+/g, '_')}.csv`;
  anchorElement.click();
  URL.revokeObjectURL(url);
}

export default function ReportsPage({ project, onGoToEstimation }: Props) {
  const [estimates, setEstimates] = useState<BOQEstimate[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    setLoading(true);
    fetchBOQHistory(project.id)
      .then((rows) => {
        if (active) setEstimates(rows);
      })
      .catch(() => {
        if (active) setEstimates([]);
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [project.id]);

  function handlePrint() {
    window.print();
  }

  function handleExport(estimate: BOQEstimate) {
    downloadCSV(estimate);
  }

  const latest = estimates[0];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Project Reports</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Historical BOQ estimates and engineering cost statements for {project.name}.
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={handlePrint}
            className="inline-flex items-center gap-2 border border-slate-200 dark:border-white/10 text-slate-600 dark:text-slate-300 text-sm font-semibold px-4 py-2.5 rounded-xl hover:bg-slate-50 dark:hover:bg-white/5 transition"
          >
            <Printer className="w-4 h-4" /> Print
          </button>
          <button
            onClick={onGoToEstimation}
            className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold px-4 py-2.5 rounded-xl transition shadow-sm"
          >
            <FileText className="w-4 h-4" /> New Estimate
          </button>
        </div>
      </div>

      {/* Report header */}
      <div className="rounded-2xl bg-gradient-to-br from-emerald-600 to-emerald-800 p-6 sm:p-8 text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.08)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.08)_1px,transparent_1px)] bg-[size:32px_32px]" />
        <div className="relative">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center">
              <FileText className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-black">{project.name}</h2>
              <p className="text-sm text-emerald-100">
                BLCTS Project Report — Generated {new Date().toLocaleDateString()}
              </p>
            </div>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6">
            {[
              { label: 'County', value: project.county, icon: MapPin },
              { label: 'Building Type', value: project.buildingType, icon: Building2 },
              {
                label: 'Total Area',
                value: `${(project.floorAreaPerFloor * project.floors).toLocaleString()} m²`,
                icon: Layers,
              },
              { label: 'Standard', value: project.constructionStandard, icon: TrendingUp },
            ].map((s) => (
              <div key={s.label} className="bg-white/10 rounded-xl p-3">
                <div className="flex items-center gap-1.5 mb-1">
                  <s.icon className="w-3.5 h-3.5 text-emerald-200" />
                  <span className="text-xs text-emerald-100">{s.label}</span>
                </div>
                <p className="text-sm font-bold">{s.value}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Latest summary */}
      {loading ? (
        <div className="rounded-2xl border border-slate-200 dark:border-white/8 bg-white dark:bg-[#0f1629] p-8 text-center">
          <Loader2 className="w-6 h-6 animate-spin text-emerald-600 mx-auto mb-3" />
          <p className="text-sm text-slate-500">Loading historical estimates...</p>
        </div>
      ) : latest ? (
        <div className="rounded-2xl border border-slate-200 dark:border-white/8 bg-white dark:bg-[#0f1629] overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-100 dark:border-white/8 flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-50 dark:bg-emerald-950/30 flex items-center justify-center">
              <Shield className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            </div>
            <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100">
              Latest Estimate — {fmtDate(latest.createdAt)}
            </h3>
          </div>
          <div className="p-5 grid grid-cols-2 sm:grid-cols-4 gap-4">
            {[
              { label: 'GFA', value: `${latest.gfa.toLocaleString()} m²`, icon: Layers },
              { label: 'Cost / m²', value: fmtKSh(latest.costPerSqm), icon: DollarSign },
              { label: 'Total CAPEX', value: fmtKSh(latest.totalProjectCost), icon: Building2 },
              { label: '30-Year TCO', value: fmtKSh(latest.tco), icon: TrendingUp },
            ].map((s) => (
              <div key={s.label} className="bg-slate-50 dark:bg-white/5 rounded-xl p-3">
                <div className="flex items-center gap-1.5 mb-1">
                  <s.icon className="w-3.5 h-3.5 text-emerald-500" />
                  <span className="text-xs text-slate-500">{s.label}</span>
                </div>
                <p className="text-sm font-bold text-slate-800 dark:text-white">{s.value}</p>
              </div>
            ))}
          </div>
          <div className="px-5 pb-5">
            <button
              onClick={() => handleExport(latest)}
              className="inline-flex items-center gap-2 text-sm font-semibold text-emerald-600 dark:text-emerald-400 hover:underline"
            >
              <Download className="w-4 h-4" /> Export Latest as CSV
            </button>
          </div>
        </div>
      ) : (
        <div className="rounded-2xl border border-dashed border-slate-300 dark:border-white/10 p-8 text-center">
          <p className="text-sm text-slate-500 dark:text-slate-400 mb-3">
            No estimates have been generated for this project yet.
          </p>
          <button
            onClick={onGoToEstimation}
            className="inline-flex items-center gap-2 text-sm font-semibold text-emerald-600 dark:text-emerald-400 hover:underline"
          >
            Go to Cost Estimation
          </button>
        </div>
      )}

      {/* Full history table */}
      {estimates.length > 0 && (
        <div className="rounded-2xl border border-slate-200 dark:border-white/8 bg-white dark:bg-[#0f1629] overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-100 dark:border-white/8 flex items-center gap-2">
            <Table className="w-4 h-4 text-slate-500" />
            <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100">
              Estimate History ({estimates.length})
            </h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 dark:bg-white/3">
                <tr>
                  <th className="text-left px-5 py-3 text-xs font-bold text-slate-500 uppercase">Date</th>
                  <th className="text-left px-3 py-3 text-xs font-bold text-slate-500 uppercase">Standard</th>
                  <th className="text-right px-3 py-3 text-xs font-bold text-slate-500 uppercase">GFA</th>
                  <th className="text-right px-3 py-3 text-xs font-bold text-slate-500 uppercase">CAPEX</th>
                  <th className="text-right px-3 py-3 text-xs font-bold text-slate-500 uppercase">TCO</th>
                  <th className="text-right px-5 py-3 text-xs font-bold text-slate-500 uppercase">Export</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-white/6">
                {estimates.map((est) => (
                  <React.Fragment key={est.id}>
                    <tr className="hover:bg-slate-50 dark:hover:bg-white/3 transition">
                      <td className="px-5 py-2.5 text-slate-700 dark:text-slate-300">{fmtDate(est.createdAt)}</td>
                      <td className="px-3 py-2.5"><Badge label={est.constructionStandard} color="purple" /></td>
                      <td className="px-3 py-2.5 text-right tabular-nums text-slate-600 dark:text-slate-400">{est.gfa.toLocaleString()}</td>
                      <td className="px-3 py-2.5 text-right tabular-nums font-semibold text-slate-800 dark:text-slate-100">{fmtKSh(est.totalProjectCost)}</td>
                      <td className="px-3 py-2.5 text-right tabular-nums text-emerald-600 dark:text-emerald-400 font-bold">{fmtKSh(est.tco)}</td>
                      <td className="px-5 py-2.5 text-right">
                        <button
                          onClick={() => setExpandedId(expandedId === est.id ? null : est.id)}
                          className="inline-flex items-center gap-1 text-xs font-semibold text-slate-500 hover:text-emerald-600"
                        >
                          {expandedId === est.id ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                          Details
                        </button>
                      </td>
                    </tr>
                    {expandedId === est.id && (
                      <tr className="bg-slate-50/50 dark:bg-white/3">
                        <td colSpan={6} className="px-5 py-4">
                          <div className="space-y-2">
                            {est.lineItems.map((li, i) => (
                              <div key={i} className="flex items-center justify-between text-xs">
                                <span className="text-slate-600 dark:text-slate-400">{li.section}</span>
                                <span className="font-mono text-slate-700 dark:text-slate-300">
                                  {li.quantity} {li.unit} × {fmtKShFull(li.unitRate)} = {fmtKShFull(li.amount)}
                                </span>
                              </div>
                            ))}
                            <div className="pt-2 border-t border-slate-200 dark:border-white/10">
                              <button
                                onClick={() => handleExport(est)}
                                className="inline-flex items-center gap-2 text-xs font-semibold text-emerald-600 hover:underline"
                              >
                                <Download className="w-3.5 h-3.5" /> Export this estimate as CSV
                              </button>
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Footer */}
      <div className="text-center text-xs text-slate-400 py-4 border-t border-slate-200 dark:border-white/8">
        <p>BLCTS — Building Lifecycle Cost Tracking System v2.0.0</p>
        <p className="mt-1">Generated on {new Date().toLocaleString()}</p>
      </div>
    </div>
  );
}
