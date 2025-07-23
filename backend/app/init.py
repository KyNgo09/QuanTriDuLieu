from flask import Flask, jsonify, request
from flask_cors import CORS
from app.routes import phim_bp, phongchieu_bp, suatchieu_bp, ghe_bp, combo_bp, khachhang_bp, ve_bp, hoadon_bp, thongke_bp
from flask_jwt_extended import JWTManager, verify_jwt_in_request, get_jwt_identity
from functools import wraps
from app.routes.auth import auth_bp
from dotenv import load_dotenv
import os


def create_app():
    app = Flask(__name__)
    
    # Tải biến môi trường
    load_dotenv()
    app.config['JWT_SECRET_KEY'] = os.getenv('JWT_SECRET_KEY') or 'fallback-secret-key'
    app.config['JWT_TOKEN_LOCATION'] = ['headers']
    
    # Khởi tạo CORS và JWTManager
    CORS(app, resources={r"/api/*": {"origins": "*"}})  # Thay bằng domain cụ thể nếu triển khai thực tế
    JWTManager(app)

    # Middleware để bảo vệ tất cả các route /api/*
    @app.before_request
    def require_jwt_for_api():
        # Bỏ qua yêu cầu OPTIONS để tránh lỗi CORS
        if request.method == 'OPTIONS':
            return
        # Bỏ qua các route không yêu cầu JWT
        if request.path.startswith(('/api/auth/login', '/api/thongke/')):
            return
        # Yêu cầu JWT cho các route /api/* khác
        if request.path.startswith('/api/'):
            try:
                verify_jwt_in_request()
                # Lưu thông tin người dùng vào request
                request.current_user = get_jwt_identity()
            except Exception as e:
                return jsonify({"msg": "Missing or invalid JWT token"}), 401
    
    
    app.register_blueprint(phim_bp, url_prefix='/api/phim')  # Register phim blueprint with a URL prefix
    app.register_blueprint(phongchieu_bp, url_prefix='/api/phongchieu')  # Register phongchieu blueprint with a URL prefix
    app.register_blueprint(suatchieu_bp, url_prefix='/api/suatchieu')  # Register suatchieu blueprint with a URL prefix
    app.register_blueprint(ghe_bp, url_prefix='/api/ghe')  # Register ghe blueprint with a URL prefix
    app.register_blueprint(combo_bp, url_prefix='/api/combo')  # Register combo blueprint with a URL prefix
    app.register_blueprint(khachhang_bp, url_prefix='/api/khachhang')  # Register khachhang blueprint with a URL prefix
    app.register_blueprint(ve_bp, url_prefix='/api/ve')  # Register ve blueprint with a URL prefix
    app.register_blueprint(hoadon_bp, url_prefix='/api/hoadon')  # Register hoadon blueprint with a URL prefix
    app.register_blueprint(thongke_bp, url_prefix='/api/thongke')  # Register thongke blueprint with a URL prefix
    app.register_blueprint(auth_bp, url_prefix='/api/auth')

    return app
