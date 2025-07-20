const API_BASE_URL = 'http://127.0.0.1:5000/api';

// Combo API
class ComboAPI {
    static async getCombos() {
        try {
            const response = await fetch(`${API_BASE_URL}/combo/`);
            console.log('Combo API response:', response);
            if (!response.ok) throw new Error('Failed to fetch combos');
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
            if (!response.ok) throw new Error('Failed to fetch combo');
            return await response.json();
        } catch (error) {
            console.error('Error fetching combo:', error);
            throw error;
        }
    }

    static async createCombo(comboData) {
        try {
            const response = await fetch(`${API_BASE_URL}/combo/`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(comboData)
            });
            if (!response.ok) throw new Error('Failed to create combo');
            return await response.json();
        } catch (error) {
            console.error('Error creating combo:', error);
            throw error;
        }
    }

    static async updateCombo(id, comboData) {
        try {
            const response = await fetch(`${API_BASE_URL}/combo/${id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(comboData)
            });
            if (!response.ok) throw new Error('Failed to update combo');
            return await response.json();
        } catch (error) {
            console.error('Error updating combo:', error);
            throw error;
        }
    }

    static async deleteCombo(id) {
        try {
            const response = await fetch(`${API_BASE_URL}/combo/${id}`, {
                method: 'DELETE'
            });
            if (!response.ok) throw new Error('Failed to delete combo');
            return await response.json();
        } catch (error) {
            console.error('Error deleting combo:', error);
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
        setTimeout(() => {
            alertDiv.remove();
        }, 3000);
    }
}

function formatPrice(price) {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
}

// Global Variables
let currentView = 'table';
let allCombos = [];
let filteredCombos = [];

function showLoading() {
    const loadingState = document.getElementById('loadingState');
    if (loadingState) loadingState.style.display = 'flex';
    const tableView = document.getElementById('tableView');
    if (tableView) tableView.style.display = 'none';
    const cardView = document.getElementById('cardView');
    if (cardView) cardView.style.display = 'none';
    const emptyState = document.getElementById('emptyState');
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

    if (filteredCombos.length === 0 && emptyState && tableView && cardView) {
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

// Combo Management Functions
async function loadCombos() {
    showLoading();
    try {
        const combos = await ComboAPI.getCombos();
        console.log('Combos loaded:', combos);
        allCombos = combos;
        filteredCombos = combos;
        updateComboStats(combos);
        if (currentView === 'table') {
            loadComboTableView(combos);
        } else {
            loadComboCardView(combos);
        }
        updateEmptyState();
    } catch (error) {
        showAlert('Lỗi khi tải danh sách combo: ' + error.message, 'danger');
    } finally {
        hideLoading();
    }
}

function updateComboStats(combos) {
    console.log('updateComboStats: Input combos:', combos); // Debug log
    
    animateNumber('totalCombosCount', combos.length);
    
    const validCombos = combos.filter(combo => {
        const giaCombo = typeof combo.GiaCombo === 'string' ? parseFloat(combo.GiaCombo) : combo.GiaCombo;
        const isValid = typeof giaCombo === 'number' && !isNaN(giaCombo) && giaCombo !== null;
        console.log(`Combo ${combo.TenCombo}: GiaCombo = ${combo.GiaCombo}, Parsed GiaCombo = ${giaCombo}, isValid = ${isValid}`); // Debug chi tiết
        return isValid;
    });
    
    console.log('Valid combos for avgPrice:', validCombos); 
    
    const avgPrice = validCombos.length > 0 
        ? Math.round(validCombos.reduce((sum, combo) => {
            const giaCombo = typeof combo.GiaCombo === 'string' ? parseFloat(combo.GiaCombo) : combo.GiaCombo;
            return sum + giaCombo;
        }, 0) / validCombos.length)
        : 0;
    console.log('Calculated avgPrice:', avgPrice);
    
    animateNumber('avgPrice', avgPrice);
    const comboTypes = new Set(combos.map(combo => combo.MoTa ? combo.MoTa.split(',')[0] : 'Không xác định'));
    animateNumber('comboTypesCount', comboTypes.size);
    
    console.log('Stats updated:', {
        totalCombos: combos.length,
        avgPrice,
        comboTypesCount: comboTypes.size
    });
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
        const currentValue = Math.floor(startValue + (targetValue - startValue) * progress);
        element.textContent = elementId === 'avgPrice' ? formatPrice(currentValue) : currentValue;
        if (progress < 1) {
            requestAnimationFrame(updateNumber);
        }
    }
    requestAnimationFrame(updateNumber);
}

function loadComboTableView(combos) {
    const tbody = document.getElementById('combosTableBody');
    if (!tbody) return;
    tbody.innerHTML = '';

    combos.forEach((combo, index) => {
        const row = document.createElement('tr');
        row.className = 'slide-in-right';
        row.style.animationDelay = `${index * 0.05}s`;
        row.innerHTML = `
            <td>
                <div class="ultra-combo-visual" style="width: 80px; height: 60px; margin: 0;">
                    <i class="fas fa-utensils" style="font-size: 1.5rem; color: white;"></i>
                </div>
            </td>
            <td>
                <div>
                    <div style="font-weight: 700; color: white; margin-bottom: 4px;">${combo.TenCombo}</div>
                    <small style="color: rgba(255, 255, 255, 0.5);">ID: ${combo.MaCombo}</small>
                </div>
            </td>
            <td>
                <span style="font-weight: 600; color: white;">${formatPrice(combo.GiaCombo)}</span>
            </td>
            <td style="color: rgba(255, 255, 255, 0.8);">${combo.MoTa || 'Không có mô tả'}</td>
            <td>
                <div class="d-flex gap-2">
                    <button class="ultra-btn ultra-btn-warning ultra-btn-sm" onclick="editCombo(${combo.MaCombo})" title="Chỉnh sửa">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="ultra-btn ultra-btn-danger ultra-btn-sm" onclick="deleteCombo(${combo.MaCombo})" title="Xóa">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </td>
        `;
        tbody.appendChild(row);
    });
}

function loadComboCardView(combos) {
    const cardContainer = document.getElementById('cardView');
    if (!cardContainer) return;
    cardContainer.innerHTML = '';

    combos.forEach((combo, index) => {
        const cardDiv = document.createElement('div');
        cardDiv.className = 'ultra-item-card scale-in';
        cardDiv.style.animationDelay = `${index * 0.1}s`;
        cardDiv.innerHTML = `
            <div class="ultra-combo-visual">
                <i class="fas fa-utensils" style="font-size: 3rem; color: white;"></i>
            </div>
            <h3 class="ultra-item-title">${combo.TenCombo}</h3>
            <div class="ultra-item-meta">
                <div class="ultra-item-meta-row">
                    <span><i class="fas fa-money-bill me-2"></i>Giá</span>
                    <span style="font-weight: 600; color: white;">${formatPrice(combo.GiaCombo)}</span>
                </div>
                <div class="ultra-item-meta-row">
                    <span><i class="fas fa-info-circle me-2"></i>Mô tả</span>
                    <span>${combo.MoTa || 'Không có mô tả'}</span>
                </div>
            </div>
            <div class="ultra-item-actions">
                <button class="ultra-btn ultra-btn-warning ultra-btn-sm flex-fill" onclick="editCombo(${combo.MaCombo})">
                    <i class="fas fa-edit me-2"></i>Sửa
                </button>
                <button class="ultra-btn ultra-btn-danger ultra-btn-sm flex-fill" onclick="deleteCombo(${combo.MaCombo})">
                    <i class="fas fa-trash me-2"></i>Xóa
                </button>
            </div>
        `;
        cardContainer.appendChild(cardDiv);
    });
}

function filterCombos() {
    const searchTerm = document.getElementById('searchInput')?.value.toLowerCase() || '';
    console.log('Filtering combos with:', { searchTerm });

    filteredCombos = allCombos.filter(combo => {
        const matchesSearch = combo.TenCombo.toLowerCase().includes(searchTerm) ||
                            (combo.MoTa && combo.MoTa.toLowerCase().includes(searchTerm));
        return matchesSearch;
    });
    console.log('Filtered combos:', filteredCombos);

    if (currentView === 'table') {
        loadComboTableView(filteredCombos);
    } else {
        loadComboCardView(filteredCombos);
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
        loadComboTableView(filteredCombos);
    } else {
        loadComboCardView(filteredCombos);
    }
    updateEmptyState();
}

function openAddComboModal() {
    document.getElementById('comboModalTitle').innerHTML = '<i class="fas fa-plus-circle me-3"></i>Thêm Combo Mới';
    document.getElementById('comboForm').reset();
    document.getElementById('comboId').value = '';
}

async function editCombo(id) {
    try {
        const combo = await ComboAPI.getCombo(id);
        document.getElementById('comboModalTitle').innerHTML = '<i class="fas fa-edit me-3"></i>Chỉnh Sửa Combo';
        document.getElementById('comboId').value = combo.MaCombo;
        document.getElementById('tenCombo').value = combo.TenCombo;
        document.getElementById('giaCombo').value = combo.GiaCombo;
        document.getElementById('moTa').value = combo.MoTa || '';
        new bootstrap.Modal(document.getElementById('comboModal')).show();
    } catch (error) {
        showAlert('Lỗi khi tải thông tin combo: ' + error.message, 'danger');
    }
}

async function saveCombo() {
    const form = document.getElementById('comboForm');
    if (!form.checkValidity()) {
        form.reportValidity();
        return;
    }

    const comboData = {
        TenCombo: document.getElementById('tenCombo').value,
        GiaCombo: parseInt(document.getElementById('giaCombo').value),
        MoTa: document.getElementById('moTa').value || null
    };

    try {
        const comboId = document.getElementById('comboId').value;
        if (comboId) {
            await ComboAPI.updateCombo(comboId, comboData);
            showAlert('Cập nhật combo thành công!', 'success');
        } else {
            await ComboAPI.createCombo(comboData);
            showAlert('Thêm combo thành công!', 'success');
        }
        bootstrap.Modal.getInstance(document.getElementById('comboModal')).hide();
        loadCombos();
    } catch (error) {
        showAlert('Lỗi khi lưu combo: ' + error.message, 'danger');
    }
}

async function deleteCombo(id) {
    if (confirm('Bạn có chắc chắn muốn xóa combo này?')) {
        try {
            await ComboAPI.deleteCombo(id);
            showAlert('Xóa combo thành công!', 'success');
            loadCombos();
        } catch (error) {
            showAlert('Lỗi khi xóa combo: ' + error.message, 'danger');
        }
    }
}

// Initialize combo page
document.addEventListener('sidebarLoaded', function() {
    console.log('Sidebar loaded, initializing combos');
    loadCombos();
    document.getElementById('searchInput')?.addEventListener('input', filterCombos);
    document.getElementById('comboFilter')?.addEventListener('change', filterCombos);
});

if (window.sidebarManager && window.sidebarManager.isLoaded()) {
    console.log('Sidebar already loaded, initializing combos');
    loadCombos();
    document.getElementById('searchInput')?.addEventListener('input', filterCombos);
    document.getElementById('comboFilter')?.addEventListener('change', filterCombos);
}

// Fallback to load data if sidebar fails
window.addEventListener('load', function() {
    console.log('Fallback: Initializing combos');
    loadCombos();
});