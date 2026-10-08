import React from 'react';
import { Garment, Gender } from '../types';
import { SafeImage } from './SafeImage';
import { resolveImageUrl } from '../utils/helpers';

interface GarmentCardProps {
  garment: Garment;
  onClick: () => void;
  selected?: boolean;
  selectedGender?: Gender;
}

export const GarmentCard: React.FC<GarmentCardProps> = ({
  garment,
  onClick,
  selected,
  selectedGender = 'Female'
}) => {
  // Resolve image URL based on gender variants (_1 for Male, _2 for Female, or base)
  const resolvedImageUrl = resolveImageUrl(
    garment.image_url,
    garment.has_gender_variants,
    selectedGender
  );

  // Extract concise heritage tag (e.g. "Triều Nguyễn", "Đồng bằng Bắc Bộ", "Thế kỷ 20")
  const getSubNote = () => {
    if (!garment.origin) return garment.era || 'Cổ phục truyền thống';
    if (garment.origin.includes('thời Nguyễn') || garment.origin.includes('triều Nguyễn')) return 'Triều Nguyễn';
    if (garment.origin.includes('Bắc Bộ')) return 'Đồng bằng Bắc Bộ';
    if (garment.origin.includes('Nam Bộ')) return 'Vùng đất Nam Bộ';
    if (garment.origin.includes('thời Lê') || garment.origin.includes('thời Hậu Lê')) return 'Thời Hậu Lê';
    if (garment.origin.includes('Lý, Trần')) return 'Thời Lý - Trần - Lê';
    if (garment.origin.includes('Le Mur')) return 'Phong trào Le Mur (1930s)';
    return garment.era || garment.origin.split('.')[0].slice(0, 30);
  };

  return (
    <article
      onClick={onClick}
      className={`group bg-white rounded-2xl overflow-hidden transition-all duration-300 cursor-pointer flex flex-col ${
        selected
          ? 'ring-2 ring-red-700 shadow-md'
          : 'border border-stone-200/60 shadow-sm hover:shadow-md hover:-translate-y-0.5'
      }`}
    >
      {/* Editorial Image container: 75% visual dominance */}
      <div className="relative aspect-[3/4] w-full overflow-hidden bg-stone-100">
        <SafeImage
          src={resolvedImageUrl}
          alt={garment.name}
          fallbackText={`${garment.name} (${selectedGender === 'Male' ? 'Nam' : 'Nữ'})`}
          expectedPath={resolvedImageUrl}
          className="w-full h-full"
        />

        {/* Minimalist ID Tag */}
        <div className="absolute top-3 left-3 bg-white/95 backdrop-blur-sm text-stone-700 text-[10px] font-mono px-2 py-0.5 rounded-md border border-stone-200/80 font-semibold shadow-xs">
          {garment.id}
        </div>

        {/* Gender variant indicator pill */}
        {garment.has_gender_variants && (
          <div className="absolute bottom-3 left-3 bg-white/90 backdrop-blur-sm text-red-700 text-[9px] font-sans px-2 py-0.5 rounded-md border border-red-200/70 font-semibold shadow-xs flex items-center gap-1">
            <span>{selectedGender === 'Male' ? 'Phom Nam' : 'Phom Nữ'}</span>
          </div>
        )}

        {garment.silhouette && (
          <div className="absolute top-3 right-3 bg-stone-900/80 backdrop-blur-sm text-white text-[10px] px-2 py-0.5 rounded-md font-sans">
            Dáng {garment.silhouette}
          </div>
        )}
      </div>

      {/* Minimalist Meta: Strictly NO verbose labels */}
      <div className="p-4 flex-1 flex flex-col justify-between">
        <div>
          <h3 className="text-base sm:text-lg font-bold text-gray-900 group-hover:text-red-700 transition-colors font-['Playfair_Display',serif] leading-snug">
            {garment.name}
          </h3>
          <p className="text-xs text-gray-500 font-normal mt-1">
            {getSubNote()}
          </p>
        </div>
      </div>
    </article>
  );
};
