import React, { useState } from 'react';
import { useVoting } from '../context/VotingContext';
import { PemilosLogo } from './PemilosLogo';
import {
  Vote,
  ShieldCheck,
  UserCheck,
  LogOut,
  HelpCircle,
  BarChart3,
  Sliders,
  ChevronDown,
  Sparkles,
  AlertTriangle,
  Play,
  Pause,
  Cloud,
  CloudOff,
  User,
  CheckCircle2,
} from 'lucide-react';

interface NavbarProps {
  currentView: 'home' | 'vote' | 'guide' | 'admin';
  setCurrentView: (view: 'home' | 'vote' | 'guide' | 'admin') => void;
  onOpenGuide: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentView,
  setCurrentView,
  onOpenGuide,
}) => {
  const {
    activePeriod,
    currentSession,
    logoutVoter,
    currentAdmin,
    logoutAdmin,
    activeVoters,
    loginVoter,
    isSimulating,
    toggleSimulation,
    isFirebaseEnabled,
    isFirebaseConnected,
  } = useVoting();

  const [showDemoMenu, setShowDemoMenu] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Unvoted sample students for instant test
  const demoUnvotedStudents = activeVoters.filter((v) => !v.hasVoted).slice(0, 3);
  const demoVotedStudent = activeVoters.find((v) => v.hasVoted);

  const handleQuickLogin = (nisn: string, pin: string) => {
    loginVoter(nisn, pin);
    setCurrentView('vote');
    setShowDemoMenu(false);
  };

  const getStatusBox = () => {
    if (!activePeriod) return null;
    switch (activePeriod.status) {
      case 'OPEN':
        return (
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-2xl border-2 bg-emerald-50/90 text-emerald-950 border-emerald-300 shadow-2xs text-left">
            <div className="w-7 h-7 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-2xs">
              <span className="w-2 h-2 rounded-full bg-white animate-pulse"></span>
            </div>
            <div className="leading-tight">
              <span className="block text-[9px] font-black uppercase tracking-wider text-emerald-700">
                Status TPS
              </span>
              <span className="block text-xs font-black tracking-tight text-emerald-950 whitespace-nowrap">
                Bilik Suara Buka
              </span>
            </div>
          </div>
        );
      case 'PAUSED':
        return (
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-2xl border-2 bg-amber-50/90 text-amber-950 border-amber-300 shadow-2xs text-left">
            <div className="w-7 h-7 rounded-xl bg-amber-500 text-white flex items-center justify-center shrink-0 shadow-2xs">
              <Pause className="w-3.5 h-3.5" />
            </div>
            <div className="leading-tight">
              <span className="block text-[9px] font-black uppercase tracking-wider text-amber-700">
                Status TPS
              </span>
              <span className="block text-xs font-black tracking-tight text-amber-950 whitespace-nowrap">
                TPS Dijeda
              </span>
            </div>
          </div>
        );
      case 'CLOSED':
        return (
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-2xl border-2 bg-rose-50/90 text-rose-950 border-rose-300 shadow-2xs text-left">
            <div className="w-7 h-7 rounded-xl bg-rose-600 text-white flex items-center justify-center shrink-0 shadow-2xs">
              <AlertTriangle className="w-3.5 h-3.5" />
            </div>
            <div className="leading-tight">
              <span className="block text-[9px] font-black uppercase tracking-wider text-rose-700">
                Status TPS
              </span>
              <span className="block text-xs font-black tracking-tight text-rose-950 whitespace-nowrap">
                TPS Ditutup
              </span>
            </div>
          </div>
        );
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-300 shadow-xs">
      {/* Top institutional sub-bar with crisp readable contrast */}
      <div className="bg-slate-900 text-white text-xs py-1.5 px-4 sm:px-8 flex justify-between items-center">
        <div className="flex items-center gap-2 sm:gap-3">
          <span className="font-extrabold text-amber-300 tracking-wide text-xs sm:text-sm">
            SMKS PGRI 1 KOTA SUKABUMI
          </span>
          <span className="hidden sm:inline text-slate-500">•</span>
          <span className="hidden sm:inline text-slate-200 font-medium">
            Komisi Pemilihan Umum Kesiswaan (KPU OSIS & MPK)
          </span>
        </div>
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Firebase Cloud Sync Status Badge (Read-Only) */}
          <div
            className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md text-[11px] font-black border select-none ${
              isFirebaseEnabled
                ? 'bg-emerald-950 text-emerald-300 border-emerald-500/80'
                : 'bg-amber-950 text-amber-300 border-amber-500/80'
            }`}
          >
            {isFirebaseEnabled ? (
              <>
                <span className={`w-1.5 h-1.5 rounded-full ${isFirebaseConnected ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'}`}></span>
                <Cloud className="w-3 h-3 text-emerald-400" />
                <span>Cloud Firestore: ON</span>
              </>
            ) : (
              <>
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400"></span>
                <CloudOff className="w-3 h-3 text-amber-400" />
                <span>Mode Uji Coba: OFF</span>
              </>
            )}
          </div>

          <span className="hidden md:inline text-slate-300 font-medium">Tahun Ajaran:</span>
          <span className="font-bold text-white bg-blue-700 px-2.5 py-0.5 rounded-md text-xs border border-blue-500 shadow-2xs">
            {activePeriod?.academicYear || '2026/2027'}
          </span>
        </div>
      </div>

      {/* Main Navbar */}
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between min-h-[5.25rem] py-2.5 gap-2 lg:gap-3">
          {/* Brand Logo & Name */}
          <div
            onClick={() => setCurrentView('home')}
            className="flex items-center gap-3 cursor-pointer group shrink-0"
          >
            {/* Official PEMILOS Crest */}
            <div className="w-12 h-12 rounded-2xl bg-white p-1 flex items-center justify-center shadow-md border-2 border-slate-200 group-hover:scale-105 group-hover:border-blue-400 transition-all shrink-0">
              <PemilosLogo className="w-10 h-10 drop-shadow-xs" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-black text-lg sm:text-xl text-slate-950 tracking-tight leading-none group-hover:text-blue-700 transition-colors">
                  E-VOTING PGRI 1
                </span>
                <span className="bg-blue-100 text-blue-900 text-[10px] sm:text-[11px] font-black px-2 py-0.5 rounded-md uppercase tracking-wider border border-blue-300">
                  OSIS & MPK
                </span>
              </div>
              <p className="text-xs text-slate-700 font-medium leading-tight mt-1">
                SMKS PGRI 1 Kota Sukabumi • Demokrasi LUBER JURDIL
              </p>
            </div>
          </div>

          {/* Desktop Navigation Row: Professional & Modern Distinct Colored Boxes */}
          <nav className="hidden lg:flex items-center gap-2 xl:gap-2.5">
            {/* 1. Quick Count & Beranda (Royal Blue Box) */}
            <button
              type="button"
              onClick={() => setCurrentView('home')}
              className={`flex items-center gap-2.5 px-3 py-2 rounded-2xl border-2 transition-all cursor-pointer text-left ${
                currentView === 'home'
                  ? 'bg-blue-600 text-white border-blue-700 shadow-md shadow-blue-500/25 ring-2 ring-blue-300'
                  : 'bg-blue-50/90 hover:bg-blue-100/90 text-blue-950 border-blue-200/90 hover:border-blue-400 shadow-2xs'
              }`}
            >
              <div
                className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 transition-colors ${
                  currentView === 'home' ? 'bg-white/20 text-white' : 'bg-blue-600 text-white'
                }`}
              >
                <BarChart3 className="w-4 h-4" />
              </div>
              <div className="leading-tight">
                <span
                  className={`block text-[9px] font-black uppercase tracking-wider ${
                    currentView === 'home' ? 'text-blue-100' : 'text-blue-700'
                  }`}
                >
                  Hasil Pemilu
                </span>
                <span className="block text-xs font-black tracking-tight whitespace-nowrap">
                  Quick Count & Beranda
                </span>
              </div>
            </button>

            {/* 2. Bilik Suara Siswa (Emerald Green Box) */}
            <button
              type="button"
              onClick={() => setCurrentView('vote')}
              className={`flex items-center gap-2.5 px-3 py-2 rounded-2xl border-2 transition-all cursor-pointer text-left ${
                currentView === 'vote'
                  ? 'bg-emerald-600 text-white border-emerald-700 shadow-md shadow-emerald-500/25 ring-2 ring-emerald-300'
                  : 'bg-emerald-50/90 hover:bg-emerald-100/90 text-emerald-950 border-emerald-200/90 hover:border-emerald-400 shadow-2xs'
              }`}
            >
              <div
                className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 transition-colors ${
                  currentView === 'vote' ? 'bg-white/20 text-white' : 'bg-emerald-600 text-white'
                }`}
              >
                <Vote className="w-4 h-4" />
              </div>
              <div className="leading-tight">
                <span
                  className={`block text-[9px] font-black uppercase tracking-wider ${
                    currentView === 'vote' ? 'text-emerald-100' : 'text-emerald-700'
                  }`}
                >
                  Coblos Online
                </span>
                <span className="block text-xs font-black tracking-tight whitespace-nowrap">
                  Bilik Suara (Siswa)
                </span>
              </div>
            </button>

            {/* 3. Tata Cara LUBER (Teal / Cyan Box) */}
            <button
              type="button"
              onClick={onOpenGuide}
              className="flex items-center gap-2.5 px-3 py-2 rounded-2xl border-2 bg-teal-50/90 hover:bg-teal-100/90 text-teal-950 border-teal-200/90 hover:border-teal-400 shadow-2xs transition-all cursor-pointer text-left"
            >
              <div className="w-8 h-8 rounded-xl bg-teal-600 text-white flex items-center justify-center shrink-0">
                <HelpCircle className="w-4 h-4" />
              </div>
              <div className="leading-tight">
                <span className="block text-[9px] font-black uppercase tracking-wider text-teal-700">
                  Panduan Siswa
                </span>
                <span className="block text-xs font-black tracking-tight whitespace-nowrap">
                  Tata Cara LUBER
                </span>
              </div>
            </button>

            {/* 4. Panel Admin (Dark Violet / Purple Slate Box) */}
            <button
              type="button"
              onClick={() => setCurrentView('admin')}
              className={`flex items-center gap-2.5 px-3 py-2 rounded-2xl border-2 transition-all cursor-pointer text-left ${
                currentView === 'admin'
                  ? 'bg-purple-900 text-white border-purple-950 shadow-md shadow-purple-950/30 ring-2 ring-purple-400'
                  : 'bg-purple-50/90 hover:bg-purple-100/90 text-purple-950 border-purple-200/90 hover:border-purple-400 shadow-2xs'
              }`}
            >
              <div
                className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 transition-colors ${
                  currentView === 'admin' ? 'bg-white/20 text-white' : 'bg-purple-700 text-white'
                }`}
              >
                <Sliders className="w-4 h-4" />
              </div>
              <div className="leading-tight">
                <div className="flex items-center gap-1">
                  <span
                    className={`block text-[9px] font-black uppercase tracking-wider ${
                      currentView === 'admin' ? 'text-purple-200' : 'text-purple-700'
                    }`}
                  >
                    KPU & Panitia
                  </span>
                  {currentAdmin && (
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                  )}
                </div>
                <span className="block text-xs font-black tracking-tight whitespace-nowrap">
                  Panel Admin
                </span>
              </div>
            </button>

            {/* 5. TPS Status Tile (Colored Live Indicator) */}
            <div className="hidden xl:flex items-center">
              {getStatusBox()}
            </div>

            {/* 6. Uji Coba Akun (Warm Amber / Golden Box) */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setShowDemoMenu(!showDemoMenu)}
                className={`flex items-center gap-2.5 px-3 py-2 rounded-2xl border-2 transition-all cursor-pointer text-left ${
                  showDemoMenu
                    ? 'bg-amber-100 text-amber-950 border-amber-500 shadow-md ring-2 ring-amber-300'
                    : 'bg-amber-50/95 hover:bg-amber-100/95 text-amber-950 border-amber-300 hover:border-amber-400 shadow-2xs'
                }`}
                title="Pilih akun pengujian simulasi"
              >
                <div className="w-8 h-8 rounded-xl bg-amber-500 text-amber-950 flex items-center justify-center shrink-0 shadow-2xs">
                  <Sparkles className="w-4 h-4 text-amber-950" />
                </div>
                <div className="leading-tight">
                  <span className="block text-[9px] font-black uppercase tracking-wider text-amber-800">
                    Simulasi TPS
                  </span>
                  <span className="block text-xs font-black tracking-tight whitespace-nowrap">
                    Uji Coba Akun
                  </span>
                </div>
                <ChevronDown
                  className={`w-3.5 h-3.5 text-amber-700 transition-transform duration-200 ${
                    showDemoMenu ? 'rotate-180 text-amber-900' : ''
                  }`}
                />
              </button>

              {/* Demo Switcher Dropdown Modal */}
              {showDemoMenu && (
                <div className="absolute right-0 mt-2.5 w-92 bg-white rounded-3xl shadow-2xl border-2 border-slate-300 p-4 z-50 animate-in fade-in zoom-in-95 duration-150">
                  <div className="pb-3 border-b border-slate-200 flex items-center justify-between">
                    <div>
                      <p className="text-sm font-black text-slate-900 flex items-center gap-1.5">
                        <Sparkles className="w-4 h-4 text-amber-500" />
                        Pintas Akun Pengujian (Demo)
                      </p>
                      <p className="text-xs text-slate-600 mt-0.5">
                        Klik siswa untuk langsung uji coba masuk ke bilik suara:
                      </p>
                    </div>
                  </div>

                  <div className="py-2.5 space-y-2 max-h-72 overflow-y-auto">
                    <p className="text-[10px] font-black tracking-wider text-slate-500 uppercase px-1">
                      Siswa Belum Memilih (Siap Coblos):
                    </p>
                    {demoUnvotedStudents.map((st) => (
                      <button
                        key={st.id}
                        type="button"
                        onClick={() => handleQuickLogin(st.nisn, st.pin)}
                        className="w-full text-left p-2.5 rounded-2xl bg-slate-50 hover:bg-blue-50/80 border border-slate-200 hover:border-blue-300 transition-all flex items-center justify-between group cursor-pointer"
                      >
                        <div>
                          <p className="font-extrabold text-xs sm:text-sm text-slate-900 group-hover:text-blue-700">
                            {st.studentName}
                          </p>
                          <p className="text-[11px] text-slate-600 font-medium">
                            {st.classGrade} • NISN: {st.nisn}
                          </p>
                        </div>
                        <span className="text-[11px] bg-blue-100 text-blue-900 px-2 py-1 rounded-lg font-mono font-black border border-blue-200 shrink-0">
                          PIN: {st.pin}
                        </span>
                      </button>
                    ))}

                    {demoVotedStudent && (
                      <>
                        <div className="pt-2 border-t border-slate-200"></div>
                        <p className="text-[10px] font-black tracking-wider text-slate-500 uppercase px-1">
                          Uji Coba Siswa Sudah Memilih (Uji Validasi):
                        </p>
                        <button
                          type="button"
                          onClick={() => handleQuickLogin(demoVotedStudent.nisn, demoVotedStudent.pin)}
                          className="w-full text-left p-2.5 rounded-2xl bg-rose-50/50 hover:bg-rose-50 border border-rose-200 hover:border-rose-300 transition-all flex items-center justify-between group cursor-pointer"
                        >
                          <div>
                            <p className="font-extrabold text-xs sm:text-sm text-slate-900 group-hover:text-rose-700">
                              {demoVotedStudent.studentName}
                            </p>
                            <p className="text-[11px] text-slate-600 font-medium">
                              {demoVotedStudent.classGrade} • NISN: {demoVotedStudent.nisn}
                            </p>
                          </div>
                          <span className="text-[10px] bg-rose-100 text-rose-900 px-2 py-0.5 rounded-md font-black border border-rose-300 shrink-0">
                            Sudah Nyoblos
                          </span>
                        </button>
                      </>
                    )}
                  </div>

                  <div className="pt-3 border-t border-slate-200 flex items-center justify-between text-xs">
                    <span className="text-slate-700 font-bold">Simulator TPS:</span>
                    <button
                      type="button"
                      onClick={toggleSimulation}
                      className={`px-3 py-1.5 rounded-xl text-xs font-black flex items-center gap-1.5 cursor-pointer transition-colors shadow-2xs ${
                        isSimulating
                          ? 'bg-rose-600 text-white hover:bg-rose-700'
                          : 'bg-emerald-600 text-white hover:bg-emerald-700'
                      }`}
                    >
                      {isSimulating ? (
                        <>
                          <Pause className="w-3.5 h-3.5" /> Stop Simulasi
                        </>
                      ) : (
                        <>
                          <Play className="w-3.5 h-3.5" /> Simulasi Suara
                        </>
                      )}
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Voter Session Active Box */}
            {currentSession && (
              <div className="flex items-center gap-2 pl-2 border-l-2 border-slate-200">
                <div className="text-right">
                  <p className="text-xs font-black text-slate-900 leading-tight">
                    {currentSession.voter.studentName}
                  </p>
                  <p className="text-[10px] text-blue-700 font-bold">
                    {currentSession.voter.classGrade}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={logoutVoter}
                  title="Keluar Bilik Suara"
                  className="p-2 text-rose-700 hover:bg-rose-50 rounded-xl transition-colors border border-rose-200 cursor-pointer"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            )}

            {/* Admin Session Active Box */}
            {currentAdmin && !currentSession && (
              <div className="flex items-center gap-2 pl-2 border-l-2 border-slate-200">
                <div className="text-right">
                  <p className="text-xs font-black text-slate-900 leading-tight">
                    {currentAdmin.fullName}
                  </p>
                  <span className="text-[10px] bg-slate-200 text-slate-800 px-1.5 py-0.5 rounded font-bold">
                    {currentAdmin.role === 'SUPER_ADMIN' ? 'Super Admin' : 'Operator'}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={logoutAdmin}
                  title="Keluar Admin"
                  className="p-2 text-slate-700 hover:text-slate-950 hover:bg-slate-100 rounded-xl transition-colors border border-slate-200 cursor-pointer"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            )}
          </nav>

          {/* Mobile hamburger button */}
          <div className="flex lg:hidden items-center gap-2">
            <button
              type="button"
              onClick={() => setShowDemoMenu(!showDemoMenu)}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-black bg-amber-50 text-amber-950 border-2 border-amber-300"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-600" />
              <span>Uji Coba</span>
            </button>

            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2.5 text-slate-700 hover:bg-slate-100 rounded-xl border-2 border-slate-200"
              aria-label="Buka menu navigasi"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d={
                    mobileMenuOpen
                      ? 'M6 18L18 6M6 6l12 12'
                      : 'M4 6h16M4 12h16M4 18h16'
                  }
                />
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile Navigation Dropdown with matching Colored Boxes */}
        {mobileMenuOpen && (
          <div className="lg:hidden py-4 border-t border-slate-200 space-y-2.5 animate-in fade-in duration-150">
            {/* TPS Status on mobile */}
            <div className="pb-1">
              {getStatusBox()}
            </div>

            {/* 1. Quick Count & Beranda (Mobile Blue Box) */}
            <button
              type="button"
              onClick={() => {
                setCurrentView('home');
                setMobileMenuOpen(false);
              }}
              className={`w-full flex items-center justify-between p-3 rounded-2xl border-2 transition-all text-left ${
                currentView === 'home'
                  ? 'bg-blue-600 text-white border-blue-700 shadow-md'
                  : 'bg-blue-50/90 text-blue-950 border-blue-200'
              }`}
            >
              <div className="flex items-center gap-3">
                <div
                  className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                    currentView === 'home' ? 'bg-white/20 text-white' : 'bg-blue-600 text-white'
                  }`}
                >
                  <BarChart3 className="w-5 h-5" />
                </div>
                <div>
                  <span
                    className={`block text-[10px] font-black uppercase tracking-wider ${
                      currentView === 'home' ? 'text-blue-100' : 'text-blue-700'
                    }`}
                  >
                    Hasil Pemilu
                  </span>
                  <span className="block text-sm font-black">
                    Quick Count & Beranda
                  </span>
                </div>
              </div>
              <span className="text-xs font-bold opacity-60">→</span>
            </button>

            {/* 2. Bilik Suara (Mobile Emerald Box) */}
            <button
              type="button"
              onClick={() => {
                setCurrentView('vote');
                setMobileMenuOpen(false);
              }}
              className={`w-full flex items-center justify-between p-3 rounded-2xl border-2 transition-all text-left ${
                currentView === 'vote'
                  ? 'bg-emerald-600 text-white border-emerald-700 shadow-md'
                  : 'bg-emerald-50/90 text-emerald-950 border-emerald-200'
              }`}
            >
              <div className="flex items-center gap-3">
                <div
                  className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                    currentView === 'vote' ? 'bg-white/20 text-white' : 'bg-emerald-600 text-white'
                  }`}
                >
                  <Vote className="w-5 h-5" />
                </div>
                <div>
                  <span
                    className={`block text-[10px] font-black uppercase tracking-wider ${
                      currentView === 'vote' ? 'text-emerald-100' : 'text-emerald-700'
                    }`}
                  >
                    Coblos Digital Siswa
                  </span>
                  <span className="block text-sm font-black">
                    Bilik Suara (Siswa)
                  </span>
                </div>
              </div>
              <span className="text-xs font-bold opacity-60">→</span>
            </button>

            {/* 3. Tata Cara LUBER (Mobile Teal Box) */}
            <button
              type="button"
              onClick={() => {
                onOpenGuide();
                setMobileMenuOpen(false);
              }}
              className="w-full flex items-center justify-between p-3 rounded-2xl border-2 bg-teal-50/90 text-teal-950 border-teal-200 text-left"
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-teal-600 text-white flex items-center justify-center shrink-0">
                  <HelpCircle className="w-5 h-5" />
                </div>
                <div>
                  <span className="block text-[10px] font-black uppercase tracking-wider text-teal-700">
                    Panduan & Regulasi
                  </span>
                  <span className="block text-sm font-black">
                    Tata Cara LUBER JURDIL
                  </span>
                </div>
              </div>
              <span className="text-xs font-bold opacity-60">→</span>
            </button>

            {/* 4. Panel Admin (Mobile Purple Box) */}
            <button
              type="button"
              onClick={() => {
                setCurrentView('admin');
                setMobileMenuOpen(false);
              }}
              className={`w-full flex items-center justify-between p-3 rounded-2xl border-2 transition-all text-left ${
                currentView === 'admin'
                  ? 'bg-purple-900 text-white border-purple-950 shadow-md'
                  : 'bg-purple-50/90 text-purple-950 border-purple-200'
              }`}
            >
              <div className="flex items-center gap-3">
                <div
                  className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                    currentView === 'admin' ? 'bg-white/20 text-white' : 'bg-purple-700 text-white'
                  }`}
                >
                  <Sliders className="w-5 h-5" />
                </div>
                <div>
                  <span
                    className={`block text-[10px] font-black uppercase tracking-wider ${
                      currentView === 'admin' ? 'text-purple-200' : 'text-purple-700'
                    }`}
                  >
                    KPU Sekolah & Panitia
                  </span>
                  <span className="block text-sm font-black">
                    Panel Admin & TPS
                  </span>
                </div>
              </div>
              <span className="text-xs font-bold opacity-60">→</span>
            </button>

            {/* 5. Uji Coba Akun (Mobile Amber Card) */}
            <button
              type="button"
              onClick={() => {
                setShowDemoMenu(true);
                setMobileMenuOpen(false);
              }}
              className="w-full flex items-center justify-between p-3 rounded-2xl border-2 bg-amber-50/95 text-amber-950 border-amber-300 text-left"
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-amber-500 text-amber-950 flex items-center justify-center shrink-0 shadow-2xs">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div>
                  <span className="block text-[10px] font-black uppercase tracking-wider text-amber-800">
                    Pilihan Akun Demo
                  </span>
                  <span className="block text-sm font-black">
                    Uji Coba Akun & Simulator
                  </span>
                </div>
              </div>
              <span className="text-xs font-black text-amber-900 underline">Buka</span>
            </button>
          </div>
        )}
      </div>
    </header>
  );
};
