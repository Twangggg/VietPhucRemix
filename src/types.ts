export type GarmentCategory = 'ao_dai' | 'ao_tac' | 'nhat_binh' | 'ao_ba_ba' | 'ao_giao_linh' | 'ao_yem' | 'other' | string;

export type CasualCategory = 'bottoms' | 'tops' | 'outerwear' | 'footwear' | 'accessories' | 'Bottom' | 'Inner' | 'Shoes' | string;

export type LapelFold = 'left_over_right' | 'right_over_left';

export interface ValidationResult {
  isValid: boolean;
  severity: 'INFO' | 'WARN' | 'BLOCK';
  message: string;
  ruleId?: string;
}

export type Gender = 'Male' | 'Female';

export interface Garment {
  id: string;
  name: string;
  category?: string;
  origin?: string;
  era?: string;
  characteristics?: string | string[];
  description?: string;
  image_url: string;
  fabric?: string;
  cultural_significance?: string;
  length?: string;
  silhouette?: string;
  usage_context?: string;
  
  colors?: string | string[];
  accessories?: string | string[];
  references?: string | string[];
  
  significance?: string;
  notes?: string;
  
  type?: string;
  gender?: 'male' | 'female' | 'unisex' | string;
  formality?: string;
  has_gender_variants?: boolean;
}

// Alias Costume cho Garment để tương thích tối đa
export type Costume = Garment;

export interface CasualItem {
  id: string;
  name: string;
  
  // Các trường phân loại
  type?: string;                     // (Từ JSON) VD: "bottom", "inner", "shoes"
  category?: string;                 // (Từ JSON / Interface) VD: "bottom_pants", v.v.
  gender?: 'male' | 'female' | 'unisex' | string; // (Từ JSON)
  
  // Các trường mô tả chi tiết (Mới bổ sung)
  brand_or_style?: string;
  characteristics?: string | string[];
  description?: string;
  
  // Xử lý ảnh: Hỗ trợ cả 2 tên biến để không bị lỗi khi import data
  image_url?: string;                // (Từ JSON hiện tại của bạn)
  thumbnail_url?: string;            // (Từ Interface cũ)
  
  colors?: string[] | string;
  length?: string;
  silhouette?: string;
  
  // Xử lý Formality: Hỗ trợ cả 2 tên biến
  formality?: string;                // (Từ JSON hiện tại)
  formality_level?: string;          // (Từ Interface cũ)
  
  has_gender_variants?: boolean;
}

export interface ContextItem {
  id: string;
  name: string;
  description: string;
  is_sacred?: boolean;
}

export interface OutfitComposition {
  inner: string | null;
  top: string | null;
  outer_formal: string | null;
  outer_traditional: string | null;
  bottom_pants: string | null;
  bottom_skirt: string | null;
  shoes: string | null;
  traditional_footwear: string | null;
  headwear: string | null;
  jewelry: string[];
  other_accessories: string[];
}

export interface ColorPalette {
  primary: string;
  secondary: string;
  accent: string;
}

export interface OutfitCombination {
  id: string;
  name: string;
  gender: string;
  applicable_events: string[];
  style: string;
  composition: OutfitComposition;
  color_palette: ColorPalette;
  styling_notes: string;
  traditional_focus: string;
  rule_check_status: string;
}

export interface AccessoryItem {
  id: string;
  name: string;
  origin?: string;
  characteristics?: string | string[];
  usage_context?: string;
  colors?: string[];
  accessories?: string[]; // Mảng các trang phục tương thích
  significance?: string;
  notes?: string;
  references?: string[];
  type?: string; // 'jewelry' | 'headwear'
  category?: string;
  gender?: 'male' | 'female' | 'unisex' | string;
  formality?: string;
  image_url?: string | string[]; // Chú ý: có thể là string hoặc mảng string
}
