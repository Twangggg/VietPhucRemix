import React from 'react';
import { Sparkles } from 'lucide-react';

interface TopHeaderProps {
  onOpenStudio?: () => void;
  activeTabTitle?: string;
}

export const TopHeader: React.FC<TopHeaderProps> = ({ onOpenStudio, activeTabTitle }) => {
  return (
    <header className="sticky top-0 left-0 w-full z-50 bg-white border-b border-stone-200 shadow-2xs transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-12 sm:h-14 flex items-center">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-red-700 text-white flex items-center justify-center font-bold text-xs shadow-xs tracking-tight">
            VP
          </div>
          <div>
            <span className="text-sm sm:text-base font-bold tracking-tight text-stone-900 block leading-none font-sans">
              Việt Phục Remix
            </span>
            <span className="text-[9px] text-stone-400 font-sans tracking-normal hidden sm:block mt-0.5">
              Thời trang di sản đương đại
            </span>
          </div>
        </div>
      </div>
    </header>
  );
};
