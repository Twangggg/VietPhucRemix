/**
 * BỘ KIỂM THỬ TẦNG LƯU TRỮ (STORAGE TEST SUITE)
 * Kiểm tra các tính năng:
 * - Lưu và đọc bộ phối hợp lệ
 * - Chống dữ liệu hỏng & kiểm tra chặt chẽ kiểu dữ liệu (innerId: 123, jewelryIds sai kiểu...)
 * - Chống trùng ID giữa các bản ghi (duplicate record ID)
 * - Chống trùng lặp nội dung bộ phối (kể cả khi đảo thứ tự trang sức)
 * - Chặn lưu bộ phối vi phạm kiểm định (BLOCK rule)
 * - Bảo toàn dữ liệu khi thao tác thất bại
 * - Khôi phục và đặt lại vùng nhớ hỏng
 */

import {
  STORAGE_KEY,
  isSameOutfit,
  saveOutfit,
  getSavedOutfits,
  deleteSavedOutfit,
  clearCorruptedStorage
} from './storage';

// Khởi tạo môi trường localStorage giả lập cho kiểm thử Node.js / tsx
function setupMockStorage(initialData: Record<string, string> = {}) {
  const memoryStore: Record<string, string> = { ...initialData };
  const mockStorage = {
    getItem: (key: string) => memoryStore[key] || null,
    setItem: (key: string, value: string) => {
      memoryStore[key] = String(value);
    },
    removeItem: (key: string) => {
      delete memoryStore[key];
    },
    clear: () => {
      for (const k of Object.keys(memoryStore)) {
        delete memoryStore[k];
      }
    },
    _raw: memoryStore
  };
  (global as any).localStorage = mockStorage;
  return mockStorage;
}

let passedTests = 0;
let totalTests = 0;

function assert(condition: boolean, testName: string, detail?: string) {
  totalTests++;
  if (condition) {
    passedTests++;
    console.log(`  ✓ [PASS] ${testName}`);
  } else {
    console.error(`  ✗ [FAIL] ${testName}${detail ? ` -> ${detail}` : ''}`);
    throw new Error(`Test failed: ${testName}`);
  }
}

