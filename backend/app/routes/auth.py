from flask import Blueprint, request, jsonify
from flask_jwt_extended import create_access_token, jwt_required, get_jwt_identity
import re

auth_bp = Blueprint('auth', __name__)

# Danh sách tài khoản hard-coded
VALID_USERS = {
    "admin@cinema.com": "admin@123"
}

@auth_bp.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    email = data.get('email')
    password = data.get('password')
    
    # Kiểm tra định dạng email
    if not email or not re.match(r"[^@]+@[^@]+\.com$", email):
        return jsonify({"detail": "Invalid email format"}), 400
    
    # Kiểm tra thông tin đăng nhập
    if VALID_USERS.get(email) != password:
        return jsonify({"detail": "Invalid email or password"}), 401
    
    # Tạo JWT token
    access_token = create_access_token(identity=email)
    return jsonify({"access_token": access_token, "token_type": "bearer"}), 200

@auth_bp.route('/protected', methods=['GET'])
@jwt_required()
def protected():
    current_user = get_jwt_identity()
    return jsonify({"message": f"Welcome {current_user} to protected route"}), 200