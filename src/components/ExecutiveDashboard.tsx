import React from "react";
import {
  TrendingUp,
  Coins,
  Activity,
  AlertTriangle,
  Search,
  ArrowUpRight,
  Sparkles,
  Phone,
  Check,
  Building2
} from "lucide-react";
import { Property, MaintenanceTask, AIInsight } from "../types";
import LiveTelemetryStream from "./LiveTelemetryStream";

interface ExecutiveDashboardProps {
  selectedProperty: Property;
  selectedPropertyId: string;
  calculations: {
    capex: number;
    opex: number;
    tco: number;
    entryCount: number;
  };
  svgChartPaths: {
    capexActualPath: string;
    capexBudgetPath: string;
    opexActualPath: string;
    opexBudgetPath: string;
    capexFillPath: string;
    opexFillPath: string;
    coords: Array<{
      x: number;
      yCapexAct: number;
      yCapexBud: number;
      yOpexAct: number;
      yOpexBud: number;
      month: string;
      raw: any;
    }>;
  };
  activeInsights: AIInsight[];
  filteredTasks: MaintenanceTask[];
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  phaseFilter: string;
  setPhaseFilter: (filter: string) => void;
  handleOpenMpesa: (task: MaintenanceTask) => void;
  setActiveTab: (tab: "dashboard" | "ledger" | "vendors") => void;
  triggerToast?: (msg: string, type?: "success" | "info" | "warning") => void;
}

