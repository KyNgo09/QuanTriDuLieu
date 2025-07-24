from flask import Blueprint, jsonify, request
from app.models.db import get_connection
from app.utils import convert_datetime_fields

ve_bp = Blueprint('ve', __name__)

# Lấy tất cả vé
@ve_bp.route('', methods=['GET'], strict_slashes=False)
def get_all_ve():
    conn = None
    cursor = None
    try:
        conn = get_connection()
        cursor = conn.cursor(dictionary=True)
        cursor.execute("""
            SELECT * FROM ve
        """)
        data = cursor.fetchall()
        
        # Chuyển đổi các kiểu dữ liệu datetime
        convert_datetime_fields(data)
        
        return jsonify(data)
    except Exception as e:
        return jsonify({"message": "Lỗi khi lấy danh sách vé", "error": str(e)}), 500
    finally:
        if cursor:
            cursor.close()
        if conn:
            conn.close()

# Lấy thông tin 1 vé
@ve_bp.route('/<int:ma_ve>', methods=['GET'])
def get_ve_by_id(ma_ve):
    conn = None
    cursor = None
    try:
        conn = get_connection()
        cursor = conn.cursor(dictionary=True)
        cursor.execute("""
            SELECT * FROM ve WHERE MaVe = %s
        """, (ma_ve,))
        data = cursor.fetchone()
        
        if data:
            # Chuyển đổi các kiểu dữ liệu datetime
            convert_datetime_fields(data)
            return jsonify(data)
        else:
            return jsonify({"message": "Vé không tồn tại"}), 404
    except Exception as e:
        return jsonify({"message": "Lỗi khi lấy thông tin vé", "error": str(e)}), 500
    finally:
        if cursor:
            cursor.close()
        if conn:
            conn.close()

# Thêm vé mới
@ve_bp.route('/', methods=['POST'])
def create_ve():
    data = request.get_json()
    ma_suat_chieu = data.get('MaSuatChieu')
    ma_kh = data.get('MaKH')
    ma_ghe = data.get('MaGhe')
    gia_ve = data.get('GiaVe') # Có thể null -> mysql có trigger để tự động tính giá
    trang_thai = data.get('TrangThai', 'DaDat')  # Default: DaDat

    conn = None
    cursor = None
    try:
        conn = get_connection()
        cursor = conn.cursor()
        
        # Nếu không có ngày đặt, sử dụng CURRENT_TIMESTAMP
        cursor.execute("""
            INSERT INTO ve (MaSuatChieu, MaKH, MaGhe, GiaVe, TrangThai)
            VALUES (%s, %s, %s, %s, %s)
        """, (ma_suat_chieu, ma_kh, ma_ghe, gia_ve, trang_thai))
        
        # Lấy ID của vé vừa được thêm
        ma_ve_moi = cursor.lastrowid
        conn.commit()
        
        # Lấy thông tin vé vừa được thêm
        cursor.execute("SELECT * FROM ve WHERE MaVe = %s", (ma_ve_moi,))
        ve_moi = cursor.fetchone()
        
        # Chuyển đổi tuple thành dictionary
        columns = ['MaVe', 'MaSuatChieu', 'MaKH', 'MaGhe', 'NgayDat', 'GiaVe', 'TrangThai']
        ve_dict = dict(zip(columns, ve_moi))
        
        # Chuyển đổi các kiểu dữ liệu datetime
        convert_datetime_fields(ve_dict)
        
        return jsonify({
            "message": "Thêm vé thành công",
            "data": ve_dict
        }), 201
    except Exception as e:
        if conn:
            conn.rollback()
        return jsonify({"message": "Lỗi khi thêm vé", "error": str(e)}), 500
    finally:
        if cursor:
            cursor.close()
        if conn:
            conn.close()

