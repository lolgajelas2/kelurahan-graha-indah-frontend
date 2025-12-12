import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FileText, Users, Shield, Award, Clock, ArrowRight, CheckCircle, AlertCircle } from 'lucide-react';
import apiService from '../services/apiService';

const Layanan = () => {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const serviceCategories = [
    { id: 'all', name: 'Semua Layanan', icon: FileText },
    { id: 'surat', name: 'Surat Keterangan', icon: FileText },
    { id: 'kependudukan', name: 'Kependudukan', icon: Users },
    { id: 'keamanan', name: 'Keamanan', icon: Shield },
    { id: 'perizinan', name: 'Perizinan', icon: Award }
  ];

  useEffect(() => {
    fetchServices();
  }, [selectedCategory]);

  const fetchServices = async () => {
    setLoading(true);
    setError('');
    
    try {
      const params = selectedCategory !== 'all' ? { kategori: selectedCategory } : {};
      const response = await apiService.getLayanan(params);
      
      // Parse persyaratan if it's a string
      const parsedServices = response.data.map(service => ({
        ...service,
        persyaratan: typeof service.persyaratan === 'string' 
          ? JSON.parse(service.persyaratan) 
          : service.persyaratan
      }));
      
      setServices(parsedServices);
    } catch (error) {
      setError('Gagal memuat data layanan');
      console.error('Error fetching services:', error);
    } finally {
      setLoading(false);
    }
  };

  const getCategoryIcon = (category) => {
    const categoryMap = {
      surat: FileText,
      kependudukan: Users,
      keamanan: Shield,
      perizinan: Award
    };
    const IconComponent = categoryMap[category] || FileText;
    return <IconComponent className="h-5 w-5" />;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Memuat layanan...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Layanan Kelurahan</h1>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            Berbagai layanan administrasi kelurahan yang dapat Anda ajukan secara online dengan proses yang mudah dan transparan
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-3">
            <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0" />
            <p className="text-red-700 text-sm">{error}</p>
          </div>
        )}

        {/* Category Filter */}
        <div className="mb-8">
          <div className="flex flex-wrap gap-2 justify-center">
            {serviceCategories.map((category) => {
              const IconComponent = category.icon;
              return (
                <button
                  key={category.id}
                  onClick={() => setSelectedCategory(category.id)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-full border transition-colors ${
                    selectedCategory === category.id
                      ? 'bg-blue-600 text-white border-blue-600'
                      : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  <IconComponent className="h-4 w-4" />
                  {category.name}
                </button>
              );
            })}
          </div>
        </div>

        {/* Services Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-12">
          {services.map((service) => (
            <div key={service.id} className="bg-white rounded-lg shadow-sm border hover:shadow-md transition-shadow">
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      {getCategoryIcon(service.kategori)}
                      <span className="text-sm font-medium text-blue-600 capitalize">
                        {service.kategori}
                      </span>
                    </div>
                    <h3 className="font-semibold text-gray-900 mb-2">{service.nama}</h3>
                    <p className="text-sm text-gray-600 mb-4 line-clamp-3">{service.deskripsi}</p>
                  </div>
                </div>

                <div className="space-y-3 mb-4">
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-gray-400" />
                    <span className="text-sm text-gray-600">{service.waktu_proses}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span className="text-sm text-gray-600">{service.biaya}</span>
                  </div>
                </div>

                <div className="mb-4">
                  <h4 className="text-sm font-medium text-gray-900 mb-2">Persyaratan:</h4>
                  <ul className="text-xs text-gray-600 space-y-1">
                    {service.persyaratan.slice(0, 3).map((req, index) => (
                      <li key={index} className="flex items-start gap-1">
                        <span className="text-blue-500 mt-1">•</span>
                        <span>{req}</span>
                      </li>
                    ))}
                    {service.persyaratan.length > 3 && (
                      <li className="text-blue-600 text-xs">+{service.persyaratan.length - 3} lainnya</li>
                    )}
                  </ul>
                </div>

                <Link
                  to={`/permohonan/${service.id}`}
                  className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2 text-sm font-medium"
                >
                  Ajukan Permohonan
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </div>
          ))}
        </div>

        {services.length === 0 && !loading && (
          <div className="text-center py-12">
            <FileText className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Tidak ada layanan</h3>
            <p className="text-gray-600">Belum ada layanan untuk kategori yang dipilih.</p>
          </div>
        )}

        {/* Contact Info */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 text-center">
          <h3 className="font-semibold text-blue-900 mb-3">Butuh Bantuan?</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div>
              <h4 className="font-medium text-blue-900">Jam Pelayanan</h4>
              <p className="text-blue-800">Senin - Jumat: 08:00 - 16:00 WIB</p>
              <p className="text-blue-800">Sabtu - Minggu: Tutup</p>
            </div>
            <div>
              <h4 className="font-medium text-blue-900">Telepon</h4>
              <p className="text-blue-800">(0542) 123456</p>
            </div>
            <div>
              <h4 className="font-medium text-blue-900">Email</h4>
              <p className="text-blue-800">grahaindah@balikpapan.go.id</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Layanan;
