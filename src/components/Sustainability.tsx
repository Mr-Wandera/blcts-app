import React, { useMemo, useState } from "react";
import {
  Leaf, Zap, Droplets, CloudOff, Sun, Building2, TrendingUp,
  ArrowUpDown, ChevronDown, Filter, Activity, Recycle
} from "lucide-react";
import { SustainabilityMetric } from "../types";
import {
  ResponsiveContainer, BarChart, Bar, AreaChart, Area, LineChart,
  Line, RadialBarChart, RadialBar, PolarAngleAxis, XAxis, YAxis,
  CartesianGrid, Tooltip, Legend
} from "recharts";

interface SustainabilityProps {
  sustainability: SustainabilityMetric[];
  selectedPropertyId: string;
  triggerToast: (msg: string, type?: "success" | "info" | "warning") => void;
}

const formatNumber = (value: number): string => {
  const n = Number(value);
  if (isNaN(n)) return "0";
  if (Math.abs(n) >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (Math.abs(n) >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return n.toLocaleString();
};

const tooltipStyle = {
  fontSize: "11px",
  borderRadius: "8px",
  backgroundColor: "rgba(15,23,42,0.95)",
  border: "1px solid rgba(148,163,184,0.2)",
  color: "#f1f5f9",
};

export default function Sustainability({
  sustainability,
  selectedPropertyId,
  triggerToast,
}: SustainabilityProps) {
  const [sortKey, setSortKey] = useState<keyof SustainabilityMetric | "none">("none");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");

  // Filter to the selected property
  const propMetrics = useMemo(
    () => sustainability.filter((m) => m.propertyId === selectedPropertyId),
    [sustainability, selectedPropertyId]
  );

  // Sort by month chronologically for charts
  const chronological = useMemo(
    () => [...propMetrics].sort((a, b) => a.month.localeCompare(b.month)),
    [propMetrics]
  );

  // KPI calculations
  const count = chronological.length;
  const avgElectricity =
    count > 0
      ? Math.round(
          chronological.reduce((s, m) => s + m.electricityKwh, 0) / count
        )
      : 0;
  const avgWater =
    count > 0
      ? Math.round(
          chronological.reduce((s, m) => s + m.waterLitres, 0) / count
        )
      : 0;
  const totalCarbon = Math.round(
    chronological.reduce((s, m) => s + m.carbonEmissionsKg, 0)
  );
  const totalRenewable = chronological.reduce(
    (s, m) => s + m.renewableEnergyKwh,
    0
  );
  const totalEnergy = totalRenewable + chronological.reduce(
    (s, m) => s + m.electricityKwh,
    0
  );
  const renewablePct =
    totalEnergy > 0 ? Math.round((totalRenewable / totalEnergy) * 100) : 0;
  const avgGreenScore =
    count > 0
      ? Math.round(
          chronological.reduce((s, m) => s + m.greenBuildingScore, 0) / count
        )
      : 0;

  // Chart data
  const energyData = useMemo(
    () =>
      chronological.map((m) => ({
        month: m.month,
        Electricity: m.electricityKwh,
        Renewable: m.renewableEnergyKwh,
      })),
    [chronological]
  );

  const waterData = useMemo(
    () =>
      chronological.map((m) => ({
        month: m.month,
        Water: m.waterLitres,
      })),
    [chronological]
  );

  const carbonData = useMemo(
    () =>
      chronological.map((m) => ({
        month: m.month,
        Carbon: m.carbonEmissionsKg,
      })),
    [chronological]
  );

  const greenScoreData = useMemo(
    () =>
      chronological.map((m) => ({
        month: m.month,
        Score: m.greenBuildingScore,
        fill:
          m.greenBuildingScore >= 80
            ? "#10b981"
            : m.greenBuildingScore >= 60
            ? "#84cc16"
            : m.greenBuildingScore >= 40
            ? "#f59e0b"
            : "#ef4444",
      })),
    [chronological]
  );

  // Sorted table data
  const sortedMetrics = useMemo(() => {
    if (sortKey === "none") return chronological;
    const list = [...chronological];
    list.sort((a, b) => {
      const av = a[sortKey];
      const bv = b[sortKey];
      let cmp: number;
      if (typeof av === "number" && typeof bv === "number") {
        cmp = av - bv;
      } else {
        cmp = String(av).localeCompare(String(bv));
      }
      return sortDir === "asc" ? cmp : -cmp;
    });
    return list;
  }, [chronological, sortKey, sortDir]);

  const handleSort = (key: keyof SustainabilityMetric) => {
    if (sortKey === key) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDir("asc");
    }
  };

  const handleExport = () => {
    if (chronological.length === 0) {
      triggerToast("No sustainability data to export", "warning");
      return;
    }
    const headers = [
      "Month",
      "Electricity (kWh)",
      "Water (litres)",
      "Carbon (kg)",
      "Renewable (kWh)",
      "Waste (kg)",
      "Green Building Score",
    ];
    const rows = chronological.map((m) => [
      m.month,
      m.electricityKwh,
      m.waterLitres,
      m.carbonEmissionsKg,
      m.renewableEnergyKwh,
      m.wasteGeneratedKg,
      m.greenBuildingScore,
    ]);
    const csv = [headers, ...rows]
      .map((r) => r.map((c) => `"${c}"`).join(","))
      .join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `sustainability-${selectedPropertyId}.csv`;
    link.click();
    URL.revokeObjectURL(url);
    triggerToast("Sustainability data exported as CSV", "success");
  };

  const kpiCards = [
    {
      label: "Avg Electricity",
      value: `${formatNumber(avgElectricity)} kWh`,
      icon: Zap,
      color: "amber",
      hint: "Monthly average",
    },
    {
      label: "Avg Water",
      value: `${formatNumber(avgWater)} L`,
      icon: Droplets,
      color: "blue",
      hint: "Monthly average",
    },
    {
      label: "Total Carbon",
      value: `${formatNumber(totalCarbon)} kg`,
      icon: CloudOff,
      color: "slate",
      hint: "Cumulative CO₂",
    },
    {
      label: "Renewable Energy",
      value: `${renewablePct}%`,
      icon: Sun,
      color: "emerald",
      hint: "Of total energy",
    },
    {
      label: "Green Building Score",
      value: `${avgGreenScore}`,
      icon: Building2,
      color: "green",
      hint: "Average rating",
    },
  ];

  const colorMap: Record<string, string> = {
    amber: "bg-amber-50 dark:bg-amber-950/20 text-amber-600 dark:text-amber-400",
    blue: "bg-blue-50 dark:bg-blue-950/20 text-blue-600 dark:text-blue-400",
    slate: "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300",
    emerald:
      "bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-400",
    green: "bg-green-50 dark:bg-green-950/20 text-green-600 dark:text-green-400",
  };

  const scoreBadge = (score: number): string => {
    if (score >= 80)
      return "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20";
    if (score >= 60)
      return "bg-lime-500/10 text-lime-600 dark:text-lime-400 border-lime-500/20";
    if (score >= 40)
      return "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20";
    return "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20";
  };

  const tableColumns: { key: keyof SustainabilityMetric; label: string }[] = [
    { key: "month", label: "Month" },
    { key: "electricityKwh", label: "Electricity (kWh)" },
    { key: "waterLitres", label: "Water (L)" },
    { key: "carbonEmissionsKg", label: "Carbon (kg)" },
    { key: "renewableEnergyKwh", label: "Renewable (kWh)" },
    { key: "wasteGeneratedKg", label: "Waste (kg)" },
    { key: "greenBuildingScore", label: "Green Score" },
  ];

  return (
    <div className="space-y-6 animate-fade-in text-left">
      {/* Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 text-white shadow-lg">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
          <div className="flex items-center gap-2">
            <Leaf className="w-5 h-5 text-emerald-400" />
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-100">
              Sustainability &amp; Environmental Performance
            </h3>
          </div>
          <span className="text-[10px] bg-emerald-500/10 text-emerald-400 px-2.5 py-1 rounded-full font-mono font-bold uppercase tracking-wider border border-emerald-500/20">
            ESG Tracking
          </span>
        </div>
        <p className="text-xs text-slate-400 leading-relaxed">
          Monitor energy consumption, water usage, carbon emissions, and green
          building certifications across the property lifecycle to drive
          sustainable operations and regulatory compliance.
        </p>
      </div>

      {/* KPI Cards */}
      <section className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
        {kpiCards.map((kpi, i) => {
          const Icon = kpi.icon;
          return (
            <div
              key={i}
              className="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-slate-200/60 dark:border-slate-800 shadow-sm flex flex-col gap-2 hover:shadow-md transition-shadow"
            >
              <div className="flex items-center justify-between">
                <div className={`p-2.5 rounded-xl ${colorMap[kpi.color]}`}>
                  <Icon className="w-4.5 h-4.5" />
                </div>
              </div>
              <div>
                <span className="text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider block">
                  {kpi.label}
                </span>
                <span className="text-lg font-black tracking-tight text-slate-950 dark:text-white block font-mono mt-0.5">
                  {kpi.value}
                </span>
                <span className="text-[9px] text-slate-400 dark:text-slate-500 block mt-0.5">
                  {kpi.hint}
                </span>
              </div>
            </div>
          );
        })}
      </section>

      {chronological.length === 0 ? (
        <section className="bg-white dark:bg-slate-900 rounded-2xl p-10 border border-slate-200/60 dark:border-slate-800 shadow-sm text-center">
          <Recycle className="w-10 h-10 text-slate-300 dark:text-slate-700 mx-auto mb-3" />
          <p className="text-sm font-semibold text-slate-600 dark:text-slate-300">
            No sustainability data available
          </p>
          <p className="text-xs text-slate-400 mt-1">
            Records for the selected property will appear here once logged.
          </p>
        </section>
      ) : (
        <>
          {/* Charts Grid */}
          <section className="grid grid-cols-1 xl:grid-cols-2 gap-4">
            {/* Energy Consumption - Bar */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200/60 dark:border-slate-800 shadow-sm">
              <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-3 flex items-center gap-2">
                <Zap className="w-3.5 h-3.5 text-amber-500" /> Energy Consumption
                <span className="text-[9px] font-normal text-slate-400 normal-case tracking-normal">
                  kWh by month
                </span>
              </h4>
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={energyData} barGap={2}>
                    <CartesianGrid
                      strokeDasharray="3 3"
                      stroke="rgba(148,163,184,0.15)"
                      vertical={false}
                    />
                    <XAxis
                      dataKey="month"
                      tick={{ fontSize: 10, fill: "#94a3b8" }}
                      tickLine={false}
                      axisLine={{ stroke: "rgba(148,163,184,0.2)" }}
                    />
                    <YAxis
                      tick={{ fontSize: 10, fill: "#94a3b8" }}
                      tickLine={false}
                      axisLine={false}
                    />
                    <Tooltip
                      contentStyle={tooltipStyle}
                      cursor={{ fill: "rgba(148,163,184,0.08)" }}
                    />
                    <Legend
                      iconType="circle"
                      wrapperStyle={{ fontSize: "10px" }}
                    />
                    <Bar
                      dataKey="Electricity"
                      fill="#f59e0b"
                      radius={[4, 4, 0, 0]}
                      name="Electricity"
                    />
                    <Bar
                      dataKey="Renewable"
                      fill="#10b981"
                      radius={[4, 4, 0, 0]}
                      name="Renewable"
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Water Usage - Area */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200/60 dark:border-slate-800 shadow-sm">
              <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-3 flex items-center gap-2">
                <Droplets className="w-3.5 h-3.5 text-blue-500" /> Water Usage
                <span className="text-[9px] font-normal text-slate-400 normal-case tracking-normal">
                  litres by month
                </span>
              </h4>
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={waterData}>
                    <defs>
                      <linearGradient id="waterGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.4} />
                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.02} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid
                      strokeDasharray="3 3"
                      stroke="rgba(148,163,184,0.15)"
                      vertical={false}
                    />
                    <XAxis
                      dataKey="month"
                      tick={{ fontSize: 10, fill: "#94a3b8" }}
                      tickLine={false}
                      axisLine={{ stroke: "rgba(148,163,184,0.2)" }}
                    />
                    <YAxis
                      tick={{ fontSize: 10, fill: "#94a3b8" }}
                      tickLine={false}
                      axisLine={false}
                    />
                    <Tooltip contentStyle={tooltipStyle} />
                    <Area
                      type="monotone"
                      dataKey="Water"
                      stroke="#3b82f6"
                      strokeWidth={2}
                      fill="url(#waterGrad)"
                      name="Water (L)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Carbon Emissions - Line */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200/60 dark:border-slate-800 shadow-sm">
              <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-3 flex items-center gap-2">
                <CloudOff className="w-3.5 h-3.5 text-slate-500" /> Carbon
                Emissions
                <span className="text-[9px] font-normal text-slate-400 normal-case tracking-normal">
                  kg CO₂ by month
                </span>
              </h4>
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={carbonData}>
                    <CartesianGrid
                      strokeDasharray="3 3"
                      stroke="rgba(148,163,184,0.15)"
                      vertical={false}
                    />
                    <XAxis
                      dataKey="month"
                      tick={{ fontSize: 10, fill: "#94a3b8" }}
                      tickLine={false}
                      axisLine={{ stroke: "rgba(148,163,184,0.2)" }}
                    />
                    <YAxis
                      tick={{ fontSize: 10, fill: "#94a3b8" }}
                      tickLine={false}
                      axisLine={false}
                    />
                    <Tooltip contentStyle={tooltipStyle} />
                    <Line
                      type="monotone"
                      dataKey="Carbon"
                      stroke="#64748b"
                      strokeWidth={2.5}
                      dot={{ r: 3, fill: "#64748b" }}
                      activeDot={{ r: 5 }}
                      name="Carbon (kg)"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Green Building Score - RadialBar */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200/60 dark:border-slate-800 shadow-sm">
              <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-3 flex items-center gap-2">
                <Building2 className="w-3.5 h-3.5 text-green-500" /> Green
                Building Score
                <span className="text-[9px] font-normal text-slate-400 normal-case tracking-normal">
                  rating by month
                </span>
              </h4>
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <RadialBarChart
                    innerRadius="20%"
                    outerRadius="100%"
                    data={greenScoreData}
                    startAngle={90}
                    endAngle={-270}
                  >
                    <PolarAngleAxis
                      type="number"
                      domain={[0, 100]}
                      angleAxisId={0}
                      tick={false}
                    />
                    <RadialBar
                      background={{ fill: "rgba(148,163,184,0.15)" }}
                      dataKey="Score"
                      cornerRadius={6}
                    />
                    <Tooltip
                      contentStyle={tooltipStyle}
                      formatter={(v: any) => [`${v}`, "Green Score"]}
                    />
                    <Legend
                      iconType="circle"
                      layout="horizontal"
                      verticalAlign="bottom"
                      align="center"
                      wrapperStyle={{ fontSize: "10px" }}
                    />
                  </RadialBarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </section>

          {/* Data Table */}
          <section className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200/60 dark:border-slate-800 shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
                <Activity className="w-4 h-4 text-emerald-500" /> Sustainability
                Records
              </h3>
              <div className="flex items-center gap-2">
                <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider hidden sm:inline">
                  {chronological.length} {chronological.length === 1 ? "entry" : "entries"}
                </span>
                <button
                  onClick={handleExport}
                  className="text-[10px] font-bold uppercase tracking-wider px-3 py-1.5 rounded-lg bg-emerald-500 text-white hover:bg-emerald-600 transition-colors flex items-center gap-1"
                >
                  <TrendingUp className="w-3 h-3" /> Export CSV
                </button>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-800">
                    {tableColumns.map((col) => (
                      <th
                        key={col.key}
                        onClick={() => handleSort(col.key)}
                        className="py-2.5 px-3 text-[9px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider cursor-pointer select-none hover:text-slate-700 dark:hover:text-slate-200 transition-colors whitespace-nowrap"
                      >
                        <span className="inline-flex items-center gap-1">
                          {col.label}
                          <ArrowUpDown
                            className={`w-3 h-3 ${
                              sortKey === col.key
                                ? "text-emerald-500"
                                : "text-slate-300 dark:text-slate-600"
                            }`}
                          />
                        </span>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {sortedMetrics.map((m) => (
                    <tr
                      key={m.id}
                      className="border-b border-slate-100 dark:border-slate-800/60 hover:bg-slate-50 dark:hover:bg-slate-950/40 transition-colors"
                    >
                      <td className="py-2.5 px-3 text-xs font-semibold text-slate-700 dark:text-slate-200 whitespace-nowrap">
                        {m.month}
                      </td>
                      <td className="py-2.5 px-3 text-xs font-mono text-amber-600 dark:text-amber-400 font-bold whitespace-nowrap">
                        {m.electricityKwh.toLocaleString()}
                      </td>
                      <td className="py-2.5 px-3 text-xs font-mono text-blue-600 dark:text-blue-400 font-bold whitespace-nowrap">
                        {m.waterLitres.toLocaleString()}
                      </td>
                      <td className="py-2.5 px-3 text-xs font-mono text-slate-600 dark:text-slate-300 font-bold whitespace-nowrap">
                        {m.carbonEmissionsKg.toLocaleString()}
                      </td>
                      <td className="py-2.5 px-3 text-xs font-mono text-emerald-600 dark:text-emerald-400 font-bold whitespace-nowrap">
                        {m.renewableEnergyKwh.toLocaleString()}
                      </td>
                      <td className="py-2.5 px-3 text-xs font-mono text-slate-500 dark:text-slate-400 font-bold whitespace-nowrap">
                        {m.wasteGeneratedKg.toLocaleString()}
                      </td>
                      <td className="py-2.5 px-3 whitespace-nowrap">
                        <span
                          className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full border ${scoreBadge(
                            m.greenBuildingScore
                          )}`}
                        >
                          {m.greenBuildingScore}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        </>
      )}
    </div>
  );
}