export function runStorageTests() {
  console.log('\n=== BẮT ĐẦU KIỂM THỬ STORAGE ENGINE (VIỆT PHỤC REMIX) ===\n');

  // -------------------------------------------------------------
  // TEST GROUP 1: LƯU VÀ TRUY VẤN BẢN PHỐI HỢP LỆ
  // -------------------------------------------------------------
  console.log('1. Kiểm thử lưu và truy vấn bản phối hợp lệ:');
  const store = setupMockStorage();

  const validOutfit = {
    contextId: 'C01',
    costumeId: 'V01',
    gender: 'female' as const,
    innerId: null,
    bottomId: 'cs_03',
    shoesId: 'cs_14',
    headwearId: null,
    jewelryIds: ['j01', 'j02']
  };

  const saveRes = saveOutfit(validOutfit);
  assert(saveRes.success === true, 'Lưu thành công bộ phối đạt chuẩn');
  assert(!!saveRes.savedOutfit?.id, 'Sinh ID bản ghi hợp lệ');
  assert(Boolean(saveRes.savedOutfit?.name?.includes('Áo dài tân thời')), 'Tự động tạo tên có chứa tên Cổ phục');

  const getRes = getSavedOutfits();
  assert(!getRes.isCorrupted, 'Dữ liệu lưu không bị đánh dấu hỏng');
  assert(getRes.outfits.length === 1, 'Danh sách trả về đúng 1 bộ phối');
  assert(getRes.outfits[0].id === saveRes.savedOutfit?.id, 'Khớp ID bộ phối đã lưu');

  // -------------------------------------------------------------
  // TEST GROUP 2: CHỐNG TRÙNG LẶP NỘI DUNG (CONTENT DUPLICATE)
  // -------------------------------------------------------------
  console.log('\n2. Kiểm thử chống trùng lặp nội dung bộ phối:');

  // Trùng hoàn toàn
  const dupRes = saveOutfit(validOutfit);
  assert(dupRes.success === false && dupRes.isDuplicate === true, 'Phát hiện bộ phối trùng lặp chính xác');

  // Trùng khi đảo thứ tự phụ kiện trang sức
  const permutedJewelryOutfit = {
    ...validOutfit,
    jewelryIds: ['j02', 'j01'] // đảo vị trí
  };
  const dupPermutedRes = saveOutfit(permutedJewelryOutfit);
  assert(dupPermutedRes.success === false && dupPermutedRes.isDuplicate === true, 'Chống trùng ngay cả khi đảo thứ tự trang sức');
  assert(getSavedOutfits().outfits.length === 1, 'Số lượng bản ghi trong storage không bị tăng khi trùng');

  // -------------------------------------------------------------
  // TEST GROUP 3: CHẶN LƯU BỘ PHỐI VI PHẠM (BLOCK RULE)
  // -------------------------------------------------------------
  console.log('\n3. Kiểm thử chặn lưu khi vi phạm kiểm định (BLOCK rules):');

  // Áo Yếm (V03) đi ra công cộng (C01) mà không có áo khoác ngoài -> BLOCK
  const blockedOutfit = {
    contextId: 'C01',
    costumeId: 'V03',
    gender: 'female' as const,
    innerId: null,
    bottomId: 'cs_03',
    shoesId: 'cs_14',
    headwearId: null,
    jewelryIds: []
  };
  const blockedRes = saveOutfit(blockedOutfit);
  assert(blockedRes.success === false, 'Từ chối lưu bộ phối vi phạm BLOCK');
  assert(blockedRes.error?.includes('Áo yếm') === true, 'Nêu rõ nguyên nhân vi phạm cụ thể từ validator');
  assert(getSavedOutfits().outfits.length === 1, 'Dữ liệu cũ được bảo toàn nguyên vẹn');

  // -------------------------------------------------------------
  // TEST GROUP 4: KIỂM SOÁT KIỂU DỮ LIỆU ĐẦU VÀO VÀ BẢO VỆ CHỐNG DỮ LIỆU HỎNG
  // -------------------------------------------------------------
  console.log('\n4. Kiểm thử kiểm soát kiểu dữ liệu và chống hỏng cấu trúc:');

  // 4a. saveOutfit từ chối đầu vào sai kiểu (innerId là số 123)
  const badInputRes1 = saveOutfit({
    ...validOutfit,
    innerId: 123 as any
  });
  assert(badInputRes1.success === false, 'Từ chối đầu vào khi innerId sai kiểu dữ liệu (số 123)');

  // 4b. saveOutfit từ chối đầu vào khi jewelryIds chứa số
  const badInputRes2 = saveOutfit({
    ...validOutfit,
    jewelryIds: ['pk_03', 456 as any]
  });
  assert(badInputRes2.success === false, 'Từ chối đầu vào khi jewelryIds chứa phần tử không phải chuỗi');

  // 4c. getSavedOutfits phát hiện dữ liệu ngoài bị sửa đổi có innerId = 123
  setupMockStorage({
    [STORAGE_KEY]: JSON.stringify([
      {
        id: 'rec_bad_1',
        name: 'Bộ test hỏng',
        costumeId: 'V01',
        contextId: 'C01',
        gender: 'female',
        innerId: 123, // LỖI KIỂU DỮ LIỆU
        bottomId: 'cs_03',
        shoesId: 'cs_14',
        jewelryIds: []
      }
    ])
  });
  const corruptedCheck1 = getSavedOutfits();
  assert(corruptedCheck1.isCorrupted === true, 'Phát hiện dữ liệu hỏng khi innerId là số trong storage');
  assert(corruptedCheck1.rawError?.includes('innerId') === true, 'Báo đúng lỗi trường innerId');

  // 4d. getSavedOutfits phát hiện jewelryIds chứa số
  setupMockStorage({
    [STORAGE_KEY]: JSON.stringify([
      {
        id: 'rec_bad_2',
        name: 'Bộ test hỏng jewelry',
        costumeId: 'V01',
        contextId: 'C01',
        gender: 'female',
        innerId: null,
        bottomId: 'cs_03',
        shoesId: 'cs_14',
        jewelryIds: ['pk_01', 999] // LỖI KIỂU DỮ LIỆU
      }
    ])
  });
  const corruptedCheck2 = getSavedOutfits();
  assert(corruptedCheck2.isCorrupted === true, 'Phát hiện dữ liệu hỏng khi jewelryIds chứa phần tử số');

  // 4e. getSavedOutfits phát hiện trùng ID giữa các bản ghi
  setupMockStorage({
    [STORAGE_KEY]: JSON.stringify([
      {
        id: 'duplicate_id_01',
        name: 'Bản phối A',
        costumeId: 'V01',
        contextId: 'C01',
        gender: 'female',
        innerId: null,
        bottomId: 'cs_03',
        shoesId: 'cs_14',
        jewelryIds: []
      },
      {
        id: 'duplicate_id_01', // TRÙNG ID VỚI BẢN PHỐI A
        name: 'Bản phối B',
        costumeId: 'V02',
        contextId: 'C02',
        gender: 'male',
        innerId: null,
        bottomId: 'cs_01',
        shoesId: 'cs_15',
        jewelryIds: []
      }
    ])
  });
  const corruptedCheck3 = getSavedOutfits();
  assert(corruptedCheck3.isCorrupted === true, 'Phát hiện dữ liệu hỏng khi có 2 bản ghi trùng ID');
  assert(corruptedCheck3.rawError?.includes('trùng lặp') === true, 'Báo đúng lỗi trùng lặp mã định danh');

  // -------------------------------------------------------------
  // TEST GROUP 5: BẢO VỆ VÀ THAO TÁC TRÊN DỮ LIỆU HỎNG
  // -------------------------------------------------------------
  console.log('\n5. Kiểm thử ngăn chặn thao tác khi dữ liệu đang bị hỏng:');

  // Khi dữ liệu đang hỏng, xóa phải thất bại và giữ nguyên
  const delCorruptedRes = deleteSavedOutfit('duplicate_id_01');
  assert(delCorruptedRes.success === false, 'Không cho phép thao tác xóa khi dữ liệu đang bị hỏng');

  // Khi dữ liệu đang hỏng, thêm mới cũng phải thất bại để bảo vệ
  const saveCorruptedRes = saveOutfit(validOutfit);
  assert(saveCorruptedRes.success === false, 'Không cho phép ghi đè khi dữ liệu đang bị hỏng');

  // Đặt lại dữ liệu hỏng qua clearCorruptedStorage
  const clearRes = clearCorruptedStorage();
  assert(clearRes.success === true, 'Đặt lại dữ liệu hỏng thành công khi người dùng xác nhận');
  const postClearCheck = getSavedOutfits();
  assert(!postClearCheck.isCorrupted && postClearCheck.outfits.length === 0, 'Vùng nhớ trở về trạng thái rỗng và hợp lệ');

  // -------------------------------------------------------------
  // TEST GROUP 6: XÓA BẢN PHỐI HỢP LỆ VÀ XỬ LÝ LỖI
  // -------------------------------------------------------------
  console.log('\n6. Kiểm thử xóa bản phối và xử lý lỗi:');
  const freshStore = setupMockStorage();

  // Lưu 2 bản phối
  const out1 = saveOutfit(validOutfit);
  const out2 = saveOutfit({
    ...validOutfit,
    costumeId: 'V05',
    gender: 'male',
    bottomId: 'cs_01',
    shoesId: 'cs_15'
  });
  assert(getSavedOutfits().outfits.length === 2, 'Lưu thành công 2 bản phối riêng biệt');

  // Xóa ID không tồn tại
  const delNonExistent = deleteSavedOutfit('non_existent_id');
  assert(delNonExistent.success === false, 'Báo lỗi chính xác khi xóa ID không tồn tại');
  assert(getSavedOutfits().outfits.length === 2, 'Dữ liệu được giữ nguyên khi xóa thất bại');

  // Xóa bản phối thứ nhất
  const delSuccess = deleteSavedOutfit(out1.savedOutfit!.id);
  assert(delSuccess.success === true, 'Xóa thành công bản phối đã chọn');
  const postDelCheck = getSavedOutfits();
  assert(postDelCheck.outfits.length === 1, 'Số lượng còn lại đúng 1 bản phối');
  assert(postDelCheck.outfits[0].id === out2.savedOutfit!.id, 'Bản phối còn lại không bị ảnh hưởng');

  console.log(`\n=== TẤT CẢ ${passedTests}/${totalTests} TESTS ĐÃ VƯỢT QUA XUẤT SẮC ===\n`);
  return true;
}

// Chạy test trực tiếp nếu file được gọi độc lập
if (process.argv[1]?.includes('storage.test')) {
  runStorageTests();
}
