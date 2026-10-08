import { ValidationResult } from '../types';
import { GARMENTS, CONTEXTS, CASUAL_ITEMS } from '../data';
import {
  validateOutfit,
  resolveGarmentBaseId,
  findCatalogItem,
  isItemGenderCompatible,
  resolveItemEffectiveGender,
  isInnerSlotItem,
  isBottomSlotItem,
  isShoesSlotItem
} from './validationEngine';

/**
 * ENGINE GỢI Ý PHỐI ĐỒ TỰ ĐỘNG (QUICK MATCH / RECOMMENDATION ENGINE)
 * Phục vụ EPIC 04 — Quick Match 1-Click
 * Tự động tạo set đồ hoàn chỉnh chuẩn văn hóa dựa trên Cổ phục và Giới tính
 */

export interface QuickMatchSuggestion {
  innerId: string | null;
  bottomId: string | null;
  shoesId: string | null;
  headwearId: string | null;
  jewelryIds: string[];
  vibeTitle: string;
  description: string;
}

export const MAX_SEARCH_COMBINATIONS = 250;

export interface QuickMatchRequest {
  costumeId: string | null | undefined;
  contextId: string | null | undefined;
  gender: string | null | undefined;
  maxSearchCombinations?: number;
  _testEmptyPool?: 'bottom' | 'shoes' | 'inner';
}

export type QuickMatchResult =
  | {
      status: 'PRESET_APPLIED';
      suggestion: QuickMatchSuggestion;
      warnings: ValidationResult[];
    }
  | {
      status: 'FALLBACK_APPLIED';
      suggestion: QuickMatchSuggestion;
      warnings: ValidationResult[];
      testedCombinations: number;
    }
  | {
      status: 'INSUFFICIENT_INPUT';
      message: string;
    }
  | {
      status: 'INVALID_INPUT';
      message: string;
    }
  | {
      status: 'UNSUPPORTED_GARMENT_TYPE';
      message: string;
    }
  | {
      status: 'SEARCH_BUDGET_EXCEEDED';
      message: string;
      testedCombinations: number;
    }
  | {
      status: 'CANDIDATES_EXHAUSTED';
      message: string;
      testedCombinations: number;
    };

// BỘ PRESET PHỐI ĐỒ CHUẨN VĂN HÓA CHO TỪNG LOẠI CỔ PHỤC
const QUICK_MATCH_PRESETS: Record<
  string,
  {
    female: QuickMatchSuggestion;
    male: QuickMatchSuggestion;
  }
