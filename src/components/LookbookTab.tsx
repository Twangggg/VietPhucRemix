import React, { useState, useEffect } from 'react';
import {
  Info,
  ArrowLeft,
  Sparkles,
  Layers,
  Bookmark,
  Share2,
  Trash2,
  ExternalLink,
  Copy,
  Check,
  Palette,
  SlidersHorizontal,
  Clock,
  User,
  Heart,
  Code
} from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { CONTEXTS, OUTFIT_COMBINATIONS, GARMENTS, CASUAL_ITEMS, ACCESSORIES } from '../data';
import { OutfitCombination, Gender, SavedLookbook } from '../types';
import { resolveItemByGender, getSafeImageUrl } from '../utils/helpers';
import { SafeImage } from './SafeImage';
import { TintedImage } from './TintedImage';
import {
  getSavedLookbooks,
  saveLookbook,
  deleteLookbook,
  decodeOutfitFromShareString,
  encodeOutfitToShareUrl
} from '../utils/lookbookStore';

export function LookbookTab() {
  const navigate = useNavigate();
  const location = useLocation();

  const [savedLookbooks, setSavedLookbooks] = useState<SavedLookbook[]>(() => getSavedLookbooks());
  const [activeSubTab, setActiveSubTab] = useState<'curated' | 'my_lookbooks'>(() => {
    // Nếu có lookbook người dùng đã lưu hoặc URL có search param, mở ngay tab cá nhân
    const initialSaved = getSavedLookbooks();
    return initialSaved.length > 0 ? 'my_lookbooks' : 'curated';
  });
  const [selectedCuratedOutfit, setSelectedCuratedOutfit] = useState<OutfitCombination | null>(null);
  const [selectedSavedLookbook, setSelectedSavedLookbook] = useState<SavedLookbook | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [isSharedTempOutfit, setIsSharedTempOutfit] = useState<boolean>(false);
  const [saveSuccessNotice, setSaveSuccessNotice] = useState<string | null>(null);

  // Modal Nhập mã chia sẻ bộ phối
  const [showImportModal, setShowImportModal] = useState<boolean>(false);
  const [importCodeInput, setImportCodeInput] = useState<string>('');
  const [importError, setImportError] = useState<string | null>(null);

  // Load danh sách Lookbook cá nhân
  const refreshSavedLookbooks = () => {
    setSavedLookbooks(getSavedLookbooks());
  };

  useEffect(() => {
    refreshSavedLookbooks();
  }, []);

  // Kiểm tra nếu có shared string trên URL query params (ví dụ: ?shared=...)
  useEffect(() => {
    // Trích xuất shared param từ cả query string và hash (đề phòng link dạng /lookbook?shared= hoặc /#/lookbook?shared=)
    const urlParams = new URLSearchParams(location.search);
    let sharedParam = urlParams.get('shared');
    if (!sharedParam && window.location.hash.includes('shared=')) {
      const hashPart = window.location.hash.split('?')[1];
      if (hashPart) {
        sharedParam = new URLSearchParams(hashPart).get('shared');
      }
    }

    if (sharedParam) {
      const decoded = decodeOutfitFromShareString(sharedParam);
      if (decoded) {
        // Tự động tạo một temporary lookbook và mở chi tiết
        const tempLookbook: SavedLookbook = {
          id: 'shared_outfit',
          title: decoded.title || 'Bản phối được bạn bè chia sẻ',
          notes: decoded.notes || 'Bản phối được bạn bè chia sẻ qua liên kết trực tiếp.',
          createdAt: Date.now(),
          gender: decoded.gender === 'male' ? 'Male' : 'Female',
          contextId: decoded.contextId,
          garmentId: decoded.garmentId,
          innerId: decoded.innerId,
          bottomId: decoded.bottomId,
          shoesId: decoded.shoesId,
          headwearId: decoded.headwearId,
          jewelryIds: decoded.jewelryIds,
          itemColors: decoded.itemColors
        };
        setSelectedSavedLookbook(tempLookbook);
        setIsSharedTempOutfit(true);
        setActiveSubTab('my_lookbooks');
      }
    }
  }, [location.search]);

  // Xử lý lưu bản phối được bạn bè chia sẻ vào bộ sưu tập của mình
  const handleSaveSharedLookbook = () => {
    if (!selectedSavedLookbook) return;
    saveLookbook({
      title: selectedSavedLookbook.title,
      notes: selectedSavedLookbook.notes,
      authorName: selectedSavedLookbook.authorName,
      gender: selectedSavedLookbook.gender,
      contextId: selectedSavedLookbook.contextId,
      garmentId: selectedSavedLookbook.garmentId,
      innerId: selectedSavedLookbook.innerId,
      bottomId: selectedSavedLookbook.bottomId,
      shoesId: selectedSavedLookbook.shoesId,
      headwearId: selectedSavedLookbook.headwearId,
      jewelryIds: selectedSavedLookbook.jewelryIds,
      itemColors: selectedSavedLookbook.itemColors
    });
    refreshSavedLookbooks();
    setIsSharedTempOutfit(false);
    setSaveSuccessNotice('Đã lưu bản phối vào Lookbook của bạn thành công!');
    setTimeout(() => setSaveSuccessNotice(null), 3000);
  };

  // Xử lý nạp mã chia sẻ hoặc link chia sẻ từ bạn bè
  const handleImportOutfit = (e: React.FormEvent) => {
    e.preventDefault();
    setImportError(null);
    let code = importCodeInput.trim();
    if (!code) return;

    // Nếu người dùng dán cả URL (ví dụ: https://.../lookbook?shared=xyz)
    if (code.includes('shared=')) {
      const match = code.match(/shared=([^&#\s]+)/);
      if (match && match[1]) {
        code = match[1];
      }
    }

    const decoded = decodeOutfitFromShareString(code);
    if (!decoded) {
      setImportError('Mã chia sẻ không hợp lệ hoặc đã bị lỗi cú pháp.');
      return;
    }

    const importedOutfit: SavedLookbook = {
      id: `shared_${Date.now()}`,
      title: decoded.title || 'Bản phối được bạn bè chia sẻ',
      notes: decoded.notes || 'Bản phối nạp từ mã chia sẻ.',
      createdAt: Date.now(),
      gender: decoded.gender === 'male' ? 'Male' : 'Female',
      contextId: decoded.contextId,
      garmentId: decoded.garmentId,
      innerId: decoded.innerId,
      bottomId: decoded.bottomId,
      shoesId: decoded.shoesId,
      headwearId: decoded.headwearId,
      jewelryIds: decoded.jewelryIds,
      itemColors: decoded.itemColors
    };

    // Tự động lưu luôn vào lookbook cá nhân
    saveLookbook({
      title: importedOutfit.title,
      notes: importedOutfit.notes,
      gender: importedOutfit.gender,
      contextId: importedOutfit.contextId,
      garmentId: importedOutfit.garmentId,
      innerId: importedOutfit.innerId,
      bottomId: importedOutfit.bottomId,
      shoesId: importedOutfit.shoesId,
      headwearId: importedOutfit.headwearId,
      jewelryIds: importedOutfit.jewelryIds,
      itemColors: importedOutfit.itemColors
    });
    refreshSavedLookbooks();

    setSelectedSavedLookbook(importedOutfit);
    setIsSharedTempOutfit(false);
    setShowImportModal(false);
    setImportCodeInput('');
    setSaveSuccessNotice('Đã nạp và lưu bản phối thành công!');
    setTimeout(() => setSaveSuccessNotice(null), 3000);
  };

  const handleDeleteSaved = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (window.confirm('Bạn có chắc chắn muốn xóa bản phối này khỏi Lookbook?')) {
      deleteLookbook(id);
      refreshSavedLookbooks();
      if (selectedSavedLookbook?.id === id) {
        setSelectedSavedLookbook(null);
      }
    }
  };

  const handleCopyLink = async (lookbook: SavedLookbook, e: React.MouseEvent) => {
    e.stopPropagation();
    const shareUrl = encodeOutfitToShareUrl({
      g: lookbook.garmentId,
      ctx: lookbook.contextId,
      inn: lookbook.innerId,
      bot: lookbook.bottomId,
      sh: lookbook.shoesId,
      hw: lookbook.headwearId,
      jw: lookbook.jewelryIds,
      gen: lookbook.gender.toLowerCase(),
      col: lookbook.itemColors,
      title: lookbook.title,
      notes: lookbook.notes
    });

    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopiedId(lookbook.id);
      setTimeout(() => setCopiedId(null), 2500);
    } catch {
      setCopiedId(lookbook.id);
      setTimeout(() => setCopiedId(null), 2500);
    }
  };

  // Mở bản phối trong phòng phối đồ Studio
  const handleOpenInStudio = (lookbook: SavedLookbook) => {
    navigate('/studio', {
      state: {
        presetGarmentId: lookbook.garmentId,
        presetContextId: lookbook.contextId,
        presetInnerId: lookbook.innerId,
        presetBottomId: lookbook.bottomId,
        presetShoesId: lookbook.shoesId,
        presetHeadwearId: lookbook.headwearId,
        presetJewelryIds: lookbook.jewelryIds,
        presetGender: lookbook.gender.toLowerCase(),
        presetColors: lookbook.itemColors
      }
    });
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

  // Nếu đang xem chi tiết bản phối tiêu biểu (Curated Outfit)
  if (selectedCuratedOutfit) {
    return (
      <div className="space-y-6 animate-in fade-in-50 duration-200">
        <button
          onClick={() => setSelectedCuratedOutfit(null)}
          className="flex items-center text-sm font-semibold text-stone-600 hover:text-red-700 transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4 mr-1.5" />
          Quay lại danh sách
        </button>

        <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-stone-200">
          <div className="flex flex-col md:flex-row gap-8 lg:gap-12">
            <div className="w-full md:w-1/2 lg:w-5/12">
              <div className="aspect-[3/4] rounded-2xl overflow-hidden bg-stone-100 shadow-inner relative">
                <SafeImage
                  src={`/assets/outfits/${selectedCuratedOutfit.id.toLowerCase()}.png`}
                  alt={selectedCuratedOutfit.name}
                  fallbackText={selectedCuratedOutfit.name}
                  expectedPath={`/assets/outfits/${selectedCuratedOutfit.id.toLowerCase()}.png`}
                  className="w-full h-full object-cover"
                />
              </div>
            </div>

            <div className="w-full md:w-1/2 lg:w-7/12 flex flex-col justify-between">
              <div className="space-y-4">
                <span className="text-xs font-sans text-red-700 font-semibold tracking-wider uppercase block">
                  Bản phối tiêu biểu
                </span>
                <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 tracking-tight leading-tight">
                  {selectedCuratedOutfit.name}
                </h2>

                <div className="flex flex-wrap gap-2 pt-1 pb-3">
                  <span className="text-xs font-sans text-stone-700 bg-stone-100 px-3 py-1.5 rounded-lg border border-stone-200/60">
                    <strong>Phong cách:</strong> {translateStyle(selectedCuratedOutfit.style)}
                  </span>
                  <span className="text-xs font-sans text-stone-700 bg-stone-100 px-3 py-1.5 rounded-lg border border-stone-200/60">
                    <strong>Giới tính:</strong> {translateGender(selectedCuratedOutfit.gender)}
                  </span>
                </div>

                <div className="bg-stone-50 p-5 rounded-2xl border border-stone-200/60 space-y-3">
                  <div>
                    <h4 className="text-sm font-bold text-gray-900 mb-1 flex items-center gap-1.5">
                      <Info className="w-4 h-4 text-red-700" /> Điểm nhấn truyền thống
                    </h4>
                    <p className="text-sm text-gray-700 leading-relaxed italic">
                      "{selectedCuratedOutfit.traditional_focus}"
                    </p>
                  </div>
                  <div className="border-t border-stone-200/60 pt-3">
                    <h4 className="text-sm font-bold text-gray-900 mb-1 flex items-center gap-1.5">
                      <Sparkles className="w-4 h-4 text-red-700" /> Ghi chú phối đồ
                    </h4>
                    <p className="text-sm text-gray-700 leading-relaxed">
                      {selectedCuratedOutfit.styling_notes}
                    </p>
                  </div>
                </div>

                <div className="pt-2">
                  <h4 className="text-sm font-bold text-gray-900 mb-2">Bối cảnh đề xuất:</h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedCuratedOutfit.applicable_events.map((id) => {
                      const ctx = CONTEXTS.find((c) => c.id === id);
                      return (
                        <span
                          key={id}
                          className="text-xs text-stone-600 bg-white border border-stone-200 px-2.5 py-1 rounded-md shadow-xs"
                        >
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
              {(() => {
                const comp = selectedCuratedOutfit.composition;
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

                return itemIds.map((id, index) => {
                  const item =
                    GARMENTS.find((g) => g.id === id) ||
                    CASUAL_ITEMS.find((c) => c.id === id) ||
                    ACCESSORIES.find((a) => a.id === id);
                  if (!item) return null;

                  const genderStr =
                    selectedCuratedOutfit.gender.toLowerCase() === 'female' ? 'Female' : 'Male';
                  const resolvedItem = resolveItemByGender(item as any, genderStr as Gender);

                  return (
                    <div
                      key={`${id}-${index}`}
                      className="bg-stone-50 rounded-xl overflow-hidden border border-stone-200 flex flex-col"
                    >
                      <div className="aspect-square bg-white relative p-2 flex items-center justify-center">
                        {resolvedItem.resolvedImageUrl ? (
                          <img
                            src={resolvedItem.resolvedImageUrl}
                            alt={resolvedItem.name}
                            className="max-w-full max-h-full object-contain mix-blend-multiply"
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
                  );
                });
              })()}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Nếu đang xem chi tiết bản phối cá nhân (Saved Lookbook Detail)
  if (selectedSavedLookbook) {
    const gItem = GARMENTS.find((g) => g.id === selectedSavedLookbook.garmentId);
    const innItem = CASUAL_ITEMS.find((c) => c.id === selectedSavedLookbook.innerId);
    const botItem = CASUAL_ITEMS.find((c) => c.id === selectedSavedLookbook.bottomId);
    const shItem =
      GARMENTS.find((g) => g.id === selectedSavedLookbook.shoesId) ||
      CASUAL_ITEMS.find((c) => c.id === selectedSavedLookbook.shoesId);
    const hwItem = ACCESSORIES.find((a) => a.id === selectedSavedLookbook.headwearId);
    const jwItems = (selectedSavedLookbook.jewelryIds || [])
      .map((jid) => ACCESSORIES.find((a) => a.id === jid))
      .filter(Boolean);
    const ctxItem = CONTEXTS.find((c) => c.id === selectedSavedLookbook.contextId);

    const resolvedG = gItem
      ? resolveItemByGender(gItem, selectedSavedLookbook.gender)
      : null;

    const allItems = [
      gItem && { item: gItem, label: 'Cổ phục chính' },
      innItem && { item: innItem, label: 'Áo mặc trong' },
      botItem && { item: botItem, label: 'Quần / Váy' },
      shItem && { item: shItem, label: 'Giày dép' },
      hwItem && { item: hwItem, label: 'Mũ nón' },
      ...jwItems.map((j) => ({ item: j!, label: 'Trang sức' }))
    ].filter(Boolean) as Array<{ item: any; label: string }>;

    return (
      <div className="space-y-6 animate-in fade-in-50 duration-200">
        <div className="flex items-center justify-between">
          <button
            onClick={() => setSelectedSavedLookbook(null)}
            className="flex items-center text-sm font-semibold text-stone-600 hover:text-red-700 transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4 mr-1.5" />
            Quay lại Lookbook
          </button>

          <div className="flex items-center gap-2">
            {isSharedTempOutfit && (
              <button
                onClick={handleSaveSharedLookbook}
                className="px-3.5 py-1.5 rounded-full bg-red-700 hover:bg-red-800 text-xs font-semibold text-white flex items-center gap-1.5 shadow-xs cursor-pointer transition-all active:scale-95"
              >
                <Bookmark className="w-3.5 h-3.5" />
                <span>Lưu vào Lookbook của tôi</span>
              </button>
            )}

            <button
              onClick={(e) => handleCopyLink(selectedSavedLookbook, e)}
              className="px-3 py-1.5 rounded-full border border-stone-200 hover:border-stone-400 bg-white text-xs font-semibold text-stone-700 flex items-center gap-1.5 shadow-xs cursor-pointer"
            >
              {copiedId === selectedSavedLookbook.id ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                  <span className="text-emerald-700">Đã chép link!</span>
                </>
              ) : (
                <>
                  <Share2 className="w-3.5 h-3.5 text-stone-500" />
                  <span>Chia sẻ link</span>
                </>
              )}
            </button>

            <button
              onClick={() => handleOpenInStudio(selectedSavedLookbook)}
              className="px-4 py-1.5 rounded-full bg-stone-900 hover:bg-stone-800 text-xs font-semibold text-white flex items-center gap-1.5 shadow-xs cursor-pointer"
            >
              <SlidersHorizontal className="w-3.5 h-3.5" />
              <span>Mở trong Studio</span>
            </button>
          </div>
        </div>

        {saveSuccessNotice && (
          <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-2xl text-xs font-medium flex items-center gap-2 animate-in fade-in">
            <Check className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{saveSuccessNotice}</span>
          </div>
        )}

        {isSharedTempOutfit && !saveSuccessNotice && (
          <div className="p-3 bg-amber-50 border border-amber-200 text-amber-900 rounded-2xl text-xs font-medium flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-600 shrink-0" />
              <span>Bạn đang xem bản phối được chia sẻ từ bạn bè qua liên kết trực tiếp.</span>
            </div>
            <button
              onClick={handleSaveSharedLookbook}
              className="px-3 py-1 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-xl text-[11px] shrink-0"
            >
              Lưu ngay
            </button>
          </div>
        )}

        {/* Thẻ Lookbook Nghệ Thuật */}
        <div className="bg-[#FAF7F2] rounded-3xl p-6 sm:p-10 border border-stone-200/80 shadow-xs space-y-8">
          <div className="text-center space-y-2 max-w-xl mx-auto">
            <span className="text-[10px] font-mono uppercase tracking-[0.25em] text-red-800 font-bold block">
              BỘ SƯU TẬP VIỆT PHỤC CÁ NHÂN
            </span>
            <h2 className="text-2xl sm:text-3xl font-serif font-bold text-stone-900">
              {selectedSavedLookbook.title}
            </h2>
            {selectedSavedLookbook.authorName && (
              <p className="text-xs text-stone-500 font-sans flex items-center justify-center gap-1">
                <User className="w-3.5 h-3.5" /> Phối bởi: <strong>{selectedSavedLookbook.authorName}</strong>
              </p>
            )}
            {selectedSavedLookbook.notes && (
              <p className="text-sm text-stone-600 italic bg-white/60 p-4 rounded-2xl border border-stone-200/60 max-w-lg mx-auto">
                "{selectedSavedLookbook.notes}"
              </p>
            )}
          </div>

          {/* Canvas Flatlay Hero */}
          <div className="flex flex-col items-center justify-center">
            {resolvedG && (
              <div className="w-56 sm:w-72 aspect-[3/4] relative flex items-center justify-center">
                <TintedImage
                  src={getSafeImageUrl(resolvedG.resolvedImageUrl || resolvedG)}
                  colorHex={selectedSavedLookbook.itemColors?.[gItem?.id || '']?.hex || null}
                  intensity={selectedSavedLookbook.itemColors?.[gItem?.id || '']?.intensity || 0.85}
                  alt={resolvedG.name}
                  className="w-full h-full"
                  imgClassName="mix-blend-multiply object-contain object-center drop-shadow-md"
                />
              </div>
            )}
          </div>

          {/* Các chi tiết phối đi kèm */}
          <div className="border-t border-stone-200/80 pt-6">
            <h4 className="text-xs font-mono uppercase tracking-wider text-stone-500 font-semibold mb-4 text-center">
              CÁC MÓN ĐỒ TRONG BỘ PHỐI ({allItems.length})
            </h4>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
              {allItems.map(({ item, label }, idx) => {
                const resolved = resolveItemByGender(item, selectedSavedLookbook.gender);
                const colorSetting = selectedSavedLookbook.itemColors?.[item.id];

                return (
                  <div
                    key={`${item.id}-${idx}`}
                    className="bg-white rounded-2xl p-3 border border-stone-200/70 flex flex-col items-center text-center shadow-xs"
                  >
                    <div className="w-20 h-20 relative flex items-center justify-center mb-2">
                      <TintedImage
                        src={getSafeImageUrl(resolved.resolvedImageUrl || resolved)}
                        colorHex={colorSetting?.hex || null}
                        intensity={colorSetting?.intensity || 0.85}
                        alt={resolved.name}
                        className="w-full h-full"
                        imgClassName="mix-blend-multiply object-contain object-center"
                      />
                    </div>
                    <span className="text-[10px] text-red-700 font-semibold font-sans">{label}</span>
                    <h5 className="text-xs font-bold text-stone-900 line-clamp-1 mt-0.5">{resolved.name}</h5>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* HEADER LOOKBOOK VỚI 2 SUB-TABS: BẢN PHỐI MẪU & BẢN PHỐI CỦA TÔI */}
      <div className="border-b border-stone-200/80 pb-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl sm:text-3xl font-serif font-bold text-gray-900 tracking-tight">
            Lookbook Việt Phục
          </h2>
          <p className="text-xs sm:text-sm text-stone-500 mt-1 max-w-xl font-sans">
            Khám phá những công thức phối đồ di sản mẫu và bộ sưu tập phối đồ riêng do bạn sáng tạo.
          </p>
        </div>

        {/* Tab Switcher & Nhập mã phối đồ */}
        <div className="flex flex-wrap items-center gap-2 self-start sm:self-auto">
          <div className="flex items-center bg-stone-100 p-1 rounded-2xl border border-stone-200/70 shrink-0">
            <button
              type="button"
              onClick={() => setActiveSubTab('curated')}
              className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                activeSubTab === 'curated'
                  ? 'bg-white text-stone-900 shadow-xs'
                  : 'text-stone-500 hover:text-stone-800'
              }`}
            >
              Bản phối mẫu ({OUTFIT_COMBINATIONS.length})
            </button>
            <button
              type="button"
              onClick={() => setActiveSubTab('my_lookbooks')}
              className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer ${
                activeSubTab === 'my_lookbooks'
                  ? 'bg-white text-stone-900 shadow-xs'
                  : 'text-stone-500 hover:text-stone-800'
              }`}
            >
              <Bookmark className="w-3.5 h-3.5 text-red-700" />
              <span>Lookbook của tôi ({savedLookbooks.length})</span>
            </button>
          </div>

          <button
            type="button"
            onClick={() => {
              setImportError(null);
              setImportCodeInput('');
              setShowImportModal(true);
            }}
            className="px-3.5 py-2 rounded-2xl border border-stone-200 hover:border-stone-400 bg-white text-stone-700 text-xs font-semibold shadow-xs flex items-center gap-1.5 transition-all cursor-pointer"
            title="Nhập mã hoặc liên kết chia sẻ từ bạn bè"
          >
            <Share2 className="w-3.5 h-3.5 text-red-700" />
            <span>Nhập mã phối đồ</span>
          </button>
        </div>
      </div>

      {/* NỘI DUNG SUB-TAB 1: BẢN PHỐI TIÊU BIỂU (CURATED LOOKBOOK) */}
      {activeSubTab === 'curated' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 animate-in fade-in-50 duration-200">
          {OUTFIT_COMBINATIONS.map((outfit) => {
            return (
              <div
                key={outfit.id}
                className="bg-white rounded-3xl overflow-hidden border border-stone-200/80 shadow-sm flex flex-col group hover:shadow-md transition-all duration-300"
              >
                <div className="aspect-[4/3] sm:aspect-[16/10] w-full overflow-hidden bg-stone-100 relative">
                  <SafeImage
                    src={`/assets/outfits/${outfit.id.toLowerCase()}.png`}
                    alt={outfit.name}
                    fallbackText={outfit.name}
                    expectedPath={`/assets/outfits/${outfit.id.toLowerCase()}.png`}
                    className="w-full h-full"
                  />
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
                    <span className="text-xs text-gray-400 font-sans truncate pr-2">
                      {outfit.applicable_events
                        .map((id) => CONTEXTS.find((c) => c.id === id)?.name || id)
                        .join(', ')}
                    </span>
                    <button
                      onClick={() => setSelectedCuratedOutfit(outfit)}
                      className="px-4 py-2 rounded-xl bg-red-700 hover:bg-red-800 text-white text-xs font-semibold shadow-sm transition-all flex items-center gap-1.5 shrink-0 cursor-pointer"
                    >
                      <Info className="w-3.5 h-3.5" />
                      <span>Xem chi tiết bản phối</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* NỘI DUNG SUB-TAB 2: LOOKBOOK CỦA TÔI (USER CREATED LOOKBOOKS) */}
      {activeSubTab === 'my_lookbooks' && (
        <div className="space-y-6 animate-in fade-in-50 duration-200">
          {savedLookbooks.length === 0 ? (
            <div className="text-center py-16 px-4 bg-stone-50 rounded-3xl border border-dashed border-stone-300 space-y-4">
              <div className="w-14 h-14 rounded-full bg-red-50 text-red-700 flex items-center justify-center mx-auto">
                <Bookmark className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <h3 className="text-base sm:text-lg font-serif font-bold text-stone-900">
                  Chưa có bản phối nào trong Lookbook
                </h3>
                <p className="text-xs sm:text-sm text-stone-500 max-w-md mx-auto font-sans">
                  Hãy vào <strong>Phòng Phối Đồ (Studio)</strong>, tự tay sáng tạo bộ Việt Phục theo phong cách của bạn và nhấn <strong>"Lưu Lookbook"</strong> để trưng bày tại đây!
                </p>
              </div>
              <button
                type="button"
                onClick={() => navigate('/studio')}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-red-700 hover:bg-red-800 text-white text-xs font-semibold shadow-xs transition-all cursor-pointer active:scale-95"
              >
                <SlidersHorizontal className="w-3.5 h-3.5" />
                <span>Đến Studio Phối Đồ Ngay</span>
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {savedLookbooks.map((lb) => {
                const garment = GARMENTS.find((g) => g.id === lb.garmentId);
                const resolvedG = garment ? resolveItemByGender(garment, lb.gender) : null;
                const dateStr = new Date(lb.createdAt).toLocaleDateString('vi-VN', {
                  day: '2-digit',
                  month: '2-digit',
                  year: 'numeric'
                });

                return (
                  <div
                    key={lb.id}
                    onClick={() => setSelectedSavedLookbook(lb)}
                    className="bg-white rounded-3xl border border-stone-200/80 shadow-xs hover:shadow-md hover:-translate-y-1 transition-all duration-300 cursor-pointer overflow-hidden flex flex-col justify-between group"
                  >
                    <div>
                      {/* Hero Image Container */}
                      <div className="aspect-[4/3] bg-[#FAF8F5] relative p-4 flex items-center justify-center overflow-hidden border-b border-stone-100">
                        {resolvedG ? (
                          <TintedImage
                            src={getSafeImageUrl(resolvedG.resolvedImageUrl || resolvedG)}
                            colorHex={lb.itemColors?.[garment?.id || '']?.hex || null}
                            intensity={lb.itemColors?.[garment?.id || '']?.intensity || 0.85}
                            alt={lb.title}
                            className="w-full h-full flex items-center justify-center"
                            imgClassName="mix-blend-multiply object-contain object-center group-hover:scale-105 transition-transform duration-500"
                          />
                        ) : (
                          <Sparkles className="w-10 h-10 text-stone-300" />
                        )}

                        <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-xs px-2.5 py-1 rounded-full text-[10px] font-sans font-semibold text-stone-700 border border-stone-200 shadow-xs">
                          Phom {lb.gender === 'Male' ? 'Nam' : 'Nữ'}
                        </div>
                      </div>

                      {/* Thông tin mô tả */}
                      <div className="p-5 space-y-2">
                        <h4 className="text-base font-serif font-bold text-stone-900 group-hover:text-red-700 transition-colors line-clamp-1">
                          {lb.title}
                        </h4>

                        {lb.notes ? (
                          <p className="text-xs text-stone-500 font-sans line-clamp-2 leading-relaxed">
                            {lb.notes}
                          </p>
                        ) : (
                          <p className="text-xs text-stone-400 font-sans italic">
                            Chưa có ghi chú cảm hứng
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Footer thanh thao tác */}
                    <div className="p-4 pt-2 border-t border-stone-100 flex items-center justify-between text-xs text-stone-400">
                      <span className="flex items-center gap-1 font-mono text-[11px]">
                        <Clock className="w-3 h-3 text-stone-400" />
                        {dateStr}
                      </span>

                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={(e) => handleCopyLink(lb, e)}
                          title="Sao chép link chia sẻ"
                          className="p-1.5 rounded-lg hover:bg-stone-100 text-stone-600 hover:text-stone-900 transition-colors"
                        >
                          {copiedId === lb.id ? (
                            <Check className="w-4 h-4 text-emerald-600" />
                          ) : (
                            <Share2 className="w-4 h-4" />
                          )}
                        </button>

                        <button
                          type="button"
                          onClick={(e) => handleDeleteSaved(lb.id, e)}
                          title="Xóa khỏi Lookbook"
                          className="p-1.5 rounded-lg hover:bg-red-50 text-stone-400 hover:text-red-600 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* MODAL NHẬP MÃ CHIA SẺ PHỐI ĐỒ */}
      {showImportModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl border border-stone-200 overflow-hidden">
            <div className="px-6 py-4 bg-stone-50 border-b border-stone-200 flex items-center justify-between">
              <h3 className="font-serif font-bold text-stone-900 flex items-center gap-2">
                <Code className="w-4 h-4 text-red-700" />
                Nhập mã phối đồ
              </h3>
              <button
                type="button"
                onClick={() => {
                  setShowImportModal(false);
                  setImportError(null);
                }}
                className="text-stone-400 hover:text-stone-700 text-lg font-bold p-1"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleImportOutfit} className="p-6 space-y-4">
              <p className="text-xs text-stone-600 leading-relaxed">
                Dán đường dẫn chia sẻ hoặc chuỗi mã phối đồ được bạn bè gửi để xem và lưu vào bộ sưu tập cá nhân:
              </p>

              <div>
                <textarea
                  rows={4}
                  value={importCodeInput}
                  onChange={(e) => setImportCodeInput(e.target.value)}
                  placeholder="Ví dụ: eyJnIjoiZ2FybWVudC1uZ3UtdGhhbiIsImN0eCI..."
                  className="w-full text-xs font-mono p-3 bg-stone-50 border border-stone-300 rounded-xl focus:ring-2 focus:ring-red-600 focus:outline-none"
                  autoFocus
                />
              </div>

              {importError && (
                <p className="text-xs text-red-600 font-medium bg-red-50 p-2.5 rounded-lg border border-red-100">
                  {importError}
                </p>
              )}

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowImportModal(false);
                    setImportError(null);
                  }}
                  className="px-4 py-2 text-xs font-medium text-stone-600 hover:bg-stone-100 rounded-xl transition-colors"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={!importCodeInput.trim()}
                  className="px-5 py-2 text-xs font-bold text-white bg-red-700 hover:bg-red-800 disabled:opacity-50 rounded-xl shadow-md transition-all flex items-center gap-1.5"
                >
                  Xem bản phối
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
