import React from 'react';
import { X, ShieldCheck, CheckCircle2, AlertCircle, FileCheck, Award } from 'lucide-react';

interface GuideModalProps {
  isOpen: boolean;
  onClose: () => void;
  onGoToVote: () => void;
}

export const GuideModal: React.FC<GuideModalProps> = ({ isOpen, onClose, onGoToVote }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-950/75 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border-2 border-slate-300 relative">
        {/* Header */}
        <div className="sticky top-0 bg-white/95 backdrop-blur-md px-6 py-4.5 border-b-2 border-slate-200 flex items-center justify-between z-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-800 flex items-center justify-center border border-blue-300">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-black text-slate-950 leading-tight">
                Tata Cara & Regulasi Pemilihan Digital
              </h2>
              <p className="text-xs sm:text-sm text-slate-700 font-semibold mt-0.5">
                SMKS PGRI 1 Kota Sukabumi • Prinsip LUBER JURDIL
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-500 hover:text-slate-950 hover:bg-slate-100 rounded-full transition-colors cursor-pointer"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 sm:p-8 space-y-7 text-slate-800">
          {/* Asas LUBER JURDIL */}
          <div className="p-5 rounded-2xl bg-linear-to-r from-blue-950 via-indigo-950 to-slate-950 text-white space-y-3 border-2 border-blue-900/60 shadow-md">
            <div className="flex items-center gap-2.5">
              <Award className="w-5 h-5 text-amber-400" />
              <h3 className="font-black text-amber-300 text-sm sm:text-base tracking-wide">
                ASAS LUBER & JURDIL
              </h3>
            </div>
            <p className="text-slate-200 leading-relaxed text-xs sm:text-sm font-medium">
              Sistem e-Voting ini dirancang untuk menjamin kerahasiaan pilihan Anda. Suara yang dimasukkan
              tidak dapat dilacak kembali ke identitas NISN pemilih, dan setiap siswa hanya memiliki hak 1 kali memilih (One-Time Access Token).
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 pt-2 text-xs sm:text-sm">
              <div className="bg-white/10 p-3 rounded-xl border border-white/20">
                <span className="font-black text-amber-300 block">Langsung (L)</span>
                Memberikan suara tanpa perantara.
              </div>
              <div className="bg-white/10 p-3 rounded-xl border border-white/20">
                <span className="font-black text-amber-300 block">Umum (U)</span>
                Berlaku untuk seluruh siswa di DPT.
              </div>
              <div className="bg-white/10 p-3 rounded-xl border border-white/20">
                <span className="font-black text-amber-300 block">Bebas (B)</span>
                Bebas memilih tanpa paksaan siapapun.
              </div>
              <div className="bg-white/10 p-3 rounded-xl border border-white/20">
                <span className="font-black text-amber-300 block">Rahasia (R)</span>
                Pilihan suara tidak diketahui orang lain.
              </div>
              <div className="bg-white/10 p-3 rounded-xl border border-white/20">
                <span className="font-black text-amber-300 block">Jujur (JUR)</span>
                Sistem transparan tanpa manipulasi.
              </div>
              <div className="bg-white/10 p-3 rounded-xl border border-white/20">
                <span className="font-black text-amber-300 block">Adil (DIL)</span>
                Setiap pemilih diperlakukan setara.
              </div>
            </div>
          </div>

          {/* 5 Tahapan Pemilihan */}
          <div className="space-y-3.5">
            <h3 className="font-black text-slate-950 text-sm sm:text-base flex items-center gap-2">
              <FileCheck className="w-5 h-5 text-blue-700" />
              Langkah Memberikan Suara di Bilik Digital
            </h3>

            <div className="space-y-3">
              <div className="flex gap-3.5 p-4 rounded-2xl bg-slate-50 border-2 border-slate-200">
                <div className="w-7 h-7 rounded-full bg-blue-700 text-white font-black flex items-center justify-center shrink-0 text-xs sm:text-sm">
                  1
                </div>
                <div>
                  <h4 className="font-black text-slate-950 text-sm">
                    Login Siswa (NISN & PIN 6 Digit)
                  </h4>
                  <p className="text-slate-700 text-xs sm:text-sm mt-1 leading-relaxed">
                    Masukkan NISN dan PIN 6-digit rahasia yang tertera pada Kartu Suara dari panitia kesiswaan.
                  </p>
                </div>
              </div>

              <div className="flex gap-3.5 p-4 rounded-2xl bg-slate-50 border-2 border-slate-200">
                <div className="w-7 h-7 rounded-full bg-blue-700 text-white font-black flex items-center justify-center shrink-0 text-xs sm:text-sm">
                  2
                </div>
                <div>
                  <h4 className="font-black text-slate-950 text-sm">
                    Surat Suara 1: Pilih Pasangan Calon OSIS
                  </h4>
                  <p className="text-slate-700 text-xs sm:text-sm mt-1 leading-relaxed">
                    Pelajari visi, misi, dan program kerja, lalu klik tombol "PILIH PASLON" pada kandidat pilihan Anda.
                  </p>
                </div>
              </div>

              <div className="flex gap-3.5 p-4 rounded-2xl bg-slate-50 border-2 border-slate-200">
                <div className="w-7 h-7 rounded-full bg-blue-700 text-white font-black flex items-center justify-center shrink-0 text-xs sm:text-sm">
                  3
                </div>
                <div>
                  <h4 className="font-black text-slate-950 text-sm">
                    Surat Suara 2: Pilih Pasangan Calon MPK
                  </h4>
                  <p className="text-slate-700 text-xs sm:text-sm mt-1 leading-relaxed">
                    Pilih pasangan calon Ketua & Wakil Ketua Majelis Permusyawaratan Kelas (MPK) untuk fungsi pengawasan legislatif siswa.
                  </p>
                </div>
              </div>

              <div className="flex gap-3.5 p-4 rounded-2xl bg-slate-50 border-2 border-slate-200">
                <div className="w-7 h-7 rounded-full bg-blue-700 text-white font-black flex items-center justify-center shrink-0 text-xs sm:text-sm">
                  4
                </div>
                <div>
                  <h4 className="font-black text-slate-950 text-sm">
                    Konfirmasi Akhir & Pengiriman Suara
                  </h4>
                  <p className="text-slate-700 text-xs sm:text-sm mt-1 leading-relaxed">
                    Periksa ringkasan pilihan Anda. Klik tombol "Konfirmasi & Kirim Suara". Pilihan bersifat FINAL dan tidak dapat diubah.
                  </p>
                </div>
              </div>

              <div className="flex gap-3.5 p-4 rounded-2xl bg-slate-50 border-2 border-slate-200">
                <div className="w-7 h-7 rounded-full bg-emerald-700 text-white font-black flex items-center justify-center shrink-0 text-xs sm:text-sm">
                  5
                </div>
                <div>
                  <h4 className="font-black text-slate-950 text-sm">
                    Tanda Terima Digital & Logout Otomatis
                  </h4>
                  <p className="text-slate-700 text-xs sm:text-sm mt-1 leading-relaxed">
                    Sistem menerbitkan struk verifikasi resmi dan sesi Anda langsung keluar seketika demi keamanan suara.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Hal Penting */}
          <div className="p-4 rounded-2xl bg-amber-50 border-2 border-amber-300 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
            <div>
              <h4 className="font-black text-amber-950 text-sm">Penting Diketahui:</h4>
              <p className="text-amber-900 mt-1 leading-relaxed text-xs sm:text-sm font-medium">
                Jika kehilangan kartu suara atau PIN tidak berfungsi, segera melapor ke Meja Operator TPS KPU OSIS di Ruang Multimedia dengan membawa Kartu Pelajar atau Surat Keterangan Wali Kelas.
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-white/95 backdrop-blur-md px-6 py-4.5 border-t-2 border-slate-200 flex items-center justify-between z-10">
          <button
            onClick={onClose}
            className="px-5 py-2.5 text-xs sm:text-sm font-bold text-slate-700 hover:text-slate-950 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
          >
            Tutup Panduan
          </button>
          <button
            onClick={() => {
              onClose();
              onGoToVote();
            }}
            className="px-6 py-2.5 text-xs sm:text-sm font-black text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-md transition-all cursor-pointer"
          >
            Buka Bilik Suara Sekarang
          </button>
        </div>
      </div>
    </div>
  );
};
