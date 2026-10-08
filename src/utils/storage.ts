import { GARMENTS, CONTEXTS } from '../data';
import { validateOutfit, resolveGarmentBaseId } from './validationEngine';

export const STORAGE_KEY = 'vietphuc.savedOutfits.v1';

export interface SavedOutfit {
  id: string;
  name: string;
  createdAt: string;
  contextId: string;
  costumeId: string | string[];
  gender: 'male' | 'female';
  innerId: string | null;
  bottomId: string | null;
  shoesId: string | null;
  headwearId: string | null;
  jewelryIds: string[];
  itemColors?: Record<string, { hex: string | null; intensity: number }>;
}

export interface GetSavedOutfitsResult {
  outfits: SavedOutfit[];
  isCorrupted: boolean;
  rawError?: string;
}

export interface SaveOutfitInput {
  name?: string;
  contextId: string;
  costumeId: string | string[];
  gender: 'male' | 'female';
  innerId: string | null;
  bottomId: string | null;
  shoesId: string | null;
  headwearId: string | null;
  jewelryIds: string[];
  itemColors?: Record<string, { hex: string | null; intensity: number }>;
}

export interface SaveOutfitResult {
  success: boolean;
  isDuplicate?: boolean;
  isUpdated?: boolean;
  error?: string;
  savedOutfit?: SavedOutfit;
}

function selectionError(value: unknown): string | null {
  if (!value || typeof value !== 'object') return 'Bản ghi không hợp lệ.';
  const item = value as Record<string, unknown>;
  for (const field of ['contextId']) {
    if (typeof item[field] !== 'string' || !(item[field] as string).trim()) return `Trường ${field} không hợp lệ.`;
  }
  if (!item.costumeId || (typeof item.costumeId !== 'string' && !Array.isArray(item.costumeId))) {
    return 'Trường costumeId không hợp lệ.';
  }
  if (item.gender !== 'male' && item.gender !== 'female') return 'Trường gender không hợp lệ.';
  for (const field of ['innerId', 'bottomId', 'shoesId', 'headwearId']) {
    if (item[field] != null && (typeof item[field] !== 'string' || !(item[field] as string).trim())) return `Trường ${field} không hợp lệ.`;
  }
  if (!Array.isArray(item.jewelryIds) || item.jewelryIds.some(id => typeof id !== 'string' || !id.trim())) return 'Trường jewelryIds không hợp lệ.';
  if (item.name !== undefined && typeof item.name !== 'string') return 'Trường name không hợp lệ.';
  return null;
}

/**
 * So sánh 2 bộ phối có giống hệt nhau về lựa chọn hay không.
 * Thứ tự các phụ kiện trang sức (jewelryIds) không làm bộ phối trở thành khác nhau.
 */
export function isSameOutfit(
  a: {
    costumeId?: string | string[] | null;
    contextId?: string | null;
    gender?: string | null;
    innerId?: string | null;
    bottomId?: string | null;
    shoesId?: string | null;
    headwearId?: string | null;
    jewelryIds?: string[] | null;
  },
  b: {
    costumeId?: string | string[] | null;
    contextId?: string | null;
    gender?: string | null;
    innerId?: string | null;
    bottomId?: string | null;
    shoesId?: string | null;
    headwearId?: string | null;
    jewelryIds?: string[] | null;
  }
): boolean {
  const aCostume = Array.isArray(a.costumeId) ? [...a.costumeId].sort() : (a.costumeId ? [a.costumeId] : []);
  const bCostume = Array.isArray(b.costumeId) ? [...b.costumeId].sort() : (b.costumeId ? [b.costumeId] : []);
  if (aCostume.length !== bCostume.length) return false;
  for (let i = 0; i < aCostume.length; i++) {
    if (aCostume[i] !== bCostume[i]) return false;
  }
  
  if (a.contextId !== b.contextId) return false;
  if (a.gender !== b.gender) return false;
  if ((a.innerId || null) !== (b.innerId || null)) return false;
  if ((a.bottomId || null) !== (b.bottomId || null)) return false;
  if ((a.shoesId || null) !== (b.shoesId || null)) return false;
  if ((a.headwearId || null) !== (b.headwearId || null)) return false;

  const aJewelries = Array.isArray(a.jewelryIds) ? [...a.jewelryIds].sort() : [];
  const bJewelries = Array.isArray(b.jewelryIds) ? [...b.jewelryIds].sort() : [];
  if (aJewelries.length !== bJewelries.length) return false;
  for (let i = 0; i < aJewelries.length; i++) {
    if (aJewelries[i] !== bJewelries[i]) return false;
  }
  return true;
}

