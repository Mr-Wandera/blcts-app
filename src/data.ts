/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Property, CostEntry, MaintenanceTask, ChartDataPoint, AIInsight } from "./types";

export const initialProperties: Property[] = [
  {
    id: "prop-1",
    name: "Kilimani Crest Heights",
    location: "Lenana Road, Kilimani, Nairobi",
    type: "Mixed-Use",
    capexBudget: 145000000, // 145 Million KES
    opexBudget: 12000000,   // 12 Million KES annually
    healthGrade: "A",
    healthStatusText: "Optimal Efficiency",
    description: "Multi-family premium development utilizing double-glazed solar defense glass, rainwater harvesting, and continuous concrete waterproofing. High durability choices yield low long-term operational expenses.",
    status: "Under Construction",
    constructionStartDate: "2025-01-15",
    completionDate: "2026-12-20",
    initialConstructionCost: 145000000,
    materialCost: 40000000,
    labourCost: 25000000,
    maintenanceCost: 12000000,
    utilityCost: 8500000,
    repairCost: 4500000,
    renovationCost: 18000000,
    otherCost: 3000000,
    expectedLifecycleYears: 50,
    floors: 14,
    units: 56,
    code: "KCH-001",
    clientName: "Wandera Investments Ltd",
    estimatedFloorArea: 5400
  },
  {
    id: "prop-2",
    name: "Thika Road Commercial Park",
    location: "Ruiru Exit 11, Thika Highway",
    type: "Commercial",
    capexBudget: 95000000,  // 95 Million KES (Lower initial cost)
    opexBudget: 24000000,  // 24 Million KES (Extremely high OPEX due to cheap materials)
    healthGrade: "C",
    healthStatusText: "High Maintenance Risk",
    description: "Suburban logistics and retail hub. Uses sub-standard single-layer corrugated roofing sheets and standard low-efficiency HVAC motors. Suffers heavy 'first-cost bias' where low initial cost led to extreme utility and maintenance invoices.",
    status: "Under Construction",
    constructionStartDate: "2025-03-01",
    completionDate: "2026-11-15",
    initialConstructionCost: 95000000,
    materialCost: 30000000,
    labourCost: 18000000,
    maintenanceCost: 24000000,
    utilityCost: 19500000,
    repairCost: 8500000,
    renovationCost: 12000000,
    otherCost: 5000000,
    expectedLifecycleYears: 30,
    floors: 5,
    units: 20,
    code: "TCP-002",
    clientName: "Kenyatta Road Associates",
    estimatedFloorArea: 3200
  },
  {
    id: "prop-3",
    name: "Westlands Executive Suites",
    location: "Mvuli Road, Westlands, Nairobi",
    type: "Residential",
    capexBudget: 210000000, // 210 Million KES
    opexBudget: 18000000,  // 18 Million KES
    healthGrade: "B",
    healthStatusText: "Good Standing",
    description: "Premium office suite block. Equipped with automated LED grids and smart sensor integration. Features partial rooftop solar. Good durability, with predictable minor elevator and pump repairs scheduled.",
    status: "Active",
    constructionStartDate: "2023-06-10",
    completionDate: "2025-04-18",
    initialConstructionCost: 210000000,
    materialCost: 60000000,
    labourCost: 35000000,
    maintenanceCost: 18000000,
    utilityCost: 12000000,
    repairCost: 6000000,
    renovationCost: 25000000,
    otherCost: 8000000,
    expectedLifecycleYears: 40,
    floors: 10,
    units: 40,
    code: "WES-003",
    clientName: "Westlands Suites LLC",
    estimatedFloorArea: 8000
  }
];

