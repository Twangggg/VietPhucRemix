import { findQuickMatchOutfit } from '../src/utils/recommendationEngine';
import { validateOutfit } from '../src/utils/validationEngine';

let passed = 0;
let failed = 0;

function assertTrue(name: string, condition: boolean, detail?: any) {
  if (condition) {
    console.log(`✅ PASS: ${name}`);
    passed++;
  } else {
    console.error(`❌ FAIL: ${name}`);
    if (detail !== undefined) {
      console.error('   Detail:', detail);
    }
    failed++;
  }
}

console.log('====================================================');
console.log('BẮT ĐẦU CHẠY SUITE KIỂM THỬ QUICK MATCH FALLBACK');
console.log('====================================================\n');

// 1. Giới tính đầu vào: Thiếu, sai, chuẩn hóa khoảng trắng
const t1_missing1 = findQuickMatchOutfit({ costumeId: 'V01', contextId: 'C01', gender: null });
assertTrue('1.1 gender = null -> INSUFFICIENT_INPUT', t1_missing1.status === 'INSUFFICIENT_INPUT', t1_missing1);

const t1_missing2 = findQuickMatchOutfit({ costumeId: 'V01', contextId: 'C01', gender: '' });
assertTrue('1.2 gender = "" -> INSUFFICIENT_INPUT', t1_missing2.status === 'INSUFFICIENT_INPUT', t1_missing2);

const t1_missing3 = findQuickMatchOutfit({ costumeId: 'V01', contextId: 'C01', gender: '   ' });
assertTrue('1.3 gender = "   " -> INSUFFICIENT_INPUT', t1_missing3.status === 'INSUFFICIENT_INPUT', t1_missing3);

const t1_invalid1 = findQuickMatchOutfit({ costumeId: 'V01', contextId: 'C01', gender: 'other' });
assertTrue('1.4 gender = "other" -> INVALID_INPUT', t1_invalid1.status === 'INVALID_INPUT', t1_invalid1);

const t1_invalid2 = findQuickMatchOutfit({ costumeId: 'V01', contextId: 'C01', gender: 'unisex' });
assertTrue('1.5 gender = "unisex" -> INVALID_INPUT', t1_invalid2.status === 'INVALID_INPUT', t1_invalid2);

const t1_trimMale = findQuickMatchOutfit({ costumeId: 'V08', contextId: 'C01', gender: '  Male  ' });
assertTrue('1.6 gender = "  Male  " chuẩn hóa thành male -> PRESET_APPLIED', t1_trimMale.status === 'PRESET_APPLIED', t1_trimMale);

const t1_trimFemale = findQuickMatchOutfit({ costumeId: 'V01', contextId: 'C01', gender: '  FEMALE  ' });
assertTrue('1.7 gender = "  FEMALE  " chuẩn hóa thành female -> FALLBACK_APPLIED', t1_trimFemale.status === 'FALLBACK_APPLIED', t1_trimFemale);

// 2. Preset hợp lệ và fallback thành công
const t2_preset = findQuickMatchOutfit({ costumeId: 'V08', contextId: 'C01', gender: 'male' });
assertTrue('2.1 V08 male có preset hợp lệ -> PRESET_APPLIED', t2_preset.status === 'PRESET_APPLIED', t2_preset);

const t2_fallbackV01 = findQuickMatchOutfit({ costumeId: 'V01', contextId: 'C01', gender: 'female' });
assertTrue('2.2 V01 female preset lỗi (acc_04 thiếu) -> FALLBACK_APPLIED', t2_fallbackV01.status === 'FALLBACK_APPLIED', t2_fallbackV01);

const t2_fallbackV09 = findQuickMatchOutfit({ costumeId: 'V09', contextId: 'C01', gender: 'male' });
assertTrue('2.3 V09 male (Viên Lĩnh - bỏ qua preset mâu thuẫn) -> FALLBACK_APPLIED', t2_fallbackV09.status === 'FALLBACK_APPLIED', t2_fallbackV09);

