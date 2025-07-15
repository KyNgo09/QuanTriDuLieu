## Hướng dẫn cài đặt

### 1. Clone Project

```bash
git clone https://github.com/KyNgo09/QuanTriDuLieu.git
cd backend
```

---

### 2. Tạo Virtual Environment

```powershell
python -m venv .venv
.venv\Scripts\activate
```

---

### 3. Cài đặt thư viện

```bash
pip install -r requirements.txt
```

---

### 4. Cấu hình Database

Chỉnh sửa file:

```
app/config.py - Nhập password của DB vào
```

Ví dụ:

```python
MYSQL_CONFIG = {
    'host': 'localhost',
    'user': 'root',
    'password': 'db_password',
    'database': 'QLRapPhim'
}
```

---

### 5. Chạy Project

```bash
python run.py
```

Server sẽ chạy tại:

```
http://localhost:5000
```

---

## API Documentation

### 📋 Tổng quan API Endpoints

Backend hỗ trợ **8 modules chính** với **40+ endpoints** cho hệ thống quản lý rạp chiếu phim:

#### 🎬 1. PHIM (`/api/phim`)

| Method | Endpoint         | Mô tả                         |
| ------ | ---------------- | ----------------------------- |
| GET    | `/api/phim/`     | Lấy danh sách tất cả phim     |
| GET    | `/api/phim/{id}` | Lấy thông tin chi tiết 1 phim |
| POST   | `/api/phim/`     | Thêm phim mới                 |
| PUT    | `/api/phim/{id}` | Cập nhật thông tin phim       |
| DELETE | `/api/phim/{id}` | Xóa phim                      |

#### 🏢 2. PHÒNG CHIẾU (`/api/phongchieu`)

| Method | Endpoint               | Mô tả                                |
| ------ | ---------------------- | ------------------------------------ |
| GET    | `/api/phongchieu/`     | Lấy danh sách tất cả phòng chiếu     |
| GET    | `/api/phongchieu/{id}` | Lấy thông tin chi tiết 1 phòng chiếu |
| POST   | `/api/phongchieu/`     | Thêm phòng chiếu mới                 |
| PUT    | `/api/phongchieu/{id}` | Cập nhật thông tin phòng chiếu       |
| DELETE | `/api/phongchieu/{id}` | Xóa phòng chiếu                      |

#### 🎭 3. SUẤT CHIẾU (`/api/suatchieu`)

| Method | Endpoint              | Mô tả                               |
| ------ | --------------------- | ----------------------------------- |
| GET    | `/api/suatchieu/`     | Lấy danh sách tất cả suất chiếu     |
| GET    | `/api/suatchieu/{id}` | Lấy thông tin chi tiết 1 suất chiếu |
| POST   | `/api/suatchieu/`     | Thêm suất chiếu mới                 |
| PUT    | `/api/suatchieu/{id}` | Cập nhật thông tin suất chiếu       |
| DELETE | `/api/suatchieu/{id}` | Xóa suất chiếu                      |

#### 💺 4. GHẾ (`/api/ghe`)

| Method | Endpoint        | Mô tả                        |
| ------ | --------------- | ---------------------------- |
| GET    | `/api/ghe/`     | Lấy danh sách tất cả ghế     |
| GET    | `/api/ghe/{id}` | Lấy thông tin chi tiết 1 ghế |
| POST   | `/api/ghe/`     | Thêm ghế mới                 |
| PUT    | `/api/ghe/{id}` | Cập nhật thông tin ghế       |
| DELETE | `/api/ghe/{id}` | Xóa ghế                      |

#### 🍿 5. COMBO (`/api/combo`)

| Method | Endpoint          | Mô tả                          |
| ------ | ----------------- | ------------------------------ |
| GET    | `/api/combo/`     | Lấy danh sách tất cả combo     |
| GET    | `/api/combo/{id}` | Lấy thông tin chi tiết 1 combo |
| POST   | `/api/combo/`     | Thêm combo mới                 |
| PUT    | `/api/combo/{id}` | Cập nhật thông tin combo       |
| DELETE | `/api/combo/{id}` | Xóa combo                      |

