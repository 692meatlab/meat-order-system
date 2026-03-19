// ==================== app.features.js ====================
// Phase 1+2 AI-Native 기능, Stage 1-10 확장 기능, AI-Native A-1~A-7
window.AppFeatures = (function() {
    'use strict';

    // ==================== Phase 1: 스마트 자동완성 ====================
    function setupAutocomplete(inputId, dataFn) {
        var input = document.getElementById(inputId);
        if (!input) return;

        var listEl = document.getElementById(inputId + '-autocomplete');
        if (!listEl) {
            listEl = document.createElement('div');
            listEl.id = inputId + '-autocomplete';
            listEl.className = 'autocomplete-list';
            input.parentElement.style.position = 'relative';
            input.parentElement.appendChild(listEl);
        }

        input.addEventListener('input', function() {
            var val = this.value.toLowerCase().trim();
            listEl.innerHTML = '';
            if (!val || val.length < 1) { listEl.style.display = 'none'; return; }

            var items = dataFn().filter(function(item) {
                return item.toLowerCase().includes(val);
            }).slice(0, 8);

            if (items.length === 0) { listEl.style.display = 'none'; return; }

            items.forEach(function(item) {
                var div = document.createElement('div');
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
            setTimeout(function() { listEl.style.display = 'none'; }, 200);
        });
    }

    function getUniqueVendors() {
        var vendors = new Set();
        (window.vendorMappings || []).forEach(function(m) { vendors.add(m.vendor_name); });
        (window.orderManagementData || []).forEach(function(o) { if (o.vendor) vendors.add(o.vendor); });
        return Array.from(vendors).sort();
    }

    function getUniqueSkuNames() {
        var names = new Set();
        (window.skuProducts || []).forEach(function(p) { names.add(p.sku_name); });
        return Array.from(names).sort();
    }

    function getUniqueRecipients() {
        var names = new Set();
        (window.orderManagementData || []).forEach(function(o) { if (o.receiverName) names.add(o.receiverName); });
        return Array.from(names).sort();
    }

    // ==================== Phase 1: 이상치 감지 ====================
    var anomalyStats = {};

    async function loadAnomalyStats() {
        try {
            var res = await fetch('/api/orders/anomaly-stats');
            var data = await res.json();
            anomalyStats = {};
            (data.stats || []).forEach(function(s) {
                var key = (s.vendor_name || '') + '::' + (s.sku_name || '');
                anomalyStats[key] = s;
            });
        } catch (e) {
            console.error('이상치 통계 로드 실패:', e);
        }
    }

    function checkAnomaly(vendorName, skuName, quantity, unitPrice) {
        var key = (vendorName || '') + '::' + (skuName || '');
        var stats = anomalyStats[key];
        if (!stats || stats.sample_count < 3) return null;

        var warnings = [];
        var qty = parseInt(quantity) || 0;
        var price = parseInt(unitPrice) || 0;

        if (qty > 0 && stats.avg_qty > 0 && stats.stddev_qty > 0) {
            var zScore = Math.abs(qty - stats.avg_qty) / stats.stddev_qty;
            if (zScore > 2) {
                warnings.push('수량 이상: 평균 ' + Math.round(stats.avg_qty) + '개 대비 ' + qty + '개 (' + zScore.toFixed(1) + 'σ)');
            }
        }

        if (price > 0 && stats.avg_price > 0 && stats.stddev_price > 0) {
            var zScore2 = Math.abs(price - stats.avg_price) / stats.stddev_price;
            if (zScore2 > 2) {
                warnings.push('단가 이상: 평균 ' + Math.round(stats.avg_price) + '원 대비 ' + price + '원 (' + zScore2.toFixed(1) + 'σ)');
            }
        }

        return warnings.length > 0 ? warnings : null;
    }

    // ==================== Phase 1: 대시보드 집계 ====================
    async function loadDashboardStats() {
        try {
            var res = await fetch('/api/orders/stats');
            var data = await res.json();
            renderDashboardStats(data);
        } catch (e) {
            console.error('대시보드 통계 로드 실패:', e);
        }
    }

    function renderDashboardStats(data) {
        var container = document.getElementById('dashboard-stats');
        if (!container) return;

        var summary = data.summary || {};
        var byVendor = data.by_vendor || [];
        var byMonth = data.by_month || [];
        var bySku = data.by_sku || [];

        // 요약 카드
        var html = '<div class="stats-cards">';
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
        return '<div class="stat-card">' +
            '<div class="stat-value" style="color: ' + color + '">' + Number(value).toLocaleString() + '</div>' +
            '<div class="stat-label">' + label + '</div>' +
            '<div class="stat-unit">' + unit + '</div>' +
            '</div>';
    }

    function renderBarChart(data, labelKey, valueKey) {
        if (!data || data.length === 0) return '<p style="color: #999; text-align: center;">데이터 없음</p>';

        var maxVal = Math.max.apply(null, data.map(function(d) { return d[valueKey] || 0; }));
        if (maxVal === 0) return '<p style="color: #999; text-align: center;">데이터 없음</p>';

        var html = '<div class="bar-chart">';
        data.forEach(function(d) {
            var label = d[labelKey] || '-';
            var val = d[valueKey] || 0;
            var pct = (val / maxVal * 100).toFixed(1);
            var displayLabel = label.length > 15 ? label.substring(0, 15) + '...' : label;

            html += '<div class="bar-row">' +
                '<div class="bar-label" title="' + escapeHtml(label) + '">' + escapeHtml(displayLabel) + '</div>' +
                '<div class="bar-track"><div class="bar-fill" style="width: ' + pct + '%"></div></div>' +
                '<div class="bar-value">' + Number(val).toLocaleString() + '</div>' +
                '</div>';
        });
        html += '</div>';
        return html;
    }

    // ==================== Phase 2: 매핑 학습 (유사 SKU 제안) ====================
    async function loadSkuSuggestions(productName, vendor) {
        if (!productName || productName.length < 2) return [];

        try {
            var url = '/api/vendor-mappings/suggest?q=' + encodeURIComponent(productName);
            if (vendor) url += '&vendor=' + encodeURIComponent(vendor);

            var res = await fetch(url);
            var data = await res.json();
            return data.suggestions || [];
        } catch (e) {
            console.error('SKU 제안 로드 실패:', e);
            return [];
        }
    }

    // 빠른매칭 모달에 제안 표시
    async function showSkuSuggestions() {
        var productNameEl = document.getElementById('quick-match-product-name');
        var vendorEl = document.getElementById('quick-match-vendor');
        var productName = productNameEl ? productNameEl.textContent : '';
        var vendor = vendorEl ? vendorEl.textContent : '';

        var suggestions = await loadSkuSuggestions(productName, vendor);
        var container = document.getElementById('sku-suggestions-list');
        if (!container) return;

        if (suggestions.length === 0) {
            container.innerHTML = '<p style="color: #999; font-size: 12px;">유사 매핑을 찾을 수 없습니다.</p>';
            return;
        }

        var html = '<div style="font-size: 12px; color: #666; margin-bottom: 6px;">유사 매핑 제안:</div>';
        suggestions.forEach(function(s) {
            html += '<div class="suggestion-item" onclick="applySuggestion(' + s.sku_product_id + ', \'' + escapeHtml(s.sku_name || '') + '\')">' +
                '<span class="suggestion-sku">' + escapeHtml(s.sku_name || '') + '</span>' +
                '<span class="suggestion-vendor" style="color: #888; font-size: 11px;">' + escapeHtml(s.vendor_name || '') + '</span>' +
                '</div>';
        });
        container.innerHTML = html;
    }

    function applySuggestion(skuProductId, skuName) {
        var select = document.getElementById('quick-match-sku-select');
        if (select) {
            select.value = skuProductId;
            // 셀렉트에 옵션이 없으면 추가
            if (!select.value) {
                var opt = document.createElement('option');
                opt.value = skuProductId;
                opt.textContent = skuName;
                select.appendChild(opt);
                select.value = skuProductId;
            }
        }
    }

    // ==================== Phase 2: 엑셀 템플릿 자동 인식 ====================
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
            var res = await fetch('/api/vendor-templates');
            var data = await res.json();
            var templates = data.templates || [];
            var found = templates.find(function(t) { return t.vendor_name === vendorName; });
            return found ? found.template_json : null;
        } catch (e) {
            return null;
        }
    }

    // ==================== Phase 2: 중복 주문 감지 ====================
    async function checkDuplicateOrders(ordersToRegister) {
        if (!ordersToRegister || ordersToRegister.length === 0) return [];

        try {
            var res = await fetch('/api/orders/check-duplicates', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ orders: ordersToRegister })
            });
            var data = await res.json();
            return data.duplicates || [];
        } catch (e) {
            console.error('중복 확인 실패:', e);
            return [];
        }
    }

    // ==================== Phase 2: 배송 추적 ====================
    function getDeliveryStatus(order) {
        if (!order.invoiceNo) return { status: 'none', label: '미등록', color: '#95a5a6' };
        if (order._shipped) return { status: 'delivered', label: '배송완료', color: '#27ae60' };
        return { status: 'in_transit', label: '배송중', color: '#f39c12' };
    }

    // ==================== Stage 1: 검색/필터 강화 ====================
    var activeFilterChips = {};
    var filterPresets = [];

    function toggleFilterChip(el) {
        el.classList.toggle('active');
        var filter = el.dataset.filter;
        var value = el.dataset.value;
        // 같은 필터의 다른 값 해제
        document.querySelectorAll('.filter-chip[data-filter="' + filter + '"]').forEach(function(chip) {
            if (chip !== el) chip.classList.remove('active');
        });
        if (el.classList.contains('active')) {
            activeFilterChips[filter] = value;
        } else {
            delete activeFilterChips[filter];
        }
        window.loadUserOrders();
    }

    function buildSearchQuery() {
        var search = document.getElementById('order-search') ? document.getElementById('order-search').value : '';
        var dateFrom = document.getElementById('order-date-from') ? document.getElementById('order-date-from').value : '';
        var dateTo = document.getElementById('order-date-to') ? document.getElementById('order-date-to').value : '';
        var vendor = document.getElementById('order-vendor-filter') ? document.getElementById('order-vendor-filter').value : '';

        var url = '/api/orders?user_id=' + window.currentUserId + '&per_page=200';
        if (search) url += '&search=' + encodeURIComponent(search);
        if (dateFrom) url += '&date_from=' + dateFrom;
        if (dateTo) url += '&date_to=' + dateTo;
        if (vendor) url += '&vendors=' + encodeURIComponent(vendor);
        if (activeFilterChips.shipped !== undefined) url += '&shipped=' + activeFilterChips.shipped;
        if (activeFilterChips.paid !== undefined) url += '&paid=' + activeFilterChips.paid;
        if (activeFilterChips.invoice_issued !== undefined) url += '&invoice_issued=' + activeFilterChips.invoice_issued;
        return url;
    }

    // Override loadUserOrders to use new search
    var _origLoadUserOrders = window.loadUserOrders;
    window.loadUserOrders = async function(userId) {
        window.showLoading();
        try {
            var uid = userId || window.currentUserId;
            if (!uid) { window.hideLoading(); return; }
            var url = buildSearchQuery();
            var res = await fetch(url);
            var data = await res.json();
            window.orderManagementData = (data.orders || []).map(function(o) {
                return {
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
                };
            });
            window.renderOrderManagement();
        } catch (e) {
            console.error('주문 로드 실패:', e);
            window.showToast('주문 데이터 로드 실패', 'error');
        }
        window.hideLoading();
    };

    async function loadFilterPresets() {
        try {
            var res = await fetch('/api/filter-presets');
            var data = await res.json();
            filterPresets = data.presets || [];
            renderFilterPresets();
        } catch (e) { console.error(e); }
    }

    function renderFilterPresets() {
        var container = document.getElementById('preset-list');
        var bar = document.getElementById('preset-bar');
        if (!container || !bar) return;
        if (filterPresets.length > 0) bar.style.display = 'flex';
        container.innerHTML = filterPresets.map(function(p) {
            return '<button class="preset-btn" onclick="applyFilterPreset(' + p.id + ')">' + escapeHtml(p.name) +
                '<span onclick="event.stopPropagation(); deleteFilterPreset(' + p.id + ')" style="margin-left: 4px; color: #e74c3c;">&times;</span>' +
                '</button>';
        }).join('');
    }

    async function saveCurrentFilterPreset() {
        var name = prompt('프리셋 이름을 입력하세요:');
        if (!name) return;
        var presetJson = {
            search: document.getElementById('order-search') ? document.getElementById('order-search').value : '',
            dateFrom: document.getElementById('order-date-from') ? document.getElementById('order-date-from').value : '',
            dateTo: document.getElementById('order-date-to') ? document.getElementById('order-date-to').value : '',
            vendor: document.getElementById('order-vendor-filter') ? document.getElementById('order-vendor-filter').value : '',
            chips: Object.assign({}, activeFilterChips)
        };
        try {
            await fetch('/api/filter-presets', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name: name, preset_json: presetJson })
            });
            window.showToast('프리셋이 저장되었습니다.', 'success');
            loadFilterPresets();
        } catch (e) { window.showToast('저장 실패', 'error'); }
    }

    function applyFilterPreset(id) {
        var preset = filterPresets.find(function(p) { return p.id === id; });
        if (!preset) return;
        var pj = typeof preset.preset_json === 'string' ? JSON.parse(preset.preset_json) : preset.preset_json;
        if (pj.search) document.getElementById('order-search').value = pj.search;
        if (pj.dateFrom) document.getElementById('order-date-from').value = pj.dateFrom;
        if (pj.dateTo) document.getElementById('order-date-to').value = pj.dateTo;
        if (pj.vendor) document.getElementById('order-vendor-filter').value = pj.vendor;
        activeFilterChips = pj.chips || {};
        // 칩 UI 동기화
        document.querySelectorAll('.filter-chip').forEach(function(chip) {
            var f = chip.dataset.filter;
            var v = chip.dataset.value;
            chip.classList.toggle('active', activeFilterChips[f] === v);
        });
        window.loadUserOrders();
    }

    async function deleteFilterPreset(id) {
        try {
            await fetch('/api/filter-presets/' + id, { method: 'DELETE' });
            loadFilterPresets();
        } catch (e) { console.error(e); }
    }

    function updateOrderVendorFilter() {
        var select = document.getElementById('order-vendor-filter');
        if (!select) return;
        var vendorSet = new Set();
        (window.vendorMappings || []).forEach(function(m) { vendorSet.add(m.vendor_name); });
        var vendors = Array.from(vendorSet);
        select.innerHTML = '<option value="">전체</option>' +
            vendors.map(function(v) { return '<option value="' + escapeHtml(v) + '">' + escapeHtml(v) + '</option>'; }).join('');
    }

    // Stage 1: 리포트 거래처 필터도 업데이트
    function updateReportVendorFilter() {
        var select = document.getElementById('report-vendor-filter');
        if (!select) return;
        var vendorSet = new Set();
        (window.vendorMappings || []).forEach(function(m) { vendorSet.add(m.vendor_name); });
        var vendors = Array.from(vendorSet);
        select.innerHTML = '<option value="">전체</option>' +
            vendors.map(function(v) { return '<option value="' + escapeHtml(v) + '">' + escapeHtml(v) + '</option>'; }).join('');
    }

    // ==================== Stage 3: 원가 변동 이력 ====================
    async function showCostHistory(tableName, itemId, itemName) {
        document.getElementById('cost-history-title').textContent = itemName + ' 가격 변동 이력';
        document.getElementById('cost-history-modal').classList.add('show');
        var content = document.getElementById('cost-history-content');
        content.innerHTML = '<p style="text-align: center; color: #888;">로딩 중...</p>';

        try {
            var res = await fetch('/api/cost-history?table_name=' + tableName + '&item_id=' + itemId);
            var data = await res.json();
            var history = data.history || [];

            if (history.length === 0) {
                content.innerHTML = '<p style="text-align: center; color: #888;">변동 이력이 없습니다.</p>';
                return;
            }

            var maxPrice = Math.max.apply(null, history.map(function(h) { return Math.max(h.old_price || 0, h.new_price || 0); }));
            content.innerHTML = '<div class="cost-history-chart">' + history.map(function(h) {
                var date = h.changed_at ? h.changed_at.split('T')[0] : '';
                var diff = (h.new_price || 0) - (h.old_price || 0);
                var diffStr = diff > 0 ? '+' + diff.toLocaleString() : diff.toLocaleString();
                var barWidth = maxPrice > 0 ? ((h.new_price || 0) / maxPrice * 100) : 0;
                return '<div class="cost-history-item">' +
                    '<span style="min-width: 80px;">' + date + '</span>' +
                    '<div style="flex: 1;"><div class="cost-history-bar" style="width: ' + barWidth + '%;"></div></div>' +
                    '<span style="min-width: 80px; text-align: right;">' + (h.new_price || 0).toLocaleString() + '원</span>' +
                    '<span style="min-width: 60px; text-align: right; color: ' + (diff > 0 ? '#e74c3c' : '#27ae60') + ';">' + diffStr + '</span>' +
                    '</div>';
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
        var container = document.getElementById('upload-history-table');
        if (!container) return;

        try {
            var res = await fetch('/api/upload-history');
            var data = await res.json();
            var history = data.history || [];

            if (history.length === 0) {
                container.innerHTML = '<p style="color: #888; text-align: center; padding: 20px;">업로드 이력이 없습니다.</p>';
                return;
            }

            container.innerHTML = '<table><thead><tr>' +
                '<th>일시</th><th>사용자</th><th>파일명</th><th>거래처</th>' +
                '<th>총 행수</th><th>매칭</th><th>미매칭</th><th>상태</th>' +
                '</tr></thead><tbody>' + history.map(function(h) {
                    return '<tr>' +
                        '<td>' + (h.created_at ? h.created_at.split('T')[0] : '') + '</td>' +
                        '<td>' + escapeHtml(h.user_name || '') + '</td>' +
                        '<td>' + escapeHtml(h.filename || '') + '</td>' +
                        '<td>' + escapeHtml(h.vendor_name || '') + '</td>' +
                        '<td>' + (h.row_count || 0) + '</td>' +
                        '<td style="color: #27ae60;">' + (h.matched_count || 0) + '</td>' +
                        '<td style="color: #e74c3c;">' + (h.unmatched_count || 0) + '</td>' +
                        '<td>' + (h.status || '') + '</td>' +
                        '</tr>';
                }).join('') + '</tbody></table>';
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
                    user_id: window.currentUserId,
                    filename: filename,
                    row_count: rowCount,
                    matched_count: matchedCount,
                    unmatched_count: unmatchedCount,
                    vendor_name: vendorName
                })
            });
        } catch (e) { console.error('업로드 이력 저장 실패:', e); }
    }

    // ==================== Stage 5: 주문 상세 모달 ====================
    var currentOrderDetailId = null;

    function openOrderDetailModal(orderId) {
        currentOrderDetailId = orderId;
        var order = (window.orderManagementData || []).find(function(o) { return o._id === orderId; });
        if (!order) return;

        document.getElementById('order-detail-title').textContent = '주문 #' + orderId + ' 상세';
        document.getElementById('order-detail-modal').classList.add('show');
        switchOrderTab('info');

        // 주문 정보 렌더
        document.getElementById('order-tab-info').innerHTML =
            '<div style="display: grid; grid-template-columns: auto 1fr; gap: 8px 16px; font-size: 13px;">' +
            '<span style="color: #888;">거래처:</span><span>' + escapeHtml(order.vendor) + '</span>' +
            '<span style="color: #888;">SKU:</span><span>' + escapeHtml(order.skuName) + '</span>' +
            '<span style="color: #888;">수량:</span><span>' + order.quantity + '</span>' +
            '<span style="color: #888;">수령인:</span><span>' + escapeHtml(order.receiverName) + '</span>' +
            '<span style="color: #888;">연락처:</span><span>' + escapeHtml(order.receiverPhone) + '</span>' +
            '<span style="color: #888;">주소:</span><span>' + escapeHtml(order.receiverAddr) + '</span>' +
            '<span style="color: #888;">출고일:</span><span>' + (order.releaseDate || '-') + '</span>' +
            '<span style="color: #888;">메모:</span><span>' + escapeHtml(order.memo) + '</span>' +
            '<span style="color: #888;">출고:</span><span>' + (order._shipped ? '완료' : '미완료') + '</span>' +
            '<span style="color: #888;">입금:</span><span>' + (order._paid ? '완료' : '미완료') + '</span>' +
            '</div>';

        // 이력/코멘트 로드
        loadOrderHistory(orderId);
        loadOrderComments(orderId);
    }

    function closeOrderDetailModal() {
        document.getElementById('order-detail-modal').classList.remove('show');
    }

    function switchOrderTab(tab) {
        document.querySelectorAll('#order-detail-modal .tab-btn').forEach(function(btn) { btn.classList.remove('active'); });
        document.querySelectorAll('#order-detail-modal .tab-content').forEach(function(tc) { tc.classList.remove('active'); });
        var tabBtn = document.querySelector('#order-detail-modal .tab-btn[onclick="switchOrderTab(\'' + tab + '\')"]');
        if (tabBtn) tabBtn.classList.add('active');
        var tabContent = document.getElementById('order-tab-' + tab);
        if (tabContent) tabContent.classList.add('active');
    }

    async function loadOrderHistory(orderId) {
        var container = document.getElementById('order-tab-history');
        try {
            var res = await fetch('/api/orders/' + orderId + '/history');
            var data = await res.json();
            var history = data.history || [];
            if (history.length === 0) {
                container.innerHTML = '<p style="color: #888; text-align: center;">변경 이력이 없습니다.</p>';
                return;
            }
            container.innerHTML = history.map(function(h) {
                return '<div class="history-item">' +
                    '<div><strong>' + escapeHtml(h.field_name || '') + '</strong> 변경</div>' +
                    '<div style="color: #e74c3c;">' + escapeHtml(h.old_value || '(없음)') + '</div>' +
                    '<div>-> <span style="color: #27ae60;">' + escapeHtml(h.new_value || '(없음)') + '</span></div>' +
                    '<div style="font-size: 11px; color: #999; margin-top: 4px;">' + (h.created_at || '') + '</div>' +
                    '</div>';
            }).join('');
        } catch (e) {
            container.innerHTML = '<p style="color: #e74c3c;">이력 로드 실패</p>';
        }
    }

    async function loadOrderComments(orderId) {
        var container = document.getElementById('order-comments-list');
        try {
            var res = await fetch('/api/orders/' + orderId + '/comments');
            var data = await res.json();
            var comments = data.comments || [];
            if (comments.length === 0) {
                container.innerHTML = '<p style="color: #888; text-align: center;">코멘트가 없습니다.</p>';
                return;
            }
            container.innerHTML = comments.map(function(c) {
                return '<div class="comment-item">' +
                    '<div class="comment-meta">' + escapeHtml(c.user_name || '익명') + ' · ' + (c.created_at || '') + '</div>' +
                    '<div>' + escapeHtml(c.content) + '</div>' +
                    '</div>';
            }).join('');
        } catch (e) {
            container.innerHTML = '<p style="color: #e74c3c;">코멘트 로드 실패</p>';
        }
    }

    async function submitOrderComment() {
        var input = document.getElementById('new-comment');
        var content = input.value.trim();
        if (!content || !currentOrderDetailId) return;

        try {
            await fetch('/api/orders/' + currentOrderDetailId + '/comments', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ user_name: window.currentUser || '', content: content })
            });
            input.value = '';
            loadOrderComments(currentOrderDetailId);
            window.showToast('코멘트가 등록되었습니다.', 'success');
        } catch (e) {
            window.showToast('코멘트 등록 실패', 'error');
        }
    }

    // ==================== Stage 6: 매출 리포트 ====================
    var vendorReportData = null;

    async function loadVendorReport() {
        var dateFrom = document.getElementById('report-date-from') ? document.getElementById('report-date-from').value : '';
        var dateTo = document.getElementById('report-date-to') ? document.getElementById('report-date-to').value : '';
        var vendor = document.getElementById('report-vendor-filter') ? document.getElementById('report-vendor-filter').value : '';

        window.showLoading();
        try {
            var url = '/api/dashboard/vendor-report?';
            if (dateFrom) url += 'date_from=' + dateFrom + '&';
            if (dateTo) url += 'date_to=' + dateTo + '&';
            if (vendor) url += 'vendor=' + encodeURIComponent(vendor) + '&';

            var res = await fetch(url);
            vendorReportData = await res.json();
            renderVendorReport(vendorReportData);
        } catch (e) {
            window.showToast('리포트 로드 실패', 'error');
        }
        window.hideLoading();
    }

    function renderVendorReport(data) {
        var container = document.getElementById('vendor-report-content');
        if (!container) return;
        var vs = data.vendor_summary || [];
        var mt = data.monthly_trend || [];
        var sb = data.sku_breakdown || [];

        // 거래처별 요약 테이블
        var html = '<h4 style="margin-bottom: 12px;">거래처별 요약</h4>';
        if (vs.length > 0) {
            var maxAmount = Math.max.apply(null, vs.map(function(v) { return v.total_amount || 0; }).concat([1]));
            html += '<div class="bar-chart">' + vs.map(function(v) {
                return '<div class="bar-row">' +
                    '<span class="bar-label">' + escapeHtml(v.vendor_name || '') + '</span>' +
                    '<div class="bar-track"><div class="bar-fill" style="width: ' + ((v.total_amount || 0) / maxAmount * 100) + '%;"></div></div>' +
                    '<span class="bar-value">' + (v.total_amount || 0).toLocaleString() + '원</span>' +
                    '</div>';
            }).join('') + '</div>';

            html += '<div class="table-container" style="margin-top: 16px;"><table><thead><tr>' +
                '<th>거래처</th><th>주문수</th><th>총수량</th><th>매출액</th><th>출고</th><th>입금</th>' +
                '</tr></thead><tbody>' + vs.map(function(v) {
                    return '<tr>' +
                        '<td>' + escapeHtml(v.vendor_name || '') + '</td>' +
                        '<td>' + v.order_count + '</td><td>' + v.total_qty + '</td>' +
                        '<td>' + (v.total_amount || 0).toLocaleString() + '원</td>' +
                        '<td>' + v.shipped_count + '</td><td>' + v.paid_count + '</td>' +
                        '</tr>';
                }).join('') + '</tbody></table></div>';
        } else {
            html += '<p style="color: #888;">데이터가 없습니다.</p>';
        }

        // 월별 추이
        if (mt.length > 0) {
            html += '<h4 style="margin: 20px 0 12px;">월별 추이</h4>';
            var maxMonthly = Math.max.apply(null, mt.map(function(m) { return m.total_amount || 0; }).concat([1]));
            html += '<div class="bar-chart">' + mt.map(function(m) {
                return '<div class="bar-row">' +
                    '<span class="bar-label">' + m.month + '</span>' +
                    '<div class="bar-track"><div class="bar-fill" style="width: ' + ((m.total_amount || 0) / maxMonthly * 100) + '%;"></div></div>' +
                    '<span class="bar-value">' + (m.total_amount || 0).toLocaleString() + '원</span>' +
                    '</div>';
            }).join('') + '</div>';
        }

        // SKU별 분석
        if (sb.length > 0) {
            html += '<h4 style="margin: 20px 0 12px;">SKU별 분석 (Top 20)</h4>';
            html += '<div class="table-container"><table><thead><tr>' +
                '<th>SKU</th><th>주문수</th><th>총수량</th><th>매출액</th>' +
                '</tr></thead><tbody>' + sb.map(function(s) {
                    return '<tr>' +
                        '<td>' + escapeHtml(s.sku_name || '') + '</td>' +
                        '<td>' + s.order_count + '</td><td>' + s.total_qty + '</td>' +
                        '<td>' + (s.total_amount || 0).toLocaleString() + '원</td>' +
                        '</tr>';
                }).join('') + '</tbody></table></div>';
        }

        container.innerHTML = html;
    }

    function downloadVendorReportExcel() {
        if (!vendorReportData || !vendorReportData.vendor_summary) {
            window.showToast('먼저 리포트를 조회하세요.', 'error');
            return;
        }
        var vs = vendorReportData.vendor_summary;
        var headers = ['거래처', '주문수', '총수량', '매출액', '출고', '입금'];
        var rows = vs.map(function(v) { return [v.vendor_name, v.order_count, v.total_qty, v.total_amount || 0, v.shipped_count, v.paid_count]; });
        var ws = XLSX.utils.aoa_to_sheet([headers].concat(rows));
        var wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, '매출리포트');
        var today = new Date();
        var dateStr = today.getFullYear() + String(today.getMonth() + 1).padStart(2, '0') + String(today.getDate()).padStart(2, '0');
        XLSX.writeFile(wb, '매출리포트_' + dateStr + '.xlsx');
        window.showToast('엑셀 다운로드 완료', 'success');
    }

    // ==================== Stage 7: 재고 관리 ====================
    var inventoryData = [];

    async function loadInventory() {
        try {
            var res = await fetch('/api/inventory');
            var data = await res.json();
            inventoryData = data.inventory || [];
        } catch (e) { console.error('재고 로드 실패:', e); }
    }

    function openInventoryModal() {
        document.getElementById('inv-sku-select').innerHTML = '<option value="">SKU 선택</option>' +
            (window.skuProducts || []).map(function(s) { return '<option value="' + s.id + '">' + escapeHtml(s.sku_name) + '</option>'; }).join('');
        document.getElementById('inv-change-qty').value = '';
        document.getElementById('inv-note').value = '';
        document.getElementById('inventory-modal').classList.add('show');
    }

    function closeInventoryModal() {
        document.getElementById('inventory-modal').classList.remove('show');
    }

    async function submitInventoryAdjust() {
        var skuProductId = document.getElementById('inv-sku-select').value;
        var changeQty = parseInt(document.getElementById('inv-change-qty').value);
        var note = document.getElementById('inv-note').value;

        if (!skuProductId || isNaN(changeQty) || changeQty === 0) {
            window.showToast('SKU와 조정 수량을 입력하세요.', 'error');
            return;
        }

        try {
            await fetch('/api/inventory/adjust', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ sku_product_id: parseInt(skuProductId), change_qty: changeQty, note: note })
            });
            closeInventoryModal();
            window.showToast('재고가 조정되었습니다.', 'success');
            loadInventory();
        } catch (e) {
            window.showToast('재고 조정 실패', 'error');
        }
    }

    // ==================== Stage 8: 알림 시스템 ====================
    var notificationData = [];

    async function checkNotifications() {
        try {
            var res = await fetch('/api/notifications?unread_only=true');
            var data = await res.json();
            notificationData = data.notifications || [];
            var badge = document.getElementById('notification-badge');
            var count = data.unread_count || 0;
            if (badge) {
                badge.textContent = count;
                badge.style.display = count > 0 ? 'inline-block' : 'none';
            }
        } catch (e) { /* 알림 로드 실패 무시 */ }
    }

    function toggleNotificationPanel(event) {
        event.stopPropagation();
        var panel = document.getElementById('notification-panel');
        panel.classList.toggle('show');
        if (panel.classList.contains('show')) renderNotificationList();
    }

    function renderNotificationList() {
        var container = document.getElementById('notification-list');
        if (!container) return;

        if (notificationData.length === 0) {
            container.innerHTML = '<div style="padding: 20px; text-align: center; color: #999;">알림이 없습니다</div>';
            return;
        }

        container.innerHTML = notificationData.map(function(n) {
            return '<div class="notification-item ' + (n.is_read ? '' : 'unread') + '" onclick="handleNotificationClick(' + n.id + ')">' +
                '<div class="notification-title">' + escapeHtml(n.title) + '</div>' +
                '<div class="notification-message">' + escapeHtml(n.message || '') + '</div>' +
                '<div class="notification-time">' + (n.created_at ? n.created_at.split('T')[0] : '') + '</div>' +
                '</div>';
        }).join('');
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
            window.showToast('모든 알림을 읽음 처리했습니다.', 'success');
        } catch (e) { window.showToast('실패', 'error'); }
    }

    async function generateNotifications() {
        try { await fetch('/api/notifications/generate', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: '{}' }); } catch (e) { /* ignore */ }
    }

    // 5분마다 알림 체크 + 생성
    setInterval(function() {
        generateNotifications().then(function() { checkNotifications(); });
    }, 300000);

    // ==================== Stage 9: 역할 기반 제한 ====================
    var currentUserRole = 'admin';

    function applyRoleRestrictions(role) {
        currentUserRole = role || 'admin';
        // user 역할: 삭제/관리 버튼 숨기기
        var restrictedBtns = document.querySelectorAll('[data-role-min]');
        restrictedBtns.forEach(function(btn) {
            var minRole = btn.dataset.roleMin;
            var roleOrder = { 'admin': 3, 'manager': 2, 'user': 1 };
            btn.style.display = (roleOrder[currentUserRole] || 1) >= (roleOrder[minRole] || 1) ? '' : 'none';
        });
    }

    // ==================== Stage 10: 백업/복원 ====================
    async function exportBackup() {
        window.showLoading();
        try {
            var res = await fetch('/api/backup/export');
            var blob = await res.blob();
            var url = URL.createObjectURL(blob);
            var a = document.createElement('a');
            a.href = url;
            var today = new Date();
            var dateStr = today.getFullYear() + String(today.getMonth() + 1).padStart(2, '0') + String(today.getDate()).padStart(2, '0');
            a.download = 'backup_' + dateStr + '.json';
            a.click();
            URL.revokeObjectURL(url);
            window.showToast('백업 파일이 다운로드되었습니다.', 'success');
            loadBackupLog();
        } catch (e) {
            window.showToast('내보내기 실패', 'error');
        }
        window.hideLoading();
    }

    async function importBackup() {
        var fileInput = document.getElementById('backup-file-input');
        if (!fileInput.files || fileInput.files.length === 0) {
            window.showToast('JSON 파일을 선택하세요.', 'error');
            return;
        }

        var file = fileInput.files[0];
        var text = await file.text();
        var data;
        try {
            data = JSON.parse(text);
        } catch (e) {
            window.showToast('유효하지 않은 JSON 파일입니다.', 'error');
            return;
        }

        // 미리보기
        var previewRes = await fetch('/api/backup/import', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: text
        });
        var preview = await previewRes.json();

        var summary = Object.entries(preview.preview || {}).map(function(entry) { return entry[0] + ': ' + entry[1] + '건'; }).join('\n');
        if (!confirm('다음 데이터를 복원합니다:\n\n' + summary + '\n\n기존 데이터가 모두 삭제됩니다. 계속하시겠습니까?')) return;

        window.showLoading();
        try {
            var res = await fetch('/api/backup/import?confirm=true', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: text
            });
            var result = await res.json();
            if (result.success) {
                window.showToast(result.total_rows + '건 복원 완료. 새로고침합니다.', 'success');
                setTimeout(function() { location.reload(); }, 1500);
            } else {
                window.showToast('복원 실패: ' + (result.error || ''), 'error');
            }
        } catch (e) {
            window.showToast('복원 실패', 'error');
        }
        window.hideLoading();
    }

    async function loadBackupLog() {
        var container = document.getElementById('backup-log-table');
        if (!container) return;

        try {
            var res = await fetch('/api/backup/log');
            var data = await res.json();
            var logs = data.logs || [];

            if (logs.length === 0) {
                container.innerHTML = '<p style="color: #888; text-align: center; padding: 20px;">이력이 없습니다.</p>';
                return;
            }

            container.innerHTML = '<table><thead><tr>' +
                '<th>유형</th><th>테이블수</th><th>총 행수</th><th>일시</th>' +
                '</tr></thead><tbody>' + logs.map(function(l) {
                    return '<tr>' +
                        '<td>' + (l.backup_type === 'export' ? '내보내기' : '가져오기') + '</td>' +
                        '<td>' + l.table_count + '</td><td>' + l.total_rows + '</td>' +
                        '<td>' + (l.created_at || '') + '</td>' +
                        '</tr>';
                }).join('') + '</tbody></table>';
        } catch (e) { container.innerHTML = '<p style="color: #e74c3c;">로드 실패</p>'; }
    }

    // ==================== AI-Native A-1: 퍼지 SKU 매칭 ====================
    async function fuzzyMatchItems(vendorName, items) {
        try {
            var res = await fetch('/api/fuzzy-match', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ vendor_name: vendorName, items: items })
            });
            return await res.json();
        } catch (e) {
            console.error('퍼지 매칭 실패:', e);
            return { results: [] };
        }
    }

    function getConfidenceBadge(confidence) {
        if (confidence >= 0.8) return '<span class="status-badge confidence-high">' + (confidence * 100).toFixed(0) + '%</span>';
        if (confidence >= 0.6) return '<span class="status-badge confidence-medium">' + (confidence * 100).toFixed(0) + '%</span>';
        return '<span class="status-badge confidence-low">' + (confidence * 100).toFixed(0) + '%</span>';
    }

    // ==================== AI-Native A-2: 원가 이상 감지 ====================
    function showCostAnomalyAlert(anomaly) {
        var modal = document.getElementById('cost-anomaly-modal');
        var content = document.getElementById('cost-anomaly-content');
        var severity = anomaly.severity === 'danger' ? 'danger' : 'warning';
        content.innerHTML =
            '<div class="anomaly-alert ' + severity + '">' +
            '<h4 style="margin-bottom: 8px;">' + (severity === 'danger' ? '위험' : '주의') + ' - 원가 이상 감지</h4>' +
            '<p>' + anomaly.reason + '</p>' +
            (anomaly.z_score ? '<p style="margin-top: 8px; font-size: 13px;">Z-score: ' + anomaly.z_score + '</p>' : '') +
            (anomaly.change_pct ? '<p style="font-size: 13px;">변동률: ' + anomaly.change_pct + '%</p>' : '') +
            '</div>';
        modal.classList.add('show');
    }

    // 기존 savePart/savePackaging 응답에서 anomaly 체크
    var _origSavePart = typeof window.savePart === 'function' ? window.savePart : null;
    var _origSavePackaging = typeof window.savePackaging === 'function' ? window.savePackaging : null;

    // ==================== AI-Native A-3: 수익성 분석 ====================
    async function loadProfitability() {
        var tableEl = document.getElementById('profitability-table');
        var summaryEl = document.getElementById('profitability-summary');
        if (!tableEl) return;

        try {
            var res = await fetch('/api/profitability');
            var data = await res.json();
            var products = data.products || [];
            var summary = data.summary || {};

            // 요약 카드
            summaryEl.innerHTML =
                '<div class="stat-card">' +
                    '<div class="stat-value">' + (summary.avg_margin_rate * 100).toFixed(1) + '%</div>' +
                    '<div class="stat-label">평균 마진율</div>' +
                '</div>' +
                '<div class="stat-card">' +
                    '<div class="stat-value" style="font-size: 16px;">' + (summary.best_sku || '-') + '</div>' +
                    '<div class="stat-label">최고 수익 SKU</div>' +
                '</div>' +
                '<div class="stat-card">' +
                    '<div class="stat-value" style="font-size: 16px;">' + (summary.worst_sku || '-') + '</div>' +
                    '<div class="stat-label">최저 수익 SKU</div>' +
                '</div>' +
                '<div class="stat-card">' +
                    '<div class="stat-value" style="color: ' + (summary.needs_improvement > 0 ? 'var(--danger-color)' : 'var(--success-color)') + '">' +
                        summary.needs_improvement +
                    '</div>' +
                    '<div class="stat-label">개선 필요 상품</div>' +
                '</div>';

            // 테이블
            if (products.length === 0) {
                tableEl.innerHTML = '<p style="color: #888; text-align: center; padding: 20px;">데이터가 없습니다.</p>';
                return;
            }

            tableEl.innerHTML = '<table><thead><tr>' +
                '<th>SKU명</th><th>판매가</th><th>원가</th><th>마진</th><th>마진율</th><th>등급</th><th>상세</th>' +
                '</tr></thead><tbody>' + products.map(function(p) {
                    return '<tr>' +
                        '<td>' + p.sku_name + '</td>' +
                        '<td>' + (p.selling_price || 0).toLocaleString() + '원</td>' +
                        '<td>' + (p.total_cost || 0).toLocaleString() + '원</td>' +
                        '<td style="color: ' + (p.margin >= 0 ? 'var(--success-color)' : 'var(--danger-color)') + '">' +
                            (p.margin || 0).toLocaleString() + '원' +
                        '</td>' +
                        '<td>' + (p.margin_rate * 100).toFixed(1) + '%</td>' +
                        '<td><span class="grade-badge grade-' + p.grade + '">' + p.grade + '</span></td>' +
                        '<td><button class="btn btn-small btn-secondary" onclick="showProfitabilityDetail(' + p.sku_id + ')">상세</button></td>' +
                        '</tr>';
                }).join('') + '</tbody></table>';
        } catch (e) {
            tableEl.innerHTML = '<p style="color: #e74c3c;">로드 실패</p>';
        }
    }

    async function showProfitabilityDetail(skuId) {
        try {
            var res = await fetch('/api/profitability/' + skuId);
            var data = await res.json();
            var modal = document.getElementById('profitability-detail-modal');
            var content = document.getElementById('profitability-detail-content');
            var title = document.getElementById('profitability-detail-title');

            title.textContent = data.sku_name || '원가 상세';
            var maxCost = Math.max.apply(null, (data.details || []).map(function(d) { return d.cost; }).concat([data.packaging_cost || 0, 1]));

            var html =
                '<div class="result-summary">' +
                    '<div class="summary-item"><span class="label">판매가:</span><span class="value">' + (data.selling_price || 0).toLocaleString() + '원</span></div>' +
                    '<div class="summary-item"><span class="label">총 원가:</span><span class="value">' + (data.total_cost || 0).toLocaleString() + '원</span></div>' +
                    '<div class="summary-item"><span class="label">마진:</span><span class="value" style="color:' + (data.margin >= 0 ? 'var(--success-color)' : 'var(--danger-color)') + '">' + (data.margin || 0).toLocaleString() + '원 (' + (data.margin_rate * 100).toFixed(1) + '%)</span></div>' +
                    '<div class="summary-item"><span class="label">등급:</span><span class="grade-badge grade-' + data.grade + '">' + data.grade + '</span></div>' +
                '</div>' +
                '<h4 style="margin: 16px 0 8px;">구성품 원가 분해</h4>' +
                '<div class="bar-chart">';

            (data.details || []).forEach(function(d) {
                var pct = maxCost > 0 ? (d.cost / maxCost * 100) : 0;
                html += '<div class="bar-row">' +
                    '<span class="bar-label">' + d.part_name + ' (' + d.weight + 'g)</span>' +
                    '<div class="bar-track"><div class="bar-fill" style="width:' + pct + '%"></div></div>' +
                    '<span class="bar-value">' + d.cost.toLocaleString() + '원</span>' +
                    '</div>';
            });
            if (data.packaging_cost > 0) {
                var pct = (data.packaging_cost / maxCost * 100);
                html += '<div class="bar-row">' +
                    '<span class="bar-label">' + (data.packaging_name || '포장재') + '</span>' +
                    '<div class="bar-track"><div class="bar-fill" style="width:' + pct + '%; background: linear-gradient(90deg, #f39c12, #e67e22);"></div></div>' +
                    '<span class="bar-value">' + data.packaging_cost.toLocaleString() + '원</span>' +
                    '</div>';
            }
            html += '</div>';

            if (data.suggestions && data.suggestions.length > 0) {
                html += '<h4 style="margin: 16px 0 8px;">개선 제안</h4><ul style="font-size: 13px; color: #666;">';
                data.suggestions.forEach(function(s) { html += '<li style="margin-bottom: 4px;">' + s + '</li>'; });
                html += '</ul>';
            }

            content.innerHTML = html;
            modal.classList.add('show');
        } catch (e) {
            window.showToast('상세 조회 실패', 'error');
        }
    }

    // ==================== AI-Native A-4: 거래처 성과 ====================
    async function loadVendorPerformance(period) {
        period = period || 30;
        var container = document.getElementById('vendor-report-content');
        if (!container) return;

        try {
            var res = await fetch('/api/vendor-performance?period=' + period);
            var data = await res.json();
            var vendors = data.vendors || [];

            if (vendors.length === 0) {
                container.innerHTML += '<p style="color: #888; text-align: center; padding: 20px;">성과 데이터가 없습니다.</p>';
                return;
            }

            var html = '<div style="margin-top: 24px;"><h4 style="margin-bottom: 16px;">거래처 성과 순위</h4>';
            html += '<table><thead><tr>' +
                '<th>순위</th><th>거래처</th><th>주문수</th><th>총점</th><th>등급</th>' +
                '<th>출고율</th><th>입금율</th><th>계산서율</th><th>처리속도</th>' +
                '</tr></thead><tbody>';
            vendors.forEach(function(v, i) {
                var m = v.metrics;
                html += '<tr>' +
                    '<td>' + (i + 1) + '</td>' +
                    '<td><strong>' + v.vendor_name + '</strong></td>' +
                    '<td>' + v.total_orders + '</td>' +
                    '<td><strong>' + v.score + '</strong></td>' +
                    '<td><span class="grade-badge grade-' + v.grade + '">' + v.grade + '</span></td>' +
                    '<td>' + m.shipped_rate + '%</td>' +
                    '<td>' + m.paid_rate + '%</td>' +
                    '<td>' + m.invoice_rate + '%</td>' +
                    '<td>' + (m.avg_processing_days ? m.avg_processing_days + '일' : '-') + '</td>' +
                    '</tr>';
            });
            html += '</tbody></table></div>';
            container.innerHTML += html;
        } catch (e) {
            console.error('거래처 성과 로드 실패:', e);
        }
    }

    // ==================== AI-Native A-5: 스마트 중복 감지 ====================
    var _pendingDuplicateCallback = null;

    async function checkSmartDuplicates(orders) {
        try {
            var res = await fetch('/api/orders/check-duplicates', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ orders: orders })
            });
            return await res.json();
        } catch (e) {
            console.error('중복 감지 실패:', e);
            return { duplicates: [] };
        }
    }

    function showDuplicateModal(duplicates) {
        var modal = document.getElementById('duplicate-modal');
        var content = document.getElementById('duplicate-modal-content');

        var html = '<p style="margin-bottom: 16px; color: var(--danger-color);">' +
            '<strong>' + duplicates.length + '건</strong>의 중복 가능성이 감지되었습니다.' +
            '</p>';

        duplicates.forEach(function(d) {
            var order = d.order;
            var matches = d.matches || [];
            html += '<div class="card" style="margin-bottom: 12px; padding: 12px;">' +
                '<strong>새 주문: ' + (order.recipient || '') + ' - ' + (order.sku_name || '') + '</strong>';
            matches.forEach(function(m) {
                var ex = m.existing_order || {};
                var breakdown = m.breakdown || {};
                html += '<div style="margin-top: 8px; padding: 8px; background: #f8f9fa; border-radius: 4px;">' +
                    '<div style="display: flex; justify-content: space-between; margin-bottom: 4px;">' +
                    '<span>유사도: <strong>' + m.score + '점</strong></span>' +
                    '<span class="status-badge ' + (m.score >= 80 ? 'not-paid' : 'not-shipped') + '">' + (m.score >= 80 ? '높음' : '중간') + '</span>' +
                    '</div>' +
                    '<div style="font-size: 12px; color: #666;">' +
                    '기존: ' + (ex.recipient || '') + ' / ' + (ex.sku_name || '') + ' / ' + (ex.address || '') +
                    '</div>' +
                    '<div style="font-size: 11px; color: #999; margin-top: 4px;">' +
                    '수령인: ' + (breakdown.recipient || 0) + '점 | 전화: ' + (breakdown.phone || 0) + '점 | 주소: ' + (breakdown.address || 0) + '점 | SKU: ' + (breakdown.sku || 0) + '점' +
                    '</div>' +
                    '</div>';
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

    // ==================== AI-Native A-6: 수요 예측 ====================
    async function loadForecast() {
        var tableEl = document.getElementById('forecast-table');
        var partsEl = document.getElementById('forecast-parts');
        if (!tableEl) return;

        var daysEl = document.getElementById('forecast-days');
        var days = daysEl ? daysEl.value : 7;

        try {
            var results = await Promise.all([
                fetch('/api/forecast?days=' + days),
                fetch('/api/forecast/parts?days=' + days)
            ]);

            var forecastData = await results[0].json();
            var partsDataRes = await results[1].json();
            var forecasts = forecastData.forecasts || [];

            if (forecasts.length === 0) {
                tableEl.innerHTML = '<p style="color: #888; text-align: center; padding: 20px;">예측할 주문 데이터가 없습니다.</p>';
            } else {
                var trendIcon = function(t) {
                    if (t === 'up') return '<span class="trend-up">^</span>';
                    if (t === 'down') return '<span class="trend-down">v</span>';
                    return '<span class="trend-stable">-></span>';
                };
                tableEl.innerHTML = '<table><thead><tr>' +
                    '<th>SKU명</th><th>' + days + '일 예측</th><th>신뢰구간</th><th>추세</th>' +
                    '</tr></thead><tbody>' + forecasts.map(function(f) {
                        return '<tr>' +
                            '<td>' + f.sku_name + '</td>' +
                            '<td><strong>' + f.total_predicted + '</strong>개</td>' +
                            '<td>' + f.confidence_low + ' ~ ' + f.confidence_high + '</td>' +
                            '<td>' + trendIcon(f.trend) + '</td>' +
                            '</tr>';
                    }).join('') + '</tbody></table>';
            }

            // 부위별 소요량
            var parts = partsDataRes.parts || [];
            if (parts.length === 0) {
                partsEl.innerHTML = '<p style="color: #888;">소요량 데이터가 없습니다.</p>';
            } else {
                var maxKg = Math.max.apply(null, parts.map(function(p) { return p.weight_needed_kg; }).concat([1]));
                partsEl.innerHTML = '<div class="bar-chart">' + parts.map(function(p) {
                    var pct = (p.weight_needed_kg / maxKg * 100);
                    return '<div class="bar-row">' +
                        '<span class="bar-label">' + p.part_name + '</span>' +
                        '<div class="bar-track"><div class="bar-fill" style="width:' + pct + '%"></div></div>' +
                        '<span class="bar-value">' + p.weight_needed_kg + 'kg</span>' +
                        '</div>';
                }).join('') + '</div>';
            }
        } catch (e) {
            tableEl.innerHTML = '<p style="color: #e74c3c;">예측 로드 실패</p>';
        }
    }

    // ==================== AI-Native A-7: 스마트 발주 ====================
    var smartOrderData = [];

    async function loadSmartOrder() {
        var tableEl = document.getElementById('smart-order-table');
        var summaryEl = document.getElementById('smart-order-summary');
        if (!tableEl) return;

        try {
            var res = await fetch('/api/smart-order/recommendations?days=7');
            var data = await res.json();
            smartOrderData = data.recommendations || [];
            var summary = data.summary || {};

            summaryEl.innerHTML =
                '<div class="stat-card">' +
                    '<div class="stat-value">' + (summary.total_items || 0) + '</div>' +
                    '<div class="stat-label">추천 상품 수</div>' +
                '</div>' +
                '<div class="stat-card">' +
                    '<div class="stat-value" style="color: var(--danger-color);">' + (summary.critical_count || 0) + '</div>' +
                    '<div class="stat-label">긴급 발주</div>' +
                '</div>' +
                '<div class="stat-card">' +
                    '<div class="stat-value" style="color: var(--warning-color);">' + (summary.high_count || 0) + '</div>' +
                    '<div class="stat-label">높은 우선순위</div>' +
                '</div>' +
                '<div class="stat-card">' +
                    '<div class="stat-value">' + (summary.total_recommended_qty || 0) + '</div>' +
                    '<div class="stat-label">총 추천 수량</div>' +
                '</div>';

            if (smartOrderData.length === 0) {
                tableEl.innerHTML = '<p style="color: #888; text-align: center; padding: 20px;">발주 추천이 없습니다.</p>';
                return;
            }

            tableEl.innerHTML = '<table><thead><tr>' +
                '<th><input type="checkbox" onclick="toggleAllSmartOrder(this)"></th>' +
                '<th>SKU명</th><th>현재고</th><th>예상수요</th><th>추천수량</th>' +
                '<th>재고소진</th><th>긴급도</th><th>추세</th>' +
                '</tr></thead><tbody>' + smartOrderData.map(function(r, i) {
                    var trendIcon = r.trend === 'up' ? '<span class="trend-up">^</span>' : r.trend === 'down' ? '<span class="trend-down">v</span>' : '<span class="trend-stable">-></span>';
                    return '<tr>' +
                        '<td><input type="checkbox" class="smart-order-check" data-index="' + i + '" checked></td>' +
                        '<td>' + r.sku_name + '</td>' +
                        '<td>' + r.current_stock + '</td>' +
                        '<td>' + r.predicted_demand + '</td>' +
                        '<td><input type="number" value="' + r.recommended_qty + '" min="0" style="width: 70px;" class="smart-order-qty" data-index="' + i + '"></td>' +
                        '<td>' + (r.days_until_stockout < 999 ? r.days_until_stockout + '일' : '충분') + '</td>' +
                        '<td><span class="urgency-badge urgency-' + r.urgency + '">' + r.urgency + '</span></td>' +
                        '<td>' + trendIcon + '</td>' +
                        '</tr>';
                }).join('') + '</tbody></table>';
        } catch (e) {
            tableEl.innerHTML = '<p style="color: #e74c3c;">로드 실패</p>';
        }
    }

    function toggleAllSmartOrder(master) {
        document.querySelectorAll('.smart-order-check').forEach(function(cb) { cb.checked = master.checked; });
    }

    async function generateSmartOrderExcel() {
        var checkedItems = [];
        document.querySelectorAll('.smart-order-check:checked').forEach(function(cb) {
            var idx = parseInt(cb.dataset.index);
            var qtyInput = document.querySelector('.smart-order-qty[data-index="' + idx + '"]');
            var qty = qtyInput ? parseInt(qtyInput.value) : smartOrderData[idx].recommended_qty;
            checkedItems.push({ sku_name: smartOrderData[idx].sku_name, quantity: qty });
        });

        if (checkedItems.length === 0) {
            window.showToast('발주 항목을 선택하세요.', 'error');
            return;
        }

        try {
            var res = await fetch('/api/smart-order/generate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ items: checkedItems })
            });
            var data = await res.json();

            // 거래처별 엑셀 생성
            var wb = XLSX.utils.book_new();
            Object.entries(data.vendor_groups || {}).forEach(function(entry) {
                var vendor = entry[0];
                var items = entry[1];
                var wsData = [['SKU명', '수량']].concat(items.map(function(i) { return [i.sku_name, i.quantity]; }));
                var ws = XLSX.utils.aoa_to_sheet(wsData);
                XLSX.utils.book_append_sheet(wb, ws, vendor.substring(0, 31));
            });

            if (data.unassigned && data.unassigned.length > 0) {
                var wsData = [['SKU명', '수량']].concat(data.unassigned.map(function(i) { return [i.sku_name, i.quantity]; }));
                var ws = XLSX.utils.aoa_to_sheet(wsData);
                XLSX.utils.book_append_sheet(wb, ws, '미배정');
            }

            XLSX.writeFile(wb, '발주서_' + new Date().toISOString().slice(0, 10) + '.xlsx');
            window.showToast('발주서 생성 완료', 'success');
        } catch (e) {
            window.showToast('발주서 생성 실패', 'error');
        }
    }

    // ==================== showPage 확장 (Stage + AI-Native) ====================
    var _origShowPage = window.showPage;
    window.showPage = function(pageId) {
        _origShowPage(pageId);
        if (pageId === 'vendor-report') { loadVendorReport(); loadVendorPerformance(); }
        if (pageId === 'upload-history') loadUploadHistory();
        if (pageId === 'backup-restore') loadBackupLog();
        if (pageId === 'profitability') loadProfitability();
        if (pageId === 'forecast') loadForecast();
        if (pageId === 'smart-order') loadSmartOrder();
    };

    // ==================== 초기화 훅 (Phase 1+2 + Stage 1-10) ====================
    function initFeatures() {
        // Phase 1 초기화
        setupAutocomplete('mapping-vendor', getUniqueVendors);
        setupAutocomplete('mapping-product-name', function() {
            return (window.vendorMappings || []).map(function(m) { return m.product_code || ''; }).filter(Boolean);
        });

        // 이상치 통계 로드
        loadAnomalyStats();

        // 대시보드 통계 로드
        loadDashboardStats();
    }

    // 최종 초기화 훅: initializeApp 확장
    var _origInitializeApp = window.initializeApp;
    window.initializeApp = async function() {
        await _origInitializeApp();
        // Stage 1: 거래처 필터 업데이트
        updateOrderVendorFilter();
        updateReportVendorFilter();
        loadFilterPresets();
        // Stage 7: 재고 로드
        loadInventory();
        // Stage 8: 알림 초기화
        generateNotifications().then(function() { checkNotifications(); });
    };

    // 알림 패널 외부 클릭 시 닫기
    document.addEventListener('click', function(e) {
        var panel = document.getElementById('notification-panel');
        if (panel && panel.classList.contains('show')) {
            if (!e.target.closest('.notification-bell') && !e.target.closest('.notification-panel')) {
                panel.classList.remove('show');
            }
        }
    });

    // ==================== window에 함수 노출 ====================
    // Phase 1+2
    window.setupAutocomplete = setupAutocomplete;
    window.loadAnomalyStats = loadAnomalyStats;
    window.checkAnomaly = checkAnomaly;
    window.loadDashboardStats = loadDashboardStats;
    window.showSkuSuggestions = showSkuSuggestions;
    window.applySuggestion = applySuggestion;
    window.saveVendorTemplate = saveVendorTemplate;
    window.loadVendorTemplate = loadVendorTemplate;
    window.checkDuplicateOrders = checkDuplicateOrders;
    window.getDeliveryStatus = getDeliveryStatus;
    window.initFeatures = initFeatures;

    // Stage 1: 검색/필터
    window.toggleFilterChip = toggleFilterChip;
    window.buildSearchQuery = buildSearchQuery;
    window.loadFilterPresets = loadFilterPresets;
    window.renderFilterPresets = renderFilterPresets;
    window.saveCurrentFilterPreset = saveCurrentFilterPreset;
    window.applyFilterPreset = applyFilterPreset;
    window.deleteFilterPreset = deleteFilterPreset;
    window.updateOrderVendorFilter = updateOrderVendorFilter;
    window.updateReportVendorFilter = updateReportVendorFilter;

    // Stage 3: 원가 이력
    window.showCostHistory = showCostHistory;
    window.closeCostHistoryModal = closeCostHistoryModal;

    // Stage 4: 업로드 이력
    window.loadUploadHistory = loadUploadHistory;
    window.saveUploadHistory = saveUploadHistory;

    // Stage 5: 주문 상세
    window.openOrderDetailModal = openOrderDetailModal;
    window.closeOrderDetailModal = closeOrderDetailModal;
    window.switchOrderTab = switchOrderTab;
    window.loadOrderHistory = loadOrderHistory;
    window.loadOrderComments = loadOrderComments;
    window.submitOrderComment = submitOrderComment;

    // Stage 6: 매출 리포트
    window.loadVendorReport = loadVendorReport;
    window.renderVendorReport = renderVendorReport;
    window.downloadVendorReportExcel = downloadVendorReportExcel;

    // Stage 7: 재고
    window.loadInventory = loadInventory;
    window.openInventoryModal = openInventoryModal;
    window.closeInventoryModal = closeInventoryModal;
    window.submitInventoryAdjust = submitInventoryAdjust;

    // Stage 8: 알림
    window.checkNotifications = checkNotifications;
    window.toggleNotificationPanel = toggleNotificationPanel;
    window.renderNotificationList = renderNotificationList;
    window.handleNotificationClick = handleNotificationClick;
    window.markAllNotificationsRead = markAllNotificationsRead;
    window.generateNotifications = generateNotifications;

    // Stage 9: 역할
    window.applyRoleRestrictions = applyRoleRestrictions;

    // Stage 10: 백업
    window.exportBackup = exportBackup;
    window.importBackup = importBackup;
    window.loadBackupLog = loadBackupLog;

    // AI-Native
    window.fuzzyMatchItems = fuzzyMatchItems;
    window.getConfidenceBadge = getConfidenceBadge;
    window.showCostAnomalyAlert = showCostAnomalyAlert;
    window.loadProfitability = loadProfitability;
    window.showProfitabilityDetail = showProfitabilityDetail;
    window.loadVendorPerformance = loadVendorPerformance;
    window.checkSmartDuplicates = checkSmartDuplicates;
    window.showDuplicateModal = showDuplicateModal;
    window.proceedDespiteDuplicates = proceedDespiteDuplicates;
    window.loadForecast = loadForecast;
    window.loadSmartOrder = loadSmartOrder;
    window.toggleAllSmartOrder = toggleAllSmartOrder;
    window.generateSmartOrderExcel = generateSmartOrderExcel;

    return {
        // Phase 1+2
        setupAutocomplete: setupAutocomplete,
        loadAnomalyStats: loadAnomalyStats,
        checkAnomaly: checkAnomaly,
        loadDashboardStats: loadDashboardStats,
        showSkuSuggestions: showSkuSuggestions,
        applySuggestion: applySuggestion,
        checkDuplicateOrders: checkDuplicateOrders,
        getDeliveryStatus: getDeliveryStatus,
        initFeatures: initFeatures,
        // Stage 1-10
        toggleFilterChip: toggleFilterChip,
        showCostHistory: showCostHistory,
        closeCostHistoryModal: closeCostHistoryModal,
        loadUploadHistory: loadUploadHistory,
        saveUploadHistory: saveUploadHistory,
        openOrderDetailModal: openOrderDetailModal,
        closeOrderDetailModal: closeOrderDetailModal,
        switchOrderTab: switchOrderTab,
        submitOrderComment: submitOrderComment,
        loadVendorReport: loadVendorReport,
        downloadVendorReportExcel: downloadVendorReportExcel,
        loadInventory: loadInventory,
        openInventoryModal: openInventoryModal,
        closeInventoryModal: closeInventoryModal,
        submitInventoryAdjust: submitInventoryAdjust,
        checkNotifications: checkNotifications,
        toggleNotificationPanel: toggleNotificationPanel,
        markAllNotificationsRead: markAllNotificationsRead,
        applyRoleRestrictions: applyRoleRestrictions,
        exportBackup: exportBackup,
        importBackup: importBackup,
        loadBackupLog: loadBackupLog,
        // AI-Native
        fuzzyMatchItems: fuzzyMatchItems,
        getConfidenceBadge: getConfidenceBadge,
        showCostAnomalyAlert: showCostAnomalyAlert,
        loadProfitability: loadProfitability,
        showProfitabilityDetail: showProfitabilityDetail,
        loadVendorPerformance: loadVendorPerformance,
        checkSmartDuplicates: checkSmartDuplicates,
        showDuplicateModal: showDuplicateModal,
        proceedDespiteDuplicates: proceedDespiteDuplicates,
        loadForecast: loadForecast,
        loadSmartOrder: loadSmartOrder,
        toggleAllSmartOrder: toggleAllSmartOrder,
        generateSmartOrderExcel: generateSmartOrderExcel
    };
})();
