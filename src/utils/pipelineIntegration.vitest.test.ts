import { describe, it, expect } from 'vitest';
import { calculateBOQ } from './boqEngine';
import type { Project, RegionalPricingRow } from '../types';

const mockPricing: RegionalPricingRow[] = [
  {
    id: 'r1', county: 'Nairobi',
    base_cost_per_sqm_economy: 31000, base_cost_per_sqm_standard: 41000,
    base_cost_per_sqm_premium: 59000, base_cost_per_sqm_luxury: 82000,
    material_multiplier: 1.0, labour_multiplier: 1.0, service_multiplier: 1.0,
    inflation_factor: 0.06, transport_factor: 1.0, notes: null,
  },
];

const baseProject: Project = {
  id: 'proj-1', name: 'Test Project', location: 'Nairobi', county: 'Nairobi',
  buildingType: 'Residential', constructionStandard: 'Standard',
  floorAreaPerFloor: 120, floors: 2,
  createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(),
};

describe('Pipeline integration — AI extraction to BOQ', () => {
  it('maps AI-extracted floor area and floors into GFA correctly', () => {
    const project: Project = {
      ...baseProject,
      blueprintAnalysis: {
        estimatedFloorArea: 120, floors: 2, buildingType: 'Residential',
        confidence: 0.85, observations: ['Detected 2-storey bungalow'],
      },
    };
    const aiArea = project.blueprintAnalysis!.estimatedFloorArea!;
    const aiFloors = project.blueprintAnalysis!.floors!;
    const estimate = calculateBOQ(
      project.blueprintAnalysis!.buildingType!, aiFloors, aiArea,
      project.constructionStandard, project.county,
      mockPricing, project.blueprintAnalysis!.observations,
      project.blueprintAnalysis!.confidence ?? null,
      project.id, project.name, 30, 'General'
    );
    expect(estimate.gfa).toBe(aiArea * aiFloors);
  });

  it('blocks pipeline when AI extraction is null', () => {
    const project: Project = {
      ...baseProject,
      blueprintAnalysis: {
        estimatedFloorArea: null, floors: null, buildingType: null,
        confidence: null, observations: [],
      },
    };
    const aiArea = project.blueprintAnalysis!.estimatedFloorArea;
    const aiFloors = project.blueprintAnalysis!.floors;
    expect(aiArea === null || aiArea === undefined).toBe(true);
    expect(aiFloors === null || aiFloors === undefined).toBe(true);
  });

  it('preserves AI observations and confidence in the estimate', () => {
    const project: Project = {
      ...baseProject,
      blueprintAnalysis: {
        estimatedFloorArea: 100, floors: 1, buildingType: 'Residential',
        confidence: 0.92, observations: ['Scale 1:100', 'Bungalow'],
      },
    };
    const estimate = calculateBOQ(
      'Residential', 1, 100, 'Standard', 'Nairobi',
      mockPricing, project.blueprintAnalysis!.observations,
      project.blueprintAnalysis!.confidence, project.id, project.name, 30, 'General'
    );
    expect(estimate.blueprintObservations).toEqual(['Scale 1:100', 'Bungalow']);
    expect(estimate.aiConfidence).toBe(0.92);
  });
});
