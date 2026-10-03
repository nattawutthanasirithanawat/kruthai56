import { CertificateRecord } from '../types/certificate';
import { SAMPLE_CERTIFICATES } from './sampleData';

const DEFAULT_SHEET_KEY = 'su_thai_cert_sheet_id';
const DEFAULT_SHEET_NAME_KEY = 'su_thai_cert_sheet_name';
const CUSTOM_RECORDS_KEY = 'su_thai_custom_records';
const DELETED_IDS_KEY = 'su_thai_deleted_record_ids';

export function getLocalCustomRecords(): CertificateRecord[] {
  try {
    const raw = localStorage.getItem(CUSTOM_RECORDS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveLocalCustomRecords(records: CertificateRecord[]): void {
  try {
    localStorage.setItem(CUSTOM_RECORDS_KEY, JSON.stringify(records));
  } catch {
    // ignore
  }
}

export function getDeletedRecordIds(): string[] {
  try {
    const raw = localStorage.getItem(DELETED_IDS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveDeletedRecordIds(ids: string[]): void {
  try {
    localStorage.setItem(DELETED_IDS_KEY, JSON.stringify(ids));
  } catch {
    // ignore
  }
}

// Merge sheet records with local additions/edits/deletions
export function mergeWithLocalCustomData(baseRecords: CertificateRecord[]): CertificateRecord[] {
  const custom = getLocalCustomRecords();
  const deletedIds = new Set(getDeletedRecordIds());

  const recordMap = new Map<string, CertificateRecord>();

  // Add base records that are not deleted
  baseRecords.forEach((r) => {
    if (!deletedIds.has(r.id)) {
      recordMap.set(r.id, r);
    }
  });

  // Apply custom additions or edits
  custom.forEach((r) => {
    if (!deletedIds.has(r.id)) {
      recordMap.set(r.id, r);
    }
  });

  return Array.from(recordMap.values());
}

export function extractSheetId(input: string): string {
  const trimmed = input.trim();
  if (!trimmed) return '';
  const match = trimmed.match(/\/spreadsheets\/d\/([a-zA-Z0-9-_]+)/);
  if (match && match[1]) {
    return match[1];
  }
  return trimmed;
}

export function getSavedSheetId(): string {
  try {
    return localStorage.getItem(DEFAULT_SHEET_KEY) || '';
  } catch {
    return '';
  }
}

export function saveSheetId(id: string): void {
  try {
    localStorage.setItem(DEFAULT_SHEET_KEY, id);
  } catch {
    // ignore
  }
}

export function getSavedSheetName(): string {
  try {
    return localStorage.getItem(DEFAULT_SHEET_NAME_KEY) || '';
  } catch {
    return '';
  }
}

export function saveSheetName(name: string): void {
  try {
    localStorage.setItem(DEFAULT_SHEET_NAME_KEY, name);
  } catch {
    // ignore
  }
}

// Convert Google Drive links into preview or direct download links
export function formatPdfLink(rawUrl: string): { original: string; preview: string; download: string } {
  const url = rawUrl.trim();
  if (!url) return { original: '', preview: '', download: '' };

  // Google Drive link match: /file/d/([a-zA-Z0-9-_]+) or id=([a-zA-Z0-9-_]+)
  const driveFileMatch = url.match(/\/file\/d\/([a-zA-Z0-9-_]+)/);
  const driveIdMatch = url.match(/[?&]id=([a-zA-Z0-9-_]+)/);
  const fileId = (driveFileMatch && driveFileMatch[1]) || (driveIdMatch && driveIdMatch[1]);

  if (fileId) {
    return {
      original: url,
      preview: `https://drive.google.com/file/d/${fileId}/preview`,
      download: `https://drive.google.com/uc?export=download&id=${fileId}`,
    };
  }

  return {
    original: url,
    preview: url,
    download: url,
  };
}

function normalizeKey(str: string): string {
  return str.toLowerCase().replace(/[\s\-_/\\()]/g, '');
}

export function mapRowToCertificate(row: Record<string, string>, index: number, orderedHeaders: string[] = []): CertificateRecord {
  const keys = Object.keys(row);
  const normalizedMap: Record<string, string> = {};
  for (const k of keys) {
    normalizedMap[normalizeKey(k)] = row[k];
  }

  const findValue = (possibleMatches: string[]): string => {
    for (const match of possibleMatches) {
      const norm = normalizeKey(match);
      if (normalizedMap[norm] !== undefined && normalizedMap[norm] !== '') {
        return normalizedMap[norm].trim();
      }
      for (const k of Object.keys(normalizedMap)) {
        if (k.includes(norm) && normalizedMap[k]) {
          return normalizedMap[k].trim();
        }
      }
    }
    return '';
  };

  // If the sheet has exact columns 1: ชื่อโครงการ, 2: รหัสนักศึกษา, 3: ชื่อ-นามสกุล, 4: ลิงก์ PDF
  // we check by header name first, and if missing, use column index position
  let projectName = findValue(['ชื่อโครงการ', 'โครงการ', 'ชื่อกิจกรรม', 'กิจกรรม', 'project', 'projectname', 'activity']);
  let studentId = findValue(['รหัสนักศึกษา', 'รหัสประจำตัว', 'รหัส', 'เลขประจำตัว', 'studentid', 'studentcode', 'id']);
  let name = findValue(['ชื่อ-นามสกุล', 'ชื่อ นามสกุล', 'ชื่อนามสกุล', 'ชื่อ', 'name', 'fullname', 'ผู้รับ']);
  let pdfUrl = findValue(['ลิงก์pdfเกียรติบัตร', 'ลิงก์pdf', 'ลิงค์pdf', 'ลิงก์เกียรติบัตร', 'ลิงก์', 'ลิงค์', 'pdf', 'pdflink', 'link', 'url', 'drive']);

  // Position-based fallback if columns didn't match Thai names
  if (orderedHeaders.length >= 4) {
    if (!projectName && orderedHeaders[0]) projectName = row[orderedHeaders[0]] || '';
    if (!studentId && orderedHeaders[1]) studentId = row[orderedHeaders[1]] || '';
    if (!name && orderedHeaders[2]) name = row[orderedHeaders[2]] || '';
    if (!pdfUrl && orderedHeaders[3]) pdfUrl = row[orderedHeaders[3]] || '';
  }

  // Fallbacks
  projectName = projectName || 'โครงการสาขาวิชาภาษาไทย คณะศึกษาศาสตร์';
  studentId = studentId || '';
  name = name || `ผู้รับเกียรติบัตร ลำดับที่ ${index + 1}`;
  pdfUrl = pdfUrl || '';

  const certificateNo = findValue(['เลขที่เกียรติบัตร', 'เลขที่', 'เลขเกียรติบัตร', 'certno']) || `ศศ.ภท. ${String(index + 1).padStart(3, '0')}/๒๕๖๗`;
  const role = findValue(['รางวัล', 'บทบาท', 'ผลการแข่งขัน', 'สถานะ']) || 'ได้เข้าร่วมโครงการและผ่านเกณฑ์การประเมิน';
  const issueDate = findValue(['วันที่', 'วันเดือนปี', 'date']) || '๒๙ กรกฎาคม ๒๕๖๗';

  return {
    id: `cert-${index + 1}-${studentId || index}`,
    projectName,
    studentId,
    name,
    pdfUrl,
    certificateNo,
    role,
    issueDate,
    rawRow: row,
  };
}

interface GVizCell {
  v?: string | number | null;
  f?: string | null;
}

interface GVizCol {
  id?: string;
  label?: string;
  type?: string;
}

interface GVizRow {
  c: (GVizCell | null)[];
}

interface GVizData {
  cols: GVizCol[];
  rows: GVizRow[];
}

export async function fetchCertificatesFromSheet(
  rawSheetId: string,
  sheetName: string = ''
): Promise<{ certificates: CertificateRecord[]; headers: string[]; rawCount: number }> {
  const cleanId = extractSheetId(rawSheetId);

  // Return sample data if no sheet ID or set to demo
  if (!cleanId || cleanId === 'demo' || cleanId === 'sample') {
    const merged = mergeWithLocalCustomData(SAMPLE_CERTIFICATES);
    return {
      certificates: merged,
      headers: ['ชื่อโครงการ', 'รหัสนักศึกษา', 'ชื่อ-นามสกุล', 'ลิงก์ PDF เกียรติบัตร'],
      rawCount: merged.length,
    };
  }

  // Attempt 1: Fetch via Google Visualization API (GViz)
  const gvizUrl = `https://docs.google.com/spreadsheets/d/${cleanId}/gviz/tq?tqx=out:json${
    sheetName ? `&sheet=${encodeURIComponent(sheetName)}` : ''
  }&tq=SELECT%20*`;

  try {
    const res = await fetch(gvizUrl, { headers: { Accept: 'application/json, text/plain, */*' } });
    if (!res.ok) {
      throw new Error(`ไม่สามารถเข้าถึง Google Sheet ได้ (สถานะ HTTP ${res.status}) ตรวจสอบว่าตั้งค่าแชร์เป็น 'ทุกคนที่มีลิงก์มีสิทธิ์ดู'`);
    }

    const text = await res.text();
    const jsonMatch = text.match(/google\.visualization\.Query\.setResponse\(([\s\S]*)\);/);

    if (jsonMatch && jsonMatch[1]) {
      const parsed = JSON.parse(jsonMatch[1]);
      if (parsed.status === 'error') {
        throw new Error(parsed.errors?.[0]?.message || 'เกิดข้อผิดพลาดในการดึงข้อมูลจาก Google Sheet');
      }

      const table: GVizData = parsed.table;
      if (!table || !table.cols || !table.rows || table.rows.length === 0) {
        throw new Error('ไม่พบข้อมูลใน Google Sheet กรุณาตรวจสอบว่ามีข้อมูลในแถว');
      }

      const headers = table.cols.map((col, idx) => col.label?.trim() || `คอลัมน์_${idx + 1}`);

      const rows: Record<string, string>[] = [];
      table.rows.forEach((r) => {
        if (!r.c) return;
        const rowObj: Record<string, string> = {};
        let hasContent = false;

        r.c.forEach((cell, idx) => {
          const colName = headers[idx] || `คอลัมน์_${idx + 1}`;
          let val = '';
          if (cell !== null && cell !== undefined) {
            val = cell.f ?? (cell.v !== null && cell.v !== undefined ? String(cell.v) : '');
          }
          if (val.trim()) {
            hasContent = true;
          }
          rowObj[colName] = val;
        });

        if (hasContent) {
          rows.push(rowObj);
        }
      });

      const certificates = rows.map((row, idx) => mapRowToCertificate(row, idx, headers));
      const merged = mergeWithLocalCustomData(certificates);

      return {
        certificates: merged,
        headers,
        rawCount: merged.length,
      };
    }
  } catch (err: unknown) {
    console.warn('GViz fetch failed, trying CSV fallback...', err);
  }

  // Attempt 2: Fallback via CSV export
  try {
    const csvUrl = `https://docs.google.com/spreadsheets/d/${cleanId}/export?format=csv${
      sheetName ? `&sheet=${encodeURIComponent(sheetName)}` : ''
    }`;

    const csvRes = await fetch(csvUrl);
    if (!csvRes.ok) {
      throw new Error(
        `ไม่สามารถโหลด Google Sheet ได้ กรุณาตรวจสอบว่า:\n1. ใส่ Google Sheet ID ถูกต้อง\n2. ตั้งค่าการแชร์เป็น 'ทุกคนที่มีลิงก์มีสิทธิ์ดู' (Anyone with the link can view)`
      );
    }

    const csvText = await csvRes.text();
    const parsedCsv = parseCSV(csvText);

    if (parsedCsv.rows.length === 0) {
      throw new Error('ไม่พบข้อมูลในไฟล์ Google Sheet (ไฟล์ว่างเปล่า)');
    }

    const certificates = parsedCsv.rows.map((row, idx) => mapRowToCertificate(row, idx, parsedCsv.headers));
    const merged = mergeWithLocalCustomData(certificates);

    return {
      certificates: merged,
      headers: parsedCsv.headers,
      rawCount: merged.length,
    };
  } catch (finalErr: unknown) {
    const msg = finalErr instanceof Error ? finalErr.message : String(finalErr);
    throw new Error(
      `เกิดข้อผิดพลาดในการเชื่อมต่อ Google Sheet ID: ${cleanId}\nสาเหตุ: ${msg}\n\nคำแนะนำ: กรุณาเปิดไฟล์ Google Sheet -> กดปุ่ม 'แชร์ (Share)' ด้านบนขวา -> เปลี่ยนเป็น 'ทุกคนที่มีลิงก์' (Anyone with link) 'มีสิทธิ์ดู' (Viewer)`
    );
  }
}

function parseCSV(text: string): { headers: string[]; rows: Record<string, string>[] } {
  const lines: string[][] = [];
  let row: string[] = [];
  let inQuotes = false;
  let currentVal = '';

  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    const nextChar = text[i + 1];

    if (char === '"') {
      if (inQuotes && nextChar === '"') {
        currentVal += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === ',' && !inQuotes) {
      row.push(currentVal.trim());
      currentVal = '';
    } else if ((char === '\r' || char === '\n') && !inQuotes) {
      if (char === '\r' && nextChar === '\n') {
        i++;
      }
      row.push(currentVal.trim());
      if (row.some((c) => c.length > 0)) {
        lines.push(row);
      }
      row = [];
      currentVal = '';
    } else {
      currentVal += char;
    }
  }

  if (currentVal || row.length > 0) {
    row.push(currentVal.trim());
    if (row.some((c) => c.length > 0)) {
      lines.push(row);
    }
  }

  if (lines.length === 0) return { headers: [], rows: [] };

  const headers = lines[0].map((h, i) => h || `คอลัมน์_${i + 1}`);
  const dataRows: Record<string, string>[] = [];

  for (let i = 1; i < lines.length; i++) {
    const r = lines[i];
    const rowObj: Record<string, string> = {};
    let hasVal = false;
    headers.forEach((header, idx) => {
      const val = r[idx] || '';
      rowObj[header] = val;
      if (val) hasVal = true;
    });
    if (hasVal) {
      dataRows.push(rowObj);
    }
  }

  return { headers, rows: dataRows };
}
