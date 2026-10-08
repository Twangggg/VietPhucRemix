import React, { useState } from 'react';
import { Bookmark, Sparkles, Check, Share2, Copy, Download, Loader2, Key, Image } from 'lucide-react';
import { encodeOutfitToShareUrl, encodeOutfitToShareCode } from '../utils/lookbookStore';

interface SaveLookbookModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (title: string, notes: string, authorName: string) => void;
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
  onSave,
  onExportImage,
  isExporting = false,
  defaultTitle,
  sharePayload
}) => {
  const [title, setTitle] = useState(defaultTitle);
  const [notes, setNotes] = useState('');
  const [authorName, setAuthorName] = useState('');
  const [copied, setCopied] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    onSave(title.trim(), notes.trim(), authorName.trim());
    setSavedSuccess(true);
    setTimeout(() => {
      setSavedSuccess(false);
      onClose();
    }, 1200);
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
        <div className="flex items-center justify-between border-b border-stone-100 pb-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-red-50 text-red-700 flex items-center justify-center">
              <Bookmark className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-serif font-bold text-stone-900">
                Lưu vào Lookbook Cá Nhân
              </h3>
              <p className="text-[11px] text-stone-500 font-sans">
                Lưu trữ ý tưởng phối đồ và tạo liên kết chia sẻ cho bạn bè
              </p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-stone-700 block">
              Tên bộ Lookbook <span className="text-red-600">*</span>
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="VD: Dạo phố mùa xuân với Nhật Bình..."
              className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 text-sm focus:border-red-700 focus:outline-none focus:ring-1 focus:ring-red-700 font-sans"
              required
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-stone-700 block">
              Tên người phối (Tùy chọn)
            </label>
            <input
              type="text"
              value={authorName}
              onChange={(e) => setAuthorName(e.target.value)}
              placeholder="VD: Minh Thư, Designer..."
              className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 text-sm focus:border-red-700 focus:outline-none focus:ring-1 focus:ring-red-700 font-sans"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-stone-700 block">
              Ghi chú cảm hứng & phong cách
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              placeholder="Ghi lại cảm hứng màu sắc, phụ kiện hoặc bối cảnh mặc..."
              className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 text-sm focus:border-red-700 focus:outline-none focus:ring-1 focus:ring-red-700 font-sans resize-none"
            />
          </div>

          {/* Nút Tải Ảnh Lookbook đơn giản, không giải thích rườm rà */}
          {onExportImage && (
            <button
              type="button"
              onClick={onExportImage}
              disabled={isExporting}
              className="w-full py-2.5 px-4 rounded-xl bg-stone-900 hover:bg-stone-800 text-white font-medium text-xs flex items-center justify-center gap-2 shadow-xs transition-all cursor-pointer active:scale-95 disabled:opacity-50"
            >
              {isExporting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-amber-300" />
                  <span>Đang tải ảnh...</span>
                </>
              ) : (
                <>
                  <Download className="w-4 h-4 text-amber-300" />
                  <span>Tải ảnh về máy</span>
                </>
              )}
            </button>
          )}

          {/* Quick Share Link & Share Code Box */}
          <div className="p-3 bg-stone-50 rounded-xl border border-stone-200/80 space-y-2">
            <div className="flex items-center justify-between text-xs text-stone-600">
              <span className="font-semibold flex items-center gap-1.5">
                <Share2 className="w-3.5 h-3.5 text-stone-400" />
                Chia sẻ bản phối
              </span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleCopyLink}
                  className="text-[11px] font-semibold text-red-700 hover:text-red-800 flex items-center gap-1 cursor-pointer"
                  title="Sao chép liên kết URL mở trực tiếp"
                >
                  {copied ? (
                    <>
                      <Check className="w-3 h-3 text-emerald-600" />
                      <span className="text-emerald-600">Đã chép link!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3 h-3" />
                      <span>Sao chép liên kết</span>
                    </>
                  )}
                </button>
              </div>
            </div>
            <div className="text-[11px] font-mono text-stone-400 truncate bg-white px-2.5 py-1.5 rounded-lg border border-stone-200 select-all">
              {shareUrl}
            </div>
          </div>

          <div className="pt-2 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl text-xs font-medium text-stone-600 hover:bg-stone-100 transition-colors"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={savedSuccess}
              className={`px-5 py-2.5 rounded-xl text-xs font-semibold text-white shadow-xs transition-all flex items-center gap-1.5 cursor-pointer ${
                savedSuccess
                  ? 'bg-emerald-600'
                  : 'bg-red-700 hover:bg-red-800 active:scale-95'
              }`}
            >
              {savedSuccess ? (
                <>
                  <Check className="w-4 h-4" />
                  <span>Đã lưu vào Lookbook!</span>
                </>
              ) : (
                <>
                  <Bookmark className="w-4 h-4" />
                  <span>Lưu vào Lookbook</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
