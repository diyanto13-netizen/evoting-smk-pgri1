import React, { useState } from 'react';
import { useVoting } from '../../context/VotingContext';
import { TimelineStep, TimelineStatus } from '../../types/voting';
import {
  CalendarClock,
  Plus,
  Edit,
  Trash2,
  CheckCircle2,
  Clock,
  RotateCcw,
  MapPin,
  Calendar,
  Sparkles,
} from 'lucide-react';

export const TimelineManager: React.FC = () => {
  const {
    activeTimelineSteps,
    activePeriodId,
    addTimelineStep,
    updateTimelineStep,
    deleteTimelineStep,
    resetTimelineSteps,
  } = useVoting();

  const [showModal, setShowModal] = useState(false);
  const [editingStep, setEditingCand] = useState<TimelineStep | null>(null);

  // Form states
  const [stepNumber, setStepNumber] = useState<number>(1);
  const [title, setTitle] = useState('');
  const [dateRange, setDateRange] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState<TimelineStatus>('UPCOMING');
  const [location, setLocation] = useState('');

  const handleOpenAdd = () => {
    setEditingCand(null);
    setStepNumber(activeTimelineSteps.length + 1);
    setTitle('');
    setDateRange('');
    setDescription('');
    setStatus('UPCOMING');
    setLocation('Kampus SMKS PGRI 1 Sukabumi');
    setShowModal(true);
  };

  const handleOpenEdit = (step: TimelineStep) => {
    setEditingCand(step);
    setStepNumber(step.stepNumber);
    setTitle(step.title);
    setDateRange(step.dateRange);
    setDescription(step.description);
    setStatus(step.status);
    setLocation(step.location || '');
    setShowModal(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !dateRange) return;

    if (editingStep) {
      updateTimelineStep(editingStep.id, {
        stepNumber,
        title,
        dateRange,
        description,
        status,
        location,
      });
    } else {
      addTimelineStep({
        periodId: activePeriodId,
        stepNumber,
        title,
        dateRange,
        description,
        status,
        location,
      });
    }

    setShowModal(false);
  };

  const handleQuickStatusChange = (stepId: string, newStatus: TimelineStatus) => {
    updateTimelineStep(stepId, { status: newStatus });
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-blue-600 animate-ping"></span>
            <span className="text-xs font-black uppercase tracking-wider text-blue-900 bg-blue-100 px-2.5 py-0.5 rounded-md border border-blue-300">
              Pengaturan Jadwal Panitia
            </span>
          </div>
          <h2 className="text-xl font-black text-slate-950 mt-1">
            Manajemen Jadwal Tahapan Pemilu
          </h2>
          <p className="text-xs sm:text-sm text-slate-700 font-medium">
            Tentukan tanggal riil, judul, deskripsi, dan status tahapan pemilu. Seluruh perubahan langsung tampil di Beranda Publik.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={() => {
              if (confirm('Kembalikan seluruh jadwal tahapan ke konfigurasi standar sekolah?')) {
                resetTimelineSteps();
              }
            }}
            className="px-3.5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs sm:text-sm font-bold border border-slate-300 transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <RotateCcw className="w-4 h-4" />
            Reset Default
          </button>

          <button
            onClick={handleOpenAdd}
            className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs sm:text-sm font-black shadow-md transition-colors flex items-center gap-2 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            Tambah Tahapan Baru
          </button>
        </div>
      </div>

      {/* Timeline Steps Cards Grid */}
      <div className="space-y-4">
        {activeTimelineSteps.map((step) => {
          return (
            <div
              key={step.id}
              className={`bg-white rounded-3xl border-2 p-5 sm:p-6 shadow-xs transition-all relative overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-4 ${
                step.status === 'ACTIVE'
                  ? 'border-blue-600 bg-blue-50/40 ring-3 ring-blue-500/20'
                  : step.status === 'DONE'
                  ? 'border-slate-300 bg-slate-50/70'
                  : 'border-slate-300'
              }`}
            >
              {/* Left Column: Number & Details */}
              <div className="flex items-start gap-4 flex-1">
                <div
                  className={`w-12 h-12 rounded-2xl font-black text-lg flex items-center justify-center shrink-0 shadow-xs ${
                    step.status === 'ACTIVE'
                      ? 'bg-blue-600 text-white'
                      : step.status === 'DONE'
                      ? 'bg-emerald-600 text-white'
                      : 'bg-slate-800 text-white'
                  }`}
                >
                  0{step.stepNumber}
                </div>

                <div className="space-y-1 min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2.5">
                    <span className="text-xs font-black uppercase text-blue-900 bg-blue-100 px-2.5 py-0.5 rounded border border-blue-200">
                      TAHAP 0{step.stepNumber}
                    </span>

                    {/* Status Badge */}
                    {step.status === 'DONE' && (
                      <span className="inline-flex items-center gap-1.5 text-xs font-black text-emerald-900 bg-emerald-100 px-2.5 py-0.5 rounded-full border border-emerald-300">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700" />
                        Selesai Dilaksanakan
                      </span>
                    )}
                    {step.status === 'ACTIVE' && (
                      <span className="inline-flex items-center gap-1.5 text-xs font-black text-blue-950 bg-blue-200 px-3 py-0.5 rounded-full border border-blue-400 animate-pulse">
                        <span className="w-2 h-2 rounded-full bg-blue-600"></span>
                        Sedang Berlangsung Hari Ini
                      </span>
                    )}
                    {step.status === 'UPCOMING' && (
                      <span className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-700 bg-slate-200 px-2.5 py-0.5 rounded-full">
                        <Clock className="w-3.5 h-3.5" />
                        Akan Datang
                      </span>
                    )}
                  </div>

                  <h3 className="text-base sm:text-lg font-black text-slate-950 leading-snug">
                    {step.title}
                  </h3>

                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs sm:text-sm font-bold text-slate-800 pt-0.5">
                    <div className="flex items-center gap-1.5 text-blue-800 font-extrabold">
                      <Calendar className="w-4 h-4 text-blue-600" />
                      <span>{step.dateRange}</span>
                    </div>

                    {step.location && (
                      <div className="flex items-center gap-1.5 text-slate-600 font-semibold">
                        <MapPin className="w-4 h-4 text-slate-500" />
                        <span>{step.location}</span>
                      </div>
                    )}
                  </div>

                  <p className="text-xs sm:text-sm text-slate-700 font-medium leading-relaxed pt-1">
                    {step.description}
                  </p>
                </div>
              </div>

              {/* Right Column: Quick Status Toggle & Actions */}
              <div className="flex flex-wrap items-center gap-2 self-start md:self-center border-t md:border-t-0 pt-3 md:pt-0 border-slate-200">
                {/* Quick Status Buttons */}
                <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs font-bold">
                  <button
                    onClick={() => handleQuickStatusChange(step.id, 'DONE')}
                    className={`px-2.5 py-1 rounded-lg transition-colors cursor-pointer ${
                      step.status === 'DONE'
                        ? 'bg-emerald-600 text-white shadow-2xs'
                        : 'text-slate-600 hover:text-slate-950'
                    }`}
                    title="Ubah ke Selesai"
                  >
                    Selesai
                  </button>
                  <button
                    onClick={() => handleQuickStatusChange(step.id, 'ACTIVE')}
                    className={`px-2.5 py-1 rounded-lg transition-colors cursor-pointer ${
                      step.status === 'ACTIVE'
                        ? 'bg-blue-600 text-white shadow-2xs'
                        : 'text-slate-600 hover:text-slate-950'
                    }`}
                    title="Ubah ke Aktif Hari Ini"
                  >
                    Aktif
                  </button>
                  <button
                    onClick={() => handleQuickStatusChange(step.id, 'UPCOMING')}
                    className={`px-2.5 py-1 rounded-lg transition-colors cursor-pointer ${
                      step.status === 'UPCOMING'
                        ? 'bg-slate-800 text-white shadow-2xs'
                        : 'text-slate-600 hover:text-slate-950'
                    }`}
                    title="Ubah ke Belum Dimulai"
                  >
                    Mendatang
                  </button>
                </div>

                <button
                  onClick={() => handleOpenEdit(step)}
                  className="p-2 text-blue-700 hover:bg-blue-50 border border-blue-200 rounded-xl transition-colors cursor-pointer"
                  title="Edit Tanggal Riil & Keterangan"
                >
                  <Edit className="w-4 h-4" />
                </button>

                <button
                  onClick={() => {
                    if (confirm(`Yakin ingin menghapus tahapan "${step.title}"?`)) {
                      deleteTimelineStep(step.id);
                    }
                  }}
                  className="p-2 text-rose-700 hover:bg-rose-50 border border-rose-200 rounded-xl transition-colors cursor-pointer"
                  title="Hapus Tahapan"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Add / Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-950/75 backdrop-blur-xs overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border-2 border-slate-300 space-y-4">
            <h3 className="font-black text-slate-950 text-lg sm:text-xl">
              {editingStep ? 'Edit Tanggal Riil & Tahapan Pemilu' : 'Tambah Tahapan Pemilu Baru'}
            </h3>
            <p className="text-xs sm:text-sm text-slate-700 font-medium">
              Tentukan jadwal riil pelaksanaan tahapan pemilu SMKS PGRI 1 Sukabumi.
            </p>

            <form onSubmit={handleSubmit} className="space-y-4 text-xs sm:text-sm">
              <div className="grid grid-cols-3 gap-3">
                <div className="col-span-1">
                  <label className="block font-black text-slate-900 mb-1">
                    Nomor Tahap
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={20}
                    value={stepNumber}
                    onChange={(e) => setStepNumber(parseInt(e.target.value) || 1)}
                    className="w-full p-2.5 rounded-xl border-2 border-slate-300 font-black text-slate-900"
                    required
                  />
                </div>

                <div className="col-span-2">
                  <label className="block font-black text-slate-900 mb-1">
                    Status Pelaksanaan
                  </label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value as TimelineStatus)}
                    className="w-full p-2.5 rounded-xl border-2 border-slate-300 font-extrabold text-slate-900"
                  >
                    <option value="DONE">Selesai Dilaksanakan</option>
                    <option value="ACTIVE">Sedang Berlangsung Hari Ini</option>
                    <option value="UPCOMING">Akan Datang (Belum Dimulai)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-black text-slate-900 mb-1">
                  Judul Nama Tahapan
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Contoh: Pemungutan Suara Digital (TPS)"
                  className="w-full p-3 rounded-xl border-2 border-slate-300 font-bold text-slate-900"
                  required
                />
              </div>

              <div>
                <label className="block font-black text-slate-900 mb-1">
                  Tanggal & Jam Riil Pelaksanaan
                </label>
                <input
                  type="text"
                  value={dateRange}
                  onChange={(e) => setDateRange(e.target.value)}
                  placeholder="Contoh: 01 Oktober 2026 (07.30 - 15.00 WIB)"
                  className="w-full p-3 rounded-xl border-2 border-slate-300 font-bold text-blue-900"
                  required
                />
                <p className="text-xs text-slate-500 mt-1">
                  Format bebas teks yang jelas untuk dibaca oleh siswa dan guru pembimbing.
                </p>
              </div>

              <div>
                <label className="block font-black text-slate-900 mb-1">
                  Lokasi / Ruangan Pelaksanaan (Opsional)
                </label>
                <input
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="Contoh: Lab Komputer & Multimedia SMKS PGRI 1"
                  className="w-full p-3 rounded-xl border-2 border-slate-300 font-semibold text-slate-900"
                />
              </div>

              <div>
                <label className="block font-black text-slate-900 mb-1">
                  Deskripsi / Keterangan Agenda
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={3}
                  placeholder="Deskripsi teknis agenda pelaksanaan tahapan..."
                  className="w-full p-3 rounded-xl border-2 border-slate-300 font-medium text-slate-900"
                  required
                />
              </div>

              <div className="pt-2 flex justify-end gap-2.5 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2.5 font-bold text-slate-700 hover:bg-slate-100 rounded-xl cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-black rounded-xl shadow-md cursor-pointer"
                >
                  Simpan Jadwal Tahapan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
