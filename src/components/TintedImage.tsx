import React, { useState, useEffect } from 'react';
import { SafeImage } from './SafeImage';
import { recolorImageViaCanvas } from '../utils/recolorEngine';

interface TintedImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  src: string;
  colorHex?: string | null;
  intensity?: number;
  fallbackText?: string;
  expectedPath?: string;
  className?: string;
  imgClassName?: string;
}

export const TintedImage: React.FC<TintedImageProps> = ({
  src,
  colorHex,
  intensity = 0.85,
  fallbackText,
  expectedPath,
  className = '',
  imgClassName = '',
  ...props
}) => {
  const [displaySrc, setDisplaySrc] = useState<string>(src);
  const [isTinting, setIsTinting] = useState<boolean>(false);

  useEffect(() => {
    if (!src) {
      setDisplaySrc('');
      return;
    }

    if (!colorHex || colorHex === 'original') {
      setDisplaySrc(src);
      return;
    }

    let isMounted = true;
    setIsTinting(true);

    recolorImageViaCanvas(src, colorHex, intensity).then((resultUrl) => {
      if (isMounted) {
        setDisplaySrc(resultUrl);
        setIsTinting(false);
      }
    });

    return () => {
      isMounted = false;
    };
  }, [src, colorHex, intensity]);

  return (
    <div className={`relative ${className}`}>
      <SafeImage
        {...props}
        src={displaySrc}
        fallbackText={fallbackText}
        expectedPath={expectedPath}
        className="w-full h-full"
        imgClassName={imgClassName}
      />
    </div>
  );
};
