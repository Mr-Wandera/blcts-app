// src/utils/calculations.ts
import type { BOQEstimate, BOQLineItem, RegionalPricingRow } from '../types';

// ============================================================================
// 1. STANDARD REGIONAL BUILDING RATES (JBC KENYA INDEX: KSh / Gross Area m²)
// ============================================================================
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

// Kenyan Joint Building Council (JBC) weight parameters. Total sum equals exactly 1.000.
const COMPONENT_ALLOCATION_WEIGHTS: Record<string, number> = {
  'Substructure Excavation & Earthworks': 0.025,
  'Foundation Reinforced Concrete':       0.045,
  'Foundation Wall Infill':               0.030,
  'Hardcore Filling & Compaction':       0.020,
  'Slab Damp-Proof Membrane (DPM)':       0.005,
  'Ground Floor Slab Cast':               0.035,
  'External Frame Masonry Walling':       0.110,
  'Internal Partition Walling':           0.050,
  'Structural Truss Timber Work':         0.065,
  'Roof Tiling & Gauge Coverings':        0.045,
  'Rainwater Gutters & Downpipes':        0.015,
  'Primary Screed & Floor Tiling':        0.090,
  'Internal Plastering & Skimming':       0.060,
  'External Texture Painting':            0.045,
  'Suspended Ceiling System Boarding':   0.050,
  'Internal Flush Doors Enclosures':      0.045,
  'Aluminium Glazing Window Casements':   0.055,
  'Plumbing Reticulation & Sanitation':   0.070,
  'Electrical Conduit Wiring':           0.070,
  'HVAC Mechanical Infrastructure':       0.040,
  'External Drainage Reticulation':       0.030
};

// ============================================================================
// 2. STANDARD METHOD OF MEASUREMENT (SMM) QUANTITY RETRIEVAL MATRIX
// ============================================================================
interface SMMQuantity {
  qty: number;
  unit: string;
}

function computeSMMQuantities(gfa: number, floors: number): Record<string, SMMQuantity> {
  const validFloors = Math.max(floors, 1);
  const footprintArea = gfa / validFloors;
  
  // Aspect ratio scaling modifier factor (1.25) accounts for typical non-rectangular perimeters
  const buildingPerimeter = Math.sqrt(footprintArea) * 4 * 1.25;
  const standardWallHeight = 3.10; // Standard clear story clearance height across Kenyan urban developments

  const doorCount = Math.max(4, Math.ceil(gfa / 28));
  const windowCount = Math.max(6, Math.ceil(gfa / 22));
  
  const totalDoorOpeningArea = doorCount * 1.89;    // 0.9m x 2.1m standard frame sizes
  const totalWindowOpeningArea = windowCount * 2.25; // 1.5m x 1.5m standard framing modules

  const externalWallGrossArea = buildingPerimeter * standardWallHeight * validFloors;
  const netExternalWallingArea = Math.max(5.0, externalWallGrossArea - (totalDoorOpeningArea + totalWindowOpeningArea));
  const internalPartitionWallingArea = gfa * 0.40;

  return {
    'Substructure Excavation & Earthworks': { qty: footprintArea * 1.15, unit: 'm³' }, // Volume metrics
    'Foundation Reinforced Concrete':       { qty: footprintArea * 0.18, unit: 'm³' }, // Volumetric mass
    'Foundation Wall Infill':               { qty: buildingPerimeter * 1.20, unit: 'm²' }, // Vertical square area
    'Hardcore Filling & Compaction':       { qty: footprintArea * 0.25, unit: 'm³' }, // Compacted layered volume
    'Slab Damp-Proof Membrane (DPM)':       { qty: footprintArea * 1.08, unit: 'm²' }, // Overlap allowance matrix
    'Ground Floor Slab Cast':               { qty: footprintArea,        unit: 'm²' },
    'External Frame Masonry Walling':       { qty: netExternalWallingArea, unit: 'm²' },
    'Internal Partition Walling':           { qty: internalPartitionWallingArea, unit: 'm²' },
    'Structural Truss Timber Work':         { qty: footprintArea * 1.18, unit: 'm²' }, // Slope surface factor correction
    'Roof Tiling & Gauge Coverings':        { qty: footprintArea * 1.18, unit: 'm²' },
    'Rainwater Gutters & Downpipes':        { qty: buildingPerimeter,    unit: 'm run' },
    'Primary Screed & Floor Tiling':        { qty: gfa * 0.95,           unit: 'm²' },
    'Internal Plastering & Skimming':       { qty: (externalWallGrossArea * 2) + (internalPartitionWallingArea * 2), unit: 'm²' },
    'External Texture Painting':            { qty: externalWallGrossArea, unit: 'm²' },
    'Suspended Ceiling System Boarding':   { qty: gfa * 0.90,           unit: 'm²' },
    'Internal Flush Doors Enclosures':      { qty: doorCount,            unit: 'No.' },
    'Aluminium Glazing Window Casements':   { qty: windowCount,          unit: 'No.' },
    'Plumbing Reticulation & Sanitation':   { qty: gfa,                  unit: 'm²' },
    'Electrical Conduit Wiring':           { qty: gfa,                  unit: 'm²' },
    'HVAC Mechanical Infrastructure':       { qty: gfa,                  unit: 'm²' },
    'External Drainage Reticulation':       { qty: footprintArea * 0.35, unit: 'm²' }
  };
}

