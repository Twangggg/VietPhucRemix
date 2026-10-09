import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Bookmark,
  Sparkles,
  SlidersHorizontal,
  Trash2,
  Calendar,
  AlertTriangle,
  Clock,
  Eye,
  CheckCircle2,
  Info,
  X,
  Scale,
  Cloud,
  CloudUpload,
  Loader2
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import {
  getCloudOutfits,
  deleteCloudOutfit,
  syncLocalDataToCloud,
  subscribeCloudOutfits
} from '../services/firebaseStore';
import { GARMENTS, CASUAL_ITEMS, ACCESSORIES, CONTEXTS, OUTFIT_COMBINATIONS } from '../data';
import { OutfitCombination } from '../types';
import { resolveItemByGender, getSafeImageUrl } from '../utils/helpers';
import { validateOutfit, resolveGarmentBaseId } from '../utils/validationEngine';
import {
  getSavedOutfits,
  deleteSavedOutfit,
  clearCorruptedStorage,
  SavedOutfit
} from '../utils/storage';
import { SafeImage } from '../components/SafeImage';
import { TintedImage } from '../components/TintedImage';
import { OutfitResultView } from '../components/OutfitResultView';
import { CompareResult, compareOutfits } from '../utils/compareEngine';

interface CollectionProps {
  onNavigateToStudio: () => void;
  onOpenAuthModal?: () => void;
}

