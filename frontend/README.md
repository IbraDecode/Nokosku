## Nokosku Frontend (Vite + React + TypeScript)

UI bergaya mobile-app untuk Nokosku, terhubung langsung ke backend lokal (`http://localhost:3000`). Tanpa mock data, semua fetch lewat backend.

### Persiapan

1. Masuk folder frontend:
   ```bash
   cd frontend
   ```
2. Salin env:
   ```bash
   cp .env.example .env.local
   ```
3. Install deps:
   ```bash
   npm install
   ```

### Menjalankan

```bash
npm run dev
```
Frontend jalan di `http://localhost:5173` (default Vite).

### Endpoint yang dipakai per halaman

| Halaman | Endpoint backend |
| --- | --- |
| Login/Register | `POST /api/v1/auth/login`, `POST /api/v1/auth/register` |
| Splash/Profile/Home | `GET /api/v1/user/profile` |
| Saldo mini | `GET /api/v1/user/balance` |
| Deposit list/detail | `GET /api/v1/deposit/methods`, `POST /api/v1/deposit/create`, `GET /api/v1/deposit/:id`, `POST /api/v1/deposit/:id/cancel`, `GET /api/v1/deposit/history` |
| Order/buy | `GET /api/v1/orders/services`, `GET /api/v1/orders/countries/:serviceId`, `GET /api/v1/orders/operators/:countryCode`, `POST /api/v1/orders/quote`, `POST /api/v1/orders/create` |
| Order monitoring | `GET /api/v1/orders/:id`, `POST /api/v1/orders/:id/resend`, `POST /api/v1/orders/:id/cancel`, `GET /api/v1/orders/history` |
| Admin (opsional) | `GET /api/v1/admin/stats` |
| Socket | `deposit:paid`, `order:otp_received`, `order:expired` dari `VITE_WS_URL` |

### Flow test manual (disarankan urut)

1. **Register & Login**
   - Buka `/welcome` → lanjut ke `/register`, isi email + password.
   - Pastikan toast "Akun jadi" muncul lalu diarahkan ke `/home`.
   - Logout dari `/profile`, login ulang di `/login` pastikan token tersimpan.

2. **Home & saldo**
   - Pastikan nama/email dan saldo tampil.
   - Quick action Topup/Beli/Riwayat berfungsi mengarahkan rute.

3. **Topup saldo**
   - Ke `/deposit`, pilih nominal & metode (Atlantic).
   - Submit → dialihkan ke `/deposit/:id`, QR tampil.
   - Klik "Saya sudah bayar" untuk refresh status manual, "Batalkan" untuk cancel.
   - Jika backend kirim event `deposit:paid`, UI auto update ke sukses.

4. **Beli nomor**
   - `/buy`: pilih layanan dari daftar backend, pilih negara, operator.
   - Lanjut ke konfirmasi harga (via `/orders/quote`) → klik "Beli sekarang".
   - Pastikan diarahkan ke `/orders/:id`.

5. **Monitor OTP**
   - Di `/orders/:id`, nomor bisa disalin, countdown berjalan.
   - Klik "Mau dikabarin" untuk izin notifikasi browser.
   - Cek tombol Resend/Batalkan aktif saat status pending.
   - Saat backend mengirim `order:otp_received`, OTP muncul dan bisa disalin; notifikasi browser keluar jika izin diberikan.
   - Jika `order:expired`, tampil pesan habis waktu.

6. **Riwayat & profil**
   - `/orders` filter status bekerja, klik item masuk ke detail.
   - `/profile` menampilkan email, saldo mini, akses ke pengaturan, logout.

7. **Pengaturan**
   - Ubah tema (auto/light/dark) dan pastikan tersimpan (reload halaman).
   - Aktifkan notifikasi browser, buka tautan CS Telegram.

### Catatan UI

- Rasa mobile-first: layout vertikal, bottom nav tetap di mobile.
- Lottie transparan sesuai mapping di `CatLottie`.
- Tidak ada data dummy; seluruh list/price diambil dari backend.
