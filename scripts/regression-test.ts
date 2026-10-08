import { validateOutfit } from '../src/utils/validationEngine';

let passed = 0;
let failed = 0;

function assertTest(
  name: string,
  actual: ReturnType<typeof validateOutfit>,
  expectedRuleIds: string[],
  expectedSeverities: string[]
) {
  const actualRuleIds = actual.map((r) => r.ruleId);
  const actualSeverities = actual.map((r) => r.severity);

  const ruleMatch =
    actualRuleIds.length === expectedRuleIds.length &&
    expectedRuleIds.every((id, i) => actualRuleIds[i] === id);
  const sevMatch =
    actualSeverities.length === expectedSeverities.length &&
    expectedSeverities.every((s, i) => actualSeverities[i] === s);

  if (ruleMatch && sevMatch) {
    console.log(`✅ PASS: ${name}`);
    passed++;
  } else {
    console.error(`❌ FAIL: ${name}`);
    console.error(`  Expected ruleIds:    `, expectedRuleIds);
    console.error(`  Actual ruleIds:      `, actualRuleIds);
    console.error(`  Expected severities: `, expectedSeverities);
    console.error(`  Actual severities:   `, actualSeverities);
    failed++;
  }
}

console.log('====================================================');
console.log('BẮT ĐẦU CHẠY SUITE KIỂM THỬ HỒI QUY (PHASE 2A FINAL)');
console.log('====================================================\n');

// 1. Variant giới tính đúng/sai
assertTest(
  'Variant V01_2 (Nữ) + gender: male -> BỊ CHẶN GENDER_INCOMPATIBLE',
  validateOutfit({ costumeId: 'V01_2', contextId: 'C01', gender: 'male' }),
  ['GENDER_INCOMPATIBLE'],
  ['BLOCK']
);

assertTest(
  'Variant V01_2 (Nữ) + gender: female -> HỢP LỆ (VALID_OK)',
  validateOutfit({ costumeId: 'V01_2', contextId: 'C01', gender: 'female' }),
  ['VALID_OK'],
  ['INFO']
);

assertTest(
  'Variant V01_1 (Nam) + gender: male -> HỢP LỆ (VALID_OK)',
  validateOutfit({ costumeId: 'V01_1', contextId: 'C01', gender: 'male' }),
  ['VALID_OK'],
  ['INFO']
);

assertTest(
  'Variant V01_1 (Nam) + gender: female -> BỊ CHẶN GENDER_INCOMPATIBLE',
  validateOutfit({ costumeId: 'V01_1', contextId: 'C01', gender: 'female' }),
  ['GENDER_INCOMPATIBLE'],
  ['BLOCK']
);

// 2. Base ID vẫn hoạt động cho cả 2 giới tính khi unisex
assertTest(
  'Base ID V01 + gender: male -> HỢP LỆ (VALID_OK)',
  validateOutfit({ costumeId: 'V01', contextId: 'C01', gender: 'male' }),
  ['VALID_OK'],
  ['INFO']
);

assertTest(
  'Base ID V01 + gender: female -> HỢP LỆ (VALID_OK)',
  validateOutfit({ costumeId: 'V01', contextId: 'C01', gender: 'female' }),
  ['VALID_OK'],
  ['INFO']
);

// 3. Record độc lập có hậu tố (không bị cắt gộp, giữ nguyên metadata catalog)
assertTest(
  'Record độc lập cs_11_1 (Nam) + gender: male -> HỢP LỆ (VALID_OK)',
  validateOutfit({ costumeId: 'V01', contextId: 'C01', innerId: 'cs_11_1', gender: 'male' }),
  ['VALID_OK'],
  ['INFO']
);

assertTest(
  'Record độc lập cs_11_1 (Nam) + gender: female -> BỊ CHẶN GENDER_INCOMPATIBLE',
  validateOutfit({ costumeId: 'V01', contextId: 'C01', innerId: 'cs_11_1', gender: 'female' }),
  ['GENDER_INCOMPATIBLE'],
  ['BLOCK']
);

assertTest(
  'Record độc lập cs_11_2 (Nữ) + gender: female -> HỢP LỆ (VALID_OK)',
  validateOutfit({ costumeId: 'V01', contextId: 'C01', innerId: 'cs_11_2', gender: 'female' }),
  ['VALID_OK'],
  ['INFO']
);

assertTest(
  'Record độc lập cs_11_2 (Nữ) + gender: male -> BỊ CHẶN GENDER_INCOMPATIBLE',
  validateOutfit({ costumeId: 'V01', contextId: 'C01', innerId: 'cs_11_2', gender: 'male' }),
  ['GENDER_INCOMPATIBLE'],
  ['BLOCK']
);

assertTest(
  'Record độc lập h01_1 (Nam) + gender: male -> HỢP LỆ (VALID_OK)',
  validateOutfit({ costumeId: 'V01', contextId: 'C01', headwearId: 'h01_1', gender: 'male' }),
  ['VALID_OK'],
  ['INFO']
);

