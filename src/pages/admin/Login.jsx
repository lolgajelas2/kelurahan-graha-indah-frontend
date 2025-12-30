import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Shield, AlertCircle, Clock } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '../../contexts/AuthContext';

const AdminLogin = () => {
  const [formData, setFormData] = useState({
    username: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isRateLimited, setIsRateLimited] = useState(false);
  const [rateLimitTime, setRateLimitTime] = useState(0);
  const { login, loading, error } = useAuth();
  const navigate = useNavigate();

  // Countdown timer for rate limit
  useEffect(() => {
    if (rateLimitTime > 0) {
      const timer = setTimeout(() => {
        setRateLimitTime(rateLimitTime - 1);
      }, 1000);
      return () => clearTimeout(timer);
    } else if (rateLimitTime === 0 && isRateLimited) {
      setIsRateLimited(false);
    }
  }, [rateLimitTime, isRateLimited]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (isRateLimited) {
      toast.error(`Terlalu banyak percobaan. Tunggu ${rateLimitTime} detik.`);
      return;
    }
    
    try {
      await login(formData);
      toast.success('Login berhasil!');
      navigate('/admin/dashboard');
    } catch (error) {
      // Check if it's a rate limit error (429)
      if (error.message && error.message.includes('Terlalu banyak percobaan')) {
        setIsRateLimited(true);
        // Extract time from message or default to 60 seconds
        const timeMatch = error.message.match(/(\d+)\s+menit/);
        const minutes = timeMatch ? parseInt(timeMatch[1]) : 1;
        setRateLimitTime(minutes * 60);
        toast.error(error.message, { duration: 5000 });
      } else if (error.message) {
        toast.error(error.message);
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md p-8">
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <Shield className="h-12 w-12 text-blue-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Admin Panel</h1>
          <p className="text-gray-600">Kelurahan Graha Indah - Sistem Administrasi</p>
        </div>        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-3">
            <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0" />
            <p className="text-red-700 text-sm">{error}</p>
          </div>
        )}
        
        {isRateLimited && (
          <div className="mb-6 p-4 bg-orange-50 border border-orange-200 rounded-lg">
            <div className="flex items-center gap-3 mb-2">
              <Clock className="h-5 w-5 text-orange-500 flex-shrink-0" />
              <p className="text-orange-700 font-medium text-sm">Terlalu Banyak Percobaan</p>
            </div>
            <p className="text-orange-600 text-sm ml-8">
              Silakan tunggu <span className="font-bold">{rateLimitTime}</span> detik sebelum mencoba lagi.
            </p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Username
            </label>
            <input
              type="text"
              name="username"
              value={formData.username}
              onChange={handleInputChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Masukkan username"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Masukkan password"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </button>
            </div>
          </div>          <button
            type="submit"
            disabled={loading || isRateLimited}
            className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Memproses...' : isRateLimited ? `Tunggu ${rateLimitTime}s` : 'Masuk'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AdminLogin;
