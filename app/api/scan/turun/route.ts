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

/** POST /api/scan/turun {"siswa_id": n} — catat turun + notifikasi 'tiba'. */
export async function POST(req: NextRequest) {
  try {
    const data = await req.json().catch(() => null);
    if (!data || !data.siswa_id) throw new ApiError(400, "siswa_id wajib");
    const tanggal = hariIni();
    const waktu = nowIso();
    const jam = jamSkr();

    const s = await prisma.siswa.findUnique({
      where: { id: Number(data.siswa_id) },
    });
    if (!s) throw new ApiError(404, "siswa tidak ditemukan");

    const a = await prisma.absen.findUnique({
      where: { siswa_id_tanggal: { siswa_id: s.id, tanggal } },
    });
    if (!a || !a.jam_naik)
      throw new ApiError(409, `${s.nama} belum scan naik hari ini`);
    if (a.jam_turun)
      throw new ApiError(409, `${s.nama} sudah scan turun jam ${a.jam_turun}`);

    await prisma.$transaction(async (tx) => {
      await tx.absen.update({ where: { id: a.id }, data: { jam_turun: jam } });
      await catatNotifikasi(
        tx,
        s.id,
        tanggal,
        waktu,
        "tiba",
        `${s.nama} sudah tiba jam ${jam}.`,
      );
    });

    return NextResponse.json({ siswa: s.nama, jam_turun: jam });
  } catch (e) {
    return apiError(e);
  }
}
