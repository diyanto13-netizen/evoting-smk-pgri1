import React, { useState, useEffect, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { Voter, Period } from '../../types/voting';
import { PemilosLogo } from '../PemilosLogo';
import { generateVoterQRCode } from '../../utils/qrUtils';
import { X, Printer, QrCode, FileText, Check, Scissors } from 'lucide-react';

interface VoterCardPrintModalProps {
  voters: Voter[];
  period: Period | undefined;
  onClose: () => void;
}

const VoterCardQR: React.FC<{ nisn: string; pin: string }> = ({ nisn, pin }) => {
  const [qrUrl, setQrUrl] = useState<string>('');

  useEffect(() => {
    let active = true;
    generateVoterQRCode(nisn, pin).then((url) => {
      if (active) setQrUrl(url);
    });
    return () => {
      active = false;
    };
  }, [nisn, pin]);

  if (!qrUrl) {
    return (
      <div className="w-11 h-11 bg-slate-100 rounded-md flex items-center justify-center animate-pulse">
        <QrCode className="w-6 h-6 text-slate-400" />
      </div>
    );
  }

  return (
    <img
      src={qrUrl}
      alt={`QR Code ${nisn}`}
      className="w-11 h-11 object-contain rounded-xs"
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

  // Strictly chunk voters into exactly 8 cards per A4 page (2 columns x 4 rows)
  const CARDS_PER_PAGE = 8;
  const voterPages = useMemo(() => {
    const pages: Voter[][] = [];
    for (let i = 0; i < voters.length; i += CARDS_PER_PAGE) {
      pages.push(voters.slice(i, i + CARDS_PER_PAGE));
    }
    return pages;
  }, [voters]);

  const handlePrint = () => {
    window.print();
  };

  const modalContent = (
    <div className="print-modal-wrapper fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-950/80 backdrop-blur-xs overflow-y-auto">
      {/* Strict A4 Print CSS Styles */}
      <style>{`
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
                <span>Cetak Kartu Suara Pemilih ({voters.length} Siswa)</span>
                <span className="text-xs px-2.5 py-0.5 rounded-full font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                  8 Kartu / Lembar A4
                </span>
              </h3>
              <p className="text-xs text-slate-600 font-medium">
                Tepat {voterPages.length} lembar A4 • Halaman website tidak akan ikut tercetak
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Style Selector: Tanpa Garis (Default) vs Garis Potong Tipis */}
            <div className="flex items-center bg-slate-200/80 p-1 rounded-xl text-xs font-bold border border-slate-300">
              <button
                type="button"
                onClick={() => setBorderStyle('none')}
                className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 cursor-pointer ${
                  borderStyle === 'none'
                    ? 'bg-white text-slate-950 shadow-xs font-black'
                    : 'text-slate-600 hover:text-slate-950'
                }`}
              >
                {borderStyle === 'none' && <Check className="w-3.5 h-3.5 text-emerald-600" />}
                Tanpa Garis (Polos)
              </button>
              <button
                type="button"
                onClick={() => setBorderStyle('dashed')}
                className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 cursor-pointer ${
                  borderStyle === 'dashed'
                    ? 'bg-white text-slate-950 shadow-xs font-black'
                    : 'text-slate-600 hover:text-slate-950'
                }`}
              >
                {borderStyle === 'dashed' && <Check className="w-3.5 h-3.5 text-blue-600" />}
                <Scissors className="w-3.5 h-3.5" />
                Garis Bantu Potong
              </button>
            </div>

            <button
              onClick={handlePrint}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs sm:text-sm font-black shadow-sm transition-colors flex items-center gap-2 cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              Cetak / Simpan PDF
            </button>
            <button
              onClick={onClose}
              className="p-2 text-slate-500 hover:text-slate-950 rounded-xl cursor-pointer"
              title="Tutup"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Info Notification Bar (Hidden on print) */}
        <div className="print-hidden-element bg-blue-50 border-b border-blue-200 px-4 py-2.5 text-xs text-blue-900 font-medium flex items-center justify-between gap-2">
          <span>
            💡 <strong>Petunjuk Cetak:</strong> Di jendela cetak (Chrome/Edge), pastikan <strong>Ukuran kertas: A4</strong> dan <strong>Margin: Default</strong>. Hanya kartu suara yang akan tercetak (tepat {voterPages.length} lembar A4), halaman background web otomatis disembunyikan.
          </span>
          <span className="font-mono font-bold bg-blue-100 text-blue-800 px-2 py-0.5 rounded text-[11px] shrink-0">
            A4: 210 × 297 mm
          </span>
        </div>

        {/* Printable Scroll Area */}
        <div className="print-scroll-area p-4 sm:p-6 overflow-y-auto flex-1 bg-slate-200/90 print:bg-white print:p-0">
          <div className="max-w-[214mm] mx-auto space-y-8 print:space-y-0 print:max-w-none">
            {voterPages.map((pageVoters, pageIndex) => (
              <div key={`sheet-${pageIndex}`} className="space-y-2">
                {/* On-screen page indicator badge */}
                <div className="print-hidden-element flex items-center justify-between text-xs font-bold text-slate-700 px-2">
                  <span className="flex items-center gap-1.5 bg-white px-3 py-1 rounded-lg border border-slate-300 shadow-xs">
                    <FileText className="w-3.5 h-3.5 text-blue-600" />
                    Lembar {pageIndex + 1} dari {voterPages.length} (Kertas A4 • {pageVoters.length} Kartu)
                  </span>
                  <span className="text-slate-500 text-[11px]">Format 2 Kolom × 4 Baris (Presisi 8 Kartu)</span>
                </div>

                {/* Exact A4 Sheet Container */}
                <div className="a4-print-sheet bg-white shadow-xl print:shadow-none mx-auto">
                  {pageVoters.map((voter) => {
                    const isGuru =
                      voter.major.includes('Pendidik') ||
                      voter.classGrade.includes('GURU') ||
                      voter.classGrade.includes('TENDIK') ||
                      voter.nisn.length > 10;

                    return (
                      <div
                        key={voter.id}
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

                            <div className="flex items-center gap-2.5 pt-0.5">
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

                          {/* QR Code & PIN Code Box */}
                          <div className="shrink-0 flex flex-col items-center justify-center pl-1.5 border-l border-slate-200 w-[66px]">
                            <div className="w-11 h-11 bg-white rounded border border-slate-300 flex items-center justify-center p-0.5 overflow-hidden">
                              <VoterCardQR nisn={voter.nisn} pin={voter.pin} />
                            </div>
                            <div className="mt-1 w-full bg-blue-50/90 border border-blue-200 rounded px-1 py-0.5 text-center">
                              <span className="text-[7px] font-black text-blue-900 block leading-none">
                                PIN RAHASIA:
                              </span>
                              <span className="text-[10px] font-mono font-black text-blue-800 tracking-wider leading-tight block">
                                {voter.pin}
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* 3. Footer */}
                        <div className="pt-1 border-t border-dashed border-slate-200 flex items-center justify-between text-[7.5px] text-slate-500 font-semibold leading-none">
                          <span>* Rahasiakan PIN • 1 Kali Nyoblos</span>
                          <span className="font-black text-slate-700">PANITIA KPU PGRI 1</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  const printRoot = typeof document !== 'undefined' ? document.getElementById('print-root') || document.body : null;

  return printRoot ? createPortal(modalContent, printRoot) : modalContent;
};
