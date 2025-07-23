class SidebarManager {
  constructor(options = {}) {
    // Default configuration
    this.config = {
      sidebarPath: "components/sidebar.html",
      containerId: "sidebar-container",
      activeClass: "active",
      mobileBreakpoint: 768,
      autoLoad: true,
      enableCache: true,
      enableMobileToggle: true,
      enableKeyboardShortcuts: true,
      animationDuration: 300,
      ...options,
    };

    // State management
    this.state = {
      isLoaded: false,
      isLoading: false,
      currentPage: "",
      isMobile: false,
      isOpen: false,
      cache: null,
    };

    // Page mapping for auto-detection
    this.pageMap = {
      "phim.html": "phim",
      "phongchieu.html": "phongchieu",
      "suatchieu.html": "suatchieu",
      "khachhang.html": "khachhang",
      "ve.html": "ve",
      "combo.html": "combo",
      "hoadon.html": "hoadon",
      "thongke.html": "thongke",
    };

    // Event listeners storage
    this.eventListeners = new Map();

    // Initialize
    this.init();
  }

  /**
   * Initialize the sidebar manager
   */
  init() {
    this.detectMobile();
    this.setupEventListeners();

    if (this.config.autoLoad) {
      this.autoLoadSidebar();
    }
  }

  /**
   * Detect if device is mobile
   */
  detectMobile() {
    this.state.isMobile = window.innerWidth <= this.config.mobileBreakpoint;
  }

  /**
   * Setup global event listeners
   */
  setupEventListeners() {
    // Window resize handler
    const resizeHandler = this.debounce(() => {
      const wasMobile = this.state.isMobile;
      this.detectMobile();

      if (wasMobile !== this.state.isMobile) {
        this.handleResponsiveChange();
      }
    }, 250);

    window.addEventListener("resize", resizeHandler);

    // Keyboard shortcuts
    if (this.config.enableKeyboardShortcuts) {
      document.addEventListener("keydown", (e) => {
        this.handleKeyboardShortcuts(e);
      });
    }

    // Page visibility change
    document.addEventListener("visibilitychange", () => {
      if (!document.hidden && this.state.isLoaded) {
        this.refreshActiveState();
      }
    });
  }

  /**
   * Handle responsive changes
   */
  handleResponsiveChange() {
    if (this.state.isLoaded) {
      const sidebar = this.getSidebarElement();
      if (sidebar) {
        if (!this.state.isMobile) {
          sidebar.classList.remove("active");
          this.state.isOpen = false;
        }
        this.emit("responsiveChange", { isMobile: this.state.isMobile });
      }
    }
  }

  /**
   * Handle keyboard shortcuts
   */
  handleKeyboardShortcuts(e) {
    // Ctrl/Cmd + B to toggle sidebar
    if ((e.ctrlKey || e.metaKey) && e.key === "b") {
      e.preventDefault();
      this.toggle();
    }

    // Escape to close sidebar on mobile
    if (e.key === "Escape" && this.state.isMobile && this.state.isOpen) {
      this.close();
    }
  }

  /**
   * Auto-load sidebar based on current page
   */
  async autoLoadSidebar() {
    const currentPage = this.detectCurrentPage();
    await this.loadSidebar(currentPage);
  }

  /**
   * Detect current page from URL
   */
  detectCurrentPage() {
    const path = window.location.pathname;
    const fileName = path.split("/").pop() || "phim.html";

    // Handle root path
    if (fileName === "" || fileName === "/") {
      return "phim";
    }

    return this.pageMap[fileName] || "phim";
  }

  /**
   * Load sidebar component
   * @param {string} activePage - Page to set as active
   * @returns {Promise<boolean>} Success status
   */
  async loadSidebar(activePage = "") {
    if (this.state.isLoading) {
      console.warn("Sidebar is already loading");
      return false;
    }

    if (this.state.isLoaded && this.state.currentPage === activePage) {
      console.info("Sidebar already loaded for this page");
      return true;
    }

    this.state.isLoading = true;
    this.emit("loadStart", { activePage });

    try {
      // Get or create container
      const container = this.getOrCreateContainer();

      // Show loading state
      this.showLoadingState(container);

      // Load sidebar HTML
      const sidebarHTML = await this.fetchSidebarHTML();

      // Insert HTML
      container.innerHTML = sidebarHTML;

      // Initialize sidebar functionality
      await this.initializeSidebar(activePage);

      // Update state
      this.state.isLoaded = true;
      this.state.isLoading = false;
      this.state.currentPage = activePage;

      // Emit success event
      this.emit("loadSuccess", { activePage });
      this.emit("sidebarLoaded", { activePage }); // Backward compatibility

      return true;
    } catch (error) {
      this.state.isLoading = false;
      this.handleLoadError(error);
      return false;
    }
  }

  /**
   * Get or create sidebar container
   */
  getOrCreateContainer() {
    let container = document.getElementById(this.config.containerId);

    if (!container) {
      container = document.createElement("div");
      container.id = this.config.containerId;
      document.body.insertBefore(container, document.body.firstChild);
    }

    return container;
  }

  /**
   * Show loading state
   */
  showLoadingState(container) {
    container.innerHTML = `
            <div class="sidebar-loading">
                <div class="d-flex flex-column align-items-center justify-content-center h-100">
                    <div class="spinner-border text-light mb-3" role="status">
                        <span class="visually-hidden">Đang tải...</span>
                    </div>
                    <small class="text-light">Đang tải sidebar...</small>
                </div>
            </div>
        `;
  }

  /**
   * Fetch sidebar HTML with caching
   */
  async fetchSidebarHTML() {
    // Check cache first
    if (this.config.enableCache && this.state.cache) {
      return this.state.cache;
    }

    const response = await fetch(this.config.sidebarPath);

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const html = await response.text();

    // Cache the result
    if (this.config.enableCache) {
      this.state.cache = html;
    }

    return html;
  }

  /**
   * Initialize sidebar functionality
   */
  async initializeSidebar(activePage) {
    // Set active page
    this.setActivePage(activePage);

    // Setup mobile toggle
    if (this.config.enableMobileToggle) {
      this.setupMobileToggle();
    }

    // Setup navigation click handlers
    this.setupNavigationHandlers();

    // Setup outside click handler for mobile
    this.setupOutsideClickHandler();

    // Apply initial responsive state
    this.applyResponsiveState();

    // Wait for any animations to complete
    await this.sleep(100);
  }

  /**
   * Set active page in navigation
   */
  setActivePage(activePage) {
    if (!activePage) return;

    const navLinks = document.querySelectorAll(".sidebar .nav-link");

    navLinks.forEach((link) => {
      link.classList.remove(this.config.activeClass);

      if (link.getAttribute("data-page") === activePage) {
        link.classList.add(this.config.activeClass);
      }
    });

    this.state.currentPage = activePage;
    this.emit("activePageChanged", { activePage });
  }

  /**
   * Setup mobile toggle functionality
   */
  setupMobileToggle() {
    const toggleBtn = document.getElementById("sidebarToggle");

    if (toggleBtn) {
      // Remove existing listeners
      const newToggleBtn = toggleBtn.cloneNode(true);
      toggleBtn.parentNode.replaceChild(newToggleBtn, toggleBtn);

      // Add new listener
      newToggleBtn.addEventListener("click", (e) => {
        e.preventDefault();
        e.stopPropagation();
        this.toggle();
      });
    }
  }

  /**
   * Setup navigation click handlers
   */
  setupNavigationHandlers() {
    const navLinks = document.querySelectorAll(".sidebar .nav-link");

    navLinks.forEach((link) => {
      link.addEventListener("click", (e) => {
        const page = link.getAttribute("data-page");
        if (page) {
          this.emit("navigationClick", { page, link, event: e });

          // Close sidebar on mobile after navigation
          if (this.state.isMobile) {
            setTimeout(() => this.close(), 150);
          }
        }
      });
    });
  }

  /**
   * Setup outside click handler for mobile
   */
  setupOutsideClickHandler() {
    document.addEventListener("click", (e) => {
      if (!this.state.isMobile || !this.state.isOpen) return;

      const sidebar = this.getSidebarElement();
      const toggleBtn = document.getElementById("sidebarToggle");

      if (
        sidebar &&
        !sidebar.contains(e.target) &&
        toggleBtn &&
        !toggleBtn.contains(e.target)
      ) {
        this.close();
      }
    });
  }

  /**
   * Apply responsive state
   */
  applyResponsiveState() {
    const sidebar = this.getSidebarElement();
    if (!sidebar) return;

    if (this.state.isMobile) {
      sidebar.classList.remove("active");
      this.state.isOpen = false;
    }
  }

  /**
   * Get sidebar element
   */
  getSidebarElement() {
    return document.getElementById("sidebar");
  }

  /**
   * Toggle sidebar visibility
   */
  toggle() {
    if (this.state.isOpen) {
      this.close();
    } else {
      this.open();
    }
  }

  /**
   * Open sidebar
   */
  open() {
    const sidebar = this.getSidebarElement();
    if (!sidebar) return;

    sidebar.classList.add("active");
    this.state.isOpen = true;
    this.emit("sidebarOpened");
  }

  /**
   * Close sidebar
   */
  close() {
    const sidebar = this.getSidebarElement();
    if (!sidebar) return;

    sidebar.classList.remove("active");
    this.state.isOpen = false;
    this.emit("sidebarClosed");
  }

  /**
   * Update active page without reloading
   */
  updateActivePage(newActivePage) {
    if (this.state.isLoaded && newActivePage !== this.state.currentPage) {
      this.setActivePage(newActivePage);
    }
  }

  /**
   * Refresh active state (useful after navigation)
   */
  refreshActiveState() {
    const currentPage = this.detectCurrentPage();
    this.updateActivePage(currentPage);
  }

  /**
   * Reload sidebar component
   */
  async reload(activePage = null) {
    this.state.isLoaded = false;
    this.state.cache = null; // Clear cache

    const pageToLoad = activePage || this.detectCurrentPage();
    return await this.loadSidebar(pageToLoad);
  }

  /**
   * Handle load errors
   */
  // handleLoadError(error) {
  //   console.error("Sidebar load error:", error);

  //   const container = document.getElementById(this.config.containerId);
  //   if (container) {
  //     container.innerHTML = `
  //               <div class="sidebar-error">
  //                   <div class="alert alert-danger m-3">
  //                       <div class="d-flex align-items-center">
  //                           <i class="fas fa-exclamation-triangle me-2"></i>
  //                           <div>
  //                               <strong>Lỗi tải sidebar</strong><br>
  //                               <small>${error.message}</small>
  //                           </div>
  //                       </div>
  //                       <button class="btn btn-sm btn-outline-danger mt-2" onclick="sidebarManager.reload()">
  //                           <i class="fas fa-redo me-1"></i>Thử lại
  //                       </button>
  //                   </div>
  //               </div>
  //           `;
  //   }

  //   this.emit("loadError", { error });
  // }

  /**
   * Event system - Add event listener
   */
  on(event, callback) {
    if (!this.eventListeners.has(event)) {
      this.eventListeners.set(event, []);
    }
    this.eventListeners.get(event).push(callback);
  }

  /**
   * Event system - Remove event listener
   */
  off(event, callback) {
    if (this.eventListeners.has(event)) {
      const listeners = this.eventListeners.get(event);
      const index = listeners.indexOf(callback);
      if (index > -1) {
        listeners.splice(index, 1);
      }
    }
  }

  /**
   * Event system - Emit event
   */
  emit(event, data = {}) {
    if (this.eventListeners.has(event)) {
      this.eventListeners.get(event).forEach((callback) => {
        try {
          callback(data);
        } catch (error) {
          console.error(`Error in event listener for ${event}:`, error);
        }
      });
    }

    // Also dispatch DOM event for backward compatibility
    document.dispatchEvent(new CustomEvent(event, { detail: data }));
  }

  /**
   * Utility - Debounce function
   */
  debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  }

  /**
   * Utility - Sleep function
   */
  sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  /**
   * Get current state
   */
  getState() {
    return { ...this.state };
  }

  /**
   * Get configuration
   */
  getConfig() {
    return { ...this.config };
  }

  /**
   * Update configuration
   */
  updateConfig(newConfig) {
    this.config = { ...this.config, ...newConfig };
  }

  /**
   * Check if sidebar is loaded
   */
  isLoaded() {
    return this.state.isLoaded;
  }

  /**
   * Check if sidebar is loading
   */
  isLoading() {
    return this.state.isLoading;
  }

  /**
   * Get current active page
   */
  getCurrentPage() {
    return this.state.currentPage;
  }

  /**
   * Check if mobile
   */
  isMobile() {
    return this.state.isMobile;
  }

  /**
   * Check if sidebar is open (mobile)
   */
  isOpen() {
    return this.state.isOpen;
  }

  /**
   * Destroy sidebar manager
   */
  destroy() {
    // Remove event listeners
    this.eventListeners.clear();

    // Remove sidebar from DOM
    const container = document.getElementById(this.config.containerId);
    if (container) {
      container.remove();
    }

    // Reset state
    this.state = {
      isLoaded: false,
      isLoading: false,
      currentPage: "",
      isMobile: false,
      isOpen: false,
      cache: null,
    };
  }
}

