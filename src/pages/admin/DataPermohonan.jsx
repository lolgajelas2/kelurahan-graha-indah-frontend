import { useState, useEffect } from 'react';
import { Search, Eye, Download, MoreVertical, CheckCircle, Clock, XCircle, X, FileText } from 'lucide-react';
import toast from 'react-hot-toast';
import ApiService from '../../services/apiService';
import { apiConfig } from '../../config/api';
import Pagination from '../../components/Pagination';

const DataPermohonan = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [layananFilter, setLayananFilter] = useState('all');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [layananList, setLayananList] = useState([]);
  const [permohonanData, setPermohonanData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedIds, setSelectedIds] = useState([]);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [perPage, setPerPage] = useState(15);

  // Modal states
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showActionModal, setShowActionModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [detailData, setDetailData] = useState(null);
  const [loadingDetail, setLoadingDetail] = useState(false);

  // Action modal states
  const [newStatus, setNewStatus] = useState('');
  const [catatan, setCatatan] = useState('');
  const [updating, setUpdating] = useState(false);
  const handleViewFile = async (berkasId, namaFile) => {
    try {
      const token = localStorage.getItem('auth_token');
      
      // Remove /api from baseURL since it's already included
      const baseUrl = apiConfig.baseURL.replace('/api', '');
      
      const response = await fetch(
        `${baseUrl}/api/berkas/download/${berkasId}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error('Gagal mengunduh file');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.target = '_blank';
      a.rel = 'noopener noreferrer';
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      toast.success('File berhasil dibuka');
    } catch (error) {
      toast.error('Gagal membuka file');
      console.error('Error downloading file:', error);
    }
  };

  const fetchPermohonan = async (page = 1) => {
    setLoading(true);
    setError(null);
    try {
      const res = await ApiService.getPermohonan({ page, per_page: perPage });
      
      // Handle paginated response
      if (res?.data?.data) {
        setPermohonanData(res.data.data);
        setCurrentPage(res.data.current_page || 1);
        setLastPage(res.data.last_page || 1);
        setTotal(res.data.total || 0);
      } else {
        // Fallback for non-paginated response
        const dataArray = res?.data ?? res ?? [];
        setPermohonanData(dataArray);
      }
    } catch (err) {
      setError(err.message || 'Gagal memuat data permohonan');
    } finally {
      setLoading(false);
    }
  };

  const fetchLayanan = async () => {
    try {
      const res = await ApiService.getLayanan();
      const dataArray = res?.data?.data ?? res?.data ?? res ?? [];
      setLayananList(dataArray);
    } catch (err) {
      console.error('Gagal memuat layanan:', err);
    }
  };

  useEffect(() => {
    fetchPermohonan();
    fetchLayanan();
  }, []);

  const getStatusColor = (status) => {
    switch (status) {
      case 'selesai': return 'bg-green-100 text-green-800';
      case 'proses': return 'bg-blue-100 text-blue-800';
      case 'baru': return 'bg-yellow-100 text-yellow-800';
      case 'ditolak': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'selesai': return <CheckCircle className="h-4 w-4" />;
      case 'proses': return <Clock className="h-4 w-4" />;
      case 'ditolak': return <XCircle className="h-4 w-4" />;
      default: return <Clock className="h-4 w-4" />;
    }
  };

  // Handle view detail
  const handleViewDetail = async (item) => {
    setSelectedItem(item);
    setShowDetailModal(true);
    setLoadingDetail(true);
    try {
      const detail = await ApiService.getPermohonanDetail(item.id);
      setDetailData(detail);
    } catch (err) {
      toast.error('Gagal memuat detail: ' + err.message);
    } finally {
      setLoadingDetail(false);
    }
  };

  // Handle action modal
  const handleOpenActionModal = (item) => {
    setSelectedItem(item);
    setNewStatus(item.status);
    setCatatan('');
    setShowActionModal(true);
  };

  // Bulk actions handlers
  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedIds(filteredData.map(item => item.id));
    } else {
      setSelectedIds([]);
    }
  };

  const handleSelectOne = (id) => {
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter(itemId => itemId !== id));
    } else {
      setSelectedIds([...selectedIds, id]);
    }
  };

  const handleBulkUpdateStatus = async (status) => {
    if (selectedIds.length === 0) {
      toast.error('Pilih minimal 1 permohonan');
      return;
    }

    if (!window.confirm(`Update ${selectedIds.length} permohonan ke status "${status}"?`)) return;

    try {
      await ApiService.bulkUpdatePermohonanStatus(selectedIds, status, 'Bulk update');
      toast.success(`Berhasil update ${selectedIds.length} permohonan`);
      setSelectedIds([]);
      fetchPermohonan();
    } catch (err) {
      toast.error('Gagal update: ' + err.message);
    }
  };

  const handleBulkDelete = async () => {
    if (selectedIds.length === 0) {
      toast.error('Pilih minimal 1 permohonan');
      return;
    }

    if (!window.confirm(`Hapus ${selectedIds.length} permohonan? Data tidak bisa dikembalikan.`)) return;

    try {
      await ApiService.bulkDeletePermohonan(selectedIds);
      toast.success(`Berhasil menghapus ${selectedIds.length} permohonan`);
      setSelectedIds([]);
      fetchPermohonan();
    } catch (err) {
      toast.error('Gagal menghapus: ' + err.message);
    }
  };

  const handleDeleteSingle = async () => {
    if (!selectedItem) return;

    if (!window.confirm(`Hapus permohonan ${selectedItem.nomor_registrasi}? Data tidak bisa dikembalikan.`)) return;

    try {
      await ApiService.bulkDeletePermohonan([selectedItem.id]);
      toast.success('Permohonan berhasil dihapus');
      setShowActionModal(false);
      setSelectedItem(null);
      fetchPermohonan();
    } catch (err) {
      toast.error('Gagal menghapus: ' + err.message);
    }
  };

  const handleUpdateStatus = async () => {
    if (!selectedItem) return;
    
    setUpdating(true);
    try {
      await ApiService.updateStatus(selectedItem.id, {
        status: newStatus,
        catatan
      });
      
      await fetchPermohonan();
      setShowActionModal(false);
      toast.success('Status berhasil diperbarui!');
    } catch (err) {
      toast.error(err.message || 'Gagal mengupdate status');
    } finally {
      setUpdating(false);
    }
  };

  const filteredData = permohonanData.filter(item => {
    const matchesSearch = (item.nama || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                        (item.id || '').toString().toLowerCase().includes(searchTerm.toLowerCase()) ||
                        (item.nik || '').includes(searchTerm);
    const matchesStatus = statusFilter === 'all' || item.status === statusFilter;
    const matchesLayanan = layananFilter === 'all' || item.layanan?.nama === layananFilter;
    
    // Date filter
    let matchesDate = true;
    if (dateFrom || dateTo) {
      const itemDate = new Date(item.created_at);
      if (dateFrom && new Date(dateFrom) > itemDate) matchesDate = false;
      if (dateTo && new Date(dateTo + 'T23:59:59') < itemDate) matchesDate = false;
    }

    return matchesSearch && matchesStatus && matchesLayanan && matchesDate;
  });  return (
    <div className="min-h-screen bg-gray-50 py-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Data Permohonan
          </h1>
          <p className="text-gray-600">
            Kelola semua permohonan yang masuk dari warga
          </p>
        </div>

        {/* Filters */}
        <div className="card p-6 mb-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div className="flex flex-col gap-4 flex-1">
              <div className="relative w-full">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Cari nama, NIK, atau nomor registrasi..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="input-field pl-10 w-full"
                />
              </div>

              <div className="flex flex-col sm:flex-row gap-4">
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="input-field min-w-32"
                >
                  <option value="all">Semua Status</option>
                  <option value="baru">Baru</option>
                  <option value="proses">Proses</option>
                  <option value="selesai">Selesai</option>
                  <option value="ditolak">Ditolak</option>
                </select>

                <select
                  value={layananFilter}
                  onChange={(e) => setLayananFilter(e.target.value)}
                  className="input-field min-w-48"
                >
                  <option value="all">Semua Layanan</option>
                  {layananList.map((layanan) => (
                    <option key={layanan.id} value={layanan.nama}>
                      {layanan.nama}
                    </option>
                  ))}
                </select>

                <input
                  type="date"
                  value={dateFrom}
                  onChange={(e) => setDateFrom(e.target.value)}
                  placeholder="Dari tanggal"
                  className="input-field"
                />

                <input
                  type="date"
                  value={dateTo}
                  onChange={(e) => setDateTo(e.target.value)}
                  placeholder="Sampai tanggal"
                  className="input-field"
                />
              </div>
            </div>

            <button className="btn-primary flex items-center h-fit">
              <Download className="h-4 w-4 mr-2" />
              Export Data
            </button>
          </div>

          {/* Bulk Actions */}
          {selectedIds.length > 0 && (
            <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-center justify-between flex-wrap gap-3">
                <span className="text-sm font-medium text-blue-900">
                  {selectedIds.length} item dipilih
                </span>
                <div className="flex gap-2 flex-wrap">
                  <button
                    onClick={() => handleBulkUpdateStatus('proses')}
                    className="px-3 py-1.5 text-sm bg-yellow-600 text-white rounded hover:bg-yellow-700"
                  >
                    Set Proses
                  </button>
                  <button
                    onClick={() => handleBulkUpdateStatus('selesai')}
                    className="px-3 py-1.5 text-sm bg-green-600 text-white rounded hover:bg-green-700"
                  >
                    Set Selesai
                  </button>
                  <button
                    onClick={() => handleBulkUpdateStatus('ditolak')}
                    className="px-3 py-1.5 text-sm bg-red-600 text-white rounded hover:bg-red-700"
                  >
                    Set Ditolak
                  </button>
                  <button
                    onClick={handleBulkDelete}
                    className="px-3 py-1.5 text-sm bg-gray-700 text-white rounded hover:bg-gray-800"
                  >
                    Hapus ({selectedIds.length})
                  </button>
                  <button
                    onClick={() => setSelectedIds([])}
                    className="px-3 py-1.5 text-sm border border-gray-300 bg-white rounded hover:bg-gray-50"
                  >
                    Batal
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Error / Loading */}
        {error && (
          <div className="card p-4 mb-4 text-red-700 bg-red-50">
            {error}
          </div>
        )}
        {loading && (
          <div className="card p-4 mb-4 text-gray-700">
            Memuat data...
          </div>
        )}

        {/* Data Table */}
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left">
                    <input
                      type="checkbox"
                      onChange={handleSelectAll}
                      checked={selectedIds.length === filteredData.length && filteredData.length > 0}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Registrasi
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Pemohon
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Layanan
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Tanggal
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Aksi
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredData.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <input
                        type="checkbox"
                        checked={selectedIds.includes(item.id)}
                        onChange={() => handleSelectOne(item.id)}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {item.nomor_registrasi}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {item.nama}
                        </div>
                        <div className="text-sm text-gray-500">
                          NIK: {item.nik}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900">
                        {item.layanan?.nama || '-'}
                      </div>
                      <div className="text-sm text-gray-500">
                        {item.keperluan}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {item.created_at ? new Date(item.created_at).toLocaleDateString('id-ID') : '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(item.status)}`}>
                        {getStatusIcon(item.status)}
                        <span className="ml-1 capitalize">{item.status}</span>
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center space-x-2">
                        <button 
                          className="text-blue-600 hover:text-blue-900"
                          onClick={() => handleViewDetail(item)}
                          title="Lihat Detail"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                        <button 
                          className="text-gray-600 hover:text-gray-900"
                          onClick={() => handleOpenActionModal(item)}
                          title="Aksi"
                        >
                          <MoreVertical className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {!loading && filteredData.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-6 py-4 text-center text-sm text-gray-500">
                      Tidak ada data.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <Pagination
            currentPage={currentPage}
            lastPage={lastPage}
            total={total}
            perPage={perPage}
            onPageChange={(page) => fetchPermohonan(page)}
          />
        </div>

        {/* Modal Detail */}
        {showDetailModal && (
          <div className="fixed inset-0  flex items-center justify-center z-50 p-4"
          style={{ backgroundColor: 'rgba(0, 0, 0, 0.15)' }}>
            <div className="bg-white rounded-lg w-full max-w-3xl max-h-[90vh] overflow-y-auto">
              <div className="sticky top-0 bg-white border-b px-6 py-4 flex justify-between items-center">
                <h3 className="text-lg font-bold">Detail Permohonan</h3>
                <button onClick={() => setShowDetailModal(false)} className="text-gray-400 hover:text-gray-600">
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="p-6 space-y-6">
                {loadingDetail ? (
                  <p className="text-center text-gray-500">Memuat data...</p>
                ) : detailData ? (
                  <>
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-3">Data Pemohon</h4>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="text-gray-500">Nomor Registrasi:</span>
                          <p className="font-medium">{detailData.nomor_registrasi}</p>
                        </div>
                        <div>
                          <span className="text-gray-500">Status:</span>
                          <p className="font-medium capitalize">{detailData.status}</p>
                        </div>
                        <div>
                          <span className="text-gray-500">Nama Lengkap:</span>
                          <p className="font-medium">{detailData.nama}</p>
                        </div>
                        <div>
                          <span className="text-gray-500">NIK:</span>
                          <p className="font-medium">{detailData.nik}</p>
                        </div>
                        <div>
                          <span className="text-gray-500">Tempat, Tanggal Lahir:</span>
                          <p className="font-medium">
                            {detailData.tempat_lahir}, {new Date(detailData.tanggal_lahir).toLocaleDateString('id-ID', { 
                              day: 'numeric', 
                              month: 'long', 
                              year: 'numeric' 
                            })}
                          </p>
                        </div>
                        <div>
                          <span className="text-gray-500">No. HP:</span>
                          <p className="font-medium">{detailData.no_hp}</p>
                        </div>
                        <div className="col-span-2">
                          <span className="text-gray-500">Alamat:</span>
                          <p className="font-medium">{detailData.alamat}</p>
                        </div>
                        <div className="col-span-2">
                          <span className="text-gray-500">Keperluan:</span>
                          <p className="font-medium">{detailData.keperluan}</p>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h4 className="font-semibold text-gray-900 mb-3">Berkas Pendukung</h4>
                      {detailData.berkas && detailData.berkas.length > 0 ? (
                        <div className="space-y-2">
                          {detailData.berkas.map((berkas, idx) => (
                            <div key={idx} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                              <div className="flex items-center space-x-3">
                                <FileText className="h-5 w-5 text-blue-600" />
                                <span className="text-sm font-medium">{berkas.nama_file}</span>
                              </div>
                              <button
                                onClick={() => handleViewFile(berkas.id, berkas.nama_file)}
                                className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                              >
                                Lihat File
                              </button>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-sm text-gray-500">Tidak ada berkas.</p>
                      )}
                    </div>
                  </>
                ) : (
                  <p className="text-center text-red-500">Gagal memuat detail</p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Modal Aksi */}
        {showActionModal && (
          <div className="fixed inset-0 flex items-center justify-center z-50 p-4"
          style={{ backgroundColor: 'rgba(0, 0, 0, 0.15)' }}>
            <div className="bg-white rounded-lg w-full max-w-md">
              <div className="px-6 py-4 border-b flex justify-between items-center">
                <h3 className="text-lg font-bold">Update Status</h3>
                <button onClick={() => setShowActionModal(false)} className="text-gray-400 hover:text-gray-600">
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nomor Registrasi
                  </label>
                  <input
                    type="text"
                    value={selectedItem?.nomor_registrasi || '-'}
                    disabled
                    className="input-field bg-gray-100"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Status
                  </label>
                  <select
                    value={newStatus}
                    onChange={(e) => setNewStatus(e.target.value)}
                    className="input-field"
                  >
                    <option value="baru">Baru</option>
                    <option value="proses">Proses</option>
                    <option value="selesai">Selesai</option>
                    <option value="ditolak">Ditolak</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Catatan
                  </label>
                  <textarea
                    value={catatan}
                    onChange={(e) => setCatatan(e.target.value)}
                    rows={3}
                    className="input-field"
                    placeholder="Catatan tambahan (opsional)"
                  />
                </div>

                <div className="flex gap-2 pt-4">
                  <button
                    onClick={() => setShowActionModal(false)}
                    className="btn-secondary"
                    disabled={updating}
                  >
                    Batal
                  </button>
                  <button
                    onClick={handleDeleteSingle}
                    className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50"
                    disabled={updating}
                  >
                    Hapus
                  </button>
                  <button
                    onClick={handleUpdateStatus}
                    className="btn-primary flex-1"
                    disabled={updating}
                  >
                    {updating ? 'Menyimpan...' : 'Simpan'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DataPermohonan;
