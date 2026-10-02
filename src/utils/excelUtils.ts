import * as XLSX from 'xlsx';
import { Voter } from '../types/voting';
import { ensureUniquePins, generateUniquePin } from './pinUtils';

export interface ParsedVoterItem {
  nisn: string;
  studentName: string;
  classGrade: string;
  major: string;
  pin?: string;
}

export interface ParseExcelResult {
  success: boolean;
  voters: ParsedVoterItem[];
  errors: string[];
  totalRows: number;
}

/**
 * Downloads a pre-formatted Excel template (.xlsx) with sample data from SMKS PGRI 1 Sukabumi
 */
export const downloadVoterExcelTemplate = () => {
  const templateHeaders = ['NO', 'NISN_ATAU_NIP', 'NAMA_PEMILIH', 'KELAS_ATAU_JABATAN', 'JURUSAN', 'PIN_OPSIONAL'];

  const sampleData = [
    templateHeaders,
    [1, '0081234001', 'Muhammad Farhan Pratama', 'XII TKJ 1', 'Teknik Komputer & Jaringan (TKJ)', ''],
    [2, '0081234002', 'Siti Nurhaliza Azzahra', 'XII AKL 1', 'Akuntansi (AKL)', ''],
    [3, '0081234003', 'Ahmad Rizki Fauzi', 'XI MPLB 2', 'Otomatisasi Perkantoran (OTKP/MPLB)', ''],
    [4, '0081234004', 'Dewi Rahmawati Lestari', 'X BR 1', 'Pemasaran/Bisnis Daring (BR)', ''],
    [5, '198503152010011005', 'Budi Santoso, S.Pd. (Contoh NIP Guru)', 'DEWAN GURU', 'Pendidik / Tenaga Kependidikan', ''],
    [6, '0081234006', 'Anisa Putri Maharani', 'XI TKJ 2', 'Teknik Komputer & Jaringan (TKJ)', ''],
    [7, '0081234007', 'Fajar Ramadhan', 'X AKL 2', 'Akuntansi (AKL)', ''],
    [8, '0081234008', 'Rina Anggraeni', 'XII MPLB 1', 'Otomatisasi Perkantoran (OTKP/MPLB)', ''],
    [9, '0081234009', 'Yoga Pratama Yudha', 'XI BR 2', 'Pemasaran/Bisnis Daring (BR)', ''],
    [10, '197204121998022001', 'Dra. Hj. Sri Wahyuni (Contoh NIP Guru)', 'DEWAN GURU', 'Pendidik / Tenaga Kependidikan', ''],
  ];

  const ws = XLSX.utils.aoa_to_sheet(sampleData);

  // Set column widths
  ws['!cols'] = [
    { wch: 6 },  // NO
    { wch: 24 }, // NISN_ATAU_NIP
    { wch: 38 }, // NAMA_PEMILIH
    { wch: 22 }, // KELAS_ATAU_JABATAN
    { wch: 40 }, // JURUSAN
    { wch: 18 }, // PIN_OPSIONAL
  ];

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Template_DPT');
  XLSX.writeFile(wb, 'Format_Import_DPT_SMKS_PGRI_1.xlsx');
};

/**
 * Exports current voters list to an Excel spreadsheet (.xlsx)
 */
export const exportVotersToExcel = (voters: Voter[], periodAcademicYear = '2026/2027') => {
  const exportData = [
    ['NO', 'NISN', 'NAMA_SISWA', 'KELAS', 'JURUSAN', 'PIN_KARTU_SUARA', 'STATUS_HAK_PILIH', 'WAKTU_PENCOBLOSAN'],
    ...voters.map((v, i) => [
      i + 1,
      v.nisn,
      v.studentName,
      v.classGrade,
      v.major,
      v.pin,
      v.hasVoted ? 'Sudah Memilih' : 'Belum Memilih',
      v.votedAt ? new Date(v.votedAt).toLocaleString('id-ID') : '-',
    ]),
  ];

  const ws = XLSX.utils.aoa_to_sheet(exportData);
  ws['!cols'] = [
    { wch: 6 },
    { wch: 18 },
    { wch: 32 },
    { wch: 18 },
    { wch: 40 },
    { wch: 18 },
    { wch: 18 },
    { wch: 24 },
  ];

  const safeYear = periodAcademicYear.replace(/[^a-zA-Z0-9]/g, '_');
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'DPT_Pemilu');
  XLSX.writeFile(wb, `Data_DPT_Pemilu_SMKS_PGRI_1_${safeYear}.xlsx`);
};

/**
 * Parses an uploaded Excel (.xlsx, .xls) or CSV file into voter objects
 */
