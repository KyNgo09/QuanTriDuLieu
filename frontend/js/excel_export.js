// Universal Excel Export - Supports Movies & Cinema Rooms
console.log('📊 Universal Excel Export module loading...');

// Universal Excel Export Class
class UniversalExcelExporter {
    constructor() {
        this.dataConfigs = {
            // Configuration for different data types
            movies: {
                headers: ['Mã Phim', 'Tên Phim', 'Thể Loại', 'Đạo Diễn', 'Thời Lượng (phút)', 'Ngày Khởi Chiếu', 'Độ Tuổi Cho Phép'],
                mapper: (item) => [
                    item.MaPhim || '',
                    item.TenPhim || '',
                    item.TheLoai || '',
                    item.DaoDien || '',
                    item.ThoiLuong || '',
                    this.formatDate(item.NgayKhoiChieu),
                    item.DoTuoiChoPhep || ''
                ],
                fileName: 'Danh_Sach_Phim',
                
            },
            rooms: {
                headers: ['Mã Phòng', 'Tên Phòng', 'Số Ghế', 'Loại Phòng'],
                mapper: (item) => [
                    item.MaPhong || '',
                    item.TenPhong || '',
                    item.SoGhe || '',
                    item.LoaiPhong || ''
                ],
                
            }
        };
    }

    async exportData(data, dataType, customFileName = null) {
        console.log(`🚀 Exporting ${dataType}:`, data?.length, 'items');
        
        if (!data || data.length === 0) {
            console.warn(`❌ No ${dataType} data to export`);
            alert(`Không có dữ liệu ${dataType === 'movies' ? 'phim' : 'phòng chiếu'} để xuất`);
            return;
        }
        
        const config = this.dataConfigs[dataType];
        if (!config) {
            console.error('❌ Unknown data type:', dataType);
            alert('Loại dữ liệu không được hỗ trợ');
            return;
        }
        
        // Load XLSX if needed
        if (!window.XLSX) {
            console.log('📥 Loading XLSX...');
            await this.loadXLSX();
        }
        
        try {
            const headers = config.headers;
            const rows = data.map(config.mapper);
            
            const wb = XLSX.utils.book_new();
            const ws = XLSX.utils.aoa_to_sheet([headers, ...rows]);
            
            // Auto-size columns
            const colWidths = headers.map((_, i) => {
                const maxLen = Math.max(
                    headers[i].length,
                    ...rows.map(row => String(row[i] || '').length)
                );
                return { width: Math.min(maxLen + 2, 50) };
            });
            ws['!cols'] = colWidths;
            
            // Style headers
            const headerRange = XLSX.utils.decode_range(ws['!ref']);
            for (let col = headerRange.s.c; col <= headerRange.e.c; col++) {
                const cellAddress = XLSX.utils.encode_cell({ r: 0, c: col });
                if (ws[cellAddress]) {
                    ws[cellAddress].s = {
                        font: { bold: true, color: { rgb: "FFFFFF" } },
                        fill: { fgColor: { rgb: "4472C4" } },
                        alignment: { horizontal: "center", vertical: "center" }
                    };
                }
            }
            
            XLSX.utils.book_append_sheet(wb, ws, 'Data');
            
            const timestamp = new Date().toISOString().slice(0, 19).replace(/:/g, '-');
            const fileName = customFileName || config.fileName;
            const fullFileName = `${fileName}_${timestamp}.xlsx`;
            
            XLSX.writeFile(wb, fullFileName);
            
            console.log('✅ Export completed:', fullFileName);
            this.showSuccessMessage(`Đã xuất file ${fullFileName} thành công!`);
            
        } catch (error) {
            console.error('❌ Export error:', error);
            this.showErrorMessage('Lỗi khi xuất file: ' + error.message);
        }
    }
    
