import React, { useState } from 'react';
import { Lock, FileSpreadsheet, ShieldCheck, HelpCircle } from 'lucide-react';
import { APP_LOGO_URL } from '../constants/assets';

interface HeaderProps {
  onOpenAdmin: () => void;
  onOpenGuide: () => void;
  totalRecords: number;
}

export const Header: React.FC<HeaderProps> = ({
  onOpenAdmin,
  onOpenGuide,
  totalRecords,
}) => {
  const [imgError, setImgError] = useState(false);

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-purple-200/80 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-18 flex items-center justify-between gap-4">
        {/* Zone 1: Logo & Brand title */}
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-full overflow-hidden shrink-0 border border-purple-300 p-0.5 bg-white shadow-xs">
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
          <a
            href="/"
            className="text-sm sm:text-base font-bold tracking-tight text-purple-950 font-prompt truncate hover:text-purple-800 transition-colors"
          >
            ระบบดาวน์โหลดเกียรติบัตร สาขาวิชาภาษาไทย คณะศึกษาศาสตร์ มหาวิทยาลัยศิลปากร
          </a>
        </div>

        {/* Zone 2: Navigation Links */}
        <nav className="hidden lg:flex items-center gap-6 text-xs font-semibold text-stone-600 font-prompt shrink-0">
          <a href="#search-section" className="hover:text-purple-900 transition-colors">
            ค้นหาเกียรติบัตร
          </a>
          <a href="#activities" className="hover:text-purple-900 transition-colors">
            โครงการทั้งหมด
          </a>
          <button
            onClick={onOpenGuide}
            className="hover:text-purple-900 transition-colors text-left"
          >
            คู่มือการใช้งาน
          </button>
        </nav>

        {/* Zone 3: Primary action - Admin access */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={onOpenAdmin}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-gradient-to-r from-purple-800 to-indigo-800 hover:from-purple-900 hover:to-indigo-900 rounded-xl transition-all font-prompt shadow-sm shadow-purple-900/10"
            title="เข้าสู่ระบบผู้ดูแลระบบเพื่อจัดการข้อมูล"
          >
            <Lock className="w-3.5 h-3.5 text-amber-300" />
            <span>Admin</span>
          </button>
        </div>
      </div>
    </header>
  );
};
