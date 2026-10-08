import React, { useState } from 'react';
import { User, Sparkles, Shirt, Layers, Palette } from 'lucide-react';
import { Garment, CasualItem, AccessoryItem, ContextItem, Gender } from '../types';
import { TintedImage } from './TintedImage';
import { getSafeImageUrl, resolveItemByGender } from '../utils/helpers';

export interface AvatarMannequinViewProps {
  selectedGender: Gender;
  garmentItem: Garment;
  innerItem?: CasualItem | null;
  bottomItem?: CasualItem | null;
  shoesItem?: CasualItem | null;
  headwearItem?: AccessoryItem | null;
  jewelryItems?: AccessoryItem[];
  itemColors: Record<string, { hex: string | null; intensity: number }>;
  onSelectItem?: (type: 'garment' | 'inner' | 'bottom' | 'shoes' | 'headwear' | 'jewelry', item: any) => void;
}

// Danh sách các hình mẫu nhân vật đại diện (Archetype Personas)
export interface AvatarPersona {
  id: string;
  name: string;
  gender: Gender;
  eraDescription: string;
  skinTone: string;
  hairStyle: string;
  hairColor: string;
}

export const AVATAR_PERSONAS: AvatarPersona[] = [
  {
    id: 'female_hue',
    name: 'Thục Nữ Cố Đô',
    gender: 'Female',
    eraDescription: 'Phong thái đoan trang, thanh nhã xứ Huế',
    skinTone: '#F5E6D3',
    hairStyle: 'Búi tóc truyền thống',
    hairColor: '#1A1817'
  },
  {
    id: 'female_modern',
    name: 'Nữ Sinh Tân Thời',
    gender: 'Female',
    eraDescription: 'Tươi tắn, phóng khoáng phong cách Đông Dương',
    skinTone: '#FBEFE4',
    hairStyle: 'Tóc ngang vai Le Mur',
    hairColor: '#2B2523'
  },
  {
    id: 'female_folk',
    name: 'Cô Tấm Dân Gian',
    gender: 'Female',
    eraDescription: 'Mộc mạc, đằm thắm duyên dáng Bắc Bộ',
    skinTone: '#EED9C4',
    hairStyle: 'Tóc vấn khăn',
    hairColor: '#141414'
  },
  {
    id: 'male_scholar',
    name: 'Nho Sinh Khoa Bảng',
    gender: 'Male',
    eraDescription: 'Thanh lịch, tri thức và nhã nhặn',
    skinTone: '#F3E4D2',
    hairStyle: 'Búi tóc củ hành',
    hairColor: '#1C1917'
  },
  {
    id: 'male_gentleman',
    name: 'Quý Ông Tân Thời',
    gender: 'Male',
    eraDescription: 'Lịch lãm, giao thoa cổ điển và hiện đại',
    skinTone: '#F7E9DA',
    hairStyle: 'Tóc rẽ ngôi cổ điển',
    hairColor: '#24201E'
  }
];

