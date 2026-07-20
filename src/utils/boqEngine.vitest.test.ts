import { describe, it, expect } from 'vitest';
import { calculateBOQ } from './boqEngine';
import { BASE_RATES } from './pricingEngine';
import type { RegionalPricingRow } from '../types';

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
    notes: null,
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
    notes: null,
  },
];

describe('BOQ Engine — Zero GFA safety boundary', () => {
  it('returns zero GFA, CAPEX, and empty arrays for zero floor area', () => {
    const r = calculateBOQ('Residential', 1, 0, 'Standard', 'Kiambu', mockRegionalPricing, [], null, 'p0', 'Zero', 30, 'General');
    expect(r.gfa).toBe(0);
    expect(r.totalProjectCost).toBe(0);
    expect(r.lineItems).toHaveLength(0);
    expect(r.yearlyProjection).toHaveLength(0);
  });
});

describe('BOQ Engine — Regional pricing fallback', () => {
  it('falls back to BASE_RATES for unmapped counties', () => {
    const r = calculateBOQ('Industrial', 1, 150, 'Premium', 'Mandera', mockRegionalPricing, [], null, 'p1', 'Fallback', 30, 'General');
    expect(r.costPerSqm).toBe(BASE_RATES.Industrial.Premium);
    expect(r.totalProjectCost).toBeGreaterThan(0);
  });
});

describe('BOQ Engine — Geographic hierarchy (Kiambu/Thika)', () => {
  it('normalizes "Thika" county to "Kiambu"', () => {
    const r = calculateBOQ('Residential', 1, 120, 'Standard', 'Thika', mockRegionalPricing, [], null, 'p2', 'Thika Fix', 30, 'General');
    expect(r.county).toBe('Kiambu');
  });

  it('applies 3% municipal adjustment for Thika town within Kiambu', () => {
    const general = calculateBOQ('Residential', 1, 100, 'Standard', 'Kiambu', mockRegionalPricing, [], null, 'p3', 'Kiambu General', 30, 'General');
    const thika = calculateBOQ('Residential', 1, 100, 'Standard', 'Kiambu', mockRegionalPricing, [], null, 'p4', 'Kiambu Thika', 30, 'Thika');
    expect(thika.costPerSqm).toBe(Math.round(general.costPerSqm * 1.03));
  });
});

describe('BOQ Engine — Multi-storey footprint scaling', () => {
  it('produces equal GFA for 1×600 and 4×150', () => {
    const single = calculateBOQ('Office', 1, 600, 'Standard', 'Nairobi', mockRegionalPricing, [], null, 'p5', 'Single', 30, 'General');
    const multi = calculateBOQ('Office', 4, 150, 'Standard', 'Nairobi', mockRegionalPricing, [], null, 'p6', 'Multi', 30, 'General');
    expect(single.gfa).toBe(multi.gfa);
    const subSingle = single.lineItems.find(li => li.section === 'Substructure Excavation & Earthworks')?.quantity ?? 0;
    const subMulti = multi.lineItems.find(li => li.section === 'Substructure Excavation & Earthworks')?.quantity ?? 0;
    expect(subMulti).toBeLessThan(subSingle);
  });
});

describe('BOQ Engine — Lifecycle and TCO', () => {
  it('produces 30 yearly projections and TCO = CAPEX + lifecycle OPEX', () => {
    const r = calculateBOQ('Commercial', 2, 250, 'Standard', 'Nairobi', mockRegionalPricing, [], null, 'p7', 'LCC', 30, 'General');
    expect(r.yearlyProjection).toHaveLength(30);
    expect(r.tco).toBe(r.totalProjectCost + r.totalLifecycleCost);
  });
});

describe('BOQ Engine — Component weights', () => {
  it('allocates construction cost across all 21 components', () => {
    const r = calculateBOQ('Residential', 1, 200, 'Standard', 'Nairobi', mockRegionalPricing, [], null, 'p8', 'Weights', 30, 'General');
    expect(r.lineItems.length).toBe(21);
    const sum = r.lineItems.reduce((a, li) => a + li.amount, 0);
    expect(sum).toBe(r.constructionCost);
  });
});

describe('BOQ Engine — VAT and contingency', () => {
  it('applies 7.5% contingency on subtotal and 16% VAT on pre-VAT total', () => {
    const r = calculateBOQ('Residential', 1, 200, 'Standard', 'Nairobi', mockRegionalPricing, [], null, 'p9', 'VAT', 30, 'General');
    expect(r.contingency).toBe(Math.round(r.subtotal * 0.075));
    const preVat = r.subtotal + r.contingency;
    expect(r.vatAmount).toBe(Math.round(preVat * 0.16));
    expect(r.totalProjectCost).toBe(preVat + r.vatAmount);
  });
});
