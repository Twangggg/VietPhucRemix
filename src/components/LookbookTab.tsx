import React, { useState } from 'react';
import { Info, ArrowLeft, Sparkles, Layers, SlidersHorizontal } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { CONTEXTS, OUTFIT_COMBINATIONS, GARMENTS, CASUAL_ITEMS, ACCESSORIES } from '../data';
import { OutfitCombination, Gender, Garment, CasualItem, AccessoryItem } from '../types';
import { resolveItemByGender } from '../utils/helpers';
import { GarmentDetailModal } from './GarmentDetailModal';
import { CasualDetailModal } from './CasualDetailModal';
import { AccessoryDetailModal } from './AccessoryDetailModal';
import { LookbookDetail } from './LookbookDetail';

export function LookbookTab() {
  const navigate = useNavigate();
  const [selectedLookbookOutfit, setSelectedLookbookOutfit] = useState<OutfitCombination | null>(null);

  const [detailGarment, setDetailGarment] = useState<Garment | null>(null);
  const [detailCasual, setDetailCasual] = useState<CasualItem | null>(null);
  const [detailAccessory, setDetailAccessory] = useState<AccessoryItem | null>(null);

  const getOutfitItems = (outfit: OutfitCombination) => {
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

  const translateGender = (gender: string) => {
    const g = gender.toLowerCase();
    if (g === 'male') return 'Nam';
    if (g === 'female') return 'Nữ';
    if (g === 'unisex') return 'Phi giới tính';
    return gender;
  };

  const translateCategory = (cat: string) => {
    if (!cat) return '';
    const mapping: Record<string, string> = {
      outer_traditional: 'Khoác ngoài',
      outer_formal: 'Lễ phục',
      top: 'Áo',
      inner: 'Áo lót / Yếm',
      bottom_pants: 'Quần',
      bottom_skirt: 'Chân váy',
      traditional_footwear: 'Giày truyền thống',
      shoes: 'Giày dép',
      headwear: 'Mũ nón',
      jewelry: 'Trang sức',
      bottom: 'Đồ nửa dưới',
      accessories: 'Phụ kiện'
    };
    return mapping[cat] || cat;
  };

  const translateStyle = (style: string) => {
    const styleMap: Record<string, string> = {
      'Royal formal heritage': 'Di sản hoàng triều',
      'Traditional formal elegance': 'Trang trọng truyền thống',
      'Northern folk traditional': 'Dân gian Bắc Bộ',
      'Classic elegant Ao Dai': 'Áo dài cổ điển thanh lịch',
      'Modern gentleman fusion': 'Quý ông hiện đại',
      'Heritage vintage layering': 'Phối lớp di sản cổ điển',
      'Traditional modern fusion': 'Giao thoa truyền thống hiện đại',
      'Neo-traditional classic': 'Cổ điển tân truyền thống',
      'Historic scholarly look': 'Phong thái học giả',
      'Classical ethereal fusion': 'Thanh tao cổ điển',
      'Court ceremony revival': 'Phục hưng nghi lễ cung đình',
      'Regal dynastic elegance': 'Thanh lịch vương triều',
      'Mekong Delta folk charm': 'Duyên dáng Nam Bộ',
      'Rustic southern comfort': 'Mộc mạc phương Nam',
      'Bohemian Oriental modern': 'Hiện đại phương Đông',
      'Contemporary diplomatic minimal': 'Ngoại giao đương đại tối giản',
      'Youthful street-style Ao Dai': 'Áo dài đường phố trẻ trung',
      'Contemporary folk performance': 'Biểu diễn dân gian đương đại',
      'Editorial avant-garde traditional': 'Truyền thống tiên phong',
      'Genderless Zen aesthetic': 'Thẩm mỹ thiền định phi giới tính'
    };
    return styleMap[style] || style;
  };

  const handleRemix = (outfit: OutfitCombination) => {
    sessionStorage.setItem('remixOutfit', JSON.stringify(outfit));
    navigate('/studio');
  };

  return (
    <div className="space-y-6">
      {!selectedLookbookOutfit ? (
        <>
          <div className="border-b border-stone-200/80 pb-4">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight">
              Bản Phối Mẫu Di Sản
            </h2>
            <p className="text-xs sm:text-sm text-stone-500 mt-1 max-w-xl">
              Các công thức phối đồ mẫu chuẩn mực do chuyên gia biên soạn, thỏa mãn tiêu chuẩn văn hóa và phom dáng đương đại.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {OUTFIT_COMBINATIONS.map((outfit) => {
              return (
                <div
                  key={outfit.id}
                  className="bg-white rounded-3xl overflow-hidden border border-stone-200/80 shadow-sm flex flex-col group hover:shadow-md transition-all duration-300"
                >
                  <div className="w-full bg-stone-50 border-b border-stone-200/80 p-4 flex flex-wrap gap-3 justify-center items-center min-h-[200px]">
                    {getOutfitItems(outfit).slice(0, 5).map(({ resolvedItem }, idx) => (
                      <div key={`${resolvedItem.id}-${idx}`} className="w-16 h-16 sm:w-20 sm:h-20 bg-white rounded-xl shadow-sm border border-stone-200 p-1.5 flex items-center justify-center">
                        {resolvedItem.resolvedImageUrl ? (
                          <img
                            src={resolvedItem.resolvedImageUrl}
                            alt={resolvedItem.name}
                            className="max-w-full max-h-full object-contain mix-blend-multiply"
                          />
                        ) : (
                          <Sparkles className="w-6 h-6 text-stone-300" />
                        )}
                      </div>
                    ))}
                    {getOutfitItems(outfit).length > 5 && (
                      <div className="w-16 h-16 sm:w-20 sm:h-20 bg-stone-100 rounded-xl border border-stone-200 flex items-center justify-center">
                        <span className="text-stone-500 font-medium text-sm">+{getOutfitItems(outfit).length - 5}</span>
                      </div>
                    )}
                  </div>

                  <div className="p-6 sm:p-8 flex-1 flex flex-col justify-between space-y-5">
                    <div className="space-y-3">
                      <span className="text-xs font-sans text-red-700 font-semibold tracking-wider uppercase block">
                        Bản phối tiêu biểu
                      </span>
                      <h3 className="text-2xl font-bold text-gray-900 tracking-tight leading-tight">
                        {outfit.name}
                      </h3>
                      <p className="text-xs sm:text-sm text-gray-600 italic">
                        "{outfit.traditional_focus}"
                      </p>

                      <div className="pt-2 flex flex-wrap gap-2">
                        <span className="text-[11px] font-sans text-stone-600 bg-stone-100 px-2.5 py-1 rounded-md">
                          #{translateStyle(outfit.style)}
                        </span>
                        <span className="text-[11px] font-sans text-stone-600 bg-stone-100 px-2.5 py-1 rounded-md">
                          #{translateGender(outfit.gender)}
                        </span>
                      </div>
                    </div>

                    <div className="pt-4 border-t border-stone-100 flex items-center justify-between">
                      <span className="text-xs text-gray-400 font-sans truncate flex-1 min-w-0 pr-2">
                        {outfit.applicable_events.map(id => CONTEXTS.find(c => c.id === id)?.name || id).join(', ')}
                      </span>
                      <div className="flex gap-2 shrink-0">
                        <button
                          onClick={() => handleRemix(outfit)}
                          className="px-3 py-2 rounded-xl bg-stone-900 hover:bg-stone-800 text-white text-xs font-semibold shadow-sm transition-all flex items-center gap-1.5 shrink-0"
                          title="Phối lại"
                        >
                          <SlidersHorizontal className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => setSelectedLookbookOutfit(outfit)}
                          className="px-4 py-2 rounded-xl bg-red-700 hover:bg-red-800 text-white text-xs font-semibold shadow-sm transition-all flex items-center gap-1.5 shrink-0"
                        >
                          <Info className="w-3.5 h-3.5" />
                          <span>Chi tiết</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </>
      ) : (
        <LookbookDetail
          outfit={selectedLookbookOutfit}
          onBack={() => setSelectedLookbookOutfit(null)}
          onRemix={handleRemix}
          translateStyle={translateStyle}
          translateGender={translateGender}
          translateCategory={translateCategory}
        />
      )}
    </div>
  );
}
