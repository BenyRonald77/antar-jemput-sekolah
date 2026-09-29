import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { apiError } from "@/lib/jemput";

export async function GET() {
  try {
    const rows = await prisma.notifikasi.findMany({
      orderBy: [{ waktu: "desc" }, { id: "desc" }],
      take: 100,
      include: {
        siswa: {
          select: { nama: true, ortu_nama: true, ortu_telepon: true },
        },
      },
    });
    return NextResponse.json(
      rows.map(({ siswa, ...n }) => ({
        ...n,
        nama: siswa.nama,
        ortu_nama: siswa.ortu_nama,
        ortu_telepon: siswa.ortu_telepon,
      })),
    );
  } catch (e) {
    return apiError(e);
  }
}
