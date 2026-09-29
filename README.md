# Antar Jemput Sekolah

Rute dan jadwal setiap mobil jemputan, absen naik-turun siswa lewat scan,
lokasi kendaraan realtime, dan notifikasi ke orang tua saat anak sudah
dijemput atau tiba.

## Cara Menjalankan

```bash
npm install
cp .env.example .env
npx prisma generate
npx prisma db push
npm run seed
npm run dev
```

Buka http://localhost:3000

## Stack

- Next.js 14 + TypeScript + Tailwind (App Router)
- Prisma 5 + SQLite

## Halaman

- `/` — Dashboard: posisi terakhir tiap mobil + absensi hari ini (auto-refresh 15 detik)
- `/mobil` — CRUD mobil, rute, dan titik penjemputan
- `/siswa` — CRUD siswa (terdaftar di satu titik)
- `/scan` — Scan naik / scan turun siswa (simulasi kartu/QR)
- `/notifikasi` — Log notifikasi ke orang tua

## API

- `GET/POST /api/mobil`, `DELETE /api/mobil/[id]`
- `GET/POST /api/rute`, `DELETE /api/rute/[id]`
- `GET/POST /api/titik`, `DELETE /api/titik/[id]`
- `GET/POST /api/siswa`, `DELETE /api/siswa/[id]`
- `POST /api/scan/naik` — `{"siswa_id": n}` → catat jam_naik + notifikasi `dijemput`
- `POST /api/scan/turun` — `{"siswa_id": n}` → catat jam_turun + notifikasi `tiba`
- `GET/POST /api/posisi` — laporan posisi; GET menampilkan posisi terbaru per mobil
- `GET /api/absen?tanggal=YYYY-MM-DD` — absensi harian
- `GET /api/notifikasi` — log 100 notifikasi terakhir

## Aturan bisnis

- Scan naik duplikat di hari yang sama → `409`
- Scan turun tanpa jam_naik → `409`; turun duplikat → `409`
- Setiap scan otomatis mencatat notifikasi (`dijemput` / `tiba`) untuk orang tua
