import React, { useState } from 'react';
import {
  BookOpen,
  CheckCircle2,
  AlertTriangle,
  Sparkles,
  ArrowLeft,
  ChevronUp,
  ChevronDown
} from 'lucide-react';
import { Garment, CasualItem, AccessoryItem, ContextItem, ValidationResult } from '../types';
import { SafeImage } from './SafeImage';
import { getSafeImageUrl, resolveItemByGender } from '../utils/helpers';
import { CulturalKnowledgeModal } from './CulturalKnowledgeModal';
import { GarmentDetailModal } from './GarmentDetailModal';
import { CasualDetailModal } from './CasualDetailModal';
import { AccessoryDetailModal } from './AccessoryDetailModal';

interface OutfitResultViewProps {
  selectedGender: 'male' | 'female';
  contextItem?: ContextItem | null;
  garmentItem: Garment;
  innerItem?: CasualItem | null;
  bottomItem?: CasualItem | null;
  shoesItem?: CasualItem | null;
  headwearItem?: AccessoryItem | null;
  jewelryItems?: AccessoryItem[];
  validationResults: ValidationResult[];
  onBackToStudio: () => void;
  onResetOutfit?: () => void;
}

export const OutfitResultView: React.FC<OutfitResultViewProps> = ({
  selectedGender,
  contextItem,
  garmentItem,
  innerItem,
  bottomItem,
  shoesItem,
  headwearItem,
  jewelryItems = [],
  validationResults,
  onBackToStudio,
}) => {
  const [showCulturalModal, setShowCulturalModal] = useState<boolean>(false);
  const [isActionsExpanded, setIsActionsExpanded] = useState<boolean>(false);

  // State mở Modal chi tiết từng món đồ khi người dùng click vào thẻ
  const [detailGarment, setDetailGarment] = useState<Garment | null>(null);
  const [detailCasual, setDetailCasual] = useState<CasualItem | null>(null);
  const [detailAccessory, setDetailAccessory] = useState<AccessoryItem | null>(null);

  // Phân giải các món đồ theo giới tính để lấy ảnh chính xác
  const resolvedGarment = resolveItemByGender(garmentItem, selectedGender);
  const resolvedInner = innerItem ? resolveItemByGender(innerItem, selectedGender) : null;
  const resolvedBottom = bottomItem ? resolveItemByGender(bottomItem, selectedGender) : null;
  const resolvedShoes = shoesItem ? resolveItemByGender(shoesItem, selectedGender) : null;
  const resolvedHeadwear = headwearItem ? resolveItemByGender(headwearItem, selectedGender) : null;

  // Lọc các thông báo cảnh báo mức WARN
  const warnings = validationResults.filter((r) => r.severity === 'WARN');

  const garmentImageUrl = getSafeImageUrl(resolvedGarment.resolvedImageUrl || resolvedGarment);

  // Danh sách các món đồ phụ phối kèm (Tự động dàn trang linh hoạt, không bao giờ bị tràn lề)
  const companionItems = [
    resolvedHeadwear && headwearItem && {
      id: headwearItem.id,
      name: resolvedHeadwear.name,
      imageUrl: getSafeImageUrl(resolvedHeadwear.resolvedImageUrl || resolvedHeadwear),
      rotation: '-rotate-3',
      sizeClass: 'w-20 sm:w-28 h-20 sm:h-28',
      onClick: () => setDetailAccessory(headwearItem)
    },
    resolvedInner && innerItem && {
      id: innerItem.id,
      name: resolvedInner.name,
      imageUrl: getSafeImageUrl(resolvedInner.resolvedImageUrl || resolvedInner),
      rotation: 'rotate-2',
      sizeClass: 'w-22 sm:w-30 h-22 sm:h-30',
      onClick: () => setDetailCasual(innerItem)
    },
    resolvedBottom && bottomItem && {
      id: bottomItem.id,
      name: resolvedBottom.name,
      imageUrl: getSafeImageUrl(resolvedBottom.resolvedImageUrl || resolvedBottom),
      rotation: '-rotate-2',
      sizeClass: 'w-22 sm:w-32 h-28 sm:h-36',
      onClick: () => setDetailCasual(bottomItem)
    },
    resolvedShoes && shoesItem && {
      id: shoesItem.id,
      name: resolvedShoes.name,
      imageUrl: getSafeImageUrl(resolvedShoes.resolvedImageUrl || resolvedShoes),
      rotation: 'rotate-3',
      sizeClass: 'w-20 sm:w-28 h-20 sm:h-28',
      onClick: () => setDetailCasual(shoesItem)
    },
    ...jewelryItems.map((j, idx) => {
      const resolvedJ = resolveItemByGender(j, selectedGender);
      return {
        id: j.id,
        name: resolvedJ.name,
        imageUrl: getSafeImageUrl(resolvedJ.resolvedImageUrl || resolvedJ),
        rotation: idx % 2 === 0 ? '-rotate-6' : 'rotate-6',
        sizeClass: 'w-16 sm:w-22 h-16 sm:h-22',
        onClick: () => setDetailAccessory(j)
      };
    })
  ].filter(Boolean) as Array<{
    id: string;
    name: string;
    imageUrl: string;
    rotation: string;
    sizeClass: string;
    onClick: () => void;
  }>;

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in-50 duration-300 pb-36 px-2 sm:px-4">
      {/* ==========================================
          1. HEADER TỐI GIẢN (EDITORIAL LOOKBOOK HEADER)
         ========================================== */}
      <div className="text-center space-y-2 pt-1">
        {warnings.length > 0 ? (
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100/90 text-amber-900 text-xs font-sans font-medium border border-amber-200">
            <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
            <span>Có lưu ý quy chuẩn / phom dáng</span>
            {contextItem && (
              <>
                <span className="text-amber-300">•</span>
                <span className="text-amber-800">{contextItem.name}</span>
              </>
            )}
          </div>
        ) : (
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-stone-100/90 text-stone-700 text-xs font-sans font-medium">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            <span>Phù hợp quy chuẩn kiểm tra</span>
            {contextItem && (
              <>
                <span className="text-stone-300">•</span>
                <span className="text-stone-600">{contextItem.name}</span>
              </>
            )}
          </div>
        )}

        <h1 className="text-3xl sm:text-4xl font-serif font-bold text-stone-900 tracking-tight">
          Bảng Phối Đồ
        </h1>
        <p className="text-[10px] font-mono tracking-[0.2em] uppercase text-stone-400">
          EDITORIAL COLLAGE • CHẠM ĐỂ XEM CHI TIẾT TỪNG MÓN
        </p>
      </div>

      {/* CẢNH BÁO NẾU CÓ */}
      {warnings.length > 0 && (
        <div className="space-y-2 max-w-2xl mx-auto">
          {warnings.map((warn, index) => (
            <div
              key={index}
              className="p-3.5 rounded-2xl bg-amber-50/90 border border-amber-200/80 text-amber-950 flex items-start gap-2.5 text-xs font-sans"
            >
              <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <p className="leading-relaxed font-medium">{warn.message}</p>
            </div>
          ))}
        </div>
      )}

      {/* ==========================================
          2. FASHION MOODBOARD CANVAS (COLLAGE / FLAT-LAY NGHỆ THUẬT)
         ========================================== */}
      <div className="relative w-full rounded-3xl p-5 sm:p-8 md:p-10 bg-[#FAF7F2] border border-stone-200/80 shadow-xs overflow-hidden">
        {/* Watermark di sản */}
        <div className="absolute top-4 right-6 pointer-events-none select-none opacity-15">
          <span className="font-serif text-2xl sm:text-3xl font-bold tracking-widest text-stone-400">
            VIETPHUC
          </span>
        </div>

        {/* Khung Moodboard chính */}
        <div className="flex flex-col items-center justify-center relative z-10 space-y-6 sm:space-y-8">
          
          {/* VỊ TRÍ TRUNG TÂM: CỔ PHỤC DI SẢN (KEY PIECE) */}
          <div
            onClick={() => setDetailGarment(garmentItem)}
            className="group cursor-pointer flex flex-col items-center select-none w-full max-w-sm sm:max-w-md pt-2"
            title="Xem chi tiết Cổ phục di sản"
          >
            {/* Ảnh Cổ phục với khoảng cách trên thoáng đãng, không bị cắt cổ áo */}
            <div className="w-full aspect-[3/4] sm:aspect-[4/5] relative max-h-[380px] sm:max-h-[440px] flex items-center justify-center p-2">
              <SafeImage
                src={garmentImageUrl}
                alt={resolvedGarment.name}
                fallbackText={resolvedGarment.name}
                className="bg-transparent w-full h-full flex items-center justify-center"
                imgClassName="mix-blend-multiply object-contain object-center drop-shadow-md group-hover:scale-102 transition-transform duration-500"
              />
            </div>

            {/* Thông tin Cổ phục sang trọng */}
            <div className="text-center space-y-1.5 mt-2 sm:mt-3 px-4 max-w-lg">
              <span className="text-[10px] font-mono uppercase tracking-[0.25em] text-red-800 font-bold block">
                CỔ PHỤC DI SẢN
              </span>
              <h2 className="text-2xl sm:text-3xl font-serif font-bold text-stone-900 tracking-tight group-hover:text-red-900 transition-colors">
                {resolvedGarment.name}
              </h2>
              {resolvedGarment.origin ? (
                <p className="text-xs text-stone-500 font-sans leading-relaxed">
                  {resolvedGarment.origin}
                </p>
              ) : resolvedGarment.description ? (
                <p className="text-xs text-stone-500 font-sans leading-relaxed">
                  {resolvedGarment.description}
                </p>
              ) : null}
            </div>
          </div>

          {/* DÀN TRANG CÁC MÓN PHỐI KÈM (FLEX WRAP TỰ CO GIÃN - KHÔNG TRÀN LỀ) */}
          {companionItems.length > 0 && (
            <div className="w-full pt-4 sm:pt-6 border-t border-stone-200/50">
              <div className="text-center mb-3">
                <span className="text-[9px] font-mono uppercase tracking-[0.2em] text-stone-400 font-semibold">
                  TRANG PHỤC & PHỤ KIỆN PHỐI KÈM
                </span>
              </div>

              {/* Lưới co giãn đều, luôn nằm gọn trong khung màn hình */}
              <div className="flex flex-wrap items-end justify-center gap-3 sm:gap-6 px-1">
                {companionItems.map((c) => (
                  <div
                    key={c.id}
                    onClick={c.onClick}
                    className={`group cursor-pointer ${c.rotation} hover:rotate-0 hover:scale-105 transition-all duration-300 flex flex-col items-center select-none p-1`}
                    title={`Xem chi tiết ${c.name}`}
                  >
                    <div className={`${c.sizeClass} relative flex items-center justify-center`}>
                      <SafeImage
                        src={c.imageUrl}
                        alt={c.name}
                        fallbackText={c.name}
                        className="bg-transparent w-full h-full flex items-center justify-center"
                        imgClassName="mix-blend-multiply object-contain object-center drop-shadow-sm"
                      />
                    </div>
                    <span className="text-[9px] sm:text-[10px] font-mono uppercase tracking-wider text-stone-500 mt-1 max-w-[90px] sm:max-w-[120px] truncate text-center group-hover:text-red-800 transition-colors">
                      {c.name}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>
      </div>

      {/* ==========================================
          3. NÚT CALL-TO-ACTION DÍNH Ở ĐÁY (THU MỞ LINH HOẠT, NỔI TRÊN NAVBAR)
         ========================================== */}
      <div className="fixed bottom-20 inset-x-4 max-w-md mx-auto z-40 flex flex-col items-center pointer-events-none">
        {isActionsExpanded ? (
          /* TRẠNG THÁI MỞ RỘNG */
          <div className="w-full pointer-events-auto p-3 sm:p-3.5 bg-white/95 backdrop-blur-md border border-stone-200/90 rounded-2xl shadow-2xl flex flex-col gap-2.5 transition-all duration-300 animate-in slide-in-from-bottom-3">
            <div className="flex items-center justify-between pb-1.5 border-b border-stone-100">
              <span className="text-[10px] font-mono uppercase tracking-wider text-stone-400 font-semibold">
                TÙY CHỌN BẢN PHỐI
              </span>
              <button
                type="button"
                onClick={() => setIsActionsExpanded(false)}
                className="p-1 rounded-full text-stone-400 hover:text-stone-700 hover:bg-stone-100 transition-colors cursor-pointer"
                title="Thu nhỏ thanh thao tác"
              >
                <ChevronDown className="w-4 h-4" />
              </button>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-between gap-2">
              <button
                type="button"
                onClick={onBackToStudio}
                className="w-full sm:w-auto px-4 py-2.5 rounded-xl border border-stone-200 hover:border-stone-300 bg-stone-50 hover:bg-stone-100 text-stone-800 font-semibold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer active:scale-95"
              >
                <ArrowLeft className="w-3.5 h-3.5 text-stone-600" />
                <span>Quay lại phối đồ</span>
              </button>

              <button
                type="button"
                onClick={() => setShowCulturalModal(true)}
                className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-red-700 hover:bg-red-800 text-white font-semibold text-xs flex items-center justify-center gap-1.5 shadow-xs transition-all active:scale-95 cursor-pointer"
              >
                <BookOpen className="w-3.5 h-3.5" />
                <span>Câu chuyện di sản</span>
              </button>
            </div>
          </div>
        ) : (
          /* TRẠNG THÁI THU GỌN */
          <button
            type="button"
            onClick={() => setIsActionsExpanded(true)}
            className="pointer-events-auto px-4 py-2 rounded-full backdrop-blur-md bg-stone-900/95 border border-stone-800 text-white shadow-lg text-xs font-medium flex items-center gap-2 transition-all duration-200 hover:scale-105 active:scale-95 cursor-pointer select-none"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            <span>Tùy chọn bản phối</span>
            <ChevronUp className="w-3.5 h-3.5 opacity-60" />
          </button>
        )}
      </div>

      {/* ==========================================
          MODAL CHI TIẾT TỪNG MÓN ĐỒ KHI CLICK VÀO ITEM TRÊN MOODBOARD
         ========================================== */}
      {detailGarment && (
        <GarmentDetailModal
          garment={detailGarment}
          onClose={() => setDetailGarment(null)}
          selectedGender={selectedGender === 'female' ? 'Female' : 'Male'}
        />
      )}

      {detailCasual && (
        <CasualDetailModal
          item={detailCasual}
          onClose={() => setDetailCasual(null)}
          selectedGender={selectedGender === 'female' ? 'Female' : 'Male'}
        />
      )}

      {detailAccessory && (
        <AccessoryDetailModal
          accessory={detailAccessory}
          onClose={() => setDetailAccessory(null)}
          selectedGender={selectedGender === 'female' ? 'Female' : 'Male'}
        />
      )}

      {/* Modal Câu Chuyện Văn Hóa */}
      <CulturalKnowledgeModal
        isOpen={showCulturalModal}
        onClose={() => setShowCulturalModal(false)}
        garment={garmentItem}
        selectedGender={selectedGender}
      />
    </div>
  );
};

export default OutfitResultView;
