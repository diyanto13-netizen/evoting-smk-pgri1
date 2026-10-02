import React, { useState, useEffect, useMemo } from 'react';
import { Voter, Period } from '../../types/voting';
import { PemilosLogo } from '../PemilosLogo';
import { generateVoterQRCode } from '../../utils/qrUtils';
import { X, Printer, QrCode, FileText, CheckCircle2 } from 'lucide-react';

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
  // Always divide voters into exact pages of 8 cards (2 columns x 4 rows)
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

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-950/80 backdrop-blur-xs overflow-y-auto">
      {/* Precision Print Styles for A4 Paper */}
      <style>{`
        @media print {
          @page {
            size: A4 portrait;
            margin: 7mm 6mm !important;
          }
          html, body {
            margin: 0 !important;
            padding: 0 !important;
            background: #ffffff !important;
            color: #000000 !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          .print-hidden-element {
            display: none !important;
          }
          .a4-print-sheet {
            width: 198mm !important;
            height: 283mm !important;
            max-height: 283mm !important;
            margin: 0 auto !important;
            padding: 0 !important;
            page-break-after: always !important;
            break-after: page !important;
            display: grid !important;
            grid-template-columns: repeat(2, 97mm) !important;
            grid-template-rows: repeat(4, 67mm) !important;
            gap: 3mm 4mm !important;
            box-sizing: border-box !important;
            overflow: hidden !important;
          }
          .a4-print-sheet:last-of-type {
            page-break-after: auto !important;
            break-after: auto !important;
          }
          .voter-card-item {
            height: 67mm !important;
            max-height: 67mm !important;
            width: 97mm !important;
            box-sizing: border-box !important;
            break-inside: avoid !important;
            page-break-inside: avoid !important;
            overflow: hidden !important;
            border: 1px solid #cbd5e1 !important;
            border-radius: 8px !important;
          }
        }
      `}</style>

      <div className="bg-white rounded-3xl w-full max-w-5xl max-h-[94vh] flex flex-col shadow-2xl border-2 border-slate-300">
        {/* Top Control Bar (Hidden on print) */}
        <div className="print-hidden-element p-4 sm:p-5 border-b-2 border-slate-200 flex flex-wrap items-center justify-between gap-3 bg-slate-50 rounded-t-3xl">
          <div className="flex items-center gap-3">
            <div className="p-1 bg-white rounded-xl shadow-xs border border-slate-200 flex items-center justify-center">
              <PemilosLogo className="w-9 h-9" />
            </div>
            <div>
              <h3 className="font-black text-slate-950 text-sm sm:text-base flex items-center gap-2">
                <span>Cetak Kartu Suara Pemilih ({voters.length} Kartu)</span>
                <span className="text-xs px-2.5 py-0.5 rounded-full font-bold bg-blue-100 text-blue-800 border border-blue-200">
                  8 Kartu / Lembar A4
                </span>
              </h3>
              <p className="text-xs text-slate-600 font-medium">
                Total {voterPages.length} lembar A4 • Ukuran presisi tanpa garis terpotong
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs sm:text-sm font-black shadow-sm transition-colors flex items-center gap-2 cursor-pointer"
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

        {/* Printable Area */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1 bg-slate-200/80 print:bg-white print:p-0">
          <div className="max-w-4xl mx-auto space-y-8 print:space-y-0 print:max-w-none">
            {voterPages.map((pageVoters, pageIndex) => (
              <div key={`page-${pageIndex}`} className="space-y-2">
                {/* On-screen page indicator badge */}
                <div className="print-hidden-element flex items-center justify-between text-xs font-bold text-slate-600 px-2">
                  <span className="flex items-center gap-1.5 bg-white px-3 py-1 rounded-lg border border-slate-300 shadow-xs">
                    <FileText className="w-3.5 h-3.5 text-blue-600" />
                    Lembar {pageIndex + 1} dari {voterPages.length} (Kertas A4 • {pageVoters.length} Kartu)
                  </span>
                  <span className="text-slate-500">Tata letak 2 kolom × 4 baris presisi</span>
                </div>

                {/* Exact A4 Sheet Container */}
                <div className="a4-print-sheet bg-white rounded-2xl shadow-md border border-slate-300 p-4 print:p-0 print:border-none print:shadow-none print:rounded-none">
                  {pageVoters.map((voter) => (
                    <div
                      key={voter.id}
                      className="voter-card-item bg-white rounded-xl border border-slate-300 p-2.5 flex flex-col justify-between text-slate-900 shadow-2xs print:shadow-none"
                    >
                      {/* 1. Header (Logo, School Name, Badge) */}
                      <div className="flex items-center gap-2 pb-1.5 border-b border-slate-200">
                        <PemilosLogo className="w-7 h-7 shrink-0 drop-shadow-2xs" />
                        <div className="min-w-0 flex-1">
                          <h4 className="text-[10.5px] font-black uppercase text-slate-950 leading-tight tracking-tight truncate">
                            SMKS PGRI 1 KOTA SUKABUMI
                          </h4>
                          <p className="text-[8.5px] font-black text-blue-900 uppercase tracking-wider truncate">
                            KOMISI PEMILIHAN OSIS & MPK • {period?.academicYear || '2026/2027'}
                          </p>
                        </div>
                        <span className="text-[8px] font-black uppercase tracking-wider bg-slate-100 text-slate-800 px-1.5 py-0.5 rounded border border-slate-300 shrink-0">
                          KARTU SUARA
                        </span>
                      </div>

                      {/* 2. Body Details & QR Code */}
                      <div className="py-1 flex items-center gap-2 flex-1">
                        <div className="flex-1 min-w-0 space-y-0.5 text-xs">
                          <div>
                            <span className="text-slate-400 block text-[8px] uppercase font-black leading-none">
                              Nama Lengkap:
                            </span>
                            <strong className="text-slate-950 font-black text-[11px] block truncate leading-snug">
                              {voter.studentName}
                            </strong>
                          </div>

                          <div className="flex items-center gap-2.5 pt-0.5">
                            <div>
                              <span className="text-slate-400 block text-[8px] uppercase font-black leading-none">
                                NISN:
                              </span>
                              <span className="font-mono font-black text-slate-900 text-[10px]">
                                {voter.nisn}
                              </span>
                            </div>
                            <div>
                              <span className="text-slate-400 block text-[8px] uppercase font-black leading-none">
                                Kelas:
                              </span>
                              <span className="font-black text-slate-900 text-[10px]">
                                {voter.classGrade}
                              </span>
                            </div>
                          </div>

                          <div className="pt-0.5">
                            <span className="text-slate-400 block text-[8px] uppercase font-black leading-none">
                              Komp. Keahlian:
                            </span>
                            <span className="text-slate-800 text-[9px] font-bold block truncate leading-tight">
                              {voter.major}
                            </span>
                          </div>
                        </div>

                        {/* QR Code & PIN Code Box */}
                        <div className="shrink-0 flex flex-col items-center justify-center pl-1.5 border-l border-slate-200 w-[68px]">
                          <div className="w-12 h-12 bg-white rounded-md border border-slate-300 flex items-center justify-center p-0.5 overflow-hidden">
                            <VoterCardQR nisn={voter.nisn} pin={voter.pin} />
                          </div>
                          <div className="mt-1 w-full bg-blue-50/80 border border-blue-200 rounded px-1 py-0.5 text-center">
                            <span className="text-[7.5px] font-black text-blue-900 block leading-none">
                              PIN RAHASIA:
                            </span>
                            <span className="text-[10.5px] font-mono font-black text-blue-800 tracking-wider leading-tight block">
                              {voter.pin}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* 3. Footer */}
                      <div className="pt-1 border-t border-dashed border-slate-200 flex items-center justify-between text-[8px] text-slate-500 font-semibold leading-none">
                        <span>* Rahasiakan PIN • 1 Kali Nyoblos</span>
                        <span className="font-black text-slate-700">PANITIA KPU PGRI 1</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