// Create global sidebar manager instance
window.sidebarManager = new SidebarManager();

/**
 * Ultra Modern Sidebar Integration Script
 * Fixed version with proper error handling and correct paths
 */

class UltraSidebarLoader {
  constructor() {
    this.containerId = "sidebar-container";
    this.sidebarPath = "components/sidebar.html";
    this.cssPath = "css/sidebar.css";
    this.isLoaded = false;
    this.currentPage = "";
    this.retryCount = 0;
    this.maxRetries = 3;

    this.init();
  }

  async init() {
    try {
      await this.loadCSS();
      await this.loadSidebar();
      this.setupIntegration();
    } catch (error) {
      console.error("Failed to initialize sidebar:", error);
      this.showError(error);
    }
  }

  async loadCSS() {
    return new Promise((resolve, reject) => {
      // Check if CSS is already loaded
      if (document.querySelector(`link[href*="sidebar.css"]`)) {
        resolve();
        return;
      }

      const link = document.createElement("link");
      link.rel = "stylesheet";
      link.href = this.cssPath;

      link.onload = () => resolve();
      link.onerror = () => {
        console.warn("Could not load sidebar CSS, using inline styles");
        this.injectInlineCSS();
        resolve();
      };

      document.head.appendChild(link);
    });
  }

  injectInlineCSS() {
    const style = document.createElement("style");
    style.textContent = `
            /* Fallback inline CSS for sidebar */
            .ultra-sidebar {
                position: fixed;
                top: 0;
                left: 0;
                width: 280px;
                height: 100vh;
                background: rgba(15, 15, 35, 0.95);
                backdrop-filter: blur(20px);
                border-right: 1px solid rgba(255, 255, 255, 0.1);
                box-shadow: 0 8px 32px 0 rgba(31, 38, 135, 0.37);
                z-index: 1000;
                transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
                overflow: hidden;
                font-family: "Poppins", sans-serif;
            }
            
            .ultra-sidebar-loading {
                display: flex;
                align-items: center;
                justify-content: center;
                height: 200px;
                color: rgba(255, 255, 255, 0.5);
            }
            
            .ultra-sidebar-spinner {
                width: 32px;
                height: 32px;
                border: 2px solid rgba(255, 255, 255, 0.1);
                border-top: 2px solid #667eea;
                border-radius: 50%;
                animation: spin 1s linear infinite;
            }
            
            @keyframes spin {
                0% { transform: rotate(0deg); }
                100% { transform: rotate(360deg); }
            }
            
            .sidebar-error {
                padding: 2rem;
                color: #ef4444;
                text-align: center;
                background: rgba(15, 15, 35, 0.95);
                height: 100vh;
                display: flex;
                flex-direction: column;
                justify-content: center;
                align-items: center;
            }
        `;
    document.head.appendChild(style);
  }

