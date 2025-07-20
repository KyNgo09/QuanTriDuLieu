from flask import Blueprint, jsonify, request
from app.models.db import get_connection
from app.utils import convert_datetime_fields

hoadon_bp = Blueprint('hoadon', __name__)

# Lấy tất cả hóa đơn
@hoadon_bp.route('/', methods=['GET'])
def get_all_hoadon():
    conn = None
    cursor = None
    try:
        conn = get_connection()
        cursor = conn.cursor(dictionary=True)
        cursor.execute("""
            SELECT * FROM hoadon
        """)
        data = cursor.fetchall()
        
        # Chuyển đổi các kiểu dữ liệu datetime
        convert_datetime_fields(data)
        
        return jsonify(data)
    except Exception as e:
        return jsonify({"message": "Lỗi khi lấy danh sách hóa đơn", "error": str(e)}), 500
    finally:
        if cursor:
            cursor.close()
        if conn:
            conn.close()

# Lấy thông tin 1 hóa đơn
@hoadon_bp.route('/<int:ma_hoa_don>', methods=['GET'])
def get_hoadon_by_id(ma_hoa_don):
    conn = None
    cursor = None
    try:
        conn = get_connection()
        cursor = conn.cursor(dictionary=True)
        cursor.execute("""
            SELECT * FROM hoadon WHERE MaHoaDon = %s
        """, (ma_hoa_don,))
        data = cursor.fetchone()
        
        if data:
            # Chuyển đổi các kiểu dữ liệu datetime
            convert_datetime_fields(data)
            return jsonify(data)
        else:
            return jsonify({"message": "Hóa đơn không tồn tại"}), 404
    except Exception as e:
        return jsonify({"message": "Lỗi khi lấy thông tin hóa đơn", "error": str(e)}), 500
    finally:
        if cursor:
            cursor.close()
        if conn:
            conn.close()

# Thêm hóa đơn mới
@hoadon_bp.route('/', methods=['POST'])
def create_hoadon():
    data = request.get_json()
    ma_kh = data.get('MaKH')
    ma_combo = data.get('MaCombo')
    so_luong = data.get('SoLuong', 1)  # Default: 1

    conn = None
    cursor = None
    try:
        conn = get_connection()
        cursor = conn.cursor()

        # Nếu không có ngày mua, sử dụng CURRENT_TIMESTAMP
        cursor.execute("""
            INSERT INTO hoadon (MaKH, MaCombo, SoLuong)
            VALUES (%s, %s, %s)
        """, (ma_kh, ma_combo, so_luong))

        # Lấy ID của hóa đơn vừa được thêm
        ma_hoa_don_moi = cursor.lastrowid
        conn.commit()
        
        # Lấy thông tin hóa đơn vừa được thêm
        cursor.execute("SELECT * FROM hoadon WHERE MaHoaDon = %s", (ma_hoa_don_moi,))
        hoadon_moi = cursor.fetchone()
        
        # Chuyển đổi tuple thành dictionary
        columns = ['MaHoaDon', 'MaKH', 'MaCombo', 'SoLuong', 'NgayMua', 'TongTien']
        hoadon_dict = dict(zip(columns, hoadon_moi))
        
        # Chuyển đổi các kiểu dữ liệu datetime
        convert_datetime_fields(hoadon_dict)
        
        return jsonify({
            "message": "Thêm hóa đơn thành công",
            "data": hoadon_dict
        }), 201
    except Exception as e:
        if conn:
            conn.rollback()
        return jsonify({"message": "Lỗi khi thêm hóa đơn", "error": str(e)}), 500
    finally:
        if cursor:
            cursor.close()
        if conn:
            conn.close()

