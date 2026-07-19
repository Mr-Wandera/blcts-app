// ─── Core User Types ──────────────────────────────────────────────────────────

export type UserRole = 'Administrator' | 'Building Owner' | 'Facility Manager';
export type BuildingType = 'Residential' | 'Maisonette' | 'Apartment' | 'Commercial' | 'Office' | 'Mixed-Use' | 'Warehouse' | 'School' | 'Hospital' | 'Industrial';
export type ConstructionStandard = 'Economy' | 'Standard' | 'Premium' | 'Luxury';
export type MaintenanceStatus = 'Pending' | 'Assigned' | 'In-Progress' | 'Completed' | 'Verified' | 'Overdue';
export type MaintenancePriority = 'Low' | 'Medium' | 'High' | 'Critical';
export type MaintenanceCategory = 'Preventive' | 'Corrective' | 'Predictive' | 'Emergency' | 'Inspection';
export type LifecyclePhase = 'Construction' | 'Operational' | 'Maintenance' | 'End-of-Life';
export type ActiveTabType = string;
export type ProjectStatus = 'Planning' | 'Under Construction' | 'Active' | 'Completed';

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

export interface DetectedRoom {
  label: string;
  count: number;
  areaSqm: number;
}

export interface BlueprintAnalysisResult {
  // New (SMM pipeline) contract — required
  estimatedFloorArea: number | null;
  floors: number | null;
  buildingType: string | null;
  confidence: number | null; // 0.00–1.00
  observations: string[];
  roomCount?: number | null;
  bedrooms?: number | null;
  bathrooms?: number | null;
  roofType?: string | null;
  drawingScale?: string | null;
  // Legacy fields — optional, used by the BlueprintUpload review UI
  floorAreaPerFloor?: number;
  detectedRooms?: DetectedRoom[];
  notes?: string;
  constructionStandard?: string;
  county?: string;
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
  blueprintFileName?: string;
  status?: ProjectStatus;
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

// ─── SMM Pipeline Types (BOQ Engine) ──────────────────────────────────────────

export type BOQLineItemSource = 'estimated' | 'measured';

export interface BOQLineItem {
  section: string;
  quantity: number;
  unit: string;
  unitRate: number;
  amount: number;
  source: BOQLineItemSource;
}

export interface ProfessionalFee {
  name: string;
  rate: number;
  amount: number;
}

export interface YearlyProjection {
  year: number;
  opex: number;
  cumulative: number;
}

export interface BOQEstimate {
  id: string;
  projectId: string;
  projectName: string;
  county: string;
  buildingType: string;
  constructionStandard: string;
  gfa: number;
  floors: number;
  costPerSqm: number;
  constructionCost: number;
  externalWorks: number;
  preliminaries: number;
  professionalFees: ProfessionalFee[];
  statutoryCosts: number;
  subtotal: number;
  contingency: number;
  vatAmount: number;
  totalProjectCost: number;
  lifecycleYears: number;
  annualOpex: number;
  totalLifecycleCost: number;
  tco: number;
  lineItems: BOQLineItem[];
  yearlyProjection: YearlyProjection[];
  blueprintObservations: string[];
  aiConfidence: number | null;
  createdAt: string;
}

// ─── Regional Pricing (Supabase row contract) ────────────────────────────────

export interface RegionalPricingRow {
  id: string;
  county: string;
  base_cost_per_sqm_economy: number;
  base_cost_per_sqm_standard: number;
  base_cost_per_sqm_premium: number;
  base_cost_per_sqm_luxury: number;
  material_multiplier: number;
  labour_multiplier: number;
  service_multiplier: number;
  inflation_factor: number;
  transport_factor: number;
  notes: string | null;
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
