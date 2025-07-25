const API_BASE_URL = "http://127.0.0.1:5000/api";

// Ticket API
class VeAPI {
  static getToken() {
    return localStorage.getItem("token");
  }

  static async getTickets() {
    const token = this.getToken();
    if (!token) throw new Error("Vui lòng đăng nhập");
    try {
      const response = await fetch(`${API_BASE_URL}/ve/`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error("Error fetching vé list:", error);
      throw error;
    }
  }

  static async addTicket(ticketData) {
    const token = this.getToken();
    if (!token) throw new Error("Vui lòng đăng nhập");
    try {
      const response = await fetch(`${API_BASE_URL}/ve/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(ticketData),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || `HTTP error! status: ${response.status}`);
      }
      return data;
    } catch (error) {
      console.error("Lỗi tạo vé:", error);
      throw error;
    }
  }

  static async updateTicket(ticketId, ticketData) {
    const token = this.getToken();
    if (!token) throw new Error("Vui lòng đăng nhập");

    try {
      const response = await fetch(`${API_BASE_URL}/ve/${ticketId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(ticketData),
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error("Error editing vé:", error);
      throw error;
    }
  }

  static async deleteTicket(ticketId) {
    const token = this.getToken();
    if (!token) throw new Error("Vui lòng đăng nhập");

    const response = await fetch(`${API_BASE_URL}/ve/${ticketId}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return await response.json();
  }

  static async getTicketsByID(ticketId) {
    const token = this.getToken();
    if (!token) throw new Error("Vui lòng đăng nhập");

    try {
      const response = await fetch(`${API_BASE_URL}/ve/${ticketId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error("Error fetching vé by ID:", error);
      throw error;
    }
  }

  static async getTicketsByMaKH(maKH) {
    try {
      const response = await fetch(`${API_BASE_URL}/ve/khachhang/${maKH}`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error("Error fetching vé by MaKH:", error);
      throw error;
    }
  }

  static async getTicketsByMaSuatChieu(maSuatChieu) {
    const token = this.getToken();
    if (!token) throw new Error("Vui lòng đăng nhập");

    try {
      const response = await fetch(
        `${API_BASE_URL}/ve/suatchieu/${maSuatChieu}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error("Error fetching vé by MaSuatChieu:", error);
      throw error;
    }
  }

  static async getAllSuatChieu() {
    const token = this.getToken();
    if (!token) throw new Error("Vui lòng đăng nhập");

    try {
      const response = await fetch(`${API_BASE_URL}/suatchieu/`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error("Error fetching all SuatChieu:", error);
      throw error;
    }
  }
}

async function loadSuatChieuOptions() {
  const select = document.getElementById("addMaSuatChieu");
  select.innerHTML = `<option value="">-- Chọn suất chiếu --</option>`;

  try {
    allSuatChieu = await VeAPI.getAllSuatChieu();

    allSuatChieu.sort((a, b) => {
      const dateA = new Date(`${a.NgayChieu}T${a.GioChieu}`);
      const dateB = new Date(`${b.NgayChieu}T${b.GioChieu}`);
      return dateB - dateA; // Sắp xếp từ mới đến cũ
    });

    allSuatChieu.forEach((sc) => {
      const option = document.createElement("option");
      option.value = sc.MaSuatChieu;
      option.textContent = `SC${sc.MaSuatChieu} - ${sc.Phim?.TenPhim} (${sc.NgayChieu} ${sc.GioChieu})`;

      select.appendChild(option);
    });
  } catch (err) {
    console.error("Lỗi khi tải suất chiếu:", err);
  }
}

let currentView = "table";
let allTickets = [];
let filteredTickets = [];
let allTicketsWithInfo = [];
let allSuatChieu = [];

// Load Tickets
async function loadTickets() {
  showLoading();
  try {
    const tickets = await VeAPI.getTickets();
    allTickets = tickets;
    console.log("Tất cả vé:", allTickets);

    const ticketsWithInfo = await Promise.all(
      tickets.map(async (allTicket) => {
        const thongTinVe = await formatThongTinVe(allTicket);
        return { ...allTicket, ...thongTinVe };
      })
    );

    allTicketsWithInfo = ticketsWithInfo;

    updateStats(ticketsWithInfo);
    if (currentView === "table") {
      loadTableView(ticketsWithInfo);
    } else {
      loadCardView(ticketsWithInfo);
    }
    updateEmptyState();
  } catch (error) {
    showAlert("Lỗi khi tạo danh sách vé: " + error.message, "danger");
  } finally {
    hideLoading();
  }
}

function updateStats(tickets) {
  animateNumber("totalTicketsCount", tickets.length);

  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();
  const newTickets = tickets.filter((ticket) => {
    const releaseDate = new Date(ticket.NgayDat);
    return (
      releaseDate.getMonth() === currentMonth &&
      releaseDate.getFullYear() === currentYear
    );
  });
  animateNumber("newTicketsCount", newTickets.length);

  const totalRevenue = tickets.reduce((sum, ticket) => {
    return sum + parseFloat(ticket.GiaVe || 0);
  }, 0);
  animateNumber("totalRevenueCount", totalRevenue);
}

function showAlert(message, type) {
  console.log(`${type}: ${message}`);
}

function animateNumber(elementId, targetValue) {
  const element = document.getElementById(elementId);
  if (!element) return;
  const startValue = 0;
  const duration = 1000;
  const startTime = performance.now();

  function updateNumber(currentTime) {
    const elapsed = currentTime - startTime;
    const progress = Math.min(elapsed / duration, 1);
    const currentValue = Math.floor(
      startValue + (targetValue - startValue) * progress
    );

    element.textContent = currentValue;

    if (progress < 1) {
      requestAnimationFrame(updateNumber);
    }
  }

  requestAnimationFrame(updateNumber);
}

function switchView(viewType) {
  currentView = viewType;
  const tableBtn = document.getElementById("tableViewBtn");
  const cardBtn = document.getElementById("cardViewBtn");

  if (tableBtn && cardBtn) {
    if (viewType === "table") {
      tableBtn.classList.add("active");
      cardBtn.classList.remove("active");
    } else {
      cardBtn.classList.add("active");
      tableBtn.classList.remove("active");
    }
  }

  if (viewType === "table") {
    loadTableView(allTicketsWithInfo);
  } else {
    loadCardView(allTicketsWithInfo);
  }
  updateEmptyState();
}

function showLoading() {
  const loadingState = document.getElementById("loadingState");
  if (loadingState) loadingState.style.display = "flex";
  const tableView = document.getElementById("tableView");
  if (tableView) tableView.style.display = "none";
  const cardView = document.getElementById("cardView");
  if (cardView) cardView.style.display = "none";
  const emptyState = document.getElementById("emptyState");
  if (emptyState) emptyState.style.display = "none";
}

function hideLoading() {
  const loadingState = document.getElementById("loadingState");
  if (loadingState) loadingState.style.display = "none";
}

function updateEmptyState() {
  const emptyState = document.getElementById("emptyState");
  const tableView = document.getElementById("tableView");
  const cardView = document.getElementById("cardView");

  if (emptyState && tableView && cardView) {
    emptyState.style.display = "none";
    if (currentView === "table") {
      tableView.style.display = "block";
      cardView.style.display = "none";
    } else {
      tableView.style.display = "none";
      cardView.style.display = "grid";
    }
  }
}

function handleSearch() {
  const query = document
    .getElementById("searchInput")
    .value.trim()
    .toLowerCase();

  const filtered = allTicketsWithInfo.filter((ticket) => {
    const maKH = String(ticket.MaKH || "").toLowerCase();
    const maSuat = String(ticket.MaSuatChieu || "").toLowerCase();
    const tenKH = (ticket.tenKhachHang || "").toLowerCase();

    return (
      maKH.includes(query) || maSuat.includes(query) || tenKH.includes(query)
    );
  });

  if (currentView === "table") {
    loadTableView(filtered);
  } else {
    loadCardView(filtered);
  }

  updateEmptyState(filtered.length);
}

function formatTrangThai(trangThai) {
  const statusMap = {
    DaDat: "Đã Đặt",
    DaThanhToan: "Đã Thanh Toán",
    DaHuy: "Đã Hủy",
    ChoXacNhan: "Chờ Xác Nhận",
    DaSuDung: "Đã Sử Dụng",
  };
  return statusMap[trangThai] || trangThai;
}

function formatDateOnly(dateString) {
  if (!dateString) return "N/A";

  try {
    const date = new Date(dateString);

    if (isNaN(date.getTime())) {
      return "Ngày không hợp lệ";
    }

    return date.toLocaleDateString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  } catch (error) {
    console.error("Lỗi format ngày:", error);
    return "Lỗi định dạng";
  }
}

function formatTimeOnly(dateString) {
  if (!dateString) return "N/A";

  try {
    const date = new Date(dateString);

    if (isNaN(date.getTime())) {
      return "Giờ không hợp lệ";
    }

    return date.toLocaleTimeString("vi-VN", {
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch (error) {
    console.error("Lỗi format giờ:", error);
    return "Lỗi định dạng";
  }
}

async function formatThongTinVe(ticket) {
  const token = VeAPI.getToken();
  if (!token) throw new Error("Vui lòng đăng nhập");

  try {
    const customerResponse = await fetch(
      `${API_BASE_URL}/khachhang/${ticket.MaKH}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    if (!customerResponse.ok) {
      throw new Error(`Customer API error: ${customerResponse.status}`);
    }
    const customer = await customerResponse.json();

    const seatResponse = await fetch(`${API_BASE_URL}/ghe/${ticket.MaGhe}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!seatResponse.ok) {
      throw new Error(`Seat API error: ${seatResponse.status}`);
    }
    const seat = await seatResponse.json();

    return {
      tenKhachHang: customer.TenKH || customer.TenKhachHang || "N/A",
      viTriGhe: `${seat.SoHang}${seat.STTGhe}` || "N/A",
      loaiGhe: seat.LoaiGhe || "N/A",
      soHang: seat.SoHang || "N/A",
      sttGhe: seat.STTGhe || "N/A",
    };
  } catch (error) {
    console.error("Lỗi khi format thông tin vé:", error);
    return {
      tenKhachHang: "N/A",
      viTriGhe: "N/A",
      loaiGhe: "N/A",
      soHang: "N/A",
      sttGhe: "N/A",
    };
  }
}

async function editTicket(maVe) {
  try {
    const ticket = await VeAPI.getTicketsByID(maVe);

    document.getElementById("ticketId").value = ticket.MaVe || "";
    document.getElementById("tenKhachHang").value = ticket.tenKhachHang || "";
    document.getElementById("hangGhe").value = ticket.soHang || "";
    document.getElementById("maGhe").value = ticket.sttGhe || "";
    document.getElementById("giaVe").value = ticket.GiaVe || "";

    const modal = new bootstrap.Modal(document.getElementById("ticketModal"));
    modal.show();
  } catch (error) {
    showAlert("Lỗi khi tải thông tin vé: " + error.message, "danger");
  }
}

async function saveTicket() {
  const ticketId = document.getElementById("ticketId").value;
  const tenKH = document.getElementById("tenKhachHang").value;
  const soHang = document.getElementById("hangGhe").value;
  const sttGhe = document.getElementById("maGhe").value;
  const giaVe = document.getElementById("giaVe").value;

  const ticket = allTickets.find((ve) => ve.MaVe == ticketId);
  if (!ticket) {
    showAlert("Không tìm thấy vé tương ứng", "danger");
    return;
  }

  const matchingSeat = allSeats.find(
    (seat) => seat.SoHang == soHang && seat.STTGhe == sttGhe
  );

  if (!matchingSeat) {
    showAlert("Không tìm thấy ghế phù hợp với vị trí đã nhập", "danger");
    return;
  }

  const maGhe = matchingSeat.MaGhe;

  const dataVe = {
    MaGhe: maGhe,
    GiaVe: giaVe,
  };

  const dataKH = {
    TenKH: tenKH,
  };

  try {
    await VeAPI.updateTicket(ticketId, dataVe);

    const token = VeAPI.getToken();
    const response = await fetch(`${API_BASE_URL}/khachhang/${ticket.MaKH}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(dataKH),
    });

    if (!response.ok) {
      throw new Error(`Lỗi cập nhật khách hàng: ${response.status}`);
    }

    showAlert("Cập nhật vé thành công", "success");
    loadTickets();
    bootstrap.Modal.getInstance(document.getElementById("ticketModal")).hide();
  } catch (error) {
    showAlert(
      "Lỗi khi cập nhật vé hoặc khách hàng: " + error.message,
      "danger"
    );
  }
}

let allSeats = [];

async function loadSeats() {
  const token = VeAPI.getToken();
  if (!token) throw new Error("Vui lòng đăng nhập");

  try {
    const response = await fetch(`${API_BASE_URL}/ghe/`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    allSeats = await response.json();
  } catch (error) {
    console.error("Lỗi khi load danh sách ghế:", error);
    showAlert("Không thể tải danh sách ghế", "danger");
  }
}

async function addNewTicket() {
  const tenKH = document.getElementById("addTenKH").value;
  const maSuatChieu = document.getElementById("addMaSuatChieu").value;

  const hangGhe = document.getElementById("selectHangGhe").value;
  const sttGhe = document.getElementById("selectSTTGhe").value;

  const ghe = allSeats.find(
    (seat) => seat.SoHang === hangGhe && seat.STTGhe === Number(sttGhe)
  );

  const maGhe = ghe ? ghe.MaGhe : null;

  if (!tenKH || !maGhe || !maSuatChieu) {
    showAlert("Vui lòng nhập đầy đủ thông tin", "danger");
    return;
  }

  if (!maGhe) {
    showAlert("Vui lòng chọn ghế", "danger");
    return;
  }

  if (!ghe) {
    showAlert("Không tìm thấy ghế phù hợp", "danger");
    return;
  }

  const token = VeAPI.getToken();
  if (!token) {
    showAlert("Vui lòng đăng nhập để tiếp tục", "danger");
    return;
  }

  try {
    const resKH = await fetch(`${API_BASE_URL}/khachhang`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ TenKH: tenKH }),
    });

    if (!resKH.ok) {
      throw new Error("Không thể tạo khách hàng");
    }

    const khData = await resKH.json();
    const maKH = khData.data.MaKH;

    const ticketData = {
      MaKH: maKH,
      MaGhe: maGhe,
      MaSuatChieu: parseInt(maSuatChieu),
    };

    console.log("Dữ liệu vé:", ticketData);

    const ve_moi = await VeAPI.addTicket(ticketData);

    console.log("Vé mới:", ve_moi);

    showAlert("Thêm vé thành công, Giá vé: " + ve_moi.data.GiaVe, "success");
    alert("Thêm vé thành công, Giá vé: " + ve_moi.data.GiaVe + " VNĐ");
    bootstrap.Modal.getInstance(
      document.getElementById("ticketAddModal")
    ).hide();
    loadTickets();
  } catch (error) {
    showAlert(error.message);
    alert(error.message);
  }
}

async function updateHangGheOptionsBySuatChieu() {
  try {
    const maSuatChieu = parseInt(
      document.getElementById("addMaSuatChieu").value
    );

    const hangGheSelect = document.getElementById("selectHangGhe");
    hangGheSelect.innerHTML = '<option value="">-- Chọn hàng ghế --</option>';
    hangGheSelect.disabled = false;

    const suatChieu = allSuatChieu.find((sc) => sc.MaSuatChieu === maSuatChieu);

    const gheTrongPhong = allSeats.filter(
      (seat) => seat.MaPhong === suatChieu?.Phong.MaPhong
    );

    const hangGheSet = new Set();
    gheTrongPhong.forEach((seat) => {
      hangGheSet.add(seat.SoHang);
    });

    hangGheSet.forEach((hang) => {
      const option = document.createElement("option");
      option.value = hang;
      option.textContent = `Hàng ${hang}`;
      option.setAttribute("data-sohang", hang);
      hangGheSelect.appendChild(option);
    });

    if (hangGheSet.size === 0) {
      showAlert("Không còn ghế trống cho suất chiếu này", "warning");
    }
  } catch (err) {
    console.error("Lỗi khi cập nhật hàng ghế:", err);
    showAlert("Không thể cập nhật hàng ghế: " + err.message, "danger");
  }
}

async function updateSTTGheOptionsBySuatChieu() {
  try {
    const maSuatChieu = parseInt(
      document.getElementById("addMaSuatChieu").value
    );
    const soHang = document.getElementById("selectHangGhe").value;

    const sttGheSelect = document.getElementById("selectSTTGhe");
    sttGheSelect.innerHTML =
      '<option value="">-- Chọn số thứ tự ghế --</option>';
    sttGheSelect.disabled = false;

    const suatChieu = allSuatChieu.find((sc) => sc.MaSuatChieu === maSuatChieu);

    const gheTrongPhong = allSeats.filter(
      (seat) =>
        seat.MaPhong === suatChieu?.Phong.MaPhong && seat.SoHang == soHang
    );

    const sttGheSet = new Set();
    gheTrongPhong.forEach((seat) => {
      sttGheSet.add(seat.STTGhe);
    });

    sttGheSet.forEach((stt) => {
      const option = document.createElement("option");
      option.value = stt;
      option.textContent = `${stt}`;
      option.setAttribute("data-sohang", soHang);
      sttGheSelect.appendChild(option);
    });

    if (sttGheSet.size === 0) {
      showAlert("Không còn ghế trống cho suất chiếu này", "warning");
    }
  } catch (err) {
    console.error("Lỗi khi cập nhật số thứ tự ghế:", err);
    showAlert("Không thể cập nhật số thứ tự ghế: " + err.message, "danger");
  }
}

function renderHangGheOptions() {
  const hangGheSelect = document.getElementById("selectHangGhe");
  hangGheSelect.innerHTML = '<option value="">-- Chọn hàng ghế --</option>';

  const allHang = Array.from(new Set(allSeats.map((seat) => seat.SoHang))).sort(
    (a, b) => a - b
  );

  allHang.forEach((hang) => {
    const option = document.createElement("option");
    option.value = hang;
    option.textContent = `Hàng ${hang}`;
    option.setAttribute("data-sohang", hang);
    hangGheSelect.appendChild(option);
  });
}

async function deleteTicket(ticketId) {
  if (!confirm("Bạn có chắc chắn muốn xóa vé này không?")) return;

  try {
    await VeAPI.deleteTicket(ticketId);
    showAlert("Xóa vé thành công", "success");
    loadTickets(); // Cập nhật lại danh sách vé sau khi xóa
  } catch (error) {
    showAlert("Lỗi khi xóa vé: " + error.message, "danger");
  }
}

async function loadTableView(allTicketsWithInfo) {
  const tbody = document.getElementById("ticketsTableBody");
  if (!tbody) return;
  tbody.innerHTML = "";

  allTicketsWithInfo.forEach((ticket, index) => {
    const row = document.createElement("tr");
    row.className = "slide-in-right";
    row.style.animationDelay = `${index * 0.05}s`;

    row.innerHTML = `
            <td>
                <div>
                    <div style="font-weight: 700; color: white; margin-bottom: 4px;">${
                      ticket.MaVe
                    }</div>
                </div>
            </td>
            <td>
                <div>
                    <div style="font-weight: 700; color: white; margin-bottom: 4px;">${
                      ticket.tenKhachHang
                    }</div>
                    <small style="color: rgba(255, 255, 255, 0.5);">Vị trí: ${
                      ticket.viTriGhe
                    }</small><br>
                    <small style="color: rgba(255, 255, 255, 0.5);">Giá vé: ${parseInt(
                      ticket.GiaVe
                    )} VNĐ</small>
                </div>
            </td>
            <td>
                <div style="color: white; font-weight: 600;">${formatDateOnly(
                  ticket.NgayDat
                )}</div>
                <small style="color: rgba(255, 255, 255, 0.7);">${formatTimeOnly(
                  ticket.NgayDat
                )}</small>
            </td>
            <td>
                <span class="ultra-badge ultra-badge-2d" style="font-weight: 600; color: white;"><i class="fas fa-check-circle me-1"></i>${formatTrangThai(
                  ticket.TrangThai
                )}</span>
            </td>
            <td>
                <div class="d-flex gap-2">
                    <button class="ultra-btn ultra-btn-warning ultra-btn-sm" onclick="editTicket(${
                      ticket.MaVe
                    })" title="Chỉnh sửa">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="ultra-btn ultra-btn-danger ultra-btn-sm" onclick="deleteTicket(${
                      ticket.MaVe
                    })" title="Xóa">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </td>
        `;
    tbody.appendChild(row);
  });
}

function loadCardView(allTicketsWithInfo) {
  const cardContainer = document.getElementById("cardView");
  if (!cardContainer) return;
  cardContainer.innerHTML = "";

  allTicketsWithInfo.forEach((ticket, index) => {
    const cardDiv = document.createElement("div");
    cardDiv.className = "ultra-item-card scale-in";
    cardDiv.style.animationDelay = `${index * 0.1}s`;

    cardDiv.innerHTML = `
      <div class="ultra-item-visual">
        <i class="fas fa-user-circle" style="font-size: 3rem; color: white;"></i>
      </div>

      <h3 class="ultra-item-title">${ticket.tenKhachHang}</h3>

      <div class="ultra-item-meta">
        <div class="ultra-item-meta-row">
          <span><i class="fas fa-ticket-alt me-2"></i>Mã vé</span>
          <span>${ticket.MaVe}</span>
        </div>
        <div class="ultra-item-meta-row">
          <span><i class="fas fa-chair me-2"></i>Vị trí ghế</span>
          <span>${ticket.viTriGhe}</span>
        </div>
        <div class="ultra-item-meta-row">
          <span><i class="fas fa-money-bill me-2"></i>Giá vé</span>
          <span>${ticket.GiaVe}</span>
        </div>
        <div class="ultra-item-meta-row">
          <span><i class="fas fa-id-card me-2"></i>Ngày đặt</span>
          <span>${formatTimeOnly(ticket.NgayDat)} ${formatDateOnly(
      ticket.NgayDat
    )}</span>
        </div>
      </div>

      <div class="ultra-item-actions">
        <button class="ultra-btn ultra-btn-warning ultra-btn-sm flex-fill" onclick="editTicket(${
          ticket.MaVe
        })">
          <i class="fas fa-edit me-2"></i>Sửa
        </button>
        <button class="ultra-btn ultra-btn-danger ultra-btn-sm flex-fill" onclick="deleteTicket(${
          ticket.MaVe
        })">
          <i class="fas fa-trash me-2"></i>Xóa
        </button>
      </div>
    `;

    cardContainer.appendChild(cardDiv);
  });
}

window.addEventListener("DOMContentLoaded", async () => {
  const addModal = document.getElementById("ticketAddModal");
  const searchInput = document.getElementById("searchInput");
  // document
  //   .getElementById("addMaSuatChieu")
  //   .addEventListener("change", async (e) => {
  //     const maSuatChieu = e.target.value;
  //     if (maSuatChieu) {
  //       await updateSeatOptionsBySuatChieu(maSuatChieu);
  //     }
  //   });
  if (searchInput) {
    searchInput.addEventListener("input", handleSearch);
  }

  addModal.addEventListener("show.bs.modal", () => {
    loadSuatChieuOptions();
  });

  await loadSeats();
  // renderSeatOptions();
  loadTickets();
});
