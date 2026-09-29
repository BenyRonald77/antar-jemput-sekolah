import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { ApiError, apiError, nowIso } from "@/lib/jemput";

export async function GET() {
  try {
    const mobils = await prisma.mobil.findMany({
      orderBy: { plat: "asc" },
      include: {
        posisis: {
          orderBy: [{ waktu: "desc" }, { id: "desc" }],
          take: 1,
        },
      },
    });
    return NextResponse.json(
      mobils.map((m) => {
        const p = m.posisis[0] ?? null;
        return {
          mobil_id: m.id,
          plat: m.plat,
          sopir: m.sopir,
          lat: p?.lat ?? null,
          lng: p?.lng ?? null,
          waktu: p?.waktu ?? null,
        };
      }),
    );
  } catch (e) {
    return apiError(e);
  }
}

export async function POST(req: NextRequest) {
  try {
    const data = await req.json().catch(() => null);
    for (const f of ["mobil_id", "lat", "lng"]) {
      if (!data || data[f] === undefined || data[f] === null)
        throw new ApiError(400, `field wajib: ${f}`);
    }
    const mobil = await prisma.mobil.findUnique({
      where: { id: Number(data.mobil_id) },
      select: { id: true },
    });
    if (!mobil) throw new ApiError(404, "mobil tidak ditemukan");
    const waktu = nowIso();
    const cur = await prisma.posisi.create({
      data: {
        mobil_id: mobil.id,
        lat: Number(data.lat),
        lng: Number(data.lng),
        waktu,
      },
    });
    return NextResponse.json({ id: cur.id, waktu }, { status: 201 });
  } catch (e) {
    return apiError(e);
  }
}
