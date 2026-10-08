import React, { useState } from 'react';
import {
  X,
  Sparkles,
  Compass,
  Shirt,
  Layers,
  Sparkle,
  Check,
  Palette,
  RotateCcw
} from 'lucide-react';
import { CasualItem, Gender } from '../types';
import { SafeImage } from './SafeImage';
import { TintedImage } from './TintedImage';
import { getSafeImageUrl, resolveImageUrl, getCategoryVietnamese } from '../utils/helpers';
import { TRADITIONAL_COLORS } from '../utils/recolorEngine';

// CƠ SỞ TRI THỨC MÔ TẢ VÀ GỢI Ý PHỐI ĐỒ CHO TẤT CẢ TRANG PHỤC THƯỜNG PHỤC (CASUAL / CONTEMPORARY)
const CASUAL_KNOWLEDGE_BASE: Record<
  string,
  {
    description: string;
    styling_tips: string;
    material: string;
    vibe: string;
  }
> = {
  cs_01: {
    description:
      'Áo thun trơn màu trung tính với phom dáng suông rộng vừa phải, cổ tròn tối giản dệt gân thanh lịch. Đây là lớp nền hoàn hảo giúp tôn lên phom áo và hoa văn của các lớp cổ phục khoác ngoài.',
    styling_tips:
      'Mặc bên trong áo Nhật Bình cách tân, áo Giao Lĩnh hoặc Ngũ Thân để tạo vẻ trẻ trung, hiện đại và năng động khi dạo phố.',
    material: '100% Cotton Compact chải kỹ, thoáng khí, thấm hút mồ hôi và mềm mại trên da.',
    vibe: 'Tối giản, Năng động, Dễ ứng dụng'
  },
  cs_02: {
    description:
      'Áo thun cổ lọ dệt kim mỏng nhẹ, ôm nhẹ theo đường nét cơ thể. Cổ cao 3cm tạo nét trang nhã, phảng phất phong thái cổ điển châu Âu hòa cùng nét kín đáo Á Đông.',
    styling_tips:
      'Kết hợp tuyệt vời cùng áo Đối Khâm mở tà hoặc áo Tấc buông vạt, tạo nên các lớp layer thời trang ấm áp và tinh tế cho mùa thu đông.',
    material: 'Len dệt kim mỏng pha sợi tơ tằm, giữ nhiệt êm ái và không gây cộm.',
    vibe: 'Cổ điển, Trí thức, Thanh lịch'
  },
  cs_03: {
    description:
      'Áo sơ mi lụa tơ tằm dệt trơn với đường cắt may tinh xảo, cổ áo đứng mềm mại và hàng khuy ngọc bọc vải thủ công mang tinh thần thời trang cao cấp.',
    styling_tips:
      'Thích hợp mặc lót bên trong áo Ngũ Thân tay chẽn hoặc áo Nhật Bình khi tham dự các sự kiện nghệ thuật, triển lãm hay lễ nghi trang trọng.',
    material: 'Lụa tơ tằm Vạn Phúc dệt satin, bề mặt óng ả nhẹ và rũ tự nhiên.',
    vibe: 'Sang trọng, Nghệ thuật, Quý phái'
  },
  cs_04: {
    description:
      'Quần tây âu ống suông dáng đứng kinh điển với đường ly thẳng tắp, cạp cao tôn dáng và phần gấu quần buông tự nhiên thanh thoát.',
    styling_tips:
      'Phối cùng áo dài Ngũ Thân nam hoặc nữ tạo nên tổng thể giao thoa Đông - Tây chuẩn mực của phong cách Smart Casual đương đại.',
    material: 'Vải Wool blend cao cấp đứng phom, chống nhăn và co giãn nhẹ.',
    vibe: 'Thanh lịch, Trang trọng, Hiện đại'
  },
  cs_05: {
    description:
      'Quần jeans ống đứng màu chàm nguyên bản (Raw Indigo), đường chỉ dệt sắc sảo, không mài rách để giữ trọn vẹn nét lịch sự.',
    styling_tips:
      'Tạo phong cách Streetwear đương đại khi kết hợp cùng áo Giao Lĩnh ngắn vạt hoặc áo Nhật Bình mở cúc buông nhẹ.',
    material: 'Denim dệt bông tự nhiên 12oz, bền bỉ và giữ phom tốt.',
    vibe: 'Phóng khoáng, Trẻ trung, Cá tính'
  },
  cs_06: {
    description:
      'Chân váy xếp ly dáng dài (Pleated Midi Skirt) với nếp gấp dập nhiệt tỉ mỉ, tạo hiệu ứng chuyển động uyển chuyển thướt tha trong từng bước chân.',
    styling_tips:
      'Phối cùng áo Đối Khâm hoặc áo Nhật Bình nữ, tạo hiệu ứng thị giác tương tự thường phục truyền thống nhưng gọn gàng, hiện đại.',
    material: 'Chiffon dập ly cao cấp phủ màng mờ, bề mặt mịn màng.',
    vibe: 'Nữ tính, Thơ mộng, Duyên dáng'
  },
  cs_07: {
    description:
      'Quần ống rộng dệt từ sợi đũi tự nhiên với phom dáng rủ nhẹ, cạp chun thoải mái đem lại cảm giác tự do, an nhiên thuần khiết.',
    styling_tips:
      'Lựa chọn lý tưởng khi kết hợp cùng áo Cổ Phục mùa hè, tạo cảm giác thanh tịnh, phù hợp không gian trà đạo, thưởng ngoạn thiên nhiên.',
    material: 'Đũi tơ tằm tự nhiên Nam Cao dệt tay, thoáng mát và mềm mại.',
    vibe: 'Thanh tịnh, Tự nhiên, Mộc mạc'
  },
  cs_08: {
    description:
      'Đôi giày lười da bò Ý dáng Loafer cổ điển với đường may thủ công viền mũi, đế da phối cao su êm ái tạo nét lịch lãm đậm chất quý ông / quý cô tri thức.',
    styling_tips:
      'Cực kỳ hòa hợp với trang phục Ngũ Thân kết hợp quần âu, tạo nét giao thoa văn hóa giữa Đông Dương thập niên 1930 và nhịp sống hiện đại.',
    material: 'Da bò thuộc thảo mộc (Veg-tan leather), lót da êm chân.',
    vibe: 'Cổ điển, Trí thức, Trang nhã'
  },
  cs_09: {
    description:
      'Giày thể thao da màu trắng thuần khiết với thiết kế Low-top tối giản, đế cao su đúc nguyên khối chống trượt êm ái cho mọi hành trình dạo phố.',
    styling_tips:
      'Lựa chọn hàng đầu cho các bạn trẻ phối Cổ Phục đi dạo phố, chụp ảnh kỷ yếu hay tham gia các lễ hội giao lưu văn hóa giới trẻ.',
    material: 'Da Nappa cao cấp kết hợp đế cao su lưu hóa bền bỉ.',
    vibe: 'Năng động, Phá cách, Trẻ trung'
  },
  cs_10: {
    description:
      'Guốc mộc cách tân chạm khắc từ gỗ xoan đào hoặc gỗ mít tự nhiên, quai nhung mềm mại kết hợp đế cao su êm ái triệt tiêu tiếng ồn.',
    styling_tips:
      'Hoàn thiện vẻ đẹp thuần Việt cho các bộ cổ phục Áo Tấc, Nhật Bình hay Ngũ Thân mà vẫn êm ái khi đi bộ lâu.',
    material: 'Gỗ tự nhiên nguyên khối phủ sơn mài mờ, quai nhung nhung chần bông.',
    vibe: 'Thuần Việt, Hoài cổ, Tinh tế'
  },
  cs_11: {
    description:
      'Chân váy chữ A dáng lỡ dài qua gối với đường cắt may chuẩn xác, cạp cao tôn eo và độ xòe vừa phải tạo sự trang nhã, duyên dáng.',
    styling_tips:
      'Phối cùng áo Nhật Bình cách tân hoặc áo Giao Lĩnh để tạo nên phong cách dạo phố hoặc công sở thanh lịch.',
    material: 'Vải Linen pha Cotton dệt chéo, giữ phom tự nhiên và thoáng mát.',
    vibe: 'Thanh lịch, Đương đại, Duyên dáng'
  },
  cs_12: {
    description:
      'Quần tây xếp ly đôi cạp cao mang phom dáng Retro cổ điển, ống rộng vừa phải tôn chiều cao và tạo sự đĩnh đạc tự tin.',
    styling_tips:
      'Phối cùng áo Ngũ Thân hoặc áo Giao Lĩnh tay thụng tạo phong thái nho nhã của tầng lớp trí thức Việt Nam thế kỷ 20.',
    material: 'Vải Cotton gân xước mờ cao cấp, thoáng mát bốn mùa.',
    vibe: 'Cổ điển, Nho nhã, Đĩnh đạc'
  }
};

