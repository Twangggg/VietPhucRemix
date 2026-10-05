import React, { useState } from 'react';
import { Compass, Sparkles, FolderTree, Search, X } from 'lucide-react';
import { GARMENTS, CASUAL_ITEMS, ACCESSORIES } from '../data';
import { Garment, CasualItem, Gender, AccessoryItem } from '../types';
import { GarmentCard } from '../components/GarmentCard';
import { CasualItemCard } from '../components/CasualItemCard';
import { GarmentDetailModal } from '../components/GarmentDetailModal';
import { CasualDetailModal } from '../components/CasualDetailModal';
import { AccessoryDetailModal } from '../components/AccessoryDetailModal';
import { GenderToggle } from '../components/GenderToggle';
import { SafeImage } from '../components/SafeImage';
import { resolveItemByGender, filterByGender } from '../utils/helpers';
import { CategoryFilterKey, CATEGORY_DEFINITIONS } from '../App';

export interface ExploreProps {
  onSelectForStudio?: (garmentId: string) => void;
}

export const Explore: React.FC<ExploreProps> = ({ onSelectForStudio }) => {
  const [selectedGarment, setSelectedGarment] = useState<Garment | null>(null);
  const [selectedCasual, setSelectedCasual] = useState<CasualItem | null>(null);
  const [inspectingAccessory, setInspectingAccessory] = useState<AccessoryItem | null>(null);

  const [selectedGender, setSelectedGender] = useState<Gender>('Female');
  const [exploreFilter, setExploreFilter] = useState<CategoryFilterKey>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [repositoryType, setRepositoryType] = useState<'traditional' | 'modern'>('traditional');

  const isModernItem = (item: any) => item.id && item.id.toLowerCase().startsWith('cs');

  const filteredGarments = filterByGender(GARMENTS, selectedGender).filter(item => repositoryType === 'modern' ? isModernItem(item) : !isModernItem(item));
  const filteredCasual = filterByGender(CASUAL_ITEMS, selectedGender).filter(item => repositoryType === 'modern' ? isModernItem(item) : !isModernItem(item));
  const filteredAccessories = filterByGender(ACCESSORIES, selectedGender).filter(item => repositoryType === 'modern' ? isModernItem(item) : !isModernItem(item));

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

  const getCategoryCount = (catId: CategoryFilterKey): number => {
    if (catId === 'all') {
      return filteredGarments.length + filteredCasual.length + filteredAccessories.length;
    }
    const gCount = filteredGarments.filter(i => getItemCategoryId(i) === catId).length;
    const cCount = filteredCasual.filter(i => getItemCategoryId(i) === catId).length;
    const aCount = filteredAccessories.filter(i => getItemCategoryId(i) === catId).length;
    return gCount + cCount + aCount;
  };

  const matchesSearch = (item: any): boolean => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      (item.name && item.name.toLowerCase().includes(q)) ||
      (item.id && item.id.toLowerCase().includes(q)) ||
      (item.origin && item.origin.toLowerCase().includes(q)) ||
      (item.category && item.category.toLowerCase().includes(q)) ||
      (item.description && item.description.toLowerCase().includes(q))
    );
  };

  const availableCategoryIds = new Set([
    ...filteredGarments.map(getItemCategoryId),
    ...filteredCasual.map(getItemCategoryId),
    ...filteredAccessories.map(getItemCategoryId)
  ]);

  const visibleCategoriesForTabs = CATEGORY_DEFINITIONS.filter(cat =>
    cat.id === 'all' || availableCategoryIds.has(cat.id)
  );

  const visibleCategories = CATEGORY_DEFINITIONS.filter(cat => {
    if (cat.id === 'all') return false;
    if (!availableCategoryIds.has(cat.id)) return false;
    if (exploreFilter !== 'all' && exploreFilter !== cat.id) return false;
    return true;
  });

  return (
    <div className="min-h-screen bg-stone-50 text-stone-900 py-8 sm:py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-6 sm:space-y-8">
        {/* Tiêu đề & Giới tính */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-stone-200/80 pb-4">
          <div>
            <div className="inline-flex items-center gap-1.5 text-xs font-mono uppercase tracking-widest text-red-700 font-bold mb-1.5">
              <FolderTree className="w-3.5 h-3.5 text-red-700" />
              <span>Kho Tư Liệu Di Sản & Thời Trang</span>
            </div>
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-gray-900 tracking-tight">
              Kho Trang Phục & Phụ Kiện
            </h1>
            <p className="text-xs sm:text-sm text-stone-500 mt-2 max-w-2xl font-sans leading-relaxed">
              Tuyển tập 80 di sản cổ phục, trang phục đương đại và phụ kiện được phân loại chính xác theo danh mục cấu thành.
            </p>
          </div>

          <div className="flex items-center gap-3 pb-2">
            <GenderToggle
              selectedGender={selectedGender}
              onChangeGender={setSelectedGender}
              size="sm"
            />
          </div>
        </div>

        {/* TAB CHỌN KHO */}
        <div className="sticky top-0 sm:top-0 z-40 bg-stone-50 flex items-center overflow-x-auto whitespace-nowrap scrollbar-hide snap-x gap-5 sm:gap-8 pt-4 pb-2 border-b border-stone-200 -mx-4 sm:-mx-6 lg:-mx-8 px-4 sm:px-6 lg:px-8">
          <button
            onClick={() => {
              setRepositoryType('traditional');
              setExploreFilter('all');
            }}
            className={`shrink-0 pb-3 text-sm sm:text-base font-bold transition-colors border-b-2 ${repositoryType === 'traditional' ? 'border-red-700 text-red-700' : 'border-transparent text-stone-400 hover:text-stone-800'}`}
          >
            Kho Cổ Phục Truyền Thống
          </button>
          <br></br>
          <button
            onClick={() => {
              setRepositoryType('modern');
              setExploreFilter('all');
            }}
            className={`shrink-0 pb-3 text-sm sm:text-base font-bold transition-colors border-b-2 ${repositoryType === 'modern' ? 'border-red-700 text-red-700' : 'border-transparent text-stone-400 hover:text-stone-800'}`}
          >
            Kho Đương Đại Hiện Đại
          </button>
        </div>

        {/* STICKY HEADER: GỘP SEARCH + GENDER TOGGLE VÀ TAB CUỘN NGANG (MINIMALIST E-COMMERCE) */}
        <div className="sticky top-[53px] sm:top-[57px] z-30 bg-[#F9F8F6] pt-3 pb-0 border-b border-stone-200 -mx-4 sm:-mx-6 lg:-mx-8 px-4 sm:px-6 lg:px-8 space-y-3 shadow-2xs">
          {/* Hàng 1: Search Bar Tàng Hình & Gender Toggle Tinh Gọn */}
          <div className="flex items-center justify-between gap-4">
            {/* Search Bar tối giản chỉ có border-b */}
            <div className="relative flex-1 max-w-xs sm:max-w-sm flex items-center border-b border-stone-300 focus-within:border-stone-900 transition-colors pb-1">
              <Search className="w-4 h-4 text-stone-400 shrink-0 mr-2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Tìm kiếm trang phục..."
                className="w-full bg-transparent text-xs sm:text-sm text-stone-900 placeholder:text-stone-400 focus:outline-hidden"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
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
                onClick={() => setSelectedGender('Female')}
                className={`transition-all pb-0.5 ${selectedGender === 'Female'
                  ? 'font-bold text-stone-900 border-b-2 border-stone-900'
                  : 'text-stone-400 hover:text-stone-700'
                  }`}
              >
                Nữ
              </button>
              <span className="text-stone-300">/</span>
              <button
                type="button"
                onClick={() => setSelectedGender('Male')}
                className={`transition-all pb-0.5 ${selectedGender === 'Male'
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
            {visibleCategoriesForTabs.map((cat) => {
              const isSelected = exploreFilter === cat.id;

              return (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setExploreFilter(cat.id)}
                  className={`shrink-0 text-xs sm:text-sm font-sans transition-all pb-2.5 relative select-none ${isSelected
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

        {/* Danh sách món đồ */}
        <div className="space-y-10">
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

            if (exploreFilter === 'all' && totalCatItems === 0) {
              return null;
            }

            return (
              <section key={cat.id} className="space-y-4">
                <div className="flex items-center justify-between border-b border-stone-200/80 pb-2">
                  <h3 className="text-base sm:text-lg font-bold text-stone-900 tracking-tight">
                    {cat.label}
                  </h3>
                </div>

                {totalCatItems > 0 ? (
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 sm:gap-8">
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
                              {resolved.category === 'headwear' ? 'Mũ nón & Khăn' : 'Trang sức'}
                            </span>
                          </div>
                          <div className="p-4 flex-1 flex flex-col justify-between space-y-2">
                            <div>
                              <span className="text-[10px] uppercase tracking-widest text-stone-400 font-semibold block mb-1">
                                {resolved.category === 'headwear' ? 'Mũ nón di sản' : 'Trang sức cổ'}
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
                  </div>
                )}
              </section>
            );
          })}
        </div>
      </div>

      {/* Modal chi tiết */}
      {selectedGarment && (
        <GarmentDetailModal
          garment={selectedGarment}
          onClose={() => setSelectedGarment(null)}
          selectedGender={selectedGender}
        />
      )}

      {selectedCasual && (
        <CasualDetailModal
          item={selectedCasual}
          onClose={() => setSelectedCasual(null)}
          selectedGender={selectedGender}
        />
      )}

      {inspectingAccessory && (
        <AccessoryDetailModal
          accessory={inspectingAccessory}
          onClose={() => setInspectingAccessory(null)}
        />
      )}
    </div>
  );
};

export default Explore;
