// API Configuration
const API_BASE_URL = 'http://127.0.0.1:5000/api';

// API Helper Functions
class CinemaAPI {
    // Movies API
    static async getMovies() {
        try {
            const response = await fetch(`${API_BASE_URL}/phim/`);
            if (!response.ok) throw new Error('Failed to fetch movies');
            return await response.json();
        } catch (error) {
            console.error('Error fetching movies:', error);
            throw error;
        }
    }

    static async getMovie(id) {
        try {
            const response = await fetch(`${API_BASE_URL}/phim/${id}`);
            if (!response.ok) throw new Error('Failed to fetch movie');
            return await response.json();
        } catch (error) {
            console.error('Error fetching movie:', error);
            throw error;
        }
    }

    static async createMovie(movieData) {
        try {
            const response = await fetch(`${API_BASE_URL}/phim/`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(movieData)
            });
            if (!response.ok) throw new Error('Failed to create movie');
            return await response.json();
        } catch (error) {
            console.error('Error creating movie:', error);
            throw error;
        }
    }

    static async updateMovie(id, movieData) {
        try {
            const response = await fetch(`${API_BASE_URL}/phim/${id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(movieData)
            });
            if (!response.ok) throw new Error('Failed to update movie');
            return await response.json();
        } catch (error) {
            console.error('Error updating movie:', error);
            throw error;
        }
    }

    static async deleteMovie(id) {
        try {
            const response = await fetch(`${API_BASE_URL}/phim/${id}`, {
                method: 'DELETE'
            });
            if (!response.ok) throw new Error('Failed to delete movie');
            return await response.json();
        } catch (error) {
            console.error('Error deleting movie:', error);
            throw error;
        }
    }

    // Cinema Rooms API
    static async getCinemaRooms() {
        try {
            const response = await fetch(`${API_BASE_URL}/phongchieu/`);
            if (!response.ok) throw new Error('Failed to fetch cinema rooms');
            return await response.json();
        } catch (error) {
            console.error('Error fetching cinema rooms:', error);
            throw error;
        }
    }

    static async getCinemaRoom(id) {
        try {
            const response = await fetch(`${API_BASE_URL}/phongchieu/${id}`);
            if (!response.ok) throw new Error('Failed to fetch cinema room');
            return await response.json();
        } catch (error) {
            console.error('Error fetching cinema room:', error);
            throw error;
        }
    }

    static async createCinemaRoom(roomData) {
        try {
            const response = await fetch(`${API_BASE_URL}/phongchieu/`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(roomData)
            });
            if (!response.ok) throw new Error('Failed to create cinema room');
            return await response.json();
        } catch (error) {
            console.error('Error creating cinema room:', error);
            throw error;
        }
    }

    static async updateCinemaRoom(id, roomData) {
        try {
            const response = await fetch(`${API_BASE_URL}/phongchieu/${id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(roomData)
            });
            if (!response.ok) throw new Error('Failed to update cinema room');
            return await response.json();
        } catch (error) {
            console.error('Error updating cinema room:', error);
            throw error;
        }
    }

    static async deleteCinemaRoom(id) {
        try {
            const response = await fetch(`${API_BASE_URL}/phongchieu/${id}`, {
                method: 'DELETE'
            });
            if (!response.ok) throw new Error('Failed to delete cinema room');
            return await response.json();
        } catch (error) {
            console.error('Error deleting cinema room:', error);
            throw error;
        }
    }
}

// Utility Functions
function showAlert(message, type = 'success') {
    const alertDiv = document.createElement('div');
    alertDiv.className = `alert alert-${type} alert-dismissible fade show`;
    alertDiv.innerHTML = `
        ${message}
        <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
    `;
    
    const container = document.querySelector('.main-content');
    container.insertBefore(alertDiv, container.firstChild);
    
    // Auto dismiss after 3 seconds
    setTimeout(() => {
        alertDiv.remove();
    }, 3000);
}

