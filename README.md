# Sistem Informasi Kelurahan Graha Indah

Aplikasi web untuk pengelolaan layanan administrasi kelurahan dengan sistem permohonan online.

## 🚀 Fitur

### Public Features
- **Layanan Online** - Browse dan ajukan permohonan layanan kelurahan
- **Form Permohonan** - Upload dokumen dengan preview gambar
- **Tracking Status** - Cek status permohonan dengan nomor registrasi
- **Kontak** - Kirim pesan ke kelurahan

### Admin Features
- **Dashboard** - Statistik permohonan real-time
- **Manajemen Permohonan** - Kelola dan update status permohonan
- **Manajemen Layanan** - CRUD layanan kelurahan
- **Manajemen User** - Kelola admin dan petugas

## 🔐 Kredensial Login

### Admin
- Username: `admin`
- Password: `admin123`

### Petugas
- Username: `petugas1`
- Password: `petugas123`

## 📋 Prerequisites

- Node.js (v16 atau lebih baru)
- PHP 8.x
- MySQL/MariaDB
- Composer

## ⚙️ Installation

### Backend (Laravel)
```bash
cd kelurahan-backend

# Install dependencies
composer install

# Setup environment
cp .env.example .env

# Generate key
php artisan key:generate

# Buat database
mysql -u root -e "CREATE DATABASE kelurahan_db;"

# Migrate dan seed
php artisan migrate:fresh --seed

# Storage link
php artisan storage:link

# Jalankan server
php artisan serve
```

### Frontend (React)
```bash
cd kelurahan-graha-indah-frontend

# Install dependencies
npm install

# Jalankan dev server
npm run dev
```

## 🌐 URL Aplikasi

- **Frontend**: http://localhost:5173
- **Backend API**: http://127.0.0.1:8000
- **Admin Login**: http://localhost:5173/admin/login

## 📱 Teknologi

### Frontend
- React 18
- React Router v6
- Tailwind CSS
- Lucide Icons
- React Hot Toast
- Vite

### Backend
- Laravel 11
- MySQL
- Laravel Sanctum (Auth)
- Intervention Image (Upload)

## 🎨 Fitur Keamanan

- ✅ Protected routes untuk admin
- ✅ JWT authentication dengan Sanctum
- ✅ CORS configuration
- ✅ Input validation (frontend & backend)
- ✅ File upload validation (type & size)
- ✅ NIK, Email, Phone number validation

## 📝 Validasi Form

### NIK
- Harus 16 digit angka
- Real-time validation

### Email
- Format email valid
- Domain validation

### No. HP
- Format: 08xx atau +628xx
- Panjang: 10-13 digit

### Tanggal Lahir
- Tidak boleh masa depan
- Max date: hari ini

### File Upload
- Max size: 5MB
- Format: PDF, JPG, PNG
- Preview untuk gambar

## 🛠️ Development

```bash
# Frontend dev dengan hot reload
npm run dev

# Build production
npm run build

# Preview production build
npm run preview
```

## 📦 Database Seeder

Seeder otomatis membuat:
- 1 Admin user
- 1 Petugas user
- 15+ Layanan kelurahan (berbagai kategori)

## 🐛 Troubleshooting

### Backend tidak bisa connect ke DB
```bash
# Pastikan MySQL running
sudo service mysql start

# Atau jika pakai LAMPP
sudo /opt/lampp/lampp start
```

### Frontend CORS error
- Pastikan backend sudah running
- Cek `config/cors.php` sudah include `http://localhost:5173`

### File upload gagal
```bash
# Pastikan storage link sudah dibuat
php artisan storage:link

# Cek permission folder storage
chmod -R 775 storage
```

## 📄 License

This project is created for educational purposes.

## 👥 Credits

Developed for Kelurahan Graha Indah Administration System
# kelurahan-graha-indah-frontend