# Cập nhật hóa đơn (hỗ trợ partial update)
@hoadon_bp.route('/<int:ma_hoa_don>', methods=['PUT'])
def update_hoadon(ma_hoa_don):
    data = request.get_json()
    
    conn = None
    cursor = None
    try:
        # Kiểm tra xem hóa đơn có tồn tại không
        conn = get_connection()
        cursor = conn.cursor(dictionary=True)
        cursor.execute("SELECT * FROM hoadon WHERE MaHoaDon = %s", (ma_hoa_don,))
        existing_hoadon = cursor.fetchone()
        
        if not existing_hoadon:
            return jsonify({"message": "Hóa đơn không tồn tại"}), 404
        
        # Tạo danh sách các trường cần cập nhật
        update_fields = []
        update_values = []
        
        # Chỉ cập nhật những trường có trong request data
        field_mapping = {
            'MaKH': 'MaKH',
            'MaCombo': 'MaCombo',
            'SoLuong': 'SoLuong',
            'NgayMua': 'NgayMua',
            'TongTien': 'TongTien'
        }
        
        for field_name, db_column in field_mapping.items():
            if field_name in data and data[field_name] is not None:
                update_fields.append(f"{db_column} = %s")
                update_values.append(data[field_name])
        
        # Nếu không có trường nào để cập nhật
        if not update_fields:
            return jsonify({"message": "Không có dữ liệu để cập nhật"}), 400
        
        # Thực hiện cập nhật
        update_query = f"UPDATE hoadon SET {', '.join(update_fields)} WHERE MaHoaDon = %s"
        update_values.append(ma_hoa_don)
        
        cursor.execute(update_query, update_values)
        conn.commit()
        
        # Lấy thông tin hóa đơn sau khi cập nhật
        cursor.execute("SELECT * FROM hoadon WHERE MaHoaDon = %s", (ma_hoa_don,))
        updated_hoadon = cursor.fetchone()
        
        # Chuyển đổi các kiểu dữ liệu datetime
        convert_datetime_fields(updated_hoadon)
        
        return jsonify({
            "message": "Cập nhật hóa đơn thành công",
            "data": updated_hoadon
        })
    except Exception as e:
        if conn:
            conn.rollback()
        return jsonify({"message": "Lỗi khi cập nhật hóa đơn", "error": str(e)}), 500
    finally:
        if cursor:
            cursor.close()
        if conn:
            conn.close()

# Xóa hóa đơn
@hoadon_bp.route('/<int:ma_hoa_don>', methods=['DELETE'])
def delete_hoadon(ma_hoa_don):
    conn = None
    cursor = None
    try:
        conn = get_connection()
        cursor = conn.cursor()
        cursor.execute("""
            DELETE FROM hoadon WHERE MaHoaDon = %s
        """, (ma_hoa_don,))
        conn.commit()
        affected_rows = cursor.rowcount

        if affected_rows > 0:
            return jsonify({"message": "Xóa hóa đơn thành công"})
        else:
            return jsonify({"message": "Hóa đơn không tồn tại"}), 404
    except Exception as e:
        if conn:
            conn.rollback()
        return jsonify({"message": "Lỗi khi xóa hóa đơn", "error": str(e)}), 500
    finally:
        if cursor:
            cursor.close()
        if conn:
            conn.close()

# Lấy hóa đơn theo khách hàng
@hoadon_bp.route('/khachhang/<int:ma_kh>', methods=['GET'])
def get_hoadon_by_khachhang(ma_kh):
    conn = None
    cursor = None
    try:
        conn = get_connection()
        cursor = conn.cursor(dictionary=True)
        cursor.execute("""
            SELECT hd.*, kh.TenKH, 
                   c.TenCombo, c.GiaCombo, c.MoTa as MoTaCombo
            FROM hoadon hd
            JOIN khachhang kh ON hd.MaKH = kh.MaKH
            LEFT JOIN combo c ON hd.MaCombo = c.MaCombo
            WHERE hd.MaKH = %s
            ORDER BY hd.NgayMua DESC
        """, (ma_kh,))
        data = cursor.fetchall()
        
        # Chuyển đổi các kiểu dữ liệu datetime
        convert_datetime_fields(data)
        
        return jsonify(data)
    except Exception as e:
        return jsonify({"message": "Lỗi khi lấy hóa đơn của khách hàng", "error": str(e)}), 500
    finally:
        if cursor:
            cursor.close()
        if conn:
            conn.close()
