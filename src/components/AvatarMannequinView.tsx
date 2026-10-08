import React, { useState } from 'react';
import { Sparkles, Layers, Palette, Eye, Info } from 'lucide-react';
import { Garment, CasualItem, AccessoryItem, Gender } from '../types';
import { TintedImage } from './TintedImage';
import { getSafeImageUrl, resolveItemByGender } from '../utils/helpers';

export interface AvatarMannequinViewProps {
  selectedGender: 'male' | 'female' | 'Male' | 'Female' | Gender;
  garmentItem: Garment;
  innerItem?: CasualItem | null;
  bottomItem?: CasualItem | null;
  shoesItem?: CasualItem | null;
  headwearItem?: AccessoryItem | null;
  jewelryItems?: AccessoryItem[];
  itemColors: Record<string, { hex: string | null; intensity: number }>;
  onSelectItem?: (type: 'garment' | 'inner' | 'bottom' | 'shoes' | 'headwear' | 'jewelry', item: any) => void;
}

// Danh sách các chất liệu ma-nơ-canh may đo cao cấp (Atelier Display Styles)
export interface AtelierStyle {
  id: string;
  name: string;
  description: string;
  woodTone: string;
  woodHighlight: string;
  metalColor: string;
  fabricTone: string;
  fabricHighlight: string;
  seamColor: string;
}

