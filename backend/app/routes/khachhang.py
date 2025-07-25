from flask import Blueprint, jsonify, request
from app.models.db import get_connection

khachhang_bp = Blueprint('khachhang', __name__)

# Lấy tất cả khách hàng
@khachhang_bp.route('/', methods=['GET'])
def get_all_khachhang():
    conn = None
    cursor = None
    try:
        conn = get_connection()
        cursor = conn.cursor(dictionary=True)
        cursor.execute("""
            SELECT * FROM khachhang
        """)
        data = cursor.fetchall()
        return jsonify(data)
    except Exception as e:
        return jsonify({"message": "Lỗi khi lấy danh sách khách hàng", "error": str(e)}), 500
    finally:
        if cursor:
            cursor.close()
        if conn:
            conn.close()

# Lấy thông tin 1 khách hàng
@khachhang_bp.route('/<int:ma_kh>', methods=['GET'])
def get_khachhang_by_id(ma_kh):
    conn = None
    cursor = None
    try:
        conn = get_connection()
        cursor = conn.cursor(dictionary=True)
        cursor.execute("""
            SELECT * FROM khachhang WHERE MaKH = %s
        """, (ma_kh,))
        data = cursor.fetchone()
        if data:
            return jsonify(data)
        else:
            return jsonify({"message": "Khách hàng không tồn tại"}), 404
    except Exception as e:
        return jsonify({"message": "Lỗi khi lấy thông tin khách hàng", "error": str(e)}), 500
    finally:
        if cursor:
            cursor.close()
        if conn:
            conn.close()

# Thêm khách hàng mới
@khachhang_bp.route('', methods=['POST'])
@khachhang_bp.route('/', methods=['POST'])
def create_khachhang():
    data = request.get_json()
    ten_kh = data.get('TenKH')
    sdt = data.get('SDT')
    email = data.get('Email')

    conn = None
    cursor = None
    try:
        conn = get_connection()
        cursor = conn.cursor()
        cursor.execute("""
            INSERT INTO khachhang (TenKH, SDT, Email)
            VALUES (%s, %s, %s)
        """, (ten_kh, sdt, email))
        
        # Lấy ID của khách hàng vừa được thêm
        ma_kh_moi = cursor.lastrowid
        conn.commit()
        
        # Lấy thông tin khách hàng vừa được thêm
        cursor.execute("SELECT * FROM khachhang WHERE MaKH = %s", (ma_kh_moi,))
        khachhang_moi = cursor.fetchone()
        
        # Chuyển đổi tuple thành dictionary
        columns = ['MaKH', 'TenKH', 'SDT', 'Email']
        khachhang_dict = dict(zip(columns, khachhang_moi))
        
        return jsonify({
            "message": "Thêm khách hàng thành công",
            "data": khachhang_dict
        }), 201
    except Exception as e:
        if conn:
            conn.rollback()
        return jsonify({"message": "Lỗi khi thêm khách hàng", "error": str(e)}), 500
    finally:
        if cursor:
            cursor.close()
        if conn:
            conn.close()

# Cập nhật khách hàng (hỗ trợ partial update)
@khachhang_bp.route('/<int:ma_kh>', methods=['PUT'])
def update_khachhang(ma_kh):
    data = request.get_json()
    
    conn = None
    cursor = None
    try:
        # Kiểm tra xem khách hàng có tồn tại không
        conn = get_connection()
        cursor = conn.cursor(dictionary=True)
        cursor.execute("SELECT * FROM khachhang WHERE MaKH = %s", (ma_kh,))
        existing_khachhang = cursor.fetchone()
        
        if not existing_khachhang:
            return jsonify({"message": "Khách hàng không tồn tại"}), 404
        
        # Tạo danh sách các trường cần cập nhật
        update_fields = []
        update_values = []
        
        # Chỉ cập nhật những trường có trong request data
        field_mapping = {
            'TenKH': 'TenKH',
            'SDT': 'SDT',
            'Email': 'Email'
        }
        
        for field_name, db_column in field_mapping.items():
            if field_name in data and data[field_name] is not None:
                update_fields.append(f"{db_column} = %s")
                update_values.append(data[field_name])
        
        # Nếu không có trường nào để cập nhật
        if not update_fields:
            return jsonify({"message": "Không có dữ liệu để cập nhật"}), 400
        
        # Thực hiện cập nhật
        update_query = f"UPDATE khachhang SET {', '.join(update_fields)} WHERE MaKH = %s"
        update_values.append(ma_kh)
        
        cursor.execute(update_query, update_values)
        conn.commit()
        
        # Lấy thông tin khách hàng sau khi cập nhật
        cursor.execute("SELECT * FROM khachhang WHERE MaKH = %s", (ma_kh,))
        updated_khachhang = cursor.fetchone()
        
        return jsonify({
            "message": "Cập nhật khách hàng thành công",
            "data": updated_khachhang
        })
    except Exception as e:
        if conn:
            conn.rollback()
        return jsonify({"message": "Lỗi khi cập nhật khách hàng", "error": str(e)}), 500
    finally:
        if cursor:
            cursor.close()
        if conn:
            conn.close()

# Xóa khách hàng
@khachhang_bp.route('/<int:ma_kh>', methods=['DELETE'])
def delete_khachhang(ma_kh):
    conn = None
    cursor = None
    try:
        conn = get_connection()
        cursor = conn.cursor()
        cursor.execute("""
            DELETE FROM khachhang WHERE MaKH = %s
        """, (ma_kh,))
        conn.commit()
        affected_rows = cursor.rowcount

        if affected_rows > 0:
            return jsonify({"message": "Xóa khách hàng thành công"})
        else:
            return jsonify({"message": "Khách hàng không tồn tại"}), 404
    except Exception as e:
        if conn:
            conn.rollback()
        return jsonify({"message": "Lỗi khi xóa khách hàng", "error": str(e)}), 500
    finally:
        if cursor:
            cursor.close()
        if conn:
            conn.close()