import React from 'react';
import { X, BookOpen, Sparkles, Compass, ShieldCheck } from 'lucide-react';
import { Garment, Gender } from '../types';
import { SafeImage } from './SafeImage';
import { resolveImageUrl } from '../utils/helpers';

interface GarmentDetailModalProps {
  garment: Garment;
  onClose: () => void;
  onSelectForStudio?: (id: string) => void;
  selectedGender?: Gender;
}

export const GarmentDetailModal: React.FC<GarmentDetailModalProps> = ({
  garment,
  onClose,
  onSelectForStudio,
  selectedGender = 'Female'
}) => {
  const resolvedImageUrl = resolveImageUrl(
    garment.image_url,
    garment.has_gender_variants,
    selectedGender
  );

  return (
    <div className="fixed inset-0 z-50 bg-stone-900/40 backdrop-blur-sm flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-3xl w-full border border-stone-200/80 shadow-2xl overflow-hidden flex flex-col my-auto max-h-[90vh]">
        {/* Header bar */}
        <div className="px-6 py-4 border-b border-stone-100 flex items-center justify-between bg-stone-50/50">
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono font-bold text-red-700 bg-red-50 px-2 py-0.5 rounded border border-red-200/60">
              {garment.id}
            </span>
            <span className="text-xs text-gray-500 font-sans">Hồ Sơ Cổ Phục Di Sản</span>
            {garment.has_gender_variants && (
              <span className="text-[10px] font-sans text-red-700 bg-red-100 px-2 py-0.5 rounded font-semibold">
                Phom {selectedGender === 'Male' ? 'Nam' : 'Nữ'}
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

        {/* Body */}
        <div className="p-6 sm:p-8 overflow-y-auto space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
            {/* Left: Image (40%) */}
            <div className="md:col-span-5 rounded-2xl overflow-hidden aspect-[3/4] bg-stone-100 shadow-sm border border-stone-200/60">
              <SafeImage
                src={resolvedImageUrl}
                alt={garment.name}
                fallbackText={`${garment.name} (${selectedGender === 'Male' ? 'Nam' : 'Nữ'})`}
                expectedPath={resolvedImageUrl}
                className="w-full h-full"
              />
            </div>

            {/* Right: Editorial Information (60%) */}
            <div className="md:col-span-7 space-y-5">
              <div>
                <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 font-['Playfair_Display',serif] leading-tight">
                  {garment.name}
                </h2>
                {garment.origin && (
                  <p className="text-xs text-red-800 font-medium mt-1 leading-relaxed">
                    {garment.origin}
                  </p>
                )}
              </div>

              {/* Characteristics / Description */}
              {garment.characteristics && (
                <div className="space-y-1.5">
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-gray-400">
                    Đặc trưng cấu tạo
                  </h4>
                  <p className="text-sm text-gray-700 leading-relaxed bg-stone-50 p-4 rounded-xl border border-stone-200/60 font-sans">
                    {Array.isArray(garment.characteristics)
                      ? garment.characteristics.join(' • ')
                      : garment.characteristics}
                  </p>
                </div>
              )}

              {/* Usage Context & Significance */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                {garment.usage_context && (
                  <div className="p-3.5 rounded-xl bg-stone-50 border border-stone-200/60 space-y-1">
                    <span className="font-semibold text-gray-800 block flex items-center gap-1.5">
                      <Compass className="w-3.5 h-3.5 text-red-700" /> Bối cảnh sử dụng
                    </span>
                    <p className="text-gray-600 leading-relaxed">{garment.usage_context}</p>
                  </div>
                )}

                {garment.significance && (
                  <div className="p-3.5 rounded-xl bg-stone-50 border border-stone-200/60 space-y-1">
                    <span className="font-semibold text-gray-800 block flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-amber-600" /> Ý nghĩa văn hóa
                    </span>
                    <p className="text-gray-600 leading-relaxed">{garment.significance}</p>
                  </div>
                )}
              </div>

              {/* Notes / Cultural Taboos */}
              {garment.notes && (
                <div className="p-3.5 rounded-xl bg-red-50/60 border border-red-200/60 text-xs text-red-900 space-y-1">
                  <span className="font-semibold block flex items-center gap-1.5">
                    <ShieldCheck className="w-3.5 h-3.5 text-red-700" /> Lưu ý quy chuẩn trang phục
                  </span>
                  <p className="text-red-800 leading-relaxed">{garment.notes}</p>
                </div>
              )}

              {/* References */}
              {garment.references && (
                <p className="text-[11px] text-gray-400 font-sans italic">
                  Tài liệu tham khảo: {garment.references}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Footer actions */}
        <div className="px-6 py-4 border-t border-stone-100 flex items-center justify-between bg-stone-50/30">
          <span className="text-xs text-gray-400 font-mono">Tài nguyên: {garment.image_url}</span>
          <div className="flex gap-2">
            {onSelectForStudio && (
              <button
                onClick={() => {
                  onSelectForStudio(garment.id);
                  onClose();
                }}
                className="px-4 py-2 rounded-xl bg-red-700 hover:bg-red-800 text-white text-xs font-semibold transition-all shadow-sm"
              >
                Đưa vào phòng phối đồ
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
