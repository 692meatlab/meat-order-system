// ==================== app.convert.js ====================
// 발주서 변환 워크플로우: 파일 업로드, 변환, 헤더 감지, 컬럼 매핑, SKU 매칭
window.AppConvert = (function() {
    'use strict';

    // ==================== 파일 업로드 ====================
    var uploadArea = document.getElementById('upload-area');
    var fileInput = document.getElementById('file-input');

    if (uploadArea) {
        uploadArea.onclick = function() { fileInput.click(); };
        uploadArea.ondragover = function(e) { e.preventDefault(); uploadArea.classList.add('dragover'); };
        uploadArea.ondragleave = function() { uploadArea.classList.remove('dragover'); };
        uploadArea.ondrop = function(e) {
            e.preventDefault();
            uploadArea.classList.remove('dragover');
            handleFiles(e.dataTransfer.files);
        };
    }

    if (fileInput) {
        fileInput.onchange = function() { handleFiles(fileInput.files); };
    }

    function handleFiles(files) {
        if (files.length === 0) return;
        window.workbooks = [];
        var names = [];
        var loadedCount = 0;

        Array.from(files).forEach(function(file) {
            names.push(file.name);
            var reader = new FileReader();
            reader.onload = function(e) {
                try {
                    var wb = XLSX.read(e.target.result, { type: 'array' });
                    window.workbooks.push({ workbook: wb, fileName: file.name });
                } catch (err) {
                    console.error('파일 읽기 오류:', file.name, err);
                }
                loadedCount++;
                if (loadedCount === files.length) {
                    document.getElementById('file-info').textContent = '선택됨: ' + names.join(', ');
                    document.getElementById('file-info').classList.add('show');
                    document.getElementById('btn-convert').disabled = false;
                }
            };
            reader.readAsArrayBuffer(file);
        });
    }

    // ==================== 변환 실행 ====================
    function convertOrders() {
        if (window.workbooks.length === 0) {
            showToast('먼저 파일을 업로드해주세요.', 'error');
            return;
        }

        var selectedVendor = document.getElementById('vendor-name').value.trim();
        if (!selectedVendor) {
            showToast('발주처를 선택해주세요.', 'error');
            return;
        }

        showLoading();

        try {
            window.convertedData = [];

            for (var w = 0; w < window.workbooks.length; w++) {
                var workbook = window.workbooks[w].workbook;
                var fileName = window.workbooks[w].fileName;

                for (var s = 0; s < workbook.SheetNames.length; s++) {
                    var sheetName = workbook.SheetNames[s];
                    var sheet = workbook.Sheets[sheetName];
                    var rawData = XLSX.utils.sheet_to_json(sheet, { header: 1 });

                    var headerInfo = findHeaderRow(rawData);
                    if (!headerInfo) continue;

                    var headerRowIdx = headerInfo.headerRowIdx;
                    var columns = headerInfo.columns;
                    var mapping = autoMapColumns(columns);

                    var dataRows = rawData.slice(headerRowIdx + 1).filter(function(row) {
                        return row && row.some(function(cell) { return cell !== undefined && cell !== null && cell !== ''; });
                    });

                    for (var r = 0; r < dataRows.length; r++) {
                        var item = convertRow(dataRows[r], mapping, selectedVendor, fileName);
                        if (item) {
                            var matchedSku = findMatchingSku(item.vendor, item.productCode);
                            if (matchedSku) {
                                item.skuName = matchedSku.sku_name || matchedSku.skuName;
                                item._skuMatched = true;
                                item._skuProductId = matchedSku.id || matchedSku.sku_product_id;
                            } else {
                                item.skuName = item.productName;
                                item._skuMatched = false;
                            }
                            window.convertedData.push(item);
                        }
                    }
                }
            }

            if (window.convertedData.length === 0) {
                showToast('변환할 데이터를 찾지 못했습니다. 엑셀 파일 형식을 확인해주세요.', 'error');
                hideLoading();
                return;
            }

            renderConvertResult();
            showToast(window.workbooks.length + '개 파일에서 ' + window.convertedData.length + '건의 데이터를 변환했습니다.', 'success');

            // 파일 입력 초기화
            window.workbooks = [];
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

    // ==================== 헤더/컬럼 감지 ====================
    function findHeaderRow(data) {
        var keywords = [
            '수령인', '수취인', '받는분', '받는사람', '수령자', '성명', '이름', '고객명',
            '연락처', '휴대폰', '핸드폰', '전화', '폰번호', 'hp', 'tel', '전화번호',
            '주소', '배송지', '배송주소', '도로명',
            '상품', '품명', '품목', '물품', '제품', '아이템', 'product',
            '주문', '오더', 'order', '번호',
            '수량', '개수', 'qty', 'quantity',
            '발송인', '보내는', '송하인',
            '배송', '택배', '송장', '운송장', '메모', '요청', '비고'
        ];

        for (var i = 0; i < Math.min(20, data.length); i++) {
            var row = data[i];
            if (!row || row.length < 2) continue;

            var matchCount = 0;
            var columns = [];

            for (var j = 0; j < row.length; j++) {
                var cell = row[j];
                if (cell !== undefined && cell !== null && cell !== '') {
                    var cellStr = String(cell).replace(/[\s\n*]/g, '').toLowerCase();
                    columns.push({ index: j, name: String(cell).trim(), normalized: cellStr });

                    for (var k = 0; k < keywords.length; k++) {
                        if (cellStr.includes(keywords[k].toLowerCase())) {
                            matchCount++;
                            break;
                        }
                    }
                }
            }

            if (matchCount >= 2) {
                return { headerRowIdx: i, columns: columns };
            }
        }
        return null;
    }

    function isExcluded(colName, targetKey) {
        var excludes = window.MAPPING_EXCLUDES[targetKey];
        if (!excludes) return false;
        for (var i = 0; i < excludes.length; i++) {
            if (colName.includes(excludes[i].toLowerCase())) return true;
        }
        return false;
    }

    function autoMapColumns(columns) {
        var mapping = {};
        var usedColumns = new Set();

        // Pass 1: 정확한 매칭
        Object.entries(window.MAPPING_RULES).forEach(function(entry) {
            var targetKey = entry[0];
            var keywords = entry[1];
            for (var ki = 0; ki < keywords.length; ki++) {
                var keywordLower = keywords[ki].toLowerCase();
                for (var ci = 0; ci < columns.length; ci++) {
                    var col = columns[ci];
                    if (usedColumns.has(col.index)) continue;
                    if (col.normalized === keywordLower && !isExcluded(col.normalized, targetKey)) {
                        mapping[targetKey] = col.index;
                        usedColumns.add(col.index);
                        break;
                    }
                }
                if (mapping[targetKey] !== undefined) break;
            }
        });

        // Pass 2: startsWith 매칭
        Object.entries(window.MAPPING_RULES).forEach(function(entry) {
            var targetKey = entry[0];
            var keywords = entry[1];
            if (mapping[targetKey] !== undefined) return;
            for (var ki = 0; ki < keywords.length; ki++) {
                var keywordLower = keywords[ki].toLowerCase();
                for (var ci = 0; ci < columns.length; ci++) {
                    var col = columns[ci];
                    if (usedColumns.has(col.index)) continue;
                    if (col.normalized.startsWith(keywordLower) && !isExcluded(col.normalized, targetKey)) {
                        mapping[targetKey] = col.index;
                        usedColumns.add(col.index);
                        break;
                    }
                }
                if (mapping[targetKey] !== undefined) break;
            }
        });

        // Pass 3: includes 매칭 (3글자 이상 키워드만)
        Object.entries(window.MAPPING_RULES).forEach(function(entry) {
            var targetKey = entry[0];
            var keywords = entry[1];
            if (mapping[targetKey] !== undefined) return;
            for (var ki = 0; ki < keywords.length; ki++) {
                var keywordLower = keywords[ki].toLowerCase();
                if (keywordLower.length <= 2) continue;
                for (var ci = 0; ci < columns.length; ci++) {
                    var col = columns[ci];
                    if (usedColumns.has(col.index)) continue;
                    if (col.normalized.includes(keywordLower) && !isExcluded(col.normalized, targetKey)) {
                        mapping[targetKey] = col.index;
                        usedColumns.add(col.index);
                        break;
                    }
                }
                if (mapping[targetKey] !== undefined) break;
            }
        });

        // 주소 컬럼 특별 처리
        var addressColumns = columns.filter(function(col) {
            return !usedColumns.has(col.index) &&
                (col.normalized.includes('주소') || col.normalized.includes('address')) &&
                !isExcluded(col.normalized, 'receiverAddr');
        });

        if (mapping['receiverAddr'] === undefined && addressColumns.length === 1) {
            mapping['receiverAddr'] = addressColumns[0].index;
            usedColumns.add(addressColumns[0].index);
        } else if (mapping['receiverAddr'] === undefined && addressColumns.length > 1) {
            var mainAddr = addressColumns.find(function(col) { return !col.normalized.includes('상세'); });
            if (mainAddr) {
                mapping['receiverAddr'] = mainAddr.index;
                usedColumns.add(mainAddr.index);
            }
        }

        // 상세주소 컬럼
        if (mapping['receiverAddrDetail'] === undefined) {
            for (var ci = 0; ci < columns.length; ci++) {
                var col = columns[ci];
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
            var receiverIdx = mapping['receiverName'];
            for (var ci2 = 0; ci2 < columns.length; ci2++) {
                var col2 = columns[ci2];
                if (col2.index === receiverIdx + 1 && !usedColumns.has(col2.index)) {
                    var name = col2.normalized;
                    if (name.includes('휴대') || name.includes('전화') || name.includes('연락') || name.includes('폰')) {
                        mapping['receiverPhone'] = col2.index;
                        usedColumns.add(col2.index);
                        break;
                    }
                }
            }
        }

        // 상품명 폴백
        if (mapping['productName'] === undefined) {
            var giftSetPatterns = ['세트', '호', '선물', '패키지', '구성', '모듬', '종합', '특선', '명품', '프리미엄'];
            for (var ci3 = 0; ci3 < columns.length; ci3++) {
                var col3 = columns[ci3];
                if (usedColumns.has(col3.index)) continue;
                for (var pi = 0; pi < giftSetPatterns.length; pi++) {
                    if (col3.name.includes(giftSetPatterns[pi])) {
                        mapping['productName'] = col3.index;
                        usedColumns.add(col3.index);
                        break;
                    }
                }
                if (mapping['productName'] !== undefined) break;
            }
        }

        return mapping;
    }

    // ==================== 행 변환 ====================
    function convertRow(row, mapping, vendorValue, fileName) {
        var item = { _selected: true, _id: generateId() };

        window.RESULT_COLUMNS.forEach(function(target) {
            if (mapping[target.key] !== undefined) {
                var value = row[mapping[target.key]];
                if (value !== undefined && value !== null) {
                    value = String(value).trim();
                    if (target.key.includes('Phone')) value = formatPhone(value);
                    if (target.key === 'releaseDate') value = formatDateValue(value);
                }
                item[target.key] = value || '';
            } else {
                item[target.key] = '';
            }
        });

        // 상세주소 병합
        if (mapping['receiverAddrDetail'] !== undefined) {
            var detail = row[mapping['receiverAddrDetail']];
            if (detail !== undefined && detail !== null) {
                detail = String(detail).trim();
                if (detail && item.receiverAddr) {
                    item.receiverAddr = item.receiverAddr + ' ' + detail;
                } else if (detail && !item.receiverAddr) {
                    item.receiverAddr = detail;
                }
            }
        }

        // 주문자 -> 발송인 폴백
        if (!item.senderName && mapping['ordererName'] !== undefined) {
            var orderer = row[mapping['ordererName']];
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

    function findMatchingSku(vendor, productCode) {
        if (!vendor || !productCode) return null;
        var productCodeClean = String(productCode).trim();
        var mapping = window.vendorMappings.find(function(m) {
            return m.vendor_name === vendor && String(m.product_code || '').trim() === productCodeClean;
        });
        if (mapping && mapping.sku_product_id) {
            var sku = window.skuProducts.find(function(p) { return p.id === mapping.sku_product_id; });
            return sku || { id: mapping.sku_product_id, sku_name: mapping.sku_name };
        }
        return null;
    }

    // ==================== 변환결과 렌더링 ====================
    function renderConvertResult() {
        var resultCard = document.getElementById('convert-result');
        if (!resultCard) return;

        if (window.convertedData.length === 0) {
            resultCard.style.display = 'none';
            return;
        }

        resultCard.style.display = 'block';

        var matchedCount = window.convertedData.filter(function(item) { return item._skuMatched; }).length;
        var unmatchedCount = window.convertedData.length - matchedCount;
        var selectedCount = window.convertedData.filter(function(item) { return item._selected; }).length;

        document.getElementById('convert-result-summary').innerHTML =
            '전체 ' + window.convertedData.length + '건 | 선택 ' + selectedCount + '건 | ' +
            '<span style="color: #27ae60;">매칭 ' + matchedCount + '</span> | ' +
            '<span style="color: ' + (unmatchedCount > 0 ? '#e74c3c' : '#666') + ';">미매칭 ' + unmatchedCount + '</span>';

        var tableContainer = document.getElementById('convert-result-table');
        tableContainer.innerHTML = buildConvertTable(window.convertedData, window.RESULT_COLUMNS, 'result');
    }

    function buildConvertTable(data, columns, tableType) {
        var html = '<table><thead><tr>';
        html += '<th><input type="checkbox" onchange="toggleAllRows(\'' + tableType + '\', this.checked)" checked></th>';
        html += '<th>#</th>';
        columns.forEach(function(c) { html += '<th>' + escapeHtml(c.name) + '</th>'; });
        html += '</tr></thead><tbody>';

        data.forEach(function(item, idx) {
            html += '<tr>';
            html += '<td><input type="checkbox" ' + (item._selected ? 'checked' : '') + ' onchange="handleRowToggle(\'' + tableType + '\', ' + idx + ')"></td>';
            html += '<td>' + (idx + 1) + '</td>';

            columns.forEach(function(col) {
                var value = escapeHtml(item[col.key] || '');
                if (col.key === 'skuName') {
                    if (!item._skuMatched) {
                        html += '<td style="min-width:150px;"><span style="background:#fff3cd;color:#856404;padding:2px 6px;border-radius:4px;font-size:11px;">미매칭</span>';
                        html += '<div style="font-size:11px;color:#666;margin-top:2px;">' + escapeHtml(item.productName || '') + '</div></td>';
                    } else {
                        html += '<td style="min-width:150px;"><span style="background:#d4edda;color:#155724;padding:2px 6px;border-radius:4px;font-size:11px;">매칭</span> ' + value;
                        html += '<div style="font-size:11px;color:#888;margin-top:2px;">' + escapeHtml(item.productName || '') + '</div></td>';
                    }
                } else if (col.key === 'vendor') {
                    html += '<td><span style="background:#e3f2fd;color:#1565c0;padding:2px 6px;border-radius:4px;font-size:11px;">' + (value || '-') + '</span></td>';
                } else {
                    html += '<td><input type="text" value="' + value + '" style="min-width:' + col.width + ';border:1px solid #eee;padding:4px 6px;border-radius:4px;font-size:12px;" onchange="handleCellChange(\'' + tableType + '\', ' + idx + ', \'' + col.key + '\', this.value)"></td>';
                }
            });
            html += '</tr>';
        });

        html += '</tbody></table>';
        return html;
    }

    // ==================== 행 토글/셀 변경 ====================
    function toggleAllRows(tableType, checked) {
        var data = tableType === 'result' ? window.convertedData : window.confirmedData;
        data.forEach(function(item) { item._selected = checked; });
        if (tableType === 'result') renderConvertResult();
        else renderConfirmed();
    }

    function handleRowToggle(tableType, idx) {
        if (tableType === 'result') {
            window.convertedData[idx]._selected = !window.convertedData[idx]._selected;
            renderConvertResult();
        } else if (tableType === 'confirmed') {
            window.confirmedData[idx]._selected = !window.confirmedData[idx]._selected;
            renderConfirmed();
        }
    }

    function handleCellChange(tableType, idx, key, value) {
        if (tableType === 'result') {
            window.convertedData[idx][key] = value;
        } else if (tableType === 'confirmed') {
            window.confirmedData[idx][key] = value;
        }
    }

    // ==================== 변환확정 ====================
    function confirmConvertedData() {
        var selectedItems = window.convertedData.filter(function(item) { return item._selected; });
        if (selectedItems.length === 0) {
            showToast('변환확정할 항목을 선택해주세요.', 'error');
            return;
        }

        var requiredFields = [
            { key: 'productName', name: '상품명' },
            { key: 'quantity', name: '수량' },
            { key: 'receiverName', name: '수령인' },
            { key: 'receiverPhone', name: '수령인연락처' },
            { key: 'receiverAddr', name: '수령인주소' }
        ];

        var missingItems = [];
        selectedItems.forEach(function(item, idx) {
            var missingFields = [];
            requiredFields.forEach(function(field) {
                var value = item[field.key];
                if (!value || (typeof value === 'string' && value.trim() === '')) {
                    missingFields.push(field.name);
                }
            });
            if (missingFields.length > 0) {
                missingItems.push({ index: idx + 1, fields: missingFields });
            }
        });

        if (missingItems.length > 0) {
            var errorMsg = missingItems.slice(0, 5).map(function(item) {
                return item.index + '번째 항목: ' + item.fields.join(', ') + ' 누락';
            }).join('\n');
            var moreMsg = missingItems.length > 5 ? '\n...외 ' + (missingItems.length - 5) + '건' : '';
            alert('필수값이 누락된 항목이 있습니다.\n\n' + errorMsg + moreMsg + '\n\n상품명, 수량, 수령인, 수령인연락처, 수령인주소는 필수입니다.');
            return;
        }

        var today = new Date();
        var convertedDate = today.getFullYear() + '-' + String(today.getMonth() + 1).padStart(2, '0') + '-' + String(today.getDate()).padStart(2, '0');

        selectedItems.forEach(function(item) {
            var newItem = Object.assign({}, item, { _selected: true, _id: generateId(), convertedDate: convertedDate });
            if (!newItem.productCode && newItem.productName) {
                newItem.productCode = newItem.productName;
            }
            var matchedSku = findMatchingSku(newItem.vendor, newItem.productCode);
            if (matchedSku) {
                newItem.skuName = matchedSku.sku_name || matchedSku.skuName;
                newItem._skuMatched = true;
                newItem._skuProductId = matchedSku.id || matchedSku.sku_product_id;
            } else {
                newItem.skuName = newItem.productName;
                newItem._skuMatched = false;
            }
            window.confirmedData.push(newItem);
        });

        window.convertedData = window.convertedData.filter(function(item) { return !item._selected; });
        renderConvertResult();
        showToast(selectedItems.length + '건이 변환확정 목록에 추가되었습니다.', 'success');

        setTimeout(function() {
            showUserPage('confirmed', window.currentUser, window.currentUserId);
        }, 500);
    }

    // ==================== window에 함수 노출 ====================
    window.handleFiles = handleFiles;
    window.convertOrders = convertOrders;
    window.findHeaderRow = findHeaderRow;
    window.autoMapColumns = autoMapColumns;
    window.convertRow = convertRow;
    window.findMatchingSku = findMatchingSku;
    window.renderConvertResult = renderConvertResult;
    window.buildConvertTable = buildConvertTable;
    window.toggleAllRows = toggleAllRows;
    window.handleRowToggle = handleRowToggle;
    window.handleCellChange = handleCellChange;
    window.confirmConvertedData = confirmConvertedData;

    return {
        handleFiles: handleFiles,
        convertOrders: convertOrders,
        findHeaderRow: findHeaderRow,
        autoMapColumns: autoMapColumns,
        findMatchingSku: findMatchingSku,
        renderConvertResult: renderConvertResult,
        toggleAllRows: toggleAllRows,
        handleRowToggle: handleRowToggle,
        handleCellChange: handleCellChange,
        confirmConvertedData: confirmConvertedData
    };
})();
