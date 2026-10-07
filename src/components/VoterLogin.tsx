import React, { useState, useRef, useEffect } from 'react';
import { useVoting } from '../context/VotingContext';
import { PemilosLogo } from './PemilosLogo';
import { VoterQRScanner } from './VoterQRScanner';
import {
  Vote,
  KeyRound,
  ShieldCheck,
  AlertCircle,
  QrCode,
  ArrowRight,
  HelpCircle,
  Eye,
  EyeOff,
  Zap,
  Delete,
  RotateCcw,
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

  // Fast 6-Digit Token state
  const [token, setToken] = useState('');
  const [showToken, setShowToken] = useState(false);

  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'token' | 'qr'>('token');

  const tokenInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (activeTab === 'token') {
      tokenInputRef.current?.focus();
    }
  }, [activeTab]);

  const handleQRScanSuccess = (scannedNisn: string, scannedPin: string) => {
    setErrorMsg(null);
    setIsLoading(true);

    setTimeout(() => {
      const res = loginVoter(scannedNisn, scannedPin);
      setIsLoading(false);
      if (res.success) {
        onSuccessLogin();
      } else {
        setErrorMsg(res.message);
        setActiveTab('token');
      }
    }, 400);
  };

  // Submit via Fast 6-Digit Token
  const handleTokenSubmit = (e?: React.FormEvent, customToken?: string) => {
    if (e) e.preventDefault();
    const tokenToSubmit = (customToken !== undefined ? customToken : token).trim();

    if (tokenToSubmit.length !== 6) {
      setErrorMsg('Token bilik suara harus berupa 6 digit angka.');
      return;
    }

    setErrorMsg(null);
    setIsLoading(true);

    setTimeout(() => {
      const res = loginVoter(tokenToSubmit);
      setIsLoading(false);

      if (res.success) {
        onSuccessLogin();
      } else {
        setErrorMsg(res.message);
      }
    }, 350);
  };

  // Virtual Keypad click handler for Touchscreens / Tablets
  const handleKeypadPress = (num: string) => {
    if (token.length < 6) {
      const nextToken = token + num;
      setToken(nextToken);
      setErrorMsg(null);
    }
  };

  const handleKeypadBackspace = () => {
    setToken((prev) => prev.slice(0, -1));
    setErrorMsg(null);
  };

  const handleKeypadClear = () => {
    setToken('');
    setErrorMsg(null);
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
          <span className="text-xs font-black uppercase tracking-wider text-blue-200 bg-blue-950/80 px-3.5 py-1.5 rounded-full border border-blue-400/40 inline-flex items-center gap-1.5 mb-2.5">
            <Zap className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
            <span>Bilik Suara Digital (Voter Chamber)</span>
          </span>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight leading-tight">
            Masuk ke Bilik Suara
          </h1>
          <p className="text-xs sm:text-sm text-blue-100 font-medium mt-1.5 max-w-md mx-auto leading-relaxed">
            Ketik <strong>6-digit Token / PIN</strong> pada kartu suara Anda untuk langsung membuka surat suara
          </p>

          {/* TPS Status badge */}
          {activePeriod && (
            <div className="mt-4 inline-flex items-center gap-2 text-xs font-bold bg-white/20 px-3.5 py-1 rounded-full backdrop-blur-md border border-white/20">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></span>
              <span>Periode Pemilihan: <strong>{activePeriod.academicYear}</strong></span>
            </div>
          )}
        </div>

        {/* Tab Selection: Fast Token vs Scan QR */}
        <div className="flex border-b-2 border-slate-200 bg-slate-100 text-xs sm:text-sm font-extrabold">
          <button
            type="button"
            onClick={() => setActiveTab('token')}
            className={`flex-1 py-3.5 text-center border-b-3 transition-all flex items-center justify-center gap-2 cursor-pointer ${
              activeTab === 'token'
                ? 'border-blue-600 text-blue-800 bg-white font-black'
                : 'border-transparent text-slate-700 hover:text-slate-950'
            }`}
          >
            <KeyRound className="w-4 h-4 text-blue-600" />
            <span>Ketik 6 Digit PIN (Cepat)</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('qr')}
            className={`flex-1 py-3.5 text-center border-b-3 transition-all flex items-center justify-center gap-2 cursor-pointer ${
              activeTab === 'qr'
                ? 'border-blue-600 text-blue-800 bg-white font-black'
                : 'border-transparent text-slate-700 hover:text-slate-950'
            }`}
          >
            <QrCode className="w-4 h-4 text-blue-600" />
            <span>Scan QR Kartu</span>
          </button>
        </div>

        {/* Form Body */}
        <div className="p-5 sm:p-7">
          {errorMsg && (
            <div className="mb-5 p-4 rounded-2xl bg-rose-50 border-2 border-rose-300 flex items-start gap-3.5 animate-in fade-in duration-200">
              <AlertCircle className="w-6 h-6 text-rose-700 shrink-0 mt-0.5" />
              <div className="text-xs sm:text-sm text-rose-950">
                <p className="font-black text-sm">Akses Ditolak:</p>
                <p className="mt-1 font-semibold leading-relaxed">{errorMsg}</p>
              </div>
            </div>
          )}

          {/* MODE 1: FAST 6-DIGIT TOKEN ONLY (DEFAULT - REKOMENDASI CEPAT) */}
          {activeTab === 'token' && (
            <form onSubmit={handleTokenSubmit} className="space-y-5">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-xs sm:text-sm font-black text-slate-900 uppercase tracking-wide">
                    Masukkan 6-Digit PIN Rahasia Pemilih
                  </label>
                  <button
                    type="button"
                    onClick={onOpenGuide}
                    className="text-xs font-bold text-blue-700 hover:text-blue-900 flex items-center gap-1 cursor-pointer"
                  >
                    <HelpCircle className="w-3.5 h-3.5" />
                    <span>Di mana letak PIN?</span>
                  </button>
                </div>

                {/* Main 6-Digit Large Box Display */}
                <div className="relative">
                  <input
                    ref={tokenInputRef}
                    type={showToken ? 'text' : 'password'}
                    inputMode="numeric"
                    pattern="[0-9]*"
                    maxLength={6}
                    value={token}
                    onChange={(e) => {
                      const digits = e.target.value.replace(/\D/g, '').slice(0, 6);
                      setToken(digits);
                      setErrorMsg(null);
                    }}
                    placeholder="• • • • • •"
                    className="w-full text-center py-4 px-4 rounded-2xl border-2 border-blue-400 focus:outline-hidden focus:ring-4 focus:ring-blue-600/30 focus:border-blue-700 text-2xl sm:text-3xl font-mono font-black tracking-[0.35em] text-slate-950 transition-all bg-blue-50/40 focus:bg-white shadow-inner"
                    autoFocus
                    required
                  />

                  {/* Toggle Show / Hide Password Icon */}
                  <div className="absolute inset-y-0 right-0 pr-3.5 flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setShowToken(!showToken)}
                      className="p-1.5 text-slate-500 hover:text-slate-950 rounded-lg cursor-pointer transition-colors"
                      title={showToken ? 'Sembunyikan PIN' : 'Tampilkan PIN'}
                    >
                      {showToken ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>

                {/* 6 Digit Visual Slots */}
                <div className="flex items-center justify-center gap-2.5 mt-3">
                  {[0, 1, 2, 3, 4, 5].map((index) => {
                    const digit = token[index];
                    return (
                      <div
                        key={index}
                        className={`w-9 h-11 sm:w-11 sm:h-13 rounded-xl border-2 flex items-center justify-center font-mono font-black text-lg sm:text-xl transition-all ${
                          digit
                            ? 'border-blue-600 bg-blue-600 text-white shadow-xs'
                            : 'border-slate-300 bg-slate-100 text-slate-400'
                        }`}
                      >
                        {digit ? (showToken ? digit : '●') : ''}
                      </div>
                    );
                  })}
                </div>

                <p className="text-center text-xs text-slate-600 mt-2 font-medium">
                  Cukup ketikkan 6 digit angka yang ada di kartu suara. Tidak perlu ketik NISN.
                </p>
              </div>

              {/* Touchscreen Virtual Keypad (Sangat praktis untuk layar sentuh / tablet / HP di bilik TPS) */}
              <div className="pt-1">
                <div className="max-w-xs mx-auto grid grid-cols-3 gap-2">
                  {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((num) => (
                    <button
                      key={num}
                      type="button"
                      onClick={() => handleKeypadPress(num)}
                      className="h-12 rounded-xl bg-slate-100 hover:bg-slate-200 active:bg-blue-600 active:text-white border border-slate-300 font-mono font-black text-lg text-slate-900 transition-all flex items-center justify-center cursor-pointer shadow-2xs hover:shadow-xs"
                    >
                      {num}
                    </button>
                  ))}
                  <button
                    type="button"
                    onClick={handleKeypadClear}
                    className="h-12 rounded-xl bg-slate-200/80 hover:bg-slate-300 text-slate-700 font-bold text-xs transition-all flex items-center justify-center gap-1 cursor-pointer"
                    title="Hapus semua angka"
                  >
                    <RotateCcw className="w-4 h-4" />
                    <span>Reset</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleKeypadPress('0')}
                    className="h-12 rounded-xl bg-slate-100 hover:bg-slate-200 active:bg-blue-600 active:text-white border border-slate-300 font-mono font-black text-lg text-slate-900 transition-all flex items-center justify-center cursor-pointer shadow-2xs hover:shadow-xs"
                  >
                    0
                  </button>
                  <button
                    type="button"
                    onClick={handleKeypadBackspace}
                    className="h-12 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-300 font-bold text-xs transition-all flex items-center justify-center gap-1 cursor-pointer"
                    title="Hapus satu angka"
                  >
                    <Delete className="w-4 h-4 text-rose-600" />
                    <span>Hapus</span>
                  </button>
                </div>
              </div>

              {/* Submit Button */}
              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isLoading || token.length !== 6}
                  className="w-full py-4 px-6 rounded-2xl bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 disabled:text-slate-500 text-white font-black text-base shadow-md shadow-blue-600/30 hover:shadow-lg transition-all flex items-center justify-center gap-2.5 cursor-pointer disabled:cursor-not-allowed"
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
          )}

          {/* MODE 2: SCAN QR FROM CARD */}
          {activeTab === 'qr' && (
            <div className="py-2">
              <VoterQRScanner
                onScanSuccess={handleQRScanSuccess}
                onSwitchToManual={() => setActiveTab('token')}
              />
            </div>
          )}
        </div>

        {/* Security Footer Notice */}
        <div className="bg-slate-100 p-4 sm:p-5 border-t-2 border-slate-200 flex items-center gap-3 text-xs sm:text-sm text-slate-700 font-medium">
          <ShieldCheck className="w-6 h-6 text-emerald-700 shrink-0" />
          <p className="leading-relaxed">
            Sistem e-Voting SMKS PGRI 1 Sukabumi menjamin asas <strong>LUBER JURDIL</strong>.
            Token PIN bersifat sekali pakai dan hangus otomatis setelah hak suara digunakan.
          </p>
        </div>
      </div>
    </div>
  );
};