export interface CasualDetailModalProps {
  item: CasualItem | null;
  onClose: () => void;
  onSelectForStudio?: (id: string, forceSelect?: boolean) => void;
  selectedGender?: Gender;
  isSelected?: boolean;
  currentColorHex?: string | null;
  onApplyColor?: (colorHex: string | null) => void;
}

export const CasualDetailModal: React.FC<CasualDetailModalProps> = ({
  item,
  onClose,
  onSelectForStudio,
  selectedGender = 'Female',
  isSelected = false,
  currentColorHex,
  onApplyColor
}) => {
  const [previewColorHex, setPreviewColorHex] = useState<string | null>(currentColorHex || null);

  if (!item) return null;

  const activeColor =
    TRADITIONAL_COLORS.find((col) =>
      col.id === 'original'
        ? !previewColorHex || previewColorHex === 'original'
        : previewColorHex?.toLowerCase() === col.hex.toLowerCase()
    ) || TRADITIONAL_COLORS[0];

  const safeBaseUrl = (item as any).resolvedImageUrl || getSafeImageUrl(item);
  const resolvedThumbnailUrl = (item as any).resolvedImageUrl || resolveImageUrl(
    safeBaseUrl,
    item.has_gender_variants,
    selectedGender
  );

  // Lấy dữ liệu mô tả chuyên sâu
  const knowledge =
    CASUAL_KNOWLEDGE_BASE[item.id] ||
    CASUAL_KNOWLEDGE_BASE[item.id.replace(/_\d+$/, '')] || {
      description:
        item.description ||
        'Trang phục phong cách đương đại được thiết kế tối giản, dễ dàng hòa quyện và tôn vinh vẻ đẹp của cổ phục di sản Việt Nam.',
      styling_tips:
        'Phối cùng các lớp áo cổ phục để tạo nên sự giao thoa hài hòa giữa phom dáng truyền thống và hơi thở thời trang hiện đại.',
      material: 'Chất liệu vải dệt cao cấp thoáng mát, xử lý đường may mượt mà, giữ phom tốt.',
      vibe: 'Đương đại, Thanh lịch, Dễ ứng dụng'
    };


  const getFormalityVietnamese = (level?: string) => {
    if (!level) return 'Linh hoạt thường nhật';
    const lower = level.toLowerCase();
    if (lower.includes('smart')) return 'Thanh lịch năng động';
    if (lower.includes('casual')) return 'Trang phục thường nhật';
    if (lower.includes('formal')) return 'Lễ tiệc trang trọng';
    return level;
  };

  return (
    <div
      className="fixed inset-0 z-[100] bg-stone-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 overflow-y-auto animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-3xl max-w-2xl w-full border border-stone-200/80 shadow-2xl overflow-hidden flex flex-col my-auto max-h-[92vh] relative"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Nút đóng tối giản */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-20 w-8 h-8 rounded-full bg-white/90 hover:bg-white text-stone-500 hover:text-stone-900 flex items-center justify-center transition-colors border border-stone-200/60 shadow-xs cursor-pointer"
          aria-label="Đóng"
        >
          <X className="w-4 h-4" />
        </button>

        {/* 1. HERO IMAGE (EDITORIAL CONTEMPORARY) - Khung ảnh lớn kèm tùy biến màu sắc */}
        <div className="relative w-full h-[360px] sm:h-[420px] bg-[#FAF8F5] flex items-center justify-center pt-8 sm:pt-10 pb-24 sm:pb-28 px-4 sm:px-6 border-b border-stone-100 shrink-0">
          <TintedImage
            src={resolvedThumbnailUrl}
            colorHex={previewColorHex}
            intensity={0.85}
            alt={item.name}
            fallbackText={item.name}
            expectedPath={resolvedThumbnailUrl}
            className="w-full h-full bg-transparent flex items-center justify-center"
            imgClassName="w-full h-full object-contain object-center scale-105 sm:scale-110 transition-transform duration-300 drop-shadow-md"
          />

          {item.has_gender_variants && (
            <div className="absolute top-4 left-4 text-[10px] tracking-wider uppercase font-mono text-stone-500 bg-white/90 px-2.5 py-0.5 rounded-full border border-stone-200/60 shadow-2xs">
              Phom {selectedGender === 'Male' ? 'Nam' : 'Nữ'}
            </div>
          )}

          {/* Dải chọn màu sắc trực tiếp nếu có onApplyColor */}
          {onApplyColor && (
            <div className="absolute bottom-3 inset-x-2.5 sm:inset-x-4 bg-white/95 backdrop-blur-md p-3 sm:p-3.5 rounded-2xl border border-stone-200/90 shadow-xl shadow-stone-900/10 z-10 flex flex-col gap-1.5">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2 min-w-0">
                  <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-red-50 text-red-800 text-xs font-bold shrink-0 border border-red-100">
                    <Palette className="w-3.5 h-3.5 text-red-700 animate-pulse" />
                    <span>Tùy biến màu sắc</span>
                  </div>

                  <div className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-stone-100/90 border border-stone-200/70 text-[11px] font-medium text-stone-700 truncate">
                    <span
                      className="w-2.5 h-2.5 rounded-full border border-black/10 shrink-0"
                      style={{
                        backgroundColor:
                          activeColor.id === 'original' ? '#a8a29e' : activeColor.hex
                      }}
                    />
                    <span className="truncate">
                      {activeColor.id === 'original'
                        ? 'Nguyên bản'
                        : `${activeColor.name}${activeColor.alias ? ` (${activeColor.alias})` : ''}`}
                    </span>
                  </div>
                </div>

                {previewColorHex && previewColorHex !== 'original' && (
                  <button
                    type="button"
                    onClick={() => {
                      setPreviewColorHex(null);
                      onApplyColor?.(null);
                    }}
                    className="px-2.5 py-1 rounded-md text-[11px] font-medium text-stone-500 hover:text-red-700 hover:bg-red-50 transition-colors flex items-center gap-1 shrink-0 cursor-pointer"
                    title="Khôi phục màu gốc"
                  >
                    <RotateCcw className="w-3 h-3" />
                    <span>Đặt lại</span>
                  </button>
                )}
              </div>

              <div className="flex items-center gap-2.5 sm:gap-3 overflow-x-auto scrollbar-hide py-2 sm:py-2.5 px-1.5">
                {TRADITIONAL_COLORS.map((col) => {
                  const isColorActive =
                    col.id === 'original'
                      ? !previewColorHex || previewColorHex === 'original'
                      : previewColorHex?.toLowerCase() === col.hex.toLowerCase();

                  return (
                    <button
                      key={col.id}
                      type="button"
                      onClick={() => {
                        const newHex = col.id === 'original' ? null : col.hex;
                        setPreviewColorHex(newHex);
                        onApplyColor?.(newHex);
                      }}
                      className={`relative w-7 h-7 sm:w-8 sm:h-8 rounded-full transition-all duration-200 cursor-pointer flex items-center justify-center shrink-0 ${
                        isColorActive
                          ? 'ring-2 ring-red-700 ring-offset-2 scale-110 shadow-md z-10'
                          : 'border border-black/15 hover:scale-110 opacity-90 hover:opacity-100 shadow-2xs hover:shadow-xs'
                      }`}
                      style={{
                        backgroundColor: col.id === 'original' ? '#F3F4F6' : col.hex
                      }}
                      title={`${col.name} ${col.alias ? `(${col.alias})` : ''} - ${col.description}`}
                      aria-label={col.name}
                    >
                      {col.id === 'original' ? (
                        <RotateCcw
                          className={`w-3.5 h-3.5 ${
                            isColorActive ? 'text-stone-900 font-bold' : 'text-stone-500'
                          }`}
                        />
                      ) : isColorActive ? (
                        <Check className="w-3.5 h-3.5 text-white drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)]" />
                      ) : null}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* 2. BORDERLESS CONTENT FLOW (DÒNG CHẢY BẢO TÀNG SỐ) */}
        <div className="p-6 sm:p-8 overflow-y-auto space-y-6 text-stone-900">
          {/* Header Tiêu đề chính */}
          <div className="border-b border-stone-100 pb-5">
            <span className="text-[10px] uppercase font-mono tracking-[0.25em] text-stone-400 font-semibold block mb-1.5">
              {getCategoryVietnamese(item.category, item.type)}
            </span>
            <h2 className="text-2xl sm:text-3xl font-serif font-bold text-stone-900 tracking-tight leading-tight">
              {item.name}
            </h2>
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-stone-500 mt-2 font-sans">
              <span>
                <strong className="font-medium text-stone-700">Phom dáng: </strong>
                {item.silhouette ? `Dáng ${item.silhouette}` : 'Tiêu chuẩn'}
              </span>
              <span>•</span>
              <span>
                <strong className="font-medium text-stone-700">Tính chất: </strong>
                {getFormalityVietnamese(item.formality || item.formality_level)}
              </span>
            </div>
          </div>

          {/* Mục 1: Mô tả thiết kế & Phong cách */}
          <div className="border-b border-stone-100 pb-5 space-y-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-stone-800 flex items-center gap-2">
              <Shirt className="w-3.5 h-3.5 text-stone-400 stroke-[1.5]" />
              Mô tả thiết kế & Phom dáng
            </h3>
            <p className="text-sm text-stone-600 leading-relaxed font-sans">
              {knowledge.description}
            </p>
          </div>

          {/* Mục 2: Gợi ý phối đồ Remix */}
          <div className="border-b border-stone-100 pb-5 space-y-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-stone-800 flex items-center gap-2">
              <Compass className="w-3.5 h-3.5 text-stone-400 stroke-[1.5]" />
              Gợi ý phối đồ cùng Cổ phục
            </h3>
            <p className="text-sm text-stone-600 leading-relaxed font-sans">
              {knowledge.styling_tips}
            </p>
          </div>

          {/* Mục 3: Chất liệu & Cảm nhận */}
          <div className="space-y-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-stone-800 flex items-center gap-2">
              <Layers className="w-3.5 h-3.5 text-stone-400 stroke-[1.5]" />
              Chất liệu & Cảm nhận
            </h3>
            <p className="text-sm text-stone-600 leading-relaxed font-sans">
              {knowledge.material}
            </p>
          </div>
        </div>

        {/* 3. THANH CÔNG CỤ CHÂN TRANG FOOTER */}
        <div className="px-6 py-4 border-t border-stone-100 flex items-center justify-between bg-stone-50/50 shrink-0">
          <div className="flex items-center gap-2">
            <span className="text-xs text-stone-400 font-mono tracking-wider uppercase">
              Thời trang đương đại
            </span>
            {isSelected && (
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1">
                <Check className="w-3 h-3 stroke-[3]" />
                Đang trong bản phối
              </span>
            )}
          </div>
          <div className="flex items-center gap-2.5">
            {onSelectForStudio && (
              <>
                {isSelected ? (
                  <>
                    <button
                      type="button"
                      onClick={() => {
                        onSelectForStudio(item.id, false);
                        onClose();
                      }}
                      className="px-4 py-2 rounded-full text-xs font-semibold text-stone-600 hover:text-red-700 hover:bg-red-50 border border-stone-200 hover:border-red-200 transition-colors cursor-pointer"
                      title="Bỏ trang phục này khỏi bản phối"
                    >
                      Bỏ chọn
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        onSelectForStudio(item.id, true);
                        onClose();
                      }}
                      className="px-6 py-2.5 rounded-full text-xs font-bold bg-stone-900 hover:bg-stone-800 text-white transition-all shadow-xs cursor-pointer active:scale-95 flex items-center gap-1.5"
                    >
                      <Check className="w-3.5 h-3.5" />
                      <span>Đã chọn • Hoàn tất</span>
                    </button>
                  </>
                ) : (
                  <button
                    type="button"
                    onClick={() => {
                      onSelectForStudio(item.id, true);
                      onClose();
                    }}
                    className="px-8 py-2.5 rounded-full bg-red-700 hover:bg-red-800 text-white text-xs font-bold transition-all shadow-xs cursor-pointer active:scale-95 flex items-center gap-1.5"
                  >
                    <span>Chọn phối</span>
                  </button>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CasualDetailModal;
