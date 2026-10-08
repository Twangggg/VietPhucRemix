import { hexToRgb } from './recolorEngine';

// ==========================================
// COLOR ANALYSIS & HARMONY RULES
// ==========================================

export interface ExtractedColor {
  hex: string;
  r: number;
  g: number;
  b: number;
  h: number; // Hue 0-360
  s: number; // Saturation 0-1
  l: number; // Lightness 0-1
  ratio: number;
}

export interface OutfitColorItem {
  imageUrl: string;
  userColorHex?: string | null;
}

/**
 * Chuyển đổi RGB sang HSL (Hue, Saturation, Lightness)
 */
export function rgbToHsl(r: number, g: number, b: number) {
  r /= 255;
  g /= 255;
  b /= 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0, s = 0, l = (max + min) / 2;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: h = (g - b) / d + (g < b ? 6 : 0); break;
      case g: h = (b - r) / d + 2; break;
      case b: h = (r - g) / d + 4; break;
    }
    h /= 6;
  }
  return { h: Math.round(h * 360), s, l };
}

/**
 * Trích xuất màu chủ đạo từ ảnh
 * Bỏ qua background và pixel trong suốt, lượng tử hóa màu để nhóm lại,
 * lấy maxColors màu chiếm tỷ lệ lớn nhất.
 */
export async function extractDominantColors(imageUrl: string, maxColors: number = 3): Promise<ExtractedColor[]> {
  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';

    img.onload = () => {
      try {
        const canvas = document.createElement('canvas');
        // Thu nhỏ ảnh để phân tích nhanh hơn
        const maxSize = 100;
        let width = img.naturalWidth || img.width;
        let height = img.naturalHeight || img.height;
        if (width > maxSize || height > maxSize) {
          const ratio = Math.min(maxSize / width, maxSize / height);
          width = Math.floor(width * ratio);
          height = Math.floor(height * ratio);
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve([]);
          return;
        }

        ctx.drawImage(img, 0, 0, width, height);
        const data = ctx.getImageData(0, 0, width, height).data;
        const colorCounts = new Map<string, number>();
        let totalValidPixels = 0;

        for (let i = 0; i < data.length; i += 4) {
          const r = data[i];
          const g = data[i + 1];
          const b = data[i + 2];
          const a = data[i + 3];

          // Bỏ qua pixel trong suốt
          if (a < 50) continue;
          
          // Lượng tử hóa màu (Làm tròn để nhóm các màu gần giống nhau)
          const step = 24; 
          const qR = Math.min(255, Math.round(r / step) * step);
          const qG = Math.min(255, Math.round(g / step) * step);
          const qB = Math.min(255, Math.round(b / step) * step);

          const hex = `#${(1 << 24 | qR << 16 | qG << 8 | qB).toString(16).slice(1).toUpperCase()}`;
          colorCounts.set(hex, (colorCounts.get(hex) || 0) + 1);
          totalValidPixels++;
        }

        if (totalValidPixels === 0) {
          resolve([]);
          return;
        }

        // Lấy các màu phổ biến nhất
        const sortedColors = Array.from(colorCounts.entries())
          .sort((a, b) => b[1] - a[1])
          .slice(0, maxColors);

        const results = sortedColors.map(([hex, count]) => {
          const rgb = hexToRgb(hex) || { r: 0, g: 0, b: 0 };
          const hsl = rgbToHsl(rgb.r, rgb.g, rgb.b);
          return {
            hex,
            r: rgb.r,
            g: rgb.g,
            b: rgb.b,
            h: hsl.h,
            s: hsl.s,
            l: hsl.l,
            ratio: count / totalValidPixels
          };
        });

        resolve(results);
      } catch (err) {
        console.warn('Error extracting dominant colors:', err);
        resolve([]);
      }
    };

    img.onerror = () => {
      resolve([]);
    };

    img.src = imageUrl;
  });
}

