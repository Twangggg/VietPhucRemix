import React from 'react';
import { Gender } from '../types';

interface GenderToggleProps {
  selectedGender: Gender;
  onChangeGender: (gender: Gender) => void;
  className?: string;
  size?: 'sm' | 'md';
}

export const GenderToggle: React.FC<GenderToggleProps> = ({
  selectedGender,
  onChangeGender,
  className = '',
  size = 'md'
}) => {
  return (
    <div
      className={`inline-flex items-center p-1 bg-stone-100 rounded-2xl border border-stone-200/80 shadow-xs ${className}`}
      role="group"
      aria-label="Chọn kiểu dáng giới tính"
    >
      <button
        type="button"
        onClick={() => onChangeGender('Female')}
        className={`flex items-center justify-center gap-1.5 rounded-xl transition-all duration-200 font-medium ${
          size === 'sm' ? 'px-3 py-1 text-xs' : 'px-4 py-1.5 text-xs sm:text-sm'
        } ${
          selectedGender === 'Female'
            ? 'bg-white text-red-700 font-semibold shadow-xs'
            : 'text-stone-500 hover:text-stone-900'
        }`}
      >
        <span className="w-1.5 h-1.5 rounded-full bg-red-700 opacity-90" />
        <span>Nữ</span>
      </button>

      <button
        type="button"
        onClick={() => onChangeGender('Male')}
        className={`flex items-center justify-center gap-1.5 rounded-xl transition-all duration-200 font-medium ${
          size === 'sm' ? 'px-3 py-1 text-xs' : 'px-4 py-1.5 text-xs sm:text-sm'
        } ${
          selectedGender === 'Male'
            ? 'bg-white text-red-700 font-semibold shadow-xs'
            : 'text-stone-500 hover:text-stone-900'
        }`}
      >
        <span className="w-1.5 h-1.5 rounded-full bg-red-700 opacity-90" />
        <span>Nam</span>
      </button>
    </div>
  );
};
