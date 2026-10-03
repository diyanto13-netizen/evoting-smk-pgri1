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
  Sparkles,
  ArrowRight,
  UserCheck,
  Vote,
  FileText,
  Lock,
} from 'lucide-react';

interface GuideModalProps {
  isOpen: boolean;
  onClose: () => void;
  onGoToVote: () => void;
}

export const GuideModal: React.FC<GuideModalProps> = ({ isOpen, onClose, onGoToVote }) => {
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Toggle Fullscreen mode (both in-app full-page and optional browser fullscreen)
  const handleToggleFullscreen = () => {
    setIsFullscreen((prev) => {
      const next = !prev;
      if (next) {
        // Try native browser fullscreen if supported
        if (document.documentElement.requestFullscreen && !document.fullscreenElement) {
          document.documentElement.requestFullscreen().catch(() => {
            // Ignore if rejected by browser security policy
          });
        }
      } else {
        if (document.exitFullscreen && document.fullscreenElement) {
          document.exitFullscreen().catch(() => {});
        }
      }
      return next;
    });
  };

  // Listen to browser fullscreen exit (e.g. user pressed physical ESC)
  useEffect(() => {
    const handleFullscreenChange = () => {
      if (!document.fullscreenElement && isFullscreen) {
        // Keep in-app full window or sync
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
      className={`fixed inset-0 z-50 flex items-center justify-center transition-all duration-300 ${
        isFullscreen
          ? 'p-0 bg-slate-950'
          : 'p-3 sm:p-5 bg-slate-950/80 backdrop-blur-xs'
      }`}
    >
      <div
        className={`bg-white shadow-2xl transition-all duration-300 flex flex-col ${
          isFullscreen
            ? 'w-full h-full rounded-none border-none max-w-none max-h-none'
            : 'rounded-3xl max-w-3xl w-full max-h-[92vh] border-2 border-slate-300'
        } overflow-hidden`}
      >
        {/* Header Bar */}
        <div
          className={`sticky top-0 bg-white/95 backdrop-blur-md border-b-2 border-slate-200 flex items-center justify-between z-20 shrink-0 ${
            isFullscreen ? 'px-6 sm:px-10 py-5 bg-slate-900 text-white' : 'px-6 py-4.5 text-slate-950'
          }`}
        >
          <div className="flex items-center gap-3.5 min-w-0">
            <div
              className={`w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 border ${
                isFullscreen
                  ? 'bg-blue-600 text-white border-blue-400 shadow-md'
                  : 'bg-blue-100 text-blue-800 border-blue-300'
              }`}
            >
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h2
                  className={`font-black tracking-tight leading-tight truncate ${
                    isFullscreen ? 'text-lg sm:text-2xl text-white' : 'text-base sm:text-xl text-slate-950'
                  }`}
                >
                  Tata Cara & Regulasi Pemilihan Digital
                </h2>
                {isFullscreen && (
                  <span className="bg-blue-600 text-white text-[11px] font-black uppercase px-2.5 py-0.5 rounded-full tracking-wider animate-pulse hidden sm:inline-block">
                    Mode Layar Penuh
                  </span>
                )}
              </div>
              <p
                className={`text-xs sm:text-sm font-semibold mt-0.5 truncate ${
                  isFullscreen ? 'text-slate-300' : 'text-slate-600'
                }`}
              >
                SMKS PGRI 1 Kota Sukabumi • Prinsip LUBER JURDIL
              </p>
            </div>
          </div>

          {/* Action Controls: Fullscreen Toggle & Close */}
          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            {/* Fullscreen Button */}
            <button
              onClick={handleToggleFullscreen}
              className={`px-3 py-2 rounded-xl text-xs sm:text-sm font-black transition-all flex items-center gap-1.5 cursor-pointer border ${
                isFullscreen
                  ? 'bg-slate-800 text-amber-300 border-slate-700 hover:bg-slate-700'
                  : 'bg-slate-100 text-slate-800 border-slate-300 hover:bg-blue-50 hover:text-blue-700 hover:border-blue-300'
              }`}
              title={isFullscreen ? 'Kecilkan ke Ukuran Normal (Esc)' : 'Tampilkan Layar Penuh (Fullscreen)'}
            >
              {isFullscreen ? (
                <>
                  <Minimize2 className="w-4 h-4 text-amber-400" />
                  <span className="hidden sm:inline">Kecilkan</span>
                </>
              ) : (
                <>
                  <Maximize2 className="w-4 h-4 text-blue-600" />
                  <span className="hidden sm:inline">Layar Penuh</span>
                </>
              )}
            </button>

            {/* Close Button */}
            <button
              onClick={onClose}
              className={`p-2 rounded-xl transition-colors cursor-pointer ${
                isFullscreen
                  ? 'text-slate-400 hover:text-white hover:bg-slate-800'
                  : 'text-slate-500 hover:text-slate-950 hover:bg-slate-100'
              }`}
              title="Tutup Panduan"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Scrollable Content Body */}
        <div
          className={`flex-1 overflow-y-auto text-slate-800 space-y-8 ${
            isFullscreen ? 'p-6 sm:p-12 max-w-6xl mx-auto w-full' : 'p-6 sm:p-8'
          }`}
        >
          {/* Asas LUBER JURDIL */}
          <div
            className={`rounded-3xl bg-gradient-to-r from-blue-950 via-indigo-950 to-slate-950 text-white space-y-4 border-2 border-blue-900/60 shadow-xl ${
              isFullscreen ? 'p-6 sm:p-8' : 'p-5 sm:p-6'
            }`}
          >
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-amber-400/20 border border-amber-400/30 flex items-center justify-center text-amber-300">
                  <Award className="w-5 h-5" />
                </div>
                <h3
                  className={`font-black text-amber-300 tracking-wide ${
                    isFullscreen ? 'text-lg sm:text-xl' : 'text-base sm:text-lg'
                  }`}
                >
                  ASAS PEMILIHAN UMUM (LUBER & JURDIL)
                </h3>
              </div>
              <span className="text-xs font-mono font-bold text-blue-200 bg-white/10 px-3 py-1 rounded-full border border-white/15">
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
              identitas NISN/NIP pemilih. Setiap pemilih hanya memiliki hak tepat <strong>1 kali memilih (One-Time Token)</strong>.
            </p>

            <div
              className={`grid gap-3 pt-2 ${
                isFullscreen
                  ? 'grid-cols-2 lg:grid-cols-3'
                  : 'grid-cols-2 sm:grid-cols-3'
              }`}
            >
              <div className="bg-white/10 hover:bg-white/15 transition-colors p-3.5 sm:p-4 rounded-2xl border border-white/20">
                <span className="font-black text-amber-300 block text-xs sm:text-sm mb-0.5">Langsung (L)</span>
                <p className="text-xs sm:text-sm text-slate-200 font-medium">
                  Pemilih memberikan suara secara langsung tanpa perantara atau diwakilkan.
                </p>
              </div>

              <div className="bg-white/10 hover:bg-white/15 transition-colors p-3.5 sm:p-4 rounded-2xl border border-white/20">
                <span className="font-black text-amber-300 block text-xs sm:text-sm mb-0.5">Umum (U)</span>
                <p className="text-xs sm:text-sm text-slate-200 font-medium">
                  Berlaku bagi seluruh peserta didik dan dewan guru yang terdaftar resmi di DPT.
                </p>
              </div>

              <div className="bg-white/10 hover:bg-white/15 transition-colors p-3.5 sm:p-4 rounded-2xl border border-white/20">
                <span className="font-black text-amber-300 block text-xs sm:text-sm mb-0.5">Bebas (B)</span>
                <p className="text-xs sm:text-sm text-slate-200 font-medium">
                  Setiap pemilih bebas menentukan pilihan sesuai hati nurani tanpa paksaan.
                </p>
              </div>

              <div className="bg-white/10 hover:bg-white/15 transition-colors p-3.5 sm:p-4 rounded-2xl border border-white/20">
                <span className="font-black text-amber-300 block text-xs sm:text-sm mb-0.5">Rahasia (R)</span>
                <p className="text-xs sm:text-sm text-slate-200 font-medium">
                  Pilihan suara dijamin kerahasiaannya dan tidak diketahui oleh siapa pun.
                </p>
              </div>

              <div className="bg-white/10 hover:bg-white/15 transition-colors p-3.5 sm:p-4 rounded-2xl border border-white/20">
                <span className="font-black text-amber-300 block text-xs sm:text-sm mb-0.5">Jujur (JUR)</span>
                <p className="text-xs sm:text-sm text-slate-200 font-medium">
                  Perhitungan suara dicatat secara matematis, transparan, dan tanpa manipulasi.
                </p>
              </div>

              <div className="bg-white/10 hover:bg-white/15 transition-colors p-3.5 sm:p-4 rounded-2xl border border-white/20">
                <span className="font-black text-amber-300 block text-xs sm:text-sm mb-0.5">Adil (DIL)</span>
                <p className="text-xs sm:text-sm text-slate-200 font-medium">
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
                <span>5 Langkah Mudah Memberikan Suara di Bilik Digital</span>
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
              <div className="flex gap-4 p-5 rounded-2xl bg-slate-50 border-2 border-slate-200 hover:border-blue-400 hover:bg-blue-50/40 transition-all shadow-xs">
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
                    Masukkan nomor identitas (NISN bagi siswa, atau NIP/NUPTK bagi guru) serta <strong>PIN 6-digit rahasia</strong> yang tertera pada Kartu Suara resmi Anda, atau scan QR code kartu melalui kamera bilik suara.
                  </p>
                </div>
              </div>

              {/* Langkah 2 */}
              <div className="flex gap-4 p-5 rounded-2xl bg-slate-50 border-2 border-slate-200 hover:border-blue-400 hover:bg-blue-50/40 transition-all shadow-xs">
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
                    Pelajari foto, visi, misi, dan program kerja unggulan calon Ketua & Wakil Ketua OSIS, lalu klik tombol <strong>"PILIH PASLON"</strong> pada kandidat terbaik pilihan Anda.
                  </p>
                </div>
              </div>

              {/* Langkah 3 */}
              <div className="flex gap-4 p-5 rounded-2xl bg-slate-50 border-2 border-slate-200 hover:border-blue-400 hover:bg-blue-50/40 transition-all shadow-xs">
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
                    Lanjutkan ke surat suara kedua untuk menentukan pasangan calon Ketua & Wakil Ketua Majelis Permusyawaratan Kelas (MPK) sebagai lembaga perwakilan dan pengawasan aspirasi siswa.
                  </p>
                </div>
              </div>

              {/* Langkah 4 */}
              <div className="flex gap-4 p-5 rounded-2xl bg-slate-50 border-2 border-slate-200 hover:border-blue-400 hover:bg-blue-50/40 transition-all shadow-xs">
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
                    Layar pratinjau akan menampilkan ringkasan pilihan OSIS & MPK Anda. Periksa kembali dengan teliti, kemudian klik <strong>"Konfirmasi & Kirim Suara"</strong>. Pilihan bersifat final dan langsung masuk ke kotak suara digital.
                  </p>
                </div>
              </div>

              {/* Langkah 5 */}
              <div
                className={`flex gap-4 p-5 rounded-2xl bg-emerald-50/70 border-2 border-emerald-300 hover:border-emerald-500 transition-all shadow-xs ${
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
                    Sistem menerbitkan struk verifikasi digital bertanda tangan kriptografis panitia, dan sesi Anda <strong>otomatis keluar seketika</strong> untuk mencegah penyalahgunaan hak suara oleh pihak lain.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Hal Penting & Bantuan TPS */}
          <div className="p-5 rounded-2xl bg-amber-50 border-2 border-amber-300 flex items-start gap-4">
            <div className="w-9 h-9 rounded-xl bg-amber-500 text-white flex items-center justify-center shrink-0 shadow-xs mt-0.5">
              <AlertCircle className="w-5 h-5" />
            </div>
            <div className="space-y-1">
              <h4 className="font-black text-amber-950 text-sm sm:text-base">
                Ketentuan Penting Bagi Pemilih:
              </h4>
              <p
                className={`text-amber-900 leading-relaxed font-medium ${
                  isFullscreen ? 'text-xs sm:text-sm' : 'text-xs sm:text-sm'
                }`}
              >
                Jaga kerahasiaan nomor PIN Anda dan jangan bagikan kepada siapapun. Apabila Kartu Suara hilang, rusak, atau PIN tidak dapat digunakan, segera melapor kepada <strong>Meja Operator TPS Panitia KPU OSIS</strong> di lokasi pemilihan dengan menunjukkan Kartu Pelajar atau Surat Tugas Guru.
              </p>
            </div>
          </div>
        </div>

        {/* Sticky Footer Bar */}
        <div
          className={`sticky bottom-0 bg-white/95 backdrop-blur-md border-t-2 border-slate-200 flex items-center justify-between z-20 shrink-0 ${
            isFullscreen ? 'px-6 sm:px-10 py-5 bg-slate-100' : 'px-6 py-4'
          }`}
        >
          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              className="px-5 py-2.5 text-xs sm:text-sm font-bold text-slate-700 hover:text-slate-950 hover:bg-slate-200/80 rounded-xl transition-colors cursor-pointer"
            >
              Tutup Panduan
            </button>

            {/* Quick fullscreen toggle button in footer */}
            <button
              onClick={handleToggleFullscreen}
              className="hidden sm:inline-flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-blue-700 px-3 py-2 rounded-lg transition-colors cursor-pointer"
            >
              {isFullscreen ? (
                <>
                  <Minimize2 className="w-4 h-4 text-slate-500" />
                  <span>Kecilkan Tampilan</span>
                </>
              ) : (
                <>
                  <Maximize2 className="w-4 h-4 text-slate-500" />
                  <span>Perbesar Layar Penuh</span>
                </>
              )}
            </button>
          </div>

          <button
            onClick={() => {
              if (isFullscreen && document.exitFullscreen && document.fullscreenElement) {
                document.exitFullscreen().catch(() => {});
              }
              onClose();
              onGoToVote();
            }}
            className="px-6 py-3 text-xs sm:text-sm font-black text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-md shadow-blue-600/30 transition-all flex items-center gap-2 cursor-pointer group"
          >
            <span>Buka Bilik Suara Sekarang</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
          </button>
        </div>
      </div>
    </div>
  );
};