export const initialCostEntries: CostEntry[] = [
  // Kilimani Crest Heights
  {
    id: "cost-101",
    propertyId: "prop-1",
    phase: "Construction",
    component: "Foundation Waterproofing (Durability Upgrade)",
    amount: 8500000,
    date: "2024-03-12",
    contractor: "Bamburi Special Concrete",
    status: "Paid",
    description: "Waterproofing membrane additives included in foundations. Eliminated structural water ingress entirely."
  },
  {
    id: "cost-102",
    propertyId: "prop-1",
    phase: "Construction",
    component: "Double-Glazed Low-E Glass Installation",
    amount: 14200000,
    date: "2024-06-20",
    contractor: "Alumil Kenya Ltd",
    status: "Paid",
    description: "Premium glazing installed to decrease radiative heating, reducing HVAC cooling requirement by 35%."
  },
  {
    id: "cost-103",
    propertyId: "prop-1",
    phase: "Operational",
    component: "Rooftop Solar Battery Grid Power Draw",
    amount: 450000,
    date: "2026-04-10",
    contractor: "Kenya Power (Supplemental)",
    status: "Paid",
    description: "Monthly supplemental power draw grid invoice. Unusually low due to rooftop solar array contribution."
  },
  {
    id: "cost-104",
    propertyId: "prop-1",
    phase: "Maintenance",
    component: "Solar System Annual Inverter Tune-Up",
    amount: 180000,
    date: "2026-05-01",
    contractor: "Davis & Shirtliff",
    status: "Paid",
    description: "Preventative recalibration and cleaning of the centralized string inverters."
  },

  // Thika Road Commercial Park
  {
    id: "cost-201",
    propertyId: "prop-2",
    phase: "Construction",
    component: "Standard Corrugated Roofing (Economy Grade)",
    amount: 3200000,
    date: "2023-01-15",
    contractor: "Local Roofing Wholesalers",
    status: "Paid",
    description: "Budget roofing choice made during building to compress construction costs. Corroding prematurely."
  },
  {
    id: "cost-202",
    propertyId: "prop-2",
    phase: "Construction",
    component: "Standard HVAC Units (High-Power Draw)",
    amount: 9800000,
    date: "2023-03-10",
    contractor: "Usoni Air Conditioning",
    status: "Paid",
    description: "Cheapest cooling motors available. High carbon emission indexes and low COP (Coefficient of Performance)."
  },
  {
    id: "cost-203",
    propertyId: "prop-2",
    phase: "Operational",
    component: "Monthly Electricity Utility Invoice (Total Block)",
    amount: 1950000,
    date: "2026-04-20",
    contractor: "Kenya Power Ltd",
    status: "Paid",
    description: "Electrical utility invoice. Includes severe active inductive load penalties from non-VFD motors."
  },
  {
    id: "cost-204",
    propertyId: "prop-2",
    phase: "Maintenance",
    component: "Roof Degradation Patchwork & Sealants",
    amount: 850000,
    date: "2026-05-18",
    contractor: "Apex Roofing Kenya",
    status: "Paid",
    description: "Urgent mastic sealant and epoxy patching applied after a central bay leak damaged retail stock."
  },

  // Westlands Executive Suites
  {
    id: "cost-301",
    propertyId: "prop-3",
    phase: "Construction",
    component: "Elevator & Mechanical Subsystems",
    amount: 18500000,
    date: "2024-11-05",
    contractor: "Otis East Africa Ltd",
    status: "Paid",
    description: "Variable frequency drive elevators with premium suspension cables and regenerative braking."
  },
  {
    id: "cost-302",
    propertyId: "prop-3",
    phase: "Operational",
    component: "Monthly Water Supply & Sewerage Connection",
    amount: 280000,
    date: "2026-05-10",
    contractor: "Nairobi Water (NCWSC)",
    status: "Paid",
    description: "Mains utility water invoice including greywater chargebacks."
  }
];