export default function ExecutiveDashboard({
  selectedProperty,
  selectedPropertyId,
  calculations,
  svgChartPaths,
  activeInsights,
  filteredTasks,
  searchQuery,
  setSearchQuery,
  phaseFilter,
  setPhaseFilter,
  handleOpenMpesa,
  setActiveTab,
  triggerToast
}: ExecutiveDashboardProps) {
  const [horizon, setHorizon] = React.useState<1 | 10 | 20 | 30>(1);

  const baseAnnualOpex = selectedPropertyId === "prop-1" ? 3600000 : selectedPropertyId === "prop-2" ? 14400000 : 6000000;
  const activeOpexPart = calculations.opex;
  const capExTotal = calculations.capex;

  const annualProjectionInstance = baseAnnualOpex + activeOpexPart;
  const displayedOpex = horizon === 1 ? activeOpexPart : annualProjectionInstance * horizon;
  const displayedTco = capExTotal + displayedOpex;

  return (
    <div className="space-y-6">
      {/* KPI METRICS ROW */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Combined TCO (Capex + Opex) */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200/60 dark:border-slate-800 shadow-[0_2px_8px_-3px_rgba(0,0,0,0.03),0_1px_3px_-1px_rgba(0,0,0,0.02)] relative overflow-hidden group hover:shadow-md transition-all duration-300 flex flex-col justify-between min-h-[290px]">
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-teal-500 via-emerald-500 to-sky-500"></div>
          <div>
            <div className="flex justify-between items-start">
              <div className="space-y-1">
                <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest block font-display">
                  Total Cost of Ownership (TCO)
                </span>
                <span className="text-xl sm:text-2xl font-black tracking-tight text-slate-900 dark:text-white block font-mono">
                  KSh {displayedTco.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                </span>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 group-hover:bg-slate-100 dark:group-hover:bg-slate-755 transition-colors">
                <TrendingUp className="w-5 h-5" />
              </div>
            </div>

            {/* Operational Horizon Switch Toggle */}
            <div className="mt-4">
              <span className="text-[9px] uppercase font-bold text-slate-400 dark:text-slate-500 tracking-wider block mb-1">
                Asset Horizon Switch Toggle
              </span>
              <div className="flex bg-slate-100 dark:bg-slate-955 p-0.5 rounded-lg text-[9.5px] font-bold">
                {[1, 10, 20, 30].map((h) => (
                  <button
                    key={h}
                    onClick={() => setHorizon(h as any)}
                    className={`flex-1 py-1 rounded-md transition-all cursor-pointer text-center ${
                      horizon === h
                        ? "bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm"
                        : "text-slate-450 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300"
                    }`}
                  >
                    {h === 1 ? "Actual" : `${h}Y Proj`}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="mt-4 text-[11px] text-slate-500 dark:text-slate-405 flex flex-col gap-1 border-t border-slate-100 dark:border-slate-800 pt-3">
            <div className="flex flex-col gap-0.5">
              <span className="font-bold text-slate-800 dark:text-slate-200">
                {horizon === 1 ? "Lifecycle Actual Sum" : `${horizon}-Year Est. Horizon`}
              </span>
              <span className="text-[10.5px] leading-snug">
                {horizon === 1 
                  ? "CAPEX + active cumulative OPEX" 
                  : `CAPEX + ${horizon} Years OPEX @ KSh ${annualProjectionInstance.toLocaleString(undefined, { maximumFractionDigits: 0 })}/yr`}
              </span>
            </div>
          </div>
        </div>

        {/* Card 2: CAPEX Spend */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200/60 dark:border-slate-800 shadow-[0_2px_8px_-3px_rgba(0,0,0,0.03),0_1px_3px_-1px_rgba(0,0,0,0.02)] relative overflow-hidden group hover:shadow-md transition-all duration-300 flex flex-col justify-between min-h-[290px]">
          <div>
            <div className="flex justify-between items-start">
              <div className="space-y-1">
                <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest block font-display">
                  Construction Spend (CAPEX)
                </span>
                <span className="text-xl sm:text-2xl font-black tracking-tight text-slate-900 dark:text-white block font-mono">
                  KSh {calculations.capex.toLocaleString()}
                </span>
              </div>
              <div className="p-2.5 rounded-xl bg-teal-50 dark:bg-teal-955/25 text-teal-600 dark:text-teal-400 group-hover:bg-teal-100 transition-colors">
                <Coins className="w-5 h-5" />
              </div>
            </div>

            {/* Visual Cost Disaggregation: CAPEX Deck */}
            <div className="mt-3.5 space-y-2 border-t border-slate-150/50 dark:border-slate-800/80 pt-2.5">
              <div className="text-[9px] uppercase font-bold text-slate-400 dark:text-slate-500 tracking-wider">
                CAPEX Elements Breakdown
              </div>
              <div className="space-y-1.5">
                <div className="flex justify-between items-center text-[10px]">
                  <span className="text-slate-500 dark:text-slate-400">Materials & Foundations (60%)</span>
                  <span className="font-mono text-slate-700 dark:text-slate-300 font-bold">KSh {(calculations.capex * 0.60).toLocaleString(undefined, {maximumFractionDigits: 0})}</span>
                </div>
                <div className="w-full bg-slate-100 dark:bg-slate-950 h-1 rounded-full overflow-hidden">
                  <div className="bg-teal-500 h-full rounded-full" style={{ width: "60%" }}></div>
                </div>
              </div>
              <div className="space-y-1.5">
                <div className="flex justify-between items-center text-[10px]">
                  <span className="text-slate-500 dark:text-slate-400">Structural Labor (25%)</span>
                  <span className="font-mono text-slate-700 dark:text-slate-300 font-bold">KSh {(calculations.capex * 0.25).toLocaleString(undefined, {maximumFractionDigits: 0})}</span>
                </div>
                <div className="w-full bg-slate-100 dark:bg-slate-955 h-1 rounded-full overflow-hidden">
                  <div className="bg-teal-600 h-full rounded-full" style={{ width: "25%" }}></div>
                </div>
              </div>
              <div className="space-y-1.5">
                <div className="flex justify-between items-center text-[10px]">
                  <span className="text-slate-500 dark:text-slate-400">Consulting & Legal (15%)</span>
                  <span className="font-mono text-slate-700 dark:text-slate-300 font-bold">KSh {(calculations.capex * 0.15).toLocaleString(undefined, {maximumFractionDigits: 0})}</span>
                </div>
                <div className="w-full bg-slate-100 dark:bg-slate-955 h-1 rounded-full overflow-hidden">
                  <div className="bg-teal-700 h-full rounded-full" style={{ width: "15%" }}></div>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-4 text-[11px] text-emerald-600 dark:text-emerald-400 flex items-center justify-between border-t border-slate-100 dark:border-slate-800 pt-3 font-medium">
            {selectedPropertyId === "prop-2" ? (
              <span className="text-amber-600 dark:text-amber-400 flex items-center gap-1">
                <AlertTriangle className="w-3.5 h-3.5 text-amber-500 shrink-0" /> Low construction spec
              </span>
            ) : (
              <span className="text-emerald-700 dark:text-emerald-400 font-semibold flex items-center gap-1">✓ Premium spec</span>
            )}
            <span className="text-slate-500 dark:text-slate-400 font-normal">
              Est: {selectedPropertyId === "prop-1" ? "145M" : selectedPropertyId === "prop-2" ? "95M" : "210M"}
            </span>
          </div>
        </div>

        {/* Card 3: OPEX Spend */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200/60 dark:border-slate-800 shadow-[0_2px_8px_-3px_rgba(0,0,0,0.03),0_1px_3px_-1px_rgba(0,0,0,0.02)] relative overflow-hidden group hover:shadow-md transition-all duration-300 flex flex-col justify-between min-h-[290px]">
          <div>
            <div className="flex justify-between items-start">
              <div className="space-y-1">
                <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest block font-display">
                  Operational Spend (OPEX)
                </span>
                <span className="text-xl sm:text-2xl font-black tracking-tight text-slate-900 dark:text-white block font-mono">
                  KSh {calculations.opex.toLocaleString()}
                </span>
              </div>
              <div className="p-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-955/25 text-emerald-600 dark:text-emerald-400 group-hover:bg-emerald-100 transition-colors">
                <Activity className="w-5 h-5" />
              </div>
            </div>

            {/* Visual Cost Disaggregation: OPEX Deck */}
            <div className="mt-3.5 space-y-2 border-t border-slate-150/50 dark:border-slate-800/80 pt-2.5">
              <div className="text-[9px] uppercase font-bold text-slate-400 dark:text-slate-500 tracking-wider">
                OPEX Elements Breakdown
              </div>
              <div className="space-y-1.5">
                <div className="flex justify-between items-center text-[10px]">
                  <span className="text-slate-500 dark:text-slate-400">Power Grid & HVAC (50%)</span>
                  <span className="font-mono text-slate-700 dark:text-slate-300 font-bold">KSh {(calculations.opex * 0.50).toLocaleString(undefined, {maximumFractionDigits: 0})}</span>
                </div>
                <div className="w-full bg-slate-100 dark:bg-slate-950 h-1 rounded-full overflow-hidden">
                  <div className="bg-rose-500 h-full rounded-full" style={{ width: "50%" }}></div>
                </div>
              </div>
              <div className="space-y-1.5">
                <div className="flex justify-between items-center text-[10px]">
                  <span className="text-slate-500 dark:text-slate-400">Water Supply & Pumps (35%)</span>
                  <span className="font-mono text-slate-700 dark:text-slate-300 font-bold">KSh {(calculations.opex * 0.35).toLocaleString(undefined, {maximumFractionDigits: 0})}</span>
                </div>
                <div className="w-full bg-slate-100 dark:bg-slate-955 h-1 rounded-full overflow-hidden">
                  <div className="bg-rose-600 h-full rounded-full" style={{ width: "35%" }}></div>
                </div>
              </div>
              <div className="space-y-1.5">
                <div className="flex justify-between items-center text-[10px]">
                  <span className="text-slate-500 dark:text-slate-400">Property Taxes (15%)</span>
                  <span className="font-mono text-slate-700 dark:text-slate-300 font-bold">KSh {(calculations.opex * 0.15).toLocaleString(undefined, {maximumFractionDigits: 0})}</span>
                </div>
                <div className="w-full bg-slate-100 dark:bg-slate-955 h-1 rounded-full overflow-hidden">
                  <div className="bg-rose-700 h-full rounded-full" style={{ width: "15%" }}></div>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-4 text-[11px] flex items-center justify-between border-t border-slate-100 dark:border-slate-800 pt-3">
            <span className={`font-bold ${
              selectedPropertyId === "prop-2" ? "text-rose-600 dark:text-rose-400 font-semibold" : "text-emerald-700 dark:text-emerald-400"
            }`}>
              {selectedPropertyId === "prop-2" ? "KSh 2M Monthly Avg" : "Stable rolling billing"}
            </span>
            <span className="text-slate-500 dark:text-slate-400">Utilities / Taxes</span>
          </div>
        </div>

        {/* Card 4: Asset Health Grade */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200/60 dark:border-slate-800 shadow-[0_2px_8px_-3px_rgba(0,0,0,0.03),0_1px_3px_-1px_rgba(0,0,0,0.02)] relative overflow-hidden group hover:shadow-md transition-all duration-300 flex flex-col justify-between min-h-[290px]">
          <div>
            <div className="flex justify-between items-start">
              <div className="space-y-1">
                <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest block font-display">
                  Asset Health Grade
                </span>
                <div className="flex items-center gap-2 mt-1">
                  <span className={`text-xl font-black font-mono rounded-lg px-2.5 py-0.5 ${
                    selectedProperty.healthGrade === "A" 
                      ? "bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-900/50" 
                      : selectedProperty.healthGrade === "B" 
                      ? "bg-teal-50 dark:bg-teal-950/30 text-teal-700 dark:text-teal-400 border border-teal-100 dark:border-teal-900/50" 
                      : "bg-amber-50 dark:bg-amber-950/30 text-amber-700 dark:text-amber-400 border border-amber-100 dark:border-amber-900/50"
                  }`}>
                    Grade {selectedProperty.healthGrade}
                  </span>
                  <span className="text-[11px] font-semibold text-slate-700 dark:text-slate-300 block max-w-[90px] truncate">
                    {selectedProperty.healthStatusText}
                  </span>
                </div>
              </div>
              <div className="p-2.5 rounded-xl bg-amber-50 dark:bg-amber-950/25 text-amber-600 dark:text-amber-400 group-hover:bg-amber-100 transition-colors">
                <AlertTriangle className="w-5 h-5" />
              </div>
            </div>

            {/* Asset Health Indication of Sustainability relative to Construction quality choices */}
            <div className="mt-3.5 space-y-1.5 border-t border-slate-150/50 dark:border-slate-800/80 pt-2.5">
              <div className="text-[9px] uppercase font-bold text-slate-400 dark:text-slate-500 tracking-wider">
                Lifecycle Durability Ratio
              </div>
              <p className="text-[10.5px] text-slate-500 dark:text-slate-400 leading-relaxed font-light">
                {selectedProperty.healthGrade === "A" ? (
                  <span className="text-emerald-600 dark:text-emerald-400 font-semibold leading-tight block">
                    ✓ High waterproofing & solar specs fully protect building from sudden capital depletion.
                  </span>
                ) : selectedProperty.healthGrade === "B" ? (
                  <span className="text-teal-600 dark:text-teal-400 font-semibold leading-tight block">
                    ✓ Predictable elevator & smart grid lifecycle ratios. Healthy investment structure.
                  </span>
                ) : (
                  <span className="text-rose-600 dark:text-rose-450 font-bold animate-pulse leading-snug block">
                    ⚠️ Maintenance is UNSUSTAINABLE. Cheap roofing & standard HVAC choice caused extreme reactive overhead pressure.
                  </span>
                )}
              </p>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800">
            <div className="w-full bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-500 ${
                  selectedProperty.healthGrade === "A" 
                    ? "bg-emerald-500 w-[95%]" 
                    : selectedProperty.healthGrade === "B" 
                    ? "bg-teal-500 w-[78%]" 
                    : "bg-amber-500 w-[44%]"
                }`}
              />
            </div>
            <div className="flex justify-between text-[9px] text-slate-450 mt-1">
              <span className="text-slate-400">Factor Efficiency:</span>
              <span className="font-bold text-slate-700 dark:text-slate-350">
                {selectedProperty.healthGrade === "A" ? "95%" : selectedProperty.healthGrade === "B" ? "78%" : "44%"}
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* LIVE TELEMETRY STREAM PANEL */}
      <section className="animate-fade-in">
        <LiveTelemetryStream 
          selectedPropertyId={selectedPropertyId}
          propertyName={selectedProperty.name}
          onAlertTriggered={(title, desc, status) => {
            if (triggerToast) {
              triggerToast(`${title}: ${desc}`, status === "alert" ? "warning" : "info");
            }
          }}
        />
      </section>

      {/* 2-COLUMN MAIN ANALYTICS WORKSPACE */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* LEFT COLUMN: Lifecycle Financial Trends Chart */}
        <div className="lg:col-span-8 bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200/60 dark:border-slate-800 shadow-[0_2px_8px_-3px_rgba(0,0,0,0.03),0_1px_3px_-1px_rgba(0,0,0,0.02)] flex flex-col justify-between">
          <div>
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-4 mb-4">
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white tracking-wide font-display">
                  Lifecycle Cost Profile Comparison
                </h3>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-tight">
                  Budgeted Targets vs. Actual Cumulative Spend (KSh) over last 6 months
                </p>
              </div>
              {/* Legend */}
              <div className="flex flex-wrap items-center gap-3.5 text-[10px] font-medium text-slate-505 dark:text-slate-400">
                <div className="flex items-center gap-1.5">
                  <span className="w-3 h-1.5 bg-emerald-500 rounded"></span>
                  <span className="text-slate-700 dark:text-slate-300 font-bold">Capex Actuals</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-3 h-0.5 border-t border-dashed border-slate-450 dark:border-slate-500"></span>
                  <span>Capex Budget</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-3 h-1.5 bg-rose-500 rounded"></span>
                  <span className="text-slate-700 dark:text-slate-300 font-bold">Opex Actuals</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-3 h-0.5 border-t border-dashed border-rose-350 dark:border-rose-500"></span>
                  <span>Opex Target</span>
                </div>
              </div>
            </div>

            {/* Custom SVG Drawing Area */}
            <div className="relative w-full overflow-x-auto bg-[#fafcfd] dark:bg-slate-950/40 border border-slate-100/80 dark:border-slate-800 rounded-xl p-3">
              <svg viewBox="0 0 600 200" className="w-full min-w-[500px] h-[220px]">
                <defs>
                  <linearGradient id="capexGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#10b981" stopOpacity="0.12" />
                    <stop offset="100%" stopColor="#10b981" stopOpacity="0.0" />
                  </linearGradient>
                  <linearGradient id="opexGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#f43f5e" stopOpacity="0.08" />
                    <stop offset="100%" stopColor="#f43f5e" stopOpacity="0.0" />
                  </linearGradient>
                </defs>

                {/* Horizontal Grid lines */}
                <line x1="20" y1="20" x2="580" y2="20" stroke="currentColor" className="text-slate-50/10 dark:text-slate-900/30" strokeWidth="1" />
                <line x1="20" y1="65" x2="580" y2="65" stroke="currentColor" className="text-slate-100 dark:text-slate-800/40" strokeWidth="1" strokeDasharray="2 2" />
                <line x1="20" y1="110" x2="580" y2="110" stroke="currentColor" className="text-slate-100 dark:text-slate-800/40" strokeWidth="1" strokeDasharray="2 2" />
                <line x1="20" y1="155" x2="580" y2="155" stroke="currentColor" className="text-slate-100 dark:text-slate-800/40" strokeWidth="1" strokeDasharray="2 2" />
                <line x1="20" y1="180" x2="580" y2="180" stroke="currentColor" className="text-[#e2e8f0] dark:text-slate-805" strokeWidth="1" />

                {/* Render Filled Gradient Areas */}
                {svgChartPaths.capexFillPath && (
                  <path d={svgChartPaths.capexFillPath} fill="url(#capexGrad)" />
                )}
                {svgChartPaths.opexFillPath && (
                  <path d={svgChartPaths.opexFillPath} fill="url(#opexGrad)" />
                )}

                {/* Render Budget Dashed Lines */}
                {svgChartPaths.capexBudgetPath && (
                  <path d={svgChartPaths.capexBudgetPath} fill="none" stroke="#94a3b8" strokeWidth="1.2" strokeDasharray="3 3" />
                )}
                {svgChartPaths.opexBudgetPath && (
                  <path d={svgChartPaths.opexBudgetPath} fill="none" stroke="#fca5a5" strokeWidth="1.2" strokeDasharray="3 3" />
                )}

                {/* Render Actual Spend Bold Curves */}
                {svgChartPaths.capexActualPath && (
                  <path d={svgChartPaths.capexActualPath} fill="none" stroke="#10b981" strokeWidth="2.5" strokeLinecap="round" />
                )}
                {svgChartPaths.opexActualPath && (
                  <path d={svgChartPaths.opexActualPath} fill="none" stroke="#f43f5e" strokeWidth="2.2" strokeLinecap="round" />
                )}

                {/* Chart Nodes on Actuals */}
                {svgChartPaths.coords && svgChartPaths.coords.map((node, i) => (
                  <g key={i}>
                    {/* CAPEX Actual Node */}
                    <circle cx={node.x} cy={node.yCapexAct} r="3.5" fill="currentColor" className="text-[#ffffff] dark:text-slate-900" stroke="#10b981" strokeWidth="1.5" />
                    {/* OPEX Actual Node */}
                    <circle cx={node.x} cy={node.yOpexAct} r="3.5" fill="currentColor" className="text-[#ffffff] dark:text-slate-900" stroke="#f43f5e" strokeWidth="1.5" />

                    {/* Hover Tooltip Value Texts (Subtle) */}
                    <text x={node.x} y={node.yCapexAct - 9} textAnchor="middle" className="text-[8px] font-mono fill-emerald-800 dark:fill-emerald-400 font-bold">
                      {node.raw.capexActual >= 1000000 ? `${(node.raw.capexActual / 1000000).toFixed(1)}M` : `${(node.raw.capexActual / 1000).toFixed(0)}k`}
                    </text>
                    <text x={node.x} y={node.yOpexAct + 12} textAnchor="middle" className="text-[8px] font-mono fill-rose-700 dark:fill-rose-400 font-bold">
                      {node.raw.opexActual >= 1000000 ? `${(node.raw.opexActual / 1000000).toFixed(1)}M` : `${(node.raw.opexActual / 1000).toFixed(0)}k`}
                    </text>

                    {/* X-Axis labels */}
                    <text x={node.x} y="194" textAnchor="middle" className="text-[9px] font-semibold fill-slate-500 dark:fill-slate-400 font-display">
                      {node.month}
                    </text>
                  </g>
                ))}
              </svg>
            </div>

            <div className="mt-4 bg-[#f8fafc] dark:bg-slate-950/70 border border-slate-100 dark:border-slate-800 p-3.5 rounded-xl flex flex-col sm:flex-row justify-between gap-3 text-xs leading-relaxed text-slate-505 dark:text-slate-300">
              <div>
                <span className="font-bold text-slate-900 dark:text-white block mb-0.5">Interpretation & Analysis:</span>
                {selectedPropertyId === "prop-2" ? (
                  <span className="text-slate-650 dark:text-slate-400 font-light">
                    The gap of OPEX spending (rose line) surging far above targets highlights severe structural cost errors. Cheaper HVAC equipment and lack of roof insulation is triggering continuous emergency maintenance invoices.
                  </span>
                ) : (
                  <span className="text-slate-655 dark:text-slate-400 font-light">
                    Waterproofing and solar investments completed during key building months keep OPEX (rose line) safely compressed under targets. Your upfront durability strategy is actively defending cash flow.
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="mt-4 flex items-center justify-between border-t border-slate-100 dark:border-slate-800 pt-3 text-[10px]">
            <span className="text-slate-400">
              Source: Certified Local Developer Ledgers (verified dynamically)
            </span>
            <button
              onClick={() => setActiveTab("ledger")}
              className="font-bold text-teal-600 hover:text-teal-700 dark:text-teal-400 dark:hover:text-teal-300 flex items-center gap-1 transition-colors cursor-pointer"
            >
              <span>View All Ledger Logs</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>
              {/* RIGHT COLUMN: AI-Enhanced Analytics Engine Panel (Dark Themed) */}
        <div className="lg:col-span-4 bg-slate-950 text-slate-100 rounded-2xl p-5 border border-slate-900 shadow-xl flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-slate-900 pb-3 mb-4">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-400 select-none">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-[9px] uppercase font-bold text-slate-500 tracking-wider font-display">
                    Predictive Intelligence
                  </h3>
                  <h4 className="text-xs font-bold text-white tracking-tight">
                    AI Analytics Engine
                  </h4>
                </div>
              </div>
              <span className="text-[8px] bg-slate-900 text-slate-400 font-mono py-0.5 px-2 rounded-full border border-slate-800">
                Daraja Powered
              </span>
            </div>

            {/* Forecast section */}
            <div className="space-y-4">
              <div className="bg-slate-900/60 p-3.5 rounded-xl border border-slate-900/40">
                <div className="flex justify-between items-center text-[10px]">
                  <span className="text-slate-400 font-medium">Q3 Maintenance Forecast</span>
                  <span className="font-mono text-emerald-400 font-bold">94% Confidence</span>
                </div>
                <div className="text-lg font-bold text-white mt-1.5 font-mono">
                  KSh {selectedPropertyId === "prop-1" ? "840,000" : selectedPropertyId === "prop-2" ? "6,200,000" : "1,150,000"}
                </div>
                <p className="text-[10px] text-slate-550 mt-1 leading-relaxed font-light">
                  {selectedPropertyId === "prop-2" 
                    ? "Extremely high of KSh 5.8M required due to catastrophic low-spec roofing wear." 
                    : "Optimized maintenance scope focused entirely on water harvesting calibration sweeps."}
                </p>
              </div>

              {/* Dynamic Anomaly Alert Card */}
              {selectedPropertyId === "prop-2" && (
                <div className="bg-rose-950/20 border border-rose-500/45 text-rose-100 p-3.5 rounded-xl text-xs space-y-1">
                  <div className="flex items-center gap-1.5 font-bold text-rose-400 text-[9.5px] uppercase tracking-widest font-display">
                    <AlertTriangle className="w-3.5 h-3.5" />
                    <span>⚠️ Anomaly Detected</span>
                  </div>
                  <p className="text-[10px] text-slate-350 leading-relaxed font-light">
                    Thika Road Block B water consumption cost has spiked by 24% over its 6-month moving average. Potential subterranean valve leakage.
                  </p>
                </div>
              )}
              {selectedPropertyId === "prop-3" && (
                <div className="bg-amber-950/20 border border-amber-500/45 text-amber-100 p-3.5 rounded-xl text-xs space-y-1">
                  <div className="flex items-center gap-1.5 font-bold text-amber-400 text-[9.5px] uppercase tracking-widest font-display">
                    <AlertTriangle className="w-3.5 h-3.5 animate-pulse" />
                    <span>⚠️ Anomaly Detected</span>
                  </div>
                  <p className="text-[10px] text-slate-350 leading-relaxed font-light">
                    Westlands Lift B vibration metrics exceeded normal limits. Commencing automatic sensor diagnostics request.
                  </p>
                </div>
              )}

              {/* Material Longevity Threshold Gauges */}
              <div className="space-y-3 pt-2">
                <span className="text-[9px] uppercase font-bold text-slate-500 tracking-wider block font-display">
                  Material Longevity Counters
                </span>
                <div className="space-y-2">
                  {selectedPropertyId === "prop-1" ? (
                    <>
                      <div className="space-y-1">
                        <div className="flex justify-between text-[10px] text-slate-400">
                          <span>Concrete Waterproofing additive</span>
                          <span className="font-mono text-emerald-400 font-bold">98% Remaining</span>
                        </div>
                        <div className="h-1 bg-slate-900 rounded-full overflow-hidden">
                          <div className="h-full bg-emerald-500 rounded-full" style={{ width: "98%" }}></div>
                        </div>
                      </div>
                      <div className="space-y-1">
                        <div className="flex justify-between text-[10px] text-slate-400">
                          <span>Double Glazed Solar windows</span>
                          <span className="font-mono text-emerald-400 font-bold">92% Remaining</span>
                        </div>
                        <div className="h-1 bg-slate-900 rounded-full overflow-hidden">
                          <div className="h-full bg-emerald-500 rounded-full" style={{ width: "92%" }}></div>
                        </div>
                      </div>
                      <div className="space-y-1">
                        <div className="flex justify-between text-[10px] text-slate-400">
                          <span>Solar battery inverters grid</span>
                          <span className="font-mono text-amber-405 font-bold">85% Remaining</span>
                        </div>
                        <div className="h-1 bg-slate-900 rounded-full overflow-hidden">
                          <div className="h-full bg-amber-500 rounded-full" style={{ width: "85%" }}></div>
                        </div>
                      </div>
                    </>
                  ) : selectedPropertyId === "prop-2" ? (
                    <>
                      <div className="space-y-1 bg-rose-950/15 p-2 rounded-lg border border-rose-950/50">
                        <div className="flex justify-between text-[10px] text-rose-300">
                          <span className="font-semibold text-white">Economy roofing sheets</span>
                          <span className="font-mono text-rose-400 font-bold">28% (Replace Required)</span>
                        </div>
                        <div className="h-1 bg-slate-900 rounded-full overflow-hidden mt-1">
                          <div className="h-full bg-rose-500 rounded-full" style={{ width: "28%" }}></div>
                        </div>
                      </div>
                      <div className="space-y-1">
                        <div className="flex justify-between text-[10px] text-slate-400">
                          <span>Non-VFD HVAC cooling units</span>
                          <span className="font-mono text-amber-500 font-bold">45% Remaining</span>
                        </div>
                        <div className="h-1 bg-slate-900 rounded-full overflow-hidden">
                          <div className="h-full bg-amber-500 rounded-full" style={{ width: "45%" }}></div>
                        </div>
                      </div>
                      <div className="space-y-1">
                        <div className="flex justify-between text-[10px] text-slate-400">
                          <span>DB Breaker installation spec</span>
                          <span className="font-mono text-slate-300 font-bold">62% Remaining</span>
                        </div>
                        <div className="h-1 bg-slate-900 rounded-full overflow-hidden">
                          <div className="h-full bg-[#38bdf8] rounded-full" style={{ width: "62%" }}></div>
                        </div>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="space-y-1">
                        <div className="flex justify-between text-[10px] text-slate-400">
                          <span>Otis Elevator suspension rotors</span>
                          <span className="font-mono text-emerald-400 font-bold">88% Remaining</span>
                        </div>
                        <div className="h-1 bg-slate-900 rounded-full overflow-hidden">
                          <div className="h-full bg-emerald-500 rounded-full" style={{ width: "88%" }}></div>
                        </div>
                      </div>
                      <div className="space-y-1">
                        <div className="flex justify-between text-[10px] text-slate-400">
                          <span>Smart LED network controller</span>
                          <span className="font-mono text-amber-400 font-bold">74% Remaining</span>
                        </div>
                        <div className="h-1 bg-slate-900 rounded-full overflow-hidden">
                          <div className="h-full bg-amber-500 rounded-full" style={{ width: "74%" }}></div>
                        </div>
                      </div>
                      <div className="space-y-1">
                        <div className="flex justify-between text-[10px] text-slate-400">
                          <span>NCWSC Mains booster pumps</span>
                          <span className="font-mono text-[#38bdf8] font-bold">68% Remaining</span>
                        </div>
                        <div className="h-1 bg-slate-900 rounded-full overflow-hidden">
                          <div className="h-full bg-[#38bdf8] rounded-full" style={{ width: "68%" }}></div>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </div>

              {/* Property Custom Warning and Alert Inlets */}
              <div className="space-y-2.5 pt-2">
                <span className="text-[9px] uppercase font-bold text-slate-500 tracking-wider block font-display">
                  Active Insights Feed ({activeInsights.length})
                </span>

                {activeInsights.map((insight, index) => (
                  <div
                    key={index}
                    className={`p-3.5 rounded-xl border text-xs flex gap-3 transition-colors duration-200 ${
                      insight.type === "alert"
                        ? "bg-rose-950/10 border-rose-900/30 text-rose-100"
                        : insight.type === "warning"
                        ? "bg-amber-950/10 border-amber-900/35 text-amber-100"
                        : "bg-emerald-950/10 border-emerald-900/30 text-emerald-100"
                    }`}
                  >
                    <div className="shrink-0 mt-0.5">
                      {insight.type === "alert" ? (
                        <AlertTriangle className="w-4 h-4 text-rose-500" />
                      ) : insight.type === "warning" ? (
                        <AlertTriangle className="w-4 h-4 text-amber-400" />
                      ) : (
                        <Sparkles className="w-4 h-4 text-emerald-400" />
                      )}
                    </div>
                    <div className="space-y-1.5 flex-1 min-w-0">
                      <span className="font-bold text-white block leading-tight">
                        {insight.title}
                      </span>
                      <p className="text-[10.5px] text-slate-300 leading-relaxed font-light">
                        {insight.description}
                      </p>
                      <div className="text-[10px] font-mono text-emerald-400 font-bold pt-0.5">
                        Impact: {insight.financialImpact}
                      </div>
                      <div className="text-[10px] text-slate-450 italic mt-1.5 bg-slate-900/50 p-2 rounded-lg border border-slate-900">
                        <strong className="text-white not-italic font-bold font-display">Recommend:</strong> {insight.recommendedAction}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <p className="mt-5 pt-3 border-t border-slate-900 text-[9px] text-slate-600 leading-relaxed font-mono">
            Insights calculated daily by comparing structural thermal loops against utility logs. Prevents sudden capital depreciation.
          </p>
        </div>    </div>
      </section>

      {/* MAINTENANCE SCHEDULER & VENDOR CENTER HIGHLIGHT */}
      <section className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200/60 dark:border-slate-800 shadow-[0_2px_8px_-3px_rgba(0,0,0,0.03),0_1px_3px_-1px_rgba(0,0,0,0.02)] space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white tracking-wide font-display">
              Maintenance Tasks & M-Pesa Disbursals
            </h3>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              Pay verified contractors and fundis immediately via mobile money to minimize turnaround delays.
            </p>
          </div>

          {/* Component Search Facility */}
          <div className="flex items-center gap-2.5 w-full sm:w-auto">
            <div className="relative flex-1 sm:w-64">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Search component (e.g. roofing, solar)..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full bg-slate-50 dark:bg-[#111827] border border-slate-200/60 dark:border-slate-800 rounded-lg py-1.5 pl-9 pr-4 text-xs focus:outline-none focus:border-emerald-500 focus:bg-white dark:focus:bg-slate-900 text-slate-800 dark:text-slate-100 transition-all"
              />
            </div>
            <select
              value={phaseFilter}
              onChange={e => setPhaseFilter(e.target.value)}
              className="bg-slate-50 dark:bg-[#111827] border border-slate-200/60 dark:border-slate-800 rounded-lg py-1.5 px-2 text-xs focus:outline-none focus:border-emerald-500 focus:bg-white dark:focus:bg-slate-900 font-medium text-slate-700 dark:text-slate-300 transition-all cursor-pointer"
            >
              <option value="All">All Statuses</option>
              <option value="Active">Active Tasks</option>
              <option value="Paid">Paid Outlets</option>
            </select>
          </div>
        </div>

        {/* Tasks Table */}
        <div className="overflow-x-auto rounded-xl border border-slate-105 dark:border-slate-800">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-950 text-[9px] uppercase font-bold text-slate-500 dark:text-slate-400 tracking-wider border-b border-slate-100 dark:border-slate-800">
                <th className="py-3 px-4 font-display">Component Maintenance Target</th>
                <th className="py-3 px-4 font-display">Target Date</th>
                <th className="py-3 px-4 font-display">Contractor / Fundi</th>
                <th className="py-3 px-4 font-display text-right pr-6">Cost (KES)</th>
                <th className="py-3 px-4 font-display">Status & Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100/80 dark:divide-slate-800/80 text-xs text-slate-700 dark:text-slate-300">
              {filteredTasks.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-slate-400 dark:text-slate-500 font-medium font-sans">
                    No maintenance tasks detected match your queries. Try clearing filters.
                  </td>
                </tr>
              ) : (
                filteredTasks.map(task => (
                  <tr key={task.id} className="hover:bg-slate-50/40 dark:hover:bg-slate-800/10 transition-colors duration-150">
                    <td className="py-3.5 px-4">
                      <span className="font-bold text-slate-900 dark:text-white block tracking-tight">
                        {task.component}
                      </span>
                      <span className="text-[9px] text-slate-400 dark:text-slate-500 block font-mono">
                        Ref #{task.id}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 font-medium text-slate-600 dark:text-slate-400">
                      {task.targetDate}
                    </td>
                    <td className="py-3.5 px-4 opacity-95">
                      <div className="space-y-0.5">
                        <span className="font-semibold text-slate-800 dark:text-slate-250 block">{task.contractor}</span>
                        {task.phone && (
                          <span className="text-[10px] text-slate-400 dark:text-slate-500 flex items-center gap-1 font-mono hover:text-slate-600 dark:hover:text-slate-300 transition-colors">
                            <Phone className="w-3 h-3 text-slate-400 dark:text-slate-500" /> +{task.phone}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="py-3.5 px-4 font-mono font-bold text-slate-900 dark:text-white text-right pr-6">
                      KSh {task.amount.toLocaleString()}
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-2">
                        {/* Status badge */}
                        <span className={`text-[9px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider block border ${
                          task.status === "Paid" 
                            ? "bg-emerald-50 dark:bg-emerald-950/20 text-emerald-700 dark:text-emerald-450 border-emerald-200 dark:border-emerald-900/50" 
                            : task.status === "Completed" 
                            ? "bg-blue-50 dark:bg-blue-950/20 text-blue-700 dark:text-blue-450 border-blue-200 dark:border-blue-900/50" 
                            : task.status === "In-Progress" 
                            ? "bg-amber-50 dark:bg-amber-950/20 text-amber-700 dark:text-amber-450 border-amber-200 dark:border-amber-900/50" 
                            : "bg-slate-50 dark:bg-slate-950/20 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-800"
                        }`}>
                          {task.status}
                        </span>

                        {/* MPESA action trigger */}
                        {task.status === "Completed" && (
                          <button
                            onClick={() => handleOpenMpesa(task)}
                            className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[9px] uppercase tracking-wider py-1 px-2.5 rounded shadow-sm focus:outline-none transition-all flex items-center gap-1 shrink-0 cursor-pointer active:scale-95"
                          >
                            <span>M-pesa Pay</span>
                          </button>
                        )}

                        {task.status === "Paid" && (
                          <span className="text-[9.5px] text-slate-400 dark:text-slate-500 flex items-center gap-1 font-mono select-none">
                            <Check className="w-3.5 h-3.5 text-emerald-500 font-bold" /> Disbursed
                          </span>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