  async loadSidebar() {
    try {
      const container = this.getOrCreateContainer();

      // Show loading state
      container.innerHTML = `
                <div class="ultra-sidebar">
                    <div class="ultra-sidebar-loading">
                        <div class="ultra-sidebar-spinner"></div>
                    </div>
                </div>
            `;

      // Try to load sidebar HTML
      let html;
      try {
        const response = await fetch(this.sidebarPath);
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        html = await response.text();
      } catch (fetchError) {
        console.warn("Could not load sidebar component, using fallback");
        html = this.getFallbackSidebarHTML();
      }

      container.innerHTML = html;
      this.isLoaded = true;
      this.currentPage = this.detectCurrentPage();

      // Wait for sidebar to initialize
      await this.waitForSidebar();

      // Set active page
      this.setActivePage();

      // Emit events
      this.emitEvents();
    } catch (error) {
      console.error("Error loading ultra sidebar:", error);
      if (this.retryCount < this.maxRetries) {
        this.retryCount++;
        console.log(
          `Retrying sidebar load (${this.retryCount}/${this.maxRetries})`
        );
        setTimeout(() => this.loadSidebar(), 1000);
      } else {
        this.showError(error);
      }
    }
  }

  getFallbackSidebarHTML() {
    return `
            <div class="ultra-sidebar" id="ultraSidebar">
                <div class="ultra-sidebar-header" style="padding: 2rem 1.5rem; border-bottom: 1px solid rgba(255, 255, 255, 0.1);">
                    <a href="phim.html" class="ultra-sidebar-logo" style="display: flex; align-items: center; gap: 1rem; text-decoration: none; color: white;">
                        <div class="ultra-sidebar-logo-icon" style="width: 48px; height: 48px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); border-radius: 12px; display: flex; align-items: center; justify-content: center; font-size: 1.5rem; color: white;">
                            🎬
                        </div>
                        <div>
                            <div class="ultra-sidebar-logo-text" style="font-size: 1.5rem; font-weight: 700; color: white;">Cinema Manager</div>
                            <div class="ultra-sidebar-logo-subtitle" style="font-size: 0.75rem; color: rgba(255, 255, 255, 0.5);">Management System</div>
                        </div>
                    </a>
                </div>

                <nav class="ultra-sidebar-nav" style="padding: 1.5rem 0; height: calc(100vh - 120px); overflow-y: auto;">
                    <ul class="ultra-nav-list" style="list-style: none; padding: 0; margin: 0;">
                        <li class="ultra-nav-item" style="margin: 0.25rem 1rem;">
                            <a href="phim.html" class="ultra-nav-link" data-page="phim" style="display: flex; align-items: center; gap: 1rem; padding: 1rem 1.25rem; color: rgba(255, 255, 255, 0.8); text-decoration: none; border-radius: 12px; transition: all 0.3s ease;">
                                <span style="width: 20px;">🎥</span>
                                <span>Quản Lý Phim</span>
                            </a>
                        </li>
                        <li class="ultra-nav-item" style="margin: 0.25rem 1rem;">
                            <a href="phongchieu.html" class="ultra-nav-link" data-page="phongchieu" style="display: flex; align-items: center; gap: 1rem; padding: 1rem 1.25rem; color: rgba(255, 255, 255, 0.8); text-decoration: none; border-radius: 12px; transition: all 0.3s ease;">
                                <span style="width: 20px;">🚪</span>
                                <span>Phòng Chiếu</span>
                            </a>
                        </li>
                        <li class="ultra-nav-item" style="margin: 0.25rem 1rem;">
                            <a href="suatchieu.html" class="ultra-nav-link" data-page="suatchieu" style="display: flex; align-items: center; gap: 1rem; padding: 1rem 1.25rem; color: rgba(255, 255, 255, 0.8); text-decoration: none; border-radius: 12px; transition: all 0.3s ease;">
                                <span style="width: 20px;">⏰</span>
                                <span>Suất Chiếu</span>
                            </a>
                        </li>
                        <li class="ultra-nav-item" style="margin: 0.25rem 1rem;">
                            <a href="khachhang.html" class="ultra-nav-link" data-page="khachhang" style="display: flex; align-items: center; gap: 1rem; padding: 1rem 1.25rem; color: rgba(255, 255, 255, 0.8); text-decoration: none; border-radius: 12px; transition: all 0.3s ease;">
                                <span style="width: 20px;">👥</span>
                                <span>Khách Hàng</span>
                            </a>
                        </li>
                        <li class="ultra-nav-item" style="margin: 0.25rem 1rem;">
                            <a href="ve.html" class="ultra-nav-link" data-page="ve" style="display: flex; align-items: center; gap: 1rem; padding: 1rem 1.25rem; color: rgba(255, 255, 255, 0.8); text-decoration: none; border-radius: 12px; transition: all 0.3s ease;">
                                <span style="width: 20px;">🎫</span>
                                <span>Vé</span>
                            </a>
                        </li>
                        <li class="ultra-nav-item" style="margin: 0.25rem 1rem;">
                            <a href="combo.html" class="ultra-nav-link" data-page="combo" style="display: flex; align-items: center; gap: 1rem; padding: 1rem 1.25rem; color: rgba(255, 255, 255, 0.8); text-decoration: none; border-radius: 12px; transition: all 0.3s ease;">
                                <span style="width: 20px;">🎁</span>
                                <span>Combo</span>
                            </a>
                        </li>
                        <li class="ultra-nav-item" style="margin: 0.25rem 1rem;">
                            <a href="hoadon.html" class="ultra-nav-link" data-page="hoadon" style="display: flex; align-items: center; gap: 1rem; padding: 1rem 1.25rem; color: rgba(255, 255, 255, 0.8); text-decoration: none; border-radius: 12px; transition: all 0.3s ease;">
                                <span style="width: 20px;">🧾</span>
                                <span>Hóa Đơn</span>
                            </a>
                        </li>
                        <li class="ultra-nav-item" style="margin: 0.25rem 1rem;">
                            <a href="thongke.html" class="ultra-nav-link" data-page="thongke" style="display: flex; align-items: center; gap: 1rem; padding: 1rem 1.25rem; color: rgba(255, 255, 255, 0.8); text-decoration: none; border-radius: 12px; transition: all 0.3s ease;">
                                <span style="width: 20px;">📊</span>
                                <span>Thống Kê</span>
                            </a>
                        </li>
                    </ul>
                </nav>
            </div>

            <script>
                // Fallback sidebar functionality
                document.addEventListener('DOMContentLoaded', function() {
                    const navLinks = document.querySelectorAll('.ultra-nav-link');
                    
                    // Add hover effects
                    navLinks.forEach(link => {
                        link.addEventListener('mouseenter', function() {
                            this.style.background = 'rgba(255, 255, 255, 0.1)';
                            this.style.transform = 'translateX(4px)';
                        });
                        
                        link.addEventListener('mouseleave', function() {
                            if (!this.classList.contains('active')) {
                                this.style.background = 'transparent';
                                this.style.transform = 'translateX(0)';
                            }
                        });
                    });
                    
                    // Set active page
                    const currentPage = window.location.pathname.split('/').pop() || 'phim.html';
                    const pageMap = {
                        'phim.html': 'phim',
                        'phongchieu.html': 'phongchieu'
                    };
                    
                    const activePage = pageMap[currentPage] || 'phim';
                    const activeLink = document.querySelector('[data-page="' + activePage + '"]');
                    if (activeLink) {
                        activeLink.classList.add('active');
                        activeLink.style.background = 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)';
                        activeLink.style.transform = 'translateX(4px)';
                    }
                });
            </script>
        `;
  }

