import React from 'react';
import { X, Search, Download, Lock, CheckCircle, FileText } from 'lucide-react';
import { DEVELOPER_CREDIT } from '../constants/assets';

interface GuideModalProps {
  onClose: () => void;
}

export const GuideModal: React.FC<GuideModalProps> = ({ onClose }) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-purple-950/80 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-purple-200 overflow-hidden my-auto">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-gradient-to-r from-purple-900 to-indigo-900 text-white">
          <div>
            <h2 className="font-prompt font-semibold text-base sm:text-lg">
              คู่มือการใช้งานระบบดาวน์โหลดเกียรติบัตร
            </h2>
            <p className="text-xs text-purple-200">
              สาขาวิชาภาษาไทย คณะศึกษาศาสตร์ มหาวิทยาลัยศิลปากร
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-purple-200 hover:text-white hover:bg-purple-800 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5 max-h-[75vh] overflow-y-auto font-sarabun text-xs text-stone-700">
          {/* Step 1 */}
          <div className="flex gap-3.5">
            <div className="w-8 h-8 rounded-xl bg-purple-100 text-purple-900 font-bold flex items-center justify-center shrink-0 font-prompt">
              ๑
            </div>
            <div className="space-y-1">
              <h3 className="font-bold text-stone-900 font-prompt text-sm">
                เลือกโครงการและค้นหาด้วยชื่อ-นามสกุล
              </h3>
              <p className="leading-relaxed text-stone-600">
                เลือกโครงการที่ท่านเข้าร่วม จากนั้นระบุชื่อ หรือ นามสกุล เพื่อค้นหาและแสดงเกียรติบัตรของท่าน
              </p>
            </div>
          </div>

          {/* Step 2 */}
          <div className="flex gap-3.5">
            <div className="w-8 h-8 rounded-xl bg-purple-100 text-purple-900 font-bold flex items-center justify-center shrink-0 font-prompt">
              ๒
            </div>
            <div className="space-y-1">
              <h3 className="font-bold text-stone-900 font-prompt text-sm">
                ดูตัวอย่างและดาวน์โหลดเกียรติบัตร
              </h3>
              <p className="leading-relaxed text-stone-600">
                เมื่อพบรายชื่อของท่าน สามารถกดปุ่ม <strong>"ดูตัวอย่างเกียรติบัตร"</strong> เพื่อเปิดหน้าต่างดูตัวอย่างเอกสาร หรือกดปุ่ม <strong>"ดาวน์โหลด PDF"</strong> เพื่อรับไฟล์เกียรติบัตรทันที
              </p>
            </div>
          </div>

          {/* Step 3 */}
          <div className="flex gap-3.5">
            <div className="w-8 h-8 rounded-xl bg-purple-100 text-purple-900 font-bold flex items-center justify-center shrink-0 font-prompt">
              ๓
            </div>
            <div className="space-y-1">
              <h3 className="font-bold text-stone-900 font-prompt text-sm">
                การยื่นคำร้องขอแก้ไขข้อมูล
              </h3>
              <p className="leading-relaxed text-stone-600">
                หากพบว่าชื่อ-นามสกุลหรือข้อมูลในเกียรติบัตรสะกดไม่ถูกต้อง สามารถกดปุ่ม <strong>"ยื่นคำร้องขอแก้ไขข้อมูล"</strong> ด้านล่างของเว็บไซต์ พร้อมรับเลขติดตามคำร้องอัตโนมัติ
              </p>
            </div>
          </div>

          {/* Developer Credit Note */}
          <div className="p-3 bg-purple-50 rounded-xl border border-purple-200 text-purple-950 space-y-1">
            <div className="font-bold font-prompt text-[11px] text-purple-900">
              ผู้พัฒนาระบบ
            </div>
            <p className="text-[11px] text-purple-800">
              {DEVELOPER_CREDIT.fullCredit}
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 bg-stone-50 border-t border-stone-200 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 text-xs font-semibold text-white bg-purple-800 hover:bg-purple-900 rounded-xl transition-colors font-prompt"
          >
            เข้าใจแล้ว
          </button>
        </div>
      </div>
    </div>
  );
};
