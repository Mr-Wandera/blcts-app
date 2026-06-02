import React from "react";
import { Search } from "lucide-react";
import { CostEntry } from "../types";

interface CostLedgerProps {
  filteredLedgerEntries: CostEntry[];
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  phaseFilter: string;
  setPhaseFilter: (filter: string) => void;
}

export default function CostLedger({
  filteredLedgerEntries,
  searchQuery,
  setSearchQuery,
  phaseFilter,
  setPhaseFilter
}: CostLedgerProps) {
  return (
    <section className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200/60 dark:border-slate-800 shadow-[0_2px_8px_-3px_rgba(0,0,0,0.03),0_1px_3px_-1px_rgba(0,0,0,0.02)] space-y-4">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <h3 className="text-sm font-bold text-slate-900 dark:text-white tracking-wide font-display">
            Asset Cost Ledger
          </h3>
          <p className="text-[11px] text-slate-500 dark:text-slate-400">
            Audit log of construction materials, utility invoices, and mechanical refits. Adds transparent verification constraints.
          </p>
        </div>

        {/* Filter facility */}
        <div className="flex items-center gap-2.5 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-64">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search invoices, contractors..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full bg-slate-50 dark:bg-[#111827] border border-slate-200/60 dark:border-slate-800 rounded-lg py-1.5 pl-9 pr-4 text-xs focus:outline-none focus:border-emerald-500 focus:bg-white dark:focus:bg-slate-900 text-slate-808 dark:text-slate-100 transition-all"
            />
          </div>
          <select
            value={phaseFilter}
            onChange={e => setPhaseFilter(e.target.value)}
            className="bg-slate-50 dark:bg-[#111827] border border-slate-200/60 dark:border-slate-800 rounded-lg py-1.5 px-2.5 text-xs focus:outline-none focus:border-emerald-500 focus:bg-white dark:focus:bg-slate-900 font-medium text-slate-700 dark:text-slate-300 cursor-pointer"
          >
            <option value="All">All Life Phases</option>
            <option value="Construction">Construction (CAPEX)</option>
            <option value="Operational">Operational (OPEX)</option>
            <option value="Maintenance">Maintenance</option>
            <option value="End-of-Life">End-of-Life</option>
          </select>
        </div>
      </div>

      <div className="overflow-x-auto rounded-xl border border-slate-100 dark:border-slate-800">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 dark:bg-slate-950 text-[9px] uppercase font-bold text-slate-500 dark:text-slate-400 tracking-wider border-b border-slate-100 dark:border-slate-800">
              <th className="py-3 px-4 font-display">Registered invoice / Component</th>
              <th className="py-3 px-4 font-display">Lifecycle Phase</th>
              <th className="py-3 px-4 font-display">Date</th>
              <th className="py-3 px-4 font-display">Contracting Vendor</th>
              <th className="py-3 px-4 font-display text-right pr-6">Paid Total (KES)</th>
              <th className="py-3 px-4 font-display">Description</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100/80 dark:divide-slate-800/80 text-xs text-slate-705 dark:text-slate-300">
            {filteredLedgerEntries.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-10 text-center text-slate-400 dark:text-slate-500 font-medium font-sans">
                  No matching registered invoice entries found. Keep ledger expanded or adjust phase select.
                </td>
              </tr>
            ) : (
              filteredLedgerEntries.map(entry => (
                <tr key={entry.id} className="hover:bg-slate-50/40 dark:hover:bg-slate-800/10 transition-colors duration-150">
                  <td className="py-3.5 px-4">
                    <span className="font-bold text-slate-900 dark:text-white block tracking-tight">
                      {entry.component}
                    </span>
                    <span className="text-[9px] text-slate-450 dark:text-slate-500 font-mono block">
                      invoice REF {entry.id}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 font-medium">
                    <span className={`text-[8.5px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md border ${
                      entry.phase === "Construction" 
                        ? "bg-teal-50 dark:bg-teal-950/20 text-teal-850 dark:text-teal-400 border-teal-100 dark:border-teal-900/50" 
                        : entry.phase === "Operational" 
                        ? "bg-rose-50 dark:bg-rose-950/20 text-rose-850 dark:text-rose-400 border-rose-100 dark:border-rose-900/50" 
                        : "bg-blue-50 dark:bg-blue-950/20 text-blue-850 dark:text-blue-400 border-blue-105 dark:border-blue-900/50"
                    }`}>
                      {entry.phase}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-slate-600 dark:text-slate-400 font-medium">
                    {entry.date}
                  </td>
                  <td className="py-3.5 px-4 font-semibold text-slate-900 dark:text-slate-200">
                    {entry.contractor}
                  </td>
                  <td className="py-3.5 px-4 font-bold text-slate-900 dark:text-white font-mono text-right pr-6">
                    KSh {entry.amount.toLocaleString()}
                  </td>
                  <td className="py-3.5 px-4 text-slate-500 dark:text-slate-400 max-w-xs truncate font-light" title={entry.description}>
                    {entry.description}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="flex items-center justify-between text-[10px] text-slate-450 font-mono pt-1 text-slate-400">
        <span>Showing {filteredLedgerEntries.length} entries matching selection criteria.</span>
        <span>Calculated dynamically in memory.</span>
      </div>
    </section>
  );
}