  getOrCreateContainer() {
    let container = document.getElementById(this.containerId);
    if (!container) {
      container = document.createElement("div");
      container.id = this.containerId;
      document.body.insertBefore(container, document.body.firstChild);
    }
    return container;
  }

  async waitForSidebar() {
    return new Promise((resolve) => {
      const checkSidebar = () => {
        const sidebar = document.getElementById("ultraSidebar");
        if (sidebar || window.ultraSidebar) {
          resolve();
        } else {
          setTimeout(checkSidebar, 100);
        }
      };
      checkSidebar();
    });
  }

  detectCurrentPage() {
    const path = window.location.pathname;
    const fileName = path.split("/").pop() || "phim.html";

    const pageMap = {
      "phim.html": "phim",
      "phongchieu.html": "phongchieu",
      "suatchieu.html": "suatchieu",
      "ghengoi.html": "ghengoi",
      "khachhang.html": "khachhang",
      "ve.html": "ve",
      "combo.html": "combo",
      "hoadon.html": "hoadon",
      "thongke.html": "thongke",
    };

    return pageMap[fileName] || "phim";
  }

  setActivePage() {
    const navLinks = document.querySelectorAll(".ultra-nav-link");
    navLinks.forEach((link) => {
      link.classList.remove("active");
      if (link.getAttribute("data-page") === this.currentPage) {
        link.classList.add("active");
      }
    });
  }

