import { useState } from 'react';
import { Download, FileText, Calendar, Filter } from 'lucide-react';
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

  const handleExportCSV = async () => {
    if (!dateRange.start || !dateRange.end) {
      toast.error('Pilih rentang tanggal terlebih dahulu');
      return;
    }

    setLoading(true);
    try {
      let data = [];
      
      if (reportType === 'permohonan') {
        const response = await apiService.getPermohonan();
        data = response.data.data || response.data || [];
        
        // Filter by date
        data = data.filter(item => {
          const itemDate = new Date(item.created_at);
          return itemDate >= new Date(dateRange.start) && itemDate <= new Date(dateRange.end);
        });

        // Filter by status
        if (status !== 'all') {
          data = data.filter(item => item.status === status);
        }

        // Convert to CSV
        const headers = ['No. Registrasi', 'Nama', 'NIK', 'Layanan', 'Status', 'Tanggal'];
        const rows = data.map(item => [
          item.nomor_registrasi || '-',
          item.nama,
          item.nik,
          item.layanan?.nama || '-',
          item.status,
          new Date(item.created_at).toLocaleDateString('id-ID')
        ]);

        downloadCSV('Laporan_Permohonan', headers, rows);
      } else if (reportType === 'layanan') {
        const response = await apiService.getLayanan();
        data = response.data || [];

        const headers = ['Nama Layanan', 'Kategori', 'Waktu Proses', 'Biaya', 'Status'];
        const rows = data.map(item => [
          item.nama,
          item.kategori,
          item.waktu_proses,
          item.biaya,
          item.status
        ]);

        downloadCSV('Laporan_Layanan', headers, rows);
      } else if (reportType === 'pengguna') {
        const response = await apiService.getAdminUsers();
        data = response.data || [];

        const headers = ['Nama', 'Username', 'Email', 'Role', 'Status'];
        const rows = data.map(item => [
          item.name,
          item.username,
          item.email,
          item.role,
          item.status
        ]);

        downloadCSV('Laporan_Pengguna', headers, rows);
      }

      toast.success('Laporan berhasil diunduh');
    } catch (error) {
      toast.error('Gagal mengunduh laporan: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const downloadCSV = (filename, headers, rows) => {
    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');

    const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    
    link.setAttribute('href', url);
    link.setAttribute('download', `${filename}_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handlePrintReport = async () => {
    if (!dateRange.start || !dateRange.end) {
      toast.error('Pilih rentang tanggal terlebih dahulu');
      return;
    }

    setLoading(true);
    try {
      let data = [];
      let title = '';

      if (reportType === 'permohonan') {
        const response = await apiService.getPermohonan();
        data = response.data.data || response.data || [];
        
        data = data.filter(item => {
          const itemDate = new Date(item.created_at);
          return itemDate >= new Date(dateRange.start) && itemDate <= new Date(dateRange.end);
        });

        if (status !== 'all') {
          data = data.filter(item => item.status === status);
        }

        title = 'Laporan Data Permohonan';
      }

      // Create print window
      const printWindow = window.open('', '_blank');
      printWindow.document.write(`
        <!DOCTYPE html>
        <html>
        <head>
          <title>${title}</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 20px; }
            h1 { text-align: center; }
            .info { margin: 20px 0; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
            th { background-color: #f3f4f6; font-weight: bold; }
            tr:nth-child(even) { background-color: #f9fafb; }
            @media print {
              button { display: none; }
            }
          </style>
        </head>
        <body>
          <h1>${title}</h1>
          <div class="info">
            <p><strong>Periode:</strong> ${new Date(dateRange.start).toLocaleDateString('id-ID')} - ${new Date(dateRange.end).toLocaleDateString('id-ID')}</p>
            <p><strong>Total Data:</strong> ${data.length}</p>
          </div>
          <table>
            <thead>
              <tr>
                <th>No</th>
                <th>No. Registrasi</th>
                <th>Nama</th>
                <th>NIK</th>
                <th>Layanan</th>
                <th>Status</th>
                <th>Tanggal</th>
              </tr>
            </thead>
            <tbody>
              ${data.map((item, index) => `
                <tr>
                  <td>${index + 1}</td>
                  <td>${item.nomor_registrasi || '-'}</td>
                  <td>${item.nama}</td>
                  <td>${item.nik}</td>
                  <td>${item.layanan?.nama || '-'}</td>
                  <td>${item.status}</td>
                  <td>${new Date(item.created_at).toLocaleDateString('id-ID')}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
          <button onclick="window.print()" style="margin-top: 20px; padding: 10px 20px; background: #3b82f6; color: white; border: none; border-radius: 4px; cursor: pointer;">
            Cetak Laporan
          </button>
        </body>
        </html>
      `);
      printWindow.document.close();
      
      toast.success('Jendela print telah dibuka');
    } catch (error) {
      toast.error('Gagal membuat laporan: ' + error.message);
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
                  onClick={handleExportCSV}
                  disabled={loading}
                  className="flex items-center justify-center gap-3 px-6 py-4 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
                >
                  <Download className="h-5 w-5" />
                  <div className="text-left">
                    <div className="font-semibold">Download CSV</div>
                    <div className="text-sm opacity-90">Format spreadsheet</div>
                  </div>
                </button>

                <button
                  onClick={handlePrintReport}
                  disabled={loading || reportType !== 'permohonan'}
                  className="flex items-center justify-center gap-3 px-6 py-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
                >
                  <FileText className="h-5 w-5" />
                  <div className="text-left">
                    <div className="font-semibold">Cetak PDF</div>
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
                  <li>• File CSV dapat dibuka di Excel atau Google Sheets</li>
                  <li>• Cetak PDF hanya tersedia untuk laporan permohonan</li>
                  <li>• Pastikan rentang tanggal sudah dipilih sebelum export</li>
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