function formatDate(dateString) {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN');
}


let allMovies = [];
let filteredMovies = [];
let currentView = 'table';


// function filterMovies() {
// }
// // Search and filter functionality
// document.getElementById('searchInput').addEventListener('input', filterMovies);
// document.getElementById('genreFilter').addEventListener('change', filterMovies);

function filterMovies() {
    const searchTerm = document.getElementById('searchInput').value.toLowerCase();
    const genreFilter = document.getElementById('genreFilter').value;

    filteredMovies = allMovies.filter(movie => {
        const matchesSearch = movie.TenPhim.toLowerCase().includes(searchTerm) ||
                            movie.TheLoai.toLowerCase().includes(searchTerm) ||
                            movie.DaoDien.toLowerCase().includes(searchTerm);
        
        const matchesGenre = !genreFilter || movie.TheLoai.includes(genreFilter);
        
        return matchesSearch && matchesGenre;
    });

    if (currentView === 'table') {
        loadTableView(filteredMovies);
    } else {
        loadCardView(filteredMovies);
    }

    updateEmptyState();
}

function updateEmptyState() {
    const emptyState = document.getElementById('emptyState');
    const tableView = document.getElementById('tableView');
    const cardView = document.getElementById('cardView');

    if (filteredMovies.length === 0) {
        emptyState.style.display = 'block';
        tableView.style.display = 'none';
        cardView.style.display = 'none';
    } else {
        emptyState.style.display = 'none';
        if (currentView === 'table') {
            tableView.style.display = 'block';
            cardView.style.display = 'none';
        } else {
            tableView.style.display = 'none';
            cardView.style.display = 'grid';
        }
    }
}

function switchView(viewType) {
    currentView = viewType;
    const tableBtn = document.getElementById('tableViewBtn');
    const cardBtn = document.getElementById('cardViewBtn');

    if (viewType === 'table') {
        tableBtn.classList.add('active');
        cardBtn.classList.remove('active');
        loadTableView(filteredMovies);
    } else {
        cardBtn.classList.add('active');
        tableBtn.classList.remove('active');
        loadCardView(filteredMovies);
    }

    updateEmptyState();
}

function showLoading() {
    document.getElementById('loadingState').style.display = 'flex';
    document.getElementById('tableView').style.display = 'none';
    document.getElementById('cardView').style.display = 'none';
    document.getElementById('emptyState').style.display = 'none';
}

function hideLoading() {
    document.getElementById('loadingState').style.display = 'none';
}

async function loadMovies() {
    showLoading();
    try {
        const movies = await CinemaAPI.getMovies();
        allMovies = movies;
        filteredMovies = movies;
        
        updateStats(movies);
        
        if (currentView === 'table') {
            loadTableView(movies);
        } else {
            loadCardView(movies);
        }
        
        updateEmptyState();
    } catch (error) {
        showAlert('Lỗi khi tải danh sách phim: ' + error.message, 'danger');
    } finally {
        hideLoading();
    }
}

function updateStats(movies) {
    // Animate numbers
    animateNumber('totalMoviesCount', movies.length);
    
    // Calculate new movies this month
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    const newMovies = movies.filter(movie => {
        const releaseDate = new Date(movie.NgayKhoiChieu);
        return releaseDate.getMonth() === currentMonth && releaseDate.getFullYear() === currentYear;
    });
    animateNumber('newMoviesCount', newMovies.length);
    
    // Calculate average duration
    const avgDuration = movies.length > 0 ? 
        Math.round(movies.reduce((sum, movie) => sum + movie.ThoiLuong, 0) / movies.length) : 0;
    animateNumber('avgDuration', avgDuration);
    
    // Count unique genres
    const genres = new Set();
    movies.forEach(movie => {
        movie.TheLoai.split(',').forEach(genre => genres.add(genre.trim()));
    });
    animateNumber('genreCount', genres.size);
}

