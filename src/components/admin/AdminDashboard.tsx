import React, { useState } from 'react';
import { useVoting } from '../../context/VotingContext';
import { PeriodManager } from './PeriodManager';
import { CandidateManager } from './CandidateManager';
import { VoterManager } from './VoterManager';
import { BeritaAcara } from './BeritaAcara';
import { AuditLogViewer } from './AuditLogViewer';
import { TimelineManager } from './TimelineManager';
import { ResetVotesModal } from './ResetVotesModal';
import { AdminPasswordManager } from './AdminPasswordManager';
import { FirebaseConnectionModal } from '../FirebaseConnectionModal';
import { StatCard } from '../StatCard';
import { QuickCountChart } from '../QuickCountChart';
import { CandidateModal } from '../CandidateModal';
import { PemilosLogo } from '../PemilosLogo';
import { Candidate } from '../../types/voting';
import {
  LayoutDashboard,
  Calendar,
  Users,
  Vote,
  FileText,
  ShieldCheck,
  Play,
  Pause,
  Lock,
  Eye,
  RotateCcw,
  LogOut,
  Sparkles,
  CalendarClock,
  Tv,
  Cloud,
  CloudOff,
  Database,
  KeyRound,
} from 'lucide-react';

export const AdminDashboard: React.FC = () => {
  const {
    currentAdmin,
    logoutAdmin,
    activePeriod,
    activeVoters,
    osisVotes,
    mpkVotes,
    osisCandidates,
    mpkCandidates,
    isSimulating,
    toggleSimulation,
    updatePeriodStatus,
    toggleResultPublished,
    resetToDefaultData,
    isFirebaseEnabled,
    isFirebaseConnected,
    toggleFirebaseConnection,
  } = useVoting();

  const [activeTab, setActiveTab] = useState<
    'overview' | 'periods' | 'candidates' | 'voters' | 'timeline' | 'report' | 'logs' | 'security'
  >('overview');
  const [previewCandidate, setPreviewCandidate] = useState<Candidate | null>(null);
  const [showResetVotesModal, setShowResetVotesModal] = useState(false);
  const [showFirebaseModal, setShowFirebaseModal] = useState(false);

  const totalDpt = activeVoters.length;
  const totalVoted = activeVoters.filter((v) => v.hasVoted).length;
  const unvoted = totalDpt - totalVoted;
  const participationRate = totalDpt > 0 ? (totalVoted / totalDpt) * 100 : 0;

  return (
    <div className="max-w-7xl mx-auto py-4 sm:py-6 px-2 sm:px-6 lg:px-8 space-y-6 print:p-0 print:m-0 print:max-w-none print:space-y-0">
      {/* Admin Top Header Banner with High Contrast */}
      <div className="bg-slate-950 text-white rounded-3xl p-5 sm:p-7 shadow-xl border-2 border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-5 print:hidden">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-white p-1 flex items-center justify-center shadow-lg border-2 border-slate-700 shrink-0">
            <PemilosLogo className="w-12 h-12 sm:w-14 sm:h-14 drop-shadow-sm" />
          </div>
          <div>
            <div className="flex items-center gap-2.5 flex-wrap">
              <span className="text-xs font-black uppercase tracking-wider text-amber-300 bg-amber-950 px-3 py-1 rounded-md border border-amber-600/50">
                {currentAdmin?.role === 'SUPER_ADMIN' ? 'SUPER ADMINISTRATOR' : 'OPERATOR TPS RESMI'}
              </span>
              <button
                type="button"
                onClick={() => setShowFirebaseModal(true)}
                className={`text-xs font-black uppercase tracking-wider px-3 py-1 rounded-md border flex items-center gap-1.5 cursor-pointer transition-colors ${
                  isFirebaseEnabled
                    ? 'text-emerald-300 bg-emerald-950/80 border-emerald-500/50 hover:bg-emerald-900'
                    : 'text-amber-300 bg-amber-950/80 border-amber-500/50 hover:bg-amber-900'
                }`}
                title="Status koneksi database Firebase (Klik untuk membuka pengaturan ON/OFF)"
              >
                {isFirebaseEnabled ? (
                  <>
                    <span className={`w-2 h-2 rounded-full ${isFirebaseConnected ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'}`}></span>
                    <Cloud className="w-3.5 h-3.5" />
                    Cloud Firestore Online
                  </>
                ) : (
                  <>
                    <span className="w-2 h-2 rounded-full bg-amber-400"></span>
                    <CloudOff className="w-3.5 h-3.5" />
                    Mode Uji Coba (Sandbox)
                  </>
                )}
              </button>
              <span className="text-xs sm:text-sm text-slate-300 font-bold">
                Periode Aktif: <strong>{activePeriod?.academicYear || '2026/2027'}</strong>
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black mt-1.5 text-white">
              {currentAdmin?.fullName}
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 font-medium">
              {currentAdmin?.title || 'Panitia Pemilihan OSIS & MPK SMKS PGRI 1 Sukabumi'}
            </p>
          </div>
        </div>

        {/* Quick TPS Status Toggles */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* TPS Status */}
          <div className="bg-slate-900 p-1.5 rounded-2xl border-2 border-slate-800 flex items-center gap-1">
            <span className="text-xs text-slate-300 px-2.5 font-bold">Bilik Suara:</span>
            {(['OPEN', 'PAUSED', 'CLOSED'] as const).map((st) => (
              <button
                key={st}
                onClick={() => activePeriod && updatePeriodStatus(activePeriod.id, st)}
                className={`px-3 py-1.5 rounded-xl text-xs sm:text-sm font-black transition-all cursor-pointer ${
                  activePeriod?.status === st
                    ? st === 'OPEN'
                      ? 'bg-emerald-600 text-white shadow-sm'
                      : st === 'PAUSED'
                      ? 'bg-amber-500 text-white shadow-sm'
                      : 'bg-rose-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {st === 'OPEN' ? 'Buka' : st === 'PAUSED' ? 'Jeda' : 'Tutup'}
              </button>
            ))}
          </div>

          {/* Firebase Connection Toggle Button */}
          <button
            onClick={() => setShowFirebaseModal(true)}
            className={`px-3.5 py-2.5 rounded-2xl text-xs sm:text-sm font-black flex items-center gap-1.5 border-2 transition-all cursor-pointer shadow-xs ${
              isFirebaseEnabled
                ? 'bg-emerald-950/90 text-emerald-200 border-emerald-500/80 hover:bg-emerald-900'
                : 'bg-amber-950/90 text-amber-200 border-amber-500/80 hover:bg-amber-900'
            }`}
            title="Pengaturan Mode Database Cloud Firebase (ON / OFF)"
          >
            {isFirebaseEnabled ? (
              <>
                <Cloud className="w-4 h-4 text-emerald-400 animate-pulse" />
                <span>Cloud DB: ON</span>
              </>
            ) : (
              <>
                <CloudOff className="w-4 h-4 text-amber-400" />
                <span>Uji Coba: OFF</span>
              </>
            )}
          </button>

          {/* Quick Count Freeze/Publish */}
          {activePeriod && (
            <button
              onClick={() => toggleResultPublished(activePeriod.id, !activePeriod.isResultPublished)}
              className={`px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-black flex items-center gap-2 transition-colors cursor-pointer ${
                activePeriod.isResultPublished
                  ? 'bg-blue-600 text-white hover:bg-blue-700 shadow-xs'
                  : 'bg-amber-500 text-white hover:bg-amber-600 shadow-xs'
              }`}
            >
              {activePeriod.isResultPublished ? (
                <>
                  <Eye className="w-4 h-4" />
                  Quick Count Publik
                </>
              ) : (
                <>
                  <Lock className="w-4 h-4" />
                  Quick Count Terkunci
                </>
              )}
            </button>
          )}

          {/* Reset Suara Paslon Button */}
          <button
            onClick={() => setShowResetVotesModal(true)}
            className="px-3.5 py-2.5 bg-rose-950/80 hover:bg-rose-900 text-rose-200 border-2 border-rose-500/50 rounded-2xl text-xs sm:text-sm font-black transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs"
            title="Kosongkan atau reset perolehan suara pasangan calon"
          >
            <RotateCcw className="w-4 h-4 text-rose-400" />
            <span>Reset Suara Paslon</span>
          </button>

          {/* Logout */}
          <button
            onClick={logoutAdmin}
            className="p-2.5 text-slate-300 hover:text-white bg-slate-900 hover:bg-slate-800 border-2 border-slate-800 rounded-2xl transition-colors cursor-pointer"
            title="Keluar Admin"
          >
            <LogOut className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Navigation Submenu Tabs */}
      <div className="bg-white rounded-2xl p-2 border-2 border-slate-200 shadow-2xs flex overflow-x-auto gap-1.5 print:hidden">
        <button
          onClick={() => setActiveTab('overview')}
          className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-black transition-all flex items-center gap-2 shrink-0 cursor-pointer ${
            activeTab === 'overview'
              ? 'bg-blue-600 text-white shadow-sm'
              : 'text-slate-700 hover:text-slate-950 hover:bg-slate-100'
          }`}
        >
          <LayoutDashboard className="w-4 h-4" />
          Ringkasan & Kontrol
        </button>

        <button
          onClick={() => setActiveTab('voters')}
          className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-black transition-all flex items-center gap-2 shrink-0 cursor-pointer ${
            activeTab === 'voters'
              ? 'bg-blue-600 text-white shadow-sm'
              : 'text-slate-700 hover:text-slate-950 hover:bg-slate-100'
          }`}
        >
          <Users className="w-4 h-4" />
          Daftar DPT & PIN ({totalDpt})
        </button>

        <button
          onClick={() => setActiveTab('candidates')}
          className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-black transition-all flex items-center gap-2 shrink-0 cursor-pointer ${
            activeTab === 'candidates'
              ? 'bg-blue-600 text-white shadow-sm'
              : 'text-slate-700 hover:text-slate-950 hover:bg-slate-100'
          }`}
        >
          <Vote className="w-4 h-4" />
          Paslon OSIS & MPK
        </button>

        <button
          onClick={() => setActiveTab('periods')}
          className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-black transition-all flex items-center gap-2 shrink-0 cursor-pointer ${
            activeTab === 'periods'
              ? 'bg-blue-600 text-white shadow-sm'
              : 'text-slate-700 hover:text-slate-950 hover:bg-slate-100'
          }`}
        >
          <Calendar className="w-4 h-4" />
          Periode / Tahun Ajaran
        </button>

        <button
          onClick={() => setActiveTab('timeline')}
          className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-black transition-all flex items-center gap-2 shrink-0 cursor-pointer ${
            activeTab === 'timeline'
              ? 'bg-blue-600 text-white shadow-sm'
              : 'text-slate-700 hover:text-slate-950 hover:bg-slate-100'
          }`}
        >
          <CalendarClock className="w-4 h-4" />
          Jadwal Tahapan Pemilu
        </button>

        <button
          onClick={() => setActiveTab('report')}
          className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-black transition-all flex items-center gap-2 shrink-0 cursor-pointer ${
            activeTab === 'report'
              ? 'bg-blue-600 text-white shadow-sm'
              : 'text-slate-700 hover:text-slate-950 hover:bg-slate-100'
          }`}
        >
          <FileText className="w-4 h-4" />
          Cetak Berita Acara
        </button>

        <button
          onClick={() => setActiveTab('logs')}
          className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-black transition-all flex items-center gap-2 shrink-0 cursor-pointer ${
            activeTab === 'logs'
              ? 'bg-blue-600 text-white shadow-sm'
              : 'text-slate-700 hover:text-slate-950 hover:bg-slate-100'
          }`}
        >
          <ShieldCheck className="w-4 h-4" />
          Audit Log
        </button>

        <button
          onClick={() => setActiveTab('security')}
          className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-black transition-all flex items-center gap-2 shrink-0 cursor-pointer ${
            activeTab === 'security'
              ? 'bg-blue-600 text-white shadow-sm'
              : 'text-slate-700 hover:text-slate-950 hover:bg-slate-100'
          }`}
        >
          <KeyRound className="w-4 h-4 text-amber-500" />
          Pengaturan Password & Akun
        </button>
      </div>

      {/* TAB CONTENT: OVERVIEW */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          <StatCard
            totalDpt={totalDpt}
            totalVoted={totalVoted}
            participationRate={participationRate}
            unvoted={unvoted}
            tpsStatus={activePeriod?.status || 'OPEN'}
          />

          {/* Quick Actions Panel */}
          <div className="bg-white rounded-3xl border-2 border-slate-200 p-6 shadow-xs">
            <h3 className="text-base font-black text-slate-950 mb-4 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-amber-500" />
              Fitur Cepat Operasional Panitia
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {/* Firebase Database Connection Switch Card */}
              <div
                className={`p-5 rounded-2xl border-2 flex flex-col justify-between transition-all ${
                  isFirebaseEnabled
                    ? 'bg-emerald-50/70 border-emerald-300 shadow-2xs'
                    : 'bg-amber-50/70 border-amber-300 shadow-2xs'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-1.5">
                    <span
                      className={`text-[10px] font-black uppercase px-2 py-0.5 rounded border flex items-center gap-1 ${
                        isFirebaseEnabled
                          ? 'text-emerald-950 bg-emerald-200 border-emerald-300'
                          : 'text-amber-950 bg-amber-200 border-amber-300'
                      }`}
                    >
                      {isFirebaseEnabled ? (
                        <>
                          <Cloud className="w-3 h-3 text-emerald-700" /> Cloud Online
                        </>
                      ) : (
                        <>
                          <CloudOff className="w-3 h-3 text-amber-700" /> Mode Uji Coba (Sandbox)
                        </>
                      )}
                    </span>
                    <span className="text-[11px] font-bold text-slate-500">
                      {isFirebaseEnabled ? (isFirebaseConnected ? '🟢 Live Sync' : '🟡 Menghubungkan') : '⚪ Terisolasi'}
                    </span>
                  </div>
                  <h4 className="text-sm font-black text-slate-950 flex items-center gap-1.5">
                    <Database className="w-4 h-4 text-blue-600" />
                    Koneksi Firebase ({isFirebaseEnabled ? 'ON' : 'OFF'})
                  </h4>
                  <p className="text-xs text-slate-700 font-medium mt-1 leading-relaxed">
                    {isFirebaseEnabled
                      ? 'Tersambung ke Google Cloud Firestore. Setiap suara & perubahan DPT disinkronkan langsung.'
                      : 'Mode Uji Coba Aman aktif. Semua suara dan simulasi hanya disimpan lokal, aman tanpa mengubah server cloud.'}
                  </p>
                </div>
                <div className="mt-4 flex items-center gap-2">
                  <button
                    onClick={() => toggleFirebaseConnection()}
                    className={`flex-1 py-2.5 px-3 rounded-xl text-xs sm:text-sm font-black flex items-center justify-center gap-1.5 transition-colors cursor-pointer shadow-xs ${
                      isFirebaseEnabled
                        ? 'bg-amber-600 hover:bg-amber-700 text-white'
                        : 'bg-emerald-600 hover:bg-emerald-700 text-white'
                    }`}
                  >
                    {isFirebaseEnabled ? (
                      <>
                        <CloudOff className="w-4 h-4" /> Matikan (OFF)
                      </>
                    ) : (
                      <>
                        <Cloud className="w-4 h-4" /> Nyalakan (ON)
                      </>
                    )}
                  </button>
                  <button
                    onClick={() => setShowFirebaseModal(true)}
                    className="py-2.5 px-3 bg-white hover:bg-slate-100 text-slate-800 border border-slate-300 rounded-xl text-xs font-bold transition-colors cursor-pointer"
                    title="Buka panel lengkap pengaturan koneksi Firebase"
                  >
                    Pengaturan
                  </button>
                </div>
              </div>

              {/* Password & Akun Admin Card */}
              <div className="p-5 rounded-2xl bg-indigo-50/70 border-2 border-indigo-300 flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[10px] font-black uppercase text-indigo-900 bg-indigo-200/70 px-2 py-0.5 rounded border border-indigo-300">
                      Keamanan & Akses
                    </span>
                  </div>
                  <h4 className="text-sm font-black text-slate-950">
                    Pengaturan Password Admin
                  </h4>
                  <p className="text-xs text-slate-700 font-medium mt-1 leading-relaxed">
                    Ubah password Super Admin & Operator TPS atau reset kata sandi default untuk keamanan akun panitia.
                  </p>
                </div>
                <div className="mt-4">
                  <button
                    onClick={() => setActiveTab('security')}
                    className="w-full py-2.5 px-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs sm:text-sm font-black transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-xs"
                  >
                    <KeyRound className="w-4 h-4" /> Buka Pengaturan Password
                  </button>
                </div>
              </div>

              {/* Reset Suara Paslon Card */}
              <div className="p-5 rounded-2xl bg-rose-50/70 border-2 border-rose-300 flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[10px] font-black uppercase text-rose-900 bg-rose-200/70 px-2 py-0.5 rounded border border-rose-300">
                      Kotak Suara
                    </span>
                  </div>
                  <h4 className="text-sm font-black text-slate-950">
                    Kosongkan Suara Paslon
                  </h4>
                  <p className="text-xs text-slate-700 font-medium mt-1 leading-relaxed">
                    Reset perolehan suara paslon tertentu (OSIS/MPK) atau kosongkan seluruh kotak suara pemilu.
                  </p>
                </div>
                <div className="mt-4">
                  <button
                    onClick={() => setShowResetVotesModal(true)}
                    className="w-full py-2.5 px-4 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs sm:text-sm font-black transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-xs"
                  >
                    <RotateCcw className="w-4 h-4" /> Kelola Reset Suara
                  </button>
                </div>
              </div>

              {/* Simulator Card */}
              <div className="p-5 rounded-2xl bg-slate-50 border-2 border-slate-200 flex flex-col justify-between">
                <div>
                  <h4 className="text-sm font-black text-slate-950">
                    Simulasi Suara TPS Digital
                  </h4>
                  <p className="text-xs text-slate-700 font-medium mt-1 leading-relaxed">
                    Secara otomatis memasukkan suara acak pemilih setiap 3 detik untuk menguji animasi grafik real-time.
                  </p>
                </div>
                <div className="mt-4">
                  <button
                    onClick={toggleSimulation}
                    className={`w-full py-2.5 px-4 rounded-xl text-xs sm:text-sm font-black flex items-center justify-center gap-2 transition-colors cursor-pointer ${
                      isSimulating
                        ? 'bg-rose-600 text-white hover:bg-rose-700'
                        : 'bg-emerald-600 text-white hover:bg-emerald-700'
                    }`}
                  >
                    {isSimulating ? (
                      <>
                        <Pause className="w-4 h-4" /> Hentikan Simulasi
                      </>
                    ) : (
                      <>
                        <Play className="w-4 h-4" /> Mulai Simulasi Suara
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Print Report Card */}
              <div className="p-5 rounded-2xl bg-slate-50 border-2 border-slate-200 flex flex-col justify-between">
                <div>
                  <h4 className="text-sm font-black text-slate-950">
                    Dokumen Berita Acara Resmi
                  </h4>
                  <p className="text-xs text-slate-700 font-medium mt-1 leading-relaxed">
                    Surat keputusan pleno penetapan hasil pemilihan berformat resmi untuk ditandatangani Kepala Sekolah.
                  </p>
                </div>
                <div className="mt-4">
                  <button
                    onClick={() => setActiveTab('report')}
                    className="w-full py-2.5 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs sm:text-sm font-black transition-colors flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <FileText className="w-4 h-4" /> Buka Format Berita Acara
                  </button>
                </div>
              </div>

              {/* Timeline Manager Card */}
              <div className="p-5 rounded-2xl bg-slate-50 border-2 border-slate-200 flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-black uppercase text-blue-900 bg-blue-100 px-2 py-0.5 rounded border border-blue-200">
                      Fitur Khusus
                    </span>
                  </div>
                  <h4 className="text-sm font-black text-slate-950">
                    Jadwal Tahapan Pemilu
                  </h4>
                  <p className="text-xs text-slate-700 font-medium mt-1 leading-relaxed">
                    Tentukan tanggal riil, lokasi, dan status setiap tahapan pemilu. Perubahan langsung terupdate di beranda publik.
                  </p>
                </div>
                <div className="mt-4">
                  <button
                    onClick={() => setActiveTab('timeline')}
                    className="w-full py-2.5 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs sm:text-sm font-black transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-xs"
                  >
                    <CalendarClock className="w-4 h-4 text-amber-300" /> Atur Tanggal Riil Tahapan
                  </button>
                </div>
              </div>

              {/* Reset Data Default Card */}
              <div className="p-5 rounded-2xl bg-slate-50 border-2 border-slate-200 flex flex-col justify-between">
                <div>
                  <h4 className="text-sm font-black text-slate-950">
                    Reset Sistem ke Data Awal
                  </h4>
                  <p className="text-xs text-slate-700 font-medium mt-1 leading-relaxed">
                    Kembalikan seluruh DPT, paslon, dan suara ke konfigurasi bawaan sekolah jika selesai pengujian.
                  </p>
                </div>
                <div className="mt-4">
                  <button
                    onClick={() => {
                      if (confirm('Yakin ingin mereset seluruh data kembali ke kondisi default awal?')) {
                        resetToDefaultData();
                      }
                    }}
                    className="w-full py-2.5 px-4 bg-slate-200 hover:bg-rose-50 text-slate-800 hover:text-rose-700 border border-slate-300 rounded-xl text-xs sm:text-sm font-black transition-colors flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <RotateCcw className="w-4 h-4" /> Reset Pabrik Default
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Count Overview (Dual OSIS & MPK Satu Layar with Photos & Colored Graphics) */}
          <div className="pt-2">
            <QuickCountChart onOpenCandidateDetail={(c) => setPreviewCandidate(c)} />
          </div>
        </div>
      )}

      {/* TAB CONTENT: PERIODS */}
      {activeTab === 'periods' && <PeriodManager />}

      {/* TAB CONTENT: CANDIDATES */}
      {activeTab === 'candidates' && <CandidateManager />}

      {/* TAB CONTENT: VOTERS */}
      {activeTab === 'voters' && <VoterManager />}

      {/* TAB CONTENT: TIMELINE */}
      {activeTab === 'timeline' && <TimelineManager />}

      {/* TAB CONTENT: REPORT */}
      {activeTab === 'report' && (
        <BeritaAcara onBack={() => setActiveTab('overview')} />
      )}

      {/* TAB CONTENT: LOGS */}
      {activeTab === 'logs' && <AuditLogViewer />}

      {/* TAB CONTENT: SECURITY & PASSWORD SETTINGS */}
      {activeTab === 'security' && <AdminPasswordManager />}

      {/* Candidate Detail Modal */}
      {previewCandidate && (
        <CandidateModal
          candidate={previewCandidate}
          onClose={() => setPreviewCandidate(null)}
        />
      )}

      {/* Reset Suara Paslon Modal */}
      {showResetVotesModal && (
        <ResetVotesModal onClose={() => setShowResetVotesModal(false)} />
      )}

      {/* Firebase Connection Setting Modal */}
      {showFirebaseModal && (
        <FirebaseConnectionModal onClose={() => setShowFirebaseModal(false)} />
      )}
    </div>
  );
};
