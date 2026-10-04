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

export interface OutfitCombination {
  id: string;
  name: string;
  concept_tagline: string; // ví dụ: "Sự giao thoa giữa nét thanh lịch của áo dài tân thời và sự phóng khoáng đương đại"
  garment_id: string; // Ánh xạ đến id của Garment/Costume
  casual_item_ids: string[]; // Danh sách id của CasualItem phối cùng
  style_notes: string;
  occasion: string; // ví dụ: "Dạo phố cuối tuần, Cafe nghệ thuật, Triển lãm"
  image_mockup: string; // Bắt buộc: đường dẫn ảnh, vd: "/assets/outfits/of_01.webp"
  tags: string[];
  vibe_rating?: number; // thang điểm phong cách (vd: 5 sao)
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
