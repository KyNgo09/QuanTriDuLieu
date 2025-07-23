// Kiểm tra đăng nhập khi tải trang
function checkAuth() {
    if (sessionStorage.getItem('isLoggedIn') !== 'true') {
        window.location.href = 'login.html';
    }
}

// Đăng xuất
function logout() {
    fetch('/api/logout', { method: 'POST' })
        .then(response => response.json())
        .then(data => {
            sessionStorage.removeItem('isLoggedIn');
            sessionStorage.removeItem('userEmail');
            window.location.href = 'login.html';
        })
        .catch(error => {
            console.error('Error during logout:', error);
            window.location.href = 'login.html';
        });
}

// Gắn kiểm tra đăng nhập vào mọi trang
document.addEventListener('DOMContentLoaded', checkAuth);