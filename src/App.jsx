import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './contexts/AuthContext';

// Import components
import Layout from './components/Layout';
import AdminLayout from './components/AdminLayout';
import ProtectedRoute from './components/ProtectedRoute';
import Home from './pages/Home';
import Layanan from './pages/Layanan';
import FormPermohonan from './pages/FormPermohonan';
import Status from './pages/Status';
import Kontak from './pages/Kontak';
import AdminLogin from './pages/admin/Login';
import AdminDashboard from './pages/admin/Dashboard';
import DataPermohonan from './pages/admin/DataPermohonan';
import ManajemenLayanan from './pages/admin/ManajemenLayanan';
import PenggunaAdmin from './pages/admin/PenggunaAdmin';
import PesanKontak from './pages/admin/PesanKontak';
import Laporan from './pages/admin/Laporan';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Toaster 
          position="top-right"
          toastOptions={{
            duration: 3000,
            style: {
              background: '#363636',
              color: '#fff',
            },
            success: {
              duration: 3000,
              iconTheme: {
                primary: '#10b981',
                secondary: '#fff',
              },
            },
            error: {
              duration: 4000,
              iconTheme: {
                primary: '#ef4444',
                secondary: '#fff',
              },
            },
          }}
        />
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Layout />}>
            <Route index element={<Home />} />
            <Route path="layanan" element={<Layanan />} />
            <Route path="permohonan/:serviceId" element={<FormPermohonan />} />
            <Route path="status" element={<Status />} />
            <Route path="kontak" element={<Kontak />} />
          </Route>

          {/* Admin Routes */}
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route path="/admin" element={
            <ProtectedRoute>
              <AdminLayout />
            </ProtectedRoute>
          }>
            <Route path="dashboard" element={<AdminDashboard />} />
            <Route path="permohonan" element={<DataPermohonan />} />
            <Route path="layanan" element={<ManajemenLayanan />} />
            <Route path="pengguna" element={<PenggunaAdmin />} />
            <Route path="pesan-kontak" element={<PesanKontak />} />
            <Route path="laporan" element={<Laporan />} />
          </Route>
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
