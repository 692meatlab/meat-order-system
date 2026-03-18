// ==================== app.ui.js ====================
// UI 렌더링 (달력, 메뉴, 테이블, 모달), select/filter 업데이트

        // ==================== 사용자 메뉴 렌더링 ====================
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

        // ==================== 달력 렌더링 ====================
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

        // ==================== 테이블 렌더링 ====================
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
                            <th>작업</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${skuProducts.map(sku => {
                            var compText = (sku.compositions || []).map(function(c) {
                                return c.part_name + ' ' + c.weight + 'g';
                            }).join(', ') || '-';
                            return `
                                <tr>
                                    <td>${escapeHtml(sku.sku_name)}</td>
                                    <td>${escapeHtml(sku.packaging || '-')}</td>
                                    <td>${(sku.selling_price || 0).toLocaleString()}원</td>
                                    <td style="max-width: 300px; overflow: hidden; text-overflow: ellipsis;">${escapeHtml(compText)}</td>
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

        function openAddPackagingModal() {
            document.getElementById('packaging-name').value = '';
            document.getElementById('packaging-price').value = '';
            document.getElementById('packaging-modal').classList.add('show');
        }

        function closePackagingModal() {
            document.getElementById('packaging-modal').classList.remove('show');
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

        // ==================== Select/Filter 업데이트 ====================
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
