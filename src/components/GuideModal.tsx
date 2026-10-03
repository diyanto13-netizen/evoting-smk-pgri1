import React, { useState, useEffect } from 'react';
import {
  X,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  FileCheck,
  Award,
  Maximize2,
  Minimize2,
  ArrowRight,
  UserCheck,
  Vote,
  FileText,
  Monitor,
} from 'lucide-react';

interface GuideModalProps {
  isOpen: boolean;
  onClose: () => void;
  onGoToVote: () => void;
}

export const GuideModal: React.FC<GuideModalProps> = ({ isOpen, onClose, onGoToVote }) => {
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Toggle Fullscreen mode (both in-app full-page viewport and browser fullscreen)
  const handleToggleFullscreen = () => {
    setIsFullscreen((prev) => {
      const next = !prev;
      if (next) {
        // Attempt browser native fullscreen if permitted
        try {
          if (document.documentElement.requestFullscreen && !document.fullscreenElement) {
            document.documentElement.requestFullscreen().catch(() => {});
          }
        } catch {
          // Ignore
        }
      } else {
        try {
          if (document.exitFullscreen && document.fullscreenElement) {
            document.exitFullscreen().catch(() => {});
          }
        } catch {
          // Ignore
        }
      }
      return next;
    });
  };

  // Sync when user exits browser native fullscreen via Esc key
  useEffect(() => {
    const handleFullscreenChange = () => {
      if (!document.fullscreenElement && isFullscreen) {
        // Keep in-app full view or sync
      }
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
    };
  }, [isFullscreen]);

  // Handle ESC key press
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        if (isFullscreen) {
          setIsFullscreen(false);
          if (document.exitFullscreen && document.fullscreenElement) {
            document.exitFullscreen().catch(() => {});
          }
        } else {
          onClose();
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, isFullscreen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center transition-all duration-200 ${
        isFullscreen
          ? 'p-0 bg-slate-950'
          : 'p-2 sm:p-5 bg-slate-950/80 backdrop-blur-xs'
      }`}
    >
      <div
        className={`bg-white shadow-2xl transition-all duration-200 flex flex-col ${
          isFullscreen
            ? 'w-full h-full rounded-none border-none max-w-none max-h-none'
            : 'rounded-3xl max-w-3xl w-full max-h-[92vh] border-2 border-slate-300'
        } overflow-hidden`}
      >
        {/* Header Bar */}
        <div
          className={`sticky top-0 border-b-2 border-slate-200 flex items-center justify-between z-20 shrink-0 gap-2 ${
            isFullscreen
              ? 'px-4 sm:px-8 py-4 bg-slate-950 text-white'
              : 'px-4 sm:px-6 py-4 bg-white/95 backdrop-blur-md text-slate-950'
          }`}
        >
          <div className="flex items-center gap-3 min-w-0">
            <div
              className={`w-10 h-10 sm:w-11 sm:h-11 rounded-2xl flex items-center justify-center shrink-0 border ${
                isFullscreen
                  ? 'bg-blue-600 text-white border-blue-400 shadow-md'
                  : 'bg-blue-100 text-blue-800 border-blue-300'
              }`}
            >
              <ShieldCheck className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h2
                  className={`font-black tracking-tight leading-tight truncate ${
                    isFullscreen ? 'text-base sm:text-xl text-white' : 'text-sm sm:text-lg text-slate-950'
                  }`}
                >
                  Tata Cara & Regulasi Pemilihan Digital
                </h2>
                {isFullscreen && (
                  <span className="bg-emerald-500 text-slate-950 text-[10px] font-black uppercase px-2 py-0.5 rounded-full tracking-wider animate-pulse hidden sm:inline-block">
                    ● Layar Penuh Aktif
                  </span>
                )}
              </div>
              <p
                className={`text-[11px] sm:text-xs font-semibold mt-0.5 truncate ${
                  isFullscreen ? 'text-slate-300' : 'text-slate-600'
                }`}
              >
                SMKS PGRI 1 Kota Sukabumi • Prinsip LUBER JURDIL
              </p>
            </div>
          </div>

          {/* Action Controls: Prominent Fullscreen Button & Close */}
          <div className="flex items-center gap-2 shrink-0">
            {/* FULLSCREEN TOGGLE BUTTON - Highly prominent and never hidden */}
            <button
              type="button"
              onClick={handleToggleFullscreen}
              className={`px-3 sm:px-3.5 py-2 rounded-xl text-xs sm:text-sm font-black transition-all flex items-center gap-1.5 cursor-pointer shadow-sm border ${
                isFullscreen
                  ? 'bg-amber-400 hover:bg-amber-300 text-slate-950 border-amber-300 shadow-amber-400/30'
                  : 'bg-blue-600 hover:bg-blue-700 text-white border-blue-500 shadow-blue-600/30'
              }`}
              title={isFullscreen ? 'Kembalikan ke Ukuran Biasa (Esc)' : 'Tampilkan Layar Penuh (Fullscreen)'}
            >
              {isFullscreen ? (
                <>
                  <Minimize2 className="w-4 h-4 shrink-0 text-slate-950" />
                  <span className="font-black">Kecilkan Layar</span>
                </>
              ) : (
                <>
                  <Maximize2 className="w-4 h-4 shrink-0 text-white" />
                  <span className="font-black">Mode Layar Penuh</span>
                </>
              )}
            </button>

            {/* Close Button */}
            <button
              type="button"
              onClick={onClose}
              className={`p-2 rounded-xl transition-colors cursor-pointer border ${
                isFullscreen
                  ? 'text-slate-400 hover:text-white hover:bg-slate-800 border-slate-700'
                  : 'text-slate-500 hover:text-slate-950 hover:bg-slate-100 border-slate-200'
              }`}
              title="Tutup Panduan"
            >
              <X className="w-5 h-5 sm:w-6 sm:h-6" />
            </button>
          </div>
        </div>

        {/* Scrollable Content Body */}
        <div
          className={`flex-1 overflow-y-auto text-slate-800 space-y-6 ${
            isFullscreen ? 'p-4 sm:p-10 max-w-6xl mx-auto w-full' : 'p-4 sm:p-7'
          }`}
        >
          {/* Quick Notification Banner for Fullscreen Mode */}
          {!isFullscreen ? (
            <div className="p-3.5 rounded-2xl bg-gradient-to-r from-blue-50 via-indigo-50 to-blue-50 border-2 border-blue-200 text-blue-950 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-blue-600 text-white flex items-center justify-center shrink-0 shadow-xs">
                  <Monitor className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="font-black text-xs sm:text-sm text-blue-950">
                    Ingin Membaca Lebih Jelas di Bilik Suara TPS?
                  </h4>
                  <p className="text-[11px] sm:text-xs text-blue-800 font-medium">
                    Aktifkan mode layar penuh agar seluruh aturan pemilu tampil maksimal selebar monitor bilik suara.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={handleToggleFullscreen}
                className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-black rounded-xl shadow-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer shrink-0"
              >
                <Maximize2 className="w-3.5 h-3.5" />
                <span>Buka Layar Penuh</span>
              </button>
            </div>
          ) : (
            <div className="p-3 rounded-xl bg-blue-950 border border-blue-400/40 text-white flex items-center justify-between gap-2 shadow-xs">
              <span className="text-xs font-bold flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
                Mode Layar Penuh Aktif — Seluruh instruksi diperbesar untuk kenyamanan pemilih di bilik TPS.
              </span>
              <button
                type="button"
                onClick={handleToggleFullscreen}
                className="px-3 py-1 bg-white/20 hover:bg-white/30 text-amber-300 text-xs font-bold rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <Minimize2 className="w-3.5 h-3.5" />
                <span>Kecilkan (Esc)</span>
              </button>
            </div>
          )}

          {/* Asas LUBER JURDIL */}
          <div
            className={`rounded-3xl bg-gradient-to-r from-blue-950 via-indigo-950 to-slate-950 text-white space-y-4 border-2 border-blue-900/60 shadow-xl ${
              isFullscreen ? 'p-6 sm:p-8' : 'p-5'
            }`}
          >
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-amber-400/20 border border-amber-400/30 flex items-center justify-center text-amber-300">
                  <Award className="w-5 h-5" />
                </div>
                <h3
                  className={`font-black text-amber-300 tracking-wide ${
                    isFullscreen ? 'text-lg sm:text-xl' : 'text-base'
                  }`}
                >
                  ASAS PEMILIHAN UMUM (LUBER & JURDIL)
                </h3>
              </div>
              <span className="text-[11px] font-mono font-bold text-blue-200 bg-white/10 px-3 py-0.5 rounded-full border border-white/15">
                Sistem E-Voting Terenkripsi
              </span>
            </div>

            <p
              className={`text-slate-200 leading-relaxed font-medium ${
                isFullscreen ? 'text-sm sm:text-base' : 'text-xs sm:text-sm'
              }`}
            >
              Sistem e-Voting SMKS PGRI 1 Kota Sukabumi menjamin kedaulatan dan kerahasiaan hak suara setiap pemilih.
              Pilihan suara yang dikirimkan <strong>dienkripsi dan dianonimkan</strong> sehingga tidak dapat dilacak kembali ke
              identitas NISN siswa atau NIP guru. Setiap pemilih hanya memiliki hak tepat <strong>1 kali memilih (One-Time Token)</strong>.
            </p>

            <div
              className={`grid gap-3 pt-2 ${
                isFullscreen
                  ? 'grid-cols-2 lg:grid-cols-3'
                  : 'grid-cols-2 sm:grid-cols-3'
              }`}
            >
              <div className="bg-white/10 hover:bg-white/15 transition-colors p-3.5 rounded-2xl border border-white/20">
                <span className="font-black text-amber-300 block text-xs sm:text-sm mb-0.5">Langsung (L)</span>
                <p className="text-xs text-slate-200 font-medium">
                  Pemilih memberikan suara secara langsung tanpa perantara atau diwakilkan.
                </p>
              </div>

              <div className="bg-white/10 hover:bg-white/15 transition-colors p-3.5 rounded-2xl border border-white/20">
                <span className="font-black text-amber-300 block text-xs sm:text-sm mb-0.5">Umum (U)</span>
                <p className="text-xs text-slate-200 font-medium">
                  Berlaku bagi seluruh peserta didik dan dewan guru yang terdaftar resmi di DPT.
                </p>
              </div>

              <div className="bg-white/10 hover:bg-white/15 transition-colors p-3.5 rounded-2xl border border-white/20">
                <span className="font-black text-amber-300 block text-xs sm:text-sm mb-0.5">Bebas (B)</span>
                <p className="text-xs text-slate-200 font-medium">
                  Setiap pemilih bebas menentukan pilihan sesuai hati nurani tanpa paksaan.
                </p>
              </div>

              <div className="bg-white/10 hover:bg-white/15 transition-colors p-3.5 rounded-2xl border border-white/20">
                <span className="font-black text-amber-300 block text-xs sm:text-sm mb-0.5">Rahasia (R)</span>
                <p className="text-xs text-slate-200 font-medium">
                  Pilihan suara dijamin kerahasiaannya dan tidak diketahui oleh siapa pun.
                </p>
              </div>

              <div className="bg-white/10 hover:bg-white/15 transition-colors p-3.5 rounded-2xl border border-white/20">
                <span className="font-black text-amber-300 block text-xs sm:text-sm mb-0.5">Jujur (JUR)</span>
                <p className="text-xs text-slate-200 font-medium">
                  Perhitungan suara dicatat secara matematis, transparan, dan tanpa manipulasi.
                </p>
              </div>

              <div className="bg-white/10 hover:bg-white/15 transition-colors p-3.5 rounded-2xl border border-white/20">
                <span className="font-black text-amber-300 block text-xs sm:text-sm mb-0.5">Adil (DIL)</span>
                <p className="text-xs text-slate-200 font-medium">
                  Setiap pemilih dan pasangan calon memperoleh perlakuan yang setara dan adil.
                </p>
              </div>
            </div>
          </div>

          {/* 5 Tahapan Pemilihan */}
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b-2 border-slate-200 pb-2">
              <h3
                className={`font-black text-slate-950 flex items-center gap-2.5 ${
                  isFullscreen ? 'text-lg sm:text-xl' : 'text-sm sm:text-base'
                }`}
              >
                <FileCheck className="w-6 h-6 text-blue-700 shrink-0" />
                <span>5 Langkah Memberikan Suara di Bilik Digital</span>
              </h3>
              <span className="text-xs font-bold text-slate-500 hidden sm:inline">
                Panduan Resmi TPS Digital
              </span>
            </div>

            <div
              className={`grid gap-4 ${
                isFullscreen ? 'grid-cols-1 md:grid-cols-2' : 'grid-cols-1'
              }`}
            >
              {/* Langkah 1 */}
              <div className="flex gap-4 p-4 sm:p-5 rounded-2xl bg-slate-50 border-2 border-slate-200 hover:border-blue-400 hover:bg-blue-50/40 transition-all shadow-xs">
                <div className="w-10 h-10 rounded-2xl bg-blue-600 text-white font-black flex items-center justify-center shrink-0 text-base shadow-sm">
                  1
                </div>
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <UserCheck className="w-4 h-4 text-blue-700" />
                    <h4 className="font-black text-slate-950 text-sm sm:text-base">
                      Login Pemilih (NISN / NIP & PIN 6 Digit)
                    </h4>
                  </div>
                  <p className="text-slate-700 text-xs sm:text-sm leading-relaxed font-medium">
                    Masukkan nomor identitas (NISN siswa atau NIP/NUPTK guru) serta <strong>PIN 6-digit rahasia</strong> yang tertera pada Kartu Suara, atau scan QR code kartu melalui kamera bilik suara.
                  </p>
                </div>
              </div>

              {/* Langkah 2 */}
              <div className="flex gap-4 p-4 sm:p-5 rounded-2xl bg-slate-50 border-2 border-slate-200 hover:border-blue-400 hover:bg-blue-50/40 transition-all shadow-xs">
                <div className="w-10 h-10 rounded-2xl bg-blue-600 text-white font-black flex items-center justify-center shrink-0 text-base shadow-sm">
                  2
                </div>
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <Vote className="w-4 h-4 text-blue-700" />
                    <h4 className="font-black text-slate-950 text-sm sm:text-base">
                      Surat Suara 1: Pilih Pasangan Calon OSIS
                    </h4>
                  </div>
                  <p className="text-slate-700 text-xs sm:text-sm leading-relaxed font-medium">
                    Pelajari visi, misi, dan program kerja kandidat Ketua & Wakil Ketua OSIS, lalu klik tombol <strong>"PILIH PASLON"</strong> pada kandidat terbaik pilihan Anda.
                  </p>
                </div>
              </div>

              {/* Langkah 3 */}
              <div className="flex gap-4 p-4 sm:p-5 rounded-2xl bg-slate-50 border-2 border-slate-200 hover:border-blue-400 hover:bg-blue-50/40 transition-all shadow-xs">
                <div className="w-10 h-10 rounded-2xl bg-blue-600 text-white font-black flex items-center justify-center shrink-0 text-base shadow-sm">
                  3
                </div>
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <Vote className="w-4 h-4 text-indigo-700" />
                    <h4 className="font-black text-slate-950 text-sm sm:text-base">
                      Surat Suara 2: Pilih Pasangan Calon MPK
                    </h4>
                  </div>
                  <p className="text-slate-700 text-xs sm:text-sm leading-relaxed font-medium">
                    Lanjutkan ke surat suara kedua untuk menentukan pasangan calon Ketua & Wakil Ketua Majelis Permusyawaratan Kelas (MPK) sebagai dewan perwakilan siswa.
                  </p>
                </div>
              </div>

              {/* Langkah 4 */}
              <div className="flex gap-4 p-4 sm:p-5 rounded-2xl bg-slate-50 border-2 border-slate-200 hover:border-blue-400 hover:bg-blue-50/40 transition-all shadow-xs">
                <div className="w-10 h-10 rounded-2xl bg-blue-600 text-white font-black flex items-center justify-center shrink-0 text-base shadow-sm">
                  4
                </div>
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <FileText className="w-4 h-4 text-blue-700" />
                    <h4 className="font-black text-slate-950 text-sm sm:text-base">
                      Konfirmasi Akhir & Pengiriman Suara
                    </h4>
                  </div>
                  <p className="text-slate-700 text-xs sm:text-sm leading-relaxed font-medium">
                    Layar pratinjau akan menampilkan ringkasan pilihan Anda. Periksa kembali dengan teliti, kemudian klik <strong>"Konfirmasi & Kirim Suara"</strong>. Pilihan bersifat final.
                  </p>
                </div>
              </div>

              {/* Langkah 5 */}
              <div
                className={`flex gap-4 p-4 sm:p-5 rounded-2xl bg-emerald-50/70 border-2 border-emerald-300 hover:border-emerald-500 transition-all shadow-xs ${
                  isFullscreen ? 'md:col-span-2' : ''
                }`}
              >
                <div className="w-10 h-10 rounded-2xl bg-emerald-600 text-white font-black flex items-center justify-center shrink-0 text-base shadow-sm">
                  5
                </div>
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-700" />
                    <h4 className="font-black text-slate-950 text-sm sm:text-base">
                      Tanda Terima Digital & Logout Otomatis
                    </h4>
                  </div>
                  <p className="text-slate-700 text-xs sm:text-sm leading-relaxed font-medium">
                    Sistem menerbitkan struk verifikasi digital resmi, dan sesi Anda <strong>otomatis keluar seketika</strong> untuk mencegah penyalahgunaan hak suara oleh pemilih lain.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Ketentuan Penting */}
          <div className="p-4 sm:p-5 rounded-2xl bg-amber-50 border-2 border-amber-300 flex items-start gap-4">
            <div className="w-8 h-8 rounded-xl bg-amber-500 text-white flex items-center justify-center shrink-0 shadow-xs mt-0.5">
              <AlertCircle className="w-5 h-5" />
            </div>
            <div className="space-y-1">
              <h4 className="font-black text-amber-950 text-sm sm:text-base">
                Ketentuan Penting Bagi Pemilih:
              </h4>
              <p className="text-amber-900 leading-relaxed font-medium text-xs sm:text-sm">
                Jaga kerahasiaan nomor PIN Anda dan jangan bagikan kepada siapapun. Apabila Kartu Suara hilang, rusak, atau PIN tidak dapat digunakan, segera melapor kepada <strong>Meja Operator TPS Panitia KPU OSIS</strong> di lokasi pemilihan dengan menunjukkan Kartu Pelajar atau Surat Tugas Guru.
              </p>
            </div>
          </div>
        </div>

        {/* Sticky Footer Bar */}
        <div
          className={`sticky bottom-0 border-t-2 border-slate-200 flex items-center justify-between z-20 shrink-0 ${
            isFullscreen ? 'px-4 sm:px-8 py-4 bg-slate-100' : 'px-4 sm:px-6 py-3.5 bg-white/95 backdrop-blur-md'
          }`}
        >
          <div className="flex items-center gap-2 sm:gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 text-xs sm:text-sm font-bold text-slate-700 hover:text-slate-950 hover:bg-slate-200/80 rounded-xl transition-colors cursor-pointer"
            >
              Tutup Panduan
            </button>

            {/* Prominent Footer Fullscreen Toggle */}
            <button
              type="button"
              onClick={handleToggleFullscreen}
              className={`px-3 py-2 rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer border ${
                isFullscreen
                  ? 'bg-slate-200 text-slate-800 border-slate-300 hover:bg-slate-300'
                  : 'bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100'
              }`}
            >
              {isFullscreen ? (
                <>
                  <Minimize2 className="w-3.5 h-3.5" />
                  <span>Kecilkan Tampilan</span>
                </>
              ) : (
                <>
                  <Maximize2 className="w-3.5 h-3.5" />
                  <span>Perbesar Layar Penuh</span>
                </>
              )}
            </button>
          </div>

          <button
            type="button"
            onClick={() => {
              if (isFullscreen && document.exitFullscreen && document.fullscreenElement) {
                document.exitFullscreen().catch(() => {});
              }
              onClose();
              onGoToVote();
            }}
            className="px-5 sm:px-6 py-2.5 sm:py-3 text-xs sm:text-sm font-black text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-md shadow-blue-600/30 transition-all flex items-center gap-2 cursor-pointer group"
          >
            <span>Buka Bilik Suara Sekarang</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
          </button>
        </div>
      </div>
    </div>
  );
};