> = {
  // 1. ÁO DÀI TÂN THỜI (V01)
  V01: {
    female: {
      innerId: null,
      bottomId: 'cs_04', // Quần Culottes lụa/đũi
      shoesId: 'cs_17', // Giày cao gót quai mảnh
      headwearId: 'acc_04', // Mấn đội đầu cách tân
      jewelryIds: ['acc_02'], // Chuỗi ngọc trai
      vibeTitle: 'Áo Dài Tân Thời Thanh Lịch',
      description: 'Phối cùng quần lụa suông mềm, mấn cách tân và chuỗi ngọc trai tôn vinh nét duyên dáng phương Đông.'
    },
    male: {
      innerId: null,
      bottomId: 'cs_03', // Quần Tây ống suông
      shoesId: 'cs_15', // Giày Loafer da cổ điển
      headwearId: 'acc_05', // Khăn đóng chuẩn thức
      jewelryIds: [],
      vibeTitle: 'Áo Dài Nam Nho Nhã Đương Đại',
      description: 'Kết hợp cùng quần tây may đo và giày da cổ điển tạo nên diện mạo lịch lãm, đĩnh đạc.'
    }
  },

  // 2. ÁO TỨ THÂN (V02)
  V02: {
    female: {
      innerId: 'cs_27', // Áo quây dệt kim / Yếm
      bottomId: 'cs_07', // Chân váy Maxi xếp ly
      shoesId: 'cs_35', // Guốc mộc cao gót
      headwearId: 'acc_08', // Nón quai thao
      jewelryIds: ['acc_01'], // Kiềng bạc chạm hoa mai
      vibeTitle: 'Tứ Thân Dạo Hội Mùa Xuân',
      description: 'Phối cùng áo quây lót trong, chân váy dài thướt tha, nón ba tầm và kiềng bạc cổ truyền.'
    },
    male: {
      innerId: 'cs_10',
      bottomId: 'cs_03',
      shoesId: 'cs_14',
      headwearId: null,
      jewelryIds: [],
      vibeTitle: 'Tứ Thân Cách Tân Nam',
      description: 'Set phối tối giản hài hòa cho phong cách dân gian đương đại.'
    }
  },

  // 3. ÁO YẾM (V03)
  V03: {
    female: {
      innerId: null,
      bottomId: 'cs_22', // Chân váy lụa Satin dáng suông
      shoesId: 'cs_18', // Sandal bệt dây mảnh
      headwearId: 'acc_06', // Nón lá bài thơ
      jewelryIds: ['acc_01'], // Kiềng bạc
      vibeTitle: 'Yếm Đào Nắng Hạ Tinh Khôi',
      description: 'Phối cùng chân váy lụa satin mượt mà và kiềng bạc cổ điển cho các buổi chụp ảnh nghệ thuật.'
    },
    male: {
      innerId: 'cs_10',
      bottomId: 'cs_03',
      shoesId: 'cs_14',
      headwearId: null,
      jewelryIds: [],
      vibeTitle: 'Yếm Đào Tối Giản',
      description: 'Set phối cơ bản an toàn.'
    }
  },

  // 4. ÁO BÀ BA (V04)
  V04: {
    female: {
      innerId: 'cs_10', // Áo phông trắng
      bottomId: 'cs_04', // Quần Culottes lụa/đũi
      shoesId: 'cs_35', // Guốc mộc
      headwearId: 'acc_06', // Nón lá bài thơ
      jewelryIds: ['acc_07'], // Khăn rằn Nam Bộ
      vibeTitle: 'Bà Ba Nam Bộ Phóng Khoáng',
      description: 'Kết hợp cùng quần lụa đen buông nhẹ, nón lá truyền thống và khăn rằn mộc mạc đậm chất phương Nam.'
    },
    male: {
      innerId: 'cs_10',
      bottomId: 'cs_20', // Quần Linen ống suông
      shoesId: 'cs_14', // Sneaker trắng
      headwearId: null,
      jewelryIds: ['acc_07'], // Khăn rằn
      vibeTitle: 'Bà Ba Phong Trần Sông Nước',
      description: 'Phối cùng quần linen thoáng mát và khăn rằn Nam Bộ tự do, hào sảng.'
    }
  },

  // 5. ÁO NGŨ THÂN TAY CHẼN (V05)
  V05: {
    female: {
      innerId: 'cs_11_2', // Áo cổ lọ ôm sát
      bottomId: 'cs_03', // Quần Tây ống suông
      shoesId: 'cs_16', // Giày Mary Jane
      headwearId: 'acc_04', // Mấn cách tân
      jewelryIds: ['acc_01'], // Kiềng bạc
      vibeTitle: 'Ngũ Thân Tay Chẽn Smart-Casual',
      description: 'Sự giao thoa hoàn hảo giữa quốc phục thời Nguyễn và phong thái thời trang công sở tri thức hiện đại.'
    },
    male: {
      innerId: 'cs_10',
      bottomId: 'cs_03', // Quần Tây ống suông
      shoesId: 'cs_15', // Giày Loafer da
      headwearId: 'acc_05', // Khăn đóng
      jewelryIds: ['acc_03'], // Quạt giấy dó
      vibeTitle: 'Ngũ Thân Trí Thức Hà Thành',
      description: 'Phong thái đĩnh đạc, nho nhã của giới trí thức với khăn đóng, quần âu may đo và giày da.'
    }
  },

  // 6. ÁO TẤC (NGŨ THÂN TAY THỤNG - V06)
  V06: {
    female: {
      innerId: 'cs_10',
      bottomId: 'cs_07', // Chân váy Maxi xếp ly
      shoesId: 'cs_35', // Guốc mộc cao gót
      headwearId: 'acc_04', // Mấn đội đầu
      jewelryIds: ['acc_01'], // Kiềng bạc
      vibeTitle: 'Áo Tấc Cung Đình Trang Trọng',
      description: 'Lễ phục uy nghiêm với tay thụng to bản, kết hợp chân váy maxi và mấn vấn trang trọng.'
    },
    male: {
      innerId: 'cs_10',
      bottomId: 'cs_03', // Quần tây
      shoesId: 'cs_37', // Giày Oxford
      headwearId: 'acc_05', // Khăn đóng
      jewelryIds: ['acc_03'], // Quạt xếp
      vibeTitle: 'Áo Tấc Lễ Nghi Nghiêm Cẩn',
      description: 'Chuẩn mực lễ nghi truyền thống cho các sự kiện văn hóa, đại lễ và ngày hội di sản.'
    }
  },

  // 7. ÁO NHẬT BÌNH (V07)
  V07: {
    female: {
      innerId: 'cs_12', // Áo hai dây lụa
      bottomId: 'cs_07', // Chân váy Maxi xếp ly
      shoesId: 'cs_33', // Giày búp bê Ballet
      headwearId: 'acc_04', // Mấn cách tân
      jewelryIds: ['acc_01', 'acc_02'], // Kiềng bạc & Chuỗi ngọc trai
      vibeTitle: 'Nhật Bình Hoàng Phái Diễm Lệ',
      description: 'Khoác ngoài lộng lẫy với hoa văn ngũ sắc, phối cùng chân váy xếp ly dài và trang sức ngọc trai quý phái.'
    },
    male: {
      innerId: 'cs_10',
      bottomId: 'cs_03',
      shoesId: 'cs_15',
      headwearId: 'acc_05',
      jewelryIds: ['acc_01'],
      vibeTitle: 'Nhật Bình Lễ Hội Cung Đình',
      description: 'Set phối di sản hoàng gia trang trọng và nổi bật.'
    }
  },

  // 8. ÁO GIAO LĨNH (V08)
  V08: {
    female: {
      innerId: 'cs_27', // Áo quây dệt kim
      bottomId: 'cs_06', // Chân váy chữ A
      shoesId: 'cs_14', // Sneaker trắng
      headwearId: null,
      jewelryIds: ['acc_01'], // Kiềng bạc
      vibeTitle: 'Giao Lĩnh Dạo Phố Trẻ Trung',
      description: 'Nét cổ kính của cổ áo giao nhau kết hợp chân váy chữ A và sneaker tạo nên phong cách dạo phố ấn tượng.'
    },
    male: {
      innerId: 'cs_10',
      bottomId: 'cs_01', // Quần Jeans ống rộng
      shoesId: 'cs_14', // Sneaker trắng
      headwearId: null,
      jewelryIds: [],
      vibeTitle: 'Giao Lĩnh Phóng Khoáng Đương Đại',
      description: 'Phối cùng quần jeans ống rộng và sneaker trắng mang hơi thở streetwear hiện đại.'
    }
  },

  // 9. ÁO ĐỐI KHÂM (V09)
  V09: {
    female: {
      innerId: 'cs_12', // Áo hai dây lụa
      bottomId: 'cs_22', // Chân váy lụa Satin
      shoesId: 'cs_34', // Giày Mule mũi nhọn
      headwearId: null,
      jewelryIds: ['acc_02'], // Chuỗi ngọc trai
      vibeTitle: 'Đối Khâm Thơ Mộng & Bay Bổng',
      description: 'Dáng áo khoác buông tà song song, hòa cùng váy lụa satin mượt mà cho cảm giác bay bổng nhẹ nhàng.'
    },
    male: {
      innerId: 'cs_10',
      bottomId: 'cs_20',
      shoesId: 'cs_14',
      headwearId: null,
      jewelryIds: [],
      vibeTitle: 'Đối Khâm Thanh Thoát',
      description: 'Set đồ mộc mạc, phóng khoáng cho các không gian thưởng trà, nghệ thuật.'
    }
  }
};

