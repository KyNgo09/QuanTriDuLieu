from flask import Flask
from app.routes.phim import phim_bp

def create_app():
    app = Flask(__name__)
    app.register_blueprint(phim_bp)
    return app
