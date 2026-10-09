import React, { useState, useEffect, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { Voter, Period } from '../../types/voting';
import { PemilosLogo } from '../PemilosLogo';
import { generateVoterQRCode, getCachedVoterQR, preloadVoterQRCodesBatch } from '../../utils/qrUtils';
import {
  X,
  Printer,
  QrCode,
  FileText,
  Check,
  Scissors,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Filter,
  Eye,
  Layers,
  Loader2,
} from 'lucide-react';

interface VoterCardPrintModalProps {
  voters: Voter[];
  period: Period | undefined;
  onClose: () => void;
}

const VoterCardQR: React.FC<{ nisn: string; pin: string }> = ({ nisn, pin }) => {
  const [qrUrl, setQrUrl] = useState<string>(() => getCachedVoterQR(nisn, pin) || '');

  useEffect(() => {
    let active = true;
    if (!qrUrl) {
      generateVoterQRCode(nisn, pin).then((url) => {
        if (active) setQrUrl(url);
      });
    }
    return () => {
      active = false;
    };
  }, [nisn, pin, qrUrl]);

  if (!qrUrl) {
    return (
      <div className="w-[26mm] h-[26mm] bg-slate-100 rounded-md flex items-center justify-center animate-pulse">
        <QrCode className="w-7 h-7 text-slate-400" />
      </div>
    );
  }

  return (
    <img
      src={qrUrl}
      alt={`QR Code ${nisn}`}
      className="w-[26mm] h-[26mm] object-contain rounded-xs"
      style={{ imageRendering: '-webkit-optimize-contrast' }}
      loading="eager"
    />
  );
};

export const VoterCardPrintModal: React.FC<VoterCardPrintModalProps> = ({
  voters,
  period,
  onClose,
}) => {
  // Option: Borderless (Tanpa Garis - Default) or Subtle Dashed Cut Guide
  const [borderStyle, setBorderStyle] = useState<'none' | 'dashed'>('none');

  // Filter per class inside the modal for fast batch printing per class
  const [selectedClass, setSelectedClass] = useState<string>('ALL');

  // Preview Mode: 'paginated' (Instant 1-sheet render, under 20ms) or 'all' (Show all sheets)
  const [previewMode, setPreviewMode] = useState<'paginated' | 'all'>('paginated');
  const [currentPageIndex, setCurrentPageIndex] = useState<number>(0);

  // Print Scope: 'all' (all sheets of current filter) or 'current' (current sheet only)
  const [printScope, setPrintScope] = useState<'all' | 'current'>('all');

  // Print preparation state: keeps modal instant on open by lazy-mounting print sheets only when printing!
  const [isPreparingPrint, setIsPreparingPrint] = useState<boolean>(false);
  const [isPrintReady, setIsPrintReady] = useState<boolean>(false);
  const [preparingMessage, setPreparingMessage] = useState<string>('');

  // Extract all available classes
  const classList = useMemo(() => {
    const set = new Set<string>();
    voters.forEach((v) => {
      if (v.classGrade) set.add(v.classGrade.trim());
    });
    return Array.from(set).sort();
  }, [voters]);

  // Active voters matching selected class
  const activeVotersList = useMemo(() => {
    if (selectedClass === 'ALL') return voters;
    return voters.filter((v) => v.classGrade?.trim() === selectedClass);
  }, [voters, selectedClass]);

  // Strictly chunk voters into exactly 8 cards per A4 page (2 columns x 4 rows)
  const CARDS_PER_PAGE = 8;
  const voterPages = useMemo(() => {
    const pages: Voter[][] = [];
    for (let i = 0; i < activeVotersList.length; i += CARDS_PER_PAGE) {
      pages.push(activeVotersList.slice(i, i + CARDS_PER_PAGE));
    }
    return pages;
  }, [activeVotersList]);

  // Reset page index if class filter changes
  useEffect(() => {
    setCurrentPageIndex(0);
  }, [selectedClass]);

  // Pre-generate QR codes ONLY for the currently displayed 8 cards on screen (ultra-fast <5ms)
  useEffect(() => {
    const currentPageVoters = voterPages[currentPageIndex] || [];
    currentPageVoters.forEach((v) => {
      generateVoterQRCode(v.nisn, v.pin);
    });
  }, [voterPages, currentPageIndex]);

  // Listen to browser beforeprint / afterprint events
  useEffect(() => {
    const handleBeforePrint = () => {
      setIsPrintReady(true);
    };
    const handleAfterPrint = () => {
      setIsPreparingPrint(false);
      setIsPrintReady(false);
      setPreparingMessage('');
    };
    window.addEventListener('beforeprint', handleBeforePrint);
    window.addEventListener('afterprint', handleAfterPrint);
    return () => {
      window.removeEventListener('beforeprint', handleBeforePrint);
      window.removeEventListener('afterprint', handleAfterPrint);
    };
  }, []);

  const handlePrint = async (scope: 'all' | 'current' = 'all') => {
    setPrintScope(scope);
    setIsPreparingPrint(true);

    const targetPages =
      scope === 'current' && voterPages.length > 0
        ? [voterPages[Math.min(currentPageIndex, voterPages.length - 1)]]
        : voterPages;
    const targetVoters = targetPages.flat();

    // Check if any voters in target need QR codes generated
    const uncached = targetVoters.filter((v) => !getCachedVoterQR(v.nisn, v.pin));

    if (uncached.length > 0) {
      setPreparingMessage(`Menyiapkan ${uncached.length} kode QR...`);
      await preloadVoterQRCodesBatch(targetVoters, (done, total) => {
        setPreparingMessage(`Menyiapkan QR: ${done}/${total}...`);
      });
    }

    setIsPrintReady(true);
    setPreparingMessage('Membuka jendela cetak...');

    // Small delay to ensure React has flushed the print DOM
    setTimeout(() => {
      window.print();
      setIsPreparingPrint(false);
      setPreparingMessage('');
    }, 150);
  };

  // Determine which sheets to render on screen preview
  const displayPages = useMemo(() => {
    if (previewMode === 'all') return voterPages;
    if (voterPages.length === 0) return [];
    const validIndex = Math.min(currentPageIndex, voterPages.length - 1);
    return [voterPages[validIndex]];
  }, [previewMode, currentPageIndex, voterPages]);

  // Determine which sheets to render in print media
  const printPages = useMemo(() => {
    if (printScope === 'current' && voterPages.length > 0) {
      const validIndex = Math.min(currentPageIndex, voterPages.length - 1);
      return [voterPages[validIndex]];
    }
    return voterPages;
  }, [printScope, currentPageIndex, voterPages]);

  const modalContent = (
    <div className="print-modal-wrapper fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-950/80 backdrop-blur-xs overflow-y-auto">
      {/* Strict A4 Print CSS Styles */}
      <style>{`
        /* Exact A4 Sheet Grid Layout on Screen Preview */
        .a4-print-sheet {
          width: 210mm;
          min-height: 297mm;
          margin: 0 auto;
          padding: 9mm 9mm;
          box-sizing: border-box;
          display: grid;
          grid-template-columns: 92mm 92mm;
          grid-template-rows: repeat(4, 65mm);
          gap: 4mm 8mm;
          background: #ffffff;
        }

        .voter-card-item {
          width: 92mm;
          height: 65mm;
          padding: 7px 9px;
          box-sizing: border-box;
          overflow: hidden;
          background: #ffffff;
        }

        .voter-card-item.style-none {
          border: 1px solid #e2e8f0;
          border-radius: 6px;
        }

        .voter-card-item.style-dashed {
          border: 1px dashed #94a3b8;
          border-radius: 6px;
        }

        /* Screen only vs Print only elements */
        .print-only-element {
          display: none !important;
        }

        @media print {
          @page {
            size: A4 portrait !important;
            margin: 0 !important;
          }

          /* CRITICAL: Completely hide main app root & everything behind the modal */
          #root,
          body > *:not(#print-root) {
            display: none !important;
            visibility: hidden !important;
            height: 0 !important;
            margin: 0 !important;
            padding: 0 !important;
            overflow: hidden !important;
          }

          html, body {
            margin: 0 !important;
            padding: 0 !important;
            width: 210mm !important;
            height: auto !important;
            background: #ffffff !important;
            color: #000000 !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
            overflow: visible !important;
          }

          /* Only show the print-root container */
          #print-root {
            display: block !important;
            visibility: visible !important;
            position: static !important;
            margin: 0 !important;
            padding: 0 !important;
            width: 210mm !important;
            background: #ffffff !important;
          }

          /* Hide modal overlay backdrops, shadows, and screen controls */
          .print-modal-wrapper {
            position: static !important;
            display: block !important;
            padding: 0 !important;
            margin: 0 !important;
            background: transparent !important;
            backdrop-filter: none !important;
            width: 210mm !important;
            height: auto !important;
            overflow: visible !important;
          }

          .print-modal-container {
            position: static !important;
            display: block !important;
            background: transparent !important;
            box-shadow: none !important;
            border: none !important;
            padding: 0 !important;
            margin: 0 !important;
            width: 210mm !important;
            max-width: none !important;
            max-height: none !important;
            overflow: visible !important;
            border-radius: 0 !important;
          }

          .print-scroll-area {
            padding: 0 !important;
            margin: 0 !important;
            background: transparent !important;
            overflow: visible !important;
          }

          .print-hidden-element {
            display: none !important;
          }

          .screen-preview-container {
            display: none !important;
          }

          .print-only-element {
            display: block !important;
          }

          /* Exact A4 Sheet: 210mm x 297mm */
          .a4-print-sheet {
            width: 210mm !important;
            height: 297mm !important;
            max-height: 297mm !important;
            min-height: 297mm !important;
            margin: 0 auto !important;
            padding: 9mm 9mm !important;
            box-sizing: border-box !important;
            page-break-after: always !important;
            break-after: page !important;
            page-break-inside: avoid !important;
            break-inside: avoid !important;
            display: grid !important;
            grid-template-columns: 92mm 92mm !important;
            grid-template-rows: repeat(4, 65mm) !important;
            gap: 4mm 8mm !important;
            overflow: hidden !important;
            background: #ffffff !important;
            border: none !important;
            box-shadow: none !important;
            border-radius: 0 !important;
          }

          .a4-print-sheet:last-of-type {
            page-break-after: auto !important;
            break-after: auto !important;
          }

          /* Individual Voter Card Item */
          .voter-card-item {
            width: 92mm !important;
            height: 65mm !important;
            max-height: 65mm !important;
            padding: 7px 9px !important;
            box-sizing: border-box !important;
            page-break-inside: avoid !important;
            break-inside: avoid !important;
            overflow: hidden !important;
            background: #ffffff !important;
            box-shadow: none !important;
            outline: none !important;
          }

          .voter-card-item.style-none {
            border: none !important;
          }

          .voter-card-item.style-dashed {
            border: 0.5px dashed #94a3b8 !important;
            border-radius: 6px !important;
          }
        }
      `}</style>

      <div className="print-modal-container bg-white rounded-3xl w-full max-w-5xl max-h-[94vh] flex flex-col shadow-2xl border-2 border-slate-300">
        {/* Top Control Bar (Hidden on print) */}
        <div className="print-hidden-element p-4 sm:p-5 border-b-2 border-slate-200 flex flex-wrap items-center justify-between gap-3 bg-slate-50 rounded-t-3xl">
          <div className="flex items-center gap-3">
            <div className="p-1 bg-white rounded-xl shadow-xs border border-slate-200 flex items-center justify-center">
              <PemilosLogo className="w-9 h-9" />
            </div>
            <div>
              <h3 className="font-black text-slate-950 text-sm sm:text-base flex items-center gap-2">
                <span>Cetak Kartu Suara Pemilih ({activeVotersList.length} DPT)</span>
                <span className="text-xs px-2.5 py-0.5 rounded-full font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                  8 Kartu / Lembar A4
                </span>
              </h3>
              <p className="text-xs text-slate-600 font-medium">
                Total {voterPages.length} lembar A4 • Token 6 digit dicetak besar & jelas untuk bilik suara
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Filter Kelas */}
            <div className="flex items-center gap-1.5 bg-white px-2.5 py-1.5 rounded-xl border border-slate-300 text-xs shadow-2xs">
              <Filter className="w-3.5 h-3.5 text-blue-600 shrink-0" />
              <span className="font-bold text-slate-600 shrink-0">Kelas:</span>
              <select
                value={selectedClass}
                onChange={(e) => setSelectedClass(e.target.value)}
                className="bg-transparent font-black text-slate-900 outline-none cursor-pointer text-xs"
              >
                <option value="ALL">Semua Kelas ({voters.length})</option>
                {classList.map((cls) => {
                  const count = voters.filter((v) => v.classGrade?.trim() === cls).length;
                  return (
                    <option key={cls} value={cls}>
                      {cls} ({count} Siswa)
                    </option>
                  );
                })}
              </select>
            </div>

            {/* Style Selector: Tanpa Garis vs Garis Potong Tipis */}
            <div className="flex items-center bg-slate-200/80 p-1 rounded-xl text-xs font-bold border border-slate-300">
              <button
                type="button"
                onClick={() => setBorderStyle('none')}
                className={`px-2.5 py-1 rounded-lg transition-all flex items-center gap-1 cursor-pointer ${
                  borderStyle === 'none'
                    ? 'bg-white text-slate-950 shadow-xs font-black'
                    : 'text-slate-600 hover:text-slate-950'
                }`}
              >
                {borderStyle === 'none' && <Check className="w-3 h-3 text-emerald-600" />}
                Polos
              </button>
              <button
                type="button"
                onClick={() => setBorderStyle('dashed')}
                className={`px-2.5 py-1 rounded-lg transition-all flex items-center gap-1 cursor-pointer ${
                  borderStyle === 'dashed'
                    ? 'bg-white text-slate-950 shadow-xs font-black'
                    : 'text-slate-600 hover:text-slate-950'
                }`}
              >
                {borderStyle === 'dashed' && <Check className="w-3 h-3 text-blue-600" />}
                <Scissors className="w-3 h-3" />
                Garis Potong
              </button>
            </div>

            {/* Tombol Cetak / PDF */}
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                disabled={isPreparingPrint}
                onClick={() => handlePrint('all')}
                className="px-3.5 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-xl text-xs sm:text-sm font-black shadow-sm transition-colors flex items-center gap-1.5 cursor-pointer disabled:cursor-wait"
                title={`Cetak seluruh ${voterPages.length} lembar A4`}
              >
                {isPreparingPrint ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-white" />
                    <span>{preparingMessage || 'Menyiapkan...'}</span>
                  </>
                ) : (
                  <>
                    <Printer className="w-4 h-4 text-amber-300" />
                    <span>Cetak Semua ({voterPages.length} Lembar)</span>
                  </>
                )}
              </button>

              {voterPages.length > 1 && (
                <button
                  type="button"
                  disabled={isPreparingPrint}
                  onClick={() => handlePrint('current')}
                  className="px-3 py-2 bg-slate-800 hover:bg-slate-900 disabled:bg-slate-600 text-white rounded-xl text-xs font-bold shadow-xs transition-colors flex items-center gap-1 cursor-pointer disabled:cursor-wait"
                  title={`Hanya cetak Lembar ${currentPageIndex + 1}`}
                >
                  <span>Lembar Ini Saja</span>
                </button>
              )}
            </div>

            <button
              type="button"
              onClick={onClose}
              className="p-2 text-slate-500 hover:text-slate-950 rounded-xl cursor-pointer hover:bg-slate-200"
              title="Tutup"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Sub-Header Toolbar: Fast Page Navigation Bar (Hidden on print) */}
        <div className="print-hidden-element bg-slate-100 border-b border-slate-200 px-4 py-2.5 flex flex-wrap items-center justify-between gap-3 text-xs">
          {/* Quick Page Navigator */}
          <div className="flex items-center gap-1.5">
            <span className="font-extrabold text-slate-700">Pratinjau Lembar:</span>
            <button
              type="button"
              disabled={currentPageIndex === 0 || previewMode === 'all'}
              onClick={() => setCurrentPageIndex(0)}
              className="p-1.5 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 disabled:opacity-40 cursor-pointer shadow-2xs"
              title="Halaman Pertama"
            >
              <ChevronsLeft className="w-3.5 h-3.5 text-slate-700" />
            </button>
            <button
              type="button"
              disabled={currentPageIndex === 0 || previewMode === 'all'}
              onClick={() => setCurrentPageIndex((prev) => Math.max(0, prev - 1))}
              className="p-1.5 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 disabled:opacity-40 cursor-pointer shadow-2xs"
              title="Lembar Sebelumnya"
            >
              <ChevronLeft className="w-3.5 h-3.5 text-slate-700" />
            </button>

            {/* Current Page Indicator / Dropdown */}
            {previewMode === 'paginated' ? (
              <div className="flex items-center gap-1 bg-white px-2 py-1 rounded-lg border border-slate-300 shadow-2xs">
                <span className="font-black text-blue-900">Lembar</span>
                <select
                  value={currentPageIndex}
                  onChange={(e) => setCurrentPageIndex(Number(e.target.value))}
                  className="font-black text-slate-950 bg-transparent outline-none cursor-pointer"
                >
                  {voterPages.map((_, idx) => (
                    <option key={idx} value={idx}>
                      {idx + 1}
                    </option>
                  ))}
                </select>
                <span className="text-slate-500 font-bold">dari {voterPages.length}</span>
              </div>
            ) : (
              <span className="font-black text-slate-900 bg-white px-2.5 py-1 rounded-lg border border-slate-300 shadow-2xs">
                Menampilkan Semua ({voterPages.length} Lembar)
              </span>
            )}

            <button
              type="button"
              disabled={currentPageIndex >= voterPages.length - 1 || previewMode === 'all'}
              onClick={() => setCurrentPageIndex((prev) => Math.min(voterPages.length - 1, prev + 1))}
              className="p-1.5 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 disabled:opacity-40 cursor-pointer shadow-2xs"
              title="Lembar Berikutnya"
            >
              <ChevronRight className="w-3.5 h-3.5 text-slate-700" />
            </button>
            <button
              type="button"
              disabled={currentPageIndex >= voterPages.length - 1 || previewMode === 'all'}
              onClick={() => setCurrentPageIndex(voterPages.length - 1)}
              className="p-1.5 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 disabled:opacity-40 cursor-pointer shadow-2xs"
              title="Halaman Terakhir"
            >
              <ChevronsRight className="w-3.5 h-3.5 text-slate-700" />
            </button>
          </div>

          {/* Toggle Single Sheet vs All Sheets View */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setPreviewMode((prev) => (prev === 'paginated' ? 'all' : 'paginated'))}
              className="px-2.5 py-1 rounded-lg border border-slate-300 bg-white text-slate-700 font-bold hover:bg-slate-50 transition-colors flex items-center gap-1.5 shadow-2xs cursor-pointer"
            >
              {previewMode === 'paginated' ? (
                <>
                  <Layers className="w-3.5 h-3.5 text-blue-600" />
                  <span>Tampilkan Semua Lembar Sekaligus</span>
                </>
              ) : (
                <>
                  <Eye className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Mode 1 Lembar Cepat</span>
                </>
              )}
            </button>

            <span className="font-mono font-bold bg-blue-100 text-blue-900 px-2 py-0.5 rounded text-[11px]">
              A4 • 8 Kartu/Lembar
            </span>
          </div>
        </div>

        {/* Printable Scroll Area */}
        <div className="print-scroll-area p-4 sm:p-6 overflow-y-auto flex-1 bg-slate-200/90 print:bg-white print:p-0">
          {/* SCREEN VIEW (Fast active sheet or all sheets) */}
          <div className="screen-preview-container max-w-[214mm] mx-auto space-y-8 print:space-y-0 print:max-w-none">
            {displayPages.map((pageVoters, pageIndex) => {
              const actualSheetNumber =
                previewMode === 'paginated' ? currentPageIndex + 1 : pageIndex + 1;

              return (
                <div key={`screen-sheet-${actualSheetNumber}`} className="space-y-2">
                  {/* On-screen page indicator badge */}
                  <div className="print-hidden-element flex items-center justify-between text-xs font-bold text-slate-700 px-2">
                    <span className="flex items-center gap-1.5 bg-white px-3 py-1 rounded-lg border border-slate-300 shadow-xs">
                      <FileText className="w-3.5 h-3.5 text-blue-600" />
                      Lembar {actualSheetNumber} dari {voterPages.length} (Kertas A4 • {pageVoters.length} Kartu Suara)
                    </span>
                    <span className="text-slate-500 text-[11px]">Format 2 Kolom × 4 Baris (Presisi 8 Kartu)</span>
                  </div>

                  {/* Exact A4 Sheet Container */}
                  <div className="a4-print-sheet bg-white shadow-xl print:shadow-none mx-auto">
                    {pageVoters.map((voter) => (
                      <VoterCardItem
                        key={voter.id}
                        voter={voter}
                        period={period}
                        borderStyle={borderStyle}
                      />
                    ))}
                  </div>
                </div>
              );
            })}
          </div>

          {/* PRINT-ONLY CONTAINER (Rendered strictly when preparing or executing print to keep initial modal load instantaneous) */}
          {(isPreparingPrint || isPrintReady) && (
            <div className="print-only-element">
              {printPages.map((pageVoters, pageIndex) => (
                <div key={`print-sheet-${pageIndex}`} className="a4-print-sheet">
                  {pageVoters.map((voter) => (
                    <VoterCardItem
                      key={voter.id}
                      voter={voter}
                      period={period}
                      borderStyle={borderStyle}
                    />
                  ))}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );

  const printRoot =
    typeof document !== 'undefined' ? document.getElementById('print-root') || document.body : null;

  return printRoot ? createPortal(modalContent, printRoot) : modalContent;
};

/**
 * Reusable Card Item with Extra-Large 6-Digit Token Under QR Code
 */
interface VoterCardItemProps {
  voter: Voter;
  period: Period | undefined;
  borderStyle: 'none' | 'dashed';
}

const VoterCardItem: React.FC<VoterCardItemProps> = ({ voter, period, borderStyle }) => {
  const isGuru =
    voter.major?.includes('Pendidik') ||
    voter.classGrade?.includes('GURU') ||
    voter.classGrade?.includes('TENDIK') ||
    (voter.nisn && voter.nisn.length > 10);

  return (
    <div
      className={`voter-card-item ${
        borderStyle === 'dashed'
          ? 'style-dashed border border-dashed border-slate-400 rounded-lg'
          : 'style-none border-none'
      } flex flex-col justify-between text-slate-900 bg-white`}
    >
      {/* 1. Header (Logo, School Name, Badge) */}
      <div className="flex items-center gap-2 pb-1 border-b border-slate-200">
        <PemilosLogo className="w-7 h-7 shrink-0 drop-shadow-2xs" />
        <div className="min-w-0 flex-1">
          <h4 className="text-[10px] font-black uppercase text-slate-950 leading-tight tracking-tight truncate">
            SMKS PGRI 1 KOTA SUKABUMI
          </h4>
          <p className="text-[8px] font-black text-blue-900 uppercase tracking-wider truncate">
            KOMISI PEMILIHAN OSIS & MPK • {period?.academicYear || '2026/2027'}
          </p>
        </div>
        <span
          className={`text-[7.5px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded border shrink-0 ${
            isGuru
              ? 'bg-purple-100 text-purple-900 border-purple-300'
              : 'bg-slate-100 text-slate-800 border-slate-300'
          }`}
        >
          {isGuru ? 'KARTU GURU' : 'KARTU SUARA'}
        </span>
      </div>

      {/* 2. Body Details & QR Code */}
      <div className="py-1 flex items-center gap-2 flex-1">
        <div className="flex-1 min-w-0 space-y-0.5 text-xs">
          <div>
            <span className="text-slate-400 block text-[7.5px] uppercase font-black leading-none">
              Nama Lengkap:
            </span>
            <strong className="text-slate-950 font-black text-[11px] block truncate leading-snug">
              {voter.studentName}
            </strong>
          </div>

          <div className="flex items-center gap-2 pt-0.5">
            <div>
              <span className="text-slate-400 block text-[7.5px] uppercase font-black leading-none">
                {isGuru ? 'NIP / ID:' : 'NISN:'}
              </span>
              <span className="font-mono font-black text-slate-900 text-[9.5px]">
                {voter.nisn}
              </span>
            </div>
            <div>
              <span className="text-slate-400 block text-[7.5px] uppercase font-black leading-none">
                {isGuru ? 'Tugas/Kelas:' : 'Kelas:'}
              </span>
              <span className="font-black text-slate-900 text-[9.5px]">
                {voter.classGrade}
              </span>
            </div>
          </div>

          <div className="pt-0.5">
            <span className="text-slate-400 block text-[7.5px] uppercase font-black leading-none">
              {isGuru ? 'Kategori:' : 'Komp. Keahlian:'}
            </span>
            <span className="text-slate-800 text-[8.5px] font-bold block truncate leading-tight">
              {voter.major}
            </span>
          </div>
        </div>

        {/* QR Code & Extra-Large 6-Digit Token Box */}
        <div className="shrink-0 flex flex-col items-center justify-center pl-2 border-l border-slate-200 w-[38mm]">
          {/* QR Code Image */}
          <div className="w-[26mm] h-[26mm] bg-white rounded border border-slate-300 flex items-center justify-center p-0.5 overflow-hidden shadow-2xs">
            <VoterCardQR nisn={voter.nisn} pin={voter.pin} />
          </div>

          {/* Token 6 Digit: UKURAN LEBIH BESAR, BOLD, & HIGH CONTRAST */}
          <div className="mt-1 w-full bg-amber-100 border-2 border-amber-500 rounded-lg py-1 px-0.5 text-center shadow-xs">
            <span className="text-[7.5px] font-black uppercase text-amber-950 block leading-none tracking-wider">
              TOKEN 6 DIGIT:
            </span>
            <span className="text-[18px] sm:text-[20px] font-mono font-black text-slate-950 tracking-[0.22em] leading-tight block mt-0.5 select-all drop-shadow-2xs">
              {voter.pin}
            </span>
          </div>
        </div>
      </div>

      {/* 3. Footer */}
      <div className="pt-1 border-t border-dashed border-slate-200 flex items-center justify-between text-[7.5px] text-slate-500 font-semibold leading-none">
        <span>* Rahasiakan Token • 1 Kali Nyoblos</span>
        <span className="font-black text-slate-700">PANITIA KPU PGRI 1</span>
      </div>
    </div>
  );
};
