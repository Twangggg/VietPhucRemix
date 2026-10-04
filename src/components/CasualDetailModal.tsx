import React from 'react';
import {
  X,
  Sparkles,
  Compass,
  Shirt,
  Layers,
  Sparkle
} from 'lucide-react';
import { CasualItem, Gender } from '../types';
import { SafeImage } from './SafeImage';
import { getSafeImageUrl, resolveImageUrl } from '../utils/helpers';

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
  onSelectForStudio?: (id: string) => void;
  selectedGender?: Gender;
}

export const CasualDetailModal: React.FC<CasualDetailModalProps> = ({
  item,
  onClose,
  onSelectForStudio,
  selectedGender = 'Female'
}) => {
  if (!item) return null;

  const safeBaseUrl = getSafeImageUrl(item);
  const resolvedThumbnailUrl = resolveImageUrl(
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

  // Chuẩn hóa tên danh mục thuần Việt, KHÔNG lộ mã kỹ thuật
  const getCategoryVietnamese = (cat?: string, type?: string) => {
    const raw = (cat || type || '').toLowerCase();
    if (raw.includes('skirt') || raw.includes('bottom_skirt')) return 'CHÂN VÁY ĐƯƠNG ĐẠI';
    if (raw.includes('pants') || raw.includes('bottom_pants') || raw.includes('bottom'))
      return 'QUẦN DÀI ĐƯƠNG ĐẠI';
    if (raw.includes('inner') || raw.includes('top')) return 'ÁO MẶC TRONG ĐƯƠNG ĐẠI';
    if (raw.includes('shoe') || raw.includes('footwear')) return 'GIÀY DÉP ĐƯƠNG ĐẠI';
    return 'THỜI TRANG ĐƯƠNG ĐẠI';
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

        {/* 1. HERO IMAGE (EDITORIAL MUSEUM) - Khung ảnh lớn, thoáng đãng */}
        <div className="relative w-full h-[360px] sm:h-[440px] bg-[#FAF8F5] flex items-center justify-center pt-10 sm:pt-12 pb-4 px-4 sm:px-6 border-b border-stone-100 shrink-0">
          <SafeImage
            src={resolvedThumbnailUrl}
            alt={item.name}
            fallbackText={item.name}
            expectedPath={resolvedThumbnailUrl}
            className="w-full h-full bg-transparent flex items-center justify-center"
            imgClassName="w-full h-full object-contain object-center scale-105 sm:scale-110 transition-transform duration-300"
          />

          {item.has_gender_variants && (
            <div className="absolute bottom-3 left-4 text-[10px] tracking-wider uppercase font-mono text-stone-500 bg-white/90 px-2.5 py-0.5 rounded-full border border-stone-200/60 shadow-2xs">
              Phom {selectedGender === 'Male' ? 'Nam' : 'Nữ'}
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
          <span className="text-xs text-stone-400 font-mono tracking-wider uppercase">
            Thời trang đương đại
          </span>
          <div className="flex items-center gap-2.5">
            {onSelectForStudio && (
              <button
                type="button"
                onClick={() => {
                  onSelectForStudio(item.id);
                  onClose();
                }}
                className="px-6 py-2.5 rounded-full bg-red-700 hover:bg-red-800 text-white text-xs font-semibold transition-all shadow-xs cursor-pointer active:scale-95"
              >
                Chọn phối
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-full bg-white hover:bg-stone-100 text-stone-600 text-xs font-medium transition-all border border-stone-200 cursor-pointer"
            >
              Đóng
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CasualDetailModal;