  setupIntegration() {
    // Listen for navigation events
    document.addEventListener("sidebarNavigation", (e) => {
      console.log("Navigation to:", e.detail.page);
    });

    // Handle page visibility changes
    document.addEventListener("visibilitychange", () => {
      if (!document.hidden && this.isLoaded) {
        const currentPage = this.detectCurrentPage();
        if (currentPage !== this.currentPage) {
          this.currentPage = currentPage;
          this.setActivePage();
        }
      }
    });

    // Adjust main content margin
    this.adjustMainContent();
  }

  adjustMainContent() {
    const mainContent = document.querySelector(".main-content");
    if (mainContent && window.innerWidth > 1024) {
      mainContent.style.marginLeft = "280px";
      mainContent.style.transition = "margin-left 0.3s ease";
    }
  }

  emitEvents() {
    document.dispatchEvent(
      new CustomEvent("sidebarLoaded", {
        detail: { activePage: this.currentPage },
      })
    );

    document.dispatchEvent(
      new CustomEvent("ultraSidebarReady", {
        detail: { activePage: this.currentPage },
      })
    );
  }

  showError(error) {
    const container = document.getElementById(this.containerId);
    if (container) {
      container.innerHTML = `
                <div class="sidebar-error">
                    <div style="font-size: 2rem; margin-bottom: 1rem;">⚠️</div>
                    <div style="font-weight: 600; margin-bottom: 0.5rem;">Sidebar Load Error</div>
                    <div style="font-size: 0.9rem; opacity: 0.8; margin-bottom: 1rem;">${error.message}</div>
                    <button onclick="location.reload()" style="padding: 0.5rem 1rem; background: #ef4444; color: white; border: none; border-radius: 6px; cursor: pointer;">
                        Retry
                    </button>
                </div>
            `;
    }
  }

