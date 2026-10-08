import { ValidationResult } from '../types';
import { GARMENTS, CONTEXTS, CASUAL_ITEMS, ACCESSORIES } from '../data';

export interface ValidateOutfitOptions {
  costumeId?: string | string[] | null;
  innerId?: string | null;
  bottomId?: string | null;
  shoesId?: string | null;
  headwearId?: string | null;
  jewelryIds?: string[] | null;
  contextId?: string | null;
  gender?: string | null;
  lapelFold?: string | null;
  outerLayer?: string | null | boolean;
}

/**
 * Lấy Base ID chuẩn nếu item có cờ has_gender_variants = true trong catalog GARMENTS.
 * Giữ nguyên định danh riêng cho các record độc lập (như cs_11_1, cs_11_2, h01_1, h01_2).
 */
export function resolveGarmentBaseId(id: string | null | undefined): string {
  if (!id) return '';
  const match = id.match(/^([a-zA-Z0-9]+)_[12]$/);
  if (match) {
    const baseCandidate = match[1];
    const garment = GARMENTS.find((g) => g.id.toUpperCase() === baseCandidate.toUpperCase());
    if (garment && garment.has_gender_variants) {
      return garment.id;
    }
  }
  return id;
}

/**
 * Kiểm tra xem garment ID (Base hoặc Suffix) có khớp với danh sách target hay không.
 * Chỉ công nhận quan hệ Base/Variant khi catalog xác nhận has_gender_variants = true.
 */
function isMatchingGarment(targetIds: string[], idOrIds: string | string[] | null | undefined): boolean {
  if (!idOrIds) return false;
  const ids = Array.isArray(idOrIds) ? idOrIds : [idOrIds];
  for (const id of ids) {
    const baseId = resolveGarmentBaseId(id);
    for (const t of targetIds) {
      const tBase = resolveGarmentBaseId(t);
      if (t === id || t === baseId || tBase === id || tBase === baseId) {
        return true;
      }
    }
  }
  return false;
}

/**
 * Helper tìm item trong toàn bộ catalog (CASUAL_ITEMS, GARMENTS, ACCESSORIES).
 * Tôn trọng phân giải variant dựa trên has_gender_variants = true.
 */
export function findCatalogItem(id: string | null | undefined): { item: any; source: 'casual' | 'garment' | 'accessory' } | null {
  if (!id) return null;
  const casual = CASUAL_ITEMS.find((c) => c.id === id);
  if (casual) return { item: casual, source: 'casual' };

  const garmentBase = resolveGarmentBaseId(id);
  const garment = GARMENTS.find((g) => g.id === id || g.id === garmentBase);
  if (garment) return { item: garment, source: 'garment' };

  const accessory = ACCESSORIES.find((a) => a.id === id);
  if (accessory) return { item: accessory, source: 'accessory' };

  return null;
}

/**
 * Helper kiểm tra tương thích giới tính dựa trên metadata của item.
 * - 'unisex' hoặc thiếu trường: tương thích với mọi giới tính.
 * - 'male' / 'female': bắt buộc phải khớp với targetGender.
 */
export function isItemGenderCompatible(itemGender: string | undefined | null, targetGender: string | undefined | null): boolean {
  if (!itemGender || !targetGender) return true;
  const ig = itemGender.toLowerCase().trim();
  const tg = targetGender.toLowerCase().trim();
  if (ig === 'unisex' || ig === '') return true;
  return ig === tg;
}

/**
 * Lấy giới tính hiệu lực của món đồ:
 * - Nếu là variant của catalog item có cờ has_gender_variants = true:
 *   - Hậu tố _1 quy ước là 'male' (theo helpers.ts)
 *   - Hậu tố _2 quy ước là 'female' (theo helpers.ts)
 * - Nếu không phải variant có cờ này, giữ nguyên item.gender từ catalog.
 */
