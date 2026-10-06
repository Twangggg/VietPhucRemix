import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
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
  Tag,
  Crown,
  X,
  ArrowLeft,
  Search,
  Footprints,
  FolderTree
} from 'lucide-react';
import { GARMENTS, CASUAL_ITEMS, CONTEXTS, OUTFIT_COMBINATIONS, ACCESSORIES } from './data';
import { Garment, CasualItem, LapelFold, Gender, AccessoryItem, OutfitCombination } from './types';
import { validateOutfit } from './utils/validationEngine';
import { getSafeImageUrl, resolveImageUrl, resolveItemByGender, filterByGender } from './utils/helpers';
import { BottomNavbar, NavTab } from './components/BottomNavbar';
import { TopHeader } from './components/TopHeader';
import { GarmentCard } from './components/GarmentCard';
import { CasualItemCard } from './components/CasualItemCard';
import { GarmentDetailModal } from './components/GarmentDetailModal';
import { CasualDetailModal } from './components/CasualDetailModal';
import { AccessoryDetailModal } from './components/AccessoryDetailModal';
import { GenderToggle } from './components/GenderToggle';
import { SafeImage } from './components/SafeImage';
import { Studio } from './pages/Studio';
import { LookbookTab } from './components/LookbookTab';

export type CategoryFilterKey =
  | 'all'
  | 'outer_traditional'
  | 'outer_formal'
  | 'top'
  | 'inner'
  | 'bottom_pants'
  | 'bottom_skirt'
  | 'traditional_footwear'
  | 'shoes'
  | 'headwear'
  | 'jewelry';

export interface CategoryDefinition {
  id: CategoryFilterKey;
  label: string;
}

export const CATEGORY_DEFINITIONS: CategoryDefinition[] = [
  { id: 'all', label: 'Tất cả' },
  { id: 'outer_traditional', label: 'Khoác ngoài' },
  { id: 'outer_formal', label: 'Lễ phục' },
  { id: 'top', label: 'Áo dài' },
  { id: 'inner', label: 'Áo trong & Yếm' },
  { id: 'bottom_pants', label: 'Quần' },
  { id: 'bottom_skirt', label: 'Chân váy' },
  { id: 'traditional_footwear', label: 'Giày truyền thống' },
  { id: 'shoes', label: 'Giày hiện đại' },
  { id: 'headwear', label: 'Mũ nón' },
  { id: 'jewelry', label: 'Trang sức' }
];

