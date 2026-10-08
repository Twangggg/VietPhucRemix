import React from 'react';
import { Garment, Gender } from '../types';
import { SafeImage } from './SafeImage';
import { getSafeImageUrl, resolveItemByGender, getCategoryVietnamese } from '../utils/helpers';

export interface GarmentCardProps {
  item?: Garment;
  garment?: Garment; // Hỗ trợ tương thích ngược
  onClick?: () => void;
  selected?: boolean;
  selectedGender?: Gender;
}

export const GarmentCard: React.FC<GarmentCardProps> = ({
  item,
  garment,
  onClick,
  selected,
  selectedGender
}) => {
  // Ưu tiên prop item theo yêu cầu Nhiệm vụ 2, fallback sang garment
  const currentGarment = item || garment;

  if (!currentGarment) {
    return null;
  }

  // 1. Lấy URL sạch đã chuẩn hóa
  const safeBaseUrl = getSafeImageUrl(currentGarment);

  // 2. Mặc định hiển thị bản Nữ ('Female') trên catalog theo yêu cầu đồng bộ, hoặc dùng selectedGender nếu có
  const genderTarget: Gender = selectedGender
    ? (selectedGender.toLowerCase() === 'male' ? 'Male' : 'Female')
    : 'Female';

  const resolved = resolveItemByGender(
    {
      ...currentGarment,
      image_url: safeBaseUrl
    },
    genderTarget
  );

  const displayImageUrl = resolved.resolvedImageUrl || safeBaseUrl;



  return (
    <article
      onClick={onClick}
      className={`group bg-white rounded-2xl overflow-hidden shadow-xs hover:shadow-md hover:-translate-y-1 transition-all duration-300 cursor-pointer flex flex-col ${
        selected ? 'ring-2 ring-red-700 shadow-md' : 'border border-stone-200/60'
      }`}
    >
      {/* Hình ảnh ở trên (Tỷ lệ 3:4 chuẩn tạp chí thời trang) */}
      <div className="relative aspect-[3/4] w-full overflow-hidden bg-stone-100">
        <SafeImage
          src={displayImageUrl}
          alt={currentGarment.name}
          fallbackText={currentGarment.name}
          expectedPath={displayImageUrl}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />

        {/* Cờ đánh dấu phom dáng nếu có biến thể */}
        {currentGarment.has_gender_variants && (
          <div className="absolute bottom-3 left-3 bg-white/90 backdrop-blur-xs text-red-700 text-[9px] font-sans px-2 py-0.5 rounded-md border border-red-200/50 font-semibold shadow-xs">
            Phom {genderTarget === 'Female' ? 'Nữ' : 'Nam'}
          </div>
        )}
      </div>

      {/* Thông tin mô tả bên dưới */}
      <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between space-y-2">
        <div>
          {/* Thể loại (Category) */}
          <span className="text-[10px] uppercase tracking-widest text-stone-400 font-semibold block mb-1">
            {getCategoryVietnamese(currentGarment.category, currentGarment.type)}
          </span>

          {/* Tên trang phục (in đậm, rõ ràng) */}
          <h3 className="text-base sm:text-lg font-bold text-gray-900 group-hover:text-red-700 transition-colors leading-snug line-clamp-1">
            {currentGarment.name}
          </h3>

          {/* Đoạn trích ngắn xuất xứ (origin) cắt chữ line-clamp-2 */}
          {currentGarment.origin && (
            <p className="text-xs text-stone-500 line-clamp-2 mt-1 leading-relaxed font-normal">
              {currentGarment.origin}
            </p>
          )}
        </div>

        <div className="pt-2 border-t border-stone-100/80 flex items-center justify-between text-[11px]">
          <span className="text-stone-400 font-sans">
            {currentGarment.era || 'Di sản Việt Nam'}
          </span>
          <span className="text-red-700 font-medium group-hover:translate-x-0.5 transition-transform flex items-center gap-0.5">
            Chi tiết →
          </span>
        </div>
      </div>
    </article>
  );
};
