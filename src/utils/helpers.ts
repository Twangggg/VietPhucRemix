import { Gender } from '../types';

/**
 * Phân giải đường dẫn hình ảnh tĩnh dựa trên cấu hình biến thể giới tính Nam/Nữ.
 * 
 * - Đồ Unisex (hasGenderVariants = false | undefined): Trả về baseUrl gốc.
 * - Đồ có biến thể (hasGenderVariants = true):
 *   - 'Male'  -> Chèn hậu tố `_1` trước đuôi file (ví dụ: `v01_1.png`, `cs_01_1.png`)
 *   - 'Female' -> Chèn hậu tố `_2` trước đuôi file (ví dụ: `v01_2.png`, `cs_01_2.png`)
 * 
 * @param baseUrl Đường dẫn ảnh gốc (ví dụ: "/assets/costumes/v01.webp")
 * @param hasGenderVariants Cờ đánh dấu món đồ có phiên bản Nam/Nữ hay không
 * @param selectedGender Giới tính đang được chọn ('Male' | 'Female')
 */
export function resolveImageUrl(
  baseUrl: string,
  hasGenderVariants?: boolean,
  selectedGender: Gender = 'Female'
): string {
  if (!baseUrl || !hasGenderVariants) {
    return baseUrl;
  }

  const suffix = selectedGender === 'Male' ? '_1' : '_2';

  // Tìm và thay thế hoặc chèn hậu tố _1 / _2 ngay trước phần mở rộng file (.png, .webp, .jpg,...)
  const extensionRegex = /(_[12])?(\.[a-zA-Z0-9]+)$/;
  if (extensionRegex.test(baseUrl)) {
    return baseUrl.replace(extensionRegex, `${suffix}$2`);
  }

  return `${baseUrl}${suffix}`;
}
