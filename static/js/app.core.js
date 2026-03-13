// ==================== app.core.js ====================
// 상수 정의, 전역 변수, 초기화, API 호출, 유틸리티

// ==================== 상수 정의 ====================
        const RESULT_COLUMNS = [
            { key: 'vendor', name: '발주처', width: '70px' },
            { key: 'releaseDate', name: '출고요청일', width: '100px' },
            { key: 'productCode', name: '상품코드', width: '100px' },
            { key: 'productName', name: '상품명', width: '150px' },
            { key: 'skuName', name: 'SKU상품명', width: '150px' },
            { key: 'quantity', name: '수량', width: '50px' },
            { key: 'receiverName', name: '수령인', width: '70px' },
            { key: 'receiverPhone', name: '수령인연락처', width: '110px' },
            { key: 'receiverAddr', name: '수령인주소', width: '200px' },
            { key: 'memo', name: '배송메모', width: '100px' },
            { key: 'senderName', name: '발송인', width: '70px' },
            { key: 'senderPhone', name: '발송인연락처', width: '110px' },
            { key: 'senderAddr', name: '발송인주소', width: '150px' },
            { key: 'orderNo', name: '주문번호', width: '100px' },
            { key: 'deliveryNo', name: '배송번호', width: '100px' },
            { key: 'note', name: '비고', width: '100px' },
            { key: 'sourceFile', name: '원본파일', width: '120px' }
        ];

        const TARGET_COLUMNS = [
            { key: 'convertedDate', name: '파일변환일', width: '90px' },
            { key: 'vendor', name: '발주처', width: '70px' },
            { key: 'releaseDate', name: '출고요청일', width: '100px' },
            { key: 'productCode', name: '상품코드', width: '100px' },
            { key: 'skuName', name: 'SKU상품명', width: '150px' },
            { key: 'packagingComposition', name: '포장&구성', width: '200px' },
            { key: 'quantity', name: '수량', width: '50px' },
            { key: 'receiverName', name: '수령인', width: '70px' },
            { key: 'receiverPhone', name: '수령인연락처', width: '110px' },
            { key: 'receiverAddr', name: '수령인주소', width: '200px' },
            { key: 'memo', name: '배송메모', width: '100px' },
            { key: 'senderName', name: '발송인', width: '70px' },
            { key: 'senderPhone', name: '발송인연락처', width: '110px' },
            { key: 'senderAddr', name: '발송인주소', width: '150px' },
            { key: 'orderNo', name: '주문번호', width: '100px' },
            { key: 'deliveryNo', name: '배송번호', width: '100px' },
            { key: 'note', name: '비고', width: '100px' },
            { key: 'sourceFile', name: '원본파일', width: '120px' }
        ];

        const ORDER_MANAGEMENT_COLUMNS = [
            { key: 'registeredDate', name: '등록일', width: '90px' },
            { key: 'vendor', name: '발주처', width: '70px' },
            { key: 'releaseDate', name: '출고요청일', width: '100px' },
            { key: 'skuName', name: 'SKU상품명', width: '150px' },
            { key: 'quantity', name: '수량', width: '50px' },
            { key: 'receiverName', name: '수령인', width: '70px' },
            { key: 'receiverPhone', name: '수령인연락처', width: '110px' },
            { key: 'receiverAddr', name: '수령인주소', width: '200px' },
            { key: 'memo', name: '배송메세지', width: '120px' },
            { key: 'orderNo', name: '주문번호', width: '100px' },
            { key: 'deliveryNo', name: '배송번호', width: '100px' },
            { key: 'senderName', name: '발송인', width: '70px' },
            { key: 'senderPhone', name: '발송인연락처', width: '110px' },
            { key: 'senderAddr', name: '발송인주소', width: '150px' },
            { key: 'invoiceNo', name: '송장번호', width: '100px' },
            { key: '_shipped', name: '출고', width: '70px' },
            { key: '_paid', name: '결제', width: '70px' },
            { key: '_invoiceIssued', name: '계산서', width: '70px' },
            { key: 'unitPrice', name: '단가', width: '80px' },
            { key: 'note', name: '비고', width: '100px' }
        ];

        const MAPPING_RULES = {
            'orderNo': ['주문번호', '주문코드', '오더번호', '오더코드', 'orderno', 'order_no', 'ordercode'],
            'deliveryNo': ['배송번호', '배송코드', '추가배송', '추가옵션', '옵션번호', '배송순번', 'deliveryno', 'delivery_no'],
            'productCode': ['상품코드', '상품키', '제품코드', '품목코드', 'sku', 'productcode', 'product_code', 'itemcode', 'productkey', '코드', '품번', '제품번호', '상품번호'],
            'productName': ['상품명', '품명', '품목', '품목명', '물품', '물품명', '제품명', 'productname', 'product_name', 'itemname', '내용물', '내품', '물건', '상품', '아이템', '제품', '품'],
            'quantity': ['수량', '주문수량', '상품수', 'qty', 'quantity', '개수', '갯수', '건수', '단위', '박스', 'box', '세트', 'set'],
            'receiverName': ['수령인', '수취인', '받는분', '받는사람', '수령자', '받는분성명', '수취인명', '성명', '이름', '고객명', '수신자', '수신인', '배송자', '고객', '수령인명', '받는분이름', '수취자', '받으시는분', '받으실분'],
            'receiverPhone': ['수령인연락처', '수령인휴대폰', '수령인전화', '받는분연락처', '받는분휴대폰', '수취인연락처', '수취인휴대폰', '수령인핸드폰', '휴대전화', '핸드폰', '휴대폰', '연락처', '전화', '폰번호', 'hp', 'tel', '전화번호', '핸드폰번호', '휴대폰번호', '모바일', 'mobile', 'phone', '받는분전화', '수취인전화'],
            'receiverAddr': ['수령인주소', '받는분주소', '수취인주소', '배송지주소', '배송주소', '배송지', '주소', '도로명주소', '지번주소', '전체주소', '받는곳', '수령지', '수취지', '도착지'],
            'receiverAddrDetail': ['상세주소', '상세', '주소상세', '나머지주소', '세부주소'],
            'senderName': ['발송인', '보내는분', '보내는사람', '발신인', '발송자', '송하인', '발송인명', '보내는분이름', '송신자', '송신인'],
            'senderPhone': ['발송인연락처', '발송인휴대폰', '발송인전화', '보내는분연락처', '보내는분휴대폰', '송하인연락처', '송하인전화', '발신인연락처'],
            'senderAddr': ['발송인주소', '보내는분주소', '발송지주소', '송하인주소', '발신지', '출발지'],
            'ordererName': ['주문자', '주문자명', '주문인', '구매자', '구매자명', '주문고객', '결제자', '신청인', '신청자'],
            'memo': ['배송메모', '배송메세지', '배송메시지', '택배메모', '택배요청', '전달사항', '요청사항', '배송요청', '메모', '특이사항', '요청메모', '배송시요청', '기사메모', '배달메모'],
            'invoiceNo': ['송장번호', '운송장번호', '운송장', '택배번호', 'invoiceno', '송장', '택배송장', '배송번호'],
            'note': ['비고', '참고', '기타', '노트', 'note', 'remark', '특기사항', '추가정보'],
            'releaseDate': ['출고요청일', '출고일', '출고예정일', '출고희망일', '배송요청일', '배송희망일', '발송요청일', '발송희망일', '발송일', '예약출고일', '지정출고일', '출하일', '출하요청일', '배송일', '배송지정일', '희망일', '요청일자', '배송일자', '발송일자']
        };

        const MAPPING_EXCLUDES = {
            'receiverAddr': ['우편번호', '우편', 'zip', '일시', '일자', '날짜', '요청', '지시', '배송요청', '배송지시', '요청일', '지시일', '완료', '시간'],
            'receiverPhone': ['안심번호', '안심', '전화번호_', '_안심'],
            'quantity': ['금액', '가격', '판매', '공급', '결제'],
            'productName': ['코드', 'code'],
            'memo': ['요청일', '지시일', '일자', '일시', '날짜', '출고', '발송']
        };

        // ==================== 전역 변수 ====================
        let currentUser = null;
        let currentUserId = null;
        let userList = [];
        let allUsersData = {};
        let skuProducts = [];
        let partsData = {};
        let partsIdMap = {};
        let packagingData = {};
        let packagingIdMap = {};
        let vendorMappings = [];
        let calendarData = {};
        let currentYear = new Date().getFullYear();
        let currentMonth = new Date().getMonth();
        let selectedDate = null;
        let editingSkuId = null;

        // 발주서 변환 관련
        let workbooks = [];
        let convertedData = [];
        let confirmedData = [];

        // 전체주문관리 관련
        let orderManagementData = [];

        // 필터/정렬 상태
        let confirmedFilters = {};
        let confirmedSort = { key: 'releaseDate', direction: 'asc' };
        let orderManagementFilters = {};
        let orderManagementSort = { key: null, direction: null };

        // 빠른매칭
        let quickMatchIndex = -1;

        // ==================== 초기화 ====================
        document.addEventListener('DOMContentLoaded', function() {
            initializeApp();
        });

        async function initializeApp() {
            try {
                // API로 초기 데이터 로드
                var response = await fetch('/api/init');
                var data = await response.json();

                if (!data || data.error) {
                    updateConnectionStatus(false);
                    return;
                }

                updateConnectionStatus(true);

                // 데이터 저장
                userList = data.users || [];
                if (userList.length > 0 && !currentUser) {
                    currentUser = userList[0].name;
                }

                partsData = {};
                partsIdMap = {};
                (data.parts || []).forEach(function(p) {
                    partsData[p.part_name] = { price: p.price_per_100g, type: p.cost_type };
                    partsIdMap[p.part_name] = p.id;
                });

                packagingData = {};
                packagingIdMap = {};
                (data.packaging || []).forEach(function(p) {
                    packagingData[p.packaging_name] = p.price;
                    packagingIdMap[p.packaging_name] = p.id;
                });

                skuProducts = data.sku_products || [];
                vendorMappings = data.vendor_mappings || [];
                calendarData = data.calendar || {};
                currentYear = data.year || new Date().getFullYear();
                currentMonth = (data.month || new Date().getMonth() + 1) - 1;

                // UI 렌더링
                renderUserMenus();
                renderCalendarWithData(calendarData);
                renderPartsTable();
                renderPackagingTable();
                renderSkuTable();
                renderVendorMappingTable();
                updateVendorSelect();
                updateVendorFilterSelect();
                updateIntegratedUserFilter();
                updatePackagingSelect();
                updateSkuSelect();

            } catch (e) {
                console.error('Initialize error:', e);
                updateConnectionStatus(false);
            }
        }

        // ==================== API 호출 ====================
        async function loadUsers() {
            const res = await fetch('/api/users');
            const data = await res.json();
            userList = data.users || [];
            if (userList.length > 0 && !currentUser) {
                currentUser = userList[0].name;
            }
            updateIntegratedUserFilter();
        }

        async function loadPartsData() {
            const res = await fetch('/api/parts-cost');
            const data = await res.json();
            partsData = {};
            partsIdMap = {};
            (data.parts || []).forEach(p => {
                partsData[p.part_name] = { price: p.price_per_100g, type: p.cost_type };
                partsIdMap[p.part_name] = p.id;
            });
            renderPartsTable();
        }

        async function loadPackagingData() {
            const res = await fetch('/api/packaging-cost');
            const data = await res.json();
            packagingData = {};
            packagingIdMap = {};
            (data.packaging || []).forEach(p => {
                packagingData[p.packaging_name] = p.price;
                packagingIdMap[p.packaging_name] = p.id;
            });
            renderPackagingTable();
            updatePackagingSelect();
        }

        async function loadSkuProducts() {
            const res = await fetch('/api/sku-products');
            const data = await res.json();
            skuProducts = data.products || [];
            renderSkuTable();
            updateSkuSelect();
        }

        async function loadVendorMappingsAll() {
            const res = await fetch('/api/vendor-mappings');
            const data = await res.json();
            vendorMappings = data.mappings || [];
            renderVendorMappingTable();
            updateVendorFilterSelect();
        }

        async function loadCalendarData() {
            const res = await fetch(`/api/dashboard/calendar?year=${currentYear}&month=${currentMonth + 1}`);
            const data = await res.json();
            return data.calendar || {};
        }

        async function loadIntegratedOrders() {
            showLoading();
            const userId = document.getElementById('integrated-user-filter').value;
            const dateFrom = document.getElementById('integrated-date-from').value;
            const dateTo = document.getElementById('integrated-date-to').value;
            const status = document.getElementById('integrated-status-filter').value;

            let url = '/api/integrated-orders?limit=500';
            if (userId) url += `&user_id=${userId}`;
            if (dateFrom) url += `&date_from=${dateFrom}`;
            if (dateTo) url += `&date_to=${dateTo}`;
            if (status === 'pending') url += '&shipped=false';
            if (status === 'shipped') url += '&shipped=true';

            const res = await fetch(url);
            const data = await res.json();
            renderIntegratedOrders(data.orders || [], data.stats || {});
            hideLoading();
        }

        // ==================== 유틸리티 ====================
        function updateConnectionStatus(connected) {
            const el = document.getElementById('connection-status');
            if (!el) return;
            const textEl = el.querySelector('.text');
            if (!textEl) return;
            if (connected) {
                el.classList.add('connected');
                textEl.textContent = 'PostgreSQL 연결됨';
            } else {
                el.classList.remove('connected');
                textEl.textContent = '연결 끊김';
            }
        }

        function escapeHtml(str) {
            if (!str) return '';
            return String(str)
                .replace(/&/g, '&amp;')
                .replace(/</g, '&lt;')
                .replace(/>/g, '&gt;')
                .replace(/"/g, '&quot;');
        }

        function showToast(message, type = 'info') {
            const container = document.getElementById('toast-container');
            const toast = document.createElement('div');
            toast.className = `toast ${type}`;
            toast.textContent = message;
            container.appendChild(toast);
            setTimeout(() => toast.remove(), 3000);
        }

        function showLoading() {
            document.getElementById('loading').classList.add('show');
        }

        function hideLoading() {
            document.getElementById('loading').classList.remove('show');
        }

        function generateId() {
            return Date.now().toString(36) + Math.random().toString(36).substr(2);
        }

        function formatPhone(phone) {
            if (!phone) return '';
            let phoneStr = String(phone).trim();
            let digits = phoneStr.replace(/\D/g, '');

            if (phoneStr.includes('E') || phoneStr.includes('e')) {
                try {
                    const num = parseFloat(phoneStr);
                    if (!isNaN(num)) digits = Math.round(num).toString();
                } catch (e) {}
            }

            if (digits.length === 10 && !digits.startsWith('0')) digits = '0' + digits;

            if (digits.length === 11 && digits.startsWith('01')) {
                return `${digits.slice(0,3)}-${digits.slice(3,7)}-${digits.slice(7)}`;
            } else if (digits.length === 10 && digits.startsWith('01')) {
                return `${digits.slice(0,3)}-${digits.slice(3,6)}-${digits.slice(6)}`;
            } else if (digits.length === 10 && digits.startsWith('02')) {
                return `${digits.slice(0,2)}-${digits.slice(2,6)}-${digits.slice(6)}`;
            } else if (digits.length === 10) {
                return `${digits.slice(0,3)}-${digits.slice(3,6)}-${digits.slice(6)}`;
            } else if (digits.length === 9 && digits.startsWith('02')) {
                return `${digits.slice(0,2)}-${digits.slice(2,5)}-${digits.slice(5)}`;
            } else if (phoneStr.includes('-') && digits.length >= 9) {
                return phoneStr;
            }
            return phoneStr;
        }

        function formatDateValue(value) {
            if (!value) return '';

            if (typeof value === 'number' || (typeof value === 'string' && /^\d+$/.test(value.trim()))) {
                const num = Number(value);
                if (num > 1 && num < 73050) {
                    const excelEpoch = new Date(1899, 11, 30);
                    const date = new Date(excelEpoch.getTime() + num * 24 * 60 * 60 * 1000);
                    const year = date.getFullYear();
                    const month = String(date.getMonth() + 1).padStart(2, '0');
                    const day = String(date.getDate()).padStart(2, '0');
                    return `${year}-${month}-${day}`;
                }
            }

            const str = String(value).trim();
            if (/^\d{4}-\d{2}-\d{2}$/.test(str)) return str;
            if (/^\d{4}\/\d{2}\/\d{2}$/.test(str)) return str.replace(/\//g, '-');
            if (/^\d{4}\.\d{2}\.\d{2}$/.test(str)) return str.replace(/\./g, '-');
            if (/^\d{2}\/\d{2}\/\d{4}$/.test(str)) {
                const parts = str.split('/');
                return `${parts[2]}-${parts[0]}-${parts[1]}`;
            }
            if (/^\d{8}$/.test(str)) return `${str.slice(0,4)}-${str.slice(4,6)}-${str.slice(6,8)}`;

            const parsed = new Date(str);
            if (!isNaN(parsed.getTime())) {
                return `${parsed.getFullYear()}-${String(parsed.getMonth()+1).padStart(2,'0')}-${String(parsed.getDate()).padStart(2,'0')}`;
            }
            return str;
        }

        function formatDateKey(date) {
            const y = date.getFullYear();
            const m = String(date.getMonth() + 1).padStart(2, '0');
            const d = String(date.getDate()).padStart(2, '0');
            return y + '-' + m + '-' + d;
        }

        // ==================== 페이지 네비게이션 ====================
        function showPage(pageId) {
            document.querySelectorAll('.page-content').forEach(el => el.classList.remove('active'));
            document.querySelectorAll('.menu-item').forEach(el => el.classList.remove('active'));

            document.getElementById(pageId)?.classList.add('active');
            document.querySelector(`.menu-item[onclick="showPage('${pageId}')"]`)?.classList.add('active');

            // 페이지별 데이터 로드
            if (pageId === 'integrated-view') loadIntegratedOrders();
            if (pageId === 'vendor-mapping') loadVendorMappings();
        }

        function showUserPage(pageId, userName, userId) {
            currentUser = userName;
            currentUserId = userId;
            document.querySelectorAll('.page-content').forEach(el => el.classList.remove('active'));
            document.getElementById(pageId)?.classList.add('active');

            if (pageId === 'convert') {
                document.getElementById('convert-user-info').textContent = userName + '님의 발주서 변환';
                // 변환결과가 있으면 표시
                if (convertedData.length > 0) {
                    renderConvertResult();
                }
            } else if (pageId === 'confirmed') {
                document.getElementById('confirmed-user-info').textContent = userName + '님의 변환확정 목록';
                renderConfirmed();
            } else if (pageId === 'order-management') {
                document.getElementById('order-user-info').textContent = userName + '님의 전체주문관리';
                loadUserOrders(userId);
            }
        }

        function toggleSidebar() {
            document.getElementById('sidebar').classList.toggle('show');
            document.querySelector('.overlay').classList.toggle('show');
        }

        function loadVendorMappings() {
            renderVendorMappingTable();
        }
