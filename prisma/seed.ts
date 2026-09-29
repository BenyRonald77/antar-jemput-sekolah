import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const n = await prisma.mobil.count();
  if (n > 0) {
    console.log("seed dilewati (sudah ada data)");
    return;
  }

  await prisma.mobil.createMany({
    data: [
      { plat: "B 1234 ABC", sopir: "Pak Slamet", kapasitas: 12 },
      { plat: "B 5678 DEF", sopir: "Pak Bambang", kapasitas: 10 },
    ],
  });

  await prisma.rute.createMany({
    data: [
      { mobil_id: 1, nama: "Rute Utara" },
      { mobil_id: 2, nama: "Rute Selatan" },
    ],
  });

  await prisma.titik.createMany({
    data: [
      { rute_id: 1, urutan: 1, nama: "Perum Griya Asri", jam: "06:00" },
      { rute_id: 1, urutan: 2, nama: "Jl. Kenanga No. 5", jam: "06:10" },
      { rute_id: 1, urutan: 3, nama: "Sekolah", jam: "06:30" },
      { rute_id: 2, urutan: 1, nama: "Perum Taman Sari", jam: "06:05" },
      { rute_id: 2, urutan: 2, nama: "Jl. Melati No. 12", jam: "06:15" },
      { rute_id: 2, urutan: 3, nama: "Sekolah", jam: "06:35" },
    ],
  });

  await prisma.siswa.createMany({
    data: [
      { nama: "Dimas Prasetyo", kelas: "4A", titik_id: 1, ortu_nama: "Ibu Ratna", ortu_telepon: "081111111111" },
      { nama: "Nadia Putri", kelas: "4A", titik_id: 2, ortu_nama: "Bpk. Agus", ortu_telepon: "082222222222" },
      { nama: "Fajar Ramadhan", kelas: "5B", titik_id: 4, ortu_nama: "Ibu Sari", ortu_telepon: "083333333333" },
    ],
  });

  console.log("seed selesai");
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
