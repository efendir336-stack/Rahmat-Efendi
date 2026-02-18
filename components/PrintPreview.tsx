
import React from 'react';
import { DonationRecord, HeaderConfig } from '../types';

interface PrintPreviewProps {
  data: DonationRecord[];
  header: HeaderConfig;
  scale?: number;
  highQuality?: boolean;
  itemsPerPage?: number;
  margin?: number; // Safe margin in mm
}

const PrintPreview: React.FC<PrintPreviewProps> = ({ 
  data, 
  header, 
  scale = 1.0, 
  highQuality = true,
  itemsPerPage = 4,
  margin = 10
}) => {
  // Bagi data berdasarkan jumlah donatur per halaman
  const chunkData = (arr: DonationRecord[], size: number) => {
    const chunks = [];
    for (let i = 0; i < arr.length; i += size) {
      chunks.push(arr.slice(i, i + size));
    }
    return chunks;
  };

  const pages = chunkData(data, itemsPerPage);

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
          style={{
            gridTemplateRows: `repeat(${itemsPerPage}, 1fr)`,
            padding: `${margin}mm`, // Terapkan margin pengamanan di sini
            boxSizing: 'border-box'
          }}
        >
          {pageData.map((row) => (
            <div 
              key={row.id} 
              className="print-item border-2 border-black flex flex-col justify-between overflow-hidden"
              style={{
                borderWidth: highQuality ? '2.5px' : '1.5px',
                borderColor: 'black'
              }}
            >
              {/* Header Kartu - Bismillah & Nama Masjid */}
              <div className="text-center pt-1">
                <p className="text-[12px] italic font-serif leading-none mb-0.5">بِسْمِ اللَّهِ الرَّحْمَنِ الرَّحِيم</p>
                <h2 className="text-[15px] font-black uppercase mosque-title leading-tight" style={{ color: '#927331' }}>
                  {header.mosqueName}
                </h2>
                <p className="text-[11px] font-black leading-none mb-0.5">{header.hijriYear}</p>
                <div className="border-t border-slate-300 w-1/2 mx-auto my-0.5"></div>
                <p className="text-[8px] font-bold uppercase tracking-widest text-slate-500 leading-none mb-0.5">{header.topHeader}</p>
                <h3 className="text-[11px] font-black uppercase tracking-tight leading-none">{header.subHeader}</h3>
              </div>

              {/* Tabel Utama - Donatur & Jadwal */}
              <div className="flex-grow flex flex-col justify-center px-1">
                <table className="w-full border-collapse border-[1.5px] border-black text-center" style={{ borderWidth: highQuality ? '2px' : '1.5px' }}>
                  <thead>
                    <tr className="text-[9px] font-black uppercase">
                      <th className="border-r-[1.5px] border-black p-0.5 w-[12%]" style={{ borderColor: 'black' }}>No</th>
                      <th className="p-0.5">Nama Lengkap Donatur</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-t-[1.5px] border-black" style={{ borderColor: 'black' }}>
                      <td className="border-r-[1.5px] border-black text-4xl font-black p-0 align-middle leading-none" style={{ borderColor: 'black' }}>
                        {row.no}
                      </td>
                      <td className="text-2xl font-black p-1 align-middle uppercase leading-none overflow-hidden">
                        {row.name}
                      </td>
                    </tr>
                    <tr className="border-t-[1.5px] border-black bg-slate-50" style={{ borderColor: 'black' }}>
                      <td colSpan={2} className="text-[8px] font-black uppercase py-0.5">
                        Jadwal Tanggal Penyaluran & Sumbangan
                      </td>
                    </tr>
                    <tr className="border-t-[1.5px] border-black" style={{ borderColor: 'black' }}>
                      <td colSpan={2} className="p-1">
                        <div className="flex justify-center items-center gap-6">
                          <div className="text-center">
                            <p className="text-[7px] font-bold text-slate-400 mb-0.5 uppercase">Tanggal Ke-1</p>
                            <div className="border-2 border-black rounded-lg px-3 py-1 font-mono font-black text-base leading-none">
                              {row.dates[0] || "--/--/----"}
                            </div>
                          </div>
                          <div className="text-center">
                            <p className="text-[7px] font-bold text-slate-400 mb-0.5 uppercase">Tanggal Ke-2</p>
                            <div className="border-2 border-black rounded-lg px-3 py-1 font-mono font-black text-base leading-none">
                              {row.dates[1] || "--/--/----"}
                            </div>
                          </div>
                        </div>
                        <div className="mt-1 text-center">
                          <p className="text-[10px] font-black uppercase italic leading-none">
                            Bentuk: {row.type}
                          </p>
                        </div>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Footer Kartu - Keterangan Resmi */}
              <div className="flex justify-between items-end px-1 pb-1">
                <p className="text-[6px] font-bold uppercase text-slate-400">
                  Dokumen Resmi Panitia Ramadhan Mubarak
                </p>
                <div className="text-right">
                  <p className="text-[6px] font-bold uppercase text-slate-400">
                    Halaman {pageIdx + 1} • {header.masehiYear}
                  </p>
                </div>
              </div>
            </div>
          ))}
          
          {/* Filler kartu jika data kurang dari itemsPerPage agar layout tetap full */}
          {pageData.length < itemsPerPage && Array.from({ length: itemsPerPage - pageData.length }).map((_, i) => (
            <div key={`empty-${i}`} className="print-item border-2 border-dashed border-slate-200 rounded-lg flex items-center justify-center opacity-30">
              <span className="text-sm font-black text-slate-300 uppercase italic">Slot Kosong</span>
            </div>
          ))}
        </div>
      ))}

      {data.length === 0 && (
        <div className="text-center py-20 text-slate-400 bg-white border-4 border-dashed rounded-3xl no-print m-10">
          <p className="text-xl font-black uppercase tracking-widest">Data Kosong</p>
        </div>
      )}

      {/* Floating Info untuk memantau status di layar */}
      <div className="no-print fixed bottom-8 right-8 bg-slate-900 text-white px-8 py-4 rounded-2xl shadow-2xl font-black text-xs z-50 border-2 border-slate-700 flex flex-col items-center">
         <span className="text-[10px] text-emerald-400 uppercase tracking-widest mb-1">PENGATURAN PRESISI AKTIF</span>
         <span className="text-2xl uppercase tracking-tighter text-white">{pages.length} LEMBAR</span>
         <span className="text-[9px] text-slate-400 mt-1 uppercase">Margin Aman: {margin}mm</span>
      </div>
    </div>
  );
};

export default PrintPreview;
