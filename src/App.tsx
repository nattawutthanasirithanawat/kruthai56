import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { CertificateRecord } from './types/certificate';
import {
  fetchCertificatesFromSheet,
  getSavedSheetId,
  saveSheetId,
  getSavedSheetName,
  saveSheetName,
  extractSheetId,
} from './services/googleSheets';
import { Header } from './components/Header';
import { HeroSection } from './components/HeroSection';
import { SearchCertificate } from './components/SearchCertificate';
import { PDFViewerModal } from './components/PDFViewerModal';
import { AdminModal } from './components/AdminModal';
import { GuideModal } from './components/GuideModal';
import { ActivitiesShowcase } from './components/ActivitiesShowcase';
import { CorrectionRequestSection } from './components/CorrectionRequestSection';
import { Footer } from './components/Footer';

export default function App() {
  const [sheetId, setSheetId] = useState<string>(getSavedSheetId());
  const [sheetName, setSheetName] = useState<string>(getSavedSheetName());
  const [certificates, setCertificates] = useState<CertificateRecord[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [activePdfCert, setActivePdfCert] = useState<CertificateRecord | null>(null);
  const [isAdminOpen, setIsAdminOpen] = useState<boolean>(false);
  const [isGuideOpen, setIsGuideOpen] = useState<boolean>(false);

  const cleanSheetId = extractSheetId(sheetId);

  const loadData = useCallback(async (id: string, name: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetchCertificatesFromSheet(id, name);
      setCertificates(res.certificates);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      setError(msg);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData(sheetId, sheetName);
  }, [sheetId, sheetName, loadData]);

  const handleSaveSheetConfig = (newId: string, newName: string) => {
    setSheetId(newId);
    setSheetName(newName);
    saveSheetId(newId);
    saveSheetName(newName);
  };

  const handleRefresh = () => {
    loadData(sheetId, sheetName);
  };

  const handleScrollToSearch = () => {
    const el = document.getElementById('search-section');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleScrollToCorrection = () => {
    const el = document.getElementById('correction-section');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleSelectProjectFromShowcase = (projectName: string) => {
    handleScrollToSearch();
    const select = document.querySelector('select') as HTMLSelectElement | null;
    if (select) {
      select.value = projectName;
      select.dispatchEvent(new Event('change', { bubbles: true }));
    }
  };

  // Distinct list of project names for correction requests
  const availableProjects = useMemo(() => {
    const set = new Set<string>();
    certificates.forEach((c) => {
      if (c.projectName?.trim()) {
        set.add(c.projectName.trim());
      }
    });
    return Array.from(set);
  }, [certificates]);

  return (
    <div className="min-h-screen bg-[#faf7fc] text-stone-800 flex flex-col selection:bg-purple-200 selection:text-purple-950 font-sarabun">
      {/* Top Bar Header - Admin button is strictly only here at top right */}
      <Header
        onOpenAdmin={() => setIsAdminOpen(true)}
        onOpenGuide={() => setIsGuideOpen(true)}
        totalRecords={certificates.length}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 pt-6">
        {/* Hero Section */}
        <HeroSection
          onScrollToSearch={handleScrollToSearch}
          onScrollToCorrection={handleScrollToCorrection}
          totalRecords={certificates.length}
        />

        {/* Certificate Search & Results */}
        <section id="search-section" className="scroll-mt-20">
          <div className="mb-4">
            <h2 className="text-xl sm:text-2xl font-bold font-prompt text-purple-950">
              ค้นหาและดาวน์โหลดเกียรติบัตร
            </h2>
            <p className="text-xs sm:text-sm text-stone-500 font-sarabun mt-0.5">
              เลือกโครงการ และเลือกค้นหาด้วยรหัสนักศึกษา หรือชื่อ-นามสกุล
            </p>
          </div>

          <SearchCertificate
            certificates={certificates}
            onOpenPdfViewer={(cert) => setActivePdfCert(cert)}
            isLoading={isLoading}
          />
        </section>

        {/* Projects Showcase */}
        <ActivitiesShowcase
          certificates={certificates}
          onSelectProject={handleSelectProjectFromShowcase}
        />

        {/* Requirement 3: Certificate Correction Request System at the bottom */}
        <CorrectionRequestSection
          availableProjects={availableProjects}
          onRequestSubmitted={handleRefresh}
        />
      </main>

      {/* Footer */}
      <Footer />

      {/* Requirement 4: PDF Preview Modal with Download button inside */}
      {activePdfCert && (
        <PDFViewerModal
          certificate={activePdfCert}
          onClose={() => setActivePdfCert(null)}
        />
      )}

      {/* Requirement 3: Admin Modal (Kruthai56 / kruthai566868) */}
      {isAdminOpen && (
        <AdminModal
          currentSheetId={sheetId}
          currentSheetName={sheetName}
          certificates={certificates}
          onSaveSheetConfig={handleSaveSheetConfig}
          onRefreshData={handleRefresh}
          onClose={() => setIsAdminOpen(false)}
        />
      )}

      {/* User Guide Modal */}
      {isGuideOpen && (
        <GuideModal
          onClose={() => setIsGuideOpen(false)}
        />
      )}
    </div>
  );
}
