import React, { useState, useEffect, useRef } from 'react';
import {
  BookOpen,
  CheckCircle2,
  AlertTriangle,
  Sparkles,
  ArrowLeft,
  ChevronUp,
  ChevronDown,
  Palette,
  Bookmark,
  BookmarkCheck,
  Share2,
  Download,
  Loader2,
  Check,
  Info
} from 'lucide-react';
import { toPng } from 'html-to-image';
import { Garment, CasualItem, AccessoryItem, ContextItem, ValidationResult, Gender } from '../types';
import { SafeImage } from './SafeImage';
import { TintedImage } from './TintedImage';
import { getSafeImageUrl, resolveItemByGender } from '../utils/helpers';
import { CulturalKnowledgeModal } from './CulturalKnowledgeModal';
import { GarmentDetailModal } from './GarmentDetailModal';
import { CasualDetailModal } from './CasualDetailModal';
import { AccessoryDetailModal } from './AccessoryDetailModal';
import { ColorCustomizerModal } from './ColorCustomizerModal';
import { SaveLookbookModal } from './SaveLookbookModal';
import { saveLookbook, encodeOutfitToShareUrl } from '../utils/lookbookStore';

export interface SaveNotice {
  type: 'success' | 'warn' | 'error' | 'info';
  message: string;
}

interface ItemColorSetting {
  hex: string | null;
  intensity: number;
}

interface OutfitResultViewProps {
  selectedGender: 'male' | 'female' | 'Male' | 'Female' | Gender;
  contextItem?: ContextItem | null;
  garmentItem: Garment;
  additionalGarments?: Garment[];
  innerItem?: CasualItem | null;
  bottomItem?: CasualItem | null;
  shoesItem?: CasualItem | null;
  headwearItem?: AccessoryItem | null;
  jewelryItems?: AccessoryItem[];
  validationResults: ValidationResult[];
  onBackToStudio: () => void;
  onResetOutfit?: () => void;
  onSaveOutfit?: (colors: Record<string, ItemColorSetting>, name?: string) => void;
  initialItemColors?: Record<string, ItemColorSetting>;
  onColorsChange?: (colors: Record<string, ItemColorSetting>) => void;
  isSaved?: boolean;
  saveNotice?: SaveNotice | null;
  isFromCollection?: boolean;
  backButtonText?: string;
  isOutdatedOrBlocked?: boolean;
}

