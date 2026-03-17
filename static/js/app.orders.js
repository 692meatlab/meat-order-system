// ==================== app.orders.js ====================
// 주문관리: 로딩, 확정데이터, 등록, 주문관리 렌더링, 상태 토글, 다운로드, SKU CRUD

        // ==================== 페이지네이션 상태 ====================
        let orderCurrentPage = 1;
        let orderPerPage = 50;
        let orderTotalPages = 1;
        let orderTotal = 0;

        // ==================== 주문 데이터 로드 ====================
        function loadUserConfirmed(userId) {
            // 확정 데이터는 클라이언트 메모리(confirmedData)에서 관리
            renderConfirmed();
        }

        async function loadUserOrders(userId) {
            showLoading();
            try {
                const dateFrom = document.getElementById('order-date-from')?.value || '';
                const dateTo = document.getElementById('order-date-to')?.value || '';
                let url = `/api/orders?user_id=${userId || currentUserId}&page=${orderCurrentPage}&per_page=${orderPerPage}`;
                if (dateFrom) url += `&date_from=${dateFrom}`;
                if (dateTo) url += `&date_to=${dateTo}`;

                const res = await fetch(url);
                const data = await res.json();

                // 페이지네이션 메타데이터 저장
                orderTotal = data.total || 0;
                orderCurrentPage = data.page || 1;
                orderTotalPages = data.total_pages || 1;

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
                renderOrderPagination(orderTotal, orderCurrentPage, orderTotalPages);
            } catch (e) {
                console.error('주문 로드 실패:', e);
                showToast('주문 데이터 로드 실패', 'error');
            }
            hideLoading();
        }

        function renderOrderPagination(total, page, totalPages) {
            const container = document.getElementById('order-pagination');
            if (!container) return;
            if (totalPages <= 1) { container.innerHTML = ''; return; }

            let html = '<div class="pagination">';
            html += `<button class="btn btn-secondary btn-small" onclick="goToOrderPage(1)" ${page === 1 ? 'disabled' : ''}>처음</button>`;
            html += `<button class="btn btn-secondary btn-small" onclick="goToOrderPage(${page - 1})" ${page === 1 ? 'disabled' : ''}>이전</button>`;
            html += `<span class="pagination-info">${page} / ${totalPages} (총 ${total}건)</span>`;
            html += `<button class="btn btn-secondary btn-small" onclick="goToOrderPage(${page + 1})" ${page === totalPages ? 'disabled' : ''}>다음</button>`;
            html += `<button class="btn btn-secondary btn-small" onclick="goToOrderPage(${totalPages})" ${page === totalPages ? 'disabled' : ''}>마지막</button>`;
            html += '</div>';
            container.innerHTML = html;
        }

        function goToOrderPage(page) {
            orderCurrentPage = page;
            loadUserOrders();
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

        // ==================== 주문 등록 ====================
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
                html += `<td>${idx + 1}</td>`;

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

        // ==================== 주문 행 토글/셀 변경 ====================
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

        async function bulkUpdateStatus(field, value) {
            const selected = orderManagementData.filter(item => item._selected);
            if (selected.length === 0) {
                showToast('선택된 항목이 없습니다.', 'error');
                return;
            }

            // 필드명 매핑 (API field -> JS property)
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

        // ==================== 다운로드 함수 ====================
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

        // ==================== SKU CRUD ====================
        async function savePart() {
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
                    body: JSON.stringify({ part_name: name, price_per_100g: price, cost_type: 'weight' })
                });
                await loadPartsData();
                closePartModal();
                showToast('부위가 저장되었습니다.', 'success');
            } catch (e) {
                showToast('저장 실패', 'error');
            }
            hideLoading();
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
