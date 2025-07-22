// Excel Export Utility for Pure HTML/CSS
class ExcelExporter {
    constructor() {
        this.isSheetJSLoaded = false;
        this.loadSheetJS();
    }

    // Load SheetJS library dynamically
    async loadSheetJS() {
        if (window.XLSX || this.isSheetJSLoaded) {
            return Promise.resolve();
        }

        return new Promise((resolve, reject) => {
            const script = document.createElement('script');
            script.src = 'https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.18.5/xlsx.full.min.js';
            script.onload = () => {
                this.isSheetJSLoaded = true;
                console.log('SheetJS loaded successfully');
                resolve();
            };
            script.onerror = () => {
                console.error('Failed to load SheetJS');
                reject(new Error('Failed to load Excel library'));
            };
            document.head.appendChild(script);
        });
    }

    // Export movies data to Excel
    async exportMovies(movies) {
        try {
            await this.loadSheetJS();
            
            if (!movies || movies.length === 0) {
                this.showAlert('Không có dữ liệu phim để xuất', 'warning');
                return;
            }

            const headers = [
                'Mã Phim',
                'Tên Phim', 
                'Thể Loại',
                'Đạo Diễn',
                'Thời Lượng (phút)',
                'Ngày Khởi Chiếu',
                'Độ Tuổi Cho Phép'
            ];

            const data = movies.map(movie => [
                movie.MaPhim || '',
                movie.TenPhim || '',
                movie.TheLoai || '',
                movie.DaoDien || '',
                movie.ThoiLuong || '',
                this.formatDate(movie.NgayKhoiChieu) || '',
                movie.DoTuoiChoPhep || ''
            ]);

            await this.exportDataToExcel(data, headers, 'Danh_Sach_Phim');
            
        } catch (error) {
            console.error('Export movies error:', error);
            this.showAlert('Lỗi khi xuất danh sách phim: ' + error.message, 'danger');
        }
    }

    // Export cinema rooms data to Excel
    async exportCinemaRooms(rooms) {
        try {
            await this.loadSheetJS();
            
            if (!rooms || rooms.length === 0) {
                this.showAlert('Không có dữ liệu phòng chiếu để xuất', 'warning');
                return;
            }

            const headers = [
                'Mã Phòng',
                'Tên Phòng',
                'Số Ghế', 
                'Loại Phòng'
            ];

            const data = rooms.map(room => [
                room.MaPhong || '',
                room.TenPhong || '',
                room.SoGhe || '',
                room.LoaiPhong || ''
            ]);

            await this.exportDataToExcel(data, headers, 'Danh_Sach_Phong_Chieu');
            
        } catch (error) {
            console.error('Export rooms error:', error);
            this.showAlert('Lỗi khi xuất danh sách phòng chiếu: ' + error.message, 'danger');
        }
    }

    // Core export function
    async exportDataToExcel(data, headers, fileName = 'Export') {
        const XLSX = window.XLSX; // Declare the XLSX variable here

        try {
            await this.loadSheetJS();

            // Create workbook
            const wb = XLSX.utils.book_new();

            // Prepare data with headers
            const wsData = [headers, ...data];

            // Create worksheet
            const ws = XLSX.utils.aoa_to_sheet(wsData);

            // Auto-size columns
            const colWidths = [];
            wsData.forEach(row => {
                row.forEach((cell, colIndex) => {
                    const cellLength = cell ? cell.toString().length : 0;
                    colWidths[colIndex] = Math.max(colWidths[colIndex] || 0, cellLength + 2);
                });
            });

            ws['!cols'] = colWidths.map(width => ({ width: Math.min(width, 50) }));

            // Style headers
            const headerRange = XLSX.utils.decode_range(ws['!ref']);
            for (let col = headerRange.s.c; col <= headerRange.e.c; col++) {
                const cellAddress = XLSX.utils.encode_cell({ r: 0, c: col });
                if (!ws[cellAddress]) continue;
                
                ws[cellAddress].s = {
                    font: { bold: true, color: { rgb: "FFFFFF" } },
                    fill: { fgColor: { rgb: "4472C4" } },
                    alignment: { horizontal: "center", vertical: "center" }
                };
            }

            // Add worksheet to workbook
            XLSX.utils.book_append_sheet(wb, ws, 'Sheet1');

            // Generate filename with timestamp
            const timestamp = new Date().toISOString().slice(0, 19).replace(/:/g, '-');
            const fullFileName = `${fileName}_${timestamp}.xlsx`;

            // Write file
            XLSX.writeFile(wb, fullFileName);

            this.showAlert(`Đã xuất file ${fullFileName} thành công!`, 'success');

        } catch (error) {
            console.error('Export data error:', error);
            this.showAlert('Lỗi khi xuất file Excel: ' + error.message, 'danger');
        }
    }

