/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface Property {
  id: string;
  name: string;
  location: string;
  type: "Residential" | "Commercial" | "Mixed-Use";
  capexBudget: number;
  opexBudget: number;
  healthGrade: "A" | "B" | "C" | "D";
  healthStatusText: string;
  description: string;
}

export type LifecyclePhase = "Construction" | "Operational" | "Maintenance" | "End-of-Life";

export interface CostEntry {
  id: string;
  propertyId: string;
  phase: LifecyclePhase;
  component: string;
  amount: number;
  date: string;
  contractor: string;
  status: "Pending" | "Completed" | "Paid";
  description: string;
}

export interface MaintenanceTask {
  id: string;
  propertyId: string;
  component: string;
  status: "Scheduled" | "In-Progress" | "Completed" | "Paid";
  targetDate: string;
  contractor: string;
  amount: number;
  phone?: string;
}

export interface ChartDataPoint {
  month: string;
  capexBudget: number;
  capexActual: number;
  opexBudget: number;
  opexActual: number;
}

export interface AIInsight {
  type: "opportunity" | "warning" | "alert";
  title: string;
  description: string;
  financialImpact: string;
  recommendedAction: string;
}

