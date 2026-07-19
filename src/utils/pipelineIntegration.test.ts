// src/utils/pipelineIntegration.test.ts
import { calculateBOQ } from './boqEngine';
import type { Project, RegionalPricingRow } from '../types';

export function runPipelineIntegrationVerification(
  incomingProjectNode: Project, 
  supabasePricingMatrix: RegionalPricingRow[]
): { productionSafe: boolean; logs: string[] } {
  const integrationLogs: string[] = [];
  let integrityFailed = false;

  integrationLogs.push('Executing BLCTS End-to-End Pipeline Integration Assessment...');

  const aiAreaInput = incomingProjectNode.blueprintAnalysis?.estimatedFloorArea;
  const aiFloorsInput = incomingProjectNode.blueprintAnalysis?.floors;
  const aiClassInput = incomingProjectNode.blueprintAnalysis?.buildingType;

  // Enforce strict narrowing defenses to intercept null or undefined inputs gracefully
  if (aiAreaInput === null || aiAreaInput === undefined || aiFloorsInput === null || aiFloorsInput === undefined || !aiClassInput) {
    integrationLogs.push('❌ PIPELINE BLOCK: Vital AI vision telemetry variables missing or null in extraction payload.');
    return { productionSafe: false, logs: integrationLogs };
  }

  // Explicit type check confirmation
  if (typeof aiAreaInput !== 'number' || typeof aiFloorsInput !== 'number') {
    integrationLogs.push('❌ PIPELINE BLOCK: Non-numeric payload format encountered.');
    integrityFailed = true;
  } else {
    integrationLogs.push('✅ Ingestion Contract Clear: Visual metrics safely isolated as numbers.');
  }

  const validArea: number = aiAreaInput;
  const validFloors: number = aiFloorsInput;
  const manualCalculatedGfa = validArea * validFloors;
  
  const finalizedEstimate = calculateBOQ(
    aiClassInput, validFloors, validArea,
    incomingProjectNode.constructionStandard, incomingProjectNode.county,
    supabasePricingMatrix, incomingProjectNode.blueprintAnalysis?.observations ?? [],
    incomingProjectNode.blueprintAnalysis?.confidence ?? null,
    incomingProjectNode.id, incomingProjectNode.name, 30, 'General'
  );

  if (finalizedEstimate.gfa !== manualCalculatedGfa) {
    integrationLogs.push(`❌ PIPELINE BLOCK: GFA metric drift detected. Engine Area (${finalizedEstimate.gfa}) vs expected bounds (${manualCalculatedGfa}).`);
    integrityFailed = true;
  } else {
    integrationLogs.push(`✅ Geometry Contract Clear: GFA mapping matches authority calculation thresholds at ${finalizedEstimate.gfa} m².`);
  }

  return {
    productionSafe: !integrityFailed,
    logs: integrationLogs
  };
}