export interface CertificateRecord {
  id: string;
  projectName: string;      // 1. ชื่อโครงการ
  studentId: string;        // 2. รหัสนักศึกษา
  name: string;             // 3. ชื่อ-นามสกุล
  pdfUrl: string;           // 4. ลิงก์ PDF เกียรติบัตร
  
  // Secondary metadata
  certificateNo?: string;
  role?: string;
  issueDate?: string;
  organization?: string;
  signatory1Name?: string;
  signatory1Title?: string;
  signatory2Name?: string;
  signatory2Title?: string;
  rawRow?: Record<string, string>;
}

export type RequestStatus = 'ยื่นคำขอแล้ว' | 'แอดมินรับคำขอ' | 'กำลังดำเนินการ' | 'เสร็จสิ้น แก้ไขแล้ว';

export interface CorrectionRequest {
  id: string;
  trackingNumber: string;       // เลขติดตามอัตโนมัติ เช่น REQ-67-001
  projectName: string;          // ๑. โครงการที่ประสงค์แก้ไข
  studentId: string;            // รหัสนักศึกษา
  originalName: string;         // ชื่อเดิมในระบบ
  correctedName: string;        // ชื่อที่ถูกต้องเพื่อแก้ไข
  contactInfo?: string;         // เบอร์โทรศัพท์ หรือช่องทางติดต่อ
  reason?: string;              // เหตุผลหรือรายละเอียด
  status: RequestStatus;        // สถานะคำร้อง ๔ ขั้น
  submittedAt: string;          // วันที่ยื่นคำร้อง
  updatedAt: string;            // วันที่อัปเดตสถานะล่าสุด
  adminNotes?: string;          // หมายเหตุจากแอดมิน
}

export interface SheetConfig {
  sheetId: string;
  sheetName: string;
  status: 'idle' | 'loading' | 'success' | 'error';
  lastSyncedAt: string | null;
  errorMessage: string | null;
  totalRecords: number;
}