    async getDataWithFallback(dataSources, apiEndpoint, dataType) {
        console.log(`🔍 Looking for ${dataType} data...`);
        
        // Try local data sources first
        for (const getDataFn of dataSources) {
            try {
                const possibleData = getDataFn();
                if (possibleData && possibleData.length > 0) {
                    console.log(`✅ Found local ${dataType} data:`, possibleData.length, 'items');
                    return possibleData;
                }
            } catch (e) {
                // Continue to next source
            }
        }
        
        // Try API call
        if (apiEndpoint) {
            console.log(`📡 No local ${dataType} data, trying API...`);
            try {
                const response = await fetch(apiEndpoint);
                if (response.ok) {
                    const data = await response.json();
                    console.log(`✅ Got ${dataType} data from API:`, data.length, 'items');
                    return data;
                }
            } catch (error) {
                console.warn(`❌ API failed for ${dataType}:`, error.message);
            }
        }
        
        // Final fallback: sample data
        console.log(`🔄 Using sample ${dataType} data`);
        return this.dataConfigs[dataType].sampleData;
    }
    
    formatDate(dateString) {
        if (!dateString) return '';
        try {
            const date = new Date(dateString);
            return date.toLocaleDateString('vi-VN');
        } catch (error) {
            return dateString;
        }
    }
    
    loadXLSX() {
        return new Promise((resolve, reject) => {
            const script = document.createElement('script');
            script.src = 'https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.18.5/xlsx.full.min.js';
            script.onload = () => {
                console.log('✅ XLSX loaded');
                resolve();
            };
            script.onerror = () => reject(new Error('Failed to load XLSX'));
            document.head.appendChild(script);
        });
    }
    
    showSuccessMessage(message) {
        if (window.showAlert) {
            window.showAlert(message, 'success');
        } else {
            alert(`✅ ${message}`);
        }
    }
    
    showErrorMessage(message) {
        if (window.showAlert) {
            window.showAlert(message, 'danger');
        } else {
            alert(`❌ ${message}`);
        }
    }
}

// Create global instance
window.universalExporter = new UniversalExcelExporter();
async function exportCurrentMovies() {
    console.log('🎬 exportCurrentMovies called');
    
    const movieDataSources = [
        () => window.filteredMovies,
        () => window.allMovies, 
        () => window.filteredPhim,
        () => window.allPhim,
        () => typeof allMovies !== 'undefined' ? allMovies : null,
        () => typeof filteredMovies !== 'undefined' ? filteredMovies : null
    ];
    
    const data = await window.universalExporter.getDataWithFallback(
        movieDataSources,
        'http://127.0.0.1:5000/api/phim/',
        'movies'
    );
    
    await window.universalExporter.exportData(data, 'movies');
}


async function exportCurrentRooms() {
    console.log('🏠 exportCurrentRooms called');
    
    const roomDataSources = [
        () => window.filteredRooms,
        () => window.allRooms,
        () => window.filteredPhong,
        () => window.allPhong,
        () => typeof allRooms !== 'undefined' ? allRooms : null,
        () => typeof filteredRooms !== 'undefined' ? filteredRooms : null
    ];
    
    const data = await window.universalExporter.getDataWithFallback(
        roomDataSources,
        'http://127.0.0.1:5000/api/phong/',
        'rooms'
    );
    
    await window.universalExporter.exportData(data, 'rooms');
}

async function exportCurrentPhongChieu() {
    await exportCurrentRooms();
}

// Movies aliases
window.exportCurrentMovies = exportCurrentMovies;

// Rooms aliases  
window.exportCurrentRooms = exportCurrentRooms;

async function exportData(dataType, customSources = null, customEndpoint = null) {
    console.log(`🔧 Generic export for: ${dataType}`);
    
    const defaultSources = [
        () => window[`filtered${dataType}`],
        () => window[`all${dataType}`]
    ];
    
    const sources = customSources || defaultSources;
    const endpoint = customEndpoint || `http://127.0.0.1:5000/api/${dataType.toLowerCase()}/`;
    
    const data = await window.universalExporter.getDataWithFallback(sources, endpoint, dataType.toLowerCase());
    await window.universalExporter.exportData(data, dataType.toLowerCase());
}

window.exportData = exportData;

function autoDetectAndExport() {
    const currentPage = window.location.pathname;
    console.log('🔍 Auto-detecting page:', currentPage);
    
    if (currentPage.includes('phim')) {
        exportCurrentMovies();
    } else if (currentPage.includes('phong')) {
        exportCurrentRooms();
    } else {
        alert('Không thể tự động nhận diện loại dữ liệu để xuất');
    }
}

window.autoDetectAndExport = autoDetectAndExport;
