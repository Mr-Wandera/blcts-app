/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface Property {
  id: string;
  name: string;
  location: string;
  type: "Residential" | "Commercial" | "Mixed-Use" | "Industrial" | string;
  capexBudget: number;
  opexBudget: number;
  healthGrade: "A" | "B" | "C" | "D" | "N/A" | string;
  healthStatusText: string;
  description: string;
  // Onboarding & property management extensions
  code?: string;
  clientName?: string;
  estimatedFloorArea?: number;
  address?: string;
  city?: string;
  county?: string;
  country?: string;
  gps?: string;
  floors?: number;
  units?: number;
  constructionStartDate?: string;
  completionDate?: string;
  initialConstructionCost?: number;
  materialCost?: number;
  labourCost?: number;
  maintenanceCost?: number;
  utilityCost?: number;
  repairCost?: number;
  renovationCost?: number;
  otherCost?: number;
  expectedLifecycleYears?: number;
  status?: "Active" | "Under Construction" | "Renovation" | "Archived" | string;
  totalLifecycleCostRecord?: number;
  lastUpdated?: string;
  isSoftDeleted?: boolean;
  blueprintUrl?: string;
  observations?: string[];
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
  status: "Scheduled" | "In-Progress" | "Completed" | "Paid" | "Overdue";
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

export type UserRole = "Developer" | "Super Admin" | "Property Manager" | "Finance Officer" | "Maintenance Officer" | "Vendor" | "Auditor" | "Executive" | "Facility Manager" | "Maintenance Engineer";

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  organization?: string;
  phone?: string;
  // RBAC scoped permissions
  scopeProperties?: string[]; // list of propertyIds allowed
}

export interface Asset {
  id: string;
  propertyId: string;
  name: string;
  category: "HVAC Systems" | "Elevators" | "Solar Installations" | "Water Systems" | "Electrical Infrastructure" | "Security Systems" | "Generators" | "Fire Safety Equipment";
  installationDate: string;
  expectedLifespan: number; // in years
  warrantyInfo: string;
  vendor: string;
  maintenanceSchedule: "Monthly" | "Quarterly" | "Bi-Annually" | "Annually";
  currentCondition: "New" | "Good" | "Fair" | "Poor" | "Critical";
}

export interface MaintenanceRecord {
  id: string;
  propertyId: string;
  assetId?: string;
  type: "Preventive" | "Corrective" | "Scheduled" | "Emergency";
  cost: number;
  vendor: string;
  date: string;
  status: "Scheduled" | "In-Progress" | "Completed" | "Overdue";
  notes: string;
  attachments: string[];
}

export interface UploadedDocument {
  id: string;
  propertyId: string;
  title: string;
  category: "Architectural Drawings" | "BOQs" | "Contracts" | "Invoices" | "Inspection Reports" | "Maintenance Reports" | "Vendor Agreements";
  uploadedAt: string;
  uploadedBy: string;
  fileSize: string;
  version: number;
  history: { version: number; date: string; user: string; action: string }[];
}

export interface AppNotification {
  id: string;
  propertyId?: string;
  title: string;
  message: string;
  type: "maintenance" | "budget" | "contract" | "warranty" | "ai_recommendation";
  timestamp: string;
  isRead: boolean;
  channel: "in-app" | "email" | "both";
}

export interface AuditLog {
  id: string;
  timestamp: string;
  userId: string;
  userName: string;
  role: UserRole;
  action: string;
  details: string;
  propertyId?: string;
}

export type ActiveTabType = 
  | "dashboard" 
  | "properties-mgmt"
  | "cost-estimation"
  | "reports"
  | "materials";



