import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { apiError, requireFields } from "@/lib/jemput";

export async function GET() {
  try {
    const rows = await prisma.siswa.findMany({
      orderBy: [{ kelas: "asc" }, { nama: "asc" }],
      include: { titik: { include: { rute: { select: { nama: true } } } } },
    });
    return NextResponse.json(
      rows.map(({ titik, ...s }) => ({
        ...s,
        nama_titik: titik.nama,
        nama_rute: titik.rute.nama,
      })),
    );
  } catch (e) {
    return apiError(e);
  }
}

export async function POST(req: NextRequest) {
  try {
    const data = await req.json().catch(() => null);
    requireFields(data, ["nama", "kelas", "titik_id", "ortu_nama", "ortu_telepon"]);
    const created = await prisma.siswa.create({
      data: {
        nama: data.nama,
        kelas: data.kelas,
        titik_id: Number(data.titik_id),
        ortu_nama: data.ortu_nama,
        ortu_telepon: data.ortu_telepon,
      },
    });
    return NextResponse.json(created, { status: 201 });
  } catch (e) {
    return apiError(e);
  }
}
