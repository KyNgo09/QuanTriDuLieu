const API_BASE_URL = "http://127.0.0.1:5000/api";

// Cinema Rooms API
class PhongChieuAPI {
  static getToken() {
    return localStorage.getItem("token");
  }

  static async getCinemaRooms() {
    const token = this.getToken();
    if (!token) throw new Error("Vui lòng đăng nhập");
    try {
      const response = await fetch(`${API_BASE_URL}/phongchieu/`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (!response.ok) {
        if (response.status === 401) {
          localStorage.removeItem("token");
          window.location.href = "/frontend/login.html";
        }
        throw new Error("Failed to fetch cinema rooms");
      }
      return await response.json();
    } catch (error) {
      console.error("Error fetching cinema rooms:", error);
      throw error;
    }
  }

  static async getCinemaRoom(id) {
    const token = this.getToken();
    if (!token) throw new Error("No token found, please login");
    try {
      const response = await fetch(`${API_BASE_URL}/phongchieu/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (!response.ok) {
        if (response.status === 401) {
          localStorage.removeItem("token");
          window.location.href = "/frontend/login.html";
        }
        throw new Error("Failed to fetch cinema room");
      }
      return await response.json();
    } catch (error) {
      console.error("Error fetching cinema room:", error);
      throw error;
    }
  }

  static async createCinemaRoom(roomData) {
    const token = this.getToken();
    if (!token) throw new Error("No token found, please login");
    try {
      const response = await fetch(`${API_BASE_URL}/phongchieu/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(roomData),
      });
      if (!response.ok) {
        if (response.status === 401) {
          localStorage.removeItem("token");
          window.location.href = "/frontend/login.html";
        }
        throw new Error("Failed to create cinema room");
      }
      return await response.json();
    } catch (error) {
      console.error("Error creating cinema room:", error);
      throw error;
    }
  }

  static async updateCinemaRoom(id, roomData) {
    const token = this.getToken();
    if (!token) throw new Error("No token found, please login");
    try {
      const response = await fetch(`${API_BASE_URL}/phongchieu/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(roomData),
      });
      if (!response.ok) {
        if (response.status === 401) {
          localStorage.removeItem("token");
          window.location.href = "/frontend/login.html";
        }
        throw new Error("Failed to update cinema room");
      }
      return await response.json();
    } catch (error) {
      console.error("Error updating cinema room:", error);
      throw error;
    }
  }

  static async deleteCinemaRoom(id) {
    const token = this.getToken();
    if (!token) throw new Error("No token found, please login");
    try {
      const response = await fetch(`${API_BASE_URL}/phongchieu/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (!response.ok) {
        if (response.status === 401) {
          localStorage.removeItem("token");
          window.location.href = "/frontend/login.html";
        }
        throw new Error("Failed to delete cinema room");
      }
      return await response.json();
    } catch (error) {
      console.error("Error deleting cinema room:", error);
      throw error;
    }
  }
}

// Chair Management API
class ChairAPI {
  static getToken() {
    return localStorage.getItem("token");
  }

  static async getChairsByRoom(roomId) {
    const token = this.getToken();
    if (!token) throw new Error("No token found, please login");
    try {
      const response = await fetch(`${API_BASE_URL}/ghe/phong/${roomId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (!response.ok) {
        if (response.status === 401) {
          localStorage.removeItem("token");
          window.location.href = "/frontend/login.html";
        }
        throw new Error("Failed to fetch chairs");
      }
      return await response.json();
    } catch (error) {
      console.error("Error fetching chairs:", error);
      throw error;
    }
  }

  static async createChair(chairData) {
    const token = this.getToken();
    if (!token) throw new Error("No token found, please login");
    try {
      const response = await fetch(`${API_BASE_URL}/ghe/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(chairData),
      });
      if (!response.ok) {
        if (response.status === 401) {
          localStorage.removeItem("token");
          window.location.href = "/frontend/login.html";
        }
        throw new Error("Failed to create chair");
      }
      return await response.json();
    } catch (error) {
      console.error("Error creating chair:", error);
      throw error;
    }
  }

