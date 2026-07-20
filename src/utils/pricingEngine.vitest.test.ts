import { describe, it, expect } from 'vitest';
import { resolveCostPerSqm, BASE_RATES } from './pricingEngine';
import type { RegionalPricingRow } from '../types';

const mockPricing: RegionalPricingRow[] = [
  {
    id: 'r1', county: 'Nairobi',
    base_cost_per_sqm_economy: 31000, base_cost_per_sqm_standard: 41000,
    base_cost_per_sqm_premium: 59000, base_cost_per_sqm_luxury: 82000,
    material_multiplier: 1.0, labour_multiplier: 1.0, service_multiplier: 1.0,
    inflation_factor: 0.06, transport_factor: 1.0, notes: null,
  },
  {
    id: 'r2', county: 'Kiambu',
    base_cost_per_sqm_economy: 27500, base_cost_per_sqm_standard: 39500,
    base_cost_per_sqm_premium: 54000, base_cost_per_sqm_luxury: 76000,
    material_multiplier: 1.0, labour_multiplier: 1.0, service_multiplier: 1.0,
    inflation_factor: 0.06, transport_factor: 1.0, notes: null,
  },
];

describe('Pricing Engine — Base rates', () => {
  it('returns base rate when county not in regional pricing', () => {
    const rate = resolveCostPerSqm('Residential', 'Standard', 'Mandera', 'General', mockPricing);
    expect(rate).toBe(BASE_RATES.Residential.Standard);
  });

  it('uses DB rate when county matches', () => {
    const rate = resolveCostPerSqm('Residential', 'Standard', 'Nairobi', 'General', mockPricing);
    expect(rate).toBe(41000);
  });
});

describe('Pricing Engine — County hierarchy', () => {
  it('resolves Thika to Kiambu county rate with 3% municipal adjustment', () => {
    const rate = resolveCostPerSqm('Residential', 'Standard', 'Thika', 'General', mockPricing);
    expect(rate).toBe(Math.round(39500 * 1.03));
  });

  it('applies 3% municipal adjustment for Thika town', () => {
    const general = resolveCostPerSqm('Residential', 'Standard', 'Kiambu', 'General', mockPricing);
    const thika = resolveCostPerSqm('Residential', 'Standard', 'Kiambu', 'Thika', mockPricing);
    expect(thika).toBe(Math.round(general * 1.03));
  });

  it('changes cost when switching counties', () => {
    const nairobi = resolveCostPerSqm('Residential', 'Standard', 'Nairobi', 'General', mockPricing);
    const kiambu = resolveCostPerSqm('Residential', 'Standard', 'Kiambu', 'General', mockPricing);
    expect(nairobi).not.toBe(kiambu);
  });
});

describe('Pricing Engine — Construction standards', () => {
  it('returns increasing rates for higher standards', () => {
    const economy = resolveCostPerSqm('Residential', 'Economy', 'Nairobi', 'General', mockPricing);
    const standard = resolveCostPerSqm('Residential', 'Standard', 'Nairobi', 'General', mockPricing);
    const premium = resolveCostPerSqm('Residential', 'Premium', 'Nairobi', 'General', mockPricing);
    const luxury = resolveCostPerSqm('Residential', 'Luxury', 'Nairobi', 'General', mockPricing);
    expect(economy).toBeLessThan(standard);
    expect(standard).toBeLessThan(premium);
    expect(premium).toBeLessThan(luxury);
  });
});