# Cập nhật vé (hỗ trợ partial update)
@ve_bp.route('/<int:ma_ve>', methods=['PUT'])
def update_ve(ma_ve):
    data = request.get_json()
    
    conn = None
    cursor = None
    try:
        # Kiểm tra xem vé có tồn tại không
        conn = get_connection()
        cursor = conn.cursor(dictionary=True)
        cursor.execute("SELECT * FROM ve WHERE MaVe = %s", (ma_ve,))
        existing_ve = cursor.fetchone()
        
        if not existing_ve:
            return jsonify({"message": "Vé không tồn tại"}), 404
        
        # Tạo danh sách các trường cần cập nhật
        update_fields = []
        update_values = []
        
        # Chỉ cập nhật những trường có trong request data
        field_mapping = {
            'MaSuatChieu': 'MaSuatChieu',
            'MaKH': 'MaKH',
            'MaGhe': 'MaGhe',
            'NgayDat': 'NgayDat',
            'GiaVe': 'GiaVe',
            'TrangThai': 'TrangThai'
        }
        
        for field_name, db_column in field_mapping.items():
            if field_name in data and data[field_name] is not None:
                update_fields.append(f"{db_column} = %s")
                update_values.append(data[field_name])
        
        # Nếu không có trường nào để cập nhật
        if not update_fields:
            return jsonify({"message": "Không có dữ liệu để cập nhật"}), 400
        
        # Thực hiện cập nhật
        update_query = f"UPDATE ve SET {', '.join(update_fields)} WHERE MaVe = %s"
        update_values.append(ma_ve)
        
        cursor.execute(update_query, update_values)
        conn.commit()
        
        # Lấy thông tin vé sau khi cập nhật
        cursor.execute("SELECT * FROM ve WHERE MaVe = %s", (ma_ve,))
        updated_ve = cursor.fetchone()
        
        # Chuyển đổi các kiểu dữ liệu datetime
        convert_datetime_fields(updated_ve)
        
        return jsonify({
            "message": "Cập nhật vé thành công",
            "data": updated_ve
        })
    except Exception as e:
        if conn:
            conn.rollback()
        return jsonify({"message": "Lỗi khi cập nhật vé", "error": str(e)}), 500
    finally:
        if cursor:
            cursor.close()
        if conn:
            conn.close()

# Xóa vé
@ve_bp.route('/<int:ma_ve>', methods=['DELETE'])
def delete_ve(ma_ve):
    conn = None
    cursor = None
    try:
        conn = get_connection()
        cursor = conn.cursor()
        cursor.execute("""
            DELETE FROM ve WHERE MaVe = %s
        """, (ma_ve,))
        conn.commit()
        affected_rows = cursor.rowcount

        if affected_rows > 0:
            return jsonify({"message": "Xóa vé thành công"})
        else:
            return jsonify({"message": "Vé không tồn tại"}), 404
    except Exception as e:
        if conn:
            conn.rollback()
        return jsonify({"message": "Lỗi khi xóa vé", "error": str(e)}), 500
    finally:
        if cursor:
            cursor.close()
        if conn:
            conn.close()

# Lấy vé theo khách hàng
@ve_bp.route('/khachhang/<int:ma_kh>', methods=['GET'])
def get_ve_by_khachhang(ma_kh):
    conn = None
    cursor = None
    try:
        conn = get_connection()
        cursor = conn.cursor(dictionary=True)
        cursor.execute("""
            SELECT v.*, kh.TenKH, sc.NgayChieu, sc.GioChieu, 
                   p.TenPhim, pc.TenPhong, g.SoHang, g.STTGhe
            FROM ve v
            JOIN khachhang kh ON v.MaKH = kh.MaKH
            JOIN suatchieu sc ON v.MaSuatChieu = sc.MaSuatChieu
            JOIN phim p ON sc.MaPhim = p.MaPhim
            JOIN phongchieu pc ON sc.MaPhong = pc.MaPhong
            JOIN ghe g ON v.MaGhe = g.MaGhe
            WHERE v.MaKH = %s
            ORDER BY v.NgayDat DESC
        """, (ma_kh,))
        data = cursor.fetchall()
        
        # Chuyển đổi các kiểu dữ liệu datetime
        convert_datetime_fields(data)
        
        return jsonify(data)
    except Exception as e:
        return jsonify({"message": "Lỗi khi lấy vé của khách hàng", "error": str(e)}), 500
    finally:
        if cursor:
            cursor.close()
        if conn:
            conn.close()

