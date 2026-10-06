/**
 * VIETPHUC REMIX - COLOR RECOLORING & TINTING ENGINE (CANVAS 2D)
 * Hỗ trợ đổi màu trang phục real-time bảo toàn độ sáng tối, bóng đổ (shading) và nếp gấp của sợi vải.
 */

export interface TraditionalColor {
  id: string;
  name: string;
  alias?: string;
  hex: string;
  category: 'royal' | 'folk' | 'festive' | 'modern';
  description: string;
  culturalLore: string;
}

// BẢNG MÀU TRUYỀN THỐNG VIỆT NAM (VIETNAMESE HERITAGE PALETTES)
export const TRADITIONAL_COLORS: TraditionalColor[] = [
  {
    id: 'original',
    name: 'Màu gốc di sản',
    alias: 'Nguyên bản',
    hex: 'original',
    category: 'royal',
    description: 'Giữ nguyên màu sắc thiết kế gốc của trang phục.',
    culturalLore: 'Màu sắc ghi nhận nguyên bản theo hiện vật lịch sử hoặc tư liệu phục dựng.'
  },
  {
    id: 'do_son',
    name: 'Đỏ Son',
    alias: 'Chu Sa',
    hex: '#A82229',
    category: 'royal',
    description: 'Màu đỏ thắm rực rỡ, tượng trưng cho hỷ sự, đại lễ triều đình và quyền quý.',
    culturalLore: 'Thường thấy trên các phẩm phục áo Tấc, Nhật Bình của bậc Hoàng hậu, công chúa và áo cưới truyền thống.'
  },
  {
    id: 'do_huyet_du',
    name: 'Đỏ Huyết Dụ',
    alias: 'Đỏ Đô / Huyết dụ',
    hex: '#6A1A24',
    category: 'royal',
    description: 'Màu đỏ sẫm trang nghiêm, lắng đọng chiều sâu văn hóa cung đình.',
    culturalLore: 'Tượng trưng cho sự tôn nghiêm, bền vững và lòng trung trinh trong lễ tế giao thời Nguyễn.'
  },
  {
    id: 'vang_hoang_yen',
    name: 'Vàng Hoàng Yến',
    alias: 'Vàng Kim',
    hex: '#D99B26',
    category: 'royal',
    description: 'Màu vàng rực rỡ, biểu trưng cho quyền lực tối cao, phú quý và vương triều.',
    culturalLore: 'Màu hoàng sắc chỉ dành riêng cho Hoàng gia, thiên tử thời phong kiến.'
  },
  {
    id: 'vang_mo_ga',
    name: 'Vàng Mỡ Gà',
    alias: 'Hoàng Cúc',
    hex: '#E2C26B',
    category: 'folk',
    description: 'Màu vàng nhạt thanh nhã, ấm áp, gắn liền với vạt áo tứ thân trẩy hội.',
    culturalLore: 'Màu sắc thanh tân của hoa cúc mùa thu và vạt áo mộc mạc của thiếu nữ Bắc Bộ.'
  },
  {
    id: 'xanh_cham',
    name: 'Xanh Chàm',
    alias: 'Thanh Lam',
    hex: '#1E3F5A',
    category: 'folk',
    description: 'Màu xanh nhuộm từ lá chàm tự nhiên, bền màu, đằm thắm và dung dị.',
    culturalLore: 'Hồn cốt của trang phục dân gian Việt qua hàng thế kỷ lao động và sinh hoạt.'
  },
  {
    id: 'xanh_com',
    name: 'Xanh Cốm',
    alias: 'Mạ Non',
    hex: '#688A3C',
    category: 'festive',
    description: 'Màu xanh lục dịu mát của lúa non và hội Lim mùa xuân.',
    culturalLore: 'Đại diện cho sức sống mùa xuân tươi mới, nét duyên của liền chị Quan họ.'
  },
  {
    id: 'xanh_ngoc_bich',
    name: 'Xanh Ngọc Bích',
    alias: 'Bích Ngọc / Lam Thủy',
    hex: '#1E6B65',
    category: 'royal',
    description: 'Màu xanh lục phỉ thúy cao sang, trang nhã và mát lành.',
    culturalLore: 'Rất được các mệnh phụ phu nhân và tiểu thư khuê các thời Lê - Nguyễn ưa chuộng.'
  },
  {
    id: 'tim_hue',
    name: 'Tím Huế',
    alias: 'Tím Cố Đô',
    hex: '#4A2A56',
    category: 'royal',
    description: 'Màu tím thâm trầm, e ấp, biểu tượng của nét duyên xứ Hương Ngự.',
    culturalLore: 'Gắn liền với hình ảnh tà áo dài tím thướt tha bên dòng sông Hương và kinh thành Huế.'
  },
  {
    id: 'hong_sen',
    name: 'Hồng Sen',
    alias: 'Yếm Đào',
    hex: '#C85375',
    category: 'festive',
    description: 'Màu cánh sen hồng tươi tắn, gợi nhớ chiếc yếm đào trẩy hội xưa.',
    culturalLore: 'Biểu trưng cho nét đẹp e ấp, xuân thì và thuần khiết của người phụ nữ Việt.'
  },
  {
    id: 'nau_song',
    name: 'Nâu Sồng',
    alias: 'Củ Nâu',
    hex: '#5C3E2E',
    category: 'folk',
    description: 'Màu nâu nhuộm củ nâu, bình dị, chịu thương chịu khó của áo bà ba & áo tứ thân.',
    culturalLore: 'Gắn liền với hình ảnh người mẹ, người chị lao động mộc mạc chân chất nơi thôn dã.'
  },
  {
    id: 'trang_nga',
    name: 'Trắng Ngà',
    alias: 'Lụa Bạch',
    hex: '#E8E1D3',
    category: 'modern',
    description: 'Màu trắng tự nhiên của lụa tơ tằm Vạn Phúc, thanh khiết và cổ điển.',
    culturalLore: 'Tôn vinh sự tinh khôi, nền nã của tà áo dài học sinh và thiếu nữ Hà Thành.'
  },
  {
    id: 'den_tuyen',
    name: 'Đen Tuyển',
    alias: 'Lĩnh Đen / Huyền',
    hex: '#232326',
    category: 'modern',
    description: 'Màu đen óng ả của lụa Lãnh Mỹ A hay quần lụa đen truyền thống.',
    culturalLore: 'Tạo độ tương phản tôn vinh mọi sắc màu của tà áo khoác ngoài.'
  }
];

