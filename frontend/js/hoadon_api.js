const API_BASE_URL = 'http://127.0.0.1:5000/api';

// Hoadon API
class HoadonAPI {
    static async getHoadons() {
        try {
            console.log('Fetching hoadons from:', `${API_BASE_URL}/hoadon/`);
            const response = await fetch(`${API_BASE_URL}/hoadon/`);
            console.log('Hoadon API response:', response);
            if (!response.ok) throw new Error(`HTTP ${response.status}: Failed to fetch hoadons`);
            const data = await response.json();
            console.log('Hoadon API data:', data);
            return data;
        } catch (error) {
            console.error('Error fetching hoadons:', error);
            throw error;
        }
    }

    static async getHoadon(id) {
        try {
            const response = await fetch(`${API_BASE_URL}/hoadon/${id}`);
            if (!response.ok) throw new Error(`HTTP ${response.status}: Failed to fetch hoadon`);
            return await response.json();
        } catch (error) {
            console.error(`Error fetching hoadon ${id}:`, error);
            throw error;
        }
    }

    static async getCombos() {
        try {
            console.log('Fetching combos from:', `${API_BASE_URL}/combo/`);
            const response = await fetch(`${API_BASE_URL}/combo/`);
            if (!response.ok) throw new Error(`HTTP ${response.status}: Failed to fetch combos`);
            const data = await response.json();
            console.log('Combo API data:', data);
            return data;
        } catch (error) {
            console.error('Error fetching combos:', error);
            throw error;
        }
    }

    static async getCombo(id) {
        try {
            const response = await fetch(`${API_BASE_URL}/combo/${id}`);
            if (!response.ok) throw new Error(`HTTP ${response.status}: Failed to fetch combo`);
            return await response.json();
        } catch (error) {
            console.error(`Error fetching combo ${id}:`, error);
            throw error;
        }
    }