function animateNumber(elementId, targetValue) {
    const element = document.getElementById(elementId);
    const startValue = 0;
    const duration = 1000;
    const startTime = performance.now();

    function updateNumber(currentTime) {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);
        const currentValue = Math.floor(startValue + (targetValue - startValue) * progress);
        
        element.textContent = currentValue;
        
        if (progress < 1) {
            requestAnimationFrame(updateNumber);
        }
    }
    
    requestAnimationFrame(updateNumber);
}

function loadTableView(movies) {
    const tbody = document.getElementById('moviesTableBody');
    tbody.innerHTML = '';

    movies.forEach((movie, index) => {
        const row = document.createElement('tr');
        row.className = 'slide-in-right';
        row.style.animationDelay = `${index * 0.05}s`;
        
        row.innerHTML = `
            <td>
                <div class="ultra-item-visual" style="width: 80px; height: 60px; margin: 0;">
                    <i class="fas fa-film" style="font-size: 1.5rem; color: white;"></i>
                </div>
            </td>
            <td>
                <div>
                    <div style="font-weight: 700; color: white; margin-bottom: 4px;">${movie.TenPhim}</div>
                    <small style="color: rgba(255, 255, 255, 0.5);">ID: ${movie.MaPhim}</small>
                </div>
            </td>
            <td>
                <span class="ultra-badge ultra-badge-2d">
                    ${movie.TheLoai}
                </span>
            </td>
            <td style="color: rgba(255, 255, 255, 0.8);">${movie.DaoDien}</td>
            <td>
                <span style="font-weight: 600; color: white;">${movie.ThoiLuong}</span> phút
            </td>
            <td style="color: rgba(255, 255, 255, 0.8);">${formatDate(movie.NgayKhoiChieu)}</td>
            <td>
                <span class="ultra-badge ${getAgeRatingClass(movie.DoTuoiChoPhep)}">
                    ${movie.DoTuoiChoPhep}
                </span>
            </td>
            <td>
                <div class="d-flex gap-2">
                    <button class="ultra-btn ultra-btn-warning ultra-btn-sm" onclick="editMovie(${movie.MaPhim})" title="Chỉnh sửa">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="ultra-btn ultra-btn-danger ultra-btn-sm" onclick="deleteMovie(${movie.MaPhim})" title="Xóa">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </td>
        `;
        tbody.appendChild(row);
    });
}

function loadCardView(movies) {
    const cardContainer = document.getElementById('cardView');
    cardContainer.innerHTML = '';

    movies.forEach((movie, index) => {
        const cardDiv = document.createElement('div');
        cardDiv.className = 'ultra-item-card scale-in';
        cardDiv.style.animationDelay = `${index * 0.1}s`;
        
        cardDiv.innerHTML = `
            <div class="ultra-item-visual">
                <i class="fas fa-film" style="font-size: 3rem; color: white;"></i>
            </div>
            
            <h3 class="ultra-item-title">${movie.TenPhim}</h3>
            
            <div class="ultra-item-meta">
                <div class="ultra-item-meta-row">
                    <span><i class="fas fa-tags me-2"></i>Thể loại</span>
                    <span class="ultra-badge ultra-badge-2d">${movie.TheLoai}</span>
                </div>
                <div class="ultra-item-meta-row">
                    <span><i class="fas fa-user-tie me-2"></i>Đạo diễn</span>
                    <span>${movie.DaoDien}</span>
                </div>
                <div class="ultra-item-meta-row">
                    <span><i class="fas fa-clock me-2"></i>Thời lượng</span>
                    <span style="font-weight: 600; color: white;">${movie.ThoiLuong} phút</span>
                </div>
                <div class="ultra-item-meta-row">
                    <span><i class="fas fa-calendar me-2"></i>Khởi chiếu</span>
                    <span>${formatDate(movie.NgayKhoiChieu)}</span>
                </div>
                <div class="ultra-item-meta-row">
                    <span><i class="fas fa-users me-2"></i>Độ tuổi</span>
                    <span class="ultra-badge ${getAgeRatingClass(movie.DoTuoiChoPhep)}">${movie.DoTuoiChoPhep}</span>
                </div>
            </div>
            
            <div class="ultra-item-actions">
                <button class="ultra-btn ultra-btn-warning ultra-btn-sm flex-fill" onclick="editMovie(${movie.MaPhim})">
                    <i class="fas fa-edit me-2"></i>Sửa
                </button>
                <button class="ultra-btn ultra-btn-danger ultra-btn-sm flex-fill" onclick="deleteMovie(${movie.MaPhim})">
                    <i class="fas fa-trash me-2"></i>Xóa
                </button>
            </div>
        `;
        cardContainer.appendChild(cardDiv);
    });
}

