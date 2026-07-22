// src/lib/pricing.ts
// Material and regional pricing reads/writes against the live Supabase tables.
// Uses the shared supabase client (lib/supabase.ts) so it carries the real
// authenticated session — required now that RLS scopes these tables to
// authenticated users.
import { supabase } from './supabase';
import type { MaterialPrice, RegionalPrice } from '../types';

export async function fetchMaterials(): Promise<MaterialPrice[]> {
  const { data, error } = await supabase
    .from('construction_materials')
    .select('id, name, category, unit, unit_price, updated_at')
    .order('category')
    .order('name');

  if (error) throw error;
  return (data ?? []).map((row) => ({
    id: String(row.id),
    name: String(row.name),
    category: String(row.category),
    unit: String(row.unit),
    basePrice: Number(row.unit_price),
    updatedAt: String(row.updated_at ?? ''),
  }));
}

export async function fetchRegions(): Promise<RegionalPrice[]> {
  const { data, error } = await supabase
    .from('regional_pricing')
    .select('id, county, material_multiplier, updated_at')
    .order('county');

  if (error) throw error;
  return (data ?? []).map((row) => ({
    id: String(row.id),
    county: String(row.county),
    multiplier: Number(row.material_multiplier),
    updatedAt: String(row.updated_at ?? ''),
  }));
}

export async function updateMaterialPrice(id: string, basePrice: number): Promise<void> {
  const { error } = await supabase
    .from('construction_materials')
    .update({ unit_price: basePrice, updated_at: new Date().toISOString() })
    .eq('id', id);
  if (error) throw error;
}

export async function updateRegionMultiplier(id: string, multiplier: number): Promise<void> {
  const { error } = await supabase
    .from('regional_pricing')
    .update({ material_multiplier: multiplier, updated_at: new Date().toISOString() })
    .eq('id', id);
  if (error) throw error;
}

export async function getRegionalMultiplier(county: string): Promise<number> {
  const { data, error } = await supabase
    .from('regional_pricing')
    .select('material_multiplier')
    .eq('county', county)
    .maybeSingle();

  if (error) throw error;
  return data ? Number(data.material_multiplier) : 1.0;
}