assertTest(
  'Record độc lập h01_1 (Nam) + gender: female -> BỊ CHẶN GENDER_INCOMPATIBLE',
  validateOutfit({ costumeId: 'V01', contextId: 'C01', headwearId: 'h01_1', gender: 'female' }),
  ['GENDER_INCOMPATIBLE'],
  ['BLOCK']
);

assertTest(
  'Record độc lập h01_2 (Nữ) + gender: female -> HỢP LỆ (VALID_OK)',
  validateOutfit({ costumeId: 'V01', contextId: 'C01', headwearId: 'h01_2', gender: 'female' }),
  ['VALID_OK'],
  ['INFO']
);

assertTest(
  'Record độc lập h01_2 (Nữ) + gender: male -> BỊ CHẶN GENDER_INCOMPATIBLE',
  validateOutfit({ costumeId: 'V01', contextId: 'C01', headwearId: 'h01_2', gender: 'male' }),
  ['GENDER_INCOMPATIBLE'],
  ['BLOCK']
);

// 4. Dữ liệu lỗi ngăn đánh giá văn hóa (không sinh thêm kết luận văn hóa)
assertTest(
  'V06 + C01 + female + bottomId: missing -> CHỈ trả INVALID_BOTTOM_ID, KHÔNG có GUARD_FORMAL_DECONSTRUCTION',
  validateOutfit({ costumeId: 'V06', contextId: 'C01', gender: 'female', bottomId: 'missing' }),
  ['INVALID_BOTTOM_ID'],
  ['BLOCK']
);

assertTest(
  'V06 + C01 + female + bottomId: cs_10 (sai slot) -> CHỈ trả INVALID_BOTTOM_SLOT, KHÔNG có GUARD_FORMAL_DECONSTRUCTION',
  validateOutfit({ costumeId: 'V06', contextId: 'C01', gender: 'female', bottomId: 'cs_10' }),
  ['INVALID_BOTTOM_SLOT'],
  ['BLOCK']
);

assertTest(
  'V01 + C05 + female + bottomId: missing -> CHỈ trả INVALID_BOTTOM_ID, KHÔNG có GUARD_SACRED_LENGTH',
  validateOutfit({ costumeId: 'V01', contextId: 'C05', gender: 'female', bottomId: 'missing' }),
  ['INVALID_BOTTOM_ID'],
  ['BLOCK']
);

// 5. Các guardrail văn hóa và phom dáng cũ (BLOCK & WARN) vẫn hoạt động chính xác khi dữ liệu hợp lệ
assertTest(
  'V06 + C01 + female + bottomId: cs_02 (skinny jeans) -> GUARD_FORMAL_DECONSTRUCTION (BLOCK)',
  validateOutfit({ costumeId: 'V06', contextId: 'C01', bottomId: 'cs_02', gender: 'female' }),
  ['GUARD_FORMAL_DECONSTRUCTION'],
  ['BLOCK']
);

assertTest(
  'V01 + C05 + female + bottomId: cs_05 (quần shorts tại C05) -> GUARD_SACRED_LENGTH & SILHOUETTE_CHOPPY_PROPORTION (BLOCK)',
  validateOutfit({ costumeId: 'V01', contextId: 'C05', bottomId: 'cs_05', gender: 'female' }),
  ['GUARD_SACRED_LENGTH', 'SILHOUETTE_CHOPPY_PROPORTION'],
  ['BLOCK', 'BLOCK']
);

assertTest(
  'V03 + C01 + female + outerLayer: null (Áo Yếm không khoác) -> GUARD_YEM_STANDALONE (BLOCK)',
  validateOutfit({ costumeId: 'V03', contextId: 'C01', gender: 'female' }),
  ['GUARD_YEM_STANDALONE'],
  ['BLOCK']
);

assertTest(
  'V08 + C01 + female + lapelFold: left_over_right -> GUARD_GL_LAPEL (BLOCK)',
  validateOutfit({ costumeId: 'V08', contextId: 'C01', gender: 'female', lapelFold: 'left_over_right' }),
  ['GUARD_GL_LAPEL'],
  ['BLOCK']
);

assertTest(
  'V08 + C01 + female + lapelFold: null (chưa chọn chiều vạt) -> LIMITATION_GL_LAPEL (WARN)',
  validateOutfit({ costumeId: 'V08', contextId: 'C01', gender: 'female', lapelFold: null }),
  ['LIMITATION_GL_LAPEL'],
  ['WARN']
);

assertTest(
  'V10 + C01 + female + innerId: cs_10 (áo thun với Đối Khâm) -> SILHOUETTE_INNER_REDUCTION (WARN)',
  validateOutfit({ costumeId: 'V10', contextId: 'C01', innerId: 'cs_10', gender: 'female' }),
  ['SILHOUETTE_INNER_REDUCTION'],
  ['WARN']
);

console.log('\n====================================================');
console.log(`KẾT QUẢ: ${passed} PASSED, ${failed} FAILED`);
console.log('====================================================');

if (failed > 0) {
  process.exit(1);
}
