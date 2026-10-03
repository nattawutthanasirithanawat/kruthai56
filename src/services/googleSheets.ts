import { CertificateRecord } from '../types/certificate';
import { SAMPLE_CERTIFICATES } from './sampleData';

// Permanent Google Sheet ID specified by user
export const PERMANENT_SHEET_ID = '1hb2fdnWMIr7-nhlEw8NGYeYYSwmZUfQfLm8gJHqO_Ww';

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
  if (!trimmed) return PERMANENT_SHEET_ID;
  const match = trimmed.match(/\/spreadsheets\/d\/([a-zA-Z0-9-_]+)/);
  if (match && match[1]) {
    return match[1];
  }
  return trimmed;
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
  rawSheetId: string = PERMANENT_SHEET_ID,
  sheetName: string = ''
): Promise<{ certificates: CertificateRecord[]; headers: string[]; rawCount: number }> {
  const cleanId = extractSheetId(rawSheetId) || PERMANENT_SHEET_ID;

  // Fetch via Google Visualization API (GViz)
  const gvizUrl = `https://docs.google.com/spreadsheets/d/${cleanId}/gviz/tq?tqx=out:json${
    sheetName ? `&sheet=${encodeURIComponent(sheetName)}` : ''
  }&tq=SELECT%20*`;

  try {
    const res = await fetch(gvizUrl, { headers: { Accept: 'application/json, text/plain, */*' } });
    if (!res.ok) {
      throw new Error(`ไม่สามารถเข้าถึง Google Sheet ได้ (สถานะ HTTP ${res.status})`);
    }

    const text = await res.text();
    const jsonMatch = text.match(/google\.visualization\.Query\.setResponse\(([\s\S]*)\);/);

    if (jsonMatch && jsonMatch[1]) {
      const parsed = JSON.parse(jsonMatch[1]);
      if (parsed.status === 'error') {
        throw new Error(parsed.errors?.[0]?.message || 'เกิดข้อผิดพลาดในการดึงข้อมูลจาก Google Sheet');
      }

      const table: GVizData = parsed.table;
      if (!table || !table.rows || table.rows.length === 0) {
        throw new Error('ไม่พบข้อมูลใน Google Sheet');
      }

      const cellVal = (c: GVizCell | null | undefined): string => {
        if (!c) return '';
        return (c.f ?? (c.v !== null && c.v !== undefined ? String(c.v) : '')).trim();
      };

      const parsedCertificates: CertificateRecord[] = [];

      table.rows.forEach((r, idx) => {
        if (!r.c || r.c.length === 0) return;

        const val0 = cellVal(r.c[0]);
        const val1 = cellVal(r.c[1]);
        const val2 = cellVal(r.c[2]);
        const val3 = cellVal(r.c[3]);

        // If this row is a header row, skip it
        if (
          (val0.includes('โครงการ') || val0.toLowerCase().includes('project')) &&
          (val2.includes('ชื่อ') || val2.toLowerCase().includes('name'))
        ) {
          return;
        }

        // Must have at least a name or student ID
        if (!val2 && !val1) return;

        parsedCertificates.push({
          id: `su-cert-${val1 || idx + 1}`,
          projectName: val0 || 'สาขาวิชาภาษาไทย คณะศึกษาศาสตร์ ม.ศิลปากร',
          studentId: val1 || '',
          name: val2 || `ผู้เข้าร่วม ลำดับที่ ${idx + 1}`,
          pdfUrl: val3 || '',
        });
      });

      const merged = mergeWithLocalCustomData(parsedCertificates);

      return {
        certificates: merged,
        headers: ['ชื่อโครงการ', 'รหัสนักศึกษา', 'ชื่อ-นามสกุล', 'ลิงก์ PDF เกียรติบัตร'],
        rawCount: merged.length,
      };
    }
  } catch (err: unknown) {
    console.warn('GViz fetch failed, checking local or fallback...', err);
  }

  // Fallback to sample data if offline
  const mergedFallback = mergeWithLocalCustomData(SAMPLE_CERTIFICATES);
  return {
    certificates: mergedFallback,
    headers: ['ชื่อโครงการ', 'รหัสนักศึกษา', 'ชื่อ-นามสกุล', 'ลิงก์ PDF เกียรติบัตร'],
    rawCount: mergedFallback.length,
  };
}