// ============================================================================
// 3. MAIN BILL OF QUANTITIES CORE HANDLER UTILITY
// ============================================================================
export function calculateBOQ(
  buildingType: string,
  floors: number,
  floorAreaPerFloor: number,
  standard: string,
  county: string,
  regionalPricing: RegionalPricingRow[],
  blueprintObservations: string[],
  aiConfidence: number | null,
  projectId: string,
  projectName: string,
  lifecycleYears = 30
): BOQEstimate {
  const validFloors = Math.max(floors, 1);
  // Real floor area transformation tracking
  const gfa = floorAreaPerFloor * validFloors;

  // Resolve matching regional database cost index multipliers matching Kenyan Counties
  const targetCountyNormalized = county.trim().toLowerCase();
  const regionalMatch = regionalPricing.find(r => r.county.trim().toLowerCase() === targetCountyNormalized);
  
  let costPerSqm = BASE_RATES[buildingType]?.[standard] ?? BASE_RATES.Residential.Standard;
  if (regionalMatch) {
    const dbColumnKey = `base_cost_per_sqm_${standard.toLowerCase()}` as keyof RegionalPricingRow;
    const dbValue = regionalMatch[dbColumnKey];
    if (typeof dbValue === 'number' && dbValue > 0) {
      costPerSqm = dbValue;
    }
  }

  const constructionCost = gfa * costPerSqm;
  const smmQuantities = computeSMMQuantities(gfa, validFloors);

  // Compile individual lines items array records maps
  const lineItems: BOQLineItem[] = Object.entries(COMPONENT_ALLOCATION_WEIGHTS).map(([description, weight]) => {
    const allocatedCost = constructionCost * weight;
    const smmMetrics = smmQuantities[description] ?? { qty: gfa, unit: 'm²' };
    
    const quantity = Math.round(smmMetrics.qty * 10) / 10;
    const unitRate = quantity > 0 ? Math.round(allocatedCost / quantity) : 0;

    return {
      section: description,
      quantity,
      unit: smmMetrics.unit,
      unitRate,
      amount: Math.round(allocatedCost),
      source: 'estimated' as const
    };
  });

  // Calculate secondary statutory markups and fees matching Kenyan construction landscape
  const externalWorks     = Math.round(constructionCost * 0.10);
  const preliminaries     = Math.round(constructionCost * 0.10);
  
  const professionalFees = [
    { name: 'Architect',           rate: 0.035, amount: Math.round(constructionCost * 0.035) },
    { name: 'Structural Engineer', rate: 0.025, amount: Math.round(constructionCost * 0.025) },
    { name: 'Quantity Surveyor',   rate: 0.030, amount: Math.round(constructionCost * 0.030) },
    { name: 'MEP Engineer',        rate: 0.020, amount: Math.round(constructionCost * 0.020) },
    { name: 'Project Manager',     rate: 0.020, amount: Math.round(constructionCost * 0.020) }
  ];
  
  const totalProfFees   = professionalFees.reduce((accum, item) => accum + item.amount, 0);
  const statutoryCosts  = Math.round(constructionCost * 0.02); // Combined National Construction Authority (NCA) & NEMA levies
  const subtotal        = constructionCost + externalWorks + preliminaries + totalProfFees + statutoryCosts;
  const contingency     = Math.round(subtotal * 0.075);
  const preVat          = subtotal + contingency;
  const vatAmount       = Math.round(preVat * 0.16); // Standard Kenya Revenue Authority VAT coefficient
  const totalProjectCost = preVat + vatAmount;

  // Lifecycle Operational Cost Models (OPEX Tracking)
  const annualMaint = constructionCost * 0.015;
  const annualUtil  = constructionCost * 0.012;
  const annualIns   = constructionCost * 0.005;
  const annualInsp  = constructionCost * 0.002;
  const baseOpex    = annualMaint + annualUtil + annualIns + annualInsp;
  const inflation   = 0.06; // Bounded Central Bank headline inflation index

  let runningCumulativeCost = totalProjectCost;
  const yearlyProjection = Array.from({ length: lifecycleYears }, (_, index) => {
    const inflatedOpex = baseOpex * Math.pow(1 + inflation, index);
    runningCumulativeCost += inflatedOpex;
    
    return {
      year: index + 1,
      opex: Math.round(inflatedOpex),
      cumulative: Math.round(runningCumulativeCost)
    };
  });

  const totalLifecycleCost = yearlyProjection.reduce((accum, node) => accum + node.opex, 0);
  const tco = totalProjectCost + totalLifecycleCost;

  return {
    id: '', // Handled seamlessly on backend generation inserts via remote triggers
    projectId,
    projectName,
    county,
    buildingType,
    constructionStandard: standard,
    gfa,
    floors: validFloors,
    costPerSqm,
    constructionCost,
    externalWorks,
    preliminaries,
    professionalFees,
    statutoryCosts,
    subtotal,
    contingency,
    vatAmount,
    totalProjectCost,
    lifecycleYears,
    annualOpex: baseOpex,
    totalLifecycleCost,
    tco,
    lineItems,
    yearlyProjection,
    blueprintObservations,
    aiConfidence,
    createdAt: new Date().toISOString()
  };
}