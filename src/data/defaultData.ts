import { Candidate, Period, Voter, Vote, AuditLog, AdminUser, TimelineStep } from '../types/voting';

export const OFFICIAL_MAJORS = [
  'Teknik Komputer & Jaringan (TKJ)',
  'Akuntansi (AKL)',
  'Otomatisasi Perkantoran (OTKP/MPLB)',
  'Pemasaran/Bisnis Daring (BR)',
] as const;

export const DEFAULT_PERIODS: Period[] = [
  {
    id: 'period-2026-2027',
    academicYear: '2026/2027',
    title: 'Pemilihan Umum Ketua & Wakil Ketua OSIS - MPK Periode 2026/2027',
    isActive: true,
    status: 'OPEN',
    isResultPublished: true,
    startTime: '2026-10-01T07:30:00',
    endTime: '2026-10-01T15:00:00',
    description: 'Pemilihan serentak pengurus Organisasi Siswa Intra Sekolah (OSIS) dan Majelis Permusyawaratan Kelas (MPK) SMKS PGRI 1 Kota Sukabumi.',
    createdAt: '2026-09-15T08:00:00',
  },
  {
    id: 'period-2025-2026',
    academicYear: '2025/2026',
    title: 'Pemilihan Umum OSIS & MPK Periode 2025/2026 (Arsip)',
    isActive: false,
    status: 'CLOSED',
    isResultPublished: true,
    startTime: '2025-09-25T07:30:00',
    endTime: '2025-09-25T15:00:00',
    description: 'Arsip resmi pemilu sekolah periode 2025/2026 dengan tingkat partisipasi 96.4%.',
    createdAt: '2025-09-01T08:00:00',
  },
];

