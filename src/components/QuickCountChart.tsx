import React, { useState, useEffect } from 'react';
import { useVoting } from '../context/VotingContext';
import { Candidate, CandidateCategory } from '../types/voting';
import { PemilosLogo } from './PemilosLogo';
import {
  Lock,
  Eye,
  Award,
  Vote,
  TrendingUp,
  Flame,
  CheckCircle2,
  Users,
  Info,
  Maximize2,
  Minimize2,
  Tv,
  Clock,
  Sparkles,
  Crown,
  ChevronRight,
} from 'lucide-react';

interface QuickCountChartProps {
  onOpenCandidateDetail: (candidate: Candidate) => void;
}

// Color palettes for OSIS candidates
const OSIS_COLOR_PALETTES = [
  {
    name: 'Biru Safir',
    cardBorder: 'border-blue-500',
    cardBorderInactive: 'border-blue-200 hover:border-blue-400',
    cardBg: 'bg-linear-to-br from-blue-50/70 via-white to-sky-50/40',
    cardRing: 'ring-2 ring-blue-400/50',
    badgeBg: 'bg-blue-600',
    badgeText: 'text-white',
    accentText: 'text-blue-700',
    barGradient: 'bg-linear-to-r from-blue-600 via-blue-500 to-cyan-400',
    darkStageBg: 'bg-slate-900/90 border-blue-500/50',
    darkStageRing: 'ring-2 ring-blue-500/60 shadow-lg shadow-blue-500/20',
    darkStageBar: 'bg-linear-to-r from-blue-600 via-blue-400 to-cyan-300',
    darkStageBadge: 'bg-blue-600 text-white',
    darkStageText: 'text-blue-300',
  },
  {
    name: 'Hijau Zamrud',
    cardBorder: 'border-emerald-500',
    cardBorderInactive: 'border-emerald-200 hover:border-emerald-400',
    cardBg: 'bg-linear-to-br from-emerald-50/70 via-white to-teal-50/40',
    cardRing: 'ring-2 ring-emerald-400/50',
    badgeBg: 'bg-emerald-600',
    badgeText: 'text-white',
    accentText: 'text-emerald-700',
    barGradient: 'bg-linear-to-r from-emerald-600 via-emerald-500 to-teal-400',
    darkStageBg: 'bg-slate-900/90 border-emerald-500/50',
    darkStageRing: 'ring-2 ring-emerald-500/60 shadow-lg shadow-emerald-500/20',
    darkStageBar: 'bg-linear-to-r from-emerald-600 via-emerald-400 to-teal-300',
    darkStageBadge: 'bg-emerald-600 text-white',
    darkStageText: 'text-emerald-300',
  },
  {
    name: 'Jingga Surya',
    cardBorder: 'border-orange-500',
    cardBorderInactive: 'border-orange-200 hover:border-orange-400',
    cardBg: 'bg-linear-to-br from-orange-50/70 via-white to-amber-50/40',
    cardRing: 'ring-2 ring-orange-400/50',
    badgeBg: 'bg-orange-600',
    badgeText: 'text-white',
    accentText: 'text-orange-700',
    barGradient: 'bg-linear-to-r from-orange-600 via-amber-500 to-yellow-400',
    darkStageBg: 'bg-slate-900/90 border-orange-500/50',
    darkStageRing: 'ring-2 ring-orange-500/60 shadow-lg shadow-orange-500/20',
    darkStageBar: 'bg-linear-to-r from-orange-600 via-amber-400 to-yellow-300',
    darkStageBadge: 'bg-orange-600 text-white',
    darkStageText: 'text-orange-300',
  },
];

// Color palettes for MPK candidates
const MPK_COLOR_PALETTES = [
  {
    name: 'Ungu Violet',
    cardBorder: 'border-purple-500',
    cardBorderInactive: 'border-purple-200 hover:border-purple-400',
    cardBg: 'bg-linear-to-br from-purple-50/70 via-white to-fuchsia-50/40',
    cardRing: 'ring-2 ring-purple-400/50',
    badgeBg: 'bg-purple-600',
    badgeText: 'text-white',
    accentText: 'text-purple-700',
    barGradient: 'bg-linear-to-r from-purple-600 via-fuchsia-500 to-pink-400',
    darkStageBg: 'bg-slate-900/90 border-purple-500/50',
    darkStageRing: 'ring-2 ring-purple-500/60 shadow-lg shadow-purple-500/20',
    darkStageBar: 'bg-linear-to-r from-purple-600 via-fuchsia-400 to-pink-300',
    darkStageBadge: 'bg-purple-600 text-white',
    darkStageText: 'text-purple-300',
  },
  {
    name: 'Emas Amber',
    cardBorder: 'border-amber-500',
    cardBorderInactive: 'border-amber-200 hover:border-amber-400',
    cardBg: 'bg-linear-to-br from-amber-50/70 via-white to-yellow-50/40',
    cardRing: 'ring-2 ring-amber-400/50',
    badgeBg: 'bg-amber-600',
    badgeText: 'text-white',
    accentText: 'text-amber-700',
    barGradient: 'bg-linear-to-r from-amber-600 via-yellow-500 to-lime-400',
    darkStageBg: 'bg-slate-900/90 border-amber-500/50',
    darkStageRing: 'ring-2 ring-amber-500/60 shadow-lg shadow-amber-500/20',
    darkStageBar: 'bg-linear-to-r from-amber-600 via-yellow-400 to-lime-300',
    darkStageBadge: 'bg-amber-600 text-white',
    darkStageText: 'text-amber-300',
  },
  {
    name: 'Mawar Rose',
    cardBorder: 'border-rose-500',
    cardBorderInactive: 'border-rose-200 hover:border-rose-400',
    cardBg: 'bg-linear-to-br from-rose-50/70 via-white to-pink-50/40',
    cardRing: 'ring-2 ring-rose-400/50',
    badgeBg: 'bg-rose-600',
    badgeText: 'text-white',
    accentText: 'text-rose-700',
    barGradient: 'bg-linear-to-r from-rose-600 via-pink-500 to-red-400',
    darkStageBg: 'bg-slate-900/90 border-rose-500/50',
    darkStageRing: 'ring-2 ring-rose-500/60 shadow-lg shadow-rose-500/20',
    darkStageBar: 'bg-linear-to-r from-rose-600 via-pink-400 to-red-300',
    darkStageBadge: 'bg-rose-600 text-white',
    darkStageText: 'text-rose-300',
  },
];

