import React, { useState, useMemo } from 'react';
import {
  Search,
  Download,
  Eye,
  FolderOpen,
  User,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  ExternalLink,
} from 'lucide-react';
import { CertificateRecord } from '../types/certificate';
import { formatPdfLink } from '../services/googleSheets';

interface SearchCertificateProps {
  certificates: CertificateRecord[];
  onOpenPdfViewer: (cert: CertificateRecord) => void;
  isLoading: boolean;
}

export const SearchCertificate: React.FC<SearchCertificateProps> = ({
  certificates,
  onOpenPdfViewer,
  isLoading,
}) => {
  // Query Input (Exclusively by Name as per Requirement 1)
  const [queryInput, setQueryInput] = useState('');
  const [selectedProject, setSelectedProject] = useState('all');
  const [hasSearched, setHasSearched] = useState(false);

  // Extract distinct list of project names for dropdown
  const projectOptions = useMemo(() => {
    const set = new Set<string>();
    certificates.forEach((c) => {
      if (c.projectName?.trim()) {
        set.add(c.projectName.trim());
      }
    });
    return Array.from(set);
  }, [certificates]);

  // Privacy Protection Filter:
  // Requires explicit search query, filtered strictly by recipient name
  const searchResults = useMemo(() => {
    if (!hasSearched || !queryInput.trim()) return [];

    const q = queryInput.trim().toLowerCase();

    return certificates.filter((cert) => {
      // 1. Project Filter
      if (selectedProject !== 'all' && cert.projectName !== selectedProject) {
        return false;
      }

      // 2. Search exclusively by Name / Surname (Requirement 1)
      const certName = (cert.name || '').toLowerCase();
      const parts = certName.split(/\s+/).filter(Boolean);
      return certName.includes(q) || parts.some((p) => p.includes(q));
    });
  }, [certificates, hasSearched, selectedProject, queryInput]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!queryInput.trim()) return;
    setHasSearched(true);
  };

  const handleClear = () => {
    setQueryInput('');
    setSelectedProject('all');
    setHasSearched(false);
  };

  return (
    <div className="space-y-6">
      {/* Search & Project Selection Card (Purple Theme) */}
      <div className="bg-white rounded-3xl shadow-sm border border-purple-200/90 p-5 sm:p-7">
        <form onSubmit={handleSearchSubmit} className="space-y-5">
          <div className="border-b border-purple-100 pb-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h3 className="font-prompt font-semibold text-lg text-purple-950 flex items-center gap-2">
                <Search className="w-5 h-5 text-purple-800" />
                <span>ค้นหาเกียรติบัตรด้วยชื่อ-นามสกุล</span>
              </h3>
              <p className="text-xs text-stone-500 font-sarabun mt-0.5">
                เลือกโครงการ และกรอกชื่อ หรือนามสกุล เพื่อค้นหาเกียรติบัตรของท่าน
              </p>
            </div>

            <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-purple-50 rounded-xl border border-purple-200 text-xs font-prompt text-purple-900 font-semibold">
              <User className="w-3.5 h-3.5 text-purple-700" />
              <span>ค้นหาด้วยชื่อ-นามสกุล</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* 1. Project Selector */}
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-stone-700 font-prompt flex items-center gap-1.5">
                <FolderOpen className="w-3.5 h-3.5 text-purple-700" />
                <span>๑. เลือกโครงการที่ต้องการดาวน์โหลด</span>
              </label>
              <select
                value={selectedProject}
                onChange={(e) => {
                  setSelectedProject(e.target.value);
                  if (hasSearched) setHasSearched(true);
                }}
                className="w-full px-3.5 py-2.5 bg-purple-50/40 border border-purple-200 rounded-xl text-stone-800 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-purple-600 focus:bg-white font-prompt transition-all"
              >
                <option value="all">ทุกโครงการ ({certificates.length} รายการ)</option>
                {projectOptions.map((p) => (
                  <option key={p} value={p}>
                    {p}
                  </option>
                ))}
              </select>
            </div>

            {/* 2. Search by Name (Requirement 1: Exclusively Name Search) */}
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-stone-700 font-prompt flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-purple-700" />
                <span>๒. กรอกชื่อ หรือ นามสกุล ผู้รับเกียรติบัตร</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-purple-700">
                  <User className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  value={queryInput}
                  onChange={(e) => {
                    setQueryInput(e.target.value);
                    if (hasSearched) setHasSearched(false);
                  }}
                  placeholder="กรอกชื่อ หรือ นามสกุล เช่น กมลวรรณ หรือ กัลย์สุดา"
                  className="w-full pl-10 pr-4 py-2.5 bg-purple-50/40 border border-purple-200 rounded-xl text-stone-900 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-purple-600 focus:bg-white transition-all font-sarabun"
                  required
                />
              </div>
            </div>
          </div>

          {/* Action Buttons & Quick Sample Chips */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
            <div className="flex items-center gap-2">
              <button
                type="submit"
                className="inline-flex items-center gap-2 px-6 py-2.5 text-xs sm:text-sm font-semibold text-white bg-gradient-to-r from-purple-800 to-indigo-800 hover:from-purple-900 hover:to-indigo-900 rounded-xl transition-all font-prompt shadow-md shadow-purple-900/10 active:scale-98"
              >
                <Search className="w-4 h-4" />
                <span>ค้นหาเกียรติบัตร</span>
              </button>

              {(hasSearched || queryInput) && (
                <button
                  type="button"
                  onClick={handleClear}
                  className="px-4 py-2.5 text-xs sm:text-sm font-medium text-stone-600 hover:text-stone-900 hover:bg-stone-100 rounded-xl transition-colors font-prompt"
                >
                  ล้างค่า
                </button>
              )}
            </div>

            {/* Quick Test Chips for user convenience */}
            <div className="flex items-center gap-1.5 text-xs text-stone-500 font-sarabun">
              <span>ตัวอย่างชื่อ:</span>
              <button
                type="button"
                onClick={() => {
                  setQueryInput('กมลวรรณ');
                  setHasSearched(true);
                }}
                className="text-purple-800 hover:text-purple-950 underline font-medium"
              >
                กมลวรรณ
              </button>
              <span>·</span>
              <button
                type="button"
                onClick={() => {
                  setQueryInput('กัลย์สุดา');
                  setHasSearched(true);
                }}
                className="text-purple-800 hover:text-purple-950 underline font-medium"
              >
                กัลย์สุดา
              </button>
              <span>·</span>
              <button
                type="button"
                onClick={() => {
                  setQueryInput('เกริกไกร');
                  setHasSearched(true);
                }}
                className="text-purple-800 hover:text-purple-950 underline font-medium"
              >
                เกริกไกร
              </button>
            </div>
          </div>
        </form>
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="text-center py-12 bg-white rounded-3xl border border-purple-200 shadow-sm space-y-3">
          <div className="w-8 h-8 border-3 border-purple-700 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-purple-900 font-prompt text-xs font-semibold">กำลังเชื่อมต่อข้อมูลจากฐานข้อมูล...</p>
        </div>
      )}

      {/* SEARCH RESULTS SECTION */}
      {!isLoading && (
        <div>
          {hasSearched ? (
            searchResults.length > 0 ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between text-xs text-purple-900 font-sarabun px-1">
                  <span>
                    พบเกียรติบัตรที่ตรงกัน <strong className="font-bold text-purple-950">{searchResults.length}</strong> ฉบับ
                  </span>
                  <span className="text-stone-400">ท่านสามารถกดดูตัวอย่างก่อนดาวน์โหลดได้</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {searchResults.map((cert) => {
                    const formatted = formatPdfLink(cert.pdfUrl);
                    return (
                      <div
                        key={cert.id}
                        className="bg-white rounded-3xl border-2 border-purple-100 shadow-sm hover:border-purple-300 p-5 sm:p-6 flex flex-col justify-between hover:shadow-md transition-all relative overflow-hidden"
                      >
                        {/* Purple gradient top bar */}
                        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-purple-800 via-indigo-700 to-purple-800" />

                        <div className="space-y-3">
                          {/* Project Name */}
                          <div className="flex items-start justify-between gap-2">
                            <span className="text-xs font-semibold text-purple-900 bg-purple-50 px-2.5 py-1 rounded-md border border-purple-200 font-prompt leading-tight">
                              {cert.projectName}
                            </span>
                          </div>

                          {/* Recipient Name & เลขกำกับเกียรติบัตร (Requirement 2) */}
                          <div className="pt-1">
                            <h4 className="text-xl font-bold font-prompt text-purple-950 leading-snug">
                              {cert.name}
                            </h4>
                            <div className="flex items-center gap-2 text-xs text-stone-500 font-mono mt-1.5">
                              {/* Requirement 2: เปลี่ยนเป็น "เลขที่" */}
                              <span className="font-semibold text-stone-700 font-sarabun">เลขที่:</span>
                              <span className="bg-purple-50 text-purple-900 px-2 py-0.5 rounded font-bold border border-purple-200">
                                {cert.studentId || 'ไม่ระบุ'}
                              </span>
                            </div>
                          </div>

                          {/* Role / Description if present */}
                          {cert.role && (
                            <p className="text-xs text-stone-600 font-sarabun bg-stone-50 p-2.5 rounded-lg border border-stone-100">
                              {cert.role}
                            </p>
                          )}
                        </div>

                        {/* Preview and Download Buttons */}
                        <div className="mt-5 pt-4 border-t border-purple-100 flex flex-wrap items-center justify-between gap-2">
                          <div className="flex items-center gap-1.5 text-xs text-purple-800 font-sarabun">
                            <ShieldCheck className="w-4 h-4 text-purple-700" />
                            <span>สาขาวิชาภาษาไทย ม.ศิลปากร</span>
                          </div>

                          <div className="flex items-center gap-2">
                            {/* Preview Button */}
                            <button
                              type="button"
                              onClick={() => onOpenPdfViewer(cert)}
                              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-purple-900 bg-purple-100 hover:bg-purple-200 rounded-xl transition-colors font-prompt"
                            >
                              <Eye className="w-3.5 h-3.5 text-purple-800" />
                              <span>ดูตัวอย่างเกียรติบัตร</span>
                            </button>

                            {/* Prominent Direct Download Button */}
                            {cert.pdfUrl && (
                              <a
                                href={formatted.download}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-purple-950 bg-amber-400 hover:bg-amber-300 rounded-xl transition-all font-prompt shadow-sm shadow-amber-400/20 active:scale-98"
                              >
                                <Download className="w-3.5 h-3.5 text-purple-950" />
                                <span>ดาวน์โหลด PDF</span>
                              </a>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ) : (
              /* No Results Notification */
              <div className="p-8 text-center bg-white rounded-3xl border border-dashed border-purple-300 shadow-xs space-y-3">
                <div className="w-12 h-12 rounded-full bg-purple-50 text-purple-800 flex items-center justify-center mx-auto">
                  <AlertCircle className="w-6 h-6" />
                </div>
                <div className="space-y-1">
                  <h4 className="font-prompt font-semibold text-base text-purple-950">
                    ไม่พบข้อมูลเกียรติบัตรตามชื่อที่ค้นหา
                  </h4>
                  <p className="text-xs text-stone-500 max-w-md mx-auto font-sarabun leading-relaxed">
                    กรุณาตรวจสอบการสะกดชื่อ-นามสกุล หรือลองค้นหาด้วยชื่อจริงเพียงอย่างเดียว
                    หากยังไม่พบ ท่านสามารถคลิกเมนู <strong>"บริการยื่นคำร้องออนไลน์"</strong> ที่แถบด้านบน เพื่อยื่นขอรับการตรวจสอบ
                  </p>
                </div>
              </div>
            )
          ) : (
            /* Privacy Initial State Banner */
            <div className="p-6 bg-purple-50/50 rounded-3xl border border-purple-200/80 text-center space-y-2">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white text-purple-900 border border-purple-200 text-xs font-semibold font-prompt shadow-2xs">
                <ShieldCheck className="w-3.5 h-3.5 text-purple-700" />
                <span>นโยบายคุ้มครองข้อมูลส่วนบุคคล</span>
              </div>
              <p className="text-xs text-stone-600 max-w-lg mx-auto font-sarabun leading-relaxed">
                เพื่อความปลอดภัยของข้อมูล ระบบจะไม่แสดงรายชื่อทั้งหมดบนหน้าเว็บไซต์สาธารณะ
                กรุณาระบุชื่อ-นามสกุลในช่องค้นหาด้านบน เพื่อแสดงเกียรติบัตรของท่าน
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
