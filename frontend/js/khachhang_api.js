const API_BASE_URL = "http://127.0.0.1:5000/api";

// Customer API
class CustomerAPI {
  static getToken() {
    return localStorage.getItem("token");
  }

  static async getCustomers() {
    const token = this.getToken();
    if (!token) throw new Error("Vui lòng đăng nhập");
    try {
      const response = await fetch(`${API_BASE_URL}/khachhang/`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (!response.ok) {
        if (response.status === 401) {
          localStorage.removeItem("token");
          window.location.href = "/frontend/login.html";
        }
        throw new Error("Failed to fetch customers");
      }
      return await response.json();
    } catch (error) {
      console.error("Error fetching customers:", error);
      throw error;
    }
  }

  static async addCustomer(customerData) {
    const token = this.getToken();
    if (!token) throw new Error("No token found, please login");
    try {
      const response = await fetch(`${API_BASE_URL}/khachhang`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(customerData),
      });
      if (!response.ok) {
        if (response.status === 401) {
          localStorage.removeItem("token");
          window.location.href = "/frontend/login.html";
        }
        throw new Error("Failed to add customer");
      }
      return await response.json();
    } catch (error) {
      console.error("Error adding customer:", error);
      throw error;
    }
  }

  static async updateCustomer(customerId, customerData) {
    const token = this.getToken();
    if (!token) throw new Error("No token found, please login");
    try {
      const response = await fetch(`${API_BASE_URL}/khachhang/${customerId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(customerData),
      });
      if (!response.ok) {
        if (response.status === 401) {
          localStorage.removeItem("token");
          window.location.href = "/frontend/login.html";
        }
        throw new Error("Failed to update customer");
      }
      return await response.json();
    } catch (error) {
      console.error("Error updating customer:", error);
      throw error;
    }
  }

  static async deleteCustomer(customerId) {
    const token = this.getToken();
    if (!token) throw new Error("No token found, please login");
    try {
      const response = await fetch(`${API_BASE_URL}/khachhang/${customerId}`, {
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
        throw new Error("Failed to delete customer");
      }
      return await response.json();
    } catch (error) {
      console.error("Error deleting customer:", error);
      throw error;
    }
  }

  static async getCustomerById(customerId) {
    const token = this.getToken();
    if (!token) throw new Error("No token found, please login");
    try {
      const response = await fetch(`${API_BASE_URL}/khachhang/${customerId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (!response.ok) {
        if (response.status === 401) {
          localStorage.removeItem("token");
          window.location.href = "/frontend/login.html";
        }
        throw new Error("Không thể tải thông tin khách hàng");
      }
      return await response.json();
    } catch (error) {
      console.error("Error getCustomerById:", error);
      throw error;
    }
  }
}

// Global Variables for Customer
let currentView = "table";
let allCustomers = [];

function updateStats(customers) {
  animateNumber("totalCustomersCount", customers.length);
}

function showAlert(message, type) {
  console.log(`${type}: ${message}`);
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

  const filtered = allCustomers.filter(
    (c) =>
      c.TenKH.toLowerCase().includes(query) ||
      c.Email.toLowerCase().includes(query) ||
      c.SDT.toLowerCase().includes(query)
  );

  if (currentView === "table") {
    loadTableView(filtered);
  } else {
    loadCardView(filtered);
  }

  updateEmptyState(filtered.length);
}

window.openAddModal = function () {
  document.getElementById("customerModalTitle").innerHTML =
    '<i class="fas fa-plus-circle me-3"></i>Thêm Khách Hàng Mới';

  document.getElementById("customerId").value = "";
  document.getElementById("tenKhachHang").value = "";
  document.getElementById("email").value = "";
  document.getElementById("soDienThoai").value = "";
};

window.editCustomer = async function (id) {
  try {
    const customer = await CustomerAPI.getCustomerById(id);
    document.getElementById("customerModalTitle").innerHTML =
      '<i class="fas fa-edit me-3"></i>Chỉnh Sửa Khách Hàng';
    document.getElementById("customerId").value = customer.MaKH;
    document.getElementById("tenKhachHang").value = customer.TenKH;
    document.getElementById("email").value = customer.Email;
    document.getElementById("soDienThoai").value = customer.SDT;

    // Mở modal
    const modal = new bootstrap.Modal(document.getElementById("customerModal"));
    modal.show();
  } catch (error) {
    showAlert("Lỗi khi tải thông tin khách hàng: " + error.message, "danger");
  }
};

async function deleteCustomer(id) {
  if (!confirm("Bạn có chắc chắn muốn xóa khách hàng này không?")) return;

  try {
    await CustomerAPI.deleteCustomer(id);
    showAlert("Xóa khách hàng thành công", "success");
    await loadCustomers();
  } catch (error) {
    showAlert("Lỗi khi xóa khách hàng: " + error.message, "danger");
  }
}

window.saveCustomer = async function () {
  try {
    const customerId = document.getElementById("customerId").value;
    const tenKhachHang = document.getElementById("tenKhachHang").value;
    const email = document.getElementById("email").value;
    const soDienThoai = document.getElementById("soDienThoai").value;

    const customerData = {
      TenKH: tenKhachHang,
      Email: email,
      SDT: soDienThoai,
    };

    if (!tenKhachHang || !email || !soDienThoai) {
      showAlert("Vui lòng nhập đầy đủ thông tin khách hàng", "warning");
      return;
    }

    if (customerId) {
      await CustomerAPI.updateCustomer(customerId, customerData);
      showAlert("Cập nhật khách hàng thành công", "success");
    } else {
      await CustomerAPI.addCustomer(customerData);
      showAlert("Thêm khách hàng thành công", "success");
    }

    await loadCustomers();
    const modal = bootstrap.Modal.getInstance(
      document.getElementById("customerModal")
    );
    modal.hide();
  } catch (error) {
    showAlert("Lỗi khi lưu khách hàng: " + error.message, "danger");
  }
};

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
    loadTableView(allCustomers);
  } else {
    loadCardView(allCustomers);
  }
  updateEmptyState();
}

