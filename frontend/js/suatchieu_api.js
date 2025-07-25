const API_BASE_URL = "http://127.0.0.1:5000/api"; // Adjust this URL based on your backend configuration

class SuatChieuAPI {
  static getToken() {
    return localStorage.getItem("token");
  }

  static async getSuatChieuList() {
    const token = this.getToken();
    if (!token) throw new Error("No token found, please login");
    try {
      const response = await fetch(`${API_BASE_URL}/suatchieu/`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (!response.ok) {
        if (response.status === 401) {
          localStorage.removeItem("token");
          window.location.href = "/frontend/login.html";
        }
        throw new Error(
          `Error fetching suat chieu list: ${response.statusText}`
        );
      }
      return await response.json();
    } catch (error) {
      console.error("Failed to fetch suat chieu list:", error);
      throw error;
    }
  }

  static async getSuatChieuById(id) {
    const token = this.getToken();
    if (!token) throw new Error("No token found, please login");
    try {
      const response = await fetch(`${API_BASE_URL}/suatchieu/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (!response.ok) {
        if (response.status === 401) {
          localStorage.removeItem("token");
          window.location.href = "/frontend/login.html";
        }
        throw new Error(
          `Error fetching suat chieu by ID: ${response.statusText}`
        );
      }
      return await response.json();
    } catch (error) {
      console.error("Failed to fetch suat chieu by ID:", error);
      throw error;
    }
  }

  static async createSuatChieu(suatChieuData) {
    const token = this.getToken();
    if (!token) throw new Error("No token found, please login");
    try {
      console.log("Creating suat chieu with data:", suatChieuData);
      const response = await fetch(`${API_BASE_URL}/suatchieu/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(suatChieuData),
      });

      if (!response.ok) {
        if (response.status === 401) {
          localStorage.removeItem("token");
          window.location.href = "/frontend/login.html";
        }
        const data = await response.json();
        throw new Error(
          data.error || `Error creating suat chieu: ${response.statusText}`
        );
      }

      return await response.json();
    } catch (error) {
      console.error("Lỗi tạo suất chiếu:", error);
      throw error;
    }
  }