export const initialMaintenanceTasks: MaintenanceTask[] = [
  // Kilimani Crest Heights
  {
    id: "maint-101",
    propertyId: "prop-1",
    component: "Greywater Harvesting Filtration Flushing",
    status: "Completed",
    targetDate: "2026-05-20",
    contractor: "Davis & Shirtliff",
    amount: 120000,
    phone: "254712345678"
  },
  {
    id: "maint-102",
    propertyId: "prop-1",
    component: "Smart Security Gate Remote Integration",
    status: "Scheduled",
    targetDate: "2026-06-05",
    contractor: "Security Group Africa (SGA)",
    amount: 250000,
    phone: "254722998877"
  },
  {
    id: "maint-103",
    propertyId: "prop-1",
    component: "Fire Alarm Sensor Calibrations",
    status: "In-Progress",
    targetDate: "2026-06-12",
    contractor: "Apex Fire Safety Kenya",
    amount: 180000,
    phone: "254733445566"
  },

  // Thika Road Commercial Park
  {
    id: "maint-201",
    propertyId: "prop-2",
    component: "Emergency Electrical DB Board Rewiring",
    status: "Completed",
    targetDate: "2026-05-24",
    contractor: "PowerLink Engineers Nairobi",
    amount: 460000,
    phone: "254711223344"
  },
  {
    id: "maint-202",
    propertyId: "prop-2",
    component: "Full Metal Roofing Sheet Replacement (3 Blocks)",
    status: "Scheduled",
    targetDate: "2026-07-15",
    contractor: "Mabati Rolling Mills Service",
    amount: 5800000,
    phone: "254799887766"
  },
  {
    id: "maint-203",
    propertyId: "prop-2",
    component: "Low-efficiency HVAC Motor Bearing Grease",
    status: "In-Progress",
    targetDate: "2026-06-02",
    contractor: "Fundi HVAC Technicals",
    amount: 75000,
    phone: "254705040302"
  },

  // Westlands Executive Suites
  {
    id: "maint-301",
    propertyId: "prop-3",
    component: "Elevator Hoist Motor Diagnostic",
    status: "Completed",
    targetDate: "2026-05-15",
    contractor: "Otis East Africa Ltd",
    amount: 320000,
    phone: "254788111222"
  },
  {
    id: "maint-302",
    propertyId: "prop-3",
    component: "Rooftop Rain Gutter Clearing",
    status: "Scheduled",
    targetDate: "2026-06-10",
    contractor: "Local Property Artisans Ltd",
    amount: 45000,
    phone: "254701239845"
  }
];

// Generates simulated historical cost trends comparing:
// - A building built via "First-Cost Bias" (economical build, skyrocketing costs)
// - A building built via "Sustainable Lifecycle Specs" (premium build, flat/controlled costs)
export const getFinancialTrends = (propertyId: string): ChartDataPoint[] => {
  if (propertyId === "prop-1") {
    // Kilimani: Sustainable model. Standard CAPEX but low OPEX. It hits within budgets perfectly.
    return [
      { month: "Jan", capexBudget: 4000000, capexActual: 4200000, opexBudget: 500000, opexActual: 410000 },
      { month: "Feb", capexBudget: 3500000, capexActual: 3300000, opexBudget: 500000, opexActual: 430000 },
      { month: "Mar", capexBudget: 3000000, capexActual: 2900000, opexBudget: 500000, opexActual: 420000 },
      { month: "Apr", capexBudget: 2500000, capexActual: 2600000, opexBudget: 500000, opexActual: 450000 },
      { month: "May", capexBudget: 1500000, capexActual: 1400000, opexBudget: 500000, opexActual: 390000 },
      { month: "Jun", capexBudget: 1000000, capexActual: 1050000, opexBudget: 500000, opexActual: 400000 }
    ];
  } else if (propertyId === "prop-2") {
    // Thika: High OPEX and over budget maintenance. It spikes wildly!
    return [
      { month: "Jan", capexBudget: 3000000, capexActual: 2700000, opexBudget: 800000, opexActual: 1400000 }, // Over budget instantly
      { month: "Feb", capexBudget: 2500000, capexActual: 2400000, opexBudget: 800000, opexActual: 1650000 },
      { month: "Mar", capexBudget: 2000000, capexActual: 1900000, opexBudget: 800000, opexActual: 1800000 },
      { month: "Apr", capexBudget: 1500000, capexActual: 1450000, opexBudget: 800000, opexActual: 1950000 },
      { month: "May", capexBudget: 1000000, capexActual: 950000, opexBudget: 800000, opexActual: 2150000 },
      { month: "Jun", capexBudget: 500000, capexActual: 620000, opexBudget: 1000000, opexActual: 2850000 } // massive roof repair spike
    ];
  } else {
    // Westlands: Stable medium
    return [
      { month: "Jan", capexBudget: 5000000, capexActual: 5100000, opexBudget: 600000, opexActual: 580000 },
      { month: "Feb", capexBudget: 4200000, capexActual: 4000000, opexBudget: 600000, opexActual: 610000 },
      { month: "Mar", capexBudget: 3800000, capexActual: 3750000, opexBudget: 600000, opexActual: 620000 },
      { month: "Apr", capexBudget: 2200000, capexActual: 2400000, opexBudget: 600000, opexActual: 650000 },
      { month: "May", capexBudget: 1500000, capexActual: 1550000, opexBudget: 600000, opexActual: 670000 },
      { month: "Jun", capexBudget: 900000, capexActual: 850000, opexBudget: 600000, opexActual: 600000 }
    ];
  }
};