/**
 * Lấy preset phối đồ nhanh cho Cổ phục và Giới tính nếu tồn tại thực sự.
 * Không tự tạo fallback cứng; bỏ qua V09/V10 do mâu thuẫn nội dung.
 */
export function getQuickMatchSuggestion(
  garmentId?: string | null,
  gender: string = 'female'
): QuickMatchSuggestion | null {
  const normGender = gender.toLowerCase() === 'male' ? 'male' : 'female';
  if (!garmentId) return null;

  const baseGarmentId = garmentId.toUpperCase().split('_')[0];
  if (baseGarmentId === 'V09' || baseGarmentId === 'V10') {
    return null;
  }

  const preset = QUICK_MATCH_PRESETS[baseGarmentId];
  if (preset && preset[normGender]) {
    return preset[normGender];
  }

  return null;
}

/**
 * ENGINE GỢI Ý PHỐI ĐỒ TỰ ĐỘNG CÓ FALLBACK THEO QUY ƯỚC SẢN PHẨM:
 * 1. Kiểm tra tính hợp lệ của đầu vào (Context, Key Piece, Giới tính).
 * 2. Thử preset tĩnh thực sự tồn tại (loại trừ V09/V10 mâu thuẫn) qua validator chung.
 * 3. Nếu preset không dùng được, tạo ứng viên fallback riêng từ catalog theo quy ước:
 *    - Fallback bắt buộc có bottom + shoes.
 *    - Key piece type: outer -> thêm một inner.
 *    - Key piece type: top hoặc inner -> không tự thêm inner.
 *    - Headwear = null, jewelryIds = [].
 *    - Duyệt theo thứ tự catalog ổn định, dừng ở ứng viên đầu tiên đạt không có BLOCK.
 *    - Giới hạn trần tìm kiếm MAX_SEARCH_COMBINATIONS.
 */
