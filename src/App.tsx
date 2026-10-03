import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { CertificateRecord } from './types/certificate';
import {
  fetchCertificatesFromSheet,
  PERMANENT_SHEET_ID,
} from './services/googleSheets';
import { Header } from './components/Header';
import { HeroSection } from './components/HeroSection';
import { SearchCertificate } from './components/SearchCertificate';
import { PDFViewerModal } from './components/PDFViewerModal';
import { AdminModal } from './components/AdminModal';
import { GuideModal } from './components/GuideModal';
import { ActivitiesShowcase } from './components/ActivitiesShowcase';
import { CorrectionRequestPage } from './components/CorrectionRequestPage';
import { Footer } from './components/Footer';

export default function App() {
  const [certificates, setCertificates] = useState<CertificateRecord[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [activePdfCert, setActivePdfCert] = useState<CertificateRecord | null>(null);
  const [isAdminOpen, setIsAdminOpen] = useState<boolean>(false);
  const [isGuideOpen, setIsGuideOpen] = useState<boolean>(false);

  // Active Menu Page: 'home' (ค้นหาเกียรติบัตร) | 'requests' (บริการยื่นคำร้องออนไลน์)
  const [currentPage, setCurrentPage] = useState<'home' | 'requests'>('home');

  const loadData = useCallback(async () => {
    setIsLoading(true);
    try {
      // Always load from permanent Google Sheet ID: 1hb2fdnWMIr7-nhlEw8NGYeYYSwmZUfQfLm8gJHqO_Ww
      const res = await fetchCertificatesFromSheet(PERMANENT_SHEET_ID);
      setCertificates(res.certificates);
    } catch (err: unknown) {
      console.error('Failed to load certificates from permanent sheet', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleRefresh = () => {
    loadData();
  };

  const handleScrollToSearch = () => {
    if (currentPage !== 'home') {
      setCurrentPage('home');
      setTimeout(() => {
        const el = document.getElementById('search-section');
        if (el) el.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    } else {
      const el = document.getElementById('search-section');
      if (el) el.scrollIntoView({ behavior: 'smooth' });
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

  // Distinct list of project names for correction requests & filter
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
      {/* Top Bar Header with Page Switcher (ค้นหาเกียรติบัตร & บริการยื่นคำร้องออนไลน์) */}
      <Header
        currentPage={currentPage}
        onNavigate={(page) => {
          setCurrentPage(page);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        onOpenAdmin={() => setIsAdminOpen(true)}
        onOpenGuide={() => setIsGuideOpen(true)}
        totalRecords={certificates.length}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 pt-6">
        {/* PAGE 1: HOME & CERTIFICATE SEARCH */}
        {currentPage === 'home' && (
          <div className="space-y-8 animate-in fade-in duration-200">
            {/* Hero Section */}
            <HeroSection
              onScrollToSearch={handleScrollToSearch}
              onOpenCorrection={() => {
                setCurrentPage('requests');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              totalRecords={certificates.length}
            />

            {/* Certificate Search & Results (Exclusively by Name, displaying เลขที่) */}
            <section id="search-section" className="scroll-mt-20">
              <div className="mb-4">
                <h2 className="text-xl sm:text-2xl font-bold font-prompt text-purple-950">
                  ค้นหาและดาวน์โหลดเกียรติบัตร
                </h2>
                <p className="text-xs sm:text-sm text-stone-500 font-sarabun mt-0.5">
                  เลือกโครงการ และกรอกชื่อ-นามสกุลเพื่อค้นหาและดาวน์โหลดเกียรติบัตร
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
          </div>
        )}

        {/* PAGE 2: DEDICATED ONLINE CORRECTION & TRACKING SERVICE (Requirement 3) */}
        {currentPage === 'requests' && (
          <CorrectionRequestPage
            availableProjects={availableProjects}
            onBackToHome={() => {
              setCurrentPage('home');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            onRequestSubmitted={handleRefresh}
          />
        )}
      </main>

      {/* Footer */}
      <Footer />

      {/* PDF Preview Modal with Download button inside */}
      {activePdfCert && (
        <PDFViewerModal
          certificate={activePdfCert}
          onClose={() => setActivePdfCert(null)}
        />
      )}

      {/* Admin Modal (Kruthai56 / kruthai566868) */}
      {isAdminOpen && (
        <AdminModal
          certificates={certificates}
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