function getAgeRatingClass(rating) {
    const classes = {
        'P': 'ultra-badge-2d',
        'K': 'ultra-badge-3d',
        'T13': 'ultra-badge-imax',
        'T16': 'ultra-badge-4dx',
        'T18': 'ultra-badge-vip'
    };
    return classes[rating] || 'ultra-badge-premium';
}

function openAddModal() {
    document.getElementById('movieModalTitle').innerHTML = '<i class="fas fa-plus-circle me-3"></i>Thêm Phim Mới';
    document.getElementById('movieForm').reset();
    document.getElementById('movieId').value = '';
}

async function editMovie(id) {
    try {
        const response = await fetch(`${API_BASE_URL}/phim/${id}`);
        const movie = await response.json();
        
        document.getElementById('movieModalTitle').innerHTML = '<i class="fas fa-edit me-3"></i>Chỉnh Sửa Phim';
        document.getElementById('movieId').value = movie.MaPhim;
        document.getElementById('tenPhim').value = movie.TenPhim;
        document.getElementById('theLoai').value = movie.TheLoai;
        document.getElementById('daoDien').value = movie.DaoDien;
        document.getElementById('thoiLuong').value = movie.ThoiLuong;
        document.getElementById('ngayKhoiChieu').value = movie.NgayKhoiChieu;
        document.getElementById('doTuoiChoPhep').value = movie.DoTuoiChoPhep;
        
        new bootstrap.Modal(document.getElementById('movieModal')).show();
    } catch (error) {
        showAlert('Lỗi khi tải thông tin phim: ' + error.message, 'danger');
    }
}

async function saveMovie() {
    const form = document.getElementById('movieForm');
    if (!form.checkValidity()) {
        form.reportValidity();
        return;
    }

    const movieData = {
        TenPhim: document.getElementById('tenPhim').value,
        TheLoai: document.getElementById('theLoai').value,
        DaoDien: document.getElementById('daoDien').value,
        ThoiLuong: parseInt(document.getElementById('thoiLuong').value),
        NgayKhoiChieu: document.getElementById('ngayKhoiChieu').value,
        DoTuoiChoPhep: document.getElementById('doTuoiChoPhep').value
    };

    try {
        const movieId = document.getElementById('movieId').value;
        if (movieId) {
            await CinemaAPI.updateMovie(movieId, movieData);
            showAlert('Cập nhật phim thành công!', 'success');
        } else {
            await CinemaAPI.createMovie(movieData);
            showAlert('Thêm phim thành công!', 'success');
        }
        
        bootstrap.Modal.getInstance(document.getElementById('movieModal')).hide();
        loadMovies();
    } catch (error) {
        showAlert('Lỗi khi lưu phim: ' + error.message, 'danger');
    }
}

async function deleteMovie(id) {
    if (confirm('Bạn có chắc chắn muốn xóa phim này?')) {
        try {
            await CinemaAPI.deleteMovie(id);
            showAlert('Xóa phim thành công!', 'success');
            loadMovies();
        } catch (error) {
            showAlert('Lỗi khi xóa phim: ' + error.message, 'danger');
        }
    }
}

