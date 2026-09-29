"""CRUD mobil/rute/titik/siswa + scan naik/turun (+notifikasi ortu)."""
from datetime import datetime

from flask import Blueprint, jsonify, request

from jemput.db import get_conn

api_bp = Blueprint("api", __name__, url_prefix="/api")


def _dicts(cur):
    return [dict(r) for r in cur.fetchall()]


def _now():
    n = datetime.now()
    return n.date().isoformat(), n.isoformat(timespec="seconds")


def _notif(conn, siswa_id: int, tanggal: str, waktu: str, jenis: str, pesan: str):
    conn.execute(
        "INSERT INTO notifikasi (siswa_id, tanggal, waktu, jenis, pesan)"
        " VALUES (?, ?, ?, ?, ?)", (siswa_id, tanggal, waktu, jenis, pesan))


def _crud(table: str, fields: list[str], order: str = "id"):
    base = "/" + table

    @api_bp.get(base, endpoint=f"list_{table}")
    def list_():
        conn = get_conn()
        try:
            if table == "rute":
                rows = _dicts(conn.execute(
                    """SELECT r.*, m.plat FROM rute r
                       JOIN mobil m ON m.id = r.mobil_id ORDER BY r.nama"""))
            elif table == "titik":
                rows = _dicts(conn.execute(
                    """SELECT t.*, r.nama AS nama_rute FROM titik t
                       JOIN rute r ON r.id = t.rute_id
                       ORDER BY t.rute_id, t.urutan"""))
            elif table == "siswa":
                rows = _dicts(conn.execute(
                    """SELECT s.*, t.nama AS nama_titik, r.nama AS nama_rute
                       FROM siswa s JOIN titik t ON t.id = s.titik_id
                       JOIN rute r ON r.id = t.rute_id
                       ORDER BY s.kelas, s.nama"""))
            else:
                rows = _dicts(conn.execute(f"SELECT * FROM {table} ORDER BY {order}"))
            return jsonify(rows)
        finally:
            conn.close()

    @api_bp.post(base, endpoint=f"create_{table}")
    def create():
        data = request.get_json(force=True)
        missing = [f for f in fields if f not in data or data[f] in (None, "")]
        if missing:
            return jsonify({"error": f"field wajib: {', '.join(missing)}"}), 400
        conn = get_conn()
        try:
            cur = conn.execute(
                f"INSERT INTO {table} ({', '.join(fields)})"
                f" VALUES ({', '.join('?' for _ in fields)})",
                [data[f] for f in fields])
            conn.commit()
            return jsonify(dict(conn.execute(
                f"SELECT * FROM {table} WHERE id = ?", (cur.lastrowid,)).fetchone())), 201
        except Exception as e:  # noqa: BLE001
            return jsonify({"error": str(e)}), 400
        finally:
            conn.close()

    @api_bp.delete(f"{base}/<int:row_id>", endpoint=f"delete_{table}")
    def delete(row_id: int):
        conn = get_conn()
        try:
            cur = conn.execute(f"DELETE FROM {table} WHERE id = ?", (row_id,))
            conn.commit()
            if cur.rowcount == 0:
                return jsonify({"error": "tidak ditemukan"}), 404
            return jsonify({"ok": True})
        except Exception as e:  # noqa: BLE001
            return jsonify({"error": str(e)}), 400
        finally:
            conn.close()


_crud("mobil", ["plat", "sopir", "kapasitas"], order="plat")
_crud("rute", ["mobil_id", "nama"])
_crud("titik", ["rute_id", "urutan", "nama", "jam"])
_crud("siswa", ["nama", "kelas", "titik_id", "ortu_nama", "ortu_telepon"])


# ---------- scan ----------

@api_bp.post("/scan/naik")
def scan_naik():
    """{"siswa_id": ..}: catat naik + notifikasi 'dijemput' ke ortu."""
    data = request.get_json(force=True)
    if not data.get("siswa_id"):
        return jsonify({"error": "siswa_id wajib"}), 400
    tanggal, waktu = _now()
    jam = waktu[11:16]
    conn = get_conn()
    try:
        s = conn.execute(
            """SELECT s.*, t.rute_id FROM siswa s
               JOIN titik t ON t.id = s.titik_id WHERE s.id = ?""",
            (data["siswa_id"],)).fetchone()
        if s is None:
            return jsonify({"error": "siswa tidak ditemukan"}), 404
        ada = conn.execute("SELECT * FROM absen WHERE siswa_id = ? AND tanggal = ?",
                           (s["id"], tanggal)).fetchone()
        if ada and ada["jam_naik"]:
            return jsonify({"error": f"{s['nama']} sudah scan naik jam {ada['jam_naik']}"}), 409
        r = conn.execute("SELECT mobil_id FROM rute WHERE id = ?",
                         (s["rute_id"],)).fetchone()
        mobil_id = r["mobil_id"] if r else None
        conn.execute(
            "INSERT INTO absen (siswa_id, tanggal, jam_naik, mobil_id)"
            " VALUES (?, ?, ?, ?)", (s["id"], tanggal, jam, mobil_id))
        _notif(conn, s["id"], tanggal, waktu, "dijemput",
               f"{s['nama']} sudah dijemput jam {jam}.")
        conn.commit()
        return jsonify({"siswa": s["nama"], "jam_naik": jam}), 201
    finally:
        conn.close()


@api_bp.post("/scan/turun")
def scan_turun():
    """{"siswa_id": ..}: catat turun + notifikasi 'tiba' ke ortu."""
    data = request.get_json(force=True)
    if not data.get("siswa_id"):
        return jsonify({"error": "siswa_id wajib"}), 400
    tanggal, waktu = _now()
    jam = waktu[11:16]
    conn = get_conn()
    try:
        s = conn.execute("SELECT * FROM siswa WHERE id = ?",
                         (data["siswa_id"],)).fetchone()
        if s is None:
            return jsonify({"error": "siswa tidak ditemukan"}), 404
        a = conn.execute("SELECT * FROM absen WHERE siswa_id = ? AND tanggal = ?",
                         (s["id"], tanggal)).fetchone()
        if a is None or not a["jam_naik"]:
            return jsonify({"error": f"{s['nama']} belum scan naik hari ini"}), 409
        if a["jam_turun"]:
            return jsonify({"error": f"{s['nama']} sudah scan turun jam {a['jam_turun']}"}), 409
        conn.execute("UPDATE absen SET jam_turun = ? WHERE id = ?", (jam, a["id"]))
        _notif(conn, s["id"], tanggal, waktu, "tiba",
               f"{s['nama']} sudah tiba jam {jam}.")
        conn.commit()
        return jsonify({"siswa": s["nama"], "jam_turun": jam})
    finally:
        conn.close()
