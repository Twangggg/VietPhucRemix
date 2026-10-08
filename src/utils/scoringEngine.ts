import { ValidationResult } from '../types';
import { findCatalogItem, resolveGarmentBaseId } from './validationEngine';
import { SCORING_DATA } from './scoringRulesData';
import { ColorScoreResult } from './colorHarmonyEngine';

export type OutfitTier = 'MASTERPIECE' | 'VALID' | 'NEEDS_IMPROVEMENT' | 'INVALID';
export type Level = 'Perfect' | 'Good' | 'Neutral' | 'Weak' | 'Incompatible';

export interface CriterionFeedback {
  score: number; // 0 - 1
  weightedScore: number;
  level: Level;
  ruleApplied: string;
  reason: string;
  warnings: string[];
  suggestions: string[];
}

export interface ScoreContext {
  totalScore: number;
  tier: OutfitTier;
  tierLabel: string;
  isInvalid: boolean;
  criteria: {
    cultural: CriterionFeedback;
    event: CriterionFeedback;
    itemCompatibility: CriterionFeedback;
    color: CriterionFeedback;
    completeness: CriterionFeedback;
  };
}

// Chuyển đổi điểm số 0-1 thành Level
function scoreToLevel(score: number): Level {
  if (score >= 0.9) return 'Perfect';
  if (score >= 0.7) return 'Good';
  if (score >= 0.5) return 'Neutral';
  if (score >= 0.3) return 'Weak';
  return 'Incompatible';
}

