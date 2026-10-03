import React, { useState, useMemo } from 'react';
import {
  FileEdit,
  Send,
  Search,
  CheckCircle2,
  Clock,
  AlertCircle,
  Copy,
  Check,
  FolderOpen,
  User,
  Hash,
  Phone,
  Eye,
  X,
  Sparkles,
  ArrowLeft,
  ShieldCheck,
} from 'lucide-react';
import { CorrectionRequest, RequestStatus } from '../types/certificate';
import {
  addCorrectionRequest,
  getCorrectionRequests,
} from '../services/requestService';

interface CorrectionRequestPageProps {
  availableProjects: string[];
  onBackToHome: () => void;
  onRequestSubmitted?: () => void;
}

const STATUS_STEPS: RequestStatus[] = [
  'ยื่นคำขอแล้ว',
  'แอดมินรับคำขอ',
  'กำลังดำเนินการ',
  'เสร็จสิ้น แก้ไขแล้ว',
];

export const CorrectionRequestPage: React.FC<CorrectionRequestPageProps> = ({
  availableProjects,
  onBackToHome,
  onRequestSubmitted,
}) => {
  // Active Tab: 'form' | 'tracking'
  const [activeTab, setActiveTab] = useState<'form' | 'tracking'>('form');

  // Preview Confirmation Modal
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);

  // Form Fields (Note: "เลขที่")
  const [selectedProject, setSelectedProject] = useState('');
  const [certificateRefNo, setCertificateRefNo] = useState('');
  const [originalName, setOriginalName] = useState('');
  const [correctedName, setCorrectedName] = useState('');
  const [contactInfo, setContactInfo] = useState('');
  const [reason, setReason] = useState('');

  // Newly Created Request after Submission
  const [newlyCreatedRequest, setNewlyCreatedRequest] = useState<CorrectionRequest | null>(null);
  const [copiedTracking, setCopiedTracking] = useState(false);

  // Tracking Query State
  const [trackingQuery, setTrackingQuery] = useState('');
  const [searchedRequest, setSearchedRequest] = useState<CorrectionRequest | null | 'not_found'>(null);

  const projectsList = useMemo(() => {
    return availableProjects.length > 0
      ? availableProjects
      : ['แรกพี่พบน้อง คล้องสายสัมพันธ์เอกไทย 2569'];
  }, [availableProjects]);

  // Review / Check data before final submit
  const handleVerifyClick = (e: React.FormEvent) => {
    e.preventDefault();
    const proj = selectedProject || projectsList[0];
    if (!proj || !correctedName.trim()) {
      alert('กรุณาเลือกโครงการและกรอกชื่อที่ถูกต้องเพื่อแก้ไข');
      return;
    }
    setIsPreviewOpen(true);
  };

  // Final Submit
  const handleFinalSubmit = () => {
    const proj = selectedProject || projectsList[0];
    const created = addCorrectionRequest({
      projectName: proj,
      studentId: certificateRefNo.trim(), // Stored as reference identifier (เลขที่)
      originalName: originalName.trim(),
      correctedName: correctedName.trim(),
      contactInfo: contactInfo.trim(),
      reason: reason.trim(),
    });

    setIsPreviewOpen(false);
    setNewlyCreatedRequest(created);

    // Switch to tracking tab to show user immediately
    setActiveTab('tracking');
    setTrackingQuery(created.trackingNumber);
    setSearchedRequest(created);

    // Reset Form fields
    setSelectedProject('');
    setCertificateRefNo('');
    setOriginalName('');
    setCorrectedName('');
    setContactInfo('');
    setReason('');

    if (onRequestSubmitted) {
      onRequestSubmitted();
    }
  };

  // Tracking Search
  const handleSearchTracking = (e: React.FormEvent) => {
    e.preventDefault();
    const q = trackingQuery.trim().toLowerCase();
    if (!q) return;

    const allRequests = getCorrectionRequests();
    const found = allRequests.find(
      (r) =>
        r.trackingNumber.toLowerCase() === q ||
        (r.studentId && r.studentId.toLowerCase() === q)
    );

    setSearchedRequest(found || 'not_found');
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedTracking(true);
    setTimeout(() => setCopiedTracking(false), 2000);
  };

  return (
    <div className="space-y-6 font-sarabun pb-12 animate-in fade-in duration-300">
      {/* Top Navigation Header for this Dedicated Page */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 sm:p-6 rounded-3xl border border-purple-200/90 shadow-sm">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onBackToHome}
            className="p-2.5 rounded-2xl bg-purple-50 hover:bg-purple-100 text-purple-900 border border-purple-200 transition-colors"
            title="กลับสู่หน้าค้นหาเกียรติบัตร"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-purple-800 bg-purple-100/70 px-2.5 py-0.5 rounded-full font-prompt">
                หน้าบริการออนไลน์
              </span>
              <span className="text-xs text-stone-400">·</span>
              <span className="text-xs text-stone-500 font-prompt">สาขาวิชาภาษาไทย ม.ศิลปากร</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold font-prompt text-purple-950 mt-0.5">
              บริการยื่นคำร้องออนไลน์
            </h1>
          </div>
        </div>

        <button
          type="button"
          onClick={onBackToHome}
          className="inline-flex items-center gap-2 px-4 py-2.5 text-xs font-semibold text-purple-900 bg-purple-50 hover:bg-purple-100 border border-purple-200 rounded-xl transition-colors font-prompt self-start sm:self-auto"
        >
          <Search className="w-3.5 h-3.5 text-purple-700" />
          <span>กลับสู่หน้าค้นหาเกียรติบัตร</span>
        </button>
      </div>

      {/* Main Request Service Container */}
      <div className="bg-white rounded-3xl border border-purple-200 shadow-sm overflow-hidden">
        {/* Navigation Tabs */}
        <div className="flex items-center border-b border-purple-100 bg-purple-50/60 px-6 pt-3">
          <button
            type="button"
            onClick={() => setActiveTab('form')}
            className={`flex items-center gap-2 px-6 py-3.5 text-xs sm:text-sm font-semibold font-prompt border-b-2 transition-colors ${
              activeTab === 'form'
                ? 'border-purple-800 text-purple-950 bg-white rounded-t-2xl shadow-xs'
                : 'border-transparent text-stone-600 hover:text-purple-800'
            }`}
          >
            <FileEdit className="w-4 h-4 text-purple-700" />
            <span>ยื่นคำร้องขอแก้ไขเกียรติบัตร</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('tracking')}
            className={`flex items-center gap-2 px-6 py-3.5 text-xs sm:text-sm font-semibold font-prompt border-b-2 transition-colors ${
              activeTab === 'tracking'
                ? 'border-purple-800 text-purple-950 bg-white rounded-t-2xl shadow-xs'
                : 'border-transparent text-stone-600 hover:text-purple-800'
            }`}
          >
            <Clock className="w-4 h-4 text-purple-700" />
            <span>ติดตามสถานะคำร้อง (๔ ขั้นตอน)</span>
          </button>
        </div>

        {/* Content Area */}
        <div className="p-6 sm:p-8">
          {/* TAB 1: FORM */}
          {activeTab === 'form' && (
            <div className="max-w-3xl mx-auto space-y-6">
              <div className="bg-gradient-to-r from-purple-50 via-purple-50/60 to-indigo-50/40 border border-purple-200/80 rounded-2xl p-5 text-xs text-purple-950 space-y-1.5">
                <div className="font-bold font-prompt text-purple-950 text-sm flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-amber-500" />
                  <span>คำแนะนำการยื่นคำร้องขอแก้ไขข้อมูล</span>
                </div>
                <p className="text-stone-600 leading-relaxed text-xs sm:text-sm">
                  หากพบว่าชื่อ-นามสกุล ตัวสะกด หรือข้อมูลในเกียรติบัตรไม่ถูกต้อง ท่านสามารถกรอกแบบฟอร์มนี้เพื่อส่งเรื่องให้ผู้ดูแลระบบแก้ไขได้ โดยระบบจะออกเลขติดตามคำร้องอัตโนมัติทันที
                </p>
              </div>

              <form onSubmit={handleVerifyClick} className="space-y-5 text-xs sm:text-sm">
                {/* 1. เลือกข้อมูลโครงการที่ประสงค์แก้ไข */}
                <div className="space-y-1.5">
                  <label className="font-semibold text-stone-800 font-prompt flex items-center gap-1.5">
                    <FolderOpen className="w-4 h-4 text-purple-700" />
                    <span>๑. เลือกข้อมูลโครงการที่ประสงค์แก้ไข <span className="text-rose-600">*</span></span>
                  </label>
                  <select
                    value={selectedProject || projectsList[0]}
                    onChange={(e) => setSelectedProject(e.target.value)}
                    className="w-full px-4 py-3 bg-purple-50/40 border border-purple-200 rounded-xl focus:ring-2 focus:ring-purple-600 text-stone-900 font-prompt text-xs sm:text-sm"
                    required
                  >
                    {projectsList.map((p) => (
                      <option key={p} value={p}>
                        {p}
                      </option>
                    ))}
                  </select>
                </div>

                {/* 2. เลขที่ */}
                <div className="space-y-1.5">
                  <label className="font-semibold text-stone-800 font-prompt flex items-center gap-1.5">
                    <Hash className="w-4 h-4 text-purple-700" />
                    <span>๒. เลขที่</span>
                  </label>
                  <input
                    type="text"
                    value={certificateRefNo}
                    onChange={(e) => setCertificateRefNo(e.target.value)}
                    placeholder="เช่น 690610001 (เลขที่ที่แสดงในระบบ)"
                    className="w-full px-4 py-3 bg-purple-50/40 border border-purple-200 rounded-xl focus:ring-2 focus:ring-purple-600 text-stone-900 font-mono text-xs sm:text-sm"
                  />
                </div>

                {/* 3. ชื่อเดิมที่แสดงในระบบ */}
                <div className="space-y-1.5">
                  <label className="font-semibold text-stone-800 font-prompt flex items-center gap-1.5">
                    <User className="w-4 h-4 text-purple-700" />
                    <span>๓. ชื่อเดิมที่แสดงในระบบ (ถ้ามี)</span>
                  </label>
                  <input
                    type="text"
                    value={originalName}
                    onChange={(e) => setOriginalName(e.target.value)}
                    placeholder="เช่น นางสาวกมลวรรณ (สะกดผิด)"
                    className="w-full px-4 py-3 bg-purple-50/40 border border-purple-200 rounded-xl focus:ring-2 focus:ring-purple-600 text-stone-900 text-xs sm:text-sm"
                  />
                </div>

                {/* 4. กรอกชื่อที่ถูกต้องเพื่อแก้ไข */}
                <div className="space-y-1.5">
                  <label className="font-semibold text-stone-800 font-prompt flex items-center gap-1.5">
                    <User className="w-4 h-4 text-purple-700" />
                    <span>๔. กรอกชื่อที่ถูกต้องเพื่อแก้ไข <span className="text-rose-600">*</span></span>
                  </label>
                  <input
                    type="text"
                    value={correctedName}
                    onChange={(e) => setCorrectedName(e.target.value)}
                    placeholder="กรอกชื่อ-นามสกุลที่ถูกต้องตามบัตรประชาชน เช่น นางสาวกมลวรรณ อินศรีทองสงค์"
                    className="w-full px-4 py-3 bg-purple-50/40 border border-purple-200 rounded-xl focus:ring-2 focus:ring-purple-600 text-stone-900 font-medium text-xs sm:text-sm"
                    required
                  />
                </div>

                {/* 5. เบอร์โทรศัพท์ หรือช่องทางติดต่อ */}
                <div className="space-y-1.5">
                  <label className="font-semibold text-stone-800 font-prompt flex items-center gap-1.5">
                    <Phone className="w-4 h-4 text-purple-700" />
                    <span>๕. เบอร์โทรศัพท์ หรือ อีเมล สำหรับติดต่อ</span>
                  </label>
                  <input
                    type="text"
                    value={contactInfo}
                    onChange={(e) => setContactInfo(e.target.value)}
                    placeholder="เช่น 081-xxx-xxxx หรือ email@example.com"
                    className="w-full px-4 py-3 bg-purple-50/40 border border-purple-200 rounded-xl focus:ring-2 focus:ring-purple-600 text-stone-900 text-xs sm:text-sm"
                  />
                </div>

                {/* 6. รายละเอียดเพิ่มเติม */}
                <div className="space-y-1.5">
                  <label className="font-semibold text-stone-800 font-prompt">
                    ๖. รายละเอียดเพิ่มเติมที่ต้องการแก้ไข
                  </label>
                  <textarea
                    rows={3}
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    placeholder="ระบุ เช่น ตัวสะกดผิด หรือ ขอแก้ไขคำนำหน้าชื่อ"
                    className="w-full px-4 py-3 bg-purple-50/40 border border-purple-200 rounded-xl focus:ring-2 focus:ring-purple-600 text-stone-900 text-xs sm:text-sm"
                  />
                </div>

                {/* Action buttons */}
                <div className="flex items-center justify-end gap-3 pt-4 border-t border-purple-100">
                  <button
                    type="button"
                    onClick={onBackToHome}
                    className="px-5 py-2.5 text-stone-600 hover:bg-stone-100 rounded-xl font-prompt text-xs sm:text-sm"
                  >
                    ยกเลิก / กลับ
                  </button>
                  <button
                    type="submit"
                    className="inline-flex items-center gap-2 px-7 py-3 bg-purple-800 hover:bg-purple-900 text-white rounded-xl font-bold font-prompt shadow-md transition-all text-xs sm:text-sm active:scale-98"
                  >
                    <Eye className="w-4 h-4" />
                    <span>ตรวจสอบข้อมูล</span>
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* TAB 2: TRACKING */}
          {activeTab === 'tracking' && (
            <div className="max-w-3xl mx-auto space-y-6">
              {/* Newly Created Success Banner */}
              {newlyCreatedRequest && (
                <div className="p-5 bg-emerald-50 border-2 border-emerald-300 rounded-3xl text-emerald-950 space-y-3 shadow-sm">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <CheckCircle2 className="w-6 h-6 text-emerald-600 shrink-0" />
                      <div>
                        <h4 className="font-prompt font-bold text-sm sm:text-base text-emerald-900">
                          ยื่นคำร้องสำเร็จเรียบร้อยแล้ว!
                        </h4>
                        <p className="text-xs text-emerald-800">
                          ระบบออกเลขติดตามคำร้องอัตโนมัติ กรุณาบันทึกเลขนี้ไว้
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 bg-white px-3.5 py-2 rounded-xl border border-emerald-300 shadow-xs self-start sm:self-auto">
                      <span className="font-mono font-bold text-base text-purple-950">
                        {newlyCreatedRequest.trackingNumber}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleCopy(newlyCreatedRequest.trackingNumber)}
                        className="p-1.5 hover:bg-emerald-100 rounded-lg text-emerald-700 transition-colors"
                        title="คัดลอกเลขติดตาม"
                      >
                        {copiedTracking ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Tracking Form */}
              <div className="space-y-2">
                <label className="text-xs sm:text-sm font-semibold text-stone-800 font-prompt">
                  ค้นหาคำร้องด้วยเลขติดตามคำร้อง หรือ เลขที่:
                </label>
                <form onSubmit={handleSearchTracking} className="flex gap-2">
                  <div className="relative flex-1">
                    <Search className="w-4 h-4 absolute left-3.5 top-3.5 text-purple-700" />
                    <input
                      type="text"
                      value={trackingQuery}
                      onChange={(e) => setTrackingQuery(e.target.value)}
                      placeholder="กรอกเลขคำร้อง เช่น REQ-67-001 หรือ เลขที่"
                      className="w-full pl-10 pr-4 py-3 text-xs sm:text-sm bg-purple-50/40 border border-purple-200 rounded-xl focus:ring-2 focus:ring-purple-600 font-mono text-stone-900"
                    />
                  </div>
                  <button
                    type="submit"
                    className="px-6 py-3 bg-purple-800 hover:bg-purple-900 text-white rounded-xl text-xs sm:text-sm font-bold font-prompt transition-colors shadow-xs whitespace-nowrap active:scale-98"
                  >
                    ค้นหาสถานะ
                  </button>
                </form>
              </div>

              {/* Tracking Result View */}
              {searchedRequest && (
                <div>
                  {searchedRequest === 'not_found' ? (
                    <div className="p-5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs sm:text-sm flex items-center gap-3">
                      <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
                      <span>ไม่พบข้อมูลคำร้องจากเลขที่ค้นหา กรุณาตรวจสอบความถูกต้องอีกครั้ง</span>
                    </div>
                  ) : (
                    <div className="bg-purple-50/60 rounded-3xl border border-purple-200 p-6 space-y-6">
                      {/* Top info */}
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-purple-200">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="font-mono font-bold text-sm text-purple-950 bg-white px-3 py-1 rounded-lg border border-purple-200 shadow-2xs">
                              {searchedRequest.trackingNumber}
                            </span>
                            <span className="text-xs text-stone-500">
                              ยื่นเมื่อ: {searchedRequest.submittedAt}
                            </span>
                          </div>
                          <h5 className="font-prompt font-bold text-base sm:text-lg text-purple-950">
                            {searchedRequest.projectName}
                          </h5>
                        </div>

                        <div>
                          <div className="font-prompt font-bold text-sm text-purple-900 bg-white px-4 py-1.5 rounded-xl border border-purple-300 shadow-xs">
                            {searchedRequest.status}
                          </div>
                        </div>
                      </div>

                      {/* 4 Status Stepper */}
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                        {STATUS_STEPS.map((step, idx) => {
                          const currentIdx = STATUS_STEPS.indexOf(searchedRequest.status);
                          const isCompleted = idx <= currentIdx;
                          const isCurrent = idx === currentIdx;

                          return (
                            <div
                              key={step}
                              className={`p-3.5 rounded-2xl border text-center transition-all ${
                                isCurrent
                                  ? 'bg-purple-800 text-white border-purple-900 shadow-md scale-102'
                                  : isCompleted
                                  ? 'bg-white text-purple-950 border-purple-300 font-semibold shadow-2xs'
                                  : 'bg-stone-50/70 text-stone-400 border-stone-200'
                              }`}
                            >
                              <div className="text-[10px] uppercase font-mono opacity-80 mb-0.5">
                                ขั้นที่ {idx + 1}
                              </div>
                              <div className="text-xs sm:text-sm font-bold font-prompt leading-tight">
                                {step}
                              </div>
                            </div>
                          );
                        })}
                      </div>

                      {/* Details */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs sm:text-sm bg-white p-5 rounded-2xl border border-purple-100">
                        <div>
                          <span className="text-stone-500">เลขที่: </span>
                          <span className="font-mono font-bold text-stone-900">{searchedRequest.studentId || '-'}</span>
                        </div>
                        <div>
                          <span className="text-stone-500">ชื่อเดิมในระบบ: </span>
                          <span className="text-stone-700">{searchedRequest.originalName || '-'}</span>
                        </div>
                        <div>
                          <span className="text-stone-500 font-semibold text-purple-900">ชื่อที่ถูกต้องเพื่อแก้ไข: </span>
                          <strong className="text-purple-950 font-bold text-base">{searchedRequest.correctedName}</strong>
                        </div>
                        <div>
                          <span className="text-stone-500">อัปเดตสถานะล่าสุด: </span>
                          <span className="text-stone-700">{searchedRequest.updatedAt}</span>
                        </div>
                        {searchedRequest.adminNotes && (
                          <div className="sm:col-span-2 pt-3 border-t border-stone-100">
                            <span className="font-bold text-purple-900">ข้อความจากแอดมิน: </span>
                            <span className="text-stone-700 italic">{searchedRequest.adminNotes}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* VERIFY / PREVIEW MODAL */}
      {isPreviewOpen && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-3 sm:p-6 bg-purple-950/80 backdrop-blur-sm overflow-y-auto">
          <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-purple-200 overflow-hidden my-auto">
            <div className="px-6 py-4 bg-purple-900 text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-amber-300" />
                <h4 className="font-prompt font-bold text-base">
                  ตรวจสอบความถูกต้องของข้อมูล
                </h4>
              </div>
              <button
                type="button"
                onClick={() => setIsPreviewOpen(false)}
                className="p-1 text-purple-200 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4 text-xs sm:text-sm">
              <p className="text-stone-500 text-xs">
                กรุณาตรวจสอบข้อมูลด้านล่างให้ถูกต้องก่อนกดยืนยันบันทึกข้อมูลเข้าสู่ระบบ
              </p>

              <div className="bg-purple-50/70 p-4 rounded-2xl border border-purple-200 space-y-2.5">
                <div>
                  <span className="text-stone-500 block text-xs">โครงการที่ประสงค์แก้ไข:</span>
                  <strong className="text-purple-950 font-bold text-sm font-prompt">
                    {selectedProject || projectsList[0]}
                  </strong>
                </div>

                <div className="grid grid-cols-2 gap-2 pt-1 border-t border-purple-100 text-xs">
                  <div>
                    <span className="text-stone-500 block">เลขที่:</span>
                    <span className="font-mono font-bold text-stone-800">{certificateRefNo || '-'}</span>
                  </div>
                  <div>
                    <span className="text-stone-500 block">ช่องทางติดต่อ:</span>
                    <span className="text-stone-800">{contactInfo || '-'}</span>
                  </div>
                </div>

                <div className="pt-2 border-t border-purple-100 text-xs">
                  <span className="text-stone-500 block">ชื่อเดิม:</span>
                  <span className="text-stone-700 line-through">{originalName || '(ไม่ระบุ)'}</span>
                </div>

                <div className="pt-1 bg-white p-3 rounded-xl border border-purple-200">
                  <span className="text-purple-700 font-bold block text-xs">ชื่อที่ถูกต้องเพื่อแก้ไข:</span>
                  <span className="text-purple-950 font-bold text-base font-prompt">{correctedName}</span>
                </div>

                {reason && (
                  <div className="pt-1 text-xs text-stone-600">
                    <span className="font-semibold">รายละเอียด:</span> {reason}
                  </div>
                )}
              </div>

              <div className="flex items-center justify-between pt-2">
                <button
                  type="button"
                  onClick={() => setIsPreviewOpen(false)}
                  className="px-4 py-2 text-stone-600 hover:bg-stone-100 rounded-xl font-prompt text-xs"
                >
                  ย้อนกลับไปแก้ไข
                </button>
                <button
                  type="button"
                  onClick={handleFinalSubmit}
                  className="inline-flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-purple-800 to-indigo-800 hover:from-purple-900 hover:to-indigo-900 text-white font-bold font-prompt rounded-xl shadow-md transition-all text-xs active:scale-98"
                >
                  <Send className="w-4 h-4" />
                  <span>บันทึกข้อมูล (ออกเลขอัตโนมัติ)</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
