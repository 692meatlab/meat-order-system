// ==================== app.ui.js ====================
// UI 렌더링 (달력, 메뉴, 테이블, 모달), select/filter 업데이트
window.AppUI = (function() {
    'use strict';

    // ==================== 사용자 메뉴 렌더링 ====================
    function renderUserMenus() {
        var container = document.getElementById('user-menus');
        if (!container) return;

        container.innerHTML = window.userList.map(function(user) {
            return '<div class="user-dropdown">' +
                '<div class="user-dropdown-header ' + (window.currentUser === user.name ? 'active' : '') + '"' +
                ' onclick="toggleUserMenu(\'' + user.name + '\')">' +
                '<span class="user-name"><span class="icon">&#x1F464;</span> ' + escapeHtml(user.name) + '</span>' +
                '<span class="arrow">&#x25BC;</span></div>' +
                '<div class="user-dropdown-menu" id="user-menu-' + user.id + '">' +
                '<div class="menu-item" onclick="showUserPage(\'convert\', \'' + user.name + '\', ' + user.id + ')">' +
                '<span class="icon">&#x1F4E5;</span> 발주서 변환</div>' +
                '<div class="menu-item" onclick="showUserPage(\'confirmed\', \'' + user.name + '\', ' + user.id + ')">' +
                '<span class="icon">&#x2705;</span> 변환확정' +
                '<span class="badge" id="badge-confirmed-' + user.id + '" style="display:none;">0</span></div>' +
                '<div class="menu-item" onclick="showUserPage(\'order-management\', \'' + user.name + '\', ' + user.id + ')">' +
                '<span class="icon">&#x1F4CB;</span> 전체주문관리' +
                '<span class="badge" id="badge-order-' + user.id + '" style="display:none;">0</span></div>' +
                (window.userList.length > 1 ? '<div class="menu-item" style="padding-left: 48px; font-size: 11px; color: #e74c3c; border-top: 1px solid rgba(255,255,255,0.05);" onclick="event.stopPropagation(); deleteUser(' + user.id + ', \'' + escapeHtml(user.name) + '\')">' +
                '<span class="icon">&#x1F5D1;&#xFE0F;</span> 삭제</div>' : '') +
                '</div></div>';
        }).join('');
    }

    function toggleUserMenu(userName) {
        window.currentUser = userName;
        var user = window.userList.find(function(u) { return u.name === userName; });
        if (!user) return;

        // 모든 드롭다운 닫기
        document.querySelectorAll('.user-dropdown-header').forEach(function(el) {
            el.classList.remove('expanded', 'active');
        });
        document.querySelectorAll('.user-dropdown-menu').forEach(function(el) {
            el.classList.remove('show');
        });

        // 선택한 드롭다운 열기
        var header = document.querySelector('.user-dropdown-header[onclick="toggleUserMenu(\'' + userName + '\')"]');
        var menu = document.getElementById('user-menu-' + user.id);
        if (header && menu) {
            header.classList.add('expanded', 'active');
            menu.classList.add('show');
        }
    }

    // ==================== 달력 렌더링 ====================
    function renderCalendarWithData(data) {
        window.calendarData = data;
        renderCalendarInternal(data);
    }

    async function renderCalendar() {
        showLoading();
        var data = await loadCalendarData();
        window.calendarData = data;
        renderCalendarInternal(data);
        hideLoading();
    }

    function renderCalendarInternal(data) {
        var firstDay = new Date(window.currentYear, window.currentMonth, 1);
        var lastDay = new Date(window.currentYear, window.currentMonth + 1, 0);
        var prevLastDay = new Date(window.currentYear, window.currentMonth, 0);
        var firstDayOfWeek = firstDay.getDay();
        var lastDate = lastDay.getDate();
        var prevLastDate = prevLastDay.getDate();

        document.getElementById('calendar-title').textContent = window.currentYear + '년 ' + (window.currentMonth + 1) + '월';

        var grid = document.getElementById('calendar-grid');
        grid.innerHTML = '';

        // 요일 헤더
        var days = ['일', '월', '화', '수', '목', '금', '토'];
        days.forEach(function(day, index) {
            var header = document.createElement('div');
            header.className = 'calendar-day-header';
            if (index === 0) header.classList.add('sunday');
            if (index === 6) header.classList.add('saturday');
            header.textContent = day;
            grid.appendChild(header);
        });

        // 이전 달
        for (var i = firstDayOfWeek - 1; i >= 0; i--) {
            var day = prevLastDate - i;
            var cell = createDayCell(window.currentYear, window.currentMonth - 1, day, true, data);
            grid.appendChild(cell);
        }

        // 현재 달
        for (var d = 1; d <= lastDate; d++) {
            var cell2 = createDayCell(window.currentYear, window.currentMonth, d, false, data);
            grid.appendChild(cell2);
        }

        // 다음 달
        var totalCells = grid.children.length - 7;
        var remainingCells = 42 - totalCells;
        for (var nd = 1; nd <= remainingCells; nd++) {
            var cell3 = createDayCell(window.currentYear, window.currentMonth + 1, nd, true, data);
            grid.appendChild(cell3);
        }
    }

    function createDayCell(year, month, day, isOtherMonth, calData) {
        var cell = document.createElement('div');
        cell.className = 'calendar-day';

        var date = new Date(year, month, day);
        var dateKey = formatDateKey(date);
        var dayOfWeek = date.getDay();

        if (isOtherMonth) cell.classList.add('other-month');
        if (dayOfWeek === 0) cell.classList.add('sunday');
        if (dayOfWeek === 6) cell.classList.add('saturday');

        var today = new Date();
        if (date.toDateString() === today.toDateString()) {
            cell.classList.add('today');
        }

        var numberDiv = document.createElement('div');
        numberDiv.className = 'calendar-day-number';
        numberDiv.textContent = day;
        cell.appendChild(numberDiv);

        var ordersDiv = document.createElement('div');
        ordersDiv.className = 'calendar-day-orders';

        var dayData = calData[dateKey];
        if (dayData && dayData.order_count > 0) {
            ordersDiv.innerHTML = '<span class="calendar-order-count">' + dayData.order_count + '건 (' + dayData.total_qty + '개)</span>';
        }

        cell.appendChild(ordersDiv);
        cell.onclick = function() { openDayModal(dateKey); };

        return cell;
    }

    function changeMonth(delta) {
        window.currentMonth += delta;
        if (window.currentMonth < 0) {
            window.currentMonth = 11;
            window.currentYear--;
        } else if (window.currentMonth > 11) {
            window.currentMonth = 0;
            window.currentYear++;
        }
        renderCalendar();
    }

    function goToToday() {
        window.currentYear = new Date().getFullYear();
        window.currentMonth = new Date().getMonth();
        renderCalendar();
    }

    // ==================== 테이블 렌더링 ====================
    function renderPartsTable() {
        var container = document.getElementById('parts-table');
        if (!container) return;

        var parts = Object.entries(window.partsData);
        if (parts.length === 0) {
            container.innerHTML = '<p style="color: #888; text-align: center; padding: 20px;">등록된 부위가 없습니다.</p>';
            return;
        }

        container.innerHTML = '<table><thead><tr>' +
            '<th>등급</th><th>부위명</th><th>100g당 원가</th><th>타입</th><th>작업</th>' +
            '</tr></thead><tbody>' +
            parts.map(function(entry) {
                var name = entry[0];
                var data = entry[1];
                var typeLabel = data.type === 'unit' ? '1개당' : '100g당';
                return '<tr>' +
                    '<td>' + escapeHtml(data.grade || '') + '</td>' +
                    '<td>' + escapeHtml(name) + '</td>' +
                    '<td>' + (data.price || 0).toLocaleString() + '원</td>' +
                    '<td><span class="unit-badge unit-' + (data.type || 'weight') + '">' + typeLabel + '</span></td>' +
                    '<td>' +
                    '<button class="btn btn-secondary btn-small" onclick="editPart(\'' + escapeHtml(name) + '\')">수정</button>' +
                    '<button class="btn btn-danger btn-small" onclick="deletePart(\'' + escapeHtml(name) + '\')">삭제</button>' +
                    '</td></tr>';
            }).join('') +
            '</tbody></table>';
    }

    function renderPackagingTable() {
        var container = document.getElementById('packaging-table');
        if (!container) return;

        var pkgs = Object.entries(window.packagingData);
        if (pkgs.length === 0) {
            container.innerHTML = '<p style="color: #888; text-align: center; padding: 20px;">등록된 포장재가 없습니다.</p>';
            return;
        }

        container.innerHTML = '<table><thead><tr>' +
            '<th>포장재명</th><th>가격</th><th>작업</th>' +
            '</tr></thead><tbody>' +
            pkgs.map(function(entry) {
                var name = entry[0];
                var price = entry[1];
                return '<tr>' +
                    '<td>' + escapeHtml(name) + '</td>' +
                    '<td>' + price.toLocaleString() + '원</td>' +
                    '<td>' +
                    '<button class="btn btn-secondary btn-small" onclick="editPackaging(\'' + escapeHtml(name) + '\')">수정</button>' +
                    '<button class="btn btn-danger btn-small" onclick="deletePackaging(\'' + escapeHtml(name) + '\')">삭제</button>' +
                    '</td></tr>';
            }).join('') +
            '</tbody></table>';
    }

    function renderSkuTable() {
        var container = document.getElementById('sku-table');
        if (!container) return;

        if (window.skuProducts.length === 0) {
            container.innerHTML = '<p style="color: #888; text-align: center; padding: 20px;">등록된 SKU 상품이 없습니다.</p>';
            return;
        }

        container.innerHTML = '<table><thead><tr>' +
            '<th>상품명</th><th>포장재</th><th>판매가격</th><th>구성품</th><th>작업</th>' +
            '</tr></thead><tbody>' +
            window.skuProducts.map(function(sku) {
                var compText = (sku.compositions || []).map(function(c) {
                    return c.part_name + ' ' + c.weight + 'g';
                }).join(', ') || '-';
                return '<tr>' +
                    '<td>' + escapeHtml(sku.sku_name) + '</td>' +
                    '<td>' + escapeHtml(sku.packaging || '-') + '</td>' +
                    '<td>' + (sku.selling_price || 0).toLocaleString() + '원</td>' +
                    '<td style="max-width: 300px; overflow: hidden; text-overflow: ellipsis;">' + escapeHtml(compText) + '</td>' +
                    '<td>' +
                    '<button class="btn btn-primary btn-small" onclick="editSku(' + sku.id + ')">수정</button>' +
                    '<button class="btn btn-danger btn-small" onclick="deleteSku(' + sku.id + ')">삭제</button>' +
                    '</td></tr>';
            }).join('') +
            '</tbody></table>';
    }

    function renderVendorMappingTable() {
        var container = document.getElementById('vendor-mapping-table');
        if (!container) return;

        var vendorFilterEl = document.getElementById('vendor-filter');
        var vendor = vendorFilterEl ? vendorFilterEl.value : '';
        var filtered = vendor ? window.vendorMappings.filter(function(m) { return m.vendor_name === vendor; }) : window.vendorMappings;

        if (filtered.length === 0) {
            container.innerHTML = '<p style="color: #888; text-align: center; padding: 20px;">등록된 매핑이 없습니다.</p>';
            return;
        }

        container.innerHTML = '<table><thead><tr>' +
            '<th>거래처</th><th>상품코드</th><th>거래처 상품명</th><th>매칭 SKU</th><th>작업</th>' +
            '</tr></thead><tbody>' +
            filtered.map(function(m) {
                return '<tr>' +
                    '<td>' + escapeHtml(m.vendor_name) + '</td>' +
                    '<td>' + escapeHtml(m.product_code || '-') + '</td>' +
                    '<td>' + escapeHtml(m.product_name || '-') + '</td>' +
                    '<td>' + escapeHtml(m.sku_name || '미매칭') + '</td>' +
                    '<td><button class="btn btn-danger btn-small" onclick="deleteMapping(' + m.id + ')">삭제</button></td>' +
                    '</tr>';
            }).join('') +
            '</tbody></table>';
    }

    function renderIntegratedOrders(orders, stats) {
        var summaryEl = document.getElementById('integrated-summary');
        var tableEl = document.getElementById('integrated-table');

        summaryEl.innerHTML =
            '<div class="summary-item"><span class="label">전체:</span><span class="value">' + (stats.total || 0) + '건</span></div>' +
            '<div class="summary-item"><span class="label">출고완료:</span><span class="value">' + (stats.shipped_count || 0) + '건</span></div>' +
            '<div class="summary-item"><span class="label">입금완료:</span><span class="value">' + (stats.paid_count || 0) + '건</span></div>';

        if (orders.length === 0) {
            tableEl.innerHTML = '<p style="color: #888; text-align: center; padding: 20px;">조회된 주문이 없습니다.</p>';
            return;
        }

        tableEl.innerHTML = '<table><thead><tr>' +
            '<th>출고일</th><th>담당자</th><th>거래처</th><th>SKU</th><th>수량</th><th>수령인</th><th>출고</th><th>입금</th>' +
            '</tr></thead><tbody>' +
            orders.map(function(o) {
                return '<tr>' +
                    '<td>' + (o.release_date ? new Date(o.release_date).toLocaleDateString('ko-KR') : '-') + '</td>' +
                    '<td>' + escapeHtml(o.user_name || '-') + '</td>' +
                    '<td>' + escapeHtml(o.vendor_name || '-') + '</td>' +
                    '<td>' + escapeHtml(o.sku_name || '-') + '</td>' +
                    '<td>' + o.quantity + '</td>' +
                    '<td>' + escapeHtml(o.recipient || '-') + '</td>' +
                    '<td><span class="status-badge ' + (o.shipped ? 'shipped' : 'not-shipped') + '">' + (o.shipped ? '출고' : '미출고') + '</span></td>' +
                    '<td><span class="status-badge ' + (o.paid ? 'paid' : 'not-paid') + '">' + (o.paid ? '입금' : '미입금') + '</span></td>' +
                    '</tr>';
            }).join('') +
            '</tbody></table>';
    }

    // ==================== 기간별 발주량 계산 ====================
    async function calculateRangeOrder() {
        var startStr = document.getElementById('range-start').value;
        var endStr = document.getElementById('range-end').value;

        if (!startStr || !endStr) {
            showToast('시작일과 종료일을 선택해주세요.', 'error');
            return;
        }

        showLoading();
        var res = await fetch('/api/dashboard/range-orders?start=' + startStr + '&end=' + endStr);
        var data = await res.json();
        hideLoading();

        var skuSummary = data.sku_summary || [];
        if (skuSummary.length === 0) {
            document.getElementById('range-result').innerHTML = '<div class="status show info">선택한 기간에 등록된 배송이 없습니다.</div>';
            return;
        }

        var html = '<div class="result-box"><h3>발주량 계산 결과</h3>';

        // 주문 목록
        html += '<h4>주문 목록</h4>';
        html += '<table style="width: 100%; border-collapse: collapse; font-size: 13px;">' +
            '<thead><tr style="background: #f5f5f5;">' +
            '<th style="padding: 8px; border: 1px solid #ddd;">SKU</th>' +
            '<th style="padding: 8px; border: 1px solid #ddd; text-align: center;">주문건수</th>' +
            '<th style="padding: 8px; border: 1px solid #ddd; text-align: center;">총수량</th>' +
            '</tr></thead><tbody>' +
            skuSummary.map(function(item) {
                return '<tr>' +
                    '<td style="padding: 8px; border: 1px solid #ddd;">' + escapeHtml(item.sku_name || '-') + '</td>' +
                    '<td style="padding: 8px; border: 1px solid #ddd; text-align: center;">' + item.order_count + '건</td>' +
                    '<td style="padding: 8px; border: 1px solid #ddd; text-align: center; font-weight: 600;">' + item.total_qty + '개</td></tr>';
            }).join('') +
            '</tbody></table>';

        // 부위별 집계
        var partTotals = {};
        skuSummary.forEach(function(item) {
            var sku = window.skuProducts.find(function(s) { return s.sku_name === item.sku_name; });
            if (sku && sku.compositions) {
                sku.compositions.forEach(function(comp) {
                    var key = comp.part_name;
                    if (!partTotals[key]) partTotals[key] = { weight: 0, packs: 0 };
                    partTotals[key].weight += comp.weight * item.total_qty;
                    partTotals[key].packs += item.total_qty;
                });
            }
        });

        if (Object.keys(partTotals).length > 0) {
            html += '<div style="display: flex; gap: 16px; flex-wrap: wrap; margin-top: 16px;">';

            // 패킹 수량
            html += '<div style="flex: 1; min-width: 200px;"><h4>패킹 수량</h4>' +
                '<table style="width: 100%; border-collapse: collapse; font-size: 13px;">' +
                '<thead><tr style="background: #f5f5f5;">' +
                '<th style="padding: 6px; border: 1px solid #ddd;">품목</th>' +
                '<th style="padding: 6px; border: 1px solid #ddd; text-align: center;">수량</th>' +
                '</tr></thead><tbody>' +
                Object.entries(partTotals).map(function(entry) {
                    return '<tr><td style="padding: 6px; border: 1px solid #ddd;">' + escapeHtml(entry[0]) + '</td>' +
                        '<td style="padding: 6px; border: 1px solid #ddd; text-align: center; font-weight: 600;">' + entry[1].packs + '팩</td></tr>';
                }).join('') +
                '</tbody></table></div>';

            // 총 중량
            html += '<div style="flex: 1; min-width: 200px;"><h4>총 중량</h4>' +
                '<table style="width: 100%; border-collapse: collapse; font-size: 13px;">' +
                '<thead><tr style="background: #f5f5f5;">' +
                '<th style="padding: 6px; border: 1px solid #ddd;">품목</th>' +
                '<th style="padding: 6px; border: 1px solid #ddd; text-align: center;">kg</th>' +
                '<th style="padding: 6px; border: 1px solid #ddd; text-align: center;">g</th>' +
                '</tr></thead><tbody>' +
                Object.entries(partTotals).map(function(entry) {
                    return '<tr><td style="padding: 6px; border: 1px solid #ddd;">' + escapeHtml(entry[0]) + '</td>' +
                        '<td style="padding: 6px; border: 1px solid #ddd; text-align: center; font-weight: 600;">' + (entry[1].weight / 1000).toFixed(2) + '</td>' +
                        '<td style="padding: 6px; border: 1px solid #ddd; text-align: center;">' + entry[1].weight.toLocaleString() + '</td></tr>';
                }).join('') +
                '</tbody></table></div>';

            html += '</div>';
        }

        html += '</div>';
        document.getElementById('range-result').innerHTML = html;
    }

    // ==================== 모달 ====================
    function openDayModal(dateKey) {
        window.selectedDate = dateKey;
        var parts = dateKey.split('-');
        document.getElementById('day-modal-title').textContent = parts[0] + '년 ' + parseInt(parts[1]) + '월 ' + parseInt(parts[2]) + '일';
        document.getElementById('day-orders-list').innerHTML = '<p style="color: #888;">주문 정보를 불러오는 중...</p>';
        document.getElementById('day-calculation-result').innerHTML = '';
        document.getElementById('day-modal').classList.add('show');

        loadDayOrders(dateKey);
    }

    async function loadDayOrders(dateKey) {
        var res = await fetch('/api/integrated-orders?date_from=' + dateKey + '&date_to=' + dateKey + '&shipped=false');
        var data = await res.json();
        var orders = data.orders || [];

        var container = document.getElementById('day-orders-list');
        if (orders.length === 0) {
            container.innerHTML = '<p style="color: #888; text-align: center;">등록된 배송이 없습니다.</p>';
            return;
        }

        container.innerHTML = orders.map(function(o) {
            return '<div style="display: flex; justify-content: space-between; align-items: center; padding: 12px; background: ' + (o.shipped ? '#e8f5e9' : '#fff3e0') + '; border-radius: 8px; margin-bottom: 8px;">' +
                '<div><div style="font-weight: 600;">' + escapeHtml(o.vendor_name || '') + ' - ' + escapeHtml(o.recipient || '') + '</div>' +
                '<div style="color: #666; font-size: 13px;">' + escapeHtml(o.sku_name || '') + '</div></div>' +
                '<div style="font-weight: 700; font-size: 18px;">' + o.quantity + '</div>' +
                '<span class="status-badge ' + (o.shipped ? 'shipped' : 'not-shipped') + '">' + (o.shipped ? '출고완료' : '미출고') + '</span></div>';
        }).join('');
    }

    function closeDayModal() {
        document.getElementById('day-modal').classList.remove('show');
        window.selectedDate = null;
    }

    async function calculateDayOrder() {
        if (!window.selectedDate) return;
        await calculateRangeOrderInternal(window.selectedDate, window.selectedDate, 'day-calculation-result');
    }

    async function calculateRangeOrderInternal(start, end, targetId) {
        var res = await fetch('/api/dashboard/range-orders?start=' + start + '&end=' + end);
        var data = await res.json();
        var skuSummary = data.sku_summary || [];

        if (skuSummary.length === 0) {
            document.getElementById(targetId).innerHTML = '<div class="status show info">주문이 없습니다.</div>';
            return;
        }

        // 부위별 집계
        var partTotals = {};
        skuSummary.forEach(function(item) {
            var sku = window.skuProducts.find(function(s) { return s.sku_name === item.sku_name; });
            if (sku && sku.compositions) {
                sku.compositions.forEach(function(comp) {
                    var key = comp.part_name;
                    if (!partTotals[key]) partTotals[key] = { weight: 0, packs: 0 };
                    partTotals[key].weight += comp.weight * item.total_qty;
                    partTotals[key].packs += item.total_qty;
                });
            }
        });

        var html = '<div class="result-box" style="margin-top: 16px;"><h4>발주량 계산 결과</h4>';
        html += '<table style="width: 100%; border-collapse: collapse; font-size: 13px; margin-top: 8px;">' +
            '<thead><tr style="background: #f5f5f5;">' +
            '<th style="padding: 6px; border: 1px solid #ddd;">품목</th>' +
            '<th style="padding: 6px; border: 1px solid #ddd; text-align: center;">수량</th>' +
            '<th style="padding: 6px; border: 1px solid #ddd; text-align: center;">총중량</th>' +
            '</tr></thead><tbody>' +
            Object.entries(partTotals).map(function(entry) {
                return '<tr><td style="padding: 6px; border: 1px solid #ddd;">' + escapeHtml(entry[0]) + '</td>' +
                    '<td style="padding: 6px; border: 1px solid #ddd; text-align: center;">' + entry[1].packs + '팩</td>' +
                    '<td style="padding: 6px; border: 1px solid #ddd; text-align: center;">' + (entry[1].weight / 1000).toFixed(2) + 'kg</td></tr>';
            }).join('') +
            '</tbody></table></div>';

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
        var name = document.getElementById('new-user-name').value.trim();
        if (!name) {
            showToast('사용자 이름을 입력하세요.', 'error');
            return;
        }

        showLoading();
        try {
            await fetch('/api/users', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name: name, role: 'user' })
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
        if (window.userList.length <= 1) {
            alert('최소 1명의 사용자가 필요합니다.');
            return;
        }
        if (!confirm('"' + userName + '" 사용자를 삭제하시겠습니까?')) return;

        showLoading();
        try {
            await fetch('/api/users/' + userId, { method: 'DELETE' });
            await loadUsers();
            renderUserMenus();
            if (window.currentUser === userName && window.userList.length > 0) {
                showUserPage('convert', window.userList[0].name, window.userList[0].id);
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
        window.editingSkuId = null;
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
        var container = document.getElementById('composition-list');
        var row = document.createElement('div');
        row.className = 'form-row';
        row.style.marginBottom = '8px';
        row.innerHTML = '<div class="form-group" style="flex: 2;">' +
            '<select class="comp-part"><option value="">부위 선택</option>' +
            Object.keys(window.partsData).map(function(p) { return '<option value="' + escapeHtml(p) + '">' + escapeHtml(p) + '</option>'; }).join('') +
            '</select></div>' +
            '<div class="form-group" style="flex: 1;">' +
            '<input type="number" class="comp-weight" placeholder="중량(g)"></div>' +
            '<button type="button" class="btn btn-danger btn-small" onclick="this.parentElement.remove()">X</button>';
        container.appendChild(row);
    }

    function editSku(id) {
        var sku = window.skuProducts.find(function(s) { return s.id === id; });
        if (!sku) return;

        window.editingSkuId = id;
        document.getElementById('sku-modal-title').textContent = 'SKU 상품 수정';
        document.getElementById('sku-name').value = sku.sku_name;
        document.getElementById('sku-packaging').value = sku.packaging || '';
        document.getElementById('sku-price').value = sku.selling_price || '';

        var container = document.getElementById('composition-list');
        container.innerHTML = '';
        (sku.compositions || []).forEach(function(comp) {
            addCompositionRow();
            var rows = container.querySelectorAll('.form-row');
            var lastRow = rows[rows.length - 1];
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
        var vendors = [];
        var seen = {};
        window.vendorMappings.forEach(function(m) {
            if (!seen[m.vendor_name]) { vendors.push(m.vendor_name); seen[m.vendor_name] = true; }
        });
        var select = document.getElementById('vendor-name');
        if (select) {
            select.innerHTML = '<option value="">발주처를 선택하세요</option>' +
                vendors.map(function(v) { return '<option value="' + escapeHtml(v) + '">' + escapeHtml(v) + '</option>'; }).join('');
        }
    }

    function updateVendorFilterSelect() {
        var vendors = [];
        var seen = {};
        window.vendorMappings.forEach(function(m) {
            if (!seen[m.vendor_name]) { vendors.push(m.vendor_name); seen[m.vendor_name] = true; }
        });
        var select = document.getElementById('vendor-filter');
        if (select) {
            select.innerHTML = '<option value="">전체</option>' +
                vendors.map(function(v) { return '<option value="' + escapeHtml(v) + '">' + escapeHtml(v) + '</option>'; }).join('');
        }
    }

    function updateIntegratedUserFilter() {
        var select = document.getElementById('integrated-user-filter');
        if (select) {
            select.innerHTML = '<option value="">전체</option>' +
                window.userList.map(function(u) { return '<option value="' + u.id + '">' + escapeHtml(u.name) + '</option>'; }).join('');
        }
    }

    function updatePackagingSelect() {
        var select = document.getElementById('sku-packaging');
        if (select) {
            select.innerHTML = '<option value="">포장재 선택</option>' +
                Object.keys(window.packagingData).map(function(p) { return '<option value="' + escapeHtml(p) + '">' + escapeHtml(p) + '</option>'; }).join('');
        }
    }

    function updateSkuSelect() {
        var select = document.getElementById('mapping-sku');
        if (select) {
            select.innerHTML = '<option value="">SKU 선택</option>' +
                window.skuProducts.map(function(s) { return '<option value="' + s.id + '">' + escapeHtml(s.sku_name) + '</option>'; }).join('');
        }
    }

    // ==================== window에 함수 노출 ====================
    window.renderUserMenus = renderUserMenus;
    window.toggleUserMenu = toggleUserMenu;
    window.renderCalendarWithData = renderCalendarWithData;
    window.renderCalendar = renderCalendar;
    window.changeMonth = changeMonth;
    window.goToToday = goToToday;
    window.renderPartsTable = renderPartsTable;
    window.renderPackagingTable = renderPackagingTable;
    window.renderSkuTable = renderSkuTable;
    window.renderVendorMappingTable = renderVendorMappingTable;
    window.renderIntegratedOrders = renderIntegratedOrders;
    window.calculateRangeOrder = calculateRangeOrder;
    window.openDayModal = openDayModal;
    window.closeDayModal = closeDayModal;
    window.calculateDayOrder = calculateDayOrder;
    window.openAddUserModal = openAddUserModal;
    window.closeUserModal = closeUserModal;
    window.addUser = addUser;
    window.deleteUser = deleteUser;
    window.openAddPartModal = openAddPartModal;
    window.closePartModal = closePartModal;
    window.openAddPackagingModal = openAddPackagingModal;
    window.closePackagingModal = closePackagingModal;
    window.openAddSkuModal = openAddSkuModal;
    window.closeSkuModal = closeSkuModal;
    window.addCompositionRow = addCompositionRow;
    window.editSku = editSku;
    window.openAddMappingModal = openAddMappingModal;
    window.closeMappingModal = closeMappingModal;
    window.updateVendorSelect = updateVendorSelect;
    window.updateVendorFilterSelect = updateVendorFilterSelect;
    window.updateIntegratedUserFilter = updateIntegratedUserFilter;
    window.updatePackagingSelect = updatePackagingSelect;
    window.updateSkuSelect = updateSkuSelect;

    return {
        renderUserMenus: renderUserMenus,
        toggleUserMenu: toggleUserMenu,
        renderCalendarWithData: renderCalendarWithData,
        renderCalendar: renderCalendar,
        changeMonth: changeMonth,
        goToToday: goToToday,
        renderPartsTable: renderPartsTable,
        renderPackagingTable: renderPackagingTable,
        renderSkuTable: renderSkuTable,
        renderVendorMappingTable: renderVendorMappingTable,
        renderIntegratedOrders: renderIntegratedOrders,
        calculateRangeOrder: calculateRangeOrder,
        openDayModal: openDayModal,
        closeDayModal: closeDayModal,
        calculateDayOrder: calculateDayOrder,
        openAddUserModal: openAddUserModal,
        closeUserModal: closeUserModal,
        addUser: addUser,
        deleteUser: deleteUser,
        openAddPartModal: openAddPartModal,
        closePartModal: closePartModal,
        openAddPackagingModal: openAddPackagingModal,
        closePackagingModal: closePackagingModal,
        openAddSkuModal: openAddSkuModal,
        closeSkuModal: closeSkuModal,
        addCompositionRow: addCompositionRow,
        editSku: editSku,
        openAddMappingModal: openAddMappingModal,
        closeMappingModal: closeMappingModal,
        updateVendorSelect: updateVendorSelect,
        updateVendorFilterSelect: updateVendorFilterSelect,
        updateIntegratedUserFilter: updateIntegratedUserFilter,
        updatePackagingSelect: updatePackagingSelect,
        updateSkuSelect: updateSkuSelect
    };
})();
