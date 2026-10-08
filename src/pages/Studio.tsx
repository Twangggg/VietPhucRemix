import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import {
  Sparkles,
  ShieldCheck,
  Check,
  X,
  Compass,
  Shirt,
  Layers,
  Crown,
  ChevronRight,
  ChevronLeft,
  ChevronUp,
  ChevronDown,
  Footprints,
  RotateCcw,
  AlertTriangle,
  Info
} from 'lucide-react';
import { GARMENTS, CASUAL_ITEMS, ACCESSORIES, CONTEXTS } from '../data';
import { resolveItemByGender, getSafeImageUrl } from '../utils/helpers';
import { validateOutfit } from '../utils/validationEngine';
import { findQuickMatchOutfit, getQuickMatchSuggestion } from '../utils/recommendationEngine';
import { ValidationResult, Garment, CasualItem, AccessoryItem } from '../types';
import { ItemSelectCard } from '../components/ItemSelectCard';
import { SafeImage } from '../components/SafeImage';
import { OutfitResultView, SaveNotice } from '../components/OutfitResultView';
import { GarmentDetailModal } from '../components/GarmentDetailModal';
import { CasualDetailModal } from '../components/CasualDetailModal';
import { AccessoryDetailModal } from '../components/AccessoryDetailModal';
import { ColorCustomizerModal } from '../components/ColorCustomizerModal';
import { saveOutfit, getSavedOutfits, isSameOutfit, areColorsEqual } from '../utils/storage';

