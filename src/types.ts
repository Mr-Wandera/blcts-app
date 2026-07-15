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

// ─── New Project Types (clean architecture) ───────────────────────────────────

export interface Project {
  id: string;
  name: string;
  location: string;
  county: string;
  buildingType: BuildingType;
  constructionStandard: ConstructionStandard;
  floorAreaPerFloor: number;
  floors: number;
  status: 'Planning' | 'Under Construction' | 'Active' | 'Archived';
  ownerId: string;
  assignedFacilityManagerId?: string;
  blueprintUrl?: string;
  blueprintFileName?: string;
  blueprintAnalysis?: BlueprintAnalysisResult;
  latestBoqId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface BlueprintAnalysisResult {
  estimatedFloorArea: number | null;
  floors: number | null;
  buildingType: string | null;
  confidence: number | null;
  observations: string[];
  isFallback: boolean;
  roomCount?: number | null;
  bedrooms?: number | null;
  bathrooms?: number | null;
  roofType?: string | null;
  drawingScale?: string | null;
}

export interface BOQLineItem {
  section: string;
  item?: string;
  quantity: number;
  unit: string;
  unitRate: number;
  amount: number;
  source: 'measured' | 'estimated';
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
  professionalFees: { name: string; rate: number; amount: number }[];
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
  yearlyProjection: { year: number; opex: number; cumulative: number }[];
  blueprintObservations: string[];
  aiConfidence: number | null;
  createdAt: string;
}

// ─── Maintenance Task ─────────────────────────────────────────────────────────

export interface MaintenanceTask {
  id: string;
  projectId?: string;
  propertyId?: string;
  title: string;
  description: string;
  component: string;
  category: MaintenanceCategory;
  priority: MaintenancePriority;
  status: MaintenanceStatus;
  assignedTo: string;
  technician?: string;
  vendor?: string;
  estimatedCost: number;
  actualCost: number;
  targetDate: string;
  completedDate?: string;
  verifiedBy?: string;
  phone?: string;
  notes: string;
  partsUsed?: string;
  labourHours?: number;
  downtime?: number;
  attachments?: string[];
  workOrderNumber: string;
  createdAt?: string;
  updatedAt?: string;
}

// ─── Supabase Table Rows ──────────────────────────────────────────────────────

export interface RegionalPricingRow {
  id: string;
  county: string;
  material_multiplier: number;
  labour_multiplier: number;
  service_multiplier: number;
  inflation_factor: number;
  transport_factor: number;
  base_cost_per_sqm_economy: number;
  base_cost_per_sqm_standard: number;
  base_cost_per_sqm_premium: number;
  base_cost_per_sqm_luxury: number;
  notes: string | null;
}

export interface MaterialRow {
  id: string;
  county: string;
  category: 'material' | 'labour' | 'service';
  item_id: string;
  name: string;
  unit_price: number;
  unit: string;
  notes: string | null;
}

export interface BOQEstimateRow {
  id: string;
  property_id: string;
  property_name: string;
  county: string;
  building_type: string;
  construction_standard: string;
  gfa: number;
  floors: number;
  cost_per_sqm: number;
  construction_cost: number;
  total_project_cost: number;
  tco: number;
  boq_line_items: BOQLineItem[];
  blueprint_observations: string[];
  ai_confidence: number | null;
  created_at: string;
}

export interface ConstructionMaterialRow {
  id: string;
  item_id: string;
  name: string;
  category: 'material' | 'labour' | 'service';
  unit: string;
  unit_price: number;
  notes: string | null;
}

// ─── Legacy Property Type (legacy components) ─────────────────────────────────

export interface Property {
  id: string;
  name: string;
  location: string;
  type: string;
  capexBudget: number;
  opexBudget: number;
  healthGrade: string;
  healthStatusText: string;
  description: string;
  status?: string;
  constructionStartDate?: string;
  completionDate?: string;
  constructionYear?: number;
  initialConstructionCost?: number;
  materialCost?: number;
  labourCost?: number;
  maintenanceCost?: number;
  utilityCost?: number;
  repairCost?: number;
  renovationCost?: number;
  otherCost?: number;
  expectedLifecycleYears?: number;
  floors?: number;
  units?: number;
  occupancy?: number;
  code?: string;
  clientName?: string;
  owner?: string;
  developer?: string;
  estimatedFloorArea?: number;
  address?: string;
  city?: string;
  county?: string;
  country?: string;
  gps?: string;
  buildingValue?: number;
  replacementCost?: number;
  depreciation?: number;
  insuranceProvider?: string;
  insurancePolicyNumber?: string;
  insuranceExpiry?: string;
  blueprintUrl?: string;
  observations?: string[];
  isSoftDeleted?: boolean;
  constructionStandard?: string;
}

// ─── Legacy Cost & Finance Types ─────────────────────────────────────────────

export interface CostEntry {
  id: string;
  propertyId: string;
  phase: LifecyclePhase;
  component: string;
  amount: number;
  date: string;
  contractor: string;
  status: string;
  description: string;
}

export interface ChartDataPoint {
  month: string;
  capexBudget: number;
  capexActual: number;
  opexBudget: number;
  opexActual: number;
}

export interface AIInsight {
  type: 'alert' | 'warning' | 'opportunity';
  title: string;
  description: string;
  financialImpact: string;
  recommendedAction?: string;
}

// ─── Vendor & Supply Types ────────────────────────────────────────────────────

export interface DeliveryRecord {
  date: string;
  item: string;
  status: 'On-Time' | 'Late' | 'Early';
  value: number;
}

export interface PaymentRecord {
  date: string;
  amount: number;
  status: 'Paid' | 'Pending' | 'Overdue';
}

export interface Vendor {
  id: string;
  name: string;
  type: 'Contractor' | 'Supplier' | 'Consultant' | 'Engineer';
  category: string;
  contactPerson: string;
  email: string;
  phone: string;
  address: string;
  contractValue: number;
  contractExpiry: string;
  performanceRating: number;
  deliveryOnTimeRate: number;
  paymentTerms?: string;
  complianceCertified: boolean;
  complianceExpiry: string;
  deliveryHistory?: DeliveryRecord[];
  paymentHistory?: PaymentRecord[];
}

// ─── Material Types ───────────────────────────────────────────────────────────

export interface PriceHistoryPoint {
  date: string;
  price: number;
}

export interface Material {
  id: string;
  name: string;
  category: string;
  supplier: string;
  manufacturer: string;
  unit: string;
  currentPrice: number;
  historicalPrices?: PriceHistoryPoint[];
  leadTimeDays: number;
  availability: 'In Stock' | 'Low Stock' | 'Out of Stock' | 'Pre-Order';
  carbonFootprint?: number;
}

export interface PricingItem {
  id: string;
  name: string;
  basePrice: number;
  unit: string;
  notes?: string;
}

export interface RegionalPricing {
  materials: PricingItem[];
  labour: PricingItem[];
  services: PricingItem[];
  notes?: string;
}

export type RegionalPricingDatabase = Record<string, RegionalPricing>;

export interface PricingEngineConfig {
  defaultSafetyMargin: number;
  minSafetyMargin: number;
  maxSafetyMargin: number;
  currency: string;
  storageKey: string;
}

// ─── Asset Types ──────────────────────────────────────────────────────────────

export interface MaintenanceHistoryRecord {
  date: string;
  description: string;
  cost: number;
}

export interface Asset {
  id: string;
  propertyId: string;
  name: string;
  category: 'HVAC Systems' | 'Elevators' | 'Solar Installations' | 'Water Systems' | 'Electrical Infrastructure' | 'Security Systems' | 'Generators' | 'Fire Safety Equipment' | 'Plumbing' | 'Roofing' | 'Structural Components';
  installationDate: string;
  expectedLifespan: number;
  warrantyInfo: string;
  vendor: string;
  maintenanceSchedule: 'Monthly' | 'Quarterly' | 'Bi-Annually' | 'Annually';
  currentCondition: 'New' | 'Good' | 'Fair' | 'Poor' | 'Critical';
  replacementCost: number;
  remainingUsefulLife?: number;
  maintenanceHistory?: MaintenanceHistoryRecord[];
}

// ─── Compliance Types ─────────────────────────────────────────────────────────

export interface ComplianceItem {
  id: string;
  propertyId: string;
  regulation: string;
  category: 'Building Codes' | 'Fire Safety' | 'OSHA' | 'Environmental' | 'Structural Inspection';
  status: 'Compliant' | 'Non-Compliant' | 'Pending Review' | 'Expired';
  lastInspectionDate: string;
  nextInspectionDate: string;
  authority: string;
  notes: string;
}

// ─── Sustainability Types ─────────────────────────────────────────────────────

export interface SustainabilityMetric {
  id: string;
  propertyId: string;
  month: string;
  electricityKwh: number;
  waterLitres: number;
  carbonEmissionsKg: number;
  renewableEnergyKwh: number;
  wasteGeneratedKg: number;
  greenBuildingScore: number;
}

// ─── AI & Prediction Types ────────────────────────────────────────────────────

export interface AIPrediction {
  id: string;
  propertyId: string;
  category: string;
  prediction: string;
  predictedValue: number;
  confidenceScore: number;
  riskLevel: 'Low' | 'Medium' | 'High' | 'Critical';
  recommendation: string;
  supportingData: string;
  timeframe: string;
  assumptions?: string[];
  limitations?: string[];
}

export interface Anomaly {
  id: string;
  propertyId: string;
  category: string;
  description: string;
  severity: 'Low' | 'Medium' | 'High' | 'Critical';
  detectedValue: number;
  expectedValue: number;
  deviationPercent: number;
  recommendation: string;
  detectedAt: string;
  isResolved: boolean;
}

export interface RiskItem {
  id: string;
  propertyId: string;
  description: string;
  category: string;
  probability: 'Low' | 'Medium' | 'High';
  impact: 'Low' | 'Medium' | 'High' | 'Critical';
  mitigation: string;
  status: 'Open' | 'Mitigated' | 'Closed';
}

// ─── Notification Types ───────────────────────────────────────────────────────

export interface AppNotification {
  id: string;
  propertyId?: string;
  title: string;
  message: string;
  type: 'maintenance' | 'budget' | 'contract' | 'warranty' | 'ai_recommendation' | 'compliance' | 'equipment';
  severity: 'low' | 'medium' | 'high' | 'critical';
  timestamp: string;
  isRead: boolean;
  channel: 'in-app' | 'email' | 'sms' | 'both';
}

// ─── System Settings Types ────────────────────────────────────────────────────

export interface AuditLog {
  id: string;
  timestamp: string;
  userId: string;
  userName: string;
  role: string;
  action: string;
  details: string;
  propertyId?: string;
}

export interface SystemSettings {
  safetyMargin: number;
  aiModel: string;
  notificationChannels: {
    inApp: boolean;
    email: boolean;
    sms: boolean;
  };
  auditLogs: AuditLog[];
}
