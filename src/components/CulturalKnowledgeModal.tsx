import React from 'react';
import {
  X,
  BookOpen,
  Compass,
  Sparkles,
  Palette,
  Layers
} from 'lucide-react';
import { Garment } from '../types';
import { SafeImage } from './SafeImage';
import { getSafeImageUrl } from '../utils/helpers';

interface CulturalKnowledgeModalProps {
  isOpen: boolean;
  onClose: () => void;
  garment: Garment | null;
  selectedGender?: 'male' | 'female';
}

export const CulturalKnowledgeModal: React.FC<CulturalKnowledgeModalProps> = ({
  isOpen,
  onClose,
  garment,
  selectedGender = 'female',
}) => {
  if (!isOpen || !garment) return null;

  // Lấy URL hình ảnh an toàn
  const garmentImageUrl = getSafeImageUrl(garment);

  // Chuẩn hóa characteristics
  const characteristicsList = Array.isArray(garment.characteristics)
    ? garment.characteristics
    : typeof garment.characteristics === 'string'
    ? garment.characteristics.split('. ').filter(Boolean)
    : [];

  const significanceText =
    garment.significance ||
    garment.cultural_significance ||
    'Trang phục truyền thống phản ánh chiều sâu tư tưởng, nhân sinh quan và kỹ nghệ dệt may đỉnh cao của các thời kỳ lịch sử Việt Nam.';

  const originText = garment.origin || 'Xuất hiện trong lịch sử trang phục dân tộc Việt Nam';

  return (
    <div
      className="fixed inset-0 z-[100] bg-stone-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 overflow-y-auto animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-3xl max-w-2xl w-full border border-stone-200/80 shadow-2xl overflow-hidden my-auto max-h-[92vh] flex flex-col relative"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Nút đóng tối giản */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-20 w-8 h-8 rounded-full bg-white/90 hover:bg-white text-stone-500 hover:text-stone-900 border border-stone-200/60 shadow-xs flex items-center justify-center transition-colors cursor-pointer"
          title="Đóng"
        >
          <X className="w-4 h-4" />
        </button>

        {/* 1. HERO IMAGE (EDITORIAL MUSEUM) - Khung ảnh lớn, thoáng đãng */}
        <div className="relative w-full h-[260px] sm:h-[320px] bg-[#FAF8F5] flex items-center justify-center pt-10 sm:pt-12 pb-4 px-4 sm:px-6 border-b border-stone-100 shrink-0">
          <SafeImage
            src={garmentImageUrl}
            alt={garment.name}
            fallbackText={garment.name}
            expectedPath={garmentImageUrl}
            className="w-full h-full bg-transparent flex items-center justify-center"
            imgClassName="w-full h-full object-contain object-center scale-105 sm:scale-110 transition-transform duration-300"
          />

          <div className="absolute bottom-3 left-4 text-[10px] tracking-wider uppercase font-mono text-stone-500 bg-white/90 px-2.5 py-0.5 rounded-full border border-stone-200/60 shadow-2xs">
            Phom {selectedGender === 'female' ? 'Nữ' : 'Nam'}
          </div>
        </div>

        {/* 2. BORDERLESS CONTENT FLOW (DÒNG CHẢY BẢO TÀNG SỐ) */}
        <div className="p-6 sm:p-8 overflow-y-auto space-y-6 text-stone-900">
          {/* Header Tiêu đề chính */}
          <div className="border-b border-stone-100 pb-5">
            <span className="text-[10px] uppercase font-mono tracking-[0.25em] text-stone-400 font-semibold block mb-1.5">
              {garment.era || 'TƯ LIỆU KHẢO CỨU • DI SẢN VIỆT NAM'}
            </span>
            <h2 className="text-2xl sm:text-3xl font-serif font-bold text-stone-900 tracking-tight leading-tight">
              {garment.name}
            </h2>
            <p className="text-sm text-stone-600 mt-2.5 leading-relaxed font-sans">
              {originText}
            </p>
            {garment.description && (
              <p className="text-xs text-stone-500 italic mt-2 border-l-2 border-stone-200 pl-3">
                "{garment.description}"
              </p>
            )}
          </div>

          {/* Mục 1: Ý nghĩa văn hóa */}
          <div className="border-b border-stone-100 pb-5 space-y-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-stone-800 flex items-center gap-2">
              <Sparkles className="w-3.5 h-3.5 text-stone-400 stroke-[1.5]" />
              Ý nghĩa văn hóa & Tôn phong
            </h3>
            <p className="text-sm text-stone-600 leading-relaxed font-sans">
              {significanceText}
            </p>
          </div>

          {/* Mục 2: Đặc điểm cấu trúc */}
          <div className="border-b border-stone-100 pb-5 space-y-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-stone-800 flex items-center gap-2">
              <Layers className="w-3.5 h-3.5 text-stone-400 stroke-[1.5]" />
              Đặc điểm cấu trúc & Phom dáng
            </h3>

            {characteristicsList.length > 0 ? (
              <ul className="space-y-2 text-sm text-stone-600">
                {characteristicsList.map((charItem, index) => (
                  <li key={index} className="flex items-start gap-2.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-stone-400 mt-2 shrink-0" />
                    <span className="leading-relaxed">{charItem}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-stone-600 leading-relaxed font-sans">
                {typeof garment.characteristics === 'string'
                  ? garment.characteristics
                  : 'Cấu trúc áo gồm nhiều vạt khép hoặc giao nhau, thể hiện nhân sinh quan hòa hợp giữa trời đất và truyền thống dân tộc.'}
              </p>
            )}
          </div>

          {/* Mục 3: Bối cảnh sử dụng & Chất liệu */}
          {(garment.usage_context || garment.fabric) && (
            <div className="border-b border-stone-100 pb-5 space-y-4">
              {garment.usage_context && (
                <div className="space-y-1.5">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-stone-800 flex items-center gap-2">
                    <Compass className="w-3.5 h-3.5 text-stone-400 stroke-[1.5]" />
                    Bối cảnh nghi thức & Ứng dụng
                  </h3>
                  <p className="text-sm text-stone-600 leading-relaxed font-sans">
                    {garment.usage_context}
                  </p>
                </div>
              )}

              {garment.fabric && (
                <div className="space-y-1.5 pt-1">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-stone-800 flex items-center gap-2">
                    <Palette className="w-3.5 h-3.5 text-stone-400 stroke-[1.5]" />
                    Chất liệu vải dệt truyền thống
                  </h3>
                  <p className="text-sm text-stone-600 leading-relaxed font-sans">
                    {garment.fabric}
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Mục 4: Tư liệu tham khảo */}
          {garment.references && (
            <div className="pt-1 flex items-start gap-2 text-xs text-stone-400">
              <BookOpen className="w-3.5 h-3.5 text-stone-400 mt-0.5 shrink-0 stroke-[1.5]" />
              <div className="leading-relaxed">
                <span className="font-semibold text-stone-500">Tài liệu khảo cứu: </span>
                <span>
                  {Array.isArray(garment.references)
                    ? garment.references.join('; ')
                    : garment.references}
                </span>
              </div>
            </div>
          )}
        </div>

        {/* 3. FOOTER TỐI GIẢN */}
        <div className="px-6 py-4 border-t border-stone-100 flex items-center justify-between bg-stone-50/50 shrink-0">
          <span className="text-xs text-stone-400 font-mono tracking-wider uppercase">
            Tư liệu di sản
          </span>
        </div>
      </div>
    </div>
  );
};
