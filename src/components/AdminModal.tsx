import React, { useState, useMemo } from 'react';
import {
  X,
  Lock,
  User,
  KeyRound,
  Plus,
  Edit2,
  Trash2,
  RefreshCw,
  AlertCircle,
  FolderOpen,
  Hash,
  FileText,
  ExternalLink,
  Layers,
  LogOut,
  Search,
  FileEdit,
  ArrowRight,
  Database,
} from 'lucide-react';
import { CertificateRecord, CorrectionRequest, RequestStatus } from '../types/certificate';
import { ADMIN_CREDENTIALS } from '../constants/assets';
import {
  getLocalCustomRecords,
  saveLocalCustomRecords,
  getDeletedRecordIds,
  saveDeletedRecordIds,
  PERMANENT_SHEET_ID,
} from '../services/googleSheets';
import {
  getCorrectionRequests,
  updateCorrectionRequestStatus,
} from '../services/requestService';

interface AdminModalProps {
  certificates: CertificateRecord[];
  onRefreshData: () => void;
  onClose: () => void;
}

const REQUEST_STATUSES: RequestStatus[] = [
  'ยื่นคำขอแล้ว',
  'แอดมินรับคำขอ',
  'กำลังดำเนินการ',
  'เสร็จสิ้น แก้ไขแล้ว',
];

