
import React, { useState, useCallback, useEffect, useMemo } from 'react';
import { 
  Download, Upload, Printer, Settings, Plus, Trash2, 
  FileText, Layout, CheckCircle, AlertCircle, RefreshCcw, 
  Search, FileSpreadsheet, Info, ChevronRight, Save, Edit3
} from 'lucide-react';
import * as XLSX from 'xlsx';
import { DonationRecord, HeaderConfig } from './types';
import { DEFAULT_HEADER, EXAMPLE_DATA } from './constants';
import PrintPreview from './components/PrintPreview';

const STORAGE_KEY_DATA = 'jadwal_tajil_data';
const STORAGE_KEY_HEADER = 'jadwal_tajil_header';

const App: React.FC = () => {
  const [showPrint, setShowPrint] = useState(false);
  
  const [data, setData] = useState<DonationRecord[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEY_DATA);
    return saved ? JSON.parse(saved) : EXAMPLE_DATA;
  });
  
  const [headerConfig, setHeaderConfig] = useState<HeaderConfig>(() => {
    const saved = localStorage.getItem(STORAGE_KEY_HEADER);
    return saved ? JSON.parse(saved) : DEFAULT_HEADER;
  });

  const [isEditingHeader, setIsEditingHeader] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_DATA, JSON.stringify(data));
  }, [data]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_HEADER, JSON.stringify(headerConfig));
  }, [headerConfig]);

  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (data.length > 0) {
        e.preventDefault();
        e.returnValue = ''; 
      }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [data]);

  const filteredData = useMemo(() => {
    return data.filter(item => 
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.type.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [data, searchQuery]);

  const isValidDate = (dateStr: string) => {
    if (!dateStr || !dateStr.trim()) return true;
    const regexNumeric = /^\d{1,2}\/\d{1,2}\/\d{4}$/;
    if (!regexNumeric.test(dateStr)) return false;
    const [d, m, y] = dateStr.split('/').map(Number);
    const dateObj = new Date(y, m - 1, d);
    return dateObj.getFullYear() === y && dateObj.getMonth() === m - 1 && dateObj.getDate() === d;
  };

  /**
   * Helper untuk memproses berbagai format tanggal dari Excel.
   * Mengonversi segalanya ke format DD/MM/YYYY.
   */
  const processExcelValue = (val: any): string => {
    if (val === undefined || val === null || val === '') return '';
    
    let dateObj: Date | null = null;

    // 1. Jika sudah berupa objek Date (karena cellDates: true)
    if (val instanceof Date) {
      dateObj = val;
    } 
    // 2. Jika berupa angka serial Excel (misal 46070)
    else if (typeof val === 'number' && val > 30000) {
      const parsed = XLSX.SSF.parse_date_code(val);
      dateObj = new Date(parsed.y, parsed.m - 1, parsed.d);
    } 
    // 3. Jika berupa String, coba deteksi formatnya
    else {
      const str = val.toString().trim();
      
      // Deteksi format YYYY-MM-DD atau YYYY/MM/DD
      if (/^\d{4}[-/]\d{1,2}[-/]\d{1,2}$/.test(str)) {
        const parts = str.split(/[-/]/);
        dateObj = new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]));
      }
      // Deteksi format DD-MM-YYYY atau DD/MM/YYYY
      else if (/^\d{1,2}[-/]\d{1,2}[-/]\d{4}$/.test(str)) {
        const parts = str.split(/[-/]/);
        dateObj = new Date(parseInt(parts[2]), parseInt(parts[1]) - 1, parseInt(parts[0]));
      }
    }

    // Jika berhasil mendapatkan objek Date yang valid, format ke DD/MM/YYYY
    if (dateObj && !isNaN(dateObj.getTime())) {
      const d = dateObj.getDate().toString().padStart(2, '0');
      const m = (dateObj.getMonth() + 1).toString().padStart(2, '0');
      const y = dateObj.getFullYear();
      return `${d}/${m}/${y}`;
    }

    // Jika gagal, kembalikan teks asli (pengguna bisa melihatnya salah di editor)
    return val.toString().trim();
  };

  const downloadTemplate = () => {
    const worksheet = XLSX.utils.json_to_sheet([
      { "No": 1, "Nama": "Contoh Nama", "Tanggal Pertama": "19/02/2026", "Tanggal Kedua": "06/03/2026", "Jenis Sumbangan": "Makanan / Uang" }
    ]);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Template");
    XLSX.writeFile(workbook, "Template_Jadwal_Tajil.xlsx");
  };

  const exportToExcel = () => {
    const exportData = data.map(item => ({
      "No": item.no,
      "Nama Donatur": item.name,
      "Tanggal 1": item.dates[0] || "",
      "Tanggal 2": item.dates[1] || "",
      "Tanggal Lainnya": item.dates.slice(2).join(", "),
      "Jenis": item.type
    }));
    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Data_Donatur");
    XLSX.writeFile(workbook, `Jadwal_Tajil_${headerConfig.mosqueName.replace(/\s+/g, '_')}.xlsx`);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    if (data.length > 0 && !confirm("Mengunggah file baru akan menggantikan data yang ada. Lanjutkan?")) {
      e.target.value = '';
      return;
    }

    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const bstr = evt.target?.result;
        // Gunakan cellDates: true agar sel tanggal terbaca sebagai objek Date
        const wb = XLSX.read(bstr, { type: 'binary', cellDates: true });
        const ws = wb.Sheets[wb.SheetNames[0]];
        const rawData = XLSX.utils.sheet_to_json<any>(ws);
        
        const formattedData: DonationRecord[] = rawData.map((row, index) => {
          const dates: string[] = [];
          
          // Cari kolom yang mengandung kata 'tanggal'
          Object.keys(row).forEach(key => {
            const cleanKey = key.toLowerCase().trim();
            if (cleanKey.includes('tanggal')) {
              const formattedDate = processExcelValue(row[key]);
              if (formattedDate) dates.push(formattedDate);
            }
          });

          return {
            id: Math.random().toString(36).substr(2, 9),
            no: row.No || row.no || index + 1,
            name: row.Nama || row.nama || row.Name || row['Nama Donatur'] || '',
            dates: dates.length > 0 ? dates : [''],
            type: row.Jenis || row.jenis || row['Jenis Sumbangan'] || 'Makanan / Uang'
          };
        });

        setData(formattedData);
        alert(`Berhasil mengimpor ${formattedData.length} data donatur.`);
      } catch (err) {
        console.error(err);
        alert("Gagal membaca file Excel. Pastikan format file benar.");
      }
    };
    reader.readAsBinaryString(file);
    e.target.value = '';
  };

  const handlePrint = () => {
    const hasErrors = data.some(row => row.dates.some(d => !isValidDate(d)));
    if (hasErrors) {
      if (confirm("Ada format tanggal yang tidak valid (gunakan DD/MM/YYYY). Tetap cetak?")) window.print();
    } else {
      window.print();
    }
  };

  const updateRow = (id: string, field: keyof DonationRecord, value: any) => {
    setData(prev => prev.map(item => item.id === id ? { ...item, [field]: value } : item));
  };

  const updateDate = (id: string, index: number, value: string) => {
    setData(prev => prev.map(item => {
      if (item.id === id) {
        const newDates = [...item.dates];
        newDates[index] = value;
        return { ...item, dates: newDates };
      }
      return item;
    }));
  };

  const addNewRow = () => {
    const newNo = data.length > 0 ? Math.max(...data.map(d => Number(d.no) || 0)) + 1 : 1;
    setData([...data, { id: Math.random().toString(36).substr(2, 9), no: newNo, name: '', dates: [''], type: 'Makanan / Uang' }]);
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-100 font-sans selection:bg-emerald-100">
      <nav className="no-print bg-emerald-900 text-white shadow-2xl sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-20 items-center">
            <div className="flex items-center space-x-4">
              <div className="bg-emerald-500 p-2.5 rounded-xl shadow-inner">
                {showPrint ? <Printer size={28} className="text-white" /> : <FileSpreadsheet size={28} className="text-white" />}
              </div>
              <div className="hidden sm:block">
                <h1 className="text-xl font-black tracking-tight leading-none uppercase">
                  {showPrint ? 'PRATINJAU CETAK' : 'EDITOR DATA TA\'JIL'}
                </h1>
                <p className="text-[10px] text-emerald-300 mt-1 uppercase font-bold tracking-widest opacity-80">
                  {showPrint ? 'Mode Landscape Aktif' : 'Kelola Data Donatur'}
                </p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <button 
                onClick={() => setShowPrint(!showPrint)}
                className={`flex items-center space-x-2 px-6 py-3 rounded-xl font-black transition-all duration-300 shadow-xl active:scale-95 border-2 ${showPrint ? 'bg-white text-emerald-900 border-white' : 'bg-emerald-700 hover:bg-emerald-600 text-white border-emerald-500'}`}
              >
                {showPrint ? <Edit3 size={18} /> : <Printer size={18} />}
                <span>{showPrint ? 'Buka Editor Data' : 'Tampilkan Preview Cetak'}</span>
              </button>

              {showPrint ? (
                <button 
                  onClick={handlePrint}
                  className="flex items-center space-x-2 px-8 py-3 bg-yellow-400 text-emerald-950 rounded-xl hover:bg-yellow-300 transition-all shadow-xl font-black active:scale-95 animate-pulse hover:animate-none"
                >
                  <Printer size={20} />
                  <span>CETAK SEKARANG</span>
                </button>
              ) : (
                <div className="flex items-center space-x-2">
                   <button 
                    onClick={exportToExcel}
                    className="p-3 bg-emerald-800 hover:bg-emerald-700 rounded-xl transition-all border border-emerald-600 text-white shadow-lg"
                    title="Export ke Excel"
                  >
                    <Download size={20} />
                  </button>
                  <label className="flex items-center space-x-2 px-5 py-3 bg-white text-emerald-900 rounded-xl cursor-pointer hover:bg-emerald-50 transition-all font-bold shadow-lg">
                    <Upload size={18} />
                    <span>Upload Excel</span>
                    <input type="file" className="hidden" accept=".xlsx, .xls" onChange={handleFileUpload} />
                  </label>
                </div>
              )}
            </div>
          </div>
        </div>
      </nav>

      <main className="flex-grow max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full">
        {showPrint ? (
          <div className="space-y-6">
            <div className="no-print bg-blue-50 border-l-4 border-blue-500 p-4 rounded-r-xl mb-6 flex items-start space-x-3">
              <Info className="text-blue-500 flex-shrink-0 mt-0.5" size={20} />
              <div>
                <p className="text-sm font-bold text-blue-900">Tips Pencetakan Landscape:</p>
                <p className="text-xs text-blue-700">Gunakan kertas A4, pastikan orientasi di setelan printer adalah <b>Landscape</b>. Atur Margin ke "None".</p>
              </div>
            </div>
            <div className="bg-white p-4 md:p-10 shadow-[0_20px_50px_rgba(0,0,0,0.1)] rounded-3xl border border-slate-200 print-area mx-auto max-w-6xl min-h-[8in]">
              <PrintPreview data={data} header={headerConfig} />
            </div>
          </div>
        ) : (
          <div className="space-y-8 animate-in fade-in zoom-in-95 duration-300">
            <div className="bg-white rounded-3xl shadow-sm border border-slate-200 p-8">
              <div className="flex justify-between items-center mb-8">
                <div className="flex items-center space-x-3 text-emerald-800">
                  <Settings size={22} />
                  <h2 className="text-lg font-bold tracking-tight uppercase">Konfigurasi Kepala Surat</h2>
                </div>
                <button 
                  onClick={() => setIsEditingHeader(!isEditingHeader)}
                  className={`px-4 py-2 rounded-xl text-sm font-bold transition-all ${isEditingHeader ? 'bg-emerald-600 text-white' : 'text-emerald-600 hover:bg-emerald-50 border border-emerald-100'}`}
                >
                  {isEditingHeader ? 'Simpan Pengaturan' : 'Ubah Teks Header'}
                </button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {[
                  { label: "Judul Atas", key: "topHeader" },
                  { label: "Sub Judul", key: "subHeader" },
                  { label: "Tahun Hijriyah", key: "hijriYear" },
                  { label: "Nama Masjid", key: "mosqueName", full: true }
                ].map((item) => (
                  <div key={item.key} className={`space-y-2 ${item.full ? 'md:col-span-2' : ''}`}>
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">{item.label}</label>
                    <input 
                      disabled={!isEditingHeader}
                      value={(headerConfig as any)[item.key]}
                      onChange={(e) => setHeaderConfig({...headerConfig, [item.key]: e.target.value})}
                      className="w-full border-2 border-slate-100 bg-slate-50 p-3 rounded-2xl focus:border-emerald-500 focus:bg-white transition-all outline-none font-bold text-slate-700"
                    />
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white rounded-3xl shadow-xl border border-slate-200 overflow-hidden">
               <div className="p-6 border-b bg-slate-50 flex flex-col md:flex-row justify-between items-center gap-4">
                  <div className="relative w-full md:w-80">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <input 
                      placeholder="Cari donatur..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-12 pr-4 py-3 bg-white border border-slate-200 rounded-2xl focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 outline-none transition-all font-medium"
                    />
                  </div>
                  <div className="flex flex-wrap gap-3 w-full md:w-auto">
                    <button 
                      onClick={addNewRow}
                      className="flex-1 md:flex-none flex items-center justify-center space-x-2 px-6 py-3 bg-emerald-600 text-white rounded-2xl font-black hover:bg-emerald-700 shadow-lg transition-all active:scale-95"
                    >
                      <Plus size={20} />
                      <span>TAMBAH BARIS</span>
                    </button>
                    <button 
                      onClick={downloadTemplate}
                      className="flex-1 md:flex-none flex items-center justify-center space-x-2 px-4 py-3 text-emerald-700 font-bold text-xs hover:bg-emerald-50 rounded-2xl transition-all border border-emerald-100"
                    >
                      <FileSpreadsheet size={16} />
                      <span>Template</span>
                    </button>
                    <button 
                      onClick={() => { if(confirm("Hapus seluruh data?")) setData([]); }}
                      className="flex-1 md:flex-none flex items-center justify-center space-x-2 px-5 py-3 text-rose-600 font-black text-xs hover:bg-rose-50 rounded-2xl transition-all border border-rose-100"
                    >
                      <Trash2 size={16} />
                      <span>HAPUS SEMUA</span>
                    </button>
                  </div>
               </div>
               
               <div className="overflow-x-auto">
                 <table className="w-full">
                    <thead>
                      <tr className="bg-slate-100/50 text-slate-500 text-[10px] font-black uppercase tracking-widest">
                        <th className="px-8 py-5 w-20 text-center">No</th>
                        <th className="px-8 py-5">Identitas Donatur</th>
                        <th className="px-8 py-5">Jadwal Tanggal</th>
                        <th className="px-8 py-5 text-center">Opsi</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {filteredData.map((row) => (
                        <tr key={row.id} className="hover:bg-emerald-50/20 transition-colors">
                          <td className="px-8 py-6">
                            <input 
                              value={row.no}
                              onChange={(e) => updateRow(row.id, 'no', e.target.value)}
                              className="w-full bg-transparent border-b border-transparent focus:border-emerald-300 outline-none text-center font-black text-emerald-800"
                            />
                          </td>
                          <td className="px-8 py-6">
                            <input 
                              value={row.name}
                              onChange={(e) => updateRow(row.id, 'name', e.target.value)}
                              className="w-full bg-transparent border-b border-transparent focus:border-emerald-300 outline-none font-bold text-slate-800 text-lg"
                            />
                            <input 
                              value={row.type}
                              onChange={(e) => updateRow(row.id, 'type', e.target.value)}
                              className="w-full bg-transparent text-xs text-slate-400 mt-1 italic outline-none"
                            />
                          </td>
                          <td className="px-8 py-6">
                             <div className="flex flex-wrap gap-2">
                               {row.dates.map((date, idx) => (
                                 <input 
                                   key={idx}
                                   value={date}
                                   onChange={(e) => updateDate(row.id, idx, e.target.value)}
                                   placeholder="DD/MM/YYYY"
                                   className={`px-3 py-1 rounded-lg border-2 text-sm font-mono ${isValidDate(date) ? 'border-slate-100 bg-slate-50 focus:border-emerald-400' : 'border-rose-200 bg-rose-50 text-rose-600'}`}
                                 />
                               ))}
                               <button 
                                 onClick={() => {
                                   const newDates = [...row.dates, ''];
                                   updateRow(row.id, 'dates', newDates);
                                 }}
                                 className="p-1 text-emerald-600 hover:bg-emerald-50 rounded"
                               >
                                 <Plus size={14} />
                               </button>
                             </div>
                          </td>
                          <td className="px-8 py-6 text-center">
                            <button 
                              onClick={() => setData(data.filter(d => d.id !== row.id))}
                              className="p-2.5 text-slate-300 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all"
                            >
                              <Trash2 size={20} />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                 </table>
                 {filteredData.length === 0 && (
                   <div className="py-20 text-center flex flex-col items-center opacity-30">
                     <FileText size={64} className="mb-4 text-slate-400" />
                     <p className="font-bold text-slate-600">Daftar donatur kosong.</p>
                     <p className="text-sm">Klik "TAMBAH BARIS" atau "Upload Excel" untuk memulai.</p>
                   </div>
                 )}
               </div>
            </div>
          </div>
        )}
      </main>

      <footer className="no-print mt-auto py-10 bg-emerald-950 text-emerald-200 text-center">
        <p className="text-xs font-bold tracking-[0.2em] uppercase opacity-50">Sistem Digitalisasi Masjid & Musholla © 2024</p>
      </footer>
    </div>
  );
};

export default App;
