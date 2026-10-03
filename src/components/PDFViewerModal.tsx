import React, { useState } from 'react';
import { X, Download, ExternalLink, ShieldCheck, FileText, AlertCircle, Eye, Sparkles } from 'lucide-react';
import { CertificateRecord } from '../types/certificate';
import { formatPdfLink } from '../services/googleSheets';

interface PDFViewerModalProps {
  certificate: CertificateRecord;
  onClose: () => void;
}

export const PDFViewerModal: React.FC<PDFViewerModalProps> = ({ certificate, onClose }) => {
  const [iframeError, setIframeError] = useState(false);
  const formatted = formatPdfLink(certificate.pdfUrl);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-purple-950/80 backdrop-blur-sm overflow-y-auto font-sarabun">
      <div className="relative w-full max-w-5xl bg-white border border-purple-200 rounded-2xl shadow-2xl flex flex-col my-auto max-h-[95vh] overflow-hidden text-stone-900">
        {/* Top Control Bar (Purple Elegance) */}
        <div className="flex items-center justify-between px-6 py-4 bg-gradient-to-r from-purple-950 via-purple-900 to-indigo-950 text-white">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-purple-800/60 border border-purple-400/40 flex items-center justify-center text-amber-300">
              <Eye className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-prompt font-semibold text-sm sm:text-base text-white">
                ตัวอย่างเกียรติบัตร: {certificate.name}
              </h3>
              <p className="text-xs text-purple-200">
                เลขที่: {certificate.studentId || '-'} · {certificate.projectName}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Requirement 4: Prominent Download Button inside Popup */}
            {certificate.pdfUrl && (
              <a
                href={formatted.download}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-purple-950 bg-amber-400 hover:bg-amber-300 rounded-xl transition-all font-prompt shadow-sm"
              >
                <Download className="w-4 h-4 text-purple-950" />
                <span>ดาวน์โหลดเกียรติบัตร (PDF)</span>
              </a>
            )}

            <button
              onClick={onClose}
              className="p-1.5 text-purple-200 hover:text-white hover:bg-purple-800/60 rounded-lg transition-colors ml-1"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Certificate Preview Body */}
        <div className="flex-1 min-h-[500px] max-h-[75vh] bg-purple-50/50 p-2 sm:p-4 flex items-center justify-center overflow-hidden">
          {certificate.pdfUrl ? (
            !iframeError ? (
              <iframe
                src={formatted.preview}
                title={`เกียรติบัตร ${certificate.name}`}
                className="w-full h-[650px] rounded-xl border border-purple-200 bg-white shadow-inner"
                onError={() => setIframeError(true)}
              />
            ) : (
              <div className="text-center p-8 space-y-4 max-w-md bg-white rounded-2xl border border-purple-200 shadow-md">
                <AlertCircle className="w-12 h-12 text-purple-800 mx-auto" />
                <h4 className="font-prompt font-semibold text-base text-purple-950">
                  ระบบไม่สามารถแสดงตัวอย่างภายในหน้าต่างนี้ได้
                </h4>
                <p className="text-xs text-stone-600 leading-relaxed">
                  เนื่องจากข้อจำกัดความปลอดภัยของเบราว์เซอร์สำหรับไฟล์ Google Drive ท่านสามารถกดปุ่มเปิดดูหรือดาวน์โหลดได้โดยตรงที่ปุ่มด้านล่าง
                </p>
                <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-2">
                  <a
                    href={certificate.pdfUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2.5 text-xs font-semibold text-purple-900 bg-purple-100 hover:bg-purple-200 rounded-xl transition-colors font-prompt"
                  >
                    <ExternalLink className="w-4 h-4" />
                    <span>เปิดในแท็บใหม่</span>
                  </a>
                  <a
                    href={formatted.download}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 text-xs font-bold text-purple-950 bg-amber-400 hover:bg-amber-300 rounded-xl transition-colors font-prompt shadow-sm"
                  >
                    <Download className="w-4 h-4" />
                    <span>ดาวน์โหลด PDF</span>
                  </a>
                </div>
              </div>
            )
          ) : (
            <div className="text-center p-8 space-y-3 bg-white rounded-2xl border border-purple-100 p-6">
              <FileText className="w-12 h-12 text-stone-400 mx-auto" />
              <p className="text-xs text-stone-600 font-prompt">
                ไม่พบข้อมูลลิงก์ PDF สำหรับรายการนี้ในฐานข้อมูล
              </p>
            </div>
          )}
        </div>

        {/* Footer info in Modal */}
        <div className="px-6 py-3.5 bg-purple-50/80 border-t border-purple-200 flex flex-wrap items-center justify-between gap-3 text-xs text-stone-600">
          <div className="flex items-center gap-1.5 text-purple-900 font-semibold font-prompt">
            <ShieldCheck className="w-4 h-4 text-purple-700" />
            <span>สาขาวิชาภาษาไทย คณะศึกษาศาสตร์ มหาวิทยาลัยศิลปากร</span>
          </div>

          <div className="flex items-center gap-2">
            {certificate.pdfUrl && (
              <a
                href={formatted.download}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-4 py-1.5 text-xs font-bold text-white bg-purple-800 hover:bg-purple-900 rounded-lg transition-colors font-prompt shadow-xs"
              >
                <Download className="w-3.5 h-3.5" />
                <span>ดาวน์โหลดเกียรติบัตรทันที</span>
              </a>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
