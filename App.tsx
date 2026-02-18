
import React, { useState, useCallback, useEffect, useMemo } from 'react';
import { 
  Download, Upload, Printer, Settings, Plus, Trash2, 
  FileText, Layout, CheckCircle, AlertCircle, RefreshCcw, 
  Search, FileSpreadsheet, Info, ChevronRight, Save, Edit3,
  Maximize, Minimize, Zap, X, Sliders, FileType, FileDown
} from 'lucide-react';
import * as XLSX from 'xlsx';
import { DonationRecord, HeaderConfig } from './types';
import { DEFAULT_HEADER, EXAMPLE_DATA } from './constants';
import PrintPreview from './components/PrintPreview';

const STORAGE_KEY_DATA = 'jadwal_tajil_data';
const STORAGE_KEY_HEADER = 'jadwal_tajil_header';
const STORAGE_KEY_PRINT_SCALE = 'jadwal_tajil_print_scale';
const STORAGE_KEY_ITEMS_PER_PAGE = 'jadwal_tajil_items_per_page';

const App: React.FC = () => {
  const [showPrint, setShowPrint] = useState(false);
  const [printScale, setPrintScale] = useState<number>(() => {
    const saved = localStorage.getItem(STORAGE_KEY_PRINT_SCALE);
    return saved ? parseFloat(saved) : 1.0;
  });
  const [highQuality, setHighQuality] = useState(true);
  const [itemsPerPage, setItemsPerPage] = useState<number>(() => {
    const saved = localStorage.getItem(STORAGE_KEY_ITEMS_PER_PAGE);
    return saved ? parseInt(saved) : 4;
  });
  
  const [data, setData] = useState<DonationRecord[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEY_DATA);
    return saved ? JSON.parse(saved) : EXAMPLE_DATA;
  });
  
  const [headerConfig, setHeaderConfig] = useState<HeaderConfig>(() => {
    const saved = localStorage.getItem(STORAGE_KEY_HEADER);
    const parsed = saved ? JSON.parse(saved) : DEFAULT_HEADER;
    return { ...DEFAULT_HEADER, ...parsed };
  });

  const [isEditingHeader, setIsEditingHeader] = useState(false);
  const [tempHeaderConfig, setTempHeaderConfig] = useState<HeaderConfig>(headerConfig);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_DATA, JSON.stringify(data));
  }, [data]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_HEADER, JSON.stringify(headerConfig));
  }, [headerConfig]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_PRINT_SCALE, printScale.toString());
  }, [printScale]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_ITEMS_PER_PAGE, itemsPerPage.toString());
  }, [itemsPerPage]);

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

  const processExcelValue = (val: any): string => {
    if (val === undefined || val === null || val === '') return '';
    let dateObj: Date | null = null;
    if (val instanceof Date) {
      dateObj = val;
    } else if (typeof val === 'number' && val > 30000) {
      const parsed = XLSX.SSF.parse_date_code(val);
      dateObj = new Date(parsed.y, parsed.m - 1, parsed.d);
    } else {
      const str = val.toString().trim();
      if (/^\d{4}[-/]\d{1,2}[-/]\d{1,2}$/.test(str)) {
        const parts = str.split(/[-/]/);
        dateObj = new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]));
      } else if (/^\d{1,2}[-/]\d{1,2}[-/]\d{4}$/.test(str)) {
        const parts = str.split(/[-/]/);
        dateObj = new Date(parseInt(parts[2]), parseInt(parts[1]) - 1, parseInt(parts[0]));
      }
    }
    if (dateObj && !isNaN(dateObj.getTime())) {
      const d = dateObj.getDate().toString().padStart(2, '0');
      const m = (dateObj.getMonth() + 1).toString().padStart(2, '0');
      const y = dateObj.getFullYear();
      return `${d}/${m}/${y}`;
    }
    return val.toString().trim();
  };

  const deleteAllData = () => {
    if (confirm("PERINGATAN: Anda yakin ingin menghapus SELURUH data donatur? Tindakan ini tidak dapat dibatalkan.")) {
      setData([]);
    }
  };

  const exportToWord = () => {
    let html = `
      <html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
      <head><meta charset='utf-8'><title>Data Donatur</title></head>
      <body style="font-family: Arial, sans-serif;">
        <h2 style="text-align:center;">${headerConfig.mosqueName}</h2>
        <h3 style="text-align:center;">JADWAL TA'JIL ${headerConfig.hijriYear}</h3>
        <table border="1" cellspacing="0" cellpadding="5" style="width:100%; border-collapse:collapse;">
          <tr style="background-color:#f2f2f2;">
            <th>No</th>
            <th>Nama Donatur</th>
            <th>Tanggal Penyaluran</th>
            <th>Jenis Sumbangan</th>
          </tr>
          ${data.map(item => `
            <tr>
              <td align="center">${item.no}</td>
              <td>${item.name}</td>
              <td>${item.dates.join(", ")}</td>
              <td>${item.type}</td>
            </tr>
          `).join('')}
        </table>
      </body>
      </html>
    `;

    const blob = new Blob(['\ufeff', html], {
      type: 'application/msword'
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Data_Tajil_${headerConfig.mosqueName.replace(/\s+/g, '_')}.doc`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
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
        const wb = XLSX.read(bstr, { type: 'binary', cellDates: true });
        const ws = wb.Sheets[wb.SheetNames[0]];
        const rawData = XLSX.utils.sheet_to_json<any>(ws);
        const formattedData: DonationRecord[] = rawData.map((row, index) => {
          const dates: string[] = [];
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
        alert("Gagal membaca file Excel.");
      }
    };
    reader.readAsBinaryString(file);
    e.target.value = '';
  };

  const handlePrint = () => {
    const hasErrors = data.some(row => row.dates.some(d => !isValidDate(d)));
    if (hasErrors) {
      if (confirm("Ada format tanggal yang tidak valid. Tetap cetak?")) window.print();
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

  const handleStartEditHeader = () => {
    setTempHeaderConfig({ ...headerConfig });
    setIsEditingHeader(true);
  };

  const handleSaveHeader = () => {
    setHeaderConfig({ ...tempHeaderConfig });
    setIsEditingHeader(false);
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-100 font-sans selection:bg-emerald-100">
      <nav className="no-print bg-slate-900 text-white shadow-2xl sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-20 items-center">
            <div className="flex items-center space-x-4">
              <div className="bg-emerald-500 p-2.5 rounded-xl shadow-inner">
                {showPrint ? <Printer size={28} className="text-white" /> : <FileSpreadsheet size={28} className="text-white" />}
              </div>
              <div className="hidden lg:block">
                <h1 className="text-xl font-black tracking-tight leading-none uppercase">
                  {showPrint ? 'PRATINJAU CETAK' : 'EDITOR DATA TA\'JIL'}
                </h1>
                <p className="text-[10px] text-emerald-300 mt-1 uppercase font-bold tracking-widest opacity-80">
                  {showPrint ? 'Mode Portrait Aktif' : 'Kelola Data Donatur'}
                </p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <button 
                onClick={() => setShowPrint(!showPrint)}
                className={`flex items-center space-x-2 px-6 py-3 rounded-xl font-black transition-all duration-300 shadow-xl active:scale-95 border-2 ${showPrint ? 'bg-white text-slate-900 border-white' : 'bg-slate-700 hover:bg-slate-600 text-white border-slate-500'}`}
              >
                {showPrint ? <Edit3 size={18} /> : <Printer size={18} />}
                <span>{showPrint ? 'Editor' : 'Cetak'}</span>
              </button>

              {showPrint && (
                <button 
                  onClick={handlePrint}
                  className="flex items-center space-x-2 px-8 py-3 bg-emerald-500 text-white rounded-xl hover:bg-emerald-400 transition-all shadow-xl font-black active:scale-95"
                >
                  <Printer size={20} />
                  <span>CETAK SEKARANG</span>
                </button>
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
                <p className="text-sm font-bold text-blue-900">Kontrol Presisi Cetak:</p>
                <p className="text-xs text-blue-700">Skala: {Math.round(printScale * 100)}% | Resolusi: {highQuality ? 'Tinggi' : 'Standar'} | Isi: {itemsPerPage} Donatur/Hal</p>
              </div>
            </div>
            <div className="bg-white p-4 shadow-2xl rounded-3xl border border-slate-200 print-area mx-auto overflow-hidden">
              <PrintPreview 
                data={data} 
                header={headerConfig} 
                scale={printScale} 
                highQuality={highQuality} 
                itemsPerPage={itemsPerPage}
              />
            </div>
          </div>
        ) : (
          <div className="space-y-8 animate-in fade-in zoom-in-95 duration-300">
            {/* Konfigurasi Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              
              {/* Card 1: Header Config */}
              <div className="bg-white rounded-3xl shadow-sm border border-slate-200 p-8">
                <div className="flex justify-between items-center mb-6">
                  <div className="flex items-center space-x-3 text-slate-800">
                    <Settings size={22} className="text-emerald-500" />
                    <h2 className="text-lg font-black tracking-tight uppercase">Kepala Surat</h2>
                  </div>
                  <button 
                    onClick={isEditingHeader ? handleSaveHeader : handleStartEditHeader}
                    className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-black transition-all border-2 ${isEditingHeader ? 'bg-emerald-500 text-white border-emerald-500' : 'text-slate-600 border-slate-100 hover:bg-slate-50'}`}
                  >
                    {isEditingHeader ? <Save size={14} /> : <Edit3 size={14} />}
                    <span>{isEditingHeader ? 'SIMPAN' : 'UBAH TEKS'}</span>
                  </button>
                </div>
                
                <div className="space-y-4">
                  {[
                    { label: "Nama Masjid", key: "mosqueName" },
                    { label: "Tahun Hijriyah", key: "hijriYear" },
                    { label: "Sub Judul", key: "subHeader" }
                  ].map((item) => (
                    <div key={item.key}>
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 mb-1 block">{item.label}</label>
                      <input 
                        disabled={!isEditingHeader}
                        value={isEditingHeader ? (tempHeaderConfig as any)[item.key] : (headerConfig as any)[item.key]}
                        onChange={(e) => setTempHeaderConfig({...tempHeaderConfig, [item.key]: e.target.value})}
                        className={`w-full border-2 p-3 rounded-2xl outline-none font-bold transition-all ${isEditingHeader ? 'border-emerald-200 bg-white ring-4 ring-emerald-500/5' : 'border-slate-50 bg-slate-50 text-slate-400'}`}
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* Card 2: Print Settings */}
              <div className="bg-white rounded-3xl shadow-sm border border-slate-200 p-8">
                <div className="flex items-center space-x-3 text-slate-800 mb-6">
                  <Sliders size={22} className="text-emerald-500" />
                  <h2 className="text-lg font-black tracking-tight uppercase">Pengaturan Cetak</h2>
                </div>

                <div className="space-y-6">
                  {/* Scale Setting */}
                  <div>
                    <div className="flex justify-between items-end mb-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Skala Cetak (Presisi)</label>
                      <span className="text-emerald-600 font-black text-sm">{Math.round(printScale * 100)}%</span>
                    </div>
                    <div className="flex items-center space-x-4">
                      <Minimize size={16} className="text-slate-400" />
                      <input 
                        type="range" min="0.5" max="1.5" step="0.01" 
                        value={printScale} 
                        onChange={(e) => setPrintScale(parseFloat(e.target.value))}
                        className="flex-grow h-2 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-emerald-500"
                      />
                      <Maximize size={16} className="text-slate-400" />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    {/* Items Per Page */}
                    <div>
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 mb-1 block">Donatur Per Hal</label>
                      <input 
                        type="number" min="1" max="10" 
                        value={itemsPerPage} 
                        onChange={(e) => setItemsPerPage(parseInt(e.target.value) || 1)}
                        className="w-full border-2 border-slate-100 bg-slate-50 p-3 rounded-2xl font-black outline-none focus:border-emerald-500 transition-all"
                      />
                    </div>
                    {/* Quality Toggle */}
                    <div>
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 mb-1 block">Kualitas Garis</label>
                      <button 
                        onClick={() => setHighQuality(!highQuality)}
                        className={`w-full p-3 rounded-2xl font-black text-xs transition-all flex items-center justify-center space-x-2 border-2 ${highQuality ? 'bg-emerald-50 border-emerald-200 text-emerald-700' : 'bg-slate-50 border-slate-100 text-slate-400'}`}
                      >
                        <Zap size={14} fill={highQuality ? "currentColor" : "none"} />
                        <span>{highQuality ? 'TAJAM' : 'STANDAR'}</span>
                      </button>
                    </div>
                  </div>
                  
                  <div className="p-3 bg-amber-50 border border-amber-100 rounded-2xl flex items-start space-x-3">
                    <AlertCircle size={16} className="text-amber-500 flex-shrink-0 mt-0.5" />
                    <p className="text-[10px] text-amber-800 font-medium leading-relaxed">Sesuaikan skala jika hasil cetak terpotong. Jumlah donatur per halaman akan memengaruhi besar kecilnya kartu di kertas A4.</p>
                  </div>
                </div>
              </div>

            </div>

            {/* Data Table */}
            <div className="bg-white rounded-3xl shadow-xl border border-slate-200 overflow-hidden">
               <div className="p-6 border-b bg-slate-50/50 flex flex-col md:flex-row justify-between items-center gap-4">
                  <div className="relative w-full md:w-64">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <input 
                      placeholder="Cari donatur..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-12 pr-4 py-3 bg-white border border-slate-200 rounded-2xl focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 outline-none transition-all font-medium text-sm"
                    />
                  </div>
                  
                  <div className="flex flex-wrap gap-2 w-full md:w-auto">
                    {/* Action Group: Manage */}
                    <button onClick={addNewRow} className="flex-grow md:flex-none flex items-center justify-center space-x-2 px-4 py-2.5 bg-emerald-600 text-white rounded-xl font-black text-xs hover:bg-emerald-700 transition-all shadow-md active:scale-95">
                      <Plus size={16} />
                      <span>TAMBAH</span>
                    </button>
                    
                    <button onClick={deleteAllData} className="flex-grow md:flex-none flex items-center justify-center space-x-2 px-4 py-2.5 bg-rose-50 text-rose-600 border border-rose-100 rounded-xl font-black text-xs hover:bg-rose-100 transition-all active:scale-95">
                      <Trash2 size={16} />
                      <span>HAPUS SEMUA</span>
                    </button>

                    <div className="w-px h-8 bg-slate-200 hidden md:block mx-1"></div>

                    {/* Action Group: Import/Export */}
                    <label className="flex-grow md:flex-none flex items-center justify-center space-x-2 px-4 py-2.5 bg-white text-slate-700 border border-slate-200 rounded-xl font-black text-xs hover:bg-slate-50 cursor-pointer transition-all active:scale-95">
                      <Upload size={16} />
                      <span>IMPORT EXCEL</span>
                      <input type="file" className="hidden" accept=".xlsx, .xls" onChange={handleFileUpload} />
                    </label>

                    <button onClick={() => setShowPrint(true)} className="flex-grow md:flex-none flex items-center justify-center space-x-2 px-4 py-2.5 bg-blue-50 text-blue-600 border border-blue-100 rounded-xl font-black text-xs hover:bg-blue-100 transition-all active:scale-95">
                      <FileDown size={16} />
                      <span>EKSPOR PDF</span>
                    </button>

                    <button onClick={exportToWord} className="flex-grow md:flex-none flex items-center justify-center space-x-2 px-4 py-2.5 bg-indigo-50 text-indigo-600 border border-indigo-100 rounded-xl font-black text-xs hover:bg-indigo-100 transition-all active:scale-95">
                      <FileType size={16} />
                      <span>EXPORT WORD</span>
                    </button>
                    
                    <button onClick={exportToExcel} className="flex-grow md:flex-none flex items-center justify-center space-x-2 px-4 py-2.5 bg-emerald-50 text-emerald-600 border border-emerald-100 rounded-xl font-black text-xs hover:bg-emerald-100 transition-all active:scale-95">
                      <Download size={16} />
                      <span>EXCEL</span>
                    </button>
                  </div>
               </div>
               
               <div className="overflow-x-auto">
                 <table className="w-full">
                    <thead>
                      <tr className="bg-slate-50 text-slate-400 text-[10px] font-black uppercase tracking-widest border-b">
                        <th className="px-8 py-4 w-20 text-center">No</th>
                        <th className="px-8 py-4 text-left">Nama Donatur</th>
                        <th className="px-8 py-4 text-left">Jadwal Tanggal</th>
                        <th className="px-8 py-4 text-center">Opsi</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {filteredData.length > 0 ? filteredData.map((row) => (
                        <tr key={row.id} className="hover:bg-slate-50/50 transition-colors">
                          <td className="px-8 py-5">
                            <input value={row.no} onChange={(e) => updateRow(row.id, 'no', e.target.value)} className="w-full bg-transparent text-center font-black text-slate-800 outline-none" />
                          </td>
                          <td className="px-8 py-5">
                            <input value={row.name} onChange={(e) => updateRow(row.id, 'name', e.target.value)} className="w-full bg-transparent font-bold text-slate-800 text-base outline-none mb-0.5" />
                            <input value={row.type} onChange={(e) => updateRow(row.id, 'type', e.target.value)} className="w-full bg-transparent text-xs text-slate-400 outline-none" />
                          </td>
                          <td className="px-8 py-5">
                             <div className="flex flex-wrap gap-2">
                               {row.dates.map((date, idx) => (
                                 <input 
                                   key={idx}
                                   value={date}
                                   onChange={(e) => updateDate(row.id, idx, e.target.value)}
                                   placeholder="DD/MM/YYYY"
                                   className={`px-3 py-1 rounded-lg border-2 text-xs font-mono font-bold ${isValidDate(date) ? 'border-slate-100 bg-slate-50 focus:border-emerald-400' : 'border-rose-100 bg-rose-50 text-rose-600'}`}
                                 />
                               ))}
                             </div>
                          </td>
                          <td className="px-8 py-5 text-center">
                            <button onClick={() => setData(data.filter(d => d.id !== row.id))} className="p-2 text-slate-300 hover:text-rose-600 transition-all">
                              <Trash2 size={18} />
                            </button>
                          </td>
                        </tr>
                      )) : (
                        <tr>
                          <td colSpan={4} className="py-20 text-center">
                            <div className="flex flex-col items-center text-slate-300">
                              <FileSpreadsheet size={48} className="mb-4 opacity-20" />
                              <p className="text-sm font-bold uppercase tracking-widest">Belum ada data donatur</p>
                              <p className="text-[10px] mt-2">Gunakan tombol TAMBAH atau IMPORT EXCEL untuk memulai</p>
                            </div>
                          </td>
                        </tr>
                      )}
                    </tbody>
                 </table>
               </div>
            </div>
          </div>
        )}
      </main>

      <footer className="no-print mt-auto py-8 bg-slate-900 text-slate-500 text-center">
        <p className="text-[10px] font-black tracking-[0.2em] uppercase">Sistem Administrasi Masjid Digital © 2024</p>
      </footer>
    </div>
  );
};

export default App;