export function calculateOutfitScore(
  itemIds: string[],
  contextId: string,
  validationResults: ValidationResult[],
  colorScoreResult?: ColorScoreResult
): ScoreContext {
  const items = itemIds.map(id => findCatalogItem(id)?.item).filter(Boolean);
  
  // Xây dựng dictionary các components
  const components = {
    mainTop: items.find(i => SCORING_DATA.alternative_groups.MAIN_TOP.allowed_categories.includes(i.category || '')),
    bottom: items.find(i => SCORING_DATA.alternative_groups.BOTTOM.allowed_categories.includes(i.category || '')),
    footwear: items.find(i => SCORING_DATA.alternative_groups.FOOTWEAR.allowed_categories.includes(i.category || '')),
    inner: items.find(i => SCORING_DATA.alternative_groups.INNER.allowed_categories.includes(i.category || '')),
    headwear: items.find(i => SCORING_DATA.alternative_groups.HEADWEAR.allowed_categories.includes(i.category || '')),
    jewelry: items.filter(i => SCORING_DATA.alternative_groups.ACCESSORIES.allowed_categories.includes(i.category || ''))
  };

  const weights = SCORING_DATA.criteria_weights;

  // 1. TÁCH VALIDATION KHỎI SCORING (Xử lý Invalid)
  const blockRules = validationResults.filter(r => r.severity === 'BLOCK');
  if (blockRules.length > 0) {
    return {
      totalScore: 0,
      tier: 'INVALID',
      tierLabel: 'Không đạt / Không hợp lệ',
      isInvalid: true,
      criteria: {
        cultural: createFeedback(0, 0, 'Vi phạm quy tắc nghiêm trọng (BLOCK)', blockRules.map(r => r.message).join('; ')),
        event: createFeedback(0, 0, '', ''),
        itemCompatibility: createFeedback(0, 0, '', ''),
        color: createFeedback(0, 0, '', ''),
        completeness: createFeedback(0, 0, '', '')
      }
    };
  }

  // 2. CHẤM ĐIỂM CULTURAL (30%)
  // Dựa vào các warnings liên quan đến văn hóa/form dáng
  const culturalWarnings = validationResults.filter(r => r.severity === 'WARN' && (r.ruleId?.includes('GUARD_') || r.ruleId?.includes('SILHOUETTE_')));
  let culturalScore = 1.0;
  let culturalReason = "Tuân thủ tốt các quy chuẩn văn hóa và phom dáng truyền thống.";
  if (culturalWarnings.length > 0) {
    culturalScore = Math.max(0, 1.0 - (culturalWarnings.length * 0.3));
    culturalReason = "Phát hiện một số điểm chưa chuẩn về văn hóa/phom dáng.";
  }
  const culturalFeedback = createFeedback(
    culturalScore, 
    weights.cultural, 
    'Kiểm tra tính Tôn nghiêm & Phom dáng', 
    culturalReason,
    culturalWarnings.map(w => w.message)
  );

  // 3. CHẤM ĐIỂM EVENT / BỐI CẢNH (25%)
  // Xác định dựa trên contextId và các context warning
  const eventWarnings = validationResults.filter(r => r.severity === 'WARN' && r.ruleId?.includes('CONTEXT'));
  let eventScore = 1.0;
  let eventReason = "Trang phục hoàn toàn phù hợp với bối cảnh sự kiện đã chọn.";
  if (eventWarnings.length > 0) {
    eventScore = 0.5;
    eventReason = "Trang phục có một số chi tiết chưa thực sự phù hợp với tính chất sự kiện.";
  }
  const eventFeedback = createFeedback(
    eventScore, 
    weights.event, 
    'Phù hợp Bối cảnh sự kiện', 
    eventReason,
    eventWarnings.map(w => w.message)
  );

  // 4. CHẤM ĐIỂM ITEM COMPATIBILITY (20%)
  // Dựa trên sự hòa hợp giữa top, bottom, footwear (Ví dụ: áo truyền thống + giày hiện đại)
  let compatScore = 1.0;
  let compatReason = "Các thành phần trang phục kết hợp hài hòa.";
  let compatWarnings: string[] = [];
  let compatSuggestions: string[] = [];
  
  if (components.mainTop && components.footwear) {
    const topCat = components.mainTop.category;
    const shoeCat = components.footwear.category;
    if ((topCat === 'outer_formal' || topCat === 'outer_traditional') && shoeCat === 'shoes') {
      compatScore -= 0.3;
      compatWarnings.push("Sử dụng giày hiện đại với trang phục truyền thống có thể làm giảm tính đồng bộ.");
      compatSuggestions.push("Cân nhắc sử dụng hài nhung hoặc guốc mộc để tăng độ hài hòa.");
    }
  }
  compatScore = Math.max(0, compatScore);
  const compatFeedback = createFeedback(
    compatScore, 
    weights.item_compatibility, 
    'Tương thích giữa các món đồ', 
    compatScore === 1.0 ? compatReason : "Sự kết hợp giữa các item còn điểm lệch pha.",
    compatWarnings,
    compatSuggestions
  );

  // 5. CHẤM ĐIỂM COLOR HARMONY (15%)
  let colorScoreNormalized = 1.0;
  let colorReason = "Màu sắc hài hòa.";
  let colorWarnings: string[] = [];
  if (colorScoreResult) {
    colorScoreNormalized = colorScoreResult.score / 15.0; // 0-15 -> 0-1
    colorReason = colorScoreResult.reasons.join(" ");
    if (colorScoreResult.score < 8) {
      colorWarnings.push("Màu sắc chưa thực sự liên kết tốt với nhau.");
    }
  } else {
    colorScoreNormalized = 0.8; // Default an toàn nếu không có module màu
    colorReason = "Chưa có dữ liệu phân tích màu (Dùng mức khá mặc định).";
  }
  const colorFeedback = createFeedback(
    colorScoreNormalized, 
    weights.color, 
    'Phối màu & Tương phản', 
    colorReason,
    colorWarnings
  );

  // 6. CHẤM ĐIỂM COMPLETENESS (10%)
  // Đánh giá dựa trên sự đầy đủ của các thành phần
  let completenessScore = 0.0;
  let compSuggestions: string[] = [];
  
  if (components.mainTop) completenessScore += 0.4;
  if (components.bottom) completenessScore += 0.4;
  if (components.footwear) completenessScore += 0.2;

  // Bonus cho phụ kiện hợp lý
  if (components.headwear) {
    completenessScore += 0.1;
  } else {
    compSuggestions.push("Thêm một món phụ kiện đội đầu sẽ giúp tổng thể ấn tượng hơn.");
  }
  if (components.jewelry.length > 0 && components.jewelry.length <= 3) {
    completenessScore += 0.1;
  }

  completenessScore = Math.min(1.0, completenessScore);
  let compReason = completenessScore >= 1.0 ? "Trang phục đầy đủ và phong phú." : "Trang phục đáp ứng cơ bản nhưng có thể bổ sung thêm.";
  const completenessFeedback = createFeedback(
    completenessScore, 
    weights.completeness, 
    'Mức độ hoàn thiện & Phụ kiện', 
    compReason,
    [],
    compSuggestions
  );

  // 7. TỔNG HỢP (TOTAL SCORE)
  const totalScore = 
    culturalFeedback.weightedScore + 
    eventFeedback.weightedScore + 
    compatFeedback.weightedScore + 
    colorFeedback.weightedScore + 
    completenessFeedback.weightedScore;

  let tier: OutfitTier = 'INVALID';
  let tierLabel = 'Không đạt / Không hợp lệ';

  if (totalScore >= 90) {
    tier = 'MASTERPIECE';
    tierLabel = 'Hoàn hảo / Chuẩn mực';
  } else if (totalScore >= 70) {
    tier = 'VALID';
    tierLabel = 'Đạt chuẩn';
  } else if (totalScore >= 50) {
    tier = 'NEEDS_IMPROVEMENT';
    tierLabel = 'Cần cải thiện (Có cảnh báo)';
  }

  return {
    totalScore: Math.round(totalScore),
    tier,
    tierLabel,
    isInvalid: false,
    criteria: {
      cultural: culturalFeedback,
      event: eventFeedback,
      itemCompatibility: compatFeedback,
      color: colorFeedback,
      completeness: completenessFeedback
    }
  };
}

function createFeedback(
  scoreNormal: number, 
  weight: number, 
  ruleApplied: string, 
  reason: string, 
  warnings: string[] = [], 
  suggestions: string[] = []
): CriterionFeedback {
  return {
    score: Number(scoreNormal.toFixed(2)),
    weightedScore: Number((scoreNormal * weight).toFixed(2)),
    level: scoreToLevel(scoreNormal),
    ruleApplied,
    reason,
    warnings,
    suggestions
  };
}
