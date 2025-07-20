from flask import Blueprint, jsonify, request
from app.models.db import get_connection

phongchieu_bp = Blueprint('phongchieu', __name__)

# Lấy danh sách phòng chiếu
@phongchieu_bp.route('/', methods=['GET'])
def get_phongchieu():
    conn = None
    cursor = None
    try:
        conn = get_connection()
        cursor = conn.cursor(dictionary=True)
        cursor.execute("SELECT * FROM PhongChieu")
        data = cursor.fetchall()
        return jsonify(data)
    except Exception as e:
        return jsonify({"message": "Lỗi khi lấy danh sách phòng chiếu", "error": str(e)}), 500
    finally:
        if cursor:
            cursor.close()
        if conn:
            conn.close()

# Lấy chi tiết 1 phòng chiếu
@phongchieu_bp.route('/<int:ma_phong>', methods=['GET'])
def get_phongchieu_by_id(ma_phong):
    conn = None
    cursor = None
    try:
        conn = get_connection()
        cursor = conn.cursor(dictionary=True)
        cursor.execute("SELECT * FROM PhongChieu WHERE MaPhong = %s", (ma_phong,))
        data = cursor.fetchone()
        if data:
            return jsonify(data)
        else:
            return jsonify({"message": "Phòng chiếu không tồn tại"}), 404
    except Exception as e:
        return jsonify({"message": "Lỗi khi lấy thông tin phòng chiếu", "error": str(e)}), 500
    finally:
        if cursor:
            cursor.close()
        if conn:
            conn.close()

# Thêm phòng chiếu
@phongchieu_bp.route('/', methods=['POST'])
def add_phongchieu():
    data = request.get_json()
    ten_phong = data.get('TenPhong')
    loai_phong = data.get('LoaiPhong')

    conn = None
    cursor = None
    try:
        conn = get_connection()
        cursor = conn.cursor()
        cursor.execute("""
            INSERT INTO PhongChieu (TenPhong, LoaiPhong)
            VALUES (%s, %s)
        """, (ten_phong, loai_phong))
    
        # Lấy ID của phòng chiếu vừa được thêm
        ma_phong_moi = cursor.lastrowid
        conn.commit()
        
        # Lấy thông tin phòng chiếu vừa được thêm
        cursor.execute("SELECT * FROM PhongChieu WHERE MaPhong = %s", (ma_phong_moi,))
        phongchieu_moi = cursor.fetchone()

        if not phongchieu_moi:
            return jsonify({"message": "Không tìm thấy phòng chiếu vừa thêm"}), 404
        
        # Chuyển đổi tuple thành dictionary
        columns = ['MaPhong', 'TenPhong', 'LoaiPhong']
        phongchieu_dict = dict(zip(columns, phongchieu_moi))
        
        return jsonify({
            "message": "Thêm phòng chiếu thành công",
            "data": phongchieu_dict
        }), 201
    except Exception as e:
        if conn:
            conn.rollback()
        return jsonify({"message": "Lỗi khi thêm phòng chiếu", "error": str(e)}), 500
    finally:
        if cursor:
            cursor.close()
        if conn:
            conn.close()

# Cập nhật phòng chiếu (hỗ trợ partial update)
@phongchieu_bp.route('/<int:ma_phong>', methods=['PUT'])
def update_phongchieu(ma_phong):
    data = request.get_json()
    
    conn = None
    cursor = None
    try:
        # Kiểm tra xem phòng chiếu có tồn tại không
        conn = get_connection()
        cursor = conn.cursor(dictionary=True)
        cursor.execute("SELECT * FROM PhongChieu WHERE MaPhong = %s", (ma_phong,))
        existing_phongchieu = cursor.fetchone()
        
        if not existing_phongchieu:
            return jsonify({"message": "Phòng chiếu không tồn tại"}), 404
        
        # Tạo danh sách các trường cần cập nhật
        update_fields = []
        update_values = []
        
        # Chỉ cập nhật những trường có trong request data
        field_mapping = {
            'TenPhong': 'TenPhong',
            'LoaiPhong': 'LoaiPhong'
        }
        
        for field_name, db_column in field_mapping.items():
            if field_name in data and data[field_name] is not None:
                update_fields.append(f"{db_column} = %s")
                update_values.append(data[field_name])
        
        # Nếu không có trường nào để cập nhật
        if not update_fields:
            return jsonify({"message": "Không có dữ liệu để cập nhật"}), 400
        
        # Thực hiện cập nhật
        update_query = f"UPDATE PhongChieu SET {', '.join(update_fields)} WHERE MaPhong = %s"
        update_values.append(ma_phong)
        
        cursor.execute(update_query, update_values)
        conn.commit()
        
        # Lấy thông tin phòng chiếu sau khi cập nhật
        cursor.execute("SELECT * FROM PhongChieu WHERE MaPhong = %s", (ma_phong,))
        updated_phongchieu = cursor.fetchone()
        
        return jsonify({
            "message": "Cập nhật phòng chiếu thành công",
            "data": updated_phongchieu
        })
    except Exception as e:
        if conn:
            conn.rollback()
        return jsonify({"message": "Lỗi khi cập nhật phòng chiếu", "error": str(e)}), 500
    finally:
        if cursor:
            cursor.close()
        if conn:
            conn.close()

# Xóa phòng chiếu
@phongchieu_bp.route('/<int:ma_phong>', methods=['DELETE'])
def delete_phongchieu(ma_phong):
    conn = None
    cursor = None
    try:
        conn = get_connection()
        cursor = conn.cursor()
        cursor.execute("DELETE FROM PhongChieu WHERE MaPhong = %s", (ma_phong,))
        conn.commit()
        affected_rows = cursor.rowcount

        if affected_rows > 0:
            return jsonify({"message": "Xóa phòng chiếu thành công"})
        else:
            return jsonify({"message": "Phòng chiếu không tồn tại"}), 404
    except Exception as e:
        if conn:
            conn.rollback()
        return jsonify({"message": "Lỗi khi xóa phòng chiếu", "error": str(e)}), 500
    finally:
        if cursor:
            cursor.close()
        if conn:
            conn.close()
