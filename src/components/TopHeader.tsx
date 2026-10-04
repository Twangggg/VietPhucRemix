import React from 'react';
import { Sparkles } from 'lucide-react';

interface TopHeaderProps {
  onOpenStudio?: () => void;
  activeTabTitle?: string;
}

export const TopHeader: React.FC<TopHeaderProps> = ({ onOpenStudio, activeTabTitle }) => {
  return (
    <header className="sticky top-0 left-0 w-full z-40 bg-white/90 backdrop-blur-md border-b border-gray-200/70 transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-14 sm:h-16 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-red-700 text-white flex items-center justify-center font-['Playfair_Display',serif] font-bold text-sm shadow-sm">
            VP
          </div>
          <div>
            <span className="text-base sm:text-lg font-bold tracking-tight text-gray-900 font-['Playfair_Display',serif] block leading-tight">
              Việt Phục Remix
            </span>
            <span className="text-[10px] text-gray-400 font-sans tracking-wide hidden sm:block">
              Thời trang di sản đương đại
            </span>
          </div>
        </div>

        {activeTabTitle && (
          <div className="hidden sm:block text-xs font-mono uppercase tracking-widest text-stone-500 font-medium">
            {activeTabTitle}
          </div>
        )}

        <div className="flex items-center gap-2">
          {onOpenStudio && (
            <button
              onClick={onOpenStudio}
              className="px-3 py-1.5 rounded-lg bg-red-50 hover:bg-red-100 text-red-700 text-xs font-semibold border border-red-200/60 transition-colors flex items-center gap-1.5"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Phối đồ</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
