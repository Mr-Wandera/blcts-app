// src/utils/pricingEngine.ts
import type { RegionalPricingRow } from '../types';

export const BASE_RATES: Record<string, Record<string, number>> = {
  Residential:  { Economy: 28000, Standard: 38000, Premium: 52000, Luxury: 75000 },
  Maisonette:   { Economy: 29000, Standard: 40000, Premium: 55000, Luxury: 78000 },
  Apartment:    { Economy: 30000, Standard: 42000, Premium: 57000, Luxury: 80000 },
  Commercial:   { Economy: 35000, Standard: 48000, Premium: 65000, Luxury: 90000 },
  Office:       { Economy: 33000, Standard: 46000, Premium: 62000, Luxury: 88000 },
  'Mixed-Use':  { Economy: 32000, Standard: 43000, Premium: 58000, Luxury: 82000 },
  Warehouse:    { Economy: 18000, Standard: 25000, Premium: 35000, Luxury: 50000 },
  School:       { Economy: 22000, Standard: 30000, Premium: 42000, Luxury: 58000 },
  Hospital:     { Economy: 38000, Standard: 55000, Premium: 78000, Luxury: 110000 },
  Industrial:   { Economy: 25000, Standard: 35000, Premium: 48000, Luxury: 65000 },
};

export function resolveCostPerSqm(
  buildingType: string,
  standard: string,
  county: string,
  town: string,
  regionalPricing: RegionalPricingRow[]
): number {
  let resolvedCounty = county.trim();
  let resolvedTown = town.trim();

  // Handle geographic hierarchy fix
  if (resolvedCounty.toLowerCase() === 'thika') {
    resolvedCounty = 'Kiambu';
    resolvedTown = 'Thika';
  }

  const targetCountyNormalized = resolvedCounty.toLowerCase();
  const regionalMatch = regionalPricing.find(r => r.county.trim().toLowerCase() === targetCountyNormalized);
  
  let costPerSqm = BASE_RATES[buildingType]?.[standard] ?? BASE_RATES.Residential.Standard;
  
  if (regionalMatch) {
    const dbColumnKey = `base_cost_per_sqm_${standard.toLowerCase()}` as keyof RegionalPricingRow;
    const dbValue = regionalMatch[dbColumnKey];
    if (typeof dbValue === 'number' && dbValue > 0) {
      costPerSqm = dbValue;
    }
  }

  // Localized municipal adjustment factor
  if (resolvedCounty === 'Kiambu' && resolvedTown.toLowerCase() === 'thika') {
    costPerSqm *= 1.03; // 3% dynamic localization adjustment
  }

  return costPerSqm;
}