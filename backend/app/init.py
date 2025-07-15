from flask import Flask
from flask_cors import CORS
from app.routes import phim_bp, phongchieu_bp, suatchieu_bp, ghe_bp, combo_bp, khachhang_bp, ve_bp, hoadon_bp

def create_app():
    app = Flask(__name__)
    CORS(app)  # Enable CORS for all routes
    
    app.register_blueprint(phim_bp, url_prefix='/api/phim')  # Register phim blueprint with a URL prefix
    app.register_blueprint(phongchieu_bp, url_prefix='/api/phongchieu')  # Register phongchieu blueprint with a URL prefix
    app.register_blueprint(suatchieu_bp, url_prefix='/api/suatchieu')  # Register suatchieu blueprint with a URL prefix
    app.register_blueprint(ghe_bp, url_prefix='/api/ghe')  # Register ghe blueprint with a URL prefix
    app.register_blueprint(combo_bp, url_prefix='/api/combo')  # Register combo blueprint with a URL prefix
    app.register_blueprint(khachhang_bp, url_prefix='/api/khachhang')  # Register khachhang blueprint with a URL prefix
    app.register_blueprint(ve_bp, url_prefix='/api/ve')  # Register ve blueprint with a URL prefix
    app.register_blueprint(hoadon_bp, url_prefix='/api/hoadon')  # Register hoadon blueprint with a URL prefix
    return app
