import React, { useState, useMemo } from "react";
import { 
  Building,
  ShieldCheck,
  ChevronRight,
  ChevronLeft,
  FileText,
  AlertCircle,
  Sparkles,
  Save,
  CheckCircle,
  HelpCircle,
  Database,
  ArrowRight,
  RefreshCw,
  Clock
} from "lucide-react";
import { Property } from "../types";

interface AssetComplianceWizardProps {
  properties: Property[];
  selectedProperty: Property;
  onApplicationSubmit?: (appDetails: any) => void;
  triggerToast?: (msg: string, type?: "success" | "info" | "warning") => void;
  currentLanguage: "en" | "sw";
}

export default function AssetComplianceWizard({
  properties,
  selectedProperty,
  onApplicationSubmit,
  triggerToast,
  currentLanguage
}: AssetComplianceWizardProps) {
  const [step, setStep] = useState<number>(1);
  const [selectedPropId, setSelectedPropId] = useState<string>(selectedProperty.id);

  // Form Fields State
  const [firmName, setFirmName] = useState<string>("");
  const [employeeCount, setEmployeeCount] = useState<number>(15);
  const [buildingFloors, setBuildingFloors] = useState<number>(4);
  const [industrySector, setIndustrySector] = useState<string>("Commercial Office");
  const [waterDischargeType, setWaterDischargeType] = useState<string>("Sewerage Grid Connected");
  const [hasFireSprinklers, setHasFireSprinklers] = useState<boolean>(true);
  
  // Custom draft validation state
  const [draftStatus, setDraftStatus] = useState<"blank" | "saved" | "autosaved">("blank");
  const [loadingAutofill, setLoadingAutofill] = useState<boolean>(false);

  // Active custom selected property reference
  const activeSelectedProperty = useMemo(() => {
    return properties.find(p => p.id === selectedPropId) || selectedProperty;
  }, [properties, selectedPropId, selectedProperty]);

  // Determine standard Risk Classification based on Floors + Industry Sector + Property Type
  const riskAssessment = useMemo(() => {
    let score = 0;
    if (buildingFloors > 6) score += 3;
    else if (buildingFloors > 3) score += 2;
    else score += 1;

    if (activeSelectedProperty.type === "Commercial") score += 2;
    else if (activeSelectedProperty.type === "Mixed-Use") score += 3;
    else score += 1;

    if (employeeCount > 100) score += 2;

    const rating = score >= 6 ? "High Risk (Class III)" : score >= 4 ? "Medium Risk (Class II)" : "Low Risk (Class I)";
    const color = score >= 6 ? "text-rose-500 bg-rose-500/10 border-rose-500/20" : score >= 4 ? "text-amber-500 bg-amber-500/10 border-amber-500/20" : "text-emerald-500 bg-emerald-500/10 border-emerald-500/20";
    
    // Auto-calculate statutory licensing fees (KSh)
    const baselineFee = score >= 6 ? 120000 : score >= 4 ? 65000 : 25000;
    const computedFee = baselineFee + (buildingFloors * 5000) + (employeeCount * 250);

    return {
      rating,
      color,
      score,
      computedFee,
      requiresEIA: score >= 5, // Requires environmental approval
      requiresFireDrill: hasFireSprinklers ? "Optional Annual audit" : "Mandatory Immediate Audit Plan"
    };
  }, [buildingFloors, activeSelectedProperty, employeeCount, hasFireSprinklers]);

  // Handle auto-populations matching our standard property choice
  const triggerAutoFill = () => {
    setLoadingAutofill(true);
    setTimeout(() => {
      setFirmName(`${activeSelectedProperty.name} Multi-Tenant Syndicate`);
      setIndustrySector(activeSelectedProperty.type === "Commercial" ? "Commercial Real Estate" : activeSelectedProperty.type === "Mixed-Use" ? "Mixed Logistics & Retail" : "Residential Block");
      setBuildingFloors(activeSelectedProperty.id === "prop-1" ? 12 : activeSelectedProperty.id === "prop-2" ? 3 : 8);
      setEmployeeCount(activeSelectedProperty.id === "prop-1" ? 180 : activeSelectedProperty.id === "prop-2" ? 45 : 90);
      setDraftStatus("autosaved");
      setLoadingAutofill(false);
      if (triggerToast) {
        triggerToast("GDS Registry autofilled details from Property TCO metadata successfully", "success");
      }
    }, 600);
  };

  // Perform save template draft action
  const handleSaveDraft = () => {
    try {
      const draftObj = {
        firmName, selectedPropId, employeeCount, buildingFloors, industrySector, waterDischargeType, hasFireSprinklers
      };
      localStorage.setItem("gds_wizard_draft", JSON.stringify(draftObj));
      setDraftStatus("saved");
      if (triggerToast) {
        triggerToast("Permit application draft locked in Local Storage", "info");
      }
    } catch(e){}
  };

  const handleApply = () => {
    if (!firmName) {
      if (triggerToast) triggerToast("Validation Error: Please specify the Applicant / Business Entity title first", "warning");
      return;
    }
    
    // Dispatch submit
    if (onApplicationSubmit) {
      onApplicationSubmit({
        applicant: firmName,
        propertyIndex: selectedPropId,
        propertyName: activeSelectedProperty.name,
        risk: riskAssessment.rating,
        computedFee: riskAssessment.computedFee,
        floors: buildingFloors,
        hasFireSprinklers,
        date: new Date().toISOString().split('T')[0]
      });
    }

    setStep(4);
    if (triggerToast) {
      triggerToast(`License application logged successfully! Statutory Fee: KSh ${riskAssessment.computedFee.toLocaleString()}`, "success");
    }
  };

  const t = {
    en: {
      header: "Intelligent GDS Application Wizard",
      desc: "Contextual compliance filter: Auto-maps structural metrics to generate custom safety benchmarks and licensing options.",
      step1: "Select Asset Profile",
      step1_desc: "Choose from active real estate metadata",
      step2: "Specify Operations",
      step2_desc: "Occupancy load, staffing, and industry grids",
      step3: "Custom Verification & Review",
      step3_desc: "Simulate risk, fire safety, and fees auto-calculation",
      autofill: "Registry Auto-Fill",
      autofill_desc: "Import matching spatial structures from physical databases.",
      applicantLabel: "Business Entity Name / Applicant",
      applicantPlaceholder: "e.g., Kilimani Crest Management Consortium",
      floorsLabel: "Authorized Levels / Floors",
      employeeLabel: "Daily Occupant Load (Employees/Tenants)",
      fireLabel: "Equipped with Automated Dry-Riser Sprinkler Network?",
      industryLabel: "SaaS Industry Classification",
      riskLabel: "Dynamic Compliance Risk Matrix",
      feesLabel: "Statutory License Fee (KSh)",
      requiresEiaLabel: "NEMA EIA Certificate Status",
      fireAuditLabel: "Fire Marshall Audit Standing"
    },
    sw: {
      header: "Mchawi wa Maombi ya Akili (GDS)",
      desc: "Kichujio cha uzingatiaji wa muktadha: Huweka kiotomatiki vipimo vya muundo ili kutoa vigezo vya usalama maalum.",
      step1: "Chagua Profaili ya Jengo",
      step1_desc: "Chagua kutoka kwa data iliyopo ya mali",
      step2: "Bainisha Shughuli",
      step2_desc: "Idadi ya watu, viwango vya wafanyakazi na tasnia",
      step3: "Uhakiki Maalum na Mapitio",
      step3_desc: "Uvumbuzi wa hatari, usalama wa moto na ada",
      autofill: "Ujazaji Kiotomatiki wa Usajili",
      autofill_desc: "Ingiza miundo inayolingana kutoka vyanzo vya kijiografia kusanidi fomu",
      applicantLabel: "Jina la Chombo cha Biashara / Mwombaji",
      applicantPlaceholder: "mfano, Muungano wa Usimamizi wa Kilimani Crest",
      floorsLabel: "Idadi ya Sakafu zilizoidhinishwa",
      employeeLabel: "Idadi ya Wakazi wa Kila Siku (Wafanyakazi/Wapangaji)",
      fireLabel: "Je mfumo una bomba za dharura za sprinkler?",
      industryLabel: "Uainishaji wa Sekta (SaaS)",
      riskLabel: "Hatari ya Uzingatiaji wa Nguvu",
      feesLabel: "Ada ya Leseni ya Kisheria (KSh)",
      requiresEiaLabel: "Hali ya Cheti cha NEMA EIA",
      fireAuditLabel: "Hali ya Ukaguzi wa Kizimamoto"
    }
  }[currentLanguage];

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 rounded-2xl shadow-[0_2px_8px_-3px_rgba(0,0,0,0.03),0_1px_3px_-1px_rgba(0,0,0,0.02)]" id="unified-smart-application-wizard">
      
      {/* HEADER OVERVIEW BAR */}
      <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-left">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 bg-emerald-500/10 text-emerald-500 rounded-lg">
              <Building className="w-4 h-4 animate-pulse" />
            </span>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white tracking-wide font-display">
              {t.header}
            </h3>
          </div>
          <p className="text-[11px] text-slate-505 dark:text-slate-400 mt-1 max-w-xl leading-normal font-light">
            {t.desc}
          </p>
        </div>

        {/* Auto-fill Trigger Badge */}
        {step < 3 && (
          <button 
            onClick={triggerAutoFill}
            disabled={loadingAutofill}
            className="px-3 py-1.5 bg-gradient-to-r from-emerald-500/10 to-teal-500/10 hover:from-emerald-500/15 hover:to-teal-500/15 text-emerald-600 dark:text-teal-400 border border-emerald-500/20 rounded-xl text-[10px] font-bold cursor-pointer transition-all flex items-center gap-1 shrink-0 select-none disabled:opacity-50"
          >
            {loadingAutofill ? (
              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Sparkles className="w-3.5 h-3.5" />
            )}
            <span>{loadingAutofill ? "Syncing..." : t.autofill}</span>
          </button>
        )}
      </div>

      {/* CORE STEP MAPPER */}
      <div className="p-3 bg-slate-50 dark:bg-slate-950/40 border-b border-slate-100 dark:border-slate-900 grid grid-cols-3 gap-1 select-none text-left">
        {[
          { num: 1, title: t.step1, sub: t.step1_desc },
          { num: 2, title: t.step2, sub: t.step2_desc },
          { num: 3, title: t.step3, sub: t.step3_desc }
        ].map((s) => (
          <div 
            key={s.num}
            className={`p-2.5 rounded-xl border transition-all ${
              step === s.num
                ? "bg-white dark:bg-slate-900 border-teal-500/35 shadow-sm"
                : "border-transparent bg-transparent opacity-60"
            }`}
          >
            <div className="flex items-center gap-2">
              <span className={`w-4 h-4 rounded-full text-[9px] font-black flex items-center justify-center font-mono ${
                step === s.num ? "bg-teal-500 text-slate-950" : "bg-slate-205 dark:bg-slate-800 text-slate-405"
              }`}>
                {s.num}
              </span>
              <span className="text-[10px] font-bold text-slate-800 dark:text-slate-200 truncate">
                {s.title}
              </span>
            </div>
            <span className="text-[8px] text-slate-400 dark:text-slate-500 font-medium truncate block mt-0.5 ml-6">
              {s.sub}
            </span>
          </div>
        ))}
      </div>

      {/* STEP FORMS WRAPPERS */}
      <div className="p-6 text-left min-h-[220px]">
        {step === 1 && (
          <div className="space-y-4 animate-fade-in" id="wizard-step-1">
            <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
              Asset Base Selection
            </span>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {properties.map((p) => (
                <button
                  key={p.id}
                  onClick={() => setSelectedPropId(p.id)}
                  className={`p-4 rounded-xl border text-left flex flex-col justify-between transition-all cursor-pointer ${
                    selectedPropId === p.id
                      ? "bg-teal-500/5 dark:bg-slate-950 border-teal-500 text-slate-900 dark:text-white"
                      : "bg-white dark:bg-slate-900 border-slate-200/60 dark:border-slate-800/80 hover:border-slate-300 dark:hover:border-slate-700"
                  }`}
                >
                  <div>
                    <span className="text-[9px] font-mono font-bold bg-slate-100 dark:bg-slate-800 text-slate-500 border border-slate-200/40 px-2 py-0.5 rounded uppercase block w-max mb-2">
                      {p.type}
                    </span>
                    <strong className="text-xs font-black block leading-snug">
                      {p.name}
                    </strong>
                    <span className="text-[10px] text-slate-400 font-light block mt-1 truncate">
                      {p.location}
                    </span>
                  </div>

                  <div className="mt-4 flex items-center justify-between text-[10px] font-mono border-t border-slate-100 dark:border-slate-850 pt-2 shrink-0">
                    <span className="text-slate-400">Compliance Grade:</span>
                    <span className={`font-black uppercase ${
                      p.healthGrade === "A" ? "text-emerald-500" : p.healthGrade === "B" ? "text-teal-405" : "text-rose-500"
                    }`}>
                      {p.healthGrade}
                    </span>
                  </div>
                </button>
              ))}
            </div>

            <div className="space-y-2 mt-4 pt-4 border-t border-slate-100 dark:border-slate-850">
              <label className="text-xs font-bold text-slate-900 dark:text-white block font-sans">
                {t.applicantLabel}
              </label>
              <input
                type="text"
                value={firmName}
                onChange={(e) => setFirmName(e.target.value)}
                placeholder={t.applicantPlaceholder}
                className="w-full bg-slate-50 dark:bg-slate-950 text-xs px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-850 focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500 text-slate-900 dark:text-white"
              />
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 animate-fade-in" id="wizard-step-2">
            
            <div className="space-y-4">
              <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">
                Occupancy Specifications
              </span>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-800 dark:text-slate-200 flex justify-between">
                  <span>{t.floorsLabel}</span>
                  <span className="font-mono text-teal-400 font-black">{buildingFloors}</span>
                </label>
                <input
                  type="range"
                  min="1"
                  max="20"
                  value={buildingFloors}
                  onChange={(e) => setBuildingFloors(parseInt(e.target.value))}
                  className="w-full accent-teal-500 h-1.5 bg-slate-100 dark:bg-slate-850 rounded-lg cursor-pointer"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-800 dark:text-slate-200 flex justify-between">
                  <span>{t.employeeLabel}</span>
                  <span className="font-mono text-teal-400 font-black">{employeeCount}</span>
                </label>
                <input
                  type="range"
                  min="5"
                  max="500"
                  value={employeeCount}
                  onChange={(e) => setEmployeeCount(parseInt(e.target.value))}
                  className="w-full accent-teal-500 h-1.5 bg-slate-100 dark:bg-slate-850 rounded-lg cursor-pointer"
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-800 dark:text-slate-200 block">
                  {t.industryLabel}
                </label>
                <select
                  value={industrySector}
                  onChange={(e) => setIndustrySector(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-950 text-xs px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-850 text-slate-800 dark:text-white"
                >
                  <option value="Commercial Office">Commercial Multi-tenant Workspace</option>
                  <option value="Retail Outlet / Restaurant">Retail Outlets & Food services</option>
                  <option value="Medical Facility / Ward">Medical Center & Labs</option>
                  <option value="Heavy Warehouse / Logistics">Industrial Handling & Logistics</option>
                </select>
              </div>
            </div>

            <div className="space-y-4">
              <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">
                Zoning & Environmental Discharges
              </span>

              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-800 dark:text-slate-200 block">
                  Waste Water Drainage Protocol
                </label>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  {["Sewerage Grid Connected", "Central Greywater Recycler"].map((opt) => (
                    <button
                      key={opt}
                      onClick={() => setWaterDischargeType(opt)}
                      className={`p-2.5 rounded-xl border text-left transition-all ${
                        waterDischargeType === opt
                          ? "bg-teal-500/5 border-teal-400 text-teal-605 font-bold"
                          : "bg-slate-50 dark:bg-slate-950 border-slate-150 dark:border-slate-850 hover:border-slate-350"
                      }`}
                    >
                      {opt}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-800 dark:text-slate-200 block mb-1">
                  {t.fireLabel}
                </label>
                <div className="flex items-center gap-4">
                  <label className="relative inline-flex items-center cursor-pointer select-none">
                    <input 
                      type="checkbox" 
                      checked={hasFireSprinklers} 
                      onChange={(e) => setHasFireSprinklers(e.target.checked)} 
                      className="sr-only peer"
                    />
                    <div className="w-9 h-5 bg-slate-200 dark:bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-emerald-500" />
                    <span className="ms-3 text-xs text-slate-500 dark:text-slate-400 font-medium">
                      {hasFireSprinklers ? "Equipped (Recommended Compliance)" : "Not Equipped (Increases Risk Index)"}
                    </span>
                  </label>
                </div>
              </div>
            </div>

          </div>
        )}

        {step === 3 && (
          <div className="space-y-5 animate-fade-in" id="wizard-step-3">
            <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">
              Pre-Commit Risk Index Rating
            </span>

            <div className="bg-slate-50 dark:bg-slate-950/60 p-4 border border-slate-150 dark:border-slate-850 rounded-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5 text-left select-none">
              
              <div className="space-y-2">
                <span className="text-[9px] uppercase font-bold text-slate-500 block">
                  Calculated Risk Grade
                </span>
                <span className={`inline-flex px-3 py-1 rounded-xl text-xs font-black border tracking-wide font-mono uppercase ${riskAssessment.color}`}>
                  {riskAssessment.rating}
                </span>
                <p className="text-[11px] text-slate-455 font-light max-w-sm mt-1">
                  This risk score acts as a weighting factor to scale environmental check periods. Standard re-inspections run every 12 months.
                </p>
              </div>

              <div className="space-y-1 sm:text-right shrink-0">
                <span className="text-[9px] uppercase font-bold text-slate-400 block font-mono">
                  {t.feesLabel}
                </span>
                <div className="text-xl font-black font-mono text-teal-400">
                  KSh {riskAssessment.computedFee.toLocaleString()}
                </div>
                <span className="text-[9px] text-slate-400 font-medium block">
                  Computed dynamically based on parameters
                </span>
              </div>
            </div>

            {/* PROGRESSIVE REQUIREMENTS FLAGS */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div className="bg-slate-50 dark:bg-slate-950/40 p-3 rounded-xl border border-slate-100 dark:border-slate-850 space-y-1">
                <span className="text-[8px] uppercase font-bold text-slate-400 tracking-wider block">
                  {t.requiresEiaLabel}
                </span>
                {riskAssessment.requiresEIA ? (
                  <span className="text-[10px] font-bold text-rose-500 flex items-center gap-1">
                    ⚠️ Mandatory NEMA EIA Bond
                  </span>
                ) : (
                  <span className="text-[10px] font-bold text-emerald-500 flex items-center gap-1">
                    ✓ Simplified Certificate Eligible
                  </span>
                )}
                <p className="text-[9.5px] text-slate-400 leading-normal font-light">
                  Required because density score triggers scale limits.
                </p>
              </div>

              <div className="bg-slate-50 dark:bg-slate-950/40 p-3 rounded-xl border border-slate-100 dark:border-slate-850 space-y-1">
                <span className="text-[8px] uppercase font-bold text-slate-400 tracking-wider block">
                  {t.fireAuditLabel}
                </span>
                <span className={`text-[10px] font-bold flex items-center gap-1 ${
                  hasFireSprinklers ? "text-emerald-500" : "text-amber-500"
                }`}>
                  {riskAssessment.requiresFireDrill}
                </span>
                <p className="text-[9.5px] text-slate-400 leading-normal font-light">
                  Absence of structural sprinklers escalates Fire Marshal re-audits.
                </p>
              </div>

              <div className="bg-slate-50 dark:bg-slate-950/40 p-3 rounded-xl border border-slate-100 dark:border-slate-850 space-y-1">
                <span className="text-[8px] uppercase font-bold text-slate-400 tracking-wider block">
                  Annual Physical Re-Inspections
                </span>
                <span className="text-[10px] font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1">
                  ✓ Scheduled 12-Month Cycles
                </span>
                <p className="text-[9.5px] text-slate-400 leading-normal font-light">
                  Maintains structural integrity grades over property life cycles.
                </p>
              </div>
            </div>
          </div>
        )}

        {step === 4 && (
          <div className="p-8 text-center space-y-4 animate-fade-in" id="wizard-success">
            <div className="w-12 h-12 bg-emerald-500/10 text-emerald-500 rounded-full flex items-center justify-center mx-auto border border-emerald-500/20">
              <CheckCircle className="w-6 h-6 animate-bounce" />
            </div>
            <div className="space-y-1">
              <h4 className="text-sm font-black text-slate-900 dark:text-white font-display">
                Permit Pre-Submission Verification Successful
              </h4>
              <p className="text-[11.5px] text-slate-500 dark:text-slate-400 leading-relaxed max-w-md mx-auto font-light">
                Your compliance license registration has been generated as a digital draft. Next, clear the statutory fee of <strong className="text-teal-400">KSh {riskAssessment.computedFee.toLocaleString()}</strong> via our secure Daraja API channel.
              </p>
            </div>

            <div className="flex justify-center gap-2 pt-2">
              <button
                onClick={() => {
                  setStep(1);
                  setFirmName("");
                }}
                className="px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-655 dark:text-slate-200 font-bold rounded-xl text-xs transition-all cursor-pointer hover:bg-slate-200/50"
              >
                Apply for New Asset Permit
              </button>
            </div>
          </div>
        )}
      </div>

      {/* FOOTER ACTION BUTTONS CARDS */}
      {step < 4 && (
        <div className="p-4 bg-slate-50 dark:bg-slate-950/60 border-t border-slate-150 dark:border-slate-900 rounded-b-2xl flex items-center justify-between">
          <button
            onClick={() => setStep(prev => Math.max(1, prev - 1))}
            disabled={step === 1}
            className="px-3.5 py-2 bg-slate-200 dark:bg-slate-850 hover:bg-slate-250 dark:hover:bg-slate-800 disabled:opacity-40 text-slate-700 dark:text-slate-200 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>Back</span>
          </button>

          <div className="flex items-center gap-2 select-none">
            <button
              onClick={handleSaveDraft}
              className="px-3 py-2 text-slate-455 hover:text-slate-600 dark:hover:text-slate-200 transition-all cursor-pointer flex items-center gap-1"
              title="Save draft"
            >
              <Save className="w-4 h-4" />
              <span className="text-xs font-bold hidden sm:inline">
                {draftStatus === "saved" ? "Draft Saved" : draftStatus === "autosaved" ? "Autosaved" : "Save Draft"}
              </span>
            </button>

            {step < 3 ? (
              <button
                onClick={() => setStep(prev => Math.min(3, prev + 1))}
                className="px-4 py-2 bg-teal-555 hover:bg-teal-500 text-slate-950 font-black rounded-xl text-xs transition-all cursor-pointer flex items-center gap-1 shadow bg-teal-450"
              >
                <span>Continue</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                onClick={handleApply}
                className="px-5 py-2.5 bg-emerald-500 hover:bg-emerald-450 text-white font-black rounded-xl text-xs transition-all cursor-pointer flex items-center gap-1 shadow shadow-emerald-500/10 animate-pulse"
              >
                <ShieldCheck className="w-4 h-4" />
                <span>Submit & Pay License Fee</span>
              </button>
            )}
          </div>
        </div>
      )}

    </div>
  );
}
