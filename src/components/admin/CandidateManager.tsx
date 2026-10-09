import React, { useState, useRef } from 'react';
import { useVoting } from '../../context/VotingContext';
import { Candidate, CandidateCategory } from '../../types/voting';
import { ResetVotesModal } from './ResetVotesModal';
import {
  Plus,
  Edit,
  Trash2,
  Award,
  Vote,
  ExternalLink,
  Image as ImageIcon,
  Upload,
  Camera,
  CheckCircle2,
  AlertCircle,
  Link as LinkIcon,
  RotateCcw,
  CloudUpload,
} from 'lucide-react';

const compressImageFile = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new window.Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        // Compact dimensions to preserve storage and fast transfer across devices
        const MAX_WIDTH = 360;
        const MAX_HEIGHT = 480;
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > MAX_WIDTH) {
            height = Math.round((height * MAX_WIDTH) / width);
            width = MAX_WIDTH;
          }
        } else {
          if (height > MAX_HEIGHT) {
            width = Math.round((width * MAX_HEIGHT) / height);
            height = MAX_HEIGHT;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
          const dataUrl = canvas.toDataURL('image/jpeg', 0.75);
          resolve(dataUrl);
        } else {
          resolve(e.target?.result as string);
        }
      };
      img.onerror = () => resolve(e.target?.result as string);
      img.src = e.target?.result as string;
    };
    reader.onerror = (err) => reject(err);
    reader.readAsDataURL(file);
  });
};

