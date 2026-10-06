import React, { useState, useEffect } from 'react';
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
  X
} from 'lucide-react';
import { GARMENTS, CASUAL_ITEMS, ACCESSORIES, CONTEXTS } from '../data';
import { resolveItemByGender, getSafeImageUrl } from '../utils/helpers';
import { validateOutfit, resolveGarmentBaseId } from '../utils/validationEngine';
import {
  getSavedOutfits,
  deleteSavedOutfit,
  clearCorruptedStorage,
  SavedOutfit
} from '../utils/storage';
import { SafeImage } from '../components/SafeImage';
import { OutfitResultView } from '../components/OutfitResultView';

interface CollectionProps {
  onNavigateToStudio: () => void;
}

export const Collection: React.FC<CollectionProps> = ({ onNavigateToStudio }) => {
  const [savedList, setSavedList] = useState<SavedOutfit[]>([]);
  const [isCorrupted, setIsCorrupted] = useState<boolean>(false);
  const [corruptedError, setCorruptedError] = useState<string>('');
  const [viewingOutfitId, setViewingOutfitId] = useState<string | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [showClearConfirm, setShowClearConfirm] = useState<boolean>(false);
  const [actionError, setActionError] = useState<string | null>(null);

  // Tải danh sách bộ phối đã lưu
  const loadOutfits = () => {
    const result = getSavedOutfits();
    setIsCorrupted(result.isCorrupted);
    setCorruptedError(result.rawError || '');
    if (!result.isCorrupted) {
      setSavedList(result.outfits);
    } else {
      setSavedList([]);
    }
  };

  useEffect(() => {
    loadOutfits();
  }, []);

  // Xóa một bộ phối đã chọn: kiểm tra kết quả và giữ dữ liệu nếu thất bại
  const handleDelete = (id: string) => {
    setActionError(null);
    const result = deleteSavedOutfit(id);
    if (!result.success) {
      setActionError(result.error || 'Xóa bộ phối thất bại. Dữ liệu đã được giữ nguyên an toàn.');
      return;
    }
    setConfirmDeleteId(null);
    loadOutfits();
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
    loadOutfits();
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

  // 1. MÀN HÌNH XEM CHI TIẾT BỘ PHỐI ĐÃ LƯU
  if (viewingOutfitId) {
    const viewingOutfit = savedList.find((o) => o.id === viewingOutfitId);
    if (viewingOutfit) {
      const baseGarmentId = resolveGarmentBaseId(viewingOutfit.costumeId);
      const foundGarment = GARMENTS.find(
        (g) => g.id === viewingOutfit.costumeId || g.id === baseGarmentId
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
        id: viewingOutfit.costumeId,
        name: viewingOutfit.costumeId,
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

            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-stone-100 border border-stone-200/70 text-[11px] text-stone-500 font-sans self-start sm:self-auto">
              <Info className="w-3.5 h-3.5 text-stone-400 shrink-0" />
              <span>Lưu trên trình duyệt này, chưa đồng bộ tài khoản.</span>
            </div>
          </div>
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

        {/* TRẠNG THÁI RỖNG */}
        {!isCorrupted && savedList.length === 0 && (
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
              <p className="text-[11px] text-stone-400 font-mono mt-1">
                Lưu trên trình duyệt này, chưa đồng bộ tài khoản.
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
              const baseGarmentId = resolveGarmentBaseId(outfit.costumeId);
              const garment = GARMENTS.find(
                (g) => g.id === outfit.costumeId || g.id === baseGarmentId
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

              return (
                <div
                  key={outfit.id}
                  className="bg-white rounded-3xl overflow-hidden border border-stone-200/80 shadow-xs flex flex-col group hover:shadow-md hover:border-stone-300 transition-all duration-300 relative"
                >
                  {/* Khung Ảnh đại diện Cổ phục */}
                  <div className="aspect-[4/3] w-full overflow-hidden bg-[#FAF7F2] relative flex items-center justify-center p-3">
                    {imageUrl ? (
                      <SafeImage
                        src={imageUrl}
                        alt={outfit.name}
                        fallbackText={outfit.name}
                        expectedPath={imageUrl}
                        className="w-full h-full object-contain mix-blend-multiply group-hover:scale-105 transition-transform duration-500"
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
                            onClick={() => setViewingOutfitId(outfit.id)}
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
    </div>
  );
};

export default Collection;
