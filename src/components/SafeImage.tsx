import React, { useState, useEffect } from 'react';

interface SafeImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  fallbackText?: string;
  expectedPath?: string;
  imgClassName?: string;
}

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
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setHasError(false);
  }, [src]);

  // Fallback to light neutral placeholder conforming to Minimalist Editorial theme
  const encodedText = encodeURIComponent(fallbackText.replace(/\s+/g, '+'));
  const placeholderUrl = `https://placehold.co/900x1200/F5F5F0/525252?text=${encodedText}`;

  const currentSrc = hasError || !src ? placeholderUrl : src;
  const hasExplicitObjectFit = imgClassName.includes('object-contain') || imgClassName.includes('object-cover') || imgClassName.includes('object-scale-down');

  return (
    <div className={`relative overflow-hidden group/img ${className.includes('bg-') ? '' : 'bg-transparent'} ${className}`}>
      {/* Light editorial skeleton */}
      {isLoading && (
        <div className="absolute inset-0 bg-gradient-to-r from-stone-100 via-stone-200 to-stone-100 animate-pulse z-0" />
      )}

      <img
        {...props}
        src={currentSrc}
        alt={alt}
        loading="lazy"
        onLoad={() => setIsLoading(false)}
        ref={(node) => {
          if (node && node.complete && isLoading) {
            setIsLoading(false);
          }
        }}
        onError={() => {
          setHasError(true);
          setIsLoading(false);
        }}
        className={`w-full h-full ${hasExplicitObjectFit ? '' : 'object-cover'} transition-opacity duration-300 ${
          isLoading ? 'opacity-0' : 'opacity-100'
        } ${imgClassName}`}
      />

      {/* Upload Helper Indicator badge if using fallback placeholder */}
      {hasError && expectedPath && (
        <div className="absolute bottom-2 left-2 right-2 bg-white/95 backdrop-blur-md px-2.5 py-1.5 rounded-lg border border-stone-200 text-[11px] text-stone-700 shadow-sm flex items-center justify-between pointer-events-none opacity-0 group-hover/img:opacity-100 transition-opacity">
          <span className="truncate flex items-center gap-1.5 font-mono text-[10px] text-stone-600">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
            Đang chờ hình ảnh: <span className="text-stone-900 font-semibold underline">{expectedPath}</span>
          </span>
        </div>
      )}
    </div>
  );
};