const t2_fallbackV10 = findQuickMatchOutfit({ costumeId: 'V10', contextId: 'C01', gender: 'female' });
assertTrue('2.4 V10 female (Đối Khâm - bỏ qua preset mâu thuẫn) -> FALLBACK_APPLIED', t2_fallbackV10.status === 'FALLBACK_APPLIED', t2_fallbackV10);

// 3. Quy ước cấu trúc slot của Fallback
if (t2_fallbackV01.status === 'FALLBACK_APPLIED') {
  const s = t2_fallbackV01.suggestion;
  assertTrue('3.1 Top garment (V01) fallback: có bottom và shoes', Boolean(s.bottomId && s.shoesId), s);
  assertTrue('3.2 Top garment (V01) fallback: không tự thêm inner (innerId = null)', s.innerId === null, s);
  assertTrue('3.3 Top garment (V01) fallback: headwear = null, jewelries = []', s.headwearId === null && s.jewelryIds.length === 0, s);
}

const t3_outerV06 = findQuickMatchOutfit({ costumeId: 'V06', contextId: 'C01', gender: 'female' });
if (t3_outerV06.status === 'FALLBACK_APPLIED') {
  const s = t3_outerV06.suggestion;
  assertTrue('3.4 Outer garment (V06) fallback: bắt buộc có inner', Boolean(s.innerId), s);
  assertTrue('3.5 Outer garment (V06) fallback: có bottom và shoes', Boolean(s.bottomId && s.shoesId), s);
  assertTrue('3.6 Outer garment (V06) fallback: headwear = null, jewelries = []', s.headwearId === null && s.jewelryIds.length === 0, s);
}

const t3_topV04 = findQuickMatchOutfit({ costumeId: 'V04', contextId: 'C01', gender: 'female' });
if (t3_topV04.status === 'FALLBACK_APPLIED') {
  const s = t3_topV04.suggestion;
  assertTrue('3.7 Top garment (V04) fallback: không tự thêm inner (innerId = null)', s.innerId === null, s);
}

// 4. Kết quả ổn định, không có BLOCK khi đưa qua validator chung
if (t3_outerV06.status === 'FALLBACK_APPLIED') {
  const s = t3_outerV06.suggestion;
  const validation = validateOutfit({
    costumeId: 'V06',
    contextId: 'C01',
    gender: 'female',
    innerId: s.innerId,
    bottomId: s.bottomId,
    shoesId: s.shoesId,
    headwearId: s.headwearId,
    jewelryIds: s.jewelryIds
  });
  assertTrue('4.1 Áp dụng fallback V06 qua validator: 0 lỗi BLOCK', !validation.some(r => r.severity === 'BLOCK'), validation);
}

// 5. Áo Yếm tiếp tục bị chặn tại nơi công cộng C01
const t5_yem = findQuickMatchOutfit({ costumeId: 'V03', contextId: 'C01', gender: 'female' });
assertTrue('5.1 V03 tại C01 -> CANDIDATES_EXHAUSTED', t5_yem.status === 'CANDIDATES_EXHAUSTED', t5_yem);
if (t5_yem.status === 'CANDIDATES_EXHAUSTED') {
  assertTrue('5.2 V03 CANDIDATES_EXHAUSTED chứa lý do chung thiếu áo khoác từ validator', t5_yem.message.includes('nội y') || t5_yem.message.includes('khoác'), t5_yem.message);
  assertTrue('5.3 V03 CANDIDATES_EXHAUSTED thông báo đúng 224 tổ hợp đã xét', t5_yem.testedCombinations === 224, t5_yem.testedCombinations);
}

