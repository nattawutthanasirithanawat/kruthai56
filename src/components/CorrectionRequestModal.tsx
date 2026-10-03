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
} from 'lucide-react';
import { CorrectionRequest, RequestStatus } from '../types/certificate';
import {
  addCorrectionRequest,
  getCorrectionRequests,
} from '../services/requestService';

interface CorrectionRequestModalProps {
  isOpen: boolean;
  onClose: () => void;
  availableProjects: string[];
  onRequestSubmitted?: () => void;
}

const STATUS_STEPS: RequestStatus[] = [
  'ยื่นคำขอแล้ว',
  'แอดมินรับคำขอ',
  'กำลังดำเนินการ',
  'เสร็จสิ้น แก้ไขแล้ว',
];

export const CorrectionRequestModal: React.FC<CorrectionRequestModalProps> = ({
  isOpen,
  onClose,
  availableProjects,
  onRequestSubmitted,
}) => {
  // Active Tab inside the window: 'form' | 'tracking'
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

  if (!isOpen) return null;

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
      studentId: certificateRefNo.trim(), // Stored as reference identifier
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-purple-950/80 backdrop-blur-sm overflow-y-auto font-sarabun">
      <div className="relative w-full max-w-3xl bg-white rounded-3xl shadow-2xl border border-purple-200 overflow-hidden my-auto flex flex-col max-h-[92vh]">
        {/* Header Bar */}
        <div className="flex items-center justify-between px-6 py-4 bg-gradient-to-r from-purple-950 via-purple-900 to-indigo-950 text-white">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-900/60 border border-purple-400/40 flex items-center justify-center text-amber-300">
              <FileEdit className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-prompt font-bold text-base sm:text-lg">
                บริการยื่นคำร้องออนไลน์
              </h2>
              <p className="text-xs text-purple-200">
                สาขาวิชาภาษาไทย คณะศึกษาศาสตร์ มหาวิทยาลัยศิลปากร
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-purple-200 hover:text-white hover:bg-purple-800/60 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Selection */}
        <div className="flex items-center border-b border-purple-100 bg-purple-50/60 px-6 pt-2">
          <button
            type="button"
            onClick={() => setActiveTab('form')}
            className={`flex items-center gap-2 px-5 py-3 text-xs font-semibold font-prompt border-b-2 transition-colors ${
              activeTab === 'form'
                ? 'border-purple-800 text-purple-950 bg-white rounded-t-xl shadow-xs'
                : 'border-transparent text-stone-600 hover:text-purple-800'
            }`}
          >
            <FileEdit className="w-4 h-4 text-purple-700" />
            <span>ยื่นคำร้องขอแก้ไขเกียรติบัตร</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('tracking')}
            className={`flex items-center gap-2 px-5 py-3 text-xs font-semibold font-prompt border-b-2 transition-colors ${
              activeTab === 'tracking'
                ? 'border-purple-800 text-purple-950 bg-white rounded-t-xl shadow-xs'
                : 'border-transparent text-stone-600 hover:text-purple-800'
            }`}
          >
            <Clock className="w-4 h-4 text-purple-700" />
            <span>ติดตามสถานะคำร้อง (๔ ขั้นตอน)</span>
          </button>
        </div>

        {/* Body Content */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6">
          {/* TAB 1: FORM */}
          {activeTab === 'form' && (
            <div className="space-y-5">
              <div className="bg-purple-50/60 border border-purple-100 rounded-2xl p-4 text-xs text-purple-950 space-y-1">
                <div className="font-bold font-prompt text-purple-900 flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-amber-500" />
                  <span>คำแนะนำการยื่นคำร้องขอแก้ไขข้อมูล</span>
                </div>
                <p className="text-stone-600 leading-relaxed">
                  หากพบว่าชื่อ-นามสกุล หรือตัวสะกดในเกียรติบัตรไม่ถูกต้อง ท่านสามารถกรอกแบบฟอร์มนี้เพื่อส่งเรื่องให้ผู้ดูแลระบบแก้ไขได้ โดยระบบจะออกเลขติดตามคำร้องอัตโนมัติทันที
                </p>
              </div>

              <form onSubmit={handleVerifyClick} className="space-y-4 text-xs">
                {/* 1. เลือกข้อมูลโครงการที่ประสงค์แก้ไข */}
                <div className="space-y-1.5">
                  <label className="font-semibold text-stone-800 font-prompt flex items-center gap-1.5">
                    <FolderOpen className="w-3.5 h-3.5 text-purple-700" />
                    <span>๑. เลือกข้อมูลโครงการที่ประสงค์แก้ไข <span className="text-rose-600">*</span></span>
                  </label>
                  <select
                    value={selectedProject || projectsList[0]}
                    onChange={(e) => setSelectedProject(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-purple-50/40 border border-purple-200 rounded-xl focus:ring-2 focus:ring-purple-600 text-stone-900 font-prompt"
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
                    <Hash className="w-3.5 h-3.5 text-purple-700" />
                    <span>๒. เลขที่</span>
                  </label>
                  <input
                    type="text"
                    value={certificateRefNo}
                    onChange={(e) => setCertificateRefNo(e.target.value)}
                    placeholder="เช่น 690610001 (เลขที่ที่แสดงในระบบ)"
                    className="w-full px-3.5 py-2.5 bg-purple-50/40 border border-purple-200 rounded-xl focus:ring-2 focus:ring-purple-600 text-stone-900 font-mono"
                  />
                </div>

                {/* 3. ชื่อเดิมที่แสดงในระบบ */}
                <div className="space-y-1.5">
                  <label className="font-semibold text-stone-800 font-prompt flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5 text-purple-700" />
                    <span>๓. ชื่อเดิมที่แสดงในระบบ (ถ้ามี)</span>
                  </label>
                  <input
                    type="text"
                    value={originalName}
                    onChange={(e) => setOriginalName(e.target.value)}
                    placeholder="เช่น นางสาวกมลวรรณ (สะกดผิด)"
                    className="w-full px-3.5 py-2 bg-purple-50/40 border border-purple-200 rounded-xl focus:ring-2 focus:ring-purple-600 text-stone-900"
                  />
                </div>

                {/* 4. กรอกชื่อที่ถูกต้องเพื่อแก้ไข */}
                <div className="space-y-1.5">
                  <label className="font-semibold text-stone-800 font-prompt flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5 text-purple-700" />
                    <span>๔. กรอกชื่อที่ถูกต้องเพื่อแก้ไข <span className="text-rose-600">*</span></span>
                  </label>
                  <input
                    type="text"
                    value={correctedName}
                    onChange={(e) => setCorrectedName(e.target.value)}
                    placeholder="กรอกชื่อ-นามสกุลที่ถูกต้องตามบัตรประชาชน เช่น นางสาวกมลวรรณ อินศรีทองสงค์"
                    className="w-full px-3.5 py-2.5 bg-purple-50/40 border border-purple-200 rounded-xl focus:ring-2 focus:ring-purple-600 text-stone-900 font-medium"
                    required
                  />
                </div>

                {/* 5. เบอร์โทรศัพท์ หรือช่องทางติดต่อ */}
                <div className="space-y-1.5">
                  <label className="font-semibold text-stone-800 font-prompt flex items-center gap-1.5">
                    <Phone className="w-3.5 h-3.5 text-purple-700" />
                    <span>๕. เบอร์โทรศัพท์ หรือ อีเมล สำหรับติดต่อ</span>
                  </label>
                  <input
                    type="text"
                    value={contactInfo}
                    onChange={(e) => setContactInfo(e.target.value)}
                    placeholder="เช่น 081-xxx-xxxx หรือ email@example.com"
                    className="w-full px-3.5 py-2 bg-purple-50/40 border border-purple-200 rounded-xl focus:ring-2 focus:ring-purple-600 text-stone-900"
                  />
                </div>

                {/* 6. รายละเอียดเพิ่มเติม */}
                <div className="space-y-1.5">
                  <label className="font-semibold text-stone-800 font-prompt">
                    ๖. รายละเอียดเพิ่มเติมที่ต้องการแก้ไข
                  </label>
                  <textarea
                    rows={2}
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    placeholder="ระบุ เช่น ตัวสะกดผิด หรือ ขอแก้ไขคำนำหน้าชื่อ"
                    className="w-full px-3.5 py-2 bg-purple-50/40 border border-purple-200 rounded-xl focus:ring-2 focus:ring-purple-600 text-stone-900"
                  />
                </div>

                {/* Submit action */}
                <div className="flex items-center justify-end gap-2 pt-3 border-t border-purple-100">
                  <button
                    type="button"
                    onClick={onClose}
                    className="px-4 py-2 text-stone-600 hover:bg-stone-100 rounded-xl font-prompt"
                  >
                    ปิดหน้าต่าง
                  </button>
                  <button
                    type="submit"
                    className="inline-flex items-center gap-1.5 px-6 py-2.5 bg-purple-800 hover:bg-purple-900 text-white rounded-xl font-bold font-prompt shadow-sm transition-all"
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
            <div className="space-y-6">
              {/* Newly Created Success Banner if present */}
              {newlyCreatedRequest && (
                <div className="p-4 bg-emerald-50 border-2 border-emerald-300 rounded-2xl text-emerald-950 space-y-2 shadow-xs">
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                      <div>
                        <h4 className="font-prompt font-bold text-sm text-emerald-900">
                          ยื่นคำร้องสำเร็จเรียบร้อยแล้ว!
                        </h4>
                        <p className="text-xs text-emerald-800">
                          ระบบออกเลขติดตามคำร้องอัตโนมัติ กรุณาบันทึกเลขนี้ไว้
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-xl border border-emerald-300 shadow-xs">
                      <span className="font-mono font-bold text-sm text-purple-950">
                        {newlyCreatedRequest.trackingNumber}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleCopy(newlyCreatedRequest.trackingNumber)}
                        className="p-1 hover:bg-emerald-100 rounded text-emerald-700 transition-colors"
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
                <label className="text-xs font-semibold text-stone-800 font-prompt">
                  ค้นหาคำร้องด้วยเลขติดตามคำร้อง หรือ เลขที่:
                </label>
                <form onSubmit={handleSearchTracking} className="flex gap-2">
                  <div className="relative flex-1">
                    <Search className="w-4 h-4 absolute left-3.5 top-3 text-purple-700" />
                    <input
                      type="text"
                      value={trackingQuery}
                      onChange={(e) => setTrackingQuery(e.target.value)}
                      placeholder="กรอกเลขคำร้อง เช่น REQ-67-001 หรือ เลขที่"
                      className="w-full pl-10 pr-4 py-2.5 text-xs bg-purple-50/40 border border-purple-200 rounded-xl focus:ring-2 focus:ring-purple-600 font-mono text-stone-900"
                    />
                  </div>
                  <button
                    type="submit"
                    className="px-5 py-2.5 bg-purple-800 hover:bg-purple-900 text-white rounded-xl text-xs font-bold font-prompt transition-colors shadow-xs whitespace-nowrap"
                  >
                    ค้นหาสถานะ
                  </button>
                </form>
              </div>

              {/* Tracking Result View */}
              {searchedRequest && (
                <div>
                  {searchedRequest === 'not_found' ? (
                    <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                      <span>ไม่พบข้อมูลคำร้องจากเลขที่ค้นหา กรุณาตรวจสอบความถูกต้องอีกครั้ง</span>
                    </div>
                  ) : (
                    <div className="bg-purple-50/60 rounded-2xl border border-purple-200 p-5 space-y-5">
                      {/* Top info */}
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-purple-200">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="font-mono font-bold text-sm text-purple-950 bg-white px-2.5 py-0.5 rounded-md border border-purple-200">
                              {searchedRequest.trackingNumber}
                            </span>
                            <span className="text-xs text-stone-500">
                              ยื่นเมื่อ: {searchedRequest.submittedAt}
                            </span>
                          </div>
                          <h5 className="font-prompt font-bold text-base text-purple-950">
                            {searchedRequest.projectName}
                          </h5>
                        </div>

                        <div>
                          <div className="font-prompt font-bold text-sm text-purple-900 bg-white px-3 py-1 rounded-xl border border-purple-300 shadow-xs">
                            {searchedRequest.status}
                          </div>
                        </div>
                      </div>

                      {/* 4 Status Stepper */}
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                        {STATUS_STEPS.map((step, idx) => {
                          const currentIdx = STATUS_STEPS.indexOf(searchedRequest.status);
                          const isCompleted = idx <= currentIdx;
                          const isCurrent = idx === currentIdx;

                          return (
                            <div
                              key={step}
                              className={`p-3 rounded-xl border text-center transition-all ${
                                isCurrent
                                  ? 'bg-purple-800 text-white border-purple-900 shadow-md scale-102'
                                  : isCompleted
                                  ? 'bg-white text-purple-950 border-purple-300 font-medium'
                                  : 'bg-stone-50/70 text-stone-400 border-stone-200'
                              }`}
                            >
                              <div className="text-[10px] uppercase font-mono opacity-80 mb-0.5">
                                ขั้นที่ {idx + 1}
                              </div>
                              <div className="text-xs font-bold font-prompt leading-tight">
                                {step}
                              </div>
                            </div>
                          );
                        })}
                      </div>

                      {/* Details */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs bg-white p-4 rounded-xl border border-purple-100">
                        <div>
                          <span className="text-stone-500">เลขที่: </span>
                          <span className="font-mono font-bold text-stone-850">{searchedRequest.studentId || '-'}</span>
                        </div>
                        <div>
                          <span className="text-stone-500">ชื่อเดิมในระบบ: </span>
                          <span className="text-stone-700">{searchedRequest.originalName || '-'}</span>
                        </div>
                        <div>
                          <span className="text-stone-500 font-semibold text-purple-900">ชื่อที่ถูกต้องเพื่อแก้ไข: </span>
                          <strong className="text-purple-950 font-bold text-sm">{searchedRequest.correctedName}</strong>
                        </div>
                        <div>
                          <span className="text-stone-500">อัปเดตสถานะล่าสุด: </span>
                          <span className="text-stone-700">{searchedRequest.updatedAt}</span>
                        </div>
                        {searchedRequest.adminNotes && (
                          <div className="sm:col-span-2 pt-2 border-t border-stone-100">
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

            <div className="p-6 space-y-4 text-xs">
              <p className="text-stone-500">
                กรุณาตรวจสอบข้อมูลด้านล่างให้ถูกต้องก่อนกดยืนยันบันทึกข้อมูลเข้าสู่ระบบ
              </p>

              <div className="bg-purple-50/70 p-4 rounded-2xl border border-purple-200 space-y-2.5">
                <div>
                  <span className="text-stone-500 block text-[11px]">โครงการที่ประสงค์แก้ไข:</span>
                  <strong className="text-purple-950 font-bold text-sm font-prompt">
                    {selectedProject || projectsList[0]}
                  </strong>
                </div>

                <div className="grid grid-cols-2 gap-2 pt-1 border-t border-purple-100">
                  <div>
                    <span className="text-stone-500 block text-[11px]">เลขที่:</span>
                    <span className="font-mono font-bold text-stone-800">{certificateRefNo || '-'}</span>
                  </div>
                  <div>
                    <span className="text-stone-500 block text-[11px]">ช่องทางติดต่อ:</span>
                    <span className="text-stone-800">{contactInfo || '-'}</span>
                  </div>
                </div>

                <div className="pt-2 border-t border-purple-100">
                  <span className="text-stone-500 block text-[11px]">ชื่อเดิม:</span>
                  <span className="text-stone-700 line-through">{originalName || '(ไม่ระบุ)'}</span>
                </div>

                <div className="pt-1 bg-white p-3 rounded-xl border border-purple-200">
                  <span className="text-purple-700 font-bold block text-[11px]">ชื่อที่ถูกต้องเพื่อแก้ไข:</span>
                  <span className="text-purple-950 font-bold text-base font-prompt">{correctedName}</span>
                </div>

                {reason && (
                  <div className="pt-1 text-[11px] text-stone-600">
                    <span className="font-semibold">รายละเอียด:</span> {reason}
                  </div>
                )}
              </div>

              <div className="flex items-center justify-between pt-2">
                <button
                  type="button"
                  onClick={() => setIsPreviewOpen(false)}
                  className="px-4 py-2 text-stone-600 hover:bg-stone-100 rounded-xl font-prompt"
                >
                  ย้อนกลับไปแก้ไข
                </button>
                <button
                  type="button"
                  onClick={handleFinalSubmit}
                  className="inline-flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-purple-800 to-indigo-800 hover:from-purple-900 hover:to-indigo-900 text-white font-bold font-prompt rounded-xl shadow-md transition-all"
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