export function resolveItemEffectiveGender(item: any, rawId: string | null | undefined): string | null | undefined {
  if (!item || !rawId) return item?.gender;
  if (item.has_gender_variants) {
    const match = rawId.match(/^([a-zA-Z0-9]+)_([12])$/);
    if (match) {
      return match[2] === '1' ? 'male' : 'female';
    }
  }
  return item.gender;
}

export function isInnerSlotItem(item: any): boolean {
  if (!item) return false;
  const type = (item?.type || '').toLowerCase();
  const category = (item?.category || '').toLowerCase();
  return (type === 'inner' || category === 'inner') && type !== 'shoes' && category !== 'traditional_footwear';
}

export function isBottomSlotItem(item: any): boolean {
  if (!item) return false;
  const type = (item?.type || '').toLowerCase();
  const category = (item?.category || '').toLowerCase();
  return type === 'bottom' || category.includes('bottom') || category.includes('pants') || category.includes('skirt');
}

export function isShoesSlotItem(item: any): boolean {
  if (!item) return false;
  const type = (item?.type || '').toLowerCase();
  const category = (item?.category || '').toLowerCase();
  return type === 'shoes' || category.includes('shoes') || category.includes('footwear') || category === 'traditional_footwear';
}

function isHeadwearSlotItem(item: any): boolean {
  if (!item) return false;
  const type = (item?.type || '').toLowerCase();
  const category = (item?.category || '').toLowerCase();
  return type === 'headwear' || category === 'headwear';
}

function isJewelrySlotItem(item: any): boolean {
  if (!item) return false;
  const type = (item?.type || '').toLowerCase();
  const category = (item?.category || '').toLowerCase();
  return type === 'jewelry' || category === 'jewelry';
}

export function isTraditional(item: any): boolean {
  return !!item?.id && item.id.toLowerCase().startsWith('v');
}

export function isFootwear(item: any): boolean {
  return isShoesSlotItem(item);
}

export function isTraditionalClothing(item: any): boolean {
  return isTraditional(item) && !isFootwear(item);
}

/**
 * Lõi kiểm tra văn hóa và phom dáng (Deterministic Cultural & Silhouette Validation Engine)
 * Thực thi các quy tắc nghiêm ngặt bảo vệ tính tôn nghiêm và mỹ cảm trang phục Việt.
 */
