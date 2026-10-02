import React, { useState } from 'react';
import { useVoting } from '../../context/VotingContext';
import { Candidate, CandidateCategory } from '../../types/voting';
import {
  RotateCcw,
  AlertTriangle,
  X,
  Vote,
  CheckCircle2,
  Trash2,
  ShieldAlert,
  Flame,
  UserX,
  Users,
} from 'lucide-react';

interface ResetVotesModalProps {
  onClose: () => void;
  preSelectedCandidateId?: string;
}

export const ResetVotesModal: React.FC<ResetVotesModalProps> = ({
  onClose,
  preSelectedCandidateId,
}) => {
  const {
    activePeriod,
    activeCandidates,
    activeVotes,
    osisVotes,
    mpkVotes,
    resetCandidateVotes,
    resetCategoryVotes,
    resetAllCandidateVotes,
  } = useVoting();

  const [activeTab, setActiveTab] = useState<'individual' | 'bulk'>('individual');
  const [categoryFilter, setCategoryFilter] = useState<'ALL' | 'OSIS' | 'MPK'>('ALL');
  const [resetVotersDpt, setResetVotersDpt] = useState(true);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Candidate confirmation state
  const [confirmingCandId, setConfirmingCandId] = useState<string | null>(
    preSelectedCandidateId || null
  );

  const getCandidateVoteCount = (candidateId: string) => {
    return activeVotes.filter((v) => v.candidateId === candidateId).length;
  };

  const filteredCandidates = activeCandidates.filter((c) => {
    if (categoryFilter === 'ALL') return true;
    return c.category === categoryFilter;
  });

  const handleResetSingleCandidate = (cand: Candidate) => {
    const deleted = resetCandidateVotes(cand.id);
    setConfirmingCandId(null);
    setSuccessMessage(
      `Berhasil mengosongkan ${deleted} suara untuk Paslon 0${cand.ballotNumber} (${cand.chairmanName} & ${cand.viceChairmanName} - ${cand.category}). Perolehan suara kini 0.`
    );
    setTimeout(() => setSuccessMessage(null), 4000);
  };

  const handleResetCategory = (cat: CandidateCategory) => {
    const deleted = resetCategoryVotes(cat);
    setSuccessMessage(
      `Berhasil mengosongkan ${deleted} perolehan suara untuk seluruh pasangan calon ${cat}.`
    );
    setTimeout(() => setSuccessMessage(null), 4000);
  };

  const handleResetAllTotal = () => {
    if (
      !confirm(
        '⚠️ PERINGATAN PANITIA:\nApakah Anda yakin ingin MENGOSONGKAN SELURUH PEROLEHAN SUARA untuk semua pasangan calon (OSIS & MPK)?\n\nTindakan ini tidak dapat dibatalkan.'
      )
    ) {
      return;
    }

    const deleted = resetAllCandidateVotes(resetVotersDpt);
    setSuccessMessage(
      `Berhasil mengosongkan total ${deleted} suara pemilu untuk seluruh pasangan calon.${
        resetVotersDpt ? ' Status pemilih di DPT juga telah dikembalikan ke Belum Memilih.' : ''
      }`
    );
    setTimeout(() => setSuccessMessage(null), 4000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-2xl w-full p-5 sm:p-7 shadow-2xl border-2 border-slate-300 space-y-5 my-8">
        {/* Header */}
        <div className="flex items-start justify-between border-b border-slate-200 pb-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-black uppercase tracking-wider text-rose-800 bg-rose-100 px-3 py-1 rounded-md border border-rose-300 flex items-center gap-1.5">
                <ShieldAlert className="w-3.5 h-3.5 text-rose-600" />
                Otoritas Panitia Pemilu
              </span>
              <span className="text-xs font-bold text-slate-600">
                Periode: <strong>{activePeriod?.academicYear || '2026/2027'}</strong>
              </span>
            </div>
            <h3 className="font-black text-slate-950 text-xl mt-2 flex items-center gap-2">
              <RotateCcw className="w-5 h-5 text-rose-600" />
              Kosongkan / Reset Suara Pasangan Calon
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 font-medium mt-0.5">
              Gunakan fitur ini untuk mengosongkan perolehan suara paslon tertentu atau seluruh kotak suara
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

        {/* Current Total Box */}
        <div className="grid grid-cols-3 gap-2.5 p-3.5 bg-slate-50 rounded-2xl border border-slate-200 text-center">
          <div className="p-2 bg-white rounded-xl border border-slate-200 shadow-2xs">
            <span className="text-[11px] text-slate-500 font-black block uppercase">Total Suara Masuk</span>
            <span className="text-lg font-black text-slate-950">{activeVotes.length}</span>
          </div>
          <div className="p-2 bg-white rounded-xl border border-blue-200 shadow-2xs">
            <span className="text-[11px] text-blue-700 font-black block uppercase">Suara Paslon OSIS</span>
            <span className="text-lg font-black text-blue-900">{osisVotes.length}</span>
          </div>
          <div className="p-2 bg-white rounded-xl border border-indigo-200 shadow-2xs">
            <span className="text-[11px] text-indigo-700 font-black block uppercase">Suara Paslon MPK</span>
            <span className="text-lg font-black text-indigo-900">{mpkVotes.length}</span>
          </div>
        </div>

        {/* Security Warning */}
        <div className="p-3.5 bg-amber-50 rounded-2xl border-2 border-amber-300 text-amber-950 text-xs flex items-start gap-2.5">
          <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
          <div className="space-y-0.5 font-medium leading-relaxed">
            <p className="font-black text-amber-950">Catatan Keamanan Panitia:</p>
            <p>
              Tindakan pengosongan suara akan menghapus rekaman coblosan yang masuk ke kotak suara digital untuk paslon terpilih. Seluruh tindakan reset ini tercatat otomatis dan transparan pada <strong>Audit Log Panitia</strong>.
            </p>
          </div>
        </div>

        {/* Success Alert */}
        {successMessage && (
          <div className="p-3.5 rounded-2xl bg-emerald-100 border border-emerald-300 text-emerald-950 text-xs sm:text-sm font-black flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            <span>{successMessage}</span>
          </div>
        )}

        {/* Tab Selection */}
        <div className="flex border-b-2 border-slate-200 bg-slate-100 rounded-xl p-1 text-xs font-black">
          <button
            type="button"
            onClick={() => setActiveTab('individual')}
            className={`flex-1 py-2.5 rounded-lg text-center transition-all cursor-pointer ${
              activeTab === 'individual'
                ? 'bg-white text-slate-900 shadow-2xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Reset Per Paslon (Spesifik)
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('bulk')}
            className={`flex-1 py-2.5 rounded-lg text-center transition-all cursor-pointer ${
              activeTab === 'bulk'
                ? 'bg-white text-rose-800 shadow-2xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Reset Massal (Per Kategori / Total)
          </button>
        </div>

        {/* TAB 1: RESET PER PASLON SPESIFIK */}
        {activeTab === 'individual' && (
          <div className="space-y-3">
            {/* Filter buttons */}
            <div className="flex items-center justify-between text-xs">
              <span className="font-extrabold text-slate-800">
                Pilih Pasangan Calon yang Ingin Dikosongkan Suaranya:
              </span>
              <div className="flex gap-1">
                {(['ALL', 'OSIS', 'MPK'] as const).map((cat) => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setCategoryFilter(cat)}
                    className={`px-2.5 py-1 rounded-md font-black text-[11px] cursor-pointer ${
                      categoryFilter === cat
                        ? 'bg-slate-900 text-white'
                        : 'bg-slate-200 text-slate-700 hover:bg-slate-300'
                    }`}
                  >
                    {cat === 'ALL' ? 'Semua' : cat}
                  </button>
                ))}
              </div>
            </div>

            {/* List of candidates */}
            <div className="space-y-2.5 max-h-72 overflow-y-auto pr-1">
              {filteredCandidates.map((cand) => {
                const votesCount = getCandidateVoteCount(cand.id);
                const isConfirming = confirmingCandId === cand.id;

                return (
                  <div
                    key={cand.id}
                    className={`p-3.5 rounded-2xl border-2 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                      isConfirming
                        ? 'border-rose-500 bg-rose-50/70 shadow-sm'
                        : 'border-slate-200 bg-white hover:border-slate-300'
                    }`}
                  >
                    {/* Candidate Info */}
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-10 h-10 rounded-xl bg-slate-950 text-white font-black text-sm flex items-center justify-center shrink-0">
                        0{cand.ballotNumber}
                      </div>
                      <img
                        src={cand.photoUrl}
                        alt={cand.chairmanName}
                        className="w-10 h-12 rounded-lg object-cover border border-slate-300 shrink-0"
                      />
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                          <span
                            className={`text-[10px] font-black px-1.5 py-0.5 rounded ${
                              cand.category === 'OSIS'
                                ? 'bg-blue-100 text-blue-900'
                                : 'bg-indigo-100 text-indigo-900'
                            }`}
                          >
                            {cand.category}
                          </span>
                          <span className="text-xs font-black text-slate-900 truncate">
                            {cand.chairmanName} & {cand.viceChairmanName}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-500 font-medium">
                          {cand.chairmanClass} & {cand.viceChairmanClass}
                        </p>
                      </div>
                    </div>

                    {/* Votes Badge & Reset Action */}
                    <div className="flex items-center justify-between sm:justify-end gap-2.5 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-200">
                      <div className="text-right">
                        <span className="text-[10px] font-bold text-slate-500 block">
                          Perolehan Suara:
                        </span>
                        <span
                          className={`font-black text-xs sm:text-sm px-2.5 py-0.5 rounded-md border ${
                            votesCount > 0
                              ? 'bg-blue-50 text-blue-900 border-blue-200'
                              : 'bg-slate-100 text-slate-500 border-slate-200'
                          }`}
                        >
                          {votesCount} Suara
                        </span>
                      </div>

                      {isConfirming ? (
                        <div className="flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => setConfirmingCandId(null)}
                            className="px-2.5 py-1.5 text-xs font-bold text-slate-600 hover:bg-slate-200 rounded-lg cursor-pointer"
                          >
                            Batal
                          </button>
                          <button
                            type="button"
                            onClick={() => handleResetSingleCandidate(cand)}
                            className="px-3 py-1.5 text-xs font-black text-white bg-rose-600 hover:bg-rose-700 rounded-lg shadow-xs cursor-pointer flex items-center gap-1"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            Ya, Kosongkan
                          </button>
                        </div>
                      ) : (
                        <button
                          type="button"
                          onClick={() => setConfirmingCandId(cand.id)}
                          disabled={votesCount === 0}
                          className={`px-3 py-1.5 text-xs font-black rounded-xl transition-all flex items-center gap-1.5 cursor-pointer ${
                            votesCount > 0
                              ? 'bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-300'
                              : 'bg-slate-100 text-slate-400 border border-slate-200 cursor-not-allowed'
                          }`}
                        >
                          <RotateCcw className="w-3.5 h-3.5" />
                          <span>Kosongkan</span>
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* TAB 2: RESET MASSAL KATEGORI ATAU TOTAL */}
        {activeTab === 'bulk' && (
          <div className="space-y-3.5">
            {/* Opsi 1: Kosongkan OSIS */}
            <div className="p-4 bg-blue-50/70 rounded-2xl border-2 border-blue-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h4 className="font-black text-slate-900 text-xs sm:text-sm flex items-center gap-1.5">
                  <Vote className="w-4 h-4 text-blue-600" />
                  Kosongkan Perolehan Suara Paslon OSIS
                </h4>
                <p className="text-xs text-slate-600 font-medium mt-0.5">
                  Menghapus seluruh suara sah yang masuk untuk calon Ketua & Wakil Ketua OSIS ({osisVotes.length} suara)
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  if (confirm(`Yakin ingin mengosongkan seluruh ${osisVotes.length} suara paslon OSIS?`)) {
                    handleResetCategory('OSIS');
                  }
                }}
                disabled={osisVotes.length === 0}
                className={`px-4 py-2 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 shrink-0 cursor-pointer ${
                  osisVotes.length > 0
                    ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-xs'
                    : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                }`}
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset Suara OSIS</span>
              </button>
            </div>

            {/* Opsi 2: Kosongkan MPK */}
            <div className="p-4 bg-indigo-50/70 rounded-2xl border-2 border-indigo-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h4 className="font-black text-slate-900 text-xs sm:text-sm flex items-center gap-1.5">
                  <Vote className="w-4 h-4 text-indigo-600" />
                  Kosongkan Perolehan Suara Paslon MPK
                </h4>
                <p className="text-xs text-slate-600 font-medium mt-0.5">
                  Menghapus seluruh suara sah yang masuk untuk calon Ketua & Wakil Ketua MPK ({mpkVotes.length} suara)
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  if (confirm(`Yakin ingin mengosongkan seluruh ${mpkVotes.length} suara paslon MPK?`)) {
                    handleResetCategory('MPK');
                  }
                }}
                disabled={mpkVotes.length === 0}
                className={`px-4 py-2 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 shrink-0 cursor-pointer ${
                  mpkVotes.length > 0
                    ? 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs'
                    : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                }`}
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset Suara MPK</span>
              </button>
            </div>

            {/* Opsi 3: Reset Total Seluruh Suara (Semua Paslon) */}
            <div className="p-4 bg-rose-50 rounded-2xl border-2 border-rose-300 space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2">
                <div>
                  <h4 className="font-black text-rose-950 text-xs sm:text-sm flex items-center gap-1.5">
                    <Trash2 className="w-4 h-4 text-rose-600" />
                    Reset Total Seluruh Perolehan Suara (Kotak Suara Kosong)
                  </h4>
                  <p className="text-xs text-rose-800 font-medium mt-0.5">
                    Mengosongkan seluruh perolehan suara paslon (OSIS dan MPK) secara total (Total: {activeVotes.length} suara).
                  </p>
                </div>
              </div>

              {/* Checkbox reset DPT voters */}
              <label className="flex items-center gap-2 text-xs font-bold text-slate-800 bg-white/80 p-2.5 rounded-xl border border-rose-200 cursor-pointer">
                <input
                  type="checkbox"
                  checked={resetVotersDpt}
                  onChange={(e) => setResetVotersDpt(e.target.checked)}
                  className="rounded text-rose-600 focus:ring-rose-500 w-4 h-4"
                />
                <span>
                  Kembalikan juga status pemilih DPT menjadi &quot;Belum Memilih&quot; agar seluruh siswa dapat memilih ulang
                </span>
              </label>

              <button
                type="button"
                onClick={handleResetAllTotal}
                disabled={activeVotes.length === 0}
                className={`w-full py-2.5 rounded-xl text-xs sm:text-sm font-black transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md ${
                  activeVotes.length > 0
                    ? 'bg-rose-600 hover:bg-rose-700 text-white'
                    : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                }`}
              >
                <Flame className="w-4 h-4" />
                <span>Reset & Kosongkan Seluruh Suara Pemilu Sekarang</span>
              </button>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="pt-3 border-t border-slate-200 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-black text-xs sm:text-sm rounded-xl cursor-pointer"
          >
            Tutup Dialog
          </button>
        </div>
      </div>
    </div>
  );
};