export const DEFAULT_CANDIDATES: Candidate[] = [
  // OSIS CANDIDATES (ACTIVE PERIOD)
  {
    id: 'cand-osis-01',
    periodId: 'period-2026-2027',
    category: 'OSIS',
    ballotNumber: 1,
    chairmanName: 'Carisa Hazar Nur Alfiyah',
    viceChairmanName: 'Reviga Destia Wijayanti',
    chairmanClass: 'XI MP 1',
    viceChairmanClass: 'XI MP 1',
    slogan: 'BERSINAR: Bersama Inovatif, Santun, Inspiratif, dan Responsif',
    vision: 'Mewujudkan OSIS SMKS PGRI 1 Kota Sukabumi sebagai katalisator potensi siswa yang unggul di bidang teknologi vokasi, berkarakter mulia, serta tanggap terhadap aspirasi warga sekolah.',
    mission: [
      'Mengoptimalkan digitalisasi wadah aspirasi siswa berbasis web dan media interaktif.',
      'Menyelenggarakan program "PGRI 1 Tech & Creative Festival" tingkat kota.',
      'Mempererat kolaborasi lintas kompetensi keahlian melalui kegiatan ekstrakurikuler unggulan.',
      'Menggalakkan gerakan Green Campus, literasi digital, dan kepedulian sosial di lingkungan sekolah.',
    ],
    programs: [
      'Pojok Aspirasi Digital & Aplikasi Bank Ide Siswa',
      'PGRI 1 Fest: Lomba IT, Olahraga, dan Seni antar kelas',
      'Workshop Kesiapan Kerja & Sertifikasi Industri bersama alumni',
      'Gerakan Jumat Berkah dan Kampus Ramah Lingkungan',
    ],
    photoUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=700&q=80',
    badgeColor: 'blue',
  },
  {
    id: 'cand-osis-02',
    periodId: 'period-2026-2027',
    category: 'OSIS',
    ballotNumber: 2,
    chairmanName: 'Mahdi Gunawan',
    viceChairmanName: 'Siti Fauziah',
    chairmanClass: 'XI TKJ 1',
    viceChairmanClass: 'XI MP 1',
    slogan: 'AKSI NYATA: Amanah, Kolaboratif, Solutif, dan Inklusif',
    vision: 'Membangun iklim organisasi sekolah yang berintegritas tinggi, menumbuhkan jiwa wirausaha muda kejuruan, dan menciptakan suasana sekolah yang suportif bagi seluruh bakat siswa.',
    mission: [
      'Menyediakan platform pembinaan kepemimpinan dan kewirausahaan siswa (Business Incubator Siswa).',
      'Mengaktifkan kembali forum dialog terbuka "Bicara Bersama Pengurus OSIS" secara berkala.',
      'Meningkatkan transparansi pendanaan kegiatan organisasi siswa demi akuntabilitas.',
      'Mendukung program beasiswa peduli kawan dan bantuan perlengkapan praktek kejuruan.',
    ],
    programs: [
      'Bazar Vokasi & Expo Kewirausahaan Siswa PGRI 1',
      'Student Careline & Bimbingan Sebaya (Peer Tutoring)',
      'Pengadaan Fasilitas Rekreasi Sehat di area istirahat siswa',
      'Turnamen E-Sport & Futsal Kesiswaan Piala Bergilir',
    ],
    photoUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=700&q=80',
    badgeColor: 'emerald',
  },

  // MPK CANDIDATES (ACTIVE PERIOD)
  {
    id: 'cand-mpk-01',
    periodId: 'period-2026-2027',
    category: 'MPK',
    ballotNumber: 1,
    chairmanName: 'Nurwan Oktara Kurniawan',
    viceChairmanName: 'Erina Indrawati',
    chairmanClass: 'XI TKJ 1',
    viceChairmanClass: 'XI BR 1',
    slogan: 'TRANSPARAN & KRITIS: Pengawal Suara Siswa Demi Kemajuan Bersama',
    vision: 'Mewujudkan Majelis Permusyawaratan Kelas (MPK) yang kritis, objektif, transparan, dan proaktif dalam mengawasi serta bersinergi dengan OSIS demi aspirasi siswa yang terakomodasi.',
    mission: [
      'Membangun sistem pengawasan program kerja OSIS yang transparan dengan laporan berkala.',
      'Menyelenggarakan sidang perwakilan kelas triwulanan secara terbuka dan musyawarah mufakat.',
      'Menjadi jembatan aspirasi yang cepat tanggap antara siswa, guru pamong, dan kepala sekolah.',
      'Memberikan evaluasi konstruktif dan rekomendasi strategis terhadap setiap kegiatan kesiswaan.',
    ],
    programs: [
      'Buku Panduan Standar Operasional Prosedur Pengawasan Kegiatan Siswa',
      'Kotak Aspirasi Online MPK & Forum Diskusi Kelas',
      'Rapat Evaluasi Triwulan Kinerja OSIS Terbuka',
      'Audit Transparansi Anggaran Kegiatan Siswa',
    ],
    photoUrl: 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?auto=format&fit=crop&w=700&q=80',
    badgeColor: 'indigo',
  },
  {
    id: 'cand-mpk-02',
    periodId: 'period-2026-2027',
    category: 'MPK',
    ballotNumber: 2,
    chairmanName: 'Bayu Saputra',
    viceChairmanName: 'Natasya Dwi Ramadhani',
    chairmanClass: 'XI BR 1',
    viceChairmanClass: 'XI MP 1',
    slogan: 'ASPIRATIF & NYATA: MPK Bersahabat, Adil, dan Terpercaya',
    vision: 'Menjadikan MPK sebagai representasi representatif seluruh perwakilan kelas yang egaliter, profesional, dan berdedikasi menjaga iklim demokrasi sekolah yang sehat.',
    mission: [
      'Memastikan setiap suara dari tiap ruang kelas didengarkan tanpa diskriminasi.',
      'Meningkatkan kesadaran berorganisasi yang santun dan taat pada AD/ART kesiswaan.',
      'Mendampingi pelaksanaan program kerja OSIS agar tepat sasaran dan bermanfaat nyata.',
      'Menyusun laporan pertanggungjawaban kepengurusan yang akurat dan terbuka untuk umum.',
    ],
    programs: [
      'Kunjungan Ruang Kelas Berkeliling (MPK Goes to Class)',
      'Kanal Pengaduan Hak Belajar Siswa Rahasia',
      'Pelatihan Dasar Tata Sidang & Legislatif Muda',
      'Publikasi Buletin Hasil Musyawarah Siswa',
    ],
    photoUrl: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=700&q=80',
    badgeColor: 'purple',
  },
];

