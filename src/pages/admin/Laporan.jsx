import { useState } from 'react';
import { Download, FileText, Calendar, Filter, FileSpreadsheet } from 'lucide-react';
import toast from 'react-hot-toast';
import apiService from '../../services/apiService';

const Laporan = () => {
  const [dateRange, setDateRange] = useState({
    start: '',
    end: ''
  });
  const [reportType, setReportType] = useState('permohonan');
  const [status, setStatus] = useState('all');
  const [loading, setLoading] = useState(false);

  const handleDateChange = (field, value) => {
    setDateRange(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleExportExcel = async () => {
    if (!dateRange.start || !dateRange.end) {
      toast.error('Pilih rentang tanggal terlebih dahulu');
      return;
    }

    setLoading(true);
    try {
      await apiService.exportPermohonanExcel({
        start_date: dateRange.start,
        end_date: dateRange.end,
        status: status !== 'all' ? status : undefined
      });
      
      toast.success('Excel berhasil diunduh');
    } catch (error) {
      toast.error('Gagal mengunduh Excel: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleExportPDF = async () => {
    if (!dateRange.start || !dateRange.end) {
      toast.error('Pilih rentang tanggal terlebih dahulu');
      return;
    }

    setLoading(true);
    try {
      await apiService.exportPermohonanPdf({
        start_date: dateRange.start,
        end_date: dateRange.end,
        status: status !== 'all' ? status : undefined
      });
      
      toast.success('PDF berhasil diunduh');
    } catch (error) {
      toast.error('Gagal mengunduh PDF: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Laporan</h1>
          <p className="text-gray-600">Generate dan export laporan data</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Filter Section */}
          <div className="lg:col-span-1">
            <div className="card p-6 space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <Filter className="h-5 w-5" />
                  Filter Laporan
                </h3>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Jenis Laporan
                </label>
                <select
                  value={reportType}
                  onChange={(e) => setReportType(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="permohonan">Data Permohonan</option>
                  <option value="layanan">Data Layanan</option>
                  <option value="pengguna">Data Pengguna</option>
                </select>
              </div>

              {reportType === 'permohonan' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Status Permohonan
                  </label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="all">Semua Status</option>
                    <option value="baru">Baru</option>
                    <option value="proses">Proses</option>
                    <option value="selesai">Selesai</option>
                    <option value="ditolak">Ditolak</option>
                  </select>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tanggal Mulai
                </label>
                <input
                  type="date"
                  value={dateRange.start}
                  onChange={(e) => handleDateChange('start', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tanggal Akhir
                </label>
                <input
                  type="date"
                  value={dateRange.end}
                  onChange={(e) => handleDateChange('end', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>

          {/* Actions Section */}
          <div className="lg:col-span-2">
            <div className="card p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-6">Export Laporan</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <button
                  onClick={handleExportExcel}
                  disabled={loading || reportType !== 'permohonan'}
                  className="flex items-center justify-center gap-3 px-6 py-4 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
                >
                  <FileSpreadsheet className="h-5 w-5" />
                  <div className="text-left">
                    <div className="font-semibold">Download Excel</div>
                    <div className="text-sm opacity-90">Format spreadsheet</div>
                  </div>
                </button>

                <button
                  onClick={handleExportPDF}
                  disabled={loading || reportType !== 'permohonan'}
                  className="flex items-center justify-center gap-3 px-6 py-4 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
                >
                  <FileText className="h-5 w-5" />
                  <div className="text-left">
                    <div className="font-semibold">Download PDF</div>
                    <div className="text-sm opacity-90">Format printable</div>
                  </div>
                </button>
              </div>

              {loading && (
                <div className="mt-6 text-center">
                  <div className="inline-flex items-center gap-2 text-gray-600">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
                    <span>Memproses laporan...</span>
                  </div>
                </div>
              )}

              <div className="mt-8 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <h4 className="font-semibold text-blue-900 mb-2">Informasi</h4>
                <ul className="text-sm text-blue-800 space-y-1">
                  <li>• File Excel (.xlsx) dapat dibuka di Microsoft Excel atau Google Sheets</li>
                  <li>• File PDF cocok untuk dicetak atau disimpan sebagai arsip</li>
                  <li>• Export hanya tersedia untuk laporan permohonan</li>
                  <li>• Pastikan rentang tanggal sudah dipilih sebelum export</li>
                  <li>• Filter status akan diterapkan pada hasil export</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Laporan;
