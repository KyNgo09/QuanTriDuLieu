from flask import Blueprint, jsonify
from app.models.db import get_connection
from app.utils import convert_datetime_fields
from flask import Blueprint, request, jsonify
from datetime import datetime

thongke_bp = Blueprint('thongke', __name__)

@thongke_bp.route('/ty-le-lap-day/<int:ma_suatchieu>', methods=['GET'])
def ty_le_lap_day(ma_suatchieu):
    """
    Thống kê tỷ lệ lấp đầy phòng chiếu theo suất chiếu
    
    Tính tỷ lệ: (Số vé đã bán / Tổng số ghế) × 100
    """
    conn = None
    cursor = None
    
    try:
        conn = get_connection()
        cursor = conn.cursor(dictionary=True)
        
        # Bước 1: Lấy thông tin suất chiếu và phòng
        cursor.execute("""
            SELECT sc.MaPhong, sc.MaPhim, sc.NgayChieu, sc.GioChieu, 
                   p.TenPhim, pc.TenPhong
            FROM SuatChieu sc
            JOIN Phim p ON sc.MaPhim = p.MaPhim
            JOIN PhongChieu pc ON sc.MaPhong = pc.MaPhong
            WHERE sc.MaSuatChieu = %s
        """, (ma_suatchieu,))
        suatchieu_info = cursor.fetchone()
        
        if suatchieu_info is None:
            return jsonify({"message": "Suất chiếu không tồn tại"}), 404
        
        ma_phong = suatchieu_info['MaPhong']
        
        # Bước 2: Đếm tổng số ghế trong phòng
        cursor.execute("""
            SELECT COUNT(*) AS tong_ghe
            FROM Ghe
            WHERE MaPhong = %s
        """, (ma_phong,))
        tong_ghe_result = cursor.fetchone()
        tong_ghe = tong_ghe_result['tong_ghe'] if tong_ghe_result else 0
        
        if tong_ghe == 0:
            return jsonify({"message": "Phòng không có ghế"}), 400
        
        # Bước 3: Đếm số vé đã bán cho suất chiếu
        cursor.execute("""
            SELECT COUNT(*) AS so_ve
            FROM Ve
            WHERE MaSuatChieu = %s
        """, (ma_suatchieu,))
        so_ve_result = cursor.fetchone()
        so_ve = so_ve_result['so_ve'] if so_ve_result else 0
        
        # Tính tỷ lệ lấp đầy
        ty_le = round((so_ve / tong_ghe) * 100, 2) if tong_ghe > 0 else 0
        
        # Trả về kết quả với thông tin chi tiết
        data = {
            "MaSuatChieu": ma_suatchieu,
            "MaPhong": ma_phong,
            "TenPhong": suatchieu_info['TenPhong'],
            "MaPhim": suatchieu_info['MaPhim'],
            "TenPhim": suatchieu_info['TenPhim'],
            "NgayChieu": suatchieu_info['NgayChieu'],
            "GioChieu": suatchieu_info['GioChieu'],
            "SoLuongVeDaBan": so_ve,
            "TongSoGhe": tong_ghe,
            "TyLeLapDay": ty_le,
            "TrangThai": "Đầy" if ty_le == 100 else "Còn chỗ" if ty_le < 80 else "Gần đầy"
        }

        convert_datetime_fields(data)
        
        return jsonify({
            "message": "Thống kê tỷ lệ lấp đầy thành công",
            "data": data
        }), 200
        
    except Exception as e:
        if conn:
            conn.rollback()
        return jsonify({
            "message": "Lỗi khi thống kê tỷ lệ lấp đầy", 
            "error": str(e)
        }), 500
        
    finally:
        if cursor:
            cursor.close()
        if conn:
            conn.close()



@thongke_bp.route('/doanh-thu-ngay', methods=['GET'])
def doanh_thu_theo_ngay():
    """
    Thống kê doanh thu vé và combo mỗi ngày trong khoảng thời gian
    """
    conn = None
    cursor = None

    start_date = request.args.get('from')
    end_date = request.args.get('to')

    if not start_date or not end_date:
        return jsonify({"message": "Thiếu tham số 'from' hoặc 'to'"}), 400

    try:
        start_date = datetime.strptime(start_date, "%Y-%m-%d").date()
        end_date = datetime.strptime(end_date, "%Y-%m-%d").date()

        conn = get_connection()
        cursor = conn.cursor(dictionary=True)
    
        cursor.callproc('sp_BaoCaoDoanhThuTheoNgay', [start_date, end_date])
        result = []
        for res in cursor.stored_results():
            result.extend(res.fetchall())
        
        if not result:
            return jsonify({
                "message": "Không có dữ liệu doanh thu trong khoảng thời gian này"
            }), 404

        return jsonify({
            "message": "Thống kê doanh thu mỗi ngày thành công",
            "data": result
        }), 200

    except Exception as e:
        return jsonify({
            "message": "Lỗi khi thống kê doanh thu",
            "error": str(e)
        }), 500

    finally:
        if cursor:
            cursor.close()
        if conn:
            conn.close()

@thongke_bp.route('/doanh-thu-phim', methods=['GET'])
def doanh_thu_theo_phim():
    """
    API thống kê doanh thu theo từng phim bằng sp_BaoCaoDoanhThuTheoPhim
    """
    conn = None
    cursor = None

    try:
        conn = get_connection()
        cursor = conn.cursor(dictionary=True)

        cursor.callproc('sp_BaoCaoDoanhThuTheoPhim')

        result = []
        for res in cursor.stored_results():
            result.extend(res.fetchall())

        if not result:
            return jsonify({
                "message": "Không có dữ liệu doanh thu phim"
            }), 404

        return jsonify({
            "message": "Thống kê doanh thu theo phim thành công",
            "data": result
        }), 200

    except Exception as e:
        if conn: conn.rollback()
        return jsonify({
            "message": "Lỗi khi thống kê doanh thu phim",
            "error": str(e)
        }), 500

    finally:
        if cursor: cursor.close()
        if conn: conn.close()