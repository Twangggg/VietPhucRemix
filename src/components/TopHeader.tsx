import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { User as UserIcon, LogOut, Bookmark, Cloud, ChevronDown } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

interface TopHeaderProps {
  onOpenStudio?: () => void;
  activeTabTitle?: string;
  onOpenAuthModal?: () => void;
}

export const TopHeader: React.FC<TopHeaderProps> = ({ onOpenAuthModal }) => {
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Đóng dropdown khi bấm ra ngoài
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = async () => {
    try {
      await logout();
      setDropdownOpen(false);
    } catch (err) {
      console.error('Lỗi khi đăng xuất:', err);
    }
  };

  return (
    <header className="sticky top-0 left-0 w-full z-50 bg-white/95 backdrop-blur-md border-b border-stone-200/90 shadow-2xs transition-all font-sans">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-12 sm:h-14 flex items-center justify-between">
        {/* LOGO & BRANDING */}
        <div
          onClick={() => navigate('/')}
          className="flex items-center gap-2 cursor-pointer group"
        >
          <div className="w-7 h-7 rounded-lg bg-red-700 text-white flex items-center justify-center font-bold text-xs shadow-xs tracking-tight group-hover:bg-red-800 transition-colors">
            VP
          </div>
          <div>
            <span className="text-sm sm:text-base font-bold tracking-tight text-stone-900 block leading-none">
              Việt Phục Remix
            </span>
            <span className="text-[9px] text-stone-400 tracking-normal hidden sm:block mt-0.5">
              Thời trang di sản đương đại
            </span>
          </div>
        </div>

        {/* AUTH CONTROLS */}
        <div className="relative" ref={dropdownRef}>
          {currentUser ? (
            /* TRẠNG THÁI ĐÃ ĐĂNG NHẬP */
            <div>
              <button
                type="button"
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="flex items-center gap-1.5 py-1 px-3 rounded-xl border border-stone-200/80 hover:bg-stone-50 bg-white transition-all cursor-pointer shadow-2xs"
              >
                <span className="text-xs font-semibold text-stone-800 max-w-[120px] sm:max-w-[160px] truncate">
                  {currentUser.displayName || currentUser.email?.split('@')[0]}
                </span>
                <ChevronDown className="w-3.5 h-3.5 text-stone-400 shrink-0" />
              </button>

              {/* DROPDOWN MENU */}
              {dropdownOpen && (
                <div className="absolute right-0 mt-2 w-56 rounded-2xl bg-white border border-stone-200 shadow-xl py-2 z-50 animate-in fade-in zoom-in-95 duration-150">
                  <div className="px-3.5 py-2 border-b border-stone-100">
                    <p className="text-xs font-bold text-stone-900 truncate">
                      {currentUser.displayName || 'Người yêu Cổ phục'}
                    </p>
                    <p className="text-[11px] text-stone-500 truncate">
                      {currentUser.email}
                    </p>
                    <div className="mt-1.5 inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-[10px] font-medium border border-emerald-200/60">
                      <Cloud className="w-2.5 h-2.5" />
                      <span>Đồng bộ Đám mây</span>
                    </div>
                  </div>

                  <div className="py-1">
                    <button
                      type="button"
                      onClick={() => {
                        setDropdownOpen(false);
                        navigate('/collection');
                      }}
                      className="w-full px-3.5 py-2 text-left text-xs font-medium text-stone-700 hover:bg-stone-50 flex items-center gap-2 cursor-pointer transition-colors"
                    >
                      <Bookmark className="w-3.5 h-3.5 text-stone-400" />
                      <span>Bộ sưu tập của tôi</span>
                    </button>
                  </div>

                  <div className="border-t border-stone-100 pt-1">
                    <button
                      type="button"
                      onClick={handleLogout}
                      className="w-full px-3.5 py-2 text-left text-xs font-medium text-red-600 hover:bg-red-50 flex items-center gap-2 cursor-pointer transition-colors"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      <span>Đăng xuất</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            /* TRẠNG THÁI CHƯA ĐĂNG NHẬP */
            <button
              type="button"
              onClick={onOpenAuthModal}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-stone-200 hover:border-stone-300 bg-stone-50 hover:bg-stone-100 text-stone-700 text-xs font-semibold transition-all cursor-pointer shadow-2xs active:scale-95"
            >
              <UserIcon className="w-3.5 h-3.5 text-stone-500" />
              <span>Đăng nhập</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
