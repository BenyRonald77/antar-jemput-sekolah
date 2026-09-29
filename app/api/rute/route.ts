import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { apiError, requireFields } from "@/lib/jemput";

export async function GET() {
  try {
    const rows = await prisma.rute.findMany({
      orderBy: { nama: "asc" },
      include: { mobil: { select: { plat: true } } },
    });
    return NextResponse.json(
      rows.map(({ mobil, ...r }) => ({ ...r, plat: mobil.plat })),
    );
  } catch (e) {
    return apiError(e);
  }
}

export async function POST(req: NextRequest) {
  try {
    const data = await req.json().catch(() => null);
    requireFields(data, ["mobil_id", "nama"]);
    const created = await prisma.rute.create({
      data: { mobil_id: Number(data.mobil_id), nama: data.nama },
    });
    return NextResponse.json(created, { status: 201 });
  } catch (e) {
    return apiError(e);
  }
}