# Lấy vé theo suất chiếu
@ve_bp.route('/suatchieu/<int:ma_suat_chieu>', methods=['GET'])
def get_ve_by_suatchieu(ma_suat_chieu):
    conn = None
    cursor = None
    try:
        conn = get_connection()
        cursor = conn.cursor(dictionary=True)
        cursor.execute("""
            SELECT v.*, kh.TenKH, g.SoHang, g.STTGhe, g.LoaiGhe
            FROM ve v
            JOIN khachhang kh ON v.MaKH = kh.MaKH
            JOIN ghe g ON v.MaGhe = g.MaGhe
            WHERE v.MaSuatChieu = %s
            ORDER BY g.SoHang, g.STTGhe
        """, (ma_suat_chieu,))
        data = cursor.fetchall()
        
        # Chuyển đổi các kiểu dữ liệu datetime
        convert_datetime_fields(data)
        
        return jsonify(data)
    except Exception as e:
        return jsonify({"message": "Lỗi khi lấy vé của suất chiếu", "error": str(e)}), 500
    finally:
        if cursor:
            cursor.close()
        if conn:
            conn.close()

@ve_bp.route('/dat-ve', methods=['POST'], strict_slashes=False)
def dat_ve():
    """
    Đặt vé sử dụng procedure sp_DatVe
    """
    data = request.get_json()
    ma_suatchieu = data.get('MaSuatChieu')
    ma_kh = data.get('MaKH')
    ma_ghe = data.get('MaGhe')

    print("data", data)
    
    if (ma_suatchieu is None or ma_kh is None or ma_ghe is None):
        return jsonify({"message": "Thiếu thông tin đặt vé"}), 400

    conn = None
    cursor = None
    try:
        conn = get_connection()
        cursor = conn.cursor()

        # Khai báo biến OUT
        cursor.execute("SET @p_KetQua = '';")
        cursor.execute("SET @p_MaVe = NULL;")

        # Gọi procedure
        cursor.execute(
            "CALL sp_DatVe(%s, %s, %s, @p_KetQua, @p_MaVe);",
            (ma_suatchieu, ma_kh, ma_ghe)
        )

        # Lấy giá trị OUT
        cursor.execute("SELECT @p_KetQua AS KetQua, @p_MaVe AS MaVe;")
        result = cursor.fetchone()
        ket_qua = result[0]
        ma_ve = result[1]
        print("Kết quả đặt vé:", ket_qua)

    
        if ma_ve:
            # Lấy thông tin vé vừa đặt
            cursor.execute(
                "SELECT * FROM ve WHERE MaVe = %s",
                (ma_ve,)
            )
            ve = cursor.fetchone()
            columns = ['MaVe', 'MaSuatChieu', 'MaKH', 'MaGhe', 'NgayDat', 'GiaVe', 'TrangThai']
            ve_dict = dict(zip(columns, ve))
            convert_datetime_fields(ve_dict)
            return jsonify({
                "message": ket_qua,
                "data": ve_dict
            }), 201
        else:
            return jsonify({"message": ket_qua}), 400

    except Exception as e:
        return jsonify({"message": "Lỗi khi đặt vé", "error": str(e)}), 500
    finally:
        if cursor:
            cursor.close()
        if conn:
            conn.close()

@ve_bp.route('/huy-ve/<int:ma_ve>', methods=['POST'])
def huy_ve(ma_ve):
    """
    Hủy vé sử dụng procedure sp_HuyVe
    """
    conn = None
    cursor = None
    try:
        conn = get_connection()
        cursor = conn.cursor()

        # Khai báo biến OUT
        cursor.execute("SET @p_KetQua = '';")

        # Gọi procedure
        cursor.execute(
            "CALL sp_HuyVe(%s, @p_KetQua);",
            (ma_ve,)
        )

        # Lấy giá trị OUT
        cursor.execute("SELECT @p_KetQua AS KetQua;")
        result = cursor.fetchone()
        ket_qua = result[0]

        # Kiểm tra trạng thái hủy
        if ket_qua == 'Hủy vé thành công!':
            # Lấy thông tin vé vừa hủy
            cursor.execute(
                "SELECT * FROM ve WHERE MaVe = %s",
                (ma_ve,)
            )
            ve = cursor.fetchone()
            columns = ['MaVe', 'MaSuatChieu', 'MaKH', 'MaGhe', 'NgayDat', 'GiaVe', 'TrangThai']
            ve_dict = dict(zip(columns, ve))
            convert_datetime_fields(ve_dict)
            return jsonify({
                "message": ket_qua,
                "data": ve_dict
            }), 200
        else:
            return jsonify({"message": ket_qua}), 400

    except Exception as e:
        return jsonify({"message": "Lỗi khi hủy vé", "error": str(e)}), 500
    finally:
        if cursor:
            cursor.close()
        if conn:
            conn.close()
