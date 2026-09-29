import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { apiError, requireFields } from "@/lib/jemput";

export async function GET() {
  try {
    const rows = await prisma.mobil.findMany({ orderBy: { plat: "asc" } });
    return NextResponse.json(rows);
  } catch (e) {
    return apiError(e);
  }
}

export async function POST(req: NextRequest) {
  try {
    const data = await req.json().catch(() => null);
    requireFields(data, ["plat", "sopir", "kapasitas"]);
    const created = await prisma.mobil.create({
      data: {
        plat: data.plat,
        sopir: data.sopir,
        kapasitas: Number(data.kapasitas),
      },
    });
    return NextResponse.json(created, { status: 201 });
  } catch (e) {
    return apiError(e);
  }
}
