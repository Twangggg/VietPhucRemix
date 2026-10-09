import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
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
  Loader2,
  LogIn,
  AlertCircle,
  ArrowLeft
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import {
  deleteCloudOutfit,
  subscribeCloudOutfits,
  getCloudSharedOutfit,
  saveCloudOutfit
} from '../services/firebaseStore';
import { decodeOutfitFromShareString } from '../utils/lookbookStore';
import { GARMENTS, CASUAL_ITEMS, ACCESSORIES, CONTEXTS, OUTFIT_COMBINATIONS } from '../data';
import { OutfitCombination, Garment, CasualItem, AccessoryItem, ContextItem } from '../types';
import { resolveItemByGender, getSafeImageUrl } from '../utils/helpers';
import { validateOutfit, resolveGarmentBaseId } from '../utils/validationEngine';
import {
  getSavedOutfits,
  deleteSavedOutfit,
  clearCorruptedStorage,
  saveOutfit,
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

  const navigate = useNavigate();
  // Compare mode states
  const [isCompareMode, setIsCompareMode] = useState<boolean>(false);
  const [selectedForCompare, setSelectedForCompare] = useState<SavedOutfit[]>([]);
  const [showLookbookPicker, setShowLookbookPicker] = useState<boolean>(false);

  // Trạng thái cho bản phối được chia sẻ qua liên kết URL (?shareId=... hoặc ?shared=...)
  const [searchParams, setSearchParams] = useSearchParams();
  const shareId = searchParams.get('shareId');
  const sharedCode = searchParams.get('shared');

  const [sharedOutfitData, setSharedOutfitData] = useState<{
    garment: Garment;
    context: ContextItem | null;
    inner: CasualItem | null;
    bottom: CasualItem | null;
    shoes: CasualItem | Garment | null;
    headwear: AccessoryItem | null;
    jewelries: AccessoryItem[];
    gender: 'male' | 'female';
    colors?: Record<string, { hex: string | null; intensity: number }>;
    title?: string;
    notes?: string;
    creatorName?: string;
  } | null>(null);
  const [isLoadingShared, setIsLoadingShared] = useState<boolean>(Boolean(shareId || sharedCode));
  const [sharedError, setSharedError] = useState<string | null>(null);
  const [isSharedSaved, setIsSharedSaved] = useState<boolean>(false);
  const [sharedSaveNotice, setSharedSaveNotice] = useState<{
    type: 'success' | 'warn' | 'error' | 'info';
    message: string;
  } | null>(null);

  // Tải bản phối được chia sẻ từ liên kết (Cloud Firestore hoặc mã Base64)
  useEffect(() => {
    const loadShared = async () => {
      if (!shareId && !sharedCode) {
        setSharedOutfitData(null);
        setIsSharedSaved(false);
        setIsLoadingShared(false);
        return;
      }

      setIsLoadingShared(true);
      setSharedError(null);

      try {
        let rawData: {
          garmentId: string;
          contextId?: string | null;
          innerId?: string | null;
          bottomId?: string | null;
          shoesId?: string | null;
          headwearId?: string | null;
          jewelryIds?: string[];
          gender: 'male' | 'female';
          itemColors?: Record<string, { hex: string | null; intensity: number }>;
          title?: string;
          notes?: string;
          creatorName?: string;
        } | null = null;

        if (shareId) {
          const cloudData = await getCloudSharedOutfit(shareId);
          if (cloudData) {
            rawData = cloudData;
          } else {
            setSharedError('Không tìm thấy bản phối được chia sẻ từ liên kết này.');
          }
        } else if (sharedCode) {
          rawData = decodeOutfitFromShareString(sharedCode);
          if (!rawData) {
            setSharedError('Mã liên kết chia sẻ không hợp lệ hoặc đã bị lỗi.');
          }
        }

        if (rawData) {
          const g = GARMENTS.find((item) => item.id.toLowerCase() === rawData!.garmentId.toLowerCase());
          if (!g) {
            setSharedError('Không tìm thấy Cổ phục chính của bản phối này.');
            return;
          }
          const ctx = rawData.contextId ? CONTEXTS.find((c) => c.id === rawData!.contextId) || null : null;
          const inn = rawData.innerId ? CASUAL_ITEMS.find((c) => c.id === rawData!.innerId) || null : null;
          const bot = rawData.bottomId ? CASUAL_ITEMS.find((c) => c.id === rawData!.bottomId) || null : null;
          const sh = rawData.shoesId
            ? CASUAL_ITEMS.find((c) => c.id === rawData!.shoesId) ||
              GARMENTS.find((item) => item.id === rawData!.shoesId) ||
              null
            : null;
          const hw = rawData.headwearId ? ACCESSORIES.find((a) => a.id === rawData!.headwearId) || null : null;
          const jws = (rawData.jewelryIds || [])
            .map((id) => ACCESSORIES.find((a) => a.id === id))
            .filter(Boolean) as AccessoryItem[];

          setSharedOutfitData({
            garment: g,
            context: ctx,
            inner: inn,
            bottom: bot,
            shoes: sh,
            headwear: hw,
            jewelries: jws,
            gender: rawData.gender,
            colors: rawData.itemColors,
            title: rawData.title,
            notes: rawData.notes,
            creatorName: rawData.creatorName
          });
        }
      } catch (e) {
        console.error('Lỗi tải bản phối chia sẻ:', e);
        setSharedError('Đã xảy ra lỗi khi tải bản phối chia sẻ.');
      } finally {
        setIsLoadingShared(false);
      }
    };

    loadShared();
  }, [shareId, sharedCode]);

  // Xử lý lưu bản phối chia sẻ vào Bộ sưu tập của người dùng
  const handleSaveSharedOutfit = async (
    colors?: Record<string, { hex: string | null; intensity: number }>,
    name?: string
  ) => {
    if (!sharedOutfitData) return;

    if (!currentUser) {
      if (onOpenAuthModal) onOpenAuthModal();
      else window.dispatchEvent(new CustomEvent('open-auth-modal'));
      return;
    }

    const finalColors = colors && Object.keys(colors).length > 0 ? colors : sharedOutfitData.colors;
    const outfitName = name?.trim() || sharedOutfitData.title || `Bản phối ${sharedOutfitData.garment.name}`;

    const res = saveOutfit({
      name: outfitName,
      costumeId: sharedOutfitData.garment.id,
      contextId: sharedOutfitData.context?.id || 'C01',
      gender: sharedOutfitData.gender,
      innerId: sharedOutfitData.inner?.id || null,
      bottomId: sharedOutfitData.bottom?.id || null,
      shoesId: sharedOutfitData.shoes?.id || null,
      headwearId: sharedOutfitData.headwear?.id || null,
      jewelryIds: sharedOutfitData.jewelries.map((j) => j.id),
      itemColors: finalColors
    });

    if (res.savedOutfit) {
      await saveCloudOutfit(currentUser.uid, res.savedOutfit).catch((err) =>
        console.warn('Lỗi lưu cloud outfit:', err)
      );
    }

    setIsSharedSaved(true);
    setSharedSaveNotice({
      type: 'success',
      message: 'Đã lưu bản phối vào Bộ sưu tập của bạn!'
    });
  };

  // Mở bản phối chia sẻ trong Studio để tùy biến / remix
  const handleRemixSharedOutfit = () => {
    if (!sharedOutfitData) return;
    const remixPayload = {
      id: `shared_remix_${Date.now()}`,
      name: sharedOutfitData.title || `Bản phối ${sharedOutfitData.garment.name}`,
      gender: sharedOutfitData.gender === 'male' ? 'Male' : 'Female',
      style: 'Giao thoa truyền thống hiện đại',
      formality: 'Lễ hội / Dạo phố',
      composition: {
        outer_traditional: sharedOutfitData.garment.id,
        context: sharedOutfitData.context?.id || 'C01',
        inner: sharedOutfitData.inner?.id || undefined,
        bottom_pants: sharedOutfitData.bottom?.id || undefined,
        shoes: sharedOutfitData.shoes?.id || undefined,
        headwear: sharedOutfitData.headwear?.id || undefined,
        jewelry: sharedOutfitData.jewelries.map((j) => j.id)
      }
    };
    sessionStorage.setItem('remixOutfit', JSON.stringify(remixPayload));
    navigate('/studio');
  };

  // Tải danh sách bộ phối: Firebase Cloud Firestore là nguồn dữ liệu duy nhất
  useEffect(() => {
    if (currentUser) {
      setIsLoadingCloud(true);

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
          setSavedList([]);
          setActionError('Không thể kết nối máy chủ dữ liệu. Vui lòng kiểm tra kết nối mạng.');
        }
      );

      return () => unsubscribe();
    } else {
      // Khi chưa đăng nhập: Không tải bất kỳ bộ phối nào từ máy khách
      setIsLoadingCloud(false);
      setSavedList([]);
    }
  }, [currentUser]);

  // Cập nhật lại danh sách bộ phối lưu trên máy khách
  const refreshLocalOutfits = () => {
    if (!currentUser) {
      setSavedList([]);
      return;
    }
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


  // 0. NẾU CÓ THAM SỐ CHIA SẺ TRÊN URL (?shareId=... HOẶC ?shared=...)
  if (isLoadingShared) {
    return (
      <div className="min-h-screen bg-[#FBF9F5] flex flex-col items-center justify-center p-6 text-stone-900 pb-36">
        <div className="w-16 h-16 rounded-3xl bg-red-50 border border-red-200/80 flex items-center justify-center text-red-700 mb-4 shadow-xs">
          <Loader2 className="w-8 h-8 animate-spin" />
        </div>
        <h2 className="text-xl font-serif font-bold text-stone-900 tracking-tight">Đang tải bản phối được chia sẻ...</h2>
        <p className="text-xs text-stone-500 mt-1">Xin vui lòng đợi trong giây lát</p>
      </div>
    );
  }

  if (sharedError) {
    return (
      <div className="min-h-screen bg-[#FBF9F5] flex flex-col items-center justify-center p-6 text-stone-900 pb-36">
        <div className="max-w-md w-full bg-white rounded-3xl p-6 sm:p-8 border border-stone-200/80 shadow-xs text-center space-y-4">
          <div className="w-14 h-14 rounded-2xl bg-red-50 text-red-700 flex items-center justify-center mx-auto">
            <AlertCircle className="w-7 h-7" />
          </div>
          <h2 className="text-lg font-serif font-bold text-stone-900">Không thể tải bản phối chia sẻ</h2>
          <p className="text-xs text-stone-600 leading-relaxed">{sharedError}</p>
          <div className="pt-2 flex flex-col sm:flex-row gap-2 justify-center">
            <button
              type="button"
              onClick={() => setSearchParams({})}
              className="py-2.5 px-5 rounded-full bg-stone-900 hover:bg-stone-800 text-white text-xs font-semibold transition cursor-pointer"
            >
              Về Bộ sưu tập của tôi
            </button>
            <button
              type="button"
              onClick={onNavigateToStudio}
              className="py-2.5 px-5 rounded-full bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-semibold transition cursor-pointer"
            >
              Phòng phối đồ
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (sharedOutfitData) {
    const sharedValidation = validateOutfit({
      costumeId: sharedOutfitData.garment.id,
      contextId: sharedOutfitData.context?.id || 'C01',
      gender: sharedOutfitData.gender,
      innerId: sharedOutfitData.inner?.id || null,
      bottomId: sharedOutfitData.bottom?.id || null,
      shoesId: sharedOutfitData.shoes?.id || null,
      headwearId: sharedOutfitData.headwear?.id || null,
      jewelryIds: sharedOutfitData.jewelries.map((j) => j.id)
    });

    return (
      <div className="min-h-screen bg-[#FBF9F5] text-stone-900 pb-36 pt-4">
        {/* Banner bản phối được chia sẻ */}
        <div className="max-w-5xl mx-auto px-3 sm:px-6 mb-4">
          <div className="bg-gradient-to-r from-red-50 via-amber-50/50 to-red-50 border border-red-200/80 rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 shadow-xs">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-red-700 text-white shadow-xs">
                  Bản phối được chia sẻ
                </span>
                {sharedOutfitData.creatorName && (
                  <span className="text-xs text-stone-600">
                    từ <strong className="text-stone-900 font-semibold">{sharedOutfitData.creatorName}</strong>
                  </span>
                )}
              </div>
              <h2 className="text-base sm:text-lg font-serif font-bold text-stone-900">
                {sharedOutfitData.title || `Bản phối ${sharedOutfitData.garment.name}`}
              </h2>
              {sharedOutfitData.notes && (
                <p className="text-xs text-stone-600 italic line-clamp-1 sm:line-clamp-none">
                  "{sharedOutfitData.notes}"
                </p>
              )}
            </div>

            <div className="flex flex-wrap items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={() => handleSaveSharedOutfit()}
                disabled={isSharedSaved}
                className={`py-2 px-3.5 rounded-full text-xs font-semibold transition active:scale-95 cursor-pointer flex items-center gap-1.5 shadow-xs ${
                  isSharedSaved
                    ? 'bg-emerald-50 text-emerald-800 border border-emerald-200 cursor-default'
                    : 'bg-stone-900 hover:bg-stone-800 text-white'
                }`}
              >
                {isSharedSaved ? (
                  <>
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Đã lưu vào bộ sưu tập</span>
                  </>
                ) : (
                  <>
                    <Bookmark className="w-3.5 h-3.5" />
                    <span>Lưu vào bộ sưu tập</span>
                  </>
                )}
              </button>
              <button
                type="button"
                onClick={handleRemixSharedOutfit}
                className="py-2 px-3.5 rounded-full bg-red-700 hover:bg-red-800 text-white text-xs font-semibold transition active:scale-95 cursor-pointer flex items-center gap-1.5 shadow-xs"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Phối lại trong Studio</span>
              </button>
              <button
                type="button"
                onClick={() => setSearchParams({})}
                className="py-2 px-3.5 rounded-full bg-white hover:bg-stone-100 text-stone-700 text-xs font-semibold border border-stone-200 transition cursor-pointer flex items-center gap-1.5 shadow-xs"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Về Bộ sưu tập của tôi</span>
              </button>
            </div>
          </div>
        </div>

        <OutfitResultView
          selectedGender={sharedOutfitData.gender}
          contextItem={sharedOutfitData.context}
          garmentItem={sharedOutfitData.garment}
          innerItem={sharedOutfitData.inner}
          bottomItem={sharedOutfitData.bottom}
          shoesItem={(sharedOutfitData.shoes as CasualItem) || null}
          headwearItem={sharedOutfitData.headwear}
          jewelryItems={sharedOutfitData.jewelries}
          validationResults={sharedValidation}
          onBackToStudio={() => setSearchParams({})}
          backButtonText="Về Bộ sưu tập của tôi"
          onSaveOutfit={handleSaveSharedOutfit}
          isSaved={isSharedSaved}
          saveNotice={sharedSaveNotice}
          isFromCollection={false}
          initialItemColors={sharedOutfitData.colors}
        />
      </div>
    );
  }

  // 1. CHƯA ĐĂNG NHẬP: HIỂN THỊ MÀN HÌNH YÊU CẦU ĐĂNG NHẬP (BẢO VỆ DỮ LIỆU CÁ NHÂN)
  if (!currentUser) {
    return (
      <div className="min-h-screen bg-[#FBF9F5] text-stone-900 pb-36">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 pt-10 sm:pt-16 pb-12">
          {/* Header */}
          <div className="text-center space-y-3 mb-8">
            <div className="w-16 h-16 rounded-3xl bg-red-50 border border-red-200/80 text-red-700 flex items-center justify-center mx-auto shadow-xs">
              <Bookmark className="w-8 h-8 stroke-[1.75]" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-serif font-bold text-stone-900 tracking-tight">
              Bộ Sưu Tập Cá Nhân
            </h1>
            <p className="text-sm text-stone-600 max-w-md mx-auto leading-relaxed">
              Vui lòng đăng nhập tài khoản để lưu trữ, quản lý và bảo vệ các bộ phối cổ phục độc đáo của bạn.
            </p>
          </div>

          {/* Feature Highlights Card */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-stone-200/80 shadow-xs space-y-6">
            <div className="space-y-4">
              <div className="flex items-start gap-3.5 p-3.5 rounded-2xl bg-stone-50 border border-stone-100">
                <div className="w-9 h-9 rounded-xl bg-red-100 text-red-700 flex items-center justify-center shrink-0">
                  <Cloud className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-stone-900">Lưu trữ an toàn, dài lâu</h3>
                  <p className="text-xs text-stone-500 mt-0.5 leading-relaxed">
                    Dữ liệu bộ sưu tập được gắn liền với tài khoản của bạn, không lo thất lạc khi đổi thiết bị hay dọn dẹp trình duyệt.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3.5 p-3.5 rounded-2xl bg-stone-50 border border-stone-100">
                <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-stone-900">Chia sẻ bộ phối công khai</h3>
                  <p className="text-xs text-stone-500 mt-0.5 leading-relaxed">
                    Tạo liên kết trực tuyến để bạn bè hoặc cộng đồng có thể chiêm ngưỡng tác phẩm phối đồ Việt phục của bạn bất cứ lúc nào.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3.5 p-3.5 rounded-2xl bg-stone-50 border border-stone-100">
                <div className="w-9 h-9 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center shrink-0">
                  <Scale className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-stone-900">So sánh đối chiếu trực quan</h3>
                  <p className="text-xs text-stone-500 mt-0.5 leading-relaxed">
                    Đối chiếu 2 bộ phối cạnh nhau để thẩm định quy chuẩn trang phục, gam màu và hoa văn trước khi đưa ra ngoài thực tế.
                  </p>
                </div>
              </div>
            </div>

            <div className="pt-2 flex flex-col sm:flex-row items-center gap-3">
              <button
                type="button"
                onClick={() => {
                  if (onOpenAuthModal) {
                    onOpenAuthModal();
                  } else {
                    window.dispatchEvent(new CustomEvent('open-auth-modal'));
                  }
                }}
                className="w-full sm:flex-1 py-3 px-6 rounded-full bg-red-700 hover:bg-red-800 text-white text-xs sm:text-sm font-semibold shadow-sm transition-all duration-200 active:scale-95 cursor-pointer flex items-center justify-center gap-2"
              >
                <LogIn className="w-4 h-4" />
                <span>Đăng nhập hoặc Đăng ký</span>
              </button>
              <button
                type="button"
                onClick={onNavigateToStudio}
                className="w-full sm:w-auto py-3 px-6 rounded-full bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs sm:text-sm font-semibold transition-colors duration-200 cursor-pointer flex items-center justify-center gap-2"
              >
                <SlidersHorizontal className="w-4 h-4" />
                <span>Phòng phối đồ</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // 2. MÀN HÌNH XEM CHI TIẾT BỘ PHỐI ĐÃ LƯU
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

            <div className="flex items-center gap-2 self-start sm:self-auto">
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

        {/* LOADING STATE KHI ĐANG TẢI TỪ FIREBASE */}
        {isLoadingCloud && (
          <div className="py-20 flex flex-col items-center justify-center space-y-3 font-sans">
            <Loader2 className="w-8 h-8 animate-spin text-red-700" />
            <p className="text-xs font-medium text-stone-500">
              Đang tải Bộ sưu tập...
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
                Bộ sưu tập của bạn đang trống
              </h3>
              <p className="text-xs text-stone-500 max-w-sm mx-auto leading-relaxed">
                Bạn chưa lưu bộ phối nào vào tài khoản này. Hãy vào Phòng phối đồ để sáng tạo, kiểm định và lưu giữ những bản phối ưng ý nhất.
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
