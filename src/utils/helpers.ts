import { Gender } from '../types';

/**
 * Chuẩn hóa URL hình ảnh an toàn:
 * 1. Ưu tiên tìm URL trong item.image_url (nếu là mảng thì lấy phần tử [0]),
 *    sau đó đến item.thumbnail_url. Nếu truyền trực tiếp string thì dùng string.
 *    Nếu không có, trả về chuỗi rỗng "".
 * 2. Bắt buộc kiểm tra và thêm dấu "/" ở đầu nếu là đường dẫn nội bộ chưa có "/"
 *    (ví dụ: "assets/..." -> "/assets/...").
 * 
 * @param item Object chứa trường image_url / thumbnail_url hoặc chuỗi đường dẫn ảnh
 */
export function getSafeImageUrl(item: any): string {
  if (!item) return '';

  let rawUrl = '';

  if (typeof item === 'string') {
    rawUrl = item;
  } else if (Array.isArray(item.image_url)) {
    rawUrl = item.image_url.length > 0 ? (item.image_url[0] || '') : '';
  } else if (typeof item.image_url === 'string') {
    rawUrl = item.image_url;
  } else if (typeof item.thumbnail_url === 'string') {
    rawUrl = item.thumbnail_url;
  }

  rawUrl = (rawUrl || '').trim();
  if (!rawUrl) return '';

  // Nếu là URL tuyệt đối từ bên ngoài (http, https, data:, blob:), giữ nguyên
  if (/^(https?:|\/\/|data:|blob:)/i.test(rawUrl)) {
    return rawUrl;
  }

  // Bắt buộc kiểm tra và thêm dấu "/" ở đầu nếu chưa có
  if (!rawUrl.startsWith('/')) {
    rawUrl = `/${rawUrl}`;
  }

  return rawUrl;
}

/**
 * Phân giải đường dẫn hình ảnh tĩnh dựa trên cấu hình biến thể giới tính Nam/Nữ.
 * 
 * - Đồ Unisex (hasGenderVariants = false | undefined): Trả về baseUrl gốc đã chuẩn hóa.
 * - Đồ có biến thể (hasGenderVariants = true):
 *   - 'Male'  -> Chèn hậu tố `_1` trước đuôi file (ví dụ: `v01_1.png`, `cs_01_1.png`)
 *   - 'Female' -> Chèn hậu tố `_2` trước đuôi file (ví dụ: `v01_2.png`, `cs_01_2.png`)
 * 
 * @param baseUrl Đường dẫn ảnh gốc (ví dụ: "assets/costumes/v01.png" hoặc "/assets/...")
 * @param hasGenderVariants Cờ đánh dấu món đồ có phiên bản Nam/Nữ hay không
 * @param selectedGender Giới tính đang được chọn ('Male' | 'Female')
 */
export function resolveImageUrl(
  baseUrl?: string,
  hasGenderVariants?: boolean,
  selectedGender: Gender | 'male' | 'female' | string = 'Female'
): string {
  if (!baseUrl) {
    return '';
  }

  // Chuẩn hóa dấu "/" ở đầu nếu là đường dẫn nội bộ
  let url = baseUrl.trim();
  if (!/^(https?:|\/\/|data:|blob:)/i.test(url) && !url.startsWith('/')) {
    url = `/${url}`;
  }

  if (!hasGenderVariants) {
    return url;
  }

  const isMale = (selectedGender || '').toLowerCase() === 'male';
  const suffix = isMale ? '_1' : '_2';

  // Tìm và thay thế hoặc chèn hậu tố _1 / _2 ngay trước phần mở rộng file (.png, .webp, .jpg,...)
  const extensionRegex = /(_[12])?(\.[a-zA-Z0-9]+)$/;
  if (extensionRegex.test(url)) {
    return url.replace(extensionRegex, `${suffix}$2`);
  }

  return `${url}${suffix}`;
}

