import React from 'react';
import {
  X,
  BookOpen,
  Sparkles,
  Compass,
  ShieldCheck,
  Palette,
  Layers,
  Info
} from 'lucide-react';
import { Garment, Gender } from '../types';
import { SafeImage } from './SafeImage';
import { getSafeImageUrl, resolveImageUrl } from '../utils/helpers';

export interface GarmentDetailModalProps {
  item?: Garment | null;
  garment?: Garment | null; // Hỗ trợ tương thích ngược
  onClose: () => void;
  onSelectForStudio?: (id: string) => void;
  selectedGender?: Gender;
}

export const GarmentDetailModal: React.FC<GarmentDetailModalProps> = ({
  item,
  garment,
  onClose,
  onSelectForStudio,
  selectedGender = 'Female'
}) => {
  const currentGarment = item || garment;

  if (!currentGarment) {
    return null;
  }

  const safeBaseUrl = getSafeImageUrl(currentGarment);
  const resolvedImageUrl = resolveImageUrl(
    safeBaseUrl,
    currentGarment.has_gender_variants,
    selectedGender
  );

  // Chuẩn hóa hiển thị màu sắc
  const renderColors = () => {
    if (!currentGarment.colors) return null;

    if (Array.isArray(currentGarment.colors)) {
      return (
        <div className="flex flex-wrap gap-2 pt-1">
          {currentGarment.colors.map((c, idx) => (
            <span
              key={idx}
              className="px-2.5 py-1 text-xs text-stone-600 bg-stone-100 rounded-md font-sans"
            >
              {c}
            </span>
          ))}
        </div>
      );
    }

    return (
      <p className="text-sm text-stone-600 leading-relaxed font-sans">
        {currentGarment.colors}
      </p>
    );
  };

  // Chuẩn hóa hiển thị đặc trưng
  const renderCharacteristics = () => {
    if (!currentGarment.characteristics) return null;

    if (Array.isArray(currentGarment.characteristics)) {
      return (
        <ul className="space-y-2 text-sm text-stone-600">
          {currentGarment.characteristics.map((point, idx) => (
            <li key={idx} className="flex items-start gap-2.5">
              <span className="w-1.5 h-1.5 rounded-full bg-stone-400 mt-2 shrink-0" />
              <span className="leading-relaxed">{point}</span>
            </li>
          ))}
        </ul>
      );
    }

    return (
      <p className="text-sm text-stone-600 leading-relaxed font-sans">
        {currentGarment.characteristics}
      </p>
    );
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
        {/* Nút đóng tối giản thanh lịch */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-20 w-8 h-8 rounded-full bg-white/90 hover:bg-white text-stone-500 hover:text-stone-900 flex items-center justify-center transition-colors border border-stone-200/60 shadow-xs cursor-pointer"
          aria-label="Đóng"
        >
          <X className="w-4 h-4" />
        </button>

        {/* 1. HERO IMAGE (EDITORIAL MUSEUM) - Khung ảnh lớn, thoáng đãng, tôn trọn vẹn chi tiết */}
        <div className="relative w-full h-[260px] sm:h-[320px] bg-[#FAF8F5] flex items-center justify-center pt-10 sm:pt-12 pb-4 px-4 sm:px-6 border-b border-stone-100 shrink-0">
          <SafeImage
            src={resolvedImageUrl}
            alt={currentGarment.name}
            fallbackText={`${currentGarment.name} (${selectedGender === 'Male' ? 'Nam' : 'Nữ'})`}
            expectedPath={resolvedImageUrl}
            className="w-full h-full bg-transparent flex items-center justify-center"
            imgClassName="w-full h-full object-contain object-center scale-105 sm:scale-110 transition-transform duration-300"
          />

          {/* Tag phom dáng nhẹ nhàng nếu có biến thể */}
          {currentGarment.has_gender_variants && (
            <div className="absolute bottom-3 left-4 text-[10px] tracking-wider uppercase font-mono text-stone-500 bg-white/90 px-2.5 py-0.5 rounded-full border border-stone-200/60 shadow-2xs">
              Phom {selectedGender === 'Male' ? 'Nam' : 'Nữ'}
            </div>
          )}
        </div>

        {/* 2. BORDERLESS CONTENT FLOW (DÒNG CHẢY BẢO TÀNG SỐ - KHÔNG ĐÓNG HỘP) */}
        <div className="p-6 sm:p-8 overflow-y-auto space-y-6 text-stone-900">
          {/* Header Tiêu đề chính */}
          <div className="border-b border-stone-100 pb-5">
            <span className="text-[10px] uppercase font-mono tracking-[0.25em] text-stone-400 font-semibold block mb-1.5">
              {currentGarment.era || 'CỔ PHỤC DI SẢN • VIỆT NAM'}
            </span>
            <h2 className="text-2xl sm:text-3xl font-serif font-bold text-stone-900 tracking-tight leading-tight">
              {currentGarment.name}
            </h2>
            {currentGarment.origin && (
              <p className="text-sm text-stone-600 mt-2.5 leading-relaxed font-sans">
                {currentGarment.origin}
              </p>
            )}
          </div>

          {/* Mục 1: Đặc trưng cấu tạo & Phom dáng */}
          {currentGarment.characteristics && (
            <div className="border-b border-stone-100 pb-5 space-y-2">
              <h3 className="text-xs font-bold uppercase tracking-wider text-stone-800 flex items-center gap-2">
                <Layers className="w-3.5 h-3.5 text-stone-400 stroke-[1.5]" />
                Đặc trưng cấu tạo & Phom dáng
              </h3>
              {renderCharacteristics()}
            </div>
          )}

          {/* Mục 2: Ý nghĩa văn hóa & Bối cảnh sử dụng */}
          {(currentGarment.significance || currentGarment.usage_context) && (
            <div className="border-b border-stone-100 pb-5 space-y-4">
              {currentGarment.significance && (
                <div className="space-y-1.5">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-stone-800 flex items-center gap-2">
                    <Sparkles className="w-3.5 h-3.5 text-stone-400 stroke-[1.5]" />
                    Ý nghĩa văn hóa & Triết lý
                  </h3>
                  <p className="text-sm text-stone-600 leading-relaxed font-sans">
                    {currentGarment.significance}
                  </p>
                </div>
              )}

              {currentGarment.usage_context && (
                <div className="space-y-1.5 pt-1">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-stone-800 flex items-center gap-2">
                    <Compass className="w-3.5 h-3.5 text-stone-400 stroke-[1.5]" />
                    Bối cảnh sử dụng
                  </h3>
                  <p className="text-sm text-stone-600 leading-relaxed font-sans">
                    {currentGarment.usage_context}
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Mục 3: Màu sắc truyền thống */}
          {currentGarment.colors && (
            <div className="border-b border-stone-100 pb-5 space-y-2">
              <h3 className="text-xs font-bold uppercase tracking-wider text-stone-800 flex items-center gap-2">
                <Palette className="w-3.5 h-3.5 text-stone-400 stroke-[1.5]" />
                Màu sắc truyền thống & Sắc thái
              </h3>
              {renderColors()}
            </div>
          )}

          {/* Mục 4: Quy chuẩn & Lưu ý văn hóa */}
          {currentGarment.notes && (
            <div className="border-b border-stone-100 pb-5 space-y-1.5">
              <h3 className="text-xs font-bold uppercase tracking-wider text-stone-800 flex items-center gap-2">
                <ShieldCheck className="w-3.5 h-3.5 text-stone-400 stroke-[1.5]" />
                Lưu ý quy chuẩn & Kiêng kỵ
              </h3>
              <p className="text-sm text-stone-600 leading-relaxed font-sans">
                {currentGarment.notes}
              </p>
            </div>
          )}

          {/* Mục 5: Tài liệu tham khảo */}
          {currentGarment.references && (
            <div className="pt-1 flex items-start gap-2 text-xs text-stone-400">
              <BookOpen className="w-3.5 h-3.5 text-stone-400 mt-0.5 shrink-0 stroke-[1.5]" />
              <div className="leading-relaxed">
                <span className="font-semibold text-stone-500">Tài liệu khảo cứu: </span>
                <span>
                  {Array.isArray(currentGarment.references)
                    ? currentGarment.references.join('; ')
                    : currentGarment.references}
                </span>
              </div>
            </div>
          )}
        </div>

        {/* 3. THANH CÔNG CỤ CHÂN TRANG FOOTER TỐI GIẢN */}
        <div className="px-6 py-4 border-t border-stone-100 flex items-center justify-between bg-stone-50/50 shrink-0">
          <span className="text-xs text-stone-400 font-mono tracking-wider uppercase">
            Tư liệu di sản
          </span>
          <div className="flex items-center gap-2.5">
            {onSelectForStudio && (
              <button
                type="button"
                onClick={() => {
                  onSelectForStudio(currentGarment.id);
                  onClose();
                }}
                className="px-8 py-2.5 rounded-full bg-red-700 hover:bg-red-800 text-white text-xs font-bold transition-all shadow-xs cursor-pointer active:scale-95"
              >
                Chọn Cổ phục
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
