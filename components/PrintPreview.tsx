
import React from 'react';
import { DonationRecord, HeaderConfig } from '../types';

interface PrintPreviewProps {
  data: DonationRecord[];
  header: HeaderConfig;
}

const PrintPreview: React.FC<PrintPreviewProps> = ({ data, header }) => {
  return (
    <div className="print-container flex flex-col items-center space-y-8">
      {data.map((row) => (
        <div 
          key={row.id} 
          className="print-item break-inside-avoid w-full border-[2px] border-black p-6 bg-white relative overflow-hidden"
          style={{ maxWidth: '100%' }}
        >
          {/* Subtle Islamic Pattern Ornament Background */}
          <div className="absolute top-0 right-0 p-2 opacity-5 pointer-events-none">
             <svg width="60" height="60" viewBox="0 0 24 24" fill="currentColor"><path d="M12,2L4.5,20.29L5.21,21L12,18L18.79,21L19.5,20.29L12,2Z" /></svg>
          </div>

          {/* Slip Header */}
          <div className="text-center mb-6 pb-4 border-b-[1px] border-dashed border-black/20">
            <div className="mb-2 text-[#967d34] font-header text-sm italic tracking-[0.2em] opacity-80">بِسْمِ اللَّهِ الرَّحْمَنِ الرَّحِيم</div>
            <h1 className="text-xl md:text-2xl font-bold uppercase text-[#967d34] tracking-wider leading-tight">
              {header.mosqueName}
            </h1>
            <div className="flex justify-center items-center space-x-3 mt-2">
              <div className="h-[1.5px] w-12 bg-[#967d34] opacity-30"></div>
              <p className="text-xs md:text-sm font-black text-slate-700 uppercase tracking-widest">
                {header.hijriYear}
              </p>
              <div className="h-[1.5px] w-12 bg-[#967d34] opacity-30"></div>
            </div>
            <div className="mt-4 space-y-1">
              <p className="text-[11px] md:text-xs font-bold text-slate-500 tracking-[0.3em] uppercase opacity-70">
                {header.topHeader}
              </p>
              <h2 className="text-sm md:text-base font-black uppercase text-slate-900 tracking-tight">
                {header.subHeader}
              </h2>
            </div>
          </div>

          {/* Card Table */}
          <table className="w-full border-collapse border-[2px] border-black text-xs md:text-sm shadow-[4px_4px_0px_0px_rgba(0,0,0,0.05)]">
            <thead>
              <tr className="bg-slate-50">
                <th className="border-[2px] border-black p-2 font-black uppercase w-14 text-center">No</th>
                <th className="border-[2px] border-black p-2 font-black uppercase text-center w-1/3">Nama Donatur</th>
                <th className="border-[2px] border-black p-2 font-black uppercase text-center w-1/4">Tanggal Ta'jil</th>
                <th className="border-[2px] border-black p-2 font-black uppercase text-center">Jenis Sumbangan</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="border-[2px] border-black p-4 text-center align-middle font-black text-xl text-emerald-900">
                  {row.no}
                </td>
                <td className="border-[2px] border-black p-4 text-center align-middle font-black uppercase tracking-tight text-base">
                  {row.name || "________________"}
                </td>
                <td className="border-[2px] border-black p-4 text-center align-middle leading-normal font-bold">
                  {row.dates.map((date, dIdx) => (
                    <div key={dIdx} className="whitespace-nowrap bg-slate-50 mb-1 last:mb-0 px-2 py-0.5 rounded border border-slate-200 text-sm">
                      {date || "____/____/____"}
                    </div>
                  ))}
                </td>
                <td className="border-[2px] border-black p-4 text-center align-middle font-bold italic text-slate-700">
                  {row.type}
                </td>
              </tr>
            </tbody>
          </table>

          {/* Footer Card */}
          <div className="mt-5 flex justify-between items-end">
            <div className="space-y-1">
               <p className="text-[9px] text-slate-400 italic">Dicetak melalui Sistem E-Jadwal Ta'jil Digital</p>
               <p className="text-[10px] font-bold text-slate-300">#PRESISI-MANDIRI-AMANAH</p>
            </div>
            <div className="text-right">
               <div className="w-32 h-0.5 bg-slate-100 mb-2 ml-auto"></div>
               <span className="font-header text-[14px] uppercase font-bold text-slate-200 tracking-tighter">SLIP #{row.no}</span>
            </div>
          </div>
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
