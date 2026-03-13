// ==================== app.features.js ====================
// Phase 1+2 AI-Native 기능: 자동완성, 이상치 감지, 대시보드 통계, SKU 제안, 템플릿, 중복 감지

        // ==================== Phase 1: 스마트 자동완성 ====================
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

        // ==================== Phase 1: 이상치 감지 ====================
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

        // ==================== Phase 1: 대시보드 집계 ====================
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

        // ==================== Phase 2: 매핑 학습 (유사 SKU 제안) ====================
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
                const res = await fetch('/api/vendor-templates');
                const data = await res.json();
                const templates = data.templates || [];
                const found = templates.find(t => t.vendor_name === vendorName);
                return found ? found.template_json : null;
            } catch (e) {
                return null;
            }
        }

        // ==================== Phase 2: 중복 주문 감지 ====================
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

        // ==================== Phase 2: 배송 추적 ====================
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
