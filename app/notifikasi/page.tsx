"use client";
import { useEffect, useState } from "react";

type Notif = {
  id: number; siswa_id: number; tanggal: string; waktu: string;
  jenis: "dijemput" | "tiba"; pesan: string;
  nama: string; ortu_nama: string | null; ortu_telepon: string | null;
};

export default function NotifikasiPage() {
  const [rows, setRows] = useState<Notif[]>([]);

  useEffect(() => {
    fetch("/api/notifikasi").then((r) => r.json()).then(setRows);
  }, []);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Notifikasi Orang Tua</h1>
      <p className="text-sm text-slate-500">
        Log tercatat (pengiriman SMS/WA sungguhan di luar cakupan).
      </p>
      <div className="rounded border bg-white p-4">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b text-left text-slate-500">
              <th className="py-2">Waktu</th><th>Siswa</th><th>Jenis</th><th>Pesan</th><th>Tujuan</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((n) => (
              <tr key={n.id} className="border-b">
                <td className="py-2">{n.waktu}</td>
                <td>{n.nama}</td>
                <td>
                  <span className={`rounded px-2 py-0.5 text-xs font-semibold ${n.jenis === "dijemput" ? "bg-blue-100 text-blue-700" : "bg-emerald-100 text-emerald-700"}`}>
                    {n.jenis}
                  </span>
                </td>
                <td>{n.pesan}</td>
                <td>{n.ortu_nama} ({n.ortu_telepon})</td>
              </tr>
            ))}
            {rows.length === 0 && (
              <tr><td colSpan={5} className="py-4 text-center text-slate-400">Belum ada notifikasi.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
