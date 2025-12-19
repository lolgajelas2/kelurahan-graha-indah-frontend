import { useState, useEffect } from 'react';
import { Mail, Trash2, Eye, Clock, CheckCircle, Search } from 'lucide-react';
import toast from 'react-hot-toast';
import apiService from '../../services/apiService';

const PesanKontak = () => {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedMessage, setSelectedMessage] = useState(null);
  const [replyText, setReplyText] = useState('');
  const [replyLoading, setReplyLoading] = useState(false);

  useEffect(() => {
    fetchMessages();
  }, []);

  const fetchMessages = async () => {
    setLoading(true);
    try {
      const response = await apiService.getKontakMessages();
      // Handle pagination response or direct data array
      const dataArray = response?.data?.data || response?.data || [];
      setMessages(Array.isArray(dataArray) ? dataArray : []);
    } catch (error) {
      toast.error('Gagal memuat pesan');
      setMessages([]);
    } finally {
      setLoading(false);
    }
  };

  const handleViewDetail = async (message) => {
    setSelectedMessage(message);
    setShowDetailModal(true);
    
    // Mark as read if not already
    if (message.status === 'baru') {
      try {
        await apiService.updateKontakStatus(message.id, 'dibaca');
        fetchMessages();
      } catch (error) {
        console.error('Failed to mark as read');
      }
    }
  };

  const handleDelete = async (id) => {
    const message = messages.find(m => m.id === id);
    if (!message) return;

    if (window.confirm(`Hapus pesan dari "${message.nama}"?\n\nTindakan ini tidak dapat dibatalkan.`)) {
      try {
        await apiService.deleteKontak(id);
        setMessages(messages.filter(m => m.id !== id));
        toast.success('Pesan berhasil dihapus');
      } catch (error) {
        toast.error('Gagal menghapus pesan');
      }
    }
  };

  const handleMarkAsReplied = async (id) => {
    try {
      await apiService.updateKontakStatus(id, 'dibalas');
      fetchMessages();
      toast.success('Status diperbarui');
      setShowDetailModal(false);
    } catch (error) {
      toast.error('Gagal memperbarui status');
    }
  };

  const handleReply = async () => {
    if (!replyText.trim()) {
      toast.error('Balasan tidak boleh kosong');
      return;
    }
    setReplyLoading(true);
    try {
      await apiService.replyKontak(selectedMessage.id, replyText);
      toast.success('Balasan berhasil dikirim ke email pengirim');
      setShowDetailModal(false);
      setReplyText('');
      fetchMessages();
    } catch (error) {
      toast.error('Gagal mengirim balasan');
    } finally {
      setReplyLoading(false);
    }
  };

  const filteredMessages = (Array.isArray(messages) ? messages : []).filter(message => {
    const matchesSearch = 
      (message.nama || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (message.email || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (message.subjek || '').toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || message.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status) => {
    switch (status) {
      case 'baru':
        return <span className="px-2 py-1 text-xs font-medium bg-yellow-100 text-yellow-800 rounded-full flex items-center gap-1">
          <Clock className="h-3 w-3" /> Belum Dibaca
        </span>;
      case 'dibaca':
        return <span className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full flex items-center gap-1">
          <Eye className="h-3 w-3" /> Sudah Dibaca
        </span>;
      case 'dibalas':
        return <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded-full flex items-center gap-1">
          <CheckCircle className="h-3 w-3" /> Dibalas
        </span>;
      default:
        return null;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Pesan Kontak</h1>
          <p className="text-gray-600">Kelola pesan masuk dari warga</p>
        </div>

        <div className="card p-6 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Cari nama, email, atau subjek..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">Semua Status</option>
              <option value="baru">Belum Dibaca</option>
              <option value="dibaca">Sudah Dibaca</option>
              <option value="dibalas">Dibalas</option>
            </select>
          </div>
        </div>

        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Pengirim
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Subjek
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Tanggal
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Aksi
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredMessages.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="px-6 py-8 text-center text-gray-500">
                      Tidak ada pesan
                    </td>
                  </tr>
                ) : (
                  filteredMessages.map((message) => (
                    <tr key={message.id} className={message.status === 'baru' ? 'bg-blue-50' : ''}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className={`text-sm font-medium ${message.status === 'baru' ? 'font-bold text-gray-900' : 'text-gray-900'}`}>
                            {message.nama}
                          </div>
                          <div className="text-sm text-gray-500">{message.email}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className={`text-sm ${message.status === 'baru' ? 'font-semibold text-gray-900' : 'text-gray-900'}`}>
                          {message.subjek}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(message.created_at).toLocaleDateString('id-ID', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getStatusBadge(message.status)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleViewDetail(message)}
                            className="text-blue-600 hover:text-blue-900"
                          >
                            <Eye className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(message.id)}
                            className="text-red-600 hover:text-red-900"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Detail Modal */}
        {showDetailModal && selectedMessage && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-2xl font-bold text-gray-900">Detail Pesan</h2>
                  <button
                    onClick={() => setShowDetailModal(false)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <span className="text-2xl">&times;</span>
                  </button>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Dari</label>
                    <p className="text-gray-900">{selectedMessage.nama}</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                    <p className="text-gray-900">{selectedMessage.email}</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Subjek</label>
                    <p className="text-gray-900 font-semibold">{selectedMessage.subjek}</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Pesan</label>
                    <div className="bg-gray-50 rounded-lg p-4 whitespace-pre-wrap">
                      {selectedMessage.pesan}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Tanggal</label>
                    <p className="text-gray-900">
                      {new Date(selectedMessage.created_at).toLocaleDateString('id-ID', {
                        weekday: 'long',
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                    {getStatusBadge(selectedMessage.status)}
                  </div>

                  <div className="flex gap-3 pt-4 border-t">
                    {selectedMessage.status !== 'dibalas' && (
                      <>
                        <textarea
                          className="w-full border rounded-lg p-2 mb-2"
                          rows={3}
                          placeholder="Tulis balasan untuk pengirim..."
                          value={replyText}
                          onChange={e => setReplyText(e.target.value)}
                        />
                        <button
                          onClick={handleReply}
                          className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-60"
                          disabled={replyLoading}
                        >
                          {replyLoading ? 'Mengirim...' : 'Kirim Balasan'}
                        </button>
                      </>
                    )}
                    <button
                      onClick={() => setShowDetailModal(false)}
                      className="flex-1 px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300"
                    >
                      Tutup
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PesanKontak;