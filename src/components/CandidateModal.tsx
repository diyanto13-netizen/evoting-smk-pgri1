import React from 'react';
import { Candidate } from '../types/voting';
import { X, CheckCircle2, Award, Target, BookOpen } from 'lucide-react';

interface CandidateModalProps {
  candidate: Candidate | null;
  onClose: () => void;
  onSelect?: (candidate: Candidate) => void;
  isSelected?: boolean;
}

export const CandidateModal: React.FC<CandidateModalProps> = ({
  candidate,
  onClose,
  onSelect,
  isSelected,
}) => {
  if (!candidate) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-950/75 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border-2 border-slate-300 relative">
        {/* Header with Category Badge */}
        <div className="sticky top-0 bg-white/95 backdrop-blur-md px-6 py-4.5 border-b-2 border-slate-200 flex items-center justify-between z-10">
          <div className="flex items-center gap-3">
            <span className="w-10 h-10 rounded-xl bg-blue-700 text-white font-black text-base flex items-center justify-center shadow-xs">
              0{candidate.ballotNumber}
            </span>
            <div>
              <span className="text-xs font-black uppercase tracking-wider text-blue-900 bg-blue-100 px-2.5 py-0.5 rounded-md border border-blue-300">
                Kandidat Pasangan {candidate.category}
              </span>
              <h2 className="text-lg sm:text-xl font-black text-slate-950 leading-tight mt-0.5">
                Nomor Urut 0{candidate.ballotNumber}
              </h2>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-500 hover:text-slate-950 hover:bg-slate-100 rounded-full transition-colors cursor-pointer"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 sm:p-8 space-y-7">
          {/* Top Profile Card */}
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5 p-5 rounded-2xl bg-slate-50 border-2 border-slate-200">
            <img
              src={candidate.photoUrl}
              alt={candidate.chairmanName}
              className="w-32 h-40 object-cover rounded-2xl shadow-md border-2 border-white ring-2 ring-slate-300 shrink-0"
            />
            <div className="space-y-3.5 text-center sm:text-left flex-1">
              <div>
                <p className="text-xs font-black text-blue-800 uppercase tracking-wider">
                  Calon Ketua {candidate.category}:
                </p>
                <h3 className="text-lg sm:text-xl font-black text-slate-950">
                  {candidate.chairmanName}
                </h3>
                <p className="text-xs sm:text-sm text-slate-700 font-bold">
                  Kelas: {candidate.chairmanClass}
                </p>
              </div>

              <div className="pt-2 border-t border-slate-200">
                <p className="text-xs font-black text-blue-800 uppercase tracking-wider">
                  Calon Wakil Ketua {candidate.category}:
                </p>
                <h4 className="text-base sm:text-lg font-black text-slate-900">
                  {candidate.viceChairmanName}
                </h4>
                <p className="text-xs sm:text-sm text-slate-700 font-bold">
                  Kelas: {candidate.viceChairmanClass}
                </p>
              </div>

              {candidate.slogan && (
                <div className="pt-1">
                  <span className="inline-block text-xs sm:text-sm italic font-semibold text-amber-950 bg-amber-100 px-3.5 py-1.5 rounded-xl border border-amber-300">
                    "{candidate.slogan}"
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Visi */}
          <div className="space-y-2.5">
            <div className="flex items-center gap-2 text-slate-950 font-black text-sm sm:text-base">
              <Target className="w-5 h-5 text-blue-700" />
              <span>VISI UTAMA</span>
            </div>
            <p className="text-xs sm:text-sm text-slate-800 font-medium leading-relaxed bg-blue-50/80 p-4 rounded-2xl border-2 border-blue-200">
              "{candidate.vision}"
            </p>
          </div>

          {/* Misi */}
          <div className="space-y-2.5">
            <div className="flex items-center gap-2 text-slate-950 font-black text-sm sm:text-base">
              <CheckCircle2 className="w-5 h-5 text-emerald-700" />
              <span>MISI KERJA</span>
            </div>
            <ul className="space-y-2.5 text-xs sm:text-sm text-slate-800">
              {candidate.mission.map((item, idx) => (
                <li
                  key={idx}
                  className="flex items-start gap-3 p-3 rounded-xl bg-slate-50 border border-slate-200"
                >
                  <span className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-900 text-xs font-black flex items-center justify-center shrink-0 mt-0.5 border border-emerald-300">
                    {idx + 1}
                  </span>
                  <span className="leading-relaxed font-semibold">{item}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Program Unggulan */}
          {candidate.programs && candidate.programs.length > 0 && (
            <div className="space-y-2.5">
              <div className="flex items-center gap-2 text-slate-950 font-black text-sm sm:text-base">
                <Award className="w-5 h-5 text-amber-600" />
                <span>PROGRAM KERJA UNGGULAN</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs sm:text-sm">
                {candidate.programs.map((prog, idx) => (
                  <div
                    key={idx}
                    className="p-3.5 rounded-2xl bg-amber-50/80 border-2 border-amber-200 text-slate-900 flex items-start gap-2.5"
                  >
                    <BookOpen className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
                    <span className="font-bold leading-snug">{prog}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="sticky bottom-0 bg-white/95 backdrop-blur-md px-6 py-4.5 border-t-2 border-slate-200 flex items-center justify-end gap-3 z-10">
          <button
            onClick={onClose}
            className="px-5 py-2.5 text-xs sm:text-sm font-bold text-slate-700 hover:text-slate-950 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
          >
            Tutup Informasi
          </button>
          {onSelect && (
            <button
              onClick={() => {
                onSelect(candidate);
                onClose();
              }}
              className={`px-6 py-2.5 text-xs sm:text-sm font-black rounded-xl shadow-md transition-all flex items-center gap-2 cursor-pointer ${
                isSelected
                  ? 'bg-emerald-600 text-white hover:bg-emerald-700'
                  : 'bg-blue-600 text-white hover:bg-blue-700'
              }`}
            >
              {isSelected ? (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  Sudah Terpilih
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  Pilih Paslon 0{candidate.ballotNumber}
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