export const QuickCountChart: React.FC<QuickCountChartProps> = ({
  onOpenCandidateDetail,
}) => {
  const {
    activePeriod,
    osisCandidates,
    mpkCandidates,
    osisVotes,
    mpkVotes,
    activeVoters,
    currentAdmin,
  } = useVoting();

  // View state: 'ALL' (OSIS & MPK Satu Layar), 'OSIS', or 'MPK'
  const [viewFilter, setViewFilter] = useState<'ALL' | 'OSIS' | 'MPK'>('ALL');
  const [adminBypassPreview, setAdminBypassPreview] = useState(false);
  const [isStageOpen, setIsStageOpen] = useState(false);
  const [currentTime, setCurrentTime] = useState<string>('');

  // Live ticking clock for large monitor / proyektor
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(
        now.toLocaleTimeString('id-ID', {
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
        }) + ' WIB'
      );
    };
    updateTime();
    const timer = setInterval(updateTime, 1000);
    return () => clearInterval(timer);
  }, []);

  // Listen for ESC key to exit fullscreen stage
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isStageOpen) {
        setIsStageOpen(false);
        if (document.fullscreenElement && document.exitFullscreen) {
          document.exitFullscreen().catch(() => {});
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isStageOpen]);

  const toggleStageMode = () => {
    if (!isStageOpen) {
      setIsStageOpen(true);
      if (document.documentElement.requestFullscreen) {
        document.documentElement.requestFullscreen().catch(() => {});
      }
    } else {
      setIsStageOpen(false);
      if (document.fullscreenElement && document.exitFullscreen) {
        document.exitFullscreen().catch(() => {});
      }
    }
  };

  const isLocked =
    activePeriod &&
    !activePeriod.isResultPublished &&
    (!currentAdmin || !adminBypassPreview);

  // OSIS Calculations
  const totalOsisVotes = osisVotes.length;
  const osisStats = osisCandidates.map((c, idx) => {
    const votes = osisVotes.filter((v) => v.candidateId === c.id).length;
    const percentage = totalOsisVotes > 0 ? (votes / totalOsisVotes) * 100 : 0;
    return {
      candidate: c,
      votes,
      percentage,
      theme: OSIS_COLOR_PALETTES[idx % OSIS_COLOR_PALETTES.length],
    };
  });
  const maxOsisVotes = Math.max(...osisStats.map((s) => s.votes), 0);

  // MPK Calculations
  const totalMpkVotes = mpkVotes.length;
  const mpkStats = mpkCandidates.map((c, idx) => {
    const votes = mpkVotes.filter((v) => v.candidateId === c.id).length;
    const percentage = totalMpkVotes > 0 ? (votes / totalMpkVotes) * 100 : 0;
    return {
      candidate: c,
      votes,
      percentage,
      theme: MPK_COLOR_PALETTES[idx % MPK_COLOR_PALETTES.length],
    };
  });
  const maxMpkVotes = Math.max(...mpkStats.map((s) => s.votes), 0);

  // Overall DPT turnout
  const totalDpt = activeVoters.length;
  const totalVotedCount = activeVoters.filter((v) => v.hasVoted).length;
  const overallTurnout = totalDpt > 0 ? (totalVotedCount / totalDpt) * 100 : 0;

  // Major turnouts
  const majors = [
    'Teknik Komputer & Jaringan (TKJ)',
    'Akuntansi (AKL)',
    'Otomatisasi Perkantoran (OTKP/MPLB)',
    'Pemasaran/Bisnis Daring (BR)',
  ];

  const majorTurnouts = majors.map((majorName) => {
    const inMajor = activeVoters.filter(
      (v) =>
        v.major === majorName ||
        v.major.toLowerCase().includes(majorName.toLowerCase().slice(0, 10))
    );
    const votedInMajor = inMajor.filter((v) => v.hasVoted).length;
    const totalInMajor = inMajor.length || 1;
    const pct = inMajor.length > 0 ? (votedInMajor / totalInMajor) * 100 : 0;
    return {
      name: majorName,
      voted: votedInMajor,
      total: inMajor.length,
      pct,
    };
  });

  return (
    <>
      {/* ============================================================== */}
      {/* 1. STANDAR IN-PAGE QUICK COUNT (DUAL OSIS & MPK SATU LAYAR)   */}
      {/* ============================================================== */}
      <div className="bg-white rounded-3xl border-2 border-slate-200 shadow-sm overflow-hidden">
        {/* Header with Switcher Tabs & Fullscreen Trigger */}
        <div className="p-5 sm:p-7 border-b-2 border-slate-200 bg-linear-to-r from-slate-50 via-white to-blue-50/60">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping"></span>
                <span className="text-xs sm:text-sm font-extrabold uppercase tracking-wider text-blue-900 bg-blue-100 px-3 py-1 rounded-full border border-blue-300">
                  Real-Time Quick Count
                </span>
                {activePeriod && !activePeriod.isResultPublished && (
                  <span className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-900 bg-amber-100 px-2.5 py-1 rounded-full border border-amber-300">
                    <Lock className="w-3.5 h-3.5" /> Hasil Dikunci
                  </span>
                )}
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-slate-950 mt-2">
                Perolehan Suara Langsung TPS Digital
              </h2>
              <p className="text-xs sm:text-sm text-slate-700 mt-1 font-medium">
                Hasil suara pasangan calon Ketua-Wakil Ketua OSIS dan MPK ditampilkan bersamaan dalam satu layar
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2.5">
              {/* Filter Tabs */}
              <div className="flex bg-slate-200/80 p-1.5 rounded-2xl border border-slate-300">
                <button
                  onClick={() => setViewFilter('ALL')}
                  className={`px-3.5 sm:px-4 py-2 rounded-xl text-xs sm:text-sm font-extrabold transition-all cursor-pointer ${
                    viewFilter === 'ALL'
                      ? 'bg-blue-600 text-white shadow-md'
                      : 'text-slate-700 hover:text-slate-950'
                  }`}
                >
                  Satu Layar (OSIS & MPK)
                </button>
                <button
                  onClick={() => setViewFilter('OSIS')}
                  className={`px-3 sm:px-4 py-2 rounded-xl text-xs sm:text-sm font-extrabold transition-all cursor-pointer ${
                    viewFilter === 'OSIS'
                      ? 'bg-blue-600 text-white shadow-md'
                      : 'text-slate-700 hover:text-slate-950'
                  }`}
                >
                  Hanya OSIS
                </button>
                <button
                  onClick={() => setViewFilter('MPK')}
                  className={`px-3 sm:px-4 py-2 rounded-xl text-xs sm:text-sm font-extrabold transition-all cursor-pointer ${
                    viewFilter === 'MPK'
                      ? 'bg-indigo-600 text-white shadow-md'
                      : 'text-slate-700 hover:text-slate-950'
                  }`}
                >
                  Hanya MPK
                </button>
              </div>

              {/* Fullscreen Big Monitor Trigger */}
              <button
                type="button"
                onClick={toggleStageMode}
                className="px-4 py-2.5 bg-slate-950 hover:bg-slate-900 text-amber-300 hover:text-amber-200 rounded-2xl text-xs sm:text-sm font-black transition-all flex items-center gap-2 shadow-md border-2 border-amber-400/40 cursor-pointer"
                title="Buka tampilan layar penuh untuk proyektor aula atau TV monitor besar"
              >
                <Tv className="w-4 h-4 text-amber-400" />
                <span>Layar Penuh Proyektor</span>
                <Maximize2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-5 sm:p-7">
          {isLocked ? (
            /* Locked View */
            <div className="py-14 px-6 text-center max-w-xl mx-auto space-y-4">
              <div className="w-16 h-16 rounded-2xl bg-amber-100 text-amber-800 flex items-center justify-center mx-auto border-2 border-amber-300 shadow-inner">
                <Lock className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-black text-slate-950">
                Hasil Quick Count Sedang Disembunyikan (Freeze Mode)
              </h3>
              <p className="text-sm text-slate-700 leading-relaxed font-medium">
                Sesuai ketetapan Kesiswaan dan Panitia KPU OSIS SMKS PGRI 1 Sukabumi,
                grafik perolehan suara disembunyikan sementara hingga proses pemungutan suara resmi
                ditutup pukul 15.00 WIB guna menjaga ketenangan dan sportivitas pemilihan.
              </p>
              <div className="p-4 bg-slate-100 rounded-2xl border border-slate-300 text-sm text-slate-800 font-semibold">
                <span>Total Suara Masuk Saat Ini: </span>
                <strong className="text-blue-700 font-extrabold text-base">
                  {totalOsisVotes} Suara Sah (OSIS) • {totalMpkVotes} Suara Sah (MPK)
                </strong>
              </div>

              {currentAdmin && (
                <div className="pt-2">
                  <button
                    onClick={() => setAdminBypassPreview(true)}
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold bg-slate-900 text-white hover:bg-slate-800 transition-colors shadow-sm cursor-pointer"
                  >
                    <Eye className="w-4 h-4" />
                    Pratinjau Khusus Admin (Bypass)
                  </button>
                </div>
              )}
            </div>
          ) : (
            /* Live Quick Count (OSIS & MPK) */
            <div className="space-y-8">
              {/* Summary Strip */}
              <div className="flex flex-wrap items-center justify-between gap-3 text-xs sm:text-sm bg-slate-100/90 p-4 rounded-2xl border border-slate-300">
                <div className="flex flex-wrap items-center gap-4">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-800">Total Suara OSIS:</span>
                    <span className="font-extrabold text-blue-900 bg-blue-100 px-3 py-1 rounded-lg border border-blue-300 text-sm">
                      {totalOsisVotes} Suara Sah
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-800">Total Suara MPK:</span>
                    <span className="font-extrabold text-indigo-900 bg-indigo-100 px-3 py-1 rounded-lg border border-indigo-300 text-sm">
                      {totalMpkVotes} Suara Sah
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-800 bg-emerald-100 px-2.5 py-1 rounded-lg border border-emerald-300">
                    <span className="w-2 h-2 rounded-full bg-emerald-600 animate-pulse"></span>
                    <span>Live Sinkronisasi</span>
                  </div>
                </div>
              </div>

              {/* Main Dual Grid: OSIS (Left) & MPK (Right) */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* 1. OSIS Column */}
                {(viewFilter === 'ALL' || viewFilter === 'OSIS') && (
                  <div className={`space-y-4 ${viewFilter === 'OSIS' ? 'lg:col-span-2' : ''}`}>
                    <div className="flex items-center justify-between border-b-2 border-blue-200 pb-3">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center font-black">
                          <Vote className="w-4 h-4" />
                        </div>
                        <div>
                          <h3 className="text-base sm:text-lg font-black text-slate-950 uppercase">
                            Pasangan Calon Ketua & Wakil Ketua OSIS
                          </h3>
                          <p className="text-xs text-blue-700 font-bold">
                            Total {totalOsisVotes} Suara Sah Masuk
                          </p>
                        </div>
                      </div>
                      <span className="text-xs font-black bg-blue-100 text-blue-900 px-2.5 py-1 rounded-lg border border-blue-300">
                        {osisCandidates.length} Paslon
                      </span>
                    </div>

                    {/* OSIS Candidates Cards */}
                    <div className="space-y-4">
                      {osisStats.map(({ candidate, votes, percentage, theme }) => {
                        const isLeader = maxOsisVotes > 0 && votes === maxOsisVotes;

                        return (
                          <div
                            key={candidate.id}
                            className={`rounded-2xl border-2 p-5 transition-all relative overflow-hidden ${
                              isLeader
                                ? `${theme.cardBorder} ${theme.cardBg} ${theme.cardRing} shadow-md`
                                : `${theme.cardBorderInactive} bg-white shadow-xs`
                            }`}
                          >
                            {/* Leader Ribbon */}
                            {isLeader && (
                              <div className="absolute top-0 right-0 bg-blue-700 text-white text-[11px] font-black px-3 py-1 rounded-bl-xl shadow-xs flex items-center gap-1.5 tracking-wide">
                                <Flame className="w-3.5 h-3.5 text-amber-300 fill-amber-300" />
                                MEMIMPIN SEMENTARA
                              </div>
                            )}

                            <div className="flex items-start gap-4">
                              {/* Ballot Number */}
                              <div
                                className={`w-11 h-11 rounded-xl ${theme.badgeBg} ${theme.badgeText} font-black text-base flex items-center justify-center shrink-0 shadow-sm`}
                              >
                                0{candidate.ballotNumber}
                              </div>

                              {/* Candidate Photo */}
                              <img
                                src={candidate.photoUrl}
                                alt={candidate.chairmanName}
                                className="w-20 h-24 object-cover rounded-xl shadow-xs border-2 border-slate-200 shrink-0 bg-slate-100"
                              />

                              {/* Details */}
                              <div className="flex-1 min-w-0 pr-4">
                                <span className={`text-xs font-black uppercase tracking-wider ${theme.accentText}`}>
                                  Paslon Nomor 0{candidate.ballotNumber}
                                </span>
                                <h4 className="text-sm sm:text-base font-black text-slate-950 truncate" title={candidate.chairmanName}>
                                  {candidate.chairmanName}
                                </h4>
                                <p className="text-xs font-bold text-slate-700 truncate">
                                  {candidate.chairmanClass} (Ketua)
                                </p>
                                <p className="text-xs sm:text-sm text-slate-900 font-bold truncate mt-1" title={candidate.viceChairmanName}>
                                  & {candidate.viceChairmanName}
                                </p>
                                <p className="text-xs font-bold text-slate-700 truncate">
                                  {candidate.viceChairmanClass} (Wakil)
                                </p>
                              </div>
                            </div>

                            {/* Slogan */}
                            {candidate.slogan && (
                              <p className="text-xs italic font-medium text-slate-700 mt-3 line-clamp-1 bg-slate-100/90 px-3 py-1.5 rounded-lg border border-slate-200">
                                "{candidate.slogan}"
                              </p>
                            )}

                            {/* Color Progress Bar & Percentage */}
                            <div className="mt-4 pt-3 border-t border-slate-200">
                              <div className="flex items-baseline justify-between mb-1.5">
                                <div className="flex items-baseline gap-1.5">
                                  <span className="text-2xl sm:text-3xl font-black text-slate-950">
                                    {percentage.toFixed(1)}%
                                  </span>
                                  <span className="text-xs font-bold text-slate-500">suara</span>
                                </div>
                                <span className="text-xs sm:text-sm font-black text-slate-900 bg-slate-100 px-3 py-1 rounded-lg border border-slate-300">
                                  {votes} Suara
                                </span>
                              </div>

                              {/* Vibrant Color Gradient Bar */}
                              <div className="w-full bg-slate-200 rounded-full h-4 overflow-hidden p-0.5 border border-slate-300">
                                <div
                                  className={`h-full rounded-full transition-all duration-700 ${theme.barGradient}`}
                                  style={{ width: `${percentage}%` }}
                                ></div>
                              </div>

                              <div className="mt-2.5 flex justify-end">
                                <button
                                  type="button"
                                  onClick={() => onOpenCandidateDetail(candidate)}
                                  className="text-xs font-bold text-blue-700 hover:text-blue-900 transition-colors cursor-pointer flex items-center gap-1"
                                >
                                  <span>Lihat Visi & Misi</span>
                                  <ChevronRight className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* 2. MPK Column */}
                {(viewFilter === 'ALL' || viewFilter === 'MPK') && (
                  <div className={`space-y-4 ${viewFilter === 'MPK' ? 'lg:col-span-2' : ''}`}>
                    <div className="flex items-center justify-between border-b-2 border-purple-200 pb-3">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-lg bg-purple-600 text-white flex items-center justify-center font-black">
                          <Award className="w-4 h-4" />
                        </div>
                        <div>
                          <h3 className="text-base sm:text-lg font-black text-slate-950 uppercase">
                            Pasangan Calon Ketua & Wakil Ketua MPK
                          </h3>
                          <p className="text-xs text-purple-700 font-bold">
                            Total {totalMpkVotes} Suara Sah Masuk
                          </p>
                        </div>
                      </div>
                      <span className="text-xs font-black bg-purple-100 text-purple-900 px-2.5 py-1 rounded-lg border border-purple-300">
                        {mpkCandidates.length} Paslon
                      </span>
                    </div>

                    {/* MPK Candidates Cards */}
                    <div className="space-y-4">
                      {mpkStats.map(({ candidate, votes, percentage, theme }) => {
                        const isLeader = maxMpkVotes > 0 && votes === maxMpkVotes;

                        return (
                          <div
                            key={candidate.id}
                            className={`rounded-2xl border-2 p-5 transition-all relative overflow-hidden ${
                              isLeader
                                ? `${theme.cardBorder} ${theme.cardBg} ${theme.cardRing} shadow-md`
                                : `${theme.cardBorderInactive} bg-white shadow-xs`
                            }`}
                          >
                            {/* Leader Ribbon */}
                            {isLeader && (
                              <div className="absolute top-0 right-0 bg-purple-700 text-white text-[11px] font-black px-3 py-1 rounded-bl-xl shadow-xs flex items-center gap-1.5 tracking-wide">
                                <Flame className="w-3.5 h-3.5 text-amber-300 fill-amber-300" />
                                MEMIMPIN SEMENTARA
                              </div>
                            )}

                            <div className="flex items-start gap-4">
                              {/* Ballot Number */}
                              <div
                                className={`w-11 h-11 rounded-xl ${theme.badgeBg} ${theme.badgeText} font-black text-base flex items-center justify-center shrink-0 shadow-sm`}
                              >
                                0{candidate.ballotNumber}
                              </div>

                              {/* Candidate Photo */}
                              <img
                                src={candidate.photoUrl}
                                alt={candidate.chairmanName}
                                className="w-20 h-24 object-cover rounded-xl shadow-xs border-2 border-slate-200 shrink-0 bg-slate-100"
                              />

                              {/* Details */}
                              <div className="flex-1 min-w-0 pr-4">
                                <span className={`text-xs font-black uppercase tracking-wider ${theme.accentText}`}>
                                  Paslon Nomor 0{candidate.ballotNumber}
                                </span>
                                <h4 className="text-sm sm:text-base font-black text-slate-950 truncate" title={candidate.chairmanName}>
                                  {candidate.chairmanName}
                                </h4>
                                <p className="text-xs font-bold text-slate-700 truncate">
                                  {candidate.chairmanClass} (Ketua)
                                </p>
                                <p className="text-xs sm:text-sm text-slate-900 font-bold truncate mt-1" title={candidate.viceChairmanName}>
                                  & {candidate.viceChairmanName}
                                </p>
                                <p className="text-xs font-bold text-slate-700 truncate">
                                  {candidate.viceChairmanClass} (Wakil)
                                </p>
                              </div>
                            </div>

                            {/* Slogan */}
                            {candidate.slogan && (
                              <p className="text-xs italic font-medium text-slate-700 mt-3 line-clamp-1 bg-slate-100/90 px-3 py-1.5 rounded-lg border border-slate-200">
                                "{candidate.slogan}"
                              </p>
                            )}

                            {/* Color Progress Bar & Percentage */}
                            <div className="mt-4 pt-3 border-t border-slate-200">
                              <div className="flex items-baseline justify-between mb-1.5">
                                <div className="flex items-baseline gap-1.5">
                                  <span className="text-2xl sm:text-3xl font-black text-slate-950">
                                    {percentage.toFixed(1)}%
                                  </span>
                                  <span className="text-xs font-bold text-slate-500">suara</span>
                                </div>
                                <span className="text-xs sm:text-sm font-black text-slate-900 bg-slate-100 px-3 py-1 rounded-lg border border-slate-300">
                                  {votes} Suara
                                </span>
                              </div>

                              {/* Vibrant Color Gradient Bar */}
                              <div className="w-full bg-slate-200 rounded-full h-4 overflow-hidden p-0.5 border border-slate-300">
                                <div
                                  className={`h-full rounded-full transition-all duration-700 ${theme.barGradient}`}
                                  style={{ width: `${percentage}%` }}
                                ></div>
                              </div>

                              <div className="mt-2.5 flex justify-end">
                                <button
                                  type="button"
                                  onClick={() => onOpenCandidateDetail(candidate)}
                                  className="text-xs font-bold text-purple-700 hover:text-purple-900 transition-colors cursor-pointer flex items-center gap-1"
                                >
                                  <span>Lihat Visi & Misi</span>
                                  <ChevronRight className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Turnout per Major / Jurusan Breakdown */}
          <div className="mt-10 pt-8 border-t-2 border-slate-200">
            <div className="flex items-center justify-between mb-5">
              <div>
                <h3 className="text-base sm:text-lg font-black text-slate-950 flex items-center gap-2">
                  <Users className="w-5 h-5 text-blue-700" />
                  Partisipasi Hak Pilih per Kompetensi Keahlian (Jurusan)
                </h3>
                <p className="text-xs sm:text-sm text-slate-700 font-medium">
                  Pemantauan tingkat kehadiran siswa di bilik suara digital per program jurusan
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
              {majorTurnouts.map((m, idx) => (
                <div
                  key={idx}
                  className="p-3.5 sm:p-4 rounded-2xl bg-slate-50 border-2 border-slate-200 text-xs sm:text-sm"
                >
                  <div className="flex justify-between items-center mb-1.5">
                    <span className="font-extrabold text-slate-900 truncate" title={m.name}>
                      {m.name}
                    </span>
                    <span className="font-black text-blue-800 ml-2 text-sm sm:text-base">
                      {m.pct.toFixed(0)}%
                    </span>
                  </div>
                  <div className="w-full bg-slate-200 rounded-full h-2.5 overflow-hidden">
                    <div
                      className="bg-blue-600 h-2.5 rounded-full transition-all duration-500"
                      style={{ width: `${m.pct}%` }}
                    ></div>
                  </div>
                  <div className="flex justify-between text-xs font-semibold text-slate-700 mt-2">
                    <span>{m.voted} Memilih</span>
                    <span>Total {m.total} Siswa</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ============================================================== */}
      {/* 2. FULLSCREEN LIVE STAGE MODE (MONITOR BESAR / PROYEKTOR AULA) */}
      {/* ============================================================== */}
      {isStageOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950 text-white flex flex-col overflow-y-auto font-sans">
          {/* Top Stage Bar */}
          <header className="bg-slate-900/90 border-b-2 border-slate-800 px-6 py-4 backdrop-blur-md sticky top-0 z-20">
            <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
              {/* Left School Brand */}
              <div className="flex items-center gap-3.5">
                <div className="w-14 h-14 rounded-2xl bg-white p-1.5 flex items-center justify-center shadow-lg border-2 border-slate-700 shrink-0">
                  <PemilosLogo className="w-11 h-11 drop-shadow-md" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="inline-flex items-center gap-1.5 text-xs font-black text-emerald-300 bg-emerald-950/80 px-2.5 py-0.5 rounded-full border border-emerald-500/50">
                      <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
                      LIVE QUICK COUNT
                    </span>
                    <span className="text-xs text-slate-400 font-mono flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-amber-400" />
                      {currentTime}
                    </span>
                  </div>
                  <h1 className="text-lg sm:text-xl font-black text-white tracking-wide mt-0.5">
                    SMKS PGRI 1 KOTA SUKABUMI
                  </h1>
                </div>
              </div>

              {/* Center Metrics Pill */}
              <div className="flex flex-wrap items-center justify-center gap-3 text-xs sm:text-sm">
                <div className="bg-slate-800/90 px-4 py-2 rounded-xl border border-slate-700 flex items-center gap-2">
                  <span className="text-slate-400">Total DPT:</span>
                  <span className="font-mono font-black text-white text-base">{totalDpt}</span>
                </div>
                <div className="bg-blue-950/80 px-4 py-2 rounded-xl border border-blue-600/50 flex items-center gap-2">
                  <span className="text-blue-300">Suara Masuk:</span>
                  <span className="font-mono font-black text-amber-300 text-base">{totalVotedCount} Suara</span>
                </div>
                <div className="bg-emerald-950/80 px-4 py-2 rounded-xl border border-emerald-600/50 flex items-center gap-2">
                  <span className="text-emerald-300">Partisipasi:</span>
                  <span className="font-mono font-black text-emerald-300 text-base">{overallTurnout.toFixed(1)}%</span>
                </div>
              </div>

              {/* Right Exit Button */}
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={toggleStageMode}
                  className="px-4 py-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs sm:text-sm font-black transition-all flex items-center gap-2 shadow-lg shadow-rose-600/30 cursor-pointer"
                >
                  <Minimize2 className="w-4 h-4" />
                  <span>Tutup Layar Penuh</span>
                  <span className="text-[10px] bg-rose-950/50 px-1.5 py-0.5 rounded font-mono">(Esc)</span>
                </button>
              </div>
            </div>
          </header>

          {/* Main Stage Arena: OSIS (Left) & MPK (Right) */}
          <main className="flex-1 max-w-7xl mx-auto w-full p-4 sm:p-6 lg:p-8 space-y-6">
            <div className="text-center space-y-1 mb-4">
              <span className="text-xs font-black uppercase tracking-widest text-amber-300 bg-amber-950/80 px-3.5 py-1 rounded-full border border-amber-500/40 inline-block">
                PAPAN REKAPITULASI RESMI AUDITORIUM / PROYEKTOR AULA
              </span>
              <h2 className="text-2xl sm:text-3xl font-black text-white">
                HASIL SUARA SEMENTARA PEMILIHAN KETUA & WAKIL KETUA OSIS - MPK
              </h2>
              <p className="text-xs sm:text-sm text-slate-400">
                Masa Bakti {activePeriod?.academicYear || '2026/2027'} • Berasaskan Langsung, Umum, Bebas, Rahasia, Jujur, dan Adil
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
              {/* OSIS ARENA */}
              <div className="bg-slate-900/80 rounded-3xl border-2 border-blue-500/40 p-5 sm:p-6 flex flex-col justify-between shadow-2xl backdrop-blur-sm">
                <div>
                  <div className="flex items-center justify-between border-b border-blue-500/30 pb-3 mb-5">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center font-black text-white shadow-md">
                        <Vote className="w-6 h-6" />
                      </div>
                      <div>
                        <h3 className="text-lg sm:text-xl font-black text-blue-300 uppercase tracking-wide">
                          HASIL SUARA OSIS
                        </h3>
                        <p className="text-xs text-slate-400 font-semibold">
                          Total Suara Masuk: <strong className="text-white font-mono">{totalOsisVotes} Suara Sah</strong>
                        </p>
                      </div>
                    </div>
                    <span className="text-xs font-black text-blue-300 bg-blue-950 px-3 py-1 rounded-lg border border-blue-600/40">
                      {osisCandidates.length} Paslon
                    </span>
                  </div>

                  {/* Candidate List */}
                  <div className="space-y-5">
                    {osisStats.map(({ candidate, votes, percentage, theme }) => {
                      const isLeader = maxOsisVotes > 0 && votes === maxOsisVotes;

                      return (
                        <div
                          key={candidate.id}
                          className={`rounded-2xl border-2 p-5 transition-all relative overflow-hidden ${
                            isLeader
                              ? `${theme.darkStageBg} ${theme.darkStageRing}`
                              : 'bg-slate-950/70 border-slate-800'
                          }`}
                        >
                          {/* Leader Flame */}
                          {isLeader && (
                            <div className="absolute top-0 right-0 bg-blue-600 text-white text-xs font-black px-3.5 py-1 rounded-bl-xl shadow-md flex items-center gap-1.5 tracking-wider">
                              <Crown className="w-4 h-4 text-amber-300 fill-amber-300" />
                              <span>UNGGUL SEMENTARA</span>
                            </div>
                          )}

                          <div className="flex items-start gap-4">
                            {/* Big Number */}
                            <div
                              className={`w-14 h-14 rounded-2xl ${theme.darkStageBadge} font-black text-xl flex items-center justify-center shrink-0 shadow-lg`}
                            >
                              0{candidate.ballotNumber}
                            </div>

                            {/* Large Photo */}
                            <img
                              src={candidate.photoUrl}
                              alt={candidate.chairmanName}
                              className="w-20 sm:w-24 h-28 sm:h-32 object-cover rounded-2xl shadow-md border-2 border-slate-700 shrink-0 bg-slate-900"
                            />

                            {/* Details */}
                            <div className="flex-1 min-w-0 pr-4">
                              <span className="text-xs font-black text-blue-400 uppercase tracking-wider block mb-0.5">
                                Pasangan Calon 0{candidate.ballotNumber}
                              </span>
                              <h4 className="text-base sm:text-lg font-black text-white truncate" title={candidate.chairmanName}>
                                {candidate.chairmanName}
                              </h4>
                              <p className="text-xs text-blue-200 font-bold truncate">
                                {candidate.chairmanClass} (Calon Ketua)
                              </p>
                              <h5 className="text-sm sm:text-base font-black text-slate-200 truncate mt-1.5" title={candidate.viceChairmanName}>
                                & {candidate.viceChairmanName}
                              </h5>
                              <p className="text-xs text-slate-400 font-bold truncate">
                                {candidate.viceChairmanClass} (Calon Wakil)
                              </p>
                            </div>
                          </div>

                          {/* Giant Percentage & Bar */}
                          <div className="mt-4 pt-3 border-t border-slate-800">
                            <div className="flex items-baseline justify-between mb-2">
                              <div className="flex items-baseline gap-2">
                                <span className="text-3xl sm:text-4xl font-black text-white tracking-tight">
                                  {percentage.toFixed(1)}%
                                </span>
                                <span className="text-xs text-slate-400 font-bold uppercase tracking-wider">
                                  Perolehan Suara
                                </span>
                              </div>
                              <span className="text-sm sm:text-base font-mono font-black text-amber-300 bg-slate-900 px-3.5 py-1 rounded-xl border border-slate-700">
                                {votes} Suara
                              </span>
                            </div>

                            {/* Giant Animated Colored Bar */}
                            <div className="w-full bg-slate-950 rounded-full h-5 overflow-hidden p-0.5 border border-slate-800">
                              <div
                                className={`h-full rounded-full transition-all duration-700 shadow-md ${theme.darkStageBar}`}
                                style={{ width: `${percentage}%` }}
                              ></div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* MPK ARENA */}
              <div className="bg-slate-900/80 rounded-3xl border-2 border-purple-500/40 p-5 sm:p-6 flex flex-col justify-between shadow-2xl backdrop-blur-sm">
                <div>
                  <div className="flex items-center justify-between border-b border-purple-500/30 pb-3 mb-5">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-purple-600 flex items-center justify-center font-black text-white shadow-md">
                        <Award className="w-6 h-6" />
                      </div>
                      <div>
                        <h3 className="text-lg sm:text-xl font-black text-purple-300 uppercase tracking-wide">
                          HASIL SUARA MPK
                        </h3>
                        <p className="text-xs text-slate-400 font-semibold">
                          Total Suara Masuk: <strong className="text-white font-mono">{totalMpkVotes} Suara Sah</strong>
                        </p>
                      </div>
                    </div>
                    <span className="text-xs font-black text-purple-300 bg-purple-950 px-3 py-1 rounded-lg border border-purple-600/40">
                      {mpkCandidates.length} Paslon
                    </span>
                  </div>

                  {/* Candidate List */}
                  <div className="space-y-5">
                    {mpkStats.map(({ candidate, votes, percentage, theme }) => {
                      const isLeader = maxMpkVotes > 0 && votes === maxMpkVotes;

                      return (
                        <div
                          key={candidate.id}
                          className={`rounded-2xl border-2 p-5 transition-all relative overflow-hidden ${
                            isLeader
                              ? `${theme.darkStageBg} ${theme.darkStageRing}`
                              : 'bg-slate-950/70 border-slate-800'
                          }`}
                        >
                          {/* Leader Flame */}
                          {isLeader && (
                            <div className="absolute top-0 right-0 bg-purple-600 text-white text-xs font-black px-3.5 py-1 rounded-bl-xl shadow-md flex items-center gap-1.5 tracking-wider">
                              <Crown className="w-4 h-4 text-amber-300 fill-amber-300" />
                              <span>UNGGUL SEMENTARA</span>
                            </div>
                          )}

                          <div className="flex items-start gap-4">
                            {/* Big Number */}
                            <div
                              className={`w-14 h-14 rounded-2xl ${theme.darkStageBadge} font-black text-xl flex items-center justify-center shrink-0 shadow-lg`}
                            >
                              0{candidate.ballotNumber}
                            </div>

                            {/* Large Photo */}
                            <img
                              src={candidate.photoUrl}
                              alt={candidate.chairmanName}
                              className="w-20 sm:w-24 h-28 sm:h-32 object-cover rounded-2xl shadow-md border-2 border-slate-700 shrink-0 bg-slate-900"
                            />

                            {/* Details */}
                            <div className="flex-1 min-w-0 pr-4">
                              <span className="text-xs font-black text-purple-400 uppercase tracking-wider block mb-0.5">
                                Pasangan Calon 0{candidate.ballotNumber}
                              </span>
                              <h4 className="text-base sm:text-lg font-black text-white truncate" title={candidate.chairmanName}>
                                {candidate.chairmanName}
                              </h4>
                              <p className="text-xs text-purple-200 font-bold truncate">
                                {candidate.chairmanClass} (Calon Ketua)
                              </p>
                              <h5 className="text-sm sm:text-base font-black text-slate-200 truncate mt-1.5" title={candidate.viceChairmanName}>
                                & {candidate.viceChairmanName}
                              </h5>
                              <p className="text-xs text-slate-400 font-bold truncate">
                                {candidate.viceChairmanClass} (Calon Wakil)
                              </p>
                            </div>
                          </div>

                          {/* Giant Percentage & Bar */}
                          <div className="mt-4 pt-3 border-t border-slate-800">
                            <div className="flex items-baseline justify-between mb-2">
                              <div className="flex items-baseline gap-2">
                                <span className="text-3xl sm:text-4xl font-black text-white tracking-tight">
                                  {percentage.toFixed(1)}%
                                </span>
                                <span className="text-xs text-slate-400 font-bold uppercase tracking-wider">
                                  Perolehan Suara
                                </span>
                              </div>
                              <span className="text-sm sm:text-base font-mono font-black text-amber-300 bg-slate-900 px-3.5 py-1 rounded-xl border border-slate-700">
                                {votes} Suara
                              </span>
                            </div>

                            {/* Giant Animated Colored Bar */}
                            <div className="w-full bg-slate-950 rounded-full h-5 overflow-hidden p-0.5 border border-slate-800">
                              <div
                                className={`h-full rounded-full transition-all duration-700 shadow-md ${theme.darkStageBar}`}
                                style={{ width: `${percentage}%` }}
                              ></div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          </main>

          {/* Footer Ticker */}
          <footer className="bg-slate-900/80 border-t border-slate-800 px-6 py-3 text-center text-xs text-slate-400">
            <p>
              SMKS PGRI 1 KOTA SUKABUMI • Sistem Pemilihan Umum OSIS & MPK Digital • Asas LUBER JURDIL
            </p>
          </footer>
        </div>
      )}
    </>
  );
};