export const getAIInsights = (propertyId: string): AIInsight[] => {
  if (propertyId === "prop-1") {
    return [
      {
        type: "opportunity",
        title: "Rainwater Buffer Maximization",
        description: "Severe rain predicted in Nairobi over the next 18 days. Greywater filtration is operating at optimal efficiency.",
        financialImpact: "Saves KSh 140,000 in backup municipal water delivery",
        recommendedAction: "Bypass secondary high-filtration cycles next week to expand buffer tanks."
      },
      {
        type: "opportunity",
        title: "Solar Excess Energy Offloading",
        description: "Your grid exports on high solar radiation afternoons average 15 kW/hr above base operational loads.",
        financialImpact: "Generate KSh 45,000 monthly utility credits",
        recommendedAction: "Enroll in Net Metering Scheme Phase II with Kenya Power & Lighting (KPLC)."
      }
    ];
  } else if (propertyId === "prop-2") {
    return [
      {
        type: "alert",
        title: "Vicious Utility Load-Factor Chargeback",
        description: "Low-grade non-VFD ventilation motors are causing a inductive power factor of 0.72. KPLC is applying reactive penalization multipliers.",
        financialImpact: "Inflating electricity bills by KSh 380,000 monthly",
        recommendedAction: "Retrofit reactive power capacitor banks (Est. CAPEX KSh 1.2M, payback in 3.1 months)."
      },
      {
        type: "warning",
        title: "Accelerated Roof Sheet Oxidization",
        description: "Sub-standard roofing sheets in Block B are showing rapid corrosion. Micro-cracks detected during thermal sweeps.",
        financialImpact: "Failure creates risk of KSh 6,500,000 structural & inventory water damage",
        recommendedAction: "Replace degraded sheets with premium prepainted standard gauge zinc-aluminum alloys (Alu-Zinc)."
      }
    ];
  } else {
    return [
      {
        type: "warning",
        title: "Pre-emptive Elevator Cable Fatigue",
        description: "Block A Elevator runs have exceeded 850,000 duty cycles. Traction fatigue indicators approaching warning threshold of 88%.",
        financialImpact: "Avoids emergency callout surcharge of KSh 220,000",
        recommendedAction: "Engage Otis East Africa for replacement during scheduled June downtime."
      },
      {
        type: "opportunity",
        title: "Smart Thermostat Cluster Integration",
        description: "Sub-blocks show high temperature fluctuation during Nairobi's dry season, triggering heating-cooling overlaps.",
        financialImpact: "Saves KSh 90,000 in monthly building operational logs",
        recommendedAction: "Deploy smart centralized climate clusters to regulate zones automatically."
      }
    ];
  }
};