/**
 * So sánh 2 bảng màu tùy biến xem có đồng nhất hay không.
 * Bỏ qua các mục có hex null (màu mặc định).
 */
export function areColorsEqual(
  a?: Record<string, { hex: string | null; intensity: number }>,
  b?: Record<string, { hex: string | null; intensity: number }>
): boolean {
  const aKeys = Object.keys(a || {}).filter((k) => a?.[k]?.hex != null);
  const bKeys = Object.keys(b || {}).filter((k) => b?.[k]?.hex != null);
  if (aKeys.length !== bKeys.length) return false;
  for (const k of aKeys) {
    const aVal = a?.[k];
    const bVal = b?.[k];
    if (!bVal) return false;
    if (aVal?.hex !== bVal?.hex) return false;
    if ((aVal?.intensity ?? 0.85) !== (bVal?.intensity ?? 0.85)) return false;
  }
  return true;
}

/**
 * Đọc danh sách các bộ phối đã lưu từ localStorage.
 * Có cơ chế try/catch và kiểm tra cấu trúc để phát hiện dữ liệu hỏng.
 */
export function getSavedOutfits(): GetSavedOutfitsResult {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return { outfits: [], isCorrupted: false };
    }
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) {
      return { outfits: [], isCorrupted: true, rawError: 'Dữ liệu không phải là danh sách mảng hợp lệ.' };
    }

    const validOutfits: SavedOutfit[] = [];
    const ids = new Set<string>();
    for (const item of parsed) {
      const error = selectionError(item);
      if (error) return { outfits: [], isCorrupted: true, rawError: error };
      if (typeof item.id !== 'string' || !item.id.trim()) {
        return { outfits: [], isCorrupted: true, rawError: 'Mã định danh không hợp lệ.' };
      }
      if (ids.has(item.id)) return { outfits: [], isCorrupted: true, rawError: 'Mã định danh trùng lặp.' };
      ids.add(item.id);
      if (
        item &&
        typeof item === 'object' &&
        typeof item.id === 'string' &&
        (typeof item.costumeId === 'string' || Array.isArray(item.costumeId)) &&
        typeof item.contextId === 'string' &&
        (item.gender === 'male' || item.gender === 'female')
      ) {
        validOutfits.push({
          id: item.id,
          name: typeof item.name === 'string' ? item.name : 'Bộ phối di sản',
          createdAt: typeof item.createdAt === 'string' ? item.createdAt : new Date().toISOString(),
          costumeId: item.costumeId,
          contextId: item.contextId,
          gender: item.gender,
          innerId: item.innerId || null,
          bottomId: item.bottomId || null,
          shoesId: item.shoesId || null,
          headwearId: item.headwearId || null,
          jewelryIds: Array.isArray(item.jewelryIds) ? item.jewelryIds : [],
          itemColors: item.itemColors && typeof item.itemColors === 'object' && !Array.isArray(item.itemColors) ? item.itemColors : {}
        });
      } else {
        return { outfits: [], isCorrupted: true, rawError: 'Tồn tại bản ghi không đúng cấu trúc lưu trữ.' };
      }
    }

    return { outfits: validOutfits, isCorrupted: false };
  } catch (err: any) {
    return {
      outfits: [],
      isCorrupted: true,
      rawError: err?.message || 'Không thể đọc hoặc phân tích cú pháp dữ liệu lưu trữ.'
    };
  }
}

/**
 * Lưu bộ phối vào localStorage.
 * - Kiểm định lại bằng validator chung.
 * - Kiểm tra trùng lặp.
 * - Tự động tạo tên mặc định từ cổ phục và bối cảnh.
 * - Bảo toàn dữ liệu cũ nếu ghi thất bại.
 */
