# Antar Jemput Sekolah

Rute & jadwal mobil jemputan, absen naik-turun via scan, lokasi kendaraan
realtime, notifikasi ke orang tua.

## Cara Menjalankan

```bash
python -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
python app.py
```

Buka http://localhost:5008. Database dibuat otomatis dan di-seed saat
pertama dijalankan.

## Struktur

```
├── PRD.md
├── requirements.txt
├── app.py
├── jemput/
│   ├── __init__.py
│   ├── db.py
│   ├── schema.sql
│   ├── seed.sql
│   ├── api.py       # mobil, rute, titik, siswa, scan naik/turun
│   └── pantau.py    # posisi realtime, absensi harian, notifikasi
├── static/
└── templates/
```
