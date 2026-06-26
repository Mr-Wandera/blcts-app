import React from "react";
import {
  Building2,
  Coins,
  Activity,
  X,
  ChevronDown,
  Building,
  MapPin,
  FileText,
  Cpu,
  Sparkles
} from "lucide-react";
import { Property, ActiveTabType } from "../types";

interface SidebarProps {
  properties: Property[];
  selectedPropertyId: string;
  activeTab: ActiveTabType;
  setActiveTab: (tab: ActiveTabType) => void;
  handlePropertyChange: (id: string) => void;
  isMobileSidebarOpen: boolean;
  setIsMobileSidebarOpen: (open: boolean) => void;
  isPropertyDropdownOpen: boolean;
  setIsPropertyDropdownOpen: (open: boolean) => void;
  selectedProperty: Property;
  entryCount: number;
  currentLanguage: "en" | "sw";
}

export default function Sidebar({
  properties,
  selectedPropertyId,
  activeTab,
  setActiveTab,
  handlePropertyChange,
  isMobileSidebarOpen,
  setIsMobileSidebarOpen,
  isPropertyDropdownOpen,
  setIsPropertyDropdownOpen,
  selectedProperty,
  entryCount,
  currentLanguage
}: SidebarProps) {
  
  const isEn = currentLanguage === "en";

  const t = {
    financialHeader: isEn ? "System Navigation" : "Urambazaji wa Mfumo",
    tipHeader: isEn ? "TCO Planning Insight" : "Kidokezo cha Upangaji TCO",
    tipBody: isEn 
      ? "Estimating Total Cost of Ownership (TCO) helps eliminate 'first-cost bias', saving developers over 35% in long-term building operations."
      : "Kukadiria Gharama ya Jumla ya Umiliki (TCO) husaidia kuondoa upendeleo wa gharama ya kwanza, na kuokoa hadi 35% ya gharama za uendeshaji."
  };

  return (
    <aside
      id="sidebar"
      className={`fixed inset-y-0 left-0 z-40 w-64 bg-slate-950 text-slate-300 border-r border-slate-900 transform ${
        isMobileSidebarOpen ? "translate-x-0" : "-translate-x-full"
      } lg:translate-x-0 transition-transform duration-300 ease-in-out flex flex-col`}
    >
      {/* Sidebar Header with BLCTS Shield */}
      <div className="h-16 flex items-center justify-between px-5 border-b border-slate-900/80 bg-slate-950 select-none shrink-0">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center text-slate-950 font-black text-sm shadow-[0_2px_10px_rgba(16,185,129,0.2)]">
            B
          </div>
          <div>
            <span className="text-white font-display font-medium text-sm tracking-wide block">BLCTS Portal</span>
            <span className="text-[9px] text-emerald-400 font-bold uppercase tracking-widest block leading-tight">Lifecycle Costs</span>
          </div>
        </div>
        {/* Mobile close button */}
        <button
          onClick={() => setIsMobileSidebarOpen(false)}
          className="lg:hidden p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-900 transition-colors cursor-pointer"
        >
          <X className="w-4.5 h-4.5" />
        </button>
      </div>

      {/* Current Project Card */}
      <div className="p-4 border-b border-slate-900 bg-slate-950 shrink-0 text-left">
        <span className="text-[9px] uppercase font-bold text-slate-500 tracking-wider block mb-2 select-none">
          Current Project
        </span>
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-3.5 space-y-2">
          <div className="flex items-start gap-2">
            <Building className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            <div className="min-w-0">
              <span className="text-xs font-semibold text-white block truncate leading-snug">
                {selectedProperty.name}
              </span>
              <span className="text-[10px] text-slate-400 block truncate font-light mt-0.5 flex items-center gap-1">
                <MapPin className="w-3 h-3 text-slate-500 shrink-0" />
                <span className="truncate">{selectedProperty.location}</span>
              </span>
            </div>
          </div>
          <div className="flex items-center justify-between text-[10px] pt-1.5 border-t border-slate-800/60">
            <span className="text-slate-500">Status</span>
            <span className="font-mono font-bold text-emerald-400">Active</span>
          </div>
          <button
            onClick={() => { setActiveTab("properties-mgmt"); setIsMobileSidebarOpen(false); }}
            className="w-full mt-1.5 bg-slate-850 hover:bg-slate-800 text-slate-200 text-[10px] uppercase tracking-wider font-bold py-1.5 rounded-lg border border-slate-700/50 hover:border-emerald-500/30 transition-all cursor-pointer text-center block"
          >
            Change Project
          </button>
        </div>
      </div>

      {/* CORE NAVIGATION LINKS */}
      <div className="flex-1 overflow-y-auto px-2 py-4 space-y-5 scrollbar-none">
        
        <div className="space-y-1">
          <span className="text-[9px] uppercase font-bold text-slate-500 px-3 tracking-wide select-none block pb-1">
            {t.financialHeader}
          </span>
          
          <button
            onClick={() => { setActiveTab("dashboard"); setIsMobileSidebarOpen(false); }}
            className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-semibold uppercase tracking-wider transition-all duration-200 cursor-pointer ${
              activeTab === "dashboard"
                ? "bg-slate-900 text-white border-l-2 border-emerald-500 pl-2 shadow-inner font-extrabold"
                : "text-slate-400 hover:text-white hover:bg-slate-900/40"
            }`}
          >
            <Activity className="w-3.5 h-3.5 shrink-0" />
            <span>Dashboard</span>
          </button>

          <button
            onClick={() => { setActiveTab("properties-mgmt"); setIsMobileSidebarOpen(false); }}
            className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-semibold uppercase tracking-wider transition-all duration-200 cursor-pointer ${
              activeTab === "properties-mgmt"
                ? "bg-slate-900 text-white border-l-2 border-emerald-500 pl-2 shadow-inner font-extrabold"
                : "text-slate-400 hover:text-white hover:bg-slate-900/40"
            }`}
          >
            <div className="flex items-center gap-2.5">
              <Building className="w-3.5 h-3.5 shrink-0 text-emerald-450" />
              <span>Projects</span>
            </div>
            <span className="text-[9px] bg-emerald-950 text-emerald-400 font-mono px-1.5 py-0.5 rounded font-black border border-emerald-900">
              {properties.filter(p => !p.isSoftDeleted).length}
            </span>
          </button>

          <button
            onClick={() => { setActiveTab("cost-estimation"); setIsMobileSidebarOpen(false); }}
            className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-semibold uppercase tracking-wider transition-all duration-200 cursor-pointer ${
              activeTab === "cost-estimation"
                ? "bg-slate-900 text-white border-l-2 border-emerald-500 pl-2 shadow-inner font-extrabold"
                : "text-slate-400 hover:text-white hover:bg-slate-900/40"
            }`}
          >
            <Cpu className="w-3.5 h-3.5 shrink-0 text-cyan-400" />
            <span>Cost Estimation</span>
          </button>

          <button
            onClick={() => { setActiveTab("materials"); setIsMobileSidebarOpen(false); }}
            className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-semibold uppercase tracking-wider transition-all duration-200 cursor-pointer ${
              activeTab === "materials"
                ? "bg-slate-900 text-white border-l-2 border-emerald-500 pl-2 shadow-inner font-extrabold"
                : "text-slate-400 hover:text-white hover:bg-slate-900/40"
            }`}
          >
            <Coins className="w-3.5 h-3.5 shrink-0 text-amber-400" />
            <span>Materials</span>
          </button>

          <button
            onClick={() => { setActiveTab("reports"); setIsMobileSidebarOpen(false); }}
            className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-semibold uppercase tracking-wider transition-all duration-200 cursor-pointer ${
              activeTab === "reports"
                ? "bg-slate-900 text-white border-l-2 border-emerald-500 pl-2 shadow-inner font-extrabold"
                : "text-slate-400 hover:text-white hover:bg-slate-900/40"
            }`}
          >
            <FileText className="w-3.5 h-3.5 shrink-0 text-indigo-400" />
            <span>Reports</span>
          </button>
        </div>

      </div>

      {/* Education Box */}
      <div className="p-3.5 mx-3 mb-3 bg-[#0a0f1d] border border-slate-900 rounded-xl shrink-0 select-none text-left">
        <h5 className="text-[9px] font-black text-emerald-400 uppercase tracking-widest mb-1">
          {t.tipHeader}
        </h5>
        <p className="text-[10px] text-slate-500 leading-relaxed font-light">
          {t.tipBody}
        </p>
      </div>

      {/* Sidebar Footer */}
      <div className="p-4 border-t border-slate-900 bg-slate-950/40 flex items-center justify-between text-[9px] text-slate-500 font-mono shrink-0 select-none">
        <span>BLCTS Portal</span>
        <span>v3.0.0</span>
      </div>
    </aside>
  );
}
