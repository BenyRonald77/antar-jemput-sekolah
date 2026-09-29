# PRD — Antar Jemput Sekolah

Rute dan jadwal setiap mobil jemputan, absen naik-turun siswa lewat scan,
lokasi kendaraan realtime, dan notifikasi ke orang tua saat anak sudah
dijemput atau tiba.

## Tujuan

Sekolah mengelola armada antar-jemput: tiap mobil punya rute berisi titik
penjemputan + jam, siswa terdaftar di satu titik. Sopir/pendamping men-scan
siswa saat naik dan saat turun; orang tua mendapat catatan notifikasi
("anak sudah dijemput" / "anak sudah tiba"). Posisi mobil bisa dipantau
realtime di dashboard.

## Stack

- Backend: Python + Flask, SQLite (stdlib `sqlite3`)
- Frontend: HTML + vanilla JS + CSS murni

## Model Data

- `mobil`: id, plat, sopir, kapasitas
- `rute`: id, mobil_id, nama
- `titik`: id, rute_id, urutan, nama, jam (jadwal penjemputan)
- `siswa`: id, nama, kelas, titik_id, ortu_nama, ortu_telepon
- `absen`: id, siswa_id, tanggal, jam_naik, jam_turun, mobil_id
  (satu baris per siswa per hari)
- `posisi`: id, mobil_id, lat, lng, waktu (riwayat; yang terbaru = posisi kini)
- `notifikasi`: id, siswa_id, tanggal, waktu, jenis (`dijemput`/`tiba`),
  pesan (log; pengiriman SMS/WA sungguhan di luar cakupan)

## Aturan Bisnis

1. Scan naik: membuat baris absen hari ini (jam_naik). Duplikat naik di hari
   yang sama ditolak (`409`). Otomatis membuat notifikasi `dijemput` ke ortu.
2. Scan turun: mengisi jam_turun pada baris yang sudah ada jam_naik.
   Tanpa jam_naik → ditolak (`409`). Membuat notifikasi `tiba`.
3. Scan memakai `siswa_id` (simulasi kartu/scan QR).
4. Posisi mobil: setiap laporan posisi tersimpan; dashboard menampilkan
   yang terbaru per mobil.
5. Notifikasi hanya log tercatat (pesan + waktu + tujuan ortu); tidak ada
   pengiriman SMS/WA sungguhan.

## Tahap Pengerjaan

- **F0 — Fondasi**: PRD, README, struktur, requirements, .gitignore.
- **F1 — Database + API inti**: schema, seed, CRUD mobil/rute/titik/siswa,
  scan naik-turun + notifikasi otomatis.
- **F2 — Posisi & laporan**: laporan posisi realtime, absensi harian,
  log notifikasi.
- **F3 — UI**: Dashboard (peta posisi + absen), Mobil & Rute, Siswa,
  Scan Absen, Notifikasi.

## Kriteria Selesai

- [ ] Scan naik lalu turun tercatat benar; duplikat/acak ditolak
- [ ] Notifikasi `dijemput` dan `tiba` otomatis tercatat
- [ ] Posisi terakhir tiap mobil tampil di dashboard
- [ ] `pip install -r requirements.txt && python app.py` langsung jalan

## Non-tujuan

- GPS tracker hardware sungguhan, SMS/WA gateway, aplikasi sopir mobile.
