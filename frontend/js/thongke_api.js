const API_BASE_URL = "http://127.0.0.1:5000/api";

class ThongKeAPI {
  /**
   * Thống kê doanh thu theo ngày
   * @param {string} from - Ngày bắt đầu (YYYY-MM-DD)
   * @param {string} to - Ngày kết thúc (YYYY-MM-DD)
   * @returns {Promise} Response object
   * Example response:
   * {
   *   "data": [
   *     {
   *       "DoanhThuCombo": "400000.00",
   *       "DoanhThuVe": "0.00",
   *       "Ngay": "Tue, 22 Jul 2025 00:00:00 GMT",
   *       "TongDoanhThu": "400000.00"
   *     }
   *   ],
   *   "message": "Thống kê doanh thu mỗi ngày thành công"
   * }
   */
  static async thongKeDoanhThuTheoNgay(from, to) {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(
        `${API_BASE_URL}/thongke/doanh-thu-ngay?from=${from}&to=${to}`,
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
      console.error("Error fetching doanh thu data:", error);
      throw error;
    }
  }

  /**
   * Thống kê doanh thu theo phim
   * @returns {Promise} Response object
   * Example response:
   * {
   *   "data": [
   *     {
   *       "DoanhThu": "150000.00",
   *       "MaPhim": 1,
   *       "SoVeBan": 2,
   *       "TenPhim": "Avengers: Endgame",
   *       "TheLoai": "Hành động"
   *     }
   *   ],
   *   "message": "Thống kê doanh thu theo phim thành công"
   * }
   */
  static async thongKeDoanhThuTheoPhim() {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${API_BASE_URL}/thongke/doanh-thu-phim`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error("Error fetching doanh thu theo phim data:", error);
      throw error;
    }
  }

  /**
   * Thống kê tỷ lệ lấp đầy suất chiếu
   * @param {number} maSuatChieu - Mã suất chiếu
   * @returns {Promise} Response object
   */
  static async thongKeTyLeLapDaySuatChieu(maSuatChieu) {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(
        `${API_BASE_URL}/thongke/ty-le-lap-day/${maSuatChieu}`,
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
      console.error("Error fetching tỷ lệ lấp đầy suất chiếu data:", error);
      throw error;
    }
  }

  /**
   * Lấy danh sách suất chiếu để hiển thị trong dropdown
   * @returns {Promise} Response object
   */
  static async getSuatChieuList() {
    const token = localStorage.getItem("token");
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

  /**
   * Helper method để format currency
   * @param {number} value - Giá trị số
   * @returns {string} Formatted currency string
   */
  static formatCurrency(value) {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(value);
  }

  /**
   * Helper method để format date
   * @param {string} dateString - Date string
   * @returns {string} Formatted date string
   */
  static formatDate(dateString) {
    return new Date(dateString).toLocaleDateString("vi-VN");
  }

  /**
   * Helper method để tính tổng doanh thu từ array data
   * @param {Array} data - Array of revenue data
   * @param {string} field - Field name to sum
   * @returns {number} Total sum
   */
  static calculateTotal(data, field) {
    return data.reduce((sum, item) => sum + parseFloat(item[field] || 0), 0);
  }
}

// Global chart instances
let revenueChart = null;
let movieRevenueChart = null;
let occupancyChart = null;
let revenueBreakdownChart = null;

// Global data storage
let revenueData = [];
let movieData = [];
let occupancyData = null;
let breakdownData = null;

// Initialize page
document.addEventListener("DOMContentLoaded", function () {
  // Kiểm tra token ngay khi trang tải
  const token = localStorage.getItem("token");
  if (!token) {
    alert("Vui lòng đăng nhập!");
    window.location.replace("login.html");
    return;
  }
  initializePage();
});

async function initializePage() {
  try {
    showLoading(true);

    // Set default dates (last 7 days)
    const today = new Date();
    const sevenDaysAgo = new Date(today);
    sevenDaysAgo.setDate(today.getDate() - 7);

    document.getElementById("fromDate").value = sevenDaysAgo
      .toISOString()
      .split("T")[0];
    document.getElementById("toDate").value = today.toISOString().split("T")[0];

    // Load initial data
    await Promise.all([
      loadRevenueChart(),
      loadMovieRevenueChart(),
      loadShowtimeOptions(),
      updateStatsCards(),
    ]);

    // Add event listeners for date inputs
    document.getElementById("fromDate").addEventListener("change", function () {
      // Auto update when from date changes
      setTimeout(updateRevenueChart, 500);
    });

    document.getElementById("toDate").addEventListener("change", function () {
      // Auto update when to date changes
      setTimeout(updateRevenueChart, 500);
    });

    showLoading(false);
  } catch (error) {
    console.error("Error initializing page:", error);
    showLoading(false);
    showEmptyState(true);
  }
}

async function loadRevenueChart() {
  try {
    const fromDate = document.getElementById("fromDate").value;
    const toDate = document.getElementById("toDate").value;

    console.log(`Loading revenue chart for period: ${fromDate} to ${toDate}`);

    const response = await ThongKeAPI.thongKeDoanhThuTheoNgay(fromDate, toDate);

    // Always create chart regardless of data availability
    revenueData = response.data || [];
    createRevenueChart(revenueData);
    createRevenueBreakdownChart(revenueData);
    loadRevenueTable(revenueData);

    console.log(`Loaded ${revenueData.length} revenue records`);

    if (revenueData.length === 0) {
      console.log(
        "No revenue data found for the selected period, showing empty chart"
      );
    }
  } catch (error) {
    console.error("Error loading revenue chart:", error);
    // Show error message to user
    alert("Không thể tải dữ liệu doanh thu. Vui lòng kiểm tra kết nối server.");

    // Create empty chart on error
    revenueData = [];
    createRevenueChart(revenueData);
    createRevenueBreakdownChart(revenueData);
    loadRevenueTable(revenueData);
  }
}

async function loadMovieRevenueChart() {
  try {
    const response = await ThongKeAPI.thongKeDoanhThuTheoPhim();

    if (response.data && response.data.length > 0) {
      movieData = response.data;
      createMovieRevenueChart(response.data);
      loadMovieTable(response.data);
    }
  } catch (error) {
    console.error("Error loading movie revenue chart:", error);
  }
}

async function loadShowtimeOptions() {
  try {
    // Load available showtimes using ThongKeAPI
    const response = await ThongKeAPI.getSuatChieuList();
    const showtimes = response || [];

    const select = document.getElementById("showtimeSelect");
    select.innerHTML = '<option value="">Chọn suất chiếu...</option>';

    showtimes.forEach((showtime) => {
      const option = document.createElement("option");
      option.value = showtime.MaSuatChieu;
      option.textContent = `${showtime.Phim?.TenPhim || "N/A"} - ${
        showtime.Phong?.TenPhong || "N/A"
      } (${new Date(showtime.NgayChieu).toLocaleDateString("vi-VN")})`;
      select.appendChild(option);
    });

    // Add event listener for showtime selection
    select.addEventListener("change", async function () {
      if (this.value) {
        await loadOccupancyChart(this.value);
      }
    });
  } catch (error) {
    console.error("Error loading showtime options:", error);
  }
}

async function loadOccupancyChart(maSuatChieu) {
  try {
    const response = await ThongKeAPI.thongKeTyLeLapDaySuatChieu(maSuatChieu);

    if (response.data) {
      occupancyData = response.data;
      createOccupancyChart(response.data);
      loadOccupancyTable(response.data);
    }
  } catch (error) {
    console.error("Error loading occupancy chart:", error);
  }
}

function createRevenueChart(data) {
  const ctx = document.getElementById("revenueChart").getContext("2d");

  // Destroy existing chart
  if (revenueChart) {
    revenueChart.destroy();
  }

  // Get date range from inputs
  const fromDate = new Date(document.getElementById("fromDate").value);
  const toDate = new Date(document.getElementById("toDate").value);

  // Generate all dates in range
  const allDates = [];
  const currentDate = new Date(fromDate);
  while (currentDate <= toDate) {
    allDates.push(new Date(currentDate));
    currentDate.setDate(currentDate.getDate() + 1);
  }

  // Create data map for existing data
  const dataMap = {};
  data.forEach((item) => {
    const dateKey = new Date(item.Ngay).toDateString();
    dataMap[dateKey] = {
      veRevenue: parseFloat(item.DoanhThuVe),
      comboRevenue: parseFloat(item.DoanhThuCombo),
      totalRevenue: parseFloat(item.TongDoanhThu),
    };
  });

  // Map all dates to data (fill missing dates with 0)
  const labels = allDates.map((date) => date.toLocaleDateString("vi-VN"));
  const totalRevenueData = allDates.map((date) => {
    const dateKey = date.toDateString();
    return dataMap[dateKey] ? dataMap[dateKey].totalRevenue : 0;
  });

  // Determine chart type based on data length
  const chartType = allDates.length <= 7 ? "bar" : "line";

  revenueChart = new Chart(ctx, {
    type: chartType,
    data: {
      labels: labels,
      datasets: [
        {
          label: "Tổng doanh thu",
          data: totalRevenueData,
          borderColor: "rgb(102, 126, 234)",
          backgroundColor: "rgba(102, 126, 234, 0.8)",
          tension: 0.4,
          fill: chartType === "line",
          borderWidth: chartType === "bar" ? 0 : 3,
          pointBackgroundColor: "rgb(102, 126, 234)",
          pointBorderColor: "white",
          pointBorderWidth: 2,
          pointRadius: chartType === "line" ? 5 : 0,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          labels: {
            color: "white",
          },
        },
        title: {
          display: true,
          text: `Tổng doanh thu ${
            allDates.length
          } ngày (${fromDate.toLocaleDateString(
            "vi-VN"
          )} - ${toDate.toLocaleDateString("vi-VN")})`,
          color: "white",
          font: {
            size: 16,
            weight: "bold",
          },
        },
        tooltip: {
          callbacks: {
            label: function (context) {
              const value = new Intl.NumberFormat("vi-VN", {
                style: "currency",
                currency: "VND",
              }).format(context.parsed.y);
              return `Tổng doanh thu: ${value}`;
            },
          },
        },
      },
      scales: {
        y: {
          beginAtZero: true,
          ticks: {
            color: "rgba(255, 255, 255, 0.7)",
            callback: function (value) {
              return new Intl.NumberFormat("vi-VN", {
                notation: "compact",
                style: "currency",
                currency: "VND",
              }).format(value);
            },
          },
          grid: {
            color: "rgba(255, 255, 255, 0.1)",
          },
        },
        x: {
          ticks: {
            color: "rgba(255, 255, 255, 0.7)",
            maxRotation: 45,
          },
          grid: {
            color: "rgba(255, 255, 255, 0.1)",
          },
        },
      },
    },
  });
}

function createMovieRevenueChart(data) {
  const ctx = document.getElementById("movieRevenueChart").getContext("2d");

  // Destroy existing chart
  if (movieRevenueChart) {
    movieRevenueChart.destroy();
  }

  const labels = data.map((item) => item.TenPhim);
  const revenues = data.map((item) => parseFloat(item.DoanhThu));

  movieRevenueChart = new Chart(ctx, {
    type: "doughnut",
    data: {
      labels: labels,
      datasets: [
        {
          data: revenues,
          backgroundColor: [
            "rgba(102, 126, 234, 0.8)",
            "rgba(240, 147, 251, 0.8)",
            "rgba(79, 172, 254, 0.8)",
            "rgba(67, 233, 123, 0.8)",
            "rgba(250, 112, 154, 0.8)",
          ],
          borderColor: [
            "rgb(102, 126, 234)",
            "rgb(240, 147, 251)",
            "rgb(79, 172, 254)",
            "rgb(67, 233, 123)",
            "rgb(250, 112, 154)",
          ],
          borderWidth: 2,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: "bottom",
          labels: {
            color: "white",
            padding: 20,
          },
        },
        tooltip: {
          callbacks: {
            label: function (context) {
              const label = context.label || "";
              const value = new Intl.NumberFormat("vi-VN", {
                style: "currency",
                currency: "VND",
              }).format(context.parsed);
              return `${label}: ${value}`;
            },
          },
        },
      },
    },
  });
}

function createOccupancyChart(data) {
  const ctx = document.getElementById("occupancyChart").getContext("2d");

  // Destroy existing chart
  if (occupancyChart) {
    occupancyChart.destroy();
  }

  const occupancyRate = parseFloat(data.TyLeLapDay);
  const emptyRate = 100 - occupancyRate;

  occupancyChart = new Chart(ctx, {
    type: "doughnut",
    data: {
      labels: ["Đã bán", "Còn trống"],
      datasets: [
        {
          data: [occupancyRate, emptyRate],
          backgroundColor: [
            "rgba(67, 233, 123, 0.8)",
            "rgba(255, 255, 255, 0.2)",
          ],
          borderColor: ["rgb(67, 233, 123)", "rgba(255, 255, 255, 0.5)"],
          borderWidth: 2,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: "bottom",
          labels: {
            color: "white",
            padding: 20,
          },
        },
        tooltip: {
          callbacks: {
            label: function (context) {
              return `${context.label}: ${context.parsed.toFixed(1)}%`;
            },
          },
        },
      },
    },
  });
}

function createRevenueBreakdownChart(data) {
  const ctx = document.getElementById("revenueBreakdownChart").getContext("2d");

  // Destroy existing chart
  if (revenueBreakdownChart) {
    revenueBreakdownChart.destroy();
  }

  const totalVeRevenue = data.reduce(
    (sum, item) => sum + parseFloat(item.DoanhThuVe),
    0
  );
  const totalComboRevenue = data.reduce(
    (sum, item) => sum + parseFloat(item.DoanhThuCombo),
    0
  );

  breakdownData = [
    { label: "Doanh thu vé", value: totalVeRevenue },
    { label: "Doanh thu combo", value: totalComboRevenue },
  ];

  revenueBreakdownChart = new Chart(ctx, {
    type: "pie",
    data: {
      labels: ["Doanh thu vé", "Doanh thu combo"],
      datasets: [
        {
          data: [totalVeRevenue, totalComboRevenue],
          backgroundColor: [
            "rgba(102, 126, 234, 0.8)",
            "rgba(240, 147, 251, 0.8)",
          ],
          borderColor: ["rgb(102, 126, 234)", "rgb(240, 147, 251)"],
          borderWidth: 2,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: "bottom",
          labels: {
            color: "white",
            padding: 20,
          },
        },
        tooltip: {
          callbacks: {
            label: function (context) {
              const label = context.label || "";
              const value = new Intl.NumberFormat("vi-VN", {
                style: "currency",
                currency: "VND",
              }).format(context.parsed);
              return `${label}: ${value}`;
            },
          },
        },
      },
    },
  });

  loadBreakdownTable(breakdownData);
}

// Tab switching functions
function switchRevenueView(view) {
  const chartView = document.getElementById("revenueChartView");
  const tableView = document.getElementById("revenueTableView");
  const chartBtn = document.getElementById("revenueChartBtn");
  const tableBtn = document.getElementById("revenueTableBtn");

  if (view === "chart") {
    chartView.style.display = "block";
    tableView.style.display = "none";
    chartBtn.classList.add("active");
    tableBtn.classList.remove("active");
  } else {
    chartView.style.display = "none";
    tableView.style.display = "block";
    chartBtn.classList.remove("active");
    tableBtn.classList.add("active");
  }
}

function switchMovieView(view) {
  const chartView = document.getElementById("movieChartView");
  const tableView = document.getElementById("movieTableView");
  const chartBtn = document.getElementById("movieChartBtn");
  const tableBtn = document.getElementById("movieTableBtn");

  if (view === "chart") {
    chartView.style.display = "block";
    tableView.style.display = "none";
    chartBtn.classList.add("active");
    tableBtn.classList.remove("active");
  } else {
    chartView.style.display = "none";
    tableView.style.display = "block";
    chartBtn.classList.remove("active");
    tableBtn.classList.add("active");
  }
}

function switchOccupancyView(view) {
  const chartView = document.getElementById("occupancyChartView");
  const tableView = document.getElementById("occupancyTableView");
  const chartBtn = document.getElementById("occupancyChartBtn");
  const tableBtn = document.getElementById("occupancyTableBtn");

  if (view === "chart") {
    chartView.style.display = "block";
    tableView.style.display = "none";
    chartBtn.classList.add("active");
    tableBtn.classList.remove("active");
  } else {
    chartView.style.display = "none";
    tableView.style.display = "block";
    chartBtn.classList.remove("active");
    tableBtn.classList.add("active");
  }
}

function switchBreakdownView(view) {
  const chartView = document.getElementById("breakdownChartView");
  const tableView = document.getElementById("breakdownTableView");
  const chartBtn = document.getElementById("breakdownChartBtn");
  const tableBtn = document.getElementById("breakdownTableBtn");

  if (view === "chart") {
    chartView.style.display = "block";
    tableView.style.display = "none";
    chartBtn.classList.add("active");
    tableBtn.classList.remove("active");
  } else {
    chartView.style.display = "none";
    tableView.style.display = "block";
    chartBtn.classList.remove("active");
    tableBtn.classList.add("active");
  }
}

// Table loading functions
function loadRevenueTable(data) {
  const tbody = document.getElementById("revenueTableBody");
  tbody.innerHTML = "";

  // Get date range from inputs to show all dates
  const fromDate = new Date(document.getElementById("fromDate").value);
  const toDate = new Date(document.getElementById("toDate").value);

  // Generate all dates in range
  const allDates = [];
  const currentDate = new Date(fromDate);
  while (currentDate <= toDate) {
    allDates.push(new Date(currentDate));
    currentDate.setDate(currentDate.getDate() + 1);
  }

  // Create data map for existing data
  const dataMap = {};
  data.forEach((item) => {
    const dateKey = new Date(item.Ngay).toDateString();
    dataMap[dateKey] = {
      veRevenue: parseFloat(item.DoanhThuVe),
      comboRevenue: parseFloat(item.DoanhThuCombo),
      totalRevenue: parseFloat(item.TongDoanhThu),
      tickets: parseInt(item.SoVeBan || 0), // Thêm số vé bán
    };
  });

  const totalRevenue = allDates.reduce((sum, date) => {
    const dateKey = date.toDateString();
    return sum + (dataMap[dateKey] ? dataMap[dateKey].totalRevenue : 0);
  }, 0);

  allDates.forEach((date, index) => {
    const row = document.createElement("tr");
    const dateKey = date.toDateString();

    if (!dataMap[dateKey]) {
      return; // Skip dates with no data
    }

    const dayData = dataMap[dateKey];

    const percentage =
      totalRevenue > 0
        ? ((dayData.totalRevenue / totalRevenue) * 100).toFixed(1)
        : 0;

    row.innerHTML = `
      <td style="color: white; font-weight: 600;">${date.toLocaleDateString(
        "vi-VN"
      )}</td>
      <td style="color: rgba(255, 255, 255, 0.8);">${dayData.veRevenue.toLocaleString(
        "vi-VN"
      )} VNĐ</td>
      <td style="color: rgba(255, 255, 255, 0.8);">${dayData.comboRevenue.toLocaleString(
        "vi-VN"
      )} VNĐ</td>
      <td style="color: white; font-weight: 600;">${dayData.totalRevenue.toLocaleString(
        "vi-VN"
      )} VNĐ</td>
      <td style="color: rgba(255, 255, 255, 0.8); text-align: center;">${
        dayData.tickets
      }</td>
      <td style="color: #48dbfb; text-align: center; font-weight: 600;">${percentage}%</td>
    `;

    // Highlight rows with no data
    if (dayData.totalRevenue === 0) {
      row.style.backgroundColor = "rgba(255, 255, 255, 0.02)";
    }

    row.className = "slide-in-right";
    row.style.animationDelay = `${index * 0.05}s`;
    tbody.appendChild(row);
  });

  // Add total row
  if (allDates.length > 1) {
    const totalRow = document.createElement("tr");
    const totalVeRevenue = Object.values(dataMap).reduce(
      (sum, item) => sum + item.veRevenue,
      0
    );
    const totalComboRevenue = Object.values(dataMap).reduce(
      (sum, item) => sum + item.comboRevenue,
      0
    );
    const totalTickets = Object.values(dataMap).reduce(
      (sum, item) => sum + item.tickets,
      0
    );

    totalRow.innerHTML = `
      <td style="color: white; font-weight: 700; border-top: 2px solid rgba(255, 255, 255, 0.3);">TỔNG CỘNG</td>
      <td style="color: white; font-weight: 700; border-top: 2px solid rgba(255, 255, 255, 0.3);">${totalVeRevenue.toLocaleString(
        "vi-VN"
      )} VNĐ</td>
      <td style="color: white; font-weight: 700; border-top: 2px solid rgba(255, 255, 255, 0.3);">${totalComboRevenue.toLocaleString(
        "vi-VN"
      )} VNĐ</td>
      <td style="color: #48dbfb; font-weight: 700; border-top: 2px solid rgba(255, 255, 255, 0.3);">${totalRevenue.toLocaleString(
        "vi-VN"
      )} VNĐ</td>
      <td style="color: white; font-weight: 700; text-align: center; border-top: 2px solid rgba(255, 255, 255, 0.3);">${totalTickets}</td>
      <td style="color: white; font-weight: 700; text-align: center; border-top: 2px solid rgba(255, 255, 255, 0.3);">100%</td>
    `;
    tbody.appendChild(totalRow);
  }
}

function loadMovieTable(data) {
  const tbody = document.getElementById("movieTableBody");
  tbody.innerHTML = "";

  const totalRevenue = data.reduce(
    (sum, item) => sum + parseFloat(item.DoanhThu),
    0
  );

  data.forEach((item, index) => {
    const row = document.createElement("tr");
    const percentage =
      totalRevenue > 0
        ? ((parseFloat(item.DoanhThu) / totalRevenue) * 100).toFixed(1)
        : 0;

    row.innerHTML = `
            <td style="color: white; font-weight: 600;">${item.TenPhim}</td>
            <td style="color: rgba(255, 255, 255, 0.8);">${parseFloat(
              item.DoanhThu
            ).toLocaleString("vi-VN")} VNĐ</td>
            <td style="color: rgba(255, 255, 255, 0.8); text-align: center;">${
              item.SoVeBan || 0
            }</td>
            <td style="color: #48dbfb; text-align: center; font-weight: 600;">${percentage}%</td>
          `;
    row.className = "slide-in-right";
    row.style.animationDelay = `${index * 0.05}s`;
    tbody.appendChild(row);
  });
}

function loadOccupancyTable(data) {
  const tbody = document.getElementById("occupancyTableBody");
  tbody.innerHTML = "";

  const occupancyRate = parseFloat(data.TyLeLapDay);
  const emptyRate = 100 - occupancyRate;

  const tableData = [
    {
      label: "Tỷ lệ lấp đầy",
      value: `${occupancyRate.toFixed(1)}%`,
      color: "#43e97b",
    },
    {
      label: "Tỷ lệ còn trống",
      value: `${emptyRate.toFixed(1)}%`,
      color: "rgba(255, 255, 255, 0.5)",
    },
    { label: "Tổng số ghế", value: data.TongSoGhe || 0, color: "white" },
  ];

  tableData.forEach((item, index) => {
    const row = document.createElement("tr");
    row.innerHTML = `
            <td style="color: rgba(255, 255, 255, 0.8); font-weight: 600;">${item.label}</td>
            <td style="color: ${item.color}; font-weight: 600; text-align: center;">${item.value}</td>
          `;
    row.className = "slide-in-right";
    row.style.animationDelay = `${index * 0.05}s`;
    tbody.appendChild(row);
  });
}

function loadBreakdownTable(data) {
  const tbody = document.getElementById("breakdownTableBody");
  tbody.innerHTML = "";

  const totalRevenue = data.reduce((sum, item) => sum + item.value, 0);

  data.forEach((item, index) => {
    const row = document.createElement("tr");
    const percentage =
      totalRevenue > 0 ? ((item.value / totalRevenue) * 100).toFixed(1) : 0;

    row.innerHTML = `
            <td style="color: white; font-weight: 600;">${item.label}</td>
            <td style="color: rgba(255, 255, 255, 0.8);">${item.value.toLocaleString(
              "vi-VN"
            )} VNĐ</td>
            <td style="color: #48dbfb; text-align: center; font-weight: 600;">${percentage}%</td>
          `;
    row.className = "slide-in-right";
    row.style.animationDelay = `${index * 0.05}s`;
    tbody.appendChild(row);
  });
}

async function updateStatsCards() {
  try {
    const movieResponse = await ThongKeAPI.thongKeDoanhThuTheoPhim();
    const fromDate = document.getElementById("fromDate").value;
    const toDate = document.getElementById("toDate").value;
    const revenueResponse = await ThongKeAPI.thongKeDoanhThuTheoNgay(
      fromDate,
      toDate
    );

    if (movieResponse.data && revenueResponse.data) {
      const totalRevenue = revenueResponse.data.reduce(
        (sum, item) => sum + parseFloat(item.TongDoanhThu),
        0
      );
      const totalTickets = movieResponse.data.reduce(
        (sum, item) => sum + parseInt(item.SoVeBan),
        0
      );
      const avgRevenuePerMovie =
        movieResponse.data.length > 0
          ? totalRevenue / movieResponse.data.length
          : 0;

      animateNumber("totalRevenueCount", totalRevenue, (value) =>
        new Intl.NumberFormat("vi-VN").format(value)
      );
      animateNumber("totalTicketsSoldCount", totalTickets);
      animateNumber("avgRevenuePerMovieCount", avgRevenuePerMovie, (value) =>
        new Intl.NumberFormat("vi-VN").format(value)
      );
      animateNumber("totalMoviesCount", movieResponse.data.length);
    }
  } catch (error) {
    console.error("Error updating stats cards:", error);
  }
}

function animateNumber(elementId, targetValue, formatter = null) {
  const element = document.getElementById(elementId);
  const startValue = 0;
  const duration = 1000;
  const startTime = performance.now();

  function updateNumber(currentTime) {
    const elapsed = currentTime - startTime;
    const progress = Math.min(elapsed / duration, 1);
    const currentValue = startValue + (targetValue - startValue) * progress;

    if (!element) {
      console.warn(`Element with ID ${elementId} not found`);
      return;
    }

    if (formatter) {
      element.textContent = formatter(currentValue);
    } else {
      element.textContent = Math.floor(currentValue);
    }

    if (progress < 1) {
      requestAnimationFrame(updateNumber);
    }
  }

  requestAnimationFrame(updateNumber);
}

async function updateRevenueChart() {
  const fromDate = document.getElementById("fromDate").value;
  const toDate = document.getElementById("toDate").value;

  // Validate dates
  if (!fromDate || !toDate) {
    alert("Vui lòng chọn cả ngày bắt đầu và ngày kết thúc");
    return;
  }

  const fromDateObj = new Date(fromDate);
  const toDateObj = new Date(toDate);

  if (fromDateObj > toDateObj) {
    alert("Ngày bắt đầu không thể lớn hơn ngày kết thúc");
    return;
  }

  // Check if date range is too large (more than 365 days)
  const daysDiff = Math.ceil((toDateObj - fromDateObj) / (1000 * 60 * 60 * 24));
  if (daysDiff > 365) {
    alert("Khoảng thời gian thống kê không được vượt quá 365 ngày");
    return;
  }

  showLoading(true);
  try {
    await Promise.all([loadRevenueChart(), updateStatsCards()]);
    console.log(`Updated revenue chart for period: ${fromDate} to ${toDate}`);
  } catch (error) {
    console.error("Error updating revenue chart:", error);
    alert("Có lỗi xảy ra khi cập nhật biểu đồ. Vui lòng thử lại.");
  }
  showLoading(false);
}

function exportReport() {
  try {
    // Hiển thị loading
    showLoading(true);

    // Kiểm tra xem có dữ liệu để xuất không
    if (!revenueData || revenueData.length === 0) {
      showErrorMessage(
        "Không có dữ liệu",
        "Vui lòng chọn khoảng thời gian có dữ liệu để xuất báo cáo."
      );
      showLoading(false);
      return;
    }
    // Tạo workbook và worksheet
    const workbook = XLSX.utils.book_new();

    // Lấy thông tin ngày hiện tại cho báo cáo
    const now = new Date();
    const reportDate = now.toLocaleDateString("vi-VN");
    const reportTime = now.toLocaleTimeString("vi-VN");

    // Lấy khoảng thời gian thống kê
    const fromDate = document.getElementById("fromDate").value;
    const toDate = document.getElementById("toDate").value;

    // Sheet 1: Tổng quan báo cáo
    const overviewData = [
      ["BÁO CÁO THỐNG KÊ RẠP PHIM"],
      [""],
      ["Ngày tạo báo cáo:", reportDate],
      ["Thời gian tạo:", reportTime],
      [
        "Khoảng thời gian thống kê:",
        `${new Date(fromDate).toLocaleDateString("vi-VN")} - ${new Date(
          toDate
        ).toLocaleDateString("vi-VN")}`,
      ],
      [""],
      ["TỔNG QUAN CHÍNH"],
      [
        "Tổng doanh thu:",
        document.getElementById("totalRevenueCount")?.textContent || "0",
      ],
      [
        "Tổng vé bán:",
        document.getElementById("totalTicketsSoldCount")?.textContent || "0",
      ],
      [
        "Doanh thu TB/phim:",
        document.getElementById("avgRevenuePerMovieCount")?.textContent || "0",
      ],
      [
        "Tổng số phim:",
        document.getElementById("totalMoviesCount")?.textContent || "0",
      ],
      [""],
      ["CHI TIẾT THỐNG KÊ"],
      ["Số ngày có dữ liệu:", revenueData.length],
      [
        "Doanh thu cao nhất/ngày:",
        Math.max(
          ...revenueData.map((item) => parseFloat(item.TongDoanhThu))
        ).toLocaleString("vi-VN") + " VNĐ",
      ],
      [
        "Doanh thu thấp nhất/ngày:",
        Math.min(
          ...revenueData.map((item) => parseFloat(item.TongDoanhThu))
        ).toLocaleString("vi-VN") + " VNĐ",
      ],
      [
        "Doanh thu trung bình/ngày:",
        (
          revenueData.reduce(
            (sum, item) => sum + parseFloat(item.TongDoanhThu),
            0
          ) / revenueData.length
        ).toLocaleString("vi-VN") + " VNĐ",
      ],
    ];

    const overviewSheet = XLSX.utils.aoa_to_sheet(overviewData);

    // Định dạng sheet tổng quan
    overviewSheet["!cols"] = [{ width: 25 }, { width: 25 }];

    // Thêm style cho tiêu đề
    if (overviewSheet["A1"]) {
      overviewSheet["A1"].s = {
        font: { bold: true, sz: 16 },
        alignment: { horizontal: "center" },
      };
    }

    XLSX.utils.book_append_sheet(workbook, overviewSheet, "Tổng quan");

    // Sheet 2: Doanh thu theo ngày
    if (revenueData && revenueData.length > 0) {
      const revenueHeaders = [
        "Ngày",
        "Doanh thu vé (VNĐ)",
        "Doanh thu combo (VNĐ)",
        "Tổng doanh thu (VNĐ)",
        "Số vé bán",
      ];

      const revenueRows = revenueData.map((item) => [
        new Date(item.Ngay).toLocaleDateString("vi-VN"),
        parseFloat(item.DoanhThuVe).toLocaleString("vi-VN"),
        parseFloat(item.DoanhThuCombo).toLocaleString("vi-VN"),
        parseFloat(item.TongDoanhThu).toLocaleString("vi-VN"),
        parseInt(item.SoVeBan || 0),
      ]);

      // Tính tổng
      const totalVe = revenueData.reduce(
        (sum, item) => sum + parseFloat(item.DoanhThuVe),
        0
      );
      const totalCombo = revenueData.reduce(
        (sum, item) => sum + parseFloat(item.DoanhThuCombo),
        0
      );
      const totalRevenue = revenueData.reduce(
        (sum, item) => sum + parseFloat(item.TongDoanhThu),
        0
      );
      const totalTickets = revenueData.reduce(
        (sum, item) => sum + parseInt(item.SoVeBan || 0),
        0
      );

      revenueRows.push([
        "TỔNG CỘNG",
        totalVe.toLocaleString("vi-VN"),
        totalCombo.toLocaleString("vi-VN"),
        totalRevenue.toLocaleString("vi-VN"),
        totalTickets,
      ]);

      const revenueSheetData = [revenueHeaders, ...revenueRows];
      const revenueSheet = XLSX.utils.aoa_to_sheet(revenueSheetData);

      // Định dạng columns
      revenueSheet["!cols"] = [
        { width: 15 },
        { width: 20 },
        { width: 20 },
        { width: 20 },
        { width: 12 },
      ];

      XLSX.utils.book_append_sheet(
        workbook,
        revenueSheet,
        "Doanh thu theo ngày"
      );
    }

    // Sheet 3: Doanh thu theo phim
    if (movieData && movieData.length > 0) {
      const movieHeaders = [
        "Tên phim",
        "Thể loại",
        "Doanh thu (VNĐ)",
        "Số vé bán",
        "Tỷ lệ (%)",
      ];

      const totalMovieRevenue = movieData.reduce(
        (sum, item) => sum + parseFloat(item.DoanhThu),
        0
      );

      const movieRows = movieData.map((item) => [
        item.TenPhim,
        item.TheLoai || "N/A",
        parseFloat(item.DoanhThu).toLocaleString("vi-VN"),
        item.SoVeBan || 0,
        totalMovieRevenue > 0
          ? ((parseFloat(item.DoanhThu) / totalMovieRevenue) * 100).toFixed(1) +
            "%"
          : "0%",
      ]);

      // Thêm tổng
      const totalTickets = movieData.reduce(
        (sum, item) => sum + parseInt(item.SoVeBan || 0),
        0
      );
      movieRows.push([
        "TỔNG CỘNG",
        "",
        totalMovieRevenue.toLocaleString("vi-VN"),
        totalTickets,
        "100%",
      ]);

      const movieSheetData = [movieHeaders, ...movieRows];
      const movieSheet = XLSX.utils.aoa_to_sheet(movieSheetData);

      // Định dạng columns
      movieSheet["!cols"] = [
        { width: 25 },
        { width: 15 },
        { width: 20 },
        { width: 12 },
        { width: 12 },
      ];

      XLSX.utils.book_append_sheet(workbook, movieSheet, "Doanh thu theo phim");
    }

    // Sheet 4: Phân tích doanh thu (Vé vs Combo)
    if (breakdownData && breakdownData.length > 0) {
      const breakdownHeaders = ["Loại doanh thu", "Giá trị (VNĐ)", "Tỷ lệ (%)"];

      const totalBreakdown = breakdownData.reduce(
        (sum, item) => sum + item.value,
        0
      );

      const breakdownRows = breakdownData.map((item) => [
        item.label,
        item.value.toLocaleString("vi-VN"),
        totalBreakdown > 0
          ? ((item.value / totalBreakdown) * 100).toFixed(1) + "%"
          : "0%",
      ]);

      breakdownRows.push([
        "TỔNG CỘNG",
        totalBreakdown.toLocaleString("vi-VN"),
        "100%",
      ]);

      const breakdownSheetData = [breakdownHeaders, ...breakdownRows];
      const breakdownSheet = XLSX.utils.aoa_to_sheet(breakdownSheetData);

      // Định dạng columns
      breakdownSheet["!cols"] = [{ width: 20 }, { width: 18 }, { width: 12 }];

      XLSX.utils.book_append_sheet(
        workbook,
        breakdownSheet,
        "Phân tích doanh thu"
      );
    }

    // Sheet 5: Tỷ lệ lấp đầy suất chiếu (nếu có dữ liệu)
    if (occupancyData) {
      const occupancyHeaders = ["Thông tin", "Giá trị"];

      const occupancyRate = parseFloat(occupancyData.TyLeLapDay);
      const emptyRate = 100 - occupancyRate;

      const occupancyRows = [
        ["Tỷ lệ lấp đầy", occupancyRate.toFixed(1) + "%"],
        ["Tỷ lệ còn trống", emptyRate.toFixed(1) + "%"],
        ["Tổng số ghế", occupancyData.TongSoGhe || "N/A"],
        [
          "Số ghế đã bán",
          Math.round(((occupancyData.TongSoGhe || 0) * occupancyRate) / 100),
        ],
        [
          "Số ghế còn trống",
          Math.round(((occupancyData.TongSoGhe || 0) * emptyRate) / 100),
        ],
      ];

      const occupancySheetData = [occupancyHeaders, ...occupancyRows];
      const occupancySheet = XLSX.utils.aoa_to_sheet(occupancySheetData);

      // Định dạng columns
      occupancySheet["!cols"] = [{ width: 20 }, { width: 15 }];

      XLSX.utils.book_append_sheet(workbook, occupancySheet, "Tỷ lệ lấp đầy");
    }

    // Tạo tên file với timestamp
    const filename = `Bao_cao_thong_ke_${fromDate}_${toDate}_${now.getTime()}.xlsx`;

    // Xuất file
    XLSX.writeFile(workbook, filename);

    // Ẩn loading
    showLoading(false);

    // Hiển thị thông báo thành công
    showSuccessMessage(
      "Xuất báo cáo thành công!",
      `File đã được lưu: ${filename}`
    );
  } catch (error) {
    console.error("Lỗi khi xuất báo cáo:", error);
    showLoading(false);
    showErrorMessage(
      "Lỗi xuất báo cáo",
      "Không thể xuất báo cáo. Vui lòng thử lại sau."
    );
  }
}

function showLoading(show) {
  const loadingState = document.getElementById("loadingState");
  loadingState.style.display = show ? "flex" : "none";
}

function showEmptyState(show) {
  const emptyState = document.getElementById("emptyState");
  emptyState.style.display = show ? "block" : "none";
}

// Date range preset functions
function setDateRange(days) {
  const today = new Date();
  const pastDate = new Date(today);
  pastDate.setDate(today.getDate() - days);

  document.getElementById("fromDate").value = pastDate
    .toISOString()
    .split("T")[0];
  document.getElementById("toDate").value = today.toISOString().split("T")[0];

  // Auto update chart
  setTimeout(updateRevenueChart, 100);
}

function setCurrentMonth() {
  const today = new Date();
  const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);

  document.getElementById("fromDate").value = firstDayOfMonth
    .toISOString()
    .split("T")[0];
  document.getElementById("toDate").value = today.toISOString().split("T")[0];

  // Auto update chart
  setTimeout(updateRevenueChart, 100);
}

function setLastMonth() {
  const today = new Date();
  const firstDayOfLastMonth = new Date(
    today.getFullYear(),
    today.getMonth() - 1,
    1
  );
  const lastDayOfLastMonth = new Date(today.getFullYear(), today.getMonth(), 0);

  document.getElementById("fromDate").value = firstDayOfLastMonth
    .toISOString()
    .split("T")[0];
  document.getElementById("toDate").value = lastDayOfLastMonth
    .toISOString()
    .split("T")[0];

  // Auto update chart
  setTimeout(updateRevenueChart, 100);
}

// Utility functions for export
function showSuccessMessage(title, message) {
  // Tạo modal thông báo thành công
  const modal = document.createElement("div");
  modal.className = "modal fade";
  modal.innerHTML = `
    <div class="modal-dialog modal-dialog-centered">
      <div class="modal-content" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); border: none; border-radius: 15px;">
        <div class="modal-header border-0">
          <h5 class="modal-title text-white">
            <i class="fas fa-check-circle text-success me-2"></i>${title}
          </h5>
          <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal"></button>
        </div>
        <div class="modal-body text-white">
          ${message}
        </div>
        <div class="modal-footer border-0">
          <button type="button" class="ultra-btn ultra-btn-secondary" data-bs-dismiss="modal">Đóng</button>
        </div>
      </div>
    </div>
  `;

  document.body.appendChild(modal);
  const bootstrapModal = new bootstrap.Modal(modal);
  bootstrapModal.show();

  // Tự động xóa modal sau khi đóng
  modal.addEventListener("hidden.bs.modal", () => {
    document.body.removeChild(modal);
  });
}

function showErrorMessage(title, message) {
  // Tạo modal thông báo lỗi
  const modal = document.createElement("div");
  modal.className = "modal fade";
  modal.innerHTML = `
    <div class="modal-dialog modal-dialog-centered">
      <div class="modal-content" style="background: linear-gradient(135deg, #ff6b6b 0%, #ee5a52 100%); border: none; border-radius: 15px;">
        <div class="modal-header border-0">
          <h5 class="modal-title text-white">
            <i class="fas fa-exclamation-triangle text-warning me-2"></i>${title}
          </h5>
          <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal"></button>
        </div>
        <div class="modal-body text-white">
          ${message}
        </div>
        <div class="modal-footer border-0">
          <button type="button" class="ultra-btn ultra-btn-secondary" data-bs-dismiss="modal">Đóng</button>
        </div>
      </div>
    </div>
  `;

  document.body.appendChild(modal);
  const bootstrapModal = new bootstrap.Modal(modal);
  bootstrapModal.show();

  // Tự động xóa modal sau khi đóng
  modal.addEventListener("hidden.bs.modal", () => {
    document.body.removeChild(modal);
  });
}
