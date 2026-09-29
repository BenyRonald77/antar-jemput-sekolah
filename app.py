"""Aplikasi Flask antar jemput sekolah."""
from flask import Flask

from jemput.api import api_bp
from jemput.db import init_db
from jemput.pages import pages_bp
from jemput.pantau import pan_bp


def create_app() -> Flask:
    app = Flask(__name__)
    init_db()
    app.register_blueprint(api_bp)
    app.register_blueprint(pan_bp)
    app.register_blueprint(pages_bp)
    return app


if __name__ == "__main__":
    create_app().run(host="0.0.0.0", port=5008, debug=False)