export const INITIAL_ADMINS: AdminUser[] = [
  {
    id: 'admin-01',
    username: 'admin.kesiswaan',
    fullName: 'Dadan Ahmad Hamdani, S.Kom.',
    role: 'SUPER_ADMIN',
    title: 'Wakil Kepala Sekolah Bidang Kesiswaan',
    password: 'admin123',
  },
  {
    id: 'admin-02',
    username: 'panitia.tps',
    fullName: 'Dery Cahyadi, S.Pd',
    role: 'OPERATOR_TPS',
    title: 'Ketua Panitia Pemilihan Umum Sekolah (KPU OSIS)',
    password: 'admin123',
  },
];

// Data DPT awal hanya yang diunggah oleh panitia / admin, tanpa data dummy bawaan
export const INITIAL_VOTERS: Voter[] = [];

// Kotak suara awal kosong (hanya suara riil yang dicoblos pemilih)
export const INITIAL_VOTES: Vote[] = [];

export const INITIAL_AUDIT_LOGS: AuditLog[] = [
  {
    id: 'log-01',
    timestamp: '2026-10-01T07:30:00',
    action: 'PEMBUKAAN_TPS',
    details: 'TPS Digital resmi dibuka oleh Operator TPS (Dery Cahyadi, S.Pd)',
    userType: 'OPERATOR',
  },
  {
    id: 'log-02',
    timestamp: '2026-10-01T07:32:00',
    action: 'VERIFIKASI_DPT',
    details: 'Pengecekan integritas data pemilih tetap DPT periode 2026/2027 berhasil.',
    userType: 'SYSTEM',
  },
  {
    id: 'log-03',
    timestamp: '2026-10-01T08:00:00',
    action: 'PUBLISH_QUICK_COUNT',
    details: 'Penayangan grafik quick count langsung diaktifkan untuk publik.',
    userType: 'ADMIN',
  },
];

export const DEFAULT_TIMELINE_STEPS: TimelineStep[] = [
  {
    id: 'step-1',
    periodId: 'period-2026-2027',
    stepNumber: 1,
    title: 'Penjaringan & Verifikasi Calon',
    dateRange: '15 - 20 September 2026',
    description: 'Pendaftaran berkas syarat kepemimpinan calon Ketua & Wakil Ketua OSIS-MPK.',
    status: 'DONE',
    location: 'Sekretariat KPU OSIS (Ruang Multimedia)',
  },
  {
    id: 'step-2',
    periodId: 'period-2026-2027',
    stepNumber: 2,
    title: 'Pengundian Nomor Urut Paslon',
    dateRange: '24 September 2026',
    description: 'Penetapan nomor urut resmi dan penandatanganan pakta integritas pemilu damai.',
    status: 'DONE',
    location: 'Aula Graha PGRI 1 Sukabumi',
  },
  {
    id: 'step-3',
    periodId: 'period-2026-2027',
    stepNumber: 3,
    title: 'Kampanye & Debat Terbuka Siswa',
    dateRange: '26 - 29 September 2026',
    description: 'Penyampaian orasi visi, misi, dan debat gagasan program kerja antar pasangan calon.',
    status: 'DONE',
    location: 'Lapangan Upacara Utama',
  },
  {
    id: 'step-4',
    periodId: 'period-2026-2027',
    stepNumber: 4,
    title: 'Pemungutan Suara Digital (TPS)',
    dateRange: '01 Oktober 2026 (07.30 - 15.00 WIB)',
    description: 'Pencoblosan digital serentak melalui sistem e-Voting di bilik lab komputer & ponsel.',
    status: 'ACTIVE',
    location: 'Bilik TPS Digital & Lab Multimedia',
  },
  {
    id: 'step-5',
    periodId: 'period-2026-2027',
    stepNumber: 5,
    title: 'Sidang Pleno & Pelantikan',
    dateRange: '03 Oktober 2026',
    description: 'Pengesahan surat keputusan Kepala Sekolah dan serah terima jabatan pengurus baru.',
    status: 'UPCOMING',
    location: 'Aula Graha PGRI 1 Sukabumi',
  },
];