  // Public methods
  updateActivePage(page) {
    this.currentPage = page;
    this.setActivePage();
  }

  addNotification(page, count) {
    const link = document.querySelector(`[data-page="${page}"]`);
    if (link) {
      let badge = link.querySelector(".ultra-nav-badge");
      if (!badge) {
        badge = document.createElement("div");
        badge.className = "ultra-nav-badge";
        badge.style.cssText = `
                    background: rgba(239, 68, 68, 0.9);
                    color: white;
                    font-size: 0.7rem;
                    font-weight: 600;
                    padding: 0.25rem 0.5rem;
                    border-radius: 6px;
                    min-width: 18px;
                    height: 18px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    margin-left: auto;
                `;
        link.appendChild(badge);
      }
      badge.textContent = count;
    }
  }

  removeNotification(page) {
    const link = document.querySelector(`[data-page="${page}"]`);
    const badge = link?.querySelector(".ultra-nav-badge");
    if (badge) {
      badge.remove();
    }
  }
}

// Auto-initialize with error handling
try {
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", () => {
      window.ultraSidebarLoader = new UltraSidebarLoader();
    });
  } else {
    window.ultraSidebarLoader = new UltraSidebarLoader();
  }
} catch (error) {
  console.error("Failed to initialize sidebar loader:", error);
}

