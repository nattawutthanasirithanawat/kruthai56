import React, { useState } from 'react';
import { Lock, FileEdit, HelpCircle, Search, Home } from 'lucide-react';
import { APP_LOGO_URL } from '../constants/assets';

interface HeaderProps {
  currentPage: 'home' | 'requests';
  onNavigate: (page: 'home' | 'requests') => void;
  onOpenAdmin: () => void;
  onOpenGuide: () => void;
  totalRecords: number;
}

export const Header: React.FC<HeaderProps> = ({
  currentPage,
  onNavigate,
  onOpenAdmin,
  onOpenGuide,
  totalRecords,
}) => {
  const [imgError, setImgError] = useState(false);

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-purple-200/80 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-18 flex items-center justify-between gap-3">
        {/* Zone 1: Logo & Brand title */}
        <div className="flex items-center gap-3 min-w-0">
          <div
            onClick={() => onNavigate('home')}
            className="w-10 h-10 sm:w-11 sm:h-11 rounded-full overflow-hidden shrink-0 border border-purple-300 p-0.5 bg-white shadow-xs cursor-pointer hover:scale-105 transition-transform"
          >
            {!imgError ? (
              <img
                src={APP_LOGO_URL}
                alt="ตราสัญลักษณ์ มหาวิทยาลัยศิลปากร"
                referrerPolicy="no-referrer"
                onError={() => setImgError(true)}
                className="w-full h-full object-contain"
              />
            ) : (
              <div className="w-full h-full bg-purple-900 text-white flex items-center justify-center font-bold text-xs rounded-full">
                SU
              </div>
            )}
          </div>
          <button
            type="button"
            onClick={() => onNavigate('home')}
            className="text-left text-xs sm:text-base font-bold tracking-tight text-purple-950 font-prompt truncate hover:text-purple-800 transition-colors"
          >
            ระบบดาวน์โหลดเกียรติบัตร สาขาวิชาภาษาไทย คณะศึกษาศาสตร์ มหาวิทยาลัยศิลปากร
          </button>
        </div>

        {/* Zone 2: Navigation Menus & Page Switcher */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          {/* Menu Item 1: หน้าค้นหาเกียรติบัตร */}
          <button
            type="button"
            onClick={() => onNavigate('home')}
            className={`inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-xl transition-all font-prompt ${
              currentPage === 'home'
                ? 'bg-purple-900 text-white shadow-xs'
                : 'text-stone-700 hover:text-purple-900 hover:bg-purple-50'
            }`}
          >
            <Search className="w-3.5 h-3.5" />
            <span className="hidden md:inline">ค้นหาเกียรติบัตร</span>
          </button>

          {/* Menu Item 2: หน้าบริการยื่นคำร้องออนไลน์ (Requirement 3: Dedicated Menu Page) */}
          <button
            type="button"
            onClick={() => onNavigate('requests')}
            className={`inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-xl transition-all font-prompt border ${
              currentPage === 'requests'
                ? 'bg-purple-900 text-white border-purple-950 shadow-xs'
                : 'text-purple-950 bg-purple-100 hover:bg-purple-200 border-purple-300/80 shadow-2xs'
            }`}
            title="เปิดหน้าต่างบริการยื่นคำร้องขอแก้ไขเกียรติบัตรออนไลน์"
          >
            <FileEdit className={`w-3.5 h-3.5 shrink-0 ${currentPage === 'requests' ? 'text-amber-300' : 'text-purple-800'}`} />
            <span className="font-bold">บริการยื่นคำร้องออนไลน์</span>
          </button>

          {/* Guide icon/button */}
          <button
            type="button"
            onClick={onOpenGuide}
            className="hidden sm:inline-flex items-center gap-1 px-3 py-2 text-xs font-semibold text-stone-600 hover:text-purple-900 hover:bg-purple-50 rounded-xl transition-colors font-prompt"
            title="คู่มือการใช้งาน"
          >
            <HelpCircle className="w-3.5 h-3.5 text-purple-800" />
            <span>คู่มือ</span>
          </button>

          {/* Admin access (Exclusively at top right) */}
          <button
            type="button"
            onClick={onOpenAdmin}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-gradient-to-r from-purple-800 to-indigo-800 hover:from-purple-900 hover:to-indigo-900 rounded-xl transition-all font-prompt shadow-xs"
            title="เข้าสู่ระบบผู้ดูแลระบบเพื่อจัดการข้อมูล"
          >
            <Lock className="w-3.5 h-3.5 text-amber-300" />
            <span className="hidden sm:inline">Admin</span>
          </button>
        </div>
      </div>
    </header>
  );
};
