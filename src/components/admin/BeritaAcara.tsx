import React from 'react';
import { useVoting } from '../../context/VotingContext';
import { Printer, Download, Award, ArrowLeft, CheckCircle2 } from 'lucide-react';

interface BeritaAcaraProps {
  onBack: () => void;
}

export const BeritaAcara: React.FC<BeritaAcaraProps> = ({ onBack }) => {
  const {
    activePeriod,
    osisCandidates,
    mpkCandidates,
    osisVotes,
    mpkVotes,
    activeVoters,
  } = useVoting();

  const handlePrint = () => {
    window.print();
  };

  // Calculations
  const totalDpt = activeVoters.length;
  const totalVoted = activeVoters.filter((v) => v.hasVoted).length;
  const unvoted = totalDpt - totalVoted;
  const participationRate = totalDpt > 0 ? (totalVoted / totalDpt) * 100 : 0;

  // OSIS results
  const osisResults = osisCandidates.map((c) => {
    const votesCount = osisVotes.filter((v) => v.candidateId === c.id).length;
    const pct = osisVotes.length > 0 ? (votesCount / osisVotes.length) * 100 : 0;
    return { ...c, votesCount, pct };
  }).sort((a, b) => b.votesCount - a.votesCount);

  // MPK results
  const mpkResults = mpkCandidates.map((c) => {
    const votesCount = mpkVotes.filter((v) => v.candidateId === c.id).length;
    const pct = mpkVotes.length > 0 ? (votesCount / mpkVotes.length) * 100 : 0;
    return { ...c, votesCount, pct };
  }).sort((a, b) => b.votesCount - a.votesCount);

  const winningOsis = osisResults[0];
  const winningMpk = mpkResults[0];

  const currentDateFormatted = new Date().toLocaleDateString('id-ID', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  return (
    <div className="max-w-4xl mx-auto py-6 px-4 space-y-6">
      {/* Top Action Bar (Hidden when printing) */}
      <div className="print:hidden bg-white rounded-xl p-4 border border-slate-200 shadow-xs flex items-center justify-between">
        <button
          onClick={onBack}
          className="text-xs font-semibold text-slate-600 hover:text-slate-900 flex items-center gap-1.5"
        >
          <ArrowLeft className="w-4 h-4" />
          Kembali ke Dashboard Admin
        </button>

        <div className="flex items-center gap-2">
          <button
            onClick={handlePrint}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <Printer className="w-4 h-4" />
            Cetak Berita Acara (A4 / PDF)
          </button>
        </div>
      </div>

      {/* Official Document Sheet */}
      <div className="bg-white rounded-2xl border border-slate-300 p-8 sm:p-12 shadow-md print:shadow-none print:border-none print:p-0 text-slate-900 space-y-6 font-serif">
        {/* Kop Surat Resmi */}
        <div className="border-b-4 border-double border-slate-900 pb-4 text-center relative">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800">
            YAYASAN PEMBINA LEMBAGA PENDIDIKAN PENDIDIKAN DASAR DAN MENENGAH (YPLP DIKDASMEN) PGRI
          </h4>
          <h2 className="text-xl sm:text-2xl font-black uppercase text-slate-950 tracking-tight mt-0.5">
            SMKS PGRI 1 KOTA SUKABUMI
          </h2>
          <p className="text-[11px] font-sans font-semibold text-slate-700">
            KOMPETENSI KEAHLIAN: TEKNIK KOMPUTER & JARINGAN (TKJ) • AKUNTANSI (AKL) • OTOMATISASI PERKANTORAN (OTKP/MPLB) • PEMASARAN/BISNIS DARING (BR)
          </p>
          <p className="text-[10px] font-sans text-slate-600 mt-1">
            Alamat: Jl. Pelabuhan II perum Cipoho Indah, Cikondang, Kec. Citamiang, Kota Sukabumi 43142 • Telp: (0266) 224277 • Email: smkpone@smkspgri1smi.sch.id
          </p>
        </div>

        {/* Title */}
        <div className="text-center space-y-1">
          <h3 className="text-base font-bold underline uppercase tracking-wider">
            BERITA ACARA RAPAT PLENO REKAPITULASI HASIL PEMILIHAN UMUM
          </h3>
          <h4 className="text-sm font-bold uppercase">
            KETUA & WAKIL KETUA OSIS SERTA MPK MASA BAKTI {activePeriod?.academicYear || '2026/2027'}
          </h4>
          <p className="text-xs font-sans text-slate-600 font-mono">
            Nomor: 045.2/KPU-OSIS/SMK-PGRI1/X/{new Date().getFullYear()}
          </p>
        </div>

        {/* Introduction */}
        <div className="text-xs font-sans leading-relaxed text-slate-800 space-y-2">
          <p>
            Pada hari ini, <strong>{currentDateFormatted}</strong>, bertempat di Ruang Aula  SMKS PGRI 1 Kota Sukabumi, telah dilaksanakan Rapat Pleno Terbuka Penetapan Hasil Pemungutan dan Penghitungan Suara Pemilihan Umum Ketua & Wakil Ketua OSIS serta Majelis Permusyawaratan Kelas (MPK) Periode {activePeriod?.academicYear || '2026/2027'} yang diselenggarakan secara digital (e-Voting) berasaskan Langsung, Umum, Bebas, Rahasia, Jujur, dan Adil (LUBER JURDIL).
          </p>
        </div>

        {/* 1. Rekapitulasi Pemilih */}
        <div className="font-sans space-y-2">
          <h4 className="text-xs font-bold uppercase text-slate-900 border-b pb-1">
            I. REKAPITULASI DAFTAR PEMILIH TETAP (DPT) & TINGKAT PARTISIPASI
          </h4>
          <table className="w-full text-xs border border-slate-400">
            <tbody>
              <tr className="border-b border-slate-300">
                <td className="p-2 font-semibold bg-slate-100 w-2/3">Jumlah Pemilih Terdaftar dalam DPT</td>
                <td className="p-2 font-mono font-bold text-right">{totalDpt} Siswa</td>
              </tr>
              <tr className="border-b border-slate-300">
                <td className="p-2 font-semibold bg-slate-100">Jumlah Pemilih yang Menggunakan Hak Suara (Suara Sah)</td>
                <td className="p-2 font-mono font-bold text-right text-emerald-700">{totalVoted} Suara</td>
              </tr>
              <tr className="border-b border-slate-300">
                <td className="p-2 font-semibold bg-slate-100">Jumlah Pemilih yang Tidak Menggunakan Hak Suara / Golput</td>
                <td className="p-2 font-mono font-bold text-right text-amber-700">{unvoted} Siswa</td>
              </tr>
              <tr className="border-b border-slate-300 bg-slate-50">
                <td className="p-2 font-bold">Persentase Partisipasi Pemilih</td>
                <td className="p-2 font-mono font-black text-right text-blue-800">{participationRate.toFixed(2)}%</td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* 2. Hasil Perolehan OSIS */}
        <div className="font-sans space-y-2">
          <h4 className="text-xs font-bold uppercase text-slate-900 border-b pb-1">
            II. HASIL PEROLEHAN SUARA PASANGAN CALON KETUA & WAKIL KETUA OSIS
          </h4>
          <table className="w-full text-xs border border-slate-400 text-left">
            <thead className="bg-slate-100 border-b border-slate-400 font-bold">
              <tr>
                <th className="p-2 text-center w-12">No.</th>
                <th className="p-2">Pasangan Calon (Ketua & Wakil)</th>
                <th className="p-2">Kelas Asal</th>
                <th className="p-2 text-right">Perolehan Suara</th>
                <th className="p-2 text-right">Persentase</th>
                <th className="p-2 text-center">Keterangan</th>
              </tr>
            </thead>
            <tbody>
              {osisResults.map((cand, idx) => (
                <tr key={cand.id} className="border-b border-slate-300">
                  <td className="p-2 text-center font-bold">0{cand.ballotNumber}</td>
                  <td className="p-2 font-semibold">
                    {cand.chairmanName} & {cand.viceChairmanName}
                  </td>
                  <td className="p-2 text-slate-600">
                    {cand.chairmanClass} / {cand.viceChairmanClass}
                  </td>
                  <td className="p-2 text-right font-mono font-bold">{cand.votesCount}</td>
                  <td className="p-2 text-right font-mono font-bold">{cand.pct.toFixed(2)}%</td>
                  <td className="p-2 text-center font-bold">
                    {idx === 0 && cand.votesCount > 0 ? (
                      <span className="text-emerald-700 font-bold">TERPILIH</span>
                    ) : (
                      <span className="text-slate-500">-</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* 3. Hasil Perolehan MPK */}
        <div className="font-sans space-y-2">
          <h4 className="text-xs font-bold uppercase text-slate-900 border-b pb-1">
            III. HASIL PEROLEHAN SUARA PASANGAN CALON KETUA & WAKIL KETUA MPK
          </h4>
          <table className="w-full text-xs border border-slate-400 text-left">
            <thead className="bg-slate-100 border-b border-slate-400 font-bold">
              <tr>
                <th className="p-2 text-center w-12">No.</th>
                <th className="p-2">Pasangan Calon (Ketua & Wakil)</th>
                <th className="p-2">Kelas Asal</th>
                <th className="p-2 text-right">Perolehan Suara</th>
                <th className="p-2 text-right">Persentase</th>
                <th className="p-2 text-center">Keterangan</th>
              </tr>
            </thead>
            <tbody>
              {mpkResults.map((cand, idx) => (
                <tr key={cand.id} className="border-b border-slate-300">
                  <td className="p-2 text-center font-bold">0{cand.ballotNumber}</td>
                  <td className="p-2 font-semibold">
                    {cand.chairmanName} & {cand.viceChairmanName}
                  </td>
                  <td className="p-2 text-slate-600">
                    {cand.chairmanClass} / {cand.viceChairmanClass}
                  </td>
                  <td className="p-2 text-right font-mono font-bold">{cand.votesCount}</td>
                  <td className="p-2 text-right font-mono font-bold">{cand.pct.toFixed(2)}%</td>
                  <td className="p-2 text-center font-bold">
                    {idx === 0 && cand.votesCount > 0 ? (
                      <span className="text-indigo-700 font-bold">TERPILIH</span>
                    ) : (
                      <span className="text-slate-500">-</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Penetapan Pemenang */}
        <div className="p-4 bg-slate-50 border border-slate-300 rounded-xl text-xs font-sans space-y-2">
          <p className="font-bold text-slate-900">
            IV. KEPUTUSAN PENETAPAN PASANGAN CALON TERPILIH:
          </p>
          <p className="leading-relaxed">
            Berdasarkan hasil perolehan suara terbanyak, maka Panitia KPU OSIS menetapkan bahwa:
          </p>
          <ul className="list-disc pl-5 space-y-1 font-semibold">
            <li>
              Ketua & Wakil Ketua OSIS Terpilih:{' '}
              <strong className="text-blue-900 underline">
                {winningOsis ? `${winningOsis.chairmanName} & ${winningOsis.viceChairmanName}` : '-'}
              </strong>{' '}
              (Nomor Urut 0{winningOsis?.ballotNumber})
            </li>
            <li>
              Ketua & Wakil Ketua MPK Terpilih:{' '}
              <strong className="text-indigo-900 underline">
                {winningMpk ? `${winningMpk.chairmanName} & ${winningMpk.viceChairmanName}` : '-'}
              </strong>{' '}
              (Nomor Urut 0{winningMpk?.ballotNumber})
            </li>
          </ul>
        </div>

        {/* Signatures */}
        <div className="pt-8 font-sans text-xs space-y-12">
          <div className="flex justify-between items-center text-slate-800">
            <div></div>
            <p>
              Ditetapkan di: Kota Sukabumi<br />
              Pada tanggal: {currentDateFormatted}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-8 text-center">
            {/* Left Column */}
            <div className="space-y-16">
              <div>
                <p className="text-slate-600 font-semibold">Waka Bidang Kesiswaan,</p>
              </div>
              <div>
                <strong className="font-bold underline block">Dadan Ahmad Hamdani, S.Kom.</strong>
              </div>
            </div>

            {/* Right Column */}
            <div className="space-y-16">
              <div>
                <p className="text-slate-600 font-semibold">Ketua Panitia Pemilihan (KPU OSIS),</p>
              </div>
              <div>
                <strong className="font-bold underline block">Dery Cahyadi, S.Pd</strong>
              </div>
            </div>
          </div>

          <div className="pt-4 text-center space-y-16">
            <div>
              <p className="text-slate-600 font-semibold">Mengetahui & Menyetujui,</p>
              <p className="font-bold text-slate-900">Kepala SMKS PGRI 1 Kota Sukabumi</p>
            </div>
            <div>
              <strong className="font-bold underline block text-sm">Riswan Safari, S.Pd.MM.</strong>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
