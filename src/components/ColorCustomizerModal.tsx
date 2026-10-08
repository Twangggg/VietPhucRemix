import React, { useState, useEffect } from 'react';
import {
  X,
  Palette,
  RotateCcw,
  Sparkles,
  Sliders,
  Check,
  Info
} from 'lucide-react';
import { TRADITIONAL_COLORS, TraditionalColor, recolorImageViaCanvas } from '../utils/recolorEngine';
import { SafeImage } from './SafeImage';

interface ColorCustomizerModalProps {
  isOpen: boolean;
  onClose: () => void;
  itemName: string;
  itemCategoryName?: string;
  originalImageUrl: string;
  currentColorHex: string | null;
  onApplyColor: (colorHex: string | null, intensity: number) => void;
}

export const ColorCustomizerModal: React.FC<ColorCustomizerModalProps> = ({
  isOpen,
  onClose,
  itemName,
  itemCategoryName = 'Trang phục',
  originalImageUrl,
  currentColorHex,
  onApplyColor
}) => {
  const [selectedHex, setSelectedHex] = useState<string | null>(currentColorHex);
  const [intensity, setIntensity] = useState<number>(0.85);
  const [activeCategory, setActiveCategory] = useState<'all' | 'royal' | 'folk' | 'festive'>('all');
  const [previewUrl, setPreviewUrl] = useState<string>(originalImageUrl);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [customInputHex, setCustomInputHex] = useState<string>(
    currentColorHex && currentColorHex !== 'original' ? currentColorHex : '#A82229'
  );

  // Cập nhật khi mở Modal
  useEffect(() => {
    if (isOpen) {
      setSelectedHex(currentColorHex);
      if (currentColorHex && currentColorHex !== 'original') {
        setCustomInputHex(currentColorHex);
      }
    }
  }, [isOpen, currentColorHex]);

  // Recolor preview khi thay đổi màu hoặc độ đậm
  useEffect(() => {
    if (!isOpen) return;

    let isMounted = true;
    setIsProcessing(true);

    if (!selectedHex || selectedHex === 'original') {
      setPreviewUrl(originalImageUrl);
      setIsProcessing(false);
      return;
    }

    recolorImageViaCanvas(originalImageUrl, selectedHex, intensity).then((dataUrl) => {
      if (isMounted) {
        setPreviewUrl(dataUrl);
        setIsProcessing(false);
      }
    });

    return () => {
      isMounted = false;
    };
  }, [isOpen, originalImageUrl, selectedHex, intensity]);

  if (!isOpen) return null;

  const filteredColors = TRADITIONAL_COLORS.filter((c) => {
    if (activeCategory === 'all') return true;
    return c.category === activeCategory || c.id === 'original';
  });

  const selectedColorInfo = TRADITIONAL_COLORS.find(
    (c) => c.hex.toLowerCase() === (selectedHex || '').toLowerCase()
  );

  const handleSelectPredefined = (color: TraditionalColor) => {
    if (color.id === 'original') {
      setSelectedHex(null);
    } else {
      setSelectedHex(color.hex);
      setCustomInputHex(color.hex);
    }
  };

  const handleCustomColorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setCustomInputHex(val);
    setSelectedHex(val);
  };

  const handleConfirm = () => {
    onApplyColor(selectedHex, intensity);
    onClose();
  };

  const handleReset = () => {
    setSelectedHex(null);
    setIntensity(0.85);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-stone-900/60 backdrop-blur-sm animate-in fade-in-50 duration-200">
      <div
        className="bg-[#FBF9F5] border border-stone-200 rounded-3xl w-full max-w-2xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300"
        onClick={(e) => e.stopPropagation()}
      >
        {/* ==========================================
            HEADER MODAL
           ========================================== */}
        <div className="px-5 py-4 border-b border-stone-200/80 flex items-center justify-between bg-white/60">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-red-50 text-red-800 flex items-center justify-center">
              <Palette className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[10px] font-mono tracking-widest uppercase text-stone-400 font-semibold block">
                TÙY BIẾN SẮC MÀU DI SẢN
              </span>
              <h2 className="text-base sm:text-lg font-serif font-bold text-stone-900 leading-tight">
                Đổi màu {itemName}
              </h2>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-stone-400 hover:text-stone-800 hover:bg-stone-100 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* ==========================================
            BODY: PREVIEW + COLOR SWATCHES
           ========================================== */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5">
          {/* KHUNG SO SÁNH PREVIEW TRỰC TIẾP */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Ảnh đang biến tấu */}
            <div className="relative rounded-2xl bg-white border border-stone-200/90 p-3 flex flex-col items-center justify-center min-h-[220px] shadow-xs">
              <span className="absolute top-2.5 left-3 text-[9px] font-mono uppercase tracking-wider px-2 py-0.5 rounded-md bg-stone-100 text-stone-600 font-semibold">
                Xem trước thực tế (Canvas 2D)
              </span>

              {isProcessing && (
                <div className="absolute inset-0 bg-white/70 backdrop-blur-xs flex items-center justify-center z-10 rounded-2xl">
                  <span className="text-xs font-mono text-stone-600 flex items-center gap-1.5 animate-pulse">
                    <Sparkles className="w-3.5 h-3.5 text-red-700" />
                    Đang phủ màu vải...
                  </span>
                </div>
              )}

              <div className="w-44 h-48 relative flex items-center justify-center mt-3">
                <SafeImage
                  src={previewUrl}
                  alt={itemName}
                  fallbackText={itemName}
                  className="w-full h-full bg-transparent flex items-center justify-center"
                  imgClassName="mix-blend-multiply object-contain drop-shadow-md"
                />
              </div>

              {/* Thông tin màu đang chọn */}
              <div className="mt-2 text-center">
                <span className="text-xs font-serif font-bold text-stone-800">
                  {selectedColorInfo ? selectedColorInfo.name : selectedHex ? `Mã màu: ${selectedHex}` : 'Màu gốc'}
                </span>
                {selectedColorInfo?.alias && (
                  <span className="text-[10px] text-stone-400 block font-mono">
                    ({selectedColorInfo.alias})
                  </span>
                )}
              </div>
            </div>

            {/* Bảng điều khiển độ đậm & Tùy chỉnh tự do */}
            <div className="space-y-3.5 flex flex-col justify-between">
              {/* Thẻ ý nghĩa văn hóa của màu */}
              <div className="p-3.5 rounded-2xl bg-amber-50/70 border border-amber-200/70 text-stone-800 text-xs space-y-1">
                <div className="flex items-center gap-1.5 font-semibold text-amber-900 font-serif">
                  <Info className="w-3.5 h-3.5 text-amber-700 shrink-0" />
                  <span>{selectedColorInfo ? selectedColorInfo.name : 'Sắc màu tự do'}</span>
                </div>
                <p className="text-[11px] text-stone-600 leading-relaxed font-sans">
                  {selectedColorInfo
                    ? selectedColorInfo.culturalLore
                    : 'Tự do biến tấu màu sắc theo gu thẩm mỹ cá nhân, công nghệ Canvas 2D giữ nguyên các nếp gấp vải tự nhiên.'}
                </p>
              </div>

              {/* Slider điều chỉnh độ đậm / trong của màu vải */}
              {selectedHex && selectedHex !== 'original' && (
                <div className="p-3 rounded-2xl bg-white border border-stone-200/80 space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-stone-700 flex items-center gap-1">
                      <Sliders className="w-3 h-3 text-stone-400" />
                      Độ đậm màu vải
                    </span>
                    <span className="font-mono text-stone-500">{Math.round(intensity * 100)}%</span>
                  </div>
                  <input
                    type="range"
                    min="0.3"
                    max="1.0"
                    step="0.05"
                    value={intensity}
                    onChange={(e) => setIntensity(parseFloat(e.target.value))}
                    className="w-full h-1.5 bg-stone-200 rounded-lg appearance-none cursor-pointer accent-red-700"
                  />
                  <div className="flex justify-between text-[9px] font-mono text-stone-400">
                    <span>Pastel nhạt</span>
                    <span>Đậm đà</span>
                  </div>
                </div>
              )}

              {/* Chọn màu tự do (Custom Color Picker) */}
              <div className="p-3 rounded-2xl bg-white border border-stone-200/80 flex items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    id="customColorInput"
                    value={customInputHex}
                    onChange={handleCustomColorChange}
                    className="w-8 h-8 rounded-lg cursor-pointer border border-stone-300 p-0.5 bg-white shrink-0"
                  />
                  <label htmlFor="customColorInput" className="text-xs font-medium text-stone-700 cursor-pointer">
                    Chọn màu tự do (Custom)
                  </label>
                </div>
                <span className="font-mono text-[11px] text-stone-400 uppercase">{customInputHex}</span>
              </div>
            </div>
          </div>

          {/* ==========================================
              BẢNG MÀU TRUYỀN THỐNG VIỆT NAM (SWATCHES)
             ========================================== */}
          <div className="space-y-3 pt-2">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-stone-800 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                Bảng Sắc Màu Di Sản Việt
              </span>

              {/* Lọc danh mục màu */}
              <div className="flex items-center gap-1 bg-stone-100 p-0.5 rounded-full text-[10px] font-medium">
                {[
                  { id: 'all', label: 'Tất cả' },
                  { id: 'royal', label: 'Cung đình' },
                  { id: 'festive', label: 'Lễ hội' },
                  { id: 'folk', label: 'Dân gian' }
                ].map((cat) => (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setActiveCategory(cat.id as any)}
                    className={`px-2.5 py-0.5 rounded-full transition-all cursor-pointer ${
                      activeCategory === cat.id
                        ? 'bg-white text-stone-900 shadow-xs font-semibold'
                        : 'text-stone-500 hover:text-stone-800'
                    }`}
                  >
                    {cat.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Grid các ô màu */}
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2">
              {filteredColors.map((color) => {
                const isSelected =
                  color.id === 'original'
                    ? !selectedHex || selectedHex === 'original'
                    : selectedHex?.toLowerCase() === color.hex.toLowerCase();

                return (
                  <button
                    key={color.id}
                    type="button"
                    onClick={() => handleSelectPredefined(color)}
                    className={`p-2 rounded-xl border text-left flex flex-col items-center gap-1.5 transition-all cursor-pointer select-none group relative ${
                      isSelected
                        ? 'bg-white border-stone-900 ring-1 ring-stone-900 shadow-xs'
                        : 'bg-white/70 border-stone-200/80 hover:border-stone-400 hover:bg-white'
                    }`}
                  >
                    {/* Vòng tròn màu */}
                    <div
                      className={`w-7 h-7 rounded-full border border-black/10 shadow-inner flex items-center justify-center relative transition-transform group-hover:scale-110 ${
                        color.id === 'original' ? 'bg-gradient-to-tr from-stone-200 to-stone-400' : ''
                      }`}
                      style={{
                        backgroundColor: color.id === 'original' ? undefined : color.hex
                      }}
                    >
                      {color.id === 'original' && (
                        <RotateCcw className="w-3.5 h-3.5 text-stone-700" />
                      )}
                      {isSelected && color.id !== 'original' && (
                        <Check className="w-3.5 h-3.5 text-white drop-shadow-md stroke-[3]" />
                      )}
                    </div>

                    <span className="text-[11px] font-medium text-stone-800 truncate w-full text-center leading-none mt-0.5">
                      {color.name}
                    </span>
                    <span className="text-[9px] font-mono text-stone-400 leading-none">
                      {color.alias || color.hex}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* ==========================================
            FOOTER THAO TÁC
           ========================================== */}
        <div className="px-5 py-3.5 border-t border-stone-200/80 bg-white flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={handleReset}
            className="px-3.5 py-2 rounded-full text-stone-500 hover:text-stone-900 hover:bg-stone-100 text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Về màu gốc</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-full border border-stone-200 hover:border-stone-300 text-xs font-semibold text-stone-700 hover:bg-stone-50 transition-colors cursor-pointer"
            >
              Hủy
            </button>
            <button
              type="button"
              onClick={handleConfirm}
              className="px-5 py-2 rounded-full bg-stone-900 hover:bg-stone-800 text-white text-xs font-semibold shadow-xs hover:shadow-md transition-all active:scale-95 cursor-pointer flex items-center gap-1.5"
            >
              <Check className="w-3.5 h-3.5" />
              <span>Áp dụng màu này</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
