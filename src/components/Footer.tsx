import React, { useState } from 'react';
import { APP_LOGO_URL, DEVELOPER_CREDIT } from '../constants/assets';
import { GraduationCap, Heart } from 'lucide-react';

export const Footer: React.FC = () => {
  const [imgError, setImgError] = useState(false);

  return (
    <footer className="bg-purple-950 text-purple-200 border-t border-purple-900/80 mt-16 font-sarabun">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pb-8 border-b border-purple-900">
          {/* Col 1: University Identity */}
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full border border-purple-400/50 p-1 bg-white shrink-0">
                {!imgError ? (
                  <img
                    src={APP_LOGO_URL}
                    alt="ตราสัญลักษณ์ มหาวิทยาลัยศิลปากร"
                    referrerPolicy="no-referrer"
                    onError={() => setImgError(true)}
                    className="w-full h-full object-contain"
                  />
                ) : (
                  <div className="w-full h-full bg-purple-900 text-amber-300 flex items-center justify-center font-bold text-xs rounded-full">
                    SU
                  </div>
                )}
              </div>
              <div>
                <h4 className="font-prompt font-bold text-white text-sm">
                  สาขาวิชาภาษาไทย
                </h4>
                <p className="text-xs text-purple-300">คณะศึกษาศาสตร์ มหาวิทยาลัยศิลปากร</p>
              </div>
            </div>
            <p className="text-xs text-purple-300/80 leading-relaxed">
              มุ่งมั่นสร้างสรรค์ครูภาษาไทยที่มีจิตวิญญาณความเป็นครู มีความเป็นเลิศทางวิชาการ และสืบสานคุณค่าภาษาและวรรณคดีไทย
            </p>
          </div>

          {/* Col 2: Campus Location */}
          <div className="space-y-2">
            <h5 className="font-prompt font-semibold text-white text-xs uppercase tracking-wider text-amber-300">
              ที่ตั้งและการติดต่อ
            </h5>
            <p className="text-xs text-purple-300/80 leading-relaxed">
              คณะศึกษาศาสตร์ มหาวิทยาลัยศิลปากร (วิทยาเขตพระราชวังสนามจันทร์)
              <br />
              เลขที่ ๖ ถนนราชมรรคาใน ตำบลพระปฐมเจดีย์ อำเภอเมืองนครปฐม จังหวัดนครปฐม ๗๓๐๐๐
            </p>
          </div>

          {/* Col 3: Developer Credit (Requirement 8) */}
          <div className="space-y-2.5 bg-purple-900/60 p-4 rounded-2xl border border-purple-800/80">
            <h5 className="font-prompt font-semibold text-amber-300 text-xs uppercase tracking-wider flex items-center gap-1.5">
              <GraduationCap className="w-4 h-4 text-amber-400" />
              <span>ผู้พัฒนาระบบ (System Developer)</span>
            </h5>
            <div className="space-y-1">
              <p className="text-xs font-bold text-white font-prompt">
                {DEVELOPER_CREDIT.name}
              </p>
              <p className="text-xs text-purple-200 leading-relaxed">
                {DEVELOPER_CREDIT.title}
              </p>
            </div>
          </div>
        </div>

        {/* Bottom copyright */}
        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-purple-400">
          <p>© {new Date().getFullYear()} สาขาวิชาภาษาไทย คณะศึกษาศาสตร์ มหาวิทยาลัยศิลปากร. สงวนลิขสิทธิ์.</p>
          <div className="flex items-center gap-1.5">
            <span>พัฒนาโดย</span>
            <span className="text-amber-300 font-semibold">{DEVELOPER_CREDIT.name} (รุ่นที่ ๕๖)</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
