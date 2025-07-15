from flask import Blueprint, jsonify, request
from app.models.db import get_connection

ghe_bp = Blueprint('ghe', __name__)

# Lấy tất cả ghế
@ghe_bp.route('/', methods=['GET'])
def get_all_ghe():
    conn = None
    cursor = None
    try:
        conn = get_connection()
        cursor = conn.cursor(dictionary=True)
        cursor.execute("""
            SELECT * FROM Ghe
        """)
        data = cursor.fetchall()
        return jsonify(data)
    except Exception as e:
        return jsonify({"message": "Lỗi khi lấy danh sách ghế", "error": str(e)}), 500
    finally:
        if cursor:
            cursor.close()
        if conn:
            conn.close()

# Lấy thông tin 1 ghế
@ghe_bp.route('/<int:ma_ghe>', methods=['GET'])
def get_ghe_by_id(ma_ghe):
    conn = None
    cursor = None
    try:
        conn = get_connection()
        cursor = conn.cursor(dictionary=True)
        cursor.execute("""
            SELECT * FROM Ghe WHERE MaGhe = %s
        """, (ma_ghe,))
        data = cursor.fetchone()
        if data:
            return jsonify(data)
        else:
            return jsonify({"message": "Ghế không tồn tại"}), 404
    except Exception as e:
        return jsonify({"message": "Lỗi khi lấy thông tin ghế", "error": str(e)}), 500
    finally:
        if cursor:
            cursor.close()
        if conn:
            conn.close()

# Thêm ghế mới
@ghe_bp.route('/', methods=['POST'])
def create_ghe():
    data = request.get_json()
    ma_phong = data.get('MaPhong')
    so_hang = data.get('SoHang')
    stt_ghe = data.get('STTGhe')
    loai_ghe = data.get('LoaiGhe')

    conn = None
    cursor = None
    try:
        conn = get_connection()
        cursor = conn.cursor()
        cursor.execute("""
            INSERT INTO Ghe (MaPhong, SoHang, STTGhe, LoaiGhe)
            VALUES (%s, %s, %s, %s)
        """, (ma_phong, so_hang, stt_ghe, loai_ghe))
        
        # Lấy ID của ghế vừa được thêm
        ma_ghe_moi = cursor.lastrowid
        conn.commit()
        
        # Lấy thông tin ghế vừa được thêm
        cursor.execute("SELECT * FROM Ghe WHERE MaGhe = %s", (ma_ghe_moi,))
        ghe_moi = cursor.fetchone()
        
        # Chuyển đổi tuple thành dictionary
        columns = ['MaGhe', 'MaPhong', 'SoHang', 'STTGhe', 'LoaiGhe']
        ghe_dict = dict(zip(columns, ghe_moi))
        
        return jsonify({
            "message": "Thêm ghế thành công",
            "data": ghe_dict
        }), 201
    except Exception as e:
        if conn:
            conn.rollback()
        return jsonify({"message": "Lỗi khi thêm ghế", "error": str(e)}), 500
    finally:
        if cursor:
            cursor.close()
        if conn:
            conn.close()

# Cập nhật ghế (hỗ trợ partial update)
@ghe_bp.route('/<int:ma_ghe>', methods=['PUT'])
def update_ghe(ma_ghe):
    data = request.get_json()
    
    conn = None
    cursor = None
    try:
        # Kiểm tra xem ghế có tồn tại không
        conn = get_connection()
        cursor = conn.cursor(dictionary=True)
        cursor.execute("SELECT * FROM Ghe WHERE MaGhe = %s", (ma_ghe,))
        existing_ghe = cursor.fetchone()
        
        if not existing_ghe:
            return jsonify({"message": "Ghế không tồn tại"}), 404
        
        # Tạo danh sách các trường cần cập nhật
        update_fields = []
        update_values = []
        
        # Chỉ cập nhật những trường có trong request data
        field_mapping = {
            'MaPhong': 'MaPhong',
            'SoHang': 'SoHang',
            'STTGhe': 'STTGhe',
            'LoaiGhe': 'LoaiGhe'
        }
        
        for field_name, db_column in field_mapping.items():
            if field_name in data and data[field_name] is not None:
                update_fields.append(f"{db_column} = %s")
                update_values.append(data[field_name])
        
        # Nếu không có trường nào để cập nhật
        if not update_fields:
            return jsonify({"message": "Không có dữ liệu để cập nhật"}), 400
        
        # Thực hiện cập nhật
        update_query = f"UPDATE Ghe SET {', '.join(update_fields)} WHERE MaGhe = %s"
        update_values.append(ma_ghe)
        
        cursor.execute(update_query, update_values)
        conn.commit()
        
        # Lấy thông tin ghế sau khi cập nhật
        cursor.execute("SELECT * FROM Ghe WHERE MaGhe = %s", (ma_ghe,))
        updated_ghe = cursor.fetchone()
        
        return jsonify({
            "message": "Cập nhật ghế thành công",
            "data": updated_ghe
        })
    except Exception as e:
        if conn:
            conn.rollback()
        return jsonify({"message": "Lỗi khi cập nhật ghế", "error": str(e)}), 500
    finally:
        if cursor:
            cursor.close()
        if conn:
            conn.close()

# Xóa ghế
@ghe_bp.route('/<int:ma_ghe>', methods=['DELETE'])
def delete_ghe(ma_ghe):
    conn = None
    cursor = None
    try:
        conn = get_connection()
        cursor = conn.cursor()
        cursor.execute("""
            DELETE FROM Ghe WHERE MaGhe = %s
        """, (ma_ghe,))
        conn.commit()
        affected_rows = cursor.rowcount

        if affected_rows > 0:
            return jsonify({"message": "Xóa ghế thành công"})
        else:
            return jsonify({"message": "Ghế không tồn tại"}), 404
    except Exception as e:
        if conn:
            conn.rollback()
        return jsonify({"message": "Lỗi khi xóa ghế", "error": str(e)}), 500
    finally:
        if cursor:
            cursor.close()
        if conn:
            conn.close()
