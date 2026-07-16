import { useState } from 'react';
import type { Project } from '../types';
import { ArrowLeft, FileText, Download, Building2, Layers, MapPin, DollarSign, TrendingUp, Calendar, CircleCheck as CheckCircle2, Printer } from 'lucide-react';
import { useToast } from './ui/Toast';

interface Props {
  project: Project;
  onGoToEstimation: () => void;
}

function formatKsh(n: number): string {
  return 'KSh ' + Math.round(n).toLocaleString('en-KE');
}

export default function ReportsPage({ project, onGoToEstimation }: Props) {
  const { show } = useToast();
  const hasAnalysis = !!project.blueprintAnalysis;
  const totalArea = project.floorAreaPerFloor * project.floors;

  const reportSections = [
    { icon: Building2, title: 'Project Overview', items: [
      { label: 'Project Name', value: project.name },
      { label: 'Location', value: project.location || 'N/A' },
      { label: 'County', value: project.county },
      { label: 'Building Type', value: project.buildingType },
      { label: 'Construction Standard', value: project.constructionStandard },
      { label: 'Created', value: new Date(project.createdAt).toLocaleDateString() },
    ]},
    { icon: Layers, title: 'Building Parameters', items: [
      { label: 'Floor Area per Floor', value: `${project.floorAreaPerFloor.toLocaleString()} m²` },
      { label: 'Number of Floors', value: String(project.floors) },
      { label: 'Total Floor Area', value: `${totalArea.toLocaleString()} m²` },
    ]},
  ];

  if (project.blueprintAnalysis) {
    reportSections.push({
      icon: CheckCircle2,
      title: 'AI Blueprint Analysis',
      items: [
        { label: 'AI Confidence', value: `${project.blueprintAnalysis.confidence}%` },
        { label: 'Detected Rooms', value: String(project.blueprintAnalysis.detectedRooms.length) },
        { label: 'Analysis Notes', value: project.blueprintAnalysis.notes },
      ],
    } as typeof reportSections[0]);
  }

  function handlePrint() {
    window.print();
    show('Report sent to print dialog', 'success');
  }

  function handleExport() {
    const data = {
      project,
      generatedAt: new Date().toISOString(),
      reportType: 'BLCTS Project Report',
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `BLCTS-Report-${project.name.replace(/\s+/g, '-')}.json`;
    a.click();
    URL.revokeObjectURL(url);
    show('Report exported successfully', 'success');
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-3">
          <button onClick={onGoToEstimation} className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition">
            <ArrowLeft className="w-4 h-4" /> Back to Estimation
          </button>
        </div>
        <div className="flex gap-2">
          <button onClick={handlePrint} className="inline-flex items-center gap-2 border border-slate-200 dark:border-white/10 text-slate-600 dark:text-slate-300 text-sm font-semibold px-4 py-2.5 rounded-xl hover:bg-slate-50 dark:hover:bg-white/5 transition">
            <Printer className="w-4 h-4" /> Print
          </button>
          <button onClick={handleExport} className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold px-4 py-2.5 rounded-xl transition shadow-sm">
            <Download className="w-4 h-4" /> Export Report
          </button>
        </div>
      </div>

      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Project Report</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Comprehensive cost and lifecycle report for {project.name}.</p>
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
              <p className="text-sm text-emerald-100">BLCTS Project Report — Generated {new Date().toLocaleDateString()}</p>
            </div>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6">
            {[
              { label: 'County', value: project.county, icon: MapPin },
              { label: 'Building Type', value: project.buildingType, icon: Building2 },
              { label: 'Total Area', value: `${totalArea.toLocaleString()} m²`, icon: Layers },
              { label: 'Standard', value: project.constructionStandard, icon: TrendingUp },
            ].map(s => (
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

      {/* Report sections */}
      {reportSections.map(section => (
        <div key={section.title} className="rounded-2xl border border-slate-200 dark:border-white/8 bg-white dark:bg-[#0f1629] overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-100 dark:border-white/8 flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-50 dark:bg-emerald-950/30 flex items-center justify-center">
              <section.icon className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            </div>
            <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100">{section.title}</h3>
          </div>
          <div className="p-5 space-y-3">
            {section.items.map(item => (
              <div key={item.label} className="flex gap-4 text-sm">
                <span className="w-40 flex-shrink-0 text-slate-500 dark:text-slate-400 font-medium">{item.label}</span>
                <span className="text-slate-800 dark:text-slate-100 flex-1">{item.value}</span>
              </div>
            ))}
          </div>
        </div>
      ))}

      {/* Detected rooms */}
      {project.blueprintAnalysis && (
        <div className="rounded-2xl border border-slate-200 dark:border-white/8 bg-white dark:bg-[#0f1629] overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-100 dark:border-white/8">
            <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100">Detected Rooms from Blueprint</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 dark:bg-white/3">
                <tr>
                  <th className="text-left px-5 py-3 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">Room</th>
                  <th className="text-right px-3 py-3 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">Count</th>
                  <th className="text-right px-3 py-3 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">Area (m²)</th>
                  <th className="text-right px-5 py-3 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">Total (m²)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-white/6">
                {project.blueprintAnalysis.detectedRooms.map((r, i) => (
                  <tr key={i} className="hover:bg-slate-50 dark:hover:bg-white/3 transition">
                    <td className="px-5 py-2.5 text-slate-700 dark:text-slate-300">{r.label}</td>
                    <td className="px-3 py-2.5 text-right tabular-nums text-slate-600 dark:text-slate-400">{r.count}</td>
                    <td className="px-3 py-2.5 text-right tabular-nums text-slate-600 dark:text-slate-400">{r.areaSqm}</td>
                    <td className="px-5 py-2.5 text-right tabular-nums font-semibold text-slate-800 dark:text-slate-100">{(r.areaSqm * r.count).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {!hasAnalysis && (
        <div className="rounded-2xl border border-dashed border-slate-300 dark:border-white/10 p-8 text-center">
          <p className="text-sm text-slate-500 dark:text-slate-400 mb-3">No blueprint analysis data available for this report.</p>
          <button onClick={onGoToEstimation} className="inline-flex items-center gap-2 text-sm font-semibold text-emerald-600 dark:text-emerald-400 hover:underline">
            Go to Cost Estimation <ArrowLeft className="w-3.5 h-3.5 rotate-180" />
          </button>
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
