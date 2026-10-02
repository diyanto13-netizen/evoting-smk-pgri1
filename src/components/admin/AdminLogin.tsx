import React, { useState } from 'react';
import { useVoting } from '../../context/VotingContext';
import { PemilosLogo } from '../PemilosLogo';
import { Lock, KeyRound, User, ArrowRight, AlertCircle } from 'lucide-react';

interface AdminLoginProps {
  onSuccess: () => void;
}

export const AdminLogin: React.FC<AdminLoginProps> = ({ onSuccess }) => {
  const { loginAdmin } = useVoting();

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setIsLoading(true);

    setTimeout(() => {
      const res = loginAdmin(username, password);
      setIsLoading(false);

      if (res.success) {
        onSuccess();
      } else {
        setErrorMsg(res.message);
      }
    }, 350);
  };

  return (
    <div className="max-w-md mx-auto py-8 px-4">
      <div className="bg-white rounded-3xl border-2 border-slate-300 shadow-xl overflow-hidden">
        {/* Header */}
        <div className="bg-slate-950 p-7 text-white text-center">
          <div className="w-16 h-16 rounded-2xl bg-white p-1.5 flex items-center justify-center mx-auto mb-3.5 shadow-xl border-2 border-slate-700">
            <PemilosLogo className="w-13 h-13 drop-shadow-sm" />
          </div>
          <span className="text-xs font-black uppercase tracking-wider text-amber-300 bg-amber-950/80 px-3 py-1 rounded-md border border-amber-500/40 inline-block mb-2">
            Area Terbatas Panitia
          </span>
          <h1 className="text-xl sm:text-2xl font-black tracking-tight text-white">
            Portal Administrasi & Operator TPS
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 mt-1 font-medium">
            SMKS PGRI 1 Kota Sukabumi • Manajemen Pemilu Sekolah
          </p>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 sm:p-7 space-y-4.5">
          {errorMsg && (
            <div className="p-3.5 rounded-2xl bg-rose-50 border-2 border-rose-300 text-xs sm:text-sm text-rose-950 font-bold flex items-start gap-2.5">
              <AlertCircle className="w-5 h-5 text-rose-700 shrink-0 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
          )}

          <div>
            <label className="block text-xs sm:text-sm font-black text-slate-900 uppercase tracking-wide mb-1.5">
              Username Panitia
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                <User className="w-5 h-5" />
              </div>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="admin.kesiswaan"
                className="w-full pl-11 pr-4 py-3 rounded-2xl border-2 border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-blue-600 text-sm font-bold text-slate-950"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-xs sm:text-sm font-black text-slate-900 uppercase tracking-wide mb-1.5">
              Kata Sandi (Password)
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                <KeyRound className="w-5 h-5" />
              </div>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-11 pr-4 py-3 rounded-2xl border-2 border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-blue-600 text-sm font-bold text-slate-950"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3.5 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl text-xs sm:text-sm font-black shadow-md shadow-blue-600/30 transition-all flex items-center justify-center gap-2 cursor-pointer mt-2"
          >
            {isLoading ? (
              <div className="w-5 h-5 border-3 border-white border-t-transparent rounded-full animate-spin"></div>
            ) : (
              <>
                <span>Masuk ke Panel Kontrol</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};
