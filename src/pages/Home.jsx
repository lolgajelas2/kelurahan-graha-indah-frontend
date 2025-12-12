import { Link } from 'react-router-dom';
import { FileText, Search, Users, Award, Clock, Shield, CheckCircle, ArrowRight } from 'lucide-react';

const Home = () => {
  const services = [
    {
      icon: FileText,
      title: 'Surat Keterangan',
      description: 'Surat keterangan domisili, tidak mampu, usaha, dll',
      link: '/layanan'
    },
    {
      icon: Users,
      title: 'Kependudukan',
      description: 'Layanan administrasi kependudukan',
      link: '/layanan'
    },
    {
      icon: Shield,
      title: 'Keamanan',
      description: 'Surat keterangan kepolisian, kehilangan, dll',
      link: '/layanan'
    },
    {
      icon: Award,
      title: 'Perizinan',
      description: 'Pengurusan izin usaha dan kegiatan',
      link: '/layanan'
    }
  ];

  const stats = [
    { number: '72', label: 'Rukun Tetangga' },
    { number: '19,254', label: 'Hektar Luas Wilayah' },
    { number: '2012', label: 'Tahun Pembentukan' },
    { number: '24/7', label: 'Layanan Online' }
  ];

  const features = [
    {
      icon: Clock,
      title: 'Pelayanan 24/7',
      description: 'Akses layanan kapan saja melalui sistem online'
    },
    {
      icon: CheckCircle,
      title: 'Proses Cepat',
      description: 'Pengurusan dokumen lebih efisien dan transparan'
    },
    {
      icon: Shield,
      title: 'Data Aman',
      description: 'Keamanan data pribadi terjamin dengan enkripsi'
    }
  ];

  return (
    <div className="min-h-screen">
      <section className="bg-gradient-to-r from-blue-600 to-blue-800 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              Selamat Datang di<br />
              <span className="text-yellow-300">Kelurahan Graha Indah</span>
            </h1>
            <p className="text-xl md:text-2xl mb-8 text-blue-100">
              Melayani dengan Hati, Inovatif, dan Terpercaya
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/layanan" className="btn-primary bg-white text-blue-600 hover:bg-gray-100 px-8 py-3 text-lg">
                Ajukan Permohonan
              </Link>
              <Link to="/status" className="btn-secondary bg-transparent border-2 border-white text-white hover:bg-white hover:text-blue-600 px-8 py-3 text-lg">
                Cek Status
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-gray-50 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-3xl md:text-4xl font-bold text-blue-600 mb-2">
                  {stat.number}
                </div>
                <div className="text-gray-600 font-medium">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Layanan Unggulan
            </h2>
            <p className="text-xl text-gray-600">
              Berbagai layanan administrasi yang dapat Anda akses secara online
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {services.map((service, index) => {
              const Icon = service.icon;
              return (
                <Link
                  key={index}
                  to={service.link}
                  className="card p-6 hover:shadow-lg transition-shadow duration-300 group"
                >
                  <div className="flex flex-col items-center text-center">
                    <div className="bg-blue-100 p-4 rounded-full mb-4 group-hover:bg-blue-200 transition-colors">
                      <Icon className="h-8 w-8 text-blue-600" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      {service.title}
                    </h3>
                    <p className="text-sm text-gray-600 mb-4">
                      {service.description}
                    </p>
                    <div className="flex items-center text-blue-600 text-sm font-medium">
                      Lihat Detail
                      <ArrowRight className="h-4 w-4 ml-1 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      <section className="bg-gray-50 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Mengapa Memilih Kami?
            </h2>
            <p className="text-xl text-gray-600">
              Komitmen kami untuk memberikan pelayanan terbaik
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <div key={index} className="text-center">
                  <div className="bg-blue-100 p-4 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                    <Icon className="h-8 w-8 text-blue-600" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-gray-600">
                    {feature.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section className="bg-blue-600 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Siap Memulai Permohonan?
          </h2>
          <p className="text-xl text-blue-100 mb-8">
            Proses permohonan dokumen Anda sekarang dengan mudah dan cepat
          </p>
          <Link
            to="/layanan"
            className="inline-flex items-center bg-white text-blue-600 hover:bg-gray-100 font-semibold py-3 px-8 rounded-lg transition-colors text-lg"
          >
            Mulai Sekarang
            <ArrowRight className="h-5 w-5 ml-2" />
          </Link>
        </div>
      </section>
    </div>
  );
};

export default Home;
