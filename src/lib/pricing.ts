import { createClient } from '@supabase/supabase-js';
import type { MaterialPrice, RegionalPrice } from '../types';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// ─── Fallback defaults (used when Supabase is unreachable) ────────────────────

const FALLBACK_MATERIALS: MaterialPrice[] = [
  { id: 'm1', name: 'Cement (50kg)', category: 'Cement & Aggregates', unit: 'bag', basePrice: 850, updatedAt: '' },
  { id: 'm2', name: 'Sand (Ton)', category: 'Cement & Aggregates', unit: 'ton', basePrice: 2200, updatedAt: '' },
  { id: 'm3', name: 'Ballast (Ton)', category: 'Cement & Aggregates', unit: 'ton', basePrice: 1800, updatedAt: '' },
  { id: 'm4', name: 'Steel Bars (Y12)', category: 'Reinforcement', unit: 'kg', basePrice: 120, updatedAt: '' },
  { id: 'm5', name: 'Steel Bars (Y16)', category: 'Reinforcement', unit: 'kg', basePrice: 125, updatedAt: '' },
  { id: 'm6', name: 'BRC Mesh (A142)', category: 'Reinforcement', unit: 'sheet', basePrice: 2800, updatedAt: '' },
  { id: 'm7', name: 'Bricks (Machine)', category: 'Masonry', unit: 'no', basePrice: 18, updatedAt: '' },
  { id: 'm8', name: 'Blocks (200mm)', category: 'Masonry', unit: 'no', basePrice: 65, updatedAt: '' },
  { id: 'm9', name: 'Stone (Nairobi)', category: 'Masonry', unit: 'm²', basePrice: 3200, updatedAt: '' },
  { id: 'm10', name: 'Roofing Sheets (IT4)', category: 'Roofing', unit: 'm²', basePrice: 850, updatedAt: '' },
  { id: 'm11', name: 'Roofing Nails', category: 'Roofing', unit: 'kg', basePrice: 350, updatedAt: '' },
  { id: 'm12', name: 'Timber (4x2)', category: 'Timber', unit: 'm', basePrice: 450, updatedAt: '' },
  { id: 'm13', name: 'Plywood (18mm)', category: 'Timber', unit: 'sheet', basePrice: 3200, updatedAt: '' },
  { id: 'm14', name: 'Floor Tiles (600x600)', category: 'Finishes', unit: 'm²', basePrice: 1450, updatedAt: '' },
  { id: 'm15', name: 'Wall Paint (20L)', category: 'Finishes', unit: 'drum', basePrice: 6500, updatedAt: '' },
  { id: 'm16', name: 'Ceiling Board', category: 'Finishes', unit: 'm²', basePrice: 780, updatedAt: '' },
  { id: 'm17', name: 'Aluminum Window', category: 'Openings', unit: 'no', basePrice: 12500, updatedAt: '' },
  { id: 'm18', name: 'Panel Door', category: 'Openings', unit: 'no', basePrice: 8500, updatedAt: '' },
  { id: 'm19', name: 'PVC Pipes (110mm)', category: 'Plumbing', unit: 'm', basePrice: 1200, updatedAt: '' },
  { id: 'm20', name: 'PVC Pipes (50mm)', category: 'Plumbing', unit: 'm', basePrice: 650, updatedAt: '' },
  { id: 'm21', name: 'Electrical Cable (2.5mm)', category: 'Electrical', unit: 'm', basePrice: 85, updatedAt: '' },
  { id: 'm22', name: 'Switches', category: 'Electrical', unit: 'no', basePrice: 250, updatedAt: '' },
  { id: 'm23', name: 'Sockets', category: 'Electrical', unit: 'no', basePrice: 350, updatedAt: '' },
  { id: 'm24', name: 'Water Tank (1000L)', category: 'Water Systems', unit: 'no', basePrice: 35000, updatedAt: '' },
  { id: 'm25', name: 'Water Pump', category: 'Water Systems', unit: 'no', basePrice: 45000, updatedAt: '' },
  { id: 'm26', name: 'Bathroom Set', category: 'Sanitary', unit: 'set', basePrice: 28000, updatedAt: '' },
  { id: 'm27', name: 'Kitchen Sink', category: 'Sanitary', unit: 'no', basePrice: 12000, updatedAt: '' },
  { id: 'm28', name: 'Septic Tank', category: 'Sanitary', unit: 'no', basePrice: 85000, updatedAt: '' },
  { id: 'm29', name: 'Solar Panel (300W)', category: 'Energy', unit: 'panel', basePrice: 18000, updatedAt: '' },
  { id: 'm30', name: 'Inverter (3kW)', category: 'Energy', unit: 'no', basePrice: 65000, updatedAt: '' },
  { id: 'm31', name: 'CCTV Camera', category: 'Security', unit: 'no', basePrice: 8500, updatedAt: '' },
  { id: 'm32', name: 'Alarm System', category: 'Security', unit: 'set', basePrice: 45000, updatedAt: '' },
  { id: 'm33', name: 'Fire Extinguisher', category: 'Safety', unit: 'no', basePrice: 4500, updatedAt: '' },
  { id: 'm34', name: 'Smoke Detector', category: 'Safety', unit: 'no', basePrice: 2500, updatedAt: '' },
  { id: 'm35', name: 'Elevator (4-floor)', category: 'MEP Systems', unit: 'no', basePrice: 2500000, updatedAt: '' },
  { id: 'm36', name: 'HVAC System', category: 'MEP Systems', unit: 'set', basePrice: 420000, updatedAt: '' },
  { id: 'm37', name: 'Generator (20kVA)', category: 'MEP Systems', unit: 'no', basePrice: 350000, updatedAt: '' },
  { id: 'm38', name: 'Paving Blocks', category: 'External', unit: 'm²', basePrice: 950, updatedAt: '' },
  { id: 'm39', name: 'Chain Link Fence', category: 'External', unit: 'm', basePrice: 1200, updatedAt: '' },
  { id: 'm40', name: 'Steel Gate', category: 'External', unit: 'no', basePrice: 45000, updatedAt: '' },
  { id: 'm41', name: 'Cabinetry (Wardrobe)', category: 'Fit-out', unit: 'set', basePrice: 38000, updatedAt: '' },
  { id: 'm42', name: 'Cabinetry (Kitchen)', category: 'Fit-out', unit: 'set', basePrice: 65000, updatedAt: '' },
  { id: 'm43', name: 'Glass Partition', category: 'Fit-out', unit: 'm²', basePrice: 4500, updatedAt: '' },
  { id: 'm44', name: 'Waterproofing', category: 'Treatment', unit: 'm²', basePrice: 850, updatedAt: '' },
];

