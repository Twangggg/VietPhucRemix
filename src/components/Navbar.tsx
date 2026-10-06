import React, { useState } from 'react';
import { Sparkles, Menu, X, Compass, Shirt, SlidersHorizontal, BookOpen, Bookmark } from 'lucide-react';

export type NavTab = 'home' | 'explore' | 'studio' | 'lookbook' | 'collection';

interface NavbarProps {
  activeTab: NavTab;
  onSelectTab: (tab: NavTab) => void;
  garmentCount: number;
  casualCount: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  onSelectTab,
  garmentCount,
  casualCount
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems = [
    {
      id: 'home' as NavTab,
      label: 'Trang chủ',
      icon: BookOpen
    },
    {
      id: 'explore' as NavTab,
      label: 'Khám phá',
      badge: `${garmentCount + casualCount}`,
      icon: Compass
    },
    {
      id: 'studio' as NavTab,
      label: 'Phối đồ',
      icon: SlidersHorizontal
    },
    {
      id: 'lookbook' as NavTab,
      label: 'Bộ phối mẫu',
      icon: Sparkles
    },
    {
      id: 'collection' as NavTab,
      label: 'Bộ sưu tập',
      icon: Bookmark
    }
  ];

  return (
    <header className="fixed top-0 left-0 w-full z-50 bg-white/90 backdrop-blur-md border-b border-gray-200/80 transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
        {/* Nhãn hiệu bên trái */}
        <div
          onClick={() => onSelectTab('home')}
          className="cursor-pointer flex items-center gap-3.5 group"
        >
          <div className="w-10 h-10 rounded-xl bg-red-700 text-white flex items-center justify-center font-bold text-base shadow-sm group-hover:bg-red-800 transition-colors">
            VP
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-lg font-bold tracking-tight text-gray-900 group-hover:text-red-700 transition-colors">
                Việt Phục Remix
              </span>
              <span className="hidden sm:inline-block text-[10px] uppercase font-mono tracking-widest text-red-700 font-semibold px-2 py-0.5 rounded bg-red-50 border border-red-200/60">
                Di sản
              </span>
            </div>
            <p className="text-xs text-gray-500 font-sans tracking-wide">
              Thời trang di sản đương đại
            </p>
          </div>
        </div>

        {/* Danh mục điều hướng */}
        <nav className="hidden md:flex items-center gap-8">
          {navItems.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onSelectTab(item.id)}
                className={`relative py-2 text-sm transition-colors flex items-center gap-2 font-medium ${
                  isActive ? 'text-red-700 font-semibold' : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <span>{item.label}</span>
                {item.badge && (
                  <span
                    className={`text-[10px] font-mono px-1.5 py-0.5 rounded-full ${
                      isActive
                        ? 'bg-red-100 text-red-800 font-semibold'
                        : 'bg-stone-100 text-stone-600'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}

                {isActive && (
                  <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-red-700 rounded-full transition-all" />
                )}
              </button>
            );
          })}
        </nav>

        {/* Nút tác vụ phối đồ */}
        <div className="hidden lg:flex items-center gap-3">
          <button
            onClick={() => onSelectTab('studio')}
            className="px-4 py-2 rounded-xl bg-red-700 hover:bg-red-800 text-white text-xs font-semibold tracking-wide transition-all shadow-sm hover:shadow flex items-center gap-2"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-200" />
            Thử nghiệm phối đồ
          </button>
        </div>

        {/* Nút menu di động */}
        <div className="flex md:hidden items-center">
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 rounded-lg text-gray-600 hover:text-gray-900 hover:bg-stone-100 transition-colors"
            aria-label="Mở trình đơn"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {mobileMenuOpen && (
        <div className="md:hidden border-t border-gray-200 bg-white/95 backdrop-blur-lg px-4 pt-3 pb-6 space-y-2 shadow-lg">
          {navItems.map((item) => {
            const isActive = activeTab === item.id;
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => {
                  onSelectTab(item.id);
                  setMobileMenuOpen(false);
                }}
                className={`w-full flex items-center justify-between p-3 rounded-xl text-left text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-red-50 text-red-700 border-l-4 border-red-700 font-semibold'
                    : 'text-gray-700 hover:bg-stone-50'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className={`w-4 h-4 ${isActive ? 'text-red-700' : 'text-gray-400'}`} />
                  <span>{item.label}</span>
                </div>
                {item.badge && (
                  <span className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-stone-100 text-stone-600">
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      )}
    </header>
  );
};
