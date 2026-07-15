import { createClient } from '@supabase/supabase-js';
<<<<<<< HEAD

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('⚠️ Missing Supabase Environment Variables. Check your .env file.');
}

// Initialize the enterprise client with secure session handling
export const supabase = createClient(
  supabaseUrl || '', 
  supabaseAnonKey || '',
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true
    }
  }
);
=======
import type { RegionalPricingRow, MaterialRow, ConstructionMaterialRow, BOQEstimate, BOQLineItem, MaintenanceTask } from '../types';

const url = import.meta.env.VITE_SUPABASE_URL as string;
const key = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

export const supabase = createClient(url, key);

// ─── Re-export types for components that import from here ────────────────────
export type { RegionalPricingRow, MaterialRow, ConstructionMaterialRow, BOQLineItem };

// Legacy BOQ row type for CostEstimation component
export interface BOQEstimateRow {
  id?: string;
  property_id: string;
  property_name: string;
  county: string;
  building_type: string;
  construction_standard: string;
  gfa: number;
  floors: number;
  cost_per_sqm: number;
  construction_cost: number;
  external_works?: number;
  preliminaries?: number;
  professional_fees?: unknown;
  statutory_costs?: number;
  subtotal?: number;
  contingency?: number;
  vat_amount?: number;
  total_project_cost: number;
  lifecycle_years?: number;
  annual_opex?: number;
  total_lifecycle_cost?: number;
  tco: number;
  boq_line_items?: unknown;
  blueprint_observations?: string[];
  ai_confidence?: number | null;
  config?: Record<string, unknown>;
  created_at?: string;
}

// ─── Cache ────────────────────────────────────────────────────────────────────
let _pricing: RegionalPricingRow[] | null = null;
let _materials: MaterialRow[] | null = null;
let _constructionMaterials: ConstructionMaterialRow[] | null = null;

export async function fetchRegionalPricing(): Promise<RegionalPricingRow[]> {
  if (_pricing) return _pricing;
  const { data } = await supabase.from('regional_pricing').select('*').order('county');
  _pricing = (data ?? []) as RegionalPricingRow[];
  return _pricing;
}

export async function fetchMaterials(): Promise<MaterialRow[]> {
  if (_materials) return _materials;
  const { data } = await supabase.from('construction_materials').select('*').order('category').order('name');
  _materials = (data ?? []) as MaterialRow[];
  return _materials;
}

export async function fetchConstructionMaterials(): Promise<ConstructionMaterialRow[]> {
  if (_constructionMaterials) return _constructionMaterials;
  const { data } = await supabase.from('construction_materials').select('*').order('category').order('name');
  _constructionMaterials = (data ?? []) as ConstructionMaterialRow[];
  return _constructionMaterials;
}

export function invalidatePricingCache() {
  _pricing = null;
  _materials = null;
  _constructionMaterials = null;
}

export const invalidateCache = invalidatePricingCache;

export async function updateMaterialPrice(id: string, unitPrice: number): Promise<boolean> {
  invalidatePricingCache();
  const { error } = await supabase
    .from('construction_materials')
    .update({ unit_price: unitPrice, updated_at: new Date().toISOString() })
    .eq('id', id);
  return !error;
}

// ─── BOQ Estimates ────────────────────────────────────────────────────────────
export async function saveBOQ(estimate: Omit<BOQEstimate, 'id' | 'createdAt'>): Promise<string | null> {
  const { data, error } = await supabase.from('boq_estimates').insert({
    property_id: estimate.projectId,
    property_name: estimate.projectName,
    county: estimate.county,
    building_type: estimate.buildingType,
    construction_standard: estimate.constructionStandard,
    gfa: estimate.gfa,
    floors: estimate.floors,
    cost_per_sqm: estimate.costPerSqm,
    construction_cost: estimate.constructionCost,
    external_works: estimate.externalWorks,
    preliminaries: estimate.preliminaries,
    professional_fees: estimate.professionalFees,
    statutory_costs: estimate.statutoryCosts,
    subtotal: estimate.subtotal,
    contingency: estimate.contingency,
    vat_amount: estimate.vatAmount,
    total_project_cost: estimate.totalProjectCost,
    lifecycle_years: estimate.lifecycleYears,
    annual_opex: estimate.annualOpex,
    total_lifecycle_cost: estimate.totalLifecycleCost,
    tco: estimate.tco,
    boq_line_items: estimate.lineItems,
    blueprint_observations: estimate.blueprintObservations,
    ai_confidence: estimate.aiConfidence,
    config: {},
  }).select('id').maybeSingle();
  if (error || !data) return null;
  return (data as { id: string }).id;
}

export async function saveBOQEstimate(row: BOQEstimateRow): Promise<string | null> {
  const { data, error } = await supabase.from('boq_estimates').insert(row).select('id').maybeSingle();
  if (error || !data) return null;
  return (data as { id: string }).id;
}