// Initialize page when sidebar is loaded
document.addEventListener('sidebarLoaded', function() {
    loadMovies();
});

// Fallback: load movies if sidebar is already loaded
if (window.sidebarManager && window.sidebarManager.isLoaded()) {
    loadMovies();
}

// Search and filter functionality
document.getElementById('searchInput').addEventListener('input', filterRooms);
document.getElementById('roomTypeFilter').addEventListener('change', filterRooms);

function filterRooms() {
    const searchTerm = document.getElementById('searchInput').value.toLowerCase();
    const typeFilter = document.getElementById('roomTypeFilter').value;

    filteredRooms = allRooms.filter(room => {
        const matchesSearch = room.TenPhong.toLowerCase().includes(searchTerm) ||
                            room.LoaiPhong.toLowerCase().includes(searchTerm);
        
        const matchesType = !typeFilter || room.LoaiPhong === typeFilter;
        
        return matchesSearch && matchesType;
    });

    if (currentView === 'table') {
        loadTableView(filteredRooms);
    } else {
        loadCardView(filteredRooms);
    }

    updateEmptyState();
}

function updateEmptyState() {
    const emptyState = document.getElementById('emptyState');
    const tableView = document.getElementById('tableView');
    const cardView = document.getElementById('cardView');

    if (filteredRooms.length === 0) {
        emptyState.style.display = 'block';
        tableView.style.display = 'none';
        cardView.style.display = 'none';
    } else {
        emptyState.style.display = 'none';
        if (currentView === 'table') {
            tableView.style.display = 'block';
            cardView.style.display = 'none';
        } else {
            tableView.style.display = 'none';
            cardView.style.display = 'grid';
        }
    }
}

function switchView(viewType) {
    currentView = viewType;
    const tableBtn = document.getElementById('tableViewBtn');
    const cardBtn = document.getElementById('cardViewBtn');

    if (viewType === 'table') {
        tableBtn.classList.add('active');
        cardBtn.classList.remove('active');
        loadTableView(filteredRooms);
    } else {
        cardBtn.classList.add('active');
        tableBtn.classList.remove('active');
        loadCardView(filteredRooms);
    }

    updateEmptyState();
}
// let filteredRooms = allRooms.filter();
function showLoading() {
    document.getElementById('loadingState').style.display = 'flex';
    document.getElementById('tableView').style.display = 'none';
    document.getElementById('cardView').style.display = 'none';
    document.getElementById('emptyState').style.display = 'none';
}

function hideLoading() {
    document.getElementById('loadingState').style.display = 'none';
}

async function loadCinemaRooms() {
    showLoading();
    try {
        const rooms = await CinemaAPI.getCinemaRooms();
        allRooms = rooms;
        filteredRooms = rooms;
        
        updateStats(rooms);
        
        if (currentView === 'table') {
            loadTableView(rooms);
        } else {
            loadCardView(rooms);
        }
        
        updateEmptyState();
    } catch (error) {
        showAlert('Lỗi khi tải danh sách phòng chiếu: ' + error.message, 'danger');
    } finally {
        hideLoading();
    }
}

function updateStats(rooms) {
    // Animate numbers
    animateNumber('totalRoomsCount', rooms.length);
    
    const totalSeats = rooms.reduce((sum, room) => sum + room.SoGhe, 0);
    animateNumber('totalSeatsCount', totalSeats);
    
    const avgSeats = rooms.length > 0 ? Math.round(totalSeats / rooms.length) : 0;
    animateNumber('avgSeatsCount', avgSeats);
    
    const roomTypes = new Set(rooms.map(room => room.LoaiPhong));
    animateNumber('roomTypesCount', roomTypes.size);
}

