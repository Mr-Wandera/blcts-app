import React, { useMemo } from "react";
import { 
  FileText, 
  TrendingUp, 
  Layers, 
  Coins, 
  Calendar
} from "lucide-react";
import { Property, CostEntry, MaintenanceTask } from "../types";
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
} from "recharts";

interface ReportsProps {
  selectedProperty: Property;
  costEntries: CostEntry[];
  maintenanceTasks: MaintenanceTask[];
  triggerToast?: (msg: string, type?: "success" | "info" | "warning") => void;
}

export default function Reports({ 
  selectedProperty 
}: ReportsProps) {

  // 1. Calculations for Total Cost of Ownership Summary
  const constructionCost = selectedProperty.capexBudget || 120000000;
  const materialsCost = selectedProperty.materialCost || (constructionCost * 0.55);
  const labourCost = selectedProperty.labourCost || (constructionCost * 0.25);
  const maintenanceCost = selectedProperty.maintenanceCost || 12000000;
  const utilityCost = selectedProperty.utilityCost || 8000000;
  const otherCost = (selectedProperty.repairCost || 0) + (selectedProperty.renovationCost || 0) + (selectedProperty.otherCost || 0) || 4000000;
  
  const totalLifecycleCost = constructionCost + maintenanceCost + utilityCost + otherCost;

  // 2. Cost Trend Graph Data (Standard 6-Month Expenditure Timeline)
  const costTrendData = useMemo(() => {
    return [
      { month: "Jan", "Expenditure": 4500000 },
      { month: "Feb", "Expenditure": 5200000 },
      { month: "Mar", "Expenditure": 6100000 },
      { month: "Apr", "Expenditure": 4800000 },
      { month: "May", "Expenditure": 5900000 },
      { month: "Jun", "Expenditure": 6500000 }
    ];
  }, []);

  const formatKSh = (value: number) => {
    if (value >= 1000000) {
      return `KSh ${(value / 1000000).toFixed(1)}M`;
    }
    return `KSh ${value.toLocaleString()}`;
  };

  return (
    <div className="space-y-8 text-left animate-fade-in" id="simplified-reports-page">
      
      {/* HEADER SECTION */}
      <div className="border-b border-slate-100 dark:border-slate-800 pb-5">
        <h2 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-wider">
          Performance & Cost Reports
        </h2>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          Static and real-time lifecycle reports compiled automatically for <strong>{selectedProperty.name}</strong>.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* 1. MONTHLY EXPENDITURE SUMMARY */}
        <section className="bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 rounded-2xl p-6 shadow-[0_1px_5px_rgba(0,0,0,0.01)] space-y-4">
          <div className="flex items-center gap-2 text-slate-900 dark:text-white">
            <Calendar className="w-5 h-5 text-emerald-500" />
            <h3 className="text-sm font-bold uppercase tracking-wider">
              Monthly Expenditure Summary
            </h3>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed font-light">
            An overview of the ongoing recurring expenses, average monthly outlays, and project phase distributions.
          </p>

          <div className="grid grid-cols-2 gap-4 pt-2">
            <div className="bg-slate-50 dark:bg-slate-950 p-4 rounded-xl border border-slate-100 dark:border-slate-800/80">
              <span className="text-[10px] text-slate-400 block uppercase font-bold">Monthly Average Opex</span>
              <span className="text-lg font-black text-slate-900 dark:text-white font-mono mt-1 block">
                KSh 685,000
              </span>
            </div>
            <div className="bg-slate-50 dark:bg-slate-950 p-4 rounded-xl border border-slate-100 dark:border-slate-800/80">
              <span className="text-[10px] text-slate-400 block uppercase font-bold">Active Phase Status</span>
              <span className="text-lg font-black text-emerald-600 dark:text-emerald-400 mt-1 block uppercase tracking-wider">
                Operational
              </span>
            </div>
          </div>
        </section>

        {/* 2. COST TREND GRAPH */}
        <section className="bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 rounded-2xl p-6 shadow-[0_1px_5px_rgba(0,0,0,0.01)] space-y-4">
          <div className="flex items-center gap-2 text-slate-900 dark:text-white">
            <TrendingUp className="w-5 h-5 text-blue-500" />
            <h3 className="text-sm font-bold uppercase tracking-wider">
              Cost Trend Graph
            </h3>
          </div>
          
          <div className="h-48 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={costTrendData} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="month" tick={{ fontSize: 10 }} stroke="#94a3b8" />
                <YAxis tick={{ fontSize: 10 }} stroke="#94a3b8" tickFormatter={v => `KSh ${(v / 1000000).toFixed(1)}M`} />
                <Tooltip formatter={(val: number) => formatKSh(val)} contentStyle={{ fontSize: "11px", borderRadius: "8px" }} />
                <Line type="monotone" dataKey="Expenditure" stroke="#3b82f6" strokeWidth={3} activeDot={{ r: 6 }} dot={{ r: 3 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </section>

        {/* 3. MATERIAL COST BREAKDOWN */}
        <section className="bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 rounded-2xl p-6 shadow-[0_1px_5px_rgba(0,0,0,0.01)] space-y-4">
          <div className="flex items-center gap-2 text-slate-900 dark:text-white">
            <Layers className="w-5 h-5 text-teal-500" />
            <h3 className="text-sm font-bold uppercase tracking-wider">
              Material Cost Breakdown
            </h3>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed font-light">
            Analysis of raw structural and envelope materials used during building erection.
          </p>

          <div className="space-y-2.5 pt-1">
            <div className="flex justify-between items-center text-xs">
              <span className="text-slate-500 font-light">Portland Cement (Bulk)</span>
              <span className="font-mono font-bold text-slate-800 dark:text-slate-200">{formatKSh(materialsCost * 0.45)}</span>
            </div>
            <div className="flex justify-between items-center text-xs">
              <span className="text-slate-500 font-light">Reinforced High-Yield Steel (D16/D12/D10)</span>
              <span className="font-mono font-bold text-slate-800 dark:text-slate-200">{formatKSh(materialsCost * 0.35)}</span>
            </div>
            <div className="flex justify-between items-center text-xs">
              <span className="text-slate-500 font-light">Quarry Blocks & Aggregate</span>
              <span className="font-mono font-bold text-slate-800 dark:text-slate-200">{formatKSh(materialsCost * 0.12)}</span>
            </div>
            <div className="flex justify-between items-center text-xs">
              <span className="text-slate-500 font-light">River Sand & Ballast</span>
              <span className="font-mono font-bold text-slate-800 dark:text-slate-200">{formatKSh(materialsCost * 0.08)}</span>
            </div>
          </div>
        </section>

        {/* 4. TOTAL COST OF OWNERSHIP SUMMARY */}
        <section className="bg-slate-950 text-slate-100 rounded-2xl p-6 border border-slate-900 shadow-xl space-y-4">
          <div className="flex items-center gap-2 text-white">
            <Coins className="w-5 h-5 text-amber-500" />
            <h3 className="text-sm font-bold uppercase tracking-wider">
              Total Cost of Ownership Summary
            </h3>
          </div>
          
          <div className="space-y-2.5 text-xs">
            <div className="flex justify-between items-center">
              <span className="text-slate-400 font-light">Structural CAPEX Budget</span>
              <span className="font-mono font-semibold text-slate-300">{formatKSh(constructionCost)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-400 font-light">Material Procurements</span>
              <span className="font-mono font-semibold text-slate-300">{formatKSh(materialsCost)}</span>
            </div>
            <div className="flex justify-between items-center font-bold text-emerald-400 border-t border-slate-900 pt-2 text-sm">
              <span>Lifecycle TCO Estimate</span>
              <span className="font-mono font-black">{formatKSh(totalLifecycleCost)}</span>
            </div>
          </div>
        </section>

      </div>

    </div>
  );
}
