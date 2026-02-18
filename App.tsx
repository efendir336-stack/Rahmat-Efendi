
import React, { useState, useCallback, useEffect, useMemo } from 'react';
import { 
  Download, Upload, Printer, Settings, Plus, Trash2, 
  FileText, Layout, CheckCircle, AlertCircle, RefreshCcw, 
  Search, FileSpreadsheet, Info, ChevronRight, Save, Edit3,
  Maximize, Minimize, Zap, X, Sliders, FileType, FileDown, 
  Square, ArrowUpToLine, MoveHorizontal, MoveVertical
} from 'lucide-react';
import * as XLSX from 'xlsx';
import { DonationRecord, HeaderConfig } from './types';
import { DEFAULT_HEADER, EXAMPLE_DATA } from './constants';
import PrintPreview from './components/PrintPreview';

const STORAGE_KEY_DATA = 'jadwal_tajil_data';
const STORAGE_KEY_HEADER = 'jadwal_tajil_header';
const STORAGE_KEY_PRINT_SCALE = 'jadwal_tajil_print_scale';
const STORAGE_KEY_ITEMS_PER_PAGE = 'jadwal_tajil_items_per_page';
const STORAGE_KEY_MARGINS = 'jadwal_tajil_margins';

const App: React.FC = () => {
  const [showPrint, setShowPrint] = useState(false);
  const [printScale, setPrintScale] = useState<number>(() => {
    const saved = localStorage.getItem(STORAGE_KEY_PRINT_SCALE);
    return saved ? parseFloat(saved) : 1.0;
  });
  
  // State untuk margin spesifik
  const [margins, setMargins] = useState<{top: number, bottom: number, left: number, right: number}>(() => {
    const saved = localStorage.getItem(STORAGE_KEY_MARGINS);
    return saved ? JSON.parse(saved) : { top: 5, bottom: 5, left: 5, right: 5 };
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

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_MARGINS, JSON.stringify(margins));
  }, [margins]);

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

  const updateMargin = (key: keyof typeof margins, val: number) => {
    setMargins(prev => ({ ...prev, [key]: val }));
  };

  const deleteAllData = () => {
    if (confirm("PERINGATAN: Anda yakin ingin menghapus SELURUH data donatur?")) {
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
    const blob = new Blob(['\ufeff', html], { type: 'application/msword' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Data_Tajil_${headerConfig.mosqueName.replace(/\s+/g, '_')}.doc`;
    link.click();
  };

  const exportToExcel = () => {
    const exportData = data.map(item => ({
      "No": item.no,
      "Nama Donatur": item.name,
      "Tanggal 1": item.dates[0] || "",
      "Tanggal 2": item.dates[1] || "",
      "Jenis": item.type
    }));
    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Data_Donatur");
    XLSX.writeFile(workbook, `Jadwal_Tajil_${headerConfig.mosqueName.replace(/\s+/g, '_')}.xlsx`);
  };

  // Fix: Added handleStartEditHeader to initialize temporary header state for editing.
  const handleStartEditHeader = () => {
    setTempHeaderConfig(headerConfig);
    setIsEditingHeader(true);
  };

  // Fix: Added handleSaveHeader to commit temporary header changes.
  const handleSaveHeader = () => {
    setHeaderConfig(tempHeaderConfig);
    setIsEditingHeader(false);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const bstr = evt.target?.result;
        const wb = XLSX.read(bstr, { type: 'binary' });
        const ws = wb.Sheets[wb.SheetNames[0]];
        const rawData = XLSX.utils.sheet_to_json<any>(ws);
        const formattedData: DonationRecord[] = rawData.map((row, index) => ({
          id: Math.random().toString(36).substr(2, 9),
          no: row.No || row.no || index + 1,
          name: row.Nama || row.nama || row.Name || '',
          dates: [row.Tanggal1 || row.Tanggal || '', row.Tanggal2 || ''],
          type: row.Jenis || 'Makanan / Uang'
        }));
        setData(formattedData);
      } catch (err) { alert("Gagal membaca file Excel."); }
    };
    reader.readAsBinaryString(file);
  };

  const handlePrint = () => window.print();

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
    setData([...data, { id: Math.random().toString(36).substr(2, 9), no: newNo, name: '', dates: ['', ''], type: 'Makanan / Uang' }]);
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
              <div>
                <h1 className="text-xl font-black tracking-tight leading-none uppercase">
                  {showPrint ? 'PRATINJAU CETAK A4' : 'EDITOR JADWAL TA\'JIL'}
                </h1>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <button 
                onClick={() => setShowPrint(!showPrint)}
                className={`flex items-center space-x-2 px-6 py-3 rounded-xl font-black transition-all duration-300 shadow-xl border-2 ${showPrint ? 'bg-white text-slate-900 border-white' : 'bg-slate-700 hover:bg-slate-600 text-white border-slate-500'}`}
              >
                {showPrint ? <Edit3 size={18} /> : <Printer size={18} />}
                <span>{showPrint ? 'Ke Editor' : 'Pratinjau'}</span>
              </button>
              {showPrint && (
                <button onClick={handlePrint} className="flex items-center space-x-2 px-8 py-3 bg-emerald-500 text-white rounded-xl hover:bg-emerald-400 transition-all shadow-xl font-black">
                  <Printer size={20} />
                  <span>CETAK</span>
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
                <p className="text-sm font-bold text-blue-900">Kontrol Presisi A4 Full:</p>
                <p className="text-xs text-blue-700">Skala: {Math.round(printScale * 100)}% | Margin [T:{margins.top} B:{margins.bottom} L:{margins.left} R:{margins.right}] | Isi: {itemsPerPage}/Hal</p>
                <p className="text-[10px] text-blue-600 mt-1 uppercase font-bold tracking-wider">Gunakan margin 0 jika printer mendukung "Borderless Print".</p>
              </div>
            </div>
            <div className="bg-white p-4 shadow-2xl rounded-3xl border border-slate-200 print-area mx-auto overflow-hidden">
              <PrintPreview 
                data={data} 
                header={headerConfig} 
                scale={printScale} 
                highQuality={highQuality} 
                itemsPerPage={itemsPerPage}
                margins={margins}
              />
            </div>
          </div>
        ) : (
          <div className="space-y-8 animate-in fade-in zoom-in-95 duration-300">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              
              {/* Kepala Surat */}
              <div className="bg-white rounded-3xl shadow-sm border border-slate-200 p-8">
                <div className="flex justify-between items-center mb-6">
                  <div className="flex items-center space-x-3 text-slate-800">
                    <Settings size={22} className="text-emerald-500" />
                    <h2 className="text-lg font-black tracking-tight uppercase">Kepala Surat</h2>
                  </div>
                  <button 
                    onClick={isEditingHeader ? handleSaveHeader : handleStartEditHeader}
                    className={`px-4 py-2 rounded-xl text-xs font-black transition-all border-2 ${isEditingHeader ? 'bg-emerald-500 text-white border-emerald-500' : 'text-slate-600 border-slate-100 hover:bg-slate-50'}`}
                  >
                    {isEditingHeader ? 'SIMPAN' : 'UBAH'}
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
                        className={`w-full border-2 p-3 rounded-2xl outline-none font-bold transition-all ${isEditingHeader ? 'border-emerald-200 bg-white' : 'border-slate-50 bg-slate-50 text-slate-400'}`}
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* Pengaturan Cetak Granular */}
              <div className="bg-white rounded-3xl shadow-sm border border-slate-200 p-8">
                <div className="flex items-center space-x-3 text-slate-800 mb-6">
                  <Sliders size={22} className="text-emerald-500" />
                  <h2 className="text-lg font-black tracking-tight uppercase">Presisi Margin (A4 FULL)</h2>
                </div>

                <div className="space-y-6">
                  <div className="grid grid-cols-2 gap-x-8 gap-y-4">
                    {/* Top */}
                    <div>
                      <div className="flex justify-between mb-1"><label className="text-[10px] font-black text-slate-400">MARGIN ATAS</label><span className="text-xs font-black">{margins.top}mm</span></div>
                      <input type="range" min="0" max="30" value={margins.top} onChange={(e) => updateMargin('top', parseInt(e.target.value))} className="w-full accent-emerald-500" />
                    </div>
                    {/* Bottom */}
                    <div>
                      <div className="flex justify-between mb-1"><label className="text-[10px] font-black text-slate-400">MARGIN BAWAH</label><span className="text-xs font-black">{margins.bottom}mm</span></div>
                      <input type="range" min="0" max="30" value={margins.bottom} onChange={(e) => updateMargin('bottom', parseInt(e.target.value))} className="w-full accent-emerald-500" />
                    </div>
                    {/* Left */}
                    <div>
                      <div className="flex justify-between mb-1"><label className="text-[10px] font-black text-slate-400">MARGIN KIRI</label><span className="text-xs font-black">{margins.left}mm</span></div>
                      <input type="range" min="0" max="30" value={margins.left} onChange={(e) => updateMargin('left', parseInt(e.target.value))} className="w-full accent-emerald-500" />
                    </div>
                    {/* Right */}
                    <div>
                      <div className="flex justify-between mb-1"><label className="text-[10px] font-black text-slate-400">MARGIN KANAN</label><span className="text-xs font-black">{margins.right}mm</span></div>
                      <input type="range" min="0" max="30" value={margins.right} onChange={(e) => updateMargin('right', parseInt(e.target.value))} className="w-full accent-emerald-500" />
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <label className="text-[10px] font-black text-slate-400 mb-1 block">SKALA (%)</label>
                      <input type="number" step="0.01" value={printScale} onChange={(e) => setPrintScale(parseFloat(e.target.value))} className="w-full border-2 p-2 rounded-xl font-bold" />
                    </div>
                    <div>
                      <label className="text-[10px] font-black text-slate-400 mb-1 block">DONATUR/HAL</label>
                      <input type="number" min="1" value={itemsPerPage} onChange={(e) => setItemsPerPage(parseInt(e.target.value))} className="w-full border-2 p-2 rounded-xl font-bold" />
                    </div>
                    <div>
                      <label className="text-[10px] font-black text-slate-400 mb-1 block">KUALITAS</label>
                      <button onClick={() => setHighQuality(!highQuality)} className={`w-full p-2 rounded-xl font-black text-[10px] border-2 ${highQuality ? 'bg-emerald-500 text-white border-emerald-500' : 'bg-slate-50 text-slate-400 border-slate-100'}`}>
                        {highQuality ? 'TAJAM' : 'STANDAR'}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Data Table */}
            <div className="bg-white rounded-3xl shadow-xl border border-slate-200 overflow-hidden">
               <div className="p-6 border-b bg-slate-50/50 flex flex-col md:flex-row justify-between items-center gap-4">
                  <div className="relative w-full md:w-64">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <input placeholder="Cari..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full pl-12 pr-4 py-3 bg-white border border-slate-200 rounded-2xl outline-none" />
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <button onClick={addNewRow} className="px-4 py-2.5 bg-emerald-600 text-white rounded-xl font-black text-xs hover:bg-emerald-700 shadow-md flex items-center space-x-2">
                      <Plus size={16} /> <span>TAMBAH</span>
                    </button>
                    <button onClick={deleteAllData} className="px-4 py-2.5 bg-rose-50 text-rose-600 border border-rose-100 rounded-xl font-black text-xs">
                      <Trash2 size={16} />
                    </button>
                    <label className="px-4 py-2.5 bg-white text-slate-700 border border-slate-200 rounded-xl font-black text-xs hover:bg-slate-50 cursor-pointer flex items-center space-x-2">
                      <Upload size={16} /> <span>EXCEL</span>
                      <input type="file" className="hidden" accept=".xlsx, .xls" onChange={handleFileUpload} />
                    </label>
                    <button onClick={exportToWord} className="px-4 py-2.5 bg-indigo-50 text-indigo-600 border border-indigo-100 rounded-xl font-black text-xs">
                      <FileType size={16} /> <span>WORD</span>
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
                      {filteredData.map((row) => (
                        <tr key={row.id} className="hover:bg-slate-50/50">
                          <td className="px-8 py-5">
                            <input value={row.no} onChange={(e) => updateRow(row.id, 'no', e.target.value)} className="w-full bg-transparent text-center font-black outline-none" />
                          </td>
                          <td className="px-8 py-5">
                            <input value={row.name} onChange={(e) => updateRow(row.id, 'name', e.target.value)} className="w-full bg-transparent font-bold text-base outline-none" />
                            <input value={row.type} onChange={(e) => updateRow(row.id, 'type', e.target.value)} className="w-full bg-transparent text-xs text-slate-400 outline-none" />
                          </td>
                          <td className="px-8 py-5">
                             <div className="flex flex-wrap gap-2">
                               {row.dates.map((date, idx) => (
                                 <input key={idx} value={date} onChange={(e) => updateDate(row.id, idx, e.target.value)} placeholder="DD/MM/YYYY" className={`px-3 py-1 rounded-lg border-2 text-xs font-mono font-bold ${isValidDate(date) ? 'border-slate-100 bg-slate-50' : 'border-rose-100 bg-rose-50 text-rose-600'}`} />
                               ))}
                             </div>
                          </td>
                          <td className="px-8 py-5 text-center">
                            <button onClick={() => setData(data.filter(d => d.id !== row.id))} className="text-slate-300 hover:text-rose-600">
                              <Trash2 size={18} />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                 </table>
               </div>
            </div>
          </div>
        )}
      </main>

      <footer className="no-print py-8 bg-slate-900 text-slate-500 text-center">
        <p className="text-[10px] font-black tracking-[0.2em] uppercase">Sistem Administrasi Masjid Digital © 2024</p>
      </footer>
    </div>
  );
};

export default App;
