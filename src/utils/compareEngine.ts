import { ScoreContext, calculateOutfitScore } from './scoringEngine';
import { ValidationResult } from '../types';
import { ColorScoreResult } from './colorHarmonyEngine';

export type Winner = 'A' | 'B' | 'TIE';
export type CompareContextStatus = 'SAME_EVENT' | 'DIFFERENT_EVENT_NO_OVERRIDE' | 'OVERRIDE_EVENT';

export interface OutfitCompareInput {
  itemIds: string[];
  contextId: string;
  validationResults: ValidationResult[];
  colorScoreResult?: ColorScoreResult;
}

export interface CompareResult {
  compareContextStatus: CompareContextStatus;
  evalContextId: string | null;
  overallWinner: Winner;
  totalDifference: number;
  outfitA: ScoreContext;
  outfitB: ScoreContext;
  breakdown: {
    cultural: Winner;
    event: Winner;
    itemCompatibility: Winner;
    color: Winner;
    completeness: Winner;
  };
  strengthsA: string[];
  strengthsB: string[];
  culturalWarnings: string[];
}

function determineWinner(scoreA: number, scoreB: number): Winner {
  if (scoreA > scoreB) return 'A';
  if (scoreB > scoreA) return 'B';
  return 'TIE';
}

function mapCriterionName(key: string): string {
  switch (key) {
    case 'cultural': return 'Văn hóa & Phom dáng';
    case 'event': return 'Phù hợp Bối cảnh';
    case 'itemCompatibility': return 'Độ tương thích (Mix & Match)';
    case 'color': return 'Màu sắc (Color Harmony)';
    case 'completeness': return 'Độ hoàn thiện (Completeness)';
    default: return key;
  }
}

export function compareOutfits(
  outfitA: OutfitCompareInput,
  outfitB: OutfitCompareInput,
  overrideContextId?: string
): CompareResult {
  let compareContextStatus: CompareContextStatus;
  let evalContextA = outfitA.contextId;
  let evalContextB = outfitB.contextId;
  let evalContextId: string | null = null;

  if (overrideContextId) {
    compareContextStatus = 'OVERRIDE_EVENT';
    evalContextA = overrideContextId;
    evalContextB = overrideContextId;
    evalContextId = overrideContextId;
  } else if (outfitA.contextId === outfitB.contextId) {
    compareContextStatus = 'SAME_EVENT';
    evalContextId = outfitA.contextId;
  } else {
    compareContextStatus = 'DIFFERENT_EVENT_NO_OVERRIDE';
    evalContextId = null;
  }

  // 1. Chạy Outfit Score cho cả hai
  const scoreA = calculateOutfitScore(outfitA.itemIds, evalContextA, outfitA.validationResults, outfitA.colorScoreResult);
  const scoreB = calculateOutfitScore(outfitB.itemIds, evalContextB, outfitB.validationResults, outfitB.colorScoreResult);

  // 2. Tính chênh lệch tổng quát
  const overallWinner = determineWinner(scoreA.totalScore, scoreB.totalScore);
  const totalDifference = Math.abs(scoreA.totalScore - scoreB.totalScore);

  // 3. So sánh từng tiêu chí
  const breakdown = {
    cultural: determineWinner(scoreA.criteria.cultural.weightedScore, scoreB.criteria.cultural.weightedScore),
    event: determineWinner(scoreA.criteria.event.weightedScore, scoreB.criteria.event.weightedScore),
    itemCompatibility: determineWinner(scoreA.criteria.itemCompatibility.weightedScore, scoreB.criteria.itemCompatibility.weightedScore),
    color: determineWinner(scoreA.criteria.color.weightedScore, scoreB.criteria.color.weightedScore),
    completeness: determineWinner(scoreA.criteria.completeness.weightedScore, scoreB.criteria.completeness.weightedScore)
  };

  // 4. Tổng hợp điểm mạnh
  const strengthsA: string[] = [];
  const strengthsB: string[] = [];

  for (const [key, winner] of Object.entries(breakdown)) {
    const criterionName = mapCriterionName(key);
    if (winner === 'A') strengthsA.push(criterionName);
    if (winner === 'B') strengthsB.push(criterionName);
  }

  if (scoreA.isInvalid) strengthsB.push("Tính hợp lệ (Outfit A bị vi phạm quy tắc nghiêm trọng)");
  if (scoreB.isInvalid) strengthsA.push("Tính hợp lệ (Outfit B bị vi phạm quy tắc nghiêm trọng)");

  // 5. Tổng hợp Cảnh báo văn hóa
  const culturalWarnings: string[] = [];
  
  if (scoreA.criteria.cultural.warnings.length > 0) {
    culturalWarnings.push(`Outfit A: ${scoreA.criteria.cultural.warnings.join(' ')}`);
  }
  if (scoreB.criteria.cultural.warnings.length > 0) {
    culturalWarnings.push(`Outfit B: ${scoreB.criteria.cultural.warnings.join(' ')}`);
  }

  return {
    compareContextStatus,
    evalContextId,
    overallWinner,
    totalDifference,
    outfitA: scoreA,
    outfitB: scoreB,
    breakdown,
    strengthsA,
    strengthsB,
    culturalWarnings
  };
}