export const ATELIER_STYLES: AtelierStyle[] = [
  {
    id: 'imperial_mahogany',
    name: 'Gỗ Gụ Cố Đô',
    description: 'Chân đế gỗ gụ sẫm màu, thân bọc vải lanh mộc hoàng gia',
    woodTone: '#3D2517',
    woodHighlight: '#69412A',
    metalColor: '#D4AF37', // Vàng đồng thau
    fabricTone: '#ECE5D8',
    fabricHighlight: '#F8F4EC',
    seamColor: '#D1C4B0'
  },
  {
    id: 'indochine_teak',
    name: 'Gỗ Tếch Đông Dương',
    description: 'Phong cách tiệm may Tân thời thập niên 1930',
    woodTone: '#543825',
    woodHighlight: '#80563B',
    metalColor: '#C5A059',
    fabricTone: '#F2EBE1',
    fabricHighlight: '#FAF7F2',
    seamColor: '#DDD1C2'
  },
  {
    id: 'atelier_noir',
    name: 'Gỗ Mun & Đồng Thau',
    description: 'Ma-nơ-canh may đo đương đại, đường nét tối giản sang trọng',
    woodTone: '#1F1E1D',
    woodHighlight: '#3B3835',
    metalColor: '#E5C158',
    fabricTone: '#F5F2EB',
    fabricHighlight: '#FFFFFF',
    seamColor: '#DDD6CA'
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
  const isFemale = selectedGender.toLowerCase() === 'female';
  const [selectedStyleId, setSelectedStyleId] = useState<string>(ATELIER_STYLES[0].id);

  const currentStyle =
    ATELIER_STYLES.find((s) => s.id === selectedStyleId) || ATELIER_STYLES[0];

  const resolvedGarment = resolveItemByGender(garmentItem, selectedGender);
  const resolvedInner = innerItem ? resolveItemByGender(innerItem, selectedGender) : null;
  const resolvedBottom = bottomItem ? resolveItemByGender(bottomItem, selectedGender) : null;
  const resolvedShoes = shoesItem ? resolveItemByGender(shoesItem, selectedGender) : null;
  const resolvedHeadwear = headwearItem ? resolveItemByGender(headwearItem, selectedGender) : null;

  const garmentColor = itemColors[garmentItem.id] || { hex: null, intensity: 0.85 };
  const innerColor = innerItem ? itemColors[innerItem.id] || { hex: null, intensity: 0.85 } : null;
  const bottomColor = bottomItem ? itemColors[bottomItem.id] || { hex: null, intensity: 0.85 } : null;

  return (
    <div className="w-full flex flex-col items-center space-y-4">
      {/* 1. THANH CHỌN CHẤT LIỆU MA-NƠ-CANH MAY ĐO */}
      <div className="w-full max-w-lg bg-white/95 backdrop-blur-md rounded-2xl p-2.5 sm:p-3 border border-stone-200/90 shadow-2xs">
        <div className="flex items-center justify-between pb-2 mb-2 border-b border-stone-100 px-1">
          <span className="text-[10px] font-mono uppercase tracking-wider text-stone-500 font-semibold flex items-center gap-1.5">
            <Layers className="w-3.5 h-3.5 text-red-800" />
            Ma-nơ-canh May Đo • {isFemale ? 'Phom Nữ' : 'Phom Nam'}
          </span>
          <span className="text-[11px] text-stone-400 font-sans italic hidden sm:inline">
            {currentStyle.description}
          </span>
        </div>

        <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide">
          {ATELIER_STYLES.map((style) => {
            const isSelected = style.id === selectedStyleId;
            return (
              <button
                key={style.id}
                type="button"
                onClick={() => setSelectedStyleId(style.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-sans font-medium shrink-0 transition-all cursor-pointer flex items-center gap-2 ${
                  isSelected
                    ? 'bg-stone-900 text-white shadow-xs font-semibold'
                    : 'bg-stone-50 text-stone-600 hover:bg-stone-100 hover:text-stone-900 border border-stone-200/60'
                }`}
              >
                {/* Vòng gỗ mẫu chất liệu */}
                <span
                  className="w-3 h-3 rounded-full border border-white/40 shrink-0 shadow-2xs"
                  style={{
                    background: `linear-gradient(135deg, ${style.woodHighlight}, ${style.woodTone})`
                  }}
                />
                <span>{style.name}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 2. KHUNG TRƯNG BÀY TIỆM MAY (ATELIER EXHIBITION STAGE) */}
      <div className="relative w-full max-w-md sm:max-w-lg min-h-[640px] sm:min-h-[700px] rounded-3xl p-6 bg-radial-[at_top] from-[#FDFBF7] via-[#F6F2E9] to-[#ECE6D8] border border-stone-200/90 shadow-xs flex flex-col items-center justify-between overflow-hidden select-none">
        {/* Họa tiết tia sáng spotlight & hoa văn di sản chìm */}
        <div className="absolute inset-0 opacity-[0.03] pointer-events-none bg-[radial-gradient(#b91c1c_1px,transparent_1px)] [background-size:20px_20px]" />
        
        {/* Ánh sáng Spotlight sân khấu từ đỉnh */}
        <div className="absolute -top-24 w-80 h-80 rounded-full bg-amber-100/30 blur-3xl pointer-events-none" />

        {/* Tiêu đề góc trưng bày sang trọng */}
        <div className="text-center z-10 space-y-1 pt-1">
          <span className="text-[9px] font-mono tracking-[0.3em] text-red-800 uppercase font-bold">
            ATELIER DRESS FORM • DÁNG THỬ MAY ĐO
          </span>
          <h3 className="text-base sm:text-lg font-serif font-bold text-stone-900">
            {resolvedGarment.name}
          </h3>
          <p className="text-[11px] text-stone-400 font-sans tracking-wide">
            {isFemale ? 'Dáng nữ thắt eo uyển chuyển' : 'Dáng nam vai vuông đĩnh đạc'} • Chạm vào từng món để xem chi tiết
          </p>
        </div>

        {/* ========================================================
            3. KHUNG MA-NƠ-CANH GỖ VÀ CÁC LỚP TRANG PHỤC PHỐI
           ======================================================== */}
        <div className="relative w-72 sm:w-80 h-[500px] sm:h-[540px] flex items-center justify-center my-auto">
          {/* BÓNG ĐỔ SÀN SÂN KHẤU (AMBIENT PEDESTAL SHADOW) */}
          <div className="absolute bottom-2 w-56 h-8 bg-stone-900/12 rounded-full blur-md" />

          {/* LAYER 0: MA-NƠ-CANH ATELIER VECTOR CHUYÊN NGHIỆP (SVG DRESS FORM) */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-0">
            <svg
              viewBox="0 0 280 540"
              className="w-full h-full drop-shadow-sm"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <defs>
                {/* Gradient gỗ tiện cao cấp */}
                <linearGradient id="woodGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor={currentStyle.woodHighlight} />
                  <stop offset="70%" stopColor={currentStyle.woodTone} />
                  <stop offset="100%" stopColor="#120B07" />
                </linearGradient>

                {/* Gradient vải linen bọc thân ma-nơ-canh */}
                <linearGradient id="fabricGrad" x1="20%" y1="0%" x2="80%" y2="100%">
                  <stop offset="0%" stopColor={currentStyle.fabricHighlight} />
                  <stop offset="50%" stopColor={currentStyle.fabricTone} />
                  <stop offset="100%" stopColor={currentStyle.seamColor} />
                </linearGradient>

                {/* Gradient kim loại đồng thau */}
                <linearGradient id="metalGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#B48228" />
                  <stop offset="50%" stopColor={currentStyle.metalColor} />
                  <stop offset="100%" stopColor="#7E5916" />
                </linearGradient>
              </defs>

              {/* CHỐT ĐỈNH CỔ GỖ TIỆN NGHỆ THUẬT (WOODEN FINIAL) */}
              <g id="neck-finial">
                {/* Núm tiện đỉnh */}
                <ellipse cx="140" cy="42" rx="10" ry="7" fill="url(#woodGrad)" />
                <path
                  d="M 134 42 C 134 32 146 32 146 42 Z"
                  fill="url(#woodGrad)"
                />
                {/* Đĩa chặn cổ gỗ */}
                <ellipse cx="140" cy="50" rx="16" ry="6" fill="url(#woodGrad)" />
                <rect x="135" y="47" width="10" height="7" fill="url(#woodGrad)" />
              </g>

              {/* CỔ MA-NƠ-CANH BỌC VẢI LINEN */}
              <path
                d="M 132 50 L 131 72 C 131 76 128 80 124 82 L 156 82 C 152 80 149 76 149 72 L 148 50 Z"
                fill="url(#fabricGrad)"
              />

              {/* THÂN MA-NƠ-CANH MAY ĐO (TAILOR DRESS FORM TORSO) */}
              {isFemale ? (
                /* PHOM NỮ: Vai xuôi mềm mại, eo thắt chuẩn haute couture, hông nở thanh nhã */
                <g id="female-torso">
                  <path
                    d="M 124 82 
                       C 106 85 82 96 74 116 
                       C 68 132 74 156 88 174 
                       C 96 185 102 200 102 214 
                       C 102 226 96 242 90 258 
                       C 84 274 86 295 96 308 
                       C 104 318 120 324 140 324 
                       C 160 324 176 318 184 308 
                       C 194 295 196 274 190 258 
                       C 184 242 178 226 178 214 
                       C 178 200 184 185 192 174 
                       C 206 156 212 132 206 116 
                       C 198 96 174 85 156 82 
                       Z"
                    fill="url(#fabricGrad)"
                    stroke={currentStyle.seamColor}
                    strokeWidth="1"
                  />
                  {/* Đường chỉ may ráp thân nổi tiếng (Princess Seams) */}
                  <path
                    d="M 140 82 L 140 324"
                    stroke={currentStyle.seamColor}
                    strokeWidth="1"
                    strokeDasharray="3 3"
                    opacity="0.6"
                  />
                  <path
                    d="M 112 110 C 118 150 122 180 120 220 C 118 260 112 290 114 322"
                    stroke={currentStyle.seamColor}
                    strokeWidth="0.8"
                    opacity="0.4"
                  />
                  <path
                    d="M 168 110 C 162 150 158 180 160 220 C 162 260 168 290 166 322"
                    stroke={currentStyle.seamColor}
                    strokeWidth="0.8"
                    opacity="0.4"
                  />
                  {/* Đáy thân gỗ bo tròn */}
                  <ellipse cx="140" cy="324" rx="44" ry="10" fill="url(#woodGrad)" />
                </g>
              ) : (
                /* PHOM NAM: Vai vuông vức đĩnh đạc, ngực nở, eo suông sang trọng */
                <g id="male-torso">
                  <path
                    d="M 124 82 
                       C 102 84 72 94 62 114 
                       C 54 130 60 158 72 178 
                       C 82 192 92 210 94 228 
                       C 96 244 94 266 92 284 
                       C 90 300 96 314 108 322 
                       C 118 328 128 330 140 330 
                       C 152 330 162 328 172 322 
                       C 184 314 190 300 188 284 
                       C 186 266 184 244 186 228 
                       C 188 210 198 192 208 178 
                       C 220 158 226 130 218 114 
                       C 208 94 178 84 156 82 
                       Z"
                    fill="url(#fabricGrad)"
                    stroke={currentStyle.seamColor}
                    strokeWidth="1"
                  />
                  {/* Đường chỉ may ráp thân nam */}
                  <path
                    d="M 140 82 L 140 330"
                    stroke={currentStyle.seamColor}
                    strokeWidth="1"
                    strokeDasharray="4 3"
                    opacity="0.6"
                  />
                  <path
                    d="M 106 112 C 114 160 118 210 116 260 C 114 290 116 315 120 328"
                    stroke={currentStyle.seamColor}
                    strokeWidth="0.8"
                    opacity="0.4"
                  />
                  <path
                    d="M 174 112 C 166 160 162 210 164 260 C 166 290 164 315 160 328"
                    stroke={currentStyle.seamColor}
                    strokeWidth="0.8"
                    opacity="0.4"
                  />
                  {/* Đáy thân gỗ bo tròn */}
                  <ellipse cx="140" cy="330" rx="48" ry="10" fill="url(#woodGrad)" />
                </g>
              )}

              {/* TRỤ ĐỨNG BẰNG ĐỒNG THAU & GỖ TIỆN (SUPPORT POLE) */}
              <g id="stand-pole">
                {/* Khớp nối kim loại dưới thân */}
                <rect x="136" y="330" width="8" height="12" fill="url(#metalGrad)" rx="1" />
                <ellipse cx="140" cy="342" rx="7" ry="2.5" fill="url(#metalGrad)" />

                {/* Trụ đứng chính */}
                <rect x="137.5" y="342" width="5" height="140" fill="url(#metalGrad)" />
                
                {/* Khóa vặn điều chỉnh độ cao (Brass adjustment screw) */}
                <circle cx="140" cy="370" r="4.5" fill="url(#metalGrad)" stroke="#5B4012" strokeWidth="0.5" />
                <line x1="144" y1="370" x2="149" y2="370" stroke="url(#metalGrad)" strokeWidth="2.5" strokeLinecap="round" />
              </g>

              {/* CHÂN ĐẾ GỖ TIỆN CỔ ĐIỂN 3 CHẤU (CLASSIC WOOD TRIPOD BASE) */}
              <g id="tripod-base">
                {/* Bầu gỗ tiện trung tâm chân đế */}
                <path
                  d="M 134 460 L 132 485 C 132 490 148 490 148 485 L 146 460 Z"
                  fill="url(#woodGrad)"
                />
                <circle cx="140" cy="475" r="8" fill="url(#woodGrad)" />

                {/* Chân giữa vươn thẳng */}
                <path
                  d="M 137 482 Q 138 505 140 514 Q 142 505 143 482 Z"
                  fill="url(#woodGrad)"
                />
                <ellipse cx="140" cy="515" rx="5" ry="2" fill="url(#woodGrad)" />

                {/* Chân trái uốn lượn phong cách Đông Dương */}
                <path
                  d="M 134 478 
                     C 120 490 102 506 94 515 
                     C 97 516 102 516 108 512 
                     C 118 504 132 490 138 482 Z"
                  fill="url(#woodGrad)"
                />

                {/* Chân phải uốn lượn */}
                <path
                  d="M 146 478 
                     C 160 490 178 506 186 515 
                     C 183 516 178 516 172 512 
                     C 162 504 148 490 142 482 Z"
                  fill="url(#woodGrad)"
                />
              </g>
            </svg>
          </div>

          {/* ========================================================
              LAYER 1: ÁO LÓT / YẾM (INNER LAYER - ƯỚM TRÊN NGỰC EO)
             ======================================================== */}
          {resolvedInner && (
            <div
              onClick={() => onSelectItem && onSelectItem('inner', innerItem)}
              className="absolute top-18 sm:top-20 z-10 w-32 sm:w-36 h-36 flex items-center justify-center cursor-pointer transition-transform hover:scale-105"
              title={`Áo lót / Yếm: ${resolvedInner.name}`}
            >
              <TintedImage
                src={getSafeImageUrl(resolvedInner.resolvedImageUrl || resolvedInner)}
                colorHex={innerColor?.hex || null}
                intensity={innerColor?.intensity || 0.85}
                alt={resolvedInner.name}
                className="w-full h-full flex items-center justify-center opacity-92"
                imgClassName="mix-blend-multiply object-contain drop-shadow-xs"
              />
            </div>
          )}

          {/* ========================================================
              LAYER 2: ĐỒ NỬA DƯỚI (QUẦN / CHÂN VÁY - PHỦ TỪ EO)
             ======================================================== */}
          {resolvedBottom && (
            <div
              onClick={() => onSelectItem && onSelectItem('bottom', bottomItem)}
              className="absolute top-48 sm:top-52 z-15 w-44 sm:w-52 h-56 sm:h-64 flex items-center justify-center cursor-pointer transition-transform hover:scale-105"
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

          {/* ========================================================
              LAYER 3: CỔ PHỤC CHÍNH (KEY PIECE - TRÙM VAI & THÂN DÁNG)
             ======================================================== */}
          <div
            onClick={() => onSelectItem && onSelectItem('garment', garmentItem)}
            className="absolute top-10 sm:top-12 z-20 w-56 sm:w-64 h-72 sm:h-80 flex items-center justify-center cursor-pointer transition-transform hover:scale-102"
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

          {/* ========================================================
              LAYER 4: KHĂN ĐÓNG / NÓN / MŨ (ĐẶT TRÊN ĐỈNH CỔ GỖ)
             ======================================================== */}
          {resolvedHeadwear && (
            <div
              onClick={() => onSelectItem && onSelectItem('headwear', headwearItem)}
              className="absolute -top-3 sm:-top-5 z-25 w-28 sm:w-32 h-24 flex items-center justify-center cursor-pointer transition-transform hover:scale-108"
              title={`Mũ nón / Khăn xếp: ${resolvedHeadwear.name}`}
            >
              <img
                src={getSafeImageUrl(resolvedHeadwear.resolvedImageUrl || resolvedHeadwear)}
                alt={resolvedHeadwear.name}
                className="max-w-full max-h-full object-contain mix-blend-multiply drop-shadow-sm"
              />
            </div>
          )}

          {/* ========================================================
              LAYER 5: TRANG SỨC (KIỀNG / CHUỖI NGỌC - QUANH KHỚP CỔ)
             ======================================================== */}
          {jewelryItems.length > 0 && (
            <div
              onClick={() => onSelectItem && onSelectItem('jewelry', jewelryItems[0])}
              className="absolute top-14 sm:top-16 z-30 w-16 sm:w-20 h-16 flex items-center justify-center cursor-pointer transition-transform hover:scale-115"
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

          {/* ========================================================
              LAYER 6: GIÀY DÉP / HÀI THÊU (ĐẶT NGAY NGẮN DƯỚI ĐẾ SÀN)
             ======================================================== */}
          {resolvedShoes && (
            <div
              onClick={() => onSelectItem && onSelectItem('shoes', shoesItem)}
              className="absolute bottom-1 z-25 w-28 sm:w-32 h-16 flex items-center justify-center cursor-pointer transition-transform hover:scale-108"
              title={`Giày dép / Hài: ${resolvedShoes.name}`}
            >
              <img
                src={getSafeImageUrl(resolvedShoes.resolvedImageUrl || resolvedShoes)}
                alt={resolvedShoes.name}
                className="max-w-full max-h-full object-contain mix-blend-multiply drop-shadow-xs"
              />
            </div>
          )}
        </div>

        {/* THẺ TÊN CỔ PHỤC GỖ DI SẢN BÊN DƯỚI (ATELIER NAMEPLATE) */}
        <div className="w-full pt-3 border-t border-stone-200/70 flex flex-wrap items-center justify-center gap-2 text-[10px] font-sans text-stone-600">
          <span className="px-2.5 py-0.5 rounded-full bg-white/90 border border-amber-800/20 font-semibold text-red-900 shadow-2xs">
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
          {resolvedHeadwear && (
            <span className="px-2 py-0.5 rounded-full bg-white/80 border border-stone-200">
              {resolvedHeadwear.name}
            </span>
          )}
          {resolvedShoes && (
            <span className="px-2 py-0.5 rounded-full bg-white/80 border border-stone-200">
              {resolvedShoes.name}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

export default AvatarMannequinView;
