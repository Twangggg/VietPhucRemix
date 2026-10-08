import React from 'react';
import { X, Sparkles, Compass, Check, BookOpen, Layers, ShieldCheck } from 'lucide-react';
import { AccessoryItem, Gender } from '../types';
import { resolveItemByGender } from '../utils/helpers';
import { SafeImage } from './SafeImage';

interface AccessoryDetailModalProps {
  accessory: AccessoryItem | null;
  onClose: () => void;
  onSelectHeadwear?: (item: AccessoryItem) => void;
  onToggleJewelry?: (item: AccessoryItem) => void;
  isSelectedHeadwear?: boolean;
  isSelectedJewelry?: boolean;
  selectedGender?: Gender;
}

export const AccessoryDetailModal: React.FC<AccessoryDetailModalProps> = ({
  accessory,
  onClose,
  onSelectHeadwear,
  onToggleJewelry,
  isSelectedHeadwear,
  isSelectedJewelry,
  selectedGender = 'Female',
}) => {
  if (!accessory) return null;

  const resolved = resolveItemByGender(accessory, selectedGender);
  const isHeadwear = accessory.type === 'headwear';
  const isSelected = isHeadwear ? isSelectedHeadwear : isSelectedJewelry;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-6 bg-stone-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div
        className="bg-white rounded-3xl max-w-2xl w-full max-h-[92vh] overflow-hidden shadow-2xl border border-stone-200/80 flex flex-col my-auto relative"
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
        <div className="relative w-full h-[260px] sm:h-[320px] bg-[#FAF8F5] flex items-center justify-center pt-10 sm:pt-12 pb-4 px-4 sm:px-6 border-b border-stone-100 shrink-0">
          {resolved.resolvedImageUrl ? (
            <SafeImage
              src={resolved.resolvedImageUrl}
              alt={accessory.name}
              fallbackText={accessory.name}
              expectedPath={resolved.resolvedImageUrl}
              className="w-full h-full bg-transparent flex items-center justify-center"
              imgClassName="w-full h-full object-contain object-center scale-105 sm:scale-110 transition-transform duration-300"
            />
          ) : (
            <div className="flex flex-col items-center justify-center text-stone-300 gap-1.5">
              <Sparkles className="w-8 h-8 text-stone-300 stroke-[1.5]" />
              <span className="text-[10px] font-mono uppercase tracking-widest text-stone-400">
                {isHeadwear ? 'Mũ Nón Di Sản' : 'Trang Sức Cổ Điển'}
              </span>
            </div>
          )}

          {accessory.gender && (
            <div className="absolute bottom-3 left-4 text-[10px] tracking-wider uppercase font-mono text-stone-500 bg-white/90 px-2.5 py-0.5 rounded-full border border-stone-200/60 shadow-2xs">
              {accessory.gender}
            </div>
          )}
        </div>

        {/* 2. BORDERLESS CONTENT FLOW (DÒNG CHẢY BẢO TÀNG SỐ) */}
        <div className="p-6 sm:p-8 overflow-y-auto space-y-6 text-stone-900">
          {/* Header Tiêu đề chính */}
          <div className="border-b border-stone-100 pb-5">
            <span className="text-[10px] uppercase font-mono tracking-[0.25em] text-stone-400 font-semibold block mb-1.5">
              {isHeadwear ? 'MŨ NÓN DI SẢN • VIỆT NAM' : 'TRANG SỨC & PHỤ KIỆN CỔ TRUYỀN'}
            </span>
            <h2 className="text-2xl sm:text-3xl font-serif font-bold text-stone-900 tracking-tight leading-tight">
              {accessory.name}
            </h2>
            {accessory.origin && (
              <p className="text-sm text-stone-600 mt-2.5 leading-relaxed font-sans">
                {accessory.origin}
              </p>
            )}
          </div>

          {/* Mục 1: Ý nghĩa văn hóa */}
          {accessory.significance && (
            <div className="border-b border-stone-100 pb-5 space-y-2">
              <h3 className="text-xs font-bold uppercase tracking-wider text-stone-800 flex items-center gap-2">
                <Sparkles className="w-3.5 h-3.5 text-stone-400 stroke-[1.5]" />
                Ý nghĩa văn hóa & Tôn phong
              </h3>
              <p className="text-sm text-stone-600 leading-relaxed font-sans">
                {accessory.significance}
              </p>
            </div>
          )}

          {/* Mục 2: Đặc điểm nhận diện */}
          {accessory.characteristics && (
            <div className="border-b border-stone-100 pb-5 space-y-2">
              <h3 className="text-xs font-bold uppercase tracking-wider text-stone-800 flex items-center gap-2">
                <Layers className="w-3.5 h-3.5 text-stone-400 stroke-[1.5]" />
                Đặc điểm nhận diện & Kỹ nghệ
              </h3>
              <p className="text-sm text-stone-600 leading-relaxed font-sans">
                {Array.isArray(accessory.characteristics)
                  ? accessory.characteristics.join(' • ')
                  : accessory.characteristics}
              </p>
            </div>
          )}

          {/* Mục 3: Bối cảnh sử dụng */}
          {accessory.usage_context && (
            <div className="border-b border-stone-100 pb-5 space-y-2">
              <h3 className="text-xs font-bold uppercase tracking-wider text-stone-800 flex items-center gap-2">
                <Compass className="w-3.5 h-3.5 text-stone-400 stroke-[1.5]" />
                Bối cảnh sử dụng
              </h3>
              <p className="text-sm text-stone-600 leading-relaxed font-sans">
                {accessory.usage_context}
              </p>
            </div>
          )}

          {/* Mục 4: Ghi chú lưu ý */}
          {accessory.notes && (
            <div className="border-b border-stone-100 pb-5 space-y-1.5">
              <h3 className="text-xs font-bold uppercase tracking-wider text-stone-800 flex items-center gap-2">
                <ShieldCheck className="w-3.5 h-3.5 text-stone-400 stroke-[1.5]" />
                Lưu ý quy chuẩn & Kiêng kỵ
              </h3>
              <p className="text-sm text-stone-600 leading-relaxed font-sans">
                {accessory.notes}
              </p>
            </div>
          )}

          {/* Mục 5: Màu sắc */}
          {accessory.colors && accessory.colors.length > 0 && (
            <div className="space-y-2">
              <h3 className="text-xs font-bold uppercase tracking-wider text-stone-800">
                Sắc thái & Màu sắc
              </h3>
              <div className="flex flex-wrap gap-2">
                {accessory.colors.map((c, i) => (
                  <span
                    key={i}
                    className="px-2.5 py-1 text-xs text-stone-600 bg-stone-100 rounded-md font-sans"
                  >
                    {c}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* 3. THANH CÔNG CỤ CHÂN TRANG FOOTER */}
        <div className="px-6 py-4 border-t border-stone-100 flex items-center justify-between bg-stone-50/50 shrink-0">
          <span className="text-xs text-stone-400 font-mono tracking-wider uppercase">
            Phụ kiện truyền thống
          </span>
          <div className="flex items-center gap-2.5">
            {isHeadwear && onSelectHeadwear && (
              <button
                type="button"
                onClick={() => {
                  onSelectHeadwear(accessory);
                  onClose();
                }}
                className={`px-8 py-2.5 rounded-full text-xs font-bold shadow-xs transition-all cursor-pointer active:scale-95 ${
                  isSelected
                    ? 'bg-stone-900 text-white hover:bg-stone-800'
                    : 'bg-red-700 hover:bg-red-800 text-white'
                }`}
              >
                {isSelected ? 'Bỏ chọn mũ' : 'Chọn mũ'}
              </button>
            )}

            {!isHeadwear && onToggleJewelry && (
              <button
                type="button"
                onClick={() => {
                  onToggleJewelry(accessory);
                }}
                className={`px-8 py-2.5 rounded-full text-xs font-bold shadow-xs transition-all cursor-pointer active:scale-95 ${
                  isSelected
                    ? 'bg-stone-900 text-white hover:bg-stone-800'
                    : 'bg-red-700 hover:bg-red-800 text-white'
                }`}
              >
                {isSelected ? 'Bỏ chọn' : 'Chọn phối'}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
