import React from 'react';
import { X } from 'lucide-react';
import { CasualItem, Gender } from '../types';
import { SafeImage } from './SafeImage';
import { resolveImageUrl } from '../utils/helpers';

interface CasualDetailModalProps {
  item: CasualItem;
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
  const resolvedThumbnailUrl = resolveImageUrl(
    item.thumbnail_url,
    item.has_gender_variants,
    selectedGender
  );

  // Translate category into standard Vietnamese
  const getCategoryVietnamese = (cat?: string) => {
    if (!cat) return '';
    const lower = cat.toLowerCase();
    if (lower.includes('bottom')) return 'Trang phục nửa dưới (Quần / Váy)';
    if (lower.includes('inner') || lower.includes('top')) return 'Áo mặc trong';
    if (lower.includes('shoe') || lower.includes('footwear')) return 'Giày dép';
    if (lower.includes('outer')) return 'Áo khoác ngoài';
    if (lower.includes('acc')) return 'Phụ kiện';
    return cat;
  };

  // Translate formality level into standard Vietnamese
  const getFormalityVietnamese = (level?: string) => {
    if (!level) return '';
    const lower = level.toLowerCase();
    if (lower.includes('smart')) return 'Thanh lịch năng động';
    if (lower.includes('casual')) return 'Trang phục hằng ngày';
    if (lower.includes('formal')) return 'Lễ tiệc trang trọng';
    return level;
  };

  return (
    <div className="fixed inset-0 z-50 bg-stone-900/40 backdrop-blur-sm flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-xl w-full border border-stone-200/80 shadow-2xl overflow-hidden flex flex-col my-auto max-h-[90vh]">
        <div className="px-6 py-4 border-b border-stone-100 flex items-center justify-between bg-stone-50/50">
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono font-bold text-stone-700 bg-stone-100 px-2 py-0.5 rounded border border-stone-200">
              {item.id}
            </span>
            <span className="text-xs text-gray-500 font-sans">Thời trang đương đại</span>
            {item.has_gender_variants && (
              <span className="text-[10px] font-sans text-red-700 bg-red-100 px-2 py-0.5 rounded font-semibold">
                Kiểu {selectedGender === 'Male' ? 'Nam' : 'Nữ'}
              </span>
            )}
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-stone-100 hover:bg-stone-200 text-gray-500 hover:text-gray-900 flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-6 sm:p-8 overflow-y-auto space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 items-start">
            <div className="rounded-2xl overflow-hidden aspect-[3/4] bg-stone-100 shadow-sm border border-stone-200/60">
              <SafeImage
                src={resolvedThumbnailUrl}
                alt={item.name}
                fallbackText={`${item.name} (${selectedGender === 'Male' ? 'Nam' : 'Nữ'})`}
                expectedPath={resolvedThumbnailUrl}
                className="w-full h-full"
              />
            </div>

            <div className="space-y-4">
              <div>
                <span className="text-xs font-sans uppercase text-red-700 font-semibold tracking-wider">
                  {getCategoryVietnamese(item.category)}
                </span>
                <h3 className="text-xl font-bold text-gray-900 mt-1 leading-snug">
                  {item.name}
                </h3>
              </div>

              <div className="space-y-2 text-xs">
                {item.formality_level && (
                  <div className="flex items-center justify-between py-1.5 border-b border-stone-100">
                    <span className="text-gray-400">Mức độ trang trọng:</span>
                    <span className="font-semibold text-gray-800">{getFormalityVietnamese(item.formality_level)}</span>
                  </div>
                )}
                {item.silhouette && (
                  <div className="flex items-center justify-between py-1.5 border-b border-stone-100">
                    <span className="text-gray-400">Phom dáng:</span>
                    <span className="font-semibold text-gray-800">Dáng {item.silhouette}</span>
                  </div>
                )}
                {item.length && (
                  <div className="flex items-center justify-between py-1.5 border-b border-stone-100">
                    <span className="text-gray-400">Chiều dài:</span>
                    <span className="font-sans text-gray-800">
                      {item.length === 'below_knee' ? 'Dưới đầu gối' : item.length === 'above_knee' ? 'Trên đầu gối' : item.length}
                    </span>
                  </div>
                )}
              </div>

              {item.description && (
                <p className="text-xs text-gray-600 leading-relaxed bg-stone-50 p-3.5 rounded-xl border border-stone-200/60">
                  {item.description}
                </p>
              )}
            </div>
          </div>
        </div>

        <div className="px-6 py-4 border-t border-stone-100 flex items-center justify-between bg-stone-50/30">
          <span className="text-xs text-gray-400 font-sans">Mã item: {item.id}</span>
          <div className="flex gap-2">
            {onSelectForStudio && (
              <button
                onClick={() => {
                  onSelectForStudio(item.id);
                  onClose();
                }}
                className="px-4 py-2 rounded-xl bg-red-700 hover:bg-red-800 text-white text-xs font-semibold transition-all shadow-sm"
              >
                Chọn phối trang phục
              </button>
            )}
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-stone-100 hover:bg-stone-200 text-gray-700 text-xs font-medium transition-all"
            >
              Đóng
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
