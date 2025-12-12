
import { useState, useEffect } from 'react';
import {
  Users,
  FileText,
  CheckCircle,
  Clock,
  XCircle,
  TrendingUp,
  Calendar,
  Eye,
  AlertCircle
} from 'lucide-react';
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import apiService from '../../services/apiService';

const AdminDashboard = () => {
  const [dateRange, setDateRange] = useState('7');
  const [stats, setStats] = useState({
    total_permohonan: 0,
    permohonan_selesai: 0,
    permohonan_proses: 0,
    permohonan_baru: 0
  });
  const [recentApplications, setRecentApplications] = useState([]);
  const [popularServices, setPopularServices] = useState([]);
  const [chartData, setChartData] = useState([]);
  const [statusDistribution, setStatusDistribution] = useState([]);
  const [permohonanPerLayanan, setPermohonanPerLayanan] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const COLORS = ['#FCD34D', '#60A5FA', '#34D399', '#F87171'];

  useEffect(() => {
    fetchDashboard();
  }, [dateRange]);

  const fetchDashboard = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await apiService.getDashboardStats({ days: dateRange });
      setStats(res.data.stats);
      setRecentApplications(res.data.recent_applications);
      setPopularServices(res.data.popular_services);
      setChartData(res.data.chart_data || []);
      setStatusDistribution(res.data.status_distribution || []);
      setPermohonanPerLayanan(res.data.permohonan_per_layanan || []);
    } catch (e) {
      console.error(e);
      setError('Gagal memuat data dashboard');
    } finally {
      setLoading(false);
    }
  };

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
      case 'baru': return <Users className="h-4 w-4" />;
      case 'ditolak': return <XCircle className="h-4 w-4" />;
      default: return <FileText className="h-4 w-4" />;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center gap-3">
          <AlertCircle className="h-5 w-5 text-red-500" />
          <p className="text-red-700">{error}</p>
          <button onClick={fetchDashboard} className="ml-auto px-3 py-1 bg-red-100 text-red-700 rounded">
            Coba Lagi
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <div className="flex items-center gap-2">
          <span className="text-sm">Periode:</span>
          <select
            value={dateRange}
            onChange={e => setDateRange(e.target.value)}
            className="border px-3 py-1 rounded"
          >
            <option value="7">7 Hari</option>
            <option value="30">30 Hari</option>
            <option value="90">3 Bulan</option>
          </select>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {[
          { label: 'Total Permohonan', value: stats.total_permohonan, icon: <FileText className="h-6 w-6 text-blue-600" />, bg: 'bg-blue-100', text: 'text-blue-700' },
          { label: 'Selesai', value: stats.permohonan_selesai, icon: <CheckCircle className="h-6 w-6 text-green-600" />, bg: 'bg-green-100', text: 'text-green-700' },
          { label: 'Dalam Proses', value: stats.permohonan_proses, icon: <Clock className="h-6 w-6 text-yellow-600" />, bg: 'bg-yellow-100', text: 'text-yellow-700' },
          { label: 'Permohonan Baru', value: stats.permohonan_baru, icon: <Users className="h-6 w-6 text-purple-600" />, bg: 'bg-purple-100', text: 'text-purple-700' }
        ].map((card) => (
          <div key={card.label} className="bg-white p-6 rounded shadow border flex items-center gap-4">
            <div className={`${card.bg} p-2 rounded`}>
              {card.icon}
            </div>
            <div>
              <p className="text-sm text-gray-600">{card.label}</p>
              <p className="text-2xl font-bold text-gray-900">{card.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Line Chart - Permohonan per hari */}
        <div className="bg-white rounded shadow border p-6">
          <h3 className="font-semibold mb-4">Permohonan 7 Hari Terakhir</h3>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="jumlah" stroke="#2563EB" strokeWidth={2} name="Jumlah Permohonan" />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Pie Chart - Status Distribution */}
        <div className="bg-white rounded shadow border p-6">
          <h3 className="font-semibold mb-4">Distribusi Status Permohonan</h3>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={statusDistribution}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, value }) => `${name}: ${value}`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {statusDistribution.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Bar Chart - Permohonan per Layanan */}
      <div className="bg-white rounded shadow border p-6 mb-6">
        <h3 className="font-semibold mb-4">Permohonan per Layanan</h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={permohonanPerLayanan}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="nama" angle={-45} textAnchor="end" height={100} />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="total" fill="#3B82F6" name="Jumlah Permohonan" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent */}
        <div className="bg-white rounded shadow border">
          <div className="px-6 py-4 border-b">
            <h3 className="font-semibold">Permohonan Terbaru</h3>
          </div>
          <div className="p-6 space-y-4">
            {recentApplications.length === 0
              ? <p className="text-gray-500">Belum ada permohonan</p>
              : recentApplications.map(app => (
                <div key={app.id} className="flex justify-between items-center bg-gray-50 p-4 rounded">
                  <div>
                    <p className="font-medium">{app.nama}</p>
                    <p className="text-sm text-gray-600">{app.layanan.nama}</p>
                    <p className="text-xs text-gray-500">{new Date(app.created_at).toLocaleDateString('id-ID')}</p>
                  </div>
                  <div className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(app.status)}`}>
                    {getStatusIcon(app.status)}
                    {app.status.charAt(0).toUpperCase() + app.status.slice(1)}
                  </div>
                  <button><Eye className="h-5 w-5 text-gray-400" /></button>
                </div>
              ))
            }
          </div>
        </div>

        {/* Popular */}
        <div className="bg-white rounded shadow border">
          <div className="px-6 py-4 border-b">
            <h3 className="font-semibold">Layanan Populer</h3>
          </div>
          <div className="p-6 space-y-4">
            {popularServices.length === 0
              ? <p className="text-gray-500">Belum ada data</p>
              : popularServices.map((svc, idx) => {
                const max = Math.max(...popularServices.map(s => s.count));
                const pct = Math.round((svc.count / max) * 100);
                return (
                  <div key={idx}>
                    <div className="flex justify-between">
                      <p>{svc.nama}</p>
                      <p className="font-medium">{svc.count}</p>
                    </div>
                    <div className="w-full bg-gray-200 h-2 rounded">
                      <div className="bg-blue-600 h-2 rounded" style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                );
              })
            }
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white p-6 rounded shadow border">
        <h3 className="font-semibold mb-4">Aksi Cepat</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { icon: <FileText className="h-6 w-6 text-blue-600" />, label: 'Permohonan' },
            { icon: <Users className="h-6 w-6 text-green-600" />, label: 'Layanan' },
            { icon: <Calendar className="h-6 w-6 text-purple-600" />, label: 'Laporan' },
            { icon: <TrendingUp className="h-6 w-6 text-orange-600" />, label: 'Statistik' }
          ].map((act) => (
            <button key={act.label} className="flex flex-col items-center p-4 border rounded hover:bg-gray-50">
              {act.icon}
              <span className="mt-2 text-sm">{act.label}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
