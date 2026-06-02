import React from "react";
import {
  Building2,
  Coins,
  Activity,
  Wrench,
  X,
  ChevronDown,
  Building,
  MapPin
} from "lucide-react";
import { Property } from "../types";

interface SidebarProps {
  properties: Property[];
  selectedPropertyId: string;
  activeTab: "dashboard" | "ledger" | "vendors";
  setActiveTab: (tab: "dashboard" | "ledger" | "vendors") => void;
  handlePropertyChange: (id: string) => void;
  isMobileSidebarOpen: boolean;
  setIsMobileSidebarOpen: (open: boolean) => void;
  isPropertyDropdownOpen: boolean;
  setIsPropertyDropdownOpen: (open: boolean) => void;
  selectedProperty: Property;
  entryCount: number;
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
  entryCount
}: SidebarProps) {
  return (
    <aside
      id="sidebar"
      className={`fixed inset-y-0 left-0 z-40 w-64 bg-slate-950 text-slate-300 border-r border-slate-900 transform ${
        isMobileSidebarOpen ? "translate-x-0" : "-translate-x-full"
      } lg:translate-x-0 transition-transform duration-300 ease-in-out flex flex-col`}
    >
      {/* Sidebar Header with BLCTS Shield */}
      <div className="h-16 flex items-center justify-between px-5 border-b border-slate-900/80 bg-slate-950">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center text-slate-950 font-black text-sm shadow-[0_2px_10px_rgba(16,185,129,0.2)]">
            B
          </div>
          <div>
            <span className="text-white font-display font-medium text-sm tracking-wide block">BLCTS PORTAL</span>
            <span className="text-[9px] text-emerald-400 font-bold uppercase tracking-widest block leading-tight">Kenya Enterprise</span>
          </div>
        </div>
        {/* Mobile close button */}
        <button
          onClick={() => setIsMobileSidebarOpen(false)}
          className="lg:hidden p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-900 transition-colors"
        >
          <X className="w-4.5 h-4.5" />
        </button>
      </div>

      {/* Connected Portfolio Real Estate Selector */}
      <div className="p-4 border-b border-slate-900 bg-slate-950">
        <span className="text-[9px] uppercase font-bold text-slate-500 tracking-wider block mb-2">
          Active Property Hub
        </span>
        <div className="relative">
          <button
            id="property-dropdown-trigger"
            onClick={() => setIsPropertyDropdownOpen(!isPropertyDropdownOpen)}
            className="w-full flex items-center justify-between bg-slate-900 border border-slate-800 text-slate-200 px-3 py-2.5 rounded-lg text-xs font-semibold focus:outline-none focus:border-emerald-500/50 hover:bg-slate-800/80 transition-all duration-200 shadow-sm"
          >
            <div className="flex items-center gap-2 text-left truncate mr-2">
              <Building className="w-3.5 h-3.5 text-teal-400 shrink-0" />
              <span className="truncate tracking-wide">{selectedProperty.name}</span>
            </div>
            <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-200 ${isPropertyDropdownOpen ? "rotate-180" : ""}`} />
          </button>

          {isPropertyDropdownOpen && (
            <div className="absolute left-0 right-0 mt-1.5 bg-slate-900 border border-slate-800 rounded-lg shadow-2xl z-50 overflow-hidden divide-y divide-slate-800/50 animate-zoom-in">
              {properties.map(prop => (
                <button
                  key={prop.id}
                  onClick={() => handlePropertyChange(prop.id)}
                  className={`w-full text-left px-3.5 py-2.5 hover:bg-slate-800 transition-colors flex items-center justify-between group ${
                    prop.id === selectedPropertyId ? "bg-slate-800/40" : ""
                  }`}
                >
                  <div className="truncate mr-2">
                    <span className="text-xs text-slate-200 font-medium block truncate group-hover:text-white transition-colors">
                      {prop.name}
                    </span>
                    <span className="text-[10px] text-slate-500 block truncate">
                      {prop.location}
                    </span>
                  </div>
                  <span className={`text-[8px] px-1.5 py-0.5 rounded font-bold tracking-wider shrink-0 ${
                    prop.healthGrade === "A" 
                      ? "bg-emerald-950/80 text-emerald-400 border border-emerald-900" 
                      : prop.healthGrade === "B" 
                      ? "bg-teal-950/80 text-teal-400 border border-teal-900" 
                      : "bg-amber-950/80 text-amber-400 border border-amber-900"
                  }`}>
                    Grade {prop.healthGrade}
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>
        
        <div className="mt-2.5 flex items-center gap-1.5 text-[10px] text-slate-400 px-1">
          <MapPin className="w-3.5 h-3.5 text-slate-500 shrink-0" />
          <span className="truncate font-light">{selectedProperty.location}</span>
        </div>
      </div>

      {/* Sidebar Links */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        <button
          id="sidebar-link-dashboard"
          onClick={() => { setActiveTab("dashboard"); setIsMobileSidebarOpen(false); }}
          className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-semibold uppercase tracking-wider transition-all duration-200 ${
            activeTab === "dashboard"
              ? "bg-slate-900 text-white border-l-2 border-emerald-500 pl-2.5 shadow-inner"
              : "text-slate-400 hover:text-white hover:bg-slate-900/50"
          }`}
        >
          <Activity className="w-4 h-4 shrink-0" />
          <span>Executive Dashboard</span>
        </button>

        <button
          id="sidebar-link-ledger"
          onClick={() => { setActiveTab("ledger"); setIsMobileSidebarOpen(false); }}
          className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-semibold uppercase tracking-wider transition-all duration-200 ${
            activeTab === "ledger"
              ? "bg-slate-900 text-white border-l-2 border-emerald-500 pl-2.5 shadow-inner"
              : "text-slate-400 hover:text-white hover:bg-slate-900/50"
          }`}
        >
          <Coins className="w-4 h-4 shrink-0" />
          <span>Asset Cost Ledger</span>
          <span className="ml-auto text-[9px] bg-slate-800 text-slate-300 font-mono px-1.5 py-0.5 rounded font-bold border border-slate-700">
            {entryCount}
          </span>
        </button>

        <button
          id="sidebar-link-vendors"
          onClick={() => { setActiveTab("vendors"); setIsMobileSidebarOpen(false); }}
          className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-semibold uppercase tracking-wider transition-all duration-200 ${
            activeTab === "vendors"
              ? "bg-slate-900 text-white border-l-2 border-emerald-500 pl-2.5 shadow-inner"
              : "text-slate-400 hover:text-white hover:bg-slate-900/50"
          }`}
        >
          <Wrench className="w-4 h-4 shrink-0" />
          <span>Vendor Action Center</span>
        </button>
      </nav>

      {/* Education Box targeting First-Cost Bias */}
      <div className="p-4 mx-3 my-4 bg-[#0a0f1d] border border-slate-900 rounded-xl">
        <h5 className="text-[9px] font-bold text-emerald-400 uppercase tracking-widest mb-1">
          Kenyan Real Estate Tip
        </h5>
        <p className="text-[10px] text-slate-400 leading-relaxed font-light">
          <strong>First-Cost Bias</strong> occurs when developers cut down 10% on materials during construction, only to suffer 150% higher operational bills over 15 years. Invest in premium insulation, LED, and water recycling.
        </p>
      </div>

      {/* Sidebar Footer */}
      <div className="p-4 border-t border-slate-900 bg-slate-950/40 flex items-center justify-between text-[9px] text-slate-500 font-mono">
        <span>Server: <span className="text-emerald-500 font-bold">LIVE</span></span>
        <span>v1.2.4</span>
      </div>
    </aside>
  );
}
