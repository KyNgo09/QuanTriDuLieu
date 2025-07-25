# 🎬 Hệ Thống Quản Lý Rạp Chiếu Phim

![Cinema Management System](https://img.shields.io/badge/Cinema-Management%20System-blue?style=for-the-badge&logo=video)
![Version](https://img.shields.io/badge/Version-1.0.0-green?style=for-the-badge)
![Status](https://img.shields.io/badge/Status-Completed-success?style=for-the-badge)

_Hệ thống quản lý rạp phim hiện đại với giao diện trực quan và tính năng đầy đủ_

</div>

---

## 🎯 Mục Tiêu Dự Án

Xây dựng **hệ thống quản lý rạp phim đơn giản, trực quan** nhằm:

✅ **Hỗ trợ quản lý đặt vé** - Quy trình đặt vé thuận tiện và hiệu quả  
✅ **Quản lý hoạt động rạp** - Phim, suất chiếu, phòng chiếu, ghế ngồi  
✅ **Thống kê doanh thu** - Báo cáo doanh thu bán vé và combo theo ngày  
✅ **Giao diện thân thiện** - Dễ sử dụng cho nhân viên quản lý

---

## 🛠️ Công Nghệ Sử Dụng

### **Database**

- **MySQL 8.0+** - Hệ quản trị cơ sở dữ liệu quan hệ
- **9 bảng chính** với thiết kế chuẩn hóa 3NF
- **Triggers & Functions** tự động hóa nghiệp vụ
- **Stored Procedures** xử lý logic phức tạp

### **Backend**

- **Flask (Python)** - Web framework nhẹ và linh hoạt
- **JWT Authentication** - Xác thực người dùng bảo mật
- **RESTful API** - 45+ endpoints cho 9 modules chính

### **Frontend**

- **HTML5/CSS3** - Giao diện responsive hiện đại
- **JavaScript (ES6+)** - Tương tác động và API calls
- **Bootstrap 5** - Framework CSS cho UI đẹp
- **Chart.js** - Thư viện vẽ biểu đồ thống kê
- **XLSX.js** - Xuất báo cáo Excel

---

## ⚙️ Kỹ Thuật Database Nâng Cao

### **🔧 Triggers (Tự động hóa nghiệp vụ)**

| Trigger                              | Chức năng                                       |
| ------------------------------------ | ----------------------------------------------- |
| `update_so_luong_ghe`                | Tự động cập nhật số lượng ghế khi thêm/xóa ghế  |
| `trg_check_thoigiandatve`            | Kiểm tra thời gian đặt vé (trước 15 phút chiếu) |
| `trg_tinh_tien_ve`                   | Tự động tính giá vé (bao gồm phụ thu VIP 15%)   |
| `trg_check_thoi_gian_them_suatchieu` | Kiểm tra thời gian hợp lệ khi thêm suất chiếu   |
| `trg_tinh_tien_hoadon`               | Tự động tính tổng tiền hóa đơn combo            |

### **⚡ Functions (Tính toán thông minh)**

| Function                 | Mục đích                              |
| ------------------------ | ------------------------------------- |
| `KiemTraGheConTrong()`   | Đếm số ghế còn trống trong suất chiếu |
| `DemSoVeDaBanTheoPhim()` | Thống kê số vé bán theo phim          |

### **📊 Stored Procedures (Báo cáo chuyên sâu)**

| Procedure                     | Chức năng                       |
| ----------------------------- | ------------------------------- |
| `sp_BaoCaoDoanhThuTheoNgay()` | Báo cáo doanh thu theo ngày     |
| `sp_BaoCaoDoanhThuTheoPhim()` | Phân tích doanh thu theo phim   |
| `sp_LayLichChieuDayDu()`      | Lấy lịch chiếu đầy đủ theo ngày |

---

## 🎮 Chức Năng Chính

### **🔐 1. Chức năng đăng nhập**

- Xác thực JWT an toàn
- Quản lý session tự động
- Bảo vệ toàn bộ hệ thống

### **📋 2. Chức năng quản lý (CRUD + Tìm kiếm + Xuất Excel)**

| Module             | Tính năng chính                            | Đặc biệt                                |
| ------------------ | ------------------------------------------ | --------------------------------------- |
| **🎬 Phim**        | Quản lý thông tin phim, thể loại, đạo diễn | Phân loại độ tuổi (P, K, T13, T16, T18) |
| **🏢 Phòng Chiếu** | Quản lý phòng 2D/3D/IMAX                   | Quản lý ghế tự động                     |
| **💺 Ghế**         | Sơ đồ ghế thường/VIP                       | Tính phụ thu VIP 15%                    |
| **🎭 Suất Chiếu**  | Lịch chiếu thông minh                      | Kiểm tra xung đột thời gian             |
| **🎫 Vé**          | Đặt vé với workflow cascade                | Chọn Suất chiếu → Hàng ghế → Số ghế     |
| **🍿 Combo**       | Combo bắp nước đa dạng                     | Tính giá tự động                        |
| **💰 Hóa Đơn**     | Thanh toán combo                           | Trigger tính tiền tự động               |
| **👤 Khách Hàng**  | Quản lý thông tin khách hàng               | Tích hợp với đặt vé                     |

### **📊 3. Báo cáo thống kê**

#### **💹 Dashboard Thống Kê Realtime**

- **Doanh thu theo ngày** - Biểu đồ line/bar với filter linh hoạt
- **Cơ cấu doanh thu** - Pie chart phân tích vé vs combo
- **Doanh thu theo phim** - Ranking các phim bán chạy
- **Tỷ lệ lấp đầy suất chiếu** - Donut chart theo từng suất

#### **📈 Tính năng nâng cao**

- **Preset date ranges** - 7 ngày, 30 ngày, tháng này/trước
- **Export Excel** - Báo cáo đa sheet chuyên nghiệp
- **Tab switching** - Xem dữ liệu dạng bảng và biểu đồ
- **Real-time updates** - Dữ liệu cập nhật tự động

---

## 🚀 Hướng Dẫn Cài Đặt

### **📋 Yêu Cầu Hệ Thống**

- **Python 3.8+**
- **MySQL 8.0+**
- **Web Browser** hiện đại (Chrome, Firefox, Safari)

### **⚡ Cài Đặt Nhanh**

#### **1️⃣ Clone Repository**

```bash
git clone https://github.com/KyNgo09/QuanTriDuLieu.git
cd QuanTriDuLieu
```

#### **2️⃣ Cài Đặt Backend**

```bash
cd backend

# Tạo virtual environment
python -m venv .venv
.venv\Scripts\activate  # Windows
# source .venv/bin/activate  # Linux/Mac

# Cài đặt dependencies
pip install -r requirements.txt
```

#### **3️⃣ Cấu Hình Database**

```bash
# backend/app/config.py
MYSQL_CONFIG = {
    'host': 'localhost',
    'user': 'root',
    'password': 'your_password',
    'database': 'qlrapphim'
}
```

#### **5️⃣ Chạy Server Ứng dụng**

```bash
# Khởi động backend server
python run.py

# Server chạy tại: http://localhost:5000
```

#### **6️⃣ Mở Frontend**

```bash
# Sử dụng Live Server (VS Code) hoặc mở trực tiếp
# Truy cập: http://localhost:5500
```

---

## 🎨 Giao Diện & Trải Nghiệm

### **🌟 Design Hiện Đại**

- **Dark Theme** sang trọng
- **Glass Morphism** hiệu ứng trong suốt
- **Smooth Animations** chuyển trang mượt mà

### **⚡ Hiệu Suất Cao**

- **Client-side Filtering** tìm kiếm nhanh
- **Real-time Updates** không cần refresh

### **🔍 Tìm Kiếm Thông Minh**

- **Multi-field Search** tìm kiếm đa trường
- **Advanced Filters** lọc theo nhiều tiêu chí

---

## 🎯 Workflow Đặt Vé Thông Minh

```bash
🎬 Chọn Suất Chiếu → 🔤 Chọn Hàng Ghế → 💺 Chọn Số Ghế → 👤 Nhập Thông Tin → ✅ Hoàn Thành
```

### **✨ Đặc điểm nổi bật:**

- **Smart Pricing** - Tự động tính phụ thu VIP
- **Error Prevention** - Ngăn chặn xung đột đặt vé

---

## 🎯 Workflow Đặt Vé Thông Minh

### **🔗 Quan Hệ Chính**

```bash
Phim (1:N) SuatChieu (N:1) PhongChieu
    ↓             ↓
   Ve (N:1) KhachHang   Ghe (N:1) PhongChieu
    ↓
HoaDon (N:1) Combo
```

### **⚡ Tối Ưu Hiệu Suấth**

- **Indexes** trên foreign keys và trường tìm kiếm
- **Triggers** tự động tính toán giá trị
- **Constraints** đảm bảo tính toàn vẹn dữ liệu
- **Procedures** cho complex queries

---

## 🔧 Cấu Trúc Dự Án

```bash
📦 QuanTriDuLieu/
├── 📂 backend/
│   ├── 📂 app/
│   │   ├── 📂 routes/          # 9 modules API
│   │   ├── 📂 models/          # Database models
│   │   └── 📂 utils/           # Helper functions
│   ├── 📄 run.py              # Application entry
│   └── 📄 requirements.txt    # Dependencies
├── 📂 frontend/
│   ├── 📄 *.html              # 9 trang quản lý
│   ├── 📂 js/                 # JavaScript modules
│   ├── 📂 css/                # Stylesheets
│   └── 📂 component/          # Reusable components
├── 📄 qlrapphim.sql           # Database schema
└── 📄 README.md               # Documentation
```

---

## 📈 Thống Kê Dự Án

| **Metric**         | **Số lượng**          |
| ------------------ | --------------------- |
| **Tables**         | 9 bảng chính          |
| **API Endpoints**  | 45+ endpoints         |
| **Triggers**       | 5 triggers tự động    |
| **Functions**      | 2 functions tính toán |
| **Procedures**     | 3 procedures báo cáo  |
| **Frontend Pages** | 9 trang quản lý       |
| **Lines of Code**  | 5000+ dòng            |

---

## 📝 Ghi Chú Kỹ Thuật

### **📦 Dependencies**

```bash
# Cập nhật requirements.txt
pip freeze > requirements.txt

# Tắt virtual environment
deactivate
```

### **🔧 Troubleshooting**

- Đảm bảo MySQL service đang chạy
- Kiểm tra port 5000 không bị chiếm dụng
- Cấu hình CORS nếu chạy từ domain khác

---

## 👥 Thành Viên Nhóm

| **Họ Tên**           | **Đóng Góp**                                                       |
| -------------------- | ------------------------------------------------------------------ |
| **Trần Minh Hiểu**   | Tạo các Trigger. Chức năng quản lý Ghế, Suất chiếu, Thống kê.      |
| **Ngô Đại Kỳ**       | Thiết kế CSDL. Chức năng quản lý Combo, Hóa đơn. Xác thực.         |
| **Nguyễn Duy Thanh** | Tạo các Procedure. Chức năng quản lý Phim, Phòng chiếu, Xuất file. |
| **Quách Tuấn Khang** | Tạo các Function. Chức năng quản lý Khách hàng, Đặt vé.            |
