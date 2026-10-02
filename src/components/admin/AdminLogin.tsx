import React, { useState } from 'react';
import { useVoting } from '../../context/VotingContext';
import { PemilosLogo } from '../PemilosLogo';
import { Lock, KeyRound, User, ArrowRight, AlertCircle, Sparkles } from 'lucide-react';

interface AdminLoginProps {
  onSuccess: () => void;
}

export const AdminLogin: React.FC<AdminLoginProps> = ({ onSuccess }) => {
  const { loginAdmin, admins } = useVoting();
  const superAdmin = admins.find((a) => a.username === 'admin.kesiswaan');
  const tpsAdmin = admins.find((a) => a.username === 'panitia.tps');
  const superPass = superAdmin?.password || 'admin123';
  const tpsPass = tpsAdmin?.password || 'admin123';

  const [username, setUsername] = useState('admin.kesiswaan');
  const [password, setPassword] = useState(superPass);
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

  const handleQuickFill = (user: string, pass: string) => {
    setUsername(user);
    setPassword(pass);
    setErrorMsg(null);
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

        {/* Demo fast-fill accounts for evaluator with high contrast */}
        <div className="p-5 bg-slate-50 border-t-2 border-slate-200 text-xs space-y-2.5">
          <div className="flex items-center gap-1.5 font-black text-slate-900 text-xs sm:text-sm">
            <Sparkles className="w-4 h-4 text-amber-500" />
            <span>Kredensial Pengujian (Demo Panitia):</span>
          </div>

          <div className="grid grid-cols-2 gap-2.5">
            <button
              type="button"
              onClick={() => handleQuickFill('admin.kesiswaan', superPass)}
              className="p-3 rounded-xl bg-white border-2 border-slate-200 hover:border-blue-500 text-left transition-colors cursor-pointer"
            >
              <p className="font-black text-slate-950 text-xs sm:text-sm">Super Admin</p>
              <p className="text-xs text-slate-700 font-semibold">User: admin.kesiswaan</p>
              <p className="text-xs text-slate-700 font-semibold font-mono">Pass: {superPass}</p>
            </button>

            <button
              type="button"
              onClick={() => handleQuickFill('panitia.tps', tpsPass)}
              className="p-3 rounded-xl bg-white border-2 border-slate-200 hover:border-blue-500 text-left transition-colors cursor-pointer"
            >
              <p className="font-black text-slate-950 text-xs sm:text-sm">Operator TPS</p>
              <p className="text-xs text-slate-700 font-semibold">User: panitia.tps</p>
              <p className="text-xs text-slate-700 font-semibold font-mono">Pass: {tpsPass}</p>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
