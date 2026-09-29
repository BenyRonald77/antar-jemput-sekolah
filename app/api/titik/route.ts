import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { apiError, requireFields } from "@/lib/jemput";

export async function GET() {
  try {
    const rows = await prisma.titik.findMany({
      orderBy: [{ rute_id: "asc" }, { urutan: "asc" }],
      include: { rute: { select: { nama: true } } },
    });
    return NextResponse.json(
      rows.map(({ rute, ...t }) => ({ ...t, nama_rute: rute.nama })),
    );
  } catch (e) {
    return apiError(e);
  }
}

export async function POST(req: NextRequest) {
  try {
    const data = await req.json().catch(() => null);
    requireFields(data, ["rute_id", "urutan", "nama", "jam"]);
    const created = await prisma.titik.create({
      data: {
        rute_id: Number(data.rute_id),
        urutan: Number(data.urutan),
        nama: data.nama,
        jam: data.jam,
      },
    });
    return NextResponse.json(created, { status: 201 });
  } catch (e) {
    return apiError(e);
  }
}
