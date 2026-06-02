/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from "react";
import {
  Menu,
  CheckCircle2,
  AlertTriangle,
  Info,
  Building2,
  Plus,
  Sun,
  Moon
} from "lucide-react";
import {
  initialProperties,
  initialCostEntries,
  initialMaintenanceTasks,
  getFinancialTrends,
  getAIInsights
} from "./data";
import { Property, CostEntry, MaintenanceTask, LifecyclePhase } from "./types";

// Import modular sub-components for "Professional Polish" theme and chunked optimization
import Sidebar from "./components/Sidebar";
import ExecutiveDashboard from "./components/ExecutiveDashboard";
import CostLedger from "./components/CostLedger";
import VendorCenter from "./components/VendorCenter";
import AddCostModal from "./components/AddCostModal";
import MpesaPaymentModal from "./components/MpesaPaymentModal";

export default function App() {
  // Theme state manager (persisted in local storage)
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    try {
      const stored = localStorage.getItem("blcts-theme");
      return stored === "dark";
    } catch (e) {
      return false;
    }
  });

  const toggleTheme = () => {
    setIsDarkMode(prev => {
      const nextTheme = !prev;
      try {
        localStorage.setItem("blcts-theme", nextTheme ? "dark" : "light");
      } catch (e) {}
      triggerToast(`Theme switched to ${nextTheme ? "Dark" : "Light"} Mode`, "info");
      return nextTheme;
    });
  };

  // State managers
  const [properties, setProperties] = useState<Property[]>(initialProperties);
  const [selectedPropertyId, setSelectedPropertyId] = useState<string>("prop-1");
  const [costEntries, setCostEntries] = useState<CostEntry[]>(initialCostEntries);
  const [maintenanceTasks, setMaintenanceTasks] = useState<MaintenanceTask[]>(initialMaintenanceTasks);
  
  // UI states
  const [activeTab, setActiveTab] = useState<"dashboard" | "ledger" | "vendors">("dashboard");
  const [searchQuery, setSearchQuery] = useState("");
  const [phaseFilter, setPhaseFilter] = useState<string>("All");
  
  // Sidebar states
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [isPropertyDropdownOpen, setIsPropertyDropdownOpen] = useState(false);

  // New Invoice/Entry Modal states
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newEntry, setNewEntry] = useState({
    phase: "Operational" as LifecyclePhase,
    component: "",
    amount: "",
    contractor: "",
    date: new Date().toISOString().substring(0, 10),
    description: ""
  });
  const [formError, setFormError] = useState("");

  // M-Pesa Disbursement Modal states
  const [isMpesaModalOpen, setIsMpesaModalOpen] = useState(false);
  const [activeMpesaTask, setActiveMpesaTask] = useState<MaintenanceTask | null>(null);
  const [mpesaPhone, setMpesaPhone] = useState("");
  const [mpesaStep, setMpesaStep] = useState<"idle" | "stk-sent" | "waiting-pin" | "completed">("idle");
  const [mpesaTransactionId, setMpesaTransactionId] = useState("");

  // Toast notifications
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [toastType, setToastType] = useState<"success" | "info" | "warning">("success");

  // Selected property helper
  const selectedProperty = useMemo(() => {
    return properties.find(p => p.id === selectedPropertyId) || properties[0];
  }, [properties, selectedPropertyId]);

  // Toast trigger helper
  const triggerToast = (msg: string, type: "success" | "info" | "warning" = "success") => {
    setToastMessage(msg);
    setToastType(type);
    setTimeout(() => {
      setToastMessage(null);
    }, 4500);
  };

  // Switch property
  const handlePropertyChange = (id: string) => {
    setSelectedPropertyId(id);
    setIsPropertyDropdownOpen(false);
    triggerToast(`Switched active property to: ${properties.find(p => p.id === id)?.name}`, "info");
  };

  // CAPEX, OPEX and TCO Calculations for the active property
  const calculations = useMemo(() => {
    const propCosts = costEntries.filter(entry => entry.propertyId === selectedPropertyId);
    
    const capexTotal = propCosts
      .filter(c => c.phase === "Construction")
      .reduce((sum, item) => sum + item.amount, 0) + (selectedPropertyId === "prop-1" ? 120000000 : selectedPropertyId === "prop-2" ? 85000000 : 180000000); // base structural CAPEX estimates added to give realistic totals
      
    const opexTotal = propCosts
      .filter(c => c.phase === "Operational" || c.phase === "Maintenance")
      .reduce((sum, item) => sum + item.amount, 0);

    const paidMaintenanceTotal = maintenanceTasks
      .filter(t => t.propertyId === selectedPropertyId && t.status === "Paid")
      .reduce((sum, item) => sum + item.amount, 0);

    // Dynamic calculations
    const combinedOpex = opexTotal + paidMaintenanceTotal;
    const totalCostOfOwnership = capexTotal + combinedOpex;

    return {
      capex: capexTotal,
      opex: combinedOpex,
      tco: totalCostOfOwnership,
      entryCount: propCosts.length
    };
  }, [costEntries, selectedPropertyId, maintenanceTasks]);

  // AI insights based on Selected Property
  const activeInsights = useMemo(() => {
    return getAIInsights(selectedPropertyId);
  }, [selectedPropertyId]);

  // Financial Chart details mapping (Budget vs Actual)
  const trendsData = useMemo(() => {
    return getFinancialTrends(selectedPropertyId);
  }, [selectedPropertyId]);

  // SVG Chart drawing calculations
  const svgChartPaths = useMemo(() => {
    if (trendsData.length === 0) return { capexBudgetPath: "", capexActualPath: "", opexBudgetPath: "", opexActualPath: "", capexFillPath: "", opexFillPath: "", coords: [] };
    
    // Scale points to draw beautiful smooth lines in SVG viewBox="0 0 600 200"
    const width = 600;
    const height = 200;
    const padding = 20;
    const chartWidth = width - padding * 2;
    const chartHeight = height - padding * 2;

    // Find custom dynamic max val to scale chart coordinates precisely
    const allValues = trendsData.flatMap(d => [d.capexBudget, d.capexActual, d.opexBudget, d.opexActual]);
    const maxVal = Math.max(...allValues) * 1.1;

    const getX = (index: number) => padding + (index / (trendsData.length - 1)) * chartWidth;
    const getY = (value: number) => padding + chartHeight - (value / maxVal) * chartHeight;

    // Construct point strings
    let capexActualPoints = "";
    let capexBudgetPoints = "";
    let opexActualPoints = "";
    let opexBudgetPoints = "";

    trendsData.forEach((d, i) => {
      const x = getX(i);
      
      const yCapexAct = getY(d.capexActual);
      capexActualPoints += `${i === 0 ? "M" : "L"} ${x} ${yCapexAct} `;

      const yCapexBud = getY(d.capexBudget);
      capexBudgetPoints += `${i === 0 ? "M" : "L"} ${x} ${yCapexBud} `;

      const yOpexAct = getY(d.opexActual);
      opexActualPoints += `${i === 0 ? "M" : "L"} ${x} ${yOpexAct} `;

      const yOpexBud = getY(d.opexBudget);
      opexBudgetPoints += `${i === 0 ? "M" : "L"} ${x} ${yOpexBud} `;
    });

    // Create fill path strings
    const capexFillPath = `${capexActualPoints} L ${getX(trendsData.length - 1)} ${height - padding} L ${getX(0)} ${height - padding} Z`;
    const opexFillPath = `${opexActualPoints} L ${getX(trendsData.length - 1)} ${height - padding} L ${getX(0)} ${height - padding} Z`;

    return {
      capexActualPath: capexActualPoints,
      capexBudgetPath: capexBudgetPoints,
      opexActualPath: opexActualPoints,
      opexBudgetPath: opexBudgetPoints,
      capexFillPath,
      opexFillPath,
      coords: trendsData.map((d, i) => ({
        x: getX(i),
        yCapexAct: getY(d.capexActual),
        yCapexBud: getY(d.capexBudget),
        yOpexAct: getY(d.opexActual),
        yOpexBud: getY(d.opexBudget),
        month: d.month,
        raw: d
      }))
    };
  }, [trendsData]);

  // Filter accounts/contracts
  const filteredTasks = useMemo(() => {
    return maintenanceTasks.filter(task => {
      const matchProperty = task.propertyId === selectedPropertyId;
      const matchQuery = task.component.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          task.contractor.toLowerCase().includes(searchQuery.toLowerCase());
      const matchPhase = phaseFilter === "All" || 
                          (phaseFilter === "Paid" && task.status === "Paid") || 
                          (phaseFilter === "Active" && task.status !== "Paid");
      return matchProperty && matchQuery && matchPhase;
    });
  }, [maintenanceTasks, selectedPropertyId, searchQuery, phaseFilter]);

  // Filter cost ledger entries for property
  const filteredLedgerEntries = useMemo(() => {
    return costEntries.filter(entry => {
      const matchProperty = entry.propertyId === selectedPropertyId;
      const matchQuery = entry.component.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          entry.contractor.toLowerCase().includes(searchQuery.toLowerCase());
      const matchPhase = phaseFilter === "All" || entry.phase === phaseFilter;
      return matchProperty && matchQuery && matchPhase;
    });
  }, [costEntries, selectedPropertyId, searchQuery, phaseFilter]);

  // Add new entry submission
  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const { phase, component, amount, contractor, date, description } = newEntry;

    if (!component || !amount || !contractor) {
      setFormError("Kindly fill in all required fields marked with *");
      return;
    }

    const parsedAmount = parseFloat(amount.replace(/,/g, ""));
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      setFormError("Please enter a valid amount in Kenyan Shillings (KES)");
      return;
    }

    const entryId = `cost-user-${Date.now()}`;
    const newRecord: CostEntry = {
      id: entryId,
      propertyId: selectedPropertyId,
      phase,
      component,
      amount: parsedAmount,
      date,
      contractor,
      status: "Paid",
      description: description || "Manually logged via Developer Portal"
    };

    setCostEntries([newRecord, ...costEntries]);
    setIsAddModalOpen(false);
    
    // Clear state
    setNewEntry({
      phase: "Operational",
      component: "",
      amount: "",
      contractor: "",
      date: new Date().toISOString().substring(0, 10),
      description: ""
    });
    setFormError("");

    // Trigger toast notification
    triggerToast(`Success: Recorded KSh ${parsedAmount.toLocaleString()} under ${phase} phase!`, "success");

    // Also inject a Maintenance Schedule item if it is in the maintenance phase
    if (phase === "Maintenance") {
      const newTask: MaintenanceTask = {
        id: `maint-user-${Date.now()}`,
        propertyId: selectedPropertyId,
        component,
        status: "Completed",
        targetDate: date,
        contractor,
        amount: parsedAmount,
        phone: "254712345678"
      };
      setMaintenanceTasks(prev => [newTask, ...prev]);
    }
  };

  // Open M-Pesa disbursement modal
  const handleOpenMpesa = (task: MaintenanceTask) => {
    setActiveMpesaTask(task);
    setMpesaPhone(task.phone || "254712345678");
    setMpesaStep("idle");
    setMpesaTransactionId("");
    setIsMpesaModalOpen(true);
  };

  // Simulate M-Pesa STK Push
  const handleInitiateMpesa = () => {
    setMpesaStep("stk-sent");

    // Cycle steps to look like a genuine API integration with Safaricom Daraja
    setTimeout(() => {
      setMpesaStep("waiting-pin");
    }, 2000);

    setTimeout(() => {
      // Complete transaction and change statuses
      const txId = "STK" + Math.random().toString(36).substring(2, 12).toUpperCase();
      setMpesaTransactionId(txId);
      setMpesaStep("completed");

      // Update task status to 'Paid' inside maintenance state
      if (activeMpesaTask) {
        setMaintenanceTasks(prev =>
          prev.map(t => (t.id === activeMpesaTask.id ? { ...t, status: "Paid" } : t))
        );

        // Also record this inside general ledger cost ledger if not present
        const alreadyExists = costEntries.some(e => e.component === activeMpesaTask.component && e.propertyId === selectedPropertyId);
        if (!alreadyExists) {
          const mpesaLedgerRecord: CostEntry = {
            id: `cost-mpesa-${Date.now()}`,
            propertyId: selectedPropertyId,
            phase: "Maintenance",
            component: activeMpesaTask.component,
            amount: activeMpesaTask.amount,
            date: new Date().toISOString().substring(0, 10),
            contractor: activeMpesaTask.contractor,
            status: "Paid",
            description: `Mobile disbursement completed via API on ${activeMpesaTask.phone}. Ref ID: ${txId}`
          };
          setCostEntries(prev => [mpesaLedgerRecord, ...prev]);
        }
      }
    }, 5500);
  };

  // Close M-Pesa modal and trigger celebratory alerts
  const handleCloseMpesaSuccess = () => {
    setIsMpesaModalOpen(false);
    if (activeMpesaTask) {
      triggerToast(`M-Pesa Payment of KSh ${activeMpesaTask.amount.toLocaleString()} fully Disbursed to ${activeMpesaTask.contractor}!`, "success");
    }
    setActiveMpesaTask(null);
  };

  return (
    <div className={`min-h-screen ${isDarkMode ? "dark bg-slate-950 text-slate-100" : "bg-slate-50 text-slate-900"} font-sans flex flex-col antialiased selection:bg-emerald-500 selection:text-white transition-colors duration-200`}>
      
      {/* Toast Notifications */}
      {toastMessage && (
        <div className="fixed top-4 right-4 z-50 flex items-center gap-3 bg-slate-950 text-white py-3 px-5 rounded-xl shadow-[0_10px_30px_rgba(0,0,0,0.15)] border border-slate-900 animate-slide-in">
          {toastType === "success" && <CheckCircle2 className="w-4.5 h-4.5 text-emerald-400 shrink-0" />}
          {toastType === "info" && <Info className="w-4.5 h-4.5 text-teal-400 shrink-0" />}
          {toastType === "warning" && <AlertTriangle className="w-4.5 h-4.5 text-amber-400 shrink-0" />}
          <div className="text-xs font-semibold tracking-wide">{toastMessage}</div>
        </div>
      )}

      {/* Main Container */}
      <div className="flex flex-1 relative overflow-hidden">
        
        {/* Left Sidebar Layout */}
        <Sidebar
          properties={properties}
          selectedPropertyId={selectedPropertyId}
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          handlePropertyChange={handlePropertyChange}
          isMobileSidebarOpen={isMobileSidebarOpen}
          setIsMobileSidebarOpen={setIsMobileSidebarOpen}
          isPropertyDropdownOpen={isPropertyDropdownOpen}
          setIsPropertyDropdownOpen={setIsPropertyDropdownOpen}
          selectedProperty={selectedProperty}
          entryCount={calculations.entryCount}
        />

        {/* Outer overlay for mobile sidebar */}
        {isMobileSidebarOpen && (
          <div
            onClick={() => setIsMobileSidebarOpen(false)}
            className="fixed inset-0 bg-slate-950/40 backdrop-blur-xs z-30 lg:hidden cursor-default transition-all duration-300"
          />
        )}

        {/* Main Workspace Frame */}
        <main className="flex-1 min-w-0 lg:pl-64 flex flex-col min-h-screen">
          
          {/* Top Utility Bar */}
          <header className="h-16 bg-white dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800 px-6 flex items-center justify-between shrink-0 sticky top-0 z-20 shadow-[0_1px_5px_-2px_rgba(0,0,0,0.02)] transition-colors duration-200">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setIsMobileSidebarOpen(true)}
                className="p-1.5 -ml-1 text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg lg:hidden transition-colors cursor-pointer"
              >
                <Menu className="w-5.5 h-5.5" />
              </button>
              <div>
                <span className="hidden sm:inline text-[9px] text-slate-400 dark:text-slate-500 uppercase tracking-widest block font-extrabold leading-none font-display">
                  Building Lifecycle Cost Tracker
                </span>
                <span className="text-slate-955 dark:text-white font-black text-sm sm:text-base block leading-tight font-display tracking-tight mt-0.5">
                  {selectedProperty.name}
                </span>
              </div>
            </div>

            {/* Top Navigation Utilities */}
            <div className="flex items-center gap-4">
              {/* Alert Warning Count Indicator */}
              <div className="hidden md:flex items-center gap-1.5 bg-amber-50 dark:bg-amber-950/30 text-amber-800 dark:text-amber-300 text-[10px] uppercase font-bold py-1 px-3 rounded-full border border-amber-250/50 dark:border-amber-800/40">
                <AlertTriangle className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400 animate-pulse" />
                <span>{activeInsights.filter(i => i.type === "alert" || i.type === "warning").length} Warnings</span>
              </div>

              {/* Theme Toggle Button */}
              <button
                id="theme-toggle-btn"
                onClick={toggleTheme}
                className="p-1.5 rounded-xl border border-slate-200/80 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/60 text-slate-600 dark:text-slate-300 transition-all cursor-pointer flex items-center justify-center relative group"
                aria-label="Toggle Theme"
                title={isDarkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
              >
                {isDarkMode ? (
                  <Sun className="w-4 h-4 text-amber-400 transition-transform duration-300" />
                ) : (
                  <Moon className="w-4 h-4 text-slate-600 transition-transform duration-300" />
                )}
                {/* Tooltip hint */}
                <span className="absolute -bottom-9 scale-0 group-hover:scale-100 transition-all duration-150 origin-top bg-slate-900 text-white text-[9px] font-bold px-2.5 py-1 rounded shadow-lg whitespace-nowrap z-50">
                  {isDarkMode ? "Light Mode" : "Dark Mode"}
                </span>
              </button>

              {/* Connected Developer Profile Info */}
              <div className="flex items-center gap-2.5 pl-3 border-l border-slate-100 dark:border-slate-800">
                <div className="text-right hidden sm:block">
                  <span className="text-slate-950 dark:text-slate-100 text-xs font-bold block leading-none">
                    Abdulwahab Wandera
                  </span>
                  <span className="text-slate-400 dark:text-slate-500 text-[9px] block uppercase font-bold font-mono tracking-wider mt-1">
                    SaaS Admin Account
                  </span>
                </div>
                <div className="w-9 h-9 rounded-xl bg-slate-950 dark:bg-slate-850 text-slate-100 font-extrabold text-xs flex items-center justify-center border border-slate-800 dark:border-slate-700 shadow-sm select-none">
                  AW
                </div>
              </div>
            </div>
          </header>

          {/* Layout Content Body */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6 max-w-7xl w-full mx-auto">
            
            {/* Quick Summary Context Notification */}
            <div className="bg-slate-950 text-white rounded-2xl p-5 shadow-[0_4px_15px_rgba(15,23,42,0.05)] border border-slate-900 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div className="flex items-start gap-4 max-w-2xl">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center shrink-0 border border-emerald-500/10">
                  <Building2 className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white tracking-wider uppercase font-display">
                    {selectedProperty.type} Asset Portfolio Log — {selectedProperty.name}
                  </h4>
                  <p className="text-xs text-slate-300 mt-1 leading-relaxed font-light">
                    {selectedProperty.description}
                  </p>
                </div>
              </div>
              
              <button
                onClick={() => setIsAddModalOpen(true)}
                className="w-full md:w-auto bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-400 hover:to-teal-300 text-slate-950 font-bold text-xs uppercase tracking-wider py-2.5 px-5 rounded-xl shadow-lg focus:outline-none transition-all duration-200 shrink-0 flex items-center justify-center gap-1.5 cursor-pointer active:scale-95 animate-zoom-in"
              >
                <Plus className="w-4 h-4" />
                <span>Add Cost Entry</span>
              </button>
            </div>

            {/* TAB VIEWS */}
            {activeTab === "dashboard" && (
              <ExecutiveDashboard
                selectedProperty={selectedProperty}
                selectedPropertyId={selectedPropertyId}
                calculations={calculations}
                svgChartPaths={svgChartPaths}
                activeInsights={activeInsights}
                filteredTasks={filteredTasks}
                searchQuery={searchQuery}
                setSearchQuery={setSearchQuery}
                phaseFilter={phaseFilter}
                setPhaseFilter={setPhaseFilter}
                handleOpenMpesa={handleOpenMpesa}
                setActiveTab={setActiveTab}
                triggerToast={triggerToast}
              />
            )}

            {activeTab === "ledger" && (
              <CostLedger
                filteredLedgerEntries={filteredLedgerEntries}
                searchQuery={searchQuery}
                setSearchQuery={setSearchQuery}
                phaseFilter={phaseFilter}
                setPhaseFilter={setPhaseFilter}
              />
            )}

            {activeTab === "vendors" && (
              <VendorCenter triggerToast={triggerToast} />
            )}

            {/* EDUCATION FOOTER OUTLINE ON TOTAL COST OF OWNERSHIP */}
            <footer className="bg-white rounded-2xl p-6 border border-slate-200/60 text-xs text-slate-500 space-y-3 leading-relaxed shadow-[0_1px_4px_rgba(0,0,0,0.01)] font-sans">
              <h4 className="font-bold text-slate-900 flex items-center gap-1.5 font-display">
                <Building2 className="w-4.5 h-4.5 text-slate-700" />
                <span>About the Building Lifecycle Cost Tracking System (BLCTS)</span>
              </h4>
              <p className="font-light">
                In Nairobi, Mombasa, and growing Kenyan municipalities, developers often succumb to the <strong>&quot;first-cost bias&quot;</strong>: evaluating structural components solely by their initial design invoices instead of forecasting 25-year cumulative durability limits. This leads to cheap roofing being purchased that fails in wet seasons, or poor-efficiency HVAC compressors inflating commercial power bills with inductive load charges from Kenya Power.
              </p>
              <p className="font-light">
                <strong>BLCTS</strong> corrects this by visualizing the true <strong>Total Cost of Ownership (TCO)</strong>. It aggregates actual construction outlays with utility bills, and automates prompt contractor payout flows over a secure sandbox environment simulating mobile money disbursement.
              </p>
            </footer>

          </div>
        </main>
      </div>

      {/* MODAL WINDOWS */}
      <AddCostModal
        isAddModalOpen={isAddModalOpen}
        setIsAddModalOpen={setIsAddModalOpen}
        newEntry={newEntry}
        setNewEntry={setNewEntry}
        handleAddSubmit={handleAddSubmit}
        formError={formError}
      />

      <MpesaPaymentModal
        isMpesaModalOpen={isMpesaModalOpen}
        setIsMpesaModalOpen={setIsMpesaModalOpen}
        activeMpesaTask={activeMpesaTask}
        mpesaPhone={mpesaPhone}
        setMpesaPhone={setMpesaPhone}
        mpesaStep={mpesaStep}
        mpesaTransactionId={mpesaTransactionId}
        handleInitiateMpesa={handleInitiateMpesa}
        handleCloseMpesaSuccess={handleCloseMpesaSuccess}
      />

    </div>
  );
}