function openAddModal() {
  console.log("Open add modal");
}

// Load Customers
async function loadCustomers() {
  const token = localStorage.getItem("token");
  if (!token) {
    alert("Vui lòng đăng nhập!");
    window.location.href = "/frontend/login.html";
    return;
  }

  showLoading();
  try {
    const customers = await CustomerAPI.getCustomers();
    allCustomers = customers;
    updateStats(customers);
    if (currentView === "table") {
      loadTableView(customers);
    } else {
      loadCardView(customers);
    }
    updateEmptyState();
  } catch (error) {
    showAlert("Lỗi khi tạo danh sách khách hàng: " + error.message, "danger");
    if (error.message.includes("No token found")) {
      window.location.href = "/frontend/login.html";
    }
  } finally {
    hideLoading();
  }
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

function loadTableView(customers) {
  const tbody = document.getElementById("customersTableBody");
  if (!tbody) return;
  tbody.innerHTML = "";

  console.log("Render table with customers:", customers);
  customers.forEach((customer, index) => {
    const row = document.createElement("tr");
    row.className = "slide-in-right";
    row.style.animationDelay = `${index * 0.05}s`;

    row.innerHTML = `
            <td>
                <div>
                    <div style="font-weight: 700; color: white; margin-bottom: 4px;">${customer.MaKH}</div>
                </div>
            </td>
            <td>
                <div>
                    <div style="font-weight: 700; color: white; margin-bottom: 4px;">${customer.TenKH}</div>
                </div>
            </td>
            <td style="color: rgba(255, 255, 255, 0.8);">${customer.Email}</td>
            <td>
                <span style="font-weight: 600; color: white;">${customer.SDT}</span>
            </td>
            <td>
                <div class="d-flex gap-2">
                    <button class="ultra-btn ultra-btn-warning ultra-btn-sm" onclick="editCustomer(${customer.MaKH})" title="Chỉnh sửa">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="ultra-btn ultra-btn-danger ultra-btn-sm" onclick="deleteCustomer(${customer.MaKH})" title="Xóa">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </td>
        `;
    tbody.appendChild(row);
  });
}

function loadCardView(customers) {
  const cardContainer = document.getElementById("cardView");
  if (!cardContainer) return;
  cardContainer.innerHTML = "";

  customers.forEach((customer, index) => {
    const cardDiv = document.createElement("div");
    cardDiv.className = "ultra-item-card scale-in";
    cardDiv.style.animationDelay = `${index * 0.1}s`;

    cardDiv.innerHTML = `
      <div class="ultra-item-visual">
        <i class="fas fa-user-circle" style="font-size: 3rem; color: white;"></i>
      </div>
      
      <h3 class="ultra-item-title">${customer.TenKH}</h3>

      <div class="ultra-item-meta">
        <div class="ultra-item-meta-row">
          <span><i class="fas fa-envelope me-2"></i>Email</span>
          <span>${customer.Email}</span>
        </div>
        <div class="ultra-item-meta-row">
          <span><i class="fas fa-phone me-2"></i>Điện thoại</span>
          <span>${customer.SDT}</span>
        </div>
        <div class="ultra-item-meta-row">
          <span><i class="fas fa-id-card me-2"></i>Mã KH</span>
          <span>${customer.MaKH}</span>
        </div>
      </div>

      <div class="ultra-item-actions">
        <button class="ultra-btn ultra-btn-warning ultra-btn-sm flex-fill" onclick="editCustomer(${customer.MaKH})">
          <i class="fas fa-edit me-2"></i>Sửa
        </button>
        <button class="ultra-btn ultra-btn-danger ultra-btn-sm flex-fill" onclick="deleteCustomer(${customer.MaKH})">
          <i class="fas fa-trash me-2"></i>Xóa
        </button>
      </div>
    `;

    cardContainer.appendChild(cardDiv);
  });
}

document.addEventListener("DOMContentLoaded", function () {
  const searchInput = document.getElementById("searchInput");
  if (searchInput) {
    searchInput.addEventListener("input", handleSearch);
  }
  loadCustomers();
});