/**
 * Lấy màu của một item (ưu tiên màu user đã chọn (recolor), nếu không thì phân tích ảnh)
 */
export async function getItemDominantColors(item: OutfitColorItem, maxColors: number = 3): Promise<ExtractedColor[]> {
  if (item.userColorHex && item.userColorHex !== 'original') {
    const rgb = hexToRgb(item.userColorHex);
    if (rgb) {
      const hsl = rgbToHsl(rgb.r, rgb.g, rgb.b);
      return [{
        hex: item.userColorHex.toUpperCase(),
        r: rgb.r,
        g: rgb.g,
        b: rgb.b,
        h: hsl.h,
        s: hsl.s,
        l: hsl.l,
        ratio: 1.0 // Giả định chiếm 100% tỷ lệ
      }];
    }
  }
  // Nếu chưa recolor -> phân tích màu từ asset
  return await extractDominantColors(item.imageUrl, maxColors);
}

/**
 * Tạo Color Palette cho toàn bộ Outfit
 */
export async function getOutfitColorPalette(items: OutfitColorItem[]): Promise<ExtractedColor[]> {
  let allColors: ExtractedColor[] = [];
  
  for (const item of items) {
    if (!item.imageUrl) continue;
    const colors = await getItemDominantColors(item, 2);
    allColors = allColors.concat(colors);
  }

  // Gộp các màu giống nhau và tính lại trọng số
  const paletteMap = new Map<string, ExtractedColor>();
  let totalRatio = 0;

  for (const color of allColors) {
    // Có thể làm tròn Hue để nhóm các màu gần giống nhau hơn nữa
    const groupKey = `${Math.round(color.h / 10) * 10}_${Math.round(color.s * 5) / 5}`;
    if (paletteMap.has(groupKey)) {
      const existing = paletteMap.get(groupKey)!;
      existing.ratio += color.ratio;
      paletteMap.set(groupKey, existing);
    } else {
      paletteMap.set(groupKey, { ...color });
    }
    totalRatio += color.ratio;
  }

  // Chuẩn hóa lại ratio
  const finalPalette = Array.from(paletteMap.values()).map(c => ({
    ...c,
    ratio: c.ratio / (totalRatio || 1)
  })).sort((a, b) => b.ratio - a.ratio);

  return finalPalette;
}

/**
 * Phân tích Color Harmony (Monochromatic, Analogous, Complementary, Triadic...)
 * Dựa trên khoảng cách Hue.
 */
export function analyzeColorHarmony(palette: ExtractedColor[]): string[] {
  if (palette.length < 2) return ['Monochromatic (Đơn sắc)'];

  const hues = palette.map(c => c.h);
  const rules = new Set<string>();

  // So sánh các cặp màu
  for (let i = 0; i < hues.length; i++) {
    for (let j = i + 1; j < hues.length; j++) {
      let diff = Math.abs(hues[i] - hues[j]);
      if (diff > 180) diff = 360 - diff;

      // Khoảng Hue tolerance ~15 độ
      if (diff < 20) {
        rules.add('Monochromatic (Đơn sắc)');
      } else if (diff >= 20 && diff <= 45) {
        rules.add('Analogous (Tương đồng)');
      } else if (diff >= 165 && diff <= 180) {
        rules.add('Complementary (Tương phản)');
      } else if (diff >= 105 && diff <= 135) {
        rules.add('Triadic (Tam giác đều)');
      } else if (diff >= 135 && diff <= 165) {
        rules.add('Split-Complementary (Tương phản phân nhánh)');
      }
    }
  }

  return Array.from(rules);
}

export interface ColorScoreResult {
  score: number;       // 0 - 15
  harmonies: string[];
  reasons: string[];
}

/**
 * Tính điểm màu sắc (Color Score) từ 0-15 và đưa ra nhận xét
 */