export const OutfitResultView: React.FC<OutfitResultViewProps> = ({
  selectedGender,
  contextItem,
  garmentItem,
  additionalGarments = [],
  innerItem,
  bottomItem,
  shoesItem,
  headwearItem,
  jewelryItems = [],
  validationResults,
  onBackToStudio,
  onSaveOutfit,
  initialItemColors,
  onColorsChange,
  isSaved = false,
  saveNotice = null,
  isFromCollection = false,
  backButtonText,
  isOutdatedOrBlocked = false
}) => {
  const [showCulturalModal, setShowCulturalModal] = useState<boolean>(false);
  const [isActionsExpanded, setIsActionsExpanded] = useState<boolean>(true);

  // State mở Modal chi tiết từng món đồ khi người dùng click vào thẻ
  const [detailGarment, setDetailGarment] = useState<Garment | null>(null);
  const [detailCasual, setDetailCasual] = useState<CasualItem | null>(null);
  const [detailAccessory, setDetailAccessory] = useState<AccessoryItem | null>(null);

  // State quản lý màu sắc tùy biến theo từng item (ID -> { hex, intensity })
  const [itemColors, setItemColors] = useState<Record<string, ItemColorSetting>>(initialItemColors || {});

  // Cập nhật khi initialItemColors thay đổi
  useEffect(() => {
    if (initialItemColors) {
      setItemColors(initialItemColors);
    }
  }, [initialItemColors]);

  const updateItemColor = (id: string, hex: string | null, intensity: number = 0.85) => {
    setItemColors((prev) => {
      const next = {
        ...prev,
        [id]: { hex, intensity }
      };
      onColorsChange?.(next);
      return next;
    });
  };

  // State mở Color Customizer Modal cho món đồ cụ thể
  const [colorTargetItem, setColorTargetItem] = useState<{
    id: string;
    name: string;
    categoryName: string;
    imageUrl: string;
  } | null>(null);

  // Lookbook Saving & Sharing State
  const [showSaveModal, setShowSaveModal] = useState<boolean>(false);
  const [isExporting, setIsExporting] = useState<boolean>(false);
  const [justCopiedLink, setJustCopiedLink] = useState<boolean>(false);
  const moodboardRef = useRef<HTMLDivElement>(null);

  // Xử lý xuất ảnh Lookbook (PNG card) chất lượng cao
  const handleExportLookbookImage = async () => {
    if (!moodboardRef.current) return;
    try {
      setIsExporting(true);
      const dataUrl = await toPng(moodboardRef.current, {
        cacheBust: true,
        pixelRatio: 2,
        backgroundColor: '#FAF7F2'
      });
      const link = document.createElement('a');
      link.download = `vietphuc-lookbook-${resolvedGarment.name.toLowerCase().replace(/\s+/g, '-')}-${Date.now()}.png`;
      link.href = dataUrl;
      link.click();
    } catch (err) {
      console.error('Lỗi khi xuất ảnh lookbook:', err);
      alert('Không thể tạo file ảnh lúc này. Bạn có thể sử dụng tính năng Chia sẻ liên kết!');
    } finally {
      setIsExporting(false);
    }
  };

  // Xử lý sao chép link chia sẻ trực tiếp
  const handleCopyDirectShareLink = async () => {
    const shareUrl = encodeOutfitToShareUrl({
      g: garmentItem.id,
      ctx: contextItem?.id,
      inn: innerItem?.id,
      bot: bottomItem?.id,
      sh: shoesItem?.id,
      hw: headwearItem?.id,
      jw: jewelryItems?.map((j) => j.id),
      gen: selectedGender,
      col: itemColors
    });

    try {
      await navigator.clipboard.writeText(shareUrl);
      setJustCopiedLink(true);
      setTimeout(() => setJustCopiedLink(false), 2500);
    } catch {
      setJustCopiedLink(true);
      setTimeout(() => setJustCopiedLink(false), 2500);
    }
  };

  // Xử lý lưu Lookbook vào localStorage
  const handleSaveToLookbook = (title: string, notes: string, authorName: string) => {
    saveLookbook({
      title,
      notes,
      authorName,
      gender: selectedGender === 'male' ? 'Male' : 'Female',
      contextId: contextItem?.id || null,
      garmentId: garmentItem.id,
      innerId: innerItem?.id || null,
      bottomId: bottomItem?.id || null,
      shoesId: shoesItem?.id || null,
      headwearId: headwearItem?.id || null,
      jewelryIds: jewelryItems?.map((j) => j.id) || [],
      itemColors: itemColors
    });
    // Đồng thời lưu vào Bộ sưu tập cá nhân nếu có callback
    if (onSaveOutfit) {
      onSaveOutfit(itemColors);
    }
  };

  // Phân giải các món đồ theo giới tính để lấy ảnh chính xác
  const resolvedGarment = resolveItemByGender(garmentItem, selectedGender);
  const resolvedInner = innerItem ? resolveItemByGender(innerItem, selectedGender) : null;
  const resolvedBottom = bottomItem ? resolveItemByGender(bottomItem, selectedGender) : null;
  const resolvedShoes = shoesItem ? resolveItemByGender(shoesItem, selectedGender) : null;
  const resolvedHeadwear = headwearItem ? resolveItemByGender(headwearItem, selectedGender) : null;
  const [customOutfitName, setCustomOutfitName] = useState<string>(`Phối đồ ${resolvedGarment.name}`);

  useEffect(() => {
    setCustomOutfitName(`Phối đồ ${resolvedGarment.name}`);
  }, [resolvedGarment.name]);

  // Lọc các thông báo cảnh báo mức WARN
  const warnings = validationResults.filter((r) => r.severity === 'WARN');

  const garmentImageUrl = getSafeImageUrl(resolvedGarment.resolvedImageUrl || resolvedGarment);
  const garmentColorSetting = itemColors[garmentItem.id] || (resolvedGarment ? itemColors[resolvedGarment.id] : undefined) || { hex: null, intensity: 0.85 };

  // Danh sách các món đồ phụ phối kèm (Tự động dàn trang linh hoạt, không bao giờ bị tràn lề)
  const companionItems = [
    ...(additionalGarments || []).map((g, idx) => {
      if (!g) return null;
      const resolvedG = resolveItemByGender(g, selectedGender);
      return {
        id: g.id,
        name: resolvedG.name || g.name || 'Cổ phục',
        categoryName: 'Cổ phục',
        imageUrl: getSafeImageUrl(resolvedG.resolvedImageUrl || resolvedG),
        colorSetting: itemColors[g.id] || (resolvedG ? itemColors[resolvedG.id] : undefined) || { hex: null, intensity: 0.85 },
        rotation: idx % 2 === 0 ? '-rotate-4' : 'rotate-4',
        sizeClass: 'w-24 sm:w-32 h-32 sm:h-40',
        onClick: () => setDetailGarment(g)
      };
    }),
    resolvedHeadwear && headwearItem && {
      id: headwearItem.id,
      name: resolvedHeadwear.name,
      categoryName: 'Mũ nón',
      imageUrl: getSafeImageUrl(resolvedHeadwear.resolvedImageUrl || resolvedHeadwear),
      colorSetting: itemColors[headwearItem.id] || (resolvedHeadwear ? itemColors[resolvedHeadwear.id] : undefined) || { hex: null, intensity: 0.85 },
      rotation: '-rotate-3',
      sizeClass: 'w-20 sm:w-28 h-20 sm:h-28',
      onClick: () => setDetailAccessory(headwearItem)
    },
    resolvedInner && innerItem && {
      id: innerItem.id,
      name: resolvedInner.name,
      categoryName: 'Áo mặc trong',
      imageUrl: getSafeImageUrl(resolvedInner.resolvedImageUrl || resolvedInner),
      colorSetting: itemColors[innerItem.id] || (resolvedInner ? itemColors[resolvedInner.id] : undefined) || { hex: null, intensity: 0.85 },
      rotation: 'rotate-2',
      sizeClass: 'w-22 sm:w-30 h-22 sm:h-30',
      onClick: () => setDetailCasual(innerItem)
    },
    resolvedBottom && bottomItem && {
      id: bottomItem.id,
      name: resolvedBottom.name,
      categoryName: 'Quần / Váy',
      imageUrl: getSafeImageUrl(resolvedBottom.resolvedImageUrl || resolvedBottom),
      colorSetting: itemColors[bottomItem.id] || (resolvedBottom ? itemColors[resolvedBottom.id] : undefined) || { hex: null, intensity: 0.85 },
      rotation: '-rotate-2',
      sizeClass: 'w-22 sm:w-32 h-28 sm:h-36',
      onClick: () => setDetailCasual(bottomItem)
    },
    resolvedShoes && shoesItem && {
      id: shoesItem.id,
      name: resolvedShoes.name,
      categoryName: 'Giày dép',
      imageUrl: getSafeImageUrl(resolvedShoes.resolvedImageUrl || resolvedShoes),
      colorSetting: itemColors[shoesItem.id] || (resolvedShoes ? itemColors[resolvedShoes.id] : undefined) || { hex: null, intensity: 0.85 },
      rotation: 'rotate-3',
      sizeClass: 'w-20 sm:w-28 h-20 sm:h-28',
      onClick: () => setDetailCasual(shoesItem)
    },
    ...jewelryItems.map((j, idx) => {
      const resolvedJ = resolveItemByGender(j, selectedGender);
      return {
        id: j.id,
        name: resolvedJ.name,
        categoryName: 'Trang sức',
        imageUrl: getSafeImageUrl(resolvedJ.resolvedImageUrl || resolvedJ),
        colorSetting: itemColors[j.id] || (resolvedJ ? itemColors[resolvedJ.id] : undefined) || { hex: null, intensity: 0.85 },
        rotation: idx % 2 === 0 ? '-rotate-6' : 'rotate-6',
        sizeClass: 'w-16 sm:w-22 h-16 sm:h-22',
        onClick: () => setDetailAccessory(j)
      };
    })
  ].filter(Boolean) as Array<{
    id: string;
    name: string;
    categoryName: string;
    imageUrl: string;
    colorSetting: ItemColorSetting;
    rotation: string;
    sizeClass: string;
    onClick: () => void;
  }>;

  return (
    <div className="max-w-4xl mx-auto space-y-3 animate-in fade-in-50 duration-300 pb-36 px-2 sm:px-4">
      {/* ==========================================
          1. HEADER TỐI GIẢN (EDITORIAL LOOKBOOK HEADER)
         ========================================== */}
      <div className="text-center space-y-1 pt-0.5">
        {isOutdatedOrBlocked ? (
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-red-100/90 text-red-900 text-[11px] font-medium border border-red-200">
            <AlertTriangle className="w-3 h-3 text-red-600 shrink-0" />
            <span>Cần kiểm tra lại</span>
            {contextItem && (
              <>
                <span className="text-red-300">•</span>
                <span className="text-red-800 truncate max-w-[150px]">{contextItem.name}</span>
              </>
            )}
          </div>
        ) : warnings.length > 0 ? (
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-100/90 text-amber-900 text-[11px] font-medium border border-amber-200">
            <AlertTriangle className="w-3 h-3 text-amber-600 shrink-0" />
            <span>Có lưu ý</span>
            {contextItem && (
              <>
                <span className="text-amber-300">•</span>
                <span className="text-amber-800 truncate max-w-[150px]">{contextItem.name}</span>
              </>
            )}
          </div>
        ) : (
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-stone-100/90 text-stone-600 text-[11px] font-medium">
            <CheckCircle2 className="w-3 h-3 text-emerald-600 shrink-0" />
            <span>Đạt chuẩn</span>
            {contextItem && (
              <>
                <span className="text-stone-300">•</span>
                <span className="text-stone-600 truncate max-w-[150px]">{contextItem.name}</span>
              </>
            )}
          </div>
        )}

        <h1 className="text-xl sm:text-2xl font-bold text-stone-900 tracking-tight leading-tight">
          Bảng Phối Đồ
        </h1>
        <p className="text-[9px] tracking-widest uppercase text-stone-400">
          Chạm để xem chi tiết
        </p>
      </div>

      {/* LỖI XUNG ĐỘT QUY CHUẨN NẾU CÓ (KHI XEM LẠI BỘ LƯU CŨ) */}
      {isOutdatedOrBlocked && (
        <div className="space-y-2 max-w-2xl mx-auto">
          {validationResults.filter(r => r.severity === 'BLOCK').map((err, index) => (
            <div
              key={index}
              className="p-3.5 rounded-2xl bg-red-50/90 border border-red-200/80 text-red-950 flex items-start gap-2.5 text-xs "
            >
              <AlertTriangle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
              <p className="leading-relaxed font-medium">{err.message}</p>
            </div>
          ))}
        </div>
      )}

      {/* CẢNH BÁO NẾU CÓ */}
      {warnings.length > 0 && (
        <div className="space-y-2 max-w-2xl mx-auto">
          {warnings.map((warn, index) => (
            <div
              key={index}
              className="p-3.5 rounded-2xl bg-amber-50/90 border border-amber-200/80 text-amber-950 flex items-start gap-2.5 text-xs "
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
      <div
        ref={moodboardRef}
        className="relative w-full rounded-sm p-4 sm:p-8 md:p-10 bg-[#fcf9f2] border border-stone-300 shadow-md overflow-hidden font-sans"
        style={{
          backgroundImage: 'repeating-linear-gradient(transparent, transparent 27px, #e2e2e2 27px, #e2e2e2 28px)',
          backgroundSize: '100% 28px',
          backgroundPositionY: '14px' // căn lề
        }}
      >
        {/* Binder holes effect (Trang vở đục lỗ) */}
        <div className="absolute left-1 sm:left-4 top-0 bottom-0 w-4 sm:w-8 border-r sm:border-r-2 border-red-800/20 flex flex-col justify-around py-4 sm:py-8 z-0">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="w-2.5 h-2.5 sm:w-4 sm:h-4 rounded-full bg-stone-200 shadow-inner border border-stone-300/50 -ml-0.5 sm:ml-0" />
          ))}
        </div>

        {/* Khung Moodboard chính */}
        <div className="flex flex-row flex-wrap items-start justify-between sm:justify-center relative z-10 pl-5 sm:pl-8 pt-2 pb-4 gap-x-1 sm:gap-x-6 gap-y-4 w-full">

          {/* VỊ TRÍ TRUNG TÂM: CỔ PHỤC DI SẢN (KEY PIECE) */}
          <div className={`flex flex-col items-center shrink-0 w-[42%] ${companionItems.length >= 4 ? 'sm:w-[48%] md:w-[45%]' : 'sm:w-[55%] md:w-[45%]'} max-w-[260px]`}>
            {/* Scrapbook Style cho món đồ chính (Dán trực tiếp lên giấy) */}
            <div className="relative w-full group -rotate-1">

              {/* Ảnh */}
              <div
                onClick={() => setDetailGarment(garmentItem)}
                className="cursor-pointer w-full aspect-[3/4] relative flex items-center justify-center"
                title="Xem chi tiết Cổ phục di sản"
              >
                <TintedImage
                  src={garmentImageUrl}
                  colorHex={garmentColorSetting.hex}
                  intensity={garmentColorSetting.intensity}
                  alt={resolvedGarment.name}
                  fallbackText={resolvedGarment.name}
                  className="bg-transparent w-full h-full flex items-center justify-center p-0.5 sm:p-1"
                  imgClassName="mix-blend-multiply object-contain object-center drop-shadow-xl group-hover:scale-105 transition-transform duration-500"
                />
              </div>

              {/* Thông tin Text dạng ghi chú tay */}
              <div className="text-center space-y-0.5 sm:space-y-1.5 mt-1 sm:mt-2 px-0.5 sm:px-1 relative z-10 flex flex-col items-center">
                <span className="text-[7px] sm:text-[9px] uppercase tracking-[0.1em] text-red-800 font-bold block bg-stone-100/50 backdrop-blur-sm py-0.5 sm:py-0.5 rounded-sm w-max mx-auto px-1 sm:px-1.5 border border-red-800/10 shadow-xs">
                  Key Piece
                </span>
                <h2
                  onClick={() => setDetailGarment(garmentItem)}
                  className="text-sm sm:text-2xl font-bold text-stone-800 tracking-tight hover:text-red-900 transition-colors cursor-pointer leading-tight line-clamp-2"
                >
                  {resolvedGarment.name}
                </h2>

                <div className="pt-0.5 sm:pt-1 flex items-center justify-center">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setColorTargetItem({
                        id: garmentItem.id,
                        name: resolvedGarment.name,
                        categoryName: 'Cổ phục',
                        imageUrl: garmentImageUrl
                      });
                    }}
                    className="inline-flex items-center gap-1 sm:gap-1.5 px-1.5 sm:px-2.5 py-1 sm:py-1.5 rounded-md bg-stone-900/90 backdrop-blur hover:bg-stone-800 text-white text-[8px] sm:text-[11px] font-semibold transition-all shadow-md cursor-pointer"
                  >
                    <Palette className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                    <span>Sắc màu</span>
                    {garmentColorSetting.hex && (
                      <span
                        className="w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full border border-white/50 shadow-inner inline-block ml-0.5"
                        style={{ backgroundColor: garmentColorSetting.hex }}
                      />
                    )}
                  </button>
                </div>

                {resolvedGarment.origin && (
                  <p className="text-[7px] sm:text-[9px] text-stone-600 font-medium leading-tight pt-0.5 sm:pt-1 px-0.5 sm:px-1 italic line-clamp-2">
                    "{resolvedGarment.origin}"
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* DÀN TRANG CÁC MÓN PHỐI KÈM (MIX & MATCH CLUSTER) */}
          {companionItems.length > 0 && (
            <div className={`shrink-0 w-[55%] ${companionItems.length >= 4 ? 'sm:w-[48%] md:w-[50%]' : 'sm:w-[40%] md:w-[45%]'} max-w-[320px] pt-1 sm:pt-2`}>
              <div className="w-full text-center mb-0.5 sm:mb-1">
                <span className="text-[7px] sm:text-[9px] uppercase tracking-[0.15em] text-red-900/70 font-bold bg-stone-100/30 backdrop-blur-sm px-1.5 sm:px-2 py-0.5 rounded border border-red-800/5">
                  Mix & Match
                </span>
              </div>

              <div className="grid grid-cols-2 sm:flex sm:flex-row sm:flex-wrap sm:items-start sm:justify-center gap-1.5 sm:gap-x-2 sm:gap-y-4">
                {companionItems.map((c, i) => (
                  <div
                    key={c.id}
                    className={`relative flex flex-col items-center group transition-all duration-300 ${c.rotation} hover:z-20 w-full sm:w-[45%] sm:min-w-[65px] sm:max-w-[110px]`}
                  >
                    {/* Image Area */}
                    <div
                      onClick={c.onClick}
                      className="w-full aspect-[3/4] flex items-center justify-center cursor-pointer relative"
                    >
                      <TintedImage
                        src={c.imageUrl}
                        colorHex={c.colorSetting.hex}
                        intensity={c.colorSetting.intensity}
                        alt={c.name}
                        fallbackText={c.name}
                        className="bg-transparent w-full h-full flex items-center justify-center p-0 sm:p-0.5"
                        imgClassName="mix-blend-multiply object-contain object-center drop-shadow-md group-hover:scale-110 transition-transform duration-300"
                      />
                    </div>

                    {/* Info Area (Compact for grid) */}
                    <div className="flex flex-col items-center justify-center gap-0 sm:gap-0.5 mt-0.5 sm:mt-1 text-center w-full">
                      <span className="text-[6px] sm:text-[7px] uppercase tracking-wider text-red-800 font-bold bg-stone-100/50 backdrop-blur-sm px-1 py-0.5 rounded shadow-xs max-w-[95%] sm:max-w-[90%] truncate mb-0.5 sm:mb-0">
                        {c.categoryName}
                      </span>
                      <span
                        onClick={c.onClick}
                        className="text-[7px] sm:text-[10px] font-bold text-stone-800 leading-tight group-hover:text-red-700 transition-colors cursor-pointer line-clamp-1 w-full px-0.5 sm:px-1"
                        title={c.name}
                      >
                        {c.name}
                      </span>

                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setColorTargetItem({
                            id: c.id,
                            name: c.name,
                            categoryName: c.categoryName,
                            imageUrl: c.imageUrl
                          });
                        }}
                        className="mt-0.5 p-0.5 sm:p-1 rounded-full bg-stone-100/70 backdrop-blur hover:bg-stone-200 text-stone-600 hover:text-red-700 transition-colors cursor-pointer shadow-sm border border-stone-300/50"
                        title={`Đổi màu ${c.name}`}
                      >
                        {c.colorSetting.hex ? (
                          <span
                            className="w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full border border-stone-300 block shadow-inner"
                            style={{ backgroundColor: c.colorSetting.hex }}
                          />
                        ) : (
                          <Palette className="w-2.5 h-2.5" />
                        )}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ==========================================
          3. NÚT TRÒN THAO TÁC NỔI BÊN HÔNG PHẢI DƯỚI (FLOATING ACTION BUTTON)
         ========================================== */}
      <div className="fixed bottom-24 sm:bottom-28 right-4 sm:right-6 z-[60] flex flex-col items-end pointer-events-none">
        {isActionsExpanded && (
          /* MENU POPUP NỔI TRÊN NÚT TRÒN */
          <div className="pointer-events-auto mb-3 w-64 p-3 bg-white/95 backdrop-blur-md border border-stone-200/90 rounded-2xl shadow-2xl flex flex-col gap-2 transition-all duration-300 animate-in slide-in-from-bottom-3 zoom-in-95">
            <div className="flex items-center justify-between pb-1.5 border-b border-stone-100 px-1">
              <span className="text-[10px] uppercase tracking-wider text-stone-400 font-semibold">
                TÙY CHỌN BẢN PHỐI
              </span>
              <button
                type="button"
                onClick={() => setIsActionsExpanded(false)}
                className="p-1 rounded-full text-stone-400 hover:text-stone-700 hover:bg-stone-100 transition-colors cursor-pointer"
                title="Đóng menu"
              >
                <ChevronDown className="w-4 h-4" />
              </button>
            </div>

            {/* THÔNG BÁO LƯU BỘ PHỐI NẾU CÓ */}
            {saveNotice && (
              <div
                className={`p-2.5 px-3 rounded-xl text-xs font-medium flex items-center gap-2 border shadow-2xs ${saveNotice.type === 'success'
                  ? 'bg-emerald-50 text-emerald-950 border-emerald-200'
                  : saveNotice.type === 'warn'
                    ? 'bg-amber-50 text-amber-950 border-amber-200'
                    : saveNotice.type === 'info'
                      ? 'bg-stone-100 text-stone-800 border-stone-200/90'
                      : 'bg-red-50 text-red-950 border-red-200'
                  }`}
              >
                {saveNotice.type === 'success' ? (
                  <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                ) : saveNotice.type === 'info' ? (
                  <Info className="w-3.5 h-3.5 text-stone-600 shrink-0" />
                ) : (
                  <AlertTriangle
                    className={`w-3.5 h-3.5 shrink-0 ${saveNotice.type === 'warn' ? 'text-amber-600' : 'text-red-600'
                      }`}
                  />
                )}
                <span>{saveNotice.message}</span>
              </div>
            )}

            <div className="flex flex-col gap-1.5">
              <button
                type="button"
                onClick={() => {
                  setIsActionsExpanded(false);
                  setShowSaveModal(true);
                }}
                className="w-full px-3.5 py-2.5 rounded-xl bg-red-700 hover:bg-red-800 text-white font-semibold text-xs flex items-center justify-between shadow-xs transition-all active:scale-95 cursor-pointer"
              >
                <div className="flex items-center gap-2">
                  <Share2 className="w-4 h-4" />
                  <span>Xuất thẻ ảnh & Chia sẻ</span>
                </div>
                <Sparkles className="w-3.5 h-3.5 opacity-80" />
              </button>

              {!isFromCollection && onSaveOutfit && (
                <button
                  type="button"
                  onClick={() => onSaveOutfit(itemColors, customOutfitName)}
                  className={`w-full px-3.5 py-2 rounded-xl font-semibold text-xs flex items-center justify-center gap-1.5 transition-all active:scale-95 cursor-pointer shadow-xs ${
                    isSaved
                      ? 'bg-emerald-100 text-emerald-800 border border-emerald-300 hover:bg-emerald-200/70'
                      : 'bg-stone-900 hover:bg-stone-800 text-white'
                  }`}
                >
                  {isSaved ? (
                    <>
                      <BookmarkCheck className="w-3.5 h-3.5 text-emerald-700" />
                      <span>Đã lưu vào bộ sưu tập</span>
                    </>
                  ) : (
                    <>
                      <Bookmark className="w-3.5 h-3.5 text-stone-300" />
                      <span>Lưu vào bộ sưu tập</span>
                    </>
                  )}
                </button>
              )}
              <button
                type="button"
                onClick={() => {
                  setIsActionsExpanded(false);
                  setColorTargetItem({
                    id: garmentItem.id,
                    name: resolvedGarment.name,
                    categoryName: 'Cổ phục',
                    imageUrl: garmentImageUrl
                  });
                }}
                className="w-full px-3.5 py-2 rounded-xl border border-stone-200 hover:border-stone-300 bg-stone-50 hover:bg-stone-100 text-stone-800 font-medium text-xs flex items-center gap-2 transition-all cursor-pointer active:scale-95"
              >
                <Palette className="w-3.5 h-3.5 text-red-700" />
                <span>Đổi sắc màu áo</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setIsActionsExpanded(false);
                  setShowCulturalModal(true);
                }}
                className="w-full px-3.5 py-2 rounded-xl border border-stone-200 hover:border-stone-300 bg-stone-50 hover:bg-stone-100 text-stone-800 font-medium text-xs flex items-center gap-2 transition-all cursor-pointer active:scale-95"
              >
                <BookOpen className="w-3.5 h-3.5 text-stone-600" />
                <span>Câu chuyện di sản</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setIsActionsExpanded(false);
                  onBackToStudio();
                }}
                className="w-full px-3.5 py-2 rounded-xl border border-stone-200 hover:border-stone-300 bg-stone-50 hover:bg-stone-100 text-stone-600 hover:text-stone-900 font-medium text-xs flex items-center gap-2 transition-all cursor-pointer active:scale-95"
              >
                <ArrowLeft className="w-3.5 h-3.5 text-stone-500" />
                <span>Quay lại phối đồ</span>
              </button>
            </div>
          </div>
        )}

        {/* NÚT TRÒN FLOATING BUTTON (FAB) BÊN HÔNG PHẢI DƯỚI - GỌN HƠN & ĐỔI MÀU KHI CÓ CẢNH BÁO */}
        <div className="relative pointer-events-auto">
          <button
            type="button"
            onClick={() => setIsActionsExpanded((prev) => !prev)}
            className={`w-11 h-11 sm:w-12 sm:h-12 rounded-full shadow-lg flex items-center justify-center transition-all duration-300 hover:scale-105 active:scale-95 cursor-pointer select-none ${isActionsExpanded
              ? 'bg-stone-900 text-white ring-4 ring-stone-900/20'
              : warnings.length > 0
                ? 'bg-amber-600 hover:bg-amber-700 text-white ring-4 ring-amber-500/25'
                : 'bg-red-700 hover:bg-red-800 text-white ring-4 ring-red-700/20'
              }`}
            title={
              warnings.length > 0
                ? `Có ${warnings.length} lưu ý quy chuẩn văn hóa - Bấm để xem tùy chọn`
                : 'Bản phối hợp lệ - Bấm để xem tùy chọn'
            }
            aria-label="Tùy chọn bản phối"
          >
            {isActionsExpanded ? (
              <ChevronDown className="w-5 h-5 stroke-[2.5]" />
            ) : warnings.length > 0 ? (
              <AlertTriangle className="w-5 h-5 text-amber-100" />
            ) : (
              <Sparkles className="w-5 h-5 text-amber-300" />
            )}
          </button>

          {/* Dấu chấm thông báo cảnh báo nếu có warnings */}
          {warnings.length > 0 && !isActionsExpanded && (
            <span className="absolute -top-1 -right-1 flex h-3.5 w-3.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-amber-500 border-2 border-white" />
            </span>
          )}
        </div>
      </div>

      {/* ==========================================
          MODAL CHI TIẾT TỪNG MÓN ĐỒ KHI CLICK VÀO ITEM TRÊN MOODBOARD
         ========================================== */}
      {detailGarment && (
        <GarmentDetailModal
          garment={detailGarment}
          onClose={() => setDetailGarment(null)}
          selectedGender={selectedGender === 'female' ? 'Female' : 'Male'}
          currentColorHex={itemColors[detailGarment.id]?.hex || null}
          onApplyColor={(hex) => updateItemColor(detailGarment.id, hex)}
        />
      )}

      {detailCasual && (
        <CasualDetailModal
          item={detailCasual}
          onClose={() => setDetailCasual(null)}
          selectedGender={selectedGender === 'female' ? 'Female' : 'Male'}
          currentColorHex={itemColors[detailCasual.id]?.hex || null}
          onApplyColor={(hex) => updateItemColor(detailCasual.id, hex)}
        />
      )}

      {detailAccessory && (
        <AccessoryDetailModal
          accessory={detailAccessory}
          onClose={() => setDetailAccessory(null)}
          selectedGender={selectedGender === 'female' ? 'Female' : 'Male'}
          currentColorHex={itemColors[detailAccessory.id]?.hex || null}
          onApplyColor={(hex) => updateItemColor(detailAccessory.id, hex)}
        />
      )}

      {/* MODAL TÙY BIẾN SẮC MÀU TRANG PHỤC (CANVAS 2D) */}
      {colorTargetItem && (
        <ColorCustomizerModal
          isOpen={Boolean(colorTargetItem)}
          onClose={() => setColorTargetItem(null)}
          itemName={colorTargetItem.name}
          itemCategoryName={colorTargetItem.categoryName}
          originalImageUrl={colorTargetItem.imageUrl}
          currentColorHex={itemColors[colorTargetItem.id]?.hex || null}
          onApplyColor={(hex, intensity) => {
            updateItemColor(colorTargetItem.id, hex, intensity);
          }}
        />
      )}

      {/* Modal Câu Chuyện Văn Hóa */}
      <CulturalKnowledgeModal
        isOpen={showCulturalModal}
        onClose={() => setShowCulturalModal(false)}
        garment={garmentItem}
        selectedGender={selectedGender.toLowerCase() as 'male' | 'female'}
      />

      {/* Modal Xuất Thẻ Ảnh & Chia Sẻ */}
      <SaveLookbookModal
        isOpen={showSaveModal}
        onClose={() => setShowSaveModal(false)}
        defaultTitle={customOutfitName}
        onUpdateName={(newName) => {
          setCustomOutfitName(newName);
          if (isSaved && onSaveOutfit) {
            onSaveOutfit(itemColors, newName);
          }
        }}
        onExportImage={handleExportLookbookImage}
        isExporting={isExporting}
        sharePayload={{
          g: garmentItem.id,
          ctx: contextItem?.id,
          inn: innerItem?.id,
          bot: bottomItem?.id,
          sh: shoesItem?.id,
          hw: headwearItem?.id,
          jw: jewelryItems?.map((j) => j.id),
          gen: selectedGender,
          col: itemColors
        }}
      />
    </div>
  );
};

export default OutfitResultView;
