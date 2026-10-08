import React, { useState } from 'react';
import {
  Sparkles,
  ArrowRight,
  Compass,
  Shirt,
  Layers,
  SlidersHorizontal,
  ShieldAlert,
  ShieldCheck,
  AlertTriangle,
  Check,
  Ban,
  Info,
  Calendar,
  Tag
} from 'lucide-react';
import { GARMENTS, CASUAL_ITEMS, CONTEXTS, OUTFIT_COMBINATIONS } from './data';
import { Garment, CasualItem, LapelFold, Gender } from './types';
import { validateOutfit } from './utils/validationEngine';
import { resolveImageUrl } from './utils/helpers';
import { BottomNavbar, NavTab } from './components/BottomNavbar';
import { TopHeader } from './components/TopHeader';
import { GarmentCard } from './components/GarmentCard';
import { CasualItemCard } from './components/CasualItemCard';
import { GarmentDetailModal } from './components/GarmentDetailModal';
import { CasualDetailModal } from './components/CasualDetailModal';
import { GenderToggle } from './components/GenderToggle';
import { SafeImage } from './components/SafeImage';

export default function App() {
  const [activeTab, setActiveTab] = useState<NavTab>('home');
  const [exploreFilter, setExploreFilter] = useState<'all' | 'garments' | 'casual'>('all');
  const [selectedGender, setSelectedGender] = useState<Gender>('Female');

  // Modals
  const [selectedGarment, setSelectedGarment] = useState<Garment | null>(null);
  const [selectedCasual, setSelectedCasual] = useState<CasualItem | null>(null);

  // Studio Remix State
  const [labGarmentId, setLabGarmentId] = useState<string>(GARMENTS[0].id);
  const [labBottomId, setLabBottomId] = useState<string>('cs_01');
  const [labContextId, setLabContextId] = useState<string>('C01');
  const [labLapelFold, setLabLapelFold] = useState<LapelFold>('right_over_left');
  const [labHasOuterLayer, setLabHasOuterLayer] = useState<boolean>(false);

  const activeLabGarment = GARMENTS.find((g) => g.id === labGarmentId) || GARMENTS[0];
  const activeLabBottom = CASUAL_ITEMS.find((c) => c.id === labBottomId) || CASUAL_ITEMS[0];
  const activeLabContext = CONTEXTS.find((ctx) => ctx.id === labContextId) || CONTEXTS[0];

  // Deterministic Cultural Validation Engine (Zero AI latency)
  const validationResults = validateOutfit(
    labGarmentId,
    null,
    labBottomId,
    labContextId,
    labLapelFold,
    labHasOuterLayer ? 'outer_layer_present' : null
  );

  const hasBlockViolation = validationResults.some((r) => r.severity === 'BLOCK');

  // Quick Preset Test Scenarios for the 5 Rules
  const loadScenario = (ruleName: string) => {
    switch (ruleName) {
      case 'GUARD_SACRED_LENGTH':
        setLabGarmentId('V01');
        setLabBottomId('cs_05'); // Short mini skirt
        setLabContextId('C05'); // Chốn linh thiêng
        setLabHasOuterLayer(false);
        setLabLapelFold('right_over_left');
        break;
      case 'GUARD_YEM_STANDALONE':
        setLabGarmentId('V03'); // Yếm
        setLabBottomId('cs_01');
        setLabContextId('C01');
        setLabHasOuterLayer(false); // Standalone (không khoác)
        break;
      case 'GUARD_FORMAL_DECONSTRUCTION':
        setLabGarmentId('V06'); // Lễ phục Mãng bào
        setLabBottomId('cs_01'); // Jeans (vi phạm)
        setLabContextId('C01');
        setLabHasOuterLayer(false);
        break;
      case 'GUARD_GL_LAPEL':
        setLabGarmentId('V08'); // Áo Giao Lĩnh
        setLabBottomId('cs_03');
        setLabContextId('C01');
        setLabLapelFold('left_over_right'); // Sai quy chuẩn vạt
        break;
      case 'SILHOUETTE_AODAI_POOF':
        setLabGarmentId('V01'); // Áo dài
        setLabBottomId('cs_08'); // Chân váy xòe bồng công chúa
        setLabContextId('C01');
        break;
      case 'VALID_DEFAULT':
        setLabGarmentId('V01');
        setLabBottomId('cs_01');
        setLabContextId('C01');
        setLabLapelFold('right_over_left');
        setLabHasOuterLayer(false);
        break;
    }
  };

  const handleSelectForStudio = (id: string) => {
    if (GARMENTS.some((g) => g.id === id)) {
      setLabGarmentId(id);
    } else if (CASUAL_ITEMS.some((c) => c.id === id)) {
      setLabBottomId(id);
    }
    setActiveTab('studio');
  };

  const getTabTitle = () => {
    switch (activeTab) {
      case 'home':
        return 'Trang chủ di sản';
      case 'explore':
        return 'Khám phá kho trang phục';
      case 'studio':
        return 'Phòng phối đồ & Thử nghiệm';
      case 'lookbook':
        return 'Bộ sưu tập phối mẫu';
    }
  };

  return (
    <div className="min-h-screen bg-[#F9F8F6] text-gray-800 font-['Be_Vietnam_Pro',sans-serif] flex flex-col">
      {/* Thanh tiêu đề trên cùng */}
      <TopHeader
        onOpenStudio={() => setActiveTab('studio')}
        activeTabTitle={getTabTitle()}
      />

      {/* Vùng nội dung chính: pb-24 giúp cuộn trang không bị che khuất */}
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 pb-24 sm:pb-28">
        {/* 1. TAB TRANG CHỦ */}
        {activeTab === 'home' && (
          <div className="space-y-12 sm:space-y-20">
            {/* Phần mở đầu (Hero Section) */}
            <section className="text-center max-w-3xl mx-auto space-y-6 pt-2 sm:pt-6">
              <span className="text-xs uppercase font-mono tracking-widest text-red-700 font-semibold px-3 py-1 rounded-full bg-red-50 border border-red-200/60 inline-block">
                Ấn bản thời trang di sản đương đại
              </span>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-gray-900 font-['Playfair_Display',serif] leading-[1.15]">
                Di Sản Áo Mũ & Nhịp Điệu Đương Đại
              </h1>
              <p className="text-base sm:text-lg text-gray-600 font-normal leading-relaxed max-w-2xl mx-auto">
                Khám phá kho tàng 10 cổ phục Việt Nam qua các triều đại lịch sử, thử nghiệm phối cùng trang phục thời trang đường phố với bộ quy tắc bảo vệ tính chuẩn mực văn hóa.
              </p>

              <div className="flex flex-wrap items-center justify-center gap-3.5 pt-2">
                <button
                  onClick={() => setActiveTab('explore')}
                  className="px-6 py-3.5 rounded-xl bg-red-700 hover:bg-red-800 text-white text-sm font-semibold transition-all shadow-sm hover:shadow flex items-center gap-2"
                >
                  <Compass className="w-4 h-4 text-amber-200" />
                  Khám phá cổ phục ({GARMENTS.length})
                </button>
                <button
                  onClick={() => setActiveTab('studio')}
                  className="px-6 py-3.5 rounded-xl bg-white hover:bg-stone-50 text-gray-800 text-sm font-medium border border-stone-200/80 transition-all shadow-sm hover:shadow flex items-center gap-2"
                >
                  <SlidersHorizontal className="w-4 h-4 text-red-700" />
                  Thử nghiệm phối đồ
                </button>
              </div>
            </section>

            {/* Cổ phục tiêu biểu */}
            <section className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-end justify-between border-b border-stone-200/80 pb-4 gap-2">
                <div>
                  <span className="text-xs uppercase font-mono tracking-widest text-gray-400 font-semibold">
                    Tuyển chọn tiêu biểu
                  </span>
                  <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 font-['Playfair_Display',serif] mt-1">
                    Cổ Phục Biểu Tượng
                  </h2>
                </div>
                <div className="flex items-center gap-3">
                  <GenderToggle
                    selectedGender={selectedGender}
                    onChangeGender={setSelectedGender}
                    size="sm"
                  />
                  <button
                    onClick={() => setActiveTab('explore')}
                    className="text-xs font-semibold text-red-700 hover:text-red-800 flex items-center gap-1 group"
                  >
                    Xem tất cả ({GARMENTS.length})
                    <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                  </button>
                </div>
              </div>

              {/* Lưới hiển thị 4 cột */}
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 sm:gap-8">
                {GARMENTS.slice(0, 4).map((garment) => (
                  <GarmentCard
                    key={garment.id}
                    garment={garment}
                    onClick={() => setSelectedGarment(garment)}
                    selectedGender={selectedGender}
                  />
                ))}
              </div>
            </section>

            {/* Tuyên ngôn văn hóa */}
            <section className="text-center max-w-2xl mx-auto py-8 border-y border-stone-200/60 space-y-2">
              <blockquote className="font-['Playfair_Display',serif] text-xl sm:text-2xl italic text-gray-800 leading-relaxed">
                "Sáng tạo có trách nhiệm — Giữ vẹn nguyên tính tôn nghiêm & tinh thần dân tộc trong từng đường nét cách tân."
              </blockquote>
              <p className="text-xs text-gray-500 font-mono tracking-widest uppercase">
                Bộ quy chuẩn ứng xử thời trang di sản Đại Việt
              </p>
            </section>
          </div>
        )}

        {/* 2. TAB KHÁM PHÁ (EXPLORE) */}
        {activeTab === 'explore' && (
          <div className="space-y-8">
            {/* Tiêu đề & Bộ lọc */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-stone-200/80 pb-6">
              <div>
                <span className="text-xs uppercase font-mono tracking-widest text-red-700 font-semibold">
                  Kho tư liệu trang phục
                </span>
                <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 font-['Playfair_Display',serif] mt-1">
                  Kho Cổ Phục & Trang Phục Đương Đại
                </h2>
                <p className="text-xs sm:text-sm text-gray-500 mt-1 max-w-xl">
                  Tuyển tập 10 cổ phục di sản nguyên bản cùng 38 món đồ thời trang hiện đại được chuẩn hóa dữ liệu.
                </p>
              </div>

              {/* Bộ chọn giới tính & Nút lọc danh mục */}
              <div className="flex flex-wrap items-center gap-3">
                <GenderToggle
                  selectedGender={selectedGender}
                  onChangeGender={setSelectedGender}
                  size="sm"
                />

                <div className="flex flex-wrap items-center gap-2 bg-stone-100 p-1.5 rounded-2xl border border-stone-200/80">
                  <button
                    onClick={() => setExploreFilter('all')}
                    className={`px-3.5 py-1.5 rounded-xl text-xs font-medium transition-all ${
                      exploreFilter === 'all'
                        ? 'bg-white text-gray-900 shadow-sm font-semibold'
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    Tất cả ({GARMENTS.length + CASUAL_ITEMS.length})
                  </button>
                  <button
                    onClick={() => setExploreFilter('garments')}
                    className={`px-3.5 py-1.5 rounded-xl text-xs font-medium transition-all ${
                      exploreFilter === 'garments'
                        ? 'bg-red-700 text-white shadow-sm font-semibold'
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    Cổ phục ({GARMENTS.length})
                  </button>
                  <button
                    onClick={() => setExploreFilter('casual')}
                    className={`px-3.5 py-1.5 rounded-xl text-xs font-medium transition-all ${
                      exploreFilter === 'casual'
                        ? 'bg-red-700 text-white shadow-sm font-semibold'
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    Đồ hiện đại ({CASUAL_ITEMS.length})
                  </button>
                </div>
              </div>
            </div>

            {/* Danh sách cổ phục */}
            {(exploreFilter === 'all' || exploreFilter === 'garments') && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-bold text-gray-900 font-['Playfair_Display',serif] flex items-center gap-2">
                    <Shirt className="w-4 h-4 text-red-700" />
                    Cổ Phục Truyền Thống ({GARMENTS.length})
                  </h3>
                  <span className="text-xs text-gray-400 font-sans">Chạm để xem chi tiết di sản</span>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 sm:gap-8">
                  {GARMENTS.map((garment) => (
                    <GarmentCard
                      key={garment.id}
                      garment={garment}
                      onClick={() => setSelectedGarment(garment)}
                      selectedGender={selectedGender}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Danh sách trang phục phối đương đại */}
            {(exploreFilter === 'all' || exploreFilter === 'casual') && (
              <div className="space-y-4 pt-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-bold text-gray-900 font-['Playfair_Display',serif] flex items-center gap-2">
                    <Layers className="w-4 h-4 text-red-700" />
                    Trang Phục Phối Đương Đại ({CASUAL_ITEMS.length})
                  </h3>
                  <span className="text-xs text-gray-400 font-sans">38 món gồm quần, váy, áo trong và giày dép</span>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 sm:gap-8">
                  {CASUAL_ITEMS.map((item) => (
                    <CasualItemCard
                      key={item.id}
                      item={item}
                      onClick={() => setSelectedCasual(item)}
                      selectedGender={selectedGender}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* 3. TAB PHỐI ĐỒ (STUDIO REMIX) */}
        {activeTab === 'studio' && (
          <div className="space-y-8">
            {/* Đầu đề & Kịch bản thử nghiệm */}
            <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 border-b border-stone-200/80 pb-6">
              <div>
                <span className="text-xs uppercase font-mono tracking-widest text-red-700 font-semibold flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-red-700" />
                  Bộ quy tắc văn hóa chuẩn mực
                </span>
                <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 font-['Playfair_Display',serif] mt-1">
                  Phòng Phối Đồ & Kiểm Tra Tính Chuẩn Mực
                </h2>
                <p className="text-xs sm:text-sm text-gray-500 mt-1 max-w-xl">
                  Hệ thống kiểm tra 5 quy tắc chặn nghiêm cẩn để bảo vệ tính tôn nghiêm và mỹ cảm di sản Đại Việt.
                </p>
              </div>

              {/* Các nút bấm kiểm tra nhanh 5 quy tắc */}
              <div className="bg-white p-2.5 rounded-2xl border border-stone-200/80 shadow-sm space-y-1.5">
                <span className="text-[11px] font-sans text-gray-400 font-medium px-2 block">
                  Thử nghiệm nhanh 5 quy tắc chặn:
                </span>
                <div className="flex flex-wrap items-center gap-1.5">
                  <button
                    onClick={() => loadScenario('GUARD_SACRED_LENGTH')}
                    className="px-2.5 py-1 bg-stone-100 hover:bg-red-50 hover:text-red-700 text-stone-700 rounded-lg text-xs font-sans transition-all border border-stone-200/60"
                  >
                    1. Độ dài nơi tôn nghiêm
                  </button>
                  <button
                    onClick={() => loadScenario('GUARD_YEM_STANDALONE')}
                    className="px-2.5 py-1 bg-stone-100 hover:bg-red-50 hover:text-red-700 text-stone-700 rounded-lg text-xs font-sans transition-all border border-stone-200/60"
                  >
                    2. Yếm cần áo khoác
                  </button>
                  <button
                    onClick={() => loadScenario('GUARD_FORMAL_DECONSTRUCTION')}
                    className="px-2.5 py-1 bg-stone-100 hover:bg-red-50 hover:text-red-700 text-stone-700 rounded-lg text-xs font-sans transition-all border border-stone-200/60"
                  >
                    3. Lễ phục trang nghiêm
                  </button>
                  <button
                    onClick={() => loadScenario('GUARD_GL_LAPEL')}
                    className="px-2.5 py-1 bg-stone-100 hover:bg-red-50 hover:text-red-700 text-stone-700 rounded-lg text-xs font-sans transition-all border border-stone-200/60"
                  >
                    4. Chiều cài vạt Giao Lĩnh
                  </button>
                  <button
                    onClick={() => loadScenario('SILHOUETTE_AODAI_POOF')}
                    className="px-2.5 py-1 bg-stone-100 hover:bg-red-50 hover:text-red-700 text-stone-700 rounded-lg text-xs font-sans transition-all border border-stone-200/60"
                  >
                    5. Phom dáng áo dài
                  </button>
                  <button
                    onClick={() => loadScenario('VALID_DEFAULT')}
                    className="px-2.5 py-1 bg-red-700 text-white rounded-lg text-xs font-sans transition-all shadow-sm font-semibold"
                  >
                    ✓ Phối đồ chuẩn
                  </button>
                </div>
              </div>
            </div>

            {/* Bố cục không gian phối đồ */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              {/* Cột trái: Bộ điều khiển chọn trang phục (7 cột) */}
              <div className="lg:col-span-7 space-y-6">
                {/* Thanh chọn kiểu dáng Nam/Nữ trên cùng */}
                <div className="bg-white rounded-2xl p-4 sm:p-5 border border-stone-200/80 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <span className="text-xs font-sans uppercase tracking-wider text-red-700 font-bold block">
                      Kiểu Dáng Giới Tính
                    </span>
                    <p className="text-xs text-stone-500 mt-0.5">
                      Chuyển đổi linh hoạt giữa ảnh Nam và Nữ. Đồ không phân biệt giới tính sẽ giữ nguyên ảnh gốc.
                    </p>
                  </div>
                  <GenderToggle
                    selectedGender={selectedGender}
                    onChangeGender={setSelectedGender}
                  />
                </div>

                {/* Bước 1: Chọn Cổ Phục */}
                <div className="bg-white rounded-2xl p-6 border border-stone-200/80 shadow-sm space-y-4">
                  <div className="flex items-center justify-between border-b border-stone-100 pb-3">
                    <span className="text-xs font-sans uppercase text-red-700 font-semibold flex items-center gap-1.5">
                      <Shirt className="w-4 h-4" /> 1. Chọn Cổ Phục Trọng Tâm
                    </span>
                    <span className="text-xs text-gray-500 font-sans">
                      Đang chọn: <strong className="text-gray-900">{activeLabGarment.name} ({activeLabGarment.id})</strong>
                    </span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {GARMENTS.map((g) => {
                      const isSelected = g.id === labGarmentId;
                      const gImageUrl = resolveImageUrl(g.image_url, g.has_gender_variants, selectedGender);
                      return (
                        <div
                          key={g.id}
                          onClick={() => setLabGarmentId(g.id)}
                          className={`cursor-pointer rounded-xl p-2.5 border transition-all text-left flex flex-col justify-between gap-2 ${
                            isSelected
                              ? 'bg-red-50/50 border-red-700 shadow-sm ring-1 ring-red-700'
                              : 'bg-stone-50/50 border-stone-200/70 hover:border-stone-300'
                          }`}
                        >
                          <div className="aspect-[3/4] rounded-lg overflow-hidden relative bg-stone-100">
                            <SafeImage
                              src={gImageUrl}
                              alt={g.name}
                              fallbackText={`${g.name} (${selectedGender === 'Male' ? 'Nam' : 'Nữ'})`}
                              expectedPath={gImageUrl}
                              className="w-full h-full"
                            />
                            {isSelected && (
                              <div className="absolute top-1.5 right-1.5 bg-red-700 rounded-full p-0.5 text-white shadow">
                                <Check className="w-3 h-3" />
                              </div>
                            )}
                            {g.has_gender_variants && (
                              <span className="absolute bottom-1.5 left-1.5 bg-white/90 text-red-700 text-[8px] font-sans px-1.5 py-0.2 rounded font-semibold">
                                {selectedGender === 'Male' ? 'Nam' : 'Nữ'}
                              </span>
                            )}
                          </div>
                          <div>
                            <span className="text-[10px] text-red-700 font-mono font-semibold block">{g.id}</span>
                            <h4 className="text-xs font-bold text-gray-900 line-clamp-1">{g.name}</h4>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Bước 2: Chọn Phần Dưới (Quần / Váy) */}
                <div className="bg-white rounded-2xl p-6 border border-stone-200/80 shadow-sm space-y-4">
                  <div className="flex items-center justify-between border-b border-stone-100 pb-3">
                    <span className="text-xs font-sans uppercase text-gray-700 font-semibold flex items-center gap-1.5">
                      <Layers className="w-4 h-4 text-red-700" /> 2. Trang Phục Nửa Dưới (Quần / Váy)
                    </span>
                    <span className="text-xs text-gray-500 font-sans">
                      Đang chọn: <strong className="text-gray-900">{activeLabBottom.name} ({activeLabBottom.id})</strong>
                    </span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 max-h-80 overflow-y-auto pr-1">
                    {CASUAL_ITEMS.filter((c) => c.category === 'Bottom' || c.category === 'bottoms').map((c) => {
                      const isSelected = c.id === labBottomId;
                      const cThumbnailUrl = resolveImageUrl(c.thumbnail_url, c.has_gender_variants, selectedGender);
                      return (
                        <div
                          key={c.id}
                          onClick={() => setLabBottomId(c.id)}
                          className={`cursor-pointer rounded-xl p-2.5 border transition-all text-left flex flex-col justify-between gap-2 ${
                            isSelected
                              ? 'bg-red-50/50 border-red-700 shadow-sm ring-1 ring-red-700'
                              : 'bg-stone-50/50 border-stone-200/70 hover:border-stone-300'
                          }`}
                        >
                          <div className="aspect-[3/4] rounded-lg overflow-hidden relative bg-stone-100">
                            <SafeImage
                              src={cThumbnailUrl}
                              alt={c.name}
                              fallbackText={`${c.name} (${selectedGender === 'Male' ? 'Nam' : 'Nữ'})`}
                              expectedPath={cThumbnailUrl}
                              className="w-full h-full"
                            />
                            {isSelected && (
                              <div className="absolute top-1 right-1 bg-red-700 rounded-full p-0.5 text-white shadow">
                                <Check className="w-3 h-3" />
                              </div>
                            )}
                            {c.has_gender_variants && (
                              <span className="absolute bottom-1.5 left-1.5 bg-white/90 text-red-700 text-[8px] font-sans px-1.5 py-0.2 rounded font-semibold">
                                {selectedGender === 'Male' ? 'Nam' : 'Nữ'}
                              </span>
                            )}
                          </div>
                          <div>
                            <span className="text-[9px] text-gray-500 font-mono block">{c.id}</span>
                            <h4 className="text-xs font-medium text-gray-900 line-clamp-1">{c.name}</h4>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Bước 3: Bối Cảnh & Chi Tiết Lễ Nghi */}
                <div className="bg-white rounded-2xl p-6 border border-stone-200/80 shadow-sm space-y-5">
                  <div className="flex items-center justify-between border-b border-stone-100 pb-3">
                    <span className="text-xs font-sans uppercase text-gray-700 font-semibold flex items-center gap-1.5">
                      <Compass className="w-4 h-4 text-red-700" /> 3. Bối Cảnh Không Gian & Chi Tiết Lễ Nghi
                    </span>
                  </div>

                  {/* Lựa chọn bối cảnh */}
                  <div className="space-y-2">
                    <label className="text-xs text-gray-500 font-medium block">
                      Bối cảnh xuất hiện:
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      {CONTEXTS.map((ctx) => {
                        const isSelected = ctx.id === labContextId;
                        return (
                          <div
                            key={ctx.id}
                            onClick={() => setLabContextId(ctx.id)}
                            className={`cursor-pointer p-3 rounded-xl border text-xs transition-all ${
                              isSelected
                                ? ctx.is_sacred
                                  ? 'bg-amber-50 border-amber-600 text-amber-900 ring-1 ring-amber-600'
                                  : 'bg-red-50 border-red-700 text-red-900 ring-1 ring-red-700'
                                : 'bg-stone-50/50 border-stone-200/70 text-gray-600 hover:border-stone-300'
                            }`}
                          >
                            <div className="flex items-center justify-between mb-1">
                              <span className="font-mono font-bold text-[10px]">{ctx.id}</span>
                              {ctx.is_sacred && (
                                <span className="text-[9px] uppercase px-1.5 py-0.2 rounded bg-amber-100 text-amber-800 font-semibold">
                                  Tôn nghiêm
                                </span>
                              )}
                            </div>
                            <h5 className="font-semibold text-gray-900 text-xs">{ctx.name}</h5>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Nút cài vạt áo & Áo khoác ngoài */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-stone-100">
                    <div className="space-y-2">
                      <label className="text-xs text-gray-600 font-medium flex items-center justify-between">
                        <span>Hướng cài vạt áo:</span>
                        <span className="text-[10px] text-red-700 font-sans">Quan trọng cho Áo Giao Lĩnh</span>
                      </label>
                      <div className="grid grid-cols-2 gap-2">
                        <button
                          type="button"
                          onClick={() => setLabLapelFold('right_over_left')}
                          className={`p-2.5 rounded-lg text-xs font-sans border transition-all text-center ${
                            labLapelFold === 'right_over_left'
                              ? 'bg-stone-900 text-white font-semibold border-stone-900 shadow-sm'
                              : 'bg-stone-50 border-stone-200 text-gray-600 hover:bg-stone-100'
                          }`}
                        >
                          Phải đè Trái
                          <span className="block text-[10px] font-sans text-stone-300 mt-0.5">
                            (Chuẩn mực)
                          </span>
                        </button>
                        <button
                          type="button"
                          onClick={() => setLabLapelFold('left_over_right')}
                          className={`p-2.5 rounded-lg text-xs font-sans border transition-all text-center ${
                            labLapelFold === 'left_over_right'
                              ? 'bg-red-700 text-white font-semibold border-red-700 shadow-sm'
                              : 'bg-stone-50 border-stone-200 text-gray-600 hover:bg-stone-100'
                          }`}
                        >
                          Trái đè Phải
                          <span className="block text-[10px] font-sans text-red-200 mt-0.5">
                            (Sai quy chuẩn ⚠️)
                          </span>
                        </button>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-xs text-gray-600 font-medium flex items-center justify-between">
                        <span>Lớp áo khoác ngoài:</span>
                        <span className="text-[10px] text-red-700 font-sans">Quan trọng cho Áo Yếm</span>
                      </label>
                      <button
                        type="button"
                        onClick={() => setLabHasOuterLayer(!labHasOuterLayer)}
                        className={`w-full p-2.5 rounded-lg text-xs border transition-all flex items-center justify-center gap-2 font-medium ${
                          labHasOuterLayer
                            ? 'bg-stone-900 text-white border-stone-900 shadow-sm'
                            : 'bg-stone-50 border-stone-200 text-gray-600 hover:bg-stone-100'
                        }`}
                      >
                        {labHasOuterLayer ? (
                          <>
                            <Check className="w-4 h-4 text-emerald-400" />
                            Đã có áo khoác ngoài
                          </>
                        ) : (
                          <>
                            <Ban className="w-4 h-4 text-red-600" />
                            Chưa có áo khoác ngoài
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Cột phải: Bảng kết quả kiểm định văn hóa (5 cột) */}
              <div className="lg:col-span-5 space-y-6 lg:sticky lg:top-20">
                {/* Thẻ kết quả */}
                <div
                  className={`bg-white rounded-3xl p-6 sm:p-7 border transition-all duration-300 shadow-sm ${
                    hasBlockViolation
                      ? 'border-red-300 ring-2 ring-red-700/20'
                      : 'border-stone-200/90'
                  }`}
                >
                  <div className="flex items-center justify-between pb-4 border-b border-stone-100">
                    <div className="flex items-center gap-3">
                      {hasBlockViolation ? (
                        <div className="w-10 h-10 rounded-xl bg-red-100 text-red-700 flex items-center justify-center">
                          <ShieldAlert className="w-5 h-5" />
                        </div>
                      ) : (
                        <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center">
                          <ShieldCheck className="w-5 h-5" />
                        </div>
                      )}
                      <div>
                        <h3 className="font-bold text-gray-900 text-base font-['Playfair_Display',serif]">
                          Kết Quả Kiểm Định Văn Hóa
                        </h3>
                        <p className="text-[11px] font-sans text-gray-400">
                          Kiểm tra tự động • Giới tính: <strong className="text-red-700 font-semibold">{selectedGender === 'Male' ? 'Nam' : 'Nữ'}</strong>
                        </p>
                      </div>
                    </div>

                    <span
                      className={`text-xs font-sans uppercase px-3 py-1 rounded-full font-bold border ${
                        hasBlockViolation
                          ? 'bg-red-50 text-red-700 border-red-200'
                          : 'bg-emerald-50 text-emerald-800 border-emerald-200'
                      }`}
                    >
                      {hasBlockViolation ? 'VI PHẠM QUY CHUẨN' : 'CHUẨN MỰC HỢP LỆ'}
                    </span>
                  </div>

                  {/* Danh sách thông báo */}
                  <div className="mt-5 space-y-3">
                    {validationResults.map((res, idx) => (
                      <div
                        key={idx}
                        className={`p-4 rounded-2xl border text-xs space-y-1.5 leading-relaxed ${
                          res.severity === 'BLOCK'
                            ? 'bg-red-50/70 border-red-200 text-red-900'
                            : 'bg-stone-50 border-stone-200 text-gray-800'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-sans text-[10px] font-bold uppercase tracking-wider flex items-center gap-1.5">
                            {res.severity === 'BLOCK' ? (
                              <>
                                <AlertTriangle className="w-3.5 h-3.5 text-red-700" />
                                {res.ruleId ? `QUY TẮC: ${res.ruleId}` : 'VI PHẠM NGUYÊN TẮC'}
                              </>
                            ) : (
                              <>
                                <Check className="w-3.5 h-3.5 text-emerald-700" />
                                THỎA MÃN QUY CHUẨN
                              </>
                            )}
                          </span>
                          <span
                            className={`font-sans text-[9px] px-2 py-0.5 rounded font-semibold ${
                              res.severity === 'BLOCK'
                                ? 'bg-red-100 text-red-800'
                                : 'bg-emerald-100 text-emerald-800'
                            }`}
                          >
                            {res.severity === 'BLOCK' ? 'Mức độ: Chặn nghiêm ngặt' : 'Mức độ: Đạt chuẩn'}
                          </span>
                        </div>
                        <p className="font-medium text-sm leading-snug">{res.message}</p>
                      </div>
                    ))}
                  </div>

                  {/* Thông số bộ phối hiện thời */}
                  <div className="mt-6 pt-5 border-t border-stone-100 space-y-3">
                    <span className="text-[10px] font-sans text-gray-400 uppercase tracking-wider block">
                      Thông số bộ phối hiện thời:
                    </span>
                    <div className="grid grid-cols-2 gap-2 text-xs font-sans">
                      <div className="bg-stone-50 p-2.5 rounded-xl border border-stone-200/60">
                        <span className="text-gray-400 text-[10px] block">Mã cổ phục:</span>
                        <span className="text-red-700 font-bold">{labGarmentId}</span>
                      </div>
                      <div className="bg-stone-50 p-2.5 rounded-xl border border-stone-200/60">
                        <span className="text-gray-400 text-[10px] block">Mã đồ dưới:</span>
                        <span className="text-gray-800 font-bold">{labBottomId}</span>
                      </div>
                      <div className="bg-stone-50 p-2.5 rounded-xl border border-stone-200/60">
                        <span className="text-gray-400 text-[10px] block">Bối cảnh:</span>
                        <span className="text-gray-800 font-bold">{labContextId}</span>
                      </div>
                      <div className="bg-stone-50 p-2.5 rounded-xl border border-stone-200/60">
                        <span className="text-gray-400 text-[10px] block">Giới tính:</span>
                        <span className="text-amber-700 font-bold">{selectedGender === 'Male' ? 'Nam' : 'Nữ'}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Tài liệu 5 quy chuẩn cứng */}
                <div className="bg-white rounded-3xl p-6 border border-stone-200/80 shadow-sm space-y-3 text-xs text-gray-500">
                  <h4 className="font-bold text-gray-900 flex items-center gap-2 font-['Playfair_Display',serif]">
                    <Info className="w-4 h-4 text-red-700" />
                    Nguyên Tắc 5 Quy Chuẩn Cứng
                  </h4>
                  <div className="space-y-2 text-[11px] leading-relaxed">
                    <div className="p-2.5 rounded-xl bg-stone-50 border border-stone-100">
                      <strong className="text-red-700 block mb-0.5">1. ĐỘ DÀI NƠI TÔN NGHIÊM (GUARD_SACRED_LENGTH):</strong>
                      Chốn linh thiêng (C05) cấm diện trang phục ngắn trên đầu gối (cs_05, cs_06, cs_21).
                    </div>
                    <div className="p-2.5 rounded-xl bg-stone-50 border border-stone-100">
                      <strong className="text-red-700 block mb-0.5">2. ÁO YẾM RA NƠI CÔNG CỘNG (GUARD_YEM_STANDALONE):</strong>
                      Áo yếm (V03) mang bản chất là nội y truyền thống, bắt buộc phải có lớp khoác ngoài khi ra nơi công cộng.
                    </div>
                    <div className="p-2.5 rounded-xl bg-stone-50 border border-stone-100">
                      <strong className="text-red-700 block mb-0.5">3. TÍNH NGHIÊM CẨN CỦA ĐẠI LỄ PHỤC (GUARD_FORMAL_DECONSTRUCTION):</strong>
                      Lễ phục đại lễ (V06, V07, V09) chỉ được phép phối cùng quần âu hoặc quần lụa nghiêm cẩn.
                    </div>
                    <div className="p-2.5 rounded-xl bg-stone-50 border border-stone-100">
                      <strong className="text-red-700 block mb-0.5">4. CHIỀU CÀI VẠT ÁO GIAO LĨNH (GUARD_GL_LAPEL):</strong>
                      Áo Giao Lĩnh (V08) bắt buộc vạt Trái đè lên vạt Phải theo phong tục cổ của người sống.
                    </div>
                    <div className="p-2.5 rounded-xl bg-stone-50 border border-stone-100">
                      <strong className="text-red-700 block mb-0.5">5. PHOM DÁNG TÀ ÁO DÀI (SILHOUETTE_AODAI_POOF):</strong>
                      Áo dài (V01) không mặc cùng chân váy xòe bồng hoặc bút chì bó cứng để tránh làm gãy nếp tà áo.
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 4. TAB BỘ SƯU TẬP (LOOKBOOK) */}
        {activeTab === 'lookbook' && (
          <div className="space-y-8">
            <div className="border-b border-stone-200/80 pb-6">
              <span className="text-xs uppercase font-mono tracking-widest text-red-700 font-semibold">
                Ấn bản bộ sưu tập thời trang
              </span>
              <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 font-['Playfair_Display',serif] mt-1">
                Bản Phối Việt Phục Remix
              </h2>
              <p className="text-xs sm:text-sm text-gray-500 mt-1 max-w-xl">
                Những công thức phối đồ mẫu đã được kiểm định thỏa mãn tiêu chuẩn văn hóa và phom dáng đương đại.
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {OUTFIT_COMBINATIONS.map((outfit) => {
                return (
                  <div
                    key={outfit.id}
                    className="bg-white rounded-3xl overflow-hidden border border-stone-200/80 shadow-sm flex flex-col group hover:shadow-md transition-all duration-300"
                  >
                    <div className="aspect-[4/3] sm:aspect-[16/10] w-full overflow-hidden bg-stone-100 relative">
                      <SafeImage
                        src={outfit.image_mockup}
                        alt={outfit.name}
                        fallbackText={outfit.name}
                        expectedPath={outfit.image_mockup}
                        className="w-full h-full"
                      />
                      <div className="absolute top-4 left-4 bg-white/95 backdrop-blur-sm text-stone-900 text-xs font-mono font-bold px-3 py-1 rounded-full shadow-xs">
                        {outfit.id}
                      </div>
                    </div>

                    <div className="p-6 sm:p-8 flex-1 flex flex-col justify-between space-y-5">
                      <div className="space-y-3">
                        <span className="text-xs font-sans text-red-700 font-semibold tracking-wider uppercase block">
                          Bản phối tiêu biểu
                        </span>
                        <h3 className="text-2xl font-bold text-gray-900 font-['Playfair_Display',serif] leading-tight">
                          {outfit.name}
                        </h3>
                        <p className="text-xs sm:text-sm text-gray-600 italic">
                          "{outfit.concept_tagline}"
                        </p>
                        <p className="text-xs sm:text-sm text-gray-600 leading-relaxed bg-stone-50 p-4 rounded-xl border border-stone-200/60">
                          {outfit.style_notes}
                        </p>

                        <div className="pt-2 flex flex-wrap gap-2">
                          {outfit.tags.map((tag, idx) => (
                            <span
                              key={idx}
                              className="text-[11px] font-sans text-stone-600 bg-stone-100 px-2.5 py-1 rounded-md"
                            >
                              #{tag}
                            </span>
                          ))}
                        </div>
                      </div>

                      <div className="pt-4 border-t border-stone-100 flex items-center justify-between">
                        <span className="text-xs text-gray-400 font-sans">
                          {outfit.occasion}
                        </span>
                        <button
                          onClick={() => {
                            setLabGarmentId(outfit.garment_id);
                            if (outfit.casual_item_ids[0]) setLabBottomId(outfit.casual_item_ids[0]);
                            setActiveTab('studio');
                          }}
                          className="px-4 py-2 rounded-xl bg-red-700 hover:bg-red-800 text-white text-xs font-semibold shadow-sm transition-all flex items-center gap-1.5"
                        >
                          <SlidersHorizontal className="w-3.5 h-3.5" />
                          <span>Mở trong phòng phối đồ</span>
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </main>

      {/* 5. CÁC HỘP THOẠI CHI TIẾT */}
      {selectedGarment && (
        <GarmentDetailModal
          garment={selectedGarment}
          onClose={() => setSelectedGarment(null)}
          onSelectForStudio={handleSelectForStudio}
          selectedGender={selectedGender}
        />
      )}

      {selectedCasual && (
        <CasualDetailModal
          item={selectedCasual}
          onClose={() => setSelectedCasual(null)}
          onSelectForStudio={handleSelectForStudio}
          selectedGender={selectedGender}
        />
      )}

      {/* 6. THANH ĐIỀU HƯỚNG DƯỚI CÙNG (MOBILE-FIRST) */}
      <BottomNavbar
        activeTab={activeTab}
        onSelectTab={setActiveTab}
      />
    </div>
  );
}
