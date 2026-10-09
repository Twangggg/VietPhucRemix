import React, { useState } from 'react';
import { Info, ArrowLeft, Sparkles, Layers, SlidersHorizontal, Tag } from 'lucide-react';
import { CONTEXTS, GARMENTS, CASUAL_ITEMS, ACCESSORIES } from '../data';
import { OutfitCombination, Gender, Garment, CasualItem, AccessoryItem } from '../types';
import { resolveItemByGender } from '../utils/helpers';
import { GarmentDetailModal } from './GarmentDetailModal';
import { CasualDetailModal } from './CasualDetailModal';
import { AccessoryDetailModal } from './AccessoryDetailModal';
import { SafeImage } from './SafeImage';

interface LookbookDetailProps {
  outfit: OutfitCombination;
  onBack: () => void;
  onRemix: (outfit: OutfitCombination) => void;
  translateStyle: (style: string) => string;
  translateGender: (gender: string) => string;
  translateCategory: (cat: string) => string;
}

export function LookbookDetail({
  outfit,
  onBack,
  onRemix,
  translateStyle,
  translateGender,
  translateCategory
}: LookbookDetailProps) {
  const [detailGarment, setDetailGarment] = useState<Garment | null>(null);
  const [detailCasual, setDetailCasual] = useState<CasualItem | null>(null);
  const [detailAccessory, setDetailAccessory] = useState<AccessoryItem | null>(null);

  const getOutfitItems = () => {
    const comp = outfit.composition;
    const itemIds = [
      comp.inner,
      comp.top,
      comp.outer_traditional,
      comp.outer_formal,
      comp.bottom_pants,
      comp.bottom_skirt,
      comp.shoes,
      comp.traditional_footwear,
      comp.headwear,
      ...(comp.jewelry || []),
      ...(comp.other_accessories || [])
    ].filter(Boolean) as string[];

    return itemIds.map(id => {
      const baseId = id.replace(/_[12]$/, '').toLowerCase();
      const idLower = id.toLowerCase();
      let itemType: 'garment' | 'casual' | 'accessory' | null = null;
      let item = GARMENTS.find(g => g.id.toLowerCase() === idLower || g.id.toLowerCase() === baseId);
      if (item) itemType = 'garment';
      else {
        item = CASUAL_ITEMS.find(c => c.id.toLowerCase() === idLower || c.id.toLowerCase() === baseId) as any;
        if (item) itemType = 'casual';
        else {
          item = ACCESSORIES.find(a => a.id.toLowerCase() === idLower || a.id.toLowerCase() === baseId) as any;
          if (item) itemType = 'accessory';
        }
      }

      if (!item || !itemType) return null;
      const genderStr = outfit.gender.toLowerCase() === 'female' ? 'Female' : 'Male';
      return {
        type: itemType,
        originalItem: item,
        resolvedItem: resolveItemByGender(item as any, genderStr as Gender)
      };
    }).filter(Boolean) as { type: 'garment' | 'casual' | 'accessory', originalItem: any, resolvedItem: any }[];
  };

  const getUntrackedItems = () => {
    const comp = outfit.composition;
    const itemIds = [
      comp.inner,
      comp.top,
      comp.outer_traditional,
      comp.outer_formal,
      comp.bottom_pants,
      comp.bottom_skirt,
      comp.shoes,
      comp.traditional_footwear,
      comp.headwear,
      ...(comp.jewelry || []),
      ...(comp.other_accessories || [])
    ].filter(Boolean) as string[];

    return itemIds.filter(id => {
      const baseId = id.replace(/_[12]$/, '').toLowerCase();
      const idLower = id.toLowerCase();
      const isGarment = GARMENTS.some(g => g.id.toLowerCase() === idLower || g.id.toLowerCase() === baseId);
      const isCasual = CASUAL_ITEMS.some(c => c.id.toLowerCase() === idLower || c.id.toLowerCase() === baseId);
      const isAccessory = ACCESSORIES.some(a => a.id.toLowerCase() === idLower || a.id.toLowerCase() === baseId);
      return !isGarment && !isCasual && !isAccessory;
    });
  };

  const outfitItems = getOutfitItems();
  const untrackedItems = getUntrackedItems();

  return (
    <div className="space-y-6">
      <button
        onClick={onBack}
        className="flex items-center text-sm font-semibold text-stone-600 hover:text-red-700 transition-colors"
      >
        <ArrowLeft className="w-4 h-4 mr-1.5" />
        Quay lại danh sách
      </button>

      <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-stone-200">
        <div className="flex flex-col gap-8">
          {/* Thông tin */}
          <div className="w-full flex flex-col">
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <span className="text-xs font-sans text-red-700 font-semibold tracking-wider uppercase block">
                    Bản phối tiêu biểu
                  </span>
                  <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 tracking-tight leading-tight mt-1">
                    {outfit.name}
                  </h2>
                </div>
                <button
                  onClick={() => onRemix(outfit)}
                  className="px-5 py-2.5 rounded-xl bg-stone-900 hover:bg-stone-800 text-white text-sm font-semibold shadow-sm transition-all flex items-center justify-center gap-2 shrink-0 w-full sm:w-auto cursor-pointer"
                >
                  <SlidersHorizontal className="w-4 h-4" />
                  <span>Phối lại</span>
                </button>
              </div>

              <div className="flex flex-wrap gap-2 pt-1 pb-3">
                <span className="text-xs font-sans text-stone-700 bg-stone-100 px-3 py-1.5 rounded-lg border border-stone-200/60">
                  <strong>Phong cách:</strong> {translateStyle(outfit.style)}
                </span>
                <span className="text-xs font-sans text-stone-700 bg-stone-100 px-3 py-1.5 rounded-lg border border-stone-200/60">
                  <strong>Giới tính:</strong> {translateGender(outfit.gender)}
                </span>
              </div>

              <div className="bg-stone-50 p-5 rounded-2xl border border-stone-200/60 space-y-3">
                <div>
                  <h4 className="text-sm font-bold text-gray-900 mb-1 flex items-center gap-1.5">
                    <Info className="w-4 h-4 text-red-700" /> Điểm nhấn truyền thống
                  </h4>
                  <p className="text-sm text-gray-700 leading-relaxed italic">
                    {outfit.traditional_focus}
                  </p>
                </div>
                <div className="border-t border-stone-200/60 pt-3">
                  <h4 className="text-sm font-bold text-gray-900 mb-1 flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-red-700" /> Ghi chú phối đồ
                  </h4>
                  <p className="text-sm text-gray-700 leading-relaxed">
                    {outfit.styling_notes}
                  </p>
                </div>
              </div>

              <div className="pt-2">
                <h4 className="text-sm font-bold text-gray-900 mb-2">Bối cảnh đề xuất:</h4>
                <div className="flex flex-wrap gap-2">
                  {outfit.applicable_events.map(id => {
                    const ctx = CONTEXTS.find(c => c.id === id);
                    return (
                      <span key={id} className="text-xs text-stone-600 bg-white border border-stone-200 px-2.5 py-1 rounded-md shadow-xs">
                        {ctx?.name || id}
                      </span>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Chi tiết Items */}
        <div className="mt-10 pt-8 border-t border-stone-200">
          <h3 className="text-xl font-bold text-gray-900 tracking-tight mb-6 flex items-center gap-2">
            <Layers className="w-5 h-5 text-red-700" />
            Chi tiết các món đồ trong bản phối
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {outfitItems.map(({ type, originalItem, resolvedItem }, index) => (
              <div
                key={`${resolvedItem.id}-${index}`}
                className="bg-stone-50 rounded-xl overflow-hidden border border-stone-200 flex flex-col hover:border-red-200 hover:shadow-sm transition-all cursor-pointer"
                onClick={() => {
                  if (type === 'garment') setDetailGarment(originalItem);
                  else if (type === 'casual') setDetailCasual(originalItem);
                  else if (type === 'accessory') setDetailAccessory(originalItem);
                }}
              >
                <div className="aspect-square bg-white relative p-2 flex items-center justify-center">
                  {resolvedItem.resolvedImageUrl ? (
                    <SafeImage
                      src={resolvedItem.resolvedImageUrl}
                      alt={resolvedItem.name}
                      className="w-full h-full"
                      imgClassName="max-w-full max-h-full object-contain mix-blend-multiply"
                    />
                  ) : (
                    <Sparkles className="w-8 h-8 text-stone-300" />
                  )}
                </div>
                <div className="p-3 border-t border-stone-200 flex-1 flex flex-col justify-center text-center">
                  <h5 className="text-[11px] font-bold text-gray-900 leading-tight line-clamp-2">
                    {resolvedItem.name}
                  </h5>
                  <span className="text-[9px] text-stone-500 uppercase tracking-wide mt-1 block">
                    {translateCategory(resolvedItem.category || resolvedItem.type)}
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* Các món đồ mở rộng / tham khảo (không có trong kho) */}
          {untrackedItems.length > 0 && (
            <div className="mt-6 p-4 bg-stone-50 rounded-xl border border-stone-200">
              <h4 className="text-sm font-bold text-gray-900 mb-3 flex items-center gap-1.5">
                <Tag className="w-4 h-4 text-stone-500" />
                Món đồ tham khảo thêm
              </h4>
              <div className="flex flex-wrap gap-2">
                {untrackedItems.map((itemName, idx) => (
                  <span key={idx} className="text-xs text-stone-600 bg-white border border-stone-200/80 px-3 py-1.5 rounded-lg shadow-2xs">
                    {itemName}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {detailGarment && (
        <GarmentDetailModal
          garment={detailGarment}
          onClose={() => setDetailGarment(null)}
          selectedGender={outfit.gender.toLowerCase() === 'female' ? 'Female' : 'Male'}
        />
      )}

      {detailCasual && (
        <CasualDetailModal
          item={detailCasual}
          onClose={() => setDetailCasual(null)}
          selectedGender={outfit.gender.toLowerCase() === 'female' ? 'Female' : 'Male'}
        />
      )}

      {detailAccessory && (
        <AccessoryDetailModal
          accessory={detailAccessory}
          onClose={() => setDetailAccessory(null)}
          selectedGender={outfit.gender.toLowerCase() === 'female' ? 'Female' : 'Male'}
        />
      )}
    </div>
  );
}
