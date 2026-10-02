import React, { useState } from 'react';
import { useVoting } from '../context/VotingContext';
import { testConnection } from '../firebase/config';
import {
  Cloud,
  CloudOff,
  Database,
  CheckCircle2,
  AlertTriangle,
  X,
  ShieldCheck,
  Zap,
  Info,
  RefreshCw,
  UploadCloud,
  DownloadCloud,
  Lock,
} from 'lucide-react';

interface FirebaseConnectionModalProps {
  onClose: () => void;
}

export const FirebaseConnectionModal: React.FC<FirebaseConnectionModalProps> = ({ onClose }) => {
  const {
    isFirebaseEnabled,
    isFirebaseConnected,
    toggleFirebaseConnection,
    syncLocalDataToFirebase,
    fetchRemoteDataFromFirebase,
    candidates,
    voters,
    votes,
    periods,
  } = useVoting();

  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncActionMsg, setSyncActionMsg] = useState<{ success: boolean; text: string } | null>(null);

  const handleToggle = () => {
    toggleFirebaseConnection();
    setTestResult(null);
    setSyncActionMsg(null);
  };

  const handleTestConnection = async () => {
    setIsTesting(true);
    setTestResult(null);
    try {
      const ok = await testConnection();
      if (ok) {
        setTestResult({
          success: true,
          message: 'Koneksi ke Firebase Cloud Firestore responsif dan normal!',
        });
      } else {
        setTestResult({
          success: false,
          message: 'Gagal terhubung ke Firestore. Periksa koneksi internet Anda.',
        });
      }
    } catch {
      setTestResult({
        success: false,
        message: 'Gagal melakukan tes koneksi Firestore.',
      });
    } finally {
      setIsTesting(false);
    }
  };

  const handleManualUpload = async () => {
    if (!window.confirm('Unggah seluruh data lokal saat ini (DPT, Paslon, dan Suara) ke Firebase Cloud? Data di server akan diperbarui.')) {
      return;
    }
    setIsSyncing(true);
    setSyncActionMsg(null);
    try {
      const res = await syncLocalDataToFirebase();
      setSyncActionMsg({ success: res.success, text: res.message });
    } catch {
      setSyncActionMsg({ success: false, text: 'Terjadi kesalahan saat mengunggah data.' });
    } finally {
      setIsSyncing(false);
    }
  };

  const handleManualFetch = async () => {
    if (!window.confirm('Unduh data dari Cloud Firestore ke browser ini? Data lokal akan diperbarui dengan data dari server.')) {
      return;
    }
    setIsSyncing(true);
    setSyncActionMsg(null);
    try {
      const res = await fetchRemoteDataFromFirebase();
      setSyncActionMsg({ success: res.success, text: res.message });
    } catch {
      setSyncActionMsg({ success: false, text: 'Terjadi kesalahan saat mengunduh data.' });
    } finally {
      setIsSyncing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-2xl w-full p-5 sm:p-7 shadow-2xl border-2 border-slate-300 space-y-6 my-8 animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-start justify-between border-b border-slate-200 pb-4">
          <div>
            <div className="flex items-center gap-2">
              <span
                className={`text-xs font-black uppercase tracking-wider px-3 py-1 rounded-md border flex items-center gap-1.5 ${
                  isFirebaseEnabled
                    ? 'text-emerald-800 bg-emerald-100 border-emerald-300'
                    : 'text-amber-800 bg-amber-100 border-amber-300'
                }`}
              >
                {isFirebaseEnabled ? (
                  <>
                    <Cloud className="w-3.5 h-3.5 text-emerald-600" />
                    Cloud Firestore: ON
                  </>
                ) : (
                  <>
                    <CloudOff className="w-3.5 h-3.5 text-amber-600" />
                    Mode Uji Coba: OFF (Aman)
                  </>
                )}
              </span>
              <span className="text-xs font-bold text-slate-500">Sakelar Keamanan Database</span>
            </div>
            <h3 className="font-black text-slate-950 text-xl mt-2 flex items-center gap-2">
              <Database className="w-5 h-5 text-blue-600" />
              Kontrol Koneksi Firebase (ON / OFF)
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 font-medium mt-0.5">
              Atur status koneksi database untuk memastikan uji coba pemilu aman tanpa risiko merusak database cloud.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-slate-700 p-1.5 rounded-lg hover:bg-slate-100 cursor-pointer transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Big Switch Control */}
        <div
          className={`p-5 rounded-2xl border-2 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
            isFirebaseEnabled
              ? 'bg-emerald-50/80 border-emerald-300 shadow-xs'
              : 'bg-amber-50/80 border-amber-300 shadow-xs'
          }`}
        >
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-600 uppercase tracking-wide">
                Status Sistem:
              </span>
              <span
                className={`font-black text-xs sm:text-sm px-2.5 py-0.5 rounded-md ${
                  isFirebaseEnabled ? 'bg-emerald-200 text-emerald-950' : 'bg-amber-200 text-amber-950'
                }`}
              >
                {isFirebaseEnabled ? 'AKTIF (TERHUBUNG KE FIREBASE)' : 'NONAKTIF (MODE UJI COBA AMAN)'}
              </span>
            </div>
            <p className="text-xs font-medium text-slate-700 leading-relaxed max-w-md">
              {isFirebaseEnabled
                ? 'Aplikasi terhubung ke Cloud Firestore. Setiap suara yang dicoblos dan perubahan data akan langsung tersimpan di cloud database server.'
                : 'Aplikasi berjalan di mode Sandbox lokal. Anda bebas mencoba mencoblos, simulasi suara, atau menghapus suara tanpa memengaruhi database cloud.'}
            </p>
          </div>

          {/* Toggle Switch */}
          <div className="flex flex-col items-center sm:items-end gap-1.5 shrink-0">
            <button
              type="button"
              onClick={handleToggle}
              className={`relative inline-flex h-11 w-22 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-hidden ${
                isFirebaseEnabled ? 'bg-emerald-600 shadow-emerald-200 shadow-md' : 'bg-slate-400'
              }`}
            >
              <span className="sr-only">Toggle Firebase</span>
              <span
                className={`pointer-events-none inline-block h-10 w-10 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out flex items-center justify-center ${
                  isFirebaseEnabled ? 'translate-x-11 text-emerald-600' : 'translate-x-0 text-slate-500'
                }`}
              >
                {isFirebaseEnabled ? <Cloud className="w-5 h-5" /> : <CloudOff className="w-5 h-5" />}
              </span>
            </button>
            <span className="text-[11px] font-black tracking-wide text-slate-600">
              {isFirebaseEnabled ? 'KLIK UNTUK MATIKAN (OFF)' : 'KLIK UNTUK NYALAKAN (ON)'}
            </span>
          </div>
        </div>

        {/* Feature Comparison */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 text-xs">
          {/* Option A: Mode Sandbox (OFF) */}
          <div
            className={`p-4 rounded-2xl border-2 transition-all ${
              !isFirebaseEnabled
                ? 'border-amber-400 bg-amber-50/60 shadow-2xs ring-2 ring-amber-300/40'
                : 'border-slate-200 bg-slate-50 opacity-80'
            }`}
          >
            <div className="flex items-center gap-2 mb-2 font-black text-slate-900">
              <ShieldCheck className="w-4 h-4 text-amber-600" />
              <span>Mode Uji Coba Aman (Firebase OFF)</span>
              {!isFirebaseEnabled && (
                <span className="ml-auto text-[10px] font-black bg-amber-200 text-amber-900 px-1.5 py-0.5 rounded">
                  AKTIF SEKARANG
                </span>
              )}
            </div>
            <ul className="space-y-1.5 text-slate-600 font-medium">
              <li className="flex items-start gap-1.5">
                <span className="text-emerald-600 font-bold">✓</span>
                <span><strong>100% Terisolasi:</strong> Percobaan suara tidak akan terkirim ke server</span>
              </li>
              <li className="flex items-start gap-1.5">
                <span className="text-emerald-600 font-bold">✓</span>
                <span><strong>Bebas Simulasi:</strong> Cocok untuk latihan panitia, gladi bersih TPS, & coba reset suara</span>
              </li>
              <li className="flex items-start gap-1.5">
                <span className="text-emerald-600 font-bold">✓</span>
                <span><strong>Aman & Tanpa Beban:</strong> Mengurangi beban kuota dan mencegah data kotor</span>
              </li>
            </ul>
          </div>

          {/* Option B: Mode Online (ON) */}
          <div
            className={`p-4 rounded-2xl border-2 transition-all ${
              isFirebaseEnabled
                ? 'border-emerald-400 bg-emerald-50/60 shadow-2xs ring-2 ring-emerald-300/40'
                : 'border-slate-200 bg-slate-50 opacity-80'
            }`}
          >
            <div className="flex items-center gap-2 mb-2 font-black text-slate-900">
              <Zap className="w-4 h-4 text-emerald-600" />
              <span>Mode Cloud Firestore (Firebase ON)</span>
              {isFirebaseEnabled && (
                <span className="ml-auto text-[10px] font-black bg-emerald-200 text-emerald-900 px-1.5 py-0.5 rounded">
                  AKTIF SEKARANG
                </span>
              )}
            </div>
            <ul className="space-y-1.5 text-slate-600 font-medium">
              <li className="flex items-start gap-1.5">
                <span className="text-emerald-600 font-bold">✓</span>
                <span><strong>Sinkronisasi Real-Time:</strong> Bilik suara siswa, monitor Quick Count, & admin terhubung</span>
              </li>
              <li className="flex items-start gap-1.5">
                <span className="text-emerald-600 font-bold">✓</span>
                <span><strong>Database Terpusat:</strong> Suara tersimpan permanen di Google Cloud Firestore</span>
              </li>
              <li className="flex items-start gap-1.5">
                <span className="text-emerald-600 font-bold">✓</span>
                <span><strong>Wajib Saat Hari-H:</strong> Aktifkan sakelar ini saat pemungutan suara resmi dimulai</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Database Manual Synchronization (Upload / Download) */}
        <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-black text-slate-900 flex items-center gap-1.5">
              <RefreshCw className="w-3.5 h-3.5 text-blue-600" />
              Sinkronisasi Manual Data (Lokal ↔ Cloud)
            </span>
            <span className="text-[11px] text-slate-500 font-medium">
              {periods.length} Periode • {candidates.length} Paslon • {voters.length} DPT • {votes.length} Suara
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            <button
              type="button"
              onClick={handleManualUpload}
              disabled={isSyncing}
              className="px-3 py-2 bg-white hover:bg-blue-50 border border-slate-200 hover:border-blue-300 text-blue-900 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer shadow-2xs disabled:opacity-60"
            >
              <UploadCloud className="w-4 h-4 text-blue-600" />
              <span>Unggah Data Lokal ke Cloud</span>
            </button>

            <button
              type="button"
              onClick={handleManualFetch}
              disabled={isSyncing}
              className="px-3 py-2 bg-white hover:bg-slate-100 border border-slate-200 hover:border-slate-300 text-slate-800 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer shadow-2xs disabled:opacity-60"
            >
              <DownloadCloud className="w-4 h-4 text-slate-600" />
              <span>Unduh Data dari Cloud</span>
            </button>
          </div>

          {syncActionMsg && (
            <div
              className={`p-2.5 rounded-xl border text-xs font-bold flex items-center gap-2 ${
                syncActionMsg.success
                  ? 'bg-emerald-100 text-emerald-950 border-emerald-300'
                  : 'bg-rose-100 text-rose-950 border-rose-300'
              }`}
            >
              {syncActionMsg.success ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              ) : (
                <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
              )}
              <span>{syncActionMsg.text}</span>
            </div>
          )}
        </div>

        {/* Database Diagnostic & Info Box */}
        <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 space-y-2 text-xs">
          <div className="flex items-center justify-between text-slate-700 font-bold">
            <span className="flex items-center gap-1.5">
              <Info className="w-3.5 h-3.5 text-blue-600" />
              Status Diagnostik Server:
            </span>
            <span className="font-mono text-[11px] text-slate-500">
              Proyek: <strong>inspiring-dialect-4smzh</strong>
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] text-slate-600 font-medium">
            <div className="p-2 bg-white rounded-lg border border-slate-200 flex items-center justify-between">
              <div>
                <span className="text-slate-400 block text-[10px]">Status Koneksi:</span>
                <span className="font-bold text-slate-800">
                  {isFirebaseEnabled
                    ? isFirebaseConnected
                      ? '🟢 Terhubung (Live Real-time)'
                      : '🟡 Menginisialisasi...'
                    : '⚪ Nonaktif (Mode Uji Coba)'}
                </span>
              </div>
            </div>

            <div className="p-2 bg-white rounded-lg border border-slate-200 flex items-center justify-between">
              <div>
                <span className="text-slate-400 block text-[10px]">Tes Jangkauan Server:</span>
                <span className="font-bold text-slate-800">
                  {isTesting ? 'Menguji...' : 'Uji responsivitas'}
                </span>
              </div>
              <button
                type="button"
                onClick={handleTestConnection}
                disabled={isTesting}
                className="px-2.5 py-1 text-[11px] font-black rounded-lg bg-blue-50 text-blue-700 border border-blue-200 hover:bg-blue-100 transition-colors flex items-center gap-1 cursor-pointer"
              >
                <RefreshCw className={`w-3 h-3 ${isTesting ? 'animate-spin' : ''}`} />
                <span>Tes</span>
              </button>
            </div>
          </div>

          {testResult && (
            <div
              className={`p-2.5 rounded-xl border text-xs font-bold flex items-center gap-2 ${
                testResult.success
                  ? 'bg-emerald-100 text-emerald-950 border-emerald-300'
                  : 'bg-rose-100 text-rose-950 border-rose-300'
              }`}
            >
              {testResult.success ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              ) : (
                <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
              )}
              <span>{testResult.message}</span>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="pt-2 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-[11px] text-slate-500 font-medium">
            💡 <strong>Rekomendasi:</strong> Tetap aktifkan <strong>Mode Uji Coba (OFF)</strong> saat simulasi dan latihan panitia. Nyalakan <strong>Mode ON</strong> saat pemungutan suara resmi dibuka.
          </p>
          <button
            type="button"
            onClick={onClose}
            className="w-full sm:w-auto px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-black text-xs sm:text-sm rounded-xl cursor-pointer"
          >
            Selesai & Tutup
          </button>
        </div>
      </div>
    </div>
  );
};
