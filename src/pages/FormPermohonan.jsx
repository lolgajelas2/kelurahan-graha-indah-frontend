import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Upload, X, CheckCircle, AlertCircle, FileText, Image as ImageIcon } from 'lucide-react';
import toast from 'react-hot-toast';
import apiService from '../services/apiService';
import ValidationError from '../components/ValidationError';

const FormPermohonan = () => {
  const { serviceId } = useParams();
  const navigate = useNavigate();
  
  const [serviceData, setServiceData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [registrationNumber, setRegistrationNumber] = useState('');
  const [validationErrors, setValidationErrors] = useState({});

  const [formData, setFormData] = useState({
    nama: '',
    nik: '',
    tempat_lahir: '',
    tanggal_lahir: '',
    jenis_kelamin: '',
    alamat: '',
    rt: '',
    rw: '',
    no_hp: '',
    email: '',
    keperluan: '',
    keterangan: ''
  });

  const [files, setFiles] = useState({});

  useEffect(() => {
    fetchServiceData();
  }, [serviceId]);

  const fetchServiceData = async () => {
    setLoading(true);
    try {
      const response = await apiService.getLayananById(serviceId);
      // Parse persyaratan if it's a string
      const parsedData = {
        ...response.data,
        persyaratan: typeof response.data.persyaratan === 'string' 
          ? JSON.parse(response.data.persyaratan) 
          : response.data.persyaratan
      };
      setServiceData(parsedData);
    } catch (error) {
      setError('Layanan tidak ditemukan');
    } finally {
      setLoading(false);
    }
  };
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // Real-time validation
    let error = '';
    if (name === 'nama') {
      if (value && !/^[a-zA-Z\s]+$/.test(value)) {
        error = 'Nama hanya boleh berisi huruf dan spasi';
      }
    } else if (name === 'nik') {
      if (value && !/^\d{16}$/.test(value)) {
        error = 'NIK harus 16 digit angka';
      }
    } else if (name === 'tempat_lahir') {
      if (value && !/^[a-zA-Z\s]+$/.test(value)) {
        error = 'Tempat lahir hanya boleh berisi huruf dan spasi';
      }
    } else if (name === 'email') {
      if (value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
        error = 'Format email tidak valid';
      }
    } else if (name === 'no_hp') {
      if (value && !/^(\+62|62|0)[0-9]{9,13}$/.test(value)) {
        error = 'Nomor HP tidak valid (contoh: 081234567890)';
      }
    } else if (name === 'rt' || name === 'rw') {
      if (value && !/^\d{1,3}$/.test(value)) {
        error = 'Hanya boleh berisi angka, maksimal 3 digit';
      }
    } else if (name === 'tanggal_lahir') {
      if (value) {
        const birthDate = new Date(value);
        const today = new Date();
        
        if (birthDate > today) {
          error = 'Tanggal lahir tidak boleh di masa depan';
        } else {
          // Calculate age
          const age = Math.floor((today - birthDate) / (365.25 * 24 * 60 * 60 * 1000));
          if (age < 17) {
            error = 'Usia minimal 17 tahun untuk mengajukan permohonan';
          } else if (age > 150) {
            error = 'Tanggal lahir tidak valid';
          }
        }
      }
    }

    setValidationErrors(prev => ({
      ...prev,
      [name]: error
    }));
  };

  const handleFileChange = (fileType, file) => {
    // Validate file size (max 5MB)
    const maxSize = 5 * 1024 * 1024; // 5MB in bytes
    if (file.size > maxSize) {
      toast.error('Ukuran file maksimal 5MB');
      return;
    }

    // Validate file type
    const allowedTypes = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png'];
    if (!allowedTypes.includes(file.type)) {
      toast.error('Hanya file PDF, JPG, atau PNG yang diperbolehkan');
      return;
    }

    setFiles(prev => ({
      ...prev,
      [fileType]: file
    }));
  };

  const removeFile = (fileType) => {
    setFiles(prev => {
      const newFiles = { ...prev };
      delete newFiles[fileType];
      return newFiles;
    });
  };
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Check for validation errors
    const hasErrors = Object.values(validationErrors).some(error => error !== '');
    if (hasErrors) {
      toast.error('Mohon perbaiki data yang tidak valid');
      return;
    }

    setSubmitting(true);
    setError('');

    try {
      // Submit permohonan data
      const permohonanData = {
        ...formData,
        layanan_id: parseInt(serviceId)
      };

      const response = await apiService.createPermohonan(permohonanData);
      const permohonanId = response.data.permohonan.id;
      setRegistrationNumber(response.data.nomor_registrasi);

      // Upload files if any
      if (Object.keys(files).length > 0) {
        const uploadPromises = Object.entries(files).map(([fileType, file]) => {
          const formData = new FormData();
          formData.append('permohonan_id', permohonanId);
          formData.append('jenis_berkas', fileType);
          formData.append('file', file);
          return apiService.uploadBerkas(formData);
        });

        await Promise.all(uploadPromises);
      }

      setSubmitSuccess(true);
      toast.success('Permohonan berhasil diajukan! Nomor registrasi: ' + response.data.nomor_registrasi);
      
      // Redirect after 5 seconds
      setTimeout(() => {
        navigate('/status');
      }, 5000);

    } catch (error) {
      // Parse backend validation errors
      let errorMsg = error.message || 'Gagal mengajukan permohonan';
      
      // Handle validation errors from backend
      if (error.errors && typeof error.errors === 'object') {
        // Display first error from backend
        const firstError = Object.values(error.errors)[0];
        errorMsg = Array.isArray(firstError) ? firstError[0] : firstError;
      }
      
      // Handle rate limit errors
      if (errorMsg.includes('Terlalu banyak')) {
        toast.error(errorMsg, { duration: 5000 });
      } else {
        toast.error(errorMsg);
      }
      
      setError(errorMsg);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Memuat form permohonan...</p>
          </div>
        </div>
      </div>
    );
  }

  if (submitSuccess) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full text-center">
          <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Permohonan Berhasil!</h2>
          <p className="text-gray-600 mb-4">
            Permohonan {serviceData?.nama} Anda telah diterima.
          </p>
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
            <p className="text-sm text-blue-800 mb-1">Nomor Registrasi:</p>
            <p className="text-lg font-bold text-blue-900">{registrationNumber}</p>
          </div>
          <p className="text-sm text-gray-500 mb-4">
            Simpan nomor registrasi ini untuk melacak status permohonan Anda.
          </p>
          <p className="text-sm text-gray-500">
            Anda akan dialihkan ke halaman status...
          </p>
        </div>
      </div>
    );
  }

  if (!serviceData) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Layanan Tidak Ditemukan</h2>
            <p className="text-gray-600 mb-4">Layanan yang Anda cari tidak tersedia.</p>
            <button
              onClick={() => navigate('/layanan')}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
            >
              Kembali ke Layanan
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-6">
          <button
            onClick={() => navigate('/layanan')}
            className="flex items-center gap-2 text-blue-600 hover:text-blue-700"
          >
            <ArrowLeft className="h-5 w-5" />
            Kembali ke Layanan
          </button>
        </div>

        <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
          <div className="px-6 py-4 bg-gray-50 border-b">
            <h1 className="text-xl font-semibold text-gray-900">Form Permohonan</h1>
            <p className="text-sm text-gray-600 mt-1">{serviceData.nama}</p>
          </div>

          {error && (
            <div className="mx-6 mt-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-3">
              <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0" />
              <p className="text-red-700 text-sm">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            {/* Form fields - sama seperti sebelumnya tapi dengan handleInputChange yang sudah diupdate */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nama Lengkap *
                </label>
                <input
                  type="text"
                  name="nama"
                  value={formData.nama}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  NIK *
                </label>
                <input
                  type="text"
                  name="nik"
                  value={formData.nik}
                  onChange={handleInputChange}
                  maxLength="16"
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    validationErrors.nik ? 'border-red-500' : 'border-gray-300'
                  }`}
                  required
                />
                {validationErrors.nik && (
                  <p className="mt-1 text-sm text-red-600">{validationErrors.nik}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tempat Lahir *
                </label>
                <input
                  type="text"
                  name="tempat_lahir"
                  value={formData.tempat_lahir}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tanggal Lahir *
                </label>
                <input
                  type="date"
                  name="tanggal_lahir"
                  value={formData.tanggal_lahir}
                  onChange={handleInputChange}
                  max={new Date().toISOString().split('T')[0]}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    validationErrors.tanggal_lahir ? 'border-red-500' : 'border-gray-300'
                  }`}
                  required
                />
                {validationErrors.tanggal_lahir && (
                  <p className="mt-1 text-sm text-red-600">{validationErrors.tanggal_lahir}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Jenis Kelamin *
                </label>
                <select
                  name="jenis_kelamin"
                  value={formData.jenis_kelamin}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                >
                  <option value="">Pilih Jenis Kelamin</option>
                  <option value="Laki-laki">Laki-laki</option>
                  <option value="Perempuan">Perempuan</option>
                </select>
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Alamat Lengkap *
                </label>
                <textarea
                  name="alamat"
                  value={formData.alamat}
                  onChange={handleInputChange}
                  rows="3"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  RT *
                </label>
                <input
                  type="text"
                  name="rt"
                  value={formData.rt}
                  onChange={handleInputChange}
                  maxLength="3"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  RW *
                </label>
                <input
                  type="text"
                  name="rw"
                  value={formData.rw}
                  onChange={handleInputChange}
                  maxLength="3"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  No. HP *
                </label>
                <input
                  type="tel"
                  name="no_hp"
                  value={formData.no_hp}
                  onChange={handleInputChange}
                  placeholder="08xx atau +628xx"
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    validationErrors.no_hp ? 'border-red-500' : 'border-gray-300'
                  }`}
                  required
                />
                {validationErrors.no_hp && (
                  <p className="mt-1 text-sm text-red-600">{validationErrors.no_hp}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email *
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    validationErrors.email ? 'border-red-500' : 'border-gray-300'
                  }`}
                  required
                />
                {validationErrors.email && (
                  <p className="mt-1 text-sm text-red-600">{validationErrors.email}</p>
                )}
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Keperluan *
                </label>
                <textarea
                  name="keperluan"
                  value={formData.keperluan}
                  onChange={handleInputChange}
                  rows="3"
                  placeholder="Jelaskan keperluan permohonan ini..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Keterangan Tambahan
                </label>
                <textarea
                  name="keterangan"
                  value={formData.keterangan}
                  onChange={handleInputChange}
                  rows="2"
                  placeholder="Keterangan tambahan (opsional)..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* File Upload Section */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">Upload Berkas Persyaratan</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {serviceData.persyaratan.map((requirement, index) => {
                  const fileKey = `req_${index}`;
                  return (
                    <div key={index} className="border border-gray-300 rounded-lg p-4">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        {requirement}
                      </label>
                      {!files[fileKey] ? (
                        <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
                          <Upload className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                          <p className="text-sm text-gray-600 mb-2">Klik untuk upload file</p>
                          <input
                            type="file"
                            accept=".pdf,.jpg,.jpeg,.png"
                            onChange={(e) => {
                              const file = e.target.files[0];
                              if (file) handleFileChange(fileKey, file);
                            }}
                            className="hidden"
                            id={`file-${index}`}
                          />
                          <label
                            htmlFor={`file-${index}`}
                            className="cursor-pointer bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700"
                          >
                            Pilih File
                          </label>
                          <p className="text-xs text-gray-500 mt-1">PDF, JPG, PNG (max 5MB)</p>
                        </div>
                      ) : (
                        <div className="bg-gray-50 border rounded-lg p-3">
                          {/* File Preview */}
                          {files[fileKey].type.startsWith('image/') ? (
                            <div className="mb-2">
                              <img 
                                src={URL.createObjectURL(files[fileKey])} 
                                alt="Preview" 
                                className="w-full h-32 object-cover rounded"
                              />
                            </div>
                          ) : (
                            <div className="mb-2 flex items-center justify-center h-32 bg-gray-100 rounded">
                              <FileText className="h-12 w-12 text-gray-400" />
                            </div>
                          )}
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2 flex-1 min-w-0">
                              {files[fileKey].type.startsWith('image/') ? (
                                <ImageIcon className="h-4 w-4 text-gray-500 flex-shrink-0" />
                              ) : (
                                <FileText className="h-4 w-4 text-gray-500 flex-shrink-0" />
                              )}
                              <span className="text-sm text-gray-700 truncate">{files[fileKey].name}</span>
                            </div>
                            <button
                              type="button"
                              onClick={() => removeFile(fileKey)}
                              className="ml-2 text-red-500 hover:text-red-700 flex-shrink-0"
                            >
                              <X className="h-4 w-4" />
                            </button>
                          </div>
                          <p className="text-xs text-gray-500 mt-1">
                            {(files[fileKey].size / 1024).toFixed(2)} KB
                          </p>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Submit Button */}
            <div className="flex justify-end">
              <button
                type="submit"
                disabled={submitting}
                className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {submitting ? 'Memproses...' : 'Ajukan Permohonan'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default FormPermohonan;
