import type { BOQEstimate, BOQLineItem, RegionalPricingRow } from '../types';

// ─── Base rates per building type + standard (KSh/m²) ────────────────────────
const BASE_RATES: Record<string, Record<string, number>> = {
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

// % of construction cost allocated to each BOQ section
const SECTION_WEIGHTS: [string, number][] = [
  ['Substructure & Foundation',      0.12],
  ['Concrete Frame (Columns/Beams)', 0.14],
  ['Floor Slabs',                    0.09],
  ['Masonry Walls',                  0.10],
  ['Roof Structure & Covering',      0.08],
  ['Roof Finishes & Gutters',        0.04],
  ['Doors',                          0.04],
  ['Windows & Glazing',              0.04],
  ['Floor Finishes',                 0.07],
  ['Wall Finishes & Plastering',     0.06],
  ['Ceiling & Insulation',           0.04],
  ['Plumbing & Sanitation',          0.07],
  ['Electrical Installation',        0.07],
  ['Mechanical / HVAC',              0.03],
  ['External Works & Drainage',      0.01],
];

function deriveQuantity(section: string, gfa: number, floors: number): { qty: number; unit: string } {
  const footprint = gfa / Math.max(floors, 1);
  const perimeter = Math.sqrt(footprint) * 4;
  const wallH = 3.0;
  const map: Record<string, { qty: number; unit: string }> = {
    'Substructure & Foundation':      { qty: footprint,                       unit: 'm²' },
    'Concrete Frame (Columns/Beams)': { qty: footprint * floors,              unit: 'm²' },
    'Floor Slabs':                    { qty: gfa,                             unit: 'm²' },
    'Masonry Walls':                  { qty: perimeter * wallH * floors,      unit: 'm²' },
    'Roof Structure & Covering':      { qty: footprint * 1.15,               unit: 'm²' },
    'Roof Finishes & Gutters':        { qty: perimeter * floors,             unit: 'm run' },
    'Doors':                          { qty: Math.max(4, Math.ceil(gfa / 30)), unit: 'No.' },
    'Windows & Glazing':              { qty: Math.max(6, Math.ceil(gfa / 25)), unit: 'No.' },
    'Floor Finishes':                 { qty: gfa * 0.9,                       unit: 'm²' },
    'Wall Finishes & Plastering':     { qty: perimeter * wallH * floors * 2,  unit: 'm²' },
    'Ceiling & Insulation':           { qty: gfa * 0.85,                      unit: 'm²' },
    'Plumbing & Sanitation':          { qty: gfa,                             unit: 'm²' },
    'Electrical Installation':        { qty: gfa,                             unit: 'm²' },
    'Mechanical / HVAC':              { qty: gfa,                             unit: 'm²' },
    'External Works & Drainage':      { qty: footprint * 0.3,                unit: 'm²' },
  };
  return map[section] ?? { qty: gfa, unit: 'm²' };
}

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
  lifecycleYears = 30,
): BOQEstimate {
  const gfa = floorAreaPerFloor * Math.max(floors, 1);

  // Get cost/m² from DB rates if available, else fallback table
  const regionRow = regionalPricing.find(r => r.county === county);
  let costPerSqm: number = BASE_RATES[buildingType]?.[standard] ?? BASE_RATES.Residential.Standard;

  if (regionRow) {
    const key = `base_cost_per_sqm_${standard.toLowerCase()}` as keyof RegionalPricingRow;
    const dbRate = regionRow[key] as number | undefined;
    if (dbRate && dbRate > 0) costPerSqm = dbRate;
  }

  const constructionCost = gfa * costPerSqm;

  // BOQ line items
  const lineItems: BOQLineItem[] = SECTION_WEIGHTS.map(([section, weight]) => {
    const sectionCost = constructionCost * weight;
    const { qty, unit } = deriveQuantity(section, gfa, floors);
    const unitRate = qty > 0 ? Math.round(sectionCost / qty) : 0;
    return {
      section,
      quantity: Math.round(qty * 10) / 10,
      unit,
      unitRate,
      amount: Math.round(sectionCost),
      source: 'estimated' as const,
    };
  });

  // Summary
  const externalWorks   = constructionCost * 0.10;
  const preliminaries   = constructionCost * 0.10;
  const professionalFees = [
    { name: 'Architect',           rate: 0.035, amount: constructionCost * 0.035 },
    { name: 'Structural Engineer', rate: 0.025, amount: constructionCost * 0.025 },
    { name: 'Quantity Surveyor',   rate: 0.030, amount: constructionCost * 0.030 },
    { name: 'MEP Engineer',        rate: 0.020, amount: constructionCost * 0.020 },
    { name: 'Project Manager',     rate: 0.020, amount: constructionCost * 0.020 },
  ];
  const totalProfFees  = professionalFees.reduce((s, f) => s + f.amount, 0);
  const statutoryCosts = constructionCost * 0.02;
  const subtotal       = constructionCost + externalWorks + preliminaries + totalProfFees + statutoryCosts;
  const contingency    = subtotal * 0.075;
  const preVat         = subtotal + contingency;
  const vatAmount      = preVat * 0.16;
  const totalProjectCost = preVat + vatAmount;

  // Lifecycle
  const annualMaint  = constructionCost * 0.015;
  const annualUtil   = constructionCost * 0.012;
  const annualIns    = constructionCost * 0.005;
  const annualInsp   = constructionCost * 0.002;
  const baseOpex     = annualMaint + annualUtil + annualIns + annualInsp;
  const inflation    = 0.06;

  let cumulative = totalProjectCost;
  const yearlyProjection = Array.from({ length: lifecycleYears }, (_, i) => {
    const inflated = baseOpex * Math.pow(1 + inflation, i);
    cumulative += inflated;
    return { year: i + 1, opex: Math.round(inflated), cumulative: Math.round(cumulative) };
  });
  const totalLifecycleCost = yearlyProjection.reduce((s, y) => s + y.opex, 0);
  const tco = totalProjectCost + totalLifecycleCost;

  return {
    id: '',
    projectId,
    projectName,
    county,
    buildingType,
    constructionStandard: standard,
    gfa,
    floors,
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
    createdAt: new Date().toISOString(),
  };
}

export { BASE_RATES };
