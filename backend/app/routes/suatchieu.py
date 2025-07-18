from flask import Blueprint, jsonify, request
from app.models.db import get_connection
from app.utils import convert_datetime_fields

suatchieu_bp = Blueprint('suatchieu', __name__)

# Lấy danh sách suất chiếu
@suatchieu_bp.route('/', methods=['GET'])
def get_suatchieu():
    conn = None
    cursor = None
    try:
        conn = get_connection()
        cursor = conn.cursor(dictionary=True)
        cursor.execute("""
            SELECT *
            FROM SuatChieu
        """)
        data = cursor.fetchall()
        
        # Chuyển đổi các kiểu dữ liệu datetime
        convert_datetime_fields(data)
        
        return jsonify(data)
    except Exception as e:
        return jsonify({"message": "Lỗi khi lấy danh sách suất chiếu", "error": str(e)}), 500
    finally:
        if cursor:
            cursor.close()
        if conn:
            conn.close()

# Lấy chi tiết 1 suất chiếu
@suatchieu_bp.route('/<int:ma_suatchieu>', methods=['GET'])
def get_suatchieu_by_id(ma_suatchieu):
    conn = None
    cursor = None
    try:
        conn = get_connection()
        cursor = conn.cursor(dictionary=True)
        cursor.execute("""
            SELECT *
            FROM SuatChieu
            WHERE MaSuatChieu = %s
        """, (ma_suatchieu,))
        data = cursor.fetchone()
        
        if data:
            # Chuyển đổi các kiểu dữ liệu datetime
            convert_datetime_fields(data)
            return jsonify(data)
        else:
            return jsonify({"message": "SuatChieu không tồn tại"}), 404
    except Exception as e:
        return jsonify({"message": "Lỗi khi lấy thông tin suất chiếu", "error": str(e)}), 500
    finally:
        if cursor:
            cursor.close()
        if conn:
            conn.close()

# Thêm suất chiếu
@suatchieu_bp.route('/', methods=['POST'])
def create_suatchieu():
    data = request.get_json()
    ma_phim = data.get('MaPhim')
    ma_phong = data.get('MaPhong')
    ngay_chieu = data.get('NgayChieu')
    gio_chieu = data.get('GioChieu')
    gia_ve = data.get('GiaVe')

    conn = None
    cursor = None
    try:
        conn = get_connection()
        cursor = conn.cursor()
        cursor.execute("""
            INSERT INTO SuatChieu (MaPhim, MaPhong, NgayChieu, GioChieu, GiaVe)
            VALUES (%s, %s, %s, %s, %s)
        """, (ma_phim, ma_phong, ngay_chieu, gio_chieu, gia_ve))
        
        # Lấy ID của suất chiếu vừa được thêm
        ma_suatchieu_moi = cursor.lastrowid
        conn.commit()
        
        # Lấy thông tin suất chiếu vừa được thêm
        cursor.execute("SELECT * FROM SuatChieu WHERE MaSuatChieu = %s", (ma_suatchieu_moi,))
        suatchieu_moi = cursor.fetchone()
        
        # Chuyển đổi tuple thành dictionary
        columns = ['MaSuatChieu', 'MaPhim', 'MaPhong', 'NgayChieu', 'GioChieu', 'GiaVe']
        suatchieu_dict = dict(zip(columns, suatchieu_moi))
        
        # Chuyển đổi các kiểu dữ liệu datetime
        convert_datetime_fields(suatchieu_dict)
        
        return jsonify({
            "message": "Thêm suất chiếu thành công",
            "data": suatchieu_dict
        }), 201
    except Exception as e:
        if conn:
            conn.rollback()
        return jsonify({"message": "Lỗi khi thêm suất chiếu", "error": str(e)}), 500
    finally:
        if cursor:
            cursor.close()
        if conn:
            conn.close()