export default function App() {
  const location = useLocation();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState<NavTab>('home');
  const [exploreFilter, setExploreFilter] = useState<CategoryFilterKey>('all');
  const [exploreSearch, setExploreSearch] = useState<string>('');
  const [selectedGender, setSelectedGender] = useState<Gender>('Female');

  // Đồng bộ giữa URL path và activeTab
  useEffect(() => {
    if (location.pathname === '/studio') {
      setActiveTab('studio');
    } else if (location.pathname === '/explore') {
      setActiveTab('explore');
    } else if (location.pathname === '/' || location.pathname === '') {
      setActiveTab('home');
    }
  }, [location.pathname]);

  const handleTabChange = (tab: NavTab) => {
    setActiveTab(tab);
    if (tab === 'studio') {
      navigate('/studio');
    } else if (tab === 'explore') {
      navigate('/explore');
    } else {
      navigate('/');
    }
  };

  // Modals
  const [selectedGarment, setSelectedGarment] = useState<Garment | null>(null);
  const [selectedCasual, setSelectedCasual] = useState<CasualItem | null>(null);
  const [inspectingAccessory, setInspectingAccessory] = useState<AccessoryItem | null>(null);

  // Studio Remix State
  const [labGarmentId, setLabGarmentId] = useState<string>(GARMENTS[0].id);
  const [labBottomId, setLabBottomId] = useState<string>('cs_01');
  const [labContextId, setLabContextId] = useState<string>('C01');
  const [labLapelFold, setLabLapelFold] = useState<LapelFold>('right_over_left');
  const [labHasOuterLayer, setLabHasOuterLayer] = useState<boolean>(false);

  // EPIC 05: Phụ kiện (Mũ nón & Trang sức)
  const [selectedHeadwear, setSelectedHeadwear] = useState<AccessoryItem | null>(null);
  const [selectedJewelries, setSelectedJewelries] = useState<AccessoryItem[]>([]);

  // Xử lý chuyển đổi giới tính và tự động cập nhật item đang chọn nếu item cũ không tương thích
  const handleGenderChange = (newGender: Gender) => {
    setSelectedGender(newGender);

    // 1. Kiểm tra Cổ phục đang chọn
    const validGarments = filterByGender(GARMENTS, newGender);
    if (!validGarments.some((g) => g.id === labGarmentId) && validGarments.length > 0) {
      setLabGarmentId(validGarments[0].id);
    }

    // 2. Kiểm tra Đồ nửa dưới đang chọn
    const validBottoms = filterByGender(
      CASUAL_ITEMS.filter((c) => {
        const cat = (c.category || c.type || '').toLowerCase();
        return cat.includes('bottom');
      }),
      newGender
    );
    if (!validBottoms.some((b) => b.id === labBottomId) && validBottoms.length > 0) {
      setLabBottomId(validBottoms[0].id);
    }

    // 3. Kiểm tra Mũ nón đang chọn
    if (selectedHeadwear) {
      const headwearGender = selectedHeadwear.gender?.toLowerCase() || 'unisex';
      if (headwearGender !== 'unisex' && headwearGender !== newGender.toLowerCase()) {
        setSelectedHeadwear(null);
      }
    }

    // 4. Lọc lại Trang sức đang chọn
    setSelectedJewelries((prev) =>
      filterByGender(prev, newGender)
    );
  };

  const activeLabGarment = GARMENTS.find((g) => g.id === labGarmentId) || GARMENTS[0];
  const activeLabBottom = CASUAL_ITEMS.find((c) => c.id === labBottomId) || CASUAL_ITEMS[0];
  const activeLabContext = CONTEXTS.find((ctx) => ctx.id === labContextId) || CONTEXTS[0];

  // Deterministic Cultural Validation Engine (Zero AI latency)
  // Truyền đầy đủ các slot, phụ kiện và giới tính vào validateOutfit
  const validationResults = validateOutfit({
    costumeId: labGarmentId,
    innerId: null,
    bottomId: labBottomId,
    contextId: labContextId,
    lapelFold: labLapelFold,
    outerLayer: labHasOuterLayer ? 'outer_layer_present' : null,
    headwearId: selectedHeadwear ? selectedHeadwear.id : null,
    shoesId: null,
    jewelryIds: selectedJewelries.map((j) => j.id),
    gender: selectedGender
  });

  const hasBlockViolation = validationResults.some((r) => r.severity === 'BLOCK');

  // Xử lý chọn / bỏ chọn Mũ nón (1 món)
  const handleToggleHeadwear = (item: AccessoryItem) => {
    if (selectedHeadwear?.id === item.id) {
      setSelectedHeadwear(null);
    } else {
      setSelectedHeadwear(item);
    }
  };

  // Xử lý chọn / bỏ chọn Trang sức (nhiều món)
  const handleToggleJewelry = (item: AccessoryItem) => {
    setSelectedJewelries((prev) => {
      const exists = prev.some((j) => j.id === item.id);
      if (exists) {
        return prev.filter((j) => j.id !== item.id);
      } else {
        return [...prev, item];
      }
    });
  };

  // Quick Preset Test Scenarios for the 5 Rules
  const loadScenario = (ruleName: string) => {
    switch (ruleName) {
      case 'GUARD_SACRED_LENGTH':
        setLabGarmentId('V01');
        setLabBottomId('cs_05'); // Short mini skirt
        setLabContextId('C05'); // Chốn linh thiêng
        setLabHasOuterLayer(false);
        setLabLapelFold('right_over_left');
        setSelectedHeadwear(null);
        setSelectedJewelries([]);
        break;
      case 'GUARD_YEM_STANDALONE':
        setLabGarmentId('V03'); // Yếm
        setLabBottomId('cs_01');
        setLabContextId('C01');
        setLabHasOuterLayer(false); // Standalone (không khoác)
        setSelectedHeadwear(null);
        setSelectedJewelries([]);
        break;
      case 'GUARD_FORMAL_DECONSTRUCTION':
        setLabGarmentId('V06'); // Lễ phục Mãng bào
        setLabBottomId('cs_01'); // Jeans (vi phạm)
        setLabContextId('C01');
        setLabHasOuterLayer(false);
        setSelectedHeadwear(null);
        setSelectedJewelries([]);
        break;
      case 'GUARD_GL_LAPEL':
        setLabGarmentId('V08'); // Áo Giao Lĩnh
        setLabBottomId('cs_03');
        setLabContextId('C01');
        setLabLapelFold('left_over_right'); // Sai quy chuẩn vạt
        setSelectedHeadwear(null);
        setSelectedJewelries([]);
        break;
      case 'GUARD_REGIONAL_HEADWEAR':
        // Rule 5: Khăn rằn Nam Bộ (h02) phối cùng Lễ phục Áo Tấc (V06) -> BLOCK
        setLabGarmentId('V06'); // Áo Tấc lễ phục
        setLabBottomId('cs_03');
        setLabContextId('C01');
        setLabLapelFold('right_over_left');
        setLabHasOuterLayer(false);
        setSelectedHeadwear(
          ACCESSORIES.find((a) => a.id === 'h02') || {
            id: 'h02',
            name: 'Khăn rằn Nam Bộ',
            type: 'headwear',
            gender: 'unisex',
            origin: 'Miền Tây Nam Bộ',
            characteristics: 'Khăn kẻ ô vuông carô truyền thống Nam Bộ'
          }
        );
        setSelectedJewelries([]);
        break;
      case 'SILHOUETTE_AODAI_POOF':
        setLabGarmentId('V01'); // Áo dài
        setLabBottomId('cs_08'); // Chân váy xòe bồng công chúa
        setLabContextId('C01');
        setSelectedHeadwear(null);
        setSelectedJewelries([]);
        break;
      case 'VALID_DEFAULT':
        setLabGarmentId('V01');
        setLabBottomId('cs_01');
        setLabContextId('C01');
        setLabLapelFold('right_over_left');
        setLabHasOuterLayer(false);
        setSelectedHeadwear(null);
        setSelectedJewelries([]);
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
        onOpenStudio={() => handleTabChange('studio')}
        activeTabTitle={getTabTitle()}
      />

      {/* Vùng nội dung chính: pb-20 giúp cuộn trang gọn gàng */}
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 pb-20 sm:pb-24">
        {/* 1. TAB TRANG CHỦ */}
        {activeTab === 'home' && (
          <div className="space-y-8 sm:space-y-12">
            {/* Phần mở đầu (Hero Section) */}
            <section className="text-center max-w-2xl mx-auto space-y-3 pt-1 sm:pt-2">
              <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-gray-900 font-sans leading-[1.15]">
                Xuyên Không Gian, <br className="hidden sm:inline" />
                <span className="text-red-700">Chạm Di Sản</span>
              </h1>
              <p className="text-sm sm:text-base text-gray-600 font-normal leading-relaxed max-w-xl mx-auto">
                Trải nghiệm phối đồ Cổ phục Việt Nam với hơi thở thời trang đương đại.
              </p>

              <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
                <Link
                  to="/studio"
                  onClick={() => handleTabChange('studio')}
                  className="px-6 py-3 rounded-xl bg-red-700 hover:bg-red-800 text-white text-sm font-semibold transition-all shadow-md hover:shadow-lg hover:-translate-y-0.5 flex items-center gap-2"
                >
                  <SlidersHorizontal className="w-4 h-4 text-white" />
                  <span>Bắt đầu phối đồ</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
                <Link
                  to="/explore"
                  onClick={() => handleTabChange('explore')}
                  className="px-5 py-3 rounded-xl bg-white hover:bg-stone-50 text-gray-800 text-sm font-medium border border-stone-200/80 transition-all shadow-xs hover:shadow-sm flex items-center gap-2"
                >
                  <Compass className="w-4 h-4 text-red-700" />
                  <span>Khám phá cổ phục ({GARMENTS.length})</span>
                </Link>
              </div>
            </section>

            {/* Cổ phục tiêu biểu */}
            <section className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-end justify-between border-b border-stone-200/80 pb-3 gap-2">
                <div>
                  <span className="text-xs uppercase font-mono tracking-widest text-gray-400 font-semibold">
                    Tuyển chọn tiêu biểu
                  </span>
                  <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight mt-1">
                    Cổ Phục Biểu Tượng
                  </h2>
                </div>
                <div className="flex items-center gap-3">
                  <GenderToggle
                    selectedGender={selectedGender}
                    onChangeGender={handleGenderChange}
                    size="sm"
                  />
                  <button
                    onClick={() => setActiveTab('explore')}
                    className="text-xs font-semibold text-red-700 hover:text-red-800 flex items-center gap-1 group"
                  >
                    Xem tất cả ({filterByGender(GARMENTS, selectedGender).length})
                    <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                  </button>
                </div>
              </div>

              {/* Lưới hiển thị 4 cột đã lọc theo giới tính */}
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 sm:gap-8">
                {filterByGender(GARMENTS, selectedGender).slice(0, 4).map((garment) => (
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
              <blockquote className="text-lg sm:text-xl font-medium text-gray-800 leading-relaxed">
                "Sáng tạo có trách nhiệm — Giữ vẹn nguyên tính tôn nghiêm & tinh thần dân tộc trong từng đường nét cách tân."
              </blockquote>
              <p className="text-xs text-gray-500 font-mono tracking-widest uppercase">
                Bộ quy chuẩn ứng xử thời trang di sản Đại Việt
              </p>
            </section>
          </div>
        )}

        {/* 2. TAB KHÁM PHÁ (EXPLORE) */}
        {activeTab === 'explore' && (() => {
          // Lọc danh sách món đồ theo giới tính đang chọn
          const filteredGarments = filterByGender(GARMENTS, selectedGender);
          const filteredCasual = filterByGender(CASUAL_ITEMS, selectedGender);
          const filteredAccessories = filterByGender(ACCESSORIES, selectedGender);

          // Hàm lấy category ID chuẩn từ item
          const getItemCategoryId = (item: any): CategoryFilterKey => {
            const rawCat = item.category || item.type;
            if (rawCat === 'outer_traditional') return 'outer_traditional';
            if (rawCat === 'outer_formal') return 'outer_formal';
            if (rawCat === 'top') return 'top';
            if (rawCat === 'inner') return 'inner';
            if (rawCat === 'bottom_pants') return 'bottom_pants';
            if (rawCat === 'bottom_skirt') return 'bottom_skirt';
            if (rawCat === 'traditional_footwear') return 'traditional_footwear';
            if (rawCat === 'shoes') return 'shoes';
            if (rawCat === 'headwear') return 'headwear';
            if (rawCat === 'jewelry') return 'jewelry';
            return 'inner';
          };

          // Tìm kiếm theo từ khóa
          const matchesSearch = (item: any): boolean => {
            if (!exploreSearch.trim()) return true;
            const q = exploreSearch.toLowerCase();
            return (
              (item.name && item.name.toLowerCase().includes(q)) ||
              (item.id && item.id.toLowerCase().includes(q)) ||
              (item.origin && item.origin.toLowerCase().includes(q)) ||
              (item.category && item.category.toLowerCase().includes(q)) ||
              (item.description && item.description.toLowerCase().includes(q))
            );
          };

          // Lọc danh sách theo Category đang chọn & Search
          const visibleCategories = CATEGORY_DEFINITIONS.filter(cat => {
            if (cat.id === 'all') return false;
            if (exploreFilter !== 'all' && exploreFilter !== cat.id) return false;
            return true;
          });

          return (
            <div className="space-y-6 sm:space-y-8">
              {/* STICKY HEADER: GỘP SEARCH + GENDER TOGGLE VÀ TAB CUỘN NGANG (MINIMALIST E-COMMERCE) */}
              <div className="sticky top-12 sm:top-14 z-30 bg-[#F9F8F6] pt-3 pb-0 border-b border-stone-200 -mx-4 sm:-mx-6 lg:-mx-8 px-4 sm:px-6 lg:px-8 space-y-3 shadow-2xs">
                {/* Hàng 1: Search Bar Tàng Hình & Gender Toggle Tinh Gọn */}
                <div className="flex items-center justify-between gap-4">
                  {/* Search Bar tối giản chỉ có border-b */}
                  <div className="relative flex-1 max-w-xs sm:max-w-sm flex items-center border-b border-stone-300 focus-within:border-stone-900 transition-colors pb-1">
                    <Search className="w-4 h-4 text-stone-400 shrink-0 mr-2" />
                    <input
                      type="text"
                      value={exploreSearch}
                      onChange={(e) => setExploreSearch(e.target.value)}
                      placeholder="Tìm kiếm trang phục..."
                      className="w-full bg-transparent text-xs sm:text-sm text-stone-900 placeholder:text-stone-400 focus:outline-hidden"
                    />
                    {exploreSearch && (
                      <button
                        onClick={() => setExploreSearch('')}
                        className="text-stone-400 hover:text-stone-800 p-0.5 shrink-0"
                        title="Xóa tìm kiếm"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>

                  {/* Gender Toggle Minimalist Text */}
                  <div className="flex items-center gap-2.5 text-xs font-medium shrink-0 select-none">
                    <button
                      type="button"
                      onClick={() => handleGenderChange('Female')}
                      className={`transition-all pb-0.5 ${
                        selectedGender === 'Female'
                          ? 'font-bold text-stone-900 border-b-2 border-stone-900'
                          : 'text-stone-400 hover:text-stone-700'
                      }`}
                    >
                      Nữ
                    </button>
                    <span className="text-stone-300">/</span>
                    <button
                      type="button"
                      onClick={() => handleGenderChange('Male')}
                      className={`transition-all pb-0.5 ${
                        selectedGender === 'Male'
                          ? 'font-bold text-stone-900 border-b-2 border-stone-900'
                          : 'text-stone-400 hover:text-stone-700'
                      }`}
                    >
                      Nam
                    </button>
                  </div>
                </div>

                {/* Hàng 2: Horizontal Scrollable Tabs */}
                <div className="flex flex-row overflow-x-auto whitespace-nowrap scrollbar-hide snap-x gap-6 sm:gap-8 pt-1">
                  {CATEGORY_DEFINITIONS.map((cat) => {
                    const isSelected = exploreFilter === cat.id;

                    return (
                      <button
                        key={cat.id}
                        type="button"
                        onClick={() => setExploreFilter(cat.id)}
                        className={`shrink-0 text-xs sm:text-sm font-sans transition-all pb-2.5 relative select-none ${
                          isSelected
                            ? 'text-stone-900 font-bold border-b-2 border-stone-900 -mb-[1px]'
                            : 'text-stone-400 hover:text-stone-700 font-medium'
                        }`}
                      >
                        {cat.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* KHU VỰC HIỂN THỊ DANH SÁCH MÓN ĐỒ THEO TỪNG CATEGORY */}
              <div className="space-y-10 pt-2">
                {visibleCategories.map((cat) => {
                  const catGarments = filteredGarments
                    .filter((item) => getItemCategoryId(item) === cat.id)
                    .filter(matchesSearch);

                  const catCasual = filteredCasual
                    .filter((item) => getItemCategoryId(item) === cat.id)
                    .filter(matchesSearch);

                  const catAccessories = filteredAccessories
                    .filter((item) => getItemCategoryId(item) === cat.id)
                    .filter(matchesSearch);

                  const totalCatItems = catGarments.length + catCasual.length + catAccessories.length;

                  // Ẩn category nếu không có món đồ nào và đang ở chế độ xem 'all'
                  if (exploreFilter === 'all' && totalCatItems === 0) {
                    return null;
                  }

                  return (
                    <section key={cat.id} className="space-y-4">
                      {/* Tiêu đề Phân mục thuần Việt, sạch sẽ */}
                      <div className="flex items-center justify-between border-b border-stone-200/80 pb-2">
                        <h3 className="text-base sm:text-lg font-bold text-stone-900 tracking-tight">
                          {cat.label}
                        </h3>
                      </div>

                      {/* Lưới hiển thị các món đồ trong category */}
                      {totalCatItems > 0 ? (
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 sm:gap-8">
                          {/* Render Garments */}
                          {catGarments.map((garment) => {
                            const resolved = resolveItemByGender(garment, selectedGender);
                            return (
                              <GarmentCard
                                key={resolved.id}
                                item={resolved}
                                onClick={() => setSelectedGarment(garment)}
                                selectedGender={selectedGender}
                              />
                            );
                          })}

                          {/* Render Casual Items */}
                          {catCasual.map((item) => {
                            const resolved = resolveItemByGender(item, selectedGender);
                            return (
                              <CasualItemCard
                                key={resolved.id}
                                item={resolved}
                                onClick={() => setSelectedCasual(item)}
                                selectedGender={selectedGender}
                              />
                            );
                          })}

                          {/* Render Accessories */}
                          {catAccessories.map((acc) => {
                            const resolved = resolveItemByGender(acc, selectedGender);
                            return (
                              <div
                                key={resolved.id}
                                onClick={() => setInspectingAccessory(acc)}
                                className="bg-white rounded-2xl overflow-hidden border border-stone-200/70 hover:border-red-700/50 hover:shadow-md hover:-translate-y-0.5 transition-all duration-300 cursor-pointer group flex flex-col"
                              >
                                <div className="aspect-[4/3] bg-stone-100 relative overflow-hidden flex items-center justify-center">
                                  {resolved.resolvedImageUrl ? (
                                    <SafeImage
                                      src={resolved.resolvedImageUrl}
                                      alt={resolved.name}
                                      fallbackText={resolved.name}
                                      expectedPath={resolved.resolvedImageUrl}
                                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                    />
                                  ) : (
                                    <Sparkles className="w-10 h-10 text-stone-300 group-hover:text-red-700/60" />
                                  )}
                                  <span className="absolute bottom-2 right-2 px-2 py-0.5 rounded bg-red-700 text-white font-sans text-[9px] font-semibold">
                                    {resolved.category === 'headwear' ? 'Mũ nón' : 'Trang sức'}
                                  </span>
                                </div>
                                <div className="p-4 flex-1 flex flex-col justify-between space-y-2">
                                  <div>
                                    <span className="text-[10px] uppercase tracking-widest text-stone-400 font-semibold block mb-1">
                                      {resolved.category === 'headwear' ? 'Mũ nón' : 'Trang sức'}
                                    </span>
                                    <h4 className="font-bold text-gray-900 text-sm tracking-tight line-clamp-1 group-hover:text-red-700 transition-colors">
                                      {resolved.name}
                                    </h4>
                                    {resolved.origin && (
                                      <p className="text-xs text-stone-500 line-clamp-1 mt-0.5">
                                        {resolved.origin}
                                      </p>
                                    )}
                                  </div>
                                  <span className="text-[11px] text-red-700 font-medium group-hover:translate-x-0.5 transition-transform flex items-center gap-0.5">
                                    Xem chi tiết di sản →
                                  </span>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      ) : (
                        <div className="py-8 px-4 text-center bg-white rounded-2xl border border-dashed border-stone-200 space-y-2">
                          <p className="text-xs text-stone-500">
                            Không có món đồ nào trong danh mục <strong>{cat.label}</strong> phù hợp với {selectedGender === 'Female' ? 'Phom Nữ' : 'Phom Nam'} hoặc từ khóa tìm kiếm.
                          </p>
                          <div className="flex items-center justify-center gap-2 pt-1">
                            <button
                              onClick={() => setSelectedGender(selectedGender === 'Female' ? 'Male' : 'Female')}
                              className="text-xs font-semibold text-red-700 hover:underline"
                            >
                              Chuyển sang {selectedGender === 'Female' ? 'Phom Nam' : 'Phom Nữ'}
                            </button>
                            <span className="text-stone-300">•</span>
                            <button
                              onClick={() => {
                                setExploreFilter('all');
                                setExploreSearch('');
                              }}
                              className="text-xs font-semibold text-stone-600 hover:underline"
                            >
                              Xem tất cả
                            </button>
                          </div>
                        </div>
                      )}
                    </section>
                  );
                })}
              </div>
            </div>
          );
        })()}

        {/* 3. TAB PHỐI ĐỒ (STUDIO REMIX) - SPRINT 2 */}
        {activeTab === 'studio' && <Studio />}

        {/* 4. TAB BỘ SƯU TẬP (LOOKBOOK) */}
        {activeTab === 'lookbook' && <LookbookTab />}
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

      {inspectingAccessory && (
        <AccessoryDetailModal
          accessory={inspectingAccessory}
          onClose={() => setInspectingAccessory(null)}
          onSelectHeadwear={(item) => handleToggleHeadwear(item)}
          onToggleJewelry={(item) => handleToggleJewelry(item)}
          isSelectedHeadwear={selectedHeadwear?.id === inspectingAccessory.id}
          isSelectedJewelry={selectedJewelries.some((j) => j.id === inspectingAccessory.id)}
          selectedGender={selectedGender}
        />
      )}

      {/* 6. THANH ĐIỀU HƯỚNG DƯỚI CÙNG (MOBILE-FIRST) */}
      <BottomNavbar
        activeTab={activeTab}
        onSelectTab={handleTabChange}
      />
    </div>
  );
}
