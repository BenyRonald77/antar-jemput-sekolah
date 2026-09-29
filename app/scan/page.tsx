"use client";
import { useEffect, useState } from "react";

type Siswa = { id: number; nama: string; kelas: string };

export default function ScanPage() {
  const [siswas, setSiswas] = useState<Siswa[]>([]);
  const [siswaId, setSiswaId] = useState("");
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);

  useEffect(() => {
    fetch("/api/siswa").then((r) => r.json()).then(setSiswas);
  }, []);

  const scan = async (jenis: "naik" | "turun") => {
    setMsg(null);
    const r = await fetch(`/api/scan/${jenis}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ siswa_id: Number(siswaId) }),
    });
    const j = await r.json();
    if (r.ok) {
      const jam = jenis === "naik" ? j.jam_naik : j.jam_turun;
      setMsg({ ok: true, text: `${j.siswa} scan ${jenis} tercatat jam ${jam}. Notifikasi terkirim ke ortu.` });
    } else {
      setMsg({ ok: false, text: j.error || "gagal" });
    }
  };

  return (
    <div className="mx-auto max-w-xl space-y-6">
      <h1 className="text-2xl font-bold">Scan Absen</h1>
      {msg && (
        <div className={`rounded p-3 text-sm ${msg.ok ? "bg-green-100 text-green-800" : "bg-red-100 text-red-700"}`}>
          {msg.text}
        </div>
      )}
      <div className="rounded border bg-white p-4">
        <label className="mb-2 block text-sm text-slate-500">Pilih siswa (simulasi scan kartu/QR)</label>
        <select
          className="mb-4 w-full rounded border p-2 text-sm"
          value={siswaId}
          onChange={(e) => setSiswaId(e.target.value)}
        >
          <option value="">— pilih siswa —</option>
          {siswas.map((s) => (
            <option key={s.id} value={s.id}>{s.nama} ({s.kelas})</option>
          ))}
        </select>
        <div className="flex gap-2">
          <button
            className="flex-1 rounded bg-blue-600 px-4 py-3 font-semibold text-white disabled:opacity-40"
            disabled={!siswaId}
            onClick={() => scan("naik")}
          >
            Scan Naik
          </button>
          <button
            className="flex-1 rounded bg-emerald-600 px-4 py-3 font-semibold text-white disabled:opacity-40"
            disabled={!siswaId}
            onClick={() => scan("turun")}
          >
            Scan Turun
          </button>
        </div>
      </div>
      <p className="text-sm text-slate-500">
        Scan naik membuat baris absen hari ini dan notifikasi &quot;dijemput&quot;.
        Scan turun menutup baris yang sama dan notifikasi &quot;tiba&quot;.
      </p>
    </div>
  );
}