function animateNumber(elementId, targetValue) {
    const element = document.getElementById(elementId);
    const startValue = 0;
    const duration = 1000;
    const startTime = performance.now();

    function updateNumber(currentTime) {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);
        const currentValue = Math.floor(startValue + (targetValue - startValue) * progress);
        
        element.textContent = currentValue;
        
        if (progress < 1) {
            requestAnimationFrame(updateNumber);
        }
    }
    
    requestAnimationFrame(updateNumber);
}

function loadTableView(rooms) {
    const tbody = document.getElementById('roomsTableBody');
    tbody.innerHTML = '';

    rooms.forEach((room, index) => {
        const row = document.createElement('tr');
        row.className = 'slide-in-right';
        row.style.animationDelay = `${index * 0.05}s`;
        
        row.innerHTML = `
            <td>
                <div class="ultra-item-visual" style="width: 80px; height: 60px; margin: 0; background: ${getRoomTypeGradient(room.LoaiPhong)};">
                    <i class="fas fa-door-open" style="font-size: 1.5rem; color: white;"></i>
                </div>
            </td>
            <td>
                <div>
                    <div style="font-weight: 700; color: white; margin-bottom: 4px;">${room.TenPhong}</div>
                    <small style="color: rgba(255, 255, 255, 0.5);">ID: ${room.MaPhong}</small>
                </div>
            </td>
            <td>
                <span class="ultra-badge ${getRoomTypeBadgeClass(room.LoaiPhong)}">
                    ${room.LoaiPhong}
                </span>
            </td>
            <td>
                <span style="font-weight: 600; color: white;">${room.SoGhe}</span> ghế
            </td>
            <td>
                <span class="ultra-badge ultra-badge-2d">
                    <i class="fas fa-check-circle me-1"></i>Hoạt động
                </span>
            </td>
            <td>
                <div class="d-flex gap-2">
                    <button class="ultra-btn ultra-btn-warning ultra-btn-sm" onclick="editRoom(${room.MaPhong})" title="Chỉnh sửa">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="ultra-btn ultra-btn-danger ultra-btn-sm" onclick="deleteRoom(${room.MaPhong})" title="Xóa">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </td>
        `;
        tbody.appendChild(row);
    });
}

function loadCardView(rooms) {
    const cardContainer = document.getElementById('cardView');
    cardContainer.innerHTML = '';

    rooms.forEach((room, index) => {
        const cardDiv = document.createElement('div');
        cardDiv.className = 'ultra-item-card scale-in';
        cardDiv.style.animationDelay = `${index * 0.1}s`;
        
        cardDiv.innerHTML = `
            <div class="ultra-item-visual" style="background: ${getRoomTypeGradient(room.LoaiPhong)};">
                <div style="text-align: center;">
                    <i class="fas fa-door-open" style="font-size: 3rem; color: white; margin-bottom: 1rem;"></i>
                    <div style="font-weight: 700; color: white; font-size: 1.2rem;">${room.LoaiPhong}</div>
                </div>
            </div>
            
            <h3 class="ultra-item-title">${room.TenPhong}</h3>
            
            <div class="ultra-item-meta">
                <div class="ultra-item-meta-row">
                    <span><i class="fas fa-cog me-2"></i>Loại phòng</span>
                    <span class="ultra-badge ${getRoomTypeBadgeClass(room.LoaiPhong)}">${room.LoaiPhong}</span>
                </div>
                <div class="ultra-item-meta-row">
                    <span><i class="fas fa-chair me-2"></i>Số ghế</span>
                    <span style="font-weight: 600; color: white;">${room.SoGhe} ghế</span>
                </div>
                <div class="ultra-item-meta-row">
                    <span><i class="fas fa-info-circle me-2"></i>Trạng thái</span>
                    <span class="ultra-badge ultra-badge-2d">
                        <i class="fas fa-check-circle me-1"></i>Hoạt động
                    </span>
                </div>
            </div>
            
            <div class="ultra-item-actions">
                <button class="ultra-btn ultra-btn-warning ultra-btn-sm flex-fill" onclick="editRoom(${room.MaPhong})">
                    <i class="fas fa-edit me-2"></i>Sửa
                </button>
                <button class="ultra-btn ultra-btn-danger ultra-btn-sm flex-fill" onclick="deleteRoom(${room.MaPhong})">
                    <i class="fas fa-trash me-2"></i>Xóa
                </button>
            </div>
        `;
        cardContainer.appendChild(cardDiv);
    });
}