// Backward compatibility functions
window.toggleSidebar = function () {
  if (window.ultraSidebarLoader) {
    window.ultraSidebarLoader.toggle();
  }
};

window.updateSidebarActivePage = function (page) {
  if (window.ultraSidebarLoader) {
    window.ultraSidebarLoader.updateActivePage(page);
  }
};

/**
 * Simple Sidebar Manager for Cinema Management
 * Basic functionality for phim.html and phongchieu.html
 */

class SimpleSidebar {
  constructor() {
    this.currentPage = this.detectCurrentPage();
    this.isMobile = window.innerWidth <= 768;
    this.isOpen = false;

    this.init();
  }

  init() {
    this.setActivePage();
    this.setupEventListeners();
    this.handleResize();
  }

  detectCurrentPage() {
    const path = window.location.pathname;
    const fileName = path.split("/").pop() || "phim.html";

    // Simple page mapping
    if (fileName.includes("phim")) return "phim";
    if (fileName.includes("phongchieu")) return "phongchieu";

    return "phim";
  }

  setActivePage() {
    // Remove active class from all links
    const navLinks = document.querySelectorAll(".sidebar .nav-link");
    navLinks.forEach((link) => {
      link.classList.remove("active");
    });

    // Add active class to current page
    const activeLink = document.querySelector(
      `[data-page="${this.currentPage}"]`
    );
    if (activeLink) {
      activeLink.classList.add("active");
    }
  }

