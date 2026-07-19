// src/utils/boqEngine.test.ts
import { calculateBOQ } from './boqEngine';
import { BASE_RATES } from './pricingEngine';
import type { RegionalPricingRow } from '../types';

// Mock database rows matching complete RegionalPricingRow contract expectations
const mockRegionalPricing: RegionalPricingRow[] = [
  {
    id: 'uuid-kiambu-1',
    county: 'Kiambu',
    base_cost_per_sqm_economy: 27500,
    base_cost_per_sqm_standard: 39500,
    base_cost_per_sqm_premium: 54000,
    base_cost_per_sqm_luxury: 76000,
    material_multiplier: 1.0,
    labour_multiplier: 1.0,
    service_multiplier: 1.0,
    inflation_factor: 0.06,
    transport_factor: 1.0,
    notes: null
  },
  {
    id: 'uuid-nairobi-2',
    county: 'Nairobi',
    base_cost_per_sqm_economy: 31000,
    base_cost_per_sqm_standard: 41000,
    base_cost_per_sqm_premium: 59000,
    base_cost_per_sqm_luxury: 82000,
    material_multiplier: 1.0,
    labour_multiplier: 1.0,
    service_multiplier: 1.0,
    inflation_factor: 0.06,
    transport_factor: 1.0,
    notes: null
  }
];

export function runBOQEngineTests(): { success: boolean; logs: string[] } {
  const testLogs: string[] = [];
  let trackingFailures = 0;

  const verify = (assertion: boolean, description: string) => {
    if (!assertion) {
      testLogs.push(`❌ FAIL: ${description}`);
      trackingFailures++;
    } else {
      testLogs.push(`✅ PASS: ${description}`);
    }
  };

  testLogs.push('=== STARTING BLCTS BOQ ENGINE UNIT TEST SUITE ===');

  // --------------------------------------------------------------------------
  // TEST 1 — ZERO GFA SAFETY BOUNDARY
  // --------------------------------------------------------------------------
  try {
    const zeroResult = calculateBOQ(
      'Residential', 1, 0, 'Standard', 'Kiambu', 
      mockRegionalPricing, [], null, 'proj-000', 'Zero Area Test', 30, 'General'
    );
    verify(zeroResult.gfa === 0, 'Zero floor area input forces GFA to 0.');
    verify(zeroResult.totalProjectCost === 0, 'Zero area input yields 0 CAPEX.');
    verify(zeroResult.lineItems.length === 0, 'Zero area input returns an empty line items array.');
    verify(zeroResult.yearlyProjection.length === 0, 'Zero area input returns an empty lifecycle array.');
  } catch (err) {
    verify(false, `Scenario 1 crashed with runtime exception: ${(err as Error).message}`);
  }

  // --------------------------------------------------------------------------
  // TEST 2 — REGIONAL PRICING FALLBACK ROUTER
  // --------------------------------------------------------------------------
  try {
    const defaultResult = calculateBOQ(
      'Industrial', 1, 150, 'Premium', 'Mandera', 
      mockRegionalPricing, [], null, 'proj-101', 'Fallback Testing', 30, 'General'
    );
    const expectedFallbackRate = BASE_RATES['Industrial']['Premium'];
    verify(defaultResult.costPerSqm === expectedFallbackRate, 'Unmapped counties fall back to pricingEngine BASE_RATES.');
    verify(defaultResult.totalProjectCost > 0, 'Fallback routine continues computation safely.');
  } catch (err) {
    verify(false, `Scenario 2 crashed with runtime exception: ${(err as Error).message}`);
  }

  // --------------------------------------------------------------------------
  // TEST 3 — GEOGRAPHIC HIERARCHY VALIDATION
  // --------------------------------------------------------------------------
  try {
    const mismappedCountyEstimate = calculateBOQ(
      'Residential', 1, 120, 'Standard', 'Thika', 
      mockRegionalPricing, [], null, 'proj-202', 'Thika County Fix', 30, 'General'
    );
    verify(mismappedCountyEstimate.county === 'Kiambu', 'Input county "Thika" normalizes to parent node "Kiambu".');

    const kiambuGeneral = calculateBOQ(
      'Residential', 1, 100, 'Standard', 'Kiambu', 
      mockRegionalPricing, [], null, 'proj-203', 'Kiambu General', 30, 'General'
    );
    const kiambuThika = calculateBOQ(
      'Residential', 1, 100, 'Standard', 'Kiambu', 
      mockRegionalPricing, [], null, 'proj-204', 'Kiambu Thika', 30, 'Thika'
    );
    
    const targetPremiumRate = Math.round(kiambuGeneral.costPerSqm * 1.03);
    verify(kiambuThika.costPerSqm === targetPremiumRate, 'Thika municipality applies a 3% urban modifier addition.');
  } catch (err) {
    verify(false, `Scenario 3 crashed with runtime exception: ${(err as Error).message}`);
  }

  // --------------------------------------------------------------------------
  // TEST 4 — MULTI-STOREY FOOTPRINT GEOMETRIC SCALING MATRIX
  // --------------------------------------------------------------------------
  try {
    const singleStorey = calculateBOQ(
      'Office', 1, 600, 'Standard', 'Nairobi', 
      mockRegionalPricing, [], null, 'proj-301', 'Single Floor', 30, 'General'
    );
    const multiStorey = calculateBOQ(
      'Office', 4, 150, 'Standard', 'Nairobi', 
      mockRegionalPricing, [], null, 'proj-302', 'Four Floors', 30, 'General'
    );

    verify(singleStorey.gfa === multiStorey.gfa, 'GFA totals match identically (600m²).');
    
    const substructureSingle = singleStorey.lineItems.find(li => li.section === 'Substructure Excavation & Earthworks')?.amount ?? 0;
    const substructureMulti = multiStorey.lineItems.find(li => li.section === 'Substructure Excavation & Earthworks')?.amount ?? 0;
    verify(multiStorey.gfa > 0 && substructureMulti < substructureSingle, 'Multi-storey substructure cost is smaller due to minimized footprint footprint area.');
  } catch (err) {
    verify(false, `Scenario 4 crashed with runtime exception: ${(err as Error).message}`);
  }

  // --------------------------------------------------------------------------
  // TEST 5 — LIFECYCLE AND TCO CALCULATIONS ACCURACY
  // --------------------------------------------------------------------------
  try {
    const lccResult = calculateBOQ(
      'Commercial', 2, 250, 'Standard', 'Nairobi', 
      mockRegionalPricing, [], null, 'proj-401', 'LCC Verification', 30, 'General'
    );
    verify(lccResult.yearlyProjection.length === 30, 'Lifecycle projections list contains exactly 30 annualized steps.');
    verify(lccResult.tco === lccResult.totalProjectCost + lccResult.totalLifecycleCost, 'TCO totals accurately match CAPEX + Lifecycle OPEX.');
  } catch (err) {
    verify(false, `Scenario 5 crashed with runtime exception: ${(err as Error).message}`);
  }

  testLogs.push('=== COMPLETED UNIT TEST SUITE RUN ===');
  return { success: trackingFailures === 0, logs: testLogs };
}