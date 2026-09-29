"""Posisi realtime + absensi harian + log notifikasi."""
from datetime import datetime

from flask import Blueprint, jsonify, request

from jemput.api import _dicts
from jemput.db import get_conn

pan_bp = Blueprint("pantau", __name__, url_prefix="/api")


@pan_bp.post("/posisi")
def lapor_posisi():
    """{"mobil_id":.., "lat":.., "lng":..}: simpan posisi kendaraan."""
    data = request.get_json(force=True)
    for f in ("mobil_id", "lat", "lng"):
        if data.get(f) is None:
            return jsonify({"error": f"field wajib: {f}"}), 400
    conn = get_conn()
    try:
        if conn.execute("SELECT id FROM mobil WHERE id = ?",
                        (data["mobil_id"],)).fetchone() is None:
            return jsonify({"error": "mobil tidak ditemukan"}), 404
        waktu = datetime.now().isoformat(timespec="seconds")
        cur = conn.execute(
            "INSERT INTO posisi (mobil_id, lat, lng, waktu) VALUES (?, ?, ?, ?)",
            (data["mobil_id"], float(data["lat"]), float(data["lng"]), waktu))
        conn.commit()
        return jsonify({"id": cur.lastrowid, "waktu": waktu}), 201
    finally:
        conn.close()


@pan_bp.get("/posisi")
def posisi_terakhir():
    """Posisi terbaru tiap mobil."""
    conn = get_conn()
    try:
        return jsonify(_dicts(conn.execute(
            """SELECT m.id AS mobil_id, m.plat, m.sopir, p.lat, p.lng, p.waktu
               FROM mobil m LEFT JOIN posisi p ON p.id = (
                 SELECT id FROM posisi WHERE mobil_id = m.id
                 ORDER BY waktu DESC, id DESC LIMIT 1)
               ORDER BY m.plat""")))
    finally:
        conn.close()


@pan_bp.get("/absen")
def absen_harian():
    """Absensi per tanggal (default hari ini)."""
    tanggal = request.args.get("tanggal") or datetime.now().date().isoformat()
    conn = get_conn()
    try:
        return jsonify(_dicts(conn.execute(
            """SELECT a.*, s.nama, s.kelas, m.plat FROM absen a
               JOIN siswa s ON s.id = a.siswa_id
               LEFT JOIN mobil m ON m.id = a.mobil_id
               WHERE a.tanggal = ? ORDER BY s.nama""", (tanggal,))))
    finally:
        conn.close()


@pan_bp.get("/notifikasi")
def list_notifikasi():
    conn = get_conn()
    try:
        return jsonify(_dicts(conn.execute(
            """SELECT n.*, s.nama, s.ortu_nama, s.ortu_telepon FROM notifikasi n
               JOIN siswa s ON s.id = n.siswa_id
               ORDER BY n.waktu DESC, n.id DESC LIMIT 100""")))
    finally:
        conn.close()
