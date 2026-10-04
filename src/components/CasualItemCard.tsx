import React from 'react';
import { CasualItem, Gender } from '../types';
import { SafeImage } from './SafeImage';
import { getSafeImageUrl, resolveImageUrl } from '../utils/helpers';

interface CasualItemCardProps {
  item: CasualItem;
  onClick: () => void;
  selected?: boolean;
  selectedGender?: Gender;
}

export const CasualItemCard: React.FC<CasualItemCardProps> = ({
  item,
  onClick,
  selected,
  selectedGender = 'Female'
}) => {
  // Lấy URL sạch đã được chuẩn hóa và gắn /
  const safeBaseUrl = getSafeImageUrl(item);

  // Phân giải URL theo biến thể giới tính (_1 cho Nam, _2 cho Nữ)
  const resolvedThumbnailUrl = resolveImageUrl(
    safeBaseUrl,
    item.has_gender_variants,
    selectedGender
  );

  // Translate category into standard Vietnamese
  const getCategoryVietnamese = (cat?: string) => {
    if (!cat) return '';
    const lower = cat.toLowerCase();
    if (lower.includes('bottom')) return 'Quần / Váy';
    if (lower.includes('inner') || lower.includes('top')) return 'Áo mặc trong';
    if (lower.includes('shoe') || lower.includes('footwear')) return 'Giày dép';
    if (lower.includes('outer')) return 'Áo khoác';
    if (lower.includes('acc')) return 'Phụ kiện';
    return cat;
  };

  // Translate formality level into standard Vietnamese
  const getFormalityVietnamese = (level?: string) => {
    if (!level) return '';
    const lower = level.toLowerCase();
    if (lower.includes('smart')) return 'Thanh lịch';
    if (lower.includes('casual')) return 'Hằng ngày';
    if (lower.includes('formal')) return 'Trang trọng';
    return level;
  };

  return (
    <article
      onClick={onClick}
      className={`group bg-white rounded-2xl overflow-hidden transition-all duration-300 cursor-pointer flex flex-col ${
        selected
          ? 'ring-2 ring-red-700 shadow-md'
          : 'border border-stone-200/60 shadow-xs hover:shadow-md hover:-translate-y-0.5'
      }`}
    >
      {/* Visual Image - 75% height */}
      <div className="relative aspect-[3/4] w-full overflow-hidden bg-stone-100">
        <SafeImage
          src={resolvedThumbnailUrl}
          alt={item.name}
          fallbackText={`${item.name} (${selectedGender === 'Male' ? 'Nam' : 'Nữ'})`}
          expectedPath={resolvedThumbnailUrl}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />

        {/* Gender variant indicator pill */}
        {item.has_gender_variants && (
          <div className="absolute bottom-3 left-3 bg-white/90 backdrop-blur-sm text-red-700 text-[9px] font-sans px-2 py-0.5 rounded-md border border-red-200/50 font-semibold shadow-xs flex items-center gap-1">
            <span>{selectedGender === 'Male' ? 'Nam' : 'Nữ'}</span>
          </div>
        )}
      </div>

      {/* Minimalist Text: Bold name + clean short subtext in gray */}
      <div className="p-3.5 sm:p-4 flex-1 flex flex-col justify-between">
        <div>
          <h4 className="text-sm font-bold text-gray-900 group-hover:text-red-700 transition-colors line-clamp-1 leading-snug">
            {item.name}
          </h4>
          <p className="text-xs text-stone-400 font-normal mt-0.5">
            {getCategoryVietnamese(item.category)}
          </p>
        </div>
      </div>
    </article>
  );
};