  setupEventListeners() {
    // Mobile toggle button
    const toggleBtn = document.getElementById("sidebarToggle");
    if (toggleBtn) {
      toggleBtn.addEventListener("click", () => {
        this.toggle();
      });
    }

    // Window resize
    window.addEventListener("resize", () => {
      this.handleResize();
    });

    // Close sidebar when clicking outside on mobile
    document.addEventListener("click", (e) => {
      if (this.isMobile && this.isOpen) {
        const sidebar = document.getElementById("sidebar");
        const toggleBtn = document.getElementById("sidebarToggle");

        if (
          sidebar &&
          !sidebar.contains(e.target) &&
          toggleBtn &&
          !toggleBtn.contains(e.target)
        ) {
          this.close();
        }
      }
    });

    // Navigation links
    const navLinks = document.querySelectorAll(".sidebar .nav-link");
    navLinks.forEach((link) => {
      link.addEventListener("click", () => {
        if (this.isMobile) {
          this.close();
        }
      });
    });
  }

  handleResize() {
    const wasMobile = this.isMobile;
    this.isMobile = window.innerWidth <= 768;

    // If switching from mobile to desktop, close sidebar
    if (wasMobile && !this.isMobile) {
      this.close();
    }
  }

  toggle() {
    if (this.isOpen) {
      this.close();
    } else {
      this.open();
    }
  }

  open() {
    const sidebar = document.getElementById("sidebar");
    if (sidebar) {
      sidebar.classList.add("active");
      this.isOpen = true;
    }
  }

  close() {
    const sidebar = document.getElementById("sidebar");
    if (sidebar) {
      sidebar.classList.remove("active");
      this.isOpen = false;
    }
  }

  updateActivePage(page) {
    this.currentPage = page;
    this.setActivePage();
  }
}

// Initialize when DOM is ready
document.addEventListener("DOMContentLoaded", function () {
  window.simpleSidebar = new SimpleSidebar();
});

// Global functions for backward compatibility
window.toggleSidebar = function () {
  if (window.simpleSidebar) {
    window.simpleSidebar.toggle();
  }
};

window.updateSidebarActivePage = function (page) {
  if (window.simpleSidebar) {
    window.simpleSidebar.updateActivePage(page);
  }
};
