import React from 'react';
import { Home, Compass, SlidersHorizontal, Sparkles, Bookmark } from 'lucide-react';

export type NavTab = 'home' | 'explore' | 'studio' | 'lookbook' | 'collection';

interface BottomNavbarProps {
  activeTab: NavTab;
  onSelectTab: (tab: NavTab) => void;
}

export const BottomNavbar: React.FC<BottomNavbarProps> = ({
  activeTab,
  onSelectTab
}) => {
  const tabs = [
    {
      id: 'home' as NavTab,
      label: 'Trang chủ',
      icon: Home
    },
    {
      id: 'explore' as NavTab,
      label: 'Khám phá',
      icon: Compass
    },
    {
      id: 'studio' as NavTab,
      label: 'Phối đồ',
      icon: SlidersHorizontal
    },
    {
      id: 'lookbook' as NavTab,
      label: 'Phối mẫu',
      icon: Sparkles
    },
    {
      id: 'collection' as NavTab,
      label: 'Đã lưu',
      icon: Bookmark
    }
  ];

  return (
    <nav className="fixed bottom-0 left-0 w-full z-50 bg-white/95 backdrop-blur-md border-t border-gray-200 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)] transition-all">
      <div className="max-w-md md:max-w-xl mx-auto flex justify-between items-center h-16 sm:h-20 px-1 sm:px-4">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          const Icon = tab.icon;

          return (
            <button
              key={tab.id}
              onClick={() => onSelectTab(tab.id)}
              className="flex-1 flex flex-col items-center justify-center py-1 sm:py-2 transition-all relative group min-w-0"
            >
              <div
                className={`p-1 rounded-xl transition-all duration-200 ${
                  isActive ? 'scale-110' : 'group-hover:scale-105'
                }`}
              >
                <Icon
                  className={`w-5 h-5 sm:w-6 sm:h-6 transition-colors duration-200 ${
                    isActive ? 'text-red-700 stroke-[2.2]' : 'text-gray-400 stroke-[1.7] group-hover:text-gray-600'
                  }`}
                />
              </div>
              <span
                className={`text-[9.5px] sm:text-xs tracking-tight transition-colors duration-200 mt-0.5 whitespace-nowrap overflow-hidden text-ellipsis px-0.5 text-center leading-none ${
                  isActive
                    ? 'text-red-700 font-bold'
                    : 'text-gray-400 font-medium group-hover:text-gray-600'
                }`}
              >
                {tab.label}
              </span>

              {/* Minimal active indicator dot */}
              {isActive && (
                <span className="w-1 h-1 rounded-full bg-red-700 mt-0.5 shrink-0" />
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
};