export const AvatarMannequinView: React.FC<AvatarMannequinViewProps> = ({
  selectedGender,
  garmentItem,
  innerItem,
  bottomItem,
  shoesItem,
  headwearItem,
  jewelryItems = [],
  itemColors,
  onSelectItem
}) => {
  // Lọc danh sách nhân vật theo giới tính
  const availablePersonas = AVATAR_PERSONAS.filter(
    (p) => p.gender.toLowerCase() === selectedGender.toLowerCase()
  );

  const [selectedPersonaId, setSelectedPersonaId] = useState<string>(
    availablePersonas[0]?.id || AVATAR_PERSONAS[0].id
  );

  const currentPersona =
    AVATAR_PERSONAS.find((p) => p.id === selectedPersonaId) || availablePersonas[0];

  const resolvedGarment = resolveItemByGender(garmentItem, selectedGender);
  const resolvedInner = innerItem ? resolveItemByGender(innerItem, selectedGender) : null;
  const resolvedBottom = bottomItem ? resolveItemByGender(bottomItem, selectedGender) : null;
  const resolvedShoes = shoesItem ? resolveItemByGender(shoesItem, selectedGender) : null;
  const resolvedHeadwear = headwearItem ? resolveItemByGender(headwearItem, selectedGender) : null;

  const garmentColor = itemColors[garmentItem.id] || { hex: null, intensity: 0.85 };
  const innerColor = innerItem ? itemColors[innerItem.id] || { hex: null, intensity: 0.85 } : null;
  const bottomColor = bottomItem ? itemColors[bottomItem.id] || { hex: null, intensity: 0.85 } : null;

  return (
    <div className="w-full flex flex-col items-center space-y-6">
      {/* 1. THANH CHỌN HÌNH MẪU NHÂN VẬT ĐẠI DIỆN */}
      <div className="w-full max-w-lg bg-white/90 backdrop-blur-md rounded-2xl p-2.5 sm:p-3 border border-stone-200/90 shadow-xs">
        <div className="flex items-center justify-between pb-2 mb-2 border-b border-stone-100 px-1">
          <span className="text-[10px] font-mono uppercase tracking-wider text-stone-500 font-semibold flex items-center gap-1.5">
            <User className="w-3.5 h-3.5 text-red-700" />
            Nhân vật thử đồ ({selectedGender === 'male' ? 'Nam' : 'Nữ'})
          </span>
          <span className="text-[11px] text-stone-400 font-sans italic">
            {currentPersona.eraDescription}
          </span>
        </div>

        <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide">
          {availablePersonas.map((persona) => {
            const isSelected = persona.id === selectedPersonaId;
            return (
              <button
                key={persona.id}
                type="button"
                onClick={() => setSelectedPersonaId(persona.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-sans font-medium shrink-0 transition-all cursor-pointer flex items-center gap-1.5 ${
                  isSelected
                    ? 'bg-stone-900 text-white shadow-xs font-semibold'
                    : 'bg-stone-50 text-stone-600 hover:bg-stone-100 hover:text-stone-900 border border-stone-200/60'
                }`}
              >
                <span
                  className="w-2.5 h-2.5 rounded-full border border-stone-300 shrink-0"
                  style={{ backgroundColor: persona.skinTone }}
                />
                <span>{persona.name}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 2. KHUNG PHÒNG THỬ ĐỒ ẢO (VIRTUAL FITTING RUNWAY) */}
      <div className="relative w-full max-w-md sm:max-w-lg min-h-[580px] sm:min-h-[640px] rounded-3xl p-6 bg-gradient-to-b from-[#F7F4EE] to-[#EFECE4] border border-stone-200/90 shadow-inner flex flex-col items-center justify-between overflow-hidden select-none">
        {/* Background Họa tiết gạch bông cổ điển mờ */}
        <div className="absolute inset-0 opacity-5 pointer-events-none bg-[radial-gradient(#b91c1c_1px,transparent_1px)] [background-size:16px_16px]" />

        {/* Tiêu đề & Thông tin persona */}
        <div className="text-center z-10 space-y-1">
          <span className="text-[9px] font-mono tracking-[0.25em] text-red-800 uppercase font-bold">
            VIRTUAL MANNEQUIN RUNWAY
          </span>
          <h3 className="text-lg font-serif font-bold text-stone-900">
            {currentPersona.name} • Thử Đồ
          </h3>
          <p className="text-[11px] text-stone-500 font-sans">
            Tỷ lệ ướm dáng phối lớp theo quy chuẩn
          </p>
        </div>

        {/* KHUNG THÂN HÌNH MANNEQUIN & CÁC LỚP TRANG PHỤC */}
        <div className="relative w-64 sm:w-72 h-[420px] sm:h-[460px] flex items-center justify-center my-auto">
          {/* SÂN ĐỨNG (PODIUM SHADOW) */}
          <div className="absolute bottom-2 w-48 h-8 bg-stone-900/10 rounded-full blur-md" />

          {/* LAYER 0: MANNEQUIN SILHOUETTE (KHUNG DÁNG NGƯỜI) */}
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
            {/* Đầu & Tóc */}
            <div className="relative flex flex-col items-center -top-4">
              {/* Tóc */}
              <div
                className="w-14 h-14 rounded-full z-10"
                style={{ backgroundColor: currentPersona.hairColor }}
              />
              {/* Khuôn mặt */}
              <div
                className="w-11 h-13 rounded-2xl -mt-9 shadow-inner z-20 flex flex-col items-center justify-center border border-black/5"
                style={{ backgroundColor: currentPersona.skinTone }}
              >
                {/* Đường nét mặt cách điệu tối giản */}
                <div className="flex items-center gap-3 mt-1 opacity-25">
                  <span className="w-1.5 h-0.5 bg-stone-700 rounded-full" />
                  <span className="w-1.5 h-0.5 bg-stone-700 rounded-full" />
                </div>
                <div className="w-2 h-0.5 bg-red-400/50 rounded-full mt-3" />
              </div>
              {/* Cổ */}
              <div
                className="w-4 h-5 -mt-1 z-15"
                style={{ backgroundColor: currentPersona.skinTone }}
              />
            </div>

            {/* Thân trên */}
            <div
              className={`w-28 sm:w-32 rounded-3xl -mt-1 opacity-70 z-10 transition-all ${
                selectedGender === 'female' ? 'h-36 rounded-t-3xl' : 'h-40 rounded-t-2xl'
              }`}
              style={{ backgroundColor: currentPersona.skinTone }}
            />

            {/* Chân */}
            <div className="flex gap-4 -mt-2 opacity-70 z-0">
              <div
                className="w-6 h-40 rounded-b-xl"
                style={{ backgroundColor: currentPersona.skinTone }}
              />
              <div
                className="w-6 h-40 rounded-b-xl"
                style={{ backgroundColor: currentPersona.skinTone }}
              />
            </div>
          </div>

          {/* LAYER 1: ÁO LÓT / YẾM (INNER LAYER) */}
          {resolvedInner && (
            <div
              onClick={() => onSelectItem && onSelectItem('inner', innerItem)}
              className="absolute top-16 z-25 w-32 sm:w-36 h-36 flex items-center justify-center cursor-pointer transition-transform hover:scale-105"
              title={`Áo lót / Yếm: ${resolvedInner.name}`}
            >
              <TintedImage
                src={getSafeImageUrl(resolvedInner.resolvedImageUrl || resolvedInner)}
                colorHex={innerColor?.hex || null}
                intensity={innerColor?.intensity || 0.85}
                alt={resolvedInner.name}
                className="w-full h-full flex items-center justify-center opacity-90"
                imgClassName="mix-blend-multiply object-contain drop-shadow-xs"
              />
            </div>
          )}

          {/* LAYER 2: ĐỒ NỬA DƯỚI (QUẦN / CHÂN VÁY) */}
          {resolvedBottom && (
            <div
              onClick={() => onSelectItem && onSelectItem('bottom', bottomItem)}
              className="absolute top-44 sm:top-48 z-26 w-40 sm:w-48 h-48 sm:h-52 flex items-center justify-center cursor-pointer transition-transform hover:scale-105"
              title={`Đồ nửa dưới: ${resolvedBottom.name}`}
            >
              <TintedImage
                src={getSafeImageUrl(resolvedBottom.resolvedImageUrl || resolvedBottom)}
                colorHex={bottomColor?.hex || null}
                intensity={bottomColor?.intensity || 0.85}
                alt={resolvedBottom.name}
                className="w-full h-full flex items-center justify-center"
                imgClassName="mix-blend-multiply object-contain drop-shadow-sm"
              />
            </div>
          )}

          {/* LAYER 3: CỔ PHỤC CHÍNH (KEY PIECE GARMENT) */}
          <div
            onClick={() => onSelectItem && onSelectItem('garment', garmentItem)}
            className="absolute top-12 z-30 w-52 sm:w-60 h-64 sm:h-72 flex items-center justify-center cursor-pointer transition-transform hover:scale-102"
            title={`Cổ phục chính: ${resolvedGarment.name}`}
          >
            <TintedImage
              src={getSafeImageUrl(resolvedGarment.resolvedImageUrl || resolvedGarment)}
              colorHex={garmentColor.hex}
              intensity={garmentColor.intensity}
              alt={resolvedGarment.name}
              className="w-full h-full flex items-center justify-center"
              imgClassName="mix-blend-multiply object-contain drop-shadow-md"
            />
          </div>

          {/* LAYER 4: GIÀY DÉP (SHOES / FOOTWEAR) */}
          {resolvedShoes && (
            <div
              onClick={() => onSelectItem && onSelectItem('shoes', shoesItem)}
              className="absolute bottom-0 z-35 w-32 sm:w-36 h-20 flex items-center justify-center cursor-pointer transition-transform hover:scale-105"
              title={`Giày dép: ${resolvedShoes.name}`}
            >
              <img
                src={getSafeImageUrl(resolvedShoes.resolvedImageUrl || resolvedShoes)}
                alt={resolvedShoes.name}
                className="max-w-full max-h-full object-contain mix-blend-multiply drop-shadow-xs"
              />
            </div>
          )}

          {/* LAYER 5: MŨ NÓN (HEADWEAR) */}
          {resolvedHeadwear && (
            <div
              onClick={() => onSelectItem && onSelectItem('headwear', headwearItem)}
              className="absolute -top-3 z-40 w-28 sm:w-32 h-24 flex items-center justify-center cursor-pointer transition-transform hover:scale-105"
              title={`Mũ nón: ${resolvedHeadwear.name}`}
            >
              <img
                src={getSafeImageUrl(resolvedHeadwear.resolvedImageUrl || resolvedHeadwear)}
                alt={resolvedHeadwear.name}
                className="max-w-full max-h-full object-contain mix-blend-multiply drop-shadow-sm"
              />
            </div>
          )}

          {/* LAYER 6: TRANG SỨC (JEWELRY) */}
          {jewelryItems.length > 0 && (
            <div
              onClick={() => onSelectItem && onSelectItem('jewelry', jewelryItems[0])}
              className="absolute top-16 z-45 w-16 h-16 flex items-center justify-center cursor-pointer transition-transform hover:scale-110"
              title={`Trang sức: ${jewelryItems.map((j) => j.name).join(', ')}`}
            >
              <img
                src={getSafeImageUrl(
                  resolveItemByGender(jewelryItems[0], selectedGender).resolvedImageUrl ||
                    jewelryItems[0]
                )}
                alt={jewelryItems[0].name}
                className="max-w-full max-h-full object-contain mix-blend-multiply drop-shadow-xs"
              />
            </div>
          )}
        </div>

        {/* THÔNG TIN NHANH CÁC LỚP TRANG PHỤC ĐANG MẶC TRÊN NGƯỜI */}
        <div className="w-full pt-3 border-t border-stone-200/70 flex flex-wrap items-center justify-center gap-2 text-[10px] font-sans text-stone-600">
          <span className="px-2 py-0.5 rounded-full bg-white/80 border border-stone-200 font-semibold text-red-800">
            {resolvedGarment.name}
          </span>
          {resolvedBottom && (
            <span className="px-2 py-0.5 rounded-full bg-white/80 border border-stone-200">
              {resolvedBottom.name}
            </span>
          )}
          {resolvedInner && (
            <span className="px-2 py-0.5 rounded-full bg-white/80 border border-stone-200">
              {resolvedInner.name}
            </span>
          )}
          {resolvedShoes && (
            <span className="px-2 py-0.5 rounded-full bg-white/80 border border-stone-200">
              {resolvedShoes.name}
            </span>
          )}
          {resolvedHeadwear && (
            <span className="px-2 py-0.5 rounded-full bg-white/80 border border-stone-200">
              {resolvedHeadwear.name}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};
