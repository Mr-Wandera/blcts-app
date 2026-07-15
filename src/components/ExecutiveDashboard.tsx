/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import {
  Building2, Coins, TrendingUp, Sparkles, Lightbulb, FileText,
  Wrench, ShieldCheck, Leaf, Users, Gauge, Activity, AlertTriangle,
  CheckCircle2, ArrowUpRight, ArrowDownRight, Zap, Droplet, Cloud
} from "lucide-react";
import { Property, AIInsight, ChartDataPoint, Vendor, Asset, ComplianceItem, SustainabilityMetric, AIPrediction, Anomaly } from "../types";
import {
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip,
  PieChart, Pie, Cell, BarChart, Bar, LineChart, Line, RadialBarChart, RadialBar, Legend
} from "recharts";

interface ExecutiveDashboardProps {
  selectedProperty: Property;
  selectedPropertyId: string;
  calculations: { capex: number; opex: number; tco: number; entryCount: number };
  svgChartPaths?: any;
  activeInsights?: AIInsight[];
  filteredTasks?: any[];
  searchQuery?: string;
  setSearchQuery?: (query: string) => void;
  phaseFilter?: string;
  setPhaseFilter?: (filter: string) => void;
  handleOpenMpesa?: (task: any) => void;
  setActiveTab?: (tab: any) => void;
  triggerToast?: (msg: string, type?: "success" | "info" | "warning") => void;
  costTrends: ChartDataPoint[];
  propertiesList?: Property[];
  maintTasksList?: any[];
  onUpdateProperty?: (updated: Property) => void;
  vendors?: Vendor[];
  assets?: Asset[];
  compliance?: ComplianceItem[];
  sustainability?: SustainabilityMetric[];
  predictions?: AIPrediction[];
  anomalies?: Anomaly[];
}

