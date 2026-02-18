
import React from 'react';
import { DonationRecord, HeaderConfig } from '../types';

interface PrintPreviewProps {
  data: DonationRecord[];
  header: HeaderConfig;
  scale?: number;
  highQuality?: boolean;
}

const PrintPreview: React.FC<PrintPreviewProps> = ({ data, header, scale = 1.0, highQuality = true }) => {
  // Fungsi untuk membagi data menjadi grup berisi tepat 4 donatur per halaman
  const chunkData = (arr: DonationRecord[], size: number) => {
    const chunks = [];
    for (let i = 0; i < arr.length; i += size) {
      chunks.push(arr.slice(i, i + size));
    }
    return chunks;
  };

  const pages = chunkData(data, 4);
  const borderWeight = highQuality ? '4px' : '2px';
  const textColor = highQuality ? 'black' : '#1e293b';

  return (
    <div 
      className="print-container w-full" 
      style={{ 
        transform: `scale(${scale})`, 
        transformOrigin: 'top center',
        color: textColor
      }}
    >
      {pages.map((pageData, pageIdx) => (
        <div 
          key={pageIdx} 
          className="print-page bg-white"
          style={{ 
            // Styling inline untuk mendukung pratinjau di layar agar mirip hasil cetak
            aspectRatio: '297/210',
          }}
        >
          {pageData.map((row) => (
            <div 
              key={row.id} 
              className="print-item p-6 bg-white relative overflow-hidden flex flex-col justify-between"
              style={{ 
                borderWidth: borderWeight,
                borderStyle: 'solid',
                borderColor: 'black'
              }}
            >
              {/* Watermark Ornamen */}
              <div className="absolute -top-6 -right-6 p-2 opacity-[0.04] pointer-events-none rotate-12">
                 <svg width="150" height="150" viewBox="0 0 24 24" fill="currentColor">
                   <path d="M12,2L4.5,20.29L5.21,21L12,18L18.79,21L19.5,20.29L12,2Z" />
                 </svg>
              </div>

              {/* Header Kartu */}
              <div className="text-center mb-4">
                <div className="text-lg text-[#967d34] font-header font-bold italic mb-2 tracking-wide">بِسْمِ اللَّهِ الرَّحْمَنِ الرَّحِيم</div>
                
                <div className="w-full py-3 border-y-[3px] border-[#967d34]/30 flex flex-col items-center justify-center">
                   <h1 className="text-2xl font-black uppercase text-[#967d34] leading-tight tracking-tight px-2">
                    {header.mosqueName}
                  </h1>
                  <div className="flex items-center space-x-3 w-full px-12 mt-2">
                    <div className="flex-grow h-[2px] bg-[#967d34]/40"></div>
                    <p className="text-[16px] font-black uppercase tracking-[0.25em] text-slate-900">
                      {header.hijriYear}
                    </p>
                    <div className="flex-grow h-[2px] bg-[#967d34]/40"></div>
                  </div>
                </div>

                <div className="mt-3">
                  <p className="text-[11px] font-black text-slate-500 uppercase tracking-[0.4em] mb-1">
                    {header.topHeader}
                  </p>
                  <h2 className="text-[18px] font-black uppercase text-slate-950 border-b-2 border-slate-200 inline-block px-6">
                    {header.subHeader}
                  </h2>
                </div>
              </div>

              {/* Tabel Utama */}
              <div className="flex-grow flex flex-col justify-center px-1">
                <table 
                  className="w-full border-collapse border-black"
                  style={{ borderWidth: borderWeight, borderStyle: 'solid' }}
                >
                  <thead>
                    <tr className="bg-slate-50">
                      <th className="border-black p-1.5 font-black w-14 text-[11px]" style={{ borderWidth: borderWeight }}>NO</th>
                      <th className="border-black p-1.5 font-black text-[11px]" style={{ borderWidth: borderWeight }}>NAMA LENGKAP DONATUR</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td className="border-black p-2 text-center align-middle font-black text-5xl" style={{ borderWidth: borderWeight }}>
                        {row.no}
                      </td>
                      <td className="border-black p-3 text-center align-middle font-black uppercase text-2xl leading-tight tracking-tight" style={{ borderWidth: borderWeight }}>
                        {row.name || "________________"}
                      </td>
                    </tr>
                    <tr className="bg-slate-50">
                      <th colSpan={2} className="border-black p-1.5 font-black text-[11px]" style={{ borderWidth: borderWeight }}>JADWAL TANGGAL PENYALURAN & SUMBANGAN</th>
                    </tr>
                    <tr>
                      <td colSpan={2} className="border-black p-5" style={{ borderWidth: borderWeight }}>
                        <div className="flex flex-wrap justify-center gap-6">
                          {row.dates.map((date, dIdx) => (
                            <div key={dIdx} className="flex flex-col items-center">
                               <span className="text-[10px] font-black text-slate-400 uppercase mb-1.5">TANGGAL KE-{dIdx+1}</span>
                               <span className="bg-slate-50 px-5 py-2.5 rounded-xl border-[3px] border-black font-mono font-black text-xl text-black shadow-sm">
                                {date || "__/__/____"}
                              </span>
                            </div>
                          ))}
                        </div>
                        <div className="mt-5 pt-4 border-t-2 border-dashed border-slate-200 text-center">
                           <p className="font-black italic text-emerald-950 text-[14px] uppercase tracking-wide">
                            Bentuk: {row.type}
                           </p>
                        </div>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Footer Kartu */}
              <div className="mt-4 flex justify-between items-end border-t-2 border-slate-100 pt-3 px-2">
                <div className="text-[10px] font-black leading-tight uppercase tracking-wider text-slate-600">
                   <p>DOKUMEN RESMI PANITIA</p>
                   <p className="text-emerald-900 font-black">RAMADHAN MUBARAK</p>
                </div>
                <div className="text-right">
                   <p className="text-[10px] font-black text-slate-400 mb-1 uppercase">HALAMAN {pageIdx + 1}</p>
                   <span className="font-header text-[12px] font-black text-slate-900 italic bg-slate-100 px-2 py-0.5 rounded">#{row.id.toUpperCase().slice(0,6)}</span>
                </div>
              </div>
            </div>
          ))}
          
          {/* Menambahkan slot kosong agar grid tetap 2x2 meskipun data tidak penuh 4 */}
          {pageData.length < 4 && Array.from({ length: 4 - pageData.length }).map((_, i) => (
            <div key={`empty-${i}`} className="border-4 border-dashed border-slate-200 rounded-2xl flex flex-col items-center justify-center opacity-30 p-12 text-center">
               <div className="w-20 h-20 border-8 border-dashed border-slate-200 rounded-full mb-6"></div>
               <span className="text-[14px] font-black uppercase tracking-[0.4em] text-slate-300">Slot Kosong</span>
               <p className="text-[10px] mt-3 text-slate-300 font-bold uppercase italic">Halaman {pageIdx + 1}</p>
            </div>
          ))}
        </div>
      ))}

      {data.length === 0 && (
        <div className="text-center py-24 text-slate-400 italic bg-white w-full border-8 border-dashed rounded-[40px] no-print">
          <p className="text-2xl font-black uppercase tracking-widest">Belum Ada Data</p>
          <p className="mt-2 font-bold">Silakan isi data donatur pada menu Editor.</p>
        </div>
      )}

      {/* Indikator Halaman untuk di layar (Bukan untuk dicetak) */}
      <div className="no-print fixed bottom-8 left-1/2 -translate-x-1/2 bg-emerald-900 text-white px-8 py-4 rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.3)] font-black text-sm z-50 flex items-center space-x-4 border-2 border-emerald-500">
         <span className="opacity-70">TOTAL HALAMAN:</span>
         <span className="text-yellow-400 text-2xl">{pages.length}</span>
         <span className="opacity-70">LEMBAR A4</span>
      </div>
    </div>
  );
};

export default PrintPreview;
