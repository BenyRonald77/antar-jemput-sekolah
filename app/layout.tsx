import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Antar Jemput Sekolah",
  description: "Rute, absen scan naik-turun, posisi realtime, dan notifikasi ortu",
};

const NAV = [
  { href: "/", label: "Dashboard" },
  { href: "/mobil", label: "Mobil & Rute" },
  { href: "/siswa", label: "Siswa" },
  { href: "/scan", label: "Scan Absen" },
  { href: "/notifikasi", label: "Notifikasi" },
];

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id">
      <body className="min-h-screen text-slate-900">
        <header className="bg-slate-900 text-white">
          <div className="mx-auto max-w-6xl px-4 py-4">
            <h1 className="text-xl font-bold">Titip Jual / Konsinyasi</h1>
            <nav className="mt-2 flex flex-wrap gap-2">
              {NAV.map((n) => (
                <a
                  key={n.href}
                  href={n.href}
                  className="rounded bg-slate-700 px-3 py-1.5 text-sm hover:bg-slate-600"
                >
                  {n.label}
                </a>
              ))}
            </nav>
          </div>
        </header>
        <main className="mx-auto max-w-6xl px-4 py-6">{children}</main>
      </body>
    </html>
  );
}