// Memory cache để lưu các ảnh đã recolor nhằm tránh tính toán lại
const recolorCache = new Map<string, string>();

/**
 * Chuyển đổi mã màu Hex (#RRGGBB) sang RGB
 */
export function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  const cleanHex = hex.replace('#', '').trim();
  if (cleanHex.length === 3) {
    const r = parseInt(cleanHex[0] + cleanHex[0], 16);
    const g = parseInt(cleanHex[1] + cleanHex[1], 16);
    const b = parseInt(cleanHex[2] + cleanHex[2], 16);
    return { r, g, b };
  }
  if (cleanHex.length === 6) {
    const r = parseInt(cleanHex.substring(0, 2), 16);
    const g = parseInt(cleanHex.substring(2, 4), 16);
    const b = parseInt(cleanHex.substring(4, 6), 16);
    return { r, g, b };
  }
  return null;
}

/**
 * Thuật toán Canvas 2D Recolor giữ nguyên nếp gấp (Luminance preserving fabric tint)
 * @param imageUrl Đường dẫn hình ảnh gốc
 * @param targetColorHex Mã màu Hex muốn đổi (nếu null hoặc 'original' sẽ trả về ảnh gốc)
 * @param intensity Độ đậm của màu (từ 0.2 đến 1.0, mặc định 0.85)
 */
export async function recolorImageViaCanvas(
  imageUrl: string,
  targetColorHex: string | null | undefined,
  intensity: number = 0.85
): Promise<string> {
  if (!imageUrl) return '';
  if (!targetColorHex || targetColorHex === 'original') return imageUrl;

  const targetRgb = hexToRgb(targetColorHex);
  if (!targetRgb) return imageUrl;

  // Tạo key cache
  const cacheKey = `${imageUrl}__${targetColorHex}__${intensity.toFixed(2)}`;
  if (recolorCache.has(cacheKey)) {
    return recolorCache.get(cacheKey)!;
  }

  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';

    img.onload = () => {
      try {
        const canvas = document.createElement('canvas');
        const width = img.naturalWidth || img.width;
        const height = img.naturalHeight || img.height;

        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d', { willReadFrequently: true });
        if (!ctx) {
          resolve(imageUrl);
          return;
        }

        // Vẽ ảnh gốc lên canvas
        ctx.drawImage(img, 0, 0);

        const imgData = ctx.getImageData(0, 0, width, height);
        const data = imgData.data;
        const totalPixels = data.length;

        const tR = targetRgb.r;
        const tG = targetRgb.g;
        const tB = targetRgb.b;
        const factor = Math.min(Math.max(intensity, 0.1), 1.0);

        for (let i = 0; i < totalPixels; i += 4) {
          const a = data[i + 3];
          if (a === 0) continue; // Bỏ qua pixel trong suốt

          const r = data[i];
          const g = data[i + 1];
          const b = data[i + 2];

          // Tính độ sáng thực tế (Perceptual Luminance)
          const lum = 0.299 * r + 0.587 * g + 0.114 * b;
          const normLum = lum / 255;

          // Phép hòa trộn kết hợp Multiply & Screen để giữ nguyên nếp gấp vải và bóng đổ
          // Tăng độ tương phản nhẹ ở vùng đổ bóng
          let blendedR: number;
          let blendedG: number;
          let blendedB: number;

          if (normLum < 0.5) {
            // Vùng tối / nếp gấp: Multiply hòa trộn
            blendedR = 2 * normLum * tR;
            blendedG = 2 * normLum * tG;
            blendedB = 2 * normLum * tB;
          } else {
            // Vùng sáng / nổi khối: Screen hòa trộn
            blendedR = 255 - 2 * (1 - normLum) * (255 - tR);
            blendedG = 255 - 2 * (1 - normLum) * (255 - tG);
            blendedB = 255 - 2 * (1 - normLum) * (255 - tB);
          }

          // Trộn với ảnh gốc theo hệ số intensity
          data[i] = Math.round(r * (1 - factor) + blendedR * factor);
          data[i + 1] = Math.round(g * (1 - factor) + blendedG * factor);
          data[i + 2] = Math.round(b * (1 - factor) + blendedB * factor);
        }

        ctx.putImageData(imgData, 0, 0);
        const resultDataUrl = canvas.toDataURL('image/png');

        // Lưu vào cache
        recolorCache.set(cacheKey, resultDataUrl);
        resolve(resultDataUrl);
      } catch (err) {
        console.warn('Canvas recoloring fallback to original:', err);
        resolve(imageUrl);
      }
    };

    img.onerror = () => {
      resolve(imageUrl);
    };

    img.src = imageUrl;
  });
}