export const Collection: React.FC<CollectionProps> = ({ onNavigateToStudio, onOpenAuthModal }) => {
  const [savedList, setSavedList] = useState<SavedOutfit[]>([]);
  const [isCorrupted, setIsCorrupted] = useState<boolean>(false);
  const [corruptedError, setCorruptedError] = useState<string>('');
  const [viewingOutfitId, setViewingOutfitId] = useState<string | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [showClearConfirm, setShowClearConfirm] = useState<boolean>(false);
  const [actionError, setActionError] = useState<string | null>(null);

  const { currentUser } = useAuth();
  const [isLoadingCloud, setIsLoadingCloud] = useState<boolean>(Boolean(currentUser));
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [syncSuccessMsg, setSyncSuccessMsg] = useState<string | null>(null);

  const navigate = useNavigate();
  // Compare mode states
  const [isCompareMode, setIsCompareMode] = useState<boolean>(false);
  const [selectedForCompare, setSelectedForCompare] = useState<SavedOutfit[]>([]);
  const [showLookbookPicker, setShowLookbookPicker] = useState<boolean>(false);

  // Tải danh sách bộ phối: Firebase Cloud Firestore là nguồn dữ liệu chính
  useEffect(() => {
    if (currentUser) {
      setIsLoadingCloud(true);
      // Tự động sao lưu dữ liệu cục bộ lên đám mây ngay khi đăng nhập
      syncLocalDataToCloud(currentUser.uid).catch((err) => console.warn(err));

      // Lắng nghe dữ liệu thời gian thực (Realtime Subscription) từ Firestore
      const unsubscribe = subscribeCloudOutfits(
        currentUser.uid,
        (cloudOutfits) => {
          setSavedList(cloudOutfits);
          setIsLoadingCloud(false);
          setIsCorrupted(false);
        },
        (error) => {
          console.error('Lỗi kết nối Firebase Firestore:', error);
          setIsLoadingCloud(false);
          const result = getSavedOutfits();
          setSavedList(result.outfits);
        }
      );

      return () => unsubscribe();
    } else {
      // Chế độ Khách (Guest Mode)
      setIsLoadingCloud(false);
      refreshLocalOutfits();
    }
  }, [currentUser]);

  // Cập nhật lại danh sách bộ phối lưu trên máy khách
  const refreshLocalOutfits = () => {
    const result = getSavedOutfits();
    setIsCorrupted(result.isCorrupted);
    setCorruptedError(result.rawError || '');
    setSavedList(result.isCorrupted ? [] : result.outfits);
  };

  // Xóa một bộ phối: Xóa trực tiếp trên Firebase Cloud Firestore
  const handleDelete = async (id: string) => {
    setActionError(null);
    deleteSavedOutfit(id); // Dọn dẹp cả bản sao local nếu có

    if (currentUser) {
      try {
        await deleteCloudOutfit(currentUser.uid, id);
      } catch (err) {
        console.warn('Lỗi khi xóa trên cloud:', err);
        setActionError('Xóa bộ phối trên Đám mây thất bại. Vui lòng kiểm tra kết nối.');
      }
    } else {
      // Nếu là khách, cập nhật lại state từ local
      refreshLocalOutfits();
    }

    setConfirmDeleteId(null);
  };

  // Đồng bộ thủ công dữ liệu Local lên Cloud
  const handleManualSync = async () => {
    if (!currentUser) return;
    setIsSyncing(true);
    setSyncSuccessMsg(null);
    try {
      const res = await syncLocalDataToCloud(currentUser.uid);
      setSyncSuccessMsg(`Đã đồng bộ ${res.syncedOutfitsCount} bộ phối lên Đám mây thành công!`);
      setTimeout(() => setSyncSuccessMsg(null), 3500);
    } catch {
      setActionError('Đồng bộ lên đám mây thất bại. Vui lòng kiểm tra kết nối.');
    } finally {
      setIsSyncing(false);
    }
  };

  // Đặt lại dữ liệu hỏng khi người dùng xác nhận: kiểm tra kết quả và báo lỗi nếu thất bại
  const handleClearCorrupted = () => {
    setActionError(null);
    const result = clearCorruptedStorage();
    if (!result.success) {
      setActionError(result.error || 'Đặt lại dữ liệu lưu trữ thất bại. Dữ liệu đã được giữ nguyên an toàn.');
      return;
    }
    setShowClearConfirm(false);
    refreshLocalOutfits();
  };

  // Format ngày giờ dễ đọc
  const formatDate = (isoString: string) => {
    try {
      const date = new Date(isoString);
      if (isNaN(date.getTime())) return 'Gần đây';
      return date.toLocaleDateString('vi-VN', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return 'Gần đây';
    }
  };

  const toggleCompareSelection = (outfit: SavedOutfit) => {
    if (selectedForCompare.find((o) => o.id === outfit.id)) {
      setSelectedForCompare(selectedForCompare.filter((o) => o.id !== outfit.id));
    } else {
      if (selectedForCompare.length < 2) {
        setSelectedForCompare([...selectedForCompare, outfit]);
      }
    }
  };

  const handleRunCompare = () => {
    if (selectedForCompare.length !== 2) return;
    const outfitA = selectedForCompare[0];
    const outfitB = selectedForCompare[1];

    const inputA = {
      itemIds: [outfitA.costumeId, outfitA.innerId, outfitA.bottomId, outfitA.shoesId, outfitA.headwearId, ...(outfitA.jewelryIds || [])].flat().filter(Boolean) as string[],
      contextId: outfitA.contextId,
      validationResults: validateOutfit({
        costumeId: outfitA.costumeId,
        contextId: outfitA.contextId,
        gender: outfitA.gender,
        innerId: outfitA.innerId,
        bottomId: outfitA.bottomId,
        shoesId: outfitA.shoesId,
        headwearId: outfitA.headwearId,
        jewelryIds: outfitA.jewelryIds
      })
    };

    const inputB = {
      itemIds: [outfitB.costumeId, outfitB.innerId, outfitB.bottomId, outfitB.shoesId, outfitB.headwearId, ...(outfitB.jewelryIds || [])].flat().filter(Boolean) as string[],
      contextId: outfitB.contextId,
      validationResults: validateOutfit({
        costumeId: outfitB.costumeId,
        contextId: outfitB.contextId,
        gender: outfitB.gender,
        innerId: outfitB.innerId,
        bottomId: outfitB.bottomId,
        shoesId: outfitB.shoesId,
        headwearId: outfitB.headwearId,
        jewelryIds: outfitB.jewelryIds
      })
    };

    const result = compareOutfits(inputA, inputB);
    navigate('/compare', {
      state: {
        result,
        outfitAName: outfitA.name,
        outfitBName: outfitB.name,
        inputA: { ...inputA, gender: outfitA.gender },
        inputB: { ...inputB, gender: outfitB.gender }
      }
    });
  };

  const handleCompareWithLookbook = (lookbookOutfit: OutfitCombination) => {
    setShowLookbookPicker(false);

    if (selectedForCompare.length < 1) return;

    const outfitA = selectedForCompare[0];
    const inputA = {
      itemIds: [outfitA.costumeId, outfitA.innerId, outfitA.bottomId, outfitA.shoesId, outfitA.headwearId, ...(outfitA.jewelryIds || [])].flat().filter(Boolean) as string[],
      contextId: outfitA.contextId,
      validationResults: validateOutfit({
        costumeId: outfitA.costumeId,
        contextId: outfitA.contextId,
        gender: outfitA.gender,
        innerId: outfitA.innerId,
        bottomId: outfitA.bottomId,
        shoesId: outfitA.shoesId,
        headwearId: outfitA.headwearId,
        jewelryIds: outfitA.jewelryIds || []
      })
    };

    const comp = lookbookOutfit.composition;
    const costumeId = comp.outer_formal || comp.outer_traditional || comp.top || '';
    const jewelryIds = comp.jewelry || [];

    const contextId = lookbookOutfit.applicable_events[0] || 'C01';

    const validationB = validateOutfit({
      costumeId: costumeId,
      contextId: contextId,
      gender: lookbookOutfit.gender.toLowerCase() as 'male' | 'female',
      innerId: comp.inner || null,
      bottomId: comp.bottom_pants || comp.bottom_skirt || null,
      shoesId: comp.shoes || comp.traditional_footwear || null,
      headwearId: comp.headwear || null,
      jewelryIds: jewelryIds
    });

    const itemIds = [costumeId, comp.inner, comp.bottom_pants, comp.bottom_skirt, comp.shoes, comp.traditional_footwear, comp.headwear, ...jewelryIds].filter(Boolean) as string[];

    const inputB = {
      itemIds,
      contextId: contextId,
      validationResults: validationB
    };

    const result = compareOutfits(inputA, inputB);
    navigate('/compare', {
      state: {
        result,
        outfitAName: outfitA.name,
        outfitBName: lookbookOutfit.name,
        inputA: { ...inputA, gender: outfitA.gender },
        inputB: { ...inputB, gender: lookbookOutfit.gender }
      }
    });
  };


  // 1. MÀN HÌNH XEM CHI TIẾT BỘ PHỐI ĐÃ LƯU
  if (viewingOutfitId) {
    const viewingOutfit = savedList.find((o) => o.id === viewingOutfitId);
    if (viewingOutfit) {
      const primaryCostumeId = Array.isArray(viewingOutfit.costumeId)
        ? viewingOutfit.costumeId[0]
        : viewingOutfit.costumeId;
      const baseGarmentId = resolveGarmentBaseId(primaryCostumeId);
      const foundGarment = GARMENTS.find(
        (g) => g.id === primaryCostumeId || g.id === baseGarmentId
      );
      const foundContext = CONTEXTS.find((c) => c.id === viewingOutfit.contextId);
      const foundInner = viewingOutfit.innerId
        ? CASUAL_ITEMS.find((c) => c.id === viewingOutfit.innerId)
        : null;
      const foundBottom = viewingOutfit.bottomId
        ? CASUAL_ITEMS.find((c) => c.id === viewingOutfit.bottomId)
        : null;
      const foundShoes = viewingOutfit.shoesId
        ? CASUAL_ITEMS.find((c) => c.id === viewingOutfit.shoesId) ||
        GARMENTS.find((g) => g.id === viewingOutfit.shoesId)
        : null;
      const foundHeadwear = viewingOutfit.headwearId
        ? ACCESSORIES.find((a) => a.id === viewingOutfit.headwearId)
        : null;
      const foundJewelries = ACCESSORIES.filter((a) =>
        viewingOutfit.jewelryIds.includes(a.id)
      );

      // Chạy lại validator tại thời điểm xem để đảm bảo tính nhất quán
      const currentValidation = validateOutfit({
        costumeId: viewingOutfit.costumeId,
        contextId: viewingOutfit.contextId,
        gender: viewingOutfit.gender,
        innerId: viewingOutfit.innerId,
        bottomId: viewingOutfit.bottomId,
        shoesId: viewingOutfit.shoesId,
        headwearId: viewingOutfit.headwearId,
        jewelryIds: viewingOutfit.jewelryIds
      });

      const isOutdatedOrBlocked =
        currentValidation.some((r) => r.severity === 'BLOCK') ||
        !foundGarment ||
        !foundContext;

      // Fallback an toàn nếu garment trong catalog bị thay đổi ID
      const fallbackGarment = foundGarment || {
        id: String(primaryCostumeId || 'garment_fallback'),
        name: String(primaryCostumeId || 'Cổ phục'),
        origin: 'Dữ liệu di sản',
        characteristics: 'Món đồ có thể đã thay đổi trong danh mục hiện tại.',
        usage_context: '',
        colors: '',
        accessories: '',
        significance: '',
        notes: '',
        references: '',
        type: 'top' as const,
        category: 'top' as const,
        gender: 'unisex' as const,
        formality: 'traditional' as const,
        image_url: ''
      };

      return (
        <div className="min-h-screen bg-[#FBF9F5] text-stone-900 pb-36 pt-4">
          <div className="max-w-5xl mx-auto px-3 sm:px-6 mb-4">
            <button
              onClick={() => setViewingOutfitId(null)}
              className="text-xs font-semibold text-stone-600 hover:text-stone-900 flex items-center gap-1.5 transition-colors cursor-pointer py-1"
            >
              <span>← Quay lại danh sách bộ sưu tập</span>
            </button>
          </div>

          <OutfitResultView
            selectedGender={viewingOutfit.gender}
            contextItem={foundContext || null}
            garmentItem={fallbackGarment}
            innerItem={foundInner || null}
            bottomItem={foundBottom || null}
            shoesItem={foundShoes || null}
            headwearItem={foundHeadwear || null}
            jewelryItems={foundJewelries}
            validationResults={currentValidation}
            onBackToStudio={() => setViewingOutfitId(null)}
            backButtonText="Quay lại danh sách"
            isFromCollection={true}
            isOutdatedOrBlocked={isOutdatedOrBlocked}
            initialItemColors={viewingOutfit.itemColors}
          />
        </div>
      );
    }
  }

  // 2. MÀN HÌNH DANH SÁCH BỘ SƯU TẬP
  return (
    <div className="min-h-screen bg-[#FBF9F5] text-stone-900 pb-36">
      <div className="max-w-5xl mx-auto px-3 sm:px-6 pt-3 pb-6 space-y-6">
        {/* HEADER BỘ SƯU TẬP */}
        <div className="border-b border-stone-200/80 pb-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
            <div>
              <div className="flex items-center gap-2">
                <Bookmark className="w-5 h-5 text-red-700" />
                <h1 className="text-2xl sm:text-3xl font-serif font-bold text-stone-900 tracking-tight">
                  Bộ Sưu Tập Cá Nhân
                </h1>
              </div>
              <p className="text-xs sm:text-sm text-stone-500 mt-1 max-w-xl">
                Những bản phối tâm đắc đã được kiểm định quy chuẩn và lưu giữ.
              </p>
            </div>

            <div className="flex flex-col gap-2 self-start sm:self-auto">
              {currentUser ? (
                <div className="flex items-center gap-2">
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200/80 text-[11px] text-emerald-800 font-sans font-medium">
                    <Cloud className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span>Đồng bộ Đám mây ({currentUser.displayName || currentUser.email?.split('@')[0]})</span>
                  </div>
                  <button
                    type="button"
                    onClick={handleManualSync}
                    disabled={isSyncing}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-white hover:bg-stone-50 border border-stone-200/80 text-[11px] text-stone-700 font-medium transition-colors cursor-pointer disabled:opacity-60 shadow-2xs"
                    title="Đồng bộ lại dữ liệu lên Đám mây"
                  >
                    {isSyncing ? (
                      <Loader2 className="w-3 h-3 animate-spin text-stone-500" />
                    ) : (
                      <CloudUpload className="w-3 h-3 text-stone-500" />
                    )}
                    <span>Đồng bộ</span>
                  </button>
                </div>
              ) : (
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-stone-100 border border-stone-200/70 text-[11px] text-stone-500 font-sans">
                  <Info className="w-3.5 h-3.5 text-stone-400 shrink-0" />
                  <span>Lưu trên trình duyệt này • Đăng nhập để lưu vĩnh viễn trên Cloud</span>
                </div>
              )}

              {!isCorrupted && (
                <button
                  onClick={() => {
                    if (savedList.length === 0) {
                      setActionError('Bạn cần lưu ít nhất 1 bộ phối để so sánh.');
                      return;
                    }
                    setIsCompareMode(!isCompareMode);
                    setSelectedForCompare([]);
                  }}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold shadow-xs transition-colors cursor-pointer border ${isCompareMode
                      ? 'bg-stone-900 text-white border-stone-900'
                      : 'bg-white text-stone-700 border-stone-200 hover:bg-stone-50'
                    }`}
                >
                  {isCompareMode ? 'Hủy so sánh' : 'So sánh Outfit'}
                </button>
              )}
            </div>
          </div>

          {isCompareMode && (
            <div className="mt-4 p-4 bg-red-50 border border-red-100 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4 animate-in fade-in slide-in-from-top-2 duration-200">
              <div className="flex items-center gap-2 text-red-900 text-sm font-medium">
                <Scale className="w-5 h-5 text-red-700" />
                <span>Chọn bộ phối để so sánh ({selectedForCompare.length}/2)</span>
              </div>
              <div className="flex items-center gap-2 w-full sm:w-auto">
                {selectedForCompare.length === 1 && (
                  <button
                    onClick={() => setShowLookbookPicker(true)}
                    className="px-4 py-2 rounded-xl text-sm font-semibold transition-colors bg-white text-red-700 border border-red-200 hover:bg-red-50 hover:border-red-300 shadow-sm flex-1 sm:flex-none cursor-pointer"
                  >
                    So sánh với Bộ phối mẫu
                  </button>
                )}
                <button
                  onClick={handleRunCompare}
                  disabled={selectedForCompare.length !== 2}
                  className={`px-6 py-2 rounded-xl text-sm font-bold transition-all flex-1 sm:flex-none ${selectedForCompare.length === 2
                      ? 'bg-red-700 text-white hover:bg-red-800 shadow-md hover:shadow-lg active:scale-95 cursor-pointer'
                      : 'bg-stone-200 text-stone-400 cursor-not-allowed'
                    }`}
                >
                  So sánh ngay
                </button>
              </div>
            </div>
          )}
        </div>

        {/* CẢNH BÁO LỖI THAO TÁC XÓA HOẶC ĐẶT LẠI */}
        {/* THÔNG BÁO ĐỒNG BỘ ĐÁM MÂY THÀNH CÔNG */}
        {syncSuccessMsg && (
          <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-950 flex items-center justify-between gap-3 animate-in fade-in duration-200">
            <div className="flex items-center gap-2.5 text-xs sm:text-sm">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span className="font-medium leading-relaxed">{syncSuccessMsg}</span>
            </div>
            <button
              type="button"
              onClick={() => setSyncSuccessMsg(null)}
              className="p-1 rounded-lg text-emerald-400 hover:text-emerald-700 hover:bg-emerald-100 transition-colors cursor-pointer shrink-0"
              title="Đóng thông báo"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {actionError && (
          <div className="p-4 rounded-2xl bg-red-50 border border-red-200 text-red-950 flex items-center justify-between gap-3 animate-in fade-in duration-200">
            <div className="flex items-center gap-2.5 text-xs sm:text-sm">
              <AlertTriangle className="w-4 h-4 text-red-600 shrink-0" />
              <span className="font-medium leading-relaxed">{actionError}</span>
            </div>
            <button
              type="button"
              onClick={() => setActionError(null)}
              className="p-1 rounded-lg text-red-400 hover:text-red-700 hover:bg-red-100 transition-colors cursor-pointer shrink-0"
              title="Đóng thông báo"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* CẢNH BÁO NẾU DỮ LIỆU LƯU TRỮ BỊ HỎNG */}
        {isCorrupted && (
          <div className="p-4 sm:p-5 rounded-2xl bg-amber-50 border border-amber-200 text-amber-950 space-y-3">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
              <div className="space-y-1">
                <h4 className="font-bold text-sm">Dữ liệu lưu trữ gặp vấn đề cấu trúc</h4>
                <p className="text-xs text-amber-800 leading-relaxed">
                  Trình duyệt phát hiện dữ liệu bộ sưu tập có thể đã bị sửa đổi hoặc không đọc được ({corruptedError}). Dữ liệu cũ vẫn được giữ nguyên an toàn, không tự động ghi đè.
                </p>
              </div>
            </div>

            <div className="pt-1 flex items-center gap-3">
              <button
                onClick={() => setShowClearConfirm(true)}
                className="px-3.5 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-semibold shadow-xs transition-colors cursor-pointer"
              >
                Đặt lại dữ liệu hỏng
              </button>
            </div>
          </div>
        )}

        {/* MODAL XÁC NHẬN ĐẶT LẠI DỮ LIỆU HỎNG */}
        {showClearConfirm && (
          <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200">
            <div className="bg-white rounded-3xl p-6 max-w-sm w-full space-y-4 shadow-xl border border-stone-200">
              <div className="flex items-center gap-2.5 text-amber-700">
                <AlertTriangle className="w-5 h-5 shrink-0" />
                <h3 className="font-bold text-base">Xác nhận đặt lại</h3>
              </div>
              <p className="text-xs text-stone-600 leading-relaxed">
                Thao tác này sẽ xóa vùng lưu trữ bộ sưu tập bị lỗi trên trình duyệt này để bạn có thể lưu các bộ phối mới. Bạn có chắc chắn muốn tiếp tục?
              </p>
              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowClearConfirm(false)}
                  className="px-4 py-2 rounded-xl text-xs font-medium text-stone-600 hover:bg-stone-100 transition-colors"
                >
                  Hủy
                </button>
                <button
                  type="button"
                  onClick={handleClearCorrupted}
                  className="px-4 py-2 rounded-xl text-xs font-semibold bg-red-700 hover:bg-red-800 text-white transition-colors"
                >
                  Xác nhận xóa
                </button>
              </div>
            </div>
          </div>
        )}

        {/* BANNER MỜI ĐĂNG NHẬP LƯU TRỮ TRÊN FIREBASE CLOUD */}
        {!currentUser && (
          <div className="p-4 sm:p-5 rounded-3xl bg-gradient-to-r from-red-50 via-stone-50 to-stone-100 border border-red-200/70 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3.5">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-2xl bg-red-700 text-white flex items-center justify-center shrink-0 shadow-xs">
                <Cloud className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm sm:text-base font-bold text-stone-900 font-serif">
                  Lưu trữ Bộ sưu tập vĩnh viễn trên Đám Mây (Firebase)
                </h3>
                <p className="text-xs text-stone-600 mt-0.5 leading-relaxed">
                  Đăng nhập tài khoản để đồng bộ và truy cập các bộ phối của bạn trên mọi thiết bị.
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={onOpenAuthModal}
              className="self-start sm:self-auto px-4 py-2 rounded-xl bg-red-700 hover:bg-red-800 text-white text-xs font-semibold shadow-xs transition-all cursor-pointer shrink-0 active:scale-95"
            >
              Đăng nhập ngay
            </button>
          </div>
        )}

        {/* LOADING STATE KHI ĐANG TẢI TỪ FIREBASE */}
        {isLoadingCloud && (
          <div className="py-20 flex flex-col items-center justify-center space-y-3 font-sans">
            <Loader2 className="w-8 h-8 animate-spin text-red-700" />
            <p className="text-xs font-medium text-stone-500">
              Đang tải Bộ sưu tập từ Firebase Cloud...
            </p>
          </div>
        )}

        {/* TRẠNG THÁI RỖNG */}
        {!isLoadingCloud && !isCorrupted && savedList.length === 0 && (
          <div className="py-16 sm:py-20 px-4 text-center bg-white rounded-3xl border border-dashed border-stone-200 max-w-xl mx-auto space-y-4 shadow-2xs">
            <div className="w-14 h-14 rounded-2xl bg-stone-100 flex items-center justify-center mx-auto text-stone-400">
              <Bookmark className="w-7 h-7 stroke-[1.5]" />
            </div>

            <div className="space-y-1.5">
              <h3 className="text-lg font-bold text-stone-900 font-serif">
                Bộ sưu tập đang trống
              </h3>
              <p className="text-xs text-stone-500 max-w-sm mx-auto leading-relaxed">
                Bạn chưa lưu bộ phối nào. Hãy vào Phòng phối đồ để sáng tạo, kiểm định và lưu giữ những bản phối ưng ý nhất.
              </p>
              <p className="text-[11px] text-stone-400 font-sans mt-1">
                {currentUser
                  ? 'Được đồng bộ an toàn trên Firebase Cloud Firestore.'
                  : 'Lưu trên thiết bị này • Đăng nhập để lưu vĩnh viễn trên Đám Mây.'}
              </p>
            </div>

            <div className="pt-2">
              <button
                type="button"
                onClick={onNavigateToStudio}
                className="px-6 py-2.5 rounded-full bg-red-700 hover:bg-red-800 text-white text-xs font-semibold flex items-center gap-2 mx-auto shadow-sm active:scale-95 transition-all cursor-pointer"
              >
                <SlidersHorizontal className="w-3.5 h-3.5" />
                <span>Bắt đầu phối đồ</span>
              </button>
            </div>
          </div>
        )}

        {/* DANH SÁCH CÁC BẢN PHỐI ĐÃ LƯU (MỚI NHẤT TRƯỚC) */}
        {!isCorrupted && savedList.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
            {savedList.map((outfit) => {
              const primaryCostumeId = Array.isArray(outfit.costumeId)
                ? outfit.costumeId[0]
                : outfit.costumeId;
              const baseGarmentId = resolveGarmentBaseId(primaryCostumeId);
              const garment = GARMENTS.find(
                (g) => g.id === primaryCostumeId || g.id === baseGarmentId
              );
              const context = CONTEXTS.find((c) => c.id === outfit.contextId);

              // Ảnh đại diện từ Cổ phục tương ứng đã phân giải theo giới tính
              const resolvedGarment = garment ? resolveItemByGender(garment, outfit.gender) : null;
              const imageUrl = resolvedGarment
                ? getSafeImageUrl(resolvedGarment.resolvedImageUrl || resolvedGarment.image_url)
                : '';

              const isConfirmingThis = confirmDeleteId === outfit.id;

              // Kiểm tra validation để hiển thị huy hiệu cảnh báo nếu có
              const cardValidation = validateOutfit({
                costumeId: outfit.costumeId,
                contextId: outfit.contextId,
                gender: outfit.gender,
                innerId: outfit.innerId,
                bottomId: outfit.bottomId,
                shoesId: outfit.shoesId,
                headwearId: outfit.headwearId,
                jewelryIds: outfit.jewelryIds
              });
              const cardWarnings = cardValidation.filter((r) => r.severity === 'WARN');
              const cardBlocks = cardValidation.filter((r) => r.severity === 'BLOCK');

              const isSelected = selectedForCompare.find((o) => o.id === outfit.id);

              return (
                <div
                  key={outfit.id}
                  onClick={() => {
                    if (isCompareMode) {
                      toggleCompareSelection(outfit);
                    }
                  }}
                  className={`bg-white rounded-3xl overflow-hidden shadow-xs flex flex-col group transition-all duration-300 relative ${isCompareMode ? 'cursor-pointer' : ''
                    } ${isSelected
                      ? 'border-2 border-red-500 ring-4 ring-red-500/10'
                      : 'border border-stone-200/80 hover:shadow-md hover:border-stone-300'
                    }`}
                >
                  {isSelected && (
                    <div className="absolute top-2 right-2 z-10 bg-red-700 text-white rounded-full p-1 shadow-md">
                      <CheckCircle2 className="w-5 h-5" />
                    </div>
                  )}
                  {/* Khung Ảnh đại diện Cổ phục */}
                  <div className="aspect-[4/3] w-full overflow-hidden bg-[#FAF7F2] relative flex items-center justify-center p-3">
                    {imageUrl ? (
                      <TintedImage
                        src={imageUrl}
                        colorHex={
                          outfit.itemColors?.[primaryCostumeId]?.hex ||
                          (resolvedGarment ? outfit.itemColors?.[resolvedGarment.id]?.hex : null) ||
                          (garment ? outfit.itemColors?.[garment.id]?.hex : null) ||
                          (baseGarmentId ? outfit.itemColors?.[baseGarmentId]?.hex : null) ||
                          null
                        }
                        intensity={
                          outfit.itemColors?.[primaryCostumeId]?.intensity ??
                          (resolvedGarment ? outfit.itemColors?.[resolvedGarment.id]?.intensity : undefined) ??
                          (garment ? outfit.itemColors?.[garment.id]?.intensity : undefined) ??
                          (baseGarmentId ? outfit.itemColors?.[baseGarmentId]?.intensity : undefined) ??
                          0.85
                        }
                        alt={outfit.name}
                        fallbackText={outfit.name}
                        className="w-full h-full flex items-center justify-center"
                        imgClassName="w-full h-full object-contain mix-blend-multiply group-hover:scale-105 transition-transform duration-500"
                      />
                    ) : (
                      <Sparkles className="w-10 h-10 text-stone-300" />
                    )}

                    {/* Huy hiệu giới tính */}
                    <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-xs text-stone-700 text-[10px] font-sans font-medium px-2.5 py-0.5 rounded-full shadow-2xs border border-stone-200/60">
                      {outfit.gender === 'female' ? 'Phom Nữ' : 'Phom Nam'}
                    </div>

                    {/* Thời điểm lưu */}
                    <div className="absolute bottom-2.5 right-3 text-[10px] text-stone-400 font-sans flex items-center gap-1 bg-white/90 backdrop-blur-xs px-2 py-0.5 rounded-md">
                      <Clock className="w-3 h-3" />
                      <span>{formatDate(outfit.createdAt)}</span>
                    </div>
                  </div>

                  {/* Nội dung Card */}
                  <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-[10px] uppercase tracking-wider font-mono text-red-700 font-semibold block">
                          {context?.name || outfit.contextId}
                        </span>
                        {cardBlocks.length > 0 ? (
                          <span className="inline-flex items-center gap-1 text-[10px] text-red-700 bg-red-50 border border-red-200/60 px-2 py-0.5 rounded-md font-sans">
                            <AlertTriangle className="w-3 h-3 text-red-600 shrink-0" />
                            <span>Cần kiểm tra lại</span>
                          </span>
                        ) : cardWarnings.length > 0 ? (
                          <span className="inline-flex items-center gap-1 text-[10px] text-amber-800 bg-amber-50 border border-amber-200/60 px-2 py-0.5 rounded-md font-sans">
                            <AlertTriangle className="w-3 h-3 text-amber-600 shrink-0" />
                            <span>Có {cardWarnings.length} lưu ý</span>
                          </span>
                        ) : null}
                      </div>
                      <h3 className="text-base font-bold text-stone-900 tracking-tight leading-snug line-clamp-2 group-hover:text-red-900 transition-colors">
                        {outfit.name}
                      </h3>
                      {garment && (
                        <p className="text-xs text-stone-500 line-clamp-1">
                          Cổ phục: {garment.name}
                        </p>
                      )}
                    </div>

                    {/* HÀNG NÚT THAO TÁC */}
                    <div className="pt-3 border-t border-stone-100 flex items-center justify-between gap-2">
                      {isConfirmingThis ? (
                        /* XÁC NHẬN XÓA TẠI CHỖ */
                        <div className="w-full flex items-center justify-between gap-2 bg-red-50 p-1.5 rounded-xl border border-red-200 animate-in fade-in duration-150">
                          <span className="text-[11px] font-medium text-red-900 pl-1">
                            Xác nhận xóa?
                          </span>
                          <div className="flex items-center gap-1.5">
                            <button
                              type="button"
                              onClick={() => setConfirmDeleteId(null)}
                              className="px-2.5 py-1 rounded-lg text-xs font-medium text-stone-600 hover:bg-white transition-colors"
                            >
                              Hủy
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDelete(outfit.id)}
                              className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-red-700 text-white hover:bg-red-800 transition-colors"
                            >
                              Xóa
                            </button>
                          </div>
                        </div>
                      ) : (
                        <>
                          <button
                            type="button"
                            onClick={() => setConfirmDeleteId(outfit.id)}
                            className="p-2 rounded-xl text-stone-400 hover:text-red-700 hover:bg-red-50 transition-colors cursor-pointer"
                            title="Xóa bộ phối này"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>

                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setViewingOutfitId(outfit.id);
                            }}
                            className="px-4 py-2 rounded-xl bg-stone-900 hover:bg-stone-800 text-white text-xs font-semibold flex items-center gap-1.5 shadow-2xs transition-all active:scale-95 cursor-pointer ml-auto"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            <span>Xem bộ phối</span>
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {showLookbookPicker && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl p-6 w-full max-w-lg max-h-[75vh] flex flex-col shadow-xl border border-stone-200">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-lg text-stone-900">Chọn bộ phối mẫu</h3>
              <button onClick={() => setShowLookbookPicker(false)} className="p-2 hover:bg-stone-100 rounded-full transition-colors cursor-pointer">
                <X className="w-5 h-5 text-stone-500" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto pr-2 space-y-3">
              {OUTFIT_COMBINATIONS.map(outfit => (
                <div
                  key={outfit.id}
                  onClick={() => handleCompareWithLookbook(outfit as any)}
                  className="p-4 rounded-xl border border-stone-200 hover:border-red-300 hover:bg-red-50/50 cursor-pointer transition-colors flex items-center justify-between group"
                >
                  <div>
                    <h4 className="font-bold text-stone-900 group-hover:text-red-700">{outfit.name}</h4>
                    <p className="text-xs text-stone-500 mt-1">{outfit.traditional_focus}</p>
                  </div>
                  <span className="text-xs font-semibold text-red-700 bg-red-100 px-3 py-1 rounded-full shrink-0 ml-4 group-hover:bg-red-700 group-hover:text-white transition-colors">
                    Chọn
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Collection;