export function validateOutfit(
  costumeId?: string | null | ValidateOutfitOptions,
  innerId?: string | null,
  bottomId?: string | null,
  contextId?: string | null,
  lapelFold?: string | null,
  outerLayer?: string | null | boolean,
  headwearId?: string | null,
  shoesId?: string | null,
  jewelryIds?: string[] | null,
  gender?: string | null
): ValidationResult[] {
  // Hỗ trợ cả hai kiểu gọi: dạng object hoặc dạng truyền tham số thứ tự
  let cId: string | string[] | null | undefined = typeof costumeId === 'string' || Array.isArray(costumeId) ? costumeId : null;
  let inId: string | null | undefined = innerId;
  let botId: string | null | undefined = bottomId;
  let ctxId: string | null | undefined = contextId;
  let lFold: string | null | undefined = lapelFold;
  let outLayer: string | null | boolean | undefined = outerLayer ?? null;
  let hId: string | null | undefined = headwearId;
  let shId: string | null | undefined = shoesId;
  let jIds: string[] = Array.isArray(jewelryIds) ? jewelryIds : [];
  let userGender: string | null | undefined = gender;

  if (typeof costumeId === 'object' && costumeId !== null && !Array.isArray(costumeId)) {
    const opts = costumeId as ValidateOutfitOptions;
    cId = opts.costumeId;
    inId = opts.innerId;
    botId = opts.bottomId;
    ctxId = opts.contextId;
    lFold = opts.lapelFold;
    outLayer = opts.outerLayer ?? null;
    hId = opts.headwearId;
    shId = opts.shoesId;
    jIds = Array.isArray(opts.jewelryIds) ? opts.jewelryIds : [];
    userGender = opts.gender;
  }

  const results: ValidationResult[] = [];

  // ==========================================
  // KIỂM TRA ĐIỀU KIỆN TIÊN QUYẾT & TỒN TẠI DỮ LIỆU
  // ==========================================
  if (!ctxId) {
    results.push({
      isValid: false,
      severity: 'BLOCK',
      message: 'Chưa đủ điều kiện kiểm tra: Vui lòng chọn Bối cảnh sử dụng để xác định quy chuẩn trang phục.',
      ruleId: 'MISSING_CONTEXT'
    });
  } else {
    const foundCtx = CONTEXTS.find((c) => c.id === ctxId);
    if (!foundCtx) {
      results.push({
        isValid: false,
        severity: 'BLOCK',
        message: `Dữ liệu không hợp lệ: Bối cảnh đã chọn ('${ctxId}') không tồn tại trong danh mục.`,
        ruleId: 'INVALID_CONTEXT_ID'
      });
    }
  }

  const cIdArray = Array.isArray(cId) ? cId : (cId ? [cId] : []);

  if (cIdArray.length === 0) {
    results.push({
      isValid: false,
      severity: 'BLOCK',
      message: 'Chưa đủ điều kiện kiểm tra: Vui lòng chọn Cổ phục trung tâm (Key Piece).',
      ruleId: 'MISSING_KEY_PIECE'
    });
  } else {
    for (const id of cIdArray) {
      const foundGarmentItem = findCatalogItem(id);
      if (!foundGarmentItem || foundGarmentItem.source !== 'garment') {
        results.push({
          isValid: false,
          severity: 'BLOCK',
          message: `Dữ liệu không hợp lệ: Cổ phục trung tâm đã chọn ('${id}') không tồn tại trong danh mục.`,
          ruleId: 'INVALID_KEY_PIECE_ID'
        });
      } else {
        const foundGarment = foundGarmentItem.item;
        const effectiveGender = resolveItemEffectiveGender(foundGarment, id);
        if (!isItemGenderCompatible(effectiveGender, userGender)) {
          results.push({
            isValid: false,
            severity: 'BLOCK',
            message: `Món cổ phục '${foundGarment.name}' được thiết kế dành riêng cho ${effectiveGender === 'female' ? 'Nữ' : 'Nam'}, không tương thích với giới tính ${userGender === 'female' ? 'Nữ' : 'Nam'} đang chọn.`,
            ruleId: 'GENDER_INCOMPATIBLE'
          });
        }
      }
    }
  }

  // Yêu cầu: Bắt buộc phải có bottom và shoes
  if (!botId) {
    results.push({
      isValid: false,
      severity: 'BLOCK',
      message: 'Vui lòng chọn trang phục nửa dưới (quần/váy) vì phần này không có sẵn trong Cổ phục.',
      ruleId: 'MISSING_BOTTOM_PIECE'
    });
  }

  if (!shId) {
    results.push({
      isValid: false,
      severity: 'BLOCK',
      message: 'Vui lòng chọn giày dép vì phần này không có sẵn trong Cổ phục.',
      ruleId: 'MISSING_SHOES_PIECE'
    });
  }

  // Yêu cầu: outer_formal bắt buộc phải có 1 lớp trong là loại khác (top, inner, outer_traditional)
  const hasOuterFormal = cIdArray.some(id => {
    const itemInfo = findCatalogItem(id);
    return itemInfo?.item?.category === 'outer_formal';
  });

  if (hasOuterFormal) {
    if (!inId) {
      results.push({
        isValid: false,
        severity: 'BLOCK',
        message: 'Trang phục outer_formal bắt buộc phải chọn 1 lớp trong.',
        ruleId: 'MISSING_INNER_FOR_OUTER_FORMAL'
      });
    } else {
      const innerItemInfo = findCatalogItem(inId);
      if (innerItemInfo?.item) {
        const allowedInnerCategories = ['top', 'inner', 'outer_traditional'];
        if (!allowedInnerCategories.includes(innerItemInfo.item.category)) {
          results.push({
            isValid: false,
            severity: 'BLOCK',
            message: 'Lớp trong của outer_formal phải là loại top, inner hoặc outer_traditional.',
            ruleId: 'INVALID_INNER_CATEGORY_FOR_OUTER_FORMAL'
          });
        }
      }
    }
  }

  // Kiểm tra tồn tại, đúng slot và tương thích giới tính của các món phối kèm
  if (inId) {
    const foundInnerItem = findCatalogItem(inId);
    if (!foundInnerItem) {
      results.push({
        isValid: false,
        severity: 'BLOCK',
        message: `Dữ liệu không hợp lệ: Áo mặc trong đã chọn ('${inId}') không tồn tại trong danh mục.`,
        ruleId: 'INVALID_INNER_ID'
      });
    } else {
      if (!isInnerSlotItem(foundInnerItem.item)) {
        results.push({
          isValid: false,
          severity: 'BLOCK',
          message: `Món đồ '${foundInnerItem.item.name}' không thuộc danh mục áo mặc trong (Innerwear).`,
          ruleId: 'INVALID_INNER_SLOT'
        });
      }
      const effectiveGender = resolveItemEffectiveGender(foundInnerItem.item, inId);
      if (!isItemGenderCompatible(effectiveGender, userGender)) {
        results.push({
          isValid: false,
          severity: 'BLOCK',
          message: `Món áo mặc trong '${foundInnerItem.item.name}' không tương thích với giới tính ${userGender === 'female' ? 'Nữ' : 'Nam'} đang chọn.`,
          ruleId: 'GENDER_INCOMPATIBLE'
        });
      }
    }
  }

  if (botId) {
    const foundBottomItem = findCatalogItem(botId);
    if (!foundBottomItem) {
      results.push({
        isValid: false,
        severity: 'BLOCK',
        message: `Dữ liệu không hợp lệ: Trang phục nửa dưới đã chọn ('${botId}') không tồn tại trong danh mục.`,
        ruleId: 'INVALID_BOTTOM_ID'
      });
    } else {
      if (!isBottomSlotItem(foundBottomItem.item)) {
        results.push({
          isValid: false,
          severity: 'BLOCK',
          message: `Món đồ '${foundBottomItem.item.name}' không thuộc danh mục trang phục nửa dưới (Bottom).`,
          ruleId: 'INVALID_BOTTOM_SLOT'
        });
      }
      const effectiveGender = resolveItemEffectiveGender(foundBottomItem.item, botId);
      if (!isItemGenderCompatible(effectiveGender, userGender)) {
        results.push({
          isValid: false,
          severity: 'BLOCK',
          message: `Món đồ nửa dưới '${foundBottomItem.item.name}' không tương thích với giới tính ${userGender === 'female' ? 'Nữ' : 'Nam'} đang chọn.`,
          ruleId: 'GENDER_INCOMPATIBLE'
        });
      }
    }
  }

  if (shId) {
    const foundShoesItem = findCatalogItem(shId);
    if (!foundShoesItem) {
      results.push({
        isValid: false,
        severity: 'BLOCK',
        message: `Dữ liệu không hợp lệ: Giày dép đã chọn ('${shId}') không tồn tại trong danh mục.`,
        ruleId: 'INVALID_SHOES_ID'
      });
    } else {
      if (!isShoesSlotItem(foundShoesItem.item)) {
        results.push({
          isValid: false,
          severity: 'BLOCK',
          message: `Món đồ '${foundShoesItem.item.name}' không thuộc danh mục giày dép (Footwear).`,
          ruleId: 'INVALID_SHOES_SLOT'
        });
      }
      const effectiveGender = resolveItemEffectiveGender(foundShoesItem.item, shId);
      if (!isItemGenderCompatible(effectiveGender, userGender)) {
        results.push({
          isValid: false,
          severity: 'BLOCK',
          message: `Giày dép '${foundShoesItem.item.name}' không tương thích với giới tính ${userGender === 'female' ? 'Nữ' : 'Nam'} đang chọn.`,
          ruleId: 'GENDER_INCOMPATIBLE'
        });
      }
    }
  }

  if (hId) {
    const foundHeadwearItem = findCatalogItem(hId);
    if (!foundHeadwearItem) {
      results.push({
        isValid: false,
        severity: 'BLOCK',
        message: `Dữ liệu không hợp lệ: Phụ kiện mũ nón đã chọn ('${hId}') không tồn tại trong danh mục.`,
        ruleId: 'INVALID_HEADWEAR_ID'
      });
    } else {
      if (!isHeadwearSlotItem(foundHeadwearItem.item)) {
        results.push({
          isValid: false,
          severity: 'BLOCK',
          message: `Món phụ kiện '${foundHeadwearItem.item.name}' không thuộc danh mục mũ nón (Headwear).`,
          ruleId: 'INVALID_HEADWEAR_SLOT'
        });
      }
      const effectiveGender = resolveItemEffectiveGender(foundHeadwearItem.item, hId);
      if (!isItemGenderCompatible(effectiveGender, userGender)) {
        results.push({
          isValid: false,
          severity: 'BLOCK',
          message: `Mũ nón '${foundHeadwearItem.item.name}' không tương thích với giới tính ${userGender === 'female' ? 'Nữ' : 'Nam'} đang chọn.`,
          ruleId: 'GENDER_INCOMPATIBLE'
        });
      }
    }
  }

  if (jIds && jIds.length > 0) {
    for (const jId of jIds) {
      const foundJItem = findCatalogItem(jId);
      if (!foundJItem) {
        results.push({
          isValid: false,
          severity: 'BLOCK',
          message: `Dữ liệu không hợp lệ: Trang sức đã chọn ('${jId}') không tồn tại trong danh mục.`,
          ruleId: 'INVALID_JEWELRY_ID'
        });
      } else {
        if (!isJewelrySlotItem(foundJItem.item)) {
          results.push({
            isValid: false,
            severity: 'BLOCK',
            message: `Món phụ kiện '${foundJItem.item.name}' không thuộc danh mục trang sức (Jewelry).`,
            ruleId: 'INVALID_JEWELRY_SLOT'
          });
        }
        const effectiveGender = resolveItemEffectiveGender(foundJItem.item, jId);
        if (!isItemGenderCompatible(effectiveGender, userGender)) {
          results.push({
            isValid: false,
            severity: 'BLOCK',
            message: `Trang sức '${foundJItem.item.name}' không tương thích với giới tính ${userGender === 'female' ? 'Nữ' : 'Nam'} đang chọn.`,
            ruleId: 'GENDER_INCOMPATIBLE'
          });
        }
      }
    }
  }

  // Kiểm tra tính hợp lệ của lapelFold nếu được cung cấp
  if (lFold !== undefined && lFold !== null && String(lFold).trim() !== '') {
    const validLapels = ['left_over_right', 'right_over_left'];
    if (!validLapels.includes(String(lFold))) {
      results.push({
        isValid: false,
        severity: 'BLOCK',
        message: `Dữ liệu không hợp lệ: Chiều vạt áo '${lFold}' không thuộc các giá trị được hỗ trợ ('left_over_right', 'right_over_left').`,
        ruleId: 'INVALID_LAPEL_FOLD'
      });
    }
  }

  // Nếu có lỗi dữ liệu hoặc thiếu điều kiện tiên quyết, dừng kiểm tra guardrail văn hóa/phom dáng
  const hasDataOrInputError = results.some(
    (r) =>
      r.severity === 'BLOCK' &&
      Boolean(
        r.ruleId &&
          (r.ruleId.startsWith('INVALID_') ||
            r.ruleId.startsWith('MISSING_') ||
            r.ruleId === 'GENDER_INCOMPATIBLE')
      )
  );

  if (hasDataOrInputError || !ctxId || !cId) {
    return results;
  }

  // Helper check mảng chính xác (dành cho casual items không có biến thể)
  const isIn = (arr: string[], val: string | null | undefined) => {
    if (!val) return false;
    return arr.includes(val);
  };

  // Kiểm tra: Bắt buộc phải có ít nhất 1 Traditional clothing item
  const allIds = [...cIdArray, inId, botId, shId, hId, ...jIds].filter(Boolean) as string[];
  const allItems = allIds.map(id => findCatalogItem(id)?.item).filter(Boolean);
  const hasTraditionalClothing = allItems.some(isTraditionalClothing);
  
  if (!hasTraditionalClothing) {
    results.push({
      isValid: false,
      severity: 'BLOCK',
      message: 'Một outfit bắt buộc phải có ít nhất 1 trang phục truyền thống (không tính giày dép).',
      ruleId: 'MISSING_TRADITIONAL_CLOTHING'
    });
  }

  // RULE 1: GUARD_SACRED_LENGTH
  if (ctxId === 'C05' && isIn(['cs_05', 'cs_06', 'cs_21'], botId)) {
    results.push({
      isValid: false,
      severity: 'BLOCK',
      message: 'Vi phạm tính tôn nghiêm: Không diện trang phục ngắn trên đầu gối (quần shorts, váy ngắn chữ A) khi bước vào chốn linh thiêng, thờ tự (C05).',
      ruleId: 'GUARD_SACRED_LENGTH'
    });
  }

  // RULE 2: GUARD_YEM_STANDALONE
  const publicContexts = ['C01', 'C02', 'C03', 'C04', 'C05', 'C06'];
  const hasTraditionalInner = allItems.some(item => isTraditionalClothing(item) && isInnerSlotItem(item));
  const hasOuterOrTop = allItems.some(item => !isInnerSlotItem(item) && !isBottomSlotItem(item) && !isShoesSlotItem(item) && !isHeadwearSlotItem(item) && !isJewelrySlotItem(item));
  
  if (hasTraditionalInner && !hasOuterOrTop && isIn(publicContexts, ctxId)) {
    results.push({
      isValid: false,
      severity: 'BLOCK',
      message: 'Trang phục lót truyền thống (như Áo yếm) mang bản chất là nội y. Bắt buộc phải có lớp khoác ngoài (Áo Đối Khâm, Áo tứ thân, Cardigan mỏng hoặc Blazer) khi ra phố hoặc đến nơi công cộng.',
      ruleId: 'GUARD_YEM_STANDALONE'
    });
  }

  // RULE 3: GUARD_FORMAL_DECONSTRUCTION
  if (isMatchingGarment(['V06', 'V07', 'V09', 'V09_1', 'V09_2'], cId)) {
    const isAllowedBottom = botId && ['cs_03', 'cs_04', 'traditional_pant'].includes(botId);
    if (!isAllowedBottom) {
      results.push({
        isValid: false,
        severity: 'BLOCK',
        message: 'Áo Tấc, Nhật Bình, Viên Lĩnh là phẩm phục/lễ phục có quy chuẩn cung đình và nghi lễ nghiêm cẩn. Không được phép phối cùng quần jeans, quần shorts hay chân váy casual cắt xẻ.',
        ruleId: 'GUARD_FORMAL_DECONSTRUCTION'
      });
    }
  }

  // RULE 4: GUARD_GL_LAPEL
  if (isMatchingGarment(['V08', 'V08_1', 'V08_2'], cId)) {
    if (lFold === 'left_over_right') {
      results.push({
        isValid: false,
        severity: 'BLOCK',
        message: 'Sai quy chuẩn văn hóa: Áo Giao Lĩnh bắt buộc vạt Trái đè lên vạt Phải (Hữu nhẫm - trang phục người sống). Kiểu vạt Phải đè Trái (Tả nhẫm) chỉ dùng cho nghi thức tang lễ hoặc người đã khuất.',
        ruleId: 'GUARD_GL_LAPEL'
      });
    } else if (!lFold || String(lFold).trim() === '') {
      results.push({
        isValid: true,
        severity: 'WARN',
        message: 'Lưu ý quy chuẩn Áo Giao Lĩnh: Bắt buộc vạt Trái đè lên vạt Phải (Hữu nhẫm). Hệ thống hiện chưa có bộ chọn chiều vạt áo nên chưa thể xác minh thuộc tính này trong giao diện.',
        ruleId: 'LIMITATION_GL_LAPEL'
      });
    }
  }

  // RULE 5: GUARD_REGIONAL_HEADWEAR
  if (hId === 'h02' && (isMatchingGarment(['V06', 'V07', 'V09', 'V09_1', 'V09_2'], cId) || isMatchingGarment(['V02'], cId))) {
    results.push({
      isValid: false,
      severity: 'BLOCK',
      message: 'Vi phạm tính địa phương và quy chế trang phục: Khăn rằn (h02) không phối cùng phẩm phục cung đình/quan họ Bắc Bộ.',
      ruleId: 'GUARD_REGIONAL_HEADWEAR'
    });
  }
  if (hId === 'h03' && (isMatchingGarment(['V01', 'V01_1', 'V01_2'], cId) || isMatchingGarment(['V06', 'V07', 'V09', 'V09_1', 'V09_2'], cId))) {
    results.push({
      isValid: false,
      severity: 'BLOCK',
      message: 'Vi phạm tính địa phương: Nón quai thao (h03) gắn liền với văn hóa Kinh Bắc (Áo tứ thân), không phối tùy tiện với áo dài hiện đại hay cung phục triều Nguyễn.',
      ruleId: 'GUARD_REGIONAL_HEADWEAR'
    });
  }

  // RULE 6: SILHOUETTE_ANTI_DRAG
  if (isMatchingGarment(['V06', 'V07', 'V10'], cId) && isIn(['cs_19_1', 'cs_19_2'], botId)) {
    results.push({
      isValid: false,
      severity: 'BLOCK',
      message: 'Lỗi phom dáng: Thân áo và tay áo thụng rộng dài quét đất kết hợp với quần ống loe rộng làm đổ trọng tâm thị giác xuống dưới, khiến tổng thể nặng nề và luộm thuộm.',
      ruleId: 'SILHOUETTE_ANTI_DRAG'
    });
  }

  // RULE 7: SILHOUETTE_CHOPPY_PROPORTION
  if (isMatchingGarment(['V01', 'V01_1', 'V01_2', 'V05', 'V05_1', 'V05_2', 'V06'], cId) && isIn(['cs_05', 'cs_06', 'cs_21'], botId)) {
    results.push({
      isValid: false,
      severity: 'BLOCK',
      message: 'Lệch tỷ lệ thị giác: Tà áo dài phủ ngoài quần short/chân váy ngắn làm đứt đoạn tỷ lệ đứng của thân áo truyền thống và phá vỡ cấu trúc kín đáo nguyên bản.',
      ruleId: 'SILHOUETTE_CHOPPY_PROPORTION'
    });
  }

  // RULE 8: SILHOUETTE_AODAI_POOF
  if (isMatchingGarment(['V01', 'V01_1', 'V01_2'], cId) && isIn(['cs_08', 'cs_09'], botId)) {
    results.push({
      isValid: false,
      severity: 'BLOCK',
      message: 'Xung đột phom dáng: Áo dài tân thời ôm eo xẻ tà hông khi mặc cùng chân váy tuyn xòe bồng hoặc chân váy bút chì bó cứng sẽ làm gãy nếp tà áo, gây cộm eo mất thẩm mỹ.',
      ruleId: 'SILHOUETTE_AODAI_POOF'
    });
  }

  // RULE 9: SILHOUETTE_INNER_REDUCTION (Cảnh báo - WARN)
  if (isMatchingGarment(['V10'], cId) && isIn(['cs_10', 'cs_13_1', 'cs_13_2'], inId)) {
    results.push({
      isValid: true, // Vẫn cho phép mặc nhưng đưa ra cảnh báo
      severity: 'WARN',
      message: 'Lưu ý phom dáng: Áo Đối Khâm khoác buông vạt phối cùng áo thun rộng hoặc sơ mi cổ bẻ dày dễ làm cộm cổ áo; nên ưu tiên áo ôm sát như áo hai dây lụa (cs_12), áo quây (cs_27) hoặc áo cổ lọ (cs_11_1, cs_11_2).',
      ruleId: 'SILHOUETTE_INNER_REDUCTION'
    });
  }

  // RULE 10: GUARD_FOOTWEAR_CASUAL_MISMATCH
  if (isMatchingGarment(['V06', 'V07', 'V09_1', 'V09_2'], cId) && isIn(['cs_14', 'cs_18', 'cs_38'], shId)) {
    results.push({
      isValid: true,
      severity: 'WARN',
      message: 'Cảnh báo phối đồ: Sneaker hoặc dép sandal làm giảm tính tôn nghiêm của Đại lễ phục (Áo Tấc, Nhật Bình, Viên Lĩnh). Khuyên dùng hài cung đình (v12), hài nhung (v11) hoặc giày tây da (cs_37, cs_15).',
      ruleId: 'GUARD_FOOTWEAR_CASUAL_MISMATCH'
    });
  }

  // RULE 11: ACCESSORY_OVERLOAD_WARNING
  if (jIds && jIds.length > 3) {
    results.push({
      isValid: true,
      severity: 'WARN',
      message: 'Cảnh báo thẩm mỹ: Phối quá nhiều phụ kiện trang sức cùng lúc (hơn 3 món) dễ gây rối mắt, làm phân tán sự tập trung vào phom dáng chính của cổ phục.',
      ruleId: 'ACCESSORY_OVERLOAD_WARNING'
    });
  }

  // RULE 12: INFO_AODAI_FOOTWEAR_HEELS
  if (isMatchingGarment(['V01_2'], cId) && shId && !isIn(['cs_17', 'cs_34', 'cs_35'], shId)) {
    results.push({
      isValid: true,
      severity: 'INFO',
      message: 'Gợi ý tôn dáng: Áo dài tân thời nữ sẽ tôn dáng và thướt tha nhất khi phối cùng giày cao gót quai mảnh (cs_17), mule gót nhọn (cs_34) hoặc guốc mộc cao gót (cs_35).',
      ruleId: 'INFO_AODAI_FOOTWEAR_HEELS'
    });
  }

  // RULE 13: INFO_BABA_REGIONAL_IDENTITY
  if (isMatchingGarment(['V04_1', 'V04_2'], cId) && !isIn(['h02'], hId)) {
    results.push({
      isValid: true,
      severity: 'INFO',
      message: 'Gợi ý nhận diện: Áo bà ba đạt hiệu quả thẩm mỹ văn hóa miền Tây Nam Bộ cao nhất khi đi kèm khăn rằn (h02) và guốc mộc (v13/cs_35).',
      ruleId: 'INFO_BABA_REGIONAL_IDENTITY'
    });
  }

  // RULE 14: INFO_HISTORICAL_CROSSOVER
  if (isMatchingGarment(['V01_1', 'V01_2', 'V05_1', 'V05_2'], cId)) {
    const hasCrossoverJewelry = jIds && jIds.some(jId => ['j08', 'j09'].includes(jId));
    if (hasCrossoverJewelry) {
      results.push({
        isValid: true,
        severity: 'INFO',
        message: 'Thông tin xuất xứ: Bộ diêu (j08) và lưu tô (j09) là phụ kiện đặc trưng phong cách cổ trang Đông Á nói chung, cần cân nhắc nếu mong muốn outfit tái hiện chính xác lịch sử Việt phục.',
        ruleId: 'INFO_HISTORICAL_CROSSOVER'
      });
    }
  }

  // Nếu không có bất kỳ BLOCK hay WARN nào:
  if (results.length === 0) {
    return [
      {
        isValid: true,
        severity: 'INFO',
        message: 'Không phát hiện vi phạm trong phạm vi các quy chuẩn hiện tại.',
        ruleId: 'VALID_OK'
      }
    ];
  }

  return results;
}
