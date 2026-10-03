import React from 'react';
import { useVoting } from '../../context/VotingContext';
import { PemilosLogo } from '../PemilosLogo';
import { Printer, ArrowLeft, FileCheck, CheckCircle2 } from 'lucide-react';

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
    const printElement = document.getElementById('berita-acara-print-area');
    if (!printElement) {
      window.print();
      return;
    }

    // Create an isolated hidden iframe for 100% clean print without ANY external webpage elements
    const iframe = document.createElement('iframe');
    iframe.style.position = 'fixed';
    iframe.style.right = '0';
    iframe.style.bottom = '0';
    iframe.style.width = '0';
    iframe.style.height = '0';
    iframe.style.border = '0';
    iframe.setAttribute('title', 'Cetak Berita Acara');
    document.body.appendChild(iframe);

    const doc = iframe.contentWindow?.document;
    if (!doc) {
      window.print();
      return;
    }

    doc.open();
    doc.write(`
      <!DOCTYPE html>
      <html lang="id">
        <head>
          <meta charset="UTF-8">
          <title>Berita Acara Rekapitulasi Pemilu - SMKS PGRI 1 Kota Sukabumi</title>
          <style>
            @page {
              size: A4 portrait;
              margin: 10mm 15mm 10mm 15mm;
            }
            * {
              box-sizing: border-box;
            }
            body {
              font-family: 'Times New Roman', Times, serif;
              color: #000000;
              background-color: #ffffff;
              margin: 0;
              padding: 0;
              font-size: 10pt;
              line-height: 1.4;
              -webkit-print-color-adjust: exact !important;
              print-color-adjust: exact !important;
            }
            table {
              border-collapse: collapse;
              width: 100%;
              font-size: 9pt;
              margin-top: 6px;
              margin-bottom: 6px;
              page-break-inside: avoid;
            }
            th, td {
              border: 1px solid #000000;
              padding: 4px 6px;
              color: #000000;
              text-align: left;
            }
            th {
              background-color: #f1f5f9;
              font-weight: bold;
            }
            .avoid-break {
              page-break-inside: avoid;
              break-inside: avoid;
            }
            svg, img {
              display: inline-block;
              max-width: 100%;
            }
            button, .print\\:hidden, .no-print {
              display: none !important;
            }
          </style>
        </head>
        <body>
          <div style="width: 100%; margin: 0; padding: 0;">
            ${printElement.innerHTML}
          </div>
        </body>
      </html>
    `);
    doc.close();

    setTimeout(() => {
      try {
        iframe.contentWindow?.focus();
        iframe.contentWindow?.print();
      } catch {
        window.print();
      } finally {
        setTimeout(() => {
          try {
            document.body.removeChild(iframe);
          } catch {
            // ignore
          }
        }, 2000);
      }
    }, 400);
  };

  // Calculations
  const totalDpt = activeVoters.length;
  const totalVoted = activeVoters.filter((v) => v.hasVoted).length;
  const unvoted = totalDpt - totalVoted;
  const participationRate = totalDpt > 0 ? (totalVoted / totalDpt) * 100 : 0;

  // OSIS results
  const osisResults = osisCandidates
    .map((c) => {
      const votesCount = osisVotes.filter((v) => v.candidateId === c.id).length;
      const pct = osisVotes.length > 0 ? (votesCount / osisVotes.length) * 100 : 0;
      return { ...c, votesCount, pct };
    })
    .sort((a, b) => b.votesCount - a.votesCount);

  // MPK results
  const mpkResults = mpkCandidates
    .map((c) => {
      const votesCount = mpkVotes.filter((v) => v.candidateId === c.id).length;
      const pct = mpkVotes.length > 0 ? (votesCount / mpkVotes.length) * 100 : 0;
      return { ...c, votesCount, pct };
    })
    .sort((a, b) => b.votesCount - a.votesCount);

  const winningOsis = osisResults[0];
  const winningMpk = mpkResults[0];

  const currentDateFormatted = new Date().toLocaleDateString('id-ID', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  return (
    <div className="berita-acara-container max-w-4xl mx-auto py-4 px-2 sm:px-4 space-y-4 print:p-0 print:m-0 print:max-w-none print:space-y-0">
      {/* Embedded Strict Print CSS Styles */}
      <style>{`
        @media print {
          @page {
            size: A4 portrait !important;
            margin: 10mm 15mm 10mm 15mm !important;
          }

          /* CRITICAL: Force hide all elements on page */
          body * {
            visibility: hidden !important;
          }

          /* ONLY show the official Berita Acara document */
          #berita-acara-print-area,
          #berita-acara-print-area * {
            visibility: visible !important;
          }

          #berita-acara-print-area {
            position: absolute !important;
            left: 0 !important;
            top: 0 !important;
            width: 100% !important;
            margin: 0 !important;
            padding: 0 !important;
            border: none !important;
            box-shadow: none !important;
            background: #ffffff !important;
            color: #000000 !important;
          }

          /* Destroy display of web chrome */
          header,
          nav,
          footer,
          [class*="print:hidden"],
          .print-hidden,
          #app-navbar,
          #app-footer,
          .admin-header-panel,
          .admin-tab-bar {
            display: none !important;
            height: 0 !important;
            overflow: hidden !important;
          }

          html, body {
            background: #ffffff !important;
            color: #000000 !important;
            margin: 0 !important;
            padding: 0 !important;
            width: 100% !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }

          .berita-acara-sheet {
            box-shadow: none !important;
            border: none !important;
            border-radius: 0 !important;
            padding: 0 !important;
            margin: 0 !important;
            width: 100% !important;
            max-width: 100% !important;
            font-size: 10pt !important;
            line-height: 1.4 !important;
          }

          table {
            border-collapse: collapse !important;
            width: 100% !important;
            font-size: 9pt !important;
            page-break-inside: avoid !important;
          }

          th, td {
            border: 1px solid #000000 !important;
            padding: 4px 6px !important;
            color: #000000 !important;
          }

          th {
            background-color: #f1f5f9 !important;
            font-weight: bold !important;
          }

          .avoid-break {
            page-break-inside: avoid !important;
            break-inside: avoid !important;
          }
        }
      `}</style>

      {/* Top Action Bar (Hidden when printing) */}
      <div className="print:hidden bg-white rounded-2xl p-4 border-2 border-slate-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <button
          onClick={onBack}
          className="text-xs sm:text-sm font-bold text-slate-700 hover:text-slate-950 flex items-center gap-1.5 cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Kembali ke Dashboard Admin</span>
        </button>

        <div className="flex items-center gap-2.5">
          <button
            onClick={handlePrint}
            className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs sm:text-sm font-black shadow-md shadow-blue-600/30 transition-all flex items-center gap-2 cursor-pointer"
          >
            <Printer className="w-4 h-4" />
            <span>Cetak Berita Acara (A4 / PDF)</span>
          </button>
        </div>
      </div>

      {/* Print Guidance Note (Hidden when printing) */}
      <div className="print:hidden bg-blue-50 border border-blue-200 text-blue-900 rounded-xl px-4 py-2.5 text-xs flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <FileCheck className="w-4 h-4 text-blue-700 shrink-0" />
          <span>
            <strong>Siap Dicetak:</strong> Halaman web, tombol, navbar, dan header admin otomatis disembunyikan saat mencetak. Hanya dokumen resmi Berita Acara yang akan dicetak di kertas A4.
          </span>
        </div>
        <span className="font-mono font-bold bg-blue-100 text-blue-800 px-2 py-0.5 rounded text-[11px] shrink-0">
          Format: A4 Portrait
        </span>
      </div>

      {/* Official Document Sheet */}
      <div
        id="berita-acara-print-area"
        className="berita-acara-sheet bg-white rounded-2xl border-2 border-slate-300 p-8 sm:p-12 shadow-xl print:shadow-none print:border-none print:p-0 text-slate-950 space-y-5 font-serif"
      >
        {/* Kop Surat Resmi dengan Logo Sekolah */}
        <div className="border-b-4 border-double border-slate-950 pb-3 flex items-center gap-4">
          {/* Logo Pemilos / SMKS PGRI 1 */}
          <div className="w-20 h-20 shrink-0 flex items-center justify-center p-1">
            <PemilosLogo className="w-18 h-18" />
          </div>

          {/* Kop Teks */}
          <div className="flex-1 text-center pr-4">
            <h4 className="text-[11px] sm:text-xs font-bold uppercase tracking-wider text-slate-900 leading-tight">
              YAYASAN PEMBINA LEMBAGA PENDIDIKAN PENDIDIKAN DASAR DAN MENENGAH (YPLP DIKDASMEN) PGRI
            </h4>
            <h2 className="text-xl sm:text-2xl font-black uppercase text-slate-950 tracking-tight mt-0.5 leading-tight font-sans">
              SMKS PGRI 1 KOTA SUKABUMI
            </h2>
            <p className="text-[10.5px] font-sans font-bold text-slate-800 leading-tight mt-1">
              KOMPETENSI KEAHLIAN: TEKNIK KOMPUTER & JARINGAN (TKJ) • AKUNTANSI (AKL) • OTOMATISASI PERKANTORAN (OTKP/MPLB) • PEMASARAN/BISNIS DARING (BR)
            </p>
            <p className="text-[9.5px] font-sans text-slate-700 leading-tight mt-0.5">
              Alamat: Jl. Pelabuhan II perum Cipoho Indah, Cikondang, Kec. Citamiang, Kota Sukabumi 43142 • Telp: (0266) 224277 • Email: smkpone@smkspgri1smi.sch.id
            </p>
          </div>
        </div>

        {/* Title */}
        <div className="text-center space-y-1 pt-1">
          <h3 className="text-base sm:text-lg font-black underline uppercase tracking-wider text-slate-950">
            BERITA ACARA RAPAT PLENO REKAPITULASI HASIL PEMILIHAN UMUM
          </h3>
          <h4 className="text-xs sm:text-sm font-bold uppercase text-slate-900">
            KETUA & WAKIL KETUA OSIS SERTA MPK MASA BAKTI {activePeriod?.academicYear || '2026/2027'}
          </h4>
          <p className="text-xs font-sans text-slate-700 font-mono">
            Nomor: 045.2/KPU-OSIS/SMK-PGRI1/X/{new Date().getFullYear()}
          </p>
        </div>

        {/* Introduction */}
        <div className="text-xs sm:text-sm font-sans leading-relaxed text-slate-900 text-justify">
          <p>
            Pada hari ini, <strong>{currentDateFormatted}</strong>, bertempat di Ruang Aula Utama SMKS PGRI 1 Kota Sukabumi, telah dilaksanakan Rapat Pleno Terbuka Penetapan Hasil Pemungutan dan Penghitungan Suara Pemilihan Umum Ketua & Wakil Ketua OSIS serta Majelis Permusyawaratan Kelas (MPK) Periode Masa Bakti <strong>{activePeriod?.academicYear || '2026/2027'}</strong> yang diselenggarakan secara digital (e-Voting) berasaskan Langsung, Umum, Bebas, Rahasia, Jujur, dan Adil (LUBER JURDIL).
          </p>
        </div>

        {/* 1. Rekapitulasi Pemilih */}
        <div className="font-sans space-y-1.5 avoid-break">
          <h4 className="text-xs font-black uppercase text-slate-950 border-b border-slate-400 pb-1">
            I. REKAPITULASI DAFTAR PEMILIH TETAP (DPT) & TINGKAT PARTISIPASI
          </h4>
          <table className="w-full text-xs border border-slate-900">
            <tbody>
              <tr className="border-b border-slate-400">
                <td className="p-2 font-semibold bg-slate-50 w-2/3">Jumlah Pemilih Terdaftar dalam DPT</td>
                <td className="p-2 font-mono font-bold text-right">{totalDpt} Orang (Siswa & Guru)</td>
              </tr>
              <tr className="border-b border-slate-400">
                <td className="p-2 font-semibold bg-slate-50">Jumlah Pemilih yang Menggunakan Hak Suara (Suara Sah Masuk)</td>
                <td className="p-2 font-mono font-bold text-right text-emerald-800">{totalVoted} Suara</td>
              </tr>
              <tr className="border-b border-slate-400">
                <td className="p-2 font-semibold bg-slate-50">Jumlah Pemilih yang Tidak Menggunakan Hak Suara / Golput</td>
                <td className="p-2 font-mono font-bold text-right text-amber-800">{unvoted} Orang</td>
              </tr>
              <tr className="border-b border-slate-400 bg-slate-100 font-bold">
                <td className="p-2">Persentase Partisipasi Pemilih</td>
                <td className="p-2 font-mono font-black text-right text-blue-900">{participationRate.toFixed(2)}%</td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* 2. Hasil Perolehan OSIS */}
        <div className="font-sans space-y-1.5 avoid-break">
          <h4 className="text-xs font-black uppercase text-slate-950 border-b border-slate-400 pb-1">
            II. HASIL PEROLEHAN SUARA PASANGAN CALON KETUA & WAKIL KETUA OSIS
          </h4>
          <table className="w-full text-xs border border-slate-900 text-left">
            <thead className="bg-slate-100 border-b border-slate-900 font-bold">
              <tr>
                <th className="p-2 text-center w-12">No.</th>
                <th className="p-2">Pasangan Calon (Ketua & Wakil)</th>
                <th className="p-2">Kelas Asal</th>
                <th className="p-2 text-right">Perolehan Suara</th>
                <th className="p-2 text-right">Persentase</th>
                <th className="p-2 text-center">Status</th>
              </tr>
            </thead>
            <tbody>
              {osisResults.map((cand, idx) => (
                <tr key={cand.id} className="border-b border-slate-300">
                  <td className="p-2 text-center font-bold font-mono">0{cand.ballotNumber}</td>
                  <td className="p-2 font-bold text-slate-950">
                    {cand.chairmanName} & {cand.viceChairmanName}
                  </td>
                  <td className="p-2 text-slate-700">
                    {cand.chairmanClass} / {cand.viceChairmanClass}
                  </td>
                  <td className="p-2 text-right font-mono font-bold">{cand.votesCount}</td>
                  <td className="p-2 text-right font-mono font-bold">{cand.pct.toFixed(2)}%</td>
                  <td className="p-2 text-center font-bold">
                    {idx === 0 && cand.votesCount > 0 ? (
                      <span className="text-emerald-800 font-black">TERPILIH</span>
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
        <div className="font-sans space-y-1.5 avoid-break">
          <h4 className="text-xs font-black uppercase text-slate-950 border-b border-slate-400 pb-1">
            III. HASIL PEROLEHAN SUARA PASANGAN CALON KETUA & WAKIL KETUA MPK
          </h4>
          <table className="w-full text-xs border border-slate-900 text-left">
            <thead className="bg-slate-100 border-b border-slate-900 font-bold">
              <tr>
                <th className="p-2 text-center w-12">No.</th>
                <th className="p-2">Pasangan Calon (Ketua & Wakil)</th>
                <th className="p-2">Kelas Asal</th>
                <th className="p-2 text-right">Perolehan Suara</th>
                <th className="p-2 text-right">Persentase</th>
                <th className="p-2 text-center">Status</th>
              </tr>
            </thead>
            <tbody>
              {mpkResults.map((cand, idx) => (
                <tr key={cand.id} className="border-b border-slate-300">
                  <td className="p-2 text-center font-bold font-mono">0{cand.ballotNumber}</td>
                  <td className="p-2 font-bold text-slate-950">
                    {cand.chairmanName} & {cand.viceChairmanName}
                  </td>
                  <td className="p-2 text-slate-700">
                    {cand.chairmanClass} / {cand.viceChairmanClass}
                  </td>
                  <td className="p-2 text-right font-mono font-bold">{cand.votesCount}</td>
                  <td className="p-2 text-right font-mono font-bold">{cand.pct.toFixed(2)}%</td>
                  <td className="p-2 text-center font-bold">
                    {idx === 0 && cand.votesCount > 0 ? (
                      <span className="text-indigo-800 font-black">TERPILIH</span>
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
        <div className="p-3.5 bg-slate-50 border border-slate-400 rounded-xl text-xs font-sans space-y-1.5 avoid-break">
          <p className="font-black text-slate-950 uppercase">
            IV. KEPUTUSAN PENETAPAN PASANGAN CALON TERPILIH:
          </p>
          <p className="leading-relaxed text-slate-900">
            Berdasarkan hasil perolehan suara terbanyak dalam Rapat Pleno, maka Panitia KPU OSIS & MPK menetapkan pasangan calon berikut sebagai Ketua & Wakil Ketua terpilih:
          </p>
          <ul className="list-disc pl-5 space-y-1 font-bold text-slate-900">
            <li>
              Ketua & Wakil Ketua OSIS Terpilih:{' '}
              <strong className="text-blue-950 underline font-black">
                {winningOsis ? `${winningOsis.chairmanName} & ${winningOsis.viceChairmanName}` : '-'}
              </strong>{' '}
              (Nomor Urut 0{winningOsis?.ballotNumber})
            </li>
            <li>
              Ketua & Wakil Ketua MPK Terpilih:{' '}
              <strong className="text-indigo-950 underline font-black">
                {winningMpk ? `${winningMpk.chairmanName} & ${winningMpk.viceChairmanName}` : '-'}
              </strong>{' '}
              (Nomor Urut 0{winningMpk?.ballotNumber})
            </li>
          </ul>
        </div>

        {/* Signatures Section */}
        <div className="pt-4 font-sans text-xs space-y-6 avoid-break">
          <div className="flex justify-end text-slate-900 pr-2">
            <p>
              Ditetapkan di: <strong>Kota Sukabumi</strong><br />
              Pada tanggal: <strong>{currentDateFormatted}</strong>
            </p>
          </div>

          <div className="grid grid-cols-2 gap-8 text-center">
            {/* Left Column */}
            <div className="space-y-14">
              <div>
                <p className="text-slate-700 font-bold">Waka Bidang Kesiswaan,</p>
              </div>
              <div>
                <strong className="font-bold underline block text-slate-950">
                  Dadan Ahmad Hamdani, S.Kom.
                </strong>
                <span className="text-[10px] text-slate-600 block">NIP. -</span>
              </div>
            </div>

            {/* Right Column */}
            <div className="space-y-14">
              <div>
                <p className="text-slate-700 font-bold">Ketua Panitia Pemilihan (KPU OSIS),</p>
              </div>
              <div>
                <strong className="font-bold underline block text-slate-950">
                  Dery Cahyadi, S.Pd
                </strong>
                <span className="text-[10px] text-slate-600 block">NIP. -</span>
              </div>
            </div>
          </div>

          <div className="pt-2 text-center space-y-14">
            <div>
              <p className="text-slate-700 font-bold">Mengetahui & Menyetujui,</p>
              <p className="font-black text-slate-950">Kepala SMKS PGRI 1 Kota Sukabumi</p>
            </div>
            <div>
              <strong className="font-black underline block text-sm text-slate-950">
                Riswan Safari, S.Pd.MM.
              </strong>
              <span className="text-[11px] text-slate-700 block">NIP. -</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
