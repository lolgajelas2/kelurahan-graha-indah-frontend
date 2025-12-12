import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  FileText, 
  Users, 
  Settings, 
  MessageSquare,
  BarChart3 
} from 'lucide-react';

const AdminSidebar = () => {
  const location = useLocation();

  const navigation = [
    { name: 'Dashboard', href: '/admin/dashboard', icon: LayoutDashboard },
    { name: 'Data Permohonan', href: '/admin/permohonan', icon: FileText },
    { name: 'Manajemen Layanan', href: '/admin/layanan', icon: Settings },
    { name: 'Pengguna', href: '/admin/pengguna', icon: Users },
    { name: 'Pesan Kontak', href: '/admin/pesan-kontak', icon: MessageSquare },
    { name: 'Laporan', href: '/admin/laporan', icon: BarChart3 },
  ];

  const isActive = (href) => location.pathname === href;

  return (
    <div className="w-64 bg-white shadow-sm border-r border-gray-200">
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-lg">GI</span>
          </div>
          <div>
            <div className="text-lg font-bold text-gray-900">Admin Panel</div>
            <div className="text-sm text-gray-600">Kelurahan Graha Indah</div>
          </div>
        </div>
      </div>

      <nav className="mt-6">
        <div className="px-3">
          {navigation.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.name}
                to={item.href}
                className={`flex items-center px-3 py-2 mb-1 text-sm font-medium rounded-lg transition-colors ${
                  isActive(item.href)
                    ? 'bg-blue-100 text-blue-700'
                    : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
                }`}
              >
                <Icon className="mr-3 h-5 w-5" />
                {item.name}
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
};

export default AdminSidebar;
