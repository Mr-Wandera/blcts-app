// src/lib/supabase.ts
// Supabase client + BOQ estimate persistence helpers.
// Talks only to tables defined in the existing migration
// (regional_pricing, boq_estimates).
import { createClient } from '@supabase/supabase-js';
import type { BOQEstimate, RegionalPricingRow } from '../types';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// ─── Regional Pricing ──────────────────────────────────────────────────────────

export async function fetchRegionalPricing(): Promise<RegionalPricingRow[]> {
  const { data, error } = await supabase
    .from('regional_pricing')
    .select(
      'id, county, base_cost_per_sqm_economy, base_cost_per_sqm_standard, base_cost_per_sqm_premium, base_cost_per_sqm_luxury, material_multiplier, labour_multiplier, service_multiplier, inflation_factor, transport_factor, notes'
    )
    .order('county');

  if (error) {
    console.error('fetchRegionalPricing failed', error.message);
    throw error;
  }
  return (data ?? []) as RegionalPricingRow[];
}

// ─── BOQ Estimates ────────────────────────────────────────────────────────────

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
  if (error) {
    console.error('saveBOQ failed', error.message);
    throw error;
  }
}

export async function fetchBOQHistory(projectId: string): Promise<BOQEstimate[]> {
  const { data, error } = await supabase
    .from('boq_estimates')
    .select('*')
    .eq('property_id', projectId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('fetchBOQHistory failed', error.message);
    throw error;
  }
  return (data ?? []).map((row) => deserializeEstimate(row as Record<string, unknown>));
}
