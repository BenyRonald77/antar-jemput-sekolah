import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  ApiError,
  apiError,
  catatNotifikasi,
  hariIni,
  jamSkr,
  nowIso,
} from "@/lib/jemput";

/** POST /api/scan/naik {"siswa_id": n} — catat naik + notifikasi 'dijemput'. */
export async function POST(req: NextRequest) {
  try {
    const data = await req.json().catch(() => null);
    if (!data || !data.siswa_id) throw new ApiError(400, "siswa_id wajib");
    const tanggal = hariIni();
    const waktu = nowIso();
    const jam = jamSkr();

    const s = await prisma.siswa.findUnique({
      where: { id: Number(data.siswa_id) },
      include: { titik: { select: { rute_id: true } } },
    });
    if (!s) throw new ApiError(404, "siswa tidak ditemukan");

    const ada = await prisma.absen.findUnique({
      where: { siswa_id_tanggal: { siswa_id: s.id, tanggal } },
    });
    if (ada && ada.jam_naik)
      throw new ApiError(409, `${s.nama} sudah scan naik jam ${ada.jam_naik}`);

    const rute = await prisma.rute.findUnique({
      where: { id: s.titik.rute_id },
      select: { mobil_id: true },
    });

    await prisma.$transaction(async (tx) => {
      await tx.absen.create({
        data: {
          siswa_id: s.id,
          tanggal,
          jam_naik: jam,
          mobil_id: rute?.mobil_id ?? null,
        },
      });
      await catatNotifikasi(
        tx,
        s.id,
        tanggal,
        waktu,
        "dijemput",
        `${s.nama} sudah dijemput jam ${jam}.`,
      );
    });

    return NextResponse.json({ siswa: s.nama, jam_naik: jam }, { status: 201 });
  } catch (e) {
    return apiError(e);
  }
}
