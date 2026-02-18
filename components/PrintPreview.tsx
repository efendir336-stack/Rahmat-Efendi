
import React from 'react';
import { DonationRecord, HeaderConfig } from '../types';

interface PrintPreviewProps {
  data: DonationRecord[];
  header: HeaderConfig;
}

const PrintPreview: React.FC<PrintPreviewProps> = ({ data, header }) => {
  // Fungsi untuk membagi data menjadi grup berisi 4
  const chunkData = (arr: DonationRecord[], size: number) => {
    const chunks = [];
    for (let i = 0; i < arr.length; i += size) {
      chunks.push(arr.slice(i, i + size));
    }
    return chunks;
  };

  const pages = chunkData(data, 4);

  return (
    <div className="print-container w-full">
      {pages.map((pageData, pageIdx) => (
        <div 
          key={pageIdx} 
          className="print-page grid grid-cols-2 grid-rows-2 gap-4 mb-8 last:mb-0"
          style={{ 
            height: '190mm', // Tinggi area cetak A4 landscape (210mm - margin)
            pageBreakAfter: 'always',
            width: '100%'
          }}
        >
          {pageData.map((row) => (
            <div 
              key={row.id} 
              className="print-item border-[2px] border-black p-4 bg-white relative overflow-hidden flex flex-col justify-between shadow-sm"
              style={{ height: '100%' }}
            >
              {/* Ornamen Islami di Pojok */}
              <div className="absolute -top-4 -right-4 p-2 opacity-5 pointer-events-none rotate-12">
                 <svg width="100" height="100" viewBox="0 0 24 24" fill="currentColor">
                   <path d="M12,2L4.5,20.29L5.21,21L12,18L18.79,21L19.5,20.29L12,2Z" />
                 </svg>
              </div>

              {/* Header Kartu */}
              <div className="text-center mb-3 pb-2 border-b border-dashed border-black/20">
                <div className="text-[9px] text-[#967d34] font-header italic opacity-80 mb-1">بِسْمِ اللَّهِ الرَّحْمَنِ الرَّحِيم</div>
                <h1 className="text-sm font-black uppercase text-[#967d34] leading-tight px-2">
                  {header.mosqueName}
                </h1>
                <p className="text-[10px] font-black text-slate-700 uppercase tracking-tighter mt-1">
                  {header.hijriYear}
                </p>
                <div className="mt-2">
                  <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest leading-none">
                    {header.topHeader}
                  </p>
                  <h2 className="text-[10px] font-black uppercase text-slate-900 mt-1">
                    {header.subHeader}
                  </h2>
                </div>
              </div>

              {/* Tabel Konten */}
              <div className="flex-grow flex flex-col justify-center">
                <table className="w-full border-collapse border-[1.5px] border-black text-[10px]">
                  <thead>
                    <tr className="bg-slate-50">
                      <th className="border-[1.5px] border-black p-1 font-black w-8">NO</th>
                      <th className="border-[1.5px] border-black p-1 font-black">NAMA DONATUR</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td className="border-[1.5px] border-black p-2 text-center align-middle font-black text-lg">
                        {row.no}
                      </td>
                      <td className="border-[1.5px] border-black p-2 text-center align-middle font-black uppercase text-sm leading-tight">
                        {row.name || "________________"}
                      </td>
                    </tr>
                    <tr className="bg-slate-50">
                      <th colSpan={2} className="border-[1.5px] border-black p-1 font-black">JADWAL TANGGAL & JENIS</th>
                    </tr>
                    <tr>
                      <td colSpan={2} className="border-[1.5px] border-black p-2">
                        <div className="flex flex-wrap justify-center gap-2 mb-2">
                          {row.dates.map((date, dIdx) => (
                            <span key={dIdx} className="bg-slate-100 px-2 py-0.5 rounded border border-slate-300 font-mono font-bold text-[10px]">
                              {date || "__/__/__"}
                            </span>
                          ))}
                        </div>
                        <p className="text-center font-bold italic text-slate-600 text-[9px] border-t border-slate-100 pt-1">
                          {row.type}
                        </p>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Footer Kartu */}
              <div className="mt-3 flex justify-between items-end opacity-60">
                <div className="text-[7px] font-bold leading-tight">
                   <p>SISTEM E-JADWAL TA'JIL</p>
                   <p className="text-emerald-700">#AMANAH-DIGITAL</p>
                </div>
                <div className="text-right">
                   <span className="font-header text-[10px] font-bold text-slate-300">SLIP #{row.no}</span>
                </div>
              </div>
            </div>
          ))}
          
          {/* Mengisi grid kosong jika data terakhir < 4 agar layout tetap konsisten */}
          {pageData.length < 4 && Array.from({ length: 4 - pageData.length }).map((_, i) => (
            <div key={`empty-${i}`} className="border-[1.5px] border-dashed border-slate-200 rounded-lg"></div>
          ))}
        </div>
      ))}

      {data.length === 0 && (
        <div className="text-center py-20 text-slate-400 italic bg-white w-full border-4 border-dashed rounded-3xl">
          Belum ada data untuk dipratinjau.
        </div>
      )}
    </div>
  );
};

export default PrintPreview;
