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
  ChevronRight,
  FolderOpen,
  User,
  Hash,
  Phone,
  ShieldAlert,
  Sparkles,
  Eye,
  X,
} from 'lucide-react';
import { CorrectionRequest, RequestStatus } from '../types/certificate';
import {
  addCorrectionRequest,
  getCorrectionRequests,
} from '../services/requestService';

interface CorrectionRequestSectionProps {
  availableProjects: string[];
  onRequestSubmitted?: () => void;
}

const STATUS_STEPS: RequestStatus[] = [
  'ยื่นคำขอแล้ว',
  'แอดมินรับคำขอ',
  'กำลังดำเนินการ',
  'เสร็จสิ้น แก้ไขแล้ว',
];

export const CorrectionRequestSection: React.FC<CorrectionRequestSectionProps> = ({
  availableProjects,
  onRequestSubmitted,
}) => {
  // Modal State for Request Form
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);

  // Form Fields
  const [selectedProject, setSelectedProject] = useState('');
  const [studentId, setStudentId] = useState('');
  const [originalName, setOriginalName] = useState('');
  const [correctedName, setCorrectedName] = useState('');
  const [contactInfo, setContactInfo] = useState('');
  const [reason, setReason] = useState('');

  // Post Submission Success State
  const [newlyCreatedRequest, setNewlyCreatedRequest] = useState<CorrectionRequest | null>(null);
  const [copiedTracking, setCopiedTracking] = useState(false);

  // Tracking Query State
  const [trackingQuery, setTrackingQuery] = useState('');
  const [searchedRequest, setSearchedRequest] = useState<CorrectionRequest | null | 'not_found'>(null);

  // Default project selection if available
  const projectsList = useMemo(() => {
    return availableProjects.length > 0
      ? availableProjects
      : ['โครงการวันภาษาไทยแห่งชาติ', 'โครงการพัฒนาสมรรถนะครูภาษาไทย'];
  }, [availableProjects]);

  // Handle Form "ตรวจสอบข้อมูล" (Review Button)
  const handleVerifyClick = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProject || !correctedName.trim()) {
      alert('กรุณาเลือกโครงการและกรอกชื่อที่ถูกต้องเพื่อแก้ไข');
      return;
    }
    setIsPreviewOpen(true);
  };

  // Handle Final Submit "บันทึกข้อมูล"
  const handleFinalSubmit = () => {
    const created = addCorrectionRequest({
      projectName: selectedProject,
      studentId: studentId.trim(),
      originalName: originalName.trim(),
      correctedName: correctedName.trim(),
      contactInfo: contactInfo.trim(),
      reason: reason.trim(),
    });

    setIsPreviewOpen(false);
    setIsFormOpen(false);
    setNewlyCreatedRequest(created);

    // Auto set tracking query to the newly created number so user sees it immediately
    setTrackingQuery(created.trackingNumber);
    setSearchedRequest(created);

    // Reset Form
    setSelectedProject('');
    setStudentId('');
    setOriginalName('');
    setCorrectedName('');
    setContactInfo('');
    setReason('');

    if (onRequestSubmitted) {
      onRequestSubmitted();
    }
  };

  // Handle Tracking Search
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

  // Copy tracking number
  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedTracking(true);
    setTimeout(() => setCopiedTracking(false), 2000);
  };

  return (
    <div id="correction-section" className="my-14 space-y-8 font-sarabun">
      {/* SECTION HEADER & CALLOUT CARD */}
      <div className="bg-gradient-to-r from-purple-900 via-purple-800 to-indigo-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl flex flex-col md:flex-row items-center justify-between gap-6 border border-purple-700/60">
        <div className="space-y-2 text-center md:text-left">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-950/60 border border-purple-400/40 text-amber-300 text-xs font-semibold font-prompt">
            <FileEdit className="w-3.5 h-3.5" />
            <span>บริการยื่นคำร้องออนไลน์</span>
          </div>
          <h3 className="text-xl sm:text-2xl font-bold font-prompt text-white">
            พบข้อผิดพลาดในเกียรติบัตร หรือต้องการแก้ไขชื่อ-นามสกุล?
          </h3>
          <p className="text-xs sm:text-sm text-purple-200 max-w-xl leading-relaxed">
            ท่านสามารถยื่นคำร้องขอแก้ไขข้อมูลออนไลน์ได้ทันที ระบบจะออกเลขติดตามคำร้องอัตโนมัติ เพื่อให้ท่านตรวจสอบสถานะการแก้ไขได้ตลอดเวลา
          </p>
        </div>

        <button
          type="button"
          onClick={() => {
            setIsFormOpen(true);
            setSelectedProject(projectsList[0] || '');
          }}
          className="inline-flex items-center gap-2 px-6 py-3.5 bg-amber-400 hover:bg-amber-300 text-purple-950 font-bold font-prompt rounded-2xl shadow-lg shadow-amber-400/20 text-sm whitespace-nowrap transition-all shrink-0 active:scale-98"
        >
          <FileEdit className="w-4 h-4 text-purple-950" />
          <span>ยื่นคำร้องขอแก้ไขข้อมูล</span>
        </button>
      </div>

      {/* SUCCESS BANNER AFTER SUBMISSION */}
      {newlyCreatedRequest && (
        <div className="p-5 bg-emerald-50 border-2 border-emerald-300 rounded-2xl text-emerald-950 space-y-3 shadow-sm animate-in fade-in duration-300">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <CheckCircle2 className="w-6 h-6 text-emerald-600 shrink-0" />
              <div>
                <h4 className="font-prompt font-bold text-sm sm:text-base text-emerald-900">
                  บันทึกคำร้องขอแก้ไขข้อมูลเรียบร้อยแล้ว!
                </h4>
                <p className="text-xs text-emerald-800">
                  ระบบได้ออกเลขติดตามคำร้องอัตโนมัติ กรุณาบันทึกเลขนี้ไว้เพื่อติดตามสถานะ
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-xl border border-emerald-300 shadow-xs">
              <span className="text-xs font-semibold text-stone-600">เลขติดตามคำร้อง:</span>
              <span className="font-mono font-bold text-sm text-purple-950">
                {newlyCreatedRequest.trackingNumber}
              </span>
              <button
                type="button"
                onClick={() => handleCopy(newlyCreatedRequest.trackingNumber)}
                className="p-1 hover:bg-emerald-100 rounded text-emerald-700 ml-1 transition-colors"
                title="คัดลอกเลขติดตาม"
              >
                {copiedTracking ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TRACKING REQUEST STATUS SECTION (แถบการติดตามสถานะคำร้อง) */}
      <div className="bg-white rounded-3xl border border-purple-200/90 p-6 sm:p-8 shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-purple-100 pb-4">
          <div>
            <h4 className="font-prompt font-bold text-lg text-purple-950 flex items-center gap-2">
              <Clock className="w-5 h-5 text-purple-800" />
              <span>ติดตามสถานะคำร้องขอแก้ไขเกียรติบัตร</span>
            </h4>
            <p className="text-xs text-stone-500 mt-0.5">
              กรอกเลขติดตามคำร้อง (เช่น REQ-67-001) หรือรหัสนักศึกษา เพื่อตรวจสอบความคืบหน้า
            </p>
          </div>
        </div>

        {/* Tracking Search Input */}
        <form onSubmit={handleSearchTracking} className="flex flex-col sm:flex-row gap-3 max-w-xl">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3.5 top-3.5 text-purple-700" />
            <input
              type="text"
              value={trackingQuery}
              onChange={(e) => setTrackingQuery(e.target.value)}
              placeholder="กรอกเลขคำร้อง เช่น REQ-67-001 หรือ รหัสนักศึกษา"
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

        {/* Tracking Result Display */}
        {searchedRequest && (
          <div>
            {searchedRequest === 'not_found' ? (
              <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                <span>ไม่พบข้อมูลคำร้องจากเลขที่ค้นหา กรุณาตรวจสอบความถูกต้องอีกครั้ง</span>
              </div>
            ) : (
              <div className="bg-purple-50/60 rounded-2xl border border-purple-200 p-5 sm:p-6 space-y-6">
                {/* Header Information */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-purple-200/80">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-sm text-purple-950 bg-white px-2.5 py-0.5 rounded-md border border-purple-200">
                        {searchedRequest.trackingNumber}
                      </span>
                      <span className="text-xs text-stone-500 font-sarabun">
                        ยื่นเมื่อ: {searchedRequest.submittedAt}
                      </span>
                    </div>
                    <h5 className="font-prompt font-bold text-base text-purple-950">
                      {searchedRequest.projectName}
                    </h5>
                  </div>

                  <div className="text-right">
                    <span className="text-xs font-semibold text-stone-500">สถานะปัจจุบัน:</span>
                    <div className="font-prompt font-bold text-sm text-purple-900 bg-white px-3 py-1 rounded-xl border border-purple-300 inline-block ml-2 shadow-xs">
                      {searchedRequest.status}
                    </div>
                  </div>
                </div>

                {/* 4-Step Visual Progress Bar */}
                <div className="space-y-2">
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
                            ขั้นตอนที่ {idx + 1}
                          </div>
                          <div className="text-xs font-bold font-prompt leading-tight">
                            {step}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Details summary */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs bg-white p-4 rounded-xl border border-purple-100">
                  <div>
                    <span className="text-stone-500">รหัสนักศึกษา: </span>
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
                    <span className="text-stone-500">อัปเดตล่าสุดเมื่อ: </span>
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

      {/* MODAL 1: FORM "ยื่นคำร้องขอแก้ไขข้อมูล" */}
      {isFormOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-purple-950/80 backdrop-blur-sm overflow-y-auto">
          <div className="relative w-full max-w-xl bg-white rounded-3xl shadow-2xl border border-purple-200 overflow-hidden my-auto">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 bg-gradient-to-r from-purple-900 to-indigo-900 text-white">
              <div className="flex items-center gap-2.5">
                <FileEdit className="w-5 h-5 text-amber-300" />
                <h4 className="font-prompt font-bold text-base">
                  แบบฟอร์มยื่นคำร้องขอแก้ไขเกียรติบัตร
                </h4>
              </div>
              <button
                type="button"
                onClick={() => setIsFormOpen(false)}
                className="p-1 text-purple-200 hover:text-white rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Form Body */}
            <form onSubmit={handleVerifyClick} className="p-6 space-y-4 text-xs">
              <p className="text-stone-500 leading-relaxed">
                กรุณากรอกข้อมูลตามความเป็นจริง หลังจากบันทึกแล้วระบบจะออกเลขติดตามคำร้องอัตโนมัติ
              </p>

              {/* 1. เลือกข้อมูลโครงการที่ประสงค์แก้ไข */}
              <div className="space-y-1.5">
                <label className="font-semibold text-stone-800 font-prompt flex items-center gap-1.5">
                  <FolderOpen className="w-3.5 h-3.5 text-purple-700" />
                  <span>๑. เลือกข้อมูลโครงการที่ประสงค์แก้ไข <span className="text-rose-600">*</span></span>
                </label>
                <select
                  value={selectedProject}
                  onChange={(e) => setSelectedProject(e.target.value)}
                  className="w-full px-3 py-2.5 bg-purple-50/40 border border-purple-200 rounded-xl focus:ring-2 focus:ring-purple-600 text-stone-900 font-prompt"
                  required
                >
                  {projectsList.map((p) => (
                    <option key={p} value={p}>
                      {p}
                    </option>
                  ))}
                </select>
              </div>

              {/* 2. รหัสนักศึกษา */}
              <div className="space-y-1.5">
                <label className="font-semibold text-stone-800 font-prompt flex items-center gap-1.5">
                  <Hash className="w-3.5 h-3.5 text-purple-700" />
                  <span>๒. รหัสนักศึกษา</span>
                </label>
                <input
                  type="text"
                  value={studentId}
                  onChange={(e) => setStudentId(e.target.value)}
                  placeholder="เช่น 640610123"
                  className="w-full px-3 py-2 bg-purple-50/40 border border-purple-200 rounded-xl focus:ring-2 focus:ring-purple-600 text-stone-900 font-mono"
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
                  placeholder="เช่น นายกิตติศักดิ์ รัตนวิเชียน (สะกดผิด)"
                  className="w-full px-3 py-2 bg-purple-50/40 border border-purple-200 rounded-xl focus:ring-2 focus:ring-purple-600 text-stone-900"
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
                  placeholder="กรอกชื่อ-นามสกุลที่ถูกต้องตามบัตรประชาชน เช่น นายกิตติศักดิ์ รัตนวิเชียร"
                  className="w-full px-3 py-2.5 bg-purple-50/40 border border-purple-200 rounded-xl focus:ring-2 focus:ring-purple-600 text-stone-900 font-medium"
                  required
                />
              </div>

              {/* 5. เบอร์โทรศัพท์ หรือช่องทางติดต่อ */}
              <div className="space-y-1.5">
                <label className="font-semibold text-stone-800 font-prompt flex items-center gap-1.5">
                  <Phone className="w-3.5 h-3.5 text-purple-700" />
                  <span>๕. เบอร์โทรศัพท์ / อีเมล สำหรับติดต่อ</span>
                </label>
                <input
                  type="text"
                  value={contactInfo}
                  onChange={(e) => setContactInfo(e.target.value)}
                  placeholder="เช่น 081-xxx-xxxx หรือ email@example.com"
                  className="w-full px-3 py-2 bg-purple-50/40 border border-purple-200 rounded-xl focus:ring-2 focus:ring-purple-600 text-stone-900"
                />
              </div>

              {/* 6. เหตุผลหรือรายละเอียดเพิ่มเติม */}
              <div className="space-y-1.5">
                <label className="font-semibold text-stone-800 font-prompt">
                  ๖. รายละเอียดเพิ่มเติมที่ต้องการแก้ไข
                </label>
                <textarea
                  rows={2}
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder="ระบุ เช่น ตัวสะกดผิด หรือ ขอแก้ไขคำนำหน้าชื่อ"
                  className="w-full px-3 py-2 bg-purple-50/40 border border-purple-200 rounded-xl focus:ring-2 focus:ring-purple-600 text-stone-900"
                />
              </div>

              {/* Action Buttons: ปุ่มตรวจสอบข้อมูล */}
              <div className="flex items-center justify-end gap-2 pt-3 border-t border-purple-100">
                <button
                  type="button"
                  onClick={() => setIsFormOpen(false)}
                  className="px-4 py-2 text-stone-600 hover:bg-stone-100 rounded-xl font-prompt"
                >
                  ยกเลิก
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
        </div>
      )}

      {/* MODAL 2: "ตรวจสอบข้อมูล" (Preview/Confirm Modal before final Save) */}
      {isPreviewOpen && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-3 sm:p-6 bg-purple-950/80 backdrop-blur-sm overflow-y-auto">
          <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-purple-200 overflow-hidden my-auto">
            {/* Header */}
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

            {/* Verification Content */}
            <div className="p-6 space-y-4 text-xs">
              <p className="text-stone-500">
                กรุณาตรวจสอบข้อมูลด้านล่างให้ถูกต้องก่อนกดยืนยันบันทึกข้อมูลเข้าสู่ระบบ
              </p>

              <div className="bg-purple-50/70 p-4 rounded-2xl border border-purple-200 space-y-2.5">
                <div>
                  <span className="text-stone-500 block text-[11px]">โครงการที่ประสงค์แก้ไข:</span>
                  <strong className="text-purple-950 font-bold text-sm font-prompt">{selectedProject}</strong>
                </div>

                <div className="grid grid-cols-2 gap-2 pt-1 border-t border-purple-100">
                  <div>
                    <span className="text-stone-500 block text-[11px]">รหัสนักศึกษา:</span>
                    <span className="font-mono font-bold text-stone-800">{studentId || '-'}</span>
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

              {/* Action Buttons: บันทึกข้อมูล */}
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
