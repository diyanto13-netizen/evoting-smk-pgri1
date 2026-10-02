import React from 'react';
import { Users, CheckCircle, Clock, PieChart } from 'lucide-react';

interface StatCardProps {
  totalDpt: number;
  totalVoted: number;
  participationRate: number;
  unvoted: number;
  tpsStatus: 'OPEN' | 'PAUSED' | 'CLOSED';
}

export const StatCard: React.FC<StatCardProps> = ({
  totalDpt,
  totalVoted,
  participationRate,
  unvoted,
}) => {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-5">
      {/* 1. Total DPT */}
      <div className="bg-white rounded-2xl p-4 sm:p-5 border-2 border-slate-200/90 shadow-xs hover:shadow-md transition-shadow relative overflow-hidden group">
        <div className="flex items-center justify-between">
          <span className="text-xs sm:text-sm font-bold text-slate-700 uppercase tracking-wide">
            Total DPT Siswa
          </span>
          <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center group-hover:scale-110 transition-transform">
            <Users className="w-5 h-5" />
          </div>
        </div>
        <div className="mt-2.5">
          <div className="text-2xl sm:text-3xl lg:text-4xl font-black text-slate-950 tracking-tight">
            {totalDpt.toLocaleString('id-ID')}
          </div>
          <p className="text-xs sm:text-sm text-slate-600 mt-1 font-medium">
            Hak suara terverifikasi resmi
          </p>
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-1.5 bg-blue-600"></div>
      </div>

      {/* 2. Suara Masuk */}
      <div className="bg-white rounded-2xl p-4 sm:p-5 border-2 border-slate-200/90 shadow-xs hover:shadow-md transition-shadow relative overflow-hidden group">
        <div className="flex items-center justify-between">
          <span className="text-xs sm:text-sm font-bold text-slate-700 uppercase tracking-wide">
            Suara Sah Masuk
          </span>
          <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center group-hover:scale-110 transition-transform">
            <CheckCircle className="w-5 h-5" />
          </div>
        </div>
        <div className="mt-2.5">
          <div className="text-2xl sm:text-3xl lg:text-4xl font-black text-emerald-700 tracking-tight">
            {totalVoted.toLocaleString('id-ID')}
          </div>
          <p className="text-xs sm:text-sm text-slate-600 mt-1 font-medium">
            Tercatat di kotak suara digital
          </p>
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-1.5 bg-emerald-600"></div>
      </div>

      {/* 3. Persentase Partisipasi */}
      <div className="bg-white rounded-2xl p-4 sm:p-5 border-2 border-slate-200/90 shadow-xs hover:shadow-md transition-shadow relative overflow-hidden group">
        <div className="flex items-center justify-between">
          <span className="text-xs sm:text-sm font-bold text-slate-700 uppercase tracking-wide">
            Partisipasi Pemilih
          </span>
          <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-indigo-100 text-indigo-800 flex items-center justify-center group-hover:scale-110 transition-transform">
            <PieChart className="w-5 h-5" />
          </div>
        </div>
        <div className="mt-2.5">
          <div className="text-2xl sm:text-3xl lg:text-4xl font-black text-indigo-700 tracking-tight">
            {participationRate.toFixed(1)}%
          </div>
          <div className="w-full bg-slate-200 rounded-full h-2 mt-2.5 overflow-hidden">
            <div
              className="bg-indigo-600 h-2 rounded-full transition-all duration-700"
              style={{ width: `${Math.min(participationRate, 100)}%` }}
            ></div>
          </div>
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-1.5 bg-indigo-600"></div>
      </div>

      {/* 4. Suara Belum Masuk */}
      <div className="bg-white rounded-2xl p-4 sm:p-5 border-2 border-slate-200/90 shadow-xs hover:shadow-md transition-shadow relative overflow-hidden group">
        <div className="flex items-center justify-between">
          <span className="text-xs sm:text-sm font-bold text-slate-700 uppercase tracking-wide">
            Belum Menggunakan Hak
          </span>
          <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-amber-100 text-amber-900 flex items-center justify-center group-hover:scale-110 transition-transform">
            <Clock className="w-5 h-5" />
          </div>
        </div>
        <div className="mt-2.5">
          <div className="text-2xl sm:text-3xl lg:text-4xl font-black text-amber-800 tracking-tight">
            {unvoted.toLocaleString('id-ID')}
          </div>
          <p className="text-xs sm:text-sm text-slate-600 mt-1 font-medium">
            Siswa ditunggu di bilik suara
          </p>
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-1.5 bg-amber-500"></div>
      </div>
    </div>
  );
};
