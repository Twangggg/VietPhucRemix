import { SavedLookbook } from '../types';

const STORAGE_KEY = 'vietphuc_saved_lookbooks_v1';

/**
 * Lấy danh sách lookbook người dùng đã lưu
 */
export function getSavedLookbooks(): SavedLookbook[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (err) {
    console.error('Lỗi khi đọc danh sách Lookbook từ localStorage:', err);
    return [];
  }
}

/**
 * Lưu một Lookbook mới hoặc cập nhật
 */
export function saveLookbook(lookbook: Omit<SavedLookbook, 'id' | 'createdAt'> & { id?: string }): SavedLookbook {
  const existing = getSavedLookbooks();
  const id = lookbook.id || `lb_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
  const now = Date.now();

  const newLookbook: SavedLookbook = {
    ...lookbook,
    id,
    createdAt: now,
  };

  // Nếu đã tồn tại ID thì update, ngược lại đưa lên đầu danh sách
  const index = existing.findIndex((item) => item.id === id);
  let updated: SavedLookbook[];
  if (index !== -1) {
    updated = [...existing];
    updated[index] = newLookbook;
  } else {
    updated = [newLookbook, ...existing];
  }

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  } catch (err) {
    console.error('Lỗi khi ghi Lookbook vào localStorage:', err);
  }

  return newLookbook;
}

/**
 * Xóa một Lookbook theo ID
 */
export function deleteLookbook(id: string): boolean {
  try {
    const existing = getSavedLookbooks();
    const filtered = existing.filter((item) => item.id !== id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
    return true;
  } catch (err) {
    console.error('Lỗi khi xóa Lookbook:', err);
    return false;
  }
}

/**
 * Mã hóa dữ liệu phối đồ thành chuỗi URL hash/param an toàn để chia sẻ
/**
 * Tạo mã chia sẻ bộ phối đồ (Share Code) - Dùng được trên mọi máy/môi trường
 */
export function encodeOutfitToShareCode(payload: {
  g: string; // garment
  ctx?: string | null; // context
  inn?: string | null; // inner
  bot?: string | null; // bottom
  sh?: string | null; // shoes
  hw?: string | null; // headwear
  jw?: string[]; // jewelry
  gen: string; // gender
  col?: Record<string, { hex: string | null; intensity: number }>; // color settings
  title?: string;
  notes?: string;
}): string {
  const compactObj = {
    g: payload.g,
    c: payload.ctx || undefined,
    i: payload.inn || undefined,
    b: payload.bot || undefined,
    s: payload.sh || undefined,
    h: payload.hw || undefined,
    j: payload.jw && payload.jw.length > 0 ? payload.jw : undefined,
    gen: payload.gen,
    col: payload.col && Object.keys(payload.col).length > 0 ? payload.col : undefined,
    t: payload.title || undefined,
    n: payload.notes || undefined
  };

  const jsonString = JSON.stringify(compactObj);
  return btoa(encodeURIComponent(jsonString));
}

/**
 * Mã hóa dữ liệu phối đồ thành chuỗi URL an toàn để chia sẻ
 * Hỗ trợ tự động nhận diện domain đang chạy (Vercel deployment hoặc localhost)
 */
export function encodeOutfitToShareUrl(payload: {
  g: string; // garment
  ctx?: string | null; // context
  inn?: string | null; // inner
  bot?: string | null; // bottom
  sh?: string | null; // shoes
  hw?: string | null; // headwear
  jw?: string[]; // jewelry
  gen: string; // gender
  col?: Record<string, { hex: string | null; intensity: number }>; // color settings
  title?: string;
  notes?: string;
}): string {
  try {
    const base64 = encodeOutfitToShareCode(payload);
    const origin = window.location.origin;
    // Tạo link trực tiếp tới /collection?shared=... (chuẩn BrowserRouter trên Vercel)
    return `${origin}/collection?shared=${base64}`;
  } catch (err) {
    console.error('Lỗi encode share URL:', err);
    return window.location.href;
  }
}

/**
 * Giải mã chuỗi chia sẻ từ URL
 */
export function decodeOutfitFromShareString(shareString: string): {
  garmentId: string;
  contextId?: string | null;
  innerId?: string | null;
  bottomId?: string | null;
  shoesId?: string | null;
  headwearId?: string | null;
  jewelryIds?: string[];
  gender: 'male' | 'female';
  itemColors?: Record<string, { hex: string | null; intensity: number }>;
  title?: string;
  notes?: string;
} | null {
  try {
    const decodedJson = decodeURIComponent(atob(shareString));
    const obj = JSON.parse(decodedJson);
    if (!obj || !obj.g) return null;

    return {
      garmentId: obj.g,
      contextId: obj.c || null,
      innerId: obj.i || null,
      bottomId: obj.b || null,
      shoesId: obj.s || null,
      headwearId: obj.h || null,
      jewelryIds: Array.isArray(obj.j) ? obj.j : [],
      gender: obj.gen === 'male' ? 'male' : 'female',
      itemColors: obj.col || undefined,
      title: obj.t || undefined,
      notes: obj.n || undefined
    };
  } catch (err) {
    console.error('Lỗi decode share string:', err);
    return null;
  }
}