export const CandidateManager: React.FC = () => {
  const {
    activePeriodId,
    activeCandidates,
    activeVotes,
    addCandidate,
    updateCandidate,
    deleteCandidate,
    saveCandidatesToCloud,
  } = useVoting();

  const [activeTab, setActiveTab] = useState<CandidateCategory>('OSIS');
  const [showModal, setShowModal] = useState(false);
  const [editingCand, setEditingCand] = useState<Candidate | null>(null);
  const [showResetVotesModal, setShowResetVotesModal] = useState(false);
  const [preSelectedCandId, setPreSelectedCandId] = useState<string | undefined>(undefined);
  const [isSavingToCloud, setIsSavingToCloud] = useState(false);
  const [cloudNotice, setCloudNotice] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Form states
  const [category, setCategory] = useState<CandidateCategory>('OSIS');
  const [ballotNumber, setBallotNumber] = useState<number>(1);
  const [chairmanName, setChairmanName] = useState('');
  const [viceChairmanName, setViceChairmanName] = useState('');
  const [chairmanClass, setChairmanClass] = useState('XI TKJ 1');
  const [viceChairmanClass, setViceChairmanClass] = useState('X BR 1');
  const [slogan, setSlogan] = useState('');
  const [vision, setVision] = useState('');
  const [missionText, setMissionText] = useState('');
  const [programsText, setProgramsText] = useState('');
  const [photoUrl, setPhotoUrl] = useState('https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=700&q=80');

  // Photo upload states
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [photoUploadError, setPhotoUploadError] = useState<string | null>(null);
  const [photoMode, setPhotoMode] = useState<'upload' | 'url'>('upload');
  const [isDragging, setIsDragging] = useState(false);

  const filteredCandidates = activeCandidates.filter((c) => c.category === activeTab);

  const handleOpenAdd = () => {
    setEditingCand(null);
    setCategory(activeTab);
    const existing = activeCandidates.filter((c) => c.category === activeTab);
    setBallotNumber(existing.length + 1);
    setChairmanName('');
    setViceChairmanName('');
    setChairmanClass('XI TKJ 1');
    setViceChairmanClass('X BR 1');
    setSlogan('');
    setVision('');
    setMissionText('');
    setProgramsText('');
    setPhotoUrl('https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=700&q=80');
    setPhotoUploadError(null);
    setPhotoMode('upload');
    setShowModal(true);
  };

  const handleOpenEdit = (cand: Candidate) => {
    setEditingCand(cand);
    setCategory(cand.category);
    setBallotNumber(cand.ballotNumber);
    setChairmanName(cand.chairmanName);
    setViceChairmanName(cand.viceChairmanName);
    setChairmanClass(cand.chairmanClass);
    setViceChairmanClass(cand.viceChairmanClass);
    setSlogan(cand.slogan);
    setVision(cand.vision);
    setMissionText(cand.mission.join('\n'));
    setProgramsText(cand.programs.join('\n'));
    setPhotoUrl(cand.photoUrl);
    setPhotoUploadError(null);
    setPhotoMode('upload');
    setShowModal(true);
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setPhotoUploadError('File harus berupa format gambar (JPG, PNG, WebP).');
      return;
    }

    try {
      setIsUploading(true);
      setPhotoUploadError(null);
      const compressedData = await compressImageFile(file);
      setPhotoUrl(compressedData);
      setIsUploading(false);
    } catch {
      setPhotoUploadError('Gagal memproses gambar dari perangkat.');
      setIsUploading(false);
    }
  };

  const handleDrop = async (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith('image/')) {
      try {
        setIsUploading(true);
        setPhotoUploadError(null);
        const compressedData = await compressImageFile(file);
        setPhotoUrl(compressedData);
        setIsUploading(false);
      } catch {
        setPhotoUploadError('Gagal memproses gambar yang dijatuhkan.');
        setIsUploading(false);
      }
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const missionArr = missionText
      .split('\n')
      .map((s) => s.trim())
      .filter(Boolean);

    const progArr = programsText
      .split('\n')
      .map((s) => s.trim())
      .filter(Boolean);

    if (editingCand) {
      updateCandidate(editingCand.id, {
        category,
        ballotNumber,
        chairmanName,
        viceChairmanName,
        chairmanClass,
        viceChairmanClass,
        slogan,
        vision,
        mission: missionArr,
        programs: progArr,
        photoUrl,
      });
    } else {
      addCandidate({
        periodId: activePeriodId,
        category,
        ballotNumber,
        chairmanName,
        viceChairmanName,
        chairmanClass,
        viceChairmanClass,
        slogan,
        vision,
        mission: missionArr,
        programs: progArr,
        photoUrl,
      });
    }

    setShowModal(false);
  };

  const handleSaveToCloud = async () => {
    try {
      setIsSavingToCloud(true);
      setCloudNotice(null);
      const res = await saveCandidatesToCloud();
      if (res.success) {
        setCloudNotice({ type: 'success', message: res.message });
      } else {
        setCloudNotice({ type: 'error', message: res.message });
      }
    } catch {
      setCloudNotice({ type: 'error', message: 'Gagal menghubungi Cloud Firestore.' });
    } finally {
      setIsSavingToCloud(false);
      setTimeout(() => setCloudNotice(null), 6000);
    }
  };

  return (
    <div className="space-y-6">
      {/* Cloud Sync Notification Banner */}
      {cloudNotice && (
        <div
          className={`p-3.5 rounded-2xl border text-xs sm:text-sm font-black flex items-center justify-between gap-2 shadow-xs transition-all ${
            cloudNotice.type === 'success'
              ? 'bg-emerald-50 border-emerald-300 text-emerald-950'
              : 'bg-rose-50 border-rose-300 text-rose-950'
          }`}
        >
          <div className="flex items-center gap-2">
            {cloudNotice.type === 'success' ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            ) : (
              <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
            )}
            <span>{cloudNotice.message}</span>
          </div>
          <button
            onClick={() => setCloudNotice(null)}
            className="text-xs px-2 py-1 rounded hover:bg-black/5 cursor-pointer"
          >
            Tutup
          </button>
        </div>
      )}

      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-slate-900">
            Manajemen Pasangan Calon (Kandidat)
          </h2>
          <p className="text-xs text-slate-500">
            Atur nomor urut, foto resmi, data diri, visi, misi, dan program kerja unggulan
          </p>
        </div>

        <div className="flex items-center flex-wrap gap-2">
          {/* Category Tabs */}
          <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs font-bold">
            <button
              onClick={() => setActiveTab('OSIS')}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                activeTab === 'OSIS'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Paslon OSIS
            </button>
            <button
              onClick={() => setActiveTab('MPK')}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                activeTab === 'MPK'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Paslon MPK
            </button>
          </div>

          <button
            type="button"
            onClick={handleSaveToCloud}
            disabled={isSavingToCloud}
            className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-black shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
            title="Kunci dan simpan seluruh susunan paslon permanen ke database Cloud Firestore (multi-device)"
          >
            <CloudUpload className="w-4 h-4" />
            <span>{isSavingToCloud ? 'Menyimpan...' : 'Kunci ke Cloud'}</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setPreSelectedCandId(undefined);
              setShowResetVotesModal(true);
            }}
            className="px-3.5 py-2 bg-rose-50 hover:bg-rose-100 text-rose-800 border-2 border-rose-300 rounded-xl text-xs font-black shadow-2xs transition-colors flex items-center gap-1.5 cursor-pointer"
            title="Kosongkan atau reset perolehan suara pasangan calon"
          >
            <RotateCcw className="w-4 h-4 text-rose-600" />
            <span>Reset Suara Paslon</span>
          </button>

          <button
            onClick={handleOpenAdd}
            className="px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            Tambah Paslon {activeTab}
          </button>
        </div>
      </div>

      {/* Candidate List Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredCandidates.map((cand) => {
          const candVotesCount = activeVotes.filter((v) => v.candidateId === cand.id).length;

          return (
            <div
              key={cand.id}
              className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-3">
                  <div className="w-10 h-10 rounded-xl bg-slate-900 text-white font-black text-base flex items-center justify-center">
                    0{cand.ballotNumber}
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleOpenEdit(cand)}
                      className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
                      title="Edit Paslon"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => {
                        if (confirm(`Yakin ingin menghapus paslon No. ${cand.ballotNumber}?`)) {
                          deleteCandidate(cand.id);
                        }
                      }}
                      className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                      title="Hapus Paslon"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="flex gap-3 mb-3">
                  <img
                    src={cand.photoUrl}
                    alt={cand.chairmanName}
                    className="w-16 h-20 object-cover rounded-lg border border-slate-200 shrink-0"
                  />
                  <div className="min-w-0 flex-1">
                    <h3 className="font-bold text-slate-900 text-sm truncate">
                      {cand.chairmanName}
                    </h3>
                    <p className="text-xs text-blue-600 font-semibold">
                      {cand.chairmanClass} (Ketua)
                    </p>
                    <h4 className="font-bold text-slate-700 text-xs truncate mt-1">
                      {cand.viceChairmanName}
                    </h4>
                    <p className="text-xs text-blue-600 font-semibold">
                      {cand.viceChairmanClass} (Wakil)
                    </p>
                  </div>
                </div>

                {cand.slogan && (
                  <p className="text-xs italic text-slate-600 bg-slate-50 p-2 rounded-lg border border-slate-100">
                    &quot;{cand.slogan}&quot;
                  </p>
                )}
              </div>

              <div className="space-y-2 mt-4 pt-3 border-t border-slate-100">
                <div className="text-xs text-slate-500 flex justify-between items-center">
                  <span>{cand.mission.length} Butir Misi</span>
                  <span>{cand.programs.length} Program Kerja</span>
                </div>

                {/* Perolehan Suara & Tombol Reset Suara Paslon Ini */}
                <div className="pt-2 border-t border-slate-200 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-1.5">
                    <span className="text-[11px] font-bold text-slate-500">Suara:</span>
                    <span
                      className={`px-2 py-0.5 rounded font-black font-mono text-xs border ${
                        candVotesCount > 0
                          ? 'bg-blue-100 text-blue-900 border-blue-300'
                          : 'bg-slate-100 text-slate-500 border-slate-200'
                      }`}
                    >
                      {candVotesCount} Suara
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      setPreSelectedCandId(cand.id);
                      setShowResetVotesModal(true);
                    }}
                    disabled={candVotesCount === 0}
                    className={`flex items-center gap-1 text-[11px] font-black px-2.5 py-1 rounded-lg transition-colors cursor-pointer ${
                      candVotesCount > 0
                        ? 'text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200'
                        : 'text-slate-400 bg-slate-50 border border-slate-200 cursor-not-allowed'
                    }`}
                    title="Kosongkan perolehan suara paslon ini"
                  >
                    <RotateCcw className="w-3 h-3" />
                    <span>Kosongkan</span>
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Add / Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-xl w-full p-6 shadow-2xl border border-slate-200 max-h-[90vh] overflow-y-auto">
            <h3 className="font-bold text-slate-900 text-base mb-4">
              {editingCand ? 'Edit Pasangan Calon' : `Tambah Pasangan Calon ${category}`}
            </h3>

            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Kategori Paslon
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as CandidateCategory)}
                    className="w-full p-2.5 rounded-xl border border-slate-300 font-semibold"
                  >
                    <option value="OSIS">Ketua & Wakil OSIS</option>
                    <option value="MPK">Ketua & Wakil MPK</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Nomor Urut Surat Suara
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={9}
                    value={ballotNumber}
                    onChange={(e) => setBallotNumber(parseInt(e.target.value) || 1)}
                    className="w-full p-2.5 rounded-xl border border-slate-300 font-bold"
                    required
                  />
                </div>
              </div>

              {/* Chairman & Vice Chairman Details */}
              <div className="grid grid-cols-2 gap-3 pt-1 border-t border-slate-100">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Nama Calon Ketua
                  </label>
                  <input
                    type="text"
                    value={chairmanName}
                    onChange={(e) => setChairmanName(e.target.value)}
                    placeholder="Contoh: Muhammad Rizki"
                    className="w-full p-2.5 rounded-xl border border-slate-300 font-semibold"
                    required
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Kelas Asal Calon Ketua
                  </label>
                  <input
                    type="text"
                    value={chairmanClass}
                    onChange={(e) => setChairmanClass(e.target.value)}
                    placeholder="Contoh: XI TKJ 1"
                    className="w-full p-2.5 rounded-xl border border-slate-300 font-semibold"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Nama Calon Wakil Ketua
                  </label>
                  <input
                    type="text"
                    value={viceChairmanName}
                    onChange={(e) => setViceChairmanName(e.target.value)}
                    placeholder="Contoh: Siti Aisyah"
                    className="w-full p-2.5 rounded-xl border border-slate-300 font-semibold"
                    required
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Kelas Asal Calon Wakil
                  </label>
                  <input
                    type="text"
                    value={viceChairmanClass}
                    onChange={(e) => setViceChairmanClass(e.target.value)}
                    placeholder="Contoh: X TKJ 2"
                    className="w-full p-2.5 rounded-xl border border-slate-300 font-semibold"
                    required
                  />
                </div>
              </div>

              {/* Photo Upload from Gallery / Device */}
              <div className="bg-slate-50 p-4 rounded-2xl border-2 border-slate-200 space-y-3">
                <div className="flex items-center justify-between">
                  <label className="block text-xs sm:text-sm font-black text-slate-900">
                    Foto Resmi Pasangan Calon
                  </label>
                  <div className="flex bg-slate-200 p-0.5 rounded-lg text-xs font-bold">
                    <button
                      type="button"
                      onClick={() => setPhotoMode('upload')}
                      className={`px-2.5 py-1 rounded-md transition-all cursor-pointer ${
                        photoMode === 'upload'
                          ? 'bg-blue-600 text-white shadow-2xs'
                          : 'text-slate-700 hover:text-slate-950'
                      }`}
                    >
                      Unggah Galeri
                    </button>
                    <button
                      type="button"
                      onClick={() => setPhotoMode('url')}
                      className={`px-2.5 py-1 rounded-md transition-all cursor-pointer ${
                        photoMode === 'url'
                          ? 'bg-blue-600 text-white shadow-2xs'
                          : 'text-slate-700 hover:text-slate-950'
                      }`}
                    >
                      Tautan URL
                    </button>
                  </div>
                </div>

                {/* Hidden File Input */}
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  accept="image/*"
                  className="hidden"
                />

                {photoMode === 'upload' ? (
                  <div className="space-y-3">
                    <div className="flex flex-col sm:flex-row items-center gap-4">
                      {/* Image Preview Box */}
                      <div className="relative w-28 h-36 rounded-2xl overflow-hidden border-2 border-slate-300 bg-slate-200 shrink-0 shadow-xs group">
                        {photoUrl ? (
                          <img
                            src={photoUrl}
                            alt="Pratinjau Foto Paslon"
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex flex-col items-center justify-center text-slate-400 p-2 text-center text-xs">
                            <ImageIcon className="w-8 h-8 mb-1" />
                            <span>Belum ada foto</span>
                          </div>
                        )}
                        {isUploading && (
                          <div className="absolute inset-0 bg-slate-950/70 flex flex-col items-center justify-center text-white text-xs font-bold gap-1">
                            <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                            <span>Memproses...</span>
                          </div>
                        )}
                      </div>

                      {/* Dropzone & Action Buttons */}
                      <div
                        onDragOver={(e) => {
                          e.preventDefault();
                          setIsDragging(true);
                        }}
                        onDragLeave={() => setIsDragging(false)}
                        onDrop={handleDrop}
                        className={`flex-1 w-full border-2 border-dashed rounded-2xl p-4 text-center transition-all flex flex-col items-center justify-center gap-2 ${
                          isDragging
                            ? 'border-blue-600 bg-blue-50/80 scale-[1.01]'
                            : 'border-slate-300 hover:border-blue-500 bg-white'
                        }`}
                      >
                        <div className="w-10 h-10 rounded-full bg-blue-50 border border-blue-200 text-blue-600 flex items-center justify-center">
                          <Upload className="w-5 h-5" />
                        </div>
                        <div>
                          <p className="text-xs sm:text-sm font-black text-slate-950">
                            Pilih foto langsung dari galeri HP atau PC
                          </p>
                          <p className="text-[11px] text-slate-600 font-medium">
                            Format JPG, PNG, atau WebP (Otomatis dioptimasi)
                          </p>
                        </div>

                        <div className="flex flex-wrap items-center justify-center gap-2 pt-1">
                          <button
                            type="button"
                            onClick={() => fileInputRef.current?.click()}
                            disabled={isUploading}
                            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-black shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
                          >
                            <Camera className="w-3.5 h-3.5" />
                            <span>Buka Galeri Foto</span>
                          </button>

                          {photoUrl && (
                            <span className="inline-flex items-center gap-1 text-[11px] font-black text-emerald-800 bg-emerald-100 px-2.5 py-1 rounded-lg border border-emerald-300">
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                              Foto Terpasang
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {photoUploadError && (
                      <div className="p-2.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-bold flex items-center gap-2">
                        <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
                        <span>{photoUploadError}</span>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="space-y-2">
                    <div className="flex gap-2">
                      <div className="relative flex-1">
                        <LinkIcon className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                        <input
                          type="url"
                          value={photoUrl}
                          onChange={(e) => setPhotoUrl(e.target.value)}
                          placeholder="https://..."
                          className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-300 text-xs font-mono font-medium"
                          required
                        />
                      </div>
                      <img
                        src={photoUrl}
                        alt="Preview"
                        className="w-9 h-10 object-cover rounded-lg border border-slate-300 shrink-0"
                      />
                    </div>
                    <p className="text-[11px] text-slate-500 font-medium">
                      Masukkan tautan URL foto langsung dari internet atau Unsplash.
                    </p>
                  </div>
                )}
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Slogan Pasangan Calon
                </label>
                <input
                  type="text"
                  value={slogan}
                  onChange={(e) => setSlogan(e.target.value)}
                  placeholder="Contoh: BERSINAR - Bersama Inovatif dan Responsif"
                  className="w-full p-2.5 rounded-xl border border-slate-300 font-medium"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Visi Utama
                </label>
                <textarea
                  value={vision}
                  onChange={(e) => setVision(e.target.value)}
                  rows={2}
                  placeholder="Visi pasangan calon..."
                  className="w-full p-2.5 rounded-xl border border-slate-300"
                  required
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Misi Kerja (1 baris per misi)
                </label>
                <textarea
                  value={missionText}
                  onChange={(e) => setMissionText(e.target.value)}
                  rows={3}
                  placeholder="Misi 1&#10;Misi 2&#10;Misi 3"
                  className="w-full p-2.5 rounded-xl border border-slate-300 font-sans"
                  required
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Program Kerja Unggulan (1 baris per program)
                </label>
                <textarea
                  value={programsText}
                  onChange={(e) => setProgramsText(e.target.value)}
                  rows={3}
                  placeholder="Program 1: Pekan IT Festival&#10;Program 2: Bank Ide Digital"
                  className="w-full p-2.5 rounded-xl border border-slate-300 font-sans"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 font-semibold text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-xs"
                >
                  Simpan Paslon
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Reset Suara Paslon Modal */}
      {showResetVotesModal && (
        <ResetVotesModal
          onClose={() => {
            setShowResetVotesModal(false);
            setPreSelectedCandId(undefined);
          }}
          preSelectedCandidateId={preSelectedCandId}
        />
      )}
    </div>
  );
};
