// ==================== app.orders.js ====================
// 주문관리: 로딩, 확정데이터, 등록, 주문관리 렌더링, 상태 토글, 다운로드, SKU CRUD
window.AppOrders = (function() {
    'use strict';

    // ==================== 페이지네이션 상태 ====================
    window.orderCurrentPage = 1;
    window.orderPerPage = 50;
    window.orderTotalPages = 1;
    window.orderTotal = 0;

    // ==================== 주문 데이터 로드 ====================
    function loadUserConfirmed(userId) {
        renderConfirmed();
    }

    async function loadUserOrders(userId) {
        showLoading();
        try {
            var dateFrom = document.getElementById('order-date-from') ? document.getElementById('order-date-from').value : '';
            var dateTo = document.getElementById('order-date-to') ? document.getElementById('order-date-to').value : '';
            var url = '/api/orders?user_id=' + (userId || window.currentUserId) + '&page=' + window.orderCurrentPage + '&per_page=' + window.orderPerPage;
            if (dateFrom) url += '&date_from=' + dateFrom;
            if (dateTo) url += '&date_to=' + dateTo;

            var res = await fetch(url);
            var data = await res.json();

            // 페이지네이션 메타데이터 저장
            window.orderTotal = data.total || 0;
            window.orderCurrentPage = data.page || 1;
            window.orderTotalPages = data.total_pages || 1;

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
            renderOrderManagement();
            renderOrderPagination(window.orderTotal, window.orderCurrentPage, window.orderTotalPages);
        } catch (e) {
            console.error('주문 로드 실패:', e);
            showToast('주문 데이터 로드 실패', 'error');
        }
        hideLoading();
    }

    function renderOrderPagination(total, page, totalPages) {
        var container = document.getElementById('order-pagination');
        if (!container) return;
        if (totalPages <= 1) { container.innerHTML = ''; return; }

        var html = '<div class="pagination">';
        html += '<button class="btn btn-secondary btn-small" onclick="goToOrderPage(1)" ' + (page === 1 ? 'disabled' : '') + '>처음</button>';
        html += '<button class="btn btn-secondary btn-small" onclick="goToOrderPage(' + (page - 1) + ')" ' + (page === 1 ? 'disabled' : '') + '>이전</button>';
        html += '<span class="pagination-info">' + page + ' / ' + totalPages + ' (총 ' + total + '건)</span>';
        html += '<button class="btn btn-secondary btn-small" onclick="goToOrderPage(' + (page + 1) + ')" ' + (page === totalPages ? 'disabled' : '') + '>다음</button>';
        html += '<button class="btn btn-secondary btn-small" onclick="goToOrderPage(' + totalPages + ')" ' + (page === totalPages ? 'disabled' : '') + '>마지막</button>';
        html += '</div>';
        container.innerHTML = html;
    }

    function goToOrderPage(page) {
        window.orderCurrentPage = page;
        loadUserOrders();
    }

    // ==================== 변환확정 렌더링 ====================
    function renderConfirmed() {
        var badge = document.getElementById('confirmed-badge');
        var summary = document.getElementById('confirmed-summary');
        var table = document.getElementById('confirmed-table');
        if (!table) return;

        if (badge) badge.textContent = window.confirmedData.length;

        if (window.confirmedData.length === 0) {
            if (summary) summary.innerHTML = '';
            table.innerHTML = '<p style="color: #888; text-align: center; padding: 20px;">확정된 데이터가 없습니다.</p>';
            return;
        }

        var selectedCount = window.confirmedData.filter(function(item) { return item._selected; }).length;
        var matchedCount = window.confirmedData.filter(function(item) { return item._skuMatched; }).length;
        var unmatchedCount = window.confirmedData.length - matchedCount;

        if (summary) {
            summary.innerHTML =
                '<div class="summary-item"><span class="label">전체:</span><span class="value">' + window.confirmedData.length + '건</span></div>' +
                '<div class="summary-item"><span class="label">선택:</span><span class="value">' + selectedCount + '건</span></div>' +
                '<div class="summary-item"><span class="label">매칭:</span><span class="value" style="color:#27ae60;">' + matchedCount + '</span></div>' +
                (unmatchedCount > 0 ? '<div class="summary-item"><span class="label">미매칭:</span><span class="value" style="color:#e74c3c;">' + unmatchedCount + '</span></div>' : '');
        }

        // 필터/정렬 적용
        var filteredData = getFilteredConfirmedData();
        table.innerHTML = buildConfirmedTable(filteredData);
    }

    function getFilteredConfirmedData() {
        var data = window.confirmedData.slice();

        Object.keys(window.confirmedFilters).forEach(function(key) {
            var filterValues = window.confirmedFilters[key];
            if (filterValues && filterValues.length > 0) {
                data = data.filter(function(item) { return filterValues.includes(item[key] || ''); });
            }
        });

        if (window.confirmedSort.key && window.confirmedSort.direction) {
            data.sort(function(a, b) {
                var aVal = a[window.confirmedSort.key] || '';
                var bVal = b[window.confirmedSort.key] || '';
                if (window.confirmedSort.key === 'releaseDate') {
                    if (!aVal && bVal) return -1;
                    if (aVal && !bVal) return 1;
                }
                var comparison = aVal < bVal ? -1 : aVal > bVal ? 1 : 0;
                return window.confirmedSort.direction === 'desc' ? -comparison : comparison;
            });
        }

        return data;
    }

    function buildConfirmedTable(data) {
        var columns = window.TARGET_COLUMNS;
        var html = '<table><thead><tr>';
        html += '<th><input type="checkbox" onchange="toggleAllRows(\'confirmed\', this.checked)" checked></th>';
        html += '<th>#</th>';
        columns.forEach(function(c) {
            html += '<th style="cursor:pointer;" onclick="toggleConfirmedSort(\'' + c.key + '\')">' + escapeHtml(c.name);
            if (window.confirmedSort.key === c.key) {
                html += window.confirmedSort.direction === 'asc' ? ' &#x25B2;' : ' &#x25BC;';
            }
            html += '</th>';
        });
        html += '</tr></thead><tbody>';

        data.forEach(function(item, idx) {
            var origIdx = window.confirmedData.indexOf(item);
            html += '<tr>';
            html += '<td><input type="checkbox" ' + (item._selected ? 'checked' : '') + ' onchange="handleRowToggle(\'confirmed\', ' + origIdx + ')"></td>';
            html += '<td>' + (idx + 1) + '</td>';

            columns.forEach(function(col) {
                var value = escapeHtml(item[col.key] || '');
                if (col.key === 'skuName') {
                    if (!item._skuMatched) {
                        html += '<td><button class="btn btn-danger btn-small" onclick="openQuickMatchModal(' + origIdx + ')" style="padding:2px 8px;font-size:11px;">미매칭</button>';
                        html += '<div style="font-size:11px;color:#666;margin-top:2px;">' + escapeHtml(item.productName || '') + '</div></td>';
                    } else {
                        html += '<td><span style="background:#d4edda;color:#155724;padding:2px 6px;border-radius:4px;font-size:11px;">매칭</span> ' + value + '</td>';
                    }
                } else if (col.key === 'packagingComposition') {
                    var packCompText = '-';
                    var sku = null;
                    if (item._skuProductId) sku = window.skuProducts.find(function(p) { return p.id === item._skuProductId; });
                    if (!sku && item.skuName) sku = window.skuProducts.find(function(p) { return p.sku_name === item.skuName; });
                    if (sku) {
                        var packagingName = sku.packaging || '';
                        var compText = (sku.compositions || []).map(function(c) { return c.part_name + c.weight + 'g'; }).join(',');
                        packCompText = packagingName ? '[' + packagingName + '] ' + compText : compText || '-';
                    }
                    html += '<td style="font-size:12px;color:#555;" title="' + escapeHtml(packCompText) + '">' + escapeHtml(packCompText) + '</td>';
                } else if (col.key === 'convertedDate') {
                    html += '<td style="font-size:12px;color:#666;">' + (value || '-') + '</td>';
                } else if (col.key === 'vendor') {
                    html += '<td><span style="background:#e3f2fd;color:#1565c0;padding:2px 6px;border-radius:4px;font-size:11px;">' + (value || '-') + '</span></td>';
                } else {
                    html += '<td><input type="text" value="' + value + '" style="min-width:' + col.width + ';border:1px solid #eee;padding:4px 6px;border-radius:4px;font-size:12px;" onchange="handleCellChange(\'confirmed\', ' + origIdx + ', \'' + col.key + '\', this.value)"></td>';
                }
            });
            html += '</tr>';
        });

        html += '</tbody></table>';
        return html;
    }

    function toggleConfirmedSort(key) {
        if (window.confirmedSort.key === key) {
            if (window.confirmedSort.direction === 'asc') window.confirmedSort.direction = 'desc';
            else if (window.confirmedSort.direction === 'desc') window.confirmedSort = { key: null, direction: null };
            else window.confirmedSort = { key: key, direction: 'asc' };
        } else {
            window.confirmedSort = { key: key, direction: 'asc' };
        }
        renderConfirmed();
    }

    // ==================== 주문 등록 ====================
    async function registerOrders() {
        var selectedItems = window.confirmedData.filter(function(item) { return item._selected; });
        if (selectedItems.length === 0) {
            showToast('등록할 항목을 선택해주세요.', 'error');
            return;
        }

        if (!window.currentUserId) {
            showToast('사용자를 먼저 선택해주세요.', 'error');
            return;
        }

        showLoading();
        try {
            var orders = selectedItems.map(function(item) {
                var skuId = item._skuProductId || null;
                return {
                    user_id: window.currentUserId,
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

            var res = await fetch('/api/orders', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(orders)
            });

            if (!res.ok) throw new Error('등록 실패');

            window.confirmedData = window.confirmedData.filter(function(item) { return !item._selected; });
            renderConfirmed();
            showToast(selectedItems.length + '건이 전체주문관리에 등록되었습니다.', 'success');
        } catch (e) {
            console.error('주문 등록 실패:', e);
            showToast('주문 등록 실패: ' + e.message, 'error');
        }
        hideLoading();
    }

    // ==================== 전체주문관리 렌더링 ====================
    function renderOrderManagement() {
        var badge = document.getElementById('order-badge');
        var summary = document.getElementById('order-summary');
        var table = document.getElementById('order-table');
        if (!table) return;

        if (badge) badge.textContent = window.orderManagementData.length;

        if (window.orderManagementData.length === 0) {
            if (summary) summary.innerHTML = '';
            table.innerHTML = '<p style="color: #888; text-align: center; padding: 20px;">등록된 주문이 없습니다.</p>';
            return;
        }

        var selectedCount = window.orderManagementData.filter(function(item) { return item._selected; }).length;
        var shippedCount = window.orderManagementData.filter(function(item) { return item._shipped; }).length;
        var paidCount = window.orderManagementData.filter(function(item) { return item._paid; }).length;

        if (summary) {
            summary.innerHTML =
                '<div class="summary-item"><span class="label">전체:</span><span class="value">' + window.orderManagementData.length + '건</span></div>' +
                '<div class="summary-item"><span class="label">선택:</span><span class="value">' + selectedCount + '건</span></div>' +
                '<div class="summary-item"><span class="label">출고완료:</span><span class="value" style="color:#27ae60;">' + shippedCount + '</span></div>' +
                '<div class="summary-item"><span class="label">입금완료:</span><span class="value" style="color:#3498db;">' + paidCount + '</span></div>';
        }

        // 필터/정렬 적용
        var data = window.orderManagementData.slice();

        Object.keys(window.orderManagementFilters).forEach(function(key) {
            var filterValues = window.orderManagementFilters[key];
            if (filterValues && filterValues.length > 0) {
                data = data.filter(function(item) {
                    var val = getOrderDisplayValue(item, key);
                    return filterValues.includes(val);
                });
            }
        });

        if (window.orderManagementSort.key && window.orderManagementSort.direction) {
            data.sort(function(a, b) {
                var aVal = getOrderDisplayValue(a, window.orderManagementSort.key);
                var bVal = getOrderDisplayValue(b, window.orderManagementSort.key);
                var cmp = aVal < bVal ? -1 : aVal > bVal ? 1 : 0;
                return window.orderManagementSort.direction === 'desc' ? -cmp : cmp;
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
        var columns = window.ORDER_MANAGEMENT_COLUMNS;
        var html = '<table><thead><tr>';
        html += '<th><input type="checkbox" onchange="orderToggleAll(this.checked)"></th>';
        html += '<th>#</th>';
        columns.forEach(function(c) {
            html += '<th style="cursor:pointer;" onclick="toggleOrderSort(\'' + c.key + '\')">' + escapeHtml(c.name);
            if (window.orderManagementSort.key === c.key) {
                html += window.orderManagementSort.direction === 'asc' ? ' &#x25B2;' : ' &#x25BC;';
            }
            html += '</th>';
        });
        html += '</tr></thead><tbody>';

        data.forEach(function(item, idx) {
            var origIdx = window.orderManagementData.indexOf(item);
            html += '<tr>';
            html += '<td><input type="checkbox" ' + (item._selected ? 'checked' : '') + ' onchange="handleOrderRowToggle(' + origIdx + ')"></td>';
            html += '<td>' + (idx + 1) + '</td>';

            columns.forEach(function(col) {
                if (col.key === '_shipped') {
                    html += '<td><span class="status-badge ' + (item._shipped ? 'shipped' : 'not-shipped') + '" style="cursor:pointer;" onclick="toggleOrderStatus(' + origIdx + ', \'_shipped\')">' + (item._shipped ? '출고' : '미출고') + '</span></td>';
                } else if (col.key === '_paid') {
                    html += '<td><span class="status-badge ' + (item._paid ? 'paid' : 'not-paid') + '" style="cursor:pointer;" onclick="toggleOrderStatus(' + origIdx + ', \'_paid\')">' + (item._paid ? '입금' : '미입금') + '</span></td>';
                } else if (col.key === '_invoiceIssued') {
                    var issued = item._invoiceIssued;
                    html += '<td><span class="status-badge ' + (issued ? 'shipped' : 'not-shipped') + '" style="cursor:pointer;" onclick="toggleOrderStatus(' + origIdx + ', \'_invoiceIssued\')">' + (issued ? '발행' : '미발행') + '</span></td>';
                } else if (col.key === 'invoiceNo') {
                    var inv = escapeHtml(item.invoiceNo || '');
                    html += '<td><input type="text" value="' + inv + '" style="min-width:100px;border:1px solid #eee;padding:4px 6px;border-radius:4px;font-size:12px;" onchange="handleOrderCellChange(' + origIdx + ', \'invoiceNo\', this.value)"></td>';
                } else if (col.key === 'unitPrice') {
                    var price = item.unitPrice || '';
                    html += '<td><input type="number" value="' + price + '" style="min-width:80px;border:1px solid #eee;padding:4px 6px;border-radius:4px;font-size:12px;" onchange="handleOrderCellChange(' + origIdx + ', \'unitPrice\', this.value)"></td>';
                } else if (col.key === 'vendor') {
                    html += '<td><span style="background:#e3f2fd;color:#1565c0;padding:2px 6px;border-radius:4px;font-size:11px;">' + escapeHtml(item.vendor || '-') + '</span></td>';
                } else {
                    var value = escapeHtml(item[col.key] || '');
                    html += '<td><input type="text" value="' + value + '" style="min-width:' + col.width + ';border:1px solid #eee;padding:4px 6px;border-radius:4px;font-size:12px;" onchange="handleOrderCellChange(' + origIdx + ', \'' + col.key + '\', this.value)"></td>';
                }
            });
            html += '</tr>';
        });

        html += '</tbody></table>';
        return html;
    }

    // ==================== 주문 행 토글/셀 변경 ====================
    function orderToggleAll(checked) {
        window.orderManagementData.forEach(function(item) { item._selected = checked; });
        renderOrderManagement();
    }

    function handleOrderRowToggle(idx) {
        window.orderManagementData[idx]._selected = !window.orderManagementData[idx]._selected;
        renderOrderManagement();
    }

    async function handleOrderCellChange(idx, key, value) {
        window.orderManagementData[idx][key] = value;

        if (key === 'invoiceNo' && value && value.trim() !== '') {
            window.orderManagementData[idx]._shipped = true;
            renderOrderManagement();
        }

        // DB 업데이트
        var id = window.orderManagementData[idx]._id;
        if (id) {
            try {
                var updateKey = key === 'unitPrice' ? 'unit_price' : key === 'invoiceNo' ? 'invoice_no' : key;
                var body = {};
                body[updateKey] = value;
                await fetch('/api/orders/' + id, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(body)
                });
            } catch (e) {
                console.error('셀 업데이트 실패:', e);
            }
        }
    }

    async function toggleOrderStatus(idx, statusKey) {
        window.orderManagementData[idx][statusKey] = !window.orderManagementData[idx][statusKey];
        renderOrderManagement();

        var id = window.orderManagementData[idx]._id;
        if (id) {
            var fieldMapping = { '_shipped': 'shipped', '_paid': 'paid', '_invoiceIssued': 'invoice_issued' };
            var apiField = fieldMapping[statusKey] || statusKey.replace('_', '');
            try {
                var body = {};
                body[apiField] = window.orderManagementData[idx][statusKey];
                await fetch('/api/orders/' + id, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(body)
                });
            } catch (e) {
                console.error('상태 업데이트 실패:', e);
            }
        }
    }

    function toggleOrderSort(key) {
        if (window.orderManagementSort.key === key) {
            if (window.orderManagementSort.direction === 'asc') window.orderManagementSort.direction = 'desc';
            else if (window.orderManagementSort.direction === 'desc') window.orderManagementSort = { key: null, direction: null };
            else window.orderManagementSort = { key: key, direction: 'asc' };
        } else {
            window.orderManagementSort = { key: key, direction: 'asc' };
        }
        renderOrderManagement();
    }

    async function bulkUpdateStatus(field, value) {
        var selected = window.orderManagementData.filter(function(item) { return item._selected; });
        if (selected.length === 0) {
            showToast('선택된 항목이 없습니다.', 'error');
            return;
        }

        var fieldToKey = { 'shipped': '_shipped', 'paid': '_paid', 'invoice_issued': '_invoiceIssued' };
        var statusKey = fieldToKey[field] || ('_' + field);
        var allSet = selected.every(function(item) { return item[statusKey]; });
        var newValue = !allSet;

        var ids = selected.filter(function(item) { return item._id; }).map(function(item) { return item._id; });
        if (ids.length > 0) {
            try {
                var body = {};
                body[field] = newValue;
                await fetch('/api/orders/bulk-update', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ ids: ids, updates: body })
                });
            } catch (e) {
                console.error('상태 업데이트 실패:', e);
            }
        }

        selected.forEach(function(item) { item[statusKey] = newValue; });
        renderOrderManagement();
        var statusText = newValue ? '완료' : '미완료';
        showToast(selected.length + '건이 ' + statusText + ' 처리되었습니다.', 'success');
    }

    // ==================== 송장 업로드 ====================
    function handleInvoiceUpload() {
        var input = document.getElementById('invoice-file-input');
        var file = input ? input.files[0] : null;
        if (!file) return;

        var reader = new FileReader();
        reader.onload = async function(e) {
            try {
                var workbook = XLSX.read(e.target.result, { type: 'array' });
                var sheet = workbook.Sheets[workbook.SheetNames[0]];
                var data = XLSX.utils.sheet_to_json(sheet, { header: 1 });

                if (data.length < 2) {
                    showToast('엑셀 파일에 데이터가 없습니다.', 'error');
                    input.value = '';
                    return;
                }

                var HEADER_KEYWORDS = ['송장번호', '운송장번호', '송장', '운송장', '주문번호', '수하인', '송하인'];
                var headerRowIdx = -1;
                var headers = [];

                for (var i = 0; i < Math.min(20, data.length); i++) {
                    var row = data[i];
                    if (!row || row.length === 0) continue;
                    var rowText = row.map(function(c) { return String(c || '').trim().toLowerCase(); }).join(' ');
                    var matchCount = HEADER_KEYWORDS.filter(function(kw) { return rowText.includes(kw); }).length;
                    if (matchCount >= 2) {
                        headerRowIdx = i;
                        headers = row.map(function(h) { return String(h || '').trim().toLowerCase(); });
                        break;
                    }
                }

                if (headerRowIdx === -1) {
                    showToast('헤더 행을 찾을 수 없습니다.', 'error');
                    input.value = '';
                    return;
                }

                var invoiceColIdx = -1, orderNoColIdx = -1, deliveryNoColIdx = -1;
                var receiverColIdx = -1, senderColIdx = -1;

                for (var hi = 0; hi < headers.length; hi++) {
                    var h = headers[hi];
                    if (invoiceColIdx === -1 && ['송장번호', '운송장번호', '운송장', '송장'].some(function(k) { return h.includes(k); })) {
                        invoiceColIdx = hi;
                    }
                    if (orderNoColIdx === -1 && ['주문번호', '고객주문번호'].some(function(k) { return h.includes(k); })) {
                        orderNoColIdx = hi;
                    }
                    if (deliveryNoColIdx === -1 && !['송장', '운송장'].some(function(k) { return h.includes(k); }) &&
                        ['추가옵션', '배송번호', '고객배송번호'].some(function(k) { return h.includes(k); })) {
                        deliveryNoColIdx = hi;
                    }
                    if (receiverColIdx === -1 && ['수하인', '받는분', '수령인', '수취인'].some(function(k) { return h.includes(k); }) &&
                        !h.includes('주소') && !h.includes('연락') && !h.includes('전화')) {
                        receiverColIdx = hi;
                    }
                    if (senderColIdx === -1 && ['송하인', '보내는분', '발송인'].some(function(k) { return h.includes(k); }) &&
                        !h.includes('주소') && !h.includes('연락') && !h.includes('전화')) {
                        senderColIdx = hi;
                    }
                }

                if (invoiceColIdx === -1) {
                    showToast('송장번호 컬럼을 찾을 수 없습니다.', 'error');
                    input.value = '';
                    return;
                }

                var matchedCount = 0;
                for (var ri = headerRowIdx + 1; ri < data.length; ri++) {
                    var row2 = data[ri];
                    var invoiceNo = String(row2[invoiceColIdx] || '').trim();
                    if (!invoiceNo) continue;

                    var orderNo = orderNoColIdx >= 0 ? String(row2[orderNoColIdx] || '').trim() : '';
                    var deliveryNo = deliveryNoColIdx >= 0 ? String(row2[deliveryNoColIdx] || '').trim() : '';
                    var receiverName = receiverColIdx >= 0 ? String(row2[receiverColIdx] || '').trim() : '';
                    var senderName = senderColIdx >= 0 ? String(row2[senderColIdx] || '').trim() : '';

                    for (var oi = 0; oi < window.orderManagementData.length; oi++) {
                        var order = window.orderManagementData[oi];
                        if (order.invoiceNo) continue;

                        if (orderNo && order.orderNo && order.orderNo === orderNo) {
                            if (!deliveryNo || !order.deliveryNo || order.deliveryNo === deliveryNo) {
                                order.invoiceNo = invoiceNo;
                                order._shipped = true;
                                matchedCount++;
                                break;
                            }
                        }

                        if (!orderNo && receiverName && senderName) {
                            var orderReceiver = (order.receiverName || '').replace('님', '').trim();
                            var excelReceiver = receiverName.replace('님', '').trim();
                            var orderSender = (order.senderName || '').trim();
                            var excelSender = senderName.replace('님', '').trim();

                            if (orderReceiver === excelReceiver && orderSender === excelSender) {
                                order.invoiceNo = invoiceNo;
                                order._shipped = true;
                                matchedCount++;
                                break;
                            }
                        }
                    }
                }

                if (matchedCount > 0) {
                    var matchedOrders = window.orderManagementData.filter(function(o) { return o.invoiceNo && o._id; });
                    try {
                        for (var mi = 0; mi < matchedOrders.length; mi++) {
                            await fetch('/api/orders/' + matchedOrders[mi]._id, {
                                method: 'PUT',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify({ invoice_no: matchedOrders[mi].invoiceNo, shipped: true })
                            });
                        }
                    } catch (e) {
                        console.error('송장 업데이트 실패:', e);
                    }
                }

                renderOrderManagement();
                showToast(matchedCount + '건의 송장번호가 매칭되었습니다.', matchedCount > 0 ? 'success' : 'info');
                input.value = '';
            } catch (err) {
                showToast('송장 파일 처리 오류: ' + err.message, 'error');
                input.value = '';
            }
        };
        reader.readAsArrayBuffer(file);
    }

    // ==================== 빠른매칭 모달 ====================
    function openQuickMatchModal(idx) {
        window.quickMatchIndex = idx;
        var item = window.confirmedData[idx];
        var modal = document.getElementById('quick-match-modal');
        if (!modal) return;

        document.getElementById('quick-match-vendor').textContent = item.vendor || '-';
        document.getElementById('quick-match-product-code').textContent = item.productCode || '-';
        document.getElementById('quick-match-product-name').textContent = item.productName || '-';

        var select = document.getElementById('quick-match-sku-select');
        select.innerHTML = '<option value="">SKU 상품을 선택하세요</option>';
        window.skuProducts.forEach(function(sku) {
            var option = document.createElement('option');
            option.value = sku.id;
            option.textContent = sku.sku_name + ' (' + (sku.selling_price || 0).toLocaleString() + '원)';
            select.appendChild(option);
        });

        document.getElementById('quick-match-save-mapping').checked = true;
        modal.classList.add('show');
        if (typeof showSkuSuggestions === 'function') showSkuSuggestions();
    }

    function closeQuickMatchModal() {
        var modal = document.getElementById('quick-match-modal');
        if (modal) modal.classList.remove('show');
        window.quickMatchIndex = -1;
    }

    async function applyQuickMatch() {
        if (window.quickMatchIndex < 0) return;
        var skuId = document.getElementById('quick-match-sku-select').value;
        if (!skuId) {
            showToast('SKU 상품을 선택해주세요.', 'error');
            return;
        }

        var sku = window.skuProducts.find(function(p) { return p.id === parseInt(skuId); });
        if (!sku) { showToast('SKU를 찾을 수 없습니다.', 'error'); return; }

        var item = window.confirmedData[window.quickMatchIndex];
        item.skuName = sku.sku_name;
        item._skuMatched = true;
        item._skuProductId = sku.id;

        window.confirmedData.forEach(function(d) {
            if (d.vendor === item.vendor && d.productCode === item.productCode && !d._skuMatched) {
                d.skuName = sku.sku_name;
                d._skuMatched = true;
                d._skuProductId = sku.id;
            }
        });

        var saveMapping = document.getElementById('quick-match-save-mapping').checked;
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
        showToast('"' + sku.sku_name + '"으로 매칭되었습니다.', 'success');
    }

    // ==================== 다운로드 함수 ====================
    function downloadConfirmedExcel() {
        if (window.confirmedData.length === 0) {
            showToast('다운로드할 데이터가 없습니다.', 'error');
            return;
        }
        var selected = window.confirmedData.filter(function(item) { return item._selected; });
        var data = selected.length > 0 ? selected : window.confirmedData;
        downloadLogenExcel(data);
        showToast(data.length + '건을 B타입 양식으로 다운로드했습니다.', 'success');
    }

    function downloadOrderExcel() {
        if (window.orderManagementData.length === 0) {
            showToast('다운로드할 데이터가 없습니다.', 'error');
            return;
        }

        var headers = [
            '등록일', '발주처', '출고요청일', '상품코드', 'SKU상품명', '상품명',
            '수량', '수령인', '수령인연락처', '수령인주소', '송장번호',
            '출고여부', '결제여부', '계산서발행', '단가', '비고'
        ];

        var dataRows = window.orderManagementData.map(function(item) {
            return [
                item.registeredDate || '', item.vendor || '', item.releaseDate || '',
                item.productCode || '', item.skuName || '', item.productName || '',
                item.quantity || '', item.receiverName || '', item.receiverPhone || '',
                item.receiverAddr || '', item.invoiceNo || '',
                item._shipped ? '완료' : '미완료', item._paid ? '완료' : '미완료',
                item._invoiceIssued ? '발행' : '미발행',
                item.unitPrice || '', item.note || ''
            ];
        });

        var wsData = [headers].concat(dataRows);
        var ws = XLSX.utils.aoa_to_sheet(wsData);
        ws['!cols'] = headers.map(function() { return { wch: 15 }; });
        ws['!cols'][5] = { wch: 30 };
        ws['!cols'][9] = { wch: 50 };

        var wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, '전체주문관리');

        var today = new Date();
        var dateStr = today.getFullYear() + String(today.getMonth()+1).padStart(2,'0') + String(today.getDate()).padStart(2,'0');
        XLSX.writeFile(wb, '전체주문관리_' + dateStr + '.xlsx');
        showToast(window.orderManagementData.length + '건을 다운로드했습니다.', 'success');
    }

    function downloadIntegratedExcel() {
        var tableEl = document.getElementById('integrated-table');
        var table = tableEl ? tableEl.querySelector('table') : null;
        if (!table) { showToast('다운로드할 데이터가 없습니다.', 'error'); return; }

        var ws = XLSX.utils.table_to_sheet(table);
        var wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, '통합조회');

        var today = new Date();
        var dateStr = today.getFullYear() + String(today.getMonth()+1).padStart(2,'0') + String(today.getDate()).padStart(2,'0');
        XLSX.writeFile(wb, '통합조회_' + dateStr + '.xlsx');
        showToast('엑셀 다운로드 완료', 'success');
    }

    function downloadLogenExcel(data) {
        var logenHeaders = [
            'SKU상품명', '수량', '수령인', '수령인연락처', '수령인주소',
            '배송메모', '주문번호', '발송인', '발송인연락처', '발송인주소', '배송번호'
        ];

        var logenData = data.map(function(item) {
            return [
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
            ];
        });

        var wsData = [logenHeaders].concat(logenData);
        var ws = XLSX.utils.aoa_to_sheet(wsData);
        ws['!cols'] = [
            { wch: 30 }, { wch: 8 }, { wch: 12 }, { wch: 15 }, { wch: 50 },
            { wch: 25 }, { wch: 20 }, { wch: 12 }, { wch: 15 }, { wch: 40 }, { wch: 15 }
        ];

        var wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, 'B타입');

        var today = new Date();
        var dateStr = today.getFullYear() + String(today.getMonth()+1).padStart(2,'0') + String(today.getDate()).padStart(2,'0');
        XLSX.writeFile(wb, 'B타입_' + dateStr + '_' + data.length + '건.xlsx');
    }

    // ==================== SKU CRUD ====================
    async function savePart() {
        var gradeEl = document.getElementById('part-grade');
        var grade = gradeEl ? gradeEl.value.trim() : '';
        var name = document.getElementById('part-name').value.trim();
        var price = parseInt(document.getElementById('part-price').value) || 0;

        if (!name) { showToast('부위명을 입력하세요.', 'error'); return; }

        showLoading();
        try {
            await fetch('/api/parts-cost', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ part_name: name, price_per_100g: price, cost_type: 'weight', grade: grade })
            });
            await loadPartsData();
            closePartModal();
            showToast('부위가 저장되었습니다.', 'success');
        } catch (e) { showToast('저장 실패', 'error'); }
        hideLoading();
    }

    async function editPart(name) {
        var data = window.partsData[name];
        if (!data) { showToast('수정할 부위를 찾을 수 없습니다.', 'error'); return; }
        var id = window.partsIdMap[name];
        if (!id) { showToast('수정할 부위를 찾을 수 없습니다.', 'error'); return; }

        var currentPrice = typeof data === 'number' ? data : data.price;
        var currentType = typeof data === 'number' ? 'weight' : (data.type || 'weight');
        var currentGrade = data.grade || '';

        var newGrade = prompt('등급을 입력하세요 (예: 1++, 1+, 1, 2):', currentGrade);
        if (newGrade === null) return;

        var newName = prompt('부위명을 입력하세요:', name);
        if (newName === null) return;
        if (!newName.trim()) { alert('부위명을 입력해주세요.'); return; }

        var typeLabel = currentType === 'weight' ? '중량(100g당)' : '개수(1개당)';
        var changeType = confirm('현재 단위: ' + typeLabel + '\n\n단위를 변경하시겠습니까?\n[확인] = 변경 / [취소] = 유지');
        var newType = changeType ? (currentType === 'weight' ? 'unit' : 'weight') : currentType;
        var priceLabel = newType === 'weight' ? '100g당' : '1개당';

        var newPrice = prompt(priceLabel + ' 단가를 입력하세요:', currentPrice);
        if (newPrice === null) return;
        var priceNum = parseInt(newPrice);
        if (isNaN(priceNum) || priceNum < 0) { alert('올바른 단가를 입력해주세요.'); return; }

        try {
            await fetch('/api/parts-cost/' + id, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ part_name: newName.trim(), price_per_100g: priceNum, cost_type: newType, grade: newGrade.trim() })
            });
            showToast('\'' + newName.trim() + '\' 품목이 수정되었습니다.', 'success');
            await loadPartsData();
        } catch (e) { showToast('수정 실패', 'error'); }
    }

    async function deletePart(name) {
        if (!confirm('"' + name + '" 부위를 삭제하시겠습니까?')) return;
        var id = window.partsIdMap[name];
        if (!id) { showToast('삭제할 부위를 찾을 수 없습니다.', 'error'); return; }
        try {
            await fetch('/api/parts-cost/' + id, { method: 'DELETE' });
            showToast('삭제되었습니다.', 'success');
            await loadPartsData();
        } catch (e) { showToast('삭제 실패', 'error'); }
    }

    async function savePackaging() {
        var name = document.getElementById('packaging-name').value.trim();
        var price = parseInt(document.getElementById('packaging-price').value) || 0;
        if (!name) { showToast('포장재명을 입력하세요.', 'error'); return; }

        showLoading();
        try {
            await fetch('/api/packaging-cost', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ packaging_name: name, price: price })
            });
            await loadPackagingData();
            closePackagingModal();
            showToast('포장재가 저장되었습니다.', 'success');
        } catch (e) { showToast('저장 실패', 'error'); }
        hideLoading();
    }

    async function editPackaging(name) {
        var currentPrice = window.packagingData[name];
        if (currentPrice === undefined) { showToast('수정할 포장재를 찾을 수 없습니다.', 'error'); return; }
        var id = window.packagingIdMap[name];
        if (!id) { showToast('수정할 포장재를 찾을 수 없습니다.', 'error'); return; }

        var newName = prompt('포장방법명을 입력하세요:', name);
        if (newName === null) return;
        if (!newName.trim()) { alert('포장방법명을 입력해주세요.'); return; }

        var newPrice = prompt('포장 비용을 입력하세요:', currentPrice);
        if (newPrice === null) return;
        var priceNum = parseInt(newPrice);
        if (isNaN(priceNum) || priceNum < 0) { alert('올바른 가격을 입력해주세요.'); return; }

        try {
            await fetch('/api/packaging-cost/' + id, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ packaging_name: newName.trim(), price: priceNum })
            });
            showToast('\'' + newName.trim() + '\' 포장방법이 수정되었습니다.', 'success');
            await loadPackagingData();
        } catch (e) { showToast('수정 실패', 'error'); }
    }

    async function deletePackaging(name) {
        if (!confirm('"' + name + '" 포장재를 삭제하시겠습니까?')) return;
        var id = window.packagingIdMap[name];
        if (!id) { showToast('삭제할 포장재를 찾을 수 없습니다.', 'error'); return; }
        try {
            await fetch('/api/packaging-cost/' + id, { method: 'DELETE' });
            showToast('삭제되었습니다.', 'success');
            await loadPackagingData();
        } catch (e) { showToast('삭제 실패', 'error'); }
    }

    async function saveSku() {
        var name = document.getElementById('sku-name').value.trim();
        var packaging = document.getElementById('sku-packaging').value;
        var price = parseInt(document.getElementById('sku-price').value) || 0;
        if (!name) { showToast('상품명을 입력하세요.', 'error'); return; }

        var compositions = [];
        document.querySelectorAll('#composition-list .form-row').forEach(function(row) {
            var part = row.querySelector('.comp-part').value;
            var weight = parseInt(row.querySelector('.comp-weight').value) || 0;
            if (part && weight > 0) {
                compositions.push({ part_name: part, weight: weight, composition_type: 'weight' });
            }
        });

        showLoading();
        try {
            var method = window.editingSkuId ? 'PUT' : 'POST';
            var url = window.editingSkuId ? '/api/sku-products/' + window.editingSkuId : '/api/sku-products';

            await fetch(url, {
                method: method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ sku_name: name, packaging: packaging, selling_price: price, compositions: compositions })
            });
            await loadSkuProducts();
            closeSkuModal();
            showToast('SKU 상품이 저장되었습니다.', 'success');
        } catch (e) { showToast('저장 실패', 'error'); }
        hideLoading();
    }

    async function deleteSku(id) {
        if (!confirm('이 SKU 상품을 삭제하시겠습니까?')) return;
        showLoading();
        try {
            await fetch('/api/sku-products/' + id, { method: 'DELETE' });
            await loadSkuProducts();
            showToast('삭제되었습니다.', 'success');
        } catch (e) { showToast('삭제 실패', 'error'); }
        hideLoading();
    }

    async function saveMapping() {
        var vendor = document.getElementById('mapping-vendor').value.trim();
        var code = document.getElementById('mapping-code').value.trim();
        var productName = document.getElementById('mapping-product-name').value.trim();
        var skuId = document.getElementById('mapping-sku').value;
        if (!vendor) { showToast('거래처명을 입력하세요.', 'error'); return; }

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
        } catch (e) { showToast('저장 실패', 'error'); }
        hideLoading();
    }

    async function deleteMapping(id) {
        if (!confirm('이 매핑을 삭제하시겠습니까?')) return;
        showLoading();
        try {
            await fetch('/api/vendor-mappings/' + id, { method: 'DELETE' });
            await loadVendorMappingsAll();
            showToast('삭제되었습니다.', 'success');
        } catch (e) { showToast('삭제 실패', 'error'); }
        hideLoading();
    }

    // ==================== window에 함수 노출 ====================
    window.loadUserConfirmed = loadUserConfirmed;
    window.loadUserOrders = loadUserOrders;
    window.renderOrderPagination = renderOrderPagination;
    window.goToOrderPage = goToOrderPage;
    window.renderConfirmed = renderConfirmed;
    window.toggleConfirmedSort = toggleConfirmedSort;
    window.registerOrders = registerOrders;
    window.renderOrderManagement = renderOrderManagement;
    window.orderToggleAll = orderToggleAll;
    window.handleOrderRowToggle = handleOrderRowToggle;
    window.handleOrderCellChange = handleOrderCellChange;
    window.toggleOrderStatus = toggleOrderStatus;
    window.toggleOrderSort = toggleOrderSort;
    window.bulkUpdateStatus = bulkUpdateStatus;
    window.handleInvoiceUpload = handleInvoiceUpload;
    window.openQuickMatchModal = openQuickMatchModal;
    window.closeQuickMatchModal = closeQuickMatchModal;
    window.applyQuickMatch = applyQuickMatch;
    window.downloadConfirmedExcel = downloadConfirmedExcel;
    window.downloadOrderExcel = downloadOrderExcel;
    window.downloadIntegratedExcel = downloadIntegratedExcel;
    window.downloadLogenExcel = downloadLogenExcel;
    window.savePart = savePart;
    window.editPart = editPart;
    window.deletePart = deletePart;
    window.savePackaging = savePackaging;
    window.editPackaging = editPackaging;
    window.deletePackaging = deletePackaging;
    window.saveSku = saveSku;
    window.deleteSku = deleteSku;
    window.saveMapping = saveMapping;
    window.deleteMapping = deleteMapping;

    return {
        loadUserOrders: loadUserOrders,
        renderConfirmed: renderConfirmed,
        registerOrders: registerOrders,
        renderOrderManagement: renderOrderManagement,
        bulkUpdateStatus: bulkUpdateStatus,
        handleInvoiceUpload: handleInvoiceUpload,
        downloadConfirmedExcel: downloadConfirmedExcel,
        downloadOrderExcel: downloadOrderExcel,
        downloadIntegratedExcel: downloadIntegratedExcel
    };
})();