export async function fetchBOQHistory(projectId: string): Promise<BOQEstimate[]> {
  const { data } = await supabase
    .from('boq_estimates')
    .select('*')
    .eq('property_id', projectId)
    .order('created_at', { ascending: false })
    .limit(10);
  if (!data) return [];
  return data.map((r: Record<string, unknown>) => ({
    id: r.id as string,
    projectId: r.property_id as string,
    projectName: r.property_name as string,
    county: r.county as string,
    buildingType: r.building_type as string,
    constructionStandard: r.construction_standard as string,
    gfa: Number(r.gfa),
    floors: Number(r.floors),
    costPerSqm: Number(r.cost_per_sqm),
    constructionCost: Number(r.construction_cost),
    externalWorks: Number(r.external_works),
    preliminaries: Number(r.preliminaries),
    professionalFees: (r.professional_fees as { name: string; rate: number; amount: number }[]) ?? [],
    statutoryCosts: Number(r.statutory_costs),
    subtotal: Number(r.subtotal),
    contingency: Number(r.contingency),
    vatAmount: Number(r.vat_amount),
    totalProjectCost: Number(r.total_project_cost),
    lifecycleYears: Number(r.lifecycle_years),
    annualOpex: Number(r.annual_opex),
    totalLifecycleCost: Number(r.total_lifecycle_cost),
    tco: Number(r.tco),
    lineItems: (r.boq_line_items as BOQLineItem[]) ?? [],
    yearlyProjection: [],
    blueprintObservations: (r.blueprint_observations as string[]) ?? [],
    aiConfidence: r.ai_confidence != null ? Number(r.ai_confidence) : null,
    createdAt: r.created_at as string,
  }));
}

export async function getBOQEstimatesForProperty(propertyId: string): Promise<BOQEstimate[]> {
  return fetchBOQHistory(propertyId);
}

// ─── Maintenance Tasks ────────────────────────────────────────────────────────
export async function fetchTasks(projectId?: string): Promise<MaintenanceTask[]> {
  let q = supabase.from('maintenance_tasks').select('*').order('created_at', { ascending: false });
  if (projectId) q = q.eq('property_id', projectId);
  const { data } = await q;
  if (!data) return [];
  return data.map((r: Record<string, unknown>) => ({
    id: r.id as string,
    projectId: r.property_id as string,
    propertyId: r.property_id as string,
    title: r.title as string,
    description: (r.description as string) || '',
    component: (r.component as string) || '',
    category: (r.category as MaintenanceTask['category']) || 'Preventive',
    priority: (r.priority as MaintenanceTask['priority']) || 'Medium',
    status: (r.status as MaintenanceTask['status']) || 'Pending',
    assignedTo: (r.assigned_to as string) || '',
    technician: (r.technician as string) || '',
    vendor: (r.vendor as string) || '',
    estimatedCost: Number(r.estimated_cost) || 0,
    actualCost: Number(r.actual_cost) || 0,
    targetDate: (r.target_date as string) || '',
    completedDate: r.completed_date as string | undefined,
    verifiedBy: r.verified_by as string | undefined,
    phone: r.phone as string | undefined,
    notes: (r.notes as string) || '',
    partsUsed: r.parts_used as string | undefined,
    labourHours: r.labour_hours != null ? Number(r.labour_hours) : undefined,
    downtime: r.downtime != null ? Number(r.downtime) : undefined,
    attachments: (r.attachments as string[]) || [],
    workOrderNumber: (r.work_order_number as string) || `WO-${r.id}`,
    createdAt: (r.created_at as string) || '',
    updatedAt: (r.updated_at as string) || '',
  }));
}

export async function fetchMaintenanceTasks(): Promise<Record<string, unknown>[]> {
  const { data } = await supabase.from('maintenance_tasks').select('*').order('created_at', { ascending: false });
  return data ?? [];
}

export async function upsertTask(task: Partial<MaintenanceTask> & { id: string }): Promise<boolean> {
  const propId = task.propertyId || task.projectId || '';
  const { error } = await supabase.from('maintenance_tasks').upsert({
    id: task.id,
    property_id: propId,
    title: task.title ?? '',
    description: task.description ?? '',
    component: task.component ?? '',
    category: task.category ?? 'Preventive',
    priority: task.priority ?? 'Medium',
    status: task.status ?? 'Pending',
    assigned_to: task.assignedTo ?? '',
    technician: task.technician ?? '',
    vendor: task.vendor ?? '',
    estimated_cost: task.estimatedCost ?? 0,
    actual_cost: task.actualCost ?? 0,
    target_date: task.targetDate ?? new Date().toISOString().slice(0, 10),
    completed_date: task.completedDate ?? null,
    verified_by: task.verifiedBy ?? null,
    phone: task.phone ?? null,
    notes: task.notes ?? '',
    parts_used: task.partsUsed ?? null,
    labour_hours: task.labourHours ?? null,
    downtime: task.downtime ?? null,
    attachments: task.attachments ?? [],
    work_order_number: task.workOrderNumber ?? `WO-${Date.now().toString().slice(-6)}`,
    updated_at: new Date().toISOString(),
  });
  return !error;
}

export async function upsertMaintenanceTask(row: Record<string, unknown>): Promise<boolean> {
  const { error } = await supabase.from('maintenance_tasks').upsert(row);
  return !error;
}

export async function deleteTask(id: string): Promise<boolean> {
  const { error } = await supabase.from('maintenance_tasks').delete().eq('id', id);
  return !error;
}

export async function deleteMaintenanceTask(id: string): Promise<boolean> {
  return deleteTask(id);
}
>>>>>>> e32241b59a56f90f714875afe8c4a1450d219a81
