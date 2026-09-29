"""Halaman UI."""
from flask import Blueprint, render_template

pages_bp = Blueprint("pages", __name__)


@pages_bp.get("/")
def dashboard():
    return render_template("dashboard.html")


@pages_bp.get("/mobil")
def mobil():
    return render_template("mobil.html")


@pages_bp.get("/siswa")
def siswa():
    return render_template("siswa.html")


@pages_bp.get("/scan")
def scan():
    return render_template("scan.html")


@pages_bp.get("/notifikasi")
def notifikasi():
    return render_template("notifikasi.html")
