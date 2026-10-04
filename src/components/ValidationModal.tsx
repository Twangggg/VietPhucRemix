import React from 'react';
import { AlertOctagon, X, ShieldAlert, BookOpen } from 'lucide-react';
import { ValidationResult } from '../types';

interface ValidationModalProps {
  isOpen: boolean;
  onClose: () => void;
  results: ValidationResult[];
}

export const ValidationModal: React.FC<ValidationModalProps> = ({
  isOpen,
  onClose,
  results,
}) => {
  if (!isOpen) return null;

  // Lọc lấy các lỗi có mức độ nghiêm trọng BLOCK
  const blockErrors = results.filter((r) => r.severity === 'BLOCK');
  const firstBlock = blockErrors[0];

  return (
    <div
      className="fixed inset-0 z-[100] bg-stone-900/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-3xl max-w-lg w-full border border-red-200/90 shadow-2xl overflow-hidden my-auto p-6 sm:p-8 pb-24 sm:pb-8 space-y-6 relative"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Nút đóng nhanh */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 w-8 h-8 rounded-full bg-stone-100 hover:bg-stone-200 text-stone-500 hover:text-stone-900 flex items-center justify-center transition-colors"
          title="Đóng modal"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Header với Icon cảnh báo tinh tế */}
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-500/10 to-red-500/15 border border-red-200 flex items-center justify-center shrink-0 text-red-700 shadow-xs">
            <ShieldAlert className="w-6 h-6 stroke-[2]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-mono uppercase tracking-widest text-amber-800 font-bold bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200">
                Quy chuẩn di sản
              </span>
            </div>
            <h3 className="text-xl font-bold text-stone-900 tracking-tight mt-1">
              Cảnh báo quy chuẩn văn hóa
            </h3>
          </div>
        </div>

        {/* Hộp nội dung thông điệp BLOCK chính */}
        {firstBlock && (
          <div className="rounded-2xl bg-gradient-to-b from-amber-50/70 to-red-50/50 border border-amber-200/80 p-5 space-y-3">
            <div className="flex items-center gap-2 text-red-800 text-xs font-bold uppercase tracking-wider">
              <AlertOctagon className="w-4 h-4 shrink-0 text-red-700" />
              <span>
                {firstBlock.ruleId ? `Quy tắc: ${firstBlock.ruleId}` : 'Vi phạm quy chuẩn'}
              </span>
            </div>
            <p className="text-sm text-stone-800 font-sans leading-relaxed font-medium">
              {firstBlock.message}
            </p>
          </div>
        )}

        {/* Nếu có nhiều hơn 1 lỗi BLOCK thì hiển thị thêm các lưu ý tiếp theo */}
        {blockErrors.length > 1 && (
          <div className="space-y-2">
            <span className="text-xs font-semibold text-stone-500 block">
              Các quy chuẩn khác chưa tương thích ({blockErrors.length - 1}):
            </span>
            <div className="space-y-2 max-h-36 overflow-y-auto pr-1 text-xs text-stone-700">
              {blockErrors.slice(1).map((err, idx) => (
                <div
                  key={idx}
                  className="p-3 rounded-xl bg-stone-50 border border-stone-200/80 flex items-start gap-2"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-red-600 mt-1.5 shrink-0" />
                  <span>{err.message}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Lời khuyên văn hóa */}
        <div className="flex items-center gap-2 text-xs text-stone-500 bg-stone-50/80 p-3 rounded-xl border border-stone-100">
          <BookOpen className="w-4 h-4 text-stone-400 shrink-0" />
          <p>
            Cổ phục Việt Nam mang bề dày lịch sử và nghi lễ. Hãy điều chỉnh lại các món đồ để bảo tồn đúng hồn cốt trang phục truyền thống.
          </p>
        </div>

        {/* Nút CTA hành động: "Đã hiểu & Chọn lại" */}
        <div className="pt-2 border-t border-stone-100 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="w-full sm:w-auto px-6 py-3 rounded-xl bg-red-700 hover:bg-red-800 text-white text-sm font-bold shadow-md shadow-red-700/20 hover:shadow-lg transition-all active:scale-[0.98]"
          >
            Đã hiểu & Chọn lại
          </button>
        </div>
      </div>
    </div>
  );
};
