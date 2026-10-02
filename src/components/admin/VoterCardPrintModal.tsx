import React, { useState, useEffect } from 'react';
import { Voter, Period } from '../../types/voting';
import { PemilosLogo } from '../PemilosLogo';
import { generateVoterQRCode } from '../../utils/qrUtils';
import { X, Printer, QrCode } from 'lucide-react';

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
      <div className="w-16 h-16 bg-slate-100 rounded-lg flex items-center justify-center animate-pulse">
        <QrCode className="w-8 h-8 text-slate-400" />
      </div>
    );
  }

  return (
    <img
      src={qrUrl}
      alt={`QR Code ${nisn}`}
      className="w-16 h-16 object-contain rounded-md"
    />
  );
};

export const VoterCardPrintModal: React.FC<VoterCardPrintModalProps> = ({
  voters,
  period,
  onClose,
}) => {
  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-950/80 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-3xl w-full max-w-4xl max-h-[92vh] flex flex-col shadow-2xl border-2 border-slate-300">
        {/* Top Control Bar (Hidden on print) */}
        <div className="print:hidden p-4 sm:p-5 border-b-2 border-slate-200 flex items-center justify-between bg-slate-50 rounded-t-3xl">
          <div className="flex items-center gap-3">
            <div className="p-1 bg-white rounded-xl shadow-xs border border-slate-200 flex items-center justify-center">
              <PemilosLogo className="w-9 h-9" />
            </div>
            <div>
              <h3 className="font-black text-slate-950 text-sm sm:text-base">
                Pratinjau Cetak Kartu Suara Pemilih ({voters.length} Kartu)
              </h3>
              <p className="text-xs text-slate-600 font-medium">
                Format resmi Komisi Pemilihan OSIS & MPK SMKS PGRI 1 Sukabumi siap cetak
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
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Printable Area with Crisp Typography */}
        <div className="p-6 overflow-y-auto flex-1 bg-slate-100 print:bg-white print:p-0">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 print:grid-cols-2 print:gap-3">
            {voters.map((voter) => (
              <div
                key={voter.id}
                className="bg-white rounded-2xl border-2 border-slate-900 p-4 relative overflow-hidden shadow-xs print:shadow-none print:break-inside-avoid"
              >
                {/* Official School & PEMILOS Header */}
                <div className="flex items-center gap-3 pb-3 border-b-2 border-slate-900">
                  <PemilosLogo className="w-12 h-12 shrink-0 drop-shadow-xs" />
                  <div className="min-w-0 flex-1">
                    <h4 className="text-xs font-black uppercase text-slate-950 leading-tight tracking-tight">
                      SMKS PGRI 1 KOTA SUKABUMI
                    </h4>
                    <p className="text-[10px] font-black text-blue-900 uppercase tracking-wider">
                      KOMISI PEMILIHAN OSIS & MPK • {period?.academicYear || '2026/2027'}
                    </p>
                  </div>
                  <div className="text-right shrink-0">
                    <span className="text-[10px] font-black bg-slate-100 text-slate-900 px-2 py-0.5 rounded border border-slate-400">
                      KARTU SUARA
                    </span>
                  </div>
                </div>

                {/* Voter Details & PIN */}
                <div className="py-3.5 grid grid-cols-3 gap-2.5">
                  <div className="col-span-2 space-y-1.5 text-xs">
                    <div>
                      <span className="text-slate-500 block text-[10px] uppercase font-black">
                        Nama Lengkap:
                      </span>
                      <strong className="text-slate-950 font-black text-sm block truncate">
                        {voter.studentName}
                      </strong>
                    </div>

                    <div className="grid grid-cols-2 gap-2 pt-1">
                      <div>
                        <span className="text-slate-500 block text-[10px] uppercase font-black">
                          NISN:
                        </span>
                        <span className="font-mono font-black text-slate-950 text-xs">
                          {voter.nisn}
                        </span>
                      </div>
                      <div>
                        <span className="text-slate-500 block text-[10px] uppercase font-black">
                          Kelas:
                        </span>
                        <span className="font-black text-slate-950 text-xs">
                          {voter.classGrade}
                        </span>
                      </div>
                    </div>

                    <div>
                      <span className="text-slate-500 block text-[10px] uppercase font-black">
                        Kompetensi Keahlian:
                      </span>
                      <span className="text-slate-800 text-xs font-bold block truncate">
                        {voter.major}
                      </span>
                    </div>
                  </div>

                  {/* QR & Security PIN Box */}
                  <div className="flex flex-col items-center justify-between border-l-2 border-slate-200 pl-2 text-center">
                    <div className="w-16 h-16 bg-white rounded-xl border-2 border-slate-900 flex items-center justify-center p-0.5 overflow-hidden shadow-xs print:border print:border-black">
                      <VoterCardQR nisn={voter.nisn} pin={voter.pin} />
                    </div>
                    <div className="mt-1.5 w-full bg-blue-50 border-2 border-blue-300 rounded-lg p-1.5">
                      <span className="text-[9px] font-black text-blue-950 block leading-none">
                        PIN RAHASIA:
                      </span>
                      <span className="text-sm font-mono font-black text-blue-800 tracking-wider">
                        {voter.pin}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Footer instructions */}
                <div className="pt-2 border-t-2 border-dashed border-slate-300 flex items-center justify-between text-[10px] text-slate-600 font-bold">
                  <span>* Rahasiakan PIN Anda • Berlaku 1 Kali Nyoblos</span>
                  <span className="font-black text-slate-900">PANITIA KPU PGRI 1</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
