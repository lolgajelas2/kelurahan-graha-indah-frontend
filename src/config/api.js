// Gunakan environment variable atau default ke localhost
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api';

export const apiConfig = {
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
};

// Helper untuk mendapatkan token dari localStorage
export const getAuthToken = () => {
  return localStorage.getItem('auth_token');
};

// Helper untuk set auth header
export const getAuthHeaders = () => {
  const token = getAuthToken();
  return token ? {
    ...apiConfig.headers,
    'Authorization': `Bearer ${token}`
  } : apiConfig.headers;
};
