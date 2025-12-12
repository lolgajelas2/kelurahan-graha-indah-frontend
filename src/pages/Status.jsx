import { useState } from 'react';
import { Search, FileText, Clock, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import apiService from '../services/apiService';

const STEPS = [
  { key: 'baru', label: 'Pengajuan Diterima' },
  { key: 'proses', label: 'Verifikasi Dokumen' },
  { key: 'selesai', label: 'Selesai - Siap Diambil' },
  { key: 'ditolak', label: 'Ditolak' },
];

const Status = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResult, setSearchResult] = useState(null);
  const [isSearching, setIsSearching] = useState(false);
  const [error, setError] = useState('');

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      toast.error('Masukkan nomor registrasi');
      return;
    }

    setIsSearching(true);
    setError('');

    try {
      const response = await apiService.checkStatus(searchQuery.trim());
      setSearchResult(response.data);
      toast.success('Data ditemukan!');
    } catch (error) {
      setSearchResult('not_found');
      setError(error.message);
      toast.error('Nomor registrasi tidak ditemukan');
    } finally {
      setIsSearching(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'selesai':
        return 'bg-green-100 text-green-800';
      case 'proses':
        return 'bg-blue-100 text-blue-800';
      case 'ditolak':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'selesai':
        return <CheckCircle className="h-5 w-5" />;
      case 'proses':
        return <Clock className="h-5 w-5" />;
      case 'ditolak':
        return <XCircle className="h-5 w-5" />;
      default:
        return <FileText className="h-5 w-5" />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Cek Status Permohonan</h1>
          <p className="text-lg text-gray-600">
            Cek status permohonan Anda dengan memasukkan nomor registrasi
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-sm border p-6 mb-8">
          <div className="flex gap-4">
            <div className="flex-1">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Masukkan nomor registrasi (contoh: REQ202501001)"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              />
            </div>
            <button
              onClick={handleSearch}
              disabled={isSearching || !searchQuery.trim()}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              <Search className="h-5 w-5" />
              {isSearching ? 'Mencari...' : 'Cari'}
            </button>
          </div>

          {error && (
            <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-3">
              <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0" />
              <p className="text-red-700 text-sm">{error}</p>
            </div>
          )}
        </div>

        {searchResult === 'not_found' && (
          <div className="bg-white rounded-lg shadow-sm border p-6 text-center">
            <XCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Permohonan Tidak Ditemukan</h3>
            <p className="text-gray-600">
              Nomor registrasi yang Anda masukkan tidak ditemukan. Pastikan nomor registrasi sudah benar atau hubungi kantor kelurahan.
            </p>
          </div>
        )}

        {searchResult && searchResult !== 'not_found' && (
          <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
            <div className="px-6 py-4 bg-gray-50 border-b">
              <h3 className="text-lg font-semibold text-gray-900">Detail Permohonan</h3>
              <p className="text-sm text-gray-600">Nomor Registrasi: {searchResult.nomor_registrasi}</p>
            </div>

            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Nama Pemohon</h4>
                  <p className="text-gray-600">{searchResult.nama}</p>
                </div>
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Jenis Layanan</h4>
                  <p className="text-gray-600">{searchResult.layanan.nama}</p>
                </div>
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Tanggal Pengajuan</h4>
                  <p className="text-gray-600">
                    {new Date(searchResult.created_at).toLocaleDateString('id-ID')}
                  </p>
                </div>
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Estimasi Selesai</h4>
                  <p className="text-gray-600">
                    {new Date(searchResult.estimasi_selesai).toLocaleDateString('id-ID')}
                  </p>
                </div>
              </div>

              <div className="mb-6">
                <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(searchResult.status)}`}>
                  {getStatusIcon(searchResult.status)}
                  {searchResult.status.charAt(0).toUpperCase() + searchResult.status.slice(1)}
                </div>
              </div>

              {searchResult.catatan && (
                <div className="mb-6 p-4 bg-blue-50 rounded-lg">
                  <h4 className="font-medium text-gray-900 mb-2">Catatan:</h4>
                  <p className="text-gray-700">{searchResult.catatan}</p>
                </div>
              )}

              {/* Progress Permohonan */}
              <div className="space-y-4">
                <h4 className="font-medium text-gray-900">Progress Permohonan</h4>
                {STEPS
                  // Jika status selesai, step "Ditolak" tidak ditampilkan
                  .filter(step => !(searchResult.status === 'selesai' && step.key === 'ditolak'))
                  .map((step, index) => {
                    const track = (searchResult.status_tracking || []).find(tr => tr.step === step.label);
                    const completed = !!track;
                    const isRed = searchResult.status === 'ditolak' && !completed;

                    return (
                      <div key={index} className="flex items-start gap-4">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0
                          ${completed ? 'bg-green-100 text-green-600'
                          : isRed ? 'bg-red-100 text-red-600'
                          : 'bg-gray-100 text-gray-400'}`}>
                          {completed ? (
                            <CheckCircle className="h-5 w-5" />
                          ) : (
                            <div className="w-2 h-2 bg-current rounded-full" />
                          )}
                        </div>
                        <div className="flex-1">
                          <h5 className={`font-medium
                            ${completed ? 'text-gray-900'
                            : isRed ? 'text-red-700'
                            : 'text-gray-500'}`}>
                            {step.label}
                          </h5>
                          <p className={`text-sm ${isRed ? 'text-red-600' : 'text-gray-500'}`}>
                            {completed && track.tanggal
                              ? new Date(track.tanggal).toLocaleString('id-ID')
                              : isRed
                                ? "Tahap dibatalkan karena permohonan ditolak"
                                : "Menunggu proses..."}
                          </p>
                          {completed && track.keterangan && (
                            <p className="text-xs mt-1 text-gray-600 italic">{track.keterangan}</p>
                          )}
                        </div>
                      </div>
                    );
                  })}
              </div>

              {searchResult.status === 'selesai' && (
                <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
                  <h4 className="font-medium text-green-900 mb-2">Dokumen Siap Diambil</h4>
                  <p className="text-green-800 text-sm mb-3">
                    Silakan datang ke kantor kelurahan untuk mengambil dokumen dengan membawa:
                  </p>
                  <ul className="text-green-800 text-sm space-y-1">
                    <li>• KTP asli</li>
                    <li>• Nomor registrasi: {searchResult.nomor_registrasi}</li>
                  </ul>
                </div>
              )}
            </div>
          </div>
        )}

        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="font-semibold text-blue-900 mb-3">Informasi Penting</h3>
          <ul className="text-blue-800 text-sm space-y-2">
            <li>• Simpan nomor registrasi dengan baik untuk tracking status</li>
            <li>• Estimasi waktu pemrosesan adalah 1-5 hari kerja tergantung jenis layanan</li>
            <li>• Untuk pertanyaan lebih lanjut, hubungi: (0542) 123456</li>
            <li>• Pengambilan dokumen dapat dilakukan pada jam kerja: Senin-Jumat 08:00-16:00</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default Status;