export const parseVotersExcelFile = (file: File): Promise<ParseExcelResult> => {
  return new Promise((resolve) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const buffer = e.target?.result;
        if (!buffer) {
          resolve({
            success: false,
            voters: [],
            errors: ['File kosong atau tidak dapat dibaca.'],
            totalRows: 0,
          });
          return;
        }

        const wb = XLSX.read(buffer, { type: 'array' });
        const firstSheetName = wb.SheetNames[0];
        if (!firstSheetName) {
          resolve({
            success: false,
            voters: [],
            errors: ['File Excel tidak memiliki lembar kerja (worksheet).'],
            totalRows: 0,
          });
          return;
        }

        const worksheet = wb.Sheets[firstSheetName];
        const rawRows: any[][] = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

        if (rawRows.length < 2) {
          resolve({
            success: false,
            voters: [],
            errors: ['File Excel tidak memiliki baris data (hanya header atau kosong).'],
            totalRows: 0,
          });
          return;
        }

        // Header detection
        const headerRow = rawRows[0].map((h) => String(h || '').trim().toLowerCase());

        let nisnIdx = headerRow.findIndex(
          (h) =>
            h.includes('nisn') ||
            h.includes('nis') ||
            h.includes('nip') ||
            h.includes('nuptk') ||
            h.includes('induk') ||
            h.includes('id_pemilih') ||
            h.includes('id')
        );
        let nameIdx = headerRow.findIndex((h) => h.includes('nama') || h.includes('siswa') || h.includes('guru') || h.includes('pemilih') || h.includes('name'));
        let classIdx = headerRow.findIndex((h) => h.includes('kelas') || h.includes('jabatan') || h.includes('rombel') || h.includes('class'));
        let majorIdx = headerRow.findIndex((h) => h.includes('jurusan') || h.includes('prodi') || h.includes('keahlian') || h.includes('major'));
        let pinIdx = headerRow.findIndex((h) => h.includes('pin') || h.includes('token') || h.includes('password'));

        // Fallback positional indexing if headers are custom
        if (nisnIdx === -1 && rawRows[0].length >= 3) {
          const hasNoCol = headerRow[0]?.includes('no') || !isNaN(Number(rawRows[1]?.[0]));
          if (hasNoCol) {
            nisnIdx = 1;
            nameIdx = 2;
            classIdx = 3;
            majorIdx = 4;
            pinIdx = 5;
          } else {
            nisnIdx = 0;
            nameIdx = 1;
            classIdx = 2;
            majorIdx = 3;
            pinIdx = 4;
          }
        }

        const voters: ParsedVoterItem[] = [];
        const errors: string[] = [];
        const seenNisns = new Set<string>();

        for (let i = 1; i < rawRows.length; i++) {
          const row = rawRows[i];
          if (!row || row.length === 0 || row.every((c) => c === undefined || c === null || c === '')) {
            continue; // Skip blank lines
          }

          const rawNisn = String(row[nisnIdx] ?? '').trim();
          const rawName = String(row[nameIdx] ?? '').trim();
          const rawClass = String(row[classIdx] ?? '').trim() || 'X TKJ 1';
          let rawMajor = String(row[majorIdx] ?? '').trim();
          const rawPin = String(row[pinIdx] ?? '').trim();

          if (!rawNisn || !rawName) {
            errors.push(`Baris ${i + 1}: NISN atau Nama Siswa tidak boleh kosong.`);
            continue;
          }

          if (seenNisns.has(rawNisn)) {
            errors.push(`Baris ${i + 1}: NISN "${rawNisn}" duplikat dalam file.`);
            continue;
          }
          seenNisns.add(rawNisn);

          // Auto-assign major based on class if major is empty
          if (!rawMajor) {
            const upperClass = rawClass.toUpperCase();
            if (upperClass.includes('TKJ')) {
              rawMajor = 'Teknik Komputer & Jaringan (TKJ)';
            } else if (upperClass.includes('AKL') || upperClass.includes('AK')) {
              rawMajor = 'Akuntansi (AKL)';
            } else if (upperClass.includes('MPLB') || upperClass.includes('OTKP')) {
              rawMajor = 'Otomatisasi Perkantoran (OTKP/MPLB)';
            } else if (upperClass.includes('BR') || upperClass.includes('BD')) {
              rawMajor = 'Pemasaran/Bisnis Daring (BR)';
            } else if (upperClass.includes('GURU') || upperClass.includes('TENDIK')) {
              rawMajor = 'Pendidik / Tenaga Kependidikan';
            } else {
              rawMajor = 'Teknik Komputer & Jaringan (TKJ)';
            }
          }

          voters.push({
            nisn: rawNisn,
            studentName: rawName,
            classGrade: rawClass,
            major: rawMajor,
            pin: rawPin.length === 6 ? rawPin : undefined,
          });
        }

        const uniqueVoters = ensureUniquePins(voters);

        resolve({
          success: uniqueVoters.length > 0,
          voters: uniqueVoters,
          errors,
          totalRows: uniqueVoters.length,
        });
      } catch (err: any) {
        resolve({
          success: false,
          voters: [],
          errors: [`Gagal memproses file Excel: ${err?.message || 'Format tidak valid'}`],
          totalRows: 0,
        });
      }
    };

    reader.onerror = () => {
      resolve({
        success: false,
        voters: [],
        errors: ['Gagal membaca berkas dari sistem lokal.'],
        totalRows: 0,
      });
    };

    reader.readAsArrayBuffer(file);
  });
};