  static async updateChair(id, chairData) {
    const token = this.getToken();
    if (!token) throw new Error("No token found, please login");
    try {
      const response = await fetch(`${API_BASE_URL}/ghe/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(chairData),
      });
      if (!response.ok) {
        if (response.status === 401) {
          localStorage.removeItem("token");
          window.location.href = "/frontend/login.html";
        }
        throw new Error("Failed to update chair");
      }
      return await response.json();
    } catch (error) {
      console.error("Error updating chair:", error);
      throw error;
    }
  }

  static async deleteChair(id) {
    const token = this.getToken();
    if (!token) throw new Error("No token found, please login");
    try {
      const response = await fetch(`${API_BASE_URL}/ghe/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (!response.ok) {
        if (response.status === 401) {
          localStorage.removeItem("token");
          window.location.href = "/frontend/login.html";
        }
        throw new Error("Failed to delete chair");
      }
      return await response.json();
    } catch (error) {
      console.error("Error deleting chair:", error);
      throw error;
    }
  }
}

// Utility Functions for Cinema Rooms
function showAlert(message, type = "success") {
  const alertDiv = document.createElement("div");
  alertDiv.className = `alert alert-${type} alert-dismissible fade show`;
  alertDiv.innerHTML = `
        ${message}
        <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
    `;

  const container = document.querySelector(".main-content");
  if (container) {
    container.insertBefore(alertDiv, container.firstChild);
    setTimeout(() => {
      alertDiv.remove();
    }, 3000);
  }
}

// Global Variables for Cinema Rooms
let currentView = "table";
let allRooms = [];
let filteredRooms = [];

// Global Variables for Chair Management
let allChairs = [];
let filteredChairs = [];
let currentRoomId = null;

// Room Management Functions
function filterRooms() {
  const searchTerm =
    document.getElementById("searchInput")?.value.toLowerCase() || "";
  const typeFilter = document.getElementById("roomTypeFilter")?.value || "";

  filteredRooms = allRooms.filter((room) => {
    const matchesSearch =
      room.TenPhong.toLowerCase().includes(searchTerm) ||
      room.LoaiPhong.toLowerCase().includes(searchTerm);
    const matchesType = !typeFilter || room.LoaiPhong === typeFilter;
    return matchesSearch && matchesType;
  });

  if (currentView === "table") {
    loadRoomTableView(filteredRooms);
  } else {
    loadRoomCardView(filteredRooms);
  }
  updateEmptyState();
}

function updateEmptyState() {
  const emptyState = document.getElementById("emptyState");
  const tableView = document.getElementById("tableView");
  const cardView = document.getElementById("cardView");

  if (filteredRooms.length === 0 && emptyState && tableView && cardView) {
    emptyState.style.display = "block";
    tableView.style.display = "none";
    cardView.style.display = "none";
  } else if (emptyState && tableView && cardView) {
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
    loadRoomTableView(filteredRooms);
  } else {
    loadRoomCardView(filteredRooms);
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

async function loadCinemaRooms() {
  const token = localStorage.getItem("token");
  if (!token) {
    alert("Vui lòng đăng nhập!");
    window.location.href = "/frontend/login.html";
    return;
  }

  showLoading();
  try {
    const rooms = await PhongChieuAPI.getCinemaRooms();
    allRooms = rooms;
    filteredRooms = rooms;
    updateStats(rooms);
    if (currentView === "table") {
      loadRoomTableView(rooms);
    } else {
      loadRoomCardView(rooms);
    }
    updateEmptyState();
  } catch (error) {
    showAlert("Lỗi khi tải danh sách phòng chiếu: " + error.message, "danger");
    if (error.message.includes("No token found")) {
      window.location.href = "/frontend/login.html";
    }
  } finally {
    hideLoading();
  }
}

function updateStats(rooms) {
  animateNumber("totalRoomsCount", rooms.length);
  const totalSeats = rooms.reduce((sum, room) => sum + room.SoGhe, 0);
  animateNumber("totalSeatsCount", totalSeats);
  const avgSeats = rooms.length > 0 ? Math.round(totalSeats / rooms.length) : 0;
  animateNumber("avgSeatsCount", avgSeats);
  const roomTypes = new Set(rooms.map((room) => room.LoaiPhong));
  animateNumber("roomTypesCount", roomTypes.size);
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

function loadRoomTableView(rooms) {
  const tbody = document.getElementById("roomsTableBody");
  if (!tbody) return;
  tbody.innerHTML = "";

  rooms.forEach((room, index) => {
    const row = document.createElement("tr");
    row.className = "slide-in-right";
    row.style.animationDelay = `${index * 0.05}s`;

    row.innerHTML = `
            <td>
                <div class="ultra-item-visual" style="width: 80px; height: 60px; margin: 0; background: ${getRoomTypeGradient(
                  room.LoaiPhong
                )};">
                    <i class="fas fa-door-open" style="font-size: 1.5rem; color: white;"></i>
                </div>
            </td>
            <td>
                <div>
                    <div style="font-weight: 700; color: white; margin-bottom: 4px;">${
                      room.TenPhong
                    }</div>
                    <small style="color: rgba(255, 255, 255, 0.5);">ID: ${
                      room.MaPhong
                    }</small>
                </div>
            </td>
            <td>
                <span class="ultra-badge ${getRoomTypeBadgeClass(
                  room.LoaiPhong
                )}">
                    ${room.LoaiPhong}
                </span>
            </td>
            <td>
                <span style="font-weight: 600; color: white;">${
                  room.SoGhe
                }</span> ghế
            </td>
            <td>
                <span class="ultra-badge ultra-badge-2d">
                    <i class="fas fa-check-circle me-1"></i>Hoạt động
                </span>
            </td>
            <td>
                <div class="d-flex gap-2">
                    <button class="ultra-btn ultra-btn-warning ultra-btn-sm" onclick="editRoom(${
                      room.MaPhong
                    })" title="Chỉnh sửa">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="ultra-btn ultra-btn-info ultra-btn-sm" onclick="openChairModal(${
                      room.MaPhong
                    })" title="Quản lý ghế">
                        <i class="fas fa-chair"></i>
                    </button>
                    <button class="ultra-btn ultra-btn-danger ultra-btn-sm" onclick="deleteRoom(${
                      room.MaPhong
                    })" title="Xóa">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </td>
        `;
    tbody.appendChild(row);
  });
}

function loadRoomCardView(rooms) {
  const cardContainer = document.getElementById("cardView");
  if (!cardContainer) return;
  cardContainer.innerHTML = "";

  rooms.forEach((room, index) => {
    const cardDiv = document.createElement("div");
    cardDiv.className = "ultra-item-card scale-in";
    cardDiv.style.animationDelay = `${index * 0.1}s`;

    cardDiv.innerHTML = `
            <div class="ultra-item-visual" style="background: ${getRoomTypeGradient(
              room.LoaiPhong
            )};">
                <div style="text-align: center;">
                    <i class="fas fa-door-open" style="font-size: 3rem; color: white; margin-bottom: 1rem;"></i>
                    <div style="font-weight: 700; color: white; font-size: 1.2rem;">${
                      room.LoaiPhong
                    }</div>
                </div>
            </div>
            
            <h3 class="ultra-item-title">${room.TenPhong}</h3>
            
            <div class="ultra-item-meta">
                <div class="ultra-item-meta-row">
                    <span><i class="fas fa-cog me-2"></i>Loại phòng</span>
                    <span class="ultra-badge ${getRoomTypeBadgeClass(
                      room.LoaiPhong
                    )}">${room.LoaiPhong}</span>
                </div>
                <div class="ultra-item-meta-row">
                    <span><i class="fas fa-chair me-2"></i>Số ghế</span>
                    <span style="font-weight: 600; color: white;">${
                      room.SoGhe
                    } ghế</span>
                </div>
                <div class="ultra-item-meta-row">
                    <span><i class="fas fa-info-circle me-2"></i>Trạng thái</span>
                    <span class="ultra-badge ultra-badge-2d">
                        <i class="fas fa-check-circle me-1"></i>Hoạt động
                    </span>
                </div>
            </div>
            
            <div class="ultra-item-actions">
                <button class="ultra-btn ultra-btn-warning ultra-btn-sm flex-fill" onclick="editRoom(${
                  room.MaPhong
                })">
                    <i class="fas fa-edit me-2"></i>Sửa
                </button>
                <button class="ultra-btn ultra-btn-info ultra-btn-sm flex-fill" onclick="openChairModal(${
                  room.MaPhong
                })">
                    <i class="fas fa-chair me-2"></i>Ghế
                </button>
                <button class="ultra-btn ultra-btn-danger ultra-btn-sm flex-fill" onclick="deleteRoom(${
                  room.MaPhong
                })">
                    <i class="fas fa-trash me-2"></i>Xóa
                </button>
            </div>
        `;
    cardContainer.appendChild(cardDiv);
  });
}

function getRoomTypeBadgeClass(type) {
  const classes = {
    "2D": "ultra-badge-2d",
    "3D": "ultra-badge-3d",
    IMAX: "ultra-badge-imax",
    "4DX": "ultra-badge-4dx",
    VIP: "ultra-badge-vip",
    Premium: "ultra-badge-premium",
  };
  return classes[type] || "ultra-badge-2d";
}

function getRoomTypeGradient(type) {
  const gradients = {
    "2D": "var(--primary-gradient)",
    "3D": "var(--success-gradient)",
    IMAX: "var(--warning-gradient)",
    "4DX": "var(--danger-gradient)",
    VIP: "var(--secondary-gradient)",
    Premium: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
  };
  return gradients[type] || gradients["2D"];
}

function openAddModal() {
  document.getElementById("roomModalTitle").innerHTML =
    '<i class="fas fa-plus-circle me-3"></i>Thêm Phòng Chiếu Mới';
  document.getElementById("roomForm").reset();
  document.getElementById("roomId").value = "";
}

async function editRoom(id) {
  try {
    const room = await PhongChieuAPI.getCinemaRoom(id);
    console.log("Editing room:", room);
    document.getElementById("roomModalTitle").innerHTML =
      '<i class="fas fa-edit me-3"></i>Chỉnh Sửa Phòng Chiếu';
    document.getElementById("roomId").value = room.MaPhong;
    document.getElementById("tenPhong").value = room.TenPhong;
    document.getElementById("loaiPhong").value = room.LoaiPhong;

    new bootstrap.Modal(document.getElementById("roomModal")).show();
  } catch (error) {
    showAlert("Lỗi khi tải thông tin phòng chiếu: " + error.message, "danger");
  }
}

async function saveRoom() {
  const form = document.getElementById("roomForm");
  if (!form.checkValidity()) {
    form.reportValidity();
    return;
  }

  const roomData = {
    TenPhong: document.getElementById("tenPhong").value,
    LoaiPhong: document.getElementById("loaiPhong").value,
  };

  try {
    const roomId = document.getElementById("roomId").value;
    if (roomId) {
      await PhongChieuAPI.updateCinemaRoom(roomId, roomData);
      showAlert("Cập nhật phòng chiếu thành công!", "success");
    } else {
      await PhongChieuAPI.createCinemaRoom(roomData);
      showAlert("Thêm phòng chiếu thành công!", "success");
    }

    bootstrap.Modal.getInstance(document.getElementById("roomModal")).hide();
    loadCinemaRooms();
  } catch (error) {
    showAlert("Lỗi khi lưu phòng chiếu: " + error.message, "danger");
  }
}

async function deleteRoom(id) {
  if (confirm("Bạn có chắc chắn muốn xóa phòng chiếu này?")) {
    try {
      await PhongChieuAPI.deleteCinemaRoom(id);
      showAlert("Xóa phòng chiếu thành công!", "success");
      loadCinemaRooms();
    } catch (error) {
      showAlert("Lỗi khi xóa phòng chiếu: " + error.message, "danger");
    }
  }
}

// Initialize page when sidebar is loaded
document.addEventListener("sidebarLoaded", function () {
  loadCinemaRooms();

  // Setup event listeners
  const searchInput = document.getElementById("searchInput");
  const roomTypeFilter = document.getElementById("roomTypeFilter");

  if (searchInput) {
    searchInput.addEventListener("input", filterRooms);
  }
  if (roomTypeFilter) {
    roomTypeFilter.addEventListener("change", filterRooms);
  }
});

// Fallback: load rooms if sidebar is already loaded
if (window.sidebarManager && window.sidebarManager.isLoaded()) {
  loadCinemaRooms();

  const searchInput = document.getElementById("searchInput");
  const roomTypeFilter = document.getElementById("roomTypeFilter");

  if (searchInput) {
    searchInput.addEventListener("input", filterRooms);
  }
  if (roomTypeFilter) {
    roomTypeFilter.addEventListener("change", filterRooms);
  }
}

/**
 * Chair Management Functions
 */
async function openChairModal(roomId) {
  currentRoomId = roomId;

  // Create chair modal if it doesn't exist
  if (!document.getElementById("chairModal")) {
    createChairModal();
  }

  // Load chairs and show modal
  await loadChairs(roomId);
  showChairListView();
  new bootstrap.Modal(document.getElementById("chairModal")).show();
}

function createChairModal() {
  const modalHtml = `
    <div class="modal fade ultra-modal" id="chairModal" tabindex="-1">
      <div class="modal-dialog modal-xl">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title" id="chairModalTitle">
              <i class="fas fa-chair me-3"></i>Quản Lý Ghế
            </h5>
            <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal"></button>
          </div>
          <div class="modal-body" id="chairModalBody">
            <!-- Content will be loaded here -->
          </div>
          <div class="modal-footer" id="chairModalFooter">
            <!-- Footer buttons will be loaded here -->
          </div>
        </div>
      </div>
    </div>
  `;

  document.body.insertAdjacentHTML("beforeend", modalHtml);
}

function showChairListView() {
  const modalBody = document.getElementById("chairModalBody");
  const modalFooter = document.getElementById("chairModalFooter");

  modalBody.innerHTML = `
    <div class="d-flex justify-content-between align-items-center mb-1">
      <h6 class="mb-0" style="color: rgba(255, 255, 255, 0.9);">Danh sách ghế</h6>
      <button class="ultra-btn ultra-btn-primary ultra-btn-sm" onclick="showChairForm()">
        <i class="fas fa-plus me-2"></i>Thêm Ghế
      </button>
    </div>
    
    <!-- Chair Filters -->
    <div class="row">
      <div class="col-md-3">
        <div class="ultra-form-group" style="margin-bottom: 0;">
          <label class="ultra-form-label" style="font-size: 0.85rem; margin-bottom: 0.3rem;">
            <i class="fas fa-filter me-2"></i>Lọc theo hàng
          </label>
          <input type="text" class="ultra-form-control mb-0" id="chairRowFilter" 
                 style="height: 35px; font-size: 0.9rem; padding: 0.4rem 0.8rem;"
                 placeholder="Nhập hàng (A, B, C...)" onchange="filterChairs()" oninput="filterChairs()">
        </div>
      </div>
      <div class="col-md-3">
        <div class="ultra-form-group">
          <label class="ultra-form-label" style="font-size: 0.85rem; margin-bottom: 0.3rem;">
            <i class="fas fa-search me-2"></i>Số thứ tự
          </label>
          <input type="number" class="ultra-form-control mb-0" id="chairNumberFilter" 
                 style="height: 35px; font-size: 0.9rem; padding: 0.4rem 0.8rem;"
                 placeholder="Nhập số ghế..." onchange="filterChairs()" oninput="filterChairs()">
        </div>
      </div>
      <div class="col-md-3">
        <div class="ultra-form-group">
          <label class="ultra-form-label" style="font-size: 0.85rem; margin-bottom: 0.3rem;">
            <i class="fas fa-chair me-2"></i>Loại ghế
          </label>
          <select class="ultra-form-control mb-0" id="chairTypeFilter" 
                  style="height: 35px; font-size: 0.9rem; padding: 0.4rem 0.8rem;"
                  onchange="filterChairs()">
            <option value="">Tất cả loại</option>
            <option value="THUONG">THUONG</option>
            <option value="VIP">VIP</option>
          </select>
        </div>
      </div>
      <div class="col-md-3">
        <div class="ultra-form-group">
          <label class="ultra-form-label" style="opacity: 0; font-size: 0.85rem; margin-bottom: 0.3rem;">Reset</label>
          <button class="ultra-btn ultra-btn-secondary ultra-btn-sm w-100" 
                  style="height: 35px; font-size: 0.9rem; padding: 0.4rem 0.8rem;"
                  onclick="resetChairFilters()">
            <i class="fas fa-refresh me-2"></i>Đặt lại
          </button>
        </div>
      </div>
      
    </div>
    <div class="ultra-table-container" style="border: 1px solid rgba(255, 255, 255, 0.1); border-radius: 8px; background: rgba(255, 255, 255, 0.02);">
      <table class="ultra-table" style="margin-bottom: 0; table-layout: fixed; width: 100%;">
        <thead style="position: sticky; top: 0; background: rgba(26, 32, 44, 0.98); backdrop-filter: blur(15px); z-index: 100; border-bottom: 2px solid rgba(255, 255, 255, 0.1);">
          <tr>
            <th style="background: rgba(26, 32, 44, 0.98); backdrop-filter: blur(15px); text-align: center; border-bottom: 1px solid rgba(255, 255, 255, 0.1); width: 20%; padding: 15px 10px; font-weight: 600; color: rgba(255, 255, 255, 0.9);">Số Hàng</th>
            <th style="background: rgba(26, 32, 44, 0.98); backdrop-filter: blur(15px); text-align: center; border-bottom: 1px solid rgba(255, 255, 255, 0.1); width: 20%; padding: 15px 10px; font-weight: 600; color: rgba(255, 255, 255, 0.9);">Số Thứ Tự</th>
            <th style="background: rgba(26, 32, 44, 0.98); backdrop-filter: blur(15px); text-align: center; border-bottom: 1px solid rgba(255, 255, 255, 0.1); width: 30%; padding: 15px 10px; font-weight: 600; color: rgba(255, 255, 255, 0.9);">Loại Ghế</th>
            <th style="background: rgba(26, 32, 44, 0.98); backdrop-filter: blur(15px); text-align: center; border-bottom: 1px solid rgba(255, 255, 255, 0.1); width: 30%; padding: 15px 10px; font-weight: 600; color: rgba(255, 255, 255, 0.9);">Thao Tác</th>
          </tr>
        </thead>
      </table>
      <div style="max-height: 350px; overflow-y: auto;">
        <table class="ultra-table" style="margin-bottom: 0; table-layout: fixed; width: 100%;">
          <tbody id="chairsTableBody" style="background: rgba(255, 255, 255, 0.01);">
            <!-- Chairs will be loaded here -->
          </tbody>
        </table>
      </div>
    </div>
  `;

  modalFooter.innerHTML = `
      <button type="button" class="ultra-btn ultra-btn-secondary" data-bs-dismiss="modal" onclick="refreshCurrentView()">
        <i class="fas fa-times me-2"></i>Đóng
      </button>
    `;

  loadChairsTable();
}

function showChairForm(chairData = null) {
  const modalBody = document.getElementById("chairModalBody");
  const modalFooter = document.getElementById("chairModalFooter");
  const isEdit = chairData !== null;

  modalBody.innerHTML = `
    <div class="d-flex align-items-center mb-3">
      <button class="ultra-btn ultra-btn-secondary ultra-btn-sm me-3" onclick="showChairListView()">
        <i class="fas fa-arrow-left"></i>
      </button>
      <h6 class="mb-0" style="color: rgba(255, 255, 255, 0.9);">
        ${isEdit ? "Chỉnh Sửa Ghế" : "Thêm Ghế Mới"}
      </h6>
    </div>
    <form id="chairForm">
      <input type="hidden" id="chairId" value="${chairData?.MaGhe || ""}">
      <div class="row">
        <div class="col-md-4">
          <div class="ultra-form-group">
            <label for="SoHang" class="ultra-form-label">
              <i class="fas fa-sort-numeric-up me-2"></i>Số Hàng
            </label>
            <input type="text" class="ultra-form-control" id="SoHang" 
                   value="${
                     chairData?.SoHang || ""
                   }" required placeholder="A, B, C, ...">
          </div>
        </div>
        <div class="col-md-4">
          <div class="ultra-form-group">
            <label for="STTGhe" class="ultra-form-label">
              <i class="fas fa-sort-numeric-up me-2"></i>Số Thứ Tự
            </label>
            <input type="number" class="ultra-form-control" id="STTGhe" 
                   value="${
                     chairData?.STTGhe || ""
                   }" min="1" required placeholder="1, 2, 3, ...">
          </div>
        </div>
        <div class="col-md-4">
          <div class="ultra-form-group">
            <label for="LoaiGhe" class="ultra-form-label">
              <i class="fas fa-chair me-2"></i>Loại Ghế
            </label>
            <select class="ultra-form-control" id="LoaiGhe" required>
              <option value="">Chọn loại ghế</option>
              <option value="THUONG" ${
                chairData?.LoaiGhe === "THUONG" ? "selected" : ""
              }>THUONG</option>
              <option value="VIP" ${
                chairData?.LoaiGhe === "VIP" ? "selected" : ""
              }>VIP</option>
            </select>
          </div>
        </div>
      </div>
    </form>
  `;

  modalFooter.innerHTML = `
    <button type="button" class="ultra-btn ultra-btn-secondary" onclick="showChairListView()">
      <i class="fas fa-times me-2"></i>Hủy
    </button>
    <button type="button" class="ultra-btn ultra-btn-primary" onclick="saveChair()">
      <i class="fas fa-save me-2"></i>${isEdit ? "Cập Nhật" : "Thêm Ghế"}
    </button>
  `;
}

async function loadChairs(roomId) {
  try {
    allChairs = await ChairAPI.getChairsByRoom(roomId);
    filteredChairs = allChairs; // Initialize filtered chairs
  } catch (error) {
    showAlert("Lỗi khi tải danh sách ghế: " + error.message, "danger");
    allChairs = [];
    filteredChairs = [];
  }
}

function loadChairsTable() {
  const tbody = document.getElementById("chairsTableBody");
  if (!tbody) return; // Exit if element doesn't exist

  tbody.innerHTML = "";

  filteredChairs.forEach((chair, index) => {
    const row = document.createElement("tr");
    row.className = "slide-in-right";
    row.style.animationDelay = `${index * 0.05}s`;

    row.innerHTML = `
      <td style="color: rgba(255, 255, 255, 0.9); font-weight: 600; text-align: center; background: rgba(255, 255, 255, 0.02); border-bottom: 1px solid rgba(255, 255, 255, 0.05); padding: 15px 10px; width: 20%;">
        <div style="display: flex; align-items: center; justify-content: center; min-height: 20px;">
          ${"Hàng " + chair.SoHang}
        </div>
      </td>
      <td style="color: rgba(255, 255, 255, 0.9); font-weight: 600; text-align: center; background: rgba(255, 255, 255, 0.02); border-bottom: 1px solid rgba(255, 255, 255, 0.05); padding: 15px 10px; width: 20%;">
        <div style="display: flex; align-items: center; justify-content: center; min-height: 20px;">
          ${"STT. " + chair.STTGhe}
        </div>
      </td>
      <td style="text-align: center; background: rgba(255, 255, 255, 0.02); border-bottom: 1px solid rgba(255, 255, 255, 0.05); padding: 15px 10px; width: 30%;">
        <div style="display: flex; align-items: center; justify-content: center; min-height: 20px;">
          <span class="ultra-badge ${getChairTypeBadgeClass(chair.LoaiGhe)}">
            ${chair.LoaiGhe}
          </span>
        </div>
      </td>
      <td style="text-align: center; background: rgba(255, 255, 255, 0.02); border-bottom: 1px solid rgba(255, 255, 255, 0.05); padding: 15px 10px; width: 30%;">
        <div style="display: flex; align-items: center; justify-content: center; gap: 8px; min-height: 20px;">
          <button class="ultra-btn ultra-btn-warning ultra-btn-sm" 
                  onclick="editChair(${chair.MaGhe})" title="Chỉnh sửa"
                  style="min-width: 32px; height: 32px; display: flex; align-items: center; justify-content: center;">
            <i class="fas fa-edit"></i>
          </button>
          <button class="ultra-btn ultra-btn-danger ultra-btn-sm" 
                  onclick="deleteChair(${chair.MaGhe})" title="Xóa"
                  style="min-width: 32px; height: 32px; display: flex; align-items: center; justify-content: center;">
            <i class="fas fa-trash"></i>
          </button>
        </div>
      </td>
    `;
    tbody.appendChild(row);
  });

  if (filteredChairs.length === 0) {
    const emptyMessage =
      allChairs.length === 0 ? "Chưa có ghế nào" : "Không tìm thấy ghế phù hợp";
    const emptySubMessage =
      allChairs.length === 0
        ? 'Nhấn "Thêm Ghế" để bắt đầu'
        : "Thử thay đổi bộ lọc";

    tbody.innerHTML = `
      <tr>
        <td colspan="4" class="text-center" style="color: rgba(255, 255, 255, 0.6); padding: 3rem; background: rgba(255, 255, 255, 0.02); border-bottom: 1px solid rgba(255, 255, 255, 0.05);">
          <div style="display: flex; flex-direction: column; align-items: center; justify-content: center;">
            <i class="fas fa-chair" style="font-size: 2.5rem; margin-bottom: 1rem; opacity: 0.5;"></i>
            <div style="font-size: 1.1rem; font-weight: 500;">${emptyMessage}</div>
            <div style="font-size: 0.9rem; opacity: 0.7; margin-top: 0.5rem;">${emptySubMessage}</div>
          </div>
        </td>
      </tr>
    `;
  }
}

function getChairTypeBadgeClass(type) {
  const classes = {
    THUONG: "ultra-badge-2d",
    VIP: "ultra-badge-vip",
    Thường: "ultra-badge-2d", // Fallback cho dữ liệu cũ
  };
  return classes[type] || "ultra-badge-2d";
}

async function editChair(chairId) {
  const chair = allChairs.find((c) => c.MaGhe === chairId);
  if (chair) {
    showChairForm(chair);
  }
}

async function saveChair() {
  const form = document.getElementById("chairForm");
  if (!form.checkValidity()) {
    form.reportValidity();
    return;
  }

  const chairData = {
    MaPhong: currentRoomId,
    SoHang: document.getElementById("SoHang").value.trim(),
    STTGhe: parseInt(document.getElementById("STTGhe").value.trim()),
    LoaiGhe: document.getElementById("LoaiGhe").value.trim(),
  };

  try {
    const chairId = document.getElementById("chairId").value;
    if (chairId) {
      await ChairAPI.updateChair(chairId, chairData);
      showAlert("Cập nhật ghế thành công!", "success");
    } else {
      await ChairAPI.createChair(chairData);
      showAlert("Thêm ghế thành công!", "success");
    }

    await loadChairs(currentRoomId);
    resetChairFilters(); // Reset filters and reload table
    showChairListView();
  } catch (error) {
    showAlert("Lỗi khi lưu ghế: " + error.message, "danger");
  }
}

async function deleteChair(chairId) {
  if (confirm("Bạn có chắc chắn muốn xóa ghế này?")) {
    try {
      await ChairAPI.deleteChair(chairId);
      showAlert("Xóa ghế thành công!", "success");
      await loadChairs(currentRoomId);
      resetChairFilters(); // Reset filters and reload table
    } catch (error) {
      showAlert("Lỗi khi xóa ghế: " + error.message, "danger");
    }
  }
}

// Fallback to load data if sidebar fails
window.addEventListener("load", function () {
  loadCinemaRooms();
});

// Chair Filter Functions
function filterChairs() {
  const rowFilter =
    document.getElementById("chairRowFilter")?.value.trim().toUpperCase() || "";
  const numberFilter =
    document.getElementById("chairNumberFilter")?.value || "";
  const typeFilter = document.getElementById("chairTypeFilter")?.value || "";

  filteredChairs = allChairs.filter((chair) => {
    const matchesRow =
      !rowFilter || chair.SoHang.toUpperCase().includes(rowFilter);
    const matchesNumber =
      !numberFilter || chair.STTGhe.toString() === numberFilter;
    const matchesType = !typeFilter || chair.LoaiGhe === typeFilter;

    return matchesRow && matchesNumber && matchesType;
  });

  loadChairsTable();
}

function resetChairFilters() {
  const rowFilter = document.getElementById("chairRowFilter");
  const numberFilter = document.getElementById("chairNumberFilter");
  const typeFilter = document.getElementById("chairTypeFilter");

  if (rowFilter) rowFilter.value = "";
  if (numberFilter) numberFilter.value = "";
  if (typeFilter) typeFilter.value = "";

  filteredChairs = allChairs;
  loadChairsTable();
}

// Function to refresh current view based on active tab
function refreshCurrentView() {
  // Reload cinema rooms data and refresh the current view
  loadCinemaRooms();
}