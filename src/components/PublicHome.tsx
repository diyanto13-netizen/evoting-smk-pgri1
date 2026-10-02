import React, { useState } from 'react';
import { useVoting } from '../context/VotingContext';
import { StatCard } from './StatCard';
import { QuickCountChart } from './QuickCountChart';
import { CandidateModal } from './CandidateModal';
import { PemilosLogo } from './PemilosLogo';
import { Candidate } from '../types/voting';
import {
  Vote,
  ShieldCheck,
  CheckCircle2,
  ArrowRight,
  ChevronRight,
} from 'lucide-react';

interface PublicHomeProps {
  onGoToVote: () => void;
  onOpenGuide: () => void;
  onGoToAdmin: () => void;
}

export const PublicHome: React.FC<PublicHomeProps> = ({
  onGoToVote,
  onOpenGuide,
}) => {
  const {
    activePeriod,
    activeVoters,
    osisCandidates,
    mpkCandidates,
    activeTimelineSteps,
  } = useVoting();

  const [previewCandidate, setPreviewCandidate] = useState<Candidate | null>(null);

  const totalDpt = activeVoters.length;
  const totalVoted = activeVoters.filter((v) => v.hasVoted).length;
  const unvoted = totalDpt - totalVoted;
  const participationRate = totalDpt > 0 ? (totalVoted / totalDpt) * 100 : 0;

  return (
    <div className="space-y-8 sm:space-y-12 pb-16">
      {/* Hero Section with Proportional Responsive Typography */}
      <section className="relative overflow-hidden rounded-3xl bg-linear-to-b from-blue-950 via-slate-900 to-slate-900 text-white p-6 sm:p-12 lg:p-16 border-2 border-blue-900/60 shadow-2xl">
        {/* Subtle grid background glow */}
        <div className="absolute inset-0 bg-[radial-gradient(#3b82f6_1px,transparent_1px)] [background-size:24px_24px] opacity-20 pointer-events-none"></div>

        <div className="relative z-10 max-w-4xl mx-auto text-center space-y-6">
          {/* Official PEMILOS Emblem Card */}
          <div className="flex justify-center mb-1">
            <div className="p-2 sm:p-2.5 bg-white/10 backdrop-blur-md rounded-3xl border border-white/20 shadow-2xl inline-flex items-center gap-3">
              <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-white p-1 flex items-center justify-center shadow-md shrink-0">
                <PemilosLogo className="w-12 h-12 sm:w-14 sm:h-14 drop-shadow-sm" />
              </div>
              <div className="text-left pr-2 sm:pr-4">
                <span className="text-[10px] sm:text-xs font-black uppercase tracking-widest text-amber-300 block">
                  KOMISI PEMILIHAN OSIS & MPK
                </span>
                <span className="text-sm sm:text-base font-black text-white block">
                  SMKS PGRI 1 KOTA SUKABUMI
                </span>
                <span className="text-[10px] text-slate-300 font-bold block">
                  Pemilu Virtual Berasaskan LUBER JURDIL
                </span>
              </div>
            </div>
          </div>

          {/* Badge with high contrast */}
          <div className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full bg-blue-500/20 border-2 border-blue-400/40 text-blue-200 text-xs sm:text-sm font-bold backdrop-blur-md">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></span>
            <span>Pemilihan Umum Kesiswaan Masa Bakti {activePeriod?.academicYear || '2026/2027'}</span>
          </div>

          {/* Headline - Proportional for mobile, tablet, and PC with ultra-clear vivid color */}
          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-[1.15]">
            <span className="text-amber-300 drop-shadow-[0_4px_16px_rgba(252,211,77,0.35)] block mb-1.5 font-black tracking-wide">
              E-Voting OSIS & MPK
            </span>
            <span className="bg-linear-to-r from-sky-300 via-blue-200 to-amber-200 bg-clip-text text-transparent drop-shadow-md block sm:inline">
              SMKS PGRI 1 Kota Sukabumi
            </span>
          </h1>

          {/* Subtitle - Clean, readable, warm contrast */}
          <p className="text-sm sm:text-base lg:text-lg text-slate-200 max-w-2xl mx-auto leading-relaxed font-medium">
            Wadah demokrasi digital siswa yang transparan, langsung (*real-time*), rahasia,
            dan bebas kecurangan. Gunakan hak suara Anda untuk menentukan nahkoda baru almamater tercinta.
          </p>

          {/* Primary Action Buttons */}
          <div className="pt-2 flex flex-wrap items-center justify-center gap-3.5 sm:gap-5">
            <button
              onClick={onGoToVote}
              className="w-full sm:w-auto px-7 sm:px-9 py-4 bg-blue-600 hover:bg-blue-500 text-white rounded-2xl text-sm sm:text-base font-black shadow-xl shadow-blue-600/40 hover:shadow-blue-500/60 transition-all flex items-center justify-center gap-3 group cursor-pointer"
            >
              <Vote className="w-5 h-5 text-amber-300 group-hover:rotate-12 transition-transform" />
              <span>Masuk Bilik Suara (Coblos)</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>

            <button
              onClick={onOpenGuide}
              className="w-full sm:w-auto px-6 py-4 bg-white/10 hover:bg-white/20 text-white rounded-2xl text-sm sm:text-base font-bold border-2 border-white/25 backdrop-blur-md transition-all flex items-center justify-center gap-2.5 cursor-pointer"
            >
              <ShieldCheck className="w-5 h-5 text-emerald-400" />
              <span>Tata Cara & Asas LUBER</span>
            </button>
          </div>

          {/* Security Features micro indicators */}
          <div className="pt-6 border-t border-white/15 flex flex-wrap justify-center gap-4 sm:gap-8 text-xs sm:text-sm text-slate-300 font-bold">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>Token PIN Sekali Pakai</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>Suara Anonim (Asas LUBER)</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>Quick Count Akurat & Live</span>
            </div>
          </div>
        </div>
      </section>

      {/* KPI Stats Strip */}
      <section className="space-y-3">
        <div className="flex items-center justify-between px-1">
          <h2 className="text-xs sm:text-sm font-black uppercase tracking-wider text-slate-700">
            Statistik Kehadiran & Partisipasi DPT
          </h2>
          <span className="text-xs sm:text-sm font-bold text-blue-700">
            Pembaruan Langsung Real-Time
          </span>
        </div>
        <StatCard
          totalDpt={totalDpt}
          totalVoted={totalVoted}
          participationRate={participationRate}
          unvoted={unvoted}
          tpsStatus={activePeriod?.status || 'OPEN'}
        />
      </section>

      {/* Realtime Quick Count Visualizer */}
      <section>
        <QuickCountChart onOpenCandidateDetail={(c) => setPreviewCandidate(c)} />
      </section>

      {/* Meet the Candidates Section */}
      <section className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 border-b-2 border-slate-200 pb-4">
          <div>
            <span className="text-xs sm:text-sm font-black uppercase tracking-wider text-blue-900 bg-blue-100 px-3 py-1 rounded-md border border-blue-300">
              Profil Pasangan Calon
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-950 mt-2">
              Kandidat Ketua & Wakil Ketua OSIS - MPK
            </h2>
          </div>
          <p className="text-xs sm:text-sm text-slate-700 font-medium max-w-sm">
            Sentuh kartu paslon untuk membaca visi, misi, dan program kerja unggulan secara komprehensif.
          </p>
        </div>

        {/* OSIS Candidates Row */}
        <div className="space-y-4">
          <div className="flex items-center gap-2.5">
            <span className="w-3 h-3 rounded-full bg-blue-600"></span>
            <h3 className="text-sm sm:text-base font-black text-slate-900 uppercase tracking-wide">
              Calon Pasangan OSIS SMKS PGRI 1 Sukabumi
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {osisCandidates.map((c) => (
              <div
                key={c.id}
                onClick={() => setPreviewCandidate(c)}
                className="bg-white rounded-3xl border-2 border-slate-300 p-5 sm:p-6 shadow-xs hover:shadow-lg hover:border-blue-500 transition-all cursor-pointer group flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between mb-4">
                    <div className="w-12 h-12 rounded-2xl bg-blue-700 text-white font-black text-lg flex items-center justify-center shadow-xs">
                      0{c.ballotNumber}
                    </div>
                    <span className="text-xs font-black text-slate-600 uppercase tracking-wider">
                      PASLON OSIS
                    </span>
                  </div>

                  <div className="relative mb-4 overflow-hidden rounded-2xl border-2 border-slate-200">
                    <img
                      src={c.photoUrl}
                      alt={c.chairmanName}
                      className="w-full h-52 object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>

                  <h4 className="font-black text-slate-950 text-base sm:text-lg leading-tight group-hover:text-blue-700 transition-colors">
                    {c.chairmanName}
                  </h4>
                  <p className="text-xs sm:text-sm font-bold text-slate-700">
                    Kelas: {c.chairmanClass} (Calon Ketua)
                  </p>

                  <h5 className="font-extrabold text-slate-900 text-sm sm:text-base mt-2">
                    & {c.viceChairmanName}
                  </h5>
                  <p className="text-xs sm:text-sm font-bold text-slate-700">
                    Kelas: {c.viceChairmanClass} (Calon Wakil)
                  </p>

                  {c.slogan && (
                    <p className="text-xs sm:text-sm italic font-semibold text-slate-800 bg-slate-100 p-3 rounded-xl border border-slate-200 mt-3 line-clamp-2">
                      "{c.slogan}"
                    </p>
                  )}
                </div>

                <div className="mt-5 pt-4 border-t-2 border-slate-200 flex items-center justify-between text-xs sm:text-sm font-black text-blue-700">
                  <span>Lihat Visi & Misi</span>
                  <ChevronRight className="w-5 h-5 group-hover:translate-x-1.5 transition-transform" />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* MPK Candidates Row */}
        <div className="space-y-4 pt-6">
          <div className="flex items-center gap-2.5">
            <span className="w-3 h-3 rounded-full bg-indigo-600"></span>
            <h3 className="text-sm sm:text-base font-black text-slate-900 uppercase tracking-wide">
              Calon Pasangan MPK SMKS PGRI 1 Sukabumi
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl">
            {mpkCandidates.map((c) => (
              <div
                key={c.id}
                onClick={() => setPreviewCandidate(c)}
                className="bg-white rounded-3xl border-2 border-slate-300 p-5 sm:p-6 shadow-xs hover:shadow-lg hover:border-indigo-500 transition-all cursor-pointer group flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between mb-4">
                    <div className="w-12 h-12 rounded-2xl bg-indigo-700 text-white font-black text-lg flex items-center justify-center shadow-xs">
                      0{c.ballotNumber}
                    </div>
                    <span className="text-xs font-black text-slate-600 uppercase tracking-wider">
                      PASLON MPK
                    </span>
                  </div>

                  <div className="relative mb-4 overflow-hidden rounded-2xl border-2 border-slate-200">
                    <img
                      src={c.photoUrl}
                      alt={c.chairmanName}
                      className="w-full h-52 object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>

                  <h4 className="font-black text-slate-950 text-base sm:text-lg leading-tight group-hover:text-indigo-700 transition-colors">
                    {c.chairmanName}
                  </h4>
                  <p className="text-xs sm:text-sm font-bold text-slate-700">
                    Kelas: {c.chairmanClass} (Calon Ketua)
                  </p>

                  <h5 className="font-extrabold text-slate-900 text-sm sm:text-base mt-2">
                    & {c.viceChairmanName}
                  </h5>
                  <p className="text-xs sm:text-sm font-bold text-slate-700">
                    Kelas: {c.viceChairmanClass} (Calon Wakil)
                  </p>

                  {c.slogan && (
                    <p className="text-xs sm:text-sm italic font-semibold text-slate-800 bg-slate-100 p-3 rounded-xl border border-slate-200 mt-3 line-clamp-2">
                      "{c.slogan}"
                    </p>
                  )}
                </div>

                <div className="mt-5 pt-4 border-t-2 border-slate-200 flex items-center justify-between text-xs sm:text-sm font-black text-indigo-700">
                  <span>Lihat Visi & Misi</span>
                  <ChevronRight className="w-5 h-5 group-hover:translate-x-1.5 transition-transform" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Timeline of Election */}
      <section className="bg-white rounded-3xl border-2 border-slate-300 p-6 sm:p-10 shadow-xs space-y-6">
        <div>
          <span className="text-xs sm:text-sm font-black uppercase tracking-wider text-slate-600">
            Jadwal Tahapan Pemilu
          </span>
          <h2 className="text-xl sm:text-2xl font-black text-slate-950 mt-1">
            Agenda Resmi Pemilihan OSIS-MPK SMKS PGRI 1 Sukabumi
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {activeTimelineSteps.map((step) => (
            <div
              key={step.id}
              className={`p-4 sm:p-5 rounded-2xl border-2 text-xs sm:text-sm space-y-2.5 flex flex-col justify-between transition-all ${
                step.status === 'ACTIVE'
                  ? 'border-blue-600 bg-blue-50/90 ring-2 ring-blue-500/30 shadow-xs'
                  : step.status === 'DONE'
                  ? 'border-slate-300 bg-slate-50'
                  : 'border-slate-300 bg-white opacity-90'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="font-black text-xs text-blue-800 bg-blue-100 px-2 py-0.5 rounded border border-blue-200">
                    TAHAP 0{step.stepNumber}
                  </span>
                  {step.status === 'DONE' && (
                    <span className="inline-flex items-center gap-1 text-[11px] font-black text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-full border border-emerald-300">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Selesai
                    </span>
                  )}
                  {step.status === 'ACTIVE' && (
                    <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-black bg-blue-600 text-white animate-pulse">
                      <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping"></span>
                      Hari Ini
                    </span>
                  )}
                  {step.status === 'UPCOMING' && (
                    <span className="text-[11px] font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">
                      Mendatang
                    </span>
                  )}
                </div>

                <h4 className="font-black text-slate-950 text-sm mt-1">
                  {step.title}
                </h4>
                <p className="text-xs text-slate-700 mt-1 leading-relaxed font-medium">
                  {step.description}
                </p>
              </div>

              <div className="pt-2.5 border-t border-slate-200 text-xs font-bold text-slate-900 space-y-1">
                <div className="text-blue-900 font-extrabold flex items-center gap-1.5">
                  <span>📅</span>
                  <span>{step.dateRange}</span>
                </div>
                {step.location && (
                  <div className="text-slate-600 text-[11px] font-medium truncate flex items-center gap-1">
                    <span>📍</span>
                    <span>{step.location}</span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Candidate Modal */}
      <CandidateModal
        candidate={previewCandidate}
        onClose={() => setPreviewCandidate(null)}
        onSelect={() => {
          onGoToVote();
        }}
      />
    </div>
  );
};
