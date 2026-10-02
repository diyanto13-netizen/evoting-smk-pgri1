import React, { useState } from 'react';
import { useVoting } from '../../context/VotingContext';
import { Period, TPSStatus } from '../../types/voting';
import {
  Calendar,
  Plus,
  CheckCircle2,
  Clock,
  Lock,
  Eye,
  Archive,
  Power,
  AlertTriangle,
  Radio,
} from 'lucide-react';

export const PeriodManager: React.FC = () => {
  const {
    periods,
    activePeriodId,
    setActivePeriodId,
    createPeriod,
    updatePeriodStatus,
    toggleResultPublished,
  } = useVoting();

  const [showAddModal, setShowAddModal] = useState(false);
  const [academicYear, setAcademicYear] = useState('2027/2028');
  const [title, setTitle] = useState('Pemilihan Umum OSIS & MPK Periode 2027/2028');
  const [description, setDescription] = useState('Pemilihan serentak pengurus OSIS dan MPK periode tahun ajaran baru.');

  const handleCreatePeriod = (e: React.FormEvent) => {
    e.preventDefault();
    if (!academicYear || !title) return;

    createPeriod({
      academicYear,
      title,
      description,
      isActive: false,
      status: 'OPEN',
      isResultPublished: true,
      startTime: new Date().toISOString(),
      endTime: new Date(Date.now() + 86400000).toISOString(),
    });

    setShowAddModal(false);
    setAcademicYear('');
    setTitle('');
    setDescription('');
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-slate-900">
            Manajemen Periode & Tahun Ajaran
          </h2>
          <p className="text-xs text-slate-500">
            Kelola tahun pemilihan aktif, kontrol status bilik suara, dan akses arsip periode lampau
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-xs transition-colors flex items-center gap-1.5 self-start sm:self-auto cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          Tambah Tahun Periode Baru
        </button>
      </div>

      {/* Period Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {periods.map((p) => {
          const isActive = p.id === activePeriodId;

          return (
            <div
              key={p.id}
              className={`rounded-2xl border p-5 transition-all flex flex-col justify-between ${
                isActive
                  ? 'border-blue-500 bg-white shadow-md ring-2 ring-blue-500/20'
                  : 'border-slate-200 bg-slate-50/60 hover:bg-white'
              }`}
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-2">
                  <span className="text-xs font-black text-blue-700 bg-blue-100 px-2.5 py-0.5 rounded font-mono">
                    {p.academicYear}
                  </span>

                  {isActive ? (
                    <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      Periode Sedang Aktif
                    </span>
                  ) : (
                    <button
                      onClick={() => setActivePeriodId(p.id)}
                      className="text-xs font-bold text-slate-600 hover:text-blue-600 bg-white hover:bg-blue-50 px-2.5 py-1 rounded-lg border border-slate-200 transition-colors"
                    >
                      Jadikan Aktif
                    </button>
                  )}
                </div>

                <h3 className="font-bold text-slate-900 text-sm leading-snug">
                  {p.title}
                </h3>
                <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                  {p.description}
                </p>
              </div>

              {/* Status Controls */}
              <div className="mt-4 pt-4 border-t border-slate-200 space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
                  <span className="text-slate-500 font-medium">Status Bilik Suara:</span>
                  <div className="flex items-center gap-1">
                    {(['OPEN', 'PAUSED', 'CLOSED'] as TPSStatus[]).map((st) => (
                      <button
                        key={st}
                        onClick={() => updatePeriodStatus(p.id, st)}
                        className={`px-2 py-1 rounded text-[11px] font-bold transition-all ${
                          p.status === st
                            ? st === 'OPEN'
                              ? 'bg-emerald-600 text-white'
                              : st === 'PAUSED'
                              ? 'bg-amber-500 text-white'
                              : 'bg-rose-600 text-white'
                            : 'bg-slate-200 text-slate-700 hover:bg-slate-300'
                        }`}
                      >
                        {st === 'OPEN' ? 'Buka' : st === 'PAUSED' ? 'Jeda' : 'Tutup'}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex items-center justify-between gap-2 text-xs pt-1 border-t border-slate-100">
                  <span className="text-slate-500 font-medium">Tayangan Quick Count:</span>
                  <button
                    onClick={() => toggleResultPublished(p.id, !p.isResultPublished)}
                    className={`px-3 py-1 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors ${
                      p.isResultPublished
                        ? 'bg-blue-100 text-blue-800 hover:bg-blue-200'
                        : 'bg-amber-100 text-amber-800 hover:bg-amber-200'
                    }`}
                  >
                    {p.isResultPublished ? (
                      <>
                        <Eye className="w-3.5 h-3.5" />
                        Publik (Terbuka)
                      </>
                    ) : (
                      <>
                        <Lock className="w-3.5 h-3.5" />
                        Terkunci (Freeze Mode)
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Add Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <h3 className="font-bold text-slate-900 text-base">
              Tambah Periode Pemilihan Baru
            </h3>

            <form onSubmit={handleCreatePeriod} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Tahun Ajaran (Contoh: 2027/2028)
                </label>
                <input
                  type="text"
                  value={academicYear}
                  onChange={(e) => setAcademicYear(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-300 text-xs font-semibold"
                  placeholder="2027/2028"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Judul Acara Pemilihan
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-300 text-xs font-semibold"
                  placeholder="Pemilihan Umum OSIS & MPK SMKS PGRI 1"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Keterangan / Catatan
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={3}
                  className="w-full p-2.5 rounded-xl border border-slate-300 text-xs"
                  placeholder="Deskripsi agenda pemilihan..."
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-xs"
                >
                  Simpan Periode
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