#### 👤 6. KHÁCH HÀNG (`/api/khachhang`)

| Method | Endpoint              | Mô tả                               |
| ------ | --------------------- | ----------------------------------- |
| GET    | `/api/khachhang/`     | Lấy danh sách tất cả khách hàng     |
| GET    | `/api/khachhang/{id}` | Lấy thông tin chi tiết 1 khách hàng |
| POST   | `/api/khachhang/`     | Thêm khách hàng mới                 |
| PUT    | `/api/khachhang/{id}` | Cập nhật thông tin khách hàng       |
| DELETE | `/api/khachhang/{id}` | Xóa khách hàng                      |

#### 🎫 7. VÉ (`/api/ve`)

| Method | Endpoint                    | Mô tả                        |
| ------ | --------------------------- | ---------------------------- |
| GET    | `/api/ve/`                  | Lấy danh sách tất cả vé      |
| GET    | `/api/ve/{id}`              | Lấy thông tin chi tiết 1 vé  |
| POST   | `/api/ve/`                  | Thêm vé mới (đặt vé)         |
| PUT    | `/api/ve/{id}`              | Cập nhật thông tin vé        |
| DELETE | `/api/ve/{id}`              | Xóa vé                       |
| GET    | `/api/ve/khachhang/{ma_kh}` | Lấy tất cả vé của khách hàng |
| GET    | `/api/ve/suatchieu/{ma_sc}` | Lấy tất cả vé của suất chiếu |

#### 💰 8. HÓA ĐƠN (`/api/hoadon`)

| Method | Endpoint                        | Mô tả                            |
| ------ | ------------------------------- | -------------------------------- |
| GET    | `/api/hoadon/`                  | Lấy danh sách tất cả hóa đơn     |
| GET    | `/api/hoadon/{id}`              | Lấy thông tin chi tiết 1 hóa đơn |
| POST   | `/api/hoadon/`                  | Tạo hóa đơn mới                  |
| PUT    | `/api/hoadon/{id}`              | Cập nhật thông tin hóa đơn       |
| DELETE | `/api/hoadon/{id}`              | Xóa hóa đơn                      |
| GET    | `/api/hoadon/khachhang/{ma_kh}` | Lấy hóa đơn của khách hàng       |
| GET    | `/api/hoadon/ve/{ma_ve}`        | Lấy hóa đơn theo vé              |
| GET    | `/api/hoadon/combo/{ma_combo}`  | Lấy hóa đơn theo combo           |
| GET    | `/api/hoadon/doanhthu/{ngay}`   | Thống kê doanh thu theo ngày     |

### 🛠️ Tính năng đặc biệt

#### ✅ Error Handling

- Tất cả endpoints đều có **try-catch-finally**
- **Rollback transactions** khi có lỗi
- **Detailed error messages** cho debugging

#### ✅ Partial Update Support

- Tất cả **PUT endpoints** hỗ trợ cập nhật một phần
- Chỉ cập nhật những trường có trong request body
- Không cần gửi toàn bộ dữ liệu

#### ✅ Data Return

- **POST endpoints** trả về data của record vừa tạo
- **PUT endpoints** trả về data sau khi cập nhật
- **Auto-conversion** datetime/timedelta sang JSON format

### 📊 Response Format

#### Success Response:

```json
{
  "message": "Thành công",
  "data": { ... }
}
```

#### Error Response:

```json
{
  "message": "Mô tả lỗi",
  "error": "Chi tiết lỗi kỹ thuật"
}
```

## Ghi chú

- Để cập nhật file `requirements.txt`:

```bash
pip freeze > requirements.txt
```

- Để tắt virtual environment:

**Windows:**

```
deactivate
```

---

## Liên hệ

Mọi thắc mắc vui lòng liên hệ nhóm thực hiện dự án.
