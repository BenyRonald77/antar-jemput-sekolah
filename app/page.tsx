"use client";
import { useEffect, useState } from "react";

type Posisi = { mobil_id: number; plat: string; sopir: string; lat: number | null; lng: number | null; waktu: string | null };
type Absen = { id: number; siswa_id: number; tanggal: string; jam_naik: string | null; jam_turun: string | null; nama: string; kelas: string; plat: string | null };

export default function Dashboard() {
  const [posisi, setPosisi] = useState<Posisi[]>([]);
  const [absen, setAbsen] = useState<Absen[]>([]);

  const muat = async () => {
    const [p, a] = await Promise.all([
      fetch("/api/posisi").then((r) => r.json()),
      fetch("/api/absen").then((r) => r.json()),
    ]);
    setPosisi(p);
    setAbsen(a);
  };
  useEffect(() => {
    muat();
    const t = setInterval(muat, 15000);
    return () => clearInterval(t);
  }, []);

  const naik = absen.filter((x) => x.jam_naik && !x.jam_turun).length;
  const selesai = absen.filter((x) => x.jam_turun).length;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Dashboard Antar Jemput</h1>
      <div className="grid grid-cols-3 gap-4">
        {[
          ["Mobil", posisi.length],
          ["Naik (belum turun)", naik],
          ["Sudah tiba", selesai],
        ].map(([l, v]) => (
          <div key={l as string} className="rounded border bg-white p-4">
            <div className="text-sm text-slate-500">{l}</div>
            <div className="text-3xl font-bold">{v}</div>
          </div>
        ))}
      </div>

      <div className="rounded border bg-white p-4">
        <h2 className="mb-3 font-semibold">Posisi Terakhir Mobil</h2>
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b text-left text-slate-500">
              <th className="py-2">Plat</th>
              <th>Sopir</th>
              <th>Lat</th>
              <th>Lng</th>
              <th>Waktu</th>
            </tr>
          </thead>
          <tbody>
            {posisi.map((m) => (
              <tr key={m.mobil_id} className="border-b">
                <td className="py-2 font-medium">{m.plat}</td>
                <td>{m.sopir}</td>
                <td>{m.lat ?? "—"}</td>
                <td>{m.lng ?? "—"}</td>
                <td>{m.waktu ?? "—"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="rounded border bg-white p-4">
        <h2 className="mb-3 font-semibold">Absensi Hari Ini</h2>
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b text-left text-slate-500">
              <th className="py-2">Siswa</th>
              <th>Kelas</th>
              <th>Mobil</th>
              <th>Jam Naik</th>
              <th>Jam Turun</th>
            </tr>
          </thead>
          <tbody>
            {absen.map((a) => (
              <tr key={a.id} className="border-b">
                <td className="py-2">{a.nama}</td>
                <td>{a.kelas}</td>
                <td>{a.plat ?? "—"}</td>
                <td>{a.jam_naik ?? "—"}</td>
                <td>{a.jam_turun ?? "—"}</td>
              </tr>
            ))}
            {absen.length === 0 && (
              <tr><td colSpan={5} className="py-4 text-center text-slate-400">Belum ada absensi hari ini.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
