# Penjadwalan Ruang (Pure Frontend)

Sistem Administrasi Penjadwalan Ruang untuk Satpol PP Kota Mojokerto.
Aplikasi ini dibuat murni **Front-End (HTML5, CSS3, JavaScript)** tanpa backend server dan tanpa database eksternal. Semua data tersimpan di `localStorage` peramban Anda.

## Kredensial Masuk (Login)

- **Username**: `admin`
- **Password**: `admin@2025`

## Menjalankan di Komputer Lokal

Cukup **klik dua kali berkas `index.html`** untuk membukanya langsung di peramban (Chrome, Edge, Firefox, Safari), atau jalankan server statis jika diinginkan:

```bash
npx serve .
```

## Deploy ke Vercel

Aplikasi ini sudah 100% siap untuk Vercel:
1. `git add .`
2. `git commit -m "Pure frontend static"`
3. `git push`

Vercel akan otomatis menyajikan website statis ini dalam hitungan detik tanpa error build atau serverless.

## Fitur Utama

- **Login & Logout**: Keamanan autentikasi pengguna lokal (`admin` / `admin@2025`).
- **Dashboard**: Statistik ringkas, jadwal hari ini & mendatang, riwayat kegiatan terakhir.
- **Data Ruangan**: Tambah, ubah, aktifkan/nonaktifkan, dan cari ruangan.
- **Jadwal Penggunaan**: Filter cepat (Semua, Hari ini, Mendatang, Terjadwal, Selesai, Dibatalkan), pencarian, filter tanggal, dan pembatalan jadwal.
- **Form Pencatatan**: Penomoran ID jadwal otomatis (`JD-YYYYMMDD-HHMMSS` WIB), validasi waktu dan ruangan.
- **Riwayat Penggunaan**: Rekap historis dengan filter per bulan, ruangan, dan status. Ekspor data ke format CSV.
- **Cadangan Data (Backup & Restore)**: Unduh berkas cadangan `.JSON` kapan saja agar data Anda aman atau dapat dipindahkan ke perangkat lain.

## Struktur Berkas

```
index.html    tampilan utama antarmuka pengguna (SPA)
style.css     desain & tema warna krem Satpol PP Kota Mojokerto
app.js        logika aplikasi, routing, dan penyimpanan data localStorage
vercel.json   konfigurasi hosting statis Vercel
```