export const AdminModal: React.FC<AdminModalProps> = ({
  certificates,
  onRefreshData,
  onClose,
}) => {
  // Authentication State
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    return sessionStorage.getItem('su_thai_admin_session') === 'true';
  });
  const [usernameInput, setUsernameInput] = useState('');
  const [passwordInput, setPasswordInput] = useState('');
  const [authError, setAuthError] = useState<string | null>(null);

  // Active Admin Tab: 'requests' | 'data' (Sheet configuration tab removed as per request)
  const [activeTab, setActiveTab] = useState<'requests' | 'data'>('requests');

  // Data Management State (Records)
  const [searchFilter, setSearchFilter] = useState('');
  const [editingRecord, setEditingRecord] = useState<CertificateRecord | null>(null);
  const [isCreatingNew, setIsCreatingNew] = useState(false);

  // Form Fields for Add/Edit Record
  const [formProject, setFormProject] = useState('');
  const [formStudentId, setFormStudentId] = useState('');
  const [formName, setFormName] = useState('');
  const [formPdfUrl, setFormPdfUrl] = useState('');

  // Correction Requests State (ชีต2)
  const [correctionRequests, setCorrectionRequests] = useState<CorrectionRequest[]>(() => {
    return getCorrectionRequests();
  });
  const [requestFilter, setRequestFilter] = useState<string>('all');
  const [requestSearch, setRequestSearch] = useState<string>('');

  // Handle Login
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (
      usernameInput.trim() === ADMIN_CREDENTIALS.username &&
      passwordInput.trim() === ADMIN_CREDENTIALS.password
    ) {
      setIsAuthenticated(true);
      sessionStorage.setItem('su_thai_admin_session', 'true');
      setAuthError(null);
      setCorrectionRequests(getCorrectionRequests());
    } else {
      setAuthError('ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง กรุณาลองใหม่อีกครั้ง');
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    sessionStorage.removeItem('su_thai_admin_session');
    setUsernameInput('');
    setPasswordInput('');
  };

  // Filtered records in table
  const displayedRecords = useMemo(() => {
    if (!searchFilter.trim()) return certificates;
    const q = searchFilter.toLowerCase().trim();
    return certificates.filter((r) => {
      return (
        r.name.toLowerCase().includes(q) ||
        r.studentId.toLowerCase().includes(q) ||
        r.projectName.toLowerCase().includes(q)
      );
    });
  }, [certificates, searchFilter]);

  // Filtered requests in Sheet2 tab
  const displayedRequests = useMemo(() => {
    return correctionRequests.filter((req) => {
      if (requestFilter !== 'all' && req.status !== requestFilter) {
        return false;
      }
      if (!requestSearch.trim()) return true;
      const q = requestSearch.toLowerCase().trim();
      return (
        req.trackingNumber.toLowerCase().includes(q) ||
        req.studentId.toLowerCase().includes(q) ||
        req.correctedName.toLowerCase().includes(q) ||
        req.originalName.toLowerCase().includes(q) ||
        req.projectName.toLowerCase().includes(q)
      );
    });
  }, [correctionRequests, requestFilter, requestSearch]);

  // Open Edit Record
  const openEdit = (record: CertificateRecord) => {
    setEditingRecord(record);
    setFormProject(record.projectName);
    setFormStudentId(record.studentId);
    setFormName(record.name);
    setFormPdfUrl(record.pdfUrl || '');
    setIsCreatingNew(false);
  };

  // Open Create Record
  const openCreate = () => {
    setEditingRecord(null);
    setFormProject(certificates[0]?.projectName || '');
    setFormStudentId('');
    setFormName('');
    setFormPdfUrl('');
    setIsCreatingNew(true);
  };

  // Save Record
  const handleSaveRecord = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim() || !formProject.trim()) return;

    const currentCustom = getLocalCustomRecords();

    if (isCreatingNew) {
      const newRec: CertificateRecord = {
        id: `custom-${Date.now()}-${formStudentId || 'student'}`,
        projectName: formProject.trim(),
        studentId: formStudentId.trim(),
        name: formName.trim(),
        pdfUrl: formPdfUrl.trim(),
      };
      saveLocalCustomRecords([...currentCustom, newRec]);
    } else if (editingRecord) {
      const updatedRec: CertificateRecord = {
        ...editingRecord,
        projectName: formProject.trim(),
        studentId: formStudentId.trim(),
        name: formName.trim(),
        pdfUrl: formPdfUrl.trim(),
      };
      const filtered = currentCustom.filter((r) => r.id !== editingRecord.id);
      saveLocalCustomRecords([...filtered, updatedRec]);
    }

    setIsCreatingNew(false);
    setEditingRecord(null);
    onRefreshData();
  };

  // Delete Record
  const handleDeleteRecord = (id: string, name: string) => {
    if (window.confirm(`ยืนยันการลบเกียรติบัตรของ "${name}" ใช่หรือไม่?`)) {
      const currentCustom = getLocalCustomRecords();
      saveLocalCustomRecords(currentCustom.filter((r) => r.id !== id));
      const deletedIds = getDeletedRecordIds();
      if (!deletedIds.includes(id)) {
        saveDeletedRecordIds([...deletedIds, id]);
      }
      onRefreshData();
    }
  };

  // Update Request Status in Sheet2
  const handleUpdateStatus = (id: string, newStatus: RequestStatus) => {
    const updated = updateCorrectionRequestStatus(id, newStatus);
    setCorrectionRequests(updated);
  };

  // Quick Apply Corrected Name to Record
  const handleApplyNameToRecord = (req: CorrectionRequest) => {
    const match = certificates.find(
      (c) =>
        (c.studentId && c.studentId === req.studentId) ||
        c.name.trim() === req.originalName.trim()
    );

    if (match) {
      const currentCustom = getLocalCustomRecords();
      const updatedMatch: CertificateRecord = {
        ...match,
        name: req.correctedName,
      };
      const filtered = currentCustom.filter((r) => r.id !== match.id);
      saveLocalCustomRecords([...filtered, updatedMatch]);
      const updatedReqs = updateCorrectionRequestStatus(
        req.id,
        'เสร็จสิ้น แก้ไขแล้ว',
        'อัปเดตชื่อในระบบให้เรียบร้อยแล้ว'
      );
      setCorrectionRequests(updatedReqs);
      onRefreshData();
      alert(`อัปเดตชื่อของ ${req.correctedName} ในระบบเรียบร้อยแล้ว`);
    } else {
      alert('ไม่พบข้อมูลนักศึกษาที่ตรงกับคำร้องนี้ในระบบ');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-purple-950/80 backdrop-blur-sm overflow-y-auto font-sarabun">
      <div className="relative w-full max-w-5xl bg-white rounded-3xl shadow-2xl border border-purple-200 overflow-hidden my-auto flex flex-col max-h-[92vh]">
        {/* Top Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-gradient-to-r from-purple-950 via-purple-900 to-indigo-950 text-white">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-900/60 border border-purple-400/40 flex items-center justify-center text-amber-300">
              <Lock className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-prompt font-bold text-base sm:text-lg">
                ระบบจัดการข้อมูลผู้ดูแลระบบ (Admin Panel)
              </h2>
              <p className="text-xs text-purple-200">
                สาขาวิชาภาษาไทย คณะศึกษาศาสตร์ มหาวิทยาลัยศิลปากร
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {isAuthenticated && (
              <button
                onClick={handleLogout}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-purple-950/60 hover:bg-rose-900/80 text-purple-200 hover:text-white text-xs font-prompt transition-colors border border-purple-500/30"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">ออกจากระบบ</span>
              </button>
            )}
            <button
              onClick={onClose}
              className="p-1.5 text-purple-200 hover:text-white hover:bg-purple-800/60 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content Area */}
        {!isAuthenticated ? (
          /* LOGIN FORM */
          <div className="p-6 sm:p-10 max-w-md mx-auto w-full space-y-6">
            <div className="text-center space-y-2">
              <div className="w-14 h-14 rounded-2xl bg-purple-100 text-purple-900 flex items-center justify-center mx-auto border border-purple-200">
                <KeyRound className="w-7 h-7" />
              </div>
              <h3 className="text-lg font-bold font-prompt text-purple-950">
                เข้าสู่ระบบผู้ดูแลระบบ (Admin)
              </h3>
              <p className="text-xs text-stone-500">
                กรุณาระบุ Username และ Password เพื่อเข้าจัดการข้อมูลและคำร้อง
              </p>
            </div>

            <form onSubmit={handleLogin} className="space-y-4">
              {authError && (
                <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
                  <span>{authError}</span>
                </div>
              )}

              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-stone-700 font-prompt">
                  ชื่อผู้ใช้ (Username)
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-purple-700">
                    <User className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    value={usernameInput}
                    onChange={(e) => setUsernameInput(e.target.value)}
                    placeholder="User: Kruthai56"
                    className="w-full pl-9 pr-4 py-2.5 text-sm bg-purple-50/40 border border-purple-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-600 focus:bg-white text-stone-900"
                    required
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-stone-700 font-prompt">
                  รหัสผ่าน (Password)
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-purple-700">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    type="password"
                    value={passwordInput}
                    onChange={(e) => setPasswordInput(e.target.value)}
                    placeholder="Password"
                    className="w-full pl-9 pr-4 py-2.5 text-sm bg-purple-50/40 border border-purple-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-600 focus:bg-white text-stone-900"
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-2.5 bg-gradient-to-r from-purple-800 to-indigo-800 hover:from-purple-900 hover:to-indigo-900 text-white rounded-xl text-xs font-bold font-prompt transition-all shadow-md shadow-purple-900/20"
              >
                เข้าสู่ระบบ Admin
              </button>
            </form>
          </div>
        ) : (
          /* AUTHENTICATED ADMIN DASHBOARD */
          <div className="flex-1 flex flex-col overflow-hidden">
            {/* Nav Tabs (2 focused tabs) */}
            <div className="flex items-center justify-between border-b border-purple-100 bg-purple-50/60 px-6 pt-2">
              <div className="flex items-center gap-2">
                {/* Tab 1: คำร้องขอแก้ไขเกียรติบัตร (ชีต2) */}
                <button
                  onClick={() => setActiveTab('requests')}
                  className={`flex items-center gap-2 px-4 py-2.5 text-xs font-semibold font-prompt border-b-2 transition-colors whitespace-nowrap ${
                    activeTab === 'requests'
                      ? 'border-purple-800 text-purple-900 bg-white rounded-t-lg shadow-xs'
                      : 'border-transparent text-stone-600 hover:text-purple-800'
                  }`}
                >
                  <FileEdit className="w-4 h-4 text-purple-700" />
                  <span>คำร้องขอแก้ไขเกียรติบัตร (ชีต๒)</span>
                  <span className="bg-purple-200 text-purple-900 px-1.5 py-0.2 rounded-full font-mono text-[10px]">
                    {correctionRequests.length}
                  </span>
                </button>

                {/* Tab 2: จัดการข้อมูลเกียรติบัตร */}
                <button
                  onClick={() => setActiveTab('data')}
                  className={`flex items-center gap-2 px-4 py-2.5 text-xs font-semibold font-prompt border-b-2 transition-colors whitespace-nowrap ${
                    activeTab === 'data'
                      ? 'border-purple-800 text-purple-900 bg-white rounded-t-lg shadow-xs'
                      : 'border-transparent text-stone-600 hover:text-purple-800'
                  }`}
                >
                  <Layers className="w-4 h-4 text-purple-700" />
                  <span>รายชื่อในระบบ ({certificates.length} รายการ)</span>
                </button>
              </div>

              <div className="hidden sm:flex items-center gap-1.5 text-xs text-purple-900 font-mono bg-purple-100/70 px-3 py-1 rounded-lg">
                <Database className="w-3.5 h-3.5 text-purple-700" />
                <span>Google Sheet ID ถาวร: {PERMANENT_SHEET_ID.slice(0, 8)}...</span>
              </div>
            </div>

            {/* TAB 1: CORRECTION REQUESTS MANAGEMENT (ชีต2) */}
            {activeTab === 'requests' && (
              <div className="p-5 flex-1 overflow-y-auto space-y-4">
                {/* Search & Filter Bar */}
                <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
                  <div className="flex items-center gap-2 w-full sm:w-auto">
                    <div className="relative flex-1 sm:w-64">
                      <Search className="w-4 h-4 absolute left-3 top-2.5 text-stone-400" />
                      <input
                        type="text"
                        value={requestSearch}
                        onChange={(e) => setRequestSearch(e.target.value)}
                        placeholder="ค้นหาเลขคำร้อง, รหัส, หรือชื่อ..."
                        className="w-full pl-9 pr-3 py-1.5 text-xs bg-stone-50 border border-stone-300 rounded-xl focus:ring-2 focus:ring-purple-600 text-stone-800"
                      />
                    </div>

                    <select
                      value={requestFilter}
                      onChange={(e) => setRequestFilter(e.target.value)}
                      className="px-2.5 py-1.5 text-xs bg-purple-50/60 border border-purple-200 rounded-xl text-stone-800 font-prompt"
                    >
                      <option value="all">ทุกสถานะ ({correctionRequests.length})</option>
                      {REQUEST_STATUSES.map((st) => (
                        <option key={st} value={st}>
                          {st}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="text-xs text-stone-500 font-sarabun">
                    ตารางบันทึกข้อมูล: <strong>ฐานข้อมูล "ชีต๒"</strong>
                  </div>
                </div>

                {/* Requests Table */}
                <div className="border border-purple-100 rounded-xl overflow-hidden shadow-xs">
                  <div className="max-h-[50vh] overflow-y-auto">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-purple-50 text-purple-950 font-prompt sticky top-0 border-b border-purple-200">
                        <tr>
                          <th className="py-2.5 px-3 font-semibold">เลขคำร้อง</th>
                          <th className="py-2.5 px-3 font-semibold">โครงการ</th>
                          <th className="py-2.5 px-3 font-semibold">เลขที่</th>
                          <th className="py-2.5 px-3 font-semibold">ชื่อเดิม ➔ ชื่อที่ถูกต้อง</th>
                          <th className="py-2.5 px-3 font-semibold">สถานะคำร้อง</th>
                          <th className="py-2.5 px-3 font-semibold text-right">การจัดการ</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-stone-100 font-sarabun text-stone-800">
                        {displayedRequests.length > 0 ? (
                          displayedRequests.map((req) => (
                            <tr key={req.id} className="hover:bg-purple-50/30 transition-colors">
                              <td className="py-2.5 px-3 font-mono font-bold text-purple-950">
                                {req.trackingNumber}
                                <span className="block text-[10px] text-stone-400 font-normal">
                                  {req.submittedAt}
                                </span>
                              </td>
                              <td className="py-2.5 px-3 max-w-[180px] truncate text-purple-900 font-medium">
                                {req.projectName}
                              </td>
                              <td className="py-2.5 px-3 font-mono font-bold text-stone-700">
                                {req.studentId || '-'}
                              </td>
                              <td className="py-2.5 px-3">
                                {req.originalName && (
                                  <span className="text-stone-400 line-through mr-1 text-[11px]">
                                    {req.originalName}
                                  </span>
                                )}
                                <span className="font-bold text-purple-950">
                                  {req.correctedName}
                                </span>
                                {req.contactInfo && (
                                  <span className="block text-[10px] text-stone-500">
                                    ติดต่อ: {req.contactInfo}
                                  </span>
                                )}
                              </td>
                              <td className="py-2.5 px-3">
                                <select
                                  value={req.status}
                                  onChange={(e) =>
                                    handleUpdateStatus(req.id, e.target.value as RequestStatus)
                                  }
                                  className={`px-2 py-1 text-xs rounded-lg font-prompt font-semibold border ${
                                    req.status === 'เสร็จสิ้น แก้ไขแล้ว'
                                      ? 'bg-emerald-50 text-emerald-900 border-emerald-300'
                                      : req.status === 'กำลังดำเนินการ'
                                      ? 'bg-amber-50 text-amber-900 border-amber-300'
                                      : req.status === 'แอดมินรับคำขอ'
                                      ? 'bg-blue-50 text-blue-900 border-blue-300'
                                      : 'bg-purple-50 text-purple-900 border-purple-200'
                                  }`}
                                >
                                  {REQUEST_STATUSES.map((st) => (
                                    <option key={st} value={st}>
                                      {st}
                                    </option>
                                  ))}
                                </select>
                              </td>
                              <td className="py-2.5 px-3 text-right">
                                <button
                                  type="button"
                                  onClick={() => handleApplyNameToRecord(req)}
                                  className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-semibold text-purple-900 bg-purple-100 hover:bg-purple-200 rounded-lg transition-colors font-prompt"
                                  title="นำชื่อที่ถูกต้องไปอัปเดตลงในระบบเกียรติบัตรทันที"
                                >
                                  <span>อัปเดตชื่อในระบบ</span>
                                  <ArrowRight className="w-3 h-3" />
                                </button>
                              </td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td colSpan={6} className="text-center py-8 text-stone-400">
                              ไม่พบคำร้องขอแก้ไขในหมวดหมู่นี้
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 2: DATA MANAGEMENT (RECORDS) */}
            {activeTab === 'data' && (
              <div className="p-5 flex-1 overflow-y-auto space-y-4">
                <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
                  <div className="relative w-full sm:w-72">
                    <Search className="w-4 h-4 absolute left-3 top-3 text-stone-400" />
                    <input
                      type="text"
                      value={searchFilter}
                      onChange={(e) => setSearchFilter(e.target.value)}
                      placeholder="กรองด้วยชื่อ, รหัส, หรือโครงการ..."
                      className="w-full pl-9 pr-3 py-2 text-xs bg-stone-50 border border-stone-300 rounded-xl focus:ring-2 focus:ring-purple-600 text-stone-800"
                    />
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={onRefreshData}
                      className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-stone-700 hover:bg-stone-100 rounded-xl transition-colors font-prompt border border-stone-200"
                      title="ดึงข้อมูลล่าสุดจาก Google Sheet ถาวร"
                    >
                      <RefreshCw className="w-3.5 h-3.5 text-stone-600" />
                      <span>ซิงค์ข้อมูลล่าสุด</span>
                    </button>

                    <button
                      onClick={openCreate}
                      className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-purple-800 hover:bg-purple-900 rounded-xl transition-all font-prompt shadow-sm"
                    >
                      <Plus className="w-4 h-4" />
                      <span>เพิ่มรายชื่อใหม่</span>
                    </button>
                  </div>
                </div>

                <div className="border border-purple-100 rounded-xl overflow-hidden shadow-xs">
                  <div className="max-h-[50vh] overflow-y-auto">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-purple-50 text-purple-950 font-prompt sticky top-0 border-b border-purple-200">
                        <tr>
                          <th className="py-2.5 px-3 font-semibold">โครงการ</th>
                          <th className="py-2.5 px-3 font-semibold">เลขที่</th>
                          <th className="py-2.5 px-3 font-semibold">ชื่อ-นามสกุล</th>
                          <th className="py-2.5 px-3 font-semibold">ลิงก์ PDF</th>
                          <th className="py-2.5 px-3 font-semibold text-right">การจัดการ</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-stone-100 font-sarabun text-stone-800">
                        {displayedRecords.map((r) => (
                          <tr key={r.id} className="hover:bg-purple-50/40 transition-colors">
                            <td className="py-2.5 px-3 font-medium text-purple-950 max-w-[200px] truncate">
                              {r.projectName}
                            </td>
                            <td className="py-2.5 px-3 font-mono font-bold text-stone-700">
                              {r.studentId || '-'}
                            </td>
                            <td className="py-2.5 px-3 font-semibold text-stone-900">
                              {r.name}
                            </td>
                            <td className="py-2.5 px-3 max-w-[150px] truncate">
                              {r.pdfUrl ? (
                                <a
                                  href={r.pdfUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-purple-700 hover:underline flex items-center gap-1 text-[11px]"
                                >
                                  <span>เปิด PDF</span>
                                  <ExternalLink className="w-3 h-3" />
                                </a>
                              ) : (
                                <span className="text-stone-400">-</span>
                              )}
                            </td>
                            <td className="py-2.5 px-3 text-right">
                              <div className="flex items-center justify-end gap-1">
                                <button
                                  onClick={() => openEdit(r)}
                                  className="p-1.5 text-purple-700 hover:bg-purple-100 rounded-lg transition-colors"
                                  title="แก้ไขข้อมูล"
                                >
                                  <Edit2 className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  onClick={() => handleDeleteRecord(r.id, r.name)}
                                  className="p-1.5 text-rose-600 hover:bg-rose-100 rounded-lg transition-colors"
                                  title="ลบข้อมูล"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* MODAL: ADD / EDIT RECORD */}
        {(isCreatingNew || editingRecord) && (
          <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-purple-950/70 backdrop-blur-xs">
            <div className="bg-white rounded-3xl p-6 w-full max-w-lg shadow-2xl border border-purple-200 space-y-4">
              <div className="flex items-center justify-between border-b border-purple-100 pb-3">
                <h4 className="font-prompt font-bold text-base text-purple-950">
                  {isCreatingNew ? 'เพิ่มข้อมูลเกียรติบัตรใหม่' : 'แก้ไขข้อมูลเกียรติบัตร'}
                </h4>
                <button
                  onClick={() => {
                    setIsCreatingNew(false);
                    setEditingRecord(null);
                  }}
                  className="p-1 text-stone-400 hover:text-stone-700"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleSaveRecord} className="space-y-3 text-xs">
                <div className="space-y-1">
                  <label className="font-semibold text-stone-700 font-prompt">
                    ๑. ชื่อโครงการ
                  </label>
                  <input
                    type="text"
                    value={formProject}
                    onChange={(e) => setFormProject(e.target.value)}
                    placeholder="เช่น แรกพี่พบน้อง คล้องสายสัมพันธ์เอกไทย 2569"
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-xl focus:ring-2 focus:ring-purple-600 text-stone-900"
                    required
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-stone-700 font-prompt">
                    ๒. เลขที่
                  </label>
                  <input
                    type="text"
                    value={formStudentId}
                    onChange={(e) => setFormStudentId(e.target.value)}
                    placeholder="เช่น 690610001"
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-xl focus:ring-2 focus:ring-purple-600 text-stone-900 font-mono"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-stone-700 font-prompt">
                    ๓. ชื่อ-นามสกุล
                  </label>
                  <input
                    type="text"
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    placeholder="เช่น นางสาวกมลวรรณ อินศรีทองสงค์"
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-xl focus:ring-2 focus:ring-purple-600 text-stone-900"
                    required
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-stone-700 font-prompt">
                    ๔. ลิงก์ PDF เกียรติบัตร
                  </label>
                  <input
                    type="url"
                    value={formPdfUrl}
                    onChange={(e) => setFormPdfUrl(e.target.value)}
                    placeholder="https://drive.google.com/file/d/... หรือ URL PDF"
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-xl focus:ring-2 focus:ring-purple-600 text-stone-900 font-mono"
                  />
                </div>

                <div className="flex items-center justify-end gap-2 pt-3 border-t border-stone-100">
                  <button
                    type="button"
                    onClick={() => {
                      setIsCreatingNew(false);
                      setEditingRecord(null);
                    }}
                    className="px-3.5 py-1.5 text-stone-600 hover:bg-stone-100 rounded-lg font-prompt"
                  >
                    ยกเลิก
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 text-white bg-purple-800 hover:bg-purple-900 rounded-xl font-bold font-prompt shadow-sm"
                  >
                    บันทึกข้อมูล
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
