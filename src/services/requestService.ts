import { CorrectionRequest, RequestStatus } from '../types/certificate';

const SHEET2_REQUESTS_KEY = 'su_thai_correction_requests_sheet2';

const INITIAL_SAMPLE_REQUESTS: CorrectionRequest[] = [
  {
    id: 'req-001',
    trackingNumber: 'REQ-67-001',
    projectName: 'โครงการวันภาษาไทยแห่งชาติ ประจำปี ๒๕๖๗',
    studentId: '640610123',
    originalName: 'กิตติศักดิ์ รัตนวิเชียร',
    correctedName: 'นายกิตติศักดิ์ รัตนวิเชียร',
    contactInfo: '081-234-5678',
    reason: 'ขอแก้ไขเพิ่มคำนำหน้าชื่อให้ถูกต้องตามบัตรประชาชน',
    status: 'เสร็จสิ้น แก้ไขแล้ว',
    submittedAt: '๒ ต.ค. ๒๕๖๗ ๑๐:๓๐',
    updatedAt: '๒ ต.ค. ๒๕๖๗ ๑๔:๐๐',
    adminNotes: 'แก้ไขไฟล์ PDF และอัปเดตชื่อในระบบเรียบร้อยแล้ว',
  },
  {
    id: 'req-002',
    trackingNumber: 'REQ-67-002',
    projectName: 'โครงการสัมมนาวิชาการและการจัดการเรียนรู้ภาษาไทยศตวรรษที่ ๒๑',
    studentId: '650610235',
    originalName: 'นายวรเมธ ประเสริฐสุขข์',
    correctedName: 'นายวรเมธ ประเสริฐสุข',
    contactInfo: 'worameth@email.com',
    reason: 'นามสกุลสะกดผิด มี ข์ เกินมาครับ',
    status: 'กำลังดำเนินการ',
    submittedAt: '๓ ต.ค. ๒๕๖๗ ๐๘:๑๕',
    updatedAt: '๓ ต.ค. ๒๕๖๗ ๐๙:๓๐',
    adminNotes: 'กำลังประสานงานจัดทำไฟล์ PDF ฉบับแก้ไขใหม่',
  },
  {
    id: 'req-003',
    trackingNumber: 'REQ-67-003',
    projectName: 'การแข่งขันทักษะการเปิดพจนานุกรมและรอบรู้ภาษาไทย',
    studentId: '660610342',
    originalName: 'ธนพล สุขสมบูรณ์',
    correctedName: 'นายธนพล สุขสมบูรณ์',
    contactInfo: '092-345-6789',
    reason: 'ขอเพิ่มคำนำหน้านาย และตรวจสอบตัวสะกด',
    status: 'แอดมินรับคำขอ',
    submittedAt: '๓ ต.ค. ๒๕๖๗ ๑๑:๐๐',
    updatedAt: '๓ ต.ค. ๒๕๖๗ ๑๑:๑๕',
    adminNotes: 'รับเรื่องแล้ว อยู่ระหว่างตรวจสอบข้อมูลในทะเบียน',
  },
];

export function getCorrectionRequests(): CorrectionRequest[] {
  try {
    const raw = localStorage.getItem(SHEET2_REQUESTS_KEY);
    if (!raw) {
      // Seed with initial realistic data for Sheet2
      localStorage.setItem(SHEET2_REQUESTS_KEY, JSON.stringify(INITIAL_SAMPLE_REQUESTS));
      return INITIAL_SAMPLE_REQUESTS;
    }
    return JSON.parse(raw);
  } catch {
    return INITIAL_SAMPLE_REQUESTS;
  }
}

export function saveCorrectionRequests(requests: CorrectionRequest[]): void {
  try {
    localStorage.setItem(SHEET2_REQUESTS_KEY, JSON.stringify(requests));
  } catch {
    // ignore
  }
}

// Generate unique tracking number e.g. REQ-67-004
export function generateTrackingNumber(existing: CorrectionRequest[]): string {
  const yearSuffix = (new Date().getFullYear() + 543).toString().slice(-2);
  const count = existing.length + 1;
  const numStr = count.toString().padStart(3, '0');
  return `REQ-${yearSuffix}-${numStr}`;
}

export function addCorrectionRequest(data: {
  projectName: string;
  studentId: string;
  originalName: string;
  correctedName: string;
  contactInfo?: string;
  reason?: string;
}): CorrectionRequest {
  const current = getCorrectionRequests();
  const trackingNumber = generateTrackingNumber(current);
  const now = new Date();
  const dateFormatted = `${now.toLocaleDateString('th-TH', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })} ${now.toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' })}`;

  const newRequest: CorrectionRequest = {
    id: `req-${Date.now()}`,
    trackingNumber,
    projectName: data.projectName.trim(),
    studentId: data.studentId.trim(),
    originalName: data.originalName.trim(),
    correctedName: data.correctedName.trim(),
    contactInfo: data.contactInfo?.trim() || '',
    reason: data.reason?.trim() || 'ขอแก้ไขชื่อ-นามสกุลให้ถูกต้อง',
    status: 'ยื่นคำขอแล้ว',
    submittedAt: dateFormatted,
    updatedAt: dateFormatted,
  };

  const updated = [newRequest, ...current];
  saveCorrectionRequests(updated);
  return newRequest;
}

export function updateCorrectionRequestStatus(
  id: string,
  newStatus: RequestStatus,
  adminNotes?: string
): CorrectionRequest[] {
  const current = getCorrectionRequests();
  const now = new Date();
  const dateFormatted = `${now.toLocaleDateString('th-TH', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })} ${now.toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' })}`;

  const updated = current.map((req) => {
    if (req.id === id) {
      return {
        ...req,
        status: newStatus,
        updatedAt: dateFormatted,
        adminNotes: adminNotes !== undefined ? adminNotes : req.adminNotes,
      };
    }
    return req;
  });

  saveCorrectionRequests(updated);
  return updated;
}
