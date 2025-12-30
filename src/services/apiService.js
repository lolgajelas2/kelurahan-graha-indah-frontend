import { apiConfig, getAuthHeaders } from '../config/api';

class ApiService {  async request(endpoint, options = {}) {
    const url = `${apiConfig.baseURL}${endpoint}`;
    const config = {
      ...options,
      headers: {
        ...apiConfig.headers,
        ...getAuthHeaders(),
        ...options.headers
      }
    };

    try {
      const response = await fetch(url, config);
      
      // Cek apakah response adalah JSON
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        throw new Error(`Server error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();

      if (!response.ok) {
        // Create error object with all details
        const error = new Error(data.message || 'Something went wrong');
        error.status = response.status;
        error.errors = data.errors || null;
        error.data = data;
        throw error;
      }

      return data;
    } catch (error) {
      // If it's already our custom error, just throw it
      if (error.status) {
        throw error;
      }
      // Otherwise, wrap network errors
      throw new Error(error.message || 'Network error. Please check your connection.');
    }
  }

  // Auth methods
  async login(credentials) {
    return this.request('/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
    });
  }

  async logout() {
    return this.request('/logout', {
      method: 'POST',
    });
  }

  async getProfile() {
    return this.request('/me');
  }

  // Layanan methods
  async getLayanan(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    return this.request(`/layanan${queryString ? `?${queryString}` : ''}`);
  }

  async getLayananById(id) {
    return this.request(`/layanan/${id}`);
  }

  async createLayanan(data) {
    return this.request('/layanan', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateLayanan(id, data) {
    return this.request(`/layanan/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteLayanan(id) {
    return this.request(`/layanan/${id}`, {
      method: 'DELETE',
    });
  }

  // Permohonan methods
  async getPermohonan(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    return this.request(`/permohonan${queryString ? `?${queryString}` : ''}`);
  }

  async createPermohonan(data) {
    return this.request('/permohonan', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getPermohonanDetail(id) {
    const response = await this.request(`/permohonan/${id}`);
    return response.data;
  }

  async getPermohonanById(id) {
    return this.request(`/permohonan/${id}`);
  }

  async updatePermohonanStatus(id, data) {
    return this.request(`/permohonan/${id}/status`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  // Alias untuk updatePermohonanStatus
  async updateStatus(id, data) {
    return this.updatePermohonanStatus(id, data);
  }

  // Bulk operations
  async bulkUpdatePermohonanStatus(ids, status, catatan = '') {
    return this.request('/permohonan/bulk-update-status', {
      method: 'POST',
      body: JSON.stringify({ ids, status, catatan }),
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      }
    });
  }

  async bulkDeletePermohonan(ids) {
    return this.request('/permohonan/bulk-delete', {
      method: 'DELETE',
      body: JSON.stringify({ ids }),
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      }
    });
  }

  // Status tracking
  async checkStatus(nomorRegistrasi) {
    return this.request('/status/check', {
      method: 'POST',
      body: JSON.stringify({ nomor_registrasi: nomorRegistrasi }),
    });
  }

  // Dashboard
  async getDashboardStats(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    return this.request(`/dashboard/stats${queryString ? `?${queryString}` : ''}`);
  }

  // File upload
  async uploadBerkas(formData) {
    const url = `${apiConfig.baseURL}/berkas`;
    const response = await fetch(url, {
      method: 'POST',
      body: formData,
    });
    if (!response.ok) {
      const data = await response.json();
      console.error('Upload error details:', data.errors || data);
      throw new Error(data.message || 'Upload berkas gagal');
    }
    return response.json();
  }

  // User management
  // Ambil semua user
  async getAdminUsers() {
    return this.request('/users'); // harap sudah di-middleware admin pada backend
  }
  
  // Tambah user
  async createUser(data) {
    return this.request('/users', {
      method: 'POST',
      body: JSON.stringify(data),
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      }
    });
  }

  // Edit user
  async updateUser(id, data) {
    return this.request(`/users/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      }
    });
  }

  // Hapus user
  async deleteUser(id) {
    return this.request(`/users/${id}`, {
      method: 'DELETE'
    });
  }

  // Contact/Kontak
  async sendKontak(data) {
    return this.request('/kontak', {
      method: 'POST',
      body: JSON.stringify(data),
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      }
    });
  }

  async getKontakMessages() {
    return this.request('/kontak');
  }

  async getKontakDetail(id) {
    return this.request(`/kontak/${id}`);
  }

  async updateKontakStatus(id, status) {
    return this.request(`/kontak/${id}`, {
      method: 'PUT',
      body: JSON.stringify({ status }),
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      }
    });
  }

  async deleteKontak(id) {
    return this.request(`/kontak/${id}`, {
      method: 'DELETE'
    });
  }

  // Membalas pesan kontak
  async replyKontak(id, balasan) {
    return this.request(`/kontak/${id}/reply`, {
      method: 'POST',
      body: JSON.stringify({ balasan }),
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      }
    });
  }
  // Export methods
  async exportPermohonanExcel(params = {}) {
    // Remove undefined/null parameters
    const cleanParams = Object.entries(params).reduce((acc, [key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        acc[key] = value;
      }
      return acc;
    }, {});
    
    const queryString = new URLSearchParams(cleanParams).toString();
    const url = `${apiConfig.baseURL}/permohonan/export/excel${queryString ? `?${queryString}` : ''}`;
    
    const response = await fetch(url, {
      method: 'GET',
      headers: getAuthHeaders(),
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Gagal export Excel: ${errorText}`);
    }
    
    // Download file
    const blob = await response.blob();
    const downloadUrl = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = downloadUrl;
    link.download = `Laporan_Permohonan_${new Date().toISOString().split('T')[0]}.xlsx`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(downloadUrl);
    
    return { success: true };
  }

  async exportPermohonanPdf(params = {}) {
    // Remove undefined/null parameters
    const cleanParams = Object.entries(params).reduce((acc, [key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        acc[key] = value;
      }
      return acc;
    }, {});
    
    const queryString = new URLSearchParams(cleanParams).toString();
    const url = `${apiConfig.baseURL}/permohonan/export/pdf${queryString ? `?${queryString}` : ''}`;
    
    const response = await fetch(url, {
      method: 'GET',
      headers: getAuthHeaders(),
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Gagal export PDF: ${errorText}`);
    }
    
    // Download file
    const blob = await response.blob();
    const downloadUrl = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = downloadUrl;
    link.download = `Laporan_Permohonan_${new Date().toISOString().split('T')[0]}.pdf`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(downloadUrl);
    
    return { success: true };
  }
}

export default new ApiService();
