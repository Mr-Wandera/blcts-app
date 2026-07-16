// ─── Core User Types ──────────────────────────────────────────────────────────

export type UserRole = 'Administrator' | 'Building Owner' | 'Facility Manager';
export type BuildingType = 'Residential' | 'Maisonette' | 'Apartment' | 'Commercial' | 'Office' | 'Mixed-Use' | 'Warehouse' | 'School' | 'Hospital' | 'Industrial';
export type ConstructionStandard = 'Economy' | 'Standard' | 'Premium' | 'Luxury';
export type MaintenanceStatus = 'Pending' | 'Assigned' | 'In-Progress' | 'Completed' | 'Verified' | 'Overdue';
export type MaintenancePriority = 'Low' | 'Medium' | 'High' | 'Critical';
export type MaintenanceCategory = 'Preventive' | 'Corrective' | 'Predictive' | 'Emergency' | 'Inspection';
export type LifecyclePhase = 'Construction' | 'Operational' | 'Maintenance' | 'End-of-Life';
export type ActiveTabType = string;

export const ADMIN_ROLES: UserRole[] = ['Administrator'];
export const FM_ROLES: UserRole[] = ['Facility Manager'];

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  organization?: string;
  phone?: string;
  scopeProperties?: string[];
}

// ─── Project Types ────────────────────────────────────────────────────────────

export interface BlueprintAnalysisResult {
  floorAreaPerFloor: number;
  floors: number;
  buildingType: string;
  constructionStandard: string;
  county: string;
  confidence: number;
  detectedRooms: DetectedRoom[];
  notes: string;
}

export interface DetectedRoom {
  label: string;
  count: number;
  areaSqm: number;
}

export interface Project {
  id: string;
  name: string;
  location: string;
  county: string;
  buildingType: BuildingType;
  constructionStandard: ConstructionStandard;
  floorAreaPerFloor: number;
  floors: number;
  blueprintAnalysis?: BlueprintAnalysisResult;
  createdAt: string;
  updatedAt: string;
}

// ─── Cost Estimation Types ───────────────────────────────────────────────────

export interface BOQItem {
  id: string;
  category: string;
  description: string;
  unit: string;
  quantity: number;
  unitRate: number;
  totalCost: number;
}

export interface CostEstimate {
  totalConstructionCost: number;
  costPerSqm: number;
  boqItems: BOQItem[];
  regionalMultiplier: number;
  standardMultiplier: number;
  contingency: number;
  grandTotal: number;
}

export interface LifecycleCost {
  year: number;
  maintenance: number;
  energy: number;
  cleaning: number;
  security: number;
  total: number;
  cumulative: number;
}

export interface LifecycleAnalysis {
  years: number;
  inflationRate: number;
  annualCosts: LifecycleCost[];
  totalLifecycleCost: number;
  netPresentValue: number;
}

// ─── Maintenance Types ────────────────────────────────────────────────────────

export interface MaintenanceTask {
  id: string;
  projectId: string;
  title: string;
  description: string;
  category: MaintenanceCategory;
  priority: MaintenancePriority;
  status: MaintenanceStatus;
  assignedTo: string;
  dueDate: string;
  estimatedCost: number;
  actualCost?: number;
  createdAt: string;
  completedAt?: string;
}

// ─── Pricing Types ────────────────────────────────────────────────────────────

export interface MaterialPrice {
  id: string;
  name: string;
  category: string;
  unit: string;
  basePrice: number;
  updatedAt: string;
}

export interface RegionalPrice {
  id: string;
  county: string;
  multiplier: number;
  updatedAt: string;
}