    static async createHoadon(hoadonData) {
    try {
        console.log('Creating hoadon with data:', hoadonData);
        const response = await fetch(`${API_BASE_URL}/hoadon/`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(hoadonData)
        });
        console.log('Hoadon API response:', response);
        if (!response.ok) {
            const errorData = await response.json();
            console.error('Server error response:', errorData);
            throw new Error(`HTTP ${response.status}: ${errorData.message || 'Failed to create hoadon'}`);
        }
        const data = await response.json();
        console.log('Created hoadon:', data);
        return data;
    } catch (error) {
        console.error('Error creating hoadon:', error);
        throw error;
    }
}

    static async updateHoadon(id, hoadonData) {
        try {
            console.log(`Updating hoadon ${id} with data:`, hoadonData);
            const response = await fetch(`${API_BASE_URL}/hoadon/${id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(hoadonData)
            });
            if (!response.ok) throw new Error(`HTTP ${response.status}: Failed to update hoadon`);
            const data = await response.json();
            console.log('Updated hoadon:', data);
            return data;
        } catch (error) {
            console.error(`Error updating hoadon ${id}:`, error);
            throw error;
        }
    }

    static async deleteHoadon(id) {
        try {
            console.log(`Deleting hoadon ${id}`);
            const response = await fetch(`${API_BASE_URL}/hoadon/${id}`, {
                method: 'DELETE'
            });
            if (!response.ok) throw new Error(`HTTP ${response.status}: Failed to delete hoadon`);
            const data = await response.json();
            console.log('Deleted hoadon:', data);
            return data;
        } catch (error) {
            console.error(`Error deleting hoadon ${id}:`, error);
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
    if (container) {
        container.insertBefore(alertDiv, container.firstChild);
        setTimeout(() => alertDiv.remove(), 3000);
    } else {
        console.warn('Main content container not found for alert');
    }
}

function formatPrice(price) {
    if (!price && price !== 0) return '0 ₫';
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
}

function formatDateTime(dateTime) {
    if (!dateTime) return 'N/A';
    try {
        return new Intl.DateTimeFormat('vi-VN', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit'
        }).format(new Date(dateTime));
    } catch {
        return 'N/A';
    }
}

// Global Variables
let currentView = 'table';
let allHoadons = [];
let filteredHoadons = [];
let combos = []; // Store combo data for display and price calculation

async function loadCombos() {
    try {
        combos = await HoadonAPI.getCombos();
        const comboSelect = document.getElementById('maCombo');
        if (comboSelect) {
            comboSelect.innerHTML = '<option value="">Chọn combo</option>';
            combos.forEach(combo => {
                const option = document.createElement('option');
                option.value = combo.MaCombo;
                option.textContent = combo.TenCombo;
                comboSelect.appendChild(option);
            });
        }
    } catch (error) {
        console.error('Error loading combos:', error);
        showAlert(`Lỗi khi tải danh sách combo: ${error.message}`, 'danger');
    }
}

function showLoading() {
    const loadingState = document.getElementById('loadingState');
    const tableView = document.getElementById('tableView');
    const cardView = document.getElementById('cardView');
    const emptyState = document.getElementById('emptyState');
    if (loadingState) loadingState.style.display = 'flex';
    if (tableView) tableView.style.display = 'none';
    if (cardView) cardView.style.display = 'none';
    if (emptyState) emptyState.style.display = 'none';
}

function hideLoading() {
    const loadingState = document.getElementById('loadingState');
    if (loadingState) loadingState.style.display = 'none';
}

function updateEmptyState() {
    const emptyState = document.getElementById('emptyState');
    const tableView = document.getElementById('tableView');
    const cardView = document.getElementById('cardView');
    console.log('Empty state check:', { filteredHoadonsLength: filteredHoadons.length, emptyState, tableView, cardView });
    if (filteredHoadons.length === 0 && emptyState && tableView && cardView) {
        emptyState.style.display = 'block';
        tableView.style.display = 'none';
        cardView.style.display = 'none';
    } else if (emptyState && tableView && cardView) {
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

// Hoadon Management Functions
async function loadHoadons() {
    showLoading();
    try {
        console.log('Fetching hoadons...');
        const hoadons = await HoadonAPI.getHoadons();
        console.log('Received hoadons:', hoadons);
        allHoadons = hoadons || [];
        filteredHoadons = hoadons || [];
        await loadCombos(); // Load combos for display
        updateHoadonStats(allHoadons);
        console.log('Rendering view, currentView:', currentView);
        if (currentView === 'table') {
            loadHoadonTableView(allHoadons);
        } else {
            loadHoadonCardView(allHoadons);
        }
        updateEmptyState();
    } catch (error) {
        console.error('Error loading hoadons:', error);
        showAlert(`Lỗi khi tải danh sách hóa đơn: ${error.message}`, 'danger');
    } finally {
        hideLoading();
    }
}

function updateHoadonStats(hoadons) {
    console.log('updateHoadonStats: Input hoadons:', hoadons);
    
    animateNumber('totalHoadonCount', hoadons.length);
    
    const validHoadons = hoadons.filter(hoadon => {
        const tongTien = typeof hoadon.TongTien === 'string' ? parseFloat(hoadon.TongTien) : hoadon.TongTien;
        const isValid = typeof tongTien === 'number' && !isNaN(tongTien) && tongTien !== null;
        console.log(`Hoadon ${hoadon.MaHoaDon}: TongTien = ${hoadon.TongTien}, Parsed = ${tongTien}, isValid = ${isValid}`);
        return isValid;
    });
    
    const totalRevenue = validHoadons.length > 0 
        ? validHoadons.reduce((sum, hoadon) => {
            const tongTien = typeof hoadon.TongTien === 'string' ? parseFloat(hoadon.TongTien) : hoadon.TongTien;
            return sum + tongTien;
        }, 0)
        : 0;
    animateNumber('totalRevenue', totalRevenue);
    
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const recentHoadons = hoadons.filter(hoadon => {
        if (!hoadon.NgayMua) return false;
        try {
            const ngayMua = new Date(hoadon.NgayMua);
            return ngayMua >= sevenDaysAgo;
        } catch {
            return false;
        }
    });
    animateNumber('recentHoadonCount', recentHoadons.length);
    
    console.log('Stats updated:', {
        totalHoadons: hoadons.length,
        totalRevenue,
        recentHoadonCount: recentHoadons.length
    });
}

function animateNumber(elementId, targetValue) {
    const element = document.getElementById(elementId);
    if (!element) {
        console.warn(`Element ${elementId} not found`);
        return;
    }
    const startValue = 0;
    const duration = 1000;
    const startTime = performance.now();

    function updateNumber(currentTime) {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);
        const currentValue = Math.floor(startValue + (targetValue - startValue) * progress);
        element.textContent = (elementId === 'totalRevenue') ? formatPrice(currentValue) : currentValue;
        if (progress < 1) {
            requestAnimationFrame(updateNumber);
        }
    }
    requestAnimationFrame(updateNumber);
}

function loadHoadonTableView(hoadons) {
    const tbody = document.getElementById('hoadonTableBody');
    if (!tbody) {
        console.error('Table body not found');
        return;
    }
    tbody.innerHTML = '';

    hoadons.forEach((hoadon, index) => {
        const combo = combos.find(c => c.MaCombo === hoadon.MaCombo);
        const comboName = combo ? combo.TenCombo : 'N/A';
        const row = document.createElement('tr');
        row.className = 'fade-in-up';
        row.style.animationDelay = `${index * 0.05}s`;
        row.innerHTML = `
            <td>
                <div class="ultra-hoadon-visual" style="width: 80px; height: 60px; margin: 0;">
                    <i class="fas fa-file-invoice-dollar" style="font-size: 1.5rem; color: white;"></i>
                </div>
            </td>
            <td>
                <div>
                    <div style="font-weight: 700; color: white; margin-bottom: 4px;">${hoadon.MaHoaDon}</div>
                    <small style="color: rgba(255, 255, 255, 0.5);">ID: ${hoadon.MaHoaDon}</small>
                </div>
            </td>
            <td>${hoadon.MaKH}</td>
            <td>${comboName}</td>
            <td>${hoadon.SoLuong}</td>
            <td>${formatDateTime(hoadon.NgayMua)}</td>
            <td>
                <span style="font-weight: 600; color: white;">${formatPrice(hoadon.TongTien)}</span>
            </td>
            <td>
                <div class="d-flex gap-2">
                    <button class="ultra-btn ultra-btn-warning ultra-btn-sm" onclick="editHoadon(${hoadon.MaHoaDon})" title="Chỉnh sửa">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="ultra-btn ultra-btn-danger ultra-btn-sm" onclick="deleteHoadon(${hoadon.MaHoaDon})" title="Xóa">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </td>
        `;
        tbody.appendChild(row);
    });
}

function loadHoadonCardView(hoadons) {
    const cardContainer = document.getElementById('cardView');
    if (!cardContainer) {
        console.error('Card container not found');
        return;
    }
    cardContainer.innerHTML = '';

    hoadons.forEach((hoadon, index) => {
        const combo = combos.find(c => c.MaCombo === hoadon.MaCombo);
        const comboName = combo ? combo.TenCombo : 'N/A';
        const cardDiv = document.createElement('div');
        cardDiv.className = 'ultra-item-card fade-in-up';
        cardDiv.style.animationDelay = `${index * 0.1}s`;
        cardDiv.innerHTML = `
            <div class="ultra-hoadon-visual">
                <i class="fas fa-file-invoice-dollar" style="font-size: 3rem; color: white;"></i>
            </div>
            <h3 class="ultra-item-title">Hóa Đơn #${hoadon.MaHoaDon}</h3>
            <div class="ultra-item-meta">
                <div class="ultra-item-meta-row">
                    <span><i class="fas fa-user me-2"></i>Mã Khách Hàng</span Platforms
                    <span>${hoadon.MaKH}</span>
                </div>
                <div class="ultra-item-meta-row">
                    <span><i class="fas fa-box me-2"></i>Combo</span>
                    <span>${comboName}</span>
                </div>
                <div class="ultra-item-meta-row">
                    <span><i class="fas fa-cubes me-2"></i>Số Lượng</span>
                    <span>${hoadon.SoLuong}</span>
                </div>
                <div class="ultra-item-meta-row">
                    <span><i class="fas fa-calendar me-2"></i>Ngày Mua</span>
                    <span>${formatDateTime(hoadon.NgayMua)}</span>
                </div>
                <div class="ultra-item-meta-row">
                    <span><i class="fas fa-money-bill me-2"></i>Tổng Tiền</span>
                    <span style="font-weight: 600; color: white;">${formatPrice(hoadon.TongTien)}</span>
                </div>
            </div>
            <div class="ultra-item-actions">
                <button class="ultra-btn ultra-btn-warning ultra-btn-sm flex-fill" onclick="editHoadon(${hoadon.MaHoaDon})">
                    <i class="fas fa-edit me-2"></i>Sửa
                </button>
                <button class="ultra-btn ultra-btn-danger ultra-btn-sm flex-fill" onclick="deleteHoadon(${hoadon.MaHoaDon})">
                    <i class="fas fa-trash me-2"></i>Xóa
                </button>
            </div>
        `;
        cardContainer.appendChild(cardDiv);
    });
}

function filterHoadons() {
    const searchTerm = document.getElementById('searchInput')?.value.toLowerCase() || '';
    console.log('Filtering hoadons with:', { searchTerm });

    filteredHoadons = allHoadons.filter(hoadon => {
        const combo = combos.find(c => c.MaCombo === hoadon.MaCombo);
        const comboName = combo ? combo.TenCombo.toLowerCase() : '';
        const matchesSearch = 
            hoadon.MaHoaDon.toString().includes(searchTerm) ||
            hoadon.MaKH.toString().includes(searchTerm) ||
            comboName.includes(searchTerm);
        return matchesSearch;
    });
    console.log('Filtered hoadons:', filteredHoadons);

    if (currentView === 'table') {
        loadHoadonTableView(filteredHoadons);
    } else {
        loadHoadonCardView(filteredHoadons);
    }
    updateEmptyState();
}

function switchView(viewType) {
    currentView = viewType;
    const tableBtn = document.getElementById('tableViewBtn');
    const cardBtn = document.getElementById('cardViewBtn');

    if (tableBtn && cardBtn) {
        if (viewType === 'table') {
            tableBtn.classList.add('active');
            cardBtn.classList.remove('active');
        } else {
            cardBtn.classList.add('active');
            tableBtn.classList.remove('active');
        }
    }

    if (currentView === 'table') {
        loadHoadonTableView(filteredHoadons);
    } else {
        loadHoadonCardView(filteredHoadons);
    }
    updateEmptyState();
}

async function getComboPrice(comboId) {
    try {
        const combo = combos.find(c => c.MaCombo === parseInt(comboId)) || await HoadonAPI.getCombo(comboId);
        return combo.GiaCombo || 0;
    } catch (error) {
        console.error(`Error fetching combo price for ID ${comboId}:`, error);
        showAlert(`Không thể lấy giá combo: ${error.message}`, 'danger');
        return 0;
    }
}

async function updateTotalPrice() {
    const maCombo = document.getElementById('maCombo').value;
    const soLuong = parseInt(document.getElementById('soLuong').value) || 1;
    const tongTienInput = document.getElementById('tongTien');
    if (maCombo) {
        const giaCombo = await getComboPrice(maCombo);
        const tongTien = giaCombo * soLuong;
        tongTienInput.value = tongTien;
    } else {
        tongTienInput.value = '';
    }
}

async function openHoadonModal() {
    try {
        console.log('Opening hoadon modal...');
        const modalTitle = document.getElementById('modalTitle');
        const form = document.getElementById('hoadonForm');
        if (!modalTitle || !form) throw new Error('Modal elements not found');
        modalTitle.innerHTML = '<i class="fas fa-plus-circle me-3"></i>Thêm Hóa Đơn Mới';
        form.reset();
        document.getElementById('hoadonId').value = '';
        document.getElementById('tongTien').value = '';
        await loadCombos();
        const modal = new bootstrap.Modal(document.getElementById('hoadonModal'), { keyboard: false });
        modal.show();
        document.getElementById('maCombo').addEventListener('change', updateTotalPrice);
        document.getElementById('soLuong').addEventListener('input', updateTotalPrice);
    } catch (error) {
        console.error('Error opening hoadon modal:', error);
        showAlert(`Lỗi khi mở modal: ${error.message}`, 'danger');
    }
}

function openAddComboModal() {
    console.log('openAddComboModal called, redirecting to openHoadonModal');
    openHoadonModal();
}

function closeHoadonModal() {
    try {
        const modalElement = document.getElementById('hoadonModal');
        if (!modalElement) throw new Error('Modal element not found');
        
        const modal = bootstrap.Modal.getInstance(modalElement) || bootstrap.Modal.getOrCreateInstance(modalElement);
        modal.hide();
        
        // Xóa tất cả backdrop
        const backdrops = document.querySelectorAll('.modal-backdrop');
        backdrops.forEach(backdrop => backdrop.remove());
        
        // Khôi phục trạng thái body
        document.body.classList.remove('modal-open');
        document.body.style.overflow = 'auto';
        document.body.style.paddingRight = '';
        
        // Xóa event listeners
        const maCombo = document.getElementById('maCombo');
        const soLuong = document.getElementById('soLuong');
        if (maCombo) maCombo.removeEventListener('change', updateTotalPrice);
        if (soLuong) soLuong.removeEventListener('input', updateTotalPrice);
    } catch (error) {
        console.error('Error closing hoadon modal:', error);
        showAlert(`Lỗi khi đóng modal: ${error.message}`, 'danger');
    }
}

async function editHoadon(id) {
    try {
        console.log(`Editing hoadon ${id}`);
        const hoadon = await HoadonAPI.getHoadon(id);
        const modalTitle = document.getElementById('modalTitle');
        const form = document.getElementById('hoadonForm');
        if (!modalTitle || !form) throw new Error('Modal elements not found');
        modalTitle.innerHTML = '<i class="fas fa-edit me-3"></i>Chỉnh Sửa Hóa Đơn';
        await loadCombos();
        document.getElementById('maKH').value = hoadon.MaKH || '';
        document.getElementById('maCombo').value = hoadon.MaCombo || '';
        document.getElementById('soLuong').value = hoadon.SoLuong || 1;
        document.getElementById('ngayMua').value = hoadon.NgayMua ? hoadon.NgayMua.split('T')[0] : '';
        document.getElementById('tongTien').value = hoadon.TongTien || '';
        document.getElementById('hoadonId').value = hoadon.MaHoaDon;
        await updateTotalPrice(); // Cập nhật lại tổng tiền để đảm bảo chính xác
        const modal = new bootstrap.Modal(document.getElementById('hoadonModal'), { keyboard: false });
        modal.show();
        // Thêm lại event listeners
        const maCombo = document.getElementById('maCombo');
        const soLuong = document.getElementById('soLuong');
        maCombo.removeEventListener('change', updateTotalPrice); // Xóa listener cũ để tránh trùng lặp
        soLuong.removeEventListener('input', updateTotalPrice);
        maCombo.addEventListener('change', updateTotalPrice);
        soLuong.addEventListener('input', updateTotalPrice);
    } catch (error) {
        console.error('Error editing hoadon:', error);
        showAlert(`Lỗi khi tải thông tin hóa đơn: ${error.message}`, 'danger');
    }
}

async function saveHoadon() {
    const form = document.getElementById('hoadonForm');
    if (!form.checkValidity()) {
        form.reportValidity();
        return;
    }

    const ngayMuaInput = document.getElementById('ngayMua').value;
    const ngayMua = ngayMuaInput ? `${ngayMuaInput} 00:00:00` : null;
    const tongTien = parseFloat(document.getElementById('tongTien').value) || 0; // Lấy giá trị tổng tiền

    const hoadonData = {
        MaKH: parseInt(document.getElementById('maKH').value) || null,
        MaCombo: document.getElementById('maCombo').value ? parseInt(document.getElementById('maCombo').value) : null,
        SoLuong: parseInt(document.getElementById('soLuong').value) || 1,
        NgayMua: ngayMua,
        TongTien: tongTien // Thêm trường TongTien vào dữ liệu gửi đi
    };

    try {
        const hoadonId = document.getElementById('hoadonId').value;
        if (hoadonId) {
            await HoadonAPI.updateHoadon(hoadonId, hoadonData);
            showAlert('Cập nhật hóa đơn thành công!', 'success');
        } else {
            await HoadonAPI.createHoadon(hoadonData);
            showAlert('Thêm hóa đơn thành công!', 'success');
        }
        const modal = bootstrap.Modal.getInstance(document.getElementById('hoadonModal'));
        modal.hide();
        loadHoadons();
    } catch (error) {
        console.error('Error saving hoadon:', error);
        showAlert(`Lỗi khi lưu hóa đơn: ${error.message}`, 'danger');
    }
}

async function deleteHoadon(id) {
    if (confirm('Bạn có chắc chắn muốn xóa hóa đơn này?')) {
        try {
            await HoadonAPI.deleteHoadon(id);
            showAlert('Xóa hóa đơn thành công!', 'success');
            loadHoadons();
        } catch (error) {
            console.error('Error deleting hoadon:', error);
            showAlert(`Lỗi khi xóa hóa đơn: ${error.message}`, 'danger');
        }
    }
}

// Initialize hoadon page
function initializeHoadons() {
    console.log('Initializing hoadons...');
    loadHoadons();
    const searchInput = document.getElementById('searchInput');
    if (searchInput) {
        searchInput.addEventListener('input', filterHoadons);
    }
}

let isInitialized = false;
document.addEventListener('sidebarLoaded', function() {
    if (!isInitialized) {
        console.log('Sidebar loaded, initializing hoadons');
        isInitialized = true;
        initializeHoadons();
    }
});

if (window.sidebarManager && window.sidebarManager.isLoaded() && !isInitialized) {
    console.log('Sidebar already loaded, initializing hoadons');
    isInitialized = true;
    initializeHoadons();
}

window.addEventListener('load', function() {
    if (!isInitialized) {
        console.log('Fallback: Initializing hoadons');
        isInitialized = true;
        initializeHoadons();
    }
});