    // Export HTML table directly
    async exportTableToExcel(tableSelector, fileName = 'Table_Export') {
        const XLSX = window.XLSX; // Declare the XLSX variable here

        try {
            await this.loadSheetJS();

            const table = document.querySelector(tableSelector);
            if (!table) {
                throw new Error('Không tìm thấy bảng để xuất');
            }

            // Create workbook
            const wb = XLSX.utils.book_new();

            // Convert table to worksheet
            const ws = XLSX.utils.table_to_sheet(table);

            // Add worksheet to workbook
            XLSX.utils.book_append_sheet(wb, ws, 'Sheet1');

            // Generate filename with timestamp
            const timestamp = new Date().toISOString().slice(0, 19).replace(/:/g, '-');
            const fullFileName = `${fileName}_${timestamp}.xlsx`;

            // Write file
            XLSX.writeFile(wb, fullFileName);

            this.showAlert(`Đã xuất file ${fullFileName} thành công!`, 'success');

        } catch (error) {
            console.error('Export table error:', error);
            this.showAlert('Lỗi khi xuất bảng: ' + error.message, 'danger');
        }
    }

    // Utility functions
    formatDate(dateString) {
        if (!dateString) return '';
        try {
            const date = new Date(dateString);
            return date.toLocaleDateString('vi-VN');
        } catch (error) {
            return dateString;
        }
    }

    showAlert(message, type = 'info') {
        // Try to use existing showAlert function
        if (window.showAlert && typeof window.showAlert === 'function') {
            window.showAlert(message, type);
            return;
        }

        // Fallback alert implementation
        const alertDiv = document.createElement('div');
        alertDiv.className = `alert alert-${type} alert-dismissible fade show position-fixed`;
        alertDiv.style.cssText = `
            top: 20px;
            right: 20px;
            z-index: 9999;
            min-width: 300px;
            max-width: 500px;
        `;
        alertDiv.innerHTML = `
            <strong>${type === 'success' ? 'Thành công!' : type === 'danger' ? 'Lỗi!' : 'Thông báo!'}</strong>
            ${message}
            <button type="button" class="btn-close" onclick="this.parentElement.remove()"></button>
        `;

        document.body.appendChild(alertDiv);

        // Auto remove after 5 seconds
        setTimeout(() => {
            if (alertDiv.parentElement) {
                alertDiv.remove();
            }
        }, 5000);
    }
}

// Create global instance
window.excelExporter = new ExcelExporter();

// Global export functions for easy use
async function exportCurrentMovies() {
    if (window.filteredMovies && window.filteredMovies.length > 0) {
        await window.excelExporter.exportMovies(window.filteredMovies);
    } else if (window.allMovies && window.allMovies.length > 0) {
        await window.excelExporter.exportMovies(window.allMovies);
    } else {
        window.excelExporter.showAlert('Không có dữ liệu phim để xuất', 'warning');
    }
}

async function exportCurrentRooms() {
    if (window.filteredRooms && window.filteredRooms.length > 0) {
        await window.excelExporter.exportCinemaRooms(window.filteredRooms);
    } else if (window.allRooms && window.allRooms.length > 0) {
        await window.excelExporter.exportCinemaRooms(window.allRooms);
    } else {
        window.excelExporter.showAlert('Không có dữ liệu phòng chiếu để xuất', 'warning');
    }
}

async function exportTableToExcel(tableSelector, fileName) {
    await window.excelExporter.exportTableToExcel(tableSelector, fileName);
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
    console.log('Excel Exporter initialized');
});
