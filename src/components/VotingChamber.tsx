import React, { useState, useEffect } from 'react';
import { useVoting } from '../context/VotingContext';
import { Candidate } from '../types/voting';
import { CandidateModal } from './CandidateModal';
import confetti from 'canvas-confetti';
import {
  Vote,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  ArrowLeft,
  ShieldCheck,
  Award,
  Sparkles,
  LogOut,
  ExternalLink,
} from 'lucide-react';

interface VotingChamberProps {
  onFinishVoting: () => void;
}

export const VotingChamber: React.FC<VotingChamberProps> = ({ onFinishVoting }) => {
  const {
    currentSession,
    logoutVoter,
    osisCandidates,
    mpkCandidates,
    castVote,
    activePeriod,
  } = useVoting();

  const [step, setStep] = useState<'OSIS' | 'MPK' | 'CONFIRM' | 'SUCCESS'>('OSIS');
  const [selectedOsisId, setSelectedOsisId] = useState<string | null>(null);
  const [selectedMpkId, setSelectedMpkId] = useState<string | null>(null);
  const [previewCandidate, setPreviewCandidate] = useState<Candidate | null>(null);
  const [isAgreed, setIsAgreed] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [receipt, setReceipt] = useState<any>(null);
  const [redirectCountdown, setRedirectCountdown] = useState(6);

  // Auto redirect countdown when success
  useEffect(() => {
    if (step !== 'SUCCESS') return;

    try {
      confetti({
        particleCount: 100,
        spread: 80,
        origin: { y: 0.6 },
      });
    } catch {
      // ignore
    }

    const timer = setInterval(() => {
      setRedirectCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          logoutVoter();
          onFinishVoting();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [step, onFinishVoting, logoutVoter]);

  if (!currentSession) {
    return (
      <div className="max-w-md mx-auto py-12 px-4 text-center">
        <div className="p-8 bg-white rounded-3xl border-2 border-slate-300 shadow-md space-y-4">
          <div className="w-14 h-14 rounded-2xl bg-amber-100 text-amber-800 flex items-center justify-center mx-auto border border-amber-300">
            <AlertTriangle className="w-7 h-7" />
          </div>
          <h2 className="text-xl font-black text-slate-950">
            Sesi Pemilih Belum Terbuka
          </h2>
          <p className="text-sm text-slate-700 font-medium">
            Silakan masukkan NISN dan PIN pada halaman login untuk mengakses bilik suara digital.
          </p>
          <button
            onClick={onFinishVoting}
            className="w-full py-3.5 px-5 bg-blue-600 text-white rounded-xl text-sm font-bold shadow-md hover:bg-blue-700 transition-colors cursor-pointer"
          >
            Menuju Login Siswa
          </button>
        </div>
      </div>
    );
  }

  const { voter } = currentSession;

  const selectedOsisCandidate = osisCandidates.find((c) => c.id === selectedOsisId);
  const selectedMpkCandidate = mpkCandidates.find((c) => c.id === selectedMpkId);

  const handleConfirmAndSubmit = () => {
    if (!selectedOsisId || !selectedMpkId) {
      setSubmitError('Anda harus memilih 1 paslon OSIS dan 1 paslon MPK sebelum mengirim.');
      return;
    }

    if (!isAgreed) {
      setSubmitError('Harap centang persetujuan kesadaran dan keaslian pilihan Anda.');
      return;
    }

    setIsSubmitting(true);
    setSubmitError(null);

    setTimeout(() => {
      const res = castVote(selectedOsisId, selectedMpkId);
      setIsSubmitting(false);

      if (res.success && res.receipt) {
        setReceipt(res.receipt);
        setStep('SUCCESS');
      } else {
        setSubmitError(res.error || 'Terjadi kesalahan sistem saat mencatat suara.');
      }
    }, 600);
  };

  return (
    <div className="max-w-5xl mx-auto py-4 sm:py-6 px-2 sm:px-4 space-y-6">
      {/* Voter Profile Banner */}
      <div className="bg-slate-900 text-white rounded-3xl p-5 sm:p-6 shadow-lg border-2 border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-blue-600 flex items-center justify-center text-white font-black text-xl shadow-md border-2 border-blue-400">
            {voter.studentName.charAt(0)}
          </div>
          <div>
            <div className="flex items-center gap-2.5">
              <span className="text-xs font-black uppercase tracking-wider text-emerald-300 bg-emerald-950 px-2.5 py-0.5 rounded-md border border-emerald-500/40">
                Pemilih Terverifikasi
              </span>
              <span className="text-xs sm:text-sm text-slate-300 font-mono font-bold">
                NISN: {voter.nisn}
              </span>
            </div>
            <h2 className="text-lg sm:text-xl font-black text-white leading-tight mt-1">
              {voter.studentName}
            </h2>
            <p className="text-xs sm:text-sm text-blue-300 font-bold mt-0.5">
              {voter.classGrade} • {voter.major}
            </p>
          </div>
        </div>

        {step !== 'SUCCESS' && (
          <div className="flex items-center gap-2 self-end sm:self-center">
            <button
              onClick={logoutVoter}
              className="px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold text-rose-200 bg-rose-950/80 hover:bg-rose-900 border border-rose-700/60 transition-colors flex items-center gap-2 cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
              Batal & Keluar
            </button>
          </div>
        )}
      </div>

      {/* Progress Stepper Bar with High Contrast */}
      {step !== 'SUCCESS' && (
        <div className="bg-white rounded-2xl p-3 sm:p-4 border-2 border-slate-200 shadow-2xs">
          <div className="grid grid-cols-3 gap-2 sm:gap-4 text-center text-xs sm:text-sm">
            {/* Step 1 */}
            <div
              className={`p-2.5 sm:p-3 rounded-xl font-extrabold flex items-center justify-center gap-2 transition-all ${
                step === 'OSIS'
                  ? 'bg-blue-50 text-blue-900 border-2 border-blue-500 shadow-2xs'
                  : selectedOsisId
                  ? 'bg-emerald-50 text-emerald-900 border border-emerald-300'
                  : 'text-slate-600 bg-slate-50'
              }`}
            >
              <span className="w-6 h-6 rounded-full bg-blue-600 text-white text-xs flex items-center justify-center font-black">
                1
              </span>
              <span className="hidden sm:inline">Surat Suara OSIS</span>
              <span className="sm:hidden">1. OSIS</span>
              {selectedOsisId && <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />}
            </div>

            {/* Step 2 */}
            <div
              className={`p-2.5 sm:p-3 rounded-xl font-extrabold flex items-center justify-center gap-2 transition-all ${
                step === 'MPK'
                  ? 'bg-blue-50 text-blue-900 border-2 border-blue-500 shadow-2xs'
                  : selectedMpkId
                  ? 'bg-emerald-50 text-emerald-900 border border-emerald-300'
                  : 'text-slate-600 bg-slate-50'
              }`}
            >
              <span className="w-6 h-6 rounded-full bg-blue-600 text-white text-xs flex items-center justify-center font-black">
                2
              </span>
              <span className="hidden sm:inline">Surat Suara MPK</span>
              <span className="sm:hidden">2. MPK</span>
              {selectedMpkId && <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />}
            </div>

            {/* Step 3 */}
            <div
              className={`p-2.5 sm:p-3 rounded-xl font-extrabold flex items-center justify-center gap-2 transition-all ${
                step === 'CONFIRM'
                  ? 'bg-blue-50 text-blue-900 border-2 border-blue-500 shadow-2xs'
                  : 'text-slate-600 bg-slate-50'
              }`}
            >
              <span className="w-6 h-6 rounded-full bg-blue-600 text-white text-xs flex items-center justify-center font-black">
                3
              </span>
              <span className="hidden sm:inline">Konfirmasi & Kirim</span>
              <span className="sm:hidden">3. Kirim</span>
            </div>
          </div>
        </div>
      )}

      {/* STEP 1: SURAT SUARA OSIS */}
      {step === 'OSIS' && (
        <div className="bg-white rounded-3xl border-2 border-slate-200 p-5 sm:p-8 shadow-xs space-y-7">
          {/* Header of Ballot */}
          <div className="text-center border-b-2 border-slate-200 pb-5">
            <span className="text-xs sm:text-sm font-black text-blue-900 uppercase tracking-widest bg-blue-100 px-4 py-1.5 rounded-full border border-blue-300">
              SURAT SUARA DIGITAL 1
            </span>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-950 mt-3">
              Pemilihan Calon Ketua & Wakil Ketua OSIS
            </h1>
            <p className="text-xs sm:text-sm text-slate-700 font-medium mt-1.5 max-w-xl mx-auto leading-relaxed">
              Sentuh atau klik tombol <strong>"PILIH PASLON"</strong> pada kandidat yang Anda yakini mampu memajukan OSIS SMKS PGRI 1 Sukabumi masa bakti {activePeriod?.academicYear}.
            </p>
          </div>

          {/* Candidates Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {osisCandidates.map((cand) => {
              const isSelected = selectedOsisId === cand.id;

              return (
                <div
                  key={cand.id}
                  className={`rounded-3xl border-3 transition-all overflow-hidden flex flex-col justify-between relative ${
                    isSelected
                      ? 'border-blue-600 bg-blue-50/50 shadow-xl ring-4 ring-blue-500/20'
                      : 'border-slate-300 bg-white hover:border-slate-400 hover:shadow-md'
                  }`}
                >
                  {/* Selected Badge */}
                  {isSelected && (
                    <div className="bg-blue-600 text-white text-xs sm:text-sm font-black py-1.5 px-4 text-center flex items-center justify-center gap-2 shadow-xs">
                      <CheckCircle2 className="w-4 h-4" />
                      PASLON TERPILIH (TERCOBLOS)
                    </div>
                  )}

                  <div className="p-5 sm:p-6">
                    {/* Ballot Number Header */}
                    <div className="flex items-center justify-between mb-4">
                      <div className="w-14 h-14 rounded-2xl bg-slate-950 text-white font-black text-2xl flex items-center justify-center shadow-md">
                        0{cand.ballotNumber}
                      </div>
                      <span className="text-xs sm:text-sm font-black text-slate-600 uppercase tracking-wider">
                        NOMOR URUT
                      </span>
                    </div>

                    {/* Candidate Photo */}
                    <div className="relative mb-4 overflow-hidden rounded-2xl border-2 border-slate-200">
                      <img
                        src={cand.photoUrl}
                        alt={cand.chairmanName}
                        className="w-full h-56 object-cover"
                      />
                    </div>

                    {/* Names with High Contrast */}
                    <div className="space-y-3">
                      <div>
                        <p className="text-xs font-black text-blue-700 uppercase tracking-wider">
                          Calon Ketua OSIS:
                        </p>
                        <h3 className="text-base sm:text-lg font-black text-slate-950 leading-tight">
                          {cand.chairmanName}
                        </h3>
                        <p className="text-xs sm:text-sm font-bold text-slate-700">
                          Kelas: {cand.chairmanClass}
                        </p>
                      </div>

                      <div className="pt-2 border-t border-slate-200">
                        <p className="text-xs font-black text-blue-700 uppercase tracking-wider">
                          Calon Wakil Ketua OSIS:
                        </p>
                        <h4 className="text-sm sm:text-base font-extrabold text-slate-900 leading-tight">
                          {cand.viceChairmanName}
                        </h4>
                        <p className="text-xs sm:text-sm font-bold text-slate-700">
                          Kelas: {cand.viceChairmanClass}
                        </p>
                      </div>

                      {/* Slogan */}
                      {cand.slogan && (
                        <p className="text-xs sm:text-sm italic font-semibold text-slate-800 bg-slate-100 p-2.5 rounded-xl border border-slate-200 mt-2 line-clamp-2">
                          "{cand.slogan}"
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="p-5 sm:p-6 pt-0 space-y-2.5">
                    <button
                      type="button"
                      onClick={() => setPreviewCandidate(cand)}
                      className="w-full py-2.5 text-xs sm:text-sm font-bold text-slate-700 hover:text-slate-950 hover:bg-slate-100 rounded-xl transition-colors flex items-center justify-center gap-2 border-2 border-slate-300 cursor-pointer"
                    >
                      <ExternalLink className="w-4 h-4" />
                      Baca Visi, Misi & Program
                    </button>

                    <button
                      type="button"
                      onClick={() => setSelectedOsisId(cand.id)}
                      className={`w-full py-3.5 px-4 rounded-2xl font-black text-sm sm:text-base transition-all flex items-center justify-center gap-2 cursor-pointer ${
                        isSelected
                          ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg'
                          : 'bg-blue-600 hover:bg-blue-700 text-white shadow-md shadow-blue-600/30'
                      }`}
                    >
                      {isSelected ? (
                        <>
                          <CheckCircle2 className="w-5 h-5" />
                          Pilihan Terpilih (Coblos)
                        </>
                      ) : (
                        <>
                          <Vote className="w-5 h-5" />
                          PILIH PASLON 0{cand.ballotNumber}
                        </>
                      )}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Bottom Bar: Next to MPK */}
          <div className="pt-5 border-t-2 border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="text-xs sm:text-sm text-slate-700 font-bold">
              {selectedOsisId ? (
                <span className="text-emerald-800 font-extrabold flex items-center gap-1.5">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                  Paslon OSIS sudah dipilih. Silakan lanjut ke pemilihan MPK.
                </span>
              ) : (
                <span className="text-amber-800 font-bold">
                  * Harap tentukan 1 pasangan calon OSIS terlebih dahulu.
                </span>
              )}
            </div>

            <button
              onClick={() => setStep('MPK')}
              disabled={!selectedOsisId}
              className="w-full sm:w-auto px-7 py-3.5 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 disabled:text-slate-500 text-white font-black text-xs sm:text-sm rounded-2xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer disabled:cursor-not-allowed"
            >
              <span>Lanjut ke Surat Suara MPK</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* STEP 2: SURAT SUARA MPK */}
      {step === 'MPK' && (
        <div className="bg-white rounded-3xl border-2 border-slate-200 p-5 sm:p-8 shadow-xs space-y-7">
          {/* Header of Ballot */}
          <div className="text-center border-b-2 border-slate-200 pb-5">
            <span className="text-xs sm:text-sm font-black text-indigo-900 uppercase tracking-widest bg-indigo-100 px-4 py-1.5 rounded-full border border-indigo-300">
              SURAT SUARA DIGITAL 2
            </span>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-950 mt-3">
              Pemilihan Calon Ketua & Wakil Ketua MPK
            </h1>
            <p className="text-xs sm:text-sm text-slate-700 font-medium mt-1.5 max-w-xl mx-auto leading-relaxed">
              Pilih pasangan calon Majelis Permusyawaratan Kelas (MPK) untuk menjalankan peran aspirasi dan pengawasan legislatif siswa SMKS PGRI 1 Sukabumi.
            </p>
          </div>

          {/* Candidates Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            {mpkCandidates.map((cand) => {
              const isSelected = selectedMpkId === cand.id;

              return (
                <div
                  key={cand.id}
                  className={`rounded-3xl border-3 transition-all overflow-hidden flex flex-col justify-between relative ${
                    isSelected
                      ? 'border-indigo-600 bg-indigo-50/50 shadow-xl ring-4 ring-indigo-500/20'
                      : 'border-slate-300 bg-white hover:border-slate-400 hover:shadow-md'
                  }`}
                >
                  {/* Selected Badge */}
                  {isSelected && (
                    <div className="bg-indigo-600 text-white text-xs sm:text-sm font-black py-1.5 px-4 text-center flex items-center justify-center gap-2 shadow-xs">
                      <CheckCircle2 className="w-4 h-4" />
                      PASLON TERPILIH (TERCOBLOS)
                    </div>
                  )}

                  <div className="p-5 sm:p-6">
                    {/* Ballot Number Header */}
                    <div className="flex items-center justify-between mb-4">
                      <div className="w-14 h-14 rounded-2xl bg-slate-950 text-white font-black text-2xl flex items-center justify-center shadow-md">
                        0{cand.ballotNumber}
                      </div>
                      <span className="text-xs sm:text-sm font-black text-slate-600 uppercase tracking-wider">
                        NOMOR URUT
                      </span>
                    </div>

                    {/* Candidate Photo */}
                    <div className="relative mb-4 overflow-hidden rounded-2xl border-2 border-slate-200">
                      <img
                        src={cand.photoUrl}
                        alt={cand.chairmanName}
                        className="w-full h-56 object-cover"
                      />
                    </div>

                    {/* Names with High Contrast */}
                    <div className="space-y-3">
                      <div>
                        <p className="text-xs font-black text-indigo-700 uppercase tracking-wider">
                          Calon Ketua MPK:
                        </p>
                        <h3 className="text-base sm:text-lg font-black text-slate-950 leading-tight">
                          {cand.chairmanName}
                        </h3>
                        <p className="text-xs sm:text-sm font-bold text-slate-700">
                          Kelas: {cand.chairmanClass}
                        </p>
                      </div>

                      <div className="pt-2 border-t border-slate-200">
                        <p className="text-xs font-black text-indigo-700 uppercase tracking-wider">
                          Calon Wakil Ketua MPK:
                        </p>
                        <h4 className="text-sm sm:text-base font-extrabold text-slate-900 leading-tight">
                          {cand.viceChairmanName}
                        </h4>
                        <p className="text-xs sm:text-sm font-bold text-slate-700">
                          Kelas: {cand.viceChairmanClass}
                        </p>
                      </div>

                      {/* Slogan */}
                      {cand.slogan && (
                        <p className="text-xs sm:text-sm italic font-semibold text-slate-800 bg-slate-100 p-2.5 rounded-xl border border-slate-200 mt-2 line-clamp-2">
                          "{cand.slogan}"
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="p-5 sm:p-6 pt-0 space-y-2.5">
                    <button
                      type="button"
                      onClick={() => setPreviewCandidate(cand)}
                      className="w-full py-2.5 text-xs sm:text-sm font-bold text-slate-700 hover:text-slate-950 hover:bg-slate-100 rounded-xl transition-colors flex items-center justify-center gap-2 border-2 border-slate-300 cursor-pointer"
                    >
                      <ExternalLink className="w-4 h-4" />
                      Baca Visi, Misi & Program
                    </button>

                    <button
                      type="button"
                      onClick={() => setSelectedMpkId(cand.id)}
                      className={`w-full py-3.5 px-4 rounded-2xl font-black text-sm sm:text-base transition-all flex items-center justify-center gap-2 cursor-pointer ${
                        isSelected
                          ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg'
                          : 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-md shadow-indigo-600/30'
                      }`}
                    >
                      {isSelected ? (
                        <>
                          <CheckCircle2 className="w-5 h-5" />
                          Pilihan Terpilih (Coblos)
                        </>
                      ) : (
                        <>
                          <Award className="w-5 h-5" />
                          PILIH PASLON 0{cand.ballotNumber}
                        </>
                      )}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Bottom Bar */}
          <div className="pt-5 border-t-2 border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4">
            <button
              onClick={() => setStep('OSIS')}
              className="w-full sm:w-auto px-5 py-3 text-xs sm:text-sm font-bold text-slate-800 hover:bg-slate-100 rounded-2xl transition-colors flex items-center justify-center gap-2 border-2 border-slate-300 cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              Kembali ke Surat Suara OSIS
            </button>

            <button
              onClick={() => setStep('CONFIRM')}
              disabled={!selectedMpkId}
              className="w-full sm:w-auto px-7 py-3.5 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 disabled:text-slate-500 text-white font-black text-xs sm:text-sm rounded-2xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer disabled:cursor-not-allowed"
            >
              <span>Lanjut ke Konfirmasi Akhir</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* STEP 3: KONFIRMASI AKHIR */}
      {step === 'CONFIRM' && (
        <div className="bg-white rounded-3xl border-2 border-slate-200 p-5 sm:p-8 shadow-xs space-y-7">
          <div className="text-center border-b-2 border-slate-200 pb-5">
            <span className="text-xs sm:text-sm font-black text-amber-900 uppercase tracking-widest bg-amber-100 px-4 py-1.5 rounded-full border border-amber-300">
              LANGKAH TERAKHIR
            </span>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-950 mt-3">
              Konfirmasi Pilihan Pasangan Calon
            </h1>
            <p className="text-xs sm:text-sm text-slate-700 font-medium mt-1.5 max-w-xl mx-auto leading-relaxed">
              Periksa kembali pilihan Anda sebelum suara dicatat ke dalam kotak suara digital yang terenkripsi.
            </p>
          </div>

          {submitError && (
            <div className="p-4 bg-rose-50 border-2 border-rose-300 rounded-2xl text-xs sm:text-sm text-rose-950 font-bold flex items-start gap-2.5">
              <AlertTriangle className="w-5 h-5 text-rose-700 shrink-0 mt-0.5" />
              <span>{submitError}</span>
            </div>
          )}

          {/* Summary Cards Side-by-Side */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* OSIS Selection Card */}
            <div className="p-5 rounded-2xl border-3 border-blue-600 bg-blue-50/50 shadow-xs">
              <div className="flex items-center justify-between mb-3.5">
                <span className="text-xs sm:text-sm font-black uppercase text-blue-900 bg-blue-200 px-2.5 py-1 rounded-md">
                  PILIHAN KETUA & WAKIL OSIS
                </span>
                <button
                  onClick={() => setStep('OSIS')}
                  className="text-xs sm:text-sm text-blue-800 hover:text-blue-950 hover:underline font-black cursor-pointer"
                >
                  Ubah Pilihan
                </button>
              </div>

              {selectedOsisCandidate ? (
                <div className="flex gap-4">
                  <img
                    src={selectedOsisCandidate.photoUrl}
                    alt={selectedOsisCandidate.chairmanName}
                    className="w-20 h-24 object-cover rounded-xl border-2 border-slate-300 shrink-0"
                  />
                  <div>
                    <div className="inline-block bg-blue-700 text-white font-black text-xs px-2.5 py-1 rounded-md mb-1.5">
                      Nomor Urut 0{selectedOsisCandidate.ballotNumber}
                    </div>
                    <h3 className="font-black text-slate-950 text-base">
                      {selectedOsisCandidate.chairmanName}
                    </h3>
                    <p className="text-xs sm:text-sm font-bold text-slate-700">
                      {selectedOsisCandidate.chairmanClass}
                    </p>
                    <p className="font-black text-slate-900 text-xs sm:text-sm mt-1">
                      & {selectedOsisCandidate.viceChairmanName}
                    </p>
                    <p className="text-xs sm:text-sm font-bold text-slate-700">
                      {selectedOsisCandidate.viceChairmanClass}
                    </p>
                  </div>
                </div>
              ) : (
                <p className="text-xs sm:text-sm text-rose-700 font-bold">Belum memilih paslon OSIS.</p>
              )}
            </div>

            {/* MPK Selection Card */}
            <div className="p-5 rounded-2xl border-3 border-indigo-600 bg-indigo-50/50 shadow-xs">
              <div className="flex items-center justify-between mb-3.5">
                <span className="text-xs sm:text-sm font-black uppercase text-indigo-900 bg-indigo-200 px-2.5 py-1 rounded-md">
                  PILIHAN KETUA & WAKIL MPK
                </span>
                <button
                  onClick={() => setStep('MPK')}
                  className="text-xs sm:text-sm text-indigo-800 hover:text-indigo-950 hover:underline font-black cursor-pointer"
                >
                  Ubah Pilihan
                </button>
              </div>

              {selectedMpkCandidate ? (
                <div className="flex gap-4">
                  <img
                    src={selectedMpkCandidate.photoUrl}
                    alt={selectedMpkCandidate.chairmanName}
                    className="w-20 h-24 object-cover rounded-xl border-2 border-slate-300 shrink-0"
                  />
                  <div>
                    <div className="inline-block bg-indigo-700 text-white font-black text-xs px-2.5 py-1 rounded-md mb-1.5">
                      Nomor Urut 0{selectedMpkCandidate.ballotNumber}
                    </div>
                    <h3 className="font-black text-slate-950 text-base">
                      {selectedMpkCandidate.chairmanName}
                    </h3>
                    <p className="text-xs sm:text-sm font-bold text-slate-700">
                      {selectedMpkCandidate.chairmanClass}
                    </p>
                    <p className="font-black text-slate-900 text-xs sm:text-sm mt-1">
                      & {selectedMpkCandidate.viceChairmanName}
                    </p>
                    <p className="text-xs sm:text-sm font-bold text-slate-700">
                      {selectedMpkCandidate.viceChairmanClass}
                    </p>
                  </div>
                </div>
              ) : (
                <p className="text-xs sm:text-sm text-rose-700 font-bold">Belum memilih paslon MPK.</p>
              )}
            </div>
          </div>

          {/* LUBER Notice & Agreement Checkbox */}
          <div className="p-5 rounded-2xl bg-amber-50 border-2 border-amber-300 space-y-3.5">
            <div className="flex items-start gap-3">
              <ShieldCheck className="w-6 h-6 text-amber-800 shrink-0 mt-0.5" />
              <div className="text-xs sm:text-sm text-amber-950 leading-relaxed">
                <strong className="block font-black text-sm sm:text-base">PERINGATAN INTEGRITAS BILIK SUARA:</strong>
                Pilihan Anda bersifat <strong>FINAL & MENGIKAT</strong>. Setelah Anda menekan tombol "Konfirmasi & Kirim Suara", suara Anda akan dienkripsi dan status hak suara Anda langsung ditutup (One-Time Token). Anda tidak dapat mengubah atau memilih kembali.
              </div>
            </div>

            <label className="flex items-center gap-3 pt-3 border-t-2 border-amber-200 cursor-pointer text-xs sm:text-sm font-black text-slate-950">
              <input
                type="checkbox"
                checked={isAgreed}
                onChange={(e) => setIsAgreed(e.target.checked)}
                className="w-5 h-5 text-blue-600 rounded border-2 border-slate-400 focus:ring-blue-500 cursor-pointer"
              />
              <span>
                Saya menyatakan dengan sungguh-sungguh bahwa pilihan ini adalah kehendak saya sendiri tanpa intervensi pihak manapun.
              </span>
            </label>
          </div>

          {/* Actions */}
          <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-4">
            <button
              onClick={() => setStep('MPK')}
              className="w-full sm:w-auto px-5 py-3 text-xs sm:text-sm font-bold text-slate-800 hover:bg-slate-100 rounded-2xl transition-colors border-2 border-slate-300 cursor-pointer"
            >
              Kembali Periksa Surat Suara
            </button>

            <button
              onClick={handleConfirmAndSubmit}
              disabled={isSubmitting || !isAgreed || !selectedOsisId || !selectedMpkId}
              className="w-full sm:w-auto px-9 py-4 bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-300 disabled:text-slate-500 text-white font-black text-sm sm:text-base rounded-2xl shadow-lg transition-all flex items-center justify-center gap-2.5 cursor-pointer disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 border-3 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Mengunci Suara ke Kotak Digital...</span>
                </div>
              ) : (
                <>
                  <Vote className="w-5 h-5" />
                  <span>KONFIRMASI & COBLOS SEKARANG</span>
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* STEP 4: SUKSES & DIGITAL RECEIPT */}
      {step === 'SUCCESS' && receipt && (
        <div className="bg-white rounded-3xl border-2 border-slate-300 p-6 sm:p-10 shadow-2xl max-w-xl mx-auto text-center space-y-6 animate-in zoom-in-95 duration-200">
          <div className="w-20 h-20 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto shadow-inner border-2 border-emerald-300">
            <CheckCircle2 className="w-12 h-12" />
          </div>

          <div>
            <span className="text-xs sm:text-sm font-black uppercase tracking-wider text-emerald-900 bg-emerald-100 px-4 py-1.5 rounded-full border border-emerald-300">
              HAK SUARA TELAH BERHASIL DICATAT
            </span>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-950 mt-3">
              Terima Kasih Atas Partisipasi Anda!
            </h1>
            <p className="text-xs sm:text-sm text-slate-700 font-medium mt-1.5">
              Suara Anda telah resmi masuk ke dalam kotak suara digital SMKS PGRI 1 Sukabumi secara anonim dan aman.
            </p>
          </div>

          {/* Official Digital Receipt Card */}
          <div className="p-6 rounded-2xl bg-slate-50 border-2 border-slate-300 text-left space-y-3.5 relative overflow-hidden">
            <div className="border-b-2 border-slate-200 pb-3 flex items-center justify-between">
              <span className="text-xs sm:text-sm font-black text-slate-800 uppercase">
                STRUK VERIFIKASI PEMILIH
              </span>
              <span className="text-xs sm:text-sm font-mono bg-blue-100 text-blue-900 px-3 py-1 rounded-md font-black border border-blue-300">
                {receipt.receiptId}
              </span>
            </div>

            <div className="space-y-2 text-xs sm:text-sm font-medium">
              <div className="flex justify-between">
                <span className="text-slate-600">Nama Siswa:</span>
                <span className="font-black text-slate-950">{receipt.voterName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600">NISN:</span>
                <span className="font-mono font-bold text-slate-900">{receipt.voterNisn}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600">Kelas / Jurusan:</span>
                <span className="font-extrabold text-slate-900">{receipt.voterClass}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600">Waktu Pencatatan:</span>
                <span className="font-mono text-slate-800 font-bold">
                  {new Date(receipt.timestamp).toLocaleString('id-ID', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                    second: '2-digit',
                  })} WIB
                </span>
              </div>
              <div className="flex justify-between pt-1 border-t border-slate-200">
                <span className="text-slate-600">Status Hak Suara:</span>
                <span className="font-black text-emerald-700">SUDAH MEMILIH (LUNAS)</span>
              </div>
            </div>

            <div className="pt-2 text-xs text-slate-500 italic">
              * Demi menjaga asas RAHASIA (LUBER), nama pasangan calon yang Anda pilih sengaja tidak dimunculkan pada tanda terima ini.
            </div>
          </div>

          {/* Countdown & Redirect prompt */}
          <div className="p-3.5 bg-blue-50 rounded-2xl border border-blue-200 text-xs sm:text-sm text-blue-950 font-bold flex items-center justify-center gap-2">
            <Sparkles className="w-4 h-4 text-blue-700 animate-spin" />
            <span>
              Sesi akan otomatis keluar dalam <strong>{redirectCountdown} detik</strong>...
            </span>
          </div>

          <button
            onClick={() => {
              logoutVoter();
              onFinishVoting();
            }}
            className="w-full py-4 bg-slate-950 hover:bg-slate-800 text-white rounded-2xl text-xs sm:text-sm font-black shadow-lg transition-colors cursor-pointer"
          >
            Kembali ke Beranda & Quick Count Sekarang
          </button>
        </div>
      )}

      {/* Candidate Vision & Mission Modal */}
      <CandidateModal
        candidate={previewCandidate}
        onClose={() => setPreviewCandidate(null)}
        onSelect={(c) => {
          if (c.category === 'OSIS') setSelectedOsisId(c.id);
          if (c.category === 'MPK') setSelectedMpkId(c.id);
        }}
        isSelected={
          previewCandidate?.category === 'OSIS'
            ? selectedOsisId === previewCandidate?.id
            : selectedMpkId === previewCandidate?.id
        }
      />
    </div>
  );
};