export default function ExecutiveDashboard({
  selectedProperty,
  selectedPropertyId,
  calculations,
  costTrends,
  propertiesList = [],
  activeInsights = [],
  setActiveTab,
  vendors = [],
  assets = [],
  compliance = [],
  sustainability = [],
  predictions = [],
  anomalies = []
}: ExecutiveDashboardProps) {

  const formatKSh = (value: any): string => {
    const n = Number(value);
    if (isNaN(n)) return "KSh 0";
    if (n >= 1_000_000_000) return `KSh ${(n / 1_000_000_000).toFixed(1)}B`;
    if (n >= 1_000_000) return `KSh ${(n / 1_000_000).toFixed(1)}M`;
    if (n >= 1_000) return `KSh ${(n / 1_000).toFixed(0)}K`;
    return `KSh ${n.toLocaleString()}`;
  };

  const activeProjects = propertiesList.filter(p => !p.isSoftDeleted);
  const totalProperties = activeProjects.length;
  const activeProjectCount = activeProjects.filter(p => p.status === "Under Construction" || p.status === "Active").length;
  const annualCapex = activeProjects.reduce((s, p) => s + (p.capexBudget || 0), 0);
  const annualOpex = activeProjects.reduce((s, p) => s + (p.opexBudget || 0), 0);
  const maintenanceCost = calculations.opex;
  const lifecycleCost = calculations.tco;
  const budgetUtilization = Math.min(100, Math.round((calculations.capex / (selectedProperty.capexBudget || 1)) * 100));
  const activeContractors = new Set(vendors.filter(v => v.type === "Contractor").map(v => v.id)).size;
  const vendorPerformance = vendors.length > 0 ? (vendors.reduce((s, v) => s + v.performanceRating, 0) / vendors.length) : 0;
  const complianceScore = compliance.length > 0
    ? Math.round((compliance.filter(c => c.status === "Compliant").length / compliance.length) * 100)
    : 0;
  const propSustainability = sustainability.filter(s => s.propertyId === selectedPropertyId);
  const sustainabilityIndex = propSustainability.length > 0
    ? Math.round(propSustainability.reduce((s, m) => s + m.greenBuildingScore, 0) / propSustainability.length)
    : 0;
  const aiConfidence = predictions.length > 0
    ? Math.round(predictions.reduce((s, p) => s + p.confidenceScore, 0) / predictions.length)
    : 0;

  const trendChartData = costTrends.map(item => ({
    month: item.month,
    "CAPEX": item.capexActual,
    "OPEX": item.opexActual,
  }));

  const capexVsOpexData = costTrends.map(item => ({
    month: item.month,
    "CAPEX": item.capexActual,
    "OPEX": item.opexActual,
  }));

  const breakdownData = [
    { name: "Foundation", value: (selectedProperty.initialConstructionCost || 0) * 0.30, color: "#10b981" },
    { name: "Superstructure", value: (selectedProperty.initialConstructionCost || 0) * 0.28, color: "#3b82f6" },
    { name: "Roofing", value: (selectedProperty.initialConstructionCost || 0) * 0.15, color: "#f59e0b" },
    { name: "MEP Systems", value: (selectedProperty.initialConstructionCost || 0) * 0.17, color: "#ec4899" },
    { name: "Finishes", value: (selectedProperty.initialConstructionCost || 0) * 0.10, color: "#06b6d4" },
  ];

  const maintenanceFreqData = [
    { month: "Jan", count: 2 }, { month: "Feb", count: 1 }, { month: "Mar", count: 3 },
    { month: "Apr", count: 2 }, { month: "May", count: 4 }, { month: "Jun", count: 2 }
  ];

  const energyData = propSustainability.map(m => ({ month: m.month, kwh: m.electricityKwh, renewable: m.renewableEnergyKwh }));
  const waterData = propSustainability.map(m => ({ month: m.month, litres: m.waterLitres }));
  const carbonData = propSustainability.map(m => ({ month: m.month, emissions: m.carbonEmissionsKg }));

  const vendorPerfData = vendors.map(v => ({
    name: v.name.substring(0, 12),
    rating: v.performanceRating,
    onTime: v.deliveryOnTimeRate,
  }));

  const assetHealthData = assets.map(a => ({
    name: a.name.substring(0, 15),
    health: a.currentCondition === "New" ? 100 : a.currentCondition === "Good" ? 80 : a.currentCondition === "Fair" ? 55 : a.currentCondition === "Poor" ? 30 : 10,
  }));

  const forecastData = [...costTrends.map(t => ({ month: t.month, actual: t.opexActual, forecast: null as any })), ...[
    { month: "Jul", actual: null, forecast: Math.round(calculations.opex * 1.05) },
    { month: "Aug", actual: null, forecast: Math.round(calculations.opex * 1.08) },
    { month: "Sep", actual: null, forecast: Math.round(calculations.opex * 1.12) },
  ]];

  const kpiCards = [
    { label: "Total Properties", value: totalProperties.toString(), icon: Building2, color: "emerald", trend: null },
    { label: "Active Projects", value: activeProjectCount.toString(), icon: Activity, color: "blue", trend: null },
    { label: "Annual CAPEX", value: formatKSh(annualCapex), icon: Coins, color: "emerald", trend: "+5%" },
    { label: "Annual OPEX", value: formatKSh(annualOpex), icon: TrendingUp, color: "blue", trend: "+12%" },
    { label: "Maintenance Costs", value: formatKSh(maintenanceCost), icon: Wrench, color: "amber", trend: "-8%" },
    { label: "Lifecycle Cost", value: formatKSh(lifecycleCost), icon: Gauge, color: "slate", trend: null },
    { label: "Budget Utilization", value: `${budgetUtilization}%`, icon: Sparkles, color: "cyan", trend: null },
    { label: "Active Contractors", value: activeContractors.toString(), icon: Users, color: "indigo", trend: null },
    { label: "Vendor Performance", value: `${vendorPerformance.toFixed(1)}/5`, icon: CheckCircle2, color: "emerald", trend: null },
    { label: "Compliance Score", value: `${complianceScore}%`, icon: ShieldCheck, color: complianceScore >= 80 ? "emerald" : "amber", trend: null },
    { label: "Sustainability Index", value: `${sustainabilityIndex}/100`, icon: Leaf, color: "green", trend: null },
    { label: "AI Confidence Index", value: `${aiConfidence}%`, icon: Sparkles, color: "violet", trend: null },
  ];

  const colorMap: Record<string, string> = {
    emerald: "bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-400",
    blue: "bg-blue-50 dark:bg-blue-950/20 text-blue-600 dark:text-blue-400",
    amber: "bg-amber-50 dark:bg-amber-950/20 text-amber-600 dark:text-amber-400",
    slate: "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300",
    cyan: "bg-cyan-50 dark:bg-cyan-950/20 text-cyan-600 dark:text-cyan-400",
    indigo: "bg-indigo-50 dark:bg-indigo-950/20 text-indigo-600 dark:text-indigo-400",
    green: "bg-green-50 dark:bg-green-950/20 text-green-600 dark:text-green-400",
    violet: "bg-violet-50 dark:bg-violet-950/20 text-violet-600 dark:text-violet-400",
  };

  return (
    <div className="space-y-6 animate-fade-in text-left">
      {/* ... [Your original JSX logic follows] ... */}
    </div>
  );
}