# Cập nhật suất chiếu (hỗ trợ partial update)
@suatchieu_bp.route('/<int:ma_suatchieu>', methods=['PUT'])
def update_suatchieu(ma_suatchieu):
    data = request.get_json()
    
    conn = None
    cursor = None
    try:
        # Kiểm tra xem suất chiếu có tồn tại không
        conn = get_connection()
        cursor = conn.cursor(dictionary=True)
        cursor.execute("SELECT * FROM SuatChieu WHERE MaSuatChieu = %s", (ma_suatchieu,))
        existing_suatchieu = cursor.fetchone()
        
        if not existing_suatchieu:
            return jsonify({"message": "SuatChieu không tồn tại"}), 404
        
        # Tạo danh sách các trường cần cập nhật
        update_fields = []
        update_values = []
        
        # Chỉ cập nhật những trường có trong request data
        field_mapping = {
            'MaPhim': 'MaPhim',
            'MaPhong': 'MaPhong',
            'NgayChieu': 'NgayChieu',
            'GioChieu': 'GioChieu',
            'GiaVe': 'GiaVe'
        }
        
        for field_name, db_column in field_mapping.items():
            if field_name in data and data[field_name] is not None:
                update_fields.append(f"{db_column} = %s")
                update_values.append(data[field_name])
        
        # Nếu không có trường nào để cập nhật
        if not update_fields:
            return jsonify({"message": "Không có dữ liệu để cập nhật"}), 400
        
        # Thực hiện cập nhật
        update_query = f"UPDATE SuatChieu SET {', '.join(update_fields)} WHERE MaSuatChieu = %s"
        update_values.append(ma_suatchieu)
        
        cursor.execute(update_query, update_values)
        conn.commit()
        
        # Lấy thông tin suất chiếu sau khi cập nhật
        cursor.execute("SELECT * FROM SuatChieu WHERE MaSuatChieu = %s", (ma_suatchieu,))
        updated_suatchieu = cursor.fetchone()
        
        # Chuyển đổi các kiểu dữ liệu datetime
        convert_datetime_fields(updated_suatchieu)

        return jsonify({
            "message": "Cập nhật suất chiếu thành công",
            "data": updated_suatchieu
        })
    except Exception as e:
        if conn:
            conn.rollback()
        return jsonify({"message": "Lỗi khi cập nhật suất chiếu", "error": str(e)}), 500
    finally:
        if cursor:
            cursor.close()
        if conn:
            conn.close()

# Xóa suất chiếu
@suatchieu_bp.route('/<int:ma_suatchieu>', methods=['DELETE'])
def delete_suatchieu(ma_suatchieu):
    conn = None
    cursor = None
    try:
        conn = get_connection()
        cursor = conn.cursor()
        cursor.execute("""
            DELETE FROM SuatChieu
            WHERE MaSuatChieu = %s
        """, (ma_suatchieu,))
        conn.commit()
        affected_rows = cursor.rowcount

        if affected_rows > 0:
            return jsonify({"message": "Xóa suất chiếu thành công"})
        else:
            return jsonify({"message": "SuatChieu không tồn tại"}), 404
    except Exception as e:
        if conn:
            conn.rollback()
        return jsonify({"message": "Lỗi khi xóa suất chiếu", "error": str(e)}), 500
    finally:
        if cursor:
            cursor.close()
        if conn:
            conn.close()

# Lấy lịch chiếu đầy đủ theo ngày
@suatchieu_bp.route('/lich-chieu-day-du', methods=['GET'])
def get_lich_chieu_day_du():
    """
    Lấy lịch chiếu đầy đủ theo ngày (gọi procedure sp_LayLichChieuDayDu)
    """
    ngay = request.args.get('ngay')
    if not ngay:
        return jsonify({"message": "Thiếu tham số 'ngay'"}), 400

    try:
        # Kiểm tra định dạng ngày
        try:
            ngay_date = datetime.strptime(ngay, "%Y-%m-%d").date()
        except ValueError:
            return jsonify({"message": "Định dạng ngày không hợp lệ, yêu cầu YYYY-MM-DD"}), 400

        conn = get_connection()
        cursor = conn.cursor(dictionary=True)
        cursor.callproc('sp_LayLichChieuDayDu', [ngay_date])

        # Lấy kết quả từ procedure
        for result in cursor.stored_results():
            data = result.fetchall()
            break
        else:
            data = []

        return jsonify({
            "message": "Lấy lịch chiếu đầy đủ thành công",
            "data": data
        }), 200

    except Exception as e:
        return jsonify({
            "message": "Lỗi khi lấy lịch chiếu đầy đủ",
            "error": str(e)
        }), 500
    finally:
        if cursor:
            cursor.close()
        if conn:
            conn.close()