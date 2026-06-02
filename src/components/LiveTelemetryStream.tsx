import React, { useState, useEffect, useRef } from "react";
import { 
  Activity, 
  Wifi, 
  WifiOff, 
  Play, 
  Pause, 
  RefreshCw, 
  Bolt, 
  Droplet, 
  Zap, 
  ArrowUp, 
  ArrowDown, 
  PlusCircle, 
  ShieldAlert, 
  TrendingUp,
  Cpu
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface LiveEvent {
  id: string;
  timestamp: string;
  source: string;
  message: string;
  status: "normal" | "warning" | "alert" | "info";
  metricValue?: string;
}

interface LiveTelemetryStreamProps {
  selectedPropertyId: string;
  propertyName: string;
  onAlertTriggered?: (title: string, desc: string, status: "warning" | "alert") => void;
}

const TEMPLATE_EVENTS: Record<string, Omit<LiveEvent, "id" | "timestamp">[]> = {
  "prop-1": [
    { source: "Solar Inverter", message: "Power draw balanced. Current output active at 18.4 kW.", status: "normal", metricValue: "18.4 kW" },
    { source: "Water Tank Sub-Sys", message: "NCWSC booster pump sweep finished. 92% capacity.", status: "normal", metricValue: "92%" },
    { source: "HVAC Controller", message: "Eco-mode cycle started in Block A. Speed throttled to 40%.", status: "info", metricValue: "40%" },
    { source: "Solar Battery", message: "Ambient temperature optimum: 24°C in storage cabinet.", status: "normal", metricValue: "24°C" },
    { source: "Water Treatment", message: "Water chlorination level balanced. pH factor 7.2.", status: "normal", metricValue: "7.2 pH" },
    { source: "Main Distribution Board", message: "Grid current stabilized. Phase tension offset < 1.5%.", status: "normal", metricValue: "<1.5%" }
  ],
  "prop-2": [
    { source: "Roof Thermal Guard", message: "Acoustic vibration threshold warning on economy roofing sheets.", status: "warning", metricValue: "78 Hz" },
    { source: "HVAC Inductive Load", message: "Excess power factor penalty recorded. VFD adjustment needed.", status: "warning", metricValue: "0.78 PF" },
    { source: "Water Flow Meter", message: "Unexpected 8L/min pressure leak detected in Block B subterranean valves.", status: "alert", metricValue: "8.0 L/m" },
    { source: "Sollatek Inverter", message: "Power grid brownout protection activated. Backed up by solar loop.", status: "info", metricValue: "Grid Fail" },
    { source: "Elevator Lift D", message: "Excessive operational wear on non-VFD ventilation relays.", status: "warning", metricValue: "Temp 48°C" }
  ],
  "prop-3": [
    { source: "Otis Lift B Sensor", message: "Sheave rotor acceleration spikes detected at 1.45 Hz.", status: "warning", metricValue: "1.45 Hz" },
    { source: "Water Booster Pump", message: "Peak hour suction flow pressure: 4.8 Bar.", status: "normal", metricValue: "4.8 Bar" },
    { source: "Smart LED Bus line", message: "Zone 3 illumination grid dimmed to 60% based on solar glare sensors.", status: "normal", metricValue: "60%" },
    { source: "HVAC Central Duct", message: "Intake volume flow rate stabilized in atrium.", status: "normal", metricValue: "410 CFM" },
    { source: "Otis Lift B System", message: "Diagnostic report: Brake clearance set to standard 0.3mm.", status: "info", metricValue: "0.3 mm" }
  ]
};

const EXTRA_ALERT_POOL = [
  { source: "KPLC Power Supply", message: "National grid voltage spike detected. Sollatek voltage guards active.", status: "info", metricValue: "254V" },
  { source: "Elevator Controls", message: "Emergency run test completed successfully for lift shafts.", status: "normal", metricValue: "100%" },
  { source: "Water Pump Mains", message: "Water inflow surge from NCWSC trunk lines. Diverting to backup storage.", status: "info", metricValue: "+12%" },
  { source: "HVAC Compressor", message: "Vibration reading exceeds standard. Self-lubrication injector cycle engaged.", status: "warning", metricValue: "4.2 G" },
  { source: "Solar Array B", message: "Sudden cloud shroud over Thika bypass reduces PV cell current yield by 15%.", status: "normal", metricValue: "-15%" }
];

export default function LiveTelemetryStream({ 
  selectedPropertyId, 
  propertyName,
  onAlertTriggered 
}: LiveTelemetryStreamProps) {
  const [isPlaying, setIsPlaying] = useState(true);
  const [events, setEvents] = useState<LiveEvent[]>([]);
  const [isDiagnosticRunning, setIsDiagnosticRunning] = useState(false);
  
  // Dynamic metrics
  const [meters, setMeters] = useState({
    solarYield: 15.2,
    waterPressure: 4.1,
    hvacPower: 8.4,
    liftVib: 0.85
  });

  const meterIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const eventIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Generate initial events when property changes
  useEffect(() => {
    const list = TEMPLATE_EVENTS[selectedPropertyId] || TEMPLATE_EVENTS["prop-1"];
    const now = new Date();
    const formatted = list.map((item, index) => {
      const timeOffset = new Date(now.getTime() - index * 45000);
      return {
        ...item,
        id: `event-${selectedPropertyId}-${index}-${timeOffset.getTime()}`,
        timestamp: timeOffset.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" })
      };
    });
    setEvents(formatted);

    // Set initial baseline meters
    if (selectedPropertyId === "prop-1") {
      setMeters({ solarYield: 24.5, waterPressure: 4.4, hvacPower: 3.2, liftVib: 0.12 });
    } else if (selectedPropertyId === "prop-2") {
      setMeters({ solarYield: 4.8, waterPressure: 2.1, hvacPower: 14.8, liftVib: 1.15 });
    } else {
      setMeters({ solarYield: 16.2, waterPressure: 3.8, hvacPower: 7.9, liftVib: 0.35 });
    }
  }, [selectedPropertyId]);

  // Handle live fluctuations and scheduled events
  useEffect(() => {
    if (!isPlaying) {
      if (meterIntervalRef.current) clearInterval(meterIntervalRef.current);
      if (eventIntervalRef.current) clearInterval(eventIntervalRef.current);
      return;
    }

    // Tapping interval to wobble meters beautifully
    meterIntervalRef.current = setInterval(() => {
      setMeters(prev => {
        const delta = (Math.random() - 0.5) * 0.4;
        const deltaPressure = (Math.random() - 0.5) * 0.15;
        const deltaHvac = (Math.random() - 0.5) * 0.3;
        const deltaVib = (Math.random() - 0.5) * 0.05;

        let baseSolar = prev.solarYield + delta;
        if (baseSolar < 0) baseSolar = 0;
        let basePress = prev.waterPressure + deltaPressure;
        if (basePress < 0.5) basePress = 0.5;
        let baseHvac = prev.hvacPower + deltaHvac;
        if (baseHvac < 1.0) baseHvac = 1.0;
        let baseVib = Math.max(0.01, prev.liftVib + deltaVib);

        return {
          solarYield: parseFloat(baseSolar.toFixed(1)),
          waterPressure: parseFloat(basePress.toFixed(2)),
          hvacPower: parseFloat(baseHvac.toFixed(1)),
          liftVib: parseFloat(baseVib.toFixed(2))
        };
      });
    }, 1500);

    // Feed logs periodically
    eventIntervalRef.current = setInterval(() => {
      const pool = TEMPLATE_EVENTS[selectedPropertyId] || TEMPLATE_EVENTS["prop-1"];
      const combinedPool = [...pool, ...EXTRA_ALERT_POOL];
      const randomIndex = Math.floor(Math.random() * combinedPool.length);
      const chosenTemplate = combinedPool[randomIndex];

      const newEvent: LiveEvent = {
        id: `live-event-${Date.now()}`,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" }),
        source: chosenTemplate.source,
        message: chosenTemplate.message,
        status: chosenTemplate.status as "info" | "warning" | "alert" | "normal",
        metricValue: chosenTemplate.metricValue
      };

      setEvents(prev => [newEvent, ...prev.slice(0, 15)]);

      // Propagate alert up if it is critical or warning
      if (newEvent.status === "alert" || newEvent.status === "warning") {
        if (onAlertTriggered) {
          onAlertTriggered(
            `Live IoT: ${newEvent.source}`,
            newEvent.message,
            newEvent.status as any
          );
        }
      }
    }, 6000);

    return () => {
      if (meterIntervalRef.current) clearInterval(meterIntervalRef.current);
      if (eventIntervalRef.current) clearInterval(eventIntervalRef.current);
    };
  }, [isPlaying, selectedPropertyId, onAlertTriggered]);

  const triggerDiagnosticSweep = () => {
    if (isDiagnosticRunning) return;
    setIsDiagnosticRunning(true);

    const checkEvent: LiveEvent = {
      id: `diag-event-${Date.now()}`,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" }),
      source: "BLCTS Diagnostic Core",
      message: "Initiated deep building thermal sweep and active current power-load diagnostics...",
      status: "info",
      metricValue: "Scanning"
    };
    setEvents(prev => [checkEvent, ...prev]);

    setTimeout(() => {
      const successEvent: LiveEvent = {
        id: `diag-success-${Date.now()}`,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" }),
        source: "BLCTS Diagnostic Core",
        message: `Diagnostic sweep completed for ${propertyName}. All loop systems report optimal impedance.`,
        status: "normal",
        metricValue: "Optimal"
      };
      setEvents(prev => [successEvent, ...prev]);
      setIsDiagnosticRunning(false);

      if (onAlertTriggered) {
        onAlertTriggered("Diagnostic Sweep", "Asset sensors verified successfully! Full health is stable.", "warning");
      }
    }, 3000);
  };

  const manuallyTriggerAnomaly = () => {
    const customAnomalies = [
      { source: "Main Grid Breaker", message: "Harmonic distortion levels exceeding 8% on commercial transformers.", status: "alert", metricValue: ">8.0%" },
      { source: "Water Main Pipe", message: "Water hammer pressure spike detected on local branch supply lines.", status: "warning", metricValue: "6.2 Bar" },
      { source: "HVAC Coolant Loop", message: "Compressor B refrigerant compression drop detected. Possible leakage.", status: "alert", metricValue: "22 PSI" }
    ];
    const item = customAnomalies[Math.floor(Math.random() * customAnomalies.length)];

    const customEvent: LiveEvent = {
      id: `manual-event-${Date.now()}`,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" }),
      source: item.source,
      message: item.message,
      status: item.status as any,
      metricValue: item.metricValue
    };

    setEvents(prev => [customEvent, ...prev]);

    if (onAlertTriggered) {
      onAlertTriggered(
        `Critical Edge Alert: ${customEvent.source}`,
        customEvent.message,
        customEvent.status as any
      );
    }
  };

  return (
    <div className="bg-slate-950 text-slate-105 border border-slate-900 rounded-3xl p-5 shadow-[0_10px_35px_-8px_rgba(0,0,0,0.5)] flex flex-col space-y-5">
      {/* Dynamic Header console toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-900 pb-3.5">
        <div className="flex items-center gap-3">
          <div className="relative">
            <span className="absolute -top-1 -right-1 flex h-3 w-3">
              <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${isPlaying ? "bg-emerald-400" : "bg-amber-400"}`}></span>
              <span className={`relative inline-flex rounded-full h-3 w-3 ${isPlaying ? "bg-emerald-500" : "bg-amber-500"}`}></span>
            </span>
            <div className="bg-slate-900 p-2.5 rounded-2xl border border-slate-800 text-slate-300">
              <Cpu className={`w-5 h-5 ${isPlaying ? "animate-spin-slow" : ""}`} />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-xs uppercase font-extrabold text-slate-400 tracking-widest font-display leading-none">
                Live IoT Telemetry Core
              </h3>
              <span className="text-[8px] uppercase px-1.5 py-0.5 font-bold tracking-wider rounded bg-slate-900 text-emerald-400 border border-slate-800">
                ACTIVE
              </span>
            </div>
            <p className="text-[10.5px] text-slate-500 font-light mt-1">
              Live building state loops & active energy sensor readings
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 select-none self-end sm:self-auto">
          <button
            onClick={() => setIsPlaying(!isPlaying)}
            className={`p-1.5 rounded-xl border text-[10px] font-bold tracking-wider uppercase transition-all flex items-center gap-1.5 cursor-pointer max-h-8 ${
              isPlaying
                ? "bg-slate-900 hover:bg-slate-850 text-slate-350 border-slate-800"
                : "bg-emerald-600 hover:bg-emerald-500 text-white border-transparent"
            }`}
          >
            {isPlaying ? (
              <>
                <Pause className="w-3.5 h-3.5 text-slate-400" />
                <span>Pause</span>
              </>
            ) : (
              <>
                <Play className="w-3.5 h-3.5" />
                <span>Resume Live</span>
              </>
            )}
          </button>

          <button
            disabled={isDiagnosticRunning}
            onClick={triggerDiagnosticSweep}
            className={`p-1.5 rounded-xl border border-slate-800 hover:border-slate-700 bg-slate-900 text-slate-350 hover:text-white text-[10px] font-bold tracking-wider uppercase transition-all flex items-center gap-1.5 cursor-pointer max-h-8 ${
              isDiagnosticRunning ? "opacity-40 cursor-not-allowed" : ""
            }`}
          >
            <RefreshCw className={`w-3.5 h-3.5 text-teal-400 ${isDiagnosticRunning ? "animate-spin" : ""}`} />
            <span>{isDiagnosticRunning ? "Scanning..." : "Sweep"}</span>
          </button>

          <button
            onClick={manuallyTriggerAnomaly}
            className="p-1.5 rounded-xl bg-rose-600/10 hover:bg-rose-600/20 text-rose-400 hover:text-rose-300 border border-rose-950 hover:border-rose-900 text-[10px] font-bold tracking-wider uppercase transition-all flex items-center gap-1.5 cursor-pointer max-h-8"
            title="Inject Mock Anomaly Event"
          >
            <PlusCircle className="w-3.5 h-3.5 shrink-0" />
            <span>Alert Injection</span>
          </button>
        </div>
      </div>

      {/* METRIC GAUGES - GRID LAYOUT */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {/* Metric 1: Solar yield */}
        <div className="bg-slate-950 rounded-2xl p-4 border border-slate-900/80 flex flex-col justify-between">
          <div className="flex items-center justify-between text-[10px] text-slate-400 font-medium">
            <span className="flex items-center gap-1.5">
              <Bolt className="w-3.5 h-3.5 text-amber-500" />
              <span>Solar System Generation</span>
            </span>
            {selectedPropertyId !== "prop-2" ? (
              <span className="text-emerald-500 font-mono flex items-center gap-0.5"><ArrowUp className="w-2.5 h-2.5" /> Normal</span>
            ) : (
              <span className="text-amber-500 font-mono">Dull</span>
            )}
          </div>
          <div className="my-2 flex items-baseline gap-1.5">
            <span className="text-2xl font-black font-mono text-white tracking-tight">
              {meters.solarYield}
            </span>
            <span className="text-xs text-slate-400 font-mono font-medium">kW</span>
          </div>
          <div className="space-y-1">
            <div className="h-1 bg-slate-900 rounded-full overflow-hidden">
              <div 
                className="h-full bg-amber-500 rounded-full transition-all duration-500" 
                style={{ width: `${Math.min(100, (meters.solarYield / 35) * 100)}%` }}
              />
            </div>
            <span className="text-[9px] text-slate-500 block">Peak yield cap: 35 kW</span>
          </div>
        </div>

        {/* Metric 2: Grid and HVAC Draw */}
        <div className="bg-slate-950 rounded-2xl p-4 border border-slate-900/80 flex flex-col justify-between">
          <div className="flex items-center justify-between text-[10px] text-slate-400 font-medium">
            <span className="flex items-center gap-1.5">
              <Zap className="w-3.5 h-3.5 text-sky-400" />
              <span>HVAC Load draw</span>
            </span>
            {meters.hvacPower > 10 ? (
              <span className="text-rose-500 font-mono animate-pulse flex items-center gap-0.5"><ArrowUp className="w-2.5 h-2.5" /> High</span>
            ) : (
              <span className="text-emerald-500 font-mono flex items-center gap-0.5"><ArrowDown className="w-2.5 h-2.5" /> Stable</span>
            )}
          </div>
          <div className="my-2 flex items-baseline gap-1.5">
            <span className="text-2xl font-black font-mono text-white tracking-tight">
              {meters.hvacPower}
            </span>
            <span className="text-xs text-slate-400 font-mono font-medium">kW</span>
          </div>
          <div className="space-y-1">
            <div className="h-1 bg-slate-900 rounded-full overflow-hidden">
              <div 
                className={`h-full rounded-full transition-all duration-500 ${meters.hvacPower > 10 ? "bg-rose-500" : "bg-sky-400"}`} 
                style={{ width: `${Math.min(100, (meters.hvacPower / 20) * 100)}%` }}
              />
            </div>
            <span className="text-[9px] text-slate-500 block">Overcapacity zone: &gt;12 kW</span>
          </div>
        </div>

        {/* Metric 3: Water system pressure */}
        <div className="bg-slate-950 rounded-2xl p-4 border border-slate-900/80 flex flex-col justify-between">
          <div className="flex items-center justify-between text-[10px] text-slate-400 font-medium">
            <span className="flex items-center gap-1.5">
              <Droplet className="w-3.5 h-3.5 text-teal-400" />
              <span>Pump pressure</span>
            </span>
            {meters.waterPressure < 2.5 ? (
              <span className="text-amber-500 font-mono flex items-center gap-0.5"><ArrowDown className="w-2.5 h-2.5" /> Low Leak</span>
            ) : (
              <span className="text-emerald-500 font-mono">Stable</span>
            )}
          </div>
          <div className="my-2 flex items-baseline gap-1.5">
            <span className="text-2xl font-black font-mono text-white tracking-tight">
              {meters.waterPressure}
            </span>
            <span className="text-xs text-slate-400 font-mono font-medium">Bar</span>
          </div>
          <div className="space-y-1">
            <div className="h-1 bg-slate-900 rounded-full overflow-hidden">
              <div 
                className={`h-full rounded-full transition-all duration-500 ${meters.waterPressure < 2.5 ? "bg-amber-500" : "bg-teal-400"}`} 
                style={{ width: `${(meters.waterPressure / 6) * 100}%` }}
              />
            </div>
            <span className="text-[9px] text-slate-500 block">Safety margins: 3.0 - 5.0 Bar</span>
          </div>
        </div>

        {/* Metric 4: Lift / Elevator vibration */}
        <div className="bg-slate-950 rounded-2xl p-4 border border-slate-900/80 flex flex-col justify-between">
          <div className="flex items-center justify-between text-[10px] text-slate-400 font-medium">
            <span className="flex items-center gap-1.5">
              <Activity className="w-3.5 h-3.5 text-emerald-400" />
              <span>Shaft Rotor Vib</span>
            </span>
            {meters.liftVib > 1.0 ? (
              <span className="text-rose-500 font-mono flex items-center gap-0.5"><ArrowUp className="w-2.5 h-2.5 animate-bounce" /> Fault</span>
            ) : (
              <span className="text-emerald-500 font-mono font-bold">Good</span>
            )}
          </div>
          <div className="my-2 flex items-baseline gap-1.5">
            <span className="text-2xl font-black font-mono text-white tracking-tight">
              {meters.liftVib}
            </span>
            <span className="text-xs text-slate-400 font-mono font-medium">Hz</span>
          </div>
          <div className="space-y-1">
            <div className="h-1 bg-slate-900 rounded-full overflow-hidden">
              <div 
                className={`h-full rounded-full transition-all duration-500 ${meters.liftVib > 1.0 ? "bg-rose-500" : "bg-emerald-400"}`} 
                style={{ width: `${Math.min(100, (meters.liftVib / 1.8) * 100)}%` }}
              />
            </div>
            <span className="text-[9px] text-slate-500 block">Anomaly threshold: &gt;1.00 Hz</span>
          </div>
        </div>
      </div>

      {/* TELEMETRY ACTIVITY BROADCAST STREAM LOG -- SLIDE SHEET */}
      <div className="space-y-2">
        <span className="text-[9px] uppercase font-bold text-slate-500 tracking-wider block font-display">
          Active IoT Telemetry Feed
        </span>
        <div className="bg-slate-900/50 rounded-2xl border border-slate-900 p-3 h-56 overflow-y-auto space-y-2 relative scroller-thin">
          <AnimatePresence initial={false}>
            {events.map((evt) => (
              <motion.div
                key={evt.id}
                initial={{ opacity: 0, y: -20, height: 0 }}
                animate={{ opacity: 1, y: 0, height: "auto" }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.3, ease: "easeOut" }}
                className="overflow-hidden"
              >
                <div className={`p-2.5 rounded-xl border text-[11px] flex items-start gap-3 transition-colors ${
                  evt.status === "alert" 
                    ? "bg-rose-950/20 border-rose-900/40 text-rose-100" 
                    : evt.status === "warning"
                    ? "bg-amber-950/20 border-amber-900/40 text-amber-100"
                    : evt.status === "info"
                    ? "bg-sky-950/15 border-sky-900/30 text-sky-100"
                    : "bg-slate-950/40 border-slate-900/60 text-slate-300"
                }`}>
                  <span className="text-[9.5px] font-mono text-slate-500 shrink-0 select-none bg-slate-900 px-1.5 py-0.5 rounded border border-slate-800 self-center">
                    {evt.timestamp}
                  </span>
                  
                  <div className="flex-1 min-w-0 pr-2">
                    <span className="font-extrabold text-slate-205 mr-1 font-display">
                      [{evt.source}]
                    </span>
                    <span className="font-light leading-relaxed">
                      {evt.message}
                    </span>
                  </div>

                  {evt.metricValue && (
                    <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-lg border shrink-0 hidden sm:inline-block ${
                      evt.status === "alert"
                        ? "bg-rose-905/30 border-rose-800 text-rose-200"
                        : evt.status === "warning"
                        ? "bg-amber-905/30 border-amber-800 text-amber-200"
                        : evt.status === "info"
                        ? "bg-sky-905/30 border-sky-850 text-sky-200"
                        : "bg-slate-900 border-slate-800 text-slate-200"
                    }`}>
                      {evt.metricValue}
                    </span>
                  )}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>

          {events.length === 0 && (
            <p className="text-xs text-slate-550 italic text-center py-10 font-sans">
              No live telemetry feed available. Resume core stream listener to connect...
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
