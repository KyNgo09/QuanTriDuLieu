-- MySQL dump 10.13  Distrib 8.0.41, for Win64 (x86_64)
--
-- Host: 127.0.0.1    Database: qlrapphim
-- ------------------------------------------------------
-- Server version	8.0.41

-- create database qlrapphim;

-- use qlrapphim;

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `combo`
--

DROP TABLE IF EXISTS `combo`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `combo` (
  `MaCombo` int NOT NULL AUTO_INCREMENT,
  `TenCombo` varchar(100) NOT NULL,
  `GiaCombo` decimal(10,2) DEFAULT NULL,
  `MoTa` text,
  PRIMARY KEY (`MaCombo`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `combo`
--

LOCK TABLES `combo` WRITE;
/*!40000 ALTER TABLE `combo` DISABLE KEYS */;
INSERT INTO `combo` VALUES (1,'Bắp + Nước 1 người',45000.00,'1 bắp ngọt + 1 Pepsi'),(2,'Combo đôi',80000.00,'2 bắp + 2 nước');
/*!40000 ALTER TABLE `combo` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `ghe`
--

DROP TABLE IF EXISTS `ghe`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `ghe` (
  `MaGhe` int NOT NULL AUTO_INCREMENT,
  `MaPhong` int DEFAULT NULL,
  `SoHang` char(1) DEFAULT NULL,
  `STTGhe` int DEFAULT NULL,
  `LoaiGhe` enum('THUONG','VIP') DEFAULT NULL,
  PRIMARY KEY (`MaGhe`),
  UNIQUE KEY `unique_phong_sohang_sttghe` (`MaPhong`, `SoHang`, `STTGhe`),
  KEY `MaPhong` (`MaPhong`),
  CONSTRAINT `ghe_ibfk_1` FOREIGN KEY (`MaPhong`) REFERENCES `phongchieu` (`MaPhong`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;


--
-- Dumping data for table `ghe`
--

LOCK TABLES `ghe` WRITE;
/*!40000 ALTER TABLE `ghe` DISABLE KEYS */;
INSERT INTO `ghe` VALUES (1,1,'A',1,'THUONG'),(2,1,'A',2,'THUONG'),(3,1,'A',3,'THUONG'),(4,1,'A',4,'VIP'),(5,1,'A',5,'VIP'),(6,1,'A',6,'VIP'),(7,2,'A',1,'THUONG'),(8,2,'A',2,'THUONG'),(9,2,'A',3,'THUONG'),(10,2,'A',4,'VIP'),(11,2,'A',5,'VIP'),(12,2,'A',6,'VIP');
/*!40000 ALTER TABLE `ghe` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `hoadon`
--

DROP TABLE IF EXISTS `hoadon`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `hoadon` (
  `MaHoaDon` int NOT NULL AUTO_INCREMENT,
  `MaKH` int DEFAULT NULL,
  `MaVe` int DEFAULT NULL,
  `MaCombo` int DEFAULT NULL,
  `SoLuong` int DEFAULT NULL,
  `NgayMua` datetime DEFAULT CURRENT_TIMESTAMP,
  `TongTien` decimal(10,2) DEFAULT NULL,
  PRIMARY KEY (`MaHoaDon`),
  KEY `MaKH` (`MaKH`),
  KEY `MaVe` (`MaVe`),
  KEY `MaCombo` (`MaCombo`),
  CONSTRAINT `hoadon_ibfk_1` FOREIGN KEY (`MaKH`) REFERENCES `khachhang` (`MaKH`),
  CONSTRAINT `hoadon_ibfk_2` FOREIGN KEY (`MaVe`) REFERENCES `ve` (`MaVe`),
  CONSTRAINT `hoadon_ibfk_3` FOREIGN KEY (`MaCombo`) REFERENCES `combo` (`MaCombo`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;


--
-- Dumping data for table `hoadon`
--

LOCK TABLES `hoadon` WRITE;
/*!40000 ALTER TABLE `hoadon` DISABLE KEYS */;
INSERT INTO `hoadon` VALUES (1,1,1,1,1,'2025-07-09 20:34:26',105000.00),(2,1,2,2,2,'2025-07-09 20:34:26',250000.00),(3,2,3,1,1,'2025-07-09 20:34:26',105000.00);
/*!40000 ALTER TABLE `hoadon` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `khachhang`
--

DROP TABLE IF EXISTS `khachhang`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `khachhang` (
  `MaKH` int NOT NULL AUTO_INCREMENT,
  `TenKH` varchar(100) NOT NULL,
  `SDT` varchar(15) DEFAULT NULL,
  `Email` varchar(100) DEFAULT NULL,
  PRIMARY KEY (`MaKH`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `khachhang`
--

LOCK TABLES `khachhang` WRITE;
/*!40000 ALTER TABLE `khachhang` DISABLE KEYS */;
INSERT INTO `khachhang` VALUES (1,'Nguyen Van A','0901234567','a@gmail.com'),(2,'Tran Thi B','0909876543','b@yahoo.com');
/*!40000 ALTER TABLE `khachhang` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `phim`
--

DROP TABLE IF EXISTS `phim`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `phim` (
  `MaPhim` int NOT NULL AUTO_INCREMENT,
  `TenPhim` varchar(100) NOT NULL,
  `TheLoai` varchar(50) DEFAULT NULL,
  `DaoDien` varchar(100) DEFAULT NULL,
  `ThoiLuong` int DEFAULT NULL,
  `NgayKhoiChieu` date DEFAULT NULL,
  `DoTuoiChoPhep` int DEFAULT NULL,
  PRIMARY KEY (`MaPhim`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `phim`
--

LOCK TABLES `phim` WRITE;
/*!40000 ALTER TABLE `phim` DISABLE KEYS */;
INSERT INTO `phim` VALUES (1,'Avengers: Endgame','Hành động','Anthony Russo',180,'2025-07-20',13),(2,'Inside Out 2','Hoạt hình','Kelsey Mann',100,'2025-06-15',6);
/*!40000 ALTER TABLE `phim` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `phongchieu`
--

DROP TABLE IF EXISTS `phongchieu`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `phongchieu` (
  `MaPhong` int NOT NULL AUTO_INCREMENT,
  `TenPhong` varchar(50) NOT NULL,
  `SoGhe` int DEFAULT NULL,
  `LoaiPhong` enum('2D','3D','IMAX') DEFAULT NULL,
  PRIMARY KEY (`MaPhong`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `phongchieu`
--

LOCK TABLES `phongchieu` WRITE;
/*!40000 ALTER TABLE `phongchieu` DISABLE KEYS */;
INSERT INTO `phongchieu` VALUES (1,'Phòng 2D - A',60,'2D'),(2,'Phòng 3D - B',40,'3D');
/*!40000 ALTER TABLE `phongchieu` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `suatchieu`
--

DROP TABLE IF EXISTS `suatchieu`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `suatchieu` (
  `MaSuatChieu` int NOT NULL AUTO_INCREMENT,
  `MaPhim` int DEFAULT NULL,
  `MaPhong` int DEFAULT NULL,
  `NgayChieu` date DEFAULT NULL,
  `GioChieu` time DEFAULT NULL,
  `GiaVe` decimal(10,2) DEFAULT NULL,
  PRIMARY KEY (`MaSuatChieu`),
  KEY `MaPhim` (`MaPhim`),
  KEY `MaPhong` (`MaPhong`),
  CONSTRAINT `suatchieu_ibfk_1` FOREIGN KEY (`MaPhim`) REFERENCES `phim` (`MaPhim`),
  CONSTRAINT `suatchieu_ibfk_2` FOREIGN KEY (`MaPhong`) REFERENCES `phongchieu` (`MaPhong`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `suatchieu`
--

LOCK TABLES `suatchieu` WRITE;
/*!40000 ALTER TABLE `suatchieu` DISABLE KEYS */;
INSERT INTO `suatchieu` VALUES (1,1,1,'2025-07-21','18:30:00', 60000.00),(2,2,2,'2025-07-21','20:00:00', 60000.00);
/*!40000 ALTER TABLE `suatchieu` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `ve`
--

DROP TABLE IF EXISTS `ve`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `ve` (
  `MaVe` int NOT NULL AUTO_INCREMENT,
  `MaSuatChieu` int DEFAULT NULL,
  `MaKH` int DEFAULT NULL,
  `MaGhe` int DEFAULT NULL,
  `NgayDat` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `GiaVe` decimal(10,2) DEFAULT NULL,
  `TrangThai` enum('DaDat','DaSuDung','DaHuy') DEFAULT 'DaDat',
  PRIMARY KEY (`MaVe`),
  KEY `MaSuatChieu` (`MaSuatChieu`),
  KEY `MaKH` (`MaKH`),
  KEY `MaGhe` (`MaGhe`),
  CONSTRAINT `ve_ibfk_1` FOREIGN KEY (`MaSuatChieu`) REFERENCES `suatchieu` (`MaSuatChieu`),
  CONSTRAINT `ve_ibfk_2` FOREIGN KEY (`MaKH`) REFERENCES `khachhang` (`MaKH`),
  CONSTRAINT `ve_ibfk_3` FOREIGN KEY (`MaGhe`) REFERENCES `ghe` (`MaGhe`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `ve`
--

LOCK TABLES `ve` WRITE;
/*!40000 ALTER TABLE `ve` DISABLE KEYS */;
INSERT INTO `ve` VALUES (1,1,1,1,'2025-07-09 20:34:22',60000.00,'DaDat'),(2,1,1,4,'2025-07-09 20:34:22',90000.00,'DaDat'),(3,2,2,7,'2025-07-09 20:34:22',60000.00,'DaDat');
/*!40000 ALTER TABLE `ve` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2025-07-09 20:37:05

-- Trigger kiểm tra tính hợp lệ của thời gian đặt vé (trước 15p khi suat chiếu bắt đầu)
DELIMITER $$

CREATE TRIGGER trg_check_thoigiandatve
BEFORE INSERT ON ve
FOR EACH ROW
BEGIN
    DECLARE v_NgayChieu DATE;
    DECLARE v_GioChieu TIME;
    DECLARE v_ThoiGianChieu DATETIME;
    DECLARE v_ThoiGianNgungDatVe DATETIME;

    IF NEW.MaSuatChieu IS NULL THEN
        SIGNAL SQLSTATE '45000'
            SET MESSAGE_TEXT = 'MaSuatChieu khong duoc NULL.';
    END IF;

    -- Kiểm tra sự tồn tại và dữ liệu hợp lệ
    IF NOT EXISTS ( SELECT 1 FROM suatchieu WHERE MaSuatChieu = NEW.MaSuatChieu) THEN
		SIGNAL SQLSTATE '45000'
            SET MESSAGE_TEXT = 'Suat chieu khong ton tai hoac thieu thong tin NgayChieu/GioChieu.';
	ELSE
        SELECT NgayChieu, GioChieu
        INTO v_NgayChieu, v_GioChieu
        FROM suatchieu
        WHERE MaSuatChieu = NEW.MaSuatChieu;

        SET v_ThoiGianChieu = TIMESTAMP(v_NgayChieu, v_GioChieu);
        SET v_ThoiGianNgungDatVe = v_ThoiGianChieu - INTERVAL 15 MINUTE;

		IF NOW() >= v_ThoiGianNgungDatVe THEN
			SIGNAL SQLSTATE '45000'
				SET MESSAGE_TEXT = 'Khong duoc dat ve sau khi con 15 phut nua la phim bat dau.';
		END IF;
	
        SET NEW.NgayDat = NOW();
        
    END IF;
END$$

DELIMITER ;

DELIMITER $$

CREATE TRIGGER trg_tinh_tien_ve
BEFORE INSERT ON ve
FOR EACH ROW
BEGIN
    DECLARE v_GiaVe DECIMAL(10,2);
    DECLARE v_LoaiGhe ENUM('THUONG','VIP');
    DECLARE v_PhuThu DECIMAL(10,2) DEFAULT 0;

    -- Lấy giá vé gốc từ suatchieu
    SELECT GiaVe
    INTO v_GiaVe
    FROM suatchieu
    WHERE MaSuatChieu = NEW.MaSuatChieu;

    -- Nếu không tìm thấy suatchieu → báo lỗi
    IF v_GiaVe IS NULL THEN
        SIGNAL SQLSTATE '45000'
            SET MESSAGE_TEXT = 'Khong tim thay suatchieu hoac suatchieu chua co GiaVe.';
    END IF;

    -- Lấy loại ghế
    SELECT LoaiGhe
    INTO v_LoaiGhe
    FROM ghe
    WHERE MaGhe = NEW.MaGhe;

    -- Nếu không tìm thấy ghế → báo lỗi
    IF v_LoaiGhe IS NULL THEN
        SIGNAL SQLSTATE '45000'
            SET MESSAGE_TEXT = 'Khong tim thay thong tin ghe.';
    END IF;

    -- Xác định phụ thu nếu ghế VIP
    IF v_LoaiGhe = 'VIP' THEN
        SET v_PhuThu = v_GiaVe * 0.15;
    END IF;

    -- Gán giá vé cuối cùng
    SET NEW.GiaVe = v_GiaVe + v_PhuThu;
END$$

DELIMITER ;

DELIMITER $$

CREATE TRIGGER trg_tinh_tien_hoadon
BEFORE INSERT ON hoadon
FOR EACH ROW
BEGIN
    DECLARE v_GiaVe DECIMAL(10,2) DEFAULT 0;
    DECLARE v_GiaCombo DECIMAL(10,2) DEFAULT 0;
    DECLARE v_TongTien DECIMAL(10,2);

    -- Lấy giá vé từ bảng ve
    IF NEW.MaVe IS NOT NULL THEN
        SELECT GiaVe
        INTO v_GiaVe
        FROM ve
        WHERE MaVe = NEW.MaVe;

        -- Nếu không tìm thấy vé → báo lỗi
        IF v_GiaVe IS NULL THEN
            SIGNAL SQLSTATE '45000'
                SET MESSAGE_TEXT = 'Khong tim thay thong tin ve.';
        END IF;
    END IF;

    -- Lấy giá combo từ bảng combo (nếu có chọn combo)
    IF NEW.MaCombo IS NOT NULL THEN
        SELECT GiaCombo
        INTO v_GiaCombo
        FROM combo
        WHERE MaCombo = NEW.MaCombo;

        -- Nếu không tìm thấy combo → báo lỗi
        IF v_GiaCombo IS NULL THEN
            SIGNAL SQLSTATE '45000'
                SET MESSAGE_TEXT = 'Khong tim thay thong tin combo.';
        END IF;
    END IF;

    -- Tính tổng tiền:
    SET v_TongTien = v_GiaVe + (v_GiaCombo * IFNULL(NEW.SoLuong, 1));

    -- Gán vào NEW.TongTien
    SET NEW.TongTien = v_TongTien;
END$$

DELIMITER ;


-- Kiểm tra ghế còn trống

DELIMITER //

CREATE FUNCTION KiemTraGheConTrong (p_MaSuatChieu INT) RETURNS INT
DETERMINISTIC
BEGIN
    DECLARE v_TongGhe INT;
    DECLARE v_GheDaDat INT;
    DECLARE v_MaPhong INT;
    
    SELECT MaPhong INTO v_MaPhong
    FROM suatchieu
    WHERE MaSuatChieu = p_MaSuatChieu;
    
    IF v_MaPhong IS NULL THEN
        RETURN -1;
    END IF;
    
    SELECT SoGhe INTO v_TongGhe
    FROM phongchieu
    WHERE MaPhong = v_MaPhong;
    
    SELECT COUNT(*) INTO v_GheDaDat
    FROM ve
    WHERE MaSuatChieu = p_MaSuatChieu AND TrangThai = 'DaDat';
    
    IF v_GheDaDat IS NULL THEN
        SET v_GheDaDat = 0;
    END IF;
    
    RETURN GREATEST(0, v_TongGhe - v_GheDaDat);
END //

DELIMITER ;

-- Kiểm tra số ghế còn trống

-- SHOW TABLES;
-- SELECT * FROM phim;
-- SELECT KiemTraGheConTrong(1);

-- Tính tổng tiền combo 

DELIMITER //

CREATE FUNCTION TinhTongTienCombo(MaCombo INT, SoLuong INT) RETURNS DECIMAL(10,2)
DETERMINISTIC
BEGIN
    DECLARE Gia DECIMAL(10,2);

    SELECT GiaCombo INTO Gia
    FROM combo
    WHERE combo.MaCombo = MaCombo;

    IF Gia IS NULL THEN
        RETURN 0;
    END IF;

    RETURN Gia * SoLuong;
END //

DELIMITER ;

-- SELECT TinhTongTienCombo(1, 3);

-- Đếm số vé bán theo phim 

DELIMITER //

CREATE FUNCTION DemSoVeDaBanTheoPhim(MaPhim INT) RETURNS INT
DETERMINISTIC
BEGIN
    DECLARE sl INT;

    SELECT COUNT(*) INTO sl
    FROM ve v
    JOIN suatchieu s ON v.MaSuatChieu = s.MaSuatChieu
    WHERE s.MaPhim = MaPhim AND v.TrangThai = 'DaDat';

    RETURN sl;
END //

DELIMITER ;

-- SELECT DemSoVeDaBanTheoPhim(1);

-- STORED PROCEDURES

DELIMITER //

CREATE PROCEDURE sp_LayDanhSachSuatChieuTheoNgay(
    IN p_MaPhim INT,
    IN p_NgayChieu DATE
)
BEGIN
    SELECT 
        sc.MaSuatChieu,
        p.TenPhim,
        pc.TenPhong,
        pc.LoaiPhong,
        sc.NgayChieu,
        sc.GioChieu,
        sc.GiaVe,
        pc.SoGhe,
        (pc.SoGhe - IFNULL(COUNT(v.MaVe), 0)) AS GheConTrong
    FROM suatchieu sc
    INNER JOIN phim p ON sc.MaPhim = p.MaPhim
    INNER JOIN phongchieu pc ON sc.MaPhong = pc.MaPhong
    LEFT JOIN ve v ON sc.MaSuatChieu = v.MaSuatChieu AND v.TrangThai = 'DaDat'
    WHERE sc.MaPhim = p_MaPhim 
        AND sc.NgayChieu = p_NgayChieu
    GROUP BY sc.MaSuatChieu, p.TenPhim, pc.TenPhong, pc.LoaiPhong, 
             sc.NgayChieu, sc.GioChieu, sc.GiaVe, pc.SoGhe
    ORDER BY sc.GioChieu ASC;
END //

DELIMITER ;

-- 2. PROCEDURE: Kiểm tra ghế trống cho một suất chiếu
-- Mục đích: Hiển thị sơ đồ ghế và trạng thái đặt
DELIMITER //

CREATE PROCEDURE sp_KiemTraGheTrong(
    IN p_MaSuatChieu INT
)
BEGIN
    SELECT 
        g.MaGhe,
        g.SoHang,
        g.STTGhe,
        g.LoaiGhe,
        CASE 
            WHEN v.MaVe IS NOT NULL THEN 'DaDat'
            ELSE 'ConTrong'
        END AS TrangThaiGhe,
        CASE 
            WHEN g.LoaiGhe = 'VIP' THEN sc.GiaVe * 1.15
            ELSE sc.GiaVe
        END AS GiaVeThucTe
    FROM ghe g
    INNER JOIN phongchieu pc ON g.MaPhong = pc.MaPhong
    INNER JOIN suatchieu sc ON pc.MaPhong = sc.MaPhong
    LEFT JOIN ve v ON g.MaGhe = v.MaGhe 
                   AND v.MaSuatChieu = p_MaSuatChieu 
                   AND v.TrangThai = 'DaDat'
    WHERE sc.MaSuatChieu = p_MaSuatChieu
    ORDER BY g.SoHang ASC, g.STTGhe ASC;
END //

DELIMITER ;

-- 3. PROCEDURE: Đặt vé (Transaction an toàn)
-- Mục đích: Xử lý đặt vé với kiểm tra tính hợp lệ
DELIMITER //

CREATE PROCEDURE sp_DatVe(
    IN p_MaSuatChieu INT,
    IN p_MaKH INT,
    IN p_MaGhe INT,
    OUT p_KetQua VARCHAR(255),
    OUT p_MaVe INT
)
BEGIN
    DECLARE v_Count INT DEFAULT 0;
    DECLARE v_GiaVe DECIMAL(10,2);
    DECLARE EXIT HANDLER FOR SQLEXCEPTION 
    BEGIN
        ROLLBACK;
        SET p_KetQua = 'Lỗi khi đặt vé. Vui lòng thử lại.';
        SET p_MaVe = NULL;
    END;   
    START TRANSACTION;    
    -- Kiểm tra ghế đã được đặt chưa
    SELECT COUNT(*) INTO v_Count
    FROM ve 
    WHERE MaSuatChieu = p_MaSuatChieu 
        AND MaGhe = p_MaGhe 
        AND TrangThai = 'DaDat';       
    IF v_Count > 0 THEN
        SET p_KetQua = 'Ghế đã được đặt!';
        SET p_MaVe = NULL;
        ROLLBACK;
    ELSE
        -- Thêm vé mới
        INSERT INTO ve (MaSuatChieu, MaKH, MaGhe, TrangThai)
        VALUES (p_MaSuatChieu, p_MaKH, p_MaGhe, 'DaDat');
        
        SET p_MaVe = LAST_INSERT_ID();
        SET p_KetQua = 'Đặt vé thành công!';      
        COMMIT;
    END IF;
END //

DELIMITER ;

-- 4. PROCEDURE: Báo cáo doanh thu theo ngày
-- Mục đích: Thống kê doanh thu hàng ngày
DELIMITER //

CREATE PROCEDURE sp_BaoCaoDoanhThuTheoNgay(
    IN p_NgayBatDau DATE,
    IN p_NgayKetThuc DATE
)
BEGIN
    SELECT 
        DATE(h.NgayMua) AS NgayBan,
        SUM(h.TongTien) AS TongDoanhThu,
        COUNT(DISTINCT h.MaHoaDon) AS SoHoaDon,
        COUNT(DISTINCT h.MaVe) AS SoVeBan,
        AVG(h.TongTien) AS DoanhThuTrungBinh
    FROM hoadon h
    WHERE DATE(h.NgayMua) BETWEEN p_NgayBatDau AND p_NgayKetThuc
    GROUP BY DATE(h.NgayMua)
    ORDER BY DATE(h.NgayMua) DESC;
END //

DELIMITER ;

-- 5. PROCEDURE: Báo cáo doanh thu theo phim
-- Mục đích: Xem phim nào bán chạy nhất
DELIMITER //

CREATE PROCEDURE sp_BaoCaoDoanhThuTheoPhim(
    IN p_NgayBatDau DATE,
    IN p_NgayKetThuc DATE
)
BEGIN
    SELECT 
        p.MaPhim,
        p.TenPhim,
        p.TheLoai,
        COUNT(DISTINCT v.MaVe) AS SoVeBan,
        SUM(v.GiaVe) AS DoanhThuVe,
        SUM(IFNULL(h.TongTien, 0)) AS TongDoanhThu,
        AVG(v.GiaVe) AS GiaVeTrungBinh
    FROM phim p
    INNER JOIN suatchieu sc ON p.MaPhim = sc.MaPhim
    INNER JOIN ve v ON sc.MaSuatChieu = v.MaSuatChieu
    LEFT JOIN hoadon h ON v.MaVe = h.MaVe
    WHERE v.TrangThai = 'DaDat'
        AND DATE(v.NgayDat) BETWEEN p_NgayBatDau AND p_NgayKetThuc
    GROUP BY p.MaPhim, p.TenPhim, p.TheLoai
    ORDER BY DoanhThuVe DESC;
END //

DELIMITER ;

-- 6. PROCEDURE: Thống kê khách hàng thường xuyên
-- Mục đích: Xác định khách hàng VIP để chăm sóc
DELIMITER //

CREATE PROCEDURE sp_ThongKeKhachHangThuongXuyen(
    IN p_SoThangGanNhat INT
)
BEGIN
    SELECT 
        kh.MaKH,
        kh.TenKH,
        kh.SDT,
        kh.Email,
        COUNT(DISTINCT h.MaHoaDon) AS SoLanMua,
        SUM(h.TongTien) AS TongChiTieu,
        AVG(h.TongTien) AS ChiTieuTrungBinh,
        MAX(h.NgayMua) AS LanMuaGanNhat
    FROM khachhang kh
    INNER JOIN hoadon h ON kh.MaKH = h.MaKH
    WHERE h.NgayMua >= DATE_SUB(NOW(), INTERVAL p_SoThangGanNhat MONTH)
    GROUP BY kh.MaKH, kh.TenKH, kh.SDT, kh.Email
    HAVING SoLanMua >= 3  -- Khách hàng mua ít nhất 3 lần
    ORDER BY TongChiTieu DESC;
END //

DELIMITER ;

-- 7. PROCEDURE: Tạo hóa đơn tự động
-- Mục đích: Tạo hóa đơn khi khách hàng thanh toán
DELIMITER //

CREATE PROCEDURE sp_TaoHoaDon(
    IN p_MaKH INT,
    IN p_MaVe INT,
    IN p_MaCombo INT,
    IN p_SoLuongCombo INT,
    OUT p_MaHoaDon INT,
    OUT p_TongTien DECIMAL(10,2)
)
BEGIN
    DECLARE v_GiaVe DECIMAL(10,2) DEFAULT 0;
    DECLARE v_TienCombo DECIMAL(10,2) DEFAULT 0; 
    -- Lấy giá vé
    SELECT GiaVe INTO v_GiaVe
    FROM ve 
    WHERE MaVe = p_MaVe; 
    -- Tính tiền combo nếu có
    IF p_MaCombo IS NOT NULL AND p_SoLuongCombo > 0 THEN
        SET v_TienCombo = TinhTongTienCombo(p_MaCombo, p_SoLuongCombo);
    END IF; 
    -- Tính tổng tiền
    SET p_TongTien = v_GiaVe + v_TienCombo; 
    -- Tạo hóa đơn
    INSERT INTO hoadon (MaKH, MaVe, MaCombo, SoLuong, NgayMua, TongTien)
    VALUES (p_MaKH, p_MaVe, p_MaCombo, p_SoLuongCombo, NOW(), p_TongTien);
    
    SET p_MaHoaDon = LAST_INSERT_ID();
END //

DELIMITER ;

-- 8. PROCEDURE: Lấy lịch chiếu đầy đủ theo ngày
-- Mục đích: Hiển thị toàn bộ lịch chiếu của rạp trong ngày
DELIMITER //

CREATE PROCEDURE sp_LayLichChieuDayDu(
    IN p_NgayChieu DATE
)
BEGIN
    SELECT 
        sc.MaSuatChieu,
        p.TenPhim,
        p.TheLoai,
        p.ThoiLuong,
        p.DoTuoiChoPhep,
        pc.TenPhong,
        pc.LoaiPhong,
        sc.GioChieu,
        sc.GiaVe,
        KiemTraGheConTrong(sc.MaSuatChieu) AS GheConTrong,
        pc.SoGhe AS TongSoGhe
    FROM suatchieu sc
    INNER JOIN phim p ON sc.MaPhim = p.MaPhim
    INNER JOIN phongchieu pc ON sc.MaPhong = pc.MaPhong
    WHERE sc.NgayChieu = p_NgayChieu
    ORDER BY sc.GioChieu ASC, pc.TenPhong ASC;
END //

DELIMITER ;

-- 9. PROCEDURE: Hủy vé
-- Mục đích: Xử lý hủy vé trước giờ chiếu
DELIMITER //

CREATE PROCEDURE sp_HuyVe(
    IN p_MaVe INT,
    OUT p_KetQua VARCHAR(255)
)
BEGIN
    DECLARE v_NgayChieu DATE;
    DECLARE v_GioChieu TIME;
    DECLARE v_ThoiGianChieu DATETIME;  
    -- Lấy thông tin suất chiếu
    SELECT sc.NgayChieu, sc.GioChieu
    INTO v_NgayChieu, v_GioChieu
    FROM ve v
    INNER JOIN suatchieu sc ON v.MaSuatChieu = sc.MaSuatChieu
    WHERE v.MaVe = p_MaVe;
    
    SET v_ThoiGianChieu = TIMESTAMP(v_NgayChieu, v_GioChieu);   
    -- Kiểm tra thời gian hủy (trước 30 phút)
    IF NOW() >= (v_ThoiGianChieu - INTERVAL 30 MINUTE) THEN
        SET p_KetQua = 'Không thể hủy vé sau 30 phút trước giờ chiếu!';
    ELSE
        UPDATE ve 
        SET TrangThai = 'DaHuy'
        WHERE MaVe = p_MaVe;
        
        SET p_KetQua = 'Hủy vé thành công!';
    END IF;
END //

DELIMITER ;

-- 10. PROCEDURE: Thống kê hiệu suất phòng chiếu
-- Mục đích: Đánh giá tỷ lệ lấp đầy của các phòng chiếu
DELIMITER //

CREATE PROCEDURE sp_ThongKeHieuSuatPhongChieu(
    IN p_NgayBatDau DATE,
    IN p_NgayKetThuc DATE
)
BEGIN
    SELECT 
        pc.MaPhong,
        pc.TenPhong,
        pc.LoaiPhong,
        pc.SoGhe,
        COUNT(DISTINCT sc.MaSuatChieu) AS SoSuatChieu,
        COUNT(v.MaVe) AS TongVeBan,
        (COUNT(DISTINCT sc.MaSuatChieu) * pc.SoGhe) AS TongChoNgoi,
        ROUND((COUNT(v.MaVe) * 100.0) / (COUNT(DISTINCT sc.MaSuatChieu) * pc.SoGhe), 2) AS TyLeLapDay
    FROM phongchieu pc
    INNER JOIN suatchieu sc ON pc.MaPhong = sc.MaPhong
    LEFT JOIN ve v ON sc.MaSuatChieu = v.MaSuatChieu AND v.TrangThai = 'DaDat'
    WHERE sc.NgayChieu BETWEEN p_NgayBatDau AND p_NgayKetThuc
    GROUP BY pc.MaPhong, pc.TenPhong, pc.LoaiPhong, pc.SoGhe
    ORDER BY TyLeLapDay DESC;
END //

DELIMITER ;
