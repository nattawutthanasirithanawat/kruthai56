import React, { useState, useMemo } from 'react';
import {
  Search,
  Download,
  Eye,
  ShieldCheck,
  FolderOpen,
  Hash,
  User,
  AlertCircle,
  X,
  FileText,
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
  const [selectedProject, setSelectedProject] = useState<string>('all');
  const [searchMode, setSearchMode] = useState<'studentId' | 'name'>('studentId');
  const [queryInput, setQueryInput] = useState<string>('');
  const [hasSearched, setHasSearched] = useState<boolean>(false);

  // Extract unique project names from column 1 (ชื่อโครงการ)
  const projects = useMemo(() => {
    const set = new Set<string>();
    certificates.forEach((c) => {
      if (c.projectName && c.projectName.trim()) {
        set.add(c.projectName.trim());
      }
    });
    return Array.from(set);
  }, [certificates]);

  // Execute search filter
  const searchResults = useMemo(() => {
    if (!hasSearched) return [];

    const q = queryInput.trim().toLowerCase();
    if (!q) return [];

    return certificates.filter((cert) => {
      // 1. Filter by Project if selected
      if (selectedProject !== 'all' && cert.projectName !== selectedProject) {
        return false;
      }

      if (searchMode === 'studentId') {
        const certStudentId = (cert.studentId || '').toLowerCase().replace(/\s+/g, '');
        return certStudentId.includes(q.replace(/\s+/g, ''));
      } else {
        // Search by name or surname
        const certName = (cert.name || '').toLowerCase();
        const parts = certName.split(/\s+/).filter(Boolean);
        return certName.includes(q) || parts.some((p) => p.includes(q));
      }
    });
  }, [certificates, hasSearched, selectedProject, searchMode, queryInput]);

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
      <div className="bg-white rounded-2xl shadow-sm border border-purple-200/90 p-5 sm:p-7">
        <form onSubmit={handleSearchSubmit} className="space-y-5">
          <div className="border-b border-purple-100 pb-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h3 className="font-prompt font-semibold text-lg text-purple-950 flex items-center gap-2">
                <Search className="w-5 h-5 text-purple-800" />
                <span>ค้นหาเกียรติบัตร</span>
              </h3>
              <p className="text-xs text-stone-500 font-sarabun mt-0.5">
                เลือกโครงการ และเลือกวิธีค้นหาด้วยรหัสนักศึกษา หรือชื่อ-นามสกุล
              </p>
            </div>

            {/* Requirement 2: Search Mode Toggle */}
            <div className="inline-flex p-1 bg-purple-50 rounded-xl border border-purple-200 text-xs font-prompt">
              <button
                type="button"
                onClick={() => {
                  setSearchMode('studentId');
                  setHasSearched(false);
                }}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-semibold transition-all ${
                  searchMode === 'studentId'
                    ? 'bg-purple-800 text-white shadow-xs'
                    : 'text-purple-900 hover:text-purple-950'
                }`}
              >
                <Hash className="w-3.5 h-3.5" />
                <span>ค้นหาด้วยรหัสนักศึกษา</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setSearchMode('name');
                  setHasSearched(false);
                }}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-semibold transition-all ${
                  searchMode === 'name'
                    ? 'bg-purple-800 text-white shadow-xs'
                    : 'text-purple-900 hover:text-purple-950'
                }`}
              >
                <User className="w-3.5 h-3.5" />
                <span>ค้นหาด้วยชื่อ-นามสกุล</span>
              </button>
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
                className="w-full px-3.5 py-2.5 text-xs bg-purple-50/40 border border-purple-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-600 focus:bg-white text-stone-800 font-prompt truncate"
              >
                <option value="all">ทุกโครงการที่เปิดให้ดาวน์โหลด ({projects.length} โครงการ)</option>
                {projects.map((p) => (
                  <option key={p} value={p}>
                    {p}
                  </option>
                ))}
              </select>
            </div>

            {/* 2. Query Input (Dynamic by Mode) */}
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-stone-700 font-prompt flex items-center gap-1.5">
                {searchMode === 'studentId' ? (
                  <>
                    <Hash className="w-3.5 h-3.5 text-purple-700" />
                    <span>๒. กรอกรหัสนักศึกษา</span>
                  </>
                ) : (
                  <>
                    <User className="w-3.5 h-3.5 text-purple-700" />
                    <span>๒. กรอกชื่อ หรือ นามสกุล</span>
                  </>
                )}
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={queryInput}
                  onChange={(e) => setQueryInput(e.target.value)}
                  placeholder={
                    searchMode === 'studentId'
                      ? 'ระบุรหัสนักศึกษา เช่น 640610123'
                      : 'ระบุชื่อจริง หรือ นามสกุล เช่น ชนกนันท์ หรือ สิริวรพงศ์'
                  }
                  className={`w-full px-3.5 py-2.5 text-xs bg-purple-50/40 border border-purple-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-600 focus:bg-white text-stone-800 ${
                    searchMode === 'studentId' ? 'font-mono' : 'font-sarabun'
                  }`}
                />
                {queryInput && (
                  <button
                    type="button"
                    onClick={() => setQueryInput('')}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-stone-400 hover:text-stone-600"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Action Row */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
            <div className="flex items-center gap-2">
              <button
                type="submit"
                disabled={isLoading || !queryInput.trim()}
                className="inline-flex items-center gap-2 px-6 py-2.5 text-xs font-semibold text-white bg-gradient-to-r from-purple-800 to-indigo-800 hover:from-purple-900 hover:to-indigo-900 rounded-xl transition-all shadow-sm font-prompt disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Search className="w-4 h-4" />
                <span>ค้นหาเกียรติบัตร</span>
              </button>

              {hasSearched && (
                <button
                  type="button"
                  onClick={handleClear}
                  className="px-4 py-2.5 text-xs font-medium text-stone-600 hover:text-stone-900 hover:bg-stone-100 rounded-xl transition-colors font-prompt"
                >
                  ล้างการค้นหา
                </button>
              )}
            </div>

            {/* Quick Test Chips */}
            <div className="text-xs text-stone-400 font-sarabun flex items-center gap-2">
              <span>ตัวอย่าง:</span>
              <button
                type="button"
                onClick={() => {
                  setSearchMode('studentId');
                  setQueryInput('640610123');
                  setHasSearched(true);
                }}
                className="text-purple-800 hover:text-purple-950 font-mono underline"
              >
                640610123
              </button>
              <span>หรือ</span>
              <button
                type="button"
                onClick={() => {
                  setSearchMode('name');
                  setQueryInput('ชนกนันท์');
                  setHasSearched(true);
                }}
                className="text-purple-800 hover:text-purple-950 underline"
              >
                ชนกนันท์
              </button>
            </div>
          </div>
        </form>
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="text-center py-12 bg-white rounded-2xl border border-purple-200 shadow-sm space-y-3">
          <div className="w-8 h-8 border-3 border-purple-700 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-purple-900 font-prompt text-xs font-semibold">กำลังเชื่อมต่อข้อมูล...</p>
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
                        className="bg-white rounded-2xl border-2 border-purple-100 shadow-sm hover:border-purple-300 p-5 sm:p-6 flex flex-col justify-between hover:shadow-md transition-all relative overflow-hidden"
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

                          {/* Recipient Name & Student ID */}
                          <div className="pt-1">
                            <h4 className="text-xl font-bold font-prompt text-purple-950 leading-snug">
                              {cert.name}
                            </h4>
                            <div className="flex items-center gap-2 text-xs text-stone-500 font-mono mt-1">
                              <span className="font-semibold text-stone-700">รหัสนักศึกษา:</span>
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

                        {/* Requirement 4: Preview button and Download button */}
                        <div className="mt-5 pt-4 border-t border-purple-100 flex flex-wrap items-center justify-between gap-2">
                          <div className="flex items-center gap-1.5 text-xs text-purple-800 font-sarabun">
                            <ShieldCheck className="w-4 h-4 text-purple-700" />
                            <span>สาขาวิชาภาษาไทย ม.ศิลปากร</span>
                          </div>

                          <div className="flex items-center gap-2">
                            {/* Requirement 4: Preview Button (opens popup with download inside) */}
                            <button
                              type="button"
                              onClick={() => onOpenPdfViewer(cert)}
                              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-purple-900 bg-purple-100 hover:bg-purple-200 rounded-xl transition-colors font-prompt"
                            >
                              <Eye className="w-3.5 h-3.5 text-purple-800" />
                              <span>ดูตัวอย่างเกียรติบัตร</span>
                            </button>

                            {/* Direct Download Button */}
                            {cert.pdfUrl ? (
                              <a
                                href={formatted.download}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-purple-950 bg-amber-400 hover:bg-amber-300 rounded-xl transition-colors font-prompt shadow-xs"
                              >
                                <Download className="w-3.5 h-3.5 text-purple-950" />
                                <span>ดาวน์โหลด PDF</span>
                              </a>
                            ) : (
                              <span className="text-xs text-rose-500 font-sarabun">ไม่พบไฟล์ PDF</span>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ) : (
              /* No Search Results */
              <div className="text-center py-12 px-4 bg-white rounded-2xl border border-purple-200 shadow-sm space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-purple-50 border border-purple-200 flex items-center justify-center mx-auto text-purple-800">
                  <AlertCircle className="w-6 h-6" />
                </div>
                <h4 className="font-prompt font-semibold text-purple-950 text-base">
                  ไม่พบเกียรติบัตรตามเงื่อนไขที่ค้นหา
                </h4>
                <p className="text-xs text-stone-500 max-w-md mx-auto font-sarabun leading-relaxed">
                  กรุณาตรวจสอบความถูกต้องของ {searchMode === 'studentId' ? 'รหัสนักศึกษา' : 'ชื่อหรือนามสกุล'} หรือเลือกโครงการให้ตรงกับที่ท่านเข้าร่วม
                </p>
                <button
                  type="button"
                  onClick={handleClear}
                  className="px-4 py-2 text-xs font-semibold text-purple-900 bg-purple-100 hover:bg-purple-200 rounded-xl transition-colors font-prompt"
                >
                  ลองค้นหาใหม่อีกครั้ง
                </button>
              </div>
            )
          ) : (
            /* Requirement 1: Privacy Notice - No names shown by default */
            <div className="text-center py-12 px-6 bg-white/80 rounded-2xl border border-dashed border-purple-200 space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-purple-50 border border-purple-200 flex items-center justify-center mx-auto text-purple-800">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h4 className="font-prompt font-semibold text-purple-950 text-base">
                ระบบค้นหาและดาวน์โหลดเกียรติบัตร
              </h4>
              <p className="text-xs text-stone-500 max-w-lg mx-auto font-sarabun leading-relaxed">
                เพื่อความปลอดภัยและความเป็นส่วนตัว ระบบจะไม่แสดงรายชื่อทั้งหมดบนหน้าเว็บ กรุณาเลือกว่าต้องการค้นหาด้วยรหัสนักศึกษา หรือชื่อ-นามสกุล ในช่องด้านบนเพื่อแสดงเกียรติบัตรของท่าน
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
