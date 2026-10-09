import React, { useState, useEffect } from 'react';
import { Sparkles } from 'lucide-react';

interface SafeImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  fallbackText?: string;
  expectedPath?: string;
  imgClassName?: string;
}

/**
 * Biểu tượng Cổ phục Việt Nam dạng Vector cách điệu
 * Dùng làm hình ảnh chờ (Placeholder) trang nhã thay vì để khung trắng đơn điệu
 */
const CostumeSilhouette: React.FC = () => (
  <svg
    viewBox="0 0 160 220"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className="w-24 sm:w-32 h-auto max-h-[75%] opacity-35 text-stone-600 transition-all duration-300 pointer-events-none"
  >
    {/* Móc treo đồ truyền thống (Hanger) */}
    <path
      d="M80 26 C80 18, 85 14, 90 14 C95 14, 98 18, 96 23 C94 28, 83 32, 80 38"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
    />
    {/* Khung thân áo Cổ phục (Áo Giao Lĩnh / Ngũ Thân Việt Nam) */}
    <path
      d="M80 38 L42 54 L20 84 L34 92 L48 70 L50 200 L110 200 L112 70 L126 92 L140 84 L118 54 Z"
      fill="currentColor"
      fillOpacity="0.08"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinejoin="round"
    />
    {/* Vạt cổ áo giao chéo phải đè trái (Right-over-left lapel theo quy chuẩn truyền thống) */}
    <path
      d="M68 44 L80 58 L92 44"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
    />
    <path
      d="M80 58 L102 90 L102 200"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeDasharray="3 3"
      strokeLinecap="round"
    />
    {/* Đường xẻ tà thân áo truyền thống */}
    <path
      d="M50 120 L50 200 M110 120 L110 200"
      stroke="currentColor"
      strokeWidth="1.5"
    />
    {/* Biểu tượng đóa hoa sen cách điệu nơi tâm ngực */}
    <circle cx="80" cy="98" r="10" stroke="currentColor" strokeWidth="1" strokeDasharray="2 2" fill="none" />
    <path
      d="M80 90 C76 96, 75 99, 80 105 C85 99, 84 96, 80 90 Z"
      fill="currentColor"
      fillOpacity="0.25"
    />
    <path
      d="M74 98 C77 101, 80 102, 80 105 C77 104, 75 101, 74 98 Z"
      fill="currentColor"
      fillOpacity="0.2"
    />
    <path
      d="M86 98 C83 101, 80 102, 80 105 C83 104, 85 101, 86 98 Z"
      fill="currentColor"
      fillOpacity="0.2"
    />
  </svg>
);

export const SafeImage: React.FC<SafeImageProps> = ({
  src,
  alt = 'Hình ảnh trang phục',
  className = '',
  imgClassName = '',
  fallbackText = 'Đang tải hình ảnh',
  expectedPath,
  ...props
}) => {
  const [hasError, setHasError] = useState(false);
  const [isLoading, setIsLoading] = useState(Boolean(src));

  useEffect(() => {
    setHasError(false);
    if (src) {
      setIsLoading(true);
    } else {
      setIsLoading(false);
      setHasError(true);
    }
  }, [src]);

  const hasExplicitObjectFit =
    imgClassName.includes('object-contain') ||
    imgClassName.includes('object-cover') ||
    imgClassName.includes('object-scale-down');

  return (
    <div
      className={`relative overflow-hidden group/img ${
        className.includes('bg-') ? '' : 'bg-[#FAF7F2]'
      } ${className}`}
    >
      {/* KHUNG HÌNH ẢNH CHỜ TRANG PHỤC (COSTUME PLACEHOLDER SKELETON) */}
      {(isLoading || hasError || !src) && (
        <div className="absolute inset-0 bg-[#F6F3EC] flex flex-col items-center justify-center p-3 select-none z-0">
          <div className="w-full h-full flex flex-col items-center justify-center relative">
            {/* Silhouette Cổ phục Việt Nam cách điệu */}
            <CostumeSilhouette />

            {/* Hiệu ứng shimmer ánh sáng chạy nhẹ khi đang tải */}
            {isLoading && (
              <div className="absolute inset-0 bg-gradient-to-t from-stone-200/25 via-transparent to-stone-100/20 animate-pulse pointer-events-none" />
            )}

            {/* Huy hiệu thông báo trạng thái */}
            {isLoading && (
              <div className="absolute bottom-2.5 flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-white/80 backdrop-blur-xs border border-stone-200/70 shadow-2xs">
                <Sparkles className="w-3 h-3 text-red-700 animate-spin" style={{ animationDuration: '3s' }} />
                <span className="text-[10px] font-sans font-medium text-stone-600">
                  Đang tải...
                </span>
              </div>
            )}
          </div>
        </div>
      )}

      {src && !hasError && (
        <img
          {...props}
          src={src}
          alt={alt}
          loading="lazy"
          onLoad={() => setIsLoading(false)}
          ref={(node) => {
            if (node && node.complete && node.naturalWidth > 0 && isLoading) {
              setIsLoading(false);
            }
          }}
          onError={() => {
            setHasError(true);
            setIsLoading(false);
          }}
          className={`w-full h-full ${hasExplicitObjectFit ? '' : 'object-cover'} transition-opacity duration-300 relative z-1 ${
            isLoading ? 'opacity-0' : 'opacity-100'
          } ${imgClassName}`}
        />
      )}

      {/* Upload Helper Indicator badge if using fallback placeholder */}
      {hasError && expectedPath && (
        <div className="absolute bottom-2 left-2 right-2 bg-white/95 backdrop-blur-md px-2.5 py-1.5 rounded-lg border border-stone-200 text-[11px] text-stone-700 shadow-sm flex items-center justify-between pointer-events-none opacity-0 group-hover/img:opacity-100 transition-opacity z-10">
          <span className="truncate flex items-center gap-1.5 font-mono text-[10px] text-stone-600">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
            Đang chờ hình ảnh: <span className="text-stone-900 font-semibold underline">{expectedPath}</span>
          </span>
        </div>
      )}
    </div>
  );
};
