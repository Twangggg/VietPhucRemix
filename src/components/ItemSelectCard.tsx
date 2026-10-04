import React from 'react';
import { Check, Sparkles, Eye, Plus } from 'lucide-react';
import { SafeImage } from './SafeImage';
import { getSafeImageUrl } from '../utils/helpers';

export interface ItemSelectCardProps {
  item: {
    id: string;
    name: string;
    resolvedImageUrl?: string;
    image_url?: string | string[];
    thumbnail_url?: string;
    category?: string;
    type?: string;
    origin?: string;
    formality?: string;
    is_sacred?: boolean;
    description?: string;
  };
  isSelected: boolean;
  onSelect: () => void;
  onViewDetail?: () => void;
  badgeText?: string;
  subtitle?: string;
}

export const ItemSelectCard: React.FC<ItemSelectCardProps> = ({
  item,
  isSelected,
  onSelect,
  onViewDetail,
  badgeText,
  subtitle
}) => {
  const imageUrl = item.resolvedImageUrl || getSafeImageUrl(item);

  return (
    <div
      className={`group relative rounded-2xl p-2.5 sm:p-3 border transition-all duration-200 flex flex-col justify-between text-left select-none ${
        isSelected
          ? 'bg-red-50/50 border-red-700 shadow-sm ring-2 ring-red-700'
          : 'bg-white border-stone-200/80 hover:border-stone-300 hover:shadow-xs hover:-translate-y-0.5'
      }`}
    >
      <div className="space-y-2">
        {/* Khung hình ảnh Thumbnail dạng hình chữ nhật đứng (Portrait) */}
        <div
          onClick={onViewDetail || onSelect}
          className="aspect-[3/4] w-full rounded-xl overflow-hidden relative bg-stone-100 flex items-center justify-center cursor-pointer"
        >
          {imageUrl ? (
            <SafeImage
              src={imageUrl}
              alt={item.name}
              fallbackText={item.name}
              expectedPath={imageUrl}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
          ) : (
            <div className="flex flex-col items-center justify-center text-stone-300 gap-1 p-2">
              <Sparkles className="w-6 h-6 text-stone-300 group-hover:text-red-700/60 transition-colors" />
              <span className="text-[9px] font-mono uppercase text-stone-400">Di sản</span>
            </div>
          )}

          {/* Dấu tích xanh khi được chọn ở góc trên bên phải */}
          {isSelected && (
            <div className="absolute top-2 right-2 bg-emerald-600 text-white rounded-full p-1 shadow-md animate-in zoom-in-50 duration-150">
              <Check className="w-3 h-3 stroke-[3]" />
            </div>
          )}

          {/* Badge bổ trợ phom dáng nếu có */}
          {badgeText && (
            <span className="absolute bottom-2 left-2 px-1.5 py-0.5 rounded-md bg-white/90 backdrop-blur-xs text-red-700 font-sans text-[9px] font-semibold shadow-xs">
              {badgeText}
            </span>
          )}
        </div>

        {/* Thông tin mô tả ngắn */}
        <div className="space-y-0.5">
          <h4
            onClick={onViewDetail || onSelect}
            className="text-xs font-bold text-gray-900 line-clamp-1 group-hover:text-red-700 transition-colors cursor-pointer"
            title={item.name}
          >
            {item.name}
          </h4>
          <p className="text-[11px] text-stone-500 line-clamp-1 font-sans">
            {subtitle || item.origin || item.category || 'Thời trang truyền thống'}
          </p>
        </div>
      </div>

      {/* ==========================================
          2 NÚT HÀNH ĐỘNG XẾP DỌC GỌN GÀNG (KHÔNG ICON)
         ========================================== */}
      <div className="mt-2.5 pt-2 border-t border-stone-100 flex flex-col gap-1.5">
        {/* Nút 1: Chọn / Đã chọn (Hành động chính) */}
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onSelect();
          }}
          className={`w-full py-1.5 px-2 rounded-xl text-xs font-semibold flex items-center justify-center transition-all cursor-pointer active:scale-95 shadow-xs whitespace-nowrap ${
            isSelected
              ? 'bg-red-700 hover:bg-red-800 text-white'
              : 'bg-stone-900 hover:bg-stone-800 text-white'
          }`}
          title={isSelected ? 'Bỏ chọn món này' : 'Chọn món này'}
        >
          {isSelected ? 'Đã chọn' : 'Chọn'}
        </button>

        {/* Nút 2: Chi tiết (Hành động phụ) */}
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onViewDetail?.();
          }}
          className="w-full py-1.5 px-2 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 hover:text-stone-900 text-xs font-medium flex items-center justify-center transition-colors cursor-pointer active:scale-95 whitespace-nowrap"
          title="Xem chi tiết thông tin trang phục"
        >
          Chi tiết
        </button>
      </div>
    </div>
  );
};

export default ItemSelectCard;
