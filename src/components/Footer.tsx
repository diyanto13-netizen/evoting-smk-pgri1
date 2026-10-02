import React from 'react';
import { ShieldCheck, Heart, MapPin, Phone, Mail, Award, Lock } from 'lucide-react';

interface FooterProps {
  onOpenGuide: () => void;
  onOpenAdmin: () => void;
}

export const Footer: React.FC<FooterProps> = ({ onOpenGuide, onOpenAdmin }) => {
  return (
    <footer className="bg-slate-950 text-slate-200 pt-12 pb-8 border-t-2 border-slate-800 mt-auto font-sans">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 pb-8 border-b border-slate-800">
          {/* Column 1: School Identity */}
          <div className="md:col-span-2 space-y-3.5">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-xl bg-blue-700 flex items-center justify-center text-white font-bold shadow-md border border-blue-500">
                <Award className="w-6 h-6 text-amber-300" />
              </div>
              <div>
                <h3 className="text-white font-black text-base sm:text-lg leading-tight">
                  SMKS PGRI 1 KOTA SUKABUMI
                </h3>
                <p className="text-xs sm:text-sm text-blue-300 font-bold">
                  Sistem Pemilihan Umum OSIS & MPK Digital (e-Voting)
                </p>
              </div>
            </div>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed max-w-md font-normal">
              Aplikasi pemilihan digital resmi yang dirancang untuk mewujudkan demokrasi sekolah
              yang modern, cepat, transparan, dan terpercaya berlandaskan asas LUBER JURDIL
              (Langsung, Umum, Bebas, Rahasia, Jujur, dan Adil).
            </p>
            <div className="flex flex-wrap gap-2 pt-2">
              <span className="inline-flex items-center gap-1.5 text-xs font-bold bg-slate-800 text-blue-200 px-3 py-1 rounded-lg border border-slate-700">
                <Lock className="w-3.5 h-3.5 text-emerald-400" />
                Data Suara Terenkripsi LUBER
              </span>
              <span className="inline-flex items-center gap-1.5 text-xs font-bold bg-slate-800 text-amber-200 px-3 py-1 rounded-lg border border-slate-700">
                <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
                Anti-Kecurangan & One-Time PIN
              </span>
            </div>
          </div>

          {/* Column 2: School Contact */}
          <div className="space-y-3 text-xs sm:text-sm">
            <h4 className="text-white font-black uppercase tracking-wider text-xs sm:text-sm border-b border-slate-800 pb-2">
              Kontak Sekolah & TPS
            </h4>
            <ul className="space-y-2.5 text-slate-300">
              <li className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
                <span className="leading-snug">Jl. Pelabuhan II perum Cipoho Indah, Cikondang, Kec. Citamiang, Kota Sukabumi 43142</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Phone className="w-4 h-4 text-blue-400 shrink-0" />
                <span>(0266) 224277 / Posko Kesiswaan</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Mail className="w-4 h-4 text-blue-400 shrink-0" />
                <span>smkpone@smkspgri1smi.sch.id</span>
              </li>
            </ul>
          </div>

          {/* Column 3: Quick Links */}
          <div className="space-y-3 text-xs sm:text-sm">
            <h4 className="text-white font-black uppercase tracking-wider text-xs sm:text-sm border-b border-slate-800 pb-2">
              Pusat Informasi
            </h4>
            <ul className="space-y-2 text-slate-300">
              <li>
                <button
                  onClick={onOpenGuide}
                  className="text-slate-300 hover:text-white font-medium transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  <span className="text-blue-400 font-bold">›</span> Tata Cara Memberikan Suara
                </button>
              </li>
              <li>
                <button
                  onClick={onOpenGuide}
                  className="text-slate-300 hover:text-white font-medium transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  <span className="text-blue-400 font-bold">›</span> Syarat & Hak Pilih DPT
                </button>
              </li>
              <li>
                <button
                  onClick={onOpenAdmin}
                  className="text-slate-300 hover:text-white font-medium transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  <span className="text-blue-400 font-bold">›</span> Portal Panitia & Operator TPS
                </button>
              </li>
              <li>
                <span className="text-slate-400 flex items-center gap-1.5">
                  <span className="text-slate-600">›</span> Standar ISO 27001 Keamanan Suara
                </span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom copyright row */}
        <div className="pt-6 flex flex-col sm:flex-row justify-between items-center text-xs sm:text-sm text-slate-400 gap-3">
          <p>
            © {new Date().getFullYear()} Komisi Pemilihan OSIS-MPK SMKS PGRI 1 Kota Sukabumi.
          </p>
          <p className="flex items-center gap-1 text-slate-300 font-medium">
            Dibangun untuk Demokrasi Vokasi Indonesia
            <Heart className="w-4 h-4 text-rose-500 fill-rose-500 inline ml-1" />
          </p>
        </div>
      </div>
    </footer>
  );
};