/**
 * Phân giải item (phụ kiện, trang phục) theo giới tính, trích xuất đường dẫn ảnh phù hợp.
 * Xử lý cả trường hợp image_url là string hoặc mảng string và luôn chuẩn hóa dấu "/".
 */
export function resolveItemByGender<T extends { id?: string; gender?: string; image_url?: string | string[]; thumbnail_url?: string; has_gender_variants?: boolean }>(
  item: T,
  selectedGender: Gender | 'male' | 'female' | string = 'Female'
): T & { resolvedImageUrl: string; id: string } {
  let targetUrl = '';
  const isMale = (selectedGender || '').toLowerCase() === 'male';
  const suffix = isMale ? '_1' : '_2';

  if (Array.isArray(item.image_url) && item.image_url.length > 1) {
    const maleIdx = item.image_url.findIndex((url) => typeof url === 'string' && url.includes('_1'));
    const femaleIdx = item.image_url.findIndex((url) => typeof url === 'string' && url.includes('_2'));

    if (isMale && maleIdx !== -1) {
      targetUrl = item.image_url[maleIdx];
    } else if (!isMale && femaleIdx !== -1) {
      targetUrl = item.image_url[femaleIdx];
    } else {
      targetUrl = isMale ? item.image_url[0] : (item.image_url[1] || item.image_url[0]);
    }
  } else {
    targetUrl = getSafeImageUrl(item);
  }

  // Chuẩn hóa đường dẫn sạch và xử lý hậu tố giới tính (_1 / _2)
  const resolvedImageUrl = resolveImageUrl(getSafeImageUrl(targetUrl), item.has_gender_variants, selectedGender);

  // Phân giải ID với hậu tố tương ứng (_1 / _2) nếu có biến thể giới tính
  let resolvedId = (item as any).id || '';
  if (resolvedId && item.has_gender_variants) {
    resolvedId = `${resolvedId.replace(/_[12]$/, '')}${suffix}`;
  }

  return {
    ...item,
    id: resolvedId,
    resolvedImageUrl,
  };
}

/**
 * Lọc danh sách item theo giới tính được chọn (Male / Female).
 * - Đồ có gender trùng với selectedGender hoặc là 'unisex' (hoặc thiếu field) sẽ được hiển thị.
 * - Đồ chỉ dành riêng cho giới tính còn lại sẽ bị giấu đi hoàn toàn khỏi UI.
 * 
 * @param items Danh sách items (Garment, CasualItem, AccessoryItem, v.v.)
 * @param selectedGender Giới tính đang được chọn ('Male' | 'Female')
 */
export function filterByGender<T extends { gender?: string }>(
  items: T[],
  selectedGender: Gender
): T[] {
  const currentGender = selectedGender.toLowerCase();
  return items.filter((item) => {
    const itemGender = item.gender?.toLowerCase() || 'unisex';
    return itemGender === currentGender || itemGender === 'unisex';
  });
}

/**
 * Trả về tên category bằng tiếng Việt chuẩn.
 */
export function getCategoryVietnamese(cat?: string, type?: string): string {
  const raw = (cat || type || '').toLowerCase();
  if (raw === 'inner') return 'Áo lót / Mặc trong';
  if (raw === 'top') return 'Áo trên';
  if (raw === 'bottom_pants' || raw.includes('pants')) return 'Quần dài';
  if (raw === 'bottom_skirt' || raw.includes('skirt')) return 'Chân váy';
  if (raw === 'outer_traditional') return 'Cổ phục truyền thống';
  if (raw === 'outer_formal') return 'Lễ phục trang trọng';
  if (raw === 'traditional_footwear') return 'Hài / Guốc truyền thống';
  if (raw.includes('shoes') || raw.includes('footwear')) return 'Giày dép';
  if (raw.includes('headwear')) return 'Mũ nón di sản';
  if (raw.includes('jewelry')) return 'Trang sức / Phụ kiện';
  return cat || type || 'Trang phục di sản';
}


