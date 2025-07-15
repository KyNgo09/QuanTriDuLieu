from flask import Blueprint, jsonify, request
from app.models.db import get_connection

phim_bp = Blueprint('phim', __name__)

# Lấy danh sách phim
@phim_bp.route('/', methods=['GET'])
def get_phim():
    conn = None
    cursor = None
    try:
        conn = get_connection()
        cursor = conn.cursor(dictionary=True)
        cursor.execute("SELECT * FROM Phim")
        data = cursor.fetchall()
        return jsonify(data)
    except Exception as e:
        return jsonify({"message": "Lỗi khi lấy danh sách phim", "error": str(e)}), 500
    finally:
        if cursor:
            cursor.close()
        if conn:
            conn.close()

# Lấy chi tiết 1 phim theo MaPhim
@phim_bp.route('/<int:ma_phim>', methods=['GET'])
def get_phim_by_id(ma_phim):
    conn = None
    cursor = None
    try:
        conn = get_connection()
        cursor = conn.cursor(dictionary=True)
        cursor.execute("SELECT * FROM Phim WHERE MaPhim = %s", (ma_phim,))
        data = cursor.fetchone()
        if data:
            return jsonify(data)
        else:
            return jsonify({"message": "Phim không tồn tại"}), 404
    except Exception as e:
        return jsonify({"message": "Lỗi khi lấy thông tin phim", "error": str(e)}), 500
    finally:
        if cursor:
            cursor.close()
        if conn:
            conn.close()

# Thêm phim mới
@phim_bp.route('/', methods=['POST'])
def create_phim():
    data = request.get_json()

    ten_phim = data.get('TenPhim')
    the_loai = data.get('TheLoai')
    dao_dien = data.get('DaoDien')
    thoi_luong = data.get('ThoiLuong')
    ngay_khoi_chieu = data.get('NgayKhoiChieu')
    do_tuoi_cho_phep = data.get('DoTuoiChoPhep')

    conn = None
    cursor = None
    try:
        conn = get_connection()
        cursor = conn.cursor()
        cursor.execute("""
            INSERT INTO Phim (TenPhim, TheLoai, DaoDien, ThoiLuong, NgayKhoiChieu, DoTuoiChoPhep)
            VALUES (%s, %s, %s, %s, %s, %s)
        """, (ten_phim, the_loai, dao_dien, thoi_luong, ngay_khoi_chieu, do_tuoi_cho_phep))
        
        # Lấy ID của phim vừa được thêm
        ma_phim_moi = cursor.lastrowid
        conn.commit()
        
        # Lấy thông tin phim vừa được thêm
        cursor.execute("SELECT * FROM Phim WHERE MaPhim = %s", (ma_phim_moi,))
        phim_moi = cursor.fetchone()
        
        # Chuyển đổi tuple thành dictionary
        columns = ['MaPhim', 'TenPhim', 'TheLoai', 'DaoDien', 'ThoiLuong', 'NgayKhoiChieu', 'DoTuoiChoPhep']
        phim_dict = dict(zip(columns, phim_moi))
        
        return jsonify({
            "message": "Thêm phim thành công",
            "data": phim_dict
        }), 201
    except Exception as e:
        if conn:
            conn.rollback()
        return jsonify({"message": "Lỗi khi thêm phim", "error": str(e)}), 500
    finally:
        if cursor:
            cursor.close()
        if conn:
            conn.close()

# Cập nhật phim (hỗ trợ partial update)
@phim_bp.route('/<int:ma_phim>', methods=['PUT'])
def update_phim(ma_phim):
    data = request.get_json()
    
    conn = None
    cursor = None
    try:
        # Kiểm tra xem phim có tồn tại không
        conn = get_connection()
        cursor = conn.cursor(dictionary=True)
        cursor.execute("SELECT * FROM Phim WHERE MaPhim = %s", (ma_phim,))
        existing_phim = cursor.fetchone()
        
        if not existing_phim:
            return jsonify({"message": "Phim không tồn tại"}), 404
        
        # Tạo danh sách các trường cần cập nhật
        update_fields = []
        update_values = []
        
        # Chỉ cập nhật những trường có trong request data
        field_mapping = {
            'TenPhim': 'TenPhim',
            'TheLoai': 'TheLoai', 
            'DaoDien': 'DaoDien',
            'ThoiLuong': 'ThoiLuong',
            'NgayKhoiChieu': 'NgayKhoiChieu',
            'DoTuoiChoPhep': 'DoTuoiChoPhep'
        }
        
        for field_name, db_column in field_mapping.items():
            if field_name in data and data[field_name] is not None:
                update_fields.append(f"{db_column} = %s")
                update_values.append(data[field_name])
        
        # Nếu không có trường nào để cập nhật
        if not update_fields:
            return jsonify({"message": "Không có dữ liệu để cập nhật"}), 400
        
        # Thực hiện cập nhật
        update_query = f"UPDATE Phim SET {', '.join(update_fields)} WHERE MaPhim = %s"
        update_values.append(ma_phim)
        
        cursor.execute(update_query, update_values)
        conn.commit()
        
        # Lấy thông tin phim sau khi cập nhật
        cursor.execute("SELECT * FROM Phim WHERE MaPhim = %s", (ma_phim,))
        updated_phim = cursor.fetchone()
        
        return jsonify({
            "message": "Cập nhật phim thành công",
            "data": updated_phim
        })
    except Exception as e:
        if conn:
            conn.rollback()
        return jsonify({"message": "Lỗi khi cập nhật phim", "error": str(e)}), 500
    finally:
        if cursor:
            cursor.close()
        if conn:
            conn.close()

# Xóa phim
@phim_bp.route('/<int:ma_phim>', methods=['DELETE'])
def delete_phim(ma_phim):
    conn = None
    cursor = None
    try:
        conn = get_connection()
        cursor = conn.cursor()
        cursor.execute("DELETE FROM Phim WHERE MaPhim = %s", (ma_phim,))
        conn.commit()
        affected_rows = cursor.rowcount

        if affected_rows > 0:
            return jsonify({"message": "Xóa phim thành công"})
        else:
            return jsonify({"message": "Phim không tồn tại"}), 404
    except Exception as e:
        if conn:
            conn.rollback()
        return jsonify({"message": "Lỗi khi xóa phim", "error": str(e)}), 500
    finally:
        if cursor:
            cursor.close()
        if conn:
            conn.close()
