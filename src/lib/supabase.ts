// src/lib/supabase.ts
// Supabase client + auth, project, BOQ, and maintenance persistence.
import { createClient, type Session, type User } from '@supabase/supabase-js';
import type { BOQEstimate, Project, RegionalPricingRow, BlueprintAnalysisResult } from '../types';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type { Session, User };

// ─── Auth ────────────────────────────────────────────────────────────────────

export async function signUp(email: string, password: string, name: string, role: string, organization: string) {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { name, role, organization },
      emailRedirectTo: `${window.location.origin}/reset-password`,
    },
  });
  if (error) throw error;
  return data;
}

export async function signIn(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email: email.trim().toLowerCase(),
    password,
  });
  if (error) throw error;
  return data;
}

export async function signOut() {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
}

export async function resetPasswordForEmail(email: string): Promise<void> {
  const redirectTo = `${window.location.origin}/reset-password`;
  const { error } = await supabase.auth.resetPasswordForEmail(email, { redirectTo });
  if (error) throw error;
}

export async function resendVerificationEmail(email: string): Promise<void> {
  const { error } = await supabase.auth.resend({
    type: 'signup',
    email,
    options: { emailRedirectTo: `${window.location.origin}/reset-password` },
  });
  if (error) throw error;
}

export function mapSupabaseUser(u: User): { id: string; name: string; email: string; role: string; organization?: string } {
  const meta = (u.user_metadata ?? {}) as Record<string, unknown>;
  return {
    id: u.id,
    name: (meta.name as string) || u.email?.split('@')[0] || 'User',
    email: u.email ?? '',
    role: (meta.role as string) || 'Building Owner',
    organization: meta.organization as string | undefined,
  };
}

export async function fetchRegionalPricing(): Promise<RegionalPricingRow[]> {
  const { data, error } = await supabase
    .from('regional_pricing')
    .select(
      'id, county, base_cost_per_sqm_economy, base_cost_per_sqm_standard, base_cost_per_sqm_premium, base_cost_per_sqm_luxury, material_multiplier, labour_multiplier, service_multiplier, inflation_factor, transport_factor, notes'
    )
    .order('county');

  if (error) throw error;
  return (data ?? []) as RegionalPricingRow[];
}

// ─── Projects ────────────────────────────────────────────────────────────────

function serializeProject(p: Project) {
  return {
    id: p.id,
    name: p.name,
    location: p.location,
    county: p.county,
    building_type: p.buildingType,
    construction_standard: p.constructionStandard,
    floor_area_per_floor: p.floorAreaPerFloor,
    floors: p.floors,
    blueprint_analysis: p.blueprintAnalysis ?? null,
    blueprint_file_name: p.blueprintFileName ?? null,
    status: p.status ?? 'Planning',
  };
}

export function deserializeProject(row: Record<string, unknown>): Project {
  return {
    id: String(row.id),
    name: String(row.name),
    location: String(row.location ?? ''),
    county: String(row.county ?? 'Nairobi'),
    buildingType: (row.building_type as Project['buildingType']) ?? 'Residential',
    constructionStandard: (row.construction_standard as Project['constructionStandard']) ?? 'Standard',
    floorAreaPerFloor: Number(row.floor_area_per_floor ?? 0),
    floors: Number(row.floors ?? 1),
    blueprintAnalysis: (row.blueprint_analysis as BlueprintAnalysisResult | undefined) ?? undefined,
    blueprintFileName: (row.blueprint_file_name as string | undefined) ?? undefined,
    status: (row.status as Project['status']) ?? 'Planning',
    createdAt: String(row.created_at ?? new Date().toISOString()),
    updatedAt: String(row.updated_at ?? new Date().toISOString()),
  };
}

export async function fetchProjects(): Promise<Project[]> {
  const { data, error } = await supabase.from('projects').select('*').order('created_at', { ascending: false });
  if (error) throw error;
  return (data ?? []).map((r) => deserializeProject(r as Record<string, unknown>));
}

export async function createProject(p: Omit<Project, 'id' | 'createdAt' | 'updatedAt'>): Promise<Project> {
  const { data, error } = await supabase
    .from('projects')
    .insert(serializeProject(p as Project))
    .select()
    .single();
  if (error) throw error;
  return deserializeProject(data as Record<string, unknown>);
}

export async function updateProject(p: Project): Promise<void> {
  const { error } = await supabase
    .from('projects')
    .update({ ...serializeProject(p), updated_at: new Date().toISOString() })
    .eq('id', p.id);
  if (error) throw error;
}

export async function deleteProject(id: string): Promise<void> {
  const { error } = await supabase.from('projects').delete().eq('id', id);
  if (error) throw error;
}

// ─── BOQ Estimates ───────────────────────────────────────────────────────────

function serializeEstimate(estimate: BOQEstimate) {
  return {
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
  };
}

function deserializeEstimate(row: Record<string, unknown>): BOQEstimate {
  return {
    id: String(row.id),
    projectId: String(row.property_id),
    projectName: String(row.property_name),
    county: String(row.county),
    buildingType: String(row.building_type),
    constructionStandard: String(row.construction_standard),
    gfa: Number(row.gfa),
    floors: Number(row.floors),
    costPerSqm: Number(row.cost_per_sqm),
    constructionCost: Number(row.construction_cost),
    externalWorks: Number(row.external_works),
    preliminaries: Number(row.preliminaries),
    professionalFees: (row.professional_fees as BOQEstimate['professionalFees']) ?? [],
    statutoryCosts: Number(row.statutory_costs),
    subtotal: Number(row.subtotal),
    contingency: Number(row.contingency),
    vatAmount: Number(row.vat_amount),
    totalProjectCost: Number(row.total_project_cost),
    lifecycleYears: Number(row.lifecycle_years ?? 30),
    annualOpex: Number(row.annual_opex ?? 0),
    totalLifecycleCost: Number(row.total_lifecycle_cost),
    tco: Number(row.tco),
    lineItems: (row.boq_line_items as BOQEstimate['lineItems']) ?? [],
    yearlyProjection: [],
    blueprintObservations: (row.blueprint_observations as string[]) ?? [],
    aiConfidence: (row.ai_confidence as number | null) ?? null,
    createdAt: String(row.created_at ?? new Date().toISOString()),
  };
}

export async function saveBOQ(estimate: BOQEstimate): Promise<void> {
  const { error } = await supabase.from('boq_estimates').insert(serializeEstimate(estimate));
  if (error) throw error;
}

export async function fetchBOQHistory(projectId: string): Promise<BOQEstimate[]> {
  const { data, error } = await supabase
    .from('boq_estimates')
    .select('*')
    .eq('property_id', projectId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return (data ?? []).map((row) => deserializeEstimate(row as Record<string, unknown>));
}
