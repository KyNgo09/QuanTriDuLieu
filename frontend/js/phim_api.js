const API_BASE_URL = "http://127.0.0.1:5000/api";

// Movies API
class PhimAPI {
    static getToken() {
        return localStorage.getItem("token");
    }

    static async getMovies() {
        const token = this.getToken();
        if (!token) throw new Error("Vui lòng đăng nhập");
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
            return await response.json(); // Trả về mảng phim trực tiếp
        } catch (error) {
            console.error("Error fetching movies:", error);
            throw error;
        }
    }

    static async getMovie(id) {
        const token = this.getToken();
        if (!token) throw new Error("No token found, please login");
        try {
            const response = await fetch(`${API_BASE_URL}/phim/${id}`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            if (!response.ok) {
                if (response.status === 401) {
                    localStorage.removeItem("token");
                    window.location.href = "/frontend/login.html";
                }
                throw new Error("Failed to fetch movie");
            }
            return await response.json(); // Trả về đối tượng phim trực tiếp
        } catch (error) {
            console.error("Error fetching movie:", error);
            throw error;
        }
    }

    static async createMovie(movieData) {
        const token = this.getToken();
        if (!token) throw new Error("No token found, please login");
        try {
            const response = await fetch(`${API_BASE_URL}/phim/`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify(movieData),
            });
            if (!response.ok) {
                if (response.status === 401) {
                    localStorage.removeItem("token");
                    window.location.href = "/frontend/login.html";
                }
                throw new Error("Failed to create movie");
            }
            return await response.json();
        } catch (error) {
            console.error("Error creating movie:", error);
            throw error;
        }
    }

    static async updateMovie(id, movieData) {
        const token = this.getToken();
        if (!token) throw new Error("No token found, please login");
        try {
            const response = await fetch(`${API_BASE_URL}/phim/${id}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify(movieData),
            });
            if (!response.ok) {
                if (response.status === 401) {
                    localStorage.removeItem("token");
                    window.location.href = "/frontend/login.html";
                }
                throw new Error("Failed to update movie");
            }
            return await response.json();
        } catch (error) {
            console.error("Error updating movie:", error);
            throw error;
        }
    }

    static async deleteMovie(id) {
        const token = this.getToken();
        if (!token) throw new Error("No token found, please login");
        try {
            const response = await fetch(`${API_BASE_URL}/phim/${id}`, {
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
                throw new Error("Failed to delete movie");
            }
            return await response.json();
        } catch (error) {
            console.error("Error deleting movie:", error);
            throw error;
        }
    }
}


// Utility Functions for Movies
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

function formatDate(dateString) {
  if (!dateString) return "";
  const date = new Date(dateString);
  return date.toLocaleDateString("vi-VN");
}

// Global Variables for Movies
let currentView = "table";
let allMovies = [];
let filteredMovies = [];

// Movie Management Functions
function filterMovies() {
  const searchTerm =
    document.getElementById("searchInput")?.value.toLowerCase() || "";
  const genreFilter = document.getElementById("genreFilter")?.value || "";

  filteredMovies = allMovies.filter((movie) => {
    const matchesSearch =
      movie.TenPhim.toLowerCase().includes(searchTerm) ||
      movie.TheLoai.toLowerCase().includes(searchTerm) ||
      movie.DaoDien.toLowerCase().includes(searchTerm);
    const matchesGenre = !genreFilter || movie.TheLoai.includes(genreFilter);
    return matchesSearch && matchesGenre;
  });

  if (currentView === "table") {
    loadTableView(filteredMovies);
  } else {
    loadCardView(filteredMovies);
  }

  updateEmptyState();
}

function updateEmptyState() {
  const emptyState = document.getElementById("emptyState");
  const tableView = document.getElementById("tableView");
  const cardView = document.getElementById("cardView");

  if (filteredMovies.length === 0 && emptyState && tableView && cardView) {
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
    loadTableView(filteredMovies);
  } else {
    loadCardView(filteredMovies);
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

async function loadMovies() {
    const token = localStorage.getItem("token");
    if (!token) {
        alert("Vui lòng đăng nhập!");
        window.location.href = "/frontend/login.html";
        return;
    }

    showLoading();
    try {
        const movies = await PhimAPI.getMovies();
        allMovies = movies;
        filteredMovies = movies;
        updateStats(movies);
        if (currentView === "table") {
            loadTableView(movies);
        } else {
            loadCardView(movies);
        }
        updateEmptyState();
    } catch (error) {
        showAlert("Lỗi khi tải danh sách phim: " + error.message, "danger");
        if (error.message.includes("No token found")) {
            window.location.href = "/frontend/login.html";
        }
    } finally {
        hideLoading();
    }
}

function updateStats(movies) {
  animateNumber("totalMoviesCount", movies.length);
  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();
  const newMovies = movies.filter((movie) => {
    const releaseDate = new Date(movie.NgayKhoiChieu);
    return (
      releaseDate.getMonth() === currentMonth &&
      releaseDate.getFullYear() === currentYear
    );
  });
  animateNumber("newMoviesCount", newMovies.length);
  const avgDuration =
    movies.length > 0
      ? Math.round(
          movies.reduce((sum, movie) => sum + movie.ThoiLuong, 0) /
            movies.length
        )
      : 0;
  animateNumber("avgDuration", avgDuration);
  const genres = new Set();
  movies.forEach((movie) => {
    movie.TheLoai.split(",").forEach((genre) => genres.add(genre.trim()));
  });
  animateNumber("genreCount", genres.size);
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

function loadTableView(movies) {
  const tbody = document.getElementById("moviesTableBody");
  if (!tbody) return;
  tbody.innerHTML = "";

  movies.forEach((movie, index) => {
    const row = document.createElement("tr");
    row.className = "slide-in-right";
    row.style.animationDelay = `${index * 0.05}s`;

    row.innerHTML = `
            <td>
                <div class="ultra-item-visual" style="width: 80px; height: 60px; margin: 0;">
                    <i class="fas fa-film" style="font-size: 1.5rem; color: white;"></i>
                </div>
            </td>
            <td>
                <div>
                    <div style="font-weight: 700; color: white; margin-bottom: 4px;">${
                      movie.TenPhim
                    }</div>
                    <small style="color: rgba(255, 255, 255, 0.5);">ID: ${
                      movie.MaPhim
                    }</small>
                </div>
            </td>
            <td>
                <span class="ultra-badge ultra-badge-2d">
                    ${movie.TheLoai}
                </span>
            </td>
            <td style="color: rgba(255, 255, 255, 0.8);">${movie.DaoDien}</td>
            <td>
                <span style="font-weight: 600; color: white;">${
                  movie.ThoiLuong
                }</span> phút
            </td>
            <td style="color: rgba(255, 255, 255, 0.8);">${formatDate(
              movie.NgayKhoiChieu
            )}</td>
            <td>
                <span class="ultra-badge ${getAgeRatingClass(
                  movie.DoTuoiChoPhep
                )}">
                    ${movie.DoTuoiChoPhep || "P"}
                </span>
            </td>
            <td>
                <div class="d-flex gap-2">
                    <button class="ultra-btn ultra-btn-warning ultra-btn-sm" onclick="editMovie(${
                      movie.MaPhim
                    })" title="Chỉnh sửa">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="ultra-btn ultra-btn-danger ultra-btn-sm" onclick="deleteMovie(${
                      movie.MaPhim
                    })" title="Xóa">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </td>
        `;
    tbody.appendChild(row);
  });
}

function loadCardView(movies) {
  const cardContainer = document.getElementById("cardView");
  if (!cardContainer) return;
  cardContainer.innerHTML = "";

  movies.forEach((movie, index) => {
    const cardDiv = document.createElement("div");
    cardDiv.className = "ultra-item-card scale-in";
    cardDiv.style.animationDelay = `${index * 0.1}s`;

    cardDiv.innerHTML = `
            <div class="ultra-item-visual">
                <i class="fas fa-film" style="font-size: 3rem; color: white;"></i>
            </div>
            
            <h3 class="ultra-item-title">${movie.TenPhim}</h3>
            
            <div class="ultra-item-meta">
                <div class="ultra-item-meta-row">
                    <span><i class="fas fa-tags me-2"></i>Thể loại</span>
                    <span class="ultra-badge ultra-badge-2d">${
                      movie.TheLoai
                    }</span>
                </div>
                <div class="ultra-item-meta-row">
                    <span><i class="fas fa-user-tie me-2"></i>Đạo diễn</span>
                    <span>${movie.DaoDien}</span>
                </div>
                <div class="ultra-item-meta-row">
                    <span><i class="fas fa-clock me-2"></i>Thời lượng</span>
                    <span style="font-weight: 600; color: white;">${
                      movie.ThoiLuong
                    } phút</span>
                </div>
                <div class="ultra-item-meta-row">
                    <span><i class="fas fa-calendar me-2"></i>Khởi chiếu</span>
                    <span>${formatDate(movie.NgayKhoiChieu)}</span>
                </div>
                <div class="ultra-item-meta-row">
                    <span><i class="fas fa-users me-2"></i>Độ tuổi</span>
                    <span class="ultra-badge ${getAgeRatingClass(
                      movie.DoTuoiChoPhep
                    )}">${movie.DoTuoiChoPhep || "P"}</span>
                </div>
            </div>
            
            <div class="ultra-item-actions">
                <button class="ultra-btn ultra-btn-warning ultra-btn-sm flex-fill" onclick="editMovie(${
                  movie.MaPhim
                })">
                    <i class="fas fa-edit me-2"></i>Sửa
                </button>
                <button class="ultra-btn ultra-btn-danger ultra-btn-sm flex-fill" onclick="deleteMovie(${
                  movie.MaPhim
                })">
                    <i class="fas fa-trash me-2"></i>Xóa
                </button>
            </div>
        `;
    cardContainer.appendChild(cardDiv);
  });
}

function getAgeRatingClass(rating) {
  const classes = {
    P: "ultra-badge-2d",
    K: "ultra-badge-3d",
    T13: "ultra-badge-imax",
    T16: "ultra-badge-4dx",
    T18: "ultra-badge-vip",
  };
  return classes[rating] || "ultra-badge-premium";
}

function openAddModal() {
  document.getElementById("movieModalTitle").innerHTML =
    '<i class="fas fa-plus-circle me-3"></i>Thêm Phim Mới';
  document.getElementById("movieForm").reset();
  document.getElementById("movieId").value = "";
}

async function editMovie(id) {
  try {
    const movie = await PhimAPI.getMovie(id);
    document.getElementById("movieModalTitle").innerHTML =
      '<i class="fas fa-edit me-3"></i>Chỉnh Sửa Phim';
    document.getElementById("movieId").value = movie.MaPhim;
    document.getElementById("tenPhim").value = movie.TenPhim;
    document.getElementById("theLoai").value = movie.TheLoai;
    document.getElementById("daoDien").value = movie.DaoDien;
    document.getElementById("thoiLuong").value = movie.ThoiLuong;
    document.getElementById("ngayKhoiChieu").value = movie.NgayKhoiChieu;
    document.getElementById("doTuoiChoPhep").value = movie.DoTuoiChoPhep;

    new bootstrap.Modal(document.getElementById("movieModal")).show();
  } catch (error) {
    showAlert("Lỗi khi tải thông tin phim: " + error.message, "danger");
  }
}

async function saveMovie() {
  const form = document.getElementById("movieForm");
  if (!form.checkValidity()) {
    form.reportValidity();
    return;
  }

  const movieData = {
    TenPhim: document.getElementById("tenPhim").value,
    TheLoai: document.getElementById("theLoai").value,
    DaoDien: document.getElementById("daoDien").value,
    ThoiLuong: parseInt(document.getElementById("thoiLuong").value),
    NgayKhoiChieu: document.getElementById("ngayKhoiChieu").value,
    DoTuoiChoPhep: document.getElementById("doTuoiChoPhep").value,
  };

  try {
    const movieId = document.getElementById("movieId").value;
    if (movieId) {
      await PhimAPI.updateMovie(movieId, movieData);
      showAlert("Cập nhật phim thành công!", "success");
    } else {
      await PhimAPI.createMovie(movieData);
      showAlert("Thêm phim thành công!", "success");
    }

    bootstrap.Modal.getInstance(document.getElementById("movieModal")).hide();
    loadMovies();
  } catch (error) {
    showAlert("Lỗi khi lưu phim: " + error.message, "danger");
  }
}

async function deleteMovie(id) {
  if (confirm("Bạn có chắc chắn muốn xóa phim này?")) {
    try {
      await PhimAPI.deleteMovie(id);
      showAlert("Xóa phim thành công!", "success");
      loadMovies();
    } catch (error) {
      showAlert("Lỗi khi xóa phim: " + error.message, "danger");
    }
  }
}

// Initialize page when sidebar is loaded
document.addEventListener("sidebarLoaded", function () {
  loadMovies();

  // Setup event listeners
  const searchInput = document.getElementById("searchInput");
  const genreFilter = document.getElementById("genreFilter");

  if (searchInput) {
    searchInput.addEventListener("input", filterMovies);
  }
  if (genreFilter) {
    genreFilter.addEventListener("change", filterMovies);
  }
});

// Fallback: load movies if sidebar is already loaded
if (window.sidebarManager && window.sidebarManager.isLoaded()) {
  loadMovies();

  const searchInput = document.getElementById("searchInput");
  const genreFilter = document.getElementById("genreFilter");

  if (searchInput) {
    searchInput.addEventListener("input", filterMovies);
  }
  if (genreFilter) {
    genreFilter.addEventListener("change", filterMovies);
  }
}

// Fallback to load data if sidebar fails
window.addEventListener("load", function () {
  loadMovies();
});
