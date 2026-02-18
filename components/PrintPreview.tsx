
import React from 'react';
import { DonationRecord, HeaderConfig } from '../types';

interface PrintPreviewProps {
  data: DonationRecord[];
  header: HeaderConfig;
  scale?: number;
  highQuality?: boolean;
}

const PrintPreview: React.FC<PrintPreviewProps> = ({ data, header, scale = 1.0, highQuality = true }) => {
  const chunkData = (arr: DonationRecord[], size: number) => {
    const chunks = [];
    for (let i = 0; i < arr.length; i += size) {
      chunks.push(arr.slice(i, i + size));
    }
    return chunks;
  };

  const pages = chunkData(data, 4);
  const borderWeight = highQuality ? '3px' : '2px';
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
          className="print-page grid grid-cols-2 grid-rows-2 gap-4 mb-8 last:mb-0"
          style={{ 
            height: '190mm', 
            pageBreakAfter: 'always',
            width: '100%'
          }}
        >
          {pageData.map((row) => (
            <div 
              key={row.id} 
              className="print-item border-black p-4 bg-white relative overflow-hidden flex flex-col justify-between shadow-sm"
              style={{ 
                height: '100%', 
                borderWidth: borderWeight,
                borderStyle: 'solid'
              }}
            >
              {/* Ornamen Islami di Pojok */}
              <div className="absolute -top-4 -right-4 p-2 opacity-5 pointer-events-none rotate-12">
                 <svg width="100" height="100" viewBox="0 0 24 24" fill="currentColor">
                   <path d="M12,2L4.5,20.29L5.21,21L12,18L18.79,21L19.5,20.29L12,2Z" />
                 </svg>
              </div>

              {/* Header Kartu */}
              <div 
                className="text-center mb-4 pb-2 border-dashed border-black/30"
                style={{ borderBottomWidth: highQuality ? '3px' : '2px' }}
              >
                <div className="text-[11px] text-[#967d34] font-header italic opacity-90 mb-1">بِسْمِ اللَّهِ الرَّحْمَنِ الرَّحِيم</div>
                <h1 className="text-xl font-black uppercase text-[#967d34] leading-tight px-2 mb-1">
                  {header.mosqueName}
                </h1>
                <p className="text-[14px] font-black uppercase tracking-tight" style={{ color: highQuality ? 'black' : '#1e293b' }}>
                  {header.hijriYear}
                </p>
                <div className="mt-3">
                  <p className="text-[11px] font-bold text-slate-500 uppercase tracking-widest leading-none mb-1">
                    {header.topHeader}
                  </p>
                  <h2 className="text-[14px] font-black uppercase border-t border-slate-200 pt-1 mt-1" style={{ color: highQuality ? 'black' : '#0f172a' }}>
                    {header.subHeader}
                  </h2>
                </div>
              </div>

              {/* Tabel Konten */}
              <div className="flex-grow flex flex-col justify-center">
                <table 
                  className="w-full border-collapse border-black text-[11px]"
                  style={{ borderWidth: borderWeight, borderStyle: 'solid' }}
                >
                  <thead>
                    <tr className="bg-slate-50">
                      <th 
                        className="border-black p-1 font-black w-10"
                        style={{ borderWidth: borderWeight, borderStyle: 'solid' }}
                      >NO</th>
                      <th 
                        className="border-black p-1 font-black"
                        style={{ borderWidth: borderWeight, borderStyle: 'solid' }}
                      >NAMA DONATUR</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td 
                        className="border-black p-2 text-center align-middle font-black text-2xl"
                        style={{ borderWidth: borderWeight, borderStyle: 'solid' }}
                      >
                        {row.no}
                      </td>
                      <td 
                        className="border-black p-2 text-center align-middle font-black uppercase text-base leading-tight"
                        style={{ borderWidth: borderWeight, borderStyle: 'solid' }}
                      >
                        {row.name || "________________"}
                      </td>
                    </tr>
                    <tr className="bg-slate-50">
                      <th 
                        colSpan={2} 
                        className="border-black p-1 font-black"
                        style={{ borderWidth: borderWeight, borderStyle: 'solid' }}
                      >JADWAL TANGGAL & JENIS</th>
                    </tr>
                    <tr>
                      <td 
                        colSpan={2} 
                        className="border-black p-3"
                        style={{ borderWidth: borderWeight, borderStyle: 'solid' }}
                      >
                        <div className="flex flex-wrap justify-center gap-3 mb-3">
                          {row.dates.map((date, dIdx) => (
                            <span key={dIdx} className="bg-slate-100 px-3 py-1 rounded border border-slate-400 font-mono font-bold text-[12px]">
                              {date || "__/__/2026"}
                            </span>
                          ))}
                        </div>
                        <p className="text-center font-bold italic text-slate-700 text-[10px] border-t border-slate-100 pt-2">
                          {row.type}
                        </p>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Footer Kartu */}
              <div className="mt-4 flex justify-between items-end opacity-70">
                <div className="text-[8px] font-bold leading-tight uppercase tracking-wider">
                   <p>SISTEM E-JADWAL TA'JIL MASJID</p>
                   <p className="text-emerald-800">#AMANAH-DIGITAL-PRO</p>
                </div>
                <div className="text-right">
                   <span className="font-header text-[12px] font-black text-slate-400">SLIP #{row.no}</span>
                </div>
              </div>
            </div>
          ))}
          
          {pageData.length < 4 && Array.from({ length: 4 - pageData.length }).map((_, i) => (
            <div key={`empty-${i}`} className="border-2 border-dashed border-slate-200 rounded-lg"></div>
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
