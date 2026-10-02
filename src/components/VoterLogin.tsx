import React, { useState } from 'react';
import { useVoting } from '../context/VotingContext';
import { PemilosLogo } from './PemilosLogo';
import { VoterQRScanner } from './VoterQRScanner';
import {
  Vote,
  KeyRound,
  User,
  ShieldCheck,
  AlertCircle,
  QrCode,
  ArrowRight,
  HelpCircle,
  Eye,
  EyeOff,
} from 'lucide-react';

interface VoterLoginProps {
  onSuccessLogin: () => void;
  onOpenGuide: () => void;
}

export const VoterLogin: React.FC<VoterLoginProps> = ({
  onSuccessLogin,
  onOpenGuide,
}) => {
  const { loginVoter, activePeriod } = useVoting();

  const [nisn, setNisn] = useState('');
  const [pin, setPin] = useState('');
  const [showPin, setShowPin] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'manual' | 'qr'>('manual');

  const handleQRScanSuccess = (scannedNisn: string, scannedPin: string) => {
    setNisn(scannedNisn);
    setPin(scannedPin);
    setErrorMsg(null);
    setIsLoading(true);

    setTimeout(() => {
      const res = loginVoter(scannedNisn, scannedPin);
      setIsLoading(false);
      if (res.success) {
        onSuccessLogin();
      } else {
        setErrorMsg(res.message);
        setActiveTab('manual');
      }
    }, 400);
  };

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setErrorMsg(null);
    setIsLoading(true);

    setTimeout(() => {
      const res = loginVoter(nisn, pin);
      setIsLoading(false);

      if (res.success) {
        onSuccessLogin();
      } else {
        setErrorMsg(res.message);
      }
    }, 350);
  };

  return (
    <div className="max-w-xl mx-auto py-4 sm:py-8 px-2 sm:px-4">
      {/* Top Banner Card */}
      <div className="bg-white rounded-3xl border-2 border-slate-300 shadow-xl overflow-hidden">
        {/* Header */}
        <div className="bg-linear-to-r from-blue-950 via-blue-900 to-indigo-950 p-6 sm:p-8 text-white text-center relative">
          <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-white p-1.5 flex items-center justify-center mx-auto mb-3.5 shadow-xl border-2 border-white/40">
            <PemilosLogo className="w-13 h-13 sm:w-16 sm:h-16 drop-shadow-sm" />
          </div>
          <span className="text-xs font-black uppercase tracking-wider text-blue-200 bg-blue-950/80 px-3.5 py-1.5 rounded-full border border-blue-400/40 inline-block mb-2.5">
            Bilik Suara Digital (Voter Chamber)
          </span>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight leading-tight">
            Masuk ke Bilik Suara Digital
          </h1>
          <p className="text-xs sm:text-sm text-blue-100 font-medium mt-1.5 max-w-md mx-auto leading-relaxed">
            Masukkan Nomor Identitas (NISN Siswa / NIP Guru) dan PIN 6-digit rahasia pada Kartu Suara Anda
          </p>

          {/* TPS Status badge */}
          {activePeriod && (
            <div className="mt-4 inline-flex items-center gap-2 text-xs font-bold bg-white/20 px-3.5 py-1 rounded-full backdrop-blur-md border border-white/20">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400"></span>
              <span>Periode Pemilihan: <strong>{activePeriod.academicYear}</strong></span>
            </div>
          )}
        </div>

        {/* Tab Selection: Manual vs Scan QR */}
        <div className="flex border-b-2 border-slate-200 bg-slate-100 text-xs sm:text-sm font-extrabold">
          <button
            onClick={() => setActiveTab('manual')}
            className={`flex-1 py-3.5 text-center border-b-3 transition-all flex items-center justify-center gap-2 cursor-pointer ${
              activeTab === 'manual'
                ? 'border-blue-600 text-blue-800 bg-white'
                : 'border-transparent text-slate-700 hover:text-slate-950'
            }`}
          >
            <KeyRound className="w-4 h-4 text-blue-600" />
            Input NISN / NIP & PIN
          </button>
          <button
            onClick={() => setActiveTab('qr')}
            className={`flex-1 py-3.5 text-center border-b-3 transition-all flex items-center justify-center gap-2 cursor-pointer ${
              activeTab === 'qr'
                ? 'border-blue-600 text-blue-800 bg-white'
                : 'border-transparent text-slate-700 hover:text-slate-950'
            }`}
          >
            <QrCode className="w-4 h-4 text-blue-600" />
            Scan QR Kartu Pemilih
          </button>
        </div>

        {/* Form Body */}
        <div className="p-6 sm:p-8">
          {errorMsg && (
            <div className="mb-6 p-4 rounded-2xl bg-rose-50 border-2 border-rose-300 flex items-start gap-3.5 animate-in fade-in duration-200">
              <AlertCircle className="w-6 h-6 text-rose-700 shrink-0 mt-0.5" />
              <div className="text-xs sm:text-sm text-rose-950">
                <p className="font-black text-sm">Akses Ditolak:</p>
                <p className="mt-1 font-semibold leading-relaxed">{errorMsg}</p>
              </div>
            </div>
          )}

          {activeTab === 'manual' ? (
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* NISN / NIP Input */}
              <div>
                <label className="block text-xs sm:text-sm font-black text-slate-900 uppercase tracking-wide mb-2">
                  Nomor Identitas Pemilih (NISN / NIP)
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-500">
                    <User className="w-5 h-5" />
                  </div>
                  <input
                    type="text"
                    maxLength={20}
                    value={nisn}
                    onChange={(e) => setNisn(e.target.value.trim())}
                    placeholder="Contoh: 0071234561 (NISN) atau 1985... (NIP)"
                    className="w-full pl-12 pr-4 py-3.5 rounded-2xl border-2 border-slate-300 focus:outline-hidden focus:ring-3 focus:ring-blue-600 focus:border-blue-600 text-base sm:text-lg font-bold tracking-wider text-slate-950 transition-all placeholder:font-normal placeholder:tracking-normal placeholder:text-slate-400 bg-slate-50 focus:bg-white"
                    required
                  />
                </div>
                <p className="text-xs text-slate-600 mt-1.5 font-medium">
                  Siswa: Masukkan 10 digit NISN • Dewan Guru/Tendik: Masukkan NIP, NUPTK, atau Kode Guru terdaftar.
                </p>
              </div>

              {/* PIN Input */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-xs sm:text-sm font-black text-slate-900 uppercase tracking-wide">
                    PIN Keamanan (6 Digit)
                  </label>
                  <button
                    type="button"
                    onClick={onOpenGuide}
                    className="text-xs font-bold text-blue-700 hover:text-blue-900 flex items-center gap-1 cursor-pointer"
                  >
                    <HelpCircle className="w-3.5 h-3.5" />
                    Bantuan PIN?
                  </button>
                </div>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-500">
                    <KeyRound className="w-5 h-5" />
                  </div>
                  <input
                    type={showPin ? 'text' : 'password'}
                    inputMode="numeric"
                    maxLength={6}
                    value={pin}
                    onChange={(e) => setPin(e.target.value.replace(/\D/g, ''))}
                    placeholder="6 digit angka pada kartu suara"
                    className="w-full pl-12 pr-24 py-3.5 rounded-2xl border-2 border-slate-300 focus:outline-hidden focus:ring-3 focus:ring-blue-600 focus:border-blue-600 text-base sm:text-lg font-bold tracking-widest text-slate-950 transition-all placeholder:font-normal placeholder:tracking-normal placeholder:text-slate-400 bg-slate-50 focus:bg-white"
                    required
                  />
                  <div className="absolute inset-y-0 right-0 pr-3.5 flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setShowPin(!showPin)}
                      className="p-1.5 text-slate-600 hover:text-slate-950 rounded-lg cursor-pointer"
                      title={showPin ? 'Sembunyikan PIN' : 'Tampilkan PIN'}
                    >
                      {showPin ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                    <span className="text-xs sm:text-sm font-mono font-bold text-slate-500">
                      {pin.length}/6
                    </span>
                  </div>
                </div>
                <p className="text-xs text-slate-600 mt-1.5 font-medium">
                  PIN bersifat sekali pakai (One-Time Access) dan hangus otomatis setelah memilih.
                </p>
              </div>

              {/* Submit Button */}
              <div className="pt-3">
                <button
                  type="submit"
                  disabled={isLoading || nisn.length < 10 || pin.length < 6}
                  className="w-full py-4 px-6 rounded-2xl bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 disabled:text-slate-500 text-white font-black text-sm sm:text-base shadow-md shadow-blue-600/30 hover:shadow-lg transition-all flex items-center justify-center gap-2.5 cursor-pointer disabled:cursor-not-allowed"
                >
                  {isLoading ? (
                    <div className="w-5 h-5 border-3 border-white border-t-transparent rounded-full animate-spin"></div>
                  ) : (
                    <>
                      <span>Masuk ke Bilik Suara</span>
                      <ArrowRight className="w-5 h-5" />
                    </>
                  )}
                </button>
              </div>
            </form>
          ) : (
            /* Active Live Camera QR Code Scanner */
            <div className="py-2">
              <VoterQRScanner
                onScanSuccess={handleQRScanSuccess}
                onSwitchToManual={() => setActiveTab('manual')}
              />
            </div>
          )}
        </div>

        {/* Security Footer Notice */}
        <div className="bg-slate-100 p-4 sm:p-5 border-t-2 border-slate-200 flex items-center gap-3 text-xs sm:text-sm text-slate-700 font-medium">
          <ShieldCheck className="w-6 h-6 text-emerald-700 shrink-0" />
          <p className="leading-relaxed">
            Sistem e-Voting SMKS PGRI 1 Sukabumi menjamin asas <strong>LUBER</strong>.
            Pilihan Anda di bilik suara bersifat rahasia dan tidak dapat dilihat oleh siapapun.
          </p>
        </div>
      </div>
    </div>
  );
};
