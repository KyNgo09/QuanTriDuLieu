from flask import Blueprint, jsonify, request
from app.models.db import get_connection
from app.utils import convert_datetime_fields
from datetime import datetime

suatchieu_bp = Blueprint('suatchieu', __name__)

# Helper function to get raw phim data
def get_phim_data_by_id(ma_phim):
    conn = None
    cursor = None
    try:
        conn = get_connection()
        cursor = conn.cursor(dictionary=True)
        cursor.execute("SELECT * FROM Phim WHERE MaPhim = %s", (ma_phim,))
        return cursor.fetchone()
    except Exception:
        return None
    finally:
        if cursor:
            cursor.close()
        if conn:
            conn.close()

# Helper function to get raw phongchieu data
def get_phongchieu_data_by_id(ma_phong):
    conn = None
    cursor = None
    try:
        conn = get_connection()
        cursor = conn.cursor(dictionary=True)
        cursor.execute("SELECT * FROM PhongChieu WHERE MaPhong = %s", (ma_phong,))
        return cursor.fetchone()
    except Exception:
        return None
    finally:
        if cursor:
            cursor.close()
        if conn:
            conn.close()

def get_so_luong_ve_da_ban(ma_suatchieu):
    """
    Lấy số lượng vé đã bán cho một suất chiếu
    """
    conn = None
    cursor = None
    try:
        conn = get_connection()
        cursor = conn.cursor()
        cursor.execute("""
            SELECT COUNT(*) FROM Ve WHERE MaSuatChieu = %s
        """, (ma_suatchieu,))
        return cursor.fetchone()[0]
    except Exception as e:
        return 0
    finally:
        if cursor:
            cursor.close()
        if conn:
            conn.close()

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
    
        for item in data:
            item['Phim'] = get_phim_data_by_id(item['MaPhim'])
            item['Phong'] = get_phongchieu_data_by_id(item['MaPhong'])
            item['SoLuongVeDaBan'] = get_so_luong_ve_da_ban(item['MaSuatChieu'])
            item.pop('MaPhim', None)
            item.pop('MaPhong', None)

        return jsonify(data)
    except Exception as e:
        return jsonify({"message": "Lỗi khi lấy danh sách suất chiếu", "error": str(e)}), 500
    finally:
        if cursor:
            cursor.close()
        if conn:
            conn.close()

# Lấy danh sách suất chiếu với filter
@suatchieu_bp.route('/filter', methods=['GET'])
def get_suatchieu_with_filter():
    conn = None
    cursor = None
    try:
        # Lấy các tham số filter từ query string
        ten_phim = request.args.get('ten_phim', '').strip()
        ma_phong = request.args.get('ma_phong')
        ngay_chieu = request.args.get('ngay_chieu')
        gio_chieu_tu = request.args.get('gio_chieu_tu')
        gio_chieu_den = request.args.get('gio_chieu_den')
        
        conn = get_connection()
        cursor = conn.cursor(dictionary=True)
        
        # Xây dựng câu query với JOIN để có thể filter theo tên phim
        base_query = """
            SELECT s.*, p.TenPhim, pc.TenPhong
            FROM SuatChieu s
            LEFT JOIN Phim p ON s.MaPhim = p.MaPhim
            LEFT JOIN PhongChieu pc ON s.MaPhong = pc.MaPhong
            WHERE 1=1
        """
        
        params = []
        
        # Thêm các điều kiện filter
        if ten_phim:
            base_query += " AND p.TenPhim LIKE %s"
            params.append(f"%{ten_phim}%")
            
        if ma_phong:
            try:
                ma_phong_int = int(ma_phong)
                base_query += " AND s.MaPhong = %s"
                params.append(ma_phong_int)
            except ValueError:
                return jsonify({"message": "Mã phòng không hợp lệ"}), 400
                
        if ngay_chieu:
            try:
                # Kiểm tra định dạng ngày
                datetime.strptime(ngay_chieu, "%Y-%m-%d")
                base_query += " AND s.NgayChieu = %s"
                params.append(ngay_chieu)
            except ValueError:
                return jsonify({"message": "Định dạng ngày không hợp lệ, yêu cầu YYYY-MM-DD"}), 400
                
        if gio_chieu_tu:
            try:
                # Kiểm tra định dạng giờ
                datetime.strptime(gio_chieu_tu, "%H:%M:%S")
                base_query += " AND s.GioChieu >= %s"
                params.append(gio_chieu_tu)
            except ValueError:
                return jsonify({"message": "Định dạng giờ bắt đầu không hợp lệ, yêu cầu HH:MM:SS"}), 400
                
        if gio_chieu_den:
            try:
                # Kiểm tra định dạng giờ
                datetime.strptime(gio_chieu_den, "%H:%M:%S")
                base_query += " AND s.GioChieu <= %s"
                params.append(gio_chieu_den)
            except ValueError:
                return jsonify({"message": "Định dạng giờ kết thúc không hợp lệ, yêu cầu HH:MM:SS"}), 400
                
        
        # Sắp xếp theo ngày chiếu và giờ chiếu
        base_query += " ORDER BY s.NgayChieu DESC, s.GioChieu ASC"
        
        cursor.execute(base_query, params)
        data = cursor.fetchall()
        
        # Chuyển đổi các kiểu dữ liệu datetime
        convert_datetime_fields(data)
        
        # Thêm thông tin chi tiết cho mỗi suất chiếu
        for item in data:
            item['Phim'] = get_phim_data_by_id(item['MaPhim'])
            item['Phong'] = get_phongchieu_data_by_id(item['MaPhong'])
            item['SoLuongVeDaBan'] = get_so_luong_ve_da_ban(item['MaSuatChieu'])
            # Xóa các trường trung lặp
            item.pop('MaPhim', None)
            item.pop('MaPhong', None)
            item.pop('TenPhim', None)
            item.pop('TenPhong', None)
        
        return jsonify({
            "message": "Lấy danh sách suất chiếu thành công",
            "total": len(data),
            "data": data
        })
        
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

            data['Phim'] = get_phim_data_by_id(data['MaPhim'])
            data['Phong'] = get_phongchieu_data_by_id(data['MaPhong'])
            data['SoLuongVeDaBan'] = get_so_luong_ve_da_ban(data['MaSuatChieu'])
            data.pop('MaPhim', None)
            data.pop('MaPhong', None)
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
        cursor = conn.cursor(dictionary=True)
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
        
        # Chuyển đổi các kiểu dữ liệu datetime
        convert_datetime_fields(suatchieu_moi)
        
        return jsonify({
            "message": "Thêm suất chiếu thành công",
            "data": suatchieu_moi
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