import React, { useState } from 'react';
import { Share2, Check, Copy, Download, Loader2, Sparkles, X, Image as ImageIcon } from 'lucide-react';
import { encodeOutfitToShareUrl } from '../utils/lookbookStore';

interface SaveLookbookModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave?: (title: string, notes: string, authorName: string) => void;
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
  onExportImage,
  isExporting = false,
  defaultTitle,
  sharePayload
}) => {
  const [title, setTitle] = useState(defaultTitle);
  const [notes, setNotes] = useState('');
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const shareUrl = encodeOutfitToShareUrl({
    ...sharePayload,
    title,
    notes
  });

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      // Fallback nếu clipboard API bị block
      const input = document.createElement('input');
      input.value = shareUrl;
      document.body.appendChild(input);
      input.select();
      document.execCommand('copy');
      document.body.removeChild(input);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  return (
    <div
      className="fixed inset-0 z-[110] bg-stone-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 overflow-y-auto animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-3xl max-w-lg w-full border border-stone-200/90 shadow-2xl p-6 sm:p-8 space-y-6 relative animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* HEADER MODAL */}
        <div className="flex items-center justify-between border-b border-stone-100 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-full bg-red-50 text-red-700 flex items-center justify-center shrink-0">
              <Share2 className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-serif font-bold text-stone-900">
                Xuất Thẻ Ảnh & Chia Sẻ
              </h3>
              <p className="text-[11px] text-stone-500 font-sans">
                Tải ảnh chất lượng cao hoặc gửi liên kết phối đồ trực tiếp cho bạn bè
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-full text-stone-400 hover:text-stone-700 hover:bg-stone-100 transition-colors cursor-pointer"
            title="Đóng hộp thoại"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-5">
          {/* MỤC 1: XUẤT THẺ ẢNH LOOKBOOK (PNG) */}
          <div className="p-4 rounded-2xl bg-[#FAF7F2] border border-amber-200/60 space-y-3">
            <div className="flex items-start gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-amber-100/80 text-amber-900 flex items-center justify-center shrink-0 mt-0.5">
                <ImageIcon className="w-4 h-4 text-amber-800" />
              </div>
              <div className="space-y-0.5">
                <h4 className="text-xs font-semibold text-stone-900 flex items-center gap-1.5">
                  <span>Thẻ ảnh Lookbook (PNG)</span>
                  <span className="text-[10px] font-mono text-amber-800 bg-amber-100/90 px-1.5 py-0.2 rounded-full font-bold">
                    HD
                  </span>
                </h4>
                <p className="text-[11px] text-stone-600 leading-relaxed font-sans">
                  Xuất thẻ ảnh đồ họa sắc nét bao gồm toàn bộ cổ phục, phụ kiện phối kèm và màu sắc bạn đã tùy biến.
                </p>
              </div>
            </div>

            {onExportImage && (
              <button
                type="button"
                onClick={onExportImage}
                disabled={isExporting}
                className="w-full py-2.5 px-4 rounded-xl bg-red-700 hover:bg-red-800 text-white font-semibold text-xs flex items-center justify-center gap-2 shadow-xs transition-all cursor-pointer active:scale-95 disabled:opacity-60"
              >
                {isExporting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-white" />
                    <span>Đang khởi tạo thẻ ảnh...</span>
                  </>
                ) : (
                  <>
                    <Download className="w-4 h-4 text-white" />
                    <span>Tải thẻ ảnh về máy</span>
                  </>
                )}
              </button>
            )}
          </div>

          {/* MỤC 2: CHIA SẺ LIÊN KẾT PHỐI ĐỒ */}
          <div className="space-y-3">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-stone-700 flex items-center justify-between">
                <span>Lời nhắn / Tên bộ phối (Tùy chọn)</span>
                <span className="text-[10px] text-stone-400 font-normal">Nhúng vào link chia sẻ</span>
              </label>
              <input
                type="text"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="VD: Phối đồ dạo phố xuân, áo tấc kết hợp quần âu..."
                className="w-full px-3.5 py-2 rounded-xl border border-stone-200 text-xs focus:border-red-700 focus:outline-none focus:ring-1 focus:ring-red-700 font-sans"
              />
            </div>

            {/* Quick Share Link Box */}
            <div className="p-3 bg-stone-50 rounded-2xl border border-stone-200/80 space-y-2">
              <div className="flex items-center justify-between text-xs text-stone-600">
                <span className="font-semibold flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-red-700" />
                  Liên kết mở trực tiếp
                </span>
                <button
                  type="button"
                  onClick={handleCopyLink}
                  className="text-xs font-semibold text-red-700 hover:text-red-800 flex items-center gap-1 cursor-pointer transition-colors"
                  title="Sao chép liên kết URL"
                >
                  {copied ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                      <span className="text-emerald-600">Đã chép link!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Sao chép</span>
                    </>
                  )}
                </button>
              </div>
              <div className="text-[11px] font-mono text-stone-500 truncate bg-white px-3 py-2 rounded-xl border border-stone-200/90 select-all">
                {shareUrl}
              </div>
            </div>
          </div>

          {/* NÚT ĐÓNG */}
          <div className="pt-2 flex items-center justify-end">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2 rounded-xl text-xs font-semibold text-stone-700 bg-stone-100 hover:bg-stone-200 transition-colors cursor-pointer"
            >
              Đóng
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