// 6. Ranh giới tìm kiếm: chạm trần vs hết ứng viên vs ranh giới đúng 250
// V06 female tại C01 cần 141 tổ hợp để tới cs_03
const t6_budget100 = findQuickMatchOutfit({ costumeId: 'V06', contextId: 'C01', gender: 'female', maxSearchCombinations: 100 });
assertTrue('6.1 V06 female với trần 100 (< 141 và < tổng 2040) -> SEARCH_BUDGET_EXCEEDED', t6_budget100.status === 'SEARCH_BUDGET_EXCEEDED', t6_budget100);
if (t6_budget100.status === 'SEARCH_BUDGET_EXCEEDED') {
  assertTrue('6.2 SEARCH_BUDGET_EXCEEDED thử đúng 100 tổ hợp', t6_budget100.testedCombinations === 100, t6_budget100.testedCombinations);
}

// V06 female tại C01 với trần 141: tổ hợp thứ 141 là valid -> phải được chấp nhận thành công!
const t6_budget141 = findQuickMatchOutfit({ costumeId: 'V06', contextId: 'C01', gender: 'female', maxSearchCombinations: 141 });
assertTrue('6.3 Ứng viên hợp lệ ở lần thử thứ 141 (ngay tại trần) -> FALLBACK_APPLIED', t6_budget141.status === 'FALLBACK_APPLIED' && t6_budget141.testedCombinations === 141, t6_budget141);

// Khi tổng ứng viên khả dụng (224 của V03) nhỏ hơn trần (250): phải trả về CANDIDATES_EXHAUSTED chứ không phải SEARCH_BUDGET_EXCEEDED
assertTrue('6.4 Tập nhỏ hơn trần 250 (224 tổ hợp của V03) -> CANDIDATES_EXHAUSTED', t5_yem.status === 'CANDIDATES_EXHAUSTED', t5_yem.status);

// Kịch bản thử đúng 250 ứng viên và đó cũng là toàn bộ tập (testedCombinations === totalCombinationsAvailable):
const t6_exactTotalFail = findQuickMatchOutfit({ costumeId: 'V03', contextId: 'C01', gender: 'female', maxSearchCombinations: 224 });
assertTrue('6.5 Thử đúng 224 và đó cũng là toàn bộ tập -> CANDIDATES_EXHAUSTED (không phải SEARCH_BUDGET_EXCEEDED)', t6_exactTotalFail.status === 'CANDIDATES_EXHAUSTED', t6_exactTotalFail);

// 7. Pool ứng viên bắt buộc rỗng
const t7_emptyBottom = findQuickMatchOutfit({ costumeId: 'V01', contextId: 'C01', gender: 'female', _testEmptyPool: 'bottom' });
assertTrue('7.1 Pool bottom rỗng -> CANDIDATES_EXHAUSTED và báo thiếu dữ liệu bottom', t7_emptyBottom.status === 'CANDIDATES_EXHAUSTED' && t7_emptyBottom.message.includes('Bottom'), t7_emptyBottom);

const t7_emptyShoes = findQuickMatchOutfit({ costumeId: 'V01', contextId: 'C01', gender: 'female', _testEmptyPool: 'shoes' });
assertTrue('7.2 Pool shoes rỗng -> CANDIDATES_EXHAUSTED và báo thiếu dữ liệu footwear', t7_emptyShoes.status === 'CANDIDATES_EXHAUSTED' && t7_emptyShoes.message.includes('Footwear'), t7_emptyShoes);

const t7_emptyInner = findQuickMatchOutfit({ costumeId: 'V06', contextId: 'C01', gender: 'female', _testEmptyPool: 'inner' });
assertTrue('7.3 Pool inner rỗng đối với outer -> CANDIDATES_EXHAUSTED và báo thiếu dữ liệu innerwear', t7_emptyInner.status === 'CANDIDATES_EXHAUSTED' && t7_emptyInner.message.includes('Innerwear'), t7_emptyInner);

console.log('\n====================================================');
console.log(`KẾT QUẢ FALLBACK TEST: ${passed} PASSED, ${failed} FAILED`);
console.log('====================================================');

if (failed > 0) {
  process.exit(1);
}
