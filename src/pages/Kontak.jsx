import { useState } from 'react';
import { MapPin, Phone, Mail, Clock, Send, MessageSquare, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import apiService from '../services/apiService';
import ValidationError from '../components/ValidationError';

const Kontak = () => {
  const [formData, setFormData] = useState({
    nama: '',
    email: '',
    subjek: '',
    pesan: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [validationErrors, setValidationErrors] = useState({});

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
    } else if (name === 'email') {
      if (value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
        error = 'Format email tidak valid';
      }
    } else if (name === 'subjek') {
      if (value && value.length < 5) {
        error = 'Subjek minimal 5 karakter';
      } else if (value && value.length > 255) {
        error = 'Subjek maksimal 255 karakter';
      }
    } else if (name === 'pesan') {
      if (value && value.length < 10) {
        error = 'Pesan minimal 10 karakter';
      } else if (value && value.length > 2000) {
        error = 'Pesan maksimal 2000 karakter';
      }
    }

    setValidationErrors(prev => ({
      ...prev,
      [name]: error
    }));
  };
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Check for validation errors
    const hasErrors = Object.values(validationErrors).some(error => error !== '');
    if (hasErrors) {
      toast.error('Mohon perbaiki data yang tidak valid');
      return;
    }
    
    setIsSubmitting(true);

    try {
      await apiService.sendKontak(formData);
      setSubmitSuccess(true);
      setFormData({ nama: '', email: '', subjek: '', pesan: '' });
      setValidationErrors({});
      toast.success('Pesan berhasil dikirim! Kami akan segera menghubungi Anda.');

      setTimeout(() => {
        setSubmitSuccess(false);
      }, 5000);
    } catch (error) {
      // Parse backend validation errors
      let errorMsg = error.message || 'Gagal mengirim pesan';
      
      // Handle validation errors from backend
      if (error.errors && typeof error.errors === 'object') {
        const firstError = Object.values(error.errors)[0];
        errorMsg = Array.isArray(firstError) ? firstError[0] : firstError;
      }
      
      // Handle rate limit errors
      if (errorMsg.includes('Terlalu banyak')) {
        toast.error(errorMsg, { duration: 5000 });
      } else {
        toast.error(errorMsg);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Hubungi Kami
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Kami siap membantu Anda. Hubungi kami melalui berbagai saluran komunikasi 
            atau kunjungi langsung kantor kelurahan kami.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-1 space-y-6">
            <div className="card p-6">
              <div className="flex items-start">
                <MapPin className="h-6 w-6 text-blue-600 mt-1 mr-4" />
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    Alamat Kantor
                  </h3>
                  <p className="text-gray-600">
                    Jl. Graha Indah Raya No. 123<br />
                    Kelurahan Graha Indah<br />
                    Kecamatan Balikpapan Utara<br />
                    Kota Balikpapan, Kalimantan Timur<br />
                    76127
                  </p>
                </div>
              </div>
            </div>

            <div className="card p-6">
              <div className="flex items-start">
                <Phone className="h-6 w-6 text-blue-600 mt-1 mr-4" />
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    Telepon
                  </h3>
                  <p className="text-gray-600 mb-1">(0542) 123456</p>
                  <p className="text-gray-600">Fax: (0542) 123457</p>
                </div>
              </div>
            </div>

            <div className="card p-6">
              <div className="flex items-start">
                <Mail className="h-6 w-6 text-blue-600 mt-1 mr-4" />
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    Email
                  </h3>
                  <p className="text-gray-600 mb-1">grahaindah@balikpapan.go.id</p>
                  <p className="text-gray-600 text-sm">
                    Untuk pertanyaan umum dan informasi layanan
                  </p>
                </div>
              </div>
            </div>

            <div className="card p-6">
              <div className="flex items-start">
                <Clock className="h-6 w-6 text-blue-600 mt-1 mr-4" />
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    Jam Pelayanan
                  </h3>
                  <div className="space-y-1 text-gray-600">
                    <p>Senin - Kamis: 08:00 - 16:00 WIB</p>
                    <p>Jumat: 08:00 - 11:30 WIB</p>
                    <p className="text-red-600">Sabtu - Minggu: Tutup</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-2 space-y-8">
            <div className="card p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                Kirim Pesan
              </h2>

              {submitSuccess && (
                <div className="bg-green-50 border border-green-200 rounded-md p-4 mb-6">
                  <div className="flex">
                    <MessageSquare className="h-5 w-5 text-green-600 mr-3 mt-0.5" />
                    <div>
                      <h3 className="text-sm font-medium text-green-800">
                        Pesan Berhasil Dikirim!
                      </h3>
                      <p className="text-sm text-green-700 mt-1">
                        Terima kasih atas pesan Anda. Kami akan merespons dalam 1-2 hari kerja.
                      </p>
                    </div>
                  </div>
                </div>
              )}              <form onSubmit={handleSubmit} className="space-y-6">
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
                      className={`input-field ${
                        validationErrors.nama ? 'border-red-500' : ''
                      }`}
                      placeholder="Masukkan nama lengkap"
                      required
                    />
                    <ValidationError error={validationErrors.nama} />
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
                      className={`input-field ${
                        validationErrors.email ? 'border-red-500' : ''
                      }`}
                      placeholder="nama@email.com"
                      required
                    />
                    <ValidationError error={validationErrors.email} />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Subjek *
                  </label>
                  <input
                    type="text"
                    name="subjek"
                    value={formData.subjek}
                    onChange={handleInputChange}
                    className={`input-field ${
                      validationErrors.subjek ? 'border-red-500' : ''
                    }`}
                    placeholder="Topik pesan Anda (min. 5 karakter)"
                    required
                  />
                  <ValidationError error={validationErrors.subjek} />
                  <p className="mt-1 text-xs text-gray-500">
                    {formData.subjek.length}/255 karakter
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Pesan *
                  </label>
                  <textarea
                    name="pesan"
                    value={formData.pesan}
                    onChange={handleInputChange}
                    rows="5"
                    className={`input-field ${
                      validationErrors.pesan ? 'border-red-500' : ''
                    }`}
                    placeholder="Tulis pesan Anda di sini... (min. 10 karakter)"
                    required
                  />
                  <ValidationError error={validationErrors.pesan} />                  <p className="mt-1 text-xs text-gray-500">
                    {formData.pesan.length}/2000 karakter
                  </p>
                </div>

                <div className="flex justify-end">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                  >
                    <Send className="h-4 w-4 mr-2" />
                    {isSubmitting ? 'Mengirim...' : 'Kirim Pesan'}
                  </button>
                </div>
              </form>
            </div>

            <div className="card p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                Lokasi Kami
              </h2>
              <div className="aspect-w-16 aspect-h-9">
                <iframe
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3989.659920918799!2d116.83194!3d-1.2379396!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x2df14710964d9c91%3A0x98d1f2b0b1b58c2!2sBalikpapan%2C%20East%20Kalimantan!5e0!3m2!1sen!2sid!4v1642784123456!5m2!1sen!2sid"
                  width="100%"
                  height="300"
                  style={{ border: 0 }}
                  allowFullScreen=""
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  className="rounded-md"
                  title="Lokasi Kelurahan Graha Indah"
                />
              </div>
              <p className="text-sm text-gray-600 mt-4">
                Kantor Kelurahan Graha Indah terletak di Jl. Graha Indah Raya No. 123, 
                mudah diakses dengan transportasi umum maupun kendaraan pribadi.
              </p>
            </div>
          </div>
        </div>

        <div className="card p-6 mt-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            Pertanyaan yang Sering Diajukan
          </h2>
          <div className="space-y-4">
            <details className="group">
              <summary className="cursor-pointer font-medium text-gray-900 py-2">
                Bagaimana cara mengajukan permohonan surat online?
              </summary>
              <div className="text-gray-600 text-sm mt-2 pl-4">
                Anda dapat mengajukan permohonan melalui menu "Layanan Warga" di website ini. 
                Pilih jenis surat yang diperlukan, isi formulir, dan upload dokumen persyaratan.
              </div>
            </details>
            <details className="group">
              <summary className="cursor-pointer font-medium text-gray-900 py-2">
                Berapa lama proses pembuatan surat?
              </summary>
              <div className="text-gray-600 text-sm mt-2 pl-4">
                Waktu pemrosesan bervariasi tergantung jenis surat, umumnya 1-5 hari kerja. 
                Anda dapat memantau status melalui menu "Status Permohonan".
              </div>
            </details>
            <details className="group">
              <summary className="cursor-pointer font-medium text-gray-900 py-2">
                Apakah ada biaya untuk pembuatan surat?
              </summary>
              <div className="text-gray-600 text-sm mt-2 pl-4">
                Sebagian besar layanan surat keterangan tidak dikenakan biaya (gratis). 
                Namun untuk beberapa jenis layanan tertentu mungkin dikenakan tarif sesuai peraturan.
              </div>
            </details>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Kontak;
