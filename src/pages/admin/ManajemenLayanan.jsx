import { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Search } from 'lucide-react';
import toast from 'react-hot-toast';
import apiService from '../../services/apiService'; // Sesuaikan path ke apiService.js

const ManajemenLayanan = () => {
  // Awalnya data statis, ganti jadi kosong, data ambil dari API
  const [services, setServices] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingService, setEditingService] = useState(null);
  // Form state untuk kontrol input di modal (jika ingin kelola input controlled)
  const [formValues, setFormValues] = useState({
    nama: '',
    kategori: '',
    waktu_proses: '',
    biaya: '',
    status: 'aktif',
    deskripsi: '',
    persyaratan: ''
  });

  // Ambil layanan dari API saat komponen pertama kali render
  useEffect(() => {
    apiService.getLayanan()
      .then(res => {
        if (res.success) {
          // Parse persyaratan if it's a string
          const parsedServices = res.data.map(service => ({
            ...service,
            persyaratan: typeof service.persyaratan === 'string' 
              ? JSON.parse(service.persyaratan) 
              : service.persyaratan
          }));
          setServices(parsedServices);
        }
      })
      .catch(err => console.error('Error ambil layanan:', err));
  }, []);

  // Filter layanan sesuai kata kunci pencarian sama seperti sebelumnya
  const filteredServices = services.filter(service =>
    service.nama.toLowerCase().includes(searchTerm.toLowerCase()) ||
    service.kategori.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Saat klik tambah, reset form dan buka modal
  const handleTambah = () => {
    setEditingService(null);
    setFormValues({
      nama: '',
      kategori: '',
      waktu_proses: '',
      biaya: '',
      status: 'aktif',
      deskripsi: '',
      persyaratan: ''
    });
    setShowModal(true);
  };

  // Saat klik edit, isi form dengan data layanan yang dipilih
  const handleEdit = (service) => {
    setEditingService(service);
    setFormValues({
      nama: service.nama || '',
      kategori: service.kategori || '',
      waktu_proses: service.waktu_proses || '',
      biaya: service.biaya || '',
      status: service.status || 'aktif',
      deskripsi: service.deskripsi || '',
      persyaratan: (service.persyaratan || []).join('\n') // tampilkan persyaratan sebagai multiline string
    });
    setShowModal(true);
  };

  // Handle perubahan input form controlled
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormValues(prev => ({ ...prev, [name]: value }));
  };

  // Simpan data ke backend (tambah atau update)
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Persiapkan data kirim ke API, persyaratan masuk array dipisah baris baru
    const dataToSend = {
      ...formValues,
      persyaratan: formValues.persyaratan.split('\n').map(s => s.trim()).filter(Boolean),
    };

    try {
      let result;
      if (editingService) {
        result = await apiService.updateLayanan(editingService.id, dataToSend);
      } else {
        result = await apiService.createLayanan(dataToSend);
      }
      if (result.success) {
        // Parse persyaratan jika masih berupa string
        const parsedData = {
          ...result.data,
          persyaratan: typeof result.data.persyaratan === 'string'
            ? JSON.parse(result.data.persyaratan)
            : result.data.persyaratan
        };
        
        // Update state layanan lokal sesuai hasil API
        if (editingService) {
          setServices(services.map(s => (s.id === editingService.id ? parsedData : s)));
          toast.success('Layanan berhasil diperbarui');
        } else {
          setServices([...services, parsedData]);
          toast.success('Layanan berhasil ditambahkan');
        }
        setShowModal(false);
      } else {
        toast.error('Gagal menyimpan layanan');
      }
    } catch (error) {
      toast.error('Terjadi kesalahan: ' + (error.message || error));
    }
  };

  // Hapus layanan dengan API
  const handleDelete = (id) => {
    const service = services.find(s => s.id === id);
    if (!service) return;
    
    if (window.confirm(`Apakah Anda yakin ingin menghapus layanan "${service.nama}"?\n\nTindakan ini tidak dapat dibatalkan.`)) {
      apiService.deleteLayanan(id)
        .then(res => {
          if (res.success) {
            setServices(services.filter(s => s.id !== id));
            toast.success('Layanan berhasil dihapus');
          } else {
            toast.error('Gagal menghapus layanan');
          }
        })
        .catch(() => toast.error('Terjadi kesalahan saat menghapus layanan'));
    }
  };

  // JSX layout tidak diubah dari kode awal
  return (
    <div className="min-h-screen bg-gray-50 py-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Manajemen Layanan
          </h1>
          <p className="text-gray-600">
            Kelola jenis layanan yang tersedia untuk warga
          </p>
        </div>

        <div className="card p-6 mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
            <div className="flex-1 max-w-lg">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Cari layanan..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="input-field pl-10"
                />
              </div>
            </div>
            <button
              onClick={handleTambah}
              className="btn-primary flex items-center"
            >
              <Plus className="h-4 w-4 mr-2" />
              Tambah Layanan
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredServices.map((service) => (
            <div key={service.id} className="card p-6">
              <div className="flex justify-between items-start mb-4">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    {service.nama}
                  </h3>
                  <span className="inline-block px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full mb-2">
                    {service.kategori}
                  </span>
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => handleEdit(service)}
                    className="p-2 text-blue-600 hover:text-blue-800"
                    aria-label="Edit layanan"
                  >
                    <Edit2 className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(service.id)}
                    className="p-2 text-red-600 hover:text-red-800"
                    aria-label="Hapus layanan"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>

              <div className="space-y-2 text-sm text-gray-600 mb-4">
                <div className="flex justify-between">
                  <span>Waktu Proses:</span>
                  <span className="font-medium">{service.waktu_proses}</span>
                </div>
                <div className="flex justify-between">
                  <span>Biaya:</span>
                  <span className="font-medium text-green-600">{service.biaya}</span>
                </div>
                <div className="flex justify-between">
                  <span>Status:</span>
                  <span className={`font-medium capitalize ${
                    service.status === 'aktif' ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {service.status}
                  </span>
                </div>
              </div>

              <div className="border-t border-gray-200 pt-4">
                <h4 className="font-medium text-gray-900 mb-2">Persyaratan:</h4>
                <ul className="text-sm text-gray-600 space-y-1">
                  {service.persyaratan?.map((req, index) => (
                    <li key={index} className="flex items-start">
                      <span className="text-blue-600 mr-2">•</span>
                      {req}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>

        {/* Modal Tambah/Edit */}
        {showModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              <h2 className="text-xl font-bold text-gray-900 mb-6">
                {editingService ? 'Edit Layanan' : 'Tambah Layanan'}
              </h2>

              <form className="space-y-6" onSubmit={handleSubmit}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Nama Layanan
                    </label>
                    <input
                      type="text"
                      name="nama"
                      className="input-field"
                      value={formValues.nama}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Kategori
                    </label>
                    <select
                      name="kategori"
                      className="input-field"
                      value={formValues.kategori}
                      onChange={handleInputChange}
                      required
                    >
                      <option value="">Pilih Kategori</option>
                      <option value="surat">Surat</option>
                      <option value="kependudukan">Kependudukan</option>
                      <option value="keamanan">Keamanan</option>
                      <option value="perizinan">Perizinan</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Waktu Proses
                    </label>
                    <input
                      type="text"
                      name="waktu_proses"
                      className="input-field"
                      placeholder="1-2 hari kerja"
                      value={formValues.waktu_proses}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Biaya
                    </label>
                    <input
                      type="text"
                      name="biaya"
                      className="input-field"
                      placeholder="Gratis"
                      value={formValues.biaya}
                      onChange={handleInputChange}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Status
                    </label>
                    <select
                      name="status"
                      className="input-field"
                      value={formValues.status}
                      onChange={handleInputChange}
                      required
                    >
                      <option value="aktif">Aktif</option>
                      <option value="nonaktif">Nonaktif</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Deskripsi
                  </label>
                  <textarea
                    rows="3"
                    name="deskripsi"
                    className="input-field"
                    placeholder="Deskripsi layanan..."
                    value={formValues.deskripsi}
                    onChange={handleInputChange}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Persyaratan (satu per baris)
                  </label>
                  <textarea
                    rows="5"
                    name="persyaratan"
                    className="input-field"
                    placeholder="KTP asli&#10;KK asli&#10;Surat pengantar RT/RW"
                    value={formValues.persyaratan}
                    onChange={handleInputChange}
                  />
                </div>

                <div className="flex justify-end space-x-4">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="btn-secondary"
                  >
                    Batal
                  </button>
                  <button type="submit" className="btn-primary">
                    {editingService ? 'Update' : 'Simpan'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ManajemenLayanan;
