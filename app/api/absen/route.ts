import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { apiError, hariIni } from "@/lib/jemput";

/** Absensi per tanggal (default hari ini). */
export async function GET(req: NextRequest) {
  try {
    const tanggal =
      req.nextUrl.searchParams.get("tanggal") || hariIni();
    const rows = await prisma.absen.findMany({
      where: { tanggal },
      orderBy: { siswa: { nama: "asc" } },
      include: {
        siswa: { select: { nama: true, kelas: true } },
        mobil: { select: { plat: true } },
      },
    });
    return NextResponse.json(
      rows.map(({ siswa, mobil, ...a }) => ({
        ...a,
        nama: siswa.nama,
        kelas: siswa.kelas,
        plat: mobil?.plat ?? null,
      })),
    );
  } catch (e) {
    return apiError(e);
  }
}