export const Studio: React.FC = () => {
  const location = useLocation();

  // ==========================================
  // STATE MANAGEMENT CHO STUDIO
  // ==========================================
  const [selectedGender, setSelectedGender] = useState<'male' | 'female'>('female');
  const [activeTab, setActiveTab] = useState<number>(1); // 1: Bối cảnh | 2: Cổ phục | 3: Mặc kèm | 4: Phụ kiện

  // Các state lưu ID item đã chọn
  const [selectedContext, setSelectedContext] = useState<string | null>(null);
  const [selectedGarments, setSelectedGarments] = useState<string[]>([]);
  const [selectedInner, setSelectedInner] = useState<string | null>(null);
  const [selectedBottom, setSelectedBottom] = useState<string | null>(null);
  const [selectedShoes, setSelectedShoes] = useState<string | null>(null);
  const [selectedHeadwear, setSelectedHeadwear] = useState<string | null>(null);
  const [selectedJewelries, setSelectedJewelries] = useState<string[]>([]);

  // Tự động load bản phối từ Lookbook nếu được truyền qua navigate(state)
  useEffect(() => {
    const state = location.state as any;
    if (state && state.presetGarmentId) {
      if (state.presetGender) {
        setSelectedGender(state.presetGender);
      }
      setSelectedGarments(Array.isArray(state.presetGarmentId) ? state.presetGarmentId : [state.presetGarmentId]);
      setSelectedContext(state.presetContextId || null);
      setSelectedInner(state.presetInnerId || null);
      setSelectedBottom(state.presetBottomId || null);
      setSelectedShoes(state.presetShoesId || null);
      setSelectedHeadwear(state.presetHeadwearId || null);
      setSelectedJewelries(state.presetJewelryIds || []);
      // Mở ngay tab phù hợp hoặc trực tiếp kết quả nếu người dùng muốn
      setActiveTab(3);
    }
  }, [location.state]);

  const [previewGarment, setPreviewGarment] = useState<Garment | null>(null);
  const [previewCasual, setPreviewCasual] = useState<CasualItem | null>(null);
  const [previewAccessory, setPreviewAccessory] = useState<AccessoryItem | null>(null);

  // State quản lý màu sắc tùy biến theo từng món trong Studio (ID -> { hex, intensity })
  const [itemColors, setItemColors] = useState<Record<string, { hex: string | null; intensity: number }>>({});
  const [colorCustomizerTarget, setColorCustomizerTarget] = useState<{
    id: string;
    name: string;
    categoryName: string;
    imageUrl: string;
  } | null>(null);

  // State kết quả kiểm tra & chuyển màn hình hiển thị thành quả
  const [validationResults, setValidationResults] = useState<ValidationResult[]>([]);
  const [realtimeErrors, setRealtimeErrors] = useState<ValidationResult[]>([]);
  const [isShowingResult, setIsShowingResult] = useState<boolean>(false);

  // State thông báo trạng thái Quick Match
  const [quickMatchNotice, setQuickMatchNotice] = useState<{
    type: 'warn' | 'info';
    message: string;
  } | null>(null);

  // State quản lý lưu bộ phối vào Bộ sưu tập
  const [saveNotice, setSaveNotice] = useState<SaveNotice | null>(null);
  const [isCurrentOutfitSaved, setIsCurrentOutfitSaved] = useState<boolean>(false);

  // State ẩn/hiện thanh validation dưới cùng (mặc định ẩn gọn, chỉ mở khi bấm, tự ẩn khi chọn món khác)
  const [isBottomBarExpanded, setIsBottomBarExpanded] = useState<boolean>(false);

  // Chuyển Tab mượt mà lên đầu danh sách
  const goToTab = (tabNumber: number) => {
    setIsBottomBarExpanded(false);
    setActiveTab(tabNumber);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // 1. Chọn Bối cảnh (Tab 1)
  const handleSelectContext = (ctxId: string) => {
    setIsBottomBarExpanded(false);
    setQuickMatchNotice(null);
    setSelectedContext(ctxId);
  };

  // ==========================================
  // XỬ LÝ NHẬN REMIX TỪ LOOKBOOK
  // ==========================================
  useEffect(() => {
    const remixData = sessionStorage.getItem('remixOutfit');
    if (remixData) {
      try {
        const outfit = JSON.parse(remixData);
        const comp = outfit.composition;
        setSelectedGender(outfit.gender.toLowerCase() as 'male' | 'female');
        setSelectedContext(outfit.applicable_events[0] || 'C01');
        
        const getValidId = (id: string | null | undefined, lists: any[][]) => {
          if (!id) return null;
          const idLower = id.toLowerCase();
          for (const list of lists) {
            const found = list.find((i: any) => i.id.toLowerCase() === idLower);
            if (found) return found.id;
          }
          const baseId = id.replace(/_[12]$/, '').toLowerCase();
          for (const list of lists) {
            const found = list.find((i: any) => i.id.toLowerCase() === baseId);
            if (found) return found.id;
          }
          return null;
        };

        const garments = [comp.top, comp.outer_traditional, comp.outer_formal]
          .map(id => getValidId(id, [GARMENTS]))
          .filter(Boolean) as string[];
        setSelectedGarments(garments);
        
        setSelectedInner(getValidId(comp.inner, [CASUAL_ITEMS, GARMENTS]));
        setSelectedBottom(getValidId(comp.bottom_pants || comp.bottom_skirt, [CASUAL_ITEMS, GARMENTS]));
        setSelectedShoes(getValidId(comp.shoes || comp.traditional_footwear, [CASUAL_ITEMS, GARMENTS]));
        setSelectedHeadwear(getValidId(comp.headwear, [ACCESSORIES]));

        const jewelries = (comp.jewelry || [])
          .map((id: string) => getValidId(id, [ACCESSORIES]))
          .filter(Boolean) as string[];
        setSelectedJewelries(jewelries);
        
        // Giữ người dùng ở phần chọn items theo các bước
        setIsShowingResult(false);
        setActiveTab(2);
      } catch (e) {
        console.error("Failed to parse remix outfit", e);
      } finally {
        sessionStorage.removeItem('remixOutfit');
      }
    }
  }, []);

  // 2. Chọn Cổ phục (Tab 2)
  const handleSelectGarment = (garmentId: string, forceSelect?: boolean) => {
    setIsBottomBarExpanded(false);
    setQuickMatchNotice(null);
    setSelectedGarments((prev) => {
      const alreadySelected = prev.includes(garmentId);
      if (forceSelect === true) {
        return alreadySelected ? prev : [...prev, garmentId];
      }
      if (forceSelect === false) {
        return prev.filter((id) => id !== garmentId);
      }
      return alreadySelected ? prev.filter((id) => id !== garmentId) : [...prev, garmentId];
    });
  };

  // 3. SMART ASSIGNMENT cho đồ Mặc kèm (Tab 3)
  const handleSmartSelectCasual = (item: any, forceSelect?: boolean) => {
    setIsBottomBarExpanded(false);
    setQuickMatchNotice(null);
    const rawCat = (item.category || item.type || '').toLowerCase();

    const applySingleSlot = (prev: string | null) => {
      if (forceSelect === true) return item.id;
      if (forceSelect === false) return prev === item.id ? null : prev;
      return prev === item.id ? null : item.id;
    };

    if (rawCat.includes('inner') || rawCat.includes('top')) {
      setSelectedInner((prev) => applySingleSlot(prev));
    } else if (rawCat.includes('bottom') || rawCat.includes('pants') || rawCat.includes('skirt')) {
      setSelectedBottom((prev) => applySingleSlot(prev));
    } else if (rawCat.includes('shoe') || rawCat.includes('footwear')) {
      setSelectedShoes((prev) => applySingleSlot(prev));
    } else {
      if (item.type === 'inner') setSelectedInner((prev) => applySingleSlot(prev));
      else if (item.type === 'bottom') setSelectedBottom((prev) => applySingleSlot(prev));
      else if (item.type === 'shoes') setSelectedShoes((prev) => applySingleSlot(prev));
    }
  };

  // 4. SMART ASSIGNMENT cho Phụ kiện (Tab 4)
  const handleSmartSelectAccessory = (item: any, forceSelect?: boolean) => {
    setIsBottomBarExpanded(false);
    setQuickMatchNotice(null);
    if (item.type === 'headwear' || item.category === 'headwear') {
      setSelectedHeadwear((prev) => {
        if (forceSelect === true) return item.id;
        if (forceSelect === false) return prev === item.id ? null : prev;
        return prev === item.id ? null : item.id;
      });
    } else {
      setSelectedJewelries((prev) => {
        const alreadySelected = prev.includes(item.id);
        if (forceSelect === true) return alreadySelected ? prev : [...prev, item.id];
        if (forceSelect === false) return prev.filter((id) => id !== item.id);
        return alreadySelected ? prev.filter((id) => id !== item.id) : [...prev, item.id];
      });
    }
  };

  // Helper tự động đảm bảo món đồ được chọn khi tùy biến màu sắc
  const autoSelectItem = (itemId: string) => {
    // 1. Kiểm tra Cổ phục hoặc giày truyền thống trong GARMENTS
    const garment = GARMENTS.find((g) => g.id === itemId);
    if (garment) {
      const isFootwear = garment.type === 'shoes' || garment.category === 'traditional_footwear';
      if (isFootwear) {
        setSelectedShoes(itemId);
      } else {
        handleSelectGarment(itemId, true);
      }
      return;
    }

    // 2. Kiểm tra Đồ mặc kèm Casual
    const casual = CASUAL_ITEMS.find((c) => c.id === itemId);
    if (casual) {
      handleSmartSelectCasual(casual, true);
      return;
    }

    // 3. Kiểm tra Phụ kiện & Mũ nón
    const acc = ACCESSORIES.find((a) => a.id === itemId);
    if (acc) {
      handleSmartSelectAccessory(acc, true);
      return;
    }
  };

  // Chuyển đổi giới tính qua Pill Toggle
  const handleGenderChange = (gender: 'male' | 'female') => {
    if (gender === selectedGender) return;
    setIsBottomBarExpanded(false);
    setQuickMatchNotice(null);
    setSelectedGender(gender);
    setSelectedGarments([]);
    setSelectedInner(null);
    setSelectedBottom(null);
    setSelectedShoes(null);
    setSelectedHeadwear(null);
    setSelectedJewelries([]);
  };

  // Reset toàn bộ phối đồ
  const handleResetOutfit = () => {
    setIsBottomBarExpanded(false);
    setQuickMatchNotice(null);
    setSelectedContext(null);
    setSelectedGarments([]);
    setSelectedInner(null);
    setSelectedBottom(null);
    setSelectedShoes(null);
    setSelectedHeadwear(null);
    setSelectedJewelries([]);
    setIsShowingResult(false);
    setValidationResults([]);
    setRealtimeErrors([]);
    setActiveTab(1);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Helper tìm item theo ID
  const currentContextItem = CONTEXTS.find((c) => c.id === selectedContext);
  const currentGarmentItems = GARMENTS.filter((g) => selectedGarments.includes(g.id));
  const currentGarmentItem = currentGarmentItems[0];
  const additionalGarmentItems = currentGarmentItems.slice(1);
  const currentInnerItem = CASUAL_ITEMS.find((c) => c.id === selectedInner) || GARMENTS.find((g) => g.id === selectedInner);
  const currentBottomItem = CASUAL_ITEMS.find((c) => c.id === selectedBottom) || GARMENTS.find((g) => g.id === selectedBottom);
  const currentShoesItem =
    CASUAL_ITEMS.find((c) => c.id === selectedShoes) ||
    GARMENTS.find((g) => g.id === selectedShoes);
  const currentHeadwearItem = ACCESSORIES.find((a) => a.id === selectedHeadwear);
  const currentJewelryItems = ACCESSORIES.filter((a) => selectedJewelries.includes(a.id));

  const totalSelectedCount =
    (selectedContext ? 1 : 0) +
    selectedGarments.length +
    (selectedInner ? 1 : 0) +
    (selectedBottom ? 1 : 0) +
    (selectedShoes ? 1 : 0) +
    (selectedHeadwear ? 1 : 0) +
    selectedJewelries.length;

  // Helper chuẩn bị payload validation dùng chung 100% giữa Real-time, Validate thủ công và Quick Match
  const buildValidationPayload = (
    garmentIds: string[],
    contextId: string | null,
    innerId: string | null,
    bottomId: string | null,
    shoesId: string | null,
    headwearId: string | null,
    jewelryIds: string[],
    gender: string
  ) => {
    return {
      costumeId: garmentIds,
      contextId: contextId,
      innerId: innerId,
      bottomId: bottomId,
      shoesId: shoesId,
      headwearId: headwearId,
      jewelryIds: jewelryIds,
      gender: gender,
      outerLayer: null
    };
  };

  // Phân loại các thông điệp kiểm tra để hiển thị chính xác theo từng nhóm
  const inputErrors = realtimeErrors.filter(
    (r) => r.ruleId?.startsWith('MISSING_')
  );
  const dataErrors = realtimeErrors.filter(
    (r) => (r.ruleId?.startsWith('INVALID_') || r.ruleId === 'GENDER_INCOMPATIBLE') && r.severity === 'BLOCK'
  );
  const ruleViolations = realtimeErrors.filter(
    (r) =>
      r.severity === 'BLOCK' &&
      !r.ruleId?.startsWith('MISSING_') &&
      !r.ruleId?.startsWith('INVALID_') &&
      r.ruleId !== 'GENDER_INCOMPATIBLE'
  );
  const warningNotices = realtimeErrors.filter((r) => r.severity === 'WARN');

  const hasRuleViolation = ruleViolations.length > 0;
  const hasDataError = dataErrors.length > 0;
  const hasInputError = inputErrors.length > 0;
  const hasBlockError = realtimeErrors.some((r) => r.severity === 'BLOCK');
  const hasWarnNotice = warningNotices.length > 0;
  const isReadyToValidate = Boolean(selectedContext && selectedGarments.length > 0 && !hasBlockError);

  // ==========================================
  // REAL-TIME VALIDATION EFFECT
  // ==========================================
  useEffect(() => {
    if (
      selectedGarments.length === 0 &&
      !selectedContext &&
      !selectedBottom &&
      !selectedHeadwear &&
      !selectedInner &&
      !selectedShoes &&
      selectedJewelries.length === 0
    ) {
      setRealtimeErrors([]);
      setValidationResults([]);
      return;
    }

    const payload = buildValidationPayload(
      selectedGarments,
      selectedContext,
      selectedInner,
      selectedBottom,
      selectedShoes,
      selectedHeadwear,
      selectedJewelries,
      selectedGender
    );

    const results = validateOutfit(payload);
    setRealtimeErrors(results);
    setValidationResults(results);
  }, [
    selectedGarments,
    selectedInner,
    selectedBottom,
    selectedShoes,
    selectedHeadwear,
    selectedJewelries,
    selectedContext,
    selectedGender
  ]);

  // ==========================================
  // HÀM KIỂM TRA OUTFIT & XỬ LÝ ĐIỀU HƯỚNG
  // ==========================================
  const handleValidateOutfit = () => {
    const payload = buildValidationPayload(
      selectedGarments,
      selectedContext,
      selectedInner,
      selectedBottom,
      selectedShoes,
      selectedHeadwear,
      selectedJewelries,
      selectedGender
    );

    const results = validateOutfit(payload);
    setValidationResults(results);
    setRealtimeErrors(results);

    const hasBlock = results.some((r) => r.severity === 'BLOCK');
    if (hasBlock || !selectedContext || selectedGarments.length === 0) {
      setIsBottomBarExpanded(true); // Mở rộng thanh cảnh báo trực tiếp ở dưới, không dùng popup
      setIsShowingResult(false);
    } else {
      setIsShowingResult(true);
      setIsBottomBarExpanded(false);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  // Đồng bộ trạng thái đã lưu khi mở màn hình kết quả hoặc khi đổi màu
  useEffect(() => {
    if (isShowingResult && selectedGarments.length > 0 && selectedContext) {
      const { outfits } = getSavedOutfits();
      const existingMatch = outfits.find((o) =>
        isSameOutfit(o, {
          costumeId: selectedGarments,
          contextId: selectedContext,
          gender: selectedGender,
          innerId: selectedInner,
          bottomId: selectedBottom,
          shoesId: selectedShoes,
          headwearId: selectedHeadwear,
          jewelryIds: selectedJewelries
        })
      );
      if (existingMatch) {
        setIsCurrentOutfitSaved(areColorsEqual(existingMatch.itemColors, itemColors));
      } else {
        setIsCurrentOutfitSaved(false);
      }
      setSaveNotice(null);
    }
  }, [
    isShowingResult,
    selectedGarments,
    selectedContext,
    selectedGender,
    selectedInner,
    selectedBottom,
    selectedShoes,
    selectedHeadwear,
    selectedJewelries,
    itemColors
  ]);

  // Xử lý lưu bộ phối vào Bộ sưu tập
  const handleSaveOutfit = (colors?: Record<string, { hex: string | null; intensity: number }>, name?: string) => {
    if (selectedGarments.length === 0 || !selectedContext) return;
    const finalColors = colors && Object.keys(colors).length > 0 ? colors : itemColors;
    const res = saveOutfit({
      name: name?.trim() || undefined,
      costumeId: selectedGarments,
      contextId: selectedContext,
      gender: selectedGender,
      innerId: selectedInner,
      bottomId: selectedBottom,
      shoesId: selectedShoes,
      headwearId: selectedHeadwear,
      jewelryIds: selectedJewelries,
      itemColors: finalColors
    });

    if (res.success) {
      if (colors) {
        setItemColors(colors);
      }
      setIsCurrentOutfitSaved(true);
      setSaveNotice({
        type: 'success',
        message: res.isUpdated ? 'Đã cập nhật bộ phối trong bộ sưu tập.' : 'Đã thêm vào bộ sưu tập.'
      });
    } else if (res.isDuplicate) {
      setIsCurrentOutfitSaved(true);
      setSaveNotice({
        type: 'info',
        message: 'Đã có trong bộ sưu tập.'
      });
    } else {
      setSaveNotice({
        type: 'error',
        message: res.error || 'Không thể lưu bộ phối.'
      });
    }
  };

  // ==========================================
  // HÀM GỢI Ý PHỐI NHANH 1-CLICK (EPIC 04 — QUICK MATCH: KIỂM TRA TRƯỚC, ÁP DỤNG SAU)
  // ==========================================
  const handleQuickMatch = (targetGarmentId?: string) => {
    const garmentToUse = targetGarmentId || (selectedGarments.length > 0 ? selectedGarments[0] : undefined);
    setQuickMatchNotice(null);

    const result = findQuickMatchOutfit({
      costumeId: garmentToUse,
      contextId: selectedContext,
      gender: selectedGender
    });

    if (result.status === 'PRESET_APPLIED') {
      if (garmentToUse && !selectedGarments.includes(garmentToUse)) {
        setSelectedGarments([garmentToUse]);
      }
      setSelectedInner(result.suggestion.innerId);
      setSelectedBottom(result.suggestion.bottomId);
      setSelectedShoes(result.suggestion.shoesId);
      setSelectedHeadwear(result.suggestion.headwearId);
      setSelectedJewelries(result.suggestion.jewelryIds);

      // Chuyển tab trước, sau đó đặt thông báo và mở thanh cảnh báo nếu có warnings
      goToTab(4);

      if (result.warnings && result.warnings.length > 0) {
        const warnMsgs = result.warnings.map((w) => w.message).join(' ');
        setQuickMatchNotice({
          type: 'warn',
          message: warnMsgs
        });
        setIsBottomBarExpanded(true);
      } else {
        setQuickMatchNotice(null);
        setIsBottomBarExpanded(false);
      }

      return;
    }

    if (result.status === 'FALLBACK_APPLIED') {
      if (garmentToUse && !selectedGarments.includes(garmentToUse)) {
        setSelectedGarments([garmentToUse]);
      }
      setSelectedInner(result.suggestion.innerId);
      setSelectedBottom(result.suggestion.bottomId);
      setSelectedShoes(result.suggestion.shoesId);
      setSelectedHeadwear(result.suggestion.headwearId);
      setSelectedJewelries(result.suggestion.jewelryIds);

      const warnMsgs = result.warnings && result.warnings.length > 0
        ? ' ' + result.warnings.map((w) => w.message).join(' ')
        : '';

      // Chuyển tab trước, sau đó đặt thông báo và mở thanh cảnh báo nếu có warnings
      goToTab(4);

      setQuickMatchNotice({
        type: 'warn',
        message: `Đã áp dụng gợi ý phối cơ bản.${warnMsgs}`
      });
      setIsBottomBarExpanded(result.warnings.length > 0);
      return;
    }

    // Các trường hợp thất bại (INSUFFICIENT_INPUT, INVALID_INPUT, UNSUPPORTED_GARMENT_TYPE, SEARCH_BUDGET_EXCEEDED, CANDIDATES_EXHAUSTED):
    // GIỮ NGUYÊN 100% OUTFIT HIỆN TẠI CỦA NGƯỜI DÙNG
    setQuickMatchNotice({
      type: 'warn',
      message: result.message
    });
    setIsBottomBarExpanded(true);
  };

  // Lắng nghe sự kiện kích hoạt kiểm tra từ Navbar
  useEffect(() => {
    const handleTrigger = () => {
      if (isReadyToValidate) {
        handleValidateOutfit();
      }
    };
    window.addEventListener('trigger-validate-outfit', handleTrigger);
    return () => {
      window.removeEventListener('trigger-validate-outfit', handleTrigger);
    };
  });

  // DỮ LIỆU ĐÃ LỌC THEO GIỚI TÍNH
  const filteredGarments = GARMENTS.filter((item) => {
    const itemGender = item.gender?.toLowerCase() || 'unisex';
    const isFootwear = item.type === 'shoes' || item.category === 'traditional_footwear';
    return !isFootwear && (itemGender === selectedGender || itemGender === 'unisex');
  });

  const filteredCasual = CASUAL_ITEMS.filter((item) => {
    const itemGender = item.gender?.toLowerCase() || 'unisex';
    return itemGender === selectedGender || itemGender === 'unisex';
  });

  const traditionalShoes = GARMENTS.filter((item) => {
    const itemGender = item.gender?.toLowerCase() || 'unisex';
    const isFootwear = item.type === 'shoes' || item.category === 'traditional_footwear';
    return isFootwear && (itemGender === selectedGender || itemGender === 'unisex');
  });

  const inners = filteredCasual.filter((item) => item.type === 'inner' || item.category === 'inner');
  const bottoms = filteredCasual.filter(
    (item) => item.type === 'bottom' || (item.category && item.category.toLowerCase().includes('bottom'))
  );
  const shoes = [...traditionalShoes, ...filteredCasual.filter(
    (item) => item.type === 'shoes' || (item.category && item.category.toLowerCase().includes('shoes'))
  )];

  const filteredAccessories = ACCESSORIES.filter((item) => {
    const itemGender = item.gender?.toLowerCase() || 'unisex';
    return itemGender === selectedGender || itemGender === 'unisex';
  });
  const headwears = filteredAccessories.filter((item) => item.type === 'headwear');
  const jewelries = filteredAccessories.filter((item) => item.type === 'jewelry');

  // Helper render hình ảnh preview an toàn
  const renderPreviewImage = (item: any, fallbackText: string) => {
    if (!item) return null;
    const resolved = resolveItemByGender(item, selectedGender);
    const imageUrl = getSafeImageUrl(resolved.resolvedImageUrl || resolved);

    return (
      <SafeImage
        src={imageUrl}
        alt={item.name}
        fallbackText={fallbackText}
        expectedPath={imageUrl}
        className="w-full h-full object-cover"
      />
    );
  };

  return (
    <div className="min-h-screen bg-[#FBF9F5] text-stone-900 pb-36">
      <div className="max-w-5xl mx-auto px-3 sm:px-6 pt-2 pb-6 space-y-2.5 sm:space-y-3">
        {/* ==========================================
            HIỂN THỊ KẾT QUẢ OUTFIT HOẶC GIAO DIỆN EDITORIAL
           ========================================== */}
        {isShowingResult && currentGarmentItem ? (
          <OutfitResultView
            selectedGender={selectedGender}
            contextItem={currentContextItem}
            garmentItem={currentGarmentItem as Garment}
            additionalGarments={additionalGarmentItems as Garment[]}
            innerItem={currentInnerItem as CasualItem}
            bottomItem={currentBottomItem as CasualItem}
            shoesItem={currentShoesItem as CasualItem}
            headwearItem={currentHeadwearItem}
            jewelryItems={currentJewelryItems}
            validationResults={validationResults}
            onBackToStudio={() => setIsShowingResult(false)}
            onResetOutfit={handleResetOutfit}
            onSaveOutfit={handleSaveOutfit}
            initialItemColors={itemColors}
            onColorsChange={(newColors) => setItemColors(newColors)}
            isSaved={isCurrentOutfitSaved}
            saveNotice={saveNotice}
          />
        ) : (
          <>
            {/* ==========================================
                1. THU GỌN HEADER + GENDER TOGGLE PILL TINH TẾ
               ========================================== */}
            <div className="flex items-center justify-between gap-3 py-0.5">
              <div>
                <span className="text-[9px] tracking-[0.2em] uppercase text-stone-400 font-semibold block">
                  VIETPHUC STUDIO
                </span>
                <h1 className="text-lg sm:text-xl font-bold text-stone-900 tracking-tight leading-none">
                  Phòng Phối Đồ
                </h1>
              </div>

              <div className="flex items-center gap-2 sm:gap-3">
                {/* Toggle Pill Nam / Nữ */}
                <div className="flex items-center bg-stone-100 p-0.5 rounded-full border border-stone-200/60 text-xs">
                  <button
                    type="button"
                    onClick={() => handleGenderChange('female')}
                    className={`px-3 py-0.5 rounded-full text-xs transition-all cursor-pointer ${selectedGender === 'female'
                        ? 'bg-white text-stone-900 shadow-xs font-semibold'
                        : 'text-stone-500 hover:text-stone-800 font-normal'
                      }`}
                  >
                    Nữ
                  </button>
                  <button
                    type="button"
                    onClick={() => handleGenderChange('male')}
                    className={`px-3 py-0.5 rounded-full text-xs transition-all cursor-pointer ${selectedGender === 'male'
                        ? 'bg-white text-stone-900 shadow-xs font-semibold'
                        : 'text-stone-500 hover:text-stone-800 font-normal'
                      }`}
                  >
                    Nam
                  </button>
                </div>

                {/* Nút Gợi ý phối nhanh trên Header */}
                {selectedGarments.length > 0 && (
                  <button
                    type="button"
                    onClick={() => handleQuickMatch()}
                    className="px-3 py-1 rounded-full bg-gradient-to-r from-red-700 to-red-800 hover:from-red-800 hover:to-red-900 text-white font-semibold text-xs flex items-center gap-1 shadow-xs transition-all active:scale-95 cursor-pointer whitespace-nowrap"
                    title="Gợi ý phối nhanh 1-click toàn bộ set đồ"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                    <span className="hidden sm:inline">Gợi ý phối nhanh</span>
                    <span className="sm:hidden">Gợi ý</span>
                  </button>
                )}

                {/* Nút Làm Mới Phối Đồ */}
                {totalSelectedCount > 0 && (
                  <button
                    type="button"
                    onClick={handleResetOutfit}
                    className="p-1.5 rounded-full text-stone-400 hover:text-stone-800 hover:bg-stone-100 transition-colors"
                    title="Làm mới phối đồ"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>

            {/* ==========================================
                THANH NAVIGATION TỐI GIẢN (STICKY TOP KHI CUỘN)
               ========================================== */}
            <div className="sticky top-0 z-30 bg-[#FBF9F5]/95 backdrop-blur-md pt-2 pb-1 border-b border-stone-200/80">
              <div className="flex items-center justify-start sm:justify-center gap-3 sm:gap-7 overflow-x-auto scrollbar-hide px-1">
                {[
                  { id: 1, label: 'Bối cảnh', completed: Boolean(selectedContext) },
                  { id: 2, label: 'Cổ phục', completed: selectedGarments.length > 0 },
                  { id: 3, label: 'Mặc kèm', completed: Boolean(selectedInner || selectedBottom || selectedShoes) },
                  { id: 4, label: 'Phụ kiện', completed: Boolean(selectedHeadwear || selectedJewelries.length > 0) }
                ].map((tab) => {
                  const isCurrent = activeTab === tab.id;
                  const isNextStep =
                    (activeTab === 1 && tab.id === 2 && Boolean(selectedContext)) ||
                    (activeTab === 2 && tab.id === 3 && selectedGarments.length > 0) ||
                    (activeTab === 3 && tab.id === 4 && Boolean(selectedInner || selectedBottom || selectedShoes));

                  return (
                    <button
                      key={tab.id}
                      type="button"
                      onClick={() => goToTab(tab.id)}
                      className={`relative py-1.5 px-2.5 text-xs sm:text-sm tracking-wide transition-all whitespace-nowrap cursor-pointer flex items-center gap-1.5 select-none rounded-lg ${
                        isCurrent
                          ? 'text-stone-900 font-bold'
                          : isNextStep
                            ? 'text-red-700 font-bold bg-red-100/90 ring-1.5 ring-red-500/60 shadow-xs animate-pulse'
                            : tab.completed
                              ? 'text-stone-700 hover:text-stone-900 font-medium'
                              : 'text-stone-400 hover:text-stone-600 font-normal'
                      }`}
                    >
                      <span
                        className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-mono font-bold transition-colors shrink-0 ${
                          isCurrent
                            ? 'bg-stone-900 text-white'
                            : isNextStep
                              ? 'bg-red-700 text-white shadow-xs'
                              : tab.completed
                                ? 'bg-emerald-600 text-white'
                                : 'bg-stone-200 text-stone-500'
                        }`}
                      >
                        {tab.completed ? <Check className="w-3 h-3 stroke-[3]" /> : tab.id}
                      </span>
                      <span>{tab.label}</span>
                      {isCurrent && (
                        <span className="absolute bottom-0 left-0 right-0 h-[2.5px] bg-red-700 rounded-full" />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* ==========================================
                NỘI DUNG TỪNG TAB LỰA CHỌN (MINIMALIST EDITORIAL)
               ========================================== */}
            <div className="space-y-4 pt-1.5">
              {/* ------------------------------------------
                  TAB 1: BỐI CẢNH KHÔNG GIAN
                 ------------------------------------------ */}
              {activeTab === 1 && (
                <div className="space-y-4 animate-in fade-in-50 duration-200">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {CONTEXTS.map((ctx) => {
                      const isSelected = selectedContext === ctx.id;
                      return (
                        <div
                          key={ctx.id}
                          onClick={() => handleSelectContext(ctx.id)}
                          className={`p-4 sm:p-5 rounded-2xl border transition-all cursor-pointer text-left space-y-1.5 relative select-none ${isSelected
                              ? 'bg-white border-stone-900 ring-2 ring-stone-900 shadow-xs'
                              : 'bg-stone-50/60 border-stone-200/70 hover:border-stone-400 hover:bg-white'
                            }`}
                        >
                          <div className="flex items-center justify-between">
                            <h3 className="text-sm font-bold text-stone-900 leading-snug">
                              {ctx.name}
                            </h3>
                            {isSelected && (
                              <div className="w-5 h-5 rounded-full bg-stone-900 text-white flex items-center justify-center shrink-0">
                                <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                              </div>
                            )}
                          </div>
                          <p className="text-xs text-stone-500 leading-relaxed font-normal">
                            {ctx.description}
                          </p>
                        </div>
                      );
                    })}
                  </div>

                  {/* Nút Chuyển Tab */}
                  <div className="pt-4 flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-stone-100">
                    <div className="text-xs text-stone-500">
                      {selectedContext ? (
                        <span className="text-emerald-700 font-medium flex items-center gap-1.5">
                          <Check className="w-3.5 h-3.5 text-emerald-600 stroke-[2.5]" />
                          Đã chọn bối cảnh: <strong>{CONTEXTS.find(c => c.id === selectedContext)?.name}</strong>
                        </span>
                      ) : (
                        <span>Vui lòng chọn 1 không gian / sự kiện phù hợp để bắt đầu</span>
                      )}
                    </div>

                    <button
                      type="button"
                      disabled={!selectedContext}
                      onClick={() => goToTab(2)}
                      className={`w-full sm:w-auto px-6 py-2.5 rounded-full text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${selectedContext
                          ? 'bg-stone-900 hover:bg-stone-800 text-white cursor-pointer active:scale-95 shadow-sm'
                          : 'bg-stone-100 text-stone-400 cursor-not-allowed border border-stone-200/60'
                        }`}
                    >
                      <span>Tiếp tục: Chọn Cổ phục</span>
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}

              {/* ------------------------------------------
                  TAB 2: CỔ PHỤC DI SẢN
                 ------------------------------------------ */}
              {activeTab === 2 && (
                <div className="space-y-4 animate-in fade-in-50 duration-200">
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {filteredGarments.map((garment) => {
                      const resolved = resolveItemByGender(garment, selectedGender);
                      const isSelected = selectedGarments.includes(garment.id);
                      const colorSetting = itemColors[garment.id];

                      return (
                        <ItemSelectCard
                          key={resolved.id}
                          item={resolved}
                          isSelected={isSelected}
                          onSelect={() => handleSelectGarment(garment.id)}
                          onViewDetail={() => setPreviewGarment(garment)}
                          subtitle={resolved.origin}
                          badgeText={garment.has_gender_variants ? (selectedGender === 'female' ? 'Nữ' : 'Nam') : undefined}
                          colorHex={colorSetting?.hex}
                          colorIntensity={colorSetting?.intensity}
                          onRecolor={() =>
                            setColorCustomizerTarget({
                              id: garment.id,
                              name: resolved.name,
                              categoryName: 'Cổ phục',
                              imageUrl: getSafeImageUrl(resolved.resolvedImageUrl || resolved)
                            })
                          }
                        />
                      );
                    })}
                  </div>

                  {/* Khối hướng dẫn bước tiếp theo rõ ràng khi đã chọn Cổ phục */}
                  {selectedGarments.length > 0 && (
                    <div className="p-4 sm:p-5 rounded-3xl bg-white border border-stone-200/90 shadow-sm space-y-3.5 animate-in slide-in-from-top-2 duration-300">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 border-b border-stone-100 pb-3">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center shrink-0">
                            <Check className="w-4 h-4 stroke-[2.5]" />
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-bold text-stone-900">
                                Đã chọn: {currentGarmentItems.filter(Boolean).map(i => i.name).join(', ')}
                              </span>
                              <span className="text-[10px] font-semibold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                                Đủ điều kiện hoàn tất
                              </span>
                            </div>
                            <p className="text-[11px] text-stone-500 font-sans mt-0.5">
                              Bạn có thể xem ngay kết quả outfit hoặc tiếp tục chọn đồ mặc kèm & phụ kiện.
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* 2 nút hành động lựa chọn bước tiếp theo */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                        <button
                          type="button"
                          onClick={() => goToTab(3)}
                          className="py-2.5 px-4 rounded-xl border border-stone-300 hover:border-stone-400 bg-stone-50 hover:bg-stone-100 text-stone-800 font-semibold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer active:scale-95 shadow-2xs"
                        >
                          <span>Tiếp tục phối: Đồ mặc kèm</span>
                          <ChevronRight className="w-4 h-4 text-stone-500" />
                        </button>

                        <button
                          type="button"
                          disabled={!isReadyToValidate}
                          onClick={handleValidateOutfit}
                          className="py-2.5 px-4 rounded-xl bg-red-700 hover:bg-red-800 text-white font-semibold text-xs flex items-center justify-center gap-2 shadow-xs hover:shadow-md transition-all cursor-pointer active:scale-95"
                        >
                          <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                          <span>Xem kết quả outfit ngay ✦</span>
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Banner Gợi ý phối nhanh 1-Click (EPIC 04 — QUICK MATCH) */}
                  {selectedGarments.length > 0 && (
                    <div className="p-3.5 sm:p-4 rounded-2xl bg-gradient-to-r from-red-50/90 via-[#FAF7F2] to-stone-50 border border-red-200/80 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-xs animate-in slide-in-from-top-2 duration-300">
                      <div className="flex items-center gap-3 text-left w-full sm:w-auto">
                        <div className="w-9 h-9 rounded-xl bg-red-700 text-white flex items-center justify-center shrink-0 shadow-xs">
                          <Sparkles className="w-4 h-4 text-amber-300 animate-pulse" />
                        </div>
                        <div>
                          <div className="flex items-center gap-1.5">
                            <span className="text-xs font-bold text-stone-900 truncate max-w-[200px]">
                              Tự động phối trọn bộ
                            </span>
                            <span className="text-[10px] uppercase px-1.5 py-0.5 bg-red-100 text-red-800 rounded-md font-semibold">
                              Chuẩn văn hóa
                            </span>
                          </div>
                          <span className="text-[11px] text-stone-500 leading-tight block mt-0.5">
                            Tự động phối trọn bộ áo trong, quần/váy, giày & phụ kiện chỉ với 1 chạm.
                          </span>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleQuickMatch()}
                        className="w-full sm:w-auto px-5 py-2.5 rounded-full bg-gradient-to-r from-red-700 to-red-800 hover:from-red-800 hover:to-red-900 text-white font-semibold text-xs flex items-center justify-center gap-1.5 shadow-sm hover:shadow-md hover:scale-[1.02] active:scale-95 transition-all cursor-pointer whitespace-nowrap"
                      >
                        <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                        <span>Gợi ý phối nhanh</span>
                      </button>
                    </div>
                  )}

                  {/* Nút Chuyển Tab */}
                  <div className="pt-2 flex flex-wrap items-center justify-between gap-2.5">
                    <button
                      type="button"
                      onClick={() => goToTab(1)}
                      className="px-4 py-2 rounded-full text-xs font-medium text-stone-500 hover:text-stone-900 hover:bg-stone-100 flex items-center gap-1 transition-colors cursor-pointer"
                    >
                      <ChevronLeft className="w-4 h-4" />
                      <span>Bối cảnh</span>
                    </button>

                    <div className="flex items-center gap-2 w-full sm:w-auto justify-end flex-wrap">
                      {isReadyToValidate && (
                        <button
                          type="button"
                          onClick={handleValidateOutfit}
                          className="px-4 sm:px-5 py-2.5 rounded-full bg-red-700 hover:bg-red-800 text-white font-semibold text-xs flex items-center gap-1.5 shadow-xs hover:shadow-md transition-all cursor-pointer active:scale-95"
                        >
                          <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                          <span>Xem kết quả ✦</span>
                        </button>
                      )}

                      <button
                        type="button"
                        disabled={selectedGarments.length === 0}
                        onClick={() => goToTab(3)}
                        className={`px-5 py-2.5 rounded-full text-xs font-semibold flex items-center gap-1.5 transition-all ${selectedGarments.length > 0
                            ? 'bg-stone-900 hover:bg-stone-800 text-white cursor-pointer active:scale-95 shadow-xs'
                            : 'bg-stone-100 text-stone-400 cursor-not-allowed border border-stone-200/60'
                          }`}
                      >
                        <span>Mặc kèm</span>
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* ------------------------------------------
                  TAB 3: TRANG PHỤC MẶC KÈM (INNER, BOTTOM, SHOES)
                 ------------------------------------------ */}
              {activeTab === 3 && (
                <div className="space-y-6 animate-in fade-in-50 duration-200">
                  {/* Nhóm 1: Áo trong */}
                  <div className="space-y-2.5">
                    <div className="flex items-center justify-between">
                      <h3 className="text-xs font-semibold text-stone-800 uppercase tracking-wider flex items-center gap-1.5">
                        <Layers className="w-3.5 h-3.5 text-stone-400" />
                        Áo Mặc Trong
                      </h3>
                      {selectedInner && (
                        <button
                          onClick={() => setSelectedInner(null)}
                          className="text-[11px] text-stone-400 hover:text-stone-800 hover:underline"
                        >
                          Bỏ chọn
                        </button>
                      )}
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                      {inners.map((item) => {
                        const resolved = resolveItemByGender(item, selectedGender);
                        const isSelected = selectedInner === item.id;
                        const colorSetting = itemColors[item.id];
                        return (
                          <ItemSelectCard
                            key={resolved.id}
                            item={resolved}
                            isSelected={isSelected}
                            onSelect={() => handleSmartSelectCasual(item)}
                            onViewDetail={() => setPreviewCasual(item)}
                            subtitle={item.silhouette ? `Dáng ${item.silhouette}` : undefined}
                            colorHex={colorSetting?.hex}
                            colorIntensity={colorSetting?.intensity}
                            onRecolor={() =>
                              setColorCustomizerTarget({
                                id: item.id,
                                name: resolved.name,
                                categoryName: 'Áo mặc trong',
                                imageUrl: getSafeImageUrl(resolved.resolvedImageUrl || resolved)
                              })
                            }
                          />
                        );
                      })}
                    </div>
                  </div>

                  {/* Nhóm 2: Quần / Váy */}
                  <div className="space-y-2.5 pt-4 border-t border-stone-100">
                    <div className="flex items-center justify-between">
                      <h3 className="text-xs font-semibold text-stone-800 uppercase tracking-wider flex items-center gap-1.5">
                        <Layers className="w-3.5 h-3.5 text-stone-400" />
                        Quần / Váy
                      </h3>
                      {selectedBottom && (
                        <button
                          onClick={() => setSelectedBottom(null)}
                          className="text-[11px] text-stone-400 hover:text-stone-800 hover:underline"
                        >
                          Bỏ chọn
                        </button>
                      )}
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                      {bottoms.map((item) => {
                        const resolved = resolveItemByGender(item, selectedGender);
                        const isSelected = selectedBottom === item.id;
                        const colorSetting = itemColors[item.id];
                        return (
                          <ItemSelectCard
                            key={resolved.id}
                            item={resolved}
                            isSelected={isSelected}
                            onSelect={() => handleSmartSelectCasual(item)}
                            onViewDetail={() => setPreviewCasual(item)}
                            subtitle={item.silhouette ? `Dáng ${item.silhouette}` : undefined}
                            colorHex={colorSetting?.hex}
                            colorIntensity={colorSetting?.intensity}
                            onRecolor={() =>
                              setColorCustomizerTarget({
                                id: item.id,
                                name: resolved.name,
                                categoryName: 'Quần / Váy',
                                imageUrl: getSafeImageUrl(resolved.resolvedImageUrl || resolved)
                              })
                            }
                          />
                        );
                      })}
                    </div>
                  </div>

                  {/* Nhóm 3: Giày dép */}
                  <div className="space-y-2.5 pt-4 border-t border-stone-100">
                    <div className="flex items-center justify-between">
                      <h3 className="text-xs font-semibold text-stone-800 uppercase tracking-wider flex items-center gap-1.5">
                        <Footprints className="w-3.5 h-3.5 text-stone-400" />
                        Giày Dép
                      </h3>
                      {selectedShoes && (
                        <button
                          onClick={() => setSelectedShoes(null)}
                          className="text-[11px] text-stone-400 hover:text-stone-800 hover:underline"
                        >
                          Bỏ chọn
                        </button>
                      )}
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                      {shoes.map((item) => {
                        const resolved = resolveItemByGender(item, selectedGender);
                        const isSelected = selectedShoes === item.id;
                        const colorSetting = itemColors[item.id];
                        return (
                          <ItemSelectCard
                            key={resolved.id}
                            item={resolved}
                            isSelected={isSelected}
                            onSelect={() => handleSmartSelectCasual(item)}
                            onViewDetail={() => {
                              if ('origin' in item || 'has_gender_variants' in item) {
                                setPreviewGarment(item as Garment);
                              } else {
                                setPreviewCasual(item as CasualItem);
                              }
                            }}
                            colorHex={colorSetting?.hex}
                            colorIntensity={colorSetting?.intensity}
                            onRecolor={() =>
                              setColorCustomizerTarget({
                                id: item.id,
                                name: resolved.name,
                                categoryName: 'Giày dép',
                                imageUrl: getSafeImageUrl(resolved.resolvedImageUrl || resolved)
                              })
                            }
                          />
                        );
                      })}
                    </div>
                  </div>

                  {/* Nút Chuyển Tab */}
                  <div className="pt-4 flex items-center justify-between gap-2 border-t border-stone-100">
                    <button
                      type="button"
                      onClick={() => goToTab(2)}
                      className="px-4 py-2 rounded-full text-xs font-medium text-stone-500 hover:text-stone-900 hover:bg-stone-100 flex items-center gap-1 transition-colors"
                    >
                      <ChevronLeft className="w-4 h-4" />
                      <span>Cổ phục</span>
                    </button>

                    <div className="flex items-center gap-2">
                      {isReadyToValidate && (
                        <button
                          type="button"
                          onClick={handleValidateOutfit}
                          className="px-4 py-2 rounded-full border border-stone-300 text-stone-700 hover:bg-stone-50 hover:text-stone-900 text-xs font-medium flex items-center gap-1.5 transition-all"
                        >
                          <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                          <span>Xem kết quả ngay</span>
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => goToTab(4)}
                        className="px-5 py-2.5 rounded-full bg-stone-900 hover:bg-stone-800 text-white text-xs font-semibold flex items-center gap-1.5 transition-all shadow-xs active:scale-95"
                      >
                        <span>Tiếp tục: Phụ kiện</span>
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* ------------------------------------------
                  TAB 4: PHỤ KIỆN & TRANG SỨC
                 ------------------------------------------ */}
              {activeTab === 4 && (
                <div className="space-y-6 animate-in fade-in-50 duration-200">
                  {/* Nhóm 1: Mũ nón */}
                  <div className="space-y-2.5">
                    <div className="flex items-center justify-between">
                      <h3 className="text-xs font-semibold text-stone-800 uppercase tracking-wider flex items-center gap-1.5">
                        <Crown className="w-3.5 h-3.5 text-stone-400" />
                        Mũ Nón
                      </h3>
                      {selectedHeadwear && (
                        <button
                          onClick={() => setSelectedHeadwear(null)}
                          className="text-[11px] text-stone-400 hover:text-stone-800 hover:underline"
                        >
                          Bỏ chọn
                        </button>
                      )}
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                      {headwears.map((item) => {
                        const resolved = resolveItemByGender(item, selectedGender);
                        const isSelected = selectedHeadwear === item.id;
                        const colorSetting = itemColors[item.id];
                        return (
                          <ItemSelectCard
                            key={resolved.id}
                            item={resolved}
                            isSelected={isSelected}
                            onSelect={() => handleSmartSelectAccessory(item)}
                            onViewDetail={() => setPreviewAccessory(item)}
                            subtitle={item.origin}
                            colorHex={colorSetting?.hex}
                            colorIntensity={colorSetting?.intensity}
                            onRecolor={() =>
                              setColorCustomizerTarget({
                                id: item.id,
                                name: resolved.name,
                                categoryName: 'Mũ nón',
                                imageUrl: getSafeImageUrl(resolved.resolvedImageUrl || resolved)
                              })
                            }
                          />
                        );
                      })}
                    </div>
                  </div>

                  {/* Nhóm 2: Trang sức */}
                  <div className="space-y-2.5 pt-4 border-t border-stone-100">
                    <div className="flex items-center justify-between">
                      <h3 className="text-xs font-semibold text-stone-800 uppercase tracking-wider flex items-center gap-1.5">
                        <Sparkles className="w-3.5 h-3.5 text-stone-400" />
                        Trang Sức
                      </h3>
                      {selectedJewelries.length > 0 && (
                        <button
                          onClick={() => setSelectedJewelries([])}
                          className="text-[11px] text-stone-400 hover:text-stone-800 hover:underline"
                        >
                          Bỏ chọn tất cả
                        </button>
                      )}
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                      {jewelries.map((item) => {
                        const resolved = resolveItemByGender(item, selectedGender);
                        const isSelected = selectedJewelries.includes(item.id);
                        const colorSetting = itemColors[item.id];
                        return (
                          <ItemSelectCard
                            key={resolved.id}
                            item={resolved}
                            isSelected={isSelected}
                            onSelect={() => handleSmartSelectAccessory(item)}
                            onViewDetail={() => setPreviewAccessory(item)}
                            subtitle={item.origin}
                            colorHex={colorSetting?.hex}
                            colorIntensity={colorSetting?.intensity}
                            onRecolor={() =>
                              setColorCustomizerTarget({
                                id: item.id,
                                name: resolved.name,
                                categoryName: 'Trang sức',
                                imageUrl: getSafeImageUrl(resolved.resolvedImageUrl || resolved)
                              })
                            }
                          />
                        );
                      })}
                    </div>
                  </div>

                  {/* Nút Hoàn Tất */}
                  <div className="pt-4 flex items-center justify-between gap-2 border-t border-stone-100">
                    <button
                      type="button"
                      onClick={() => goToTab(3)}
                      className="px-4 py-2 rounded-full text-xs font-medium text-stone-500 hover:text-stone-900 hover:bg-stone-100 flex items-center gap-1 transition-colors"
                    >
                      <ChevronLeft className="w-4 h-4" />
                      <span>Mặc kèm</span>
                    </button>

                    <button
                      type="button"
                      disabled={!isReadyToValidate}
                      onClick={handleValidateOutfit}
                      className={`px-7 py-2.5 rounded-full text-xs font-semibold flex items-center gap-2 transition-all shadow-md active:scale-95 ${!isReadyToValidate
                          ? 'bg-stone-100 text-stone-400 cursor-not-allowed border border-stone-200/60 shadow-none'
                          : hasRuleViolation
                            ? 'bg-red-600 hover:bg-red-700 text-white cursor-pointer'
                            : hasDataError
                              ? 'bg-rose-600 hover:bg-rose-700 text-white cursor-pointer'
                              : hasBlockError
                                ? 'bg-red-600 hover:bg-red-700 text-white cursor-pointer'
                                : 'bg-red-600 hover:bg-red-700 text-white cursor-pointer shadow-red-600/30 ring-2 ring-red-600/20'
                        }`}
                    >
                      <Sparkles className="w-4 h-4 text-amber-200" />
                      <span>
                        {hasRuleViolation
                          ? 'Xem vi phạm quy chuẩn'
                          : hasDataError
                            ? 'Xem lỗi dữ liệu'
                            : hasBlockError
                              ? 'Xem điều kiện bắt buộc'
                              : 'Hoàn tất & Xem kết quả phối đồ ✦'}
                      </span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </>
        )}
      </div>

      {/* ==========================================
          5. THANH CÔNG CỤ BOTTOM BAR (ẨN GỌN XUỐNG DƯỚI, CHỈ MỞ KHI BẤM, TỰ ẨN KHI CHỌN MÓN KHÁC)
         ========================================== */}
      {!isShowingResult && (
        <div className="fixed bottom-20 inset-x-4 max-w-4xl mx-auto z-40 flex flex-col items-center pointer-events-none">
          {/* TRẠNG THÁI 1: BUNG RA ĐẦY ĐỦ KHI NGƯỜI DÙNG BẤM MỞ */}
          {isBottomBarExpanded ? (
            <div
              className={`w-full pointer-events-auto backdrop-blur-md rounded-2xl border shadow-2xl py-3.5 px-4 sm:px-6 transition-all duration-300 animate-in slide-in-from-bottom-3 ${hasBlockError
                  ? 'bg-red-50/95 border-red-200/90 text-red-950'
                  : 'bg-white/95 border-stone-200/80 text-stone-900'
                }`}
            >
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3 relative">
                {/* Nút thu nhỏ lại */}
                <button
                  type="button"
                  onClick={() => setIsBottomBarExpanded(false)}
                  className="absolute -top-1.5 right-0 sm:static p-1 rounded-full text-stone-400 hover:text-stone-700 hover:bg-stone-100/80 transition-colors"
                  title="Thu nhỏ thanh trạng thái"
                >
                  <ChevronDown className="w-4 h-4" />
                </button>

                <div className="flex items-center gap-3 w-full sm:w-auto">
                  <div className="flex -space-x-1.5 overflow-hidden shrink-0">
                    <span
                      className={`w-2.5 h-2.5 rounded-full border-2 border-white ${selectedContext ? 'bg-stone-900' : 'bg-stone-300'
                        }`}
                      title="Bối cảnh"
                    />
                    <span
                      className={`w-2.5 h-2.5 rounded-full border-2 border-white ${selectedGarments ? 'bg-stone-900' : 'bg-stone-300'
                        }`}
                      title="Cổ phục"
                    />
                    <span
                      className={`w-2.5 h-2.5 rounded-full border-2 border-white ${selectedInner || selectedBottom || selectedShoes ? 'bg-stone-900' : 'bg-stone-300'
                        }`}
                      title="Mặc kèm"
                    />
                    <span
                      className={`w-2.5 h-2.5 rounded-full border-2 border-white ${selectedHeadwear || selectedJewelries.length > 0 ? 'bg-stone-900' : 'bg-stone-300'
                        }`}
                      title="Phụ kiện"
                    />
                  </div>
                  <div className="text-xs ">
                    {hasRuleViolation ? (
                      <span className="text-red-700 font-medium flex items-center gap-1.5 animate-in fade-in duration-200">
                        Phát hiện xung đột quy chuẩn văn hóa / phom dáng (Không thể hoàn tất)
                      </span>
                    ) : hasDataError ? (
                      <span className="text-rose-700 font-medium flex items-center gap-1.5 animate-in fade-in duration-200">
                        Phát hiện lỗi dữ liệu / sai slot món đồ (Không thể hoàn tất)
                      </span>
                    ) : hasWarnNotice ? (
                      <span className="text-amber-700 font-medium flex items-center gap-1.5 animate-in fade-in duration-200">
                        Có lưu ý phom dáng / văn hóa (Vẫn cho phép tiếp tục)
                      </span>
                    ) : isReadyToValidate ? (
                      <span className="text-stone-700 font-medium flex items-center gap-1.5 animate-in fade-in duration-200">
                        Đã chọn đủ Cổ phục & Bối cảnh. Sẵn sàng phối đồ!
                      </span>
                    ) : !selectedContext ? (
                      <span className="text-stone-400">
                        Vui lòng chọn <strong>Bối cảnh</strong> ở Tab 1.
                      </span>
                    ) : selectedGarments.length === 0 ? (
                      <span className="text-stone-500">
                        Vui lòng chọn <strong>Cổ phục</strong> ở Tab 2.
                      </span>
                    ) : (
                      <span className="text-stone-500">
                        Chưa đủ điều kiện hoàn tất phối đồ.
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-3 w-full sm:w-auto">
                  <button
                    type="button"
                    disabled={!isReadyToValidate}
                    onClick={handleValidateOutfit}
                    className={`w-full sm:w-auto px-7 py-2.5 rounded-full font-semibold text-xs transition-all duration-200 flex items-center justify-center gap-2 select-none ${!isReadyToValidate
                        ? 'bg-stone-100 text-stone-400 border border-stone-200/60 cursor-not-allowed shadow-none'
                        : hasRuleViolation
                          ? 'bg-red-600 hover:bg-red-700 text-white shadow-xs cursor-pointer'
                          : hasDataError
                            ? 'bg-rose-600 hover:bg-rose-700 text-white shadow-xs cursor-pointer'
                            : hasBlockError
                              ? 'bg-red-600 hover:bg-red-700 text-white shadow-xs cursor-pointer'
                              : 'bg-stone-900 hover:bg-stone-800 text-white shadow-xs cursor-pointer active:scale-95'
                      }`}
                  >
                    <ShieldCheck className="w-3.5 h-3.5" />
                    <span>
                      {hasRuleViolation
                        ? 'Xem xung đột quy chuẩn'
                        : hasDataError
                          ? 'Xem lỗi dữ liệu'
                          : hasBlockError
                            ? 'Xem điều kiện bắt buộc'
                            : 'Kiểm Tra Outfit'}
                    </span>
                  </button>
                </div>
              </div>

              {/* DANH SÁCH VI PHẠM QUY CHUẨN HOẶC LƯU Ý TRỰC TIẾP */}
              {(hasBlockError || hasWarnNotice || quickMatchNotice) && (
                <div className="w-full space-y-2 pt-3 mt-1 border-t border-stone-200/80 max-h-56 overflow-y-auto">
                  {/* Thông báo Quick Match nếu có */}
                  {quickMatchNotice && (
                    <div className="flex items-start gap-2.5 text-xs text-amber-950 bg-amber-100/90 p-2.5 rounded-xl border border-amber-300 shadow-xs">
                      <AlertTriangle className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
                      <div className="space-y-0.5">
                        <span className="font-bold block text-amber-900">Thông báo gợi ý phối nhanh:</span>
                        <p className="leading-relaxed ">{quickMatchNotice.message}</p>
                      </div>
                    </div>
                  )}

                  {/* 1. Lỗi Xung đột quy chuẩn văn hóa / phom dáng (RULE 1-8) */}
                  {ruleViolations.map((err, idx) => (
                    <div
                      key={`rule-${idx}`}
                      className="flex items-start gap-2.5 text-xs text-red-950 bg-red-100/90 p-2.5 rounded-xl border border-red-200 shadow-xs"
                    >
                      <AlertTriangle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                      <div className="space-y-0.5">
                        <span className="font-bold block text-red-900">Xung đột quy chuẩn văn hóa / phom dáng:</span>
                        <p className="leading-relaxed ">{err.message}</p>
                      </div>
                    </div>
                  ))}

                  {/* 2. Lỗi Dữ liệu không hợp lệ / Sai slot / Không tương thích giới tính */}
                  {dataErrors.map((err, idx) => (
                    <div
                      key={`data-${idx}`}
                      className="flex items-start gap-2.5 text-xs text-rose-950 bg-rose-100/90 p-2.5 rounded-xl border border-rose-200 shadow-xs"
                    >
                      <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                      <div className="space-y-0.5">
                        <span className="font-bold block text-rose-900">Lỗi dữ liệu / Không hợp lệ (Không thể hoàn tất):</span>
                        <p className="leading-relaxed ">{err.message}</p>
                      </div>
                    </div>
                  ))}

                  {/* 3. Lỗi thiếu thông tin đầu vào bắt buộc */}
                  {inputErrors.map((err, idx) => (
                    <div
                      key={`input-${idx}`}
                      className="flex items-start gap-2.5 text-xs text-stone-900 bg-stone-100/90 p-2.5 rounded-xl border border-stone-200 shadow-xs"
                    >
                      <Info className="w-4 h-4 text-stone-600 shrink-0 mt-0.5" />
                      <div className="space-y-0.5">
                        <span className="font-bold block text-stone-800">Chưa đủ điều kiện kiểm tra:</span>
                        <p className="leading-relaxed ">{err.message}</p>
                      </div>
                    </div>
                  ))}

                  {/* 4. Lưu ý WARN */}
                  {warningNotices.map((warn, idx) => (
                    <div
                      key={`warn-${idx}`}
                      className="flex items-start gap-2.5 text-xs text-amber-950 bg-amber-50/90 p-2.5 rounded-xl border border-amber-200 shadow-xs"
                    >
                      <Info className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                      <div className="space-y-0.5">
                        <span className="font-bold block text-amber-900">Lưu ý phối đồ (Vẫn cho phép tiếp tục):</span>
                        <p className="leading-relaxed ">{warn.message}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : (
            /* TRẠNG THÁI 2: THANH TRỢ LÝ THÔNG MINH - HƯỚNG DẪN BƯỚC TIẾP THEO */
            <div className="pointer-events-auto bg-stone-900/95 backdrop-blur-md border border-stone-800 text-white rounded-full shadow-xl px-3.5 py-1.5 sm:px-4 sm:py-2 flex items-center gap-2 sm:gap-3 transition-all duration-200">
              {/* Nhấn vào để xem chi tiết / kiểm tra quy chuẩn */}
              <button
                type="button"
                onClick={() => setIsBottomBarExpanded(true)}
                className="flex items-center gap-2 text-xs hover:text-stone-300 transition-colors cursor-pointer select-none"
                title="Bấm để xem chi tiết tình trạng quy chuẩn"
              >
                {/* Dots hiển thị tiến trình 4 bước */}
                <div className="flex items-center gap-1">
                  <span
                    className={`w-2 h-2 rounded-full ${selectedContext ? 'bg-emerald-400' : 'bg-stone-600'}`}
                    title="Bước 1: Bối cảnh"
                  />
                  <span
                    className={`w-2 h-2 rounded-full ${selectedGarments.length > 0 ? 'bg-emerald-400' : 'bg-stone-600'}`}
                    title="Bước 2: Cổ phục"
                  />
                  <span
                    className={`w-2 h-2 rounded-full ${selectedInner || selectedBottom || selectedShoes ? 'bg-emerald-400' : 'bg-stone-600'}`}
                    title="Bước 3: Đồ mặc kèm"
                  />
                  <span
                    className={`w-2 h-2 rounded-full ${selectedHeadwear || selectedJewelries.length > 0 ? 'bg-emerald-400' : 'bg-stone-600'}`}
                    title="Bước 4: Phụ kiện"
                  />
                </div>

                {/* Trạng thái tóm tắt ngắn gọn */}
                <div className="hidden xs:flex items-center gap-1.5 font-medium text-[11px] sm:text-xs">
                  {hasBlockError ? (
                    <span className="text-red-400 flex items-center gap-1">
                      <AlertTriangle className="w-3.5 h-3.5 text-red-400" />
                      Xung đột quy chuẩn
                    </span>
                  ) : hasWarnNotice ? (
                    <span className="text-amber-300 flex items-center gap-1">
                      <AlertTriangle className="w-3.5 h-3.5 text-amber-300" />
                      Có lưu ý
                    </span>
                  ) : currentGarmentItems.filter(Boolean).length > 0 ? (
                    <span className="text-stone-300 max-w-[120px] sm:max-w-[160px] truncate">
                      {currentGarmentItems.filter(Boolean)[0].name}
                    </span>
                  ) : selectedContext ? (
                    <span className="text-stone-300">Đã chọn bối cảnh</span>
                  ) : (
                    <span className="text-stone-400">Bước {activeTab}/4</span>
                  )}
                </div>

                <ChevronUp className="w-3.5 h-3.5 text-stone-400" />
              </button>

              <div className="h-4 w-px bg-stone-700/80 mx-0.5" />

              {/* Các nút hành động ngữ cảnh tùy theo trạng thái */}
              <div className="flex items-center gap-1.5">
                {isReadyToValidate ? (
                  <button
                    type="button"
                    onClick={handleValidateOutfit}
                    className="px-3 sm:px-3.5 py-1 rounded-full bg-red-600 hover:bg-red-700 text-white font-semibold text-[11px] sm:text-xs flex items-center gap-1.5 shadow-sm active:scale-95 transition-all"
                  >
                    <Sparkles className="w-3 h-3 text-amber-200" />
                    <span>Xem kết quả ✦</span>
                  </button>
                ) : null}

                {/* Nút điều hướng nhanh đến bước tiếp theo nếu chưa ở tab cuối */}
                {activeTab === 1 && (
                  <button
                    type="button"
                    disabled={!selectedContext}
                    onClick={() => goToTab(2)}
                    className={`px-3 py-1 rounded-full text-[11px] sm:text-xs font-medium flex items-center gap-1 transition-all ${
                      selectedContext
                        ? 'bg-stone-800 hover:bg-stone-700 text-white cursor-pointer active:scale-95'
                        : 'bg-stone-800/50 text-stone-500 cursor-not-allowed'
                    }`}
                  >
                    <span>Cổ phục</span>
                    <ChevronRight className="w-3 h-3" />
                  </button>
                )}

                {activeTab === 2 && (
                  <button
                    type="button"
                    disabled={selectedGarments.length === 0}
                    onClick={() => goToTab(3)}
                    className={`px-3.5 py-1.5 rounded-full text-xs font-semibold flex items-center gap-1.5 transition-all shadow-sm ${
                      selectedGarments.length > 0
                        ? 'bg-stone-800 hover:bg-stone-700 text-white cursor-pointer active:scale-95'
                        : 'bg-stone-800/60 text-stone-500 cursor-not-allowed'
                    }`}
                  >
                    <span>Mặc kèm</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                )}

                {activeTab === 3 && (
                  <button
                    type="button"
                    onClick={() => goToTab(4)}
                    className="px-3.5 py-1.5 rounded-full bg-stone-800 hover:bg-stone-700 text-white text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer active:scale-95 shadow-sm"
                  >
                    <span>Phụ kiện</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* MODAL XEM CHI TIẾT TRƯỚC KHI CHỌN */}
      {previewGarment && (
        <GarmentDetailModal
          garment={previewGarment}
          onClose={() => setPreviewGarment(null)}
          onSelectForStudio={(id, forceSelect) => {
            const g = GARMENTS.find((item) => item.id === id);
            const isFootwear = g?.type === 'shoes' || g?.category === 'traditional_footwear';
            if (isFootwear) {
              if (forceSelect === true) setSelectedShoes(id);
              else if (forceSelect === false) setSelectedShoes((prev) => (prev === id ? null : prev));
              else setSelectedShoes((prev) => (prev === id ? null : id));
            } else {
              handleSelectGarment(id, forceSelect);
            }
          }}
          selectedGender={selectedGender === 'female' ? 'Female' : 'Male'}
          isSelected={
            previewGarment.type === 'shoes' || previewGarment.category === 'traditional_footwear'
              ? selectedShoes === previewGarment.id
              : selectedGarments.includes(previewGarment.id)
          }
          currentColorHex={itemColors[previewGarment.id]?.hex || null}
          onApplyColor={(hex) => {
            setItemColors((prev) => ({
              ...prev,
              [previewGarment.id]: { hex, intensity: 0.85 }
            }));
            autoSelectItem(previewGarment.id);
          }}
        />
      )}

      {previewCasual && (
        <CasualDetailModal
          item={previewCasual}
          onClose={() => setPreviewCasual(null)}
          onSelectForStudio={(id, forceSelect) => {
            const it = CASUAL_ITEMS.find((c) => c.id === id) || GARMENTS.find((g) => g.id === id);
            if (it) handleSmartSelectCasual(it, forceSelect);
          }}
          selectedGender={selectedGender === 'female' ? 'Female' : 'Male'}
          isSelected={
            selectedInner === previewCasual.id ||
            selectedBottom === previewCasual.id ||
            selectedShoes === previewCasual.id
          }
          currentColorHex={itemColors[previewCasual.id]?.hex || null}
          onApplyColor={(hex) => {
            setItemColors((prev) => ({
              ...prev,
              [previewCasual.id]: { hex, intensity: 0.85 }
            }));
            autoSelectItem(previewCasual.id);
          }}
        />
      )}

      {previewAccessory && (
        <AccessoryDetailModal
          accessory={previewAccessory}
          onClose={() => setPreviewAccessory(null)}
          onSelectHeadwear={(it, forceSelect) => handleSmartSelectAccessory(it, forceSelect)}
          onToggleJewelry={(it, forceSelect) => handleSmartSelectAccessory(it, forceSelect)}
          isSelectedHeadwear={previewAccessory.id === selectedHeadwear}
          isSelectedJewelry={selectedJewelries.includes(previewAccessory.id)}
          selectedGender={selectedGender === 'female' ? 'Female' : 'Male'}
          currentColorHex={itemColors[previewAccessory.id]?.hex || null}
          onApplyColor={(hex) => {
            setItemColors((prev) => ({
              ...prev,
              [previewAccessory.id]: { hex, intensity: 0.85 }
            }));
            autoSelectItem(previewAccessory.id);
          }}
        />
      )}

      {/* MODAL ĐỔI MÀU NHANH TRỰC TIẾP TẠI STUDIO */}
      {colorCustomizerTarget && (
        <ColorCustomizerModal
          isOpen={Boolean(colorCustomizerTarget)}
          onClose={() => setColorCustomizerTarget(null)}
          itemName={colorCustomizerTarget.name}
          itemCategoryName={colorCustomizerTarget.categoryName}
          originalImageUrl={colorCustomizerTarget.imageUrl}
          currentColorHex={itemColors[colorCustomizerTarget.id]?.hex || null}
          onApplyColor={(hex, intensity) => {
            setItemColors((prev) => ({
              ...prev,
              [colorCustomizerTarget.id]: { hex, intensity }
            }));
            // Khi người dùng áp dụng màu mới cho một món đồ, tự động đảm bảo món đồ đó được chọn vào bản phối
            autoSelectItem(colorCustomizerTarget.id);
          }}
        />
      )}
    </div>
  );
};

export default Studio;