const FALLBACK_REGIONS: RegionalPrice[] = [
  { id: 'r1', county: 'Nairobi', multiplier: 1.15, updatedAt: '' },
  { id: 'r2', county: 'Mombasa', multiplier: 1.12, updatedAt: '' },
  { id: 'r3', county: 'Kisumu', multiplier: 0.95, updatedAt: '' },
  { id: 'r4', county: 'Nakuru', multiplier: 0.98, updatedAt: '' },
  { id: 'r5', county: 'Kiambu', multiplier: 1.05, updatedAt: '' },
  { id: 'r6', county: 'Machakos', multiplier: 0.92, updatedAt: '' },
  { id: 'r7', county: 'Kajiado', multiplier: 0.88, updatedAt: '' },
  { id: 'r8', county: 'Uasin Gishu', multiplier: 0.90, updatedAt: '' },
  { id: 'r9', county: 'Nyeri', multiplier: 0.93, updatedAt: '' },
  { id: 'r10', county: 'Meru', multiplier: 0.91, updatedAt: '' },
];

// ─── Public API ───────────────────────────────────────────────────────────────

export async function fetchMaterials(): Promise<MaterialPrice[]> {
  try {
    const { data, error } = await supabase
      .from('construction_materials')
      .select('id, name, category, unit, unit_price, updated_at')
      .order('category')
      .order('name');
    if (error || !data || data.length === 0) throw new Error('no data');
    return data.map(row => ({
      id: row.id,
      name: row.name,
      category: row.category,
      unit: row.unit,
      basePrice: Number(row.unit_price),
      updatedAt: row.updated_at ?? '',
    }));
  } catch {
    const cached = localStorage.getItem('blcts_materials');
    return cached ? JSON.parse(cached) : FALLBACK_MATERIALS;
  }
}

export async function fetchRegions(): Promise<RegionalPrice[]> {
  try {
    const { data, error } = await supabase
      .from('regional_pricing')
      .select('id, county, material_multiplier, updated_at')
      .order('county');
    if (error || !data || data.length === 0) throw new Error('no data');
    return data.map(row => ({
      id: row.id,
      county: row.county,
      multiplier: Number(row.material_multiplier),
      updatedAt: row.updated_at ?? '',
    }));
  } catch {
    const cached = localStorage.getItem('blcts_regions');
    return cached ? JSON.parse(cached) : FALLBACK_REGIONS;
  }
}

export async function updateMaterialPrice(id: string, basePrice: number): Promise<void> {
  try {
    const { error } = await supabase
      .from('construction_materials')
      .update({ unit_price: basePrice, updated_at: new Date().toISOString() })
      .eq('id', id);
    if (error) throw error;
  } catch {
    // best-effort; local cache updated by caller
  }
}

export async function updateRegionMultiplier(id: string, multiplier: number): Promise<void> {
  try {
    const { error } = await supabase
      .from('regional_pricing')
      .update({ material_multiplier: multiplier, updated_at: new Date().toISOString() })
      .eq('id', id);
    if (error) throw error;
  } catch {
    // best-effort; local cache updated by caller
  }
}

export async function getRegionalMultiplier(county: string): Promise<number> {
  try {
    const { data, error } = await supabase
      .from('regional_pricing')
      .select('material_multiplier')
      .eq('county', county)
      .maybeSingle();
    if (error || !data) throw new Error('no data');
    return Number(data.material_multiplier);
  } catch {
    const cached = localStorage.getItem('blcts_regions');
    if (cached) {
      const regions: RegionalPrice[] = JSON.parse(cached);
      const r = regions.find(reg => reg.county === county);
      if (r) return r.multiplier;
    }
    return FALLBACK_REGIONS.find(r => r.county === county)?.multiplier ?? 1.0;
  }
}

export { FALLBACK_MATERIALS, FALLBACK_REGIONS };
