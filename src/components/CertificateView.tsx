import React, { useRef, useState } from 'react';
import { Download, Printer, Share2, Check, ShieldCheck, X, ZoomIn, ZoomOut, Sparkles } from 'lucide-react';
import confetti from 'canvas-confetti';
import { jsPDF } from 'jspdf';
import { CertificateRecord } from '../types/certificate';
import sealImg from '../assets/images/thai_ornate_seal_1791029724702.jpg';

interface CertificateViewProps {
  certificate: CertificateRecord;
  onClose?: () => void;
}

export const CertificateView: React.FC<CertificateViewProps> = ({ certificate, onClose }) => {
  const [isExporting, setIsExporting] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [scale, setScale] = useState(1);
  const certRef = useRef<HTMLDivElement>(null);

  // Trigger celebration confetti
  const triggerConfetti = () => {
    confetti({
      particleCount: 70,
      spread: 60,
      origin: { y: 0.6 },
      colors: ['#c59b27', '#0a4b3d', '#1e3a8a', '#e5c158'],
    });
  };

  // Generate high-resolution canvas representation
  const generateCanvas = async (): Promise<HTMLCanvasElement> => {
    const width = 2480; // A4 Landscape 300 DPI
    const height = 1754;
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('Could not get 2D context');

    // Enable high quality rendering
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';

    // 1. Background Parchment
    const bgGradient = ctx.createLinearGradient(0, 0, width, height);
    bgGradient.addColorStop(0, '#fefdfb');
    bgGradient.addColorStop(0.5, '#fbf8ef');
    bgGradient.addColorStop(1, '#f9f5e8');
    ctx.fillStyle = bgGradient;
    ctx.fillRect(0, 0, width, height);

    // Subtle guilloche/watermark ring in center
    ctx.save();
    ctx.strokeStyle = 'rgba(197, 155, 39, 0.07)';
    ctx.lineWidth = 3;
    for (let r = 200; r <= 600; r += 50) {
      ctx.beginPath();
      ctx.arc(width / 2, height / 2 + 50, r, 0, Math.PI * 2);
      ctx.stroke();
    }
    ctx.restore();

    // 2. Borders
    // Outer border (Deep Veridian Teal: #0a4b3d)
    ctx.lineWidth = 14;
    ctx.strokeStyle = '#0a4b3d';
    ctx.strokeRect(50, 50, width - 100, height - 100);

    // Inner gold border (#c59b27)
    ctx.lineWidth = 4;
    ctx.strokeStyle = '#c59b27';
    ctx.strokeRect(74, 74, width - 148, height - 148);

    // Thinner secondary gold border
    ctx.lineWidth = 1.5;
    ctx.strokeStyle = '#d4af37';
    ctx.strokeRect(84, 84, width - 168, height - 168);

    // Corner Ornaments
    const drawCorner = (x: number, y: number, angle: number) => {
      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(angle);
      ctx.strokeStyle = '#c59b27';
      ctx.lineWidth = 3;

      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(80, 0);
      ctx.moveTo(0, 0);
      ctx.lineTo(0, 80);
      ctx.stroke();

      // Corner diamond
      ctx.fillStyle = '#0a4b3d';
      ctx.beginPath();
      ctx.arc(35, 35, 12, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#d4af37';
      ctx.lineWidth = 2;
      ctx.stroke();

      ctx.restore();
    };

    drawCorner(95, 95, 0);
    drawCorner(width - 95, 95, Math.PI / 2);
    drawCorner(width - 95, height - 95, Math.PI);
    drawCorner(95, height - 95, -Math.PI / 2);

    // 3. Draw Emblem Seal
    try {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      await new Promise<void>((resolve) => {
        img.onload = () => resolve();
        img.onerror = () => resolve();
        img.src = sealImg;
      });
      if (img.complete && img.naturalWidth !== 0) {
        const sealSize = 190;
        ctx.save();
        ctx.beginPath();
        ctx.arc(width / 2, 220, sealSize / 2, 0, Math.PI * 2);
        ctx.clip();
        ctx.drawImage(img, width / 2 - sealSize / 2, 220 - sealSize / 2, sealSize, sealSize);
        ctx.restore();

        // Seal rim
        ctx.strokeStyle = '#c59b27';
        ctx.lineWidth = 5;
        ctx.beginPath();
        ctx.arc(width / 2, 220, sealSize / 2 + 3, 0, Math.PI * 2);
        ctx.stroke();
      }
    } catch {
      // Seal fallback drawn if image fails
      ctx.fillStyle = '#0a4b3d';
      ctx.beginPath();
      ctx.arc(width / 2, 220, 80, 0, Math.PI * 2);
      ctx.fill();
    }

    // 4. Texts
    ctx.textAlign = 'center';

    // Faculty & University Header
    ctx.font = 'bold 50px "Sarabun", "Prompt", sans-serif';
    ctx.fillStyle = '#0a4b3d';
    ctx.fillText('สาขาวิชาภาษาไทย คณะศึกษาศาสตร์ มหาวิทยาลัยศิลปากร', width / 2, 380);

    ctx.font = '500 28px "Sarabun", sans-serif';
    ctx.fillStyle = '#4a5568';
    ctx.fillText('Department of Thai Language, Faculty of Education, Silpakorn University', width / 2, 430);

    // Gold divider
    ctx.strokeStyle = '#c59b27';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(width / 2 - 250, 465);
    ctx.lineTo(width / 2 + 250, 465);
    ctx.stroke();

    // Certificate Title Kicker
    ctx.font = '400 36px "Sarabun", sans-serif';
    ctx.fillStyle = '#2d3748';
    ctx.fillText('เกียรติบัตรฉบับนี้ให้ไว้เพื่อแสดงว่า', width / 2, 540);

    // Recipient Name
    ctx.font = 'bold 78px "Sarabun", "Prompt", sans-serif';
    ctx.fillStyle = '#0a4b3d';
    ctx.fillText(certificate.name, width / 2, 670);

    // Decorative underline for name
    ctx.strokeStyle = 'rgba(197, 155, 39, 0.6)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(width / 2 - 400, 715);
    ctx.lineTo(width / 2 + 400, 715);
    ctx.stroke();

    // Organization (if present)
    if (certificate.organization) {
      ctx.font = '500 34px "Sarabun", sans-serif';
      ctx.fillStyle = '#4a5568';
      ctx.fillText(certificate.organization, width / 2, 770);
    }

    // Role / Achievement
    ctx.font = '600 44px "Sarabun", sans-serif';
    ctx.fillStyle = '#1a202c';
    const roleY = certificate.organization ? 850 : 810;
    ctx.fillText(certificate.role || 'ได้เข้าร่วมโครงการและผ่านเกณฑ์การประเมิน', width / 2, roleY);

    // Project Name
    ctx.font = '500 38px "Sarabun", sans-serif';
    ctx.fillStyle = '#2d3748';
    const actY = roleY + 70;
    ctx.fillText(certificate.projectName || 'โครงการสาขาวิชาภาษาไทย คณะศึกษาศาสตร์', width / 2, actY);

    // Issue Date
    ctx.font = '400 34px "Sarabun", sans-serif';
    ctx.fillStyle = '#4a5568';
    const dateY = actY + 80;
    ctx.fillText(`ให้ไว้ ณ วันที่ ${certificate.issueDate || '๒๙ กรกฎาคม ๒๕๖๗'}`, width / 2, dateY);

    // 5. Signatories
    const sigY = 1320;
    const sig1X = width * 0.3;
    const sig2X = width * 0.7;

    // Simulate authentic royal academic signature flourish
    const drawSignature = (x: number, y: number) => {
      ctx.save();
      ctx.strokeStyle = '#0f2942';
      ctx.lineWidth = 3;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(x - 70, y - 25);
      ctx.bezierCurveTo(x - 40, y - 60, x - 10, y - 5, x + 30, y - 40);
      ctx.bezierCurveTo(x + 50, y - 20, x + 80, y - 50, x + 90, y - 10);
      ctx.moveTo(x - 60, y - 10);
      ctx.lineTo(x + 100, y - 10);
      ctx.stroke();
      ctx.restore();
    };

    drawSignature(sig1X, sigY);
    drawSignature(sig2X, sigY);

    // Signatory 1
    ctx.font = '600 32px "Sarabun", sans-serif';
    ctx.fillStyle = '#1a202c';
    ctx.fillText(
      `(${certificate.signatory1Name || 'ผู้ช่วยศาสตราจารย์ ดร.เกษม เพชรเกตุ'})`,
      sig1X,
      sigY + 45
    );

    ctx.font = '400 28px "Sarabun", sans-serif';
    ctx.fillStyle = '#4a5568';
    ctx.fillText(
      certificate.signatory1Title || 'หัวหน้าสาขาวิชาภาษาไทย คณะศึกษาศาสตร์',
      sig1X,
      sigY + 85
    );

    // Signatory 2
    ctx.font = '600 32px "Sarabun", sans-serif';
    ctx.fillStyle = '#1a202c';
    ctx.fillText(
      `(${certificate.signatory2Name || 'รองศาสตราจารย์ ดร.มาเรียม นิลพันธุ์'})`,
      sig2X,
      sigY + 45
    );

    ctx.font = '400 28px "Sarabun", sans-serif';
    ctx.fillStyle = '#4a5568';
    ctx.fillText(
      certificate.signatory2Title || 'คณบดีคณะศึกษาศาสตร์ มหาวิทยาลัยศิลปากร',
      sig2X,
      sigY + 85
    );

    // 6. Bottom Certificate Number & Verification
    ctx.textAlign = 'left';
    ctx.font = '400 26px "Sarabun", sans-serif';
    ctx.fillStyle = '#718096';
    ctx.fillText(`เลขที่: ${certificate.certificateNo}`, 120, height - 120);

    ctx.textAlign = 'right';
    ctx.fillText('ตรวจสอบความถูกต้องได้ที่ สาขาวิชาภาษาไทย คณะศึกษาศาสตร์ ม.ศิลปากร', width - 120, height - 120);

    return canvas;
  };

  // Download high-resolution PNG
  const handleDownloadPNG = async () => {
    try {
      setIsExporting(true);
      triggerConfetti();
      const canvas = await generateCanvas();
      const dataUrl = canvas.toDataURL('image/png', 1.0);
      const link = document.createElement('a');
      const safeName = certificate.name.replace(/[^a-zA-Z0-9\u0E00-\u0E7F]/g, '_');
      const safeNo = (certificate.certificateNo || 'cert').replace(/[^a-zA-Z0-9\u0E00-\u0E7F]/g, '_');
      link.download = `เกียรติบัตร_${safeName}_${safeNo}.png`;
      link.href = dataUrl;
      link.click();
    } catch (err) {
      console.error('Download PNG failed', err);
    } finally {
      setIsExporting(false);
    }
  };

  // Download PDF using jsPDF
  const handleDownloadPDF = async () => {
    try {
      setIsExporting(true);
      triggerConfetti();
      const canvas = await generateCanvas();
      const imgData = canvas.toDataURL('image/jpeg', 0.95);

      // A4 Landscape is 297mm x 210mm
      const pdf = new jsPDF({
        orientation: 'landscape',
        unit: 'mm',
        format: 'a4',
      });

      pdf.addImage(imgData, 'JPEG', 0, 0, 297, 210, undefined, 'FAST');
      const safeName = certificate.name.replace(/[^a-zA-Z0-9\u0E00-\u0E7F]/g, '_');
      const safeNo = (certificate.certificateNo || 'cert').replace(/[^a-zA-Z0-9\u0E00-\u0E7F]/g, '_');
      pdf.save(`เกียรติบัตร_${safeName}_${safeNo}.pdf`);
    } catch (err) {
      console.error('Download PDF failed', err);
    } finally {
      setIsExporting(false);
    }
  };

  // Print directly
  const handlePrint = () => {
    window.print();
  };

  // Share verification copy
  const handleCopyLink = () => {
    const text = `เกียรติบัตร สาขาวิชาภาษาไทย คณะศึกษาศาสตร์ มหาวิทยาลัยศิลปากร เลขที่ ${certificate.certificateNo || '-'} มอบให้แก่ ${certificate.name}`;
    navigator.clipboard.writeText(text);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-stone-900/80 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-6xl bg-stone-900 border border-stone-800 rounded-2xl shadow-2xl flex flex-col my-auto max-h-[95vh] overflow-hidden">
        {/* Top Action Control Bar */}
        <div className="no-print flex items-center justify-between px-5 py-3.5 bg-stone-900 border-b border-stone-800 text-stone-100">
          <div className="flex items-center gap-3">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
            <div>
              <h3 className="font-prompt font-semibold text-sm sm:text-base text-stone-100 flex items-center gap-2">
                เกียรติบัตรฉบับสมบูรณ์
                <span className="text-xs font-normal text-amber-400 border border-amber-500/30 bg-amber-500/10 px-2 py-0.5 rounded">
                  {certificate.certificateNo || 'ฉบับอิเล็กทรอนิกส์'}
                </span>
              </h3>
              <p className="text-xs text-stone-400 truncate max-w-md hidden sm:block">
                {certificate.name} · {certificate.projectName}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Zoom Controls */}
            <div className="hidden md:flex items-center bg-stone-800 rounded-lg p-1 mr-2 text-stone-300">
              <button
                onClick={() => setScale((s) => Math.max(0.7, s - 0.1))}
                className="p-1 hover:text-white hover:bg-stone-700 rounded transition-colors"
                title="ย่อ"
              >
                <ZoomOut className="w-4 h-4" />
              </button>
              <span className="px-2 text-xs font-mono">{Math.round(scale * 100)}%</span>
              <button
                onClick={() => setScale((s) => Math.min(1.3, s + 0.1))}
                className="p-1 hover:text-white hover:bg-stone-700 rounded transition-colors"
                title="ขยาย"
              >
                <ZoomIn className="w-4 h-4" />
              </button>
            </div>

            {/* Print Button */}
            <button
              onClick={handlePrint}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-stone-300 bg-stone-800 hover:bg-stone-700 rounded-lg transition-colors"
            >
              <Printer className="w-4 h-4" />
              <span className="hidden sm:inline">พิมพ์</span>
            </button>

            {/* Share / Copy Info */}
            <button
              onClick={handleCopyLink}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-stone-300 bg-stone-800 hover:bg-stone-700 rounded-lg transition-colors"
              title="คัดลอกข้อมูลเกียรติบัตร"
            >
              {copiedLink ? <Check className="w-4 h-4 text-emerald-400" /> : <Share2 className="w-4 h-4" />}
              <span className="hidden sm:inline">{copiedLink ? 'คัดลอกแล้ว' : 'แชร์'}</span>
            </button>

            {/* Download PNG */}
            <button
              onClick={handleDownloadPNG}
              disabled={isExporting}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-medium text-stone-900 bg-amber-400 hover:bg-amber-300 rounded-lg font-prompt transition-colors disabled:opacity-50"
            >
              <Download className="w-4 h-4" />
              <span>ดาวน์โหลดรูป (PNG)</span>
            </button>

            {/* Download PDF */}
            <button
              onClick={handleDownloadPDF}
              disabled={isExporting}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-medium text-white bg-emerald-700 hover:bg-emerald-600 rounded-lg font-prompt transition-colors disabled:opacity-50"
            >
              <Sparkles className="w-4 h-4" />
              <span>ดาวน์โหลด PDF</span>
            </button>

            {/* Close */}
            {onClose && (
              <button
                onClick={onClose}
                className="p-1.5 text-stone-400 hover:text-white hover:bg-stone-800 rounded-lg ml-1 transition-colors"
                title="ปิดหน้าต่าง"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>
        </div>

        {/* Certificate Display Area */}
        <div className="p-4 sm:p-8 overflow-auto flex justify-center bg-stone-950/70">
          <div
            style={{ transform: `scale(${scale})`, transformOrigin: 'top center' }}
            className="transition-transform duration-150"
          >
            {/* The Certificate Canvas Frame (Standard A4 Landscape Ratio 1.414:1) */}
            <div
              ref={certRef}
              className="w-[960px] h-[678px] bg-gradient-to-br from-[#fefdfa] via-[#fbf8ef] to-[#f8f3e5] relative p-8 shadow-2xl flex flex-col justify-between text-stone-800 border-[10px] border-[#0a4b3d] select-none rounded-sm overflow-hidden"
            >
              {/* Inner Decorative Golden Border */}
              <div className="absolute inset-2 border-2 border-[#c59b27] pointer-events-none" />
              <div className="absolute inset-3 border border-[#d4af37]/50 pointer-events-none" />

              {/* Four Corner Ornaments */}
              <div className="absolute top-4 left-4 w-10 h-10 border-t-2 border-l-2 border-[#c59b27] flex items-center justify-center">
                <div className="w-2.5 h-2.5 rounded-full bg-[#0a4b3d] border border-[#d4af37]" />
              </div>
              <div className="absolute top-4 right-4 w-10 h-10 border-t-2 border-r-2 border-[#c59b27] flex items-center justify-center">
                <div className="w-2.5 h-2.5 rounded-full bg-[#0a4b3d] border border-[#d4af37]" />
              </div>
              <div className="absolute bottom-4 left-4 w-10 h-10 border-b-2 border-l-2 border-[#c59b27] flex items-center justify-center">
                <div className="w-2.5 h-2.5 rounded-full bg-[#0a4b3d] border border-[#d4af37]" />
              </div>
              <div className="absolute bottom-4 right-4 w-10 h-10 border-b-2 border-r-2 border-[#c59b27] flex items-center justify-center">
                <div className="w-2.5 h-2.5 rounded-full bg-[#0a4b3d] border border-[#d4af37]" />
              </div>

              {/* Watermark Crest Background Pattern */}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-[0.04]">
                <img
                  src={sealImg}
                  alt="Watermark Crest"
                  referrerPolicy="no-referrer"
                  className="w-[480px] h-[480px] object-contain filter grayscale"
                />
              </div>

              {/* Certificate Header: Seal & University Name */}
              <div className="relative text-center mt-2">
                <div className="flex justify-center mb-3">
                  <div className="relative w-20 h-20 rounded-full border-2 border-[#c59b27] p-0.5 bg-white shadow-md">
                    <img
                      src={sealImg}
                      alt="Silpakorn Academic Seal"
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover rounded-full"
                    />
                  </div>
                </div>

                <h1 className="text-2xl font-bold font-prompt text-[#0a4b3d] tracking-wide leading-tight">
                  สาขาวิชาภาษาไทย คณะศึกษาศาสตร์ มหาวิทยาลัยศิลปากร
                </h1>
                <p className="text-xs text-stone-500 font-sarabun tracking-wider uppercase mt-0.5">
                  Department of Thai Language, Faculty of Education, Silpakorn University
                </p>

                <div className="w-36 h-0.5 bg-gradient-to-r from-transparent via-[#c59b27] to-transparent mx-auto mt-2" />
              </div>

              {/* Certificate Body */}
              <div className="relative text-center my-auto px-6">
                <p className="text-base text-stone-600 font-sarabun mb-3">
                  เกียรติบัตรฉบับนี้ให้ไว้เพื่อแสดงว่า
                </p>

                {/* Recipient Name in Regal Typography */}
                <h2 className="text-3xl sm:text-4xl font-bold font-prompt text-[#0a4b3d] tracking-normal mb-1">
                  {certificate.name}
                </h2>

                {certificate.organization && (
                  <p className="text-sm font-medium text-stone-600 font-sarabun mb-2">
                    {certificate.organization}
                  </p>
                )}

                <div className="w-56 h-[1px] bg-[#c59b27]/60 mx-auto my-3" />

                {/* Role and Achievement */}
                <p className="text-lg font-semibold text-stone-900 font-sarabun leading-relaxed max-w-2xl mx-auto">
                  {certificate.role || 'ได้เข้าร่วมโครงการและผ่านเกณฑ์การประเมิน'}
                </p>

                {/* Event Name */}
                <p className="text-base font-medium text-stone-700 font-sarabun mt-1">
                  {certificate.projectName}
                </p>

                {/* Issue Date */}
                <p className="text-sm text-stone-600 font-sarabun mt-3">
                  ให้ไว้ ณ วันที่ {certificate.issueDate || '๒๙ กรกฎาคม ๒๕๖๗'}
                </p>
              </div>

              {/* Signatures Section */}
              <div className="relative grid grid-cols-2 gap-8 px-12 mb-3">
                {/* Signatory 1 */}
                <div className="text-center flex flex-col items-center">
                  <div className="h-10 flex items-center justify-center">
                    {/* Stylized realistic signature stroke */}
                    <svg className="w-32 h-8 text-[#0f2942]" viewBox="0 0 160 40" fill="none">
                      <path
                        d="M10 25 C30 5, 45 35, 70 15 C90 0, 110 30, 140 10 M20 28 L145 28"
                        stroke="currentColor"
                        strokeWidth="2.2"
                        strokeLinecap="round"
                      />
                    </svg>
                  </div>
                  <div className="text-xs font-semibold text-stone-800 font-sarabun mt-1">
                    ({certificate.signatory1Name || 'ผู้ช่วยศาสตราจารย์ ดร.เกษม เพชรเกตุ'})
                  </div>
                  <div className="text-[11px] text-stone-500 font-sarabun">
                    {certificate.signatory1Title || 'หัวหน้าสาขาวิชาภาษาไทย คณะศึกษาศาสตร์'}
                  </div>
                </div>

                {/* Signatory 2 */}
                <div className="text-center flex flex-col items-center">
                  <div className="h-10 flex items-center justify-center">
                    {/* Stylized realistic signature stroke */}
                    <svg className="w-32 h-8 text-[#0f2942]" viewBox="0 0 160 40" fill="none">
                      <path
                        d="M15 20 C40 35, 60 5, 85 25 C105 40, 125 10, 145 20 M30 30 L150 26"
                        stroke="currentColor"
                        strokeWidth="2.2"
                        strokeLinecap="round"
                      />
                    </svg>
                  </div>
                  <div className="text-xs font-semibold text-stone-800 font-sarabun mt-1">
                    ({certificate.signatory2Name || 'รองศาสตราจารย์ ดร.มาเรียม นิลพันธุ์'})
                  </div>
                  <div className="text-[11px] text-stone-500 font-sarabun">
                    {certificate.signatory2Title || 'คณบดีคณะศึกษาศาสตร์ มหาวิทยาลัยศิลปากร'}
                  </div>
                </div>
              </div>

              {/* Certificate Footer Metadata */}
              <div className="relative flex justify-between items-center text-[10px] text-stone-500 border-t border-stone-200/80 pt-2 px-2">
                <div className="flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                  <span>เลขที่เกียรติบัตร: <strong className="font-mono text-stone-700">{certificate.certificateNo || 'ศศ.ภท.'}</strong></span>
                </div>
                <div className="text-stone-400">
                  ระบบออกเกียรติบัตรอิเล็กทรอนิกส์ มหาวิทยาลัยศิลปากร
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Helper Bar */}
        <div className="no-print px-6 py-3 bg-stone-900 border-t border-stone-800 text-xs text-stone-400 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="text-amber-400">💡 คำแนะนำ:</span>
            <span>สามารถดาวน์โหลดเป็น PDF หรือไฟล์รูปภาพ PNG ความละเอียดสูง (A4 300 DPI) สำหรับพิมพ์ใส่กรอบ</span>
          </div>
          {certificate.studentId && (
            <div className="text-stone-500 font-mono text-[11px]">
              รหัสนักศึกษา: {certificate.studentId}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
