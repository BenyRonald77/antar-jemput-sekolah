"use client";
import { useEffect, useState } from "react";

type Siswa = { id: number; nama: string; kelas: string; titik_id: number; ortu_nama: string; ortu_telepon: string; nama_titik: string; nama_rute: string };
type Titik = { id: number; nama: string; nama_rute: string };

async function api(url: string, method: string, body?: object) {
  const r = await fetch(url, {
    method,
    headers: { "Content-Type": "application/json" },
    body: body ? JSON.stringify(body) : undefined,
  });
  const j = await r.json().catch(() => ({}));
  if (!r.ok) throw new Error(j.error || "gagal");
  return j;
}

export default function SiswaPage() {
  const [rows, setRows] = useState<Siswa[]>([]);
  const [titiks, setTitiks] = useState<Titik[]>([]);
  const [err, setErr] = useState("");
  const [f, setF] = useState({ nama: "", kelas: "", titik_id: "", ortu_nama: "", ortu_telepon: "" });

  const muat = async () => {
    const [s, t] = await Promise.all([
      fetch("/api/siswa").then((x) => x.json()),
      fetch("/api/titik").then((x) => x.json()),
    ]);
    setRows(s); setTitiks(t);
    if (t[0] && !f.titik_id) setF((p) => ({ ...p, titik_id: String(t[0].id) }));
  };
  useEffect(() => { muat(); }, []);

  const tambah = async () => {
    setErr("");
    try {
      await api("/api/siswa", "POST", f);
      setF({ nama: "", kelas: "", titik_id: f.titik_id, ortu_nama: "", ortu_telepon: "" });
      muat();
    } catch (e: unknown) { setErr(e instanceof Error ? e.message : "gagal"); }
  };
  const hapus = async (id: number) => {
    if (!confirm("Hapus siswa ini?")) return;
    setErr("");
    try { await api(`/api/siswa/${id}`, "DELETE"); muat(); }
    catch (e: unknown) { setErr(e instanceof Error ? e.message : "gagal"); }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Siswa</h1>
      {err && <div className="rounded bg-red-100 p-3 text-sm text-red-700">{err}</div>}
      <div className="rounded border bg-white p-4">
        <h2 className="mb-3 font-semibold">Tambah Siswa</h2>
        <div className="grid gap-2 md:grid-cols-3">
          <input className="rounded border p-2 text-sm" placeholder="Nama" value={f.nama} onChange={(e) => setF({ ...f, nama: e.target.value })} />
          <input className="rounded border p-2 text-sm" placeholder="Kelas" value={f.kelas} onChange={(e) => setF({ ...f, kelas: e.target.value })} />
          <select className="rounded border p-2 text-sm" value={f.titik_id} onChange={(e) => setF({ ...f, titik_id: e.target.value })}>
            {titiks.map((t) => <option key={t.id} value={t.id}>{t.nama_rute} — {t.nama}</option>)}
          </select>
          <input className="rounded border p-2 text-sm" placeholder="Nama orang tua" value={f.ortu_nama} onChange={(e) => setF({ ...f, ortu_nama: e.target.value })} />
          <input className="rounded border p-2 text-sm" placeholder="Telepon orang tua" value={f.ortu_telepon} onChange={(e) => setF({ ...f, ortu_telepon: e.target.value })} />
          <button className="rounded bg-blue-600 px-3 py-2 text-sm text-white" onClick={tambah}>Tambah</button>
        </div>
      </div>
      <div className="rounded border bg-white p-4">
        <h2 className="mb-3 font-semibold">Daftar Siswa</h2>
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b text-left text-slate-500">
              <th className="py-2">Nama</th><th>Kelas</th><th>Titik</th><th>Rute</th><th>Ortu</th><th>Telepon</th><th></th>
            </tr>
          </thead>
          <tbody>
            {rows.map((s) => (
              <tr key={s.id} className="border-b">
                <td className="py-2 font-medium">{s.nama} <span className="text-xs text-slate-400">#{s.id}</span></td>
                <td>{s.kelas}</td><td>{s.nama_titik}</td><td>{s.nama_rute}</td>
                <td>{s.ortu_nama}</td><td>{s.ortu_telepon}</td>
                <td className="text-right"><button className="text-red-600" onClick={() => hapus(s.id)}>hapus</button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
