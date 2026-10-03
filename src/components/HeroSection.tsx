import React, { useState } from 'react';
import { Search, Lock, Award, BookOpen, CheckCircle, GraduationCap } from 'lucide-react';
import { APP_LOGO_URL, DEVELOPER_CREDIT } from '../constants/assets';

interface HeroSectionProps {
  onScrollToSearch: () => void;
  onScrollToCorrection?: () => void;
  totalRecords: number;
}

export const HeroSection: React.FC<HeroSectionProps> = ({
  onScrollToSearch,
  onScrollToCorrection,
  totalRecords,
}) => {
  const [imgError, setImgError] = useState(false);

  return (
    <div className="relative overflow-hidden bg-gradient-to-br from-purple-950 via-purple-900 to-indigo-950 text-white rounded-3xl mb-8 border border-purple-800/60 shadow-xl">
      {/* Background Subtle Gradient & Light Orbs */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute -top-24 -left-24 w-96 h-96 bg-purple-600/20 rounded-full blur-3xl" />
        <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-indigo-600/20 rounded-full blur-3xl" />
      </div>

      {/* Hero Content */}
      <div className="relative z-10 max-w-5xl mx-auto px-6 py-12 sm:py-16 text-center space-y-6">
        {/* Emblem Seal / Logo */}
        <div className="flex justify-center mb-2">
          <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-full border-2 border-amber-300/80 p-1 bg-white shadow-xl shadow-purple-950/40 backdrop-blur-sm flex items-center justify-center">
            {!imgError ? (
              <img
                src={APP_LOGO_URL}
                alt="ตราสัญลักษณ์ มหาวิทยาลัยศิลปากร"
                referrerPolicy="no-referrer"
                onError={() => setImgError(true)}
                className="w-full h-full object-contain rounded-full"
              />
            ) : (
              <div className="w-full h-full bg-purple-900 text-amber-300 flex items-center justify-center font-bold text-sm rounded-full">
                ศิลปากร
              </div>
            )}
          </div>
        </div>

        {/* Titles */}
        <div className="space-y-3">
          <p className="text-xs sm:text-sm font-semibold tracking-widest text-amber-300 uppercase font-prompt">
            สาขาวิชาภาษาไทย คณะศึกษาศาสตร์ มหาวิทยาลัยศิลปากร
          </p>
          <h1 className="text-2xl sm:text-4xl lg:text-5xl font-bold font-prompt tracking-tight text-white leading-tight">
            ระบบดาวน์โหลดเกียรติบัตร
            <br />
            สาขาวิชาภาษาไทย คณะศึกษาศาสตร์ มหาวิทยาลัยศิลปากร
          </h1>
          <p className="text-sm sm:text-base text-purple-200 max-w-2xl mx-auto font-sarabun leading-relaxed">
            ค้นหาและดาวน์โหลดเกียรติบัตรอิเล็กทรอนิกส์ (PDF)
            โดยเลือกโครงการและค้นหาด้วยรหัสนักศึกษา หรือชื่อ-นามสกุล
          </p>
        </div>

        {/* Action CTAs */}
        <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
          <button
            onClick={onScrollToSearch}
            className="inline-flex items-center gap-2 px-6 py-3 text-sm font-semibold text-purple-950 bg-amber-400 hover:bg-amber-300 rounded-xl transition-all shadow-lg shadow-amber-400/20 font-prompt"
          >
            <Search className="w-4 h-4 text-purple-950" />
            <span>ค้นหาเกียรติบัตรของท่าน</span>
          </button>

          {onScrollToCorrection && (
            <button
              onClick={onScrollToCorrection}
              className="inline-flex items-center gap-2 px-5 py-3 text-sm font-medium text-purple-100 bg-purple-900/80 hover:bg-purple-800 hover:text-white border border-purple-700/80 rounded-xl transition-colors backdrop-blur-sm font-prompt"
            >
              <span>ยื่นคำร้องขอแก้ไขข้อมูล</span>
            </button>
          )}
        </div>

        {/* Developer Credit Tag (Requirement 8) */}
        <div className="pt-6 border-t border-purple-800/80 flex flex-col sm:flex-row items-center justify-center gap-2 text-xs text-purple-200 font-sarabun">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-900/90 border border-purple-700/60 text-amber-200">
            <GraduationCap className="w-3.5 h-3.5 text-amber-300 shrink-0" />
            <span>
              ผู้พัฒนาระบบ: <strong>{DEVELOPER_CREDIT.name}</strong> ({DEVELOPER_CREDIT.title})
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
