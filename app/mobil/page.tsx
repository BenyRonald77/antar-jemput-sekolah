"use client";
import { useEffect, useState } from "react";

type Mobil = { id: number; plat: string; sopir: string; kapasitas: number };
type Rute = { id: number; mobil_id: number; nama: string; plat: string };
type Titik = { id: number; rute_id: number; urutan: number; nama: string; jam: string; nama_rute: string };

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

export default function MobilRute() {
  const [mobils, setMobils] = useState<Mobil[]>([]);
  const [rutes, setRutes] = useState<Rute[]>([]);
  const [titiks, setTitiks] = useState<Titik[]>([]);
  const [err, setErr] = useState("");

  const [fm, setFm] = useState({ plat: "", sopir: "", kapasitas: "" });
  const [fr, setFr] = useState({ mobil_id: "", nama: "" });
  const [ft, setFt] = useState({ rute_id: "", urutan: "", nama: "", jam: "" });

  const muat = async () => {
    const [m, r, t] = await Promise.all([
      fetch("/api/mobil").then((x) => x.json()),
      fetch("/api/rute").then((x) => x.json()),
      fetch("/api/titik").then((x) => x.json()),
    ]);
    setMobils(m); setRutes(r); setTitiks(t);
    if (m[0] && !fr.mobil_id) setFr((p) => ({ ...p, mobil_id: String(m[0].id) }));
    if (r[0] && !ft.rute_id) setFt((p) => ({ ...p, rute_id: String(r[0].id) }));
  };
  useEffect(() => { muat(); }, []);

  const tambah = async (url: string, body: object, reset: () => void) => {
    setErr("");
    try { await api(url, "POST", body); reset(); muat(); }
    catch (e: unknown) { setErr(e instanceof Error ? e.message : "gagal"); }
  };
  const hapus = async (url: string) => {
    if (!confirm("Hapus data ini?")) return;
    setErr("");
    try { await api(url, "DELETE"); muat(); }
    catch (e: unknown) { setErr(e instanceof Error ? e.message : "gagal"); }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Mobil &amp; Rute</h1>
      {err && <div className="rounded bg-red-100 p-3 text-sm text-red-700">{err}</div>}

      <div className="grid gap-6 md:grid-cols-2">
        <div className="rounded border bg-white p-4">
          <h2 className="mb-3 font-semibold">Mobil</h2>
          <div className="mb-3 flex gap-2">
            <input className="w-28 rounded border p-2 text-sm" placeholder="Plat" value={fm.plat} onChange={(e) => setFm({ ...fm, plat: e.target.value })} />
            <input className="flex-1 rounded border p-2 text-sm" placeholder="Sopir" value={fm.sopir} onChange={(e) => setFm({ ...fm, sopir: e.target.value })} />
            <input className="w-20 rounded border p-2 text-sm" placeholder="Kap." type="number" value={fm.kapasitas} onChange={(e) => setFm({ ...fm, kapasitas: e.target.value })} />
            <button className="rounded bg-blue-600 px-3 py-2 text-sm text-white" onClick={() => tambah("/api/mobil", fm, () => setFm({ plat: "", sopir: "", kapasitas: "" }))}>Tambah</button>
          </div>
          <table className="w-full text-sm">
            <thead><tr className="border-b text-left text-slate-500"><th className="py-1">Plat</th><th>Sopir</th><th>Kap.</th><th></th></tr></thead>
            <tbody>
              {mobils.map((m) => (
                <tr key={m.id} className="border-b">
                  <td className="py-1 font-medium">{m.plat}</td><td>{m.sopir}</td><td>{m.kapasitas}</td>
                  <td className="text-right"><button className="text-red-600" onClick={() => hapus(`/api/mobil/${m.id}`)}>hapus</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="rounded border bg-white p-4">
          <h2 className="mb-3 font-semibold">Rute</h2>
          <div className="mb-3 flex gap-2">
            <select className="rounded border p-2 text-sm" value={fr.mobil_id} onChange={(e) => setFr({ ...fr, mobil_id: e.target.value })}>
              {mobils.map((m) => <option key={m.id} value={m.id}>{m.plat}</option>)}
            </select>
            <input className="flex-1 rounded border p-2 text-sm" placeholder="Nama rute" value={fr.nama} onChange={(e) => setFr({ ...fr, nama: e.target.value })} />
            <button className="rounded bg-blue-600 px-3 py-2 text-sm text-white" onClick={() => tambah("/api/rute", fr, () => setFr({ mobil_id: fr.mobil_id, nama: "" }))}>Tambah</button>
          </div>
          <table className="w-full text-sm">
            <thead><tr className="border-b text-left text-slate-500"><th className="py-1">Rute</th><th>Mobil</th><th></th></tr></thead>
            <tbody>
              {rutes.map((r) => (
                <tr key={r.id} className="border-b">
                  <td className="py-1 font-medium">{r.nama}</td><td>{r.plat}</td>
                  <td className="text-right"><button className="text-red-600" onClick={() => hapus(`/api/rute/${r.id}`)}>hapus</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="rounded border bg-white p-4">
        <h2 className="mb-3 font-semibold">Titik Penjemputan</h2>
        <div className="mb-3 flex gap-2">
          <select className="rounded border p-2 text-sm" value={ft.rute_id} onChange={(e) => setFt({ ...ft, rute_id: e.target.value })}>
            {rutes.map((r) => <option key={r.id} value={r.id}>{r.nama}</option>)}
          </select>
          <input className="w-20 rounded border p-2 text-sm" placeholder="Urut" type="number" value={ft.urutan} onChange={(e) => setFt({ ...ft, urutan: e.target.value })} />
          <input className="flex-1 rounded border p-2 text-sm" placeholder="Nama titik" value={ft.nama} onChange={(e) => setFt({ ...ft, nama: e.target.value })} />
          <input className="w-28 rounded border p-2 text-sm" placeholder="Jam (06:00)" value={ft.jam} onChange={(e) => setFt({ ...ft, jam: e.target.value })} />
          <button className="rounded bg-blue-600 px-3 py-2 text-sm text-white" onClick={() => tambah("/api/titik", ft, () => setFt({ rute_id: ft.rute_id, urutan: "", nama: "", jam: "" }))}>Tambah</button>
        </div>
        <table className="w-full text-sm">
          <thead><tr className="border-b text-left text-slate-500"><th className="py-1">Rute</th><th>Urut</th><th>Titik</th><th>Jam</th><th></th></tr></thead>
          <tbody>
            {titiks.map((t) => (
              <tr key={t.id} className="border-b">
                <td className="py-1">{t.nama_rute}</td><td>{t.urutan}</td><td className="font-medium">{t.nama}</td><td>{t.jam}</td>
                <td className="text-right"><button className="text-red-600" onClick={() => hapus(`/api/titik/${t.id}`)}>hapus</button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