export function saveOutfit(input: SaveOutfitInput): SaveOutfitResult {
  const error = selectionError(input);
  if (error) return { success: false, error };
  // 1. Kiểm tra bằng validator chung trước khi lưu
  const validation = validateOutfit({
    costumeId: input.costumeId,
    contextId: input.contextId,
    gender: input.gender,
    innerId: input.innerId,
    bottomId: input.bottomId,
    shoesId: input.shoesId,
    headwearId: input.headwearId,
    jewelryIds: input.jewelryIds
  });

  const blockError = validation.find((r) => r.severity === 'BLOCK');
  if (blockError) {
    return {
      success: false,
      error: `Không thể lưu do vi phạm quy chuẩn kiểm tra: ${blockError.message}`
    };
  }

  // 2. Đọc danh sách hiện có
  const current = getSavedOutfits();
  if (current.isCorrupted) {
    return {
      success: false,
      error: `Không thể lưu vì dữ liệu lưu trữ hiện tại đang bị hỏng (${current.rawError}). Vui lòng kiểm tra lại.`
    };
  }

  // 3. Kiểm tra trùng lặp
  const existingIndex = current.outfits.findIndex((existing) => isSameOutfit(existing, input));
  if (existingIndex !== -1) {
    const existing = current.outfits[existingIndex];
    const colorsIdentical = areColorsEqual(existing.itemColors, input.itemColors);

    if (!colorsIdentical) {
      // Người dùng lưu lại cùng bộ phối nhưng đã đổi màu sắc -> cập nhật màu mới cho bộ phối này
      const updatedOutfit: SavedOutfit = {
        ...existing,
        name: input.name?.trim() || existing.name,
        createdAt: new Date().toISOString(),
        itemColors: input.itemColors || {}
      };
      const updatedList = [...current.outfits];
      updatedList[existingIndex] = updatedOutfit;
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedList));
        return {
          success: true,
          isUpdated: true,
          savedOutfit: updatedOutfit
        };
      } catch (err: any) {
        return {
          success: false,
          error: 'Không thể ghi vào bộ nhớ trình duyệt (có thể do hết dung lượng lưu trữ).'
        };
      }
    }

    return {
      success: false,
      isDuplicate: true,
      error: 'Bộ phối này đã có trong bộ sưu tập.'
    };
  }

  // 4. Sinh tên mặc định
  const mainGarmentId = Array.isArray(input.costumeId) ? input.costumeId[0] : input.costumeId;
  const baseGarmentId = resolveGarmentBaseId(mainGarmentId);
  const garment = GARMENTS.find((g) => g.id === mainGarmentId || g.id === baseGarmentId);
  const context = CONTEXTS.find((c) => c.id === input.contextId);
  const defaultName =
    garment && context
      ? `${garment.name} · ${context.name}`
      : garment?.name || 'Bộ phối di sản';

  const newRecord: SavedOutfit = {
    id: `vp_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`,
    name: input.name?.trim() || defaultName,
    createdAt: new Date().toISOString(),
    costumeId: input.costumeId,
    contextId: input.contextId,
    gender: input.gender,
    innerId: input.innerId || null,
    bottomId: input.bottomId || null,
    shoesId: input.shoesId || null,
    headwearId: input.headwearId || null,
    jewelryIds: Array.isArray(input.jewelryIds) ? [...input.jewelryIds] : [],
    itemColors: input.itemColors || {}
  };

  // 5. Ghi vào localStorage có try/catch
  try {
    const updated = [newRecord, ...current.outfits];
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    return {
      success: true,
      savedOutfit: newRecord
    };
  } catch (err: any) {
    return {
      success: false,
      error: 'Không thể ghi vào bộ nhớ trình duyệt (có thể do hết dung lượng lưu trữ).'
    };
  }
}

/**
 * Xóa một bộ phối đã lưu theo ID.
 */
export function deleteSavedOutfit(id: string): { success: boolean; error?: string } {
  const current = getSavedOutfits();
  if (current.isCorrupted) {
    return {
      success: false,
      error: 'Dữ liệu lưu trữ đang bị hỏng, không thể thực hiện thao tác xóa an toàn.'
    };
  }

  if (!current.outfits.some(o => o.id === id)) {
    return { success: false, error: 'Bộ phối không tồn tại.' };
  }
  try {
    const updated = current.outfits.filter((o) => o.id !== id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    return { success: true };
  } catch (err: any) {
    return {
      success: false,
      error: 'Không thể xóa bộ phối do lỗi thao tác bộ nhớ.'
    };
  }
}

/**
 * Đặt lại dữ liệu bộ sưu tập bị hỏng (chỉ gọi khi người dùng xác nhận).
 */
export function clearCorruptedStorage(): { success: boolean; error?: string } {
  try {
    localStorage.removeItem(STORAGE_KEY);
    return { success: true };
  } catch {
    return { success: false, error: 'Không thể đặt lại dữ liệu lưu trữ.' };
  }
}
