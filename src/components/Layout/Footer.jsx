import React from 'react';
import { MapPin, Phone, Mail, Clock, Facebook, Twitter, Instagram } from 'lucide-react';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* About */}
          <div className="lg:col-span-2">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">GI</span>
              </div>
              <div>
                <div className="text-xl font-bold">Kelurahan Graha Indah</div>
                <div className="text-gray-400">Kota Balikpapan</div>
              </div>
            </div>
            <p className="text-gray-400 mb-4 max-w-md">
              Melayani masyarakat dengan profesional, inovatif, dan terpercaya. 
              Komitmen kami adalah memberikan pelayanan administrasi terbaik untuk seluruh warga.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                <Facebook className="h-6 w-6" />
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                <Twitter className="h-6 w-6" />
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                <Instagram className="h-6 w-6" />
              </a>
            </div>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Kontak Kami</h3>
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <MapPin className="h-5 w-5 text-blue-400 mt-0.5 flex-shrink-0" />
                <div className="text-gray-400">
                  <p>Jl. Graha Indah Raya No. 123</p>
                  <p>Kelurahan Graha Indah</p>
                  <p>Kecamatan Balikpapan Utara</p>
                  <p>Kota Balikpapan, Kalimantan Timur 76127</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Phone className="h-5 w-5 text-blue-400" />
                <span className="text-gray-400">(0542) 123456</span>
              </div>
              <div className="flex items-center gap-3">
                <Mail className="h-5 w-5 text-blue-400" />
                <span className="text-gray-400">grahaindah@balikpapan.go.id</span>
              </div>
            </div>
          </div>

          {/* Operating Hours */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Jam Pelayanan</h3>
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <Clock className="h-5 w-5 text-blue-400" />
                <div className="text-gray-400">
                  <p className="font-medium">Senin - Kamis</p>
                  <p>08:00 - 16:00 WIB</p>
                </div>
              </div>
              <div className="text-gray-400 ml-8">
                <p className="font-medium">Jumat</p>
                <p>08:00 - 11:30 WIB</p>
              </div>
              <div className="text-gray-400 ml-8">
                <p className="font-medium">Sabtu - Minggu</p>
                <p className="text-red-400">Tutup</p>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-8 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="text-gray-400 text-sm">
              © {currentYear} Kelurahan Graha Indah. Semua hak dilindungi.
            </div>
            <div className="flex space-x-6 mt-4 md:mt-0">
              <a href="#" className="text-gray-400 hover:text-white text-sm transition-colors">
                Kebijakan Privasi
              </a>
              <a href="#" className="text-gray-400 hover:text-white text-sm transition-colors">
                Syarat & Ketentuan
              </a>
              <a href="#" className="text-gray-400 hover:text-white text-sm transition-colors">
                Sitemap
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
