
import React from 'react';
import { DonationRecord, HeaderConfig } from '../types';

interface PrintPreviewProps {
  data: DonationRecord[];
  header: HeaderConfig;
  scale?: number;
  highQuality?: boolean;
}

const PrintPreview: React.FC<PrintPreviewProps> = ({ data, header, scale = 1.0, highQuality = true }) => {
  // Bagi data menjadi 4 item per halaman portrait
  const chunkData = (arr: DonationRecord[], size: number) => {
    const chunks = [];
    for (let i = 0; i < arr.length; i += size) {
      chunks.push(arr.slice(i, i + size));
    }
    return chunks;
  };

  const pages = chunkData(data, 4);

  return (
    <div 
      className="print-container w-full" 
      style={{ 
        transform: `scale(${scale})`, 
        transformOrigin: 'top center'
      }}
    >
      {pages.map((pageData, pageIdx) => (
        <div 
          key={pageIdx} 
          className="print-page screen-page-container bg-white"
        >
          {pageData.map((row) => (
            <div 
              key={row.id} 
              className="print-item border-2 border-black p-2 flex flex-col justify-between"
            >
              {/* Top Bismillah */}
              <div className="text-center">
                <p className="text-[14px] italic font-serif leading-none mb-1">بِسْمِ اللَّهِ الرَّحْمَنِ الرَّحِيم</p>
                <h2 className="text-[16px] font-black uppercase mosque-title leading-tight" style={{ color: '#927331' }}>
                  {header.mosqueName}
                </h2>
                <p className="text-[12px] font-black leading-none mb-1">{header.hijriYear}</p>
                <div className="border-t border-slate-300 w-1/2 mx-auto my-1"></div>
                <p className="text-[9px] font-bold uppercase tracking-widest text-slate-600">{header.topHeader}</p>
                <h3 className="text-[12px] font-black uppercase tracking-tight">{header.subHeader}</h3>
              </div>

              {/* Main Content Table */}
              <div className="mt-2">
                <table className="w-full border-collapse border-[1.5px] border-black text-center">
                  <thead>
                    <tr className="text-[10px] font-black uppercase">
                      <th className="border-r-[1.5px] border-black p-0.5 w-[12%]">No</th>
                      <th className="p-0.5">Nama Lengkap Donatur</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-t-[1.5px] border-black">
                      <td className="border-r-[1.5px] border-black text-4xl font-black p-1 align-middle">
                        {row.no}
                      </td>
                      <td className="text-2xl font-black p-2 align-middle uppercase">
                        {row.name}
                      </td>
                    </tr>
                    <tr className="border-t-[1.5px] border-black">
                      <td colSpan={2} className="text-[9px] font-black uppercase py-0.5 bg-slate-50">
                        Jadwal Tanggal Penyaluran & Sumbangan
                      </td>
                    </tr>
                    <tr className="border-t-[1.5px] border-black">
                      <td colSpan={2} className="p-2">
                        <div className="flex justify-center items-center gap-8">
                          <div className="text-center">
                            <p className="text-[8px] font-bold text-slate-400 mb-0.5 uppercase">Tanggal Ke-1</p>
                            <div className="border-2 border-black rounded-lg px-4 py-1.5 font-mono font-black text-lg">
                              {row.dates[0] || "--/--/----"}
                            </div>
                          </div>
                          <div className="text-center">
                            <p className="text-[8px] font-bold text-slate-400 mb-0.5 uppercase">Tanggal Ke-2</p>
                            <div className="border-2 border-black rounded-lg px-4 py-1.5 font-mono font-black text-lg">
                              {row.dates[1] || "--/--/----"}
                            </div>
                          </div>
                        </div>
                        <div className="mt-2 text-center">
                          <p className="text-[11px] font-black uppercase italic">
                            Bentuk: {row.type}
                          </p>
                        </div>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Footer */}
              <div className="flex justify-between items-end mt-1 px-1">
                <p className="text-[7px] font-bold uppercase text-slate-400">
                  Dokumen Resmi Panitia Ramadhan Mubarak
                </p>
                <p className="text-[7px] font-bold uppercase text-slate-400">
                  Halaman {pageIdx + 1}
                </p>
              </div>
            </div>
          ))}
          
          {/* Filler kartu jika data kurang dari 4 */}
          {pageData.length < 4 && Array.from({ length: 4 - pageData.length }).map((_, i) => (
            <div key={`empty-${i}`} className="border-2 border-dashed border-slate-200 rounded-lg flex items-center justify-center opacity-30">
              <span className="text-sm font-black text-slate-300 uppercase italic">Slot Kosong</span>
            </div>
          ))}
        </div>
      ))}

      {data.length === 0 && (
        <div className="text-center py-20 text-slate-400 bg-white border-4 border-dashed rounded-3xl no-print m-10">
          <p className="text-xl font-black uppercase tracking-widest">Editor Data Masih Kosong</p>
        </div>
      )}

      {/* Info Panel Preview */}
      <div className="no-print fixed bottom-8 right-8 bg-emerald-900 text-white px-8 py-4 rounded-2xl shadow-2xl font-black text-xs z-50 border-2 border-emerald-500 flex flex-col items-center">
         <span className="text-[10px] text-emerald-300 uppercase tracking-widest mb-1">MODE POTRAIT AKTIF</span>
         <span className="text-2xl uppercase tracking-tighter">{pages.length} LEMBAR A4</span>
         <span className="text-[9px] text-emerald-400 mt-1 uppercase">4 DONATUR PER HALAMAN</span>
      </div>
    </div>
  );
};

export default PrintPreview;
