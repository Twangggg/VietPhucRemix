import React, { useState } from 'react';
import { Check, Copy, Download, Loader2, Sparkles, X, Cloud } from 'lucide-react';
import { encodeOutfitToShareUrl } from '../utils/lookbookStore';
import { createCloudShare } from '../services/firebaseStore';
import { useAuth } from '../contexts/AuthContext';

interface SaveLookbookModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUpdateName?: (name: string) => void;
  onExportImage?: () => void;
  isExporting?: boolean;
  defaultTitle: string;
  sharePayload: {
    g: string;
    ctx?: string | null;
    inn?: string | null;
    bot?: string | null;
    sh?: string | null;
    hw?: string | null;
    jw?: string[];
    gen: string;
    col?: Record<string, { hex: string | null; intensity: number }>;
  };
}

export const SaveLookbookModal: React.FC<SaveLookbookModalProps> = ({
  isOpen,
  onClose,
  onUpdateName,
  onExportImage,
  isExporting = false,
  defaultTitle,
  sharePayload
}) => {
  const { currentUser, isFirebaseConfigured } = useAuth();
  const [title, setTitle] = useState(defaultTitle);
  const [copied, setCopied] = useState(false);
  const [isCreatingLink, setIsCreatingLink] = useState(false);

  if (!isOpen) return null;

  const shareUrl = encodeOutfitToShareUrl({
    ...sharePayload,
    title
  });

  const handleCopyLink = async () => {
    setIsCreatingLink(true);
    let finalUrl = shareUrl;

    if (isFirebaseConfigured) {
      try {
        const cloudShareId = await createCloudShare({
          creatorId: currentUser?.uid,
          creatorName: currentUser?.displayName || currentUser?.email?.split('@')[0] || 'Khách',
          title,
          gender: sharePayload.gen === 'male' ? 'male' : 'female',
          contextId: sharePayload.ctx,
          garmentId: sharePayload.g,
          innerId: sharePayload.inn,
          bottomId: sharePayload.bot,
          shoesId: sharePayload.sh,
          headwearId: sharePayload.hw,
          jewelryIds: sharePayload.jw || [],
          itemColors: sharePayload.col
        });
        if (cloudShareId) {
          finalUrl = `${window.location.origin}/collection?shareId=${cloudShareId}`;
        }
      } catch (err) {
        console.warn('Lỗi tạo cloud share link, dùng base64 link:', err);
      }
    }

    try {
      await navigator.clipboard.writeText(finalUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      // Fallback nếu clipboard API bị block
      const input = document.createElement('input');
      input.value = finalUrl;
      document.body.appendChild(input);
      input.select();
      document.execCommand('copy');
      document.body.removeChild(input);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } finally {
      setIsCreatingLink(false);
    }
  };

  const handleTitleChange = (newTitle: string) => {
    setTitle(newTitle);
    onUpdateName?.(newTitle);
  };

  return (
    <div
      className="fixed inset-0 z-[110] bg-stone-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-3xl max-w-sm sm:max-w-md w-full border border-stone-200/90 shadow-2xl p-5 sm:p-6 space-y-4 relative animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* HEADER GỌN GÀNG */}
        <div className="flex items-center justify-between border-b border-stone-100 pb-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-red-50 text-red-700 flex items-center justify-center shrink-0">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-serif font-bold text-stone-900">
                Xuất Thẻ Ảnh & Chia Sẻ
              </h3>
              <p className="text-[11px] text-stone-500 font-sans">
                Tải thẻ ảnh HD hoặc sao chép nhanh liên kết phối đồ
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-full text-stone-400 hover:text-stone-700 hover:bg-stone-100 transition-colors cursor-pointer"
            title="Đóng"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Ô SỬA TÊN BỘ PHỐI / BỘ SƯU TẬP */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-stone-700 block">
            Tên bộ phối
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => handleTitleChange(e.target.value)}
            placeholder="VD: Dạo phố mùa xuân với Nhật Bình..."
            className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 text-sm focus:border-red-700 focus:outline-none focus:ring-1 focus:ring-red-700 font-sans shadow-2xs"
          />
        </div>

        {/* 2 NÚT HÀNH ĐỘNG KẾ BÊN NHAU */}
        <div className="grid grid-cols-2 gap-2.5 pt-1">
          {/* NÚT 1: TẢI ẢNH VỀ MÁY */}
          {onExportImage && (
            <button
              type="button"
              onClick={onExportImage}
              disabled={isExporting}
              className="py-2.5 px-3 rounded-xl bg-red-700 hover:bg-red-800 text-white font-semibold text-xs flex items-center justify-center gap-1.5 shadow-xs transition-all cursor-pointer active:scale-95 disabled:opacity-60"
            >
              {isExporting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-white" />
                  <span>Đang tạo ảnh...</span>
                </>
              ) : (
                <>
                  <Download className="w-4 h-4 text-white" />
                  <span>Tải ảnh về máy</span>
                </>
              )}
            </button>
          )}

          {/* NÚT 2: CHIA SẺ (TỰ ĐỘNG SAO CHÉP LIÊN KẾT) */}
          <button
            type="button"
            onClick={handleCopyLink}
            disabled={isCreatingLink}
            className={`py-2.5 px-3 rounded-xl font-semibold text-xs flex items-center justify-center gap-1.5 shadow-xs transition-all cursor-pointer active:scale-95 border ${
              copied
                ? 'bg-emerald-50 text-emerald-700 border-emerald-300'
                : 'bg-stone-900 hover:bg-stone-800 text-white border-transparent'
            }`}
          >
            {isCreatingLink ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-white" />
                <span>Đang tạo link...</span>
              </>
            ) : copied ? (
              <>
                <Check className="w-4 h-4 text-emerald-600" />
                <span>Đã chép link!</span>
              </>
            ) : (
              <>
                <Copy className="w-4 h-4" />
                <span>Chia sẻ liên kết</span>
              </>
            )}
          </button>
        </div>

        {/* THÔNG BÁO SAO CHÉP THÀNH CÔNG */}
        {copied && (
          <p className="text-[11px] text-emerald-600 text-center font-sans font-medium animate-in fade-in pt-0.5">
            ✓ Đã sao chép liên kết phối đồ vào khay nhớ tạm!
          </p>
        )}
      </div>
    </div>
  );
};
