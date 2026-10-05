import React, { useState, useMemo, useRef } from 'react';
import { useVoting } from '../../context/VotingContext';
import { VoterCardPrintModal } from './VoterCardPrintModal';
import {
  downloadVoterExcelTemplate,
  exportVotersToExcel,
  parseVotersExcelFile,
  ParsedVoterItem,
} from '../../utils/excelUtils';
import {
  Users,
  Search,
  Filter,
  KeyRound,
  FileSpreadsheet,
  FileDown,
  Download,
  Printer,
  RotateCcw,
  Plus,
  CheckCircle2,
  Clock,
  Trash2,
  Upload,
  AlertCircle,
  FileCheck,
  HelpCircle,
  X,
  UserCheck,
  GraduationCap,
} from 'lucide-react';

export const VoterManager: React.FC = () => {
  const {
    activeVoters,
    activePeriod,
    addVoter,
    batchImportVoters,
    batchGeneratePins,
    resetVoterStatus,
    resetAllVotersStatus,
    deleteVoter,
    deleteMultipleVoters,
  } = useVoting();

  const [searchQuery, setSearchQuery] = useState('');
  const [filterMajor, setFilterMajor] = useState('ALL');
  const [filterStatus, setFilterStatus] = useState<'ALL' | 'VOTED' | 'NOT_VOTED'>('ALL');
  const [showPrintModal, setShowPrintModal] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);

  // Delete & Multi-selection states
  const [selectedVoterIds, setSelectedVoterIds] = useState<string[]>([]);
  const [voterToDelete, setVoterToDelete] = useState<any>(null);
  const [showBatchDeleteModal, setShowBatchDeleteModal] = useState(false);

  // Single add form
  const [voterCategory, setVoterCategory] = useState<'SISWA' | 'GURU'>('SISWA');
  const [nisn, setNisn] = useState('');
  const [studentName, setStudentName] = useState('');
  const [classGrade, setClassGrade] = useState('XII TKJ 1');
  const [major, setMajor] = useState('Teknik Komputer & Jaringan (TKJ)');

  const handleSelectCategory = (cat: 'SISWA' | 'GURU') => {
    setVoterCategory(cat);
    if (cat === 'GURU') {
      setClassGrade('DEWAN GURU');
      setMajor('Pendidik / Tenaga Kependidikan');
    } else {
      setClassGrade('XII TKJ 1');
      setMajor('Teknik Komputer & Jaringan (TKJ)');
    }
  };

  // Excel Import states
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isParsingExcel, setIsParsingExcel] = useState(false);
  const [uploadedFileName, setUploadedFileName] = useState<string | null>(null);
  const [parsedVoters, setParsedVoters] = useState<ParsedVoterItem[]>([]);
  const [importErrors, setImportErrors] = useState<string[]>([]);
  const [importReplaceExisting, setImportReplaceExisting] = useState(false);
  const [importSuccessMessage, setImportSuccessMessage] = useState<string | null>(null);
  const [isDraggingFile, setIsDraggingFile] = useState(false);

  const filteredVoters = useMemo(() => {
    return activeVoters.filter((v) => {
      const matchSearch =
        v.studentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        v.nisn.includes(searchQuery) ||
        v.classGrade.toLowerCase().includes(searchQuery.toLowerCase());

      const matchMajor = filterMajor === 'ALL' || v.major === filterMajor || v.major.includes(filterMajor);

      const matchStatus =
        filterStatus === 'ALL'
          ? true
          : filterStatus === 'VOTED'
          ? v.hasVoted
          : !v.hasVoted;

      return matchSearch && matchMajor && matchStatus;
    });
  }, [activeVoters, searchQuery, filterMajor, filterStatus]);

  const displayedVoters = useMemo(() => filteredVoters.slice(0, 100), [filteredVoters]);

  const isAllSelected =
    displayedVoters.length > 0 &&
    displayedVoters.every((v) => selectedVoterIds.includes(v.id));

  const handleToggleSelectAll = () => {
    if (isAllSelected) {
      const displayedIds = new Set(displayedVoters.map((v) => v.id));
      setSelectedVoterIds((prev) => prev.filter((id) => !displayedIds.has(id)));
    } else {
      const combined = new Set([...selectedVoterIds, ...displayedVoters.map((v) => v.id)]);
      setSelectedVoterIds(Array.from(combined));
    }
  };

  const handleToggleSelectVoter = (id: string) => {
    setSelectedVoterIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleConfirmSingleDelete = () => {
    if (!voterToDelete) return;
    deleteVoter(voterToDelete.id);
    setSelectedVoterIds((prev) => prev.filter((id) => id !== voterToDelete.id));
    setVoterToDelete(null);
  };

  const handleConfirmBatchDelete = () => {
    if (selectedVoterIds.length === 0) return;
    deleteMultipleVoters(selectedVoterIds);
    setSelectedVoterIds([]);
    setShowBatchDeleteModal(false);
  };

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nisn || !studentName || !activePeriod) return;

    addVoter({
      periodId: activePeriod.id,
      nisn: nisn.trim(),
      studentName: studentName.trim(),
      classGrade: classGrade.trim(),
      major: major.trim(),
      pin: Math.floor(100000 + Math.random() * 900000).toString(),
      hasVoted: false,
    });

    setNisn('');
    setStudentName('');
    setShowAddModal(false);
  };

  const handleFileChosen = async (file: File) => {
    if (!file) return;
    setIsParsingExcel(true);
    setImportErrors([]);
    setImportSuccessMessage(null);
    setUploadedFileName(file.name);

    const result = await parseVotersExcelFile(file);
    setIsParsingExcel(false);

    if (result.success && result.voters.length > 0) {
      setParsedVoters(result.voters);
      setImportErrors(result.errors);
    } else {
      setParsedVoters([]);
      setImportErrors(result.errors.length > 0 ? result.errors : ['Tidak ada data valid yang dapat dibaca dari file ini.']);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileChosen(file);
    }
  };

  const handleDropFile = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDraggingFile(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      handleFileChosen(file);
    }
  };

  const handleConfirmImport = () => {
    if (parsedVoters.length === 0) return;

    const importedCount = batchImportVoters(
      parsedVoters.map((v) => ({
        nisn: v.nisn,
        studentName: v.studentName,
        classGrade: v.classGrade,
        major: v.major,
        pin: v.pin || Math.floor(100000 + Math.random() * 900000).toString(),
        hasVoted: false,
      })),
      importReplaceExisting
    );

    setImportSuccessMessage(
      `Berhasil ${importReplaceExisting ? 'mengganti seluruh DPT dengan' : 'menambahkan'} ${importedCount} siswa dari file Excel!`
    );

    setTimeout(() => {
      setShowImportModal(false);
      setParsedVoters([]);
      setUploadedFileName(null);
      setImportSuccessMessage(null);
    }, 1200);
  };

  const handleExportCurrentDpt = () => {
    exportVotersToExcel(activeVoters, activePeriod?.academicYear || '2026/2027');
  };

  return (
    <div className="space-y-6">
      {/* Top Header & Horizontal Action Menu */}
      <div className="bg-white p-5 sm:p-6 rounded-3xl border-2 border-slate-200 shadow-xs space-y-4">
        {/* Title & Subtitle at the TOP */}
        <div className="border-b border-slate-100 pb-3">
          <h2 className="text-xl sm:text-2xl font-black text-slate-950 tracking-tight">
            Daftar Pemilih Tetap (DPT) & Kartu Suara
          </h2>
          <p className="text-xs sm:text-sm text-slate-700 font-medium mt-1">
            Kelola data pemilih, import massal via file Excel langsung, buat PIN acak, dan cetak kartu suara pemilih
          </p>
        </div>

        {/* Clean Horizontal Action Menu Bar Directly Below Title */}
        <div className="flex items-center gap-2.5 overflow-x-auto pb-1.5 pt-0.5 scrollbar-thin">
          {/* 1. Download Template Excel */}
          <button
            type="button"
            onClick={downloadVoterExcelTemplate}
            className="px-4 py-2.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border-2 border-emerald-400 rounded-xl text-xs sm:text-sm font-black transition-all flex items-center gap-2 shadow-2xs shrink-0 cursor-pointer hover:shadow-xs"
            title="Download Format Template Excel (.xlsx) Resmi"
          >
            <FileDown className="w-4 h-4 text-emerald-600" />
            <span>Download Template Excel</span>
          </button>

          {/* 2. Import File Excel */}
          <button
            type="button"
            onClick={() => {
              setParsedVoters([]);
              setImportErrors([]);
              setUploadedFileName(null);
              setImportSuccessMessage(null);
              setShowImportModal(true);
            }}
            className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs sm:text-sm font-black shadow-md transition-all flex items-center gap-2 shrink-0 cursor-pointer hover:shadow-lg"
          >
            <FileSpreadsheet className="w-4 h-4 text-white" />
            <span>Import File Excel</span>
          </button>

          {/* 3. Export DPT (.xlsx) */}
          <button
            type="button"
            onClick={handleExportCurrentDpt}
            className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 border-2 border-slate-300 rounded-xl text-xs sm:text-sm font-black transition-all flex items-center gap-2 shrink-0 cursor-pointer hover:border-slate-400"
            title="Download data DPT yang sedang aktif ke file Excel (.xlsx)"
          >
            <Download className="w-4 h-4 text-slate-600" />
            <span>Export DPT (.xlsx)</span>
          </button>

          {/* 4. Cetak Kartu */}
          <button
            type="button"
            onClick={() => setShowPrintModal(true)}
            className="px-4 py-2.5 bg-slate-950 hover:bg-slate-800 text-white rounded-xl text-xs sm:text-sm font-black shadow-md transition-all flex items-center gap-2 shrink-0 cursor-pointer hover:shadow-lg"
          >
            <Printer className="w-4 h-4 text-amber-400" />
            <span>Cetak Kartu ({filteredVoters.length})</span>
          </button>

          {/* 5. Generate PIN */}
          <button
            type="button"
            onClick={() => {
              const count = batchGeneratePins();
              alert(`Berhasil men-generate PIN 6 digit baru untuk ${count} pemilih.`);
            }}
            className="px-4 py-2.5 bg-amber-500 hover:bg-amber-600 text-white rounded-xl text-xs sm:text-sm font-black shadow-md transition-all flex items-center gap-2 shrink-0 cursor-pointer hover:shadow-lg"
          >
            <KeyRound className="w-4 h-4 text-white" />
            <span>Generate PIN</span>
          </button>

          {/* 6. + Tambah Manual */}
          <button
            type="button"
            onClick={() => setShowAddModal(true)}
            className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs sm:text-sm font-black shadow-md transition-all flex items-center gap-2 shrink-0 cursor-pointer hover:shadow-lg"
          >
            <Plus className="w-4 h-4 text-white" />
            <span>+ Tambah Manual</span>
          </button>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white p-4 sm:p-5 rounded-2xl border-2 border-slate-200 shadow-2xs grid grid-cols-1 sm:grid-cols-3 gap-3.5">
        {/* Search */}
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-500" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari nama, NISN, atau kelas..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border-2 border-slate-300 text-xs sm:text-sm font-bold text-slate-900 focus:ring-2 focus:ring-blue-600 focus:outline-hidden"
          />
        </div>

        {/* Filter Major */}
        <div>
          <select
            value={filterMajor}
            onChange={(e) => setFilterMajor(e.target.value)}
            className="w-full p-2.5 rounded-xl border-2 border-slate-300 text-xs sm:text-sm font-bold text-slate-800"
          >
            <option value="ALL">Semua Jurusan</option>
            <option value="Teknik Komputer & Jaringan (TKJ)">Teknik Komputer & Jaringan (TKJ)</option>
            <option value="Akuntansi (AKL)">Akuntansi (AKL)</option>
            <option value="Otomatisasi Perkantoran (OTKP/MPLB)">Otomatisasi Perkantoran (OTKP/MPLB)</option>
            <option value="Pemasaran/Bisnis Daring (BR)">Pemasaran/Bisnis Daring (BR)</option>
            <option value="Pendidik / Tenaga Kependidikan">Pendidik / Tenaga Kependidikan</option>
          </select>
        </div>

        {/* Filter Status */}
        <div>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value as any)}
            className="w-full p-2.5 rounded-xl border-2 border-slate-300 text-xs sm:text-sm font-bold text-slate-800"
          >
            <option value="ALL">Semua Status Voting</option>
            <option value="NOT_VOTED">Belum Memilih (Antri)</option>
            <option value="VOTED">Sudah Memilih (Selesai)</option>
          </select>
        </div>
      </div>

      {/* Selected Voters Batch Action Bar */}
      {selectedVoterIds.length > 0 && (
        <div className="bg-rose-50 border-2 border-rose-300 rounded-2xl p-3 sm:p-4 flex flex-wrap items-center justify-between gap-3 shadow-xs animate-in fade-in duration-200">
          <div className="flex items-center gap-2.5">
            <span className="w-7 h-7 rounded-xl bg-rose-600 text-white flex items-center justify-center font-black text-xs shadow-xs">
              {selectedVoterIds.length}
            </span>
            <div>
              <span className="text-xs sm:text-sm font-black text-rose-950 block">
                {selectedVoterIds.length} siswa DPT dipilih untuk dihapus
              </span>
              <span className="text-[11px] text-rose-700 font-semibold block">
                Gunakan untuk menghapus siswa yang keluar / pindah sekolah
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setSelectedVoterIds([])}
              className="px-3.5 py-1.5 bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 rounded-xl text-xs font-bold transition-all cursor-pointer shadow-2xs"
            >
              Batal Pilih
            </button>
            <button
              type="button"
              onClick={() => setShowBatchDeleteModal(true)}
              className="px-4 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-black shadow-xs transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <Trash2 className="w-4 h-4" />
              <span>Hapus {selectedVoterIds.length} DPT Terpilih</span>
            </button>
          </div>
        </div>
      )}

      {/* Table with High Contrast & Legible Typography */}
      <div className="bg-white rounded-3xl border-2 border-slate-200 shadow-xs overflow-hidden">
        <div className="p-4 sm:p-5 border-b-2 border-slate-200 flex justify-between items-center text-xs sm:text-sm">
          <span className="font-extrabold text-slate-900">
            Menampilkan {displayedVoters.length} dari {filteredVoters.length} Pemilih Terdaftar (Total DPT: {activeVoters.length})
          </span>
          <button
            onClick={() => {
              if (confirm('Yakin ingin mereset seluruh status voting kembali ke "Belum Memilih" dan mengosongkan kotak suara?')) {
                resetAllVotersStatus();
              }
            }}
            className="text-xs sm:text-sm text-rose-700 hover:text-rose-900 font-extrabold flex items-center gap-1.5 cursor-pointer"
          >
            <RotateCcw className="w-4 h-4" />
            Reset Seluruh Status DPT
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs sm:text-sm text-left">
            <thead className="bg-slate-100 text-slate-800 font-black border-b-2 border-slate-200 uppercase tracking-wider text-xs">
              <tr>
                <th className="p-3.5 pl-4 w-10 text-center">
                  <input
                    type="checkbox"
                    checked={isAllSelected}
                    onChange={handleToggleSelectAll}
                    className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 border-slate-300 cursor-pointer"
                    title="Pilih semua siswa di halaman ini"
                  />
                </th>
                <th className="p-3.5">No.</th>
                <th className="p-3.5">NISN / NIP</th>
                <th className="p-3.5">Nama Pemilih</th>
                <th className="p-3.5">Kelas & Jurusan</th>
                <th className="p-3.5 text-center">PIN Rahasia</th>
                <th className="p-3.5 text-center">Status Suara</th>
                <th className="p-3.5 text-right pr-5">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {displayedVoters.map((voter, index) => {
                const isChecked = selectedVoterIds.includes(voter.id);
                return (
                  <tr
                    key={voter.id}
                    className={`transition-colors font-medium ${
                      isChecked ? 'bg-rose-50/60' : 'hover:bg-blue-50/50'
                    }`}
                  >
                    <td className="p-3.5 pl-4 text-center">
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => handleToggleSelectVoter(voter.id)}
                        className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 border-slate-300 cursor-pointer"
                      />
                    </td>
                    <td className="p-3.5 text-slate-600 font-mono font-bold">{index + 1}</td>
                    <td className="p-3.5 font-mono font-black text-slate-950 text-xs sm:text-sm">{voter.nisn}</td>
                    <td className="p-3.5 font-extrabold text-slate-950">{voter.studentName}</td>
                    <td className="p-3.5">
                      <span className="font-black text-slate-900">{voter.classGrade}</span>
                      <span className="block text-xs text-slate-600 truncate max-w-xs font-semibold">
                        {voter.major}
                      </span>
                    </td>
                    <td className="p-3.5 text-center">
                      <span className="font-mono font-black text-blue-900 bg-blue-100 px-2.5 py-1 rounded-md border border-blue-300">
                        {voter.pin}
                      </span>
                    </td>
                    <td className="p-3.5 text-center">
                      {voter.hasVoted ? (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black bg-emerald-100 text-emerald-900 border border-emerald-300">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                          Sudah Memilih
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black bg-amber-100 text-amber-900 border border-amber-300">
                          <Clock className="w-3.5 h-3.5 text-amber-600" />
                          Belum Memilih
                        </span>
                      )}
                    </td>
                    <td className="p-3.5 text-right pr-5">
                      <div className="flex items-center justify-end gap-1.5">
                        {voter.hasVoted && (
                          <button
                            type="button"
                            onClick={() => resetVoterStatus(voter.id)}
                            className="text-xs text-blue-700 hover:text-blue-900 font-bold underline cursor-pointer px-1.5 py-1"
                            title="Kembalikan status belum memilih jika terjadi kesalahan teknis"
                          >
                            Reset
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => setVoterToDelete(voter)}
                          className="px-2.5 py-1 bg-rose-50 hover:bg-rose-100 text-rose-700 hover:text-rose-900 border border-rose-300 rounded-lg text-xs font-black transition-colors cursor-pointer flex items-center gap-1 shadow-2xs"
                          title="Hapus pemilih ini dari DPT (siswa keluar/pindah)"
                        >
                          <Trash2 className="w-3.5 h-3.5 text-rose-600" />
                          <span>Hapus</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}

              {filteredVoters.length === 0 && (
                <tr>
                  <td colSpan={8} className="p-8 text-center text-slate-500 font-medium">
                    Tidak ada data pemilih yang sesuai dengan pencarian atau filter.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Manual Single Voter Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-7 shadow-2xl border-2 border-slate-300 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-black text-slate-950 text-lg">
                Tambah Pemilih Baru ke DPT
              </h3>
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="text-slate-400 hover:text-slate-700 p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Category Selector: Siswa vs Guru */}
            <div className="flex rounded-2xl bg-slate-100 p-1 border border-slate-300 text-xs font-black">
              <button
                type="button"
                onClick={() => handleSelectCategory('SISWA')}
                className={`flex-1 py-2 rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                  voterCategory === 'SISWA'
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'text-slate-700 hover:text-slate-950'
                }`}
              >
                <UserCheck className="w-4 h-4" />
                <span>Pemilih Siswa</span>
              </button>
              <button
                type="button"
                onClick={() => handleSelectCategory('GURU')}
                className={`flex-1 py-2 rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                  voterCategory === 'GURU'
                    ? 'bg-purple-700 text-white shadow-xs'
                    : 'text-slate-700 hover:text-slate-950'
                }`}
              >
                <GraduationCap className="w-4 h-4" />
                <span>Guru / Tendik</span>
              </button>
            </div>

            {voterCategory === 'GURU' && (
              <div className="p-3 bg-purple-50 rounded-2xl border border-purple-200 text-xs text-purple-950 font-medium">
                <strong>Catatan Khusus Guru & Tendik:</strong> Karena Guru/Tendik tidak memiliki NISN, gunakan <strong>NIP</strong>, <strong>NUPTK</strong>, atau <strong>Kode Guru</strong> sekolah sebagai ID pemilih unik.
              </div>
            )}

            <form onSubmit={handleAddSubmit} className="space-y-3.5 text-xs sm:text-sm">
              <div>
                <label className="block font-black text-slate-900 mb-1">
                  {voterCategory === 'SISWA' ? 'Nomor Induk Siswa Nasional (NISN)' : 'NIP / NUPTK / Kode Guru'}
                </label>
                <input
                  type="text"
                  value={nisn}
                  onChange={(e) => setNisn(e.target.value)}
                  placeholder={voterCategory === 'SISWA' ? 'Contoh: 0071234567' : 'Contoh: 198503152010011005 / GURU-01'}
                  className="w-full p-3 rounded-xl border-2 border-slate-300 font-mono font-bold"
                  required
                />
              </div>

              <div>
                <label className="block font-black text-slate-900 mb-1">
                  {voterCategory === 'SISWA' ? 'Nama Lengkap Siswa' : 'Nama Lengkap Guru / Tenaga Kependidikan'}
                </label>
                <input
                  type="text"
                  value={studentName}
                  onChange={(e) => setStudentName(e.target.value)}
                  placeholder={voterCategory === 'SISWA' ? 'Contoh: Muhammad Farhan' : 'Contoh: Dra. Hj. Siti Nurjanah, M.Pd'}
                  className="w-full p-3 rounded-xl border-2 border-slate-300 font-bold"
                  required
                />
              </div>

              <div>
                <label className="block font-black text-slate-900 mb-1">
                  {voterCategory === 'SISWA' ? 'Kelas / Rombel' : 'Jabatan / Satuan Tugas'}
                </label>
                {voterCategory === 'SISWA' ? (
                  <input
                    type="text"
                    value={classGrade}
                    onChange={(e) => setClassGrade(e.target.value)}
                    placeholder="Contoh: XII TKJ 1"
                    className="w-full p-3 rounded-xl border-2 border-slate-300 font-bold"
                    required
                  />
                ) : (
                  <select
                    value={classGrade}
                    onChange={(e) => setClassGrade(e.target.value)}
                    className="w-full p-3 rounded-xl border-2 border-slate-300 font-bold text-slate-900"
                  >
                    <option value="DEWAN GURU">DEWAN GURU</option>
                    <option value="TENAGA KEPENDIDIKAN (TENDIK)">TENAGA KEPENDIDIKAN (TENDIK)</option>
                    <option value="KEPALA SEKOLAH & WAKIL">KEPALA SEKOLAH & WAKIL</option>
                  </select>
                )}
              </div>

              <div>
                <label className="block font-black text-slate-900 mb-1.5">
                  Kompetensi Keahlian / Kategori
                </label>
                {voterCategory === 'SISWA' ? (
                  <select
                    value={major}
                    onChange={(e) => setMajor(e.target.value)}
                    className="w-full p-3 rounded-xl border-2 border-slate-300 font-bold text-slate-900"
                  >
                    <option value="Teknik Komputer & Jaringan (TKJ)">Teknik Komputer & Jaringan (TKJ)</option>
                    <option value="Akuntansi (AKL)">Akuntansi (AKL)</option>
                    <option value="Otomatisasi Perkantoran (OTKP/MPLB)">Otomatisasi Perkantoran (OTKP/MPLB)</option>
                    <option value="Pemasaran/Bisnis Daring (BR)">Pemasaran/Bisnis Daring (BR)</option>
                  </select>
                ) : (
                  <input
                    type="text"
                    value="Pendidik / Tenaga Kependidikan"
                    readOnly
                    className="w-full p-3 rounded-xl border-2 border-slate-200 bg-slate-100 font-bold text-slate-700 cursor-not-allowed"
                  />
                )}
              </div>

              <div className="pt-2 flex justify-end gap-2.5 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 font-bold text-slate-700 hover:bg-slate-100 rounded-xl cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-black rounded-xl shadow-xs cursor-pointer"
                >
                  Simpan ke DPT
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* EXCEL IMPORT MODAL WITH TEMPLATE DOWNLOAD & LIVE DATA PREVIEW   */}
      {/* ============================================================== */}
      {showImportModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-xs overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-5 sm:p-7 shadow-2xl border-2 border-slate-300 space-y-5 my-8">
            {/* Modal Header */}
            <div className="flex items-start justify-between border-b border-slate-200 pb-4">
              <div>
                <span className="text-xs font-black uppercase tracking-wider text-emerald-800 bg-emerald-100 px-3 py-1 rounded-md border border-emerald-300">
                  Fitur Import DPT
                </span>
                <h3 className="font-black text-slate-950 text-xl mt-1.5 flex items-center gap-2">
                  <FileSpreadsheet className="w-5 h-5 text-emerald-600" />
                  Import Data Pemilih via File Excel (.xlsx)
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 font-medium mt-0.5">
                  Unggah langsung file spreadsheet dari Excel atau download template format resmi sekolah
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowImportModal(false)}
                className="text-slate-400 hover:text-slate-700 p-1.5 rounded-lg hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* STEP 1: Download Template */}
            <div className="p-4 bg-emerald-50/70 rounded-2xl border-2 border-emerald-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="space-y-1">
                <h4 className="text-xs sm:text-sm font-black text-emerald-950 flex items-center gap-1.5">
                  <FileCheck className="w-4 h-4 text-emerald-600" />
                  Langkah 1: Unduh Format Template Excel Resmi
                </h4>
                <p className="text-xs text-emerald-800 font-medium leading-relaxed">
                  Format sudah dilengkapi contoh data 4 jurusan SMKS PGRI 1 Sukabumi dan Guru/Tendik.
                </p>
              </div>
              <button
                type="button"
                onClick={downloadVoterExcelTemplate}
                className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-black transition-colors flex items-center justify-center gap-2 shadow-sm shrink-0 cursor-pointer"
              >
                <FileDown className="w-4 h-4" />
                <span>Unduh Format (.xlsx)</span>
              </button>
            </div>

            {/* STEP 2: File Upload / Dropzone */}
            <div className="space-y-2">
              <h4 className="text-xs sm:text-sm font-black text-slate-900">
                Langkah 2: Pilih atau Tarik File Excel (.xlsx / .xls / .csv)
              </h4>

              {/* Hidden file input */}
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileInputChange}
                accept=".xlsx, .xls, .csv, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel"
                className="hidden"
              />

              <div
                onDragOver={(e) => {
                  e.preventDefault();
                  setIsDraggingFile(true);
                }}
                onDragLeave={() => setIsDraggingFile(false)}
                onDrop={handleDropFile}
                onClick={() => fileInputRef.current?.click()}
                className={`border-2 border-dashed rounded-2xl p-6 text-center transition-all cursor-pointer flex flex-col items-center justify-center gap-2.5 ${
                  isDraggingFile
                    ? 'border-emerald-600 bg-emerald-50 scale-[1.01]'
                    : uploadedFileName
                    ? 'border-emerald-400 bg-emerald-50/40 hover:bg-emerald-50/70'
                    : 'border-slate-300 hover:border-emerald-500 bg-slate-50/50'
                }`}
              >
                <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
                  <Upload className="w-6 h-6" />
                </div>

                {isParsingExcel ? (
                  <div className="space-y-1">
                    <div className="w-6 h-6 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
                    <p className="text-xs sm:text-sm font-black text-slate-800">
                      Membaca dan memvalidasi file Excel...
                    </p>
                  </div>
                ) : uploadedFileName ? (
                  <div className="space-y-1">
                    <p className="text-xs sm:text-sm font-black text-emerald-950 flex items-center justify-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      File Terpilih: <span className="font-mono underline">{uploadedFileName}</span>
                    </p>
                    <p className="text-xs text-slate-600 font-medium">
                      Klik area ini jika ingin mengganti dengan file Excel lain
                    </p>
                  </div>
                ) : (
                  <div>
                    <p className="text-xs sm:text-sm font-black text-slate-900">
                      Klik untuk memilih file Excel atau seret berkas ke sini
                    </p>
                    <p className="text-xs text-slate-500 font-medium mt-0.5">
                      Mendukung format Microsoft Excel (.xlsx, .xls) dan CSV
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Error alerts if parsing failed */}
            {importErrors.length > 0 && (
              <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-900 text-xs space-y-1">
                <div className="flex items-center gap-1.5 font-black text-rose-950">
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                  <span>Catatan Validasi File:</span>
                </div>
                <ul className="list-disc pl-5 space-y-0.5 max-h-24 overflow-y-auto font-medium">
                  {importErrors.slice(0, 5).map((err, i) => (
                    <li key={i}>{err}</li>
                  ))}
                  {importErrors.length > 5 && (
                    <li>...dan {importErrors.length - 5} baris lainnya</li>
                  )}
                </ul>
              </div>
            )}

            {/* Success message */}
            {importSuccessMessage && (
              <div className="p-3.5 rounded-2xl bg-emerald-100 border border-emerald-300 text-emerald-950 text-xs sm:text-sm font-black flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                <span>{importSuccessMessage}</span>
              </div>
            )}

            {/* STEP 3: Preview Parsed Data & Options */}
            {parsedVoters.length > 0 && (
              <div className="space-y-3 pt-2 border-t border-slate-200">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-black text-slate-900 uppercase">
                      Pratinjau Data ({parsedVoters.length} Siswa Terdeteksi):
                    </span>
                    <span className="text-xs font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded border border-emerald-300">
                      Format Valid
                    </span>
                  </div>

                  {/* Mode Selector */}
                  <div className="flex items-center gap-4 text-xs font-bold text-slate-800 bg-slate-100 p-1.5 rounded-xl border border-slate-300">
                    <label className="flex items-center gap-1.5 cursor-pointer">
                      <input
                        type="radio"
                        name="importMode"
                        checked={!importReplaceExisting}
                        onChange={() => setImportReplaceExisting(false)}
                        className="text-blue-600 focus:ring-0"
                      />
                      <span>Tambah ke DPT</span>
                    </label>
                    <label className="flex items-center gap-1.5 cursor-pointer text-rose-800">
                      <input
                        type="radio"
                        name="importMode"
                        checked={importReplaceExisting}
                        onChange={() => setImportReplaceExisting(true)}
                        className="text-rose-600 focus:ring-0"
                      />
                      <span>Ganti Seluruh DPT</span>
                    </label>
                  </div>
                </div>

                {/* Preview Table (First 5 Rows) */}
                <div className="overflow-x-auto max-h-48 border border-slate-200 rounded-xl">
                  <table className="w-full text-xs text-left">
                    <thead className="bg-slate-100 text-slate-800 font-black sticky top-0 border-b border-slate-200">
                      <tr>
                        <th className="p-2 pl-3">No.</th>
                        <th className="p-2">NISN</th>
                        <th className="p-2">Nama Siswa</th>
                        <th className="p-2">Kelas</th>
                        <th className="p-2">Jurusan</th>
                        <th className="p-2 text-center">PIN</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {parsedVoters.slice(0, 5).map((pv, idx) => (
                        <tr key={idx} className="hover:bg-slate-50 font-medium">
                          <td className="p-2 pl-3 text-slate-500 font-mono">{idx + 1}</td>
                          <td className="p-2 font-mono font-bold text-slate-900">{pv.nisn}</td>
                          <td className="p-2 font-bold text-slate-900">{pv.studentName}</td>
                          <td className="p-2 text-slate-800">{pv.classGrade}</td>
                          <td className="p-2 text-slate-600 truncate max-w-xs">{pv.major}</td>
                          <td className="p-2 text-center font-mono font-bold text-blue-700">{pv.pin || 'Auto'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                {parsedVoters.length > 5 && (
                  <p className="text-[11px] text-slate-500 italic text-right">
                    ...dan {parsedVoters.length - 5} data pemilih lainnya siap dimasukkan.
                  </p>
                )}
              </div>
            )}

            {/* Modal Actions Footer */}
            <div className="pt-3 flex flex-wrap items-center justify-between gap-3 border-t border-slate-200">
              <button
                type="button"
                onClick={() => setShowImportModal(false)}
                className="px-4 py-2 font-bold text-slate-700 hover:bg-slate-100 rounded-xl cursor-pointer text-xs sm:text-sm"
              >
                Batal
              </button>

              <button
                type="button"
                onClick={handleConfirmImport}
                disabled={parsedVoters.length === 0 || isParsingExcel}
                className={`px-5 py-2.5 rounded-xl text-xs sm:text-sm font-black transition-all flex items-center gap-2 cursor-pointer shadow-md ${
                  parsedVoters.length > 0 && !isParsingExcel
                    ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                    : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                }`}
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>
                  {parsedVoters.length > 0
                    ? `Proses & Masukkan ${parsedVoters.length} Siswa ke DPT`
                    : 'Pilih File Excel Dahulu'}
                </span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Konfirmasi Hapus Single DPT (Siswa Keluar / Pindah) */}
      {voterToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-7 shadow-2xl border-2 border-slate-300 space-y-4 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-2xl bg-rose-100 text-rose-700 flex items-center justify-center border border-rose-300 shadow-2xs shrink-0">
                  <Trash2 className="w-5 h-5 text-rose-600" />
                </div>
                <div>
                  <h3 className="font-black text-slate-950 text-base sm:text-lg leading-tight">
                    Hapus Pemilih dari DPT?
                  </h3>
                  <p className="text-xs text-slate-500 font-semibold mt-0.5">
                    Hapus siswa yang keluar / pindah sekolah
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setVoterToDelete(null)}
                className="text-slate-400 hover:text-slate-700 p-1.5 rounded-xl hover:bg-slate-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Voter Card Details */}
            <div className="bg-slate-50 border-2 border-slate-200 rounded-2xl p-4 space-y-2 text-xs sm:text-sm">
              <div className="flex justify-between border-b border-slate-200 pb-1.5">
                <span className="text-slate-500 font-bold">Nama Pemilih:</span>
                <span className="font-black text-slate-950 text-right">{voterToDelete.studentName}</span>
              </div>
              <div className="flex justify-between border-b border-slate-200 pb-1.5">
                <span className="text-slate-500 font-bold">NISN / NIP:</span>
                <span className="font-mono font-black text-slate-900">{voterToDelete.nisn}</span>
              </div>
              <div className="flex justify-between border-b border-slate-200 pb-1.5">
                <span className="text-slate-500 font-bold">Kelas:</span>
                <span className="font-black text-slate-900">{voterToDelete.classGrade}</span>
              </div>
              <div className="flex justify-between border-b border-slate-200 pb-1.5">
                <span className="text-slate-500 font-bold">Komp. Keahlian:</span>
                <span className="font-bold text-slate-800 text-right truncate max-w-[200px]">{voterToDelete.major}</span>
              </div>
              <div className="flex justify-between items-center pt-0.5">
                <span className="text-slate-500 font-bold">Status Suara:</span>
                <span className={`px-2.5 py-0.5 rounded-full font-black text-xs border ${
                  voterToDelete.hasVoted
                    ? 'bg-emerald-100 text-emerald-900 border-emerald-300'
                    : 'bg-amber-100 text-amber-900 border-amber-300'
                }`}>
                  {voterToDelete.hasVoted ? 'Sudah Memilih' : 'Belum Memilih'}
                </span>
              </div>
            </div>

            <div className="bg-rose-50 border border-rose-200 rounded-xl p-3 text-xs text-rose-900 leading-relaxed font-medium">
              ⚠️ <strong>Perhatian:</strong> Pemilih ini akan dihapus secara permanen dari daftar DPT sekolah dan Cloud Firestore. Kartu suara dan PIN miliknya tidak dapat digunakan lagi.
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setVoterToDelete(null)}
                className="px-4 py-2.5 rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-100 font-bold text-xs sm:text-sm cursor-pointer transition-colors"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleConfirmSingleDelete}
                className="px-5 py-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl font-black text-xs sm:text-sm shadow-md transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <Trash2 className="w-4 h-4" />
                <span>Ya, Hapus Pemilih</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Konfirmasi Hapus Massal DPT Terpilih */}
      {showBatchDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-7 shadow-2xl border-2 border-slate-300 space-y-4 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-2xl bg-rose-100 text-rose-700 flex items-center justify-center border border-rose-300 shadow-2xs shrink-0">
                  <Trash2 className="w-5 h-5 text-rose-600" />
                </div>
                <div>
                  <h3 className="font-black text-slate-950 text-base sm:text-lg leading-tight">
                    Hapus {selectedVoterIds.length} Siswa Terpilih?
                  </h3>
                  <p className="text-xs text-slate-500 font-semibold mt-0.5">
                    Hapus massal siswa keluar / pindah dari DPT
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowBatchDeleteModal(false)}
                className="text-slate-400 hover:text-slate-700 p-1.5 rounded-xl hover:bg-slate-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="bg-rose-50 border border-rose-200 rounded-xl p-3.5 text-xs text-rose-900 leading-relaxed font-medium">
              ⚠️ <strong>Peringatan Hapus Massal:</strong> Anda akan menghapus <strong>{selectedVoterIds.length} siswa terpilih</strong> sekaligus dari Daftar Pemilih Tetap (DPT). Data yang dihapus akan disinkronkan ke Cloud Firestore secara otomatis.
            </div>

            <div className="max-h-48 overflow-y-auto border border-slate-200 rounded-xl divide-y divide-slate-100 bg-slate-50 p-2 text-xs">
              {activeVoters
                .filter((v) => selectedVoterIds.includes(v.id))
                .slice(0, 15)
                .map((v, i) => (
                  <div key={v.id} className="py-1 px-2 flex justify-between items-center">
                    <span className="font-extrabold text-slate-900 truncate max-w-[200px]">
                      {i + 1}. {v.studentName}
                    </span>
                    <span className="text-slate-500 font-mono font-bold">{v.classGrade}</span>
                  </div>
                ))}
              {selectedVoterIds.length > 15 && (
                <div className="text-center py-1 text-slate-500 font-bold italic">
                  + {selectedVoterIds.length - 15} siswa lainnya...
                </div>
              )}
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setShowBatchDeleteModal(false)}
                className="px-4 py-2.5 rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-100 font-bold text-xs sm:text-sm cursor-pointer transition-colors"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleConfirmBatchDelete}
                className="px-5 py-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl font-black text-xs sm:text-sm shadow-md transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <Trash2 className="w-4 h-4" />
                <span>Ya, Hapus {selectedVoterIds.length} Siswa</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Voter Card Print Modal */}
      {showPrintModal && (
        <VoterCardPrintModal
          voters={filteredVoters}
          period={activePeriod}
          onClose={() => setShowPrintModal(false)}
        />
      )}
    </div>
  );
};
