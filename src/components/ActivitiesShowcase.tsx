import React, { useMemo } from 'react';
import { FolderOpen, ArrowRight, BookOpen } from 'lucide-react';
import { CertificateRecord } from '../types/certificate';

interface ActivitiesShowcaseProps {
  certificates: CertificateRecord[];
  onSelectProject: (projectName: string) => void;
}

export const ActivitiesShowcase: React.FC<ActivitiesShowcaseProps> = ({
  certificates,
  onSelectProject,
}) => {
  // Group unique projects
  const projectList = useMemo(() => {
    const map = new Map<string, number>();
    certificates.forEach((c) => {
      const p = c.projectName?.trim();
      if (p) {
        map.set(p, (map.get(p) || 0) + 1);
      }
    });
    return Array.from(map.entries()).map(([name, count]) => ({ name, count }));
  }, [certificates]);

  return (
    <div className="my-10 space-y-6">
      {/* Project Selector Showcase Section */}
      <section id="activities" className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-purple-100 pb-3">
          <div>
            <h3 className="font-prompt font-bold text-purple-950 text-lg sm:text-xl flex items-center gap-2">
              <FolderOpen className="w-5 h-5 text-purple-800" />
              <span>โครงการทั้งหมดที่เปิดให้ดาวน์โหลดเกียรติบัตร</span>
            </h3>
            <p className="text-xs text-stone-500 font-sarabun mt-0.5">
              คลิกที่โครงการเพื่อไปยังช่องค้นหาเฉพาะโครงการนั้นๆ
            </p>
          </div>
          <span className="text-xs text-purple-800 font-semibold bg-purple-50 px-3 py-1 rounded-full border border-purple-200">
            {projectList.length} โครงการในระบบ
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {projectList.map((proj) => (
            <div
              key={proj.name}
              className="bg-white rounded-2xl border border-purple-200/90 p-5 hover:border-purple-600 hover:shadow-md transition-all flex flex-col justify-between"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs text-stone-500">
                  <span className="bg-purple-50 text-purple-900 font-semibold px-2 py-0.5 rounded font-prompt">
                    สาขาวิชาภาษาไทย
                  </span>
                  <span className="font-mono text-purple-800 font-bold">{proj.count} ฉบับ</span>
                </div>
                <h4 className="font-prompt font-semibold text-purple-950 text-sm leading-snug line-clamp-2">
                  {proj.name}
                </h4>
              </div>

              <div className="mt-5 pt-3 border-t border-purple-100 flex items-center justify-between">
                <span className="text-[11px] text-stone-400 font-sarabun">มีไฟล์ PDF พร้อม</span>
                <button
                  type="button"
                  onClick={() => onSelectProject(proj.name)}
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-purple-800 hover:text-purple-950 font-prompt"
                >
                  <span>ค้นหาในโครงการนี้</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};