function getRoomTypeBadgeClass(type) {
    const classes = {
        '2D': 'ultra-badge-2d',
        '3D': 'ultra-badge-3d',
        'IMAX': 'ultra-badge-imax',
        '4DX': 'ultra-badge-4dx',
        'VIP': 'ultra-badge-vip',
        'Premium': 'ultra-badge-premium'
    };
    return classes[type] || 'ultra-badge-2d';
}

function getRoomTypeGradient(type) {
    const gradients = {
        '2D': 'var(--primary-gradient)',
        '3D': 'var(--success-gradient)',
        'IMAX': 'var(--warning-gradient)',
        '4DX': 'var(--danger-gradient)',
        'VIP': 'var(--secondary-gradient)',
        'Premium': 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
    };
    return gradients[type] || gradients['2D'];
}

function openAddModal() {
    document.getElementById('roomModalTitle').innerHTML = '<i class="fas fa-plus-circle me-3"></i>Thêm Phòng Chiếu Mới';
    document.getElementById('roomForm').reset();
    document.getElementById('roomId').value = '';
}

async function editRoom(id) {
    try {
        const response = await fetch(`${API_BASE_URL}/phongchieu/${id}`);
        const room = await response.json();
        
        document.getElementById('roomModalTitle').innerHTML = '<i class="fas fa-edit me-3"></i>Chỉnh Sửa Phòng Chiếu';
        document.getElementById('roomId').value = room.MaPhong;
        document.getElementById('tenPhong').value = room.TenPhong;
        document.getElementById('soGhe').value = room.SoGhe;
        document.getElementById('loaiPhong').value = room.LoaiPhong;
        
        new bootstrap.Modal(document.getElementById('roomModal')).show();
    } catch (error) {
        showAlert('Lỗi khi tải thông tin phòng chiếu: ' + error.message, 'danger');
    }
}

async function saveRoom() {
    const form = document.getElementById('roomForm');
    if (!form.checkValidity()) {
        form.reportValidity();
        return;
    }

    const roomData = {
        TenPhong: document.getElementById('tenPhong').value,
        SoGhe: parseInt(document.getElementById('soGhe').value),
        LoaiPhong: document.getElementById('loaiPhong').value
    };

    try {
        const roomId = document.getElementById('roomId').value;
        if (roomId) {
            await CinemaAPI.updateCinemaRoom(roomId, roomData);
            showAlert('Cập nhật phòng chiếu thành công!', 'success');
        } else {
            await CinemaAPI.createCinemaRoom(roomData);
            showAlert('Thêm phòng chiếu thành công!', 'success');
        }
        
        bootstrap.Modal.getInstance(document.getElementById('roomModal')).hide();
        loadCinemaRooms();
    } catch (error) {
        showAlert('Lỗi khi lưu phòng chiếu: ' + error.message, 'danger');
    }
}

async function deleteRoom(id) {
    if (confirm('Bạn có chắc chắn muốn xóa phòng chiếu này?')) {
        try {
            await CinemaAPI.deleteCinemaRoom(id);
            showAlert('Xóa phòng chiếu thành công!', 'success');
            loadCinemaRooms();
        } catch (error) {
            showAlert('Lỗi khi xóa phòng chiếu: ' + error.message, 'danger');
        }
    }
}

// Initialize page when sidebar is loaded
document.addEventListener('sidebarLoaded', function() {
    loadCinemaRooms();
});

// Fallback: load data if sidebar is already loaded
if (window.sidebarManager && window.sidebarManager.isLoaded()) {
    loadCinemaRooms();
}