export function findQuickMatchOutfit(options: QuickMatchRequest): QuickMatchResult {
  const { costumeId, contextId, gender } = options;

  // 1. Kiểm tra đầu vào tiên quyết (INSUFFICIENT_INPUT)
  if (!contextId) {
    return {
      status: 'INSUFFICIENT_INPUT',
      message: 'Chưa đủ điều kiện: Vui lòng chọn Bối cảnh ở Bước 1 trước khi sử dụng Gợi ý phối nhanh.'
    };
  }
  if (!costumeId) {
    return {
      status: 'INSUFFICIENT_INPUT',
      message: 'Chưa đủ điều kiện: Vui lòng chọn Cổ phục ở Bước 2 trước khi sử dụng Gợi ý phối nhanh.'
    };
  }
  const rawGender = gender !== undefined && gender !== null ? String(gender).trim().toLowerCase() : '';
  if (!rawGender) {
    return {
      status: 'INSUFFICIENT_INPUT',
      message: 'Chưa đủ điều kiện: Vui lòng chọn Giới tính trước khi sử dụng Gợi ý phối nhanh.'
    };
  }
  if (rawGender !== 'male' && rawGender !== 'female') {
    return {
      status: 'INVALID_INPUT',
      message: `Dữ liệu không hợp lệ: Giới tính '${gender}' không hợp lệ (chỉ chấp nhận 'male' hoặc 'female').`
    };
  }
  const normGender = rawGender as 'male' | 'female';

  // 2. Kiểm tra tính hợp lệ của đầu vào trong catalog (INVALID_INPUT)
  const foundContext = CONTEXTS.find((c) => c.id === contextId);
  if (!foundContext) {
    return {
      status: 'INVALID_INPUT',
      message: `Dữ liệu không hợp lệ: Bối cảnh đã chọn ('${contextId}') không tồn tại trong danh mục.`
    };
  }

  const garmentItem = findCatalogItem(costumeId);
  if (!garmentItem || garmentItem.source !== 'garment') {
    return {
      status: 'INVALID_INPUT',
      message: `Dữ liệu không hợp lệ: Cổ phục trung tâm đã chọn ('${costumeId}') không tồn tại trong danh mục.`
    };
  }

  const garment = garmentItem.item;
  if (garment.type === 'shoes' || garment.category === 'traditional_footwear') {
    return {
      status: 'INVALID_INPUT',
      message: `Món đồ '${garment.name}' là giày dép truyền thống, không thể làm trang phục trung tâm (Key Piece).`
    };
  }

  const effectiveGarmentGender = resolveItemEffectiveGender(garment, costumeId);
  if (!isItemGenderCompatible(effectiveGarmentGender, normGender)) {
    return {
      status: 'INVALID_INPUT',
      message: `Món cổ phục '${garment.name}' được thiết kế dành riêng cho ${effectiveGarmentGender === 'female' ? 'Nữ' : 'Nam'}, không tương thích với giới tính ${normGender === 'female' ? 'Nữ' : 'Nam'} đang chọn.`
    };
  }

  const gType = (garment.type || '').toLowerCase();
  if (gType !== 'top' && gType !== 'inner' && gType !== 'outer') {
    return {
      status: 'UNSUPPORTED_GARMENT_TYPE',
      message: `Chưa đủ dữ liệu: Loại trang phục '${garment.type || 'chưa xác định'}' của Cổ phục chưa được hỗ trợ để tạo gợi ý tự động.`
    };
  }

  // 3. Thử PRESET thực sự tồn tại và được phép dùng
  const baseGarmentId = resolveGarmentBaseId(costumeId).toUpperCase() || costumeId.toUpperCase().split('_')[0];
  const isExcludedPreset = baseGarmentId === 'V09' || baseGarmentId === 'V10';
  const rawPreset = !isExcludedPreset ? QUICK_MATCH_PRESETS[baseGarmentId]?.[normGender] : null;

  if (rawPreset) {
    const presetValidation = validateOutfit({
      costumeId,
      innerId: rawPreset.innerId,
      bottomId: rawPreset.bottomId,
      shoesId: rawPreset.shoesId,
      headwearId: rawPreset.headwearId,
      jewelryIds: rawPreset.jewelryIds,
      contextId,
      gender: normGender
    });

    const hasBlock = presetValidation.some((r) => r.severity === 'BLOCK');
    if (!hasBlock) {
      return {
        status: 'PRESET_APPLIED',
        suggestion: rawPreset,
        warnings: presetValidation.filter((r) => r.severity === 'WARN')
      };
    }
  }

  // 4. TẠO ỨNG VIÊN FALLBACK RIÊNG TỪ CATALOG
  // Quy ước sản phẩm:
  // - Bắt buộc có bottom + shoes.
  // - Key piece type: outer -> thêm 1 inner.
  // - Key piece type: top hoặc inner -> không tự thêm inner (innerId = null).
  // - Headwear = null, jewelryIds = [].
  const requiresInner = gType === 'outer';

  const bottoms = options._testEmptyPool === 'bottom'
    ? []
    : CASUAL_ITEMS.filter(
        (item) => isBottomSlotItem(item) && isItemGenderCompatible(resolveItemEffectiveGender(item, item.id), normGender)
      );

  const allShoes = [
    ...CASUAL_ITEMS.filter(isShoesSlotItem),
    ...GARMENTS.filter(isShoesSlotItem)
  ];
  const shoes = options._testEmptyPool === 'shoes'
    ? []
    : allShoes.filter(
        (item) => isShoesSlotItem(item) && isItemGenderCompatible(resolveItemEffectiveGender(item, item.id), normGender)
      );

  const inners = requiresInner
    ? (options._testEmptyPool === 'inner'
        ? []
        : CASUAL_ITEMS.filter(
            (item) => isInnerSlotItem(item) && isItemGenderCompatible(resolveItemEffectiveGender(item, item.id), normGender)
          ))
    : [null];

  // Kiểm tra nếu pool ứng viên bắt buộc rỗng
  if (bottoms.length === 0) {
    return {
      status: 'CANDIDATES_EXHAUSTED',
      message: 'Thiếu dữ liệu ứng viên cho trang phục nửa dưới (Bottom) phù hợp với giới tính đang chọn.',
      testedCombinations: 0
    };
  }

  if (shoes.length === 0) {
    return {
      status: 'CANDIDATES_EXHAUSTED',
      message: 'Thiếu dữ liệu ứng viên cho giày dép (Footwear) phù hợp với giới tính đang chọn.',
      testedCombinations: 0
    };
  }

  if (requiresInner && inners.length === 0) {
    return {
      status: 'CANDIDATES_EXHAUSTED',
      message: 'Thiếu dữ liệu ứng viên cho áo mặc trong (Innerwear) phù hợp với giới tính đang chọn.',
      testedCombinations: 0
    };
  }

  const totalCombinationsAvailable = bottoms.length * shoes.length * inners.length;
  const searchBudget = options.maxSearchCombinations ?? MAX_SEARCH_COMBINATIONS;
  let testedCombinations = 0;

  let commonBlockRuleId: string | null = null;
  let commonBlockMessage: string | null = null;
  let isFirstFailure = true;

  // Duyệt theo thứ tự catalog ổn định (không hardcode ID ưu tiên, không safe pool, không scoring)
  for (const b of bottoms) {
    for (const s of shoes) {
      for (const inItem of inners) {
        testedCombinations++;

        const candidatePayload = {
          costumeId,
          bottomId: b.id,
          shoesId: s.id,
          innerId: inItem ? inItem.id : null,
          headwearId: null,
          jewelryIds: [],
          contextId,
          gender: normGender
        };

        const validationResults = validateOutfit(candidatePayload);
        const hasBlock = validationResults.some((r) => r.severity === 'BLOCK');

        if (!hasBlock) {
          return {
            status: 'FALLBACK_APPLIED',
            suggestion: {
              innerId: inItem ? inItem.id : null,
              bottomId: b.id,
              shoesId: s.id,
              headwearId: null,
              jewelryIds: [],
              vibeTitle: 'Gợi Ý Phối Cơ Bản',
              description: `Bộ phối cơ bản kết hợp cùng ${b.name} và ${s.name}${inItem ? ', lớp trong ' + inItem.name : ''}.`
            },
            warnings: validationResults.filter((r) => r.severity === 'WARN'),
            testedCombinations
          };
        }

        // Theo dõi nguyên nhân BLOCK chung thực sự của mọi ứng viên đã thử
        const blockErrors = validationResults.filter((r) => r.severity === 'BLOCK');
        if (isFirstFailure) {
          commonBlockRuleId = blockErrors[0]?.ruleId || null;
          commonBlockMessage = blockErrors[0]?.message || null;
          isFirstFailure = false;
        } else if (commonBlockRuleId) {
          if (!blockErrors.some((r) => r.ruleId === commonBlockRuleId)) {
            commonBlockRuleId = null;
            commonBlockMessage = null;
          }
        }

        // Ranh giới giới hạn tìm kiếm:
        // Chỉ trả SEARCH_BUDGET_EXCEEDED khi còn ứng viên chưa được kiểm tra.
        // Ứng viên hợp lệ ở lần thử thứ 250 vẫn được chấp nhận ở nhánh !hasBlock phía trên.
        if (testedCombinations >= searchBudget && testedCombinations < totalCombinationsAvailable) {
          return {
            status: 'SEARCH_BUDGET_EXCEEDED',
            message: `Đã kiểm tra ${testedCombinations} tổ hợp trong danh mục nhưng chưa tìm thấy bộ phối phù hợp trong giới hạn tìm kiếm.`,
            testedCombinations
          };
        }
      }
    }
  }

  // Đã thử hết ứng viên trong tập đã xét (kể cả trường hợp thử đúng 250 và đó là toàn bộ tập)
  const exhaustionDetail = commonBlockMessage ? `: ${commonBlockMessage}` : '.';
  return {
    status: 'CANDIDATES_EXHAUSTED',
    message: `Chưa tìm được gợi ý phù hợp trong ${testedCombinations} tổ hợp đã xét${exhaustionDetail}`,
    testedCombinations
  };
}
