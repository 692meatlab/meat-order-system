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
                    partsData[p.part_name] = { price: p.price_per_100g, type: p.cost_type, grade: p.grade || '' };
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
                partsData[p.part_name] = { price: p.price_per_100g, type: p.cost_type, grade: p.grade || '' };
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

        // ==================== 렌더링 ====================
        function renderUserMenus() {
            const container = document.getElementById('user-menus');
            if (!container) return;

            container.innerHTML = userList.map(user => `
                <div class="user-dropdown">
                    <div class="user-dropdown-header ${currentUser === user.name ? 'active' : ''}"
                         onclick="toggleUserMenu('${user.name}')">
                        <span class="user-name">
                            <span class="icon">👤</span> ${escapeHtml(user.name)}
                        </span>
                        <span class="arrow">▼</span>
                    </div>
                    <div class="user-dropdown-menu" id="user-menu-${user.id}">
                        <div class="menu-item" onclick="showUserPage('convert', '${user.name}', ${user.id})">
                            <span class="icon">📥</span> 발주서 변환
                        </div>
                        <div class="menu-item" onclick="showUserPage('confirmed', '${user.name}', ${user.id})">
                            <span class="icon">✅</span> 변환확정
                            <span class="badge" id="badge-confirmed-${user.id}" style="display:none;">0</span>
                        </div>
                        <div class="menu-item" onclick="showUserPage('order-management', '${user.name}', ${user.id})">
                            <span class="icon">📋</span> 전체주문관리
                            <span class="badge" id="badge-order-${user.id}" style="display:none;">0</span>
                        </div>
                        ${userList.length > 1 ? `
                        <div class="menu-item" style="padding-left: 48px; font-size: 11px; color: #e74c3c; border-top: 1px solid rgba(255,255,255,0.05);" onclick="event.stopPropagation(); deleteUser(${user.id}, '${escapeHtml(user.name)}')">
                            <span class="icon">🗑️</span> 삭제
                        </div>` : ''}
                    </div>
                </div>
            `).join('');
        }

        function toggleUserMenu(userName) {
            currentUser = userName;
            const user = userList.find(u => u.name === userName);
            if (!user) return;

            // 모든 드롭다운 닫기
            document.querySelectorAll('.user-dropdown-header').forEach(el => {
                el.classList.remove('expanded', 'active');
            });
            document.querySelectorAll('.user-dropdown-menu').forEach(el => {
                el.classList.remove('show');
            });

            // 선택한 드롭다운 열기
            const header = document.querySelector(`.user-dropdown-header[onclick="toggleUserMenu('${userName}')"]`);
            const menu = document.getElementById(`user-menu-${user.id}`);
            if (header && menu) {
                header.classList.add('expanded', 'active');
                menu.classList.add('show');
            }
        }

        // 이미 로드된 데이터로 달력 렌더링 (초기 로드용)
        function renderCalendarWithData(data) {
            calendarData = data;
            renderCalendarInternal(data);
        }

        // 월 변경 시 새로 데이터 로드
        async function renderCalendar() {
            showLoading();
            const data = await loadCalendarData();
            calendarData = data;
            renderCalendarInternal(data);
            hideLoading();
        }

        // 실제 달력 렌더링
        function renderCalendarInternal(data) {
            const firstDay = new Date(currentYear, currentMonth, 1);
            const lastDay = new Date(currentYear, currentMonth + 1, 0);
            const prevLastDay = new Date(currentYear, currentMonth, 0);
            const firstDayOfWeek = firstDay.getDay();
            const lastDate = lastDay.getDate();
            const prevLastDate = prevLastDay.getDate();

            document.getElementById('calendar-title').textContent = currentYear + '년 ' + (currentMonth + 1) + '월';

            const grid = document.getElementById('calendar-grid');
            grid.innerHTML = '';

            // 요일 헤더
            const days = ['일', '월', '화', '수', '목', '금', '토'];
            days.forEach((day, index) => {
                const header = document.createElement('div');
                header.className = 'calendar-day-header';
                if (index === 0) header.classList.add('sunday');
                if (index === 6) header.classList.add('saturday');
                header.textContent = day;
                grid.appendChild(header);
            });

            // 이전 달
            for (let i = firstDayOfWeek - 1; i >= 0; i--) {
                const day = prevLastDate - i;
                const cell = createDayCell(currentYear, currentMonth - 1, day, true, data);
                grid.appendChild(cell);
            }

            // 현재 달
            for (let day = 1; day <= lastDate; day++) {
                const cell = createDayCell(currentYear, currentMonth, day, false, data);
                grid.appendChild(cell);
            }

            // 다음 달
            const totalCells = grid.children.length - 7;
            const remainingCells = 42 - totalCells;
            for (let day = 1; day <= remainingCells; day++) {
                const cell = createDayCell(currentYear, currentMonth + 1, day, true, data);
                grid.appendChild(cell);
            }
        }

        function createDayCell(year, month, day, isOtherMonth, calendarData) {
            const cell = document.createElement('div');
            cell.className = 'calendar-day';

            const date = new Date(year, month, day);
            const dateKey = formatDateKey(date);
            const dayOfWeek = date.getDay();

            if (isOtherMonth) cell.classList.add('other-month');
            if (dayOfWeek === 0) cell.classList.add('sunday');
            if (dayOfWeek === 6) cell.classList.add('saturday');

            const today = new Date();
            if (date.toDateString() === today.toDateString()) {
                cell.classList.add('today');
            }

            const numberDiv = document.createElement('div');
            numberDiv.className = 'calendar-day-number';
            numberDiv.textContent = day;
            cell.appendChild(numberDiv);

            const ordersDiv = document.createElement('div');
            ordersDiv.className = 'calendar-day-orders';

            var dayData = calendarData[dateKey];
            if (dayData && dayData.order_count > 0) {
                ordersDiv.innerHTML = '<span class="calendar-order-count">' + dayData.order_count + '건 (' + dayData.total_qty + '개)</span>';
            }

            cell.appendChild(ordersDiv);
            cell.onclick = () => openDayModal(dateKey);

            return cell;
        }

        function formatDateKey(date) {
            const y = date.getFullYear();
            const m = String(date.getMonth() + 1).padStart(2, '0');
            const d = String(date.getDate()).padStart(2, '0');
            return y + '-' + m + '-' + d;
        }

        function renderPartsTable() {
            const container = document.getElementById('parts-table');
            if (!container) return;

            const parts = Object.entries(partsData);
            if (parts.length === 0) {
                container.innerHTML = '<p style="color: #888; text-align: center; padding: 20px;">등록된 부위가 없습니다.</p>';
                return;
            }

            container.innerHTML = `
                <table>
                    <thead>
                        <tr>
                            <th>등급</th>
                            <th>부위명</th>
                            <th>100g당 원가</th>
                            <th>타입</th>
                            <th>작업</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${parts.map(([name, data]) => {
                            const typeLabel = data.type === 'unit' ? '1개당' : '100g당';
                            return `
                            <tr>
                                <td>${escapeHtml(data.grade || '')}</td>
                                <td>${escapeHtml(name)}</td>
                                <td>${(data.price || 0).toLocaleString()}원</td>
                                <td><span class="unit-badge unit-${data.type || 'weight'}">${typeLabel}</span></td>
                                <td>
                                    <button class="btn btn-secondary btn-small" onclick="editPart('${escapeHtml(name)}')">수정</button>
                                    <button class="btn btn-danger btn-small" onclick="deletePart('${escapeHtml(name)}')">삭제</button>
                                    <button class="btn btn-small" style="background:#8e44ad;color:#fff;" onclick="showCostHistory('parts_cost', ${partsIdMap[name] || 0}, '${escapeHtml(name)}')">이력</button>
                                </td>
                            </tr>`;
                        }).join('')}
                    </tbody>
                </table>
            `;
        }

        function renderPackagingTable() {
            const container = document.getElementById('packaging-table');
            if (!container) return;

            const pkgs = Object.entries(packagingData);
            if (pkgs.length === 0) {
                container.innerHTML = '<p style="color: #888; text-align: center; padding: 20px;">등록된 포장재가 없습니다.</p>';
                return;
            }

            container.innerHTML = `
                <table>
                    <thead>
                        <tr>
                            <th>포장재명</th>
                            <th>가격</th>
                            <th>작업</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${pkgs.map(([name, price]) => `
                            <tr>
                                <td>${escapeHtml(name)}</td>
                                <td>${price.toLocaleString()}원</td>
                                <td>
                                    <button class="btn btn-secondary btn-small" onclick="editPackaging('${escapeHtml(name)}')">수정</button>
                                    <button class="btn btn-danger btn-small" onclick="deletePackaging('${escapeHtml(name)}')">삭제</button>
                                    <button class="btn btn-small" style="background:#8e44ad;color:#fff;" onclick="showCostHistory('packaging_cost', ${packagingIdMap[name] || 0}, '${escapeHtml(name)}')">이력</button>
                                </td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            `;
        }

        function renderSkuTable() {
            const container = document.getElementById('sku-table');
            if (!container) return;

            if (skuProducts.length === 0) {
                container.innerHTML = '<p style="color: #888; text-align: center; padding: 20px;">등록된 SKU 상품이 없습니다.</p>';
                return;
            }

            container.innerHTML = `
                <table>
                    <thead>
                        <tr>
                            <th>상품명</th>
                            <th>포장재</th>
                            <th>판매가격</th>
                            <th>구성품</th>
                            <th>현재고</th>
                            <th>최소재고</th>
                            <th>작업</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${skuProducts.map(sku => {
                            var compText = (sku.compositions || []).map(function(c) {
                                return c.part_name + ' ' + c.weight + 'g';
                            }).join(', ') || '-';
                            var inv = inventoryData.find(function(i) { return i.sku_product_id === sku.id; });
                            var curStock = inv ? inv.current_stock : 0;
                            var minStock = inv ? inv.min_stock : 0;
                            var stockStyle = (inv && curStock <= minStock) ? 'color:#e74c3c;font-weight:bold;' : '';
                            return `
                                <tr>
                                    <td>${escapeHtml(sku.sku_name)}</td>
                                    <td>${escapeHtml(sku.packaging || '-')}</td>
                                    <td>${(sku.selling_price || 0).toLocaleString()}원</td>
                                    <td style="max-width: 300px; overflow: hidden; text-overflow: ellipsis;">${escapeHtml(compText)}</td>
                                    <td style="${stockStyle}">${curStock}</td>
                                    <td>${minStock}</td>
                                    <td>
                                        <button class="btn btn-primary btn-small" onclick="editSku(${sku.id})">수정</button>
                                        <button class="btn btn-danger btn-small" onclick="deleteSku(${sku.id})">삭제</button>
                                    </td>
                                </tr>
                            `;
                        }).join('')}
                    </tbody>
                </table>
            `;
        }

        function renderVendorMappingTable() {
            const container = document.getElementById('vendor-mapping-table');
            if (!container) return;

            const vendor = document.getElementById('vendor-filter')?.value || '';
            const filtered = vendor ? vendorMappings.filter(m => m.vendor_name === vendor) : vendorMappings;

            if (filtered.length === 0) {
                container.innerHTML = '<p style="color: #888; text-align: center; padding: 20px;">등록된 매핑이 없습니다.</p>';
                return;
            }

            container.innerHTML = `
                <table>
                    <thead>
                        <tr>
                            <th>거래처</th>
                            <th>상품코드</th>
                            <th>거래처 상품명</th>
                            <th>매칭 SKU</th>
                            <th>작업</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${filtered.map(m => `
                            <tr>
                                <td>${escapeHtml(m.vendor_name)}</td>
                                <td>${escapeHtml(m.product_code || '-')}</td>
                                <td>${escapeHtml(m.product_name || '-')}</td>
                                <td>${escapeHtml(m.sku_name || '미매칭')}</td>
                                <td>
                                    <button class="btn btn-danger btn-small" onclick="deleteMapping(${m.id})">삭제</button>
                                </td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            `;
        }

        function renderIntegratedOrders(orders, stats) {
            const summaryEl = document.getElementById('integrated-summary');
            const tableEl = document.getElementById('integrated-table');

            summaryEl.innerHTML = `
                <div class="summary-item"><span class="label">전체:</span><span class="value">${stats.total || 0}건</span></div>
                <div class="summary-item"><span class="label">출고완료:</span><span class="value">${stats.shipped_count || 0}건</span></div>
                <div class="summary-item"><span class="label">입금완료:</span><span class="value">${stats.paid_count || 0}건</span></div>
            `;

            if (orders.length === 0) {
                tableEl.innerHTML = '<p style="color: #888; text-align: center; padding: 20px;">조회된 주문이 없습니다.</p>';
                return;
            }

            tableEl.innerHTML = `
                <table>
                    <thead>
                        <tr>
                            <th>출고일</th>
                            <th>담당자</th>
                            <th>거래처</th>
                            <th>SKU</th>
                            <th>수량</th>
                            <th>수령인</th>
                            <th>출고</th>
                            <th>입금</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${orders.map(o => `
                            <tr>
                                <td>${o.release_date ? new Date(o.release_date).toLocaleDateString('ko-KR') : '-'}</td>
                                <td>${escapeHtml(o.user_name || '-')}</td>
                                <td>${escapeHtml(o.vendor_name || '-')}</td>
                                <td>${escapeHtml(o.sku_name || '-')}</td>
                                <td>${o.quantity}</td>
                                <td>${escapeHtml(o.recipient || '-')}</td>
                                <td><span class="status-badge ${o.shipped ? 'shipped' : 'not-shipped'}">${o.shipped ? '출고' : '미출고'}</span></td>
                                <td><span class="status-badge ${o.paid ? 'paid' : 'not-paid'}">${o.paid ? '입금' : '미입금'}</span></td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            `;
        }

        // ==================== 기간별 발주량 계산 ====================
        async function calculateRangeOrder() {
            const startStr = document.getElementById('range-start').value;
            const endStr = document.getElementById('range-end').value;

            if (!startStr || !endStr) {
                showToast('시작일과 종료일을 선택해주세요.', 'error');
                return;
            }

            showLoading();
            const res = await fetch(`/api/dashboard/range-orders?start=${startStr}&end=${endStr}`);
            const data = await res.json();
            hideLoading();

            const skuSummary = data.sku_summary || [];
            if (skuSummary.length === 0) {
                document.getElementById('range-result').innerHTML = '<div class="status show info">선택한 기간에 등록된 배송이 없습니다.</div>';
                return;
            }

            let html = '<div class="result-box"><h3>발주량 계산 결과</h3>';

            // 주문 목록
            html += '<h4>주문 목록</h4>';
            html += `<table style="width: 100%; border-collapse: collapse; font-size: 13px;">
                <thead>
                    <tr style="background: #f5f5f5;">
                        <th style="padding: 8px; border: 1px solid #ddd;">SKU</th>
                        <th style="padding: 8px; border: 1px solid #ddd; text-align: center;">주문건수</th>
                        <th style="padding: 8px; border: 1px solid #ddd; text-align: center;">총수량</th>
                    </tr>
                </thead>
                <tbody>
                    ${skuSummary.map(item => `
                        <tr>
                            <td style="padding: 8px; border: 1px solid #ddd;">${escapeHtml(item.sku_name || '-')}</td>
                            <td style="padding: 8px; border: 1px solid #ddd; text-align: center;">${item.order_count}건</td>
                            <td style="padding: 8px; border: 1px solid #ddd; text-align: center; font-weight: 600;">${item.total_qty}개</td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>`;

            // 부위별 집계 (SKU 구성품 기반)
            const partTotals = {};
            skuSummary.forEach(item => {
                const sku = skuProducts.find(s => s.sku_name === item.sku_name);
                if (sku && sku.compositions) {
                    sku.compositions.forEach(comp => {
                        const key = comp.part_name;
                        if (!partTotals[key]) {
                            partTotals[key] = { weight: 0, packs: 0 };
                        }
                        partTotals[key].weight += comp.weight * item.total_qty;
                        partTotals[key].packs += item.total_qty;
                    });
                }
            });

            if (Object.keys(partTotals).length > 0) {
                html += '<div style="display: flex; gap: 16px; flex-wrap: wrap; margin-top: 16px;">';

                // 패킹 수량
                html += '<div style="flex: 1; min-width: 200px;">';
                html += '<h4>패킹 수량</h4>';
                html += `<table style="width: 100%; border-collapse: collapse; font-size: 13px;">
                    <thead>
                        <tr style="background: #f5f5f5;">
                            <th style="padding: 6px; border: 1px solid #ddd;">품목</th>
                            <th style="padding: 6px; border: 1px solid #ddd; text-align: center;">수량</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${Object.entries(partTotals).map(([part, data]) => `
                            <tr>
                                <td style="padding: 6px; border: 1px solid #ddd;">${escapeHtml(part)}</td>
                                <td style="padding: 6px; border: 1px solid #ddd; text-align: center; font-weight: 600;">${data.packs}팩</td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table></div>`;

                // 총 중량
                html += '<div style="flex: 1; min-width: 200px;">';
                html += '<h4>총 중량</h4>';
                html += `<table style="width: 100%; border-collapse: collapse; font-size: 13px;">
                    <thead>
                        <tr style="background: #f5f5f5;">
                            <th style="padding: 6px; border: 1px solid #ddd;">품목</th>
                            <th style="padding: 6px; border: 1px solid #ddd; text-align: center;">kg</th>
                            <th style="padding: 6px; border: 1px solid #ddd; text-align: center;">g</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${Object.entries(partTotals).map(([part, data]) => `
                            <tr>
                                <td style="padding: 6px; border: 1px solid #ddd;">${escapeHtml(part)}</td>
                                <td style="padding: 6px; border: 1px solid #ddd; text-align: center; font-weight: 600;">${(data.weight / 1000).toFixed(2)}</td>
                                <td style="padding: 6px; border: 1px solid #ddd; text-align: center;">${data.weight.toLocaleString()}</td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table></div>`;

                html += '</div>';
            }

            html += '</div>';
            document.getElementById('range-result').innerHTML = html;
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

        function loadUserConfirmed(userId) {
            // 확정 데이터는 클라이언트 메모리(confirmedData)에서 관리
            renderConfirmed();
        }

        async function loadUserOrders(userId) {
            showLoading();
            try {
                const dateFrom = document.getElementById('order-date-from')?.value || '';
                const dateTo = document.getElementById('order-date-to')?.value || '';
                let url = `/api/orders?user_id=${userId || currentUserId}&limit=500`;
                if (dateFrom) url += `&date_from=${dateFrom}`;
                if (dateTo) url += `&date_to=${dateTo}`;

                const res = await fetch(url);
                const data = await res.json();
                orderManagementData = (data.orders || []).map(o => ({
                    _id: o.id,
                    _selected: false,
                    registeredDate: o.created_at ? o.created_at.split('T')[0] : '',
                    vendor: o.vendor_name || '',
                    releaseDate: o.release_date || '',
                    productCode: o.product_code || '',
                    skuName: o.sku_name || '',
                    productName: o.product_name || '',
                    quantity: o.quantity || 1,
                    receiverName: o.recipient || '',
                    receiverPhone: o.phone || '',
                    receiverAddr: o.address || '',
                    memo: o.memo || '',
                    orderNo: o.order_no || '',
                    deliveryNo: o.delivery_no || '',
                    senderName: o.sender_name || '',
                    senderPhone: o.sender_phone || '',
                    senderAddr: o.sender_addr || '',
                    invoiceNo: o.invoice_no || '',
                    _shipped: o.shipped || false,
                    _paid: o.paid || false,
                    _invoiceIssued: o.invoice_issued || false,
                    unitPrice: o.unit_price || 0,
                    note: o.note || '',
                    _bTypeDownloaded: o.b_type_downloaded || false
                }));
                renderOrderManagement();
            } catch (e) {
                console.error('주문 로드 실패:', e);
                showToast('주문 데이터 로드 실패', 'error');
            }
            hideLoading();
        }

        // ==================== 모달 ====================
        function openDayModal(dateKey) {
            selectedDate = dateKey;
            const [year, month, day] = dateKey.split('-');
            document.getElementById('day-modal-title').textContent = year + '년 ' + parseInt(month) + '월 ' + parseInt(day) + '일';
            document.getElementById('day-orders-list').innerHTML = '<p style="color: #888;">주문 정보를 불러오는 중...</p>';
            document.getElementById('day-calculation-result').innerHTML = '';
            document.getElementById('day-modal').classList.add('show');

            loadDayOrders(dateKey);
        }

        async function loadDayOrders(dateKey) {
            const res = await fetch(`/api/integrated-orders?date_from=${dateKey}&date_to=${dateKey}&shipped=false`);
            const data = await res.json();
            const orders = data.orders || [];

            const container = document.getElementById('day-orders-list');
            if (orders.length === 0) {
                container.innerHTML = '<p style="color: #888; text-align: center;">등록된 배송이 없습니다.</p>';
                return;
            }

            container.innerHTML = orders.map(o => `
                <div style="display: flex; justify-content: space-between; align-items: center; padding: 12px; background: ${o.shipped ? '#e8f5e9' : '#fff3e0'}; border-radius: 8px; margin-bottom: 8px;">
                    <div>
                        <div style="font-weight: 600;">${escapeHtml(o.vendor_name || '')} - ${escapeHtml(o.recipient || '')}</div>
                        <div style="color: #666; font-size: 13px;">${escapeHtml(o.sku_name || '')}</div>
                    </div>
                    <div style="font-weight: 700; font-size: 18px;">${o.quantity}</div>
                    <span class="status-badge ${o.shipped ? 'shipped' : 'not-shipped'}">${o.shipped ? '출고완료' : '미출고'}</span>
                </div>
            `).join('');
        }

        function closeDayModal() {
            document.getElementById('day-modal').classList.remove('show');
            selectedDate = null;
        }

        async function calculateDayOrder() {
            if (!selectedDate) return;
            await calculateRangeOrderInternal(selectedDate, selectedDate, 'day-calculation-result');
        }

        async function calculateRangeOrderInternal(start, end, targetId) {
            const res = await fetch(`/api/dashboard/range-orders?start=${start}&end=${end}`);
            const data = await res.json();
            const skuSummary = data.sku_summary || [];

            if (skuSummary.length === 0) {
                document.getElementById(targetId).innerHTML = '<div class="status show info">주문이 없습니다.</div>';
                return;
            }

            // 부위별 집계
            const partTotals = {};
            skuSummary.forEach(item => {
                const sku = skuProducts.find(s => s.sku_name === item.sku_name);
                if (sku && sku.compositions) {
                    sku.compositions.forEach(comp => {
                        const key = comp.part_name;
                        if (!partTotals[key]) partTotals[key] = { weight: 0, packs: 0 };
                        partTotals[key].weight += comp.weight * item.total_qty;
                        partTotals[key].packs += item.total_qty;
                    });
                }
            });

            let html = '<div class="result-box" style="margin-top: 16px;"><h4>발주량 계산 결과</h4>';
            html += `<table style="width: 100%; border-collapse: collapse; font-size: 13px; margin-top: 8px;">
                <thead><tr style="background: #f5f5f5;">
                    <th style="padding: 6px; border: 1px solid #ddd;">품목</th>
                    <th style="padding: 6px; border: 1px solid #ddd; text-align: center;">수량</th>
                    <th style="padding: 6px; border: 1px solid #ddd; text-align: center;">총중량</th>
                </tr></thead>
                <tbody>
                    ${Object.entries(partTotals).map(([part, data]) => `
                        <tr>
                            <td style="padding: 6px; border: 1px solid #ddd;">${escapeHtml(part)}</td>
                            <td style="padding: 6px; border: 1px solid #ddd; text-align: center;">${data.packs}팩</td>
                            <td style="padding: 6px; border: 1px solid #ddd; text-align: center;">${(data.weight / 1000).toFixed(2)}kg</td>
                        </tr>
                    `).join('')}
                </tbody>
            </table></div>`;

            document.getElementById(targetId).innerHTML = html;
        }

        function openAddUserModal() {
            document.getElementById('new-user-name').value = '';
            document.getElementById('user-modal').classList.add('show');
        }

        function closeUserModal() {
            document.getElementById('user-modal').classList.remove('show');
        }

        async function addUser() {
            const name = document.getElementById('new-user-name').value.trim();
            if (!name) {
                showToast('사용자 이름을 입력하세요.', 'error');
                return;
            }

            showLoading();
            try {
                await fetch('/api/users', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ name, role: 'user' })
                });
                await loadUsers();
                renderUserMenus();
                closeUserModal();
                showToast('사용자가 추가되었습니다.', 'success');
            } catch (e) {
                showToast('사용자 추가 실패', 'error');
            }
            hideLoading();
        }

        async function deleteUser(userId, userName) {
            if (userList.length <= 1) {
                alert('최소 1명의 사용자가 필요합니다.');
                return;
            }
            if (!confirm(`"${userName}" 사용자를 삭제하시겠습니까?`)) return;

            showLoading();
            try {
                await fetch(`/api/users/${userId}`, { method: 'DELETE' });
                await loadUsers();
                renderUserMenus();
                if (currentUser === userName && userList.length > 0) {
                    showUserPage('convert', userList[0].name, userList[0].id);
                }
                showToast('사용자가 삭제되었습니다.', 'success');
            } catch (e) {
                showToast('사용자 삭제 실패', 'error');
            }
            hideLoading();
        }

        function openAddPartModal() {
            document.getElementById('part-name').value = '';
            document.getElementById('part-price').value = '';
            document.getElementById('part-modal').classList.add('show');
        }

        function closePartModal() {
            document.getElementById('part-modal').classList.remove('show');
        }

        async function savePart() {
            const grade = document.getElementById('part-grade') ? document.getElementById('part-grade').value.trim() : '';
            const name = document.getElementById('part-name').value.trim();
            const price = parseInt(document.getElementById('part-price').value) || 0;

            if (!name) {
                showToast('부위명을 입력하세요.', 'error');
                return;
            }

            showLoading();
            try {
                await fetch('/api/parts-cost', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ part_name: name, price_per_100g: price, cost_type: 'weight', grade })
                });
                await loadPartsData();
                closePartModal();
                showToast('부위가 저장되었습니다.', 'success');
            } catch (e) {
                showToast('저장 실패', 'error');
            }
            hideLoading();
        }

        async function editPart(name) {
            const data = partsData[name];
            if (!data) { showToast('수정할 부위를 찾을 수 없습니다.', 'error'); return; }
            const id = partsIdMap[name];
            if (!id) { showToast('수정할 부위를 찾을 수 없습니다.', 'error'); return; }

            const currentPrice = typeof data === 'number' ? data : data.price;
            const currentType = typeof data === 'number' ? 'weight' : (data.type || 'weight');
            const currentGrade = data.grade || '';

            const newGrade = prompt('등급을 입력하세요 (예: 1++, 1+, 1, 2):', currentGrade);
            if (newGrade === null) return;

            const newName = prompt('부위명을 입력하세요:', name);
            if (newName === null) return;
            if (!newName.trim()) { alert('부위명을 입력해주세요.'); return; }

            const typeLabel = currentType === 'weight' ? '중량(100g당)' : '개수(1개당)';
            const changeType = confirm(`현재 단위: ${typeLabel}\n\n단위를 변경하시겠습니까?\n[확인] = 변경 / [취소] = 유지`);
            const newType = changeType ? (currentType === 'weight' ? 'unit' : 'weight') : currentType;
            const priceLabel = newType === 'weight' ? '100g당' : '1개당';

            const newPrice = prompt(`${priceLabel} 단가를 입력하세요:`, currentPrice);
            if (newPrice === null) return;
            const priceNum = parseInt(newPrice);
            if (isNaN(priceNum) || priceNum < 0) { alert('올바른 단가를 입력해주세요.'); return; }

            try {
                await fetch(`/api/parts-cost/${id}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ part_name: newName.trim(), price_per_100g: priceNum, cost_type: newType, grade: newGrade.trim() })
                });
                showToast(`'${newName.trim()}' 품목이 수정되었습니다.`, 'success');
                await loadPartsData();
            } catch (e) {
                showToast('수정 실패', 'error');
            }
        }

        async function deletePart(name) {
            if (!confirm(`"${name}" 부위를 삭제하시겠습니까?`)) return;
            const id = partsIdMap[name];
            if (!id) { showToast('삭제할 부위를 찾을 수 없습니다.', 'error'); return; }
            try {
                await fetch(`/api/parts-cost/${id}`, { method: 'DELETE' });
                showToast('삭제되었습니다.', 'success');
                await loadPartsData();
            } catch (e) {
                showToast('삭제 실패', 'error');
            }
        }

        function openAddPackagingModal() {
            document.getElementById('packaging-name').value = '';
            document.getElementById('packaging-price').value = '';
            document.getElementById('packaging-modal').classList.add('show');
        }

        function closePackagingModal() {
            document.getElementById('packaging-modal').classList.remove('show');
        }

        async function savePackaging() {
            const name = document.getElementById('packaging-name').value.trim();
            const price = parseInt(document.getElementById('packaging-price').value) || 0;

            if (!name) {
                showToast('포장재명을 입력하세요.', 'error');
                return;
            }

            showLoading();
            try {
                await fetch('/api/packaging-cost', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ packaging_name: name, price })
                });
                await loadPackagingData();
                closePackagingModal();
                showToast('포장재가 저장되었습니다.', 'success');
            } catch (e) {
                showToast('저장 실패', 'error');
            }
            hideLoading();
        }

        async function editPackaging(name) {
            const currentPrice = packagingData[name];
            if (currentPrice === undefined) { showToast('수정할 포장재를 찾을 수 없습니다.', 'error'); return; }
            const id = packagingIdMap[name];
            if (!id) { showToast('수정할 포장재를 찾을 수 없습니다.', 'error'); return; }

            const newName = prompt('포장방법명을 입력하세요:', name);
            if (newName === null) return;
            if (!newName.trim()) { alert('포장방법명을 입력해주세요.'); return; }

            const newPrice = prompt('포장 비용을 입력하세요:', currentPrice);
            if (newPrice === null) return;
            const priceNum = parseInt(newPrice);
            if (isNaN(priceNum) || priceNum < 0) { alert('올바른 가격을 입력해주세요.'); return; }

            try {
                await fetch(`/api/packaging-cost/${id}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ packaging_name: newName.trim(), price: priceNum })
                });
                showToast(`'${newName.trim()}' 포장방법이 수정되었습니다.`, 'success');
                await loadPackagingData();
            } catch (e) {
                showToast('수정 실패', 'error');
            }
        }

        async function deletePackaging(name) {
            if (!confirm(`"${name}" 포장재를 삭제하시겠습니까?`)) return;
            const id = packagingIdMap[name];
            if (!id) { showToast('삭제할 포장재를 찾을 수 없습니다.', 'error'); return; }
            try {
                await fetch(`/api/packaging-cost/${id}`, { method: 'DELETE' });
                showToast('삭제되었습니다.', 'success');
                await loadPackagingData();
            } catch (e) {
                showToast('삭제 실패', 'error');
            }
        }

        function openAddSkuModal() {
            editingSkuId = null;
            document.getElementById('sku-modal-title').textContent = 'SKU 상품 추가';
            document.getElementById('sku-name').value = '';
            document.getElementById('sku-price').value = '';
            document.getElementById('composition-list').innerHTML = '';
            addCompositionRow();
            document.getElementById('sku-modal').classList.add('show');
        }

        function closeSkuModal() {
            document.getElementById('sku-modal').classList.remove('show');
        }

        function addCompositionRow() {
            const container = document.getElementById('composition-list');
            const row = document.createElement('div');
            row.className = 'form-row';
            row.style.marginBottom = '8px';
            row.innerHTML = `
                <div class="form-group" style="flex: 2;">
                    <select class="comp-part">
                        <option value="">부위 선택</option>
                        ${Object.keys(partsData).map(p => `<option value="${escapeHtml(p)}">${escapeHtml(p)}</option>`).join('')}
                    </select>
                </div>
                <div class="form-group" style="flex: 1;">
                    <input type="number" class="comp-weight" placeholder="중량(g)">
                </div>
                <button type="button" class="btn btn-danger btn-small" onclick="this.parentElement.remove()">X</button>
            `;
            container.appendChild(row);
        }

        async function saveSku() {
            const name = document.getElementById('sku-name').value.trim();
            const packaging = document.getElementById('sku-packaging').value;
            const price = parseInt(document.getElementById('sku-price').value) || 0;

            if (!name) {
                showToast('상품명을 입력하세요.', 'error');
                return;
            }

            const compositions = [];
            document.querySelectorAll('#composition-list .form-row').forEach(row => {
                const part = row.querySelector('.comp-part').value;
                const weight = parseInt(row.querySelector('.comp-weight').value) || 0;
                if (part && weight > 0) {
                    compositions.push({ part_name: part, weight, composition_type: 'weight' });
                }
            });

            showLoading();
            try {
                const method = editingSkuId ? 'PUT' : 'POST';
                const url = editingSkuId ? `/api/sku-products/${editingSkuId}` : '/api/sku-products';

                await fetch(url, {
                    method,
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ sku_name: name, packaging, selling_price: price, compositions })
                });
                await loadSkuProducts();
                closeSkuModal();
                showToast('SKU 상품이 저장되었습니다.', 'success');
            } catch (e) {
                showToast('저장 실패', 'error');
            }
            hideLoading();
        }

        function editSku(id) {
            const sku = skuProducts.find(s => s.id === id);
            if (!sku) return;

            editingSkuId = id;
            document.getElementById('sku-modal-title').textContent = 'SKU 상품 수정';
            document.getElementById('sku-name').value = sku.sku_name;
            document.getElementById('sku-packaging').value = sku.packaging || '';
            document.getElementById('sku-price').value = sku.selling_price || '';

            const container = document.getElementById('composition-list');
            container.innerHTML = '';
            (sku.compositions || []).forEach(comp => {
                addCompositionRow();
                const rows = container.querySelectorAll('.form-row');
                const lastRow = rows[rows.length - 1];
                lastRow.querySelector('.comp-part').value = comp.part_name;
                lastRow.querySelector('.comp-weight').value = comp.weight;
            });

            document.getElementById('sku-modal').classList.add('show');
        }

        async function deleteSku(id) {
            if (!confirm('이 SKU 상품을 삭제하시겠습니까?')) return;
            showLoading();
            try {
                await fetch(`/api/sku-products/${id}`, { method: 'DELETE' });
                await loadSkuProducts();
                showToast('삭제되었습니다.', 'success');
            } catch (e) {
                showToast('삭제 실패', 'error');
            }
            hideLoading();
        }

        function openAddMappingModal() {
            document.getElementById('mapping-vendor').value = '';
            document.getElementById('mapping-code').value = '';
            document.getElementById('mapping-product-name').value = '';
            document.getElementById('mapping-sku').value = '';
            document.getElementById('mapping-modal').classList.add('show');
        }

        function closeMappingModal() {
            document.getElementById('mapping-modal').classList.remove('show');
        }

        async function saveMapping() {
            const vendor = document.getElementById('mapping-vendor').value.trim();
            const code = document.getElementById('mapping-code').value.trim();
            const productName = document.getElementById('mapping-product-name').value.trim();
            const skuId = document.getElementById('mapping-sku').value;

            if (!vendor) {
                showToast('거래처명을 입력하세요.', 'error');
                return;
            }

            showLoading();
            try {
                await fetch('/api/vendor-mappings', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        vendor_name: vendor,
                        product_code: code,
                        product_name: productName,
                        sku_product_id: skuId ? parseInt(skuId) : null
                    })
                });
                await loadVendorMappingsAll();
                closeMappingModal();
                showToast('매핑이 저장되었습니다.', 'success');
            } catch (e) {
                showToast('저장 실패', 'error');
            }
            hideLoading();
        }

        async function deleteMapping(id) {
            if (!confirm('이 매핑을 삭제하시겠습니까?')) return;
            showLoading();
            try {
                await fetch(`/api/vendor-mappings/${id}`, { method: 'DELETE' });
                await loadVendorMappingsAll();
                showToast('삭제되었습니다.', 'success');
            } catch (e) {
                showToast('삭제 실패', 'error');
            }
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

        function updateVendorSelect() {
            const vendors = [...new Set(vendorMappings.map(m => m.vendor_name))];
            const select = document.getElementById('vendor-name');
            if (select) {
                select.innerHTML = '<option value="">발주처를 선택하세요</option>' +
                    vendors.map(v => `<option value="${escapeHtml(v)}">${escapeHtml(v)}</option>`).join('');
            }
        }

        function updateVendorFilterSelect() {
            const vendors = [...new Set(vendorMappings.map(m => m.vendor_name))];
            const select = document.getElementById('vendor-filter');
            if (select) {
                select.innerHTML = '<option value="">전체</option>' +
                    vendors.map(v => `<option value="${escapeHtml(v)}">${escapeHtml(v)}</option>`).join('');
            }
        }

        function updateIntegratedUserFilter() {
            const select = document.getElementById('integrated-user-filter');
            if (select) {
                select.innerHTML = '<option value="">전체</option>' +
                    userList.map(u => `<option value="${u.id}">${escapeHtml(u.name)}</option>`).join('');
            }
        }

        function updatePackagingSelect() {
            const select = document.getElementById('sku-packaging');
            if (select) {
                select.innerHTML = '<option value="">포장재 선택</option>' +
                    Object.keys(packagingData).map(p => `<option value="${escapeHtml(p)}">${escapeHtml(p)}</option>`).join('');
            }
        }

        function updateSkuSelect() {
            const select = document.getElementById('mapping-sku');
            if (select) {
                select.innerHTML = '<option value="">SKU 선택</option>' +
                    skuProducts.map(s => `<option value="${s.id}">${escapeHtml(s.sku_name)}</option>`).join('');
            }
        }

        function changeMonth(delta) {
            currentMonth += delta;
            if (currentMonth < 0) {
                currentMonth = 11;
                currentYear--;
            } else if (currentMonth > 11) {
                currentMonth = 0;
                currentYear++;
            }
            renderCalendar();
        }

        function goToToday() {
            currentYear = new Date().getFullYear();
            currentMonth = new Date().getMonth();
            renderCalendar();
        }

        function toggleSidebar() {
            document.getElementById('sidebar').classList.toggle('show');
            document.querySelector('.overlay').classList.toggle('show');
        }

        function showLoading() {
            document.getElementById('loading').classList.add('show');
        }

        function hideLoading() {
            document.getElementById('loading').classList.remove('show');
        }

        function showToast(message, type = 'info') {
            const container = document.getElementById('toast-container');
            const toast = document.createElement('div');
            toast.className = `toast ${type}`;
            toast.textContent = message;
            container.appendChild(toast);
            setTimeout(() => toast.remove(), 3000);
        }

        function escapeHtml(str) {
            if (!str) return '';
            return String(str)
                .replace(/&/g, '&amp;')
                .replace(/</g, '&lt;')
                .replace(/>/g, '&gt;')
                .replace(/"/g, '&quot;');
        }

        function downloadIntegratedExcel() {
            const tableEl = document.getElementById('integrated-table');
            const table = tableEl?.querySelector('table');
            if (!table) { showToast('다운로드할 데이터가 없습니다.', 'error'); return; }

            const ws = XLSX.utils.table_to_sheet(table);
            const wb = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(wb, ws, '통합조회');

            const today = new Date();
            const dateStr = `${today.getFullYear()}${String(today.getMonth()+1).padStart(2,'0')}${String(today.getDate()).padStart(2,'0')}`;
            XLSX.writeFile(wb, `통합조회_${dateStr}.xlsx`);
            showToast('엑셀 다운로드 완료', 'success');
        }

        function loadVendorMappings() {
            renderVendorMappingTable();
        }

        // ==================== 발주서 변환 ====================
        const uploadArea = document.getElementById('upload-area');
        const fileInput = document.getElementById('file-input');

        if (uploadArea) {
            uploadArea.onclick = () => fileInput.click();
            uploadArea.ondragover = (e) => { e.preventDefault(); uploadArea.classList.add('dragover'); };
            uploadArea.ondragleave = () => uploadArea.classList.remove('dragover');
            uploadArea.ondrop = (e) => {
                e.preventDefault();
                uploadArea.classList.remove('dragover');
                handleFiles(e.dataTransfer.files);
            };
        }

        if (fileInput) {
            fileInput.onchange = () => handleFiles(fileInput.files);
        }

        function handleFiles(files) {
            if (files.length === 0) return;
            workbooks = [];
            const names = [];
            let loadedCount = 0;

            Array.from(files).forEach(file => {
                names.push(file.name);
                const reader = new FileReader();
                reader.onload = (e) => {
                    try {
                        const wb = XLSX.read(e.target.result, { type: 'array' });
                        workbooks.push({ workbook: wb, fileName: file.name });
                    } catch (err) {
                        console.error('파일 읽기 오류:', file.name, err);
                    }
                    loadedCount++;
                    if (loadedCount === files.length) {
                        document.getElementById('file-info').textContent = `선택됨: ${names.join(', ')}`;
                        document.getElementById('file-info').classList.add('show');
                        document.getElementById('btn-convert').disabled = false;
                    }
                };
                reader.readAsArrayBuffer(file);
            });
        }

        function convertOrders() {
            if (workbooks.length === 0) {
                showToast('먼저 파일을 업로드해주세요.', 'error');
                return;
            }

            const selectedVendor = document.getElementById('vendor-name').value.trim();
            if (!selectedVendor) {
                showToast('발주처를 선택해주세요.', 'error');
                return;
            }

            showLoading();

            try {
                convertedData = [];

                for (const { workbook, fileName } of workbooks) {
                    for (const sheetName of workbook.SheetNames) {
                        const sheet = workbook.Sheets[sheetName];
                        const rawData = XLSX.utils.sheet_to_json(sheet, { header: 1 });

                        const headerInfo = findHeaderRow(rawData);
                        if (!headerInfo) continue;

                        const { headerRowIdx, columns } = headerInfo;
                        const mapping = autoMapColumns(columns);

                        const dataRows = rawData.slice(headerRowIdx + 1).filter(row =>
                            row && row.some(cell => cell !== undefined && cell !== null && cell !== '')
                        );

                        for (const row of dataRows) {
                            const item = convertRow(row, mapping, selectedVendor, fileName);
                            if (item) {
                                const matchedSku = findMatchingSku(item.vendor, item.productCode);
                                if (matchedSku) {
                                    item.skuName = matchedSku.sku_name || matchedSku.skuName;
                                    item._skuMatched = true;
                                    item._skuProductId = matchedSku.id || matchedSku.sku_product_id;
                                } else {
                                    item.skuName = item.productName;
                                    item._skuMatched = false;
                                }
                                convertedData.push(item);
                            }
                        }
                    }
                }

                if (convertedData.length === 0) {
                    showToast('변환할 데이터를 찾지 못했습니다. 엑셀 파일 형식을 확인해주세요.', 'error');
                    hideLoading();
                    return;
                }

                renderConvertResult();
                showToast(`${workbooks.length}개 파일에서 ${convertedData.length}건의 데이터를 변환했습니다.`, 'success');

                // Stage 4: 업로드 이력 저장
                const matchedCount = convertedData.filter(d => d._skuMatched).length;
                const unmatchedCount = convertedData.length - matchedCount;
                const fileNames = workbooks.map(w => w.fileName).join(', ') || selectedVendor;
                saveUploadHistory(fileNames, convertedData.length, matchedCount, unmatchedCount, selectedVendor);

                // 파일 입력 초기화
                workbooks = [];
                fileInput.value = '';
                document.getElementById('file-info').textContent = '';
                document.getElementById('file-info').classList.remove('show');
                document.getElementById('btn-convert').disabled = true;
            } catch (err) {
                showToast('변환 중 오류: ' + err.message, 'error');
                console.error(err);
            }

            hideLoading();
        }

        function confirmConvertedData() {
            const selectedItems = convertedData.filter(item => item._selected);
            if (selectedItems.length === 0) {
                showToast('변환확정할 항목을 선택해주세요.', 'error');
                return;
            }

            const requiredFields = [
                { key: 'productName', name: '상품명' },
                { key: 'quantity', name: '수량' },
                { key: 'receiverName', name: '수령인' },
                { key: 'receiverPhone', name: '수령인연락처' },
                { key: 'receiverAddr', name: '수령인주소' }
            ];

            const missingItems = [];
            selectedItems.forEach((item, idx) => {
                const missingFields = [];
                requiredFields.forEach(field => {
                    const value = item[field.key];
                    if (!value || (typeof value === 'string' && value.trim() === '')) {
                        missingFields.push(field.name);
                    }
                });
                if (missingFields.length > 0) {
                    missingItems.push({ index: idx + 1, fields: missingFields });
                }
            });

            if (missingItems.length > 0) {
                const errorMsg = missingItems.slice(0, 5).map(item =>
                    `${item.index}번째 항목: ${item.fields.join(', ')} 누락`
                ).join('\n');
                const moreMsg = missingItems.length > 5 ? `\n...외 ${missingItems.length - 5}건` : '';
                alert(`필수값이 누락된 항목이 있습니다.\n\n${errorMsg}${moreMsg}\n\n상품명, 수량, 수령인, 수령인연락처, 수령인주소는 필수입니다.`);
                return;
            }

            const today = new Date();
            const convertedDate = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;

            selectedItems.forEach(item => {
                const newItem = { ...item, _selected: true, _id: generateId(), convertedDate };
                if (!newItem.productCode && newItem.productName) {
                    newItem.productCode = newItem.productName;
                }
                const matchedSku = findMatchingSku(newItem.vendor, newItem.productCode);
                if (matchedSku) {
                    newItem.skuName = matchedSku.sku_name || matchedSku.skuName;
                    newItem._skuMatched = true;
                    newItem._skuProductId = matchedSku.id || matchedSku.sku_product_id;
                } else {
                    newItem.skuName = newItem.productName;
                    newItem._skuMatched = false;
                }
                confirmedData.push(newItem);
            });

            convertedData = convertedData.filter(item => !item._selected);
            renderConvertResult();
            showToast(`${selectedItems.length}건이 변환확정 목록에 추가되었습니다.`, 'success');

            setTimeout(() => {
                showUserPage('confirmed', currentUser, currentUserId);
            }, 500);
        }

        async function registerOrders() {
            const selectedItems = confirmedData.filter(item => item._selected);
            if (selectedItems.length === 0) {
                showToast('등록할 항목을 선택해주세요.', 'error');
                return;
            }

            if (!currentUserId) {
                showToast('사용자를 먼저 선택해주세요.', 'error');
                return;
            }

            showLoading();
            try {
                const orders = selectedItems.map(item => {
                    const skuId = item._skuProductId || null;
                    return {
                        user_id: currentUserId,
                        vendor_name: item.vendor || '',
                        sku_product_id: skuId,
                        sku_name: item.skuName || item.productName || '',
                        product_name: item.productName || '',
                        product_code: item.productCode || '',
                        quantity: parseInt(item.quantity) || 1,
                        recipient: item.receiverName || '',
                        phone: item.receiverPhone || '',
                        address: item.receiverAddr || '',
                        memo: item.memo || '',
                        release_date: item.releaseDate || null,
                        order_no: item.orderNo || '',
                        delivery_no: item.deliveryNo || '',
                        sender_name: item.senderName || '',
                        sender_phone: item.senderPhone || '',
                        sender_addr: item.senderAddr || '',
                        note: item.note || '',
                        source_file: item.sourceFile || '',
                        unit_price: parseInt(item.unitPrice) || 0,
                        shipped: false,
                        paid: false,
                        invoice_issued: false
                    };
                });

                const res = await fetch('/api/orders', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(orders)
                });

                if (!res.ok) throw new Error('등록 실패');

                confirmedData = confirmedData.filter(item => !item._selected);
                renderConfirmed();
                showToast(`${selectedItems.length}건이 전체주문관리에 등록되었습니다.`, 'success');
            } catch (e) {
                console.error('주문 등록 실패:', e);
                showToast('주문 등록 실패: ' + e.message, 'error');
            }
            hideLoading();
        }

        function downloadConfirmedExcel() {
            if (confirmedData.length === 0) {
                showToast('다운로드할 데이터가 없습니다.', 'error');
                return;
            }
            const selected = confirmedData.filter(item => item._selected);
            const data = selected.length > 0 ? selected : confirmedData;
            downloadLogenExcel(data);
            showToast(`${data.length}건을 B타입 양식으로 다운로드했습니다.`, 'success');
        }

        function downloadOrderExcel() {
            if (orderManagementData.length === 0) {
                showToast('다운로드할 데이터가 없습니다.', 'error');
                return;
            }

            const headers = [
                '등록일', '발주처', '출고요청일', '상품코드', 'SKU상품명', '상품명',
                '수량', '수령인', '수령인연락처', '수령인주소', '송장번호',
                '출고여부', '결제여부', '계산서발행', '단가', '비고'
            ];

            const dataRows = orderManagementData.map(item => [
                item.registeredDate || '', item.vendor || '', item.releaseDate || '',
                item.productCode || '', item.skuName || '', item.productName || '',
                item.quantity || '', item.receiverName || '', item.receiverPhone || '',
                item.receiverAddr || '', item.invoiceNo || '',
                item._shipped ? '완료' : '미완료', item._paid ? '완료' : '미완료',
                item._invoiceIssued ? '발행' : '미발행',
                item.unitPrice || '', item.note || ''
            ]);

            const wsData = [headers, ...dataRows];
            const ws = XLSX.utils.aoa_to_sheet(wsData);
            ws['!cols'] = headers.map(() => ({ wch: 15 }));
            ws['!cols'][5] = { wch: 30 };
            ws['!cols'][9] = { wch: 50 };

            const wb = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(wb, ws, '전체주문관리');

            const today = new Date();
            const dateStr = `${today.getFullYear()}${String(today.getMonth()+1).padStart(2,'0')}${String(today.getDate()).padStart(2,'0')}`;
            XLSX.writeFile(wb, `전체주문관리_${dateStr}.xlsx`);
            showToast(`${orderManagementData.length}건을 다운로드했습니다.`, 'success');
        }

        async function bulkUpdateStatus(field, value) {
            const selected = orderManagementData.filter(item => item._selected);
            if (selected.length === 0) {
                showToast('선택된 항목이 없습니다.', 'error');
                return;
            }

            // 필드명 매핑 (API field → JS property)
            const fieldToKey = { 'shipped': '_shipped', 'paid': '_paid', 'invoice_issued': '_invoiceIssued' };
            const statusKey = fieldToKey[field] || ('_' + field);
            const allSet = selected.every(item => item[statusKey]);
            const newValue = !allSet;

            // DB 업데이트
            const ids = selected.filter(item => item._id).map(item => item._id);
            if (ids.length > 0) {
                try {
                    await fetch('/api/orders/bulk-update', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ ids, updates: { [field]: newValue } })
                    });
                } catch (e) {
                    console.error('상태 업데이트 실패:', e);
                }
            }

            selected.forEach(item => { item[statusKey] = newValue; });
            renderOrderManagement();
            const statusText = newValue ? '완료' : '미완료';
            showToast(`${selected.length}건이 ${statusText} 처리되었습니다.`, 'success');
        }

        // ==================== 발주서 변환 핵심 함수 ====================
        function generateId() {
            return Date.now().toString(36) + Math.random().toString(36).substr(2);
        }

        function findHeaderRow(data) {
            const keywords = [
                '수령인', '수취인', '받는분', '받는사람', '수령자', '성명', '이름', '고객명',
                '연락처', '휴대폰', '핸드폰', '전화', '폰번호', 'hp', 'tel', '전화번호',
                '주소', '배송지', '배송주소', '도로명',
                '상품', '품명', '품목', '물품', '제품', '아이템', 'product',
                '주문', '오더', 'order', '번호',
                '수량', '개수', 'qty', 'quantity',
                '발송인', '보내는', '송하인',
                '배송', '택배', '송장', '운송장', '메모', '요청', '비고'
            ];

            for (let i = 0; i < Math.min(20, data.length); i++) {
                const row = data[i];
                if (!row || row.length < 2) continue;

                let matchCount = 0;
                const columns = [];

                for (let j = 0; j < row.length; j++) {
                    const cell = row[j];
                    if (cell !== undefined && cell !== null && cell !== '') {
                        const cellStr = String(cell).replace(/[\s\n*]/g, '').toLowerCase();
                        columns.push({ index: j, name: String(cell).trim(), normalized: cellStr });

                        for (const keyword of keywords) {
                            if (cellStr.includes(keyword.toLowerCase())) {
                                matchCount++;
                                break;
                            }
                        }
                    }
                }

                if (matchCount >= 2) {
                    return { headerRowIdx: i, columns };
                }
            }
            return null;
        }

        function isExcluded(colName, targetKey) {
            const excludes = MAPPING_EXCLUDES[targetKey];
            if (!excludes) return false;
            for (const exclude of excludes) {
                if (colName.includes(exclude.toLowerCase())) return true;
            }
            return false;
        }

        function autoMapColumns(columns) {
            const mapping = {};
            const usedColumns = new Set();

            // Pass 1: 정확한 매칭
            for (const [targetKey, keywords] of Object.entries(MAPPING_RULES)) {
                for (const keyword of keywords) {
                    const keywordLower = keyword.toLowerCase();
                    for (const col of columns) {
                        if (usedColumns.has(col.index)) continue;
                        if (col.normalized === keywordLower && !isExcluded(col.normalized, targetKey)) {
                            mapping[targetKey] = col.index;
                            usedColumns.add(col.index);
                            break;
                        }
                    }
                    if (mapping[targetKey] !== undefined) break;
                }
            }

            // Pass 2: startsWith 매칭
            for (const [targetKey, keywords] of Object.entries(MAPPING_RULES)) {
                if (mapping[targetKey] !== undefined) continue;
                for (const keyword of keywords) {
                    const keywordLower = keyword.toLowerCase();
                    for (const col of columns) {
                        if (usedColumns.has(col.index)) continue;
                        if (col.normalized.startsWith(keywordLower) && !isExcluded(col.normalized, targetKey)) {
                            mapping[targetKey] = col.index;
                            usedColumns.add(col.index);
                            break;
                        }
                    }
                    if (mapping[targetKey] !== undefined) break;
                }
            }

            // Pass 3: includes 매칭 (3글자 이상 키워드만)
            for (const [targetKey, keywords] of Object.entries(MAPPING_RULES)) {
                if (mapping[targetKey] !== undefined) continue;
                for (const keyword of keywords) {
                    const keywordLower = keyword.toLowerCase();
                    if (keywordLower.length <= 2) continue;
                    for (const col of columns) {
                        if (usedColumns.has(col.index)) continue;
                        if (col.normalized.includes(keywordLower) && !isExcluded(col.normalized, targetKey)) {
                            mapping[targetKey] = col.index;
                            usedColumns.add(col.index);
                            break;
                        }
                    }
                    if (mapping[targetKey] !== undefined) break;
                }
            }

            // 주소 컬럼 특별 처리
            const addressColumns = columns.filter(col =>
                !usedColumns.has(col.index) &&
                (col.normalized.includes('주소') || col.normalized.includes('address')) &&
                !isExcluded(col.normalized, 'receiverAddr')
            );

            if (mapping['receiverAddr'] === undefined && addressColumns.length === 1) {
                mapping['receiverAddr'] = addressColumns[0].index;
                usedColumns.add(addressColumns[0].index);
            } else if (mapping['receiverAddr'] === undefined && addressColumns.length > 1) {
                const mainAddr = addressColumns.find(col => !col.normalized.includes('상세'));
                if (mainAddr) {
                    mapping['receiverAddr'] = mainAddr.index;
                    usedColumns.add(mainAddr.index);
                }
            }

            // 상세주소 컬럼
            if (mapping['receiverAddrDetail'] === undefined) {
                for (const col of columns) {
                    if (usedColumns.has(col.index)) continue;
                    if (col.normalized.includes('상세주소') || col.normalized.includes('상세') ||
                        col.normalized === '주소2' || col.normalized === 'address2') {
                        mapping['receiverAddrDetail'] = col.index;
                        usedColumns.add(col.index);
                        break;
                    }
                }
            }

            // 수령인 옆 연락처 추론
            if (mapping['receiverName'] !== undefined && mapping['receiverPhone'] === undefined) {
                const receiverIdx = mapping['receiverName'];
                for (const col of columns) {
                    if (col.index === receiverIdx + 1 && !usedColumns.has(col.index)) {
                        const name = col.normalized;
                        if (name.includes('휴대') || name.includes('전화') || name.includes('연락') || name.includes('폰')) {
                            mapping['receiverPhone'] = col.index;
                            usedColumns.add(col.index);
                            break;
                        }
                    }
                }
            }

            // 상품명 폴백
            if (mapping['productName'] === undefined) {
                const giftSetPatterns = ['세트', '호', '선물', '패키지', '구성', '모듬', '종합', '특선', '명품', '프리미엄'];
                for (const col of columns) {
                    if (usedColumns.has(col.index)) continue;
                    for (const pattern of giftSetPatterns) {
                        if (col.name.includes(pattern)) {
                            mapping['productName'] = col.index;
                            usedColumns.add(col.index);
                            break;
                        }
                    }
                    if (mapping['productName'] !== undefined) break;
                }
            }

            return mapping;
        }

        function convertRow(row, mapping, vendorValue, fileName) {
            const item = { _selected: true, _id: generateId() };

            for (const target of RESULT_COLUMNS) {
                if (mapping[target.key] !== undefined) {
                    let value = row[mapping[target.key]];
                    if (value !== undefined && value !== null) {
                        value = String(value).trim();
                        if (target.key.includes('Phone')) value = formatPhone(value);
                        if (target.key === 'releaseDate') value = formatDateValue(value);
                    }
                    item[target.key] = value || '';
                } else {
                    item[target.key] = '';
                }
            }

            // 상세주소 병합
            if (mapping['receiverAddrDetail'] !== undefined) {
                let detail = row[mapping['receiverAddrDetail']];
                if (detail !== undefined && detail !== null) {
                    detail = String(detail).trim();
                    if (detail && item.receiverAddr) {
                        item.receiverAddr = item.receiverAddr + ' ' + detail;
                    } else if (detail && !item.receiverAddr) {
                        item.receiverAddr = detail;
                    }
                }
            }

            // 주문자 → 발송인 폴백
            if (!item.senderName && mapping['ordererName'] !== undefined) {
                let orderer = row[mapping['ordererName']];
                if (orderer !== undefined && orderer !== null) {
                    item.senderName = String(orderer).trim();
                }
            }

            if (!item.vendor) item.vendor = vendorValue;
            item.sourceFile = fileName;

            if (item.receiverName || item.productName || item.receiverAddr) {
                return item;
            }
            return null;
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

        function findMatchingSku(vendor, productCode) {
            if (!vendor || !productCode) return null;
            const productCodeClean = String(productCode).trim();
            // Flask vendorMappings: flat array [{ vendor_name, product_code, product_name, sku_product_id, sku_name }]
            const mapping = vendorMappings.find(m =>
                m.vendor_name === vendor && String(m.product_code || '').trim() === productCodeClean
            );
            if (mapping && mapping.sku_product_id) {
                const sku = skuProducts.find(p => p.id === mapping.sku_product_id);
                return sku || { id: mapping.sku_product_id, sku_name: mapping.sku_name };
            }
            return null;
        }

        // ==================== 변환완료 렌더링 ====================
        function renderConvertResult() {
            const resultCard = document.getElementById('convert-result');
            if (!resultCard) return;

            if (convertedData.length === 0) {
                resultCard.style.display = 'none';
                return;
            }

            resultCard.style.display = 'block';

            const matchedCount = convertedData.filter(item => item._skuMatched).length;
            const unmatchedCount = convertedData.length - matchedCount;
            const selectedCount = convertedData.filter(item => item._selected).length;

            document.getElementById('convert-result-summary').innerHTML =
                `전체 ${convertedData.length}건 | 선택 ${selectedCount}건 | ` +
                `<span style="color: #27ae60;">매칭 ${matchedCount}</span> | ` +
                `<span style="color: ${unmatchedCount > 0 ? '#e74c3c' : '#666'};">미매칭 ${unmatchedCount}</span>`;

            const tableContainer = document.getElementById('convert-result-table');
            tableContainer.innerHTML = buildConvertTable(convertedData, RESULT_COLUMNS, 'result');
        }

        function buildConvertTable(data, columns, tableType) {
            let html = '<table><thead><tr>';
            html += '<th><input type="checkbox" onchange="toggleAllRows(\'' + tableType + '\', this.checked)" checked></th>';
            html += '<th>#</th>';
            columns.forEach(c => { html += `<th>${escapeHtml(c.name)}</th>`; });
            html += '</tr></thead><tbody>';

            data.forEach((item, idx) => {
                html += '<tr>';
                html += `<td><input type="checkbox" ${item._selected ? 'checked' : ''} onchange="handleRowToggle('${tableType}', ${idx})"></td>`;
                html += `<td>${idx + 1}</td>`;

                columns.forEach(col => {
                    const value = escapeHtml(item[col.key] || '');
                    if (col.key === 'skuName') {
                        if (!item._skuMatched) {
                            html += `<td style="min-width:150px;"><span style="background:#fff3cd;color:#856404;padding:2px 6px;border-radius:4px;font-size:11px;">미매칭</span>`;
                            html += `<div style="font-size:11px;color:#666;margin-top:2px;">${escapeHtml(item.productName || '')}</div></td>`;
                        } else {
                            html += `<td style="min-width:150px;"><span style="background:#d4edda;color:#155724;padding:2px 6px;border-radius:4px;font-size:11px;">매칭</span> ${value}`;
                            html += `<div style="font-size:11px;color:#888;margin-top:2px;">${escapeHtml(item.productName || '')}</div></td>`;
                        }
                    } else if (col.key === 'vendor') {
                        html += `<td><span style="background:#e3f2fd;color:#1565c0;padding:2px 6px;border-radius:4px;font-size:11px;">${value || '-'}</span></td>`;
                    } else {
                        html += `<td><input type="text" value="${value}" style="min-width:${col.width};border:1px solid #eee;padding:4px 6px;border-radius:4px;font-size:12px;" onchange="handleCellChange('${tableType}', ${idx}, '${col.key}', this.value)"></td>`;
                    }
                });
                html += '</tr>';
            });

            html += '</tbody></table>';
            return html;
        }

        function toggleAllRows(tableType, checked) {
            const data = tableType === 'result' ? convertedData : confirmedData;
            data.forEach(item => { item._selected = checked; });
            if (tableType === 'result') renderConvertResult();
            else renderConfirmed();
        }

        function handleRowToggle(tableType, idx) {
            if (tableType === 'result') {
                convertedData[idx]._selected = !convertedData[idx]._selected;
                renderConvertResult();
            } else if (tableType === 'confirmed') {
                confirmedData[idx]._selected = !confirmedData[idx]._selected;
                renderConfirmed();
            }
        }

        function handleCellChange(tableType, idx, key, value) {
            if (tableType === 'result') {
                convertedData[idx][key] = value;
            } else if (tableType === 'confirmed') {
                confirmedData[idx][key] = value;
            }
        }

        // ==================== 변환확정 렌더링 ====================
        function renderConfirmed() {
            const badge = document.getElementById('confirmed-badge');
            const summary = document.getElementById('confirmed-summary');
            const table = document.getElementById('confirmed-table');
            if (!table) return;

            if (badge) badge.textContent = confirmedData.length;

            if (confirmedData.length === 0) {
                if (summary) summary.innerHTML = '';
                table.innerHTML = '<p style="color: #888; text-align: center; padding: 20px;">확정된 데이터가 없습니다.</p>';
                return;
            }

            const selectedCount = confirmedData.filter(item => item._selected).length;
            const matchedCount = confirmedData.filter(item => item._skuMatched).length;
            const unmatchedCount = confirmedData.length - matchedCount;

            if (summary) {
                summary.innerHTML = `
                    <div class="summary-item"><span class="label">전체:</span><span class="value">${confirmedData.length}건</span></div>
                    <div class="summary-item"><span class="label">선택:</span><span class="value">${selectedCount}건</span></div>
                    <div class="summary-item"><span class="label">매칭:</span><span class="value" style="color:#27ae60;">${matchedCount}</span></div>
                    ${unmatchedCount > 0 ? `<div class="summary-item"><span class="label">미매칭:</span><span class="value" style="color:#e74c3c;">${unmatchedCount}</span></div>` : ''}
                `;
            }

            // 필터/정렬 적용
            const filteredData = getFilteredConfirmedData();
            table.innerHTML = buildConfirmedTable(filteredData);
        }

        function getFilteredConfirmedData() {
            let data = [...confirmedData];

            Object.keys(confirmedFilters).forEach(key => {
                const filterValues = confirmedFilters[key];
                if (filterValues && filterValues.length > 0) {
                    data = data.filter(item => filterValues.includes(item[key] || ''));
                }
            });

            if (confirmedSort.key && confirmedSort.direction) {
                data.sort((a, b) => {
                    const aVal = a[confirmedSort.key] || '';
                    const bVal = b[confirmedSort.key] || '';
                    if (confirmedSort.key === 'releaseDate') {
                        if (!aVal && bVal) return -1;
                        if (aVal && !bVal) return 1;
                    }
                    let comparison = aVal < bVal ? -1 : aVal > bVal ? 1 : 0;
                    return confirmedSort.direction === 'desc' ? -comparison : comparison;
                });
            }

            return data;
        }

        function buildConfirmedTable(data) {
            const columns = TARGET_COLUMNS;
            let html = '<table><thead><tr>';
            html += '<th><input type="checkbox" onchange="toggleAllRows(\'confirmed\', this.checked)" checked></th>';
            html += '<th>#</th>';
            columns.forEach(c => {
                html += `<th style="cursor:pointer;" onclick="toggleConfirmedSort('${c.key}')">${escapeHtml(c.name)}`;
                if (confirmedSort.key === c.key) {
                    html += confirmedSort.direction === 'asc' ? ' ▲' : ' ▼';
                }
                html += '</th>';
            });
            html += '</tr></thead><tbody>';

            data.forEach((item, idx) => {
                const origIdx = confirmedData.indexOf(item);
                html += '<tr>';
                html += `<td><input type="checkbox" ${item._selected ? 'checked' : ''} onchange="handleRowToggle('confirmed', ${origIdx})"></td>`;
                html += `<td>${idx + 1}</td>`;

                columns.forEach(col => {
                    const value = escapeHtml(item[col.key] || '');
                    if (col.key === 'skuName') {
                        if (!item._skuMatched) {
                            html += `<td><button class="btn btn-danger btn-small" onclick="openQuickMatchModal(${origIdx})" style="padding:2px 8px;font-size:11px;">미매칭</button>`;
                            html += `<div style="font-size:11px;color:#666;margin-top:2px;">${escapeHtml(item.productName || '')}</div></td>`;
                        } else {
                            html += `<td><span style="background:#d4edda;color:#155724;padding:2px 6px;border-radius:4px;font-size:11px;">매칭</span> ${value}</td>`;
                        }
                    } else if (col.key === 'packagingComposition') {
                        let packCompText = '-';
                        let sku = null;
                        if (item._skuProductId) sku = skuProducts.find(p => p.id === item._skuProductId);
                        if (!sku && item.skuName) sku = skuProducts.find(p => p.sku_name === item.skuName);
                        if (sku) {
                            const packagingName = sku.packaging || '';
                            const compText = (sku.compositions || []).map(c => `${c.part_name}${c.weight}g`).join(',');
                            packCompText = packagingName ? `[${packagingName}] ${compText}` : compText || '-';
                        }
                        html += `<td style="font-size:12px;color:#555;" title="${escapeHtml(packCompText)}">${escapeHtml(packCompText)}</td>`;
                    } else if (col.key === 'convertedDate') {
                        html += `<td style="font-size:12px;color:#666;">${value || '-'}</td>`;
                    } else if (col.key === 'vendor') {
                        html += `<td><span style="background:#e3f2fd;color:#1565c0;padding:2px 6px;border-radius:4px;font-size:11px;">${value || '-'}</span></td>`;
                    } else {
                        html += `<td><input type="text" value="${value}" style="min-width:${col.width};border:1px solid #eee;padding:4px 6px;border-radius:4px;font-size:12px;" onchange="handleCellChange('confirmed', ${origIdx}, '${col.key}', this.value)"></td>`;
                    }
                });
                html += '</tr>';
            });

            html += '</tbody></table>';
            return html;
        }

        function toggleConfirmedSort(key) {
            if (confirmedSort.key === key) {
                if (confirmedSort.direction === 'asc') confirmedSort.direction = 'desc';
                else if (confirmedSort.direction === 'desc') confirmedSort = { key: null, direction: null };
                else confirmedSort = { key, direction: 'asc' };
            } else {
                confirmedSort = { key, direction: 'asc' };
            }
            renderConfirmed();
        }

        // ==================== 전체주문관리 렌더링 ====================
        function renderOrderManagement() {
            const badge = document.getElementById('order-badge');
            const summary = document.getElementById('order-summary');
            const table = document.getElementById('order-table');
            if (!table) return;

            if (badge) badge.textContent = orderManagementData.length;

            if (orderManagementData.length === 0) {
                if (summary) summary.innerHTML = '';
                table.innerHTML = '<p style="color: #888; text-align: center; padding: 20px;">등록된 주문이 없습니다.</p>';
                return;
            }

            const selectedCount = orderManagementData.filter(item => item._selected).length;
            const shippedCount = orderManagementData.filter(item => item._shipped).length;
            const paidCount = orderManagementData.filter(item => item._paid).length;

            if (summary) {
                summary.innerHTML = `
                    <div class="summary-item"><span class="label">전체:</span><span class="value">${orderManagementData.length}건</span></div>
                    <div class="summary-item"><span class="label">선택:</span><span class="value">${selectedCount}건</span></div>
                    <div class="summary-item"><span class="label">출고완료:</span><span class="value" style="color:#27ae60;">${shippedCount}</span></div>
                    <div class="summary-item"><span class="label">입금완료:</span><span class="value" style="color:#3498db;">${paidCount}</span></div>
                `;
            }

            // 필터/정렬 적용
            let data = [...orderManagementData];

            Object.keys(orderManagementFilters).forEach(key => {
                const filterValues = orderManagementFilters[key];
                if (filterValues && filterValues.length > 0) {
                    data = data.filter(item => {
                        const val = getOrderDisplayValue(item, key);
                        return filterValues.includes(val);
                    });
                }
            });

            if (orderManagementSort.key && orderManagementSort.direction) {
                data.sort((a, b) => {
                    const aVal = getOrderDisplayValue(a, orderManagementSort.key);
                    const bVal = getOrderDisplayValue(b, orderManagementSort.key);
                    let cmp = aVal < bVal ? -1 : aVal > bVal ? 1 : 0;
                    return orderManagementSort.direction === 'desc' ? -cmp : cmp;
                });
            }

            table.innerHTML = buildOrderManagementTable(data);
        }

        function getOrderDisplayValue(item, key) {
            if (key === '_shipped') return item._shipped ? '출고' : '미출고';
            if (key === '_paid') return item._paid ? '입금' : '미입금';
            if (key === '_invoiceIssued') return item._invoiceIssued ? '발행' : '미발행';
            if (key === 'unitPrice') return item.unitPrice ? String(item.unitPrice) : '';
            return item[key] || '';
        }

        function buildOrderManagementTable(data) {
            const columns = ORDER_MANAGEMENT_COLUMNS;
            let html = '<table><thead><tr>';
            html += '<th><input type="checkbox" onchange="orderToggleAll(this.checked)"></th>';
            html += '<th>#</th>';
            columns.forEach(c => {
                html += `<th style="cursor:pointer;" onclick="toggleOrderSort('${c.key}')">${escapeHtml(c.name)}`;
                if (orderManagementSort.key === c.key) {
                    html += orderManagementSort.direction === 'asc' ? ' ▲' : ' ▼';
                }
                html += '</th>';
            });
            html += '</tr></thead><tbody>';

            data.forEach((item, idx) => {
                const origIdx = orderManagementData.indexOf(item);
                html += '<tr>';
                html += `<td><input type="checkbox" ${item._selected ? 'checked' : ''} onchange="handleOrderRowToggle(${origIdx})"></td>`;
                html += `<td style="cursor:pointer;color:#3498db;text-decoration:underline;" onclick="openOrderDetailModal(${item._id})">${idx + 1}</td>`;

                columns.forEach(col => {
                    if (col.key === '_shipped') {
                        html += `<td><span class="status-badge ${item._shipped ? 'shipped' : 'not-shipped'}" style="cursor:pointer;" onclick="toggleOrderStatus(${origIdx}, '_shipped')">${item._shipped ? '출고' : '미출고'}</span></td>`;
                    } else if (col.key === '_paid') {
                        html += `<td><span class="status-badge ${item._paid ? 'paid' : 'not-paid'}" style="cursor:pointer;" onclick="toggleOrderStatus(${origIdx}, '_paid')">${item._paid ? '입금' : '미입금'}</span></td>`;
                    } else if (col.key === '_invoiceIssued') {
                        const issued = item._invoiceIssued;
                        html += `<td><span class="status-badge ${issued ? 'shipped' : 'not-shipped'}" style="cursor:pointer;" onclick="toggleOrderStatus(${origIdx}, '_invoiceIssued')">${issued ? '발행' : '미발행'}</span></td>`;
                    } else if (col.key === 'invoiceNo') {
                        const inv = escapeHtml(item.invoiceNo || '');
                        html += `<td><input type="text" value="${inv}" style="min-width:100px;border:1px solid #eee;padding:4px 6px;border-radius:4px;font-size:12px;" onchange="handleOrderCellChange(${origIdx}, 'invoiceNo', this.value)"></td>`;
                    } else if (col.key === 'unitPrice') {
                        const price = item.unitPrice || '';
                        html += `<td><input type="number" value="${price}" style="min-width:80px;border:1px solid #eee;padding:4px 6px;border-radius:4px;font-size:12px;" onchange="handleOrderCellChange(${origIdx}, 'unitPrice', this.value)"></td>`;
                    } else if (col.key === 'vendor') {
                        html += `<td><span style="background:#e3f2fd;color:#1565c0;padding:2px 6px;border-radius:4px;font-size:11px;">${escapeHtml(item.vendor || '-')}</span></td>`;
                    } else {
                        const value = escapeHtml(item[col.key] || '');
                        html += `<td><input type="text" value="${value}" style="min-width:${col.width};border:1px solid #eee;padding:4px 6px;border-radius:4px;font-size:12px;" onchange="handleOrderCellChange(${origIdx}, '${col.key}', this.value)"></td>`;
                    }
                });
                html += '</tr>';
            });

            html += '</tbody></table>';
            return html;
        }

        function orderToggleAll(checked) {
            orderManagementData.forEach(item => { item._selected = checked; });
            renderOrderManagement();
        }

        function handleOrderRowToggle(idx) {
            orderManagementData[idx]._selected = !orderManagementData[idx]._selected;
            renderOrderManagement();
        }

        async function handleOrderCellChange(idx, key, value) {
            orderManagementData[idx][key] = value;

            if (key === 'invoiceNo' && value && value.trim() !== '') {
                orderManagementData[idx]._shipped = true;
                renderOrderManagement();
            }

            // DB 업데이트
            const id = orderManagementData[idx]._id;
            if (id) {
                try {
                    await fetch(`/api/orders/${id}`, {
                        method: 'PUT',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ [key === 'unitPrice' ? 'unit_price' : key === 'invoiceNo' ? 'invoice_no' : key]: value })
                    });
                } catch (e) {
                    console.error('셀 업데이트 실패:', e);
                }
            }
        }

        async function toggleOrderStatus(idx, statusKey) {
            orderManagementData[idx][statusKey] = !orderManagementData[idx][statusKey];
            renderOrderManagement();

            const id = orderManagementData[idx]._id;
            if (id) {
                const fieldMapping = { '_shipped': 'shipped', '_paid': 'paid', '_invoiceIssued': 'invoice_issued' };
                    const apiField = fieldMapping[statusKey] || statusKey.replace('_', '');
                try {
                    await fetch(`/api/orders/${id}`, {
                        method: 'PUT',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ [apiField]: orderManagementData[idx][statusKey] })
                    });
                } catch (e) {
                    console.error('상태 업데이트 실패:', e);
                }
            }
        }

        function toggleOrderSort(key) {
            if (orderManagementSort.key === key) {
                if (orderManagementSort.direction === 'asc') orderManagementSort.direction = 'desc';
                else if (orderManagementSort.direction === 'desc') orderManagementSort = { key: null, direction: null };
                else orderManagementSort = { key, direction: 'asc' };
            } else {
                orderManagementSort = { key, direction: 'asc' };
            }
            renderOrderManagement();
        }

        // ==================== B타입 엑셀 다운로드 ====================
        function downloadLogenExcel(data) {
            const logenHeaders = [
                'SKU상품명', '수량', '수령인', '수령인연락처', '수령인주소',
                '배송메모', '주문번호', '발송인', '발송인연락처', '발송인주소', '배송번호'
            ];

            const logenData = data.map(item => [
                item.skuName || item.productName || '',
                item.quantity || 1,
                item.receiverName || '',
                item.receiverPhone || '',
                item.receiverAddr || '',
                item.memo || '',
                item.orderNo || '',
                item.senderName || '',
                item.senderPhone || '',
                item.senderAddr || '',
                item.deliveryNo || ''
            ]);

            const wsData = [logenHeaders, ...logenData];
            const ws = XLSX.utils.aoa_to_sheet(wsData);
            ws['!cols'] = [
                { wch: 30 }, { wch: 8 }, { wch: 12 }, { wch: 15 }, { wch: 50 },
                { wch: 25 }, { wch: 20 }, { wch: 12 }, { wch: 15 }, { wch: 40 }, { wch: 15 }
            ];

            const wb = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(wb, ws, 'B타입');

            const today = new Date();
            const dateStr = `${today.getFullYear()}${String(today.getMonth()+1).padStart(2,'0')}${String(today.getDate()).padStart(2,'0')}`;
            XLSX.writeFile(wb, `B타입_${dateStr}_${data.length}건.xlsx`);
        }

        // ==================== 빠른매칭 모달 ====================
        function openQuickMatchModal(idx) {
            quickMatchIndex = idx;
            const item = confirmedData[idx];
            const modal = document.getElementById('quick-match-modal');
            if (!modal) return;

            document.getElementById('quick-match-vendor').textContent = item.vendor || '-';
            document.getElementById('quick-match-product-code').textContent = item.productCode || '-';
            document.getElementById('quick-match-product-name').textContent = item.productName || '-';

            const select = document.getElementById('quick-match-sku-select');
            select.innerHTML = '<option value="">SKU 상품을 선택하세요</option>';
            skuProducts.forEach(sku => {
                const option = document.createElement('option');
                option.value = sku.id;
                option.textContent = `${sku.sku_name} (${(sku.selling_price || 0).toLocaleString()}원)`;
                select.appendChild(option);
            });

            document.getElementById('quick-match-save-mapping').checked = true;
            modal.classList.add('show');
            showSkuSuggestions();
        }

        function closeQuickMatchModal() {
            document.getElementById('quick-match-modal')?.classList.remove('show');
            quickMatchIndex = -1;
        }

        async function applyQuickMatch() {
            if (quickMatchIndex < 0) return;
            const skuId = document.getElementById('quick-match-sku-select').value;
            if (!skuId) {
                showToast('SKU 상품을 선택해주세요.', 'error');
                return;
            }

            const sku = skuProducts.find(p => p.id === parseInt(skuId));
            if (!sku) { showToast('SKU를 찾을 수 없습니다.', 'error'); return; }

            const item = confirmedData[quickMatchIndex];
            item.skuName = sku.sku_name;
            item._skuMatched = true;
            item._skuProductId = sku.id;

            // 같은 발주처+상품코드의 모든 항목에 적용
            confirmedData.forEach(d => {
                if (d.vendor === item.vendor && d.productCode === item.productCode && !d._skuMatched) {
                    d.skuName = sku.sku_name;
                    d._skuMatched = true;
                    d._skuProductId = sku.id;
                }
            });

            // 매핑 저장 옵션
            const saveMapping = document.getElementById('quick-match-save-mapping').checked;
            if (saveMapping && item.vendor && item.productCode) {
                try {
                    await fetch('/api/vendor-mappings', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            vendor_name: item.vendor,
                            product_code: item.productCode,
                            product_name: item.productName || '',
                            sku_product_id: sku.id
                        })
                    });
                    await loadVendorMappingsAll();
                } catch (e) {
                    console.error('매핑 저장 실패:', e);
                }
            }

            closeQuickMatchModal();
            renderConfirmed();
            showToast(`"${sku.sku_name}"으로 매칭되었습니다.`, 'success');
        }

        // ==================== 송장 업로드 ====================
        function handleInvoiceUpload() {
            const input = document.getElementById('invoice-file-input');
            const file = input?.files[0];
            if (!file) return;

            const reader = new FileReader();
            reader.onload = async (e) => {
                try {
                    const workbook = XLSX.read(e.target.result, { type: 'array' });
                    const sheet = workbook.Sheets[workbook.SheetNames[0]];
                    const data = XLSX.utils.sheet_to_json(sheet, { header: 1 });

                    if (data.length < 2) {
                        showToast('엑셀 파일에 데이터가 없습니다.', 'error');
                        input.value = '';
                        return;
                    }

                    // 헤더 탐색
                    const HEADER_KEYWORDS = ['송장번호', '운송장번호', '송장', '운송장', '주문번호', '수하인', '송하인'];
                    let headerRowIdx = -1;
                    let headers = [];

                    for (let i = 0; i < Math.min(20, data.length); i++) {
                        const row = data[i];
                        if (!row || row.length === 0) continue;
                        const rowText = row.map(c => String(c || '').trim().toLowerCase()).join(' ');
                        const matchCount = HEADER_KEYWORDS.filter(kw => rowText.includes(kw)).length;
                        if (matchCount >= 2) {
                            headerRowIdx = i;
                            headers = row.map(h => String(h || '').trim().toLowerCase());
                            break;
                        }
                    }

                    if (headerRowIdx === -1) {
                        showToast('헤더 행을 찾을 수 없습니다.', 'error');
                        input.value = '';
                        return;
                    }

                    // 컬럼 인덱스 탐색
                    let invoiceColIdx = -1, orderNoColIdx = -1, deliveryNoColIdx = -1;
                    let receiverColIdx = -1, senderColIdx = -1;

                    for (let i = 0; i < headers.length; i++) {
                        const h = headers[i];
                        if (invoiceColIdx === -1 && ['송장번호', '운송장번호', '운송장', '송장'].some(k => h.includes(k))) {
                            invoiceColIdx = i;
                        }
                        if (orderNoColIdx === -1 && ['주문번호', '고객주문번호'].some(k => h.includes(k))) {
                            orderNoColIdx = i;
                        }
                        if (deliveryNoColIdx === -1 && !['송장', '운송장'].some(k => h.includes(k)) &&
                            ['추가옵션', '배송번호', '고객배송번호'].some(k => h.includes(k))) {
                            deliveryNoColIdx = i;
                        }
                        if (receiverColIdx === -1 && ['수하인', '받는분', '수령인', '수취인'].some(k => h.includes(k)) &&
                            !h.includes('주소') && !h.includes('연락') && !h.includes('전화')) {
                            receiverColIdx = i;
                        }
                        if (senderColIdx === -1 && ['송하인', '보내는분', '발송인'].some(k => h.includes(k)) &&
                            !h.includes('주소') && !h.includes('연락') && !h.includes('전화')) {
                            senderColIdx = i;
                        }
                    }

                    if (invoiceColIdx === -1) {
                        showToast('송장번호 컬럼을 찾을 수 없습니다.', 'error');
                        input.value = '';
                        return;
                    }

                    // 매칭
                    let matchedCount = 0;
                    for (let i = headerRowIdx + 1; i < data.length; i++) {
                        const row = data[i];
                        const invoiceNo = String(row[invoiceColIdx] || '').trim();
                        if (!invoiceNo) continue;

                        const orderNo = orderNoColIdx >= 0 ? String(row[orderNoColIdx] || '').trim() : '';
                        const deliveryNo = deliveryNoColIdx >= 0 ? String(row[deliveryNoColIdx] || '').trim() : '';
                        const receiverName = receiverColIdx >= 0 ? String(row[receiverColIdx] || '').trim() : '';
                        const senderName = senderColIdx >= 0 ? String(row[senderColIdx] || '').trim() : '';

                        for (const order of orderManagementData) {
                            if (order.invoiceNo) continue;

                            // 주문번호 매칭
                            if (orderNo && order.orderNo && order.orderNo === orderNo) {
                                if (!deliveryNo || !order.deliveryNo || order.deliveryNo === deliveryNo) {
                                    order.invoiceNo = invoiceNo;
                                    order._shipped = true;
                                    matchedCount++;
                                    break;
                                }
                            }

                            // 수령인+발송인 매칭
                            if (!orderNo && receiverName && senderName) {
                                const orderReceiver = (order.receiverName || '').replace('님', '').trim();
                                const excelReceiver = receiverName.replace('님', '').trim();
                                const orderSender = (order.senderName || '').trim();
                                const excelSender = senderName.replace('님', '').trim();

                                if (orderReceiver === excelReceiver && orderSender === excelSender) {
                                    order.invoiceNo = invoiceNo;
                                    order._shipped = true;
                                    matchedCount++;
                                    break;
                                }
                            }
                        }
                    }

                    // DB에 업데이트
                    if (matchedCount > 0) {
                        const matchedOrders = orderManagementData.filter(o => o.invoiceNo && o._id);
                        const ids = matchedOrders.map(o => o._id);
                        const updates = {};
                        matchedOrders.forEach(o => {
                            updates[o._id] = { invoice_no: o.invoiceNo, shipped: true };
                        });

                        // bulk update로 저장
                        try {
                            for (const o of matchedOrders) {
                                await fetch(`/api/orders/${o._id}`, {
                                    method: 'PUT',
                                    headers: { 'Content-Type': 'application/json' },
                                    body: JSON.stringify({ invoice_no: o.invoiceNo, shipped: true })
                                });
                            }
                        } catch (e) {
                            console.error('송장 업데이트 실패:', e);
                        }
                    }

                    renderOrderManagement();
                    showToast(`${matchedCount}건의 송장번호가 매칭되었습니다.`, matchedCount > 0 ? 'success' : 'info');
                    input.value = '';
                } catch (err) {
                    showToast('송장 파일 처리 오류: ' + err.message, 'error');
                    input.value = '';
                }
            };
            reader.readAsArrayBuffer(file);
        }

        // ==================== Phase 1: 즉시 적용 기능 ====================

        // --- 1-1. 스마트 자동완성 ---
        function setupAutocomplete(inputId, dataFn) {
            const input = document.getElementById(inputId);
            if (!input) return;

            let listEl = document.getElementById(inputId + '-autocomplete');
            if (!listEl) {
                listEl = document.createElement('div');
                listEl.id = inputId + '-autocomplete';
                listEl.className = 'autocomplete-list';
                input.parentElement.style.position = 'relative';
                input.parentElement.appendChild(listEl);
            }

            input.addEventListener('input', function() {
                const val = this.value.toLowerCase().trim();
                listEl.innerHTML = '';
                if (!val || val.length < 1) { listEl.style.display = 'none'; return; }

                const items = dataFn().filter(item =>
                    item.toLowerCase().includes(val)
                ).slice(0, 8);

                if (items.length === 0) { listEl.style.display = 'none'; return; }

                items.forEach(item => {
                    const div = document.createElement('div');
                    div.className = 'autocomplete-item';
                    div.textContent = item;
                    div.addEventListener('mousedown', function(e) {
                        e.preventDefault();
                        input.value = item;
                        listEl.style.display = 'none';
                        input.dispatchEvent(new Event('change'));
                    });
                    listEl.appendChild(div);
                });
                listEl.style.display = 'block';
            });

            input.addEventListener('blur', function() {
                setTimeout(() => { listEl.style.display = 'none'; }, 200);
            });
        }

        function getUniqueVendors() {
            const vendors = new Set();
            vendorMappings.forEach(m => vendors.add(m.vendor_name));
            orderManagementData.forEach(o => { if (o.vendor) vendors.add(o.vendor); });
            return Array.from(vendors).sort();
        }

        function getUniqueSkuNames() {
            const names = new Set();
            skuProducts.forEach(p => names.add(p.sku_name));
            return Array.from(names).sort();
        }

        function getUniqueRecipients() {
            const names = new Set();
            orderManagementData.forEach(o => { if (o.receiverName) names.add(o.receiverName); });
            return Array.from(names).sort();
        }

        // --- 1-2. 이상치 감지 ---
        let anomalyStats = {};

        async function loadAnomalyStats() {
            try {
                const res = await fetch('/api/orders/anomaly-stats');
                const data = await res.json();
                anomalyStats = {};
                (data.stats || []).forEach(s => {
                    const key = (s.vendor_name || '') + '::' + (s.sku_name || '');
                    anomalyStats[key] = s;
                });
            } catch (e) {
                console.error('이상치 통계 로드 실패:', e);
            }
        }

        function checkAnomaly(vendorName, skuName, quantity, unitPrice) {
            const key = (vendorName || '') + '::' + (skuName || '');
            const stats = anomalyStats[key];
            if (!stats || stats.sample_count < 3) return null;

            const warnings = [];
            const qty = parseInt(quantity) || 0;
            const price = parseInt(unitPrice) || 0;

            if (qty > 0 && stats.avg_qty > 0 && stats.stddev_qty > 0) {
                const zScore = Math.abs(qty - stats.avg_qty) / stats.stddev_qty;
                if (zScore > 2) {
                    warnings.push(`수량 이상: 평균 ${Math.round(stats.avg_qty)}개 대비 ${qty}개 (${zScore.toFixed(1)}σ)`);
                }
            }

            if (price > 0 && stats.avg_price > 0 && stats.stddev_price > 0) {
                const zScore = Math.abs(price - stats.avg_price) / stats.stddev_price;
                if (zScore > 2) {
                    warnings.push(`단가 이상: 평균 ${Math.round(stats.avg_price)}원 대비 ${price}원 (${zScore.toFixed(1)}σ)`);
                }
            }

            return warnings.length > 0 ? warnings : null;
        }

        // --- 1-3. 대시보드 집계 ---
        async function loadDashboardStats() {
            try {
                const res = await fetch('/api/orders/stats');
                const data = await res.json();
                renderDashboardStats(data);
            } catch (e) {
                console.error('대시보드 통계 로드 실패:', e);
            }
        }

        function renderDashboardStats(data) {
            const container = document.getElementById('dashboard-stats');
            if (!container) return;

            const summary = data.summary || {};
            const byVendor = data.by_vendor || [];
            const byMonth = data.by_month || [];
            const bySku = data.by_sku || [];

            // 요약 카드
            let html = '<div class="stats-cards">';
            html += renderStatCard('전체 주문', summary.total || 0, '건', '#3498db');
            html += renderStatCard('출고 완료', summary.shipped || 0, '건', '#27ae60');
            html += renderStatCard('입금 완료', summary.paid || 0, '건', '#f39c12');
            html += renderStatCard('계산서 발행', summary.invoice_issued || 0, '건', '#9b59b6');
            html += '</div>';

            // 거래처별 차트 + SKU별 차트
            html += '<div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-top: 20px;">';

            // 거래처별 바 차트
            html += '<div class="stats-chart-card"><h4>거래처별 주문량 (Top 10)</h4>';
            html += renderBarChart(byVendor.slice(0, 10), 'vendor_name', 'count');
            html += '</div>';

            // SKU별 바 차트
            html += '<div class="stats-chart-card"><h4>SKU별 총 수량 (Top 10)</h4>';
            html += renderBarChart(bySku.slice(0, 10), 'sku_name', 'total_qty');
            html += '</div>';

            html += '</div>';

            // 월별 추이
            if (byMonth.length > 0) {
                html += '<div class="stats-chart-card" style="margin-top: 20px;"><h4>월별 주문 추이</h4>';
                html += renderBarChart(byMonth, 'month', 'count');
                html += '</div>';
            }

            container.innerHTML = html;
        }

        function renderStatCard(label, value, unit, color) {
            return `<div class="stat-card">
                <div class="stat-value" style="color: ${color}">${Number(value).toLocaleString()}</div>
                <div class="stat-label">${label}</div>
                <div class="stat-unit">${unit}</div>
            </div>`;
        }

        function renderBarChart(data, labelKey, valueKey) {
            if (!data || data.length === 0) return '<p style="color: #999; text-align: center;">데이터 없음</p>';

            const maxVal = Math.max(...data.map(d => d[valueKey] || 0));
            if (maxVal === 0) return '<p style="color: #999; text-align: center;">데이터 없음</p>';

            let html = '<div class="bar-chart">';
            data.forEach(d => {
                const label = d[labelKey] || '-';
                const val = d[valueKey] || 0;
                const pct = (val / maxVal * 100).toFixed(1);
                const displayLabel = label.length > 15 ? label.substring(0, 15) + '...' : label;

                html += `<div class="bar-row">
                    <div class="bar-label" title="${escapeHtml(label)}">${escapeHtml(displayLabel)}</div>
                    <div class="bar-track">
                        <div class="bar-fill" style="width: ${pct}%"></div>
                    </div>
                    <div class="bar-value">${Number(val).toLocaleString()}</div>
                </div>`;
            });
            html += '</div>';
            return html;
        }

        // ==================== Phase 2: 중기 적용 기능 ====================

        // --- 2-1. 매핑 학습 (유사 SKU 제안) ---
        async function loadSkuSuggestions(productName, vendor) {
            if (!productName || productName.length < 2) return [];

            try {
                let url = `/api/vendor-mappings/suggest?q=${encodeURIComponent(productName)}`;
                if (vendor) url += `&vendor=${encodeURIComponent(vendor)}`;

                const res = await fetch(url);
                const data = await res.json();
                return data.suggestions || [];
            } catch (e) {
                console.error('SKU 제안 로드 실패:', e);
                return [];
            }
        }

        // 빠른매칭 모달에 제안 표시
        async function showSkuSuggestions() {
            const productName = document.getElementById('quick-match-product-name')?.textContent || '';
            const vendor = document.getElementById('quick-match-vendor')?.textContent || '';

            const suggestions = await loadSkuSuggestions(productName, vendor);
            const container = document.getElementById('sku-suggestions-list');
            if (!container) return;

            if (suggestions.length === 0) {
                container.innerHTML = '<p style="color: #999; font-size: 12px;">유사 매핑을 찾을 수 없습니다.</p>';
                return;
            }

            let html = '<div style="font-size: 12px; color: #666; margin-bottom: 6px;">유사 매핑 제안:</div>';
            suggestions.forEach(s => {
                html += `<div class="suggestion-item" onclick="applySuggestion(${s.sku_product_id}, '${escapeHtml(s.sku_name || '')}')">
                    <span class="suggestion-sku">${escapeHtml(s.sku_name || '')}</span>
                    <span class="suggestion-vendor" style="color: #888; font-size: 11px;">${escapeHtml(s.vendor_name || '')}</span>
                </div>`;
            });
            container.innerHTML = html;
        }

        function applySuggestion(skuProductId, skuName) {
            const select = document.getElementById('quick-match-sku-select');
            if (select) {
                select.value = skuProductId;
                // 셀렉트에 옵션이 없으면 추가
                if (!select.value) {
                    const opt = document.createElement('option');
                    opt.value = skuProductId;
                    opt.textContent = skuName;
                    select.appendChild(opt);
                    select.value = skuProductId;
                }
            }
        }

        // --- 2-2. 엑셀 템플릿 자동 인식 ---
        async function saveVendorTemplate(vendorName, columnMapping) {
            if (!vendorName || !columnMapping) return;

            try {
                await fetch('/api/vendor-templates', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        vendor_name: vendorName,
                        template_json: columnMapping
                    })
                });
            } catch (e) {
                console.error('템플릿 저장 실패:', e);
            }
        }

        async function loadVendorTemplate(vendorName) {
            if (!vendorName) return null;

            try {
                const res = await fetch('/api/vendor-templates');
                const data = await res.json();
                const templates = data.templates || [];
                const found = templates.find(t => t.vendor_name === vendorName);
                return found ? found.template_json : null;
            } catch (e) {
                return null;
            }
        }

        // --- 2-3. 중복 주문 감지 ---
        async function checkDuplicateOrders(ordersToRegister) {
            if (!ordersToRegister || ordersToRegister.length === 0) return [];

            try {
                const res = await fetch('/api/orders/check-duplicates', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ orders: ordersToRegister })
                });
                const data = await res.json();
                return data.duplicates || [];
            } catch (e) {
                console.error('중복 확인 실패:', e);
                return [];
            }
        }

        // --- 2-4. 배송 추적 (UI만, 실제 택배사 API는 향후 연동) ---
        function getDeliveryStatus(order) {
            if (!order.invoiceNo) return { status: 'none', label: '미등록', color: '#95a5a6' };
            if (order._shipped) return { status: 'delivered', label: '배송완료', color: '#27ae60' };
            return { status: 'in_transit', label: '배송중', color: '#f39c12' };
        }

        // ==================== 초기화 훅 ====================
        // initializeApp 이후 추가 초기화
        const _originalInitializeApp = initializeApp;
        initializeApp = async function() {
            await _originalInitializeApp();

            // Phase 1 초기화
            setupAutocomplete('mapping-vendor', getUniqueVendors);
            setupAutocomplete('mapping-product-name', function() {
                return vendorMappings.map(m => m.product_code || '').filter(Boolean);
            });

            // 이상치 통계 로드
            loadAnomalyStats();

            // 대시보드 통계 로드
            loadDashboardStats();
        };

        // registerOrders에 중복 감지 통합
        const _originalRegisterOrders = registerOrders;
        registerOrders = async function() {
            // 등록할 데이터 준비
            if (confirmedData.length === 0) {
                showToast('등록할 확정 데이터가 없습니다.', 'warning');
                return;
            }

            // 중복 확인
            const ordersForCheck = confirmedData.map(d => ({
                recipient: d.receiverName || '',
                address: d.receiverAddr || '',
                sku_name: d.skuName || ''
            }));

            const duplicates = await checkDuplicateOrders(ordersForCheck);

            if (duplicates.length > 0) {
                const dupList = duplicates.map(d => {
                    const existing = d.existing[0];
                    return `- ${d.order.recipient} / ${d.order.sku_name} (기존 주문: ${existing.order_date || '날짜 미상'})`;
                }).join('\n');

                const proceed = confirm(
                    `${duplicates.length}건의 중복 의심 주문이 발견되었습니다:\n\n${dupList}\n\n그래도 등록하시겠습니까?`
                );

                if (!proceed) return;
            }

            // 원래 등록 로직 실행
            await _originalRegisterOrders();
        };

        // ==================== Stage 1: 검색/필터 강화 ====================
        let activeFilterChips = {};
        let filterPresets = [];

        function toggleFilterChip(el) {
            el.classList.toggle('active');
            const filter = el.dataset.filter;
            const value = el.dataset.value;
            // 같은 필터의 다른 값 해제
            document.querySelectorAll(`.filter-chip[data-filter="${filter}"]`).forEach(chip => {
                if (chip !== el) chip.classList.remove('active');
            });
            if (el.classList.contains('active')) {
                activeFilterChips[filter] = value;
            } else {
                delete activeFilterChips[filter];
            }
            loadUserOrders();
        }

        function buildSearchQuery() {
            const search = document.getElementById('order-search')?.value || '';
            const dateFrom = document.getElementById('order-date-from')?.value || '';
            const dateTo = document.getElementById('order-date-to')?.value || '';
            const vendor = document.getElementById('order-vendor-filter')?.value || '';

            let url = `/api/orders?user_id=${currentUserId}&per_page=200`;
            if (search) url += `&search=${encodeURIComponent(search)}`;
            if (dateFrom) url += `&date_from=${dateFrom}`;
            if (dateTo) url += `&date_to=${dateTo}`;
            if (vendor) url += `&vendors=${encodeURIComponent(vendor)}`;
            if (activeFilterChips.shipped !== undefined) url += `&shipped=${activeFilterChips.shipped}`;
            if (activeFilterChips.paid !== undefined) url += `&paid=${activeFilterChips.paid}`;
            if (activeFilterChips.invoice_issued !== undefined) url += `&invoice_issued=${activeFilterChips.invoice_issued}`;
            return url;
        }

        // Override loadUserOrders to use new search
        const _origLoadUserOrders = loadUserOrders;
        loadUserOrders = async function(userId) {
            showLoading();
            try {
                const uid = userId || currentUserId;
                if (!uid) { hideLoading(); return; }
                const url = buildSearchQuery();
                const res = await fetch(url);
                const data = await res.json();
                orderManagementData = (data.orders || []).map(o => ({
                    _id: o.id,
                    _selected: false,
                    registeredDate: o.created_at ? o.created_at.split('T')[0] : '',
                    vendor: o.vendor_name || '',
                    releaseDate: o.release_date || '',
                    productCode: o.product_code || '',
                    skuName: o.sku_name || '',
                    productName: o.product_name || '',
                    quantity: o.quantity || 1,
                    receiverName: o.recipient || '',
                    receiverPhone: o.phone || '',
                    receiverAddr: o.address || '',
                    memo: o.memo || '',
                    orderNo: o.order_no || '',
                    deliveryNo: o.delivery_no || '',
                    senderName: o.sender_name || '',
                    senderPhone: o.sender_phone || '',
                    senderAddr: o.sender_addr || '',
                    invoiceNo: o.invoice_no || '',
                    _shipped: o.shipped || false,
                    _paid: o.paid || false,
                    _invoiceIssued: o.invoice_issued || false,
                    unitPrice: o.unit_price || 0,
                    note: o.note || '',
                    _bTypeDownloaded: o.b_type_downloaded || false
                }));
                renderOrderManagement();
            } catch (e) {
                console.error('주문 로드 실패:', e);
                showToast('주문 데이터 로드 실패', 'error');
            }
            hideLoading();
        };

        async function loadFilterPresets() {
            try {
                const res = await fetch('/api/filter-presets');
                const data = await res.json();
                filterPresets = data.presets || [];
                renderFilterPresets();
            } catch (e) { console.error(e); }
        }

        function renderFilterPresets() {
            const container = document.getElementById('preset-list');
            const bar = document.getElementById('preset-bar');
            if (!container || !bar) return;
            if (filterPresets.length > 0) bar.style.display = 'flex';
            container.innerHTML = filterPresets.map(p => `
                <button class="preset-btn" onclick="applyFilterPreset(${p.id})">${escapeHtml(p.name)}
                    <span onclick="event.stopPropagation(); deleteFilterPreset(${p.id})" style="margin-left: 4px; color: #e74c3c;">&times;</span>
                </button>
            `).join('');
        }

        async function saveCurrentFilterPreset() {
            const name = prompt('프리셋 이름을 입력하세요:');
            if (!name) return;
            const presetJson = {
                search: document.getElementById('order-search')?.value || '',
                dateFrom: document.getElementById('order-date-from')?.value || '',
                dateTo: document.getElementById('order-date-to')?.value || '',
                vendor: document.getElementById('order-vendor-filter')?.value || '',
                chips: { ...activeFilterChips }
            };
            try {
                await fetch('/api/filter-presets', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ name, preset_json: presetJson })
                });
                showToast('프리셋이 저장되었습니다.', 'success');
                loadFilterPresets();
            } catch (e) { showToast('저장 실패', 'error'); }
        }

        function applyFilterPreset(id) {
            const preset = filterPresets.find(p => p.id === id);
            if (!preset) return;
            const pj = typeof preset.preset_json === 'string' ? JSON.parse(preset.preset_json) : preset.preset_json;
            if (pj.search) document.getElementById('order-search').value = pj.search;
            if (pj.dateFrom) document.getElementById('order-date-from').value = pj.dateFrom;
            if (pj.dateTo) document.getElementById('order-date-to').value = pj.dateTo;
            if (pj.vendor) document.getElementById('order-vendor-filter').value = pj.vendor;
            activeFilterChips = pj.chips || {};
            // 칩 UI 동기화
            document.querySelectorAll('.filter-chip').forEach(chip => {
                const f = chip.dataset.filter;
                const v = chip.dataset.value;
                chip.classList.toggle('active', activeFilterChips[f] === v);
            });
            loadUserOrders();
        }

        async function deleteFilterPreset(id) {
            try {
                await fetch(`/api/filter-presets/${id}`, { method: 'DELETE' });
                loadFilterPresets();
            } catch (e) { console.error(e); }
        }

        function updateOrderVendorFilter() {
            const select = document.getElementById('order-vendor-filter');
            if (!select) return;
            const vendors = [...new Set(vendorMappings.map(m => m.vendor_name))];
            select.innerHTML = '<option value="">전체</option>' +
                vendors.map(v => `<option value="${escapeHtml(v)}">${escapeHtml(v)}</option>`).join('');
        }

        // Stage 1: 리포트 거래처 필터도 업데이트
        function updateReportVendorFilter() {
            const select = document.getElementById('report-vendor-filter');
            if (!select) return;
            const vendors = [...new Set(vendorMappings.map(m => m.vendor_name))];
            select.innerHTML = '<option value="">전체</option>' +
                vendors.map(v => `<option value="${escapeHtml(v)}">${escapeHtml(v)}</option>`).join('');
        }

        // ==================== Stage 3: 원가 변동 이력 ====================
        async function showCostHistory(tableName, itemId, itemName) {
            document.getElementById('cost-history-title').textContent = `${itemName} 가격 변동 이력`;
            document.getElementById('cost-history-modal').classList.add('show');
            const content = document.getElementById('cost-history-content');
            content.innerHTML = '<p style="text-align: center; color: #888;">로딩 중...</p>';

            try {
                const res = await fetch(`/api/cost-history?table_name=${tableName}&item_id=${itemId}`);
                const data = await res.json();
                const history = data.history || [];

                if (history.length === 0) {
                    content.innerHTML = '<p style="text-align: center; color: #888;">변동 이력이 없습니다.</p>';
                    return;
                }

                const maxPrice = Math.max(...history.map(h => Math.max(h.old_price || 0, h.new_price || 0)));
                content.innerHTML = '<div class="cost-history-chart">' + history.map(h => {
                    const date = h.changed_at ? h.changed_at.split('T')[0] : '';
                    const diff = (h.new_price || 0) - (h.old_price || 0);
                    const diffStr = diff > 0 ? `+${diff.toLocaleString()}` : diff.toLocaleString();
                    const barWidth = maxPrice > 0 ? ((h.new_price || 0) / maxPrice * 100) : 0;
                    return `<div class="cost-history-item">
                        <span style="min-width: 80px;">${date}</span>
                        <div style="flex: 1;"><div class="cost-history-bar" style="width: ${barWidth}%;"></div></div>
                        <span style="min-width: 80px; text-align: right;">${(h.new_price || 0).toLocaleString()}원</span>
                        <span style="min-width: 60px; text-align: right; color: ${diff > 0 ? '#e74c3c' : '#27ae60'};">${diffStr}</span>
                    </div>`;
                }).join('') + '</div>';
            } catch (e) {
                content.innerHTML = '<p style="color: #e74c3c;">이력 로드 실패</p>';
            }
        }

        function closeCostHistoryModal() {
            document.getElementById('cost-history-modal').classList.remove('show');
        }

        // ==================== Stage 4: 업로드 이력 ====================
        async function loadUploadHistory() {
            const container = document.getElementById('upload-history-table');
            if (!container) return;

            try {
                const res = await fetch('/api/upload-history');
                const data = await res.json();
                const history = data.history || [];

                if (history.length === 0) {
                    container.innerHTML = '<p style="color: #888; text-align: center; padding: 20px;">업로드 이력이 없습니다.</p>';
                    return;
                }

                container.innerHTML = `<table><thead><tr>
                    <th>일시</th><th>사용자</th><th>파일명</th><th>거래처</th>
                    <th>총 행수</th><th>매칭</th><th>미매칭</th><th>상태</th>
                </tr></thead><tbody>` + history.map(h => `<tr>
                    <td>${h.created_at ? h.created_at.split('T')[0] : ''}</td>
                    <td>${escapeHtml(h.user_name || '')}</td>
                    <td>${escapeHtml(h.filename || '')}</td>
                    <td>${escapeHtml(h.vendor_name || '')}</td>
                    <td>${h.row_count || 0}</td>
                    <td style="color: #27ae60;">${h.matched_count || 0}</td>
                    <td style="color: #e74c3c;">${h.unmatched_count || 0}</td>
                    <td>${h.status || ''}</td>
                </tr>`).join('') + '</tbody></table>';
            } catch (e) {
                container.innerHTML = '<p style="color: #e74c3c;">로드 실패</p>';
            }
        }

        async function saveUploadHistory(filename, rowCount, matchedCount, unmatchedCount, vendorName) {
            try {
                await fetch('/api/upload-history', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        user_id: currentUserId,
                        filename, row_count: rowCount,
                        matched_count: matchedCount,
                        unmatched_count: unmatchedCount,
                        vendor_name: vendorName
                    })
                });
            } catch (e) { console.error('업로드 이력 저장 실패:', e); }
        }

        // ==================== Stage 5: 주문 상세 모달 ====================
        let currentOrderDetailId = null;

        function openOrderDetailModal(orderId) {
            currentOrderDetailId = orderId;
            const order = orderManagementData.find(o => o._id === orderId);
            if (!order) return;

            document.getElementById('order-detail-title').textContent = `주문 #${orderId} 상세`;
            document.getElementById('order-detail-modal').classList.add('show');
            switchOrderTab('info');

            // 주문 정보 렌더
            document.getElementById('order-tab-info').innerHTML = `
                <div style="display: grid; grid-template-columns: auto 1fr; gap: 8px 16px; font-size: 13px;">
                    <span style="color: #888;">거래처:</span><span>${escapeHtml(order.vendor)}</span>
                    <span style="color: #888;">SKU:</span><span>${escapeHtml(order.skuName)}</span>
                    <span style="color: #888;">수량:</span><span>${order.quantity}</span>
                    <span style="color: #888;">수령인:</span><span>${escapeHtml(order.receiverName)}</span>
                    <span style="color: #888;">연락처:</span><span>${escapeHtml(order.receiverPhone)}</span>
                    <span style="color: #888;">주소:</span><span>${escapeHtml(order.receiverAddr)}</span>
                    <span style="color: #888;">출고일:</span><span>${order.releaseDate || '-'}</span>
                    <span style="color: #888;">메모:</span><span>${escapeHtml(order.memo)}</span>
                    <span style="color: #888;">출고:</span><span>${order._shipped ? '완료' : '미완료'}</span>
                    <span style="color: #888;">입금:</span><span>${order._paid ? '완료' : '미완료'}</span>
                </div>`;

            // 이력/코멘트 로드
            loadOrderHistory(orderId);
            loadOrderComments(orderId);
        }

        function closeOrderDetailModal() {
            document.getElementById('order-detail-modal').classList.remove('show');
        }

        function switchOrderTab(tab) {
            document.querySelectorAll('#order-detail-modal .tab-btn').forEach(btn => btn.classList.remove('active'));
            document.querySelectorAll('#order-detail-modal .tab-content').forEach(tc => tc.classList.remove('active'));
            document.querySelector(`#order-detail-modal .tab-btn[onclick="switchOrderTab('${tab}')"]`)?.classList.add('active');
            document.getElementById(`order-tab-${tab}`)?.classList.add('active');
        }

        async function loadOrderHistory(orderId) {
            const container = document.getElementById('order-tab-history');
            try {
                const res = await fetch(`/api/orders/${orderId}/history`);
                const data = await res.json();
                const history = data.history || [];
                if (history.length === 0) {
                    container.innerHTML = '<p style="color: #888; text-align: center;">변경 이력이 없습니다.</p>';
                    return;
                }
                container.innerHTML = history.map(h => `
                    <div class="history-item">
                        <div><strong>${escapeHtml(h.field_name || '')}</strong> 변경</div>
                        <div style="color: #e74c3c;">${escapeHtml(h.old_value || '(없음)')}</div>
                        <div>→ <span style="color: #27ae60;">${escapeHtml(h.new_value || '(없음)')}</span></div>
                        <div style="font-size: 11px; color: #999; margin-top: 4px;">${h.created_at || ''}</div>
                    </div>
                `).join('');
            } catch (e) {
                container.innerHTML = '<p style="color: #e74c3c;">이력 로드 실패</p>';
            }
        }

        async function loadOrderComments(orderId) {
            const container = document.getElementById('order-comments-list');
            try {
                const res = await fetch(`/api/orders/${orderId}/comments`);
                const data = await res.json();
                const comments = data.comments || [];
                if (comments.length === 0) {
                    container.innerHTML = '<p style="color: #888; text-align: center;">코멘트가 없습니다.</p>';
                    return;
                }
                container.innerHTML = comments.map(c => `
                    <div class="comment-item">
                        <div class="comment-meta">${escapeHtml(c.user_name || '익명')} · ${c.created_at || ''}</div>
                        <div>${escapeHtml(c.content)}</div>
                    </div>
                `).join('');
            } catch (e) {
                container.innerHTML = '<p style="color: #e74c3c;">코멘트 로드 실패</p>';
            }
        }

        async function submitOrderComment() {
            const input = document.getElementById('new-comment');
            const content = input.value.trim();
            if (!content || !currentOrderDetailId) return;

            try {
                await fetch(`/api/orders/${currentOrderDetailId}/comments`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ user_name: currentUser || '', content })
                });
                input.value = '';
                loadOrderComments(currentOrderDetailId);
                showToast('코멘트가 등록되었습니다.', 'success');
            } catch (e) {
                showToast('코멘트 등록 실패', 'error');
            }
        }

        // ==================== Stage 6: 매출 리포트 ====================
        let vendorReportData = null;

        async function loadVendorReport() {
            const dateFrom = document.getElementById('report-date-from')?.value || '';
            const dateTo = document.getElementById('report-date-to')?.value || '';
            const vendor = document.getElementById('report-vendor-filter')?.value || '';

            showLoading();
            try {
                let url = '/api/dashboard/vendor-report?';
                if (dateFrom) url += `date_from=${dateFrom}&`;
                if (dateTo) url += `date_to=${dateTo}&`;
                if (vendor) url += `vendor=${encodeURIComponent(vendor)}&`;

                const res = await fetch(url);
                vendorReportData = await res.json();
                renderVendorReport(vendorReportData);
            } catch (e) {
                showToast('리포트 로드 실패', 'error');
            }
            hideLoading();
        }

        function renderVendorReport(data) {
            const container = document.getElementById('vendor-report-content');
            if (!container) return;
            const vs = data.vendor_summary || [];
            const mt = data.monthly_trend || [];
            const sb = data.sku_breakdown || [];

            // 거래처별 요약 테이블
            let html = '<h4 style="margin-bottom: 12px;">거래처별 요약</h4>';
            if (vs.length > 0) {
                const maxAmount = Math.max(...vs.map(v => v.total_amount || 0), 1);
                html += '<div class="bar-chart">' + vs.map(v => `
                    <div class="bar-row">
                        <span class="bar-label">${escapeHtml(v.vendor_name || '')}</span>
                        <div class="bar-track"><div class="bar-fill" style="width: ${((v.total_amount || 0) / maxAmount * 100)}%;"></div></div>
                        <span class="bar-value">${(v.total_amount || 0).toLocaleString()}원</span>
                    </div>
                `).join('') + '</div>';

                html += '<div class="table-container" style="margin-top: 16px;"><table><thead><tr>' +
                    '<th>거래처</th><th>주문수</th><th>총수량</th><th>매출액</th><th>출고</th><th>입금</th>' +
                    '</tr></thead><tbody>' + vs.map(v => `<tr>
                    <td>${escapeHtml(v.vendor_name || '')}</td>
                    <td>${v.order_count}</td><td>${v.total_qty}</td>
                    <td>${(v.total_amount || 0).toLocaleString()}원</td>
                    <td>${v.shipped_count}</td><td>${v.paid_count}</td>
                </tr>`).join('') + '</tbody></table></div>';
            } else {
                html += '<p style="color: #888;">데이터가 없습니다.</p>';
            }

            // 월별 추이
            if (mt.length > 0) {
                html += '<h4 style="margin: 20px 0 12px;">월별 추이</h4>';
                const maxMonthly = Math.max(...mt.map(m => m.total_amount || 0), 1);
                html += '<div class="bar-chart">' + mt.map(m => `
                    <div class="bar-row">
                        <span class="bar-label">${m.month}</span>
                        <div class="bar-track"><div class="bar-fill" style="width: ${((m.total_amount || 0) / maxMonthly * 100)}%;"></div></div>
                        <span class="bar-value">${(m.total_amount || 0).toLocaleString()}원</span>
                    </div>
                `).join('') + '</div>';
            }

            // SKU별 분석
            if (sb.length > 0) {
                html += '<h4 style="margin: 20px 0 12px;">SKU별 분석 (Top 20)</h4>';
                html += '<div class="table-container"><table><thead><tr>' +
                    '<th>SKU</th><th>주문수</th><th>총수량</th><th>매출액</th>' +
                    '</tr></thead><tbody>' + sb.map(s => `<tr>
                    <td>${escapeHtml(s.sku_name || '')}</td>
                    <td>${s.order_count}</td><td>${s.total_qty}</td>
                    <td>${(s.total_amount || 0).toLocaleString()}원</td>
                </tr>`).join('') + '</tbody></table></div>';
            }

            container.innerHTML = html;
        }

        function downloadVendorReportExcel() {
            if (!vendorReportData || !vendorReportData.vendor_summary) {
                showToast('먼저 리포트를 조회하세요.', 'error');
                return;
            }
            const vs = vendorReportData.vendor_summary;
            const headers = ['거래처', '주문수', '총수량', '매출액', '출고', '입금'];
            const rows = vs.map(v => [v.vendor_name, v.order_count, v.total_qty, v.total_amount || 0, v.shipped_count, v.paid_count]);
            const ws = XLSX.utils.aoa_to_sheet([headers, ...rows]);
            const wb = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(wb, ws, '매출리포트');
            const today = new Date();
            const dateStr = `${today.getFullYear()}${String(today.getMonth()+1).padStart(2,'0')}${String(today.getDate()).padStart(2,'0')}`;
            XLSX.writeFile(wb, `매출리포트_${dateStr}.xlsx`);
            showToast('엑셀 다운로드 완료', 'success');
        }

        // ==================== Stage 7: 재고 관리 ====================
        let inventoryData = [];

        async function loadInventory() {
            try {
                const res = await fetch('/api/inventory');
                const data = await res.json();
                inventoryData = data.inventory || [];
            } catch (e) { console.error('재고 로드 실패:', e); }
        }

        function openInventoryModal() {
            document.getElementById('inv-sku-select').innerHTML = '<option value="">SKU 선택</option>' +
                skuProducts.map(s => `<option value="${s.id}">${escapeHtml(s.sku_name)}</option>`).join('');
            document.getElementById('inv-change-qty').value = '';
            document.getElementById('inv-note').value = '';
            document.getElementById('inventory-modal').classList.add('show');
        }

        function closeInventoryModal() {
            document.getElementById('inventory-modal').classList.remove('show');
        }

        async function submitInventoryAdjust() {
            const skuProductId = document.getElementById('inv-sku-select').value;
            const changeQty = parseInt(document.getElementById('inv-change-qty').value);
            const note = document.getElementById('inv-note').value;

            if (!skuProductId || isNaN(changeQty) || changeQty === 0) {
                showToast('SKU와 조정 수량을 입력하세요.', 'error');
                return;
            }

            try {
                await fetch('/api/inventory/adjust', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ sku_product_id: parseInt(skuProductId), change_qty: changeQty, note })
                });
                closeInventoryModal();
                showToast('재고가 조정되었습니다.', 'success');
                loadInventory();
            } catch (e) {
                showToast('재고 조정 실패', 'error');
            }
        }

        // ==================== Stage 8: 알림 시스템 ====================
        let notificationData = [];

        async function checkNotifications() {
            try {
                const res = await fetch('/api/notifications?unread_only=true');
                const data = await res.json();
                notificationData = data.notifications || [];
                const badge = document.getElementById('notification-badge');
                const count = data.unread_count || 0;
                if (badge) {
                    badge.textContent = count;
                    badge.style.display = count > 0 ? 'inline-block' : 'none';
                }
            } catch (e) { /* 알림 로드 실패 무시 */ }
        }

        function toggleNotificationPanel(event) {
            event.stopPropagation();
            const panel = document.getElementById('notification-panel');
            panel.classList.toggle('show');
            if (panel.classList.contains('show')) renderNotificationList();
        }

        function renderNotificationList() {
            const container = document.getElementById('notification-list');
            if (!container) return;

            if (notificationData.length === 0) {
                container.innerHTML = '<div style="padding: 20px; text-align: center; color: #999;">알림이 없습니다</div>';
                return;
            }

            container.innerHTML = notificationData.map(n => `
                <div class="notification-item ${n.is_read ? '' : 'unread'}" onclick="handleNotificationClick(${n.id})">
                    <div class="notification-title">${escapeHtml(n.title)}</div>
                    <div class="notification-message">${escapeHtml(n.message || '')}</div>
                    <div class="notification-time">${n.created_at ? n.created_at.split('T')[0] : ''}</div>
                </div>
            `).join('');
        }

        async function handleNotificationClick(id) {
            try {
                await fetch('/api/notifications/mark-read', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ ids: [id] })
                });
                checkNotifications();
            } catch (e) { /* ignore */ }
        }

        async function markAllNotificationsRead() {
            try {
                await fetch('/api/notifications/mark-read', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({})
                });
                checkNotifications();
                showToast('모든 알림을 읽음 처리했습니다.', 'success');
            } catch (e) { showToast('실패', 'error'); }
        }

        async function generateNotifications() {
            try { await fetch('/api/notifications/generate', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: '{}' }); } catch (e) { /* ignore */ }
        }

        // 5분마다 알림 체크 + 생성
        setInterval(function() {
            generateNotifications().then(() => checkNotifications());
        }, 300000);

        // ==================== Stage 9: 역할 기반 제한 ====================
        let currentUserRole = 'admin';

        function applyRoleRestrictions(role) {
            currentUserRole = role || 'admin';
            // user 역할: 삭제/관리 버튼 숨기기
            const restrictedBtns = document.querySelectorAll('[data-role-min]');
            restrictedBtns.forEach(btn => {
                const minRole = btn.dataset.roleMin;
                const roleOrder = { 'admin': 3, 'manager': 2, 'user': 1 };
                btn.style.display = (roleOrder[currentUserRole] || 1) >= (roleOrder[minRole] || 1) ? '' : 'none';
            });
        }

        // ==================== Stage 10: 백업/복원 ====================
        async function exportBackup() {
            showLoading();
            try {
                const res = await fetch('/api/backup/export');
                const blob = await res.blob();
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                const today = new Date();
                const dateStr = `${today.getFullYear()}${String(today.getMonth()+1).padStart(2,'0')}${String(today.getDate()).padStart(2,'0')}`;
                a.download = `backup_${dateStr}.json`;
                a.click();
                URL.revokeObjectURL(url);
                showToast('백업 파일이 다운로드되었습니다.', 'success');
                loadBackupLog();
            } catch (e) {
                showToast('내보내기 실패', 'error');
            }
            hideLoading();
        }

        async function importBackup() {
            const fileInput = document.getElementById('backup-file-input');
            if (!fileInput.files || fileInput.files.length === 0) {
                showToast('JSON 파일을 선택하세요.', 'error');
                return;
            }

            const file = fileInput.files[0];
            const text = await file.text();
            let data;
            try {
                data = JSON.parse(text);
            } catch (e) {
                showToast('유효하지 않은 JSON 파일입니다.', 'error');
                return;
            }

            // 미리보기
            const previewRes = await fetch('/api/backup/import', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: text
            });
            const preview = await previewRes.json();

            const summary = Object.entries(preview.preview || {}).map(([k, v]) => `${k}: ${v}건`).join('\n');
            if (!confirm(`다음 데이터를 복원합니다:\n\n${summary}\n\n기존 데이터가 모두 삭제됩니다. 계속하시겠습니까?`)) return;

            showLoading();
            try {
                const res = await fetch('/api/backup/import?confirm=true', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: text
                });
                const result = await res.json();
                if (result.success) {
                    showToast(`${result.total_rows}건 복원 완료. 새로고침합니다.`, 'success');
                    setTimeout(() => location.reload(), 1500);
                } else {
                    showToast('복원 실패: ' + (result.error || ''), 'error');
                }
            } catch (e) {
                showToast('복원 실패', 'error');
            }
            hideLoading();
        }

        async function loadBackupLog() {
            const container = document.getElementById('backup-log-table');
            if (!container) return;

            try {
                const res = await fetch('/api/backup/log');
                const data = await res.json();
                const logs = data.logs || [];

                if (logs.length === 0) {
                    container.innerHTML = '<p style="color: #888; text-align: center; padding: 20px;">이력이 없습니다.</p>';
                    return;
                }

                container.innerHTML = `<table><thead><tr>
                    <th>유형</th><th>테이블수</th><th>총 행수</th><th>일시</th>
                </tr></thead><tbody>` + logs.map(l => `<tr>
                    <td>${l.backup_type === 'export' ? '내보내기' : '가져오기'}</td>
                    <td>${l.table_count}</td><td>${l.total_rows}</td>
                    <td>${l.created_at || ''}</td>
                </tr>`).join('') + '</tbody></table>';
            } catch (e) { container.innerHTML = '<p style="color: #e74c3c;">로드 실패</p>'; }
        }

        // ==================== showPage 확장 ====================
        const _origShowPage = showPage;
        showPage = function(pageId) {
            _origShowPage(pageId);
            if (pageId === 'vendor-report') loadVendorReport();
            if (pageId === 'upload-history') loadUploadHistory();
            if (pageId === 'backup-restore') loadBackupLog();
        };

        // ==================== 최종 초기화 훅 ====================
        const _phase3InitializeApp = initializeApp;
        initializeApp = async function() {
            await _phase3InitializeApp();
            updateOrderVendorFilter();
            updateReportVendorFilter();
            loadFilterPresets();
            loadInventory();
            // 알림 초기화
            generateNotifications().then(() => checkNotifications());
        };

        // 알림 패널 외부 클릭 시 닫기
        document.addEventListener('click', function(e) {
            const panel = document.getElementById('notification-panel');
            if (panel && panel.classList.contains('show')) {
                if (!e.target.closest('.notification-bell') && !e.target.closest('.notification-panel')) {
                    panel.classList.remove('show');
                }
            }
        });

        // ==================== AI-Native 기능 ====================

        // ===== A-1: 퍼지 SKU 매칭 =====
        async function fuzzyMatchItems(vendorName, items) {
            try {
                const res = await fetch('/api/fuzzy-match', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ vendor_name: vendorName, items })
                });
                return await res.json();
            } catch (e) {
                console.error('퍼지 매칭 실패:', e);
                return { results: [] };
            }
        }

        function getConfidenceBadge(confidence) {
            if (confidence >= 0.8) return `<span class="status-badge confidence-high">${(confidence * 100).toFixed(0)}%</span>`;
            if (confidence >= 0.6) return `<span class="status-badge confidence-medium">${(confidence * 100).toFixed(0)}%</span>`;
            return `<span class="status-badge confidence-low">${(confidence * 100).toFixed(0)}%</span>`;
        }

        // ===== A-2: 원가 이상 감지 =====
        function showCostAnomalyAlert(anomaly) {
            const modal = document.getElementById('cost-anomaly-modal');
            const content = document.getElementById('cost-anomaly-content');
            const severity = anomaly.severity === 'danger' ? 'danger' : 'warning';
            content.innerHTML = `
                <div class="anomaly-alert ${severity}">
                    <h4 style="margin-bottom: 8px;">${severity === 'danger' ? '위험' : '주의'} - 원가 이상 감지</h4>
                    <p>${anomaly.reason}</p>
                    ${anomaly.z_score ? `<p style="margin-top: 8px; font-size: 13px;">Z-score: ${anomaly.z_score}</p>` : ''}
                    ${anomaly.change_pct ? `<p style="font-size: 13px;">변동률: ${anomaly.change_pct}%</p>` : ''}
                </div>
            `;
            modal.classList.add('show');
        }

        // 기존 savePart/savePackaging 응답에서 anomaly 체크
        const _origSavePart = typeof savePart === 'function' ? savePart : null;
        const _origSavePackaging = typeof savePackaging === 'function' ? savePackaging : null;

        // ===== A-3: 수익성 분석 =====
        async function loadProfitability() {
            const tableEl = document.getElementById('profitability-table');
            const summaryEl = document.getElementById('profitability-summary');
            if (!tableEl) return;

            try {
                const res = await fetch('/api/profitability');
                const data = await res.json();
                const products = data.products || [];
                const summary = data.summary || {};

                // 요약 카드
                summaryEl.innerHTML = `
                    <div class="stat-card">
                        <div class="stat-value">${(summary.avg_margin_rate * 100).toFixed(1)}%</div>
                        <div class="stat-label">평균 마진율</div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-value" style="font-size: 16px;">${summary.best_sku || '-'}</div>
                        <div class="stat-label">최고 수익 SKU</div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-value" style="font-size: 16px;">${summary.worst_sku || '-'}</div>
                        <div class="stat-label">최저 수익 SKU</div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-value" style="color: ${summary.needs_improvement > 0 ? 'var(--danger-color)' : 'var(--success-color)'}">
                            ${summary.needs_improvement}
                        </div>
                        <div class="stat-label">개선 필요 상품</div>
                    </div>
                `;

                // 테이블
                if (products.length === 0) {
                    tableEl.innerHTML = '<p style="color: #888; text-align: center; padding: 20px;">데이터가 없습니다.</p>';
                    return;
                }

                tableEl.innerHTML = `<table><thead><tr>
                    <th>SKU명</th><th>판매가</th><th>원가</th><th>마진</th><th>마진율</th><th>등급</th><th>상세</th>
                </tr></thead><tbody>` + products.map(p => `<tr>
                    <td>${p.sku_name}</td>
                    <td>${(p.selling_price || 0).toLocaleString()}원</td>
                    <td>${(p.total_cost || 0).toLocaleString()}원</td>
                    <td style="color: ${p.margin >= 0 ? 'var(--success-color)' : 'var(--danger-color)'}">
                        ${(p.margin || 0).toLocaleString()}원
                    </td>
                    <td>${(p.margin_rate * 100).toFixed(1)}%</td>
                    <td><span class="grade-badge grade-${p.grade}">${p.grade}</span></td>
                    <td><button class="btn btn-small btn-secondary" onclick="showProfitabilityDetail(${p.sku_id})">상세</button></td>
                </tr>`).join('') + '</tbody></table>';
            } catch (e) {
                tableEl.innerHTML = '<p style="color: #e74c3c;">로드 실패</p>';
            }
        }

        async function showProfitabilityDetail(skuId) {
            try {
                const res = await fetch(`/api/profitability/${skuId}`);
                const data = await res.json();
                const modal = document.getElementById('profitability-detail-modal');
                const content = document.getElementById('profitability-detail-content');
                const title = document.getElementById('profitability-detail-title');

                title.textContent = data.sku_name || '원가 상세';
                const maxCost = Math.max(...(data.details || []).map(d => d.cost), data.packaging_cost || 0, 1);

                let html = `
                    <div class="result-summary">
                        <div class="summary-item"><span class="label">판매가:</span><span class="value">${(data.selling_price || 0).toLocaleString()}원</span></div>
                        <div class="summary-item"><span class="label">총 원가:</span><span class="value">${(data.total_cost || 0).toLocaleString()}원</span></div>
                        <div class="summary-item"><span class="label">마진:</span><span class="value" style="color:${data.margin >= 0 ? 'var(--success-color)' : 'var(--danger-color)'}">${(data.margin || 0).toLocaleString()}원 (${(data.margin_rate * 100).toFixed(1)}%)</span></div>
                        <div class="summary-item"><span class="label">등급:</span><span class="grade-badge grade-${data.grade}">${data.grade}</span></div>
                    </div>
                    <h4 style="margin: 16px 0 8px;">구성품 원가 분해</h4>
                    <div class="bar-chart">
                `;
                (data.details || []).forEach(d => {
                    const pct = maxCost > 0 ? (d.cost / maxCost * 100) : 0;
                    html += `<div class="bar-row">
                        <span class="bar-label">${d.part_name} (${d.weight}g)</span>
                        <div class="bar-track"><div class="bar-fill" style="width:${pct}%"></div></div>
                        <span class="bar-value">${d.cost.toLocaleString()}원</span>
                    </div>`;
                });
                if (data.packaging_cost > 0) {
                    const pct = (data.packaging_cost / maxCost * 100);
                    html += `<div class="bar-row">
                        <span class="bar-label">${data.packaging_name || '포장재'}</span>
                        <div class="bar-track"><div class="bar-fill" style="width:${pct}%; background: linear-gradient(90deg, #f39c12, #e67e22);"></div></div>
                        <span class="bar-value">${data.packaging_cost.toLocaleString()}원</span>
                    </div>`;
                }
                html += '</div>';

                if (data.suggestions && data.suggestions.length > 0) {
                    html += '<h4 style="margin: 16px 0 8px;">개선 제안</h4><ul style="font-size: 13px; color: #666;">';
                    data.suggestions.forEach(s => { html += `<li style="margin-bottom: 4px;">${s}</li>`; });
                    html += '</ul>';
                }

                content.innerHTML = html;
                modal.classList.add('show');
            } catch (e) {
                showToast('상세 조회 실패', 'error');
            }
        }

        // ===== A-4: 거래처 성과 =====
        async function loadVendorPerformance(period = 30) {
            const container = document.getElementById('vendor-report-content');
            if (!container) return;

            try {
                const res = await fetch(`/api/vendor-performance?period=${period}`);
                const data = await res.json();
                const vendors = data.vendors || [];

                if (vendors.length === 0) {
                    container.innerHTML += '<p style="color: #888; text-align: center; padding: 20px;">성과 데이터가 없습니다.</p>';
                    return;
                }

                let html = '<div style="margin-top: 24px;"><h4 style="margin-bottom: 16px;">거래처 성과 순위</h4>';
                html += `<table><thead><tr>
                    <th>순위</th><th>거래처</th><th>주문수</th><th>총점</th><th>등급</th>
                    <th>출고율</th><th>입금율</th><th>계산서율</th><th>처리속도</th>
                </tr></thead><tbody>`;
                vendors.forEach((v, i) => {
                    const m = v.metrics;
                    html += `<tr>
                        <td>${i + 1}</td>
                        <td><strong>${v.vendor_name}</strong></td>
                        <td>${v.total_orders}</td>
                        <td><strong>${v.score}</strong></td>
                        <td><span class="grade-badge grade-${v.grade}">${v.grade}</span></td>
                        <td>${m.shipped_rate}%</td>
                        <td>${m.paid_rate}%</td>
                        <td>${m.invoice_rate}%</td>
                        <td>${m.avg_processing_days ? m.avg_processing_days + '일' : '-'}</td>
                    </tr>`;
                });
                html += '</tbody></table></div>';
                container.innerHTML += html;
            } catch (e) {
                console.error('거래처 성과 로드 실패:', e);
            }
        }

        // ===== A-5: 스마트 중복 감지 =====
        let _pendingDuplicateCallback = null;

        async function checkSmartDuplicates(orders) {
            try {
                const res = await fetch('/api/orders/check-duplicates', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ orders })
                });
                return await res.json();
            } catch (e) {
                console.error('중복 감지 실패:', e);
                return { duplicates: [] };
            }
        }

        function showDuplicateModal(duplicates) {
            const modal = document.getElementById('duplicate-modal');
            const content = document.getElementById('duplicate-modal-content');

            let html = `<p style="margin-bottom: 16px; color: var(--danger-color);">
                <strong>${duplicates.length}건</strong>의 중복 가능성이 감지되었습니다.
            </p>`;

            duplicates.forEach(d => {
                const order = d.order;
                const matches = d.matches || [];
                html += `<div class="card" style="margin-bottom: 12px; padding: 12px;">
                    <strong>새 주문: ${order.recipient || ''} - ${order.sku_name || ''}</strong>`;
                matches.forEach(m => {
                    const ex = m.existing_order || {};
                    const breakdown = m.breakdown || {};
                    html += `<div style="margin-top: 8px; padding: 8px; background: #f8f9fa; border-radius: 4px;">
                        <div style="display: flex; justify-content: space-between; margin-bottom: 4px;">
                            <span>유사도: <strong>${m.score}점</strong></span>
                            <span class="status-badge ${m.score >= 80 ? 'not-paid' : 'not-shipped'}">${m.score >= 80 ? '높음' : '중간'}</span>
                        </div>
                        <div style="font-size: 12px; color: #666;">
                            기존: ${ex.recipient || ''} / ${ex.sku_name || ''} / ${ex.address || ''}
                        </div>
                        <div style="font-size: 11px; color: #999; margin-top: 4px;">
                            수령인: ${breakdown.recipient || 0}점 | 전화: ${breakdown.phone || 0}점 | 주소: ${breakdown.address || 0}점 | SKU: ${breakdown.sku || 0}점
                        </div>
                    </div>`;
                });
                html += '</div>';
            });

            content.innerHTML = html;
            modal.classList.add('show');
        }

        function proceedDespiteDuplicates() {
            document.getElementById('duplicate-modal').classList.remove('show');
            if (_pendingDuplicateCallback) {
                _pendingDuplicateCallback();
                _pendingDuplicateCallback = null;
            }
        }

        // ===== A-6: 수요 예측 =====
        async function loadForecast() {
            const tableEl = document.getElementById('forecast-table');
            const partsEl = document.getElementById('forecast-parts');
            if (!tableEl) return;

            const days = document.getElementById('forecast-days')?.value || 7;

            try {
                const [forecastRes, partsRes] = await Promise.all([
                    fetch(`/api/forecast?days=${days}`),
                    fetch(`/api/forecast/parts?days=${days}`)
                ]);

                const forecastData = await forecastRes.json();
                const partsData = await partsRes.json();
                const forecasts = forecastData.forecasts || [];

                if (forecasts.length === 0) {
                    tableEl.innerHTML = '<p style="color: #888; text-align: center; padding: 20px;">예측할 주문 데이터가 없습니다.</p>';
                } else {
                    const trendIcon = t => t === 'up' ? '<span class="trend-up">↑</span>' : t === 'down' ? '<span class="trend-down">↓</span>' : '<span class="trend-stable">→</span>';
                    tableEl.innerHTML = `<table><thead><tr>
                        <th>SKU명</th><th>${days}일 예측</th><th>신뢰구간</th><th>추세</th>
                    </tr></thead><tbody>` + forecasts.map(f => `<tr>
                        <td>${f.sku_name}</td>
                        <td><strong>${f.total_predicted}</strong>개</td>
                        <td>${f.confidence_low} ~ ${f.confidence_high}</td>
                        <td>${trendIcon(f.trend)}</td>
                    </tr>`).join('') + '</tbody></table>';
                }

                // 부위별 소요량
                const parts = partsData.parts || [];
                if (parts.length === 0) {
                    partsEl.innerHTML = '<p style="color: #888;">소요량 데이터가 없습니다.</p>';
                } else {
                    const maxKg = Math.max(...parts.map(p => p.weight_needed_kg), 1);
                    partsEl.innerHTML = '<div class="bar-chart">' + parts.map(p => {
                        const pct = (p.weight_needed_kg / maxKg * 100);
                        return `<div class="bar-row">
                            <span class="bar-label">${p.part_name}</span>
                            <div class="bar-track"><div class="bar-fill" style="width:${pct}%"></div></div>
                            <span class="bar-value">${p.weight_needed_kg}kg</span>
                        </div>`;
                    }).join('') + '</div>';
                }
            } catch (e) {
                tableEl.innerHTML = '<p style="color: #e74c3c;">예측 로드 실패</p>';
            }
        }

        // ===== A-7: 스마트 발주 =====
        let smartOrderData = [];

        async function loadSmartOrder() {
            const tableEl = document.getElementById('smart-order-table');
            const summaryEl = document.getElementById('smart-order-summary');
            if (!tableEl) return;

            try {
                const res = await fetch('/api/smart-order/recommendations?days=7');
                const data = await res.json();
                smartOrderData = data.recommendations || [];
                const summary = data.summary || {};

                summaryEl.innerHTML = `
                    <div class="stat-card">
                        <div class="stat-value">${summary.total_items || 0}</div>
                        <div class="stat-label">추천 상품 수</div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-value" style="color: var(--danger-color);">${summary.critical_count || 0}</div>
                        <div class="stat-label">긴급 발주</div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-value" style="color: var(--warning-color);">${summary.high_count || 0}</div>
                        <div class="stat-label">높은 우선순위</div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-value">${summary.total_recommended_qty || 0}</div>
                        <div class="stat-label">총 추천 수량</div>
                    </div>
                `;

                if (smartOrderData.length === 0) {
                    tableEl.innerHTML = '<p style="color: #888; text-align: center; padding: 20px;">발주 추천이 없습니다.</p>';
                    return;
                }

                tableEl.innerHTML = `<table><thead><tr>
                    <th><input type="checkbox" onclick="toggleAllSmartOrder(this)"></th>
                    <th>SKU명</th><th>현재고</th><th>예상수요</th><th>추천수량</th>
                    <th>재고소진</th><th>긴급도</th><th>추세</th>
                </tr></thead><tbody>` + smartOrderData.map((r, i) => {
                    const trendIcon = r.trend === 'up' ? '<span class="trend-up">↑</span>' : r.trend === 'down' ? '<span class="trend-down">↓</span>' : '<span class="trend-stable">→</span>';
                    return `<tr>
                        <td><input type="checkbox" class="smart-order-check" data-index="${i}" checked></td>
                        <td>${r.sku_name}</td>
                        <td>${r.current_stock}</td>
                        <td>${r.predicted_demand}</td>
                        <td><input type="number" value="${r.recommended_qty}" min="0" style="width: 70px;" class="smart-order-qty" data-index="${i}"></td>
                        <td>${r.days_until_stockout < 999 ? r.days_until_stockout + '일' : '충분'}</td>
                        <td><span class="urgency-badge urgency-${r.urgency}">${r.urgency}</span></td>
                        <td>${trendIcon}</td>
                    </tr>`;
                }).join('') + '</tbody></table>';
            } catch (e) {
                tableEl.innerHTML = '<p style="color: #e74c3c;">로드 실패</p>';
            }
        }

        function toggleAllSmartOrder(master) {
            document.querySelectorAll('.smart-order-check').forEach(cb => { cb.checked = master.checked; });
        }

        async function generateSmartOrderExcel() {
            const checkedItems = [];
            document.querySelectorAll('.smart-order-check:checked').forEach(cb => {
                const idx = parseInt(cb.dataset.index);
                const qtyInput = document.querySelector(`.smart-order-qty[data-index="${idx}"]`);
                const qty = qtyInput ? parseInt(qtyInput.value) : smartOrderData[idx].recommended_qty;
                checkedItems.push({ sku_name: smartOrderData[idx].sku_name, quantity: qty });
            });

            if (checkedItems.length === 0) {
                showToast('발주 항목을 선택하세요.', 'error');
                return;
            }

            try {
                const res = await fetch('/api/smart-order/generate', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ items: checkedItems })
                });
                const data = await res.json();

                // 거래처별 엑셀 생성
                const wb = XLSX.utils.book_new();
                Object.entries(data.vendor_groups || {}).forEach(([vendor, items]) => {
                    const wsData = [['SKU명', '수량']].concat(items.map(i => [i.sku_name, i.quantity]));
                    const ws = XLSX.utils.aoa_to_sheet(wsData);
                    XLSX.utils.book_append_sheet(wb, ws, vendor.substring(0, 31));
                });

                if (data.unassigned && data.unassigned.length > 0) {
                    const wsData = [['SKU명', '수량']].concat(data.unassigned.map(i => [i.sku_name, i.quantity]));
                    const ws = XLSX.utils.aoa_to_sheet(wsData);
                    XLSX.utils.book_append_sheet(wb, ws, '미배정');
                }

                XLSX.writeFile(wb, `발주서_${new Date().toISOString().slice(0,10)}.xlsx`);
                showToast('발주서 생성 완료', 'success');
            } catch (e) {
                showToast('발주서 생성 실패', 'error');
            }
        }

        // ===== showPage 확장 (AI-Native) =====
        const _aiNativeShowPage = showPage;
        showPage = function(pageId) {
            _aiNativeShowPage(pageId);
            if (pageId === 'profitability') loadProfitability();
            if (pageId === 'forecast') loadForecast();
            if (pageId === 'smart-order') loadSmartOrder();
            if (pageId === 'vendor-report') loadVendorPerformance();
        };