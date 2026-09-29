import { Prisma, PrismaClient } from "@prisma/client";
import { NextResponse } from "next/server";

export class ApiError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

type Tx = PrismaClient | Prisma.TransactionClient;

/** Waktu lokal presisi detik, setara datetime.now().isoformat(timespec="seconds") Python. */
export function nowIso(): string {
  const d = new Date();
  const p = (n: number) => String(n).padStart(2, "0");
  return (
    `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}` +
    `T${p(d.getHours())}:${p(d.getMinutes())}:${p(d.getSeconds())}`
  );
}

export function hariIni(): string {
  return nowIso().slice(0, 10);
}

export function jamSkr(): string {
  return nowIso().slice(11, 16);
}

/** Catat notifikasi (hanya log; pengiriman SMS/WA di luar cakupan). */
export async function catatNotifikasi(
  tx: Tx,
  siswa_id: number,
  tanggal: string,
  waktu: string,
  jenis: "dijemput" | "tiba",
  pesan: string,
) {
  await tx.notifikasi.create({
    data: { siswa_id, tanggal, waktu, jenis, pesan },
  });
}

/** Validasi field wajib; lempar ApiError 400 jika ada yang hilang. */
export function requireFields(data: unknown, fields: string[]): void {
  const d = data as Record<string, unknown> | null;
  const missing = fields.filter(
    (f) => !d || d[f] === undefined || d[f] === null || d[f] === "",
  );
  if (missing.length) throw new ApiError(400, `field wajib: ${missing.join(", ")}`);
}

/** Konversi error Prisma menjadi ApiError dengan status yang setara Python. */
export function toApiError(e: unknown): ApiError {
  if (e instanceof ApiError) return e;
  if (e instanceof Prisma.PrismaClientKnownRequestError) {
    if (e.code === "P2025") return new ApiError(404, "tidak ditemukan");
    if (e.code === "P2002") return new ApiError(400, "data duplikat (unique constraint)");
    if (e.code === "P2003") return new ApiError(400, "data masih dipakai/direferensi");
  }
  const msg = e instanceof Error ? e.message : String(e);
  return new ApiError(400, msg);
}

export function apiError(e: unknown) {
  const err = toApiError(e);
  return NextResponse.json({ error: err.message }, { status: err.status });
}
