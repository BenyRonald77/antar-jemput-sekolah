INSERT INTO mobil (plat, sopir, kapasitas) VALUES
  ('B 1234 ABC', 'Pak Slamet', 12),
  ('B 5678 DEF', 'Pak Bambang', 10);

INSERT INTO rute (mobil_id, nama) VALUES
  (1, 'Rute Utara'),
  (2, 'Rute Selatan');

INSERT INTO titik (rute_id, urutan, nama, jam) VALUES
  (1, 1, 'Perum Griya Asri', '06:00'),
  (1, 2, 'Jl. Kenanga No. 5', '06:10'),
  (1, 3, 'Sekolah', '06:30'),
  (2, 1, 'Perum Taman Sari', '06:05'),
  (2, 2, 'Jl. Melati No. 12', '06:15'),
  (2, 3, 'Sekolah', '06:35');

INSERT INTO siswa (nama, kelas, titik_id, ortu_nama, ortu_telepon) VALUES
  ('Dimas Prasetyo', '4A', 1, 'Ibu Ratna', '081111111111'),
  ('Nadia Putri', '4A', 2, 'Bpk. Agus', '082222222222'),
  ('Fajar Ramadhan', '5B', 4, 'Ibu Sari', '083333333333');