  static async updateSuatChieu(id, suatChieuData) {
    const token = this.getToken();
    if (!token) throw new Error("No token found, please login");
    try {
      const response = await fetch(`${API_BASE_URL}/suatchieu/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(suatChieuData),
      });
      if (!response.ok) {
        if (response.status === 401) {
          localStorage.removeItem("token");
          window.location.href = "/frontend/login.html";
        }
        throw new Error(`Error updating suat chieu: ${response.statusText}`);
      }
      return await response.json();
    } catch (error) {
      console.error("Failed to update suat chieu:", error);
      throw error;
    }
  }

  static async deleteSuatChieu(id) {
    const token = this.getToken();
    if (!token) throw new Error("No token found, please login");
    try {
      const response = await fetch(`${API_BASE_URL}/suatchieu/${id}`, {
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
        throw new Error(`Error deleting suat chieu: ${response.statusText}`);
      }
      return await response.json();
    } catch (error) {
      console.error("Failed to delete suat chieu:", error);
      throw error;
    }
  }

  static async getSuatChieuWithFilter(filters = {}) {
    const token = this.getToken();
    if (!token) throw new Error("No token found, please login");
    try {
      const queryParams = new URLSearchParams();

      // Thêm các filter vào query string
      if (filters.ten_phim) queryParams.append("ten_phim", filters.ten_phim);
      if (filters.ma_phong) queryParams.append("ma_phong", filters.ma_phong);
      if (filters.ngay_chieu)
        queryParams.append("ngay_chieu", filters.ngay_chieu);
      if (filters.gio_chieu_tu)
        queryParams.append("gio_chieu_tu", filters.gio_chieu_tu);
      if (filters.gio_chieu_den)
        queryParams.append("gio_chieu_den", filters.gio_chieu_den);

      const url = `${API_BASE_URL}/suatchieu/filter${
        queryParams.toString() ? "?" + queryParams.toString() : ""
      }`;

      const response = await fetch(url, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (!response.ok) {
        if (response.status === 401) {
          localStorage.removeItem("token");
          window.location.href = "/frontend/login.html";
        }
        throw new Error(
          `Error fetching filtered suat chieu list: ${response.statusText}`
        );
      }
      const result = await response.json();
      return result.data || result; // API trả về {data: [...]} hoặc [...]
    } catch (error) {
      console.error("Failed to fetch filtered suat chieu list:", error);
      throw error;
    }
  }
}

// Utility Functions
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

// Global Variables
let currentView = "table";
let allShowtimes = [];
let filteredShowtimes = [];
let allMovies = [];
let allRooms = [];

// Filter Functions
async function filterShowtimes() {
  const movieSearchTerm =
    document.getElementById("movieSearchInput")?.value.toLowerCase() || "";
  const roomSearchTerm =
    document.getElementById("roomSearchInput")?.value.toLowerCase() || "";
  const dateFilter = document.getElementById("dateFilter")?.value || "";
  const timeFromFilter = document.getElementById("timeFromFilter")?.value || "";
  const timeToFilter = document.getElementById("timeToFilter")?.value || "";
  const statusFilter = document.getElementById("statusFilter")?.value || "";

  try {
    showLoading();

    // Tạo object filter cho API
    const filters = {};

    if (movieSearchTerm) {
      filters.ten_phim = movieSearchTerm;
    }

    if (dateFilter) {
      filters.ngay_chieu = dateFilter;
    }

    if (timeFromFilter) {
      filters.gio_chieu_tu = timeFromFilter + ":00"; // Chuyển HH:mm thành HH:mm:ss
    }

    if (timeToFilter) {
      filters.gio_chieu_den = timeToFilter + ":00"; // Chuyển HH:mm thành HH:mm:ss
    }

    // Nếu có room search term, cần convert sang mã phòng
    if (roomSearchTerm) {
      // Tìm phòng theo tên
      const matchedRoom = allRooms.find((room) =>
        room.TenPhong.toLowerCase().includes(roomSearchTerm)
      );
      if (matchedRoom) {
        filters.ma_phong = matchedRoom.MaPhong;
      } else {
        // Nếu không tìm thấy phòng nào, set filter không tồn tại để trả về rỗng
        filters.ma_phong = -1;
      }
    }

    // Gọi API với filter
    let showtimes;
    if (Object.keys(filters).length > 0) {
      showtimes = await SuatChieuAPI.getSuatChieuWithFilter(filters);
    } else {
      showtimes = await SuatChieuAPI.getSuatChieuList();
    }

    // Filter thêm theo status nếu cần (vì API chưa hỗ trợ status filter)
    filteredShowtimes = showtimes.filter((showtime) => {
      const matchesStatus =
        !statusFilter || checkShowtimeStatus(showtime) === statusFilter;
      return matchesStatus;
    });

    if (currentView === "table") {
      loadShowtimeTableView(filteredShowtimes);
    } else {
      loadShowtimeCardView(filteredShowtimes);
    }
    updateEmptyState();
  } catch (error) {
    console.error("Error filtering showtimes:", error);
    showAlert("Lỗi khi lọc suất chiếu: " + error.message, "danger");

    // Fallback to client-side filtering
    filteredShowtimes = allShowtimes.filter((showtime) => {
      // Tìm kiếm theo tên phim
      const matchesMovieSearch =
        !movieSearchTerm ||
        showtime.Phim?.TenPhim?.toLowerCase().includes(movieSearchTerm);

      // Tìm kiếm theo tên phòng
      const matchesRoomSearch =
        !roomSearchTerm ||
        showtime.Phong?.TenPhong?.toLowerCase().includes(roomSearchTerm);

      // Lọc theo ngày
      const matchesDate = !dateFilter || showtime.NgayChieu === dateFilter;

      // Lọc theo giờ bắt đầu
      const matchesTimeFrom =
        !timeFromFilter || showtime.GioChieu >= timeFromFilter + ":00";

      // Lọc theo giờ kết thúc
      const matchesTimeTo =
        !timeToFilter || showtime.GioChieu <= timeToFilter + ":00";

      // Lọc theo trạng thái
      const matchesStatus =
        !statusFilter || checkShowtimeStatus(showtime) === statusFilter;

      return (
        matchesMovieSearch &&
        matchesRoomSearch &&
        matchesDate &&
        matchesTimeFrom &&
        matchesTimeTo &&
        matchesStatus
      );
    });

    if (currentView === "table") {
      loadShowtimeTableView(filteredShowtimes);
    } else {
      loadShowtimeCardView(filteredShowtimes);
    }
    updateEmptyState();
  } finally {
    hideLoading();
  }
}

// Clear all filters function
function clearAllFilters() {
  document.getElementById("movieSearchInput").value = "";
  document.getElementById("roomSearchInput").value = "";
  document.getElementById("dateFilter").value = "";
  document.getElementById("timeFromFilter").value = "";
  document.getElementById("timeToFilter").value = "";
  document.getElementById("statusFilter").value = "";

  // Disable time filters when date is cleared
  toggleTimeFilters(false);

  // Trigger filter update
  filterShowtimes();
}

// Function to toggle time filters based on date selection
function toggleTimeFilters(enable) {
  const timeFromFilter = document.getElementById("timeFromFilter");
  const timeToFilter = document.getElementById("timeToFilter");

  if (timeFromFilter && timeToFilter) {
    timeFromFilter.disabled = !enable;
    timeToFilter.disabled = !enable;

    if (!enable) {
      timeFromFilter.value = "";
      timeToFilter.value = "";
    }
  }
}

// Function to handle date filter change
function handleDateFilterChange() {
  const dateFilter = document.getElementById("dateFilter");
  const hasDate = dateFilter && dateFilter.value;

  toggleTimeFilters(hasDate);

  // Clear time values if no date selected
  if (!hasDate) {
    document.getElementById("timeFromFilter").value = "";
    document.getElementById("timeToFilter").value = "";
  }

  filterShowtimes();
}

// Hàm kiểm tra trạng thái suất chiếu
function checkShowtimeStatus(showtime) {
  const now = new Date();
  const showtimeDate = new Date(`${showtime.NgayChieu}T${showtime.GioChieu}`);

  // Thời gian kết thúc phim (giả sử mỗi phim dài 2 giờ nếu không có thông tin thời lượng)
  const movieDuration = showtime.Phim?.ThoiLuong || 120; // phút
  const showtimeEnd = new Date(showtimeDate.getTime() + movieDuration * 60000);

  // Thời gian 4 giờ tới
  const fourHoursLater = new Date(now.getTime() + 4 * 60 * 60 * 1000);

  if (showtimeEnd < now) {
    return "completed"; // Đã chiếu
  } else if (showtimeDate <= now && showtimeEnd >= now) {
    return "active"; // Đang chiếu
  } else if (showtimeDate <= fourHoursLater) {
    return "upcoming"; // Sắp chiếu trong 4h
  } else {
    return "future"; // Suất chiếu xa hơn
  }
}

// Hàm hiển thị trạng thái với màu sắc
function getStatusDisplay(status) {
  const statusConfig = {
    completed: {
      text: "Đã chiếu",
      color: "#6c757d",
      bgColor: "rgba(108, 117, 125, 0.1)",
      icon: "fas fa-check-circle",
    },
    active: {
      text: "Đang chiếu",
      color: "#28a745",
      bgColor: "rgba(40, 167, 69, 0.1)",
      icon: "fas fa-play-circle",
    },
    upcoming: {
      text: "Sắp chiếu",
      color: "#ffc107",
      bgColor: "rgba(255, 193, 7, 0.1)",
      icon: "fas fa-clock",
    },
    future: {
      text: "Chưa tới giờ",
      color: "#17a2b8",
      bgColor: "rgba(23, 162, 184, 0.1)",
      icon: "fas fa-calendar-plus",
    },
  };

  const config = statusConfig[status] || statusConfig.future;
  return `
    <span style="display: inline-flex; align-items: center; padding: 4px 8px; border-radius: 12px; 
                 background-color: ${config.bgColor}; color: ${config.color}; font-size: 0.875rem; font-weight: 600;">
      <i class="${config.icon}" style="margin-right: 4px; font-size: 0.75rem;"></i>
      ${config.text}
    </span>
  `;
}

function updateEmptyState() {
  const emptyState = document.getElementById("emptyState");
  const tableView = document.getElementById("tableView");
  const cardView = document.getElementById("cardView");

  if (filteredShowtimes.length === 0 && emptyState && tableView && cardView) {
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
    loadShowtimeTableView(filteredShowtimes);
  } else {
    loadShowtimeCardView(filteredShowtimes);
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

// Load and Display Functions
async function loadShowtimes() {
  const token = localStorage.getItem("token");
  if (!token) {
    alert("Vui lòng đăng nhập!");
    window.location.href = "/frontend/login.html";
    return;
  }

  showLoading();
  try {
    const showtimes = await SuatChieuAPI.getSuatChieuList();
    allShowtimes = showtimes;
    filteredShowtimes = showtimes;
    updateStats(showtimes);
    if (currentView === "table") {
      loadShowtimeTableView(showtimes);
    } else {
      loadShowtimeCardView(showtimes);
    }
    updateEmptyState();
  } catch (error) {
    showAlert("Lỗi khi tải danh sách suất chiếu: " + error.message, "danger");
    if (error.message.includes("No token found")) {
      window.location.href = "/frontend/login.html";
    }
  } finally {
    hideLoading();
  }
}

async function loadMovies() {
  const token = localStorage.getItem("token");
  if (!token) throw new Error("No token found, please login");
  try {
    const response = await fetch(`${API_BASE_URL}/phim/`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    if (!response.ok) {
      if (response.status === 401) {
        localStorage.removeItem("token");
        window.location.href = "/frontend/login.html";
      }
      throw new Error("Failed to fetch movies");
    }
    allMovies = await response.json();
    populateMovieSelects();
  } catch (error) {
    console.error("Error loading movies:", error);
  }
}

async function loadRooms() {
  const token = localStorage.getItem("token");
  if (!token) throw new Error("No token found, please login");
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
    allRooms = await response.json();
    populateRoomSelects();
  } catch (error) {
    console.error("Error loading rooms:", error);
  }
}

function populateMovieSelects() {
  const movieSelect = document.getElementById("maPhim");

  if (movieSelect) {
    movieSelect.innerHTML = '<option value="">Chọn phim</option>';
    allMovies.forEach((movie) => {
      const option = document.createElement("option");
      option.value = movie.MaPhim;
      option.textContent = movie.TenPhim;
      movieSelect.appendChild(option);
    });
  }
}

function populateRoomSelects() {
  const roomSelect = document.getElementById("maPhong");

  if (roomSelect) {
    roomSelect.innerHTML = '<option value="">Chọn phòng chiếu</option>';
    allRooms.forEach((room) => {
      const option = document.createElement("option");
      option.value = room.MaPhong;
      option.textContent = `${room.TenPhong} (${room.LoaiPhong})`;
      roomSelect.appendChild(option);
    });
  }
}

function updateStats(showtimes) {
  animateNumber("totalShowtimesCount", showtimes.length);

  // Suất chiếu hôm nay
  const today = new Date().toISOString().split("T")[0];
  const todayShowtimes = showtimes.filter((s) => s.NgayChieu === today);
  animateNumber("todayShowtimesCount", todayShowtimes.length);

  // Số suất chiếu còn vé (suất chiếu chưa hết vé)
  const showtimesWithTickets = showtimes.filter((s) => {
    const ticketsSold = s.SoLuongVeDaBan || 0;
    const totalSeats = s.Phong?.SoGhe || 0;
    return totalSeats > 0 && ticketsSold < totalSeats;
  });
  animateNumber("avgPriceCount", showtimesWithTickets.length);

  // Số phim đang chiếu (suất chiếu hiện tại - đúng ngày hôm nay và đã qua giờ chiếu nhưng không qua thời lượng)
  const activeMovies = new Set(
    todayShowtimes
      .filter((s) => {
        const showtimeDate = new Date(`${s.NgayChieu}T${s.GioChieu}`);
        return showtimeDate <= new Date();
      })
      .map((s) => s.Phim.MaPhim)
  );
  animateNumber("activeMoviesCount", activeMovies.size);
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

    element.textContent = currentValue.toLocaleString();

    if (progress < 1) {
      requestAnimationFrame(updateNumber);
    }
  }

  requestAnimationFrame(updateNumber);
}

function loadShowtimeTableView(showtimes) {
  const tbody = document.getElementById("showtimesTableBody");
  if (!tbody) return;
  tbody.innerHTML = "";

  showtimes.forEach((showtime, index) => {
    const row = document.createElement("tr");
    row.className = "slide-in-right";
    row.style.animationDelay = `${index * 0.05}s`;

    const formatDate = (dateStr) => {
      const date = new Date(dateStr);
      return date.toLocaleDateString("vi-VN");
    };

    const formatTime = (timeStr) => {
      return timeStr ? timeStr.substring(0, 5) : "";
    };

    const formatPrice = (price) => {
      return parseFloat(price).toLocaleString("vi-VN") + " VNĐ";
    };

    const ticketsSold = showtime.SoLuongVeDaBan || 0;
    const totalSeats = showtime.Phong?.SoGhe || 0;
    const occupancyRate =
      totalSeats > 0 ? Math.round((ticketsSold / totalSeats) * 100) : 0;
    const status = checkShowtimeStatus(showtime);

    row.innerHTML = `
      <td>
        <div style="overflow: hidden;">
          <div style="font-weight: 700; color: white; margin-bottom: 4px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;" title="${
            showtime.Phim?.TenPhim || "N/A"
          }">${showtime.Phim?.TenPhim || "N/A"}</div>
          <small style="color: rgba(255, 255, 255, 0.5);">ID: ${
            showtime.Phim?.MaPhim || "N/A"
          }</small>
        </div>
      </td>
      <td>
        <div style="overflow: hidden;">
          <div style="font-weight: 600; color: white; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;" title="${
            showtime.Phong?.TenPhong || "N/A"
          }">${showtime.Phong?.TenPhong || "N/A"}</div>
          <small style="color: rgba(255, 255, 255, 0.5);">${
            showtime.Phong?.LoaiPhong || ""
          }</small>
        </div>
      </td>
      <td>
        <div style="color: white; font-weight: 600;">${formatDate(
          showtime.NgayChieu
        )}</div>
        <small style="color: rgba(255, 255, 255, 0.7);">${formatTime(
          showtime.GioChieu
        )}</small>
      </td>
      <td style="text-align: center;">
        <div style="color: white; font-weight: 600;">${ticketsSold}/${totalSeats}</div>
        <small style="color: ${
          occupancyRate > 80
            ? "#ff6b6b"
            : occupancyRate > 50
            ? "#feca57"
            : "#48dbfb"
        };">${occupancyRate}%</small>
      </td>
      <td style="color: white; font-weight: 600;">${formatPrice(
        showtime.GiaVe
      )}</td>
      <td style="text-align: center;">
        ${getStatusDisplay(status)}
      </td>
      <td style="text-align: center;">
        <div class="d-flex gap-2 justify-content-center">
          <button class="ultra-btn ultra-btn-warning ultra-btn-sm" onclick="editShowtime(${
            showtime.MaSuatChieu
          })" title="Chỉnh sửa">
            <i class="fas fa-edit"></i>
          </button>
          <button class="ultra-btn ultra-btn-danger ultra-btn-sm" onclick="deleteShowtime(${
            showtime.MaSuatChieu
          })" title="Xóa">
            <i class="fas fa-trash"></i>
          </button>
        </div>
      </td>
    `;
    tbody.appendChild(row);
  });
}

function loadShowtimeCardView(showtimes) {
  const cardContainer = document.getElementById("cardView");
  if (!cardContainer) return;
  cardContainer.innerHTML = "";

  showtimes.forEach((showtime, index) => {
    const cardDiv = document.createElement("div");
    cardDiv.className = "ultra-item-card scale-in";
    cardDiv.style.animationDelay = `${index * 0.1}s`;

    const formatDate = (dateStr) => {
      const date = new Date(dateStr);
      return date.toLocaleDateString("vi-VN");
    };

    const formatTime = (timeStr) => {
      return timeStr ? timeStr.substring(0, 5) : "";
    };

    const formatPrice = (price) => {
      return parseFloat(price).toLocaleString("vi-VN") + " VNĐ";
    };

    const ticketsSold = showtime.SoLuongVeDaBan || 0;
    const totalSeats = showtime.Phong?.SoGhe || 0;
    const occupancyRate =
      totalSeats > 0 ? Math.round((ticketsSold / totalSeats) * 100) : 0;
    const status = checkShowtimeStatus(showtime);

    cardDiv.innerHTML = `
      <div class="ultra-item-visual" style="background: var(--primary-gradient);">
        <div style="text-align: center;">
          <i class="fas fa-calendar-alt" style="font-size: 3rem; color: white; margin-bottom: 1rem;"></i>
          <div style="font-weight: 700; color: white; font-size: 1.2rem;">${formatTime(
            showtime.GioChieu
          )}</div>
        </div>
      </div>
      
      <h3 class="ultra-item-title">${showtime.Phim?.TenPhim || "N/A"}</h3>
      
      <div class="ultra-item-meta">
        <div class="ultra-item-meta-row">
          <span><i class="fas fa-door-open me-2"></i>Phòng chiếu</span>
          <span style="font-weight: 600; color: white;">${
            showtime.Phong?.TenPhong || "N/A"
          }</span>
        </div>
        <div class="ultra-item-meta-row">
          <span><i class="fas fa-calendar-clock me-2"></i>Thời gian chiếu</span>
          <div style="text-align: right;">
            <div style="font-weight: 600; color: white;">${formatDate(
              showtime.NgayChieu
            )}</div>
            <small style="color: rgba(255, 255, 255, 0.7);">${formatTime(
              showtime.GioChieu
            )}</small>
          </div>
        </div>
        <div class="ultra-item-meta-row">
          <span><i class="fas fa-clock me-2"></i>Trạng thái</span>
          <div style="text-align: right;">
            ${getStatusDisplay(status)}
          </div>
        </div>
        <div class="ultra-item-meta-row">
          <span><i class="fas fa-ticket-alt me-2"></i>Vé đã bán</span>
          <div style="text-align: right;">
            <span style="font-weight: 600; color: white;">${ticketsSold}/${totalSeats}</span>
            <div>
              <small style="color: ${
                occupancyRate > 80
                  ? "#ff6b6b"
                  : occupancyRate > 50
                  ? "#feca57"
                  : "#48dbfb"
              }; font-weight: 600;">${occupancyRate}%</small>
            </div>
          </div>
        </div>
        <div class="ultra-item-meta-row">
          <span><i class="fas fa-money-bill me-2"></i>Giá vé</span>
          <span style="font-weight: 600; color: white;">${formatPrice(
            showtime.GiaVe
          )}</span>
        </div>
      </div>
      
      <div class="ultra-item-actions">
        <button class="ultra-btn ultra-btn-warning ultra-btn-sm flex-fill" onclick="editShowtime(${
          showtime.MaSuatChieu
        })">
          <i class="fas fa-edit me-2"></i>Sửa
        </button>
        <button class="ultra-btn ultra-btn-danger ultra-btn-sm flex-fill" onclick="deleteShowtime(${
          showtime.MaSuatChieu
        })">
          <i class="fas fa-trash me-2"></i>Xóa
        </button>
      </div>
    `;
    cardContainer.appendChild(cardDiv);
  });
}

// Modal Functions
function openAddModal() {
  document.getElementById("suatChieuModalTitle").innerHTML =
    '<i class="fas fa-plus-circle me-3"></i>Thêm Suất Chiếu Mới';
  document.getElementById("suatChieuForm").reset();
  document.getElementById("suatChieuId").value = "";

  // Set default date to today
  const today = new Date().toISOString().split("T")[0];
  document.getElementById("ngayChieu").value = today;
}

async function editShowtime(id) {
  try {
    const showtime = await SuatChieuAPI.getSuatChieuById(id);
    document.getElementById("suatChieuModalTitle").innerHTML =
      '<i class="fas fa-edit me-3"></i>Chỉnh Sửa Suất Chiếu';
    document.getElementById("suatChieuId").value = showtime.MaSuatChieu;
    document.getElementById("maPhim").value = showtime.Phim.MaPhim;
    document.getElementById("maPhong").value = showtime.Phong.MaPhong;
    document.getElementById("ngayChieu").value = showtime.NgayChieu;
    document.getElementById("gioChieu").value = showtime.GioChieu;
    document.getElementById("giaVe").value = showtime.GiaVe;

    new bootstrap.Modal(document.getElementById("suatChieuModal")).show();
  } catch (error) {
    showAlert("Lỗi khi tải thông tin suất chiếu: " + error.message, "danger");
  }
}

async function saveShowtime() {
  const form = document.getElementById("suatChieuForm");
  if (!form.checkValidity()) {
    form.reportValidity();
    return;
  }

  const gioChieuInput = document.getElementById("gioChieu").value;
  let gioChieu;

  // Kiểm tra và chuẩn hóa định dạng GioChieu
  if (gioChieuInput.match(/^\d{2}:\d{2}$/)) {
    gioChieu = gioChieuInput + ":00"; // Thêm :00 nếu là HH:mm
  } else if (gioChieuInput.match(/^\d{2}:\d{2}:\d{2}$/)) {
    gioChieu = gioChieuInput; // Giữ nguyên nếu đã là HH:mm:ss
  } else {
    showAlert("Giờ chiếu phải có định dạng HH:mm hoặc HH:mm:ss", "danger");
    return;
  }

  const showtimeData = {
    MaPhim: parseInt(document.getElementById("maPhim").value),
    MaPhong: parseInt(document.getElementById("maPhong").value),
    NgayChieu: document.getElementById("ngayChieu").value,
    GioChieu: gioChieu,
    GiaVe: parseFloat(document.getElementById("giaVe").value),
  };
  console.log("Sending showtimeData:", showtimeData);

  // Kiểm tra dữ liệu
  if (
    isNaN(showtimeData.MaPhim) ||
    isNaN(showtimeData.MaPhong) ||
    isNaN(showtimeData.GiaVe)
  ) {
    showAlert(
      "Dữ liệu không hợp lệ: Vui lòng kiểm tra các trường số",
      "danger"
    );
    return;
  }
  if (!showtimeData.NgayChieu || !gioChieu.match(/^\d{2}:\d{2}:\d{2}$/)) {
    showAlert("Ngày chiếu hoặc giờ chiếu không hợp lệ", "danger");
    return;
  }

  try {
    const showtimeId = document.getElementById("suatChieuId").value;
    if (showtimeId) {
      await SuatChieuAPI.updateSuatChieu(showtimeId, showtimeData);
      showAlert("Cập nhật suất chiếu thành công!", "success");
    } else {
      await SuatChieuAPI.createSuatChieu(showtimeData);
      showAlert("Thêm suất chiếu thành công!", "success");
    }
    bootstrap.Modal.getInstance(
      document.getElementById("suatChieuModal")
    ).hide();
    loadShowtimes();
  } catch (error) {
    showAlert("Lỗi khi lưu suất chiếu: " + error.message, "danger");
    alert("Lỗi khi tạo suất chiếu: " + error.message);
  }
}

async function deleteShowtime(id) {
  if (confirm("Bạn có chắc chắn muốn xóa suất chiếu này?")) {
    try {
      await SuatChieuAPI.deleteSuatChieu(id);
      showAlert("Xóa suất chiếu thành công!", "success");
      loadShowtimes();
    } catch (error) {
      showAlert("Lỗi khi xóa suất chiếu: " + error.message, "danger");
    }
  }
}

// Initialize page when sidebar is loaded
document.addEventListener("sidebarLoaded", function () {
  loadShowtimes();
  loadMovies();
  loadRooms();

  // Setup event listeners
  const movieSearchInput = document.getElementById("movieSearchInput");
  const roomSearchInput = document.getElementById("roomSearchInput");
  const dateFilter = document.getElementById("dateFilter");
  const timeFromFilter = document.getElementById("timeFromFilter");
  const timeToFilter = document.getElementById("timeToFilter");
  const statusFilter = document.getElementById("statusFilter");

  if (movieSearchInput) {
    movieSearchInput.addEventListener("input", filterShowtimes);
  }
  if (roomSearchInput) {
    roomSearchInput.addEventListener("input", filterShowtimes);
  }
  if (dateFilter) {
    dateFilter.addEventListener("change", handleDateFilterChange);
  }
  if (timeFromFilter) {
    timeFromFilter.addEventListener("change", filterShowtimes);
  }
  if (timeToFilter) {
    timeToFilter.addEventListener("change", filterShowtimes);
  }
  if (statusFilter) {
    statusFilter.addEventListener("change", filterShowtimes);
  }
});

// Fallback: load data if sidebar is already loaded
if (window.sidebarManager && window.sidebarManager.isLoaded()) {
  loadShowtimes();
  loadMovies();
  loadRooms();

  const movieSearchInput = document.getElementById("movieSearchInput");
  const roomSearchInput = document.getElementById("roomSearchInput");
  const dateFilter = document.getElementById("dateFilter");
  const timeFromFilter = document.getElementById("timeFromFilter");
  const timeToFilter = document.getElementById("timeToFilter");
  const statusFilter = document.getElementById("statusFilter");

  if (movieSearchInput) {
    movieSearchInput.addEventListener("input", filterShowtimes);
  }
  if (roomSearchInput) {
    roomSearchInput.addEventListener("input", filterShowtimes);
  }
  if (dateFilter) {
    dateFilter.addEventListener("change", handleDateFilterChange);
  }
  if (timeFromFilter) {
    timeFromFilter.addEventListener("change", filterShowtimes);
  }
  if (timeToFilter) {
    timeToFilter.addEventListener("change", filterShowtimes);
  }
  if (statusFilter) {
    statusFilter.addEventListener("change", filterShowtimes);
  }
}

// Fallback to load data if sidebar fails
window.addEventListener("load", function () {
  loadShowtimes();
  loadMovies();
  loadRooms();

  // Initialize time filters state
  toggleTimeFilters(false);
});