export function evaluateOutfitColors(palette: ExtractedColor[]): ColorScoreResult {
  const result: ColorScoreResult = {
    score: 0,
    harmonies: [],
    reasons: []
  };

  if (palette.length === 0) {
    result.score = 0;
    result.reasons.push("Không có dữ liệu màu sắc.");
    return result;
  }

  if (palette.length === 1) {
    result.score = 15;
    result.harmonies.push('Monochromatic (Đơn sắc)');
    result.reasons.push("Sử dụng duy nhất một tông màu, tạo nên tổng thể tối giản và an toàn tuyệt đối.");
    return result;
  }

  // Phân tích harmony
  const harmonies = analyzeColorHarmony(palette);
  result.harmonies = harmonies;

  // Lọc màu trung tính (Neutral: Đen, Trắng, Xám) - Saturation < 0.15 hoặc L > 0.9 hoặc L < 0.15
  const neutrals = palette.filter(c => c.s < 0.15 || c.l > 0.9 || c.l < 0.15);
  const colors = palette.filter(c => !(c.s < 0.15 || c.l > 0.9 || c.l < 0.15));

  let baseScore = 5; // Điểm cơ bản
  let harmonyScore = 0;

  if (harmonies.includes('Triadic (Tam giác đều)')) {
    harmonyScore = 15;
    result.reasons.push("Các màu tạo thành tam giác đều trên vòng thuần sắc, mang lại sự rực rỡ và độ tương phản ấn tượng nhưng vẫn cân bằng.");
  } else if (harmonies.includes('Complementary (Tương phản)')) {
    harmonyScore = 14;
    result.reasons.push("Sử dụng các màu đối xứng nhau trên vòng thuần sắc, tạo điểm nhấn mạnh mẽ và bắt mắt.");
  } else if (harmonies.includes('Split-Complementary (Tương phản phân nhánh)')) {
    harmonyScore = 13;
    result.reasons.push("Áp dụng tương phản phân nhánh giúp outfit nổi bật nhưng mềm mại và bớt gắt hơn so với tương phản trực tiếp.");
  } else if (harmonies.includes('Analogous (Tương đồng)')) {
    harmonyScore = 12;
    result.reasons.push("Sử dụng các màu liền kề nhau trên vòng thuần sắc, tạo cảm giác hài hòa, tự nhiên và êm dịu cho mắt.");
  } else if (harmonies.includes('Monochromatic (Đơn sắc)')) {
    harmonyScore = 10;
    result.reasons.push("Sử dụng các sắc độ khác nhau của cùng một màu, giúp tổng thể trang phục liền mạch và tinh tế.");
  }

  // Xử lý khi không có quy tắc rõ ràng
  if (harmonyScore === 0) {
    if (colors.length <= 1 && neutrals.length > 0) {
      harmonyScore = 12; // 1 màu nổi + màu trung tính
      result.reasons.push("Kết hợp màu sắc nổi bật cùng các tông màu trung tính (trắng, đen, xám) tạo sự thanh lịch và an toàn.");
    } else {
      harmonyScore = 7;
      result.reasons.push("Các màu sắc chưa tuân theo các quy tắc phối màu kinh điển, có thể tạo cảm giác lộn xộn hoặc phá cách tùy vào tỷ lệ diện tích.");
    }
  }

  result.score = Math.min(15, Math.max(0, harmonyScore));

  // Thưởng / Phạt dựa trên đặc điểm màu sắc
  let isTooSaturated = false;
  let saturatedCount = colors.filter(c => c.s > 0.8 && c.l > 0.3 && c.l < 0.7).length;
  if (saturatedCount >= 3) {
    result.score -= 2;
    result.reasons.push("Có quá nhiều tông màu chói (độ bão hòa cao) xuất hiện cùng lúc, dễ làm rối mắt.");
  }

  // Đảm bảo score nằm trong khoảng 0-15
  result.score = Math.max(0, Math.min(15, result.score));

  return result;
}
