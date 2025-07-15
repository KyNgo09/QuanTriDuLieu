from flask import Blueprint, jsonify, request
from app.models.db import get_connection

combo_bp = Blueprint('combo', __name__)

# Lấy tất cả combo
@combo_bp.route('/', methods=['GET'])
def get_all_combo():
    conn = None
    cursor = None
    try:
        conn = get_connection()
        cursor = conn.cursor(dictionary=True)
        cursor.execute("""
            SELECT * FROM combo
        """)
        data = cursor.fetchall()
        return jsonify(data)
    except Exception as e:
        return jsonify({"message": "Lỗi khi lấy danh sách combo", "error": str(e)}), 500
    finally:
        if cursor:
            cursor.close()
        if conn:
            conn.close()

# Lấy thông tin 1 combo
@combo_bp.route('/<int:ma_combo>', methods=['GET'])
def get_combo_by_id(ma_combo):
    conn = None
    cursor = None
    try:
        conn = get_connection()
        cursor = conn.cursor(dictionary=True)
        cursor.execute("""
            SELECT * FROM combo WHERE MaCombo = %s
        """, (ma_combo,))
        data = cursor.fetchone()
        if data:
            return jsonify(data)
        else:
            return jsonify({"message": "Combo không tồn tại"}), 404
    except Exception as e:
        return jsonify({"message": "Lỗi khi lấy thông tin combo", "error": str(e)}), 500
    finally:
        if cursor:
            cursor.close()
        if conn:
            conn.close()

# Thêm combo mới
@combo_bp.route('/', methods=['POST'])
def create_combo():
    data = request.get_json()
    ten_combo = data.get('TenCombo')
    gia_combo = data.get('GiaCombo')
    mo_ta = data.get('MoTa')

    conn = None
    cursor = None
    try:
        conn = get_connection()
        cursor = conn.cursor()
        cursor.execute("""
            INSERT INTO combo (TenCombo, GiaCombo, MoTa)
            VALUES (%s, %s, %s)
        """, (ten_combo, gia_combo, mo_ta))
        
        # Lấy ID của combo vừa được thêm
        ma_combo_moi = cursor.lastrowid
        conn.commit()
        
        # Lấy thông tin combo vừa được thêm
        cursor.execute("SELECT * FROM combo WHERE MaCombo = %s", (ma_combo_moi,))
        combo_moi = cursor.fetchone()
        
        # Chuyển đổi tuple thành dictionary
        columns = ['MaCombo', 'TenCombo', 'GiaCombo', 'MoTa']
        combo_dict = dict(zip(columns, combo_moi))
        
        return jsonify({
            "message": "Thêm combo thành công",
            "data": combo_dict
        }), 201
    except Exception as e:
        if conn:
            conn.rollback()
        return jsonify({"message": "Lỗi khi thêm combo", "error": str(e)}), 500
    finally:
        if cursor:
            cursor.close()
        if conn:
            conn.close()

# Cập nhật combo (hỗ trợ partial update)
@combo_bp.route('/<int:ma_combo>', methods=['PUT'])
def update_combo(ma_combo):
    data = request.get_json()
    
    conn = None
    cursor = None
    try:
        # Kiểm tra xem combo có tồn tại không
        conn = get_connection()
        cursor = conn.cursor(dictionary=True)
        cursor.execute("SELECT * FROM combo WHERE MaCombo = %s", (ma_combo,))
        existing_combo = cursor.fetchone()
        
        if not existing_combo:
            return jsonify({"message": "Combo không tồn tại"}), 404
        
        # Tạo danh sách các trường cần cập nhật
        update_fields = []
        update_values = []
        
        # Chỉ cập nhật những trường có trong request data
        field_mapping = {
            'TenCombo': 'TenCombo',
            'GiaCombo': 'GiaCombo',
            'MoTa': 'MoTa'
        }
        
        for field_name, db_column in field_mapping.items():
            if field_name in data and data[field_name] is not None:
                update_fields.append(f"{db_column} = %s")
                update_values.append(data[field_name])
        
        # Nếu không có trường nào để cập nhật
        if not update_fields:
            return jsonify({"message": "Không có dữ liệu để cập nhật"}), 400
        
        # Thực hiện cập nhật
        update_query = f"UPDATE combo SET {', '.join(update_fields)} WHERE MaCombo = %s"
        update_values.append(ma_combo)
        
        cursor.execute(update_query, update_values)
        conn.commit()
        
        # Lấy thông tin combo sau khi cập nhật
        cursor.execute("SELECT * FROM combo WHERE MaCombo = %s", (ma_combo,))
        updated_combo = cursor.fetchone()
        
        return jsonify({
            "message": "Cập nhật combo thành công",
            "data": updated_combo
        })
    except Exception as e:
        if conn:
            conn.rollback()
        return jsonify({"message": "Lỗi khi cập nhật combo", "error": str(e)}), 500
    finally:
        if cursor:
            cursor.close()
        if conn:
            conn.close()

# Xóa combo
@combo_bp.route('/<int:ma_combo>', methods=['DELETE'])
def delete_combo(ma_combo):
    conn = None
    cursor = None
    try:
        conn = get_connection()
        cursor = conn.cursor()
        cursor.execute("""
            DELETE FROM combo WHERE MaCombo = %s
        """, (ma_combo,))
        conn.commit()
        affected_rows = cursor.rowcount

        if affected_rows > 0:
            return jsonify({"message": "Xóa combo thành công"})
        else:
            return jsonify({"message": "Combo không tồn tại"}), 404
    except Exception as e:
        if conn:
            conn.rollback()
        return jsonify({"message": "Lỗi khi xóa combo", "error": str(e)}), 500
    finally:
        if cursor:
            cursor.close()
        if conn:
            conn.close()
